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

function formatNumber(value: any, decimals: number = 2): string {
    if (value === null || value === undefined || value === '') return '-';
    const num = Number(value);
    if (isNaN(num)) return '-';
    return num.toFixed(decimals);
}

function formatScientific(value: any, decimals: number = 0): string {
    const num = Number(value);
    if (isNaN(num)) return '-';
    if (num === 0) return '0';
    const absNum = Math.abs(num);
    if (absNum >= 1000000) return 'MNPC';
    const sign = num < 0 ? '-' : '';
    const exponent = Math.floor(Math.log10(absNum));
    const coefficient = absNum / Math.pow(10, exponent);
    const roundedCoeff = coefficient.toFixed(decimals);
    const cleanCoeff = roundedCoeff.replace(/\.?0+$/, '');
    if (exponent === 0) return `${sign}${cleanCoeff}`;
    return `${sign}${cleanCoeff}x10^${exponent}`;
}

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
    tableHeader: {
        flexDirection: 'row',
        borderBottomWidth: 1,
        borderColor: '#333',
        backgroundColor: '#E8F0FA',
    },
    headerCell: {
        flex: 1,
        padding: 3,
        fontSize: 6,
        fontWeight: 'bold',
        textAlign: 'center',
        borderRightWidth: 0.5,
        borderColor: '#333',
    },
    headerCellLast: {
        flex: 1,
        padding: 3,
        fontSize: 6,
        fontWeight: 'bold',
        textAlign: 'center',
    },
    row: {
        flexDirection: 'row',
        borderBottomWidth: 0.5,
        borderColor: '#e0e0e0',
        paddingVertical: 4,
        backgroundColor: '#fafafa',
    },
     legend: {
        marginTop: 3,
        fontSize: 7,
        color: '#555',
        textAlign: 'center',
    },
    cell: {
        flex: 1,
        paddingHorizontal: 2,
        paddingVertical: 2,
        fontSize: 6,
        textAlign: 'center',
        borderRightWidth: 0.5,
        borderColor: '#e0e0e0',
    },
    cellLast: {
        flex: 1,
        paddingHorizontal: 2,
        paddingVertical: 2,
        fontSize: 6,
        textAlign: 'center',
    },
    usersTable: {
        marginTop: 12,
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
        fontSize: 7,
        color: '#fff',
        fontWeight: 'bold',
    },
    signatureBox: {
        width: '33%',
        borderWidth: 1,
        borderColor: '#2c3e50',
        padding: 8,
        backgroundColor: '#fafafa',
    },
    signatureLine: {
        borderBottomWidth: 2,
        borderColor: '#2c3e50',
        height: 40,
        marginBottom: 6,
    },
    signatureText: {
        fontSize: 7,
        fontWeight: 'bold',
        textAlign: 'center',
        color: '#2c3e50',
        marginBottom: 2,
    },
    signatureDate: { fontSize: 5.5, textAlign: 'center', color: '#666' },
});

