import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { VatReportsService } from './services/vat-reports.service';
import { VatReportsController } from './controllers/vat-reports.controller';
import { VatReport } from './entities/vat-report.entity';

@Module({
  imports: [TypeOrmModule.forFeature([VatReport])],
  controllers: [VatReportsController],
  providers: [VatReportsService],
  exports: [VatReportsService],
})
export class VatReportsModule {}