// app/admin/reviews/page.tsx
'use client'

import { useState, useEffect } from 'react'
import { Star, Trash2, Loader2, MessageSquare, TrendingUp, AlertCircle } from 'lucide-react'
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
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { adminReviewsAPI } from '@/lib/admin-api'
import { cn } from '@/lib/utils'
import Link from 'next/link'
import { useToast } from '@/lib/use-toast'
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

export default function ReviewsManagement() {
  const { toast } = useToast()
  const [reviews, setReviews] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [filterRating, setFilterRating] = useState('all')
  const [reviewToDelete, setReviewToDelete] = useState<string | null>(null)

  useEffect(() => {
    fetchReviews()
  }, [filterRating])

  const fetchReviews = async () => {
    try {
      setLoading(true)
      const params: any = {}
      if (filterRating !== 'all') params.ratings = filterRating

      const response = await adminReviewsAPI.getAll(params)
      setReviews(response.data || [])
    } catch (error) {
      console.error('Failed to fetch reviews:', error)
      toast({
        title: '❌ خطأ',
        description: 'فشل تحميل التقييمات',
        variant: 'destructive',
      })
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteConfirm = async () => {
    if (!reviewToDelete) return
    try {
      await adminReviewsAPI.delete(reviewToDelete)
      toast({ title: '✅ تم الحذف', description: 'تم حذف التقييم بنجاح' })
      fetchReviews()
    } catch (error: any) {
      toast({
        title: '❌ خطأ',
        description: error.response?.data?.message || 'فشل حذف التقييم',
        variant: 'destructive',
      })
    } finally {
      setReviewToDelete(null)
    }
  }

  const avgRating =
    reviews.length > 0
      ? (reviews.reduce((sum, r) => sum + (r.ratings || 0), 0) / reviews.length).toFixed(1)
      : '0'

  const ratingDistribution = [5, 4, 3, 2, 1].map((stars) => ({
    stars,
    count: reviews.filter((r) => r.ratings === stars).length,
    percentage:
      reviews.length > 0
        ? (reviews.filter((r) => r.ratings === stars).length / reviews.length) * 100
        : 0,
  }))

  return (
    <div className='space-y-4 sm:space-y-6 p-3 sm:p-4 md:p-6' dir="rtl">
      {/* Header */}
      <div>
        <h1 className='text-xl sm:text-2xl md:text-3xl font-bold bg-gradient-to-r from-amber-600 to-orange-600 bg-clip-text text-transparent'>
          إدارة التقييمات
        </h1>
        <p className='text-xs sm:text-sm text-muted-foreground mt-1'>
          إجمالي التقييمات: <span className='font-bold text-primary'>{reviews.length}</span>
        </p>
      </div>

      {/* Stats Cards */}
      <div className='grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4'>
        <Card className='border-0 shadow-lg hover:shadow-xl transition-shadow'>
          <CardContent className='p-4 sm:p-6'>
            <div className='flex items-center justify-between mb-4'>
              <div className='w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-white shadow-lg'>
                <MessageSquare className='h-6 w-6 sm:h-7 sm:w-7' />
              </div>
            </div>
            <p className='text-xs sm:text-sm font-semibold text-muted-foreground mb-2'>
              إجمالي التقييمات
            </p>
            <p className='text-3xl sm:text-4xl font-bold text-blue-600 dark:text-blue-400'>
              {reviews.length}
            </p>
          </CardContent>
        </Card>

        <Card className='border-0 shadow-lg hover:shadow-xl transition-shadow'>
          <CardContent className='p-4 sm:p-6'>
            <div className='flex items-center justify-between mb-4'>
              <div className='w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-gradient-to-br from-amber-500 to-amber-600 flex items-center justify-center text-white shadow-lg'>
                <Star className='h-6 w-6 sm:h-7 sm:w-7' />
              </div>
            </div>
            <p className='text-xs sm:text-sm font-semibold text-muted-foreground mb-2'>
              متوسط التقييم
            </p>
            <div className='flex items-center gap-2'>
              <p className='text-3xl sm:text-4xl font-bold text-amber-600 dark:text-amber-400'>
                {avgRating}
              </p>
              <div className='flex'>
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className={cn(
                      'h-4 w-4 sm:h-5 sm:w-5',
                      i < Math.floor(parseFloat(avgRating))
                        ? 'fill-amber-400 text-amber-400'
                        : 'text-gray-300 dark:text-gray-600'
                    )}
                  />
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className='border-0 shadow-lg hover:shadow-xl transition-shadow'>
          <CardContent className='p-4 sm:p-6'>
            <div className='flex items-center justify-between mb-4'>
              <div className='w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-gradient-to-br from-green-500 to-green-600 flex items-center justify-center text-white shadow-lg'>
                <TrendingUp className='h-6 w-6 sm:h-7 sm:w-7' />
              </div>
            </div>
            <p className='text-xs sm:text-sm font-semibold text-muted-foreground mb-2'>
              تقييمات 5 نجوم
            </p>
            <p className='text-3xl sm:text-4xl font-bold text-green-600 dark:text-green-400'>
              {reviews.filter((r) => r.ratings === 5).length}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Rating Distribution */}
      <Card className='border-0 shadow-sm'>
        <CardHeader>
          <CardTitle className='text-base sm:text-lg flex items-center gap-2'>
            📊 توزيع التقييمات
          </CardTitle>
        </CardHeader>
        <CardContent className='space-y-2 sm:space-y-3'>
          {ratingDistribution.map(({ stars, count, percentage }) => (
            <div key={stars} className='flex items-center gap-2 sm:gap-3'>
              <div className='flex items-center gap-1 w-16 sm:w-20'>
                <Star className='h-3 w-3 sm:h-4 sm:w-4 fill-amber-400 text-amber-400' />
                <span className='font-semibold text-sm'>{stars}</span>
                <span className='text-muted-foreground text-xs hidden sm:inline'>نجوم</span>
              </div>
              <div className='flex-1 h-2 sm:h-3 bg-secondary rounded-full overflow-hidden'>
                <div
                  className='h-full bg-gradient-to-r from-amber-400 to-amber-500 transition-all duration-500'
                  style={{ width: `${percentage}%` }}
                />
              </div>
              <span className='text-xs sm:text-sm font-semibold w-12 sm:w-16 text-right'>
                {count} <span className='hidden xs:inline'>({percentage.toFixed(0)}%)</span>
              </span>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Filters */}
      <Card className='border-0 shadow-sm'>
        <CardContent className='p-3 sm:p-4'>
          <div className='flex flex-col xs:flex-row items-start xs:items-center gap-2 sm:gap-3'>
            <span className='font-semibold text-xs sm:text-sm'>فلترة حسب:</span>
            <Select value={filterRating} onValueChange={setFilterRating}>
              <SelectTrigger className='w-full xs:w-[200px] h-9 sm:h-10'>
                <SelectValue placeholder='جميع التقييمات' />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value='all'>جميع التقييمات</SelectItem>
                <SelectItem value='5'>⭐⭐⭐⭐⭐ 5 نجوم</SelectItem>
                <SelectItem value='4'>⭐⭐⭐⭐ 4 نجوم</SelectItem>
                <SelectItem value='3'>⭐⭐⭐ 3 نجوم</SelectItem>
                <SelectItem value='2'>⭐⭐ 2 نجمة</SelectItem>
                <SelectItem value='1'>⭐ 1 نجمة</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Reviews */}
      <Card className='border-0 shadow-sm'>
        <CardContent className='p-0'>
          {loading ? (
            <div className='flex flex-col items-center justify-center py-16 gap-3'>
              <Loader2 className='h-10 w-10 animate-spin text-primary' />
              <p className='text-sm text-muted-foreground'>جاري التحميل...</p>
            </div>
          ) : reviews.length === 0 ? (
            <div className='flex flex-col items-center justify-center py-16 gap-3'>
              <MessageSquare className='h-16 w-16 text-muted-foreground/30' />
              <p className='text-muted-foreground font-medium'>لا توجد تقييمات</p>
            </div>
          ) : (
            <>
              {/* Desktop Table */}
              <div className='hidden md:block overflow-x-auto'>
                <Table>
                  <TableHeader>
                    <TableRow className='bg-muted/50'>
                      <TableHead className='text-right font-bold'>المستخدم</TableHead>
                      <TableHead className='text-right font-bold'>المنتج</TableHead>
                      <TableHead className='text-center font-bold'>التقييم</TableHead>
                      <TableHead className='text-right font-bold'>التعليق</TableHead>
                      <TableHead className='text-center font-bold'>التاريخ</TableHead>
                      <TableHead className='text-left font-bold'>إجراءات</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {reviews.map((review) => (
                      <TableRow key={review._id} className='hover:bg-accent/50'>
                        <TableCell className='text-right'>
                          <div className='flex items-center gap-3'>
                            <Avatar className='h-10 w-10 border-2 border-secondary'>
                              <AvatarImage src={review.user?.profileImg} />
                              <AvatarFallback className='bg-primary/10 text-primary font-bold'>
                                {review.user?.name?.charAt(0) || 'U'}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <p className='font-semibold text-sm'>{review.user?.name || 'مستخدم'}</p>
                              <p className='text-xs text-muted-foreground'>#{review.user?._id?.slice(-6)}</p>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell className='text-right'>
                          <Link
                            href={`/product/${review.product?._id || '#'}`}
                            className='hover:text-primary transition-colors font-medium line-clamp-2 max-w-xs text-sm'
                            target='_blank'
                          >
                            {review.product?.title || 'منتج محذوف'}
                          </Link>
                        </TableCell>
                        <TableCell className='text-center'>
                          <div className='flex items-center justify-center gap-2'>
                            <div className='flex items-center gap-0.5'>
                              {[...Array(5)].map((_, i) => (
                                <Star
                                  key={i}
                                  className={cn(
                                    'h-3.5 w-3.5',
                                    i < (review.ratings || 0)
                                      ? 'fill-amber-400 text-amber-400'
                                      : 'text-gray-300 dark:text-gray-600'
                                  )}
                                />
                              ))}
                            </div>
                            <Badge variant='secondary' className='font-bold text-xs'>
                              {review.ratings || 0}
                            </Badge>
                          </div>
                        </TableCell>
                        <TableCell className='text-right max-w-xs'>
                          <p className='line-clamp-2 text-xs text-muted-foreground'>
                            {review.title || 'بدون تعليق'}
                          </p>
                        </TableCell>
                        <TableCell className='text-center'>
                          <div className='text-xs'>
                            <p className='font-medium'>
                              {new Date(review.createdAt).toLocaleDateString('ar-EG')}
                            </p>
                            <p className='text-muted-foreground'>
                              {new Date(review.createdAt).toLocaleTimeString('ar-EG', {
                                hour: '2-digit',
                                minute: '2-digit',
                              })}
                            </p>
                          </div>
                        </TableCell>
                        <TableCell className='text-left'>
                          <Button
                            variant='ghost'
                            size='icon'
                            onClick={() => setReviewToDelete(review._id)}
                            className='hover:bg-destructive/10 hover:text-destructive'
                          >
                            <Trash2 className='h-4 w-4' />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              {/* Mobile Cards */}
              <div className='md:hidden divide-y'>
                {reviews.map((review) => (
                  <div key={review._id} className='p-3 sm:p-4 space-y-3'>
                    <div className='flex items-center gap-3'>
                      <Avatar className='h-10 w-10 sm:h-12 sm:w-12'>
                        <AvatarImage src={review.user?.profileImg} />
                        <AvatarFallback className='bg-primary/10 text-primary font-bold'>
                          {review.user?.name?.charAt(0) || 'U'}
                        </AvatarFallback>
                      </Avatar>
                      <div className='flex-1 min-w-0'>
                        <p className='font-semibold text-sm truncate'>
                          {review.user?.name || 'مستخدم'}
                        </p>
                        <div className='flex items-center gap-1 mt-1'>
                          {[...Array(5)].map((_, i) => (
                            <Star
                              key={i}
                              className={cn(
                                'h-3 w-3',
                                i < (review.ratings || 0)
                                  ? 'fill-amber-400 text-amber-400'
                                  : 'text-gray-300'
                              )}
                            />
                          ))}
                          <span className='text-xs text-muted-foreground mr-1'>
                            ({review.ratings || 0})
                          </span>
                        </div>
                      </div>
                      <Button
                        variant='ghost'
                        size='icon'
                        onClick={() => setReviewToDelete(review._id)}
                        className='flex-shrink-0 h-8 w-8'
                      >
                        <Trash2 className='h-3.5 w-3.5 text-destructive' />
                      </Button>
                    </div>

                    <p className='text-xs sm:text-sm text-muted-foreground line-clamp-2'>
                      {review.title || 'بدون تعليق'}
                    </p>

                    <div className='flex items-center justify-between text-xs text-muted-foreground'>
                      <span className='truncate max-w-[60%]'>
                        {review.product?.title || 'منتج محذوف'}
                      </span>
                      <span>{new Date(review.createdAt).toLocaleDateString('ar-EG')}</span>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {/* Delete Confirmation */}
      <AlertDialog open={!!reviewToDelete} onOpenChange={(open) => !open && setReviewToDelete(null)}>
        <AlertDialogContent className="w-[90vw] max-w-md">
          <AlertDialogHeader className="text-right">
            <div className="flex items-center justify-end gap-2 text-destructive mb-2">
              <AlertDialogTitle className='text-base sm:text-lg'>تأكيد الحذف</AlertDialogTitle>
              <AlertCircle className="h-5 w-5" />
            </div>
            <AlertDialogDescription className="text-right text-sm">
              هل أنت متأكد من حذف هذا التقييم؟ لا يمكن التراجع عن هذا الإجراء.
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