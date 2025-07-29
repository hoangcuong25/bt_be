// app.controller.ts
import {
  Controller,
  Post,
} from '@nestjs/common';
import { CloudinaryService } from './cloudinary.service';

@Controller('image')
export class CloudinaryController {
  constructor(private readonly cloudinaryService: CloudinaryService) { }

  @Post('upload')
  uploadImage() {

  }
}