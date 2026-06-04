'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { ArrowRight, Plus, Edit, Trash2, Loader2, Layers, AlertCircle, X, ZoomIn, Filter } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import Image from 'next/image'
import { useToast } from '@/lib/use-toast'
import { adminSubCategoriesAPI, adminCategoriesAPI } from '@/lib/admin-api'

export default function SubCategoriesManagement() {
  const { toast } = useToast()
  const [subCategories, setSubCategories] = useState<any[]>([])
  const [categories, setCategories] = useState<any[]>([]) // لجلب الفئات الرئيسية
  const [loading, setLoading] = useState(true)
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [editingSubCategory, setEditingSubCategory] = useState<any>(null)
  const [subCategoryToDelete, setSubCategoryToDelete] = useState<string | null>(null)
  
  const [imagePreviewOpen, setImagePreviewOpen] = useState(false)
  const [previewImage, setPreviewImage] = useState<{ src: string; alt: string } | null>(null)
  const [filterCategory, setFilterCategory] = useState('all')

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      setLoading(true)
      const [subRes, catRes] = await Promise.all([
        adminSubCategoriesAPI.getAll(),
        adminCategoriesAPI.getAll()
      ])
      setSubCategories(subRes.data || subRes)
      setCategories(catRes.data || catRes)
    } catch (error) {
      console.error('Failed to fetch data:', error)
      toast({ title: 'خطأ', description: 'فشل جلب البيانات', variant: 'destructive' })
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteConfirm = async () => {
    if (!subCategoryToDelete) return
    try {
      await adminSubCategoriesAPI.delete(subCategoryToDelete)
      toast({ title: '✅ تم الحذف', description: 'تم حذف الفئة الفرعية بنجاح' })
      fetchData()
    } catch (error) {
      toast({ title: 'خطأ', description: 'فشل حذف الفئة الفرعية', variant: 'destructive' })
    } finally {
      setSubCategoryToDelete(null)
    }
  }

  const openImagePreview = (src: string, alt: string) => {
    setPreviewImage({ src, alt })
    setImagePreviewOpen(true)
  }

  const filteredSubCategories = subCategories.filter(
    (sub) => filterCategory === 'all' || sub.category?._id === filterCategory
  )

  return (
    <div className='space-y-4 sm:space-y-6 p-3 sm:p-4 md:p-6' dir="rtl">
      {/* Header */}
      <div className='flex flex-col md:flex-row items-start md:items-center justify-between gap-4 bg-card text-card-foreground p-4 rounded-xl border shadow-sm'>
        <div className='flex items-center gap-3'>
          <Link href='/admin/categories'>
            <Button variant='outline' size='icon' className='h-10 w-10 rounded-full hover:bg-secondary'>
              <ArrowRight className='h-5 w-5 text-muted-foreground' />
            </Button>
          </Link>
          <div>
            <h1 className='text-xl sm:text-2xl font-bold'>الفئات الفرعية</h1>
            <p className='text-xs sm:text-sm text-muted-foreground mt-0.5'>
              العدد الإجمالي: <span className='font-bold text-primary'>{filteredSubCategories.length}</span>
            </p>
          </div>
        </div>
        
        <div className='flex flex-col sm:flex-row w-full md:w-auto gap-3'>
          {/* Filter Dropdown */}
          <div className='flex items-center gap-2 bg-secondary/30 px-3 py-1.5 rounded-lg border border-border w-full sm:w-auto'>
            <Filter className='h-4 w-4 text-muted-foreground' />
            <Select value={filterCategory} onValueChange={setFilterCategory}>
              <SelectTrigger className='w-full sm:w-[180px] h-9 border-0 bg-transparent shadow-none focus:ring-0'>
                <SelectValue placeholder='تصفية حسب الفئة' />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value='all'>جميع الفئات</SelectItem>
                {categories.map((cat) => (
                  <SelectItem key={cat._id} value={cat._id}>{cat.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button className='w-full sm:w-auto bg-primary hover:bg-primary/90 h-10 text-sm font-bold shadow-md'>
                <Plus className='ml-2 h-4 w-4' /> إضافة فئة فرعية
              </Button>
            </DialogTrigger>
            <DialogContent className="w-[95vw] max-w-[425px] max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle className="text-right text-lg sm:text-xl">إضافة فئة فرعية</DialogTitle>
              </DialogHeader>
              <SubCategoryForm categories={categories} onSuccess={() => { setIsAddDialogOpen(false); fetchData(); }} />
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Grid */}
      <div className='grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 sm:gap-4 md:gap-6'>
        {loading ? (
          <div className='col-span-full flex flex-col items-center justify-center py-16 sm:py-20 gap-3 sm:gap-4'>
            <Loader2 className='h-8 w-8 sm:h-10 sm:w-10 animate-spin text-primary' />
            <p className='text-xs sm:text-sm text-muted-foreground animate-pulse'>جاري تحميل البيانات...</p>
          </div>
        ) : filteredSubCategories.length === 0 ? (
           <div className='col-span-full flex flex-col items-center justify-center py-16 bg-card border border-dashed rounded-xl'>
              <Layers className='h-12 w-12 text-muted-foreground/30 mb-3' />
              <p className='text-muted-foreground'>لا توجد فئات فرعية هنا</p>
           </div>
        ) : (
          filteredSubCategories.map((subCategory) => (
            <Card 
              key={subCategory._id} 
              className='group overflow-hidden hover:shadow-xl transition-all duration-300 flex flex-col h-full bg-card active:scale-95 border-border'
            >
              <div className='relative w-full aspect-square overflow-hidden bg-secondary/20'>
                {subCategory.image ? (
                  <>
                    <button
                      onClick={() => openImagePreview(subCategory.image, subCategory.name)}
                      className='absolute inset-0 z-10 cursor-pointer group/zoom active:scale-95 transition-transform'
                    >
                      <div className='absolute inset-0 bg-black/0 group-hover/zoom:bg-black/40 transition-all duration-300 flex items-center justify-center'>
                        <div className='opacity-0 group-hover/zoom:opacity-100 transition-opacity duration-300 bg-background/90 backdrop-blur-sm rounded-full p-2 sm:p-3 shadow-xl'>
                          <ZoomIn className='w-4 h-4 sm:w-6 sm:h-6 text-foreground' />
                        </div>
                      </div>
                    </button>
                    <div className='relative w-full h-full p-3 sm:p-4 flex items-center justify-center'>
                      <div className='relative w-full h-full'>
                        <Image src={subCategory.image} alt={subCategory.name} fill className='object-contain transition-transform duration-500 group-hover:scale-110' />
                      </div>
                    </div>
                  </>
                ) : (
                  <div className='flex items-center justify-center h-full bg-secondary/30'>
                    <Layers className='h-10 w-10 sm:h-12 sm:w-12 text-muted-foreground/50' />
                  </div>
                )}
              </div>

              <div className='p-2.5 sm:p-3 md:p-4 flex-1 flex flex-col justify-between border-t border-border bg-card'>
                <div className='mb-2 flex flex-col gap-1.5'>
                  <h3 className='font-bold text-sm sm:text-base text-foreground truncate'>
                    {subCategory.name}
                  </h3>
                  <div className='flex flex-wrap gap-1'>
                    <Badge variant='secondary' className='text-[10px] sm:text-xs truncate max-w-full'>
                      {subCategory.category?.name || 'غير محدد'}
                    </Badge>
                    <Badge variant='outline' className='font-semibold text-[10px] sm:text-xs bg-primary/10 text-primary border-primary/20'>
                      {subCategory.productsCount || 0} منتج
                    </Badge>
                  </div>
                </div>
                
                <div className='flex gap-1.5 sm:gap-2 mt-auto'>
                  <Button variant='outline' size='sm' className='flex-1 gap-1 sm:gap-2 hover:bg-blue-50 hover:text-blue-600 dark:hover:bg-blue-900/30 dark:hover:text-blue-400 h-8 sm:h-9 text-xs sm:text-sm px-2' onClick={() => { setEditingSubCategory(subCategory); setIsEditDialogOpen(true); }}>
                    <Edit className='h-3 w-3 sm:h-3.5 sm:w-3.5' /> <span className='hidden xs:inline'>تعديل</span>
                  </Button>
                  <Button variant='outline' size='sm' onClick={() => setSubCategoryToDelete(subCategory._id)} className='text-destructive hover:bg-red-50 dark:hover:bg-red-900/30 h-8 sm:h-9 px-2'>
                    <Trash2 className='h-3 w-3 sm:h-3.5 sm:w-3.5' />
                  </Button>
                </div>
              </div>
            </Card>
          ))
        )}
      </div>

      {/* Image Preview & Dialogs */}
      <Dialog open={imagePreviewOpen} onOpenChange={setImagePreviewOpen}>
        <DialogContent className="w-screen h-screen max-w-none sm:w-[95vw] sm:h-auto sm:max-w-4xl p-0 bg-transparent border-none shadow-none">
          <div className="relative bg-background rounded-none sm:rounded-2xl overflow-hidden shadow-2xl h-full sm:h-auto border border-border">
            <button onClick={() => setImagePreviewOpen(false)} className="absolute top-3 left-3 sm:top-4 sm:left-4 z-50 bg-black/60 hover:bg-black/80 text-white rounded-full p-2.5 sm:p-2 transition-all active:scale-95">
              <X className="w-5 h-5" />
            </button>
            {previewImage && (
              <div className="relative w-full h-full sm:h-[70vh] bg-background flex items-center justify-center p-4 sm:p-8">
                <Image src={previewImage.src} alt={previewImage.alt} fill className="object-contain" sizes="100vw" />
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>

      <AlertDialog open={!!subCategoryToDelete} onOpenChange={(open) => !open && setSubCategoryToDelete(null)}>
        <AlertDialogContent className="w-[90vw] max-w-md">
          <AlertDialogHeader className="text-right">
            <div className="flex items-center justify-end gap-2 text-destructive mb-2">
              <AlertDialogTitle>هل أنت متأكد من الحذف؟</AlertDialogTitle>
              <AlertCircle className="h-5 w-5" />
            </div>
            <AlertDialogDescription className="text-right">سيتم حذف هذه الفئة الفرعية نهائياً.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="flex-row-reverse gap-2 sm:gap-3">
            <AlertDialogAction onClick={handleDeleteConfirm} className="bg-destructive hover:bg-destructive/90 flex-1 sm:flex-none">تأكيد الحذف</AlertDialogAction>
            <AlertDialogCancel className='flex-1 sm:flex-none'>إلغاء</AlertDialogCancel>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="w-[95vw] max-w-[425px] max-h-[90vh] overflow-y-auto">
          <DialogHeader><DialogTitle className="text-right">تعديل الفئة الفرعية</DialogTitle></DialogHeader>
          {editingSubCategory && <SubCategoryForm subCategory={editingSubCategory} categories={categories} onSuccess={() => { setIsEditDialogOpen(false); setEditingSubCategory(null); fetchData(); }} />}
        </DialogContent>
      </Dialog>
    </div>
  )
}

function SubCategoryForm({ subCategory, categories, onSuccess }: { subCategory?: any, categories: any[], onSuccess: () => void }) {
  const { toast } = useToast()
  const [loading, setLoading] = useState(false)
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState(subCategory?.image || '')
  
  const [formData, setFormData] = useState({
    name: subCategory?.name || '',
    categoryId: subCategory?.category?._id || subCategory?.category || ''
  })

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) { setImageFile(file); setImagePreview(URL.createObjectURL(file)); }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.categoryId) {
      toast({ title: 'تنبيه', description: 'يرجى اختيار الفئة الرئيسية', variant: 'destructive' })
      return
    }
    setLoading(true)

    try {
      const dataToSend = new FormData()
      dataToSend.append('name', formData.name)
      dataToSend.append('categoryId', formData.categoryId)
      if (imageFile) dataToSend.append('image', imageFile)

      if (subCategory) {
        await adminSubCategoriesAPI.update(subCategory._id, dataToSend)
        toast({ title: '✅ تم التحديث', description: 'تم التحديث بنجاح' })
      } else {
        await adminSubCategoriesAPI.create(dataToSend)
        toast({ title: '✅ تم الإضافة', description: 'تم الإضافة بنجاح' })
      }
      onSuccess()
    } catch (error: any) {
      toast({ title: 'خطأ', description: 'فشل الحفظ', variant: 'destructive' })
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className='space-y-4 pt-1'>
      <div className='space-y-1.5'>
        <Label className="block text-right font-semibold text-sm">الفئة الرئيسية <span className='text-destructive'>*</span></Label>
        <Select value={formData.categoryId} onValueChange={(val) => setFormData({ ...formData, categoryId: val })}>
          <SelectTrigger dir="rtl" className="bg-background"><SelectValue placeholder="اختر الفئة الرئيسية" /></SelectTrigger>
          <SelectContent dir="rtl">
            {categories.map((cat) => (
              <SelectItem key={cat._id} value={cat._id}>{cat.name}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className='space-y-1.5'>
        <Label className="block text-right font-semibold text-sm">اسم الفئة الفرعية <span className='text-destructive'>*</span></Label>
        <Input required value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} className="text-right bg-background" />
      </div>

      <div className='space-y-1.5'>
        <Label className="block text-right font-semibold text-sm">الصورة</Label>
        <div className='border-2 border-dashed border-border rounded-lg p-3 text-center bg-secondary/10 hover:border-primary/30 transition-all'>
          {imagePreview ? (
            <div className='relative w-full aspect-square max-h-40 mb-3 rounded-lg overflow-hidden bg-background border'><Image src={imagePreview} alt='Preview' fill className='object-contain' /></div>
          ) : (
            <div className='py-4'><Layers className="h-10 w-10 mx-auto text-muted-foreground/50 mb-2" /><p className='text-xs text-muted-foreground'>اختر صورة</p></div>
          )}
          <Input type='file' accept='image/*' onChange={handleImageChange} className="cursor-pointer file:ml-2 file:bg-primary file:text-primary-foreground hover:file:bg-primary/90 text-xs h-9 bg-background" />
        </div>
      </div>

      <Button type='submit' className='w-full font-bold shadow-md' disabled={loading}>
        {loading ? <><Loader2 className='ml-2 h-4 w-4 animate-spin' /> جاري الحفظ...</> : (subCategory ? 'تحديث' : 'إضافة')}
      </Button>
    </form>
  )
}