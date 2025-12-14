import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ReportsService } from './services/reports.service';
import { ExcelExportService } from './services/excel-export.service';
import { ReportsController } from './controllers/reports.controller';
import { Invoice } from '../invoices/entities/invoice.entity';
import { Constant } from '../constant/entities/constant.entity';
import { User } from '../users/entities/user.entity';
import { Role } from '../roles/entities/role.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Invoice, Constant, User, Role])],
  controllers: [ReportsController],
  providers: [ReportsService, ExcelExportService],
  exports: [ReportsService, ExcelExportService],
})
export class ReportsModule {}