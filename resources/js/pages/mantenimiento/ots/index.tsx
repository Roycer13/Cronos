import { AgregarAyudanteDialog } from '@/components/ui/AgregarAyudanteDialog';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import Fecha from '@/components/ui/fecha';
import FilterSelect from '@/components/ui/filter-select';
import { Input } from '@/components/ui/input';
import { TiemposDialog } from '@/components/ui/TiemposDialog';

import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from '@/components/ui/tooltip';
import { route } from 'ziggy-js';

import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
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
import { useAdvancedFilters } from '@/hooks/use-advanced-filters';
import { useAuth } from '@/hooks/useAuth';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, router, usePage } from '@inertiajs/react';
import { Edit, Eye, Filter, MoreHorizontal, Trash2, X } from 'lucide-react';
import { useState } from 'react';
const breadcrumbs: BreadcrumbItem[] = [
    { title: 'OTs', href: '/mantenimiento/Ots' },
];

interface PageProps {
    ots: {
        data: any[];
        links: any[];
        current_page: number;
        last_page: number;
        per_page: number;
        total: number;
    };
    filters: {
        search?: string;

        estado_id?: number;
        tipo_orden?: number;
        prioridad_id?: number;
        user_id?: number;
        solicitanteOt?: number;
        per_page?: number;
    };
    estados?: { id: number; nombre: string }[];
    users?: { id: number; name: string }[];
    solicitanteOts?: { id: number; name: string }[];
    prioridades?: { id: number; nombre: string }[];
    flash: {
        success?: string;
        error?: string;
    };
    isAdmin: boolean; // 👈 agregado
}

