"use client"

import { useState, useEffect, useCallback } from "react"
import { ChevronLeft, ChevronRight, ArrowRight } from "lucide-react"
import Link from "next/link"
import Image from "next/image"
import { useLanguage } from "@/contexts/LanguageContext"
import { cn } from "@/lib/utils"
import { motion, AnimatePresence } from "framer-motion"

// ✨ تم تقليص العدد إلى 3 شرائح فقط (أفضل ممارسة للـ UX) وتعديل المحتوى ليكون "فاخراً ومختصراً"
const heroSlides = {
  ar: [
    {
      id: 1,
      title: "كوليكشن الموسم الجديد",
      subtitle: "إصدار حصري",
      description: "تصاميم عصرية تكمل جمالك وتناسب استايلك المميز.",
      image: "/slider-12.jpg",
      link: "/shop", 
      buttonText: "تسوقي المجموعة",
    },
    {
      id: 2,
      title: "راحة وشياكة في النقاب",
      subtitle: "الأكثر مبيعاً",
      description: "خامات خفيفة وعملية تمنحك الطلة التي تبحثين عنها بأعلى جودة.",
      image: "/slider-7.png",
      link: "/shop?category=69504643c188856707a0ef7e",
      buttonText: "اكتشفي الآن",
    },
    {
      id: 3,
      title: "فخامة الثوب الرجالي",
      subtitle: "أصالة وأناقة",
      description: "أجود الخامات التي تناسب كل الأذواق وتكمل أناقتك.",
      image: "/slider-5.png",
      link: "/shop?category=695047ce0bfb9b8b5fe82663", 
      buttonText: "تسوق للرجال",
    }
  ],
  en: [
    {
      id: 1,
      title: "New Season Collection",
      subtitle: "Exclusive Release",
      description: "Modern designs that complement your beauty and unique style.",
      image: "/slider-1.png",
      link: "/shop",
      buttonText: "Shop Collection",
    },
    {
      id: 2,
      title: "Comfort & Style: Niqab",
      subtitle: "Best Seller",
      description: "Lightweight, practical fabrics for the premium look you desire.",
      image: "/slider-7.png",
      link: "/shop?category=69504643c188856707a0ef7e",
      buttonText: "Discover Now",
    },
    {
      id: 3,
      title: "Premium Men's Thobe",
      subtitle: "Authentic Elegance",
      description: "The finest fabrics designed to complete your sharp look.",
      image: "/slider-5.png",
      link: "/shop?category=695047ce0bfb9b8b5fe82663",
      buttonText: "Shop Men",
    }
  ],
}

export default function HeroSlider() {
  const { language, isRTL } = useLanguage()
  const [current, setCurrent] = useState(0)
  const [isHovering, setIsHovering] = useState(false)

  const slides = heroSlides[language as keyof typeof heroSlides] || heroSlides.ar

  const next = useCallback(() => {
    setCurrent((prev) => (prev + 1) % slides.length)
  }, [slides.length])

  const prev = useCallback(() => {
    setCurrent((prev) => (prev - 1 + slides.length) % slides.length)
  }, [slides.length])

  // التبديل التلقائي البطيء (كل 6 ثواني بدل 5 لضمان القراءة)
  useEffect(() => {
    if (isHovering) return
    const interval = setInterval(next, 6000)
    return () => clearInterval(interval)
  }, [next, isHovering])

  return (
    <section 
      className="relative w-full h-[75vh] min-h-[550px] lg:h-[85vh] lg:min-h-[700px] overflow-hidden bg-black group"
      onMouseEnter={() => setIsHovering(true)}
      onMouseLeave={() => setIsHovering(false)}
    >
      <AnimatePresence initial={false} mode="wait">
        <motion.div
          key={current}
          initial={{ opacity: 0, scale: 1.05 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.8, ease: [0.25, 0.1, 0.25, 1] }}
          className="absolute inset-0"
        >
          {/* صورة الخلفية الفاخرة التي تملأ الشاشة */}
          <Image
            src={slides[current].image}
            alt={slides[current].title}
            fill
            priority={current === 0}
            className="object-cover object-top lg:object-center"
            quality={95}
          />
          
          {/* تدرج لوني احترافي يضمن وضوح النص دائماً مهما كانت ألوان الصورة */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent lg:bg-gradient-to-r lg:from-black/80 lg:via-black/50 lg:to-transparent" />

          {/* المحتوى النصي (Immersive Typography) */}
          <div className="absolute inset-0 flex items-end lg:items-center">
            <div className="container mx-auto px-6 pb-24 lg:pb-0">
              <div className={cn("max-w-2xl", isRTL ? "text-right" : "text-left")}>
                <motion.div
                  initial={{ y: 30, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.3, duration: 0.6 }}
                >
                  <span className="inline-block px-4 py-1.5 bg-white/10 backdrop-blur-md text-white text-xs lg:text-sm font-bold rounded-full mb-4 lg:mb-6 uppercase tracking-widest border border-white/20">
                    {slides[current].subtitle}
                  </span>
                  <h1 className="text-4xl lg:text-6xl xl:text-7xl font-black text-white leading-[1.1] mb-4 lg:mb-6 drop-shadow-lg">
                    {slides[current].title}
                  </h1>
                  <p className="text-base lg:text-lg text-gray-200 mb-8 max-w-lg leading-relaxed font-medium drop-shadow-md">
                    {slides[current].description}
                  </p>
                  
                  <Link 
                    href={slides[current].link} 
                    className="inline-flex items-center gap-3 px-8 py-4 bg-white text-black rounded-full font-bold text-sm lg:text-base hover:scale-105 hover:bg-gray-100 transition-all shadow-[0_0_40px_rgba(255,255,255,0.3)]"
                  >
                    {slides[current].buttonText}
                    <ArrowRight className={cn("w-5 h-5", isRTL && "rotate-180")} />
                  </Link>
                </motion.div>
              </div>
            </div>
          </div>
        </motion.div>
      </AnimatePresence>

      {/* أزرار التحكم - تظهر فقط في الشاشات الكبيرة وعلى الهوفر */}
      <div className="hidden lg:block opacity-0 group-hover:opacity-100 transition-opacity duration-300">
        <button
          onClick={isRTL ? next : prev}
          className={cn(
            "absolute top-1/2 -translate-y-1/2 z-30 p-4 bg-white/10 backdrop-blur-md text-white border border-white/20 rounded-full hover:bg-white hover:text-black transition-all",
            "left-6 xl:left-10"
          )}
        >
          <ChevronLeft className="w-6 h-6" strokeWidth={2} />
        </button>
        <button
          onClick={isRTL ? prev : next}
          className={cn(
            "absolute top-1/2 -translate-y-1/2 z-30 p-4 bg-white/10 backdrop-blur-md text-white border border-white/20 rounded-full hover:bg-white hover:text-black transition-all",
            "right-6 xl:right-10"
          )}
        >
          <ChevronRight className="w-6 h-6" strokeWidth={2} />
        </button>
      </div>

      {/* مؤشرات التنقل السفلية - تصميم أنيق وحديث */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-30 flex gap-2.5 items-center">
        {slides.map((_, index) => (
          <button
            key={index}
            onClick={() => setCurrent(index)}
            className={cn(
              "rounded-full transition-all duration-500",
              index === current
                ? "bg-white w-10 h-1.5 shadow-[0_0_10px_rgba(255,255,255,0.5)]"
                : "bg-white/40 w-2 h-2 hover:bg-white/60 hover:w-4"
            )}
            aria-label={`Go to slide ${index + 1}`}
          />
        ))}
      </div>
    </section>
  )
}