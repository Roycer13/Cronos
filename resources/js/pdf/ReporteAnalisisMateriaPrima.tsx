import { Document, Page, StyleSheet, Text, View } from '@react-pdf/renderer';
import PdfLayout from './PdfLayout';

const styles = StyleSheet.create({
    legend: {
        marginTop: 3,
        fontSize: 7,
        color: '#555',
        textAlign: 'center',
    },
  section: {
    paddingTop: 8,
    paddingBottom: 8,
    marginBottom: 6,
    borderWidth: 0.5,
    borderColor: '#ddd',
    padding: 5,
    backgroundColor: '#fafafa',
  },
  sectionTitle: {
    fontSize: 8,
    fontWeight: 'bold',
    marginBottom: 4,
    color: '#000',
  },
  infoGrid: {
    display: 'flex',
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 4,
  },
  infoItem: {
    width: '50%',
    marginBottom: 2,
    paddingRight: 4,
    flexDirection: 'row',
    alignItems: 'center',
  },
  infoLabel: {
    fontSize: 7,
    fontWeight: 'bold',
    color: '#333',
    marginRight: 2,
  },
  infoValue: {
    fontSize: 7,
    color: '#000',
  },
  tableWrapper: {
    borderWidth: 0.5,
    borderColor: '#bbb',
    marginTop: 3,
  },
  tableHeader: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderColor: '#333',
    backgroundColor: '#E8F0FA',
  },
  groupHeaderCell: {
    padding: 3,
    fontSize: 6,
    fontWeight: 'bold',
    textAlign: 'center',
    borderRightWidth: 0.5,
    borderColor: '#333',
  },
  headerCell: {
    flex: 1,
    padding: 3,
    fontSize: 5,
    fontWeight: 'bold',
    textAlign: 'center',
    borderRightWidth: 0.5,
    borderColor: '#333',

  },
  headerCellLast: {
    flex: 1,
    padding: 3,
    fontSize: 5,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  row: {
    flexDirection: 'row',
    borderBottomWidth: 0.5,
    borderColor: '#e0e0e0',
    paddingVertical: 3,
    backgroundColor: '#fff',
  },
  cell: {
    flex: 1,
    paddingHorizontal: 2,
    paddingVertical: 2,
    fontSize: 6,
    textAlign: 'center',
    borderRightWidth: 0.5,
    borderColor: '#e0e0e0',
  },
  cellLast: {
    flex: 1,
    paddingHorizontal: 2,
    paddingVertical: 2,
    fontSize: 6,
    textAlign: 'center',
  },
  usersTable: {
    marginTop: 8,
    borderWidth: 0.5,
    borderColor: '#bbb',
    width: '65%',
  },
  usersHeader: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderColor: '#333',
    backgroundColor: '#2c3e50',
  },
  usersCell: {
    flex: 1,
    padding: 2,
    fontSize: 7,
    color: '#fff',
    fontWeight: 'bold',
  },
});

