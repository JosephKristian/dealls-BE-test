import { Overtime } from "../entities/overtime.entity";


export const IOvertimeRepositoryToken = Symbol('IOvertimeRepository');

export interface IOvertimeRepository {
  create(overtime: Overtime): Promise<Overtime>;
  findByUserIdAndDate(userId: string, date: Date): Promise<Overtime | null>;
  updateTimestamp(id: string, updatedBy: string, hours: number): Promise<Overtime>;
  softDelete(id: string, deletedBy: string): Promise<void>;
}
