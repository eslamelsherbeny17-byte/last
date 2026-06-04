import Link from 'next/link'
import Image from 'next/image'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'

const occasions = [
  {
    id: 1,
    title: 'مناسبات رسمية',
    description: 'أزياء أنيقة للمناسبات الخاصة',
    image: '/images/occasion-formal.jpg',
    link: '/shop?occasion=formal',
    color: 'from-purple-500 to-pink-500',
  },
  {
    id: 2,
    title: 'عمل ومهني',
    description: 'إطلالة احترافية ومحتشمة',
    image: '/images/occasion-work.jpg',
    link: '/shop?occasion=work',
    color: 'from-blue-500 to-cyan-500',
  },
  {
    id: 3,
    title: 'يومي وكاجوال',
    description: 'راحة وأناقة للاستخدام اليومي',
    image: '/images/occasion-casual.jpg',
    link: '/shop?occasion=casual',
    color: 'from-green-500 to-teal-500',
  },
  {
    id: 4,
    title: 'رياضة وترفيه',
    description: 'ملابس عملية للأنشطة الرياضية',
    image: '/images/occasion-sport.jpg',
    link: '/shop?occasion=sport',
    color: 'from-orange-500 to-red-500',
  },
]

export function ShopByOccasion() {
  return (
    <section className='py-16 bg-secondary'>
      <div className='container mx-auto px-4'>
        {/* Header */}
        <div className='text-center mb-12'>
          <h2 className='text-3xl md:text-4xl font-bold mb-2'>
            تسوقي حسب المناسبة
          </h2>
          <p className='text-muted-foreground'>
            اختاري الإطلالة المناسبة لكل مناسبة
          </p>
        </div>

        {/* Occasions Grid */}
        <div className='grid md:grid-cols-2 lg:grid-cols-4 gap-6'>
          {occasions.map((occasion) => (
            <Link key={occasion.id} href={occasion.link}>
              <Card className='group overflow-hidden hover:shadow-2xl transition-all duration-300'>
                <span className='relative h-64 overflow-hidden block'>
                  <Image
                    src={occasion.image}
                    alt={occasion.title}
                    fill
                    className='object-cover group-hover:scale-110 transition-transform duration-500'
                  />
                  <span
                    className={`absolute inset-0 bg-gradient-to-t ${occasion.color} opacity-60 group-hover:opacity-70 transition-opacity`}
                  />
                  <span className='absolute inset-0 flex flex-col items-center justify-center text-white text-center p-4'>
                    <h3 className='text-2xl font-bold mb-2'>
                      {occasion.title}
                    </h3>
                    <p className='text-sm mb-4 opacity-90'>
                      {occasion.description}
                    </p>
                    <Button
                      variant='secondary'
                      size='sm'
                      className='opacity-0 group-hover:opacity-100 transition-opacity'
                    >
                      تسوقي الآن
                    </Button>
                  </span>
                </span>
              </Card>
            </Link>
          ))}
        </div>
      </div>
    </section>
  )
}
