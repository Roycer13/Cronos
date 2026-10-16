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
    sectionTitle: {
        fontSize: 9,
        fontWeight: 'bold',
        color: '#2c3e50',
        marginTop: 8,
        marginBottom: 4,
        textAlign: 'left',
    },
    card: {
        borderWidth: 0.5,
        borderColor: '#bbb',
        marginBottom: 8,
        padding: 6,
        backgroundColor: '#fafafa',
    },
    cardHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        borderBottomWidth: 0.5,
        borderColor: '#ddd',
        paddingBottom: 4,
        marginBottom: 4,
    },
    cardTitle: {
        fontSize: 8,
        fontWeight: 'bold',
        color: '#2c3e50',
    },
    cardSubtitle: {
        fontSize: 6,
        color: '#666',
    },
    insectGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        marginBottom: 4,
    },
    insectItem: {
        width: '20%',
        textAlign: 'center',
        padding: 2,
    },
    insectLabel: {
        fontSize: 5.5,
        color: '#555',
        marginBottom: 1,
    },
    insectValue: {
        fontSize: 8,
        fontWeight: 'bold',
        color: '#000',
    },
    estadoOk: {
        color: '#27ae60',
        fontSize: 7,
        fontWeight: 'bold',
    },
    estadoNoOk: {
        color: '#e74c3c',
        fontSize: 7,
        fontWeight: 'bold',
    },
    observacionBox: {
        marginTop: 4,
        padding: 4,
        backgroundColor: '#fff',
        borderLeftWidth: 2,
        borderLeftColor: '#e67e22',
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

const INSECT_LABELS = ['Moscas', 'Mosquitos', 'Abejas', 'Mariposas', 'Otros'];

export default function ReporteRegistroInsectos({ datos, usuariosInvolucrados, filtros }: any) {
    const registros = Array.isArray(datos) ? datos : [];
    const usuarios = Array.isArray(usuariosInvolucrados) ? usuariosInvolucrados : [];

    // Agrupar por sector
    const agrupados = registros.reduce((acc: any, reg: any) => {
        const sector = reg.sector || 'Sin Sector';
        if (!acc[sector]) acc[sector] = [];
        acc[sector].push(reg);
        return acc;
    }, {});

    const sectoresOrdenados = Object.keys(agrupados).sort((a, b) => a.localeCompare(b));

    return (
        <Document>
            <Page size="LETTER" orientation="portrait" style={{ padding: 30 }}>
                <PdfLayout
                    title="CONTROL DE VECTORES - INSECTOS"
                    tipo="REGISTRO"
                    version="001"
                    codigo="PLL-REG-196"
                >
                    {filtros && (filtros.fecha_desde || filtros.fecha_hasta) && (
                        <View style={{ marginBottom: 4, fontSize: 7, color: '#666' }}>
                            <Text>
                                Período: {filtros.fecha_desde ? formatFecha(filtros.fecha_desde) : 'Inicio'} 
                                {' - '} 
                                {filtros.fecha_hasta ? formatFecha(filtros.fecha_hasta) : 'Actual'}
                            </Text>
                        </View>
                    )}

                    {sectoresOrdenados.length === 0 ? (
                        <Text style={{ fontSize: 8, textAlign: 'center', marginTop: 20 }}>
                            No hay registros para el período seleccionado.
                        </Text>
                    ) : (
                        sectoresOrdenados.map((sector, idxSector) => (
                            <View key={idxSector}>
                                <Text style={styles.sectionTitle}>
                                    Sector: {sector} ({agrupados[sector].length} registros)
                                </Text>

                                {agrupados[sector].map((reg: any, idxReg: number) => (
                                    <View key={idxReg} style={styles.card}>
                                        <View style={styles.cardHeader}>
                                            <View>
                                                <Text style={styles.cardTitle}>
                                                    {reg.equipo_codigo} — {reg.equipo_tipo}
                                                </Text>
                                                <Text style={styles.cardSubtitle}>
                                                    Fecha: {formatFecha(reg.fecha)}
                                                </Text>
                                            </View>
                                            <Text style={styles.cardSubtitle}>
                                                Inspector: {reg.inspector || '-'}
                                            </Text>
                                        </View>

                                        {/* Conteo de insectos */}
                                        <View style={styles.insectGrid}>
                                            {INSECT_LABELS.map((label, idx) => {
                                                const valores = [reg.mosca, reg.mosquito, reg.abeja, reg.mariposa, reg.otros];
                                                return (
                                                    <View key={idx} style={styles.insectItem}>
                                                        <Text style={styles.insectLabel}>{label}</Text>
                                                        <Text style={styles.insectValue}>{valores[idx]}</Text>
                                                    </View>
                                                );
                                            })}
                                            <View style={[styles.insectItem, { backgroundColor: '#f0f0f0', borderRadius: 2 }]}>
                                                <Text style={styles.insectLabel}>Total</Text>
                                                <Text style={[styles.insectValue, { color: '#e67e22' }]}>{reg.total}</Text>
                                            </View>
                                        </View>

                                        {/* Estado del equipo y adhesivo */}
                                        <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 2 }}>
                                            <Text style={{ fontSize: 6 }}>
                                                Adhesivo: {reg.cambio_adhesivo ? 'Cambiado' : 'No'}
                                            </Text>
                                            <Text style={reg.estado_equipo ? styles.estadoOk : styles.estadoNoOk}>
                                                Equipo: {reg.estado_equipo ? 'Conforme' : 'No conforme'}
                                            </Text>
                                        </View>

                                        {/* Observaciones y correcciones */}
                                        {(reg.observacion || reg.correcion) && (
                                            <View style={styles.observacionBox}>
                                                {reg.observacion && (
                                                    <Text style={{ fontSize: 6, marginBottom: 2 }}>
                                                        <Text style={{ fontWeight: 'bold' }}>Observación: </Text>
                                                        {reg.observacion}
                                                    </Text>
                                                )}
                                                {reg.correcion && (
                                                    <Text style={{ fontSize: 6 }}>
                                                        <Text style={{ fontWeight: 'bold' }}>Corrección: </Text>
                                                        {reg.correcion}
                                                    </Text>
                                                )}
                                            </View>
                                        )}
                                    </View>
                                ))}
                            </View>
                        ))
                    )}

                    {/* Usuarios + firma */}
                    <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 15, gap: 8, pageBreakInside: 'avoid' as any }}>
                        <View style={styles.usersTable}>
                            <View style={styles.usersHeader}>
                                <Text style={styles.usersCell}>CÓDIGO</Text>
                                <Text style={styles.usersCell}>NOMBRE</Text>
                            </View>
                            {usuarios.map((u, i) => (
                                <View key={i} style={{ flexDirection: 'row', borderBottomWidth: 0.5, borderColor: '#ddd', backgroundColor: i % 2 === 0 ? '#fafafa' : '#fff', paddingVertical: 2 }}>
                                    <Text style={{ ...styles.usersCell, color: '#000', fontWeight: 'normal' }}>{u.codigo}</Text>
                                    <Text style={{ ...styles.usersCell, color: '#000', fontWeight: 'normal' }}>{u.nombre}</Text>
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