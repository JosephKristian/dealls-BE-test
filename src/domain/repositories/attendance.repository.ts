import { Attendance } from "../entities/attendance.entity";

export const IAttendanceRepositoryToken = Symbol('IAttendanceRepository');

export interface IAttendanceRepository {
  create(attendance: Attendance): Promise<Attendance>;
  findByUserIdAndDate(userId: string, date: Date): Promise<Attendance | null>;
  lockAttendanceById(id: string, lockedBy: string, payrollId:string): Promise<void>;
  softDelete(id: string, deletedBy: string): Promise<void>;

}
