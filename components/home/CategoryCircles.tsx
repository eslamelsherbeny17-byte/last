'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { LayoutGrid, ChevronLeft, Loader2 } from 'lucide-react'
import { cn, getImageUrl } from '@/lib/utils'
import { useLanguage } from '@/contexts/LanguageContext'
import { categoriesAPI } from '@/lib/api' 
import type { Category } from '@/lib/types'
import { motion } from 'framer-motion'
import { Button } from '@/components/ui/button'

export function CategoryCircles() {
  const { language, isRTL } = useLanguage()
  const [categories, setCategories] = useState<Category[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        setIsLoading(true)
        const data = await categoriesAPI.getAll()
        if (Array.isArray(data)) {
          // عرض أول 10 فئات وعكس الترتيب
          setCategories([...data].reverse().slice(0, 10))
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
      <div className='py-20 flex justify-center items-center bg-background'>
        <Loader2 className='h-8 w-8 animate-spin text-primary' />
      </div>
    )
  }

  return (
    <section className='py-12 sm:py-20 bg-background transition-colors duration-500' aria-labelledby='categories-heading'>
      <div className='container mx-auto px-4'>
        
        {/* --- العنوان المركزي --- */}
        <div className='flex flex-col items-center text-center mb-10 sm:mb-16'>
          <div className='flex items-center gap-2 bg-primary/10 text-primary px-4 py-1.5 rounded-full mb-4 shadow-sm border border-primary/5'>
            <LayoutGrid className='w-4 h-4' />
            <span className='text-[10px] sm:text-xs font-black uppercase tracking-widest'>
              {language === 'ar' ? 'اكتشفي عالمنا' : 'Explore Our World'}
            </span>
          </div>
          
          <h2 id='categories-heading' className='text-2xl sm:text-4xl font-black text-foreground mb-3 tracking-tight'>
            {language === 'ar' ? 'تسوقي حسب الفئة' : 'Shop by Category'}
          </h2>
          
          <p className='text-muted-foreground text-xs sm:text-sm font-medium max-w-xs sm:max-w-md'>
            {language === 'ar' 
              ? 'اختياراتنا المفضلة لأناقتكِ اليومية في مكان واحد' 
              : 'Our favorite picks for your daily elegance in one place'}
          </p>
        </div>

        {/* --- شبكة الفئات --- */}
        <div className='flex overflow-x-auto sm:grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6 sm:gap-12 pb-10 sm:pb-0 px-2 sm:px-0 scrollbar-none snap-x'>
          {categories.map((category, index) => (
            <motion.div
              key={category._id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.05 }}
            >
              <Link
                href={`/shop?category=${category._id}`}
                className='group flex flex-col items-center min-w-[110px] sm:min-w-0 snap-center'
              >
                {/* الدائرة المحتوية على الصورة */}
                <div className='relative w-24 h-24 sm:w-36 md:w-44 sm:h-36 md:h-44 mb-4'>
                  {/* إطار ديكوري خارجي - تم تعديله للوضع المظلم */}
                  <div className='absolute inset-[-6px] rounded-full border border-border/50 dark:border-zinc-800 group-hover:border-primary/40 transition-all duration-500' />
                  
                  {/* حاوية الصورة - تم استخدام border-background و bg-muted */}
                  <div className='relative w-full h-full rounded-full overflow-hidden border-4 border-background shadow-lg group-hover:shadow-2xl group-hover:shadow-primary/10 transition-all duration-500 bg-muted dark:bg-zinc-900'>
                    <Image
                      src={getImageUrl(category.image || '')}
                      alt={category.name}
                      fill
                      className='object-cover transition-transform duration-700 group-hover:scale-110'
                      sizes='(max-width: 640px) 100px, 200px'
                    />
                  </div>
                </div>

                {/* اسم الفئة */}
                <h3 className='text-sm sm:text-lg font-bold text-foreground group-hover:text-primary transition-colors text-center px-2 line-clamp-1'>
                  {category.name}
                </h3>
              </Link>
            </motion.div>
          ))}
        </div>

        {/* --- زر "عرض كافة الفئات" --- */}
        <div className='mt-12 sm:mt-20 flex justify-center'>
          <Link href="/categories">
            <Button 
              variant="outline" 
              className='rounded-full border-2 font-black px-10 h-12 sm:h-14 hover:bg-primary hover:text-primary-foreground dark:border-zinc-800 dark:hover:border-primary transition-all gap-3 group shadow-md text-sm sm:text-base bg-background'
            >
              {language === 'ar' ? 'عرض كافة الفئات' : 'View All Categories'}
              <ChevronLeft className={cn("w-5 h-5 transition-transform group-hover:-translate-x-2", !isRTL && "rotate-180 group-hover:translate-x-2")} />
            </Button>
          </Link>
        </div>

      </div>

      <style jsx global>{`
        .scrollbar-none::-webkit-scrollbar { display: none; }
        .scrollbar-none { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>
    </section>
  )
}