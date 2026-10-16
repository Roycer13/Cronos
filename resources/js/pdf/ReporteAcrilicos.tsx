import { Document, Page, StyleSheet, Text, View } from '@react-pdf/renderer';
import PdfLayout from './PdfLayout';

const styles = StyleSheet.create({
    section: { marginBottom: 5 },
    sectionTitle: {
        backgroundColor: '#E8F0FA',
        borderWidth: 0.5,
        borderColor: '#333',
        fontSize: 8,
        fontWeight: 'bold',
        padding: 3,
        textAlign: 'center',
    },
    table: { borderWidth: 0.5, borderColor: '#333', marginTop: 3 },
    row: { flexDirection: 'row', borderBottomWidth: 0.5, borderColor: '#bbb' },
    header: { backgroundColor: '#E8F0FA', borderBottomWidth: 1, borderColor: '#333' },
    baseCell: {
        padding: 1,
        fontSize: 5.5,
        textAlign: 'center',
        borderRightWidth: 0.5,
        borderColor: '#bbb',
    },
    codeCell: { width: '13%' },
    areaCell: { width: '12%' },
    quantityCell: { width: '9%' },
    dateGroup: {
        flex: 1,
        flexDirection: 'row',
        borderRightWidth: 0.5,
        borderColor: '#333',
    },
    dateTitle: {
        position: 'absolute',
        top: 1,
        left: 0,
        right: 0,
        fontSize: 5.5,
        textAlign: 'center',
    },
    statusCell: { width: '33.33%', paddingTop: 8, paddingHorizontal: 1, fontSize: 4.2, fontWeight: 'bold', textAlign: 'center', height: 20 },
    statusCell2: { width: '33.33%', paddingTop: 1, paddingHorizontal: 1, fontSize: 4.2, fontWeight: 'bold', textAlign: 'center' },
    usersTable: { marginTop: 0, borderWidth: 0.5, borderColor: '#bbb', width: '65%', flex: 1 },
    usersHeader: { flexDirection: 'row', borderBottomWidth: 1, borderColor: '#333', backgroundColor: '#2c3e50' },
    usersCell: { flex: 1, padding: 2, fontSize: 7, color: '#fff', fontWeight: 'bold' },
    legend: { marginTop: 2, fontSize: 6, color: '#555' },
});

function text(value: unknown) {
    return value === null || value === undefined || value === '' ? '-' : String(value);
}

function formatDate(value?: string | null) {
    if (!value) return '-';
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return '-';
    return date.toLocaleDateString('es-BO');
}

function ReviewGroup({ reviews }: { reviews: any[] }) {
    return (
        <View style={styles.dateGroup}>
            <Text style={styles.statusCell2}>{reviews.map((review) => review ? (review.integridad_vidrios ? 'C.' : 'N.C.') : '-').join('\n') || '-'}</Text>
            <Text style={styles.statusCell2}>{reviews.map((review) => review ? (review.integridad_luminarias ? 'C.' : 'N.C.') : '-').join('\n') || '-'}</Text>
            <Text style={styles.statusCell2}>{reviews.map((review) => review ? (review.informado ? 'SÍ' : 'NO') : '-').join('\n') || '-'}</Text>
        </View>
    );
}

function AcrilicosTable({ rows, reviewCount }: { rows: any[]; reviewCount: number }) {
    const fechas = Array.from({ length: reviewCount }, (_, index) => {
        const review = rows.find((row) => row.revisiones?.[index])?.revisiones?.[index];

        return formatDate(review?.fecha);
    });

    const grouped = rows.reduce<Record<string, any[]>>((result, row) => {
        const area = row.area || 'Sin área';
        (result[area] ??= []).push(row);
        return result;
    }, {});

    return (
        <View style={styles.table}>
            <View style={[styles.row, styles.header]}>
                <Text style={[styles.baseCell, styles.codeCell]}>CÓDIGO</Text>
                <Text style={[styles.baseCell, styles.areaCell]}>ÁREA</Text>
                <Text style={[styles.baseCell, styles.quantityCell]}>Cantidad de ventanas y acrílicos</Text>
                <Text style={[styles.baseCell, styles.quantityCell]}>Cantidad de luminarias</Text>
                {Array.from({ length: reviewCount }, (_, index) => (
                    <View key={index} style={styles.dateGroup}>
                        <Text style={styles.dateTitle}>FECHA: {fechas[index]}</Text>
                        <Text style={styles.statusCell}>Vidrios: integridad, fisuras, desprendimientos, roturas ¿Cumple?</Text>
                        <Text style={styles.statusCell}>Luminarias: integridad, fisuras, roturas, desprendimiento, explosión ¿Cumple?</Text>
                        <Text style={styles.statusCell}>¿Informado a Mantenimiento?</Text>
                    </View>
                ))}
            </View>
            {Object.entries(grouped).map(([area, areaRows]) => (
                <View key={area} style={styles.row} wrap={false}>
                    <Text style={[styles.baseCell, styles.codeCell]}>{areaRows.map((row) => text(row.codigo)).join('\n')}</Text>
                    <Text style={[styles.baseCell, styles.areaCell]}>{text(area)}</Text>
                    <Text style={[styles.baseCell, styles.quantityCell]}>{text(areaRows[0]?.cantidad_vidrios)}</Text>
                    <Text style={[styles.baseCell, styles.quantityCell]}>{text(areaRows[0]?.cantidad_luminarias)}</Text>
                    {Array.from({ length: reviewCount }, (_, reviewIndex) => (
                        <ReviewGroup key={reviewIndex} reviews={areaRows.map((row) => row.revisiones?.[reviewIndex])} />
                    ))}
                </View>
            ))}
        </View>
    );
}

export default function ReporteAcrilicos({ datos }: { datos: { quincenal: any[]; mensual: any[]; usuarios_involucrados?: any[] } }) {
    return (
        <Document>
            <Page size="LETTER" orientation="landscape" style={{ padding: 20 }}>
                <PdfLayout title="SEGUIMIENTO A ESTADO DE VENTANAS Y ACRÍLICOS" tipo="REGISTRO" version="001" codigo="PLL-REG-169">
                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>RIESGO MODERADO. INSPECCIONES QUINCENALES</Text>
                        <AcrilicosTable rows={datos?.quincenal ?? []} reviewCount={2} />
                    </View>
                    <View style={styles.section} wrap={false}>
                        <Text style={styles.sectionTitle}>RIESGO BAJO. INSPECCIÓN MENSUAL</Text>
                        <AcrilicosTable rows={datos?.mensual ?? []} reviewCount={1} />
                    </View>
                    <Text style={styles.legend}>Glosa: - = Sin registro. C. = Conforme. N.C. = No conforme.</Text>
                    <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 8, gap: 8 }}>
                        <View style={styles.usersTable}>
                            <View style={styles.usersHeader}>
                                <Text style={styles.usersCell}>CÓDIGO</Text>
                                <Text style={styles.usersCell}>NOMBRE</Text>
                            </View>
                            {(datos?.usuarios_involucrados ?? []).map((usuario, index) => (
                                <View key={`${usuario.codigo}-${index}`} style={{ flexDirection: 'row', borderBottomWidth: 0.5, borderColor: '#ddd', backgroundColor: index % 2 === 0 ? '#fafafa' : '#fff', paddingVertical: 2 }}>
                                    <Text style={{ ...styles.usersCell, color: '#000', fontWeight: 'normal' }}>{text(usuario.codigo)}</Text>
                                    <Text style={{ ...styles.usersCell, color: '#000', fontWeight: 'normal' }}>{text(usuario.nombre)}</Text>
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
