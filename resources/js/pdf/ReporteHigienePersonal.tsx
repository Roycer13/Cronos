import React from 'react';
import { Document, Page, StyleSheet, Text, View } from '@react-pdf/renderer';
import PdfLayout from './PdfLayout';

const styles = StyleSheet.create({
    section: {
        paddingTop: 4,
        paddingBottom: 4,
        marginBottom: 4,
        borderWidth: 0.3,
        borderColor: '#ddd',
        padding: 3,
        backgroundColor: '#fafafa',
    },
    sectionTitle: {
        fontSize: 6,
        fontWeight: 'bold',
        marginBottom: 1,
        backgroundColor: '#E8F0FA',
        padding: 1,
        color: '#000',
    },
    infoGrid: {
        display: 'flex',
        flexDirection: 'row',
        flexWrap: 'wrap',
        marginBottom: 1,
    },
    infoItem: {
        width: '50%',
        marginBottom: 0.5,
        paddingRight: 2,
        flexDirection: 'row',
        alignItems: 'center',
    },
    infoLabel: {
        fontSize: 6,
        fontWeight: 'bold',
        color: '#333',
        marginRight: 2,
    },
    infoValue: {
        fontSize: 6,
        color: '#000',
    },
    tableWrapper: { borderWidth: 0.3, borderColor: '#bbb', marginTop: 2 },
    headerRow: {
        flexDirection: 'row',
        borderBottomWidth: 0.5,
        borderColor: '#333',
        backgroundColor: '#E8F0FA',
    },
    headerSubRow: {
        flexDirection: 'row',
        borderBottomWidth: 0.5,
        borderColor: '#333',
        backgroundColor: '#E8F0FA',
    },
    dataRow: {
        flexDirection: 'row',
        borderBottomWidth: 0.3,
        borderColor: '#e0e0e0',
        paddingVertical: 0.5,
        backgroundColor: '#fafafa',
    },
    cell: {
        paddingHorizontal: 1,
        paddingVertical: 0.5,
        fontSize: 4.5,
        textAlign: 'center',
        borderRightWidth: 0.3,
        borderColor: '#e0e0e0',
    },
    cellLast: {
        paddingHorizontal: 1,
        paddingVertical: 0.5,
        fontSize: 4.5,
        textAlign: 'center',
    },
    cellWithSeparator: {
        paddingHorizontal: 1,
        paddingVertical: 0.5,
        fontSize: 4.5,
        textAlign: 'center',
        borderRightWidth: 0.3,
        borderColor: '#e0e0e0',
        borderLeftWidth: 0.8,
        borderLeftColor: '#888',
    },
    cellLastWithSeparator: {
        paddingHorizontal: 1,
        paddingVertical: 0.5,
        fontSize: 4.5,
        textAlign: 'center',
        borderLeftWidth: 0.8,
        borderLeftColor: '#888',
    },
    employeeCell: {
        paddingHorizontal: 1,
        paddingVertical: 0.5,
        fontSize: 4.5,
        textAlign: 'left',
        borderRightWidth: 0.3,
        borderColor: '#e0e0e0',
    },
    summaryCell: {
        paddingHorizontal: 1,
        paddingVertical: 0.5,
        fontSize: 4,
        textAlign: 'left',
        whiteSpace: 'pre-wrap',
        borderRightWidth: 0,
        borderLeftWidth: 0,
    },
    summaryCellWithSeparator: {
        paddingHorizontal: 1,
        paddingVertical: 0.5,
        fontSize: 4,
        textAlign: 'left',
        whiteSpace: 'pre-wrap',
        borderLeftWidth: 0.8,
        borderLeftColor: '#888',
        borderRightWidth: 0,
    },
    dayContainer: { flexDirection: 'row', borderLeftWidth: 0 },
    dayContainerWithSeparator: { flexDirection: 'row', borderLeftWidth: 0.8, borderLeftColor: '#888' },
    usersTable: { marginTop: 6, borderWidth: 0.3, borderColor: '#bbb', width: '65%' },
    usersHeader: { flexDirection: 'row', borderBottomWidth: 0.5, borderColor: '#333', backgroundColor: '#2c3e50' },
    usersCell: { flex: 1, padding: 1, fontSize: 5.5, color: '#fff', fontWeight: 'bold' },
    signatureBox: { width: '33%', borderWidth: 0.8, borderColor: '#2c3e50', padding: 5, backgroundColor: '#fafafa' },
    signatureLine: { borderBottomWidth: 1.5, borderColor: '#2c3e50', height: 25, marginBottom: 4 },
    signatureText: { fontSize: 5.5, fontWeight: 'bold', textAlign: 'center', color: '#2c3e50', marginBottom: 1 },
    signatureDate: { fontSize: 4.5, textAlign: 'center', color: '#666' },
    legend: { marginTop: 3, fontSize: 4.5, color: '#666', textAlign: 'center' },
});

