import { Test, TestingModule } from '@nestjs/testing';
import { CategoryController } from './category.controller';
import { CategoryService } from './category.service';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CanActivate } from '@nestjs/common';

describe('CategoryController', () => {
  let controller: CategoryController;
  let service: CategoryService;

  const mockCategoryService = {
    create: jest.fn(),
    findAll: jest.fn(),
    findOne: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
  };

  const mockJwtAuthGuard: CanActivate = {
    canActivate: jest.fn().mockReturnValue(true),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [CategoryController],
      providers: [
        { provide: CategoryService, useValue: mockCategoryService },
        { provide: JwtAuthGuard, useValue: mockJwtAuthGuard },
      ],
    }).compile();

    controller = module.get<CategoryController>(CategoryController);
    service = module.get<CategoryService>(CategoryService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('phải được định nghĩa', () => {
    expect(controller).toBeDefined();
  });

  describe('create', () => {
    it('phải tạo một danh mục', async () => {
      const createCategoryDto: CreateCategoryDto = {
        name: 'Danh mục mới',
      };
      const expectedResult = { id: '1', name: createCategoryDto.name };

      mockCategoryService.create.mockResolvedValue(expectedResult);

      const result = await controller.create(createCategoryDto);

      expect(service.create).toHaveBeenCalledWith(createCategoryDto);
      expect(result).toEqual(expectedResult);
    });
  });

  describe('findAll', () => {
    it('phải trả về tất cả danh mục', async () => {
      const expectedResult = [
        { id: '1', name: 'Danh mục 1' },
        { id: '2', name: 'Danh mục 2' },
      ];

      mockCategoryService.findAll.mockResolvedValue(expectedResult);

      const result = await controller.findAll();

      expect(service.findAll).toHaveBeenCalled();
      expect(result).toEqual(expectedResult);
    });
  });

  describe('findOne', () => {
    it('phải trả về một danh mục theo ID', async () => {
      const id = '1';
      const expectedResult = { id, name: 'Danh mục 1' };

      mockCategoryService.findOne.mockResolvedValue(expectedResult);

      const result = await controller.findOne(id);

      expect(service.findOne).toHaveBeenCalledWith(id);
      expect(result).toEqual(expectedResult);
    });
  });

  describe('update', () => {
    it('phải cập nhật một danh mục', async () => {
      const id = '1';
      const updateCategoryDto: UpdateCategoryDto = {
        name: 'Danh mục cập nhật',
      };
      const expectedResult = { id, name: updateCategoryDto.name };

      mockCategoryService.update.mockResolvedValue(expectedResult);

      const result = await controller.update(id, updateCategoryDto);

      expect(service.update).toHaveBeenCalledWith(id, updateCategoryDto);
      expect(result).toEqual(expectedResult);
    });
  });

  describe('remove', () => {
    it('phải xóa một danh mục', async () => {
      const id = '1';
      const expectedResult = { id, name: 'Danh mục 1' };

      mockCategoryService.remove.mockResolvedValue(expectedResult);

      const result = await controller.remove(id);

      expect(service.remove).toHaveBeenCalledWith(id);
      expect(result).toEqual(expectedResult);
    });
  });
});
