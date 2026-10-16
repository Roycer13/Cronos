import { Document, Page, StyleSheet, Text, View } from '@react-pdf/renderer';
import PdfLayout from './PdfLayout';

function formatFecha(value?: string | Date | null) {
    if (!value) return '-';
    try {
        const fecha = new Date(value);
        const dia = fecha.getDate().toString().padStart(2, '0');
        const mes = (fecha.getMonth() + 1).toString().padStart(2, '0');
        const año = fecha.getFullYear().toString().slice(-2);
        return `${dia}-${mes}-${año}`; // sin hora
    } catch {
        return '-';
    }
}

// Función para formatear números a un decimal
function formatDecimal(value: any) {
    if (value === null || value === undefined || value === '') return '-';
    const num = Number(value);
    if (isNaN(num)) return value;
    return num.toFixed(1);
}

const styles = StyleSheet.create({
    tableWrapper: { borderWidth: 0.5, borderColor: '#bbb', marginTop: 3 },
    tableHeader: {
        flexDirection: 'row',
        borderBottomWidth: 1,
        borderColor: '#333',
        backgroundColor: '#E8F0FA',
        alignItems: 'stretch',
    },
    headerCell: {
        flex: 1,
        padding: 1.5,
        fontSize: 5.5,
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
        fontSize: 5.5,
        fontWeight: 'bold',
        textAlign: 'center',
        color: '#000',
        justifyContent: 'center',
        alignItems: 'center',
    },
    // Estilos para el encabezado agrupado
    groupContainer: {
        flex: 6,
        flexDirection: 'column',
        borderRightWidth: 0.5,
        borderColor: '#333',
        minHeight: 22, // altura mínima para evitar cortes
    },
    groupLabel: {
        fontSize: 5.5,
        fontWeight: 'bold',
        textAlign: 'center',
        color: '#000',
        paddingVertical: 3,
        borderBottomWidth: 0.5,
        borderColor: '#333',
        backgroundColor: '#D5E3F0',
        minHeight: 10,
    },
    subHeaderRow: {
        flexDirection: 'row',
        minHeight: 12, // altura mínima para la segunda fila
        flex: 1,
    },
    subHeaderCell: {
        flex: 1,
        fontSize: 5.5,
        fontWeight: 'bold',
        textAlign: 'center',
        color: '#000',
        paddingVertical: 2,
        borderRightWidth: 0.5,
        borderColor: '#333',
        justifyContent: 'center',
        alignItems: 'center',
    },
    subHeaderCellLast: {
        flex: 1,
        fontSize: 5.5,
        fontWeight: 'bold',
        textAlign: 'center',
        color: '#000',
        paddingVertical: 2,
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
        fontSize: 5,
        textAlign: 'center',
        justifyContent: 'center',
        alignItems: 'center',
        borderRightWidth: 0.5,
        borderColor: '#e0e0e0',
    },
    cellLast: {
        flex: 1,
        paddingHorizontal: 2,
        paddingVertical: 0.5,
        fontSize: 5,
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

export default function ReportePhmetros({ datos, usuariosInvolucrados }: any) {
    const registros = Array.isArray(datos) ? datos : [];
    const usuarios = Array.isArray(usuariosInvolucrados) ? usuariosInvolucrados : [];

    // Mostrar estado según requiere_ajuste
    const getEstadoDisplay = (reg: any) => {
        
        if (reg.estado?.nombre) {
            return reg.estado.nombre === 'Verificado' ? 'Conforme' : 'No conforme';
        }
        return '-';
    };

    return (
        <Document>
            <Page size="LETTER" orientation="landscape" style={{ padding: 20 }}>
                <PdfLayout
                    title="VERIFICACIÓN Y AJUSTE DE pHMETRO"
                    tipo="REGISTRO"
                    version="001"
                    codigo="PLL-REG-135"
                >
                    <View style={styles.tableWrapper}>
                        {/* Encabezado de dos filas */}
                        <View style={styles.tableHeader}>
                            <Text style={styles.headerCell}>Fecha</Text>
                            <Text style={styles.headerCell}>Dispositivo</Text>

                            {/* Grupo Verificación (6 columnas) */}
                            <View style={styles.groupContainer}>
                                <Text style={styles.groupLabel}>Verificación</Text>
                                <View style={styles.subHeaderRow}>
                                    <Text style={styles.subHeaderCell}>Temp. 1 (°C)</Text>
                                    <Text style={styles.subHeaderCell}>pH 4</Text>
                                    <Text style={styles.subHeaderCell}>Temp. 2 (°C)</Text>
                                    <Text style={styles.subHeaderCell}>pH 7</Text>
                                    <Text style={styles.subHeaderCell}>Temp. 3 (°C)</Text>
                                    <Text style={styles.subHeaderCellLast}>pH 10</Text>
                                </View>
                            </View>

                            <Text style={styles.headerCell}>Requiere Ajuste</Text>

                            {/* Grupo Verificación de Ajuste (6 columnas) */}
                            <View style={styles.groupContainer}>
                                <Text style={styles.groupLabel}>Verificación de Ajuste</Text>
                                <View style={styles.subHeaderRow}>
                                    <Text style={styles.subHeaderCell}>Temp.  1 (°C)</Text>
                                    <Text style={styles.subHeaderCell}>pH 4 </Text>
                                    <Text style={styles.subHeaderCell}>Temp.  2 (°C)</Text>
                                    <Text style={styles.subHeaderCell}>pH 7 </Text>
                                    <Text style={styles.subHeaderCell}>Temp.  3 (°C)</Text>
                                    <Text style={styles.subHeaderCellLast}>pH 10 </Text>
                                </View>
                            </View>

                            <Text style={styles.headerCell}>Responsable</Text>
                            <Text style={styles.headerCell}>Estado</Text>
                            <Text style={styles.headerCellLast}>Observaciones</Text>
                        </View>

                        {/* Filas de datos */}
                        {registros.map((reg, idx) => (
                            <View key={idx} style={styles.row}>
                                <Text style={styles.cell}>{formatFecha(reg.fecha_hora)}</Text>
                                <Text style={styles.cell}>
                                    {reg.dispositivo_medicion?.codigo || reg.dispositivos_medicion_id || '-'}
                                </Text>
                                <Text style={styles.cell}>{reg.verificacion_temperatura1 ?? '-'}</Text>
                                <Text style={styles.cell}>{reg.verificacion_temperatura2 ?? '-'}</Text>
                                <Text style={styles.cell}>{reg.verificacion_temperatura3 ?? '-'}</Text>
                                <Text style={styles.cell}>{reg.verificacion_4 ?? '-'}</Text>
                                <Text style={styles.cell}>{reg.verificacion_7 ?? '-'}</Text>
                                <Text style={styles.cell}>{reg.verificacion_10 ?? '-'}</Text>
                                <Text style={styles.cell}>{reg.requiere_ajuste ? 'Sí' : 'No'}</Text>
                                <Text style={styles.cell}>{formatDecimal(reg.verificacion_ajuste_temperatura1)}</Text>
                                <Text style={styles.cell}>{formatDecimal(reg.verificacion_ajuste_4)}</Text>
                                <Text style={styles.cell}>{formatDecimal(reg.verificacion_ajuste_temperatura2)}</Text>
                                <Text style={styles.cell}>{formatDecimal(reg.verificacion_ajuste_7)}</Text>
                                <Text style={styles.cell}>{formatDecimal(reg.verificacion_ajuste_temperatura3)}</Text>
                                <Text style={styles.cell}>{formatDecimal(reg.verificacion_ajuste_10)}</Text>
                                <Text style={styles.cell}>
                                    {reg.usuario?.codigo || reg.usuario?.name ||  reg.user_id || '-'}
                                </Text>
                                <Text style={styles.cell}>{getEstadoDisplay(reg)}</Text>
                                <Text style={styles.cellLast}>{reg.observaciones || '-'}</Text>
                            </View>
                        ))}
                    </View>

                    {/* Usuarios + firma (sin cambios) */}
                    <View
                        style={{
                            flexDirection: 'row',
                            justifyContent: 'space-between',
                            marginTop: 8,
                            gap: 8,
                            pageBreakInside: 'avoid' as any,
                        }}
                    >
                        <View style={styles.usersTable}>
                            <View style={styles.usersHeader}>
                                <Text style={styles.usersCell}>CÓDIGO</Text>
                                <Text style={styles.usersCell}>NOMBRE (CÓDIGO)</Text>
                            </View>
                            {usuarios.map((u, i) => (
                                <View
                                    key={i}
                                    style={{
                                        flexDirection: 'row',
                                        borderBottomWidth: 0.5,
                                        borderColor: '#ddd',
                                        backgroundColor: i % 2 === 0 ? '#fafafa' : '#fff',
                                        paddingVertical: 2,
                                    }}
                                >
                                    <Text style={{ ...styles.usersCell, color: '#000', fontWeight: 'normal' }}>
                                        {u.codigo}
                                    </Text>
                                    <Text style={{ ...styles.usersCell, color: '#000', fontWeight: 'normal' }}>
                                        {`${u.nombre} (${u.codigo})`}
                                    </Text>
                                </View>
                            ))}
                        </View>
                        <View
                            style={{
                                width: '33%',
                                borderWidth: 1,
                                borderColor: '#2c3e50',
                                padding: 8,
                                backgroundColor: '#fafafa',
                            }}
                        >
                            <View
                                style={{
                                    borderBottomWidth: 2,
                                    borderColor: '#2c3e50',
                                    height: 40,
                                    marginBottom: 6,
                                }}
                            />
                            <Text
                                style={{
                                    fontSize: 7,
                                    fontWeight: 'bold',
                                    textAlign: 'center',
                                    color: '#2c3e50',
                                    marginBottom: 2,
                                }}
                            >
                                FIRMA REVISOR
                            </Text>
                            <Text style={{ fontSize: 5.5, textAlign: 'center', color: '#666' }}>
                                Fecha: ___/___/_____
                            </Text>
                        </View>
                    </View>
                </PdfLayout>
            </Page>
        </Document>
    );
}
