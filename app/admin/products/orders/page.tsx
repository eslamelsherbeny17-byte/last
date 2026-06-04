'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Eye, Filter, Loader2, Download, Search, Package } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
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
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { formatPrice } from '@/lib/utils'
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

export default function OrdersManagement() {
  const { toast } = useToast()
  const [orders, setOrders] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [filterStatus, setFilterStatus] = useState('all')
  const [searchQuery, setSearchQuery] = useState('')

  useEffect(() => {
    fetchOrders()
  }, [filterStatus])

  const fetchOrders = async () => {
    try {
      setLoading(true)
      const params: any = {}
      if (filterStatus !== 'all') {
        params.status = filterStatus
      }

      const response = await adminOrdersAPI.getAll(params)
      setOrders(response.data || [])
    } catch (error) {
      console.error('Failed to fetch orders:', error)
      toast({
        title: 'خطأ',
        description: 'فشل تحميل الطلبات',
        variant: 'destructive',
      })
    } finally {
      setLoading(false)
    }
  }

  const filteredOrders = orders.filter((order) => {
    const searchLower = searchQuery.toLowerCase()
    return (
      order._id?.toLowerCase().includes(searchLower) ||
      order.user?.name?.toLowerCase().includes(searchLower) ||
      order.user?.email?.toLowerCase().includes(searchLower)
    )
  })

  // Stats
  const stats = {
    total: orders.length,
    pending: orders.filter((o) => o.status === 'pending').length,
    processing: orders.filter((o) => o.status === 'processing').length,
    delivered: orders.filter((o) => o.status === 'delivered').length,
  }

  return (
    <div className='space-y-4 md:space-y-6'>
      {/* Header */}
      <div className='flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between'>
        <div>
          <h1 className='text-2xl md:text-3xl font-bold'>إدارة الطلبات</h1>
          <p className='text-sm text-muted-foreground mt-1'>
            إجمالي الطلبات: {orders.length}
          </p>
        </div>
        <Button variant='outline' className='w-full sm:w-auto'>
          <Download className='ml-2 h-4 w-4' />
          تصدير Excel
        </Button>
      </div>

      {/* Stats Cards */}
      <div className='grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4'>
        <Card>
          <CardContent className='pt-6'>
            <div className='text-center space-y-2'>
              <p className='text-sm text-muted-foreground'>إجمالي الطلبات</p>
              <h3 className='text-2xl md:text-3xl font-bold'>{stats.total}</h3>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className='pt-6'>
            <div className='text-center space-y-2'>
              <p className='text-sm text-muted-foreground'>قيد الانتظار</p>
              <h3 className='text-2xl md:text-3xl font-bold text-yellow-600'>
                {stats.pending}
              </h3>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className='pt-6'>
            <div className='text-center space-y-2'>
              <p className='text-sm text-muted-foreground'>قيد المعالجة</p>
              <h3 className='text-2xl md:text-3xl font-bold text-blue-600'>
                {stats.processing}
              </h3>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className='pt-6'>
            <div className='text-center space-y-2'>
              <p className='text-sm text-muted-foreground'>تم التوصيل</p>
              <h3 className='text-2xl md:text-3xl font-bold text-green-600'>
                {stats.delivered}
              </h3>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className='p-4'>
          <div className='flex flex-col md:flex-row gap-3 md:gap-4'>
            {/* Search */}
            <div className='relative flex-1'>
              <Search className='absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground' />
              <Input
                placeholder='بحث برقم الطلب، اسم العميل أو البريد...'
                className='pr-10'
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>

            {/* Status Filter */}
            <div className='flex items-center gap-2'>
              <Filter className='h-5 w-5 text-muted-foreground hidden md:block' />
              <Select value={filterStatus} onValueChange={setFilterStatus}>
                <SelectTrigger className='w-full md:w-[200px]'>
                  <SelectValue placeholder='جميع الحالات' />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value='all'>جميع الحالات</SelectItem>
                  <SelectItem value='pending'>قيد الانتظار</SelectItem>
                  <SelectItem value='processing'>قيد المعالجة</SelectItem>
                  <SelectItem value='shipped'>تم الشحن</SelectItem>
                  <SelectItem value='delivered'>تم التوصيل</SelectItem>
                  <SelectItem value='cancelled'>ملغي</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Orders Table */}
      <Card>
        <CardHeader className='border-b'>
          <CardTitle className='text-lg md:text-xl'>جميع الطلبات</CardTitle>
        </CardHeader>
        <CardContent className='p-0'>
          {loading ? (
            <div className='flex items-center justify-center py-12'>
              <Loader2 className='h-8 w-8 animate-spin text-primary' />
            </div>
          ) : filteredOrders.length === 0 ? (
            <div className='text-center py-12'>
              <Package className='h-16 w-16 mx-auto mb-4 text-muted-foreground' />
              <p className='text-muted-foreground'>لا توجد طلبات</p>
            </div>
          ) : (
            <>
              {/* Desktop Table */}
              <div className='hidden md:block overflow-x-auto'>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className='text-right'>رقم الطلب</TableHead>
                      <TableHead className='text-right'>العميل</TableHead>
                      <TableHead className='text-center'>المبلغ</TableHead>
                      <TableHead className='text-center'>طريقة الدفع</TableHead>
                      <TableHead className='text-center'>حالة الدفع</TableHead>
                      <TableHead className='text-center'>الحالة</TableHead>
                      <TableHead className='text-center'>التاريخ</TableHead>
                      <TableHead className='text-left'>الإجراءات</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredOrders.map((order) => (
                      <TableRow key={order._id}>
                        <TableCell className='text-right font-medium'>
                          #{order._id.slice(-6)}
                        </TableCell>
                        <TableCell className='text-right'>
                          <div className='flex items-center gap-3'>
                            <Avatar className='h-8 w-8'>
                              <AvatarImage src={order.user?.profileImg} />
                              <AvatarFallback>
                                {order.user?.name?.charAt(0) || 'U'}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <p className='font-medium text-sm'>
                                {order.user?.name || 'غير معروف'}
                              </p>
                              <p className='text-xs text-muted-foreground'>
                                {order.user?.email}
                              </p>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell className='text-center font-semibold'>
                          {formatPrice(order.totalOrderPrice || 0)}
                        </TableCell>
                        <TableCell className='text-center'>
                          <Badge variant='outline'>
                            {order.paymentMethodType === 'cash' ? 'نقدي' : 'بطاقة'}
                          </Badge>
                        </TableCell>
                        <TableCell className='text-center'>
                          {order.isPaid ? (
                            <Badge className='bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'>
                              مدفوع
                            </Badge>
                          ) : (
                            <Badge variant='secondary'>غير مدفوع</Badge>
                          )}
                        </TableCell>
                        <TableCell className='text-center'>
                          {getStatusBadge(order.status || 'pending')}
                        </TableCell>
                        <TableCell className='text-center text-sm'>
                          {new Date(order.createdAt).toLocaleDateString('ar-EG', {
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric',
                          })}
                        </TableCell>
                        <TableCell className='text-left'>
                          <Link href={`/admin/orders/${order._id}`}>
                            <Button variant='ghost' size='icon'>
                              <Eye className='h-4 w-4' />
                            </Button>
                          </Link>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              {/* Mobile Cards */}
              <div className='md:hidden divide-y'>
                {filteredOrders.map((order) => (
                  <div key={order._id} className='p-4 space-y-3'>
                    <div className='flex items-center justify-between'>
                      <div className='flex items-center gap-2'>
                        <Avatar className='h-10 w-10'>
                          <AvatarImage src={order.user?.profileImg} />
                          <AvatarFallback>
                            {order.user?.name?.charAt(0) || 'U'}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className='font-semibold text-sm'>
                            {order.user?.name || 'غير معروف'}
                          </p>
                          <p className='text-xs text-muted-foreground'>
                            #{order._id.slice(-6)}
                          </p>
                        </div>
                      </div>
                      <Link href={`/admin/orders/${order._id}`}>
                        <Button variant='ghost' size='icon'>
                          <Eye className='h-4 w-4' />
                        </Button>
                      </Link>
                    </div>

                    <div className='flex items-center justify-between'>
                      <span className='text-xs text-muted-foreground'>المبلغ:</span>
                      <span className='font-bold text-primary'>
                        {formatPrice(order.totalOrderPrice || 0)}
                      </span>
                    </div>

                    <div className='flex items-center justify-between'>
                      <span className='text-xs text-muted-foreground'>الحالة:</span>
                      {getStatusBadge(order.status || 'pending')}
                    </div>

                    <div className='flex items-center gap-2 flex-wrap'>
                      {order.isPaid ? (
                        <Badge className='bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400 text-xs'>
                          مدفوع
                        </Badge>
                      ) : (
                        <Badge variant='secondary' className='text-xs'>
                          غير مدفوع
                        </Badge>
                      )}
                      <Badge variant='outline' className='text-xs'>
                        {order.paymentMethodType === 'cash' ? 'نقدي' : 'بطاقة'}
                      </Badge>
                      <span className='text-xs text-muted-foreground mr-auto'>
                        {new Date(order.createdAt).toLocaleDateString('ar-EG')}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  )
}