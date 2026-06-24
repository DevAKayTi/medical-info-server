import mongoose, { Schema, Document, Types } from 'mongoose';

export interface IAuditLog extends Document {
  _id: Types.ObjectId;
  user: Types.ObjectId;
  action: string;
  module: string;
  targetId?: string;
  changes?: { before?: Record<string, unknown>; after?: Record<string, unknown> };
  ip?: string;
  userAgent?: string;
  timestamp: Date;
}

const auditLogSchema = new Schema<IAuditLog>(
  {
    user: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    action: { type: String, required: true },
    module: { type: String, required: true, index: true },
    targetId: { type: String },
    changes: {
      before: { type: Schema.Types.Mixed },
      after: { type: Schema.Types.Mixed },
    },
    ip: { type: String },
    userAgent: { type: String },
    timestamp: { type: Date, default: Date.now, index: true, expires: '180d' }, // TTL 180 days
  },
  { _id: true },
);

export const AuditLog = mongoose.model<IAuditLog>('AuditLog', auditLogSchema);
