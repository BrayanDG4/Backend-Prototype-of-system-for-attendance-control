import { IsISO8601, IsString, Validate } from 'class-validator';
import { IsDateAfter } from '../helpers/is-date-after.validator'; // Custom validator

export class ReportParamsDto {
  @IsString()
  classGroupId: string;

  @IsISO8601({ strict: true })
  startDate: string;

  @IsISO8601({ strict: true })
  @Validate(IsDateAfter, ['startDate'])
  endDate: string;
}
