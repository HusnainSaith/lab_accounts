import { Controller, Get, Post, Body, Param, Delete, UseGuards } from '@nestjs/common';
import { PaymentsService } from '../services/payments.service';
import { CreatePaymentDto } from '../dto/create-payment.dto';
import { UpdatePaymentDto } from '../dto/update-payment.dto';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { CompanyContext } from '../../../common/decorators/company-context.decorator';
import { PermissionsGuard } from '../../../common/guards/permissions.guard';
import { RequirePermissions } from '../../../common/decorators/permissions.decorator';

@Controller('payments')
@UseGuards(JwtAuthGuard, PermissionsGuard)
export class PaymentsController {
    constructor(private readonly paymentsService: PaymentsService) { }

    @Post()
    @RequirePermissions('payments.create')
    create(@Body() createPaymentDto: CreatePaymentDto, @CompanyContext() companyId: string) {
        return this.paymentsService.create(createPaymentDto, companyId);
    }

    @Get()
    @RequirePermissions('payments.view')
    findAll() {
        return this.paymentsService.findAll();
    }

    @Get(':id')
    @RequirePermissions('payments.view')
    findOne(@Param('id') id: string) {
        return this.paymentsService.findOne(id);
    }

    @Post(':id')
    @RequirePermissions('payments.edit')
    update(@Param('id') id: string, @Body() updatePaymentDto: UpdatePaymentDto) {
        return this.paymentsService.update(id, updatePaymentDto);
    }

    @Post(':id/confirm')
    @RequirePermissions('payments.edit')
    confirm(@Param('id') id: string) {
        return this.paymentsService.confirm(id);
    }

    @Post(':id/cancel')
    @RequirePermissions('payments.edit')
    cancel(@Param('id') id: string) {
        return this.paymentsService.cancel(id);
    }

    @Delete(':id')
    @RequirePermissions('payments.delete')
    remove(@Param('id') id: string) {
        return this.paymentsService.remove(id);
    }
}
