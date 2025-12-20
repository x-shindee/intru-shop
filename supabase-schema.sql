-- Supabase Database Schema for Intru E-commerce Store
-- Run this in your Supabase SQL Editor

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- PRODUCTS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS products (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title TEXT NOT NULL,
    description TEXT,
    price DECIMAL(10, 2) NOT NULL,
    compare_at_price DECIMAL(10, 2),
    stock INTEGER NOT NULL DEFAULT 0,
    hsn_code TEXT NOT NULL,
    image_url TEXT,
    images JSONB DEFAULT '[]'::jsonb, -- Array of image URLs
    size_chart_url TEXT,
    is_live BOOLEAN DEFAULT false,
    country_of_origin TEXT DEFAULT 'India',
    material TEXT,
    gsm TEXT,
    fit TEXT,
    color TEXT,
    care_instructions TEXT,
    variants JSONB DEFAULT '[]'::jsonb, -- [{size: "S", stock: 10}, {size: "M", stock: 15}]
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- ORDERS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS orders (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    order_number TEXT UNIQUE NOT NULL,
    customer_email TEXT NOT NULL,
    customer_name TEXT NOT NULL,
    customer_phone TEXT NOT NULL,
    
    -- Address stored as JSONB for flexibility
    shipping_address JSONB NOT NULL,
    billing_address JSONB,
    
    -- Order Items (cart snapshot)
    items JSONB NOT NULL,
    
    -- Pricing
    subtotal DECIMAL(10, 2) NOT NULL,
    shipping_cost DECIMAL(10, 2) DEFAULT 0,
    tax_amount DECIMAL(10, 2) NOT NULL,
    tax_breakdown JSONB NOT NULL, -- {cgst: 9, sgst: 9} or {igst: 18}
    total_amount DECIMAL(10, 2) NOT NULL,
    
    -- Payment
    payment_type TEXT NOT NULL CHECK (payment_type IN ('prepaid', 'cod')),
    payment_status TEXT NOT NULL DEFAULT 'pending' CHECK (payment_status IN ('pending', 'success', 'failed', 'refunded')),
    razorpay_order_id TEXT,
    razorpay_payment_id TEXT,
    razorpay_signature TEXT,
    
    -- Shipping
    shipping_status TEXT NOT NULL DEFAULT 'pending' CHECK (shipping_status IN ('pending', 'processing', 'ready_to_ship', 'shipped', 'delivered', 'cancelled')),
    shiprocket_order_id TEXT,
    shiprocket_shipment_id TEXT,
    courier_name TEXT,
    tracking_number TEXT,
    
    -- COD Verification
    verification_status TEXT DEFAULT 'pending' CHECK (verification_status IN ('pending', 'verified', 'cancelled')),
    verified_at TIMESTAMP WITH TIME ZONE,
    
    -- Metadata
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- ADMIN USERS TABLE (Simple auth for dashboard)
-- ============================================
CREATE TABLE IF NOT EXISTS admin_users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    role TEXT DEFAULT 'manager' CHECK (role IN ('admin', 'manager')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- SETTINGS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS settings (
    key TEXT PRIMARY KEY,
    value JSONB NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insert default settings
INSERT INTO settings (key, value) VALUES
('business_info', '{
    "name": "Intru",
    "email": "support@intru.in",
    "phone": "+91XXXXXXXXXX",
    "address": "Your Business Address",
    "gstin": "YOUR_GSTIN_NUMBER",
    "state": "Karnataka",
    "state_code": "29"
}'::jsonb),
('shipping_config', '{
    "free_shipping_threshold": 0,
    "default_shipping_cost": 0,
    "cod_charges": 0
}'::jsonb),
('grievance_officer', '{
    "name": "Officer Name",
    "email": "grievance@intru.in",
    "phone": "+91XXXXXXXXXX"
}'::jsonb)
ON CONFLICT (key) DO NOTHING;

-- ============================================
-- RLS (Row Level Security) POLICIES
-- ============================================

-- Enable RLS on all tables
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE settings ENABLE ROW LEVEL SECURITY;

-- Products: Public can read live products, admins can do everything
CREATE POLICY "Anyone can view live products" ON products
    FOR SELECT USING (is_live = true);

CREATE POLICY "Admins can do anything with products" ON products
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM admin_users
            WHERE admin_users.id = auth.uid()
        )
    );

-- Orders: Customers can read their own orders, admins can do everything
CREATE POLICY "Customers can view their own orders" ON orders
    FOR SELECT USING (customer_email = auth.jwt()->>'email');

CREATE POLICY "Anyone can create orders" ON orders
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Admins can do anything with orders" ON orders
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM admin_users
            WHERE admin_users.id = auth.uid()
        )
    );

