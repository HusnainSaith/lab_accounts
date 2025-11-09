import { Controller, Get, Param, Query, UseGuards, UseInterceptors } from '@nestjs/common';
import { AuditLogsService } from '../services/audit-logs.service';
import { Roles } from '../../../common/decorators/roles.decorator';
import { RolesGuard } from '../../../common/guards/roles.guard';
import { CompanyGuard } from '../../../common/guards/company.guard';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { RLSInterceptor } from '../../../common/interceptors/rls.interceptor';
import { CompanyContext } from '../../../common/decorators/company-context.decorator';

@Controller('audit-logs')
@UseGuards(JwtAuthGuard, RolesGuard, CompanyGuard)
@UseInterceptors(RLSInterceptor)
export class AuditLogsController {
  constructor(private readonly auditLogsService: AuditLogsService) {}

  @Get()
  @Roles('owner')
  findAll(
    @CompanyContext() companyId: string,
    @Query('action') action?: string,
    @Query('entityType') entityType?: string,
    @Query('limit') limit?: number
  ) {
    return this.auditLogsService.findAll(companyId, action, entityType, limit);
  }

  @Get('statistics')
  @Roles('owner')
  getStatistics(@CompanyContext() companyId: string) {
    return this.auditLogsService.getStatistics(companyId);
  }

  @Get('by-date-range')
  @Roles('owner')
  findByDateRange(
    @CompanyContext() companyId: string,
    @Query('startDate') startDate: string,
    @Query('endDate') endDate: string
  ) {
    return this.auditLogsService.findByDateRange(
      companyId,
      new Date(startDate),
      new Date(endDate)
    );
  }

  @Get('by-user/:userId')
  @Roles('owner')
  findByUser(
    @CompanyContext() companyId: string,
    @Param('userId') userId: string
  ) {
    return this.auditLogsService.findByUser(companyId, userId);
  }

  @Get('entity/:entityType/:entityId')
  @Roles('owner', 'accountant')
  findByEntity(
    @Param('entityType') entityType: string,
    @Param('entityId') entityId: string
  ) {
    return this.auditLogsService.findByEntity(entityType, entityId);
  }

  @Get(':id')
  @Roles('owner')
  findOne(@Param('id') id: string, @CompanyContext() companyId: string) {
    return this.auditLogsService.findOne(id, companyId);
  }
}