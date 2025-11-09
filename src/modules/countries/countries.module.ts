import { Module } from '@nestjs/common';
import { CountriesService } from './services/countries.service';
import { CountriesController } from './controllers/countries.controller';

@Module({
  controllers: [CountriesController],
  providers: [CountriesService],
  exports: [CountriesService],
})
export class CountriesModule {}