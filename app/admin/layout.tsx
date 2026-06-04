'use client'

import { useEffect, useState } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import { Loader2 } from 'lucide-react'
import Cookies from 'js-cookie'
import { Sidebar } from '@/components/admin/Sidebar'
import { AdminHeader } from '@/components/admin/AdminHeader'
import { ThemeProvider } from '@/components/theme-provider'

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const router = useRouter()
  const pathname = usePathname()
  const { user, loading } = useAuth()
  const [sidebarOpen, setSidebarOpen] = useState(false)

  // Skip auth check for login page
  const isLoginPage = pathname === '/admin/login'

  useEffect(() => {
    if (!loading && !isLoginPage) {
      const token = Cookies.get('token')
      if (!token || !user || user.role !== 'admin') {
        router.push('/admin/login')
      }
    }
  }, [user, loading, router, isLoginPage])

  // Show loading while checking auth
  if (loading && !isLoginPage) {
    return (
      <div className='flex items-center justify-center min-h-screen bg-background'>
        <div className='text-center space-y-4'>
          <Loader2 className='h-12 w-12 animate-spin text-primary mx-auto' />
          <p className='text-muted-foreground'>جاري التحميل...</p>
        </div>
      </div>
    )
  }

  // Render login page without layout
  if (isLoginPage) {
    return (
      <ThemeProvider attribute='class' defaultTheme='system' enableSystem>
        {children}
      </ThemeProvider>
    )
  }

  // Redirect if not admin
  if (!user || user.role !== 'admin') {
    return null
  }

  return (
    <ThemeProvider attribute='class' defaultTheme='system' enableSystem>
      <div className='flex min-h-screen bg-background'>
        {/* Sidebar */}
        <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

        {/* Main Content */}
        <div className='flex-1 lg:mr-72'>
          {/* Header */}
          <AdminHeader onMenuClick={() => setSidebarOpen(true)} />

          {/* Page Content */}
          <main className='p-4 md:p-6 lg:p-8 max-w-[1600px] mx-auto'>
            {children}
          </main>
        </div>
      </div>
    </ThemeProvider>
  )
}