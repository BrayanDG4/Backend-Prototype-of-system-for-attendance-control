// src/services/qr-code/qr-code.service.ts
import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';

@Injectable()
export class QRCodeService {
  constructor(private readonly prisma: PrismaService) {}

  async generateToken(email: string, classGroupId: string) {
    const timestamp = new Date();
    // const expiresAt = new Date(timestamp.getTime() + 10 * 60 * 1000); // 10 minutos
    const expiresAt = new Date(timestamp.getTime() + 7 * 24 * 60 * 60 * 1000); // 7 días

    const tokenId = (
      Math.random().toString(36).substring(2, 10) + Date.now().toString(36)
    ).slice(0, 16);

    // 💾 GUARDADO EN LA BASE DE DATOS
    await this.prisma.qrToken.create({
      data: {
        id: tokenId,
        email,
        classGroupId,
        timestamp,
        expiresAt,
      },
    });

    // 🧩 Formato final
    const qrString = `C${email}G${classGroupId}F${timestamp.toISOString()}T${tokenId}`;

    return { qrString };
  }
}
