import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UserSettings } from '../entities/user-settings.entity';
import { TenantSettings } from '../entities/tenant-settings.entity';
import { UpdateUserSettingsDto } from '../dto/update-user-settings.dto';
import { UpdateTenantSettingsDto } from '../dto/update-tenant-settings.dto';
import { Company } from '../../companies/entities/company.entity';

@Injectable()
export class SettingsService {
    constructor(
        @InjectRepository(UserSettings)
        private userSettingsRepository: Repository<UserSettings>,
        @InjectRepository(TenantSettings)
        private tenantSettingsRepository: Repository<TenantSettings>,
        @InjectRepository(Company)
        private companyRepository: Repository<Company>,
    ) { }

    async getUserSettings(userId: string): Promise<UserSettings> {
        let settings = await this.userSettingsRepository.findOne({ where: { userId } });
        if (!settings) {
            settings = this.userSettingsRepository.create({
                userId,
                theme: 'light',
                language: 'en',
                notifications: { email: true, push: false, sms: false },
                dateFormat: 'YYYY-MM-DD',
                numberFormat: '1,000.00',
                timezone: 'UTC',
            });
            settings = await this.userSettingsRepository.save(settings);
        }
        return settings;
    }

    async updateUserSettings(userId: string, updateDto: UpdateUserSettingsDto): Promise<UserSettings> {
        const settings = await this.getUserSettings(userId);
        Object.assign(settings, updateDto);
        return await this.userSettingsRepository.save(settings);
    }

    async getTenantSettings(companyId: string): Promise<TenantSettings> {
        let settings = await this.tenantSettingsRepository.findOne({ where: { companyId } });
        if (!settings) {
            const company = await this.companyRepository.findOne({ where: { id: companyId } });
            if (!company) throw new NotFoundException('Company not found');

            settings = this.tenantSettingsRepository.create({
                companyId,
                companyName: company.name,
                companyEmail: company.email || '',
                companyPhone: company.phone || '',
                companyAddress: company.address || '',
                fiscalYearStart: new Date(), // Default
                currency: company.currencyCode,
                taxRate: 0,
            });
            settings = await this.tenantSettingsRepository.save(settings);
        }
        return settings;
    }

    async updateTenantSettings(companyId: string, updateDto: UpdateTenantSettingsDto): Promise<TenantSettings> {
        const settings = await this.getTenantSettings(companyId);
        if (updateDto.fiscalYearStart) {
            (settings as any).fiscalYearStart = new Date(updateDto.fiscalYearStart);
            delete (updateDto as any).fiscalYearStart;
        }
        Object.assign(settings, updateDto);
        return await this.tenantSettingsRepository.save(settings);
    }
}
