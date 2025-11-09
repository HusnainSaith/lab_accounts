import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ItemTemplatesService } from './services/item-templates.service';
import { ItemTemplatesController } from './controllers/item-templates.controller';
import { ItemTemplate } from './entities/item-template.entity';

@Module({
  imports: [TypeOrmModule.forFeature([ItemTemplate])],
  controllers: [ItemTemplatesController],
  providers: [ItemTemplatesService],
  exports: [ItemTemplatesService],
})
export class ItemTemplatesModule {}