export default function ReporteHigienePersonal({ data }: any) {
    if (!data || !data.datos) {
        return (
            <Document>
                <Page size="LETTER" orientation="portrait" style={{ padding: 12 }}>
                    <PdfLayout title="Error" tipo="REGISTRO" version="001" codigo="ERR">
                        <Text>No hay datos para mostrar</Text>
                    </PdfLayout>
                </Page>
            </Document>
        );
    }

    const { datos, dias, turno, semana_inicio, semana_fin, usuarios_involucrados } = data;

    const flexEmployee = 2.8;
    const flexSub = 0.5;
    const flexSummary = 2.0;
    const subLabels = ['U', 'L', 'S', 'LM'];

    const getResumenObs = (empleado: any) => {
        const registros = Object.values(empleado.registros_dia).filter((r) => r);
        const observaciones = [];
        const correcciones = [];

        for (const reg of registros) {
            if (reg.observaciones && reg.observaciones.trim()) {
                observaciones.push(reg.observaciones.trim());
            }
            if (reg.correccion && reg.correccion.trim()) {
                correcciones.push(reg.correccion.trim());
            }
        }

        let texto = '';
        if (observaciones.length) {
            texto += 'O: ' + observaciones.join('; ');
        }
        if (correcciones.length) {
            if (texto) texto += '\n';
            texto += 'C: ' + correcciones.join('; ');
        }
        return texto || '—';
    };

    return (
        <Document>
            <Page size="LETTER" orientation="portrait" style={{ padding: 12 }}>
                <PdfLayout
                    title="VERIFICACIÓN DE HIGIENE PERSONAL"
                    tipo="REGISTRO"
                    version="001"
                    codigo="PLL-REG-007"
                >
                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>PARÁMETROS DEL REPORTE</Text>
                        <View style={styles.infoGrid}>
                            <View style={styles.infoItem}>
                                <Text style={styles.infoLabel}>Semana:</Text>
                                <Text style={styles.infoValue}>{semana_inicio} al {semana_fin}</Text>
                            </View>
                            <View style={styles.infoItem}>
                                <Text style={styles.infoLabel}>Turno:</Text>
                                <Text style={styles.infoValue}>{turno}</Text>
                            </View>
                        </View>
                        <View style={styles.infoGrid}>
                            <View style={styles.infoItem}>
                                <Text style={styles.infoLabel}>Supervisor de Producción:</Text>
                                {/* si el turno de Camacho entonce dira Ramiro Camacho, si el Wilfredo, dira Wilfredo, si es Vila, dira Vila */}
                                <Text style={styles.infoValue}>{turno === 'Ramiro' ? 'Ramiro Camacho' : turno === 'Wilfredo' ? 'Wilfredo Condori' : turno === 'Juan' ? 'Juan Vila' : turno}</Text>
                            </View>
                            <View style={styles.infoItem}>
                                <Text style={styles.infoLabel}>Supervisor de Control de Calidad:</Text>
                                <Text style={styles.infoValue}>
                                    {usuarios_involucrados.length > 0 ? usuarios_involucrados.map((u: any) => u.codigo).join(', ') : '—'}

                                </Text>
                            </View>
                        </View>
                    </View>

                    <View style={styles.tableWrapper}>
                        {/* PRIMERA FILA: empleado, días y columna resumen */}
                        <View style={styles.headerRow}>
                            <View style={{ flex: flexEmployee }}><Text style={styles.cell}>Nombre</Text></View>
                            {dias.map((dia: string, idx: number) => {
                                const isFirstDay = idx === 0;
                                const dayStyle = isFirstDay ? styles.cell : { ...styles.cell, borderLeftWidth: 0.8, borderLeftColor: '#888' };
                                return (
                                    <View key={idx} style={{ flex: flexSub * 4 }}>
                                        <Text style={dayStyle}>{dia}</Text>
                                    </View>
                                );
                            })}
                            <View style={{ flex: flexSummary }}><Text style={styles.cellLast}>Obs.</Text></View>
                        </View>

                        {/* SEGUNDA FILA: subencabezados U,L,S,LM */}
                        <View style={styles.headerSubRow}>
                            <View style={{ flex: flexEmployee }}><View style={styles.cell} /></View>
                            {dias.map((_, dayIdx: number) => {
                                const isFirstDay = dayIdx === 0;
                                const containerStyle = isFirstDay ? styles.dayContainer : styles.dayContainerWithSeparator;
                                return (
                                    <View key={dayIdx} style={{ ...containerStyle, flex: flexSub * 4 }}>
                                        {subLabels.map((label, subIdx) => {
                                            const isLastSub = subIdx === 3;
                                            const cellStyle = isLastSub ? styles.cellLast : styles.cell;
                                            return (
                                                <View key={subIdx} style={{ flex: flexSub }}>
                                                    <Text style={cellStyle}>{label}</Text>
                                                </View>
                                            );
                                        })}
                                    </View>
                                );
                            })}
                            <View style={{ flex: flexSummary }}><View style={styles.cellLast} /></View>
                        </View>

                        {/* FILAS DE DATOS */}
                        {datos.map((empleado: any, rowIdx: number) => {
                            return (
                                <View key={rowIdx} style={styles.dataRow}>
                                    <View style={{ flex: flexEmployee }}>
                                        <Text style={styles.employeeCell}>{empleado.empleado_nombre}</Text>
                                    </View>
                                    {dias.map((dia: string, dayIdx: number) => {
                                        const registro = empleado.registros_dia[dia];
                                        const getEstado = (val: boolean | null | undefined) => {
                                            if (val === true) return 'C.';
                                            if (val === false) return 'N.C.';
                                            return '-';
                                        };
                                        const valores = [
                                            registro ? getEstado(registro.uniforme) : '-',
                                            registro ? getEstado(registro.limpieza) : '-',
                                            registro ? getEstado(registro.salud) : '-',
                                            registro ? getEstado(registro.lavado_manos) : '-',
                                        ];
                                        const isFirstDay = dayIdx === 0;
                                        const containerStyle = isFirstDay ? styles.dayContainer : styles.dayContainerWithSeparator;
                                        return (
                                            <View key={dayIdx} style={{ ...containerStyle, flex: flexSub * 4 }}>
                                                {valores.map((v, subIdx) => {
                                                    const isLastSub = subIdx === 3;
                                                    const cellStyle = isLastSub ? styles.cellLast : styles.cell;
                                                    return (
                                                        <View key={subIdx} style={{ flex: flexSub }}>
                                                            <Text style={cellStyle}>{v}</Text>
                                                        </View>
                                                    );
                                                })}
                                            </View>
                                        );
                                    })}
                                    <View style={{ flex: flexSummary }}>
                                        <Text style={styles.summaryCell}>{getResumenObs(empleado)}</Text>
                                    </View>
                                </View>
                            );
                        })}
                    </View>

                    <View style={styles.legend}>
                        <Text>Glosa: U=Uniforme, L=Limpieza, S=Salud, LM=Lavado manos. C.=Cumple, N.C.=No cumple, -=Sin reg.</Text>
                    </View>

                    {usuarios_involucrados.length > 0 && (
                        <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 6, gap: 5, pageBreakInside: 'avoid' }}>
                            <View style={styles.usersTable}>
                                <View style={styles.usersHeader}>
                                    <Text style={styles.usersCell}>CÓDIGO</Text>
                                    <Text style={styles.usersCell}>NOMBRE </Text>
                                </View>
                                {usuarios_involucrados.map((u: any, i: number) => (
                                    <View key={i} style={{ flexDirection: 'row', borderBottomWidth: 0.3, borderColor: '#ddd', backgroundColor: i % 2 === 0 ? '#fafafa' : '#fff', paddingVertical: 1 }}>
                                        <Text style={{ ...styles.usersCell, color: '#000', fontWeight: 'normal' }}>{u.codigo}</Text>
                                        <Text style={{ ...styles.usersCell, color: '#000', fontWeight: 'normal' }}>{`${u.nombre}`}</Text>
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
