import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AccountBalance } from '../../companies/entities/account-balance.entity';

@Injectable()
export class AccountBalancesService {
  constructor(
    @InjectRepository(AccountBalance)
    private accountBalancesRepository: Repository<AccountBalance>,
  ) {}

  findAll(companyId: string, period?: string) {
    const query = this.accountBalancesRepository.createQueryBuilder('ab')
      .where('ab.companyId = :companyId', { companyId });
    
    if (period) {
      query.andWhere('ab.period = :period', { period });
    }
    
    return query.getMany();
  }

  getTrialBalance(companyId: string, period?: string) {
    const query = this.accountBalancesRepository.createQueryBuilder('ab')
      .leftJoinAndSelect('ab.account', 'account')
      .where('ab.companyId = :companyId', { companyId });
    
    if (period) {
      query.andWhere('ab.period = :period', { period });
    }
    
    return query.getMany();
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