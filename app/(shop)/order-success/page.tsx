'use client'

import { Suspense, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import {
  CheckCircle2,
  Package,
  ArrowRight,
  Loader2,
  PhoneCall,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import confetti from 'canvas-confetti'

// Hooks
import { useLanguage } from '@/contexts/LanguageContext'

function OrderSuccessContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const orderId = searchParams.get('orderId')
  const { t, isRTL } = useLanguage()

  useEffect(() => {
    // Confetti animation - ألوان ذهبية
    const duration = 3 * 1000
    const end = Date.now() + duration

    const frame = () => {
      confetti({
        particleCount: 2,
        angle: 60,
        spread: 55,
        origin: { x: 0 },
        colors: ['#D4AF37', '#F1C40F', '#B8860B'],
      })
      confetti({
        particleCount: 2,
        angle: 120,
        spread: 55,
        origin: { x: 1 },
        colors: ['#D4AF37', '#F1C40F', '#B8860B'],
      })

      if (Date.now() < end) {
        requestAnimationFrame(frame)
      }
    }

    frame()
  }, [])

  return (
    <div className='min-h-screen bg-background flex items-center justify-center p-4 md:p-6'>
      <Card className='max-w-md w-full shadow-2xl border-border bg-card overflow-hidden'>
        <CardContent className='pt-10 pb-8 text-center'>
          {/* Success Icon */}
          <div className='relative mb-6 flex justify-center'>
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className='w-20 h-20 md:w-24 md:h-24 rounded-full bg-green-500/10 flex items-center justify-center'
            >
              <CheckCircle2 className='h-12 w-12 md:h-14 md:w-14 text-green-500' />
            </motion.div>
            <div className='absolute inset-0 w-20 h-20 md:w-24 md:h-24 mx-auto rounded-full bg-green-500 animate-ping opacity-10' />
          </div>

          {/* Title & Description */}
          <h1 className='text-2xl md:text-3xl font-black mb-3 text-foreground'>
            {t('orderPlacedSuccessfully')} 🎉
          </h1>
          <p className='text-muted-foreground text-sm md:text-base mb-8 px-4'>
            {t('orderWillBeShipped')}
          </p>

          {/* Order ID Box */}
          {orderId && (
            <div className='bg-muted/50 border border-border p-4 md:p-5 rounded-2xl mb-8 mx-4'>
              <p className='text-[10px] uppercase tracking-widest text-muted-foreground mb-1'>
                {t('orderNumber')}
              </p>
              <p className='font-mono font-bold text-xl md:text-2xl text-primary'>
                #{orderId.slice(-8).toUpperCase()}
              </p>
            </div>
          )}

          {/* Timeline - الخطوات التالية */}
          <div
            className={cn(
              'bg-muted/30 p-5 rounded-2xl mb-8 mx-4 text-sm',
              isRTL ? 'text-right' : 'text-left'
            )}
          >
            <h3 className='font-bold mb-4 flex items-center gap-2'>
              <Package className='h-4 w-4 text-primary' />
              {t('orderConfirmation')}
            </h3>
            <div className='space-y-4 relative'>
              {/* Step 1 */}
              <div className='flex items-start gap-3'>
                <div className='w-5 h-5 rounded-full bg-green-500 text-white flex items-center justify-center flex-shrink-0 text-[10px]'>
                  ✓
                </div>
                <div>
                  <p className='font-bold leading-none'>
                    {t('orderConfirmation')}
                  </p>
                  <p className='text-muted-foreground text-[11px] mt-1'>
                    {t('success')}
                  </p>
                </div>
              </div>
              {/* Step 2 */}
              <div className='flex items-start gap-3'>
                <div className='w-5 h-5 rounded-full bg-primary text-white flex items-center justify-center flex-shrink-0 text-[10px] font-bold'>
                  2
                </div>
                <div>
                  <p className='font-bold leading-none'>{t('processing')}</p>
                  <p className='text-muted-foreground text-[11px] mt-1'>
                    خلال 24 ساعة
                  </p>
                </div>
              </div>
              {/* Step 3 */}
              <div className='flex items-start gap-3 opacity-50'>
                <div className='w-5 h-5 rounded-full bg-muted-foreground/30 text-white flex items-center justify-center flex-shrink-0 text-[10px] font-bold'>
                  3
                </div>
                <div>
                  <p className='font-bold leading-none'>
                    {t('shippingDelivery')}
                  </p>
                  <p className='text-muted-foreground text-[11px] mt-1'>
                    {t('fastDelivery')}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className='space-y-3 px-4'>
            {orderId && (
              <Link href={`/profile/orders/${orderId}`} className='block'>
                <Button
                  className='w-full gold-gradient text-white h-12 rounded-xl font-bold shadow-lg shadow-primary/20'
                  size='lg'
                >
                  <Package className={cn('h-5 w-5', isRTL ? 'ml-2' : 'mr-2')} />
                  {t('viewOrderDetails')}
                </Button>
              </Link>
            )}

            <Link href='/shop' className='block'>
              <Button
                variant='outline'
                className='w-full h-12 rounded-xl font-bold border-2 hover:bg-muted'
                size='lg'
              >
                {t('backToShop')}
                <ArrowRight
                  className={cn('h-4 w-4', isRTL ? 'mr-2 rotate-180' : 'ml-2')}
                />
              </Button>
            </Link>
          </div>

          {/* Support Section */}
          <div className='mt-8 pt-6 border-t border-border text-sm'>
            <p className='text-muted-foreground mb-2'>هل تحتاج مساعدة؟</p>
            <Link
              href='/contact'
              className='text-primary font-bold hover:underline flex items-center justify-center gap-1'
            >
              <PhoneCall className='h-4 w-4' />
              {t('contactUs')}
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

// الكومبوننت الرئيسي مع Suspense للتعامل مع CSR
import { motion } from 'framer-motion'
import { cn } from '@/lib/utils'

export default function OrderSuccessPage() {
  return (
    <Suspense
      fallback={
        <div className='min-h-screen bg-background flex flex-col items-center justify-center gap-4'>
          <Loader2 className='h-10 w-10 animate-spin text-primary' />
          <p className='text-muted-foreground animate-pulse font-medium'>
            جاري تجهيز التفاصيل...
          </p>
        </div>
      }
    >
      <OrderSuccessContent />
    </Suspense>
  )
}
// xxx
