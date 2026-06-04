import mongoose from 'mongoose'

const notificationSchema = new mongoose.Schema(
  {
    type: {
      type: String,
      enum: ['order', 'stock', 'review', 'system'], // أنواع الإشعارات
      required: true,
    },
    title: {
      type: String,
      required: true,
    },
    message: {
      type: String,
      required: true,
    },
    link: {
      type: String, // الرابط اللي هيروحله لما يضغط على الإشعار (مثلا صفحة الطلب)
      required: true,
    },
    isRead: {
      type: Boolean,
      default: false, // افتراضياً الإشعار مش مقروء
    },
  },
  { timestamps: true }
)

export default mongoose.models.Notification || mongoose.model('Notification', notificationSchema)