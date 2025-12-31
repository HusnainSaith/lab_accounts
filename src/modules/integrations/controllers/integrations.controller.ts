import { Controller, Get, Post, Body, Param, Patch, Delete, UseGuards } from '@nestjs/common';
import { IntegrationsService } from '../services/integrations.service';
import { CreateIntegrationDto } from '../dto/create-integration.dto';
import { UpdateIntegrationDto } from '../dto/update-integration.dto';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { CompanyContext } from '../../../common/decorators/company-context.decorator';
import { PermissionsGuard } from '../../../common/guards/permissions.guard';
import { RequirePermissions } from '../../../common/decorators/permissions.decorator';

@Controller('integrations')
@UseGuards(JwtAuthGuard, PermissionsGuard)
export class IntegrationsController {
    constructor(private readonly integrationsService: IntegrationsService) { }

    @Post()
    @RequirePermissions('integrations.create')
    create(@Body() createDto: CreateIntegrationDto, @CompanyContext() companyId: string) {
        return this.integrationsService.create(createDto, companyId);
    }

    @Get()
    @RequirePermissions('integrations.view')
    findAll() {
        return this.integrationsService.findAll();
    }

    @Get(':id')
    @RequirePermissions('integrations.view')
    findOne(@Param('id') id: string) {
        return this.integrationsService.findOne(id);
    }

    @Patch(':id')
    @RequirePermissions('integrations.edit')
    update(@Param('id') id: string, @Body() updateDto: UpdateIntegrationDto) {
        return this.integrationsService.update(id, updateDto);
    }

    @Post(':id/activate')
    @RequirePermissions('integrations.edit')
    activate(@Param('id') id: string) {
        return this.integrationsService.activate(id);
    }

    @Post(':id/deactivate')
    @RequirePermissions('integrations.edit')
    deactivate(@Param('id') id: string) {
        return this.integrationsService.deactivate(id);
    }

    @Post(':id/test')
    @RequirePermissions('integrations.view')
    testConnection(@Param('id') id: string) {
        return this.integrationsService.testConnection(id);
    }

    @Delete(':id')
    @RequirePermissions('integrations.delete')
    remove(@Param('id') id: string) {
        return this.integrationsService.remove(id);
    }
}
