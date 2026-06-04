import mongoose, { Schema, Document } from 'mongoose';

export interface ICartItem {
  product: mongoose.Types.ObjectId;
  quantity: number;
  price: number;
  color?: string;
  size?: string;
}

export interface ICart extends Document {
  user: mongoose.Types.ObjectId;
  cartItems: ICartItem[]; // تم التعديل لتطابق الفرونت إند
  totalCartPrice: number; // تم التعديل لتطابق الفرونت إند
  totalPriceAfterDiscount?: number;
  createdAt: Date;
  updatedAt: Date;
}

const cartSchema = new Schema<ICart>(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true,
    },
    cartItems: [
      {
        product: {
          type: Schema.Types.ObjectId,
          ref: 'Product',
          required: true,
        },
        quantity: {
          type: Number,
          required: true,
          default: 1,
        },
        price: {
          type: Number,
          required: true,
        },
        color: String,
        size: String,
      },
    ],
    totalCartPrice: {
      type: Number,
      default: 0,
    },
    totalPriceAfterDiscount: Number,
  },
  { timestamps: true }
);

// حساب المجموع الكلي قبل الحفظ
cartSchema.pre('save', function () {
  this.totalCartPrice = this.cartItems.reduce((total, item) => {
    return total + item.price * item.quantity;
  }, 0);
});

export default mongoose.models.Cart || mongoose.model<ICart>('Cart', cartSchema);