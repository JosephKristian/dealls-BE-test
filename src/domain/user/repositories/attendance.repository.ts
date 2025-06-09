import { Attendance } from "../entities/attendance.entity";

export const IUserRepositoryToken = Symbol('IUserRepository');

export interface IAttendanceRepository {
  create(attendance: Attendance): Promise<Attendance>;
  findByUserIdAndDate(userId: string, date: Date): Promise<Attendance | null>;
  softDelete(id: string, deletedBy: string): Promise<void>;
}
