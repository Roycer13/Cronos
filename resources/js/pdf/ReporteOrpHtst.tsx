import { Document, Page, StyleSheet, Text, View } from '@react-pdf/renderer';
import PdfLayout from './PdfLayout';

// ==============================
// UTILIDADES (sin cambios)
// ==============================

function formatFecha(value?: string | Date | null) {
    if (!value) return '-';
    try {
        const fecha = new Date(value);
        const dia = fecha.getDate().toString().padStart(2, '0');
        const mes = (fecha.getMonth() + 1).toString().padStart(2, '0');
        const año = fecha.getFullYear();
        return `${dia}/${mes}/${año}`;
    } catch {
        return '-';
    }
}

function formatDateOnly(value?: string | Date | null) {
    if (!value) return '-';
    try {
        const fecha = new Date(value);
        return `${fecha.getDate().toString().padStart(2, '0')} - ${(fecha.getMonth() + 1).toString().padStart(2, '0')} - ${fecha.getFullYear()}`;
    } catch {
        return '-';
    }
}

function formatTimeOnly(value?: string | Date | null) {
    if (!value) return '-';
    try {
        const fecha = new Date(value);
        return `${fecha.getHours().toString().padStart(2, '0')}:${fecha.getMinutes().toString().padStart(2, '0')}`;
    } catch {
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
    } catch {
        return '-';
    }
}

function safe<T = any>(obj: any, getter: (o: any) => T, fallback: T) {
    try {
        const value = getter(obj);
        return value === undefined || value === null ? fallback : value;
    } catch {
        return fallback;
    }
}

// ==============================
// ESTILOS (sin cambios)
// ==============================

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
    badge: {
        fontSize: 5.5,
        paddingHorizontal: 1.5,
        paddingVertical: 0.5,
        backgroundColor: '#e3f2fd',
        borderRadius: 1,
    },
    usersTable: {
        marginTop: 6,
        borderWidth: 0.5,
        borderColor: '#bbb',
        width: '40%',
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
    verifiedBox: {
        marginTop: 6,
        paddingTop: 6,
        borderTopWidth: 1,
        borderColor: '#000',
        alignItems: 'flex-end',
    },
    pasteurizadorBox: {
        marginTop: 6,
        marginBottom: 6,
        borderWidth: 0.7,
        borderColor: '#4a5568',
        backgroundColor: '#eef6ff',
        padding: 5,
    },
    pasteurizadorTitulo: {
        fontSize: 8,
        fontWeight: 'bold',
        marginBottom: 3,
        color: '#1a365d',
    },
    pasteurizadorFila: {
        flexDirection: 'row',
        flexWrap: 'wrap',
    },
    pasteurizadorCampo: {
        width: '50%',
        marginBottom: 2,
    },
    pasteurizadorLabel: {
        fontSize: 7,
        fontWeight: 'bold',
    },
    pasteurizadorValor: {
        fontSize: 7,
    },
});

