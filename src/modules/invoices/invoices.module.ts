import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { InvoicesService } from './services/invoices.service';
import { InvoicesController } from './controllers/invoices.controller';
import { Invoice } from './entities/invoice.entity';
import { InvoiceItem } from '../invoice-items/entities/invoice-item.entity';
import { CountriesModule } from '../countries/countries.module';
import { QrCodeModule } from '../qr-code/qr-code.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Invoice, InvoiceItem]),
    CountriesModule,
    QrCodeModule,
  ],
  controllers: [InvoicesController],
  providers: [InvoicesService],
  exports: [InvoicesService],
})
export class InvoicesModule {}