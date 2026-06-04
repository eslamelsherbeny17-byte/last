import HeroSlider from '@/components/home/HeroSlider'
import { CategoryCircles } from '@/components/home/CategoryCircles'
import { NewArrivals } from '@/components/home/NewArrivals'
import { FlashSale } from '@/components/home/FlashSale'
import { BestSellers } from '@/components/home/BestSellers'

import { ServicesSection } from '@/components/home/ServicesSection'

import { Separator } from '@/components/ui/separator'
import { FeaturedCategoriesManager } from '@/components/home/FeaturedCategoriesManager'

export default function HomePage() {
  return (
    <>
      {/* 1. السلايدر الرئيسي (واجهة العروض) */}
      <HeroSlider />

      {/* 2. الدوائر (التنقل السريع بين الأقسام) */}
      <CategoryCircles />

      <Separator className='my-0 opacity-50' />
       <FlashSale /> 

      {/* 3. وصل حديثاً (لإظهار نشاط المحل الدائم) */}
      <NewArrivals />
       <BestSellers />

{/* هذا المكون سيعرض العبايات، النقاب، الخمار.. إلخ تلقائياً */}
     <FeaturedCategoriesManager />
      {/* 7. الأكثر مبيعاً (القطع التي يفضلها الزبائن) */}
     

      <Separator className='my-10 opacity-30' />

      {/* 8. مميزات المحل (خدماتنا) */}
      <ServicesSection />

      {/* 9. الاشتراك في القائمة البريدية */}
      
    </>
  )
}