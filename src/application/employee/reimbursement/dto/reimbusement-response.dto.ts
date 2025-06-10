import { Reimbursement } from "src/domain/entities/reimbursement.entity";


export class ReimbursementResponseDto {
  id: string;
  userId: string;
  amount: number;
  description: string;
  date: Date;
  createdAt: Date;

  constructor(entity: Reimbursement) {
    this.id = entity.id ?? '';
    this.userId = entity.userId;
    this.amount = entity.amount;
    this.description = entity.description;
    this.date = entity.date;
    this.createdAt = entity.createdAt;
  }
}