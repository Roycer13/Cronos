import React, { useState, useEffect } from 'react';
import AppLayout from '@/layouts/app-layout';
import { Head, Link, usePage } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
    Download,
    Printer,
    ArrowLeft,
    Calendar,
    User,
    Package,
    Hash,
    Building,
    Scale,
    Thermometer,
    Droplets,
    Beaker,
    Users,
    Clock,
    AlertCircle,
    BarChart3,
    CheckCircle,
    XCircle,
    FlaskConical,
    Weight,
    Droplet,
    Zap,
    Activity,
    Eye,
    List,
    TrendingUp,
    Filter
} from 'lucide-react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { PDFViewer } from '@react-pdf/renderer';
import { route } from 'ziggy-js';
import ReporteOrpHtst from '@/pdf/ReporteOrpHtst';
import ReporteOrpUht from '@/pdf/ReporteOrpUht';

interface PageProps {
    orp: any;
    resultados_agrupados: Record<string, any[]>;
    usuarios_involucrados: any[];
    cantidad_total: number;
    preparaciones_procesadas: string[];
    analisis_por_etapa: Record<string, any[]>;
    tiempos_por_etapa: Record<string, any>;
    observaciones: string;

    analisis_cronologico: Record<string, any[]>;
    origenes_utilizados: any[];
    resumen_preparaciones: Record<string, any>;
    ultimos_analisis_agrupados: Record<string, any[]>;
    estadisticas_analisis: any;
}

