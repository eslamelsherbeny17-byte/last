'use client'

import { useState, useEffect } from 'react'
import { Save, Loader2, Facebook, Instagram, Twitter, MessageCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { Switch } from '@/components/ui/switch'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { useToast } from '@/lib/use-toast'
import { adminSettingsAPI } from '@/lib/admin-api'

export default function SettingsPage() {
  const { toast } = useToast()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [settings, setSettings] = useState({
    siteName: '',
    siteDescription: '',
    email: '',
    phone: '',
    address: '',
    freeShippingThreshold: '',
    shippingCost: '',
    taxRate: '',
    currency: '',
    maintenanceMode: false,
    emailNotifications: true,
    smsNotifications: false,
    acceptCashOnDelivery: true,
    // 👈 ضفنا روابط السوشيال ميديا هنا
   facebook: '',
    instagram: '',
    twitter: '',
    whatsapp: '',
  })

  useEffect(() => {
    fetchSettings()
  }, [])

  const fetchSettings = async () => {
    try {
      setLoading(true)
      const response = await adminSettingsAPI.get()
      if (response.data) {
        setSettings({ ...settings, ...response.data })
      }
    } catch (error) {
      console.error('Failed to fetch settings:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSave = async () => {
    setSaving(true)
    try {
      await adminSettingsAPI.update(settings)
      toast({ title: '✅ تم الحفظ', description: 'تم حفظ الإعدادات بنجاح' })
    } catch (error) {
      toast({ title: '❌ خطأ', description: 'فشل حفظ الإعدادات', variant: 'destructive' })
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className='flex items-center justify-center min-h-[60vh]'>
        <div className='flex flex-col items-center gap-3'>
          <Loader2 className='h-10 w-10 animate-spin text-primary' />
          <p className='text-sm text-muted-foreground'>جاري تحميل الإعدادات...</p>
        </div>
      </div>
    )
  }

  return (
    <div className='space-y-4 sm:space-y-6 max-w-4xl p-3 sm:p-4 md:p-6' dir="rtl">
      <div>
        <h1 className='text-xl sm:text-2xl md:text-3xl font-bold bg-gradient-to-r from-gray-700 to-gray-900 dark:from-gray-300 dark:to-gray-100 bg-clip-text text-transparent'>
          الإعدادات
        </h1>
        <p className='text-xs sm:text-sm text-muted-foreground mt-1'>إدارة إعدادات المتجر</p>
      </div>

      <Tabs defaultValue='general' className='space-y-4 sm:space-y-6'>
        <TabsList className='grid w-full grid-cols-3 sm:grid-cols-5 h-auto'>
          <TabsTrigger value='general' className='text-xs sm:text-sm'>عام</TabsTrigger>
          <TabsTrigger value='social' className='text-xs sm:text-sm'>التواصل</TabsTrigger> {/* 👈 تاب السوشيال */}
          <TabsTrigger value='shipping' className='text-xs sm:text-sm'>الشحن</TabsTrigger>
          <TabsTrigger value='notifications' className='text-xs sm:text-sm'>الإشعارات</TabsTrigger>
          <TabsTrigger value='advanced' className='text-xs sm:text-sm'>متقدم</TabsTrigger>
        </TabsList>

        {/* 1. General Settings */}
        <TabsContent value='general' className='space-y-4 sm:space-y-6'>
          <Card className='border-0 shadow-sm'>
            <CardHeader>
              <CardTitle className='text-base sm:text-lg'>معلومات المتجر</CardTitle>
            </CardHeader>
            <CardContent className='space-y-4'>
              <div className='space-y-2'>
                <Label htmlFor='siteName' className='text-sm font-semibold'>اسم المتجر</Label>
                <Input id='siteName' value={settings.siteName} onChange={(e) => setSettings({ ...settings, siteName: e.target.value })} className='h-10 sm:h-11' />
              </div>
              <div className='space-y-2'>
                <Label htmlFor='siteDescription' className='text-sm font-semibold'>وصف المتجر</Label>
                <Textarea id='siteDescription' value={settings.siteDescription} onChange={(e) => setSettings({ ...settings, siteDescription: e.target.value })} className='min-h-[80px] resize-none' />
              </div>
              <div className='grid sm:grid-cols-2 gap-4'>
                <div className='space-y-2'>
                  <Label htmlFor='email' className='text-sm font-semibold'>البريد الإلكتروني</Label>
                  <Input id='email' type='email' value={settings.email} onChange={(e) => setSettings({ ...settings, email: e.target.value })} className='h-10 sm:h-11 text-left' dir="ltr" />
                </div>
                <div className='space-y-2'>
                  <Label htmlFor='phone' className='text-sm font-semibold'>رقم الهاتف</Label>
                  <Input id='phone' value={settings.phone} onChange={(e) => setSettings({ ...settings, phone: e.target.value })} className='h-10 sm:h-11 text-left' dir="ltr" />
                </div>
              </div>
              <div className='space-y-2'>
                <Label htmlFor='address' className='text-sm font-semibold'>العنوان</Label>
                <Input id='address' value={settings.address} onChange={(e) => setSettings({ ...settings, address: e.target.value })} className='h-10 sm:h-11' />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* 2. Social Media Settings 👈 (تم إضافة هذا القسم) */}
        <TabsContent value='social' className='space-y-4 sm:space-y-6'>
          <Card className='border-0 shadow-sm'>
            <CardHeader>
              <CardTitle className='text-base sm:text-lg'>روابط التواصل الاجتماعي</CardTitle>
              <CardDescription className='text-xs sm:text-sm'>الروابط التي ستظهر في أسفل الموقع (Footer)</CardDescription>
            </CardHeader>
            <CardContent className='space-y-4'>
              <div className='space-y-2'>
                <Label className='text-sm font-semibold flex items-center gap-2'><Facebook className="w-4 h-4 text-blue-600"/> فيسبوك</Label>
                <Input placeholder='https://facebook.com/yourpage' value={settings.facebook} onChange={(e) => setSettings({ ...settings, facebook: e.target.value })} className='h-10 sm:h-11 text-left' dir="ltr" />
              </div>
              <div className='space-y-2'>
                <Label className='text-sm font-semibold flex items-center gap-2'><Instagram className="w-4 h-4 text-pink-600"/> انستجرام</Label>
                <Input placeholder='https://instagram.com/yourpage' value={settings.instagram} onChange={(e) => setSettings({ ...settings, instagram: e.target.value })} className='h-10 sm:h-11 text-left' dir="ltr" />
              </div>
              <div className='space-y-2'>
                <Label className='text-sm font-semibold flex items-center gap-2'><Twitter className="w-4 h-4 text-sky-500"/> تويتر (X)</Label>
                <Input placeholder='https://twitter.com/yourpage' value={settings.twitter} onChange={(e) => setSettings({ ...settings, twitter: e.target.value })} className='h-10 sm:h-11 text-left' dir="ltr" />
              </div>
              <div className='space-y-2'>
                <Label className='text-sm font-semibold flex items-center gap-2'><MessageCircle className="w-4 h-4 text-green-500"/> رقم واتساب</Label>
                <Input placeholder='+20123456789' value={settings.whatsapp} onChange={(e) => setSettings({ ...settings, whatsapp: e.target.value })} className='h-10 sm:h-11 text-left' dir="ltr" />
                <p className="text-xs text-muted-foreground">اكتب الرقم مسبوقاً بكود الدولة (مثال: 201000000000+)</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* 3. Shipping Settings */}
        <TabsContent value='shipping' className='space-y-4 sm:space-y-6'>
          <Card className='border-0 shadow-sm'>
            <CardHeader><CardTitle className='text-base sm:text-lg'>إعدادات الشحن</CardTitle></CardHeader>
            <CardContent className='space-y-4'>
              <div className='grid sm:grid-cols-2 gap-4'>
                <div className='space-y-2'>
                  <Label htmlFor='shippingCost' className='text-sm font-semibold'>تكلفة الشحن ({settings.currency})</Label>
                  <Input id='shippingCost' type='number' value={settings.shippingCost} onChange={(e) => setSettings({ ...settings, shippingCost: e.target.value })} className='h-10 sm:h-11' />
                </div>
                <div className='space-y-2'>
                  <Label htmlFor='freeShippingThreshold' className='text-sm font-semibold'>حد الشحن المجاني ({settings.currency})</Label>
                  <Input id='freeShippingThreshold' type='number' value={settings.freeShippingThreshold} onChange={(e) => setSettings({ ...settings, freeShippingThreshold: e.target.value })} className='h-10 sm:h-11' />
                </div>
              </div>
              <div className='grid sm:grid-cols-2 gap-4'>
                <div className='space-y-2'>
                  <Label htmlFor='taxRate' className='text-sm font-semibold'>معدل الضريبة (%)</Label>
                  <Input id='taxRate' type='number' value={settings.taxRate} onChange={(e) => setSettings({ ...settings, taxRate: e.target.value })} className='h-10 sm:h-11' />
                </div>
                <div className='space-y-2'>
                  <Label htmlFor='currency' className='text-sm font-semibold'>العملة</Label>
                  <Input id='currency' value={settings.currency} onChange={(e) => setSettings({ ...settings, currency: e.target.value })} className='h-10 sm:h-11' />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* 4. Notifications */}
        <TabsContent value='notifications' className='space-y-4 sm:space-y-6'>
          <Card className='border-0 shadow-sm'>
            <CardHeader><CardTitle className='text-base sm:text-lg'>إعدادات الإشعارات</CardTitle></CardHeader>
            <CardContent className='space-y-6'>
              <div className='flex items-center justify-between'>
                <div className='space-y-1'><Label className='text-sm font-semibold'>إشعارات البريد</Label></div>
                <Switch checked={settings.emailNotifications} onCheckedChange={(checked) => setSettings({ ...settings, emailNotifications: checked })} />
              </div>
              <Separator />
              <div className='flex items-center justify-between'>
                <div className='space-y-1'><Label className='text-sm font-semibold'>إشعارات SMS</Label></div>
                <Switch checked={settings.smsNotifications} onCheckedChange={(checked) => setSettings({ ...settings, smsNotifications: checked })} />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* 5. Advanced */}
        <TabsContent value='advanced' className='space-y-4 sm:space-y-6'>
          <Card className='border-0 shadow-sm'>
            <CardHeader><CardTitle className='text-base sm:text-lg'>إعدادات متقدمة</CardTitle></CardHeader>
            <CardContent className='space-y-6'>
              <div className='flex items-center justify-between'>
                <div className='space-y-1'><Label className='text-sm font-semibold'>وضع الصيانة</Label></div>
                <Switch checked={settings.maintenanceMode} onCheckedChange={(checked) => setSettings({ ...settings, maintenanceMode: checked })} />
              </div>
              <Separator />
              <div className='flex items-center justify-between'>
                <div className='space-y-1'>
                  <Label className='text-sm font-semibold'>الدفع عند الاستلام (COD)</Label>
                  <p className='text-xs text-muted-foreground'>السماح بالدفع نقداً</p>
                </div>
                <Switch checked={settings.acceptCashOnDelivery} onCheckedChange={(checked) => setSettings({ ...settings, acceptCashOnDelivery: checked })} />
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <div className='flex justify-end pt-4 border-t'>
        <Button onClick={handleSave} disabled={saving} className='w-full sm:w-auto h-10 sm:h-11 bg-gradient-to-r from-primary to-primary/80'>
          {saving ? <><Loader2 className='ml-2 h-4 w-4 animate-spin' /> جاري الحفظ...</> : <><Save className='ml-2 h-4 w-4' /> حفظ الإعدادات</>}
        </Button>
      </div>
    </div>
  )
}