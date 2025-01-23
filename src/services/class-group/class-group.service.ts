import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ConflictException,
  InternalServerErrorException,
} from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';

@Injectable()
export class ClassGroupService {
  constructor(private readonly prisma: PrismaService) {}

  async createClassGroup(data: any) {
    const { teacherId, schedule, accessCode, ...groupData } = data;

    try {
      // Validar que el profesor exista
      const teacher = await this.prisma.user.findUnique({
        where: { id: teacherId },
      });

      if (!teacher || teacher.role !== 'teacher') {
        throw new NotFoundException('Profesor no encontrado o no válido.');
      }

      // Verificar si el código de acceso ya existe
      const existingGroup = await this.prisma.classGroup.findUnique({
        where: { accessCode },
      });

      if (existingGroup) {
        throw new ConflictException('El código de acceso ya está en uso.');
      }

      // Validar y serializar el campo schedule
      let serializedSchedule: string;
      if (Array.isArray(schedule)) {
        // Serializar el array de schedule
        serializedSchedule = JSON.stringify(schedule);
      } else if (this.isValidJSON(schedule)) {
        // Aceptar schedule si ya es un JSON válido
        serializedSchedule = schedule;
      } else {
        // Manejar casos donde schedule es inválido o nulo
        throw new BadRequestException(
          'El formato del horario (schedule) no es válido.',
        );
      }

      // Crear el grupo de clase
      return await this.prisma.classGroup.create({
        data: {
          ...groupData,
          schedule: serializedSchedule,
          accessCode,
          teacher: { connect: { id: teacherId } },
        },
      });
    } catch (error) {
      console.error('Error al crear el grupo de clase:', error.message);
      throw new InternalServerErrorException(
        'Error al crear el grupo de clase.',
      );
    }
  }

  // Método auxiliar para validar JSON
  private isValidJSON(value: string): boolean {
    try {
      JSON.parse(value);
      return true;
    } catch {
      return false;
    }
  }

  async getClassGroups(skip: number, take: number) {
    try {
      // Obtener los grupos con paginación
      const groups = await this.prisma.classGroup.findMany({
        skip,
        take,
        include: { teacher: true },
      });

      // Contar el total de registros
      const total = await this.prisma.classGroup.count();

      // Validar y deserializar el campo schedule
      const formattedGroups = groups.map((group) => ({
        ...group,
        schedule: this.isValidJSON(group.schedule)
          ? JSON.parse(group.schedule)
          : [{ day: 'N/A', startTime: '00:00', endTime: '00:00' }],
      }));

      return { groups: formattedGroups, total };
    } catch (error) {
      console.error('Error al obtener los grupos de clase:', error.message);
      throw new InternalServerErrorException(
        'Error al obtener los grupos de clase.',
      );
    }
  }

  async getClassGroupById(id: string) {
    try {
      const classGroup = await this.prisma.classGroup.findUnique({
        where: { id },
        include: { teacher: true, students: true },
      });

      if (!classGroup) {
        throw new NotFoundException('Grupo de clase no encontrado.');
      }

      return classGroup;
    } catch (error) {
      console.error('Error al obtener el grupo de clase:', error.message);
      throw new InternalServerErrorException(
        'Error al obtener el grupo de clase.',
      );
    }
  }

  async deleteClassGroup(id: string) {
    try {
      return await this.prisma.classGroup.delete({ where: { id } });
    } catch (error) {
      console.error('Error al eliminar el grupo de clase:', error.message);
      throw new InternalServerErrorException(
        'Error al eliminar el grupo de clase.',
      );
    }
  }

  async enrollStudent(accessCode: string, studentId: string) {
    try {
      // Verificar que el grupo exista
      const classGroup = await this.prisma.classGroup.findUnique({
        where: { accessCode },
        include: { students: true },
      });

      if (!classGroup) {
        throw new NotFoundException('Grupo de clase no encontrado.');
      }

      // Verificar que el estudiante exista y tenga el rol adecuado
      const student = await this.prisma.user.findUnique({
        where: { id: studentId },
      });

      if (!student || student.role !== 'student') {
        throw new BadRequestException(
          'Usuario no válido o no es un estudiante.',
        );
      }

      // Verificar si el estudiante ya está inscrito en el grupo
      const alreadyEnrolled = classGroup.students.some(
        (s) => s.id === studentId,
      );

      if (alreadyEnrolled) {
        throw new ConflictException(
          'El estudiante ya está inscrito en este grupo.',
        );
      }

      // Agregar estudiante al grupo
      await this.prisma.classGroup.update({
        where: { id: classGroup.id },
        data: {
          students: {
            connect: { id: studentId },
          },
        },
      });

      return {
        message: 'Estudiante matriculado correctamente.',
        classGroupId: classGroup.id,
      };
    } catch (error) {
      console.error('Error al matricular al estudiante:', error.message);

      if (
        error instanceof NotFoundException ||
        error instanceof BadRequestException ||
        error instanceof ConflictException
      ) {
        throw error;
      }

      throw new InternalServerErrorException(
        'Error al matricular al estudiante. Por favor, inténtelo de nuevo.',
      );
    }
  }

