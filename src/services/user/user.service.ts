import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';

@Injectable()
export class UserService {
  constructor(private readonly prisma: PrismaService) {}

  async createTeacher(data: any) {
    return await this.prisma.user.create({
      data: {
        ...data,
        role: 'teacher', // Aseguramos que el rol sea 'teacher'
      },
    });
  }

  async createStudent(data: any) {
    return await this.prisma.user.create({
      data: {
        ...data,
        role: 'student', // Aseguramos que el rol sea 'student'
      },
    });
  }

  async getUserProfile(userId: string) {
    try {
      const user = await this.prisma.user.findUnique({
        where: { id: userId },
      });

      if (!user) {
        throw new NotFoundException('Usuario no encontrado.');
      }

      return {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      };
    } catch {
      throw new BadRequestException(
        'Error al obtener el perfil del usuario. Verifique los datos proporcionados.',
      );
    }
  }

  async updateUserProfile(
    userId: string,
    data: { name?: string; email?: string; extraData?: any },
  ) {
    try {
      const user = await this.prisma.user.findUnique({
        where: { id: userId },
      });

      if (!user) {
        throw new NotFoundException('Usuario no encontrado.');
      }

      if (!data.name && !data.email && !data.extraData) {
        throw new BadRequestException(
          'Se requiere al menos un campo para actualizar.',
        );
      }

      return await this.prisma.user.update({
        where: { id: userId },
        data,
      });
    } catch {
      throw new BadRequestException(
        'Error al actualizar el perfil del usuario. Verifique los datos proporcionados.',
      );
    }
  }
}
