'use client'

import { useState, useEffect, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import { Check, CreditCard, Truck, ShoppingBag, Loader2, MapPin, Plus, Home, Briefcase } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Separator } from '@/components/ui/separator'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { formatPrice, cn } from '@/lib/utils'
import { useCart } from '@/contexts/CartContext'
import { useAddresses } from '@/contexts/AddressContext'
import { useAuth } from '@/contexts/AuthContext' // 👈 استدعاء مصادقة المستخدم
import { ordersAPI } from '@/lib/api'
import { useToast } from '@/lib/use-toast'
import { Badge } from '@/components/ui/badge'
import { useLanguage } from '@/contexts/LanguageContext'

export default function CheckoutPage() {
  const router = useRouter()
  // 👈 تأكد من جلب refreshCart لتفريغ السلة بعد الطلب
  const { cart, refreshCart } = useCart() 
  const { addresses, addAddress, refreshAddresses } = useAddresses()
  const { isAuthenticated, loading: authLoading } = useAuth() as any // 👈 التحقق من تسجيل الدخول
  const { toast } = useToast()
  const { t, isRTL, language } = useLanguage()

  const [currentStep, setCurrentStep] = useState(1)
  const [paymentMethod, setPaymentMethod] = useState('cash')
  const [loading, setLoading] = useState(false)
  const [addressMode, setAddressMode] = useState<'saved' | 'new'>('saved')
  const [selectedAddressId, setSelectedAddressId] = useState('')
  const [saveNewAddress, setSaveNewAddress] = useState(true)

  const [shippingInfo, setShippingInfo] = useState({
    fullName: '', phone: '', email: '', city: '', address: '', postalCode: '', notes: '', alias: 'home',
  })

  const steps = useMemo(() => [
    { id: 1, name: t('shippingAddress'), icon: Truck },
    { id: 2, name: t('paymentMethod'), icon: CreditCard },
    { id: 3, name: t('reviewOrder'), icon: ShoppingBag },
  ], [t])

  const getAddressIcon = (alias: string) => {
    switch (alias) {
      case 'home': return <Home className='h-4 w-4' />
      case 'work': return <Briefcase className='h-4 w-4' />
      default: return <MapPin className='h-4 w-4' />
    }
  }

  // 🎯 الحماية الجذرية: الاعتماد على المتصفح الموثوق لمنع الطرد العشوائي
  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.replace('/login?callbackUrl=/checkout')
    }
  }, [isAuthenticated, authLoading, router])

  useEffect(() => {
    if (isAuthenticated) refreshAddresses()
  }, [isAuthenticated])

  useEffect(() => {
    if (addresses.length > 0) {
      setAddressMode('saved')
      if (!selectedAddressId) setSelectedAddressId(addresses[0]._id)
    } else {
      setAddressMode('new')
    }
  }, [addresses])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setShippingInfo({ ...shippingInfo, [e.target.name]: e.target.value })
  }

  const validateStep1 = () => {
    if (addressMode === 'saved') {
      if (!selectedAddressId) {
        toast({ title: t('warning'), description: t('selectAddressError'), variant: 'destructive' })
        return false
      }
    } else {
      if (!shippingInfo.fullName || !shippingInfo.phone || !shippingInfo.city || !shippingInfo.address) {
        toast({ title: t('warning'), description: t('fillRequiredFields'), variant: 'destructive' })
        return false
      }
      const phoneRegex = /^(010|011|012|015)\d{8}$/
      if (!phoneRegex.test(shippingInfo.phone.replace(/\s/g, ''))) {
        toast({ title: t('warning'), description: t('invalidPhone'), variant: 'destructive' })
        return false
      }
    }
    return true
  }

  const handleNext = async () => {
    if (currentStep === 1 && !validateStep1()) return
    if (currentStep < 3) setCurrentStep(currentStep + 1)
  }

 const handlePlaceOrder = async () => {
  setLoading(true);
  try {
    let shippingAddress: any;
    // ... (نفس كود جلب العنوان الخاص بك) ...
    if (addressMode === 'saved') {
      const addr = addresses.find(a => a._id === selectedAddressId);
      shippingAddress = { details: addr?.details, phone: addr?.phone, city: addr?.city, postalCode: addr?.postalCode || '00000' };
    } else {
      shippingAddress = { details: shippingInfo.address, phone: shippingInfo.phone, city: shippingInfo.city, postalCode: shippingInfo.postalCode || '00000' };
    }

    if (paymentMethod === 'cash') {
      const res = await ordersAPI.createCashOrder(cart!._id, shippingAddress);
      
      // 1. تفريغ السلة فوراً
      await refreshCart();
      
      // 2. إظهار رسالة النجاح
      toast({ title: t('success'), description: t('orderPlacedSuccessfully') });
      
      // 3. التحويل لصفحة النجاح
      if (res && res.data && res.data._id) {
        router.push(`/order-success?orderId=${res.data._id}`);
      } else {
        // لو مفيش ID، روح للصفحة بدون ID
        router.push('/order-success');
      }
    }
  } catch (error: any) {
    console.error("خطأ الطلب:", error);
    toast({ 
      title: t('error'), 
      description: error.response?.data?.message || "حدث خطأ أثناء إتمام الطلب", 
      variant: 'destructive' 
    });
  } finally {
    setLoading(false);
  }
};

  const cartSummary = {
    subtotal: cart?.totalCartPrice || 0,
    shipping: 50,
    total: (cart?.totalPriceAfterDiscount || cart?.totalCartPrice || 0) + 50,
    items: cart?.cartItems?.length || 0,
  }

  // منع ظهور الشاشة بيضاء أثناء التحقق من الدخول
  if (authLoading || !isAuthenticated) {
    return <div className="min-h-screen flex items-center justify-center"><Loader2 className="w-10 h-10 animate-spin text-primary" /></div>
  }

  return (
    <div className='min-h-screen bg-background text-foreground py-6 md:py-12'>
      <div className='container mx-auto px-4 max-w-5xl'>
        {/* Header */}
        <div className='mb-8 text-center md:text-right'>
          <h1 className='text-2xl md:text-4xl font-black mb-2'>{t('checkout')}</h1>
          <p className='text-muted-foreground text-sm md:text-base'>أكملي معلومات الشحن والدفع</p>
        </div>

        {/* Steps Indicator */}
        <div className='mb-10'>
          <div className='flex items-center justify-between relative max-w-2xl mx-auto'>
            {steps.map((step, index) => (
              <div key={step.id} className='flex items-center flex-1 last:flex-none'>
                <div className='flex flex-col items-center relative z-10'>
                  <div className={cn(
                    'w-10 h-10 md:w-12 md:h-12 rounded-full flex items-center justify-center border-2 transition-all duration-300',
                    currentStep >= step.id ? 'bg-primary border-primary text-primary-foreground shadow-lg shadow-primary/20' : 'bg-muted border-border text-muted-foreground'
                  )}>
                    {currentStep > step.id ? <Check className='h-5 w-5 md:h-6 md:w-6' /> : <step.icon className='h-5 w-5 md:h-6 md:w-6' />}
                  </div>
                  <span className={cn('text-[10px] md:text-xs mt-2 font-bold whitespace-nowrap', currentStep >= step.id ? 'text-primary' : 'text-muted-foreground')}>
                    {step.name}
                  </span>
                </div>
                {index < steps.length - 1 && (
                  <div className={cn('h-0.5 flex-1 mx-2 md:mx-4 transition-colors duration-500', currentStep > step.id ? 'bg-primary' : 'bg-border')} />
                )}
              </div>
            ))}
          </div>
        </div>

        <div className='grid lg:grid-cols-3 gap-6 md:gap-8'>
          <div className='lg:col-span-2 space-y-6'>
            <div className='bg-card p-5 md:p-8 rounded-2xl border border-border shadow-sm'>
              {/* Step 1: Shipping */}
              {currentStep === 1 && (
                <div className='space-y-6'>
                  <div className='flex flex-col sm:flex-row sm:items-center justify-between gap-4'>
                    <h2 className='text-xl font-bold flex items-center gap-2'>
                      <MapPin className='h-5 w-5 text-primary' /> {t('shippingAddress')}
                    </h2>
                    {addresses.length > 0 && (
                      <div className='flex bg-muted p-1 rounded-xl w-fit'>
                        <Button variant={addressMode === 'saved' ? 'secondary' : 'ghost'} size='sm' onClick={() => setAddressMode('saved')} className='rounded-lg text-xs md:text-sm'>{t('savedAddresses')}</Button>
                        <Button variant={addressMode === 'new' ? 'secondary' : 'ghost'} size='sm' onClick={() => setAddressMode('new')} className='rounded-lg text-xs md:text-sm'>{t('addAddress')}</Button>
                      </div>
                    )}
                  </div>

                  {addressMode === 'saved' ? (
                    <RadioGroup value={selectedAddressId} onValueChange={setSelectedAddressId} className='grid gap-4'>
                      {addresses.map((addr) => (
                        <label key={addr._id} className={cn(
                          'flex items-start gap-4 p-4 border-2 rounded-2xl cursor-pointer transition-all hover:bg-muted/50',
                          selectedAddressId === addr._id ? 'border-primary bg-primary/5' : 'border-border'
                        )}>
                          <RadioGroupItem value={addr._id} id={addr._id} className='mt-1' />
                          <div className='flex-1'>
                            <div className='flex items-center gap-2 mb-1'>
                              {getAddressIcon(addr.alias)}
                              <span className='font-bold text-sm'>{addr.city}</span>
                              <Badge variant='secondary' className='text-[10px]'>{addr.alias}</Badge>
                            </div>
                            <p className='text-xs text-muted-foreground line-clamp-1'>{addr.details}</p>
                            <p className='text-xs font-medium mt-1'>📞 {addr.phone}</p>
                          </div>
                        </label>
                      ))}
                    </RadioGroup>
                  ) : (
                    <div className='grid sm:grid-cols-2 gap-4'>
                      <div className='space-y-2'><Label>{t('fullName')} *</Label><Input name='fullName' value={shippingInfo.fullName} onChange={handleInputChange} className='bg-background' /></div>
                      <div className='space-y-2'><Label>{t('phone')} *</Label><Input name='phone' value={shippingInfo.phone} onChange={handleInputChange} className='bg-background' /></div>
                      <div className='space-y-2'><Label>{t('city')} *</Label><Input name='city' value={shippingInfo.city} onChange={handleInputChange} className='bg-background' /></div>
                      <div className='space-y-2'><Label>{t('postalCode')}</Label><Input name='postalCode' value={shippingInfo.postalCode} onChange={handleInputChange} className='bg-background' /></div>
                      <div className='sm:col-span-2 space-y-2'><Label>{t('address')} *</Label><Input name='address' value={shippingInfo.address} onChange={handleInputChange} className='bg-background' /></div>
                    </div>
                  )}
                </div>
              )}

              {/* Step 2: Payment */}
              {currentStep === 2 && (
                <div className='space-y-6'>
                  <h2 className='text-xl font-bold'>{t('paymentMethod')}</h2>
                  <RadioGroup value={paymentMethod} onValueChange={setPaymentMethod} className='grid gap-4'>
                    <label className={cn('flex items-center gap-4 p-5 border-2 rounded-2xl cursor-pointer transition-all', paymentMethod === 'cash' ? 'border-primary bg-primary/5' : 'border-border')}>
                      <RadioGroupItem value='cash' />
                      <div className='flex-1'>
                        <p className='font-bold flex items-center gap-2'>💵 {t('cash')} <Badge className='bg-green-500/10 text-green-600 border-none text-[10px]'>الآمن</Badge></p>
                        <p className='text-xs text-muted-foreground mt-1'>الدفع عند الاستلام</p>
                      </div>
                    </label>
                    <label className={cn('flex items-center gap-4 p-5 border-2 rounded-2xl cursor-pointer transition-all', paymentMethod === 'card' ? 'border-primary bg-primary/5' : 'border-border')}>
                      <RadioGroupItem value='card' />
                      <div className='flex-1'>
                        <p className='font-bold'>💳 {t('card')}</p>
                        <p className='text-xs text-muted-foreground mt-1'>Visa / Mastercard</p>
                      </div>
                    </label>
                  </RadioGroup>
                </div>
              )}

              {/* Step 3: Review */}
              {currentStep === 3 && (
                <div className='space-y-6 text-right'>
                  <h2 className='text-xl font-bold'>{t('reviewOrder')}</h2>
                  <div className='bg-muted/50 p-5 rounded-2xl border border-dashed border-border space-y-4'>
                    <div className='flex justify-between items-center'>
                      <span className='font-bold text-sm'>{t('shippingAddress')}</span>
                      <Button variant='ghost' size='sm' onClick={() => setCurrentStep(1)} className='h-7 text-primary'>{t('edit')}</Button>
                    </div>
                    <div className='text-sm text-muted-foreground space-y-1'>
                      {addressMode === 'saved' ? <p>{addresses.find(a => a._id === selectedAddressId)?.details}</p> : <p>{shippingInfo.address}</p>}
                      <p>📞 {addressMode === 'saved' ? addresses.find(a => a._id === selectedAddressId)?.phone : shippingInfo.phone}</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Navigation */}
              <div className='flex gap-3 mt-10'>
                {currentStep > 1 && (
                  <Button variant='outline' onClick={() => setCurrentStep(prev => prev - 1)} className='rounded-xl'>{t('previous')}</Button>
                )}
                <Button className='flex-1 gold-gradient text-white rounded-xl font-bold h-12' onClick={currentStep === 3 ? handlePlaceOrder : handleNext} disabled={loading}>
                  {loading ? <Loader2 className='animate-spin h-5 w-5' /> : currentStep === 3 ? t('placeOrder') : t('next')}
                </Button>
              </div>
            </div>
          </div>

          {/* Sidebar Summary */}
          <div className='lg:col-span-1'>
            <div className='bg-card border border-border p-6 rounded-2xl sticky top-24 shadow-sm'>
              <h3 className='font-bold text-lg mb-4'>{t('orderSummary')}</h3>
              <div className='space-y-3 text-sm'>
                <div className='flex justify-between'><span className='text-muted-foreground'>{t('subtotal')}</span><span className='font-bold'>{formatPrice(cartSummary.subtotal)}</span></div>
                <div className='flex justify-between'><span className='text-muted-foreground'>{t('shipping')}</span><span className='font-bold'>{formatPrice(cartSummary.shipping)}</span></div>
                <Separator />
                <div className='flex justify-between text-lg font-black text-primary'><span>{t('total')}</span><span>{formatPrice(cartSummary.total)}</span></div>
              </div>
              <div className='mt-6 pt-6 border-t border-border space-y-3'>
                <div className='flex items-center gap-2 text-[10px] md:text-xs text-muted-foreground'><Check className='h-4 w-4 text-green-500' /> <span>توصيل سريع 3-5 أيام</span></div>
                <div className='flex items-center gap-2 text-[10px] md:text-xs text-muted-foreground'><Check className='h-4 w-4 text-green-500' /> <span>إرجاع مجاني خلال 14 يوم</span></div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <style jsx global>{`
        .gold-gradient { background: linear-gradient(to right, #d4af37, #f1c40f, #d4af37); }
      `}</style>
    </div>
  )
}