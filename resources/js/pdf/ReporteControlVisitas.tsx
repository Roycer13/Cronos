import React from 'react';
import { Document, Page, StyleSheet, Text, View } from '@react-pdf/renderer';
import PdfLayout from './PdfLayout';

function getEstadoText(conforme: boolean): string {
    return conforme ? 'C.' : 'N.C.';
}

function getEstadoColor(conforme: boolean): string {
    return conforme ? '#10b981' : '#ef4444';
}

const styles = StyleSheet.create({
    section: {
        paddingTop: 6,
        paddingBottom: 6,
        marginBottom: 4,
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
    summaryGrid: {
        display: 'flex',
        flexDirection: 'row',
        flexWrap: 'wrap',
        marginTop: 2,
        gap: 8,
    },
    summaryItem: {
        flex: 1,
        padding: 4,
        borderWidth: 0.5,
        borderColor: '#ddd',
        backgroundColor: '#fafafa',
        alignItems: 'center',
    },
    summaryNumber: {
        fontSize: 10,
        fontWeight: 'bold',
        textAlign: 'center',
    },
    summaryLabel: {
        fontSize: 6,
        color: '#666',
        textAlign: 'center',
    },
    tableWrapper: { borderWidth: 0.5, borderColor: '#bbb', marginTop: 4 },
    headerRow: {
        flexDirection: 'row',
        borderBottomWidth: 1,
        borderColor: '#333',
        backgroundColor: '#E8F0FA',
    },
    dataRow: {
        flexDirection: 'row',
        borderBottomWidth: 0.5,
        borderColor: '#e0e0e0',
        paddingVertical: 2,
        backgroundColor: '#fafafa',
    },
    cell: {
        padding: 2,
        fontSize: 6,
        textAlign: 'center',
        borderRightWidth: 0.5,
        borderColor: '#e0e0e0',
    },
    cellLast: {
        padding: 2,
        fontSize: 6,
        textAlign: 'center',
    },
    cellLeft: {
        padding: 2,
        fontSize: 6,
        textAlign: 'left',
        borderRightWidth: 0.5,
        borderColor: '#e0e0e0',
    },
    cellLeftLast: {
        padding: 2,
        fontSize: 6,
        textAlign: 'left',
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
    legend: {
        marginTop: 6,
        fontSize: 5.5,
        color: '#666',
        textAlign: 'center',
    },
});

// Definir flex para cada columna (según nuevo orden)
// Columnas: Fecha, Hora Ingreso, Nombre, Cédula, Institución, Firma, Hora Salida, Motivo/Obs (opcional)
// Usaremos flex: 1 para la mayoría, pero nombre y motivo pueden ser más anchos
const flexFecha = 0.8;
const flexHora = 0.7;
const flexNombre = 1.8;
const flexCedula = 1.2;
const flexInstitucion = 1.5;
const flexFirma = 1.5;
const flexSalida = 0.8;
const flexMotivo = 1.8;

export default function ReporteControlVisitas({ data }: any) {
    if (!data || !data.datos) {
        return (
            <Document>
                <Page size="LETTER" orientation="landscape" style={{ padding: 15 }}>
                    <PdfLayout title="Error" tipo="REGISTRO" version="001" codigo="ERR">
                        <Text>No hay datos para mostrar</Text>
                    </PdfLayout>
                </Page>
            </Document>
        );
    }

    const { datos, resumen, usuarios_involucrados, filtros } = data;

    return (
        <Document>
            <Page size="LETTER" orientation="landscape" style={{ padding: 15 }}>
                <PdfLayout
                    title="VISITA DE PERSONAL EXTERNO A LA PLANTA DE LÁCTEOS"
                    tipo="REGISTRO"
                    version="001"
                    codigo="PLL-REG-012"
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

                    {/* Resumen */}
                    {/* <View style={styles.section}>
                        <Text style={styles.sectionTitle}>RESUMEN</Text>
                        <View style={styles.summaryGrid}>
                            <View style={styles.summaryItem}>
                                <Text style={styles.summaryNumber}>{resumen.total}</Text>
                                <Text style={styles.summaryLabel}>Total visitas</Text>
                            </View>
                            <View style={styles.summaryItem}>
                                <Text style={styles.summaryNumber}>{resumen.conformes}</Text>
                                <Text style={styles.summaryLabel}>Conformes</Text>
                            </View>
                            <View style={styles.summaryItem}>
                                <Text style={styles.summaryNumber}>{resumen.activas}</Text>
                                <Text style={styles.summaryLabel}>En instalaciones</Text>
                            </View>
                            <View style={styles.summaryItem}>
                                <Text style={styles.summaryNumber}>{resumen.porcentaje}%</Text>
                                <Text style={styles.summaryLabel}>% Conformidad</Text>
                            </View>
                        </View>
                    </View> */}

                    {/* Tabla principal con nuevo orden */}
                    <View style={styles.tableWrapper}>
                        {/* Encabezado */}
                        <View style={styles.headerRow}>
                            <View style={{ flex: flexFecha }}><Text style={styles.cell}>Fecha</Text></View>
                            <View style={{ flex: flexHora }}><Text style={styles.cell}>Hora ingreso</Text></View>
                            <View style={{ flex: flexNombre }}><Text style={styles.cell}>Nombre</Text></View>
                            <View style={{ flex: flexCedula }}><Text style={styles.cell}>Cédula</Text></View>
                            <View style={{ flex: flexInstitucion }}><Text style={styles.cell}>Institución</Text></View>

                            <View style={{ flex: flexSalida }}><Text style={styles.cell}>Hora salida</Text></View>
                            <View style={{ flex: flexMotivo }}><Text style={styles.cellLast}>Observaciones</Text></View>
                        </View>

                        {/* Filas */}
                        {datos.map((item: any, idx: number) => (
                            <View key={idx} style={styles.dataRow}>
                                <View style={{ flex: flexFecha }}><Text style={styles.cell}>{item.fecha}</Text></View>
                                <View style={{ flex: flexHora }}><Text style={styles.cell}>{item.hora_ingreso}</Text></View>
                                <View style={{ flex: flexNombre }}><Text style={styles.cellLeft}>{item.nombre}</Text></View>
                                <View style={{ flex: flexCedula }}><Text style={styles.cell}>{item.cedula}</Text></View>
                                <View style={{ flex: flexInstitucion }}><Text style={styles.cellLeft}>{item.institucion}</Text></View>

                                <View style={{ flex: flexSalida }}><Text style={styles.cell}>{item.hora_salida}</Text></View>
                                <View style={{ flex: flexMotivo }}><Text style={styles.cellLeftLast}>
                                    {/* {item.motivo}{item.observaciones && item.motivo ? ' - ' : ''} */}
                                    {item.observaciones !== '-' ? item.observaciones : ''}
                                </Text></View>
                            </View>
                        ))}
                    </View>

                    {/* Leyenda */}
                    <View style={styles.legend}>
                        <Text>Glosa: C. = Cumple, N.C. = No cumple, - = Sin registro</Text>
                    </View>

                    {/* Usuarios involucrados (supervisores) + firma */}
                    {usuarios_involucrados.length > 0 && (
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
