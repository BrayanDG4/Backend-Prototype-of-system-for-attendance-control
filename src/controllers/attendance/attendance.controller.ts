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
  @HttpCode(HttpStatus.CREATED)
  async registerAttendance(
    @Body() body: { classGroupId: string; studentId: string; date: string },
  ) {
    const { classGroupId, studentId, date } = body;

    if (!classGroupId || !studentId || !date) {
      throw new BadRequestException(
        'Se requieren classGroupId, studentId y date para registrar la asistencia.',
      );
    }

    return await this.attendanceService.registerAttendance(
      classGroupId,
      studentId,
      date,
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
