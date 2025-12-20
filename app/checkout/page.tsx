'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { formatPrice } from '@/lib/utils'
import type { CartItem, StoreConfig, CustomCharge } from '@/lib/types'

declare global {
  interface Window {
    Razorpay: any
  }
}

export default function CheckoutPage() {
  const router = useRouter()
  const [cart, setCart] = useState<CartItem[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [storeConfig, setStoreConfig] = useState<StoreConfig | null>(null)
  const [isCODAllowed, setIsCODAllowed] = useState(true)
  const [referralCode, setReferralCode] = useState('')
  const [referralDiscount, setReferralDiscount] = useState(0)
  const [referralError, setReferralError] = useState('')
  
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

    // Fetch store config
    fetchStoreConfig()

    // Load Razorpay script
    const script = document.createElement('script')
    script.src = 'https://checkout.razorpay.com/v1/checkout.js'
    script.async = true
    document.body.appendChild(script)
  }, [router])

  const fetchStoreConfig = async () => {
    try {
      const response = await fetch('/api/config/store')
      const data = await response.json()
      setStoreConfig(data.config)
    } catch (error) {
      console.error('Failed to fetch store config:', error)
    }
  }

  const checkPincodeForCOD = async (pincode: string) => {
    if (!pincode || pincode.length !== 6) return

    try {
      const response = await fetch(`/api/config/check-pincode?pincode=${pincode}`)
      const data = await response.json()
      setIsCODAllowed(!data.blocked)
      
      if (data.blocked && paymentType === 'cod') {
        setPaymentType('prepaid')
      }
    } catch (error) {
      console.error('Failed to check pincode:', error)
    }
  }

  const applyReferralCode = async () => {
    if (!referralCode) return

    setReferralError('')
    const subtotal = cart.reduce((sum, item) => sum + item.product.price * item.quantity, 0)

    try {
      const response = await fetch('/api/referral/validate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: referralCode, orderAmount: subtotal }),
      })

      const data = await response.json()

      if (data.valid) {
        setReferralDiscount(data.discount_amount)
      } else {
        setReferralError(data.error || 'Invalid referral code')
        setReferralDiscount(0)
      }
    } catch (error) {
      setReferralError('Failed to apply referral code')
      setReferralDiscount(0)
    }
  }

  // Calculate totals
  const subtotal = cart.reduce((sum, item) => sum + item.product.price * item.quantity, 0)
  const savings = cart.reduce((sum, item) => {
    const savings = item.product.compare_at_price 
      ? (item.product.compare_at_price - item.product.price) * item.quantity
      : 0
    return sum + savings
  }, 0)

  const shipping_cost = storeConfig?.free_shipping_enabled ? 0 : (storeConfig?.default_shipping_cost || 0)
  
  // Custom charges (only show if enabled)
  const customCharges: CustomCharge[] = storeConfig?.extra_charges_enabled ? (storeConfig.custom_charges || []) : []
  const customChargesTotal = customCharges.reduce((sum, charge) => sum + charge.amount, 0)

  // Calculate tax (18% GST)
  const amountBeforeTax = subtotal - referralDiscount + shipping_cost + customChargesTotal
  const taxAmount = amountBeforeTax * 0.18
  const total = amountBeforeTax + taxAmount

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
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
        referral_code: referralCode || null,
        custom_charges: customCharges,
      }

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
        const options = {
          key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
          amount: result.amount * 100,
          currency: result.currency,
          name: 'Intru',
          description: 'Order Payment',
          order_id: result.razorpay_order_id,
          handler: async function (response: any) {
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
                        onChange={(e) => {
                          setFormData({ ...formData, pincode: e.target.value })
                          if (e.target.value.length === 6) {
                            checkPincodeForCOD(e.target.value)
                          }
                        }}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent"
                        placeholder="6-digit"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Referral Code (only show if enabled) */}
              {storeConfig?.is_referral_enabled && (
                <div>
                  <h2 className="text-2xl font-semibold mb-4">Have a Referral Code?</h2>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={referralCode}
                      onChange={(e) => setReferralCode(e.target.value.toUpperCase())}
                      placeholder="Enter code"
                      className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent"
                    />
                    <button
                      type="button"
                      onClick={applyReferralCode}
                      className="px-6 py-3 bg-gray-800 text-white rounded-lg hover:bg-gray-700"
                    >
                      Apply
                    </button>
                  </div>
                  {referralError && (
                    <p className="text-red-500 text-sm mt-2">{referralError}</p>
                  )}
                  {referralDiscount > 0 && (
                    <p className="text-green-600 text-sm mt-2">
                      ✓ Referral discount applied: {formatPrice(referralDiscount)}
                    </p>
                  )}
                </div>
              )}

              {/* Payment Method */}
              <div>
                <h2 className="text-2xl font-semibold mb-4">Payment Method</h2>
                <div className="space-y-3">
                  <label className={`flex items-center p-4 border-2 rounded-lg cursor-pointer hover:border-black transition-colors ${paymentType === 'prepaid' ? 'border-black bg-gray-50' : 'border-gray-300'}`}>
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
                  <label className={`flex items-center p-4 border-2 rounded-lg cursor-pointer transition-colors ${
                    !isCODAllowed 
                      ? 'border-gray-200 bg-gray-50 cursor-not-allowed opacity-60' 
                      : paymentType === 'cod' 
                      ? 'border-black bg-gray-50' 
                      : 'border-gray-300 hover:border-black'
                  }`}>
                    <input
                      type="radio"
                      name="payment"
                      value="cod"
                      checked={paymentType === 'cod'}
                      onChange={(e) => setPaymentType(e.target.value as 'cod')}
                      disabled={!isCODAllowed}
                      className="mr-3"
                    />
                    <div className="flex-1">
                      <span className="font-semibold">Cash on Delivery (COD)</span>
                      {isCODAllowed ? (
                        <p className="text-sm text-gray-600">Requires WhatsApp verification</p>
                      ) : (
                        <p className="text-sm text-red-600">Not available for this pincode</p>
                      )}
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

          {/* Order Summary - Clean UI */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg p-6 sticky top-24">
              <h2 className="text-2xl font-bold mb-6">Order Summary</h2>

              {/* Items */}
              <div className="space-y-4 mb-6 border-b pb-6">
                {cart.map((item, index) => (
                  <div key={index} className="flex gap-3">
                    <div className="text-sm flex-1">
                      <p className="font-medium">{item.product.title}</p>
                      <p className="text-gray-600">
                        Size: {item.size} × {item.quantity}
                      </p>
                    </div>
                    <div className="font-semibold">
                      {formatPrice(item.product.price * item.quantity)}
                    </div>
                  </div>
                ))}
              </div>

              {/* Pricing Breakdown - Clean UI */}
              <div className="space-y-3">
                {/* Items Total */}
                <div className="flex justify-between text-lg">
                  <span className="text-gray-600">Items Total</span>
                  <span className="font-semibold">{formatPrice(subtotal)}</span>
                </div>

                {/* Savings (if any) */}
                {savings > 0 && (
                  <div className="flex justify-between text-green-600">
                    <span>Savings</span>
                    <span className="font-semibold">-{formatPrice(savings)}</span>
                  </div>
                )}

                {/* Referral Discount (if applied) */}
                {referralDiscount > 0 && (
                  <div className="flex justify-between text-green-600">
                    <span>Referral Discount</span>
                    <span className="font-semibold">-{formatPrice(referralDiscount)}</span>
                  </div>
                )}

                {/* Shipping */}
                <div className="flex justify-between">
                  <span className="text-gray-600">Shipping</span>
                  <span className="font-semibold text-green-600">
                    {shipping_cost === 0 ? 'FREE' : formatPrice(shipping_cost)}
                  </span>
                </div>

                {/* Custom Charges (only if enabled) */}
                {customCharges.length > 0 && customCharges.map((charge, index) => (
                  <div key={index} className="flex justify-between text-sm">
                    <span className="text-gray-600">{charge.label}</span>
                    <span className="font-semibold">{formatPrice(charge.amount)}</span>
                  </div>
                ))}

                {/* Tax */}
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Tax (GST 18%)</span>
                  <span className="font-semibold">{formatPrice(taxAmount)}</span>
                </div>
              </div>

              {/* Grand Total */}
              <div className="border-t mt-4 pt-4">
                <div className="flex justify-between text-xl font-bold">
                  <span>Grand Total</span>
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
