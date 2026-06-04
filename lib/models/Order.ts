import mongoose, { Schema, Document } from 'mongoose';

export interface IOrderItem {
  product: mongoose.Types.ObjectId;
  quantity: number;
  price: number;
  color?: string;
  size?: string;
}

export interface IOrder extends Document {
  user: mongoose.Types.ObjectId;
  cartItems: IOrderItem[];
  totalOrderPrice: number;
  taxPrice: number;
  shippingPrice: number;
  shippingAddress: {
    details: string;
    phone: string;
    city: string;
    postalCode?: string;
  };
  paymentMethodType: string;
  isPaid: boolean;
  paidAt?: Date;
  isDelivered: boolean;
  deliveredAt?: Date;
  status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  shippedAt?: Date;
  processingAt?: Date;
  cancelReason?: string;
  trackingNumber?: string;
  createdAt: Date;
  updatedAt: Date;
}

const orderSchema = new Schema<IOrder>(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    cartItems: [
      {
        product: {
          type: Schema.Types.ObjectId,
          ref: 'Product',
          required: true,
        },
        quantity: { type: Number, required: true },
        price: { type: Number, required: true },
        color: String,
        size: String,
      },
    ],
    totalOrderPrice: { type: Number, required: true },
    taxPrice: { type: Number, default: 0 },
    shippingPrice: { type: Number, default: 0 },
    shippingAddress: {
      details: { type: String, required: true },
      phone: { type: String, required: true },
      city: { type: String, required: true },
      postalCode: String,
    },
    paymentMethodType: { type: String, required: true, default: 'cash' },
    isPaid: { type: Boolean, default: false },
    paidAt: Date,
    isDelivered: { type: Boolean, default: false },
    deliveredAt: Date,
    status: {
      type: String,
      enum: ['pending', 'processing', 'shipped', 'delivered', 'cancelled'],
      default: 'pending',
    },
    shippedAt: Date,
    processingAt: Date,
    cancelReason: String,
    trackingNumber: String,
  },
  { timestamps: true }
);

export default mongoose.models.Order || mongoose.model<IOrder>('Order', orderSchema);