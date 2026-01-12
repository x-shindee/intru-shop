import { supabaseAdmin } from '@/lib/supabase'
import Link from 'next/link'

export const runtime = 'edge'
export const dynamic = 'force-dynamic'
export const revalidate = 0

async function getContentPages() {
  const { data: pages } = await supabaseAdmin
    .from('content_pages')
    .select('*')
    .order('created_at', { ascending: false })

  return pages || []
}

export default async function AdminPagesPage() {
  const pages = await getContentPages()

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold">Content Pages</h1>
            <p className="text-gray-600">Manage website pages (About Us, Privacy Policy, etc.)</p>
          </div>
          <Link
            href="/admin/pages/new"
            className="bg-black text-white px-6 py-3 rounded-lg hover:bg-gray-800 transition-colors"
          >
            + Add Page
          </Link>
        </div>

        <div className="bg-white rounded-lg shadow overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="text-left px-6 py-4 font-semibold text-sm">Title</th>
                <th className="text-left px-6 py-4 font-semibold text-sm">Slug</th>
                <th className="text-left px-6 py-4 font-semibold text-sm">Status</th>
                <th className="text-left px-6 py-4 font-semibold text-sm">Actions</th>
              </tr>
            </thead>
            <tbody>
              {pages.map((page) => (
                <tr key={page.id} className="border-b hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <p className="font-medium">{page.title}</p>
                  </td>
                  <td className="px-6 py-4">
                    <code className="text-sm bg-gray-100 px-2 py-1 rounded">/{page.slug}</code>
                  </td>
                  <td className="px-6 py-4">
                    <span
                      className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${
                        page.is_published
                          ? 'bg-green-100 text-green-800'
                          : 'bg-gray-100 text-gray-800'
                      }`}
                    >
                      {page.is_published ? 'Published' : 'Draft'}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <Link
                      href={`/admin/pages/edit/${page.id}`}
                      className="text-blue-600 hover:text-blue-800 font-medium"
                    >
                      Edit
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {pages.length === 0 && (
            <div className="text-center py-12">
              <p className="text-gray-500 mb-4">No pages yet</p>
              <Link
                href="/admin/pages/new"
                className="text-blue-600 hover:text-blue-800 font-medium"
              >
                Create your first page
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
