import mongoose, { Schema, Document, Types } from 'mongoose';

export interface IProduct extends Document {
  _id: Types.ObjectId;
  name: string;
  slug: string;
  sku: string;
  description: string;
  shortDescription?: string;
  category: Types.ObjectId;
  brand?: Types.ObjectId;
  images: { url: string; publicId: string; isPrimary: boolean }[];
  specifications: { label: string; value: string }[];
  tags: string[];
  inStock: boolean;
  featured: boolean;
  status: 'active' | 'inactive' | 'draft';
  seo: { metaTitle?: string; metaDescription?: string; metaKeywords?: string };
  viewCount: number;
  deletedAt?: Date | null;
  createdBy?: Types.ObjectId;
  updatedBy?: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const productSchema = new Schema<IProduct>(
  {
    name: { type: String, required: true, trim: true, index: true },
    slug: { type: String, required: true, unique: true, lowercase: true, index: true },
    sku: { type: String, required: true, unique: true, uppercase: true, index: true },
    description: { type: String, required: true },
    shortDescription: { type: String },
    category: { type: Schema.Types.ObjectId, ref: 'ProductCategory', required: true, index: true },
    brand: { type: Schema.Types.ObjectId, ref: 'Brand' },
    images: [
      {
        url: { type: String, required: true },
        publicId: { type: String, required: true },
        isPrimary: { type: Boolean, default: false },
      },
    ],
    specifications: [{ label: String, value: String }],
    tags: [{ type: String, lowercase: true }],
    inStock: { type: Boolean, default: true },
    featured: { type: Boolean, default: false, index: true },
    status: { type: String, enum: ['active', 'inactive', 'draft'], default: 'draft', index: true },
    seo: {
      metaTitle: { type: String },
      metaDescription: { type: String },
      metaKeywords: { type: String },
    },
    viewCount: { type: Number, default: 0 },
    deletedAt: { type: Date, default: null },
    createdBy: { type: Schema.Types.ObjectId, ref: 'User' },
    updatedBy: { type: Schema.Types.ObjectId, ref: 'User' },
  },
  { timestamps: true, toJSON: { virtuals: true } },
);

productSchema.index({ deletedAt: 1, status: 1 });
productSchema.index({ tags: 1 });

// Virtual: primaryImage
productSchema.virtual('primaryImage').get(function () {
  return this.images.find((img) => img.isPrimary) ?? this.images[0] ?? null;
});

export const Product = mongoose.model<IProduct>('Product', productSchema);
