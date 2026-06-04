'use client'

import { useState } from 'react'
import { Minus, Plus, ShoppingCart, Check } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { cn } from '@/lib/utils'
import { useCart } from '@/contexts/CartContext'
import { toast } from 'sonner'
import { getColorHex } from '@/lib/constants' // ⭐ Import المطلوب

export function AddToCartSection({ 
  product, 
  onAuthCheck 
}: { 
  product: any
  onAuthCheck: (cb: () => void) => void 
}) {
  const { addItem } = useCart()
  const [quantity, setQuantity] = useState(1)
  const [selectedSize, setSelectedSize] = useState(product.sizes?.[0] || '')
  const [selectedColor, setSelectedColor] = useState(product.colors?.[0] || '')
  const [adding, setAdding] = useState(false)

  const handleAddToCart = () => {
    // ✅ Validation
    if (product.colors?.length > 0 && !selectedColor) {
      toast.error('يرجى اختيار اللون')
      return
    }
    if (product.sizes?.length > 0 && !selectedSize) {
      toast.error('يرجى اختيار المقاس')
      return
    }

    onAuthCheck(async () => {
      try {
        setAdding(true)
        await addItem({ 
          productId: product._id, 
          quantity, 
          size: selectedSize || undefined, 
          color: selectedColor || undefined 
        })
        toast.success('تمت الإضافة إلى السلة بنجاح! 🎉', {
          description: `${quantity} × ${product.title}`,
        })
      } catch (err: any) {
        toast.error(err.message || 'حدث خطأ أثناء الإضافة')
      } finally {
        setAdding(false)
      }
    })
  }

  return (
    <div className="space-y-6 sm:space-y-8">
      {/* ==================== الألوان ==================== */}
      {product.colors?.length > 0 && (
        <div className="space-y-3 sm:space-y-4">
          <Label className="text-xs sm:text-sm font-black uppercase tracking-widest text-muted-foreground flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-primary"></span>
            اللون: 
            {selectedColor && (
              <span className="text-foreground font-bold text-sm sm:text-base">
                {selectedColor}
              </span>
            )}
          </Label>
          
          <div className="flex flex-wrap gap-2 sm:gap-3">
            {product.colors.map((color: string) => {
              const colorHex = getColorHex(color) // ⭐ تحويل الاسم إلى hex
              const isSelected = selectedColor === color
              const isLightColor = ['أبيض', 'بيج', 'أصفر', '#FFFFFF', '#F5F5DC', '#EAB308'].includes(color)

              return (
                <button
                  key={color}
                  type="button"
                  onClick={() => setSelectedColor(color)}
                  className={cn(
                    "group relative rounded-full p-1 transition-all hover:scale-110 active:scale-95",
                    isSelected 
                      ? "ring-2 ring-primary ring-offset-2 ring-offset-background scale-110" 
                      : "ring-1 ring-transparent hover:ring-border"
                  )}
                  title={color}
                >
                  <div
                    className={cn(
                      "w-10 h-10 sm:w-12 sm:h-12 rounded-full flex items-center justify-center shadow-md relative overflow-hidden",
                      isLightColor ? "border-2 border-border/30" : "border border-border/10"
                    )}
                    style={{ backgroundColor: colorHex }}
                  >
                    {/* ✅ علامة الاختيار */}
                    {isSelected && (
                      <>
                        <Check
                          className={cn(
                            "h-5 w-5 sm:h-6 sm:w-6 drop-shadow-lg z-10",
                            isLightColor ? 'text-foreground' : 'text-white'
                          )}
                          strokeWidth={3}
                        />
                        <div className="absolute inset-0 bg-black/10 animate-pulse"></div>
                      </>
                    )}
                  </div>

                  {/* ✅ Tooltip عند الـ hover */}
                  <span className="absolute -bottom-8 left-1/2 -translate-x-1/2 bg-foreground text-background text-[10px] sm:text-xs font-bold px-2 py-1 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none z-20 shadow-lg">
                    {color}
                  </span>
                </button>
              )
            })}
          </div>
        </div>
      )}

      {/* ==================== المقاسات ==================== */}
      {product.sizes?.length > 0 && (
        <div className="space-y-3 sm:space-y-4">
          <Label className="text-xs sm:text-sm font-black uppercase tracking-widest text-muted-foreground flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-primary"></span>
            المقاس:
            {selectedSize && (
              <span className="text-foreground font-bold text-sm sm:text-base">
                {selectedSize}
              </span>
            )}
          </Label>
          
          <div className="flex flex-wrap gap-2">
            {product.sizes.map((size: string) => {
              const isSelected = selectedSize === size
              return (
                <Button
                  key={size}
                  type="button"
                  variant={isSelected ? 'default' : 'outline'}
                  onClick={() => setSelectedSize(size)}
                  className={cn(
                    "h-11 sm:h-12 min-w-[55px] sm:min-w-[60px] rounded-xl border-2 font-bold text-sm sm:text-base transition-all",
                    isSelected 
                      ? "gold-gradient border-none text-white shadow-lg shadow-primary/30 scale-105" 
                      : "border-border hover:border-primary hover:scale-105"
                  )}
                >
                  {size}
                </Button>
              )
            })}
          </div>
        </div>
      )}

      {/* ==================== الكمية والزر الرئيسي ==================== */}
      <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 pt-2 sm:pt-4">
        {/* التحكم في الكمية */}
        <div className="flex items-center justify-between bg-muted/40 rounded-xl sm:rounded-2xl p-1 h-12 sm:h-14 w-full sm:w-40 border-2 border-border/50">
          <Button 
            variant="ghost" 
            size="icon" 
            className="rounded-lg sm:rounded-xl h-10 w-10 sm:h-12 sm:w-12 hover:bg-background" 
            onClick={() => setQuantity(Math.max(1, quantity - 1))}
            disabled={quantity <= 1 || adding}
          >
            <Minus className="h-4 w-4 sm:h-5 sm:w-5" strokeWidth={2.5} />
          </Button>
          
          <span className="text-base sm:text-lg font-black text-foreground min-w-[40px] text-center">
            {quantity}
          </span>
          
          <Button 
            variant="ghost" 
            size="icon" 
            className="rounded-lg sm:rounded-xl h-10 w-10 sm:h-12 sm:w-12 hover:bg-background" 
            onClick={() => setQuantity(Math.min(product.quantity || 999, quantity + 1))}
            disabled={quantity >= (product.quantity || 999) || adding}
          >
            <Plus className="h-4 w-4 sm:h-5 sm:w-5" strokeWidth={2.5} />
          </Button>
        </div>

        {/* زر الإضافة للسلة */}
        <Button 
          className="flex-1 h-12 sm:h-14 rounded-xl sm:rounded-2xl gold-gradient text-white text-base sm:text-lg font-black shadow-xl hover:shadow-2xl active:scale-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          onClick={handleAddToCart}
          disabled={adding || (product.quantity === 0)}
        >
          {adding ? (
            <>
              <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent ml-2" />
              جاري الإضافة...
            </>
          ) : (
            <>
              <ShoppingCart className="ml-2 h-5 w-5 sm:h-6 sm:w-6" />
              أضف إلى السلة
            </>
          )}
        </Button>
      </div>

      {/* ==================== تحذير الكمية المنخفضة ==================== */}
      {product.quantity > 0 && product.quantity <= 5 && (
        <div className="bg-destructive/10 border-2 border-destructive/20 rounded-xl sm:rounded-2xl p-3 sm:p-4 text-center animate-pulse">
          <p className="text-xs sm:text-sm font-bold text-destructive">
            ⚠️ تبقى {product.quantity} {product.quantity === 1 ? 'قطعة' : 'قطع'} فقط - اطلبي الآن!
          </p>
        </div>
      )}

      {/* ==================== رسالة نفاذ المخزون ==================== */}
      {product.quantity === 0 && (
        <div className="bg-muted border-2 border-border rounded-xl sm:rounded-2xl p-3 sm:p-4 text-center">
          <p className="text-xs sm:text-sm font-bold text-muted-foreground">
            😔 نفذت الكمية - سيتوفر قريباً
          </p>
        </div>
      )}

      {/* ==================== معلومات إضافية ==================== */}
      {product.quantity > 0 && (
        <div className="text-xs sm:text-sm text-muted-foreground text-center pt-2 border-t border-border/50">
          <p className="font-semibold">
            📦 متوفر {product.quantity} {product.quantity === 1 ? 'قطعة' : 'قطعة'} في المخزون
          </p>
        </div>
      )}
    </div>
  )
}