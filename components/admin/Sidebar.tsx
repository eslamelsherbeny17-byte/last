'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import axios from 'axios'
import {
  LayoutDashboard,
  Package,
  FolderTree,
  ShoppingCart,
  Users,
  Star,
  Tag,
  Settings,
  LogOut,
  X,
  Ticket,
  Award,
  Layers, // ✨ ضفنا أيقونة الفئات الفرعية هنا
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { ScrollArea } from '@/components/ui/scroll-area'

const menuItems = [
  { title: 'لوحة التحكم', href: '/admin', icon: LayoutDashboard },
  { title: 'المنتجات', href: '/admin/products', icon: Package },
  { title: 'الفئات', href: '/admin/categories', icon: FolderTree },
  // ✨ ده السطر الجديد اللي هيظهر الفئات الفرعية في القائمة
  { title: 'الفئات الفرعية', href: '/admin/categories/subcategories', icon: Layers }, 
  { title: 'الماركات', href: '/admin/brands', icon: Award },
  { title: 'الطلبات', href: '/admin/orders', icon: ShoppingCart },
  { title: 'المستخدمين', href: '/admin/users', icon: Users },
  { title: 'التقييمات', href: '/admin/reviews', icon: Star },
  { title: 'الكوبونات', href: '/admin/coupons', icon: Ticket },
  { title: 'الإعدادات', href: '/admin/settings', icon: Settings },
]

interface SidebarProps {
  isOpen: boolean
  onClose: () => void
}

export function Sidebar({ isOpen, onClose }: SidebarProps) {
  const pathname = usePathname()
  const [siteName, setSiteName] = useState('لوحة التحكم') // 👈 قيمة افتراضية

  // 👈 جلب اسم الموقع من الإعدادات
  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const res = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/admin/settings`)
        if (res.data?.data?.siteName) {
          setSiteName(res.data.data.siteName)
        }
      } catch (error) {
        console.error("Failed to fetch site name:", error)
      }
    }
    fetchSettings()
  }, [])

  const handleLogout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    document.cookie = 'token=; Path=/; Max-Age=0'
    window.location.href = '/admin/login'
  }

  const SidebarContent = () => (
    <div className='flex h-full flex-col'>
      {/* Logo */}
      <div className='flex h-16 items-center justify-between border-b px-6 lg:justify-center'>
        <Link href='/admin' className='flex items-center gap-2' onClick={onClose}>
          <div className='h-10 w-10 rounded-xl bg-gradient-to-br from-primary to-primary/60 flex items-center justify-center shadow-lg'>
            <LayoutDashboard className='h-6 w-6 text-white' />
          </div>
          <div className='lg:block'>
            {/* 👈 هنا تم استبدال الاسم الثابت بالاسم الديناميكي */}
            <h2 className='text-xl font-bold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent truncate max-w-[160px]'>
              {siteName}
            </h2>
            <p className='text-xs text-muted-foreground'>لوحة الإدارة</p>
          </div>
        </Link>
        <Button
          variant='ghost'
          size='icon'
          className='lg:hidden'
          onClick={onClose}
        >
          <X className='h-5 w-5' />
        </Button>
      </div>

      {/* Menu Items */}
      <ScrollArea className='flex-1 px-3 py-4'>
        <nav className='space-y-1'>
          {menuItems.map((item) => {
            const isActive = pathname === item.href || pathname.startsWith(item.href + '/')
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={onClose}
                className={cn(
                  'flex items-center gap-3 rounded-lg px-4 py-3 text-sm font-medium transition-all hover:bg-accent',
                  isActive
                    ? 'bg-primary text-primary-foreground shadow-sm'
                    : 'text-muted-foreground hover:text-foreground'
                )}
              >
                <item.icon className='h-5 w-5 flex-shrink-0' />
                <span>{item.title}</span>
              </Link>
            )
          })}
        </nav>
      </ScrollArea>

      {/* Logout */}
      <div className='border-t p-4'>
        <Button
          variant='ghost'
          className='w-full justify-start text-destructive hover:bg-destructive/10 hover:text-destructive'
          onClick={handleLogout}
        >
          <LogOut className='ml-3 h-5 w-5' />
          تسجيل الخروج
        </Button>
      </div>
    </div>
  )

  return (
    <>
      {/* Desktop Sidebar */}
      <aside className='hidden lg:fixed lg:right-0 lg:top-0 lg:z-30 lg:flex lg:h-screen lg:w-72 lg:flex-col lg:border-l lg:bg-card'>
        <SidebarContent />
      </aside>

      {/* Mobile Sidebar */}
      {isOpen && (
        <>
          <div
            className='fixed inset-0 z-40 bg-background/80 backdrop-blur-sm lg:hidden'
            onClick={onClose}
          />
          <aside className='fixed right-0 top-0 z-50 h-full w-80 max-w-[85vw] border-l bg-card shadow-xl lg:hidden'>
            <SidebarContent />
          </aside>
        </>
      )}
    </>
  )
}