import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
} from '@nestjs/common';

@Injectable()
export class CompanyGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    const user = request.user;

    if (!user || !user.companyId) {
      throw new UnauthorizedException('Company ID is required');
    }

    // Company ID is already in the JWT token, no additional validation needed
    request.companyId = user.companyId;
    return true;
  }
}
