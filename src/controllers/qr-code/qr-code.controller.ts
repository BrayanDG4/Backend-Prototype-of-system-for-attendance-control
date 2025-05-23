// src/controllers/qr-code/qr-code.controller.ts
import { Controller, Post, Body } from '@nestjs/common';
import { QRCodeService } from 'src/services/qr-code/qr-code.service';

@Controller('qr')
export class QRCodeController {
  constructor(private readonly qrCodeService: QRCodeService) {}

  @Post('generate')
  generateToken(@Body() body: { email: string; classGroupId: string }) {
    return this.qrCodeService.generateToken(body.email, body.classGroupId);
  }
}
