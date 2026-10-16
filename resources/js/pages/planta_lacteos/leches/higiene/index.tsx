// resources/js/Pages/planta_lacteos/higieneAcopio/index.tsx

import { Button } from '@/components/ui/button';
import FilterSelect from '@/components/ui/filter-select';
import { Input } from '@/components/ui/input';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { Toast } from '@/components/ui/toast';
import { useAdvancedFilters } from '@/hooks/use-advanced-filters';
import { useAuth } from '@/hooks/useAuth';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, router, usePage } from '@inertiajs/react';
import {
    CheckCircle,
    Edit,
    Filter,
    MoreHorizontal,
    Search,
    ShieldCheck,
    Trash2,
    X,
    Printer
} from 'lucide-react';
import { PDFViewer } from '@react-pdf/renderer';
import ReporteHigieneAcopio from '@/pdf/ReporteHigieneAcopio';
import { useState } from 'react';
import { route } from 'ziggy-js';

import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import TablePagination from '@/components/ui/table-pagination';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Higiene de Acopio',
        href: '/planta-lacteos/higiene-acopio',
    },
];

interface PageProps {
    higieneAcopios: {
        data: any[];
        links: any[];
        current_page: number;
        last_page: number;
        per_page: number;
        total: number;
    };
    filters: {
        search?: string;
        ruta_id?: number;
        estado_id?: number;
        per_page?: number;
    };
    rutas: { id: number; nombre: string }[];
    estados: { id: number; nombre: string; color?: string }[];
    flash: {
        success?: string;
        error?: string;
    };
}

