import Link from 'next/link'
import { supabase } from '@/lib/supabase'

async function getPublishedPages() {
  const { data: pages } = await supabase
    .from('content_pages')
    .select('id, slug, title')
    .eq('is_published', true)
    .order('title')

  return pages || []
}

export async function Footer() {
  const pages = await getPublishedPages()

  return (
    <footer className="bg-gray-900 text-white mt-auto">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div>
            <h3 className="text-2xl font-bold mb-4">Intru</h3>
            <p className="text-gray-400">
              Premium Indian Streetwear
            </p>
          </div>

          {/* Shop */}
          <div>
            <h4 className="font-semibold mb-4">Shop</h4>
            <ul className="space-y-2 text-gray-400">
              <li>
                <Link href="/" className="hover:text-white transition-colors">
                  All Products
                </Link>
              </li>
              <li>
                <Link href="/?category=t-shirts" className="hover:text-white transition-colors">
                  T-Shirts
                </Link>
              </li>
              <li>
                <Link href="/?category=shirts" className="hover:text-white transition-colors">
                  Shirts
                </Link>
              </li>
              <li>
                <Link href="/?category=hoodies" className="hover:text-white transition-colors">
                  Hoodies
                </Link>
              </li>
            </ul>
          </div>

          {/* Support */}
          <div>
            <h4 className="font-semibold mb-4">Support</h4>
            <ul className="space-y-2 text-gray-400">
              {pages.map((page) => (
                <li key={page.id}>
                  <Link href={`/${page.slug}`} className="hover:text-white transition-colors">
                    {page.title}
                  </Link>
                </li>
              ))}
              <li>
                <Link href="/contact" className="hover:text-white transition-colors">
                  Contact Us
                </Link>
              </li>
            </ul>
          </div>

          {/* Connect */}
          <div>
            <h4 className="font-semibold mb-4">Connect</h4>
            <ul className="space-y-2 text-gray-400">
              <li>
                <a href="https://instagram.com/intru" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors">
                  Instagram
                </a>
              </li>
              <li>
                <a href="https://twitter.com/intru" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors">
                  Twitter
                </a>
              </li>
              <li>
                <a href="https://facebook.com/intru" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors">
                  Facebook
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400 text-sm">
          <p>&copy; {new Date().getFullYear()} Intru. All rights reserved.</p>
          <p className="mt-2">Made in India 🇮🇳 | Free Shipping on Prepaid Orders</p>
        </div>
      </div>
    </footer>
  )
}
