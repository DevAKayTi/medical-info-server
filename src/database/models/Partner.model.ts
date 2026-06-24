import mongoose, { Schema, Document, Types } from 'mongoose';

export interface IPartner extends Document {
  _id: Types.ObjectId;
  name: string;
  logo: { url: string; publicId: string };
  website?: string;
  description?: string;
  order: number;
  featured: boolean;
  status: 'active' | 'inactive';
  deletedAt?: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

const partnerSchema = new Schema<IPartner>(
  {
    name: { type: String, required: true, trim: true },
    logo: { url: { type: String, default: '' }, publicId: { type: String, default: '' } },
    website: { type: String },
    description: { type: String },
    order: { type: Number, default: 0 },
    featured: { type: Boolean, default: false },
    status: { type: String, enum: ['active', 'inactive'], default: 'active' },
    deletedAt: { type: Date, default: null },
  },
  { timestamps: true },
);

export const Partner = mongoose.model<IPartner>('Partner', partnerSchema);
