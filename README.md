# Intru E-commerce Store - Headless Commerce Solution

A high-performance, production-ready headless e-commerce platform built for **Intru** (intru.in), an Indian streetwear brand. This solution provides a complete end-to-end shopping experience with Indian e-commerce requirements including GST calculation, COD verification, Razorpay payments, and Shiprocket integration.

## 🚀 Tech Stack

### Frontend
- **Next.js 15** (App Router) - React framework with server-side rendering
- **Tailwind CSS** - Utility-first CSS framework
- **TypeScript** - Type-safe development
- **shadcn/ui** - High-quality UI components

### Backend & Database
- **Supabase** - PostgreSQL database with Row Level Security (RLS)
- **Cloudflare Pages** - Hosting platform
- **Next.js API Routes** - Server-side API endpoints

### Integrations
- **Razorpay** - Payment gateway with webhooks
- **Shiprocket** - Shipping and logistics
- **WhatsApp Business** - COD order verification
- **Cloudflare Turnstile** - Bot protection (optional)

## 📋 Features

### Customer-Facing Store
- ✅ Product listing with search and filters
- ✅ Product detail pages with size selection
- ✅ Shopping cart with localStorage persistence
- ✅ Checkout flow with address validation
- ✅ Dual payment options (Prepaid/COD)
- ✅ Automatic GST calculation (CGST+SGST/IGST)
- ✅ Free shipping on prepaid orders
- ✅ WhatsApp COD verification flow
- ✅ Order success and confirmation pages
- ✅ Responsive mobile-first design

### Admin Dashboard (`/admin`)
- ✅ Dashboard with real-time stats
- ✅ Product management (Add/Edit/Delete)
- ✅ Image upload to Supabase Storage
- ✅ Stock management with size variants
- ✅ Live/Hidden product toggle
- ✅ Order management interface
- ✅ Payment and shipping status tracking
- ✅ Manual Shiprocket integration
- ✅ Order search and filtering

### Indian E-commerce Features
- ✅ **GST Tax Engine**: Automatic CGST+SGST (intrastate) or IGST (interstate)
- ✅ **Free Shipping**: All prepaid orders get free shipping
- ✅ **COD with Verification**: WhatsApp-based order confirmation
- ✅ **HSN Code Tracking**: Product-level HSN codes
- ✅ **Made in India Badge**: Country of origin display
- ✅ **Grievance Officer Info**: Legal compliance footer
- ✅ **Exchange Policy**: 36-hour exchange window

## 🗄️ Database Schema

The complete database schema is in `supabase-schema.sql`. Key tables:

### Products Table
- Product information (title, description, price)
- Inventory management (stock, variants)
- Images and media
- HSN codes and tax information
- Live/hidden status toggle

### Orders Table
- Complete order lifecycle tracking
- Customer and shipping information
- Payment status (prepaid/COD)
- Shipping status with tracking
- COD verification status
- Tax breakdown (CGST/SGST/IGST)

### Settings Table
- Business configuration
- Shipping settings
- Grievance officer details

## 🔐 Environment Variables

Create `.env.local` file:

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key

# Razorpay
NEXT_PUBLIC_RAZORPAY_KEY_ID=your_razorpay_key_id
RAZORPAY_KEY_SECRET=your_razorpay_key_secret
RAZORPAY_WEBHOOK_SECRET=your_webhook_secret

# Shiprocket
SHIPROCKET_EMAIL=your_shiprocket_email
SHIPROCKET_PASSWORD=your_shiprocket_password

# WhatsApp Business (for COD verification)
NEXT_PUBLIC_WHATSAPP_NUMBER=91XXXXXXXXXX

# Cloudflare Turnstile (optional)
NEXT_PUBLIC_TURNSTILE_SITE_KEY=your_turnstile_site_key
TURNSTILE_SECRET_KEY=your_turnstile_secret_key

# Application
NEXT_PUBLIC_APP_URL=https://your-domain.com
```

## 📦 Installation & Setup

### 1. Clone and Install Dependencies

```bash
cd /home/user/intru-store
npm install
```

### 2. Setup Supabase

1. Create a new project at [supabase.com](https://supabase.com)
2. Run the SQL schema in Supabase SQL Editor:
   ```bash
   # Copy contents of supabase-schema.sql
   # Paste in Supabase SQL Editor and run
   ```
3. Enable Storage bucket for product images:
   - Go to Storage → Create bucket → Name it "products"
   - Set public access policies

### 3. Setup Razorpay

1. Sign up at [razorpay.com](https://razorpay.com)
2. Get your API keys from Dashboard → Settings → API Keys
3. Setup webhook endpoint:
   - URL: `https://your-domain.com/api/webhooks/razorpay`
   - Events: `payment.captured`, `payment.failed`, `refund.created`

### 4. Setup Shiprocket

