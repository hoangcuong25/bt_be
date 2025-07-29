// cloudinary.service.ts

import { Injectable } from '@nestjs/common';
import { v2 as cloudinary } from 'cloudinary';
import { CloudinaryResponse } from './cloudinary-response';
const streamifier = require('streamifier');

@Injectable()
export class CloudinaryService {
    uploadFile(file: Express.Multer.File): Promise<CloudinaryResponse> {
        return new Promise<CloudinaryResponse>((resolve, reject) => {
            const uploadStream = cloudinary.uploader.upload_stream(
                (error, result) => {
                    if (error) return reject(error);
                    if (result) {
                        resolve(result);
                    } else {
                        reject(new Error('Upload result is undefined'));
                    }
                },
            );

            streamifier.createReadStream(file.buffer).pipe(uploadStream);
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