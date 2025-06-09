import { Injectable } from '@nestjs/common';
import { Overtime } from 'src/domain/user/entities/overtime.entity';
import { IOvertimeRepository } from 'src/domain/user/repositories/overtime.repository';
import { PrismaService } from 'src/shared/database/prisma.service';


@Injectable()
export class OvertimeRepository implements IOvertimeRepository {
  constructor(private prisma: PrismaService) {}

  async findByUserIdAndDate(userId: string, date: Date): Promise<Overtime | null> {
    return this.prisma.overtime.findFirst({
      where: {
        userId,
        date: new Date(date.toDateString()),
        isDeleted: false,
      },
    });
  }

  async create(overtime: Overtime): Promise<Overtime> {
    return this.prisma.overtime.create({
      data: overtime,
    });
  }

  async updateTimestamp(id: string, updatedBy: string, hours: number): Promise<Overtime> {
    return this.prisma.overtime.update({
      where: { id },
      data: {
        hours,
        updatedBy,
        updatedAt: new Date(),
      },
    });
  }

  async softDelete(id: string, deletedBy: string): Promise<void> {
    await this.prisma.overtime.update({
      where: { id },
      data: {
        isDeleted: true,
        deletedBy,
        deletedAt: new Date(),
      },
    });
  }
}
