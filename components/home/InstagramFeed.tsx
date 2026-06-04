import { Instagram } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'

const instagramPosts = [
  { id: 1, image: '/images/insta-1.jpg', likes: 234 },
  { id: 2, image: '/images/insta-2.jpg', likes: 456 },
  { id: 3, image: '/images/insta-3.jpg', likes: 189 },
  { id: 4, image: '/images/insta-4.jpg', likes: 567 },
  { id: 5, image: '/images/insta-5.jpg', likes: 345 },
  { id: 6, image: '/images/insta-6.jpg', likes: 678 },
]

export function InstagramFeed() {
  return (
    <section className='py-16 bg-white'>
      <div className='container mx-auto px-4'>
        {/* Header */}
        <div className='text-center mb-12'>
          <div className='inline-flex items-center gap-2 text-pink-500 mb-2'>
            <Instagram className='h-6 w-6' />
            <span className='font-semibold'>تابعونا على إنستقرام</span>
          </div>
          <h2 className='text-3xl md:text-4xl font-bold mb-2'>@aymanbasher</h2>
          <p className='text-muted-foreground'>
            شاركينا إطلالتك واحصلي على فرصة الظهور في صفحتنا
          </p>
        </div>

        {/* Instagram Grid */}
        <div className='grid grid-cols-3 md:grid-cols-6 gap-2 md:gap-4'>
          {instagramPosts.map((post) => (
            <Link
              key={post.id}
              href='https://instagram.com/aymanbasher'
              target='_blank'
              className='group relative aspect-square overflow-hidden rounded-lg'
            >
              <Image
                src={post.image}
                alt={`Instagram post ${post.id}`}
                fill
                className='object-cover group-hover:scale-110 transition-transform duration-300'
              />
              <div className='absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center'>
                <div className='text-white flex items-center gap-2'>
                  <Instagram className='h-6 w-6' />
                  <span className='font-semibold'>{post.likes}</span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  )
}
