import { PrismaClient } from '@prisma/client';
import { User } from 'src/domain/user/entities/user.entity';
import { IUserRepository } from 'src/domain/user/repositories/user.repository';

export class UserRepository implements IUserRepository {
  constructor(private prisma: PrismaClient) {}

  async create(user: User): Promise<User> {
    const created = await this.prisma.user.create({
      data: {
        id: user.id,
        username: user.username,
        email: user.email,
        password: user.password,
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
    const found = await this.prisma.user.findFirst({
      where: { id, isDeleted: false },
    });
    return found ? this.toDomain(found) : null;
  }

  async findByUsername(username: string): Promise<User | null> {
    const found = await this.prisma.user.findFirst({
      where: { username, isDeleted: false },
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
