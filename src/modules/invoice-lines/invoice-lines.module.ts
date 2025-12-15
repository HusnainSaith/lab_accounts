import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { InvoiceLine } from '../invoice-items/entities/invoice-line.entity';
import { User } from '../users/entities/user.entity';
import { Role } from '../roles/entities/role.entity';
import { InvoiceLinesController } from './controllers/invoice-lines.controller';
import { InvoiceLinesService } from './services/invoice-lines.service';

@Module({
  imports: [TypeOrmModule.forFeature([InvoiceLine, User, Role])],
  controllers: [InvoiceLinesController],
  providers: [InvoiceLinesService],
  exports: [TypeOrmModule, InvoiceLinesService],
})
export class InvoiceLinesModule {}