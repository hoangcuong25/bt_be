import { Test, TestingModule } from '@nestjs/testing';
import { PostController } from './post.controller';
import { PostService } from './post.service';
import { CloudinaryService } from 'src/cloudinary/cloudinary.service';
import { CreatePostDto } from './dto/create-post.dto';
import { UpdatePostDto } from './dto/update-post.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CanActivate, HttpStatus } from '@nestjs/common';
import { Response } from 'express';

describe('PostController', () => {
  let controller: PostController;
  let postService: PostService;
  let cloudinaryService: CloudinaryService;

  const mockPostService = {
    create: jest.fn(),
    findAll: jest.fn(),
    findOne: jest.fn(),
    findByCategory: jest.fn(),
    searchPosts: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
  };

  const mockCloudinaryService = {
    uploadFile: jest.fn(),
    extractPublicId: jest.fn(),
    deleteFile: jest.fn(),
  };

  const mockJwtAuthGuard: CanActivate = {
    canActivate: jest.fn().mockReturnValue(true),
  };

  const mockResponse = () => {
    const res: Partial<Response> = {};
    res.status = jest.fn().mockReturnValue(res);
    res.json = jest.fn().mockReturnValue(res);
    return res as Response;
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [PostController],
      providers: [
        { provide: PostService, useValue: mockPostService },
        { provide: CloudinaryService, useValue: mockCloudinaryService },
        { provide: JwtAuthGuard, useValue: mockJwtAuthGuard },
      ],
    }).compile();

    controller = module.get<PostController>(PostController);
    postService = module.get<PostService>(PostService);
    cloudinaryService = module.get<CloudinaryService>(CloudinaryService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('phải được định nghĩa', () => {
    expect(controller).toBeDefined();
  });

  describe('create', () => {
    it('phải tạo một bài viết với file tải lên', async () => {
      const createPostDto: CreatePostDto = {
        title: 'Bài viết mới',
        content: 'Nội dung bài viết',
        categoryId: '1',
      };
      const file = { buffer: Buffer.from('test') } as Express.Multer.File;
      const imageUrl = 'http://example.com/image.jpg';
      const expectedResult = { id: '1', ...createPostDto, imageUrl };
      const res = mockResponse();

      mockCloudinaryService.uploadFile.mockResolvedValue({
        secure_url: imageUrl,
      });
      mockPostService.create.mockResolvedValue(expectedResult);

      await controller.create(createPostDto, file, res);

      expect(cloudinaryService.uploadFile).toHaveBeenCalledWith(file);
      expect(postService.create).toHaveBeenCalledWith({
        ...createPostDto,
        imageUrl,
      });
      expect(res.status).toHaveBeenCalledWith(HttpStatus.CREATED);
      expect(res.json).toHaveBeenCalledWith({
        statusCode: HttpStatus.CREATED,
        message: 'Post created successfully',
        data: expectedResult,
      });
    });

    it('phải tạo bài viết mà không có file', async () => {
      const createPostDto: CreatePostDto = {
        title: 'Bài viết mới',
        content: 'Nội dung bài viết',
        categoryId: '1',
      };
      const expectedResult = { id: '1', ...createPostDto, imageUrl: '' };
      const res = mockResponse();

      mockPostService.create.mockResolvedValue(expectedResult);

      await controller.create(createPostDto, null, res);

      expect(cloudinaryService.uploadFile).not.toHaveBeenCalled();
      expect(postService.create).toHaveBeenCalledWith({
        ...createPostDto,
        imageUrl: '',
      });
      expect(res.status).toHaveBeenCalledWith(HttpStatus.CREATED);
      expect(res.json).toHaveBeenCalledWith({
        statusCode: HttpStatus.CREATED,
        message: 'Post created successfully',
        data: expectedResult,
      });
    });
  });

  describe('findAll', () => {
    it('phải trả về danh sách bài viết với phân trang', async () => {
      const page = '1';
      const limit = '10';
      const posts = [{ id: '1', title: 'Bài viết 1' }];
      const expectedResult = {
        data: posts,
        pagination: { currentPage: 1, limit: 10, totalPosts: 1, totalPages: 1 },
      };
      const res = mockResponse();

      mockPostService.findAll.mockResolvedValue(expectedResult);

      await controller.findAll(page, limit, res);

      expect(postService.findAll).toHaveBeenCalledWith(1, 10);
      expect(res.status).toHaveBeenCalledWith(HttpStatus.OK);
      expect(res.json).toHaveBeenCalledWith({
        statusCode: HttpStatus.OK,
        message: 'Lấy danh sách bài viết thành công',
        data: expectedResult.data,
        pagination: expectedResult.pagination,
      });
    });
  });

  describe('findOne', () => {
    it('phải trả về một bài viết theo ID', async () => {
      const id = '1';
      const expectedResult = { id, title: 'Bài viết 1' };
      const res = mockResponse();

      mockPostService.findOne.mockResolvedValue(expectedResult);

      await controller.findOne(id, res);

      expect(postService.findOne).toHaveBeenCalledWith(id);
      expect(res.status).toHaveBeenCalledWith(HttpStatus.OK);
      expect(res.json).toHaveBeenCalledWith({
        statusCode: HttpStatus.OK,
        data: expectedResult,
      });
    });
  });

  describe('findByCategory', () => {
    it('phải trả về các bài viết theo danh mục', async () => {
      const categoryId = '1';
      const expectedResult = [{ id: '1', title: 'Bài viết 1', categoryId }];
      const res = mockResponse();

      mockPostService.findByCategory.mockResolvedValue(expectedResult);

      await controller.findByCategory(categoryId, res);

      expect(postService.findByCategory).toHaveBeenCalledWith(categoryId);
      expect(res.status).toHaveBeenCalledWith(HttpStatus.OK);
      expect(res.json).toHaveBeenCalledWith({
        statusCode: HttpStatus.OK,
        data: expectedResult,
      });
    });
  });

  describe('searchPosts', () => {
    it('phải trả về các bài viết theo từ khóa tìm kiếm', async () => {
      const query = 'test';
      const expectedResult = [{ id: '1', title: 'Bài viết test' }];
      const res = mockResponse();

      mockPostService.searchPosts.mockResolvedValue(expectedResult);

      await controller.searchPosts(query, res);

      expect(postService.searchPosts).toHaveBeenCalledWith(query);
      expect(res.status).toHaveBeenCalledWith(HttpStatus.OK);
      expect(res.json).toHaveBeenCalledWith({
        statusCode: HttpStatus.OK,
        data: expectedResult,
      });
    });
  });

  describe('update', () => {
    it('phải cập nhật bài viết với file mới', async () => {
      const id = '1';
      const updatePostDto: UpdatePostDto = {
        title: 'Bài viết cập nhật',
        content: 'Nội dung cập nhật',
        categoryId: '2',
      };
      const file = { buffer: Buffer.from('test') } as Express.Multer.File;
      const currentPost = { id, imageUrl: 'http://example.com/old-image.jpg' };
      const newImageUrl = 'http://example.com/new-image.jpg';
      const expectedResult = { id, ...updatePostDto, imageUrl: newImageUrl };
      const res = mockResponse();

      mockPostService.findOne.mockResolvedValue(currentPost);
      mockCloudinaryService.extractPublicId.mockReturnValue('old-image');
      mockCloudinaryService.deleteFile.mockResolvedValue({});
      mockCloudinaryService.uploadFile.mockResolvedValue({
        secure_url: newImageUrl,
      });
      mockPostService.update.mockResolvedValue(expectedResult);

      await controller.update(id, updatePostDto, file, res);

      expect(postService.findOne).toHaveBeenCalledWith(id);
      expect(cloudinaryService.extractPublicId).toHaveBeenCalledWith(
        currentPost.imageUrl
      );
      expect(cloudinaryService.deleteFile).toHaveBeenCalledWith('old-image');
      expect(cloudinaryService.uploadFile).toHaveBeenCalledWith(file);
      expect(postService.update).toHaveBeenCalledWith(id, {
        ...updatePostDto,
        imageUrl: newImageUrl,
      });
      expect(res.status).toHaveBeenCalledWith(HttpStatus.OK);
      expect(res.json).toHaveBeenCalledWith({
        statusCode: HttpStatus.OK,
        message: 'Post updated successfully',
        data: expectedResult,
      });
    });

    it('phải cập nhật bài viết mà không có file', async () => {
      const id = '1';
      const updatePostDto: UpdatePostDto = {
        title: 'Bài viết cập nhật',
        content: 'Nội dung cập nhật',
        categoryId: '2',
        imageUrl: 'http://example.com/image.jpg',
      };
      const currentPost = { id, imageUrl: updatePostDto.imageUrl };
      const expectedResult = { id, ...updatePostDto };
      const res = mockResponse();

      mockPostService.findOne.mockResolvedValue(currentPost);
      mockPostService.update.mockResolvedValue(expectedResult);

      await controller.update(id, updatePostDto, null, res);

      expect(postService.findOne).toHaveBeenCalledWith(id);
      expect(cloudinaryService.uploadFile).not.toHaveBeenCalled();
      expect(postService.update).toHaveBeenCalledWith(id, {
        ...updatePostDto,
        imageUrl: updatePostDto.imageUrl,
      });
      expect(res.status).toHaveBeenCalledWith(HttpStatus.OK);
      expect(res.json).toHaveBeenCalledWith({
        statusCode: HttpStatus.OK,
        message: 'Post updated successfully',
        data: expectedResult,
      });
    });
  });

  describe('remove', () => {
    it('phải xóa một bài viết', async () => {
      const id = '1';
      const res = mockResponse();

      mockPostService.remove.mockResolvedValue(undefined);

      await controller.remove(id, res);

      expect(postService.remove).toHaveBeenCalledWith(id);
      expect(res.status).toHaveBeenCalledWith(HttpStatus.OK);
      expect(res.json).toHaveBeenCalledWith({
        statusCode: HttpStatus.OK,
        message: 'Post deleted successfully',
      });
    });
  });
});
