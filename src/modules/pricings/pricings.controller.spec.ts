import { Test, TestingModule } from '@nestjs/testing';
import { PricingsController } from './pricings.controller';
import { PricingsService } from './pricings.service';
import { CreatePricingDto } from './dto/create-pricing.dto';
import { UpdatePricingDto } from './dto/update-pricing.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CanActivate } from '@nestjs/common';

describe('PricingsController', () => {
  let controller: PricingsController;
  let service: PricingsService;

  const mockPricingsService = {
    create: jest.fn(),
    findAll: jest.fn(),
    findOne: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
  };

  // Mock JwtAuthGuard to bypass authentication
  const mockJwtAuthGuard: CanActivate = {
    canActivate: jest.fn().mockReturnValue(true),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [PricingsController],
      providers: [
        { provide: PricingsService, useValue: mockPricingsService },
        { provide: JwtAuthGuard, useValue: mockJwtAuthGuard },
      ],
    }).compile();

    controller = module.get<PricingsController>(PricingsController);
    service = module.get<PricingsService>(PricingsService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('create', () => {
    it('should create a pricing plan', async () => {
      const createPricingDto: CreatePricingDto = {
        name: 'Basic Plan',
        price: 10,
        description: 'Basic plan description',
        features: [{ name: 'Feature 1' }],
      };
      const expectedResult = { id: '1', ...createPricingDto };

      mockPricingsService.create.mockResolvedValue(expectedResult);

      const result = await controller.create(createPricingDto);

      expect(service.create).toHaveBeenCalledWith(createPricingDto);
      expect(result).toEqual(expectedResult);
    });
  });

  describe('findAll', () => {
    it('should return all pricing plans', async () => {
      const expectedResult = [
        {
          id: '1',
          name: 'Basic Plan',
          price: 10,
          features: [{ name: 'Feature 1' }],
        },
      ];

      mockPricingsService.findAll.mockResolvedValue(expectedResult);

      const result = await controller.findAll();

      expect(service.findAll).toHaveBeenCalled();
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
        features: [{ name: 'Feature 1' }],
      };

      mockPricingsService.findOne.mockResolvedValue(expectedResult);

      const result = await controller.findOne(id);

      expect(service.findOne).toHaveBeenCalledWith(id);
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

      mockPricingsService.update.mockResolvedValue(expectedResult);

      const result = await controller.update(id, updatePricingDto);

      expect(service.update).toHaveBeenCalledWith(id, updatePricingDto);
      expect(result).toEqual(expectedResult);
    });
  });

  describe('remove', () => {
    it('should delete a pricing plan', async () => {
      const id = '1';
      const expectedResult = { id, name: 'Basic Plan', price: 10 };

      mockPricingsService.remove.mockResolvedValue(expectedResult);

      const result = await controller.remove(id);

      expect(service.remove).toHaveBeenCalledWith(id);
      expect(result).toEqual(expectedResult);
    });
  });
});
