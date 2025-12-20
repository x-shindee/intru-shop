import { NextRequest, NextResponse } from 'next/server'
import crypto from 'crypto'
import { supabaseAdmin } from '@/lib/supabase'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      order_id,
    } = body

    // Verify signature
    const generatedSignature = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET!)
      .update(`${razorpay_order_id}|${razorpay_payment_id}`)
      .digest('hex')

    if (generatedSignature !== razorpay_signature) {
      return NextResponse.json(
        { success: false, error: 'Invalid signature' },
        { status: 400 }
      )
    }

    // Update order status
    const { data: order, error } = await supabaseAdmin
      .from('orders')
      .update({
        payment_status: 'success',
        razorpay_payment_id,
        razorpay_signature,
        shipping_status: 'ready_to_ship',
        verification_status: 'verified',
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
    console.error('Payment verification error:', error)
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    )
  }
}
