import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, UseInterceptors, Query } from '@nestjs/common';
import { ItemsService } from '../services/items.service';
import { CreateItemDto, UpdateItemDto } from '../dto';
import { Roles } from '../../../common/decorators/roles.decorator';
import { RolesGuard } from '../../../common/guards/roles.guard';
import { CompanyGuard } from '../../../common/guards/company.guard';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { RLSInterceptor } from '../../../common/interceptors/rls.interceptor';
import { CompanyContext } from '../../../common/decorators/company-context.decorator';

@Controller('items')
@UseGuards(JwtAuthGuard, RolesGuard, CompanyGuard)
@UseInterceptors(RLSInterceptor)
export class ItemsController {
  constructor(private readonly itemsService: ItemsService) {}

  @Post()
  @Roles('owner', 'staff', 'accountant')
  create(@Body() createItemDto: CreateItemDto, @CompanyContext() companyId: string) {
    return this.itemsService.create(createItemDto, companyId);
  }

  @Get()
  @Roles('owner', 'staff', 'accountant')
  findAll(@CompanyContext() companyId: string, @Query('search') search?: string) {
    return this.itemsService.findAll(companyId, search);
  }

  @Get('statistics')
  @Roles('owner', 'staff', 'accountant')
  getStatistics(@CompanyContext() companyId: string) {
    return this.itemsService.getStatistics(companyId);
  }

  @Get('ai-suggestions')
  @Roles('owner', 'staff', 'accountant')
  getAISuggestions(@CompanyContext() companyId: string, @Query('q') query: string) {
    return this.itemsService.getAISuggestions(companyId, query);
  }

  @Get(':id')
  @Roles('owner', 'staff', 'accountant')
  findOne(@Param('id') id: string, @CompanyContext() companyId: string) {
    return this.itemsService.findOne(id, companyId);
  }

  @Patch(':id')
  @Roles('owner', 'staff', 'accountant')
  update(@Param('id') id: string, @Body() updateItemDto: UpdateItemDto, @CompanyContext() companyId: string) {
    return this.itemsService.update(id, updateItemDto, companyId);
  }

  @Delete(':id')
  @Roles('owner', 'staff', 'accountant')
  remove(@Param('id') id: string, @CompanyContext() companyId: string) {
    return this.itemsService.remove(id, companyId);
  }
}