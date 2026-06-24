import mongoose, { Schema, Document, Types } from 'mongoose';

export interface ICareer extends Document {
  _id: Types.ObjectId;
  title: string;
  slug: string;
  department: string;
  location: string;
  type: 'full-time' | 'part-time' | 'contract' | 'internship';
  experience: string;
  salaryRange: { min?: number; max?: number; currency: string; period: string };
  description: string;
  responsibilities: string[];
  requirements: string[];
  benefits: string[];
  status: 'active' | 'expired' | 'draft' | 'paused';
  deadline?: Date;
  applicantCount: number;
  seo: { metaTitle?: string; metaDescription?: string };
  deletedAt?: Date | null;
  postedAt?: Date;
  createdBy?: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const careerSchema = new Schema<ICareer>(
  {
    title: { type: String, required: true, trim: true, index: true },
    slug: { type: String, required: true, unique: true, lowercase: true, index: true },
    department: { type: String, required: true },
    location: { type: String, required: true },
    type: {
      type: String,
      enum: ['full-time', 'part-time', 'contract', 'internship'],
      required: true,
    },
    experience: { type: String, required: true },
    salaryRange: {
      min: Number,
      max: Number,
      currency: { type: String, default: 'USD' },
      period: { type: String, default: 'monthly' },
    },
    description: { type: String, required: true },
    responsibilities: [{ type: String }],
    requirements: [{ type: String }],
    benefits: [{ type: String }],
    status: {
      type: String,
      enum: ['active', 'expired', 'draft', 'paused'],
      default: 'draft',
      index: true,
    },
    deadline: { type: Date },
    applicantCount: { type: Number, default: 0 },
    seo: { metaTitle: String, metaDescription: String },
    deletedAt: { type: Date, default: null },
    postedAt: { type: Date },
    createdBy: { type: Schema.Types.ObjectId, ref: 'User' },
  },
  { timestamps: true },
);

export const Career = mongoose.model<ICareer>('Career', careerSchema);
