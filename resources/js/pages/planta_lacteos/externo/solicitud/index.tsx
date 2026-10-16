// resources/js/Pages/PlantaLacteos/LaboratorioExterno/Solicitudes/Index.tsx
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
    AlertCircle,
    Beaker,
    Calendar,
    CheckCircle,
    ChevronDown,
    ChevronRight,
    Clock,
    Edit,
    Eye,
    FileText,
    Filter,
    Hash,
    MoreHorizontal,
    Package,
    Plus,
    Search,
    Trash2,
    User,
    User as UserIcon,
    X,
} from 'lucide-react';
import { useState } from 'react';
import { route } from 'ziggy-js';

import { Badge } from '@/components/ui/badge';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import TablePagination from '@/components/ui/table-pagination';

const breadcrumbs: BreadcrumbItem[] = [
    // { title: "Laboratorio Externo", href: route('laboratorio-externo.solicitudes.index') },
     { title: "Solicitudes", href: route('solicitudes.laboratorio-externo.solicitudes.index') },
];

interface Detalle {
    id: number;
    codigo: string;
    tipo: 'producto_terminado' | 'item_materia_prima' | 'user' | 'otros';
    lote?: string;
    fecha_elaboracion?: string;
    fecha_vencimiento?: string;
    fecha_muestreo?: string;
    observacion?: string;
    tipo_muestra: {
        id: number;
        nombre: string;
        norma_microbiologico?: string;
        norma_fisicoquimico?: string;
    };
    producto_terminado?: { id: number; nombre: string; codigo: string };
    item_materia_prima?: { id: number; nombre: string; codigo: string };
    user?: { id: number; name: string };
    otros?: string;
    estado: { id: number; nombre: string };
}

interface PageProps {
    solicitudes: {
        data: Array<{
            id: number;
            codigo: string;
            tiempo: string;
            tiempo_autorizacion: string | null;
            observacion: string | null;
            estado: { id: number; nombre: string; color: string } | null;
            user: { id: number; name: string; email: string } | null;
            autorizante: { id: number; name: string } | null;
            ubicacion: { id: number; nombre: string } | null;
            detalles: Detalle[];
        }>;
        links: any[];
        current_page: number;
        last_page: number;
        per_page: number;
        total: number;
    };
    filters: {
        search?: string;
        user_id?: number;
        autorizante_id?: number;
        estado_id?: number;
        ubicacion_id?: number;
        tiempo_desde?: string;
        tiempo_hasta?: string;
        tiempo_autorizacion_desde?: string;
        tiempo_autorizacion_hasta?: string;
        per_page?: number;
        codigo?: string;
        observacion?: string;
    };
    estados: Array<{ value: number; label: string }>;
    usuarios: Array<{ value: number; label: string }>;
    ubicaciones: Array<{ value: number; label: string }>;
    autorizantes: Array<{ value: number; label: string }>;
    flash: {
        success?: string;
        error?: string;
    };
    user_permissions: {
        crear_solicitud: boolean;
        editar_todas_solicitudes: boolean;
        eliminar_todas_solicitudes: boolean;
        ver_todas_solicitudes: boolean;
    };
}

