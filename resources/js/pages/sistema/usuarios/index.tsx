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

    { title: "Usuarios", href: "/sistemas/roles-permisos" },
];

interface PageProps {
    users: {
        data: any[];
        links: any[];
        current_page: number;
        last_page: number;
        per_page: number;
        total: number;
    };
    filters: {
        search?: string;
        name?: string;
        apellido?: string;
        rol_id?: number;
        ubicacion_id?: number;
        area_id?: number;
        per_page?: number;
    };
    roles?: { id: number; name: string }[];
    ubicaciones?: { id: number; nombre: string }[];
    areas?: { id: number; nombre: string }[];
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
        users = {
            data: [],
            links: [],
            current_page: 1,
            last_page: 1,
            per_page: 10,
            total: 0,
        },
        filters: initialFilters = {},
        roles = [],
        ubicaciones = [],
        areas = [],
        flash,
    } = props as unknown as PageProps;

    const { filters, updateFilter, resetFilters } = useAdvancedFilters({
        routeName: 'usuarios',
        initialFilters: {
            search: initialFilters.search || '',
            name: initialFilters.name || '',
            apellido: initialFilters.apellido || '',
            rol_id: initialFilters.rol_id?.toString() || undefined,
            ubicacion_id: initialFilters.ubicacion_id?.toString() || undefined,
            area_id: initialFilters.area_id?.toString() || undefined,
            per_page: initialFilters.per_page?.toString() || '10',
        },
        debounceFields: ['search', 'name', 'apellido'],
        debounceDelay: 600,
    });

    const hasActiveFilters = Object.values(filters).some(
        (value) => value && value !== '' && value !== '10'
    );

    const handleEdit = (id: number) => {
        router.visit(route('usuarios.editar', id));
    };

    const handleDelete = (id: number) => {
        if (confirm('¿Eliminar este usuario?')) {
            router.delete(route('usuarios.eliminar', id), {
                preserveScroll: true,
            });
        }
    };

    const handleView = (id: number) => {
        router.visit(route('usuarios.mostrar', id));
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Usuarios" />
            <div className="px-2 sm:px-6 py-2 space-y-2">
                <Toast />
                {/* Header */}
                <div className="flex items-center justify-between">
                    {/* Búsqueda rápida */}
                    <div className="relative max-w-md">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                            placeholder="Buscar por nombre, email o código..."
                            value={filters.search}
                            onChange={(e) => updateFilter('search', e.target.value)}
                            className="pl-10"
                        />
                    </div>
                    <div className="flex items-center gap-2">
                        {hasPermission('c_usuario') && belongsToUbicacion('Lácteos') && (
                            <Link href={route('usuarios.crear')}>
                                <Button size="sm">
                                    <UserPlus className="h-4 w-4" />
                                    <p className='hidden md:block'>Nuevo Usuario</p>
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
                                value={filters.name}
                                onChange={(e) => updateFilter('name', e.target.value)}
                                className="text-sm"
                            />

                            <Input
                                placeholder="Apellido"
                                value={filters.apellido}
                                onChange={(e) => updateFilter('apellido', e.target.value)}
                                className="text-sm"
                            />

                            <FilterSelect
                                value={filters.rol_id}
                                onChange={(v) => updateFilter('rol_id', v)}
                                placeholder="Seleccionar rol"
                                options={roles.map((r) => ({
                                    value: r.id.toString(),
                                    label: r.name,
                                }))}
                            />

                            <FilterSelect
                                value={filters.ubicacion_id}
                                onChange={(v) => updateFilter('ubicacion_id', v)}
                                placeholder="Seleccionar ubicación"
                                options={ubicaciones.map((p) => ({
                                    value: p.id.toString(),
                                    label: p.nombre,
                                }))}
                            />

                            <FilterSelect
                                value={filters.area_id}
                                onChange={(v) => updateFilter('area_id', v)}
                                placeholder="Seleccionar área"
                                options={areas.map((a) => ({
                                    value: a.id.toString(),
                                    label: a.nombre,
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
                <div className="bg-background rounded-lg border border-border shadow-sm overflow-hidden">
                    <div className="overflow-x-auto">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    {[
                                        'Código',
                                        'Nombre',
                                        'Rol',
                                        'Ubicación',
                                        'Área',
                                        'Estado',
                                        'Turno',
                                        '',
                                    ].map((col, idx) => (
                                        <TableHead key={idx}>{col}</TableHead>
                                    ))}
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {users.data.length === 0 ? (
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
                                    users.data.map((user) => (
                                        <TableRow key={user.id} className="hover:bg-muted/50">
                                            <TableCell>
                                                <span className="font-mono text-sm font-medium text-foreground">
                                                    {user.codigo}
                                                </span>
                                            </TableCell>
                                            <TableCell>
                                                <div>
                                                    <div className="font-medium text-foreground">
                                                        {user.name}
                                                    </div>
                                                    <div className="text-xs font-medium text-muted-foreground">
                                                        {user.apellido}
                                                    </div>
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                {user.roles?.length ? (
                                                    <div className="flex flex-wrap gap-1">
                                                        {user.roles.slice(0, 2).map((r: any) => (
                                                            <span
                                                                key={r.id}
                                                                className="inline-flex items-center px-2 py-1 rounded text-xs bg-primary/10 text-primary font-medium"
                                                            >
                                                                {r.name}
                                                            </span>
                                                        ))}
                                                        {user.roles.length > 2 && (
                                                            <span className="inline-flex items-center px-2 py-1 rounded text-xs bg-muted text-muted-foreground">
                                                                +{user.roles.length - 2}
                                                            </span>
                                                        )}
                                                    </div>
                                                ) : (
                                                    <span className="text-muted-foreground text-sm">-</span>
                                                )}
                                            </TableCell>
                                            <TableCell className="text-muted-foreground">
                                                {user.ubicacion?.nombre || '-'}
                                            </TableCell>
                                            <TableCell className="text-muted-foreground">
                                                {user.area?.nombre || '-'}
                                            </TableCell>
                                            <TableCell>
                                                <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${user.estado === 'Activo'
                                                    ? 'bg-green-100 text-green-800 dark:bg-green-800/30 dark:text-green-400'
                                                    : user.estado === 'Inactivo'
                                                        ? 'bg-red-100 text-red-800 dark:bg-red-800/30 dark:text-red-400'
                                                        : 'bg-muted text-muted-foreground'
                                                    }`}>
                                                    {user.estado}
                                                </span>
                                            </TableCell>
                                            <TableCell className="text-muted-foreground">
                                                {user.turno || '-'}
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
                                                        <DropdownMenuItem onClick={() => handleView(user.id)}>
                                                            <Eye className="mr-2 h-4 w-4" />
                                                            <span>Ver detalles</span>
                                                        </DropdownMenuItem>
                                                        {canDo(user, 'u_usuario', 24, false) && (
                                                            <DropdownMenuItem onClick={() => handleEdit(user.id)}>
                                                                <Edit className="mr-2 h-4 w-4" />
                                                                <span>Editar usuario</span>
                                                            </DropdownMenuItem>
                                                        )}
                                                        {canDo(user, 'd_usuario', 480, false) && (
                                                            <DropdownMenuItem
                                                                onClick={() => handleDelete(user.id)}
                                                                className="text-destructive focus:text-destructive"
                                                            >
                                                                <Trash2 className="mr-2 h-4 w-4" />
                                                                <span>Eliminar usuario</span>
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
                    {users.data.length > 0 && (
                        <div className="border-t border-border px-4 py-3">
                            <TablePagination
                                pagination={users}
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
                        {users.total} usuarios registrados
                    </p>
                    <div>
                        {users.data.length > 0 && (
                            <div className="text-center">
                                <p className="text-sm text-muted-foreground">
                                    Mostrando <span className="font-medium text-foreground">{users.data.length}</span> de{' '}
                                    <span className="font-medium text-foreground">{users.total}</span> usuarios
                                </p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
