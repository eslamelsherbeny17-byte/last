'use client'

import { useState, useRef, useEffect, useCallback } from 'react'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { Search, Loader2, ArrowRight } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { productsAPI } from '@/lib/api'
import type { Product } from '@/lib/types'
// ✨ التعديل: استدعينا getImageUrl عشان الصور تظهر دايماً سليمة
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

  useEffect(() => {
    if (searchTimeoutRef.current) clearTimeout(searchTimeoutRef.current)
    if (!searchQuery.trim()) {
      setSearchResults([])
      setShowResults(false)
      setIsSearching(false)
      return
    }

    setIsSearching(true)
    searchTimeoutRef.current = setTimeout(async () => {
      try {
        const response = await productsAPI.getAll({ keyword: searchQuery.trim(), limit: 5 })
        setSearchResults(response.data || [])
        setShowResults(true)
      } catch (error) {
        setSearchResults([])
      } finally {
        setIsSearching(false)
      }
    }, 400)
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

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (searchQuery.trim()) {
      router.push(`/shop?search=${encodeURIComponent(searchQuery.trim())}`)
      setSearchQuery('')
      setShowResults(false)
      if (setIsOpen) setIsOpen(false)
    }
  }

  const SearchInput = () => (
    <form onSubmit={handleSearch} className={cn('relative', isMobile && 'mb-2')}>
      <Search className={cn('absolute top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground', isRTL ? 'right-4' : 'left-4')} />
      <Input
        type='search'
        placeholder={t('search')}
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        onFocus={() => searchQuery && setShowResults(true)}
        className={cn('h-12 rounded-xl border-primary/30 focus-visible:ring-primary', isRTL ? 'pr-11 pl-11' : 'pl-11 pr-11')}
        autoFocus={isMobile}
      />
      {isSearching && <Loader2 className={cn('absolute top-1/2 -translate-y-1/2 h-4 w-4 animate-spin text-primary', isRTL ? 'left-4' : 'right-4')} />}
    </form>
  )

  const SearchResultsList = () => (
    <>
      {searchResults.length > 0 && searchQuery && (
        <div className={cn('mt-3 pt-3 border-t max-h-80 overflow-y-auto scrollbar-thin', isMobile ? 'bg-card rounded-xl border max-h-60' : '')}>
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
              className='w-full flex items-center gap-3 p-3 hover:bg-muted/80 rounded-xl transition-colors text-right'
            >
              <div className='relative w-12 h-12 rounded-lg overflow-hidden bg-muted flex-shrink-0'>
                {/* ✨ التعديل هنا لضمان عمل الصور بشكل سليم */}
                <Image 
                  src={product.imageCover ? getImageUrl(product.imageCover) : '/placeholder.svg'} 
                  alt={product.title} 
                  fill 
                  sizes="48px"
                  className='object-cover' 
                />
              </div>
              <div className={cn('flex-1 min-w-0', isRTL ? 'text-right' : 'text-left')}>
                <p className='font-medium text-sm line-clamp-1'>{isRTL ? (product.titleAr || product.title) : product.title}</p>
                <p className='text-xs text-muted-foreground'>
                  {product.price} {language === 'ar' ? 'جنيه' : 'EGP'}
                </p>
              </div>
              <ArrowRight className={cn('h-4 w-4 text-muted-foreground flex-shrink-0', isRTL && 'rotate-180')} />
            </button>
          ))}
        </div>
      )}
      {/* Quick Search for Desktop */}
      {!isMobile && !searchQuery && (
        <div className='mt-3 pt-3 border-t'>
          <p className='text-xs text-muted-foreground mb-2 font-medium'>{language === 'ar' ? 'بحث سريع' : 'Quick Search'}</p>
          <div className='flex flex-wrap gap-2'>
            {(language === 'ar' ? ['عباءات', 'حجاب', 'تخفيضات'] : ['Abayas', 'Hijabs', 'Sale']).map((term) => (
              <button
                key={term}
                type='button'
                onClick={() => {
                  router.push(`/shop?search=${term}`)
                  setShowResults(false)
                }}
                className='text-xs px-3 py-1.5 rounded-full bg-primary/15 hover:bg-primary/25 font-medium text-primary transition-colors'
              >
                {term}
              </button>
            ))}
          </div>
        </div>
      )}
    </>
  )

  if (isMobile) {
    return (
      <AnimatePresence>
        {isOpen && (
          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className='md:hidden border-t bg-card/50 backdrop-blur-md p-3'>
            <SearchInput />
            <SearchResultsList />
          </motion.div>
        )}
      </AnimatePresence>
    )
  }

  return (
    <>
      <AnimatePresence>
        {showResults && <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className='fixed inset-0 bg-black/20 backdrop-blur-sm z-40' onClick={() => setShowResults(false)} />}
      </AnimatePresence>
      <div className='hidden md:block relative z-50' ref={searchRef}>
        <Button variant='ghost' size='icon' className={cn('h-10 w-10 rounded-xl', showResults ? 'bg-primary/15 text-primary' : 'hover:bg-primary/15 hover:text-primary')} onClick={() => setShowResults(!showResults)}>
          <Search className='h-5 w-5' />
        </Button>
        <AnimatePresence>
          {showResults && (
            <motion.div initial={{ opacity: 0, y: -10, scale: 0.95 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: -10, scale: 0.95 }} className={cn('absolute top-full mt-3 w-[380px]', 'bg-card border border-border rounded-2xl shadow-2xl overflow-hidden', isRTL ? 'left-0' : 'right-0')}>
              <div className='p-4'>
                <SearchInput />
                <SearchResultsList />
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </>
  )
}