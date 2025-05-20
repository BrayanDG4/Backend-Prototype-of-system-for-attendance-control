import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ConflictException,
} from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';

@Injectable()
export class Esp32AttendanceService {
  constructor(private readonly prisma: PrismaService) {}

  async recordAttendance(data: {
    email: string;
    classGroupId: string;
    timestamp: string;
  }) {
    const { email, classGroupId, timestamp } = data;

    // 🔍 Verificar que el grupo existe
    const classGroup = await this.prisma.classGroup.findUnique({
      where: { id: classGroupId },
    });

    if (!classGroup) {
      throw new NotFoundException('Grupo de clase no encontrado.');
    }

    // 🕒 Verificar que la asistencia está habilitada y vigente
    const now = new Date();
    if (
      !classGroup.attendanceEnabled ||
      !classGroup.attendanceEndsAt ||
      now > classGroup.attendanceEndsAt
    ) {
      throw new BadRequestException(
        'La asistencia no está habilitada para este grupo.',
      );
    }

    // 🧑‍🎓 Buscar al estudiante y validar pertenencia al grupo
    const student = await this.prisma.user.findUnique({
      where: { email },
      include: { classGroups: true },
    });

    if (!student || !student.classGroups.some((g) => g.id === classGroupId)) {
      throw new BadRequestException('El estudiante no pertenece a este grupo.');
    }

    // 📅 Usar la fecha del QR escaneado para evitar duplicados del mismo día
    const scannedDate = new Date(timestamp);
    const dayStart = new Date(scannedDate);
    dayStart.setHours(0, 0, 0, 0);

    const dayEnd = new Date(scannedDate);
    dayEnd.setHours(23, 59, 59, 999);

    const existingAttendance = await this.prisma.attendance.findFirst({
      where: {
        userId: student.id,
        classGroupId,
        attendedAt: {
          gte: dayStart,
          lte: dayEnd,
        },
      },
    });

    if (existingAttendance) {
      throw new ConflictException(
        'Ya se ha registrado la asistencia para este estudiante ese día.',
      );
    }

    // ✅ Registrar la asistencia
    await this.prisma.attendance.create({
      data: {
        userId: student.id,
        classGroupId,
        attendedAt: scannedDate,
        status: 'Present',
      },
    });

    return { success: true, message: 'Asistencia registrada con éxito.' };
  }
}
