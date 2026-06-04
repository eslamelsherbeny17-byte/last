'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Eye, Download, Package, Loader2, ShoppingBag } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Separator } from '@/components/ui/separator'
import { formatPrice } from '@/lib/utils'
import { ordersAPI } from '@/lib/api'
import { useToast } from '@/lib/use-toast'
import { useLanguage } from '@/contexts/LanguageContext'

// ✅ تم تغيير نوع t إلى any لتجاوز خطأ تعارض الأنواع في Vercel
const getStatusBadge = (status: string, t: any) => {
  const statusConfig: Record<string, { label: string; className: string }> = {
    pending: {
      label: t('pending'),
      className:
        'bg-yellow-100 text-yellow-800 border-yellow-200 dark:bg-yellow-900/30 dark:text-yellow-300 dark:border-yellow-800',
    },
    processing: {
      label: t('processing'),
      className:
        'bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-900/30 dark:text-blue-300 dark:border-blue-800',
    },
    shipped: {
      label: t('shipped'),
      className:
        'bg-purple-100 text-purple-800 border-purple-200 dark:bg-purple-900/30 dark:text-purple-300 dark:border-purple-800',
    },
    delivered: {
      label: t('delivered'),
      className:
        'bg-green-100 text-green-800 border-green-200 dark:bg-green-900/30 dark:text-green-300 dark:border-green-800',
    },
    cancelled: {
      label: t('cancelled'),
      className:
        'bg-red-100 text-red-800 border-red-200 dark:bg-red-900/30 dark:text-red-300 dark:border-red-800',
    },
  }

  const config = statusConfig[status] || statusConfig.pending
  return (
    <Badge className={config.className} variant='outline'>
      {config.label}
    </Badge>
  )
}

