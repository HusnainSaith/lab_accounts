import { Controller, Get, Patch, Body, UseGuards, Req } from '@nestjs/common';
import { SettingsService } from '../services/settings.service';
import { UpdateUserSettingsDto } from '../dto/update-user-settings.dto';
import { UpdateTenantSettingsDto } from '../dto/update-tenant-settings.dto';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { CompanyContext } from '../../../common/decorators/company-context.decorator';
import { PermissionsGuard } from '../../../common/guards/permissions.guard';
import { RequirePermissions } from '../../../common/decorators/permissions.decorator';

@Controller('settings')
@UseGuards(JwtAuthGuard, PermissionsGuard)
export class SettingsController {
    constructor(private readonly settingsService: SettingsService) { }

    @Get('user')
    @RequirePermissions('settings.view')
    getUserSettings(@Req() req: any) {
        return this.settingsService.getUserSettings(req.user.id);
    }

    @Patch('user')
    @RequirePermissions('settings.edit')
    updateUserSettings(@Req() req: any, @Body() updateDto: UpdateUserSettingsDto) {
        return this.settingsService.updateUserSettings(req.user.id, updateDto);
    }

    @Get('tenant')
    @RequirePermissions('settings.view')
    getTenantSettings(@CompanyContext() companyId: string) {
        return this.settingsService.getTenantSettings(companyId);
    }

    @Patch('tenant')
    @RequirePermissions('settings.edit')
    updateTenantSettings(@CompanyContext() companyId: string, @Body() updateDto: UpdateTenantSettingsDto) {
        return this.settingsService.updateTenantSettings(companyId, updateDto);
    }
}
