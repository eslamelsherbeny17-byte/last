import mongoose from 'mongoose';

const settingsSchema = new mongoose.Schema(
  {
    siteName: { type: String, default: 'متجر أيمن بشير' },
    siteDescription: { type: String, default: 'متجر متخصص في الأزياء الإسلامية العصرية' },
    email: { type: String, default: '' },
    phone: { type: String, default: '' },
    address: { type: String, default: '' },
    
    // 🌟 روابط السوشيال ميديا 
    facebook: { type: String, default: '' },
    instagram: { type: String, default: '' },
    twitter: { type: String, default: '' },
    whatsapp: { type: String, default: '' },

    // ✨ نصوص الشريط العلوي (الإعلانات)
    announcement1: { type: String, default: 'شحن مجاني للطلبات فوق 500 جنيه' },
    announcement2: { type: String, default: 'خصم 20% على جميع المنتجات' },

    freeShippingThreshold: { type: Number, default: 0 },
    shippingCost: { type: Number, default: 0 },
    taxRate: { type: Number, default: 0 },
    currency: { type: String, default: 'EGP' },
    emailNotifications: { type: Boolean, default: true },
    smsNotifications: { type: Boolean, default: false },
    maintenanceMode: { type: Boolean, default: false },
    acceptCashOnDelivery: { type: Boolean, default: true },
  },
  { timestamps: true }
);

export default mongoose.models.Settings || mongoose.model('Settings', settingsSchema);