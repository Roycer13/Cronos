import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import FilterSelect from '@/components/ui/filter-select';
import { Input } from '@/components/ui/input';
import ReporteAnalisisLeche from '@/pdf/ReporteAnalisisLeche';
import { PDFViewer } from '@react-pdf/renderer';
import { Printer } from 'lucide-react';

import ScientificNotationLeche from '@/components/ui/ScientificNotationLeche';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Toast } from '@/components/ui/toast';
import { useAdvancedFilters } from '@/hooks/use-advanced-filters';
import { useAuth } from '@/hooks/useAuth';
import { useAutoRefresh } from '@/hooks/useAutoRefresh';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, router, useForm, usePage } from '@inertiajs/react';
import {
    Beaker,
    Eye,
    Filter,
    Microscope,
    MoreHorizontal,
    Pencil,
    Sprout,
    TestTube,
    Trash2,
    X,
} from 'lucide-react';
import { useState } from 'react';
import { route } from 'ziggy-js';

import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import FormInput from '@/components/ui/form-input';
import FormSelect from '@/components/ui/form-select';
import TablePagination from '@/components/ui/table-pagination';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Análisis de Leche', href: '/planta-lacteos/analisis-leche' },
];

interface Analisis {
    id: number;
    estado?: {
        nombre: string;
    };
    recepcion?: {
        tiempo: string;
        subruta?: {
            nombre: string;
            ruta?: {
                nombre: string;
            };
        };
        cantidad: number;
    };
    tiempo_fq?: string;
    tiempo_siembra?: string;
    tiempo_lectura?: string;
    user_fq_id?: number;
    user_mb_siembra_id?: number;
    user_mb_lectura_id?: number;
    analistaFQ?: {
        name: string;
        apellido: string;
    };
    analistaMBSiembra?: {
        name: string;
        apellido: string;
    };
    analistaMBLectura?: {
        name: string;
        apellido: string;
    };
}

interface PageProps {
    analisis: {
        data: Analisis[];
        links: any[];
        current_page: number;
        last_page: number;
        per_page: number;
        total: number;
    };
    filters: {
        estado_id?: number;
        user_fq_id?: number;
        user_mb_siembra_id?: number;
        user_mb_lectura_id?: number;
        subruta_id?: number;
        ruta_id?: number;
        per_page?: number;
    };
    subrutas?: { id: number; nombre: string; ruta: { nombre: string } }[];
    rutas?: { id: number; nombre: string }[];
    estados?: { id: number; nombre: string }[];
    analistas?: { id: number; name: string; apellido: string }[];
    pendientesLineaCount?: number;
    flash: {
        success?: string;
        error?: string;
    };
}

