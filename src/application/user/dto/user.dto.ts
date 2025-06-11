export enum UserRole {
  Admin = 'ADMIN',
  Employee = 'EMPLOYEE',
  User = 'USER',
}

export class CreateUserDto {
  username: string;
  email: string;
  password: string;
  role: UserRole;
  createdBy: string;
}
