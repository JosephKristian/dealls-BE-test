import { da } from '@faker-js/faker/.';
import { Injectable } from '@nestjs/common';
import { Reimbursement } from 'src/domain/entities/reimbursement.entity';
import { IReimbursementRepository } from 'src/domain/repositories/reimbursement.repository';
import { PrismaService } from 'src/shared/database/prisma.service';

@Injectable()
export class ReimbursementRepository implements IReimbursementRepository {
  constructor(private readonly prisma: PrismaService) { }

  async create(reimbursement: Reimbursement): Promise<Reimbursement> {
    const created = await this.prisma.reimbursement.create({
      data: {
        id: reimbursement.id,
        userId: reimbursement.userId,
        amount: reimbursement.amount,
        description: reimbursement.description,
        date: reimbursement.date,
        createdBy: reimbursement.createdBy,
        createdAt: reimbursement.createdAt,
        updatedBy: reimbursement.updatedBy ?? null,
        updatedAt: reimbursement.updatedAt ?? null,
        deletedBy: reimbursement.deletedBy ?? null,
        deletedAt: reimbursement.deletedAt ?? null,
        isDeleted: reimbursement.isDeleted,
      },
    });

    return this.toDomain(created);
  }

  async update(id: string, updatedData: Partial<Reimbursement>, updatedBy: string): Promise<Reimbursement | null> {
    const updated = await this.prisma.reimbursement.update({
      where: {
        id,
        isDeleted: false,
        isLocked: false,
      },
      data: {
        ...updatedData,
        updatedBy,
        updatedAt: new Date(),
      },
    });

    return updated ? this.toDomain(updated) : null;
  }

  async findByUserAndPeriod(userId: string, startDate: Date, endDate: Date): Promise<Reimbursement[]> {
    const data = await this.prisma.reimbursement.findMany({
      where: {
        userId,
        isDeleted: false,
        date: {
          gte: new Date(startDate),
          lte: new Date(endDate),
        },
      },
    });

    console.log("DATA", data)

    return data.map((r) => this.toDomain(r));
  }

  async lockReimbursementById(id: string, lockedBy: string, payrollId:string): Promise<void> {
    await this.prisma.reimbursement.update({
      where: {
        id,
        isDeleted: false
      },
      data: {
        payrollId: payrollId,
        isLocked: true,
        updatedBy: lockedBy,
        updatedAt: new Date()
      }
    });
  }


  async softDelete(id: string, deletedBy: string): Promise<Reimbursement | null> {
    const found = await this.prisma.reimbursement.findFirst({
      where: { id, isDeleted: false },
    });

    if (!found) {
      return null;
    }

    const deleted = await this.prisma.reimbursement.update({
      where: { id },
      data: {
        isDeleted: true,
        deletedBy,
        deletedAt: new Date(),
      },
    });

    return this.toDomain(deleted);
  }


  async findByUserId(userId: string): Promise<Reimbursement[]> {
    const data = await this.prisma.reimbursement.findMany({
      where: { userId, isDeleted: false },
    });

    return data.map((r) => this.toDomain(r));
  }

  async findById(id: string): Promise<Reimbursement | null> {
    const found = await this.prisma.reimbursement.findFirst({
      where: { id, isDeleted: false },
    });

    return found ? this.toDomain(found) : null;
  }



  private toDomain(raw: any): Reimbursement {
    return new Reimbursement({
      id: raw.id,
      userId: raw.userId,
      amount: raw.amount,
      description: raw.description,
      date: raw.date,
      createdBy: raw.createdBy,
      createdAt: raw.createdAt,
      updatedBy: raw.updatedBy ?? undefined,
      updatedAt: raw.updatedAt ?? undefined,
      deletedBy: raw.deletedBy ?? undefined,
      deletedAt: raw.deletedAt ?? undefined,
      isDeleted: raw.isDeleted,
    });
  }
}
