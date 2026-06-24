import mongoose, { Schema, Document, Types } from 'mongoose';

export interface IApplicant extends Document {
  _id: Types.ObjectId;
  job: Types.ObjectId;
  name: string;
  email: string;
  phone: string;
  yearsOfExperience?: number;
  coverLetter?: string;
  resume: { url: string; publicId: string; filename: string };
  status: 'new' | 'reviewing' | 'shortlisted' | 'rejected' | 'hired';
  notes?: string;
  reviewedBy?: Types.ObjectId | null;
  createdAt: Date;
  updatedAt: Date;
}

const applicantSchema = new Schema<IApplicant>(
  {
    job: { type: Schema.Types.ObjectId, ref: 'Career', required: true, index: true },
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, lowercase: true, index: true },
    phone: { type: String, required: true },
    yearsOfExperience: { type: Number },
    coverLetter: { type: String },
    resume: {
      url: { type: String, required: true },
      publicId: { type: String, required: true },
      filename: { type: String, required: true },
    },
    status: {
      type: String,
      enum: ['new', 'reviewing', 'shortlisted', 'rejected', 'hired'],
      default: 'new',
      index: true,
    },
    notes: { type: String },
    reviewedBy: { type: Schema.Types.ObjectId, ref: 'User', default: null },
  },
  { timestamps: true },
);

export const Applicant = mongoose.model<IApplicant>('Applicant', applicantSchema);
