'use client'

import { useState, useRef, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { Search, Loader2, ArrowRight, X, SearchX, ExternalLink } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { productsAPI } from '@/lib/api'
import type { Product } from '@/lib/types'
import { cn, getImageUrl } from '@/lib/utils'

interface NavSearchProps {
  isMobile?: boolean
  language: string
  t: any
  isRTL: boolean
  isOpen?: boolean
  setIsOpen?: (isOpen: boolean) => void
}

export function NavSearch({ isMobile, language, t, isRTL, isOpen, setIsOpen }: NavSearchProps) {
  const router = useRouter()
  const [searchQuery, setSearchQuery] = useState('')
  const [searchResults, setSearchResults] = useState<Product[]>([])
  const [isSearching, setIsSearching] = useState(false)
  const [showResults, setShowResults] = useState(false)
  
  const searchTimeoutRef = useRef<NodeJS.Timeout>()
  const searchRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  // ✨ معالجة البحث بدون تقطيع
 useEffect(() => {
    let isMounted = true;
    
    // 1. هنا الإضافة اللي كنت بتسأل عليها (الخروج المبكر)
    if (!searchQuery.trim()) {
      setSearchResults([]);
      setIsSearching(false);
      return; 
    }

    if (searchTimeoutRef.current) clearTimeout(searchTimeoutRef.current)
    
    setIsSearching(true)
    setShowResults(true)
    
    // 2. تأخير الريكويست
    searchTimeoutRef.current = setTimeout(async () => {
      try {
        const response = await productsAPI.getAll({ keyword: searchQuery.trim(), limit: 6 })
        if (!isMounted) return;

        let productsArray: Product[] = []
        if (response && Array.isArray(response.data)) {
            productsArray = response.data
        } else if (response && (response as any).data && Array.isArray((response as any).data.data)) {
            productsArray = (response as any).data.data
        }
        
        setSearchResults(productsArray)
      } catch (error) {
        console.error("Search error:", error)
        if (isMounted) setSearchResults([])
      } finally {
        if (isMounted) setIsSearching(false)
      }
    }, 300)
    
    return () => { 
      isMounted = false;
      if (searchTimeoutRef.current) clearTimeout(searchTimeoutRef.current) 
    }
  }, [searchQuery])
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setShowResults(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const executeSearch = (query: string) => {
    if (query.trim()) {
      router.push(`/shop?search=${encodeURIComponent(query.trim())}`)
      setSearchQuery('')
      setShowResults(false)
      if (setIsOpen) setIsOpen(false)
    }
  }

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    executeSearch(searchQuery)
  }

  const clearSearch = () => {
    setSearchQuery('')
    if (inputRef.current) inputRef.current.focus()
  }

  // ✨ تم تحويل العناصر لـ Variables عشان React ميمسحش المربع أثناء الكتابة
  const SearchInputJSX = (
    <form onSubmit={handleSearch} className="relative flex items-center w-full">
      <Search className={cn('absolute h-4 w-4 text-gray-400 z-10 transition-colors', isSearching && 'text-primary', isRTL ? 'right-3.5' : 'left-3.5')} />
      <Input
        ref={inputRef}
        type='text'
        placeholder={t('search') + '...'}
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        onFocus={() => setShowResults(true)}
        className={cn(
          'h-10 w-full rounded-full border-transparent bg-gray-100 dark:bg-gray-800/80 focus-visible:bg-background focus-visible:ring-1 focus-visible:ring-primary focus-visible:border-primary transition-all shadow-none',
          isRTL ? 'pr-10 pl-10' : 'pl-10 pr-10',
          !isMobile && 'md:w-[200px] lg:w-[280px] xl:w-[340px]' // حجم ثابت في الديسكتوب
        )}
        autoComplete="off"
      />
      <div className={cn('absolute flex items-center z-10', isRTL ? 'left-3' : 'right-3')}>
        {isSearching ? (
          <Loader2 className='h-4 w-4 animate-spin text-primary' />
        ) : searchQuery ? (
          <button type="button" onClick={clearSearch} className="text-gray-400 hover:text-gray-700 dark:hover:text-gray-200">
            <X className="h-3.5 w-3.5" />
          </button>
        ) : null}
      </div>
    </form>
  )

  const SearchResultsJSX = (
    <div className="flex flex-col w-full">
      {/* 1. السكيليتون (شكل التحميل) */}
      {isSearching && searchQuery && (
        <div className="py-4 px-2 space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="flex items-center gap-3 animate-pulse px-3">
              <div className="w-12 h-12 rounded-lg bg-gray-200 dark:bg-gray-800 shrink-0"></div>
              <div className="flex-1 space-y-2">
                <div className="h-3 w-3/4 bg-gray-200 dark:bg-gray-800 rounded"></div>
                <div className="h-3 w-1/4 bg-gray-200 dark:bg-gray-800 rounded"></div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* 2. عرض النتائج */}
      {!isSearching && searchResults.length > 0 && searchQuery && (
        <div className="py-2 max-h-[60vh] md:max-h-[350px] overflow-y-auto scrollbar-thin">
          <div className="px-4 pb-2 text-[11px] font-bold text-gray-400 uppercase">
            {language === 'ar' ? 'المنتجات' : 'Products'}
          </div>
          
          {searchResults.map((product) => (
            <button
              key={product._id}
              type='button'
              onClick={() => {
                router.push(`/product/${product._id}`)
                setShowResults(false)
                setSearchQuery('')
                if (setIsOpen) setIsOpen(false)
              }}
              className='w-full flex items-center gap-3 py-2.5 px-4 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors group'
            >
              <div className='relative w-12 h-12 rounded-md overflow-hidden bg-white border border-gray-100 dark:border-gray-800 shrink-0'>
                <img 
                  src={product.imageCover ? getImageUrl(product.imageCover) : '/placeholder.svg'} 
                  alt={product.title}
                  onError={(e) => { e.currentTarget.src = '/placeholder.svg' }}
                  className='w-full h-full object-cover group-hover:scale-105 transition-transform' 
                />
              </div>
              <div className={cn('flex-1 min-w-0', isRTL ? 'text-right' : 'text-left')}>
                <p className='font-semibold text-sm line-clamp-1 text-gray-800 dark:text-gray-200 group-hover:text-primary transition-colors'>
                  {isRTL ? (product.titleAr || product.title) : product.title}
                </p>
                <div className="flex items-center gap-2 mt-0.5">
                  <p className='text-xs font-bold text-primary'>
                    {product.price} {language === 'ar' ? 'جنيه' : 'EGP'}
                  </p>
                </div>
              </div>
              <ArrowRight className={cn('h-4 w-4 text-gray-300 group-hover:text-primary shrink-0', isRTL && 'rotate-180')} />
            </button>
          ))}
          <div className="px-3 mt-2">
            <Button variant="outline" className="w-full text-xs font-bold bg-gray-50 dark:bg-gray-900 border-dashed" onClick={() => executeSearch(searchQuery)}>
              {language === 'ar' ? `عرض كل النتائج` : `View all results`}
              <ExternalLink className={cn("h-3.5 w-3.5", isRTL ? "mr-2" : "ml-2")} />
            </Button>
          </div>
        </div>
      )}

      {/* 3. لا توجد نتائج */}
      {!isSearching && searchResults.length === 0 && searchQuery && (
        <div className="py-10 px-4 flex flex-col items-center text-center">
          <div className="w-12 h-12 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center mb-3 text-gray-400">
            <SearchX className="h-5 w-5" />
          </div>
          <p className="text-sm font-semibold text-gray-800 dark:text-gray-200">
            {language === 'ar' ? 'لم نجد أي منتج!' : 'No results found'}
          </p>
          <p className="text-xs text-gray-400 mt-1">
            {language === 'ar' ? 'جرب استخدام كلمات مختلفة للبحث' : 'Try different keywords.'}
          </p>
        </div>
      )}

      {/* 4. البحث السريع (يظهر قبل الكتابة) */}
      {!searchQuery && (
        <div className='p-4'>
          <p className='text-[11px] font-bold text-gray-400 uppercase mb-3'>
            {language === 'ar' ? 'الأكثر بحثاً' : 'Popular Searches'}
          </p>
          <div className='flex flex-wrap gap-2'>
            {(language === 'ar' ? ['عباءات', 'حجاب', 'تخفيضات'] : ['Abayas', 'Hijabs', 'Sale']).map((term) => (
              <button key={term} type='button' onClick={() => executeSearch(term)} className='text-xs px-3 py-1.5 rounded-md bg-gray-100 dark:bg-gray-800 hover:bg-primary/10 hover:text-primary font-medium transition-colors'>
                {term}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  )

  // عرض الموبايل (نافذة منسدلة)
  if (isMobile) {
    return (
      <AnimatePresence>
        {isOpen && (
          <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className='md:hidden absolute top-full left-0 right-0 z-50 bg-background border-b shadow-2xl'>
            <div className="p-3 border-b border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-900/50">
              {SearchInputJSX}
            </div>
            <div className="bg-background max-h-[70vh] overflow-y-auto">
              {SearchResultsJSX}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    )
  }

  // عرض الكمبيوتر (مربع بحث دائم الظهور)
  return (
    <>
      <AnimatePresence>
        {showResults && <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className='fixed inset-0 bg-black/20 backdrop-blur-sm z-40' onClick={() => setShowResults(false)} />}
      </AnimatePresence>
      
      <div className='hidden md:block relative z-50' ref={searchRef}>
        {SearchInputJSX}
        
        <AnimatePresence>
          {showResults && (
            <motion.div initial={{ opacity: 0, y: 10, scale: 0.98 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 10, scale: 0.98 }} className={cn('absolute top-[calc(100%+8px)] w-[380px] bg-background border border-gray-100 dark:border-gray-800 rounded-xl shadow-xl overflow-hidden', isRTL ? 'left-0' : 'right-0')}>
              {SearchResultsJSX}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </>
  )
}