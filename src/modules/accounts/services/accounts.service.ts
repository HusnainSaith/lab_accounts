import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Account } from '../../companies/entities/account.entity';
import { CreateAccountDto, UpdateAccountDto } from '../dto';

@Injectable()
export class AccountsService {
  constructor(
    @InjectRepository(Account)
    private accountsRepository: Repository<Account>,
  ) { }

  create(createAccountDto: CreateAccountDto, companyId: string) {
    const account = this.accountsRepository.create({
      ...createAccountDto,
      companyId,
    });
    return this.accountsRepository.save(account);
  }

  findAll(companyId: string, type?: string) {
    const query = this.accountsRepository.createQueryBuilder('account')
      .where('account.companyId = :companyId', { companyId });

    if (type) {
      query.andWhere('account.type = :type', { type });
    }

    return query.getMany();
  }

  getChartOfAccounts(companyId: string) {
    return this.accountsRepository.find({
      where: { companyId },
      order: { code: 'ASC' },
    });
  }

  getPostingAccounts(companyId: string) {
    return this.accountsRepository.find({
      where: { companyId, isPosting: true },
      order: { code: 'ASC' },
    });
  }

  async findOne(id: string, companyId: string) {
    const account = await this.accountsRepository.findOne({
      where: { id, companyId },
    });

    if (account) {
      const balance = await this.accountsRepository.manager
        .createQueryBuilder('journal_entry_lines', 'line')
        .leftJoin('line.journalEntry', 'je')
        .where('line.accountId = :id', { id })
        .andWhere('je.posted = :posted', { posted: true })
        .select('SUM(line.debit)', 'debit')
        .addSelect('SUM(line.credit)', 'credit')
        .getRawOne();

      const debit = Number(balance?.debit || 0);
      const credit = Number(balance?.credit || 0);

      let currentBalance = Number(account.openingBalance || 0);

      // Asset and Expense: Debit increases, Credit decreases
      if (account.type === 'asset' || account.type === 'expense') {
        currentBalance += (debit - credit);
      }
      // Liability, Equity, Income: Credit increases, Debit decreases
      else {
        currentBalance += (credit - debit);
      }

      (account as any).currentBalance = currentBalance;
    }
    return account;
  }

  async update(id: string, updateAccountDto: UpdateAccountDto, companyId: string): Promise<Account> {
    await this.accountsRepository.update({ id, companyId }, updateAccountDto);
    const account = await this.findOne(id, companyId);
    if (!account) {
      throw new NotFoundException('Account not found');
    }
    return account;
  }

  remove(id: string, companyId: string) {
    return this.accountsRepository.softDelete({ id, companyId });
  }
}