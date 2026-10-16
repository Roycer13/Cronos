import React from 'react';
import { Document, Page, View, Text, StyleSheet } from '@react-pdf/renderer';
import PdfLayout from './PdfLayout';

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
    tableWrapper: { borderWidth: 0.5, borderColor: '#bbb', marginTop: 6 },
    tableHeader: { flexDirection: 'row', borderBottomWidth: 1, borderColor: '#333', backgroundColor: '#E8F0FA' },
    headerCell: { flex: 1, padding: 4, fontSize: 5.5, fontWeight: 'bold', textAlign: 'center', borderRightWidth: 0.5, borderColor: '#333' },
    headerCellLast: { flex: 1, padding: 4, fontSize: 5.5, fontWeight: 'bold', textAlign: 'center' },
    rotatedCell: { flex: 0.2, justifyContent: 'center', alignItems: 'center', height: 70, padding: 2.5, borderRightWidth: 0.5, borderColor: '#333' },
    rotatedText: { transform: 'rotate(-90deg)', fontSize: 5.5, textAlign: 'center', width: 70 },
    row: { flexDirection: 'row', borderBottomWidth: 0.5, borderColor: '#e0e0e0', paddingVertical: 2, backgroundColor: '#fff' },
    cell: { flex: 1, paddingHorizontal: 4, fontSize: 7, textAlign: 'center', borderRightWidth: 0.5, borderColor: '#e0e0e0' },
    rotatedDataCell: { flex: 0.2, paddingHorizontal: 2, fontSize: 7, textAlign: 'center', borderRightWidth: 0.5, borderColor: '#e0e0e0' },
    cellLast: { flex: 1, paddingHorizontal: 4, fontSize: 7, textAlign: 'center' },
    usersTable: { marginTop: 6, borderWidth: 0.5, borderColor: '#bbb', width: '65%', flex: 1 },
    usersHeader: { flexDirection: 'row', borderBottomWidth: 1, borderColor: '#333', backgroundColor: '#2c3e50' },
    usersCell: { flex: 1, padding: 2, fontSize: 7, color: '#fff', fontWeight: 'bold' },
});

function formatFecha(value?: string | Date | null) {
    if (!value) return '-';
    try {
        const fecha = new Date(value);
        const dia = fecha.getDate().toString().padStart(2, '0');
        const mes = (fecha.getMonth() + 1).toString().padStart(2, '0');
        const año = fecha.getFullYear().toString();
        const hora = fecha.getHours().toString().padStart(2, '0');
        const minutos = fecha.getMinutes().toString().padStart(2, '0');
        return `${dia}-${mes}-${año} ${hora}:${minutos}`;
    } catch {
        return String(value);
    }
}

function formatBooleanValue(value?: string | boolean | null) {
    if (value === null || value === undefined || value === '') return '-';

    if (value === true || value === 'true') return 'C.';
    if (value === false || value === 'false') return 'N.C.';

    const normalized = String(value).trim().toLowerCase();
    if (normalized === 'normal' || normalized === 'cumple') return 'C.';
    if (normalized === 'anormal' || normalized === 'no cumple' || normalized === 'no_cumple' || normalized === 'n.c.' || normalized === 'nc') return 'N.C.';

    return String(value);
}

function formatNumericValue(value?: number | string | null) {
    if (value === null || value === undefined || value === '') return '-';

    const number = Number(value);
    if (Number.isNaN(number)) return String(value);

    return String(number);
}

