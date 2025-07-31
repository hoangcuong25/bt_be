import { Injectable } from '@nestjs/common';
import { v2 as cloudinary } from 'cloudinary';
import { CloudinaryResponse } from './cloudinary-response';
import { Readable } from 'stream';

@Injectable()
export class CloudinaryService {
  uploadFile(file: Express.Multer.File): Promise<CloudinaryResponse> {
    return new Promise<CloudinaryResponse>((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          resource_type: 'auto',
        },
        (error, result) => {
          if (error) return reject(error);
          if (result) {
            resolve(result);
          } else {
            reject(new Error('Upload result is undefined'));
          }
        }
      );

      const bufferStream = new Readable({
        read() {
          this.push(file.buffer);
          this.push(null);
        },
      });

      bufferStream.pipe(uploadStream);
    });
  }

  async deleteFile(publicId: string) {
    return await cloudinary.uploader.destroy(publicId);
  }

  extractPublicId(url: string): string | null {
    try {
      const parts = url.split('/');
      const filename = parts[parts.length - 1];
      const publicId = filename.split('.')[0];
      const folder = parts.slice(-2, -1)[0];
      return `${folder}/${publicId}`;
    } catch {
      return null;
    }
  }
}
