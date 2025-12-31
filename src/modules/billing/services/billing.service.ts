import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Subscription, SubscriptionStatus, TenantPlan, BillingTransaction } from '../entities/subscription.entity';
import { UpdateSubscriptionDto } from '../dto/update-subscription.dto';

@Injectable()
export class BillingService {
    constructor(
        @InjectRepository(Subscription)
        private subscriptionRepository: Repository<Subscription>,
        @InjectRepository(BillingTransaction)
        private transactionRepository: Repository<BillingTransaction>,
    ) { }

    async getSubscription(companyId: string): Promise<Subscription> {
        let subscription = await this.subscriptionRepository.findOne({
            where: { companyId },
        });

        if (!subscription) {
            // Create a default FREE subscription if none exists
            subscription = this.subscriptionRepository.create({
                companyId,
                plan: TenantPlan.FREE,
                status: SubscriptionStatus.ACTIVE,
                startDate: new Date(),
                billingCycle: 'monthly',
            });
            subscription = await this.subscriptionRepository.save(subscription);
        }

        return subscription;
    }

    async updateSubscription(companyId: string, updateDto: UpdateSubscriptionDto): Promise<Subscription> {
        const subscription = await this.getSubscription(companyId);

        if (updateDto.plan) subscription.plan = updateDto.plan;
        if (updateDto.endDate) subscription.endDate = new Date(updateDto.endDate);
        if (updateDto.autoRenew !== undefined) subscription.autoRenew = updateDto.autoRenew;

        return await this.subscriptionRepository.save(subscription);
    }

    async cancelSubscription(companyId: string): Promise<Subscription> {
        const subscription = await this.getSubscription(companyId);
        subscription.status = SubscriptionStatus.CANCELLED;
        return await this.subscriptionRepository.save(subscription);
    }

    async getTransactions(companyId: string): Promise<BillingTransaction[]> {
        const subscription = await this.getSubscription(companyId);
        return await this.transactionRepository.find({
            where: { subscriptionId: subscription.id },
            order: { createdAt: 'DESC' },
        });
    }
}
