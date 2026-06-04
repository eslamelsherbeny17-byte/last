'use client'

import { useState, useRef, useEffect, useCallback } from 'react'
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

  // تأثير البحث مع معالجة التقطيع (Debounce)
  useEffect(() => {
    if (searchTimeoutRef.current) clearTimeout(searchTimeoutRef.current)
    
    if (!searchQuery.trim()) {
      setSearchResults([])
      setIsSearching(false)
      return
    }

    setIsSearching(true)
    setShowResults(true)
    
    searchTimeoutRef.current = setTimeout(async () => {
      try {
        const response = await productsAPI.getAll({ keyword: searchQuery.trim(), limit: 5 })
        
        let productsArray: Product[] = []
        if (response && Array.isArray(response.data)) {
            productsArray = response.data
        } else if (response && response.data && Array.isArray((response.data as any).data)) {
            productsArray = (response.data as any).data
        } else if (Array.isArray(response)) {
            productsArray = response
        }
        
        setSearchResults(productsArray)
      } catch (error) {
        console.error("Search error:", error)
        setSearchResults([])
      } finally {
        setIsSearching(false)
      }
    }, 400) // ينتظر 400 ملي ثانية قبل ما يبعت للسيرفر عشان مش كل حرف يعمل لود
    
    return () => { if (searchTimeoutRef.current) clearTimeout(searchTimeoutRef.current) }
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

  // ✨ مربع السيرش المباشر (عشان الماوس ميفصلش)
  const renderSearchInput = () => (
    <form onSubmit={handleSearch} className={cn('relative flex items-center', isMobile && 'mb-2')}>
      <Search className={cn('absolute h-[18px] w-[18px] text-muted-foreground transition-colors', 
        isSearching && 'text-primary',
        isRTL ? 'right-4' : 'left-4'
      )} />
      
      <Input
        ref={inputRef}
        type='text'
        placeholder={t('search') + '...'}
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        onFocus={() => setShowResults(true)}
        className={cn(
          'h-12 w-full rounded-xl border-gray-200 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-900/50 focus-visible:ring-1 focus-visible:ring-primary focus-visible:bg-background transition-all shadow-inner',
          isRTL ? 'pr-11 pl-12' : 'pl-11 pr-12',
          isMobile && 'text-base'
        )}
        autoComplete="off"
      />
      
      <div className={cn('absolute flex items-center gap-1.5', isRTL ? 'left-3' : 'right-3')}>
        {isSearching && <Loader2 className='h-4 w-4 animate-spin text-primary' />}
        
        <AnimatePresence>
          {searchQuery && !isSearching && (
            <motion.button
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              type="button"
              onClick={clearSearch}
              className="h-6 w-6 flex items-center justify-center rounded-full bg-gray-200 dark:bg-gray-800 text-gray-500 hover:text-gray-900 transition-colors"
            >
              <X className="h-3.5 w-3.5" />
            </motion.button>
          )}
        </AnimatePresence>
      </div>
    </form>
  )

  const renderSearchResults = () => (
    <div className="flex flex-col">
      {/* 1. السكيليتون أثناء التحميل */}
      {isSearching && searchQuery && (
        <div className="py-4 px-2 space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="flex items-center gap-3 animate-pulse">
              <div className="w-12 h-12 rounded-lg bg-gray-200 dark:bg-gray-800 flex-shrink-0"></div>
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
        <div className={cn('py-2 max-h-[60vh] md:max-h-80 overflow-y-auto scrollbar-thin', isMobile && 'rounded-xl')}>
          <div className="px-3 pb-2 text-[11px] font-bold tracking-wider text-muted-foreground uppercase">
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
              className='w-full flex items-center gap-3 p-3 hover:bg-gray-50 dark:hover:bg-gray-900/50 transition-colors text-right group'
            >
              <div className='relative w-12 h-12 rounded-lg overflow-hidden bg-white border flex-shrink-0 shadow-sm'>
                <img 
                  src={product.imageCover ? getImageUrl(product.imageCover) : '/placeholder.svg'} 
                  alt={product.title}
                  onError={(e) => { e.currentTarget.src = '/placeholder.svg' }}
                  className='w-full h-full object-cover group-hover:scale-105 transition-transform duration-300' 
                />
              </div>
              <div className={cn('flex-1 min-w-0', isRTL ? 'text-right' : 'text-left')}>
                <p className='font-semibold text-sm line-clamp-1 text-gray-900 dark:text-gray-100 group-hover:text-primary transition-colors'>
                  {isRTL ? (product.titleAr || product.title) : product.title}
                </p>
                <div className="flex items-center gap-2 mt-1">
                  <p className='text-xs font-bold text-primary'>
                    {product.price} {language === 'ar' ? 'جنيه' : 'EGP'}
                  </p>
                </div>
              </div>
              <ArrowRight className={cn('h-4 w-4 text-gray-300 group-hover:text-primary transition-colors flex-shrink-0', isRTL && 'rotate-180')} />
            </button>
          ))}
          
          <div className="p-3 mt-1">
            <Button variant="default" className="w-full text-xs font-bold shadow-none" onClick={() => executeSearch(searchQuery)}>
              {language === 'ar' ? `عرض كل النتائج لـ "${searchQuery}"` : `View all results for "${searchQuery}"`}
              <ExternalLink className={cn("h-3.5 w-3.5", isRTL ? "mr-2" : "ml-2")} />
            </Button>
          </div>
        </div>
      )}

      {/* 3. لا توجد نتائج */}
      {!isSearching && searchResults.length === 0 && searchQuery && (
        <div className="py-12 px-4 flex flex-col items-center justify-center text-center">
          <div className="w-12 h-12 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center mb-3 text-gray-400">
            <SearchX className="h-6 w-6" />
          </div>
          <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">
            {language === 'ar' ? 'لم نتمكن من العثور على نتائج' : 'No results found'}
          </p>
        </div>
      )}

      {/* 4. بحث سريع لو مفيش كتابة */}
      {!searchQuery && (
        <div className='p-4 pt-2'>
          <p className='text-[11px] font-bold tracking-wider text-muted-foreground uppercase mb-3'>
            {language === 'ar' ? 'عمليات بحث شائعة' : 'Popular Searches'}
          </p>
          <div className='flex flex-wrap gap-2'>
            {(language === 'ar' ? ['عباءات', 'تخفيضات', 'حجاب', 'جديدنا'] : ['Abayas', 'Sale', 'Hijabs', 'New']).map((term) => (
              <button key={term} type='button' onClick={() => executeSearch(term)} className='text-xs px-3.5 py-2 rounded-lg bg-gray-100 dark:bg-gray-800 hover:bg-primary/10 hover:text-primary font-medium transition-colors'>
                {term}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  )

  if (isMobile) {
    return (
      <AnimatePresence>
        {isOpen && (
          <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className='md:hidden absolute top-full left-0 right-0 z-50 bg-background border-b shadow-xl'>
            <div className="p-3 border-b border-gray-100 dark:border-gray-800 bg-gray-50/30">
              {renderSearchInput()}
            </div>
            <div className="bg-background max-h-[70vh] overflow-y-auto">
              {renderSearchResults()}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    )
  }

  return (
    <>
      <AnimatePresence>
        {showResults && <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className='fixed inset-0 bg-black/40 backdrop-blur-sm z-40' onClick={() => setShowResults(false)} />}
      </AnimatePresence>
      
      <div className='hidden md:block relative z-50' ref={searchRef}>
        <Button variant='ghost' size='icon' className={cn('h-10 w-10 rounded-full transition-all duration-200', showResults ? 'bg-primary text-primary-foreground shadow-md' : 'hover:bg-gray-100 dark:hover:bg-gray-800')} onClick={() => { setShowResults(!showResults); if (!showResults) setTimeout(() => inputRef.current?.focus(), 100) }}>
          <Search className='h-[18px] w-[18px]' />
        </Button>
        
        <AnimatePresence>
          {showResults && (
            <motion.div initial={{ opacity: 0, y: 10, scale: 0.98 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 10, scale: 0.98 }} className={cn('absolute top-[calc(100%+12px)] w-[420px] bg-background border border-gray-100 rounded-2xl shadow-2xl overflow-hidden', isRTL ? 'left-0' : 'right-0')}>
              <div className='p-3 border-b border-gray-100 bg-gray-50/50'>
                {renderSearchInput()}
              </div>
              {renderSearchResults()}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </>
  )
}