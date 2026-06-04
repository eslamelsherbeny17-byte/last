import Link from 'next/link'
import Image from 'next/image'
import { Calendar } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'

const blogPosts = [
  {
    id: 1,
    title: 'أفضل طرق تنسيق العباية',
    excerpt: 'نصائح عملية لتنسيق العباية بطريقة عصرية وأنيقة...',
    image: '/images/blog-1.jpg',
    date: '2024-01-15',
    category: 'نصائح الموضة',
  },
  {
    id: 2,
    title: 'اختيار الحجاب المناسب لشكل الوجه',
    excerpt: 'دليلك الكامل لاختيار الحجاب الذي يناسب شكل وجهك...',
    image: '/images/blog-2.jpg',
    date: '2024-01-12',
    category: 'دليل الشراء',
  },
  {
    id: 3,
    title: 'ألوان موسم الربيع 2024',
    excerpt: 'تعرفي على أحدث ألوان الموضة لهذا الموسم...',
    image: '/images/blog-3.jpg',
    date: '2024-01-10',
    category: 'ترندات',
  },
]

export function FashionTips() {
  return (
    <section className='py-16 bg-secondary'>
      <div className='container mx-auto px-4'>
        {/* Header */}
        <div className='text-center mb-12'>
          <h2 className='text-3xl md:text-4xl font-bold mb-2'>نصائح الموضة</h2>
          <p className='text-muted-foreground'>
            أحدث النصائح والإرشادات في عالم الموضة المحتشمة
          </p>
        </div>

        {/* Blog Grid */}
        <div className='grid md:grid-cols-3 gap-6'>
          {blogPosts.map((post) => (
            <Link key={post.id} href={`/blog/${post.id}`}>
              <Card className='group overflow-hidden hover:shadow-xl transition-all'>
                <span className='relative h-48 overflow-hidden block'>
                  <Image
                    src={post.image}
                    alt={post.title}
                    fill
                    className='object-cover group-hover:scale-110 transition-transform duration-500'
                  />
                  <span className='absolute top-4 right-4 bg-primary text-white px-3 py-1 rounded-full text-xs font-semibold'>
                    {post.category}
                  </span>
                </span>
                <CardContent className='p-6'>
                  <span className='flex items-center gap-2 text-sm text-muted-foreground mb-3'>
                    <Calendar className='h-4 w-4' />
                    <span>
                      {new Date(post.date).toLocaleDateString('ar-EG')}
                    </span>
                  </span>
                  <h3 className='font-bold text-lg mb-2 group-hover:text-primary transition-colors'>
                    {post.title}
                  </h3>
                  <p className='text-sm text-muted-foreground line-clamp-2'>
                    {post.excerpt}
                  </p>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </div>
    </section>
  )
}
