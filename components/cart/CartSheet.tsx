'use client'

import {
  ShoppingBag,
  Plus,
  Minus,
  Trash2,
  Loader2,
  ArrowRight,
  Sparkles,
  Package,
  Shield,
  RotateCcw,
  Gift,
  Zap,
  CheckCircle2,
  AlertCircle,
  X,
} from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { ScrollArea } from '@/components/ui/scroll-area'
import { formatPrice, getImageUrl } from '@/lib/utils'
import { useCart } from '@/contexts/CartContext'
import { useAuth } from '@/contexts/AuthContext'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { useState } from 'react'
import { Product } from '@/lib/types'
import { cn } from '@/lib/utils'

interface CartSheetProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function CartSheet({ open, onOpenChange }: CartSheetProps) {
  const router = useRouter()
  const { cart, loading, updateQuantity, removeItem } = useCart()
  const { isAuthenticated } = useAuth()
  const [removingItems, setRemovingItems] = useState<Set<string>>(new Set())

  const handleCheckout = () => {
    if (!isAuthenticated) {
      router.push('/login?callbackUrl=/checkout')
    } else {
      router.push('/checkout')
    }
    onOpenChange(false)
  }

  const handleRemoveItem = async (itemId: string) => {
    setRemovingItems((prev) => new Set(prev).add(itemId))
    try {
      await removeItem(itemId)
    } finally {
      setRemovingItems((prev) => {
        const next = new Set(prev)
        next.delete(itemId)
        return next
      })
    }
  }

  // ✅ حسابات القيم بأمان (TypeScript Safe)
  const subtotal = cart?.totalCartPrice || 0
  const discount = cart?.totalPriceAfterDiscount ? subtotal - cart.totalPriceAfterDiscount : 0
  const total = cart?.totalPriceAfterDiscount || subtotal
  const itemsCount = cart?.cartItems?.length || 0

  const freeShippingThreshold = 500
  const progressToFreeShipping = Math.min((total / freeShippingThreshold) * 100, 100)
  const amountToFreeShipping = Math.max(freeShippingThreshold - total, 0)

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side='left'
        // ✅ جعل العرض 85% للموبايل لضمان عدم تغطية الشاشة بالكامل
        className='w-[85vw] sm:w-[480px] p-0 flex flex-col bg-background border-r-0 [&>button]:hidden shadow-2xl'
      >
        {/* ==================== HEADER + PROGRESS BAR ==================== */}
        <SheetHeader className='sticky top-0 z-20 p-4 sm:p-6 bg-background/80 backdrop-blur-xl border-b border-border shadow-sm'>
          <SheetTitle className='flex items-center justify-between gap-2'>
            <div className='flex items-center gap-2 sm:gap-3'>
              <div className='w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-accent flex items-center justify-center shadow-lg shadow-primary/20'>
                <ShoppingBag className='h-5 w-5 text-white' strokeWidth={2.5} />
              </div>
              <div>
                <h2 className='text-base sm:text-xl font-black'>سلة التسوق</h2>
                <p className='text-[10px] sm:text-xs text-muted-foreground font-bold'>{itemsCount} منتجات</p>
              </div>
            </div>
            <Button variant='ghost' size='icon' onClick={() => onOpenChange(false)} className='h-8 w-8 rounded-full hover:bg-muted'>
              <X className='h-4 w-4' />
            </Button>
          </SheetTitle>

          {itemsCount > 0 && (
            <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className='mt-4 space-y-2'>
              <div className='flex items-center justify-between text-[10px] sm:text-xs font-bold'>
                <span className='text-muted-foreground'>
                  {amountToFreeShipping > 0 ? `أضف ${formatPrice(amountToFreeShipping)} للشحن المجاني!` : 'مبروك! شحن مجاني 🎉'}
                </span>
                <span className='text-primary'>{progressToFreeShipping.toFixed(0)}%</span>
              </div>
              <div className='h-1.5 bg-muted rounded-full overflow-hidden'>
                <motion.div 
                   initial={{ width: 0 }} 
                   animate={{ width: `${progressToFreeShipping}%` }} 
                   className='h-full bg-gradient-to-r from-green-400 to-emerald-600' 
                />
              </div>
            </motion.div>
          )}
        </SheetHeader>

