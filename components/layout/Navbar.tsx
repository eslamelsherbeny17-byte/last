'use client'

import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import { useRouter, usePathname } from 'next/navigation'
import { motion } from 'framer-motion'
import { Search, User, Heart, ShoppingCart, Menu, UserCircle, Package, MapPin, Crown, LogOut, Sparkles, Tag, Zap } from 'lucide-react'
import { toast } from 'sonner'
import axios from 'axios'

import { Button } from '@/components/ui/button'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { CartSheet } from '@/components/cart/CartSheet'
import { ThemeToggle } from '@/components/ThemeToggle'
import { useAuth } from '@/contexts/AuthContext'
import { useCart } from '@/contexts/CartContext'
import { useWishlist } from '@/contexts/WishlistContext'
import { useLanguage } from '@/contexts/LanguageContext'
import { cn } from '@/lib/utils'

import { NavSearch } from './NavSearch'
import { MobileMenu } from './MobileMenu'

export function Navbar() {
  const router = useRouter()
  const pathname = usePathname()
  const { user, logout, isAuthenticated } = useAuth()
  const { itemsCount } = useCart()
  const { wishlist } = useWishlist()
  const { language, t, isRTL } = useLanguage()

  const [isScrolled, setIsScrolled] = useState(false)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [isMobileSearchOpen, setIsMobileSearchOpen] = useState(false)
  const [isCartOpen, setIsCartOpen] = useState(false)

  // البيانات الديناميكية
  const [storeName, setStoreName] = useState(t('brandName'))
  const [dynamicNavLinks, setDynamicNavLinks] = useState<any[]>([])

  const isAdmin = user?.role === 'admin'
  const wishlistCount = wishlist.length

  useEffect(() => {
    const fetchDynamicData = async () => {
      try {
        const settingsRes = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/admin/settings`)
        if (settingsRes.data?.data?.siteName) {
          setStoreName(settingsRes.data.data.siteName)
        }

       const categoriesRes = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/categories`)
        const fetchedCategories = categoriesRes.data?.data || []

        // 🌟 التعديل هنا: هناخد أول 4 أقسام فقط عشان الناف بار ميبقاش زحمة
        const topCategories = fetchedCategories.slice(0, 4)

        // بناء الروابط
        const baseLinks = [
          { href: '/', label: language === 'ar' ? 'الرئيسية' : 'Home' },
          { href: '/shop', label: language === 'ar' ? 'المتجر' : 'Shop' },
        ]
        
        const categoryLinks = topCategories.map((cat: any) => ({
          href: `/shop?category=${cat.slug || cat._id}`,
          label: cat.name,
        }))

        const saleLink = { 
          href: '/shop?sale=true', 
          label: language === 'ar' ? 'التخفيضات' : 'Sale', 
          special: true 
        }

        setDynamicNavLinks([...baseLinks, ...categoryLinks, saleLink])
      } catch (error) {
        console.error("Error fetching dynamic nav data", error)
        setDynamicNavLinks([
          { href: '/', label: language === 'ar' ? 'الرئيسية' : 'Home' },
          { href: '/shop', label: language === 'ar' ? 'المتجر' : 'Shop' },
          { href: '/shop?sale=true', label: language === 'ar' ? 'التخفيضات' : 'Sale', special: true },
        ])
      }
    }
    fetchDynamicData()
  }, [language])

  const handleScroll = useCallback(() => setIsScrolled(window.scrollY > 10), [])
  useEffect(() => {
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [handleScroll])

  useEffect(() => {
    setIsMobileMenuOpen(false)
    setIsMobileSearchOpen(false)
  }, [pathname])

  const getUserInitials = (name?: string) => {
    if (!name) return 'U'
    const names = name.trim().split(' ')
    return names.length >= 2 ? (names[0][0] + names[1][0]).toUpperCase() : name.substring(0, 2).toUpperCase()
  }

  const goLogin = useCallback(() => router.push(`/login?callbackUrl=${encodeURIComponent(pathname || '/')}`), [router, pathname])

  const handleOpenProtected = (route: string) => (e: React.MouseEvent) => {
    e.preventDefault()
    if (isAdmin) return
    if (!isAuthenticated) {
      toast.error(language === 'ar' ? 'سجّل الدخول للمتابعة' : 'Please log in to continue')
      goLogin()
      return
    }
    if (route === 'cart') setIsCartOpen(true)
    else router.push(route)
  }

  return (
    <>
      <header className={cn('sticky top-0 z-50 w-full transition-all duration-300', isScrolled ? 'shadow-lg' : 'shadow-sm')}>
        <div className='relative overflow-hidden bg-gradient-to-r from-primary via-accent to-primary'>
          <div className='container mx-auto px-4 py-1.5 relative text-center text-[10px] sm:text-xs font-semibold text-white flex justify-center gap-4'>
            <span className='flex items-center gap-1'><Sparkles className='h-3 w-3' />{t('freeShipping')}</span>
            <span className='opacity-50'>•</span>
            <span className='flex items-center gap-1'><Tag className='h-3 w-3' />{t('discount')}</span>
          </div>
        </div>

        <div className={cn('transition-all duration-300 border-b', isScrolled ? 'bg-background/95 backdrop-blur-xl' : 'bg-background/80 backdrop-blur-md')}>
          <div className='container mx-auto px-4 flex h-16 items-center justify-between'>
            <div className='lg:hidden w-10'>
              <Button variant='ghost' size='icon' onClick={() => setIsMobileMenuOpen(true)}>
                <Menu className='h-5 w-5' />
              </Button>
            </div>

            <Link href='/' className='flex-1 lg:flex-none flex justify-center lg:justify-start px-2'>
              <span className='text-xl sm:text-3xl font-black tracking-tight bg-gradient-to-r from-primary to-primary/80 bg-clip-text text-transparent'>
                {storeName}
              </span>
            </Link>

            <nav className='hidden lg:flex items-center gap-2 flex-1 justify-center'>
              {dynamicNavLinks.map((link) => {
                const isActive = pathname === link.href
                return (
                  <Link key={link.href} href={link.href} className='relative group px-5 py-2'>
                    <motion.span className={cn('text-[16px] font-bold transition-all', isActive ? 'text-primary' : 'text-foreground/80 hover:text-primary', link.special && 'flex items-center gap-2')}>
                      {link.label}
                      {link.special && <Zap className='h-4 w-4 text-primary fill-primary' />}
                    </motion.span>
                    {isActive && <motion.div layoutId='navbar-indicator' className='absolute bottom-0 left-0 right-0 h-[3px] bg-primary rounded-full' />}
                  </Link>
                )
              })}
            </nav>

            <div className='flex items-center gap-1 lg:gap-2'>
              {/* إزالة زرار اللغة والإبقاء على زر المظهر فقط */}
              <div className='hidden lg:flex items-center gap-1'><ThemeToggle /></div>

              <NavSearch isMobile={false} language={language} t={t} isRTL={isRTL} />
              <Button variant='ghost' size='icon' className='md:hidden' onClick={() => setIsMobileSearchOpen(!isMobileSearchOpen)}>
                <Search className='h-5 w-5' />
              </Button>

              <div className='hidden sm:block'>
                {isAuthenticated ? (
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild><Button variant='ghost' size='icon' className='rounded-full'><Avatar className='h-9 w-9'><AvatarFallback className='bg-primary/15 text-primary font-bold'>{getUserInitials(user?.name)}</AvatarFallback></Avatar></Button></DropdownMenuTrigger>
                    <DropdownMenuContent align='end' className='w-56'>
                      <DropdownMenuLabel>{user?.name}</DropdownMenuLabel>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem onClick={() => router.push('/profile')}><UserCircle className='mr-2 h-4 w-4' />{t('profile')}</DropdownMenuItem>
                      <DropdownMenuItem onClick={() => router.push('/profile/orders')}><Package className='mr-2 h-4 w-4' />{t('orders')}</DropdownMenuItem>
                      {isAdmin && <DropdownMenuItem onClick={() => router.push('/admin')} className='text-primary'><Crown className='mr-2 h-4 w-4' />{t('adminPanel')}</DropdownMenuItem>}
                      <DropdownMenuSeparator />
                      {/* حل مشكلة TypeScript هنا */}
                      <DropdownMenuItem onClick={() => logout()} className='text-red-600'><LogOut className='mr-2 h-4 w-4' />{t('logout')}</DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                ) : (
                  <Link href='/login'><Button variant='ghost' size='icon'><User className='h-5 w-5' /></Button></Link>
                )}
              </div>

              {!isAdmin && (
                <>
                  <Button onClick={handleOpenProtected('/wishlist')} variant='ghost' size='icon' className='relative'>
                    <Heart className={cn('h-5 w-5', isAuthenticated && wishlistCount > 0 && 'fill-pink-500 text-pink-500')} />
                    {isAuthenticated && wishlistCount > 0 && <Badge className='absolute -top-1 -right-1 h-4 w-4 p-0 bg-pink-500 text-white flex items-center justify-center rounded-full text-[9px]'>{wishlistCount}</Badge>}
                  </Button>
                  <Button onClick={handleOpenProtected('cart')} variant='ghost' size='icon' className='relative'>
                    <ShoppingCart className='h-5 w-5' />
                    {isAuthenticated && itemsCount > 0 && <Badge className='absolute -top-1 -right-1 h-4 w-4 p-0 bg-primary text-primary-foreground flex items-center justify-center rounded-full text-[9px] font-bold'>{itemsCount}</Badge>}
                  </Button>
                </>
              )}
            </div>
          </div>
        </div>

        <NavSearch isMobile={true} isOpen={isMobileSearchOpen} setIsOpen={setIsMobileSearchOpen} language={language} t={t} isRTL={isRTL} />
      </header>

      <MobileMenu isOpen={isMobileMenuOpen} setIsOpen={setIsMobileMenuOpen} navLinks={dynamicNavLinks} user={user} isAuthenticated={isAuthenticated} isAdmin={isAdmin} logout={logout} language={language} t={t} isRTL={isRTL} storeName={storeName} />

      {!isAdmin && isAuthenticated && <CartSheet open={isCartOpen} onOpenChange={setIsCartOpen} />}
    </>
  )
}