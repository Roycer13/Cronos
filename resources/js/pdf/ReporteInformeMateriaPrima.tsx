import { Document, Page, StyleSheet, Text, View } from '@react-pdf/renderer';
import PdfLayout from './PdfLayout';

// Mismo formato que ReporteRecepcion: hoja Carta horizontal, margen 20,
// encabezado con logo/código/versión y pie con fecha y número de página (PdfLayout).

const kg = (v: string | number | null | undefined) =>
    Number(v ?? 0).toLocaleString('es-BO', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

const fecha = (v?: string | null) => {
    if (!v) return '-';
    const d = new Date(v);
    if (isNaN(d.getTime())) return '-';
    const p = (n: number) => n.toString().padStart(2, '0');
    return `${p(d.getDate())}-${p(d.getMonth() + 1)}-${d.getFullYear().toString().slice(-2)} ${p(d.getHours())}:${p(d.getMinutes())}`;
};

const styles = StyleSheet.create({
    info: { fontSize: 7, color: '#333', marginBottom: 4 },
    cards: { flexDirection: 'row', marginBottom: 6 },
    card: { flex: 1, borderWidth: 0.5, borderColor: '#bbb', backgroundColor: '#E8F0FA', padding: 4, marginRight: 4 },
    cardLabel: { fontSize: 6.5, color: '#333' },
    cardValue: { fontSize: 11, fontWeight: 'bold', color: '#000' },
    groups: { flexDirection: 'row', marginBottom: 6 },
    groupBox: { flex: 1, marginRight: 4 },
    sectionTitle: { fontSize: 8, fontWeight: 'bold', marginBottom: 2, marginTop: 2 },
    tableWrapper: { borderWidth: 0.5, borderColor: '#bbb', marginTop: 2 },
    tableHeader: { flexDirection: 'row', borderBottomWidth: 1, borderColor: '#333', backgroundColor: '#E8F0FA' },
    headerCell: {
        padding: 1.5, fontSize: 6.5, fontWeight: 'bold', textAlign: 'center', color: '#000',
        borderRightWidth: 0.5, borderColor: '#333', justifyContent: 'center', alignItems: 'center',
    },
    row: { flexDirection: 'row', borderBottomWidth: 0.5, borderColor: '#e0e0e0', paddingVertical: 0.5, backgroundColor: '#fafafa' },
    cell: { paddingHorizontal: 2, paddingVertical: 0.5, fontSize: 6, textAlign: 'center', justifyContent: 'center', alignItems: 'center' },
    left: { textAlign: 'left' },
    right: { textAlign: 'right' },
    legend: { marginTop: 3, fontSize: 7, color: '#555', textAlign: 'center' },
});

type Col = { titulo: string; flex: number; align?: 'left' | 'right' };

function Tabla({ cols, filas }: { cols: Col[]; filas: (string | number)[][] }) {
    return (
        <View style={styles.tableWrapper}>
            <View style={styles.tableHeader} fixed>
                {cols.map((c, i) => (
                    <Text key={i} style={{ ...styles.headerCell, flex: c.flex, borderRightWidth: i === cols.length - 1 ? 0 : 0.5 }}>
                        {c.titulo}
                    </Text>
                ))}
            </View>
            {filas.length === 0 && (
                <View style={styles.row}><Text style={{ ...styles.cell, flex: 1 }}>Sin registros</Text></View>
            )}
            {filas.map((fila, r) => (
                <View key={r} style={styles.row} wrap={false}>
                    {fila.map((valor, i) => (
                        <Text
                            key={i}
                            style={{
                                ...styles.cell,
                                flex: cols[i].flex,
                                ...(cols[i].align === 'left' ? styles.left : {}),
                                ...(cols[i].align === 'right' ? styles.right : {}),
                            }}
                        >
                            {String(valor)}
                        </Text>
                    ))}
                </View>
            ))}
        </View>
    );
}

const colsGrupo = (primera: string): Col[] => [
    { titulo: primera, flex: 3, align: 'left' },
    { titulo: 'Recep.', flex: 1 },
    { titulo: 'Total kg', flex: 1.4, align: 'right' },
    { titulo: 'Sin kg', flex: 0.8 },
];

const filasGrupo = (grupos: any[], nombre: (g: any) => string | undefined) =>
    (grupos ?? []).map((g) => [nombre(g) ?? '-', g.recepciones, kg(g.total_kg), g.sin_kg]);

export default function ReporteInformeMateriaPrima({ datos }: any) {
    const resumen = datos?.resumen ?? {};
    const general = resumen.general ?? {};
    const detalle: any[] = datos?.detalle ?? [];

    const colsDetalle: Col[] = [
        { titulo: 'Fecha', flex: 1.2 },
        { titulo: 'Materia prima', flex: 2.2, align: 'left' },
        { titulo: 'Proveedor', flex: 2, align: 'left' },
        { titulo: 'Lotes', flex: 2, align: 'left' },
        { titulo: 'Total kg', flex: 1, align: 'right' },
        { titulo: 'Estado', flex: 1 },
        { titulo: 'Liberación', flex: 1 },
        { titulo: 'Certif.', flex: 0.7 },
    ];

    const filasDetalle = detalle.map((r) => [
        fecha(r.tiempo),
        r.item_materia_prima?.nombre ?? '-',
        r.proveedor_materia_prima?.nombre ?? '-',
        (r.recepcion_lotes ?? []).map((l: any) => l.lote).filter(Boolean).join(', ') || '-',
        r.cantidad_recepcionada_total_kg != null ? kg(r.cantidad_recepcionada_total_kg) : '-',
        r.estado?.nombre ?? '-',
        r.liberacion?.nombre ?? '-',
        r.certificado ? 'Sí' : 'No',
    ]);

    return (
        <Document>
            <Page size="LETTER" orientation="landscape" style={{ padding: 20 }}>
                <PdfLayout
                    title="INFORME DE MATERIA PRIMA INGRESADA"
                    tipo="REGISTRO"
                    version="001"
                    codigo="PLL-INF-062"
                >
                    <Text style={styles.info}>
                        Filtros: {datos?.filtros_texto || 'Sin filtros'}
                        {datos?.emitido_por ? `   |   Emitido por: ${datos.emitido_por}` : ''}
                    </Text>

                    <View style={styles.cards}>
                        <View style={styles.card}><Text style={styles.cardLabel}>Recepciones</Text><Text style={styles.cardValue}>{general.recepciones ?? 0}</Text></View>
                        <View style={styles.card}><Text style={styles.cardLabel}>Total ingresado (kg)</Text><Text style={styles.cardValue}>{kg(general.total_kg)}</Text></View>
                        <View style={{ ...styles.card, marginRight: 0 }}><Text style={styles.cardLabel}>Recepciones sin kg registrados</Text><Text style={styles.cardValue}>{general.sin_kg ?? 0}</Text></View>
                    </View>

                    <View style={styles.groups}>
                        <View style={styles.groupBox}>
                            <Text style={styles.sectionTitle}>Por materia prima</Text>
                            <Tabla cols={colsGrupo('Materia prima')} filas={filasGrupo(resumen.por_item, (g) => g.item_materia_prima?.nombre)} />
                        </View>
                        <View style={styles.groupBox}>
                            <Text style={styles.sectionTitle}>Por proveedor</Text>
                            <Tabla cols={colsGrupo('Proveedor')} filas={filasGrupo(resumen.por_proveedor, (g) => g.proveedor_materia_prima?.nombre)} />
                        </View>
                        <View style={{ ...styles.groupBox, marginRight: 0 }}>
                            <Text style={styles.sectionTitle}>Por estado</Text>
                            <Tabla cols={colsGrupo('Estado')} filas={filasGrupo(resumen.por_estado, (g) => g.estado?.nombre)} />
                        </View>
                    </View>

                    <Text style={styles.sectionTitle}>Detalle de recepciones ({detalle.length})</Text>
                    <Tabla cols={colsDetalle} filas={filasDetalle} />

                    <Text style={styles.legend}>Glosa: - = Sin registro. Sin kg = recepciones sin peso total registrado (no suman al total).</Text>
                </PdfLayout>
            </Page>
        </Document>
    );
}
