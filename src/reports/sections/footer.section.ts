import { Content } from 'pdfmake/interfaces';

export const reportFooter = (
  currentPage: number,
  pageCount: number,
): Content => ({
  margin: [40, 20, 40, 0],
  columns: [
    {
      text: `Página ${currentPage} de ${pageCount}`,
      alignment: 'right',
      style: 'footerText', // Cambiar a nuevo nombre de estilo
    },
  ],
});
