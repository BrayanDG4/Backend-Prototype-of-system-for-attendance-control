// src/services/statistics/statistics.service.ts
import {
  Injectable,
  NotFoundException,
  InternalServerErrorException,
} from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';

@Injectable()
export class StatisticsService {
  constructor(private readonly prisma: PrismaService) {}

  // Estadísticas generales para admin
  async getAdminStatistics() {
    try {
      const totalAttendance = await this.prisma.attendance.count();
      const todayAttendance = await this.prisma.attendance.count({
        where: {
          attendedAt: {
            gte: new Date(new Date().setHours(0, 0, 0, 0)),
            lt: new Date(new Date().setHours(23, 59, 59, 999)),
          },
        },
      });
      const totalAbsences = await this.prisma.attendance.count({
        where: { status: 'Absent' },
      });

      const attendanceRate =
        totalAttendance / (totalAttendance + totalAbsences) || 0;

      return {
        totalAttendance,
        todayAttendance,
        totalAbsences,
        attendanceRate: Math.round(attendanceRate * 100),
      };
    } catch {
      throw new InternalServerErrorException(
        'Error al obtener las estadísticas generales.',
      );
    }
  }

  // Estadísticas para un profesor específico
  async getTeacherStatistics(teacherId: string) {
    // Verificar si el profesor existe y tiene el rol adecuado
    const teacher = await this.prisma.user.findUnique({
      where: { id: teacherId },
    });

    if (!teacher || teacher.role !== 'teacher') {
      throw new NotFoundException('El profesor no existe o no es válido.');
    }

    // Obtener los grupos del profesor con asistencias incluidas
    const groups = await this.prisma.classGroup.findMany({
      where: { teacherId },
      include: {
        attendances: {
          include: { user: true }, // Incluimos el usuario para los nombres en asistencias recientes
        },
      },
    });

    // Calcular estadísticas
    const totalAttendance = groups.reduce(
      (sum, group) =>
        sum + group.attendances.filter((a) => a.status === 'Present').length,
      0,
    );

    const todayAttendance = groups.reduce(
      (sum, group) =>
        sum +
        group.attendances.filter(
          (a) =>
            a.status === 'Present' &&
            a.attendedAt >= new Date(new Date().setHours(0, 0, 0, 0)),
        ).length,
      0,
    );

    const totalAbsences = groups.reduce(
      (sum, group) =>
        sum + group.attendances.filter((a) => a.status === 'Absent').length,
      0,
    );

    const attendanceRate =
      totalAttendance / (totalAttendance + totalAbsences) || 0;

    // Agrupación mensual de asistencias
    const monthlySummary = groups
      .flatMap((group) => group.attendances)
      .reduce(
        (summary, attendance) => {
          const month = attendance.attendedAt.getMonth(); // 0 = Enero, 1 = Febrero, etc.
          summary[month] = summary[month] || 0;
          if (attendance.status === 'Present') summary[month]++;
          return summary;
        },
        {} as Record<number, number>,
      );

    // Asistencias recientes (5 registros más recientes)
    const recentAttendances = groups
      .flatMap((group) =>
        group.attendances.map((a) => ({
          studentName: a.user.name,
          date: a.attendedAt,
          status: a.status,
        })),
      )
      .sort((a, b) => b.date.getTime() - a.date.getTime()) // Ordenar por fecha descendente
      .slice(0, 5);

    return {
      totalAttendance,
      todayAttendance,
      totalAbsences,
      attendanceRate: Math.round(attendanceRate * 100),
      monthlySummary,
      recentAttendances,
    };
  }

  // src/services/statistics/statistics.service.ts
  async getStudentStatistics(studentId: string) {
    try {
      // Validar si el estudiante existe y tiene el rol adecuado
      const student = await this.prisma.user.findUnique({
        where: { id: studentId },
      });

      if (!student || student.role !== 'student') {
        throw new NotFoundException('El estudiante no existe o no es válido.');
      }

      // Buscar asistencias del estudiante
      const attendances = await this.prisma.attendance.findMany({
        where: { userId: studentId },
      });

      if (attendances.length === 0) {
        return {
          totalAttendance: 0,
          totalAbsences: 0,
          attendanceRate: 0,
          weeklyStats: {},
          message: 'No se encontraron asistencias para este estudiante.',
        };
      }

      // Calcular estadísticas
      const totalAttendance = attendances.filter(
        (attendance) => attendance.status === 'Present',
      ).length;

      const totalAbsences = attendances.filter(
        (attendance) => attendance.status === 'Absent',
      ).length;

      const attendanceRate =
        totalAttendance / (totalAttendance + totalAbsences) || 0;

      const weeklyStats = attendances.reduce((stats, attendance) => {
        const week = `Semana ${Math.ceil(attendance.attendedAt.getDate() / 7)}`;
        stats[week] = stats[week] || { Present: 0, Absent: 0 };
        stats[week][attendance.status]++;
        return stats;
      }, {});

      return {
        totalAttendance,
        totalAbsences,
        attendanceRate: Math.round(attendanceRate * 100),
        weeklyStats,
      };
    } catch (error) {
      // Identificar errores conocidos
      if (error instanceof NotFoundException) {
        throw error;
      }

      // Manejo genérico para evitar caídas
      throw new InternalServerErrorException(
        'Error al obtener las estadísticas del estudiante.',
      );
    }
  }
}
