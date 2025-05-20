import { IsEmail, IsISO8601, IsString } from 'class-validator';

export class Esp32AttendanceDto {
  @IsEmail()
  email: string;

  @IsString()
  classGroupId: string;

  @IsISO8601()
  timestamp: string;
}
