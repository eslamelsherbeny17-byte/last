"use client"

import { Languages } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useLanguage } from "@/contexts/LanguageContext"
import { motion } from "framer-motion"

export function LanguageToggle() {
  const { language, toggleLanguage } = useLanguage()

  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={toggleLanguage}
      className="h-9 md:h-10 px-2 md:px-3 rounded-xl hover:bg-primary/10 transition-all active:scale-95 gap-1.5 md:gap-2 font-semibold focus-ring"
      aria-label={language === "ar" ? "Switch to English" : "Switch to Arabic"}
    >
      <Languages className="h-4 w-4 flex-shrink-0" aria-hidden="true" />
      <motion.span
        key={language}
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 10 }}
        transition={{ duration: 0.2 }}
        className="text-xs md:text-sm"
      >
        {language === "ar" ? "EN" : "عربي"}
      </motion.span>
      <span className="sr-only">{language === "ar" ? "Switch to English" : "Switch to Arabic"}</span>
    </Button>
  )
}
