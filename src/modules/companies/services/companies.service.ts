import { Injectable, ConflictException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Company } from '../entities/company.entity';
import { CompanyUser } from '../entities/company-user.entity';
import { UserRole } from '../../users/entities/user-role.entity';
import { Role } from '../../roles/entities/role.entity';
import { CreateCompanyDto, UpdateCompanyDto } from '../dto';

@Injectable()
export class CompaniesService {
  constructor(
    @InjectRepository(Company)
    private companiesRepository: Repository<Company>,
    @InjectRepository(CompanyUser)
    private companyUsersRepository: Repository<CompanyUser>,
    @InjectRepository(UserRole)
    private userRolesRepository: Repository<UserRole>,
    @InjectRepository(Role)
    private rolesRepository: Repository<Role>,
  ) {}

  async create(createCompanyDto: CreateCompanyDto & { userId?: string }): Promise<Company> {
    // Validate company name uniqueness
    await this.validateCompanyNameUniqueness(createCompanyDto.name);
    
    // Validate TRN uniqueness if provided
    if (createCompanyDto.trn) {
      await this.validateTrnUniqueness(createCompanyDto.trn);
    }
    
    return await this.companiesRepository.manager.transaction(async manager => {
      // Create company
      const company = manager.create(Company, createCompanyDto);
      const savedCompany = await manager.save(company);
      
      // Associate user with company and assign OWNER role if userId provided
      if (createCompanyDto.userId) {
        // Create company-user association
        const companyUser = manager.create(CompanyUser, {
          companyId: savedCompany.id,
          userId: createCompanyDto.userId,
          isActive: true,
        });
        await manager.save(companyUser);
        
        // Find OWNER role using query builder
        const ownerRole = await manager.createQueryBuilder(Role, 'role')
          .where('role.code = :code', { code: 'OWNER' })
          .andWhere('role.companyId IS NULL')
          .getOne();
        
        if (ownerRole) {
          // Assign OWNER role to user
          const userRole = manager.create(UserRole, {
            companyId: savedCompany.id,
            userId: createCompanyDto.userId,
            roleId: ownerRole.id,
          });
          await manager.save(userRole);
        }
      }
      
      return savedCompany;
    });
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