import { Document, Page, StyleSheet, Text, View } from '@react-pdf/renderer';

interface ReporteCertificadoExternoProps {
  detalle: any;
}

const styles = StyleSheet.create({
  page: { padding: 24, fontSize: 10, fontFamily: 'Helvetica', backgroundColor: '#ffffff' },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12, borderBottomWidth: 1, borderBottomColor: '#c7c7c7', paddingBottom: 8 },
  title: { fontSize: 18, fontWeight: 'bold', color: '#1f2937', marginBottom: 2 },
  subtitle: { fontSize: 10, color: '#4b5563' },
  badgeBox: { borderWidth: 1, borderColor: '#d1d5db', padding: 6, width: 120, alignItems: 'center' },
  badgeTitle: { fontSize: 8, color: '#6b7280', marginBottom: 2 },
  badgeValue: { fontSize: 10, fontWeight: 'bold' },
  section: { marginBottom: 10, borderWidth: 1, borderColor: '#d7d7d7', padding: 8, borderRadius: 3 },
  sectionTitle: { fontSize: 11, fontWeight: 'bold', color: '#111827', marginBottom: 6, textTransform: 'uppercase' },
  infoGrid: { flexDirection: 'row', flexWrap: 'wrap', marginBottom: 4 },
  infoItem: { width: '50%', flexDirection: 'row', marginBottom: 4 },
  infoLabel: { width: 90, fontWeight: 'bold', color: '#374151' },
  infoValue: { flex: 1, color: '#111827' },
  table: { borderWidth: 1, borderColor: '#e5e7eb' },
  tableHeader: { flexDirection: 'row', backgroundColor: '#f3f4f6' },
  tableRow: { flexDirection: 'row', borderTopWidth: 1, borderTopColor: '#e5e7eb' },
  tableCell: { flex: 1, padding: 4, fontSize: 9 },
  tableCellBold: { flex: 1, padding: 4, fontSize: 9, fontWeight: 'bold' },
  footer: { marginTop: 8, fontSize: 8, color: '#6b7280', textAlign: 'center' },
});

function formatValue(value: unknown) {
  if (value === null || value === undefined || value === '') return '-';
  return String(value);
}

function formatDate(value: unknown) {
  if (!value) return '-';
  return String(value);
}

