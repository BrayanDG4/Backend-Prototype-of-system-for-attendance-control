import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaService } from '../prisma/prisma.service';
import { PrismaModule } from '../prisma/prisma.module';
import { UserModule } from './modules/user/user.module';
import { ClassGroupModule } from './modules/class-group/class-group.module';
import { AttendanceModule } from './modules/attendance/attendance.module';
import { StatisticsModule } from './modules/statistics/statistics.module';
import { Esp32AttendanceModule } from './modules/esp32-cam/esp32-attendance.module';

@Module({
  imports: [
    PrismaModule,
    UserModule,
    ClassGroupModule,
    AttendanceModule,
    StatisticsModule,
    Esp32AttendanceModule,
  ],
  controllers: [AppController],
  providers: [AppService, PrismaService],
})
export class AppModule {}