export default function ReporteControlFisico({ datos, filtros, usuariosInvolucrados }: any) {
    const registros = Array.isArray(datos) ? datos : [];
    const usuarios = Array.isArray(usuariosInvolucrados) ? usuariosInvolucrados : [];

    return (
        <Document>
            <Page size="LETTER" style={{ padding: 20 }}>
                <PdfLayout title="CONTROL FISICOQUIMICO Y ORGANOLEPTICO" tipo="REGISTRO" version="001" codigo="PLL-REG-128">


                     <View style={styles.section}>
                                            <Text style={styles.sectionTitle}>
                                                DATOS DEL PRODUCTO
                                            </Text>
                                            <View style={styles.infoGrid}>
                                                <View style={styles.infoItem}>
                                                    <Text style={styles.infoLabel}>
                                                        Rango de fechas: desde {filtros?.fecha_desde || '-'} hasta {' '}
                                                        {filtros?.fecha_hasta || '-'}
                                                    </Text>
                                                </View>
                                            </View>
                                        </View>

                    <View style={styles.tableWrapper}>
                        <View style={styles.tableHeader}>
                            <Text style={styles.headerCell}>FECHA</Text>
                            <Text style={styles.headerCell}>USUARIO</Text>
                            <Text style={styles.headerCell}>pH POZO</Text>
                            <Text style={styles.headerCell}>DUREZA POZO</Text>
                            <Text style={styles.headerCell}>COND. POZO</Text>
                            <Text style={styles.headerCell}>pH ETAP</Text>
                            <Text style={styles.headerCell}>DUREZA ETAP</Text>
                            <Text style={styles.headerCell}>CLORUROS ETAP</Text>
                            <Text style={styles.headerCell}>COND. ETAP</Text>
                            <View style={styles.rotatedCell}>
                                <Text style={styles.rotatedText}>COLOR</Text>
                            </View>
                            <View style={styles.rotatedCell}>
                                <Text style={styles.rotatedText}>OLOR</Text>
                            </View>
                            <View style={styles.rotatedCell}>
                                <Text style={styles.rotatedText}>SABOR</Text>
                            </View>
                            <View style={styles.rotatedCell}>
                                <Text style={styles.rotatedText}>ASPECTO</Text>
                            </View>
                            <View style={styles.rotatedCell}>
                                <Text style={styles.rotatedText}>COLOR ETAP</Text>
                            </View>
                            <View style={styles.rotatedCell}>
                                <Text style={styles.rotatedText}>OLOR ETAP</Text>
                            </View>
                            <View style={styles.rotatedCell}>
                                <Text style={styles.rotatedText}>SABOR ETAP</Text>
                            </View>
                            <View style={styles.rotatedCell}>
                                <Text style={styles.rotatedText}>ASPECTO ETAP</Text>
                            </View>
                            <Text style={styles.headerCellLast}>OBSERVACIONES</Text>
                        </View>
                        {registros.map((r: any, idx: number) => (
                            <View key={idx} style={styles.row} wrap={false}>
                                <Text style={styles.cell}>{formatFecha(r.tiempo)}</Text>
                                <Text style={styles.cell}>{r.usuario?.codigo || '-'}</Text>
                                <Text style={styles.cell}>{formatNumericValue(r.ph_pozo)}</Text>
                                <Text style={styles.cell}>{formatNumericValue(r.dureza_pozo)}</Text>
                                <Text style={styles.cell}>{formatNumericValue(r.conductividad_pozo)}</Text>
                                <Text style={styles.cell}>{formatNumericValue(r.ph_etap)}</Text>
                                <Text style={styles.cell}>{formatNumericValue(r.dureza_etap)}</Text>
                                <Text style={styles.cell}>{formatNumericValue(r.cloruros_etap)}</Text>
                                <Text style={styles.cell}>{formatNumericValue(r.conductividad_etap)}</Text>
                                <Text style={styles.rotatedDataCell}>{formatBooleanValue(r.color)}</Text>
                                <Text style={styles.rotatedDataCell}>{formatBooleanValue(r.olor)}</Text>
                                <Text style={styles.rotatedDataCell}>{formatBooleanValue(r.sabor)}</Text>
                                <Text style={styles.rotatedDataCell}>{formatBooleanValue(r.aspecto)}</Text>
                                <Text style={styles.rotatedDataCell}>{formatBooleanValue(r.color_etap)}</Text>
                                <Text style={styles.rotatedDataCell}>{formatBooleanValue(r.olor_etap)}</Text>
                                <Text style={styles.rotatedDataCell}>{formatBooleanValue(r.sabor_etap)}</Text>
                                <Text style={styles.rotatedDataCell}>{formatBooleanValue(r.aspecto_etap)}</Text>
                                <Text style={styles.cellLast}>{r.observaciones ?? '-'}</Text>
                            </View>
                        ))}
                    </View>
                    <Text style={styles.legend}>Glosa: - = Sin Registro, C.= Cumple, N.C.= No Cumple.</Text>

                    {/* Usuarios involucrados y firma */}
                    <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 8, gap: 8, pageBreakInside: 'avoid' as any }}>
                        <View style={styles.usersTable}>
                            <View style={styles.usersHeader}>
                                <Text style={styles.usersCell}>CÓDIGO</Text>
                                <Text style={styles.usersCell}>NOMBRE </Text>
                            </View>
                            {usuarios.map((u: any, i: number) => (
                                <View key={i} style={{ flexDirection: 'row', borderBottomWidth: 0.5, borderColor: '#ddd', backgroundColor: i % 2 === 0 ? '#fafafa' : '#fff', paddingVertical: 2 }}>
                                    <Text style={{ ...styles.usersCell, color: '#000', fontWeight: 'normal' }}>{u.codigo}</Text>
                                    <Text style={{ ...styles.usersCell, color: '#000', fontWeight: 'normal' }}>{`${u.nombre}`}</Text>
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
