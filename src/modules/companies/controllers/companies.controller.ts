import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, UseInterceptors, Query } from '@nestjs/common';
import { CompaniesService } from '../services/companies.service';
import { CreateCompanyDto, UpdateCompanyDto } from '../dto';
import { RequirePermissions } from '../../../common/decorators/permissions.decorator';
import { PermissionsGuard } from '../../../common/guards/permissions.guard';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { CompanyContext } from '../../../common/decorators/company-context.decorator';

@Controller('companies')
@UseGuards(JwtAuthGuard, PermissionsGuard)
export class CompaniesController {
  constructor(private readonly companiesService: CompaniesService) {}

  @Post()
  @RequirePermissions('companies.create')
  create(@Body() createCompanyDto: CreateCompanyDto) {
    return this.companiesService.create(createCompanyDto);
  }

  @Get()
  @RequirePermissions('companies.read')
  findAll(@Query('activeOnly') activeOnly?: string) {
    const active = activeOnly !== 'false';
    return this.companiesService.findAll(active);
  }

  @Get('statistics')
  @RequirePermissions('companies.read')
  getStatistics(@CompanyContext() companyId: string) {
    return this.companiesService.getStatistics(companyId);
  }

  @Get('country/:countryCode')
  @RequirePermissions('companies.read')
  findByCountry(@Param('countryCode') countryCode: string) {
    return this.companiesService.findByCountry(countryCode);
  }

  @Get(':id/stats')
  @RequirePermissions('companies.read')
  getStats(@Param('id') id: string) {
    return this.companiesService.getCompanyStats(id);
  }

  @Get(':id')
  @RequirePermissions('companies.read')
  findOne(@Param('id') id: string) {
    return this.companiesService.findOne(id);
  }

  @Patch(':id')
  @RequirePermissions('companies.update')
  update(@Param('id') id: string, @Body() updateCompanyDto: UpdateCompanyDto) {
    return this.companiesService.update(id, updateCompanyDto);
  }

  @Patch(':id/deactivate')
  @RequirePermissions('companies.update')
  deactivate(@Param('id') id: string) {
    return this.companiesService.deactivate(id);
  }

  @Patch(':id/activate')
  @RequirePermissions('companies.update')
  activate(@Param('id') id: string) {
    return this.companiesService.activate(id);
  }

  @Delete(':id')
  @RequirePermissions('companies.delete')
  remove(@Param('id') id: string) {
    return this.companiesService.remove(id);
  }
}