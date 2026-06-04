'use client'

import { useState } from 'react'
import Image from 'next/image'
import { ChevronLeft, ChevronRight, Maximize2, X } from 'lucide-react'
import { cn, getImageUrl } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogTrigger } from '@/components/ui/dialog' // تأكد من تثبيت Dialog من shadcn

export function ProductGallery({ images, title }: { images: string[], title: string }) {
  const [selectedImage, setSelectedImage] = useState(0)
  const [isZoomOpen, setIsZoomOpen] = useState(false) // حالة التحكم في نافذة التكبير

  return (
    <div className='flex flex-col gap-6'>
      {/* الحاوية الرئيسية */}
      <div className='relative aspect-square lg:aspect-[4/5] bg-muted/20 rounded-[2.5rem] overflow-hidden border border-border/50 shadow-sm group lg:max-h-[75vh]'>
        
        {/* الصورة الأساسية */}
        <Image 
          src={getImageUrl(images[selectedImage])} 
          alt={title} 
          fill 
          className='object-contain p-4 transition-transform duration-1000 group-hover:scale-105 cursor-pointer' 
          priority 
          sizes="(max-width: 768px) 100vw, 50vw"
          onClick={() => setIsZoomOpen(true)} // فتح التكبير عند الضغط على الصورة أيضاً
        />
        
        {/* أسهم التنقل */}
        {images.length > 1 && (
          <div className="absolute inset-x-4 top-1/2 -translate-y-1/2 flex justify-between pointer-events-none">
            <Button 
              variant='secondary' size='icon' 
              className='h-10 w-10 rounded-full bg-white/90 backdrop-blur-md shadow-xl pointer-events-auto opacity-100 lg:opacity-0 lg:group-hover:opacity-100 transition-all duration-300 border-none'
              onClick={() => setSelectedImage((prev) => (prev - 1 + images.length) % images.length)}
            >
              <ChevronRight className='h-6 w-6' />
            </Button>
            <Button 
              variant='secondary' size='icon' 
              className='h-10 w-10 rounded-full bg-white/90 backdrop-blur-md shadow-xl pointer-events-auto opacity-100 lg:opacity-0 lg:group-hover:opacity-100 transition-all duration-300 border-none'
              onClick={() => setSelectedImage((prev) => (prev + 1) % images.length)}
            >
              <ChevronLeft className='h-6 w-6' />
            </Button>
          </div>
        )}

        {/* ✅ زر التكبير - تم تفعيله الآن */}
        <Dialog open={isZoomOpen} onOpenChange={setIsZoomOpen}>
          <DialogTrigger asChild>
            <Button 
              variant="secondary" 
              size="icon" 
              className="absolute top-6 right-6 h-12 w-12 bg-white/80 backdrop-blur-md rounded-2xl shadow-lg opacity-0 group-hover:opacity-100 transition-all duration-300 hover:bg-primary hover:text-white"
            >
              <Maximize2 className="h-6 w-6" />
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-[95vw] h-[90vh] p-0 bg-black/90 border-none overflow-hidden flex items-center justify-center">
            <div className="relative w-full h-full p-4 flex items-center justify-center">
               <Image 
                  src={getImageUrl(images[selectedImage])} 
                  alt={title} 
                  fill 
                  className="object-contain" // لضمان رؤية الصورة كاملة في التكبير
               />
               <Button 
                variant="ghost" 
                size="icon" 
                className="absolute top-4 left-4 text-white hover:bg-white/20 rounded-full"
                onClick={() => setIsZoomOpen(false)}
               >
                 <X className="h-8 w-8" />
               </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* المصغرات */}
      <div className='flex gap-4 overflow-x-auto pb-4 scrollbar-hide snap-x px-2'>
        {images.map((image, index) => (
          <button 
            key={index} 
            onClick={() => setSelectedImage(index)} 
            className={cn(
              'relative h-24 w-20 flex-shrink-0 rounded-2xl overflow-hidden border-2 transition-all duration-300 snap-start',
              selectedImage === index 
                ? 'border-primary ring-4 ring-primary/10 shadow-lg' 
                : 'border-transparent opacity-70 hover:opacity-100'
            )}
          >
            <Image src={getImageUrl(image)} alt={`${title} ${index}`} fill className='object-contain p-1' />
          </button>
        ))}
      </div>
    </div>
  )
}