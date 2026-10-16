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

function formatDecimal(value: any) {
    if (value === null || value === undefined || value === '') return '-';
    const num = Number(value);
    if (isNaN(num)) return value;
    return num.toFixed(1);
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
        alignItems: 'stretch',
    },
    headerCell: {
        flex: 1,
        padding: 1.5,
        fontSize: 5.5,
        fontWeight: 'bold',
        textAlign: 'center',
        borderRightWidth: 0.5,
        borderColor: '#333',
        justifyContent: 'center',
        alignItems: 'center',
    },
    headerCellLast: {
        flex: 1,
        padding: 1.5,
        fontSize: 5.5,
        fontWeight: 'bold',
        textAlign: 'center',
        justifyContent: 'center',
        alignItems: 'center',
    },
    groupContainer: {
        flex: 3, // ancho total para 3 subcolumnas
        flexDirection: 'column',
        borderRightWidth: 0.5,
        borderColor: '#333',
        minHeight: 22,
    },
    groupLabel: {
        fontSize: 5.5,
        fontWeight: 'bold',
        textAlign: 'center',
        color: '#000',
        paddingVertical: 3,
        borderBottomWidth: 0.5,
        borderColor: '#333',
        backgroundColor: '#D5E3F0',
        minHeight: 10,
    },
    subHeaderRow: {
        flexDirection: 'row',
        minHeight: 12,
        flex: 1,
    },
    subHeaderCell: {
        flex: 1,
        fontSize: 5,
        fontWeight: 'bold',
        textAlign: 'center',
        color: '#000',
        paddingVertical: 2,
        borderRightWidth: 0.5,
        borderColor: '#333',
        justifyContent: 'center',
        alignItems: 'center',
    },
    subHeaderCellLast: {
        flex: 1,
        fontSize: 5,
        fontWeight: 'bold',
        textAlign: 'center',
        color: '#000',
        paddingVertical: 2,
        justifyContent: 'center',
        alignItems: 'center',
    },
    row: {
        flexDirection: 'row',
        borderBottomWidth: 0.5,
        borderColor: '#e0e0e0',
        paddingVertical: 0.5,
        backgroundColor: '#fafafa',
        alignItems: 'stretch',
    },
    cell: {
        flex: 1,
        paddingHorizontal: 2,
        paddingVertical: 0.5,
        fontSize: 5,
        textAlign: 'center',
        justifyContent: 'center',
        alignItems: 'center',
        borderRightWidth: 0.5,
        borderColor: '#e0e0e0',
    },
    cellLast: {
        flex: 1,
        paddingHorizontal: 2,
        paddingVertical: 0.5,
        fontSize: 5,
        textAlign: 'center',
        justifyContent: 'center',
        alignItems: 'center',
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

export default function ReporteTermohigrometros({ datos, usuariosInvolucrados }: any) {
    const registros = Array.isArray(datos) ? datos : [];
    const usuarios = Array.isArray(usuariosInvolucrados) ? usuariosInvolucrados : [];

    const flexFecha = 1.2;
    const flexDispositivo = 1.2;
    const flexSub = 1;          // cada subcolumna dentro de un grupo
    const flexGrupo = flexSub * 3; // grupo de 3 subcolumnas
    const flexRequiere = 1;
    const flexResponsable = 1.2;
    const flexEstado = 1;
    const flexObservaciones = 1.5;

    const getEstadoDisplay = (reg: any) => {
        if (reg.estado?.nombre) {
            return reg.estado.nombre === 'Verificado' ? 'Conforme' : 'No conforme';
        }
        return '-';
    };

    return (
        <Document>
            <Page size="LETTER" orientation="landscape" style={{ padding: 20 }}>
                <PdfLayout
                    title="VERIFICACIÓN DE TERMOHIGRÓMETROS"
                    tipo="REGISTRO"
                    version="001"
                    codigo="PLL-REG-218"
                >
                    <View style={styles.tableWrapper}>
                        {/* Encabezado principal */}
                        <View style={styles.tableHeader}>
                            <View style={{ flex: flexFecha }}>
                                <Text style={styles.headerCell}>Fecha</Text>
                            </View>
                            <View style={{ flex: flexDispositivo }}>
                                <Text style={styles.headerCell}>Dispositivo</Text>
                            </View>

                            {/* Grupo Temperatura */}
                            <View style={[styles.groupContainer, { flex: flexGrupo }]}>
                                <Text style={styles.groupLabel}>Temperatura</Text>
                                <View style={styles.subHeaderRow}>
                                    <Text style={{ ...styles.subHeaderCell, flex: flexSub }}>Patrón (°C)</Text>
                                    <Text style={{ ...styles.subHeaderCell, flex: flexSub }}>Equipo (°C)</Text>
                                    <Text style={{ ...styles.subHeaderCellLast, flex: flexSub }}>Error (°C)</Text>
                                </View>
                            </View>

                            {/* Grupo Humedad */}
                            <View style={[styles.groupContainer, { flex: flexGrupo }]}>
                                <Text style={styles.groupLabel}>Humedad</Text>
                                <View style={styles.subHeaderRow}>
                                    <Text style={{ ...styles.subHeaderCell, flex: flexSub }}>Patrón (%)</Text>
                                    <Text style={{ ...styles.subHeaderCell, flex: flexSub }}>Equipo (%)</Text>
                                    <Text style={{ ...styles.subHeaderCellLast, flex: flexSub }}>Error (%)</Text>
                                </View>
                            </View>

                            <View style={{ flex: flexRequiere }}>
                                <Text style={styles.headerCell}>Requiere Ajuste</Text>
                            </View>
                            <View style={{ flex: flexResponsable }}>
                                <Text style={styles.headerCell}>Responsable</Text>
                            </View>
                            <View style={{ flex: flexEstado }}>
                                <Text style={styles.headerCell}>Estado</Text>
                            </View>
                            <View style={{ flex: flexObservaciones }}>
                                <Text style={styles.headerCellLast}>Observaciones</Text>
                            </View>
                        </View>

                        {/* Filas de datos */}
                        {registros.map((reg, idx) => (
                            <View key={idx} style={styles.row}>
                                <Text style={{ ...styles.cell, flex: flexFecha }}>{formatFecha(reg.fecha_hora)}</Text>
                                <Text style={{ ...styles.cell, flex: flexDispositivo }}>
                                    {reg.dispositivo_medicion?.codigo || reg.dispositivos_medicion_id || '-'}
                                </Text>

                                {/* Datos Temperatura */}
                                <Text style={{ ...styles.cell, flex: flexSub }}>{formatDecimal(reg.patron_temperatura)}</Text>
                                <Text style={{ ...styles.cell, flex: flexSub }}>{formatDecimal(reg.equipo_temperatura)}</Text>
                                <Text style={{ ...styles.cell, flex: flexSub }}>{formatDecimal(reg.error_temperatura)}</Text>

                                {/* Datos Humedad */}
                                <Text style={{ ...styles.cell, flex: flexSub }}>{formatDecimal(reg.patron_humedad)}</Text>
                                <Text style={{ ...styles.cell, flex: flexSub }}>{formatDecimal(reg.equipo_humedad)}</Text>
                                <Text style={{ ...styles.cell, flex: flexSub }}>{formatDecimal(reg.error_humedad)}</Text>

                                <Text style={{ ...styles.cell, flex: flexRequiere }}>{reg.requiere_ajuste ? 'Sí' : 'No'}</Text>
                                <Text style={{ ...styles.cell, flex: flexResponsable }}>
                                    {reg.usuario?.codigo || reg.usuario?.name || reg.user_id || '-'}
                                </Text>
                                <Text style={{ ...styles.cell, flex: flexEstado }}>{getEstadoDisplay(reg)}</Text>
                                <Text style={{ ...styles.cellLast, flex: flexObservaciones }}>{reg.observaciones || '-'}</Text>
                            </View>
                        ))}
                    </View>

                    {/* Usuarios + firma */}
                    <View
                        style={{
                            flexDirection: 'row',
                            justifyContent: 'space-between',
                            marginTop: 8,
                            gap: 8,
                            pageBreakInside: 'avoid' as any,
                        }}
                    >
                        <View style={styles.usersTable}>
                            <View style={styles.usersHeader}>
                                <Text style={styles.usersCell}>CÓDIGO</Text>
                                <Text style={styles.usersCell}>NOMBRE</Text>
                            </View>
                            {usuarios.map((u, i) => (
                                <View
                                    key={i}
                                    style={{
                                        flexDirection: 'row',
                                        borderBottomWidth: 0.5,
                                        borderColor: '#ddd',
                                        backgroundColor: i % 2 === 0 ? '#fafafa' : '#fff',
                                        paddingVertical: 2,
                                    }}
                                >
                                    <Text style={{ ...styles.usersCell, color: '#000', fontWeight: 'normal' }}>
                                        {u.codigo}
                                    </Text>
                                    <Text style={{ ...styles.usersCell, color: '#000', fontWeight: 'normal' }}>
                                        {u.nombre}
                                    </Text>
                                </View>
                            ))}
                        </View>
                        <View
                            style={{
                                width: '33%',
                                borderWidth: 1,
                                borderColor: '#2c3e50',
                                padding: 8,
                                backgroundColor: '#fafafa',
                            }}
                        >
                            <View
                                style={{
                                    borderBottomWidth: 2,
                                    borderColor: '#2c3e50',
                                    height: 40,
                                    marginBottom: 6,
                                }}
                            />
                            <Text
                                style={{
                                    fontSize: 7,
                                    fontWeight: 'bold',
                                    textAlign: 'center',
                                    color: '#2c3e50',
                                    marginBottom: 2,
                                }}
                            >
                                FIRMA REVISOR
                            </Text>
                            <Text style={{ fontSize: 5.5, textAlign: 'center', color: '#666' }}>
                                Fecha: ___/___/_____
                            </Text>
                        </View>
                    </View>
                </PdfLayout>
            </Page>
        </Document>
    );
}
