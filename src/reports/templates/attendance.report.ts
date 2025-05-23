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
  projectUrl = 'http://localhost:3000', // URL para el QR (configurable)
): Promise<TDocumentDefinitions> => {
  const [header, chartSection, genderChart, comparisonChart] =
    await Promise.all([
      reportHeader(groupData.name, projectUrl),
      generateAttendanceChart(trendData),
      generateGenderChart(calculateGenderDistribution(groupData.students)),
      generateComparisonChart(generateAttendanceComparison(attendanceData)),
    ]);

  const formatDate = (dateString: string) => {
    const [year, month, day] = dateString.split('-').map(Number);
    const utcDate = new Date(Date.UTC(year, month - 1, day));
    return utcDate.toLocaleDateString('es-CO', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      timeZone: 'UTC',
    });
  };

  const attendanceMap = new Map<
    string,
    { name: string; present: number; absent: number }
  >();
  attendanceData.forEach((a) => {
    attendanceMap.set(a.name, a);
  });

  const fullAttendanceData = groupData.students.map((student: any) => {
    const record = attendanceMap.get(student.name);
    return {
      name: student.name,
      present: record?.present ?? 0,
      absent: record?.absent ?? 0,
    };
  });

  fullAttendanceData.sort((a, b) => a.name.localeCompare(b.name));

  const attendanceTableBody = [
    [
      { text: 'Estudiante', ...TABLE_STYLES.header },
      { text: 'Asistencias', ...TABLE_STYLES.header },
      { text: 'Inasistencias', ...TABLE_STYLES.header },
      { text: '% Asistencia', ...TABLE_STYLES.header },
    ],
    ...fullAttendanceData.map((student, index) => {
      const total = student.present + student.absent;
      const percentage = total > 0 ? (student.present / total) * 100 : 0;
      const formattedPercentage = `${percentage.toFixed(1)}%`;

      let fillColor = index % 2 === 0 ? '#f8f9fa' : '#ffffff';
      if (percentage === 100) fillColor = '#d4edda';
      if (percentage === 0 && total > 0) fillColor = '#f8d7da';

      return [
        { text: student.name, style: 'cell' },
        { text: student.present, style: 'cell' },
        { text: student.absent, style: 'cell' },
        {
          text: formattedPercentage,
          style: 'percentage',
          fillColor,
        },
      ];
    }),
  ];

  return {
    pageMargins: [40, 120, 40, 80],
    header,
    footer: reportFooter,
    content: [
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
      {
        table: {
          widths: ['*', 'auto', 'auto', 'auto'],
          body: attendanceTableBody,
        },
        layout: TABLE_STYLES.layout,
      },
      {
        text: 'Distribución por Género',
        style: 'sectionTitle',
        margin: [0, 20, 0, 10],
      },
      genderChart,
      {
        text: 'Tendencia de Asistencia Semanal',
        style: 'sectionTitle',
        pageBreak: 'before',
        margin: [0, 20, 0, 10],
      },
      chartSection,
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
