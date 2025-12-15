import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { InvoiceLine } from '../../invoice-items/entities/invoice-line.entity';
import { CreateInvoiceLineDto, UpdateInvoiceLineDto } from '../dto';

@Injectable()
export class InvoiceLinesService {
  constructor(
    @InjectRepository(InvoiceLine)
    private invoiceLinesRepository: Repository<InvoiceLine>,
  ) {}

  create(createInvoiceLineDto: CreateInvoiceLineDto, companyId: string) {
    const invoiceLine = this.invoiceLinesRepository.create(createInvoiceLineDto);
    return this.invoiceLinesRepository.save(invoiceLine);
  }

  findByInvoice(invoiceId: string, companyId: string) {
    return this.invoiceLinesRepository.find({
      where: { invoiceId },
      order: { lineNo: 'ASC' },
    });
  }

  findOne(id: string, companyId: string) {
    return this.invoiceLinesRepository.findOne({
      where: { id },
    });
  }

  update(id: string, updateInvoiceLineDto: UpdateInvoiceLineDto, companyId: string) {
    return this.invoiceLinesRepository.update({ id }, updateInvoiceLineDto);
  }

  remove(id: string, companyId: string) {
    return this.invoiceLinesRepository.delete({ id });
  }
}