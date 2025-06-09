export class OvertimeResponseDto {
  constructor(data: any) {
    Object.assign(this, data);
  }

  id: string;
  userId: string;
  date: Date;
  hours: number;
  createdAt: Date;
}