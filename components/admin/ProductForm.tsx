'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowRight, Upload, X, Loader2, Save, Plus, Info, LayoutGrid } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  adminProductsAPI,
  adminCategoriesAPI,
  adminBrandsAPI,
  adminSubCategoriesAPI,
} from '@/lib/admin-api'
import Link from 'next/link'
import Image from 'next/image'
import VariantsCard from '@/components/admin/VariantsCard'
import PricingCard from '@/components/admin/PricingCard'
import { useToast } from '@/lib/use-toast'
import { getImageUrl } from '@/lib/utils'

interface ProductFormProps {
  params?: { id: string };
}

export default function ProductForm({ params }: ProductFormProps) {
  const router = useRouter()
  const { toast } = useToast()
  const isEditMode = !!params?.id

  const [loading, setLoading] = useState(false)
  const [fetchLoading, setFetchLoading] = useState(isEditMode)

  const [categories, setCategories] = useState<any[]>([])
  const [subCategories, setSubCategories] = useState<any[]>([])
  const [brands, setBrands] = useState<any[]>([])

  const [coverImage, setCoverImage] = useState<File | null>(null)
  const [coverImagePreview, setCoverImagePreview] = useState<string>('')
  const [existingCoverImage, setExistingCoverImage] = useState<string>('')
  const [additionalImages, setAdditionalImages] = useState<File[]>([])
  const [additionalImagePreviews, setAdditionalImagePreviews] = useState<string[]>([])
  const [existingImages, setExistingImages] = useState<string[]>([])

  const [selectedColors, setSelectedColors] = useState<string[]>([])
  const [selectedSizes, setSelectedSizes] = useState<string[]>([])
  const [customColorHex, setCustomColorHex] = useState('#000000')

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    price: '',
    discount: '',
    quantity: '',
    category: '',
    subcategory: '',
    brand: '',
  })

  useEffect(() => {
    fetchCategories()
    fetchBrands()
    if (isEditMode) {
      fetchProduct()
    }
  }, [params?.id])

  useEffect(() => {
    if (formData.category) {
      fetchSubCategories(formData.category)
    }
  }, [formData.category])

  const fetchProduct = async () => {
    try {
      const response = await adminProductsAPI.getById(params!.id)
      const product = response.data || response

      setFormData({
        title: product.title || '',
        description: product.description || '',
        price: product.price?.toString() || '',
        discount: product.priceAfterDiscount 
          ? Math.round(((product.price - product.priceAfterDiscount) / product.price * 100)).toString()
          : '',
        quantity: product.quantity?.toString() || '',
        category: product.category?._id || product.category || '',
        subcategory: product.subCategory?._id || product.subCategory || '', // ✨ تم التعديل
        brand: product.brand?._id || product.brand || '',
      })

      setExistingCoverImage(product.imageCover || '')
      setExistingImages(product.images || [])
      setSelectedColors(product.colors || [])
      setSelectedSizes(product.sizes || [])
    } catch (error) {
      toast({ title: 'خطأ', description: 'فشل تحميل بيانات المنتج', variant: 'destructive' })
    } finally {
      setFetchLoading(false)
    }
  }

  const fetchCategories = async () => {
    try {
      const response = await adminCategoriesAPI.getAll()
      setCategories(response.data || response)
    } catch (error) { console.error(error) }
  }

  const fetchSubCategories = async (categoryId: string) => {
    try {
      const response = await adminSubCategoriesAPI.getByCategoryId(categoryId)
      setSubCategories(response.data || response)
    } catch (error) { setSubCategories([]) }
  }

  const fetchBrands = async () => {
    try {
      const response = await adminBrandsAPI.getAll()
      setBrands(response.data || response)
    } catch (error) { console.error(error) }
  }

  const calculateFinalPrice = () => {
    const priceNum = parseFloat(formData.price) || 0
    const discountNum = parseFloat(formData.discount) || 0
    return discountNum > 0 ? (priceNum - (priceNum * discountNum) / 100).toFixed(2) : priceNum.toFixed(2)
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleToggle = (type: 'colors' | 'sizes', value: string) => {
    if (type === 'colors') {
      setSelectedColors((prev) =>
        prev.includes(value) ? prev.filter((c) => c !== value) : [...prev, value]
      )
    } else {
      setSelectedSizes((prev) =>
        prev.includes(value) ? prev.filter((s) => s !== value) : [...prev, value]
      )
    }
  }

  const handleAddCustomColor = () => {
    if (customColorHex && !selectedColors.includes(customColorHex)) {
      setSelectedColors([...selectedColors, customColorHex])
    }
  }

  const handleCoverImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setCoverImage(file)
      setCoverImagePreview(URL.createObjectURL(file))
    }
  }

  const handleAdditionalImagesChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])
    setAdditionalImages([...additionalImages, ...files])
    const previews = files.map((file) => URL.createObjectURL(file))
    setAdditionalImagePreviews([...additionalImagePreviews, ...previews])
  }

  const removeExistingImage = (index: number) => setExistingImages(existingImages.filter((_, i) => i !== index))
  const removeAdditionalImage = (index: number) => {
    setAdditionalImages(additionalImages.filter((_, i) => i !== index))
    setAdditionalImagePreviews(additionalImagePreviews.filter((_, i) => i !== index))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    // التحقق من الحقول الإجبارية
    if (!formData.category) {
      toast({ title: 'تنبيه', description: 'القسم الأساسي مطلوب', variant: 'destructive' })
      return
    }

    setLoading(true)

    try {
      const formDataToSend = new FormData()
      formDataToSend.append('title', formData.title)
      formDataToSend.append('description', formData.description)
      formDataToSend.append('titleAr', formData.title)
      formDataToSend.append('descriptionAr', formData.description)
      
      formDataToSend.append('price', formData.price)
      
      const discountNum = parseFloat(formData.discount) || 0
      if (discountNum > 0) {
        const finalPrice = parseFloat(formData.price) - (parseFloat(formData.price) * discountNum) / 100
        formDataToSend.append('priceAfterDiscount', finalPrice.toString())
      }

      formDataToSend.append('quantity', formData.quantity)
      formDataToSend.append('category', formData.category) // إجباري

      // إرسال الحقول الاختيارية فقط إذا تم اختيارها
      if (formData.subcategory && formData.subcategory !== "none") formDataToSend.append('subCategory', formData.subcategory) // ✨ تم التعديل
      if (formData.brand && formData.brand !== "none") formDataToSend.append('brand', formData.brand)

      if (coverImage) formDataToSend.append('imageCover', coverImage)
      
      additionalImages.forEach((image) => formDataToSend.append('images', image))
      selectedColors.forEach((color) => formDataToSend.append('colors[]', color))
      selectedSizes.forEach((size) => formDataToSend.append('sizes[]', size))

      if (isEditMode) {
        await adminProductsAPI.update(params!.id, formDataToSend)
        toast({ title: '✅ تم التحديث بنجاح' })
      } else {
        await adminProductsAPI.create(formDataToSend)
        toast({ title: '✅ تم الإضافة بنجاح' })
      }
      
      router.push('/admin/products')
    } catch (error) {
      toast({ title: 'خطأ', description: 'فشل في حفظ المنتج', variant: 'destructive' })
    } finally {
      setLoading(false)
    }
  }

  if (fetchLoading) return <div className='flex h-[60vh] items-center justify-center'><Loader2 className='animate-spin text-primary w-12 h-12' /></div>

  return (
    <div className='space-y-8 max-w-[1400px] mx-auto pb-20 px-4' dir="rtl">
      
      {/* Header Section */}
      <div className='flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-card p-6 rounded-[2rem] border border-border/50 shadow-sm'>
        <div className='flex items-center gap-4'>
          <Link href='/admin/products'>
            <Button variant='secondary' size='icon' className='rounded-full h-12 w-12 hover:bg-primary transition-all'>
              <ArrowRight className='h-6 w-6' />
            </Button>
          </Link>
          <div>
            <h1 className='text-3xl font-black text-foreground'>{isEditMode ? 'تعديل المنتج' : 'إضافة منتج جديد'}</h1>
            <p className='text-muted-foreground text-sm font-medium'>
              {isEditMode ? `تعديل تفاصيل: ${formData.title}` : 'أضف منتجاً جديداً لمتجرك'}
            </p>
          </div>
        </div>
        <Button onClick={handleSubmit} className="gold-gradient h-14 px-10 rounded-2xl font-black text-lg shadow-xl" disabled={loading}>
          {loading ? <Loader2 className="animate-spin ml-2" /> : <Save className="ml-2 h-5 w-5" />} 
          {isEditMode ? 'حفظ التعديلات' : 'نشر المنتج'}
        </Button>
      </div>

      <div className='grid grid-cols-1 lg:grid-cols-12 gap-8'>
        
        {/* Main Content */}
        <div className='lg:col-span-8 space-y-8'>
          <Card className="border-none shadow-xl rounded-[2rem] overflow-hidden bg-card">
            <CardHeader className="bg-muted/20 border-b">
               <CardTitle className="text-lg flex items-center gap-2 text-foreground"><Info className="text-primary" /> المعلومات الأساسية</CardTitle>
            </CardHeader>
            <CardContent className="p-6 space-y-6">
                <div className='space-y-2'>
                  <Label className="font-bold text-foreground">اسم المنتج (إجباري)</Label>
                  <Input name='title' value={formData.title} onChange={handleInputChange} placeholder="أدخل اسم المنتج باللغة العربية" className='h-12 rounded-xl border-border bg-background' />
                </div>
                <div className='space-y-2'>
                  <Label className="font-bold text-foreground">وصف المنتج (إجباري)</Label>
                  <Textarea name='description' value={formData.description} onChange={handleInputChange} rows={6} placeholder="اكتب وصفاً جذاباً لمنتجك هنا..." className='rounded-xl border-border bg-background leading-relaxed' />
                </div>
            </CardContent>
          </Card>

          {/* الكروت والالوان زي ما هي و دي اختيارية من داخل مكون VariantsCard نفسه */}
          <VariantsCard 
            colors={selectedColors} 
            sizes={selectedSizes} 
            onToggle={handleToggle} 
            customColorHex={customColorHex} 
            setCustomColorHex={setCustomColorHex} 
            onAddCustomColor={handleAddCustomColor} 
          />

          <Card className="border-none shadow-xl rounded-[2rem] overflow-hidden bg-card">
            <CardHeader className="bg-muted/20 border-b">
               <CardTitle className="text-foreground">الصور والوسائط (صورة الغلاف إجبارية)</CardTitle>
            </CardHeader>
            <CardContent className='p-6 space-y-6'>
              <div className='space-y-3'>
                <Label className="font-bold text-foreground">صورة الغلاف (الرئيسية)</Label>
                <div className='relative h-64 rounded-2xl overflow-hidden border-2 border-dashed border-border bg-muted/10 group'>
                  {coverImagePreview || existingCoverImage ? (
                    <>
                      <Image src={coverImagePreview || getImageUrl(existingCoverImage)} alt='Cover' fill className='object-contain p-2' />
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                         <label className="cursor-pointer bg-white text-black px-6 py-2 rounded-full font-bold shadow-lg">
                            تغيير الصورة
                            <input type='file' className='hidden' accept='image/*' onChange={handleCoverImageChange} />
                         </label>
                      </div>
                    </>
                  ) : (
                    <label className="h-full w-full flex flex-col items-center justify-center cursor-pointer">
                        <Upload size={40} className="text-muted-foreground mb-2" />
                        <span className="text-muted-foreground font-medium">ارفع الصورة الأساسية</span>
                        <input type='file' className='hidden' accept='image/*' onChange={handleCoverImageChange} />
                    </label>
                  )}
                </div>
              </div>

              <div className='space-y-3'>
                <Label className="font-bold text-foreground">صور إضافية للمنتج (اختياري)</Label>
                <div className='grid grid-cols-2 sm:grid-cols-4 gap-4'>
                  {existingImages.map((img, i) => (
                    <div key={`existing-${i}`} className="relative aspect-square rounded-2xl overflow-hidden border group">
                      <Image src={getImageUrl(img)} alt="Gallery" fill className="object-cover" />
                      <Button variant="destructive" size="icon" className="absolute top-1 left-1 h-7 w-7 opacity-0 group-hover:opacity-100 transition-all" onClick={() => removeExistingImage(i)}>
                        <X className="w-4 h-4" />
                      </Button>
                    </div>
                  ))}
                  {additionalImagePreviews.map((img, i) => (
                    <div key={`new-${i}`} className="relative aspect-square rounded-2xl overflow-hidden border border-primary/30">
                      <Image src={img} alt="New" fill className="object-cover" />
                      <Button variant="destructive" size="icon" className="absolute top-1 left-1 h-7 w-7" onClick={() => removeAdditionalImage(i)}>
                        <X className="w-4 h-4" />
                      </Button>
                    </div>
                  ))}
                  {existingImages.length + additionalImages.length < 5 && (
                    <label className="aspect-square rounded-2xl border-2 border-dashed border-border flex flex-col items-center justify-center bg-muted/5 cursor-pointer hover:bg-muted/10 transition-all">
                      <Plus className="w-8 h-8 text-muted-foreground" />
                      <input type='file' className='hidden' accept='image/*' multiple onChange={handleAdditionalImagesChange} />
                    </label>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className='lg:col-span-4 space-y-8'>
          <PricingCard 
            price={formData.price} 
            discount={formData.discount} 
            quantity={formData.quantity} 
            finalPrice={calculateFinalPrice()} 
            onChange={handleInputChange} 
          />

          <Card className="border-none shadow-xl rounded-[2rem] bg-card">
            <CardHeader className="border-b">
               <CardTitle className="flex items-center gap-2 text-foreground text-base"><LayoutGrid className="text-primary w-5 h-5" /> التصنيف والماركة</CardTitle>
            </CardHeader>
            <CardContent className='p-6 space-y-6'>
              
              <div className='space-y-2'>
                <Label className="font-bold text-foreground">القسم الأساسي (إجباري)</Label>
                <Select value={formData.category} onValueChange={(val) => setFormData({ ...formData, category: val })}>
                  <SelectTrigger className="h-11 rounded-xl bg-background border-border"><SelectValue placeholder='اختر الفئة' /></SelectTrigger>
                  <SelectContent>{categories.map((c) => <SelectItem key={c._id} value={c._id}>{c.name}</SelectItem>)}</SelectContent>
                </Select>
              </div>

              {/* ✨ إضافة الفئة الفرعية وبتظهر لما تختار قسم أساسي */}
              {subCategories.length > 0 && (
                <div className='space-y-2 animate-in fade-in slide-in-from-top-4 duration-300'>
                  <Label className="font-bold text-foreground">القسم الفرعي (اختياري)</Label>
                  <Select value={formData.subcategory} onValueChange={(val) => setFormData({ ...formData, subcategory: val })}>
                    <SelectTrigger className="h-11 rounded-xl bg-background border-border"><SelectValue placeholder='بدون قسم فرعي' /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">بدون قسم فرعي</SelectItem>
                      {subCategories.map((sc) => <SelectItem key={sc._id} value={sc._id}>{sc.name}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
              )}

              <div className='space-y-2'>
                <Label className="font-bold text-foreground">الماركة (اختياري)</Label>
                <Select value={formData.brand} onValueChange={(val) => setFormData({ ...formData, brand: val })}>
                  <SelectTrigger className="h-11 rounded-xl bg-background border-border"><SelectValue placeholder='بدون ماركة' /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">بدون ماركة</SelectItem>
                    {brands.map((b) => <SelectItem key={b._id} value={b._id}>{b.name}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>

            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}