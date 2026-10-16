import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import FilterSelect from '@/components/ui/filter-select';
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
import { Head, router, usePage } from '@inertiajs/react';
import {
    Filter,
    Eye,
    MoreHorizontal,
    Pencil,
    Trash2,
    X,
    Plus,
    Building2,
} from 'lucide-react';
import { useState } from 'react';
import { route } from 'ziggy-js';

import {
    Dialog,
    DialogContent,
    DialogDescription,
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
import TablePagination from '@/components/ui/table-pagination';

// Definición de tipos
interface TipoAlmacen {
    id: number;
    nombre: string;
}

interface Responsable {
    id: number;
    name: string;
    apellido: string;
}

interface Almacen {
    id: number;
    nombre: string;
    ubicacion: string | null;
    tipo_almacen_id: number;
    observaciones: string | null;
    created_at: string;
    updated_at: string;
    responsables?: Responsable[];   // ← ahora es array
    tipo_almacen?: TipoAlmacen;
}

interface PageProps {
    almacenes: {
        data: Almacen[];
        links: any[];
        current_page: number;
        last_page: number;
        per_page: number;
        total: number;
    };
    filters: {
        tipo_almacen_id?: string;
        responsable_id?: string;
        search?: string;
        per_page?: string;
    };
    tipos_almacen: TipoAlmacen[];
    responsables: Responsable[];
    flash: {
        success?: string;
        error?: string;
    };
}

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Almacenes', href: '/canastillos/almacenes' },
];

