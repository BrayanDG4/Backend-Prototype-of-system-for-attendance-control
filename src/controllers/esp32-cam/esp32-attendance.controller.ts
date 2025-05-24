import { Controller, Post, Body } from '@nestjs/common';
import { Esp32AttendanceService } from 'src/services/esp32-cam/esp32-attendance.service';
import { verifyQRToken } from 'src/helpers/jwt-qr.helper';

@Controller('esp32-attendance')
export class Esp32AttendanceController {
  constructor(
    private readonly esp32AttendanceService: Esp32AttendanceService,
  ) {}

  @Post('record')
  async recordAttendance(@Body() body: { tokenString: string }) {
    const raw = body.tokenString?.trim();

    if (!raw || !raw.includes('T')) {
      return {
        success: false,
        message: '❌ El formato del código QR no es válido.',
      };
    }

    try {
      // ✅ EXTRAER CAMPOS
      const email = extractField(raw, 'C', 'G')?.replace('arrob', '@');
      const classGroupId = extractField(raw, 'G', 'F');
      const timestamp = extractField(raw, 'F', 'T');
      const token = extractField(raw, 'T');

      if (!email || !classGroupId || !timestamp || !token) {
        return {
          success: false,
          message: '❌ Faltan campos en el QR.',
        };
      }

      const payload = verifyQRToken(token);

      if (
        payload.email !== email ||
        payload.classGroupId !== classGroupId ||
        payload.timestamp !== timestamp
      ) {
        return {
          success: false,
          message: '❌ El token del QR no coincide con los datos.',
        };
      }

      const result = await this.esp32AttendanceService.recordAttendance({
        email,
        classGroupId,
        timestamp,
      });

      return {
        success: true,
        message: result.message,
      };
    } catch (error) {
      return {
        success: false,
        message:
          error.name === 'TokenExpiredError'
            ? '❌ El código QR ha expirado.'
            : '❌ Error al verificar el token.',
      };
    }
  }
}

function extractField(
  str: string,
  startLabel: string,
  endLabel?: string,
): string | null {
  try {
    const startIndex = str.indexOf(startLabel);
    if (startIndex === -1) return null;

    const subStr = str.substring(startIndex + startLabel.length);
    if (!endLabel) return subStr;

    const endIndex = subStr.indexOf(endLabel);
    if (endIndex === -1) return null;

    return subStr.substring(0, endIndex);
  } catch {
    return null;
  }
}