1. Register at [shiprocket.in](https://shiprocket.in)
2. Add pickup location (warehouse address)
3. Get API credentials from Settings

### 5. Configure WhatsApp Business

1. Get WhatsApp Business number
2. Update `NEXT_PUBLIC_WHATSAPP_NUMBER` in `.env.local`
3. Format: Country code + 10-digit number (e.g., 919876543210)

## 🚀 Development

```bash
# Run development server
npm run dev

# Open http://localhost:3000
```

### Project Structure

```
intru-store/
├── app/
│   ├── (storefront)
│   │   ├── page.tsx              # Home page / Product listing
│   │   ├── products/[id]/        # Product detail page
│   │   ├── cart/                 # Shopping cart
│   │   ├── checkout/             # Checkout flow
│   │   ├── verify-cod/           # COD verification page
│   │   └── order-success/        # Order confirmation
│   ├── admin/
│   │   ├── page.tsx              # Admin dashboard
│   │   ├── products/             # Product management
│   │   └── orders/               # Order management
│   └── api/
│       ├── orders/               # Order creation and verification
│       ├── shipping/             # Shiprocket integration
│       └── webhooks/             # Payment webhooks
├── lib/
│   ├── supabase.ts               # Supabase client
│   ├── types.ts                  # TypeScript types
│   ├── utils.ts                  # Utility functions
│   └── gst.ts                    # GST calculation logic
├── supabase-schema.sql           # Database schema
└── .env.local                    # Environment variables
```

## 🌐 Deployment to Cloudflare Pages

### Option 1: Using Wrangler CLI

```bash
# Install Wrangler
npm install -g wrangler

# Login to Cloudflare
wrangler login

# Build the project
npm run build

# Deploy to Cloudflare Pages
wrangler pages deploy .next --project-name intru-store
```

### Option 2: GitHub Integration

1. Push code to GitHub
2. Go to Cloudflare Dashboard → Pages
3. Connect GitHub repository
4. Configure build settings:
   - **Build command**: `npm run build`
   - **Build output**: `.next`
   - **Framework preset**: Next.js
5. Add environment variables
6. Deploy

### Post-Deployment Steps

1. **Update Environment Variables** in Cloudflare Pages settings
2. **Setup Custom Domain** (optional)
3. **Configure Razorpay Webhook** with production URL
4. **Test Payment Flow** with Razorpay test mode
5. **Test COD Verification** via WhatsApp

## 📊 Admin Dashboard Usage

### Access Admin Panel
Navigate to `https://your-domain.com/admin`

### Product Management

1. **Add New Product**:
   - Click "+ Add Product"
   - Fill in product details (title, price, description)
   - Add HSN code (required for GST)
   - Upload images to Supabase Storage
   - Add size variants with stock quantities
   - Toggle "Live" to make visible on storefront

2. **Edit Existing Product**:
   - Click "Edit" on any product
   - Update details as needed
   - Save changes

3. **Stock Management**:
   - View total stock across all sizes
   - Update individual size stock quantities
   - Products with 0 stock show "Out of Stock"

### Order Management

1. **View Orders**:
   - Dashboard shows all orders with status
   - Filter by payment type (Prepaid/COD)
   - Check verification and shipping status

2. **Process Orders**:
   - **Prepaid Orders**: Automatically marked "Ready to Ship" after payment
   - **COD Orders**: Wait for WhatsApp verification before shipping

3. **Shipping Integration**:
   - Click "Fetch Shipping Rates" to get Shiprocket quotes
   - Select courier (BlueDart, Delhivery, etc.)
   - Create shipment in Shiprocket
   - Track shipment status

## 🧪 Testing

### Test Payment Flow (Razorpay Test Mode)

1. Use Razorpay test keys in `.env.local`
2. Test card: `4111 1111 1111 1111`
3. CVV: Any 3 digits
4. Expiry: Any future date

### Test COD Flow

1. Place COD order
2. Redirected to verification page
3. Click "Verify via WhatsApp"
4. Sends pre-filled message with order ID
5. Admin manually confirms order

### Test GST Calculation

- **Same State Order**: Creates CGST (9%) + SGST (9%)
- **Different State Order**: Creates IGST (18%)
- Verify tax breakdown in order summary

## 🔒 Security Features

- ✅ Row Level Security (RLS) on Supabase
- ✅ Payment signature verification
- ✅ Webhook signature validation
- ✅ Environment variable protection
- ✅ Stock decrement atomic operations (prevents overselling)
- ✅ COD verification via WhatsApp
- ✅ Optional Cloudflare Turnstile bot protection

## 📱 Mobile Responsiveness

- ✅ Mobile-first design approach
- ✅ Touch-friendly UI elements
- ✅ Optimized checkout flow
- ✅ WhatsApp integration for mobile users

## 🔧 Customization Guide

### Update Business Information

Edit `supabase-schema.sql` settings or update via Supabase dashboard:

```sql
UPDATE settings 
SET value = '{
  "name": "Your Brand",
  "email": "support@yourbrand.com",
  "phone": "+91XXXXXXXXXX",
  "address": "Your Address",
  "gstin": "YOUR_GSTIN",
  "state": "Your State",
  "state_code": "XX"
}'::jsonb
WHERE key = 'business_info';
```

### Customize Tax Rates

Edit `lib/gst.ts` to change GST rates:

```typescript
const GST_RATE = 0.18  // Change to your required rate
```

### Customize Shipping Rules

Update shipping logic in `/api/orders/create/route.ts`:

```typescript
const shipping_cost = subtotal > 999 ? 0 : 50  // Free shipping above ₹999
```

## 📞 Support & Contact

For issues or questions about Intru store:
- Email: support@intru.in
- Phone: +91XXXXXXXXXX

## 📄 License

Proprietary - Built for Intru.in

## 🙏 Credits

Built with:
- Next.js
- Supabase
- Razorpay
- Shiprocket
- Tailwind CSS
- Cloudflare Pages

---

**Made in India 🇮🇳**
