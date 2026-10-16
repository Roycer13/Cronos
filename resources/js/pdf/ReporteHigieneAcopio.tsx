import React from 'react';
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

function formatCumplimiento(value: unknown) {
    if (value === true || value === 'true' || value === 'Conforme' || value === 'conforme' || value === 'C.') {
        return 'C.';
    }

    if (value === false || value === 'false' || value === 'No Conforme' || value === 'no conforme' || value === 'N.C.') {
        return 'N.C.';
    }

    if (value === null || value === undefined || value === '') {
        return '-';
    }

    return String(value);
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
    headerCell: { flex: 1, padding: 3, fontSize: 6, fontWeight: 'bold', textAlign: 'center', borderRightWidth: 0.5, borderColor: '#333' },
    headerCellLast: { flex: 1, padding: 3, fontSize: 6, fontWeight: 'bold', textAlign: 'center' },
    row: { flexDirection: 'row', borderBottomWidth: 0.5, borderColor: '#e0e0e0', paddingVertical: 4, backgroundColor: '#fafafa' },
    cell: { flex: 1, paddingHorizontal: 2, paddingVertical: 2, fontSize: 6, textAlign: 'center', borderRightWidth: 0.5, borderColor: '#e0e0e0' },
    cellLast: { flex: 1, paddingHorizontal: 2, paddingVertical: 2, fontSize: 6, textAlign: 'center' },
    usersTable: { marginTop: 12, borderWidth: 0.5, borderColor: '#bbb', width: '65%' },
    usersHeader: { flexDirection: 'row', borderBottomWidth: 1, borderColor: '#333', backgroundColor: '#2c3e50' },
    usersCell: { flex: 1, padding: 2, fontSize: 7, color: '#fff', fontWeight: 'bold' },
    signatureBox: { width: '33%', borderWidth: 1, borderColor: '#2c3e50', padding: 8, backgroundColor: '#fafafa' },
    signatureLine: { borderBottomWidth: 2, borderColor: '#2c3e50', height: 40, marginBottom: 6 },
    signatureText: { fontSize: 7, fontWeight: 'bold', textAlign: 'center', color: '#2c3e50', marginBottom: 2 },
    signatureDate: { fontSize: 5.5, textAlign: 'center', color: '#666' },
});

export default function ReporteHigieneAcopio({ data }: any) {
    if (!data || !data.registros) {
        return (
            <Document>
                <Page size="LETTER" orientation="landscape" style={{ padding: 20 }}>
                    <PdfLayout title="Error" tipo="REGISTRO" version="001" codigo="ERR">
                        <Text>No hay datos para mostrar</Text>
                    </PdfLayout>
                </Page>
            </Document>
        );
    }

    const { registros, usuarios_involucrados, filtros } = data;

    return (
        <Document>
            <Page size="LETTER" orientation="landscape" style={{ padding: 20 }}>
                <PdfLayout
                    title=" INSPECCIÓN DE LIMPIEZA Y DESINFECCIÓN DE CISTERNAS E HIGIENE DE LOS
ACOPIADORES"
                    tipo="REGISTRO"
                    version="001"
                    codigo="PLL-REG-106"
                >
                    {/* Parámetros del reporte */}
                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>PARÁMETROS DEL REPORTE</Text>
                        <View style={styles.infoGrid}>
                            <View style={styles.infoItem}>
                                <Text style={styles.infoLabel}>Fecha Desde:</Text>
                                <Text style={styles.infoValue}>{filtros.fecha_desde || '-'}</Text>
                            </View>
                            <View style={styles.infoItem}>
                                <Text style={styles.infoLabel}>Fecha Hasta:</Text>
                                <Text style={styles.infoValue}>{filtros.fecha_hasta || '-'}</Text>
                            </View>
                        </View>
                    </View>

                    {/* Tabla principal */}
                    <View style={styles.tableWrapper}>
                        <View style={styles.tableHeader}>
                            <Text style={styles.headerCell}>Fecha</Text>
                            <Text style={styles.headerCell}>Usuario</Text>
                            <Text style={styles.headerCell}>Ruta</Text>
                            <Text style={styles.headerCell}>Llegada</Text>
                            <Text style={styles.headerCell}>Observ. Llegada</Text>
                            <Text style={styles.headerCell}>Cofia</Text>
                            <Text style={styles.headerCell}>Barbijo</Text>
                            <Text style={styles.headerCell}>Overol</Text>
                            <Text style={styles.headerCell}>Salida</Text>
                            <Text style={styles.headerCell}>Observ. Salida</Text>
                            <Text style={styles.headerCellLast}>Correccion</Text>
                        </View>
                        {registros.map((r: any, idx: number) => (
                            <View key={idx} style={styles.row}>
                                <Text style={styles.cell}>{formatFecha(r.fecha)}</Text>
                                <Text style={styles.cell}>{r.ruta}</Text>
                                <Text style={styles.cell}>{r.usuario_codigo}</Text>

                                <Text style={styles.cell}>{formatCumplimiento(r.superficie_llegada)}</Text>
                                <Text style={styles.cell}>{formatCumplimiento(r.observacion_llegada)}</Text>
                                <Text style={styles.cell}>{formatCumplimiento(r.cofia)}</Text>
                                <Text style={styles.cell}>{formatCumplimiento(r.barbijo)}</Text>
                                <Text style={styles.cell}>{formatCumplimiento(r.overol)}</Text>
                                <Text style={styles.cell}>{formatCumplimiento(r.superficie_salida)}</Text>
                                <Text style={styles.cell}>{formatCumplimiento(r.observacion_salida)}</Text>
                                {/* corrección de llegada y salida*/}
                                <Text style={styles.cellLast}>{formatCumplimiento(r.correccion_llegada)}-{formatCumplimiento(r.correccion_salida)}</Text>

                            </View>
                        ))}
                    </View>
                              <Text style={styles.legend}>Glosa: - = Sin Registro, C.= Cumple, N.C.= No Cumple.</Text>


                    {/* Usuarios involucrados */}
                    {usuarios_involucrados.length > 0 && (
                        <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 12, gap: 8, pageBreakInside: 'avoid' }}>
                            <View style={styles.usersTable}>
                                <View style={styles.usersHeader}>
                                    <Text style={styles.usersCell}>CÓDIGO</Text>
                                    <Text style={styles.usersCell}>NOMBRE (CÓDIGO)</Text>
                                </View>
                                {usuarios_involucrados.map((u: any, i: number) => (
                                    <View key={i} style={{ flexDirection: 'row', borderBottomWidth: 0.5, borderColor: '#ddd', backgroundColor: i % 2 === 0 ? '#fafafa' : '#fff', paddingVertical: 2 }}>
                                        <Text style={{ ...styles.usersCell, color: '#000', fontWeight: 'normal' }}>{u.codigo}</Text>
                                        <Text style={{ ...styles.usersCell, color: '#000', fontWeight: 'normal' }}>{`${u.nombre} (${u.codigo})`}</Text>
                                    </View>
                                ))}
                            </View>
                            <View style={styles.signatureBox}>
                                <View style={styles.signatureLine} />
                                <Text style={styles.signatureText}>FIRMA REVISOR</Text>
                                <Text style={styles.signatureDate}>Fecha: ___/___/_____</Text>
                            </View>
                        </View>
                    )}
                </PdfLayout>
            </Page>
        </Document>
    );
}
