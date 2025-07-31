import { Test, TestingModule } from '@nestjs/testing';
import { PostService } from './post.service';

import { HttpException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';

describe('PostService', () => {
  let service: PostService;
  let prisma: PrismaService;

  const mockPrisma = {
    post: {
      create: jest.fn(),
      findMany: jest.fn(),
      findUnique: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PostService,
        { provide: PrismaService, useValue: mockPrisma },
      ],
    }).compile();

    service = module.get<PostService>(PostService);
    prisma = module.get<PrismaService>(PrismaService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('create', () => {
    it('should create a post successfully', async () => {
      const dto = {
        title: 'Test title',
        content: 'Test content',
        imageUrl: 'http://example.com/image.jpg',
        categoryId: '123',
      };

      const expected = { id: 'abc', ...dto };

      mockPrisma.post.create.mockResolvedValue(expected);

      const result = await service.create(dto);
      expect(result).toEqual(expected);
      expect(mockPrisma.post.create).toHaveBeenCalledWith({
        data: {
          title: dto.title,
          content: dto.content,
          imageUrl: dto.imageUrl,
          category: {
            connect: {
              id: dto.categoryId,
            },
          },
        },
      });
    });

    it('should throw HttpException on failure', async () => {
      mockPrisma.post.create.mockRejectedValue(new Error());

      await expect(service.create({
        title: 'x',
        content: 'x',
        imageUrl: 'x',
        categoryId: 'x',
      })).rejects.toThrow(HttpException);
    });
  });

  describe('findAll', () => {
    it('should return list of posts', async () => {
      const mockPosts = [{ id: '1', title: 'Post 1' }];
      mockPrisma.post.findMany.mockResolvedValue(mockPosts);

      const result = await service.findAll();
      expect(result).toEqual(mockPosts);
    });
  });

  describe('findOne', () => {
    it('should return a single post', async () => {
      const mockPost = { id: '1', title: 'Post 1' };
      mockPrisma.post.findUnique.mockResolvedValue(mockPost);

      const result = await service.findOne('1');
      expect(result).toEqual(mockPost);
    });
  });

  describe('update', () => {
    it('should update a post', async () => {
      const dto = { title: 'Updated', content: 'Updated content' };
      const updated = { id: '1', ...dto };

      mockPrisma.post.update.mockResolvedValue(updated);

      const result = await service.update('1', dto);
      expect(result).toEqual(updated);
    });
  });

  describe('remove', () => {
    it('should delete post if found', async () => {
      mockPrisma.post.findUnique.mockResolvedValue({ id: '1' });
      mockPrisma.post.delete.mockResolvedValue({ id: '1' });

      await service.remove('1');
      expect(mockPrisma.post.delete).toHaveBeenCalledWith({ where: { id: '1' } });
    });

    it('should throw if post not found', async () => {
      mockPrisma.post.findUnique.mockResolvedValue(null);

      await expect(service.remove('99')).rejects.toThrow('Post not found');
    });
  });
});
