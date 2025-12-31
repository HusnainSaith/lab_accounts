import { Controller, Get, Patch, Post, Body, UseGuards } from '@nestjs/common';
import { BillingService } from '../services/billing.service';
import { UpdateSubscriptionDto } from '../dto';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { CompanyContext } from '../../../common/decorators/company-context.decorator';
import { PermissionsGuard } from '../../../common/guards/permissions.guard';
import { RequirePermissions } from '../../../common/decorators/permissions.decorator';

@Controller('billing')
@UseGuards(JwtAuthGuard, PermissionsGuard)
export class BillingController {
    constructor(private readonly billingService: BillingService) { }

    @Get('subscription')
    @RequirePermissions('billing.view')
    getSubscription(@CompanyContext() companyId: string) {
        return this.billingService.getSubscription(companyId);
    }

    @Patch('subscription')
    @RequirePermissions('billing.edit')
    updateSubscription(@CompanyContext() companyId: string, @Body() updateDto: UpdateSubscriptionDto) {
        return this.billingService.updateSubscription(companyId, updateDto);
    }

    @Post('subscription/cancel')
    @RequirePermissions('billing.edit')
    cancelSubscription(@CompanyContext() companyId: string) {
        return this.billingService.cancelSubscription(companyId);
    }

    @Get('transactions')
    @RequirePermissions('billing.view')
    getTransactions(@CompanyContext() companyId: string) {
        return this.billingService.getTransactions(companyId);
    }
}
