import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Account } from '../../companies/entities/account.entity';
import { CreateAccountDto, UpdateAccountDto } from '../dto';

@Injectable()
export class AccountsService {
  constructor(
    @InjectRepository(Account)
    private accountsRepository: Repository<Account>,
  ) {}

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

  findOne(id: string, companyId: string) {
    return this.accountsRepository.findOne({
      where: { id, companyId },
    });
  }

  update(id: string, updateAccountDto: UpdateAccountDto, companyId: string) {
    return this.accountsRepository.update({ id, companyId }, updateAccountDto);
  }

  remove(id: string, companyId: string) {
    return this.accountsRepository.softDelete({ id, companyId });
  }
}