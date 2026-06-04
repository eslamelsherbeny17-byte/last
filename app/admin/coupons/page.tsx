// app/admin/coupons/page.tsx
'use client'

import { useState, useEffect } from 'react'
import { 
  Ticket, 
  Plus, 
  Trash2, 
  Copy, 
  Calendar, 
  Percent, 
  Search, 
  Edit,
  Loader2,
  AlertCircle
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
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
import { useToast } from '@/lib/use-toast'
import { adminCouponsAPI } from '@/lib/admin-api'
import { formatDate } from '@/lib/utils'

export default function CouponsPage() {
  const { toast } = useToast()
  const [coupons, setCoupons] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [editingCoupon, setEditingCoupon] = useState<any>(null)
  const [couponToDelete, setCouponToDelete] = useState<string | null>(null)

  useEffect(() => {
    fetchCoupons()
  }, [])

  const fetchCoupons = async () => {
    try {
      setLoading(true)
      const response = await adminCouponsAPI.getAll()
      setCoupons(response.data || [])
    } catch (error) {
      console.error('Failed to fetch coupons:', error)
      toast({
        title: '❌ خطأ',
        description: 'فشل تحميل الكوبونات',
        variant: 'destructive',
      })
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteConfirm = async () => {
    if (!couponToDelete) return
    try {
      await adminCouponsAPI.delete(couponToDelete)
      toast({ title: '✅ تم الحذف', description: 'تم حذف الكوبون بنجاح' })
      fetchCoupons()
    } catch (error) {
      toast({
        title: '❌ خطأ',
        description: 'فشل حذف الكوبون',
        variant: 'destructive',
      })
    } finally {
      setCouponToDelete(null)
    }
  }

  const copyToClipboard = (code: string) => {
    navigator.clipboard.writeText(code)
    toast({ 
      title: '✅ تم النسخ!', 
      description: `كود الكوبون ${code} منسوخ الآن.` 
    })
  }

  const filteredCoupons = coupons.filter(coupon =>
    coupon.name?.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const isExpired = (expireDate: string) => {
    return new Date(expireDate) < new Date()
  }

  return (
    <div className="space-y-4 sm:space-y-6 p-3 sm:p-4 md:p-6" dir="rtl">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 sm:gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl md:text-3xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
            كوبونات الخصم
          </h1>
          <p className="text-xs sm:text-sm text-muted-foreground mt-1">
            إجمالي الكوبونات: <span className="font-bold text-primary">{coupons.length}</span>
          </p>
        </div>
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button className="w-full sm:w-auto h-11 sm:h-12 text-sm sm:text-base font-bold shadow-lg bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700">
              <Plus className="ml-2 h-5 w-5" /> إضافة كوبون
            </Button>
          </DialogTrigger>
          <DialogContent className="w-[95vw] max-w-md">
            <DialogHeader>
              <DialogTitle className="text-right text-lg">إضافة كوبون جديد</DialogTitle>
            </DialogHeader>
            <CouponForm 
              onSuccess={() => { 
                setIsAddDialogOpen(false); 
                fetchCoupons(); 
              }} 
            />
          </DialogContent>
        </Dialog>
      </div>

      {/* Search Bar */}
      <div className="relative max-w-md">
        <Search className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground h-4 w-4" />
        <Input 
          placeholder="بحث عن كوبون معين..." 
          className="h-10 sm:h-11 pr-10 border-2"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      {/* Loading State */}
      {loading ? (
        <div className='flex flex-col items-center justify-center py-16 gap-3'>
          <Loader2 className='h-10 w-10 animate-spin text-primary' />
          <p className='text-sm text-muted-foreground'>جاري التحميل...</p>
        </div>
      ) : filteredCoupons.length === 0 ? (
        <Card className="border-0 shadow-sm">
          <CardContent className="flex flex-col items-center justify-center py-16 gap-3">
            <Ticket className="h-16 w-16 text-muted-foreground/30" />
            <p className="text-muted-foreground font-medium">لا توجد كوبونات</p>
          </CardContent>
        </Card>
      ) : (
        /* Coupons Grid */
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
          {filteredCoupons.map((coupon) => {
            const expired = isExpired(coupon.expire)
            return (
              <Card 
                key={coupon._id} 
                className={`group overflow-hidden border-0 shadow-lg rounded-2xl transition-all duration-500 ${
                  expired ? 'opacity-60 grayscale' : 'hover:shadow-2xl'
                }`}
              >
                <CardContent className="p-0">
                  <div className="flex flex-col sm:flex-row">
                    {/* الجزء الأيمن (قيمة الخصم) */}
                    <div className={`p-6 sm:p-8 flex flex-col items-center justify-center text-white sm:w-40 gap-1 ${
                      expired 
                        ? 'bg-gray-500' 
                        : 'bg-gradient-to-br from-purple-600 to-pink-600'
                    }`}>
                      <span className="text-3xl sm:text-4xl font-black">{coupon.discount}%</span>
                      <span className="text-xs font-bold uppercase tracking-tighter">خصم</span>
                      <div className="mt-3 sm:mt-4 flex sm:flex-col gap-1 opacity-60">
                        {[...Array(5)].map((_, i) => (
                          <div key={i} className="w-1.5 h-1.5 rounded-full bg-white" />
                        ))}
                      </div>
                    </div>

                    {/* الجزء الأيسر (بيانات الكوبون) */}
                    <div className="flex-1 p-4 sm:p-6 space-y-3 sm:space-y-4">
                      <div className="flex justify-between items-start gap-2">
                        <div className="space-y-1 flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <h3 className="text-lg sm:text-2xl font-black tracking-widest text-foreground uppercase truncate">
                              {coupon.name}
                            </h3>
                            <Button 
                              variant="ghost" 
                              size="icon" 
                              className="h-7 w-7 sm:h-8 sm:w-8 rounded-full hover:bg-primary/10 text-primary flex-shrink-0"
                              onClick={() => copyToClipboard(coupon.name)}
                            >
                              <Copy className="h-3 w-3 sm:h-4 sm:w-4" />
                            </Button>
                          </div>
                        </div>
                        <Badge 
                          className={`${
                            expired 
                              ? 'bg-red-500/10 text-red-600 border-red-200 dark:bg-red-900/20 dark:text-red-400' 
                              : 'bg-emerald-500/10 text-emerald-600 border-emerald-200 dark:bg-emerald-900/20 dark:text-emerald-400'
                          } border-none rounded-full px-3 text-xs sm:text-sm flex-shrink-0`}
                        >
                          {expired ? 'منتهي' : 'نشط'}
                        </Badge>
                      </div>

                      <div className="flex flex-wrap gap-2 sm:gap-4 pt-2">
                        <div className="flex items-center gap-2 text-xs font-bold text-muted-foreground bg-muted/50 px-3 py-2 rounded-xl">
                          <Calendar className="h-3 w-3 sm:h-4 sm:w-4 text-primary flex-shrink-0" />
                          <span className="truncate">ينتهي: {formatDate(coupon.expire)}</span>
                        </div>
                      </div>

                      <div className="flex gap-2 pt-2">
                        <Button 
                          variant="outline" 
                          className="flex-1 rounded-xl h-10 sm:h-11 text-xs sm:text-sm font-bold border-border/50"
                          onClick={() => {
                            setEditingCoupon(coupon)
                            setIsEditDialogOpen(true)
                          }}
                        >
                          <Edit className="ml-2 h-3 w-3 sm:h-4 sm:w-4" />
                          تعديل
                        </Button>
                        <Button 
                          variant="ghost" 
                          className="rounded-xl h-10 sm:h-11 w-11 sm:w-12 text-destructive hover:bg-destructive/10"
                          onClick={() => setCouponToDelete(coupon._id)}
                        >
                          <Trash2 className="h-4 w-4 sm:h-5 sm:w-5" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="w-[95vw] max-w-md">
          <DialogHeader>
            <DialogTitle className="text-right text-lg">تعديل الكوبون</DialogTitle>
          </DialogHeader>
          {editingCoupon && (
            <CouponForm 
              coupon={editingCoupon}
              onSuccess={() => { 
                setIsEditDialogOpen(false); 
                setEditingCoupon(null);
                fetchCoupons(); 
              }} 
            />
          )}
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog open={!!couponToDelete} onOpenChange={(open) => !open && setCouponToDelete(null)}>
        <AlertDialogContent className="w-[90vw] max-w-md">
          <AlertDialogHeader className="text-right">
            <div className="flex items-center justify-end gap-2 text-destructive mb-2">
              <AlertDialogTitle className='text-base sm:text-lg'>تأكيد الحذف</AlertDialogTitle>
              <AlertCircle className="h-5 w-5" />
            </div>
            <AlertDialogDescription className="text-right text-sm">
              هل أنت متأكد من حذف هذا الكوبون؟ لا يمكن التراجع عن هذا الإجراء.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="flex-row-reverse gap-2">
            <AlertDialogAction 
              onClick={handleDeleteConfirm}
              className="bg-destructive hover:bg-destructive/90 flex-1 sm:flex-none"
            >
              حذف
            </AlertDialogAction>
            <AlertDialogCancel className='flex-1 sm:flex-none'>إلغاء</AlertDialogCancel>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}

// ==================== Coupon Form Component ====================
function CouponForm({ 
  coupon, 
  onSuccess 
}: { 
  coupon?: any
  onSuccess: () => void 
}) {
  const { toast } = useToast()
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    name: coupon?.name || '',
    discount: coupon?.discount || '',
    expire: coupon?.expire ? new Date(coupon.expire).toISOString().split('T')[0] : '',
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.name || !formData.discount || !formData.expire) {
      toast({
        title: '⚠️ تنبيه',
        description: 'جميع الحقول مطلوبة',
        variant: 'destructive',
      })
      return
    }

    setLoading(true)
    try {
      const dataToSend = {
        name: formData.name.toUpperCase(),
        discount: parseFloat(formData.discount),
        expire: new Date(formData.expire).toISOString(),
      }

      if (coupon) {
        await adminCouponsAPI.update(coupon._id, dataToSend)
        toast({ title: '✅ تم التحديث', description: 'تم تحديث الكوبون بنجاح' })
      } else {
        await adminCouponsAPI.create(dataToSend)
        toast({ title: '✅ تم الإضافة', description: 'تم إضافة الكوبون بنجاح' })
      }
      onSuccess()
    } catch (error: any) {
      toast({
        title: '❌ خطأ',
        description: error.response?.data?.message || 'فشل في حفظ الكوبون',
        variant: 'destructive',
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4 pt-2">
      <div className="space-y-2">
        <Label htmlFor="name" className="text-right block font-bold text-sm">
          كود الكوبون <span className="text-destructive">*</span>
        </Label>
        <Input
          id="name"
          placeholder="EID2024"
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value.toUpperCase() })}
          className="h-11 uppercase"
          required
        />
        <p className="text-xs text-muted-foreground">استخدم حروف وأرقام فقط (سيتم تحويلها لحروف كبيرة)</p>
      </div>

      <div className="space-y-2">
        <Label htmlFor="discount" className="text-right block font-bold text-sm">
          نسبة الخصم (%) <span className="text-destructive">*</span>
        </Label>
        <div className="relative">
          <Input
            id="discount"
            type="number"
            min="1"
            max="100"
            placeholder="20"
            value={formData.discount}
            onChange={(e) => setFormData({ ...formData, discount: e.target.value })}
            className="h-11 pr-10"
            required
          />
          <Percent className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="expire" className="text-right block font-bold text-sm">
          تاريخ الانتهاء <span className="text-destructive">*</span>
        </Label>
        <div className="relative">
          <Input
            id="expire"
            type="date"
            value={formData.expire}
            onChange={(e) => setFormData({ ...formData, expire: e.target.value })}
            className="h-11"
            required
            min={new Date().toISOString().split('T')[0]}
          />
        </div>
      </div>

      <Button 
        type="submit" 
        className="w-full h-11 font-bold bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700" 
        disabled={loading}
      >
        {loading ? (
          <>
            <Loader2 className="ml-2 h-4 w-4 animate-spin" />
            جاري الحفظ...
          </>
        ) : (
          coupon ? 'تحديث الكوبون' : 'إضافة الكوبون'
        )}
      </Button>
    </form>
  )
}