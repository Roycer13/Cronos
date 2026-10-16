import { Document, Page, StyleSheet, Text, View } from '@react-pdf/renderer';
import PdfLayout from './PdfLayout';

const styles = StyleSheet.create({
    section: { marginBottom: 8 },
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
    cell: {
        flex: 1,
        padding: 1,
        fontSize: 5.5,
        textAlign: 'center',
        borderRightWidth: 0.5,
        borderColor: '#bbb',
    },
    baseCell: {
        padding: 1,
        fontSize: 5.5,
        textAlign: 'center',
        borderRightWidth: 0.5,
        borderColor: '#bbb',
    },
    areaCell: { width: '9%' },
    cargoCell: { width: '15%' },
    usuarioCell: { width: '12%' },
    utensilioCell: { width: '10%' },
    quantityCell: { width: '5%' },
    codeCell: { width: '6%' },
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
    statusCell: { width: '14%', paddingTop: 8, paddingHorizontal: 1, fontSize: 4.5, fontWeight: 'bold', textAlign: 'center', height: 20 },
    statusCell2: { width: '14%', paddingTop: 1, paddingHorizontal: 1, fontSize: 4.5, fontWeight: 'bold', textAlign: 'center' },
    observationCell: { width: '72%', paddingTop: 8, paddingHorizontal: 1, fontSize: 4.5, fontWeight: 'bold', textAlign: 'center' },
    usersTable: { marginTop: 6, borderWidth: 0.5, borderColor: '#bbb', width: '65%', flex: 1 },
    usersHeader: { flexDirection: 'row', borderBottomWidth: 1, borderColor: '#333', backgroundColor: '#2c3e50' },
    usersCell: { flex: 1, padding: 2, fontSize: 7, color: '#fff', fontWeight: 'bold' },
    legend: { marginTop: 3, fontSize: 6, color: '#555' },
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

function ReviewGroup({ review }: { review?: any }) {
    return (
        <View style={styles.dateGroup}>
            <Text style={styles.statusCell2}>{review ? (review.tiene_codigo ? 'C.' : 'N.C.') : '-'}</Text>
            <Text style={styles.statusCell2}>{review ? (review.buen_estado ? 'C.' : 'N.C.') : '-'}</Text>
            <Text style={styles.statusCell2}>{text(review?.observaciones)}</Text>
        </View>
    );
}

function UtensiliosTable({ rows, reviewCount }: { rows: any[]; reviewCount: number }) {
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
                <Text style={[styles.baseCell, styles.areaCell]}>ÁREA</Text>
                <Text style={[styles.baseCell, styles.cargoCell]}>CARGO</Text>
                <Text style={[styles.baseCell, styles.usuarioCell]}>NOMBRE DEL TRABAJADOR</Text>
                <Text style={[styles.baseCell, styles.utensilioCell]}>UTENSILIO</Text>
                <Text style={[styles.baseCell, styles.quantityCell]}>CANT.</Text>
                <Text style={[styles.baseCell, styles.codeCell]}>CÓDIGO</Text>
                {Array.from({ length: reviewCount }, (_, index) => (
                    <View key={index} style={styles.dateGroup}>
                        <Text style={styles.dateTitle}>FECHA: {fechas[index]}</Text>
                            <Text style={styles.statusCell}>¿tiene código?</Text>
                            <Text style={styles.statusCell}>¿buen estado?</Text>
                            <Text style={styles.observationCell}>OBSERVACIONES</Text>
                    </View>
                ))}
            </View>
            {Object.entries(grouped).map(([area, areaRows]) => (
                <View key={area}>
                    {areaRows.map((row, index) => (
                        <View key={`${row.detalle_utensilio_id}-${index}`} style={styles.row} wrap={false}>
                            <Text style={[styles.baseCell, styles.areaCell]}>{text(row.area)}</Text>
                            <Text style={[styles.baseCell, styles.cargoCell]}>{text(row.cargo)}</Text>
                            <Text style={[styles.baseCell, styles.usuarioCell]}>{text(row.responsable)}</Text>
                            <Text style={[styles.baseCell, styles.utensilioCell]}>{text(row.utensilio)}</Text>
                            <Text style={[styles.baseCell, styles.quantityCell]}>{text(row.cantidad)}</Text>
                            <Text style={[styles.baseCell, styles.codeCell]}>{text(row.codigo)}</Text>
                            {Array.from({ length: reviewCount }, (_, reviewIndex) => (
                                <ReviewGroup key={reviewIndex} review={row.revisiones?.[reviewIndex]} />
                            ))}
                        </View>
                    ))}
                </View>
            ))}
        </View>
    );
}

export default function ReporteUtensilios({ datos, mes }: { datos: { quincenal: any[]; mensual: any[]; usuarios_involucrados?: any[] }; mes: string }) {
    return (
        <Document>
            <Page size="LETTER" orientation="landscape" style={{ padding: 20 }}>
                <PdfLayout title={`SEGUIMIENTO A ESTADO DE INSTRUMENTOS Y UTENSILIOS AFILADOS DE METAL`} tipo="REGISTRO" version="001" codigo="PLL-REG-168">
                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>RIESGO MODERADO INSPECCIÓN QUINCENALES</Text>
                        <UtensiliosTable rows={datos?.quincenal ?? []} reviewCount={2} />
                    </View>
                    <View style={styles.section} wrap={false}>
                        <Text style={styles.sectionTitle}>INSPECCIÓN MENSUAL</Text>
                        <UtensiliosTable rows={datos?.mensual ?? []} reviewCount={1} />
                    </View>
                    <Text style={styles.legend}>Glosa: - = Sin registro, C. = Cumple, N.C. = No cumple</Text>
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
