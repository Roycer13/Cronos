// resources/js/Pages/Mantenimiento/Almacen/Movimientos/Index.tsx
import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
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
import Fecha from '@/components/ui/fecha';
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
import TablePagination from '@/components/ui/table-pagination';
import { Toast } from '@/components/ui/toast';
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from '@/components/ui/tooltip';
import { useAdvancedFilters } from '@/hooks/use-advanced-filters';
import { useInitials } from '@/hooks/use-initials';
import { useAuth } from '@/hooks/useAuth';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, Link, router, usePage } from '@inertiajs/react';
import {
    CheckCircle,
    ChevronDown,
    ChevronRight,
    Eye,
    Filter,
    MoreHorizontal,
    Pencil,
    Plus,
    Search,
    Trash,
    Truck,
    X,
    XCircle,
       ArrowDownCircle,
    ArrowUpCircle,
} from 'lucide-react';
import { useState } from 'react';
import { route } from 'ziggy-js';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Mantenimiento', href: '#' },
    { title: 'Movimientos de Almacén', href: '#' },
];

interface Movimiento {
    id: number;
    ot: { id: number; numero: string } | null;
    proveedor: { id: number; nombre: string } | null;
    user: { id: number; name: string; apellido: string } | null;
    almacenero: { id: number; name: string; apellido: string } | null;
    autorizante: { id: number; name: string; apellido: string } | null;
    ubicacion: { id: number; nombre: string } | null;
    estado: { id: number; nombre: string } | null;
    observacion: string | null;
    tipo: number; // nuevo (0/1)
    tipo_descripcion: string;
    tiempo: string | null;
    tiempo_autorizacion: string | null;
    tiempo_entregado: string | null;
    created_at: string;
    detalle_almacen_repuestos: Array<{
        id: number;
        repuesto: { id: number; nombre: string; codigo: string } | null;
        cantidad: number;
        cantidad_devuelta: number;
        cantidad_total: number;
    }>;
}

interface PageProps {
    movimientos: {
        data: Movimiento[];
        links: any[];
        current_page: number;
        last_page: number;
        per_page: number;
        total: number;
    };
    filters: {
        search?: string;
        ot_id?: string;
        proveedor_id?: string;
        user_id?: string;
        almacenero_id?: string;
        autorizante_id?: string;
        estado_id?: string;
        tipo?: string;
        fecha_desde?: string;
        fecha_hasta?: string;
        tiempo_entregado_desde?: string;
        tiempo_entregado_hasta?: string;
        per_page?: number;
    };
    ots: { id: number; numero: string }[];
    proveedores: { id: number; nombre: string }[];
    usuarios: { id: number; name: string; apellido: string }[];
    estados: { id: number; nombre: string }[];
    tipos: string[];
    flash: {
        success?: string;
        error?: string;
    };
}

