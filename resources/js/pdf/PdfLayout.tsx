import { StyleSheet, Text, View, Image } from '@react-pdf/renderer';

const styles = StyleSheet.create({
  wrapper: {
    flex: 1,
    flexDirection: 'column',
    paddingHorizontal: 20,
  },
  header: {
    borderWidth: 1,
    borderColor: '#000',
    backgroundColor: '#fff',
  },
  headerRow1: {
    flexDirection: 'row',
    borderBottomWidth: 0.5,
    borderColor: '#000',
  },
  headerCol: {
    flex: 1,
    paddingVertical: 3,
    paddingHorizontal: 6,
    justifyContent: 'center',
    alignItems: 'center',
    borderRightWidth: 0.5,
    borderColor: '#000',
    fontSize: 8,
  },
  headerColLast: {
    flex: 1,
    paddingVertical: 3,
    paddingHorizontal: 6,
    justifyContent: 'center',
    alignItems: 'center',
    borderRightWidth: 0,
    fontSize: 8,
  },
  headerRow2: {
    padding: 6,
    justifyContent: 'center',
    alignItems: 'center',
    borderTopWidth: 0.5,
    borderColor: '#000',
  },

  titleText: { fontSize: 11, fontWeight: 'bold' },

  // espacio del header + footer
  content: {
    flex: 1,
    paddingTop: 15,
    paddingBottom: 15,
  },

  footer: {
    padding: 8,
    fontSize: 9,
    borderTopWidth: 1,
    borderColor: '#ccc',
    textAlign: 'center',
    backgroundColor: '#fff',
  },
  legend: {
    marginTop: 3,
    fontSize: 7,
    color: '#555',
    textAlign: 'center',
  },
});

export default function PdfLayout({
  title,
  tipo,
  version,
  codigo,
  children,
}: any) {
  const fecha = new Date().toLocaleDateString('es-BO');

  return (
    <View style={styles.wrapper}>

      {/* HEADER */}
      <View style={styles.header} fixed>
        <View style={styles.headerRow1}>
          <View style={styles.headerCol}>
            {/* insertar imagen de public/img/logos/logocompleto.png - usar ruta pública */}
            <Image src="/img/logos/logocompleto.png" style={{ width: 140, height: 40 }} />
          </View>

          <View style={styles.headerCol}>
            <Text>{tipo ?? 'Reporte'}</Text>
          </View>

          <View style={styles.headerColLast}>
            <Text>{codigo ?? '00'}</Text>
            <Text>Versión {version ?? '001'}</Text>
            <Text render={({ pageNumber, totalPages }) => `Página ${pageNumber} de ${totalPages}`} />
          </View>
        </View>

        <View style={styles.headerRow2}>
          <Text style={styles.titleText}>{title ?? 'Título'}</Text>
        </View>
      </View>

      {/* CONTENIDO */}
      <View style={styles.content}>{children}</View>

      {/* FOOTER */}
      <View style={styles.footer} fixed>
        <Text>SOALPRO SRL - Planta Lácteos - Reporte generado el {fecha}</Text>
        {/* <Text style={styles.legend}>Glosa: C. = Cumple; N.C. = No cumple.</Text> */}
        <Text render={({ pageNumber, totalPages }) => `Página ${pageNumber} de ${totalPages}`} />
      </View>
    </View>
  );
}