export default function Index() {
    const { props } = usePage();
    const [showFilters, setShowFilters] = useState(false);
    const [selectedOt, setSelectedOt] = useState<any | null>(null);
    const [viewModalOpen, setViewModalOpen] = useState(false);
    const { user: authUser, canDo } = useAuth();
    const [ayudanteDialogOpen, setAyudanteDialogOpen] = useState(false);
    const [selectedOtForAyudante, setSelectedOtForAyudante] = useState<
        any | null
    >(null);

    const [tiemposDialogOpen, setTiemposDialogOpen] = useState(false);
    const [selectedOtForTiempos, setSelectedOtForTiempos] = useState<
        any | null
    >(null);

    // Modal / formulario para diagnóstico / acción / sugerencia
    const [editModalOpen, setEditModalOpen] = useState(false);

    const [formData, setFormData] = useState({
        diagnostico: '',
        accion: '',
        sugerencia: '',
    });

    // Abre el modal de edición y precarga datos desde selectedOt (si existen)
    const openEditModalFromSelected = () => {
        if (!selectedOt) return;
        setFormData({
            diagnostico: selectedOt.diagnostico || '',
            accion: selectedOt.accion || '',
            sugerencia: selectedOt.sugerencia || '',
        });
        setEditModalOpen(true);
    };

    const {
        ots,
        filters: initialFilters = {},
        estados = [],
        solicitanteOts = [],
        users = [],
        prioridades = [],
        flash,

        isAdmin, // 👈 agregado
    } = props as unknown as PageProps;
    const [viewMode, setViewMode] = useState<'table' | 'cards'>(
        // 👇 si no es admin, siempre empieza en cards
        isAdmin ? 'table' : 'cards',
    );
    const { filters, updateFilter, resetFilters } = useAdvancedFilters({
        routeName: 'ots',
        initialFilters: {
            search: initialFilters.search || '',
            // user_id: initialFilters.user_id || '',
            // solicitanteOt: initialFilters.solicitanteOt || '',
            tipo_orden: initialFilters.tipo_orden || '',
            solicitanteOt:
                initialFilters.solicitanteOt?.toString() || undefined,
            user_id: initialFilters.user_id?.toString() || undefined,
            estado_id: initialFilters.estado_id?.toString() || undefined,
            prioridad_id: initialFilters.prioridad_id?.toString() || undefined,
            per_page: initialFilters.per_page?.toString() || '10',
        },
        debounceFields: [
            'search',
            'estado_id',
            'prioridad_id',
            'tipo_orden',
            'user_id',
            'solicitanteOt',
        ],
        debounceDelay: 600,
    });
    const hasActiveFilters = Object.values(filters).some(
        (value) => value && value !== '' && value !== '10',
    );

    const abrirAgregarAyudante = (ot: any) => {
        setSelectedOtForAyudante(ot);
        setAyudanteDialogOpen(true);
    };

    const abrirTiemposDialog = (ot: any) => {
        setSelectedOtForTiempos(ot);
        setTiemposDialogOpen(true);
    };
    const handleEdit = (id: number) => router.visit(route('ots.editar', id));
    const handleDelete = (id: number) => {
        if (confirm('¿Eliminar este OT?')) {
            router.delete(route('ots.eliminar', id), { preserveScroll: true });
        }
    };

    const handleOpenDialog = (ot: any) => {
        setSelectedOt(ot);
        setViewModalOpen(true);

        if (!ot.visto) {
            router.put(
                route('ots.marcarVisto', { ot: ot.id }),
                {},
                {
                    preserveScroll: true,
                    onSuccess: (page) => {
                        setSelectedOt({ ...ot, visto: true });
                    },
                    onError: (errors) => {
                        if (errors?.error) {
                            console.log('Toaster error:', errors.error);
                        }
                    },
                },
            );
        }
    };

    const handleSubmitEdit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedOt) return;

        router.put(
            route('ots.actualizarDetalles', { ot: selectedOt.id }),
            {
                diagnostico: formData.diagnostico,
                accion: formData.accion,
                sugerencia: formData.sugerencia,
            },
            {
                preserveScroll: true,
                onSuccess: (page) => {
                    setEditModalOpen(false);
                    setSelectedOt({
                        ...selectedOt,
                        diagnostico: formData.diagnostico,
                        accion: formData.accion,
                        sugerencia: formData.sugerencia,
                    });
                },
                onError: (errors) => {
                    console.log('Errores:', errors);
                },
            },
        );
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="OTs" />
            <div className="space-y-2 px-2 py-2 sm:px-6">
                <Toast />
                <div className="mb-2 flex justify-end">
                    {isAdmin && ( // 👈 solo mostrar a administradores
                        <Button
                            size="sm"
                            onClick={() =>
                                setViewMode(
                                    viewMode === 'table' ? 'cards' : 'table',
                                )
                            }
                        >
                            {viewMode === 'table' ? 'Ver Cards' : 'Ver Tabla'}
                        </Button>
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

                {/* Filtros avanzados */}
                {showFilters && (
                    <div className="mt-2 rounded-lg border border-border bg-muted/50 p-2">
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
                                placeholder="Tipo de orden"
                                value={filters.tipo_orden}
                                onChange={(e) =>
                                    updateFilter('tipo_orden', e.target.value)
                                }
                                className="text-sm"
                            />

                            <FilterSelect
                                value={filters.solicitanteOt}
                                onChange={(v) =>
                                    updateFilter('solicitanteOt', v)
                                }
                                placeholder="Solicitante OT"
                                options={solicitanteOts.map((r) => ({
                                    value: r.id.toString(),
                                    label: r.name,
                                }))}
                            />
                            <FilterSelect
                                value={filters.user_id}
                                onChange={(v) => updateFilter('user_id', v)}
                                placeholder="Tecnico"
                                options={users.map((r) => ({
                                    value: r.id.toString(),
                                    label: `${r.name} ${r.apellido}`,
                                }))}
                            />
                            <FilterSelect
                                value={filters.estado_id}
                                onChange={(v) => updateFilter('estado_id', v)}
                                placeholder="Estado"
                                options={estados.map((r) => ({
                                    value: r.id.toString(),
                                    label: r.nombre,
                                }))}
                            />
                            <FilterSelect
                                value={filters.prioridad_id}
                                onChange={(v) =>
                                    updateFilter('prioridad_id', v)
                                }
                                placeholder="Prioridad"
                                options={prioridades.map((r) => ({
                                    value: r.id.toString(),
                                    label: r.nombre,
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

                {/* Tabla de OTs */}
                <div className="overflow-hidden rounded-lg border border-border bg-background shadow-sm">
                    <div className="overflow-x-auto">
                        {viewMode === 'table' ? (
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        {[
                                            'Fecha',
                                            '# OT',
                                            'Solicitante',
                                            'Descripción',
                                            'Máquina/Equipo',
                                            'Sector',
                                            'Técnico asignado',
                                            'Estado',
                                            'Prioridad',
                                            'Tipo',
                                            '',
                                        ].map((col, idx) => (
                                            <TableHead key={idx}>
                                                {col}
                                            </TableHead>
                                        ))}
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {ots.data.length === 0 ? (
                                        <TableRow>
                                            <TableCell
                                                colSpan={11}
                                                className="py-8 text-center text-muted-foreground"
                                            >
                                                No se encontraron OTs
                                            </TableCell>
                                        </TableRow>
                                    ) : (
                                        ots.data.map((ot) => (
                                            <TableRow
                                                key={ot.id}
                                                className="hover:bg-muted/50"
                                            >
                                                <TableCell>
                                                    <Fecha
                                                        value={
                                                            ot.solicitud_ot
                                                                ?.tiempo
                                                        }
                                                    />
                                                </TableCell>
                                                <TableCell>
                                                    {ot.solicitud_ot?.id || '-'}
                                                </TableCell>
                                                <TableCell>
                                                    <div>
                                                        <div className="font-medium text-foreground">
                                                            {ot.solicitud_ot
                                                                ?.user?.name ||
                                                                '-'}
                                                        </div>
                                                        <div className="text-xs font-medium text-muted-foreground">
                                                            {ot.solicitud_ot
                                                                ?.user
                                                                ?.apellido ||
                                                                '-'}
                                                        </div>
                                                    </div>
                                                </TableCell>
                                                <TableCell className="max-w-[300px] truncate text-muted-foreground">
                                                    <TooltipProvider>
                                                        <Tooltip>
                                                            <TooltipTrigger
                                                                asChild
                                                            >
                                                                <div>
                                                                    <div className="truncate font-medium text-foreground">
                                                                        {ot
                                                                            .solicitud_ot
                                                                            ?.descripcion ||
                                                                            '-'}
                                                                    </div>
                                                                    <div className="truncate text-xs font-medium text-muted-foreground">
                                                                        {ot.notas ||
                                                                            '-'}
                                                                    </div>
                                                                </div>
                                                            </TooltipTrigger>
                                                            <TooltipContent className="max-w-sm break-words whitespace-pre-wrap">
                                                                <p>
                                                                    <strong>
                                                                        Descripción:
                                                                    </strong>{' '}
                                                                    {ot
                                                                        .solicitud_ot
                                                                        ?.descripcion ||
                                                                        '-'}
                                                                </p>
                                                                <p>
                                                                    <strong>
                                                                        Notas:
                                                                    </strong>{' '}
                                                                    {ot.notas ||
                                                                        '-'}
                                                                </p>
                                                            </TooltipContent>
                                                        </Tooltip>
                                                    </TooltipProvider>
                                                </TableCell>

                                                <TableCell>
                                                    {ot.solicitud_ot
                                                        ?.maquina_equipo
                                                        ?.nombre || '-'}
                                                </TableCell>
                                                <TableCell>
                                                    {ot.solicitud_ot?.sector
                                                        ?.nombre || '-'}
                                                </TableCell>
                                                <TableCell>
                                                    <div>
                                                        <div className="font-medium text-foreground">
                                                            {ot.user?.name ||
                                                                '-'}
                                                        </div>
                                                        <div className="text-xs font-medium text-muted-foreground">
                                                            {ot.user
                                                                ?.apellido ||
                                                                '-'}
                                                        </div>
                                                    </div>
                                                </TableCell>
                                                <TableCell>
                                                    {ot.estado?.nombre || '-'}
                                                </TableCell>
                                                <TableCell>
                                                    {ot.prioridad?.nombre ||
                                                        '-'}
                                                </TableCell>
                                                <TableCell>
                                                    {ot.tipo_orden || '-'}
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
                                                            </Button>
                                                        </DropdownMenuTrigger>
                                                        <DropdownMenuContent
                                                            align="end"
                                                            className="w-48"
                                                        >
                                                            <DropdownMenuItem
                                                                onClick={() =>
                                                                    handleOpenDialog(
                                                                        ot,
                                                                    )
                                                                }
                                                            >
                                                                <Eye className="mr-2 h-4 w-4" />
                                                                Ver
                                                            </DropdownMenuItem>
                                                            {canDo(
                                                                ot,
                                                                'u_ot',
                                                                24,
                                                                false,
                                                            ) && (
                                                                <DropdownMenuItem
                                                                    onClick={() =>
                                                                        handleEdit(
                                                                            ot.id,
                                                                        )
                                                                    }
                                                                >
                                                                    <Edit className="mr-2 h-4 w-4" />
                                                                    Editar
                                                                </DropdownMenuItem>
                                                            )}
                                                            {canDo(
                                                                ot,
                                                                'd_ot',
                                                                480,
                                                                false,
                                                            ) && (
                                                                <DropdownMenuItem
                                                                    onClick={() =>
                                                                        handleDelete(
                                                                            ot.id,
                                                                        )
                                                                    }
                                                                    className="text-destructive focus:text-destructive"
                                                                >
                                                                    <Trash2 className="mr-2 h-4 w-4" />
                                                                    Eliminar
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
                        ) : (
                            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
                                {ots.data.map((ot) => (
                                    <Card
                                        key={ot.id}
                                        className="rounded-lg border shadow-sm transition-shadow duration-200 hover:shadow-md"
                                    >
                                        <CardHeader className="pb-2">
                                            <CardTitle className="text-sm font-semibold text-foreground">
                                                #OT: {ot.solicitud_ot?.id}
                                            </CardTitle>

                                            <CardDescription className="text-xs text-muted-foreground">
                                                <Fecha
                                                    value={
                                                        ot.solicitud_ot?.tiempo
                                                    }
                                                />
                                            </CardDescription>
                                        </CardHeader>
                                        <CardContent className="space-y-2">
                                            <div className="flex justify-between">
                                                <span className="font-medium text-muted-foreground">
                                                    Solicitante:
                                                </span>
                                                <span className="font-medium text-foreground">
                                                    {ot.solicitud_ot?.user
                                                        ?.name || '-'}
                                                </span>
                                            </div>
                                            <div className="flex justify-between">
                                                <span className="font-medium text-muted-foreground">
                                                    Estado:
                                                </span>
                                                <Badge
                                                    variant={
                                                        ot.estado?.nombre ===
                                                        'Pendiente'
                                                            ? 'secondary'
                                                            : ot.estado
                                                                    ?.nombre ===
                                                                'En proceso'
                                                              ? 'warning'
                                                              : ot.estado
                                                                      ?.nombre ===
                                                                  'Finalizado'
                                                                ? 'success'
                                                                : 'default'
                                                    }
                                                >
                                                    {ot.estado?.nombre || '-'}
                                                </Badge>
                                            </div>
                                            <div className="flex justify-between">
                                                <span className="font-medium text-muted-foreground">
                                                    Prioridad:
                                                </span>
                                                <span className="font-medium text-foreground">
                                                    {ot.prioridad?.nombre ||
                                                        '-'}
                                                </span>
                                            </div>
                                            <div className="flex justify-between">
                                                <span className="font-medium text-muted-foreground">
                                                    Ubicacion:
                                                </span>
                                                <span className="font-medium text-foreground">
                                                    {ot.solicitud_ot?.sector
                                                        ?.ubicacion
                                                        ?.tipo_ubicacion
                                                        ?.nombre || '-'}{' '}
                                                    {ot.solicitud_ot?.sector
                                                        ?.ubicacion?.nombre ||
                                                        '-'}
                                                </span>
                                            </div>
                                            <div>
                                                <span className="mb-1 block font-medium text-muted-foreground">
                                                    Descripción:
                                                </span>
                                                <p className="text-sm leading-relaxed font-medium break-words whitespace-pre-wrap text-foreground">
                                                    {ot.solicitud_ot
                                                        ?.descripcion || '-'}
                                                </p>
                                            </div>
                                            <div className="mt-2">
                                                <span className="font-medium text-muted-foreground">
                                                    Tecnicos:
                                                </span>
                                                <div className="mt-1 flex flex-wrap gap-1">
                                                    {ot.ayudantes &&
                                                    ot.ayudantes.length > 0 ? (
                                                        Array.from(
                                                            new Map(
                                                                ot.ayudantes.map(
                                                                    (
                                                                        a: any,
                                                                    ) => [
                                                                        a.user_id,
                                                                        a,
                                                                    ],
                                                                ),
                                                            ).values(),
                                                        ).map(
                                                            (ayudante: any) => (
                                                                <Badge
                                                                    key={
                                                                        ayudante.user_id
                                                                    }
                                                                    variant="secondary"
                                                                    className="text-xs"
                                                                >
                                                                    {ayudante
                                                                        .user
                                                                        ?.name ||
                                                                        ayudante
                                                                            .user
                                                                            ?.apellido ||
                                                                        '?'}
                                                                </Badge>
                                                            ),
                                                        )
                                                    ) : (
                                                        <span className="text-sm text-muted-foreground">
                                                            Sin ayudantes
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                        </CardContent>
                                        <CardFooter className="flex justify-end space-x-2 pt-2">
                                            {canDo(
                                                ot,
                                                'r_ot',
                                                undefined,
                                                true,
                                            ) && (
                                                <Button
                                                    size="sm"
                                                    variant="outline"
                                                    onClick={() =>
                                                        handleOpenDialog(ot)
                                                    }
                                                >
                                                    <Eye className="mr-1 h-4 w-4" />{' '}
                                                </Button>
                                            )}

                                            {/* Mostrar solo si tiene permiso o según estado: ajusta la condición como necesites */}

                                            {canDo(
                                                ot,
                                                'r_ot',
                                                undefined,
                                                true,
                                            ) && (
                                                <Button
                                                    onClick={() => {
                                                        setSelectedOt(ot);
                                                        setFormData({
                                                            diagnostico:
                                                                ot.diagnostico ||
                                                                '',
                                                            accion:
                                                                ot.accion || '',
                                                            sugerencia:
                                                                ot.sugerencia ||
                                                                '',
                                                        });
                                                        setEditModalOpen(true);
                                                    }}
                                                >
                                                    R
                                                </Button>
                                            )}
                                            {/* {canDo(ot, 'u_ot', 24, false) && (
                                                <Button
                                                    size="sm"
                                                    variant="secondary"
                                                    onClick={() =>
                                                        handleEdit(ot.id)
                                                    }
                                                >
                                                    <Edit className="mr-1 h-4 w-4" />{' '}
                                                    Editar
                                                </Button>
                                            )} */}

                                            <Button
                                                size="sm"
                                                variant="outline"
                                                onClick={() =>
                                                    abrirTiemposDialog(ot)
                                                }
                                            >
                                                ⏱️
                                            </Button>

                                            {canDo(
                                                ot,
                                                'r_ot',
                                                undefined,
                                                true,
                                            ) && (
                                                <Button
                                                    size="sm"
                                                    variant="outline"
                                                    onClick={() =>
                                                        abrirAgregarAyudante(ot)
                                                    }
                                                >
                                                    👥
                                                </Button>
                                            )}
                                        </CardFooter>
                                    </Card>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Paginación */}
                    {/* Paginación */}
                    {ots.data.length > 0 && (
                        <div className="border-t border-border px-4 py-3">
                            <TablePagination
                                pagination={ots}
                                onPageChange={(page) =>
                                    router.get(
                                        route('ots'),
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
                        Total OTs: {ots.total}
                    </p>
                </div>
            </div>

            {selectedOt && (
                <Dialog open={viewModalOpen} onOpenChange={setViewModalOpen}>
                    <DialogContent className="max-w-3xl">
                        <DialogHeader>
                            <DialogTitle>
                                Detalles de OT #{selectedOt.solicitud_ot?.id}
                            </DialogTitle>
                            <DialogDescription>
                                Visualiza todos los datos de la OT
                            </DialogDescription>
                        </DialogHeader>

                        <div className="space-y-4">
                            <div className="grid grid-cols-2 gap-4 border-b pb-4">
                                <div>
                                    <p className="text-sm text-muted-foreground">
                                        Fecha solicitada
                                    </p>
                                    <p className="font-medium">
                                        <Fecha
                                            value={
                                                selectedOt.solicitud_ot?.tiempo
                                            }
                                        />
                                    </p>
                                </div>
                                <div>
                                    <p className="text-sm text-muted-foreground">
                                        Solicitante
                                    </p>
                                    <p className="font-medium">
                                        {selectedOt.solicitud_ot?.user?.name ||
                                            '-'}
                                    </p>
                                </div>
                                <div>
                                    <p className="text-sm text-muted-foreground">
                                        Asignado
                                    </p>
                                    <p className="font-medium">
                                        {selectedOt.user?.name || '-'}
                                    </p>
                                </div>
                                <div>
                                    <p className="text-sm text-muted-foreground">
                                        Área
                                    </p>
                                    <p className="font-medium">
                                        {selectedOt.solicitud_ot?.sector
                                            ?.nombre || '-'}
                                    </p>
                                </div>
                                <div>
                                    <p className="text-sm text-muted-foreground">
                                        Máquina/Equipo
                                    </p>
                                    <p className="font-medium">
                                        {selectedOt.solicitud_ot?.maquina_equipo
                                            ?.nombre || '-'}
                                    </p>
                                </div>
                                <div>
                                    <p className="text-sm text-muted-foreground">
                                        Tipo de orden
                                    </p>
                                    <p className="font-medium">
                                        {selectedOt.tipo_orden || '-'}
                                    </p>
                                </div>
                                <div>
                                    <p className="text-sm text-muted-foreground">
                                        Prioridad
                                    </p>
                                    <p className="font-medium">
                                        {selectedOt.prioridad?.nombre || '-'}
                                    </p>
                                </div>

                                <div className="col-span-2">
                                    <p className="text-sm text-muted-foreground">
                                        Descripcion:
                                    </p>
                                    <p className="font-medium">
                                        {selectedOt.solicitud_ot?.descripcion ||
                                            '-'}
                                    </p>
                                </div>

                                <div className="col-span-2">
                                    <p className="text-sm text-muted-foreground">
                                        Nota adicional
                                    </p>
                                    <p className="font-medium">
                                        {selectedOt.notas ||
                                            'Ninguna nota adicional.'}
                                    </p>
                                </div>
                            </div>

                            <div className="flex justify-end pt-4">
                                <Button
                                    variant="outline"
                                    onClick={() => setViewModalOpen(false)}
                                >
                                    Cerrar
                                </Button>
                            </div>
                        </div>
                    </DialogContent>
                </Dialog>
            )}

            {/* Modal para editar Diagnóstico / Acción / Sugerencia */}
            <Dialog open={editModalOpen} onOpenChange={setEditModalOpen}>
                <DialogContent className="max-w-2xl">
                    <DialogHeader>
                        <DialogTitle>
                            Editar detalles de OT #
                            {selectedOt?.solicitud_ot?.id || selectedOt?.id}
                        </DialogTitle>
                        <DialogDescription>
                            Agrega o modifica diagnóstico, acción y sugerencia.
                        </DialogDescription>
                    </DialogHeader>

                    <form onSubmit={handleSubmitEdit} className="space-y-4">
                        <div className="grid grid-cols-1 gap-3">
                            <div>
                                <label className="text-sm text-muted-foreground">
                                    Diagnóstico
                                </label>
                                <textarea
                                    rows={3}
                                    value={formData.diagnostico}
                                    onChange={(e) =>
                                        setFormData({
                                            ...formData,
                                            diagnostico: e.target.value,
                                        })
                                    }
                                    className="w-full rounded border p-2 text-sm"
                                    placeholder="Escribe el diagnóstico..."
                                />
                            </div>

                            <div>
                                <label className="text-sm text-muted-foreground">
                                    Acción
                                </label>
                                <textarea
                                    rows={3}
                                    value={formData.accion}
                                    onChange={(e) =>
                                        setFormData({
                                            ...formData,
                                            accion: e.target.value,
                                        })
                                    }
                                    className="w-full rounded border p-2 text-sm"
                                    placeholder="Describe la acción a realizar..."
                                />
                            </div>

                            <div>
                                <label className="text-sm text-muted-foreground">
                                    Sugerencia
                                </label>
                                <textarea
                                    rows={2}
                                    value={formData.sugerencia}
                                    onChange={(e) =>
                                        setFormData({
                                            ...formData,
                                            sugerencia: e.target.value,
                                        })
                                    }
                                    className="w-full rounded border p-2 text-sm"
                                    placeholder="Añade sugerencias (opcional)..."
                                />
                            </div>
                        </div>

                        <div className="flex justify-end space-x-2 pt-2">
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => setEditModalOpen(false)}
                            >
                                Cancelar
                            </Button>

                            <Button type="submit">Guardar</Button>
                        </div>
                    </form>
                </DialogContent>
            </Dialog>


{selectedOtForTiempos && (
  <TiemposDialog
    ot={selectedOtForTiempos}
    open={tiemposDialogOpen}
    onOpenChange={(open) => {
      setTiemposDialogOpen(open);
      if (!open) setSelectedOtForTiempos(null);
    }}
    users={users}               // 👈 agregado
    authUserId={authUser?.id}   // 👈 agregado
  />
)}


            {selectedOtForAyudante && (
                <AgregarAyudanteDialog
                    ot={selectedOtForAyudante}
                    open={ayudanteDialogOpen}
                    onOpenChange={(open) => {
                        setAyudanteDialogOpen(open);
                        if (!open) setSelectedOtForAyudante(null);
                    }}
                    onAsignado={() => {
                        // Opcional: recargar la lista de OTs si quieres que el nuevo ayudante aparezca inmediatamente
                        // router.reload({ only: ['ots'] });
                    }}
                />
            )}
        </AppLayout>
    );
}
