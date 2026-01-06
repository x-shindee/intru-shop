/**
 * API Route: Admin Login
 * POST /api/admin/auth/login
 */

export const runtime = 'edge'

import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'
import { createHmacSha256 } from '@/lib/web-crypto'

export async function POST(req: NextRequest) {
  try {
    const { email, password } = await req.json()

    if (!email || !password) {
      return NextResponse.json(
        { success: false, error: 'Email and password required' },
        { status: 400 }
      )
    }

    // Get admin user from database
    const { data: admin, error } = await supabaseAdmin
      .from('admin_users')
      .select('*')
      .eq('email', email.toLowerCase())
      .eq('is_active', true)
      .single()

    if (error || !admin) {
      return NextResponse.json(
        { success: false, error: 'Invalid credentials' },
        { status: 401 }
      )
    }

    // Hash the provided password and compare
    const hashedPassword = await createHmacSha256(
      process.env.ADMIN_PASSWORD_SECRET || 'default-secret-change-in-production',
      password
    )

    if (hashedPassword !== admin.password_hash) {
      return NextResponse.json(
        { success: false, error: 'Invalid credentials' },
        { status: 401 }
      )
    }

    // Create a simple token (in production, use JWT)
    const token = await createHmacSha256(
      process.env.ADMIN_SESSION_SECRET || 'default-session-secret',
      `${admin.id}-${admin.email}-${Date.now()}`
    )

    // Update last login
    await supabaseAdmin
      .from('admin_users')
      .update({ last_login_at: new Date().toISOString() })
      .eq('id', admin.id)

    return NextResponse.json({
      success: true,
      token,
      admin: {
        id: admin.id,
        email: admin.email,
        role: admin.role
      }
    })
  } catch (error: any) {
    console.error('Login error:', error)
    return NextResponse.json(
      { success: false, error: 'Login failed' },
      { status: 500 }
    )
  }
}
