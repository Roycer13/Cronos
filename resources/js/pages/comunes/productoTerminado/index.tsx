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
    Edit,
    Eye,
    Filter,
    MoreHorizontal,
    Package,
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
    { title: 'Productos Terminados', href: '/productos-terminados' },
];

interface PageProps {
    productos: {
        data: any[];
        links: any[];
        current_page: number;
        last_page: number;
        per_page: number;
        total: number;
    };
    filters: {
        search?: string;
        codigo_sap?: string;
        codigo_interno?: string;
        ubicacion_id?: number;
        categoria_producto_id?: number;
        subcategoria_producto_id?: number;
        linea_id?: number;
        destino_id?: number;
        activos?: boolean;
        per_page?: number;
    };
    ubicaciones?: { id: number; nombre: string }[];
    categorias?: { id: number; nombre: string }[];
    subcategorias?: { id: number; nombre: string }[];
    lineas?: { id: number; nombre: string }[];
    destinos?: { id: number; nombre: string }[];
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

    // Destructuración de props con valores por defecto
    const {
        productos = {
            data: [],
            links: [],
            current_page: 1,
            last_page: 1,
            per_page: 10,
            total: 0,
        },
        filters: initialFilters = {},
        ubicaciones = [],
        categorias = [],
        subcategorias = [],
        lineas = [],
        destinos = [],
        flash,
    } = props as unknown as PageProps;

    // Hook personalizado para manejar filtros avanzados
    const { filters, updateFilter, resetFilters } = useAdvancedFilters({
        routeName: 'productos-terminados.index',
        initialFilters: {
            search: initialFilters.search || '',
            codigo_sap: initialFilters.codigo_sap || '',
            codigo_interno: initialFilters.codigo_interno || '',
            ubicacion_id: initialFilters.ubicacion_id?.toString() || undefined,
            categoria_producto_id:
                initialFilters.categoria_producto_id?.toString() || undefined,
            subcategoria_producto_id:
                initialFilters.subcategoria_producto_id?.toString() ||
                undefined,
            linea_id: initialFilters.linea_id?.toString() || undefined,
            destino_id: initialFilters.destino_id?.toString() || undefined,
            activos: initialFilters.activos ? '1' : undefined,
            per_page: initialFilters.per_page?.toString() || '10',
        },
        debounceFields: ['search', 'codigo_sap', 'codigo_interno'],
        debounceDelay: 600,
    });

    // Verificar si hay filtros activos para mostrar indicador
    const hasActiveFilters = Object.values(filters).some(
        (value) => value && value !== '' && value !== '10',
    );

    // Handlers para acciones
    const handleEdit = (id: number) => {
        router.visit(route('productos-terminados.edit', id));
    };

    const handleDelete = (id: number) => {
        if (confirm('¿Está seguro de eliminar este producto terminado?')) {
            router.delete(route('productos-terminados.destroy', id), {
                preserveScroll: true,
            });
        }
    };

