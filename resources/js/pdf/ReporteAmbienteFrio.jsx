import React from 'react';
import { Document, Page, Text, View, StyleSheet } from '@react-pdf/renderer';

const styles = StyleSheet.create({

//estilos para cost
recordQuad: {
    flex: 1,
    flexDirection: 'row',
},
quadCell: {
    flex: 1,
    padding: 2.5,
    textAlign: 'center',
    fontSize: 5.5,
    borderRightWidth: 0.5,
    borderRightColor: '#000',
},
quadCellLast: {
    borderRightWidth: 0, // sin borde derecho en la última
},

//fin estilos para cost

    page: {
        padding: 15,
        paddingLeft: 30,
        fontSize: 6,
    },
    title: {
        fontSize: 11,
        fontWeight: 'bold',
        textAlign: 'center',
        marginBottom: 10,
    },
    // 🟦 BORDE EXTERNO GRUESO (1.5pt)
    table: {
        display: 'flex',
        width: 'auto',
        borderWidth: 1.5,
        borderColor: '#000',
        marginBottom: 10,
    },
    tableRow: {
        flexDirection: 'row',
    },
    tableRowBorderBottom: {
        borderBottomWidth: 0.5,
        borderBottomColor: '#000',
    },
    // 🟧 Borde superior grueso para filas de Fecha A (índices 3 y 14)
    tableRowFechaATop: {
        borderTopWidth: 1.5,
        borderTopColor: '#000',
    },
    fixedCell: {
        flex: 1,
        padding: 3.0,
        borderRightWidth: 0.5,
        borderRightColor: '#000',
        textAlign: 'center',
        fontSize: 5.5,
    },
    recordContainer: {
        flex: 2,
        padding: 0,
        textAlign: 'center',
        fontSize: 5.5,
    },
    recordBorder: {
        borderRightWidth: 0.5,
        borderRightColor: '#000',
    },
    // 🟩 Borde GRUESO entre registros cuando HAY datos
    recordBorderThick: {
        borderRightWidth: 1.5,
        borderRightColor: '#000',
    },
    recordFull: {
        flex: 1,
        padding: 2.5,
        textAlign: 'center',
        fontSize: 5.5,
    },
    productRowFull: {
        height: 20,
        paddingHorizontal: 2.5,
        paddingVertical: 0,
        fontSize: 4.8,
        lineHeight: 1.3,
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
    },
    productText: {
        fontSize: 4.8,
    },
    recordSplit: {
        flex: 1,
        flexDirection: 'row',
    },
    subCellLeft: {
        flex: 1,
        padding: 3.5,
        textAlign: 'center',
        fontSize: 5.5,
    },
    // ✅ Borde derecho SIEMPRE presente (línea entre "ambien" y "frio")
    subCellLeftBorder: {
        borderRightWidth: 0.5,
        borderRightColor: '#000',
    },
    subCellRight: {
        flex: 1,
        padding: 3.5,
        textAlign: 'center',
        fontSize: 5.5,
    },
    footer: {
        marginTop: 8,
        fontSize: 6,
        textAlign: 'right',
    },
});

const ETIQUETAS_FIJAS = [
    'Producto',       // 0
    'ORP',            // 1
    'Fecha V',        // 2
    'Fecha A',        // 3 ← borde superior grueso
    'Análisis',       // 4
    'Hora',           // 5
    'Temp',           // 6
    'pH',             // 7
    'Acidez',         // 8
    'Brix',           // 9
    'Visc',           // 10
    'C-O-S-T',        // 11
    'Analista',       // 12
    'Supervisor',     // 13
    'Fecha A',        // 14 ← borde superior grueso
    'Análisis',       // 15
    'Hora',           // 16
    'Temp',           // 17
    'pH',             // 18
    'Acidez',         // 19
    'Brix',           // 20
    'Visc',           // 21
    'C-O-S-T',        // 22
    'Analista',       // 23
    'Supervisor',     // 24
    'Observaciones',  // 25 (última fila, sin borde inferior)
];

function esFilaNoDividida(rowIndex) {
    const noDivididas = [0, 1, 2, 3, 14, 25];
    return noDivididas.includes(rowIndex);
}

function esFilaCOST(rowIndex) {
    return rowIndex === 11 || rowIndex === 22;
}

function formatearFecha(fecha) {
    if (!fecha) return '';
    try {
        const d = new Date(fecha);
        const dia = d.getDate().toString().padStart(2, '0');
        const mes = (d.getMonth() + 1).toString().padStart(2, '0');
        const anio = d.getFullYear().toString().slice(-2);
        return `${dia}-${mes}-${anio}`;
    } catch {
        return '';
    }
}

function sumarDias(fechaBase, dias) {
    const d = new Date(fechaBase);
    d.setDate(d.getDate() + dias);
    return formatearFecha(d);
}

