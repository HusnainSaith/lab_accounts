import { Controller, Get, UseGuards, UseInterceptors } from '@nestjs/common';
import { DashboardService } from '../services/dashboard.service';
import { Roles } from '../../../common/decorators/roles.decorator';
import { RolesGuard } from '../../../common/guards/roles.guard';
import { CompanyGuard } from '../../../common/guards/company.guard';
import { RLSInterceptor } from '../../../common/interceptors/rls.interceptor';
import { CompanyContext } from '../../../common/decorators/company-context.decorator';

@Controller('dashboard')
@UseGuards(RolesGuard, CompanyGuard)
@UseInterceptors(RLSInterceptor)
export class DashboardController {
  constructor(private readonly dashboardService: DashboardService) {}

  @Get('stats')
  @Roles('owner', 'staff', 'accountant')
  getDashboardStats(@CompanyContext() companyId: string) {
    return this.dashboardService.getDashboardStats(companyId);
  }

  @Get('revenue-chart')
  @Roles('owner', 'accountant')
  getMonthlyRevenueChart(@CompanyContext() companyId: string) {
    return this.dashboardService.getMonthlyRevenueChart(companyId);
  }

  @Get('top-customers')
  @Roles('owner', 'staff', 'accountant')
  getTopCustomers(@CompanyContext() companyId: string) {
    return this.dashboardService.getTopCustomers(companyId);
  }

  @Get('overdue-invoices')
  @Roles('owner', 'staff', 'accountant')
  getOverdueInvoices(@CompanyContext() companyId: string) {
    return this.dashboardService.getOverdueInvoices(companyId);
  }

  @Get('recent-activity')
  @Roles('owner', 'staff', 'accountant')
  getRecentActivity(@CompanyContext() companyId: string) {
    return this.dashboardService.getRecentActivity(companyId);
  }

  @Get('vat-summary')
  @Roles('owner', 'accountant')
  getVatSummary(@CompanyContext() companyId: string) {
    return this.dashboardService.getVatSummary(companyId);
  }
}