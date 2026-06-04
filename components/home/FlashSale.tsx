'use client'

import { useEffect, useState } from 'react'
import { ProductCard } from '@/components/products/ProductCard'
import { Button } from '@/components/ui/button'
import { ChevronLeft, Zap, Loader2 } from 'lucide-react'
import Link from 'next/link'
import { productsAPI } from '@/lib/api'
import type { Product } from '@/lib/types'

export function FlashSale() {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true)
        
        // ✅ طلب المنتجات المخفضة مباشرة من السيرفر باستخدام المعيار الجديد
        const response = await productsAPI.getAll({ 
          limit: 4, 
          isDiscounted: 'true', // الفلتر الذي أضفناه في apiFeatures.js
          sort: '-createdAt' 
        })
        
        // نأخذ البيانات من response.data بناءً على هيكل الـ JSON الخاص بك
        setProducts(response.data || [])
      } catch (error) {
        console.error('Flash sale error:', error)
      } finally {
        setLoading(false)
      }
    }
    fetchProducts()
  }, [])

  // حالة التحميل: عرض مؤشر تحميل بسيط بدلاً من الإخفاء التام لضمان تجربة مستخدم أفضل
  if (loading) return (
    <div className="py-20 flex justify-center bg-orange-50/20">
      <Loader2 className="animate-spin text-orange-500 h-8 w-8" />
    </div>
  )

  // إذا لم توجد منتجات مخفضة، يختفي القسم تماماً
  if (products.length === 0) return null

  return (
    <section className='py-16 bg-orange-50/30 dark:bg-orange-950/10 border-y border-orange-100 dark:border-orange-900/30'>
      <div className='container mx-auto px-4'>
        {/* رأس القسم */}
        <div className='flex flex-col items-center text-center mb-12'>
          <div className='inline-flex items-center gap-2 px-4 py-2 bg-orange-500/10 rounded-full mb-4 shadow-sm'>
            <Zap className='h-5 w-5 text-orange-500 fill-current animate-pulse' />
            <span className='text-orange-600 font-black text-sm uppercase tracking-tighter'>
               عروض حصرية لفترة محدودة 🔥
            </span>
          </div>
          <h2 className='text-3xl md:text-5xl font-black mb-4 tracking-tight text-foreground'>
            تخفيضات لا تفوت
          </h2>
          <div className="h-1.5 w-20 bg-orange-500 rounded-full" />
        </div>

        {/* شبكة المنتجات */}
        <div className='grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-8'>
          {products.map((product) => (
            <ProductCard key={product._id} product={product} />
          ))}
        </div>

        {/* زر عرض المزيد */}
        <div className='mt-12 text-center'>
          <Link href='/shop?sale=true'>
            <Button 
              variant='outline' 
              size='lg' 
              className='rounded-full border-2 border-orange-200 px-10 h-14 hover:bg-orange-500 hover:text-white hover:border-orange-500 transition-all font-black text-lg shadow-sm'
            >
              استكشف كل العروض
              <ChevronLeft className='mr-2 h-5 w-5' />
            </Button>
          </Link>
        </div>
      </div>
    </section>
  )
}