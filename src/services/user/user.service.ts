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

  async createStudent(data: { userId: string; email: string }) {
    const { userId, email } = data;

    // Verificar si el usuario ya existe
    const existingUser = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (existingUser) {
      console.log(`El usuario con ID ${userId} ya existe.`);
      return { message: 'Usuario ya registrado.' };
    }

    // Crear un nuevo usuario
    await this.prisma.user.create({
      data: {
        id: userId,
        email,
        name: 'Sin Nombre', // Asignar un valor por defecto
        role: 'student', // Por defecto es estudiante
      },
    });

    console.log(`Usuario con ID ${userId} creado correctamente.`);
    return { message: 'Usuario creado correctamente.' };
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
        phone: user.phone,
        address: user.address,
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
    data: {
      name?: string;
      email?: string;
      phone?: string;
      address?: string;
      profileImage?: string;
    },
  ) {
    try {
      const user = await this.prisma.user.findUnique({
        where: { id: userId },
      });

      if (!user) {
        throw new NotFoundException('Usuario no encontrado.');
      }

      if (
        !data.name &&
        !data.email &&
        !data.phone &&
        !data.address &&
        !data.profileImage
      ) {
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

  async isProfileComplete(userId: string): Promise<boolean> {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundException('Usuario no encontrado.');
    }

    // Verifica que los campos obligatorios estén llenos
    return !!(user.name && user.email && user.phone && user.address);
  }
}
