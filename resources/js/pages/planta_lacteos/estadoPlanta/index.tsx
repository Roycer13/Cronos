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
    Beaker,
    Check,
    ChevronDown,
    Clock,
    Eye,
    Factory,
    Filter,
    MoreHorizontal,
    Plus,
    Search,
    Trash2,
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
    { title: 'Estados de Planta', href: '/estados-planta' },
];

interface PageProps {
    estadosPlanta: {
        data: any[];
        links: any[];
        current_page: number;
        last_page: number;
        per_page: number;
        total: number;
    };
    filters: {
        search?: string;
        origen_id?: number;
        proceso_id?: number;
        etapa_id?: number;
        user_id?: number;
        per_page?: number;
    };
    origenes?: { id: number; alias: string; descripcion: string }[];
    estados?: { id: number; nombre: string }[];
    usuarios?: { id: number; name: string }[];
    flash: {
        success?: string;
        error?: string;
    };
}

// Configuración de colores para procesos - ACTUALIZADA
const PROCESOS_CONFIG = {
    Produccion: {
        // Sin acento
        color: 'bg-green-100 text-green-800 dark:bg-green-800/30 dark:text-green-400',
        puedeSolicitarAnalisis: true,
    },
    'Vacio Limpio': {
        // Nombre completo
        color: 'bg-gray-100 text-gray-800 dark:bg-gray-800/30 dark:text-gray-400',
        puedeSolicitarAnalisis: false,
    },
    'Vacio Sucio': {
        // Agregar este
        color: 'bg-gray-100 text-gray-800 dark:bg-gray-800/30 dark:text-gray-400',
        puedeSolicitarAnalisis: false,
    },
    Limpio: {
        color: 'bg-blue-100 text-blue-800 dark:bg-blue-800/30 dark:text-blue-400',
        puedeSolicitarAnalisis: true,
    },
    Sucio: {
        color: 'bg-orange-100 text-orange-800 dark:bg-orange-800/30 dark:text-orange-400',
        puedeSolicitarAnalisis: false,
    },
    'En Limpieza': {
        color: 'bg-cyan-100 text-cyan-800 dark:bg-cyan-800/30 dark:text-cyan-400',
        puedeSolicitarAnalisis: true,
    },
    'En Mantenimiento': {
        color: 'bg-purple-100 text-purple-800 dark:bg-purple-800/30 dark:text-purple-400',
        puedeSolicitarAnalisis: false,
    },
    Almacenando: {
        color: 'bg-indigo-100 text-indigo-800 dark:bg-indigo-800/30 dark:text-indigo-400',
        puedeSolicitarAnalisis: false,
    },
};

