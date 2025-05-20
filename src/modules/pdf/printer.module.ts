// src/modules/pdf/pdf.module.ts
import { Module } from '@nestjs/common';
import { PrinterService } from '../../services/pdf/printer.service';

@Module({
  providers: [PrinterService],
  exports: [PrinterService],
})
export class PdfModule {}
