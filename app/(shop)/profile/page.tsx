'use client'

import type React from 'react'
import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import {
  Camera,
  Mail,
  Phone,
  Calendar,
  ShoppingBag,
  Heart,
  MapPin,
  Award,
  UserIcon,
  Loader2,
  Shield,
} from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { PersonalInfoForm } from '@/components/profile/PersonalInfoForm'
import { PasswordChangeForm } from '@/components/profile/PasswordChangeForm'
import { useAuth } from '@/contexts/AuthContext'
import { Skeleton } from '@/components/ui/skeleton'
import { Badge } from '@/components/ui/badge'
import { toast } from 'sonner'
import { ordersAPI } from '@/lib/api'
import { useLanguage } from '@/contexts/LanguageContext'

export default function ProfilePage() {
  const { user, loading } = useAuth()
  const { t, language } = useLanguage()
  const [profileImage, setProfileImage] = useState('')
  const [ordersCount, setOrdersCount] = useState(0)
  const [loadingOrders, setLoadingOrders] = useState(true)

  useEffect(() => {
    if (user?.profileImg) {
      setProfileImage(user.profileImg)
    }
  }, [user])

  useEffect(() => {
    if (user) {
      fetchOrdersCount()
    }
  }, [user])

  const fetchOrdersCount = async () => {
    try {
      setLoadingOrders(true)
      const orders = await ordersAPI.getUserOrders()
      setOrdersCount(Array.isArray(orders) ? orders.length : 0)
    } catch (error) {
      console.error('Failed to fetch orders count:', error)
      setOrdersCount(0)
    } finally {
      setLoadingOrders(false)
    }
  }

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast.error('حجم الصورة يجب أن يكون أقل من 5 ميجابايت')
        return
      }

      if (!file.type.startsWith('image/')) {
        toast.error('يرجى اختيار صورة صالحة')
        return
      }

      const reader = new FileReader()
      reader.onloadend = () => {
        setProfileImage(reader.result as string)
        toast.success('تم تحميل الصورة بنجاح! ✨')
      }
      reader.readAsDataURL(file)
    }
  }

  if (loading) {
    return <ProfileSkeleton />
  }

  if (!user) {
    return (
      <Card className='dark:bg-gray-800 dark:border-gray-700'>
        <CardContent className='pt-6 text-center py-12'>
          <p className='text-muted-foreground'>الرجاء تسجيل الدخول</p>
        </CardContent>
      </Card>
    )
  }

  const joinDate = user.createdAt
    ? new Date(user.createdAt).toLocaleDateString(
        language === 'ar' ? 'ar-EG' : 'en-US',
        {
          year: 'numeric',
          month: 'long',
        }
      )
    : 'غير محدد'

  return (
    <div className='space-y-4 sm:space-y-6'>
      {/* Profile Header */}
      <Card className='border-0 shadow-sm dark:bg-gray-800 dark:border-gray-700'>
        <CardContent className='p-4 sm:p-6 md:p-8'>
          <div className='flex flex-col md:flex-row gap-6 sm:gap-8'>
            {/* Profile Image */}
            <div className='flex flex-col items-center md:items-start gap-4'>
              <div className='relative group'>
                <Avatar className='h-24 w-24 sm:h-28 sm:w-28 md:h-32 md:w-32 border-4 border-white dark:border-gray-700 shadow-md ring-2 ring-gray-100 dark:ring-gray-600'>
                  <AvatarImage src={profileImage || user.profileImg} />
                  <AvatarFallback className='text-2xl sm:text-3xl md:text-4xl bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-700 dark:to-gray-800 text-gray-600 dark:text-gray-300'>
                    {user.name.charAt(0)}
                  </AvatarFallback>
                </Avatar>
                <label
                  htmlFor='profile-image'
                  className='absolute inset-0 flex items-center justify-center bg-black/40 rounded-full opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer'
                  aria-label='تعديل الصورة'
                >
                  <Camera className='h-6 w-6 sm:h-8 sm:w-8 text-white' />
                </label>
                <input
                  id='profile-image'
                  type='file'
                  accept='image/*'
                  className='hidden'
                  onChange={handleImageChange}
                />
                {user.active && (
                  <div className='absolute bottom-2 right-2 h-3 w-3 sm:h-4 sm:w-4 bg-green-500 border-2 border-white dark:border-gray-800 rounded-full'></div>
                )}
              </div>
              {user.role === 'admin' && (
                <Badge className='bg-purple-100 text-purple-700 border-purple-200 dark:bg-purple-900/30 dark:text-purple-300 dark:border-purple-800 text-xs sm:text-sm'>
                  <Shield className='h-3 w-3 mr-1' />
                  مدير
                </Badge>
              )}
            </div>

            {/* User Info */}
            <div className='flex-1 space-y-4 sm:space-y-6'>
              <div>
                <h2 className='text-2xl sm:text-3xl font-bold text-gray-900 dark:text-gray-100 mb-1'>
                  {user.name}
                </h2>
                <p className='text-sm sm:text-base text-gray-500 dark:text-gray-400 flex items-center gap-2'>
                  <Calendar className='h-4 w-4' />
                  عضو منذ {joinDate}
                </p>
              </div>

              <div className='grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4'>
                <div className='flex items-start gap-3 p-3 sm:p-4 bg-gray-50 dark:bg-gray-700 rounded-xl border border-gray-100 dark:border-gray-600'>
                  <div className='w-9 h-9 sm:w-10 sm:h-10 rounded-lg bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center flex-shrink-0'>
                    <Mail className='h-4 w-4 sm:h-5 sm:w-5 text-blue-600 dark:text-blue-400' />
                  </div>
                  <div className='min-w-0 flex-1'>
                    <p className='text-xs text-gray-500 dark:text-gray-400 mb-1'>
                      البريد الإلكتروني
                    </p>
                    <p className='text-xs sm:text-sm font-medium text-gray-900 dark:text-gray-100 truncate'>
                      {user.email}
                    </p>
                  </div>
                </div>

                {user.phone && (
                  <div className='flex items-start gap-3 p-3 sm:p-4 bg-gray-50 dark:bg-gray-700 rounded-xl border border-gray-100 dark:border-gray-600'>
                    <div className='w-9 h-9 sm:w-10 sm:h-10 rounded-lg bg-green-100 dark:bg-green-900/30 flex items-center justify-center flex-shrink-0'>
                      <Phone className='h-4 w-4 sm:h-5 sm:w-5 text-green-600 dark:text-green-400' />
                    </div>
                    <div className='min-w-0 flex-1'>
                      <p className='text-xs text-gray-500 dark:text-gray-400 mb-1'>
                        رقم الهاتف
                      </p>
                      <p className='text-xs sm:text-sm font-medium text-gray-900 dark:text-gray-100'>
                        {user.phone}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Statistics Cards */}
      <div className='grid grid-cols-2 sm:grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4'>
        <StatCard
          icon={<ShoppingBag />}
          label={t('myOrders')}
          value={loadingOrders ? '...' : ordersCount}
          color='blue'
          loading={loadingOrders}
          t={t}
        />
        <StatCard
          icon={<Heart />}
          label={t('wishlist')}
          value={user.wishlist?.length || 0}
          color='pink'
          t={t}
        />
        <StatCard
          icon={<MapPin />}
          label={t('myAddresses')}
          value={user.addresses?.length || 0}
          color='purple'
          t={t}
        />
        <StatCard
          icon={<Award />}
          label={t('rating') || 'التقييم'}
          value='0'
          color='amber'
          t={t}
        />
      </div>

      {/* Tabs */}
      <Tabs defaultValue='info' className='w-full'>
        <TabsList className='w-full bg-gray-100 dark:bg-gray-800 p-1 rounded-xl grid grid-cols-2'>
          <TabsTrigger
            value='info'
            className='flex-1 data-[state=active]:bg-white dark:data-[state=active]:bg-gray-700 data-[state=active]:shadow-sm rounded-lg py-2 sm:py-2.5 text-xs sm:text-sm'
          >
            <UserIcon className='h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2' />
            {t('personalInfo')}
          </TabsTrigger>
          <TabsTrigger
            value='password'
            className='flex-1 data-[state=active]:bg-white dark:data-[state=active]:bg-gray-700 data-[state=active]:shadow-sm rounded-lg py-2 sm:py-2.5 text-xs sm:text-sm'
          >
            <Shield className='h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2' />
            {t('changePassword')}
          </TabsTrigger>
        </TabsList>

        <TabsContent value='info' className='mt-4 sm:mt-6'>
          <PersonalInfoForm />
        </TabsContent>

        <TabsContent value='password' className='mt-4 sm:mt-6'>
          <PasswordChangeForm />
        </TabsContent>
      </Tabs>
    </div>
  )
}

