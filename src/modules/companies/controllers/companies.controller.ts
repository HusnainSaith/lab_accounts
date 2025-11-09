import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, UseInterceptors, Query } from '@nestjs/common';
import { CompaniesService } from '../services/companies.service';
import { CreateCompanyDto, UpdateCompanyDto } from '../dto';
import { Roles } from '../../../common/decorators/roles.decorator';
import { RolesGuard } from '../../../common/guards/roles.guard';
import { CompanyGuard } from '../../../common/guards/company.guard';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { RLSInterceptor } from '../../../common/interceptors/rls.interceptor';
import { CompanyContext } from '../../../common/decorators/company-context.decorator';

@Controller('companies')
@UseGuards(JwtAuthGuard, RolesGuard, CompanyGuard)
@UseInterceptors(RLSInterceptor)
export class CompaniesController {
  constructor(private readonly companiesService: CompaniesService) {}

  @Post()
  @Roles('owner')
  create(@Body() createCompanyDto: CreateCompanyDto) {
    return this.companiesService.create(createCompanyDto);
  }

  @Get()
  @Roles('owner', 'staff', 'accountant')
  findAll(@Query('activeOnly') activeOnly?: string) {
    const active = activeOnly !== 'false';
    return this.companiesService.findAll(active);
  }

  @Get('statistics')
  @Roles('owner', 'staff', 'accountant')
  getStatistics(@CompanyContext() companyId: string) {
    return this.companiesService.getStatistics(companyId);
  }

  @Get('country/:countryCode')
  @Roles('owner')
  findByCountry(@Param('countryCode') countryCode: string) {
    return this.companiesService.findByCountry(countryCode);
  }

  @Get(':id/stats')
  @Roles('owner', 'staff', 'accountant')
  getStats(@Param('id') id: string) {
    return this.companiesService.getCompanyStats(id);
  }

  @Get(':id')
  @Roles('owner', 'staff', 'accountant')
  findOne(@Param('id') id: string) {
    return this.companiesService.findOne(id);
  }

  @Patch(':id')
  @Roles('owner')
  update(@Param('id') id: string, @Body() updateCompanyDto: UpdateCompanyDto) {
    return this.companiesService.update(id, updateCompanyDto);
  }

  @Patch(':id/deactivate')
  @Roles('owner')
  deactivate(@Param('id') id: string) {
    return this.companiesService.deactivate(id);
  }

  @Patch(':id/activate')
  @Roles('owner')
  activate(@Param('id') id: string) {
    return this.companiesService.activate(id);
  }

  @Delete(':id')
  @Roles('owner')
  remove(@Param('id') id: string) {
    return this.companiesService.remove(id);
  }
}