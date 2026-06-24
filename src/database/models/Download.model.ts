import mongoose, { Schema, Document, Types } from 'mongoose';

export interface IDownload extends Document {
  _id: Types.ObjectId;
  title: string;
  slug: string;
  description?: string;
  category: string;
  file: { url: string; publicId: string; filename: string; size?: number; mimeType?: string };
  thumbnail: { url: string; publicId: string };
  tags: string[];
  downloadCount: number;
  requiresAuth: boolean;
  status: 'active' | 'inactive';
  deletedAt?: Date | null;
  createdBy?: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const downloadSchema = new Schema<IDownload>(
  {
    title: { type: String, required: true, trim: true },
    slug: { type: String, required: true, unique: true, lowercase: true },
    description: { type: String },
    category: { type: String, required: true },
    file: {
      url: { type: String, required: true },
      publicId: { type: String, required: true },
      filename: { type: String, required: true },
      size: Number,
      mimeType: String,
    },
    thumbnail: { url: { type: String, default: '' }, publicId: { type: String, default: '' } },
    tags: [{ type: String }],
    downloadCount: { type: Number, default: 0 },
    requiresAuth: { type: Boolean, default: false },
    status: { type: String, enum: ['active', 'inactive'], default: 'active' },
    deletedAt: { type: Date, default: null },
    createdBy: { type: Schema.Types.ObjectId, ref: 'User' },
  },
  { timestamps: true },
);

export const Download = mongoose.model<IDownload>('Download', downloadSchema);
