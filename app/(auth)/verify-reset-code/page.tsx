// app/verify-reset-code/page.tsx
"use client"

import type React from "react"
import { Suspense, useState, useRef, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import Link from "next/link"
import { ShieldCheck, Loader2, ShoppingBag, RotateCcw, ArrowRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useLanguage } from "@/contexts/LanguageContext"
import { toast } from "sonner"
import { authAPI } from "@/lib/api"

function VerifyResetCodeForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { t, language } = useLanguage()
  const email = searchParams.get("email") || ""

  const [loading, setLoading] = useState(false)
  const [resending, setResending] = useState(false)
  const [code, setCode] = useState(["", "", "", "", "", ""])
  const [timer, setTimer] = useState(120) // 2 minutes
  const inputRefs = useRef<(HTMLInputElement | null)[]>([])

  const isRTL = language === "ar"

  // Timer countdown
  useEffect(() => {
    if (timer > 0) {
      const interval = setInterval(() => {
        setTimer((prev) => prev - 1)
      }, 1000)
      return () => clearInterval(interval)
    }
  }, [timer])

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, "0")}`
  }

  const handleChange = (index: number, value: string) => {
    // Only allow numbers
    if (value && !/^\d$/.test(value)) return

    const newCode = [...code]
    newCode[index] = value
    setCode(newCode)

    // Auto-focus next input
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus()
    }
  }

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace" && !code[index] && index > 0) {
      inputRefs.current[index - 1]?.focus()
    }
  }

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault()
    const pastedData = e.clipboardData.getData("text").slice(0, 6)
    
    if (!/^\d+$/.test(pastedData)) {
      toast.error(language === "ar" ? "الرجاء لصق أرقام فقط" : "Please paste numbers only")
      return
    }

    const newCode = pastedData.split("").concat(Array(6).fill("")).slice(0, 6)
    setCode(newCode)
    
    // Focus last filled input
    const lastIndex = Math.min(pastedData.length, 5)
    inputRefs.current[lastIndex]?.focus()
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    const resetCode = code.join("")
    
    if (resetCode.length !== 6) {
      toast.error(language === "ar" ? "الرجاء إدخال الرمز المكون من 6 أرقام" : "Please enter the 6-digit code")
      return
    }

    setLoading(true)

    try {
      await authAPI.verifyPassResetCode({ resetCode })
      
      toast.success(language === "ar" ? "تم التحقق بنجاح!" : "Verification successful!")
      router.push(`/reset-password?email=${encodeURIComponent(email)}`)
    } catch (error: any) {
      toast.error(error.response?.data?.message || (language === "ar" ? "رمز التحقق غير صحيح أو منتهي الصلاحية" : "Invalid or expired verification code"))
      setCode(["", "", "", "", "", ""])
      inputRefs.current[0]?.focus()
    } finally {
      setLoading(false)
    }
  }

  const handleResend = async () => {
    if (timer > 0) return

    setResending(true)

    try {
      await authAPI.forgotPassword({ email })
      toast.success(language === "ar" ? "تم إعادة إرسال الرمز" : "Code resent successfully")
      setTimer(120)
      setCode(["", "", "", "", "", ""])
      inputRefs.current[0]?.focus()
    } catch (error: any) {
      toast.error(error.response?.data?.message || t("error"))
    } finally {
      setResending(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-slate-950 dark:via-slate-900 dark:to-blue-950 flex items-center justify-center py-8 md:py-12 px-4 md:px-6">
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
        <div className="backdrop-blur-xl bg-white/80 dark:bg-slate-900/80 p-6 md:p-8 rounded-2xl shadow-2xl border border-gray-200/50 dark:border-slate-700/50 animate-slide-in-up">
          <div className="text-center mb-6">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
              <ShieldCheck className="w-8 h-8 text-blue-600 dark:text-blue-400" />
            </div>
            <h2 className="text-xl md:text-2xl font-bold mb-2 text-gray-900 dark:text-white">
              {language === "ar" ? "تحقق من بريدك الإلكتروني" : "Check Your Email"}
            </h2>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">
              {language === "ar"
                ? "أدخل الرمز المكون من 6 أرقام المرسل إلى"
                : "Enter the 6-digit code sent to"}
            </p>
            <p className="font-semibold text-primary text-sm">{email}</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* OTP Inputs - التصحيح هنا */}
            <div className="flex justify-center gap-2" dir="ltr">
              {code.map((digit, index) => (
                <input
                  key={index}
                  ref={(el) => {
                    inputRefs.current[index] = el
                  }}
                  type="text"
                  inputMode="numeric"
                  maxLength={1}
                  value={digit}
                  onChange={(e) => handleChange(index, e.target.value)}
                  onKeyDown={(e) => handleKeyDown(index, e)}
                  onPaste={handlePaste}
                  disabled={loading}
                  className="w-12 h-14 sm:w-14 sm:h-16 text-center text-xl sm:text-2xl font-bold border-2 border-gray-300 dark:border-slate-600 rounded-xl bg-gray-50 dark:bg-slate-800 text-gray-900 dark:text-white focus:border-blue-500 dark:focus:border-blue-500 focus:ring-4 focus:ring-blue-500/20 dark:focus:ring-blue-500/30 transition-all disabled:opacity-50"
                />
              ))}
            </div>

            {/* Timer */}
            <div className="text-center">
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {timer > 0 ? (
                  <>
                    {language === "ar" ? "إعادة الإرسال بعد" : "Resend code in"}{" "}
                    <span className="font-bold text-blue-600 dark:text-blue-400">{formatTime(timer)}</span>
                  </>
                ) : (
                  <button
                    type="button"
                    onClick={handleResend}
                    disabled={resending}
                    className="text-blue-600 dark:text-blue-400 font-semibold hover:underline disabled:opacity-50 inline-flex items-center gap-1"
                  >
                    {resending ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        {language === "ar" ? "جاري الإرسال..." : "Sending..."}
                      </>
                    ) : (
                      <>
                        <RotateCcw className="h-4 w-4" />
                        {language === "ar" ? "إعادة إرسال الرمز" : "Resend Code"}
                      </>
                    )}
                  </button>
                )}
              </p>
            </div>

            {/* Submit Button */}
            <Button
              type="submit"
              className="w-full h-12 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 text-base"
              disabled={loading || code.join("").length !== 6}
            >
              {loading ? (
                <div className="flex items-center gap-2">
                  <Loader2 className="h-5 w-5 animate-spin" />
                  <span>{t("loading")}</span>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <span>{language === "ar" ? "تحقق من الرمز" : "Verify Code"}</span>
                  <ArrowRight className={`h-5 w-5 ${isRTL ? "rotate-180" : ""}`} />
                </div>
              )}
            </Button>
          </form>

          <div className="mt-6 text-center">
            <Link
              href="/login"
              className="text-sm text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 hover:underline transition-colors"
            >
              {language === "ar" ? "← الرجوع لتسجيل الدخول" : "← Back to Login"}
            </Link>
          </div>
        </div>

        <p className="mt-6 text-center text-xs text-gray-500 dark:text-gray-400">
          {language === "ar"
            ? "لم تستلم الرمز؟ تحقق من مجلد الرسائل غير المرغوب فيها"
            : "Didn't receive the code? Check your spam folder"}
        </p>
      </div>
    </div>
  )
}

export default function VerifyResetCodePage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-slate-950 dark:via-slate-900 dark:to-blue-950 flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      }
    >
      <VerifyResetCodeForm />
    </Suspense>
  )
}