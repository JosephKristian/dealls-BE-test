export class Overtime {
  constructor(props: {
    id?: string;
    userId: string;
    date: Date;
    hours: number;
    isDeleted?: boolean;
    isLocked?: boolean;
    createdBy?: string | null;
    createdAt?: Date;
    updatedBy?: string | null;
    updatedAt?: Date | null;
    deletedBy?: string | null;
    deletedAt?: Date | null;
  }) {
    Object.assign(this, {
      isDeleted: false,
      createdAt: new Date(),
      ...props,
    });
  }

  id?: string;
  userId: string;
  date: Date;
  hours: number;
  isDeleted: boolean;
  isLocked: boolean;
  createdBy?: string | null;
  createdAt?: Date;
  updatedBy?: string | null;
  updatedAt?: Date | null;
  deletedBy?: string | null;
  deletedAt?: Date | null;
}
