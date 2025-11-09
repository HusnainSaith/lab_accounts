import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, UseInterceptors, Query } from '@nestjs/common';
import { VatReportsService } from '../services/vat-reports.service';
import { CreateVatReportDto, UpdateVatReportDto } from '../dto';
import { Roles } from '../../../common/decorators/roles.decorator';
import { RolesGuard } from '../../../common/guards/roles.guard';
import { CompanyGuard } from '../../../common/guards/company.guard';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { RLSInterceptor } from '../../../common/interceptors/rls.interceptor';
import { CompanyContext } from '../../../common/decorators/company-context.decorator';

@Controller('vat-reports')
@UseGuards(JwtAuthGuard, RolesGuard, CompanyGuard)
@UseInterceptors(RLSInterceptor)
export class VatReportsController {
  constructor(private readonly vatReportsService: VatReportsService) {}

  @Post()
  @Roles('owner', 'accountant')
  create(@Body() createVatReportDto: CreateVatReportDto, @CompanyContext() companyId: string) {
    return this.vatReportsService.create({ ...createVatReportDto, companyId });
  }

  @Get()
  @Roles('owner', 'accountant')
  findAll(@CompanyContext() companyId: string, @Query('status') status?: string) {
    return this.vatReportsService.findAll(companyId, status);
  }

  @Get('statistics')
  @Roles('owner', 'accountant')
  getStatistics(@CompanyContext() companyId: string) {
    return this.vatReportsService.getStatistics(companyId);
  }

  @Get('by-period')
  @Roles('owner', 'accountant')
  findByPeriod(
    @CompanyContext() companyId: string,
    @Query('startDate') startDate: string,
    @Query('endDate') endDate: string
  ) {
    return this.vatReportsService.findByPeriod(
      companyId,
      new Date(startDate),
      new Date(endDate)
    );
  }

  @Get(':id')
  @Roles('owner', 'accountant')
  findOne(@Param('id') id: string, @CompanyContext() companyId: string) {
    return this.vatReportsService.findOne(id, companyId);
  }

  @Patch(':id')
  @Roles('owner', 'accountant')
  update(@Param('id') id: string, @Body() updateVatReportDto: UpdateVatReportDto, @CompanyContext() companyId: string) {
    return this.vatReportsService.update(id, updateVatReportDto, companyId);
  }

  @Patch(':id/submit')
  @Roles('owner', 'accountant')
  submit(@Param('id') id: string, @CompanyContext() companyId: string) {
    return this.vatReportsService.submit(id, companyId);
  }

  @Delete(':id')
  @Roles('owner')
  remove(@Param('id') id: string, @CompanyContext() companyId: string) {
    return this.vatReportsService.remove(id, companyId);
  }
}