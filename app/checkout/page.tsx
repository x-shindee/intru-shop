'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { formatPrice } from '@/lib/utils'
import { calculateOrderTotal } from '@/lib/gst'
import type { CartItem } from '@/lib/types'

declare global {
  interface Window {
    Razorpay: any
  }
}

export default function CheckoutPage() {
  const router = useRouter()
  const [cart, setCart] = useState<CartItem[]>([])
  const [isLoading, setIsLoading] = useState(false)
  
  // Form state
  const [paymentType, setPaymentType] = useState<'prepaid' | 'cod'>('prepaid')
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    line1: '',
    line2: '',
    city: '',
    state: '',
    pincode: '',
  })

  useEffect(() => {
    const cartData = JSON.parse(localStorage.getItem('cart') || '[]')
    if (cartData.length === 0) {
      router.push('/cart')
      return
    }
    setCart(cartData)

    // Load Razorpay script
    const script = document.createElement('script')
    script.src = 'https://checkout.razorpay.com/v1/checkout.js'
    script.async = true
    document.body.appendChild(script)
  }, [router])

  const subtotal = cart.reduce(
    (sum, item) => sum + item.product.price * item.quantity,
    0
  )

  const shipping_cost = 0
  const { taxAmount, taxBreakdown, total } = calculateOrderTotal(
    subtotal,
    shipping_cost,
    formData.state
  )

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      // Prepare order data
      const orderData = {
        customer_email: formData.email,
        customer_name: formData.name,
        customer_phone: formData.phone,
        shipping_address: {
          name: formData.name,
          phone: formData.phone,
          email: formData.email,
          line1: formData.line1,
          line2: formData.line2,
          city: formData.city,
          state: formData.state,
          pincode: formData.pincode,
          country: 'India',
        },
        billing_address: {
          name: formData.name,
          phone: formData.phone,
          email: formData.email,
          line1: formData.line1,
          line2: formData.line2,
          city: formData.city,
          state: formData.state,
          pincode: formData.pincode,
          country: 'India',
        },
        items: cart.map(item => ({
          product_id: item.product.id,
          title: item.product.title,
          size: item.size,
          quantity: item.quantity,
          price: item.product.price,
          image_url: item.product.image_url,
        })),
        payment_type: paymentType,
      }

      // Create order
      const response = await fetch('/api/orders/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(orderData),
      })

      const result = await response.json()

      if (!result.success) {
        throw new Error(result.error || 'Failed to create order')
      }

      if (paymentType === 'prepaid') {
        // Open Razorpay checkout
        const options = {
          key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
          amount: result.amount * 100,
          currency: result.currency,
          name: 'Intru',
          description: 'Order Payment',
          order_id: result.razorpay_order_id,
          handler: async function (response: any) {
            // Verify payment
            const verifyResponse = await fetch('/api/orders/verify-payment', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
                order_id: result.order_id,
              }),
            })

            const verifyResult = await verifyResponse.json()

            if (verifyResult.success) {
              localStorage.removeItem('cart')
              router.push(`/order-success?order_id=${result.order_id}`)
            } else {
              alert('Payment verification failed')
            }
          },
          prefill: {
            name: formData.name,
            email: formData.email,
            contact: formData.phone,
          },
          theme: {
            color: '#000000',
          },
        }

        const razorpay = new window.Razorpay(options)
        razorpay.open()
      } else {
        // COD order - redirect to verification page
        localStorage.removeItem('cart')
        router.push(`/verify-cod?order_id=${result.order_id}&order_number=${result.order_number}`)
      }
    } catch (error: any) {
      console.error('Checkout error:', error)
      alert(error.message || 'Failed to process order')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <nav className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/" className="text-2xl font-bold">
            Intru
          </Link>
        </nav>
      </header>

      <div className="container mx-auto px-4 py-12">
        <h1 className="text-4xl font-bold mb-8">Checkout</h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Checkout Form */}
          <div className="lg:col-span-2">
            <form onSubmit={handleSubmit} className="bg-white rounded-lg p-8 space-y-6">
              {/* Contact Information */}
              <div>
                <h2 className="text-2xl font-semibold mb-4">Contact Information</h2>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">Full Name *</label>
                    <input
                      type="text"
                      required
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent"
                    />
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-2">Email *</label>
                      <input
                        type="email"
                        required
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2">Phone *</label>
                      <input
                        type="tel"
                        required
                        pattern="[0-9]{10}"
                        value={formData.phone}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent"
                        placeholder="10-digit number"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Shipping Address */}
              <div>
                <h2 className="text-2xl font-semibold mb-4">Shipping Address</h2>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">Address Line 1 *</label>
                    <input
                      type="text"
                      required
                      value={formData.line1}
                      onChange={(e) => setFormData({ ...formData, line1: e.target.value })}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Address Line 2</label>
                    <input
                      type="text"
                      value={formData.line2}
                      onChange={(e) => setFormData({ ...formData, line2: e.target.value })}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent"
                    />
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-2">City *</label>
                      <input
                        type="text"
                        required
                        value={formData.city}
                        onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2">State *</label>
                      <input
                        type="text"
                        required
                        value={formData.state}
                        onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2">Pincode *</label>
                      <input
                        type="text"
                        required
                        pattern="[0-9]{6}"
                        value={formData.pincode}
                        onChange={(e) => setFormData({ ...formData, pincode: e.target.value })}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent"
                        placeholder="6-digit pincode"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Payment Method */}
              <div>
                <h2 className="text-2xl font-semibold mb-4">Payment Method</h2>
                <div className="space-y-3">
                  <label className="flex items-center p-4 border-2 border-gray-300 rounded-lg cursor-pointer hover:border-black transition-colors">
                    <input
                      type="radio"
                      name="payment"
                      value="prepaid"
                      checked={paymentType === 'prepaid'}
                      onChange={(e) => setPaymentType(e.target.value as 'prepaid')}
                      className="mr-3"
                    />
                    <div className="flex-1">
                      <span className="font-semibold">Prepaid (UPI/Card/Netbanking)</span>
                      <p className="text-sm text-green-600">✓ FREE Shipping</p>
                    </div>
                  </label>
                  <label className="flex items-center p-4 border-2 border-gray-300 rounded-lg cursor-pointer hover:border-black transition-colors">
                    <input
                      type="radio"
                      name="payment"
                      value="cod"
                      checked={paymentType === 'cod'}
                      onChange={(e) => setPaymentType(e.target.value as 'cod')}
                      className="mr-3"
                    />
                    <div className="flex-1">
                      <span className="font-semibold">Cash on Delivery (COD)</span>
                      <p className="text-sm text-gray-600">Requires WhatsApp verification</p>
                    </div>
                  </label>
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-black text-white py-4 rounded-lg font-semibold hover:bg-gray-800 transition-colors disabled:bg-gray-400"
              >
                {isLoading ? 'Processing...' : paymentType === 'prepaid' ? 'Pay Now' : 'Place COD Order'}
              </button>
            </form>
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg p-6 sticky top-24">
              <h2 className="text-2xl font-bold mb-6">Order Summary</h2>

              <div className="space-y-4 mb-6">
                {cart.map((item, index) => (
                  <div key={index} className="flex gap-3">
                    <div className="text-sm">
                      <p className="font-medium">{item.product.title}</p>
                      <p className="text-gray-600">
                        Size: {item.size} × {item.quantity}
                      </p>
                    </div>
                    <div className="ml-auto font-semibold">
                      {formatPrice(item.product.price * item.quantity)}
                    </div>
                  </div>
                ))}
              </div>

              <div className="border-t pt-4 space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">Subtotal</span>
                  <span className="font-semibold">{formatPrice(subtotal)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Shipping</span>
                  <span className="font-semibold text-green-600">FREE</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">GST (18%)</span>
                  <span className="font-semibold">{formatPrice(taxAmount)}</span>
                </div>
                <div className="text-xs text-gray-500">
                  {taxBreakdown.cgst && taxBreakdown.sgst
                    ? `CGST (9%): ${formatPrice(taxBreakdown.cgst)} + SGST (9%): ${formatPrice(taxBreakdown.sgst)}`
                    : `IGST (18%): ${formatPrice(taxBreakdown.igst || 0)}`}
                </div>
              </div>

              <div className="border-t mt-4 pt-4">
                <div className="flex justify-between text-xl font-bold">
                  <span>Total</span>
                  <span>{formatPrice(total)}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
