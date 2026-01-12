/**
 * API Route: Content Page Operations
 * GET /api/admin/pages/[id] - Get page
 * PATCH /api/admin/pages/[id] - Update page
 * DELETE /api/admin/pages/[id] - Delete page
 */

export const runtime = 'edge'

import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const pageId = params.id

    const { data: page, error } = await supabaseAdmin
      .from('content_pages')
      .select('*')
      .eq('id', pageId)
      .single()

    if (error || !page) {
      return NextResponse.json(
        { success: false, error: 'Page not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      page
    })
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    )
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const pageId = params.id
    const body = await req.json()

    const { data: page, error } = await supabaseAdmin
      .from('content_pages')
      .update({
        ...body,
        updated_at: new Date().toISOString()
      })
      .eq('id', pageId)
      .select()
      .single()

    if (error) {
      console.error('Database error:', error)
      throw new Error('Failed to update page')
    }

    return NextResponse.json({
      success: true,
      page
    })
  } catch (error: any) {
    console.error('Update page error:', error)
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    )
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const pageId = params.id

    const { error } = await supabaseAdmin
      .from('content_pages')
      .delete()
      .eq('id', pageId)

    if (error) {
      console.error('Database error:', error)
      throw new Error('Failed to delete page')
    }

    return NextResponse.json({
      success: true
    })
  } catch (error: any) {
    console.error('Delete page error:', error)
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    )
  }
}
