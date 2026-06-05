"use client"

import { createContext, useContext, useState, ReactNode, useEffect } from "react" // 👈 أضفنا useEffect هنا
import { translations, type TranslationKey } from "@/lib/translations"

interface LanguageContextType {
  language: "ar"
  direction: "rtl"
  t: (key: TranslationKey) => string
  isRTL: true
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined)

export function LanguageProvider({ children }: { children: ReactNode }) {
  const language = "ar"; 
  const isRTL = true;    

  useEffect(() => {
    // هذه الخطوة تضمن أن أي تغيير في التصميم أو اللغة يتم تطبيقه فوراً على مستوى الـ HTML
    document.documentElement.lang = "ar";
    document.documentElement.dir = "rtl";
    document.documentElement.style.fontFamily = "var(--font-cairo), sans-serif";
  }, []);

  const t = (key: TranslationKey): string => translations.ar[key] || key;

  return (
    <LanguageContext.Provider value={{ language, direction: "rtl", t, isRTL }}>
      {children}
    </LanguageContext.Provider>
  );
}

export const useLanguage = () => {
  const context = useContext(LanguageContext)
  if (context === undefined) {
    throw new Error("useLanguage must be used within LanguageProvider")
  }
  return context
}