/**
 * Payment Verification API Route - Cloudflare Workers Edge Runtime
 * 
 * This route verifies Razorpay payment signatures and updates order status.
 * 
 * CRITICAL SECURITY: This route MUST verify payment signatures before
 * marking orders as paid. Never trust frontend payment status!
 * 
 * Flow:
 * 1. Receive payment details from Razorpay checkout
 * 2. Verify signature using HMAC SHA256
 * 3. Update order status in database
 * 4. Decrement product stock
 * 5. Return verification result
 * 
 * Why Signature Verification is Critical:
 * - Prevents fraudulent payment confirmations
 * - Ensures payment actually succeeded on Razorpay
 * - Protects against man-in-the-middle attacks
 * - Required by PCI DSS compliance
 * 
 * @route POST /api/orders/verify-payment
 * @access Public (but requires valid Razorpay signature)
 */

// CRITICAL: Declare edge runtime for Cloudflare Workers compatibility
export const runtime = 'edge'

import { NextRequest, NextResponse } from 'next/server'
import { verifyPaymentSignature } from '@/lib/razorpay-edge'
import { supabaseAdmin } from '@/lib/supabase'

/**
 * POST handler for payment verification
 * 
 * Request Body:
 * {
 *   razorpay_order_id: string,    // Order ID from Razorpay
 *   razorpay_payment_id: string,   // Payment ID from Razorpay
 *   razorpay_signature: string,    // Signature to verify
 *   order_id: number               // Our internal order ID
 * }
 * 
 * Signature Verification Process:
 * 1. Razorpay creates: HMAC(key_secret, "order_id|payment_id")
 * 2. We recreate the same HMAC using our key_secret
 * 3. Compare signatures using timing-safe comparison
 * 4. If match: Payment is genuine
 * 5. If no match: Payment is fraudulent
 * 
 * Response (Success):
 * {
 *   success: true,
 *   order: { ...order details }
 * }
 * 
 * Response (Invalid Signature):
 * {
 *   success: false,
 *   error: 'Invalid signature'
 * }
 * 
 * Response (Error):
 * {
 *   success: false,
 *   error: string
 * }
 */
export async function POST(req: NextRequest) {
  try {
    // Parse request body
    const body = await req.json()
    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      order_id,
    } = body

    // Validate required fields
    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature || !order_id) {
      return NextResponse.json(
        { success: false, error: 'Missing required payment details' },
        { status: 400 }
      )
    }

    // Get Razorpay credentials from environment
    const razorpayConfig = {
      keyId: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID!,
      keySecret: process.env.RAZORPAY_KEY_SECRET!,
    }

    // Validate credentials
    if (!razorpayConfig.keySecret) {
      console.error('Razorpay key secret missing')
      return NextResponse.json(
        { success: false, error: 'Payment verification not configured' },
        { status: 500 }
      )
    }

    /**
     * Verify Payment Signature
     * 
     * This is the MOST CRITICAL security check!
     * 
     * Razorpay signs payment data using HMAC SHA256:
     * signature = HMAC_SHA256(key_secret, order_id + "|" + payment_id)
     * 
     * We verify by:
     * 1. Creating the same HMAC using our key_secret
     * 2. Comparing with received signature
     * 3. Using timing-safe comparison to prevent timing attacks
     * 
     * If signatures match: Payment is genuine from Razorpay
     * If signatures don't match: Payment is fraudulent or tampered
     */
    const isValidSignature = await verifyPaymentSignature(razorpayConfig, {
      orderId: razorpay_order_id,
      paymentId: razorpay_payment_id,
      signature: razorpay_signature,
    })

    // Reject fraudulent payments
    if (!isValidSignature) {
      console.warn('Invalid payment signature detected:', {
        order_id,
        razorpay_order_id,
        razorpay_payment_id,
        // DO NOT log the signature for security
      })

      return NextResponse.json(
        { success: false, error: 'Invalid payment signature' },
        { status: 400 }
      )
    }

    /**
     * Update Order Status
     * 
     * Only after signature verification succeeds, we:
     * 1. Mark payment as successful
     * 2. Store Razorpay payment ID and signature
     * 3. Change shipping status to "ready_to_ship"
     * 4. Mark verification as complete
     * 
     * Status transitions:
     * payment_status: pending → success
     * shipping_status: pending → ready_to_ship
     * verification_status: pending → verified
     */
    const { data: order, error } = await supabaseAdmin
      .from('orders')
      .update({
        payment_status: 'success',
        razorpay_payment_id,
        razorpay_signature,
        shipping_status: 'ready_to_ship',
        verification_status: 'verified',
        updated_at: new Date().toISOString(),
      })
      .eq('id', order_id)
      .select()
      .single()

    if (error) {
      console.error('Database update error:', error)
      throw new Error('Failed to update order status')
    }

    if (!order) {
      return NextResponse.json(
        { success: false, error: 'Order not found' },
        { status: 404 }
      )
    }

    /**
     * Decrement Product Stock
     * 
     * After payment verification, we reduce inventory for each item.
     * This prevents overselling and maintains accurate stock levels.
     * 
     * Note: This uses a Postgres RPC function for atomic stock updates
     * to prevent race conditions when multiple orders happen simultaneously.
     * 
     * If stock decrement fails, order is still marked as paid
     * (money received is priority), but admin should be notified.
     */
    try {
      for (const item of order.items) {
        // Check if RPC function exists (for backward compatibility)
        if (item.size) {
          await supabaseAdmin.rpc('decrement_product_stock', {
            product_id: item.product_id,
            size_param: item.size,
            quantity: item.quantity,
          })
        } else {
          // Fallback: Direct stock update (not atomic, use RPC in production)
          await supabaseAdmin
            .from('products')
            .update({
              stock: supabaseAdmin.raw('stock - ?', [item.quantity]),
            })
            .eq('id', item.product_id)
        }
      }
    } catch (stockError: any) {
      // Log but don't fail the payment verification
      // Money is received, so order must be marked as paid
      console.error('Stock decrement error:', stockError)
      // TODO: Send alert to admin about stock sync issue
    }

    // Return success with order details
    return NextResponse.json({
      success: true,
      order,
    })
  } catch (error: any) {
    // Log error for debugging
    console.error('Payment verification error:', error)

    // Return user-friendly error message
    return NextResponse.json(
      {
        success: false,
        error: error.message || 'Payment verification failed. Please contact support.',
      },
      { status: 500 }
    )
  }
}