const viewConfig = {
  insumos: {
    reg:'013',
    title: 'Analisis de materia prima e insumos',
    version: '001',
    columns: [
      { key: 'numero_muestra', label: 'N° Muestra' },
      { key: 'created_at', label: 'Fecha análisis' },
      { key: 'lote', label: 'Lote' },
      { key: 'temperatura', label: 'Temp. [°C]' },
      { key: 'ph', label: 'pH' },
      { key: 'solidos', label: 'Sólidos [°Brix]' },
      { key: 'viscosidad', label: 'Viscosidad [s]' },
      { key: 'densidad', label: 'Densidad [g/ml]' },
      { key: 'acidez', label: 'Acidez [%Acido lactico]' },
      { key: 'color', label: 'Color' },
      { key: 'olor', label: 'Olor' },
      { key: 'sabor', label: 'Sabor' },
      { key: 'aspecto', label: 'Aspecto' },
      { key: 'textura', label: 'Textura' },
      { key: 'sin_material_extraño', label: 'Sin material extraño' },
      { key: 'conformidad', label: 'Conformidad' },
      { key: 'observaciones', label: 'Observaciones' },
      { key: 'user', label: 'Usuario' },
    ],
  },
  empaque: {
    reg:'080',
    version: '001',
    title: 'Control de calidad de Empaque secundario',
    columns: [
      { key: 'numero_muestra', label: 'N° Muestra' },
      { key: 'created_at', label: 'Fecha análisis' },
      { key: 'numero_paquete', label: 'N° Paquete' },
      { key: 'peso_neto', label: 'Peso neto [Kg]' },
      { key: 'peso_unitario', label: 'Peso unitario [g]' },
      { key: 'largo_total', label: 'Largo total [cm]' },
      { key: 'ancho_total', label: 'Ancho total [cm]' },
      { key: 'ancho_plegado', label: 'Ancho plegado [mm]' },
      { key: 'micronaje', label: 'Micronaje [µ]' },
      { key: 'resistencia_envase', label: 'Res. envase' },
      { key: 'transparencia', label: 'Transparencia' },
      { key: 'calidad_impresion', label: 'Calidad impresión' },
      { key: 'olor', label: 'Olor' },
      { key: 'sin_material_extraño', label: 'Sin mat. extraño' },
      { key: 'conformidad', label: 'Conformidad' },
      { key: 'observaciones', label: 'Observaciones' },
      { key: 'user', label: 'Usuario' },
    ],
  },
  bobina: {
    reg:'025',
    version: '001',
    title: 'Control de calidad de bobinas',
    columns: [
      { key: 'numero_muestra', label: 'N° Muestra' },
      { key: 'created_at', label: 'Fecha análisis' },
      { key: 'numero_bobina', label: 'N° Bobina' },
      { key: 'peso_neto', label: 'Peso neto' },
      { key: 'adherencia', label: 'Adherencia' },
      { key: 'frotacion', label: 'Frotación' },
      { key: 'color', label: 'Color' },
      { key: 'texto', label: 'Texto' },
      { key: 'olor', label: 'Olor' },
      { key: 'sentido_embobinado', label: 'Sentido embobinado' },
      { key: 'largo_envase', label: 'Largo envase [cm]' },
      { key: 'ancho_envase', label: 'Ancho envase [cm]' },
      { key: 'largo_taca', label: 'Largo taca [mm]' },
      { key: 'ancho_taca', label: 'Ancho taca [mm]' },
      { key: 'distancia_taca_borde', label: 'Distancia taca-borde [cm]' },
      { key: 'largo_superior', label: 'Largo superior [µm]' },
      { key: 'largo_inferior', label: 'Largo inferior [µm]' },
      { key: 'ancho', label: 'Ancho superior [µm]' },

      { key: 'densidad_lineal', label: 'Gramaje[g/m²]' },
      { key: 'conformidad', label: 'Conformidad' },
      { key: 'observaciones', label: 'Observaciones' },
      { key: 'user', label: 'Usuario' },
    ],
  },
  accesorios: {
    reg:'074',
    version: '001',
    title: 'Control de calidad de Envases y Accesorios',
    columns: [
      { key: 'numero_muestra', label: 'N° Muestra' },
      { key: 'created_at', label: 'Fecha análisis' },
      { key: 'numero_embalaje', label: 'N° Embalaje' },
      { key: 'peso_unitario', label: 'Peso unitario [g]' },
      { key: 'espesor', label: 'Espesor [mm]' },
      { key: 'altura_total', label: 'Altura total [mm]' },
      { key: 'diametro_medio', label: 'Diámetro medio [mm]' },
      { key: 'altura_etiqueta', label: 'Altura etiqueta [mm]' },
      { key: 'perimetro_etiqueta', label: 'Perímetro etiqueta [mm]' },
      { key: 'diametro_cuello', label: 'Diámetro cuello [mm]' },
      { key: 'altura_plegada', label: 'Altura plegada [mm]' },
      { key: 'diametro_externo_base', label: 'Diámetro ext. base [mm]' },
      { key: 'diametro_interno', label: 'Diámetro interno [mm]' },
      { key: 'acabado_fino', label: 'Acabado fino' },
      { key: 'sin_deformidad', label: 'Sin deformidad' },
      { key: 'resistencia_base', label: 'Resistencia base' },
      { key: 'sin_material_extraño', label: 'Sin mat. extraño' },
      { key: 'conformidad', label: 'Conformidad' },
      { key: 'observaciones', label: 'Observaciones' },
      { key: 'user', label: 'Usuario' },
    ],
  },
};