export default function Index() {
    const { props } = usePage();
    const [showFilters, setShowFilters] = useState(false);
    const [expandedRows, setExpandedRows] = useState<number[]>([]);

    const {
        hasPermission,
        belongsToUbicacion,
        canDo,
        user: authUser,
    } = useAuth();

    const {
        solicitudes = {
            data: [],
            links: [],
            current_page: 1,
            last_page: 1,
            per_page: 10,
            total: 0,
        },
        filters: initialFilters = {},
        estados = [],
        usuarios = [],
        ubicaciones = [],
        autorizantes = [],
        flash,
        user_permissions,
    } = props as unknown as PageProps;

    const { filters, updateFilter, resetFilters } = useAdvancedFilters({
        routeName: 'laboratorio-externo.solicitudes.index',
        initialFilters: {
            search: initialFilters.search || '',
            user_id: initialFilters.user_id?.toString() || undefined,
            autorizante_id:
                initialFilters.autorizante_id?.toString() || undefined,
            estado_id: initialFilters.estado_id?.toString() || undefined,
            ubicacion_id: initialFilters.ubicacion_id?.toString() || undefined,
            tiempo_desde: initialFilters.tiempo_desde || '',
            tiempo_hasta: initialFilters.tiempo_hasta || '',
            tiempo_autorizacion_desde:
                initialFilters.tiempo_autorizacion_desde || '',
            tiempo_autorizacion_hasta:
                initialFilters.tiempo_autorizacion_hasta || '',
            per_page: initialFilters.per_page?.toString() || '10',
            codigo: initialFilters.codigo || '',
            observacion: initialFilters.observacion || '',
        },
        debounceFields: ['search', 'codigo', 'observacion'],
        debounceDelay: 600,
    });

    const hasActiveFilters = Object.values(filters).some(
        (value) => value && value !== '' && value !== '10',
    );

    const handleEdit = (id: number) => {
        router.visit(route('laboratorio-externo.solicitudes.edit', id));
    };

    const handleDelete = (id: number) => {
        if (confirm('¿Eliminar esta solicitud?')) {
            router.delete(
                route('laboratorio-externo.solicitudes.destroy', id),
                {
                    preserveScroll: true,
                },
            );
        }
    };

    const handleView = (id: number) => {
        router.visit(route('laboratorio-externo.solicitudes.show', id));
    };

    const toggleRow = (id: number) => {
        setExpandedRows((prev) =>
            prev.includes(id)
                ? prev.filter((rowId) => rowId !== id)
                : [...prev, id],
        );
    };

    const formatDate = (dateString: string | null) => {
        if (!dateString) return '-';
        const date = new Date(dateString);
        return date.toLocaleDateString('es-ES', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
        });
    };

    const getEstadoColor = (estadoNombre: string) => {
        const colors: Record<string, string> = {
            Pendiente:
                'bg-yellow-100 text-yellow-800 dark:bg-yellow-800/30 dark:text-yellow-400',
            Autorizada:
                'bg-green-100 text-green-800 dark:bg-green-800/30 dark:text-green-400',
            Rechazada:
                'bg-red-100 text-red-800 dark:bg-red-800/30 dark:text-red-400',
            'En proceso':
                'bg-blue-100 text-blue-800 dark:bg-blue-800/30 dark:text-blue-400',
            Completada:
                'bg-purple-100 text-purple-800 dark:bg-purple-800/30 dark:text-purple-400',
        };
        return (
            colors[estadoNombre] ||
            'bg-gray-100 text-gray-800 dark:bg-gray-800/30 dark:text-gray-400'
        );
    };

    const getEstadoIcon = (estadoNombre: string) => {
        const icons: Record<string, any> = {
            Pendiente: Clock,
            Autorizada: CheckCircle,
            Rechazada: AlertCircle,
            'En proceso': Clock,
            Completada: CheckCircle,
        };
        return icons[estadoNombre] || Clock;
    };

    const getTipoIcon = (tipo: string) => {
        switch (tipo) {
            case 'producto_terminado':
                return Package;
            case 'item_materia_prima':
                return Beaker;
            case 'user':
                return UserIcon;
            case 'otros':
                return Hash;
            default:
                return FileText;
        }
    };

    const getItemName = (detalle: Detalle) => {
        switch (detalle.tipo) {
            case 'producto_terminado':
                return detalle.producto_terminado?.nombre || 'N/A';
            case 'item_materia_prima':
                return detalle.item_materia_prima?.nombre || 'N/A';
            case 'user':
                return detalle.user?.name || 'N/A';
            case 'otros':
                return detalle.otros || 'N/A';
            default:
                return 'N/A';
        }
    };

    const getItemCodigo = (detalle: Detalle) => {
        switch (detalle.tipo) {
            case 'producto_terminado':
                return detalle.producto_terminado?.codigo;
            case 'item_materia_prima':
                return detalle.item_materia_prima?.codigo;
            default:
                return undefined;
        }
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Solicitudes de Laboratorio Externo" />
            <div className="space-y-2 px-2 py-2 sm:px-6">
                <Toast />
                {/* Header */}
                <div className="flex items-center justify-between">
                    {/* Búsqueda rápida */}
                    <div className="relative max-w-md">
                        <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 transform text-muted-foreground" />
                        <Input
                            placeholder="Buscar por código, observación..."
                            value={filters.search}
                            onChange={(e) =>
                                updateFilter('search', e.target.value)
                            }
                            className="pl-10"
                        />
                    </div>
                    <div className="flex items-center gap-2">

                            <Link
                                href={route(
                                    'solicitudes.laboratorio-externo.solicitudes.create',
                                )}
                            >
                                <Button size="sm">
                                    <Plus className="h-4 w-4" />
                                    <p className="hidden md:block">
                                        Nueva Solicitud
                                    </p>
                                </Button>
                            </Link>




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

                        <div className="grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-6">
                            <Input
                                placeholder="Código"
                                value={filters.codigo}
                                onChange={(e) =>
                                    updateFilter('codigo', e.target.value)
                                }
                                className="text-sm"
                            />

                            <Input
                                placeholder="Observación"
                                value={filters.observacion}
                                onChange={(e) =>
                                    updateFilter('observacion', e.target.value)
                                }
                                className="text-sm"
                            />

                            <FilterSelect
                                value={filters.user_id}
                                onChange={(v) => updateFilter('user_id', v)}
                                placeholder="Solicitante"
                                options={usuarios}
                            />

                            <FilterSelect
                                value={filters.autorizante_id}
                                onChange={(v) =>
                                    updateFilter('autorizante_id', v)
                                }
                                placeholder="Autorizante"
                                options={autorizantes}
                            />

                            <FilterSelect
                                value={filters.estado_id}
                                onChange={(v) => updateFilter('estado_id', v)}
                                placeholder="Estado"
                                options={estados}
                            />

                            <FilterSelect
                                value={filters.ubicacion_id}
                                onChange={(v) =>
                                    updateFilter('ubicacion_id', v)
                                }
                                placeholder="Ubicación"
                                options={ubicaciones}
                            />
                        </div>

                        {/* Filtros de fecha */}
                        <div className="mt-3 grid grid-cols-2 gap-3 md:grid-cols-4">
                            <div>
                                <label className="text-xs text-muted-foreground">
                                    Fecha solicitud desde
                                </label>
                                <Input
                                    type="date"
                                    value={filters.tiempo_desde}
                                    onChange={(e) =>
                                        updateFilter(
                                            'tiempo_desde',
                                            e.target.value,
                                        )
                                    }
                                    className="text-sm"
                                />
                            </div>
                            <div>
                                <label className="text-xs text-muted-foreground">
                                    Fecha solicitud hasta
                                </label>
                                <Input
                                    type="date"
                                    value={filters.tiempo_hasta}
                                    onChange={(e) =>
                                        updateFilter(
                                            'tiempo_hasta',
                                            e.target.value,
                                        )
                                    }
                                    className="text-sm"
                                />
                            </div>
                            <div>
                                <label className="text-xs text-muted-foreground">
                                    Fecha autorización desde
                                </label>
                                <Input
                                    type="date"
                                    value={filters.tiempo_autorizacion_desde}
                                    onChange={(e) =>
                                        updateFilter(
                                            'tiempo_autorizacion_desde',
                                            e.target.value,
                                        )
                                    }
                                    className="text-sm"
                                />
                            </div>
                            <div>
                                <label className="text-xs text-muted-foreground">
                                    Fecha autorización hasta
                                </label>
                                <Input
                                    type="date"
                                    value={filters.tiempo_autorizacion_hasta}
                                    onChange={(e) =>
                                        updateFilter(
                                            'tiempo_autorizacion_hasta',
                                            e.target.value,
                                        )
                                    }
                                    className="text-sm"
                                />
                            </div>
                        </div>

                        {/* Resultados por página */}
                        <div className="mt-3 flex justify-end">
                            <div className="w-48">
                                <FilterSelect
                                    value={filters.per_page}
                                    onChange={(v) =>
                                        updateFilter('per_page', v)
                                    }
                                    placeholder="Resultados por página"
                                    options={['10', '25', '50', '100'].map(
                                        (v) => ({
                                            value: v,
                                            label: `${v} por página`,
                                        }),
                                    )}
                                    includeAllOption={false}
                                />
                            </div>
                        </div>
                    </div>
                )}

                {/* Tabla */}
                <div className="overflow-hidden rounded-lg border border-border bg-background shadow-sm">
                    <div className="overflow-x-auto">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead className="w-12"></TableHead>
                                    {[
                                        'Código',
                                        'Fecha',
                                        'Solicitante',
                                        'Ubicación',
                                        'Estado',
                                        'Muestras',
                                        'Observación',
                                        '',
                                    ].map((col, idx) => (
                                        <TableHead key={idx}>{col}</TableHead>
                                    ))}
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {solicitudes.data.length === 0 ? (
                                    <TableRow>
                                        <TableCell
                                            colSpan={9}
                                            className="py-8 text-center text-muted-foreground"
                                        >
                                            <div className="flex flex-col items-center justify-center">
                                                <Search className="mb-3 h-12 w-12 text-muted-foreground/50" />
                                                <p className="mb-1 text-lg font-medium text-foreground">
                                                    No se encontraron
                                                    solicitudes
                                                </p>
                                                <p className="text-sm text-muted-foreground">
                                                    {hasActiveFilters
                                                        ? 'Intenta ajustar los filtros para ver más resultados'
                                                        : 'No hay solicitudes registradas en el sistema'}
                                                </p>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    solicitudes.data.map((solicitud) => {
                                        const isExpanded =
                                            expandedRows.includes(solicitud.id);
                                        return (
                                            <>
                                                <TableRow
                                                    key={solicitud.id}
                                                    className="hover:bg-muted/50"
                                                >
                                                    <TableCell>
                                                        <Button
                                                            variant="ghost"
                                                            size="sm"
                                                            className="h-8 w-8 p-0"
                                                            onClick={() =>
                                                                toggleRow(
                                                                    solicitud.id,
                                                                )
                                                            }
                                                        >
                                                            {isExpanded ? (
                                                                <ChevronDown className="h-4 w-4" />
                                                            ) : (
                                                                <ChevronRight className="h-4 w-4" />
                                                            )}
                                                        </Button>
                                                    </TableCell>
                                                    <TableCell>
                                                        <div className="flex items-center gap-2">
                                                            <FileText className="h-4 w-4 text-muted-foreground" />
                                                            <span className="font-mono text-sm font-medium text-foreground">
                                                                {
                                                                    solicitud.codigo
                                                                }
                                                            </span>
                                                        </div>
                                                    </TableCell>
                                                    <TableCell>
                                                        <div className="space-y-1">
                                                            <div className="flex items-center gap-1 text-sm">
                                                                <Calendar className="h-3 w-3 text-muted-foreground" />
                                                                <span className="font-medium text-foreground">
                                                                    {formatDate(
                                                                        solicitud.tiempo,
                                                                    )}
                                                                </span>
                                                            </div>
                                                            {solicitud.tiempo_autorizacion && (
                                                                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                                                                    <CheckCircle className="h-3 w-3" />
                                                                    Aut.:{' '}
                                                                    {formatDate(
                                                                        solicitud.tiempo_autorizacion,
                                                                    )}
                                                                </div>
                                                            )}
                                                        </div>
                                                    </TableCell>
                                                    <TableCell>
                                                        <div className="flex items-center gap-2">
                                                            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10">
                                                                <User className="h-4 w-4 text-primary" />
                                                            </div>
                                                            <div>
                                                                <div className="font-medium text-foreground">
                                                                    {
                                                                        solicitud
                                                                            .user
                                                                            ?.name
                                                                    }
                                                                </div>
                                                                <div className="text-xs font-medium text-muted-foreground">
                                                                    {
                                                                        solicitud
                                                                            .user
                                                                            ?.email
                                                                    }
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </TableCell>
                                                    <TableCell>
                                                        <Badge
                                                            variant="outline"
                                                            className="text-xs"
                                                        >
                                                            {solicitud.ubicacion
                                                                ?.nombre || '-'}
                                                        </Badge>
                                                    </TableCell>
                                                    <TableCell>
                                                        {solicitud.estado && (
                                                            <div className="flex items-center gap-2">
                                                                {(() => {
                                                                    const Icon =
                                                                        getEstadoIcon(
                                                                            solicitud
                                                                                .estado
                                                                                .nombre,
                                                                        );
                                                                    return (
                                                                        <Icon className="h-4 w-4" />
                                                                    );
                                                                })()}
                                                                <span
                                                                    className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium ${getEstadoColor(solicitud.estado.nombre)}`}
                                                                >
                                                                    {
                                                                        solicitud
                                                                            .estado
                                                                            .nombre
                                                                    }
                                                                </span>
                                                            </div>
                                                        )}
                                                    </TableCell>
                                                    <TableCell>
                                                        <div className="flex flex-wrap gap-1">
                                                            {solicitud.detalles
                                                                .slice(0, 2)
                                                                .map(
                                                                    (
                                                                        detalle,
                                                                    ) => (
                                                                        <span
                                                                            key={
                                                                                detalle.id
                                                                            }
                                                                            className="inline-flex items-center rounded bg-primary/10 px-2 py-1 text-xs font-medium text-primary"
                                                                        >
                                                                            {
                                                                                detalle
                                                                                    .tipo_muestra
                                                                                    .nombre
                                                                            }
                                                                        </span>
                                                                    ),
                                                                )}
                                                            {solicitud.detalles
                                                                .length > 2 && (
                                                                <span className="inline-flex items-center rounded bg-muted px-2 py-1 text-xs text-muted-foreground">
                                                                    +
                                                                    {solicitud
                                                                        .detalles
                                                                        .length -
                                                                        2}
                                                                </span>
                                                            )}
                                                        </div>
                                                    </TableCell>
                                                    <TableCell>
                                                        <div className="max-w-[200px]">
                                                            <p className="truncate text-sm text-muted-foreground">
                                                                {solicitud.observacion ||
                                                                    'Sin observación'}
                                                            </p>
                                                        </div>
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
                                                                            solicitud.id,
                                                                        )
                                                                    }
                                                                >
                                                                    <Eye className="mr-2 h-4 w-4" />
                                                                    <span>
                                                                        Ver
                                                                        detalles
                                                                    </span>
                                                                </DropdownMenuItem>
                                                                {(user_permissions.editar_todas_solicitudes ||
                                                                    solicitud
                                                                        .user
                                                                        ?.id ===
                                                                        authUser?.id) && (
                                                                    <DropdownMenuItem
                                                                        onClick={() =>
                                                                            handleEdit(
                                                                                solicitud.id,
                                                                            )
                                                                        }
                                                                    >
                                                                        <Edit className="mr-2 h-4 w-4" />
                                                                        <span>
                                                                            Editar
                                                                        </span>
                                                                    </DropdownMenuItem>
                                                                )}
                                                                {(user_permissions.eliminar_todas_solicitudes ||
                                                                    solicitud
                                                                        .user
                                                                        ?.id ===
                                                                        authUser?.id) && (
                                                                    <DropdownMenuItem
                                                                        onClick={() =>
                                                                            handleDelete(
                                                                                solicitud.id,
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

                                                {/* Fila expandida con detalles */}
{isExpanded && (
  <TableRow className="bg-muted/30">
    <TableCell colSpan={9} className="p-0">
      <div className="p-4">
        <div className="mb-3">
          <h4 className="mb-2 flex items-center gap-2 text-sm font-semibold">
            <Beaker className="h-4 w-4" />
            Detalles de las muestras ({solicitud.detalles.length})
          </h4>
          <div className="grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-5">
            {solicitud.detalles.map((detalle) => {
              const tipoAbrev = detalle.tipo === 'Microbiologico' ? 'MB' :
                               detalle.tipo === 'Fisicoquimico' ? 'FQ' :
                               detalle.tipo || '';
              const tipoMuestra = detalle.tipo_muestra?.nombre?.replace('_', ' ') || 'Tipo no especificado';
              const estadoColor = {
                'Pendiente': 'border-yellow-500 text-yellow-600',
                'Autorizada': 'border-green-500 text-green-600',
                'Rechazada': 'border-red-500 text-red-600'
              }[detalle.estado?.nombre] || 'border-gray-500 text-gray-600';

              return (
                <div key={detalle.id} className="rounded-lg border bg-background p-3 transition-colors hover:bg-muted/30">
                  {/* Header */}
                  <div className="mb-3 flex items-start justify-between">
                    <div className="flex items-center gap-2">
                      <div className="rounded-md bg-primary/10 p-2">{tipoAbrev}</div>
                      <div>
                        <p className="text-xs text-muted-foreground capitalize">{tipoMuestra}</p>
                      </div>
                    </div>
                    <Badge variant="outline" className="font-mono text-xs">
                      {solicitud.codigo}-{detalle.codigo || 'Sin código'}
                    </Badge>
                  </div>

                  {/* Información del Item */}
                  <div className="mb-3">
                    <span className="truncate text-sm font-medium block">
                      {detalle.user?.name || detalle.producto_terminado?.nombre || detalle.item_materia_prima?.nombre}
                    </span>
                  </div>

                  {/* Lote y Estado */}
                  <div className="mb-3 grid grid-cols-2 gap-2">
                    <div className="rounded bg-muted/30 p-2">
                      <div className="mb-1 flex items-center gap-1">
                        <Hash className="h-3 w-3 text-muted-foreground" />
                        <span className="text-xs text-muted-foreground">Lote</span>
                      </div>
                      <p className="truncate text-sm font-medium">{detalle.lote || 'N/A'}</p>
                    </div>

                    <div className="rounded bg-muted/30 p-2">
                      <div className="mb-1 flex items-center gap-1">
                        <Clock className="h-3 w-3 text-muted-foreground" />
                        <span className="text-xs text-muted-foreground">Estado</span>
                      </div>
                      <Badge variant="outline" className={`text-xs ${estadoColor}`}>
                        {detalle.estado?.nombre || 'Sin estado'}
                      </Badge>
                    </div>
                  </div>

                  {/* Fechas */}
                  <div className="mb-3 space-y-2">
                    {[
                      {cond: detalle.fecha_elaboracion, icon: Calendar, label: 'Elaboración'},
                      {cond: detalle.fecha_muestreo, icon: Beaker, label: 'Muestreo'},
                      {cond: detalle.fecha_vencimiento, icon: AlertCircle, label: 'Vencimiento'}
                    ].map(({cond, icon: Icon, label}) => cond && (
                      <div key={label} className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Icon className="h-3 w-3 text-muted-foreground" />
                          <span className="text-xs text-muted-foreground">{label}</span>
                        </div>
                        <span className="text-xs font-medium">{formatDate(cond)}</span>
                      </div>
                    ))}
                  </div>

                  {/* Normas y Observación */}
                  <div className="border-t pt-2">
                    {detalle.tipo_muestra?.norma_microbiologico && (
                      <div className="mb-2">
                        <Badge variant="secondary" className="bg-blue-100 text-xs text-blue-800 dark:bg-blue-800/30 dark:text-blue-400">
                        </Badge>
                      </div>
                    )}

                    {detalle.observacion && (
                      <div>
                        <p className="mb-1 text-xs text-muted-foreground">Observación:</p>
                        <p className="line-clamp-2 text-xs">{detalle.observacion}</p>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
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
                    {solicitudes.data.length > 0 && (
                        <div className="border-t border-border px-4 py-3">
                            <TablePagination
                                pagination={solicitudes}
                                onPageChange={(page) =>
                                    router.get(
                                        route(
                                            'laboratorio-externo.solicitudes.index',
                                        ),
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
                    <p className="mt-1 text-sm text-muted-foreground">
                        {solicitudes.total} solicitudes registradas
                    </p>
                    <div>
                        {solicitudes.data.length > 0 && (
                            <div className="text-center">
                                <p className="text-sm text-muted-foreground">
                                    Mostrando{' '}
                                    <span className="font-medium text-foreground">
                                        {solicitudes.data.length}
                                    </span>{' '}
                                    de{' '}
                                    <span className="font-medium text-foreground">
                                        {solicitudes.total}
                                    </span>{' '}
                                    solicitudes
                                </p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
