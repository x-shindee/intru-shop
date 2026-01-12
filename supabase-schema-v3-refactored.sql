-- ============================================
-- Intru E-Commerce - Refactored Schema V3
-- Zero-cost production with Supabase only
-- ============================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- PRODUCTS TABLE (Simplified for e-commerce)
-- ============================================
CREATE TABLE IF NOT EXISTS products (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title TEXT NOT NULL,
    description TEXT,
    price DECIMAL(10, 2) NOT NULL,
    stock INTEGER NOT NULL DEFAULT 0,
    images JSONB DEFAULT '[]'::jsonb, -- Array of image URLs
    category TEXT DEFAULT 'general', -- t-shirts, shirts, hoodies, etc.
    is_live BOOLEAN DEFAULT false,
    
    -- Product Details
    hsn_code TEXT,
    material TEXT,
    fit TEXT,
    care_instructions TEXT,
    variants JSONB DEFAULT '[]'::jsonb, -- [{size: 'S', stock: 10, price: 999}]
    
    -- Metadata
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- CONTENT PAGES TABLE (NEW - for CMS)
-- ============================================
CREATE TABLE IF NOT EXISTS content_pages (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    slug TEXT UNIQUE NOT NULL, -- about-us, privacy-policy, shipping-policy
    title TEXT NOT NULL,
    content TEXT NOT NULL, -- HTML/Markdown content
    is_published BOOLEAN DEFAULT false,
    
    -- Metadata
    meta_description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insert default content pages
INSERT INTO content_pages (slug, title, content, is_published) VALUES
('about-us', 'About Us', '<h1>About Intru</h1><p>Welcome to Intru - Indian Streetwear Brand</p>', true),
('privacy-policy', 'Privacy Policy', '<h1>Privacy Policy</h1><p>Your privacy is important to us.</p>', true),
('shipping-policy', 'Shipping Policy', '<h1>Shipping Policy</h1><p>We offer free shipping on prepaid orders.</p>', true),
('return-policy', 'Return Policy', '<h1>Return Policy</h1><p>30-day return policy on all products.</p>', true)
ON CONFLICT (slug) DO NOTHING;

-- ============================================
-- ORDERS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS orders (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    order_number TEXT UNIQUE NOT NULL,
    customer_email TEXT NOT NULL,
    customer_name TEXT NOT NULL,
    customer_phone TEXT NOT NULL,
    
    shipping_address JSONB NOT NULL,
    items JSONB NOT NULL,
    
    subtotal DECIMAL(10, 2) NOT NULL,
    shipping_cost DECIMAL(10, 2) DEFAULT 0,
    tax_amount DECIMAL(10, 2) NOT NULL,
    total_amount DECIMAL(10, 2) NOT NULL,
    
    payment_type TEXT NOT NULL CHECK (payment_type IN ('prepaid', 'cod')),
    payment_status TEXT NOT NULL DEFAULT 'pending',
    razorpay_order_id TEXT,
    razorpay_payment_id TEXT,
    razorpay_signature TEXT,
    
    shipping_status TEXT NOT NULL DEFAULT 'pending',
    verification_status TEXT DEFAULT 'pending',
    
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- STORE CONFIG TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS store_config (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    business_name TEXT DEFAULT 'Intru',
    business_email TEXT DEFAULT 'support@intru.in',
    business_phone TEXT DEFAULT '+91XXXXXXXXXX',
    business_address TEXT,
    
    free_shipping_enabled BOOLEAN DEFAULT true,
    free_shipping_threshold DECIMAL(10, 2) DEFAULT 0,
    default_shipping_cost DECIMAL(10, 2) DEFAULT 0,
    cod_charges DECIMAL(10, 2) DEFAULT 0,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insert default config
INSERT INTO store_config (business_name, free_shipping_enabled) 
VALUES ('Intru', true) 
ON CONFLICT DO NOTHING;

-- ============================================
-- BLOCKED PINCODES TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS blocked_pincodes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    pincode TEXT UNIQUE NOT NULL,
    reason TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- RLS POLICIES (Service Role Access)
-- ============================================

ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE content_pages ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE store_config ENABLE ROW LEVEL SECURITY;
ALTER TABLE blocked_pincodes ENABLE ROW LEVEL SECURITY;

-- Products: Public can SELECT live products, Service role can do ALL
CREATE POLICY "Public can view live products" ON products
    FOR SELECT USING (is_live = true);

CREATE POLICY "Service role can manage all products" ON products
    FOR ALL USING (
        current_setting('request.jwt.claims', true)::json->>'role' = 'service_role'
        OR auth.uid() IS NOT NULL
    );

-- Content Pages: Public can SELECT published pages, Service role can do ALL
CREATE POLICY "Public can view published pages" ON content_pages
    FOR SELECT USING (is_published = true);

CREATE POLICY "Service role can manage all pages" ON content_pages
    FOR ALL USING (
        current_setting('request.jwt.claims', true)::json->>'role' = 'service_role'
        OR auth.uid() IS NOT NULL
    );

-- Orders: Anyone can INSERT, Service role can manage ALL
CREATE POLICY "Anyone can create orders" ON orders
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Service role can manage orders" ON orders
    FOR ALL USING (
        current_setting('request.jwt.claims', true)::json->>'role' = 'service_role'
        OR auth.uid() IS NOT NULL
    );

-- Store Config: Public can SELECT, Service role can UPDATE
CREATE POLICY "Public can view store config" ON store_config
    FOR SELECT USING (true);

CREATE POLICY "Service role can update config" ON store_config
    FOR ALL USING (
        current_setting('request.jwt.claims', true)::json->>'role' = 'service_role'
        OR auth.uid() IS NOT NULL
    );

-- Blocked Pincodes: Public can SELECT, Service role can manage
CREATE POLICY "Public can check blocked pincodes" ON blocked_pincodes
    FOR SELECT USING (true);

CREATE POLICY "Service role can manage pincodes" ON blocked_pincodes
    FOR ALL USING (
        current_setting('request.jwt.claims', true)::json->>'role' = 'service_role'
        OR auth.uid() IS NOT NULL
    );

-- ============================================
-- FUNCTIONS
-- ============================================

-- Update timestamp trigger
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_products_updated_at BEFORE UPDATE ON products
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_content_pages_updated_at BEFORE UPDATE ON content_pages
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_orders_updated_at BEFORE UPDATE ON orders
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_store_config_updated_at BEFORE UPDATE ON store_config
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- INDEXES
-- ============================================
CREATE INDEX IF NOT EXISTS idx_products_is_live ON products(is_live);
CREATE INDEX IF NOT EXISTS idx_products_category ON products(category);
CREATE INDEX IF NOT EXISTS idx_products_created_at ON products(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_content_pages_slug ON content_pages(slug);
CREATE INDEX IF NOT EXISTS idx_content_pages_is_published ON content_pages(is_published);
CREATE INDEX IF NOT EXISTS idx_orders_customer_email ON orders(customer_email);
CREATE INDEX IF NOT EXISTS idx_orders_order_number ON orders(order_number);
CREATE INDEX IF NOT EXISTS idx_orders_created_at ON orders(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_blocked_pincodes_pincode ON blocked_pincodes(pincode);

-- ============================================
-- COMMENTS
-- ============================================
COMMENT ON TABLE products IS 'Main products catalog with variants and images';
COMMENT ON TABLE content_pages IS 'Dynamic CMS pages (About Us, Privacy Policy, etc.)';
COMMENT ON TABLE orders IS 'Customer orders with payment and shipping tracking';
COMMENT ON TABLE store_config IS 'Global store configuration';
COMMENT ON TABLE blocked_pincodes IS 'Pincodes where COD is disabled';
