import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Gift } from 'lucide-react'
import Link from 'next/link'
import Image from 'next/image'

export function SpecialOffers() {
  return (
    <section className='py-16 bg-accent text-white'>
      <div className='container mx-auto px-4'>
        <div className='grid md:grid-cols-2 gap-8 items-center'>
          {/* Text Content */}
          <div>
            <Badge className='bg-primary mb-4'>
              <Gift className='ml-2 h-4 w-4' />
              عرض خاص
            </Badge>
            <h2 className='text-3xl md:text-5xl font-bold mb-4'>
              خصم يصل إلى 40%
            </h2>
            <p className='text-xl mb-6 text-gray-200'>
              على مجموعة مختارة من العباءات والفساتين
            </p>
            <ul className='space-y-2 mb-8 text-gray-200'>
              <li className='flex items-center gap-2'>
                <span className='text-primary text-2xl'>✓</span>
                <span>شحن مجاني لجميع الطلبات</span>
              </li>
              <li className='flex items-center gap-2'>
                <span className='text-primary text-2xl'>✓</span>
                <span>إمكانية الإرجاع خلال 30 يوم</span>
              </li>
              <li className='flex items-center gap-2'>
                <span className='text-primary text-2xl'>✓</span>
                <span>هدية مجانية مع كل طلب</span>
              </li>
            </ul>
            <Link href='/shop?offers=true'>
              <Button size='lg' className='gold-gradient text-lg px-8'>
                تسوقي الآن
              </Button>
            </Link>
          </div>

          {/* Image */}
          <div className='relative h-[400px] rounded-2xl overflow-hidden'>
            <Image
              src='/images/special-offer.jpg'
              alt='Special Offer'
              fill
              className='object-cover'
            />
            <div className='absolute top-4 right-4 bg-red-500 text-white px-6 py-3 rounded-full font-bold text-2xl shadow-lg'>
              -40%
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
