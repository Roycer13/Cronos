import React from 'react';
import { Document, Page, StyleSheet, Text, View } from '@react-pdf/renderer';
import PdfLayout from './PdfLayout';

const styles = StyleSheet.create({
    section: {
        marginBottom: 10,
    },
    info: {
        fontSize: 8,
        marginBottom: 2,
    },
    table: {
        width: '100%',
        borderWidth: 0.5,
        borderColor: '#000',
        marginTop: 8,
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
});

export default function ReporteAlmacenTemperaturas({ data }: any) {
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

    const { datos, fecha_desde, fecha_hasta } = data;

    // Columnas: Fecha, Lugar, Temperatura, Humedad, Ident, Observaciones, Usuario
    const colWidths = ['15%', '15%', '15%', '12%', '8%', '20%', '15%'];
    const headers = ['Fecha', 'Lugar', 'Temperatura', 'Humedad', 'Ident', 'Observaciones', 'Usuario'];

    return (
        <Document>
            <Page size="LETTER" orientation="portrait" style={{ padding: 15, fontSize: 6 }}>
                <PdfLayout
                    title="CONTROL DE TEMPERATURA Y HUMEDAD DE LOS ALMACENES - CONGELADOR"
                    tipo="REGISTRO"
                    version="001"
                    codigo="PLL-REG-114"
                >
                    <View style={styles.section}>
                        <Text style={styles.info}>
                            Rango de fechas: {fecha_desde} al {fecha_hasta}
                        </Text>
                        <Text style={styles.info}>
                            Total de registros: {datos.length}
                        </Text>
                    </View>

                    <View style={styles.table}>
                        <View style={styles.headerRow}>
                            {headers.map((h, i) => (
                                <Text key={i} style={[styles.cellHeader, { width: colWidths[i] }]}>
                                    {h}
                                </Text>
                            ))}
                        </View>

                        {datos.map((row: any, idx: number) => (
                            <View style={styles.row} key={idx}>
                                <Text style={[styles.cell, { width: colWidths[0] }]}>{row.fecha}</Text>
                                <Text style={[styles.cellLeft, { width: colWidths[1] }]}>{row.lugar}</Text>
                                <Text style={[styles.cell, { width: colWidths[2] }]}>{row.temperatura}</Text>
                                <Text style={[styles.cell, { width: colWidths[3] }]}>{row.humedad}</Text>
                                <Text style={[styles.cell, { width: colWidths[4] }]}>{row.ident}</Text>
                                <Text style={[styles.cellLeft, { width: colWidths[5] }]}>{row.observaciones}</Text>
                                <Text style={[styles.cell, { ...styles.lastCell, width: colWidths[6] }]}>{row.usuario}</Text>
                            </View>
                        ))}
                    </View>
                </PdfLayout>
            </Page>
        </Document>
    );
}