-- Settings: Public can read, admins can update
CREATE POLICY "Anyone can view settings" ON settings
    FOR SELECT USING (true);

CREATE POLICY "Admins can update settings" ON settings
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM admin_users
            WHERE admin_users.id = auth.uid()
        )
    );

-- ============================================
-- FUNCTIONS
-- ============================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers for updated_at
CREATE TRIGGER update_products_updated_at BEFORE UPDATE ON products
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_orders_updated_at BEFORE UPDATE ON orders
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Function to decrement stock (prevents overselling)
CREATE OR REPLACE FUNCTION decrement_product_stock(
    product_id UUID,
    size_param TEXT,
    quantity INTEGER
)
RETURNS BOOLEAN AS $$
DECLARE
    current_variants JSONB;
    variant_index INTEGER;
    current_stock INTEGER;
    updated_variants JSONB;
BEGIN
    -- Lock the row for update
    SELECT variants INTO current_variants
    FROM products
    WHERE id = product_id
    FOR UPDATE;
    
    -- Find the variant index
    SELECT idx - 1 INTO variant_index
    FROM jsonb_array_elements(current_variants) WITH ORDINALITY AS arr(item, idx)
    WHERE item->>'size' = size_param;
    
    IF variant_index IS NULL THEN
        RETURN FALSE;
    END IF;
    
    -- Get current stock
    current_stock := (current_variants->variant_index->>'stock')::INTEGER;
    
    -- Check if enough stock
    IF current_stock < quantity THEN
        RETURN FALSE;
    END IF;
    
    -- Update stock
    updated_variants := jsonb_set(
        current_variants,
        ARRAY[variant_index::TEXT, 'stock'],
        to_jsonb(current_stock - quantity)
    );
    
    -- Update the product
    UPDATE products
    SET variants = updated_variants
    WHERE id = product_id;
    
    RETURN TRUE;
END;
$$ LANGUAGE plpgsql;

-- Function to generate order number
CREATE OR REPLACE FUNCTION generate_order_number()
RETURNS TEXT AS $$
DECLARE
    new_number TEXT;
BEGIN
    new_number := 'INTRU-' || TO_CHAR(NOW(), 'YYYYMMDD') || '-' || LPAD(FLOOR(RANDOM() * 10000)::TEXT, 4, '0');
    RETURN new_number;
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- INDEXES for Performance
-- ============================================
CREATE INDEX idx_products_is_live ON products(is_live);
CREATE INDEX idx_products_created_at ON products(created_at DESC);
CREATE INDEX idx_orders_customer_email ON orders(customer_email);
CREATE INDEX idx_orders_order_number ON orders(order_number);
CREATE INDEX idx_orders_payment_status ON orders(payment_status);
CREATE INDEX idx_orders_shipping_status ON orders(shipping_status);
CREATE INDEX idx_orders_created_at ON orders(created_at DESC);

-- ============================================
-- SAMPLE DATA (Optional - for testing)
-- ============================================
-- Sample product
INSERT INTO products (
    title, 
    description, 
    price, 
    compare_at_price, 
    stock, 
    hsn_code, 
    is_live,
    material,
    gsm,
    fit,
    color,
    variants
) VALUES (
    'Doodles T-Shirt',
    'Inspired by all the little doodles that bring warmth and joy, this tee is a wearable burst of happy energy—cute, comfy, and guaranteed to brighten your day.',
    999.00,
    1499.00,
    50,
    '6109',
    true,
    'Premium French Terry',
    '240',
    'Oversized',
    'White',
    '[
        {"size": "XS", "stock": 10},
        {"size": "S", "stock": 15},
        {"size": "M", "stock": 15},
        {"size": "L", "stock": 10}
    ]'::jsonb
);

COMMENT ON TABLE products IS 'Stores all product information';
COMMENT ON TABLE orders IS 'Stores all order information with complete order lifecycle';
COMMENT ON TABLE admin_users IS 'Admin users for dashboard access';
COMMENT ON TABLE settings IS 'Application settings and configuration';
