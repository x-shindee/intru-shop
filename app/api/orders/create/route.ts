import { NextRequest, NextResponse } from 'next/server'
import Razorpay from 'razorpay'
import { supabaseAdmin } from '@/lib/supabase'
import { calculateOrderTotal } from '@/lib/gst'
import { generateOrderNumber } from '@/lib/utils'

const razorpay = new Razorpay({
  key_id: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID!,
  key_secret: process.env.RAZORPAY_KEY_SECRET!,
})

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const {
      customer_email,
      customer_name,
      customer_phone,
      shipping_address,
      billing_address,
      items,
      payment_type,
    } = body

    // Calculate order totals
    const subtotal = items.reduce(
      (sum: number, item: any) => sum + item.price * item.quantity,
      0
    )

    const shipping_cost = 0 // Free shipping for all orders

    const { taxAmount, taxBreakdown, total } = calculateOrderTotal(
      subtotal,
      shipping_cost,
      shipping_address.state
    )

    // Generate order number
    const order_number = generateOrderNumber()

    if (payment_type === 'prepaid') {
      // Create Razorpay order
      const razorpayOrder = await razorpay.orders.create({
        amount: Math.round(total * 100), // Amount in paise
        currency: 'INR',
        receipt: order_number,
        notes: {
          customer_email,
          customer_name,
        },
      })

      // Create order in database
      const { data: order, error } = await supabaseAdmin
        .from('orders')
        .insert({
          order_number,
          customer_email,
          customer_name,
          customer_phone,
          shipping_address,
          billing_address: billing_address || shipping_address,
          items,
          subtotal,
          shipping_cost,
          tax_amount: taxAmount,
          tax_breakdown: taxBreakdown,
          total_amount: total,
          payment_type,
          payment_status: 'pending',
          razorpay_order_id: razorpayOrder.id,
          shipping_status: 'pending',
          verification_status: 'pending',
        })
        .select()
        .single()

      if (error) throw error

      return NextResponse.json({
        success: true,
        order_id: order.id,
        order_number,
        razorpay_order_id: razorpayOrder.id,
        amount: total,
        currency: 'INR',
      })
    } else {
      // COD order
      const { data: order, error } = await supabaseAdmin
        .from('orders')
        .insert({
          order_number,
          customer_email,
          customer_name,
          customer_phone,
          shipping_address,
          billing_address: billing_address || shipping_address,
          items,
          subtotal,
          shipping_cost,
          tax_amount: taxAmount,
          tax_breakdown: taxBreakdown,
          total_amount: total,
          payment_type,
          payment_status: 'pending',
          shipping_status: 'pending',
          verification_status: 'pending',
        })
        .select()
        .single()

      if (error) throw error

      return NextResponse.json({
        success: true,
        order_id: order.id,
        order_number,
        payment_type: 'cod',
      })
    }
  } catch (error: any) {
    console.error('Create order error:', error)
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    )
  }
}
