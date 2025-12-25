/**
 * Razorpay API Client for Cloudflare Workers
 * 
 * This module provides a lightweight Razorpay API client that works in
 * Cloudflare Workers edge runtime. It replaces the official razorpay npm
 * package which requires Node.js.
 * 
 * Uses direct REST API calls via fetch() instead of SDK.
 * 
 * @module lib/razorpay-edge
 * @since 1.0.0
 * @license MIT
 * 
 * @see https://razorpay.com/docs/api/
 */

import { createHmacSha256, verifyHmacSha256 } from './web-crypto'

/**
 * Razorpay API configuration
 * 
 * Contains the API credentials needed to authenticate with Razorpay.
 * Key ID is public, Key Secret must be kept secure.
 */
export interface RazorpayConfig {
  /**
   * Razorpay Key ID (starts with rzp_test_ or rzp_live_)
   * This is safe to expose in frontend code
   */
  keyId: string

  /**
   * Razorpay Key Secret
   * MUST be kept secret, only used in backend
   */
  keySecret: string
}

/**
 * Razorpay Order object
 * 
 * Represents an order created in Razorpay system.
 * Used for payment initiation.
 */
export interface RazorpayOrder {
  /**
   * Unique order ID (e.g., "order_abc123")
   */
  id: string

  /**
   * Order amount in smallest currency unit (paise for INR)
   * e.g., 50000 = ₹500.00
   */
  amount: number

  /**
   * Amount paid (after payment completion)
   */
  amount_paid?: number

  /**
   * Amount due (remaining to be paid)
   */
  amount_due?: number

  /**
   * Currency code (e.g., "INR")
   */
  currency: string

  /**
   * Receipt number for your reference
   */
  receipt: string

  /**
   * Order status: "created", "attempted", "paid"
   */
  status: string

  /**
   * Number of payment attempts
   */
  attempts?: number

  /**
   * Additional notes (key-value pairs)
   */
  notes?: Record<string, string>

  /**
   * Unix timestamp when order was created
   */
  created_at?: number
}

/**
 * Razorpay Payment object
 * 
 * Represents a payment made towards an order.
 */
export interface RazorpayPayment {
  /**
   * Unique payment ID (e.g., "pay_abc123")
   */
  id: string

  /**
   * Associated order ID
   */
  order_id: string

  /**
   * Payment amount in smallest currency unit
   */
  amount: number

  /**
   * Currency code
   */
  currency: string

  /**
   * Payment status: "created", "authorized", "captured", "refunded", "failed"
   */
  status: string

  /**
   * Payment method used: "card", "netbanking", "wallet", "upi"
   */
  method: string

  /**
   * Customer email
   */
  email?: string

  /**
   * Customer contact number
   */
  contact?: string

  /**
   * Error details if payment failed
   */
  error_code?: string
  error_description?: string

  /**
   * Unix timestamp when payment was created
   */
  created_at?: number
}

/**
 * Create Razorpay order
 * 
 * Creates a new order in Razorpay system. This order ID is then used
 * to initiate payment from frontend using Razorpay Checkout.
 * 
 * API Endpoint: POST https://api.razorpay.com/v1/orders
 * Authentication: Basic Auth (Key ID + Key Secret)
 * 
 * @param config - Razorpay API credentials
 * @param orderData - Order details
 * @returns Promise resolving to created order object
 * 
 * @throws Error if API call fails
 * 
 * @example
 * ```typescript
 * const order = await createOrder(
 *   { keyId: 'rzp_test_...', keySecret: '...' },
 *   {
 *     amount: 50000, // ₹500.00
 *     currency: 'INR',
 *     receipt: 'order_12345',
 *     notes: { customer_id: '123' }
 *   }
 * )
 * console.log(order.id) // "order_abc123"
 * ```
 */
