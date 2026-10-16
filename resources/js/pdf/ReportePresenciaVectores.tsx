import { Document, Page, StyleSheet, Text, View } from '@react-pdf/renderer';
import PdfLayout from './PdfLayout';

const styles = StyleSheet.create({
  section: {
    paddingTop: 6,
    paddingBottom: 6,
    marginBottom: 6,
    borderWidth: 0.5,
    borderColor: '#ccc',
    borderRadius: 4,
    padding: 8,
    backgroundColor: '#f8fafc',
  },
  sectionTitle: {
    fontSize: 8,
    fontWeight: 'bold',
    marginBottom: 4,
    color: '#1f2937',
  },
  infoGrid: {
    display: 'flex',
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 4,
  },
  infoItem: {
    width: '33%',
    fontSize: 7,
    color: '#111827',
  },
  label: {
    fontSize: 7,
    fontWeight: 'bold',
    color: '#374151',
  },
  value: {
    fontSize: 7,
    color: '#111827',
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 4,
    marginTop: 4,
  },
  summaryItem: {
    flex: 1,
    borderWidth: 0.5,
    borderColor: '#d1d5db',
    borderRadius: 4,
    padding: 6,
    backgroundColor: '#ffffff',
  },
  summaryNumber: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 2,
  },
  summaryLabel: {
    fontSize: 6,
    color: '#6b7280',
  },
  table: {
    borderWidth: 0.5,
    borderColor: '#d1d5db',
    borderRadius: 4,
    overflow: 'hidden',
    marginTop: 6,
  },
  row: {
    flexDirection: 'row',
    borderBottomWidth: 0.5,
    borderColor: '#e5e7eb',
    alignItems: 'flex-start',
  },
  headerRow: {
    backgroundColor: '#f3f4f6',
  },
  cell: {
    padding: 4,
    fontSize: 6,
    color: '#111827',
    borderRightWidth: 0.5,
    borderColor: '#e5e7eb',
    minHeight: 20,
  },
  cellLast: {
    padding: 4,
    fontSize: 6,
    color: '#111827',
    minHeight: 20,
  },
  bold: {
    fontWeight: 'bold',
  },
  badgeOk: {
    color: '#10b981',
    fontSize: 6,
  },
  badgeFail: {
    color: '#ef4444',
    fontSize: 6,
  },
});

const colStyles = {
  fecha: { width: '10%' },
  vector: { width: '12%' },
  sector: { width: '12%' },
  reportado_por: { width: '12%' },
  accion: { width: '24%' },
  estado: { width: '8%' },
  inspector: { width: '12%' },
};

function formatDate(value: string | null | undefined) {
  if (!value) return '-';
  return new Date(value).toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' });
}

function buildDateFilterLabel(filtros: any) {
  if (filtros.filtro_fecha) {
    return `Fecha exacta: ${formatDate(filtros.filtro_fecha)}`;
  }

  const desde = filtros.filtro_fecha_desde ? formatDate(filtros.filtro_fecha_desde) : '-';
  const hasta = filtros.filtro_fecha_hasta ? formatDate(filtros.filtro_fecha_hasta) : '-';
  return `Rango: ${desde} al ${hasta}`;
}

export default function ReportePresenciaVectores({ data }: any) {
  const { datos = [], resumen = {}, filtros = {} } = data || {};

  return (
    <Document>
      <Page size="LETTER" orientation="landscape" style={{ padding: 16 }}>
        <PdfLayout
          title="REPORTE DE PRESENCIA DE VECTORES"
          tipo="REGISTRO"
          version="001"
          codigo="PLG-REG-110"
        >
         
          

          <View style={styles.table}>
            <View style={[styles.row, styles.headerRow]}>
              <Text style={[styles.cell, colStyles.fecha, styles.bold]}>Fecha</Text>
              <Text style={[styles.cell, colStyles.vector, styles.bold]}>Vector</Text>
              <Text style={[styles.cell, colStyles.sector, styles.bold]}>Sector</Text>
              <Text style={[styles.cell, colStyles.reportado_por, styles.bold]}>Reportado por</Text>
              <Text style={[styles.cell, colStyles.accion, styles.bold]}>Acción tomada</Text>
              <Text style={[styles.cell, colStyles.estado, styles.bold]}>Estado</Text>
              <Text style={[styles.cellLast, colStyles.inspector, styles.bold]}>Inspector</Text>
            </View>
            {datos.map((item: any, index: number) => (
              <View key={`${item.id}-${index}`} style={styles.row}>
                <Text style={[styles.cell, colStyles.fecha]}>{formatDate(item.fecha)}</Text>
                <Text style={[styles.cell, colStyles.vector]}>{item.vector || '—'}</Text>
                <Text style={[styles.cell, colStyles.sector]}>{item.sector?.nombre || '—'}</Text>
                <Text style={[styles.cell, colStyles.reportado_por]}>{item.reportado_por || '—'}</Text>
                <Text style={[styles.cell, colStyles.accion]}>{item.accion || '—'}</Text>
                <Text style={[styles.cell, colStyles.estado, item.estado ? styles.badgeOk : styles.badgeFail]}>{item.estado ? 'Atendido' : 'Pendiente'}</Text>
                <Text style={[styles.cellLast, colStyles.inspector]}>{item.inspector ? `${item.inspector.name} ${item.inspector.apellido}` : '—'}</Text>
              </View>
            ))}
          </View>
        </PdfLayout>
      </Page>
    </Document>
  );
}
