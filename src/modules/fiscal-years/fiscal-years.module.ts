import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { FiscalYear } from '../companies/entities/fiscal-year.entity';
import { User } from '../users/entities/user.entity';
import { Role } from '../roles/entities/role.entity';
import { FiscalYearsController } from './controllers/fiscal-years.controller';
import { FiscalYearsService } from './services/fiscal-years.service';

@Module({
  imports: [TypeOrmModule.forFeature([FiscalYear, User, Role])],
  controllers: [FiscalYearsController],
  providers: [FiscalYearsService],
  exports: [TypeOrmModule, FiscalYearsService],
})
export class FiscalYearsModule {}
