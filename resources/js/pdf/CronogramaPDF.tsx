import { Document, Page, Text, View, StyleSheet } from '@react-pdf/renderer';

const DIAS = [
  { key: 'lun', label: 'Lunes' },
  { key: 'mar', label: 'Martes' },
  { key: 'mie', label: 'Miércoles' },
  { key: 'jue', label: 'Jueves' },
  { key: 'vie', label: 'Viernes' },
  { key: 'sab', label: 'Sábado' },
  { key: 'dom', label: 'Domingo' },
];

const TURNOS = [1, 2, 3];

const styles = StyleSheet.create({
  page: {
    padding: 30,
    fontSize: 8,
    fontFamily: 'Helvetica',
  },
  title: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 10,
    fontWeight: 'bold',
  },
  areaTitle: {
    fontSize: 12,
    fontWeight: 'bold',
    backgroundColor: '#e0e7ff',
    padding: 5,
    marginTop: 15,
    marginBottom: 5,
    borderLeftWidth: 3,
    borderLeftColor: '#3b82f6',
  },
  subareaTitle: {
    fontSize: 10,
    fontWeight: 'bold',
    marginTop: 8,
    marginBottom: 4,
    color: '#374151',
  },
  table: {
    width: '100%',
    borderWidth: 0.5,
    borderColor: '#999',
    marginBottom: 10,
  },
  row: {
    flexDirection: 'row',
    borderBottomWidth: 0.5,
    borderColor: '#ccc',
    minHeight: 18,
    alignItems: 'center',
  },
  headerRow: {
    flexDirection: 'row',
    backgroundColor: '#f3f4f6',
    borderBottomWidth: 1,
    borderColor: '#333',
    minHeight: 20,
    alignItems: 'center',
  },
  cell: {
    flex: 1,
    padding: 3,
    textAlign: 'center',
    borderRightWidth: 0.5,
    borderColor: '#ccc',
    fontSize: 7,
  },
  itemCell: {
    flex: 1.8,
    padding: 3,
    borderRightWidth: 0.5,
    borderColor: '#ccc',
    fontSize: 7,
    textAlign: 'left',
  },
  cellLast: {
    flex: 1,
    padding: 3,
    textAlign: 'center',
    fontSize: 7,
  },
  badge: {
    paddingHorizontal: 3,
    paddingVertical: 1,
    borderRadius: 2,
    fontSize: 6,
    fontWeight: 'bold',
    marginRight: 2,
    marginBottom: 1,
  },
  badgeOrden: { backgroundColor: '#bfdbfe', color: '#1e40af' },
  badgeLimpieza: { backgroundColor: '#fef08a', color: '#854d0e' },
  badgeDesinfeccion: { backgroundColor: '#bbf7d0', color: '#166534' },
  noActivity: {
    color: '#9ca3af',
  },
});

// Función para obtener actividades por día
const getActividadesPorDia = (item: any, dia: string) => {
  const act = {
    orden: [] as number[],
    limpieza: [] as number[],
    desinfeccion: [] as number[],
  };
  TURNOS.forEach((t) => {
    if (item[`${dia}_${t}_o`]) act.orden.push(t);
    if (item[`${dia}_${t}_l`]) act.limpieza.push(t);
    if (item[`${dia}_${t}_d`]) act.desinfeccion.push(t);
  });
  return act;
};

const renderActividades = (act: any) => {
  const hayAlguna = act.orden.length || act.limpieza.length || act.desinfeccion.length;
  if (!hayAlguna) {
    return <Text style={styles.noActivity}>-</Text>;
  }
  return (
    <View style={{ flexDirection: 'row', justifyContent: 'center', flexWrap: 'wrap' }}>
      {act.orden.length > 0 && (
        <Text style={[styles.badge, styles.badgeOrden]}>O ({act.orden.join(',')})</Text>
      )}
      {act.limpieza.length > 0 && (
        <Text style={[styles.badge, styles.badgeLimpieza]}>L ({act.limpieza.join(',')})</Text>
      )}
      {act.desinfeccion.length > 0 && (
        <Text style={[styles.badge, styles.badgeDesinfeccion]}>D ({act.desinfeccion.join(',')})</Text>
      )}
    </View>
  );
};

export default function CronogramaPDF({ areas }: any) {
  return (
    <Document>
      <Page size="A4" orientation="landscape" style={styles.page}>
        <Text style={styles.title}>Cronograma de Limpieza Semanal</Text>

        {areas.map((area: any) => (
          <View key={area.id}>
            <Text style={styles.areaTitle}>Área: {area.nombre}</Text>

            {area.subareas.map((subarea: any) => (
              <View key={subarea.id}>
                <Text style={styles.subareaTitle}>Subárea: {subarea.nombre}</Text>

                <View style={styles.table}>
                  {/* Encabezado */}
                  <View style={styles.headerRow}>
                    <Text style={styles.itemCell}>Item</Text>
                    {DIAS.map((dia) => (
                      <Text key={dia.key} style={styles.cell}>
                        {dia.label}
                      </Text>
                    ))}
                  </View>

                  {/* Filas de items */}
                  {subarea.items.map((item: any) => (
                    <View key={item.id} style={styles.row}>
                      <Text style={styles.itemCell}>{item.nombre}</Text>
                      {DIAS.map((dia) => {
                        const act = getActividadesPorDia(item, dia.key);
                        return (
                          <Text key={dia.key} style={styles.cell}>
                            {renderActividades(act)}
                          </Text>
                        );
                      })}
                    </View>
                  ))}
                </View>
              </View>
            ))}
          </View>
        ))}
      </Page>
    </Document>
  );
}