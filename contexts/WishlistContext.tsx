'use client'

import {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from 'react'
import { wishlistAPI } from '@/lib/api'
import { Product } from '@/lib/types'
import { useAuth } from './AuthContext'

interface WishlistContextType {
  wishlist: Product[]
  loading: boolean
  isInWishlist: (productId: string) => boolean
  addToWishlist: (productId: string) => Promise<void>
  removeFromWishlist: (productId: string) => Promise<void>
  refreshWishlist: () => Promise<void>
}

const WishlistContext = createContext<WishlistContextType | undefined>(
  undefined
)

export function WishlistProvider({ children }: { children: ReactNode }) {
  const [wishlist, setWishlist] = useState<Product[]>([])
  const [loading, setLoading] = useState(false)
  const { isAuthenticated } = useAuth()

  useEffect(() => {
    if (isAuthenticated) {
      refreshWishlist()
    } else {
      setWishlist([])
    }
  }, [isAuthenticated])

  const refreshWishlist = async () => {
    try {
      setLoading(true)
      const data = await wishlistAPI.get()

      if (Array.isArray(data)) {
        console.log('✅ Wishlist loaded:', data.length, 'items')
        setWishlist(data)
      } else {
        console.error('Wishlist data format is incorrect', data)
        setWishlist([])
      }
    } catch (error) {
      console.error('Failed to fetch wishlist:', error)
      setWishlist([])
    } finally {
      setLoading(false)
    }
  }

  const isInWishlist = (productId: string) => {
    return wishlist.some((item) => item._id === productId)
  }

  const addToWishlist = async (productId: string) => {
    try {
      const updatedWishlist = await wishlistAPI.add(productId)

      if (Array.isArray(updatedWishlist)) {
        setWishlist(updatedWishlist)
      } else {
        await refreshWishlist()
      }
    } catch (error: any) {
      const msg = error.response?.data?.message || 'فشل إضافة المنتج للمفضلة'
      throw new Error(msg)
    }
  }

  const removeFromWishlist = async (productId: string) => {
    try {
      // Optimistic update
      const previousWishlist = [...wishlist]
      setWishlist((current) => current.filter((item) => item._id !== productId))

      try {
        const updatedWishlist = await wishlistAPI.remove(productId)
        if (Array.isArray(updatedWishlist)) {
          setWishlist(updatedWishlist)
        }
      } catch (err) {
        // Revert on error
        setWishlist(previousWishlist)
        throw err
      }
    } catch (error: any) {
      const msg = error.response?.data?.message || 'فشل حذف المنتج من المفضلة'
      throw new Error(msg)
    }
  }

  return (
    <WishlistContext.Provider
      value={{
        wishlist,
        loading,
        isInWishlist,
        addToWishlist,
        removeFromWishlist,
        refreshWishlist,
      }}
    >
      {children}
    </WishlistContext.Provider>
  )
}

export const useWishlist = () => {
  const context = useContext(WishlistContext)
  if (context === undefined) {
    throw new Error('useWishlist must be used within WishlistProvider')
  }
  return context
}
