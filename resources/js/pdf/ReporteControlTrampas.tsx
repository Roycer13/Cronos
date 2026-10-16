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
  fecha: { width: '8%' },
  trampa: { width: '9%' },
  tipoTrampa: { width: '9%' },
  sector: { width: '9%' },
  tipo: { width: '9%' },
  observacion: { width: '10%' },
  detalle: { width: '14%' },
  correcion: { width: '11%' },
  responsable_correcion: { width: '8%' },
  deterioro: { width: '6%' },
  responsable_cambio: { width: '7%' },
  inspector: { width: '10%' },
};

function formatDate(value: string | null | undefined) {
  if (!value) return '-';
  return new Date(value).toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit', year: 'numeric' });
}

function buildDateFilterLabel(filtros: any) {
  if (filtros.filtro_fecha) {
    return `Fecha exacta: ${formatDate(filtros.filtro_fecha)}`;
  }

  const desde = filtros.filtro_fecha_desde ? formatDate(filtros.filtro_fecha_desde) : '-';
  const hasta = filtros.filtro_fecha_hasta ? formatDate(filtros.filtro_fecha_hasta) : '-';
  return `Rango: ${desde} al ${hasta}`;
}

export default function ReporteControlTrampas({ data }: any) {
  const { datos = [], resumen = {}, filtros = {} } = data || {};

  return (
    <Document>
      <Page size="LETTER" orientation="landscape" style={{ padding: 16 }}>
        <PdfLayout
          title="CONTROL DE VECTORES"
          tipo="REGISTRO"
          version="001"
          codigo="PLG-REG-014"
        >



          <View style={styles.table}>
            <View style={[styles.row, styles.headerRow]}>
              <Text style={[styles.cell, colStyles.fecha, styles.bold]}>Fecha</Text>
              <Text style={[styles.cell, colStyles.trampa, styles.bold]}>Trampa</Text>
              <Text style={[styles.cell, colStyles.tipoTrampa, styles.bold]}>Tipo trampa</Text>
              <Text style={[styles.cell, colStyles.sector, styles.bold]}>Sector</Text>
              <Text style={[styles.cell, colStyles.tipo, styles.bold]}>Tipo revisión</Text>
              <Text style={[styles.cell, colStyles.observacion, styles.bold]}>Observación</Text>
              <Text style={[styles.cell, colStyles.detalle, styles.bold]}>Detalle</Text>
              <Text style={[styles.cell, colStyles.correcion, styles.bold]}>Corrección</Text>
              <Text style={[styles.cell, colStyles.responsable_correcion, styles.bold]}>Resp. corrección</Text>
              <Text style={[styles.cell, colStyles.deterioro, styles.bold]}>Deterioro</Text>
              <Text style={[styles.cell, colStyles.responsable_cambio, styles.bold]}>Resp. cambio</Text>
              <Text style={[styles.cellLast, colStyles.inspector, styles.bold]}>Inspector</Text>
            </View>
            {datos.map((item: any, index: number) => (
              <View key={`${item.id}-${index}`} style={styles.row}>
                <Text style={[styles.cell, colStyles.fecha]}>{formatDate(item.fecha)}</Text>
                <Text style={[styles.cell, colStyles.trampa]}>{item.trampa?.codigo || '—'}</Text>
                <Text style={[styles.cell, colStyles.tipoTrampa]}>{item.trampa?.tipo || '—'}</Text>
                <Text style={[styles.cell, colStyles.sector]}>{item.trampa?.sector?.nombre || '—'}</Text>
                <Text style={[styles.cell, colStyles.tipo]}>{item.tipo_revision || '—'}</Text>
                <Text style={[styles.cell, colStyles.observacion]}>{item.observacion || '—'}</Text>
                <Text style={[styles.cell, colStyles.detalle]}>{item.observacion_detalle || '—'}</Text>
                <Text style={[styles.cell, colStyles.correcion]}>{item.correcion || '—'}</Text>
                <Text style={[styles.cell, colStyles.responsable_correcion]}>{item.responsable_correcion || '—'}</Text>
                <Text style={[styles.cell, colStyles.deterioro, item.deterioro ? styles.badgeOk : styles.badgeFail]}>{item.deterioro ? 'C.' : 'N.C.'}</Text>
                <Text style={[styles.cell, colStyles.responsable_cambio]}>{item.responsable_cambio || '—'}</Text>
                <Text style={[styles.cellLast, colStyles.inspector]}>{item.inspector ? `${item.inspector.name} ${item.inspector.apellido}` : '—'}</Text>
              </View>
            ))}
          </View>
        </PdfLayout>
      </Page>
    </Document>
  );
}
