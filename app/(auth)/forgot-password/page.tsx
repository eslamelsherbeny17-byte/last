// app/forgot-password/page.tsx
"use client"

import type React from "react"
import { Suspense, useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Mail, ArrowRight, Loader2, ShoppingBag, ShieldCheck } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useLanguage } from "@/contexts/LanguageContext"
import { toast } from "sonner"
import { authAPI } from "@/lib/api"

function ForgotPasswordForm() {
  const router = useRouter()
  const { t, language } = useLanguage()
  const [loading, setLoading] = useState(false)
  const [email, setEmail] = useState("")
  const [emailSent, setEmailSent] = useState(false)

 // app/forgot-password/page.tsx
const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault()
  setLoading(true)

  try {
    await authAPI.forgotPassword({ email })
    
    setEmailSent(true)
    toast.success(
      language === "ar" 
        ? "تم إرسال رمز التحقق إلى بريدك الإلكتروني" 
        : "Reset code sent to your email"
    )
    
    setTimeout(() => {
      router.push(`/verify-reset-code?email=${encodeURIComponent(email)}`)
    }, 2000)
  } catch (error: any) {
    // ✅ رسائل خطأ واضحة ومحددة
    const errorMessage = error.response?.data?.message

    if (error.response?.status === 404) {
      toast.error(
        language === "ar"
          ? "لا يوجد حساب مسجل بهذا البريد الإلكتروني. يرجى التحقق من البريد أو إنشاء حساب جديد."
          : "No account found with this email. Please check your email or create a new account."
      )
    } else if (error.response?.status === 500) {
      toast.error(
        language === "ar"
          ? "عذراً، حدث خطأ أثناء إرسال رمز التحقق. يرجى المحاولة مرة أخرى لاحقاً."
          : "Sorry, an error occurred while sending the verification code. Please try again later.",
        {
          description: errorMessage || undefined
        }
      )
    } else {
      toast.error(errorMessage || (language === "ar" ? "حدث خطأ ما" : "Something went wrong"))
    }
  } finally {
    setLoading(false)
  }
}
  const isRTL = language === "ar"

  if (emailSent) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-blue-50 dark:from-slate-950 dark:via-slate-900 dark:to-green-950 flex items-center justify-center py-8 md:py-12 px-4 md:px-6">
        <div className="w-full max-w-md">
          <div className="backdrop-blur-xl bg-white/80 dark:bg-slate-900/80 p-8 rounded-2xl shadow-2xl border border-gray-200/50 dark:border-slate-700/50 animate-slide-in-up text-center">
            <div className="w-16 h-16 mx-auto mb-6 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
              <ShieldCheck className="w-8 h-8 text-green-600 dark:text-green-400" />
            </div>
            <h2 className="text-2xl font-bold mb-3 text-gray-900 dark:text-white">
              {language === "ar" ? "تم الإرسال بنجاح!" : "Email Sent Successfully!"}
            </h2>
            <p className="text-gray-600 dark:text-gray-300 mb-6">
              {language === "ar" 
                ? "تم إرسال رمز التحقق المكون من 6 أرقام إلى" 
                : "A 6-digit verification code has been sent to"}
            </p>
            <p className="font-semibold text-primary mb-6">{email}</p>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {language === "ar"
                ? "جاري التوجيه لصفحة التحقق..."
                : "Redirecting to verification page..."}
            </p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-blue-50 dark:from-slate-950 dark:via-slate-900 dark:to-green-950 flex items-center justify-center py-8 md:py-12 px-4 md:px-6">
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
          <p className="text-sm md:text-base text-gray-600 dark:text-gray-300 font-medium">
            {language === "ar" ? "استعادة كلمة المرور" : "Password Recovery"}
          </p>
        </div>

        {/* Form Card */}
        <div className="backdrop-blur-xl bg-white/80 dark:bg-slate-900/80 p-6 md:p-8 rounded-2xl shadow-2xl border border-gray-200/50 dark:border-slate-700/50 animate-slide-in-right">
          <div className="text-center mb-6">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
              <Mail className="w-8 h-8 text-green-600 dark:text-green-400" />
            </div>
            <h2 className="text-xl md:text-2xl font-bold mb-2 text-gray-900 dark:text-white">
              {language === "ar" ? "نسيت كلمة المرور؟" : "Forgot Password?"}
            </h2>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {language === "ar"
                ? "لا تقلق! أدخل بريدك الإلكتروني وسنرسل لك رمز التحقق"
                : "Don't worry! Enter your email and we'll send you a verification code"}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="email" className="text-sm font-semibold text-gray-700 dark:text-gray-200">
                {t("email")}
              </Label>
              <div className="relative">
                <Mail
                  className={`absolute top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400 dark:text-gray-500 ${
                    isRTL ? "right-3" : "left-3"
                  }`}
                />
                <Input
                  id="email"
                  type="email"
                  placeholder="example@email.com"
                  className={`h-12 ${
                    isRTL ? "pr-11 pl-4" : "pl-11 pr-4"
                  } bg-gray-50 dark:bg-slate-800 border-gray-300 dark:border-slate-600 text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-500 focus:border-green-500 dark:focus:border-green-500 focus:ring-2 focus:ring-green-500/20 dark:focus:ring-green-500/30 rounded-xl transition-all`}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  disabled={loading}
                />
              </div>
            </div>

            <Button
              type="submit"
              className="w-full h-12 bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 text-base"
              disabled={loading}
            >
              {loading ? (
                <div className="flex items-center gap-2">
                  <Loader2 className="h-5 w-5 animate-spin" />
                  <span>{t("loading")}</span>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <span>{language === "ar" ? "إرسال رمز التحقق" : "Send Verification Code"}</span>
                  <ArrowRight className={`h-5 w-5 ${isRTL ? "rotate-180" : ""}`} />
                </div>
              )}
            </Button>
          </form>

          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-300 dark:border-slate-600"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-4 bg-white/80 dark:bg-slate-900/80 text-gray-500 dark:text-gray-400 font-medium">
                {t("or")}
              </span>
            </div>
          </div>

          <p className="text-center text-sm text-gray-600 dark:text-gray-300">
            {language === "ar" ? "تذكرت كلمة المرور؟" : "Remember your password?"}{" "}
            <Link
              href="/login"
              className="font-bold text-green-600 hover:text-green-700 dark:text-green-400 dark:hover:text-green-300 hover:underline transition-colors"
            >
              {t("login")}
            </Link>
          </p>
        </div>

        <p className="mt-6 text-center text-xs text-gray-500 dark:text-gray-400">
          {language === "ar"
            ? "سيتم إرسال رمز التحقق المكون من 6 أرقام إلى بريدك الإلكتروني"
            : "A 6-digit verification code will be sent to your email"}
        </p>
      </div>
    </div>
  )
}

export default function ForgotPasswordPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-blue-50 dark:from-slate-950 dark:via-slate-900 dark:to-green-950 flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      }
    >
      <ForgotPasswordForm />
    </Suspense>
  )
}