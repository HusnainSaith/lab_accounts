import { Controller, Get, Post, Body, Patch, Param, UseGuards, UseInterceptors, Request, Query } from '@nestjs/common';
import { InvoicesService } from '../services/invoices.service';
import { CreateInvoiceDto, UpdateInvoiceDto } from '../dto';
import { Roles } from '../../../common/decorators/roles.decorator';
import { RolesGuard } from '../../../common/guards/roles.guard';
import { CompanyGuard } from '../../../common/guards/company.guard';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { RLSInterceptor } from '../../../common/interceptors/rls.interceptor';
import { CompanyContext } from '../../../common/decorators/company-context.decorator';

@Controller('invoices')
@UseGuards(JwtAuthGuard, RolesGuard, CompanyGuard)
@UseInterceptors(RLSInterceptor)
export class InvoicesController {
  constructor(private readonly invoicesService: InvoicesService) {}

  @Post()
  @Roles('owner', 'staff', 'accountant')
  create(@Body() createInvoiceDto: CreateInvoiceDto, @CompanyContext() companyId: string, @Request() req: { user: { id: string } }) {
    return this.invoicesService.create(createInvoiceDto, companyId, req.user.id);
  }

  @Get()
  @Roles('owner', 'staff', 'accountant')
  findAll(@CompanyContext() companyId: string, @Query('status') status?: string) {
    return this.invoicesService.findAll(companyId, status);
  }

  @Get('statistics')
  @Roles('owner', 'staff', 'accountant')
  getStatistics(@CompanyContext() companyId: string) {
    return this.invoicesService.getStatistics(companyId);
  }

  @Get('generate-number')
  @Roles('owner', 'staff', 'accountant')
  generateInvoiceNumber(@CompanyContext() companyId: string) {
    return this.invoicesService.generateInvoiceNumber(companyId);
  }

  @Get(':id')
  @Roles('owner', 'staff', 'accountant')
  findOne(@Param('id') id: string, @CompanyContext() companyId: string) {
    return this.invoicesService.findOne(id, companyId);
  }

  @Patch(':id')
  @Roles('owner', 'staff', 'accountant')
  update(@Param('id') id: string, @Body() updateInvoiceDto: UpdateInvoiceDto, @CompanyContext() companyId: string) {
    return this.invoicesService.update(id, updateInvoiceDto, companyId);
  }

  @Patch(':id/send')
  @Roles('owner', 'staff')
  markAsSent(@Param('id') id: string, @CompanyContext() companyId: string) {
    return this.invoicesService.markAsSent(id, companyId);
  }

  @Patch(':id/paid')
  @Roles('owner', 'staff', 'accountant')
  markAsPaid(@Param('id') id: string, @CompanyContext() companyId: string) {
    return this.invoicesService.markAsPaid(id, companyId);
  }
}