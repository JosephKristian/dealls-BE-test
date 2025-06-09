export enum UserRole {
  Admin = 'admin',
  Employee = 'employee',
  User = 'user',
}

export class CreateUserDto {
  username: string;
  email: string;
  password: string;
  role: UserRole;
  createdBy: string;
}
