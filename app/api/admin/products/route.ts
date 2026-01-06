/**
 * API Route: Create Product
 * POST /api/admin/products
 */

export const runtime = 'edge'

import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const {
      title,
      description,
      price,
      compare_at_price,
      stock,
      hsn_code,
      image_url,
      images,
      variants,
      material,
      fit,
      care_instructions,
      is_live
    } = body

    // Validate required fields
    if (!title || !price || !stock || !hsn_code) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Insert product
    const { data: product, error } = await supabaseAdmin
      .from('products')
      .insert({
        title,
        description,
        price: parseFloat(price),
        compare_at_price: compare_at_price ? parseFloat(compare_at_price) : null,
        stock: parseInt(stock),
        hsn_code,
        image_url: image_url || null,
        images: images || [],
        variants: variants || [],
        material: material || null,
        fit: fit || null,
        care_instructions: care_instructions || null,
        country_of_origin: 'India',
        is_live: is_live !== undefined ? is_live : false
      })
      .select()
      .single()

    if (error) {
      console.error('Database error:', error)
      throw new Error('Failed to create product')
    }

    return NextResponse.json({
      success: true,
      product
    })
  } catch (error: any) {
    console.error('Create product error:', error)
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    )
  }
}
