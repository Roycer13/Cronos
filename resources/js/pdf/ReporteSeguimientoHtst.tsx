import { Document, Page, StyleSheet, Text, View } from '@react-pdf/renderer';
import PdfLayout from './PdfLayout';

function formatFecha(value?: string | Date | null) {
    if (!value) return '-';
    try {
        const fecha = new Date(value);
        const dia = fecha.getDate().toString().padStart(2, '0');
        const mes = (fecha.getMonth() + 1).toString().padStart(2, '0');
        const año = fecha.getFullYear().toString().slice(-2);
        const hora = fecha.getHours().toString().padStart(2, '0');
        const minutos = fecha.getMinutes().toString().padStart(2, '0');
        return `${dia}-${mes}-${año} ${hora}:${minutos}`;
    } catch {
        return '-';
    }
}

// Formatea un número en notación científica usando caret (^) para el exponente
function formatScientific(value: any, decimals: number = 2, fallback: string = '-'): string {
    const num = Number(value);
    if (isNaN(num)) return fallback;
    if (num === 0) return '0';

    const absNum = Math.abs(num);
    if (absNum >= 1000000) return 'MNPC';

    const sign = num < 0 ? '-' : '';
    const exponent = Math.floor(Math.log10(absNum));
    const coefficient = absNum / Math.pow(10, exponent);
    // Redondear a los decimales especificados
    const roundedCoeff = coefficient.toFixed(decimals);
    // Eliminar ceros innecesarios al final (ej: "1.00" -> "1")
    const cleanCoeff = roundedCoeff.replace(/\.?0+$/, '');

    // Si el exponente es 0, mostrar solo el coeficiente (ej: 2 -> "2", no "2x10^0")
    if (exponent === 0) {
        return `${sign}${cleanCoeff}`;
    }
    // Usar formato con caret (^) para evitar problemas de fuentes con superíndices
    return `${sign}${cleanCoeff}x10^${exponent}`;
}

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
    tableWrapper: { borderWidth: 0.5, borderColor: '#bbb', marginTop: 3 },
    tableHeader: { flexDirection: 'row', borderBottomWidth: 1, borderColor: '#333', backgroundColor: '#E8F0FA' },
    headerCell: { flex: 1, padding: 2, fontSize: 6, fontWeight: 'bold', textAlign: 'center', borderRightWidth: 0.5, borderColor: '#333' },
    headerCellLast: { flex: 1, padding: 2, fontSize: 6, fontWeight: 'bold', textAlign: 'center' },
    row: { flexDirection: 'row', borderBottomWidth: 0.5, borderColor: '#e0e0e0', paddingVertical: 1, backgroundColor: '#fafafa' },
    cell: { flex: 1, paddingHorizontal: 2, fontSize: 5.5, textAlign: 'center', borderRightWidth: 0.5, borderColor: '#e0e0e0' },
    cellLast: { flex: 1, paddingHorizontal: 2, fontSize: 5.5, textAlign: 'center' },
    usersTable: { marginTop: 6, borderWidth: 0.5, borderColor: '#bbb', width: '65%', flex: 1 },
    usersHeader: { flexDirection: 'row', borderBottomWidth: 1, borderColor: '#333', backgroundColor: '#2c3e50' },
    usersCell: { flex: 1, padding: 2, fontSize: 7, color: '#fff', fontWeight: 'bold' },
});

