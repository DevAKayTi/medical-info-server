import mongoose, { Schema, Document, Types } from 'mongoose';

export interface IProductCategory extends Document {
  _id: Types.ObjectId;
  name: string;
  slug: string;
  description?: string;
  image: { url: string; publicId: string };
  parent?: Types.ObjectId | null;
  order: number;
  status: 'active' | 'inactive';
  deletedAt?: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

const productCategorySchema = new Schema<IProductCategory>(
  {
    name: { type: String, required: true, trim: true },
    slug: { type: String, required: true, unique: true, lowercase: true, index: true },
    description: { type: String },
    image: { url: { type: String, default: '' }, publicId: { type: String, default: '' } },
    parent: { type: Schema.Types.ObjectId, ref: 'ProductCategory', default: null },
    order: { type: Number, default: 0 },
    status: { type: String, enum: ['active', 'inactive'], default: 'active' },
    deletedAt: { type: Date, default: null },
  },
  { timestamps: true },
);

export const ProductCategory = mongoose.model<IProductCategory>('ProductCategory', productCategorySchema);
