import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { JournalEntry } from '../../companies/entities/journal-entry.entity';
import { CreateJournalEntryDto, UpdateJournalEntryDto } from '../dto';

@Injectable()
export class JournalEntriesService {
  constructor(
    @InjectRepository(JournalEntry)
    private journalEntriesRepository: Repository<JournalEntry>,
  ) {}

  create(createJournalEntryDto: CreateJournalEntryDto, companyId: string) {
    const journalEntry = this.journalEntriesRepository.create({
      ...createJournalEntryDto,
      companyId,
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

  update(id: string, updateJournalEntryDto: UpdateJournalEntryDto, companyId: string) {
    return this.journalEntriesRepository.update({ id, companyId }, updateJournalEntryDto);
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