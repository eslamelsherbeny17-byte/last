// lib/constants.ts

export const PREDEFINED_COLORS = [
  // ألوان أساسية كلاسيكية
  { name: 'أسود', hex: '#000000' },
  { name: 'أبيض', hex: '#FFFFFF' },
  { name: 'رمادي', hex: '#6B7280' },
  { name: 'رمادي فاتح', hex: '#D1D5DB' },
  { name: 'رمادي غامق', hex: '#374151' },
  
  // درجات الأحمر والوردي
  { name: 'أحمر', hex: '#EF4444' },
  { name: 'أحمر داكن', hex: '#B91C1C' },
  { name: 'خمري', hex: '#881337' },
  { name: 'عنابي', hex: '#7C2D12' },
  { name: 'وردي', hex: '#EC4899' },
  { name: 'وردي فاتح', hex: '#FBCFE8' },
  { name: 'زهري', hex: '#F472B6' },
  { name: 'فوشيا', hex: '#E879F9' },
  { name: 'مشمشي', hex: '#FED7AA' },
  { name: 'سومون', hex: '#FDA4AF' },
  
  // درجات الأزرق
  { name: 'أزرق', hex: '#3B82F6' },
  { name: 'أزرق فاتح', hex: '#93C5FD' },
  { name: 'أزرق داكن', hex: '#1E3A8A' },
  { name: 'كحلي', hex: '#1E40AF' },
  { name: 'نيلي', hex: '#4F46E5' },
  { name: 'سماوي', hex: '#0EA5E9' },
  { name: 'تركواز', hex: '#06B6D4' },
  { name: 'فيروزي', hex: '#14B8A6' },
  { name: 'بترولي', hex: '#0E7490' },
  { name: 'نيلي ملكي', hex: '#312E81' },
  
  // درجات الأخضر
  { name: 'أخضر', hex: '#22C55E' },
  { name: 'أخضر فاتح', hex: '#86EFAC' },
  { name: 'أخضر داكن', hex: '#15803D' },
  { name: 'زيتي', hex: '#65A30D' },
  { name: 'نعناعي', hex: '#6EE7B7' },
  { name: 'زمردي', hex: '#10B981' },
  { name: 'ليموني', hex: '#84CC16' },
  
  // درجات الأصفر والبرتقالي
  { name: 'أصفر', hex: '#EAB308' },
  { name: 'أصفر فاتح', hex: '#FDE047' },
  { name: 'ذهبي', hex: '#D4AF37' },
  { name: 'برتقالي', hex: '#F97316' },
  { name: 'برتقالي فاتح', hex: '#FDBA74' },
  { name: 'كراميل', hex: '#D97706' },
  { name: 'خردلي', hex: '#CA8A04' },
  
  // درجات البني والبيج
  { name: 'بني', hex: '#92400E' },
  { name: 'بني فاتح', hex: '#A16207' },
  { name: 'بني غامق', hex: '#78350F' },
  { name: 'بيج', hex: '#F5F5DC' },
  { name: 'كريمي', hex: '#FFFBEB' },
  { name: 'كاكي', hex: '#A8A29E' },
  { name: 'رملي', hex: '#E7E5E4' },
  { name: 'كابتشينو', hex: '#A8A29E' },
  { name: 'قهوائي', hex: '#713F12' },
  
  // درجات البنفسجي
  { name: 'بنفسجي', hex: '#A855F7' },
  { name: 'بنفسجي فاتح', hex: '#D8B4FE' },
  { name: 'موف', hex: '#9333EA' },
  { name: 'ليلكي', hex: '#C084FC' },
  { name: 'أرجواني', hex: '#7C3AED' },
  { name: 'بلام', hex: '#A78BFA' },
  
  // ألوان إضافية عصرية
  { name: 'فضي', hex: '#C0C0C0' },
  { name: 'نحاسي', hex: '#B87333' },
  { name: 'وردي باودر', hex: '#FEE2E2' },
  { name: 'أزرق باستيل', hex: '#DBEAFE' },
  { name: 'أخضر باستيل', hex: '#D1FAE5' },
  { name: 'ليلكي باستيل', hex: '#EDE9FE' },
  { name: 'خوخي', hex: '#FECACA' },
  { name: 'كشمير', hex: '#FECDD3' },
  { name: 'أسود مطفي', hex: '#1F2937' },
  { name: 'أبيض كريمي', hex: '#FEFCE8' },
  { name: 'رمادي فحمي', hex: '#27272A' },
]

