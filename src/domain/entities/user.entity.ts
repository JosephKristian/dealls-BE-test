export class User {
  id: string;
  username: string;
  email: string;
  password: string;
  role: string;
  salary?: number;

  // Audit fields
  createdBy: string;
  createdAt: Date;
  updatedBy?: string;
  updatedAt?: Date;
  deletedBy?: string;
  deletedAt?: Date;

  // Soft delete flag
  isDeleted: boolean;

  constructor(props: {
    id: string;
    username: string;
    email: string;
    password: string;
    role: string;
    salary?: number;
    createdBy: string;
    createdAt: Date;
    updatedBy?: string;
    updatedAt?: Date;
    deletedBy?: string;
    deletedAt?: Date;
    isDeleted?: boolean;
  }) {
    Object.assign(this, props);
    this.isDeleted = props.isDeleted ?? false;
  }
}
