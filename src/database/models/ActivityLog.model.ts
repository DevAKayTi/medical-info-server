import mongoose, { Schema, Document, Types } from 'mongoose';

export interface IActivityLog extends Document {
  _id: Types.ObjectId;
  user: Types.ObjectId;
  action: string;
  module: string;
  ip?: string;
  timestamp: Date;
}

const activityLogSchema = new Schema<IActivityLog>(
  {
    user: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    action: { type: String, required: true },
    module: { type: String, required: true },
    ip: { type: String },
    timestamp: { type: Date, default: Date.now, index: true, expires: '90d' }, // TTL 90 days
  },
  { _id: true },
);

export const ActivityLog = mongoose.model<IActivityLog>('ActivityLog', activityLogSchema);
