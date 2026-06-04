import mongoose, { Schema, Document } from 'mongoose';

export interface IProduct extends Document {
  title: string;
  titleAr: string;
  slug: string;
  description: string;
  descriptionAr: string;
  price: number;
  priceAfterDiscount?: number;
  imageCover: string;
  images: string[];
  colors?: string[];
  sizes?: string[];
  category: mongoose.Types.ObjectId; // 👈 إجباري
  subCategory?: mongoose.Types.ObjectId; // ✨ اختياري (جديد)
  brand?: mongoose.Types.ObjectId; // 👈 اختياري
  quantity: number;
  sold: number;
  ratingsAverage: number;
  ratingsQuantity: number;
  reviews: mongoose.Types.ObjectId[];
  createdAt: Date;
  updatedAt: Date;
}

const productSchema = new Schema<IProduct>(
  {
    title: {
      type: String,
      required: [true, 'Please provide a product title'],
      trim: true,
    },
    titleAr: {
      type: String,
      trim: true,
    },
    slug: {
      type: String,
      unique: true,
      lowercase: true,
    },
    description: {
      type: String,
      required: true,
    },
    descriptionAr: {
      type: String,
    },
    price: {
      type: Number,
      required: [true, 'Please provide a price'],
    },
    priceAfterDiscount: Number,
    imageCover: {
      type: String,
      required: true,
    },
    images: [String],
    colors: [String], // اختياري بطبيعته
    sizes: [String], // اختياري بطبيعته
    category: {
      type: Schema.Types.ObjectId,
      ref: 'Category',
      required: [true, 'Product must belong to a primary category'], // إجباري
    },
    subCategory: {
      type: Schema.Types.ObjectId,
      ref: 'SubCategory',
      // بدون required عشان يكون اختياري
    },
    brand: {
      type: Schema.Types.ObjectId,
      ref: 'Brand',
      // بدون required عشان يكون اختياري
    },
    quantity: {
      type: Number,
      default: 0,
    },
    sold: {
      type: Number,
      default: 0,
    },
    ratingsAverage: {
      type: Number,
      default: 0,
      min: 0,
      max: 5,
    },
    ratingsQuantity: {
      type: Number,
      default: 0,
    },
    reviews: [
      {
        type: Schema.Types.ObjectId,
        ref: 'Review',
      },
    ],
  },
  { timestamps: true }
);

// Generate slug from title - supports Arabic characters
productSchema.pre('save', function () {
  if (!this.slug) {
    this.slug = this.title
      .toLowerCase()
      .replace(/[^\w\s\u0600-\u06FF-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-');
  }
});

export default mongoose.models.Product || mongoose.model<IProduct>('Product', productSchema);