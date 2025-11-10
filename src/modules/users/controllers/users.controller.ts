import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Query } from '@nestjs/common';
import { UsersService } from '../services/users.service';
import { CreateUserDto, UpdateUserDto } from '../dto';
import { RequirePermissions } from '../../../common/decorators/permissions.decorator';
import { PermissionsGuard } from '../../../common/guards/permissions.guard';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { CompanyContext } from '../../../common/decorators/company-context.decorator';

@Controller('users')
@UseGuards(JwtAuthGuard, PermissionsGuard)
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post()
  @RequirePermissions('users.create')
  create(@Body() createUserDto: CreateUserDto, @CompanyContext() companyId: string) {
    return this.usersService.create({ ...createUserDto, companyId });
  }

  @Get()
  @RequirePermissions('users.read')
  findAll(@CompanyContext() companyId: string, @Query('role') role?: string, @Query('search') search?: string) {
    return this.usersService.findAll(companyId, role, search);
  }

  @Get('statistics')
  @RequirePermissions('users.read')
  getStatistics(@CompanyContext() companyId: string) {
    return this.usersService.getStatistics(companyId);
  }

  @Get(':id')
  @RequirePermissions('users.read')
  findOne(@Param('id') id: string, @CompanyContext() companyId: string) {
    return this.usersService.findOne(id, companyId);
  }

  @Patch(':id')
  @RequirePermissions('users.update')
  update(@Param('id') id: string, @Body() updateUserDto: UpdateUserDto, @CompanyContext() companyId: string) {
    return this.usersService.update(id, updateUserDto, companyId);
  }

  @Delete(':id')
  @RequirePermissions('users.delete')
  remove(@Param('id') id: string, @CompanyContext() companyId: string) {
    return this.usersService.remove(id, companyId);
  }
}