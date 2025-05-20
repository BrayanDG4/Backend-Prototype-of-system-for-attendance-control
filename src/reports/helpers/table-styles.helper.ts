// reports/helpers/table-styles.helper.ts
export const TABLE_STYLES = {
  header: {
    fillColor: '#3498db',
    color: 'white',
    bold: true,
    alignment: 'center',
  },
  layout: {
    hLineWidth: (i: number) => (i === 1 ? 2 : 0.5),
    vLineWidth: () => 0.5,
    hLineColor: () => '#bdc3c7',
    vLineColor: () => '#bdc3c7',
  },
};
