// app/admin/orders/page.tsx
'use client'

import { useState, useEffect, useMemo } from 'react'
import Link from 'next/link'
import { 
  Eye, 
  Loader2, 
  Package, 
  CheckCircle2, 
  XCircle, 
  Clock, 
  Search, 
  TrendingUp,
  AlertCircle,
  Truck
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
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
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { formatPrice } from '@/lib/utils'
import { adminOrdersAPI } from '@/lib/admin-api'
import { useToast } from '@/lib/use-toast'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'

const getStatusBadge = (status: string) => {
  const statusConfig: Record<string, { label: string; className: string; icon: any }> = {
    pending: { 
      label: 'قيد الانتظار', 
      className: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400 border-yellow-200 dark:border-yellow-800', 
      icon: Clock 
    },
    processing: { 
      label: 'قيد المعالجة', 
      className: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400 border-blue-200 dark:border-blue-800', 
      icon: Package 
    },
    shipped: { 
      label: 'تم الشحن', 
      className: 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400 border-purple-200 dark:border-purple-800', 
      icon: Truck 
    },
    delivered: { 
      label: 'تم التوصيل', 
      className: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400 border-green-200 dark:border-green-800', 
      icon: CheckCircle2 
    },
    cancelled: { 
      label: 'ملغي', 
      className: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400 border-red-200 dark:border-red-800', 
      icon: XCircle 
    },
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

const getPaymentMethodText = (method: string) => {
  return method === 'cash' ? '💵 نقدي' : '💳 بطاقة'
}

const getPaymentStatusBadge = (isPaid: boolean) => {
  return isPaid ? (
    <Badge className="bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400 border-green-200 dark:border-green-800 gap-1" variant="outline">
      <CheckCircle2 className="h-3 w-3" />
      مدفوع
    </Badge>
  ) : (
    <Badge className="bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400 border-red-200 dark:border-red-800 gap-1" variant="outline">
      <XCircle className="h-3 w-3" />
      غير مدفوع
    </Badge>
  )
}

export default function OrdersManagement() {
  const { toast } = useToast()
  const [orders, setOrders] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [filterStatus, setFilterStatus] = useState('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [statusChangeDialog, setStatusChangeDialog] = useState<{ orderId: string; newStatus: string } | null>(null)
  const [updatingStatus, setUpdatingStatus] = useState(false)

  useEffect(() => {
    fetchOrders()
  }, [])

  const fetchOrders = async () => {
    try {
      setLoading(true)
      const response = await adminOrdersAPI.getAll({})
      setOrders(response.data || [])
    } catch (error) {
      toast({ title: '❌ خطأ', description: 'فشل تحميل الطلبات', variant: 'destructive' })
    } finally {
      setLoading(false)
    }
  }

  const filteredOrders = useMemo(() => {
    let result = orders
    if (filterStatus !== 'all') result = result.filter(order => order.status === filterStatus)
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase().trim()
      result = result.filter(order => {
        const orderId = order._id.slice(-6).toLowerCase()
        const userName = (order.user?.name || '').toLowerCase()
        const userEmail = (order.user?.email || '').toLowerCase()
        return orderId.includes(query) || userName.includes(query) || userEmail.includes(query)
      })
    }
    return result
  }, [orders, filterStatus, searchQuery])

  const statistics = useMemo(() => {
    return {
      total: orders.length,
      pending: orders.filter(o => o.status === 'pending').length,
      processing: orders.filter(o => o.status === 'processing').length,
      shipped: orders.filter(o => o.status === 'shipped').length,
      delivered: orders.filter(o => o.status === 'delivered').length,
      cancelled: orders.filter(o => o.status === 'cancelled').length,
      totalRevenue: orders.filter(o => o.isPaid).reduce((sum, o) => sum + (o.totalOrderPrice || 0), 0),
    }
  }, [orders])

  const handleStatusChangeRequest = (orderId: string, newStatus: string, currentStatus: string) => {
    if (newStatus === currentStatus) return
    setStatusChangeDialog({ orderId, newStatus })
  }

  const handleStatusChangeConfirm = async () => {
    if (!statusChangeDialog) return

    try {
      setUpdatingStatus(true)
      await adminOrdersAPI.updateStatus(statusChangeDialog.orderId, statusChangeDialog.newStatus)
      
      setOrders(orders.map(order => 
        order._id === statusChangeDialog.orderId 
          ? { ...order, status: statusChangeDialog.newStatus } 
          : order
      ))
      
      toast({ 
        title: '✅ تم التحديث', 
        description: `تم تحديث حالة الطلب بنجاح` 
      })
    } catch (error) {
      toast({ 
        title: '❌ خطأ', 
        description: 'فشل تحديث حالة الطلب', 
        variant: 'destructive' 
      })
    } finally {
      setUpdatingStatus(false)
      setStatusChangeDialog(null)
    }
  }

  const getStatusLabel = (status: string) => {
    const labels: Record<string, string> = {
      pending: 'قيد الانتظار',
      processing: 'قيد المعالجة',
      shipped: 'تم الشحن',
      delivered: 'تم التوصيل',
      cancelled: 'ملغي',
    }
    return labels[status] || status
  }

  return (
    <div className='space-y-4 sm:space-y-6 p-3 sm:p-4 md:p-6' dir='rtl'>
      {/* Header */}
      <div className='flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3'>
        <div>
          <h1 className='text-xl sm:text-2xl md:text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent'>
            إدارة الطلبات
          </h1>
          <p className='text-xs sm:text-sm text-muted-foreground mt-1'>
            إجمالي الطلبات: <span className='font-bold text-primary'>{statistics.total}</span>
          </p>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className='grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4'>
        <Card className='shadow-sm border-t-4 border-t-primary hover:shadow-md transition-all'>
          <CardContent className='p-3 sm:p-4'>
            <div className='flex items-center gap-2 mb-2'>
              <div className='bg-primary/10 p-1.5 sm:p-2 rounded-lg'>
                <Package className='h-3 w-3 sm:h-4 sm:w-4 text-primary' />
              </div>
              <p className='text-[10px] sm:text-xs text-muted-foreground font-semibold'>الإجمالي</p>
            </div>
            <p className='text-lg sm:text-2xl font-bold text-primary'>{statistics.total}</p>
          </CardContent>
        </Card>

        <Card className='shadow-sm border-t-4 border-t-yellow-500 hover:shadow-md transition-all'>
          <CardContent className='p-3 sm:p-4'>
            <div className='flex items-center gap-2 mb-2'>
              <div className='bg-yellow-100 dark:bg-yellow-900/30 p-1.5 sm:p-2 rounded-lg'>
                <Clock className='h-3 w-3 sm:h-4 sm:w-4 text-yellow-600' />
              </div>
              <p className='text-[10px] sm:text-xs text-muted-foreground font-semibold'>انتظار</p>
            </div>
            <p className='text-lg sm:text-2xl font-bold text-yellow-600'>{statistics.pending}</p>
          </CardContent>
        </Card>

        <Card className='shadow-sm border-t-4 border-t-blue-500 hover:shadow-md transition-all'>
          <CardContent className='p-3 sm:p-4'>
            <div className='flex items-center gap-2 mb-2'>
              <div className='bg-blue-100 dark:bg-blue-900/30 p-1.5 sm:p-2 rounded-lg'>
                <Package className='h-3 w-3 sm:h-4 sm:w-4 text-blue-600' />
              </div>
              <p className='text-[10px] sm:text-xs text-muted-foreground font-semibold'>معالجة</p>
            </div>
            <p className='text-lg sm:text-2xl font-bold text-blue-600'>{statistics.processing}</p>
          </CardContent>
        </Card>

        <Card className='shadow-sm border-t-4 border-t-purple-500 hover:shadow-md transition-all'>
          <CardContent className='p-3 sm:p-4'>
            <div className='flex items-center gap-2 mb-2'>
              <div className='bg-purple-100 dark:bg-purple-900/30 p-1.5 sm:p-2 rounded-lg'>
                <Truck className='h-3 w-3 sm:h-4 sm:w-4 text-purple-600' />
              </div>
              <p className='text-[10px] sm:text-xs text-muted-foreground font-semibold'>شحن</p>
            </div>
            <p className='text-lg sm:text-2xl font-bold text-purple-600'>{statistics.shipped}</p>
          </CardContent>
        </Card>

        <Card className='shadow-sm border-t-4 border-t-green-500 hover:shadow-md transition-all'>
          <CardContent className='p-3 sm:p-4'>
            <div className='flex items-center gap-2 mb-2'>
              <div className='bg-green-100 dark:bg-green-900/30 p-1.5 sm:p-2 rounded-lg'>
                <CheckCircle2 className='h-3 w-3 sm:h-4 sm:w-4 text-green-600' />
              </div>
              <p className='text-[10px] sm:text-xs text-muted-foreground font-semibold'>تم</p>
            </div>
            <p className='text-lg sm:text-2xl font-bold text-green-600'>{statistics.delivered}</p>
          </CardContent>
        </Card>

        <Card className='shadow-sm border-t-4 border-t-emerald-500 hover:shadow-md transition-all'>
          <CardContent className='p-3 sm:p-4'>
            <div className='flex items-center gap-2 mb-2'>
              <div className='bg-emerald-100 dark:bg-emerald-900/30 p-1.5 sm:p-2 rounded-lg'>
                <TrendingUp className='h-3 w-3 sm:h-4 sm:w-4 text-emerald-600' />
              </div>
              <p className='text-[10px] sm:text-xs text-muted-foreground font-semibold'>الإيرادات</p>
            </div>
            <p className='text-sm sm:text-lg font-bold text-emerald-600'>
              {formatPrice(statistics.totalRevenue)}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Search and Filters */}
      <Card className='shadow-sm border-0'>
        <CardContent className='p-3 sm:p-4'>
          <div className='flex flex-col sm:flex-row gap-3'>
            <div className='relative flex-1'>
              <Search className='absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground' />
              <Input
                placeholder='ابحث برقم الطلب، اسم العميل...'
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className='pr-10 h-10 sm:h-11'
              />
            </div>
            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger className='w-full sm:w-[200px] h-10 sm:h-11'>
                <SelectValue placeholder='جميع الحالات' />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value='all'>جميع الحالات</SelectItem>
                <SelectItem value='pending'>⏳ قيد الانتظار</SelectItem>
                <SelectItem value='processing'>📦 قيد المعالجة</SelectItem>
                <SelectItem value='shipped'>🚚 تم الشحن</SelectItem>
                <SelectItem value='delivered'>✅ تم التوصيل</SelectItem>
                <SelectItem value='cancelled'>❌ ملغي</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Loading State */}
      {loading ? (
        <div className='flex flex-col items-center justify-center py-16 gap-3'>
          <Loader2 className='h-10 w-10 animate-spin text-primary' />
          <p className='text-sm text-muted-foreground'>جاري التحميل...</p>
        </div>
      ) : filteredOrders.length === 0 ? (
        <Card className='border-0 shadow-sm'>
          <CardContent className='flex flex-col items-center justify-center py-16 gap-3'>
            <Package className='h-16 w-16 text-muted-foreground/30' />
            <p className='text-muted-foreground font-medium'>لا توجد طلبات</p>
          </CardContent>
        </Card>
      ) : (
        <>
          {/* Desktop Table */}
          <Card className='hidden lg:block shadow-md overflow-hidden border-0'>
            <Table>
              <TableHeader>
                <TableRow className='bg-muted/50'>
                  <TableHead className='text-right font-bold'>رقم الطلب</TableHead>
                  <TableHead className='text-right font-bold'>العميل</TableHead>
                  <TableHead className='text-right font-bold'>المبلغ</TableHead>
                  <TableHead className='text-right font-bold'>طريقة الدفع</TableHead>
                  <TableHead className='text-right font-bold'>حالة الدفع</TableHead>
                  <TableHead className='text-right font-bold'>الحالة</TableHead>
                  <TableHead className='text-right font-bold'>تغيير الحالة</TableHead>
                  <TableHead className='text-left font-bold'>إجراءات</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredOrders.map((order) => (
                  <TableRow key={order._id} className='hover:bg-accent/50'>
                    <TableCell className='font-bold text-primary text-right'>#{order._id.slice(-6)}</TableCell>
                    <TableCell className='text-right'>
                      <div className='flex items-center gap-3'>
                        <Avatar className='h-9 w-9'>
                          <AvatarImage src={order.user?.profileImg} />
                          <AvatarFallback className='bg-primary/10 text-primary font-bold'>
                            {order.user?.name?.charAt(0) || 'U'}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className='font-semibold text-sm'>{order.user?.name || 'غير معروف'}</p>
                          <p className='text-xs text-muted-foreground'>{order.user?.email}</p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className='font-bold text-right'>{formatPrice(order.totalOrderPrice)}</TableCell>
                    <TableCell className='text-right'>{getPaymentMethodText(order.paymentMethodType)}</TableCell>
                    <TableCell className='text-right'>{getPaymentStatusBadge(order.isPaid)}</TableCell>
                    <TableCell className='text-right'>{getStatusBadge(order.status)}</TableCell>
                    <TableCell className='text-right'>
                      <Select 
                        value={order.status} 
                        onValueChange={(v) => handleStatusChangeRequest(order._id, v, order.status)}
                      >
                        <SelectTrigger className='w-[140px]'>
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
                    </TableCell>
                    <TableCell className='text-left'>
                      <Link href={`/admin/orders/${order._id}`}>
                        <Button variant='ghost' size='icon'><Eye className='h-4 w-4' /></Button>
                      </Link>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Card>

          {/* Mobile Cards */}
          <div className="lg:hidden space-y-3">
            {filteredOrders.map(order => (
              <Card key={order._id} className="shadow-sm border-0">
                <CardContent className="p-4 space-y-3">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="text-xs text-muted-foreground">رقم الطلب</p>
                      <p className="text-base sm:text-lg font-bold text-primary">#{order._id.slice(-6)}</p>
                    </div>
                    {getStatusBadge(order.status)}
                  </div>

                  <div className="space-y-1 border-t pt-3">
                    <p className="text-xs text-muted-foreground">العميل</p>
                    <div className='flex items-center gap-2'>
                      <Avatar className='h-8 w-8'>
                        <AvatarImage src={order.user?.profileImg} />
                        <AvatarFallback className='bg-primary/10 text-primary font-bold text-xs'>
                          {order.user?.name?.charAt(0) || 'U'}
                        </AvatarFallback>
                      </Avatar>
                      <div className='flex-1 min-w-0'>
                        <p className="font-semibold text-sm truncate">{order.user?.name || 'غير معروف'}</p>
                        <p className="text-xs text-muted-foreground truncate">{order.user?.email}</p>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div className="bg-muted/40 rounded-lg p-2.5 text-right">
                      <p className="text-[10px] text-muted-foreground mb-1">الإجمالي</p>
                      <p className="font-bold text-sm text-primary">{formatPrice(order.totalOrderPrice)}</p>
                    </div>
                    <div className="bg-muted/40 rounded-lg p-2.5 text-right">
                      <p className="text-[10px] text-muted-foreground mb-1">طريقة الدفع</p>
                      <p className="font-bold text-xs text-foreground">{getPaymentMethodText(order.paymentMethodType)}</p>
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <p className="text-xs text-muted-foreground">تغيير حالة الطلب</p>
                    <Select 
                      value={order.status} 
                      onValueChange={v => handleStatusChangeRequest(order._id, v, order.status)}
                    >
                      <SelectTrigger className="w-full h-9">
                        <SelectValue placeholder="اختر الحالة" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value='pending'>قيد الانتظار</SelectItem>
                        <SelectItem value='processing'>قيد المعالجة</SelectItem>
                        <SelectItem value='shipped'>تم الشحن</SelectItem>
                        <SelectItem value='delivered'>تم التوصيل</SelectItem>
                        <SelectItem value='cancelled'>ملغي</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <Link href={`/admin/orders/${order._id}`}>
                    <Button className="w-full h-9 text-sm" size="sm">
                      <Eye className="h-3.5 w-3.5 ml-1" />
                      عرض التفاصيل
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            ))}
          </div>
        </>
      )}

      {/* Status Change Confirmation Dialog */}
      <AlertDialog open={!!statusChangeDialog} onOpenChange={(open) => !open && setStatusChangeDialog(null)}>
        <AlertDialogContent className="w-[90vw] max-w-md">
          <AlertDialogHeader className="text-right">
            <div className="flex items-center justify-end gap-2 text-primary mb-2">
              <AlertDialogTitle className='text-base sm:text-lg'>تأكيد تغيير حالة الطلب</AlertDialogTitle>
              <AlertCircle className="h-5 w-5" />
            </div>
            <AlertDialogDescription className="text-right text-sm">
              هل أنت متأكد من تغيير حالة الطلب إلى{' '}
              <span className="font-bold text-foreground">
                {statusChangeDialog && getStatusLabel(statusChangeDialog.newStatus)}
              </span>
              ؟
              <br />
              <span className="text-xs text-muted-foreground mt-2 block">
                سيتم إرسال إشعار للعميل بالتحديث الجديد.
              </span>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="flex-row-reverse gap-2">
            <AlertDialogAction 
              onClick={handleStatusChangeConfirm}
              disabled={updatingStatus}
              className="bg-primary hover:bg-primary/90 flex-1 sm:flex-none"
            >
              {updatingStatus ? (
                <>
                  <Loader2 className='ml-2 h-4 w-4 animate-spin' />
                  جاري التحديث...
                </>
              ) : (
                'تأكيد'
              )}
            </AlertDialogAction>
            <AlertDialogCancel className='flex-1 sm:flex-none' disabled={updatingStatus}>
              إلغاء
            </AlertDialogCancel>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}