'use client'

import { ScrollArea } from '@/components/ui/scroll-area'
import { useState, useCallback, useRef } from 'react'
import { Separator } from '@/components/ui/separator'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import {
  Sheet,
  SheetTrigger,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet'
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible'
import { cn } from '@/lib/utils'
import {
  SlidersHorizontal,
  ChevronDown,
  X,
  Tag,
  DollarSign,
  RotateCcw,
} from 'lucide-react'

interface FilterState {
  categories: string[]
  brands: string[]
}

export function FilterSidebar({ categories, brands, onFilterChange }: any) {
  const [filters, setFilters] = useState<FilterState>({
    categories: [],
    brands: [],
  })

  const [openSections, setOpenSections] = useState({
    price: true,
    categories: true,
    brands: true,
  })

  const [isSheetOpen, setIsSheetOpen] = useState(false)

  const priceMinRef = useRef<HTMLInputElement>(null)
  const priceMaxRef = useRef<HTMLInputElement>(null)

  const activeFiltersCount = filters.categories.length + filters.brands.length

  // مصفوفة اقتراحات الأسعار
  const priceSuggestions = [
    { label: '0 - 500', min: 0, max: 500 },
    { label: '500 - 1000', min: 500, max: 1000 },
    { label: '1000 - 5000', min: 1000, max: 5000 },
    { label: '5000+', min: 5000, max: '' },
  ]

  const handleCategoryChange = useCallback((categoryId: string, checked: boolean) => {
    setFilters((prev) => ({
      ...prev,
      categories: checked
        ? [...prev.categories, categoryId]
        : prev.categories.filter((id) => id !== categoryId),
    }))
  }, [])

  const handleBrandChange = useCallback((brandId: string, checked: boolean) => {
    setFilters((prev) => ({
      ...prev,
      brands: checked
        ? [...prev.brands, brandId]
        : prev.brands.filter((id) => id !== brandId),
    }))
  }, [])

  const setQuickPrice = (min: number, max: number | string) => {
    if (priceMinRef.current) priceMinRef.current.value = min.toString()
    if (priceMaxRef.current) priceMaxRef.current.value = max.toString()
  }

  const applyFilters = useCallback(() => {
    const filterData: any = {}

    if (filters.categories.length > 0) filterData.category = filters.categories 
    if (filters.brands.length > 0) filterData.brand = filters.brands

    const minPrice = priceMinRef.current?.value
    const maxPrice = priceMaxRef.current?.value

    if (minPrice && minPrice !== '') filterData.priceMin = parseInt(minPrice)
    if (maxPrice && maxPrice !== '') filterData.priceMax = parseInt(maxPrice)

    onFilterChange(filterData)
    setIsSheetOpen(false)
  }, [filters, onFilterChange])

  const clearAllFilters = useCallback(() => {
    setFilters({ categories: [], brands: [] })
    if (priceMinRef.current) priceMinRef.current.value = ''
    if (priceMaxRef.current) priceMaxRef.current.value = ''
    onFilterChange({})
  }, [onFilterChange])

  const toggleSection = useCallback((section: keyof typeof openSections) => {
    setOpenSections((prev) => ({ ...prev, [section]: !prev[section] }))
  }, [])

  const FilterContent = () => (
    <div className='space-y-6 text-foreground p-1'>
      {/* Header - تكبير العنوان الرئيسي */}
      <div className='flex items-center justify-between sticky top-0 bg-card z-10 pb-4'>
        <div className='flex items-center gap-3'>
          <SlidersHorizontal className='h-6 w-6 text-primary' />
          <h3 className='font-bold text-2xl'>الفلاتر</h3>
          {activeFiltersCount > 0 && (
            <Badge variant='secondary' className='gold-gradient text-white text-sm px-2.5 py-1'>
              {activeFiltersCount}
            </Badge>
          )}
        </div>
      </div>

      <Separator className='bg-border' />

      {/* Price Section - تكبير العناوين والحقول */}
      <Collapsible open={openSections.price} onOpenChange={() => toggleSection('price')}>
        <CollapsibleTrigger className='flex items-center justify-between w-full py-3 hover:text-primary transition-colors'>
          <div className='flex items-center gap-3'>
            <DollarSign className='h-6 w-6' />
            <h4 className='text-xl font-bold'>السعر</h4>
          </div>
          <ChevronDown className={cn('h-6 w-6 transition-transform', openSections.price && 'rotate-180')} />
        </CollapsibleTrigger>
        <CollapsibleContent className='space-y-5 pt-3'>
          <div className='grid grid-cols-2 gap-4'>
            <div className='space-y-2'>
              <Label className='text-sm font-bold text-muted-foreground'>من</Label>
              <div className='relative'>
                <input ref={priceMinRef} type='number' placeholder='0' className='flex h-12 w-full rounded-lg border border-input bg-background px-4 py-2 text-lg pr-2 pl-12 focus:ring-1 focus:ring-primary outline-none' />
                <span className='absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground'>ج.م</span>
              </div>
            </div>
            <div className='space-y-2'>
              <Label className='text-sm font-bold text-muted-foreground'>إلى</Label>
              <div className='relative'>
                <input ref={priceMaxRef} type='number' placeholder='10000' className='flex h-12 w-full rounded-lg border border-input bg-background px-4 py-2 text-lg pr-2 pl-12 focus:ring-1 focus:ring-primary outline-none' />
                <span className='absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground'>ج.م</span>
              </div>
            </div>
          </div>

          <div className='space-y-3'>
            <p className='text-sm text-muted-foreground font-bold'>اقتراحات سريعة:</p>
            <div className='flex flex-wrap gap-2'>
              {priceSuggestions.map((range) => (
                <button
                  key={range.label}
                  onClick={() => setQuickPrice(range.min, range.max)}
                  className='text-sm px-3 py-1.5 rounded-full border border-border hover:border-primary hover:text-primary transition-all bg-muted/30 font-medium'
                >
                  {range.label} ج.م
                </button>
              ))}
            </div>
          </div>
        </CollapsibleContent>
      </Collapsible>

      <Separator className='bg-border' />

      {/* Categories Section - تكبير الخطوط والتشيك بوكس */}
      {categories?.length > 0 && (
        <>
          <Collapsible open={openSections.categories} onOpenChange={() => toggleSection('categories')}>
            <CollapsibleTrigger className='flex items-center justify-between w-full py-3 hover:text-primary transition-colors'>
              <div className='flex items-center gap-3'>
                <Tag className='h-6 w-6' />
                <h4 className='text-xl font-bold'>الفئات</h4>
              </div>
              <ChevronDown className={cn('h-6 w-6 transition-transform', openSections.categories && 'rotate-180')} />
            </CollapsibleTrigger>
            <CollapsibleContent className='space-y-2 pt-3'>
              <ScrollArea className='max-h-[300px]'>
                <div className='space-y-1.5 pr-1'>
                  {categories.map((cat: any) => (
                    <div 
                      key={cat._id} 
                      className={cn(
                        'flex items-center gap-3 p-3 rounded-lg transition-all cursor-pointer group hover:bg-muted/50',
                        filters.categories.includes(cat._id) && 'bg-primary/5 text-primary'
                      )} 
                      onClick={() => handleCategoryChange(cat._id, !filters.categories.includes(cat._id))}
                    >
                      <Checkbox 
                        checked={filters.categories.includes(cat._id)} 
                        onCheckedChange={(checked) => handleCategoryChange(cat._id, checked === true)} 
                        onClick={(e) => e.stopPropagation()} 
                        className="h-5 w-5" // تكبير مربع الاختيار
                      />
                      <label className='text-lg cursor-pointer flex-1 select-none font-medium'>{cat.nameAr || cat.name}</label>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </CollapsibleContent>
          </Collapsible>
          <Separator className='bg-border' />
        </>
      )}

      {/* Action Buttons - تكبير الأزرار والنصوص بداخلها */}
      <div className='space-y-3 pt-3'>
        <Button className='w-full h-14 gold-gradient text-white shadow-md hover:opacity-90 transition-all gap-3 text-xl font-bold' onClick={applyFilters}>
          تطبيق الفلاتر
        </Button>
        <Button 
          variant='outline' 
          className='w-full h-12 gap-3 text-lg text-muted-foreground hover:text-destructive hover:bg-destructive/5 border-dashed font-medium' 
          onClick={clearAllFilters}
        >
          <RotateCcw className='h-5 w-5' />
          إعادة تعيين الكل
        </Button>
      </div>
    </div>
  )

  return (
    <>
      {/* Desktop Sidebar */}
      <aside className='hidden lg:block w-80 flex-shrink-0'>
        <div className='sticky top-24 bg-card border border-border/60 rounded-3xl p-8 shadow-sm'>
          <ScrollArea className='h-[calc(100vh-16rem)]'>
            <FilterContent />
          </ScrollArea>
        </div>
      </aside>

      {/* Mobile Sheet */}
      <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
        <SheetTrigger asChild>
          <Button variant='outline' className='lg:hidden fixed bottom-6 left-6 z-50 shadow-2xl bg-card border-primary/20 gap-3 rounded-full px-8 h-14 text-xl font-bold'>
            <SlidersHorizontal className='h-6 w-6 text-primary' />
            تصفية
            {activeFiltersCount > 0 && (
              <Badge className='gold-gradient text-white rounded-full px-2 py-0.5 text-xs'>
                {activeFiltersCount}
              </Badge>
            )}
          </Button>
        </SheetTrigger>
        <SheetContent side='right' className='bg-card w-full sm:w-[420px] p-0 rounded-l-3xl'>
          <SheetHeader className='p-8 border-b sticky top-0 bg-card z-10'>
            <SheetTitle className='flex items-center gap-3 text-2xl'>
               <SlidersHorizontal className='h-7 w-7 text-primary' />
               تصفية المنتجات
            </SheetTitle>
          </SheetHeader>
          <ScrollArea className='h-[calc(100vh-6rem)] p-8'>
            <FilterContent />
          </ScrollArea>
        </SheetContent>
      </Sheet>
    </>
  )
}