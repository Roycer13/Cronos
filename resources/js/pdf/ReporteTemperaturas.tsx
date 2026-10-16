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
    headerRow: { flexDirection: 'row', borderBottomWidth: 1, borderColor: '#333', backgroundColor: '#E8F0FA' },
    headerSubRow: { flexDirection: 'row', borderBottomWidth: 1, borderColor: '#333', backgroundColor: '#E8F0FA' },
    headerCell: {
        padding: 2,
        fontSize: 6,
        fontWeight: 'bold',
        textAlign: 'center',
        borderRightWidth: 0.5,
        borderColor: '#333',
        justifyContent: 'center',
        alignItems: 'center',
    },
    headerCellLast: {
        padding: 2,
        fontSize: 6,
        fontWeight: 'bold',
        textAlign: 'center',
        justifyContent: 'center',
        alignItems: 'center',
    },
    cell: {
        paddingHorizontal: 2,
        paddingVertical: 1,
        fontSize: 5.5,
        textAlign: 'center',
        borderRightWidth: 0.5,
        borderColor: '#e0e0e0',
        justifyContent: 'center',
        alignItems: 'center',
    },
    cellLast: {
        paddingHorizontal: 2,
        paddingVertical: 1,
        fontSize: 5.5,
        textAlign: 'center',
        justifyContent: 'center',
        alignItems: 'center',
    },
    usersTable: { marginTop: 6, borderWidth: 0.5, borderColor: '#bbb', width: '65%', flex: 1 },
    usersHeader: { flexDirection: 'row', borderBottomWidth: 1, borderColor: '#333', backgroundColor: '#2c3e50' },
    usersCell: { flex: 1, padding: 2, fontSize: 7, color: '#fff', fontWeight: 'bold' },
});

