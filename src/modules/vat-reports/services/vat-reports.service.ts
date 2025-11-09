import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between } from 'typeorm';
import { VatReport, VatReportStatus } from '../entities/vat-report.entity';
import { CreateVatReportDto, UpdateVatReportDto } from '../dto';

@Injectable()
export class VatReportsService {
  constructor(
    @InjectRepository(VatReport)
    private vatReportsRepository: Repository<VatReport>,
  ) {}

  async create(createVatReportDto: CreateVatReportDto): Promise<VatReport> {
    const vatReport = this.vatReportsRepository.create({
      ...createVatReportDto,
      reportPeriodStart: new Date(createVatReportDto.reportPeriodStart),
      reportPeriodEnd: new Date(createVatReportDto.reportPeriodEnd),
    });
    return this.vatReportsRepository.save(vatReport);
  }

  async findAll(companyId: string, status?: string): Promise<VatReport[]> {
    const where: any = { companyId };
    
    if (status) {
      where.reportStatus = status;
    }

    return this.vatReportsRepository.find({
      where,
      order: { generatedAt: 'DESC' }
    });
  }

  async findOne(id: string, companyId: string): Promise<VatReport> {
    const report = await this.vatReportsRepository.findOne({
      where: { id, companyId },
      relations: ['company']
    });
    
    if (!report) {
      throw new NotFoundException('VAT report not found');
    }
    
    return report;
  }

  async update(id: string, updateVatReportDto: UpdateVatReportDto, companyId: string): Promise<VatReport> {
    const result = await this.vatReportsRepository.update({ id, companyId }, updateVatReportDto);
    
    if (result.affected === 0) {
      throw new NotFoundException('VAT report not found');
    }
    
    return this.findOne(id, companyId);
  }

  async submit(id: string, companyId: string): Promise<VatReport> {
    const result = await this.vatReportsRepository.update({ id, companyId }, {
      reportStatus: VatReportStatus.SUBMITTED,
      submittedAt: new Date()
    });
    
    if (result.affected === 0) {
      throw new NotFoundException('VAT report not found');
    }
    
    return this.findOne(id, companyId);
  }

  async getStatistics(companyId: string): Promise<any> {
    const [total, draft, submitted, approved] = await Promise.all([
      this.vatReportsRepository.count({ where: { companyId } }),
      this.vatReportsRepository.count({ where: { companyId, reportStatus: VatReportStatus.DRAFT } }),
      this.vatReportsRepository.count({ where: { companyId, reportStatus: VatReportStatus.SUBMITTED } }),
      this.vatReportsRepository.count({ where: { companyId, reportStatus: VatReportStatus.APPROVED } })
    ]);

    return { total, draft, submitted, approved };
  }

  async findByPeriod(companyId: string, startDate: Date, endDate: Date): Promise<VatReport[]> {
    return this.vatReportsRepository.find({
      where: {
        companyId,
        reportPeriodStart: Between(startDate, endDate)
      },
      order: { reportPeriodStart: 'DESC' }
    });
  }

  async remove(id: string, companyId: string): Promise<void> {
    const result = await this.vatReportsRepository.delete({ id, companyId });
    
    if (result.affected === 0) {
      throw new NotFoundException('VAT report not found');
    }
  }
}