// app/admin/orders/[id]/page.tsx
'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import {
  ArrowRight,
  Package,
  MapPin,
  CreditCard,
  User,
  Loader2,
  Save,
  CheckCircle2,
  Phone,
  Mail,
  Truck,
  Clock,
  XCircle,
  AlertCircle
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { Badge } from '@/components/ui/badge'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
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
import { formatPrice, getImageUrl } from '@/lib/utils'
import { adminOrdersAPI } from '@/lib/admin-api'
import { useToast } from '@/lib/use-toast'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'

const getStatusBadge = (status: string) => {
  const statusConfig: Record<string, { label: string; className: string; icon: any }> = {
    pending: { label: 'قيد الانتظار', className: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400 border-yellow-200 dark:border-yellow-800', icon: Clock },
    processing: { label: 'قيد المعالجة', className: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400 border-blue-200 dark:border-blue-800', icon: Package },
    shipped: { label: 'تم الشحن', className: 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400 border-purple-200 dark:border-purple-800', icon: Truck },
    delivered: { label: 'تم التوصيل', className: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400 border-green-200 dark:border-green-800', icon: CheckCircle2 },
    cancelled: { label: 'ملغي', className: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400 border-red-200 dark:border-red-800', icon: XCircle },
  }
  const config = statusConfig[status] || statusConfig.pending
  const Icon = config.icon

  return (
    <Badge className={`${config.className} gap-1`} variant='outline'>
      <Icon className='h-3 w-3' />
      {config.label}
    </Badge>
  )
}

export default function AdminOrderDetailsPage({ params }: { params: { id: string } }) {
  const router = useRouter()
  const { toast } = useToast()
  const [order, setOrder] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [status, setStatus] = useState('')
  const [updating, setUpdating] = useState(false)
  const [statusChangeDialog, setStatusChangeDialog] = useState(false)

  useEffect(() => {
    fetchOrder()
  }, [params.id])

  const fetchOrder = async () => {
    try {
      setLoading(true)
      const orderData = await adminOrdersAPI.getById(params.id)
      
      // ✨ التعديل السحري هنا: استخدمنا orderData مباشرة بدل response.data
      setOrder(orderData)
      setStatus(orderData?.status || 'pending')
    } catch (error: any) {
      console.error('Failed to fetch order:', error)
      toast({
        title: '❌ خطأ',
        description: 'فشل تحميل تفاصيل الطلب',
        variant: 'destructive',
      })
    } finally {
      setLoading(false)
    }
  }

  const handleStatusChangeRequest = () => {
    if (status === order.status) return
    setStatusChangeDialog(true)
  }

  const handleStatusUpdate = async () => {
    try {
      setUpdating(true)
      await adminOrdersAPI.updateStatus(params.id, status)
      
      // تحديث الطلب محلياً
      setOrder({ ...order, status })
      
      toast({
        title: '✅ تم التحديث',
        description: 'تم تحديث حالة الطلب بنجاح',
      })
    } catch (error: any) {
      toast({
        title: '❌ خطأ',
        description: error.response?.data?.message || 'فشل تحديث الحالة',
        variant: 'destructive',
      })
      // إعادة الحالة للقيمة الأصلية عند الفشل
      setStatus(order.status)
    } finally {
      setUpdating(false)
      setStatusChangeDialog(false)
    }
  }

  const handleMarkAsPaid = async () => {
    try {
      setUpdating(true)
      await adminOrdersAPI.updatePaidStatus(params.id)
      setOrder({ ...order, isPaid: true, paidAt: new Date().toISOString() })
      toast({ title: '✅ تم التحديث', description: 'تم تحديد الطلب كمدفوع' })
    } catch (error: any) {
      toast({ title: '❌ خطأ', description: 'فشل التحديث', variant: 'destructive' })
    } finally {
      setUpdating(false)
    }
  }

  const handleMarkAsDelivered = async () => {
    try {
      setUpdating(true)
      await adminOrdersAPI.updateDeliveredStatus(params.id)
      // Delivered usually implies status change too
      setStatus('delivered')
      setOrder({ 
        ...order, 
        isDelivered: true, 
        deliveredAt: new Date().toISOString(),
        status: 'delivered' 
      })
      toast({ title: '✅ تم التحديث', description: 'تم تحديد الطلب كمستلم' })
    } catch (error: any) {
      toast({ title: '❌ خطأ', description: 'فشل التحديث', variant: 'destructive' })
    } finally {
      setUpdating(false)
    }
  }

  if (loading) {
    return (
      <div className='flex items-center justify-center min-h-[60vh]'>
        <Loader2 className='h-12 w-12 animate-spin text-primary' />
      </div>
    )
  }

  if (!order) {
    return (
      <div className='text-center py-12'>
        <Package className='h-16 w-16 mx-auto mb-4 text-muted-foreground' />
        <h2 className='text-2xl font-bold mb-2'>الطلب غير موجود</h2>
        <Link href='/admin/orders'>
          <Button>
            <ArrowRight className='ml-2 h-4 w-4' />
            العودة للطلبات
          </Button>
        </Link>
      </div>
    )
  }

  return (
    <div className='space-y-4 md:space-y-6 max-w-6xl mx-auto p-4' dir="rtl">
      {/* Header */}
      <div className='flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between bg-card p-4 rounded-xl border shadow-sm'>
        <div className='flex items-center gap-4'>
          <Link href='/admin/orders'>
            <Button variant='ghost' size='icon' className='h-9 w-9'>
              <ArrowRight className='h-5 w-5' />
            </Button>
          </Link>
          <div>
            <div className='flex items-center gap-3 mb-1'>
              <h1 className='text-xl md:text-2xl font-bold'>
                طلب #{order._id.slice(-6)}
              </h1>
              {getStatusBadge(order.status)}
            </div>
            <p className='text-sm text-muted-foreground'>
              تم الطلب في {new Date(order.createdAt).toLocaleString('ar-EG')}
            </p>
          </div>
        </div>

        {/* Status Change Control */}
        <div className='flex flex-col sm:flex-row items-stretch sm:items-center gap-3 bg-muted/30 p-2 rounded-lg border'>
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-muted-foreground whitespace-nowrap">تغيير الحالة:</span>
            <Select value={status} onValueChange={setStatus} disabled={updating}>
              <SelectTrigger className='w-full sm:w-[160px] h-9 bg-background'>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value='pending'>⏳ قيد الانتظار</SelectItem>
                <SelectItem value='processing'>⚙️ قيد المعالجة</SelectItem>
                <SelectItem value='shipped'>🚚 تم الشحن</SelectItem>
                <SelectItem value='delivered'>✅ تم التوصيل</SelectItem>
                <SelectItem value='cancelled'>❌ ملغي</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <Button
            onClick={handleStatusChangeRequest}
            className='bg-primary h-9 font-bold'
            disabled={updating || status === order.status}
            size="sm"
          >
            {updating ? (
              <>
                <Loader2 className='ml-2 h-3 w-3 animate-spin' />
                جاري الحفظ...
              </>
            ) : (
              <>
                <Save className='ml-2 h-3 w-3' />
                حفظ
              </>
            )}
          </Button>
        </div>
      </div>

      <div className='grid lg:grid-cols-3 gap-4 md:gap-6'>
        {/* Order Items */}
        <div className='lg:col-span-2 space-y-4 md:space-y-6'>
          <Card className="border-0 shadow-md">
            <CardHeader className="border-b bg-muted/10 pb-3">
              <CardTitle className='flex items-center gap-2 text-base'>
                <Package className='h-4 w-4 text-primary' />
                المنتجات ({order.cartItems.length})
              </CardTitle>
            </CardHeader>
            <CardContent className='space-y-4 pt-4'>
              {order.cartItems?.map((item: any, index: number) => {
                const product = typeof item.product === 'object' ? item.product : null

                return (
                  <div key={index} className='flex gap-3 md:gap-4 p-2 hover:bg-muted/20 rounded-lg transition-colors'>
                    <div className='relative w-16 h-16 md:w-20 md:h-20 rounded-lg overflow-hidden bg-secondary flex-shrink-0 border'>
                      {product?.imageCover ? (
                        <Image
                          src={getImageUrl(product.imageCover)}
                          alt={product.title || 'Product'}
                          fill
                          className='object-cover'
                        />
                      ) : (
                        <div className='w-full h-full flex items-center justify-center'>
                          <Package className='h-8 w-8 text-muted-foreground' />
                        </div>
                      )}
                    </div>
                    <div className='flex-1 min-w-0 flex flex-col justify-center'>
                      <Link href={`/product/${product?._id}`} className='hover:underline'>
                        <h4 className='font-semibold mb-1 line-clamp-1 text-sm md:text-base'>
                          {product?.titleAr || product?.title || 'منتج محذوف'}
                        </h4>
                      </Link>
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <span>الكمية: <span className="font-bold text-foreground">{item.quantity}</span></span>
                        <span>السعر: <span className="font-bold text-primary">{formatPrice(item.price)}</span></span>
                      </div>
                    </div>
                    <div className="flex items-center justify-end font-bold text-primary text-sm md:text-base">
                      {formatPrice(item.price * item.quantity)}
                    </div>
                  </div>
                )
              })}
            </CardContent>
          </Card>

          {/* Customer Info */}
          <Card className="border-0 shadow-md">
            <CardHeader className="border-b bg-muted/10 pb-3">
              <CardTitle className='flex items-center gap-2 text-base'>
                <User className='h-4 w-4 text-primary' />
                بيانات العميل
              </CardTitle>
            </CardHeader>
            <CardContent className='space-y-4 pt-4'>
              <div className='flex items-center gap-3'>
                <Avatar className='h-12 w-12 border'>
                  <AvatarImage src={order.user?.profileImg} />
                  <AvatarFallback className='bg-primary/10 text-primary text-lg font-bold'>
                    {order.user?.name?.charAt(0) || 'U'}
                  </AvatarFallback>
                </Avatar>
                <div className='flex-1'>
                  <p className='font-bold text-lg'>{order.user?.name || 'غير معروف'}</p>
                  <p className='text-xs text-muted-foreground'>معرف العميل: #{order.user?._id?.slice(-6) || 'N/A'}</p>
                </div>
                <Link href={`/admin/users?search=${order.user?.email}`}>
                  <Button variant="outline" size="sm">عرض الملف</Button>
                </Link>
              </div>
              <Separator />
              <div className='grid sm:grid-cols-2 gap-4'>
                <div className='flex items-center gap-3 bg-muted/20 p-3 rounded-lg'>
                  <div className="bg-white dark:bg-card p-2 rounded-full shadow-sm">
                    <Mail className='h-4 w-4 text-primary' />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs text-muted-foreground">البريد الإلكتروني</p>
                    <p className='text-sm font-medium truncate' title={order.user?.email}>{order.user?.email}</p>
                  </div>
                </div>
                {order.user?.phone && (
                  <div className='flex items-center gap-3 bg-muted/20 p-3 rounded-lg'>
                    <div className="bg-white dark:bg-card p-2 rounded-full shadow-sm">
                      <Phone className='h-4 w-4 text-primary' />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs text-muted-foreground">رقم الهاتف</p>
                      <p className='text-sm font-medium' dir="ltr">{order.user.phone}</p>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className='lg:col-span-1 space-y-4 md:space-y-6'>
          {/* Quick Actions */}
          <Card className="border-0 shadow-md border-t-4 border-t-primary">
            <CardHeader className="pb-3">
              <CardTitle className="text-base">إجراءات سريعة</CardTitle>
            </CardHeader>
            <CardContent className='space-y-3'>
              {!order.isPaid && (
                <Button
                  onClick={handleMarkAsPaid}
                  className='w-full justify-start'
                  variant='outline'
                  disabled={updating}
                >
                  {updating ? <Loader2 className="ml-2 h-4 w-4 animate-spin" /> : <CheckCircle2 className='ml-2 h-4 w-4 text-green-600' />}
                  تحديد كمدفوع
                </Button>
              )}
              {!order.isDelivered && (
                <Button
                  onClick={handleMarkAsDelivered}
                  className='w-full justify-start'
                  variant='outline'
                  disabled={updating}
                >
                  {updating ? <Loader2 className="ml-2 h-4 w-4 animate-spin" /> : <Truck className='ml-2 h-4 w-4 text-blue-600' />}
                  تحديد كمستلم
                </Button>
              )}
              <div className="text-xs text-muted-foreground text-center mt-2">
                * سيتم تحديث الحالة والتواريخ تلقائياً
              </div>
            </CardContent>
          </Card>

          {/* Order Summary */}
          <Card className="border-0 shadow-md">
            <CardHeader className="bg-muted/10 border-b pb-3">
              <CardTitle className="text-base">ملخص الطلب</CardTitle>
            </CardHeader>
            <CardContent className='space-y-3 pt-4'>
              <div className='flex justify-between text-sm'>
                <span className='text-muted-foreground'>المجموع الفرعي</span>
                <span className='font-medium'>
                  {formatPrice(
                    order.cartItems?.reduce(
                      (sum: number, item: any) => sum + item.price * item.quantity,
                      0
                    ) || 0
                  )}
                </span>
              </div>
              <div className='flex justify-between text-sm'>
                <span className='text-muted-foreground'>الشحن</span>
                <span className='font-medium'>
                  {formatPrice(order.shippingPrice || 0)}
                </span>
              </div>
              <Separator />
              <div className='flex justify-between font-bold text-lg bg-primary/5 p-3 rounded-lg'>
                <span>الإجمالي</span>
                <span className='text-primary'>
                  {formatPrice(order.totalOrderPrice || 0)}
                </span>
              </div>
            </CardContent>
          </Card>

          {/* Shipping Address */}
          <Card className="border-0 shadow-md">
            <CardHeader className="bg-muted/10 border-b pb-3">
              <CardTitle className='flex items-center gap-2 text-base'>
                <MapPin className='h-4 w-4 text-primary' />
                عنوان الشحن
              </CardTitle>
            </CardHeader>
            <CardContent className='space-y-2 text-sm pt-4'>
              <p className='font-medium'>{order.user?.name}</p>
              <div className="bg-muted/20 p-3 rounded-lg space-y-1">
                <p className='text-foreground'>{order.shippingAddress?.details}</p>
                <p className='text-muted-foreground'>{order.shippingAddress?.city}</p>
                <p className='text-muted-foreground'>
                  الرمز البريدي: {order.shippingAddress?.postalCode}
                </p>
              </div>
              {order.shippingAddress?.phone && (
                <div className='flex items-center gap-2 mt-3 text-muted-foreground'>
                  <Phone className='h-3 w-3' />
                  <span dir="ltr">{order.shippingAddress.phone}</span>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Payment Info */}
          <Card className="border-0 shadow-md">
            <CardHeader className="bg-muted/10 border-b pb-3">
              <CardTitle className='flex items-center gap-2 text-base'>
                <CreditCard className='h-4 w-4 text-primary' />
                معلومات الدفع
              </CardTitle>
            </CardHeader>
            <CardContent className='space-y-4 pt-4'>
              <div className="flex justify-between items-center">
                <span className='text-sm text-muted-foreground'>طريقة الدفع</span>
                <Badge variant='outline' className="font-bold">
                  {order.paymentMethodType === 'cash' ? '💵 الدفع عند الاستلام' : '💳 بطاقة ائتمان'}
                </Badge>
              </div>
              
              <div className="flex justify-between items-center">
                <span className='text-sm text-muted-foreground'>حالة الدفع</span>
                {order.isPaid ? (
                  <Badge className='bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400 gap-1'>
                    <CheckCircle2 className="h-3 w-3" /> مدفوع
                  </Badge>
                ) : (
                  <Badge variant='secondary' className="gap-1">
                    <XCircle className="h-3 w-3" /> غير مدفوع
                  </Badge>
                )}
              </div>

              <div className="flex justify-between items-center">
                <span className='text-sm text-muted-foreground'>حالة التوصيل</span>
                {order.isDelivered ? (
                  <Badge className='bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400 gap-1'>
                    <Truck className="h-3 w-3" /> تم التوصيل
                  </Badge>
                ) : (
                  <Badge variant='secondary'>لم يتم التوصيل</Badge>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Confirmation Dialog */}
      <AlertDialog open={statusChangeDialog} onOpenChange={setStatusChangeDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-primary" />
              تأكيد تغيير الحالة
            </AlertDialogTitle>
            <AlertDialogDescription>
              هل أنت متأكد من تغيير حالة هذا الطلب إلى 
              <span className="font-bold text-foreground px-1">{status}</span>؟
              <br />
              <span className="text-xs mt-2 block">
                سيتم إرسال إشعار للعميل بالتحديث الجديد.
              </span>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={updating}>إلغاء</AlertDialogCancel>
            <AlertDialogAction onClick={handleStatusUpdate} disabled={updating}>
              {updating ? <Loader2 className="ml-2 h-4 w-4 animate-spin" /> : 'تأكيد'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}