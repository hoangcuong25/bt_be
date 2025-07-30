import { Controller, Get, Post, Body, Patch, Param, Delete, HttpStatus, HttpException, Put, Res } from '@nestjs/common';
import { PostService } from './post.service';
import { CreatePostDto } from './dto/create-post.dto';
import { UpdatePostDto } from './dto/update-post.dto';
import { Response } from 'express';

@Controller('post')
export class PostController {
  constructor(private readonly postService: PostService) { }

  @Post()
  async create(@Body() createPostDto: CreatePostDto, @Res() res: Response) {
    try {
      const created = await this.postService.create(createPostDto);
      return res.status(HttpStatus.CREATED).json({
        statusCode: HttpStatus.CREATED,
        message: 'Post created successfully',
        data: created,
      });
    } catch (error) {
      throw new HttpException(error.message, error.status || HttpStatus.BAD_REQUEST);
    }
  }

  @Get()
  async findAll(@Res() res: Response) {
    try {
      const posts = await this.postService.findAll();
      return res.status(HttpStatus.OK).json({
        statusCode: HttpStatus.OK,
        data: posts
      });
    } catch (error) {
      throw new HttpException(error.message, error.status || HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Get(':id')
  async findOne(@Param('id') id: string, @Res() res: Response) {
    try {
      const post = await this.postService.findOne(id);
      return res.status(HttpStatus.OK).json({
        statusCode: HttpStatus.OK,
        data: post
      });
    } catch (error) {
      throw new HttpException(error.message, error.status || HttpStatus.NOT_FOUND);
    }
  }

  @Put(':id')
  async update(@Param('id') id: string, @Body() updatePostDto: UpdatePostDto, @Res() res: Response) {
    try {
      const updated = await this.postService.update(id, updatePostDto);
      return res.status(HttpStatus.OK).json({
        statusCode: HttpStatus.OK,
        message: 'Post updated successfully',
        data: updated
      });
    } catch (error) {
      throw new HttpException(error.message, error.status || HttpStatus.BAD_REQUEST);
    }
  }

  @Delete(':id')
  async remove(@Param('id') id: string, @Res() res: Response) {
    try {
      await this.postService.remove(id);
      return res.status(HttpStatus.OK).json({
        statusCode: HttpStatus.OK,
        message: 'Post deleted successfully',
      });
    } catch (error) {
      throw new HttpException(error.message, error.status || HttpStatus.NOT_FOUND);
    }
  }
}