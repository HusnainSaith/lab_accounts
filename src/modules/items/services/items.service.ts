import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Like } from 'typeorm';
import { Item } from '../entities/item.entity';
import { CreateItemDto, UpdateItemDto } from '../dto';

@Injectable()
export class ItemsService {
  constructor(
    @InjectRepository(Item)
    private itemsRepository: Repository<Item>,
  ) {}

  async create(createItemDto: CreateItemDto, companyId: string): Promise<Item> {
    const item = this.itemsRepository.create({ ...createItemDto, companyId });
    return this.itemsRepository.save(item);
  }

  async findAll(companyId: string, search?: string): Promise<Item[]> {
    const where: any = { companyId, isActive: true };
    
    if (search) {
      where.name = Like(`%${search}%`);
    }

    return this.itemsRepository.find({ 
      where,
      order: { name: 'ASC' }
    });
  }

  async findOne(id: string, companyId: string): Promise<Item> {
    const item = await this.itemsRepository.findOne({ 
      where: { id, companyId } 
    });
    
    if (!item) {
      throw new NotFoundException('Item not found');
    }
    
    return item;
  }

  async update(id: string, updateItemDto: UpdateItemDto, companyId: string): Promise<Item> {
    await this.itemsRepository.update({ id, companyId }, updateItemDto);
    return this.findOne(id, companyId);
  }

  async remove(id: string, companyId: string): Promise<void> {
    const result = await this.itemsRepository.update(
      { id, companyId }, 
      { isActive: false }
    );
    
    if (result.affected === 0) {
      throw new NotFoundException('Item not found');
    }
  }

  async getStatistics(companyId: string): Promise<any> {
    const [total, active] = await Promise.all([
      this.itemsRepository.count({ where: { companyId } }),
      this.itemsRepository.count({ where: { companyId, isActive: true } })
    ]);

    return { total, active, inactive: total - active };
  }

  async getAISuggestions(companyId: string, query: string): Promise<Item[]> {
    return this.itemsRepository.find({
      where: { 
        companyId, 
        aiSuggested: true,
        isActive: true,
        name: Like(`%${query}%`)
      },
      take: 10
    });
  }
}