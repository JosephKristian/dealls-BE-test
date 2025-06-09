import { User } from '../entities/user.entity';
export const IUserRepositoryToken = Symbol('IUserRepository');

export interface IUserRepository {
    create(user: User): Promise<User>;
    findById(id: string): Promise<User | null>;
    findByUsername(username: string): Promise<User | null>;
    update(user: User): Promise<User>;
    softDelete(id: string, deletedBy: string): Promise<void>;
}
