import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Like } from 'typeorm';
import { User, UserRole } from '../entities/user.entity';
import { CreateUserDto, UpdateUserDto } from '../dto';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
  ) {}

  async create(createUserDto: CreateUserDto & { companyId: string }): Promise<User> {
    const hashedPassword = await bcrypt.hash(createUserDto.password, 10);
    
    const user = this.usersRepository.create({
      ...createUserDto,
      passwordHash: hashedPassword,
      isActive: true
    });
    
    return this.usersRepository.save(user);
  }

  async findAll(companyId: string, role?: string, search?: string): Promise<User[]> {
    const where: any = { companyId, isActive: true };
    
    if (role) {
      where.role = role;
    }
    
    if (search) {
      where.firstNameEn = Like(`%${search}%`);
    }

    return this.usersRepository.find({
      where,
      relations: ['company'],
      order: { createdAt: 'DESC' }
    });
  }

  async findOne(id: string, companyId?: string): Promise<User> {
    const where: any = { id };
    if (companyId) {
      where.companyId = companyId;
    }
    
    const user = await this.usersRepository.findOne({
      where,
      relations: ['company']
    });
    
    if (!user) {
      throw new NotFoundException('User not found');
    }
    
    return user;
  }

  async findByEmail(email: string): Promise<User | null> {
    return this.usersRepository.findOne({
      where: { email },
      relations: ['company']
    });
  }

  async findByCompany(companyId: string): Promise<User[]> {
    return this.usersRepository.find({
      where: { companyId },
      relations: ['company']
    });
  }

  async update(id: string, updateUserDto: UpdateUserDto, companyId?: string): Promise<User> {
    const where: any = { id };
    if (companyId) {
      where.companyId = companyId;
    }
    
    const updateData: any = { ...updateUserDto };
    
    // Hash password if provided
    if (updateUserDto.password) {
      updateData.passwordHash = await bcrypt.hash(updateUserDto.password, 10);
      delete updateData.password;
    }
    
    const result = await this.usersRepository.update(where, updateData);
    
    if (result.affected === 0) {
      throw new NotFoundException('User not found');
    }
    
    return this.findOne(id, companyId);
  }

  async updateLastLogin(id: string): Promise<void> {
    await this.usersRepository.update(id, { lastLogin: new Date() });
  }

  async remove(id: string, companyId?: string): Promise<void> {
    const where: any = { id };
    if (companyId) {
      where.companyId = companyId;
    }
    
    const result = await this.usersRepository.update(where, { isActive: false });
    
    if (result.affected === 0) {
      throw new NotFoundException('User not found');
    }
  }

  async getStatistics(companyId: string): Promise<any> {
    const [total, active, owners, staff, accountants] = await Promise.all([
      this.usersRepository.count({ where: { companyId } }),
      this.usersRepository.count({ where: { companyId, isActive: true } }),
      this.usersRepository.count({ where: { companyId, role: UserRole.OWNER } }),
      this.usersRepository.count({ where: { companyId, role: UserRole.STAFF } }),
      this.usersRepository.count({ where: { companyId, role: UserRole.ACCOUNTANT } })
    ]);

    return { total, active, inactive: total - active, owners, staff, accountants };
  }
}