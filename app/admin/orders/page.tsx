import { supabaseAdmin } from '@/lib/supabase'
import { formatPrice, formatDate } from '@/lib/utils'
import Link from 'next/link'

export const runtime = 'edge'
export const dynamic = 'force-dynamic'
export const revalidate = 0

async function getOrders() {
  const { data: orders } = await supabaseAdmin
    .from('orders')
    .select('*')
    .order('created_at', { ascending: false })

  return orders || []
}

export default async function AdminOrdersPage() {
  const orders = await getOrders()

  const getStatusBadge = (status: string, type: 'payment' | 'shipping' | 'verification') => {
    const colors: any = {
      payment: {
        pending: 'bg-yellow-100 text-yellow-800',
        success: 'bg-green-100 text-green-800',
        failed: 'bg-red-100 text-red-800',
      },
      shipping: {
        pending: 'bg-gray-100 text-gray-800',
        processing: 'bg-blue-100 text-blue-800',
        ready_to_ship: 'bg-purple-100 text-purple-800',
        shipped: 'bg-indigo-100 text-indigo-800',
        delivered: 'bg-green-100 text-green-800',
      },
      verification: {
        pending: 'bg-yellow-100 text-yellow-800',
        verified: 'bg-green-100 text-green-800',
        cancelled: 'bg-red-100 text-red-800',
      },
    }

    return colors[type][status] || 'bg-gray-100 text-gray-800'
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold">Orders</h1>
          <p className="text-gray-600">Manage customer orders and shipments</p>
        </div>

        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="text-left px-6 py-4 font-semibold text-sm">Order #</th>
                  <th className="text-left px-6 py-4 font-semibold text-sm">Customer</th>
                  <th className="text-left px-6 py-4 font-semibold text-sm">Total</th>
                  <th className="text-left px-6 py-4 font-semibold text-sm">Payment</th>
                  <th className="text-left px-6 py-4 font-semibold text-sm">Verification</th>
                  <th className="text-left px-6 py-4 font-semibold text-sm">Shipping</th>
                  <th className="text-left px-6 py-4 font-semibold text-sm">Date</th>
                  <th className="text-left px-6 py-4 font-semibold text-sm">Actions</th>
                </tr>
              </thead>
              <tbody>
                {orders.map((order) => (
                  <tr key={order.id} className="border-b hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <p className="font-medium">{order.order_number}</p>
                      <p className="text-xs text-gray-500 uppercase">{order.payment_type}</p>
                    </td>
                    <td className="px-6 py-4">
                      <p className="font-medium">{order.customer_name}</p>
                      <p className="text-sm text-gray-600">{order.customer_email}</p>
                      <p className="text-sm text-gray-600">{order.customer_phone}</p>
                    </td>
                    <td className="px-6 py-4">
                      <p className="font-semibold">{formatPrice(order.total_amount)}</p>
                      <p className="text-xs text-gray-500">{order.items.length} items</p>
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${getStatusBadge(
                          order.payment_status,
                          'payment'
                        )}`}
                      >
                        {order.payment_status}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${getStatusBadge(
                          order.verification_status,
                          'verification'
                        )}`}
                      >
                        {order.verification_status}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${getStatusBadge(
                          order.shipping_status,
                          'shipping'
                        )}`}
                      >
                        {order.shipping_status}
                      </span>
                      {order.tracking_number && (
                        <p className="text-xs text-gray-500 mt-1">
                          Track: {order.tracking_number}
                        </p>
                      )}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {formatDate(order.created_at)}
                    </td>
                    <td className="px-6 py-4">
                      <Link
                        href={`/admin/orders/${order.id}`}
                        className="text-blue-600 hover:text-blue-800 font-medium"
                      >
                        View
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {orders.length === 0 && (
            <div className="text-center py-12">
              <p className="text-gray-500">No orders yet</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
