import { Injectable } from '@nestjs/common';
import { generateQRToken } from 'src/helpers/jwt-qr.helper';

@Injectable()
export class QRCodeService {
  generateToken(email: string, classGroupId: string) {
    const timestamp = new Date().toISOString();

    const token = generateQRToken({ email, classGroupId, timestamp });

    // ✅ Nuevo formato para el lector GM66
    const qrString = `C${email}G${classGroupId}F${timestamp}T${token}`;

    return { qrString };
  }
}