  async getEnrolledGroups(studentId: string) {
    try {
      const student = await this.prisma.user.findUnique({
        where: { id: studentId },
        include: { classGroups: true },
      });

      if (!student || student.role !== 'student') {
        throw new BadRequestException(
          'Usuario no válido o no es un estudiante.',
        );
      }

      return student.classGroups;
    } catch (error) {
      console.error(
        'Error al obtener los grupos inscritos del estudiante:',
        error.message,
      );
      throw new InternalServerErrorException(
        'Error al obtener los grupos inscritos.',
      );
    }
  }

  async getStudentsInClassGroup(classGroupId: string) {
    try {
      const classGroup = await this.prisma.classGroup.findUnique({
        where: { id: classGroupId },
        include: { students: true },
      });

      if (!classGroup) {
        throw new NotFoundException('Grupo de clase no encontrado.');
      }

      return classGroup.students.map((student) => ({
        id: student.id,
        name: student.name,
        email: student.email,
      }));
    } catch (error) {
      console.error(
        'Error al obtener los estudiantes del grupo de clase:',
        error.message,
      );
      throw new InternalServerErrorException(
        'Error al obtener los estudiantes del grupo de clase.',
      );
    }
  }

  async enableAttendance(classGroupId: string, duration: number) {
    try {
      const classGroup = await this.prisma.classGroup.findUnique({
        where: { id: classGroupId },
      });

      if (!classGroup) {
        throw new NotFoundException('Grupo de clase no encontrado.');
      }

      const attendanceEndsAt = new Date();
      attendanceEndsAt.setMinutes(attendanceEndsAt.getMinutes() + duration);

      return await this.prisma.classGroup.update({
        where: { id: classGroupId },
        data: {
          attendanceEnabled: true,
          attendanceEndsAt,
        },
      });
    } catch (error) {
      console.error(
        'Error al habilitar la asistencia para el grupo de clase:',
        error.message,
      );
      throw new InternalServerErrorException(
        'Error al habilitar la asistencia. Por favor, inténtelo de nuevo.',
      );
    }
  }

  async updateClassGroup(id: string, data: any) {
    const { schedule, ...updateData } = data;

    try {
      // Verificar si el grupo existe
      const existingGroup = await this.prisma.classGroup.findUnique({
        where: { id },
      });

      if (!existingGroup) {
        throw new NotFoundException('Grupo de clase no encontrado.');
      }

      // Serializar el horario si se proporciona
      if (schedule) {
        updateData.schedule = JSON.stringify(schedule);
      }

      // Actualizar el grupo de clase
      return await this.prisma.classGroup.update({
        where: { id },
        data: updateData,
      });
    } catch (error) {
      console.error('Error al actualizar el grupo de clase:', error.message);
      throw new InternalServerErrorException(
        'Error al actualizar el grupo de clase.',
      );
    }
  }
  async getTeacherClassGroupsWithAttendance(teacherId: string) {
    try {
      // Verificar si el profesor existe
      const teacher = await this.prisma.user.findUnique({
        where: { id: teacherId },
        include: { teachingGroup: true },
      });

      if (!teacher || teacher.role !== 'teacher') {
        throw new NotFoundException('Profesor no encontrado o no válido.');
      }

      // Obtener los grupos de clase que enseña el profesor
      const classGroups = await this.prisma.classGroup.findMany({
        where: { teacherId },
        include: {
          students: true, // Estudiantes inscritos en el grupo
          attendances: {
            include: { user: true }, // Relación con los estudiantes y sus datos
          },
        },
      });

      // Formatear los datos
      return classGroups.map((group) => ({
        id: group.id,
        name: group.name,
        students: group.students.map((student) => ({
          id: student.id,
          name: student.name,
          email: student.email,
        })),
        attendance: group.attendances.map((attendance) => ({
          studentName: attendance.user.name,
          studentEmail: attendance.user.email,
          attendedAt: attendance.attendedAt,
          status: attendance.status,
        })),
      }));
    } catch (error) {
      console.error(
        'Error al obtener los grupos de clase y asistencias del profesor:',
        error.message,
      );
      throw new InternalServerErrorException(
        'Error inesperado al obtener los grupos de clase y asistencias. Por favor, inténtelo de nuevo.',
      );
    }
  }
}
