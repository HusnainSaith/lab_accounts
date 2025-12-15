import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JournalEntry } from '../companies/entities/journal-entry.entity';
import { JournalEntryLine } from '../companies/entities/journal-entry-line.entity';
import { User } from '../users/entities/user.entity';
import { Role } from '../roles/entities/role.entity';
import { JournalEntriesController } from './controllers/journal-entries.controller';
import { JournalEntriesService } from './services/journal-entries.service';

@Module({
  imports: [TypeOrmModule.forFeature([JournalEntry, JournalEntryLine, User, Role])],
  controllers: [JournalEntriesController],
  providers: [JournalEntriesService],
  exports: [TypeOrmModule, JournalEntriesService],
})
export class JournalEntriesModule {}