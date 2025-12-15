import { PartialType } from '@nestjs/mapped-types';
import { CreateVoucherTypeDto } from './create-voucher-type.dto';

export class UpdateVoucherTypeDto extends PartialType(CreateVoucherTypeDto) {}