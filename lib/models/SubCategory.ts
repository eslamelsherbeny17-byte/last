import mongoose, { Schema, Document } from 'mongoose';

export interface ISubCategory extends Document {
  name: string;
  slug: string;
  category: mongoose.Types.ObjectId; // ✨ ده الحقل اللي بيربطها بالفئة الأساسية
  image?: string;
  createdAt: Date;
  updatedAt: Date;
}

const subCategorySchema = new Schema<ISubCategory>(
  {
    name: {
      type: String,
      required: [true, 'Please provide a subcategory name'],
      trim: true,
    },
    slug: {
      type: String,
      unique: true,
      lowercase: true,
    },
    category: {
      type: Schema.Types.ObjectId,
      ref: 'Category', // ✨ الربط بموديل الفئات
      required: [true, 'SubCategory must belong to a parent category'],
    },
    image: {
      type: String,
    },
  },
  { timestamps: true }
);

// توليد الـ Slug تلقائياً
subCategorySchema.pre('save', function () {
  if (!this.slug) {
    this.slug = this.name
      .toLowerCase()
      .replace(/[^\w\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-');
  }
});

export default mongoose.models.SubCategory || mongoose.model<ISubCategory>('SubCategory', subCategorySchema);