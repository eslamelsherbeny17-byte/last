'use client'

import { useState, useEffect, useMemo } from 'react'
import {
  Plus,
  Edit,
  Trash2,
  MapPin,
  Home,
  Briefcase,
  Loader2,
} from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { useToast } from '@/lib/use-toast'
import { addressesAPI } from '@/lib/api'

interface Address {
  _id: string
  alias: string
  details: string
  phone: string
  city: string
  postalCode?: string
}

const getAddressIcon = (alias: string) => {
  switch (alias) {
    case 'home':
      return <Home className='h-5 w-5' />
    case 'work':
      return <Briefcase className='h-5 w-5' />
    default:
      return <MapPin className='h-5 w-5' />
  }
}

const getAddressLabel = (alias: string) => {
  switch (alias) {
    case 'home':
      return 'المنزل'
    case 'work':
      return 'العمل'
    default:
      return 'آخر'
  }
}

export default function AddressesPage() {
  const [addresses, setAddresses] = useState<Address[]>([])
  const [loading, setLoading] = useState(true)
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [editingAddress, setEditingAddress] = useState<Address | null>(null)
  const { toast } = useToast()

  // ✅ استخراج المدن المستخدمة سابقاً
  const usedCities = useMemo(() => {
    const cities = addresses.map((addr) => addr.city)
    return Array.from(new Set(cities)) // إزالة التكرار
  }, [addresses])

  useEffect(() => {
    fetchAddresses()
  }, [])

  const fetchAddresses = async () => {
    try {
      setLoading(true)
      const data = await addressesAPI.getAll()
      console.log('📍 Loaded addresses:', data)
      setAddresses(data || [])
    } catch (error: any) {
      console.error('❌ Fetch error:', error)
      toast({
        title: '❌ خطأ',
        description: 'فشل تحميل العناوين',
        variant: 'destructive',
      })
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('هل أنت متأكد من حذف هذا العنوان؟')) return

    try {
      await addressesAPI.delete(id)

      toast({
        title: '✓ تم الحذف',
        description: 'تم حذف العنوان بنجاح',
      })

      setAddresses(addresses.filter((addr) => addr._id !== id))
    } catch (error: any) {
      console.error('❌ Delete error:', error)
      toast({
        title: '❌ خطأ',
        description: error.message || 'فشل حذف العنوان',
        variant: 'destructive',
      })
    }
  }

  const handleEdit = (address: Address) => {
    console.log('✏️ Edit button clicked for:', address)
    setEditingAddress(address)
    setIsEditDialogOpen(true)
  }

  const handleAddSuccess = async () => {
    setIsAddDialogOpen(false)
    await fetchAddresses()

    toast({
      title: '✓ تمت الإضافة',
      description: 'تم إضافة العنوان بنجاح',
    })
  }

  const handleEditSuccess = async () => {
    setIsEditDialogOpen(false)
    setEditingAddress(null)
    await fetchAddresses()

    toast({
      title: '✓ تم التعديل',
      description: 'تم تعديل العنوان بنجاح',
    })
  }

  if (loading) {
    return (
      <div className='flex items-center justify-center py-12'>
        <Loader2 className='h-8 w-8 animate-spin text-primary' />
      </div>
    )
  }

  return (
    <div className='space-y-6'>
      <div className='flex items-center justify-between'>
        <div>
          <h2 className='text-2xl font-bold'>عناويني</h2>
          <p className='text-sm text-muted-foreground mt-1'>
            إدارة عناوين التوصيل الخاصة بك
          </p>
        </div>

        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button className='gold-gradient'>
              <Plus className='ml-2 h-4 w-4' />
              إضافة عنوان جديد
            </Button>
          </DialogTrigger>
          <DialogContent className='max-w-2xl max-h-[90vh] overflow-y-auto'>
            <DialogHeader>
              <DialogTitle className='text-xl'>إضافة عنوان جديد</DialogTitle>
            </DialogHeader>
            <AddressForm
              onSuccess={handleAddSuccess}
              onCancel={() => setIsAddDialogOpen(false)}
              citySuggestions={usedCities}
            />
          </DialogContent>
        </Dialog>
      </div>

      {addresses.length === 0 ? (
        <Card>
          <CardContent className='pt-6 text-center py-12'>
            <div className='w-20 h-20 mx-auto mb-4 rounded-full bg-primary/10 flex items-center justify-center'>
              <MapPin className='h-10 w-10 text-primary' />
            </div>
            <h3 className='text-lg font-semibold mb-2'>لا توجد عناوين</h3>
            <p className='text-muted-foreground mb-6'>
              أضف عنوان توصيل لتسهيل عملية الشراء
            </p>
            <Button
              className='gold-gradient'
              onClick={() => setIsAddDialogOpen(true)}
            >
              <Plus className='ml-2 h-4 w-4' />
              إضافة عنوان
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className='grid md:grid-cols-2 lg:grid-cols-3 gap-4'>
          {addresses.map((address) => (
            <Card
              key={address._id}
              className='relative hover:shadow-lg transition-all border-2 hover:border-primary/30 group'
            >
              <CardContent className='pt-6'>
                <div className='flex items-start gap-3 mb-4'>
                  <div className='w-12 h-12 rounded-xl bg-gradient-to-br from-primary/20 to-primary/10 flex items-center justify-center text-primary group-hover:scale-110 transition-transform'>
                    {getAddressIcon(address.alias)}
                  </div>
                  <div className='flex-1'>
                    <Badge variant='secondary' className='mb-2'>
                      {getAddressLabel(address.alias)}
                    </Badge>
                    <h3 className='font-bold text-lg'>{address.city}</h3>
                  </div>
                </div>

                <div className='space-y-3 text-sm mb-4'>
                  <div className='flex items-start gap-2 p-2 bg-secondary/50 rounded-lg'>
                    <MapPin className='h-4 w-4 text-primary mt-0.5 flex-shrink-0' />
                    <p className='text-foreground line-clamp-2'>
                      {address.details}
                    </p>
                  </div>

                  <div className='flex items-center gap-2 text-muted-foreground'>
                    <div className='w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center'>
                      📞
                    </div>
                    <p className='font-medium'>{address.phone}</p>
                  </div>

                  {address.postalCode && (
                    <div className='flex items-center gap-2 text-muted-foreground'>
                      <div className='w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center'>
                        📮
                      </div>
                      <p>{address.postalCode}</p>
                    </div>
                  )}
                </div>

                <div className='flex gap-2 pt-4 border-t'>
                  <Button
                    variant='outline'
                    size='sm'
                    className='flex-1 hover:bg-primary hover:text-white transition-colors'
                    onClick={() => handleEdit(address)}
                  >
                    <Edit className='h-4 w-4 ml-1' />
                    تعديل
                  </Button>
                  <Button
                    variant='outline'
                    size='sm'
                    className='hover:bg-destructive hover:text-white transition-colors'
                    onClick={() => handleDelete(address._id)}
                  >
                    <Trash2 className='h-4 w-4' />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Dialog التعديل */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className='max-w-2xl max-h-[90vh] overflow-y-auto'>
          <DialogHeader>
            <DialogTitle className='text-xl'>تعديل العنوان</DialogTitle>
          </DialogHeader>
          {editingAddress && (
            <AddressForm
              key={`edit-${editingAddress._id}`}
              initialData={editingAddress}
              onSuccess={handleEditSuccess}
              onCancel={() => {
                setIsEditDialogOpen(false)
                setEditingAddress(null)
              }}
              isEditing={true}
              citySuggestions={usedCities}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}

// ✅ النموذج مع اقتراحات المدن
function AddressForm({
  initialData,
  onSuccess,
  onCancel,
  isEditing = false,
  citySuggestions = [],
}: {
  initialData?: Address
  onSuccess: () => void
  onCancel: () => void
  isEditing?: boolean
  citySuggestions?: string[]
}) {
  const [loading, setLoading] = useState(false)
  const { toast } = useToast()

  const [formData, setFormData] = useState({
    alias: initialData?.alias || 'home',
    city: initialData?.city || '',
    phone: initialData?.phone || '',
    postalCode: initialData?.postalCode || '',
    details: initialData?.details || '',
  })

  const [showCitySuggestions, setShowCitySuggestions] = useState(false)
  const [filteredCities, setFilteredCities] = useState<string[]>([])

  useEffect(() => {
    if (initialData) {
      console.log('📝 Form initialized with:', initialData)
      setFormData({
        alias: initialData.alias,
        city: initialData.city,
        phone: initialData.phone,
        postalCode: initialData.postalCode || '',
        details: initialData.details,
      })
    }
  }, [initialData])

  const handleCityChange = (value: string) => {
    setFormData({ ...formData, city: value })

    // تصفية المدن بناءً على النص المدخل
    if (value.length > 0 && citySuggestions.length > 0) {
      const filtered = citySuggestions.filter((city) => city.includes(value))
      setFilteredCities(filtered)
      setShowCitySuggestions(filtered.length > 0)
    } else {
      setShowCitySuggestions(false)
    }
  }

  const selectCity = (city: string) => {
    setFormData({ ...formData, city })
    setShowCitySuggestions(false)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    // التحقق من البيانات
    if (!formData.city.trim()) {
      toast({
        title: '⚠️ تنبيه',
        description: 'الرجاء إدخال اسم المدينة',
        variant: 'destructive',
      })
      return
    }

    if (!formData.phone.trim()) {
      toast({
        title: '⚠️ تنبيه',
        description: 'الرجاء إدخال رقم الهاتف',
        variant: 'destructive',
      })
      return
    }

    const phoneRegex = /^(010|011|012|015)\d{8}$/
    if (!phoneRegex.test(formData.phone.replace(/\s/g, ''))) {
      toast({
        title: '⚠️ تنبيه',
        description:
          'رقم الهاتف غير صحيح. يجب أن يبدأ بـ 010 أو 011 أو 012 أو 015',
        variant: 'destructive',
      })
      return
    }

    if (!formData.details.trim()) {
      toast({
        title: '⚠️ تنبيه',
        description: 'الرجاء إدخال تفاصيل العنوان',
        variant: 'destructive',
      })
      return
    }

    setLoading(true)

    try {
      const cleanData = {
        alias: formData.alias,
        city: formData.city.trim(),
        phone: formData.phone.trim(),
        postalCode: formData.postalCode?.trim() || '',
        details: formData.details.trim(),
      }

      console.log('📤 Submitting form:', {
        isEditing,
        addressId: initialData?._id,
        formData: cleanData,
      })

      if (isEditing && initialData?._id) {
        console.log('🔄 Calling update API for ID:', initialData._id)
        const result = await addressesAPI.update(initialData._id, cleanData)
        console.log('✅ Update successful:', result)
      } else {
        console.log('➕ Calling add API')
        const result = await addressesAPI.add(cleanData)
        console.log('✅ Add successful:', result)
      }

      onSuccess()
    } catch (error: any) {
      console.error('❌ Submit error:', error)

      toast({
        title: '❌ خطأ',
        description: error.message || 'حدث خطأ غير متوقع',
        variant: 'destructive',
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className='space-y-5'>
      {/* نوع العنوان */}
      <div className='space-y-2'>
        <Label className='text-base font-semibold'>نوع العنوان</Label>
        <Select
          value={formData.alias}
          onValueChange={(value) => setFormData({ ...formData, alias: value })}
        >
          <SelectTrigger className='h-12'>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value='home'>
              <div className='flex items-center gap-2'>
                <Home className='h-4 w-4' />
                المنزل
              </div>
            </SelectItem>
            <SelectItem value='work'>
              <div className='flex items-center gap-2'>
                <Briefcase className='h-4 w-4' />
                العمل
              </div>
            </SelectItem>
            <SelectItem value='other'>
              <div className='flex items-center gap-2'>
                <MapPin className='h-4 w-4' />
                آخر
              </div>
            </SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className='grid md:grid-cols-2 gap-4'>
        {/* المدينة مع اقتراحات */}
        <div className='space-y-2 relative'>
          <Label className='text-base font-semibold'>المدينة *</Label>
          <Input
            placeholder='القاهرة'
            required
            value={formData.city}
            onChange={(e) => handleCityChange(e.target.value)}
            onFocus={() => {
              if (citySuggestions.length > 0) {
                setFilteredCities(citySuggestions)
                setShowCitySuggestions(true)
              }
            }}
            onBlur={() => {
              // تأخير الإخفاء عشان المستخدم يقدر يضغط على الاقتراح
              setTimeout(() => setShowCitySuggestions(false), 200)
            }}
            className='h-12'
          />

          {/* اقتراحات المدن */}
          {showCitySuggestions && filteredCities.length > 0 && (
            <div className='absolute z-50 w-full mt-1 bg-white border rounded-lg shadow-lg max-h-48 overflow-y-auto'>
              {filteredCities.map((city) => (
                <button
                  key={city}
                  type='button'
                  onClick={() => selectCity(city)}
                  className='w-full px-4 py-2 text-right hover:bg-primary/10 transition-colors flex items-center gap-2'
                >
                  <MapPin className='h-4 w-4 text-primary' />
                  {city}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* رقم الهاتف */}
        <div className='space-y-2'>
          <Label className='text-base font-semibold'>رقم الهاتف *</Label>
          <Input
            type='tel'
            placeholder='01012345678'
            required
            value={formData.phone}
            onChange={(e) => {
              const value = e.target.value.replace(/\D/g, '')
              setFormData({ ...formData, phone: value })
            }}
            maxLength={11}
            className='h-12'
            dir='ltr'
          />
          <p className='text-xs text-muted-foreground'>
            يبدأ بـ 010 أو 011 أو 012 أو 015
          </p>
        </div>
      </div>

      {/* الرمز البريدي */}
      <div className='space-y-2'>
        <Label className='text-base font-semibold'>
          الرمز البريدي{' '}
          <span className='text-muted-foreground text-sm'>(اختياري)</span>
        </Label>
        <Input
          placeholder='12345'
          value={formData.postalCode}
          onChange={(e) => {
            const value = e.target.value.replace(/\D/g, '')
            setFormData({ ...formData, postalCode: value })
          }}
          maxLength={5}
          className='h-12'
          dir='ltr'
        />
      </div>

      {/* العنوان بالتفصيل */}
      <div className='space-y-2'>
        <Label className='text-base font-semibold'>العنوان بالتفصيل *</Label>
        <Textarea
          required
          rows={4}
          placeholder='الحي، الشارع، رقم المبنى، الدور، رقم الشقة'
          value={formData.details}
          onChange={(e) =>
            setFormData({ ...formData, details: e.target.value })
          }
          className='resize-none'
        />
        <p className='text-xs text-muted-foreground'>
          💡 اكتب عنوانك بالتفصيل لتسهيل عملية التوصيل
        </p>
      </div>

      {/* الأزرار */}
      <div className='flex gap-3 pt-4'>
        <Button
          type='button'
          variant='outline'
          onClick={onCancel}
          disabled={loading}
          className='flex-1 h-12'
        >
          إلغاء
        </Button>
        <Button
          type='submit'
          className='gold-gradient flex-1 h-12'
          disabled={loading}
        >
          {loading ? (
            <>
              <Loader2 className='ml-2 h-5 w-5 animate-spin' />
              {isEditing ? 'جاري الحفظ...' : 'جاري الإضافة...'}
            </>
          ) : (
            <>
              {isEditing ? (
                <>
                  <Edit className='ml-2 h-5 w-5' />
                  حفظ التعديلات
                </>
              ) : (
                <>
                  <Plus className='ml-2 h-5 w-5' />
                  إضافة العنوان
                </>
              )}
            </>
          )}
        </Button>
      </div>
    </form>
  )
}
