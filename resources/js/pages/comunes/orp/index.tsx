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
import { Head, Link, router, usePage } from '@inertiajs/react';
import {
    Check,
    ChevronDown,
    Edit,
    Eye,
    FileText,
    Filter,
    MoreHorizontal,
    Package,
    Plus,
    Search,
    SquareKanban,
    Trash2,
    Upload,
    X,
} from 'lucide-react';
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
    { title: 'Órdenes de Producción', href: '/orps' },
];

interface PageProps {
    orps: {
        data: any[];
        links: any[];
        current_page: number;
        last_page: number;
        per_page: number;
        total: number;
    };
    filters: {
        search?: string;
        codigo?: string;
        lote?: string;
        producto_terminado?: string;
        ubicacion_id?: number;
        prioridad?: string;
        estado_id?: number;
        destinos?: { id: number; nombre: string }[];
        revisado?: boolean;
        per_page?: number;
        // NUEVOS CAMPOS PARA FECHA DE VENCIMIENTO
        fecha_vencimiento_desde?: string;
        fecha_vencimiento_hasta?: string;
    };
    ubicaciones?: { id: number; nombre: string }[];
    estados?: { id: number; nombre: string }[];
    flash: {
        success?: string;
        error?: string;
        info?: string;
        warning?: string;
        import_result?: any;
    };
}

// Nombres de estados en el orden del flujo
const NOMBRES_ESTADOS = [
    'Pendiente',
    'Programado',
    'En Proceso',
    'En Pausa',
    'Cancelado',
    'Completado',
    'Liberado',
    'Cerrado',
];

// Mapeo de nombres de estados a colores
const ESTADOS_CONFIG = {
    Pendiente: {
        color: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-800/30 dark:text-yellow-400',
    },
    Programado: {
        color: 'bg-blue-100 text-blue-800 dark:bg-blue-800/30 dark:text-blue-400',
    },
    'En Proceso': {
        color: 'bg-indigo-100 text-indigo-800 dark:bg-indigo-800/30 dark:text-indigo-400',
    },
    'En Pausa': {
        color: 'bg-orange-100 text-orange-800 dark:bg-orange-800/30 dark:text-orange-400',
    },
    Cancelado: {
        color: 'bg-red-100 text-red-800 dark:bg-red-800/30 dark:text-red-400',
    },
    Completado: {
        color: 'bg-green-100 text-green-800 dark:bg-green-800/30 dark:text-green-400',
    },
    Liberado: {
        color: 'bg-purple-100 text-purple-800 dark:bg-purple-800/30 dark:text-purple-400',
    },
    Cerrado: {
        color: 'bg-gray-100 text-gray-800 dark:bg-gray-800/30 dark:text-gray-400',
    },
};

