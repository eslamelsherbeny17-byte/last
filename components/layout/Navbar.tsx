'use client'

import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import { useRouter, usePathname } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { Search, User, Heart, ShoppingCart, Menu, UserCircle, Package, Crown, LogOut, Sparkles, Tag, Zap, Gift, BellRing, ChevronDown, ArrowRight } from 'lucide-react'
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
  const { language, t, isRTL } = useLanguage()

  const [isScrolled, setIsScrolled] = useState(false)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [isMobileSearchOpen, setIsMobileSearchOpen] = useState(false)
  const [isCartOpen, setIsCartOpen] = useState(false)
  
  const [isNavLoading, setIsNavLoading] = useState(true)
  const [storeName, setStoreName] = useState('')
  
  const [dynamicNavLinks, setDynamicNavLinks] = useState<any[]>([])
  const [categories, setCategories] = useState<any[]>([])
  
  const [announcements, setAnnouncements] = useState<string[]>([])
  const [currentAnnouncement, setCurrentAnnouncement] = useState(0)

  const isAdmin = user?.role === 'admin'
  const wishlistCount = wishlist.length
  const announcementIcons = [Sparkles, Tag, Zap, Gift, BellRing]

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
        setIsNavLoading(true)
        const settingsRes = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/settings`)
        const data = settingsRes.data?.data
        
        if (data) {
          setStoreName(data.siteName || t('brandName'))
          if (data.announcements && data.announcements.length > 0) {
            setAnnouncements(data.announcements)
          } else {
            setAnnouncements(['شحن مجاني للطلبات فوق 500 جنيه', 'خصم 20% على جميع المنتجات'])
          }
        } else {
          setStoreName(t('brandName'))
          setAnnouncements(['شحن مجاني للطلبات فوق 500 جنيه', 'خصم 20% على جميع المنتجات'])
        }

        const categoriesRes = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/categories`)
        const fetchedCategories = categoriesRes.data?.data || []
        
        setCategories(fetchedCategories)

        // الروابط الأساسية (بنسيب الـ href عشان الموبايل منيو يقرأه عادي)
        const baseLinks = [
          { href: '/', label: language === 'ar' ? 'الرئيسية' : 'Home' },
          { href: '/shop', label: language === 'ar' ? 'المتجر' : 'Shop', isShop: true },
          { href: '/shop?sale=true', label: language === 'ar' ? 'التخفيضات' : 'Sale', special: true },
        ]

        setDynamicNavLinks(baseLinks)
      } catch (error) {
        console.error("Error fetching dynamic nav data", error)
        setStoreName(t('brandName'))
        setAnnouncements(['شحن مجاني للطلبات فوق 500 جنيه', 'خصم 20% على جميع المنتجات'])
        setDynamicNavLinks([
          { href: '/', label: language === 'ar' ? 'الرئيسية' : 'Home' },
          { href: '/shop', label: language === 'ar' ? 'المتجر' : 'Shop', isShop: true },
          { href: '/shop?sale=true', label: language === 'ar' ? 'التخفيضات' : 'Sale', special: true },
        ])
      } finally {
        setIsNavLoading(false)
      }
    }
    fetchDynamicData()
  }, [language, t])

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

  const isLoadingComplete = isNavLoading || authLoading

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

        <div className={cn('transition-all duration-300 border-b', isScrolled ? 'bg-background/95 backdrop-blur-xl' : 'bg-background/80 backdrop-blur-md')}>
          <div className='container mx-auto px-3 sm:px-4 flex h-14 sm:h-16 items-center justify-between'>
            
            <div className='lg:hidden w-10 flex-shrink-0'>
              <Button variant='ghost' size='icon' onClick={() => setIsMobileMenuOpen(true)}>
                <Menu className='h-5 w-5 sm:h-6 sm:w-6' />
              </Button>
            </div>

            <Link href='/' className='flex-1 lg:flex-none flex justify-center lg:justify-start px-2'>
              {isLoadingComplete ? (
                <div className="h-6 sm:h-8 w-24 sm:w-32 bg-muted/60 animate-pulse rounded-lg"></div>
              ) : (
                <span className='text-lg sm:text-2xl md:text-3xl font-black tracking-tight bg-gradient-to-r from-primary to-primary/80 bg-clip-text text-transparent'>
                  {storeName}
                </span>
              )}
            </Link>

            <nav className='hidden lg:flex items-center gap-2 xl:gap-4 flex-1 justify-center'>
              {isLoadingComplete ? (
                Array.from({ length: 3 }).map((_, i) => (
                  <div key={i} className="h-6 w-16 bg-muted/50 animate-pulse rounded-md mx-2"></div>
                ))
              ) : (
                dynamicNavLinks.map((link) => {
                  const isActive = pathname === link.href || (link.isShop && (pathname.startsWith('/shop') || pathname.startsWith('/product')));
                  
                  return (
                    <div key={link.label} className='relative group px-3 py-4'>
                      {/* ✨ لو ده زرار المتجر، نخليه <div> بدل <Link> عشان ميحملش صفحة جديدة لما يتضغط عليه */}
                      {link.isShop ? (
                        <div className='flex items-center gap-1 cursor-default'>
                          <motion.span className={cn('text-[14px] xl:text-[16px] font-bold transition-all flex items-center', isActive ? 'text-primary' : 'text-foreground/80 group-hover:text-primary')}>
                            {link.label}
                            <ChevronDown className='h-4 w-4 mx-1 opacity-50 group-hover:rotate-180 transition-transform duration-300' />
                          </motion.span>
                        </div>
                      ) : (
                        <Link href={link.href} className='flex items-center gap-1'>
                          <motion.span className={cn('text-[14px] xl:text-[16px] font-bold transition-all flex items-center', isActive ? 'text-primary' : 'text-foreground/80 hover:text-primary', link.special && 'flex items-center gap-1.5')}>
                            {link.label}
                            {link.special && <Zap className='h-4 w-4 mx-1 text-primary fill-primary' />}
                          </motion.span>
                        </Link>
                      )}
                      
                      {isActive && <motion.div layoutId='navbar-indicator' className='absolute bottom-0 left-0 right-0 h-[3px] bg-primary rounded-t-lg' />}
                      
                      {/* ✨ القائمة المنسدلة: تعرض 5 أقسام فقط + زرار عرض الكل */}
                      {link.isShop && categories.length > 0 && (
                        <div className={cn(
                          'absolute top-full mt-0 w-60 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 transform translate-y-2 group-hover:translate-y-0 z-50',
                          isRTL ? 'right-0' : 'left-0'
                        )}>
                          <div className='bg-background border border-gray-100 dark:border-gray-800 rounded-2xl shadow-xl p-2 flex flex-col'>
                            
                            {categories.slice(0, 5).map((cat) => (
                              <Link 
                                key={cat._id} 
                                href={`/shop?category=${cat.slug || cat._id}`} 
                                className='px-4 py-2.5 text-sm font-medium rounded-xl hover:bg-primary/10 hover:text-primary text-muted-foreground transition-colors'
                              >
                                {cat.name}
                              </Link>
                            ))}

                            <div className='h-px bg-gray-100 dark:bg-gray-800 mx-2 my-1'></div>
                            
                            <Link 
                              href="/shop" 
                              className='px-4 py-3 text-sm font-bold rounded-xl hover:bg-gray-50 dark:hover:bg-gray-900/50 text-primary transition-colors flex items-center justify-between group/btn'
                            >
                              {language === 'ar' ? 'عرض كل الأقسام' : 'View All Categories'}
                              <ArrowRight className={cn("h-4 w-4 transition-transform group-hover/btn:translate-x-1", isRTL && "rotate-180 group-hover/btn:-translate-x-1")} />
                            </Link>

                          </div>
                        </div>
                      )}
                    </div>
                  )
                })
              )}
            </nav>

            {/* الأيقونات */}
            {isLoadingComplete ? (
              <div className='flex items-center gap-2 sm:gap-3 flex-shrink-0'>
                <div className="hidden lg:block h-8 w-8 bg-muted/50 animate-pulse rounded-full"></div>
                <div className="h-8 w-8 sm:h-9 sm:w-9 bg-muted/50 animate-pulse rounded-full"></div>
                <div className="h-8 w-8 sm:h-9 sm:w-9 bg-muted/50 animate-pulse rounded-full"></div>
                <div className="h-8 w-8 sm:h-9 sm:w-9 bg-muted/50 animate-pulse rounded-full"></div>
              </div>
            ) : (
              <div className='flex items-center gap-0.5 sm:gap-1 lg:gap-2 flex-shrink-0'>
                <div className='hidden lg:flex items-center gap-1'><ThemeToggle /></div>

                <NavSearch isMobile={false} language={language} t={t} isRTL={isRTL} />
                <Button variant='ghost' size='icon' className='md:hidden h-9 w-9' onClick={() => setIsMobileSearchOpen(!isMobileSearchOpen)}>
                  <Search className='h-4 w-4 sm:h-5 sm:w-5' />
                </Button>

                <div className='hidden sm:block'>
                  {isAuthenticated ? (
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild><Button variant='ghost' size='icon' className='rounded-full'><Avatar className='h-8 w-8 sm:h-9 sm:w-9'><AvatarFallback className='bg-primary/15 text-primary font-bold'>{getUserInitials(user?.name)}</AvatarFallback></Avatar></Button></DropdownMenuTrigger>
                      <DropdownMenuContent align='end' sideOffset={8} className='w-56 z-[100]'>
                        <DropdownMenuLabel>{user?.name}</DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem onClick={() => router.push('/profile')}><UserCircle className='mr-2 h-4 w-4' />{t('profile')}</DropdownMenuItem>
                        <DropdownMenuItem onClick={() => router.push('/profile/orders')}><Package className='mr-2 h-4 w-4' />{t('orders')}</DropdownMenuItem>
                        {isAdmin && <DropdownMenuItem onClick={() => router.push('/admin')} className='text-primary'><Crown className='mr-2 h-4 w-4' />{t('adminPanel')}</DropdownMenuItem>}
                        <DropdownMenuSeparator />
                        <DropdownMenuItem onClick={() => logout()} className='text-red-600'><LogOut className='mr-2 h-4 w-4' />{t('logout')}</DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  ) : (
                    <Link href='/login'><Button variant='ghost' size='icon'><User className='h-5 w-5' /></Button></Link>
                  )}
                </div>

                {!isAdmin && (
                  <>
                    <Button onClick={handleOpenProtected('/wishlist')} variant='ghost' size='icon' className='relative h-9 w-9 sm:h-10 sm:w-10'>
                      <Heart className={cn('h-4 w-4 sm:h-5 sm:w-5', isAuthenticated && wishlistCount > 0 && 'fill-pink-500 text-pink-500')} />
                      {isAuthenticated && wishlistCount > 0 && <Badge className='absolute -top-1 -right-1 h-3.5 w-3.5 sm:h-4 sm:w-4 p-0 bg-pink-500 text-white flex items-center justify-center rounded-full text-[8px] sm:text-[9px]'>{wishlistCount}</Badge>}
                    </Button>
                    <Button onClick={handleOpenProtected('cart')} variant='ghost' size='icon' className='relative h-9 w-9 sm:h-10 sm:w-10'>
                      <ShoppingCart className='h-4 w-4 sm:h-5 sm:w-5' />
                      {isAuthenticated && itemsCount > 0 && <Badge className='absolute -top-1 -right-1 h-3.5 w-3.5 sm:h-4 sm:w-4 p-0 bg-primary text-primary-foreground flex items-center justify-center rounded-full text-[8px] sm:text-[9px] font-bold'>{itemsCount}</Badge>}
                    </Button>
                  </>
                )}
              </div>
            )}
          </div>
        </div>

        <NavSearch isMobile={true} isOpen={isMobileSearchOpen} setIsOpen={setIsMobileSearchOpen} language={language} t={t} isRTL={isRTL} />
      </header>

      <MobileMenu isOpen={isMobileMenuOpen} setIsOpen={setIsMobileMenuOpen} navLinks={dynamicNavLinks} user={user} isAuthenticated={isAuthenticated} isAdmin={isAdmin} logout={logout} language={language} t={t} isRTL={isRTL} storeName={storeName} />

      {!isAdmin && isAuthenticated && <CartSheet open={isCartOpen} onOpenChange={setIsCartOpen} />}
    </>
  )
}