import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Query, Request } from '@nestjs/common';
import { JournalEntriesService } from '../services/journal-entries.service';
import { CreateJournalEntryDto, UpdateJournalEntryDto } from '../dto';
import { RequirePermissions } from '../../../common/decorators/permissions.decorator';
import { PermissionsGuard } from '../../../common/guards/permissions.guard';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { CompanyContext } from '../../../common/decorators/company-context.decorator';

@Controller('journal-entries')
@UseGuards(JwtAuthGuard, PermissionsGuard)
export class JournalEntriesController {
  constructor(private readonly journalEntriesService: JournalEntriesService) {}

  @Post()
  @RequirePermissions('journal-entries.create')
  create(@Body() createJournalEntryDto: CreateJournalEntryDto, @CompanyContext() companyId: string, @Request() req: any) {
    return this.journalEntriesService.create(createJournalEntryDto, companyId, req.user.id);
  }

  @Get()
  @RequirePermissions('journal-entries.read')
  findAll(@CompanyContext() companyId: string, @Query('status') status?: string) {
    return this.journalEntriesService.findAll(companyId, status);
  }

  @Get('generate-voucher-number')
  @RequirePermissions('journal-entries.create')
  generateVoucherNumber(@CompanyContext() companyId: string, @Query('voucherTypeId') voucherTypeId: string) {
    return this.journalEntriesService.generateVoucherNumber(companyId, voucherTypeId);
  }

  @Get(':id')
  @RequirePermissions('journal-entries.read')
  findOne(@Param('id') id: string, @CompanyContext() companyId: string) {
    return this.journalEntriesService.findOne(id, companyId);
  }

  @Patch(':id')
  @RequirePermissions('journal-entries.update')
  update(@Param('id') id: string, @Body() updateJournalEntryDto: UpdateJournalEntryDto, @CompanyContext() companyId: string) {
    return this.journalEntriesService.update(id, updateJournalEntryDto, companyId);
  }

  @Patch(':id/post')
  @RequirePermissions('journal-entries.post')
  postEntry(@Param('id') id: string, @CompanyContext() companyId: string) {
    return this.journalEntriesService.postEntry(id, companyId);
  }

  @Delete(':id')
  @RequirePermissions('journal-entries.delete')
  remove(@Param('id') id: string, @CompanyContext() companyId: string) {
    return this.journalEntriesService.remove(id, companyId);
  }
}