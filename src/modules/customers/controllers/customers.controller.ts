import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, UseInterceptors, Query } from '@nestjs/common';
import { CustomersService } from '../services/customers.service';
import { CreateCustomerDto, UpdateCustomerDto } from '../dto';
import { CustomerType } from '../entities/customer.entity';
import { Roles } from '../../../common/decorators/roles.decorator';
import { RolesGuard } from '../../../common/guards/roles.guard';
import { CompanyGuard } from '../../../common/guards/company.guard';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { RLSInterceptor } from '../../../common/interceptors/rls.interceptor';
import { CompanyContext } from '../../../common/decorators/company-context.decorator';

@Controller('customers')
@UseGuards(JwtAuthGuard, RolesGuard, CompanyGuard)
@UseInterceptors(RLSInterceptor)
export class CustomersController {
  constructor(private readonly customersService: CustomersService) {}

  @Post()
  @Roles('owner', 'staff')
  create(@Body() createCustomerDto: CreateCustomerDto, @CompanyContext() companyId: string) {
    return this.customersService.create({ ...createCustomerDto, companyId });
  }

  @Get()
  @Roles('owner', 'staff', 'accountant')
  findAll(@CompanyContext() companyId: string, @Query('customerType') customerType?: CustomerType, @Query('search') search?: string) {
    return this.customersService.findAll(companyId, customerType, search);
  }

  @Get('statistics')
  @Roles('owner', 'staff', 'accountant')
  getStatistics(@CompanyContext() companyId: string) {
    return this.customersService.getStatistics(companyId);
  }

  @Get('vat-registered')
  @Roles('owner', 'staff', 'accountant')
  findVatRegistered(@CompanyContext() companyId: string) {
    return this.customersService.findVatRegistered(companyId);
  }

  @Get('stats')
  @Roles('owner', 'staff', 'accountant')
  getStats(@CompanyContext() companyId: string) {
    return this.customersService.getCustomerStats(companyId);
  }

  @Get('type/:type')
  @Roles('owner', 'staff', 'accountant')
  findByType(@CompanyContext() companyId: string, @Param('type') type: CustomerType) {
    return this.customersService.findByType(companyId, type);
  }

  @Get(':id')
  @Roles('owner', 'staff', 'accountant')
  findOne(@Param('id') id: string, @CompanyContext() companyId: string) {
    return this.customersService.findOne(id, companyId);
  }

  @Patch(':id')
  @Roles('owner', 'staff')
  update(@Param('id') id: string, @Body() updateCustomerDto: UpdateCustomerDto, @CompanyContext() companyId: string) {
    return this.customersService.update(id, updateCustomerDto, companyId);
  }

  @Delete(':id')
  @Roles('owner')
  remove(@Param('id') id: string, @CompanyContext() companyId: string) {
    return this.customersService.remove(id, companyId);
  }
}