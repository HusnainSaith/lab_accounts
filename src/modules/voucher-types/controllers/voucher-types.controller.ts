import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards } from '@nestjs/common';
import { VoucherTypesService } from '../services/voucher-types.service';
import { CreateVoucherTypeDto, UpdateVoucherTypeDto } from '../dto';
import { RequirePermissions } from '../../../common/decorators/permissions.decorator';
import { PermissionsGuard } from '../../../common/guards/permissions.guard';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { CompanyContext } from '../../../common/decorators/company-context.decorator';

@Controller('voucher-types')
@UseGuards(JwtAuthGuard, PermissionsGuard)
export class VoucherTypesController {
  constructor(private readonly voucherTypesService: VoucherTypesService) {}

  @Post()
  @RequirePermissions('voucher-types.create')
  create(@Body() createVoucherTypeDto: CreateVoucherTypeDto, @CompanyContext() companyId: string) {
    return this.voucherTypesService.create(createVoucherTypeDto, companyId);
  }

  @Get()
  @RequirePermissions('voucher-types.read')
  findAll(@CompanyContext() companyId: string) {
    return this.voucherTypesService.findAll(companyId);
  }

  @Get(':id')
  @RequirePermissions('voucher-types.read')
  findOne(@Param('id') id: string, @CompanyContext() companyId: string) {
    return this.voucherTypesService.findOne(id, companyId);
  }

  @Patch(':id')
  @RequirePermissions('voucher-types.update')
  update(@Param('id') id: string, @Body() updateVoucherTypeDto: UpdateVoucherTypeDto, @CompanyContext() companyId: string) {
    return this.voucherTypesService.update(id, updateVoucherTypeDto, companyId);
  }

  @Delete(':id')
  @RequirePermissions('voucher-types.delete')
  remove(@Param('id') id: string, @CompanyContext() companyId: string) {
    return this.voucherTypesService.remove(id, companyId);
  }
}