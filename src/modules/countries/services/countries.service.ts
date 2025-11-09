import { Injectable } from '@nestjs/common';

@Injectable()
export class CountriesService {
  constructor() {}

  async findAll(search?: string) {
    // Static country data since no database table exists
    const countries = [
      { code: 'AE', name: 'United Arab Emirates', currencyCode: 'AED' },
      { code: 'SA', name: 'Saudi Arabia', currencyCode: 'SAR' },
      { code: 'US', name: 'United States', currencyCode: 'USD' }
    ];
    
    if (search) {
      return countries.filter(c => c.name.toLowerCase().includes(search.toLowerCase()));
    }
    
    return countries;
  }

  async findSupportedCountries() {
    return this.findAll();
  }

  async findByCode(code: string) {
    const countries = await this.findAll();
    return countries.find(c => c.code === code) || null;
  }
}
