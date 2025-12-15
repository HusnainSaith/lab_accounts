import { Controller, Get, Post, Body, Patch, Param, Delete, Query, UseGuards, Request } from '@nestjs/common';
import { ConstantService } from '../services/constant.service';
import { CreateConstantDto, UpdateConstantDto } from '../dto';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';

@Controller('constants')
@UseGuards(JwtAuthGuard)
export class ConstantController {
  constructor(private readonly constantService: ConstantService) {}

  @Post()
  create(
    @Request() req: any,
    @Body() createConstantDto: CreateConstantDto,
  ) {
    const companyId = req.user?.companyId;
    return this.constantService.create(companyId, createConstantDto);
  }

  @Get()
  findAll(
    @Request() req: any,
    @Query('type') type?: string,
  ) {
    const companyId = req.user?.companyId;
    if (type) {
      return this.constantService.findByType(companyId, type);
    }
    return this.constantService.findAll(companyId);
  }

  @Get(':id')
  findOne(
    @Request() req: any,
    @Param('id') id: string,
  ) {
    const companyId = req.user?.companyId;
    return this.constantService.findOne(companyId, id);
  }

  @Patch(':id')
  update(
    @Request() req: any,
    @Param('id') id: string,
    @Body() updateConstantDto: UpdateConstantDto,
  ) {
    const companyId = req.user?.companyId;
    return this.constantService.update(companyId, id, updateConstantDto);
  }

  @Delete(':id')
  remove(
    @Request() req: any,
    @Param('id') id: string,
  ) {
    const companyId = req.user?.companyId;
    return this.constantService.remove(companyId, id);
  }
}