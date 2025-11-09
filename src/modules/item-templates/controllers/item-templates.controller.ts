import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Query } from '@nestjs/common';
import { ItemTemplatesService } from '../services/item-templates.service';
import { CreateItemTemplateDto, UpdateItemTemplateDto } from '../dto';
import { Roles } from '../../../common/decorators/roles.decorator';
import { RolesGuard } from '../../../common/guards/roles.guard';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';

@Controller('item-templates')
@UseGuards(JwtAuthGuard, RolesGuard)
export class ItemTemplatesController {
  constructor(private readonly itemTemplatesService: ItemTemplatesService) {}

  @Post()
  @Roles('owner')
  create(@Body() createItemTemplateDto: CreateItemTemplateDto) {
    return this.itemTemplatesService.create(createItemTemplateDto);
  }

  @Get()
  @Roles('owner', 'staff')
  findAll(@Query('industry') industry?: string, @Query('search') search?: string) {
    if (industry) {
      return this.itemTemplatesService.findByIndustry(industry);
    }
    return this.itemTemplatesService.findAll(search);
  }

  @Get('statistics')
  @Roles('owner', 'staff')
  getStatistics() {
    return this.itemTemplatesService.getStatistics();
  }

  @Get(':id')
  @Roles('owner', 'staff')
  findOne(@Param('id') id: string) {
    return this.itemTemplatesService.findOne(id);
  }

  @Patch(':id')
  @Roles('owner')
  update(@Param('id') id: string, @Body() updateItemTemplateDto: UpdateItemTemplateDto) {
    return this.itemTemplatesService.update(id, updateItemTemplateDto);
  }

  @Patch(':id/use')
  @Roles('owner', 'staff')
  incrementUsage(@Param('id') id: string) {
    return this.itemTemplatesService.incrementUsage(id);
  }

  @Delete(':id')
  @Roles('owner')
  remove(@Param('id') id: string) {
    return this.itemTemplatesService.remove(id);
  }
}