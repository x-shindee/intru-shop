/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
      },
      {
        protocol: 'https',
        hostname: '*.supabase.co', // Allow Supabase images
      }
    ],
    unoptimized: true, // Crucial for Cloudflare Pages free tier
  },
};

module.exports = nextConfig;
