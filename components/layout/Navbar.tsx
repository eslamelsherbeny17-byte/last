'use client'

import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import { useRouter, usePathname } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { Search, User, Heart, ShoppingCart, Menu, UserCircle, Package, Crown, LogOut, Sparkles, Tag, Zap, Gift, BellRing, ChevronDown, ArrowRight, MoonStar } from 'lucide-react'
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
  
  const { user, logout, isAuthenticated, loading: authLoading } = useAuth()
  const { itemsCount } = useCart()
  const { wishlist } = useWishlist()
  const { t } = useLanguage() 

  const [isMounted, setIsMounted] = useState(false)
  const [isScrolled, setIsScrolled] = useState(false)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [isMobileSearchOpen, setIsMobileSearchOpen] = useState(false)
  const [isCartOpen, setIsCartOpen] = useState(false)
  
  const [storeName, setStoreName] = useState(t('brandName'))
  const [categories, setCategories] = useState<any[]>([])
  const [announcements, setAnnouncements] = useState<string[]>([])
  const [currentAnnouncement, setCurrentAnnouncement] = useState(0)

  useEffect(() => {
    setIsMounted(true)
  }, [])

  const isAdmin = user?.role === 'admin'
  const wishlistCount = wishlist.length
  const announcementIcons = [Sparkles, Tag, Zap, Gift, BellRing]

  const navLinks = [
    { href: '/', label: 'الرئيسية' },
    { href: '/shop', label: 'المتجر', isShop: true },
    { href: '/shop?sort=bestsellers', label: 'الأكثر مبيعاً' }, 
    { href: '/shop?sale=true', label: 'التخفيضات', special: true },
  ]

  useEffect(() => {
    if (announcements.length <= 1) return
    const timer = setInterval(() => {
      setCurrentAnnouncement((prev) => (prev + 1) % announcements.length)
    }, 4000)
    return () => clearInterval(timer)
  }, [announcements.length])

  useEffect(() => {
    const fetchDynamicData = async () => {
      try {
        const settingsRes = await axios.get(`/api/settings`, { headers: { 'Cache-Control': 'no-store' } })
        const data = settingsRes.data?.data
        
        if (data) {
          setStoreName(data.siteName || t('brandName'))
          if (data.announcements && data.announcements.length > 0) {
            setAnnouncements(data.announcements)
          }
        }
        const categoriesRes = await axios.get(`/api/categories`)
        setCategories(categoriesRes.data?.data || [])
      } catch (error) {
        console.error("Error fetching dynamic nav data", error)
      }
    }
    if (isMounted) {
      fetchDynamicData()
    }
  }, [isMounted, t])

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
      toast.error('سجّل الدخول للمتابعة')
      goLogin()
      return
    }
    if (route === 'cart') setIsCartOpen(true)
    else router.push(route)
  }

  const ClientOnlyContent = () => {
    return (
      <div className="flex items-center gap-1 sm:gap-2">
        {/* أيقونة الحساب: مخفية في الموبايل وتظهر في الشاشات الأكبر (الكمبيوتر/التابلت) */}
        <div className="hidden sm:block">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant='ghost' size='icon' className='rounded-full h-9 w-9 sm:h-10 sm:w-10 hover:bg-muted shrink-0'>
                {isMounted && !authLoading && isAuthenticated ? (
                  <Avatar className='h-8 w-8 sm:h-9 sm:w-9'>
                    <AvatarFallback className='bg-primary/10 text-primary font-bold text-xs'>
                      {getUserInitials(user?.name)}
                    </AvatarFallback>
                  </Avatar>
                ) : (
                  <User className='h-5 w-5 text-foreground/80' />
                )}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align='end' sideOffset={8} className='w-60 z-[100] rounded-xl p-2'>
              {isMounted && !authLoading ? (
                isAuthenticated ? (
                  <>
                    <DropdownMenuLabel className="font-bold px-4 pt-3 pb-2">{user?.name}</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={() => router.push('/profile')} className="py-2.5 cursor-pointer"><UserCircle className='mx-2 h-4 w-4' />{t('profile')}</DropdownMenuItem>
                    <DropdownMenuItem onClick={() => router.push('/profile/orders')} className="py-2.5 cursor-pointer"><Package className='mx-2 h-4 w-4' />{t('orders')}</DropdownMenuItem>
                    {isAdmin && <DropdownMenuItem onClick={() => router.push('/admin')} className='text-primary py-2.5 cursor-pointer'><Crown className='mx-2 h-4 w-4' />{t('adminPanel')}</DropdownMenuItem>}
                    <DropdownMenuSeparator />
                  </>
                ) : (
                  <>
                    <DropdownMenuItem onClick={goLogin} className="py-2.5 cursor-pointer font-bold text-primary bg-primary/5 rounded-lg mb-1">
                      <UserCircle className='mx-2 h-4 w-4' />
                      تسجيل الدخول / حساب جديد
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                  </>
                )
              ) : (
                <div className="p-4 text-center text-sm text-muted-foreground">جاري التحميل...</div>
              )}
              
              <div className="py-2 px-2 flex items-center justify-between mt-1">
                <div className="flex items-center text-sm font-medium text-foreground/80"><MoonStar className="h-4 w-4 mx-2" />المظهر</div>
                <ThemeToggle />
              </div>
              
              {isMounted && isAuthenticated && (
                <>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => logout()} className='text-red-500 focus:text-white focus:bg-red-500 py-2.5 cursor-pointer'><LogOut className='mx-2 h-4 w-4' />{t('logout')}</DropdownMenuItem>
                </>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* أيقونة السلة: تظهر فوراً دائماً، ورقم المشتريات يظهر فقط بعد التأكد من الحساب */}
        {(!isMounted || !isAdmin) && (
          <Button onClick={handleOpenProtected('cart')} variant='ghost' size='icon' className='relative h-9 w-9 sm:h-10 sm:w-10 rounded-full hover:bg-muted shrink-0'>
            <ShoppingCart className='h-5 w-5 text-foreground/80' />
            {isMounted && !authLoading && isAuthenticated && itemsCount > 0 && (
              <Badge className='absolute top-0 right-0 h-4 w-4 p-0 bg-primary text-primary-foreground flex items-center justify-center rounded-full text-[9px] font-bold border-2 border-background'>
                {itemsCount}
              </Badge>
            )}
          </Button>
        )}
      </div>
    );
  }

  return (
    <>
      <header className={cn('relative md:sticky top-0 z-50 w-full transition-all duration-300', isScrolled ? 'shadow-md' : 'shadow-sm')}>
        
        {announcements.length > 0 && announcements[0] !== '' && (
          <div className='relative overflow-hidden bg-gradient-to-r from-primary via-accent to-primary h-7 sm:h-8 flex items-center justify-center'>
            <AnimatePresence mode='wait'>
              <motion.div
                key={currentAnnouncement}
                initial={{ y: 15, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: -15, opacity: 0 }}
                transition={{ duration: 0.4, ease: 'easeInOut' }}
                className='absolute flex items-center gap-1.5 text-[10px] sm:text-xs font-bold text-white tracking-wide'
              >
                {(() => {
                  const CurrentIcon = announcementIcons[currentAnnouncement % announcementIcons.length]
                  return <CurrentIcon className='h-3 w-3 sm:h-3.5 sm:w-3.5 text-yellow-300' />
                })()}
                <span>{announcements[currentAnnouncement]}</span>
              </motion.div>
            </AnimatePresence>
          </div>
        )}

        <div className={cn('transition-all duration-300 border-b relative', isScrolled ? 'bg-background/95 backdrop-blur-xl' : 'bg-background/80 backdrop-blur-md')}>
          {/* flex-1 لتوزيع المساحات بشكل عادل */}
          <div className='container mx-auto px-3 flex h-14 sm:h-16 items-center justify-between relative'>
            
            {/* 1. الجانب الأيمن: القائمة للموبايل */}
            <div className='flex items-center flex-1 lg:hidden'>
              <Button variant='ghost' size='icon' onClick={() => setIsMobileMenuOpen(true)} className='-mr-2 h-10 w-10 shrink-0'>
                <Menu className='h-6 w-6 text-foreground/80' />
              </Button>
            </div>

            {/* 2. المنتصف: اللوجو (تم تثبيته في المنتصف بدقة للموبايل) */}
            <div className='absolute left-1/2 -translate-x-1/2 lg:static lg:transform-none flex items-center justify-center lg:justify-start shrink-0 z-10'>
              <Link href='/' className='flex-shrink-0'>
                <span className='text-xl sm:text-2xl lg:text-3xl font-black tracking-tight bg-gradient-to-r from-primary to-primary/80 bg-clip-text text-transparent'>
                  {storeName}
                </span>
              </Link>
            </div>

            {/* القائمة الخاصة بالديسكتوب */}
            <nav className='hidden lg:flex flex-1 items-center justify-center gap-6 xl:gap-8'>
              {navLinks.map((link) => {
                const isActive = pathname === link.href || (link.isShop && (pathname.startsWith('/shop') || pathname.startsWith('/product')));
                return (
                  <div key={link.label} className='relative group py-6'>
                    {link.isShop ? (
                      <div className='flex items-center cursor-default'>
                        <span className={cn('text-[14px] xl:text-[15px] font-bold transition-colors flex items-center', isActive ? 'text-primary' : 'text-foreground/70 group-hover:text-primary')}>
                          {link.label}
                          <ChevronDown className='h-4 w-4 mx-1 opacity-50 group-hover:rotate-180 transition-transform duration-300' />
                        </span>
                      </div>
                    ) : (
                      <Link href={link.href} className='flex items-center'>
                        <span className={cn('text-[14px] xl:text-[15px] font-bold transition-colors flex items-center', isActive ? 'text-primary' : 'text-foreground/70 hover:text-primary', link.special && 'text-primary')}>
                          {link.label}
                          {link.special && <Zap className='h-4 w-4 mx-1 fill-primary' />}
                        </span>
                      </Link>
                    )}
                    {isActive && <motion.div layoutId='navbar-indicator' className='absolute bottom-0 left-0 right-0 h-[3px] bg-primary rounded-t-lg' />}
                    {link.isShop && categories.length > 0 && (
                      <div className={cn(
                        'absolute top-full mt-0 w-56 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 transform translate-y-2 group-hover:translate-y-0 z-50',
                        'start-0'
                      )}>
                        <div className='bg-background border border-border rounded-xl shadow-xl p-2.5 flex flex-col'>
                          {categories.slice(0, 5).map((cat) => (
                            <Link key={cat._id} href={`/shop?category=${cat.slug || cat._id}`} className='px-4 py-2.5 text-[14px] font-medium rounded-lg hover:bg-muted text-muted-foreground hover:text-primary transition-colors'>
                              {cat.name}
                            </Link>
                          ))}
                          <div className='h-px bg-border mx-2 my-1.5'></div>
                          <Link href="/shop" className='px-4 py-2.5 text-[14px] font-bold rounded-lg hover:bg-primary/5 text-primary transition-colors flex items-center justify-between group/btn'>
                            عرض كل المنتجات
                            <ArrowRight className="h-4 w-4 transition-transform group-hover/btn:-translate-x-1 rotate-180" />
                          </Link>
                        </div>
                      </div>
                    )}
                  </div>
                )
              })}
            </nav>

            {/* 3. الجانب الأيسر: الأيقونات */}
            <div className='flex items-center justify-end gap-1 sm:gap-2 flex-1'>
              <div className="hidden lg:block">
                <NavSearch isMobile={false} language="ar" t={t} isRTL={true} />
              </div>
              
              <Button variant='ghost' size='icon' className='md:hidden h-9 w-9 rounded-full hover:bg-muted shrink-0' onClick={() => setIsMobileSearchOpen(!isMobileSearchOpen)}>
                <Search className='h-5 w-5 text-foreground/80' />
              </Button>

              <ClientOnlyContent />
            </div>

          </div>
        </div>

        <NavSearch isMobile={true} isOpen={isMobileSearchOpen} setIsOpen={setIsMobileSearchOpen} language="ar" t={t} isRTL={true} />
      </header>

      <MobileMenu isOpen={isMobileMenuOpen} setIsOpen={setIsMobileMenuOpen} navLinks={navLinks} user={user} isAuthenticated={isAuthenticated} isAdmin={isAdmin} logout={logout} language="ar" t={t} isRTL={true} storeName={storeName || t('brandName')} />

      {isMounted && !isAdmin && isAuthenticated && <CartSheet open={isCartOpen} onOpenChange={setIsCartOpen} />}
    </>
  )
}