import { Module } from '@nestjs/common';
import { ClassGroupService } from '../../services/class-group/class-group.service';
import { ClassGroupController } from '../../controllers/class-group/class-group.controller';
import { PrismaModule } from '../../../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [ClassGroupController],
  providers: [ClassGroupService],
})
export class ClassGroupModule {}
