import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Integration, IntegrationStatus } from '../entities/integration.entity';
import { CreateIntegrationDto } from '../dto/create-integration.dto';
import { UpdateIntegrationDto } from '../dto/update-integration.dto';

@Injectable()
export class IntegrationsService {
    constructor(
        @InjectRepository(Integration)
        private integrationsRepository: Repository<Integration>,
    ) { }

    async create(createDto: CreateIntegrationDto, companyId: string): Promise<Integration> {
        const integration = this.integrationsRepository.create({
            ...createDto,
            companyId,
        });
        return await this.integrationsRepository.save(integration);
    }

    async findAll(): Promise<Integration[]> {
        return await this.integrationsRepository.find();
    }

    async findOne(id: string): Promise<Integration> {
        const integration = await this.integrationsRepository.findOne({ where: { id } });
        if (!integration) {
            throw new NotFoundException(`Integration with ID "${id}" not found`);
        }
        return integration;
    }

    async update(id: string, updateDto: UpdateIntegrationDto): Promise<Integration> {
        await this.findOne(id);
        await this.integrationsRepository.update(id, updateDto);
        return this.findOne(id);
    }

    async activate(id: string): Promise<Integration> {
        const integration = await this.findOne(id);
        integration.status = IntegrationStatus.ACTIVE;
        return await this.integrationsRepository.save(integration);
    }

    async deactivate(id: string): Promise<Integration> {
        const integration = await this.findOne(id);
        integration.status = IntegrationStatus.INACTIVE;
        return await this.integrationsRepository.save(integration);
    }

    async testConnection(id: string): Promise<{ success: boolean; message: string }> {
        await this.findOne(id);
        // Placeholder for actual connection testing logic
        return { success: true, message: 'Connection tested successfully' };
    }

    async remove(id: string): Promise<void> {
        const integration = await this.findOne(id);
        await this.integrationsRepository.remove(integration);
    }
}
