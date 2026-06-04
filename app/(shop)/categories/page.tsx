'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { LayoutGrid, Loader2, ChevronRight, Home } from 'lucide-react'
import { motion } from 'framer-motion'
import { cn, getImageUrl } from '@/lib/utils'
import { useLanguage } from '@/contexts/LanguageContext'
import { categoriesAPI } from '@/lib/api'
import type { Category } from '@/lib/types'

export default function AllCategoriesPage() {
  const { language, isRTL, t } = useLanguage()
  const [categories, setCategories] = useState<Category[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        setIsLoading(true)
        const data = await categoriesAPI.getAll()
        if (Array.isArray(data)) {
          // عرض الفئات بترتيبها الأصلي أو المعكوس حسب رغبتك
          setCategories([...data].reverse())
        }
      } catch (err) {
        console.error('Failed to fetch categories:', err)
      } finally {
        setIsLoading(false)
      }
    }
    fetchCategories()
  }, [])

  if (isLoading) {
    return (
      <div className='min-h-[60vh] flex flex-col items-center justify-center'>
        <Loader2 className='h-12 w-12 animate-spin text-primary mb-4' />
        <p className='text-muted-foreground animate-pulse font-bold'>
          {language === 'ar' ? 'جاري تحميل عالم الأناقة...' : 'Loading our world of elegance...'}
        </p>
      </div>
    )
  }

  return (
    <div className='min-h-screen bg-background pb-20'>
      {/* --- Breadcrumbs --- */}
      <div className='bg-muted/30 py-4 border-b'>
        <div className='container mx-auto px-4'>
          <nav className='flex items-center gap-2 text-sm font-medium text-muted-foreground'>
            <Link href="/" className='hover:text-primary transition-colors flex items-center gap-1'>
              <Home className='w-4 h-4' />
              {language === 'ar' ? 'الرئيسية' : 'Home'}
            </Link>
            <ChevronRight className={cn("w-4 h-4", isRTL && "rotate-180")} />
            <span className='text-foreground font-bold'>
              {language === 'ar' ? 'كافة الفئات' : 'All Categories'}
            </span>
          </nav>
        </div>
      </div>

      <div className='container mx-auto px-4 pt-10 sm:pt-16'>
        {/* --- Page Header (Centered Like Home Sections) --- */}
        <div className='flex flex-col items-center text-center mb-12 sm:mb-20'>
          <div className='flex items-center gap-2 bg-primary/10 text-primary px-4 py-1.5 rounded-full mb-4 shadow-sm'>
            <LayoutGrid className='w-4 h-4' />
            <span className='text-[10px] sm:text-xs font-black uppercase tracking-widest'>
              {language === 'ar' ? 'تصفحي حسب ذوقك' : 'Browse by style'}
            </span>
          </div>
          
          <h1 className='text-3xl sm:text-5xl font-black text-foreground mb-4'>
            {language === 'ar' ? 'كافة التصنيفات' : 'All Categories'}
          </h1>
          <p className='text-muted-foreground text-sm sm:text-base max-w-md'>
            {language === 'ar' 
              ? 'اكتشفي مجموعتنا الواسعة من الأزياء المختارة بعناية لتناسب كل مناسباتك' 
              : 'Discover our wide range of carefully selected fashion for all your occasions'}
          </p>
        </div>

        {/* --- Categories Grid --- */}
        <div className='grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 sm:gap-10'>
          {categories.map((category, index) => (
            <motion.div
              key={category._id}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.05 }}
            >
              <Link
                href={`/shop?category=${category._id}`}
                className='group flex flex-col items-center'
              >
                <div className='relative w-full aspect-square max-w-[280px] mb-6'>
                  {/* الديكور الخلفي (الظل والحلقة) */}
                  <div className='absolute inset-0 rounded-full bg-muted/50 transition-all duration-500 group-hover:scale-105 group-hover:bg-primary/5' />
                  
                  {/* الدائرة الأساسية للصورة */}
                  <div className='relative w-full h-full rounded-full overflow-hidden border-4 border-background shadow-xl group-hover:shadow-2xl transition-all duration-500 bg-white'>
                    <Image
                      src={getImageUrl(category.image || '')}
                      alt={category.name}
                      fill
                      className='object-cover transition-transform duration-700 group-hover:scale-110'
                      sizes='(max-width: 640px) 50vw, 30vw'
                    />
                  </div>
                  
                  {/* Badge صغير يظهر عند الـ Hover */}
                  <div className='absolute bottom-2 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-all duration-300 translate-y-2 group-hover:translate-y-0'>
                    <span className='bg-primary text-white text-[10px] font-bold px-3 py-1 rounded-full shadow-lg'>
                        {language === 'ar' ? 'تسوقي الآن' : 'Shop Now'}
                    </span>
                  </div>
                </div>

                <h3 className='text-lg sm:text-xl font-black group-hover:text-primary transition-colors text-center'>
                  {category.name}
                </h3>
                {/* يمكنك إضافة عدد المنتجات هنا إذا كان متوفراً في الباك إيند */}
                <p className='text-xs text-muted-foreground mt-1 font-medium'>
                   {language === 'ar' ? 'اكتشفي المجموعة' : 'Explore collection'}
                </p>
              </Link>
            </motion.div>
          ))}
        </div>

        {/* --- Empty State --- */}
        {categories.length === 0 && !isLoading && (
            <div className='text-center py-20'>
                <p className='text-muted-foreground'>{language === 'ar' ? 'لا توجد فئات حالياً' : 'No categories found'}</p>
            </div>
        )}
      </div>
    </div>
  )
}
