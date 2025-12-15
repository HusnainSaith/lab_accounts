import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AccountBalance } from '../companies/entities/account-balance.entity';
import { User } from '../users/entities/user.entity';
import { Role } from '../roles/entities/role.entity';
import { AccountBalancesController } from './controllers/account-balances.controller';
import { AccountBalancesService } from './services/account-balances.service';

@Module({
  imports: [TypeOrmModule.forFeature([AccountBalance, User, Role])],
  controllers: [AccountBalancesController],
  providers: [AccountBalancesService],
  exports: [TypeOrmModule, AccountBalancesService],
})
export class AccountBalancesModule {}