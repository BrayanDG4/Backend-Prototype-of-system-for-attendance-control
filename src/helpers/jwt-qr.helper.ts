import jwt from 'jsonwebtoken';

const SECRET_KEY = process.env.JWT_SECRET || 'qr_secret';

export function generateQRToken(payload: {
  email: string;
  classGroupId: string;
  timestamp: string;
}): string {
  const token = jwt.sign(payload, SECRET_KEY, { expiresIn: '10m' });

  // Modificación compatible con GM66
  return token.replace(/\./g, 'X').replace(/=/g, 'Z').replace(/\+/g, 'Y');
}

export function verifyQRToken(modifiedToken: string): {
  email: string;
  classGroupId: string;
  timestamp: string;
} {
  // Restaurar el JWT original antes de verificar
  const originalToken = modifiedToken
    .replace(/X/g, '.')
    .replace(/Z/g, '=')
    .replace(/Y/g, '+');

  return jwt.verify(originalToken, SECRET_KEY) as {
    email: string;
    classGroupId: string;
    timestamp: string;
  };
}
