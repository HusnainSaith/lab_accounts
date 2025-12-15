import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Account } from '../companies/entities/account.entity';
import { User } from '../users/entities/user.entity';
import { Role } from '../roles/entities/role.entity';
import { AccountsController } from './controllers/accounts.controller';
import { AccountsService } from './services/accounts.service';

@Module({
  imports: [TypeOrmModule.forFeature([Account, User, Role])],
  controllers: [AccountsController],
  providers: [AccountsService],
  exports: [TypeOrmModule, AccountsService],
})
export class AccountsModule {}