export default function ReporteCertificadoExterno({ detalle }: ReporteCertificadoExternoProps) {
  const microbiologia = detalle.microbiologias?.[0];
  const actividad = detalle.actividad_agua;
  const agua = detalle.agua_fisico;

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <View style={styles.header}>
          <View>
            <Text style={styles.title}>Certificado de análisis externo</Text>
            <Text style={styles.subtitle}>Informe técnico resumido de resultados</Text>
          </View> 
          <View style={styles.badgeBox}>
            <Text style={styles.badgeTitle}>Subcódigo</Text>
            <Text style={styles.badgeValue}>{formatValue(detalle.subcodigo)}</Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Datos generales</Text>
          <View style={styles.infoGrid}>
            <View style={styles.infoItem}><Text style={styles.infoLabel}>Producto</Text><Text style={styles.infoValue}>{formatValue(detalle.producto_terminado?.nombre_comercial || detalle.producto_terminado?.nombre || detalle.personal_ambiente_superficie)}</Text></View>
            <View style={styles.infoItem}><Text style={styles.infoLabel}>Solicitud</Text><Text style={styles.infoValue}>{formatValue(detalle.solicitud?.codigo)}</Text></View>
            <View style={styles.infoItem}><Text style={styles.infoLabel}>Tipo análisis</Text><Text style={styles.infoValue}>{formatValue(detalle.tipo_analisis)}</Text></View>
            <View style={styles.infoItem}><Text style={styles.infoLabel}>Tipo muestra</Text><Text style={styles.infoValue}>{formatValue(detalle.tipo_muestra?.nombre)}</Text></View>
            <View style={styles.infoItem}><Text style={styles.infoLabel}>Fecha muestreo</Text><Text style={styles.infoValue}>{formatDate(detalle.fecha_muestreo)}</Text></View>
            <View style={styles.infoItem}><Text style={styles.infoLabel}>Estado</Text><Text style={styles.infoValue}>{formatValue(detalle.estado)}</Text></View>
          </View>
        </View>

        {microbiologia ? (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Microbiología</Text>
            <View style={styles.table}>
              <View style={styles.tableHeader}>
                <Text style={styles.tableCellBold}>Parámetro</Text>
                <Text style={styles.tableCellBold}>Resultado</Text>
                <Text style={styles.tableCellBold}>Detalle</Text>
              </View>
              <View style={styles.tableRow}>
                <Text style={styles.tableCell}>Fecha siembra</Text>
                <Text style={styles.tableCell}>{formatValue(microbiologia.fecha_siembra)}</Text>
                <Text style={styles.tableCell}>-</Text>
              </View>
              <View style={styles.tableRow}>
                <Text style={styles.tableCell}>Aer. mes.</Text>
                <Text style={styles.tableCell}>{formatValue(microbiologia.aer_mes)}</Text>
                <Text style={styles.tableCell}>Aerobios mesófilos</Text>
              </View>
              <View style={styles.tableRow}>
                <Text style={styles.tableCell}>Col. tot.</Text>
                <Text style={styles.tableCell}>{formatValue(microbiologia.col_tot)}</Text>
                <Text style={styles.tableCell}>Coliformes totales</Text>
              </View>
              <View style={styles.tableRow}>
                <Text style={styles.tableCell}>Moh. lev.</Text>
                <Text style={styles.tableCell}>{formatValue(microbiologia.moh_lev)}</Text>
                <Text style={styles.tableCell}>Mohos y levaduras</Text>
              </View>
              <View style={styles.tableRow}>
                <Text style={styles.tableCell}>Fecha día 5</Text>
                <Text style={styles.tableCell}>{formatValue(microbiologia.fecha_dia5)}</Text>
                <Text style={styles.tableCell}>Lectura final</Text>
              </View>
            </View>
          </View>
        ) : null}

        {actividad ? (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Actividad de agua</Text>
            <View style={styles.infoGrid}>
              <View style={styles.infoItem}><Text style={styles.infoLabel}>Fecha</Text><Text style={styles.infoValue}>{formatDate(actividad.fecha)}</Text></View>
              <View style={styles.infoItem}><Text style={styles.infoLabel}>Temperatura</Text><Text style={styles.infoValue}>{formatValue(actividad.temperatura)}</Text></View>
              <View style={styles.infoItem}><Text style={styles.infoLabel}>HR</Text><Text style={styles.infoValue}>{formatValue(actividad.por_hum_rel)}</Text></View>
              <View style={styles.infoItem}><Text style={styles.infoLabel}>Act. agua</Text><Text style={styles.infoValue}>{formatValue(actividad.act_agua)}</Text></View>
            </View>
          </View>
        ) : null}

        {agua ? (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Agua físico</Text>
            <View style={styles.infoGrid}>
              <View style={styles.infoItem}><Text style={styles.infoLabel}>Fecha</Text><Text style={styles.infoValue}>{formatDate(agua.fecha)}</Text></View>
              <View style={styles.infoItem}><Text style={styles.infoLabel}>pH</Text><Text style={styles.infoValue}>{formatValue(agua.ph)}</Text></View>
              <View style={styles.infoItem}><Text style={styles.infoLabel}>Dureza</Text><Text style={styles.infoValue}>{formatValue(agua.dureza)}</Text></View>
              <View style={styles.infoItem}><Text style={styles.infoLabel}>Cloruros</Text><Text style={styles.infoValue}>{formatValue(agua.cloruros)}</Text></View>
              <View style={styles.infoItem}><Text style={styles.infoLabel}>Conductividad</Text><Text style={styles.infoValue}>{formatValue(agua.conductividad)}</Text></View>
            </View>
          </View>
        ) : null}

        <Text style={styles.footer}>Documento generado para revisión y emisión del certificado externo.</Text>
      </Page>
    </Document>
  );
}
