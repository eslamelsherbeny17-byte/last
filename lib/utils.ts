import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

// ✅ استيراد دوال الألوان من constants
export { 
  getColorHex, 
  getColorName, 
  isLightColor, 
  getTextColorForBackground,
  getSizeCategory,
  PREDEFINED_COLORS,
  PREDEFINED_SIZES,
  COLOR_GROUPS
} from './constants'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// ✅ تنسيق السعر (محدث)
export function formatPrice(price: number): string {
  return new Intl.NumberFormat('ar-EG', {
    style: 'currency',
    currency: 'EGP',
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(price)
}

// ✅ حساب نسبة الخصم
export function calculateDiscount(
  price: number,
  priceAfterDiscount?: number
): number {
  if (!priceAfterDiscount || priceAfterDiscount >= price) return 0
  return Math.round(((price - priceAfterDiscount) / price) * 100)
}

// ✅ الحصول على رابط الصورة (محدث للتوافق مع API)
export function getImageUrl(path: string | undefined): string {
  if (!path || path.trim() === '') return '/placeholder.svg'
  
  // إذا كان الرابط كامل
  if (path.startsWith('http://') || path.startsWith('https://')) {
    return path
  }
  
  // إضافة رابط الـ API
  const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://ecommerce.routemisr.com'
  return `${API_URL}${path.startsWith('/') ? '' : '/'}${path}`
}

// ✅ اختصار النص
export function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text
  return text.substring(0, maxLength) + '...'
}

// ✅ تنسيق التاريخ
export function formatDate(date: string | Date): string {
  return new Intl.DateTimeFormat('ar-EG', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }).format(new Date(date))
}

// ✅ تنسيق التاريخ والوقت
export function formatDateTime(date: string | Date): string {
  return new Intl.DateTimeFormat('ar-EG', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(date))
}

// ==================== 🖼️ Image Processing Functions ====================

// ✅ ضغط الصورة
export async function compressImage(
  file: File,
  maxWidth: number = 1200,
  maxHeight: number = 1200,
  quality: number = 0.8
): Promise<File> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()

    reader.onload = (e) => {
      const img = new Image()

      img.onload = () => {
        const canvas = document.createElement('canvas')
        let width = img.width
        let height = img.height

        if (width > height) {
          if (width > maxWidth) {
            height *= maxWidth / width
            width = maxWidth
          }
        } else {
          if (height > maxHeight) {
            width *= maxHeight / height
            height = maxHeight
          }
        }

        canvas.width = width
        canvas.height = height

        const ctx = canvas.getContext('2d')
        ctx?.drawImage(img, 0, 0, width, height)

        canvas.toBlob(
          (blob) => {
            if (blob) {
              const compressedFile = new File([blob], file.name, {
                type: 'image/jpeg',
                lastModified: Date.now(),
              })
              resolve(compressedFile)
            } else {
              reject(new Error('Canvas to Blob conversion failed'))
            }
          },
          'image/jpeg',
          quality
        )
      }

      img.onerror = reject
      img.src = e.target?.result as string
    }

    reader.onerror = reject
    reader.readAsDataURL(file)
  })
}

// ✅ إنشاء صورة مصغرة
export async function createThumbnail(
  file: File,
  size: number = 200
): Promise<File> {
  return compressImage(file, size, size, 0.7)
}

// ✅ التحقق من صحة الصورة
export function validateImageFile(file: File): {
  valid: boolean
  error?: string
} {
  const maxSize = 5 * 1024 * 1024 // 5MB
  const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp']

  if (!allowedTypes.includes(file.type)) {
    return {
      valid: false,
      error: 'نوع الملف غير مدعوم. الرجاء رفع صورة بصيغة JPG, PNG أو WebP',
    }
  }

  if (file.size > maxSize) {
    return {
      valid: false,
      error: 'حجم الصورة كبير جداً. الحد الأقصى 5 ميجابايت',
    }
  }

  return { valid: true }
}

// ✅ تحويل إلى WebP
export async function convertToWebP(file: File): Promise<File> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()

    reader.onload = (e) => {
      const img = new Image()

      img.onload = () => {
        const canvas = document.createElement('canvas')
        canvas.width = img.width
        canvas.height = img.height

        const ctx = canvas.getContext('2d')
        ctx?.drawImage(img, 0, 0)

        canvas.toBlob(
          (blob) => {
            if (blob) {
              const webpFile = new File(
                [blob],
                file.name.replace(/\.[^/.]+$/, '.webp'),
                {
                  type: 'image/webp',
                  lastModified: Date.now(),
                }
              )
              resolve(webpFile)
            } else {
              reject(new Error('Canvas to Blob conversion failed'))
            }
          },
          'image/webp',
          0.9
        )
      }

      img.onerror = reject
      img.src = e.target?.result as string
    }

    reader.onerror = reject
    reader.readAsDataURL(file)
  })
}

