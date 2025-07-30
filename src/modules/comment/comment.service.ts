import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateCommentDto } from './dto/create-comment.dto';
import { UpdateCommentDto} from './dto/update-comment.dto';

@Injectable()
export class CommentService {
  constructor(private prisma: PrismaService) {}

  async create(dto: CreateCommentDto) {
    return this.prisma.comment.create({
      data: {
        name: dto.name,
        email: dto.email,
        content: dto.content,
        post: dto.postId ? { connect: { id: dto.postId } } : undefined,
        parent: dto.parentId ? { connect: { id: dto.parentId } } : undefined,
      },
    });
  }

  async getAllByPost(postId: string) {
    return this.prisma.comment.findMany({
      where: { postId },
      include: { replies: true },
    });
  }
  async update(id: string, dto: UpdateCommentDto) {
  return this.prisma.comment.update({
    where: { id },
    data: dto,
  });
}

async remove(id: string) {
  return this.prisma.comment.delete({
    where: { id },
  });
}

}
