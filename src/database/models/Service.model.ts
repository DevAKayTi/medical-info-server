import mongoose, { Schema, Document, Types } from 'mongoose';

export interface IService extends Document {
  _id: Types.ObjectId;
  title: string;
  slug: string;
  excerpt: string;
  description: string;
  icon?: string;
  image: { url: string; publicId: string };
  features: string[];
  order: number;
  featured: boolean;
  status: 'active' | 'inactive';
  deletedAt?: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

const serviceSchema = new Schema<IService>(
  {
    title: { type: String, required: true, trim: true },
    slug: { type: String, required: true, unique: true, lowercase: true },
    excerpt: { type: String, required: true },
    description: { type: String, required: true },
    icon: { type: String },
    image: { url: { type: String, default: '' }, publicId: { type: String, default: '' } },
    features: [{ type: String }],
    order: { type: Number, default: 0 },
    featured: { type: Boolean, default: false },
    status: { type: String, enum: ['active', 'inactive'], default: 'active' },
    deletedAt: { type: Date, default: null },
  },
  { timestamps: true },
);

export const Service = mongoose.model<IService>('Service', serviceSchema);
