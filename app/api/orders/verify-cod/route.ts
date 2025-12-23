export const runtime = 'edge';

import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { order_id } = body

    // Update verification status
    const { data: order, error } = await supabaseAdmin
      .from('orders')
      .update({
        verification_status: 'verified',
        verified_at: new Date().toISOString(),
        shipping_status: 'ready_to_ship',
      })
      .eq('id', order_id)
      .select()
      .single()

    if (error) throw error

    // Decrement stock for each item
    for (const item of order.items) {
      await supabaseAdmin.rpc('decrement_product_stock', {
        product_id: item.product_id,
        size_param: item.size,
        quantity: item.quantity,
      })
    }

    return NextResponse.json({
      success: true,
      order,
    })
  } catch (error: any) {
    console.error('COD verification error:', error)
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    )
  }
}
