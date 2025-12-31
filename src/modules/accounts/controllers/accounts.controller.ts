import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Query } from '@nestjs/common';
import { AccountsService } from '../services/accounts.service';
import { CreateAccountDto, UpdateAccountDto } from '../dto';
import { RequirePermissions } from '../../../common/decorators/permissions.decorator';
import { PermissionsGuard } from '../../../common/guards/permissions.guard';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { CompanyContext } from '../../../common/decorators/company-context.decorator';

@Controller('accounts')
@UseGuards(JwtAuthGuard, PermissionsGuard)
export class AccountsController {
  constructor(private readonly accountsService: AccountsService) { }

  @Post()
  @RequirePermissions('accounts.create')
  create(@Body() createAccountDto: CreateAccountDto, @CompanyContext() companyId: string) {
    return this.accountsService.create(createAccountDto, companyId);
  }

  @Get()
  @RequirePermissions('accounts.read')
  findAll(@CompanyContext() companyId: string, @Query('type') type?: string) {
    return this.accountsService.findAll(companyId, type);
  }

  @Get('chart')
  @RequirePermissions('accounts.read')
  getChartOfAccounts(@CompanyContext() companyId: string) {
    return this.accountsService.getChartOfAccounts(companyId);
  }

  @Get('posting')
  @RequirePermissions('accounts.read')
  getPostingAccounts(@CompanyContext() companyId: string) {
    return this.accountsService.getPostingAccounts(companyId);
  }

  @Get(':id')
  @RequirePermissions('accounts.read')
  findOne(@Param('id') id: string, @CompanyContext() companyId: string) {
    return this.accountsService.findOne(id, companyId);
  }

  @Patch(':id')
  @RequirePermissions('accounts.update')
  update(@Param('id') id: string, @Body() updateAccountDto: UpdateAccountDto, @CompanyContext() companyId: string) {
    return this.accountsService.update(id, updateAccountDto, companyId);
  }

  @Delete(':id')
  @RequirePermissions('accounts.delete')
  remove(@Param('id') id: string, @CompanyContext() companyId: string) {
    return this.accountsService.remove(id, companyId);
  }
}