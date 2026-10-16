import { Button } from '@/components/ui/button';
import Fecha from '@/components/ui/fecha';
import FilterSelect from '@/components/ui/filter-select';
import { Input } from '@/components/ui/input';
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from '@/components/ui/tooltip';

import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import FormInput from '@/components/ui/form-input';
import FormSelect from '@/components/ui/form-select';
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
import { Head, Link, router, useForm, usePage } from '@inertiajs/react';
import {
    Edit,
    Eye,
    Filter,
    MoreHorizontal,
    Search,
    Trash2,
    UserPlus,
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


    {
        title: 'Solicitud de orden de trabajo',
        href: '/mantenimiento/solicitudOts',
    },


];

interface PageProps {
    solicitudOts: {
        data: any[];
        links: any[];
        current_page: number;
        last_page: number;
        per_page: number;
        total: number;
    };
    prioridades?: { id: number; nombre: string }[];
    filters: {
        search?: string;
        observacion?: string;

        maquina_equipo_id?: number;

        sector_id?: number;
        estado_id?: number;
        user_id?: number;
        per_page?: number;
    };
    maquinaEquipos?: { id: number; nombre: string }[];
    sectores?: { id: number; nombre: string }[];
    estados?: { id: number; nombre: string }[];
    users?: { id: number; name: string }[];

    flash: {
        success?: string;
        error?: string;
    };
}

