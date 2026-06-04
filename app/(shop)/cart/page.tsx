'use client'

import { useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import {
  Trash2,
  Plus,
  Minus,
  ShoppingBag,
  ArrowRight,
  Loader2,
  PackageX,
  Sparkles,
  Tag,
  Percent,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { formatPrice, getImageUrl } from '@/lib/utils'
import { useCart } from '@/contexts/CartContext'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { toast } from 'sonner'
import type { Product } from '@/lib/types'
import { useLanguage } from '@/contexts/LanguageContext'

export default function CartPage() {
  const router = useRouter()
  const { cart, loading, updateQuantity, removeItem, applyCoupon } = useCart()
  const { t } = useLanguage()
  const [couponCode, setCouponCode] = useState('')
  const [couponLoading, setCouponLoading] = useState(false)
  const [imageErrors, setImageErrors] = useState<Record<string, boolean>>({})

  const subtotal = cart?.totalCartPrice || 0
  const discount = cart?.totalPriceAfterDiscount
    ? subtotal - cart.totalPriceAfterDiscount
    : 0
  const total = cart?.totalPriceAfterDiscount || subtotal

  const handleApplyCoupon = async () => {
    if (!couponCode.trim()) {
      toast.error(t('enterCoupon'))
      return
    }
    setCouponLoading(true)
    try {
      await applyCoupon(couponCode)
      setCouponCode('')
    } catch (error) {
      console.error('Coupon error:', error)
    } finally {
      setCouponLoading(false)
    }
  }

  const getProductData = (item: any): Product | null => {
    return typeof item.product === 'object' && item.product !== null
      ? (item.product as Product)
      : null
  }

  if (loading) {
    return (
      <div className='min-h-screen bg-background flex flex-col items-center justify-center py-16'>
        <Loader2 className='h-12 w-12 animate-spin text-primary mb-4' />
        <p className='text-muted-foreground animate-pulse'>{t('loading')}</p>
      </div>
    )
  }

  if (!cart || cart.cartItems.length === 0) {
    return (
      <div className='min-h-screen bg-background py-16'>
        <div className='container mx-auto px-4 text-center'>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className='max-w-md mx-auto'
          >
            <div className='w-32 h-32 mx-auto mb-8 rounded-full bg-muted flex items-center justify-center'>
              <PackageX className='h-16 w-16 text-muted-foreground' />
            </div>
            <h1 className='text-3xl font-bold mb-4 text-foreground'>
              {t('emptyCart')}
            </h1>
            <p className='text-muted-foreground mb-8'>{t('cartEmpty')}</p>
            <Link href='/shop'>
              <Button
                size='lg'
                className='gold-gradient rounded-full px-10 h-14 text-lg'
              >
                {t('startShopping')}
              </Button>
            </Link>
          </motion.div>
        </div>
      </div>
    )
  }

  return (
    <div className='min-h-screen bg-background py-8 sm:py-12 transition-colors duration-300'>
      <div className='container mx-auto px-4 max-w-7xl'>
        <header className='mb-10 flex items-center gap-4'>
          <div className='w-12 h-12 rounded-2xl gold-gradient flex items-center justify-center shadow-lg'>
            <ShoppingBag className='h-6 w-6 text-white' />
          </div>
          <div>
            <h1 className='text-2xl sm:text-4xl font-bold text-foreground'>
              {t('shoppingCart')}
            </h1>
            <p className='text-muted-foreground'>
              {' '}
              {cart.cartItems.length} {t('products')}{' '}
            </p>
          </div>
        </header>

        <div className='grid lg:grid-cols-12 gap-8'>
          {/* Items List */}
          <div className='lg:col-span-8 space-y-4'>
            <AnimatePresence mode='popLayout'>
              {cart.cartItems.map((item, index) => {
                const product = getProductData(item)
                if (!product) return null
                return (
                  <motion.div
                    key={item._id}
                    layout
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0, x: -20 }}
                    className='bg-card text-card-foreground p-4 sm:p-6 rounded-2xl border border-border shadow-sm group hover:shadow-md transition-all'
                  >
                    <div className='flex gap-4 sm:gap-6'>
                      <Link
                        href={`/product/${product._id}`}
                        className='relative w-24 h-24 sm:w-32 sm:h-32 rounded-xl overflow-hidden bg-muted'
                      >
                        <Image
                          src={getImageUrl(product.imageCover)}
                          alt={product.title}
                          fill
                          className='object-cover group-hover:scale-110 transition-transform'
                        />
                      </Link>
                      <div className='flex-1 flex flex-col justify-between'>
                        <div className='flex justify-between items-start'>
                          <Link
                            href={`/product/${product._id}`}
                            className='hover:text-primary transition-colors'
                          >
                            <h3 className='font-bold text-base sm:text-lg line-clamp-1'>
                              {product.title}
                            </h3>
                            {item.color && (
                              <span className='text-xs text-muted-foreground'>
                                {t('color')}: {item.color}
                              </span>
                            )}
                          </Link>
                          <Button
                            variant='ghost'
                            size='icon'
                            onClick={() => removeItem(item._id)}
                            className='text-muted-foreground hover:text-destructive'
                          >
                            <Trash2 className='h-4 w-4' />
                          </Button>
                        </div>
                        <div className='flex justify-between items-end mt-4'>
                          <div className='flex items-center border border-border rounded-lg bg-muted/50 overflow-hidden'>
                            <Button
                              variant='ghost'
                              size='icon'
                              className='h-8 w-8 sm:h-10 sm:w-10'
                              onClick={() =>
                                updateQuantity(item._id, item.quantity - 1)
                              }
                              disabled={item.quantity <= 1}
                            >
                              <Minus className='h-3 w-3' />
                            </Button>
                            <span className='w-8 text-center font-bold text-sm'>
                              {item.quantity}
                            </span>
                            <Button
                              variant='ghost'
                              size='icon'
                              className='h-8 w-8 sm:h-10 sm:w-10'
                              onClick={() =>
                                updateQuantity(item._id, item.quantity + 1)
                              }
                            >
                              <Plus className='h-3 w-3' />
                            </Button>
                          </div>
                          <div className='text-right'>
                            <p className='text-lg font-bold text-primary'>
                              {formatPrice(item.price * item.quantity)}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )
              })}
            </AnimatePresence>
          </div>

          {/* Summary Sidebar */}
          <aside className='lg:col-span-4'>
            <div className='sticky top-24 bg-card text-card-foreground p-6 rounded-2xl border border-border shadow-sm space-y-6'>
              <h2 className='text-xl font-bold border-b border-border pb-4'>
                {t('orderSummary')}
              </h2>

              <div className='flex gap-2'>
                <Input
                  placeholder={t('couponCode')}
                  value={couponCode}
                  onChange={(e) => setCouponCode(e.target.value)}
                  className='bg-muted/50 border-border'
                />
                <Button
                  onClick={handleApplyCoupon}
                  disabled={couponLoading}
                  className='gold-gradient'
                >
                  {t('applyCoupon')}
                </Button>
              </div>

              <div className='space-y-3'>
                <div className='flex justify-between text-muted-foreground'>
                  <span>{t('subtotal')}</span>
                  <span className='text-foreground'>
                    {formatPrice(subtotal)}
                  </span>
                </div>
                {discount > 0 && (
                  <div className='flex justify-between text-green-600 font-bold'>
                    <span>{t('discount')}</span>
                    <span>-{formatPrice(discount)}</span>
                  </div>
                )}
                <Separator className='bg-border' />
                <div className='flex justify-between text-xl font-bold'>
                  <span>{t('total')}</span>
                  <span className='text-primary'>{formatPrice(total)}</span>
                </div>
              </div>

              <Link href='/checkout' className='block w-full'>
                <Button className='w-full h-14 text-lg font-bold gold-gradient rounded-xl shadow-lg hover:shadow-primary/30 transition-all'>
                  {t('proceedToCheckout')}{' '}
                  <ArrowRight className='mr-2 h-5 w-5 flip-rtl' />
                </Button>
              </Link>
            </div>
          </aside>
        </div>
      </div>
    </div>
  )
}
