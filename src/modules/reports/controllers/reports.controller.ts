import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { ReportsService } from '../services/reports.service';
import { VatReportDto, ProfitLossReportDto, BalanceSheetReportDto, CashFlowReportDto } from '../dto/report.dto';
import { RequirePermissions } from '../../../common/decorators/permissions.decorator';
import { PermissionsGuard } from '../../../common/guards/permissions.guard';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { CompanyContext } from '../../../common/decorators/company-context.decorator';

@Controller('reports')
@UseGuards(JwtAuthGuard, PermissionsGuard)
export class ReportsController {
  constructor(private readonly reportsService: ReportsService) {}

  @Get('vat')
  @RequirePermissions('reports.view')
  generateVatReport(
    @Query('startDate') startDate: string,
    @Query('endDate') endDate: string,
    @CompanyContext() companyId: string
  ) {
    return this.reportsService.generateVatReport({
      companyId,
      startDate: new Date(startDate),
      endDate: new Date(endDate)
    });
  }

  @Get('profit-loss')
  @RequirePermissions('reports.view')
  generateProfitLossReport(
    @Query('startDate') startDate: string,
    @Query('endDate') endDate: string,
    @CompanyContext() companyId: string
  ) {
    return this.reportsService.generateProfitLossReport({
      companyId,
      startDate: new Date(startDate),
      endDate: new Date(endDate)
    });
  }

  @Get('balance-sheet')
  @RequirePermissions('reports.view')
  generateBalanceSheet(
    @Query('asOfDate') asOfDate: string,
    @CompanyContext() companyId: string
  ) {
    return this.reportsService.generateBalanceSheet({
      companyId,
      asOfDate: new Date(asOfDate)
    });
  }

  @Get('cash-flow')
  @RequirePermissions('reports.view')
  generateCashFlowReport(
    @Query('startDate') startDate: string,
    @Query('endDate') endDate: string,
    @CompanyContext() companyId: string
  ) {
    return this.reportsService.generateCashFlowReport({
      companyId,
      startDate: new Date(startDate),
      endDate: new Date(endDate)
    });
  }

  @Get('customers')
  @RequirePermissions('reports.view')
  generateCustomerReport(
    @Query('startDate') startDate: string,
    @Query('endDate') endDate: string,
    @CompanyContext() companyId: string
  ) {
    return this.reportsService.generateCustomerReport(
      companyId,
      new Date(startDate),
      new Date(endDate)
    );
  }
}