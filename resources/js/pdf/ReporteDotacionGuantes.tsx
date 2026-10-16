import React from 'react';
import { Document, Page, StyleSheet, Text, View } from '@react-pdf/renderer';
import PdfLayout from './PdfLayout';

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
    tableHeader: { flexDirection: 'row', borderBottomWidth: 1, borderColor: '#333', backgroundColor: '#E8F0FA' },
    headerCell: { padding: 3, fontSize: 6, fontWeight: 'bold', textAlign: 'center', borderRightWidth: 0.5, borderColor: '#333' },
    headerCellLast: { padding: 3, fontSize: 6, fontWeight: 'bold', textAlign: 'center' },
    row: { flexDirection: 'row', borderBottomWidth: 0.5, borderColor: '#e0e0e0', paddingVertical: 4 },
    cell: { paddingHorizontal: 2, paddingVertical: 2, fontSize: 6, textAlign: 'center', borderRightWidth: 0.5, borderColor: '#e0e0e0' },
    cellLast: { paddingHorizontal: 2, paddingVertical: 2, fontSize: 6, textAlign: 'center' },
    usersTable: { marginTop: 12, borderWidth: 0.5, borderColor: '#bbb', width: '65%' },
    usersHeader: { flexDirection: 'row', borderBottomWidth: 1, borderColor: '#333', backgroundColor: '#2c3e50' },
    usersCell: { flex: 1, padding: 2, fontSize: 7, color: '#fff', fontWeight: 'bold' },
    signatureBox: { width: '33%', borderWidth: 1, borderColor: '#2c3e50', padding: 8, backgroundColor: '#fafafa' },
    signatureLine: { borderBottomWidth: 2, borderColor: '#2c3e50', height: 40, marginBottom: 6 },
    signatureText: { fontSize: 7, fontWeight: 'bold', textAlign: 'center', color: '#2c3e50', marginBottom: 2 },
    signatureDate: { fontSize: 5.5, textAlign: 'center', color: '#666' },
    legend: { marginTop: 8, fontSize: 6, color: '#666' },
});

