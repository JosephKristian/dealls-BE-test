export class AttendanceResponseDto {
  id: string;
  userId: string;
  date: Date;
  isDeleted: boolean;
  createdBy?: string;
  createdAt?: Date;
  updatedBy?: string;
  updatedAt?: Date;
  deletedBy?: string;
  deletedAt?: Date;

  constructor(partial: Partial<AttendanceResponseDto>) {
    Object.assign(this, partial);
  }
}
