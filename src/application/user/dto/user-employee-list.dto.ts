import { Exclude, Expose } from 'class-transformer';

@Exclude()
export class EmployeeSimpleDto {
  @Expose()
  id: string;

  @Expose()
  username: string;

  @Expose()
  email: string;
}
