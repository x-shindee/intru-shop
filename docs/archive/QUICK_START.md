# ⚡ CLOUDFLARE PAGES - QUICK REFERENCE

## 🔧 BUILD SETTINGS

```yaml
Framework: Next.js
Build Command: npx @cloudflare/next-on-pages
Build Output: .vercel/output/static
Node Version: 18 or 20
Install Command: npm install
```

## 🔐 REQUIRED ENVIRONMENT VARIABLES (10 Total)

```bash
# Supabase (3)
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
SUPABASE_SERVICE_ROLE_KEY=eyJ...

# Razorpay (2)
NEXT_PUBLIC_RAZORPAY_KEY_ID=rzp_live_xxx
RAZORPAY_KEY_SECRET=xxx

# Shiprocket (2)
SHIPROCKET_EMAIL=your@email.com
SHIPROCKET_PASSWORD=yourpassword

# App Config (2)
NEXT_PUBLIC_APP_URL=https://your-domain.pages.dev
WHATSAPP_BUSINESS_NUMBER=919999999999
```

## 📦 KEY PACKAGES

```json
{
  "next": "15.1.3",
  "react": "18.3.1",
  "@cloudflare/next-on-pages": "^1.13.16",
  "@supabase/supabase-js": "^2.89.0",
  "razorpay": "^2.9.6",
  "wrangler": "latest"
}
```

## 🎯 DEPLOYMENT URLS

```
Production: https://webapp.pages.dev
Admin Panel: https://webapp.pages.dev/admin
Admin Settings: https://webapp.pages.dev/admin/settings
API Health: https://webapp.pages.dev/api/config/store
```

## 🗄️ DATABASE SETUP

```sql
-- Run in Supabase SQL Editor
-- File: /home/user/webapp/supabase-schema-v2.sql
-- Creates: 8 tables + 4 functions + RLS policies
```

## 🪣 STORAGE BUCKET

```
Bucket Name: products
Visibility: Public
Purpose: Product images
Path: /home/user/webapp/public/uploads (dev)
```

## 🚀 DEPLOYMENT FLOW

```mermaid
GitHub Push → Cloudflare Pages → Build → Deploy → Live
     ↓              ↓                ↓       ↓       ↓
  main branch   Auto-detect     3-5 min  Tests   URL
```

## ✅ POST-DEPLOY CHECKLIST

```bash
1. [ ] Run supabase-schema-v2.sql
2. [ ] Create "products" storage bucket (PUBLIC)
3. [ ] Test product listing (/products)
4. [ ] Test add to cart functionality
5. [ ] Test checkout + GST calculation
6. [ ] Test Razorpay payment (TEST mode first)
7. [ ] Test COD + WhatsApp verification
8. [ ] Test admin login (/admin)
9. [ ] Test product upload
10. [ ] Configure store settings (/admin/settings)
11. [ ] Add custom charges
12. [ ] Block test pincodes
13. [ ] Test referral system
14. [ ] Switch Razorpay to LIVE mode
15. [ ] Test production order flow
```

## 🎨 ADMIN FEATURES

```
/admin → Dashboard (stats, quick actions)
/admin/products → Product management (add, edit, toggle live)
/admin/orders → Order tracking (fetch rates, manage status)
/admin/settings → Store config (charges, pincodes, referrals)
```

## 🔒 SECURITY FEATURES

- ✅ Edge runtime (no Node.js exposure)
- ✅ Supabase RLS policies
- ✅ Razorpay webhook verification
- ✅ COD pincode blocking
- ✅ Abandoned order recovery
- ✅ Unboxing video requirement
- ✅ Referral fraud prevention

## 🛠️ LOCAL DEVELOPMENT

```bash
# Install dependencies
npm install

# Run dev server
npm run dev

# Build for Cloudflare
npm run pages:build

# Preview production build
npm run preview

# Deploy to Cloudflare
npm run deploy
```

## 📊 PERFORMANCE TARGETS

```
Lighthouse Score: 90+
First Contentful Paint: <1s
Time to Interactive: <2s
Largest Contentful Paint: <2.5s
Cumulative Layout Shift: <0.1
```

## 🌍 EDGE LOCATIONS

```
Cloudflare: 275+ cities worldwide
Latency: <50ms (India)
Uptime SLA: 99.99%
DDoS Protection: Included
```

## 💰 PRICING ESTIMATE

```
Cloudflare Pages: FREE (500 builds/month)
Supabase: FREE tier (500MB DB, 1GB storage)
Razorpay: 2% per transaction
Total Fixed Cost: ₹0/month
```

## 🆘 EMERGENCY CONTACTS

```
Cloudflare Support: https://dash.cloudflare.com/support
Supabase Support: https://supabase.com/support
Razorpay Support: https://razorpay.com/support/
Shiprocket Support: https://shiprocket.in/contact/
```

## 📁 PROJECT STRUCTURE

```
webapp/
├── app/
│   ├── (pages)/
│   ├── admin/          # Admin dashboard
│   ├── api/            # Edge API routes
│   └── products/       # Product pages
├── lib/
│   ├── supabase.ts     # Database client
│   ├── gst.ts          # Tax calculator
│   └── store-config.ts # Store settings
├── supabase-schema-v2.sql  # Database schema
├── next.config.js      # Next.js config
├── wrangler.toml       # Cloudflare config
└── package.json        # Dependencies
```

---

**🎉 YOU'RE READY TO DEPLOY!**

**Estimated Setup Time**: 25-30 minutes
**Difficulty**: Beginner-Friendly
**Documentation**: Complete

Need help? Check `CLOUDFLARE_READY.md` for detailed instructions.
