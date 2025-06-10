import { Reimbursement } from "src/domain/entities/reimbursement.entity";
export interface IReimbursementRepository {
  create(reimbursement: Reimbursement): Promise<Reimbursement>;

  update(
    id: string,
    updatedData: Partial<Reimbursement>,
    updatedBy: string,
  ): Promise<Reimbursement | null>;

  lockReimbursementById(id: string, lockedBy: string, payrollId: string): Promise<void>;

  softDelete(id: string, deletedBy: string): Promise<Reimbursement | null>;

  findById(id: string): Promise<Reimbursement | null>;

  findByUserId(userId: string): Promise<Reimbursement[]>;
}

export const IReimbursementRepositoryToken = Symbol('IReimbursementRepository');