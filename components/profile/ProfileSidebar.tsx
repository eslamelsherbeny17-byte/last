// components/profile/ProfileSidebar.tsx
'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  User,
  Package,
  MapPin,
  Settings,
  LogOut,
  ChevronRight,
} from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { cn } from '@/lib/utils'
import { useAuth } from '@/contexts/AuthContext'
import { toast } from '@/lib/toast-helper'

const menuItems = [
  {
    title: 'الملف الشخصي',
    href: '/profile',
    icon: User,
    color: 'from-blue-500 to-blue-600',
  },
  {
    title: 'طلباتي',
    href: '/profile/orders',
    icon: Package,
    color: 'from-green-500 to-green-600',
  },
  {
    title: 'عناويني',
    href: '/profile/addresses',
    icon: MapPin,
    color: 'from-purple-500 to-purple-600',
  },
  // {
  //   title: 'الإعدادات',
  //   href: '/profile/settings',
  //   icon: Settings,
  //   color: 'from-amber-500 to-amber-600',
  // },
]

export function ProfileSidebar() {
  const pathname = usePathname()
  const { user, logout } = useAuth()

  if (!user) return null

  const handleLogout = () => {
    toast.info('جاري تسجيل الخروج...')
    setTimeout(() => {
      logout()
    }, 500)
  }

  return (
    <div className='space-y-4 lg:sticky lg:top-24'>
      {/* User Info Card - Enhanced */}
      <Card className='border-0 shadow-2xl overflow-hidden'>
        <div className='h-24 bg-gradient-to-r from-primary via-primary/80 to-primary/60 relative'>
          <div className='absolute inset-0 bg-[url("/pattern.svg")] opacity-10'></div>
        </div>
        <CardContent className='pt-0 pb-6 -mt-12'>
          <div className='flex flex-col items-center text-center'>
            <div className='relative'>
              <Avatar className='h-24 w-24 border-4 border-white dark:border-gray-800 shadow-xl'>
                <AvatarImage src={user.profileImg} />
                <AvatarFallback className='text-2xl bg-gradient-to-br from-primary to-primary/60 text-white'>
                  {user.name.charAt(0)}
                </AvatarFallback>
              </Avatar>
              <div className='absolute bottom-0 right-0 h-6 w-6 bg-green-500 border-2 border-white dark:border-gray-800 rounded-full'></div>
            </div>
            <h3 className='font-bold text-lg mt-4'>{user.name}</h3>
            <p className='text-sm text-muted-foreground'>{user.email}</p>
          </div>
        </CardContent>
      </Card>

      {/* Navigation Menu - Enhanced */}
      <Card className='border-0 shadow-xl'>
        <CardContent className='p-2'>
          <nav className='space-y-1'>
            {menuItems.map((item) => {
              const isActive = pathname === item.href
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    'flex items-center gap-3 px-4 py-3 rounded-xl transition-all group relative overflow-hidden',
                    isActive
                      ? 'bg-gradient-to-r from-primary to-primary/80 text-white shadow-lg'
                      : 'hover:bg-gray-100 dark:hover:bg-gray-800 text-foreground'
                  )}
                >
                  {/* Icon with gradient background */}
                  <div
                    className={cn(
                      'w-10 h-10 rounded-lg flex items-center justify-center transition-all',
                      isActive
                        ? 'bg-white/20'
                        : `bg-gradient-to-br ${item.color} opacity-0 group-hover:opacity-10`
                    )}
                  >
                    <item.icon className='h-5 w-5' />
                  </div>

                  <span className='font-medium flex-1'>{item.title}</span>

                  {isActive && (
                    <ChevronRight className='h-4 w-4 animate-pulse' />
                  )}

                  {/* Animated background */}
                  {isActive && (
                    <div className='absolute inset-0 bg-white/10 animate-pulse'></div>
                  )}
                </Link>
              )
            })}

            <Separator className='my-2' />

            <Button
              variant='ghost'
              className='w-full justify-start text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20 group'
              onClick={handleLogout}
            >
              <div className='w-10 h-10 rounded-lg flex items-center justify-center bg-red-100 dark:bg-red-900/30 group-hover:bg-red-200 dark:group-hover:bg-red-900/50 transition-all'>
                <LogOut className='h-5 w-5' />
              </div>
              <span className='font-medium flex-1 text-right mr-3'>
                تسجيل الخروج
              </span>
            </Button>
          </nav>
        </CardContent>
      </Card>
    </div>
  )
}
