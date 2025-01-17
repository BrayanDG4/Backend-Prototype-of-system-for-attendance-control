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

  async registerAttendance(classGroupId: string, studentId: string) {
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

      const now = new Date();
      if (classGroup.attendanceEndsAt && now > classGroup.attendanceEndsAt) {
        throw new BadRequestException(
          'El tiempo para registrar la asistencia ha expirado.',
        );
      }

      const student = await this.prisma.user.findUnique({
        where: { id: studentId },
      });

      if (!student || student.role !== 'student') {
        throw new BadRequestException(
          'Usuario no válido o no es un estudiante.',
        );
      }

      // Validar si el estudiante ya registró asistencia
      const existingAttendance = await this.prisma.attendance.findFirst({
        where: {
          userId: studentId,
          classGroupId,
        },
      });

      if (existingAttendance) {
        throw new BadRequestException('La asistencia ya fue registrada.');
      }

      // Registrar la asistencia
      return await this.prisma.attendance.create({
        data: {
          userId: studentId,
          classGroupId,
          status: 'Present',
        },
      });
    } catch (error) {
      console.error('Error registrando asistencia:', error);
      if (
        error instanceof NotFoundException ||
        error instanceof BadRequestException
      ) {
        throw error; // Propagar excepciones controladas
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
}
