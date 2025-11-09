import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between } from 'typeorm';
import { AuditLog } from '../entities/audit-log.entity';
import { CreateAuditLogDto } from '../dto';

@Injectable()
export class AuditLogsService {
  constructor(
    @InjectRepository(AuditLog)
    private auditLogsRepository: Repository<AuditLog>,
  ) {}

  async create(createAuditLogDto: CreateAuditLogDto): Promise<AuditLog> {
    const auditLog = this.auditLogsRepository.create(createAuditLogDto);
    return this.auditLogsRepository.save(auditLog);
  }

  async findAll(companyId: string, action?: string, entityType?: string, limit = 100): Promise<AuditLog[]> {
    const where: any = { companyId };
    
    if (action) {
      where.action = action;
    }
    
    if (entityType) {
      where.entityType = entityType;
    }

    return this.auditLogsRepository.find({
      where,
      relations: ['user', 'company'],
      order: { createdAt: 'DESC' },
      take: limit
    });
  }

  async findByEntity(entityType: string, entityId: string): Promise<AuditLog[]> {
    return this.auditLogsRepository.find({
      where: { entityType, entityId },
      relations: ['user'],
      order: { createdAt: 'DESC' }
    });
  }

  async findOne(id: string, companyId: string): Promise<AuditLog> {
    const log = await this.auditLogsRepository.findOne({
      where: { id, companyId },
      relations: ['user', 'company']
    });
    
    if (!log) {
      throw new NotFoundException('Audit log not found');
    }
    
    return log;
  }

  async findByDateRange(companyId: string, startDate: Date, endDate: Date): Promise<AuditLog[]> {
    return this.auditLogsRepository.find({
      where: {
        companyId,
        createdAt: Between(startDate, endDate)
      },
      relations: ['user'],
      order: { createdAt: 'DESC' }
    });
  }

  async findByUser(companyId: string, userId: string): Promise<AuditLog[]> {
    return this.auditLogsRepository.find({
      where: { companyId, userId },
      relations: ['user'],
      order: { createdAt: 'DESC' },
      take: 50
    });
  }

  async getStatistics(companyId: string): Promise<any> {
    const [total, today] = await Promise.all([
      this.auditLogsRepository.count({ where: { companyId } }),
      this.auditLogsRepository.count({
        where: {
          companyId,
          createdAt: Between(
            new Date(new Date().setHours(0, 0, 0, 0)),
            new Date(new Date().setHours(23, 59, 59, 999))
          )
        }
      })
    ]);

    return { total, today };
  }

  // Audit logs are typically read-only, no update/delete operations
}