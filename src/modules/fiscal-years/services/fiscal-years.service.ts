import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { FiscalYear } from '../../companies/entities/fiscal-year.entity';
import { CreateFiscalYearDto, UpdateFiscalYearDto } from '../dto';

@Injectable()
export class FiscalYearsService {
  constructor(
    @InjectRepository(FiscalYear)
    private fiscalYearsRepository: Repository<FiscalYear>,
  ) {}

  create(createFiscalYearDto: CreateFiscalYearDto, companyId: string) {
    const fiscalYear = this.fiscalYearsRepository.create({
      ...createFiscalYearDto,
      companyId,
    });
    return this.fiscalYearsRepository.save(fiscalYear);
  }

  findAll(companyId: string) {
    return this.fiscalYearsRepository.find({
      where: { companyId },
      order: { startDate: 'DESC' },
    });
  }

  getCurrentFiscalYear(companyId: string) {
    const currentDate = new Date();
    return this.fiscalYearsRepository
      .createQueryBuilder('fy')
      .where('fy.companyId = :companyId', { companyId })
      .andWhere('fy.startDate <= :currentDate', { currentDate })
      .andWhere('fy.endDate >= :currentDate', { currentDate })
      .getOne();
  }

  findOne(id: string, companyId: string) {
    return this.fiscalYearsRepository.findOne({
      where: { id, companyId },
    });
  }

  async update(id: string, updateFiscalYearDto: UpdateFiscalYearDto, companyId: string): Promise<FiscalYear> {
    await this.fiscalYearsRepository.update({ id, companyId }, updateFiscalYearDto);
    const fiscalYear = await this.findOne(id, companyId);
    if (!fiscalYear) {
      throw new NotFoundException('Fiscal year not found');
    }
    return fiscalYear;
  }

  closeFiscalYear(id: string, companyId: string) {
    return this.fiscalYearsRepository.update(
      { id, companyId },
      { isClosed: true, closedAt: new Date() }
    );
  }

  remove(id: string, companyId: string) {
    return this.fiscalYearsRepository.delete({ id, companyId });
  }
}