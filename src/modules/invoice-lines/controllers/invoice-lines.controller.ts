import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards } from '@nestjs/common';
import { InvoiceLinesService } from '../services/invoice-lines.service';
import { CreateInvoiceLineDto, UpdateInvoiceLineDto } from '../dto';
import { RequirePermissions } from '../../../common/decorators/permissions.decorator';
import { PermissionsGuard } from '../../../common/guards/permissions.guard';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { CompanyContext } from '../../../common/decorators/company-context.decorator';

@Controller('invoice-lines')
@UseGuards(JwtAuthGuard, PermissionsGuard)
export class InvoiceLinesController {
  constructor(private readonly invoiceLinesService: InvoiceLinesService) {}

  @Post()
  @RequirePermissions('invoice-lines.create')
  create(@Body() createInvoiceLineDto: CreateInvoiceLineDto, @CompanyContext() companyId: string) {
    return this.invoiceLinesService.create(createInvoiceLineDto, companyId);
  }

  @Get('invoice/:invoiceId')
  @RequirePermissions('invoice-lines.read')
  findByInvoice(@Param('invoiceId') invoiceId: string, @CompanyContext() companyId: string) {
    return this.invoiceLinesService.findByInvoice(invoiceId, companyId);
  }

  @Get(':id')
  @RequirePermissions('invoice-lines.read')
  findOne(@Param('id') id: string, @CompanyContext() companyId: string) {
    return this.invoiceLinesService.findOne(id, companyId);
  }

  @Patch(':id')
  @RequirePermissions('invoice-lines.update')
  update(@Param('id') id: string, @Body() updateInvoiceLineDto: UpdateInvoiceLineDto, @CompanyContext() companyId: string) {
    return this.invoiceLinesService.update(id, updateInvoiceLineDto, companyId);
  }

  @Delete(':id')
  @RequirePermissions('invoice-lines.delete')
  remove(@Param('id') id: string, @CompanyContext() companyId: string) {
    return this.invoiceLinesService.remove(id, companyId);
  }
}