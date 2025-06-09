import { Injectable } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { Attendance } from 'src/domain/user/entities/attendance.entity';
import { IAttendanceRepository } from 'src/domain/user/repositories/attendance.repository';
import { PrismaService } from 'src/shared/database/prisma.service';

@Injectable()
export class AttendanceRepository implements IAttendanceRepository {
  constructor(private prisma: PrismaService) { }

  async create(attendance: Attendance): Promise<Attendance> {
    const created = await this.prisma.attendance.create({
      data: {
        id: attendance.id,
        userId: attendance.userId,
        date: attendance.date,
        isDeleted: attendance.isDeleted,
        createdBy: attendance.createdBy,
        createdAt: attendance.createdAt,
        updatedBy: attendance.updatedBy,
        updatedAt: attendance.updatedAt,
        deletedBy: attendance.deletedBy,
        deletedAt: attendance.deletedAt,
      },
    });
    return this.toDomain(created);
  }

  async findByUserIdAndDate(userId: string, date: Date): Promise<Attendance | null> {
    const start = new Date(date.toDateString());
    const end = new Date(start);
    end.setDate(end.getDate() + 1);

    const found = await this.prisma.attendance.findFirst({
      where: {
        userId,
        isDeleted: false,
        date: {
          gte: start,
          lt: end,
        },
      },
    });

    return found ? this.toDomain(found) : null;
  }

  async updateTimestamp(id: string, updatedBy: string): Promise<Attendance> {
    const updated = await this.prisma.attendance.update({
      where: { id },
      data: {
        updatedAt: new Date(),
        updatedBy,
      },
    });

    return this.toDomain(updated);
  }

  async softDelete(id: string, deletedBy: string): Promise<void> {
    await this.prisma.attendance.update({
      where: { id },
      data: {
        isDeleted: true,
        deletedBy,
        deletedAt: new Date(),
      },
    });
  }

  private toDomain(raw: any): Attendance {
    return new Attendance({
      id: raw.id,
      userId: raw.userId,
      date: raw.date,
      isDeleted: raw.isDeleted,
      createdBy: raw.createdBy,
      createdAt: raw.createdAt,
      updatedBy: raw.updatedBy,
      updatedAt: raw.updatedAt,  
      deletedBy: raw.deletedBy,
      deletedAt: raw.deletedAt,
    });
  }
}
