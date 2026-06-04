'use client'

import { useState } from 'react'
import {
  Heart,
  ShoppingCart,
  X,
  Loader2,
  Package,
  Star,
  AlertCircle,
  ArrowRight,
  CheckCircle2,
} from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { formatPrice, getImageUrl, calculateDiscount } from '@/lib/utils'
import { useWishlist } from '@/contexts/WishlistContext'
import { useCart } from '@/contexts/CartContext'
import { useToast } from '@/lib/use-toast'
import { useLanguage } from '@/contexts/LanguageContext'

export default function WishlistPage() {
  const { wishlist, loading, removeFromWishlist } = useWishlist()
  const { addItem } = useCart()
  const { t } = useLanguage()
  const { toast } = useToast()
  const [imageErrors, setImageErrors] = useState<Record<string, boolean>>({})
  const [addingToCart, setAddingToCart] = useState<string | null>(null)
  const [removingItem, setRemovingItem] = useState<string | null>(null)

  const handleRemove = async (productId: string) => {
    setRemovingItem(productId)
    try {
      await removeFromWishlist(productId)
      toast({
        title: `✓ ${t('success')}`,
        description: t('removedFromWishlistSuccess'),
      })
    } catch (error: any) {
      toast({
        title: `❌ ${t('error')}`,
        description: error.message || t('pleaseTryAgain'),
        variant: 'destructive',
      })
    } finally {
      setRemovingItem(null)
    }
  }

  const handleAddToCart = async (product: any) => {
    setAddingToCart(product._id)
    try {
      await addItem({ productId: product._id, quantity: 1 })
      toast({
        title: `✓ ${t('success')}`,
        description: t('addedToCart'),
      })
    } catch (error: any) {
      toast({
        title: `❌ ${t('error')}`,
        description: error.message || t('orderFailed'),
        variant: 'destructive',
      })
    } finally {
      setAddingToCart(null)
    }
  }

  if (loading) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center bg-background text-foreground">
        <Loader2 className="h-10 w-10 animate-spin text-primary mb-4" />
        <p className="text-muted-foreground">{t('loading')}</p>
      </div>
    )
  }

  if (!wishlist || wishlist.length === 0) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center bg-background p-6">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center max-w-lg w-full"
        >
          <div className="w-32 h-32 mx-auto mb-8 rounded-full bg-primary/10 flex items-center justify-center border border-primary/20">
            <Heart className="h-12 w-12 text-primary stroke-[1.5]" />
          </div>
          <h1 className="text-3xl font-bold mb-4 text-foreground">
            {t('emptyWishlist')}
          </h1>
          <p className="text-muted-foreground mb-10 text-lg">
            {t('emptyWishlist')}
          </p>
          <Link href="/shop">
            <Button
              size="lg"
              className="min-w-[200px] h-12 text-lg gold-gradient rounded-full"
            >
              {t('startShopping')}
            </Button>
          </Link>
        </motion.div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background py-12 sm:py-16 transition-colors duration-300">
      <div className="container mx-auto px-4 sm:px-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end mb-8 sm:mb-10 border-b pb-4 sm:pb-6 border-border">
          <div className="mb-4 sm:mb-0">
            <h1 className="text-2xl sm:text-3xl font-bold mb-2 text-foreground flex items-center gap-2 sm:gap-3">
              {t('myWishlist')}
              <Badge
                variant="outline"
                className="text-sm font-normal py-1 px-2 sm:px-3 border-primary/20 bg-primary/5 text-primary"
              >
                {wishlist.length} {t('products')}
              </Badge>
            </h1>
          </div>
          <Link href="/shop">
            <Button
              variant="ghost"
              className="gap-1 sm:gap-2 hover:text-primary text-muted-foreground hover:bg-transparent"
            >
              {t('continueShpping')} <ArrowRight className="w-4 h-4 flip-rtl" />
            </Button>
          </Link>
        </div>

        {/* Wishlist Grid */}
        <motion.div
          layout
          className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 sm:gap-8"
        >
          <AnimatePresence mode="popLayout">
            {wishlist.map((product, index) => {
              const imageUrl = getImageUrl(product.imageCover)
              const hasValidImage = imageUrl && !imageErrors[product._id]
              const discount = calculateDiscount(
                product.price,
                product.priceAfterDiscount
              )
              const isOutOfStock = product.quantity === 0
              const rating = product.ratingsAverage || 0
              const ratingCount = product.ratingsQuantity || 0

              return (
                <motion.div
                  layout
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ delay: index * 0.04 }}
                  key={product._id}
                  className="group bg-card rounded-xl border border-border shadow-sm hover:shadow-md transition-all duration-300 flex flex-col overflow-hidden"
                >
                  {/* Image */}
                  <div className="relative aspect-[3/4] overflow-hidden bg-muted">
                    <div className="absolute top-2 w-full px-2 flex justify-between z-20">
                      {discount > 0 && !isOutOfStock && (
                        <Badge className="bg-destructive text-destructive-foreground border-0 px-2 py-1 shadow-md text-xs sm:text-sm">
                          -{discount}%
                        </Badge>
                      )}

                      <Button
                        variant="secondary"
                        size="icon"
                        className="h-8 w-8 sm:h-9 sm:w-9 rounded-full bg-background/80 dark:bg-card/80 hover:bg-background text-muted-foreground hover:text-destructive shadow-sm backdrop-blur-sm transition-colors"
                        onClick={() => handleRemove(product._id)}
                        disabled={removingItem === product._id}
                      >
                        {removingItem === product._id ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <X className="h-4 sm:h-5 w-4 sm:w-5" />
                        )}
                      </Button>
                    </div>

                    <Link
                      href={`/product/${product._id}`}
                      className="block w-full h-full relative"
                    >
                      {isOutOfStock && (
                        <div className="absolute inset-0 bg-background/60 backdrop-blur-[2px] z-10 flex items-center justify-center">
                          <span className="bg-foreground text-background px-4 py-2 text-xs sm:text-sm font-bold tracking-widest uppercase shadow-xl border border-foreground transform -rotate-2">
                            {t('outOfStock')}
                          </span>
                        </div>
                      )}

                      {!hasValidImage ? (
                        <div className="w-full h-full flex items-center justify-center text-muted-foreground/30">
                          <Package className="h-10 w-10 sm:h-12 sm:w-12" />
                        </div>
                      ) : (
                        <Image
                          src={imageUrl}
                          alt={product.title}
                          fill
                          className={`object-cover transition-transform duration-700 group-hover:scale-105 ${
                            isOutOfStock ? 'grayscale opacity-50' : ''
                          }`}
                          onError={() =>
                            setImageErrors((prev) => ({
                              ...prev,
                              [product._id]: true,
                            }))
                          }
                        />
                      )}
                    </Link>
                  </div>

                  {/* Content */}
                  <div className="p-4 sm:p-5 flex flex-col flex-grow">
                    <div className="flex justify-between items-start mb-2">
                      <div className="text-[10px] sm:text-xs text-muted-foreground font-bold uppercase tracking-wider">
                        {product.category &&
                          (typeof product.category === 'string'
                            ? product.category
                            : product.category.name)}
                      </div>

                      <div
                        className={`flex items-center gap-1 text-[10px] sm:text-xs font-bold px-2 py-0.5 rounded-full border ${
                          isOutOfStock
                            ? 'text-destructive bg-destructive/10 border-destructive/20'
                            : 'text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-500/10 border-emerald-100 dark:border-emerald-500/20'
                        }`}
                      >
                        {isOutOfStock ? <AlertCircle className="w-3 h-3" /> : <CheckCircle2 className="w-3 h-3" />}
                        {isOutOfStock ? t('outOfStock') : t('inStock')}
                      </div>
                    </div>

                    <Link href={`/product/${product._id}`} className="mb-1 block">
                      <h3 className="font-bold text-sm sm:text-base text-foreground line-clamp-1 hover:text-primary transition-colors">
                        {product.title}
                      </h3>
                    </Link>

                    <div className="flex items-center gap-1 mb-3">
                      <div className="flex">
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={i}
                            className={`w-3 h-3 sm:w-3.5 sm:h-3.5 ${
                              i < Math.floor(rating) ? 'text-yellow-500 fill-yellow-500' : 'text-muted/30 fill-muted'
                            }`}
                          />
                        ))}
                      </div>
                      <span className="text-[10px] sm:text-xs text-muted-foreground pt-0.5">
                        ({ratingCount})
                      </span>
                    </div>

                    <div className="mt-auto flex flex-col gap-3">
                      <div className="flex items-baseline gap-2">
                        <span className="text-base sm:text-lg font-bold text-primary">
                          {formatPrice(product.priceAfterDiscount || product.price)}
                        </span>
                        {product.priceAfterDiscount && (
                          <span className="text-xs sm:text-sm text-muted-foreground line-through opacity-60">
                            {formatPrice(product.price)}
                          </span>
                        )}
                      </div>

                      <Button
                        className={`w-full h-10 sm:h-11 rounded-lg font-bold transition-all duration-300 ${
                          isOutOfStock
                            ? 'bg-muted text-muted-foreground cursor-not-allowed border border-border'
                            : 'gold-gradient text-white hover:shadow-lg hover:-translate-y-0.5'
                        }`}
                        disabled={isOutOfStock || addingToCart === product._id}
                        onClick={() => handleAddToCart(product)}
                      >
                        {addingToCart === product._id ? (
                          <div className="flex items-center gap-2 text-sm">
                            <Loader2 className="h-4 w-4 animate-spin" /> <span>{t('loading')}</span>
                          </div>
                        ) : isOutOfStock ? (
                          <div className="flex items-center gap-2 text-sm">
                            <AlertCircle className="w-4 h-4" /> <span>{t('outOfStock')}</span>
                          </div>
                        ) : (
                          <div className="flex items-center gap-2 text-sm">
                            <ShoppingCart className="w-4 h-4" /> <span>{t('addToCart')}</span>
                          </div>
                        )}
                      </Button>
                    </div>
                  </div>
                </motion.div>
              )
            })}
          </AnimatePresence>
        </motion.div>
      </div>
    </div>
  )
}
