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
    tableWrapper: { borderWidth: 0.5, borderColor: '#bbb', marginTop: 3 },
    tableHeader: {
        flexDirection: 'row',
        borderBottomWidth: 1,
        borderColor: '#333',
        backgroundColor: '#E8F0FA',
        minHeight: 28, // 👈 altura mínima para dos líneas
    },
    headerCell: {
        flex: 1,
        paddingVertical: 5,   // 👈 más espacio vertical
        paddingHorizontal: 2,
        fontSize: 5.5,        // 👈 ligeramente más pequeño para que quepa
        borderRightWidth: 0.5,
        borderColor: '#333',
        fontWeight: 'bold',
        textAlign: 'center',
        color: '#000',
        justifyContent: 'center',
        alignItems: 'center',
        flexWrap: 'wrap',     // 👈 permite que el texto se divida en varias líneas
    },
    headerCellLast: {
        flex: 1,
        paddingVertical: 5,
        paddingHorizontal: 2,
        fontSize: 5.5,
        fontWeight: 'bold',
        textAlign: 'center',
        color: '#000',
        justifyContent: 'center',
        alignItems: 'center',
        flexWrap: 'wrap',
    },
    row: {
        flexDirection: 'row',
        borderBottomWidth: 0.5,
        borderColor: '#e0e0e0',
        paddingVertical: 0.5,
        backgroundColor: '#fafafa',
        alignItems: 'stretch',
    },
    cell: {
        flex: 1,
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
        flex: 1,
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

export default function ReporteDistribucionCarros({ datos, usuariosInvolucrados, filtros }: any) {
    const registros = Array.isArray(datos) ? datos : [];
    const usuarios = Array.isArray(usuariosInvolucrados) ? usuariosInvolucrados : [];

    const flexFecha = 1;
    const flexDestino = 1.5;
    const flexPlaca = 1;
    const flexTemp = 0.8;
    const flexCheck = 0.7;
    const flexResponsable = 1.5;
    const flexObservaciones = 2;
    const flexCorrecciones = 2;

    const formatBoolean = (valor: boolean | null) => (valor ? 'Sí' : 'No');

    return (
        <Document>
            <Page size="LETTER" orientation="landscape" style={{ padding: 20 }}>
                <PdfLayout
                    title="INSPECCION DE CARROS DE DISTRIBUCION E HIGIENE DEL PERSONAL"
                    tipo="REPORTE"
                    version="001"
                    codigo="PLL-REG-108"
                >
                    {filtros && (filtros.fecha_desde || filtros.fecha_hasta) && (
                        <View style={{ marginBottom: 4, fontSize: 6, color: '#666' }}>
                            <Text>
                                Período: {filtros.fecha_desde ? formatFecha(filtros.fecha_desde) : 'Inicio'}
                                {' - '}
                                {filtros.fecha_hasta ? formatFecha(filtros.fecha_hasta) : 'Actual'}
                            </Text>
                        </View>
                    )}

                    <View style={styles.tableWrapper}>
                        <View style={styles.tableHeader}>
                            <View style={{ flex: flexFecha }}><Text style={styles.headerCell}>Fecha</Text></View>
                            <View style={{ flex: flexDestino }}><Text style={styles.headerCell}>Destino</Text></View>
                            <View style={{ flex: flexPlaca }}><Text style={styles.headerCell}>Placa</Text></View>
                            <View style={{ flex: flexTemp }}><Text style={styles.headerCell}>Temp.</Text></View>
                            <View style={{ flex: flexCheck }}><Text style={styles.headerCell}>Paredes</Text></View>
                            <View style={{ flex: flexCheck }}><Text style={styles.headerCell}>Limpieza</Text></View>
                            <View style={{ flex: flexCheck }}><Text style={styles.headerCell}>Sin Obj/Olores</Text></View>
                            <View style={{ flex: flexCheck }}><Text style={styles.headerCell}>BPH Chofer</Text></View>
                            <View style={{ flex: flexCheck }}><Text style={styles.headerCell}>BPH Ayud.</Text></View>
                            <View style={{ flex: flexResponsable }}><Text style={styles.headerCell}>Responsable</Text></View>
                            <View style={{ flex: flexObservaciones }}><Text style={styles.headerCell}>Observaciones</Text></View>
                            <View style={{ flex: flexCorrecciones }}><Text style={styles.headerCellLast}>Correcciones</Text></View>
                        </View>

                        {registros.length === 0 ? (
                            <View style={styles.row}>
                                <Text style={styles.cellLast}>No hay registros para el período seleccionado</Text>
                            </View>
                        ) : (
                            registros.map((reg: any, idx: number) => (
                                <View key={idx} style={styles.row}>
                                    <Text style={{ ...styles.cell, flex: flexFecha }}>{formatFecha(reg.fecha)}</Text>
                                    <Text style={{ ...styles.cell, flex: flexDestino }}>{reg.destino}</Text>
                                    <Text style={{ ...styles.cell, flex: flexPlaca }}>{reg.placa}</Text>
                                    <Text style={{ ...styles.cell, flex: flexTemp }}>{reg.set_temperatura !== undefined && reg.set_temperatura !== null ? `${reg.set_temperatura} °C` : '-'}</Text>
                                    <Text style={{ ...styles.cell, flex: flexCheck }}>{formatBoolean(reg.paredes_externas)}</Text>
                                    <Text style={{ ...styles.cell, flex: flexCheck }}>{formatBoolean(reg.limpieza_interno)}</Text>
                                    <Text style={{ ...styles.cell, flex: flexCheck }}>{formatBoolean(reg.ausencia_objetos_olores)}</Text>
                                    <Text style={{ ...styles.cell, flex: flexCheck }}>{formatBoolean(reg.bph_chofer)}</Text>
                                    <Text style={{ ...styles.cell, flex: flexCheck }}>{formatBoolean(reg.bph_ayudante)}</Text>
                                    <Text style={{ ...styles.cell, flex: flexResponsable }}>
                                        {reg.usuario || '-'}
                                        {reg.codigo_usuario ? `\n(${reg.codigo_usuario})` : ''}
                                    </Text>
                                    <Text style={{ ...styles.cell, flex: flexObservaciones }}>{reg.observaciones || '-'}</Text>
                                    <Text style={{ ...styles.cellLast, flex: flexCorrecciones }}>{reg.correciones || '-'}</Text>
                                </View>
                            ))
                        )}
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