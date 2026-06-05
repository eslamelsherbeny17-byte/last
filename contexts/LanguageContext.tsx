"use client"

import { createContext, useContext, useState, ReactNode } from "react"
import { translations, type TranslationKey } from "@/lib/translations"

interface LanguageContextType {
  language: "ar"
  direction: "rtl"
  t: (key: TranslationKey) => string
  isRTL: true
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined)

export function LanguageProvider({ children }: { children: ReactNode }) {
  // ثابت دائماً على العربية
  const language = "ar"
  const direction = "rtl"
  const isRTL = true

  // تأكد من ضبط الـ Direction في الـ DOM عند التحميل
  if (typeof document !== "undefined") {
    document.documentElement.setAttribute("lang", "ar")
    document.documentElement.setAttribute("dir", "rtl")
    document.documentElement.style.fontFamily = "var(--font-cairo), sans-serif"
  }

  const t = (key: TranslationKey): string => {
    return translations.ar[key] || key
  }

  return (
    <LanguageContext.Provider value={{ language, direction, t, isRTL }}>
      {children}
    </LanguageContext.Provider>
  )
}

export const useLanguage = () => {
  const context = useContext(LanguageContext)
  if (context === undefined) {
    throw new Error("useLanguage must be used within LanguageProvider")
  }
  return context
}