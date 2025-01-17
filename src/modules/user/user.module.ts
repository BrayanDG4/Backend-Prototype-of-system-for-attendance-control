import { Module } from '@nestjs/common';
import { UserService } from '../../services/user/user.service';
import { UserController } from '../../controllers/user/user.controller';
import { PrismaModule } from '../../../prisma/prisma.module';

@Module({
  imports: [PrismaModule], // Importa el PrismaModule
  controllers: [UserController], // Registra el controlador
  providers: [UserService], // Registra el servicio
})
export class UserModule {}
