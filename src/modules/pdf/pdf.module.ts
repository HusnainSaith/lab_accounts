import { Module } from '@nestjs/common';
import { PdfService } from './services/pdf.service';
import { PdfController } from './controllers/pdf.controller';
import { InvoicesModule } from '../invoices/invoices.module';
import { FileUploadModule } from '../file-upload/file-upload.module';

@Module({
  imports: [InvoicesModule, FileUploadModule],
  controllers: [PdfController],
  providers: [PdfService],
  exports: [PdfService],
})
export class PdfModule {}