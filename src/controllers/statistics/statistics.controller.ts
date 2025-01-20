// src/controllers/statistics/statistics.controller.ts
import { Controller, Get, Param } from '@nestjs/common';
import { StatisticsService } from '../../services/statistics/statistics.service';

@Controller('statistics')
export class StatisticsController {
  constructor(private readonly statisticsService: StatisticsService) {}

  @Get('admin')
  async getAdminStatistics() {
    return await this.statisticsService.getAdminStatistics();
  }

  @Get('teacher/:teacherId')
  async getTeacherStatistics(@Param('teacherId') teacherId: string) {
    return await this.statisticsService.getTeacherStatistics(teacherId);
  }

  @Get('student/:studentId')
  async getStudentStatistics(@Param('studentId') studentId: string) {
    return await this.statisticsService.getStudentStatistics(studentId);
  }
}
