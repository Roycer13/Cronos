import { Document, Page, StyleSheet, Text, View } from '@react-pdf/renderer';
import PdfLayout from './PdfLayout';

const styles = StyleSheet.create({
    section: {
        marginBottom: 10,
    },
    areaTitle: {
        fontSize: 10,
        fontWeight: 'bold',
        marginTop: 8,
        marginBottom: 4,
        textTransform: 'uppercase',
        backgroundColor: '#E8F0FA',
        padding: 4,
    },
    subareaTitle: {
        fontSize: 9,
        fontWeight: 'bold',
        marginLeft: 8,
        marginBottom: 2,
        color: '#555',
    },
    table: {
        borderWidth: 0.5,
        borderColor: '#999',
        marginLeft: 16,
        marginBottom: 6,
    },
    tableRow: {
        flexDirection: 'row',
        borderBottomWidth: 0.5,
        borderColor: '#ccc',
        minHeight: 18,
        alignItems: 'center',
    },
    headerRow: {
        flexDirection: 'row',
        borderBottomWidth: 1,
        borderColor: '#333',
        backgroundColor: '#f0f0f0',
        minHeight: 20,
        alignItems: 'center',
    },
    cellItem: {
        flex: 3,
        padding: 3,
        fontSize: 7,
        fontWeight: 'bold',
    },
    cellTurno: {
        flex: 2,
        padding: 2,
        fontSize: 7,
        textAlign: 'center',
        borderLeftWidth: 0.5,
        borderColor: '#ccc',
    },
    cellEstado: {
        flex: 1.5,
        padding: 2,
        fontSize: 7,
        textAlign: 'center',
        borderLeftWidth: 0.5,
        borderColor: '#ccc',
    },
    headerCellItem: {
        flex: 3,
        padding: 3,
        fontSize: 7,
        fontWeight: 'bold',
    },
    headerCell: {
        flex: 2,
        padding: 2,
        fontSize: 7,
        fontWeight: 'bold',
        textAlign: 'center',
        borderLeftWidth: 0.5,
        borderColor: '#999',
    },
    headerCellEstado: {
        flex: 1.5,
        padding: 2,
        fontSize: 7,
        fontWeight: 'bold',
        textAlign: 'center',
        borderLeftWidth: 0.5,
        borderColor: '#999',
    },
    indicadorCumplido: {
        color: '#16a34a',
        fontSize: 8,
        fontWeight: 'bold',
    },
    indicadorIncumplido: {
        color: '#dc2626',
        fontSize: 8,
        fontWeight: 'bold',
    },
    indicadorNoProgramado: {
        color: '#9ca3af',
        fontSize: 8,
    },
    badgeCumplido: {
        fontSize: 7,
        color: '#16a34a',
        fontWeight: 'bold',
    },
    badgeIncumplido: {
        fontSize: 7,
        color: '#dc2626',
        fontWeight: 'bold',
    },
    resumenBox: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 10,
        padding: 8,
        backgroundColor: '#f8f8f8',
        borderWidth: 0.5,
        borderColor: '#ddd',
    },
    resumenItem: {
        fontSize: 8,
        fontWeight: 'bold',
    },
    filtrosTexto: {
        fontSize: 7,
        marginBottom: 8,
        color: '#666',
    },
    itemsCount: {
        fontSize: 7,
        color: '#666',
        marginLeft: 8,
    },
    usuariosTitle: {
        fontSize: 8,
        fontWeight: 'bold',
        marginTop: 8,
        marginBottom: 4,
    },
    usuariosTable: {
        borderWidth: 0.5,
        borderColor: '#bbb',
        width: '65%',
        marginBottom: 4,
    },
    usuariosHeader: {
        flexDirection: 'row',
        borderBottomWidth: 1,
        borderColor: '#333',
        backgroundColor: '#2c3e50',
    },
    usuariosCell: {
        flex: 1,
        padding: 3,
        fontSize: 7,
        color: '#fff',
        fontWeight: 'bold',
    },
});

const TareaIndicador = ({
    esperado,
    realizado,
}: {
    esperado: boolean;
    realizado: boolean;
}) => {
    if (!esperado) {
        return <Text style={styles.indicadorNoProgramado}>-</Text>;
    }
    return realizado ? (
        <Text style={styles.indicadorCumplido}>C</Text>
    ) : (
        <Text style={styles.indicadorIncumplido}>I</Text>
    );
};

