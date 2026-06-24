import mongoose, { Schema, Document, Types } from 'mongoose';

export interface INews extends Document {
  _id: Types.ObjectId;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  coverImage: { url: string; publicId: string };
  category: string;
  tags: string[];
  author: Types.ObjectId;
  status: 'published' | 'draft' | 'scheduled' | 'archived';
  publishedAt?: Date | null;
  scheduledAt?: Date | null;
  featured: boolean;
  readingTime: number;
  viewCount: number;
  seo: { metaTitle?: string; metaDescription?: string; metaKeywords?: string };
  deletedAt?: Date | null;
  createdBy?: Types.ObjectId;
  updatedBy?: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const newsSchema = new Schema<INews>(
  {
    title: { type: String, required: true, trim: true },
    slug: { type: String, required: true, unique: true, lowercase: true, index: true },
    excerpt: { type: String, required: true, maxlength: 500 },
    content: { type: String, required: true },
    coverImage: { url: { type: String, default: '' }, publicId: { type: String, default: '' } },
    category: { type: String, required: true, index: true },
    tags: [{ type: String, lowercase: true }],
    author: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    status: {
      type: String,
      enum: ['published', 'draft', 'scheduled', 'archived'],
      default: 'draft',
      index: true,
    },
    publishedAt: { type: Date, default: null },
    scheduledAt: { type: Date, default: null },
    featured: { type: Boolean, default: false },
    readingTime: { type: Number, default: 0 },
    viewCount: { type: Number, default: 0 },
    seo: { metaTitle: String, metaDescription: String, metaKeywords: String },
    deletedAt: { type: Date, default: null },
    createdBy: { type: Schema.Types.ObjectId, ref: 'User' },
    updatedBy: { type: Schema.Types.ObjectId, ref: 'User' },
  },
  { timestamps: true },
);

// Auto-calculate reading time on save
newsSchema.pre('save', function (next) {
  const wordsPerMinute = 200;
  const wordCount = this.content.split(/\s+/).length;
  this.readingTime = Math.ceil(wordCount / wordsPerMinute);
  next();
});

newsSchema.index({ deletedAt: 1, status: 1 });

export const News = mongoose.model<INews>('News', newsSchema);
