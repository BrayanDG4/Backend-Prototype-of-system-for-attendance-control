import {
  Controller,
  Post,
  Patch,
  Get,
  Body,
  Param,
  HttpException,
} from '@nestjs/common';
import { UserService } from '../../services/user/user.service';

@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Post('create-teacher')
  async createTeacher(@Body() body: any) {
    return await this.userService.createTeacher(body);
  }

  @Post('create-student')
  async createStudent(@Body() body: any) {
    return await this.userService.createStudent(body);
  }

  @Get(':id/profile')
  async getUserProfile(@Param('id') userId: string) {
    try {
      return await this.userService.getUserProfile(userId);
    } catch (error) {
      throw new HttpException(error.message, error.status || 500);
    }
  }

  @Patch(':id/profile')
  async updateUserProfile(
    @Param('id') userId: string,
    @Body()
    body: {
      name?: string;
      email?: string;
      phone?: string;
      address?: string;
      profileImage?: string;
    },
  ) {
    try {
      return await this.userService.updateUserProfile(userId, body);
    } catch (error) {
      throw new HttpException(error.message, error.status || 500);
    }
  }

  @Get(':id/is-profile-complete')
  async isProfileComplete(@Param('id') userId: string) {
    try {
      const isComplete = await this.userService.isProfileComplete(userId);
      return { isProfileComplete: isComplete };
    } catch (error) {
      throw new HttpException(error.message, error.status || 500);
    }
  }
}