export default function Index() {
    const { props } = usePage();
    const [showFilters, setShowFilters] = useState(false);
    const [fechaDesde, setFechaDesde] = useState<string>('');
    const [fechaHasta, setFechaHasta] = useState<string>('');
    const [rutaId, setRutaId] = useState<string>('');
    const [estadoId, setEstadoId] = useState<string>('');
    const [datosPdf, setDatosPdf] = useState<any>(null);
    const [mostrarPdf, setMostrarPdf] = useState(false);
    const [generandoPdf, setGenerandoPdf] = useState(false);
    const urlPdf = route('higiene-acopio.pdf');

    const { hasPermission, canDo } = useAuth();

    const {
        higieneAcopios = {
            data: [],
            links: [],
            current_page: 1,
            last_page: 1,
            per_page: 10,
            total: 0,
        },
        filters: initialFilters = {},
        rutas = [],
        estados = [],
        flash,
    } = props as unknown as PageProps;

    const { filters, updateFilter, resetFilters } = useAdvancedFilters({
        routeName: 'higiene-acopio.index',
        initialFilters: {
            search: initialFilters.search || '',
            ruta_id: initialFilters.ruta_id?.toString() || undefined,
            estado_id: initialFilters.estado_id?.toString() || undefined,
            per_page: initialFilters.per_page?.toString() || '10',
        },
        debounceFields: ['search'],
        debounceDelay: 600,
    });

    const hasActiveFilters = Object.values(filters).some(
        (value) => value && value !== '' && value !== '10',
    );

    const handleCompletar = (id: number) => {
        if (
            confirm(
                '¿Marcar este registro como Completado? Esta acción no se puede deshacer.',
            )
        ) {
            router.patch(
                route('higiene-acopio.completar', id),
                {},
                {
                    preserveScroll: true,
                    onSuccess: () => {
                        // Opcional: mostrar toast o notificación
                    },
                },
            );
        }
    };
    const handleEdit = (id: number) => {
        router.visit(route('higiene-acopio.edit', id));
    };

    const handleDelete = (id: number) => {
        if (confirm('¿Está seguro de eliminar este registro de higiene?')) {
            router.delete(route('higiene-acopio.destroy', id), {
                preserveScroll: true,
            });
        }
    };


    const fetchDatosPdf = async () => {
    if (!fechaDesde || !fechaHasta) throw new Error('Selecciona ambas fechas');
    const params = new URLSearchParams();
    params.append('fecha_desde', fechaDesde);
    params.append('fecha_hasta', fechaHasta);
    if (rutaId) params.append('ruta_id', rutaId);
    if (estadoId) params.append('estado_id', estadoId);

    const response = await fetch(`${urlPdf}?${params.toString()}`);
    if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText.substring(0, 500));
    }
    const data = await response.json();

    // Transformar los datos
    const registrosTransformados = data.registros.map((item: any) => ({
        fecha: item.tiempo,
        ruta: item.ruta?.nombre || '-',
        estado: item.estado?.nombre || '-',
        usuario_codigo: item.usuario?.codigo || '-',
        usuario_nombre: `${item.usuario?.name || ''} ${item.usuario?.apellido || ''}`,
        superficie_llegada: item.superficie_llegada ? 'Conforme' : 'No conforme',
        observacion_llegada: item.observacion_llegada || '-',
        cofia: item.cofia ? 'Conforme' : 'No conforme',
        barbijo: item.Barbijo ? 'Conforme' : 'No conforme',
        overol: item.Overol ? 'Conforme' : 'No conforme',
        superficie_salida: item.superficie_salida ? 'Conforme' : 'No conforme',
        observacion_salida: item.observacion_salida || '-',
        correccion_llegada: item.correccion_llegada || '-',
        correccion_salida: item.correccion_salida || '-',
    }));

    return {
        registros: registrosTransformados,
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
        if (data.registros.length === 0) {
            alert('No hay registros en el rango de fechas seleccionado');
            return;
        }
        setDatosPdf(data);
        setMostrarPdf(true);
    } catch (error: any) {
        console.error(error);
        alert('Error al generar el reporte: ' + error.message);
    } finally {
        setGenerandoPdf(false);
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

    const getEstadoColor = (estadoNombre: string) => {
        const estado = estados.find((e) => e.nombre === estadoNombre);
        return estado?.color || '#6b7280'; // gris por defecto
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Higiene de Acopio" />
            <div className="space-y-2 px-2 py-2 sm:px-6">
                <Toast />
                {/* Header */}
                <div className="flex items-center justify-between">
                    {/* Búsqueda rápida */}
                    <div className="relative max-w-md">
                        <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 transform text-muted-foreground" />
                        <Input
                            placeholder="Buscar por observaciones..."
                            value={filters.search || ''}
                            onChange={(e) =>
                                updateFilter('search', e.target.value)
                            }
                            className="pl-10"
                        />
                    </div>
                    <div className="flex items-center gap-2">
                        {/* {hasPermission('c_higieneAcopio') && (
                            <Link href={route('higiene-acopio.create')}>
                                <Button size="sm">
                                    <Plus className="h-4 w-4" />
                                    <p className="hidden md:block">Nuevo Control</p>
                                </Button>
                            </Link>
                        )} */}

                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setShowFilters(!showFilters)}
                            className="flex items-center gap-2"
                        >
                            <Filter className="h-4 w-4" />
                            <p className="hidden md:block">Filtros</p>
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
                                value={filters.estado_id}
                                onChange={(v) => updateFilter('estado_id', v)}
                                placeholder="Todos los estados"
                                options={estados.map((e) => ({
                                    value: e.id.toString(),
                                    label: e.nombre,
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

                {/* Tabla */}
                <div className="overflow-hidden rounded-lg border border-border bg-background shadow-sm">
                    <div className="overflow-x-auto">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    {[
                                        'Fecha/Hora',
                                        'Usuario',
                                        'Ruta',
                                        'Estado',
                                        'Llegada',
                                        'EPP',
                                        'Salida',
                                        '',
                                    ].map((col, idx) => (
                                        <TableHead key={idx}>{col}</TableHead>
                                    ))}
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {higieneAcopios.data.length === 0 ? (
                                    <TableRow>
                                        <TableCell
                                            colSpan={8}
                                            className="py-8 text-center text-muted-foreground"
                                        >
                                            <div className="flex flex-col items-center justify-center">
                                                <ShieldCheck className="mb-3 h-12 w-12 text-muted-foreground/50" />
                                                <p className="mb-1 text-lg font-medium text-foreground">
                                                    No se encontraron registros
                                                    de higiene
                                                </p>
                                                <p className="text-muted-foreground">
                                                    {hasActiveFilters
                                                        ? 'Intenta ajustar los filtros para ver más resultados'
                                                        : 'No hay controles de higiene registrados'}
                                                </p>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    higieneAcopios.data.map((item) => (
                                        <TableRow
                                            key={item.id}
                                            className="hover:bg-muted/50"
                                        >
                                            <TableCell>
                                                <div className="font-medium text-foreground">
                                                    {formatFecha(item.tiempo)}
                                                </div>
                                            </TableCell>
                                            <TableCell className="text-muted-foreground">
                                                {item.usuario
                                                    ? `${item.usuario.name} ${item.usuario.apellido || ''}`
                                                    : '-'}
                                            </TableCell>
                                            <TableCell>
                                                <div className="font-medium text-foreground">
                                                    {item.ruta?.nombre || '-'}
                                                </div>
                                            </TableCell>

                                            <TableCell>
                                                {item.estado ? (
                                                    <span
                                                        className="inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium"
                                                        style={{
                                                            backgroundColor:
                                                                getEstadoColor(
                                                                    item.estado
                                                                        .nombre,
                                                                ) + '20',
                                                            color: getEstadoColor(
                                                                item.estado
                                                                    .nombre,
                                                            ),
                                                        }}
                                                    >
                                                        {item.estado.nombre}
                                                    </span>
                                                ) : (
                                                    <span className="inline-flex items-center rounded-full bg-gray-100 px-2.5 py-1 text-xs font-medium text-gray-500">
                                                        Sin estado
                                                    </span>
                                                )}
                                            </TableCell>
                                            <TableCell>
                                                <span
                                                    className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${
                                                        item.superficie_llegada
                                                            ? 'bg-green-100 text-green-700 dark:bg-green-800/30 dark:text-green-400'
                                                            : 'bg-red-100 text-red-700 dark:bg-red-800/30 dark:text-red-400'
                                                    }`}
                                                >
                                                    {item.superficie_llegada
                                                        ? 'OK'
                                                        : 'No conforme'}
                                                </span>
                                                {item.observacion_llegada && (
                                                    <div className="mt-1 text-xs text-muted-foreground">
                                                        {
                                                            item.observacion_llegada
                                                        }
                                                    </div>
                                                )}
                                            </TableCell>

                                            <TableCell>
                                                <div className="flex flex-wrap gap-1">
                                                    <span
                                                        className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${
                                                            item.cofia
                                                                ? 'bg-green-100 text-green-700'
                                                                : 'bg-red-100 text-red-700'
                                                        }`}
                                                    >
                                                        Cofia{' '}
                                                        {item.cofia ? '✓' : '✗'}
                                                    </span>
                                                    <span
                                                        className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${
                                                            item.Barbijo
                                                                ? 'bg-green-100 text-green-700'
                                                                : 'bg-red-100 text-red-700'
                                                        }`}
                                                    >
                                                        Barbijo{' '}
                                                        {item.Barbijo
                                                            ? '✓'
                                                            : '✗'}
                                                    </span>
                                                    <span
                                                        className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${
                                                            item.Overol
                                                                ? 'bg-green-100 text-green-700'
                                                                : 'bg-red-100 text-red-700'
                                                        }`}
                                                    >
                                                        Overol{' '}
                                                        {item.Overol
                                                            ? '✓'
                                                            : '✗'}
                                                    </span>
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <span
                                                    className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${
                                                        item.superficie_salida
                                                            ? 'bg-green-100 text-green-700 dark:bg-green-800/30 dark:text-green-400'
                                                            : 'bg-red-100 text-red-700 dark:bg-red-800/30 dark:text-red-400'
                                                    }`}
                                                >
                                                    {item.superficie_salida
                                                        ? 'OK'
                                                        : 'No conforme'}
                                                </span>
                                                {item.observacion_salida && (
                                                    <div className="mt-1 text-xs text-muted-foreground">
                                                        {
                                                            item.observacion_salida
                                                        }
                                                    </div>
                                                )}
                                            </TableCell>
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
                                                                handleEdit(
                                                                    item.id,
                                                                )
                                                            }
                                                        >
                                                            <Edit className="mr-2 h-4 w-4" />
                                                            <span>
                                                                Editar control
                                                            </span>
                                                        </DropdownMenuItem>

                                                        {/* Opción Completar (solo si no está completado) */}
                                                        {item.estado?.nombre !==
                                                            'Completado' && (
                                                            <DropdownMenuItem
                                                                onClick={() =>
                                                                    handleCompletar(
                                                                        item.id,
                                                                    )
                                                                }
                                                                className="text-green-600 focus:text-green-600"
                                                            >
                                                                <CheckCircle className="mr-2 h-4 w-4" />
                                                                <span>
                                                                    Revisado
                                                                </span>
                                                            </DropdownMenuItem>
                                                        )}

                                                        {/* Opción Eliminar (si tiene permiso) */}
                                                        {canDo(
                                                            item,
                                                            'd_higieneAcopio',
                                                            8,
                                                            true,
                                                            false,
                                                            false,
                                                        ) && (
                                                            <DropdownMenuItem
                                                                onClick={() =>
                                                                    handleDelete(
                                                                        item.id,
                                                                    )
                                                                }
                                                                className="text-destructive focus:text-destructive"
                                                            >
                                                                <Trash2 className="mr-2 h-4 w-4" />
                                                                <span>
                                                                    Eliminar
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
                    {higieneAcopios.data.length > 0 && (
                        <div className="border-t border-border px-4 py-3">
                            <TablePagination
                                pagination={higieneAcopios}
                                onPageChange={(page) =>
                                    router.get(
                                        route('higiene-acopio.index'),
                                        { ...filters, page },
                                        { preserveState: true, replace: true },
                                    )
                                }
                            />
                        </div>
                    )}
                </div>

                {/* Info rápida */}
                <div className="flex justify-between">
                    <p className="mt-1 text-muted-foreground">
                        {higieneAcopios.total} registros de higiene
                    </p>
                    <div>
                        {higieneAcopios.data.length > 0 && (
                            <div className="text-center">
                                <p className="text-muted-foreground">
                                    Mostrando{' '}
                                    <span className="font-medium text-foreground">
                                        {higieneAcopios.data.length}
                                    </span>{' '}
                                    de{' '}
                                    <span className="font-medium text-foreground">
                                        {higieneAcopios.total}
                                    </span>{' '}
                                    registros
                                </p>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            <div className="rounded-lg border border-border bg-muted/50 p-4 mt-4">
    <h3 className="mb-3 font-semibold text-foreground">Generar Reporte PDF</h3>
    <div className="grid grid-cols-1 gap-3 md:grid-cols-4">
        <div>
            <label className="mb-1 block text-sm font-medium">Fecha Desde</label>
            <Input
                type="date"
                value={fechaDesde}
                onChange={(e) => setFechaDesde(e.target.value)}
            />
        </div>
        <div>
            <label className="mb-1 block text-sm font-medium">Fecha Hasta</label>
            <Input
                type="date"
                value={fechaHasta}
                onChange={(e) => setFechaHasta(e.target.value)}
            />
        </div>
        <div>
            <label className="mb-1 block text-sm font-medium">Ruta</label>
            <FilterSelect
                value={rutaId}
                onChange={(v) => setRutaId(v)}
                placeholder="Todas las rutas"
                options={rutas.map((r) => ({ value: r.id.toString(), label: r.nombre }))}
            />
        </div>
        <div>
            <label className="mb-1 block text-sm font-medium">Estado</label>
            <FilterSelect
                value={estadoId}
                onChange={(v) => setEstadoId(v)}
                placeholder="Todos los estados"
                options={estados.map((e) => ({ value: e.id.toString(), label: e.nombre }))}
            />
        </div>
    </div>
    <div className="flex justify-end mt-3">
        <Button
            variant="default"
            size="sm"
            onClick={handleMostrarPdf}
            disabled={generandoPdf}
            className="flex items-center gap-2"
        >
            <Printer className="h-4 w-4" />
            {generandoPdf ? 'Generando...' : 'Generar Reporte PDF'}
        </Button>
    </div>
</div>




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
                    <h3 className="text-lg font-semibold text-gray-800">Reporte de Higiene de Acopio</h3>
                    <p className="text-sm text-gray-600">
                        {fechaDesde} al {fechaHasta}
                    </p>
                </div>
            </div>
            <div className="h-full pt-14">
                <PDFViewer style={{ width: '100%', height: '100%', border: 'none' }}>
                    <ReporteHigieneAcopio data={datosPdf} />
                </PDFViewer>
            </div>
        </div>
    </div>
)}
        </AppLayout>
    );
}
