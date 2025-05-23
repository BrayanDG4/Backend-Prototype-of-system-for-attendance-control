// src/controllers/esp32-cam/esp32-attendance.controller.ts
import { Controller, Post, Body } from '@nestjs/common';
import { Esp32AttendanceService } from 'src/services/esp32-cam/esp32-attendance.service';
import { Esp32AttendanceDto } from 'src/dto/esp32-attendance.dto';
import { validate } from 'class-validator';
import { plainToInstance } from 'class-transformer';
import { verifyQRToken } from 'src/helpers/jwt-qr.helper';

@Controller('esp32-attendance')
export class Esp32AttendanceController {
  constructor(
    private readonly esp32AttendanceService: Esp32AttendanceService,
  ) {}

  @Post('record')
  async recordAttendance(@Body() body: any) {
    const dto = plainToInstance(Esp32AttendanceDto, body);
    const errors = await validate(dto);

    if (errors.length > 0) {
      return {
        success: false,
        message: '❌ El token del QR es inválido o no fue enviado.',
      };
    }

    try {
      // ✅ Verificar token JWT (firmaA)
      const payload = verifyQRToken(dto.token);

      // ✅ Validación extra opcional (ej. expiración, etc.)
      if (
        !payload ||
        !payload.email ||
        !payload.classGroupId ||
        !payload.timestamp
      ) {
        return {
          success: false,
          message: '❌ Token inválido o incompleto.',
        };
      }

      // ✅ Pasar datos verificados al servicio
      const result = await this.esp32AttendanceService.recordAttendance({
        email: payload.email,
        classGroupId: payload.classGroupId,
        timestamp: payload.timestamp,
      });

      return { success: true, message: result.message };
    } catch (error) {
      return {
        success: false,
        message:
          error.name === 'TokenExpiredError'
            ? '❌ El código QR ha expirado.'
            : '❌ Error al verificar el código QR.',
      };
    }
  }
}
