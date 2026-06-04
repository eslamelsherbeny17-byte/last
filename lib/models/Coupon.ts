import mongoose, { Schema, Document } from 'mongoose';

export interface ICoupon extends Document {
  name: string;      // بدلاً من code
  discount: number;
  expire: Date;      // بدلاً من expiresAt
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const couponSchema = new Schema<ICoupon>(
  {
    name: {
      type: String,
      required: true,
      unique: true,
      uppercase: true, // بيحول الكود لحروف كبيرة تلقائياً
    },
    discount: {
      type: Number,
      required: true,
    },
    expire: {
      type: Date,
      required: true,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

export default mongoose.models.Coupon || mongoose.model<ICoupon>('Coupon', couponSchema);