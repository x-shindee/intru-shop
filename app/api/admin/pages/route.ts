/**
 * API Route: Content Pages Management
 * POST /api/admin/pages - Create page
 * GET /api/admin/pages - Get all pages
 */

export const runtime = 'edge'

import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const {
      title,
      slug,
      content,
      meta_description,
      is_published
    } = body

    // Validate required fields
    if (!title || !slug || !content) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Insert page
    const { data: page, error } = await supabaseAdmin
      .from('content_pages')
      .insert({
        title,
        slug,
        content,
        meta_description: meta_description || null,
        is_published: is_published !== undefined ? is_published : false
      })
      .select()
      .single()

    if (error) {
      console.error('Database error:', error)
      throw new Error('Failed to create page')
    }

    return NextResponse.json({
      success: true,
      page
    })
  } catch (error: any) {
    console.error('Create page error:', error)
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    )
  }
}

export async function GET(req: NextRequest) {
  try {
    const { data: pages, error } = await supabaseAdmin
      .from('content_pages')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) {
      throw new Error('Failed to fetch pages')
    }

    return NextResponse.json({
      success: true,
      pages: pages || []
    })
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    )
  }
}