export default function ReporteDotacionGuantes({ data }: any) {
    if (!data || !data.usuarios) {
        return (
            <Document>
                <Page size="LETTER" orientation="landscape" style={{ padding: 20 }}>
                        <PdfLayout title="Error" tipo="REGISTRO" version="001" codigo="ERR">
                        <Text>No hay datos para mostrar</Text>
                    </PdfLayout>
                </Page>
            </Document>
        );
    }

    const { usuarios, usuarios_involucrados, filtros } = data;

    // Transformar cada usuario: obtener lista ordenada de sus dotaciones
    const usuariosConRegistros = usuarios.map((user: any) => {
        const dotacionesObj = user.dotaciones || {};
        const registros = Object.values(dotacionesObj)
            .map((reg: any) => ({
                ...reg,
                sortDate: reg.fecha ? reg.fecha.split('/').reverse().join('-') : ''
            }))
            .sort((a: any, b: any) => (a.sortDate > b.sortDate ? 1 : -1));
        return {
            ...user,
            registros
        };
    });

    // Calcular el máximo número de registros entre todos los usuarios
    const maxRegistros = Math.max(...usuariosConRegistros.map((u: any) => u.registros.length), 0);

    // Construir encabezados
    const headers: { label: string; registroIndex: number; subCol: string }[] = [];
    for (let i = 0; i < maxRegistros; i++) {
        headers.push({ label: ` Fecha`, registroIndex: i, subCol: 'fecha' });
        headers.push({ label: ` Tipo`, registroIndex: i, subCol: 'tipo' });
        headers.push({ label: ` Dotación`, registroIndex: i, subCol: 'colores' });
    }

    const usuarioFlex = 1.5;
    const subColFlex = 1;

    return (
        <Document>
            <Page size="LETTER" orientation="landscape" style={{ padding: 20 }}>
                <PdfLayout
                    title=" DOTACIÓN - CAMBIO DE GUANTES"
                    tipo="REGISTRO"
                    version="001"
                    codigo="PLL-REG-023"
                >
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
                            <View style={styles.infoItem}>
                                <Text style={styles.infoLabel}>Empleado:</Text>
                                <Text style={styles.infoValue}>
                                    {filtros.empleado_id ? 'Seleccionado' : 'Todos'}
                                </Text>
                            </View>
                        </View>
                    </View>

                    <View style={styles.tableWrapper}>
                        {/* Encabezado */}
                        <View style={styles.tableHeader}>
                            <Text style={{ ...styles.headerCell, flex: usuarioFlex }}>Usuario / Código</Text>
                            {headers.map((header, idx) => {
                                const isLast = idx === headers.length - 1;
                                // Agregar un borde izquierdo más grueso al inicio de cada grupo de 3 columnas (a partir del segundo grupo)
                                const isFirstOfGroup = (idx % 3 === 0);
                                const groupIndex = Math.floor(idx / 3);
                                const borderLeft = (isFirstOfGroup && groupIndex > 0) ? { borderLeftWidth: 1.5, borderLeftColor: '#999' } : {};
                                return (
                                    <Text
                                        key={idx}
                                        style={[
                                            isLast ? styles.headerCellLast : styles.headerCell,
                                            { flex: subColFlex },
                                            borderLeft
                                        ]}
                                    >
                                        {header.label}
                                    </Text>
                                );
                            })}
                        </View>

                        {/* Filas de datos */}
                        {usuariosConRegistros.map((user: any, idx: number) => {
                            const registros = user.registros;
                            // Alternar fondo por fila para mejor lectura
                            const rowBg = idx % 2 === 0 ? '#fafafa' : '#ffffff';
                            return (
                                <View key={idx} style={[styles.row, { backgroundColor: rowBg }]}>
                                    {/* Usuario */}
                                    <Text style={{ ...styles.cell, flex: usuarioFlex, backgroundColor: rowBg }}>
                                        {/* {user.codigo} - */}
                                         {user.nombre}
                                    </Text>

                                    {/* Para cada registro, mostrar 3 celdas (fecha, tipo, dotación) */}
                                    {Array.from({ length: maxRegistros }).map((_, regIdx) => {
                                        const registro = registros[regIdx];
                                        const fecha = registro ? registro.fecha || '-' : '-';
                                        const tipo = registro ? registro.tipo || '-' : '-';
                                        const colores = registro ? registro.colores || '-' : '-';

                                        // Determinar bordes:
                                        // - La primera columna de cada grupo (fecha) tendrá borde izquierdo si no es el primer grupo
                                        const isFirstOfGroup = true; // siempre la primera del grupo
                                        const showLeftBorder = (regIdx > 0);
                                        const leftBorderStyle = showLeftBorder ? { borderLeftWidth: 1.5, borderLeftColor: '#999' } : {};

                                        // La última columna de toda la tabla no lleva borde derecho
                                        const isLastDotacion = (regIdx === maxRegistros - 1);

                                        return (
                                            <React.Fragment key={regIdx}>
                                                {/* Fecha - con borde izquierdo si aplica */}
                                                <Text style={[styles.cell, { flex: subColFlex, backgroundColor: rowBg }, leftBorderStyle]}>
                                                    {fecha}
                                                </Text>
                                                {/* Tipo */}
                                                <Text style={[styles.cell, { flex: subColFlex, backgroundColor: rowBg }]}>
                                                    {tipo}
                                                </Text>
                                                {/* Dotación - sin borde derecho si es la última columna global */}
                                                <Text style={[isLastDotacion ? styles.cellLast : styles.cell, { flex: subColFlex, backgroundColor: rowBg }]}>
                                                    {colores}
                                                </Text>
                                            </React.Fragment>
                                        );
                                    })}
                                </View>
                            );
                        })}
                    </View>

                    <View style={styles.legend}>
                        <Text>Glosa: A/R = Amarillo/Rosado, A.T. = Alta Temperatura, - = Sin registro .</Text>
                    </View>

                    {usuarios_involucrados.length > 0 && (
                        <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 12, gap: 8, pageBreakInside: 'avoid' }}>
                            <View style={styles.usersTable}>
                                <View style={styles.usersHeader}>
                                    <Text style={styles.usersCell}>CÓDIGO</Text>
                                    <Text style={styles.usersCell}>NOMBRE (CÓDIGO)</Text>
                                </View>
                                {usuarios_involucrados.map((u: any, i: number) => (
                                    <View key={i} style={{ flexDirection: 'row', borderBottomWidth: 0.5, borderColor: '#ddd', backgroundColor: i % 2 === 0 ? '#fafafa' : '#fff', paddingVertical: 2 }}>
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
