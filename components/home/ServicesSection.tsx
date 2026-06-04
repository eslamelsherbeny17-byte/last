"use client"

import { Truck, RefreshCw, ShieldCheck, Headphones } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { useLanguage } from "@/contexts/LanguageContext"

export function ServicesSection() {
  const { t, isRTL } = useLanguage()

  const services = [
    {
      icon: Truck,
      title: t('freeShippingTitle'),
      description: t('freeShippingDesc'),
      color: "bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400",
    },
    {
      icon: RefreshCw,
      title: t('easyReturnsTitle'),
      description: t('easyReturnsDesc'),
      color: "bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400",
    },
    {
      icon: ShieldCheck,
      title: t('securePaymentTitle'),
      description: t('securePaymentDesc'),
      color: "bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400",
    },
    {
      icon: Headphones,
      title: t('support247Title'),
      description: t('support247Desc'),
      color: "bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400",
    },
  ]

  return (
    <section className="py-6 sm:py-8 bg-muted/30" aria-label="Our services">
      <div className="container mx-auto px-4">
        {/* Grid - 4 Columns on All Screens */}
        <div className="grid grid-cols-4 gap-2 sm:gap-3 md:gap-4">
          {services.map((service, index) => (
            <Card
              key={index}
              className="border-0 shadow-sm hover:shadow-md dark:hover:shadow-primary/5 transition-all duration-300 bg-card"
            >
              <CardContent className="p-2 sm:p-3 md:p-4 text-center" dir={isRTL ? 'rtl' : 'ltr'}>
                {/* Icon */}
                <div
                  className={`w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 mx-auto mb-1.5 sm:mb-2 md:mb-3 rounded-full ${service.color} flex items-center justify-center transition-transform hover:scale-110`}
                  aria-hidden="true"
                >
                  <service.icon className="h-4 w-4 sm:h-5 sm:w-5 md:h-6 md:w-6" />
                </div>
                
                {/* Title */}
                <h3 className="font-bold text-[10px] sm:text-xs md:text-sm lg:text-base mb-0.5 sm:mb-1 text-foreground line-clamp-1">
                  {service.title}
                </h3>
                
                {/* Description - Hidden on Mobile */}
                <p className="hidden sm:block text-[10px] sm:text-xs md:text-sm text-muted-foreground line-clamp-2">
                  {service.description}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  )
}