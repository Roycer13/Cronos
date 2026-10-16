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
    Eye,
    Filter,
    Milk,
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
    {
        title: 'Recepciones de Leche',
        href: '/planta-lacteos/recepciones-leche',
    },
];

interface PageProps {
    recepciones: {
        data: any[];
        links: any[];
        current_page: number;
        last_page: number;
        per_page: number;
        total: number;
    };
    filters: {
        search?: string; // ← AGREGAR ESTA LÍNEA
        PLL_subruta_acopios_id?: number;
        estado_id?: number;
        user_id?: number;
        tipo_recepcion?: string;
        ruta_id?: number;
        per_page?: number;
    };
    subrutas?: { id: number; nombre: string; ruta: { nombre: string } }[];
    rutas?: { id: number; nombre: string }[];
    estados?: { id: number; nombre: string }[];
    usuarios?: { id: number; name: string; apellido: string }[];
    flash: {
        success?: string;
        error?: string;
    };
}

export default function Index() {
    const { props } = usePage();
    const [showFilters, setShowFilters] = useState(false);

    const {
        hasPermission,
        belongsToUbicacion,
        canDo,
        user: authUser,
    } = useAuth();

    const {
        recepciones = {
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
        usuarios = [],
        flash,
    } = props as unknown as PageProps;

    const { filters, updateFilter, resetFilters } = useAdvancedFilters({
        routeName: 'recepciones-leche.index',
        initialFilters: {
            search: initialFilters.search || '', // ← AGREGAR ESTA LÍNEA
            PLL_subruta_acopios_id:
                initialFilters.PLL_subruta_acopios_id?.toString() || undefined,
            estado_id: initialFilters.estado_id?.toString() || undefined,
            user_id: initialFilters.user_id?.toString() || undefined,
            tipo_recepcion: initialFilters.tipo_recepcion || undefined,
            ruta_id: initialFilters.ruta_id?.toString() || undefined,
            per_page: initialFilters.per_page?.toString() || '10',
        },
        debounceFields: ['search'], // ← AGREGAR 'search' AQUÍ
        debounceDelay: 600,
    });

    const hasActiveFilters = Object.values(filters).some(
        (value) => value && value !== '' && value !== '10',
    );

    const handleEdit = (id: number) => {
        router.visit(route('recepciones-leche.edit', id));
    };

    const handleDelete = (id: number) => {
        if (confirm('¿Está seguro de eliminar esta recepción de leche?')) {
            router.delete(route('recepciones-leche.destroy', id), {
                preserveScroll: true,
            });
        }
    };

    const handleView = (id: number) => {
        // router.visit(route('recepciones-leche.show', id));
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

    const formatCantidad = (cantidad: number) => {
        return new Intl.NumberFormat('es-ES', {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
        }).format(cantidad);
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Recepciones de Leche" />
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
                        {hasPermission('c_recepcionLeche') && (
                            <Link href={route('recepciones-leche.create')}>
                                <Button size="sm">
                                    <Plus className="h-4 w-4" />
                                    <p className="hidden md:block">
                                        Nueva Recepción
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
                                value={filters.PLL_subruta_acopios_id}
                                onChange={(v) =>
                                    updateFilter('PLL_subruta_acopios_id', v)
                                }
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
                                value={filters.user_id}
                                onChange={(v) => updateFilter('user_id', v)}
                                placeholder="Todos los usuarios"
                                options={usuarios.map((u) => ({
                                    value: u.id.toString(),
                                    label: `${u.name} ${u.apellido}`,
                                }))}
                            />

                            <FilterSelect
                                value={filters.tipo_recepcion}
                                onChange={(v) =>
                                    updateFilter('tipo_recepcion', v)
                                }
                                placeholder="Todos los tipos"
                                options={[
                                    { value: 'camion', label: 'Camión' },
                                    { value: 'tubo', label: 'Tubo' },
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
                    </div>
                )}

                {/* Resto del código permanece igual... */}
                {/* Tabla */}
                <div className="overflow-hidden rounded-lg border border-border bg-background shadow-sm">
                    <div className="overflow-x-auto">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    {[
                                        'Fecha/Hora',
                                        'Subruta',
                                        'Ruta',
                                        'Cantidad (L)',
                                        'Tipo',
                                        'Usuario',
                                        'Estado',
                                        '',
                                    ].map((col, idx) => (
                                        <TableHead key={idx}>{col}</TableHead>
                                    ))}
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {recepciones.data.length === 0 ? (
                                    <TableRow>
                                        <TableCell
                                            colSpan={9}
                                            className="py-8 text-center text-muted-foreground"
                                        >
                                            <div className="flex flex-col items-center justify-center">
                                                <Milk className="mb-3 h-12 w-12 text-muted-foreground/50" />
                                                <p className="mb-1 text-lg font-medium text-foreground">
                                                    No se encontraron
                                                    recepciones
                                                </p>
                                                <p className="text-muted-foreground">
                                                    {hasActiveFilters
                                                        ? 'Intenta ajustar los filtros para ver más resultados'
                                                        : 'No hay recepciones registradas en el sistema'}
                                                </p>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    recepciones.data.map((recepcion) => (
                                        <TableRow
                                            key={recepcion.id}
                                            className="hover:bg-muted/50"
                                        >
                                            <TableCell>
                                                <div className="font-medium text-foreground">
                                                    {formatFecha(
                                                        recepcion.tiempo,
                                                    )}
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <div className="font-medium text-foreground">
                                                    {recepcion.subruta
                                                        ?.nombre || '-'}
                                                </div>
                                            </TableCell>
                                            <TableCell className="text-muted-foreground">
                                                {recepcion.subruta?.ruta
                                                    ?.nombre || '-'}
                                            </TableCell>
                                            <TableCell>
                                                <span className="font-mono font-medium text-foreground">
                                                    {formatCantidad(
                                                        recepcion.cantidad,
                                                    )}{' '}
                                                    L
                                                </span>
                                            </TableCell>
                                            <TableCell>
                                                <span
                                                    className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium capitalize ${
                                                        recepcion.tipo_recepcion ===
                                                        'camion'
                                                            ? 'bg-blue-100 text-blue-800 dark:bg-blue-800/30 dark:text-blue-400'
                                                            : 'bg-green-100 text-green-800 dark:bg-green-800/30 dark:text-green-400'
                                                    }`}
                                                >
                                                    {recepcion.tipo_recepcion}
                                                </span>
                                            </TableCell>
                                            <TableCell className="text-muted-foreground">
                                                {recepcion.usuario
                                                    ? `${recepcion.usuario.name} ${recepcion.usuario.apellido}`
                                                    : '-'}
                                            </TableCell>
                                            <TableCell>
                                                {recepcion.estado ? (
                                                    <span
                                                        className="inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium"
                                                        style={{
                                                            backgroundColor:
                                                                recepcion.estado
                                                                    .color +
                                                                '20', // Color con transparencia (20 = 12%)
                                                            color: recepcion
                                                                .estado.color,
                                                        }}
                                                    >
                                                        {
                                                            recepcion.estado
                                                                .nombre
                                                        }
                                                    </span>
                                                ) : (
                                                    <span className="inline-flex items-center rounded-full bg-gray-100 px-2.5 py-1 text-xs font-medium text-gray-500">
                                                        Sin estado
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
                                                                    recepcion.id,
                                                                )
                                                            }
                                                        >
                                                            <Eye className="mr-2 h-4 w-4" />
                                                            <span>
                                                                Ver detalles
                                                            </span>
                                                        </DropdownMenuItem> */}
                                                        {/* {canDo(recepcion, 'u_recepcionLeche', 24, false) && (
                                                            <DropdownMenuItem onClick={() => handleEdit(recepcion.id)}>
                                                                <Edit className="mr-2 h-4 w-4" />
                                                                <span>Editar recepción</span>
                                                            </DropdownMenuItem>
                                                        )} */}
                                                        {canDo(
                                                            recepcion,
                                                            'd_recepcionLeche',
                                                            8,
                                                            true,
                                                            false,
                                                            false,
                                                        ) && (
                                                            <DropdownMenuItem
                                                                onClick={() =>
                                                                    handleDelete(
                                                                        recepcion.id,
                                                                    )
                                                                }
                                                                className="text-destructive focus:text-destructive"
                                                            >
                                                                <Trash2 className="mr-2 h-4 w-4" />
                                                                <span>
                                                                    Eliminar
                                                                    recepción
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
                    {recepciones.data.length > 0 && (
                        <div className="border-t border-border px-4 py-3">
                            <TablePagination
                                pagination={recepciones}
                                onPageChange={(page) =>
                                    router.get(
                                        route('recepciones-leche.index'),
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
                        {recepciones.total} recepciones registradas
                    </p>
                    <div>
                        {recepciones.data.length > 0 && (
                            <div className="text-center">
                                <p className="text-muted-foreground">
                                    Mostrando{' '}
                                    <span className="font-medium text-foreground">
                                        {recepciones.data.length}
                                    </span>{' '}
                                    de{' '}
                                    <span className="font-medium text-foreground">
                                        {recepciones.total}
                                    </span>{' '}
                                    recepciones
                                </p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
