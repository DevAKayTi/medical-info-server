import mongoose, { Schema, Document, Types } from 'mongoose';

export interface IUser extends Document {
  _id: Types.ObjectId;
  name: string;
  email: string;
  password: string;
  role: Types.ObjectId;
  avatar: { url: string; publicId: string };
  phone?: string;
  status: 'active' | 'inactive' | 'suspended';
  lastLogin?: Date;
  passwordChangedAt?: Date;
  refreshTokens: string[];
  passwordResetToken?: string;
  passwordResetExpires?: Date;
  deletedAt?: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

const userSchema = new Schema<IUser>(
  {
    name: { type: String, required: true, trim: true, maxlength: 100 },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true, index: true },
    password: { type: String, required: true, select: false },
    role: { type: Schema.Types.ObjectId, ref: 'Role', required: true },
    avatar: {
      url: { type: String, default: '' },
      publicId: { type: String, default: '' },
    },
    phone: { type: String, trim: true },
    status: { type: String, enum: ['active', 'inactive', 'suspended'], default: 'active', index: true },
    lastLogin: { type: Date },
    passwordChangedAt: { type: Date },
    refreshTokens: [{ type: String, select: false }],
    passwordResetToken: { type: String, select: false },
    passwordResetExpires: { type: Date, select: false },
    deletedAt: { type: Date, default: null },
  },
  {
    timestamps: true,
    toJSON: {
      virtuals: true,
      transform: (_doc, ret) => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const r = ret as any;
        r.password = undefined;
        r.refreshTokens = undefined;
        r.passwordResetToken = undefined;
        r.passwordResetExpires = undefined;
        return r;
      },
    },
  },
);

userSchema.index({ deletedAt: 1 });

export const User = mongoose.model<IUser>('User', userSchema);
