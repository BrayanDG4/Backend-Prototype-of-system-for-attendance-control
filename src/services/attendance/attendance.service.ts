import {
  Injectable,
  NotFoundException,
  BadRequestException,
  InternalServerErrorException,
} from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';

@Injectable()
export class AttendanceService {
  constructor(private readonly prisma: PrismaService) {}

  async registerAttendance(
    classGroupId: string,
    studentId: string,
    date: string,
  ) {
    try {
      const classGroup = await this.prisma.classGroup.findUnique({
        where: { id: classGroupId },
      });

      if (!classGroup) {
        throw new NotFoundException('Grupo de clase no encontrado.');
      }

      if (!classGroup.attendanceEnabled) {
        throw new BadRequestException(
          'La asistencia no está habilitada para este grupo.',
        );
      }

      const attendanceDate = new Date(date);
      const startOfDay = new Date(attendanceDate.setHours(0, 0, 0, 0));
      const endOfDay = new Date(attendanceDate.setHours(23, 59, 59, 999));

      // Validar si el estudiante ya registró asistencia en el mismo día
      const existingAttendance = await this.prisma.attendance.findFirst({
        where: {
          userId: studentId,
          classGroupId,
          attendedAt: {
            gte: startOfDay,
            lte: endOfDay,
          },
        },
      });

      if (existingAttendance) {
        throw new BadRequestException(
          'La asistencia ya fue registrada para este día.',
        );
      }

      // Registrar la asistencia
      return await this.prisma.attendance.create({
        data: {
          userId: studentId,
          classGroupId,
          attendedAt: attendanceDate,
          status: 'Present',
        },
      });
    } catch (error) {
      console.error('Error registrando asistencia:', error);
      if (
        error instanceof NotFoundException ||
        error instanceof BadRequestException
      ) {
        throw error;
      }
      throw new InternalServerErrorException(
        'Error inesperado al registrar la asistencia. Por favor, inténtelo de nuevo.',
      );
    }
  }

  async getAttendanceByClassGroup(classGroupId: string) {
    try {
      const classGroup = await this.prisma.classGroup.findUnique({
        where: { id: classGroupId },
        include: { students: true },
      });

      if (!classGroup) {
        throw new NotFoundException('Grupo de clase no encontrado.');
      }

      const attendance = await this.prisma.attendance.findMany({
        where: { classGroupId },
        include: { user: true },
      });

      return {
        classGroup: classGroup.name,
        attendance: attendance.map((a) => ({
          studentName: a.user.name,
          studentEmail: a.user.email,
          attendedAt: a.attendedAt,
          status: a.status,
        })),
      };
    } catch (error) {
      console.error('Error obteniendo asistencias:', error);
      if (error instanceof NotFoundException) {
        throw error; // Propagar excepciones controladas
      }
      throw new InternalServerErrorException(
        'Error inesperado al obtener asistencias. Por favor, inténtelo de nuevo.',
      );
    }
  }

  // src/services/attendance.service.ts
  async getByDateRange(classGroupId: string, startDate: Date, endDate: Date) {
    const utcStart = new Date(startDate);
    utcStart.setUTCHours(0, 0, 0, 0);

    const utcEnd = new Date(endDate);
    utcEnd.setUTCHours(23, 59, 59, 999);

    return this.prisma.attendance.findMany({
      where: {
        classGroupId,
        attendedAt: {
          gte: utcStart,
          lte: utcEnd,
        },
      },
      include: { user: true },
    });
  }
}
