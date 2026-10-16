// resources/js/Pages/planta_lacteos/limpiezaTanquesAereos/index.tsx

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
    Droplets,
    Edit,
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
    {
        title: 'Limpieza de Tanques Aéreos',
        href: '/planta-lacteos/limpieza-tanques-aereos',
    },
];

interface PageProps {
    limpiezas: {
        data: any[];
        links: any[];
        current_page: number;
        last_page: number;
        per_page: number;
        total: number;
    };
    usuarios: { id: number; name: string; apellido: string }[];
    filters: {
        search?: string;
        tanque?: string;
        user_id?: string;
        fecha_desde?: string;
        fecha_hasta?: string;
        per_page?: string;
    };
    flash: { success?: string; error?: string };
}

export default function Index() {
    const { props } = usePage();
    const [showFilters, setShowFilters] = useState(false);
    const { hasPermission, canDo } = useAuth();

    const {
        limpiezas = { data: [], links: [], current_page: 1, last_page: 1, per_page: 10, total: 0 },
        usuarios = [],
        filters: initialFilters = {},
        flash,
    } = props as unknown as PageProps;

    const { filters, updateFilter, resetFilters } = useAdvancedFilters({
        routeName: 'limpieza-tanques-aereos.index',
        initialFilters: {
            search: initialFilters.search || '',
            tanque: initialFilters.tanque || '',
            user_id: initialFilters.user_id?.toString() || '',
            fecha_desde: initialFilters.fecha_desde || '',
            fecha_hasta: initialFilters.fecha_hasta || '',
            per_page: initialFilters.per_page?.toString() || '10',
        },
        debounceFields: ['search', 'tanque'],
        debounceDelay: 600,
    });

    const hasActiveFilters = Object.values(filters).some(
        (value) => value && value !== '' && value !== '10'
    );

    const handleEdit = (id: number) => {
        router.visit(route('limpieza-tanques-aereos.edit', id));
    };

    const handleDelete = (id: number) => {
        if (confirm('¿Eliminar este registro de limpieza?')) {
            router.delete(route('limpieza-tanques-aereos.destroy', id), {
                preserveScroll: true,
            });
        }
    };

    const formatFecha = (fecha: string) => {
        return new Date(fecha).toLocaleString('es-ES', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        });
    };

    const renderCheck = (value: boolean) => (
        <span className={`inline-block w-3 h-3 rounded-full ${value ? 'bg-green-500' : 'bg-red-500'}`} />
    );
    const renderEstado = (valor: boolean, letra: string) => (
    <span
        className={`inline-flex h-6 w-6 items-center justify-center rounded-full text-xs font-bold ${
            valor
                ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
        }`}
        title={valor ? 'OK' : 'No conforme'}
    >
        {letra}
    </span>
);

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Limpieza de Tanques Aéreos" />
            <div className="space-y-2 px-2 py-2 sm:px-6">
                <Toast />
                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                    <div className="relative max-w-md w-full">
                        <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                        <Input
                            placeholder="Buscar por tanque, corrección u observación..."
                            value={filters.search || ''}
                            onChange={(e) => updateFilter('search', e.target.value)}
                            className="pl-10"
                        />
                    </div>
                    <div className="flex items-center gap-2">
                        {hasPermission('c_limpiezaTanques') && (
                            <Link href={route('limpieza-tanques-aereos.create')}>
                                <Button size="sm">
                                    <Plus className="h-4 w-4" />
                                    <p className="hidden md:block">Nueva Limpieza</p>
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
                            <h3 className="font-semibold text-foreground">Filtros avanzados</h3>
                            {hasActiveFilters && (
                                <Button variant="ghost" size="sm" onClick={resetFilters} className="text-xs">
                                    <X className="mr-1 h-4 w-4" /> Limpiar
                                </Button>
                            )}
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
                            <Input
                                placeholder="Tanque específico"
                                value={filters.tanque || ''}
                                onChange={(e) => updateFilter('tanque', e.target.value)}
                            />
                            <FilterSelect
                                value={filters.user_id}
                                onChange={(v) => updateFilter('user_id', v)}
                                placeholder="Todos los usuarios"
                                options={usuarios.map(u => ({ value: u.id.toString(), label: `${u.name} ${u.apellido || ''}` }))}
                            />
                            <Input
                                type="date"
                                value={filters.fecha_desde || ''}
                                onChange={(e) => updateFilter('fecha_desde', e.target.value)}
                                placeholder="Fecha desde"
                            />
                            <Input
                                type="date"
                                value={filters.fecha_hasta || ''}
                                onChange={(e) => updateFilter('fecha_hasta', e.target.value)}
                                placeholder="Fecha hasta"
                            />
                            <FilterSelect
                                value={filters.per_page}
                                onChange={(v) => updateFilter('per_page', v)}
                                placeholder="Por página"
                                options={['10', '25', '50', '100'].map(v => ({ value: v, label: `${v} por página` }))}
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
                                    <TableHead>Fecha/Hora</TableHead>
                                    <TableHead>Tanque</TableHead>
                                    <TableHead>Usuario</TableHead>
                                    <TableHead>Tapa</TableHead>
                                    <TableHead>Paredes</TableHead>
                                    <TableHead>Piso</TableHead>
                                    <TableHead>Conexiones</TableHead>
                                    <TableHead>Corrección</TableHead>
                                    <TableHead></TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
    {limpiezas.data.length === 0 ? (
        <TableRow>
            <TableCell colSpan={9} className="py-8 text-center text-muted-foreground">
                <div className="flex flex-col items-center">
                    <Droplets className="mb-3 h-12 w-12 text-muted-foreground/50" />
                    <p className="text-lg font-medium">No hay registros de limpieza</p>
                    <p className="text-sm">Crea uno nuevo usando el botón superior</p>
                </div>
            </TableCell>
        </TableRow>
    ) : (
        limpiezas.data.map((item) => (
            <TableRow key={item.id} className="hover:bg-muted/50">
                <TableCell>{formatFecha(item.tiempo)}</TableCell>
                <TableCell className="font-medium">{item.tanque || '-'}</TableCell>
                <TableCell>
                    {item.usuario ? `${item.usuario.name} ${item.usuario.apellido || ''}` : '-'}
                </TableCell>

                {/* Tapa */}
                <TableCell>
                    <div className="flex gap-2">
                        <span
                            className={`inline-flex h-6 w-6 items-center justify-center rounded-full text-xs font-bold ${
                                item.l_tapa
                                    ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                                    : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
                            }`}
                            title={item.l_tapa ? 'Limpieza OK' : 'Limpieza No conforme'}
                        >
                            L
                        </span>
                        <span
                            className={`inline-flex h-6 w-6 items-center justify-center rounded-full text-xs font-bold ${
                                item.d_tapa
                                    ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                                    : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
                            }`}
                            title={item.d_tapa ? 'Desinfección OK' : 'Desinfección No conforme'}
                        >
                            D
                        </span>
                    </div>
                </TableCell>

                {/* Paredes */}
                <TableCell>
                    <div className="flex gap-2">
                        <span
                            className={`inline-flex h-6 w-6 items-center justify-center rounded-full text-xs font-bold ${
                                item.l_paredes
                                    ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                                    : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
                            }`}
                        >
                            L
                        </span>
                        <span
                            className={`inline-flex h-6 w-6 items-center justify-center rounded-full text-xs font-bold ${
                                item.d_paredes
                                    ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                                    : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
                            }`}
                        >
                            D
                        </span>
                    </div>
                </TableCell>

                {/* Piso */}
                <TableCell>
                    <div className="flex gap-2">
                        <span
                            className={`inline-flex h-6 w-6 items-center justify-center rounded-full text-xs font-bold ${
                                item.l_piso
                                    ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                                    : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
                            }`}
                        >
                            L
                        </span>
                        <span
                            className={`inline-flex h-6 w-6 items-center justify-center rounded-full text-xs font-bold ${
                                item.d_piso
                                    ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                                    : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
                            }`}
                        >
                            D
                        </span>
                    </div>
                </TableCell>

                {/* Conexiones */}
                <TableCell>
                    <div className="flex gap-2">
                        <span
                            className={`inline-flex h-6 w-6 items-center justify-center rounded-full text-xs font-bold ${
                                item.l_conexiones
                                    ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                                    : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
                            }`}
                        >
                            L
                        </span>
                        <span
                            className={`inline-flex h-6 w-6 items-center justify-center rounded-full text-xs font-bold ${
                                item.d_conexiones
                                    ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                                    : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
                            }`}
                        >
                            D
                        </span>
                    </div>
                </TableCell>

                <TableCell className="max-w-xs truncate">{item.correccion || '-'}</TableCell>

                {/* Acciones */}
                <TableCell>
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                                <MoreHorizontal className="h-4 w-4" />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                            {hasPermission('u_limpiezaTanques') && (
                                <DropdownMenuItem onClick={() => handleEdit(item.id)}>
                                    <Edit className="mr-2 h-4 w-4" /> Editar
                                </DropdownMenuItem>
                            )}
                            {canDo(item, 'd_limpiezaTanques', 8, true, false, false) && (
                                <DropdownMenuItem
                                    onClick={() => handleDelete(item.id)}
                                    className="text-destructive"
                                >
                                    <Trash2 className="mr-2 h-4 w-4" /> Eliminar
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
                    {limpiezas.data.length > 0 && (
                        <div className="border-t px-4 py-3">
                            <TablePagination
                                pagination={limpiezas}
                                onPageChange={(page) =>
                                    router.get(route('limpieza-tanques-aereos.index'), { ...filters, page }, { preserveState: true })
                                }
                            />
                        </div>
                    )}
                </div>
                <div className="flex justify-between text-sm text-muted-foreground">
                    <p>Total: {limpiezas.total} registros</p>
                    {limpiezas.data.length > 0 && <p>Mostrando {limpiezas.data.length} de {limpiezas.total}</p>}
                </div>
            </div>
        </AppLayout>
    );
}
