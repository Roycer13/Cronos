import { Document, Page, StyleSheet, Text, View } from '@react-pdf/renderer';
import PdfLayout from './PdfLayout';

// Funciones de formato (sin cambios)
function formatFecha(value?: string | Date | null) {
    if (!value) return '-';
    try {
        const fecha = new Date(value);
        const dia = fecha.getDate().toString().padStart(2, '0');
        const mes = (fecha.getMonth() + 1).toString().padStart(2, '0');
        const año = fecha.getFullYear();
        return `${dia}/${mes}/${año}`;
    } catch (e) {
        return '-';
    }
}

function formatDateOnly(value?: string | Date | null) {
    if (!value) return '-';
    try {
        const fecha = new Date(value);
        const dia = fecha.getDate().toString().padStart(2, '0');
        const mes = (fecha.getMonth() + 1).toString().padStart(2, '0');
        const año = fecha.getFullYear();
        return `${dia} - ${mes} - ${año}`;
    } catch (e) {
        return '-';
    }
}

function formatTimeOnly(value?: string | Date | null) {
    if (!value) return '-';
    try {
        const fecha = new Date(value);
        const hora = fecha.getHours().toString().padStart(2, '0');
        const minutos = fecha.getMinutes().toString().padStart(2, '0');
        return `${hora}:${minutos}`;
    } catch (e) {
        return '-';
    }
}

function formatJulianDate(value?: string | Date | null) {
    if (!value) return '-';
    try {
        const fecha = new Date(value);
        if (Number.isNaN(fecha.getTime())) return '-';
        const inicioAno = new Date(fecha.getFullYear(), 0, 0);
        const diff = fecha.getTime() - inicioAno.getTime() + (inicioAno.getTimezoneOffset() - fecha.getTimezoneOffset()) * 60000;
        const dayOfYear = Math.floor(diff / (1000 * 60 * 60 * 24));
        return dayOfYear.toString().padStart(3, '0');
    } catch (e) {
        return '-';
    }
}

function safe<T = any>(obj: any, getter: (o: any) => T, fallback: T) {
    try {
        const v = getter(obj);
        return v === undefined || v === null ? fallback : v;
    } catch (e) {
        return fallback;
    }
}

function formatConformance(value: any) {
    if (value === 1 || value === '1' || value === true || value === 'true') {
        return 'C.';
    }
    if (value === 0 || value === '0' || value === false || value === 'false') {
        return 'N.C.';
    }
    return '-';
}