export default function ReporteTemperaturas({ datos, usuariosInvolucrados }: any) {
    const registros = Array.isArray(datos) ? datos : [];
    const usuarios = Array.isArray(usuariosInvolucrados) ? usuariosInvolucrados : [];

    // Definir anchos de columnas
    const flexFecha = 1.2;
    const flexDispositivo = 1.2;
    const flexSub = 0.9;
    const flexResponsable = 1.2;
    const flexEstado = 1;
    const flexObservaciones = 2;

    // Función para mostrar estado según requiere_ajuste o estado.nombre
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
                    title="VERIFICACIÓN DE TERMÓMETROS"
                    tipo="REGISTRO"
                    version="001"
                    codigo="PLL-REG-130"
                >
                    <View style={styles.tableWrapper}>
                        {/* Primera fila: encabezados principales */}
                        <View style={styles.headerRow}>
                            <View style={{ flex: flexFecha }}><Text style={styles.headerCell}>Fecha</Text></View>
                            <View style={{ flex: flexDispositivo }}><Text style={styles.headerCell}>Dispositivo</Text></View>
                            <View style={{ flex: flexSub * 3 }}><Text style={styles.headerCell}>T[°C] 1er Punto</Text></View>
                            <View style={{ flex: flexSub * 3 }}><Text style={styles.headerCell}>T[°C] 2do Punto</Text></View>
                            <View style={{ flex: flexSub * 3 }}><Text style={styles.headerCell}>T[°C] 3er Punto</Text></View>
                            <View style={{ flex: flexResponsable }}><Text style={styles.headerCell}>Responsable</Text></View>
                            <View style={{ flex: flexEstado }}><Text style={styles.headerCell}>Estado</Text></View>
                            <View style={{ flex: flexObservaciones }}><Text style={styles.headerCellLast}>Observaciones</Text></View>
                        </View>

                        {/* Segunda fila: subcolumnas para los puntos */}
                        <View style={styles.headerSubRow}>
                            <View style={{ flex: flexFecha }} />
                            <View style={{ flex: flexDispositivo }} />
                            <View style={{ flex: flexSub }}><Text style={styles.headerCell}>Patrón</Text></View>
                            <View style={{ flex: flexSub }}><Text style={styles.headerCell}>Instr.</Text></View>
                            <View style={{ flex: flexSub }}><Text style={styles.headerCell}>Error</Text></View>
                            <View style={{ flex: flexSub }}><Text style={styles.headerCell}>Patrón</Text></View>
                            <View style={{ flex: flexSub }}><Text style={styles.headerCell}>Instr.</Text></View>
                            <View style={{ flex: flexSub }}><Text style={styles.headerCell}>Error</Text></View>
                            <View style={{ flex: flexSub }}><Text style={styles.headerCell}>Patrón</Text></View>
                            <View style={{ flex: flexSub }}><Text style={styles.headerCell}>Instr.</Text></View>
                            <View style={{ flex: flexSub }}><Text style={styles.headerCell}>Error</Text></View>
                            <View style={{ flex: flexResponsable }} />
                            <View style={{ flex: flexEstado }} />
                            <View style={{ flex: flexObservaciones }} />
                        </View>

                        {/* Filas de datos */}
                        {registros.map((reg, idx) => (
                            <View key={idx} style={{ flexDirection: 'row', borderBottomWidth: 0.5, borderColor: '#e0e0e0', paddingVertical: 0.5, backgroundColor: '#fafafa' }}>
                                <View style={{ flex: flexFecha }}><Text style={styles.cell}>{formatFecha(reg.fecha_hora)}</Text></View>
                                <View style={{ flex: flexDispositivo }}><Text style={styles.cell}>{reg.dispositivo_medicion?.codigo || reg.dispositivos_medicion_id || '-'}</Text></View>
                                {/* 1er Punto */}
                                <View style={{ flex: flexSub }}><Text style={styles.cell}>{formatDecimal(reg.patron_1)}</Text></View>
                                <View style={{ flex: flexSub }}><Text style={styles.cell}>{formatDecimal(reg.inst_1)}</Text></View>
                                <View style={{ flex: flexSub }}><Text style={styles.cell}>{formatDecimal(reg.error_1)}</Text></View>
                                {/* 2do Punto */}
                                <View style={{ flex: flexSub }}><Text style={styles.cell}>{formatDecimal(reg.patron_2)}</Text></View>
                                <View style={{ flex: flexSub }}><Text style={styles.cell}>{formatDecimal(reg.inst_2)}</Text></View>
                                <View style={{ flex: flexSub }}><Text style={styles.cell}>{formatDecimal(reg.error_2)}</Text></View>
                                {/* 3er Punto */}
                                <View style={{ flex: flexSub }}><Text style={styles.cell}>{formatDecimal(reg.patron_3)}</Text></View>
                                <View style={{ flex: flexSub }}><Text style={styles.cell}>{formatDecimal(reg.inst_3)}</Text></View>
                                <View style={{ flex: flexSub }}><Text style={styles.cell}>{formatDecimal(reg.error_3)}</Text></View>
                                {/* Responsable */}
                                <View style={{ flex: flexResponsable }}><Text style={styles.cell}>{reg.usuario?.codigo || reg.usuario?.name || reg.user_id || '-'}</Text></View>
                                {/* Estado */}
                                <View style={{ flex: flexEstado }}><Text style={styles.cell}>{getEstadoDisplay(reg)}</Text></View>
                                {/* Observaciones */}
                                <View style={{ flex: flexObservaciones }}><Text style={styles.cellLast}>{reg.observaciones || '-'}</Text></View>
                            </View>
                        ))}
                    </View>

                    {/* Usuarios + firma */}
                    <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 8, gap: 8, pageBreakInside: 'avoid' as any }}>
                        <View style={styles.usersTable}>
                            <View style={styles.usersHeader}>
                                <Text style={styles.usersCell}>CÓDIGO</Text>
                                <Text style={styles.usersCell}>NOMBRE</Text>
                            </View>
                            {usuarios.map((u, i) => (
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
