'use client'

import { useEffect, useState } from 'react'
import { ProductCard } from '@/components/products/ProductCard'
import { Button } from '@/components/ui/button'
import { ChevronLeft, Sparkles, Loader2 } from 'lucide-react'
import Link from 'next/link'
import { productsAPI } from '@/lib/api'
import type { Product } from '@/lib/types'

export function NewArrivals() {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await productsAPI.getAll({
          limit: 4,
          sort: '-createdAt', // جلب الأحدث تاريخاً
        })
        setProducts(response.data || [])
      } catch (error) {
        console.error('Failed to fetch new arrivals:', error)
        setProducts([])
      } finally {
        setLoading(false)
      }
    }
    fetchProducts()
  }, [])

  if (loading) {
    return (
      <section className='py-10 bg-background'>
        <div className='flex justify-center items-center min-h-[300px]'>
          <Loader2 className='h-10 w-10 animate-spin text-primary' />
        </div>
      </section>
    )
  }

  if (products.length === 0) return null

  return (
    // تم تقليل pt (Padding Top) إلى 10 لحل مشكلة الفراغ الكبير مع السكشن السابق
    <section className='pt-10 pb-16 bg-background'>
      <div className='container mx-auto px-4'>
        {/* Header */}
        <div className='text-center mb-12'>
          <div className='inline-flex items-center gap-2 px-4 py-2 bg-primary/10 rounded-full mb-4'>
            <Sparkles className='h-5 w-5 text-primary fill-current' />
            <span className='text-primary font-semibold'>وصل حديثاً</span>
          </div>
          <h2 className='text-3xl md:text-4xl font-bold mb-4'>أحدث تصاميمنا</h2>
          <p className='text-muted-foreground max-w-2xl mx-auto'>
            اكتشفي تشكيلتنا الجديدة لموسم 2025 التي وصلت لمتجرنا الآن
          </p>
        </div>

        {/* Products Grid */}
        <div className='grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6 mb-8'>
          {products.map((product) => (
            <ProductCard key={product._id} product={product} />
          ))}
        </div>

        {/* View All Button */}
        <div className='text-center'>
          <Link href='/shop?sort=-createdAt'>
            <Button
              variant='outline'
              size='lg'
              className='hover:bg-primary hover:text-white transition-all'
            >
              عرض جميع المنتجات الجديدة
              <ChevronLeft className='mr-2 h-4 w-4' />
            </Button>
          </Link>
        </div>
      </div>
    </section>
  )
}
