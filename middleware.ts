import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export const runtime = 'experimental-edge'; // Required for Cloudflare

export function middleware(request: NextRequest) {
  // 1. Protect Admin Routes
  if (request.nextUrl.pathname.startsWith('/admin')) {
    // Exception: Allow the login page itself
    if (request.nextUrl.pathname === '/admin/login') {
      return NextResponse.next()
    }

    // Check for the "auth_token" cookie
    const token = request.cookies.get('auth_token')

    // If no token, redirect to login
    if (!token || token.value !== process.env.ADMIN_SECRET_KEY) {
      const loginUrl = new URL('/admin/login', request.url)
      return NextResponse.redirect(loginUrl)
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: '/admin/:path*',
}
