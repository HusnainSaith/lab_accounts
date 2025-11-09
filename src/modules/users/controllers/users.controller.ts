import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Query } from '@nestjs/common';
import { UsersService } from '../services/users.service';
import { CreateUserDto, UpdateUserDto } from '../dto';
import { Roles } from '../../../common/decorators/roles.decorator';
import { RolesGuard } from '../../../common/guards/roles.guard';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { CompanyContext } from '../../../common/decorators/company-context.decorator';

@Controller('users')
@UseGuards(JwtAuthGuard, RolesGuard)
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post()
  @Roles('owner')
  create(@Body() createUserDto: CreateUserDto, @CompanyContext() companyId: string) {
    return this.usersService.create({ ...createUserDto, companyId });
  }

  @Get()
  @Roles('owner', 'staff', 'accountant')
  findAll(@CompanyContext() companyId: string, @Query('role') role?: string, @Query('search') search?: string) {
    return this.usersService.findAll(companyId, role, search);
  }

  @Get('statistics')
  @Roles('owner', 'staff', 'accountant')
  getStatistics(@CompanyContext() companyId: string) {
    return this.usersService.getStatistics(companyId);
  }

  @Get(':id')
  @Roles('owner', 'staff', 'accountant')
  findOne(@Param('id') id: string, @CompanyContext() companyId: string) {
    return this.usersService.findOne(id, companyId);
  }

  @Patch(':id')
  @Roles('owner')
  update(@Param('id') id: string, @Body() updateUserDto: UpdateUserDto, @CompanyContext() companyId: string) {
    return this.usersService.update(id, updateUserDto, companyId);
  }

  @Delete(':id')
  @Roles('owner')
  remove(@Param('id') id: string, @CompanyContext() companyId: string) {
    return this.usersService.remove(id, companyId);
  }
}