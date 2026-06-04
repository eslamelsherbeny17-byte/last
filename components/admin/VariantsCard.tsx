'use client'

import { Palette, Plus, Ruler, X } from 'lucide-react'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { cn } from '@/lib/utils'
import { PREDEFINED_COLORS, PREDEFINED_SIZES, getColorHex } from '@/lib/constants'

interface Props {
  colors: string[]
  sizes: string[]
  onToggle: (type: 'colors' | 'sizes', value: string) => void
  customColorHex: string
  setCustomColorHex: (val: string) => void
  onAddCustomColor: () => void
}

export default function VariantsCard({
  colors,
  sizes,
  onToggle,
  customColorHex,
  setCustomColorHex,
  onAddCustomColor,
}: Props) {
  
  // فلترة الألوان والمقاسات عشان القائمة المنسدلة تعرض بس الحاجات اللي لسه ما تمش اختيارها
  const availableColors = PREDEFINED_COLORS.filter((c) => !colors.includes(c.name))
  const availableSizes = PREDEFINED_SIZES.filter((s) => !sizes.includes(s))

  return (
    <Card className='border-border shadow-xl bg-card rounded-[2rem] transition-colors duration-300'>
      <CardHeader className='pb-3 pt-6 px-6 border-b border-border/50'>
        <CardTitle className='text-xl font-bold flex items-center gap-3 text-foreground'>
          <Palette className='h-5 w-5 text-primary' /> المتغيرات (الألوان والمقاسات)
        </CardTitle>
      </CardHeader>
      
      <CardContent className='space-y-8 px-6 pb-8 pt-6'>
        
        {/* ================= الألوان ================= */}
        <div className='space-y-4'>
          <Label className='text-base font-bold text-foreground'>الألوان المتاحة</Label>
          
          <div className='flex gap-3 items-center'>
            {/* القائمة المنسدلة للألوان */}
            <div className='flex-1'>
              <Select onValueChange={(val) => onToggle('colors', val)}>
                <SelectTrigger className="h-12 rounded-xl bg-background border-border text-base">
                  <span className={colors.length > 0 ? 'text-foreground font-medium' : 'text-muted-foreground'}>
                    {colors.length > 0 ? `إضافة لون آخر (تم اختيار ${colors.length})` : 'اضغط لاختيار الألوان...'}
                  </span>
                </SelectTrigger>
                <SelectContent>
                  {availableColors.length === 0 ? (
                    <div className="p-3 text-sm text-center text-muted-foreground">تم اختيار جميع الألوان المتاحة</div>
                  ) : (
                    availableColors.map((c) => (
                      <SelectItem key={c.name} value={c.name} className="cursor-pointer">
                        <div className="flex items-center gap-3">
                          <span
                            className='w-5 h-5 rounded-full border border-black/10 shadow-sm'
                            style={{ backgroundColor: c.hex }}
                          ></span>
                          <span className="font-bold">{c.name}</span>
                        </div>
                      </SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
            </div>

            {/* Custom Color Picker (مربع صغير لاختيار لون مخصص) */}
            <div className='relative group shrink-0' title="إضافة لون مخصص">
              <div className='w-12 h-12 rounded-xl border-2 border-dashed border-border flex items-center justify-center cursor-pointer hover:border-primary hover:bg-muted transition-all shadow-sm'>
                <Plus className='h-6 w-6 text-muted-foreground group-hover:text-primary' />
              </div>
              <input
                type='color'
                className='absolute inset-0 w-full h-full opacity-0 cursor-pointer'
                value={customColorHex}
                onChange={(e) => setCustomColorHex(e.target.value)}
                onBlur={onAddCustomColor}
              />
            </div>
          </div>

          {/* Selected Colors Badges (الألوان التي تم اختيارها) */}
          {colors.length > 0 && (
            <div className='flex flex-wrap gap-2 p-4 bg-muted/20 rounded-2xl border border-border/50 min-h-[60px]'>
              {colors.map((color) => {
                const colorHex = getColorHex(color) || customColorHex // دمج اللون المخصص
                return (
                  <Badge
                    key={color}
                    variant='outline'
                    className='pl-2 pr-1 py-1.5 h-10 flex items-center gap-2 bg-background border-border shadow-sm rounded-xl hover:bg-destructive/5 hover:border-destructive/30 transition-colors group'
                  >
                    <span
                      className='w-5 h-5 rounded-full border border-black/10'
                      style={{ backgroundColor: colorHex }}
                    ></span>
                    <span className='text-sm font-bold text-foreground'>{color}</span>
                    <button
                      type='button'
                      onClick={() => onToggle('colors', color)}
                      className='ml-1 p-1 rounded-full text-muted-foreground group-hover:text-destructive group-hover:bg-destructive/10 transition-colors'
                      title="إزالة اللون"
                    >
                      <X className='h-4 w-4' />
                    </button>
                  </Badge>
                )
              })}
            </div>
          )}
        </div>

        <div className='h-px bg-border/60 my-6'></div>

        {/* ================= المقاسات ================= */}
        <div className='space-y-4'>
          <div className='flex items-center gap-2'>
            <Ruler className='h-5 w-5 text-primary' />
            <Label className='text-base font-bold text-foreground'>المقاسات المتاحة</Label>
          </div>
          
          {/* القائمة المنسدلة للمقاسات */}
          <Select onValueChange={(val) => onToggle('sizes', val)}>
            <SelectTrigger className="h-12 rounded-xl bg-background border-border text-base w-full">
              <span className={sizes.length > 0 ? 'text-foreground font-medium' : 'text-muted-foreground'}>
                {sizes.length > 0 ? `إضافة مقاس آخر (تم اختيار ${sizes.length})` : 'اضغط لاختيار المقاسات...'}
              </span>
            </SelectTrigger>
            <SelectContent>
              {availableSizes.length === 0 ? (
                <div className="p-3 text-sm text-center text-muted-foreground">تم اختيار جميع المقاسات المتاحة</div>
              ) : (
                availableSizes.map((size) => (
                  <SelectItem key={size} value={size} className="cursor-pointer font-bold">
                    {size}
                  </SelectItem>
                ))
              )}
            </SelectContent>
          </Select>

          {/* Selected Sizes Badges (المقاسات التي تم اختيارها) */}
          {sizes.length > 0 && (
            <div className='flex flex-wrap gap-2 p-4 bg-muted/20 rounded-2xl border border-border/50 min-h-[60px]'>
              {sizes.map((size) => (
                <Badge
                  key={size}
                  variant='outline'
                  className='pl-3 pr-1 py-1.5 h-10 flex items-center gap-2 bg-background border-border shadow-sm rounded-xl hover:bg-destructive/5 hover:border-destructive/30 transition-colors group'
                >
                  <span className='text-sm font-bold text-foreground'>{size}</span>
                  <button
                    type='button'
                    onClick={() => onToggle('sizes', size)}
                    className='ml-1 p-1 rounded-full text-muted-foreground group-hover:text-destructive group-hover:bg-destructive/10 transition-colors'
                    title="إزالة المقاس"
                  >
                    <X className='h-4 w-4' />
                  </button>
                </Badge>
              ))}
            </div>
          )}
        </div>

      </CardContent>
    </Card>
  )
}