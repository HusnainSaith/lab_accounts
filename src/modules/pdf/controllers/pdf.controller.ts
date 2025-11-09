import {
  Controller,
  Get,
  Param,
  Query,
  Res,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { CompanyContext } from '../../../common/decorators/company-context.decorator';
import type { Response } from 'express';
import { PdfService } from '../services/pdf.service';
import { InvoicesService } from '../../invoices/services/invoices.service';
import { FileUploadService } from '../../file-upload/services/file-upload.service';
import { Roles } from '../../../common/decorators/roles.decorator';
import { RolesGuard } from '../../../common/guards/roles.guard';
import { CompanyGuard } from '../../../common/guards/company.guard';
import { RLSInterceptor } from '../../../common/interceptors/rls.interceptor';

@Controller('pdf')
@UseGuards(RolesGuard, CompanyGuard)
@UseInterceptors(RLSInterceptor)
export class PdfController {
  constructor(
    private readonly pdfService: PdfService,
    private readonly invoicesService: InvoicesService,
    private readonly fileUploadService: FileUploadService,
  ) {}

  @Get('invoice/:id')
  @Roles('owner', 'staff', 'accountant')
  async generateInvoicePDF(
    @Param('id') invoiceId: string,
    @Query('lang') language: 'en' | 'ar' = 'en',
    @Res() res: Response,
    @CompanyContext() companyId: string,
  ) {
    const invoice = await this.invoicesService.findOne(invoiceId, companyId);
    if (!invoice) {
      return res.status(404).json({ message: 'Invoice not found' });
    }

    const pdfBuffer = await this.pdfService.generateInvoicePDF(
      invoice,
      language,
    );

    // Upload to S3 and update invoice
    const pdfUrl = await this.fileUploadService.uploadInvoicePDF(
      pdfBuffer,
      invoice.invoiceNumber,
      invoice.companyId,
    );

    await this.invoicesService.update(invoiceId, { pdfPath: pdfUrl }, companyId);

    res.set({
      'Content-Type': 'application/pdf',
      'Content-Disposition': `attachment; filename="invoice-${invoice.invoiceNumber}.pdf"`,
      'Content-Length': pdfBuffer.length,
    });

    res.send(pdfBuffer);
  }
}
