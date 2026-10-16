import { Document, Page, StyleSheet, Text, View } from '@react-pdf/renderer';
import PdfLayout from './PdfLayout';

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
    tableWrapper: { borderWidth: 0.5, borderColor: '#bbb', marginTop: 6 },
    tableHeader: {
        flexDirection: 'row',
        borderBottomWidth: 1,
        borderColor: '#333',
        backgroundColor: '#E8F0FA',
    },
    headerCell: {
        flex: 1,
        padding: 4,
        fontSize: 8,
        fontWeight: 'bold',
        textAlign: 'center',
        borderRightWidth: 0.5,
        borderColor: '#333',
    },
    legend: {
        marginTop: 3,
        fontSize: 7,
        color: '#555',
        textAlign: 'center',
    },
    headerCellLast: {
        flex: 1,
        padding: 4,
        fontSize: 8,
        fontWeight: 'bold',
        textAlign: 'center',
    },
    row: {
        flexDirection: 'row',
        borderBottomWidth: 0.5,
        borderColor: '#e0e0e0',
        paddingVertical: 2,
        backgroundColor: '#fff',
    },
    infoLabel: {
        fontSize: 8,
        fontWeight: 'bold',
        color: '#333',
        marginRight: 2,
    },
    cell: {
        flex: 1,
        paddingHorizontal: 4,
        fontSize: 7,
        textAlign: 'center',
        borderRightWidth: 0.5,
        borderColor: '#e0e0e0',
    },
    cellLast: {
        flex: 1,
        paddingHorizontal: 4,
        fontSize: 7,
        textAlign: 'center',
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

function formatFecha(value?: string | Date | null) {
    if (!value) return '-';
    try {
        const fecha = new Date(value);
        const dia = fecha.getDate().toString().padStart(2, '0');
        const mes = (fecha.getMonth() + 1).toString().padStart(2, '0');
        const año = fecha.getFullYear().toString();
        const hora = fecha.getHours().toString().padStart(2, '0');
        const minutos = fecha.getMinutes().toString().padStart(2, '0');
        return `${dia}-${mes}-${año} ${hora}:${minutos}`;
    } catch {
        return String(value);
    }
}

export default function ReporteAditivosQuimicos({ datos, filtros, usuariosInvolucrados }: any) {
    const registros = Array.isArray(datos) ? datos : [];
    const usuarios = Array.isArray(usuariosInvolucrados) ? usuariosInvolucrados : [];

    return (
        <Document>
            <Page size="LETTER" style={{ padding: 20 }}>
                <PdfLayout
                    title="USO DE ADITIVOS QUIMICOS PARA SERVICIOS DE ALIMENTOS"
                    tipo="REGISTRO"
                    version="001"
                    codigo="PLL-REG-127"
                >
                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>
                            DATOS DEL PRODUCTO
                        </Text>
                        <View style={styles.infoGrid}>
                            <View style={styles.infoItem}>
                                <Text style={styles.infoLabel}>
                                    Rango de fechas: desde{' '}
                                    {filtros?.fecha_desde || '-'} hasta{' '}
                                    {filtros?.fecha_hasta || '-'}
                                </Text>
                            </View>
                        </View>
                    </View>

                    <View style={styles.tableWrapper}>
                        <View style={styles.tableHeader}>
                            <Text style={styles.headerCell}>FECHA</Text>
                            <Text style={styles.headerCell}>WET BOIL 101</Text>
                            <Text style={styles.headerCell}>WET BOIL 201</Text>
                            <Text style={styles.headerCell}>WET BOIL 402</Text>
                            <Text style={styles.headerCell}>WET BOIL 801</Text>
                            <Text style={styles.headerCell}>SODA CÁUSTICA</Text>
                            <Text style={styles.headerCellLast}>ANALISTA</Text>
                        </View>
                        {registros.map((r: any, idx: number) => (
                            <View key={idx} style={styles.row}>
                                <Text style={styles.cell}>
                                    {formatFecha(r.tiempo)}
                                </Text>
                                <Text style={styles.cell}>
                                    {r.wet_boil_101 ?? '-'}
                                </Text>
                                <Text style={styles.cell}>
                                    {r.wet_boil_201 ?? '-'}
                                </Text>
                                <Text style={styles.cell}>
                                    {r.wet_boil_402 ?? '-'}
                                </Text>
                                <Text style={styles.cell}>
                                    {r.wet_boil_801 ?? '-'}
                                </Text>
                                <Text style={styles.cell}>
                                    {r.soda_caustica ?? '-'}
                                </Text>
                                <Text style={styles.cellLast}>
                                    {r.usuario?.codigo || '-'}
                                </Text>
                            </View>
                        ))}
                    </View>
                    <Text style={styles.legend}>Glosa: - = Sin Registro.</Text>

                    {/* Usuarios involucrados y firma */}
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
