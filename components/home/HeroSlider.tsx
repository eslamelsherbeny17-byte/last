"use client"

import { useState, useEffect } from "react"
import { ArrowRight } from "lucide-react" // تم إزالة ImageIcon لأننا لن نستخدمها
import Link from "next/link"
import Image from "next/image"
import { useLanguage } from "@/contexts/LanguageContext"
import { cn } from "@/lib/utils"
import { motion } from "framer-motion"

export default function HeroSlider() {
  const { language, isRTL } = useLanguage()
  const [bannerData, setBannerData] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [isMounted, setIsMounted] = useState(false)
  
  // ✨ حالات جديدة لتتبع تحميل الصورة لعمل تأثير انسيابي
  const [isMobileImageLoaded, setIsMobileImageLoaded] = useState(false)
  const [isDesktopImageLoaded, setIsDesktopImageLoaded] = useState(false)

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    const fetchBannerSettings = async () => {
      try {
        if (isMounted) {
          setLoading(true);
          const res = await fetch('/api/settings', { cache: 'no-store' }); 
          const settingsData = await res.json();
          if (settingsData.data && settingsData.data.heroBanner) {
            setBannerData(settingsData.data.heroBanner);
          }
        }
      } catch (error) {
        console.error("Failed to fetch hero banner settings:", error);
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    }

    fetchBannerSettings();
  }, [isMounted]);

  if (!isMounted || loading) {
    return (
      <section className="relative w-full overflow-hidden bg-background">
        {/* Skeleton للموبايل */}
        <div className="lg:hidden relative w-full h-[75vh] min-h-[500px] overflow-hidden bg-muted/30 animate-pulse flex flex-col justify-end p-6 pb-24">
          <div className={cn("space-y-4 w-full", isRTL ? "items-end text-right flex flex-col" : "items-start text-left flex flex-col")}>
            <div className="w-24 h-6 bg-gray-200 dark:bg-gray-800 rounded-full"></div>
            <div className="w-3/4 h-10 bg-gray-200 dark:bg-gray-800 rounded-lg"></div>
            <div className="w-1/2 h-10 bg-gray-200 dark:bg-gray-800 rounded-lg -mt-1"></div>
            <div className="w-full h-3 bg-gray-200 dark:bg-gray-800 rounded-full mt-2"></div>
            <div className="w-5/6 h-3 bg-gray-200 dark:bg-gray-800 rounded-full"></div>
            <div className="w-32 h-12 bg-gray-200 dark:bg-gray-800 rounded-full mt-4"></div>
          </div>
        </div>

        {/* Skeleton للديسكتوب */}
        <div className="hidden lg:block relative h-[650px] xl:h-[750px] w-full overflow-hidden bg-gradient-to-br from-muted/20 via-background to-background">
          <div className="container mx-auto h-full grid lg:grid-cols-2 items-center gap-12 px-6">
            
            <div className={cn("order-2 lg:order-1 flex flex-col", isRTL ? "items-end" : "items-start")}>
              <div className="w-32 h-8 bg-gray-200 dark:bg-gray-800 rounded-full animate-pulse mb-6"></div>
              <div className="w-3/4 h-16 bg-gray-200 dark:bg-gray-800 rounded-2xl animate-pulse mb-3"></div>
              <div className="w-1/2 h-16 bg-gray-200 dark:bg-gray-800 rounded-2xl animate-pulse mb-6"></div>
              <div className="w-full h-4 bg-gray-200 dark:bg-gray-800 rounded-full animate-pulse mb-3 mt-4"></div>
              <div className="w-4/5 h-4 bg-gray-200 dark:bg-gray-800 rounded-full animate-pulse mb-10"></div>
              <div className="w-48 h-14 bg-gray-200 dark:bg-gray-800 rounded-full animate-pulse"></div>
            </div>

            <div className="order-1 lg:order-2 flex items-center justify-center lg:justify-end">
              {/* ✨ تم إزالة الأيقونة، وأصبح المربع ناعم وفارغ احترافياً */}
              <div className="w-full max-w-[450px] xl:max-w-[520px] aspect-[4/5] rounded-[32px] bg-gray-200/50 dark:bg-gray-800/50 animate-pulse border-4 border-white/50 dark:border-gray-800/50" />
            </div>
            
          </div>
        </div>
      </section>
    )
  }

  if (!bannerData || !bannerData.image) return null;

  const title = (isRTL ? bannerData.titleAr : bannerData.title) || ""
  const subtitle = (isRTL ? bannerData.subtitleAr : bannerData.subtitle) || ""
  const description = (isRTL ? bannerData.descriptionAr : bannerData.description) || ""
  const buttonText = (isRTL ? bannerData.btnTextAr : bannerData.btnText) || "تسوق الآن"
  const link = bannerData.link || "/shop"

  return (
    <section className="relative w-full overflow-hidden bg-background">
      
      {/* تصميم الموبايل */}
      <div className="lg:hidden relative w-full h-[75vh] min-h-[500px] overflow-hidden bg-muted/20">
        <div className="relative h-full w-full flex-shrink-0 select-none">
          <Image
            src={bannerData.image}
            alt={title}
            fill
            priority
            onLoad={() => setIsMobileImageLoaded(true)} // ✨ تفعيل الانيميشن عند اكتمال التحميل
            className={cn(
              "object-cover object-center transition-all duration-1000 ease-out",
              isMobileImageLoaded ? "opacity-100 blur-0 scale-100" : "opacity-0 blur-lg scale-105" // ✨ تأثير الظهور الفخم
            )}
            quality={90}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent pointer-events-none" />
          <div className="absolute inset-0 flex flex-col justify-end p-6 pb-24 text-white pointer-events-none">
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="space-y-4 rtl:text-right ltr:text-left pointer-events-auto"
            >
              {subtitle && (
                <span className="inline-block px-3 py-1 bg-primary text-white text-[10px] font-bold rounded-full uppercase tracking-widest shadow-lg">
                  {subtitle}
                </span>
              )}
              {title && <h1 className="text-4xl font-black leading-tight drop-shadow-xl">{title}</h1>}
              {description && <p className="text-sm text-gray-200 font-medium line-clamp-2">{description}</p>}
              <div className="pt-2">
                <Link href={link} className="inline-flex items-center gap-2 px-6 py-3 bg-white text-black rounded-full font-bold text-sm shadow-xl active:scale-95 transition-transform">
                  {buttonText}
                  <ArrowRight className={cn("w-4 h-4", isRTL && "rotate-180")} />
                </Link>
              </div>
            </motion.div>
          </div>
        </div>
      </div>

      {/* تصميم الديسكتوب */}
      <div className="hidden lg:block relative h-[650px] xl:h-[750px] w-full overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-secondary/50 via-background to-background" />
        
        <div className="absolute inset-0">
          <div className="container mx-auto h-full grid lg:grid-cols-2 items-center gap-12 px-6 relative z-10">
            
            {/* المحتوى النصي */}
            <div className={cn("order-2 lg:order-1", isRTL ? "text-right" : "text-left")}>
              <motion.div
                initial={{ x: isRTL ? 50 : -50, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ duration: 0.6, ease: "easeOut" }}
              >
                {subtitle && (
                  <span className="inline-block px-4 py-1.5 bg-primary/10 text-primary text-sm font-bold rounded-full mb-6 uppercase tracking-widest">
                    {subtitle}
                  </span>
                )}
                
                {title && (
                  <h1 className="text-5xl xl:text-7xl font-black text-foreground leading-[1.1] mb-6">
                    {title}
                  </h1>
                )}
                
                {description && (
                  <p className="text-lg text-muted-foreground mb-10 max-w-lg leading-relaxed font-medium">
                    {description}
                  </p>
                )}
                
                <div className="flex gap-4">
                  <Link 
                    href={link} 
                    className="px-10 py-4 bg-primary text-white rounded-full font-bold text-lg hover:scale-105 transition-transform shadow-lg shadow-primary/20 flex items-center justify-center gap-2"
                  >
                    {buttonText}
                    <ArrowRight className={cn("w-5 h-5", isRTL && "rotate-180")} />
                  </Link>
                </div>
              </motion.div>
            </div>

            {/* إطار الصورة */}
            <div className="relative h-full w-full order-1 lg:order-2 flex items-center justify-center lg:justify-end">
               <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[80%] h-[80%] bg-primary/10 rounded-full blur-3xl -z-10" />

               <motion.div 
                 initial={{ scale: 0.9, opacity: 0 }}
                 animate={{ scale: 1, opacity: 1 }}
                 transition={{ duration: 0.7, delay: 0.2 }}
                 className="relative w-full max-w-[450px] xl:max-w-[520px] aspect-[4/5] rounded-[32px] overflow-hidden shadow-[0_20px_50px_rgba(0,0,0,0.15)] border-4 border-white dark:border-gray-800 ring-1 ring-black/5 bg-muted/30"
               >
                <Image
                  src={bannerData.image}
                  alt={title || "Hero banner"}
                  fill
                  onLoad={() => setIsDesktopImageLoaded(true)} // ✨ تفعيل الانيميشن للديسكتوب
                  className={cn(
                    "object-cover object-top hover:scale-105 transition-all duration-1000 ease-in-out",
                    isDesktopImageLoaded ? "opacity-100 blur-0" : "opacity-0 blur-lg" // ✨ تأثير الظهور الفخم للديسكتوب
                  )}
                  priority
                  quality={100}
                />
               </motion.div>
            </div>

          </div>
        </div>
      </div>
    </section>
  )
}