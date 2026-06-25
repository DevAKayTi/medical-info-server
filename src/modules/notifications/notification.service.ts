import { Notification } from '../../database/models/Notification.model';
import { AppError } from '../../shared/AppError';
import { Types } from 'mongoose';

export const notificationService = {
  async getMyNotifications(userId: string, page = 1, limit = 20) {
    const skip = (page - 1) * limit;
    const [data, total, unreadCount] = await Promise.all([
      Notification.find({ recipient: userId })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      Notification.countDocuments({ recipient: userId }),
      Notification.countDocuments({ recipient: userId, read: false }),
    ]);

    return {
      data,
      meta: {
        total,
        page,
        limit,
        pages: Math.ceil(total / limit),
        hasNext: page < Math.ceil(total / limit),
        hasPrev: page > 1,
        unreadCount,
      },
    };
  },

  async markAsRead(id: string, userId: string) {
    const notification = await Notification.findOneAndUpdate(
      { _id: id, recipient: userId },
      { read: true },
      { new: true },
    );
    if (!notification) throw AppError.notFound('Notification');
    return notification;
  },

  async markAllAsRead(userId: string) {
    await Notification.updateMany({ recipient: userId, read: false }, { read: true });
    return { message: 'All notifications marked as read' };
  },

  async deleteNotification(id: string, userId: string) {
    const result = await Notification.deleteOne({ _id: id, recipient: userId });
    if (result.deletedCount === 0) throw AppError.notFound('Notification');
  },

  async getUnreadCount(userId: string) {
    return Notification.countDocuments({ recipient: userId, read: false });
  },

  // Utility: create a notification for a user
  async create(data: {
    recipient: string | Types.ObjectId;
    type: 'inquiry' | 'applicant' | 'system' | 'warning';
    title: string;
    message: string;
    link?: string;
  }) {
    return Notification.create(data);
  },

  // Utility: create notification for all admin users
  async broadcast(type: 'inquiry' | 'applicant' | 'system' | 'warning', title: string, message: string, link?: string) {
    const { User } = await import('../../database/models/User.model');
    const admins = await User.find({ status: 'active', deletedAt: null }).select('_id').lean();
    const notifications = admins.map((a) => ({ recipient: a._id, type, title, message, link }));
    if (notifications.length > 0) {
      await Notification.insertMany(notifications);
    }
  },
};
