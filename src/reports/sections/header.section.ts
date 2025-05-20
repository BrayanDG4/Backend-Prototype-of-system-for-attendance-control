// reports/sections/header.section.ts
import { Content } from 'pdfmake/interfaces';

export const reportHeader = (groupName: string): Content => ({
  columns: [
    {
      image: 'src/assets/logo.png',
      width: 80,
      margin: [0, 5, 30, 0], // Más espacio a la derecha del logo
    },
    {
      stack: [
        {
          text: 'Reporte de Asistencia',
          style: 'header',
          margin: [0, 0, 0, 8], // Aumentar espacio bajo el título
          alignment: 'left',
        },
        {
          text: groupName || 'Grupo sin nombre',
          style: 'subheader',
          margin: [0, 0, 0, 10], // Más espacio entre nombre y fecha
          alignment: 'left',
        },
        {
          text: `Generado: ${new Date().toLocaleDateString()}`,
          style: 'date',
          margin: [0, 5, 0, 0], // Espacio superior para separar de línea
          alignment: 'left',
        },
      ],
      margin: [0, 5, 0, 0], // Ajuste general del stack
    },
  ],
  margin: [40, 20, 40, 25], // [left, top, right, bottom]
  columnGap: 10, // Espacio entre columnas
});
