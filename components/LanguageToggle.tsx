"use client"

import { Languages } from "lucide-react"

export function LanguageToggle() {
  // بما أن الموقع عربي فقط، لا نحتاج لتغيير اللغة
  // هذا الكود سيعرض أيقونة ثابتة توضح أن الموقع بالعربية، ولن يسبب أي أخطاء في الرفع
  return (
    <div className="flex items-center gap-1.5 md:gap-2 px-2 md:px-3 h-9 md:h-10 rounded-xl bg-primary/5 text-primary font-semibold select-none cursor-default">
      <Languages className="h-4 w-4 flex-shrink-0" aria-hidden="true" />
      <span className="text-xs md:text-sm">عربي</span>
    </div>
  )
}