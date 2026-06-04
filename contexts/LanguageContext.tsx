"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"
import { translations, type TranslationKey } from "@/lib/translations"

type Language = "ar" | "en"
type Direction = "rtl" | "ltr"

interface LanguageContextType {
  language: Language
  direction: Direction
  setLanguage: (lang: Language) => void
  toggleLanguage: () => void
  t: (key: TranslationKey) => string
  isRTL: boolean
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined)

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguageState] = useState<Language>("ar")
  const [direction, setDirection] = useState<Direction>("rtl")
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)

    // Check for saved language or use browser preference
    let savedLang = localStorage.getItem("language") as Language | null

    if (!savedLang) {
      // Detect browser language
      const browserLang = navigator.language.toLowerCase()
      savedLang = browserLang.startsWith("ar") ? "ar" : "en"
    }

    // Only update if different from default
    if (savedLang !== language) {
      setLanguageState(savedLang)
      updateDirection(savedLang)
    }
  }, [])

  const updateDirection = (lang: Language) => {
    const newDirection = lang === "ar" ? "rtl" : "ltr"
    setDirection(newDirection)

    if (typeof document !== "undefined") {
      const html = document.documentElement
      html.setAttribute("lang", lang)
      html.setAttribute("dir", newDirection)
      html.setAttribute("data-lang", lang)

      if (lang === "ar") {
        html.style.fontFamily = "var(--font-cairo), sans-serif"
      } else {
        html.style.fontFamily = "var(--font-inter), sans-serif"
      }
    }
  }

  const setLanguage = (lang: Language) => {
    setLanguageState(lang)
    if (typeof window !== "undefined") {
      localStorage.setItem("language", lang)
    }
    updateDirection(lang)
  }

  const toggleLanguage = () => {
    const newLang = language === "ar" ? "en" : "ar"
    setLanguage(newLang)
  }

  const t = (key: TranslationKey): string => {
    return translations[language][key] || key
  }

  const isRTL = direction === "rtl"

  return (
    <LanguageContext.Provider value={{ language, direction, setLanguage, toggleLanguage, t, isRTL }}>
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
