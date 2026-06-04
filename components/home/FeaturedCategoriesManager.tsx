'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { ChevronLeft, Sparkles, Loader2, TrendingUp } from 'lucide-react'
import { productsAPI } from '@/lib/api'
import { ProductCard } from '@/components/products/ProductCard'
import { Button } from '@/components/ui/button'
import { useLanguage } from '@/contexts/LanguageContext'
import { cn } from '@/lib/utils'
import type { Product, Category } from '@/lib/types'

// مكون داخلي لعرض كل قسم
function SingleCategorySection({ category, index }: { category: Category; index: number }) {
  const { language, isRTL } = useLanguage()
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await productsAPI.getAll({
          category: category._id,
          limit: 4,
          sort: '-createdAt',
        })
        setProducts(response.data || [])
      } catch (error) {
        console.error('Error fetching products:', error)
      } finally {
        setLoading(false)
      }
    }
    fetchProducts()
  }, [category._id])

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
    <section className='pt-10 pb-16 bg-background'>
      <div className='container mx-auto px-4'>
        {/* الرأس (Header) */}
        <div className='text-center mb-12'>
          <div className='inline-flex items-center gap-2 px-4 py-2 bg-primary/10 rounded-full mb-4'>
            {index === 0 ? (
              <>
                <TrendingUp className='h-5 w-5 text-primary' />
                <span className='text-primary font-semibold'>
                  {language === 'ar' ? 'الأكثر طلباً' : 'Bestsellers'}
                </span>
              </>
            ) : (
              <>
                <Sparkles className='h-5 w-5 text-primary fill-current' />
                <span className='text-primary font-semibold'>
                  {language === 'ar' ? 'تشكيلة مختارة' : 'Curated Selection'}
                </span>
              </>
            )}
          </div>
          <h2 className='text-3xl md:text-4xl font-bold mb-4'>
            {category.name}
          </h2>
          <p className='text-muted-foreground max-w-2xl mx-auto'>
            {language === 'ar' 
              ? `اكتشفي أفضل منتجات ${category.name}` 
              : `Discover the best ${category.name} products`
            }
          </p>
        </div>

        {/* شبكة المنتجات */}
        <div className='grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6 mb-8'>
          {products.map((product) => (
            <ProductCard key={product._id} product={product} />
          ))}
        </div>

        {/* زر عرض الكل - بنفس تأثير الـ Hover البرتقالي */}
        <div className='text-center'>
          <Link href={`/shop?category=${category._id}`}>
            <Button 
              variant='outline' 
              size='lg'
              className='hover:bg-primary hover:text-white transition-all'
            >
              {language === 'ar' 
                ? `عرض جميع منتجات ${category.name}` 
                : `View All ${category.name}`
              }
              <ChevronLeft className={cn(
                'h-4 w-4',
                isRTL ? 'mr-2 rotate-180' : 'ml-2'
              )} />
            </Button>
          </Link>
        </div>
      </div>
    </section>
  )
}

export function FeaturedCategoriesManager() {
  const [featuredCategories, setFeaturedCategories] = useState<Category[]>([])
  const [isInitialLoading, setIsInitialLoading] = useState(true)

  useEffect(() => {
    const loadFeatured = async () => {
      try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/categories?showOnHomePage=true`)
        const json = await response.json()
        setFeaturedCategories(json.data || [])
      } catch (error) {
        console.error('Failed to load featured categories')
      } finally {
        setIsInitialLoading(false)
      }
    }
    loadFeatured()
  }, [])

  if (isInitialLoading) {
    return (
      <section className='py-10 bg-background'>
        <div className='flex justify-center items-center min-h-[300px]'>
          <Loader2 className='h-10 w-10 animate-spin text-primary' />
        </div>
      </section>
    )
  }

  if (featuredCategories.length === 0) return null

  return (
    <>
      {featuredCategories.map((category, index) => (
        <SingleCategorySection 
          key={category._id} 
          category={category} 
          index={index} 
        />
      ))}
    </>
  )
}