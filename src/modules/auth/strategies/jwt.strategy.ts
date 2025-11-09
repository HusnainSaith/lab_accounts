import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable } from '@nestjs/common';
import { AuthService } from '../services/auth.service';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private authService: AuthService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: process.env.JWT_SECRET || 'your-secret-key',
    });
  }

  async validate(payload: {
    sub: string;
    email: string;
    companyId: string;
    role: string;
    jti?: string;
  }) {
    const user = await this.authService.validateUser(payload);
    return {
      id: user.id,
      email: user.email,
      companyId: payload.companyId,
      role: payload.role,
      roles: [payload.role], // Convert single role to array
    };
  }
}
