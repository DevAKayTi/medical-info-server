import mongoose, { Schema, Document, Types } from 'mongoose';

export interface IBrand extends Document {
  _id: Types.ObjectId;
  name: string;
  slug: string;
  category?: string;
  country?: string;
  description?: string;
  logo: { url: string; publicId: string };
  website?: string;
  featured: boolean;
  since?: number;
  status: 'active' | 'inactive';
  deletedAt?: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

const brandSchema = new Schema<IBrand>(
  {
    name: { type: String, required: true, trim: true, index: true },
    slug: { type: String, required: true, unique: true, lowercase: true, index: true },
    category: { type: String, trim: true },
    country: { type: String, trim: true },
    description: { type: String },
    logo: { url: { type: String, default: '' }, publicId: { type: String, default: '' } },
    website: { type: String },
    featured: { type: Boolean, default: false },
    since: { type: Number },
    status: { type: String, enum: ['active', 'inactive'], default: 'active', index: true },
    deletedAt: { type: Date, default: null },
  },
  { timestamps: true },
);

export const Brand = mongoose.model<IBrand>('Brand', brandSchema);
