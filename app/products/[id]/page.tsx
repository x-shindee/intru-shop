import { notFound } from 'next/navigation'
import { Metadata } from 'next'
import { supabase } from '@/lib/supabase'
import ProductDetailClient from './ProductDetailClient'

export const runtime = 'edge'
export const revalidate = 60

async function getProduct(id: string) {
  const { data: product, error } = await supabase
    .from('products')
    .select('*')
    .eq('id', id)
    .eq('is_live', true)
    .single()

  if (error || !product) {
    return null
  }

  return product
}

// Generate dynamic metadata for SEO
export async function generateMetadata({
  params,
}: {
  params: { id: string }
}): Promise<Metadata> {
  const product = await getProduct(params.id)

  if (!product) {
    return {
      title: 'Product Not Found - Intru',
      description: 'The product you are looking for could not be found.'
    }
  }

  const description = product.description
    ? product.description.substring(0, 160)
    : `Buy ${product.title} at Intru. Premium Indian streetwear.`

  return {
    title: `${product.title} - Intru`,
    description,
    openGraph: {
      title: product.title,
      description,
      images: product.image_url ? [product.image_url] : [],
      type: 'website'
    },
    twitter: {
      card: 'summary_large_image',
      title: product.title,
      description,
      images: product.image_url ? [product.image_url] : []
    }
  }
}

export default async function ProductPage({
  params,
}: {
  params: { id: string }
}) {
  const product = await getProduct(params.id)

  if (!product) {
    notFound()
  }

  return <ProductDetailClient product={product} />
}
