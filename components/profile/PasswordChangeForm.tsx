// components/profile/PasswordChangeForm.tsx
'use client'

import { useState } from 'react'
import { Lock, Eye, EyeOff, Shield, Check, X, Loader2 } from 'lucide-react'
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

export function PasswordChangeForm() {
  const { changePassword } = useAuth()
  const [loading, setLoading] = useState(false)
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false,
  })
  const [formData, setFormData] = useState({
    currentPassword: '',
    password: '',
    passwordConfirm: '',
  })

  // Password strength calculator
  const calculatePasswordStrength = (password: string): number => {
    let strength = 0
    if (password.length >= 8) strength += 25
    if (password.length >= 12) strength += 25
    if (/[a-z]/.test(password) && /[A-Z]/.test(password)) strength += 25
    if (/[0-9]/.test(password)) strength += 15
    if (/[^a-zA-Z0-9]/.test(password)) strength += 10
    return Math.min(strength, 100)
  }

  const passwordStrength = calculatePasswordStrength(formData.password)

  const getStrengthColor = (strength: number) => {
    if (strength < 30) return 'bg-red-500'
    if (strength < 60) return 'bg-amber-500'
    if (strength < 80) return 'bg-yellow-500'
    return 'bg-green-500'
  }

  const getStrengthText = (strength: number) => {
    if (strength < 30) return 'ضعيفة جداً'
    if (strength < 60) return 'ضعيفة'
    if (strength < 80) return 'متوسطة'
    return 'قوية'
  }

  const passwordRequirements = [
    {
      met: formData.password.length >= 8,
      text: 'على الأقل 8 أحرف',
    },
    {
      met: /[a-z]/.test(formData.password) && /[A-Z]/.test(formData.password),
      text: 'أحرف كبيرة وصغيرة',
    },
    {
      met: /[0-9]/.test(formData.password),
      text: 'رقم واحد على الأقل',
    },
    {
      met: /[^a-zA-Z0-9]/.test(formData.password),
      text: 'رمز خاص (@, #, $, etc.)',
    },
  ]

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    // Validation
    if (formData.password !== formData.passwordConfirm) {
      toast.error('كلمة المرور الجديدة غير متطابقة')
      return
    }

    if (formData.password.length < 8) {
      toast.error('كلمة المرور يجب أن تكون 8 أحرف على الأقل')
      return
    }

    if (passwordStrength < 60) {
      toast.warning('يُفضل استخدام كلمة مرور أقوى للحفاظ على أمان حسابك')
    }

    setLoading(true)

    try {
      await changePassword(formData)

      // Reset form
      setFormData({
        currentPassword: '',
        password: '',
        passwordConfirm: '',
      })
    } catch (error: any) {
      // Error handled in context
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card className='border-0 shadow-2xl'>
      <CardHeader className='bg-gradient-to-r from-purple-500/5 via-blue-500/5 to-transparent'>
        <CardTitle className='flex items-center gap-2 text-2xl'>
          <Shield className='h-6 w-6 text-primary' />
          تغيير كلمة المرور
        </CardTitle>
        <CardDescription>
          قم بتحديث كلمة المرور الخاصة بك للحفاظ على أمان حسابك
        </CardDescription>
      </CardHeader>
      <CardContent className='pt-6'>
        <form onSubmit={handleSubmit} className='space-y-6'>
          {/* Current Password */}
          <div className='space-y-2'>
            <Label
              htmlFor='currentPassword'
              className='text-sm font-semibold flex items-center gap-2'
            >
              <Lock className='h-4 w-4 text-primary' />
              كلمة المرور الحالية
            </Label>
            <div className='relative'>
              <Input
                id='currentPassword'
                type={showPasswords.current ? 'text' : 'password'}
                className='pr-4 pl-12 h-12 border-2 focus:border-primary transition-all'
                value={formData.currentPassword}
                onChange={(e) =>
                  setFormData({ ...formData, currentPassword: e.target.value })
                }
                required
                placeholder='أدخل كلمة المرور الحالية'
              />
              <button
                type='button'
                onClick={() =>
                  setShowPasswords({
                    ...showPasswords,
                    current: !showPasswords.current,
                  })
                }
                className='absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors'
              >
                {showPasswords.current ? (
                  <EyeOff className='h-5 w-5' />
                ) : (
                  <Eye className='h-5 w-5' />
                )}
              </button>
            </div>
          </div>

          {/* New Password */}
          <div className='space-y-2'>
            <Label
              htmlFor='password'
              className='text-sm font-semibold flex items-center gap-2'
            >
              <Lock className='h-4 w-4 text-primary' />
              كلمة المرور الجديدة
            </Label>
            <div className='relative'>
              <Input
                id='password'
                type={showPasswords.new ? 'text' : 'password'}
                className='pr-4 pl-12 h-12 border-2 focus:border-primary transition-all'
                value={formData.password}
                onChange={(e) =>
                  setFormData({ ...formData, password: e.target.value })
                }
                required
                minLength={8}
                placeholder='أدخل كلمة المرور الجديدة'
              />
              <button
                type='button'
                onClick={() =>
                  setShowPasswords({
                    ...showPasswords,
                    new: !showPasswords.new,
                  })
                }
                className='absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors'
              >
                {showPasswords.new ? (
                  <EyeOff className='h-5 w-5' />
                ) : (
                  <Eye className='h-5 w-5' />
                )}
              </button>
            </div>

            {/* Password Strength Indicator */}
            {formData.password && (
              <div className='space-y-2 mt-3'>
                <div className='flex items-center justify-between text-xs'>
                  <span className='text-muted-foreground'>
                    قوة كلمة المرور:
                  </span>
                  <span
                    className={`font-semibold ${
                      passwordStrength < 30
                        ? 'text-red-600'
                        : passwordStrength < 60
                        ? 'text-amber-600'
                        : passwordStrength < 80
                        ? 'text-yellow-600'
                        : 'text-green-600'
                    }`}
                  >
                    {getStrengthText(passwordStrength)}
                  </span>
                </div>
                <div className='h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden'>
                  <div
                    className={`h-full transition-all duration-300 ${getStrengthColor(
                      passwordStrength
                    )}`}
                    style={{ width: `${passwordStrength}%` }}
                  ></div>
                </div>
              </div>
            )}

            {/* Password Requirements */}
            {formData.password && (
              <div className='mt-3 p-4 bg-gray-50 dark:bg-gray-800/50 rounded-lg space-y-2'>
                <p className='text-xs font-semibold text-muted-foreground mb-2'>
                  متطلبات كلمة المرور:
                </p>
                {passwordRequirements.map((req, index) => (
                  <div
                    key={index}
                    className='flex items-center gap-2 text-xs transition-all'
                  >
                    {req.met ? (
                      <Check className='h-4 w-4 text-green-600' />
                    ) : (
                      <X className='h-4 w-4 text-gray-400' />
                    )}
                    <span
                      className={req.met ? 'text-green-600' : 'text-gray-500'}
                    >
                      {req.text}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Confirm Password */}
          <div className='space-y-2'>
            <Label
              htmlFor='passwordConfirm'
              className='text-sm font-semibold flex items-center gap-2'
            >
              <Lock className='h-4 w-4 text-primary' />
              تأكيد كلمة المرور الجديدة
            </Label>
            <div className='relative'>
              <Input
                id='passwordConfirm'
                type={showPasswords.confirm ? 'text' : 'password'}
                className='pr-4 pl-12 h-12 border-2 focus:border-primary transition-all'
                value={formData.passwordConfirm}
                onChange={(e) =>
                  setFormData({ ...formData, passwordConfirm: e.target.value })
                }
                required
                minLength={8}
                placeholder='أعد إدخال كلمة المرور الجديدة'
              />
              <button
                type='button'
                onClick={() =>
                  setShowPasswords({
                    ...showPasswords,
                    confirm: !showPasswords.confirm,
                  })
                }
                className='absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors'
              >
                {showPasswords.confirm ? (
                  <EyeOff className='h-5 w-5' />
                ) : (
                  <Eye className='h-5 w-5' />
                )}
              </button>
            </div>

            {/* Password Match Indicator */}
            {formData.passwordConfirm && (
              <p
                className={`text-xs flex items-center gap-1 ${
                  formData.password === formData.passwordConfirm
                    ? 'text-green-600'
                    : 'text-red-600'
                }`}
              >
                {formData.password === formData.passwordConfirm ? (
                  <>
                    <Check className='h-3 w-3' />
                    كلمة المرور متطابقة
                  </>
                ) : (
                  <>
                    <X className='h-3 w-3' />
                    كلمة المرور غير متطابقة
                  </>
                )}
              </p>
            )}
          </div>

          {/* Action Buttons */}
          <div className='flex flex-col sm:flex-row justify-end gap-3 pt-4 border-t'>
            <Button
              type='button'
              variant='outline'
              onClick={() =>
                setFormData({
                  currentPassword: '',
                  password: '',
                  passwordConfirm: '',
                })
              }
              disabled={loading}
              className='order-2 sm:order-1'
            >
              إلغاء
            </Button>
            <Button
              type='submit'
              disabled={loading}
              className='bg-gradient-to-r from-purple-600 via-blue-600 to-purple-500 hover:from-purple-700 hover:via-blue-700 hover:to-purple-600 shadow-lg hover:shadow-xl transition-all order-1 sm:order-2'
            >
              {loading ? (
                <>
                  <Loader2 className='ml-2 h-4 w-4 animate-spin' />
                  جاري التحديث...
                </>
              ) : (
                <>
                  <Shield className='ml-2 h-4 w-4' />
                  تغيير كلمة المرور
                </>
              )}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}
