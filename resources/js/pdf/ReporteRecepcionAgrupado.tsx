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
        marginBottom: 10,
        padding: 8,
        borderWidth: 0.5,
        borderColor: '#bbb',
        backgroundColor: '#f8f9fb',
    },
    sectionTitle: {
        fontSize: 10,
        fontWeight: 'bold',
        marginBottom: 4,
        color: '#1f2937',
    },
    groupHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 4,
        padding: 4,
        backgroundColor: '#e2e8f0',
    },
    groupText: {
        fontSize: 8,
        fontWeight: 'bold',
        color: '#0f172a',
    },
    table: {
        width: '100%',
        borderWidth: 0.5,
        borderColor: '#cbd5e1',
    },
    tableHeader: {
        flexDirection: 'row',
        backgroundColor: '#dbeafe',
        borderBottomWidth: 0.5,
        borderColor: '#93c5fd',
    },
    tableRow: {
        flexDirection: 'row',
        borderBottomWidth: 0.5,
        borderColor: '#e2e8f0',
    },
    cell: {
        padding: 2,
        fontSize: 7,
        textAlign: 'center',
        borderRightWidth: 0.5,
        borderColor: '#cbd5e1',
    },
    headerCell: {
        padding: 2,
        fontSize: 7,
        fontWeight: 'bold',
        textAlign: 'center',
        borderRightWidth: 0.5,
        borderColor: '#cbd5e1',
    },
    cellLast: {
        padding: 2,
        fontSize: 7,
        textAlign: 'center',
    },
    summary: {
        marginTop: 6,
        padding: 6,
        borderWidth: 0.5,
        borderColor: '#cbd5e1',
        backgroundColor: '#eef2ff',
    },
    summaryText: {
        fontSize: 8,
        color: '#334155',
    },
});