export default function Index() {
    const { props } = usePage();
    const [showFilters, setShowFilters] = useState(false);
    const [fqModalOpen, setFqModalOpen] = useState(false);
    const [siembraModalOpen, setSiembraModalOpen] = useState(false);
    const [lecturaModalOpen, setLecturaModalOpen] = useState(false);
    const [selectedAnalisis, setSelectedAnalisis] = useState<Analisis | null>(
        null,
    );

    const [fechaDesde, setFechaDesde] = useState<string>('');
    const [fechaHasta, setFechaHasta] = useState<string>('');
    const [rutaId, setRutaId] = useState<string>('');
    const [subrutaId, setSubrutaId] = useState<string>('');
    const [datosPdf, setDatosPdf] = useState<any>(null);
    const [mostrarPdf, setMostrarPdf] = useState(false);
    const [generandoPdf, setGenerandoPdf] = useState(false);
    const urlPdf = route('analisis-leche.pdf');

    const {
        hasPermission,
        belongsToUbicacion,
        canDo,
        user: authUser,
    } = useAuth();

    const {
        lastUpdated,
        isRefreshing,
        autoRefreshInterval,
        setAutoRefreshInterval,
        refreshData,
    } = useAutoRefresh({
        initialInterval: 120,
        only: ['analisis', 'pendientesLineaCount'],
    });

    const {
        analisis = {
            data: [],
            links: [],
            current_page: 1,
            last_page: 1,
            per_page: 10,
            total: 0,
        },
        filters: initialFilters = {},
        subrutas = [],
        rutas = [],
        estados = [],
        analistas = [],
        pendientesLineaCount = 0,
        flash,
    } = props as unknown as PageProps;

    const hasPendingAnalisisLinea = pendientesLineaCount > 0;

    const { filters, updateFilter, resetFilters } = useAdvancedFilters({
        routeName: 'analisis-leche.index',
        initialFilters: {
            estado_id: initialFilters.estado_id?.toString() || undefined,
            user_fq_id: initialFilters.user_fq_id?.toString() || undefined,
            user_mb_siembra_id:
                initialFilters.user_mb_siembra_id?.toString() || undefined,
            user_mb_lectura_id:
                initialFilters.user_mb_lectura_id?.toString() || undefined,
            subruta_id: initialFilters.subruta_id?.toString() || undefined,
            ruta_id: initialFilters.ruta_id?.toString() || undefined,
            per_page: initialFilters.per_page?.toString() || '10',
        },
        debounceFields: [],
        debounceDelay: 600,
    });
    function toDatetimeLocal(date = new Date()) {
        const pad = (n: number) => String(n).padStart(2, '0');
        const y = date.getFullYear();
        const m = pad(date.getMonth() + 1);
        const d = pad(date.getDate());
        const hh = pad(date.getHours());
        const mm = pad(date.getMinutes());
        return `${y}-${m}-${d}T${hh}:${mm}`;
    }

    // Formularios para cada modal - incluyendo los campos de tiempo editables
    const {
        data: fqData,
        setData: setFqData,
        put: putFQ,
        processing: processingFQ,
        errors: errorsFQ,
        reset: resetFQ,
    } = useForm({
        // Para FQ también podrías agregar tiempo_fq si quieres que sea editable
        tiempo_siembra: toDatetimeLocal(),
        temperatura: '',
        ph: '',
        acidez: '',
        brix: '',
        densidad: '',
        prueba_alcohol: false,
        contenido_graso: '',
        temperatura_congelacion: '',
        porcentaje_agua: '',
        observaciones_fq: '',
    });

    const {
        data: siembraData,
        setData: setSiembraData,
        put: putSiembra,
        processing: processingSiembra,
        errors: errorsSiembra,
        reset: resetSiembra,
    } = useForm({
        tiempo_siembra: toDatetimeLocal(),
        observaciones_siembra: '',
    });

    const {
        data: lecturaData,
        setData: setLecturaData,
        put: putLectura,
        processing: processingLectura,
        errors: errorsLectura,
        reset: resetLectura,
    } = useForm({
        tiempo_lectura: toDatetimeLocal(),
        recuento: '',
        antibioticos: '',
        observaciones_lectura: '',
    });

    const hasActiveFilters = Object.values(filters).some(
        (value) => value && value !== '' && value !== '10',
    );

    const handleEdit = (id: number) => {
        router.visit(route('analisis-leche.edit', id));
    };

    const handleDelete = (id: number) => {
        if (confirm('¿Está seguro de eliminar este análisis de leche?')) {
            router.delete(route('analisis-leche.destroy', id), {
                preserveScroll: true,
            });
        }
    };

    const handleView = (id: number) => {
        // router.visit(route('analisis-leche.show', id));
    };

    const handleFQ = (analisisItem: Analisis) => {
        setSelectedAnalisis(analisisItem);
        setFqData({
            temperatura: analisisItem.temperatura?.toString() || '',
            ph: analisisItem.ph?.toString() || '',
            acidez: analisisItem.acidez?.toString() || '',
            brix: analisisItem.brix?.toString() || '',
            densidad: analisisItem.densidad?.toString() || '',
            prueba_alcohol: analisisItem.prueba_alcohol || false,
            contenido_graso: analisisItem.contenido_graso?.toString() || '',
            temperatura_congelacion:
                analisisItem.temperatura_congelacion?.toString() || '',
            porcentaje_agua: analisisItem.porcentaje_agua?.toString() || '',
            observaciones_fq: analisisItem.observaciones_fq || '',
        });
        setFqModalOpen(true);
    };

    const handleSiembra = (analisisItem: Analisis) => {
        setSelectedAnalisis(analisisItem);
        setSiembraData({
            tiempo_siembra: analisisItem.tiempo_siembra
                ? toDatetimeLocal(new Date(analisisItem.tiempo_siembra))
                : toDatetimeLocal(),
            observaciones_siembra: analisisItem.observaciones_siembra || '',
        });
        setSiembraModalOpen(true);
    };

    const handleLectura = (analisisItem: Analisis) => {
        setSelectedAnalisis(analisisItem);
        setLecturaData({
            tiempo_lectura: analisisItem.tiempo_lectura
                ? toDatetimeLocal(new Date(analisisItem.tiempo_lectura))
                : toDatetimeLocal(),
            recuento: analisisItem.recuento?.toString() || '',
            antibioticos: analisisItem.antibioticos?.toString() || '',
            observaciones_lectura: analisisItem.observaciones_lectura || '',
        });
        setLecturaModalOpen(true);
    };

const fetchDatosPdf = async () => {
    if (!fechaDesde || !fechaHasta) throw new Error('Selecciona ambas fechas');
    const params = new URLSearchParams();
    params.append('fecha_desde', fechaDesde);
    params.append('fecha_hasta', fechaHasta);
    if (rutaId) params.append('ruta_id', rutaId);
    if (subrutaId) params.append('subruta_id', subrutaId);

    const response = await fetch(`${urlPdf}?${params.toString()}`);
    if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText.substring(0, 500));
    }
    const data = await response.json();

    // Transformar los análisis
   const analisisTransformados = data.analisis.map((a: any) => ({
    fecha_recepcion: a.recepcion?.tiempo,
    ruta: a.recepcion?.subruta?.ruta?.nombre || '-',
    subruta: a.recepcion?.subruta?.nombre || '-',
    estado: a.estado?.nombre || '-',
    temperatura: a.temperatura,
    ph: a.ph,
    acidez: a.acidez,
    brix: a.brix,
    densidad: a.densidad,
    prueba_alcohol: a.prueba_alcohol,
    contenido_graso: a.contenido_graso,
    temperatura_congelacion: a.temperatura_congelacion,
    porcentaje_agua: a.porcentaje_agua,
    recuento: a.recuento,
    antibioticos: a.antibioticos === 1 ? 'Positivo' : a.antibioticos === 0 ? 'Negativo' : '-',
    observaciones: a.observaciones_fq || a.observaciones_siembra || a.observaciones_lectura || '-',
    tiempo_fq: a.tiempo_fq,
    tiempo_siembra: a.tiempo_siembra,
    tiempo_lectura: a.tiempo_lectura,
    analista_fq_codigo: a.analista_f_q?.codigo || '-',
    analista_siembra_codigo: a.analista_m_b_siembra?.codigo || '-',
    analista_lectura_codigo: a.analista_m_b_lectura?.codigo || '-',
    usuario_solicitante_nombre: a.recepcion?.usuario?.name || '-',
    usuario_solicitante_codigo: a.recepcion?.usuario?.codigo || '-',
}));

