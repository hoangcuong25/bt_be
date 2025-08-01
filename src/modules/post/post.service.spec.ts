import { Test, TestingModule } from '@nestjs/testing';
import { PostService } from './post.service';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreatePostDto } from './dto/create-post.dto';
import { UpdatePostDto } from './dto/update-post.dto';
import { HttpException, HttpStatus } from '@nestjs/common';

describe('PostService', () => {
  let service: PostService;
  let prisma: PrismaService;

  const mockPrismaService = {
    post: {
      create: jest.fn(),
      findMany: jest.fn(),
      count: jest.fn(),
      findUnique: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PostService,
        { provide: PrismaService, useValue: mockPrismaService },
      ],
    }).compile();

    service = module.get<PostService>(PostService);
    prisma = module.get<PrismaService>(PrismaService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('phải được định nghĩa', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('phải tạo một bài viết', async () => {
      const createPostDto: CreatePostDto = {
        title: 'Bài viết mới',
        content: 'Nội dung bài viết',
        categoryId: '1',
        imageUrl: 'http://example.com/image.jpg',
      };
      const expectedResult = {
        id: '1',
        ...createPostDto,
      };

      mockPrismaService.post.create.mockResolvedValue(expectedResult);

      const result = await service.create(createPostDto);

      expect(prisma.post.create).toHaveBeenCalledWith({
        data: {
          title: createPostDto.title,
          content: createPostDto.content,
          imageUrl: createPostDto.imageUrl || '',
          category: { connect: { id: createPostDto.categoryId } },
        },
      });
      expect(result).toEqual(expectedResult);
    });

    it('phải ném HttpException khi tạo thất bại', async () => {
      const createPostDto: CreatePostDto = {
        title: 'Bài viết mới',
        content: 'Nội dung bài viết',
        categoryId: '1',
      };

      mockPrismaService.post.create.mockRejectedValue(new Error('Lỗi Prisma'));

      await expect(service.create(createPostDto)).rejects.toThrow(
        new HttpException('Failed to create post', HttpStatus.BAD_REQUEST)
      );
    });
  });

  describe('findAll', () => {
    it('phải trả về danh sách bài viết với phân trang', async () => {
      const page = 1;
      const limit = 10;
      const posts = [
        { id: '1', title: 'Bài viết 1', content: 'Nội dung 1', category: {} },
      ];
      const totalPosts = 1;
      const expectedResult = {
        data: posts,
        pagination: {
          currentPage: page,
          limit,
          totalPosts,
          totalPages: 1,
        },
      };

      mockPrismaService.post.findMany.mockResolvedValue(posts);
      mockPrismaService.post.count.mockResolvedValue(totalPosts);

      const result = await service.findAll(page, limit);

      expect(prisma.post.findMany).toHaveBeenCalledWith({
        skip: (page - 1) * limit,
        take: limit,
        include: { category: true },
        orderBy: { createdAt: 'desc' },
      });
      expect(prisma.post.count).toHaveBeenCalled();
      expect(result).toEqual(expectedResult);
    });

    it('phải ném HttpException khi tìm kiếm thất bại', async () => {
      mockPrismaService.post.findMany.mockRejectedValue(
        new Error('Lỗi Prisma')
      );

      await expect(service.findAll(1, 10)).rejects.toThrow(
        new HttpException(
          'Không thể lấy danh sách bài viết',
          HttpStatus.INTERNAL_SERVER_ERROR
        )
      );
    });
  });

  describe('findOne', () => {
    it('phải trả về một bài viết theo ID', async () => {
      const id = '1';
      const expectedResult = {
        id,
        title: 'Bài viết 1',
        content: 'Nội dung 1',
        category: {},
        comments: [],
      };

      mockPrismaService.post.findUnique.mockResolvedValue(expectedResult);

      const result = await service.findOne(id);

      expect(prisma.post.findUnique).toHaveBeenCalledWith({
        where: { id },
        include: {
          category: true,
          comments: { where: { parentId: null }, include: { replies: true } },
        },
      });
      expect(result).toEqual(expectedResult);
    });

    it('phải ném HttpException nếu bài viết không tồn tại', async () => {
      const id = '1';
      mockPrismaService.post.findUnique.mockResolvedValue(null);

      await expect(service.findOne(id)).rejects.toThrow(
        new HttpException('Post not found', HttpStatus.NOT_FOUND)
      );
    });
  });

  describe('findByCategory', () => {
    it('phải trả về các bài viết theo danh mục', async () => {
      const categoryId = '1';
      const expectedResult = [
        {
          id: '1',
          title: 'Bài viết 1',
          categoryId,
          category: {},
          comments: [],
        },
      ];

      mockPrismaService.post.findMany.mockResolvedValue(expectedResult);

      const result = await service.findByCategory(categoryId);

      expect(prisma.post.findMany).toHaveBeenCalledWith({
        where: { categoryId },
        include: {
          category: true,
          comments: { where: { parentId: null }, include: { replies: true } },
        },
      });
      expect(result).toEqual(expectedResult);
    });

    it('phải ném HttpException khi tìm kiếm thất bại', async () => {
      const categoryId = '1';
      mockPrismaService.post.findMany.mockRejectedValue(
        new Error('Lỗi Prisma')
      );

      await expect(service.findByCategory(categoryId)).rejects.toThrow(
        new HttpException(
          'Failed to fetch posts by category',
          HttpStatus.INTERNAL_SERVER_ERROR
        )
      );
    });
  });

  describe('searchPosts', () => {
    it('phải trả về các bài viết theo từ khóa tìm kiếm', async () => {
      const query = 'test';
      const expectedResult = [
        {
          id: '1',
          title: 'Bài viết test',
          content: 'Nội dung',
          category: {},
          comments: [],
        },
      ];

      mockPrismaService.post.findMany.mockResolvedValue(expectedResult);

      const result = await service.searchPosts(query);

      expect(prisma.post.findMany).toHaveBeenCalledWith({
        where: {
          OR: [
            { title: { contains: query, mode: 'insensitive' } },
            { content: { contains: query, mode: 'insensitive' } },
          ],
        },
        include: {
          category: true,
          comments: { where: { parentId: null }, include: { replies: true } },
        },
      });
      expect(result).toEqual(expectedResult);
    });

    it('phải trả về mảng rỗng nếu tìm kiếm thất bại', async () => {
      const query = 'test';
      mockPrismaService.post.findMany.mockRejectedValue(
        new Error('Lỗi Prisma')
      );

      const result = await service.searchPosts(query);

      expect(result).toEqual([]);
    });
  });

  describe('update', () => {
    it('phải cập nhật một bài viết', async () => {
      const id = '1';
      const updatePostDto: UpdatePostDto = {
        title: 'Bài viết cập nhật',
        content: 'Nội dung cập nhật',
        categoryId: '2',
        imageUrl: 'http://example.com/new-image.jpg',
      };
      const expectedResult = { id, ...updatePostDto };

      mockPrismaService.post.update.mockResolvedValue(expectedResult);

      const result = await service.update(id, updatePostDto);

      expect(prisma.post.update).toHaveBeenCalledWith({
        where: { id },
        data: {
          title: updatePostDto.title,
          content: updatePostDto.content,
          imageUrl: updatePostDto.imageUrl,
          category: { connect: { id: updatePostDto.categoryId } },
        },
      });
      expect(result).toEqual(expectedResult);
    });

    it('phải ném HttpException khi cập nhật thất bại', async () => {
      const id = '1';
      const updatePostDto: UpdatePostDto = {
        title: 'Bài viết cập nhật',
        content: 'Nội dung cập nhật',
      };

      mockPrismaService.post.update.mockRejectedValue(new Error('Lỗi Prisma'));

      await expect(service.update(id, updatePostDto)).rejects.toThrow(
        new HttpException('Failed to update post', HttpStatus.BAD_REQUEST)
      );
    });
  });

  describe('remove', () => {
    it('phải xóa một bài viết', async () => {
      const id = '1';
      const expectedResult = { id, title: 'Bài viết 1' };

      mockPrismaService.post.findUnique.mockResolvedValue(expectedResult);
      mockPrismaService.post.delete.mockResolvedValue(expectedResult);

      await service.remove(id);

      expect(prisma.post.findUnique).toHaveBeenCalledWith({ where: { id } });
      expect(prisma.post.delete).toHaveBeenCalledWith({ where: { id } });
    });

    it('phải ném HttpException nếu bài viết không tồn tại', async () => {
      const id = '1';
      mockPrismaService.post.findUnique.mockResolvedValue(null);

      await expect(service.remove(id)).rejects.toThrow(
        new HttpException('Post not found', HttpStatus.NOT_FOUND)
      );
    });
  });
});