export default function Index() {
    const { props } = usePage<PageProps>();
    const { hasPermission } = useAuth();
    const getInitials = useInitials();
    const [showFilters, setShowFilters] = useState(false);
    const [expandedRows, setExpandedRows] = useState<Set<number>>(new Set());

    // Diálogos
    const [openAutorizar, setOpenAutorizar] = useState(false);
    const [openRechazar, setOpenRechazar] = useState(false);
    const [openEntregar, setOpenEntregar] = useState(false);
    const [openDevolucion, setOpenDevolucion] = useState(false);
    const [movimientoSeleccionado, setMovimientoSeleccionado] =
        useState<Movimiento | null>(null);

    const {
        movimientos,
        filters: initialFilters = {},
        ots = [],
        proveedores = [],
        usuarios = [],
        estados = [],
        tipos = [],
        flash,
    } = props;

    const getEstadoClass = (estadoNombre: string) => {
        switch (estadoNombre) {
            case 'Pendiente':
                return 'bg-yellow-100 text-yellow-800';
            case 'Autorizado':
                return 'bg-blue-100 text-blue-800';
            case 'Entregado':
                return 'bg-green-100 text-green-800';
            case 'Rechazado':
                return 'bg-red-100 text-red-800';
            default:
                return 'bg-gray-100 text-gray-800';
        }
    };
    const { filters, updateFilter, resetFilters } = useAdvancedFilters({
        routeName: 'almacen.movimientos',
        initialFilters: {
            search: initialFilters.search || '',
            ot_id: initialFilters.ot_id || '',
            proveedor_id: initialFilters.proveedor_id || '',
            user_id: initialFilters.user_id || '',
            almacenero_id: initialFilters.almacenero_id || '',
            autorizante_id: initialFilters.autorizante_id || '',
            estado_id: initialFilters.estado_id || '',
            tipo: initialFilters.tipo || '',
            fecha_desde: initialFilters.fecha_desde || '',
            fecha_hasta: initialFilters.fecha_hasta || '',
            tiempo_entregado_desde: initialFilters.tiempo_entregado_desde || '',
            tiempo_entregado_hasta: initialFilters.tiempo_entregado_hasta || '',
            per_page: initialFilters.per_page?.toString() || '10',
        },
        debounceFields: ['search'],
        debounceDelay: 600,
    });

    const hasActiveFilters = Object.entries(filters).some(
        ([key, value]) => value && value !== '' && key !== 'per_page',
    );

    const toggleRow = (id: number) => {
        const newExpanded = new Set(expandedRows);
        if (newExpanded.has(id)) {
            newExpanded.delete(id);
        } else {
            newExpanded.add(id);
        }
        setExpandedRows(newExpanded);
    };

    // Funciones de acción
    const handleAutorizar = (mov: Movimiento) => {
        router.post(
            route('almacen.movimientos.autorizar', mov.id),
            {},
            {
                preserveScroll: true,
                onSuccess: () => setOpenAutorizar(false),
            },
        );
    };

    const handleRechazar = (mov: Movimiento) => {
        router.post(
            route('almacen.movimientos.rechazar', mov.id),
            {},
            {
                preserveScroll: true,
                onSuccess: () => setOpenRechazar(false),
            },
        );
    };

    const handleEntregar = (mov: Movimiento) => {
        router.post(
            route('almacen.movimientos.entregar', mov.id),
            {},
            {
                preserveScroll: true,
                onSuccess: () => setOpenEntregar(false),
            },
        );
    };

    // Totales para la vista rápida
    const totalCantidad = (mov: Movimiento) => {
        return mov.detalle_almacen_repuestos.reduce(
            (sum, d) => sum + d.cantidad,
            0,
        );
    };

    const totalDevuelto = (mov: Movimiento) => {
        return mov.detalle_almacen_repuestos.reduce(
            (sum, d) => sum + d.cantidad_devuelta,
            0,
        );
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Movimientos de Almacén" />
            <div className="space-y-2 px-2 py-2 sm:px-6">
                <Toast />

                {/* Header con búsqueda y botones */}
                <div className="flex items-center justify-between">
                    <div className="relative max-w-md">
                        <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                        <Input
                            placeholder="Buscar por OT, observación, proveedor..."
                            value={filters.search}
                            onChange={(e) =>
                                updateFilter('search', e.target.value)
                            }
                            className="pl-10"
                        />
                    </div>

                    <div className="flex gap-2">
                        {hasPermission('c_almacenMovimiento') && (
                            <Link href={route('almacen.movimientos.crear')}>
                                <Button size="sm">
                                    <Plus className="h-4 w-4" />
                                    <p className="hidden md:block">
                                        Nuevo movimiento
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
                            <span className="hidden md:block">Filtros</span>
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
                        <div className="mb-3 flex justify-between">
                            <h3 className="text-sm font-semibold">
                                Filtros avanzados
                            </h3>
                            {hasActiveFilters && (
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={resetFilters}
                                    className="text-xs"
                                >
                                    <X className="mr-1 h-4 w-4" />
                                    Limpiar
                                </Button>
                            )}
                        </div>

                        <div className="grid grid-cols-2 gap-3 md:grid-cols-4 lg:grid-cols-6">
                            <FilterSelect
                                value={filters.ot_id}
                                onChange={(v) => updateFilter('ot_id', v)}
                                placeholder="OT"
                                options={ots.map((o) => ({
                                    value: o.id.toString(),
                                    label: `OT-${o.numero}`,
                                }))}
                            />
                            <FilterSelect
                                value={filters.proveedor_id}
                                onChange={(v) =>
                                    updateFilter('proveedor_id', v)
                                }
                                placeholder="Proveedor"
                                options={proveedores.map((p) => ({
                                    value: p.id.toString(),
                                    label: p.nombre,
                                }))}
                            />
                            <FilterSelect
                                value={filters.user_id}
                                onChange={(v) => updateFilter('user_id', v)}
                                placeholder="Solicitante"
                                options={usuarios.map((u) => ({
                                    value: u.id.toString(),
                                    label: `${u.name} ${u.apellido}`,
                                }))}
                            />
                            <FilterSelect
                                value={filters.almacenero_id}
                                onChange={(v) =>
                                    updateFilter('almacenero_id', v)
                                }
                                placeholder="Almacenero"
                                options={usuarios.map((u) => ({
                                    value: u.id.toString(),
                                    label: `${u.name} ${u.apellido}`,
                                }))}
                            />
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
                                value={filters.tipo}
                                onChange={(v) => updateFilter('tipo', v)}
                                placeholder="Tipo"
                                options={tipos.map((t) => ({
                                    value: t,
                                    label: t,
                                }))}
                            />
                            <FilterSelect
                                value={filters.per_page}
                                onChange={(v) => updateFilter('per_page', v)}
                                placeholder="Resultados"
                                options={['10', '25', '50', '100'].map((v) => ({
                                    value: v,
                                    label: `${v} por página`,
                                }))}
                                includeAllOption={false}
                            />
                        </div>
                    </div>
                )}

                {/* Tabla de movimientos con filas expandibles */}
                <div className="overflow-hidden rounded-lg border bg-background shadow-sm">
                    <div className="overflow-x-auto">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead className="w-8"></TableHead>{' '}
                                    {/* Columna para expandir */}
                                    {/* <TableHead>ID</TableHead> */}
                                    <TableHead>OT / Prov.</TableHead>
                                    <TableHead>Tipo</TableHead>{' '}
                                    {/* Ingreso/Egreso */}
                                    <TableHead>Descripción</TableHead>{' '}
                                    {/* tipo_descripcion */}
                                    <TableHead>Solicitante</TableHead>
                                    <TableHead>Autorizante</TableHead>{' '}
                                    {/* nuevo */}
                                    <TableHead>Almacenero</TableHead>
                                    <TableHead>Ubicación</TableHead>{' '}
                                    {/* nuevo */}
                                    <TableHead>Estado</TableHead>
                                    <TableHead>Tiempo</TableHead>
                                    <TableHead>Entregado</TableHead>
                                    <TableHead>Acciones</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {movimientos.data.length === 0 ? (
                                    <TableRow>
                                        <TableCell
                                            colSpan={11}
                                            className="py-8 text-center"
                                        >
                                            No se encontraron movimientos
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    movimientos.data.map((mov) => (
                                        <>
                                            <TableRow
                                                key={mov.id}
                                                className="hover:bg-muted/50"
                                            >
                                                <TableCell>
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        onClick={() =>
                                                            toggleRow(mov.id)
                                                        }
                                                        className="h-6 w-6"
                                                    >
                                                        {expandedRows.has(
                                                            mov.id,
                                                        ) ? (
                                                            <ChevronDown className="h-4 w-4" />
                                                        ) : (
                                                            <ChevronRight className="h-4 w-4" />
                                                        )}
                                                    </Button>
                                                </TableCell>
                                                <TableCell>
                                                    {/* {mov.ot ? (
                                                        <Link
                                                            href={route('ots.show', mov.ot.id)} // Ajusta según tu ruta
                                                            className="text-primary hover:underline"
                                                        >

                                                        </Link>
                                                    ) : (
                                                        '-'
                                                    )} */}
                                                      {mov.ot ? `OT-${mov.ot.numero}` : ''}
                                                    {mov.proveedor?.nombre ||
                                                        ''}
                                                </TableCell>


                                                <TableCell>
                                                    {mov.tipo == 1 ? (
                                                        <span className="flex items-center gap-1 text-green-600">
                                                            <ArrowUpCircle className="h-4 w-4" />{' '}

                                                        </span>
                                                    ) : (
                                                        <span className="flex items-center gap-1 text-red-600">
                                                            <ArrowDownCircle className="h-4 w-4" />{' '}

                                                        </span>
                                                    )}
                                                </TableCell>
                                                <TableCell>
                                                    {mov.tipo_descripcion ||
                                                        '-'}
                                                </TableCell>


                                                {/* <TableCell className="font-mono">{mov.id}</TableCell> */}


                                                <TableCell>


                                                     <div>
                                                        <div className="font-medium text-foreground">
                                                            {mov.user?.name ||
                                                                '-'}
                                                        </div>
                                                        <div className="text-xs font-medium text-muted-foreground">
                                                            {mov.user
                                                                ?.apellido ||
                                                                '-'}
                                                        </div>
                                                    </div>

                                                </TableCell>

                                                   <TableCell>

                                                    <div>
                                                        <div className="font-medium text-foreground">
                                                            {mov.autorizante?.name ||
                                                                '-'}
                                                        </div>
                                                        <div className="text-xs font-medium text-muted-foreground">
                                                            {mov.autorizante
                                                                ?.apellido ||
                                                                '-'}
                                                        </div>
                                                    </div>

                                                </TableCell>

                                                <TableCell>

                                                      <div>
                                                        <div className="font-medium text-foreground">
                                                            {mov.almacenero?.name ||
                                                                '-'}
                                                        </div>
                                                        <div className="text-xs font-medium text-muted-foreground">
                                                            {mov.almacenero
                                                                ?.apellido ||
                                                                '-'}
                                                        </div>
                                                    </div>

                                                </TableCell>
                                                <TableCell>
                                                    {mov.ubicacion?.nombre ||
                                                        '-'}
                                                </TableCell>
                                                <TableCell>
                                                    <span
                                                        className={`rounded-full px-2 py-1 text-xs ${getEstadoClass(mov.estado?.nombre || '')}`}
                                                    >
                                                        {mov.estado?.nombre ||
                                                            'Sin estado'}
                                                    </span>
                                                </TableCell>

                                                <TableCell>
                                                    <Fecha
                                                        value={mov.tiempo}
                                                    />
                                                </TableCell>
                                                <TableCell>
                                                    {mov.tiempo_entregado ? (
                                                        <Fecha
                                                            value={
                                                                mov.tiempo_entregado
                                                            }
                                                        />
                                                    ) : (
                                                        <span className="text-muted-foreground">
                                                            Pendiente
                                                        </span>
                                                    )}
                                                </TableCell>
                                                <TableCell>
                                                    <div className="flex items-center gap-1">
                                                        {/* Botones según estado */}
                                                        {mov.estado?.nombre ===
                                                            'Pendiente' &&
                                                            hasPermission(
                                                                'autorizar_almacenMovimiento',
                                                            ) && (
                                                                <>
                                                                    <TooltipProvider>
                                                                        <Tooltip>
                                                                            <TooltipTrigger
                                                                                asChild
                                                                            >
                                                                                <Button
                                                                                    size="icon"
                                                                                    variant="ghost"
                                                                                    onClick={() => {
                                                                                        setMovimientoSeleccionado(
                                                                                            mov,
                                                                                        );
                                                                                        setOpenAutorizar(
                                                                                            true,
                                                                                        );
                                                                                    }}
                                                                                >
                                                                                    <CheckCircle className="h-4 w-4 text-green-600" />
                                                                                </Button>
                                                                            </TooltipTrigger>
                                                                            <TooltipContent>
                                                                                Autorizar
                                                                            </TooltipContent>
                                                                        </Tooltip>
                                                                    </TooltipProvider>
                                                                    <TooltipProvider>
                                                                        <Tooltip>
                                                                            <TooltipTrigger
                                                                                asChild
                                                                            >

                                                                                <Button
                                                                                    size="icon"
                                                                                    variant="ghost"
                                                                                    onClick={() => {
                                                                                        setMovimientoSeleccionado(
                                                                                            mov,
                                                                                        );
                                                                                        setOpenRechazar(
                                                                                            true,
                                                                                        );
                                                                                    }}
                                                                                >
                                                                                    <XCircle className="h-4 w-4 text-red-600" />
                                                                                </Button>

                                                                            </TooltipTrigger>
                                                                            <TooltipContent>
                                                                                Rechazar
                                                                            </TooltipContent>
                                                                        </Tooltip>
                                                                    </TooltipProvider>
                                                                </>
                                                            )}
                                                        {mov.estado?.nombre ===
                                                            'Autorizado' &&
                                                            hasPermission(
                                                                'entregar_almacenMovimiento',
                                                            ) && (
                                                                <TooltipProvider>
                                                                    <Tooltip>
                                                                        <TooltipTrigger
                                                                            asChild
                                                                        >
                                                                            <Button
                                                                                size="icon"
                                                                                variant="ghost"
                                                                                onClick={() => {
                                                                                    setMovimientoSeleccionado(
                                                                                        mov,
                                                                                    );
                                                                                    setOpenEntregar(
                                                                                        true,
                                                                                    );
                                                                                }}
                                                                            >
                                                                                <Truck className="h-4 w-4" />
                                                                            </Button>
                                                                        </TooltipTrigger>
                                                                        <TooltipContent>
                                                                            Entregar
                                                                        </TooltipContent>
                                                                    </Tooltip>
                                                                </TooltipProvider>
                                                            )}
                                                        {/* Menú desplegable */}
                                                        {/* <DropdownMenu>
                                                            <DropdownMenuTrigger
                                                                asChild
                                                            >
                                                                <Button
                                                                    variant="ghost"
                                                                    size="sm"
                                                                >
                                                                    <MoreHorizontal className="h-4 w-4" />
                                                                </Button>
                                                            </DropdownMenuTrigger>
                                                            <DropdownMenuContent align="end">
                                                                <DropdownMenuItem
                                                                    onClick={() =>
                                                                        router.visit(
                                                                            route(
                                                                                'almacen.movimientos.show',
                                                                                mov.id,
                                                                            ),
                                                                        )
                                                                    }
                                                                >
                                                                    <Eye className="mr-2 h-4 w-4" />
                                                                    Ver detalle
                                                                </DropdownMenuItem>
                                                                {hasPermission(
                                                                    'u_almacenMovimiento',
                                                                ) &&
                                                                    !mov.tiempo_entregado && (
                                                                        <DropdownMenuItem
                                                                            onClick={() =>
                                                                                router.visit(
                                                                                    route(
                                                                                        'almacen.movimientos.editar',
                                                                                        mov.id,
                                                                                    ),
                                                                                )
                                                                            }
                                                                        >
                                                                            <Pencil className="mr-2 h-4 w-4" />
                                                                            Editar
                                                                        </DropdownMenuItem>
                                                                    )}
                                                                {hasPermission(
                                                                    'd_almacenMovimiento',
                                                                ) &&
                                                                    !mov.tiempo_entregado && (
                                                                        <DropdownMenuItem
                                                                            onClick={() => {
                                                                                if (
                                                                                    confirm(
                                                                                        '¿Está seguro de eliminar este movimiento?',
                                                                                    )
                                                                                ) {
                                                                                    router.delete(
                                                                                        route(
                                                                                            'almacen.movimientos.destroy',
                                                                                            mov.id,
                                                                                        ),
                                                                                        {
                                                                                            preserveScroll: true,
                                                                                        },
                                                                                    );
                                                                                }
                                                                            }}
                                                                            className="text-red-600 focus:bg-red-50 focus:text-red-600"
                                                                        >
                                                                            <Trash className="mr-2 h-4 w-4" />
                                                                            Eliminar
                                                                        </DropdownMenuItem>
                                                                    )}
                                                            </DropdownMenuContent>
                                                        </DropdownMenu> */}
                                                    </div>
                                                </TableCell>
                                            </TableRow>
                                            {expandedRows.has(mov.id) && (
                                                <TableRow className="bg-muted/30">
                                                    <TableCell
                                                        colSpan={12}
                                                        className="p-0"
                                                    >
                                                        <div className="p-4">

                                                            <Table>
                                                                <TableHeader>
                                                                    <TableRow>
                                                                        <TableHead>
                                                                            Repuesto
                                                                        </TableHead>
                                                                        <TableHead>
                                                                            Cantidad
                                                                        </TableHead>

                                                                    </TableRow>
                                                                </TableHeader>
                                                                <TableBody>
                                                                    {mov.detalle_almacen_repuestos.map(
                                                                        (
                                                                            det,
                                                                        ) => (
                                                                            <TableRow
                                                                                key={
                                                                                    det.id
                                                                                }
                                                                            >
                                                                                <TableCell>
                                                                                    {det.repuesto ? (
                                                                                        <span>
                                                                                            {
                                                                                                det
                                                                                                    .repuesto
                                                                                                    .codigo
                                                                                            }{' '}
                                                                                            -{' '}
                                                                                            {
                                                                                                det
                                                                                                    .repuesto
                                                                                                    .nombre
                                                                                            }
                                                                                        </span>
                                                                                    ) : (
                                                                                        'Repuesto no disponible'
                                                                                    )}
                                                                                </TableCell>
                                                                                <TableCell>
                                                                                    {
                                                                                        det.cantidad
                                                                                    }
                                                                                </TableCell>

                                                                            </TableRow>
                                                                        ),
                                                                    )}
                                                                </TableBody>
                                                            </Table>
                                                        </div>
                                                    </TableCell>
                                                </TableRow>
                                            )}
                                        </>
                                    ))
                                )}
                            </TableBody>
                        </Table>
                    </div>

                    {movimientos.data.length > 0 && (
                        <div className="border-t px-4 py-3">
                            <TablePagination
                                pagination={movimientos}
                                onPageChange={(page) =>
                                    router.get(
                                        route('almacen.movimientos'),
                                        { ...filters, page },
                                        { preserveState: true, replace: true },
                                    )
                                }
                            />
                        </div>
                    )}
                </div>

                <p className="text-sm text-muted-foreground">
                    {movimientos.total} movimientos registrados
                </p>
            </div>

            {/* Diálogos de confirmación */}
            <Dialog open={openAutorizar} onOpenChange={setOpenAutorizar}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Autorizar movimiento</DialogTitle>
                    </DialogHeader>
                    <p>¿Está seguro de autorizar este movimiento?</p>
                    <DialogFooter>
                        <Button
                            variant="outline"
                            onClick={() => setOpenAutorizar(false)}
                        >
                            Cancelar
                        </Button>
                        <Button
                            onClick={() =>
                                movimientoSeleccionado &&
                                handleAutorizar(movimientoSeleccionado)
                            }
                        >
                            Autorizar
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            <Dialog open={openRechazar} onOpenChange={setOpenRechazar}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Rechazar movimiento</DialogTitle>
                    </DialogHeader>
                    <p>¿Está seguro de rechazar este movimiento?</p>
                    <DialogFooter>
                        <Button
                            variant="outline"
                            onClick={() => setOpenRechazar(false)}
                        >
                            Cancelar
                        </Button>
                        <Button
                            variant="destructive"
                            onClick={() =>
                                movimientoSeleccionado &&
                                handleRechazar(movimientoSeleccionado)
                            }
                        >
                            Rechazar
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            <Dialog open={openEntregar} onOpenChange={setOpenEntregar}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Confirmar entrega</DialogTitle>
                    </DialogHeader>
                    <p>
                        ¿Está seguro de marcar este movimiento como entregado?
                    </p>
                    <DialogFooter>
                        <Button
                            variant="outline"
                            onClick={() => setOpenEntregar(false)}
                        >
                            Cancelar
                        </Button>
                        <Button
                            onClick={() =>
                                movimientoSeleccionado &&
                                handleEntregar(movimientoSeleccionado)
                            }
                        >
                            Confirmar entrega
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Diálogo de devolución (placeholder) */}
            <Dialog open={openDevolucion} onOpenChange={setOpenDevolucion}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Registrar devolución</DialogTitle>
                    </DialogHeader>
                    <p>
                        Próximamente: formulario para devolver cantidades por
                        repuesto.
                    </p>
                    <DialogFooter>
                        <Button
                            variant="outline"
                            onClick={() => setOpenDevolucion(false)}
                        >
                            Cerrar
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </AppLayout>
    );
}
