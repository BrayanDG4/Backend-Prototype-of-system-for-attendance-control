// src/helpers/jwt-qr.helper.ts
import jwt from 'jsonwebtoken';

const SECRET_KEY = process.env.JWT_SECRET || 'qr_secret';

/**
 * Genera un token JWT válido por 10 minutos para el registro de asistencia por QR.
 */
export function generateQRToken(payload: {
  email: string;
  classGroupId: string;
  timestamp: string;
}): string {
  return jwt.sign(payload, SECRET_KEY, { expiresIn: '10m' });
}

/**
 * Verifica y decodifica un token QR JWT.
 */
export function verifyQRToken(token: string): {
  email: string;
  classGroupId: string;
  timestamp: string;
} {
  return jwt.verify(token, SECRET_KEY) as {
    email: string;
    classGroupId: string;
    timestamp: string;
  };
}
