import { Injectable, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { JournalEntry } from '../../companies/entities/journal-entry.entity';
import { CreateJournalEntryDto, UpdateJournalEntryDto } from '../dto';

@Injectable()
export class JournalEntriesService {
  constructor(
    @InjectRepository(JournalEntry)
    private journalEntriesRepository: Repository<JournalEntry>,
  ) { }

  async create(createJournalEntryDto: CreateJournalEntryDto, companyId: string, userId: string) {
    const { lines, ...journalEntryData } = createJournalEntryDto;

    // Get current fiscal year
    const currentFiscalYear = await this.journalEntriesRepository.manager
      .createQueryBuilder()
      .select('id')
      .from('fiscal_years', 'fy')
      .where('fy.company_id = :companyId', { companyId })
      .andWhere('fy.start_date <= CURRENT_DATE')
      .andWhere('fy.end_date >= CURRENT_DATE')
      .getRawOne();

    if (!currentFiscalYear) {
      throw new BadRequestException('No active fiscal year found');
    }

    const journalEntry = this.journalEntriesRepository.create({
      ...journalEntryData,
      companyId,
      fiscalYearId: currentFiscalYear.id,
      createdBy: userId,
      lines: lines.map((line, index) => ({
        ...line,
        lineNo: index + 1,
      })),
    });

    return this.journalEntriesRepository.save(journalEntry);
  }

  findAll(companyId: string, status?: string) {
    const query = this.journalEntriesRepository.createQueryBuilder('je')
      .where('je.companyId = :companyId', { companyId });

    if (status) {
      query.andWhere('je.status = :status', { status });
    }

    return query.orderBy('je.entryDate', 'DESC').getMany();
  }

  generateVoucherNumber(companyId: string, voucherTypeId: string) {
    // Basic implementation - should be enhanced with proper sequence logic
    return { voucherNumber: `VN-${Date.now()}` };
  }

  findOne(id: string, companyId: string) {
    return this.journalEntriesRepository.findOne({
      where: { id, companyId },
      relations: ['lines'],
    });
  }

  async update(id: string, updateJournalEntryDto: UpdateJournalEntryDto, companyId: string): Promise<JournalEntry> {
    const journalEntry = await this.findOne(id, companyId);
    if (!journalEntry) {
      throw new BadRequestException('Journal entry not found');
    }

    if (journalEntry.posted) {
      throw new BadRequestException('Cannot update posted journal entry');
    }

    await this.journalEntriesRepository.update({ id, companyId }, updateJournalEntryDto);
    const updatedEntry = await this.findOne(id, companyId);
    if (!updatedEntry) throw new BadRequestException('Journal entry not found after update');
    return updatedEntry;
  }

  postEntry(id: string, companyId: string) {
    return this.journalEntriesRepository.update(
      { id, companyId },
      { posted: true, postedAt: new Date(), status: 'posted' as any }
    );
  }

  remove(id: string, companyId: string) {
    return this.journalEntriesRepository.delete({ id, companyId });
  }
}