export default function ReporteSeguimientoHtst({ datos, usuariosInvolucrados }: any) {
    const seguimientos = Array.isArray(datos) ? datos : [];
    const usuarios = Array.isArray(usuariosInvolucrados) ? usuariosInvolucrados : [];

    const orp = seguimientos[0]?.orp || null;
    const producto = orp?.producto_terminado || null;
    const vencimiento1 = orp?.fecha_vencimiento1;
    const vencimiento2 = orp?.fecha_vencimiento2;
    const fechaProduccion = orp?.tiempo_elaboracion;
    const preparacion = seguimientos[0]?.preparacion || '-';
    const destino = producto?.destino?.nombre || '-';

    return (
        <Document>
            <Page size="LETTER" orientation="landscape" style={{ padding: 20 }}>
                <PdfLayout
                    title="CONTROL MICROBIOLÓGICO – PRODUCTO TERMINADO (HTST)"
                    tipo="REGISTRO"
                    version="001"
                    codigo="PLL-REG-020"
                >
                    {/* Información general */}
                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>INFORMACIÓN GENERAL</Text>
                        <View style={styles.infoGrid}>
                            <View style={styles.infoItem}>
                                <Text style={styles.infoLabel}>Fecha de Producción:</Text>
                                <Text style={styles.infoValue}>{formatFecha(fechaProduccion)}</Text>
                            </View>
                            <View style={styles.infoItem}>
                                <Text style={styles.infoLabel}>Fecha(s) de Vencimiento:</Text>
                                <Text style={styles.infoValue}>
                                    {formatFecha(vencimiento1)}{vencimiento2 ? ` / ${formatFecha(vencimiento2)}` : ''}
                                </Text>
                            </View>
                            <View style={styles.infoItem}>
                                <Text style={styles.infoLabel}>ORP:</Text>
                                <Text style={styles.infoValue}>{orp?.codigo || '-'}</Text>
                            </View>
                            <View style={styles.infoItem}>
                                <Text style={styles.infoLabel}>Preparación:</Text>
                                <Text style={styles.infoValue}>{preparacion}</Text>
                            </View>
                            <View style={styles.infoItem}>
                                <Text style={styles.infoLabel}>Producto:</Text>
                                <Text style={styles.infoValue}>{producto?.nombre_sap || '-'}</Text>
                            </View>
                            <View style={styles.infoItem}>
                                <Text style={styles.infoLabel}>Destino:</Text>
                                <Text style={styles.infoValue}>{destino}</Text>
                            </View>
                        </View>
                    </View>

                    {/* Tabla de seguimientos */}
                    <View style={styles.tableWrapper}>
                        <View style={styles.tableHeader}>
                            <Text style={styles.headerCell}>FECHA DE ANÁLISIS</Text>
                            <Text style={styles.headerCell}>ANALISTA DE SIEMBRA</Text>
                            <Text style={styles.headerCell}>LOTE</Text>
                            <Text style={styles.headerCell}>AEROBIOS MESÓFILOS TOTALES [UFC/ML]</Text>
                            <Text style={styles.headerCell}>COLIFORMES TOTALES [UFC/ML]</Text>
                            <Text style={styles.headerCell}>ENCARGADO LECTURA 2 DÍAS</Text>
                            <Text style={styles.headerCell}>MOHOS Y LEVADURAS [UFC/ML]</Text>
                            <Text style={styles.headerCell}>ENCARGADO LECTURA 5 DÍAS</Text>
                            <Text style={styles.headerCellLast}>OBSERVACIONES</Text>
                        </View>
                        {seguimientos.map((s, idx) => (
                            <View key={idx} style={styles.row}>
                                <Text style={styles.cell}>{formatFecha(s.tiempo_siembra)}</Text>
                                <Text style={styles.cell}>{s.usuario_siembra?.codigo || '-'}</Text>
                                <Text style={styles.cell}>{`${s.preparacion || ''} `.trim() || '-'}</Text>
                                <Text style={styles.cell}>{formatScientific(s.aerovios, 2)}</Text>
                                <Text style={styles.cell}>{formatScientific(s.coliformes, 2)}</Text>
                                <Text style={styles.cell}>{s.usuario_dia2?.codigo || '-'}</Text>
                                <Text style={styles.cell}>{formatScientific(s.mohos, 2)}</Text>
                                <Text style={styles.cell}>{s.usuario_dia5?.codigo || '-'}</Text>
                                <Text style={styles.cellLast}>{s.observacion_siembra || s.observacion_lectura || '-'}</Text>
                            </View>
                        ))}
                    </View>
                                                  <Text style={styles.legend}>Glosa: - = Sin Registro.</Text>


                    {/* Usuarios involucrados + firma */}
                    <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 8, gap: 8, pageBreakInside: 'avoid' as any }}>
                        <View style={styles.usersTable}>
                            <View style={styles.usersHeader}>
                                <Text style={styles.usersCell}>CÓDIGO</Text>
                                <Text style={styles.usersCell}>NOMBRE</Text>
                            </View>
                            {usuarios.map((u, i) => (
                                <View key={i} style={{ flexDirection: 'row', borderBottomWidth: 0.5, borderColor: '#ddd', backgroundColor: i % 2 === 0 ? '#fafafa' : '#fff', paddingVertical: 2 }}>
                                    <Text style={{ ...styles.usersCell, color: '#000', fontWeight: 'normal' }}>{u.codigo}</Text>
                                    <Text style={{ ...styles.usersCell, color: '#000', fontWeight: 'normal' }}>{`${u.nombre} `}</Text>
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
