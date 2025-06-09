import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/shared/database/prisma.service';

@Injectable()
export class AuditLogService {
  constructor(private prisma: PrismaService) { }

  async log({
    entity,
    entityId,
    action,
    performedBy,
    ipAddress,
    requestId,
    oldData,
    newData,
  }: {
    entity: string;
    entityId: string;
    action: 'LOGIN' | 'CREATE' | 'UPDATE' | 'DELETE';
    performedBy?: string;
    ipAddress?: string;
    requestId?: string;
    oldData?: any;
    newData?: any;
  }) {
    await this.prisma.auditLog.create({
      data: {
        entity,
        entityId,
        action,
        performedBy,
        ipAddress,
        requestId,
        oldData,
        newData,
      },
    });
  }
}
