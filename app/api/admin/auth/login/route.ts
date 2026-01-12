/**
 * API Route: Admin Login
 * POST /api/admin/auth/login
 * Verifies admin password against ADMIN_SECRET_KEY
 */

export const runtime = 'edge'

import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'

export async function POST(req: NextRequest) {
  try {
    const { password } = await req.json()

    if (!password) {
      return NextResponse.json(
        { success: false, error: 'Password is required' },
        { status: 400 }
      )
    }

    // Get admin secret key from environment or use default
    const adminSecretKey = process.env.ADMIN_SECRET_KEY || 'Kbssol@331'

    // Verify password
    if (password !== adminSecretKey) {
      return NextResponse.json(
        { success: false, error: 'Invalid password' },
        { status: 401 }
      )
    }

    // Create response
    const response = NextResponse.json({
      success: true,
      message: 'Login successful'
    })

    // Set admin session cookie
    response.cookies.set({
      name: 'admin_session',
      value: adminSecretKey,
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7, // 7 days
      path: '/'
    })

    return response
  } catch (error: any) {
    console.error('Login error:', error)
    return NextResponse.json(
      { success: false, error: 'Login failed' },
      { status: 500 }
    )
  }
}

// Logout endpoint
export async function DELETE(req: NextRequest) {
  const response = NextResponse.json({
    success: true,
    message: 'Logged out successfully'
  })

  response.cookies.delete('admin_session')

  return response
}