function obtenerValorIzquierdo(registro, etiqueta, rowIndex, fechaActualStr, fechaBase) {
    if (etiqueta === 'Análisis' && (rowIndex === 4 || rowIndex === 15)) {
        return registro ? 'ambien' : '';
    }
    if (!registro) return '';
    const fechaVencimiento = registro.fecha_vencimiento1
        ? formatearFecha(registro.fecha_vencimiento1)
        : '';
    const mapa = {
        'Producto': registro.producto_nombre || '',
        'ORP': registro.orp_codigo_preparacion || '',
        'Fecha V': fechaVencimiento,
        'Análisis': registro.analisis || '',
        'Hora': registro.hora || '',
        'Temp': registro.temperatura || '',
        'pH': registro.ph || '',
        'Acidez': registro.acidez || '',
        'Brix': registro.brix || '',
        'Visc': registro.viscosidad || '',
        'C-O-S-T': registro.cost || '',
        'Analista': registro.analista || '',
        'Supervisor': registro.supervisor || '',
        'Observaciones': registro.observaciones || '',
    };
    if (etiqueta === 'Fecha A') {
        if (rowIndex === 3) return fechaActualStr;
        if (rowIndex === 14) {
            const destino = (registro.destino_nombre || '').toLowerCase();
            const dias = destino.includes('comerciales') ? 7 : 3;
            return sumarDias(fechaBase, dias);
        }
    }
    return mapa[etiqueta] || '';
}

function obtenerValorDerecho(registro, etiqueta, rowIndex) {
    if (etiqueta === 'Análisis' && (rowIndex === 4 || rowIndex === 15)) {
        return registro ? 'frio' : '';
    }
    return '';
}

