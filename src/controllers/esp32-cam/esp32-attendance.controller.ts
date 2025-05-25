// src/controllers/esp32-cam/esp32-attendance.controller.ts
import { Controller, Post, Body } from '@nestjs/common';
import { Esp32AttendanceService } from 'src/services/esp32-cam/esp32-attendance.service';

@Controller('esp32-attendance')
export class Esp32AttendanceController {
  constructor(
    private readonly esp32AttendanceService: Esp32AttendanceService,
  ) {}

  @Post('record')
  async record(@Body() body: { tokenId: string }) {
    const tokenId = body.tokenId?.trim();

    if (!tokenId || tokenId.length < 8) {
      return {
        success: false,
        message: '❌ Token inválido o malformado.',
      };
    }

    try {
      const result =
        await this.esp32AttendanceService.validateAndRecordFromToken(tokenId);
      return {
        success: true,
        message: result.message,
      };
    } catch (error) {
      return {
        success: false,
        message: error.message || '❌ Error al registrar asistencia.',
      };
    }
  }
}
