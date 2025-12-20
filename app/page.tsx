import Link from 'next/link'
import { supabase } from '@/lib/supabase'
import { formatPrice } from '@/lib/utils'
import Image from 'next/image'

export const revalidate = 60 // Revalidate every 60 seconds

async function getProducts() {
  const { data: products, error } = await supabase
    .from('products')
    .select('*')
    .eq('is_live', true)
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Error fetching products:', error)
    return []
  }

  return products
}

export default async function HomePage() {
  const products = await getProducts()

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

      {/* Banner */}
      <div className="bg-gradient-to-r from-orange-500 to-pink-500 text-white py-3 text-center">
        <p className="text-sm font-medium">
          🚚 FREE SHIPPING on all prepaid orders across India | 💳 COD Available
        </p>
      </div>

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-16">
        <div className="text-center max-w-3xl mx-auto mb-12">
          <h1 className="text-5xl font-bold mb-4">
            Indian Streetwear
          </h1>
          <p className="text-xl text-gray-600">
            Premium quality, designed in India, made for the streets
          </p>
        </div>

        {/* Products Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {products.map((product) => (
            <Link
              key={product.id}
              href={`/products/${product.id}`}
              className="group"
            >
              <div className="relative aspect-square bg-gray-100 rounded-lg overflow-hidden mb-4">
                {product.image_url ? (
                  <Image
                    src={product.image_url}
                    alt={product.title}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-gray-400">
                    No Image
                  </div>
                )}
                {product.compare_at_price && product.compare_at_price > product.price && (
                  <div className="absolute top-4 left-4 bg-red-500 text-white px-3 py-1 rounded-full text-sm font-semibold">
                    Sale
                  </div>
                )}
              </div>
              <h3 className="font-semibold text-lg mb-2">{product.title}</h3>
              <div className="flex items-center gap-2">
                <span className="font-bold text-lg">
                  {formatPrice(product.price)}
                </span>
                {product.compare_at_price && product.compare_at_price > product.price && (
                  <span className="text-gray-400 line-through text-sm">
                    {formatPrice(product.compare_at_price)}
                  </span>
                )}
              </div>
            </Link>
          ))}
        </div>

        {products.length === 0 && (
          <div className="text-center py-16">
            <p className="text-gray-500 text-lg">
              No products available at the moment. Check back soon!
            </p>
          </div>
        )}
      </section>
    </div>
  )
}
