export const runtime = 'edge';

import { NextRequest, NextResponse } from 'next/server'
import crypto from 'crypto'
import { supabaseAdmin } from '@/lib/supabase'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    
    // Verify webhook signature
    const webhookSignature = req.headers.get('x-razorpay-signature')
    const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET

    if (webhookSecret && webhookSignature) {
      const generatedSignature = crypto
        .createHmac('sha256', webhookSecret)
        .update(JSON.stringify(body))
        .digest('hex')

      if (generatedSignature !== webhookSignature) {
        return NextResponse.json(
          { error: 'Invalid signature' },
          { status: 400 }
        )
      }
    }

    const event = body.event
    const payment = body.payload.payment.entity

    // Handle different webhook events
    switch (event) {
      case 'payment.captured':
        await supabaseAdmin
          .from('orders')
          .update({
            payment_status: 'success',
            shipping_status: 'ready_to_ship',
            verification_status: 'verified',
          })
          .eq('razorpay_order_id', payment.order_id)
        break

      case 'payment.failed':
        await supabaseAdmin
          .from('orders')
          .update({
            payment_status: 'failed',
          })
          .eq('razorpay_order_id', payment.order_id)
        break

      case 'refund.created':
        await supabaseAdmin
          .from('orders')
          .update({
            payment_status: 'refunded',
          })
          .eq('razorpay_payment_id', payment.id)
        break
    }

    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error('Webhook error:', error)
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    )
  }
}
