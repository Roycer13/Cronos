import React from 'react';
import { Document, Page, StyleSheet, Text, View } from '@react-pdf/renderer';
import PdfLayout from './PdfLayout';

const styles = StyleSheet.create({
    legend: {
        marginTop: 6,
        fontSize: 5.5,
        color: '#666',
        textAlign: 'center',
    },
    table: {
        width: '100%',
        borderWidth: 0.5,
        borderColor: '#000',
        marginTop: 10,
    },
    headerRow: {
        flexDirection: 'row',
        backgroundColor: '#E0E0E0',
        borderBottomWidth: 1,
        borderColor: '#000',
    },
    row: {
        flexDirection: 'row',
        borderBottomWidth: 0.3,
        borderColor: '#888',
    },
    cellHeader: {
        padding: 3,
        fontSize: 7,
        fontWeight: 'bold',
        textAlign: 'center',
        borderRightWidth: 0.5,
        borderColor: '#000',
    },
    cell: {
        padding: 2,
        fontSize: 6,
        textAlign: 'center',
        borderRightWidth: 0.3,
        borderColor: '#888',
    },
    cellLeft: {
        padding: 2,
        fontSize: 6,
        textAlign: 'left',
        borderRightWidth: 0.3,
        borderColor: '#888',
    },
    lastCell: {
        borderRightWidth: 0,
    },
    section: {
        paddingTop: 6,
        paddingBottom: 6,
        marginBottom: 10,
        borderWidth: 0.5,
        borderColor: '#ddd',
        padding: 4,
        backgroundColor: '#fafafa',
    },
    sectionTitle: {
        fontSize: 7,
        fontWeight: 'bold',
        marginBottom: 2,
        backgroundColor: '#E8F0FA',
        padding: 2,
        color: '#000',
    },
    infoGrid: {
        display: 'flex',
        flexDirection: 'row',
        flexWrap: 'wrap',
        marginBottom: 2,
    },
    infoItem: {
        width: '50%',
        marginBottom: 1,
        paddingRight: 4,
        flexDirection: 'row',
        alignItems: 'center',
    },
    infoLabel: {
        fontSize: 7,
        fontWeight: 'bold',
        color: '#333',
        marginRight: 2,
    },
    infoValue: {
        fontSize: 7,
        color: '#000',
    },
    usersTable: {
        marginTop: 10,
        borderWidth: 0.5,
        borderColor: '#bbb',
        width: '65%',
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
        fontSize: 6.5,
        color: '#fff',
        fontWeight: 'bold',
    },
    signatureBox: {
        width: '33%',
        borderWidth: 1,
        borderColor: '#2c3e50',
        padding: 6,
        backgroundColor: '#fafafa',
    },
    signatureLine: {
        borderBottomWidth: 2,
        borderColor: '#2c3e50',
        height: 35,
        marginBottom: 4,
    },
    signatureText: {
        fontSize: 6.5,
        fontWeight: 'bold',
        textAlign: 'center',
        color: '#2c3e50',
        marginBottom: 2,
    },
    signatureDate: {
        fontSize: 5.5,
        textAlign: 'center',
        color: '#666',
    },
});

