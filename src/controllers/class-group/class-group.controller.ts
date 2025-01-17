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
} from '@nestjs/common';
import { ClassGroupService } from '../../services/class-group/class-group.service';

@Controller('class-group')
export class ClassGroupController {
  constructor(private readonly classGroupService: ClassGroupService) {}

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
  async getClassGroups() {
    try {
      return await this.classGroupService.getClassGroups();
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
}