export async function createOrder(
  config: RazorpayConfig,
  orderData: {
    amount: number
    currency: string
    receipt: string
    notes?: Record<string, string>
  }
): Promise<RazorpayOrder> {
  // Create Basic Auth header
  // Format: Basic base64(key_id:key_secret)
  const authString = `${config.keyId}:${config.keySecret}`
  const authHeader = `Basic ${btoa(authString)}`

  // Make API request
  const response = await fetch('https://api.razorpay.com/v1/orders', {
    method: 'POST',
    headers: {
      'Authorization': authHeader,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(orderData)
  })

  // Handle errors
  if (!response.ok) {
    const error = await response.json()
    throw new Error(`Razorpay API Error: ${error.error?.description || response.statusText}`)
  }

  return response.json()
}

/**
 * Fetch Razorpay order details
 * 
 * Retrieves details of an existing order from Razorpay.
 * Useful for checking order status and payment completion.
 * 
 * API Endpoint: GET https://api.razorpay.com/v1/orders/{id}
 * Authentication: Basic Auth
 * 
 * @param config - Razorpay API credentials
 * @param orderId - Razorpay order ID (e.g., "order_abc123")
 * @returns Promise resolving to order object
 * 
 * @throws Error if order not found or API call fails
 * 
 * @example
 * ```typescript
 * const order = await fetchOrder(config, 'order_abc123')
 * console.log(order.status) // "paid"
 * console.log(order.amount_paid) // 50000
 * ```
 */
export async function fetchOrder(
  config: RazorpayConfig,
  orderId: string
): Promise<RazorpayOrder> {
  const authString = `${config.keyId}:${config.keySecret}`
  const authHeader = `Basic ${btoa(authString)}`

  const response = await fetch(
    `https://api.razorpay.com/v1/orders/${orderId}`,
    {
      method: 'GET',
      headers: {
        'Authorization': authHeader,
        'Content-Type': 'application/json'
      }
    }
  )

  if (!response.ok) {
    const error = await response.json()
    throw new Error(`Razorpay API Error: ${error.error?.description || response.statusText}`)
  }

  return response.json()
}

/**
 * Fetch Razorpay payment details
 * 
 * Retrieves details of a specific payment.
 * 
 * API Endpoint: GET https://api.razorpay.com/v1/payments/{id}
 * Authentication: Basic Auth
 * 
 * @param config - Razorpay API credentials
 * @param paymentId - Razorpay payment ID (e.g., "pay_abc123")
 * @returns Promise resolving to payment object
 * 
 * @throws Error if payment not found or API call fails
 * 
 * @example
 * ```typescript
 * const payment = await fetchPayment(config, 'pay_abc123')
 * console.log(payment.status) // "captured"
 * console.log(payment.method) // "upi"
 * ```
 */
export async function fetchPayment(
  config: RazorpayConfig,
  paymentId: string
): Promise<RazorpayPayment> {
  const authString = `${config.keyId}:${config.keySecret}`
  const authHeader = `Basic ${btoa(authString)}`

  const response = await fetch(
    `https://api.razorpay.com/v1/payments/${paymentId}`,
    {
      method: 'GET',
      headers: {
        'Authorization': authHeader,
        'Content-Type': 'application/json'
      }
    }
  )

  if (!response.ok) {
    const error = await response.json()
    throw new Error(`Razorpay API Error: ${error.error?.description || response.statusText}`)
  }

  return response.json()
}

/**
 * Verify Razorpay payment signature
 * 
 * Verifies the authenticity of a payment by checking its signature.
 * This MUST be done on server-side to ensure payment is genuine.
 * 
 * Razorpay signs payment data using HMAC SHA256 with your key secret.
 * Format: HMAC(key_secret, order_id + "|" + payment_id)
 * 
 * Security:
 * - Never verify signatures on client-side
 * - Always verify before updating order status
 * - Use timing-safe comparison
 * 
 * @param config - Razorpay API credentials
 * @param data - Payment verification data
 * @returns Promise resolving to true if signature is valid, false otherwise
 * 
 * @example
 * ```typescript
 * const isValid = await verifyPaymentSignature(
 *   config,
 *   {
 *     orderId: 'order_abc123',
 *     paymentId: 'pay_xyz789',
 *     signature: 'received_signature_from_razorpay'
 *   }
 * )
 * 
 * if (isValid) {
 *   // Payment is genuine, mark order as paid
 * } else {
 *   // Payment is fraudulent, reject it
 * }
 * ```
 */
export async function verifyPaymentSignature(
  config: RazorpayConfig,
  data: {
    orderId: string
    paymentId: string
    signature: string
  }
): Promise<boolean> {
  // Create the data string that Razorpay signed
  // Format: order_id|payment_id
  const signatureData = `${data.orderId}|${data.paymentId}`

  // Verify signature using HMAC SHA256
  return verifyHmacSha256(config.keySecret, signatureData, data.signature)
}

/**
 * Verify Razorpay webhook signature
 * 
 * Verifies that a webhook request actually came from Razorpay.
 * Razorpay signs webhook body using HMAC SHA256 with webhook secret.
 * 
 * Webhook secret is different from key secret!
 * You set it in Razorpay Dashboard > Settings > Webhooks
 * 
 * Security:
 * - Always verify webhooks before processing
 * - Use different secret for webhooks
 * - Reject requests with invalid signatures
 * 
 * @param webhookSecret - Webhook secret from Razorpay Dashboard
 * @param body - Raw webhook request body (as string)
 * @param signature - X-Razorpay-Signature header value
 * @returns Promise resolving to true if signature is valid, false otherwise
 * 
 * @example
 * ```typescript
 * // In webhook route:
 * const body = await request.text()
 * const signature = request.headers.get('X-Razorpay-Signature') || ''
 * 
 * const isValid = await verifyWebhookSignature(
 *   process.env.RAZORPAY_WEBHOOK_SECRET!,
 *   body,
 *   signature
 * )
 * 
 * if (!isValid) {
 *   return new Response('Invalid signature', { status: 400 })
 * }
 * 
 * // Process webhook...
 * ```
 */
export async function verifyWebhookSignature(
  webhookSecret: string,
  body: string,
  signature: string
): Promise<boolean> {
  return verifyHmacSha256(webhookSecret, body, signature)
}

/**
 * Capture payment
 * 
 * Captures an authorized payment. Only needed if you use
 * manual capture mode (payment.capture = 'manual').
 * 
 * API Endpoint: POST https://api.razorpay.com/v1/payments/{id}/capture
 * Authentication: Basic Auth
 * 
 * @param config - Razorpay API credentials
 * @param paymentId - Payment ID to capture
 * @param amount - Amount to capture (in smallest currency unit)
 * @param currency - Currency code (e.g., "INR")
 * @returns Promise resolving to updated payment object
 * 
 * @throws Error if capture fails
 * 
 * @example
 * ```typescript
 * const payment = await capturePayment(
 *   config,
 *   'pay_abc123',
 *   50000, // ₹500.00
 *   'INR'
 * )
 * console.log(payment.status) // "captured"
 * ```
 */
export async function capturePayment(
  config: RazorpayConfig,
  paymentId: string,
  amount: number,
  currency: string = 'INR'
): Promise<RazorpayPayment> {
  const authString = `${config.keyId}:${config.keySecret}`
  const authHeader = `Basic ${btoa(authString)}`

  const response = await fetch(
    `https://api.razorpay.com/v1/payments/${paymentId}/capture`,
    {
      method: 'POST',
      headers: {
        'Authorization': authHeader,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ amount, currency })
    }
  )

  if (!response.ok) {
    const error = await response.json()
    throw new Error(`Razorpay API Error: ${error.error?.description || response.statusText}`)
  }

  return response.json()
}
