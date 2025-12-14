import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { RLSService } from '../services/rls.service';
import { DataSource } from 'typeorm';

@Injectable()
export class RLSMiddleware implements NestMiddleware {
  constructor(
    private readonly rlsService: RLSService,
    private readonly dataSource: DataSource,
  ) {}

  async use(req: Request, res: Response, next: NextFunction) {
    const user = (req as any).user;

    if (user && user.sub) {
      try {
        // Get company ID from CompanyUser relationship or header
        let companyId = req.headers['x-company-id'] as string;
        
        if (!companyId && user.sub) {
          // Query CompanyUser to get company ID
          const result = await this.dataSource.query(
            'SELECT company_id FROM company_users WHERE user_id = $1 AND is_active = true LIMIT 1',
            [user.sub]
          );
          companyId = result[0]?.company_id;
        }

        if (companyId) {
          await this.rlsService.setCompanyContext(companyId);
          // Store companyId in request for later use
          (req as any).companyId = companyId;
        }

        // Clear context after response
        res.on('finish', async () => {
          try {
            await this.rlsService.clearCompanyContext();
          } catch (err) {
            console.error('[RLS] Error clearing tenant context:', err);
          }
        });
      } catch (error) {
        console.error('[RLS] Error setting tenant context:', error);
      }
    }

    next();
  }
}