console.log('Datos transformados para PDF:', data.analisis);
    return {
        analisis: analisisTransformados,
        usuarios_involucrados: data.usuarios_involucrados || [],
        filtros: data.filtros || {}
    };
};

const handleMostrarPdf = async () => {
    if (!fechaDesde || !fechaHasta) {
        alert('Por favor selecciona ambas fechas');
        return;
    }
    setGenerandoPdf(true);
    try {
        const data = await fetchDatosPdf();
        if (data.analisis.length === 0) {
            alert('No hay análisis en el rango de fechas seleccionado');
            return;
        }
        setDatosPdf(data); // Guarda el objeto completo (analisis, usuarios, filtros)
        setMostrarPdf(true);
    } catch (error: any) {
        console.error(error);
        alert('Error al generar el reporte');
    } finally {
        setGenerandoPdf(false);
    }
};
    const submitFQ = (e: React.FormEvent) => {
        e.preventDefault();
        if (selectedAnalisis) {
            putFQ(
                route('analisis-leche.update-fq', {
                    analisis_leche: selectedAnalisis.id,
                }),
                {
                    onSuccess: () => {
                        setFqModalOpen(false);
                        resetFQ();
                    },
                },
            );
        }
    };

    const submitSiembra = (e: React.FormEvent) => {
        e.preventDefault();
        if (selectedAnalisis) {
            putSiembra(
                route('analisis-leche.update-siembra', {
                    analisis_leche: selectedAnalisis.id,
                }),
                {
                    onSuccess: () => {
                        setSiembraModalOpen(false);
                        resetSiembra();
                    },
                },
            );
        }
    };

    const submitLectura = (e: React.FormEvent) => {
        e.preventDefault();
        if (selectedAnalisis) {
            putLectura(
                route('analisis-leche.update-lectura', {
                    analisis_leche: selectedAnalisis.id,
                }),
                {
                    onSuccess: () => {
                        setLecturaModalOpen(false);
                        resetLectura();
                    },
                },
            );
        }
    };

    const formatFecha = (fecha: string) => {
        return new Date(fecha).toLocaleDateString('es-ES', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        });
    };

    const getEstadoColor = (estado: string) => {
        switch (estado) {
            case 'Pendiente':
                return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-800/30 dark:text-yellow-400';
            case 'FQ Completado':
                return 'bg-blue-100 text-blue-800 dark:bg-blue-800/30 dark:text-blue-400';
            case 'Siembra Completada':
                return 'bg-purple-100 text-purple-800 dark:bg-purple-800/30 dark:text-purple-400';
            case 'Analisis Completado':
                return 'bg-green-100 text-green-800 dark:bg-green-800/30 dark:text-green-400';
            default:
                return 'bg-muted text-muted-foreground';
        }
    };

    const getProgresoAnalisis = (analisisItem: Analisis) => {
        if (analisisItem.tiempo_lectura) return 100;
        if (analisisItem.tiempo_siembra) return 66;
        if (analisisItem.tiempo_fq) return 100;
        return 0;
    };
    const [visibleColumns, setVisibleColumns] = useState({
        fq: true,
        micro: true,
        estado: true,
    });

    const toggleColumn = (column: keyof typeof visibleColumns) => {
        setVisibleColumns((prev) => ({
            ...prev,
            [column]: !prev[column],
        }));
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Análisis de Leche" />
            <div className="space-y-2 px-2 py-2 sm:px-6">
                <Toast />

                {/* Header */}
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div className="relative flex items-center gap-2">
                        <Button
                            onClick={() =>
                                router.visit(route('analisis-linea.index'))
                            }
                        >
                            Analisis linea
                        </Button>
                        {hasPendingAnalisisLinea && (
                            <span className="absolute -top-2 -right-2 h-3 w-3 animate-pulse rounded-full border-2 border-white bg-red-500" />
                        )}
                    </div>

                    <div className="flex items-center gap-2">
                        {/* Controles de columnas */}
                        <Tabs defaultValue="all" className="w-auto">
                            <TabsList>
                                <TabsTrigger
                                    value="all"
                                    onClick={() =>
                                        setVisibleColumns({
                                            fq: true,
                                            micro: true,
                                            estado: true,
                                        })
                                    }
                                >
                                    Todas
                                </TabsTrigger>
                                <TabsTrigger
                                    value="fq"
                                    onClick={() =>
                                        setVisibleColumns({
                                            fq: true,
                                            micro: false,
                                            estado: false,
                                        })
                                    }
                                >
                                    Solo FQ
                                </TabsTrigger>
                                <TabsTrigger
                                    value="micro"
                                    onClick={() =>
                                        setVisibleColumns({
                                            fq: false,
                                            micro: true,
                                            estado: false,
                                        })
                                    }
                                >
                                    Solo Micro
                                </TabsTrigger>
                            </TabsList>
                        </Tabs>

                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setShowFilters(!showFilters)}
                            className="flex items-center gap-2"
                        >
                            <Filter className="h-4 w-4" />
                            <span className="hidden md:block">Filtros</span>
                            {hasActiveFilters && (
                                <span className="flex h-5 w-5 items-center justify-center rounded-full bg-primary text-xs text-primary-foreground">
                                    !
                                </span>
                            )}
                        </Button>
                    </div>
                </div>

                {/* Filtros avanzados */}
                {showFilters && (
                    <div className="rounded-lg border border-border bg-muted/50 p-2">
                        <div className="mb-3 flex items-center justify-between">
                            <h3 className="font-semibold text-foreground">
                                Filtros avanzados
                            </h3>
                            <div className="flex items-center gap-2">
                                {hasActiveFilters && (
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={resetFilters}
                                        className="text-xs text-muted-foreground hover:text-foreground"
                                    >
                                        <X className="mr-1 h-4 w-4" />
                                        Limpiar
                                    </Button>
                                )}
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-6">
                            <FilterSelect
                                value={filters.ruta_id}
                                onChange={(v) => updateFilter('ruta_id', v)}
                                placeholder="Todas las rutas"
                                options={rutas.map((r) => ({
                                    value: r.id.toString(),
                                    label: r.nombre,
                                }))}
                            />

                            <FilterSelect
                                value={filters.subruta_id}
                                onChange={(v) => updateFilter('subruta_id', v)}
                                placeholder="Todas las subrutas"
                                options={subrutas.map((s) => ({
                                    value: s.id.toString(),
                                    label: `${s.nombre} - ${s.ruta.nombre}`,
                                }))}
                            />

                            <FilterSelect
                                value={filters.estado_id}
                                onChange={(v) => updateFilter('estado_id', v)}
                                placeholder="Todos los estados"
                                options={estados.map((e) => ({
                                    value: e.id.toString(),
                                    label: e.nombre,
                                }))}
                            />

                            <FilterSelect
                                value={filters.user_fq_id}
                                onChange={(v) => updateFilter('user_fq_id', v)}
                                placeholder="Analista FQ"
                                options={analistas.map((a) => ({
                                    value: a.id.toString(),
                                    label: `${a.name} ${a.apellido}`,
                                }))}
                            />

                            <FilterSelect
                                value={filters.user_mb_siembra_id}
                                onChange={(v) =>
                                    updateFilter('user_mb_siembra_id', v)
                                }
                                placeholder="Analista Siembra"
                                options={analistas.map((a) => ({
                                    value: a.id.toString(),
                                    label: `${a.name} ${a.apellido}`,
                                }))}
                            />

                            <FilterSelect
                                value={filters.user_mb_lectura_id}
                                onChange={(v) =>
                                    updateFilter('user_mb_lectura_id', v)
                                }
                                placeholder="Analista Lectura"
                                options={analistas.map((a) => ({
                                    value: a.id.toString(),
                                    label: `${a.name} ${a.apellido}`,
                                }))}
                            />

                            <FilterSelect
                                value={filters.per_page}
                                onChange={(v) => updateFilter('per_page', v)}
                                placeholder="Resultados por página"
                                options={['10', '25', '50', '100'].map((v) => ({
                                    value: v,
                                    label: `${v} por página`,
                                }))}
                                includeAllOption={false}
                            />
                        </div>
                    </div>
                )}

                {/* Tabla rediseñada */}
                <Card>
                    <div className="overflow-x-auto">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead className="w-[140px]">
                                        Recepción
                                    </TableHead>
                                    <TableHead>Ruta</TableHead>
                                    {visibleColumns.estado && (
                                        <TableHead className="w-[100px]">
                                            Estado
                                        </TableHead>
                                    )}

                                    {visibleColumns.fq && (
                                        <>
                                            <TableHead>Temp</TableHead>
                                            <TableHead>pH</TableHead>
                                            <TableHead>Acidez</TableHead>
                                            <TableHead>Grasa</TableHead>
                                            <TableHead>Densidad</TableHead>
                                            <TableHead>Acción FQ</TableHead>
                                        </>
                                    )}

                                    {visibleColumns.micro && (
                                        <>
                                            <TableHead>Recuento</TableHead>
                                            <TableHead>Antibióticos</TableHead>
                                            <TableHead>Acción Micro</TableHead>
                                        </>
                                    )}

                                    <TableHead>Acciones</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {analisis.data.length === 0 ? (
                                    <TableRow>
                                        <TableCell
                                            colSpan={
                                                3 +
                                                (visibleColumns.estado
                                                    ? 1
                                                    : 0) +
                                                (visibleColumns.fq ? 6 : 0) +
                                                (visibleColumns.micro ? 3 : 0) +
                                                1
                                            }
                                            className="py-8 text-center text-muted-foreground"
                                        >
                                            <div className="flex flex-col items-center justify-center">
                                                <TestTube className="mb-3 h-12 w-12 text-muted-foreground/50" />
                                                <p className="mb-1 text-lg font-medium text-foreground">
                                                    No se encontraron análisis
                                                </p>
                                                <p className="text-muted-foreground">
                                                    {hasActiveFilters
                                                        ? 'Intenta ajustar los filtros para ver más resultados'
                                                        : 'No hay análisis registrados en el sistema'}
                                                </p>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    analisis.data.map((analisisItem) => (
                                        <TableRow
                                            key={analisisItem.id}
                                            className="hover:bg-muted/50"
                                        >
                                            {/* Información básica */}
                                            <TableCell>
                                                <div className="font-medium">
                                                    {analisisItem.recepcion
                                                        ?.tiempo
                                                        ? formatFecha(
                                                              analisisItem
                                                                  .recepcion
                                                                  .tiempo,
                                                          )
                                                        : '-'}
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <div className="font-medium">
                                                    {analisisItem.recepcion
                                                        ?.subruta?.nombre ||
                                                        '-'}
                                                </div>
                                                <div className="">
                                                    {analisisItem.recepcion
                                                        ?.subruta?.ruta
                                                        ?.nombre || '-'}
                                                </div>
                                            </TableCell>

                                            {/* Estado */}
                                            {visibleColumns.estado && (
                                                <TableCell>
                                                    <div className="flex flex-col gap-1">
                                                        {/* Nombre del estado con color dinámico */}
                                                        <span
                                                            className="font-medium"
                                                            style={{
                                                                color:
                                                                    analisisItem
                                                                        .estado
                                                                        ?.color ||
                                                                    '#A1A1AA', // Color del estado o gris si no tiene
                                                            }}
                                                        >
                                                            {analisisItem.estado
                                                                ?.nombre ||
                                                                'Pendiente'}
                                                        </span>

                                                        {/* Barra de progreso */}
                                                        <div className="flex items-center gap-2">
                                                            <div className="h-1 w-16 overflow-hidden rounded-full bg-muted">
                                                                <div
                                                                    className="h-1 rounded-full transition-all duration-300"
                                                                    style={{
                                                                        width: `${getProgresoAnalisis(analisisItem)}%`,
                                                                        backgroundColor:
                                                                            analisisItem
                                                                                .estado
                                                                                ?.color ||
                                                                            '#A1A1AA',
                                                                    }}
                                                                />
                                                            </div>
                                                            <span className="text-xs text-muted-foreground">
                                                                {getProgresoAnalisis(
                                                                    analisisItem,
                                                                )}
                                                                %
                                                            </span>
                                                        </div>
                                                    </div>
                                                </TableCell>
                                            )}
                                            {/* Físico-Químico */}
                                            {visibleColumns.fq && (
                                                <>
                                                    <TableCell>
                                                        <div className="text-center">
                                                            {analisisItem.temperatura
                                                                ? `${analisisItem.temperatura}°C`
                                                                : '-'}
                                                        </div>
                                                    </TableCell>
                                                    <TableCell>
                                                        <div className="text-center">
                                                            {analisisItem.ph ||
                                                                '-'}
                                                        </div>
                                                    </TableCell>
                                                    <TableCell>
                                                        <div className="text-center">
                                                            {analisisItem.acidez
                                                                ? `${analisisItem.acidez}%`
                                                                : '-'}
                                                        </div>
                                                    </TableCell>
                                                    <TableCell>
                                                        <div className="text-center">
                                                            {analisisItem.contenido_graso
                                                                ? `${analisisItem.contenido_graso}%`
                                                                : '-'}
                                                        </div>
                                                    </TableCell>
                                                    <TableCell>
                                                        <div className="text-center">
                                                            {analisisItem.densidad ||
                                                                '-'}
                                                        </div>
                                                    </TableCell>
                                                    <TableCell>
                                                        {analisisItem.tiempo_fq
                                                            ? // Botón para editar FQ (ya existe) - con canDo para 8 horas
                                                              canDo(
                                                                  analisisItem,
                                                                  'u_analisisLecheFQ',
                                                                  8,
                                                              ) && (
                                                                  <Button
                                                                      variant="ghost"
                                                                      size="sm"
                                                                      onClick={() =>
                                                                          handleFQ(
                                                                              analisisItem,
                                                                          )
                                                                      }
                                                                      className="h-7 text-xs"
                                                                  >
                                                                      <Pencil />
                                                                  </Button>
                                                              )
                                                            : // Botón para crear FQ (no existe) - con hasPermission
                                                              hasPermission(
                                                                  'c_analisisLecheFQ',
                                                              ) && (
                                                                  <Button
                                                                      variant="outline"
                                                                      size="sm"
                                                                      onClick={() =>
                                                                          handleFQ(
                                                                              analisisItem,
                                                                          )
                                                                      }
                                                                      className="h-7 text-xs"
                                                                  >
                                                                      <Beaker className="mr-1 h-3 w-3" />
                                                                      FQ
                                                                  </Button>
                                                              )}
                                                    </TableCell>
                                                </>
                                            )}

                                            {/* Microbiología */}
                                            {visibleColumns.micro && (
                                                <>
                                                    <TableCell>
                                                        <div className="text-center">
                                                            <ScientificNotationLeche
                                                                value={
                                                                    analisisItem.recuento
                                                                }
                                                                decimals={3}
                                                                fallback="-"
                                                                useSuperscript
                                                            />
                                                        </div>
                                                    </TableCell>
                                                    <TableCell>
                                                        <div className="text-center">
                                                            {analisisItem.antibioticos ? (
                                                                <Badge
                                                                    variant={
                                                                        analisisItem.antibioticos ===
                                                                        '1'
                                                                            ? 'destructive'
                                                                            : 'default'
                                                                    }
                                                                    className="text-xs"
                                                                >
                                                                    {analisisItem.antibioticos ===
                                                                    '1'
                                                                        ? 'Positivo'
                                                                        : 'Negativo'}
                                                                </Badge>
                                                            ) : (
                                                                '-'
                                                            )}
                                                        </div>
                                                    </TableCell>
                                                    <TableCell>
                                                        <div className="flex flex-col gap-1">
                                                            {!analisisItem.tiempo_siembra
                                                                ? // Botón para crear siembra - con hasPermission
                                                                  hasPermission(
                                                                      'c_analisisLecheMB',
                                                                  ) && (
                                                                      <Button
                                                                          variant="outline"
                                                                          size="sm"
                                                                          onClick={() =>
                                                                              handleSiembra(
                                                                                  analisisItem,
                                                                              )
                                                                          }
                                                                          disabled={
                                                                              !analisisItem.tiempo_fq
                                                                          }
                                                                          className="h-6 text-xs"
                                                                      >
                                                                          <Sprout />
                                                                      </Button>
                                                                  )
                                                                : !analisisItem.tiempo_lectura
                                                                  ? // Botón para crear lectura - con hasPermission
                                                                    hasPermission(
                                                                        'c_analisisLecheMB',
                                                                    ) && (
                                                                        <Button
                                                                            variant="outline"
                                                                            size="sm"
                                                                            onClick={() =>
                                                                                handleLectura(
                                                                                    analisisItem,
                                                                                )
                                                                            }
                                                                            className="h-6 text-xs"
                                                                        >
                                                                            <Microscope />
                                                                        </Button>
                                                                    )
                                                                  : // Botón para editar lectura - con canDo para 8 horas
                                                                    canDo(
                                                                        analisisItem,
                                                                        'u_analisisLecheMB',
                                                                        8,
                                                                    ) && (
                                                                        <Button
                                                                            variant="ghost"
                                                                            size="sm"
                                                                            onClick={() =>
                                                                                handleLectura(
                                                                                    analisisItem,
                                                                                )
                                                                            }
                                                                            className="h-6 text-xs"
                                                                        >
                                                                            <Pencil />
                                                                        </Button>
                                                                    )}
                                                        </div>
                                                    </TableCell>
                                                </>
                                            )}

                                            {/* Acciones generales */}
                                            <TableCell>
                                                <DropdownMenu>
                                                    <DropdownMenuTrigger
                                                        asChild
                                                    >
                                                        <Button
                                                            variant="ghost"
                                                            size="sm"
                                                            className="h-8 w-8 p-0"
                                                        >
                                                            <MoreHorizontal className="h-4 w-4" />
                                                            <span className="sr-only">
                                                                Abrir menú
                                                            </span>
                                                        </Button>
                                                    </DropdownMenuTrigger>
                                                    <DropdownMenuContent
                                                        align="end"
                                                        className="w-48"
                                                    >
                                                        <DropdownMenuItem
                                                            onClick={() =>
                                                                handleView(
                                                                    analisisItem.id,
                                                                )
                                                            }
                                                        >
                                                            <Eye className="mr-2 h-4 w-4" />
                                                            <span>
                                                                Ver detalles
                                                            </span>
                                                        </DropdownMenuItem>
                                                        {/* {canDo(analisisItem, 'u_analisisLeche', 6, false) && (
                                                            <DropdownMenuItem onClick={() => handleEdit(analisisItem.id)}>
                                                                <Edit className="mr-2 h-4 w-4" />
                                                                <span>Editar análisis</span>
                                                            </DropdownMenuItem>
                                                        )} */}
                                                        {canDo(
                                                            analisisItem,
                                                            'd_analisisLeche',
                                                            480,
                                                            false,
                                                        ) && (
                                                            <DropdownMenuItem
                                                                onClick={() =>
                                                                    handleDelete(
                                                                        analisisItem.id,
                                                                    )
                                                                }
                                                                className="text-destructive focus:text-destructive"
                                                            >
                                                                <Trash2 className="mr-2 h-4 w-4" />
                                                                <span>
                                                                    Eliminar
                                                                    análisis
                                                                </span>
                                                            </DropdownMenuItem>
                                                        )}
                                                    </DropdownMenuContent>
                                                </DropdownMenu>
                                            </TableCell>
                                        </TableRow>
                                    ))
                                )}
                            </TableBody>
                        </Table>
                    </div>

                    {/* Paginación */}
                    {analisis.data.length > 0 && (
                        <div className="border-t px-4 py-3">
                            <TablePagination
                                pagination={analisis}
                                onPageChange={(page) =>
                                    router.get(
                                        route('analisis-leche.index'),
                                        { ...filters, page },
                                        { preserveState: true, replace: true },
                                    )
                                }
                            />
                        </div>
                    )}
                </Card>


