import { Test, TestingModule } from '@nestjs/testing';
import { CommentService } from './comment.service';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateCommentDto } from './dto/create-comment.dto';
import { UpdateCommentDto } from './dto/update-comment.dto';

describe('CommentService', () => {
  let service: CommentService;
  let prisma: PrismaService;

  const mockPrismaService = {
    comment: {
      create: jest.fn(),
      findMany: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CommentService,
        { provide: PrismaService, useValue: mockPrismaService },
      ],
    }).compile();

    service = module.get<CommentService>(CommentService);
    prisma = module.get<PrismaService>(PrismaService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('phải được định nghĩa', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('phải tạo một bình luận', async () => {
      const createCommentDto: CreateCommentDto = {
        name: 'Người dùng',
        email: 'user@example.com',
        content: 'Đây là bình luận thử nghiệm',
        postId: '1',
        parentId: null,
      };
      const expectedResult = {
        id: '1',
        ...createCommentDto,
      };

      mockPrismaService.comment.create.mockResolvedValue(expectedResult);

      const result = await service.create(createCommentDto);

      expect(prisma.comment.create).toHaveBeenCalledWith({
        data: {
          name: createCommentDto.name,
          email: createCommentDto.email,
          content: createCommentDto.content,
          post: createCommentDto.postId
            ? { connect: { id: createCommentDto.postId } }
            : undefined,
          parent: createCommentDto.parentId
            ? { connect: { id: createCommentDto.parentId } }
            : undefined,
        },
      });
      expect(result).toEqual(expectedResult);
    });
  });

  describe('getAllByPost', () => {
    it('phải trả về tất cả bình luận cho một bài viết', async () => {
      const postId = '1';
      const expectedResult = [
        {
          id: '1',
          content: 'Bình luận 1',
          postId,
          replies: [],
        },
      ];

      mockPrismaService.comment.findMany.mockResolvedValue(expectedResult);

      const result = await service.getAllByPost(postId);

      expect(prisma.comment.findMany).toHaveBeenCalledWith({
        where: { postId },
        include: { replies: true },
      });
      expect(result).toEqual(expectedResult);
    });
  });

  describe('update', () => {
    it('phải cập nhật một bình luận', async () => {
      const id = '1';
      const updateCommentDto: UpdateCommentDto = {
        content: 'Bình luận đã cập nhật',
      };
      const expectedResult = {
        id,
        content: updateCommentDto.content,
      };

      mockPrismaService.comment.update.mockResolvedValue(expectedResult);

      const result = await service.update(id, updateCommentDto);

      expect(prisma.comment.update).toHaveBeenCalledWith({
        where: { id },
        data: updateCommentDto,
      });
      expect(result).toEqual(expectedResult);
    });
  });

  describe('remove', () => {
    it('phải xóa một bình luận', async () => {
      const id = '1';
      const expectedResult = {
        id,
        content: 'Bình luận 1',
      };

      mockPrismaService.comment.delete.mockResolvedValue(expectedResult);

      const result = await service.remove(id);

      expect(prisma.comment.delete).toHaveBeenCalledWith({
        where: { id },
      });
      expect(result).toEqual(expectedResult);
    });
  });
});
