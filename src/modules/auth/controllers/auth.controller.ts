import { Controller, Post, Body, UseGuards, Request, UseFilters } from '@nestjs/common';
import { DatabaseExceptionFilter } from '../../../common/filters/database-exception.filter';
import { AuthService } from '../services/auth.service';
import { LoginDto, RegisterDto } from '../dto/register.dto';
import { ForgotPasswordDto, ResetPasswordDto, ChangePasswordDto } from '../dto/forgot-password.dto';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';

@Controller('auth')
@UseFilters(DatabaseExceptionFilter)
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  async login(@Body() loginDto: LoginDto) {
    return this.authService.login(loginDto);
  }

  @Post('register')
  async register(@Body() registerDto: RegisterDto) {
    return this.authService.register(registerDto);
  }

  @UseGuards(JwtAuthGuard)
  @Post('profile')
  getProfile(@Request() req: { user: unknown }) {
    return req.user;
  }

  @Post('forgot-password')
  async forgotPassword(@Body() forgotPasswordDto: ForgotPasswordDto) {
    return this.authService.forgotPassword(forgotPasswordDto.email);
  }

  @Post('reset-password')
  async resetPassword(@Body() resetPasswordDto: ResetPasswordDto) {
    return this.authService.resetPassword(
      resetPasswordDto.email,
      resetPasswordDto.token,
      resetPasswordDto.newPassword
    );
  }

  @UseGuards(JwtAuthGuard)
  @Post('change-password')
  async changePassword(
    @Body() changePasswordDto: ChangePasswordDto,
    @Request() req: { user: { id: string } }
  ) {
    return this.authService.changePassword(
      req.user.id,
      changePasswordDto.currentPassword,
      changePasswordDto.newPassword
    );
  }

  @UseGuards(JwtAuthGuard)
  @Post('logout')
  async logout(@Request() req: { headers: { authorization?: string } }) {
    const token = req.headers.authorization?.replace('Bearer ', '') || '';
    return this.authService.logout(token);
  }
}