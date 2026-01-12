'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useCartStore } from '@/lib/cart-store'

export function Navbar() {
  const { getItemCount } = useCartStore()
  const [cartCount, setCartCount] = useState(0)

  useEffect(() => {
    useCartStore.persist.rehydrate()
    setCartCount(getItemCount())
    
    // Subscribe to cart changes
    const unsubscribe = useCartStore.subscribe((state) => {
      setCartCount(state.getItemCount())
    })

    return () => unsubscribe()
  }, [])

  return (
    <header className="bg-white shadow-sm sticky top-0 z-50">
      <nav className="container mx-auto px-4 py-4 flex items-center justify-between">
        <Link href="/" className="text-2xl font-bold">
          Intru
        </Link>
        
        <div className="hidden md:flex items-center gap-8">
          <Link href="/" className="hover:text-gray-600 font-medium">
            Shop
          </Link>
          <Link href="/?category=t-shirts" className="hover:text-gray-600">
            T-Shirts
          </Link>
          <Link href="/?category=shirts" className="hover:text-gray-600">
            Shirts
          </Link>
          <Link href="/?category=hoodies" className="hover:text-gray-600">
            Hoodies
          </Link>
        </div>
        
        <div className="flex items-center gap-6">
          <Link href="/cart" className="relative hover:text-gray-600">
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"
              />
            </svg>
            {cartCount > 0 && (
              <span className="absolute -top-2 -right-2 bg-black text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
                {cartCount}
              </span>
            )}
          </Link>
        </div>
      </nav>
      
      {/* Mobile menu */}
      <div className="md:hidden border-t px-4 py-3 flex gap-4 overflow-x-auto">
        <Link href="/" className="text-sm font-medium whitespace-nowrap">
          All Products
        </Link>
        <Link href="/?category=t-shirts" className="text-sm whitespace-nowrap">
          T-Shirts
        </Link>
        <Link href="/?category=shirts" className="text-sm whitespace-nowrap">
          Shirts
        </Link>
        <Link href="/?category=hoodies" className="text-sm whitespace-nowrap">
          Hoodies
        </Link>
      </div>
    </header>
  )
}
