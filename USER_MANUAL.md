# 📖 INTRU E-COMMERCE - USER MANUAL

**Production URL**: https://intru-shop.pages.dev  
**Admin Panel**: https://intru-shop.pages.dev/admin  
**Version**: 2.0  
**Last Updated**: 2026-01-06  

---

## 🎯 TABLE OF CONTENTS

1. [Quick Start](#quick-start)
2. [Website Overview](#website-overview)
3. [Admin Panel Guide](#admin-panel-guide)
4. [Product Management](#product-management)
5. [Order Management](#order-management)
6. [Technical Architecture](#technical-architecture)
7. [Common Tasks](#common-tasks)
8. [Troubleshooting](#troubleshooting)

---

## 🚀 QUICK START

### For Store Owners

**Access Admin Panel**:
1. Go to https://intru-shop.pages.dev/admin
2. Currently **NO PASSWORD REQUIRED** (will add authentication)
3. You'll see the dashboard with stats

**Add Your First Product**:
1. Click "Products" in sidebar
2. Click "+ Add Product" button
3. (CURRENTLY MISSING - Will add form in this update)

### For Customers

**Browse Products**:
1. Visit https://intru-shop.pages.dev
2. Browse available products
3. Click product to see details
4. Add to cart and checkout

---

## 🌐 WEBSITE OVERVIEW

### What is INTRU?

INTRU is a complete e-commerce platform for Indian streetwear built with:
- **Frontend**: Next.js 15 + React 18 + Tailwind CSS
- **Backend**: Cloudflare Workers (Edge Runtime)
- **Database**: Supabase PostgreSQL
- **Payments**: Razorpay (Prepaid + COD)
- **Shipping**: Shiprocket Integration

### Current Status

✅ **Working**:
- Homepage with product display
- Product detail pages
- Shopping cart
- Checkout flow
- Payment processing (Razorpay)
- Order management
- Admin dashboard stats

⏸️ **Needs Implementation** (This Update):
- Admin authentication
- Product add/edit forms in admin panel
- Image upload for products
- Enhanced UI/UX

---

## 🔧 ADMIN PANEL GUIDE

### Accessing Admin Panel

**URL**: https://intru-shop.pages.dev/admin

**Current State**: No authentication (open access)  
**After This Update**: Login required with email/password

### Admin Dashboard

**Location**: `/admin`

**What You See**:
- Total Products count
- Total Orders count
- Total Revenue
- Ready to Ship count
- Recent orders list

**Quick Actions**:
- Add New Product button
- View Pending Orders button

### Navigation

**Sidebar Menu**:
- 📊 Dashboard - Overview stats
- 📦 Products - Manage products
- 🛍️ Orders - View/manage orders
- ⚙️ Settings - Store configuration

---

## 📦 PRODUCT MANAGEMENT

### Current Workflow (Via Supabase)

**To Add Products Now** (Until We Fix It):
1. Go to https://supabase.com
2. Open your project
3. Navigate to Table Editor → products
4. Click "Insert row"
5. Fill in:
   - title
   - description
   - price (in rupees)
   - stock
   - hsn_code
   - image_url (full URL)
   - is_live (true/false)
   - variants (JSON array)

### After This Update

**Product Management Will Have**:
1. **Add Product Form**: Full form with all fields
2. **Edit Product**: Update existing products
3. **Image Upload**: Upload images directly
4. **Bulk Actions**: Toggle live status, delete
5. **Variant Management**: Add sizes, colors, stock per variant

### Product Fields Explained

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| title | Text | Yes | Product name (e.g., "Oversized Tee") |
| description | Text | No | Product description |
| price | Number | Yes | Selling price in ₹ (e.g., 999) |
| compare_at_price | Number | No | Original price for "Sale" badge |
| stock | Number | Yes | Total available units |
| hsn_code | Text | Yes | HSN code for GST (e.g., "6109") |
| image_url | Text | No | Main product image URL |
| images | JSON | No | Array of additional images |
| variants | JSON | No | Size/color variants with stock |
| material | Text | No | Fabric material |
| fit | Text | No | Fit type (Oversized, Regular) |
| care_instructions | Text | No | Washing instructions |
| is_live | Boolean | Yes | Show on website (true/false) |

### Variant Structure

```json
[
  {
    "size": "M",
    "stock": 10,
    "sku": "OT-BLK-M"
  },
  {
    "size": "L",
    "stock": 15,
    "sku": "OT-BLK-L"
  }
]
```

---

## 🛍️ ORDER MANAGEMENT

### Order Statuses

**Payment Status**:
- `pending` - Awaiting payment
- `success` - Payment received
- `failed` - Payment failed
- `refunded` - Money returned

**Shipping Status**:
- `pending` - Not shipped yet
- `ready_to_ship` - Ready for shipping
- `shipped` - In transit
- `delivered` - Completed
- `cancelled` - Cancelled

**Verification Status** (COD Only):
- `pending` - Awaiting verification call
- `verified` - Call confirmed
- `rejected` - Customer declined

### Viewing Orders

**Location**: `/admin/orders`

**What You See**:
- Order number
- Customer name and contact
- Items ordered
- Total amount
- Payment method (Prepaid/COD)
- Current status
- Actions (View details, Update status)

---

## 🏗️ TECHNICAL ARCHITECTURE

### Frontend (Next.js)

**Pages**:
- `/` - Homepage with products
- `/products/[id]` - Product detail page
- `/cart` - Shopping cart
- `/checkout` - Checkout flow
- `/order-success` - Thank you page
- `/admin/*` - Admin panel

**Components**:
- Server Components for data fetching
- Client Components for interactivity
- Edge Runtime for all API routes

### Backend (Cloudflare Workers)

**API Routes**:
- `POST /api/orders/create` - Create new order
- `POST /api/orders/verify-payment` - Verify Razorpay payment
- `POST /api/orders/verify-cod` - COD verification
- `POST /api/webhooks/razorpay` - Payment webhooks
- `GET /api/config/store` - Store settings
- `POST /api/config/check-pincode` - Pincode validation
- `POST /api/shipping/rates` - Shipping rates
- `POST /api/referral/validate` - Referral codes

**NEW (Adding In This Update)**:
- `POST /api/admin/products` - Create product
- `PUT /api/admin/products/[id]` - Update product
- `DELETE /api/admin/products/[id]` - Delete product
- `POST /api/admin/auth/login` - Admin login
- `POST /api/admin/auth/logout` - Admin logout
- `POST /api/admin/upload` - Image upload

### Database (Supabase)

**Tables**:
- `products` - Product catalog
- `orders` - Customer orders
- `admin_users` - Admin accounts
- `settings` - Store configuration
- `blocked_pincodes` - COD restrictions
- `referral_codes` - Discount codes
- `customer_wallets` - Customer credits

**Storage Buckets**:
- `products` - Product images

---

## 📋 COMMON TASKS

### Task 1: Add a New Product (Current Method)

1. Go to Supabase Dashboard
2. Table Editor → products → Insert row
3. Fill fields:
   ```
   title: "Oversized Black Tee"
   description: "Premium cotton oversized t-shirt"
   price: 999
   compare_at_price: 1499
   stock: 50
   hsn_code: "6109"
   image_url: "https://your-image-url.jpg"
   is_live: true
   variants: [{"size":"M","stock":20},{"size":"L","stock":30}]
   ```
4. Click Save
5. Product appears on website immediately

### Task 2: Update Product Stock

1. Supabase → Table Editor → products
2. Find product row
3. Click edit
4. Update `stock` field or `variants` JSON
5. Save

### Task 3: Mark Order as Shipped

1. Admin Panel → Orders
2. Find order
3. (CURRENTLY: Must update in Supabase)
4. (AFTER UPDATE: Will have status dropdown)

### Task 4: Configure Store Settings

1. Admin Panel → Settings
2. Update:
   - Store name
   - Contact email
   - Shipping charges
   - COD availability
3. Save changes

---

## 🛠️ TROUBLESHOOTING

### Products Not Showing on Homepage

**Check**:
1. Is `is_live` set to `true` in database?
2. Is `stock` > 0?
3. Are Supabase env vars configured in Cloudflare?

**Solution**:
```sql
-- In Supabase SQL Editor
UPDATE products 
SET is_live = true 
WHERE is_live = false;
```

### Admin Panel Shows Wrong Data

**Issue**: Data not refreshing  
**Solution**: Admin pages use `force-dynamic` so should auto-refresh. Try:
1. Hard refresh browser (Ctrl+Shift+R)
2. Check Supabase connection
3. Verify `SUPABASE_SERVICE_ROLE_KEY` in Cloudflare env vars

### Payment Not Processing

**Check**:
1. Razorpay keys configured in Cloudflare env vars
2. Razorpay account is in live mode (or test mode for testing)
3. Webhook URL configured in Razorpay dashboard

**Webhook URL**: `https://intru-shop.pages.dev/api/webhooks/razorpay`

### Images Not Loading

**Issue**: Supabase storage not public  
**Solution**:
1. Supabase → Storage → products bucket
2. Click bucket settings
3. Make bucket PUBLIC
4. Add RLS policy to allow public reads

---

## 🔐 SECURITY

### Environment Variables

**Required in Cloudflare Pages**:
```bash
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
SUPABASE_SERVICE_ROLE_KEY=eyJ...
NEXT_PUBLIC_RAZORPAY_KEY_ID=rzp_test_xxx
RAZORPAY_KEY_SECRET=xxx
RAZORPAY_WEBHOOK_SECRET=xxx
SHIPROCKET_EMAIL=your@email.com
SHIPROCKET_PASSWORD=xxx
NEXT_PUBLIC_APP_URL=https://intru-shop.pages.dev
WHATSAPP_BUSINESS_NUMBER=91xxxxxxxxxx
```

### Admin Access

**Current**: No authentication (anyone can access /admin)  
**After Update**: Password-protected admin panel

---

## 📊 WHAT'S BEING ADDED IN THIS UPDATE

### 1. Admin Authentication
- Login page at `/admin/login`
- Password protection
- Session management
- Logout functionality

### 2. Product Management Forms
- Add product form with all fields
- Edit product form
- Image upload directly in admin
- Variant management UI
- Toggle live status with one click

### 3. Enhanced UI/UX
- Better product cards
- Improved navigation
- Mobile-responsive admin panel
- Loading states
- Error messages

### 4. API Routes
- Product CRUD endpoints
- Authentication endpoints
- Image upload endpoint

---

## 📞 SUPPORT

### Getting Help

**Documentation**:
- This manual (USER_MANUAL.md)
- Technical docs in `docs/archive/`

**Common Issues**:
- Check Troubleshooting section above
- Verify environment variables
- Check Supabase connection
- Review Cloudflare Pages logs

---

## 🎯 QUICK REFERENCE

### URLs
- **Store**: https://intru-shop.pages.dev
- **Admin**: https://intru-shop.pages.dev/admin
- **Supabase**: https://supabase.com
- **Cloudflare**: https://dash.cloudflare.com

### Key Concepts
- **Edge Runtime**: Code runs on Cloudflare's global network
- **Server Components**: Fetch data on server before rendering
- **Client Components**: Interactive UI elements
- **RLS**: Row-Level Security in Supabase
- **HSN Code**: Tax classification code for products

---

**This manual will be updated as new features are added.**

Last Updated: 2026-01-06  
Version: 2.0
