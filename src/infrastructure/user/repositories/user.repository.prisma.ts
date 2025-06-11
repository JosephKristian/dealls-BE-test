import { Injectable } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { User } from 'src/domain/entities/user.entity';
import { IUserRepository } from 'src/domain/repositories/user.repository';
import { PrismaService } from 'src/shared/database/prisma.service';

@Injectable()
export class UserRepository implements IUserRepository {
  constructor(private prisma: PrismaService) { }

  async create(user: User): Promise<User> {
    const created = await this.prisma.user.create({
      data: {
        id: user.id,
        username: user.username,
        email: user.email,
        password: user.password,
        role: user.role,
        createdBy: user.createdBy,
        createdAt: user.createdAt,
        updatedBy: user.updatedBy,
        updatedAt: user.updatedAt,
        deletedBy: user.deletedBy,
        deletedAt: user.deletedAt,
        isDeleted: user.isDeleted,
      },
    });
    return this.toDomain(created);
  }

  async findById(id: string): Promise<User | null> {
    try {
      console.log('[findById] Mencari user dengan ID:', id);
      const found = await this.prisma.user.findFirst({
        where: { id, isDeleted: false },
      });

      if (!found) {
        console.error('[findById] Tidak ditemukan user dengan ID:', id);
        return null;
      }

      const user = this.toDomain(found);
      console.log('[findById] Hasil toDomain:', user);
      return user;
    } catch (err) {
      console.error('[findById] ERROR:', err);

      // Handle berbagai tipe error
      let errorMessage = 'Unknown error during find user';

      if (typeof err === 'string') {
        errorMessage = err;
      } else if (err instanceof Error) {
        errorMessage = err.message;
      } else if (err && typeof err === 'object' && 'message' in err) {
        errorMessage = err.message;
      }

      throw new Error('Gagal mencari user. Detail: ' + errorMessage);
    }
  }

  async findAllEmployees(): Promise<User[]> {
    const employees = await this.prisma.user.findMany({
      where: {
        role: 'EMPLOYEE',
        isDeleted: false,
      },
    });

    return employees.map((user) => this.toDomain(user));
  }

  async findByUsername(username: string): Promise<User | null> {
    const found = await this.prisma.user.findFirst({
      where: { username, isDeleted: false },
    });
    return found ? this.toDomain(found) : null;
  }

  async findAllByRole(role: string): Promise<User[]> {
    const users = await this.prisma.user.findMany({
      where: {
        role,
        isDeleted: false,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return users.map(this.toDomain);
  }

  async findByEmail(email: string): Promise<User | null> {
    const found = await this.prisma.user.findFirst({
      where: { email, isDeleted: false },
    });
    return found ? this.toDomain(found) : null;
  }

  async update(user: User): Promise<User> {
    const updated = await this.prisma.user.update({
      where: { id: user.id },
      data: {
        username: user.username,
        email: user.email,
        password: user.password,
        role: user.role,
        updatedBy: user.updatedBy,
        updatedAt: user.updatedAt ?? new Date(),
      },
    });
    return this.toDomain(updated);
  }

  async softDelete(id: string, deletedBy: string): Promise<void> {
    await this.prisma.user.update({
      where: { id },
      data: {
        isDeleted: true,
        deletedBy,
        deletedAt: new Date(),
      },
    });
  }

  private toDomain(raw: any): User {
    return new User({
      id: raw.id,
      username: raw.username,
      email: raw.email,
      password: raw.password,
      role: raw.role,
      salary: raw.salary,
      createdBy: raw.createdBy,
      createdAt: raw.createdAt,
      updatedBy: raw.updatedBy,
      updatedAt: raw.updatedAt,
      deletedBy: raw.deletedBy,
      deletedAt: raw.deletedAt,
      isDeleted: raw.isDeleted,
    });
  }
}
