import mongoose, { Schema, Document, Types } from 'mongoose';

export interface ICertification extends Document {
  _id: Types.ObjectId;
  name: string;
  slug: string;
  issuer: string;
  type: 'ISO' | 'GMP' | 'FDA' | 'WHO' | 'CE' | 'Other';
  description?: string;
  image: { url: string; publicId: string };
  document: { url: string; publicId: string; filename: string };
  issueDate: Date;
  expiryDate: Date;
  status: 'valid' | 'expired' | 'pending';
  deletedAt?: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

const certificationSchema = new Schema<ICertification>(
  {
    name: { type: String, required: true, trim: true },
    slug: { type: String, required: true, unique: true, lowercase: true, index: true },
    issuer: { type: String, required: true, trim: true },
    type: {
      type: String,
      enum: ['ISO', 'GMP', 'FDA', 'WHO', 'CE', 'Other'],
      required: true,
    },
    description: { type: String },
    image: { url: { type: String, default: '' }, publicId: { type: String, default: '' } },
    document: {
      url: { type: String, default: '' },
      publicId: { type: String, default: '' },
      filename: { type: String, default: '' },
    },
    issueDate: { type: Date, required: true },
    expiryDate: { type: Date, required: true },
    status: { type: String, enum: ['valid', 'expired', 'pending'], default: 'pending', index: true },
    deletedAt: { type: Date, default: null },
  },
  { timestamps: true },
);

// Auto-update status based on dates
certificationSchema.pre('save', function (next) {
  const now = new Date();
  if (this.expiryDate < now) {
    this.status = 'expired';
  } else if (this.issueDate <= now && this.expiryDate >= now) {
    this.status = 'valid';
  }
  next();
});

export const Certification = mongoose.model<ICertification>('Certification', certificationSchema);
