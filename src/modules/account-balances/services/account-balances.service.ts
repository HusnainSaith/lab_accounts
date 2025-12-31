import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AccountBalance } from '../../companies/entities/account-balance.entity';

@Injectable()
export class AccountBalancesService {
  constructor(
    @InjectRepository(AccountBalance)
    private accountBalancesRepository: Repository<AccountBalance>,
  ) { }

  findAll(companyId: string, period?: string) {
    const query = this.accountBalancesRepository.createQueryBuilder('ab')
      .where('ab.companyId = :companyId', { companyId });

    if (period) {
      query.andWhere('ab.period = :period', { period });
    }

    return query.getMany();
  }

  async getTrialBalance(companyId: string, period?: string) {
    // Dynamic Calculation from Journal Entries
    // Select account, sum(debit), sum(credit)
    // Group by account

    const query = this.accountBalancesRepository.manager
      .createQueryBuilder()
      .select('line.accountId', 'accountId')
      .addSelect('account.name', 'accountName')
      .addSelect('account.code', 'accountCode')
      .addSelect('SUM(line.debit)', 'totalDebit')
      .addSelect('SUM(line.credit)', 'totalCredit')
      .from('journal_entry_lines', 'line')
      .innerJoin('line.account', 'account')
      .innerJoin('line.journalEntry', 'je')
      .where('je.companyId = :companyId', { companyId })
      .andWhere('je.status = :status', { status: 'posted' }) // Only posted entries
      .groupBy('line.accountId')
      .addGroupBy('account.name')
      .addGroupBy('account.code');

    if (period) {
      // Assuming period is YYYY format or similar.
      // If period filtering needed, parse dates.
      // For now ignoring period to show full TB.
      // query.andWhere(...)
    }

    const results = await query.getRawMany();

    // Transform to expected format
    return results.map(r => ({
      accountId: r.accountId,
      accountName: r.accountName,
      accountCode: r.accountCode,
      debit: parseFloat(r.totalDebit || '0'),
      credit: parseFloat(r.totalCredit || '0'),
      balance: parseFloat(r.totalDebit || '0') - parseFloat(r.totalCredit || '0')
    }));
  }

  getAccountBalance(accountId: string, companyId: string, period?: string) {
    const query = this.accountBalancesRepository.createQueryBuilder('ab')
      .where('ab.companyId = :companyId', { companyId })
      .andWhere('ab.accountId = :accountId', { accountId });

    if (period) {
      query.andWhere('ab.period = :period', { period });
    }

    return query.getOne();
  }
}