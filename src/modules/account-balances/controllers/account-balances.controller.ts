import { Controller, Get, Param, UseGuards, Query } from '@nestjs/common';
import { AccountBalancesService } from '../services/account-balances.service';
import { RequirePermissions } from '../../../common/decorators/permissions.decorator';
import { PermissionsGuard } from '../../../common/guards/permissions.guard';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { CompanyContext } from '../../../common/decorators/company-context.decorator';

@Controller('account-balances')
@UseGuards(JwtAuthGuard, PermissionsGuard)
export class AccountBalancesController {
  constructor(private readonly accountBalancesService: AccountBalancesService) {}

  @Get()
  @RequirePermissions('account-balances.read')
  findAll(@CompanyContext() companyId: string, @Query('period') period?: string) {
    return this.accountBalancesService.findAll(companyId, period);
  }

  @Get('trial-balance')
  @RequirePermissions('account-balances.read')
  getTrialBalance(@CompanyContext() companyId: string, @Query('period') period?: string) {
    return this.accountBalancesService.getTrialBalance(companyId, period);
  }

  @Get('account/:accountId')
  @RequirePermissions('account-balances.read')
  getAccountBalance(@Param('accountId') accountId: string, @CompanyContext() companyId: string, @Query('period') period?: string) {
    return this.accountBalancesService.getAccountBalance(accountId, companyId, period);
  }
}