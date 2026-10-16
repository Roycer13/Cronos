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
        fontSize: 10,
        fontWeight: 'bold',
        marginBottom: 4,
        backgroundColor: '#E8F0FA',
        padding: 3,
        color: '#000',
    },
    tableWrapper: {
        borderWidth: 0.5,
        borderColor: '#bbb',
        marginTop: 3,
    },
    tableHeader: {
        flexDirection: 'row',
        backgroundColor: '#1E40AF',
        borderBottomWidth: 1,
        borderBottomColor: '#666',
    },
    tableRow: {
        flexDirection: 'row',
        borderBottomWidth: 0.5,
        borderBottomColor: '#ddd',
        minHeight: 20,
    },
    tableCell: {
        flex: 1,
        padding: 4,
        fontSize: 7,
        color: '#000',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        textAlign: 'center' as const,
    },
    headerCell: {
        flex: 1,
        padding: 4,
        fontSize: 7,
        fontWeight: 'bold',
        color: '#fff',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        textAlign: 'center' as const,
    },
    container: {
        paddingBottom: 20,
    },
});

interface Dispositivo {
    id: number;
    codigo: string;
    dispositivo: string;
    marca: string;
    modelo: string;
    capacidadMedicion: string;
    rangoUso: string;
    areaUso: string;
    responsable: string;
    baja: boolean;
    observaciones: string;
}

interface Props {
    dispositivos: Dispositivo[];
}

export default function ReporteDispositivosMedicion({ dispositivos = [] }: Props) {
    // Agrupar por tipo de dispositivo
    const agrupadosPorTipo: Record<string, Dispositivo[]> = {};

    dispositivos.forEach((dispositivo) => {
        const tipo = dispositivo.dispositivo || 'Sin Tipo';
        if (!agrupadosPorTipo[tipo]) {
            agrupadosPorTipo[tipo] = [];
        }
        agrupadosPorTipo[tipo].push(dispositivo);
    });

    const totalActivos = dispositivos.filter((d) => !d.baja).length;
    const totalBaja = dispositivos.filter((d) => d.baja).length;

    return (
        <Document>
            <Page size="A4" style={{ ...styles.container, padding: 10 }}>
                <PdfLayout
                    title="REPORTE DE DISPOSITIVOS DE MEDICIÓN"
                    tipo="REGISTRO"
                    version="001"
                    codigo="PLL-REP-001"
                >
                    {/* RESUMEN GENERAL */}
                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>RESUMEN GENERAL</Text>
                        <View
                            style={{
                                flexDirection: 'row',
                                justifyContent: 'space-around',
                                marginTop: 4,
                            }}
                        >
                            <View>
                                <Text style={{ fontSize: 8, fontWeight: 'bold' }}>
                                    Total de Dispositivos
                                </Text>
                                <Text
                                    style={{
                                        fontSize: 14,
                                        fontWeight: 'bold',
                                        color: '#1E40AF',
                                    }}
                                >
                                    {dispositivos.length}
                                </Text>
                            </View>
                            <View>
                                <Text style={{ fontSize: 8, fontWeight: 'bold' }}>
                                    Dispositivos Activos
                                </Text>
                                <Text
                                    style={{
                                        fontSize: 14,
                                        fontWeight: 'bold',
                                        color: '#15803D',
                                    }}
                                >
                                    {totalActivos}
                                </Text>
                            </View>
                            <View>
                                <Text style={{ fontSize: 8, fontWeight: 'bold' }}>
                                    Dispositivos de Baja
                                </Text>
                                <Text
                                    style={{
                                        fontSize: 14,
                                        fontWeight: 'bold',
                                        color: '#DC2626',
                                    }}
                                >
                                    {totalBaja}
                                </Text>
                            </View>
                        </View>
                    </View>

                    {/* TABLA POR TIPO DE DISPOSITIVO */}
                    {Object.entries(agrupadosPorTipo).map(([tipo, items]) => (
                        <View key={tipo} style={styles.section}>
                            <Text style={styles.sectionTitle}>
                                {tipo.toUpperCase()} ({items.length})
                            </Text>

                            <View style={styles.tableWrapper}>
                                <View style={styles.tableHeader}>
                                    <Text style={{ ...styles.headerCell, flex: 0.8 }}>
                                        Código
                                    </Text>
                                    <Text style={{ ...styles.headerCell, flex: 1.2 }}>
                                        Marca
                                    </Text>
                                    <Text style={{ ...styles.headerCell, flex: 1.2 }}>
                                        Modelo
                                    </Text>
                                    <Text style={{ ...styles.headerCell, flex: 1 }}>
                                        Capacidad
                                    </Text>
                                    <Text style={{ ...styles.headerCell, flex: 1 }}>
                                        Rango Uso
                                    </Text>
                                    <Text style={{ ...styles.headerCell, flex: 1 }}>
                                        Área
                                    </Text>
                                    <Text style={{ ...styles.headerCell, flex: 0.8 }}>
                                        Responsable
                                    </Text>
                                    <Text style={{ ...styles.headerCell, flex: 0.6 }}>
                                        Estado
                                    </Text>
                                </View>

                                {items.map((dispositivo) => (
                                    <View key={dispositivo.id} style={styles.tableRow}>
                                        <Text
                                            style={{
                                                ...styles.tableCell,
                                                flex: 0.8,
                                                fontWeight: 'bold',
                                            }}
                                        >
                                            {dispositivo.codigo || '-'}
                                        </Text>
                                        <Text style={{ ...styles.tableCell, flex: 1.2 }}>
                                            {dispositivo.marca || '-'}
                                        </Text>
                                        <Text style={{ ...styles.tableCell, flex: 1.2 }}>
                                            {dispositivo.modelo || '-'}
                                        </Text>
                                        <Text style={{ ...styles.tableCell, flex: 1 }}>
                                            {dispositivo.capacidadMedicion || '-'}
                                        </Text>
                                        <Text style={{ ...styles.tableCell, flex: 1 }}>
                                            {dispositivo.rangoUso || '-'}
                                        </Text>
                                        <Text style={{ ...styles.tableCell, flex: 1 }}>
                                            {dispositivo.areaUso || '-'}
                                        </Text>
                                        <Text style={{ ...styles.tableCell, flex: 0.8 }}>
                                            {dispositivo.responsable || '-'}
                                        </Text>
                                        <Text
                                            style={{
                                                ...styles.tableCell,
                                                flex: 0.6,
                                                color: dispositivo.baja
                                                    ? '#DC2626'
                                                    : '#15803D',
                                                fontWeight: 'bold',
                                            }}
                                        >
                                            {dispositivo.baja ? 'Baja' : 'Activo'}
                                        </Text>
                                    </View>
                                ))}
                            </View>
                        </View>
                    ))}

                    {/* FOOTER */}
                    <View style={{ marginTop: 20, fontSize: 7, textAlign: 'center' }}>
                        <Text>
                            Generado automáticamente el{' '}
                            {new Date().toLocaleDateString('es-BO')}
                        </Text>
                    </View>
                </PdfLayout>
            </Page>
        </Document>
    );
}
