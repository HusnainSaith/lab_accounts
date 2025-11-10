import { Injectable, UnauthorizedException, ConflictException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../../users/services/users.service';
import { CompaniesService } from '../../companies/services/companies.service';
import { LoginDto, RegisterDto } from '../dto/register.dto';
import { UserRole } from '../../users/entities/user.entity';
import * as bcrypt from 'bcrypt';
import * as crypto from 'crypto';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private companiesService: CompaniesService,
    private jwtService: JwtService,
  ) {}

  async login(loginDto: LoginDto) {
    const user = await this.usersService.findByEmail(loginDto.email);
    
    if (!user || !await bcrypt.compare(loginDto.password, user.passwordHash)) {
      throw new UnauthorizedException('Invalid credentials');
    }

    // Update last login
    await this.usersService.updateLastLogin(user.id);

    const jti = crypto.randomUUID();
    const payload = { 
      sub: user.id, 
      email: user.email,
      companyId: user.companyId,
      role: user.role,
      preferredLanguage: user.preferredLanguage,
      jti
    };

    return {
      access_token: this.jwtService.sign(payload),
      user: {
        id: user.id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        role: user.role,
        companyId: user.companyId,
        preferredLanguage: user.preferredLanguage
      }
    };
  }

  async register(registerDto: RegisterDto) {
    // Check if email already exists
    const existingUser = await this.usersService.findByEmail(registerDto.email);
    if (existingUser) {
      throw new ConflictException('Email already exists');
    }

    const hashedPassword = await bcrypt.hash(registerDto.password, 10);
    
    // Get country config for VAT rate and currency
    const countryConfig = this.getCountryConfig(registerDto.countryCode);
    
    // Create company first
    const company = await this.companiesService.create({
      name: registerDto.companyName,
      countryCode: registerDto.countryCode,
      currencyCode: countryConfig.currencyCode,
      vatRate: countryConfig.defaultVatRate,
      trn: registerDto.trn,
      phone: registerDto.phone,
      isActive: true,
      isTestAccount: false
    });

    // Create user
    const user = await this.usersService.create({
      companyId: company.id,
      firstName: registerDto.firstName,
      lastName: registerDto.lastName,
      email: registerDto.email,
      password: registerDto.password,
      role: UserRole.OWNER,
      phone: registerDto.phone
    });

    return {
      message: 'Registration successful',
      user: {
        id: user.id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        role: user.role
      },
      company: {
        id: company.id,
        name: company.name,
        countryCode: company.countryCode,
        currencyCode: company.currencyCode
      }
    };
  }

  private getCountryConfig(countryCode: string) {
    const configs = {
      AE: { currencyCode: 'AED', defaultVatRate: 5.00 },
      SA: { currencyCode: 'SAR', defaultVatRate: 15.00 },
      EG: { currencyCode: 'EGP', defaultVatRate: 14.00 }
    };
    return configs[countryCode] || configs.AE;
  }

  async forgotPassword(email: string): Promise<{ message: string }> {
    const user = await this.usersService.findByEmail(email);
    if (!user) {
      return { message: 'If email exists, reset link has been sent' };
    }

    const token = crypto.randomBytes(32).toString('hex');
    // In production, save token to database and send email
    return { message: 'Reset token generated', token } as any;
  }

  async resetPassword(email: string, token: string, newPassword: string): Promise<{ message: string }> {
    const user = await this.usersService.findByEmail(email);
    if (!user) {
      throw new UnauthorizedException('Invalid reset token');
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    await this.usersService.update(user.id, { passwordHash: hashedPassword } as any);

    return { message: 'Password reset successfully' };
  }

  async changePassword(userId: string, currentPassword: string, newPassword: string): Promise<{ message: string }> {
    const user = await this.usersService.findOne(userId);
    if (!user || !await bcrypt.compare(currentPassword, user.passwordHash)) {
      throw new UnauthorizedException('Current password is incorrect');
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    await this.usersService.update(userId, { passwordHash: hashedPassword } as any);

    return { message: 'Password changed successfully' };
  }

  async logout(token: string): Promise<{ message: string }> {
    return { message: 'Logged out successfully' };
  }

  async isTokenBlacklisted(jti: string): Promise<boolean> {
    return false;
  }

  async validateUser(payload: { sub: string; email: string; jti?: string }) {
    // Check if token is blacklisted
    if (payload.jti && await this.isTokenBlacklisted(payload.jti)) {
      throw new UnauthorizedException('Token has been revoked');
    }
    try {
      return await this.usersService.findOne(payload.sub);
    } catch (error) {
      return null;
    }
  }
}