import { JwtAuthGuard } from "../auth/jwt-auth.guard";
import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  HttpStatus,
  HttpException,
  UseGuards,
  Put,
  Res,
  UploadedFile,
  UseInterceptors,
} from "@nestjs/common";
import { PostService } from "./post.service";
import { CreatePostDto } from "./dto/create-post.dto";
import { UpdatePostDto } from "./dto/update-post.dto";
import { Response } from "express";
import { CloudinaryService } from "src/cloudinary/cloudinary.service";
import { FileInterceptor } from "@nestjs/platform-express";

@Controller('post')
export class PostController {
  constructor(
    private readonly postService: PostService,
    private readonly cloudinaryService: CloudinaryService,
  ) { }

  @UseGuards(JwtAuthGuard)
  @Post()
  @UseInterceptors(FileInterceptor("file"))
  async create(
    @Body() createPostDto: CreatePostDto,
    @UploadedFile() file: Express.Multer.File,
    @Res() res: Response,
  ) {
    try {
      let imageUrl = "";
      if (file) {
        const uploadResult = await this.cloudinaryService.uploadFile(file);
        imageUrl = uploadResult.secure_url;
      }
      const created = await this.postService.create({
        ...createPostDto,
        imageUrl,
      });
      return res.status(HttpStatus.CREATED).json({
        statusCode: HttpStatus.CREATED,
        message: "Post created successfully",
        data: created,
      });
    } catch (error) {
      throw new HttpException(
        error.message,
        error.status || HttpStatus.BAD_REQUEST,
      );
    }
  }


  @Get()
  async findAll(@Res() res: Response) {
    try {
      const posts = await this.postService.findAll();
      return res.status(HttpStatus.OK).json({
        statusCode: HttpStatus.OK,
        data: posts,
      });
    } catch (error) {
      throw new HttpException(
        error.message,
        error.status || HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Get(":id")
  async findOne(@Param("id") id: string, @Res() res: Response) {
    try {
      const post = await this.postService.findOne(id);
      return res.status(HttpStatus.OK).json({
        statusCode: HttpStatus.OK,
        data: post,
      });
    } catch (error) {
      throw new HttpException(
        error.message,
        error.status || HttpStatus.NOT_FOUND,
      );
    }
  }

  @Get('category/:categoryId')
  async findByCategory(@Param('categoryId') categoryId: string, @Res() res: Response) {
    try {
      const posts = await this.postService.findByCategory(categoryId)
      return res.status(HttpStatus.OK).json({
        statusCode: HttpStatus.OK,
        data: posts
      });
    } catch (error) {
      throw new HttpException(error.message, error.status || HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Get('search/:query')
  async searchPosts(@Param('query') query: string, @Res() res: Response) {
    try {
      const posts = await this.postService.searchPosts(query)
      return res.status(HttpStatus.OK).json({
        statusCode: HttpStatus.OK,
        data: posts
      });
    } catch (error) {
      throw new HttpException(error.message, error.status || HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }


  @UseGuards(JwtAuthGuard)
  @Put(":id")
  @UseInterceptors(FileInterceptor("file"))
  async update(
    @Param("id") id: string,
    @Body() updatePostDto: UpdatePostDto,
    @UploadedFile() file: Express.Multer.File,
    @Res() res: Response,
  ) {
    try {
      const currentPost = await this.postService.findOne(id);
      if (!currentPost) {
        throw new HttpException("Post not found", HttpStatus.NOT_FOUND);
      }

      let newImageUrl = updatePostDto.imageUrl || currentPost.imageUrl;

      if (file) {
        if (currentPost.imageUrl) {
          const oldPublicId = this.cloudinaryService.extractPublicId(
            currentPost.imageUrl,
          );
          if (oldPublicId) {
            try {
              await this.cloudinaryService.deleteFile(oldPublicId);
            } catch (deleteError) {
              console.warn("Failed to delete old image:", deleteError);
            }
          }
        }

        const uploadResult = await this.cloudinaryService.uploadFile(file);
        newImageUrl = uploadResult.secure_url;
      }

      const updated = await this.postService.update(id, {
        ...updatePostDto,
        imageUrl: newImageUrl,
      });

      return res.status(HttpStatus.OK).json({
        statusCode: HttpStatus.OK,
        message: "Post updated successfully",
        data: updated,
      });
    } catch (error) {
      throw new HttpException(
        error.message,
        error.status || HttpStatus.BAD_REQUEST,
      );
    }
  }


  @UseGuards(JwtAuthGuard)
  @Delete(":id")
  async remove(@Param("id") id: string, @Res() res: Response) {
    try {
      await this.postService.remove(id);
      return res.status(HttpStatus.OK).json({
        statusCode: HttpStatus.OK,
        message: "Post deleted successfully",
      });
    } catch (error) {
      throw new HttpException(
        error.message,
        error.status || HttpStatus.NOT_FOUND,
      );
    }
  }
}