export default function Index() {
    const { props } = usePage();
    const [showFilters, setShowFilters] = useState(false);
    const [expandedRows, setExpandedRows] = useState<number[]>([]);

    const { hasPermission, canDo, user: authUser } = useAuth();

    // Destructuración de props
    const {
        estadosPlanta = {
            data: [],
            links: [],
            current_page: 1,
            last_page: 1,
            per_page: 10,
            total: 0,
        },
        filters: initialFilters = {},
        origenes = [],
        estados = [],
        usuarios = [],
        flash,
    } = props as unknown as PageProps;

    // Hook para manejar filtros avanzados
    const { filters, updateFilter, resetFilters } = useAdvancedFilters({
        routeName: 'estados-planta.index',
        initialFilters: {
            search: initialFilters.search || '',
            origen_id: initialFilters.origen_id?.toString() || undefined,
            proceso_id: initialFilters.proceso_id?.toString() || undefined,
            etapa_id: initialFilters.etapa_id?.toString() || undefined,
            user_id: initialFilters.user_id?.toString() || undefined,
            per_page: initialFilters.per_page?.toString() || '10',
        },
        debounceFields: ['search'],
        debounceDelay: 600,
    });

    // Verificar si hay filtros activos
    const hasActiveFilters = Object.values(filters).some(
        (value) => value && value !== '' && value !== '10',
    );

    const handleSolicitarAnalisis = (id: number) => {
        if (
            confirm(
                '¿Está seguro de que desea enviar una solicitud de análisis para este estado?',
            )
        ) {
            router.post(
                route('estados-planta.solicitar-analisis', id),
                {},
                {
                    preserveScroll: true,
                    onSuccess: () => {
                        // Recargar la página para actualizar los datos
                        router.reload();
                    },
                },
            );
        }
    };

    // Handlers para acciones
    const handleEdit = (id: number) => {
        router.visit(route('estados-planta.edit', id));
    };

    const handleDelete = (id: number) => {
        if (confirm('¿Está seguro de eliminar este estado de planta?')) {
            router.delete(route('estados-planta.destroy', id), {
                preserveScroll: true,
            });
        }
    };

    const handleView = (id: number) => {
        router.visit(route('estados-planta.show', id));
    };

    // Toggle para expandir/fila
    const toggleRowExpansion = (id: number) => {
        setExpandedRows((prev) =>
            prev.includes(id)
                ? prev.filter((rowId) => rowId !== id)
                : [...prev, id],
        );
    };

    // Obtener color del proceso por nombre
    const getProcesoColor = (procesoNombre: string) => {
        return (
            PROCESOS_CONFIG[procesoNombre as keyof typeof PROCESOS_CONFIG]
                ?.color ||
            'bg-gray-100 text-gray-800 dark:bg-gray-800/30 dark:text-gray-400'
        );
    };

    // Formatear fecha
    const formatFecha = (fecha: string) => {
        return new Date(fecha).toLocaleString('es-ES', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        });
    };

    // Función para verificar si un proceso puede solicitar análisis
    const puedeSolicitarAnalisis = (procesoNombre: string) => {
        return (
            PROCESOS_CONFIG[procesoNombre as keyof typeof PROCESOS_CONFIG]
                ?.puedeSolicitarAnalisis || false
        );
    };

    // Función para verificar si ya tiene solicitud de análisis
    const tieneSolicitudAnalisis = (estadoPlanta: any) => {
        return (
            estadoPlanta.analisis_linea &&
            estadoPlanta.analisis_linea.length > 0
        );
    };
    // Justo antes del return en el componente, agrega:
    console.log('Datos de estadosPlanta:', estadosPlanta.data);
    estadosPlanta.data.forEach((estado, index) => {
        console.log(`Estado ${index}:`, {
            id: estado.id,
            proceso: estado.proceso?.nombre,
            puedeSolicitar: puedeSolicitarAnalisis(estado.proceso?.nombre),
            tieneSolicitud: tieneSolicitudAnalisis(estado),
            solicitud: estado.analisis_linea,
        });
    });

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Estados de Planta" />
            <div className="space-y-2 px-2 py-2 sm:px-6">
                <Toast />

                {/* Header con búsqueda y botones */}
                <div className="flex items-center justify-between">
                    {/* Búsqueda rápida */}
                    <div className="relative max-w-md">
                        <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 transform text-muted-foreground" />
                        <Input
                            placeholder="Buscar en observaciones..."
                            value={filters.search}
                            onChange={(e) =>
                                updateFilter('search', e.target.value)
                            }
                            className="pl-10"
                        />
                    </div>

                    {/* Botones de acción */}
                    <div className="flex items-center gap-2">
                        {hasPermission('c_estadosPlanta') && (
                            <Link href={route('estados-planta.create')}>
                                <Button size="sm">
                                    <Plus className="h-4 w-4" />
                                    <p className="hidden md:block">
                                        Nuevo Estado
                                    </p>
                                </Button>
                            </Link>
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
                            <FilterSelect
                                value={filters.origen_id}
                                onChange={(v) => updateFilter('origen_id', v)}
                                placeholder="Origen"
                                options={origenes.map((o) => ({
                                    value: o.id.toString(),
                                    label: o.alias,
                                }))}
                            />

                            <FilterSelect
                                value={filters.proceso_id}
                                onChange={(v) => updateFilter('proceso_id', v)}
                                placeholder="Proceso"
                                options={estados.map((e) => ({
                                    value: e.id.toString(),
                                    label: e.nombre,
                                }))}
                            />

                            <FilterSelect
                                value={filters.etapa_id}
                                onChange={(v) => updateFilter('etapa_id', v)}
                                placeholder="Etapa"
                                options={estados.map((e) => ({
                                    value: e.id.toString(),
                                    label: e.nombre,
                                }))}
                            />

                            <FilterSelect
                                value={filters.user_id}
                                onChange={(v) => updateFilter('user_id', v)}
                                placeholder="Usuario"
                                options={usuarios.map((u) => ({
                                    value: u.id.toString(),
                                    label: u.name,
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

                {/* Tabla de Estados de Planta */}
                <div className="overflow-hidden rounded-lg border border-border bg-background shadow-sm">
                    <div className="overflow-x-auto">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    {[
                                        'Fecha/Hora',
                                        'Origen',
                                        'Proceso',
                                        'Etapa',
                                        'Observaciones',
                                        'Usuario',
                                        'Detalles',
                                        '',
                                    ].map((col, idx) => (
                                        <TableHead key={idx}>{col}</TableHead>
                                    ))}
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {estadosPlanta.data.length === 0 ? (
                                    <TableRow>
                                        <TableCell
                                            colSpan={8}
                                            className="py-8 text-center text-muted-foreground"
                                        >
                                            <div className="flex flex-col items-center justify-center">
                                                <Factory className="mb-3 h-12 w-12 text-muted-foreground/50" />
                                                <p className="mb-1 text-lg font-medium text-foreground">
                                                    No se encontraron estados de
                                                    planta
                                                </p>
                                                <p className="text-sm text-muted-foreground">
                                                    {hasActiveFilters
                                                        ? 'Intenta ajustar los filtros para ver más resultados'
                                                        : 'No hay estados de planta registrados en el sistema'}
                                                </p>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    estadosPlanta.data.map((estadoPlanta) => {
                                        const isExpanded =
                                            expandedRows.includes(
                                                estadoPlanta.id,
                                            );
                                        const tieneDetalles =
                                            estadoPlanta.detalles &&
                                            estadoPlanta.detalles.length > 0;
                                        const puedeSolicitar =
                                            puedeSolicitarAnalisis(
                                                estadoPlanta.proceso?.nombre,
                                            );
                                        const yaTieneSolicitud =
                                            tieneSolicitudAnalisis(
                                                estadoPlanta,
                                            );

                                        return (
                                            <>
                                                <TableRow
                                                    key={estadoPlanta.id}
                                                    className="hover:bg-muted/50"
                                                >
                                                    <TableCell>
                                                        <div className="flex items-center gap-2">
                                                            <Clock className="h-4 w-4 text-muted-foreground" />
                                                            <span className="text-sm font-medium text-foreground">
                                                                {formatFecha(
                                                                    estadoPlanta.tiempo,
                                                                )}
                                                            </span>
                                                        </div>
                                                    </TableCell>
                                                    <TableCell>
                                                        <div className="font-medium text-foreground">
                                                            {
                                                                estadoPlanta
                                                                    .origen
                                                                    ?.alias
                                                            }
                                                        </div>
                                                        {estadoPlanta.origen
                                                            ?.descripcion && (
                                                            <div className="text-xs text-muted-foreground">
                                                                {
                                                                    estadoPlanta
                                                                        .origen
                                                                        .descripcion
                                                                }
                                                            </div>
                                                        )}
                                                    </TableCell>
                                                    <TableCell>
                                                        <span
                                                            className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium ${getProcesoColor(estadoPlanta.proceso?.nombre)}`}
                                                        >
                                                            {
                                                                estadoPlanta
                                                                    .proceso
                                                                    ?.nombre
                                                            }
                                                        </span>
                                                    </TableCell>
                                                    <TableCell>
                                                        <span className="text-sm text-foreground">
                                                            {
                                                                estadoPlanta
                                                                    .etapa
                                                                    ?.nombre
                                                            }
                                                        </span>
                                                    </TableCell>
                                                    <TableCell className="max-w-xs">
                                                        <div className="truncate text-sm text-muted-foreground">
                                                            {estadoPlanta.observaciones ||
                                                                '-'}
                                                        </div>
                                                    </TableCell>
                                                    <TableCell>
                                                        <span className="text-sm text-foreground">
                                                            {
                                                                estadoPlanta
                                                                    .user?.name
                                                            }
                                                        </span>
                                                    </TableCell>
                                                    <TableCell>
                                                        {tieneDetalles ? (
                                                            <Button
                                                                variant="outline"
                                                                size="sm"
                                                                onClick={() =>
                                                                    toggleRowExpansion(
                                                                        estadoPlanta.id,
                                                                    )
                                                                }
                                                                className="h-7 text-xs"
                                                            >
                                                                <Beaker className="mr-1 h-3 w-3" />
                                                                {
                                                                    estadoPlanta
                                                                        .detalles
                                                                        .length
                                                                }{' '}
                                                                detalle(s)
                                                                <ChevronDown
                                                                    className={`ml-1 h-3 w-3 transition-transform ${isExpanded ? 'rotate-180' : ''}`}
                                                                />
                                                            </Button>
                                                        ) : (
                                                            <span className="text-xs text-muted-foreground">
                                                                -
                                                            </span>
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
                                                                        Abrir
                                                                        menú
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
                                                                            estadoPlanta.id,
                                                                        )
                                                                    }
                                                                >
                                                                    <Eye className="mr-2 h-4 w-4" />
                                                                    <span>
                                                                        Ver
                                                                        detalles
                                                                    </span>
                                                                </DropdownMenuItem>

                                                                {/* Botón para solicitar análisis - solo visible para procesos permitidos y si no tiene solicitud */}
                                                                {puedeSolicitar &&
                                                                    !yaTieneSolicitud && (
                                                                        <DropdownMenuItem
                                                                            onClick={() =>
                                                                                handleSolicitarAnalisis(
                                                                                    estadoPlanta.id,
                                                                                )
                                                                            }
                                                                        >
                                                                            <Beaker className="mr-2 h-4 w-4" />
                                                                            <span>
                                                                                Solicitar
                                                                                Análisis
                                                                            </span>
                                                                        </DropdownMenuItem>
                                                                    )}

                                                                {/* Mostrar estado de solicitud si existe */}
                                                                {yaTieneSolicitud && (
                                                                    <DropdownMenuItem className="cursor-default text-blue-600">
                                                                        <Check className="mr-2 h-4 w-4" />
                                                                        <span>
                                                                            Análisis:{' '}
                                                                            {estadoPlanta
                                                                                .analisis_linea[0]
                                                                                ?.estado
                                                                                ?.nombre ||
                                                                                'Pendiente'}
                                                                        </span>
                                                                    </DropdownMenuItem>
                                                                )}

                                                                {/* {hasPermission('u_estado_planta') && (
                                                                    <DropdownMenuItem onClick={() => handleEdit(estadoPlanta.id)}>
                                                                        <Edit className="mr-2 h-4 w-4" />
                                                                        <span>Editar</span>
                                                                    </DropdownMenuItem>
                                                                )} */}
                                                                {canDo(
                                                                    estadoPlanta,
                                                                    'd_estadosPlanta',
                                                                    8,
                                                                    true,
                                                                    false,
                                                                    false,
                                                                ) && (
                                                                    <DropdownMenuItem
                                                                        onClick={() =>
                                                                            handleDelete(
                                                                                estadoPlanta.id,
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

                                                {/* Fila expandible para detalles */}
                                                {isExpanded &&
                                                    tieneDetalles && (
                                                        <TableRow className="bg-muted/30">
                                                            <TableCell
                                                                colSpan={8}
                                                                className="p-0"
                                                            >
                                                                <div className="border-t border-border p-4">
                                                                    <h4 className="mb-3 flex items-center gap-2 text-sm font-semibold">
                                                                        <Beaker className="h-4 w-4" />
                                                                        Detalles
                                                                        de
                                                                        Producción
                                                                    </h4>
                                                                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
                                                                        {estadoPlanta.detalles.map(
                                                                            (
                                                                                detalle: any,
                                                                                index: number,
                                                                            ) => (
                                                                                <div
                                                                                    key={
                                                                                        detalle.id
                                                                                    }
                                                                                    className="rounded-lg border border-border bg-background p-3"
                                                                                >
                                                                                    <div className="mb-2 flex items-center justify-between">
                                                                                        <span className="text-sm font-medium">
                                                                                            ORP:{' '}
                                                                                            {detalle
                                                                                                .orp
                                                                                                ?.codigo ||
                                                                                                'N/A'}
                                                                                        </span>
                                                                                        <span className="rounded bg-primary/10 px-2 py-1 text-xs text-primary">
                                                                                            #
                                                                                            {index +
                                                                                                1}
                                                                                        </span>
                                                                                    </div>
                                                                                    <div className="space-y-1 text-sm">
                                                                                        <div className="flex justify-between">
                                                                                            <span className="text-muted-foreground">
                                                                                                Preparación:
                                                                                            </span>
                                                                                            <span className="font-medium">
                                                                                                {
                                                                                                    detalle.preparacion
                                                                                                }
                                                                                            </span>
                                                                                        </div>
                                                                                        <div className="flex justify-between">
                                                                                            <span className="text-muted-foreground">
                                                                                                Cantidad:
                                                                                            </span>
                                                                                            <span className="font-medium">
                                                                                                {
                                                                                                    detalle.cantidad
                                                                                                }{' '}
                                                                                                L
                                                                                            </span>
                                                                                        </div>
                                                                                        <div className="flex justify-between">
                                                                                            <span className="text-muted-foreground">
                                                                                                Usuario:
                                                                                            </span>
                                                                                            <span className="font-medium">
                                                                                                {
                                                                                                    detalle
                                                                                                        .user
                                                                                                        ?.name
                                                                                                }
                                                                                            </span>
                                                                                        </div>
                                                                                    </div>
                                                                                </div>
                                                                            ),
                                                                        )}
                                                                    </div>
                                                                </div>
                                                            </TableCell>
                                                        </TableRow>
                                                    )}
                                            </>
                                        );
                                    })
                                )}
                            </TableBody>
                        </Table>
                    </div>

                    {/* Paginación */}
                    {estadosPlanta.data.length > 0 && (
                        <div className="border-t border-border px-4 py-3">
                            <TablePagination
                                pagination={estadosPlanta}
                                onPageChange={(page) =>
                                    router.get(
                                        route('estados-planta.index'),
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
                        {estadosPlanta.total} estados de planta registrados
                    </p>
                    <div>
                        {estadosPlanta.data.length > 0 && (
                            <div className="text-center">
                                <p className="text-sm text-muted-foreground">
                                    Mostrando{' '}
                                    <span className="font-medium text-foreground">
                                        {estadosPlanta.data.length}
                                    </span>{' '}
                                    de{' '}
                                    <span className="font-medium text-foreground">
                                        {estadosPlanta.total}
                                    </span>{' '}
                                    registros
                                </p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
