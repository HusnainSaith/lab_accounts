import { Injectable, ConflictException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Company } from '../entities/company.entity';
import { CreateCompanyDto, UpdateCompanyDto } from '../dto';

@Injectable()
export class CompaniesService {
  constructor(
    @InjectRepository(Company)
    private companiesRepository: Repository<Company>,
  ) {}

  async create(createCompanyDto: CreateCompanyDto): Promise<Company> {
    // Validate company name uniqueness
    await this.validateCompanyNameUniqueness(createCompanyDto.name);
    
    // Validate TRN uniqueness if provided
    if (createCompanyDto.trn) {
      await this.validateTrnUniqueness(createCompanyDto.trn);
    }
    
    const company = this.companiesRepository.create(createCompanyDto);
    return this.companiesRepository.save(company);
  }

  async findAll(activeOnly: boolean = true): Promise<Company[]> {
    const where = activeOnly ? { isActive: true } : {};
    return this.companiesRepository.find({ 
      where
    });
  }

  async findOne(id: string): Promise<Company> {
    const company = await this.companiesRepository.findOne({ 
      where: { id }
    });
    
    if (!company) {
      throw new NotFoundException('Company not found');
    }
    
    return company;
  }

  async findByCountry(countryCode: string): Promise<Company[]> {
    return this.companiesRepository.find({
      where: { countryCode, isActive: true }
    });
  }

  async update(id: string, updateCompanyDto: UpdateCompanyDto): Promise<Company | null> {
    // Validate company name uniqueness if provided
    if (updateCompanyDto.name) {
      await this.validateCompanyNameUniqueness(updateCompanyDto.name, id);
    }
    
    // Validate TRN uniqueness if provided and different from current
    if (updateCompanyDto.trn) {
      await this.validateTrnUniqueness(updateCompanyDto.trn, id);
    }
    
    await this.companiesRepository.update(id, updateCompanyDto);
    return this.findOne(id);
  }

  async deactivate(id: string): Promise<Company | null> {
    await this.companiesRepository.update(id, { isActive: false });
    return this.findOne(id);
  }

  async activate(id: string): Promise<Company | null> {
    await this.companiesRepository.update(id, { isActive: true });
    return this.findOne(id);
  }

  async remove(id: string): Promise<void> {
    await this.companiesRepository.delete(id);
  }

  async getCompanyStats(id: string) {
    const company = await this.findOne(id);
    if (!company) return null;

    // Get user count
    const userCount = await this.companiesRepository
      .createQueryBuilder('company')
      .leftJoin('company.users', 'user')
      .where('company.id = :id', { id })
      .getCount();

    return {
      ...company,
      userCount
    };
  }

  async getStatistics(companyId?: string): Promise<any> {
    const whereCondition = companyId ? { id: companyId } : {};
    
    const [total, active, inactive] = await Promise.all([
      this.companiesRepository.count({ where: whereCondition }),
      this.companiesRepository.count({ where: { ...whereCondition, isActive: true } }),
      this.companiesRepository.count({ where: { ...whereCondition, isActive: false } })
    ]);

    // Get companies by country
    const byCountry = await this.companiesRepository
      .createQueryBuilder('company')
      .select('company.countryCode', 'country')
      .addSelect('COUNT(*)', 'count')
      .where(companyId ? 'company.id = :companyId' : '1=1', { companyId })
      .groupBy('company.countryCode')
      .getRawMany();

    const countryStats = byCountry.reduce((acc, item) => {
      acc[item.country] = parseInt(item.count);
      return acc;
    }, {});

    return {
      total,
      active,
      inactive,
      byCountry: countryStats
    };
  }

  private async validateTrnUniqueness(trn: string, excludeCompanyId?: string): Promise<void> {
    const query = this.companiesRepository.createQueryBuilder('company')
      .where('company.taxRegistrationNo = :trn', { trn });
    
    if (excludeCompanyId) {
      query.andWhere('company.id != :excludeCompanyId', { excludeCompanyId });
    }
    
    const existingCompany = await query.getOne();
    
    if (existingCompany) {
      throw new ConflictException('TRN number already exists for another company');
    }
  }

  private async validateCompanyNameUniqueness(name: string, excludeCompanyId?: string): Promise<void> {
    const query = this.companiesRepository.createQueryBuilder('company')
      .where('LOWER(company.name) = LOWER(:name)', { name });
    
    if (excludeCompanyId) {
      query.andWhere('company.id != :excludeCompanyId', { excludeCompanyId });
    }
    
    const existingCompany = await query.getOne();
    
    if (existingCompany) {
      throw new ConflictException('Company name already exists');
    }
  }
}