// ✅ معالجة عدة صور
export async function processMultipleImages(
  files: FileList,
  options: {
    compress?: boolean
    maxWidth?: number
    maxHeight?: number
    quality?: number
  } = {}
): Promise<{ valid: File[]; errors: string[] }> {
  const valid: File[] = []
  const errors: string[] = []

  for (let i = 0; i < files.length; i++) {
    const file = files[i]
    const validation = validateImageFile(file)

    if (!validation.valid) {
      errors.push(`${file.name}: ${validation.error}`)
      continue
    }

    try {
      if (options.compress) {
        const compressed = await compressImage(
          file,
          options.maxWidth,
          options.maxHeight,
          options.quality
        )
        valid.push(compressed)
      } else {
        valid.push(file)
      }
    } catch (error) {
      errors.push(`${file.name}: فشل معالجة الصورة`)
    }
  }

  return { valid, errors }
}

// ==================== 🔧 دوال مساعدة إضافية ====================

// ✅ تأخير تنفيذ (للـ debounce)
export function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms))
}

// ✅ تحويل الأرقام العربية إلى إنجليزية
export function arabicToEnglishNumbers(str: string): string {
  const arabicNumbers = ['٠', '١', '٢', '٣', '٤', '٥', '٦', '٧', '٨', '٩']
  return str.replace(/[٠-٩]/g, (d) => arabicNumbers.indexOf(d).toString())
}

// ✅ التحقق من رقم الهاتف المصري
export function validateEgyptianPhone(phone: string): boolean {
  const cleanPhone = arabicToEnglishNumbers(phone).replace(/\s/g, '')
  // يقبل: 01xxxxxxxxx أو +2001xxxxxxxxx أو 002001xxxxxxxxx
  const phoneRegex = /^((\+?20)|0)?1[0125]\d{8}$/
  return phoneRegex.test(cleanPhone)
}

// ✅ تنسيق رقم الهاتف
export function formatPhoneNumber(phone: string): string {
  const cleanPhone = arabicToEnglishNumbers(phone).replace(/\D/g, '')
  
  if (cleanPhone.startsWith('20')) {
    return `+${cleanPhone}`
  }
  
  if (cleanPhone.startsWith('0')) {
    return `+2${cleanPhone}`
  }
  
  return `+20${cleanPhone}`
}

// ✅ نسخ نص إلى الحافظة
export async function copyToClipboard(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text)
    return true
  } catch (error) {
    // fallback للمتصفحات القديمة
    const textArea = document.createElement('textarea')
    textArea.value = text
    textArea.style.position = 'fixed'
    textArea.style.left = '-999999px'
    document.body.appendChild(textArea)
    textArea.focus()
    textArea.select()
    try {
      document.execCommand('copy')
      textArea.remove()
      return true
    } catch (error) {
      textArea.remove()
      return false
    }
  }
}

// ✅ توليد ID عشوائي
export function generateId(prefix: string = ''): string {
  const timestamp = Date.now().toString(36)
  const randomStr = Math.random().toString(36).substring(2, 9)
  return `${prefix}${prefix ? '_' : ''}${timestamp}_${randomStr}`
}

// ✅ التحقق من البريد الإلكتروني
export function validateEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

// ✅ حساب الوقت المنقضي (منذ كذا)
export function timeAgo(date: string | Date, language: 'ar' | 'en' = 'ar'): string {
  const now = new Date()
  const past = new Date(date)
  const diffInSeconds = Math.floor((now.getTime() - past.getTime()) / 1000)

  if (language === 'ar') {
    if (diffInSeconds < 60) return 'الآن'
    if (diffInSeconds < 3600) return `منذ ${Math.floor(diffInSeconds / 60)} دقيقة`
    if (diffInSeconds < 86400) return `منذ ${Math.floor(diffInSeconds / 3600)} ساعة`
    if (diffInSeconds < 2592000) return `منذ ${Math.floor(diffInSeconds / 86400)} يوم`
    if (diffInSeconds < 31536000) return `منذ ${Math.floor(diffInSeconds / 2592000)} شهر`
    return `منذ ${Math.floor(diffInSeconds / 31536000)} سنة`
  } else {
    if (diffInSeconds < 60) return 'just now'
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`
    if (diffInSeconds < 2592000) return `${Math.floor(diffInSeconds / 86400)}d ago`
    if (diffInSeconds < 31536000) return `${Math.floor(diffInSeconds / 2592000)}mo ago`
    return `${Math.floor(diffInSeconds / 31536000)}y ago`
  }
}

// ✅ حساب نسبة التقييم النجمي
export function calculateStarRating(rating: number): {
  full: number
  half: boolean
  empty: number
} {
  const full = Math.floor(rating)
  const half = rating % 1 >= 0.5
  const empty = 5 - full - (half ? 1 : 0)
  
  return { full, half, empty }
}

// ✅ تحويل slug من العربية
export function createSlug(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[\s_]+/g, '-')
    .replace(/[^\w\-\u0600-\u06FF]+/g, '')
    .replace(/\-\-+/g, '-')
    .replace(/^-+/, '')
    .replace(/-+$/, '')
}

// ✅ فحص إذا كان الجهاز موبايل
export function isMobileDevice(): boolean {
  if (typeof window === 'undefined') return false
  return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
    navigator.userAgent
  )
}

// ✅ الحصول على حجم الشاشة
export function getScreenSize(): 'mobile' | 'tablet' | 'desktop' {
  if (typeof window === 'undefined') return 'desktop'
  
  const width = window.innerWidth
  
  if (width < 768) return 'mobile'
  if (width < 1024) return 'tablet'
  return 'desktop'
}