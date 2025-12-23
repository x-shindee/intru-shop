import { notFound } from 'next/navigation'
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
