import { IsString, IsUUID, IsOptional, IsIn, IsObject } from 'class-validator';
import { AuditAction } from '../entities/audit-log.entity';

export class CreateAuditLogDto {
  @IsOptional()
  @IsUUID()
  companyId?: string;

  @IsOptional()
  @IsUUID()
  userId?: string;

  @IsString()
  entityType: string;

  @IsUUID()
  entityId: string;

  @IsIn([AuditAction.CREATE, AuditAction.UPDATE, AuditAction.DELETE, AuditAction.SEND, AuditAction.PAY])
  action: AuditAction;

  @IsOptional()
  @IsObject()
  oldValues?: Record<string, unknown>;

  @IsObject()
  newValues: Record<string, unknown>;

  @IsOptional()
  @IsString()
  ipAddress?: string;

  @IsOptional()
  @IsString()
  userAgent?: string;
}