import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Like } from 'typeorm';
import { User, UserRole as UserRoleEnum } from '../entities/user.entity';
import { CompanyUser } from '../../companies/entities/company-user.entity';
import { UserRole } from '../entities/user-role.entity';
import { Role } from '../../roles/entities/role.entity';
import { CreateUserDto, UpdateUserDto } from '../dto';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
    @InjectRepository(CompanyUser)
    private companyUsersRepository: Repository<CompanyUser>,
    @InjectRepository(UserRole)
    private userRolesRepository: Repository<UserRole>,
    @InjectRepository(Role)
    private rolesRepository: Repository<Role>,
  ) {}

  async create(
    createUserDto: CreateUserDto & { companyId?: string },
  ): Promise<User> {
    const hashedPassword = await bcrypt.hash(createUserDto.password, 10);

    // Map fields to User entity schema
    const userData: any = {
      fullName: createUserDto.firstName && createUserDto.lastName 
        ? `${createUserDto.firstName} ${createUserDto.lastName}` 
        : createUserDto.fullName || createUserDto.firstName || 'Unknown',
      email: createUserDto.email,
      passwordHash: hashedPassword,
      isActive: true,
    };

    return await this.usersRepository.manager.transaction(async manager => {
      // Create user
      const user = manager.create(User, userData);
      const savedUser = await manager.save(user);
      const finalUser = Array.isArray(savedUser) ? savedUser[0] : savedUser;

      // Associate user with company if companyId provided
      if (createUserDto.companyId) {
        const companyUser = manager.create(CompanyUser, {
          companyId: createUserDto.companyId,
          userId: finalUser.id,
          isActive: true,
        });
        await manager.save(companyUser);

        // Assign role if provided
        if (createUserDto.role) {
          let role = await manager.findOne(Role, {
            where: {
              code: createUserDto.role.toUpperCase(),
              companyId: createUserDto.companyId
            }
          });
          
          if (!role) {
            role = await manager.createQueryBuilder(Role, 'role')
              .where('role.code = :code', { code: createUserDto.role.toUpperCase() })
              .andWhere('role.companyId IS NULL')
              .getOne();
          }

          if (role) {
            const userRole = manager.create(UserRole, {
              companyId: createUserDto.companyId,
              userId: finalUser.id,
              roleId: role.id,
            });
            await manager.save(userRole);
            
            // Add role info to returned user
            (finalUser as any).role = role;
          }
        }
      }

      return finalUser;
    });
  }

  async findAll(
    companyId?: string,
    role?: string,
    search?: string,
  ): Promise<User[]> {
    // RLS will automatically filter users by company context
    // We just need to join with company_users to ensure proper filtering
    const queryBuilder = this.usersRepository
      .createQueryBuilder('user')
      .innerJoin('user.companyUsers', 'companyUser')
      .where('user.isActive = :isActive', { isActive: true })
      .andWhere('companyUser.isActive = :companyUserActive', { companyUserActive: true });

    if (role) {
      queryBuilder.andWhere('user.role = :role', { role });
    }

    if (search) {
      queryBuilder.andWhere('user.fullName ILIKE :search', { search: `%${search}%` });
    }

    return queryBuilder
      .orderBy('user.createdAt', 'DESC')
      .getMany();
  }

  async findOne(id: string, companyId?: string): Promise<User> {
    const where: any = { id };

    const user = await this.usersRepository.findOne({
      where,
      relations: ['companyUsers', 'userRoles'],
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Get role information
    if (companyId && user.userRoles) {
      const userRole = await this.userRolesRepository.findOne({
        where: { userId: id, companyId },
        relations: ['role']
      });
      
      if (userRole) {
        (user as any).role = (userRole as any).role;
      }
    }

    return user;
  }

  async findOneActive(id: string, companyId?: string): Promise<User> {
    const whereAll: any = { id };

    // First check if user exists at all
    const userExists = await this.usersRepository.findOne({
      where: whereAll,
      relations: ['companyUsers'],
    });

    if (!userExists) {
      throw new NotFoundException('User not found');
    }

    if (!userExists.isActive) {
      throw new NotFoundException('User has been deleted');
    }

    return userExists;
  }

  async findByEmail(email: string): Promise<User | null> {
    return this.usersRepository.findOne({
      where: { email },
      relations: ['companyUsers'],
    });
  }

  async findByCompany(companyId: string): Promise<User[]> {
    // This would need to be implemented through CompanyUser junction table
    return this.usersRepository
      .createQueryBuilder('user')
      .innerJoin('user.companyUsers', 'companyUser')
      .where('companyUser.companyId = :companyId', { companyId })
      .getMany();
  }

  async update(
    id: string,
    updateUserDto: UpdateUserDto,
    companyId?: string,
  ): Promise<User> {
    const updateData: any = { ...updateUserDto };

    // Transform firstName/lastName to fullName if provided
    if (updateUserDto.firstName || updateUserDto.lastName) {
      updateData.fullName = `${updateUserDto.firstName || ''} ${updateUserDto.lastName || ''}`.trim();
      delete updateData.firstName;
      delete updateData.lastName;
    }

    // Hash password if provided
    if (updateUserDto.password) {
      updateData.passwordHash = await bcrypt.hash(updateUserDto.password, 10);
      delete updateData.password;
    }

    const result = await this.usersRepository.update({ id }, updateData);

    if (result.affected === 0) {
      throw new NotFoundException('User not found');
    }

    return this.findOne(id, companyId);
  }

  async updateLastLogin(id: string): Promise<void> {
    await this.usersRepository.update(id, { lastLoginAt: new Date() });
  }

  async remove(id: string, companyId?: string): Promise<void> {
    const result = await this.usersRepository.update({ id }, {
      isActive: false,
    });

    if (result.affected === 0) {
      throw new NotFoundException('User not found');
    }
  }

  async deleteOwnerAndCompany(ownerId: string): Promise<void> {
    // Find the owner
    const owner = await this.findOne(ownerId);
    // Skip role check for now - allow all users
    
    // Get company ID from CompanyUser relationship
    const companyUser = (owner.companyUsers as any)?.[0];
    if (!companyUser) {
      throw new BadRequestException('User is not associated with any company');
    }
    const companyId = (companyUser as any).companyId;
    
    // Start transaction for atomic operation
    await this.usersRepository.manager.transaction(async manager => {
      // 1. Soft delete all users in the company through CompanyUser
      const companyUsers = await manager.find('company_users', { where: { companyId } });
      for (const cu of companyUsers) {
        await manager.update('users', { id: (cu as any).userId }, { isActive: false });
      }
      
      // 2. Cancel all invoices
      await manager.update('invoices', 
        { companyId }, 
        { status: 'cancelled' }
      );
      
      // 3. Delete customers (hard delete since no isActive field)
      await manager.delete('customers', { companyId });
      
      // 4. Deactivate items
      await manager.update('items', 
        { companyId }, 
        { isActive: false }
      );
      
      // 5. Delete expenses (hard delete since no isActive field)
      await manager.delete('expenses', { companyId });
      
      // 6. Deactivate the company
      await manager.update('companies', 
        { id: companyId }, 
        { isActive: false }
      );
    });
  }

  async getStatistics(companyId: string): Promise<any> {
    const baseQuery = this.usersRepository
      .createQueryBuilder('user')
      .innerJoin('user.companyUsers', 'companyUser')
      .where('companyUser.companyId = :companyId', { companyId });

    const [total, active] = await Promise.all([
      baseQuery.getCount(),
      baseQuery.clone().andWhere('user.isActive = true').getCount(),
    ]);

    // Debug: Check what's in user_roles table
    const debugUserRoles = await this.usersRepository.manager.query(`
      SELECT u.full_name, r.code as role_code, ur.company_id
      FROM users u
      INNER JOIN company_users cu ON cu.user_id = u.id
      INNER JOIN user_roles ur ON ur.user_id = u.id
      INNER JOIN roles r ON r.id = ur.role_id
      WHERE cu.company_id = $1 AND u.is_active = true
    `, [companyId]);
    
    console.log('Debug - User roles for company:', companyId, debugUserRoles);

    // Count users by roles using direct table joins
    const roleStats = await this.usersRepository.manager.query(`
      SELECT r.code as "roleCode", COUNT(*)::int as count
      FROM users u
      INNER JOIN company_users cu ON cu.user_id = u.id
      INNER JOIN user_roles ur ON ur.user_id = u.id AND ur.company_id = $1
      INNER JOIN roles r ON r.id = ur.role_id
      WHERE cu.company_id = $1 AND u.is_active = true
      GROUP BY r.code
    `, [companyId]);
    
    console.log('Debug - Role stats:', roleStats);

    const roleCounts = {
      owners: 0,
      staff: 0,
      accountants: 0,
    };

    roleStats.forEach(stat => {
      const count = parseInt(stat.count);
      switch (stat.roleCode.toUpperCase()) {
        case 'OWNER':
          roleCounts.owners = count;
          break;
        case 'STAFF':
          roleCounts.staff = count;
          break;
        case 'ACCOUNTANT':
          roleCounts.accountants = count;
          break;
      }
    });

    return {
      total,
      active,
      inactive: total - active,
      ...roleCounts,
    };
  }

  async restore(id: string, companyId?: string): Promise<User> {
    const result = await this.usersRepository.update({ id }, { isActive: true });

    if (result.affected === 0) {
      throw new NotFoundException('User not found');
    }

    return this.findOne(id);
  }

  async restoreByEmail(email: string): Promise<User> {
    const user = await this.findByEmail(email);
    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Regular user restore
    await this.usersRepository.update(
      { email },
      { isActive: true }
    );

    const restoredUser = await this.findByEmail(email);
    if (!restoredUser) {
      throw new NotFoundException('User not found after restore');
    }

    return restoredUser;
  }

  async restoreOwnerAndCompany(ownerId: string): Promise<void> {
    // Find the owner
    const owner = await this.usersRepository.findOne({ 
      where: { id: ownerId },
      relations: ['companyUsers']
    });
    if (!owner) {
      throw new BadRequestException('User is not an owner');
    }
    
    const companyUser = (owner.companyUsers as any)?.[0];
    if (!companyUser) {
      throw new BadRequestException('User is not associated with any company');
    }
    const companyId = (companyUser as any).companyId;
    
    // Start transaction for atomic operation
    await this.usersRepository.manager.transaction(async manager => {
      // 1. Restore all users in the company through CompanyUser
      const companyUsers = await manager.find('company_users', { where: { companyId } });
      for (const cu of companyUsers) {
        await manager.update('users', { id: (cu as any).userId }, { isActive: true });
      }
      
      // 2. Restore all invoices (change from cancelled to sent)
      await manager.update('invoices', 
        { companyId, status: 'cancelled' }, 
        { status: 'sent' }
      );
      
      // 3. Customers are hard deleted, cannot restore
      
      // 4. Restore items
      await manager.update('items', 
        { companyId }, 
        { isActive: true }
      );
      
      // 5. Expenses are hard deleted, cannot restore
      
      // 6. Restore the company
      await manager.update('companies', 
        { id: companyId }, 
        { isActive: true }
      );
    });
  }
}