export default function Index() {
    const { props } = usePage();

    const [showFilters, setShowFilters] = useState(false);
    const [viewModalOpen, setViewModalOpen] = useState(false);
    const [selectedSolicitud, setSelectedSolicitud] = useState<any | null>(
        null,
    );

    const {
        hasPermission,
        belongsToUbicacion,
        canDo,
        user: authUser,
    } = useAuth();

    const {
        solicitudOts = {
            data: [],
            links: [],
            current_page: 1,
            last_page: 1,
            per_page: 10,
            total: 0,
        },
        filters: initialFilters = {},
        users = [],
        maquinaEquipos = [],
        sectores = [],
        estados = [],

        flash,
    } = props as unknown as PageProps;

    const { filters, updateFilter, resetFilters } = useAdvancedFilters({
        routeName: 'solicitudOts',
        initialFilters: {
            search: initialFilters.search || '',
            observacion: initialFilters.observacion || '',
            estado_id: initialFilters.estado_id?.toString() || undefined,
            user_id: initialFilters.user_id?.toString() || undefined,
            sector_id: initialFilters.sector_id?.toString() || undefined,
            maquina_equipo_id:
                initialFilters.maquina_equipo_id?.toString() || undefined,
            per_page: initialFilters.per_page?.toString() || '10',
        },
        debounceFields: ['search', 'observacion'],
        debounceDelay: 600,
    });

    const hasActiveFilters = Object.values(filters).some(
        (value) => value && value !== '' && value !== '10',
    );

    const handleEdit = (id: number) => {
        router.visit(route('solicitudOts.editar', id));
    };

    const handleDelete = (id: number) => {
        if (confirm('¿Eliminar esta solicitud?')) {
            router.delete(route('solicitudOts.eliminar', id), {
                preserveScroll: true,
            });
        }
    };

    const handleRevisarOt = (otId: number) => {
        if (confirm('¿Desea marcar esta OT como revisada?')) {
            router.put(route('solicitudOts.revisar', otId), {});
        }
    };
const handleCerrarOt = (otId: number) => {
        if (confirm('¿Desea cerrar esta OT?')) {
            router.put(route('solicitudOts.cerrar', otId), {});
        }
    };
    const handleRejectSolicitud = () => {
        if (!selectedSolicitud) return;

        if (confirm('¿Desea rechazar esta solicitud?')) {
            router.put(
                route('solicitudOts.rechazar', selectedSolicitud.id),
                {},
                {
                    onSuccess: () => {
                        setViewModalOpen(false);
                    },
                },
            );
        }
    };

    const handleView = (solicitud: any) => {
        console.log('Solicitud seleccionada:', solicitud);
        setSelectedSolicitud(solicitud);
        setData({
            solicitud_ot_id: solicitud.id,
            user_id: '',
            prioridad_id: '',
            tipo_orden: '',
            estado_id: solicitud.estado_id || '',
            notas: '',
        });
        setViewModalOpen(true);
    };

    const { data, setData, post, processing, reset } = useForm({
        solicitud_ot_id: '',
        user_id: authUser?.id || '',

        prioridad_id: '',
        tipo_orden: '',
        estado_id: '',
        notas: '',
    });

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="solicitudOts" />
            <div className="space-y-2 px-2 py-2 sm:px-6">
                <Toast />
                {/* Header */}
                <div className="flex items-center justify-between">
                    {/* Búsqueda rápida */}
                    <div className="relative max-w-md">
                        <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 transform text-muted-foreground" />
                        <Input
                            placeholder="Buscar por nombre o código..."
                            value={filters.search}
                            onChange={(e) =>
                                updateFilter('search', e.target.value)
                            }
                            className="pl-10"
                        />
                    </div>
                    <div className="flex items-center gap-2">
                        {/* {hasPermission('c_solicitudOt') && belongsToUbicacion('Lácteos') && ( */}
                        <Link href={route('solicitudOts.crear')}>
                            <Button size="sm">
                                <UserPlus className="h-4 w-4" />
                                <p className="hidden md:block">
                                    Nueva solicitud de Ots
                                </p>
                            </Button>
                        </Link>
                        {/* )} */}

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
                                placeholder="Observacion"
                                value={filters.observacion}
                                onChange={(e) =>
                                    updateFilter('observacion', e.target.value)
                                }
                                className="text-sm"
                            />

                            <FilterSelect
                                value={filters.user_id}
                                onChange={(v) => updateFilter('user_id', v)}
                                placeholder="Buscar Usuario"
                                options={users.map((r) => ({
                                    value: r.id.toString(),
                                    label: r.name,
                                }))}
                            />
                            <FilterSelect
                                value={filters.maquina_equipo_id}
                                onChange={(v) =>
                                    updateFilter('maquina_equipo_id', v)
                                }
                                placeholder="Buscar Maquina"
                                options={maquinaEquipos.map((r) => ({
                                    value: r.id.toString(),
                                    label: r.nombre,
                                }))}
                            />
                            <FilterSelect
                                value={filters.sector_id}
                                onChange={(v) => updateFilter('sector_id', v)}
                                placeholder="Buscar Sector"
                                options={sectores.map((r) => ({
                                    value: r.id.toString(),
                                    label: r.nombre,
                                }))}
                            />
                            <FilterSelect
                                value={filters.estado_id}
                                onChange={(v) => updateFilter('estado_id', v)}
                                placeholder="Buscar Estado"
                                options={estados.map((r) => ({
                                    value: r.id.toString(),
                                    label: r.nombre,
                                }))}
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
                                        'Fecha',
                                        'Solicitante',
                                        'Ubicacion/Maquina',
                                        'Estado',
                                        'Descripcion',
                                        'Observacion',
                                        '',
                                    ].map((col, idx) => (
                                        <TableHead key={idx}>{col}</TableHead>
                                    ))}
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {solicitudOts.data.length === 0 ? (
                                    <TableRow>
                                        <TableCell
                                            colSpan={8}
                                            className="py-8 text-center text-muted-foreground"
                                        >
                                            <div className="flex flex-col items-center justify-center">
                                                <Search className="mb-3 h-12 w-12 text-muted-foreground/50" />
                                                <p className="mb-1 text-lg font-medium text-foreground">
                                                    No se encontraron usuarios
                                                </p>
                                                <p className="text-sm text-muted-foreground">
                                                    {hasActiveFilters
                                                        ? 'Intenta ajustar los filtros para ver más resultados'
                                                        : 'No hay usuarios registrados en el sistema'}
                                                </p>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    solicitudOts.data.map((solicitudOts) => (
                                        <TableRow
                                            key={solicitudOts.id}
                                            className="hover:bg-muted/50"
                                        >
                                            <TableCell>
                                                <Fecha
                                                    value={solicitudOts.tiempo}
                                                />
                                            </TableCell>

                                            <TableCell>
                                                <div>
                                                    <div className="font-medium text-foreground">
                                                        {solicitudOts.user
                                                            ?.name || '-'}
                                                    </div>
                                                    <div className="text-xs font-medium text-muted-foreground">
                                                        {solicitudOts.user
                                                            ?.apellido || '-'}
                                                    </div>
                                                </div>
                                            </TableCell>

                                            <TableCell className="text-muted-foreground">
                                                <div>
                                                    <div className="font-medium text-foreground">
                                                        {solicitudOts.sector
                                                            ?.nombre || '-'}
                                                    </div>
                                                    <div className="text-xs font-medium text-muted-foreground">
                                                        {solicitudOts
                                                            .maquina_equipo
                                                            ?.nombre || '-'}
                                                    </div>
                                                </div>
                                            </TableCell>
                                            <TableCell className="text-muted-foreground">
                                                {solicitudOts.estado?.nombre ||
                                                    '-'}
                                            </TableCell>

                                            <TableCell className="max-w-[300px] truncate text-muted-foreground">
                                                <TooltipProvider>
                                                    <Tooltip>
                                                        <TooltipTrigger asChild>
                                                            <div>
                                                                <div className="truncate font-medium text-foreground">
                                                                    {solicitudOts?.descripcion ||
                                                                        '-'}
                                                                </div>
                                                                <div className="truncate text-xs font-medium text-muted-foreground">
                                                                    {solicitudOts
                                                                        .ot
                                                                        ?.notas ||
                                                                        '-'}
                                                                </div>
                                                            </div>
                                                        </TooltipTrigger>
                                                        <TooltipContent className="max-w-sm break-words whitespace-pre-wrap">
                                                            <p>
                                                                <strong>
                                                                    Descripción:
                                                                </strong>{' '}
                                                                {solicitudOts?.descripcion ||
                                                                    '-'}
                                                            </p>
                                                            <p>
                                                                <strong>
                                                                    Notas:
                                                                </strong>{' '}
                                                                {solicitudOts.ot
                                                                    ?.notas ||
                                                                    '-'}
                                                            </p>
                                                        </TooltipContent>
                                                    </Tooltip>
                                                </TooltipProvider>
                                            </TableCell>

                                            <TableCell className="text-muted-foreground">
                                                {solicitudOts.observacion ||
                                                    '-'}
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
                                                                handleView(
                                                                    solicitudOts,
                                                                )
                                                            }
                                                        >
                                                            <Eye className="mr-2 h-4 w-4" />
                                                            <span>
                                                                Ver detalles
                                                            </span>
                                                        </DropdownMenuItem>
                                                        {canDo(
                                                            solicitudOts,
                                                            'u_solicitudOt',
                                                            5,
                                                            true,
                                                            true,
                                                            true,
                                                        ) && (
                                                            <DropdownMenuItem
                                                                onClick={() =>
                                                                    handleEdit(
                                                                        solicitudOts.id,
                                                                    )
                                                                }
                                                            >
                                                                <Edit className="mr-2 h-4 w-4" />
                                                                <span>
                                                                    Editar
                                                                    solicitud de
                                                                    Ots
                                                                </span>
                                                            </DropdownMenuItem>
                                                        )}

                                                        {solicitudOts.estado
                                                            ?.nombre ===
                                                            'Completado' &&
                                                            canDo(
                                                                solicitudOts,
                                                                'c_solicitudOt',
                                                                undefined,
                                                                true,
                                                            ) && ( // o el permiso que uses para revisión
                                                                <DropdownMenuItem
                                                                    onClick={() =>
                                                                        handleRevisarOt(
                                                                            solicitudOts
                                                                                .ot
                                                                                .id,
                                                                        )
                                                                    }
                                                                >
                                                                    <Eye className="mr-2 h-4 w-4" />
                                                                    <span>
                                                                        Marcar
                                                                        como
                                                                        Revisado
                                                                    </span>
                                                                </DropdownMenuItem>
                                                            )}

                                                        {solicitudOts.estado
                                                            ?.nombre ===
                                                            'Revisado' &&
                                                            canDo(
                                                                solicitudOts,
                                                                'cerrar_solicitudOt',
                                                                undefined,

                                                            ) && ( // o el permiso que uses para revisión
                                                                <DropdownMenuItem
                                                                    onClick={() =>
                                                                        handleCerrarOt(
                                                                            solicitudOts
                                                                                .ot
                                                                                .id,
                                                                        )
                                                                    }
                                                                >
                                                                    <Eye className="mr-2 h-4 w-4" />
                                                                    <span>
                                                                        Cerrar
                                                                        OT
                                                                    </span>
                                                                </DropdownMenuItem>
                                                            )}

                                                        {canDo(
                                                            solicitudOts,
                                                            'd_solicitudOt',
                                                            1,
                                                            true,
                                                            true,
                                                            true,
                                                        ) && (
                                                            <DropdownMenuItem
                                                                onClick={() =>
                                                                    handleDelete(
                                                                        solicitudOts.id,
                                                                    )
                                                                }
                                                                className="text-destructive focus:text-destructive"
                                                            >
                                                                <Trash2 className="mr-2 h-4 w-4" />
                                                                <span>
                                                                    Eliminar
                                                                    solicitud de
                                                                    Ots
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
                    {solicitudOts.data.length > 0 && (
                        <div className="border-t border-border px-4 py-3">
                            <TablePagination
                                pagination={solicitudOts}
                                onPageChange={(page) =>
                                    router.get(
                                        route('usuarios'),
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
                        {solicitudOts.total} usuarios registrados
                    </p>
                    <div>
                        {solicitudOts.data.length > 0 && (
                            <div className="text-center">
                                <p className="text-sm text-muted-foreground">
                                    Mostrando{' '}
                                    <span className="font-medium text-foreground">
                                        {solicitudOts.data.length}
                                    </span>{' '}
                                    de{' '}
                                    <span className="font-medium text-foreground">
                                        {solicitudOts.total}
                                    </span>{' '}
                                    solicitudOts
                                </p>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            <Dialog open={viewModalOpen} onOpenChange={setViewModalOpen}>
                <DialogContent className="max-w-3xl">
                    <DialogHeader>
                        <DialogTitle>Detalles de Solicitud de OT</DialogTitle>
                        <DialogDescription>
                            Visualiza los datos de la solicitud y genera una
                            nueva OT.
                        </DialogDescription>
                    </DialogHeader>

                    {selectedSolicitud && (
                        <form
                            onSubmit={(e) => {
                                e.preventDefault();
                                post(route('ots.guardar'), {
                                    onSuccess: () => {
                                        setViewModalOpen(false);
                                        reset();
                                    },
                                });
                            }}
                            className="space-y-4"
                        >
                            {/* Información de la solicitud */}
                            <div className="grid grid-cols-2 gap-4 border-b pb-4">
                                <div>
                                    <p className="text-sm text-muted-foreground">
                                        Solicitante
                                    </p>
                                    <p className="font-medium">
                                        {selectedSolicitud.user?.name}
                                    </p>
                                </div>
                                <div>
                                    <p className="text-sm text-muted-foreground">
                                        Fecha de solicitud
                                    </p>
                                    <p className="font-medium">
                                        {selectedSolicitud.tiempo}
                                    </p>
                                </div>
                                <div>
                                    <p className="text-sm text-muted-foreground">
                                        Sector
                                    </p>
                                    <p className="font-medium">
                                        {selectedSolicitud.sector?.nombre}
                                    </p>
                                </div>
                                <div>
                                    <p className="text-sm text-muted-foreground">
                                        Máquina/Equipo
                                    </p>
                                    <p className="font-medium">
                                        {
                                            selectedSolicitud.maquina_equipo
                                                ?.nombre
                                        }
                                    </p>
                                </div>

                                {/* Descripción: no editable, ocupa 2 columnas */}
                                <div className="col-span-2">
                                    <p className="text-sm text-muted-foreground">
                                        Descripción
                                    </p>
                                    <div className="rounded-md p-3 text-sm text-foreground">
                                        {selectedSolicitud.descripcion || (
                                            <span className="text-muted-foreground">
                                                Sin descripción
                                            </span>
                                        )}
                                    </div>
                                </div>
                            </div>

                            {/* Datos para crear la OT */}

                            {selectedSolicitud.estado.nombre == 'Pendiente' &&
                                hasPermission('c_ot') && (
                                    <div className="space-y-3">
                                        <h3 className="text-base font-semibold">
                                            Datos para la nueva OT
                                        </h3>

                                        <div className="grid grid-cols-2 gap-3">
                                            {/* Selección de usuario */}
                                            <div>
                                                <FormSelect
                                                    label="Usuario"
                                                    value={data.user_id}
                                                    onChange={(v) =>
                                                        setData('user_id', v)
                                                    }
                                                    placeholder="Seleccione usuario"
                                                    options={(
                                                        props.users || []
                                                    ).map((p) => ({
                                                        value: p.id.toString(),
                                                        label: p.name,
                                                    }))}
                                                />
                                            </div>

                                            {/* Prioridad */}
                                            <div>
                                                <FormSelect
                                                    label="Prioridad"
                                                    value={data.prioridad_id}
                                                    onChange={(v) =>
                                                        setData(
                                                            'prioridad_id',
                                                            v,
                                                        )
                                                    }
                                                    placeholder="Seleccione prioridad"
                                                    options={(
                                                        props.prioridades || []
                                                    ).map((p) => ({
                                                        value: p.id.toString(),
                                                        label: p.nombre,
                                                    }))}
                                                />
                                            </div>

                                            {/* ✅ Campo de notas (ocupa las 2 columnas) */}
                                            <div className="col-span-2">
                                                <FormInput
                                                    as="textarea"
                                                    label="Notas"
                                                    placeholder="Agrega observaciones o detalles adicionales..."
                                                    value={data.notas}
                                                    onChange={(e) =>
                                                        setData(
                                                            'notas',
                                                            e.target.value,
                                                        )
                                                    }
                                                    rows={3}
                                                />
                                            </div>
                                        </div>
                                    </div>
                                )}

                            <div className="flex justify-end space-x-2 pt-4">
                                {
                                    <Button
                                        type="button"
                                        variant="outline"
                                        onClick={() => setViewModalOpen(false)}
                                    >
                                        Cancelar
                                    </Button>
                                }

                                {selectedSolicitud.estado.nombre ==
                                    'Pendiente' &&
                                    hasPermission('c_ot') && (
                                        <Button
                                            type="submit"
                                            disabled={processing}
                                        >
                                            Crear OT
                                        </Button>
                                    )}

                                {selectedSolicitud.estado.nombre ==
                                    'Pendiente' &&
                                    hasPermission('c_ot') && (
                                        <Button
                                            type="button"
                                            variant="destructive"
                                            onClick={() =>
                                                handleRejectSolicitud()
                                            }
                                            disabled={processing}
                                        >
                                            Rechazar
                                        </Button>
                                    )}
                            </div>
                        </form>
                    )}
                </DialogContent>
            </Dialog>
        </AppLayout>
    );
}
