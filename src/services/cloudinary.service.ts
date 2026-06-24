import { v2 as cloudinarySDK, UploadApiResponse } from 'cloudinary';
import { env } from '../config/env';

interface UploadOptions {
  folder?: string;
  transformation?: object[];
  resourceType?: 'image' | 'video' | 'raw' | 'auto';
}

export const cloudinaryService = {
  async uploadBuffer(
    buffer: Buffer,
    options: UploadOptions = {},
  ): Promise<UploadApiResponse> {
    if (!env.CLOUDINARY_CLOUD_NAME) {
      throw new Error('Cloudinary not configured');
    }

    return new Promise((resolve, reject) => {
      const uploadStream = cloudinarySDK.uploader.upload_stream(
        {
          folder: options.folder ?? 'medisource',
          resource_type: options.resourceType ?? 'image',
          transformation: options.transformation ?? [
            { quality: 'auto:good' },
            { fetch_format: 'auto' },
          ],
        },
        (error, result) => {
          if (error || !result) return reject(error ?? new Error('Upload failed'));
          resolve(result);
        },
      );
      uploadStream.end(buffer);
    });
  },

  async uploadImage(buffer: Buffer, folder = 'medisource/images'): Promise<{
    url: string;
    publicId: string;
    width: number;
    height: number;
    format: string;
    bytes: number;
  }> {
    const result = await this.uploadBuffer(buffer, { folder });
    return {
      url: result.secure_url,
      publicId: result.public_id,
      width: result.width,
      height: result.height,
      format: result.format,
      bytes: result.bytes,
    };
  },

  async uploadDocument(buffer: Buffer, folder = 'medisource/documents'): Promise<{
    url: string;
    publicId: string;
    filename: string;
    size: number;
  }> {
    const result = await this.uploadBuffer(buffer, { folder, resourceType: 'raw' });
    return {
      url: result.secure_url,
      publicId: result.public_id,
      filename: result.original_filename ?? result.public_id,
      size: result.bytes,
    };
  },

  async deleteFile(publicId: string, resourceType: 'image' | 'raw' = 'image'): Promise<void> {
    if (!env.CLOUDINARY_CLOUD_NAME) return;
    await cloudinarySDK.uploader.destroy(publicId, { resource_type: resourceType });
  },

  getThumbnailUrl(publicId: string, width = 200, height = 200): string {
    return cloudinarySDK.url(publicId, {
      transformation: [{ width, height, crop: 'fill', quality: 'auto' }],
    });
  },
};
