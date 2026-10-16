import { Document, Page, StyleSheet, Text, View } from '@react-pdf/renderer';
import PdfLayout from './PdfLayout';

function formatFecha(value?: string | Date | null) {
    if (!value) return '-';
    try {
        const fecha = new Date(value);
        const dia = fecha.getDate().toString().padStart(2, '0');
        const mes = (fecha.getMonth() + 1).toString().padStart(2, '0');
        const año = fecha.getFullYear().toString().slice(-2);
        return `${dia}-${mes}-${año}`;
    } catch {
        return '-';
    }
}

const styles = StyleSheet.create({
    tableWrapper: {
        borderWidth: 0.5,
        borderColor: '#bbb',
        marginTop: 3,
    },
    tableHeader: {
        flexDirection: 'row',
        borderBottomWidth: 1,
        borderColor: '#333',
        backgroundColor: '#E8F0FA',
    },
     legend: {
        marginTop: 3,
        fontSize: 7,
        color: '#555',
        textAlign: 'center',
    },
    headerCell: {
        flex: 1,
        padding: 1.5,
        fontSize: 6.5,
        borderRightWidth: 0.5,
        borderColor: '#333',
        fontWeight: 'bold',
        textAlign: 'center',
        color: '#000',
        justifyContent: 'center',
        alignItems: 'center',
    },
    headerCellLast: {
        flex: 1,
        padding: 1.5,
        fontSize: 6.5,
        fontWeight: 'bold',
        textAlign: 'center',
        color: '#000',
        justifyContent: 'center',
        alignItems: 'center',
    },
    row: {
        flexDirection: 'row',
        borderBottomWidth: 0.5,
        borderColor: '#e0e0e0',
        paddingVertical: 0.5,
        backgroundColor: '#fafafa',
    },
    cell: {
        flex: 1,
        paddingHorizontal: 2,
        paddingVertical: 0.5,
        fontSize: 6,
        textAlign: 'center',
        justifyContent: 'center',
        alignItems: 'center',
    },
    cellLast: {
        flex: 1,
        paddingHorizontal: 2,
        paddingVertical: 0.5,
        fontSize: 6,
        textAlign: 'center',
        justifyContent: 'center',
        alignItems: 'center',
    },
    rotatedCell: {
        flex: 0.35,
        justifyContent: 'center',
        alignItems: 'center',
        height: 70,
        padding: 2.5,
        borderRightWidth: 0.5,
        borderColor: '#333',
    },
    rotatedText: {
        transform: 'rotate(-90deg)',
        fontSize: 6,
        textAlign: 'center',
        width: 70,
    },
    multiLineCell: {
        flex: 0.35,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 1.5,
        borderRightWidth: 0.5,
        borderColor: '#333',
    },
    multiLineText: {
        fontSize: 6,
        textAlign: 'center',
    },
    usersTable: {
        marginTop: 6,
        borderWidth: 0.5,
        borderColor: '#bbb',
        width: '65%',
        flex: 1,
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
});

export default function ReporteRecepcion({ datos }: any) {
    const recepciones = Array.isArray(datos) ? datos : [datos];

    // Recolectar usuarios únicos desde los datos transformados
    const usuariosMap = new Map();
    recepciones.forEach((r: any) => {
        const codigo = r.codigo_usuario;
        if (codigo && codigo !== '-' && !usuariosMap.has(codigo)) {
            const nombreCompleto = r.nombre_usuario || r.usuario || codigo;
            usuariosMap.set(codigo, { codigo, nombre: nombreCompleto });
        }
    });
    const usuariosList = Array.from(usuariosMap.values());

    return (
        <Document>
            <Page size="LETTER" orientation="landscape" style={{ padding: 20 }}>
                <PdfLayout
                    title="INSPECCIÓN FÍSICA DE TRANSPORTE Y REVISIÓN DE MATERIA E INSUMOS"
                    tipo="REGISTRO"
                    version="001"
                    codigo="PLL-REG-060"
                >
                    <View style={styles.tableWrapper}>
                        {/* ENCABEZADO */}
                        <View style={styles.tableHeader}>
                            {[
                                'Fecha',
                                'Responsable',
                                'Materia Prima',
                                'Cantidad',
                                'Proveedor',
                                'Marca',
                                'Almacen',
                                'LIMPIEZA DE TRANSPORTE',
                                'SIN ELEMENTOS EXTRAÑOS Y/O AJENOS',
                                'VEHÍCULO CERRADO (CARPA)',
                                'Estado Materia Prima o Insumo',
                                'Lotes',
                                'F. Elab',
                                'F. Venc',
                                'NIT RS',
                                'CERTIFICADO',
                                'Observación',
                                'Corrección',
                            ].map((h, idx) => {
                                if ([7, 8, 9, 15].includes(idx)) {
                                    return (
                                        <View key={idx} style={styles.rotatedCell}>
                                            <Text style={styles.rotatedText}>{h}</Text>
                                        </View>
                                    );
                                }
                                if (idx === 14) {
                                    return (
                                        <View key={idx} style={styles.multiLineCell}>
                                            <Text style={styles.multiLineText}>
                                                NIT{'\n\n\nRS'}
                                            </Text>
                                        </View>
                                    );
                                }
                                if (idx === 2) {
                                    return (
                                        <View key={idx} style={{ ...styles.headerCell, flex: 3 }}>
                                            <Text>{h}</Text>
                                        </View>
                                    );
                                }
                                const isLast = idx === 17;
                                return (
                                    <View key={idx} style={isLast ? styles.headerCellLast : styles.headerCell}>
                                        <Text>{h}</Text>
                                    </View>
                                );
                            })}
                        </View>

                        {/* FILAS */}
                        {recepciones.map((r: any, idx: number) => (
                            <View style={styles.row} key={idx}>
                                <View style={styles.cell}>
                                    <Text>{formatFecha(r.fecha)}</Text>
                                </View>
                                <View style={styles.cell}>
                                    <Text>{r.codigo_usuario || '-'}</Text>
                                </View>
                                <View style={{ ...styles.cell, flex: 3 }}>
                                    <Text>{r.materiaPrima || '-'}</Text>
                                </View>
                                <View style={styles.cell}>
                                    <Text>{r.cantidad ? `${r.cantidad} ${r.unidad || ''}` : '-'}</Text>
                                </View>
                                <View style={styles.cell}>
                                    <Text>{r.proveedor || '-'}</Text>
                                </View>
                                <View style={styles.cell}>
                                    <Text>{r.marca || '-'}</Text>
                                </View>
                                <View style={styles.cell}>
                                    <Text>{r.codigo_almacenero || '-'}</Text>
                                </View>
                                <View style={{ ...styles.cell, flex: 0.35 }}>
                                    <Text>{r.limpieza_transporte || '-'}</Text>
                                </View>
                                <View style={{ ...styles.cell, flex: 0.35 }}>
                                    <Text>{r.sin_elementos || '-'}</Text>
                                </View>
                                <View style={{ ...styles.cell, flex: 0.35 }}>
                                    <Text>{r.cerrado || '-'}</Text>
                                </View>
                                <View style={styles.cell}>
                                    <Text>{r.estado_revision || '-'}</Text>
                                </View>
                                <View style={styles.cell}>
                                    {Array.isArray(r.lotes) && r.lotes.length
                                        ? r.lotes.map((l: any, i: number) => (
                                              <Text key={i} style={{ fontSize: 6 }}>{l.lote}</Text>
                                          ))
                                        : '-'}
                                </View>
                                <View style={styles.cell}>
                                    {Array.isArray(r.lotes) && r.lotes.length
                                        ? r.lotes.map((l: any, i: number) => (
                                              <Text key={i} style={{ fontSize: 6 }}>{formatFecha(l.fechaElab)}</Text>
                                          ))
                                        : '-'}
                                </View>
                                <View style={styles.cell}>
                                    {Array.isArray(r.lotes) && r.lotes.length
                                        ? r.lotes.map((l: any, i: number) => (
                                              <Text key={i} style={{ fontSize: 6 }}>{formatFecha(l.fechaVen)}</Text>
                                          ))
                                        : '-'}
                                </View>
                                <View style={{ ...styles.cell, flex: 0.35 }}>
                                    <Text>{r.nit || '-'}</Text>
                                    <Text>{r.rs || '-'}</Text>
                                </View>
                                <View style={{ ...styles.cell, flex: 0.35 }}>
                                    <Text>{r.certificado || '-'}</Text>
                                </View>
                                <View style={styles.cell}>
                                    {/* <Text>{r.abservacion || '-'}</Text> */}
                                    <Text>-</Text>
                                </View>
                                <View style={styles.cellLast}>
                                    {/* <Text>{r.correccion || '-'}</Text> */}
                                    <Text>-</Text>
                                </View>
                            </View>
                        ))}
                    </View>
                     <Text style={styles.legend}>Glosa: - = Sin Registro, C.= Cumple, N.C.= No Cumple.</Text>


                    {/* USUARIOS INVOLUCRADOS + FIRMA */}
                    <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 8, gap: 8, pageBreakInside: 'avoid' as any }}>
                        <View style={styles.usersTable}>
                            <View style={styles.usersHeader}>
                                <Text style={styles.usersCell}>CÓDIGO</Text>
                                <Text style={styles.usersCell}>NOMBRE </Text>
                            </View>
                            {usuariosList.map((u: any, i: number) => (
                                <View key={i} style={{ flexDirection: 'row', borderBottomWidth: 0.5, borderColor: '#ddd', backgroundColor: i % 2 === 0 ? '#fafafa' : '#fff', paddingVertical: 2 }}>
                                    <Text style={{ ...styles.usersCell, color: '#000', fontWeight: 'normal' }}>{u.codigo}</Text>
                                    <Text style={{ ...styles.usersCell, color: '#000', fontWeight: 'normal' }}>{`${u.nombre} `}</Text>
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
