import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import FormSelect from '@/components/ui/form-select';
import { Input } from '@/components/ui/input';
import AppLayout from '@/layouts/app-layout';
import ReporteResumidoPDF from '@/pdf/ReporteResumidoOLD';
import { Head, router, usePage } from '@inertiajs/react';
import { PDFViewer } from '@react-pdf/renderer';
import { Check, Eye, Minus, X } from 'lucide-react';
import { useEffect, useState } from 'react';
import { route } from 'ziggy-js';

export default function ReporteResumido() {
    const {
        areas = [],
        totales = {},
        porcentaje = 0,
        fecha,
        fecha_desde,
        fecha_hasta,
        filtros = {},
        listaAreas = [],
        listaSubareas = [],
        gruposPrioridad = [],
    } = usePage<any>().props;

    const [areaId, setAreaId] = useState(filtros.area_id || '');
    const [subareaId, setSubareaId] = useState(filtros.subarea_id || '');
    const [turno, setTurno] = useState(filtros.turno || '');
    const [nivel, setNivel] = useState(filtros.nivel || '');
    const [fechaDesde, setFechaDesde] = useState(
        fecha_desde || fecha || new Date().toISOString().slice(0, 10),
    );
    const [fechaHasta, setFechaHasta] = useState(
        fecha_hasta || fecha || new Date().toISOString().slice(0, 10),
    );

    const [mostrarPDF, setMostrarPDF] = useState(false);
    const [pdfData, setPdfData] = useState<any>(null);
    const [cargandoPDF, setCargandoPDF] = useState(false);

    const subareasFiltradas = listaSubareas.filter(
        (s: any) => !areaId || s.old_area_id?.toString() === areaId,
    );

    useEffect(() => {
        setSubareaId('');
    }, [areaId]);

    useEffect(() => {
        const params: any = {};
        if (fechaDesde) params.fecha_desde = fechaDesde;
        if (fechaHasta) params.fecha_hasta = fechaHasta;
        if (areaId) params.area_id = areaId;
        if (subareaId) params.subarea_id = subareaId;
        if (turno) params.turno = turno;
        if (nivel) params.nivel = nivel;

        const timer = setTimeout(() => {
            router.get(route('old-registros.reporte-resumido'), params, {
                preserveState: true,
                replace: true,
            });
        }, 300);
        return () => clearTimeout(timer);
    }, [fechaDesde, fechaHasta, areaId, subareaId, turno, nivel]);

    const limpiar = () => {
        const hoy = new Date().toISOString().slice(0, 10);
        setFechaDesde(hoy);
        setFechaHasta(hoy);
        setAreaId('');
        setSubareaId('');
        setTurno('');
        setNivel('');
    };

    const abrirPDF = async () => {
        setCargandoPDF(true);
        try {
            const params: any = {};
            if (fechaDesde) params.fecha_desde = fechaDesde;
            if (fechaHasta) params.fecha_hasta = fechaHasta;
            if (areaId) params.area_id = areaId;
            if (subareaId) params.subarea_id = subareaId;
            if (turno) params.turno = turno;
            if (nivel) params.nivel = nivel;

            const response = await fetch(
                route('old-registros.reporte-resumido-data', params),
            );
            const data = await response.json();
            setPdfData(data);
            setMostrarPDF(true);
        } catch (error) {
            console.error('Error al cargar datos PDF:', error);
        } finally {
            setCargandoPDF(false);
        }
    };

    const cerrarPDF = () => {
        setMostrarPDF(false);
        setPdfData(null);
    };

    const turnosMostrar = turno ? [parseInt(turno)] : [1, 2, 3];

    const filtrosPdf = {
        ...(pdfData?.filtros || {}),
        area_id: areaId || pdfData?.filtros?.area_id || '',
        subarea_id: subareaId || pdfData?.filtros?.subarea_id || '',
        turno: turno || pdfData?.filtros?.turno || '',
        nivel: nivel || pdfData?.filtros?.nivel || '',
    };

    const areaSeleccionada =
        listaAreas.find((a: any) => a.id?.toString() === areaId)?.nombre || '';

    const IndicadorTarea = ({
        esperado,
        realizado,
    }: {
        esperado: boolean;
        realizado: boolean;
    }) => {
        if (!esperado) {
            return (
                <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-gray-100">
                    <Minus className="h-3 w-3 text-gray-400" />
                </span>
            );
        }
        return realizado ? (
            <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-green-100">
                <Check className="h-3.5 w-3.5 text-green-600" strokeWidth={3} />
            </span>
        ) : (
            <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-red-100">
                <X className="h-3.5 w-3.5 text-red-500" strokeWidth={3} />
            </span>
        );
    };

    return (
        <AppLayout>
            <Head title="Reporte Diario de Limpieza" />

            <div className="mx-auto max-w-7xl space-y-6 p-4 md:p-6">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight md:text-3xl">
                            Reporte Diario de Limpieza
                        </h1>
                        <p className="mt-1 text-sm text-muted-foreground">
                            Resumen de cumplimiento por área y turno{' '}
                            {fechaDesde && fechaHasta ? (
                                <>
                                    del{' '}
                                    <strong>
                                        {new Date(
                                            fechaDesde + 'T00:00:00',
                                        ).toLocaleDateString('es-BO', {
                                            weekday: 'long',
                                            day: 'numeric',
                                            month: 'long',
                                            year: 'numeric',
                                        })}
                                    </strong>
                                    {' al '}
                                    <strong>
                                        {new Date(
                                            fechaHasta + 'T00:00:00',
                                        ).toLocaleDateString('es-BO', {
                                            weekday: 'long',
                                            day: 'numeric',
                                            month: 'long',
                                            year: 'numeric',
                                        })}
                                    </strong>
                                </>
                            ) : (
                                'del día seleccionado'
                            )}
                        </p>
                    </div>
                    <div className="flex gap-2">
                        <Button variant="outline" size="sm" onClick={limpiar}>
                            Limpiar filtros
                        </Button>
                        <Button
                            size="sm"
                            onClick={abrirPDF}
                            disabled={cargandoPDF}
                        >
                            <Eye className="mr-2 h-4 w-4" />
                            {cargandoPDF ? 'Cargando...' : 'Ver PDF'}
                        </Button>
                    </div>
                </div>

                {/* Filtros */}
                <Card>
                    <CardHeader className="pb-3">
                        <CardTitle className="text-lg">Filtros</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">
                            <div className="flex flex-col gap-1.5">
                                <label className="text-sm font-medium">
                                    Fecha inicio
                                </label>
                                <Input
                                    type="date"
                                    value={fechaDesde}
                                    onChange={(e) =>
                                        setFechaDesde(e.target.value)
                                    }
                                />
                            </div>
                            <div className="flex flex-col gap-1.5">
                                <label className="text-sm font-medium">
                                    Fecha fin
                                </label>
                                <Input
                                    type="date"
                                    value={fechaHasta}
                                    onChange={(e) =>
                                        setFechaHasta(e.target.value)
                                    }
                                />
                            </div>
                            <FormSelect
                                label="Área"
                                value={areaId}
                                onChange={setAreaId}
                                options={[
                                    { value: '', label: 'Todas las áreas' },
                                    ...listaAreas.map((a: any) => ({
                                        value: a.id.toString(),
                                        label: a.nombre,
                                    })),
                                ]}
                            />
                            <FormSelect
                                label="Subárea"
                                value={subareaId}
                                onChange={setSubareaId}
                                placeholder={
                                    areaId
                                        ? 'Seleccionar subárea'
                                        : 'Primero seleccione área'
                                }
                                options={subareasFiltradas.map((s: any) => ({
                                    value: s.id.toString(),
                                    label: s.nombre,
                                }))}
                                disabled={!areaId}
                            />
                            <FormSelect
                                label="Turno"
                                value={turno}
                                onChange={setTurno}
                                options={[
                                    { value: '', label: 'Todos los turnos' },
                                    { value: '1', label: 'Turno 1' },
                                    { value: '2', label: 'Turno 2' },
                                    { value: '3', label: 'Turno 3' },
                                ]}
                            />
                            <FormSelect
                                label="Nivel"
                                value={nivel}
                                onChange={setNivel}
                                options={[
                                    { value: '', label: 'Todos' },
                                    { value: '0', label: 'Nivel 0' },
                                    { value: '1', label: 'Nivel 1' },
                                    { value: '2', label: 'Nivel 2' },
                                ]}
                            />
                        </div>
                    </CardContent>
                </Card>

                {/* Resumen estadístico */}
                <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
                    <Card>
                        <CardContent className="pt-4">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-muted-foreground">
                                        Cumplimiento
                                    </p>
                                    <p className="text-2xl font-bold">
                                        {porcentaje}%
                                    </p>
                                </div>
                                <div
                                    className={`flex h-12 w-12 items-center justify-center rounded-full ${porcentaje >= 80 ? 'bg-green-100' : porcentaje >= 50 ? 'bg-yellow-100' : 'bg-red-100'}`}
                                >
                                    <span
                                        className={`text-lg font-bold ${porcentaje >= 80 ? 'text-green-600' : porcentaje >= 50 ? 'text-yellow-600' : 'text-red-600'}`}
                                    >
                                        {porcentaje >= 80
                                            ? '✓'
                                            : porcentaje >= 50
                                              ? '!'
                                              : '✗'}
                                    </span>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardContent className="pt-4">
                            <p className="text-sm font-medium text-muted-foreground">
                                Actividades esperadas
                            </p>
                            <p className="text-2xl font-bold">
                                {totales.esperadas || 0}
                            </p>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardContent className="pt-4">
                            <p className="text-sm font-medium text-muted-foreground">
                                Actividades realizadas
                            </p>
                            <p className="text-2xl font-bold text-green-600">
                                {totales.realizadas || 0}
                            </p>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardContent className="pt-4">
                            <p className="text-sm font-medium text-muted-foreground">
                                Actividades incumplidas
                            </p>
                            <p className="text-2xl font-bold text-red-500">
                                {totales.incumplidas || 0}
                            </p>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardContent className="pt-4">
                            <p className="text-sm font-medium text-muted-foreground">
                                No incumplimientos
                            </p>
                            <p className="text-2xl font-bold text-green-600">
                                {totales.no_incumplimientos || 0}
                            </p>
                        </CardContent>
                    </Card>
                </div>

                {/* Reporte por áreas con desglose por días */}
                {areas.length === 0 ? (
                    <Card>
                        <CardContent className="py-12 text-center text-muted-foreground">
                            No se encontraron datos para los filtros
                            seleccionados.
                        </CardContent>
                    </Card>
                ) : (
                    areas.map((area: any) => (
                        <Card
                            key={area.nombre}
                            className="overflow-hidden shadow-sm"
                        >
                            <CardHeader className="border-b bg-muted/30 pb-3">
                                <CardTitle className="flex items-center justify-between text-lg font-semibold">
                                    <span>{area.nombre}</span>
                                    <Badge
                                        variant="outline"
                                        className="text-xs font-normal"
                                    >
                                        {area.subareas.reduce(
                                            (acc: number, sub: any) =>
                                                acc + (sub.items?.length || 0),
                                            0,
                                        )}{' '}
                                        items
                                    </Badge>
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="p-0">
                                {area.subareas.map((sub: any) => (
                                    <div
                                        key={sub.nombre}
                                        className="border-b last:border-b-0"
                                    >
                                        {area.subareas.length > 1 && (
                                            <div className="border-b bg-muted/20 px-4 py-2">
                                                <h3 className="text-sm font-semibold text-muted-foreground">
                                                    {sub.nombre}
                                                </h3>
                                            </div>
                                        )}
                                        <div className="overflow-x-auto">
                                            <table className="w-full text-sm">
                                                <thead>
                                                    <tr className="border-b bg-muted/50">
                                                        <th className="w-[250px] p-3 text-left font-semibold">
                                                            Item / Fecha
                                                        </th>
                                                        {turnosMostrar.map(
                                                            (t: number) => (
                                                                <th
                                                                    key={t}
                                                                    className="border-l p-3 text-center font-semibold"
                                                                >
                                                                    <div>
                                                                        Turno{' '}
                                                                        {t}
                                                                    </div>
                                                                    <div className="mt-1 flex justify-center gap-2 text-xs font-normal text-muted-foreground">
                                                                        <span className="w-6">
                                                                            O
                                                                        </span>
                                                                        <span className="w-6">
                                                                            L
                                                                        </span>
                                                                        <span className="w-6">
                                                                            D
                                                                        </span>
                                                                    </div>
                                                                </th>
                                                            ),
                                                        )}
                                                        <th className="w-20 border-l p-3 text-center font-semibold">
                                                            Estado
                                                        </th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {sub.items.length === 0 ? (
                                                        <tr>
                                                            <td
                                                                colSpan={
                                                                    turnosMostrar.length +
                                                                    2
                                                                }
                                                                className="p-6 text-center text-muted-foreground"
                                                            >
                                                                Sin items
                                                                programados
                                                            </td>
                                                        </tr>
                                                    ) : (
                                                        sub.items.flatMap(
                                                            (item: any) =>
                                                                (
                                                                    item.dias ||
                                                                    []
                                                                ).map(
                                                                    (
                                                                        dia: any,
                                                                        idx: number,
                                                                    ) => (
                                                                        <tr
                                                                            key={`${item.id}-${idx}`}
                                                                            className="border-b transition-colors last:border-b-0 hover:bg-muted/20"
                                                                        >
                                                                            <td className="p-3">
                                                                                {idx ===
                                                                                0 ? (
                                                                                    <span className="font-medium">
                                                                                        {
                                                                                            item.nombre
                                                                                        }
                                                                                    </span>
                                                                                ) : (
                                                                                    <span className="text-xs text-muted-foreground">
                                                                                        (mismo
                                                                                        item)
                                                                                    </span>
                                                                                )}
                                                                                <div className="text-xs text-muted-foreground">
                                                                                    {
                                                                                        dia.fecha
                                                                                    }
                                                                                </div>
                                                                                {dia
                                                                                    .responsables_limpieza
                                                                                    ?.length >
                                                                                    0 && (
                                                                                    <div className="mt-1 text-[11px] text-muted-foreground">
                                                                                        Limpieza:{' '}
                                                                                        {dia.responsables_limpieza
                                                                                            .map(
                                                                                                (
                                                                                                    usuario: any,
                                                                                                ) =>
                                                                                                    usuario.nombre,
                                                                                            )
                                                                                            .join(
                                                                                                ', ',
                                                                                            )}
                                                                                    </div>
                                                                                )}
                                                                                {dia
                                                                                    .supervisores
                                                                                    ?.length >
                                                                                    0 && (
                                                                                    <div className="text-[11px] text-muted-foreground">
                                                                                        Supervisor:{' '}
                                                                                        {dia.supervisores
                                                                                            .map(
                                                                                                (
                                                                                                    usuario: any,
                                                                                                ) =>
                                                                                                    usuario.nombre,
                                                                                            )
                                                                                            .join(
                                                                                                ', ',
                                                                                            )}
                                                                                    </div>
                                                                                )}
                                                                            </td>
                                                                            {turnosMostrar.map(
                                                                                (
                                                                                    t: number,
                                                                                ) => {
                                                                                    const data =
                                                                                        dia
                                                                                            .turnos?.[
                                                                                            t
                                                                                        ];
                                                                                    if (
                                                                                        !data
                                                                                    ) {
                                                                                        return (
                                                                                            <td
                                                                                                key={
                                                                                                    t
                                                                                                }
                                                                                                className="border-l p-3 text-center"
                                                                                            >
                                                                                                <div className="flex justify-center gap-2">
                                                                                                    <Minus className="h-4 w-4 text-gray-300" />
                                                                                                    <Minus className="h-4 w-4 text-gray-300" />
                                                                                                    <Minus className="h-4 w-4 text-gray-300" />
                                                                                                </div>
                                                                                            </td>
                                                                                        );
                                                                                    }
                                                                                    const {
                                                                                        esperado,
                                                                                        realizado,
                                                                                    } =
                                                                                        data;
                                                                                    return (
                                                                                        <td
                                                                                            key={
                                                                                                t
                                                                                            }
                                                                                            className="border-l p-3 text-center"
                                                                                        >
                                                                                            <div className="flex justify-center gap-2">
                                                                                                <IndicadorTarea
                                                                                                    esperado={
                                                                                                        esperado.orden
                                                                                                    }
                                                                                                    realizado={
                                                                                                        realizado.orden
                                                                                                    }
                                                                                                />
                                                                                                <IndicadorTarea
                                                                                                    esperado={
                                                                                                        esperado.limpieza
                                                                                                    }
                                                                                                    realizado={
                                                                                                        realizado.limpieza
                                                                                                    }
                                                                                                />
                                                                                                <IndicadorTarea
                                                                                                    esperado={
                                                                                                        esperado.desinfeccion
                                                                                                    }
                                                                                                    realizado={
                                                                                                        realizado.desinfeccion
                                                                                                    }
                                                                                                />
                                                                                            </div>
                                                                                        </td>
                                                                                    );
                                                                                },
                                                                            )}
                                                                            <td className="border-l p-3 text-center">
                                                                                {dia.cumplio ? (
                                                                                    <Badge
                                                                                        variant="default"
                                                                                        className="border-green-300 bg-green-100 text-green-700 hover:bg-green-100"
                                                                                    >
                                                                                        Cumplido
                                                                                    </Badge>
                                                                                ) : (
                                                                                    <Badge
                                                                                        variant="destructive"
                                                                                        className="border-red-300"
                                                                                    >
                                                                                        Incumplido
                                                                                    </Badge>
                                                                                )}
                                                                            </td>
                                                                        </tr>
                                                                    ),
                                                                ),
                                                        )
                                                    )}
                                                </tbody>
                                            </table>
                                        </div>
                                    </div>
                                ))}
                            </CardContent>
                        </Card>
                    ))
                )}
            </div>

            {/* Modal PDF */}
            {mostrarPDF && pdfData && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80">
                    <div className="relative h-[95vh] w-[95vw] overflow-hidden rounded-lg bg-white shadow-2xl">
                        <button
                            className="absolute top-4 right-4 z-50 flex h-8 w-8 items-center justify-center rounded-full bg-red-600 text-white hover:bg-red-700"
                            onClick={cerrarPDF}
                            aria-label="Cerrar"
                        >
                            ✕
                        </button>

                        <div className="absolute top-0 right-0 left-0 z-40 flex items-center justify-between bg-gray-100 px-4 py-3">
                            <h3 className="text-lg font-semibold text-gray-800">
                                Reporte de Limpieza{' '}
                                {fechaDesde && fechaHasta ? (
                                    <>
                                        -{' '}
                                        {new Date(
                                            fechaDesde + 'T00:00:00',
                                        ).toLocaleDateString('es-BO', {
                                            day: 'numeric',
                                            month: 'long',
                                            year: 'numeric',
                                        })}
                                        {' al '}
                                        {new Date(
                                            fechaHasta + 'T00:00:00',
                                        ).toLocaleDateString('es-BO', {
                                            day: 'numeric',
                                            month: 'long',
                                            year: 'numeric',
                                        })}
                                    </>
                                ) : (
                                    ''
                                )}
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
                                <ReporteResumidoPDF
                                    areas={pdfData.areas}
                                    totales={pdfData.totales}
                                    porcentaje={pdfData.porcentaje}
                                    fecha={pdfData.fecha}
                                    fecha_desde={pdfData.fecha_desde}
                                    fecha_hasta={pdfData.fecha_hasta}
                                    filtros={filtrosPdf}
                                    areaSeleccionada={areaSeleccionada}
                                    gruposPrioridad={pdfData.gruposPrioridad}
                                />
                            </PDFViewer>
                        </div>
                    </div>
                </div>
            )}
        </AppLayout>
    );
}
