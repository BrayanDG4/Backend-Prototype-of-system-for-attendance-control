// src/mail/mail.module.ts

import { Module } from '@nestjs/common';
import { MailService } from '../../services/mail/mail.service'; // Ajusta la ruta según tu estructura de carpetas

@Module({
  providers: [MailService],
  exports: [MailService],
})
export class MailModule {}
