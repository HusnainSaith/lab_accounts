import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { InvoiceItem } from './entities/invoice-item.entity';

@Module({
  imports: [TypeOrmModule.forFeature([InvoiceItem])],
  exports: [TypeOrmModule],
})
export class InvoiceItemsModule {}