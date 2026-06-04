'use client'

import { ShoppingBag, DollarSign, Calculator, Package } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { cn } from '@/lib/utils'

interface Props {
  price: string
  discount: string
  quantity: string
  finalPrice: string
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void
}

export default function PricingCard({
  price,
  discount,
  quantity,
  finalPrice,
  onChange,
}: Props) {
  return (
    <Card className='border-border shadow-2xl bg-card rounded-[2rem] overflow-hidden transition-all duration-300'>
      <CardHeader className='pb-4 pt-6 px-6 border-b border-border/50 bg-muted/20'>
        <CardTitle className='text-xl font-black flex items-center gap-3 text-foreground'>
          <div className='p-2 bg-primary/10 rounded-lg'>
            <ShoppingBag className='h-5 w-5 text-primary' />
          </div>
          السعر والمخزون
        </CardTitle>
      </CardHeader>

      <CardContent className='space-y-6 px-6 pb-8 pt-6'>
        {/* Price and Discount Row - Responsive Grid */}
        <div className='grid grid-cols-1 sm:grid-cols-2 gap-5'>
          <div className='space-y-2.5'>
            <Label
              htmlFor='price'
              className='text-sm font-bold text-foreground/80 flex items-center gap-2'
            >
              السعر الأساسي <span className='text-destructive text-lg'>*</span>
            </Label>
            <div className="relative group">
              <Input
                type='text'
                inputMode='decimal'
                id='price'
                name='price'
                value={price}
                onChange={onChange}
                placeholder='0.00'
                className='h-12 text-lg border-border bg-background rounded-xl font-sans focus-visible:ring-2 focus-visible:ring-primary pr-10 transition-all'
                style={{ direction: 'ltr', textAlign: 'left' }}
              />
              <DollarSign className="absolute right-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground group-focus-within:text-primary transition-colors" />
            </div>
          </div>

          <div className='space-y-2.5'>
            <Label
              htmlFor='discount'
              className='text-sm font-bold text-foreground/80'
            >
              نسبة الخصم (%)
            </Label>
            <div className="relative group">
              <Input
                type='text'
                inputMode='decimal'
                id='discount'
                name='discount'
                value={discount}
                onChange={onChange}
                placeholder='0'
                className='h-12 text-lg border-border bg-background rounded-xl font-sans focus-visible:ring-2 focus-visible:ring-primary pr-10 transition-all'
                style={{ direction: 'ltr', textAlign: 'left' }}
              />
              <div className="absolute right-3 top-1/2 -translate-y-1/2 font-bold text-muted-foreground group-focus-within:text-primary transition-colors">
                %
              </div>
            </div>
          </div>
        </div>

        {/* Final Price Box - Highlighted */}
        <div className='space-y-3 p-4 bg-primary/5 dark:bg-primary/10 rounded-[1.5rem] border border-primary/20 animate-in fade-in zoom-in duration-500'>
          <Label className='text-xs font-black text-primary uppercase tracking-widest flex items-center gap-2'>
            <Calculator className="h-3.5 w-3.5" /> السعر النهائي للبيع
          </Label>
          <div
            className='flex items-center justify-between'
            dir='ltr'
          >
            <p className='text-3xl font-black text-primary tracking-tight'>
              {finalPrice} <span className="text-sm font-bold">جنيه</span>
            </p>
            <div className="h-10 w-10 rounded-full bg-primary text-primary-foreground flex items-center justify-center shadow-lg shadow-primary/20">
               <CheckCircleIcon className="h-6 w-6" />
            </div>
          </div>
        </div>

        {/* Quantity Field */}
        <div className='space-y-2.5'>
          <Label
            htmlFor='quantity'
            className='text-sm font-bold text-foreground/80 flex items-center gap-2'
          >
            الكمية المتاحة <span className='text-destructive text-lg'>*</span>
          </Label>
          <div className="relative group">
            <Input
              type='text'
              inputMode='numeric'
              id='quantity'
              name='quantity'
              value={quantity}
              onChange={onChange}
              placeholder='0'
              className='h-12 text-lg border-border bg-background rounded-xl font-sans focus-visible:ring-2 focus-visible:ring-primary pr-10 transition-all'
              style={{ direction: 'ltr', textAlign: 'left' }}
            />
            <Package className="absolute right-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground group-focus-within:text-primary transition-colors" />
          </div>
          <p className="text-[10px] text-muted-foreground mr-1">سيتم تقليل هذا العدد تلقائياً مع كل عملية شراء ناجحة.</p>
        </div>
      </CardContent>
    </Card>
  )
}

// مكون أيقونة بسيط للاستخدام الداخلي
function CheckCircleIcon(props: any) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="3"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M20 6 9 17l-5-5" />
    </svg>
  )
}