export default function ReporteAnalisisLeche({ data }: any) {
    let analisis = [];
    let usuarios = [];
    let filtros = {};

    if (Array.isArray(data)) {
        analisis = data;
    } else if (data && data.analisis) {
        analisis = data.analisis;
        usuarios = data.usuarios_involucrados || [];
        filtros = data.filtros || {};
    } else {
        return (
            <Document>
                <Page
                    size="LETTER"
                    orientation="landscape"
                    style={{ padding: 20 }}
                >
                    <PdfLayout
                        title="Error"
                        tipo="REGISTRO"
                        version="001"
                        codigo="ERR"
                    >
                        <Text>
                            No se recibieron datos válidos para el reporte.
                        </Text>
                    </PdfLayout>
                </Page>
            </Document>
        );
    }

    return (
        <Document>
            <Page size="LETTER" orientation="landscape" style={{ padding: 20 }}>
                <PdfLayout
                    title="ANÁLISIS DE LECHE"
                    tipo="REGISTRO"
                    version="001"
                    codigo="PLL-REG-044"
                >
                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>
                            PARÁMETROS DEL REPORTE
                        </Text>
                        <View style={styles.infoGrid}>
                            <View style={styles.infoItem}>
                                <Text style={styles.infoLabel}>
                                    Fecha Desde:
                                </Text>
                                <Text style={styles.infoValue}>
                                    {filtros.fecha_desde || '-'}
                                </Text>
                            </View>
                            <View style={styles.infoItem}>
                                <Text style={styles.infoLabel}>
                                    Fecha Hasta:
                                </Text>
                                <Text style={styles.infoValue}>
                                    {filtros.fecha_hasta || '-'}
                                </Text>
                            </View>
                        </View>
                    </View>

                    <View style={styles.tableWrapper}>
                        <View style={styles.tableHeader}>
                            <Text style={styles.headerCell}>Fecha</Text>
                            <Text style={styles.headerCell}>Ruta</Text>
                            <Text style={styles.headerCell}>Temp. [°C]</Text>
                            <Text style={styles.headerCell}>pH</Text>
                            <Text style={styles.headerCell}>Acidez [%]</Text>
                            <Text style={styles.headerCell}>Solidos totales [°Bx]</Text>
                            <Text style={styles.headerCell}>Densidad [g/ml]</Text>
                            <Text style={styles.headerCell}>
                                Prueba alcohol
                            </Text>
                            <Text style={styles.headerCell}>Grasa [%]</Text>
                            <Text style={styles.headerCell}>
                                Temp. C.  [°C]
                            </Text>
                            <Text style={styles.headerCell}> %Agua [%]</Text>
                            <Text style={styles.headerCell}>Antibióticos</Text>
                            <Text style={styles.headerCell}>RAM [UFC/ml]</Text>
                            <Text style={styles.headerCellLast}>
                                Usuario Solicitante
                            </Text>
                            <Text style={styles.headerCell}>Analista FQ</Text>
                            <Text style={styles.headerCell}>
                                Analista Siembra
                            </Text>
                            <Text style={styles.headerCell}>
                                Analista Lectura
                            </Text>
                            <Text style={styles.headerCell}>
                                Observaciones
                            </Text>
                        </View>
                        {analisis.map((a: any, idx: number) => (
                            <View key={idx} style={styles.row}>
                                <Text style={styles.cell}>
                                    {formatFecha(a.fecha_recepcion)}
                                </Text>
                                <Text style={styles.cell}>{a.subruta}</Text>
                                <Text style={styles.cell}>
                                    {formatNumber(a.temperatura)}
                                </Text>
                                <Text style={styles.cell}>
                                    {formatNumber(a.ph)}
                                </Text>
                                <Text style={styles.cell}>
                                    {formatNumber(a.acidez)}
                                </Text>
                                <Text style={styles.cell}>
                                    {formatNumber(a.brix)}
                                </Text>
                                <Text style={styles.cell}>
                                    {formatNumber(a.densidad)}
                                </Text>
                                <Text style={styles.cell}>
                                    {a.prueba_alcohol ? 'C.' : '-'}
                                </Text>
                                <Text style={styles.cell}>
                                    {formatNumber(a.contenido_graso)}
                                </Text>
                                <Text style={styles.cell}>
                                    {formatNumber(a.temperatura_congelacion, 3)}
                                </Text>
                                <Text style={styles.cell}>
                                    {formatNumber(a.porcentaje_agua)}
                                </Text>
                                <Text style={styles.cell}>
                                    {a.antibioticos}
                                </Text>
                                <Text style={styles.cell}>
                                    {a.recuento
                                        ? formatScientific(a.recuento, 0)
                                        : '-'}
                                </Text>
                                <Text style={styles.cellLast}>
                                    {a.usuario_solicitante_codigo}{' '}
                                </Text>
                                <Text style={styles.cell}>
                                    {a.analista_fq_codigo}
                                </Text>
                                <Text style={styles.cell}>
                                    {a.analista_siembra_codigo}
                                </Text>
                                <Text style={styles.cell}>
                                    {a.analista_lectura_codigo}
                                </Text>
                                <Text style={styles.cellLast}>
                                    {a.observaciones}
                                </Text>
                            </View>
                        ))}
                    </View>
                              <Text style={styles.legend}>Glosa: - = Sin Registro, C.= Cumple, N.C.= No Cumple.</Text>


                    {usuarios.length > 0 && (
                        <View
                            style={{
                                flexDirection: 'row',
                                justifyContent: 'space-between',
                                marginTop: 12,
                                gap: 8,
                                pageBreakInside: 'avoid',
                            }}
                        >
                            <View style={styles.usersTable}>
                                <View style={styles.usersHeader}>
                                    <Text style={styles.usersCell}>CÓDIGO</Text>
                                    <Text style={styles.usersCell}>
                                        NOMBRE (CÓDIGO)
                                    </Text>
                                </View>
                                {usuarios.map((u: any, i: number) => (
                                    <View
                                        key={i}
                                        style={{
                                            flexDirection: 'row',
                                            borderBottomWidth: 0.5,
                                            borderColor: '#ddd',
                                            backgroundColor:
                                                i % 2 === 0
                                                    ? '#fafafa'
                                                    : '#fff',
                                            paddingVertical: 2,
                                        }}
                                    >
                                        <Text
                                            style={{
                                                ...styles.usersCell,
                                                color: '#000',
                                                fontWeight: 'normal',
                                            }}
                                        >
                                            {u.codigo}
                                        </Text>
                                        <Text
                                            style={{
                                                ...styles.usersCell,
                                                color: '#000',
                                                fontWeight: 'normal',
                                            }}
                                        >{`${u.nombre} (${u.codigo})`}</Text>
                                    </View>
                                ))}
                            </View>
                            <View style={styles.signatureBox}>
                                <View style={styles.signatureLine} />
                                <Text style={styles.signatureText}>
                                    FIRMA REVISOR
                                </Text>
                                <Text style={styles.signatureDate}>
                                    Fecha: ___/___/_____
                                </Text>
                            </View>
                        </View>
                    )}
                </PdfLayout>
            </Page>
        </Document>
    );
}
