-- Enhanced Supabase Database Schema for Intru E-commerce Store
-- Final Build with Flexible Charges, Referral System, and Fraud Protection
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
    images JSONB DEFAULT '[]'::jsonb,
    size_chart_url TEXT,
    is_live BOOLEAN DEFAULT false,
    country_of_origin TEXT DEFAULT 'India',
    material TEXT,
    gsm TEXT,
    fit TEXT,
    color TEXT,
    care_instructions TEXT,
    variants JSONB DEFAULT '[]'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- ORDERS TABLE (Enhanced with abandonment tracking)
-- ============================================
CREATE TABLE IF NOT EXISTS orders (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    order_number TEXT UNIQUE NOT NULL,
    customer_email TEXT NOT NULL,
    customer_name TEXT NOT NULL,
    customer_phone TEXT NOT NULL,
    
    shipping_address JSONB NOT NULL,
    billing_address JSONB,
    
    items JSONB NOT NULL,
    
    -- Enhanced Pricing with Custom Charges
    subtotal DECIMAL(10, 2) NOT NULL,
    discount_amount DECIMAL(10, 2) DEFAULT 0,
    shipping_cost DECIMAL(10, 2) DEFAULT 0,
    custom_charges JSONB DEFAULT '[]'::jsonb, -- [{label: "Handling", amount: 50}]
    tax_amount DECIMAL(10, 2) NOT NULL,
    tax_breakdown JSONB NOT NULL,
    total_amount DECIMAL(10, 2) NOT NULL,
    
    -- Payment
    payment_type TEXT NOT NULL CHECK (payment_type IN ('prepaid', 'cod')),
    payment_status TEXT NOT NULL DEFAULT 'pending' CHECK (payment_status IN ('pending', 'success', 'failed', 'refunded', 'abandoned')),
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
    
    -- Referral System
    referral_code_used TEXT,
    referral_discount DECIMAL(10, 2) DEFAULT 0,
    
    -- Fraud Protection
    requires_unboxing_video BOOLEAN DEFAULT true,
    
    -- Metadata
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    abandoned_at TIMESTAMP WITH TIME ZONE
);

-- ============================================
-- STORE CONFIG TABLE (Replaces old settings)
-- ============================================
CREATE TABLE IF NOT EXISTS store_config (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    
    -- Business Info
    business_name TEXT DEFAULT 'Intru',
    business_email TEXT DEFAULT 'support@intru.in',
    business_phone TEXT DEFAULT '+91XXXXXXXXXX',
    business_address TEXT,
    gstin TEXT,
    business_state TEXT DEFAULT 'Karnataka',
    state_code TEXT DEFAULT '29',
    
    -- Flexible Charge System
    extra_charges_enabled BOOLEAN DEFAULT false,
    custom_charges JSONB DEFAULT '[]'::jsonb, -- [{"label": "Packaging", "amount": 20}, {"label": "Handling", "amount": 30}]
    
    -- Shipping Config
    free_shipping_enabled BOOLEAN DEFAULT true,
    free_shipping_threshold DECIMAL(10, 2) DEFAULT 0,
    default_shipping_cost DECIMAL(10, 2) DEFAULT 0,
    cod_charges DECIMAL(10, 2) DEFAULT 0,
    
    -- Referral System
    is_referral_enabled BOOLEAN DEFAULT false,
    referral_discount_type TEXT DEFAULT 'percentage' CHECK (referral_discount_type IN ('percentage', 'fixed')),
    referral_discount_value DECIMAL(10, 2) DEFAULT 10,
    referral_credit_amount DECIMAL(10, 2) DEFAULT 100,
    min_order_for_referral DECIMAL(10, 2) DEFAULT 500,
    
    -- Fraud Protection
    require_unboxing_video BOOLEAN DEFAULT true,
    abandoned_order_timeout_minutes INTEGER DEFAULT 15,
    
    -- Legal
    grievance_officer_name TEXT,
    grievance_officer_email TEXT,
    grievance_officer_phone TEXT,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insert default store config
INSERT INTO store_config (
    business_name,
    business_email,
    business_phone,
    extra_charges_enabled,
    custom_charges,
    is_referral_enabled,
    require_unboxing_video
) VALUES (
    'Intru',
    'support@intru.in',
    '+91XXXXXXXXXX',
    false,
    '[]'::jsonb,
    false,
    true
) ON CONFLICT DO NOTHING;

-- ============================================
-- BLOCKED PINCODES TABLE (COD Filtering)
-- ============================================
CREATE TABLE IF NOT EXISTS blocked_pincodes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    pincode TEXT UNIQUE NOT NULL,
    reason TEXT,
    blocked_by TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- REFERRAL CODES TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS referral_codes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    code TEXT UNIQUE NOT NULL,
    owner_email TEXT NOT NULL,
    owner_name TEXT,
    uses_count INTEGER DEFAULT 0,
    max_uses INTEGER DEFAULT 100,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    expires_at TIMESTAMP WITH TIME ZONE
);

