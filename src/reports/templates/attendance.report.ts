// src/reports/templates/attendance.report.ts
import { TDocumentDefinitions } from 'pdfmake/interfaces';
import { reportHeader } from '../sections/header.section';
import { reportFooter } from '../sections/footer.section';
import { TABLE_STYLES } from '../helpers/table-styles.helper';
import {
  generateAttendanceChart,
  generateComparisonChart,
  generateGenderChart,
} from '../sections/charts.section';
import {
  calculateGenderDistribution,
  generateAttendanceComparison,
} from '../helpers/attendance-calculations.helper';

export const attendanceReport = async (
  groupData: any,
  attendanceData: any[],
  startDate: string,
  endDate: string,
  trendData: any,
): Promise<TDocumentDefinitions> => {
  const [chartSection, genderChart, comparisonChart] = await Promise.all([
    generateAttendanceChart(trendData),
    generateGenderChart(calculateGenderDistribution(groupData.students)),
    generateComparisonChart(generateAttendanceComparison(attendanceData)),
  ]);

  const formatDate = (dateString: string) => {
    // Convertir fecha ISO a componentes UTC
    const [year, month, day] = dateString.split('-').map(Number);
    const utcDate = new Date(Date.UTC(year, month - 1, day));

    return utcDate.toLocaleDateString('es-ES', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      timeZone: 'UTC', // Forzar uso de zona horaria UTC
    });
  };

  return {
    pageMargins: [40, 120, 40, 80],
    header: reportHeader(groupData.name),
    footer: reportFooter,
    content: [
      // Sección 1: Resumen General
      {
        text: 'Resumen del Período',
        style: 'sectionTitle',
        margin: [0, 0, 0, 10],
      },
      {
        columns: [
          {
            text: `Total Estudiantes: ${groupData.totalStudents}`,
            style: 'summaryText',
          },
          {
            text: `Período: ${formatDate(startDate)} - ${formatDate(endDate)}`,
            style: 'summaryText',
            alignment: 'right',
          },
        ],
        margin: [0, 0, 0, 15],
      },

      // Sección 2: Tabla Detallada
      {
        table: {
          widths: ['*', 'auto', 'auto', 'auto'],
          body: [
            [
              { text: 'Estudiante', ...TABLE_STYLES.header },
              { text: 'Asistencias', ...TABLE_STYLES.header },
              { text: 'Inasistencias', ...TABLE_STYLES.header },
              { text: '% Asistencia', ...TABLE_STYLES.header },
            ],
            ...attendanceData.map((student, index) => [
              { text: student.name, style: 'cell' },
              { text: student.present, style: 'cell' },
              { text: student.absent, style: 'cell' },
              {
                text: `${((student.present / (student.present + student.absent)) * 100).toFixed(1)}%`,
                style: 'percentage',
                fillColor: index % 2 === 0 ? '#f8f9fa' : '#ffffff',
              },
            ]),
          ],
        },
        layout: TABLE_STYLES.layout,
      },

      // Nueva Sección 3: Gráficos de Género
      {
        text: 'Distribución por Género',
        style: 'sectionTitle',
        margin: [0, 20, 0, 10],
      },
      genderChart,
      // Sección 4: Gráfico de Tendencia (existente)
      {
        text: 'Tendencia de Asistencia Semanal',
        style: 'sectionTitle',
        pageBreak: 'before',
        margin: [0, 20, 0, 10],
      },
      chartSection,
      // Nueva Sección 5: Comparación Asistencia/Inasistencia
      {
        text: 'Comparación Individual',
        style: 'sectionTitle',
        pageBreak: 'before',
        margin: [0, 20, 0, 10],
      },
      comparisonChart,
    ],
    styles: {
      header: { fontSize: 22, bold: true, color: '#2c3e50' },
      subheader: { fontSize: 14, color: '#7f8c8d', margin: [0, 5] },
      date: { fontSize: 10, color: '#95a5a6' },
      sectionTitle: { fontSize: 16, bold: true, color: '#3498db' },
      summaryText: { fontSize: 10, color: '#2c3e50' },
      cell: { fontSize: 9, margin: [0, 5] },
      percentage: { fontSize: 9, bold: true, alignment: 'center' },
      footerText: {
        fontSize: 8,
        color: '#95a5a6',
        alignment: 'right',
      },
    },
  };
};
