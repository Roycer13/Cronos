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
import { UserPlus, Search, Filter, X, MoreHorizontal, Edit, Trash2, Eye } from 'lucide-react';
import { route } from 'ziggy-js';
import { useState } from 'react';

import TablePagination from '@/components/ui/table-pagination';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

const breadcrumbs: BreadcrumbItem[] = [



    {
        title: 'Repuestos',
        href: '/mantenimiento/repuestos',
    },
   ];

interface PageProps {
    repuestos: {
        data: any[];
        links: any[];
        current_page: number;
        last_page: number;
        per_page: number;
        total: number;
    };
    filters: {
        search?: string;
        nombre?: string;
        codigo?: string;
        unidad_id?: number;
        per_page?: number;
    };
    unidades?: { id: number; nombre: string }[];
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
        repuestos = {
            data: [],
            links: [],
            current_page: 1,
            last_page: 1,
            per_page: 10,
            total: 0,
        },
        filters: initialFilters = {},
        unidades = [],

        flash,
    } = props as unknown as PageProps;

    const { filters, updateFilter, resetFilters } = useAdvancedFilters({
        routeName: 'repuestos',
        initialFilters: {
            search: initialFilters.search || '',
            nombre: initialFilters.nombre || '',
            codigo: initialFilters.codigo || '',
            unidad_id: initialFilters.unidad_id?.toString() || undefined,
            per_page: initialFilters.per_page?.toString() || '10',
        },
        debounceFields: ['search', 'nombre', 'codigo'],
        debounceDelay: 600,
    });

    const hasActiveFilters = Object.values(filters).some(
        (value) => value && value !== '' && value !== '10'
    );

    const handleEdit = (id: number) => {
        router.visit(route('repuestos.editar', id));
    };

    const handleDelete = (id: number) => {
        if (confirm('¿Eliminar este usuario?')) {
            router.delete(route('repuestos.eliminar', id), {
                preserveScroll: true,
            });
        }
    };

    const handleView = (id: number) => {
        router.visit(route('repuestos.mostrar', id));
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Repuestos" />
            <div className="px-2 sm:px-6 py-2 space-y-2">
                <Toast />
                {/* Header */}
                <div className="flex items-center justify-between">
                    {/* Búsqueda rápida */}
                    <div className="relative max-w-md">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                            placeholder="Buscar por nombre o código..."
                            value={filters.search}
                            onChange={(e) => updateFilter('search', e.target.value)}
                            className="pl-10"
                        />
                    </div>
                    <div className="flex items-center gap-2">
                        {hasPermission('c_repuesto') &&
                        belongsToUbicacion('Lácteos') && (
                            <Link href={route('repuestos.crear')}>
                                <Button size="sm">
                                    <UserPlus className="h-4 w-4" />
                                    <p className='hidden md:block'>Nuevo Repuesto</p>
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
                            <p className='hidden md:block'>Filtros</p>
                            {hasActiveFilters && (
                                <span className="bg-primary text-primary-foreground rounded-full h-5 w-5 text-xs flex items-center justify-center">
                                    !
                                </span>
                            )}
                        </Button>
                    </div>
                </div>

                {/* Filtros avanzados */}
                {showFilters && (
                    <div className="bg-muted/50 rounded-lg p-2 border border-border">
                        <div className="flex items-center justify-between mb-3">
                            <h3 className="text-sm font-semibold text-foreground">Filtros avanzados</h3>
                            <div className="flex items-center gap-2">
                                {hasActiveFilters && (
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={resetFilters}
                                        className="text-xs text-muted-foreground hover:text-foreground"
                                    >
                                        <X className="h-4 w-4 mr-1" />
                                        Limpiar
                                    </Button>
                                )}
                            </div>
                        </div>

                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
                            <Input
                                placeholder="Nombre"
                                value={filters.nombre}
                                onChange={(e) => updateFilter('nombre', e.target.value)}
                                className="text-sm"
                            />

                            <Input
                                placeholder="Codigo"
                                value={filters.codigo}
                                onChange={(e) => updateFilter('codigo', e.target.value)}
                                className="text-sm"
                            />

                            <FilterSelect
                                value={filters.unidad_id}
                                onChange={(v) => updateFilter('unidad_id', v)}
                                placeholder="Seleccionar una unidad"
                                options={unidades.map((r) => ({
                                    value: r.id.toString(),
                                    label: r.nombre,
                                }))}
                            />






                        </div>
                    </div>
                )}

                {/* Tabla */}
                <div className="bg-background rounded-lg border border-border shadow-sm overflow-hidden">
                    <div className="overflow-x-auto">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    {[
                                        'Código',
                                        'Nombre',
                                        'Stock minimo',
                                        'Unidad',
                                        'Precio Relativo',
                                        'Stock Actual',
                                        '',

                                    ].map((col, idx) => (
                                        <TableHead key={idx}>{col}</TableHead>
                                    ))}
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {repuestos.data.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                                            <div className="flex flex-col items-center justify-center">
                                                <Search className="h-12 w-12 text-muted-foreground/50 mb-3" />
                                                <p className="text-lg font-medium text-foreground mb-1">
                                                    No se encontraron usuarios
                                                </p>
                                                <p className="text-sm text-muted-foreground">
                                                    {hasActiveFilters
                                                        ? "Intenta ajustar los filtros para ver más resultados"
                                                        : "No hay usuarios registrados en el sistema"
                                                    }
                                                </p>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    repuestos.data.map((repuesto) => (
                                        <TableRow key={repuesto.id} className="hover:bg-muted/50">
                                            <TableCell>
                                                <span className="font-mono text-sm font-medium text-foreground">
                                                    {repuesto.codigo}
                                                </span>
                                            </TableCell>
                                            <TableCell>
                                                <div>
                                                    <div className="font-medium text-foreground">
                                                        {repuesto.nombre}
                                                    </div>
                                                    <div className="text-xs font-medium text-muted-foreground">
                                                        {repuesto.observaciones}
                                                    </div>
                                                </div>
                                            </TableCell>

                                            <TableCell className="text-muted-foreground">
                                                {repuesto.stock_minimo|| '-'}
                                            </TableCell>
                                            <TableCell className="text-muted-foreground">
                                                {repuesto.unidad?.nombre || '-'}
                                            </TableCell>

                                            <TableCell className="text-muted-foreground">
                                                {repuesto.precio_relativo || '-'}
                                            </TableCell>
                                            <TableCell className="text-muted-foreground">
    <span className={
        repuesto.stock_minimo !== null && repuesto.stock_actual < repuesto.stock_minimo
            ? 'text-red-600 font-semibold'
            : 'text-green-600 font-semibold'
    }>
        {repuesto.stock_actual/1 ?? 0}
    </span>
</TableCell>
                                             <TableCell>
                                                <DropdownMenu>
                                                    <DropdownMenuTrigger asChild>
                                                        <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                                                            <MoreHorizontal className="h-4 w-4" />
                                                            <span className="sr-only">Abrir menú</span>
                                                        </Button>
                                                    </DropdownMenuTrigger>
                                                    <DropdownMenuContent align="end" className="w-48">
                                                        <DropdownMenuItem onClick={() => handleView(repuesto.id)}>
                                                            <Eye className="mr-2 h-4 w-4" />
                                                            <span>Ver detalles</span>
                                                        </DropdownMenuItem>
                                                        {hasPermission('u_repuesto') &&
                        belongsToUbicacion('Lácteos') && (
                                                            <DropdownMenuItem onClick={() => handleEdit(repuesto.id)}>
                                                                <Edit className="mr-2 h-4 w-4" />
                                                                <span>Editar repuesto</span>
                                                            </DropdownMenuItem>
                                                        )}
                                                        {canDo(repuestos, 'd_repuesto', 480, false) && (
                                                            <DropdownMenuItem
                                                                onClick={() => handleDelete(repuesto.id)}
                                                                className="text-destructive focus:text-destructive"
                                                            >
                                                                <Trash2 className="mr-2 h-4 w-4" />
                                                                <span>Eliminar Repuesto</span>
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
                    {repuestos.data.length > 0 && (
                        <div className="border-t border-border px-4 py-3">
                            <TablePagination
                                pagination={repuestos}
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
                <div className='flex justify-between'>
                    <p className="text-sm text-muted-foreground mt-1">
                        {repuestos.total} usuarios registrados
                    </p>
                    <div>
                        {repuestos.data.length > 0 && (
                            <div className="text-center">
                                <p className="text-sm text-muted-foreground">
                                    Mostrando <span className="font-medium text-foreground">{repuestos.data.length}</span> de{' '}
                                    <span className="font-medium text-foreground">{repuestos.total}</span> repuestos
                                </p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
