// reports/sections/charts.section.ts
import { Content } from 'pdfmake/interfaces';
import { chartJsToImage } from '../../helpers/chart-utils';

export const generateAttendanceChart = async (
  trendData: any,
): Promise<Content> => {
  const chartConfig = {
    type: 'line',
    data: {
      labels: trendData.labels,
      datasets: [
        {
          label: '% Asistencia Semanal',
          data: trendData.values,
          borderColor: '#3498db',
          backgroundColor: 'rgba(52, 152, 219, 0.2)',
          tension: 0.4,
          fill: true,
        },
      ],
    },
    options: {
      scales: {
        y: {
          min: 0,
          max: 100,
          ticks: {
            callback: (value: number) => `${value}%`,
          },
        },
      },
    },
  };

  try {
    const chartImage = await chartJsToImage(chartConfig);
    return {
      image: chartImage,
      width: 500,
      alignment: 'center',
      margin: [0, 0, 0, 20],
    };
  } catch (error) {
    return {
      text: 'Error al generar el gráfico',
      color: '#e74c3c',
      italics: true,
    };
  }
};

export const generateGenderChart = async (
  genderData: any,
): Promise<Content> => {
  const chartConfig = {
    type: 'pie',
    data: {
      labels: genderData.labels,
      datasets: [
        {
          data: genderData.values,
          backgroundColor: genderData.colors,
        },
      ],
    },
    options: {
      plugins: {
        title: {
          display: true,
          text: 'Distribución por Género',
        },
      },
    },
  };

  try {
    const chartImage = await chartJsToImage(chartConfig);
    return {
      image: chartImage,
      width: 300,
      alignment: 'center',
      margin: [0, 0, 0, 20],
    };
  } catch (error) {
    return {
      text: 'Error al generar gráfico de género',
      color: '#e74c3c',
      italics: true,
    };
  }
};

export const generateComparisonChart = async (
  comparisonData: any,
): Promise<Content> => {
  const chartConfig = {
    type: 'bar',
    data: {
      labels: comparisonData.labels,
      datasets: [
        {
          label: 'Asistencias',
          data: comparisonData.present,
          backgroundColor: '#3498db',
        },
        {
          label: 'Inasistencias',
          data: comparisonData.absent,
          backgroundColor: '#e74c3c',
        },
      ],
    },
    options: {
      responsive: true,
      scales: {
        x: { stacked: true },
        y: { stacked: true },
      },
      plugins: {
        title: {
          display: true,
          text: 'Comparación Asistencia/Inasistencia',
        },
      },
    },
  };

  try {
    const chartImage = await chartJsToImage(chartConfig);
    return {
      image: chartImage,
      width: 500,
      alignment: 'center',
      margin: [0, 0, 0, 20],
    };
  } catch (error) {
    return {
      text: 'Error al generar gráfico comparativo',
      color: '#e74c3c',
      italics: true,
    };
  }
};