export default function Index() {
    const { props } = usePage();
    const [deleteModalOpen, setDeleteModalOpen] = useState(false);
    const [almacenToDelete, setAlmacenToDelete] = useState<Almacen | null>(null);
    const [showFilters, setShowFilters] = useState(false);
    const { hasPermission } = useAuth();

    const {
        almacenes = {
            data: [],
            links: [],
            current_page: 1,
            last_page: 1,
            per_page: 10,
            total: 0,
        },
        filters: initialFilters = {},
        tipos_almacen = [],
        responsables = [],
        flash,
    } = props as unknown as PageProps;

    const { filters, updateFilter, resetFilters } = useAdvancedFilters({
        routeName: 'canastillos.almacenes.index',
        initialFilters: {
            tipo_almacen_id: initialFilters.tipo_almacen_id?.toString() || '',
            responsable_id: initialFilters.responsable_id?.toString() || '',
            search: initialFilters.search?.toString() || '',
            per_page: initialFilters.per_page?.toString() || '10',
        },
        debounceFields: ['search'],
        debounceDelay: 600,
    });

    const hasActiveFilters = Object.values(filters).some(
        (value) => value && value !== '' && value !== '10'
    );

    const handleEdit = (id: number) => {
        router.visit(route('canastillos.almacenes.edit', id));
    };

    const handleView = (id: number) => {
        router.visit(route('canastillos.almacenes.show', id));
    };

    const confirmDelete = (almacen: Almacen) => {
        setAlmacenToDelete(almacen);
        setDeleteModalOpen(true);
    };

    const handleDelete = () => {
        if (almacenToDelete) {
            router.delete(route('canastillos.almacenes.destroy', almacenToDelete.id), {
                preserveScroll: true,
                onSuccess: () => {
                    setDeleteModalOpen(false);
                    setAlmacenToDelete(null);
                },
            });
        }
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Almacenes" />
            <div className="space-y-2 px-2 py-2 sm:px-6">
                <Toast />

                {/* Header */}
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <h1 className="text-2xl font-bold text-foreground">
                        Gestión de Almacenes
                    </h1>

                    <div className="flex items-center gap-2">
                        {hasPermission('c_almacen') && (
                            <Button
                                onClick={() => router.visit(route('canastillos.almacenes.create'))}
                                size="sm"
                                className="flex items-center gap-2"
                            >
                                <Plus className="h-4 w-4" />
                                <span className="hidden md:block">Nuevo Almacén</span>
                            </Button>
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
                                value={filters.tipo_almacen_id}
                                onChange={(v) => updateFilter('tipo_almacen_id', v)}
                                placeholder="Todos los tipos"
                                options={tipos_almacen.map((t) => ({
                                    value: t.id.toString(),
                                    label: t.nombre,
                                }))}
                            />

                            <FilterSelect
                                value={filters.responsable_id}
                                onChange={(v) => updateFilter('responsable_id', v)}
                                placeholder="Todos los responsables"
                                options={responsables.map((r) => ({
                                    value: r.id.toString(),
                                    label: `${r.name} ${r.apellido}`,
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

                        {/* Campo de búsqueda por nombre/ubicación (opcional) */}
                        <div className="mt-3">
                            <input
                                type="text"
                                value={filters.search || ''}
                                onChange={(e) => updateFilter('search', e.target.value)}
                                placeholder="Buscar por nombre o ubicación..."
                                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                            />
                        </div>
                    </div>
                )}

                {/* Tabla */}
                <Card>
                    <div className="overflow-x-auto">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Nombre</TableHead>
                                    <TableHead>Ubicación</TableHead>
                                    <TableHead>Tipo</TableHead>
                                    <TableHead>Responsable(s)</TableHead>
                                    <TableHead>Observaciones</TableHead>
                                    <TableHead className="w-[100px]">Acciones</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {almacenes.data.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={6} className="py-8 text-center text-muted-foreground">
                                            <div className="flex flex-col items-center justify-center">
                                                <Building2 className="mb-3 h-12 w-12 text-muted-foreground/50" />
                                                <p className="mb-1 text-lg font-medium text-foreground">
                                                    No se encontraron almacenes
                                                </p>
                                                <p className="text-muted-foreground">
                                                    {hasActiveFilters
                                                        ? 'Intenta ajustar los filtros para ver más resultados'
                                                        : 'No hay almacenes registrados en el sistema'}
                                                </p>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    almacenes.data.map((almacen) => (
                                        <TableRow key={almacen.id} className="hover:bg-muted/50">
                                            <TableCell className="font-medium">{almacen.nombre}</TableCell>
                                            <TableCell>{almacen.ubicacion || '-'}</TableCell>
                                            <TableCell>
                                                {almacen.tipo_almacen?.nombre || '-'}
                                            </TableCell>
                                            <TableCell>
                                                {almacen.responsables && almacen.responsables.length > 0
                                                    ? almacen.responsables.map(r => `${r.name} ${r.apellido}`).join(', ')
                                                    : '-'}
                                            </TableCell>
                                            <TableCell className="max-w-xs truncate">
                                                {almacen.observaciones || '-'}
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
                                                        <DropdownMenuItem onClick={() => handleView(almacen.id)}>
                                                            <Eye className="mr-2 h-4 w-4" />
                                                            <span>Ver detalles</span>
                                                        </DropdownMenuItem>
                                                        {hasPermission('u_almacen') && (
                                                            <DropdownMenuItem onClick={() => handleEdit(almacen.id)}>
                                                                <Pencil className="mr-2 h-4 w-4" />
                                                                <span>Editar</span>
                                                            </DropdownMenuItem>
                                                        )}
                                                        {hasPermission('d_almacen') && (
                                                            <DropdownMenuItem
                                                                onClick={() => confirmDelete(almacen)}
                                                                className="text-destructive focus:text-destructive"
                                                            >
                                                                <Trash2 className="mr-2 h-4 w-4" />
                                                                <span>Eliminar</span>
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
                    {almacenes.data.length > 0 && (
                        <div className="border-t px-4 py-3">
                            <TablePagination
                                pagination={almacenes}
                                onPageChange={(page) =>
                                    router.get(
                                        route('canastillos.almacenes.index'),
                                        { ...filters, page },
                                        { preserveState: true, replace: true }
                                    )
                                }
                            />
                        </div>
                    )}
                </Card>

                {/* Información rápida */}
                <div className="flex items-center justify-between">
                    <p className="text-muted-foreground">
                        {almacenes.total} almacenes registrados
                    </p>
                    {almacenes.data.length > 0 && (
                        <p className="text-muted-foreground">
                            Mostrando {almacenes.data.length} de {almacenes.total} almacenes
                        </p>
                    )}
                </div>
            </div>

            {/* Modal de confirmación de eliminación */}
            <Dialog open={deleteModalOpen} onOpenChange={setDeleteModalOpen}>
                <DialogContent className="max-w-md">
                    <DialogHeader>
                        <DialogTitle>Confirmar eliminación</DialogTitle>
                        <DialogDescription>
                            ¿Está seguro de que desea eliminar el almacén "{almacenToDelete?.nombre}"?
                            Esta acción no se puede deshacer.
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setDeleteModalOpen(false)}>
                            Cancelar
                        </Button>
                        <Button variant="destructive" onClick={handleDelete}>
                            Eliminar
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </AppLayout>
    );
}