{/* Info rápida */}
                <div className="flex items-center justify-between">
                    <p className="text-muted-foreground">
                        {analisis.total} análisis registrados
                    </p>
                    {analisis.data.length > 0 && (
                        <p className="text-muted-foreground">
                            Mostrando {analisis.data.length} de {analisis.total}{' '}
                            análisis
                        </p>
                    )}
                </div>
                <div className="mt-4 rounded-lg border border-border bg-muted/50 p-4">
                    <h3 className="mb-3 font-semibold text-foreground">
                        Generar Reporte PDF
                    </h3>
                    <div className="grid grid-cols-1 gap-3 md:grid-cols-4">
                        <div>
                            <label className="mb-1 block text-sm font-medium">
                                Fecha Desde
                            </label>
                            <Input
                                type="date"
                                value={fechaDesde}
                                onChange={(e) => setFechaDesde(e.target.value)}
                            />
                        </div>
                        <div>
                            <label className="mb-1 block text-sm font-medium">
                                Fecha Hasta
                            </label>
                            <Input
                                type="date"
                                value={fechaHasta}
                                onChange={(e) => setFechaHasta(e.target.value)}
                            />
                        </div>
                        <div>
                            <label className="mb-1 block text-sm font-medium">
                                Ruta
                            </label>
                            <FilterSelect
                                value={rutaId}
                                onChange={(v) => setRutaId(v)}
                                placeholder="Todas las rutas"
                                options={rutas.map((r) => ({
                                    value: r.id.toString(),
                                    label: r.nombre,
                                }))}
                            />
                        </div>
                        <div>
                            <label className="mb-1 block text-sm font-medium">
                                Subruta
                            </label>
                            <FilterSelect
                                value={subrutaId}
                                onChange={(v) => setSubrutaId(v)}
                                placeholder="Todas las subrutas"
                                options={subrutas.map((s) => ({
                                    value: s.id.toString(),
                                    label: s.nombre,
                                }))}
                            />
                        </div>
                    </div>
                    <div className="mt-3 flex justify-end">
                        <Button
                            variant="default"
                            size="sm"
                            onClick={handleMostrarPdf}
                            disabled={generandoPdf}
                            className="flex items-center gap-2"
                        >
                            <Printer className="h-4 w-4" />
                            {generandoPdf
                                ? 'Generando...'
                                : 'Generar Reporte PDF'}
                        </Button>
                    </div>
                </div>

            </div>

            {/* Modal para FQ */}
            <Dialog open={fqModalOpen} onOpenChange={setFqModalOpen}>
                <DialogContent className="max-h-[90vh] max-w-4xl overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                            <Beaker className="h-5 w-5 text-blue-600" />
                            Completar Análisis Físico-Químico
                        </DialogTitle>
                        <DialogDescription>
                            Complete los parámetros del análisis físico-químico
                            para el análisis
                        </DialogDescription>
                    </DialogHeader>

                    <form onSubmit={submitFQ} className="space-y-4">
                        {/* ELIMINADO: Campos de usuario y tiempo que ahora son automáticos */}

                        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                            <FormInput
                                id="temperatura"
                                label="Temperatura (°C)"
                                type="number"
                                step="0.001"
                                value={fqData.temperatura}
                                onChange={(e) =>
                                    setFqData('temperatura', e.target.value)
                                }
                                placeholder="0.0"
                                error={errorsFQ.temperatura}
                            />

                            <FormInput
                                id="ph"
                                label="pH"
                                type="number"
                                step="0.001"
                                min="0"
                                max="14"
                                value={fqData.ph}
                                onChange={(e) =>
                                    setFqData('ph', e.target.value)
                                }
                                placeholder="0.00"
                                error={errorsFQ.ph}
                            />

                            <FormInput
                                id="acidez"
                                label="Acidez (%)"
                                type="number"
                                step="0.001"
                                min="0"
                                max="100"
                                value={fqData.acidez}
                                onChange={(e) =>
                                    setFqData('acidez', e.target.value)
                                }
                                placeholder="0.00"
                                error={errorsFQ.acidez}
                            />

                            <FormInput
                                id="brix"
                                label="Brix (°Bx)"
                                type="number"
                                step="0.001"
                                min="0"
                                max="100"
                                value={fqData.brix}
                                onChange={(e) =>
                                    setFqData('brix', e.target.value)
                                }
                                placeholder="0.0"
                                error={errorsFQ.brix}
                            />

                            <FormInput
                                id="densidad"
                                label="Densidad (g/mL)"
                                type="number"
                                step="0.0001"
                                min="0"
                                max="10"
                                value={fqData.densidad}
                                onChange={(e) =>
                                    setFqData('densidad', e.target.value)
                                }
                                placeholder="0.0000"
                                error={errorsFQ.densidad}
                            />

                            <FormInput
                                id="contenido_graso"
                                label="Contenido Graso (%)"
                                type="number"
                                step="0.001"
                                min="0"
                                max="100"
                                value={fqData.contenido_graso}
                                onChange={(e) =>
                                    setFqData('contenido_graso', e.target.value)
                                }
                                placeholder="0.00"
                                error={errorsFQ.contenido_graso}
                            />

                            <FormInput
                                id="temperatura_congelacion"
                                label="Temperatura Congelación (°C)"
                                type="number"
                                step="0.0001"
                                min="-10"
                                max="10"
                                value={fqData.temperatura_congelacion}
                                onChange={(e) =>
                                    setFqData(
                                        'temperatura_congelacion',
                                        e.target.value,
                                    )
                                }
                                placeholder="0.00"
                                error={errorsFQ.temperatura_congelacion}
                            />

                            <FormInput
                                id="porcentaje_agua"
                                label="Porcentaje de Agua (%)"
                                type="number"
                                step="0.001"
                                min="0"
                                max="100"
                                value={fqData.porcentaje_agua}
                                onChange={(e) =>
                                    setFqData('porcentaje_agua', e.target.value)
                                }
                                placeholder="0.00"
                                error={errorsFQ.porcentaje_agua}
                            />

                            <div className="flex items-center space-x-2 pt-2">
                                <input
                                    type="checkbox"
                                    id="prueba_alcohol"
                                    checked={fqData.prueba_alcohol}
                                    onChange={(e) =>
                                        setFqData(
                                            'prueba_alcohol',
                                            e.target.checked,
                                        )
                                    }
                                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                                />
                                <label
                                    htmlFor="prueba_alcohol"
                                    className="font-medium text-foreground"
                                >
                                    Prueba de Alcohol Positiva
                                </label>
                            </div>
                        </div>

                        <FormInput
                            id="observaciones_fq"
                            label="Observaciones"
                            value={fqData.observaciones_fq}
                            onChange={(e) =>
                                setFqData('observaciones_fq', e.target.value)
                            }
                            placeholder="Observaciones adicionales del análisis físico-químico..."
                            error={errorsFQ.observaciones_fq}
                        />

                        <DialogFooter>
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => setFqModalOpen(false)}
                            >
                                Cancelar
                            </Button>
                            <Button type="submit" disabled={processingFQ}>
                                {processingFQ
                                    ? 'Guardando...'
                                    : 'Completar Análisis FQ'}
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>

            {/* Modal para Siembra */}
            <Dialog open={siembraModalOpen} onOpenChange={setSiembraModalOpen}>
                <DialogContent className="max-w-2xl">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                            <TestTube className="h-5 w-5 text-purple-600" />
                            Completar Etapa de Siembra
                        </DialogTitle>
                        <DialogDescription>
                            Registre la información de la siembra para el
                            análisis
                        </DialogDescription>
                    </DialogHeader>

                    <form onSubmit={submitSiembra} className="space-y-4">
                        {/* Campo de fecha y hora editable */}
                        <FormInput
                            id="tiempo_siembra"
                            label="Fecha y Hora de Siembra"
                            type="datetime-local"
                            value={siembraData.tiempo_siembra}
                            onChange={(e) =>
                                setSiembraData('tiempo_siembra', e.target.value)
                            }
                            error={errorsSiembra.tiempo_siembra}
                        />

                        <FormInput
                            id="observaciones_siembra"
                            label="Observaciones (Opcional)"
                            value={siembraData.observaciones_siembra}
                            onChange={(e) =>
                                setSiembraData(
                                    'observaciones_siembra',
                                    e.target.value,
                                )
                            }
                            placeholder="Observaciones de la siembra..."
                            error={errorsSiembra.observaciones_siembra}
                        />

                        <DialogFooter>
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => setSiembraModalOpen(false)}
                            >
                                Cancelar
                            </Button>
                            <Button type="submit" disabled={processingSiembra}>
                                {processingSiembra
                                    ? 'Guardando...'
                                    : 'Completar Siembra'}
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>

            {/* Modal para Lectura */}
            <Dialog open={lecturaModalOpen} onOpenChange={setLecturaModalOpen}>
                <DialogContent className="max-w-2xl">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                            <Microscope className="h-5 w-5 text-green-600" />
                            Completar Etapa de Lectura
                        </DialogTitle>
                        <DialogDescription>
                            Registre los resultados de la lectura para el
                            análisis
                        </DialogDescription>
                    </DialogHeader>

                    <form onSubmit={submitLectura} className="space-y-4">
                        {/* Campo de fecha y hora editable */}
                        <FormInput
                            id="tiempo_lectura"
                            label="Fecha y Hora de Lectura"
                            type="datetime-local"
                            value={lecturaData.tiempo_lectura}
                            onChange={(e) =>
                                setLecturaData('tiempo_lectura', e.target.value)
                            }
                            error={errorsLectura.tiempo_lectura}
                        />

                        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                            <FormInput
                                id="recuento"
                                label="Recuento"
                                type="number"
                                value={lecturaData.recuento}
                                onChange={(e) =>
                                    setLecturaData('recuento', e.target.value)
                                }
                                placeholder="0"
                                error={errorsLectura.recuento}
                            />

                            <FormSelect
                                label="Antibióticos"
                                value={lecturaData.antibioticos}
                                onChange={(v) =>
                                    setLecturaData('antibioticos', v)
                                }
                                placeholder="Seleccione resultado"
                                options={[
                                    { value: '1', label: 'Positivo' },
                                    { value: '0', label: 'Negativo' },
                                ]}
                                error={errorsLectura.antibioticos}
                            />
                        </div>

                        <FormInput
                            id="observaciones_lectura"
                            label="Observaciones (Opcional)"
                            value={lecturaData.observaciones_lectura}
                            onChange={(e) =>
                                setLecturaData(
                                    'observaciones_lectura',
                                    e.target.value,
                                )
                            }
                            placeholder="Observaciones de la lectura..."
                            error={errorsLectura.observaciones_lectura}
                        />

                        <DialogFooter>
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => setLecturaModalOpen(false)}
                            >
                                Cancelar
                            </Button>
                            <Button type="submit" disabled={processingLectura}>
                                {processingLectura
                                    ? 'Guardando...'
                                    : 'Completar Lectura'}
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>

            {/* Modal para mostrar PDF */}
            {mostrarPdf && datosPdf && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80">
                    <div className="relative h-[95vh] w-[95vw] overflow-hidden rounded-lg bg-white shadow-2xl">
                        <button
                            className="absolute top-4 right-4 z-50 flex h-8 w-8 items-center justify-center rounded-full bg-red-600 text-white hover:bg-red-700"
                            onClick={() => setMostrarPdf(false)}
                        >
                            <X className="h-5 w-5" />
                        </button>
                        <div className="absolute top-0 right-0 left-0 z-40 flex items-center justify-between bg-gray-100 px-4 py-3">
                            <div>
                                <h3 className="text-lg font-semibold text-gray-800">
                                    Reporte de Análisis de Leche
                                </h3>
                                <p className="text-sm text-gray-600">
                                    {fechaDesde} al {fechaHasta}
                                </p>
                            </div>
                        </div>
                        <div className="h-full pt-14">
                            <PDFViewer
                                style={{
                                    width: '100%',
                                    height: '100%',
                                    border: 'none',
                                }}
                            >
                                <ReporteAnalisisLeche data={datosPdf} />
                            </PDFViewer>
                        </div>
                    </div>
                </div>
            )}
        </AppLayout>
    );
}