export default function OrpReporte() {
    const { props } = usePage() || ({} as any);
    const {
        orp = {},
        resultados_agrupados = {},
        usuarios_involucrados = [],
        cantidad_total = 0,
        preparaciones_procesadas = [],
        analisis_por_etapa = {},
        tiempos_por_etapa = {},
        observaciones = '',
        // Nuevos datos
        analisis_cronologico = {},
        origenes_utilizados = [],
        resumen_preparaciones = {},
        ultimos_analisis_agrupados = {},
        estadisticas_analisis = {}
    } = props as unknown as PageProps;

    const [activeTab, setActiveTab] = useState('general');
    const [debugMode, setDebugMode] = useState(false);
    const [mostrarDatosCrudos, setMostrarDatosCrudos] = useState(false);
    const [accordionOpen, setAccordionOpen] = useState<Record<string, boolean>>({});
    const [datosHtst, setDatosHtst] = useState<any>(null);
    const [datosUht, setDatosUht] = useState<any>(null);
    const [mostrarPdfHtst, setMostrarPdfHtst] = useState(false);
    const [mostrarPdfUht, setMostrarPdfUht] = useState(false);
    const [generandoPdfHtst, setGenerandoPdfHtst] = useState(false);
    const [generandoPdfUht, setGenerandoPdfUht] = useState(false);

    const toggleAccordion = (key: string) => {
        setAccordionOpen(prev => ({
            ...prev,
            [key]: !prev[key]
        }));
    };

    // Depuración
    useEffect(() => {
        console.log('🔍 Datos del reporte:', {
            orp,
            resultadosAgrupados: resultados_agrupados,
            preparaciones: preparaciones_procesadas,
            usuarios: usuarios_involucrados,
            analisis: analisis_por_etapa,
            tiempos: tiempos_por_etapa
        });

        // Si hay resultados agrupados, mostrar el primer detalle
        if (Object.keys(resultados_agrupados).length > 0) {
            const primeraPreparacion = Object.keys(resultados_agrupados)[0];
            if (resultados_agrupados[primeraPreparacion]?.length > 0) {
                const primerDetalle = resultados_agrupados[primeraPreparacion][0];
                console.log('📋 Primer detalle:', primerDetalle);
                console.log('🏭 EstadoPlanta del primer detalle:', primerDetalle?.estadoPlanta);
            }
        }
    }, []);

    // Generar PDF HTST (Últimos análisis)
    const handleGenerarPdfHtst = async () => {
        setGenerandoPdfHtst(true);
        try {
            const response = await fetch(route('orps.reporte.htst-json', orp.id));
            if (!response.ok) throw new Error('Error al obtener datos');

            const data = await response.json();
            setDatosHtst(data);
            setMostrarPdfHtst(true);
        } catch (error) {
            console.error('Error generando PDF HTST:', error);
            alert('Error al generar reporte HTST');
        } finally {
            setGenerandoPdfHtst(false);
        }
    };

    // Generar PDF UHT (Análisis por etapa)
    const handleGenerarPdfUht = async () => {
        setGenerandoPdfUht(true);
        try {
            const response = await fetch(route('orps.reporte.uht-json', orp.id));
            if (!response.ok) throw new Error('Error al obtener datos');

            const data = await response.json();
            setDatosUht(data);
            setMostrarPdfUht(true);
        } catch (error) {
            console.error('Error generando PDF UHT:', error);
            alert('Error al generar reporte UHT');
        } finally {
            setGenerandoPdfUht(false);
        }
    };

    const getEstadoColor = (estado: string) => {
        switch (estado) {
            case 'completado': return 'bg-green-100 text-green-800 border-green-200';
            case 'en_proceso': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
            case 'pendiente': return 'bg-gray-100 text-gray-800 border-gray-200';
            default: return 'bg-gray-100 text-gray-800 border-gray-200';
        }
    };
    const formatFecha = (fecha: string) => {
        if (!fecha) return 'N/A';
        try {
            return format(new Date(fecha), 'dd/MM/yyyy HH:mm', { locale: es });
        } catch (e) {
            console.error('Error formateando fecha:', fecha, e);
            return 'Fecha inválida';
        }
    };


    const formatDuracion = (minutos: number) => {
        if (!minutos || minutos === 0) return '0 min';

        const minutosAbs = Math.abs(minutos);
        const horas = Math.floor(minutosAbs / 60);
        const mins = minutosAbs % 60;

        if (horas > 0) {
            return `${horas}h ${mins}min`;
        }
        return `${mins} min`;
    };

    const getPrioridadColor = (prioridad: string) => {
        if (!prioridad) return 'bg-gray-100 text-gray-800';

        switch (prioridad.toLowerCase()) {
            case 'alta': return 'bg-red-100 text-red-800';
            case 'urgente': return 'bg-purple-100 text-purple-800';
            case 'media': return 'bg-yellow-100 text-yellow-800';
            case 'baja': return 'bg-green-100 text-green-800';
            default: return 'bg-gray-100 text-gray-800';
        }
    };

    const getNombreCompleto = (persona: any) => {
        if (!persona) return 'N/A';
        return `${persona.nombre || persona.name || ''} ${persona.apellido || ''}`.trim() || 'Sin nombre';
    };

    const getIniciales = (persona: any) => {
        if (!persona) return 'NA';
        const nombre = persona.nombre || persona.name || '';
        const apellido = persona.apellido || '';
        return `${nombre.charAt(0)}${apellido.charAt(0)}`.toUpperCase();
    };

    const renderAnalisisCompleto = (analisis: any) => {
        if (!analisis) return null;

        return (
            <div className="p-3 border rounded-lg bg-blue-50 dark:bg-blue-900/20 mt-3">
                <h5 className="font-medium mb-2 text-blue-700 dark:text-blue-300">
                    Análisis de Calidad
                </h5>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
                    {analisis.temperatura && (
                        <div className="flex items-center gap-1">
                            <Thermometer className="h-3 w-3" />
                            <span className="text-xs">{analisis.temperatura}°C</span>
                        </div>
                    )}
                    {analisis.ph && (
                        <div className="flex items-center gap-1">
                            <Droplet className="h-3 w-3" />
                            <span className="text-xs">pH: {analisis.ph}</span>
                        </div>
                    )}
                    {analisis.acidez && (
                        <div className="flex items-center gap-1">
                            <FlaskConical className="h-3 w-3" />
                            <span className="text-xs">{analisis.acidez}%</span>
                        </div>
                    )}
                    {analisis.brix && (
                        <div className="flex items-center gap-1">
                            <span className="text-xs">°Bx: {analisis.brix}</span>
                        </div>
                    )}
                    {analisis.peso && (
                        <div className="flex items-center gap-1">
                            <Weight className="h-3 w-3" />
                            <span className="text-xs">{analisis.peso}g</span>
                        </div>
                    )}
                    {analisis.volumen && (
                        <div className="flex items-center gap-1">
                            <span className="text-xs">{analisis.volumen}ml</span>
                        </div>
                    )}
                    {analisis.tempUHT && (
                        <div className="flex items-center gap-1">
                            <Zap className="h-3 w-3" />
                            <span className="text-xs">UHT: {analisis.tempUHT}°C</span>
                        </div>
                    )}
                </div>

                {(analisis.analista || analisis.solicitante) && (
                    <div className="mt-2 space-y-1 text-xs text-gray-600">
                        {analisis.analista && (
                            <div>Analista: {getNombreCompleto(analisis.analista)}</div>
                        )}
                        {analisis.solicitante && (
                            <div>Solicitante: {getNombreCompleto(analisis.solicitante)}</div>
                        )}
                    </div>
                )}
            </div>
        );
    };

    const renderProcesoDetalle = (detalle: any, index: number) => {
        console.log('🔍 Detalle completo:', detalle);
        console.log('🏭 EstadoPlanta:', detalle?.estadoPlanta);
        console.log('📊 Análisis disponible:', detalle?.estadoPlanta?.analisis_linea);
        console.log('🏷️ Etapa:', detalle?.estadoPlanta?.etapa);
        console.log('📍 Origen:', detalle?.estadoPlanta?.origen);

        const estadoPlanta = detalle?.estadoPlanta;
        const analisis = estadoPlanta?.analisis_linea;

        return (
            <div key={detalle?.id || index} className="p-4 border rounded-lg mb-4">
                {/* Encabezado del proceso */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3">
                    <div>
                        <h4 className="font-semibold text-lg">
                            {estadoPlanta?.etapa?.nombre || 'Etapa no especificada'}
                        </h4>
                        <p className="text-sm text-muted-foreground">
                            Origen: {estadoPlanta?.origen?.alias || 'Sin origen'}
                        </p>
                    </div>
                    <div className="flex flex-col sm:items-end gap-1">
                        <div className="text-sm flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            {formatFecha(estadoPlanta?.tiempo)}
                        </div>
                        <div className="text-sm flex items-center gap-1">
                            <User className="h-3 w-3" />
                            {getNombreCompleto(estadoPlanta?.user)}
                        </div>
                    </div>
                </div>

                {/* Información del detalle */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm mb-3">
                    <div>
                        <span className="text-muted-foreground">Preparación:</span>
                        <span className="font-medium ml-2">{detalle?.preparacion || 'N/A'}</span>
                    </div>
                    <div>
                        <span className="text-muted-foreground">Cantidad:</span>
                        <span className="font-medium ml-2">{detalle?.cantidad || 0}</span>
                    </div>
                </div>

                {/* Análisis si existe */}
                {analisis && renderAnalisisCompleto(analisis)}

                {/* Modo depuración: mostrar datos crudos */}
                {(debugMode && mostrarDatosCrudos) && (
                    <div className="mt-4 p-3 bg-gray-100 rounded text-xs">
                        <h6 className="font-bold mb-2">📊 Datos Crudos:</h6>
                        <pre className="whitespace-pre-wrap break-words">
                            {JSON.stringify({
                                detalle_id: detalle?.id,
                                preparacion: detalle?.preparacion,
                                cantidad: detalle?.cantidad,
                                estado_planta_id: detalle?.estado_planta_id,
                                estadoPlanta: {
                                    id: estadoPlanta?.id,
                                    etapa_id: estadoPlanta?.etapa_id,
                                    etapa: estadoPlanta?.etapa,
                                    origen_id: estadoPlanta?.origen_id,
                                    origen: estadoPlanta?.origen,
                                    user_id: estadoPlanta?.user_id,
                                    user: estadoPlanta?.user,
                                    tiempo: estadoPlanta?.tiempo,
                                },
                                analisisLinea: analisis
                            }, null, 2)}
                        </pre>
                    </div>
                )}
            </div>
        );
    };

    const renderTarjetaAnalisis = (analisisItem: any) => {
        const { preparacion, origen, etapa, analisis, estado_planta } = analisisItem;

        return (
            <Card key={`${preparacion}-${origen}-${etapa}`} className="border hover:border-blue-300 transition-colors">
                <CardHeader className="pb-3">
                    <div className="flex justify-between items-start">
                        <div>
                            <CardTitle className="text-sm font-medium">{etapa}</CardTitle>
                            <CardDescription className="text-xs">
                                {origen} • Prep: {preparacion}
                            </CardDescription>
                        </div>
                        <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                            Último análisis
                        </Badge>
                    </div>
                </CardHeader>
                <CardContent className="space-y-4">
                    {/* Información del proceso */}
                    <div className="grid grid-cols-2 gap-2 text-sm">
                        <div>
                            <div className="text-xs text-muted-foreground">Registro</div>
                            <div className="font-medium">{formatFecha(estado_planta?.tiempo)}</div>
                        </div>
                        <div>
                            <div className="text-xs text-muted-foreground">Operario</div>
                            <div className="font-medium">
                                {getNombreCompleto(estado_planta?.user)}
                            </div>
                        </div>
                    </div>

                    {/* Información del análisis */}
                    <div className="border-t pt-3">
                        <div className="flex items-center gap-2 mb-2">
                            <FlaskConical className="h-4 w-4 text-blue-600" />
                            <span className="text-sm font-medium">Resultados del análisis</span>
                        </div>
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-2 text-sm">
                            {analisis.temperatura && (
                                <div className="flex items-center gap-1">
                                    <Thermometer className="h-3 w-3" />
                                    <span>{analisis.temperatura}°C</span>
                                </div>
                            )}
                            {analisis.ph && (
                                <div className="flex items-center gap-1">
                                    <Droplet className="h-3 w-3" />
                                    <span>pH: {analisis.ph}</span>
                                </div>
                            )}
                            {analisis.acidez && (
                                <div className="flex items-center gap-1">
                                    <FlaskConical className="h-3 w-3" />
                                    <span>{analisis.acidez}%</span>
                                </div>
                            )}
                            {analisis.brix && (
                                <div className="flex items-center gap-1">
                                    <span>°Bx: {analisis.brix}</span>
                                </div>
                            )}
                            {analisis.viscosidad && (
                                <div className="flex items-center gap-1">
                                    <span>Visc: {analisis.viscosidad}</span>
                                </div>
                            )}
                            {analisis.peso && (
                                <div className="flex items-center gap-1">
                                    <Weight className="h-3 w-3" />
                                    <span>{analisis.peso}g</span>
                                </div>
                            )}
                            {analisis.tempUHT && (
                                <div className="flex items-center gap-1">
                                    <Zap className="h-3 w-3" />
                                    <span>UHT: {analisis.tempUHT}°C</span>
                                </div>
                            )}
                        </div>

                        {/* Análisis sensorial */}
                        {(analisis.color || analisis.olor || analisis.sabor) && (
                            <div className="mt-2 pt-2 border-t">
                                <div className="text-xs text-muted-foreground mb-1">Análisis Sensorial</div>
                                <div className="flex gap-2">
                                    {analisis.color && (
                                        <Badge variant="outline" className="bg-green-50">
                                            Color OK
                                        </Badge>
                                    )}
                                    {analisis.olor && (
                                        <Badge variant="outline" className="bg-blue-50">
                                            Olor OK
                                        </Badge>
                                    )}
                                    {analisis.sabor && (
                                        <Badge variant="outline" className="bg-purple-50">
                                            Sabor OK
                                        </Badge>
                                    )}
                                </div>
                            </div>
                        )}

                        {/* Personal */}
                        <div className="mt-3 pt-2 border-t text-xs">
                            <div className="grid grid-cols-2 gap-2">
                                {analisis.solicitante && (
                                    <div>
                                        <div className="text-muted-foreground">Solicitante</div>
                                        <div className="font-medium">
                                            {getIniciales(analisis.solicitante)}
                                        </div>
                                    </div>
                                )}
                                {analisis.analista && (
                                    <div>
                                        <div className="text-muted-foreground">Analista</div>
                                        <div className="font-medium">
                                            {getIniciales(analisis.analista)}
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Tiempos */}
                        <div className="mt-2 text-xs text-muted-foreground">
                            <div className="flex justify-between">
                                <span>Solicitud: {formatFecha(analisis.tiempo_solicitud)}</span>
                                <span>Análisis: {formatFecha(analisis.tiempo_analisis)}</span>
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>
        );
    };

    // Renderizar la línea de tiempo (timeline)
    const renderTimeline = (preparacion: string, etapas: any) => {
        const etapasArray = Object.values(etapas);

        return (
            <div className="relative">
                {/* Línea vertical */}
                <div className="absolute left-6 top-0 bottom-0 w-0.5 bg-gray-200"></div>

                {etapasArray.map((etapa: any, index: number) => (
                    <div key={index} className="relative flex items-start mb-8 last:mb-0">
                        {/* Punto en la línea */}
                        <div className={`relative z-10 flex items-center justify-center w-12 h-12 rounded-full border-4 border-white
                            ${etapa.estado === 'completado' ? 'bg-green-500' :
                                etapa.estado === 'en_proceso' ? 'bg-yellow-500' :
                                    'bg-gray-300'}`}>
                            <span className="text-white font-semibold text-sm">
                                {etapa.nombre.charAt(0).toUpperCase()}
                            </span>
                        </div>

                        {/* Contenido de la etapa */}
                        <div className="ml-6 flex-1">
                            <div className="flex items-center justify-between mb-2">
                                <h4 className="font-medium text-lg">{etapa.nombre}</h4>
                                <Badge className={getEstadoColor(etapa.estado)}>
                                    {etapa.estado === 'completado' ? 'Completado' :
                                        etapa.estado === 'en_proceso' ? 'En Proceso' :
                                            'Pendiente'}
                                </Badge>
                            </div>

                            {/* Detalles de la etapa */}
                            <div className="space-y-2">
                                {etapa.detalles.map((detalle: any, idx: number) => (
                                    <div key={idx} className="p-3 border rounded-lg bg-gray-50">
                                        <div className="flex justify-between text-sm">
                                            <span className="font-medium">Origen: {detalle.origen}</span>
                                            <span>{formatFecha(detalle.tiempo)}</span>
                                        </div>
                                        {detalle.analisis && (
                                            <div className="mt-1 text-sm">
                                                <Badge variant="outline" className="bg-blue-50">
                                                    Con análisis
                                                </Badge>
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        );
    };

    return (
        <AppLayout>
            <Head title={`Reporte ORP - ${orp.codigo || 'N/A'}`} />

            <div className="px-4 sm:px-6 py-6 space-y-6">
                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="flex items-center gap-4">
                        <Link href={route('orps.index')}>
                            <Button variant="outline" size="sm">
                                <ArrowLeft className="h-4 w-4 mr-2" />
                                Volver
                            </Button>
                        </Link>
                        <div>
                            <h1 className="text-2xl font-bold">Reporte de Producción</h1>
                            <p className="text-muted-foreground">
                                ORP: {orp.codigo || 'N/A'} | Producto: {orp.producto_terminado?.nombre_sap || 'N/A'}
                            </p>
                        </div>
                    </div>

                    <div className="flex items-center gap-2">
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setDebugMode(!debugMode)}
                            className="flex items-center gap-2"
                        >
                            {debugMode ? <CheckCircle className="h-4 w-4" /> : <AlertCircle className="h-4 w-4" />}
                            {debugMode ? 'Debug ON' : 'Debug'}
                        </Button>

                        {debugMode && (
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setMostrarDatosCrudos(!mostrarDatosCrudos)}
                                className="flex items-center gap-2"
                            >
                                <Eye className="h-4 w-4" />
                                {mostrarDatosCrudos ? 'Ocultar datos' : 'Ver datos'}
                            </Button>
                        )}

                        <Link
                            href={`/debug-detalles/orp/${orp.id}`}
                            target="_blank"
                        >
                            <Button
                                variant="outline"
                                size="sm"
                            >
                                <Activity className="h-4 w-4 mr-2" />
                                Debug Detalles
                            </Button>
                        </Link>

                        <Button
                            variant="default"
                            size="sm"
                            onClick={handleGenerarPdfHtst}
                            className="flex items-center gap-2"
                            disabled={generandoPdfHtst}
                        >
                            <Download className="h-4 w-4" />
                            {generandoPdfHtst ? 'HTST...' : 'PDF HTST'}
                        </Button>

                        <Button
                            variant="default"
                            size="sm"
                            onClick={handleGenerarPdfUht}
                            className="flex items-center gap-2"
                            disabled={generandoPdfUht}
                        >
                            <Download className="h-4 w-4" />
                            {generandoPdfUht ? 'UHT...' : 'PDF UHT'}
                        </Button>
                    </div>
                </div>

                {/* Modo Debug */}
                {debugMode && (
                    <Card className="border-yellow-200 bg-yellow-50">
                        <CardHeader className="pb-3">
                            <CardTitle className="text-yellow-800 text-sm flex items-center gap-2">
                                <AlertCircle className="h-4 w-4" />
                                Información de Depuración
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="text-sm space-y-2">
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                <div>
                                    <div className="font-semibold">Preparaciones:</div>
                                    <div>{preparaciones_procesadas.length}</div>
                                </div>
                                <div>
                                    <div className="font-semibold">Procesos:</div>
                                    <div>{Object.keys(resultados_agrupados).length}</div>
                                </div>
                                <div>
                                    <div className="font-semibold">Usuarios:</div>
                                    <div>{usuarios_involucrados.length}</div>
                                </div>
                                <div>
                                    <div className="font-semibold">Total Producido:</div>
                                    <div>{cantidad_total}</div>
                                </div>
                            </div>

                            {Object.keys(resultados_agrupados).length > 0 && (
                                <div className="mt-4">
                                    <div className="font-semibold mb-1">Estructura de datos:</div>
                                    <div className="text-xs">
                                        <p>Primera preparación: {Object.keys(resultados_agrupados)[0]}</p>
                                        <p>Detalles en primera preparación: {resultados_agrupados[Object.keys(resultados_agrupados)[0]]?.length || 0}</p>
                                    </div>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                )}

                {/* Resumen de datos */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-sm font-medium flex items-center gap-2">
                                <Package className="h-4 w-4" />
                                Producto
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="font-bold text-lg">
                                {orp.producto_terminado?.nombre_sap || 'Sin producto'}
                            </div>
                            {orp.producto_terminado?.codigo_sap && (
                                <div className="text-xs text-muted-foreground mt-1">
                                    SAP: {orp.producto_terminado.codigo_sap}
                                </div>
                            )}
                            <div className="font-semibold text-sm truncate">
                                {orp.producto_terminado.linea?.nombre || 'Sin linea'}
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle className="text-sm font-medium flex items-center gap-2">
                                <Hash className="h-4 w-4" />
                                Cantidades
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-2">
                                <div className="flex justify-between">
                                    <span className="text-sm">Programado:</span>
                                    <span className="font-semibold">{orp.cantidad_programada?.toLocaleString() || 0}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-sm">Producido:</span>
                                    <span className="font-semibold">{cantidad_total.toLocaleString()}</span>
                                </div>
                                {orp.unidad && (
                                    <div className="text-xs text-muted-foreground">
                                        Unidad: {orp.unidad.nombre}
                                    </div>
                                )}
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle className="text-sm font-medium flex items-center gap-2">
                                <Building className="h-4 w-4" />
                                Ubicación
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="font-semibold">{orp.ubicacion?.nombre || 'Sin ubicación'}</div>
                            {orp.prioridad && (
                                <Badge className={`mt-2 ${getPrioridadColor(orp.prioridad)}`}>
                                    {orp.prioridad.toUpperCase()}
                                </Badge>
                            )}
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle className="text-sm font-medium flex items-center gap-2">
                                <Calendar className="h-4 w-4" />
                                Fechas
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-1">
                            <div className="text-sm">
                                <span className="font-medium">Creación:</span>{' '}
                                {formatFecha(orp.fecha_creacion)}
                            </div>
                            {orp.fecha_vencimiento1 && (
                                <div className="text-sm">
                                    <span className="font-medium">Vencimiento:</span>{' '}
                                    {formatFecha(orp.fecha_vencimiento1)}
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>

                {/* Tabs principales */}
                <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
                    <TabsList className="w-full grid grid-cols-2 md:grid-cols-8">
                        <TabsTrigger value="general" className="flex items-center gap-2">
                            <Package className="h-4 w-4" />
                            <span className="hidden sm:inline">General</span>
                        </TabsTrigger>
                        <TabsTrigger value="procesos" className="flex items-center gap-2">
                            <BarChart3 className="h-4 w-4" />
                            <span className="hidden sm:inline">Procesos</span>
                        </TabsTrigger>
                        <TabsTrigger value="analisis" className="flex items-center gap-2">
                            <Beaker className="h-4 w-4" />
                            <span className="hidden sm:inline">Análisis</span>
                        </TabsTrigger>
                        <TabsTrigger value="ultimos" className="flex items-center gap-2">
                            <CheckCircle className="h-4 w-4" />
                            <span className="hidden sm:inline">Últimos</span>
                        </TabsTrigger>
                        <TabsTrigger value="cronologico" className="flex items-center gap-2">
                            <Clock className="h-4 w-4" />
                            <span className="hidden sm:inline">Cronológico</span>
                        </TabsTrigger>
                        <TabsTrigger value="origenes" className="flex items-center gap-2">
                            <Building className="h-4 w-4" />
                            <span className="hidden sm:inline">Orígenes</span>
                        </TabsTrigger>
                        <TabsTrigger value="resumen" className="flex items-center gap-2">
                            <List className="h-4 w-4" />
                            <span className="hidden sm:inline">Resumen</span>
                        </TabsTrigger>
                        <TabsTrigger value="timeline" className="flex items-center gap-2">
                            <Activity className="h-4 w-4" />
                            <span className="hidden sm:inline">Timeline</span>
                        </TabsTrigger>
                    </TabsList>


                    {/* Tab General */}
                    <TabsContent value="general" className="space-y-4">
                        <Card>
                            <CardHeader>
                                <CardTitle>Información de la ORP</CardTitle>
                                <CardDescription>
                                    Datos generales de la orden de producción
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-4">
                                    <div>
                                        <h4 className="font-semibold mb-2">Preparaciones ({preparaciones_procesadas.length})</h4>
                                        {preparaciones_procesadas.length > 0 ? (
                                            <div className="flex flex-wrap gap-2">
                                                {preparaciones_procesadas.map((prep, idx) => (
                                                    <Badge key={idx} variant="secondary">
                                                        {prep}
                                                    </Badge>
                                                ))}
                                            </div>
                                        ) : (
                                            <p className="text-muted-foreground">No hay preparaciones registradas</p>
                                        )}
                                    </div>

                                    {observaciones && (
                                        <div>
                                            <h4 className="font-semibold mb-2">Observaciones</h4>
                                            <div className="p-3 bg-amber-50 border border-amber-200 rounded">
                                                <p className="text-sm whitespace-pre-line">{observaciones}</p>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </CardContent>
                        </Card>
                    </TabsContent>

                    {/* Tab Procesos */}
                    <TabsContent value="procesos" className="space-y-4">
                        {Object.keys(resultados_agrupados).length > 0 ? (
                            Object.entries(resultados_agrupados).map(([preparacion, detalles]) => (
                                <Card key={preparacion}>
                                    <CardHeader>
                                        <div className="flex items-center justify-between">
                                            <CardTitle>Preparación: {preparacion}</CardTitle>
                                            <Badge>{detalles.length} procesos</Badge>
                                        </div>
                                    </CardHeader>
                                    <CardContent>
                                        {detalles.map((detalle, index) => renderProcesoDetalle(detalle, index))}
                                    </CardContent>
                                </Card>
                            ))
                        ) : (
                            <Card>
                                <CardContent className="py-8 text-center">
                                    <BarChart3 className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                                    <h3 className="text-lg font-medium mb-2">No hay procesos registrados</h3>
                                    <p className="text-muted-foreground">
                                        Esta ORP no tiene procesos registrados en el sistema.
                                    </p>
                                </CardContent>
                            </Card>
                        )}
                    </TabsContent>

                    {/* Tab Análisis */}
                    <TabsContent value="analisis">
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <Beaker className="h-5 w-5" />
                                    Análisis de Calidad
                                </CardTitle>
                                <CardDescription>
                                    Resultados de análisis por etapa de producción
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                {Object.keys(analisis_por_etapa).length > 0 ? (
                                    Object.entries(analisis_por_etapa).map(([etapa, analisisList]) => (
                                        <div key={etapa} className="mb-6 last:mb-0">
                                            <h3 className="font-semibold text-lg mb-4 pb-2 border-b">{etapa}</h3>
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                                {analisisList.map((analisis, idx) => (
                                                    <Card key={idx} className="border">
                                                        <CardContent className="p-4">
                                                            {renderAnalisisCompleto(analisis)}
                                                        </CardContent>
                                                    </Card>
                                                ))}
                                            </div>
                                        </div>
                                    ))
                                ) : (
                                    <div className="text-center py-8">
                                        <Beaker className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                                        <p className="text-muted-foreground">No hay análisis registrados</p>
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </TabsContent>

                    {/* Tab Usuarios */}
                    <TabsContent value="usuarios">
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <Users className="h-5 w-5" />
                                    Personal Involucrado ({usuarios_involucrados.length})
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                {usuarios_involucrados.length > 0 ? (
                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                        {usuarios_involucrados.map((usuario) => (
                                            <div key={usuario.id} className="p-4 border rounded-lg hover:bg-muted/50 transition-colors">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                                                        <span className="font-semibold text-primary">
                                                            {usuario.iniciales || 'NA'}
                                                        </span>
                                                    </div>
                                                    <div>
                                                        <h4 className="font-medium">
                                                            {usuario.nombre} {usuario.apellido}
                                                        </h4>
                                                        <p className="text-sm text-muted-foreground">
                                                            {usuario.email}
                                                        </p>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="text-center py-8">
                                        <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                                        <p className="text-muted-foreground">No hay usuarios registrados</p>
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </TabsContent>

                    {/* Tab Tiempos */}
                    <TabsContent value="tiempos">
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <Clock className="h-5 w-5" />
                                    Tiempos por Etapa
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                {Object.keys(tiempos_por_etapa).length > 0 ? (
                                    <div className="space-y-4">
                                        {Object.values(tiempos_por_etapa).map((datos, idx) => (
                                            <div key={idx} className="p-4 border rounded-lg">
                                                <div className="flex items-center justify-between mb-3">
                                                    <h4 className="font-semibold">{datos.nombre}</h4>
                                                    <Badge variant="outline">
                                                        {formatDuracion(datos.duracion_minutos || 0)}
                                                    </Badge>
                                                </div>
                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                                                    <div>
                                                        <div className="text-muted-foreground">Inicio</div>
                                                        <div className="font-medium">{formatFecha(datos.inicio)}</div>
                                                    </div>
                                                    <div>
                                                        <div className="text-muted-foreground">Fin</div>
                                                        <div className="font-medium">{formatFecha(datos.fin)}</div>
                                                    </div>
                                                </div>
                                                <div className="mt-2 text-xs text-muted-foreground">
                                                    {datos.registros || 0} registros
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="text-center py-8">
                                        <Clock className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                                        <p className="text-muted-foreground">No hay datos de tiempos</p>
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </TabsContent>

                    <TabsContent value="cronologico" className="space-y-4">
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <Clock className="h-5 w-5" />
                                    Análisis Cronológico
                                </CardTitle>
                                <CardDescription>
                                    Registro de análisis ordenados por tiempo de solicitud
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                {Object.keys(analisis_cronologico).length > 0 ? (
                                    Object.entries(analisis_cronologico).map(([preparacion, analisisList]) => (
                                        <div key={preparacion} className="mb-8 last:mb-0">
                                            <h3 className="font-semibold text-lg mb-4 pb-2 border-b">
                                                Preparación: {preparacion}
                                            </h3>
                                            <div className="overflow-x-auto">
                                                <table className="w-full border-collapse text-sm">
                                                    <thead>
                                                        <tr className="border-b">
                                                            <th className="px-3 py-2 text-left">Origen</th>
                                                            <th className="px-3 py-2 text-left">Etapa</th>
                                                            <th className="px-3 py-2 text-left">Hora Solicitud</th>
                                                            <th className="px-3 py-2 text-left">Hora Respuesta</th>
                                                            <th className="px-3 py-2 text-left">Temp (°C)</th>
                                                            <th className="px-3 py-2 text-left">pH</th>
                                                            <th className="px-3 py-2 text-left">Acidez (%)</th>
                                                            <th className="px-3 py-2 text-left">°Brix</th>
                                                            <th className="px-3 py-2 text-left">Viscosidad</th>
                                                            <th className="px-3 py-2 text-left">Peso</th>
                                                            <th className="px-3 py-2 text-left">Solicitante</th>
                                                            <th className="px-3 py-2 text-left">Analista</th>
                                                        </tr>
                                                    </thead>
                                                    <tbody>
                                                        {analisisList.map((analisis: any, idx: number) => (
                                                            <tr key={idx} className="border-b hover:bg-gray-50">
                                                                <td className="px-3 py-2">{analisis.origen}</td>
                                                                <td className="px-3 py-2">{analisis.etapa}</td>
                                                                <td className="px-3 py-2">{formatFecha(analisis.hora_solicitud)}</td>
                                                                <td className="px-3 py-2">
                                                                    {analisis.hora_respuesta ? formatFecha(analisis.hora_respuesta) : '-'}
                                                                </td>
                                                                <td className="px-3 py-2">{analisis.temperatura || '-'}</td>
                                                                <td className="px-3 py-2">{analisis.ph || '-'}</td>
                                                                <td className="px-3 py-2">{analisis.acidez || '-'}</td>
                                                                <td className="px-3 py-2">{analisis.brix || '-'}</td>
                                                                <td className="px-3 py-2">{analisis.viscosidad || '-'}</td>
                                                                <td className="px-3 py-2">{analisis.peso || '-'}</td>
                                                                <td className="px-3 py-2">
                                                                    {analisis.solicitante
                                                                        ? `${analisis.solicitante.nombre} ${analisis.solicitante.apellido}`
                                                                        : '-'}
                                                                </td>
                                                                <td className="px-3 py-2">
                                                                    {analisis.analista
                                                                        ? `${analisis.analista.nombre} ${analisis.analista.apellido}`
                                                                        : '-'}
                                                                </td>
                                                            </tr>
                                                        ))}
                                                    </tbody>
                                                </table>
                                            </div>
                                        </div>
                                    ))
                                ) : (
                                    <div className="text-center py-8">
                                        <Clock className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                                        <p className="text-muted-foreground">No hay análisis cronológicos registrados</p>
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </TabsContent>

                    {/* NUEVO TAB: Orígenes */}
                    <TabsContent value="origenes" className="space-y-4">
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <Building className="h-5 w-5" />
                                    Orígenes Utilizados
                                </CardTitle>
                                <CardDescription>
                                    Tanques y equipos utilizados en esta producción
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                {origenes_utilizados.length > 0 ? (
                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                        {origenes_utilizados.map((origen: any) => (
                                            <Card key={origen.id} className="border">
                                                <CardHeader>
                                                    <CardTitle className="text-sm font-medium">
                                                        {origen.alias}
                                                    </CardTitle>
                                                </CardHeader>
                                                <CardContent>
                                                    <p className="text-sm text-muted-foreground">
                                                        {origen.descripcion}
                                                    </p>
                                                    <div className="mt-2 text-xs text-gray-500">
                                                        ID: {origen.id}
                                                    </div>
                                                </CardContent>
                                            </Card>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="text-center py-8">
                                        <Building className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                                        <p className="text-muted-foreground">No hay orígenes registrados</p>
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </TabsContent>

                    {/* NUEVO TAB: Resumen */}
                    <TabsContent value="resumen" className="space-y-4">
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <CheckCircle className="h-5 w-5" />
                                    Resumen por Preparación
                                </CardTitle>
                                <CardDescription>
                                    Estado de cada etapa por preparación
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                {Object.keys(resumen_preparaciones).length > 0 ? (
                                    <div className="space-y-6">
                                        {Object.entries(resumen_preparaciones).map(([preparacion, etapas]: [string, any]) => (
                                            <Card key={preparacion} className="border">
                                                <CardHeader>
                                                    <div className="flex items-center justify-between">
                                                        <CardTitle className="text-lg">
                                                            Preparación: {preparacion}
                                                        </CardTitle>
                                                        <Button
                                                            variant="ghost"
                                                            size="sm"
                                                            onClick={() => toggleAccordion(preparacion)}
                                                        >
                                                            {accordionOpen[preparacion] ? 'Ocultar' : 'Mostrar'} detalles
                                                        </Button>
                                                    </div>
                                                </CardHeader>

                                                {accordionOpen[preparacion] && (
                                                    <CardContent>
                                                        <div className="space-y-4">
                                                            {Object.entries(etapas).map(([etapaId, etapaData]: [string, any]) => (
                                                                <div key={etapaId} className={`p-4 border rounded-lg ${getEstadoColor(etapaData.estado)}`}>
                                                                    <div className="flex items-center justify-between mb-2">
                                                                        <h4 className="font-semibold">{etapaData.nombre}</h4>
                                                                        <Badge className={
                                                                            etapaData.estado === 'completado' ? 'bg-green-200 text-green-800' :
                                                                                etapaData.estado === 'en_proceso' ? 'bg-yellow-200 text-yellow-800' :
                                                                                    'bg-gray-200 text-gray-800'
                                                                        }>
                                                                            {etapaData.estado === 'completado' ? '✓ Completado' :
                                                                                etapaData.estado === 'en_proceso' ? '⏳ En Proceso' :
                                                                                    '⏳ Pendiente'}
                                                                        </Badge>
                                                                    </div>
                                                                    <div className="space-y-2">
                                                                        {etapaData.detalles.map((detalle: any, idx: number) => (
                                                                            <div key={idx} className="p-3 bg-white/50 rounded border">
                                                                                <div className="flex justify-between text-sm">
                                                                                    <span className="font-medium">Origen: {detalle.origen}</span>
                                                                                    <span>{formatFecha(detalle.tiempo)}</span>
                                                                                </div>
                                                                                {detalle.analisis && (
                                                                                    <div className="mt-1 text-xs">
                                                                                        <Badge variant="outline" className="bg-blue-50 text-blue-700">
                                                                                            ✅ Con análisis
                                                                                        </Badge>
                                                                                    </div>
                                                                                )}
                                                                            </div>
                                                                        ))}
                                                                    </div>
                                                                </div>
                                                            ))}
                                                        </div>
                                                    </CardContent>
                                                )}
                                            </Card>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="text-center py-8">
                                        <CheckCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                                        <p className="text-muted-foreground">No hay datos de resumen</p>
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </TabsContent>

                    {/* NUEVO TAB: Timeline */}
                    <TabsContent value="timeline" className="space-y-4">
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <Activity className="h-5 w-5" />
                                    Línea de Tiempo
                                </CardTitle>
                                <CardDescription>
                                    Visualización cronológica de las etapas de producción
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                {Object.keys(resumen_preparaciones).length > 0 ? (
                                    <div className="space-y-8">
                                        {Object.entries(resumen_preparaciones).map(([preparacion, etapas]: [string, any]) => (
                                            <div key={preparacion} className="mb-8 last:mb-0">
                                                <h3 className="font-semibold text-xl mb-6 pb-2 border-b">
                                                    Preparación: {preparacion}
                                                </h3>
                                                {renderTimeline(preparacion, etapas)}
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="text-center py-8">
                                        <Activity className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                                        <p className="text-muted-foreground">No hay datos para mostrar la línea de tiempo</p>
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </TabsContent>

                    <TabsContent value="ultimos" className="space-y-6">
                        {/* Estadísticas */}
                        <Card>
                            <CardHeader className="pb-3">
                                <CardTitle className="text-lg flex items-center gap-2">
                                    <TrendingUp className="h-5 w-5" />
                                    Estadísticas de Análisis
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                    <div className="p-4 border rounded-lg text-center">
                                        <div className="text-2xl font-bold text-blue-600">
                                            {estadisticas_analisis?.total_analisis || 0}
                                        </div>
                                        <div className="text-sm text-muted-foreground">Total análisis</div>
                                    </div>
                                    <div className="p-4 border rounded-lg text-center">
                                        <div className="text-2xl font-bold text-green-600">
                                            {estadisticas_analisis?.analisis_completos || 0}
                                        </div>
                                        <div className="text-sm text-muted-foreground">Análisis válidos</div>
                                    </div>
                                    <div className="p-4 border rounded-lg text-center">
                                        <div className="text-2xl font-bold text-yellow-600">
                                            {estadisticas_analisis?.pruebas_intermedias || 0}
                                        </div>
                                        <div className="text-sm text-muted-foreground">Pruebas intermedias</div>
                                    </div>
                                    <div className="p-4 border rounded-lg text-center">
                                        <div className="text-2xl font-bold text-purple-600">
                                            {estadisticas_analisis?.porcentaje_completos || 0}%
                                        </div>
                                        <div className="text-sm text-muted-foreground">Eficiencia</div>
                                    </div>
                                </div>

                                {/* Estadísticas por preparación */}
                                {estadisticas_analisis?.por_preparacion && Object.keys(estadisticas_analisis.por_preparacion).length > 0 && (
                                    <div className="mt-6">
                                        <h4 className="font-medium mb-3">Por Preparación</h4>
                                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                                            {Object.entries(estadisticas_analisis.por_preparacion).map(([prep, stats]: [string, any]) => (
                                                <div key={prep} className="p-3 border rounded-lg">
                                                    <div className="font-medium text-sm">Prep: {prep}</div>
                                                    <div className="text-xs text-muted-foreground mt-1">
                                                        <div className="flex justify-between">
                                                            <span>Válidos:</span>
                                                            <span className="font-medium">{stats.completos}</span>
                                                        </div>
                                                        <div className="flex justify-between">
                                                            <span>Pruebas:</span>
                                                            <span className="font-medium">{stats.pruebas_intermedias}</span>
                                                        </div>
                                                        <div className="flex justify-between">
                                                            <span>Total:</span>
                                                            <span className="font-medium">{stats.total}</span>
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </CardContent>
                        </Card>

                        {/* Últimos análisis agrupados */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <Filter className="h-5 w-5" />
                                    Últimos Análisis por Preparación
                                </CardTitle>
                                <CardDescription>
                                    Solo muestra el análisis final válido por cada combinación de preparación, origen y etapa.
                                    Se omiten las pruebas intermedias.
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                {Object.keys(ultimos_analisis_agrupados).length > 0 ? (
                                    <div className="space-y-8">
                                        {Object.entries(ultimos_analisis_agrupados).map(([preparacion, analisisList]) => (
                                            <div key={preparacion} className="space-y-4">
                                                <div className="flex items-center justify-between border-b pb-2">
                                                    <h3 className="font-semibold text-lg">
                                                        Preparación: {preparacion}
                                                    </h3>
                                                    <Badge variant="outline">
                                                        {analisisList.length} análisis finales
                                                    </Badge>
                                                </div>

                                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                                    {analisisList.map((analisisItem: any) => renderTarjetaAnalisis(analisisItem))}
                                                </div>

                                                {/* Resumen de esta preparación */}
                                                <div className="p-3 bg-gray-50 rounded-lg border">
                                                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
                                                        <div>
                                                            <div className="text-xs text-muted-foreground">Etapas con análisis</div>
                                                            <div className="font-medium">
                                                                {[...new Set(analisisList.map((a: any) => a.etapa))].length}
                                                            </div>
                                                        </div>
                                                        <div>
                                                            <div className="text-xs text-muted-foreground">Orígenes utilizados</div>
                                                            <div className="font-medium">
                                                                {[...new Set(analisisList.map((a: any) => a.origen))].length}
                                                            </div>
                                                        </div>
                                                        <div>
                                                            <div className="text-xs text-muted-foreground">Último análisis</div>
                                                            <div className="font-medium">
                                                                {(() => {
                                                                    const tiempos = analisisList
                                                                        .map((a: any) => a.analisis.tiempo_analisis)
                                                                        .filter(Boolean);
                                                                    if (tiempos.length > 0) {
                                                                        const ultimo = Math.max(...tiempos.map((t: string) => new Date(t).getTime()));
                                                                        return formatFecha(new Date(ultimo).toISOString());
                                                                    }
                                                                    return 'N/A';
                                                                })()}
                                                            </div>
                                                        </div>
                                                        <div>
                                                            <div className="text-xs text-muted-foreground">Estado</div>
                                                            <Badge className="bg-green-100 text-green-800">
                                                                Finalizado
                                                            </Badge>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="text-center py-8">
                                        <Filter className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                                        <p className="text-muted-foreground">
                                            No hay análisis finales registrados.
                                            <br />Todos los análisis pueden ser pruebas intermedias o estar incompletos.
                                        </p>
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </TabsContent>
                </Tabs>

                {/* Modal PDF HTST */}
                {mostrarPdfHtst && datosHtst && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80">
                        <div className="relative h-[95vh] w-[95vw] overflow-hidden rounded-lg bg-white shadow-2xl">
                            <button
                                className="absolute top-4 right-4 z-50 flex h-8 w-8 items-center justify-center rounded-full bg-red-600 text-white hover:bg-red-700"
                                onClick={() => setMostrarPdfHtst(false)}
                                aria-label="Cerrar"
                            >
                                ✕
                            </button>

                            <div className="absolute top-0 right-0 left-0 z-40 flex items-center justify-between bg-gray-100 px-4 py-3">
                                <h3 className="text-lg font-semibold text-gray-800">
                                    Reporte ORP HTST - {orp.codigo}
                                </h3>
                            </div>

                            <div className="h-full pt-14">
                                <PDFViewer
                                    style={{
                                        width: '100%',
                                        height: '100%',
                                        border: 'none',
                                    }}
                                >
                                    <ReporteOrpHtst
                                        orp={datosHtst.orp}
                                        estadisticas={datosHtst.estadisticas_analisis}
                                        ultimos_analisis={datosHtst.ultimos_analisis_agrupados}
                                        analisis_por_etapa={datosHtst.analisis_por_etapa}
                                        usuariosInvolucrados={datosHtst.usuarios_involucrados}
                                        obs={datosHtst.observaciones}
                                        pasteurizador={datosHtst.pasteurizador}   // ✅ corregido
                                    />
                                </PDFViewer>
                            </div>
                        </div>
                    </div>
                )}

                {/* Modal PDF UHT */}
                {mostrarPdfUht && datosUht && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80">
                        <div className="relative h-[95vh] w-[95vw] overflow-hidden rounded-lg bg-white shadow-2xl">
                            <button
                                className="absolute top-4 right-4 z-50 flex h-8 w-8 items-center justify-center rounded-full bg-red-600 text-white hover:bg-red-700"
                                onClick={() => setMostrarPdfUht(false)}
                                aria-label="Cerrar"
                            >
                                ✕
                            </button>

                            <div className="absolute top-0 right-0 left-0 z-40 flex items-center justify-between bg-gray-100 px-4 py-3">
                                <h3 className="text-lg font-semibold text-gray-800">
                                    Reporte ORP UHT - {orp.codigo}
                                </h3>
                            </div>

                            <div className="h-full pt-14">
                                <PDFViewer
                                    style={{
                                        width: '100%',
                                        height: '100%',
                                        border: 'none',
                                    }}
                                >
                                    <ReporteOrpUht
                                        orp={datosUht.orp}
                                        analisis_por_etapa={datosUht.analisis_por_etapa}
                                    />
                                </PDFViewer>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </AppLayout>
    );
}
