import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { DataSource } from 'typeorm';

@Injectable()
export class RLSMiddleware implements NestMiddleware {
  constructor(private dataSource: DataSource) {}

  async use(req: Request, res: Response, next: NextFunction) {
    const user = req.user as any;
    
    if (user?.companyId) {
      try {
        // Set company context for RLS
        await this.dataSource.query(
          `SELECT set_config('app.company_id', $1, true)`,
          [user.companyId]
        );
      } catch (error) {
        console.error('Failed to set RLS context:', error);
        // Continue without failing the request
      }
    }
    
    next();
  }
}