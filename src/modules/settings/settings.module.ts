import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SettingsService } from './services/settings.service';
import { SettingsController } from './controllers/settings.controller';
import { UserSettings } from './entities/user-settings.entity';
import { TenantSettings } from './entities/tenant-settings.entity';
import { Company } from '../companies/entities/company.entity';
import { User } from '../users/entities/user.entity';
import { Role } from '../roles/entities/role.entity';

@Module({
    imports: [TypeOrmModule.forFeature([UserSettings, TenantSettings, Company, User, Role])],
    controllers: [SettingsController],
    providers: [SettingsService],
    exports: [SettingsService],
})
export class SettingsModule { }
