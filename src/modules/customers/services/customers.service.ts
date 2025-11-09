import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Like } from 'typeorm';
import { Customer, CustomerType } from '../entities/customer.entity';
import { CreateCustomerDto, UpdateCustomerDto } from '../dto';

@Injectable()
export class CustomersService {
  constructor(
    @InjectRepository(Customer)
    private customersRepository: Repository<Customer>,
  ) {}

  async create(createCustomerDto: CreateCustomerDto & { companyId: string }): Promise<Customer> {
    const customer = this.customersRepository.create(createCustomerDto);
    return this.customersRepository.save(customer);
  }

  async findAll(companyId: string, customerType?: CustomerType, search?: string): Promise<Customer[]> {
    const where: any = { companyId };
    
    if (customerType) {
      where.customerType = customerType;
    }
    
    if (search) {
      where.nameEn = Like(`%${search}%`);
    }
    
    return this.customersRepository.find({ 
      where,
      order: { createdAt: 'DESC' }
    });
  }

  async findOne(id: string, companyId?: string): Promise<Customer> {
    const where: any = { id };
    if (companyId) {
      where.companyId = companyId;
    }
    
    const customer = await this.customersRepository.findOne({ where });
    
    if (!customer) {
      throw new NotFoundException('Customer not found');
    }
    
    return customer;
  }

  async findByType(companyId: string, customerType: CustomerType): Promise<Customer[]> {
    return this.customersRepository.find({
      where: { companyId, customerType },
      order: { createdAt: 'DESC' }
    });
  }

  async findVatRegistered(companyId: string): Promise<Customer[]> {
    return this.customersRepository.find({
      where: { companyId, isVatRegistered: true },
      order: { createdAt: 'DESC' }
    });
  }

  async update(id: string, updateCustomerDto: UpdateCustomerDto, companyId?: string): Promise<Customer> {
    const where: any = { id };
    if (companyId) {
      where.companyId = companyId;
    }
    
    const result = await this.customersRepository.update(where, updateCustomerDto);
    
    if (result.affected === 0) {
      throw new NotFoundException('Customer not found');
    }
    
    return this.findOne(id, companyId);
  }

  async remove(id: string, companyId?: string): Promise<void> {
    const where: any = { id };
    if (companyId) {
      where.companyId = companyId;
    }
    
    const result = await this.customersRepository.delete(where);
    
    if (result.affected === 0) {
      throw new NotFoundException('Customer not found');
    }
  }

  async getStatistics(companyId: string): Promise<any> {
    const [total, business, individual, vatRegistered] = await Promise.all([
      this.customersRepository.count({ where: { companyId } }),
      this.customersRepository.count({ where: { companyId, customerType: CustomerType.BUSINESS } }),
      this.customersRepository.count({ where: { companyId, customerType: CustomerType.INDIVIDUAL } }),
      this.customersRepository.count({ where: { companyId, isVatRegistered: true } })
    ]);

    return {
      total,
      active: total,
      inactive: 0,
      business,
      individual,
      byType: {
        business,
        individual
      }
    };
  }

  async getCustomerStats(companyId: string) {
    return this.getStatistics(companyId);
  }
}