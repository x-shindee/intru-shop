/**
 * Order Creation API Route - Cloudflare Workers Edge Runtime
 * 
 * This route handles the creation of new orders in the system.
 * It supports both prepaid (Razorpay) and COD payment methods.
 * 
 * Flow:
 * 1. Receive order data from frontend
 * 2. Calculate order totals (subtotal, tax, shipping)
 * 3. For prepaid: Create Razorpay order
 * 4. Save order to Supabase database
 * 5. Return order details to frontend
 * 
 * Edge Runtime: This route runs on Cloudflare Workers edge network
 * for global low-latency performance.
 * 
 * @route POST /api/orders/create
 * @access Public (but should validate Turnstile token in production)
 */

// CRITICAL: Declare edge runtime for Cloudflare Workers compatibility
export const runtime = 'edge'

import { NextRequest, NextResponse } from 'next/server'
import { createOrder as createRazorpayOrder } from '@/lib/razorpay-edge'
import { supabaseAdmin } from '@/lib/supabase'
import { calculateOrderTotal } from '@/lib/gst'
import { generateOrderNumber } from '@/lib/utils'

/**
 * POST handler for order creation
 * 
 * Request Body:
 * {
 *   customer_email: string,
 *   customer_name: string,
 *   customer_phone: string,
 *   shipping_address: {
 *     line1: string,
 *     line2?: string,
 *     city: string,
 *     state: string,
 *     pincode: string
 *   },
 *   billing_address?: { same as shipping_address },
 *   items: Array<{
 *     product_id: string,
 *     title: string,
 *     price: number,
 *     quantity: number,
 *     variant?: string
 *   }>,
 *   payment_type: 'prepaid' | 'cod'
 * }
 * 
 * Response (Prepaid):
 * {
 *   success: true,
 *   order_id: number,
 *   order_number: string,
 *   razorpay_order_id: string,
 *   amount: number,
 *   currency: 'INR'
 * }
 * 
 * Response (COD):
 * {
 *   success: true,
 *   order_id: number,
 *   order_number: string,
 *   payment_type: 'cod'
 * }
 * 
 * Error Response:
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
      customer_email,
      customer_name,
      customer_phone,
      shipping_address,
      billing_address,
      items,
      payment_type,
    } = body

    // Validate required fields
    if (!customer_email || !customer_name || !customer_phone) {
      return NextResponse.json(
        { success: false, error: 'Missing required customer information' },
        { status: 400 }
      )
    }

    if (!shipping_address || !shipping_address.state || !shipping_address.pincode) {
      return NextResponse.json(
        { success: false, error: 'Missing required shipping address' },
        { status: 400 }
      )
    }

    if (!items || items.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Order must contain at least one item' },
        { status: 400 }
      )
    }

    if (!payment_type || !['prepaid', 'cod'].includes(payment_type)) {
      return NextResponse.json(
        { success: false, error: 'Invalid payment type' },
        { status: 400 }
      )
    }

    /**
     * Calculate order totals
     * 
     * Subtotal: Sum of (item price × quantity) for all items
     * Shipping: Currently free (₹0)
     * Tax: Calculated based on customer state (CGST+SGST or IGST)
     * Total: Subtotal + Shipping + Tax
     */
    const subtotal = items.reduce(
      (sum: number, item: any) => sum + item.price * item.quantity,
      0
    )

    // Free shipping for all orders
    const shipping_cost = 0

    // Calculate GST based on delivery state
    const { taxAmount, taxBreakdown, total } = calculateOrderTotal(
      subtotal,
      shipping_cost,
      shipping_address.state
    )

    // Generate unique order number
    const order_number = generateOrderNumber()

    /**
     * Handle prepaid payment flow
     * 
     * 1. Create order in Razorpay system
     * 2. Save order to database with razorpay_order_id
     * 3. Return Razorpay order details for frontend checkout
     */
    if (payment_type === 'prepaid') {
      // Get Razorpay credentials from environment
      const razorpayConfig = {
        keyId: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID!,
        keySecret: process.env.RAZORPAY_KEY_SECRET!,
      }

      // Validate credentials
      if (!razorpayConfig.keyId || !razorpayConfig.keySecret) {
        console.error('Razorpay credentials missing')
        return NextResponse.json(
          { success: false, error: 'Payment gateway not configured' },
          { status: 500 }
        )
      }

      /**
       * Create Razorpay order
       * 
       * Amount: In paise (₹1 = 100 paise)
       * Currency: INR (Indian Rupees)
       * Receipt: Our internal order number for reference
       * Notes: Additional metadata for tracking
       */
      const razorpayOrder = await createRazorpayOrder(razorpayConfig, {
        amount: Math.round(total * 100), // Convert to paise
        currency: 'INR',
        receipt: order_number,
        notes: {
          customer_email,
          customer_name,
        },
      })

      /**
       * Save order to database
       * 
       * Status flow for prepaid orders:
       * payment_status: pending → paid (after payment verification)
       * verification_status: pending (N/A for prepaid)
       * shipping_status: pending → ready_to_ship → shipped → delivered
       */
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

      if (error) {
        console.error('Database error:', error)
        throw new Error('Failed to create order in database')
      }

      // Return Razorpay order details for frontend checkout
      return NextResponse.json({
        success: true,
        order_id: order.id,
        order_number,
        razorpay_order_id: razorpayOrder.id,
        amount: total,
        currency: 'INR',
      })
    } else {
      /**
       * Handle COD (Cash on Delivery) flow
       * 
       * 1. Save order directly to database
       * 2. No payment gateway involved
       * 3. Requires manual verification via WhatsApp
       */
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
          verification_status: 'pending', // Must be verified via WhatsApp
        })
        .select()
        .single()

      if (error) {
        console.error('Database error:', error)
        throw new Error('Failed to create order in database')
      }

      // Return order details for COD verification page
      return NextResponse.json({
        success: true,
        order_id: order.id,
        order_number,
        payment_type: 'cod',
      })
    }
  } catch (error: any) {
    // Log error for debugging
    console.error('Create order error:', error)

    // Return user-friendly error message
    return NextResponse.json(
      {
        success: false,
        error: error.message || 'Failed to create order. Please try again.',
      },
      { status: 500 }
    )
  }
}
