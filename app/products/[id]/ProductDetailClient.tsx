'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import { formatPrice } from '@/lib/utils'
import type { Product } from '@/lib/types'

export default function ProductDetailClient({ product }: { product: Product }) {
  const router = useRouter()
  const [selectedSize, setSelectedSize] = useState<string>('')
  const [quantity, setQuantity] = useState(1)

  const handleAddToCart = () => {
    if (!selectedSize) {
      alert('Please select a size')
      return
    }

    // Get existing cart from localStorage
    const cart = JSON.parse(localStorage.getItem('cart') || '[]')
    
    // Check if item already exists in cart
    const existingItemIndex = cart.findIndex(
      (item: any) => item.product.id === product.id && item.size === selectedSize
    )

    if (existingItemIndex > -1) {
      // Update quantity
      cart[existingItemIndex].quantity += quantity
    } else {
      // Add new item
      cart.push({
        product,
        size: selectedSize,
        quantity,
      })
    }

    localStorage.setItem('cart', JSON.stringify(cart))
    router.push('/cart')
  }

  const availableSizes = product.variants.filter(v => v.stock > 0)

  return (
    <div className="min-h-screen">
      {/* Header */}
      <header className="bg-white shadow-sm sticky top-0 z-50">
        <nav className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/" className="text-2xl font-bold">
            Intru
          </Link>
          <div className="flex items-center gap-6">
            <Link href="/" className="hover:text-gray-600">
              Shop
            </Link>
            <Link href="/cart" className="hover:text-gray-600">
              Cart
            </Link>
          </div>
        </nav>
      </header>

      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
          {/* Product Images */}
          <div>
            <div className="relative aspect-square bg-gray-100 rounded-lg overflow-hidden mb-4">
              {product.image_url ? (
                <Image
                  src={product.image_url}
                  alt={product.title}
                  fill
                  className="object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-gray-400">
                  No Image
                </div>
              )}
            </div>
          </div>

          {/* Product Info */}
          <div>
            <h1 className="text-4xl font-bold mb-4">{product.title}</h1>
            
            <div className="flex items-center gap-4 mb-6">
              <span className="text-3xl font-bold">
                {formatPrice(product.price)}
              </span>
              {product.compare_at_price && product.compare_at_price > product.price && (
                <>
                  <span className="text-xl text-gray-400 line-through">
                    {formatPrice(product.compare_at_price)}
                  </span>
                  <span className="bg-red-500 text-white px-3 py-1 rounded-full text-sm font-semibold">
                    {Math.round((1 - product.price / product.compare_at_price) * 100)}% OFF
                  </span>
                </>
              )}
            </div>

            <p className="text-gray-700 mb-6 whitespace-pre-line">
              {product.description}
            </p>

            {/* Size Selection */}
            <div className="mb-6">
              <h3 className="font-semibold mb-3">Select Size</h3>
              <div className="flex flex-wrap gap-2">
                {product.variants.map((variant) => (
                  <button
                    key={variant.size}
                    onClick={() => setSelectedSize(variant.size)}
                    disabled={variant.stock === 0}
                    className={`px-6 py-3 border rounded-lg font-medium transition-colors ${
                      selectedSize === variant.size
                        ? 'bg-black text-white border-black'
                        : variant.stock === 0
                        ? 'bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed'
                        : 'bg-white text-black border-gray-300 hover:border-black'
                    }`}
                  >
                    {variant.size}
                    {variant.stock === 0 && ' (Out of Stock)'}
                  </button>
                ))}
              </div>
            </div>

            {/* Quantity */}
            <div className="mb-6">
              <h3 className="font-semibold mb-3">Quantity</h3>
              <div className="flex items-center gap-4">
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  -
                </button>
                <span className="text-xl font-medium w-12 text-center">{quantity}</span>
                <button
                  onClick={() => setQuantity(quantity + 1)}
                  className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  +
                </button>
              </div>
            </div>

            {/* Add to Cart Button */}
            <button
              onClick={handleAddToCart}
              disabled={availableSizes.length === 0}
              className="w-full bg-black text-white py-4 rounded-lg font-semibold hover:bg-gray-800 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed mb-4"
            >
              {availableSizes.length === 0 ? 'Out of Stock' : 'Add to Cart'}
            </button>

            {/* Product Details */}
            <div className="border-t pt-6 space-y-4">
              {product.material && (
                <div>
                  <span className="font-semibold">Material:</span> {product.material}
                </div>
              )}
              {product.fit && (
                <div>
                  <span className="font-semibold">Fit:</span> {product.fit}
                </div>
              )}
              {product.gsm && (
                <div>
                  <span className="font-semibold">GSM:</span> {product.gsm}
                </div>
              )}
              {product.color && (
                <div>
                  <span className="font-semibold">Color:</span> {product.color}
                </div>
              )}
              {product.care_instructions && (
                <div>
                  <span className="font-semibold">Care:</span> {product.care_instructions}
                </div>
              )}
              <div>
                <span className="font-semibold">Made in:</span> {product.country_of_origin}
              </div>
            </div>

            {/* Policies */}
            <div className="border-t mt-6 pt-6 space-y-3 text-sm text-gray-600">
              <div className="flex items-start gap-2">
                <span>🔄</span>
                <span><strong>Exchange Policy:</strong> Exchanges only within 36 hours of contact</span>
              </div>
              <div className="flex items-start gap-2">
                <span>🚚</span>
                <span><strong>Shipping:</strong> Free shipping on all prepaid orders</span>
              </div>
              <div className="flex items-start gap-2">
                <span>💳</span>
                <span><strong>COD Available:</strong> Cash on Delivery option available</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
