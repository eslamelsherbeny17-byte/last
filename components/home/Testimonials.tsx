'use client'

import { useState } from 'react'
import { Star, ChevronLeft, ChevronRight, Quote } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'

const testimonials = [
  {
    id: 1,
    name: 'فاطمة محمد',
    image: '/images/customer-1.jpg',
    rating: 5,
    text: 'منتجات رائعة وجودة عالية جداً! التوصيل كان سريع والخدمة ممتازة. بالتأكيد سأطلب مرة أخرى.',
    product: 'عباية سوداء فاخرة',
  },
  {
    id: 2,
    name: 'مريم أحمد',
    image: '/images/customer-2.jpg',
    rating: 5,
    text: 'أفضل متجر للأزياء المحتشمة! التصاميم عصرية والأقمشة مريحة جداً. شكراً لكم.',
    product: 'فستان محتشم',
  },
  {
    id: 3,
    name: 'سارة علي',
    image: '/images/customer-3.jpg',
    rating: 5,
    text: 'تجربة تسوق رائعة من البداية للنهاية. المنتجات كما في الصور والأسعار مناسبة.',
    product: 'حجاب حرير',
  },
]

export function Testimonials() {
  const [currentIndex, setCurrentIndex] = useState(0)

  const next = () => {
    setCurrentIndex((prev) => (prev + 1) % testimonials.length)
  }

  const prev = () => {
    setCurrentIndex(
      (prev) => (prev - 1 + testimonials.length) % testimonials.length
    )
  }

  const current = testimonials[currentIndex]

  return (
    <section className='py-16 bg-gradient-to-br from-primary/5 to-primary/10'>
      <div className='container mx-auto px-4'>
        {/* Header */}
        <div className='text-center mb-12'>
          <h2 className='text-3xl md:text-4xl font-bold mb-2'>آراء عملائنا</h2>
          <p className='text-muted-foreground'>
            ماذا يقول عملاؤنا عن تجربتهم معنا
          </p>
        </div>

        {/* Testimonial Card */}
        <div className='max-w-4xl mx-auto'>
          <Card className='border-2 border-primary/20'>
            <CardContent className='pt-12 pb-8 px-8 md:px-12'>
              <Quote className='h-12 w-12 text-primary/20 mb-6' />

              <div className='flex items-center gap-1 mb-6'>
                {[...Array(current.rating)].map((_, i) => (
                  <Star
                    key={i}
                    className='h-5 w-5 fill-yellow-400 text-yellow-400'
                  />
                ))}
              </div>

              <p className='text-xl md:text-2xl leading-relaxed mb-8 text-foreground'>
                "{current.text}"
              </p>

              <div className='flex items-center gap-4'>
                <Avatar className='h-16 w-16'>
                  <AvatarImage src={current.image} />
                  <AvatarFallback>{current.name.charAt(0)}</AvatarFallback>
                </Avatar>
                <div>
                  <h4 className='font-bold text-lg'>{current.name}</h4>
                  <p className='text-sm text-muted-foreground'>
                    اشترت: {current.product}
                  </p>
                </div>
              </div>

              {/* Navigation */}
              <div className='flex items-center justify-center gap-4 mt-8'>
                <Button variant='outline' size='icon' onClick={prev}>
                  <ChevronRight className='h-4 w-4' />
                </Button>

                <div className='flex gap-2'>
                  {testimonials.map((_, index) => (
                    <button
                      key={index}
                      onClick={() => setCurrentIndex(index)}
                      className={`h-2 rounded-full transition-all ${
                        index === currentIndex
                          ? 'w-8 bg-primary'
                          : 'w-2 bg-primary/30'
                      }`}
                    />
                  ))}
                </div>

                <Button variant='outline' size='icon' onClick={next}>
                  <ChevronLeft className='h-4 w-4' />
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  )
}
