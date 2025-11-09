import { Controller, Get, Query, UseGuards, UseInterceptors } from '@nestjs/common';
import { ReportsService } from '../services/reports.service';
import { VatReportDto, ProfitLossReportDto, BalanceSheetReportDto, CashFlowReportDto } from '../dto/report.dto';
import { Roles } from '../../../common/decorators/roles.decorator';
import { RolesGuard } from '../../../common/guards/roles.guard';
import { CompanyGuard } from '../../../common/guards/company.guard';
import { RLSInterceptor } from '../../../common/interceptors/rls.interceptor';
import { CompanyContext } from '../../../common/decorators/company-context.decorator';

@Controller('reports')
@UseGuards(RolesGuard, CompanyGuard)
@UseInterceptors(RLSInterceptor)
export class ReportsController {
  constructor(private readonly reportsService: ReportsService) {}

  @Get('vat')
  @Roles('owner', 'accountant')
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
  @Roles('owner', 'accountant')
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
  @Roles('owner', 'accountant')
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
  @Roles('owner', 'accountant')
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
  @Roles('owner', 'accountant')
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