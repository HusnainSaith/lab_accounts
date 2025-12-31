import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards } from '@nestjs/common';
import { FiscalYearsService } from '../services/fiscal-years.service';
import { CreateFiscalYearDto, UpdateFiscalYearDto } from '../dto';
import { RequirePermissions } from '../../../common/decorators/permissions.decorator';
import { PermissionsGuard } from '../../../common/guards/permissions.guard';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { CompanyContext } from '../../../common/decorators/company-context.decorator';

@Controller('fiscal-years')
@UseGuards(JwtAuthGuard, PermissionsGuard)
export class FiscalYearsController {
  constructor(private readonly fiscalYearsService: FiscalYearsService) { }

  @Post()
  @RequirePermissions('fiscal-years.create')
  create(@Body() createFiscalYearDto: CreateFiscalYearDto, @CompanyContext() companyId: string) {
    return this.fiscalYearsService.create(createFiscalYearDto, companyId);
  }

  @Get()
  @RequirePermissions('fiscal-years.read')
  findAll(@CompanyContext() companyId: string) {
    return this.fiscalYearsService.findAll(companyId);
  }

  @Get('current')
  @RequirePermissions('fiscal-years.read')
  getCurrentFiscalYear(@CompanyContext() companyId: string) {
    return this.fiscalYearsService.getCurrentFiscalYear(companyId);
  }

  @Get(':id')
  @RequirePermissions('fiscal-years.read')
  findOne(@Param('id') id: string, @CompanyContext() companyId: string) {
    return this.fiscalYearsService.findOne(id, companyId);
  }

  @Patch(':id')
  @RequirePermissions('fiscal-years.update')
  update(@Param('id') id: string, @Body() updateFiscalYearDto: UpdateFiscalYearDto, @CompanyContext() companyId: string) {
    return this.fiscalYearsService.update(id, updateFiscalYearDto, companyId);
  }

  @Patch(':id/close')
  @RequirePermissions('fiscal-years.close')
  closeFiscalYear(@Param('id') id: string, @CompanyContext() companyId: string) {
    return this.fiscalYearsService.closeFiscalYear(id, companyId);
  }

  @Patch(':id/open')
  @RequirePermissions('fiscal-years.update')
  openFiscalYear(@Param('id') id: string, @CompanyContext() companyId: string) {
    return this.fiscalYearsService.openFiscalYear(id, companyId);
  }


  @Delete(':id')
  @RequirePermissions('fiscal-years.delete')
  remove(@Param('id') id: string, @CompanyContext() companyId: string) {
    return this.fiscalYearsService.remove(id, companyId);
  }
}