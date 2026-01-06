# INTRU E-Commerce Platform - Complete System Documentation

**Version:** 3.0  
**Status:** Production Ready  
**Architecture:** Next.js 15 + Cloudflare Workers Edge Runtime  
**Last Updated:** December 25, 2025

---

## 📋 Table of Contents

1. [Quick Start](#quick-start)
2. [System Architecture](#system-architecture)
3. [Features](#features)
4. [Admin Panel Guide](#admin-panel-guide)
5. [Customer Experience](#customer-experience)
6. [API Reference](#api-reference)
7. [Database Schema](#database-schema)
8. [Deployment](#deployment)
9. [Development](#development)
10. [Troubleshooting](#troubleshooting)

---

## 🚀 Quick Start

### For Administrators

1. **Access Admin Panel:** Navigate to `https://intru-shop.pages.dev/admin/login`
2. **Login:** Use your admin credentials
3. **Manage Products:** Add, edit, or delete products from the dashboard
4. **View Orders:** Monitor orders and track fulfillment
5. **Configure Settings:** Update store settings and preferences

### For Developers

```bash
# Clone repository
git clone https://github.com/x-shindee/intru-shop.git
cd intru-shop

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env.local
# Edit .env.local with your credentials

# Run development server
npm run dev

# Build for production
npm run build

# Deploy to Cloudflare Pages
npm run deploy
```

---

## 🏗️ System Architecture

### Technology Stack

**Frontend:**
- Next.js 15.1.3 (React 18.3.1)
- TailwindCSS for styling
- TypeScript for type safety
- Radix UI components

**Backend:**
- Cloudflare Workers (Edge Runtime)
- Next.js API Routes (Edge Functions)
- Web Crypto API for security

**Database & Storage:**
- Supabase PostgreSQL (Primary database)
- Supabase Storage (Image hosting)
- Row-Level Security (RLS) enabled

**Payment & Shipping:**
- Razorpay (Prepaid payments)
- COD (Cash on Delivery)
- Shiprocket (Shipping integration)

### Edge Runtime Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                     Client Browser                          │
│            (Customer or Admin Interface)                    │
└──────────────────┬──────────────────────────────────────────┘
                   │
                   ▼
┌─────────────────────────────────────────────────────────────┐
│              Cloudflare Workers Edge                        │
│  ┌───────────────────────────────────────────────────────┐  │
│  │  Next.js 15 API Routes (Edge Runtime)                 │  │
│  │  - /api/admin/* (Product/Auth management)             │  │
│  │  - /api/orders/* (Order creation/verification)        │  │
│  │  - /api/config/* (Settings/pincode check)            │  │
│  │  - /api/webhooks/* (Payment webhooks)                 │  │
│  └───────────────────────────────────────────────────────┘  │
└──────────────────┬──────────────────────────────────────────┘
                   │
                   ▼
┌─────────────────────────────────────────────────────────────┐
│              External Services                              │
│                                                             │
│  ┌─────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │  Supabase   │  │  Razorpay    │  │  Shiprocket  │      │
│  │  PostgreSQL │  │  Payments    │  │  Shipping    │      │
│  └─────────────┘  └──────────────┘  └──────────────┘      │
└─────────────────────────────────────────────────────────────┘
```

### Key Design Decisions

1. **Edge-First Architecture:** All API routes run on Cloudflare's edge network for low latency globally
2. **No Node.js Dependencies:** Pure Web APIs and Edge Runtime compatible code
3. **Serverless:** Zero server maintenance, auto-scaling
4. **Security:** Web Crypto API for signatures, HMAC verification, RLS on database
5. **Performance:** Static generation for product pages, ISR for dynamic content

---

## ✨ Features

### Customer Features

✅ **Product Browsing**
- Grid view of products
- Product detail pages
- High-quality images
- Size variants
- Sale badges

✅ **Shopping Cart**
- Add/remove items
- Quantity management
- Size selection
- Price calculation with GST

✅ **Checkout**
- Prepaid payment (Razorpay)
- Cash on Delivery (COD)
- Pincode validation
- Referral code support
- Customer wallet integration

✅ **Order Tracking**
- Order confirmation
- Payment verification
- COD verification
- Shipping updates

### Admin Features

✅ **Authentication**
- Secure login system
- Session management
- Role-based access

✅ **Product Management**
- Add new products
- Edit existing products
- Delete products
- Toggle live/hidden status
- Manage variants and stock
- Image URL management

✅ **Order Management**
- View all orders
- Filter by status
- Update order status
- Process refunds
- Track shipping

✅ **Dashboard**
- Sales analytics
- Product statistics
- Pending orders
- Revenue tracking

✅ **Settings**
- Store configuration
- Blocked pincodes
- Referral system
- Tax settings

---

## 🔐 Admin Panel Guide

### Accessing the Admin Panel

1. Navigate to `/admin/login`
2. Enter your admin email and password
3. Click "Sign In"

### Managing Products

#### Adding a New Product

1. Go to **Admin → Products**
2. Click **"+ Add Product"**
3. Fill in the required fields:
   - **Title:** Product name (required)
   - **Description:** Detailed product information
   - **Price:** Selling price in INR (required)
   - **Compare at Price:** Original price (for showing discounts)
   - **Total Stock:** Overall inventory count (required)
   - **HSN Code:** Tax classification code (required)
   - **Image URL:** Product image link
   - **Material:** Fabric/material type
   - **Fit:** Regular, Slim, Oversized, etc.
   - **Care Instructions:** Washing/care guidelines
4. Set **Size Variants** stock for S, M, L, XL
5. Check **"Make product live immediately"** to publish
6. Click **"Create Product"**

#### Editing a Product

1. Go to **Admin → Products**
2. Click **"Edit"** next to the product
3. Update any fields
4. Click **"Update Product"**

#### Deleting a Product

1. Go to **Admin → Products → Edit → [Product]**
2. Click **"Delete Product"** (top right)
3. Confirm deletion

### Managing Orders

1. Go to **Admin → Orders**
2. View order list with:
   - Order number
   - Customer details
   - Payment status
   - Shipping status
   - Total amount
3. Click on an order to view details
4. Update order status as needed

### Dashboard Overview

The dashboard displays:
- **Total Products** (and live count)
- **Total Orders** (and pending count)
- **Total Revenue** (from successful payments)
- **Ready to Ship** (orders waiting for shipment)
- **Recent Orders** (last 5 orders)

---

## 🛍️ Customer Experience

### Browsing Products

1. Visit homepage: `https://intru-shop.pages.dev`
2. Browse product grid
3. Click on a product for details

### Adding to Cart

1. Select product
2. Choose size
3. Click "Add to Cart"
4. View cart icon updates

### Checkout Process

1. Go to Cart
2. Review items
3. Click "Proceed to Checkout"
4. Fill in details:
   - Name, Email, Phone
   - Shipping address
   - Pincode validation
5. Choose payment method:
   - **Prepaid:** Razorpay payment gateway
   - **COD:** Cash on delivery (if available for pincode)
6. Apply referral code (optional)
7. Complete order

### Payment Methods

**Prepaid (Razorpay):**
- Credit/Debit cards
- Net banking
- UPI
- Wallets
- Instant payment confirmation

**Cash on Delivery:**
- Pay at delivery
- Verification required
- Subject to pincode availability

---

## 📡 API Reference

### Admin APIs

#### Authentication

**POST `/api/admin/auth/login`**
- Login to admin panel
- Body: `{ email, password }`
- Returns: `{ success, token, admin }`

**POST `/api/admin/auth/verify`**
- Verify admin session
- Body: `{ token, email }`
- Returns: `{ success, valid }`

#### Product Management

**POST `/api/admin/products`**
- Create new product
- Body: Product object
- Returns: `{ success, product }`

**GET `/api/admin/products/[id]`**
- Get product details
- Returns: `{ success, product }`

**PATCH `/api/admin/products/[id]`**
- Update product
- Body: Updated fields
- Returns: `{ success, product }`

**DELETE `/api/admin/products/[id]`**
- Delete product
- Returns: `{ success }`

### Customer APIs

#### Orders

**POST `/api/orders/create`**
- Create new order
- Body: Order details
- Returns: `{ success, order_id, razorpay_order_id (if prepaid) }`

**POST `/api/orders/verify-payment`**
- Verify Razorpay payment
- Body: `{ razorpay_order_id, razorpay_payment_id, razorpay_signature, order_id }`
- Returns: `{ success, order }`

**POST `/api/orders/verify-cod`**
- Verify COD order
- Body: `{ order_id, verification_code }`
- Returns: `{ success, order }`

#### Configuration

**POST `/api/config/check-pincode`**
- Check pincode availability
- Body: `{ pincode }`
- Returns: `{ success, available, blocked, cod_available }`

**GET `/api/config/store`**
- Get store configuration
- Returns: `{ success, config }`

#### Webhooks

**POST `/api/webhooks/razorpay`**
- Razorpay payment webhook
- Headers: `X-Razorpay-Signature`
- Body: Webhook payload
- Returns: `{ success }`

---

## 💾 Database Schema

### Products Table

```sql
CREATE TABLE products (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  description TEXT,
  price DECIMAL(10,2) NOT NULL,
  compare_at_price DECIMAL(10,2),
  stock INTEGER NOT NULL DEFAULT 0,
  hsn_code VARCHAR(8) NOT NULL,
  image_url TEXT,
  images JSONB DEFAULT '[]',
  variants JSONB DEFAULT '[]',
  material TEXT,
  fit TEXT,
  care_instructions TEXT,
  country_of_origin VARCHAR(50) DEFAULT 'India',
  is_live BOOLEAN DEFAULT false,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

### Orders Table

```sql
CREATE TABLE orders (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_number TEXT UNIQUE NOT NULL,
  customer_email TEXT NOT NULL,
  customer_name TEXT NOT NULL,
  customer_phone TEXT NOT NULL,
  shipping_address JSONB NOT NULL,
  items JSONB NOT NULL,
  subtotal DECIMAL(10,2) NOT NULL,
  shipping_cost DECIMAL(10,2) DEFAULT 0,
  tax_amount DECIMAL(10,2) NOT NULL,
  tax_breakdown JSONB,
  total_amount DECIMAL(10,2) NOT NULL,
  payment_type VARCHAR(20) NOT NULL,
  payment_status VARCHAR(20) DEFAULT 'pending',
  shipping_status VARCHAR(20) DEFAULT 'pending',
  verification_status VARCHAR(20) DEFAULT 'pending',
  razorpay_order_id TEXT,
  razorpay_payment_id TEXT,
  razorpay_signature TEXT,
  verification_code TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

### Admin Users Table

```sql
CREATE TABLE admin_users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  role VARCHAR(20) DEFAULT 'admin',
  is_active BOOLEAN DEFAULT true,
  last_login_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW()
);
```

---

## 🚀 Deployment

### Prerequisites

1. **GitHub Account** with repository access
2. **Cloudflare Account** with Pages enabled
3. **Supabase Project** set up
4. **Razorpay Account** (test/live keys)
5. **Shiprocket Account** (optional)

### Environment Variables

Configure these in Cloudflare Pages:

```bash
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# Razorpay
NEXT_PUBLIC_RAZORPAY_KEY_ID=rzp_test_or_live_key
RAZORPAY_KEY_SECRET=your_secret
RAZORPAY_WEBHOOK_SECRET=your_webhook_secret

# Admin Auth
ADMIN_PASSWORD_SECRET=your_admin_password_secret
ADMIN_SESSION_SECRET=your_session_secret

# Shiprocket
SHIPROCKET_EMAIL=your_email
SHIPROCKET_PASSWORD=your_password

# App
NEXT_PUBLIC_APP_URL=https://intru-shop.pages.dev
WHATSAPP_BUSINESS_NUMBER=919999999999
```

### Deployment Steps

1. **Connect Repository to Cloudflare:**
   - Go to Cloudflare Dashboard
   - Pages → Create a project
   - Connect GitHub repository

2. **Configure Build:**
   - Build command: `npm run pages:build`
   - Build output directory: `.vercel/output/static`
   - Root directory: `/`

3. **Set Environment Variables:**
   - Add all variables from above
   - Set for both Production and Preview

4. **Enable nodejs_compat:**
   - Settings → Functions
   - Compatibility flags → Add `nodejs_compat`

5. **Deploy:**
   - Push to main branch
   - Cloudflare auto-deploys

### Database Setup

1. **Run Schema:**
   ```bash
   # Upload supabase-schema-v2.sql to Supabase SQL Editor
   # Execute the schema
   ```

2. **Enable RLS:**
   - Ensure Row Level Security is enabled
   - Configure policies for each table

3. **Create Storage Bucket:**
   - Name: `products`
   - Make public for product images

4. **Create First Admin User:**
   ```sql
   INSERT INTO admin_users (email, password_hash, role)
   VALUES (
     'admin@example.com',
     'your_hashed_password',
     'admin'
   );
   ```

---

## 💻 Development

### Local Development

```bash
# Install dependencies
npm install

# Run dev server
npm run dev

# Run with Cloudflare Workers
npm run preview
```

### Building

```bash
# Next.js build
npm run build

# Cloudflare Pages build
npm run pages:build
```

### Testing

```bash
# Test API endpoints
curl http://localhost:3000/api/config/store

# Test with Cloudflare dev environment
npx wrangler pages dev .vercel/output/static
```

---

## 🔧 Troubleshooting

### Common Issues

**1. Products Not Showing on Homepage**
- Check environment variables are set
- Verify Supabase connection
- Ensure products have `is_live = true`
- Check browser console for errors

**2. Admin Login Not Working**
- Verify admin user exists in database
- Check password hash is correct
- Ensure environment secrets are configured

**3. Payment Failing**
- Verify Razorpay keys are correct
- Check webhook signature verification
- Review Razorpay dashboard for errors

**4. Build Failing**
- Check Node.js version (22.x)
- Clear node_modules and reinstall
- Verify all dependencies are compatible
- Check Cloudflare build logs

**5. Images Not Loading**
- Verify Supabase storage bucket is public
- Check image URLs are accessible
- Ensure CORS is configured

### Getting Help

- Check documentation in `/docs` folder
- Review archived guides in `/docs/archive`
- Check Cloudflare Pages logs
- Review Supabase logs

---

## 📚 Additional Resources

- **Repository:** https://github.com/x-shindee/intru-shop
- **Live Site:** https://intru-shop.pages.dev
- **Cloudflare Docs:** https://developers.cloudflare.com/pages
- **Next.js Docs:** https://nextjs.org/docs
- **Supabase Docs:** https://supabase.com/docs
- **Razorpay API:** https://razorpay.com/docs/api

---

## 🎯 What's Next?

### Planned Features

- [ ] Image upload from admin panel (Supabase Storage integration)
- [ ] Bulk product import/export
- [ ] Advanced analytics dashboard
- [ ] Customer accounts and order history
- [ ] Product reviews and ratings
- [ ] Email notifications
- [ ] Discount codes system
- [ ] Multi-currency support
- [ ] Inventory alerts

---

## 📝 Changelog

### Version 3.0 (Current)
- ✅ Admin authentication system
- ✅ Product add/edit/delete functionality
- ✅ Enhanced UI/UX
- ✅ Edge runtime optimization
- ✅ Complete documentation

### Version 2.0
- ✅ Cloudflare Workers migration
- ✅ Web Crypto API integration
- ✅ Edge-compatible Razorpay client
- ✅ Remove Node.js dependencies

### Version 1.0
- ✅ Initial release
- ✅ Basic e-commerce functionality
- ✅ Razorpay integration
- ✅ COD support

---

**Built with ❤️ by the Intru team**
