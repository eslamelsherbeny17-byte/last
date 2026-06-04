'use client'

import { useEffect, useState } from 'react'
import { ProductCard } from './ProductCard'
import { Product } from '@/lib/types'
import { productsAPI } from '@/lib/api'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface RelatedProductsProps {
  categoryId: string
  currentProductId: string
}

export function RelatedProducts({
  categoryId,
  currentProductId,
}: RelatedProductsProps) {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchRelatedProducts = async () => {
      try {
        const response = await productsAPI.getAll({
          category: categoryId,
          limit: 8,
        })
        // Filter out current product
        const filtered = response.data.filter((p) => p._id !== currentProductId)
        setProducts(filtered)
      } catch (error) {
        console.error('Failed to fetch related products:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchRelatedProducts()
  }, [categoryId, currentProductId])

  if (loading) {
    return (
      <section className='mt-12'>
        <h2 className='text-2xl md:text-3xl font-bold mb-6'>منتجات ذات صلة</h2>
        <div className='grid grid-cols-2 md:grid-cols-4 gap-4'>
          {[...Array(4)].map((_, i) => (
            <div
              key={i}
              className='aspect-[3/4] bg-gray-200 animate-pulse rounded-lg'
            />
          ))}
        </div>
      </section>
    )
  }

  if (products.length === 0) return null

  return (
    <section className='mt-12'>
      <div className='flex items-center justify-between mb-6'>
        <h2 className='text-2xl md:text-3xl font-bold'>منتجات ذات صلة</h2>
        <div className='flex gap-2'>
          <Button variant='outline' size='icon'>
            <ChevronRight className='h-4 w-4' />
          </Button>
          <Button variant='outline' size='icon'>
            <ChevronLeft className='h-4 w-4' />
          </Button>
        </div>
      </div>

      <div className='grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6'>
        {products.slice(0, 4).map((product) => (
          <ProductCard key={product._id} product={product} />
        ))}
      </div>
    </section>
  )
}
