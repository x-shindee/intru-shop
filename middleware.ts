import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

// Required for Cloudflare Pages
export const runtime = 'experimental-edge';

export function middleware(request: NextRequest) {
  // 1. Protect Admin Routes
  if (request.nextUrl.pathname.startsWith('/admin')) {
    
    // Exception: Allow the login page itself to be visible
    if (request.nextUrl.pathname === '/admin/login') {
      return NextResponse.next()
    }

    // --- CRITICAL FIX: Match the cookie name from your route.ts ---
    const sessionCookie = request.cookies.get('admin_session')
    
    // Get the secret (Fallback to default if env var is missing on Edge)
    const adminSecret = process.env.ADMIN_SECRET_KEY || 'Kbssol@331'

    // Validation: If no cookie, or cookie value doesn't match secret
    if (!sessionCookie || sessionCookie.value !== adminSecret) {
      // Redirect unauthenticated users to the login page
      const loginUrl = new URL('/admin/login', request.url)
      return NextResponse.redirect(loginUrl)
    }
  }

  return NextResponse.next()
}

// Apply this middleware only to admin routes to save performance
export const config = {
  matcher: '/admin/:path*',
}
