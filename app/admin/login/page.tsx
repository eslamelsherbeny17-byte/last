// app/admin/login/page.tsx
'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Lock, Mail, Shield, Loader2, Eye, EyeOff, AlertCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { authAPI } from '@/lib/api'
import { useToast } from '@/lib/use-toast'
import Cookies from 'js-cookie'
import { Alert, AlertDescription } from '@/components/ui/alert'

export default function AdminLoginPage() {
  const router = useRouter()
  const { toast } = useToast()
  const [loading, setLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [formData, setFormData] = useState({ email: '', password: '' })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      // 1. إرسال طلب تسجيل الدخول باستخدام الـ API العادي
      const res: any = await authAPI.login(formData)
      
      // 2. استخراج التوكن والبيانات بناءً على شكل الاستجابة
      const token = res.token || res.data?.token
      const user = res.data?.user || res.data

      if (!token || !user) {
        throw new Error('بيانات الدخول غير مكتملة')
      }

      // 3. التحقق الصارم من صلاحيات المدير
      if (user.role !== 'admin') {
        toast({
          title: '❌ غير مصرح',
          description: 'هذا الحساب ليس لديه صلاحيات الإدارة',
          variant: 'destructive',
        })
        // مسح أي بيانات سابقة لمنع التداخل
        Cookies.remove('token')
        localStorage.removeItem('token')
        localStorage.removeItem('user')
        return
      }

      // 4. حفظ بيانات الدخول في المتصفح
      Cookies.set('token', token, { expires: 7, path: '/' })
      localStorage.setItem('token', token)
      localStorage.setItem('user', JSON.stringify(user))

      toast({
        title: '✅ مرحباً بك!',
        description: `تم تسجيل الدخول بنجاح يا ${user.name || 'مدير'}`,
      })

      // 5. التوجيه المباشر للوحة التحكم
      window.location.replace('/admin')
    } catch (error: any) {
      console.error('Login Error:', error)
      toast({
        title: '❌ خطأ',
        description: error.response?.data?.message || error.message || 'البريد الإلكتروني أو كلمة المرور غير صحيحة',
        variant: 'destructive',
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className='min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 flex items-center justify-center p-4' dir="rtl">
      <Card className='w-full max-w-md shadow-2xl border-0 overflow-hidden'>
        {/* Header با Gradient */}
        <div className='h-2 bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500'></div>
        
        <CardHeader className='text-center space-y-3 pt-8 pb-6 bg-gradient-to-b from-primary/5 to-transparent'>
          <div className='mx-auto w-16 h-16 rounded-2xl bg-gradient-to-br from-primary to-primary/70 flex items-center justify-center shadow-xl ring-4 ring-primary/10'>
            <Shield className='h-9 w-9 text-white' />
          </div>
          <CardTitle className='text-2xl sm:text-3xl font-black tracking-tight'>
            لوحة الإدارة
          </CardTitle>
          <CardDescription className="text-sm font-medium">
            سجل دخولك للوصول إلى أدوات التحكم
          </CardDescription>
        </CardHeader>

        <CardContent className='px-6 sm:px-8 pb-8'>
          <form onSubmit={handleSubmit} className='space-y-5'>
            {/* Email Field */}
            <div className='space-y-2'>
              <Label htmlFor='email' className="text-right block font-bold">
                البريد الإلكتروني
              </Label>
              <div className='relative group'>
                <Mail className='absolute right-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground group-focus-within:text-primary transition-colors' />
                <Input
                  id='email'
                  type='email'
                  placeholder='admin@example.com'
                  className='pr-11 h-12 border-2 focus-visible:ring-primary text-left'
                  dir="ltr"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  required
                  disabled={loading}
                />
              </div>
            </div>

            {/* Password Field */}
            <div className='space-y-2'>
              <Label htmlFor='password' className="text-right block font-bold">
                كلمة المرور
              </Label>
              <div className='relative group'>
                <Lock className='absolute right-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground group-focus-within:text-primary transition-colors' />
                <Input
                  id='password'
                  type={showPassword ? 'text' : 'password'}
                  placeholder='••••••••'
                  className='px-11 h-12 border-2 focus-visible:ring-primary text-left'
                  dir="ltr"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  required
                  disabled={loading}
                />
                <button
                  type='button'
                  onClick={() => setShowPassword(!showPassword)}
                  className='absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors'
                >
                  {showPassword ? <EyeOff className='h-5 w-5' /> : <Eye className='h-5 w-5' />}
                </button>
              </div>
            </div>

            {/* Submit Button */}
            <Button
              type='submit'
              className='w-full h-12 text-base font-bold bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 hover:from-blue-700 hover:via-indigo-700 hover:to-purple-700 shadow-lg hover:shadow-xl transition-all'
              disabled={loading}
            >
              {loading ? (
                <>
                  <Loader2 className='ml-2 h-5 w-5 animate-spin' />
                  جاري التحقق...
                </>
              ) : (
                <>
                  <Shield className='ml-2 h-5 w-5' />
                  تسجيل الدخول
                </>
              )}
            </Button>
          </form>

          {/* Warning Alert */}
          <Alert className='mt-6 border-amber-200 bg-amber-50 dark:bg-amber-900/10 dark:border-amber-800'>
            <AlertCircle className="h-4 w-4 text-amber-600" />
            <AlertDescription className='text-xs text-amber-800 dark:text-amber-400 leading-relaxed'>
              <strong>ملاحظة:</strong> هذه المنطقة مخصصة لمديري النظام فقط. يجب أن يكون لديك دور "Admin" للدخول.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    </div>
  )
}