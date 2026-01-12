# Intru E-Commerce Platform

A modern, zero-cost e-commerce platform built with Next.js 15, Supabase, and Cloudflare Pages. Premium Indian streetwear brand with full-featured shopping cart, admin panel, and dynamic CMS.

## 🚀 Features

### Customer Features
- ✅ **Product Browsing**: Responsive grid layout with 2 columns mobile, 4 columns desktop
- ✅ **Product Details**: Dynamic pages with SEO metadata, image gallery, size selector
- ✅ **Shopping Cart**: Zustand-powered cart with localStorage persistence
- ✅ **Categories**: Filter by T-Shirts, Shirts, Hoodies
- ✅ **Checkout**: Razorpay payment integration + COD support
- ✅ **SEO Optimized**: Dynamic metadata, sitemap.xml, structured data

### Admin Features
- ✅ **Secure Authentication**: Middleware-protected admin panel with secret key
- ✅ **Product Management**: Full CRUD operations with image upload
- ✅ **Content Pages**: Dynamic CMS for About Us, Privacy Policy, etc.
- ✅ **Order Management**: Track orders, payments, and shipping
- ✅ **Dashboard**: Analytics and quick actions

### Technical Features
- ✅ **Edge Runtime**: All API routes run on Cloudflare Workers
- ✅ **Zero-Cost**: Supabase free tier + Cloudflare Pages
- ✅ **Type Safe**: Full TypeScript coverage
- ✅ **Modern Stack**: Next.js 15 App Router, React 18, Tailwind CSS
- ✅ **State Management**: Zustand for cart, localStorage persistence
- ✅ **Database**: PostgreSQL via Supabase with Row Level Security

## 🛠️ Tech Stack

- **Framework**: Next.js 15 (App Router)
- **Database**: Supabase (PostgreSQL)
- **Styling**: Tailwind CSS
- **State**: Zustand
- **Hosting**: Cloudflare Pages
- **Payments**: Razorpay
- **Images**: Supabase Storage

## 📦 Installation

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
```

## 🔧 Environment Variables

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# Admin Authentication
ADMIN_SECRET_KEY=Kbssol@331

# Razorpay (optional)
NEXT_PUBLIC_RAZORPAY_KEY_ID=rzp_test_key
RAZORPAY_KEY_SECRET=your_secret

# App
NEXT_PUBLIC_APP_URL=https://your-domain.pages.dev
```

## 🗄️ Database Setup

1. **Create Supabase Project**: Sign up at [supabase.com](https://supabase.com)

2. **Run SQL Schema**:
   - Open Supabase SQL Editor
   - Copy content from `supabase-schema-v3-refactored.sql`
   - Execute the script

3. **Create Storage Bucket**:
   - Go to Storage in Supabase dashboard
   - Create bucket named `products`
   - Make it public

4. **Configure RLS**: Row Level Security policies are included in the schema

## 🚀 Deployment

### Cloudflare Pages

1. **Connect Repository**:
   ```bash
   # Push to GitHub
   git push origin main
   ```

2. **Configure Build**:
   - Build command: `npm run pages:build`
   - Build output: `.vercel/output/static`
   - Node version: 22.x

3. **Set Environment Variables**: Add all env vars in Cloudflare Pages settings

4. **Enable nodejs_compat**: 
   - Go to Settings → Functions
   - Add compatibility flag: `nodejs_compat`

5. **Deploy**: Push to main branch triggers auto-deploy

## 📚 Project Structure

```
intru-shop/
├── app/
│   ├── admin/               # Admin panel
│   │   ├── pages/          # CMS pages management
│   │   ├── products/       # Product CRUD
│   │   ├── orders/         # Order management
│   │   └── login/          # Admin authentication
│   ├── api/
│   │   ├── admin/          # Admin API routes
│   │   ├── orders/         # Order processing
│   │   └── config/         # Store configuration
│   ├── cart/               # Shopping cart
│   ├── checkout/           # Checkout flow
│   ├── products/[id]/      # Product details
│   ├── page.tsx            # Homepage
│   ├── layout.tsx          # Root layout
│   └── sitemap.ts          # Dynamic sitemap
├── components/
│   ├── Navbar.tsx          # Navigation with cart count
│   └── Footer.tsx          # Footer with dynamic pages
├── lib/
│   ├── cart-store.ts       # Zustand cart store
│   ├── supabase.ts         # Supabase clients
│   ├── web-crypto.ts       # Web Crypto utilities
│   └── utils.ts            # Helper functions
├── middleware.ts           # Admin authentication
├── next.config.js          # Next.js configuration
├── package.json            # Dependencies
└── supabase-schema-v3-refactored.sql
```

## 🔐 Admin Panel

### Access
- URL: `https://your-domain.pages.dev/admin/login`
- Default Password: `Kbssol@331` (set via `ADMIN_SECRET_KEY`)

### Features
1. **Dashboard**: Overview of products, orders, revenue
2. **Products**: Add, edit, delete products with variants
3. **Pages**: Manage content pages (About, Privacy, etc.)
4. **Orders**: View and manage customer orders
5. **Settings**: Configure store settings

## 🛒 Shopping Cart

- **State Management**: Zustand with localStorage persistence
- **Features**:
  - Add/remove items
  - Update quantities
  - Size variants
  - Stock validation
  - Cart total calculation
  - Persistent across sessions

## 📱 Responsive Design

- **Mobile**: 2-column product grid, hamburger menu
- **Tablet**: 3-column grid, expanded navigation
- **Desktop**: 4-column grid, full navigation

## 🔍 SEO Features

- ✅ Dynamic metadata for products and pages
- ✅ XML sitemap generation
- ✅ Open Graph tags
- ✅ Twitter Card tags
- ✅ Structured data
- ✅ Semantic HTML

## 📊 Performance

- **Edge Runtime**: All API routes on Cloudflare Workers
- **ISR**: Incremental Static Regeneration (60s revalidation)
- **Image Optimization**: Next.js Image component
- **Code Splitting**: Automatic route-based splitting
- **Caching**: Cloudflare CDN caching

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Commit changes: `git commit -m 'Add amazing feature'`
4. Push to branch: `git push origin feature/amazing-feature`
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License.

## 🙏 Acknowledgments

- **Next.js** for the amazing framework
- **Supabase** for the backend infrastructure
- **Cloudflare** for edge hosting
- **Tailwind CSS** for styling

## 📧 Support

For issues or questions:
- GitHub Issues: [Create Issue](https://github.com/x-shindee/intru-shop/issues)
- Email: support@intru.in

## 🎯 Roadmap

- [ ] Customer accounts and order history
- [ ] Product reviews and ratings
- [ ] Wishlist functionality
- [ ] Advanced search and filters
- [ ] Email notifications
- [ ] Multi-currency support
- [ ] Inventory alerts
- [ ] Bulk product import

---

**Built with ❤️ for Intru** | [Live Demo](https://intru-shop.pages.dev) | [Documentation](./docs)
