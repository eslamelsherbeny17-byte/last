'use client'

import { useState, useEffect } from 'react'
import { 
  Bell, 
  Menu, 
  Moon, 
  Sun, 
  User,
  Store,
  ExternalLink,
  LogOut,
  Settings,
  ShoppingCart,
  Package,
  Star,
  Info,
  CheckCircle2
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { ScrollArea } from '@/components/ui/scroll-area'
import { useTheme } from 'next-themes'
import { usersAPI } from '@/lib/api'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import Cookies from 'js-cookie'
import axios from 'axios'

interface AdminHeaderProps {
  onMenuClick: () => void
}

export function AdminHeader({ onMenuClick }: AdminHeaderProps) {
  const { theme, setTheme } = useTheme()
  const router = useRouter()
  const [user, setUser] = useState<any>(null)
  const [mounted, setMounted] = useState(false)
  
  // ✨ حالات الإشعارات الجديدة
  const [notifications, setNotifications] = useState<any[]>([])
  const [unreadCount, setUnreadCount] = useState(0)

  useEffect(() => {
    setMounted(true)
    fetchUser()
    fetchNotifications() // جلب الإشعارات عند التحميل
  }, [])

  const fetchUser = async () => {
    try {
      const userData = await usersAPI.getMe()
      setUser(userData)
    } catch (error) {
      console.error('Failed to fetch user:', error)
    }
  }

  // ✨ دالة جلب الإشعارات من الـ API
  const fetchNotifications = async () => {
    try {
      const res = await axios.get('/api/admin/notifications')
      setNotifications(res.data.notifications || [])
      setUnreadCount(res.data.unreadCount || 0)
    } catch (error) {
      console.error('Failed to fetch notifications', error)
    }
  }

  // ✨ دالة تحديد الإشعارات كمقروءة
  const markAsRead = async () => {
    if (unreadCount === 0) return
    try {
      await axios.patch('/api/admin/notifications')
      setUnreadCount(0)
      setNotifications(prev => prev.map(n => ({ ...n, isRead: true })))
    } catch (error) {
      console.error('Failed to mark notifications as read', error)
    }
  }

  const handleLogout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    Cookies.remove('token')
    router.push('/admin/login')
  }

  // ✨ دالة لتحديد أيقونة الإشعار بناءً على نوعه
  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'order': return <ShoppingCart className="h-4 w-4 text-blue-500" />
      case 'stock': return <Package className="h-4 w-4 text-red-500" />
      case 'review': return <Star className="h-4 w-4 text-yellow-500" />
      default: return <Info className="h-4 w-4 text-gray-500" />
    }
  }

  // ✨ تنسيق التاريخ
  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('ar-EG', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })
  }

  if (!mounted) return null

  const userRole = user?.role === 'admin' ? 'مدير' : 'مسؤول'

  return (
    <header className='sticky top-0 z-40 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60'>
      <div className='flex h-16 items-center gap-3 md:gap-4 px-4 md:px-6'>
        
        {/* Mobile Menu Button */}
        <Button variant='ghost' size='icon' className='lg:hidden flex-shrink-0' onClick={onMenuClick}>
          <Menu className='h-5 w-5' />
        </Button>

        {/* Site Name (Mobile Only) */}
        <div className='flex items-center gap-2 lg:hidden'>
          <h1 className='text-lg font-bold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent'>
            لوحة التحكم
          </h1>
        </div>

        <div className='hidden md:flex flex-1 max-w-md'></div>

        <div className='flex flex-1 items-center justify-end gap-2 md:gap-3'>
          {/* زر المتجر */}
          <Link href='/' target='_blank'>
            <Button className='relative overflow-hidden bg-gradient-to-r from-emerald-600 via-green-600 to-teal-600 hover:from-emerald-700 hover:via-green-700 hover:to-teal-700 text-white shadow-lg hover:shadow-xl hover:shadow-emerald-500/50 transition-all duration-300 group border-0 h-10 px-4 md:px-6'>
              <span className='absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent translate-x-[-200%] group-hover:translate-x-[200%] transition-transform duration-700'></span>
              <Store className='h-4 w-4 md:h-5 md:w-5 ml-2 group-hover:rotate-12 transition-transform duration-300' />
              <span className='hidden sm:inline font-bold text-sm md:text-base relative z-10'>المتجر</span>
              <ExternalLink className='h-3 w-3 md:h-4 md:w-4 mr-2 opacity-70 group-hover:opacity-100 transition-opacity' />
            </Button>
          </Link>

          {/* Theme Toggle */}
          <Button variant='ghost' size='icon' onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')} className='h-10 w-10 flex-shrink-0'>
            {theme === 'dark' ? <Sun className='h-5 w-5' /> : <Moon className='h-5 w-5' />}
          </Button>

          {/* ✨ قائمة الإشعارات (Notifications Dropdown) */}
          <DropdownMenu onOpenChange={(open) => { if (open) markAsRead() }}>
            <DropdownMenuTrigger asChild>
              <Button variant='ghost' size='icon' className='relative h-10 w-10 flex-shrink-0'>
                <Bell className='h-5 w-5' />
                {unreadCount > 0 && (
        <span className='absolute top-0 right-0 -mt-0.5 -mr-0.5 h-4 w-4 flex items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white shadow-sm animate-in zoom-in'>
          {unreadCount > 99 ? '99+' : unreadCount}
        </span>
                )}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align='end' className='w-80 p-0'>
              <div className='flex items-center justify-between px-4 py-3 border-b'>
                <span className='font-bold'>الإشعارات</span>
                {unreadCount === 0 && <CheckCircle2 className='h-4 w-4 text-green-500' />}
              </div>
              <ScrollArea className='h-[300px]'>
                {notifications.length === 0 ? (
                  <div className='flex flex-col items-center justify-center h-[200px] text-muted-foreground'>
                    <Bell className='h-8 w-8 mb-2 opacity-20' />
                    <p className='text-sm'>لا توجد إشعارات حالياً</p>
                  </div>
                ) : (
                  <div className='flex flex-col'>
                    {notifications.map((notification) => (
                      <Link 
                        key={notification._id} 
                        href={notification.link}
                        className={`flex items-start gap-3 p-4 transition-colors hover:bg-accent ${!notification.isRead ? 'bg-primary/5' : ''} border-b last:border-0`}
                      >
                        <div className={`mt-1 p-2 rounded-full ${!notification.isRead ? 'bg-background shadow-sm' : 'bg-secondary'}`}>
                          {getNotificationIcon(notification.type)}
                        </div>
                        <div className='flex flex-col gap-1'>
                          <p className={`text-sm ${!notification.isRead ? 'font-bold' : 'font-medium'}`}>
                            {notification.title}
                          </p>
                          <p className='text-xs text-muted-foreground line-clamp-2'>
                            {notification.message}
                          </p>
                          <span className='text-[10px] text-muted-foreground mt-1'>
                            {formatDate(notification.createdAt)}
                          </span>
                        </div>
                      </Link>
                    ))}
                  </div>
                )}
              </ScrollArea>
              <div className='p-2 border-t'>
                <Button variant='ghost' className='w-full text-xs text-primary' onClick={() => fetchNotifications()}>
                  تحديث الإشعارات
                </Button>
              </div>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* User Menu */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant='ghost' className='gap-2 px-2 md:px-3 h-10'>
                <Avatar className='h-8 w-8 ring-2 ring-primary/20'>
                  <AvatarImage src={user?.profileImg} />
                  <AvatarFallback className='bg-gradient-to-br from-primary to-primary/60 text-primary-foreground font-bold'>
                    {user?.name?.charAt(0) || 'A'}
                  </AvatarFallback>
                </Avatar>
                <div className='hidden lg:flex flex-col items-start text-sm'>
                  <span className='font-semibold'>{user?.name || 'Admin'}</span>
                  <span className='text-xs text-muted-foreground'>{userRole}</span>
                </div>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align='end' className='w-56'>
              <DropdownMenuLabel>
                <div className='flex flex-col gap-1'>
                  <span>{user?.name || 'Admin'}</span>
                  <span className='text-xs font-normal text-muted-foreground'>{user?.email}</span>
                  <span className='text-xs font-semibold text-primary'>{userRole}</span>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <Link href='/profile'>
                <DropdownMenuItem className='cursor-pointer'>
                  <User className='ml-2 h-4 w-4' /> الملف الشخصي
                </DropdownMenuItem>
              </Link>
              <Link href='/admin/settings'>
                <DropdownMenuItem className='cursor-pointer'>
                  <Settings className='ml-2 h-4 w-4' /> الإعدادات
                </DropdownMenuItem>
              </Link>
              <DropdownMenuSeparator />
              <DropdownMenuItem className='text-red-600 dark:text-red-400 cursor-pointer font-semibold' onClick={handleLogout}>
                <LogOut className='ml-2 h-4 w-4' /> تسجيل الخروج
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  )
}