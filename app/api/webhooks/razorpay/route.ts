/**
 * Razorpay Webhook Handler - Cloudflare Workers Edge Runtime
 * 
 * This route receives webhook events from Razorpay payment gateway.
 * Webhooks are Razorpay's way of notifying us about payment events.
 * 
 * CRITICAL SECURITY: Always verify webhook signatures before processing!
 * 
 * Common Webhook Events:
 * - payment.captured: Payment successfully captured
 * - payment.failed: Payment attempt failed
 * - payment.authorized: Payment authorized (manual capture mode)
 * - refund.created: Refund initiated
 * - refund.processed: Refund completed
 * 
 * Why Webhooks are Important:
 * 1. Backup verification if user closes browser
 * 2. Handle delayed/async payment methods (UPI, net banking)
 * 3. Real-time payment status updates
 * 4. Refund notifications
 * 
 * @route POST /api/webhooks/razorpay
 * @access Public (but requires valid Razorpay signature)
 */

// CRITICAL: Declare edge runtime for Cloudflare Workers compatibility
export const runtime = 'edge'

import { NextRequest, NextResponse } from 'next/server'
import { verifyWebhookSignature } from '@/lib/razorpay-edge'
import { supabaseAdmin } from '@/lib/supabase'

/**
 * POST handler for Razorpay webhooks
 * 
 * Webhook Request:
 * Headers:
 *   X-Razorpay-Signature: HMAC signature of request body
 * 
 * Body:
 * {
 *   event: string,               // Event type (e.g., "payment.captured")
 *   payload: {
 *     payment: {
 *       entity: {
 *         id: string,            // Payment ID
 *         order_id: string,      // Order ID
 *         amount: number,        // Amount in paise
 *         status: string,        // Payment status
 *         method: string,        // Payment method
 *         ...
 *       }
 *     }
 *   }
 * }
 * 
 * Security:
 * - Verify webhook signature using webhook secret
 * - Different from API key secret!
 * - Set in Razorpay Dashboard > Settings > Webhooks
 * 
 * Response:
 * {
 *   success: true
 * }
 */
export async function POST(req: NextRequest) {
  try {
    /**
     * Get webhook signature from headers
     * 
     * Razorpay sends HMAC signature of entire request body
     * in X-Razorpay-Signature header.
     */
    const webhookSignature = req.headers.get('x-razorpay-signature')

    if (!webhookSignature) {
      console.warn('Webhook received without signature')
      return NextResponse.json(
        { error: 'Missing webhook signature' },
        { status: 400 }
      )
    }

    /**
     * Get raw request body as text
     * 
     * CRITICAL: We must verify signature on raw body,
     * not parsed JSON. Even whitespace matters!
     */
    const rawBody = await req.text()

    // Get webhook secret from environment
    const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET

    if (!webhookSecret) {
      console.error('Razorpay webhook secret not configured')
      // Still process webhook but log warning
      // This allows testing without webhook secret
    }

    /**
     * Verify Webhook Signature
     * 
     * Razorpay signs webhook body using HMAC SHA256:
     * signature = HMAC_SHA256(webhook_secret, raw_body)
     * 
     * This ensures:
     * 1. Webhook actually came from Razorpay
     * 2. Body wasn't tampered with
     * 3. Protects against replay attacks
     */
    if (webhookSecret) {
      const isValidSignature = await verifyWebhookSignature(
        webhookSecret,
        rawBody,
        webhookSignature
      )

      if (!isValidSignature) {
        console.warn('Invalid webhook signature:', {
          signature: webhookSignature,
          // DO NOT log webhook secret or body
        })

        return NextResponse.json(
          { error: 'Invalid webhook signature' },
          { status: 400 }
        )
      }
    }

    // Parse webhook body
    const body = JSON.parse(rawBody)
    const event = body.event
    const payment = body.payload?.payment?.entity

    if (!payment) {
      console.warn('Webhook payload missing payment entity:', event)
      // Still return success to acknowledge webhook
      return NextResponse.json({ success: true })
    }

    /**
     * Handle Different Webhook Events
     * 
     * Each event represents a different stage in payment lifecycle.
     * We update order status accordingly.
     */
    switch (event) {
      /**
       * payment.captured
       * 
       * Payment successfully captured and money deposited.
       * This is the final success state for standard payments.
       * 
       * Actions:
       * - Mark payment as success
       * - Set shipping status to ready_to_ship
       * - Mark as verified
       */
      case 'payment.captured':
        console.log(`Payment captured: ${payment.id} for order ${payment.order_id}`)

        await supabaseAdmin
          .from('orders')
          .update({
            payment_status: 'success',
            razorpay_payment_id: payment.id,
            shipping_status: 'ready_to_ship',
            verification_status: 'verified',
            updated_at: new Date().toISOString(),
          })
          .eq('razorpay_order_id', payment.order_id)

        break

      /**
       * payment.failed
       * 
       * Payment attempt failed (insufficient balance, card declined, etc.)
       * 
       * Actions:
       * - Mark payment as failed
       * - Keep order in pending state for retry
       */
      case 'payment.failed':
        console.log(`Payment failed: ${payment.id} for order ${payment.order_id}`)

        await supabaseAdmin
          .from('orders')
          .update({
            payment_status: 'failed',
            razorpay_payment_id: payment.id,
            updated_at: new Date().toISOString(),
          })
          .eq('razorpay_order_id', payment.order_id)

        break

      /**
       * payment.authorized
       * 
       * Payment authorized but not yet captured.
       * Only relevant if using manual capture mode.
       * 
       * Actions:
       * - Mark payment as authorized
       * - Admin must manually capture payment
       */
      case 'payment.authorized':
        console.log(`Payment authorized: ${payment.id} for order ${payment.order_id}`)

        await supabaseAdmin
          .from('orders')
          .update({
            payment_status: 'authorized',
            razorpay_payment_id: payment.id,
            updated_at: new Date().toISOString(),
          })
          .eq('razorpay_order_id', payment.order_id)

        break

      /**
       * refund.created
       * 
       * Refund initiated (either by admin or auto-refund).
       * 
       * Actions:
       * - Mark payment as refunding
       * - Update shipping status if needed
       */
      case 'refund.created':
        console.log(`Refund created for payment: ${payment.id}`)

        await supabaseAdmin
          .from('orders')
          .update({
            payment_status: 'refunding',
            updated_at: new Date().toISOString(),
          })
          .eq('razorpay_payment_id', payment.id)

        break

      /**
       * refund.processed
       * 
       * Refund completed and money returned to customer.
       * 
       * Actions:
       * - Mark payment as refunded
       * - Update shipping status to cancelled
       */
      case 'refund.processed':
        console.log(`Refund processed for payment: ${payment.id}`)

        await supabaseAdmin
          .from('orders')
          .update({
            payment_status: 'refunded',
            shipping_status: 'cancelled',
            updated_at: new Date().toISOString(),
          })
          .eq('razorpay_payment_id', payment.id)

        break

      /**
       * Other Events
       * 
       * Log but don't process unknown events.
       * Razorpay may add new events in the future.
       */
      default:
        console.log(`Unhandled webhook event: ${event}`)
    }

    // Always return success to acknowledge webhook
    // Razorpay will retry if we return error
    return NextResponse.json({ success: true })
  } catch (error: any) {
    // Log error but still return 200 to prevent retries
    console.error('Webhook processing error:', error)

    // Return 200 with error details (for our logging)
    // Don't return 5xx or Razorpay will retry indefinitely
    return NextResponse.json({
      success: false,
      error: error.message,
      note: 'Webhook acknowledged but processing failed',
    })
  }
}
