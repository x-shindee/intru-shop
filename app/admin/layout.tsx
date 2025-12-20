import Link from 'next/link'
import { Inter } from 'next/font/google'

const inter = Inter({ subsets: ['latin'] })

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className={inter.className}>
      <div className="flex h-screen bg-gray-100">
        {/* Sidebar */}
        <aside className="w-64 bg-black text-white flex flex-col">
          <div className="p-6">
            <Link href="/admin" className="text-2xl font-bold">
              Intru Admin
            </Link>
          </div>

          <nav className="flex-1 px-4">
            <div className="space-y-2">
              <Link
                href="/admin"
                className="block px-4 py-3 rounded-lg hover:bg-gray-800 transition-colors"
              >
                📊 Dashboard
              </Link>
              <Link
                href="/admin/products"
                className="block px-4 py-3 rounded-lg hover:bg-gray-800 transition-colors"
              >
                📦 Products
              </Link>
              <Link
                href="/admin/orders"
                className="block px-4 py-3 rounded-lg hover:bg-gray-800 transition-colors"
              >
                🛍️ Orders
              </Link>
            </div>
          </nav>

          <div className="p-4 border-t border-gray-800">
            <Link
              href="/"
              className="block px-4 py-3 rounded-lg hover:bg-gray-800 transition-colors text-center"
            >
              ← Back to Store
            </Link>
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  )
}
