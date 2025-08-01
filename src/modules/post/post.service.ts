import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { CreatePostDto } from './dto/create-post.dto';
import { UpdatePostDto } from './dto/update-post.dto';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class PostService {
  constructor(private prisma: PrismaService) {}
  async create(createPostDto: CreatePostDto) {
    try {
      return await this.prisma.post.create({
        data: {
          title: createPostDto.title,
          content: createPostDto.content,
          imageUrl: createPostDto.imageUrl || '',
          category: {
            connect: {
              id: createPostDto.categoryId,
            },
          },
        },
      });
    } catch (error) {
      throw new HttpException('Failed to create post', HttpStatus.BAD_REQUEST);
    }
  }

  async findAll(page: number = 1, limit: number = 10) {
    try {
      console.log(`Bắt đầu findAll - Trang: ${page}, Giới hạn: ${limit}`);

      const skip = (page - 1) * limit;

      const posts = await this.prisma.post.findMany({
        skip,
        take: limit,
        include: {
          category: true,
        },
        orderBy: {
          createdAt: 'desc',
        },
      });

      const totalPosts = await this.prisma.post.count();
      const totalPages = Math.ceil(totalPosts / limit);

      console.log(
        `Tìm thấy ${posts.length} bài viết trên tổng ${totalPosts} bài viết`
      );

      return {
        data: posts,
        pagination: {
          currentPage: page,
          limit,
          totalPosts,
          totalPages,
        },
      };
    } catch (error) {
      console.error('Lỗi findAll:', {
        message: error.message,
        code: error.code,
        meta: error.meta,
      });
      throw new HttpException(
        'Không thể lấy danh sách bài viết',
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }
  async findOne(id: string) {
    try {
      const post = await this.prisma.post.findUnique({
        where: { id },
        include: {
          category: true,
          comments: {
            where: { parentId: null },
            include: {
              replies: true,
            },
          },
        },
      });
      if (!post) {
        throw new HttpException('Post not found', HttpStatus.NOT_FOUND);
      }
      return post;
    } catch (error) {
      throw new HttpException(
        error.message || 'Post not found',
        error.status || HttpStatus.NOT_FOUND
      );
    }
  }

  async findByCategory(categoryId: string) {
    try {
      return await this.prisma.post.findMany({
        where: { categoryId },
        include: {
          category: true,
          comments: {
            where: { parentId: null },
            include: { replies: true },
          },
        },
      });
    } catch (error) {
      throw new HttpException(
        'Failed to fetch posts by category',
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  async searchPosts(query: string) {
    try {
      return await this.prisma.post.findMany({
        where: {
          OR: [
            { title: { contains: query, mode: 'insensitive' } },
            { content: { contains: query, mode: 'insensitive' } },
          ],
        },
        include: {
          category: true,
          comments: {
            where: { parentId: null },
            include: { replies: true },
          },
        },
      });
    } catch (error) {
      return [];
    }
  }

  async update(id: string, updatePostDto: UpdatePostDto) {
    try {
      const { categoryId, ...rest } = updatePostDto;

      return await this.prisma.post.update({
        where: { id },
        data: {
          ...rest,
          ...(categoryId && {
            category: {
              connect: { id: categoryId },
            },
          }),
        },
      });
    } catch (error) {
      throw new HttpException('Failed to update post', HttpStatus.BAD_REQUEST);
    }
  }
  async remove(id: string) {
    const found = await this.prisma.post.findUnique({ where: { id } });
    if (!found) {
      throw new HttpException('Post not found', HttpStatus.NOT_FOUND);
    }
    await this.prisma.post.delete({ where: { id } });
  }
}
