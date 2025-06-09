export class Attendance {
  constructor(props: {
    id?: string;
    userId: string;
    date: Date;
    isDeleted?: boolean;
    createdBy?: string;
    createdAt?: Date;
    updatedBy?: string;
    updatedAt?: Date;
    deletedBy?: string;
    deletedAt?: Date;
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
  isDeleted?: boolean;
  createdBy?: string;
  createdAt?: Date;
  updatedBy?: string;
  updatedAt?: Date;
  deletedBy?: string;
  deletedAt?: Date;
}
