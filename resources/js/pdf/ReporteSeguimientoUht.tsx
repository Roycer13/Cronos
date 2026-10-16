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
        // const hora = fecha.getHours().toString().padStart(2, '0');
        // const minutos = fecha.getMinutes().toString().padStart(2, '0');
        return `${dia}-${mes}-${año} `;
    } catch {
        return '-';
    }
}

function formatScientific(value: any, decimals: number = 2, fallback: string = '-'): string {
    const num = Number(value);
    if (isNaN(num)) return fallback;
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
    headerRow: { flexDirection: 'row', borderBottomWidth: 1, borderColor: '#333', backgroundColor: '#E8F0FA' },
    headerSubRow: { flexDirection: 'row', borderBottomWidth: 1, borderColor: '#333', backgroundColor: '#E8F0FA' },
    headerCellMain: { padding: 3, fontSize: 7, fontWeight: 'bold', textAlign: 'center', borderRightWidth: 0.5, borderColor: '#333' },
    headerCellSub: { padding: 3, fontSize: 6.5, fontWeight: 'bold', textAlign: 'center', borderRightWidth: 0.5, borderColor: '#333' },
    headerCellSubLast: { padding: 3, fontSize: 6.5, fontWeight: 'bold', textAlign: 'center' },
    row: { flexDirection: 'row', borderBottomWidth: 0.5, borderColor: '#e0e0e0', paddingVertical: 4, backgroundColor: '#fafafa' },
    cell: { flex: 1, paddingHorizontal: 2, paddingVertical: 2, fontSize: 6.5, textAlign: 'center', borderRightWidth: 0.5, borderColor: '#e0e0e0' },
    cellLast: { flex: 1, paddingHorizontal: 2, paddingVertical: 2, fontSize: 6.5, textAlign: 'center' },
    // Tabla de usuarios (códigos)
    usersCodesTable: { marginTop: 12, borderWidth: 0.5, borderColor: '#bbb', width: '100%' },
    usersCodesHeader: { flexDirection: 'row', borderBottomWidth: 1, borderColor: '#333', backgroundColor: '#2c3e50' },
    usersCodesCell: { flex: 1, padding: 2, fontSize: 7, color: '#fff', fontWeight: 'bold', textAlign: 'center' },
    // Tabla de usuarios involucrados (con nombres)
    usersTable: { marginTop: 12, borderWidth: 0.5, borderColor: '#bbb', width: '65%' },
    usersHeader: { flexDirection: 'row', borderBottomWidth: 1, borderColor: '#333', backgroundColor: '#2c3e50' },
    usersCell: { flex: 1, padding: 2, fontSize: 7, color: '#fff', fontWeight: 'bold' },
    // Firma
    signatureBox: { width: '33%', borderWidth: 1, borderColor: '#2c3e50', padding: 8, backgroundColor: '#fafafa' },
    signatureLine: { borderBottomWidth: 2, borderColor: '#2c3e50', height: 40, marginBottom: 6 },
    signatureText: { fontSize: 7, fontWeight: 'bold', textAlign: 'center', color: '#2c3e50', marginBottom: 2 },
    signatureDate: { fontSize: 5.5, textAlign: 'center', color: '#666' },
});

