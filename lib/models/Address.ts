import mongoose, { Schema, Document } from 'mongoose';

export interface IAddress extends Document {
  user: mongoose.Types.ObjectId;
  alias: string;     // بدل fullName (منزل، عمل، آخر)
  details: string;   // بدل address (تفاصيل الشارع ورقم العمارة)
  phone: string;
  city: string;
  postalCode?: string; // اختياري زي ما الفرونت إند عامله
  createdAt: Date;
  updatedAt: Date;
}

const addressSchema = new Schema<IAddress>(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    alias: {
      type: String,
      required: true,
      default: 'home',
    },
    details: {
      type: String,
      required: true,
    },
    phone: {
      type: String,
      required: true,
    },
    city: {
      type: String,
      required: true,
    },
    postalCode: {
      type: String,
      default: '',
    },
  },
  { timestamps: true }
);

export default mongoose.models.Address || mongoose.model<IAddress>('Address', addressSchema);