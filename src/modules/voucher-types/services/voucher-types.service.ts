import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { VoucherType } from '../../companies/entities/voucher-type.entity';
import { CreateVoucherTypeDto, UpdateVoucherTypeDto } from '../dto';

@Injectable()
export class VoucherTypesService {
  constructor(
    @InjectRepository(VoucherType)
    private voucherTypesRepository: Repository<VoucherType>,
  ) {}

  create(createVoucherTypeDto: CreateVoucherTypeDto, companyId: string) {
    const voucherType = this.voucherTypesRepository.create({
      ...createVoucherTypeDto,
      companyId,
    });
    return this.voucherTypesRepository.save(voucherType);
  }

  findAll(companyId: string) {
    return this.voucherTypesRepository.find({
      where: { companyId, isActive: true },
    });
  }

  findOne(id: string, companyId: string) {
    return this.voucherTypesRepository.findOne({
      where: { id, companyId },
    });
  }

  update(id: string, updateVoucherTypeDto: UpdateVoucherTypeDto, companyId: string) {
    return this.voucherTypesRepository.update({ id, companyId }, updateVoucherTypeDto);
  }

  remove(id: string, companyId: string) {
    return this.voucherTypesRepository.update({ id, companyId }, { isActive: false });
  }
}