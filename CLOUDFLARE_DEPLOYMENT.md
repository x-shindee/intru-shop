# 🚀 Cloudflare Pages Deployment Guide - Intru Store

## ✅ Code Successfully Pushed to GitHub!

**Repository**: https://github.com/x-shindee/intru-shop
**Branch**: main

---

## 📋 Quick Deployment Checklist

### 1. Setup Supabase Database (15 minutes)

1. Go to [supabase.com](https://supabase.com) and create a new project
2. In SQL Editor, run the **NEW** schema file: `supabase-schema-v2.sql`
   - This includes the flexible charge system
   - Referral system tables
   - Blocked pincodes table
   - Store configuration table
3. Create storage bucket named `products` (for product images)
4. Note down credentials:
   - Project URL
   - Anon key
   - Service role key

### 2. Setup Payment & Shipping Services (10 minutes)

**Razorpay:**
- Create account at [razorpay.com](https://razorpay.com)
- Get API keys (Key ID & Secret)
- Generate webhook secret

**Shiprocket:**
- Register at [shiprocket.in](https://shiprocket.in)
- Get API credentials (email & password)

**WhatsApp Business:**
- Setup WhatsApp Business number
- Format: 91XXXXXXXXXX (with country code)

### 3. Deploy to Cloudflare Pages (20 minutes)

#### Option A: GitHub Integration (Recommended)

1. **Go to Cloudflare Dashboard**
   - Visit [dash.cloudflare.com](https://dash.cloudflare.com)
   - Navigate to Pages → Create Project

2. **Connect GitHub**
   - Connect your GitHub account
   - Select repository: `x-shindee/intru-shop`
   - Select branch: `main`

3. **Configure Build Settings**
   ```
   Framework preset: Next.js
   Build command: npm run pages:build
   Build output directory: .vercel/output/static
   Root directory: /
   Node version: 18 or higher
   ```

4. **Add Environment Variables**
   
   In Cloudflare Pages → Settings → Environment Variables, add:

   ```bash
   # Supabase
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
   SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

   # Razorpay
   NEXT_PUBLIC_RAZORPAY_KEY_ID=your_razorpay_key_id
   RAZORPAY_KEY_SECRET=your_razorpay_secret
   RAZORPAY_WEBHOOK_SECRET=your_webhook_secret

   # Shiprocket
   SHIPROCKET_EMAIL=your_shiprocket_email
   SHIPROCKET_PASSWORD=your_shiprocket_password

   # WhatsApp
   NEXT_PUBLIC_WHATSAPP_NUMBER=91XXXXXXXXXX

   # App URL (update after first deployment)
   NEXT_PUBLIC_APP_URL=https://intru-shop.pages.dev
   ```

5. **Deploy!**
   - Click "Save and Deploy"
   - Wait 3-5 minutes for build to complete
   - Your site will be live at: `https://intru-shop.pages.dev`

#### Option B: Wrangler CLI

```bash
# Install Wrangler globally
npm install -g wrangler

# Login to Cloudflare
wrangler login

# Build the project
cd /home/user/intru-store
npm run pages:build

# Deploy to Cloudflare Pages
wrangler pages deploy .vercel/output/static --project-name intru-shop

# Add environment variables
wrangler pages secret put NEXT_PUBLIC_SUPABASE_URL --project-name intru-shop
wrangler pages secret put NEXT_PUBLIC_SUPABASE_ANON_KEY --project-name intru-shop
# ... repeat for all variables
```

---

## 🎛️ Post-Deployment Configuration

### 1. Update Business Settings

Access admin dashboard: `https://intru-shop.pages.dev/admin/settings`

#### Store Configuration:
- Business name, email, phone
- GSTIN and state information
- Grievance officer details

#### Flexible Charge System:
- Enable/disable extra charges
- Add custom charges (e.g., "Packaging: ₹20", "Handling: ₹30")

#### Referral System:
- Enable/disable referrals
- Set discount type (percentage or fixed)
- Configure referral credit amount
- Set minimum order for referral

#### COD Filtering:
- Block specific pincodes where COD is not available
- Add reasons for blocking

#### Fraud Protection:
- Enable unboxing video requirement (default: ON)
- Set abandoned order timeout (default: 15 minutes)

### 2. Update Razorpay Webhook

Go to Razorpay Dashboard → Webhooks:
- URL: `https://intru-shop.pages.dev/api/webhooks/razorpay`
- Events: `payment.captured`, `payment.failed`, `refund.created`

### 3. Configure Custom Domain (Optional)

In Cloudflare Pages → Custom Domains:
1. Add domain: `intru.in`
2. Update DNS:
   ```
   CNAME @ intru-shop.pages.dev
   ```
3. Update environment variable:
   ```
   NEXT_PUBLIC_APP_URL=https://intru.in
   ```

---

## 🧪 Testing Your Deployment

### 1. Store Configuration Test
```
✅ Visit /admin/settings
✅ Toggle extra charges ON
✅ Add a test charge (e.g., "Packaging: ₹20")
✅ Save settings
```

### 2. Checkout Flow Test
```
✅ Add product to cart
✅ Go to checkout
✅ Enter pincode
✅ Verify custom charges appear if enabled
✅ Test prepaid payment (Razorpay test mode)
✅ Verify unboxing video message on success page
```

### 3. COD Pincode Test
```
✅ Go to /admin/settings
✅ Add pincode to blacklist
✅ Go to checkout
✅ Enter blocked pincode
✅ Verify COD option is disabled
```

### 4. Referral System Test (when enabled)
```
✅ Enable referrals in /admin/settings
✅ Go to checkout
✅ Enter referral code field appears
✅ Apply a test code
✅ Verify discount is applied
```

---

## 🔑 New Features Overview

### 1. Flexible Charge System
**Admin Control**: `/admin/settings` → Flexible Charge System

- **Toggle**: Enable/disable extra charges globally
- **Add Charges**: Add any custom charges (Packaging, Handling, etc.)
- **Dynamic Display**: Charges automatically appear in checkout if enabled
- **Clean UI**: Charges only show when enabled, otherwise clean summary

**Checkout Display**:
```
Items Total:     ₹1,000
Shipping:        FREE
Packaging:       ₹20      ← Only shows if enabled
Handling:        ₹30      ← Only shows if enabled
Tax (GST 18%):   ₹189
─────────────────────────
Grand Total:     ₹1,239
```

### 2. COD Pincode Blocking
**Admin Control**: `/admin/settings` → Block COD by Pincode

- **Block Pincodes**: Add 6-digit pincodes to blacklist
- **Automatic Check**: System checks on pincode entry
- **Instant Disable**: COD option disabled for blocked pincodes
- **Custom Reasons**: Add notes for why pincode is blocked

**Customer Experience**:
- Enter pincode at checkout
- If blocked, COD option grays out with message: "Not available for this pincode"
- Forces customer to choose prepaid payment

### 3. Referral System
**Admin Control**: `/admin/settings` → Referral System

**Configuration**:
- Enable/Disable referrals with one toggle
- Discount type: Percentage or Fixed amount
- Referrer reward: Credit amount for successful referrals
- Minimum order: Set threshold for referral eligibility

**Customer Experience** (when enabled):
- Referral code input field appears at checkout
- Apply code to get discount
- Discount automatically calculated and applied
- Referrer gets wallet credit after order completion

**Database Tables**:
- `referral_codes`: All active referral codes
- `customer_wallets`: Customer balances and referral tracking
- `wallet_transactions`: Credit/debit history

### 4. Fraud Protection

**Mandatory Unboxing Video**:
- Hardcoded requirement on success page
- Red bordered warning box
- Clear instructions for customers
- No claims accepted without video

**Abandoned Order Recovery**:
- Auto-marks orders as 'ABANDONED' after timeout
- Default: 15 minutes (configurable)
- Helps track payment drop-offs
- Can be used for recovery campaigns

**Order Status Flow**:
```
pending → (15 min) → abandoned  (no payment)
pending → success → ready_to_ship (payment received)
```

---

## 🎯 Admin Dashboard Workflow Examples

### Example 1: Add New Charge
```
1. Login to /admin/settings
2. Toggle "Enable Extra Charges" ON
3. Add charge:
   - Label: "Gift Wrapping"
   - Amount: 50
4. Click "Add Charge"
5. Click "Save All Settings"
6. ✅ Charge now appears on all checkouts
```

### Example 2: Kill Referrals
```
1. Login to /admin/settings
2. Toggle "Referral System" OFF
3. Click "Save All Settings"
4. ✅ Referral input vanishes from checkout
5. ✅ Existing codes still tracked, just hidden
```

### Example 3: Block Area
```
1. Login to /admin/settings
2. Enter pincode: "400001"
3. Add reason: "High fraud area"
4. Click "Block Pincode"
5. ✅ COD instantly disabled for that pincode
6. ✅ Customers see message: "COD not available"
```

---

## 📊 Monitoring & Maintenance

### Check Store Health

1. **Visit Admin Dashboard**: `/admin`
   - Total products, orders, revenue
   - Pending orders count
   - Ready to ship count

2. **Review Settings**: `/admin/settings`
   - Verify charges are correct
   - Check blocked pincodes list
   - Monitor referral system status

3. **Check Orders**: `/admin/orders`
   - Filter by abandoned status
   - Track COD verifications
   - Monitor fraud indicators

### Scheduled Tasks (Optional)

Set up a cron job or Cloudflare Worker to run:
```bash
# Mark abandoned orders (every 5 minutes)
POST /api/orders/mark-abandoned
```

---

## 🐛 Troubleshooting

### Build Failures
```bash
# Clear cache and rebuild
rm -rf .next .vercel node_modules
npm install
npm run pages:build
```

### Environment Variable Issues
- Verify all variables are set in Cloudflare dashboard
- Check variable names (case-sensitive)
- Redeploy after adding new variables

### Custom Charges Not Showing
1. Check `/admin/settings` → Extra charges enabled?
2. Verify charges array is not empty
3. Check browser console for errors
4. Clear cache and test again

### COD Not Blocking
1. Verify pincode is exactly 6 digits
2. Check pincode exists in blocked_pincodes table
3. Clear browser cache
4. Test with different pincode

### Referral System Not Working
1. Check `/admin/settings` → Is referral enabled?
2. Verify `is_referral_enabled` is TRUE in database
3. Check referral code exists and is active
4. Verify order meets minimum amount

---

## 📈 Performance Optimization

### Cloudflare Pages Benefits
- ✅ Global CDN (instant worldwide access)
- ✅ Automatic SSL certificates
- ✅ DDoS protection
- ✅ Edge caching
- ✅ Zero cold starts

### Database Optimization
- ✅ Indexed columns for fast queries
- ✅ RLS policies for security
- ✅ Atomic stock operations
- ✅ Efficient JSON queries

---

## 🎉 Success Metrics

Your store is ready when:
- ✅ GitHub repo is up to date
- ✅ Cloudflare Pages deployed successfully
- ✅ Supabase database configured
- ✅ Admin settings customized
- ✅ Test order completed successfully
- ✅ Custom charges working
- ✅ COD blocking functional
- ✅ Unboxing video message visible

---

## 📞 Support Resources

- **GitHub Repo**: https://github.com/x-shindee/intru-shop
- **Cloudflare Docs**: https://developers.cloudflare.com/pages
- **Supabase Docs**: https://supabase.com/docs
- **Next.js Docs**: https://nextjs.org/docs

---

## 🔄 Updating Your Store

### Make Changes
```bash
cd /home/user/intru-store

# Make your changes to files

# Commit and push
git add .
git commit -m "Your update message"
git push origin main

# Cloudflare auto-deploys from GitHub!
```

### Manual Deploy (if needed)
```bash
npm run pages:build
wrangler pages deploy .vercel/output/static --project-name intru-shop
```

---

**🎊 Your store is now LIVE and ready for customers!**

**Production URL**: https://intru-shop.pages.dev (or your custom domain)

**Admin Dashboard**: https://intru-shop.pages.dev/admin
