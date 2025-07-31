import { Test, TestingModule } from '@nestjs/testing';
import { CategoryService } from './category.service';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { NotFoundException } from '@nestjs/common';

describe('CategoryService', () => {
  let service: CategoryService;
  let prisma: PrismaService;

  const mockPrismaService = {
    category: {
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
        CategoryService,
        { provide: PrismaService, useValue: mockPrismaService },
      ],
    }).compile();

    service = module.get<CategoryService>(CategoryService);
    prisma = module.get<PrismaService>(PrismaService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('phải được định nghĩa', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('phải tạo một danh mục', async () => {
      const createCategoryDto: CreateCategoryDto = {
        name: 'Danh mục mới',
      };
      const expectedResult = {
        id: '1',
        name: createCategoryDto.name,
      };

      mockPrismaService.category.create.mockResolvedValue(expectedResult);

      const result = await service.create(createCategoryDto);

      expect(prisma.category.create).toHaveBeenCalledWith({
        data: createCategoryDto,
      });
      expect(result).toEqual(expectedResult);
    });
  });

  describe('findAll', () => {
    it('phải trả về tất cả danh mục', async () => {
      const expectedResult = [
        { id: '1', name: 'Danh mục 1' },
        { id: '2', name: 'Danh mục 2' },
      ];

      mockPrismaService.category.findMany.mockResolvedValue(expectedResult);

      const result = await service.findAll();

      expect(prisma.category.findMany).toHaveBeenCalled();
      expect(result).toEqual(expectedResult);
    });
  });

  describe('findOne', () => {
    it('phải trả về một danh mục theo ID', async () => {
      const id = '1';
      const expectedResult = { id, name: 'Danh mục 1' };

      mockPrismaService.category.findUnique.mockResolvedValue(expectedResult);

      const result = await service.findOne(id);

      expect(prisma.category.findUnique).toHaveBeenCalledWith({
        where: { id },
      });
      expect(result).toEqual(expectedResult);
    });

    it('phải ném NotFoundException nếu danh mục không tồn tại', async () => {
      const id = '1';

      mockPrismaService.category.findUnique.mockResolvedValue(null);

      await expect(service.findOne(id)).rejects.toThrow(
        new NotFoundException('Category not found')
      );
    });
  });

  describe('update', () => {
    it('phải cập nhật một danh mục', async () => {
      const id = '1';
      const updateCategoryDto: UpdateCategoryDto = {
        name: 'Danh mục cập nhật',
      };
      const expectedResult = { id, name: updateCategoryDto.name };

      mockPrismaService.category.findUnique.mockResolvedValue({
        id,
        name: 'Danh mục cũ',
      });
      mockPrismaService.category.update.mockResolvedValue(expectedResult);

      const result = await service.update(id, updateCategoryDto);

      expect(prisma.category.findUnique).toHaveBeenCalledWith({
        where: { id },
      });
      expect(prisma.category.update).toHaveBeenCalledWith({
        where: { id },
        data: updateCategoryDto,
      });
      expect(result).toEqual(expectedResult);
    });

    it('phải ném NotFoundException nếu danh mục không tồn tại', async () => {
      const id = '1';
      const updateCategoryDto: UpdateCategoryDto = {
        name: 'Danh mục cập nhật',
      };

      mockPrismaService.category.findUnique.mockResolvedValue(null);

      await expect(service.update(id, updateCategoryDto)).rejects.toThrow(
        new NotFoundException('Category not found')
      );
    });
  });

  describe('remove', () => {
    it('phải xóa một danh mục', async () => {
      const id = '1';
      const expectedResult = { id, name: 'Danh mục 1' };

      mockPrismaService.category.findUnique.mockResolvedValue(expectedResult);
      mockPrismaService.category.delete.mockResolvedValue(expectedResult);

      const result = await service.remove(id);

      expect(prisma.category.findUnique).toHaveBeenCalledWith({
        where: { id },
      });
      expect(prisma.category.delete).toHaveBeenCalledWith({ where: { id } });
      expect(result).toEqual(expectedResult);
    });

    it('phải ném NotFoundException nếu danh mục không tồn tại', async () => {
      const id = '1';

      mockPrismaService.category.findUnique.mockResolvedValue(null);

      await expect(service.remove(id)).rejects.toThrow(
        new NotFoundException('Category not found')
      );
    });
  });
});
