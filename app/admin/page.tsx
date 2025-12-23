import { supabaseAdmin } from '@/lib/supabase'
import { formatPrice } from '@/lib/utils'
import Link from 'next/link'

export const runtime = 'edge'
export const dynamic = 'force-dynamic'
export const revalidate = 0

async function getDashboardStats() {
  const [productsRes, ordersRes] = await Promise.all([
    supabaseAdmin.from('products').select('*', { count: 'exact' }),
    supabaseAdmin.from('orders').select('*'),
  ])

  const products = productsRes.data || []
  const orders = ordersRes.data || []

  const liveProducts = products.filter((p) => p.is_live).length
  const totalRevenue = orders
    .filter((o) => o.payment_status === 'success')
    .reduce((sum, o) => sum + o.total_amount, 0)
  
  const pendingOrders = orders.filter(
    (o) => o.payment_status === 'pending' || o.verification_status === 'pending'
  ).length

  const readyToShip = orders.filter(
    (o) => o.shipping_status === 'ready_to_ship'
  ).length

  return {
    totalProducts: products.length,
    liveProducts,
    totalOrders: orders.length,
    totalRevenue,
    pendingOrders,
    readyToShip,
    recentOrders: orders.slice(0, 5),
  }
}

export default async function AdminDashboard() {
  const stats = await getDashboardStats()

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold">Dashboard</h1>
          <p className="text-gray-600">Welcome to Intru Admin Panel</p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Products</p>
                <p className="text-3xl font-bold mt-2">{stats.totalProducts}</p>
                <p className="text-sm text-green-600 mt-1">{stats.liveProducts} live</p>
              </div>
              <div className="text-4xl">📦</div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Orders</p>
                <p className="text-3xl font-bold mt-2">{stats.totalOrders}</p>
                <p className="text-sm text-yellow-600 mt-1">{stats.pendingOrders} pending</p>
              </div>
              <div className="text-4xl">🛍️</div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Revenue</p>
                <p className="text-3xl font-bold mt-2">{formatPrice(stats.totalRevenue)}</p>
              </div>
              <div className="text-4xl">💰</div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Ready to Ship</p>
                <p className="text-3xl font-bold mt-2">{stats.readyToShip}</p>
              </div>
              <div className="text-4xl">📬</div>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <Link
            href="/admin/products/new"
            className="bg-black text-white rounded-lg p-6 hover:bg-gray-800 transition-colors"
          >
            <h3 className="text-xl font-semibold mb-2">+ Add New Product</h3>
            <p className="text-gray-300">Create a new product listing</p>
          </Link>

          <Link
            href="/admin/orders"
            className="bg-orange-500 text-white rounded-lg p-6 hover:bg-orange-600 transition-colors"
          >
            <h3 className="text-xl font-semibold mb-2">View Pending Orders</h3>
            <p className="text-orange-100">{stats.pendingOrders} orders need attention</p>
          </Link>
        </div>

        {/* Recent Orders */}
        <div className="bg-white rounded-lg shadow">
          <div className="px-6 py-4 border-b">
            <h2 className="text-xl font-semibold">Recent Orders</h2>
          </div>
          <div className="p-6">
            {stats.recentOrders.length > 0 ? (
              <div className="space-y-4">
                {stats.recentOrders.map((order: any) => (
                  <Link
                    key={order.id}
                    href={`/admin/orders/${order.id}`}
                    className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    <div>
                      <p className="font-semibold">{order.order_number}</p>
                      <p className="text-sm text-gray-600">{order.customer_name}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold">{formatPrice(order.total_amount)}</p>
                      <p className="text-sm text-gray-600 uppercase">{order.payment_type}</p>
                    </div>
                  </Link>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 text-center py-8">No orders yet</p>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