export default function ReporteRecepcionAgrupado({ datos }: any) {
    const recepciones = Array.isArray(datos) ? datos : [datos];

    const agrupado = recepciones.reduce((acc: any, recepcion: any) => {
        const almacen = recepcion.almacen || 'Sin almacén';
        const materia = recepcion.materiaPrima || 'Sin materia prima';
        if (!acc[almacen]) acc[almacen] = {};
        if (!acc[almacen][materia]) acc[almacen][materia] = [];
        acc[almacen][materia].push(recepcion);
        return acc;
    }, {});

    const totalRecepciones = recepciones.length;
    const totalLotes = recepciones.reduce((sum: number, recepcion: any) => sum + (Array.isArray(recepcion.lotes) ? recepcion.lotes.length : 0), 0);

    return (
        <Document>
            <Page size="LETTER" orientation="landscape" style={{ padding: 20 }}>
                <PdfLayout
                    title="REPORTE AGRUPADO DE RECEPCIONES Y LOTES"
                    tipo="REGISTRO"
                    version="001"
                    codigo="PLL-AGR-061"
                >
                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>Resumen general</Text>
                        <Text style={styles.summaryText}>Total de recepciones: {totalRecepciones}</Text>
                        <Text style={styles.summaryText}>Total de lotes: {totalLotes}</Text>
                    </View>

                    {Object.entries(agrupado).map(([almacen, materias]: any, grupoIndex: number) => (
                        <View key={`almacen-${grupoIndex}`} style={styles.section}>
                            <View style={styles.groupHeader}>
                                <Text style={styles.groupText}>Almacén: {almacen}</Text>
                                <Text style={styles.groupText}>Recepciones: {Object.values(materias).flat().length}</Text>
                            </View>

                            {Object.entries(materias).map(([materia, recepcionesMateria]: any, materiaIndex: number) => (
                                <View key={`materia-${grupoIndex}-${materiaIndex}`} style={{ marginBottom: 8 }}>
                                    <View style={[styles.groupHeader, { backgroundColor: '#f1f5f9' }]}>
                                        <Text style={styles.groupText}>Materia Prima: {materia}</Text>
                                        <Text style={styles.groupText}>Lotes: {recepcionesMateria.reduce((sum: number, r: any) => sum + (Array.isArray(r.lotes) ? r.lotes.length : 0), 0)}</Text>
                                    </View>

                                    <View style={styles.table}>
                                        <View style={styles.tableHeader}>
                                            <Text style={{ ...styles.headerCell, flex: 0.9 }}>Fecha</Text>
                                            <Text style={{ ...styles.headerCell, flex: 1.5 }}>Responsable</Text>
                                            <Text style={{ ...styles.headerCell, flex: 1.5 }}>Proveedor</Text>
                                            <Text style={{ ...styles.headerCell, flex: 1 }}>Marca</Text>
                                            <Text style={{ ...styles.headerCell, flex: 0.8 }}>Cantidad</Text>
                                            <Text style={{ ...styles.headerCell, flex: 0.8 }}>Unidad</Text>
                                            <Text style={{ ...styles.headerCell, flex: 1 }}>Estado</Text>
                                            <Text style={{ ...styles.headerCell, flex: 1 }}>Liberación</Text>
                                            <Text style={{ ...styles.headerCell, flex: 2 }}>Lotes</Text>
                                            <Text style={{ ...styles.headerCell, flex: 1 }}>F. Elab</Text>
                                            <Text style={{ ...styles.headerCell, flex: 1 }}>F. Venc</Text>
                                            <Text style={{ ...styles.headerCell, flex: 1 }}>Certificado</Text>
                                            <Text style={{ ...styles.headerCell, flex: 1 }}>Observación</Text>
                                        </View>

                                        {recepcionesMateria.map((r: any, idx: number) => (
                                            <View key={`row-${idx}`} style={styles.tableRow}>
                                                <Text style={{ ...styles.cell, flex: 0.9 }}>{formatFecha(r.fecha)}</Text>
                                                <Text style={{ ...styles.cell, flex: 1.5 }}>{r.usuario || '-'}</Text>
                                                <Text style={{ ...styles.cell, flex: 1.5 }}>{r.proveedor || '-'}</Text>
                                                <Text style={{ ...styles.cell, flex: 1 }}>{r.marca || '-'}</Text>
                                                <Text style={{ ...styles.cell, flex: 0.8 }}>{r.cantidad || '-'}</Text>
                                                <Text style={{ ...styles.cell, flex: 0.8 }}>{r.unidad || '-'}</Text>
                                                <Text style={{ ...styles.cell, flex: 1 }}>{r.estado || '-'}</Text>
                                                <Text style={{ ...styles.cell, flex: 1 }}>{r.liberacion || '-'}</Text>
                                                <Text style={{ ...styles.cell, flex: 2 }}>
                                                    {Array.isArray(r.lotes) && r.lotes.length
                                                        ? r.lotes.map((l: any, loteIndex: number) => (
                                                              <Text key={loteIndex} style={{ fontSize: 6 }}>{`${l.lote} (${formatFecha(l.fechaElab)} / ${formatFecha(l.fechaVen)})`}</Text>
                                                          ))
                                                        : '-'}
                                                </Text>
                                                <Text style={{ ...styles.cell, flex: 1 }}>
                                                    {Array.isArray(r.lotes) && r.lotes.length
                                                        ? r.lotes.map((l: any, loteIndex: number) => (
                                                              <Text key={loteIndex} style={{ fontSize: 6 }}>{formatFecha(l.fechaElab)}</Text>
                                                          ))
                                                        : '-'}
                                                </Text>
                                                <Text style={{ ...styles.cell, flex: 1 }}>
                                                    {Array.isArray(r.lotes) && r.lotes.length
                                                        ? r.lotes.map((l: any, loteIndex: number) => (
                                                              <Text key={loteIndex} style={{ fontSize: 6 }}>{formatFecha(l.fechaVen)}</Text>
                                                          ))
                                                        : '-'}
                                                </Text>
                                                <Text style={{ ...styles.cell, flex: 1 }}>{r.certificado || '-'}</Text>
                                                <Text style={{ ...styles.cell, flex: 1 }}>{r.observacion || '-'}</Text>
                                            </View>
                                        ))}
                                    </View>
                                </View>
                            ))}
                        </View>
                    ))}
                </PdfLayout>
            </Page>
        </Document>
    );
}
