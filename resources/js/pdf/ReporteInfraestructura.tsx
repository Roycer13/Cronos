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
    sectionTitle: {
        fontSize: 9,
        fontWeight: 'bold',
        color: '#2c3e50',
        marginTop: 8,
        marginBottom: 4,
        textAlign: 'left',
    },
    card: {
        borderWidth: 0.5,
        borderColor: '#bbb',
        marginBottom: 8,
        padding: 6,
        backgroundColor: '#fafafa',
    },
    cardHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        borderBottomWidth: 0.5,
        borderColor: '#ddd',
        paddingBottom: 4,
        marginBottom: 4,
    },
    cardTitle: {
        fontSize: 8,
        fontWeight: 'bold',
        color: '#2c3e50',
    },
    cardSubtitle: {
        fontSize: 6,
        color: '#666',
    },
    criterioItem: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        width: '50%',
        marginBottom: 2,
        padding: 2,
        borderRadius: 3,
    },
    criterioItemNoOk: {
        backgroundColor: '#fee',
    },
    criterioItemConAccion: {
        borderLeftWidth: 2,
        borderLeftColor: '#e67e22',
    },
    actionItem: {
        fontSize: 6,
        color: '#333',
        marginBottom: 2,
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

export default function ReporteInfraestructura({ datos, usuariosInvolucrados, filtros }: any) {
    const inspecciones = Array.isArray(datos) ? datos : [];
    const usuarios = Array.isArray(usuariosInvolucrados) ? usuariosInvolucrados : [];

    const agrupados = inspecciones.reduce((acc: any, inspeccion: any) => {
        const nivel = inspeccion.nivel || 'Sin Nivel';
        if (!acc[nivel]) {
            acc[nivel] = [];
        }
        acc[nivel].push(inspeccion);
        return acc;
    }, {});

    const nivelesOrdenados = Object.keys(agrupados).sort((a, b) => a.localeCompare(b));

    return (
        <Document>
            <Page size="LETTER" orientation="portrait" style={{ padding: 30 }}>
                <PdfLayout
                    title="REPORTE DE INSPECCIONES DE INFRAESTRUCTURA"
                    tipo="Reporte"
                    version="001"
                    codigo="PLL-REG-138"
                >
                    {filtros && (filtros.fecha_desde || filtros.fecha_hasta) && (
                        <View style={{ marginBottom: 4, fontSize: 7, color: '#666' }}>
                            <Text>
                                Período: {filtros.fecha_desde ? formatFecha(filtros.fecha_desde) : 'Inicio'} 
                                {' - '} 
                                {filtros.fecha_hasta ? formatFecha(filtros.fecha_hasta) : 'Actual'}
                            </Text>
                        </View>
                    )}

                    {nivelesOrdenados.length === 0 ? (
                        <Text style={{ fontSize: 8, textAlign: 'center', marginTop: 20 }}>
                            No hay inspecciones para el período seleccionado.
                        </Text>
                    ) : (
                        nivelesOrdenados.map((nivel, idxNivel) => (
                            <View key={idxNivel}>
                                <Text style={styles.sectionTitle}>
                                    Nivel: {nivel} ({agrupados[nivel].length} inspecciones)
                                </Text>

                                {agrupados[nivel].map((inspeccion: any, idxInspeccion: number) => (
                                    <View key={idxInspeccion} style={styles.card}>
                                        <View style={styles.cardHeader}>
                                            <View>
                                                <Text style={styles.cardTitle}>
                                                    {inspeccion.infraestructura || 'Infraestructura sin nombre'}
                                                </Text>
                                                <Text style={styles.cardSubtitle}>
                                                    Fecha: {formatFecha(inspeccion.fecha)}
                                                </Text>
                                            </View>
                                            <Text style={styles.cardSubtitle}>
                                                Responsable: {inspeccion.usuario || '-'}
                                            </Text>
                                        </View>

                                        <Text style={{ fontSize: 6, fontWeight: 'bold', marginBottom: 2 }}>
                                            Criterios Evaluados:
                                        </Text>
                                        {inspeccion.criterios && inspeccion.criterios.length > 0 ? (
                                            <View style={{ flexDirection: 'row', flexWrap: 'wrap' }}>
                                                {inspeccion.criterios.map((criterio: any, idxCrit: number) => (
                                                    <View 
                                                        key={idxCrit} 
                                                        style={[
                                                            styles.criterioItem,
                                                            !criterio.ok && styles.criterioItemNoOk,
                                                            criterio.tiene_accion && styles.criterioItemConAccion,
                                                        ]}
                                                    >
                                                        <Text style={{ 
                                                            fontSize: 6, 
                                                            color: criterio.ok ? '#27ae60' : '#e74c3c',
                                                            fontWeight: 'bold',
                                                            marginRight: 2,
                                                        }}>
                                                            {criterio.ok ? '✓' : '✗'}
                                                        </Text>
                                                        <View style={{ flex: 1 }}>
                                                            <Text style={{ fontSize: 6 }}>
                                                                {criterio.nombre}
                                                            </Text>
                                                            {criterio.observacion && (
                                                                <Text style={{ fontSize: 5, color: '#555' }}>
                                                                    {criterio.observacion}
                                                                </Text>
                                                            )}
                                                        </View>
                                                        {criterio.tiene_accion && (
                                                            <Text style={{ fontSize: 5, color: '#e67e22', fontWeight: 'bold', marginLeft: 3 }}>
                                                                ⚡ Acción
                                                            </Text>
                                                        )}
                                                    </View>
                                                ))}
                                            </View>
                                        ) : (
                                            <Text style={{ fontSize: 6, color: '#999' }}>Sin criterios registrados</Text>
                                        )}

                                        {inspeccion.acciones && inspeccion.acciones.length > 0 && (
                                            <>
                                                <Text style={{ fontSize: 6, fontWeight: 'bold', marginTop: 4, marginBottom: 2 }}>
                                                    Acciones Correctivas:
                                                </Text>
                                                {inspeccion.acciones.map((accion: any, idxAcc: number) => (
                                                    <View key={idxAcc} style={{ marginLeft: 8, marginBottom: 2 }}>
                                                        <Text style={styles.actionItem}>
                                                            • {accion.descripcion || 'Sin descripción'}
                                                        </Text>
                                                        {accion.responsable && (
                                                            <Text style={{ fontSize: 5.5, color: '#555', marginLeft: 10 }}>
                                                                Responsable: {accion.responsable}
                                                                {accion.fecha_ejecucion ? ` - Fecha: ${formatFecha(accion.fecha_ejecucion)}` : ''}
                                                                {accion.estado ? ` - Estado: ${accion.estado}` : ''}
                                                            </Text>
                                                        )}
                                                    </View>
                                                ))}
                                            </>
                                        )}

                                        {inspeccion.observacion_general && inspeccion.observacion_general !== '-' && (
                                            <View style={{ marginTop: 4 }}>
                                                <Text style={{ fontSize: 6, fontWeight: 'bold' }}>
                                                    Observación General:
                                                </Text>
                                                <Text style={{ fontSize: 6, color: '#333' }}>
                                                    {inspeccion.observacion_general}
                                                </Text>
                                            </View>
                                        )}
                                    </View>
                                ))}
                            </View>
                        ))
                    )}

                    {(() => {
                        const todasAcciones = inspecciones.flatMap((inspeccion: any) => 
                            (inspeccion.acciones || []).map((accion: any) => ({
                                ...accion,
                                fecha_inspeccion: inspeccion.fecha,
                                infraestructura: inspeccion.infraestructura,
                                nivel: inspeccion.nivel,
                            }))
                        );
                        
                        if (todasAcciones.length === 0) return null;
                        
                        return (
                            <View style={{ marginTop: 15, pageBreak: 'always' }}>
                                <Text style={{ fontSize: 10, fontWeight: 'bold', color: '#2c3e50', marginBottom: 6 }}>
                                    RESUMEN DE ACCIONES CORRECTIVAS
                                </Text>
                                <View style={{ borderWidth: 0.5, borderColor: '#bbb' }}>
                                    <View style={{ flexDirection: 'row', borderBottomWidth: 1, borderColor: '#333', backgroundColor: '#E8F0FA' }}>
                                        <Text style={{ flex: 1, padding: 3, fontSize: 7, fontWeight: 'bold', textAlign: 'center', borderRightWidth: 0.5, borderColor: '#333' }}>Fecha Inspección</Text>
                                        <Text style={{ flex: 1.5, padding: 3, fontSize: 7, fontWeight: 'bold', textAlign: 'center', borderRightWidth: 0.5, borderColor: '#333' }}>Infraestructura</Text>
                                        <Text style={{ flex: 1.5, padding: 3, fontSize: 7, fontWeight: 'bold', textAlign: 'center', borderRightWidth: 0.5, borderColor: '#333' }}>Descripción</Text>
                                        <Text style={{ flex: 1, padding: 3, fontSize: 7, fontWeight: 'bold', textAlign: 'center', borderRightWidth: 0.5, borderColor: '#333' }}>Responsable</Text>
                                        <Text style={{ flex: 1, padding: 3, fontSize: 7, fontWeight: 'bold', textAlign: 'center', borderRightWidth: 0.5, borderColor: '#333' }}>Fecha Ejecución</Text>
                                        <Text style={{ flex: 1, padding: 3, fontSize: 7, fontWeight: 'bold', textAlign: 'center' }}>Estado</Text>
                                    </View>
                                    {todasAcciones.map((accion: any, idx: number) => (
                                        <View key={idx} style={{ flexDirection: 'row', borderBottomWidth: 0.5, borderColor: '#ddd', backgroundColor: idx % 2 === 0 ? '#fafafa' : '#fff' }}>
                                            <Text style={{ flex: 1, padding: 3, fontSize: 6, textAlign: 'center', borderRightWidth: 0.5, borderColor: '#ddd' }}>{formatFecha(accion.fecha_inspeccion)}</Text>
                                            <Text style={{ flex: 1.5, padding: 3, fontSize: 6, textAlign: 'center', borderRightWidth: 0.5, borderColor: '#ddd' }}>{accion.infraestructura || '-'}</Text>
                                            <Text style={{ flex: 1.5, padding: 3, fontSize: 6, textAlign: 'center', borderRightWidth: 0.5, borderColor: '#ddd' }}>{accion.descripcion || '-'}</Text>
                                            <Text style={{ flex: 1, padding: 3, fontSize: 6, textAlign: 'center', borderRightWidth: 0.5, borderColor: '#ddd' }}>{accion.responsable || '-'}</Text>
                                            <Text style={{ flex: 1, padding: 3, fontSize: 6, textAlign: 'center', borderRightWidth: 0.5, borderColor: '#ddd' }}>{formatFecha(accion.fecha_ejecucion)}</Text>
                                            <Text style={{ flex: 1, padding: 3, fontSize: 6, textAlign: 'center' }}>{accion.estado || '-'}</Text>
                                        </View>
                                    ))}
                                </View>
                            </View>
                        );
                    })()}

                    <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 15, gap: 8, pageBreakInside: 'avoid' as any }}>
                        <View style={styles.usersTable}>
                            <View style={styles.usersHeader}>
                                <Text style={styles.usersCell}>CÓDIGO</Text>
                                <Text style={styles.usersCell}>NOMBRE</Text>
                            </View>
                            {usuarios.map((u, i) => (
                                <View key={i} style={{ flexDirection: 'row', borderBottomWidth: 0.5, borderColor: '#ddd', backgroundColor: i % 2 === 0 ? '#fafafa' : '#fff', paddingVertical: 2 }}>
                                    <Text style={{ ...styles.usersCell, color: '#000', fontWeight: 'normal' }}>{u.codigo}</Text>
                                    <Text style={{ ...styles.usersCell, color: '#000', fontWeight: 'normal' }}>{u.nombre}</Text>
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