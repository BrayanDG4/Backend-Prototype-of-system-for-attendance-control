import {
  Controller,
  Post,
  Body,
  BadRequestException,
  Get,
  Param,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { AttendanceService } from '../../services/attendance/attendance.service';

@Controller('attendance')
export class AttendanceController {
  constructor(private readonly attendanceService: AttendanceService) {}

  @Post('register')
  @HttpCode(HttpStatus.CREATED) // Especificar que se retorna 201 en creación exitosa
  async registerAttendance(
    @Body() body: { classGroupId: string; studentId: string },
  ) {
    const { classGroupId, studentId } = body;

    if (!classGroupId || !studentId) {
      throw new BadRequestException(
        'Se requieren classGroupId y studentId para registrar la asistencia.',
      );
    }

    return await this.attendanceService.registerAttendance(
      classGroupId,
      studentId,
    );
  }

  @Get(':classGroupId')
  async getAttendanceByClassGroup(@Param('classGroupId') classGroupId: string) {
    if (!classGroupId) {
      throw new BadRequestException(
        'Se requiere classGroupId para obtener las asistencias.',
      );
    }

    return await this.attendanceService.getAttendanceByClassGroup(classGroupId);
  }
}
