import { supabaseAdmin } from '@/lib/supabase'
import { formatPrice, formatDate } from '@/lib/utils'
import Link from 'next/link'

export const dynamic = 'force-dynamic'
export const revalidate = 0

async function getProducts() {
  const { data: products } = await supabaseAdmin
    .from('products')
    .select('*')
    .order('created_at', { ascending: false })

  return products || []
}

export default async function AdminProductsPage() {
  const products = await getProducts()

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold">Products</h1>
            <p className="text-gray-600">Manage your product catalog</p>
          </div>
          <Link
            href="/admin/products/new"
            className="bg-black text-white px-6 py-3 rounded-lg hover:bg-gray-800 transition-colors"
          >
            + Add Product
          </Link>
        </div>

        <div className="bg-white rounded-lg shadow overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="text-left px-6 py-4 font-semibold text-sm">Product</th>
                <th className="text-left px-6 py-4 font-semibold text-sm">Price</th>
                <th className="text-left px-6 py-4 font-semibold text-sm">Stock</th>
                <th className="text-left px-6 py-4 font-semibold text-sm">Status</th>
                <th className="text-left px-6 py-4 font-semibold text-sm">Created</th>
                <th className="text-left px-6 py-4 font-semibold text-sm">Actions</th>
              </tr>
            </thead>
            <tbody>
              {products.map((product) => {
                const totalStock = product.variants.reduce((sum: number, v: any) => sum + v.stock, 0)
                return (
                  <tr key={product.id} className="border-b hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        {product.image_url && (
                          <img
                            src={product.image_url}
                            alt={product.title}
                            className="w-12 h-12 object-cover rounded"
                          />
                        )}
                        <div>
                          <p className="font-medium">{product.title}</p>
                          <p className="text-sm text-gray-600">HSN: {product.hsn_code}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <p className="font-semibold">{formatPrice(product.price)}</p>
                      {product.compare_at_price && (
                        <p className="text-sm text-gray-500 line-through">
                          {formatPrice(product.compare_at_price)}
                        </p>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <span className={totalStock > 0 ? 'text-green-600' : 'text-red-600'}>
                        {totalStock} units
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${
                          product.is_live
                            ? 'bg-green-100 text-green-800'
                            : 'bg-gray-100 text-gray-800'
                        }`}
                      >
                        {product.is_live ? 'Live' : 'Hidden'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {formatDate(product.created_at)}
                    </td>
                    <td className="px-6 py-4">
                      <Link
                        href={`/admin/products/edit/${product.id}`}
                        className="text-blue-600 hover:text-blue-800 font-medium"
                      >
                        Edit
                      </Link>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>

          {products.length === 0 && (
            <div className="text-center py-12">
              <p className="text-gray-500 mb-4">No products yet</p>
              <Link
                href="/admin/products/new"
                className="text-blue-600 hover:text-blue-800 font-medium"
              >
                Add your first product
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
