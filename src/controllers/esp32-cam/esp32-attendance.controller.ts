import { Controller, Post, Body } from '@nestjs/common';
import { Esp32AttendanceService } from '../../services/esp32-cam/esp32-attendance.service';
import { Esp32AttendanceDto } from '../../dto/esp32-attendance.dto';
import { validate } from 'class-validator';
import { plainToInstance } from 'class-transformer';

@Controller('esp32-attendance')
export class Esp32AttendanceController {
  constructor(
    private readonly esp32AttendanceService: Esp32AttendanceService,
  ) {}

  @Post('record')
  async recordAttendance(@Body() body: any) {
    // Convertir a clase y validar
    const dto = plainToInstance(Esp32AttendanceDto, body);
    const errors = await validate(dto);

    if (errors.length > 0) {
      return {
        success: false,
        message: 'Datos inválidos. Verifica email, classGroupId y timestamp.',
      };
    }

    try {
      const result = await this.esp32AttendanceService.recordAttendance(dto);
      return {
        success: true,
        message: result.message,
      };
    } catch (error) {
      return {
        success: false,
        message: error.message || 'Error al registrar asistencia.',
      };
    }
  }
}
