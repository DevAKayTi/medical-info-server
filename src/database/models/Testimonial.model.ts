import mongoose, { Schema, Document, Types } from 'mongoose';

export interface ITestimonial extends Document {
  _id: Types.ObjectId;
  name: string;
  position?: string;
  company?: string;
  avatar: { url: string; publicId: string };
  content: string;
  rating: number;
  featured: boolean;
  status: 'active' | 'inactive';
  deletedAt?: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

const testimonialSchema = new Schema<ITestimonial>(
  {
    name: { type: String, required: true, trim: true },
    position: { type: String, trim: true },
    company: { type: String, trim: true },
    avatar: { url: { type: String, default: '' }, publicId: { type: String, default: '' } },
    content: { type: String, required: true },
    rating: { type: Number, min: 1, max: 5, default: 5 },
    featured: { type: Boolean, default: false },
    status: { type: String, enum: ['active', 'inactive'], default: 'active' },
    deletedAt: { type: Date, default: null },
  },
  { timestamps: true },
);

export const Testimonial = mongoose.model<ITestimonial>('Testimonial', testimonialSchema);
