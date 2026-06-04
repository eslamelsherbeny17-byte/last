// components/profile/PersonalInfoForm.tsx
'use client'

import { useState } from 'react'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useAuth } from '@/contexts/AuthContext'
import { toast } from '@/lib/toast-helper'
import { Loader2, Save, User, Mail, Phone, RefreshCw } from 'lucide-react'

export function PersonalInfoForm() {
  const { user, updateProfile } = useAuth()
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    phone: user?.phone || '',
  })

  const hasChanges =
    formData.name !== user?.name ||
    formData.email !== user?.email ||
    formData.phone !== (user?.phone || '')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!hasChanges) {
      toast.info('لم يتم تغيير أي بيانات')
      return
    }

    setLoading(true)

    try {
      const updateData: any = {}

      if (formData.name !== user?.name) updateData.name = formData.name
      if (formData.email !== user?.email) updateData.email = formData.email
      if (formData.phone !== user?.phone) updateData.phone = formData.phone

      await updateProfile(updateData)
    } catch (error: any) {
      // Error handled in context
    } finally {
      setLoading(false)
    }
  }

  const handleReset = () => {
    setFormData({
      name: user?.name || '',
      email: user?.email || '',
      phone: user?.phone || '',
    })
    toast.info('تم إلغاء التغييرات')
  }

  return (
    <Card className='border-0 shadow-2xl'>
      <CardHeader className='bg-gradient-to-r from-primary/5 via-primary/3 to-transparent'>
        <CardTitle className='flex items-center gap-2 text-2xl'>
          <User className='h-6 w-6 text-primary' />
          المعلومات الشخصية
        </CardTitle>
        <CardDescription>
          قم بتحديث معلوماتك الشخصية والتحقق من صحتها
        </CardDescription>
      </CardHeader>
      <CardContent className='pt-6'>
        <form onSubmit={handleSubmit} className='space-y-6'>
          {/* Name Field */}
          <div className='space-y-2'>
            <Label
              htmlFor='name'
              className='text-sm font-semibold flex items-center gap-2'
            >
              <User className='h-4 w-4 text-primary' />
              الاسم الكامل
            </Label>
            <div className='relative'>
              <Input
                id='name'
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                required
                className='pr-4 h-12 border-2 focus:border-primary transition-all'
                placeholder='أدخل اسمك الكامل'
              />
            </div>
          </div>

          {/* Email Field */}
          <div className='space-y-2'>
            <Label
              htmlFor='email'
              className='text-sm font-semibold flex items-center gap-2'
            >
              <Mail className='h-4 w-4 text-primary' />
              البريد الإلكتروني
            </Label>
            <div className='relative'>
              <Input
                id='email'
                type='email'
                value={formData.email}
                onChange={(e) =>
                  setFormData({ ...formData, email: e.target.value })
                }
                required
                className='pr-4 h-12 border-2 focus:border-primary transition-all'
                placeholder='email@example.com'
              />
            </div>
            <p className='text-xs text-muted-foreground flex items-center gap-1'>
              <span className='inline-block w-1.5 h-1.5 rounded-full bg-amber-500'></span>
              تأكد من صحة البريد الإلكتروني لاستقبال الإشعارات
            </p>
          </div>

          {/* Phone Field */}
          <div className='space-y-2'>
            <Label
              htmlFor='phone'
              className='text-sm font-semibold flex items-center gap-2'
            >
              <Phone className='h-4 w-4 text-primary' />
              رقم الهاتف
            </Label>
            <div className='relative'>
              <Input
                id='phone'
                type='tel'
                value={formData.phone}
                onChange={(e) =>
                  setFormData({ ...formData, phone: e.target.value })
                }
                className='pr-4 h-12 border-2 focus:border-primary transition-all'
                placeholder='01xxxxxxxxx'
              />
            </div>
          </div>

          {/* Action Buttons */}
          <div className='flex flex-col sm:flex-row justify-end gap-3 pt-4 border-t'>
            <Button
              type='button'
              variant='outline'
              onClick={handleReset}
              disabled={loading || !hasChanges}
              className='order-2 sm:order-1'
            >
              <RefreshCw className='ml-2 h-4 w-4' />
              إلغاء التغييرات
            </Button>
            <Button
              type='submit'
              disabled={loading || !hasChanges}
              className='bg-gradient-to-r from-primary via-primary/90 to-primary/80 hover:from-primary/90 hover:via-primary/80 hover:to-primary/70 shadow-lg hover:shadow-xl transition-all order-1 sm:order-2'
            >
              {loading ? (
                <>
                  <Loader2 className='ml-2 h-4 w-4 animate-spin' />
                  جاري الحفظ...
                </>
              ) : (
                <>
                  <Save className='ml-2 h-4 w-4' />
                  حفظ التغييرات
                </>
              )}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}
