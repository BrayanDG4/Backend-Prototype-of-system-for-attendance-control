import {
  ValidatorConstraint,
  ValidatorConstraintInterface,
  ValidationArguments,
} from 'class-validator';

@ValidatorConstraint({ name: 'isDateAfter', async: false })
export class IsDateAfter implements ValidatorConstraintInterface {
  validate(endDate: string, args: ValidationArguments) {
    const [startDateField] = args.constraints;
    const startDate = (args.object as any)[startDateField];
    return new Date(endDate) > new Date(startDate);
  }

  defaultMessage(args: ValidationArguments) {
    return 'La fecha final debe ser posterior a la fecha inicial';
  }
}
