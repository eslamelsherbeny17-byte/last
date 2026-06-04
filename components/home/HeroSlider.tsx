"use client"

import { useState, useEffect, useCallback, useRef } from "react"
import { ChevronLeft, ChevronRight, ArrowRight } from "lucide-react"
import Link from "next/link"
import Image from "next/image"
import { useLanguage } from "@/contexts/LanguageContext"
import { cn } from "@/lib/utils"
import { motion, useMotionValue, animate, AnimatePresence } from "framer-motion"

// بيانات السلايدر

// بيانات السلايدر المربوطة بالـ IDs الحقيقية لمتجرك
const heroSlides = {
  ar: [
    {
      id: 1,
      title: "كوليكشن الموسم الجديد",
      subtitle: "وصل حديثاً",
      description: "اكتشفي أحدث صيحات الموضة اللي بتكمل جمالك وتناسب استايلك المميز في كل وقت.",
      image: "/slider-12.jpg",
      link: "/shop", // الكل
      buttonText: "اكتشفي المجموعة",
      buttonTextSecondary: "عرض الكل",
    },
    {
      id: 2,
      title: "راحة وشياكة في قسم النقاب",
      subtitle: "خامات مريحة جداً",
      description: "كوليكشن مريح بخامات خفيفة وعملية، بتديكي الطلة اللي بتدوري عليها وبأعلى جودة.",
      image: "/slider-7.png",
      link: "/shop?category=69504643c188856707a0ef7e", // ID قسم النقاب
      buttonText: "تسوقي النقاب",
      buttonTextSecondary: "الأكثر مبيعاً",
    },
    {
      id: 3,
      title: "فن الخمار العصري",
      subtitle: "إصدارات خاصة",
      description: "خمارات بتفاصيل تخطف العين، صممتها أيادي محترفة عشان تميزك في كل خروجة.",
      image: "/slider-3.png",
      link: "/shop?category=695044880bfb9b8b5fe8262b", // ID قسم الخمار
      buttonText: "شوفي الموديلات",
      buttonTextSecondary: "الخامات",
    },
    {
      id: 4,
      title: "شياكة الصغيرين كملت",
      subtitle: "ثوب أطفال",
      description: "أطقم مريحة وشيك بتصاميم تناسب حركتهم، عشان طفلك يكون دايمًا متألق.",
      image: "/slider-10.png",
      link: "/shop?category=6950483a0bfb9b8b5fe82668", // ID قسم ثوب أطفال
      buttonText: "تسوقي للأطفال",
      buttonTextSecondary: "وصل حديثاً",
    },
    {
      id: 5,
      title: "فخامة الثوب الرجالي",
      subtitle: "أصالة وأناقة",
      description: "أجود أنواع الخامات والتصاميم اللي بتناسب كل الأذواق وتكمل شياكتك.",
      image: "/slider-5.png",
      link: "/shop?category=695047ce0bfb9b8b5fe82663", // ID قسم ثوب رجالي
      buttonText: "تسوق للرجال",
      buttonTextSecondary: "المجموعات",
    },
    {
      id: 6,
      title: "تجهيزات الحج والعمرة",
      subtitle: "خامات مميزة",
      description: "كل اللي هتحتاجه من ملابس الإحرام وهدايا الحج بجودة عالية وتصاميم مريحة.",
      image: "/slider-11.png",
      link: "/shop?category=69504a8af9fbff82a9a08a15", // ID قسم إحرام
      buttonText: "تصفح القسم",
      buttonTextSecondary: "الهدايا",
    },
  ],
  en: [
    {
      id: 1,
      title: "New Collection.. Pure Style",
      subtitle: "New In",
      description: "Discover the latest fashion trends that complement your beauty and suit your unique style.",
      image: "/slider-1.png",
      link: "/shop",
      buttonText: "Shop Now",
      buttonTextSecondary: "View All",
    },
    {
      id: 2,
      title: "Comfort & Style: Niqab Section",
      subtitle: "Breathable Fabrics",
      description: "A comfortable collection with lightweight, practical fabrics for the look you desire.",
      image: "/slider-7.png",
      link: "/shop?category=69504643c188856707a0ef7e",
      buttonText: "Shop Niqab",
      buttonTextSecondary: "Best Sellers",
    },
    {
      id: 3,
      title: "The Art of Modern Khimar",
      subtitle: "Special Edition",
      description: "Khimars with eye-catching details, professionally designed for your unique outings.",
      image: "/slider-2.png",
      link: "/shop?category=695044880bfb9b8b5fe8262b",
      buttonText: "View Models",
      buttonTextSecondary: "Fabrics",
    },
    {
      id: 4,
      title: "Style for Little Ones",
      subtitle: "Kids Thobe",
      description: "Comfortable and trendy outfits designed for their active days.",
      image: "/slider-10.png",
      link: "/shop?category=6950483a0bfb9b8b5fe82668",
      buttonText: "Shop Kids",
      buttonTextSecondary: "New Arrivals",
    },
    {
      id: 5,
      title: "Premium Men's Look",
      subtitle: "Men's Thobe",
      description: "The finest fabrics and designs that suit all tastes and complete your sharp look.",
      image: "/slider-5.png",
      link: "/shop?category=695047ce0bfb9b8b5fe82663",
      buttonText: "Shop Men",
      buttonTextSecondary: "Collections",
    },
    {
      id: 6,
      title: "Hajj & Umrah Essentials",
      subtitle: "Premium Quality",
      description: "Everything you need from Ihram clothes and Hajj gifts with comfortable designs.",
      image: "/slider-3.png",
      link: "/shop?category=69504a8af9fbff82a9a08a15",
      buttonText: "Browse Section",
      buttonTextSecondary: "Gifts",
    },
  ],
}
export default function HeroSlider() {
  const { language, isRTL } = useLanguage()
  const [current, setCurrent] = useState(0)
  const [isHovering, setIsHovering] = useState(false)
  const x = useMotionValue(0)
  const containerRef = useRef<HTMLDivElement>(null)

  const slides = heroSlides[language as keyof typeof heroSlides] || heroSlides.ar

  const next = useCallback(() => {
    setCurrent((prev) => (prev + 1) % slides.length)
  }, [slides.length])

  const prev = useCallback(() => {
    setCurrent((prev) => (prev - 1 + slides.length) % slides.length)
  }, [slides.length])

  const goToSlide = useCallback((index: number) => {
    setCurrent(index)
  }, [])

  const scrollTo = useCallback((index: number) => {
    if (!containerRef.current) return
    const width = containerRef.current.offsetWidth
    animate(x, isRTL ? index * width : -index * width, {
      type: "spring",
      stiffness: 300,
      damping: 35,
    })
  }, [isRTL, x])

  // التبديل التلقائي
  useEffect(() => {
    if (isHovering) return
    const interval = setInterval(next, 5000)
    return () => clearInterval(interval)
  }, [next, isHovering])

  useEffect(() => {
    scrollTo(current)
  }, [current, scrollTo])

  return (
    <section 
      className="relative w-full overflow-hidden bg-background"
      onMouseEnter={() => setIsHovering(true)}
      onMouseLeave={() => setIsHovering(false)}
    >
      {/* ============================================ */}
      {/* نسخة الموبايل (إصلاح السحب ومساحة الصورة) */}
      {/* ============================================ */}
      <div className="lg:hidden relative w-full h-[75vh] min-h-[500px] overflow-hidden bg-zinc-950">
        <motion.div
          ref={containerRef}
          style={{ x }}
          drag="x"
          dragDirectionLock // يمنع التداخل: بمجرد بدء السكرول الرأسي، يتوقف السحب الأفقي
          dragConstraints={{ left: 0, right: 0 }}
          dragElastic={0.1}
          onDragEnd={(e, info) => {
            const threshold = 50; 
            if (info.offset.x < -threshold) {
              isRTL ? prev() : next();
            } else if (info.offset.x > threshold) {
              isRTL ? next() : prev();
            } else {
              scrollTo(current);
            }
          }}
          className="flex h-full w-full cursor-grab active:cursor-grabbing touch-pan-y"
        >
          {slides.map((slide, index) => (
            <div key={slide.id} className="relative h-full w-full flex-shrink-0 select-none">
              <Image
                src={slide.image}
                alt={slide.title}
                fill
                priority={index === 0}
                className="object-cover object-center"
                quality={90}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent pointer-events-none" />
              <div className="absolute inset-0 flex flex-col justify-end p-6 pb-24 text-white pointer-events-none">
                <div className="space-y-4 rtl:text-right ltr:text-left pointer-events-auto">
                  <span className="inline-block px-3 py-1 bg-primary text-white text-[10px] font-bold rounded-full uppercase tracking-widest">
                    {slide.subtitle}
                  </span>
                  <h1 className="text-4xl font-black leading-tight drop-shadow-xl">{slide.title}</h1>
                  <p className="text-sm text-gray-200 font-medium line-clamp-2">{slide.description}</p>
                  <div className="pt-2">
                    <Link href={slide.link} className="inline-flex items-center gap-2 px-6 py-3 bg-white text-black rounded-full font-bold text-sm shadow-xl active:scale-95 transition-transform">
                      {slide.buttonText}
                      <ArrowRight className={cn("w-4 h-4", isRTL && "rotate-180")} />
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </motion.div>
      </div>

      {/* ============================================ */}
      {/* نسخة الديسكتاب (إعادة الإطار الأساسي القديم) */}
      {/* ============================================ */}
      <div className="hidden lg:block relative h-[650px] xl:h-[750px] w-full overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-secondary/50 via-background to-background" />
        
        <AnimatePresence mode="wait">
          {slides.map((item, index) => index === current && (
            <motion.div
              key={item.id}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.5 }}
              className="absolute inset-0"
            >
              <div className="container mx-auto h-full grid lg:grid-cols-2 items-center gap-12 px-6 relative z-10">
                
                {/* المحتوى النصي */}
                <div className={cn("order-2 lg:order-1", isRTL ? "text-right" : "text-left")}>
                  <motion.div
                    initial={{ x: isRTL ? 50 : -50, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    transition={{ delay: 0.2 }}
                  >
                    <span className="inline-block px-4 py-1.5 bg-primary/10 text-primary text-sm font-bold rounded-full mb-6 uppercase tracking-widest">
                      {item.subtitle}
                    </span>
                    <h1 className="text-5xl xl:text-7xl font-black text-foreground leading-[1.1] mb-6">
                      {item.title}
                    </h1>
                    <p className="text-lg text-muted-foreground mb-10 max-w-lg leading-relaxed font-medium">
                      {item.description}
                    </p>
                    <div className="flex gap-4">
                      {/* تم تصحيح وسم الإغلاق ليكون Link */}
                      <Link 
                        href={item.link} 
                        className="px-10 py-4 bg-primary text-white rounded-full font-bold text-lg hover:scale-105 transition-transform shadow-lg shadow-primary/20 flex items-center justify-center gap-2"
                      >
                        {item.buttonText}
                        <ArrowRight className={cn("w-5 h-5", isRTL && "rotate-180")} />
                      </Link>
                      <button className="px-10 py-4 border-2 border-primary/20 rounded-full font-bold text-lg hover:bg-white transition-colors">
                        {item.buttonTextSecondary}
                      </button>
                    </div>
                  </motion.div>
                </div>

                {/* إطار الصورة الكلاسيكي القديم */}
                <div className="relative h-full w-full order-1 lg:order-2 flex items-center justify-center lg:justify-end">
                   {/* تأثير توهج خلف الإطار */}
                   <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[80%] h-[80%] bg-primary/10 rounded-full blur-3xl -z-10" />

                   <motion.div 
                     initial={{ scale: 0.9, opacity: 0 }}
                     animate={{ scale: 1, opacity: 1 }}
                     transition={{ delay: 0.3 }}
                     // الإطار: مستطيل بزوايا دائرية، حدود بيضاء فخمة، وظل قوي لبروزه
                     className="relative w-full max-w-[450px] xl:max-w-[520px] aspect-[4/5] rounded-[32px] overflow-hidden shadow-[0_20px_50px_rgba(0,0,0,0.15)] border-4 border-white dark:border-gray-800 ring-1 ring-black/5"
                   >
                    <Image
                      src={item.image}
                      alt={item.title}
                      fill
                      className="object-cover object-top"
                      priority
                      quality={95}
                    />
                   </motion.div>
                </div>

              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* أزرار التحكم الجانبية */}
      <div className="hidden lg:block">
        <button
          onClick={isRTL ? next : prev}
          className={cn(
            "absolute top-1/2 -translate-y-1/2 z-30 p-4 bg-white/80 dark:bg-gray-800/80 text-foreground rounded-full shadow-xl hover:bg-primary hover:text-white transition-all hover:scale-110",
            "left-6 xl:left-10"
          )}
        >
          <ChevronLeft className="w-6 h-6" strokeWidth={2.5} />
        </button>
        <button
          onClick={isRTL ? prev : next}
          className={cn(
            "absolute top-1/2 -translate-y-1/2 z-30 p-4 bg-white/80 dark:bg-gray-800/80 text-foreground rounded-full shadow-xl hover:bg-primary hover:text-white transition-all hover:scale-110",
            "right-6 xl:right-10"
          )}
        >
          <ChevronRight className="w-6 h-6" strokeWidth={2.5} />
        </button>
      </div>

      {/* مؤشرات التنقل السفلية */}
      <div className="absolute bottom-6 sm:bottom-10 left-1/2 -translate-x-1/2 z-30 flex gap-3 items-center">
        {slides.map((_, index) => (
          <button
            key={index}
            onClick={() => goToSlide(index)}
            className={cn(
              "rounded-full transition-all duration-500",
              index === current
                ? "bg-primary w-12 h-1.5 shadow-lg shadow-primary/30"
                : "bg-primary/20 w-2 h-2 hover:bg-primary/40 hover:w-4"
            )}
            aria-label={`Go to slide ${index + 1}`}
          />
        ))}
      </div>
    </section>
  )
}