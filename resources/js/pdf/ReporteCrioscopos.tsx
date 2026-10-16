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

// Función para mostrar los valores de ajuste
const displayAjusteA = (value: any) => (value ? '0.000 °C' : 'No');
const displayAjusteB = (value: any) => (value ? '-0.557 °C' : 'No');

// Estado conforme / no conforme
const getEstadoDisplay = (reg: any) => {
    if (reg.estado?.nombre) {
        return reg.estado.nombre === 'Verificado' ? 'Conforme' : 'No conforme';
    }
    return '-';
};

const styles = StyleSheet.create({
    tableWrapper: { borderWidth: 0.5, borderColor: '#bbb', marginTop: 3 },
    tableHeader: { flexDirection: 'row', borderBottomWidth: 1, borderColor: '#333', backgroundColor: '#E8F0FA' },
    headerCell: { padding: 2, fontSize: 6, borderRightWidth: 0.5, borderColor: '#333', fontWeight: 'bold', textAlign: 'center', color: '#000', justifyContent: 'center', alignItems: 'center' },
    headerCellLast: { padding: 2, fontSize: 6, fontWeight: 'bold', textAlign: 'center', color: '#000', justifyContent: 'center', alignItems: 'center' },
    row: { flexDirection: 'row', borderBottomWidth: 0.5, borderColor: '#e0e0e0', paddingVertical: 0.5, backgroundColor: '#fafafa', alignItems: 'stretch' },
    cell: { paddingHorizontal: 2, paddingVertical: 1, fontSize: 5.5, textAlign: 'center', borderRightWidth: 0.5, borderColor: '#e0e0e0', justifyContent: 'center', alignItems: 'center' },
    cellLast: { paddingHorizontal: 2, paddingVertical: 1, fontSize: 5.5, textAlign: 'center', justifyContent: 'center', alignItems: 'center' },
    usersTable: { marginTop: 6, borderWidth: 0.5, borderColor: '#bbb', width: '65%', flex: 1 },
    usersHeader: { flexDirection: 'row', borderBottomWidth: 1, borderColor: '#333', backgroundColor: '#2c3e50' },
    usersCell: { flex: 1, padding: 2, fontSize: 7, color: '#fff', fontWeight: 'bold' },
});

export default function ReporteCrioscopos({ datos, usuariosInvolucrados }: any) {
    const registros = Array.isArray(datos) ? datos : [];
    const usuarios = Array.isArray(usuariosInvolucrados) ? usuariosInvolucrados : [];

    // Definir anchos de columnas
    const flexFecha = 1.2;
    const flexDispositivo = 1.2;
    const flexAjusteA = 1;
    const flexAjusteB = 1;
    const flexResponsable = 1.2;
    const flexEstado = 1;
    const flexObservaciones = 2;

    return (
        <Document>
            <Page size="LETTER" orientation="landscape" style={{ padding: 20 }}>
                <PdfLayout
                    title="AJUSTE DE CRIOSCOPO"
                    tipo="REGISTRO"
                    version="001"
                    codigo="PLL-REG-173"
                >
                    <View style={styles.tableWrapper}>
                        <View style={styles.tableHeader}>
                            <View style={{ flex: flexFecha }}><Text style={styles.headerCell}>Fecha</Text></View>
                            <View style={{ flex: flexDispositivo }}><Text style={styles.headerCell}>Dispositivo</Text></View>
                            <View style={{ flex: flexAjusteA }}>
                                <Text style={styles.headerCell}>
                                    Ajuste A (0.000 °C = Conforme)
                                </Text>
                            </View>

                            <View style={{ flex: flexAjusteB }}>
                                <Text style={styles.headerCell}>
                                    Ajuste B (-0.557 °C = Conforme)
                                </Text>
                            </View>
                            <View style={{ flex: flexResponsable }}><Text style={styles.headerCell}>Responsable</Text></View>
                            <View style={{ flex: flexEstado }}><Text style={styles.headerCell}>Estado</Text></View>
                            <View style={{ flex: flexObservaciones }}><Text style={styles.headerCellLast}>Observaciones</Text></View>
                        </View>
                        {registros.map((reg, idx) => (
                            <View key={idx} style={styles.row}>
                                <Text style={{ ...styles.cell, flex: flexFecha }}>{formatFecha(reg.fecha_hora)}</Text>
                                <Text style={{ ...styles.cell, flex: flexDispositivo }}>
                                    {reg.dispositivo_medicion?.codigo || reg.dispositivos_medicion_id || '-'}
                                </Text>
                                <Text style={{ ...styles.cell, flex: flexAjusteA }}>{displayAjusteA(reg.punto_ajuste_a)}</Text>
                                <Text style={{ ...styles.cell, flex: flexAjusteB }}>{displayAjusteB(reg.punto_ajuste_b)}</Text>
                                <Text style={{ ...styles.cell, flex: flexResponsable }}>
                                    {reg.usuario?.codigo || reg.usuario?.name || reg.user_id || '-'}
                                </Text>
                                <Text style={{ ...styles.cell, flex: flexEstado }}>{getEstadoDisplay(reg)}</Text>
                                <Text style={{ ...styles.cellLast, flex: flexObservaciones }}>{reg.observaciones || '-'}</Text>
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
