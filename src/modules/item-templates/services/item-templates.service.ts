import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Like } from 'typeorm';
import { ItemTemplate } from '../entities/item-template.entity';
import { CreateItemTemplateDto, UpdateItemTemplateDto } from '../dto';

@Injectable()
export class ItemTemplatesService {
  constructor(
    @InjectRepository(ItemTemplate)
    private itemTemplatesRepository: Repository<ItemTemplate>,
  ) {}

  async create(createItemTemplateDto: CreateItemTemplateDto): Promise<ItemTemplate> {
    const itemTemplate = this.itemTemplatesRepository.create(createItemTemplateDto);
    return this.itemTemplatesRepository.save(itemTemplate);
  }

  async findAll(search?: string): Promise<ItemTemplate[]> {
    const where: any = {};
    
    if (search) {
      where.nameEn = Like(`%${search}%`);
    }

    return this.itemTemplatesRepository.find({
      where,
      order: { usageCount: 'DESC' }
    });
  }

  async findByIndustry(industry: string): Promise<ItemTemplate[]> {
    return this.itemTemplatesRepository.find({
      where: [
        { industryEn: Like(`%${industry}%`) },
        { industryAr: Like(`%${industry}%`) }
      ],
      order: { usageCount: 'DESC' }
    });
  }

  async findOne(id: string): Promise<ItemTemplate> {
    const template = await this.itemTemplatesRepository.findOne({ where: { id } });
    
    if (!template) {
      throw new NotFoundException('Item template not found');
    }
    
    return template;
  }

  async update(id: string, updateItemTemplateDto: UpdateItemTemplateDto): Promise<ItemTemplate> {
    const result = await this.itemTemplatesRepository.update(id, updateItemTemplateDto);
    
    if (result.affected === 0) {
      throw new NotFoundException('Item template not found');
    }
    
    return this.findOne(id);
  }

  async incrementUsage(id: string): Promise<void> {
    const result = await this.itemTemplatesRepository.increment({ id }, 'usageCount', 1);
    
    if (result.affected === 0) {
      throw new NotFoundException('Item template not found');
    }
  }

  async getStatistics(): Promise<any> {
    const [total, mostUsed] = await Promise.all([
      this.itemTemplatesRepository.count(),
      this.itemTemplatesRepository.findOne({
        order: { usageCount: 'DESC' }
      })
    ]);

    return { total, mostUsed };
  }

  async remove(id: string): Promise<void> {
    const result = await this.itemTemplatesRepository.delete(id);
    
    if (result.affected === 0) {
      throw new NotFoundException('Item template not found');
    }
  }
}