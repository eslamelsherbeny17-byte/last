import Image from 'next/image'
import Link from 'next/link'
import { Card } from '@/components/ui/card'

const brands = [
  {
    id: 1,
    name: 'Elegant Modest',
    logo: '/images/brand-1.png',
    link: '/shop?brand=1',
  },
  {
    id: 2,
    name: 'Modest Couture',
    logo: '/images/brand-2.png',
    link: '/shop?brand=2',
  },
  {
    id: 3,
    name: 'Islamic Fashion',
    logo: '/images/brand-3.png',
    link: '/shop?brand=3',
  },
  {
    id: 4,
    name: 'Modesty Style',
    logo: '/images/brand-4.png',
    link: '/shop?brand=4',
  },
  {
    id: 5,
    name: 'Hijab House',
    logo: '/images/brand-5.png',
    link: '/shop?brand=5',
  },
  {
    id: 6,
    name: 'Abaya Collection',
    logo: '/images/brand-6.png',
    link: '/shop?brand=6',
  },
]

export function FeaturedBrands() {
  return (
    <section className='py-16 bg-white'>
      <div className='container mx-auto px-4'>
        {/* Header */}
        <div className='text-center mb-12'>
          <h2 className='text-3xl md:text-4xl font-bold mb-2'>
            الماركات المميزة
          </h2>
          <p className='text-muted-foreground'>
            تسوقي من أفضل الماركات العالمية
          </p>
        </div>

        {/* Brands Grid */}
        <div className='grid grid-cols-3 md:grid-cols-6 gap-4'>
          {brands.map((brand) => (
            <Link key={brand.id} href={brand.link}>
              <Card className='group hover:shadow-lg transition-all cursor-pointer'>
                <span className='relative h-24 md:h-32 flex items-center justify-center p-4 block'>
                  <Image
                    src={brand.logo}
                    alt={brand.name}
                    width={120}
                    height={60}
                    className='object-contain grayscale group-hover:grayscale-0 transition-all'
                  />
                </span>
              </Card>
            </Link>
          ))}
        </div>
      </div>
    </section>
  )
}
