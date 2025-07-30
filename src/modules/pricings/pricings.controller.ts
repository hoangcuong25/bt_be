import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { PricingsService } from './pricings.service';
import { CreatePricingDto } from './dto/create-pricing.dto';
import { UpdatePricingDto } from './dto/update-pricing.dto';

@Controller('pricings')
export class PricingsController {
  constructor(private readonly pricingsService: PricingsService) {}

  @Post('create')
  create(@Body() createPricingDto: CreatePricingDto) {
    return this.pricingsService.create(createPricingDto);
  }

  @Get('get-all')
  findAll() {
    return this.pricingsService.findAll();
  }

  @Get('get/:id')
  findOne(@Param('id') id: string) {
    return this.pricingsService.findOne(id);
  }

  @Patch('update/:id')
  update(@Param('id') id: string, @Body() updatePricingDto: UpdatePricingDto) {
    return this.pricingsService.update(id, updatePricingDto);
  }

  @Delete('delete/:id')
  remove(@Param('id') id: string) {
    return this.pricingsService.remove(id);
  }
}