export const PREDEFINED_SIZES = [
  // مقاسات عالمية
  'XXS', 'XS', 'S', 'M', 'L', 'XL', '2XL', '3XL', '4XL', '5XL',
  
  // مقاسات أحذية أوروبية
  '36', '37', '38', '39', '40', '41', '42', '43', '44', '45', '46', '47', '48',
  
  // مقاسات أطفال
  '1-2', '2-3', '3-4', '4-5', '5-6', '6-7', '7-8', '8-9', '9-10', '10-12', '12-14',
  
  // مقاسات عباءات ومعاطف
  '50', '52', '54', '56', '58', '60',
]

// ✅ دالة الحصول على HEX من الاسم
export function getColorHex(colorName: string): string {
  // إذا كان اللون HEX بالفعل
  if (colorName.startsWith('#')) {
    return colorName
  }
  
  // البحث في القائمة المعرّفة
  const color = PREDEFINED_COLORS.find(
    c => c.name === colorName || 
         c.name.toLowerCase() === colorName.toLowerCase() ||
         c.hex.toLowerCase() === colorName.toLowerCase()
  )
  
  // إرجاع HEX أو الرمادي كافتراضي
  return color?.hex || '#6B7280'
}

// ✅ دالة الحصول على الاسم من HEX
export function getColorName(hex: string): string {
  const color = PREDEFINED_COLORS.find(
    c => c.hex.toLowerCase() === hex.toLowerCase()
  )
  return color?.name || hex
}

// ✅ دالة للتحقق من اللون الفاتح
export function isLightColor(hex: string): boolean {
  // تحويل HEX إلى RGB
  const rgb = parseInt(hex.replace('#', ''), 16)
  const r = (rgb >> 16) & 0xff
  const g = (rgb >> 8) & 0xff
  const b = (rgb >> 0) & 0xff
  
  // حساب السطوع
  const brightness = (r * 299 + g * 587 + b * 114) / 1000
  
  return brightness > 155
}

// ✅ دالة للحصول على لون النص المناسب
export function getTextColorForBackground(hex: string): string {
  return isLightColor(hex) ? '#000000' : '#FFFFFF'
}

// ✅ دوال مساعدة للمقاسات
export function getSizeCategory(size: string): 'clothing' | 'shoes' | 'kids' | 'plus' {
  if (['XXS', 'XS', 'S', 'M', 'L', 'XL', '2XL', '3XL', '4XL', '5XL'].includes(size)) {
    return 'clothing'
  }
  if (['36', '37', '38', '39', '40', '41', '42', '43', '44', '45', '46', '47', '48'].includes(size)) {
    return 'shoes'
  }
  if (size.includes('-') || ['1-2', '2-3', '3-4', '4-5', '5-6', '6-7', '7-8', '8-9', '9-10', '10-12', '12-14'].includes(size)) {
    return 'kids'
  }
  return 'plus'
}

// ✅ مجموعات ألوان مقترحة
export const COLOR_GROUPS = {
  neutral: ['أسود', 'أبيض', 'رمادي', 'بيج', 'كريمي', 'رمادي فاتح'],
  warm: ['أحمر', 'برتقالي', 'أصفر', 'ذهبي', 'بني', 'خمري'],
  cool: ['أزرق', 'أخضر', 'بنفسجي', 'تركواز', 'كحلي', 'نيلي'],
  pastel: ['وردي فاتح', 'أزرق باستيل', 'أخضر باستيل', 'ليلكي باستيل', 'خوخي'],
  dark: ['أسود', 'كحلي', 'بني غامق', 'أخضر داكن', 'أزرق داكن', 'رمادي غامق'],
}