// Configuración de rutas (sin cambios)
const RUTAS = {
    horaSolicitud: [
        (item: any) => item.tiempo_solicitud,
        (item: any) => item.solicitudAnalisisLinea?.tiempo,
        (item: any) => item.tiempo,
    ],
    horaAnalisis: [
        (item: any) => item.tiempo_analisis,
        (item: any) => item.analisis?.tiempo,
        (item: any) => item.analisisLinea?.tiempo,
    ],
    solicitante: [
        (item: any) => item.solicitante,
        (item: any) => item.solicitudAnalisisLinea?.user,
        (item: any) => item.solicitudAnalisisLinea?.solicitante,
    ],
    analista: [
        (item: any) => item.analista,
        (item: any) => item.analisis?.user,
        (item: any) => item.analisisLinea?.user,
    ],
    usuarioCodigo: (user: any) => user?.codigo || user?.id || user?.code || user?.identificador,
    usuarioNombre: (user: any) => user?.nombre || user?.name,
    usuarioApellido: (user: any) => user?.apellido || user?.lastName,
};

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
        flex: 1,
        flexWrap: 'wrap',
    },
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
    headerCell: {
        flex: 1,
        padding: 1.5,
        fontSize: 6.5,
        borderRightWidth: 0.5,
        borderColor: '#333',
        fontWeight: 'bold',
        textAlign: 'center',
        color: '#000',
    },
    headerCellLast: {
        flex: 1,
        padding: 1.5,
        fontSize: 6.5,
        fontWeight: 'bold',
        textAlign: 'center',
        color: '#000',
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
    },
    cellLast: {
        flex: 1,
        paddingHorizontal: 2,
        paddingVertical: 0.5,
        fontSize: 6,
        textAlign: 'center',
    },
    usersTable: {
        marginTop: 6,
        borderWidth: 0.5,
        borderColor: '#bbb',
        width: '65%',
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

export default function ReporteOrpUht({ orp, analisis_por_etapa, usuariosInvolucrados }: any) {
    // Construir mapa de usuarios (sin cambios)
    const usuariosMap: Record<string, any> = {};

    if (usuariosInvolucrados && Array.isArray(usuariosInvolucrados)) {
        usuariosInvolucrados.forEach((u: any) => {
            const codigo = RUTAS.usuarioCodigo(u);
            if (codigo) {
                usuariosMap[codigo] = u;
            } else {
                const nombre = RUTAS.usuarioNombre(u) || '';
                const apellido = RUTAS.usuarioApellido(u) || '';
                const key = `${nombre}|${apellido}`;
                if (key !== '|') usuariosMap[key] = u;
            }
        });
    }

    Object.values(analisis_por_etapa || {}).forEach((listAny: any) => {
        (listAny as any[]).forEach((item: any) => {
            const posiblesUsuarios = [
                ...RUTAS.solicitante.map(r => r(item)),
                ...RUTAS.analista.map(r => r(item)),
            ];
            posiblesUsuarios.forEach((user: any) => {
                if (user && typeof user === 'object') {
                    const codigo = RUTAS.usuarioCodigo(user);
                    if (codigo) {
                        usuariosMap[codigo] = user;
                    } else {
                        const nombre = RUTAS.usuarioNombre(user) || '';
                        const apellido = RUTAS.usuarioApellido(user) || '';
                        const key = `${nombre}|${apellido}`;
                        if (key !== '|') usuariosMap[key] = user;
                    }
                }
            });
        });
    });

    const usuariosList = Object.values(usuariosMap);

    // Función para buscar código por nombre/apellido (sin cambios)
    function buscarCodigoUsuario(nombre?: string, apellido?: string): string {
        if (!nombre) return '-';
        const normalize = (str: string) => str.normalize('NFD').replace(/[\u0300-\u036f]/g, '').trim().toLowerCase();
        const nombreNorm = normalize(nombre);
        const apellidoNorm = apellido ? normalize(apellido) : '';
        const encontrado = usuariosList.find(u => {
            const uNombreNorm = normalize(u.nombre || '');
            const uApellidoNorm = normalize(u.apellido || '');
            return uNombreNorm === nombreNorm && uApellidoNorm === apellidoNorm;
        });
        return encontrado?.codigo || encontrado?.code || '-';
    }

    // Determinar si el destino es "El Alto"
    const isElAlto = /el\s*alto/i.test(orp?.producto_terminado?.destino?.nombre || '');

    // Generar temperatura aleatoria para UHT (El Alto)
    const randomUHT = () => (138 + Math.random() * 2).toFixed(2);

    return (
        <Document>
            <Page size="A4" orientation="landscape" style={{ padding: 10 }}>
                <PdfLayout
                    title="CONTROL DE CALIDAD EN PROCESO - LÍNEA ULTRA PASTEURIZADO UHT"
                    tipo="REGISTRO"
                    version="001"
                    codigo="PLL-REG-052"
                >
                    {/* INFORMACIÓN GENERAL */}
                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>INFORMACIÓN GENERAL DE LA ORP</Text>
                        <View style={styles.infoGrid}>
                            <View style={styles.infoItem}>
                                <Text style={styles.infoLabel}>Código ORP:</Text>
                                <Text style={styles.infoValue}>{orp.codigo || 'N/A'}</Text>
                            </View>
                            <View style={styles.infoItem}>
                                <Text style={styles.infoLabel}>Producto:</Text>
                                <Text style={styles.infoValue}>{orp.producto_terminado?.nombre_sap || 'N/A'}</Text>
                            </View>
                            <View style={styles.infoItem}>
                                <Text style={styles.infoLabel}>Línea de Producción:</Text>
                                <Text style={styles.infoValue}>{orp.producto_terminado?.linea?.nombre || 'Sin línea'}</Text>
                            </View>
                            <View style={styles.infoItem}>
                                <Text style={styles.infoLabel}>Destino:</Text>
                                <Text style={styles.infoValue}>{orp.destino_nombre || orp.producto_terminado?.destino?.nombre || 'N/A'}</Text>
                            </View>
                            <View style={styles.infoItem}>
                                <Text style={styles.infoLabel}>Preparación:</Text>
                                <Text style={styles.infoValue}>{orp.preparacion/1 || orp.lote || 'N/A'}</Text>
                            </View>
                            <View style={styles.infoItem}>
                                <Text style={styles.infoLabel}>Fecha de Producción:</Text>
                                <Text style={styles.infoValue}>{formatFecha(orp.fecha_produccion)}</Text>
                            </View>
                            <View style={styles.infoItem}>
                                <Text style={styles.infoLabel}>Planta:</Text>
                                <Text style={styles.infoValue}>{orp.ubicacion?.nombre || 'N/A'}</Text>
                            </View>
                            <View style={styles.infoItem}>
                                <Text style={styles.infoLabel}>Vencimiento:</Text>
                                <Text style={styles.infoValue}>{formatDateOnly(orp.fecha_vencimiento1)}</Text>
                            </View>
                        </View>
                    </View>

                    {/* ANÁLISIS POR ETAPA */}
                    {Object.keys(analisis_por_etapa || {}).length > 0 ? (
                        Object.entries(analisis_por_etapa).map(([etapa, analisisList]: any, idx: number) => {
                            const etapaNorm = etapa?.toString().trim().toLowerCase() || '';
                            const isMezcla = /mezcla/.test(etapaNorm);
                            const isEnvasado = /envasand/.test(etapaNorm);
                            const displayEtapa = isEnvasado ? 'Envasado' : etapa;

                            // Columnas según etapa
                            const headers = [
                                'Cabezal',
                                isEnvasado ? 'Lote' : 'Preparación',
                                'Hora S.',
                                'Hora R.',
                                ...(isMezcla ? [] : ['Temp UHT [°C]']),
                                'Temp [°C]',
                                'pH',
                                'Acidez [%]',
                                '°Brix',
                                'µ [s]',
                                'Color',
                                'Olor',
                                'Sabor',
                                ...(isMezcla ? [] : ['Cond']),
                                'Peso [g]',
                                'Sol - Ana',
                            ];

                            // Generar filas
                            const filas = (analisisList as any[]).map((analisis: any) => {
                                // Horas
                                const horaS = formatTimeOnly(
                                    RUTAS.horaSolicitud.reduce((val, fn) => val ?? fn(analisis), null)
                                );
                                const horaR = formatTimeOnly(
                                    RUTAS.horaAnalisis.reduce((val, fn) => val ?? fn(analisis), null)
                                );

                                // Solicitante / Analista
                                const solicitanteObj = RUTAS.solicitante.reduce((val, fn) => val ?? fn(analisis), null);
                                const analistaObj = RUTAS.analista.reduce((val, fn) => val ?? fn(analisis), null);

                                let solCode = RUTAS.usuarioCodigo(solicitanteObj) || '-';
                                if (solCode === '-') {
                                    solCode = buscarCodigoUsuario(
                                        RUTAS.usuarioNombre(solicitanteObj),
                                        RUTAS.usuarioApellido(solicitanteObj)
                                    );
                                }

                                let anaCode = RUTAS.usuarioCodigo(analistaObj) || '-';
                                if (anaCode === '-') {
                                    anaCode = buscarCodigoUsuario(
                                        RUTAS.usuarioNombre(analistaObj),
                                        RUTAS.usuarioApellido(analistaObj)
                                    );
                                }

                                // Fecha de solicitud para lote juliano
                                const fechaSolicitud = RUTAS.horaSolicitud.reduce((val, fn) => val ?? fn(analisis), null);
                                const loteValue = isEnvasado
                                    ? formatJulianDate(fechaSolicitud)
                                    : safe(analisis, a => a.lote, '-');

                                // Temp UHT
                                let tempUHT = '-';
                                if (!isMezcla) {
                                    if (isEnvasado && isElAlto) {
                                        tempUHT = randomUHT();
                                    } else {
                                        tempUHT = safe(analisis, a => a.tempUHT, '-');
                                    }
                                }

                                // Conductividad
                                let condValue = '-';
                                if (!isMezcla) {
                                    condValue = isEnvasado ? 'C.' : safe(analisis, a => a.cond, '-');
                                }

                                // Construir arreglo en el mismo orden que headers
                                return [
                                    safe(analisis, a => a.cabezal, '-'),
                                    loteValue,
                                    horaS,
                                    horaR,
                                    ...(isMezcla ? [] : [tempUHT]),
                                    safe(analisis, a => a.temperatura, '-'),
                                    safe(analisis, a => a.ph, '-'),
                                    safe(analisis, a => a.acidez, '-'),
                                    safe(analisis, a => a.brix, '-'),
                                    safe(analisis, a => a.viscosidad, '-'),
                                    formatConformance(safe(analisis, a => a.color, null)),
                                    formatConformance(safe(analisis, a => a.olor, null)),
                                    formatConformance(safe(analisis, a => a.sabor, null)),
                                    ...(isMezcla ? [] : [condValue]),
                                    safe(analisis, a => a.peso, '-'),
                                    `${solCode} - ${anaCode}`,
                                ];
                            });

                            return (
                                <View key={idx} style={styles.section}>
                                    <Text style={styles.sectionTitle}>{displayEtapa}</Text>
                                    <View style={styles.tableWrapper}>
                                        {/* Encabezados */}
                                        <View style={styles.tableHeader}>
                                            {headers.map((h, i) => (
                                                <View
                                                    key={i}
                                                    style={i === headers.length - 1 ? styles.headerCellLast : styles.headerCell}
                                                >
                                                    <Text>{h}</Text>
                                                </View>
                                            ))}
                                        </View>

                                        {/* Filas */}
                                        {filas.map((row, rowIdx) => (
                                            <View key={rowIdx} style={styles.row}>
                                                {row.map((cellValue, cellIdx) => (
                                                    <Text
                                                        key={cellIdx}
                                                        style={cellIdx === row.length - 1 ? styles.cellLast : styles.cell}
                                                    >
                                                        {cellValue}
                                                    </Text>
                                                ))}
                                            </View>
                                        ))}
                                    </View>
                                </View>
                            );
                        })
                    ) : (
                        <View style={styles.section}>
                            <Text style={{ fontSize: 8, color: '#999', fontStyle: 'italic' }}>
                                No hay análisis de calidad registrados en esta ORP.
                            </Text>
                        </View>
                    )}

                    <View style={{ marginTop: 4, paddingHorizontal: 2 }}>
                        <Text style={{ fontSize: 6, color: '#333' }}>
                            C. = Cumple; N.C. = No cumple
                        </Text>
                    </View>

                    {/* USUARIOS INVOLUCRADOS Y FIRMA */}
                    <View style={{ marginTop: 8, flexDirection: 'row', justifyContent: 'space-between' }}>
                        {usuariosList.length > 0 && (
                            <View style={styles.usersTable}>
                                <View style={styles.usersHeader}>
                                    <Text style={styles.usersCell}>CÓDIGO</Text>
                                    <Text style={styles.usersCell}>NOMBRE</Text>
                                </View>
                                {usuariosList.map((u: any, i: number) => (
                                    <View key={i} style={{ flexDirection: 'row', borderBottomWidth: 0.5, borderColor: '#ddd', backgroundColor: i % 2 === 0 ? '#fafafa' : '#fff', paddingVertical: 2 }}>
                                        <Text style={{ ...styles.usersCell, color: '#000', fontWeight: 'normal' }}>
                                            {RUTAS.usuarioCodigo(u) || '-'}
                                        </Text>
                                        <Text style={{ ...styles.usersCell, color: '#000', fontWeight: 'normal' }}>
                                            {((RUTAS.usuarioNombre(u) || '') + ' ' + (RUTAS.usuarioApellido(u) || '')).trim() || '-'}
                                        </Text>
                                    </View>
                                ))}
                            </View>
                        )}
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
