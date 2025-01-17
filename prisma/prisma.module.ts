import { Global, Module } from '@nestjs/common';
import { PrismaService } from './prisma.service';

@Global() // Este decorador hace que PrismaService esté disponible globalmente
@Module({
  providers: [PrismaService],
  exports: [PrismaService], // Exporta el PrismaService para que otros módulos lo puedan usar
})
export class PrismaModule {}