export default function OrdersPage() {
  const { toast } = useToast()
  const { t } = useLanguage()

  const [orders, setOrders] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [filterStatus, setFilterStatus] = useState('all')

  useEffect(() => {
    fetchOrders()
  }, [])

  const fetchOrders = async () => {
    try {
      setLoading(true)
      const data = await ordersAPI.getUserOrders()
      setOrders(Array.isArray(data) ? data : [])
    } catch (error: any) {
      console.error('Failed to fetch orders:', error)
      toast({
        title: t('error'),
        description: t('pleaseTryAgain'),
        variant: 'destructive',
      })
      setOrders([])
    } finally {
      setLoading(false)
    }
  }

  const filteredOrders = orders.filter(
    (order) => filterStatus === 'all' || order.status === filterStatus
  )

  if (loading) {
    return (
      <div className='flex items-center justify-center min-h-[400px]'>
        <div className='text-center space-y-4'>
          <Loader2 className='h-10 w-10 sm:h-12 sm:w-12 animate-spin text-primary mx-auto' />
          <p className='text-sm sm:text-base text-muted-foreground'>
            {t('loading')}
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className='space-y-4 sm:space-y-6'>
      <div className='flex items-center justify-between flex-wrap gap-4'>
        <div>
          <h2 className='text-xl sm:text-2xl md:text-3xl font-bold dark:text-gray-100'>
            {t('myOrders')}
          </h2>
          <p className='text-sm sm:text-base text-muted-foreground mt-1'>
            {orders.length > 0
              ? `${orders.length} ${t('orders')}`
              : t('noResults')}
          </p>
        </div>
        <Select value={filterStatus} onValueChange={setFilterStatus}>
          <SelectTrigger className='w-full sm:w-[180px] dark:bg-gray-800 dark:border-gray-700'>
            <SelectValue placeholder={t('allCategories')} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value='all'>{t('allCategories')}</SelectItem>
            <SelectItem value='pending'>{t('pending')}</SelectItem>
            <SelectItem value='processing'>{t('processing')}</SelectItem>
            <SelectItem value='shipped'>{t('shipped')}</SelectItem>
            <SelectItem value='delivered'>{t('delivered')}</SelectItem>
            <SelectItem value='cancelled'>{t('cancelled')}</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {filteredOrders.length === 0 ? (
        <Card className='border-2 border-dashed dark:bg-gray-800 dark:border-gray-700'>
          <CardContent className='pt-10 pb-10 sm:pt-12 sm:pb-12 text-center px-4'>
            <div className='w-16 h-16 sm:w-20 sm:h-20 mx-auto mb-4 sm:mb-6 rounded-full bg-primary/10 dark:bg-primary/20 flex items-center justify-center'>
              <Package className='h-8 w-8 sm:h-10 sm:w-10 text-primary' />
            </div>
            <h3 className='text-lg sm:text-xl font-bold mb-2 dark:text-gray-100'>
              {t('noResults')}
            </h3>
            <p className='text-sm sm:text-base text-muted-foreground mb-6 sm:mb-8 max-w-md mx-auto'>
              {filterStatus === 'all' ? t('cartEmpty') : t('tryAgain')}
            </p>
            <Link href='/shop'>
              <Button
                className='gold-gradient text-sm sm:text-base h-11 sm:h-12'
                size='lg'
              >
                <ShoppingBag className='ml-2 h-4 w-4 sm:h-5 sm:w-5' />
                {t('startShopping')}
              </Button>
            </Link>
          </CardContent>
        </Card>
      ) : (
        <div className='space-y-4'>
          {filteredOrders.map((order) => {
            const itemsCount = order.cartItems?.length || 0
            const totalPrice = order.totalOrderPrice || 0

            return (
              <Card
                key={order._id}
                className='hover:shadow-lg transition-all duration-300 border-2 hover:border-primary/30 dark:bg-gray-800 dark:border-gray-700 dark:hover:border-primary/50'
              >
                <CardContent className='p-4 sm:p-6'>
                  <div className='flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4'>
                    <div className='space-y-2'>
                      <div className='flex items-center gap-2 sm:gap-3 flex-wrap'>
                        <h3 className='font-bold text-base sm:text-lg dark:text-gray-100'>
                          {t('orderNumber')} #
                          {order._id.slice(-8).toUpperCase()}
                        </h3>
                        {getStatusBadge(order.status || 'pending', t)}
                      </div>
                      <div className='flex items-center gap-2 text-xs sm:text-sm text-muted-foreground'>
                        <span>
                          📅{' '}
                          {new Date(order.createdAt).toLocaleDateString(
                            'ar-EG',
                            {
                              year: 'numeric',
                              month: 'long',
                              day: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit',
                            }
                          )}
                        </span>
                      </div>
                    </div>

                    <div className='flex items-center gap-2'>
                      <Link href={`/profile/orders/${order._id}`}>
                        <Button
                          variant='outline'
                          size='sm'
                          className='text-xs sm:text-sm h-9 sm:h-10 bg-transparent'
                        >
                          <Eye className='ml-2 h-3 w-3 sm:h-4 sm:w-4' />
                          {t('viewDetails')}
                        </Button>
                      </Link>
                      <Button
                        variant='outline'
                        size='sm'
                        className='text-xs sm:text-sm h-9 sm:h-10 bg-transparent'
                      >
                        <Download className='ml-2 h-3 w-3 sm:h-4 sm:w-4' />
                        {t('download')}
                      </Button>
                    </div>
                  </div>

                  <Separator className='my-4 dark:bg-gray-700' />

                  <div className='space-y-2 mb-4'>
                    {order.cartItems
                      ?.slice(0, 3)
                      .map((item: any, index: number) => {
                        const productTitle =
                          typeof item.product === 'object'
                            ? item.product?.title || t('product')
                            : t('product')

                        return (
                          <div
                            key={index}
                            className='flex justify-between text-xs sm:text-sm bg-gray-50 dark:bg-gray-700 p-2 sm:p-3 rounded-lg'
                          >
                            <span className='font-medium dark:text-gray-200'>
                              {productTitle} × {item.quantity}
                            </span>
                            <span className='font-bold text-primary'>
                              {formatPrice(item.price * item.quantity)}
                            </span>
                          </div>
                        )
                      })}
                    {itemsCount > 3 && (
                      <p className='text-xs sm:text-sm text-muted-foreground text-center'>
                        {t('and')} {itemsCount - 3} {t('products')}...
                      </p>
                    )}
                  </div>

                  <Separator className='my-4 dark:bg-gray-700' />

                  <div className='flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 sm:gap-4'>
                    <div className='flex items-center gap-2 sm:gap-4 text-xs sm:text-sm flex-wrap'>
                      <span className='text-muted-foreground'>
                        📦 {itemsCount} {t('product')}
                      </span>
                      <span className='text-muted-foreground'>•</span>
                      <span>
                        {order.isPaid ? (
                          <Badge className='bg-green-100 text-green-800 border-green-200 dark:bg-green-900/30 dark:text-green-300 dark:border-green-800 text-xs'>
                            ✓ {t('success')}
                          </Badge>
                        ) : (
                          <Badge
                            variant='secondary'
                            className='bg-orange-100 text-orange-800 border-orange-200 dark:bg-orange-900/30 dark:text-orange-300 dark:border-orange-800 text-xs'
                          >
                            ⏳ {t('pending')}
                          </Badge>
                        )}
                      </span>
                      <span className='text-muted-foreground'>•</span>
                      <span className='text-xs sm:text-sm'>
                        {order.paymentMethodType === 'cash'
                          ? '💵 نقدي'
                          : '💳 بطاقة'}
                      </span>
                    </div>
                    <div className='text-left sm:text-right w-full sm:w-auto'>
                      <p className='text-xs sm:text-sm text-muted-foreground mb-1'>
                        {t('total')}
                      </p>
                      <p className='text-xl sm:text-2xl font-bold text-primary'>
                        {formatPrice(totalPrice)}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}
    </div>
  )
}
