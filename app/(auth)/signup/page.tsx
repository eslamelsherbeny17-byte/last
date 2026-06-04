'use client'

import React, { Suspense, useMemo, useState } from 'react'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { User, Mail, Lock, Phone, Eye, EyeOff, Loader2, ShoppingBag } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Checkbox } from '@/components/ui/checkbox'
import { useAuth } from '@/contexts/AuthContext'
import { useLanguage } from '@/contexts/LanguageContext'
import { toast } from 'sonner'

function SignupForm() {
  const { signup } = useAuth()
  const searchParams = useSearchParams()
  const { t, language } = useLanguage()

  const callbackUrl = useMemo(() => {
    return searchParams.get('callbackUrl') || '/'
  }, [searchParams])

  const [showPassword, setShowPassword] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [acceptTerms, setAcceptTerms] = useState(false)

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    passwordConfirm: '',
  })

  const isRTL = language === 'ar'

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (submitting) return

    if (formData.password !== formData.passwordConfirm) {
      toast.error(t('error') ?? 'خطأ', { description: t('passwordMismatch') })
      return
    }

    if (!acceptTerms) {
      toast.error(t('error') ?? 'خطأ', { description: t('acceptTermsRequired') })
      return
    }

    setSubmitting(true)
    try {
      await signup(
        {
          name: formData.name.trim(),
          email: formData.email.trim(),
          phone: formData.phone.trim() || undefined,
          password: formData.password,
          passwordConfirm: formData.passwordConfirm,
        },
        callbackUrl
      )
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-pink-50 dark:from-slate-950 dark:via-slate-900 dark:to-purple-950 flex items-center justify-center py-8 md:py-12 px-4 md:px-6">
      <div className="w-full max-w-md">
        <div className="text-center mb-8 md:mb-10 animate-fade-in">
          <Link href="/" className="inline-block">
            <div className="flex items-center justify-center gap-2 mb-3">
              <div className="w-10 h-10 md:w-12 md:h-12 rounded-xl bg-gradient-to-br from-primary to-yellow-500 flex items-center justify-center shadow-lg">
                <ShoppingBag className="w-5 h-5 md:w-6 md:h-6 text-white" />
              </div>
              <h1 className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-primary via-yellow-500 to-primary bg-clip-text text-transparent">
                {language === 'ar' ? 'أيمن بشير' : 'Ayman Bashir'}
              </h1>
            </div>
          </Link>
          <p className="text-sm md:text-base text-gray-600 dark:text-gray-300 font-medium">
            {t('createAccount')}
          </p>
        </div>

        <div className="backdrop-blur-xl bg-white/80 dark:bg-slate-900/80 p-6 md:p-8 rounded-2xl shadow-2xl border border-gray-200/50 dark:border-slate-700/50 animate-slide-in-left">
          <h2 className="text-xl md:text-2xl font-bold mb-6 md:mb-8 text-center text-gray-900 dark:text-white">
            {t('signup')}
          </h2>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name" className="text-sm font-semibold text-gray-700 dark:text-gray-200">
                {t('fullName')}
              </Label>
              <div className="relative">
                <User className={`absolute top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400 dark:text-gray-500 ${isRTL ? 'right-3' : 'left-3'}`} />
                <Input
                  id="name"
                  type="text"
                  autoComplete="name"
                  placeholder={t('fullName')}
                  className={`h-11 ${isRTL ? 'pr-11 pl-4' : 'pl-11 pr-4'} bg-gray-50 dark:bg-slate-800 border-gray-300 dark:border-slate-600 text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-500 focus:border-primary dark:focus:border-primary focus:ring-2 focus:ring-primary/20 dark:focus:ring-primary/30 rounded-xl transition-all`}
                  value={formData.name}
                  onChange={(e) => setFormData((p) => ({ ...p, name: e.target.value }))}
                  required
                  disabled={submitting}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="email" className="text-sm font-semibold text-gray-700 dark:text-gray-200">
                {t('email')}
              </Label>
              <div className="relative">
                <Mail className={`absolute top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400 dark:text-gray-500 ${isRTL ? 'right-3' : 'left-3'}`} />
                <Input
                  id="email"
                  type="email"
                  autoComplete="email"
                  inputMode="email"
                  placeholder="example@email.com"
                  className={`h-11 ${isRTL ? 'pr-11 pl-4' : 'pl-11 pr-4'} bg-gray-50 dark:bg-slate-800 border-gray-300 dark:border-slate-600 text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-500 focus:border-primary dark:focus:border-primary focus:ring-2 focus:ring-primary/20 dark:focus:ring-primary/30 rounded-xl transition-all`}
                  value={formData.email}
                  onChange={(e) => setFormData((p) => ({ ...p, email: e.target.value }))}
                  required
                  disabled={submitting}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone" className="text-sm font-semibold text-gray-700 dark:text-gray-200">
                {t('phone')} ({t('optional')})
              </Label>
              <div className="relative">
                <Phone className={`absolute top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400 dark:text-gray-500 ${isRTL ? 'right-3' : 'left-3'}`} />
                <Input
                  id="phone"
                  type="tel"
                  autoComplete="tel"
                  placeholder="01234567890"
                  className={`h-11 ${isRTL ? 'pr-11 pl-4' : 'pl-11 pr-4'} bg-gray-50 dark:bg-slate-800 border-gray-300 dark:border-slate-600 text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-500 focus:border-primary dark:focus:border-primary focus:ring-2 focus:ring-primary/20 dark:focus:ring-primary/30 rounded-xl transition-all`}
                  value={formData.phone}
                  onChange={(e) => setFormData((p) => ({ ...p, phone: e.target.value }))}
                  disabled={submitting}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="password" className="text-sm font-semibold text-gray-700 dark:text-gray-200">
                {t('password')}
              </Label>
              <div className="relative">
                <Lock className={`absolute top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400 dark:text-gray-500 ${isRTL ? 'right-3' : 'left-3'}`} />
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="new-password"
                  placeholder="••••••••"
                  className={`h-11 ${isRTL ? 'pr-11 pl-11' : 'pl-11 pr-11'} bg-gray-50 dark:bg-slate-800 border-gray-300 dark:border-slate-600 text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-500 focus:border-primary dark:focus:border-primary focus:ring-2 focus:ring-primary/20 dark:focus:ring-primary/30 rounded-xl transition-all`}
                  value={formData.password}
                  onChange={(e) => setFormData((p) => ({ ...p, password: e.target.value }))}
                  required
                  disabled={submitting}
                  minLength={8}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  className={`absolute top-1/2 -translate-y-1/2 ${isRTL ? 'left-3' : 'right-3'} text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 transition-colors`}
                  aria-label={showPassword ? 'إخفاء كلمة المرور' : 'إظهار كلمة المرور'}
                  disabled={submitting}
                >
                  {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="passwordConfirm" className="text-sm font-semibold text-gray-700 dark:text-gray-200">
                {t('confirmPassword')}
              </Label>
              <div className="relative">
                <Lock className={`absolute top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400 dark:text-gray-500 ${isRTL ? 'right-3' : 'left-3'}`} />
                <Input
                  id="passwordConfirm"
                  type="password"
                  autoComplete="new-password"
                  placeholder="••••••••"
                  className={`h-11 ${isRTL ? 'pr-11 pl-4' : 'pl-11 pr-4'} bg-gray-50 dark:bg-slate-800 border-gray-300 dark:border-slate-600 text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-500 focus:border-primary dark:focus:border-primary focus:ring-2 focus:ring-primary/20 dark:focus:ring-primary/30 rounded-xl transition-all`}
                  value={formData.passwordConfirm}
                  onChange={(e) => setFormData((p) => ({ ...p, passwordConfirm: e.target.value }))}
                  required
                  disabled={submitting}
                />
              </div>
            </div>

            <div className={`flex items-start gap-3 ${isRTL ? 'flex-row-reverse' : ''}`}>
              <Checkbox
                id="terms"
                checked={acceptTerms}
                onCheckedChange={(checked) => setAcceptTerms(Boolean(checked))}
                disabled={submitting}
                className="mt-1 border-gray-300 dark:border-slate-600 data-[state=checked]:bg-primary data-[state=checked]:border-primary"
              />
              <label htmlFor="terms" className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed cursor-pointer">
                {t('agreeTerms')}{' '}
                <Link href="/terms" className="text-primary dark:text-primary-400 font-semibold hover:underline">
                  {t('terms')}
                </Link>{' '}
                {t('and')}{' '}
                <Link href="/privacy" className="text-primary dark:text-primary-400 font-semibold hover:underline">
                  {t('privacy')}
                </Link>
              </label>
            </div>

            <Button
              type="submit"
              className="w-full h-12 bg-gradient-to-r from-primary to-yellow-500 hover:from-primary/90 hover:to-yellow-500/90 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 text-base"
              disabled={submitting}
            >
              {submitting ? (
                <div className="flex items-center gap-2">
                  <Loader2 className="h-5 w-5 animate-spin" />
                  <span>{t('loading')}</span>
                </div>
              ) : (
                t('signup')
              )}
            </Button>
          </form>

          <div className="relative my-8">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-300 dark:border-slate-600" />
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-4 bg-white/80 dark:bg-slate-900/80 text-gray-500 dark:text-gray-400 font-medium">
                {t('or')}
              </span>
            </div>
          </div>

          <p className="text-center text-sm text-gray-600 dark:text-gray-300">
            {t('alreadyHaveAccount')}{' '}
            <Link
              href={`/login${callbackUrl !== '/' ? `?callbackUrl=${encodeURIComponent(callbackUrl)}` : ''}`}
              className="font-bold text-primary hover:text-primary/80 dark:text-primary-400 dark:hover:text-primary-300 hover:underline transition-colors"
            >
              {t('loginNow')}
            </Link>
          </p>
        </div>

        <p className="mt-6 text-center text-xs text-gray-500 dark:text-gray-400">
          {language === 'ar'
            ? 'بإنشاء حساب، أنت توافق على شروط الخدمة وسياسة الخصوصية'
            : 'By creating an account, you agree to our Terms of Service and Privacy Policy'}
        </p>
      </div>
    </div>
  )
}

export default function SignupPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-pink-50 dark:from-slate-950 dark:via-slate-900 dark:to-purple-950 flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      }
    >
      <SignupForm />
    </Suspense>
  )
}