        {/* ==================== CART ITEMS ==================== */}
        <div className='flex-1 overflow-hidden'>
          {loading ? (
            <div className='flex items-center justify-center h-full'><Loader2 className='h-8 w-8 animate-spin text-primary' /></div>
          ) : !cart || itemsCount === 0 ? (
            <div className='flex flex-col items-center justify-center h-full p-8 text-center'>
              <div className='w-20 h-20 rounded-full bg-muted flex items-center justify-center mb-4'><ShoppingBag className='h-10 w-10 text-muted-foreground/20' /></div>
              <h3 className='text-lg font-bold mb-2'>السلة فارغة</h3>
              <Button onClick={() => onOpenChange(false)} className="gold-gradient text-white rounded-xl px-10 h-12 font-bold">ابدئي التسوق</Button>
            </div>
          ) : (
            <ScrollArea className='h-full'>
              <div className='p-3 sm:p-5 space-y-3'>
                <AnimatePresence mode='popLayout'>
                  {cart.cartItems.map((item) => {
                    const product = item.product as Product
                    if (!product) return null
                    const isRemoving = removingItems.has(item._id)

                    return (
                      <motion.div
                        key={item._id}
                        layout
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: isRemoving ? 0.5 : 1, scale: 1 }}
                        exit={{ opacity: 0, x: -20 }}
                        className='group relative flex gap-3 p-2.5 bg-card rounded-xl border border-border shadow-sm overflow-hidden'
                      >
                        {/* الصورة */}
                        <div className='relative w-16 h-16 sm:w-20 sm:h-20 rounded-lg overflow-hidden bg-muted shrink-0'>
                          <Image src={getImageUrl(product.imageCover)} alt={product.title} fill className='object-cover' />
                        </div>

                        {/* التفاصيل */}
                        <div className='flex-1 min-w-0 flex flex-col justify-between py-0.5'>
                          <div className='pr-6'> {/* مساحة لزر الحذف */}
                            <h4 className='font-bold text-[11px] sm:text-sm leading-tight line-clamp-1'>{product.title}</h4>
                            <p className='text-[10px] sm:text-xs text-primary font-black mt-1'>{formatPrice(item.price)}</p>
                          </div>

                          <div className='flex items-center justify-between mt-2'>
                            <div className='flex items-center bg-muted rounded-lg border scale-90 sm:scale-100 origin-right'>
                              <button className='p-1 hover:bg-background' onClick={() => updateQuantity(item._id, item.quantity - 1)} disabled={item.quantity <= 1}><Minus className='h-3 w-3' /></button>
                              <span className='px-2 text-xs font-bold'>{item.quantity}</span>
                              <button className='p-1 hover:bg-background' onClick={() => updateQuantity(item._id, item.quantity + 1)}><Plus className='h-3 w-3' /></button>
                            </div>
                            <Button variant='ghost' size='icon' className='h-7 w-7 text-muted-foreground hover:text-destructive absolute top-2 left-2' onClick={() => handleRemoveItem(item._id)} disabled={isRemoving}>
                               {isRemoving ? <Loader2 className='h-3.5 w-3.5 animate-spin' /> : <Trash2 className='h-4 w-4' />}
                            </Button>
                          </div>
                        </div>
                      </motion.div>
                    )
                  })}
                </AnimatePresence>
              </div>
            </ScrollArea>
          )}
        </div>

        {/* ==================== FOOTER (FULL VERSION) ==================== */}
        {cart && itemsCount > 0 && (
          <div className='sticky bottom-0 border-t bg-card p-4 sm:p-6 shadow-[0_-10px_40px_rgba(0,0,0,0.05)] z-20'>
            <div className='space-y-4'>
              {/* تفاصيل السعر */}
              <div className='space-y-1.5'>
                <div className='flex justify-between text-xs sm:text-sm font-medium'>
                  <span className='text-muted-foreground'>المجموع الفرعي</span>
                  <span>{formatPrice(subtotal)}</span>
                </div>
                {discount > 0 && (
                  <div className='flex justify-between text-xs sm:text-sm font-bold text-green-600 bg-green-500/5 p-2 rounded-lg'>
                    <div className='flex items-center gap-1'><CheckCircle2 className='h-3 w-3' /> وفرتي</div>
                    <span>-{formatPrice(discount)}</span>
                  </div>
                )}
                <Separator className='my-2' />
                <div className='flex justify-between items-center'>
                  <span className='text-sm sm:text-base font-black'>الإجمالي</span>
                  <span className='text-lg sm:text-2xl font-black text-primary'>{formatPrice(total)}</span>
                </div>
              </div>

              {/* الأزرار الأصلية */}
              <div className='space-y-3'>
                <Button onClick={handleCheckout} className='w-full h-12 sm:h-14 gold-gradient rounded-xl text-white font-black text-sm sm:text-base shadow-lg gap-2'>
                  إتمام الطلب الآن <ArrowRight className='h-4 w-4' strokeWidth={3} />
                </Button>
                
                <Link href='/cart' onClick={() => onOpenChange(false)} className="block">
                  <Button variant='outline' className='w-full h-10 sm:h-12 border-2 rounded-xl font-bold text-xs sm:text-sm hover:bg-muted transition-colors'>
                    عرض السلة الكاملة
                  </Button>
                </Link>
              </div>

              {/* علامات الثقة */}
              <div className='pt-2 grid grid-cols-3 gap-2'>
                {[
                  { icon: Shield, text: 'دفع آمن', color: 'text-green-500' },
                  { icon: Package, text: 'شحن سريع', color: 'text-blue-500' },
                  { icon: RotateCcw, text: 'إرجاع سهل', color: 'text-orange-500' }
                ].map((badge, i) => (
                  <div key={i} className='flex flex-col items-center gap-1 text-center'>
                    <badge.icon className={cn('h-4 w-4', badge.color)} />
                    <span className='text-[9px] sm:text-[10px] font-bold text-muted-foreground'>{badge.text}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </SheetContent>
    </Sheet>
  )
}