export default function ReporteOrpHtst({
    orp,
    estadisticas,
    ultimos_analisis,
    usuariosInvolucrados,
    obs,
    analisis_por_etapa,
    pasteurizador,
}: any) {
    console.log('📦 Props recibidas:', {
        orp: orp?.codigo,
        tiene_analisis_por_etapa: !!analisis_por_etapa,
        keys_analisis: analisis_por_etapa ? Object.keys(analisis_por_etapa) : [],
        pasteurizador: pasteurizador,
    });

    const observaciones: any[] = [];
    const usuariosMap: Record<string, any> = {};

    try {
        Object.values(ultimos_analisis || {}).forEach((listAny: any) => {
            const arr = Array.isArray(listAny) ? listAny : Object.values(listAny || {});
            arr.forEach((item: any) => {
                const analisis = item.analisis || item.solicitudAnalisisLinea?.analisisLinea || item.analisisLinea || null;
                if (analisis && analisis.observaciones) {
                    observaciones.push({
                        tiempo: analisis.tiempo || item.tiempo || item.solicitudAnalisisLinea?.tiempo || null,
                        texto: analisis.observaciones,
                        usuario: (analisis.user && (analisis.user.nombre || analisis.user.codigo)) ? analisis.user : null,
                    });
                }
                const posiblesUsuarios = [
                    item.solicitudAnalisisLinea?.user,
                    item.solicitudAnalisisLinea?.analisisLinea?.user,
                    item.analisis?.user,
                    item.user,
                ];
                posiblesUsuarios.forEach((u: any) => {
                    if (u && u.codigo) usuariosMap[u.codigo] = u;
                });
            });
        });
    } catch (e) {}

    const usuariosList = (usuariosInvolucrados && usuariosInvolucrados.length)
        ? usuariosInvolucrados
        : Object.values(usuariosMap || {});

    const todosAnalisis: any[] = [];
    if (analisis_por_etapa && Object.keys(analisis_por_etapa).length) {
        Object.entries(analisis_por_etapa).forEach(([etapa, listAny]: any) => {
            const arr = Array.isArray(listAny) ? listAny : Object.values(listAny || {});
            arr.forEach((item: any) => {
                const normalized = Object.assign({}, item, { etapa });
                todosAnalisis.push(normalized);
            });
        });
    } else {
        try {
            Object.values(ultimos_analisis || {}).forEach((listAny: any) => {
                const arr = Array.isArray(listAny) ? listAny : Object.values(listAny || {});
                arr.forEach((item: any) => todosAnalisis.push(item));
            });
        } catch (e) {}
    }

    const nombreProducto = (orp?.producto_terminado?.nombre_sap || orp?.producto_terminado?.nombre || '').toUpperCase();
    const isPremezcla = nombreProducto.includes('PREMEZCLA');

    function buscarCodigoUsuario(nombre?: string, apellido?: string): string {
        if (!nombre) return '-';
        const usuarioEncontrado = usuariosList.find(
            (u: any) =>
                u.nombre?.toLowerCase() === nombre.toLowerCase() &&
                u.apellido?.toLowerCase() === (apellido || '').toLowerCase()
        );
        return usuarioEncontrado?.codigo || usuarioEncontrado?.code || '-';
    }

    function renderStage(title: string, items: any[]) {
        if (!items || items.length === 0) return null;

        const anyWith = (getter: (it: any) => any) =>
            items.some(it => {
                try {
                    const v = getter(it);
                    return v !== null && v !== undefined && v !== '' && v !== 0;
                } catch (e) {
                    return false;
                }
            });

        const showTemp = anyWith(i => (i.analisis || i.solicitudAnalisisLinea?.analisisLinea || i.analisisLinea)?.temperatura || i.temperatura);
        const showPh = anyWith(i => (i.analisis || i.solicitudAnalisisLinea?.analisisLinea || i.analisisLinea)?.ph || i.ph);
        const showAcidez = anyWith(i => (i.analisis || i.solicitudAnalisisLinea?.analisisLinea || i.analisisLinea)?.acidez || i.acidez);
        const showBrix = anyWith(i => (i.analisis || i.solicitudAnalisisLinea?.analisisLinea || i.analisisLinea)?.brix || i.brix);
        const showViscosidad = anyWith(i => (i.analisis || i.solicitudAnalisisLinea?.analisisLinea || i.analisisLinea)?.viscosidad || i.viscosidad);
        const showPeso = anyWith(i => (i.analisis || i.solicitudAnalisisLinea?.analisisLinea || i.analisisLinea)?.peso || i.peso);
        const showVolumen = anyWith(i => (i.analisis || i.solicitudAnalisisLinea?.analisisLinea || i.analisisLinea)?.volumen || i.volumen);
        const showColor = anyWith(i => typeof (i.analisis || i.solicitudAnalisisLinea?.analisisLinea || i.analisisLinea)?.color !== 'undefined' || typeof i.color !== 'undefined');
        const showOlor = anyWith(i => typeof (i.analisis || i.solicitudAnalisisLinea?.analisisLinea || i.analisisLinea)?.olor !== 'undefined' || typeof i.olor !== 'undefined');
        const showSabor = anyWith(i => typeof (i.analisis || i.solicitudAnalisisLinea?.analisisLinea || i.analisisLinea)?.sabor !== 'undefined' || typeof i.sabor !== 'undefined');

        const headers: string[] = ['Prep.', 'Tanque', 'Fecha', 'Hora S.', 'Hora R.'];
        if (showTemp) headers.push('Temp [°C]');
        if (showPh) headers.push('pH');
        if (showAcidez) headers.push('Acidez [%]');
        if (showBrix) headers.push('°Brix');
        if ((title === 'ANTES DE CORTE' || title === 'DESPUES DE CORTE') && showViscosidad && !isPremezcla) headers.push('µ [s]');
        if (title === 'DESPUES DE CORTE' && !isPremezcla) {
            if (showColor) headers.push('Color');
            if (showOlor) headers.push('Olor');
            if (showSabor) headers.push('Sabor');
        }
        headers.push('Sol', 'Ana');

        return (
            <View key={title} style={styles.section}>
                <Text style={styles.sectionTitle}>{title}</Text>
                <View style={styles.tableWrapper}>
                    <View style={styles.tableHeader}>
                        {title === 'ENVASADO' ? (
                            ([
                                'Cabezal',
                                ...(showPeso ? ['Peso [g]'] : []),
                                'Lote',
                                'Hora S.',
                                'Hora R.',
                            ]
                                .concat([
                                    ...(showTemp ? ['Temp [°C]'] : []),
                                    ...(showPh ? ['pH'] : []),
                                    ...(showAcidez ? ['Acidez [%]'] : []),
                                    ...(showBrix ? ['°Brix'] : []),
                                ])
                                .concat(showViscosidad ? ['µ [s]'] : [])
                                .concat(showColor ? ['Color'] : [])
                                .concat(showOlor ? ['Olor'] : [])
                                .concat(showSabor ? ['Sabor'] : [])
                                .concat(['Sol', 'Ana']) as string[]
                            ).map((h, i) => (
                                <View
                                    key={i}
                                    style={
                                        i ===
                                        (showPeso ? 1 : 0) +
                                            3 +
                                            (showTemp ? 1 : 0) +
                                            (showPh ? 1 : 0) +
                                            (showAcidez ? 1 : 0) +
                                            (showBrix ? 1 : 0) +
                                            (showViscosidad ? 1 : 0) +
                                            (showColor ? 1 : 0) +
                                            (showOlor ? 1 : 0) +
                                            (showSabor ? 1 : 0) +
                                            1
                                            ? styles.headerCellLast
                                            : styles.headerCell
                                    }
                                >
                                    <Text>{h}</Text>
                                </View>
                            ))
                        ) : (
                            headers.map((h, i) => (
                                <View key={i} style={i === headers.length - 1 ? styles.headerCellLast : styles.headerCell}>
                                    <Text>{h}</Text>
                                </View>
                            ))
                        )}
                    </View>

                    {items.map((item: any, idx: number) => {
                        const prep = safe(item, o => o.preparacion || o.solicitudAnalisisLinea?.estadoPlanta?.estadoDetalle?.find((e: any) => true)?.preparacion, '-');
                        const tanque = safe(item, o => o.solicitudAnalisisLinea?.estadoPlanta?.origen?.alias || o.origen, '-');
                        const fecha = formatDateOnly(safe(item, o => o.tiempo_solicitud || o.solicitudAnalisisLinea?.tiempo || o.tiempo, null));
                        const horaS = formatTimeOnly(safe(item, o => o.tiempo_solicitud || o.solicitudAnalisisLinea?.tiempo || o.tiempo, null));
                        const horaR = formatTimeOnly(safe(item, o => o.tiempo_analisis || o.solicitudAnalisisLinea?.analisisLinea?.tiempo || o.analisis?.tiempo || o.analisisLinea?.tiempo, null));
                        const analisis = item.analisis || item.solicitudAnalisisLinea?.analisisLinea || item.analisisLinea || (item.temperatura || item.ph || item.peso || item.brix ? item : {});
                        const temp = safe(analisis, a => a.temperatura, '-');
                        const ph = safe(analisis, a => a.ph, '-');
                        const acidez = safe(analisis, a => a.acidez, '-');
                        const brix = safe(analisis, a => a.brix, '-');
                        const viscosidad = safe(analisis, a => a.viscosidad, '-');
                        const peso = safe(analisis, a => a.peso, '-');
                        const volumen = safe(analisis, a => a.volumen, '-');
                        const color = analisis && typeof analisis.color !== 'undefined' ? (analisis.color ? 'C.' : 'N.C.') : '-';
                        const olor = analisis && typeof analisis.olor !== 'undefined' ? (analisis.olor ? 'C.' : 'N.C.') : '-';
                        const sabor = analisis && typeof analisis.sabor !== 'undefined' ? (analisis.sabor ? 'C.' : 'N.C.') : '-';

                        const solDisplay = buscarCodigoUsuario(item.solicitante?.nombre, item.solicitante?.apellido);
                        const anaDisplay = buscarCodigoUsuario(item.analista?.nombre, item.analista?.apellido);

                        if (title === 'ENVASADO') {
                            const cabezal = safe(item, o => o.solicitudAnalisisLinea?.estadoPlanta?.origen?.alias || o.origen, '-');
                            const tiempoLote = safe(item, o => o.tiempo_solicitud || o.solicitudAnalisisLinea?.tiempo || o.tiempo, null);
                            const loteDia = formatJulianDate(tiempoLote);
                            return (
                                <View key={idx} style={styles.row}>
                                    <Text style={styles.cell}>{cabezal}</Text>
                                    {showPeso && <Text style={styles.cell}>{peso}</Text>}
                                    <Text style={styles.cell}>{loteDia}</Text>
                                    <Text style={styles.cell}>{horaS}</Text>
                                    <Text style={styles.cell}>{horaR}</Text>
                                    {showTemp && <Text style={styles.cell}>{temp}</Text>}
                                    {showPh && <Text style={styles.cell}>{ph}</Text>}
                                    {showAcidez && <Text style={styles.cell}>{acidez}</Text>}
                                    {showBrix && <Text style={styles.cell}>{brix}</Text>}
                                    {showViscosidad && <Text style={styles.cell}>{viscosidad}</Text>}
                                    {showColor && <Text style={styles.cell}>{color}</Text>}
                                    {showOlor && <Text style={styles.cell}>{olor}</Text>}
                                    {showSabor && <Text style={styles.cell}>{sabor}</Text>}
                                    <Text style={styles.cell}>{solDisplay}</Text>
                                    <Text style={styles.cellLast}>{anaDisplay}</Text>
                                </View>
                            );
                        }

                        return (
                            <View key={idx} style={styles.row}>
                                <Text style={styles.cell}>{prep}</Text>
                                <Text style={styles.cell}>{tanque}</Text>
                                <Text style={styles.cell}>{fecha}</Text>
                                <Text style={styles.cell}>{horaS}</Text>
                                <Text style={styles.cell}>{horaR}</Text>
                                {showTemp && <Text style={styles.cell}>{temp}</Text>}
                                {showPh && <Text style={styles.cell}>{ph}</Text>}
                                {showAcidez && <Text style={styles.cell}>{acidez}</Text>}
                                {showBrix && <Text style={styles.cell}>{brix}</Text>}
                                {(title === 'ANTES DE CORTE' || title === 'DESPUES DE CORTE') && showViscosidad && !isPremezcla && <Text style={styles.cell}>{viscosidad}</Text>}
                                {title === 'DESPUES DE CORTE' && !isPremezcla ? (
                                    <>
                                        {showColor && <Text style={styles.cell}>{color}</Text>}
                                        {showOlor && <Text style={styles.cell}>{olor}</Text>}
                                        {showSabor && <Text style={styles.cell}>{sabor}</Text>}
                                        <Text style={styles.cell}>{solDisplay}</Text>
                                        <Text style={styles.cellLast}>{anaDisplay}</Text>
                                    </>
                                ) : (
                                    <>
                                        <Text style={styles.cell}>{solDisplay}</Text>
                                        <Text style={styles.cellLast}>{anaDisplay}</Text>
                                    </>
                                )}
                            </View>
                        );
                    })}
                </View>
            </View>
        );
    }

    const mez = todosAnalisis.filter(a => (a.etapa || '').toString().toUpperCase().includes('MEZCLA') || (a.etapa || '').toString().toUpperCase().includes('MEZCL'));
    const inoc = todosAnalisis.filter(a => (a.etapa || '').toString().toUpperCase().includes('INOCUL'));
    const antes = todosAnalisis.filter(a => (a.etapa || '').toString().toUpperCase().includes('ANTES') || (a.etapa || '').toString().toUpperCase().includes('ANTES DE CORTE'));
    const despues = todosAnalisis.filter(a => (a.etapa || '').toString().toUpperCase().includes('DESPUES') || (a.etapa || '').toString().toUpperCase().includes('DESPUES DE CORTE'));
    const envas = todosAnalisis.filter(a => (a.etapa || '').toString().toUpperCase().includes('ENVAS') || (a.origen || '').toString().toUpperCase().includes('EMBOTELLADORA'));

    return (
        <Document>
            <Page size="A4" style={{ ...styles.container, padding: 10 }}>
                <PdfLayout
                    title="CONTROL DE CALIDAD EN PROCESO - LÍNEA HTST"
                    tipo="REGISTRO"
                    version="001"
                    codigo="PLL-REG-035"
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
                                <Text style={styles.infoValue}>{orp.preparacion / 1 || orp.lote || 'N/A'}</Text>
                            </View>
                            <View style={styles.infoItem}>
                                <Text style={styles.infoLabel}>Fecha de Producción:</Text>
                                <Text style={styles.infoValue}>{formatFecha(orp?.fecha_produccion)}</Text>
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

                    {/* ÚLTIMOS ANÁLISIS POR ETAPA */}
                    {analisis_por_etapa && Object.keys(analisis_por_etapa).length ? (
                        (() => {
                            const rendered = new Set<string>();
                            const order = [
                                { label: 'MEZCLA', terms: ['MEZCLA', 'MEZCL'] },
                                { label: 'INOCULACION', terms: ['INOCUL'] },
                                { label: 'ANTES DE CORTE', terms: ['ANTES'] },
                                { label: 'DESPUES DE CORTE', terms: ['DESPUES'] },
                                { label: 'ENVASADO', terms: ['ENVAS', 'EMBOTELLADORA'] },
                            ];

                            const nodes: any[] = [];
                            const envasadoNode: any = null;
                            const envasadoKey = Object.keys(analisis_por_etapa).find(k => {
                                const ku = (k || '').toString().toUpperCase();
                                return order.find(o => o.label === 'ENVASADO')?.terms.some(t => ku.includes(t.toUpperCase()));
                            });

                            // Renderizar etapas fijas excepto ENVASADO
                            order.forEach(o => {
                                if (o.label === 'ENVASADO') return;
                                const foundKey = Object.keys(analisis_por_etapa).find(k => {
                                    const ku = (k || '').toString().toUpperCase();
                                    return o.terms.some(t => ku.includes(t.toUpperCase()));
                                });
                                if (foundKey) {
                                    rendered.add(foundKey);
                                    const raw = analisis_por_etapa[foundKey];
                                    const arr = Array.isArray(raw) ? raw : Object.values(raw || {});
                                    const items = arr.map((it: any) => ({ ...it, etapa: foundKey }));
                                    nodes.push(renderStage(o.label, items));

                                    // Insertar pasteurizador después de MEZCLA
                                    if (o.label === 'MEZCLA' && pasteurizador) {
                                        nodes.push(
                                            <View key="pasteurizador" style={styles.pasteurizadorBox}>
                                                <Text style={styles.pasteurizadorTitulo}>PASTEURIZACIÓN</Text>
                                                <View style={styles.pasteurizadorFila}>
                                                    <View style={styles.pasteurizadorCampo}>
                                                        <Text style={styles.pasteurizadorLabel}>Pasteurizador</Text>
                                                        <Text style={styles.pasteurizadorValor}>{pasteurizador.alias || '-'}</Text>
                                                    </View>
                                                    <View style={styles.pasteurizadorCampo}>
                                                        <Text style={styles.pasteurizadorLabel}>Hora del proceso</Text>
                                                        <Text style={styles.pasteurizadorValor}>{formatTimeOnly(pasteurizador.hora)}</Text>
                                                    </View>
                                                    <View style={{ width: '100%', marginTop: 3 }}>
                                                        <Text style={styles.pasteurizadorLabel}>Observación</Text>
                                                        <Text style={styles.pasteurizadorValor}>{pasteurizador.observacion || 'Sin observaciones'}</Text>
                                                    </View>
                                                </View>
                                            </View>
                                        );
                                    }
                                }
                            });

                            // Etapas desconocidas (ni fijas ni ENVASADO)
                            Object.keys(analisis_por_etapa).forEach(k => {
                                if (!rendered.has(k) && k !== envasadoKey) {
                                    const raw = analisis_por_etapa[k];
                                    const arr = Array.isArray(raw) ? raw : Object.values(raw || {});
                                    const items = arr.map((it: any) => ({ ...it, etapa: k }));
                                    nodes.push(renderStage(k, items));
                                }
                            });

                            // ENVASADO siempre al final
                            if (envasadoKey) {
                                const raw = analisis_por_etapa[envasadoKey];
                                const arr = Array.isArray(raw) ? raw : Object.values(raw || {});
                                const items = arr.map((it: any) => ({ ...it, etapa: envasadoKey }));
                                nodes.push(renderStage('ENVASADO', items));
                            }

                            console.log('📊 Nodos renderizados:', nodes.map(n => n?.key || 'sin key'));
                            return nodes;
                        })()
                    ) : (
                        <>
                            {renderStage('MEZCLA', mez)}
                            {pasteurizador && (
                                <View style={styles.pasteurizadorBox}>
                                    <Text style={styles.pasteurizadorTitulo}>PASTEURIZACIÓN</Text>
                                    <View style={styles.pasteurizadorFila}>
                                        <View style={styles.pasteurizadorCampo}>
                                            <Text style={styles.pasteurizadorLabel}>Pasteurizador</Text>
                                            <Text style={styles.pasteurizadorValor}>{pasteurizador.alias || '-'}</Text>
                                        </View>
                                        <View style={styles.pasteurizadorCampo}>
                                            <Text style={styles.pasteurizadorLabel}>Hora del proceso</Text>
                                            <Text style={styles.pasteurizadorValor}>{formatTimeOnly(pasteurizador.hora)}</Text>
                                        </View>
                                        <View style={{ width: '100%', marginTop: 3 }}>
                                            <Text style={styles.pasteurizadorLabel}>Observación</Text>
                                            <Text style={styles.pasteurizadorValor}>{pasteurizador.observacion || 'Sin observaciones'}</Text>
                                        </View>
                                    </View>
                                </View>
                            )}
                            {renderStage('INOCULACION', inoc)}
                            {renderStage('ANTES DE CORTE', antes)}
                            {renderStage('DESPUES DE CORTE', despues)}
                            {!isPremezcla && renderStage('ENVASADO', envas)}
                        </>
                    )}

                    {/* OBSERVACIONES */}
                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>Observaciones</Text>
                        {((obs && (Array.isArray(obs) ? obs.length : Object.keys(obs || {}).length)) || observaciones.length) ? (
                            <View>
                                {((Array.isArray(obs) && obs.length ? obs : observaciones) || []).map((o: any, i: number) => (
                                    <View key={i} style={{ marginBottom: 2, paddingBottom: 1, borderBottomWidth: 0.5, borderColor: '#e0e0e0' }}>
                                        <Text style={{ fontSize: 7, color: '#333' }}>
                                            {o.tiempo ? formatFecha(o.tiempo) + ' ' : ''}{' '}
                                            {o.usuario && (o.usuario.nombre || o.usuario.codigo) ? <Text style={{ fontWeight: 'bold' }}>{o.usuario.nombre || o.usuario.codigo}:</Text> : ''}
                                            {' ' + (o.texto || o.solicitudAnalisisLinea?.analisisLinea?.observaciones || '')}
                                        </Text>
                                    </View>
                                ))}
                            </View>
                        ) : (
                            <Text style={{ fontSize: 8, color: '#999', fontStyle: 'italic' }}>Sin Observaciones</Text>
                        )}
                    </View>

                    {/* USUARIOS INVOLUCRADOS + FIRMA REVISOR */}
                    <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 8, gap: 8, pageBreakInside: 'avoid' as any }}>
                        <View style={{ ...styles.usersTable, width: '65%', flex: 1 }}>
                            <View style={styles.usersHeader}>
                                <Text style={styles.usersCell}>CÓDIGO</Text>
                                <Text style={styles.usersCell}>NOMBRE</Text>
                            </View>
                            {(usuariosList || []).map((u: any, i: number) => (
                                <View key={i} style={{ flexDirection: 'row', borderBottomWidth: 0.5, borderColor: '#ddd', backgroundColor: i % 2 === 0 ? '#fafafa' : '#fff', paddingVertical: 2 }}>
                                    <Text style={{ ...styles.usersCell, color: '#000', fontWeight: 'normal' }}>{u.codigo || u.code || '-'}</Text>
                                    <Text style={{ ...styles.usersCell, color: '#000', fontWeight: 'normal' }}>{((u.nombre || u.name || '') + ' ' + (u.apellido || u.lastName || '')).trim() || u.nombre_completo || '-'}</Text>
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