    const handleView = (id: number) => {
        router.visit(route('productos-terminados.show', id));
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Productos Terminados" />
            <div className="space-y-2 px-2 py-2 sm:px-6">
                <Toast />

                {/* Header con búsqueda y botones */}
                <div className="flex items-center justify-between">
                    {/* Búsqueda rápida */}
                    <div className="relative max-w-md">
                        <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 transform text-muted-foreground" />
                        <Input
                            placeholder="Buscar por código, nombre..."
                            value={filters.search}
                            onChange={(e) =>
                                updateFilter('search', e.target.value)
                            }
                            className="pl-10"
                        />
                    </div>

                    {/* Botones de acción */}
                    <div className="flex items-center gap-2">
                        {hasPermission('c_productoTerminado') &&
                            belongsToUbicacion('Lácteos') && (
                                <Link
                                    href={route('productos-terminados.create')}
                                >
                                    <Button size="sm">
                                        <Plus className="h-4 w-4" />
                                        <p className="hidden md:block">
                                            Nuevo Producto
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
                            <Input
                                placeholder="Código SAP"
                                value={filters.codigo_sap}
                                onChange={(e) =>
                                    updateFilter('codigo_sap', e.target.value)
                                }
                                className="text-sm"
                            />

                            <Input
                                placeholder="Código Interno"
                                value={filters.codigo_interno}
                                onChange={(e) =>
                                    updateFilter(
                                        'codigo_interno',
                                        e.target.value,
                                    )
                                }
                                className="text-sm"
                            />

                            <FilterSelect
                                value={filters.ubicacion_id}
                                onChange={(v) =>
                                    updateFilter('ubicacion_id', v)
                                }
                                placeholder="Ubicación"
                                options={ubicaciones.map((p) => ({
                                    value: p.id.toString(),
                                    label: p.nombre,
                                }))}
                            />

                            <FilterSelect
                                value={filters.categoria_producto_id}
                                onChange={(v) =>
                                    updateFilter('categoria_producto_id', v)
                                }
                                placeholder="Categoría"
                                options={categorias.map((c) => ({
                                    value: c.id.toString(),
                                    label: c.nombre,
                                }))}
                            />

                            <FilterSelect
                                value={filters.subcategoria_producto_id}
                                onChange={(v) =>
                                    updateFilter('subcategoria_producto_id', v)
                                }
                                placeholder="Subcategoría"
                                options={subcategorias.map((s) => ({
                                    value: s.id.toString(),
                                    label: s.nombre,
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

                        {/* Segunda fila de filtros */}
                        <div className="mt-3 grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-6">
                            <FilterSelect
                                value={filters.linea_id}
                                onChange={(v) => updateFilter('linea_id', v)}
                                placeholder="Línea"
                                options={lineas.map((l) => ({
                                    value: l.id.toString(),
                                    label: l.nombre,
                                }))}
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
                                value={filters.activos}
                                onChange={(v) => updateFilter('activos', v)}
                                placeholder="Estado"
                                options={[
                                    { value: '1', label: 'Activos' },
                                    { value: '0', label: 'Inactivos' },
                                ]}
                                includeAllOption={false}
                            />
                        </div>
                    </div>
                )}

                {/* Tabla de productos */}
                <div className="overflow-hidden rounded-lg border border-border bg-background shadow-sm">
                    <div className="overflow-x-auto">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    {[
                                        'Código SAP',
                                        'Código Interno',
                                        'Nombre Comercial',
                                        'Ubicación',
                                        'Categoría',
                                        'Subcategoría',
                                        'Línea',
                                        'Destino',
                                        'Estado',
                                        '',
                                    ].map((col, idx) => (
                                        <TableHead key={idx}>{col}</TableHead>
                                    ))}
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {productos.data.length === 0 ? (
                                    <TableRow>
                                        <TableCell
                                            colSpan={10}
                                            className="py-8 text-center text-muted-foreground"
                                        >
                                            <div className="flex flex-col items-center justify-center">
                                                <Package className="mb-3 h-12 w-12 text-muted-foreground/50" />
                                                <p className="mb-1 text-lg font-medium text-foreground">
                                                    No se encontraron productos
                                                </p>
                                                <p className="text-sm text-muted-foreground">
                                                    {hasActiveFilters
                                                        ? 'Intenta ajustar los filtros para ver más resultados'
                                                        : 'No hay productos terminados registrados en el sistema'}
                                                </p>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    productos.data.map((producto) => (
                                        <TableRow
                                            key={producto.id}
                                            className="hover:bg-muted/50"
                                        >
                                            <TableCell>
                                                <span className="font-mono text-sm font-medium text-foreground">
                                                    {producto.codigo_sap}
                                                </span>
                                            </TableCell>
                                            <TableCell>
                                                <span className="font-mono text-sm font-medium text-foreground">
                                                    {producto.codigo_interno}
                                                </span>
                                            </TableCell>
                                            <TableCell>
                                                <div className="font-medium text-foreground">
                                                    {producto.nombre_comercial}
                                                </div>
                                                {producto.nombre_sap && (
                                                    <div className="text-xs text-muted-foreground">
                                                        {producto.nombre_sap}
                                                    </div>
                                                )}
                                            </TableCell>
                                            <TableCell className="text-muted-foreground">
                                                {producto.ubicacion?.nombre ||
                                                    '-'}
                                            </TableCell>
                                            <TableCell className="text-muted-foreground">
                                                {producto.categoria_producto
                                                    ?.nombre || '-'}
                                            </TableCell>
                                            <TableCell className="text-muted-foreground">
                                                {producto.subcategoria_producto
                                                    ?.nombre || '-'}
                                            </TableCell>
                                            <TableCell className="text-muted-foreground">
                                                {producto.linea?.nombre || '-'}
                                            </TableCell>
                                            <TableCell className="text-muted-foreground">
                                                {producto.destino?.nombre ||
                                                    '-'}
                                            </TableCell>
                                            <TableCell>
                                                <span
                                                    className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium ${
                                                        producto.estado
                                                            ?.nombre ===
                                                        'Activo'
                                                            ? 'bg-green-100 text-green-800 dark:bg-green-800/30 dark:text-green-400'
                                                            : 'bg-red-100 text-red-800 dark:bg-red-800/30 dark:text-red-400'
                                                    }`}
                                                >
                                                    {producto.estado?.nombre ||
                                                        'Inactivo'}
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
                                                        <DropdownMenuItem
                                                            onClick={() =>
                                                                handleView(
                                                                    producto.id,
                                                                )
                                                            }
                                                        >
                                                            <Eye className="mr-2 h-4 w-4" />
                                                            <span>
                                                                Ver detalles
                                                            </span>
                                                        </DropdownMenuItem>
                                                        {hasPermission(
                                                            'u_productoTerminado',
                                                        ) && (
                                                            <DropdownMenuItem
                                                                onClick={() =>
                                                                    handleEdit(
                                                                        producto.id,
                                                                    )
                                                                }
                                                            >
                                                                <Edit className="mr-2 h-4 w-4" />
                                                                <span>
                                                                    Editar
                                                                </span>
                                                            </DropdownMenuItem>
                                                        )}

                                                        {hasPermission(
                                                            'd_productoTerminado',
                                                        ) && (
                                                            <DropdownMenuItem
                                                                onClick={() =>
                                                                    handleDelete(
                                                                        producto.id,
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
                                    ))
                                )}
                            </TableBody>
                        </Table>
                    </div>

                    {/* Paginación */}
                    {productos.data.length > 0 && (
                        <div className="border-t border-border px-4 py-3">
                            <TablePagination
                                pagination={productos}
                                onPageChange={(page) =>
                                    router.get(
                                        route('productos-terminados.index'),
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
                        {productos.total} productos registrados
                    </p>
                    <div>
                        {productos.data.length > 0 && (
                            <div className="text-center">
                                <p className="text-sm text-muted-foreground">
                                    Mostrando{' '}
                                    <span className="font-medium text-foreground">
                                        {productos.data.length}
                                    </span>{' '}
                                    de{' '}
                                    <span className="font-medium text-foreground">
                                        {productos.total}
                                    </span>{' '}
                                    productos
                                </p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
