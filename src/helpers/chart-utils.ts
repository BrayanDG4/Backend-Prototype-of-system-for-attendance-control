// src/helpers/chart-utils.ts
import axios from 'axios';

export const chartJsToImage = async (chartConfig: object): Promise<string> => {
  try {
    const encodedConfig = encodeURIComponent(JSON.stringify(chartConfig));
    const response = await axios.get(
      `https://quickchart.io/chart?c=${encodedConfig}&width=600&height=300`,
      { responseType: 'arraybuffer' },
    );

    return `data:image/png;base64,${Buffer.from(response.data).toString('base64')}`;
  } catch (error) {
    throw new Error('Error al generar el gráfico: ' + error.message);
  }
};
