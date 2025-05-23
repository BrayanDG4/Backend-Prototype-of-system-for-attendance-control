// src/modules/qr-code/qr-code.module.ts
import { Module } from '@nestjs/common';
import { QRCodeController } from 'src/controllers/qr-code/qr-code.controller';
import { QRCodeService } from 'src/services/qr-code/qr-code.service';

@Module({
  controllers: [QRCodeController],
  providers: [QRCodeService],
})
export class QRCodeModule {}