-- ============================================
-- CUSTOMER WALLETS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS customer_wallets (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    customer_email TEXT UNIQUE NOT NULL,
    customer_name TEXT,
    balance DECIMAL(10, 2) DEFAULT 0,
    total_earned DECIMAL(10, 2) DEFAULT 0,
    total_spent DECIMAL(10, 2) DEFAULT 0,
    referral_code TEXT UNIQUE,
    successful_referrals INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- WALLET TRANSACTIONS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS wallet_transactions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    wallet_id UUID REFERENCES customer_wallets(id),
    transaction_type TEXT NOT NULL CHECK (transaction_type IN ('credit', 'debit')),
    amount DECIMAL(10, 2) NOT NULL,
    description TEXT,
    order_id UUID REFERENCES orders(id),
    referral_code TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- ADMIN USERS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS admin_users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    role TEXT DEFAULT 'manager' CHECK (role IN ('admin', 'manager')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- SETTINGS TABLE (Keep for backward compatibility)
-- ============================================
CREATE TABLE IF NOT EXISTS settings (
    key TEXT PRIMARY KEY,
    value JSONB NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- RLS POLICIES
-- ============================================

ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE store_config ENABLE ROW LEVEL SECURITY;
ALTER TABLE blocked_pincodes ENABLE ROW LEVEL SECURITY;
ALTER TABLE referral_codes ENABLE ROW LEVEL SECURITY;
ALTER TABLE customer_wallets ENABLE ROW LEVEL SECURITY;
ALTER TABLE wallet_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE settings ENABLE ROW LEVEL SECURITY;

-- Products: Public can read live products
CREATE POLICY "Anyone can view live products" ON products
    FOR SELECT USING (is_live = true);

CREATE POLICY "Admins can manage products" ON products
    FOR ALL USING (
        EXISTS (SELECT 1 FROM admin_users WHERE admin_users.id = auth.uid())
    );

-- Orders: Customers can read their own
CREATE POLICY "Customers can view own orders" ON orders
    FOR SELECT USING (customer_email = auth.jwt()->>'email' OR customer_email = current_setting('request.jwt.claims', true)::json->>'email');

CREATE POLICY "Anyone can create orders" ON orders
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Admins can manage orders" ON orders
    FOR ALL USING (
        EXISTS (SELECT 1 FROM admin_users WHERE admin_users.id = auth.uid())
    );

-- Store Config: Public read, admin write
CREATE POLICY "Anyone can view store config" ON store_config
    FOR SELECT USING (true);

CREATE POLICY "Admins can update store config" ON store_config
    FOR ALL USING (
        EXISTS (SELECT 1 FROM admin_users WHERE admin_users.id = auth.uid())
    );

-- Blocked Pincodes: Public read, admin write
CREATE POLICY "Anyone can view blocked pincodes" ON blocked_pincodes
    FOR SELECT USING (true);

CREATE POLICY "Admins can manage blocked pincodes" ON blocked_pincodes
    FOR ALL USING (
        EXISTS (SELECT 1 FROM admin_users WHERE admin_users.id = auth.uid())
    );

-- Referral Codes: Public read active codes
CREATE POLICY "Anyone can view active referral codes" ON referral_codes
    FOR SELECT USING (is_active = true);

CREATE POLICY "Admins can manage referral codes" ON referral_codes
    FOR ALL USING (
        EXISTS (SELECT 1 FROM admin_users WHERE admin_users.id = auth.uid())
    );

-- Customer Wallets: Users can view their own
CREATE POLICY "Customers can view own wallet" ON customer_wallets
    FOR SELECT USING (customer_email = auth.jwt()->>'email' OR customer_email = current_setting('request.jwt.claims', true)::json->>'email');

CREATE POLICY "Anyone can create wallet" ON customer_wallets
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Admins can manage wallets" ON customer_wallets
    FOR ALL USING (
        EXISTS (SELECT 1 FROM admin_users WHERE admin_users.id = auth.uid())
    );

-- Wallet Transactions: Users can view their own
CREATE POLICY "Customers can view own transactions" ON wallet_transactions
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM customer_wallets 
            WHERE customer_wallets.id = wallet_transactions.wallet_id 
            AND customer_wallets.customer_email = auth.jwt()->>'email'
        )
    );

-- Settings: Public read, admin write
CREATE POLICY "Anyone can view settings" ON settings
    FOR SELECT USING (true);

CREATE POLICY "Admins can update settings" ON settings
    FOR ALL USING (
        EXISTS (SELECT 1 FROM admin_users WHERE admin_users.id = auth.uid())
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

CREATE TRIGGER update_orders_updated_at BEFORE UPDATE ON orders
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_store_config_updated_at BEFORE UPDATE ON store_config
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_customer_wallets_updated_at BEFORE UPDATE ON customer_wallets
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Decrement product stock (atomic)
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
    SELECT variants INTO current_variants
    FROM products
    WHERE id = product_id
    FOR UPDATE;
    
    SELECT idx - 1 INTO variant_index
    FROM jsonb_array_elements(current_variants) WITH ORDINALITY AS arr(item, idx)
    WHERE item->>'size' = size_param;
    
    IF variant_index IS NULL THEN
        RETURN FALSE;
    END IF;
    
    current_stock := (current_variants->variant_index->>'stock')::INTEGER;
    
    IF current_stock < quantity THEN
        RETURN FALSE;
    END IF;
    
    updated_variants := jsonb_set(
        current_variants,
        ARRAY[variant_index::TEXT, 'stock'],
        to_jsonb(current_stock - quantity)
    );
    
    UPDATE products
    SET variants = updated_variants
    WHERE id = product_id;
    
    RETURN TRUE;
END;
$$ LANGUAGE plpgsql;

-- Mark abandoned orders (run via cron or scheduled function)
CREATE OR REPLACE FUNCTION mark_abandoned_orders()
RETURNS void AS $$
BEGIN
    UPDATE orders
    SET 
        payment_status = 'abandoned',
        abandoned_at = NOW()
    WHERE 
        payment_status = 'pending'
        AND payment_type = 'prepaid'
        AND created_at < NOW() - INTERVAL '15 minutes'
        AND abandoned_at IS NULL;
END;
$$ LANGUAGE plpgsql;

-- Check if pincode is blocked
CREATE OR REPLACE FUNCTION is_pincode_blocked(pincode_param TEXT)
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM blocked_pincodes 
        WHERE pincode = pincode_param
    );
END;
$$ LANGUAGE plpgsql;

-- Generate unique referral code
CREATE OR REPLACE FUNCTION generate_referral_code()
RETURNS TEXT AS $$
DECLARE
    new_code TEXT;
    code_exists BOOLEAN;
BEGIN
    LOOP
        new_code := 'INTRU' || UPPER(SUBSTRING(MD5(RANDOM()::TEXT) FROM 1 FOR 6));
        
        SELECT EXISTS (
            SELECT 1 FROM referral_codes WHERE code = new_code
        ) INTO code_exists;
        
        EXIT WHEN NOT code_exists;
    END LOOP;
    
    RETURN new_code;
END;
$$ LANGUAGE plpgsql;

-- Apply referral discount
CREATE OR REPLACE FUNCTION apply_referral_discount(
    order_id_param UUID,
    referral_code_param TEXT,
    order_amount DECIMAL
)
RETURNS JSONB AS $$
DECLARE
    config_record RECORD;
    referral_record RECORD;
    discount_amount DECIMAL;
    result JSONB;
BEGIN
    -- Get store config
    SELECT * INTO config_record FROM store_config LIMIT 1;
    
    IF NOT config_record.is_referral_enabled THEN
        RETURN jsonb_build_object('success', false, 'error', 'Referral system is disabled');
    END IF;
    
    -- Check if order meets minimum
    IF order_amount < config_record.min_order_for_referral THEN
        RETURN jsonb_build_object('success', false, 'error', 'Order amount too low for referral');
    END IF;
    
    -- Get referral code
    SELECT * INTO referral_record 
    FROM referral_codes 
    WHERE code = referral_code_param 
    AND is_active = true 
    AND (expires_at IS NULL OR expires_at > NOW())
    AND uses_count < max_uses;
    
    IF referral_record IS NULL THEN
        RETURN jsonb_build_object('success', false, 'error', 'Invalid or expired referral code');
    END IF;
    
    -- Calculate discount
    IF config_record.referral_discount_type = 'percentage' THEN
        discount_amount := (order_amount * config_record.referral_discount_value / 100);
    ELSE
        discount_amount := config_record.referral_discount_value;
    END IF;
    
    -- Update referral code usage
    UPDATE referral_codes
    SET uses_count = uses_count + 1
    WHERE code = referral_code_param;
    
    RETURN jsonb_build_object(
        'success', true, 
        'discount_amount', discount_amount,
        'referral_owner', referral_record.owner_email
    );
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- INDEXES
-- ============================================
CREATE INDEX idx_products_is_live ON products(is_live);
CREATE INDEX idx_products_created_at ON products(created_at DESC);
CREATE INDEX idx_orders_customer_email ON orders(customer_email);
CREATE INDEX idx_orders_order_number ON orders(order_number);
CREATE INDEX idx_orders_payment_status ON orders(payment_status);
CREATE INDEX idx_orders_created_at ON orders(created_at DESC);
CREATE INDEX idx_blocked_pincodes_pincode ON blocked_pincodes(pincode);
CREATE INDEX idx_referral_codes_code ON referral_codes(code);
CREATE INDEX idx_customer_wallets_email ON customer_wallets(customer_email);

COMMENT ON TABLE store_config IS 'Centralized store configuration with flexible charge system';
COMMENT ON TABLE blocked_pincodes IS 'Pincodes where COD is disabled';
COMMENT ON TABLE referral_codes IS 'Customer referral codes for discounts';
COMMENT ON TABLE customer_wallets IS 'Customer wallet balances and referral tracking';
COMMENT ON TABLE wallet_transactions IS 'Wallet credit/debit transaction history';
