import { Injectable } from '@nestjs/common';
import { CreatePostDto } from './dto/create-post.dto';
import { UpdatePostDto } from './dto/update-post.dto';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class PostService {
  constructor(private prisma: PrismaService) { }
  create(createPostDto: CreatePostDto) {
    return this.prisma.post.create({
      data: createPostDto,
    });
  }

  findAll() {
    return this.prisma.post.findMany({
      // include: { category: true }
    });
  }

  findOne(id: string) {
    return this.prisma.post.findUnique({
      where: { id },
      // include: { category: true }
    })
  }

  update(id: string, updatePostDto: UpdatePostDto) {
    return this.prisma.post.update({
      where: { id },
      data: updatePostDto
    });
  }
  remove(id: string) {
    return this.prisma.post.delete({
      where: { id }
    })
  }
}
