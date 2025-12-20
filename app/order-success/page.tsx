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
          {/* Success Icon */}
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

          {/* Payment Success */}
          <div className="bg-green-50 border border-green-200 rounded-lg p-6 mb-6">
            <h2 className="font-semibold text-lg mb-2">
              Payment Successful
            </h2>
            <p className="text-sm text-gray-700 mb-3">
              Your payment has been processed successfully. We'll start preparing your order right away!
            </p>
            {order_id && (
              <p className="text-xs text-gray-600">
                Order ID: {order_id}
              </p>
            )}
          </div>

          {/* MANDATORY UNBOXING VIDEO REQUIREMENT */}
          <div className="bg-red-50 border-2 border-red-300 rounded-lg p-6 mb-6">
            <div className="flex items-start gap-3 mb-3">
              <div className="w-8 h-8 bg-red-500 rounded-full flex items-center justify-center flex-shrink-0">
                <span className="text-white text-lg">📹</span>
              </div>
              <div className="text-left">
                <h3 className="font-bold text-red-900 mb-2">
                  ⚠️ MANDATORY: Unboxing Video Required
                </h3>
                <p className="text-sm text-red-800 mb-2">
                  For your protection and ours, you MUST record a complete unboxing video from package delivery to opening.
                </p>
              </div>
            </div>
            
            <div className="bg-white rounded p-4 text-left space-y-2 text-sm">
              <p className="font-semibold text-red-900">Video Requirements:</p>
              <ul className="list-disc list-inside space-y-1 text-gray-700">
                <li>Record BEFORE opening the package</li>
                <li>Show package seal and condition clearly</li>
                <li>Record continuously - no cuts or edits</li>
                <li>Show all items and check for damages</li>
                <li>Keep video until return period ends</li>
              </ul>
              <p className="text-xs text-red-600 font-semibold mt-3">
                ⚠️ Claims without unboxing video will NOT be accepted
              </p>
            </div>
          </div>

          {/* Order Details */}
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
                FREE shipping on prepaid orders across India
              </p>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center flex-shrink-0">
                <span>🔄</span>
              </div>
              <p className="text-left">
                Exchange policy: 36-hour contact window
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

        {/* Additional Fraud Protection Notice */}
        <div className="mt-6 bg-yellow-50 border border-yellow-200 rounded-lg p-4 text-center">
          <p className="text-xs text-yellow-800">
            🛡️ <strong>Fraud Protection:</strong> All orders are monitored. Unboxing video is mandatory for damage/missing item claims. Thank you for shopping with Intru!
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