function formatFecha(value?: string | null) {
  if (!value) return 'N/A';
  try {
    const date = new Date(value);
    const dia = String(date.getDate()).padStart(2, '0');
    const mes = String(date.getMonth() + 1).padStart(2, '0');
    const ano = String(date.getFullYear());
    return `${dia}-${mes}-${ano}`;
  } catch {
    return 'N/A';
  }
}

function formatValue(value: any, emptyValue = 'N/A') {
  if (value === null || value === undefined || value === '') return emptyValue;
  if (typeof value === 'boolean') return value ? 'C.' : 'N.C.';
  // Normalize numeric values (strings like ".2" or "0.2000")
  if (typeof value === 'number') return Number(value).toString();
  if (typeof value === 'string') {
    const parsed = Number(value.replace(',', '.'));
    if (!isNaN(parsed) && isFinite(parsed)) return parsed.toString();
    return value;
  }
  return String(value);
}

function formatUserCode(user: any) {
  return formatValue(user?.codigo);
}

export default function ReporteAnalisisMateriaPrima({ viewId, recepcion, data, usuariosInvolucrados }: any) {
  const reportView = viewConfig[viewId] || viewConfig.insumos;
  const columns = reportView.columns;
  const usuarios = Array.isArray(usuariosInvolucrados) ? usuariosInvolucrados : [];

  return (
    <Document>
      <Page size="LETTER" orientation="landscape" style={{ padding: 20 }}>
        <PdfLayout
          title={`${reportView.title.toUpperCase()}`}
          tipo="REGISTRO"
          version={` ${reportView.version.toUpperCase()}`}
          codigo={`PLL-REG-${reportView.reg.toUpperCase()}`}
        >
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>INFORMACIÓN DE LA RECEPCIÓN</Text>
            <View style={styles.infoGrid}>

              <View style={styles.infoItem}>
                <Text style={styles.infoLabel}>Producto: </Text>
                <Text style={styles.infoValue}>{recepcion.item_materia_prima?.nombre || '-'}</Text>
              </View>
              <View style={styles.infoItem}>
                <Text style={styles.infoLabel}>Fecha de recepción: </Text>
                <Text style={styles.infoValue}>{formatFecha(recepcion.tiempo)}</Text>
              </View>
              <View style={styles.infoItem}>
                <Text style={styles.infoLabel}>Proveedor: </Text>
                <Text style={styles.infoValue}>{recepcion.proveedor || '-'}</Text>
              </View>
               <View style={styles.infoItem}>
                <Text style={styles.infoLabel}>Cantidad: </Text>
                <Text style={styles.infoValue}>{recepcion.cantidad || '-'}</Text>
              </View>

              <View style={styles.infoItem}>
                <Text style={styles.infoLabel}>Unidades: </Text>
                <Text style={styles.infoValue}>{recepcion.unidades || '-'}</Text>
              </View>
               <View style={styles.infoItem}>
                <Text style={styles.infoLabel}>Plan de muestreo: </Text>
                <Text style={styles.infoValue}>{recepcion.nivel_inspeccion || '-'}</Text>
                <Text style={styles.infoValue}> </Text>
                <Text style={styles.infoValue}>{recepcion.plan_muestreo || '-'}</Text>
              </View>

              <View style={styles.infoItem}>
                <Text style={styles.infoLabel}>NCA: </Text>
                <Text style={styles.infoValue}> {recepcion.nca || '-'}</Text>
              </View>

              <View style={styles.infoItem}>
                <Text style={styles.infoLabel}>Revisó: </Text>
                <Text style={styles.infoValue}>{recepcion.revisor?.codigo || '-'} - {recepcion.revisor?.nombre || '-'}</Text>
              </View>

            </View>
          </View>

          <View style={styles.tableWrapper}>
            {viewId === 'bobina' && (
              <View style={styles.tableHeader}>
                <Text style={[styles.groupHeaderCell, { width: '68.1818%' }]} />
                <Text style={[styles.groupHeaderCell, { width: '13.6364%' }]}>Micronaje</Text>
                <Text style={[styles.groupHeaderCell, { width: '18.1818%' }]} />
              </View>
            )}
            <View style={styles.tableHeader}>
              {columns.map((column) => (
                <Text key={column.key} style={column.key === columns[columns.length - 1].key ? styles.headerCellLast : styles.headerCell}>
                  {column.label}
                </Text>
              ))}
            </View>
            {Array.isArray(data) && data.length > 0 ? (
              data.map((item: any, index: number) => (
                <View key={index} style={[styles.row, { backgroundColor: index % 2 === 0 ? '#fafafa' : '#fff' }]}>
                  {columns.map((column, columnIndex) => (
                    <Text
                      key={`${index}-${column.key}`}
                      style={columnIndex === columns.length - 1 ? styles.cellLast : styles.cell}
                    >
                      {column.key === 'user' ? formatUserCode(item.user) : column.key === 'created_at' ? formatFecha(item.created_at) : formatValue(item[column.key], column.key === 'observaciones' ? '-' : 'N/A')}
                    </Text>
                  ))}
                </View>
              ))
            ) : (
              <View style={styles.row}>
                <Text style={styles.cellLast}>No hay datos para el rango seleccionado.</Text>
              </View>
            )}
          </View>

                              <Text style={styles.legend}>Glosa: - = Sin Registro, C. = Cumple, N.C. = No Cumple, N/A = No Aplica </Text>


          <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 8, gap: 8, pageBreakInside: 'avoid' as any }}>
            <View style={styles.usersTable}>
              <View style={styles.usersHeader}>
                <Text style={styles.usersCell}>CÓDIGO</Text>
                <Text style={styles.usersCell}>NOMBRE</Text>
              </View>
              {usuarios.map((user: any, index: number) => (
                <View key={`${user.codigo}-${index}`} style={{ flexDirection: 'row', borderBottomWidth: 0.5, borderColor: '#ddd', backgroundColor: index % 2 === 0 ? '#fafafa' : '#fff', paddingVertical: 2 }}>
                  <Text style={{ ...styles.usersCell, color: '#000', fontWeight: 'normal' }}>{user.codigo || '-'}</Text>
                  <Text style={{ ...styles.usersCell, color: '#000', fontWeight: 'normal' }}>{user.nombre || '-'}</Text>
                </View>
              ))}
            </View>
            <View style={{ width: '33%', borderWidth: 1, borderColor: '#2c3e50', padding: 8, backgroundColor: '#fafafa' }}>
              <View style={{ borderBottomWidth: 2, borderColor: '#2c3e50', height: 40, marginBottom: 6 }} />
              <Text style={{ fontSize: 7, fontWeight: 'bold', textAlign: 'center', color: '#2c3e50', marginBottom: 2 }}>FIRMA REVISOR</Text>
              <Text style={{ fontSize: 7, textAlign: 'center', color: '#000' }}>{recepcion.revisor?.codigo || '-'} - {recepcion.revisor?.nombre || '-'}</Text>
              <Text style={{ fontSize: 5.5, textAlign: 'center', color: '#666' }}>Fecha: ___/___/_____</Text>
            </View>
          </View>
        </PdfLayout>
      </Page>
    </Document>
  );
}
