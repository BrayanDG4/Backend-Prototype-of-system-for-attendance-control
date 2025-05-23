// src/reports/sections/header.section.ts
import { Content } from 'pdfmake/interfaces';
import QRCode from 'qrcode';

export const reportHeader = async (
  groupName: string,
  projectUrl = 'http://localhost:3000',
): Promise<Content> => {
  const qrImage = await QRCode.toDataURL(projectUrl);

  return {
    columns: [
      {
        image: 'src/assets/logo.png',
        width: 80,
        margin: [0, 5, 30, 0],
      },
      {
        stack: [
          {
            text: 'Reporte de Asistencia',
            style: 'header',
            margin: [0, 0, 0, 8],
            alignment: 'left',
          },
          {
            text: groupName || 'Grupo sin nombre',
            style: 'subheader',
            margin: [0, 0, 0, 10],
            alignment: 'left',
          },
          {
            text: `Generado: ${new Date().toLocaleDateString('es-CO')}`,
            style: 'date',
            margin: [0, 5, 0, 0],
            alignment: 'left',
          },
        ],
        margin: [0, 5, 0, 0],
      },
      {
        image: qrImage,
        width: 100,
        alignment: 'right',
        margin: [0, 0, 0, 0],
      },
    ],
    margin: [40, 20, 40, 25],
    columnGap: 10,
  };
};