export default function Index() {
    const { props } = usePage();
    const [showFilters, setShowFilters] = useState(false);
    const [showImportModal, setShowImportModal] = useState(false);
    const [importFile, setImportFile] = useState<File | null>(null);
    const [cambiandoEstados, setCambiandoEstados] = useState<
        Record<number, boolean>
    >({});

    const { hasPermission, canDo, user: authUser } = useAuth();

    // Destructuración de props
    const {
        orps = {
            data: [],
            links: [],
            current_page: 1,
            last_page: 1,
            per_page: 10,
            total: 0,
        },
        filters: initialFilters = {},
        ubicaciones = [],
        destinos = [],
        estados = [],
        flash,
    } = props as unknown as PageProps;

    // Hook personalizado para manejar filtros avanzados
    const { filters, updateFilter, resetFilters } = useAdvancedFilters({
        routeName: 'orps.index',
        initialFilters: {
            search: initialFilters.search || '',
            codigo: initialFilters.codigo || '',
            lote: initialFilters.lote || '',
            producto_terminado: initialFilters.producto_terminado || '',
            ubicacion_id: initialFilters.ubicacion_id?.toString() || undefined,
            prioridad: initialFilters.prioridad || '',
            estado_id: initialFilters.estado_id?.toString() || undefined,
            revisado: initialFilters.revisado ? '1' : undefined,
            destino_id: initialFilters.destinos?.toString() || undefined,
            per_page: initialFilters.per_page?.toString() || '10',
            // NUEVOS CAMPOS INICIALES
            fecha_vencimiento_desde: initialFilters.fecha_vencimiento_desde || '',
            fecha_vencimiento_hasta: initialFilters.fecha_vencimiento_hasta || '',
        },
        debounceFields: ['search', 'codigo', 'lote', 'producto_terminado'],
        debounceDelay: 600,
    });

    // Verificar si hay filtros activos
    const hasActiveFilters = Object.values(filters).some(
        (value) => value && value !== '' && value !== '10',
    );

    // FUNCIÓN QUE REPLICA getEstadoId del backend
    const getEstadoId = (nombreEstado: string): number => {
        const estadoEncontrado = estados.find(
            (estado) =>
                estado.nombre.toLowerCase() === nombreEstado.toLowerCase(),
        );

        if (estadoEncontrado) {
            return estadoEncontrado.id;
        }

        const index = NOMBRES_ESTADOS.findIndex(
            (nombre) => nombre.toLowerCase() === nombreEstado.toLowerCase(),
        );

        return index !== -1 ? index + 1 : 1;
    };

    // Handler para cambiar estado
    const handleCambiarEstado = async (
        orpId: number,
        nombreNuevoEstado: string,
    ) => {
        const estadoId = getEstadoId(nombreNuevoEstado);

        setCambiandoEstados((prev) => ({ ...prev, [orpId]: true }));

        try {
            await router.post(
                route('orps.cambiar-estado', orpId),
                {
                    estado_id: estadoId,
                    usuario_id: authUser.id,
                    observaciones: 'Cambio de estado desde la tabla',
                },
                {
                    preserveScroll: true,
                    onSuccess: () => {
                        console.log('Estado cambiado exitosamente');
                    },
                    onError: (error) => {
                        console.error('Error al cambiar estado:', error);
                    },
                },
            );
        } catch (error) {
            console.error('Error al cambiar estado:', error);
        } finally {
            setCambiandoEstados((prev) => ({ ...prev, [orpId]: false }));
        }
    };

    // Handlers para otras acciones
    const handleEdit = (id: number) => {
        router.visit(route('orps.edit', id));
    };

    const handleDelete = (id: number) => {
        if (confirm('¿Está seguro de eliminar esta orden de producción?')) {
            router.delete(route('orps.destroy', id), {
                preserveScroll: true,
            });
        }
    };

    const handleView = (id: number) => {
        router.visit(route('orps.show', id));
    };

    const handleImport = () => {
        if (!importFile) {
            alert('Por favor selecciona un archivo');
            return;
        }

        const formData = new FormData();
        formData.append('archivo', importFile);
        formData.append('usuario_creador_id', authUser.id.toString());

        router.post(route('orps.importar'), formData, {
            preserveScroll: true,
            preserveState: true,
            onSuccess: () => {
                setShowImportModal(false);
                setImportFile(null);
            },
        });
    };

    // Obtener estado actual de la ORP
    const getEstadoActual = (orp: any) => {
        const historialEstado = orp.historial_estados?.[0]?.estado;

        if (historialEstado && historialEstado.id && historialEstado.nombre) {
            return {
                id: historialEstado.id,
                nombre: historialEstado.nombre,
            };
        }

        if (estados.length > 0 && orp.estado_actual_id) {
            const estado = estados.find((e) => e.id === orp.estado_actual_id);
            if (estado) {
                return {
                    id: estado.id,
                    nombre: estado.nombre,
                };
            }
        }

        return { id: 1, nombre: 'Pendiente' };
    };

    // Calcular porcentaje de avance
    const calcularAvance = (orp: any) => {
        if (!orp.cantidad_programada || orp.cantidad_programada === 0) return 0;
        return ((orp.cantidad_producida || 0) / orp.cantidad_programada) * 100;
    };

    // Prioridad colors
    const getPrioridadColor = (prioridad: string) => {
        switch (prioridad) {
            case 'alta':
                return 'bg-red-100 text-red-800 dark:bg-red-800/30 dark:text-red-400';
            case 'urgente':
                return 'bg-purple-100 text-purple-800 dark:bg-purple-800/30 dark:text-purple-400';
            case 'media':
                return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-800/30 dark:text-yellow-400';
            case 'baja':
                return 'bg-green-100 text-green-800 dark:bg-green-800/30 dark:text-green-400';
            default:
                return 'bg-gray-100 text-gray-800 dark:bg-gray-800/30 dark:text-gray-400';
        }
    };

    // Obtener color del estado por nombre
    const getEstadoColor = (estadoNombre: string) => {
        return (
            ESTADOS_CONFIG[estadoNombre as keyof typeof ESTADOS_CONFIG]
                ?.color ||
            'bg-gray-100 text-gray-800 dark:bg-gray-800/30 dark:text-gray-400'
        );
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Órdenes de Producción" />
            <div className="space-y-2 px-2 py-2 sm:px-6">
                <Toast />

                {/* Header con búsqueda y botones */}
                <div className="flex items-center justify-between">
                    {/* Búsqueda rápida */}
                    <div className="relative max-w-md">
                        <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 transform text-muted-foreground" />
                        <Input
                            placeholder="Buscar por código, lote..."
                            value={filters.search}
                            onChange={(e) =>
                                updateFilter('search', e.target.value)
                            }
                            className="pl-10"
                        />
                    </div>

                    {/* Botones de acción */}
                    <div className="flex items-center gap-2">
                        {hasPermission('r_orp') && (
                            <Link href={route('orps.kanban')}>
                                <Button variant="secondary" size="sm">
                                    <SquareKanban className="h-4 w-4" />
                                    <p className="hidden md:block">Kanban</p>
                                </Button>
                            </Link>
                        )}
                        {hasPermission('c_orp') && (
                            <>
                                <Link href={route('orps.create')}>
                                    <Button size="sm">
                                        <Plus className="h-4 w-4" />
                                        <p className="hidden md:block">
                                            Nueva ORP
                                        </p>
                                    </Button>
                                </Link>

                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => setShowImportModal(true)}
                                    className="flex items-center gap-2"
                                >
                                    <Upload className="h-4 w-4" />
                                    <p className="hidden md:block">Importar</p>
                                </Button>
                            </>
                        )}

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

                {/* Panel de filtros avanzados */}
                {showFilters && (
                    <div className="rounded-lg border border-border bg-muted/50 p-2">
                        <div className="mb-3 flex items-center justify-between">
                            <h3 className="text-sm font-semibold text-foreground">
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

                        {/* Grid de filtros */}
                        <div className="grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-6">
                            <Input
                                placeholder="Código ORP"
                                value={filters.codigo}
                                onChange={(e) =>
                                    updateFilter('codigo', e.target.value)
                                }
                                className="text-sm"
                            />

                            <Input
                                placeholder="Lote"
                                value={filters.lote}
                                onChange={(e) =>
                                    updateFilter('lote', e.target.value)
                                }
                                className="text-sm"
                            />

                            <Input
                                placeholder="Producto"
                                value={filters.producto_terminado}
                                onChange={(e) =>
                                    updateFilter('producto_terminado', e.target.value)
                                }
                                className="text-sm"
                            />

                            <FilterSelect
                                value={filters.destino_id}
                                onChange={(v) => updateFilter('destino_id', v)}
                                placeholder="Destino"
                                options={destinos.map((d) => ({
                                    value: d.id.toString(),
                                    label: d.nombre,
                                }))}
                            />

                            <FilterSelect
                                value={filters.prioridad}
                                onChange={(v) => updateFilter('prioridad', v)}
                                placeholder="Prioridad"
                                options={[
                                    { value: 'alta', label: 'Alta' },
                                    { value: 'media', label: 'Media' },
                                    { value: 'baja', label: 'Baja' },
                                    { value: 'urgente', label: 'Urgente' },
                                ]}
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

                        {/* Segunda fila de filtros */}
                        <div className="mt-3 grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-6">
                            <FilterSelect
                                value={filters.estado_id}
                                onChange={(v) => updateFilter('estado_id', v)}
                                placeholder="Estado"
                                options={estados.map((e) => ({
                                    value: e.id.toString(),
                                    label: e.nombre,
                                }))}
                            />

                            <FilterSelect
                                value={filters.revisado}
                                onChange={(v) => updateFilter('revisado', v)}
                                placeholder="Revisado"
                                options={[
                                    { value: '1', label: 'Revisados' },
                                    { value: '0', label: 'No revisados' },
                                ]}
                                includeAllOption={false}
                            />

                            {/* NUEVOS FILTROS DE FECHA DE VENCIMIENTO */}
                            <div className="space-y-1">
                                <label className="text-xs font-medium">Fecha Venc. Desde</label>
                                <Input
                                    type="date"
                                    value={filters.fecha_vencimiento_desde}
                                    onChange={(e) => updateFilter('fecha_vencimiento_desde', e.target.value)}
                                    className="text-sm"
                                />
                            </div>

                            <div className="space-y-1">
                                <label className="text-xs font-medium">Fecha Venc. Hasta</label>
                                <Input
                                    type="date"
                                    value={filters.fecha_vencimiento_hasta}
                                    onChange={(e) => updateFilter('fecha_vencimiento_hasta', e.target.value)}
                                    className="text-sm"
                                />
                            </div>
                        </div>
                    </div>
                )}

                {/* Tabla de ORPs */}
                <div className="overflow-hidden rounded-lg border border-border bg-background shadow-sm">
                    <div className="overflow-x-auto">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    {[
                                        'Código',
                                        'Producto',
                                        'Lote',
                                        'Prioridad',
                                        'Fecha Vencimiento',
                                        // 'Cant. Programada',
                                        'Cant. Producida',
                                        // 'Avance',
                                        // 'Ubicación',
                                        'Estado Actual',
                                        'Revisado',
                                        '',
                                    ].map((col, idx) => (
                                        <TableHead key={idx}>{col}</TableHead>
                                    ))}
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {orps.data.length === 0 ? (
                                    <TableRow>
                                        <TableCell
                                            colSpan={11}
                                            className="py-8 text-center text-muted-foreground"
                                        >
                                            <div className="flex flex-col items-center justify-center">
                                                <Package className="mb-3 h-12 w-12 text-muted-foreground/50" />
                                                <p className="mb-1 text-lg font-medium text-foreground">
                                                    No se encontraron órdenes de
                                                    producción
                                                </p>
                                                <p className="text-sm text-muted-foreground">
                                                    {hasActiveFilters
                                                        ? 'Intenta ajustar los filtros para ver más resultados'
                                                        : 'No hay órdenes de producción registradas en el sistema'}
                                                </p>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    orps.data.map((orp) => {
                                        const avance = calcularAvance(orp);
                                        const estadoActual =
                                            getEstadoActual(orp);
                                        const estaCambiandoEstado =
                                            cambiandoEstados[orp.id];

                                        return (
                                            <TableRow
                                                key={orp.id}
                                                className="hover:bg-muted/50"
                                            >
                                                <TableCell>
                                                    <span className="font-mono text-sm font-medium text-foreground">
                                                        {orp.codigo}
                                                    </span>
                                                </TableCell>
                                                <TableCell>
                                                    <div className="font-medium text-foreground">
                                                        {orp.producto_terminado
                                                            ?.nombre_sap || '-'}
                                                    </div>
                                                    {orp.producto_terminado
                                                        ?.codigo_sap && (
                                                        <div className="text-xs text-muted-foreground">
                                                            SAP:{' '}
                                                            {
                                                                orp
                                                                    .producto_terminado
                                                                    .codigo_sap
                                                            }
                                                        </div>
                                                    )}
                                                </TableCell>
                                                <TableCell>
                                                    <span className="font-mono text-sm font-medium text-foreground">
                                                        {orp.lote / 1}
                                                    </span>
                                                </TableCell>
                                                <TableCell>
                                                    {orp.prioridad && (
                                                        <span
                                                            className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium ${getPrioridadColor(orp.prioridad)}`}
                                                        >
                                                            {orp.prioridad
                                                                .charAt(0)
                                                                .toUpperCase() +
                                                                orp.prioridad.slice(
                                                                    1,
                                                                )}
                                                        </span>
                                                    )}
                                                </TableCell>
                                                <TableCell>
                                                    {orp.fecha_vencimiento1
                                                        ? new Date(
                                                              orp.fecha_vencimiento1,
                                                          ).toLocaleDateString()
                                                        : '-'}
                                                </TableCell>
                                                {/* <TableCell className="text-right">
                                                    <span className="font-medium text-foreground">
                                                        {orp.cantidad_programada?.toLocaleString() ||
                                                            '0'}
                                                    </span>
                                                    {orp.unidad && (
                                                        <div className="text-xs text-muted-foreground">
                                                            {orp.unidad.nombre}
                                                        </div>
                                                    )}
                                                </TableCell> */}
                                                <TableCell className="text-right">
                                                    <span className="font-medium text-foreground">
                                                        {orp.cantidad_producida?.toLocaleString() ||
                                                            '0'}
                                                    </span>
                                                </TableCell>
                                                {/* <TableCell>
                                                    <div className="flex items-center gap-2">
                                                        <div className="h-2 w-16 rounded-full bg-muted">
                                                            <div
                                                                className="h-2 rounded-full bg-primary"
                                                                style={{
                                                                    width: `${Math.min(avance, 100)}%`,
                                                                }}
                                                            />
                                                        </div>
                                                        <span className="w-8 text-xs font-medium text-foreground">
                                                            {avance.toFixed(1)}%
                                                        </span>
                                                    </div>
                                                </TableCell> */}
                                                {/* <TableCell className="text-muted-foreground">
                                                    {orp.ubicacion?.nombre ||
                                                        '-'}
                                                </TableCell> */}
                                                <TableCell>
                                                    {hasPermission('u_orp') ? (
                                                        <DropdownMenu>
                                                            <DropdownMenuTrigger
                                                                asChild
                                                            >
                                                                <Button
                                                                    variant="outline"
                                                                    size="sm"
                                                                    disabled={
                                                                        estaCambiandoEstado
                                                                    }
                                                                    className={`h-7 border-0 px-3 text-xs font-medium ${getEstadoColor(estadoActual.nombre)} flex items-center gap-1`}
                                                                >
                                                                    {estaCambiandoEstado ? (
                                                                        <div className="h-3 w-3 animate-spin rounded-full border-2 border-current border-t-transparent" />
                                                                    ) : (
                                                                        <>
                                                                            {
                                                                                estadoActual.nombre
                                                                            }
                                                                            <ChevronDown className="h-3 w-3" />
                                                                        </>
                                                                    )}
                                                                </Button>
                                                            </DropdownMenuTrigger>
                                                            <DropdownMenuContent
                                                                align="start"
                                                                className="w-48"
                                                            >
                                                                {NOMBRES_ESTADOS.map(
                                                                    (
                                                                        nombreEstado,
                                                                    ) => (
                                                                        <DropdownMenuItem
                                                                            key={
                                                                                nombreEstado
                                                                            }
                                                                            onClick={() =>
                                                                                handleCambiarEstado(
                                                                                    orp.id,
                                                                                    nombreEstado,
                                                                                )
                                                                            }
                                                                            className="flex cursor-pointer items-center justify-between"
                                                                        >
                                                                            <span>
                                                                                {
                                                                                    nombreEstado
                                                                                }
                                                                            </span>
                                                                            {estadoActual.nombre ===
                                                                                nombreEstado && (
                                                                                <Check className="h-4 w-4" />
                                                                            )}
                                                                        </DropdownMenuItem>
                                                                    ),
                                                                )}
                                                            </DropdownMenuContent>
                                                        </DropdownMenu>
                                                    ) : (
                                                        <span
                                                            className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium ${getEstadoColor(estadoActual.nombre)}`}
                                                        >
                                                            {
                                                                estadoActual.nombre
                                                            }
                                                        </span>
                                                    )}
                                                </TableCell>
                                                <TableCell>
                                                    <span
                                                        className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium ${
                                                            orp.revisado
                                                                ? 'bg-green-100 text-green-800 dark:bg-green-800/30 dark:text-green-400'
                                                                : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-800/30 dark:text-yellow-400'
                                                        }`}
                                                    >
                                                        {orp.revisado
                                                            ? 'Sí'
                                                            : 'No'}
                                                    </span>
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
                                                            {/* <DropdownMenuItem
                                                                onClick={() =>
                                                                    handleView(
                                                                        orp.id,
                                                                    )
                                                                }
                                                            >
                                                                <Eye className="mr-2 h-4 w-4" />
                                                                <span>
                                                                    Ver detalles
                                                                </span>
                                                            </DropdownMenuItem> */}
                                                            {/* Nuevo botón para ver reporte detallado */}
                                                            <DropdownMenuItem
                                                                onClick={() =>
                                                                    router.visit(
                                                                        route(
                                                                            'orps.reporte.show',
                                                                            orp.id,
                                                                        ),
                                                                    )
                                                                }
                                                            >
                                                                <FileText className="mr-2 h-4 w-4" />
                                                                <span>
                                                                    Ver reporte
                                                                    completo
                                                                </span>
                                                            </DropdownMenuItem>
                                                            {hasPermission(
                                                                'u_orp',
                                                            ) && (
                                                                <DropdownMenuItem
                                                                    onClick={() =>
                                                                        handleEdit(
                                                                            orp.id,
                                                                        )
                                                                    }
                                                                >
                                                                    <Edit className="mr-2 h-4 w-4" />
                                                                    <span>
                                                                        Editar
                                                                    </span>
                                                                </DropdownMenuItem>
                                                            )}
                                                            {canDo(
                                                                orp,
                                                                'd_orp',
                                                                1,
                                                                false,
                                                                false,
                                                                false,
                                                            ) && (
                                                                <DropdownMenuItem
                                                                    onClick={() =>
                                                                        handleDelete(
                                                                            orp.id,
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
                                        );
                                    })
                                )}
                            </TableBody>
                        </Table>
                    </div>

                    {/* Paginación */}
                    {orps.data.length > 0 && (
                        <div className="border-t border-border px-4 py-3">
                            <TablePagination
                                pagination={orps}
                                onPageChange={(page) =>
                                    router.get(
                                        route('orps.index'),
                                        { ...filters, page },
                                        { preserveState: true, replace: true },
                                    )
                                }
                            />
                        </div>
                    )}
                </div>

                {/* Información de resumen */}
                <div className="flex justify-between">
                    <p className="mt-1 text-sm text-muted-foreground">
                        {orps.total} órdenes de producción registradas
                    </p>
                    <div>
                        {orps.data.length > 0 && (
                            <div className="text-center">
                                <p className="text-sm text-muted-foreground">
                                    Mostrando{' '}
                                    <span className="font-medium text-foreground">
                                        {orps.data.length}
                                    </span>{' '}
                                    de{' '}
                                    <span className="font-medium text-foreground">
                                        {orps.total}
                                    </span>{' '}
                                    órdenes
                                </p>
                            </div>
                        )}
                    </div>
                </div>

                {/* Modal de Importación */}
                {showImportModal && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
                        <div className="w-full max-w-md rounded-lg bg-background p-6">
                            <h3 className="mb-4 text-lg font-semibold">
                                Importar Órdenes de Producción
                            </h3>

                            <div className="space-y-4">
                                <div>
                                    <label className="mb-2 block text-sm font-medium">
                                        Archivo (Excel/CSV)
                                    </label>
                                    <Input
                                        type="file"
                                        accept=".xlsx,.xls,.csv"
                                        onChange={(e) =>
                                            setImportFile(
                                                e.target.files?.[0] || null,
                                            )
                                        }
                                    />
                                    <p className="mt-1 text-xs text-muted-foreground">
                                        Formatos soportados: .xlsx, .xls, .csv
                                    </p>
                                </div>

                                <div className="rounded bg-muted p-3 text-sm">
                                    <h4 className="mb-2 font-medium">
                                        Formato esperado:
                                    </h4>
                                    <p>
                                        <strong>Columnas:</strong> Código,
                                        Producto ID, Lote, Prioridad, Cantidad
                                        Programada, Unidad ID, Ubicación ID,
                                        etc.
                                    </p>
                                    <p className="mt-1 text-xs">
                                        Descarga la plantilla de ejemplo para
                                        ver el formato correcto.
                                    </p>
                                </div>

                                <div className="flex justify-end gap-2">
                                    <Button
                                        variant="outline"
                                        onClick={() => {
                                            setShowImportModal(false);
                                            setImportFile(null);
                                        }}
                                    >
                                        Cancelar
                                    </Button>
                                    <Button
                                        onClick={handleImport}
                                        disabled={!importFile}
                                    >
                                        <Upload className="mr-2 h-4 w-4" />
                                        Importar
                                    </Button>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </AppLayout>
    );
}
