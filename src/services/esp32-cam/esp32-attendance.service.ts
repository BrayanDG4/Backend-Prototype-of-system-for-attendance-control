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

  async validateAndRecordFromToken(
    tokenId: string,
  ): Promise<{ success: boolean; message: string }> {
    const token = await this.prisma.qrToken.findUnique({
      where: { id: tokenId },
    });

    if (!token) {
      throw new BadRequestException('❌ Token inválido o no registrado.');
    }

    const now = new Date();
    if (now > token.expiresAt) {
      throw new BadRequestException('❌ El token ha expirado.');
    }

    return this.recordAttendance({
      email: token.email,
      classGroupId: token.classGroupId,
      timestamp: token.timestamp.toISOString(),
    });
  }

  async recordAttendance(data: {
    email: string;
    classGroupId: string;
    timestamp: string;
  }): Promise<{ success: boolean; message: string }> {
    const { email, classGroupId, timestamp } = data;

    // 1️⃣ Verificar que el grupo existe
    const classGroup = await this.prisma.classGroup.findUnique({
      where: { id: classGroupId },
    });

    if (!classGroup) {
      throw new NotFoundException('Grupo de clase no encontrado.');
    }

    // 2️⃣ Verificar si la asistencia está habilitada
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

    // 3️⃣ Verificar si el estudiante pertenece al grupo
    const student = await this.prisma.user.findUnique({
      where: { email },
      include: { classGroups: true },
    });

    if (!student || !student.classGroups.some((g) => g.id === classGroupId)) {
      throw new BadRequestException('El estudiante no pertenece a este grupo.');
    }

    // 4️⃣ Validar que no haya asistencia ya registrada ese día
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

    // 5️⃣ Registrar asistencia
    await this.prisma.attendance.create({
      data: {
        userId: student.id,
        classGroupId,
        attendedAt: scannedDate,
        status: 'Present',
      },
    });

    return {
      success: true,
      message: 'Asistencia registrada con éxito.',
    };
  }
}
