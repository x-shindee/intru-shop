'use client'

import { useSearchParams } from 'next/navigation'
import { Suspense } from 'react'
import Link from 'next/link'

function OrderSuccessContent() {
  const searchParams = useSearchParams()
  const order_id = searchParams.get('order_id')

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white flex items-center justify-center px-4">
      <div className="max-w-md w-full">
        <div className="bg-white rounded-2xl shadow-xl p-8 text-center">
          <div className="mb-6">
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-10 h-10 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h1 className="text-3xl font-bold mb-2">Order Confirmed!</h1>
            <p className="text-gray-600">
              Thank you for your purchase
            </p>
          </div>

          <div className="bg-green-50 border border-green-200 rounded-lg p-6 mb-6">
            <h2 className="font-semibold text-lg mb-2">
              Payment Successful
            </h2>
            <p className="text-sm text-gray-700 mb-3">
              Your payment has been processed successfully. We'll start preparing your order right away!
            </p>
            <p className="text-xs text-gray-600">
              Order ID: {order_id}
            </p>
          </div>

          <div className="space-y-3 text-sm text-gray-600 mb-6">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center flex-shrink-0">
                <span>📧</span>
              </div>
              <p className="text-left">
                Order confirmation sent to your email
              </p>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center flex-shrink-0">
                <span>📦</span>
              </div>
              <p className="text-left">
                Your order will be shipped within 2-3 business days
              </p>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center flex-shrink-0">
                <span>🚚</span>
              </div>
              <p className="text-left">
                FREE shipping on prepaid orders
              </p>
            </div>
          </div>

          <Link
            href="/"
            className="block w-full bg-black text-white font-semibold py-4 rounded-lg hover:bg-gray-800 transition-colors mb-3"
          >
            Continue Shopping
          </Link>

          <p className="text-sm text-gray-500">
            Need help? Contact us at support@intru.in
          </p>
        </div>
      </div>
    </div>
  )
}

export default function OrderSuccessPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Loading...</div>}>
      <OrderSuccessContent />
    </Suspense>
  )
}
