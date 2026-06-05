'use client'

import { useState, useEffect } from 'react'
import { Save, Loader2, Link as LinkIcon, ShoppingCart, Percent, Folder, Box, LayoutTemplate, Trash2, Plus, Facebook, Instagram, Twitter, MessageCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { Switch } from '@/components/ui/switch'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue, SelectGroup, SelectLabel } from "@/components/ui/select"
import { useToast } from '@/lib/use-toast'
import { adminSettingsAPI } from '@/lib/admin-api'

interface Product { _id: string; name: string; slug: string; }
interface Category { _id: string; name: string; }

export default function SettingsPage() {
  const { toast } = useToast()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [categories, setCategories] = useState<Category[]>([]);
  const [products, setProducts] = useState<Product[]>([]);

  const [settings, setSettings] = useState({
    siteName: '',
    siteDescription: '',
    heroBanner: {
      image: '',
      titleAr: '', // نحتفظ بنفس الأسماء البرمجية لعدم كسر أي كود آخر
      subtitleAr: '',
      descriptionAr: '',
      btnTextAr: '',
      link: '/shop'
    },
    announcements: [''],
    email: '', phone: '', address: '',
    freeShippingThreshold: '', shippingCost: '', taxRate: '', currency: '',
    maintenanceMode: false, emailNotifications: true, smsNotifications: false, acceptCashOnDelivery: true,
    facebook: '', instagram: '', twitter: '', whatsapp: '',
  })
  
  useEffect(() => {
    fetchSettings()
    fetchCategories()
    fetchProducts()
  }, [])

  const fetchSettings = async () => {
    try {
      setLoading(true)
      const response = await adminSettingsAPI.get()
      if (response.data) {
        setSettings({ 
          ...settings, 
          ...response.data,
          announcements: response.data.announcements?.length > 0 ? response.data.announcements : [''],
          heroBanner: response.data.heroBanner || settings.heroBanner
        })
      }
    } catch (error) { console.error('Failed to fetch settings:', error) } 
    finally { setLoading(false) }
  }

  const fetchProducts = async () => {
    try {
      const res = await fetch(`/api/products`);
      const data = await res.json();
      setProducts(data.data || []);
    } catch (err) { console.error("Error fetching products", err); }
  };

  const fetchCategories = async () => {
    try {
      const res = await fetch(`/api/categories`);
      const data = await res.json();
      setCategories(data.data || []);
    } catch (err) { console.error("Error fetching categories", err); }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('image', file);
    
    setSaving(true);
    try {
      const token = localStorage.getItem('token') || document.cookie.split('; ').find(c => c.startsWith('token='))?.split('=')[1];
      
      const res = await fetch('/api/settings/upload-hero', { 
        method: 'POST',
        body: formData,
        headers: {
          ...(token ? { 'Authorization': `Bearer ${token}` } : {})
        }
      });

      const data = await res.json();

      if (!res.ok) throw new Error(data.message || 'فشل رفع الصورة');

      setSettings(prev => ({ 
        ...prev, 
        heroBanner: { ...prev.heroBanner, image: data.url } 
      }));
      
      toast({ title: '✅ تم رفع الصورة', description: 'الصورة جاهزة للحفظ الآن' });
    } catch (error) {
      console.error('Upload Error:', error);
      toast({ 
        title: '❌ فشل الرفع', 
        description: error instanceof Error ? error.message : 'حدث خطأ أثناء رفع الصورة',
        variant: 'destructive' 
      });
    } finally {
      setSaving(false);
    }
  };

  const handleSave = async () => {
    setSaving(true)
    try {
      const cleanedSettings = {
        ...settings,
        announcements: settings.announcements.filter(a => a.trim() !== '')
      }
      await adminSettingsAPI.update(cleanedSettings)
      toast({ title: '✅ تم الحفظ', description: 'تم حفظ الإعدادات بنجاح' })
    } catch (error) { toast({ title: '❌ خطأ', description: 'فشل حفظ الإعدادات', variant: 'destructive' }) } 
    finally { setSaving(false) }
  }

  if (loading) return <div className='flex items-center justify-center min-h-[60vh]'><Loader2 className='h-10 w-10 animate-spin text-primary' /></div>

  return (
    <div className='space-y-4 sm:space-y-6 max-w-4xl p-3 sm:p-4 md:p-6' dir="rtl">
        <div>
            <h1 className='text-xl sm:text-2xl md:text-3xl font-bold bg-gradient-to-r from-gray-700 to-gray-900 bg-clip-text text-transparent'>الإعدادات</h1>
        </div>
        <Tabs defaultValue='hero' className='space-y-4 sm:space-y-6'>
            <TabsList className='grid w-full grid-cols-2 md:grid-cols-5 h-auto'>
                <TabsTrigger value='general'>عام</TabsTrigger>
                <TabsTrigger value='hero'>واجهة الموقع</TabsTrigger>
                <TabsTrigger value='social'>التواصل</TabsTrigger>
                <TabsTrigger value='shipping'>الشحن</TabsTrigger>
                <TabsTrigger value='advanced'>متقدم</TabsTrigger>
            </TabsList>

            <TabsContent value='general'>
                <Card className='border-0 shadow-sm'>
                    <CardHeader><CardTitle>معلومات المتجر</CardTitle></CardHeader>
                    <CardContent className='space-y-4'>
                    <div className='space-y-2'><Label>اسم المتجر</Label><Input value={settings.siteName} onChange={(e) => setSettings({...settings, siteName: e.target.value})} /></div>
                    <div className='space-y-2'><Label>شريط الإعلانات</Label>
                        {settings.announcements.map((a, i) => (
                        <div key={i} className='flex gap-2 mb-2'>
                            <Input value={a} onChange={(e) => { const n = [...settings.announcements]; n[i] = e.target.value; setSettings({...settings, announcements: n}) }} />
                            <Button variant='destructive' size='icon' onClick={() => setSettings({...settings, announcements: settings.announcements.filter((_,idx) => idx !== i)})}><Trash2 size={16} /></Button>
                        </div>
                        ))}
                        <Button variant='outline' onClick={() => setSettings({...settings, announcements: [...settings.announcements, '']})}><Plus size={16} className='ml-2'/> إضافة إعلان</Button>
                    </div>
                    </CardContent>
                </Card>
            </TabsContent>

            <TabsContent value='hero' className='space-y-6'>
                <Card className='border-0 shadow-sm'>
                    <CardHeader>
                        <CardTitle className='flex items-center gap-2'><LayoutTemplate/> إعدادات البانر الرئيسي</CardTitle>
                    </CardHeader>
                    <CardContent className='space-y-6'>
                    
                    <div className='space-y-2'>
                        <Label>صورة البانر</Label>
                        <div className="flex items-center gap-4">
                            <Input type="file" accept="image/*" onChange={handleImageUpload} className="w-full" />
                            {settings.heroBanner.image && <img src={settings.heroBanner.image} alt="Preview" className="h-12 w-12 rounded object-cover border" />}
                        </div>
                    </div>

                    {/* الحقول العربية فقط وبعرض الشاشة الكامل */}
                    <div className='space-y-2'>
                        <Label>العنوان الرئيسي</Label>
                        <Input placeholder="مثال: كوليكشن الموسم الجديد" value={settings.heroBanner.titleAr} onChange={(e) => setSettings({...settings, heroBanner: {...settings.heroBanner, titleAr: e.target.value}})} />
                    </div>

                    <div className='space-y-2'>
                        <Label>العنوان الفرعي</Label>
                        <Input placeholder="مثال: وصل حديثاً" value={settings.heroBanner.subtitleAr} onChange={(e) => setSettings({...settings, heroBanner: {...settings.heroBanner, subtitleAr: e.target.value}})} />
                    </div>

                    <div className='space-y-2'>
                        <Label>الوصف</Label>
                        <Textarea placeholder="اكتب وصفاً جذاباً للمنتج أو العرض..." rows={4} value={settings.heroBanner.descriptionAr} onChange={(e) => setSettings({...settings, heroBanner: {...settings.heroBanner, descriptionAr: e.target.value}})} />
                    </div>

                    <div className='space-y-2'>
                        <Label>نص الزر</Label>
                        <Input placeholder="مثال: تسوق الآن" value={settings.heroBanner.btnTextAr} onChange={(e) => setSettings({...settings, heroBanner: {...settings.heroBanner, btnTextAr: e.target.value}})} />
                    </div>

                    <Separator />
                    
                    <div className='space-y-3'>
                        <Label htmlFor="hero-link-select" className='font-bold text-md flex items-center gap-2'>
                            <LinkIcon className="w-5 h-5 text-primary"/>
                            وجهة الزرار
                        </Label>
                        <Select
                            value={settings.heroBanner.link}
                            onValueChange={(value) => setSettings(prev => ({...prev, heroBanner: {...prev.heroBanner, link: value}}))}
                        >
                            <SelectTrigger id="hero-link-select" className="h-11 text-base">
                                <SelectValue placeholder="اختر الوجهة..." />
                            </SelectTrigger>
                            <SelectContent className="max-h-[400px]">
                                <SelectGroup>
                                    <SelectLabel className="text-muted-foreground">خيارات عامة</SelectLabel>
                                    <SelectItem value="/shop">
                                        <div className="flex items-center gap-2">
                                            <ShoppingCart className="w-4 h-4" />
                                            <span>المتجر بالكامل</span>
                                        </div>
                                    </SelectItem>
                                    <SelectItem value="/shop?sale=true">
                                        <div className="flex items-center gap-2">
                                            <Percent className="w-4 h-4 text-red-500" />
                                            <span>صفحة التخفيضات</span>
                                        </div>
                                    </SelectItem>
                                </SelectGroup>

                                {categories.length > 0 && (
                                    <SelectGroup>
                                        <SelectLabel className="text-muted-foreground">الأقسام</SelectLabel>
                                        {categories.map((cat) => (
                                            <SelectItem key={cat._id} value={`/shop?category=${cat._id}`}>
                                                <div className="flex items-center gap-2">
                                                    <Folder className="w-4 h-4 text-yellow-600" />
                                                    <span>{cat.name}</span>
                                                </div>
                                            </SelectItem>
                                        ))}
                                    </SelectGroup>
                                )}
                                
                                {products.length > 0 && (
                                    <SelectGroup>
                                        <SelectLabel className="text-muted-foreground">منتجات محددة</SelectLabel>
                                        {products.map((prod) => (
                                            <SelectItem key={prod._id} value={`/product/${prod.slug}`}>
                                                <div className="flex items-center gap-2">
                                                    <Box className="w-4 h-4 text-blue-500" />
                                                    <span className="truncate">{prod.name}</span>
                                                </div>
                                            </SelectItem>
                                        ))}
                                    </SelectGroup>
                                )}
                            </SelectContent>
                        </Select>
                        <p className="text-xs text-muted-foreground">
                            الرابط المحدد حالياً: <code className='text-primary font-mono'>{settings.heroBanner.link}</code>
                        </p>
                    </div>
                    </CardContent>
                </Card>
            </TabsContent>

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
            <Button onClick={handleSave} disabled={saving} className='w-full sm:w-auto h-11 bg-gradient-to-r from-primary to-primary/80'>
            {saving ? <><Loader2 className='ml-2 h-4 w-4 animate-spin' /> جاري الحفظ...</> : <><Save className='ml-2 h-4 w-4' /> حفظ الإعدادات</>}
            </Button>
        </div>
    </div>
  )
}