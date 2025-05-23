// src/services/qr-code/qr-code.service.ts
import { Injectable } from '@nestjs/common';
import { generateQRToken } from 'src/helpers/jwt-qr.helper';

@Injectable()
export class QRCodeService {
  generateToken(email: string, classGroupId: string) {
    const timestamp = new Date().toISOString();

    // Primero se crea el token usando los datos reales
    const token = generateQRToken({ email, classGroupId, timestamp });

    // Luego se genera el string que se usará para el QR
    const qrString = `correoA${email}°grupoA${classGroupId}°fechaA${timestamp}°firmaA${token}`;

    return { qrString };
  }
}
