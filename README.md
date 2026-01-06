# 🛍️ INTRU E-Commerce Platform

**Live Site**: https://intru-shop.pages.dev  
**Admin Panel**: https://intru-shop.pages.dev/admin  

Indian streetwear e-commerce platform built with Next.js 15, Cloudflare Workers, and Supabase.

---

## 📖 Documentation

- **[USER_MANUAL.md](./USER_MANUAL.md)** - Complete guide for store owners and users
- **[docs/archive/](./docs/archive/)** - Technical documentation archive

---

## ✨ Features

### Customer Features
- 🛒 Product browsing with filters
- 💳 Secure checkout (Razorpay)
- 📦 COD & Prepaid options
- 🚚 Shiprocket integration
- 📱 Mobile responsive
- ⚡ Fast edge runtime

### Admin Features
- 📊 Dashboard with stats
- 📦 Product management
- 🛍️ Order tracking
- ⚙️ Store settings
- 💰 Revenue analytics

---

## 🚀 Quick Start

### For Store Owners

1. Access admin panel: https://intru-shop.pages.dev/admin
2. View dashboard stats
3. Manage products and orders
4. Configure store settings

See [USER_MANUAL.md](./USER_MANUAL.md) for complete guide.

### For Developers

```bash
# Clone repository
git clone https://github.com/x-shindee/intru-shop.git
cd intru-shop

# Install dependencies
npm install

# Setup environment variables
cp .env.example .env.local
# Edit .env.local with your credentials

# Run development server
npm run dev

# Build for production
npm run build
npm run pages:build
```

---

## 🛠️ Tech Stack

- **Frontend**: Next.js 15, React 18, Tailwind CSS
- **Backend**: Cloudflare Workers (Edge Runtime)
- **Database**: Supabase PostgreSQL
- **Payments**: Razorpay
- **Shipping**: Shiprocket
- **Hosting**: Cloudflare Pages

---

## 📋 Environment Variables

Required in Cloudflare Pages dashboard:

```bash
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
NEXT_PUBLIC_RAZORPAY_KEY_ID=
RAZORPAY_KEY_SECRET=
RAZORPAY_WEBHOOK_SECRET=
SHIPROCKET_EMAIL=
SHIPROCKET_PASSWORD=
NEXT_PUBLIC_APP_URL=
WHATSAPP_BUSINESS_NUMBER=
```

---

## 🏗️ Project Structure

```
├── app/                    # Next.js 15 App Router
│   ├── (customer)/        # Customer-facing pages
│   ├── admin/             # Admin panel
│   └── api/               # API routes (Edge Runtime)
├── lib/                   # Utility functions
│   ├── supabase.ts       # Database client
│   ├── razorpay-edge.ts  # Payment client
│   ├── web-crypto.ts     # Cryptography utils
│   └── gst.ts            # Tax calculations
├── docs/                  # Documentation
└── public/               # Static assets
```

---

## 🔐 Security

- Edge Runtime with Web Crypto API
- Row-Level Security (RLS) in Supabase
- HMAC signature verification
- Environment variable protection
- Admin authentication (being added)

---

## 📊 Database Schema

Main tables:
- `products` - Product catalog
- `orders` - Customer orders
- `admin_users` - Admin accounts
- `settings` - Store configuration
- `referral_codes` - Discount codes

See `supabase-schema-v2.sql` for complete schema.

---

## 🚀 Deployment

**Automatic via GitHub**:
1. Push to `main` branch
2. Cloudflare Pages auto-deploys
3. Build command: `npx @cloudflare/next-on-pages`
4. Output: `.vercel/output/static`

**Manual via Wrangler**:
```bash
npm run pages:build
npx wrangler pages deploy .vercel/output/static --project-name intru-shop
```

---

## 📝 Common Tasks

### Add Product
Currently via Supabase dashboard (admin form being added):
1. Go to Supabase → Table Editor → products
2. Insert row with product details
3. Set `is_live = true` to show on site

### Update Order Status
Admin panel → Orders → Click order → Update status

### Configure Store
Admin panel → Settings → Update configuration

---

## 🐛 Troubleshooting

See [USER_MANUAL.md](./USER_MANUAL.md#troubleshooting) for common issues and solutions.

---

## 📞 Support

- **Documentation**: [USER_MANUAL.md](./USER_MANUAL.md)
- **Technical Docs**: [docs/archive/](./docs/archive/)
- **Issues**: GitHub Issues

---

## 📄 License

Private - All rights reserved

---

**Version**: 2.0  
**Last Updated**: 2026-01-06
