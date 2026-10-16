import { Document, Page, StyleSheet, Text, View } from '@react-pdf/renderer';
import PdfLayout from './PdfLayout';

function formatFecha(value?: string | Date | null) {
    if (!value) return '-';
    try {
        const fecha = new Date(value);
        const dia = fecha.getDate().toString().padStart(2, '0');
        const mes = (fecha.getMonth() + 1).toString().padStart(2, '0');
        const año = fecha.getFullYear().toString().slice(-2);
        return `${dia}-${mes}-${año}`;
    } catch {
        return '-';
    }
}

const styles = StyleSheet.create({
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
        fontSize: 7.5,
        fontWeight: 'bold',
        marginBottom: 1,
        backgroundColor: '#E8F0FA',
        padding: 2,
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
    legend: {
    marginTop: 3,
    fontSize: 7,
    color: '#555',
    textAlign: 'center',
  },
    infoLabel: {
        fontSize: 8,
        fontWeight: 'bold',
        color: '#333',
        marginRight: 2,
    },
    infoValue: {
        fontSize: 8,
        color: '#000',
    },
    tableWrapper: {
        borderWidth: 0.5,
        borderColor: '#bbb',
        marginTop: 3,
    },
    correctionsTable: {
        borderWidth: 0.5,
        borderColor: '#bbb',
        marginTop: 8,
    },
    tableHeader: {
        //cabeceras en mayuscula
        textTransform: 'uppercase',
        flexDirection: 'row',
        borderBottomWidth: 1,
        borderColor: '#333',
        backgroundColor: '#E8F0FA',
    },
    headerCell: {

        flex: 1,
        padding: 1.5,
        fontSize: 6.5,
        borderRightWidth: 0.5,
        borderColor: '#333',
        fontWeight: 'bold',
        textAlign: 'center',
        color: '#000',
        justifyContent: 'center',
        alignItems: 'center',

    },
    headerCellLast: {
        flex: 1,
        padding: 1.5,
        fontSize: 6.5,
        fontWeight: 'bold',
        textAlign: 'center',
        color: '#000',
        justifyContent: 'center',
        alignItems: 'center',
    },
    row: {
        flexDirection: 'row',
        borderBottomWidth: 0.5,
        borderColor: '#e0e0e0',
        paddingVertical: 0.5,
        backgroundColor: '#fafafa',
    },
    cell: {
        flex: 1,
        paddingHorizontal: 2,
        paddingVertical: 0.5,
        fontSize: 6,
        textAlign: 'center',
        justifyContent: 'center',
        alignItems: 'center',
    },
    cellLast: {
        flex: 1,
        paddingHorizontal: 2,
        paddingVertical: 0.5,
        fontSize: 6,
        textAlign: 'center',
        justifyContent: 'center',
        alignItems: 'center',
    },
    usersTable: {
        marginTop: 6,
        borderWidth: 0.5,
        borderColor: '#bbb',
        width: '65%',
        flex: 1,
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

export default function ReporteHisopados({ datos, usuariosInvolucrados }: any) {
    const hisopados = Array.isArray(datos) ? datos : [];
    const usuarios = Array.isArray(usuariosInvolucrados) ? usuariosInvolucrados : [];

    return (
        <Document>
            <Page size="LETTER" orientation="landscape" style={{ padding: 20 }}>
                <PdfLayout
                    title="CONTROL MICROBIOLÓGICO DE MANOS"
                    tipo="REGISTRO"
                    version="001"
                    codigo="PLL-REG-008"
                >
                    {/* Información del reporte (opcional) */}
                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>REPORTE DE HISOPADOS</Text>
                        <View style={styles.infoGrid}>
                            <View style={styles.infoItem}>
                                <Text style={styles.infoLabel}>Total registros:</Text>
                                <Text style={styles.infoValue}>{hisopados.length}</Text>
                            </View>
                        </View>
                    </View>

                    {/* Tabla de hisopados */}
                    <View style={styles.tableWrapper}>
                        <View style={styles.tableHeader}  >
                            <Text style={styles.headerCell}>Fecha de toma de muestra</Text>
                            <Text style={styles.headerCell}>Analista de toma de muestra</Text>
                            <Text style={styles.headerCell}>Nombre completo del operario</Text>
                            <Text style={styles.headerCell}>Cargo del operario</Text>
                            <Text style={styles.headerCell}>Analista de Siembra</Text>
                            <Text style={styles.headerCell}>Fecha de Siembra</Text>
                            <Text style={styles.headerCell}>Analista de Lectura</Text>
                            <Text style={styles.headerCell}>Fecha de Lectura</Text>
                            <Text style={styles.headerCell}>Coliformes totales</Text>
                            <Text style={styles.headerCellLast}>Observaciones</Text>
                        </View>
                        {hisopados.map((h, idx) => (
                            <View key={idx} style={styles.row}>
                                <Text style={styles.cell}>{formatFecha(h.fecha)}</Text>
                                <Text style={styles.cell}>{h.codigo_usuario_siembra || '-'}</Text>
                                <Text style={styles.cell}>{h.usuario || '-'}</Text>
                                <Text style={styles.cell}>{h.cargo || '-'}</Text>
                                <Text style={styles.cell}>{h.codigo_usuario_siembra || '-'}</Text>
                                <Text style={styles.cell}>{formatFecha(h.fecha_siembra)}</Text>
                                <Text style={styles.cell}>{h.codigo_usuario_lectura || '-'}</Text>
                                <Text style={styles.cell}>{formatFecha(h.fecha_lectura)}</Text>
                                <Text style={styles.cell}>{h.coliformes ?? '-'}</Text>
                                <Text style={styles.cellLast}>
                                    {h.observacion_siembra !== '-' && `Siembra: ${h.observacion_siembra} `}
                                    {h.observacion_lectura !== '-' && `Lectura: ${h.observacion_lectura}`}
                                    {h.observacion_siembra === '-' && h.observacion_lectura === '-' && '-'}
                                </Text>
                            </View>
                        ))}
                    </View>
                    {hisopados.some((h) => Array.isArray(h.correcciones) && h.correcciones.length > 0) && (
                        <View style={styles.correctionsTable}>
                            <Text style={styles.sectionTitle}>CORRECCIONES Y CAPACITACIONES</Text>
                            <View style={styles.tableHeader}>
                                <Text style={styles.headerCell}>Usuario capacitador</Text>
                                <Text style={styles.headerCell}>Fecha capacitación</Text>
                                <Text style={styles.headerCell}>Usuario capacitado</Text>
                                <Text style={styles.headerCellLast}>Fecha corrección</Text>
                            </View>
                            {hisopados.flatMap((h) => h.correcciones || []).map((correccion, idx) => (
                                <View key={idx} style={styles.row}>
                                    <Text style={styles.cell}>{correccion.usuario_capacitador || '-'}</Text>
                                    <Text style={styles.cell}>{formatFecha(correccion.fecha_capacitacion)}</Text>
                                    <Text style={styles.cell}>{correccion.usuario_capacitado || '-'}</Text>
                                    <Text style={styles.cellLast}>{formatFecha(correccion.fecha_correccion)}</Text>
                                </View>
                            ))}
                        </View>
                    )}
                                        <Text style={styles.legend}>Glosa: - = Sin Registro.</Text>


                    {/* Usuarios involucrados + firma */}
                    <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 8, gap: 8, pageBreakInside: 'avoid' as any }}>
                        <View style={styles.usersTable}>
                            <View style={styles.usersHeader}>
                                <Text style={styles.usersCell}>CÓDIGO</Text>
                                <Text style={styles.usersCell}>NOMBRE </Text>
                            </View>
                            {usuarios.map((u: any, i: number) => (
                                <View key={i} style={{ flexDirection: 'row', borderBottomWidth: 0.5, borderColor: '#ddd', backgroundColor: i % 2 === 0 ? '#fafafa' : '#fff', paddingVertical: 2 }}>
                                    <Text style={{ ...styles.usersCell, color: '#000', fontWeight: 'normal' }}>{u.codigo}</Text>
                                    <Text style={{ ...styles.usersCell, color: '#000', fontWeight: 'normal' }}>{`${u.nombre}`}</Text>
                                </View>
                            ))}
                        </View>
                        <View style={{ width: '33%', borderWidth: 1, borderColor: '#2c3e50', padding: 8, backgroundColor: '#fafafa' }}>
                            <View style={{ borderBottomWidth: 2, borderColor: '#2c3e50', height: 40, marginBottom: 6 }} />
                            <Text style={{ fontSize: 7, fontWeight: 'bold', textAlign: 'center', color: '#2c3e50', marginBottom: 2 }}>FIRMA REVISOR</Text>
                            <Text style={{ fontSize: 5.5, textAlign: 'center', color: '#666' }}>Fecha: ___/___/_____</Text>
                        </View>
                    </View>
                </PdfLayout>
            </Page>
        </Document>
    );
}
