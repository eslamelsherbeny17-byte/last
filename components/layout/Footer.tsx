'use client'

import type React from 'react'
import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import axios from 'axios'
import { Mail, Phone, MapPin, Send } from 'lucide-react'
// ✨ استدعاء الأيقونات الأصلية للسوشيال ميديا
import { FaFacebookF, FaInstagram, FaWhatsapp, FaXTwitter } from 'react-icons/fa6'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { useLanguage } from '@/contexts/LanguageContext'
import { cn } from '@/lib/utils'

interface StoreSettings {
  siteName: string;
  siteDescription: string;
  email: string;
  phone: string;
  address: string;
  facebook: string;
  instagram: string;
  twitter: string;
  whatsapp: string;
}

export function Footer() {
  const { t, language, isRTL } = useLanguage()
  const [email, setEmail] = useState('')
  const [isSubscribing, setIsSubscribing] = useState(false)

  const [storeSettings, setStoreSettings] = useState<StoreSettings>({
    siteName: '',
    siteDescription: '',
    email: '',
    phone: '',
    address: '',
    facebook: '',
    instagram: '',
    twitter: '',
    whatsapp: '',
  })

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        // ✨ التعديل هنا: غيرنا الرابط لـ /settings عشان يقرا الداتا الصح
        const res = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/settings`)
        if (res.data?.data) {
          setStoreSettings(res.data.data)
        }
      } catch (error) {
        console.error("Error fetching footer settings:", error)
      }
    }
    fetchSettings()
  }, [])

  const handleSubscribe = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault()
      if (!email.trim() || isSubscribing) return
      setIsSubscribing(true)
      setTimeout(() => {
        setEmail('')
        setIsSubscribing(false)
      }, 1000)
    },
    [email, isSubscribing]
  )
  
  // ✨ السوشيال ميديا مع الألوان الأصلية لكل منصة
  const socialLinks = [];
  if (storeSettings.facebook) {
    socialLinks.push({ 
      href: storeSettings.facebook, 
      icon: FaFacebookF, 
      label: 'Facebook',
      colorClass: 'text-[#1877F2] hover:bg-[#1877F2] hover:text-white border-[#1877F2]/30'
    });
  }
  if (storeSettings.instagram) {
    socialLinks.push({ 
      href: storeSettings.instagram, 
      icon: FaInstagram, 
      label: 'Instagram',
      colorClass: 'text-[#E4405F] hover:bg-gradient-to-tr hover:from-[#f09433] hover:via-[#e6683c] hover:to-[#bc1888] hover:text-white border-[#E4405F]/30'
    });
  }
  if (storeSettings.twitter) {
    socialLinks.push({ 
      href: storeSettings.twitter, 
      icon: FaXTwitter, 
      label: 'Twitter',
      colorClass: 'text-gray-300 hover:bg-white hover:text-black border-gray-600'
    });
  }
  if (storeSettings.whatsapp) {
    const whatsappNumber = storeSettings.whatsapp.replace(/\s/g, '').replace('+', '');
    socialLinks.push({ 
      href: `https://wa.me/${whatsappNumber}`, 
      icon: FaWhatsapp, 
      label: 'Whatsapp',
      colorClass: 'text-[#25D366] hover:bg-[#25D366] hover:text-white border-[#25D366]/30'
    });
  }

  const essentialLinks = [
    { href: '/', label: language === 'ar' ? 'الرئيسية' : 'Home' },
    { href: '/shop', label: language === 'ar' ? 'المتجر' : 'Shop' },
    { href: '/cart', label: language === 'ar' ? 'سلة المشتريات' : 'Cart' },
    { href: '/profile', label: language === 'ar' ? 'حسابي' : 'My Account' },
  ]

  const paymentMethods = [
    { name: t('visa'), key: 'visa' },
    { name: t('mastercard'), key: 'mastercard' },
    { name: t('fawry'), key: 'fawry' },
  ]

  const displaySiteName = storeSettings.siteName || (language === 'ar' ? 'بسمه ستور' : 'Basma Store')
  const displayDescription = storeSettings.siteDescription || (language === 'ar' ? 'متجر متخصص في الأزياء الإسلامية العصرية والأنيقة، نقدم لكم الجودة والرقي في كل قطعة.' : 'Modern and elegant Islamic fashion store, offering quality and sophistication in every piece.')
  const displayAddress = storeSettings.address || t('cairo')
  const displayPhone = storeSettings.phone || t('phoneNumber')
  const displayEmail = storeSettings.email || t('emailAddress')

  return (
    <footer className='bg-accent text-white dark:bg-gray-950 border-t border-white/5' role='contentinfo'>
      <div className='container mx-auto px-6 py-12 lg:py-16'>
        <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12'>
          
          {/* 1. قسم عن المتجر والسوشيال ميديا */}
          <div className='space-y-6'>
            <h3 className='text-2xl font-black text-white inline-block'>
              {displaySiteName}
            </h3>
            <p className='text-sm text-gray-400 leading-relaxed max-w-sm'>
              {displayDescription}
            </p>
            
            {/* ✨ تصميم السوشيال ميديا الجديد (أيقونات حية ومضيئة) */}
            {socialLinks.length > 0 && (
                <div className='flex gap-3 pt-2'>
                {socialLinks.map((social) => (
                    <Link
                    key={social.label}
                    href={social.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={cn(
                      'w-10 h-10 flex items-center justify-center rounded-full bg-white/5 border transition-all duration-300 transform hover:-translate-y-1 shadow-lg',
                      social.colorClass
                    )}
                    aria-label={social.label}
                    >
                    <social.icon className='h-[18px] w-[18px]' />
                    </Link>
                ))}
                </div>
            )}
          </div>

          {/* 2. روابط هامة */}
          <div className='space-y-6'>
            <h4 className='text-sm font-bold uppercase tracking-widest text-primary/80'>
              {language === 'ar' ? 'روابط هامة' : 'Essential Links'}
            </h4>
            <ul className='space-y-4'>
              {essentialLinks.map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className='text-sm text-gray-400 hover:text-primary transition-colors duration-200 flex items-center gap-2'>
                    <span className="w-1.5 h-1.5 rounded-full bg-primary/50"></span>
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* 3. التواصل والنشرة البريدية */}
          <div className='space-y-6'>
            <h4 className='text-sm font-bold uppercase tracking-widest text-primary/80'>
              {t('contactUs')}
            </h4>

            <div className='space-y-4'>
              {displayAddress && (
                <div className='flex items-start gap-3 group'>
                  <div className='w-8 h-8 rounded-full bg-white/5 flex items-center justify-center group-hover:bg-primary/20 transition-colors shrink-0'>
                    <MapPin className='h-4 w-4 text-primary' />
                  </div>
                  <span className='text-sm text-gray-300 leading-relaxed mt-1.5'>{displayAddress}</span>
                </div>
              )}
              {displayPhone && (
                <div className='flex items-center gap-3 group'>
                  <div className='w-8 h-8 rounded-full bg-white/5 flex items-center justify-center group-hover:bg-primary/20 transition-colors shrink-0'>
                    <Phone className='h-4 w-4 text-primary' />
                  </div>
                  <a href={`tel:${displayPhone}`} className='text-sm text-gray-300 hover:text-primary transition-colors mt-0.5' dir="ltr">
                    {displayPhone}
                  </a>
                </div>
              )}
              {displayEmail && (
                <div className='flex items-center gap-3 group'>
                  <div className='w-8 h-8 rounded-full bg-white/5 flex items-center justify-center group-hover:bg-primary/20 transition-colors shrink-0'>
                    <Mail className='h-4 w-4 text-primary' />
                  </div>
                  <a href={`mailto:${displayEmail}`} className='text-sm text-gray-300 hover:text-primary transition-colors break-all mt-0.5'>
                    {displayEmail}
                  </a>
                </div>
              )}
            </div>

            <form onSubmit={handleSubscribe} className='relative group pt-2'>
              <Input
                type='email'
                placeholder={t('enterEmail')}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className='bg-white/5 border-white/10 text-white rounded-xl h-12 pr-12 focus:border-primary transition-all'
              />
              <Button
                type='submit'
                size='icon'
                disabled={isSubscribing || !email.trim()}
                className={cn(
                  'absolute top-1 bottom-1 w-10 h-10 bg-primary text-primary-foreground hover:bg-yellow-400 hover:text-black transition-all rounded-lg',
                  isRTL ? 'left-1' : 'right-1'
                )}
              >
                <Send className='h-4 w-4' />
              </Button>
            </form>
          </div>

        </div>
      </div>

      <div className='border-t border-white/5 bg-[#0a0a0c]'>
        <div className='container mx-auto px-6 py-6'>
          <div className='flex flex-col md:flex-row justify-between items-center gap-4'>
            <p className='text-xs text-gray-500 font-medium order-2 md:order-1'>
              &copy; {new Date().getFullYear()} {displaySiteName}. {t('copyright')}
            </p>

            <div className='flex gap-2 items-center order-1 md:order-2'>
              {paymentMethods.map((method) => (
                <div key={method.key} className='px-3 py-1.5 bg-white/5 rounded-lg border border-white/10 text-[10px] uppercase tracking-wider text-gray-400 font-bold'>
                  {method.name}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}