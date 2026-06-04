'use client'

import { useEffect, useState } from 'react'
import { ProductCard } from '@/components/products/ProductCard'
import { Button } from '@/components/ui/button'
import { ChevronLeft, TrendingUp, Loader2 } from 'lucide-react'
import Link from 'next/link'
import { productsAPI } from '@/lib/api'
import type { Product } from '@/lib/types'

export function BestSellers() {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await productsAPI.getAll({ limit: 4, sort: '-sold' })
        setProducts(response.data || [])
      } catch (error) {
        console.error('Failed to fetch best sellers:', error)
      } finally {
        setLoading(false)
      }
    }
    fetchProducts()
  }, [])

  if (loading)
    return (
      <section className='py-16 bg-secondary/30'>
        <Loader2 className='mx-auto animate-spin text-primary' />
      </section>
    )
  if (products.length === 0) return null

  return (
    <section className='pt-16 pb-10 bg-secondary/30 border-t border-border/50'>
      <div className='container mx-auto px-4'>
        <div className='text-center mb-12'>
          <div className='inline-flex items-center gap-2 px-4 py-2 bg-primary/10 rounded-full mb-4'>
            <TrendingUp className='h-5 w-5 text-primary' />
            <span className='text-primary font-semibold'>الأكثر مبيعاً</span>
          </div>
          <h2 className='text-3xl md:text-4xl font-bold mb-4'>
            منتجاتنا المفضلة
          </h2>
          <p className='text-muted-foreground max-w-2xl mx-auto'>
            القطع الأكثر طلباً في متجرنا
          </p>
        </div>

        <div className='grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6 mb-8'>
          {products.map((product) => (
            <ProductCard key={product._id} product={product} />
          ))}
        </div>

        <div className='text-center'>
          <Link href='/shop?sort=-sold'>
            <Button variant='outline' size='lg'>
              عرض الأكثر مبيعاً
              <ChevronLeft className='mr-2 h-4 w-4' />
            </Button>
          </Link>
        </div>
      </div>
    </section>
  )
}
