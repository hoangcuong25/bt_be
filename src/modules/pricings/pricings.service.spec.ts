import { Test, TestingModule } from '@nestjs/testing';
import { PricingsService } from './pricings.service';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreatePricingDto } from './dto/create-pricing.dto';
import { UpdatePricingDto } from './dto/update-pricing.dto';

describe('PricingsService', () => {
  let service: PricingsService;
  let prisma: PrismaService;

  const mockPrismaService = {
    pricingPlan: {
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
        PricingsService,
        { provide: PrismaService, useValue: mockPrismaService },
      ],
    }).compile();

    service = module.get<PricingsService>(PricingsService);
    prisma = module.get<PrismaService>(PrismaService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create a pricing plan', async () => {
      const createPricingDto: CreatePricingDto = {
        name: 'Basic Plan',
        description: 'A basic plan for testing',
        price: 10,
        features: [{ name: 'Feature 1' }, { name: 'Feature 2' }],
      };
      const expectedResult = {
        id: '1',
        ...createPricingDto,
        features: createPricingDto.features,
      };

      mockPrismaService.pricingPlan.create.mockResolvedValue(expectedResult);

      const result = await service.create(createPricingDto);

      expect(prisma.pricingPlan.create).toHaveBeenCalledWith({
        data: {
          ...createPricingDto,
          features: createPricingDto.features as any,
        },
      });
      expect(result).toEqual(expectedResult);
    });
  });

  describe('findAll', () => {
    it('should return all pricing plans', async () => {
      const expectedResult = [
        { id: '1', name: 'Basic Plan', price: 10, features: ['Feature 1'] },
      ];

      mockPrismaService.pricingPlan.findMany.mockResolvedValue(expectedResult);

      const result = await service.findAll();

      expect(prisma.pricingPlan.findMany).toHaveBeenCalledWith({
        include: { features: true },
      });
      expect(result).toEqual(expectedResult);
    });
  });

  describe('findOne', () => {
    it('should return a pricing plan by id', async () => {
      const id = '1';
      const expectedResult = {
        id,
        name: 'Basic Plan',
        price: 10,
        features: ['Feature 1'],
      };

      mockPrismaService.pricingPlan.findUnique.mockResolvedValue(
        expectedResult
      );

      const result = await service.findOne(id);

      expect(prisma.pricingPlan.findUnique).toHaveBeenCalledWith({
        where: { id },
        include: { features: true },
      });
      expect(result).toEqual(expectedResult);
    });
  });

  describe('update', () => {
    it('should update a pricing plan', async () => {
      const id = '1';
      const updatePricingDto: UpdatePricingDto = {
        name: 'Updated Plan',
        price: 20,
        features: [{ name: 'Updated Feature' }],
      };
      const expectedResult = { id, ...updatePricingDto };

      mockPrismaService.pricingPlan.update.mockResolvedValue(expectedResult);

      const result = await service.update(id, updatePricingDto);

      expect(prisma.pricingPlan.update).toHaveBeenCalledWith({
        where: { id },
        data: {
          ...updatePricingDto,
          features: updatePricingDto.features as any,
        },
      });
      expect(result).toEqual(expectedResult);
    });
  });

  describe('remove', () => {
    it('should delete a pricing plan', async () => {
      const id = '1';
      const expectedResult = { id, name: 'Basic Plan', price: 10 };

      mockPrismaService.pricingPlan.delete.mockResolvedValue(expectedResult);

      const result = await service.remove(id);

      expect(prisma.pricingPlan.delete).toHaveBeenCalledWith({
        where: { id },
      });
      expect(result).toEqual(expectedResult);
    });
  });
});
