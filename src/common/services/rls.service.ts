import { Injectable } from '@nestjs/common';
import { DataSource } from 'typeorm';

@Injectable()
export class RLSService {
  constructor(private dataSource: DataSource) {}

  async setCompanyContext(companyId: string): Promise<void> {
    await this.dataSource.query(`SET app.current_company_id = $1`, [companyId]);
  }

  async clearCompanyContext(): Promise<void> {
    await this.dataSource.query(`RESET app.current_company_id`);
  }

  async withCompanyContext<T>(
    companyId: string,
    callback: () => Promise<T>,
  ): Promise<T> {
    await this.setCompanyContext(companyId);
    try {
      return await callback();
    } finally {
      await this.clearCompanyContext();
    }
  }
}
