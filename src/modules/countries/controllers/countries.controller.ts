import { Controller, Get, Param, Query } from '@nestjs/common';
import { CountriesService } from '../services/countries.service';

@Controller('countries')
export class CountriesController {
  constructor(private readonly countriesService: CountriesService) {}

  @Get()
  async findAll(@Query('search') search?: string) {
    return this.countriesService.findAll(search);
  }

  @Get('supported')
  async findSupportedCountries() {
    return this.countriesService.findSupportedCountries();
  }

  @Get(':code')
  async findByCode(@Param('code') code: string) {
    return this.countriesService.findByCode(code);
  }
}