function StatCard({
  icon,
  label,
  value,
  color,
  loading = false,
  t,
}: {
  icon: React.ReactNode
  label: string
  value: string | number
  color: 'blue' | 'pink' | 'purple' | 'amber'
  loading?: boolean
  t: any // ✅ تم التعديل هنا ليكون any بدلاً من النوع المعقد لتجنب الخطأ
}) {
  const colorConfig = {
    blue: {
      gradient: 'from-blue-500 to-blue-600',
      bg: 'bg-blue-50 dark:bg-blue-900/20',
      text: 'text-blue-600 dark:text-blue-400',
    },
    pink: {
      gradient: 'from-pink-500 to-pink-600',
      bg: 'bg-pink-50 dark:bg-pink-900/20',
      text: 'text-pink-600 dark:text-pink-400',
    },
    purple: {
      gradient: 'from-purple-500 to-purple-600',
      bg: 'bg-purple-50 dark:bg-purple-900/20',
      text: 'text-purple-600 dark:text-purple-400',
    },
    amber: {
      gradient: 'from-amber-500 to-amber-600',
      bg: 'bg-amber-50 dark:bg-amber-900/20',
      text: 'text-amber-600 dark:text-amber-400',
    },
  }

  const colors = colorConfig[color]

  return (
    <motion.div
      whileHover={{ y: -4, scale: 1.02 }}
      transition={{ duration: 0.2, ease: 'easeOut' }}
    >
      <Card className='border-0 shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden group relative dark:bg-gray-800 dark:border-gray-700'>
        <CardContent className='p-4 sm:p-6 relative z-10'>
          {/* Background Decoration */}
          <div
            className={`absolute top-0 right-0 w-24 h-24 sm:w-32 sm:h-32 bg-gradient-to-br ${colors.gradient} opacity-[0.03] dark:opacity-[0.05] rounded-bl-full transition-opacity group-hover:opacity-[0.08] dark:group-hover:opacity-[0.12]`}
          ></div>

          {/* Animated Icon */}
          <div className='relative mb-3 sm:mb-4'>
            <div
              className={`w-11 h-11 sm:w-12 sm:h-12 md:w-14 md:h-14 rounded-xl sm:rounded-2xl bg-gradient-to-br ${colors.gradient} flex items-center justify-center text-white shadow-lg group-hover:shadow-xl group-hover:scale-110 transition-all duration-300`}
            >
              <div className='[&>svg]:h-5 [&>svg]:w-5 sm:[&>svg]:h-6 sm:[&>svg]:w-6 md:[&>svg]:h-7 md:[&>svg]:w-7'>
                {icon}
              </div>
            </div>
            {/* Glow Effect */}
            <div
              className={`absolute inset-0 w-11 h-11 sm:w-12 sm:h-12 md:w-14 md:h-14 rounded-xl sm:rounded-2xl bg-gradient-to-br ${colors.gradient} blur-xl opacity-0 group-hover:opacity-30 transition-opacity duration-300`}
            ></div>
          </div>

          {/* Content */}
          <div className='space-y-1 sm:space-y-2'>
            <p className='text-xs sm:text-sm font-semibold text-gray-600 dark:text-gray-400 tracking-wide'>
              {label}
            </p>
            {loading ? (
              <div className='flex items-center gap-2'>
                <Loader2 className='h-5 w-5 sm:h-6 sm:w-6 animate-spin text-gray-400' />
                <span className='text-xs text-gray-400'>{t('loading')}</span>
              </div>
            ) : (
              <div className='flex items-end justify-between'>
                <p
                  className={`text-2xl sm:text-3xl md:text-4xl font-bold ${colors.text} transition-all group-hover:scale-105`}
                >
                  {value}
                </p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  )
}

// Loading Skeleton
function ProfileSkeleton() {
  return (
    <div className='space-y-6'>
      <Card className='border-0 shadow-sm'>
        <CardContent className='p-8'>
          <div className='flex flex-col md:flex-row gap-8'>
            <div className='flex flex-col items-center md:items-start gap-4'>
              <Skeleton className='h-32 w-32 rounded-full' />
              <Skeleton className='h-6 w-20 rounded-full' />
            </div>
            <div className='flex-1 space-y-6'>
              <div>
                <Skeleton className='h-8 w-48 mb-2' />
                <Skeleton className='h-5 w-32' />
              </div>
              <div className='grid md:grid-cols-2 gap-4'>
                <Skeleton className='h-20 w-full rounded-xl' />
                <Skeleton className='h-20 w-full rounded-xl' />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
      <div className='grid grid-cols-2 md:grid-cols-4 gap-4'>
        {[1, 2, 3, 4].map((i) => (
          <Skeleton key={i} className='h-40 w-full rounded-xl' />
        ))}
      </div>
    </div>
  )
}
