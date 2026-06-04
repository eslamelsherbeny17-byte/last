'use client'

import { useState, useEffect, Suspense, useCallback } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { FilterSidebar } from '@/components/products/FilterSidebar'
import { ProductGrid } from '@/components/products/ProductGrid'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { productsAPI, categoriesAPI, brandsAPI } from '@/lib/api'
import type { Product, Category, Brand } from '@/lib/types'
import { Grid3x3, LayoutGrid, Loader2, SearchX } from 'lucide-react'
import { useLanguage } from '@/contexts/LanguageContext'

function ShopContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const { t, language } = useLanguage()

  const [products, setProducts] = useState<Product[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [brands, setBrands] = useState<Brand[]>([])
  const [loading, setLoading] = useState(true)
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [sortBy, setSortBy] = useState('newest')
  const [activeFilters, setActiveFilters] = useState<any>({})

  const [categorySlugMap, setCategorySlugMap] = useState<{[key: string]: string}>({})
  const [isCategoriesLoaded, setIsCategoriesLoaded] = useState(false)

  const categoryParam = searchParams.get('category')
  const searchParam = searchParams.get('search')
  const saleParam = searchParams.get('sale')

  const fetchCategories = async () => {
    try {
      const data = await categoriesAPI.getAll()
      setCategories(data || [])
      
      const slugMap: {[key: string]: string} = {}
      if (data && Array.isArray(data)) {
        data.forEach((cat: Category) => {
          slugMap[cat.slug] = cat._id
        })
      }
      setCategorySlugMap(slugMap)
    } catch (error) {
      console.error('Failed to fetch categories:', error)
    } finally {
      // ✨ نؤكد أن الأقسام تم تحميلها سواء نجحت أو فشلت لتجنب تعليق الصفحة
      setIsCategoriesLoaded(true)
    }
  }

  const fetchBrands = async () => {
    try {
      const data = await brandsAPI.getAll()
      setBrands(data || [])
    } catch (error) {
      console.error('Failed to fetch brands:', error)
    }
  }

  useEffect(() => {
    fetchCategories()
    fetchBrands()
  }, [])

  // Handle Filter Change
  const handleFilterChange = useCallback((filters: any) => {
    setActiveFilters(filters || {})
    setCurrentPage(1)
  }, [])

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const params: any = {
        page: currentPage,
        limit: 12,
      };

      if (sortBy === 'price-low') params.sort = 'price';
      else if (sortBy === 'price-high') params.sort = '-price';
      else if (sortBy === 'newest') params.sort = '-createdAt';
      else if (sortBy === 'rating') params.sort = '-ratingsAverage';
      else if (sortBy === 'bestsellers') params.sort = '-sold';

      // ✨ حماية قوية: تجاهل قيمة "all" لأنها بتدمر الـ Database Query
      const selectedCategory = activeFilters.category;
      if (selectedCategory && selectedCategory !== 'all' && selectedCategory.length > 0) {
        params.category = selectedCategory;
      } else if (categoryParam && categoryParam !== 'all') {
        const categoryId = categorySlugMap[categoryParam]
        params.category = categoryId ? categoryId : categoryParam
      }

      const selectedBrand = activeFilters.brand;
      if (selectedBrand && selectedBrand !== 'all' && selectedBrand.length > 0) {
        params.brand = selectedBrand;
      }

      if (activeFilters.priceMin) params.priceMin = activeFilters.priceMin;
      if (activeFilters.priceMax) params.priceMax = activeFilters.priceMax;

      if (saleParam === 'true' || activeFilters.sale) {
        params.isDiscounted = 'true'; 
      }

      if (searchParam) params.keyword = searchParam;

      const response = await productsAPI.getAll(params);
      
      // ✨ استخراج ذكي للمصفوفة زي ما عملنا في الناف بار بالضبط
      let productsArray: Product[] = [];
      if (response && Array.isArray(response.data)) {
          productsArray = response.data;
      } else if (response && response.data && Array.isArray((response.data as any).data)) {
          productsArray = (response.data as any).data;
      } else if (Array.isArray(response)) {
          productsArray = response;
      }
      
      setProducts(productsArray);
      setTotalPages(response?.paginationResult?.numberOfPages || 1);
    } catch (error) {
      console.error('Failed to fetch products:', error);
      setProducts([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // ✨ لا نطلب المنتجات إلا بعد اكتمال تحميل خريطة الأقسام لتجنب الـ Race Condition
    if (categoryParam) {
      if (isCategoriesLoaded) {
        fetchProducts()
      }
    } else {
      fetchProducts()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentPage, sortBy, categoryParam, searchParam, saleParam, activeFilters, isCategoriesLoaded])

  return (
    <div className='min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-950 dark:to-gray-900 py-4 md:py-8'>
      <div className='container mx-auto px-3 md:px-4'>
        <div className='mb-4 md:mb-6 text-xs md:text-sm text-muted-foreground dark:text-gray-400'>
          <span>{t('home')}</span>
          <span className='mx-2'>/</span>
          <span className='text-foreground dark:text-white'>{t('shop')}</span>
        </div>

        <div className='mb-6 md:mb-8'>
          <h1 className='text-2xl md:text-3xl lg:text-4xl font-bold mb-2 text-gray-900 dark:text-white'>
            {searchParam ? `${t('search')}: ${searchParam}` : t('shop')}
          </h1>
          <p className='text-sm md:text-base text-muted-foreground dark:text-gray-400'>
            {t('searchProducts')}
          </p>
        </div>

        <div className='flex flex-col lg:flex-row gap-4 md:gap-6'>
          <FilterSidebar
            categories={categories}
            brands={brands}
            onFilterChange={handleFilterChange}
          />

          <div className='flex-1 min-w-0'>
            <div className='flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4 md:mb-6 bg-white dark:bg-gray-900 p-3 md:p-4 rounded-lg border border-gray-200 dark:border-gray-800 shadow-sm'>
              <div className='flex items-center gap-2'>
                <span className='text-xs md:text-sm text-muted-foreground dark:text-gray-400 font-medium'>
                  {loading
                    ? t('loading')
                    : `${products.length} ${t('products')}`}
                </span>
              </div>

              <div className='flex items-center gap-2 md:gap-3'>
                <Select value={sortBy} onValueChange={setSortBy}>
                  <SelectTrigger className='w-full sm:w-[180px] h-9 md:h-10 text-xs md:text-sm bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white shadow-sm'>
                    <SelectValue placeholder={t('sortBy')} />
                  </SelectTrigger>
                  <SelectContent className='bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700'>
                    <SelectItem value='newest' className='dark:text-white dark:focus:bg-gray-700'>{t('newest')}</SelectItem>
                    <SelectItem value='bestsellers' className='dark:text-white dark:focus:bg-gray-700'>{t('bestSellers')}</SelectItem>
                    <SelectItem value='price-low' className='dark:text-white dark:focus:bg-gray-700'>{t('priceLowToHigh')}</SelectItem>
                    <SelectItem value='price-high' className='dark:text-white dark:focus:bg-gray-700'>{t('priceHighToLow')}</SelectItem>
                    <SelectItem value='rating' className='dark:text-white dark:focus:bg-gray-700'>{t('topRated')}</SelectItem>
                  </SelectContent>
                </Select>

                <div className='hidden md:flex gap-1 border border-gray-200 dark:border-gray-700 rounded-lg p-1 bg-white dark:bg-gray-800 shadow-sm'>
                  <Button variant='ghost' size='icon' className='h-8 w-8 dark:hover:bg-gray-700'><Grid3x3 className='h-4 w-4 text-gray-700 dark:text-gray-300' /></Button>
                  <Button variant='ghost' size='icon' className='h-8 w-8 dark:hover:bg-gray-700'><LayoutGrid className='h-4 w-4 text-gray-700 dark:text-gray-300' /></Button>
                </div>
              </div>
            </div>

            {/* ✨ تصميم جديد لحالة "لا توجد منتجات" */}
            {loading ? (
              <div className='flex items-center justify-center py-12 md:py-20'>
                <Loader2 className='h-10 w-10 md:h-12 md:w-12 animate-spin text-primary' />
              </div>
            ) : products.length === 0 ? (
              <div className='flex flex-col items-center justify-center py-16 md:py-24 text-center bg-white dark:bg-gray-900 rounded-xl border border-gray-100 dark:border-gray-800 shadow-sm'>
                <div className="w-16 h-16 bg-gray-50 dark:bg-gray-800 rounded-full flex items-center justify-center mb-4 text-gray-400">
                  <SearchX className="h-8 w-8" />
                </div>
                <p className='text-lg font-bold text-gray-900 dark:text-white mb-2'>
                  {language === 'ar' ? 'لا توجد منتجات!' : 'No products found!'}
                </p>
                <p className='text-sm text-muted-foreground mb-6 max-w-sm'>
                  {language === 'ar' ? 'لم نتمكن من العثور على منتجات تطابق بحثك أو الفلاتر المحددة.' : 'We couldn\'t find any products matching your search or selected filters.'}
                </p>
                <Button 
                  variant='default' 
                  className="font-bold px-8 shadow-none"
                  onClick={() => {
                    setActiveFilters({})
                    setCurrentPage(1)
                    router.push('/shop')
                  }}
                >
                  {language === 'ar' ? 'عرض كل المنتجات' : 'View All Products'}
                </Button>
              </div>
            ) : (
              <ProductGrid products={products} />
            )}

            {totalPages > 1 && !loading && products.length > 0 && (
              <div className='flex justify-center items-center gap-2 mt-8 md:mt-12 flex-wrap'>
                <Button
                  variant='outline'
                  size='sm'
                  disabled={currentPage === 1}
                  onClick={() => setCurrentPage((prev) => prev - 1)}
                  className='text-xs md:text-sm dark:bg-gray-800 dark:border-gray-700 dark:text-white dark:hover:bg-gray-700'
                >
                  {t('previous')}
                </Button>

                {[...Array(totalPages)].map((_, i) => (
                  <Button
                    key={i}
                    variant={currentPage === i + 1 ? 'default' : 'outline'}
                    size='sm'
                    className={
                      currentPage === i + 1
                        ? 'bg-primary text-primary-foreground hover:bg-primary/90'
                        : 'dark:bg-gray-800 dark:border-gray-700 dark:text-white dark:hover:bg-gray-700'
                    }
                    onClick={() => setCurrentPage(i + 1)}
                  >
                    {i + 1}
                  </Button>
                ))}

                <Button
                  variant='outline'
                  size='sm'
                  disabled={currentPage === totalPages}
                  onClick={() => setCurrentPage((prev) => prev + 1)}
                  className='text-xs md:text-sm dark:bg-gray-800 dark:border-gray-700 dark:text-white dark:hover:bg-gray-700'
                >
                  {t('next')}
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default function ShopPage() {
  return (
    <Suspense
      fallback={
        <div className='flex items-center justify-center min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-950 dark:to-gray-900'>
          <Loader2 className='h-12 w-12 animate-spin text-primary' />
        </div>
      }
    >
      <ShopContent />
    </Suspense>
  )
}