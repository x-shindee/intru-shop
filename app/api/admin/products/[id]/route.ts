/**
 * API Route: Update/Delete Product
 * PUT /api/admin/products/[id]
 * DELETE /api/admin/products/[id]
 */

export const runtime = 'edge'

import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const productId = params.id

    const { data: product, error } = await supabaseAdmin
      .from('products')
      .select('*')
      .eq('id', productId)
      .single()

    if (error || !product) {
      return NextResponse.json(
        { success: false, error: 'Product not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      product
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
    const productId = params.id
    const body = await req.json()

    // Update product
    const { data: product, error } = await supabaseAdmin
      .from('products')
      .update({
        ...body,
        price: body.price ? parseFloat(body.price) : undefined,
        compare_at_price: body.compare_at_price ? parseFloat(body.compare_at_price) : undefined,
        stock: body.stock ? parseInt(body.stock) : undefined,
        updated_at: new Date().toISOString()
      })
      .eq('id', productId)
      .select()
      .single()

    if (error) {
      console.error('Database error:', error)
      throw new Error('Failed to update product')
    }

    return NextResponse.json({
      success: true,
      product
    })
  } catch (error: any) {
    console.error('Update product error:', error)
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    )
  }
}

export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const productId = params.id
    const body = await req.json()

    // Update product
    const { data: product, error } = await supabaseAdmin
      .from('products')
      .update({
        ...body,
        price: body.price ? parseFloat(body.price) : undefined,
        compare_at_price: body.compare_at_price ? parseFloat(body.compare_at_price) : undefined,
        stock: body.stock ? parseInt(body.stock) : undefined,
        updated_at: new Date().toISOString()
      })
      .eq('id', productId)
      .select()
      .single()

    if (error) {
      console.error('Database error:', error)
      throw new Error('Failed to update product')
    }

    return NextResponse.json({
      success: true,
      product
    })
  } catch (error: any) {
    console.error('Update product error:', error)
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
    const productId = params.id

    // Delete product
    const { error } = await supabaseAdmin
      .from('products')
      .delete()
      .eq('id', productId)

    if (error) {
      console.error('Database error:', error)
      throw new Error('Failed to delete product')
    }

    return NextResponse.json({
      success: true
    })
  } catch (error: any) {
    console.error('Delete product error:', error)
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    )
  }
}
