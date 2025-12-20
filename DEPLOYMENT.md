# Deployment Guide - Intru E-commerce Store

## Quick Start Deployment Checklist

### ✅ Pre-Deployment Requirements

1. **Supabase Account** - Database & Storage
2. **Razorpay Account** - Payment Gateway
3. **Shiprocket Account** - Shipping Integration
4. **WhatsApp Business Number** - COD Verification
5. **Cloudflare Account** - Hosting Platform
6. **GitHub Account** (Optional) - Version Control

---

## Step-by-Step Deployment

### 1. Setup Supabase (15 minutes)

#### Create Project
1. Go to [supabase.com](https://supabase.com) and create account
2. Create new project
3. Note down:
   - Project URL (`NEXT_PUBLIC_SUPABASE_URL`)
   - Anon/Public Key (`NEXT_PUBLIC_SUPABASE_ANON_KEY`)
   - Service Role Key (`SUPABASE_SERVICE_ROLE_KEY`)

#### Run Database Schema
1. Go to SQL Editor in Supabase Dashboard
2. Copy contents of `supabase-schema.sql`
3. Paste and click "Run"
4. Verify tables created: `products`, `orders`, `admin_users`, `settings`

#### Setup Storage
1. Go to Storage → Create Bucket
2. Name: `products`
3. Make bucket **Public**
4. Add policy for public read access:
   ```sql
   CREATE POLICY "Public Access"
   ON storage.objects FOR SELECT
   USING (bucket_id = 'products');
   ```

---

### 2. Setup Razorpay (10 minutes)

#### Create Account
1. Sign up at [razorpay.com](https://razorpay.com)
2. Complete business verification (for production)
3. For testing, use Test Mode

#### Get API Keys
1. Dashboard → Settings → API Keys
2. Generate keys:
   - Key ID (`NEXT_PUBLIC_RAZORPAY_KEY_ID`)
   - Key Secret (`RAZORPAY_KEY_SECRET`)

#### Setup Webhooks
1. Dashboard → Settings → Webhooks
2. Add webhook URL: `https://your-domain.com/api/webhooks/razorpay`
3. Select events:
   - `payment.captured`
   - `payment.failed`
   - `refund.created`
4. Generate webhook secret (`RAZORPAY_WEBHOOK_SECRET`)

#### Test Mode Cards
For testing payments:
- **Success**: 4111 1111 1111 1111
- **Failure**: 4111 1111 1111 1234
- CVV: Any 3 digits
- Expiry: Any future date

---

### 3. Setup Shiprocket (10 minutes)

#### Create Account
1. Sign up at [shiprocket.in](https://shiprocket.in)
2. Complete seller onboarding

#### Add Pickup Location
1. Dashboard → Settings → Pickup Locations
2. Add warehouse/store address
3. This will be used for all shipments

#### Get API Credentials
1. Dashboard → Settings → API
2. Use email and password for authentication
3. Note down:
   - Email (`SHIPROCKET_EMAIL`)
   - Password (`SHIPROCKET_PASSWORD`)

---

### 4. Setup WhatsApp Business (5 minutes)

#### Option A: WhatsApp Business App (Recommended)
1. Download WhatsApp Business from Play Store/App Store
2. Register business number
3. Set up business profile
4. Note number with country code: `91XXXXXXXXXX`

#### Option B: WhatsApp Web
1. Use existing WhatsApp Business account
2. Keep WhatsApp Web open for notifications

#### Configure in App
Update `.env.local`:
```env
NEXT_PUBLIC_WHATSAPP_NUMBER=91XXXXXXXXXX
```

---

### 5. Deploy to Cloudflare Pages (20 minutes)

#### Option A: GitHub Integration (Recommended)

1. **Push to GitHub**
   ```bash
   cd /home/user/intru-store
   git remote add origin https://github.com/your-username/intru-store.git
   git push -u origin main
   ```

2. **Connect to Cloudflare Pages**
   - Go to [dash.cloudflare.com](https://dash.cloudflare.com)
   - Pages → Create Project
   - Connect GitHub account
   - Select `intru-store` repository

3. **Configure Build Settings**
   - **Framework preset**: Next.js
   - **Build command**: `npm run build`
   - **Build output directory**: `.next`
   - **Root directory**: `/`
   - **Node version**: 18 or higher

4. **Add Environment Variables**
   In Cloudflare Pages → Settings → Environment Variables:
   ```
   NEXT_PUBLIC_SUPABASE_URL=your_value
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_value
   SUPABASE_SERVICE_ROLE_KEY=your_value
   NEXT_PUBLIC_RAZORPAY_KEY_ID=your_value
   RAZORPAY_KEY_SECRET=your_value
   RAZORPAY_WEBHOOK_SECRET=your_value
   SHIPROCKET_EMAIL=your_value
   SHIPROCKET_PASSWORD=your_value
   NEXT_PUBLIC_WHATSAPP_NUMBER=91XXXXXXXXXX
   NEXT_PUBLIC_APP_URL=https://intru-store.pages.dev
   ```

5. **Deploy**
   - Click "Save and Deploy"
   - Wait for build to complete (~2-3 minutes)
   - Note your deployment URL: `https://intru-store.pages.dev`

#### Option B: Wrangler CLI

```bash
# Install Wrangler
npm install -g wrangler

# Login to Cloudflare
wrangler login

# Build project
cd /home/user/intru-store
npm run build

# Deploy
wrangler pages deploy .next --project-name intru-store

# Add environment variables
wrangler pages secret put NEXT_PUBLIC_SUPABASE_URL
wrangler pages secret put NEXT_PUBLIC_SUPABASE_ANON_KEY
# ... repeat for all environment variables
```

---

### 6. Post-Deployment Configuration

#### Update Razorpay Webhook
1. Go to Razorpay Dashboard → Webhooks
2. Update webhook URL with production domain:
   - `https://your-domain.pages.dev/api/webhooks/razorpay`

#### Update Business Settings
1. Login to Supabase Dashboard
2. Go to Table Editor → `settings` table
3. Update `business_info`:
   ```json
   {
     "name": "Intru",
     "email": "support@intru.in",
     "phone": "+91XXXXXXXXXX",
     "address": "Your Business Address",
     "gstin": "YOUR_GSTIN_NUMBER",
     "state": "Karnataka",
     "state_code": "29"
   }
   ```

#### Add First Admin User (Optional)
Run in Supabase SQL Editor:
```sql
INSERT INTO admin_users (email, password_hash, role)
VALUES (
  'admin@intru.in',
  '$2a$10$...',  -- Use bcrypt hashed password
  'admin'
);
```

#### Test Complete Flow
1. ✅ Visit store homepage
2. ✅ Add product to cart
3. ✅ Complete checkout (test mode)
4. ✅ Verify Razorpay payment works
5. ✅ Test COD flow with WhatsApp
6. ✅ Access admin dashboard
7. ✅ Create test product
8. ✅ Process test order

---

### 7. Custom Domain Setup (Optional)

#### Add Custom Domain
1. Cloudflare Pages → Custom Domains
2. Add domain: `intru.in`
3. Update DNS records:
   ```
   CNAME intru.in intru-store.pages.dev
   ```

#### SSL Certificate
- Cloudflare automatically provisions SSL
- Wait 5-10 minutes for activation

#### Update Environment Variables
```env
NEXT_PUBLIC_APP_URL=https://intru.in
```

---

## Production Checklist

### Before Going Live

- [ ] Switch Razorpay to Live Mode
- [ ] Complete Razorpay business verification
- [ ] Test all payment methods (UPI, Cards, Netbanking)
- [ ] Test COD verification flow
- [ ] Add real products with images
- [ ] Configure Shiprocket pickup location
- [ ] Set up WhatsApp Business profile
- [ ] Add grievance officer details
- [ ] Test GST calculation for multiple states
- [ ] Enable Cloudflare Turnstile (bot protection)
- [ ] Set up backup strategy for database
- [ ] Configure email notifications
- [ ] Add Google Analytics (optional)
- [ ] Test mobile responsiveness

### Security Hardening

- [ ] Enable Supabase RLS policies
- [ ] Use environment secrets (not plain text)
- [ ] Enable Razorpay webhook signature verification
- [ ] Add rate limiting to API endpoints
- [ ] Enable HTTPS only
- [ ] Set up monitoring and alerts

---

## Monitoring & Maintenance

### Cloudflare Analytics
- Pages → Analytics
- Monitor traffic, errors, performance

### Supabase Monitoring
- Database → Query performance
- Storage → Usage metrics
- Auth → Active users

### Razorpay Dashboard
- Monitor transactions
- Check settlement status
- Handle refunds

### Shiprocket Dashboard
- Track shipments
- Monitor delivery status
- Handle RTO (Return to Origin)

---

## Troubleshooting

### Build Failures
```bash
# Clear Next.js cache
rm -rf .next
npm run build
```

### Database Connection Issues
- Check Supabase project status
- Verify connection strings
- Check RLS policies

### Payment Issues
- Verify Razorpay keys (test vs live)
- Check webhook delivery logs
- Verify signature validation

### Shipping Issues
- Check Shiprocket API credentials
- Verify pickup location is active
- Check pincode serviceability

---

## Support

For deployment issues:
1. Check Cloudflare Pages build logs
2. Check Supabase logs
3. Check browser console for errors
4. Verify all environment variables

For business support:
- Email: support@intru.in
- Phone: +91XXXXXXXXXX

---

## Cost Estimation

### Development/Small Scale (0-100 orders/month)
- Cloudflare Pages: **Free** (unlimited requests)
- Supabase: **Free** (500MB database, 1GB storage)
- Razorpay: **Free** (2% payment fee)
- Shiprocket: **Pay per shipment** (~₹30-50/shipment)
- **Total Fixed Cost: ₹0/month**

### Medium Scale (100-1000 orders/month)
- Cloudflare Pages: **Free**
- Supabase: **$25/month** (Pro plan, 8GB database)
- Razorpay: **2% per transaction**
- Shiprocket: **₹3,000-5,000/month**
- **Total Fixed Cost: ~₹7,000/month**

### Large Scale (1000+ orders/month)
- Contact for enterprise pricing
- Consider dedicated infrastructure

---

**🎉 You're ready to launch!**

Need help? Reach out to support@intru.in
