import mongoose, { Schema, Document, Types } from 'mongoose';
import { Permission } from '../../constants/permissions';

export interface IRole extends Document {
  _id: Types.ObjectId;
  name: string;
  displayName: string;
  permissions: Permission[];
  isSystem: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const roleSchema = new Schema<IRole>(
  {
    name: { type: String, required: true, unique: true, lowercase: true, trim: true },
    displayName: { type: String, required: true, trim: true },
    permissions: [{ type: String }],
    isSystem: { type: Boolean, default: false },
  },
  { timestamps: true },
);

export const Role = mongoose.model<IRole>('Role', roleSchema);
