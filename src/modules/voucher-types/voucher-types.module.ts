import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { VoucherType } from '../companies/entities/voucher-type.entity';
import { User } from '../users/entities/user.entity';
import { Role } from '../roles/entities/role.entity';
import { VoucherTypesController } from './controllers/voucher-types.controller';
import { VoucherTypesService } from './services/voucher-types.service';

@Module({
  imports: [TypeOrmModule.forFeature([VoucherType, User, Role])],
  controllers: [VoucherTypesController],
  providers: [VoucherTypesService],
  exports: [TypeOrmModule, VoucherTypesService],
})
export class VoucherTypesModule {}