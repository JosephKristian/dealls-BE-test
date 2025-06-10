export class Reimbursement {
  id?: string;
  userId: string;
  amount: number;
  description: string;
  date: Date;

  // Audit fields
  createdBy: string;
  createdAt: Date;
  updatedBy?: string;
  updatedAt?: Date;
  deletedBy?: string;
  deletedAt?: Date;

  // Soft delete flag
  isDeleted: boolean;
  isLocked: boolean;

  constructor(props: {
    id?: string;
    userId: string;
    amount: number;
    description: string;
    date: Date;

    createdBy: string;
    createdAt: Date;
    updatedBy?: string;
    updatedAt?: Date;
    deletedBy?: string;
    deletedAt?: Date;
    isDeleted?: boolean;
    isLocked?: boolean;
  }) {
    Object.assign(this, props);
    this.isDeleted = props.isDeleted ?? false;
    this.isLocked = props.isLocked ?? false;
  }
}
