'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'
import { X, UserCircle, Package, MapPin, Crown, LogOut, ChevronRight,Heart, Settings, Zap } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Sheet, SheetContent } from '@/components/ui/sheet'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Separator } from '@/components/ui/separator'

import { cn } from '@/lib/utils'

interface MobileMenuProps {
  isOpen: boolean
  setIsOpen: (val: boolean) => void
  navLinks: any[]
  user: any
  isAuthenticated: boolean
  isAdmin: boolean
  logout: () => void
  language: string
  t: any
  isRTL: boolean
  storeName: string
}

export function MobileMenu({ isOpen, setIsOpen, navLinks, user, isAuthenticated, isAdmin, logout, language, t, isRTL, storeName }: MobileMenuProps) {
  const getUserInitials = (name?: string) => {
    if (!name) return 'U'
    const names = name.trim().split(' ')
    return names.length >= 2 ? (names[0][0] + names[1][0]).toUpperCase() : name.substring(0, 2).toUpperCase()
  }

  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetContent side={isRTL ? 'right' : 'left'} className='w-[250px] sm:w-[300px] p-0 flex flex-col [&>button]:hidden'>
        <div className='p-5 border-b bg-gradient-to-br from-primary/10 to-accent/5 flex-shrink-0'>
          <div className='flex items-center justify-between mb-4'>
            <Link href='/' onClick={() => setIsOpen(false)} className='text-2xl font-black text-primary'>{storeName}</Link>
            <Button variant='ghost' size='icon' onClick={() => setIsOpen(false)} className='h-8 w-8 hover:bg-primary/15'><X className='h-5 w-5' /></Button>
          </div>
          {isAuthenticated && (
            <div className='flex items-center gap-3 p-3 bg-background rounded-xl shadow-sm'>
              <Avatar className='h-10 w-10 ring-2 ring-primary/20'>
                <AvatarFallback className='bg-primary/15 text-primary font-bold'>{getUserInitials(user?.name)}</AvatarFallback>
              </Avatar>
              <div className='flex-1 min-w-0'>
                <p className='text-sm font-semibold truncate'>{user?.name}</p>
                <p className='text-xs text-muted-foreground truncate'>{user?.email}</p>
              </div>
            </div>
          )}
        </div>

        <div className='flex-1 overflow-y-auto py-4'>
          <div className='px-4 space-y-1 pb-4'>
            <p className='text-xs font-semibold text-muted-foreground px-3 mb-2'>{language === 'ar' ? 'التنقل' : 'Navigation'}</p>
            {navLinks.map((link) => (
              <Link key={link.href} href={link.href} onClick={() => setIsOpen(false)}>
                <div className={cn('flex items-center justify-between px-4 py-3 rounded-xl transition-all hover:bg-muted/80 font-semibold', link.special && 'bg-gradient-to-r from-primary/10 to-accent/10')}>
                  <span className='text-[15px] flex items-center gap-2'>
                    {link.label}
                    {link.special && <Zap className='h-4 w-4 text-primary fill-primary' />}
                  </span>
                  <ChevronRight className={cn('h-4 w-4 text-muted-foreground', isRTL && 'rotate-180')} />
                </div>
              </Link>
            ))}
          </div>

          {isAuthenticated && (
            <>
              <Separator className='my-4' />
              <div className='px-4 space-y-1'>
                <p className='text-xs font-semibold text-muted-foreground px-3 mb-2'>{language === 'ar' ? 'حسابي' : 'My Account'}</p>
                <Link href='/profile' onClick={() => setIsOpen(false)}><div className='flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-muted/80'><UserCircle className='h-5 w-5 text-primary' /><span className='text-sm font-semibold'>{t('profile')}</span></div></Link>
                <Link href='/profile/orders' onClick={() => setIsOpen(false)}><div className='flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-muted/80'><Package className='h-5 w-5 text-primary' /><span className='text-sm font-semibold'>{t('orders')}</span></div></Link>
                <Link href='/profile/addresses' onClick={() => setIsOpen(false)}><div className='flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-muted/80'><MapPin className='h-5 w-5 text-primary' /><span className='text-sm font-semibold'>{t('addresses')}</span></div></Link>
                <Link href='/wishlist' onClick={() => setIsOpen(false)}>
                  <div className='flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-muted/80'>
                    <Heart className='h-5 w-5 text-red-500' />
                    <span className='text-sm font-semibold'>{t('wishlist')}</span>
                  </div>
                </Link>
                {isAdmin && (
                  <>
                    <Separator className='my-2' />
                    <Link href='/admin' onClick={() => setIsOpen(false)}><div className='flex items-center gap-3 px-4 py-3 rounded-xl bg-primary/10 hover:bg-primary/15'><Crown className='h-5 w-5 text-primary' /><span className='text-sm font-bold text-primary'>{t('adminPanel')}</span></div></Link>
                  </>
                )}
              </div>
            </>
          )}
        </div>

        <div className='p-4 border-t bg-muted/30 space-y-2.5 flex-shrink-0'>
          <p className='text-xs font-semibold text-muted-foreground px-3'>{language === 'ar' ? 'الإعدادات' : 'Settings'}</p>
          <div className='flex items-center justify-between px-4 py-2 bg-background rounded-xl'><div className='flex items-center gap-2'><Settings className='h-4 w-4 text-muted-foreground' /><span className='text-sm font-semibold'>{language === 'ar' ? 'المظهر' : 'Theme'}</span></div></div>
          {isAuthenticated ? (
            <Button variant='outline' className='w-full text-red-600 border-red-200 hover:bg-red-50 font-semibold h-11' onClick={() => { logout(); setIsOpen(false); }}><LogOut className='h-4 w-4 mr-2' />{t('logout')}</Button>
          ) : (
            <Link href='/login' onClick={() => setIsOpen(false)}><Button className='w-full bg-primary hover:bg-primary/90 font-semibold h-11'>{t('login')}</Button></Link>
          )}
        </div>
      </SheetContent>
    </Sheet>
  )
}