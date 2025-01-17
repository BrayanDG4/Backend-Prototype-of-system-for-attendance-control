import { Injectable, OnModuleInit } from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';
import * as cron from 'node-cron';

@Injectable()
export class AttendanceTaskService implements OnModuleInit {
  constructor(private readonly prisma: PrismaService) {}

  onModuleInit() {
    cron.schedule('*/1 * * * *', async () => {
      try {
        const now = new Date();
        const classGroups = await this.prisma.classGroup.findMany({
          where: {
            attendanceEnabled: true,
            attendanceEndsAt: { lte: now },
          },
        });

        for (const group of classGroups) {
          await this.prisma.classGroup.update({
            where: { id: group.id },
            data: { attendanceEnabled: false },
          });

          console.log(`Asistencia deshabilitada para el grupo: ${group.name}`);
        }
      } catch (error) {
        console.error('Error en tarea de deshabilitar asistencia:', error);
      }
    });
  }
}
