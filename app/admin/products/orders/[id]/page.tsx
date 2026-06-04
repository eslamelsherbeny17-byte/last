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
import { formatPrice, getImageUrl } from '@/lib/utils'
import { adminOrdersAPI } from '@/lib/admin-api'
import { useToast } from '@/lib/use-toast'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'

const getStatusBadge = (status: string) => {
  const statusConfig: Record<string, { label: string; className: string }> = {
    pending: {
      label: 'قيد الانتظار',
      className: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400',
    },
    processing: {
      label: 'قيد المعالجة',
      className: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400',
    },
    shipped: {
      label: 'تم الشحن',
      className: 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400',
    },
    delivered: {
      label: 'تم التوصيل',
      className: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
    },
    cancelled: {
      label: 'ملغي',
      className: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400',
    },
  }

  const config = statusConfig[status] || statusConfig.pending
  return (
    <Badge className={config.className} variant='outline'>
      {config.label}
    </Badge>
  )
}

export default function AdminOrderDetailsPage({
  params,
}: {
  params: { id: string }
}) {
  const router = useRouter()
  const { toast } = useToast()
  const [order, setOrder] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [status, setStatus] = useState('')
  const [updating, setUpdating] = useState(false)

  useEffect(() => {
    fetchOrder()
  }, [params.id])

  const fetchOrder = async () => {
    try {
      setLoading(true)
      const response = await adminOrdersAPI.getById(params.id)
      setOrder(response.data)
      setStatus(response.data.status || 'pending')
    } catch (error: any) {
      console.error('Failed to fetch order:', error)
      toast({
        title: 'خطأ',
        description: 'فشل تحميل تفاصيل الطلب',
        variant: 'destructive',
      })
    } finally {
      setLoading(false)
    }
  }

  const handleStatusUpdate = async () => {
    try {
      setUpdating(true)
      await adminOrdersAPI.updateStatus(params.id, status)
      toast({
        title: '✅ تم التحديث',
        description: 'تم تحديث حالة الطلب بنجاح',
      })
      fetchOrder()
    } catch (error: any) {
      toast({
        title: 'خطأ',
        description: error.response?.data?.message || 'فشل تحديث الحالة',
        variant: 'destructive',
      })
    } finally {
      setUpdating(false)
    }
  }

  const handleMarkAsPaid = async () => {
    try {
      await adminOrdersAPI.updatePaidStatus(params.id)
      toast({
        title: '✅ تم التحديث',
        description: 'تم تحديث حالة الدفع بنجاح',
      })
      fetchOrder()
    } catch (error: any) {
      toast({
        title: 'خطأ',
        description: 'فشل تحديث حالة الدفع',
        variant: 'destructive',
      })
    }
  }

  const handleMarkAsDelivered = async () => {
    try {
      await adminOrdersAPI.updateDeliveredStatus(params.id)
      toast({
        title: '✅ تم التحديث',
        description: 'تم تحديث حالة التوصيل بنجاح',
      })
      fetchOrder()
    } catch (error: any) {
      toast({
        title: 'خطأ',
        description: 'فشل تحديث حالة التوصيل',
        variant: 'destructive',
      })
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

  const subtotal =
    order.cartItems?.reduce(
      (sum: number, item: any) => sum + item.price * item.quantity,
      0
    ) || 0

  return (
    <div className='space-y-4 md:space-y-6 max-w-6xl mx-auto'>
      {/* Header */}
      <div className='flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between'>
        <div className='flex items-center gap-4'>
          <Link href='/admin/orders'>
            <Button variant='ghost' size='icon' className='h-9 w-9'>
              <ArrowRight className='h-5 w-5' />
            </Button>
          </Link>
          <div>
            <h1 className='text-2xl md:text-3xl font-bold'>
              تفاصيل الطلب #{order._id.slice(-8)}
            </h1>
            <p className='text-sm text-muted-foreground'>
              تم الإنشاء في {new Date(order.createdAt).toLocaleString('ar-EG')}
            </p>
          </div>
        </div>
        <div className='flex flex-col sm:flex-row items-stretch sm:items-center gap-3'>
          <Select value={status} onValueChange={setStatus}>
            <SelectTrigger className='w-full sm:w-[180px]'>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value='pending'>قيد الانتظار</SelectItem>
              <SelectItem value='processing'>قيد المعالجة</SelectItem>
              <SelectItem value='shipped'>تم الشحن</SelectItem>
              <SelectItem value='delivered'>تم التوصيل</SelectItem>
              <SelectItem value='cancelled'>ملغي</SelectItem>
            </SelectContent>
          </Select>
          {status !== order.status && (
            <Button
              onClick={handleStatusUpdate}
              className='bg-gradient-to-r from-primary to-primary/80'
              disabled={updating}
            >
              {updating ? (
                <>
                  <Loader2 className='ml-2 h-4 w-4 animate-spin' />
                  جاري الحفظ...
                </>
              ) : (
                <>
                  <Save className='ml-2 h-4 w-4' />
                  حفظ التغييرات
                </>
              )}
            </Button>
          )}
        </div>
      </div>

      <div className='grid lg:grid-cols-3 gap-4 md:gap-6'>
        {/* Order Items */}
        <div className='lg:col-span-2 space-y-4 md:space-y-6'>
          <Card>
            <CardHeader>
              <CardTitle className='flex items-center gap-2'>
                <Package className='h-5 w-5' />
                المنتجات
              </CardTitle>
            </CardHeader>
            <CardContent className='space-y-4'>
              {order.cartItems?.map((item: any, index: number) => {
                const product = typeof item.product === 'object' ? item.product : null

                return (
                  <div key={index} className='flex gap-3 md:gap-4'>
                    <div className='relative w-16 h-16 md:w-20 md:h-20 rounded-lg overflow-hidden bg-secondary flex-shrink-0'>
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
                    <div className='flex-1 min-w-0'>
                      <h4 className='font-semibold mb-1 line-clamp-1'>
                        {product?.titleAr || product?.title || 'منتج محذوف'}
                      </h4>
                      <p className='text-sm text-muted-foreground mb-2'>
                        الكمية: {item.quantity}
                      </p>
                      <p className='font-bold text-primary'>
                        {formatPrice(item.price * item.quantity)}
                      </p>
                    </div>
                  </div>
                )
              })}
            </CardContent>
          </Card>

          {/* Customer Info */}
          <Card>
            <CardHeader>
              <CardTitle className='flex items-center gap-2'>
                <User className='h-5 w-5' />
                معلومات العميل
              </CardTitle>
            </CardHeader>
            <CardContent className='space-y-4'>
              <div className='flex items-center gap-3'>
                <Avatar className='h-12 w-12'>
                  <AvatarImage src={order.user?.profileImg} />
                  <AvatarFallback className='bg-primary/10 text-primary text-lg font-bold'>
                    {order.user?.name?.charAt(0) || 'U'}
                  </AvatarFallback>
                </Avatar>
                <div className='flex-1'>
                  <p className='font-semibold'>{order.user?.name || 'غير معروف'}</p>
                  <p className='text-sm text-muted-foreground'>عميل</p>
                </div>
              </div>
              <Separator />
              <div className='space-y-3'>
                <div className='flex items-center gap-3'>
                  <Mail className='h-4 w-4 text-muted-foreground' />
                  <span className='text-sm'>{order.user?.email}</span>
                </div>
                {order.user?.phone && (
                  <div className='flex items-center gap-3'>
                    <Phone className='h-4 w-4 text-muted-foreground' />
                    <span className='text-sm'>{order.user.phone}</span>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className='lg:col-span-1 space-y-4 md:space-y-6'>
          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle>إجراءات سريعة</CardTitle>
            </CardHeader>
            <CardContent className='space-y-3'>
              {!order.isPaid && (
                <Button
                  onClick={handleMarkAsPaid}
                  className='w-full'
                  variant='outline'
                >
                  <CheckCircle2 className='ml-2 h-4 w-4' />
                  تحديد كمدفوع
                </Button>
              )}
              {!order.isDelivered && (
                <Button
                  onClick={handleMarkAsDelivered}
                  className='w-full'
                  variant='outline'
                >
                  <CheckCircle2 className='ml-2 h-4 w-4' />
                  تحديد كمستلم
                </Button>
              )}
            </CardContent>
          </Card>

          {/* Order Summary */}
          <Card>
            <CardHeader>
              <CardTitle>ملخص الطلب</CardTitle>
            </CardHeader>
            <CardContent className='space-y-3'>
              <div className='flex justify-between text-sm'>
                <span className='text-muted-foreground'>المجموع الفرعي</span>
                <span className='font-medium'>{formatPrice(subtotal)}</span>
              </div>
              <div className='flex justify-between text-sm'>
                <span className='text-muted-foreground'>الشحن</span>
                <span className='font-medium'>
                  {formatPrice(order.shippingPrice || 0)}
                </span>
              </div>
              <Separator />
              <div className='flex justify-between font-bold text-lg'>
                <span>الإجمالي</span>
                <span className='text-primary'>
                  {formatPrice(order.totalOrderPrice || 0)}
                </span>
              </div>
            </CardContent>
          </Card>

          {/* Shipping Address */}
          <Card>
            <CardHeader>
              <CardTitle className='flex items-center gap-2'>
                <MapPin className='h-5 w-5' />
                عنوان الشحن
              </CardTitle>
            </CardHeader>
            <CardContent className='space-y-2 text-sm'>
              <p className='font-medium'>{order.user?.name}</p>
              <p className='text-muted-foreground'>{order.shippingAddress?.details}</p>
              <p className='text-muted-foreground'>{order.shippingAddress?.city}</p>
              <p className='text-muted-foreground'>
                الرمز البريدي: {order.shippingAddress?.postalCode}
              </p>
            </CardContent>
          </Card>

          {/* Payment Info */}
          <Card>
            <CardHeader>
              <CardTitle className='flex items-center gap-2'>
                <CreditCard className='h-5 w-5' />
                معلومات الدفع
              </CardTitle>
            </CardHeader>
            <CardContent className='space-y-3'>
              <div>
                <p className='text-sm text-muted-foreground mb-1'>طريقة الدفع</p>
                <Badge variant='outline'>
                  {order.paymentMethodType === 'cash'
                    ? 'الدفع عند الاستلام'
                    : 'بطاقة ائتمان'}
                </Badge>
              </div>
              <div>
                <p className='text-sm text-muted-foreground mb-1'>حالة الدفع</p>
                {order.isPaid ? (
                  <Badge className='bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'>
                    مدفوع
                  </Badge>
                ) : (
                  <Badge variant='secondary'>غير مدفوع</Badge>
                )}
              </div>
              <div>
                <p className='text-sm text-muted-foreground mb-1'>حالة التوصيل</p>
                {order.isDelivered ? (
                  <Badge className='bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'>
                    تم التوصيل
                  </Badge>
                ) : (
                  <Badge variant='secondary'>لم يتم التوصيل</Badge>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}