import mongoose, { Schema, Document, Types } from 'mongoose';

export interface IGallery extends Document {
  _id: Types.ObjectId;
  title: string;
  description?: string;
  image: { url: string; publicId: string; width?: number; height?: number; format?: string; bytes?: number };
  thumbnail: { url: string; publicId: string };
  category?: string;
  tags: string[];
  alt: string;
  featured: boolean;
  order: number;
  deletedAt?: Date | null;
  uploadedBy?: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const gallerySchema = new Schema<IGallery>(
  {
    title: { type: String, required: true, trim: true },
    description: { type: String },
    image: {
      url: { type: String, required: true },
      publicId: { type: String, required: true },
      width: Number,
      height: Number,
      format: String,
      bytes: Number,
    },
    thumbnail: { url: { type: String, default: '' }, publicId: { type: String, default: '' } },
    category: { type: String, trim: true, index: true },
    tags: [{ type: String, lowercase: true }],
    alt: { type: String, required: true },
    featured: { type: Boolean, default: false },
    order: { type: Number, default: 0 },
    deletedAt: { type: Date, default: null },
    uploadedBy: { type: Schema.Types.ObjectId, ref: 'User' },
  },
  { timestamps: true },
);

export const Gallery = mongoose.model<IGallery>('Gallery', gallerySchema);