export default function ReporteAmbienteFrio({ datos }) {
    const fechaActual = new Date();
    const fechaActualStr = fechaActual.toLocaleDateString('es-BO');

    const registrosPorTabla = 6;
    const tablasPorPagina = 2;
    const registrosPorPagina = registrosPorTabla * tablasPorPagina;

    const paginas = [];
    for (let i = 0; i < datos.length; i += registrosPorPagina) {
        paginas.push(datos.slice(i, i + registrosPorPagina));
    }
    if (paginas.length === 0) paginas.push([]);

    const ultimaFilaIndex = ETIQUETAS_FIJAS.length - 1; // 25

    return (
        <Document>
            {paginas.map((grupoPagina, paginaIndex) => {
                const gruposTabla = [];
                for (let i = 0; i < grupoPagina.length; i += registrosPorTabla) {
                    gruposTabla.push(grupoPagina.slice(i, i + registrosPorTabla));
                }
                while (gruposTabla.length < tablasPorPagina) {
                    gruposTabla.push([]);
                }

                return (
                    <Page
                        key={paginaIndex}
                        size="LETTER"
                        orientation="portrait"
                        style={styles.page}
                    >
                        <Text style={styles.title}>
                            Reporte de Seguimiento de Producto Terminado - Pasteurizado
                        </Text>

                        {/* ---------- TABLA 1 ---------- */}
                        <View style={styles.table}>
                            {ETIQUETAS_FIJAS.map((etiqueta, rowIndex) => {
                                const borderBottomStyle = rowIndex !== ultimaFilaIndex
                                    ? styles.tableRowBorderBottom
                                    : null;
                                const borderTopStyle = (rowIndex === 3 || rowIndex === 14)
                                    ? styles.tableRowFechaATop
                                    : null;

                                return (
                                    <View
                                        style={[
                                            styles.tableRow,
                                            borderBottomStyle,
                                            borderTopStyle,
                                        ]}
                                        key={rowIndex}
                                    >
                                        <View style={styles.fixedCell}>
                                            <Text>{etiqueta}</Text>
                                        </View>

                                        {Array.from({ length: registrosPorTabla }).map((_, regIndex) => {
                                            const registro = gruposTabla[0]?.[regIndex];
                                            const isLastColumn = regIndex === registrosPorTabla - 1;
                                            const valorIzq = obtenerValorIzquierdo(
                                                registro,
                                                etiqueta,
                                                rowIndex,
                                                fechaActualStr,
                                                fechaActual
                                            );
                                            const valorDer = obtenerValorDerecho(registro, etiqueta, rowIndex);

                                            const borderStyle = !isLastColumn
                                                ? (registro ? styles.recordBorderThick : styles.recordBorder)
                                                : null;

                                            return (
                                                <View
                                                    key={regIndex}
                                                    style={[
                                                        styles.recordContainer,
                                                        borderStyle,
                                                    ]}
                                                >
                                                    {esFilaNoDividida(rowIndex) ? (
                                                        <View
    style={rowIndex === 0 ? styles.productRowFull : styles.recordFull}
>
                                                            <Text style={rowIndex === 0 ? styles.productText : {}}>
                                                                {valorIzq}
                                                            </Text>
                                                        </View>
                                                    ) : esFilaCOST(rowIndex) ?(
    // Caso: fila C-O-S-T con 4 subceldas
    <View style={styles.recordQuad}>
        <View style={[styles.quadCell]}>
            <Text>{/* Check 1 */}</Text>
        </View>
        <View style={[styles.quadCell]}>
            <Text>{/* Check 2 */}</Text>
        </View>
        <View style={[styles.quadCell]}>
            <Text>{/* Check 3 */}</Text>
        </View>
        <View style={[styles.quadCell]}>
            <Text>{/* Check 4 */}</Text>
        </View>
        <View style={[styles.quadCell]}>
            <Text>{/* Check 1 */}</Text>
        </View>
        <View style={[styles.quadCell]}>
            <Text>{/* Check 2 */}</Text>
        </View>
        <View style={[styles.quadCell]}>
            <Text>{/* Check 3 */}</Text>
        </View>
        <View style={[styles.quadCell, styles.quadCellLast]}>
            <Text>{/* Check 4 */}</Text>
        </View>
    </View>
) : (
                                                        <View style={styles.recordSplit}>
                                                            {/* 🟦 Siempre con borde derecho, incluso en última columna */}
                                                            <View style={[styles.subCellLeft, styles.subCellLeftBorder]}>
                                                                <Text>{valorIzq}</Text>
                                                            </View>
                                                            <View style={styles.subCellRight}>
                                                                <Text>{valorDer}</Text>
                                                            </View>
                                                        </View>
                                                    )}
                                                </View>
                                            );
                                        })}
                                    </View>
                                );
                            })}
                        </View>

                        {/* ---------- TABLA 2 ---------- */}
                        {gruposTabla[1].length > 0 && (
                            <View style={styles.table}>
                                {ETIQUETAS_FIJAS.map((etiqueta, rowIndex) => {
                                    const borderBottomStyle = rowIndex !== ultimaFilaIndex
                                        ? styles.tableRowBorderBottom
                                        : null;
                                    const borderTopStyle = (rowIndex === 3 || rowIndex === 14)
                                        ? styles.tableRowFechaATop
                                        : null;

                                    return (
                                        <View
                                            style={[
                                                styles.tableRow,
                                                borderBottomStyle,
                                                borderTopStyle,
                                            ]}
                                            key={rowIndex}
                                        >
                                            <View style={styles.fixedCell}>
                                                <Text>{etiqueta}</Text>
                                            </View>

                                            {Array.from({ length: registrosPorTabla }).map((_, regIndex) => {
                                                const registro = gruposTabla[1]?.[regIndex];
                                                const isLastColumn = regIndex === registrosPorTabla - 1;
                                                const valorIzq = obtenerValorIzquierdo(
                                                    registro,
                                                    etiqueta,
                                                    rowIndex,
                                                    fechaActualStr,
                                                    fechaActual
                                                );
                                                const valorDer = obtenerValorDerecho(registro, etiqueta, rowIndex);

                                                const borderStyle = !isLastColumn
                                                    ? (registro ? styles.recordBorderThick : styles.recordBorder)
                                                    : null;

                                                return (
                                                    <View
                                                        key={regIndex}
                                                        style={[
                                                            styles.recordContainer,
                                                            borderStyle,
                                                        ]}
                                                    >
                                                        {esFilaNoDividida(rowIndex) ? (
                                                            <View
        style={rowIndex === 0 ? styles.productRowFull : styles.recordFull}
    >
                                                                <Text style={rowIndex === 0 ? styles.productText : {}}>
                                                                    {valorIzq}
                                                                </Text>
                                                            </View>
                                                        ) : esFilaCOST(rowIndex) ? (
                                                            <View style={styles.recordQuad}>
                                                                <View style={[styles.quadCell]}>
                                                                    <Text>{/* Check 1 */}</Text>
                                                                </View>
                                                                <View style={[styles.quadCell]}>
                                                                    <Text>{/* Check 2 */}</Text>
                                                                </View>
                                                                <View style={[styles.quadCell]}>
                                                                    <Text>{/* Check 3 */}</Text>
                                                                </View>
                                                                <View style={[styles.quadCell]}>
                                                                    <Text>{/* Check 4 */}</Text>
                                                                </View>
                                                                <View style={[styles.quadCell]}>
                                                                    <Text>{/* Check 1 */}</Text>
                                                                </View>
                                                                <View style={[styles.quadCell]}>
                                                                    <Text>{/* Check 2 */}</Text>
                                                                </View>
                                                                <View style={[styles.quadCell]}>
                                                                    <Text>{/* Check 3 */}</Text>
                                                                </View>
                                                                <View style={[styles.quadCell, styles.quadCellLast]}>
                                                                    <Text>{/* Check 4 */}</Text>
                                                                </View>
                                                            </View>
                                                        ) : (
                                                            <View style={styles.recordSplit}>
                                                                {/* 🟦 Siempre con borde derecho, incluso en última columna */}
                                                                <View style={[styles.subCellLeft, styles.subCellLeftBorder]}>
                                                                    <Text>{valorIzq}</Text>
                                                                </View>
                                                                <View style={styles.subCellRight}>
                                                                    <Text>{valorDer}</Text>
                                                                </View>
                                                            </View>
                                                        )}
                                                    </View>
                                                );
                                            })}
                                        </View>
                                    );
                                })}
                            </View>
                        )}

                        <Text style={styles.footer}>
                            Total de registros: {datos.length} - Página {paginaIndex + 1} de {paginas.length} - {fechaActualStr}
                        </Text>
                    </Page>
                );
            })}
        </Document>
    );
}
