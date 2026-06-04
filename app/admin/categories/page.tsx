'use client'

import { useState, useEffect } from 'react'
import { Plus, Edit, Trash2, FolderTree, Loader2, Home, AlertTriangle, X, ZoomIn } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
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
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { adminCategoriesAPI } from '@/lib/admin-api'
import Image from 'next/image'
import { useToast } from '@/lib/use-toast'
import { cn } from '@/lib/utils'

export default function CategoriesManagement() {
  const { toast } = useToast()
  const [categories, setCategories] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [editingCategory, setEditingCategory] = useState<any>(null)
  const [categoryToDelete, setCategoryToDelete] = useState<string | null>(null)
  const [imagePreviewOpen, setImagePreviewOpen] = useState(false)
  const [previewImage, setPreviewImage] = useState<{ src: string; alt: string } | null>(null)

  useEffect(() => {
    fetchCategories()
  }, [])

  const fetchCategories = async () => {
    try {
      const response = await adminCategoriesAPI.getAll()
      setCategories(response.data || response)
    } catch (error) {
      console.error('Failed to fetch categories:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteConfirm = async () => {
    if (!categoryToDelete) return
    try {
      await adminCategoriesAPI.delete(categoryToDelete)
      toast({ title: '✅ تم الحذف', description: 'تم حذف الفئة بنجاح' })
      fetchCategories()
    } catch (error) {
      toast({ title: 'خطأ', description: 'فشل حذف الفئة', variant: 'destructive' })
    } finally {
      setCategoryToDelete(null)
    }
  }

  const openImagePreview = (src: string, alt: string) => {
    setPreviewImage({ src, alt })
    setImagePreviewOpen(true)
  }

  return (
    <div className='space-y-4 sm:space-y-6 p-3 sm:p-4 md:p-6' dir="rtl">
      {/* Header - Dark Mode Optimized */}
      <div className='flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-4 bg-card text-card-foreground p-3 sm:p-4 rounded-xl border shadow-sm'>
        <div className='w-full sm:w-auto'>
          <h1 className='text-xl sm:text-2xl font-bold'>إدارة الفئات</h1>
          <p className='text-xs sm:text-sm text-muted-foreground mt-0.5'>
            إجمالي الفئات: <span className='font-bold text-primary'>{categories.length}</span>
          </p>
        </div>
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button className='w-full sm:w-auto bg-primary hover:bg-primary/90 h-11 sm:h-10 text-sm sm:text-base font-bold shadow-md'>
              <Plus className='ml-2 h-4 w-4' /> إضافة فئة جديدة
            </Button>
          </DialogTrigger>
          <DialogContent className="w-[95vw] max-w-[425px] max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="text-right text-lg sm:text-xl">إضافة فئة جديدة</DialogTitle>
            </DialogHeader>
            <CategoryForm onSuccess={() => { setIsAddDialogOpen(false); fetchCategories(); }} />
          </DialogContent>
        </Dialog>
      </div>

      {/* Categories Grid - Responsive */}
      <div className='grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 sm:gap-4 md:gap-6'>
        {loading ? (
          <div className='col-span-full flex flex-col items-center justify-center py-16 sm:py-20 gap-3 sm:gap-4'>
            <Loader2 className='h-8 w-8 sm:h-10 sm:w-10 animate-spin text-primary' />
            <p className='text-xs sm:text-sm text-muted-foreground animate-pulse'>جاري تحميل البيانات...</p>
          </div>
        ) : (
          categories.map((category) => (
            <Card 
              key={category._id} 
              className='group overflow-hidden hover:shadow-xl transition-all duration-300 flex flex-col h-full bg-card active:scale-95 border-border'
            >
              {/* Image Section - Dark Mode Optimized */}
              <div className='relative w-full aspect-square overflow-hidden bg-secondary/20'>
                {category.showOnHomePage && (
                  <div className="absolute top-2 right-2 z-20">
                    <Badge className="bg-orange-500 hover:bg-orange-600 text-white border-none gap-1 shadow-lg text-[9px] sm:text-xs px-1.5 sm:px-2 py-0.5">
                      <Home className="w-2.5 h-2.5 sm:w-3 sm:h-3" /> 
                      <span className='hidden xs:inline'>مميزة</span>
                    </Badge>
                  </div>
                )}
                
                {category.image ? (
                  <>
                    <button
                      onClick={() => openImagePreview(category.image, category.name)}
                      className='absolute inset-0 z-10 cursor-pointer group/zoom active:scale-95 transition-transform'
                    >
                      <div className='absolute inset-0 bg-black/0 group-hover/zoom:bg-black/40 transition-all duration-300 flex items-center justify-center'>
                        <div className='opacity-0 group-hover/zoom:opacity-100 transition-opacity duration-300 bg-background/90 backdrop-blur-sm rounded-full p-2 sm:p-3 shadow-xl'>
                          <ZoomIn className='w-4 h-4 sm:w-6 sm:h-6 text-foreground' />
                        </div>
                      </div>
                    </button>

                    <div className='relative w-full h-full p-3 sm:p-4 md:p-6 flex items-center justify-center'>
                      <div className='relative w-full h-full'>
                        <Image 
                          src={category.image} 
                          alt={category.name} 
                          fill 
                          sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 20vw"
                          className='object-contain transition-transform duration-500 group-hover:scale-110' 
                          priority={false}
                        />
                      </div>
                    </div>
                  </>
                ) : (
                  <div className='flex items-center justify-center h-full bg-secondary/30'>
                    <FolderTree className='h-10 w-10 sm:h-12 sm:w-12 md:h-16 md:w-16 text-muted-foreground/50' />
                  </div>
                )}
              </div>

              {/* Content Section */}
              <div className='p-2.5 sm:p-3 md:p-4 flex-1 flex flex-col justify-between border-t border-border bg-card'>
                <div className='mb-2 sm:mb-3 flex flex-col gap-1.5'>
                  <h3 className='font-bold text-sm sm:text-base md:text-lg text-foreground truncate'>
                    {category.name}
                  </h3>
                  {/* ✨ هنا تم تحسين شكل (عدد المنتجات) ليكون واضحاً وبارزاً */}
                  <Badge variant='outline' className='w-fit font-semibold text-[10px] sm:text-xs px-2 bg-primary/10 text-primary border-primary/20'>
                    {category.productsCount || 0} منتج
                  </Badge>
                </div>
                
                <div className='flex gap-1.5 sm:gap-2 mt-auto'>
                  <Button 
                    variant='outline' 
                    size='sm' 
                    className='flex-1 gap-1 sm:gap-2 hover:bg-blue-50 hover:text-blue-600 dark:hover:bg-blue-900/30 dark:hover:text-blue-400 border-border transition-all h-8 sm:h-9 text-xs sm:text-sm px-2 sm:px-3 active:scale-95' 
                    onClick={() => { setEditingCategory(category); setIsEditDialogOpen(true); }}
                  >
                    <Edit className='h-3 w-3 sm:h-3.5 sm:w-3.5' /> 
                    <span className='hidden xs:inline'>تعديل</span>
                  </Button>
                  <Button 
                    variant='outline' 
                    size='sm' 
                    onClick={() => setCategoryToDelete(category._id)} 
                    className='text-destructive hover:bg-red-50 dark:hover:bg-red-900/30 border-border transition-all h-8 sm:h-9 px-2 sm:px-3 active:scale-95'
                  >
                    <Trash2 className='h-3 w-3 sm:h-3.5 sm:w-3.5' />
                  </Button>
                </div>
              </div>
            </Card>
          ))
        )}
      </div>

      {/* Image Preview Lightbox */}
      <Dialog open={imagePreviewOpen} onOpenChange={setImagePreviewOpen}>
        <DialogContent className="w-screen h-screen max-w-none sm:w-[95vw] sm:h-auto sm:max-w-4xl p-0 bg-transparent border-none shadow-none">
          <div className="relative bg-background rounded-none sm:rounded-2xl overflow-hidden shadow-2xl h-full sm:h-auto border border-border">
            <button
              onClick={() => setImagePreviewOpen(false)}
              className="absolute top-3 left-3 sm:top-4 sm:left-4 z-50 bg-black/60 hover:bg-black/80 text-white rounded-full p-2.5 sm:p-2 transition-all active:scale-95"
            >
              <X className="w-5 h-5 sm:w-5 sm:h-5" />
            </button>
            
            {previewImage && (
              <div className="relative w-full h-full sm:h-[70vh] bg-background flex items-center justify-center">
                <div className='relative w-full h-full p-4 sm:p-8'>
                  <Image
                    src={previewImage.src}
                    alt={previewImage.alt}
                    fill
                    className="object-contain"
                    sizes="100vw"
                  />
                </div>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog open={!!categoryToDelete} onOpenChange={(open) => !open && setCategoryToDelete(null)}>
        <AlertDialogContent className="w-[90vw] max-w-md">
          <AlertDialogHeader className="text-right">
            <div className="flex items-center justify-end gap-2 text-destructive mb-2">
              <AlertDialogTitle className='text-base sm:text-lg'>هل أنت متأكد من الحذف؟</AlertDialogTitle>
              <AlertTriangle className="h-4 w-4 sm:h-5 sm:w-5" />
            </div>
            <AlertDialogDescription className="text-right font-medium text-sm sm:text-base">
              سيتم حذف هذه الفئة نهائياً. لا يمكن التراجع عن هذا الإجراء بعد تنفيذه.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="flex-row-reverse gap-2 sm:gap-3">
            <AlertDialogAction 
              onClick={handleDeleteConfirm} 
              className="bg-destructive hover:bg-destructive/90 h-10 sm:h-11 text-sm sm:text-base flex-1 sm:flex-none active:scale-95"
            >
              تأكيد الحذف
            </AlertDialogAction>
            <AlertDialogCancel className='h-10 sm:h-11 text-sm sm:text-base flex-1 sm:flex-none active:scale-95'>
              إلغاء
            </AlertDialogCancel>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="w-[95vw] max-w-[425px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-right text-lg sm:text-xl">تعديل بيانات الفئة</DialogTitle>
          </DialogHeader>
          {editingCategory && (
            <CategoryForm 
              category={editingCategory} 
              onSuccess={() => { 
                setIsEditDialogOpen(false); 
                setEditingCategory(null); 
                fetchCategories(); 
              }} 
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}

function CategoryForm({ category, onSuccess }: { category?: any, onSuccess: () => void }) {
  const { toast } = useToast()
  const [loading, setLoading] = useState(false)
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState(category?.image || '')
  const [name, setName] = useState(category?.name || '')
  const [showOnHomePage, setShowOnHomePage] = useState(category?.showOnHomePage || false)

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setImageFile(file)
      setImagePreview(URL.createObjectURL(file))
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const formDataToSend = new FormData()
      formDataToSend.append('name', name)
      formDataToSend.append('showOnHomePage', String(showOnHomePage))
      if (imageFile) formDataToSend.append('image', imageFile)

      if (category) {
        await adminCategoriesAPI.update(category._id, formDataToSend)
        toast({ title: '✅ تم التحديث', description: 'تم حفظ التعديلات بنجاح' })
      } else {
        await adminCategoriesAPI.create(formDataToSend)
        toast({ title: '✅ تم الإضافة', description: 'تم إضافة الفئة الجديدة للمتجر' })
      }
      onSuccess()
    } catch (error: any) {
      toast({ title: 'خطأ', description: 'فشل في حفظ البيانات', variant: 'destructive' })
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className='space-y-3 sm:space-y-4 pt-1'>
      <div className='space-y-1.5'>
        <Label htmlFor='name' className="block text-right font-semibold text-sm">اسم الفئة</Label>
        <Input id='name' required value={name} onChange={(e) => setName(e.target.value)} placeholder='مثال: أزياء رجالية' className="text-right h-10 sm:h-11 text-sm bg-background" />
      </div>

      <div className="flex items-center justify-between p-2.5 sm:p-3 border rounded-lg bg-secondary/20 hover:border-primary/30 transition-all cursor-pointer" onClick={() => setShowOnHomePage(!showOnHomePage)}>
        <div className="flex flex-col gap-0.5 text-right flex-1">
          <Label className="font-bold cursor-pointer text-xs sm:text-sm">الظهور في الصفحة الرئيسية</Label>
          <span className="text-[9px] sm:text-[10px] text-muted-foreground leading-tight">عرض الفئة في الواجهة الرئيسية</span>
        </div>
        <div dir="ltr" onClick={(e) => e.stopPropagation()} className='mr-2'>
          <Switch checked={showOnHomePage} onCheckedChange={setShowOnHomePage} className="data-[state=checked]:bg-primary scale-75 sm:scale-90" />
        </div>
      </div>

      <div className='space-y-1.5'>
        <Label className="block text-right font-semibold text-sm">صورة الفئة</Label>
        <div className='border-2 border-dashed border-border rounded-lg p-3 sm:p-4 text-center bg-secondary/10 hover:border-primary/30 transition-all'>
          {imagePreview ? (
            <div className='relative w-full aspect-square max-h-40 sm:max-h-48 mb-2 sm:mb-3 rounded-lg overflow-hidden bg-background border border-border'>
              <div className='relative w-full h-full p-3 sm:p-4 flex items-center justify-center'>
                <div className='relative w-full h-full'>
                  <Image src={imagePreview} alt='Preview' fill className='object-contain' />
                </div>
              </div>
            </div>
          ) : (
            <div className='py-4 sm:py-5'>
              <FolderTree className="h-10 w-10 sm:h-12 sm:w-12 mx-auto text-muted-foreground/50 mb-1.5 sm:mb-2" />
              <p className='text-[10px] sm:text-xs text-muted-foreground font-medium'>اختر صورة</p>
              <p className='text-[9px] sm:text-[10px] text-muted-foreground mt-0.5'>PNG, JPG</p>
            </div>
          )}
          <Input id='image' type='file' accept='image/*' onChange={handleImageChange} className="cursor-pointer file:ml-2 file:bg-primary file:text-primary-foreground hover:file:bg-primary/90 text-xs h-9 sm:h-10 file:text-xs bg-background" />
        </div>
      </div>

      <Button type='submit' className='w-full h-10 sm:h-11 text-sm font-bold shadow-md active:scale-95 transition-transform mt-2' disabled={loading}>
        {loading ? (
          <><Loader2 className='ml-2 h-4 w-4 animate-spin' /> جاري الحفظ...</>
        ) : (category ? 'تحديث الفئة' : 'إضافة الفئة')}
      </Button>
    </form>
  )
}