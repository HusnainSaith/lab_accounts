import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { RLSService } from '../services/rls.service';

@Injectable()
export class RLSGuard implements CanActivate {
  constructor(private rlsService: RLSService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const user = request.user;

    if (user?.companyId) {
      await this.rlsService.setCompanyContext(user.companyId);
    }

    return true;
  }
}