export default function ReporteSeguimientoUht({ data }: any) {
    if (!data || !data.orp) {
        return (
            <Document>
                <Page size="LETTER" orientation="portrait" style={{ padding: 20 }}>
                        <PdfLayout title="Error" tipo="REGISTRO" version="001" codigo="ERR">
                        <Text>No se recibieron datos válidos para el reporte.</Text>
                    </PdfLayout>
                </Page>
            </Document>
        );
    }

    const orp = data.orp;
    const filas = data.filas || [];
    const origenes = data.origenes || {};
    const conteoPorOrigen = data.conteoPorOrigen || {};
    const usuariosSiembra = data.usuariosSiembra || [];
    const usuariosDia2 = data.usuariosDia2 || [];
    const usuariosDia5 = data.usuariosDia5 || [];
    const usuariosInvolucrados = data.usuarios_involucrados || [];

    const producto = orp.producto_terminado;
    const fechaProduccion = data.fecha_produccion || orp.fecha_produccion;
    const vencimiento1 = orp.fecha_vencimiento1;
    const vencimiento2 = orp.fecha_vencimiento2;
    const destino = producto?.destino?.nombre || '-';
    const preparacion = orp.lote ? `${orp.lote}` : '-';

    const origenesArray = Object.entries(origenes).map(([id, alias]) => ({ id, alias }));

    return (
        <Document>
            <Page size="LETTER" orientation="portrait" style={{ padding: 20 }}>
                <PdfLayout
                    title="CONTROL MICROBIOLOGICO DE PRODUCTO TERMINADO UHT"
                    tipo="REGISTRO"
                    version="001"
                    codigo="PLL-REG-021"
                >
                    {/* INFORMACIÓN GENERAL */}
                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>INFORMACIÓN GENERAL</Text>
                        <View style={styles.infoGrid}>
                            <View style={styles.infoItem}>
                                <Text style={styles.infoLabel}>Fecha de Producción:</Text>
                                <Text style={styles.infoValue}>{formatFecha(fechaProduccion)}</Text>
                            </View>
                            <View style={styles.infoItem}>
                                <Text style={styles.infoLabel}>ORP:</Text>
                                <Text style={styles.infoValue}>{orp.codigo}</Text>
                            </View>
                            <View style={styles.infoItem}>
                                <Text style={styles.infoLabel}>Producto:</Text>
                                <Text style={styles.infoValue}>{producto?.nombre_sap || '-'}</Text>
                            </View>
                            <View style={styles.infoItem}>
                                <Text style={styles.infoLabel}>Fecha(s) de Vencimiento:</Text>
                                <Text style={styles.infoValue}>
                                    {formatFecha(vencimiento1)}{vencimiento2 ? ` / ${formatFecha(vencimiento2)}` : ''}
                                </Text>
                            </View>
                            <View style={styles.infoItem}>
                                <Text style={styles.infoLabel}>Preparación:</Text>
                                <Text style={styles.infoValue}>{preparacion/1}</Text>
                            </View>
                            <View style={styles.infoItem}>
                                <Text style={styles.infoLabel}>Destino:</Text>
                                <Text style={styles.infoValue}>{destino}</Text>
                            </View>
                        </View>
                    </View>

                    {/* TABLA PRINCIPAL */}
                    <View style={styles.tableWrapper}>
                        <View style={styles.headerRow}>
                            <View style={{ flex: 1 }}><Text style={styles.headerCellMain}>LOTE</Text></View>
                            <View style={{ flex: 1 }}><Text style={styles.headerCellMain}> #</Text></View>
                            {origenesArray.map((origen, idx) => (
                                <View key={idx} style={{ flex: 2 }}><Text style={styles.headerCellMain}>{origen.alias}</Text></View>
                            ))}
                        </View>
                        <View style={styles.headerSubRow}>
                            <View style={{ flex: 1 }} />
                            <View style={{ flex: 1 }} />
                            {origenesArray.map((_, idx) => (
                                <React.Fragment key={idx}>
                                    <View style={{ flex: 1 }}><Text style={styles.headerCellSub}>RT</Text></View>
                                    <View style={{ flex: 1 }}><Text style={idx === origenesArray.length - 1 ? styles.headerCellSubLast : styles.headerCellSub}>MyL</Text></View>
                                </React.Fragment>
                            ))}
                        </View>

                        {filas.map((fila, idx) => (
                            <View key={idx} style={styles.row}>
                                <View style={{ flex: 1 }}><Text style={styles.cell}>{fila.lote}</Text></View>
                                <View style={{ flex: 1 }}><Text style={styles.cell}>{fila.numero}</Text></View>
                                {origenesArray.map((origen, oIdx) => {
                                    const valores = fila.valores[origen.id] || {};
                                    return (
                                        <React.Fragment key={oIdx}>
                                            <View style={{ flex: 1 }}><Text style={styles.cell}>{valores.rt !== null && valores.rt !== undefined ? formatScientific(valores.rt, 2) : '-'}</Text></View>
                                            <View style={{ flex: 1 }}><Text style={oIdx === origenesArray.length - 1 ? styles.cellLast : styles.cell}>{valores.myl !== null && valores.myl !== undefined ? formatScientific(valores.myl, 2) : '-'}</Text></View>
                                        </React.Fragment>
                                    );
                                })}
                            </View>
                        ))}
                    </View>

                    {/* RESUMEN POR ORIGEN */}
                    <View style={{ marginTop: 8 }}>
                        <Text style={{ fontSize: 7, fontWeight: 'bold', marginBottom: 3 }}></Text>
                        <View style={{ flexDirection: 'row', borderWidth: 0.5, borderColor: '#bbb', backgroundColor: '#fafafa' }}>
                            <View style={{ flex: 1, padding: 2, borderRightWidth: 0.5, borderColor: '#bbb' }}><Text style={{ fontSize: 6, fontWeight: 'bold', textAlign: 'center' }}>Origen</Text></View>
                            <View style={{ flex: 1, padding: 2, borderRightWidth: 0.5, borderColor: '#bbb' }}><Text style={{ fontSize: 6, fontWeight: 'bold', textAlign: 'center' }}>RT (+) / Total</Text></View>
                            <View style={{ flex: 1, padding: 2 }}><Text style={{ fontSize: 6, fontWeight: 'bold', textAlign: 'center' }}>MyL (+) / Total</Text></View>
                        </View>
                        {origenesArray.map((origen, idx) => {
    const conteo = conteoPorOrigen[origen.id] || { rt_positivos: 0, rt_total: 0, myl_positivos: 0, myl_total: 0 };
    return (
        <View key={idx} style={{ flexDirection: 'row', borderBottomWidth: 0.5, borderColor: '#ddd', backgroundColor: idx % 2 === 0 ? '#fafafa' : '#fff' }}>
            <View style={{ flex: 1, padding: 2, borderRightWidth: 0.5, borderColor: '#ddd' }}><Text style={{ fontSize: 6, textAlign: 'center' }}>{origen.alias}</Text></View>
            <View style={{ flex: 1, padding: 2, borderRightWidth: 0.5, borderColor: '#ddd' }}><Text style={{ fontSize: 6, textAlign: 'center' }}>{conteo.rt_positivos} / {conteo.rt_total}</Text></View>
            <View style={{ flex: 1, padding: 2 }}><Text style={{ fontSize: 6, textAlign: 'center' }}>{conteo.myl_positivos} / {conteo.myl_total}</Text></View>
        </View>
    );
})}
                    </View>

                      <Text style={styles.legend}>Glosa: - = Sin Registro.</Text>


                    {/* TABLA DE USUARIOS (CÓDIGOS) - SIEMBRA, DÍA2, DÍA5 */}
                    <View style={styles.usersCodesTable}>
                        <View style={styles.usersCodesHeader}>
                            <Text style={styles.usersCodesCell}>USUARIO SIEMBRA</Text>
                            <Text style={styles.usersCodesCell}>USUARIO LECTURA 2 DÍAS</Text>
                            <Text style={styles.usersCodesCell}>USUARIO LECTURA 5 DÍAS</Text>
                        </View>
                        {Array.from({ length: Math.max(usuariosSiembra.length, usuariosDia2.length, usuariosDia5.length) }).map((_, i) => (
                            <View key={i} style={{ flexDirection: 'row', borderBottomWidth: 0.5, borderColor: '#ddd', backgroundColor: i % 2 === 0 ? '#fafafa' : '#fff', paddingVertical: 2 }}>
                                <Text style={{ ...styles.usersCodesCell, color: '#000', fontWeight: 'normal' }}>{usuariosSiembra[i]?.codigo || '-'}</Text>
                                <Text style={{ ...styles.usersCodesCell, color: '#000', fontWeight: 'normal' }}>{usuariosDia2[i]?.codigo || '-'}</Text>
                                <Text style={{ ...styles.usersCodesCell, color: '#000', fontWeight: 'normal' }}>{usuariosDia5[i]?.codigo || '-'}</Text>
                            </View>
                        ))}
                    </View>

                    {/* TABLA DE USUARIOS INVOLUCRADOS (CÓDIGO + NOMBRE) */}
                    {usuariosInvolucrados.length > 0 && (
                        <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 12, gap: 8, pageBreakInside: 'avoid' as any }}>
                            <View style={styles.usersTable}>
                                <View style={styles.usersHeader}>
                                    <Text style={styles.usersCell}>CÓDIGO</Text>
                                    <Text style={styles.usersCell}>NOMBRE </Text>
                                </View>
                                {usuariosInvolucrados.map((u: any, i: number) => (
                                    <View key={i} style={{ flexDirection: 'row', borderBottomWidth: 0.5, borderColor: '#ddd', backgroundColor: i % 2 === 0 ? '#fafafa' : '#fff', paddingVertical: 2 }}>
                                        <Text style={{ ...styles.usersCell, color: '#000', fontWeight: 'normal' }}>{u.codigo}</Text>
                                        <Text style={{ ...styles.usersCell, color: '#000', fontWeight: 'normal' }}>{`${u.nombre}`}</Text>
                                    </View>
                                ))}
                            </View>

                            {/* FIRMA REVISOR (recuadro) */}
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
