// src/modules/statistics/statistics.module.ts
import { Module } from '@nestjs/common';
import { StatisticsService } from '../../services/statistics/statistics.service';
import { StatisticsController } from '../../controllers/statistics/statistics.controller';
import { PrismaModule } from '../../../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [StatisticsController],
  providers: [StatisticsService],
})
export class StatisticsModule {}
