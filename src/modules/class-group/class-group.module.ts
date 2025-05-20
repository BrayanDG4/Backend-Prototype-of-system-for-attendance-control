import { Module } from '@nestjs/common';
import { ClassGroupService } from '../../services/class-group/class-group.service';
import { ClassGroupController } from '../../controllers/class-group/class-group.controller';
import { PrismaModule } from '../../../prisma/prisma.module';
import { PdfModule } from '../pdf/printer.module';
import { AttendanceModule } from '../attendance/attendance.module';

@Module({
  imports: [PrismaModule, PdfModule, AttendanceModule],
  controllers: [ClassGroupController],
  providers: [ClassGroupService],
})
export class ClassGroupModule {}