export default function ReporteResumidoPDF({
    areas,
    totales,
    porcentaje,
    fecha,
    fecha_desde,
    fecha_hasta,
    filtros,
    areaSeleccionada,
}: any) {
    const turnosMostrar = filtros?.turno
        ? [parseInt(filtros.turno)]
        : [1, 2, 3];
    const usuarios = Array.from(
        new Map(
            areas
                .flatMap((area: any) =>
                    area.subareas.flatMap((sub: any) =>
                        sub.items.flatMap((item: any) =>
                            (item.dias || []).flatMap((dia: any) => [
                                ...(dia.responsables_limpieza || []),
                                ...(dia.supervisores || []),
                            ]),
                        ),
                    ),
                )
                .map((usuario: any) => [usuario.codigo, usuario]),
        ).values(),
    );
    const areaLabel = (areaSeleccionada || '').toString().trim().toUpperCase();
    const codigoDocumento =
        areaLabel === 'NIVEL 0'
            ? 'PLL-REG-176'
            : areaLabel === 'NIVEL 1'
              ? 'PLL-REG-177'
              : areaLabel === 'NIVEL 2'
                ? 'PLL-REG-178'
                : 'PLL-REG-030';

    return (
        <Document>
            <Page size="A4" style={{ padding: 20 }}>
                <PdfLayout
                    title="ORDEN Y LIMPIEZA DE AMBIENTES DE PLANTA LACTEOS"
                    tipo="REGISTRO"
                    version="001"
                    codigo={codigoDocumento}
                >
                    <View style={styles.filtrosTexto}>
                        <Text>
                            Fecha inicio: {fecha_desde || fecha || 'Hoy'} | Área
                            seleccionada: {areaSeleccionada || 'Todas'}
                        </Text>
                        <Text>Fecha fin: {fecha_hasta || fecha || 'Hoy'}</Text>
                        {filtros?.area_id && <Text> | Área: filtrada</Text>}
                        {filtros?.subarea_id && (
                            <Text> | Subárea: filtrada</Text>
                        )}
                        {filtros?.turno && (
                            <Text> | Turno: {filtros.turno}</Text>
                        )}
                        {areaLabel && <Text> | Nivel: {areaLabel}</Text>}
                    </View>

                    <View style={styles.resumenBox}>
                        <Text style={styles.resumenItem}>
                            Cumplimiento: {porcentaje}%
                        </Text>
                        <Text
                            style={{ ...styles.resumenItem, color: '#16a34a' }}
                        >
                            Realizadas: {totales?.realizadas || 0}
                        </Text>
                        <Text
                            style={{ ...styles.resumenItem, color: '#dc2626' }}
                        >
                            Incumplidas: {totales?.incumplidas || 0}
                        </Text>
                        <Text
                            style={{ ...styles.resumenItem, color: '#16a34a' }}
                        >
                            No incumplimientos:{' '}
                            {totales?.no_incumplimientos || 0}
                        </Text>
                        <Text style={styles.resumenItem}>
                            Esperadas: {totales?.esperadas || 0}
                        </Text>
                    </View>

                    <View
                        style={{
                            flexDirection: 'row',
                            gap: 16,
                            marginBottom: 8,
                            fontSize: 7,
                        }}
                    >
                        <Text>
                            <Text style={styles.indicadorCumplido}>C</Text> =
                            Cumplido |{' '}
                            <Text style={styles.indicadorIncumplido}>I</Text> =
                            Incumplido |{' '}
                            <Text style={styles.indicadorNoProgramado}>-</Text>{' '}
                            = No programado
                        </Text>
                    </View>

                    {areas.map((area: any) => (
                        <View key={area.nombre} style={styles.section}>
                            <View style={styles.areaTitle}>
                                <Text>AREA: {area.nombre}</Text>
                                <Text style={styles.itemsCount}>
                                    (
                                    {area.subareas.reduce(
                                        (acc: number, sub: any) =>
                                            acc + (sub.items?.length || 0),
                                        0,
                                    )}{' '}
                                    items)
                                </Text>
                            </View>

                            {area.subareas.map((sub: any) => (
                                <View key={sub.nombre}>
                                    {area.subareas.length > 1 && (
                                        <Text style={styles.subareaTitle}>
                                            Subárea: {sub.nombre}
                                        </Text>
                                    )}
                                    <View style={styles.table}>
                                        {/* Cabecera */}
                                        <View style={styles.headerRow}>
                                            <View style={styles.headerCellItem}>
                                                <Text>Item / Fecha</Text>
                                            </View>
                                            {turnosMostrar.map((t: number) => (
                                                <View
                                                    key={t}
                                                    style={styles.headerCell}
                                                >
                                                    <Text>
                                                        Turno {t} (O|L|D)
                                                    </Text>
                                                </View>
                                            ))}
                                            <View
                                                style={styles.headerCellEstado}
                                            >
                                                <Text>Estado</Text>
                                            </View>
                                        </View>

                                        {/* Filas: cada día */}
                                        {sub.items.flatMap((item: any) =>
                                            (item.dias || []).map(
                                                (dia: any, idx: number) => (
                                                    <View
                                                        style={styles.tableRow}
                                                        key={`${item.id}-${idx}`}
                                                    >
                                                        <View
                                                            style={
                                                                styles.cellItem
                                                            }
                                                        >
                                                            <Text>
                                                                {idx === 0
                                                                    ? item.nombre
                                                                    : ''}
                                                            </Text>
                                                            <Text
                                                                style={{
                                                                    fontSize: 6,
                                                                    color: '#666',
                                                                }}
                                                            >
                                                                {dia.fecha}
                                                            </Text>
                                                            {dia
                                                                .responsables_limpieza
                                                                ?.length >
                                                                0 && (
                                                                <Text
                                                                    style={{
                                                                        fontSize: 5,
                                                                        color: '#666',
                                                                    }}
                                                                >
                                                                    Limpieza:{' '}
                                                                    {dia.responsables_limpieza
                                                                        .map(
                                                                            (
                                                                                usuario: any,
                                                                            ) =>
                                                                                usuario.codigo,
                                                                        )
                                                                        .join(
                                                                            ', ',
                                                                        )}
                                                                </Text>
                                                            )}
                                                            {dia.supervisores
                                                                ?.length >
                                                                0 && (
                                                                <Text
                                                                    style={{
                                                                        fontSize: 5,
                                                                        color: '#666',
                                                                    }}
                                                                >
                                                                    Supervisor:{' '}
                                                                    {dia.supervisores
                                                                        .map(
                                                                            (
                                                                                usuario: any,
                                                                            ) =>
                                                                                usuario.codigo,
                                                                        )
                                                                        .join(
                                                                            ', ',
                                                                        )}
                                                                </Text>
                                                            )}
                                                        </View>
                                                        {turnosMostrar.map(
                                                            (t: number) => {
                                                                const data =
                                                                    dia
                                                                        .turnos?.[
                                                                        t
                                                                    ];
                                                                if (!data) {
                                                                    return (
                                                                        <View
                                                                            key={
                                                                                t
                                                                            }
                                                                            style={
                                                                                styles.cellTurno
                                                                            }
                                                                        >
                                                                            <Text>
                                                                                -
                                                                                -
                                                                                -
                                                                            </Text>
                                                                        </View>
                                                                    );
                                                                }
                                                                const {
                                                                    esperado,
                                                                    realizado,
                                                                } = data;
                                                                return (
                                                                    <View
                                                                        key={t}
                                                                        style={
                                                                            styles.cellTurno
                                                                        }
                                                                    >
                                                                        <Text>
                                                                            <TareaIndicador
                                                                                esperado={
                                                                                    esperado.orden
                                                                                }
                                                                                realizado={
                                                                                    realizado.orden
                                                                                }
                                                                            />
                                                                            {
                                                                                '  '
                                                                            }
                                                                            <TareaIndicador
                                                                                esperado={
                                                                                    esperado.limpieza
                                                                                }
                                                                                realizado={
                                                                                    realizado.limpieza
                                                                                }
                                                                            />
                                                                            {
                                                                                '  '
                                                                            }
                                                                            <TareaIndicador
                                                                                esperado={
                                                                                    esperado.desinfeccion
                                                                                }
                                                                                realizado={
                                                                                    realizado.desinfeccion
                                                                                }
                                                                            />
                                                                        </Text>
                                                                    </View>
                                                                );
                                                            },
                                                        )}
                                                        <View
                                                            style={
                                                                styles.cellEstado
                                                            }
                                                        >
                                                            {dia.cumplio ? (
                                                                <Text
                                                                    style={
                                                                        styles.badgeCumplido
                                                                    }
                                                                >
                                                                    CUMPLIDO
                                                                </Text>
                                                            ) : (
                                                                <Text
                                                                    style={
                                                                        styles.badgeIncumplido
                                                                    }
                                                                >
                                                                    INCUMPLIDO
                                                                </Text>
                                                            )}
                                                        </View>
                                                    </View>
                                                ),
                                            ),
                                        )}
                                    </View>
                                </View>
                            ))}
                        </View>
                    ))}

                    {areas.length === 0 && (
                        <Text style={{ fontSize: 8, color: '#999' }}>
                            Sin datos para los filtros seleccionados.
                        </Text>
                    )}

                    {usuarios.length > 0 && (
                        <View>
                            <Text style={styles.usuariosTitle}>
                                PERSONAS INVOLUCRADAS
                            </Text>
                            <View style={styles.usuariosTable}>
                                <View style={styles.usuariosHeader}>
                                    <Text style={styles.usuariosCell}>
                                        CÓDIGO
                                    </Text>
                                    <Text style={styles.usuariosCell}>
                                        NOMBRE COMPLETO
                                    </Text>
                                </View>
                                {usuarios.map((usuario: any, index: number) => (
                                    <View
                                        key={usuario.codigo}
                                        style={{
                                            flexDirection: 'row',
                                            borderBottomWidth: 0.5,
                                            borderColor: '#ddd',
                                            backgroundColor:
                                                index % 2 === 0
                                                    ? '#fafafa'
                                                    : '#fff',
                                        }}
                                    >
                                        <Text
                                            style={{
                                                ...styles.usuariosCell,
                                                color: '#000',
                                                fontWeight: 'normal',
                                            }}
                                        >
                                            {usuario.codigo}
                                        </Text>
                                        <Text
                                            style={{
                                                ...styles.usuariosCell,
                                                color: '#000',
                                                fontWeight: 'normal',
                                            }}
                                        >
                                            {usuario.nombre}
                                        </Text>
                                    </View>
                                ))}
                            </View>
                        </View>
                    )}
                </PdfLayout>
            </Page>
        </Document>
    );
}
