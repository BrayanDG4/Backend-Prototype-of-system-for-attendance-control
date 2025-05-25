import { Module } from '@nestjs/common';
import { PrismaModule } from '../../../prisma/prisma.module';
import { Esp32AttendanceController } from 'src/controllers/esp32-cam/esp32-attendance.controller';
import { Esp32AttendanceService } from 'src/services/esp32-cam/esp32-attendance.service';
import { MailModule } from '../../modules/mail/mail.module';

@Module({
  imports: [PrismaModule, MailModule],
  controllers: [Esp32AttendanceController],
  providers: [Esp32AttendanceService],
})
export class Esp32AttendanceModule {}
