import { Settings } from '../../database/models/Settings.model';
import { cloudinaryService } from '../../services/cloudinary.service';
import { AppError } from '../../shared/AppError';

const SETTINGS_KEY = 'site_settings';

export const settingsService = {
  async getSettings() {
    const existing = await Settings.findOne({ key: SETTINGS_KEY }).lean();
    if (existing) return existing;
    await Settings.create({ key: SETTINGS_KEY, companyName: 'MediSource Global' });
    return Settings.findOne({ key: SETTINGS_KEY }).lean();
  },

  async updateSettings(data: Record<string, unknown>, updatedBy: string) {
    const settings = await Settings.findOneAndUpdate(
      { key: SETTINGS_KEY },
      { $set: { ...data, updatedBy } },
      { new: true, upsert: true, runValidators: true },
    ).lean();
    return settings;
  },

  async uploadLogo(buffer: Buffer, updatedBy: string) {
    const image = await cloudinaryService.uploadImage(buffer, 'medisource/brand');
    return this.updateSettings({ logo: { url: image.url, publicId: image.publicId } }, updatedBy);
  },

  async uploadFavicon(buffer: Buffer, updatedBy: string) {
    const image = await cloudinaryService.uploadImage(buffer, 'medisource/brand');
    return this.updateSettings({ favicon: { url: image.url, publicId: image.publicId } }, updatedBy);
  },
};
