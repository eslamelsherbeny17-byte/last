// app/reset-password/page.tsx
"use client"

import type React from "react"
import { Suspense, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import Link from "next/link"
import { Lock, Eye, EyeOff, Loader2, ShoppingBag, CheckCircle2, X, Check } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useLanguage } from "@/contexts/LanguageContext"
import { toast } from "sonner"
import { authAPI } from "@/lib/api"

function ResetPasswordForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { t, language } = useLanguage()
  const email = searchParams.get("email") || ""

  const [loading, setLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [formData, setFormData] = useState({
    newPassword: "",
    confirmPassword: "",
  })

  const isRTL = language === "ar"

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

  const passwordStrength = calculatePasswordStrength(formData.newPassword)

  const getStrengthColor = (strength: number) => {
    if (strength < 30) return "bg-red-500"
    if (strength < 60) return "bg-amber-500"
    if (strength < 80) return "bg-yellow-500"
    return "bg-green-500"
  }

  const getStrengthText = (strength: number) => {
    if (strength < 30) return language === "ar" ? "ضعيفة جداً" : "Very Weak"
    if (strength < 60) return language === "ar" ? "ضعيفة" : "Weak"
    if (strength < 80) return language === "ar" ? "متوسطة" : "Medium"
    return language === "ar" ? "قوية" : "Strong"
  }

  const passwordRequirements = [
    {
      met: formData.newPassword.length >= 8,
      text: language === "ar" ? "على الأقل 8 أحرف" : "At least 8 characters",
    },
    {
      met: /[a-z]/.test(formData.newPassword) && /[A-Z]/.test(formData.newPassword),
      text: language === "ar" ? "أحرف كبيرة وصغيرة" : "Upper & lowercase letters",
    },
    {
      met: /[0-9]/.test(formData.newPassword),
      text: language === "ar" ? "رقم واحد على الأقل" : "At least one number",
    },
    {
      met: /[^a-zA-Z0-9]/.test(formData.newPassword),
      text: language === "ar" ? "رمز خاص (@, #, $, etc.)" : "Special character (@, #, $, etc.)",
    },
  ]

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (formData.newPassword !== formData.confirmPassword) {
      toast.error(language === "ar" ? "كلمة المرور غير متطابقة" : "Passwords don't match")
      return
    }

    if (formData.newPassword.length < 8) {
      toast.error(language === "ar" ? "كلمة المرور يجب أن تكون 8 أحرف على الأقل" : "Password must be at least 8 characters")
      return
    }

    if (passwordStrength < 60) {
      toast.warning(language === "ar" ? "يُفضل استخدام كلمة مرور أقوى" : "Consider using a stronger password")
    }

    setLoading(true)

    try {
      await authAPI.resetPassword({
        email,
        newPassword: formData.newPassword,
      })

      toast.success(language === "ar" ? "تم تغيير كلمة المرور بنجاح!" : "Password reset successfully!")
      
      // Redirect to login after 2 seconds
      setTimeout(() => {
        router.push("/login")
      }, 2000)
    } catch (error: any) {
      toast.error(error.response?.data?.message || t("error"))
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-pink-50 dark:from-slate-950 dark:via-slate-900 dark:to-purple-950 flex items-center justify-center py-8 md:py-12 px-4 md:px-6">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8 md:mb-10 animate-fade-in">
          <Link href="/" className="inline-block">
            <div className="flex items-center justify-center gap-2 mb-3">
              <div className="w-10 h-10 md:w-12 md:h-12 rounded-xl bg-gradient-to-br from-primary to-yellow-500 flex items-center justify-center shadow-lg">
                <ShoppingBag className="w-5 h-5 md:w-6 md:h-6 text-white" />
              </div>
              <h1 className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-primary via-yellow-500 to-primary bg-clip-text text-transparent">
                {language === "ar" ? "أيمن بشير" : "Ayman Bashir"}
              </h1>
            </div>
          </Link>
        </div>

        {/* Form Card */}
        <div className="backdrop-blur-xl bg-white/80 dark:bg-slate-900/80 p-6 md:p-8 rounded-2xl shadow-2xl border border-gray-200/50 dark:border-slate-700/50 animate-slide-in-left">
          <div className="text-center mb-6">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center">
              <Lock className="w-8 h-8 text-purple-600 dark:text-purple-400" />
            </div>
            <h2 className="text-xl md:text-2xl font-bold mb-2 text-gray-900 dark:text-white">
              {language === "ar" ? "إعادة تعيين كلمة المرور" : "Reset Password"}
            </h2>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {language === "ar"
                ? "أدخل كلمة المرور الجديدة لحسابك"
                : "Enter your new password for your account"}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* New Password */}
            <div className="space-y-2">
              <Label htmlFor="newPassword" className="text-sm font-semibold text-gray-700 dark:text-gray-200">
                {language === "ar" ? "كلمة المرور الجديدة" : "New Password"}
              </Label>
              <div className="relative">
                <Lock
                  className={`absolute top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400 dark:text-gray-500 ${
                    isRTL ? "right-3" : "left-3"
                  }`}
                />
                <Input
                  id="newPassword"
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  className={`h-12 ${
                    isRTL ? "pr-11 pl-11" : "pl-11 pr-11"
                  } bg-gray-50 dark:bg-slate-800 border-gray-300 dark:border-slate-600 text-gray-900 dark:text-white focus:border-purple-500 dark:focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 dark:focus:ring-purple-500/30 rounded-xl transition-all`}
                  value={formData.newPassword}
                  onChange={(e) => setFormData({ ...formData, newPassword: e.target.value })}
                  required
                  minLength={8}
                  disabled={loading}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className={`absolute top-1/2 -translate-y-1/2 ${
                    isRTL ? "left-3" : "right-3"
                  } text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 transition-colors`}
                >
                  {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>

              {/* Password Strength Indicator */}
              {formData.newPassword && (
                <div className="space-y-2 mt-3">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-muted-foreground">
                      {language === "ar" ? "قوة كلمة المرور:" : "Password strength:"}
                    </span>
                    <span
                      className={`font-semibold ${
                        passwordStrength < 30
                          ? "text-red-600"
                          : passwordStrength < 60
                          ? "text-amber-600"
                          : passwordStrength < 80
                          ? "text-yellow-600"
                          : "text-green-600"
                      }`}
                    >
                      {getStrengthText(passwordStrength)}
                    </span>
                  </div>
                  <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                    <div
                      className={`h-full transition-all duration-300 ${getStrengthColor(passwordStrength)}`}
                      style={{ width: `${passwordStrength}%` }}
                    ></div>
                  </div>
                </div>
              )}

              {/* Password Requirements */}
              {formData.newPassword && (
                <div className="mt-3 p-3 bg-gray-50 dark:bg-gray-800/50 rounded-lg space-y-2">
                  <p className="text-xs font-semibold text-muted-foreground mb-2">
                    {language === "ar" ? "متطلبات كلمة المرور:" : "Password requirements:"}
                  </p>
                  {passwordRequirements.map((req, index) => (
                    <div key={index} className="flex items-center gap-2 text-xs">
                      {req.met ? (
                        <Check className="h-4 w-4 text-green-600" />
                      ) : (
                        <X className="h-4 w-4 text-gray-400" />
                      )}
                      <span className={req.met ? "text-green-600" : "text-gray-500"}>{req.text}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Confirm Password */}
            <div className="space-y-2">
              <Label htmlFor="confirmPassword" className="text-sm font-semibold text-gray-700 dark:text-gray-200">
                {language === "ar" ? "تأكيد كلمة المرور" : "Confirm Password"}
              </Label>
              <div className="relative">
                <Lock
                  className={`absolute top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400 dark:text-gray-500 ${
                    isRTL ? "right-3" : "left-3"
                  }`}
                />
                <Input
                  id="confirmPassword"
                  type={showConfirmPassword ? "text" : "password"}
                  placeholder="••••••••"
                  className={`h-12 ${
                    isRTL ? "pr-11 pl-11" : "pl-11 pr-11"
                  } bg-gray-50 dark:bg-slate-800 border-gray-300 dark:border-slate-600 text-gray-900 dark:text-white focus:border-purple-500 dark:focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 dark:focus:ring-purple-500/30 rounded-xl transition-all`}
                  value={formData.confirmPassword}
                  onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                  required
                  minLength={8}
                  disabled={loading}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className={`absolute top-1/2 -translate-y-1/2 ${
                    isRTL ? "left-3" : "right-3"
                  } text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 transition-colors`}
                >
                  {showConfirmPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>

              {/* Password Match Indicator */}
              {formData.confirmPassword && (
                <p
                  className={`text-xs flex items-center gap-1 ${
                    formData.newPassword === formData.confirmPassword ? "text-green-600" : "text-red-600"
                  }`}
                >
                  {formData.newPassword === formData.confirmPassword ? (
                    <>
                      <Check className="h-3 w-3" />
                      {language === "ar" ? "كلمة المرور متطابقة" : "Passwords match"}
                    </>
                  ) : (
                    <>
                      <X className="h-3 w-3" />
                      {language === "ar" ? "كلمة المرور غير متطابقة" : "Passwords don't match"}
                    </>
                  )}
                </p>
              )}
            </div>

            {/* Submit Button */}
            <Button
              type="submit"
              className="w-full h-12 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 text-base"
              disabled={loading}
            >
              {loading ? (
                <div className="flex items-center gap-2">
                  <Loader2 className="h-5 w-5 animate-spin" />
                  <span>{t("loading")}</span>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-5 w-5" />
                  <span>{language === "ar" ? "إعادة تعيين كلمة المرور" : "Reset Password"}</span>
                </div>
              )}
            </Button>
          </form>

          <div className="mt-6 text-center">
            <Link
              href="/login"
              className="text-sm text-gray-600 dark:text-gray-400 hover:text-purple-600 dark:hover:text-purple-400 hover:underline transition-colors"
            >
              {language === "ar" ? "← الرجوع لتسجيل الدخول" : "← Back to Login"}
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function ResetPasswordPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-pink-50 dark:from-slate-950 dark:via-slate-900 dark:to-purple-950 flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      }
    >
      <ResetPasswordForm />
    </Suspense>
  )
}