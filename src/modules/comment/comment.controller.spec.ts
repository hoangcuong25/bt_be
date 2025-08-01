import { Test, TestingModule } from '@nestjs/testing';
import { CommentController } from './comment.controller';
import { CommentService } from './comment.service';
import { CreateCommentDto } from './dto/create-comment.dto';
import { UpdateCommentDto } from './dto/update-comment.dto';

describe('CommentController', () => {
  let controller: CommentController;
  let service: CommentService;

  const mockCommentService = {
    create: jest.fn(),
    getAllByPost: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [CommentController],
      providers: [{ provide: CommentService, useValue: mockCommentService }],
    }).compile();

    controller = module.get<CommentController>(CommentController);
    service = module.get<CommentService>(CommentService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('phải được định nghĩa', () => {
    expect(controller).toBeDefined();
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

      mockCommentService.create.mockResolvedValue(expectedResult);

      const result = await controller.create(createCommentDto);

      expect(service.create).toHaveBeenCalledWith(createCommentDto);
      expect(result).toEqual(expectedResult);
    });
  });

  describe('getByPost', () => {
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

      mockCommentService.getAllByPost.mockResolvedValue(expectedResult);

      const result = await controller.getByPost(postId);

      expect(service.getAllByPost).toHaveBeenCalledWith(postId);
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

      mockCommentService.update.mockResolvedValue(expectedResult);

      const result = await controller.update(id, updateCommentDto);

      expect(service.update).toHaveBeenCalledWith(id, updateCommentDto);
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

      mockCommentService.remove.mockResolvedValue(expectedResult);

      const result = await controller.remove(id);

      expect(service.remove).toHaveBeenCalledWith(id);
      expect(result).toEqual(expectedResult);
    });
  });
});