export default function ReporteInspeccionCasilleros({ data }: any) {
    if (!data || !data.datos || data.datos.length === 0) {
        return (
            <Document>
                <Page size="LETTER" orientation="portrait" style={{ padding: 20 }}>
                    <PdfLayout title="Error" tipo="REGISTRO" version="001" codigo="ERR">
                        <Text>No hay datos para el rango seleccionado.</Text>
                    </PdfLayout>
                </Page>
            </Document>
        );
    }

    const { datos, fecha_desde, fecha_hasta, usuarios_involucrados } = data;

    // Columnas: Empleado | Fecha | Orden | Limpieza | Imp. Aseo | Inspectores | Observaciones | Correcciones
    const colWidths = ['18%', '12%', '8%', '8%', '8%', '14%', '16%', '16%'];

    return (
        <Document>
            <Page size="LETTER" orientation="portrait" style={{ padding: 15, fontSize: 6 }}>
                <PdfLayout
                    title="INSPECCIÓN DE CASILLEROS"
                    tipo="REGISTRO"
                    version="001"
                    codigo="PLL-REG-186"
                >
                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>PARÁMETROS DEL REPORTE</Text>
                        <View style={styles.infoGrid}>
                            <View style={styles.infoItem}>
                                <Text style={styles.infoLabel}>Fecha Desde:</Text>
                                <Text style={styles.infoValue}>{fecha_desde || '-'}</Text>
                            </View>
                            <View style={styles.infoItem}>
                                <Text style={styles.infoLabel}>Fecha Hasta:</Text>
                                <Text style={styles.infoValue}>{fecha_hasta || '-'}</Text>
                            </View>
                        </View>
                        <Text style={styles.infoValue}>Total de inspecciones: {datos.length}</Text>
                    </View>

                    <View style={styles.table}>
                        {/* Encabezados */}
                        <View style={styles.headerRow}>
                            <Text style={[styles.cellHeader, { width: colWidths[0] }]}>Empleado</Text>
                            <Text style={[styles.cellHeader, { width: colWidths[1] }]}>Fecha</Text>
                            <Text style={[styles.cellHeader, { width: colWidths[2] }]}>Orden</Text>
                            <Text style={[styles.cellHeader, { width: colWidths[3] }]}>Limpieza</Text>
                            <Text style={[styles.cellHeader, { width: colWidths[4] }]}>Imp. Aseo</Text>
                            <Text style={[styles.cellHeader, { width: colWidths[5] }]}>Inspectores</Text>
                            <Text style={[styles.cellHeader, { width: colWidths[6] }]}>Observaciones</Text>
                            <Text style={[styles.cellHeader, { ...styles.lastCell, width: colWidths[7] }]}>Correcciones</Text>
                        </View>

                        {/* Filas de datos */}
                        {datos.map((row: any, idx: number) => (
                            <View style={styles.row} key={idx}>
                                <Text style={[styles.cellLeft, { width: colWidths[0] }]}>{row.empleado}</Text>
                                <Text style={[styles.cell, { width: colWidths[1] }]}>{row.fecha}</Text>
                                <Text style={[styles.cell, { width: colWidths[2] }]}>{row.orden}</Text>
                                <Text style={[styles.cell, { width: colWidths[3] }]}>{row.limpieza}</Text>
                                <Text style={[styles.cell, { width: colWidths[4] }]}>{row.implementos_aseo}</Text>
                                <Text style={[styles.cell, { width: colWidths[5] }]}>{row.inspectores}</Text>
                                <Text style={[styles.cellLeft, { width: colWidths[6] }]}>{row.observacion}</Text>
                                <Text style={[styles.cellLeft, { ...styles.lastCell, width: colWidths[7] }]}>{row.correccion}</Text>
                            </View>
                        ))}
                    </View>
                    <View style={styles.legend}>
                                            <Text>Glosa: C = Cumple, N = No cumple, - = Sin registro</Text>
                                        </View>

                    {/* Pie con firmas */}
                    {usuarios_involucrados && usuarios_involucrados.length > 0 && (
                        <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 8, gap: 6, pageBreakInside: 'avoid' }}>
                            <View style={styles.usersTable}>
                                <View style={styles.usersHeader}>
                                    <Text style={styles.usersCell}>CÓDIGO</Text>
                                    <Text style={styles.usersCell}>NOMBRE (CÓDIGO)</Text>
                                </View>
                                {usuarios_involucrados.map((u: any, i: number) => (
                                    <View key={i} style={{ flexDirection: 'row', borderBottomWidth: 0.5, borderColor: '#ddd', backgroundColor: i % 2 === 0 ? '#fafafa' : '#fff', paddingVertical: 1.5 }}>
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
