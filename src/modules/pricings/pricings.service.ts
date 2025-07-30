import { Injectable } from '@nestjs/common';
import { CreatePricingDto } from './dto/create-pricing.dto';
import { UpdatePricingDto } from './dto/update-pricing.dto';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class PricingsService {
  constructor(private prisma: PrismaService) {}

  async create(createPricingDto: CreatePricingDto) {
    return this.prisma.pricingPlan.create({
      data: {
        ...createPricingDto,
        features: createPricingDto.features as any,
      },
    });
  }

  async findAll() {
    return this.prisma.pricingPlan.findMany({
      include: { features: true },
    });
  }

  async findOne(id: string) {
    return this.prisma.pricingPlan.findUnique({
      where: { id },
      include: { features: true },
    });
  }

  async update(id: string, updatePricingDto: UpdatePricingDto) {
    return this.prisma.pricingPlan.update({
      where: { id },
      data: {
        ...updatePricingDto,
        features: updatePricingDto.features as any,
      },
    });
  }

  async remove(id: string) {
    return this.prisma.pricingPlan.delete({
      where: { id },
    });
  }
}
