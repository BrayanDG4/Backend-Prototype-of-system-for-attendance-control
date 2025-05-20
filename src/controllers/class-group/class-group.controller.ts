import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  Patch,
  HttpException,
  HttpCode,
  HttpStatus,
  Query,
  Res,
  NotFoundException,
} from '@nestjs/common';
import { ClassGroupService } from '../../services/class-group/class-group.service';
import { PrinterService } from 'src/services/pdf/printer.service';
import { ReportParamsDto } from '../../dto/report-params.dto';
import { Response } from 'express';
import { attendanceReport } from '../../reports/templates/attendance.report';
import { calculateAttendanceStats } from '../../reports/helpers/attendance-calculations.helper';
import { generateWeeklyTrend } from '../../reports/helpers/attendance-calculations.helper';
import { AttendanceService } from 'src/services/attendance/attendance.service';

@Controller('class-group')
export class ClassGroupController {
  constructor(
    private readonly classGroupService: ClassGroupService,
    private readonly attendanceService: AttendanceService,
    private readonly printerService: PrinterService,
  ) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async createClassGroup(@Body() body: any) {
    try {
      return await this.classGroupService.createClassGroup(body);
    } catch (error) {
      throw new HttpException(
        error.message,
        error.status || HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Get()
  async getClassGroups(
    @Query('skip') skip: string,
    @Query('take') take: string,
  ) {
    try {
      const skipValue = parseInt(skip, 10) || 0;
      const takeValue = parseInt(take, 10) || 5;
      return await this.classGroupService.getClassGroups(skipValue, takeValue);
    } catch (error) {
      throw new HttpException(
        error.message,
        error.status || HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Get(':id')
  async getClassGroupById(@Param('id') id: string) {
    try {
      return await this.classGroupService.getClassGroupById(id);
    } catch (error) {
      throw new HttpException(
        error.message,
        error.status || HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteClassGroup(@Param('id') id: string) {
    try {
      await this.classGroupService.deleteClassGroup(id);
    } catch (error) {
      throw new HttpException(
        error.message,
        error.status || HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Patch('enroll')
  async enrollStudent(@Body() body: { accessCode: string; studentId: string }) {
    try {
      const { accessCode, studentId } = body;

      if (!accessCode || !studentId) {
        throw new HttpException(
          'El código de acceso y el ID del estudiante son obligatorios.',
          HttpStatus.BAD_REQUEST,
        );
      }

      return await this.classGroupService.enrollStudent(accessCode, studentId);
    } catch (error) {
      throw new HttpException(
        error.message,
        error.status || HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Get('enrolled/:studentId')
  async getEnrolledGroups(@Param('studentId') studentId: string) {
    try {
      return await this.classGroupService.getEnrolledGroups(studentId);
    } catch (error) {
      throw new HttpException(
        error.message,
        error.status || HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Get(':id/students')
  async getStudentsInClassGroup(@Param('id') classGroupId: string) {
    try {
      return await this.classGroupService.getStudentsInClassGroup(classGroupId);
    } catch (error) {
      throw new HttpException(
        error.message,
        error.status || HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Patch(':id/attendance')
  async enableAttendance(
    @Param('id') classGroupId: string,
    @Body() body: { duration: number },
  ) {
    try {
      return await this.classGroupService.enableAttendance(
        classGroupId,
        body.duration,
      );
    } catch (error) {
      throw new HttpException(
        error.message,
        error.status || HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Patch(':id')
  @HttpCode(HttpStatus.OK)
  async updateClassGroup(@Param('id') id: string, @Body() body: any) {
    try {
      return await this.classGroupService.updateClassGroup(id, body);
    } catch (error) {
      throw new HttpException(
        error.message,
        error.status || HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Get('teacher/:teacherId/attendance')
  async getTeacherClassGroupsWithAttendance(
    @Param('teacherId') teacherId: string,
  ) {
    try {
      return await this.classGroupService.getTeacherClassGroupsWithAttendance(
        teacherId,
      );
    } catch (error) {
      throw new HttpException(
        error.message,
        error.status || HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  // class-group.controller.ts
  @Get(':id/report')
  async generateAttendanceReport(
    @Param('id') classGroupId: string,
    @Query() { startDate, endDate }: ReportParamsDto,
    @Res() res: Response,
  ) {
    try {
      // Convertir fechas a UTC desde el string recibido
      const start = new Date(startDate);
      const end = new Date(endDate);

      const utcStart = new Date(
        Date.UTC(
          start.getUTCFullYear(),
          start.getUTCMonth(),
          start.getUTCDate(),
        ),
      );

      const utcEnd = new Date(
        Date.UTC(
          end.getUTCFullYear(),
          end.getUTCMonth(),
          end.getUTCDate(),
          23,
          59,
          59,
          999,
        ),
      );

      // Usar las fechas UTC en los servicios
      const [groupData, rawAttendanceData] = await Promise.all([
        this.classGroupService.getReportData(classGroupId, utcStart, utcEnd),
        this.attendanceService.getByDateRange(classGroupId, utcStart, utcEnd),
      ]);

      if (!rawAttendanceData.length) {
        throw new NotFoundException(
          'No se encontraron registros de asistencia',
        );
      }

      // Procesar datos con manejo seguro
      const processedData = calculateAttendanceStats(rawAttendanceData);
      const trendData = generateWeeklyTrend(rawAttendanceData);

      // Generar PDF con timeout
      const pdfDoc = this.printerService.createPdf(
        await attendanceReport(
          groupData,
          processedData,
          startDate,
          endDate,
          trendData,
        ),
      );

      // Configurar headers después de validaciones
      res.set({
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename=reporte-${classGroupId}.pdf`,
      });

      pdfDoc.pipe(res);
      pdfDoc.end();
    } catch (error) {
      console.error('Error detallado:', error); // Log detallado
      const status = error.status || 500;
      const message =
        status === 500 ? 'Error interno del servidor' : error.message;

      res.status(status).json({
        statusCode: status,
        message: message,
        details: status === 500 ? null : error.response || null,
      });
    }
  }
}
