// src/mail/mail.service.ts

import { Injectable } from '@nestjs/common';
import { Resend } from 'resend';

@Injectable()
export class MailService {
  private resend: Resend;

  constructor() {
    this.resend = new Resend(process.env.RESEND_API_KEY);
  }

  async sendAttendanceConfirmation(
    email: string,
    name: string,
    groupName: string,
  ) {
    const htmlContent = `
      <p>Hola <strong>${name}</strong>,</p>
      <p>Tu asistencia al grupo <strong>${groupName}</strong> ha sido registrada correctamente.</p>
      <p>Fecha: ${new Date().toLocaleString('es-CO')}</p>
      <p>Gracias por tu puntualidad.</p>
    `;

    try {
      const response = await this.resend.emails.send({
        from: 'Asistencia <notificaciones@encodev.lat>',
        to: email,
        subject: '📌 Asistencia registrada',
        html: htmlContent,
      });
      console.log('📧 Correo enviado:', response);
    } catch (error) {
      console.error('Error al enviar el correo de confirmación:', error);
    }
  }
}
