import mongoose, { Schema, Document, Types } from 'mongoose';

export interface ISettings extends Document {
  key: string;
  companyName: string;
  tagline?: string;
  description?: string;
  logo: { url: string; publicId: string };
  favicon: { url: string; publicId: string };
  contact: {
    email?: string;
    phone?: string;
    address?: string;
    mapUrl?: string;
  };
  social: {
    linkedin?: string;
    twitter?: string;
    facebook?: string;
    instagram?: string;
    youtube?: string;
  };
  seo: {
    defaultTitle?: string;
    defaultDescription?: string;
    googleAnalyticsId?: string;
  };
  notifications: {
    emailOnInquiry: boolean;
    emailOnApplicant: boolean;
    adminEmail?: string;
  };
  maintenance: {
    enabled: boolean;
    message?: string;
  };
  updatedBy?: Types.ObjectId;
  updatedAt: Date;
}

const settingsSchema = new Schema<ISettings>(
  {
    key: { type: String, required: true, unique: true, default: 'site_settings' },
    companyName: { type: String, required: true, default: 'MediSource Global' },
    tagline: { type: String },
    description: { type: String },
    logo: { url: { type: String, default: '' }, publicId: { type: String, default: '' } },
    favicon: { url: { type: String, default: '' }, publicId: { type: String, default: '' } },
    contact: {
      email: String,
      phone: String,
      address: String,
      mapUrl: String,
    },
    social: {
      linkedin: String,
      twitter: String,
      facebook: String,
      instagram: String,
      youtube: String,
    },
    seo: {
      defaultTitle: String,
      defaultDescription: String,
      googleAnalyticsId: String,
    },
    notifications: {
      emailOnInquiry: { type: Boolean, default: true },
      emailOnApplicant: { type: Boolean, default: true },
      adminEmail: String,
    },
    maintenance: {
      enabled: { type: Boolean, default: false },
      message: String,
    },
    updatedBy: { type: Schema.Types.ObjectId, ref: 'User' },
  },
  { timestamps: true },
);

export const Settings = mongoose.model<ISettings>('Settings', settingsSchema);
