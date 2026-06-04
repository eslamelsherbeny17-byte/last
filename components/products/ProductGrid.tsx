import { ProductCard } from './ProductCard'
import { Product } from '@/lib/types'
import { useLanguage } from '@/contexts/LanguageContext'

export function ProductGrid({
  products,
  loading,
}: {
  products: Product[]
  loading?: boolean
}) {
  const { t } = useLanguage()

  if (loading) {
    return (
      <div className='grid grid-cols-2 md:grid-cols-3 gap-4 md:gap-6'>
        {[...Array(6)].map((_, i) => (
          <div
            key={i}
            className='aspect-[3/4] bg-muted animate-pulse rounded-lg border border-border'
          />
        ))}
      </div>
    )
  }

  if (products.length === 0) {
    return (
      <div className='flex flex-col items-center justify-center py-16 text-center text-foreground'>
        <div className='w-24 h-24 mb-4 rounded-full bg-secondary flex items-center justify-center opacity-50'>
          🔍
        </div>
        <h3 className='text-xl font-semibold mb-2'>{t('noResults')}</h3>
        <p className='text-muted-foreground'>{t('tryAgain')}</p>
      </div>
    )
  }

  return (
    <div className='grid grid-cols-2 md:grid-cols-3 gap-4 md:gap-6'>
      {products.map((product) => (
        <ProductCard key={product._id} product={product} />
      ))}
    </div>
  )
}
