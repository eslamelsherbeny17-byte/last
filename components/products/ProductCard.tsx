"use client"

import type React from "react"
import { useState, useCallback } from "react"
import Image from "next/image"
import Link from "next/link"
import { Heart, ShoppingCart, Star } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import type { Product } from "@/lib/types"
import { formatPrice, calculateDiscount, getImageUrl, cn } from "@/lib/utils"
import { useCart } from "@/contexts/CartContext"
import { useWishlist } from "@/contexts/WishlistContext"
import { useAuth } from "@/contexts/AuthContext"
import { useLanguage } from "@/contexts/LanguageContext"
import { toast } from "sonner" // ⭐ تغيير هنا
import { useRouter } from "next/navigation"

interface ProductCardProps {
  product: Product
}

export function ProductCard({ product }: ProductCardProps) {
  const router = useRouter()
  const { isAuthenticated } = useAuth()
  const { addItem } = useCart()
  const { isInWishlist, addToWishlist, removeFromWishlist } = useWishlist()
  const { language, isRTL } = useLanguage()

  const [imageLoaded, setImageLoaded] = useState(false)
  const [isAddingToCart, setIsAddingToCart] = useState(false)

  const discount = calculateDiscount(product.price, product.priceAfterDiscount)
  const finalPrice = product.priceAfterDiscount || product.price
  const isWishlisted = isInWishlist(product._id)

  // 🔐 دالة الحماية
  const handleProtectedAction = useCallback(
    (action: () => void) => {
      if (!isAuthenticated) {
        toast.error(
          language === 'ar' ? '🔒 يجب تسجيل الدخول أولاً' : '🔒 Please login first',
          {
            description: language === 'ar' 
              ? 'سجل دخولك للاستمتاع بجميع المزايا' 
              : 'Login to enjoy all features',
            action: {
              label: language === 'ar' ? '👤 تسجيل الدخول' : '👤 Login',
              onClick: () => router.push(`/login?redirect=/product/${product._id}`)
            },
            duration: 5000,
          }
        )
        return
      }
      action()
    },
    [isAuthenticated, language, router, product._id]
  )

  const handleWishlistClick = useCallback(
    async (e: React.MouseEvent) => {
      e.preventDefault()
      e.stopPropagation()

      handleProtectedAction(async () => {
        try {
          if (isWishlisted) {
            await removeFromWishlist(product._id)
            toast.success(language === 'ar' ? '💔 تمت الإزالة من المفضلة' : '💔 Removed from wishlist')
          } else {
            await addToWishlist(product._id)
            toast.success(language === 'ar' ? '💖 تمت الإضافة للمفضلة' : '💖 Added to wishlist')
          }
        } catch (error: any) {
          toast.error(error.message || (language === 'ar' ? 'حدث خطأ' : 'Error occurred'))
        }
      })
    },
    [handleProtectedAction, isWishlisted, product._id, language, addToWishlist, removeFromWishlist]
  )

  const handleAddToCart = useCallback(
    async (e: React.MouseEvent) => {
      e.preventDefault()
      e.stopPropagation()

      handleProtectedAction(async () => {
        setIsAddingToCart(true)
        try {
          await addItem({ productId: product._id, quantity: 1 })
          toast.success(
            language === 'ar' ? '🛒 تمت الإضافة للسلة بنجاح!' : '🛒 Added to cart!',
            {
              description: product.title,
              action: {
                label: language === 'ar' ? 'عرض السلة' : 'View Cart',
                onClick: () => router.push('/cart')
              }
            }
          )
        } catch (error: any) {
          toast.error(error.message || (language === 'ar' ? 'حدث خطأ' : 'Error occurred'))
        } finally {
          setIsAddingToCart(false)
        }
      })
    },
    [handleProtectedAction, product._id, product.title, language, addItem, router]
  )

  return (
    <Card className="group overflow-hidden hover:shadow-xl dark:hover:shadow-primary/10 transition-all duration-300 border-0 bg-card">
      <Link href={`/product/${product._id}`} className="block">
        <div className="relative aspect-[3/4] overflow-hidden bg-secondary/50 dark:bg-secondary">
          <Image
            src={getImageUrl(product.imageCover) || "/placeholder.svg"}
            alt={product.title}
            fill
            className={cn(
              "object-cover transition-all duration-500 group-hover:scale-110",
              imageLoaded ? "opacity-100" : "opacity-0",
            )}
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
            onLoad={() => setImageLoaded(true)}
          />

          <div
            className={cn(
              "absolute top-2 md:top-3 flex flex-col gap-1.5 md:gap-2 z-10",
              isRTL ? "right-2 md:right-3" : "left-2 md:left-3",
            )}
          >
            {discount > 0 && (
              <Badge className="bg-red-500 text-white text-[10px] sm:text-xs px-1.5 sm:px-2 h-5 sm:h-6">
                -{discount}%
              </Badge>
            )}
            {product.quantity === 0 && (
              <Badge variant="secondary" className="text-[10px] sm:text-xs px-1.5 sm:px-2 h-5 sm:h-6">
                {language === 'ar' ? 'نفذت الكمية' : 'Out of Stock'}
              </Badge>
            )}
          </div>

          <div
           className={cn(
  "absolute top-2 md:top-3 flex flex-col gap-1.5 md:gap-2 z-10 transition-opacity",
  "opacity-100 md:opacity-0 md:group-hover:opacity-100",
  isRTL ? "left-2 md:left-3" : "right-2 md:right-3",
)}

          >
            <Button
              size="icon"
              variant="secondary"
              className="h-7 w-7 sm:h-8 sm:w-8 md:h-9 md:w-9 rounded-full shadow-lg hover:scale-110 transition-transform"
              onClick={handleWishlistClick}
            >
              <Heart
                className={cn(
                  "h-3.5 w-3.5 sm:h-4 sm:w-4",
                  isWishlisted && "fill-red-500 text-red-500",
                )}
              />
            </Button>
          </div>

         <div
  className={cn(
    "absolute bottom-0 left-0 right-0 p-2 md:p-3 z-10 transition-transform",
    "translate-y-0 md:translate-y-full md:group-hover:translate-y-0"
  )}
>

            <Button
              className="w-full gold-gradient text-xs md:text-sm h-8 sm:h-9 md:h-10 font-semibold shadow-lg hover:shadow-xl transition-all"
              onClick={handleAddToCart}
              disabled={product.quantity === 0 || isAddingToCart}
            >
              <ShoppingCart className={cn("h-3.5 w-3.5 md:h-4 md:w-4", isRTL ? "ml-1.5" : "mr-1.5")} />
              {isAddingToCart 
                ? (language === 'ar' ? 'جاري الإضافة...' : 'Adding...') 
                : (language === 'ar' ? 'أضف للسلة' : 'Add to Cart')
              }
            </Button>
          </div>
        </div>
      </Link>

      <CardContent className="p-2.5 sm:p-3 md:p-4">
        {product.category && (
          <p className="text-[10px] sm:text-xs text-muted-foreground mb-1 truncate">{product.category.name}</p>
        )}

        <Link href={`/product/${product._id}`}>
          <h3 className="font-semibold text-xs sm:text-sm md:text-base mb-1.5 sm:mb-2 line-clamp-2 min-h-[2rem] sm:min-h-[2.5rem] md:min-h-[3rem] hover:text-primary transition-colors leading-tight">
            {product.title}
          </h3>
        </Link>

        <div className="flex items-center gap-0.5 sm:gap-1 mb-1.5 sm:mb-2">
          {[...Array(5)].map((_, i) => (
            <Star
              key={i}
              className={cn(
                "h-2.5 w-2.5 sm:h-3 sm:w-3 md:h-4 md:w-4",
                i < Math.floor(product.ratingsAverage)
                  ? "fill-yellow-400 text-yellow-400"
                  : "text-gray-300",
              )}
            />
          ))}
          <span className="text-[10px] sm:text-xs text-muted-foreground mr-0.5 sm:mr-1">
            ({product.ratingsQuantity})
          </span>
        </div>

        <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap">
          <span className="text-base sm:text-lg md:text-xl font-bold text-primary">
            {formatPrice(finalPrice)} {language === "ar" ? "ج.م" : "EGP"}
          </span>
          {product.priceAfterDiscount && (
            <span className="text-[10px] sm:text-xs md:text-sm text-muted-foreground line-through">
              {formatPrice(product.price)}
            </span>
          )}
        </div>
      </CardContent>
    </Card>
  )
}