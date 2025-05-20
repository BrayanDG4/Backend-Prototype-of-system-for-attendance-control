import { Module } from '@nestjs/common';
import { AttendanceService } from '../../services/attendance/attendance.service';
import { AttendanceController } from '../../controllers/attendance/attendance.controller';
import { AttendanceTaskService } from '../../services/attendance/attendance-task.service';
import { PrismaModule } from '../../../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [AttendanceController],
  providers: [AttendanceService, AttendanceTaskService],
  exports: [AttendanceService],
})
export class AttendanceModule {}
