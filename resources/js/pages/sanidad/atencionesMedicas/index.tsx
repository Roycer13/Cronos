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
    Calendar,
    Edit,
    Eye,
    Filter,
    MoreHorizontal,
    Plus,
    Search,
    X,
    Activity,
    Trash2,
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
import { Badge } from '@/components/ui/badge';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Atenciones Médicas', href: '/sanidad/atenciones-medicas' },
];

interface PageProps {
    atenciones: {
        data: any[];
        links: any[];
        current_page: number;
        last_page: number;
        per_page: number;
        total: number;
    };
    filters: {
        search?: string;
        medico?: string;
        paciente?: string;
        estado_id?: string;
        policlinico_id?: string;
        fecha_desde?: string;
        fecha_hasta?: string;
        transferencia?: string;
        per_page?: string;
    };
    estados: { id: number; nombre: string }[];
    policlinicos: { id: number; nombre: string }[];
    medicos?: { id: number; nombre: string; apellido: string }[];
    pacientes?: { id: number; nombre: string; apellido: string }[];
    flash: {
        success?: string;
        error?: string;
    };
}

export default function Index() {
    const { props } = usePage();
    const [showFilters, setShowFilters] = useState(false);
    const { hasPermission } = useAuth();

    const {
        atenciones = {
            data: [],
            links: [],
            current_page: 1,
            last_page: 1,
            per_page: 10,
            total: 0,
        },
        filters: initialFilters = {},
        estados = [],
        policlinicos = [],
        medicos = [],
        pacientes = [],
        flash,
    } = props as unknown as PageProps;

    // Hook personalizado para filtros avanzados
    const { filters, updateFilter, resetFilters } = useAdvancedFilters({
        routeName: 'atenciones-medicas.index',
        initialFilters: {
            search: initialFilters.search || '',
            medico: initialFilters.medico || '',
            paciente: initialFilters.paciente || '',
            estado_id: initialFilters.estado_id?.toString() || undefined,
            policlinico_id: initialFilters.policlinico_id?.toString() || undefined,
            fecha_desde: initialFilters.fecha_desde || '',
            fecha_hasta: initialFilters.fecha_hasta || '',
            transferencia: initialFilters.transferencia || undefined,
            per_page: initialFilters.per_page?.toString() || '10',
        },
        debounceFields: ['search'],
        debounceDelay: 600,
    });

    const hasActiveFilters = Object.values(filters).some(
        (value) => value && value !== '' && value !== '10'
    );

    const handleEdit = (id: number) => {
        router.visit(route('atenciones-medicas.edit', id));
    };

    const handleView = (id: number) => {
        router.visit(route('atenciones-medicas.show', id));
    };

    const handleDelete = (id: number) => {
        if (confirm('¿Está seguro de eliminar esta atención médica? Se eliminarán también las reconsultas asociadas.')) {
            router.delete(route('atenciones-medicas.destroy', id), {
                preserveScroll: true,
            });
        }
    };

    // Función para obtener badge según el estado
    const getEstadoBadge = (estadoNombre: string) => {
        const colors: Record<string, string> = {
            'Pendiente': 'bg-yellow-100 text-yellow-800 dark:bg-yellow-800/30 dark:text-yellow-400',
            'En curso': 'bg-blue-100 text-blue-800 dark:bg-blue-800/30 dark:text-blue-400',
            'Finalizado': 'bg-green-100 text-green-800 dark:bg-green-800/30 dark:text-green-400',
            'Derivado': 'bg-purple-100 text-purple-800 dark:bg-purple-800/30 dark:text-purple-400',
        };
        return colors[estadoNombre] || 'bg-gray-100 text-gray-800 dark:bg-gray-800/30 dark:text-gray-400';
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Atenciones Médicas" />
            <div className="space-y-2 px-2 py-2 sm:px-6">
                <Toast />

                {/* Header con búsqueda y botones */}
                <div className="flex items-center justify-between">
                    <div className="relative max-w-md">
                        <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 transform text-muted-foreground" />
                        <Input
                            placeholder="Buscar por paciente, doctor, diagnóstico..."
                            value={filters.search}
                            onChange={(e) => updateFilter('search', e.target.value)}
                            className="pl-10"
                        />
                    </div>

                    <div className="flex items-center gap-2">
                        {hasPermission('c_sanidadAtencionMedica') && (
                            <Link href={route('atenciones-medicas.create')}>
                                <Button size="sm">
                                    <Plus className="h-4 w-4" />
                                    <span className="hidden md:block">Nueva Atención</span>
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

                        <div className="grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-5">
                            <FilterSelect
                                value={filters.medico}
                                onChange={(v) => updateFilter('medico', v)}
                                placeholder="Médico"
                                options={medicos.map((m) => ({
                                    value: m.id.toString(),
                                    label: `${m.nombre} ${m.apellido}`,
                                }))}
                            />

                            <FilterSelect
                                value={filters.paciente}
                                onChange={(v) => updateFilter('paciente', v)}
                                placeholder="Paciente"
                                options={pacientes.map((p) => ({
                                    value: p.id.toString(),
                                    label: `${p.nombre} ${p.apellido}`,
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
                                value={filters.policlinico_id}
                                onChange={(v) => updateFilter('policlinico_id', v)}
                                placeholder="Policlínico"
                                options={policlinicos.map((p) => ({
                                    value: p.id.toString(),
                                    label: p.nombre,
                                }))}
                            />

                            <FilterSelect
                                value={filters.transferencia}
                                onChange={(v) => updateFilter('transferencia', v)}
                                placeholder="Transferencia"
                                options={[
                                    { value: '1', label: 'Con transferencia' },
                                    { value: '0', label: 'Sin transferencia' },
                                ]}
                                includeAllOption={false}
                            />
                        </div>

                        <div className="mt-3 grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-5">
                            <Input
                                type="date"
                                placeholder="Fecha desde"
                                value={filters.fecha_desde}
                                onChange={(e) => updateFilter('fecha_desde', e.target.value)}
                                className="text-sm"
                            />
                            <Input
                                type="date"
                                placeholder="Fecha hasta"
                                value={filters.fecha_hasta}
                                onChange={(e) => updateFilter('fecha_hasta', e.target.value)}
                                className="text-sm"
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

                {/* Tabla de atenciones */}
                <div className="overflow-hidden rounded-lg border border-border bg-background shadow-sm">
                    <div className="overflow-x-auto">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    {[
                                        'Fecha',
                                        'Médico',
                                        'Paciente',
                                        'Motivo',
                                        'Estado',
                                        'Derivado',
                                        'Acciones',
                                    ].map((col, idx) => (
                                        <TableHead key={idx}>{col}</TableHead>
                                    ))}
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {atenciones.data.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={7} className="py-8 text-center text-muted-foreground">
                                            <div className="flex flex-col items-center justify-center">
                                                <Activity className="mb-3 h-12 w-12 text-muted-foreground/50" />
                                                <p className="mb-1 text-lg font-medium text-foreground">
                                                    No se encontraron atenciones
                                                </p>
                                                <p className="text-sm text-muted-foreground">
                                                    {hasActiveFilters
                                                        ? 'Intenta ajustar los filtros'
                                                        : 'No hay atenciones médicas registradas'}
                                                </p>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    atenciones.data.map((atencion) => (
                                        <TableRow key={atencion.id} className="hover:bg-muted/50">
                                            <TableCell>
                                                <div className="font-medium">
                                                    {new Date(atencion.fecha_atencion).toLocaleDateString('es-ES', {
                                                        day: '2-digit',
                                                        month: '2-digit',
                                                        year: 'numeric',
                                                    })}
                                                </div>
                                                <div className="text-xs text-muted-foreground">
                                                    {new Date(atencion.fecha_atencion).toLocaleTimeString('es-ES', {
                                                        hour: '2-digit',
                                                        minute: '2-digit',
                                                    })}
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <div className="font-medium">
                                                    {atencion.medico_user?.nombre} {atencion.medico_user?.apellido}
                                                </div>
                                                <div className="text-xs text-muted-foreground">
                                                    {atencion.medico_user?.profesion || 'Médico'}
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <div className="font-medium">
                                                    {atencion.paciente_user?.nombre} {atencion.paciente_user?.apellido}
                                                </div>
                                                <div className="text-xs text-muted-foreground">
                                                    {atencion.paciente_user?.codigo}
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <div className="max-w-[200px] truncate">
                                                    {atencion.motivo_consulta}
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <Badge className={getEstadoBadge(atencion.estado?.nombre)}>
                                                    {atencion.estado?.nombre}
                                                </Badge>
                                            </TableCell>
                                            <TableCell>
                                                {atencion.transferencia ? (
                                                    <Badge variant="outline" className="border-purple-500 text-purple-700 dark:text-purple-400">
                                                        {atencion.policlinico?.nombre || 'Derivado'}
                                                    </Badge>
                                                ) : (
                                                    <span className="text-muted-foreground text-sm">No</span>
                                                )}
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
                                                        <DropdownMenuItem onClick={() => handleView(atencion.id)}>
                                                            <Eye className="mr-2 h-4 w-4" />
                                                            <span>Ver detalles</span>
                                                        </DropdownMenuItem>
                                                        {hasPermission('u_sanidadAtencionMedica') && (
                                                            <DropdownMenuItem onClick={() => handleEdit(atencion.id)}>
                                                                <Edit className="mr-2 h-4 w-4" />
                                                                <span>Editar</span>
                                                            </DropdownMenuItem>
                                                        )}
                                                        {hasPermission('d_sanidadAtencionMedica') && (
                                                            <DropdownMenuItem
                                                                onClick={() => handleDelete(atencion.id)}
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
                    {atenciones.data.length > 0 && (
                        <div className="border-t border-border px-4 py-3">
                            <TablePagination
                                pagination={atenciones}
                                onPageChange={(page) =>
                                    router.get(
                                        route('atenciones-medicas.index'),
                                        { ...filters, page },
                                        { preserveState: true, replace: true }
                                    )
                                }
                            />
                        </div>
                    )}
                </div>

                {/* Resumen */}
                <div className="flex justify-between">
                    <p className="mt-1 text-sm text-muted-foreground">
                        {atenciones.total} atenciones registradas
                    </p>
                    {atenciones.data.length > 0 && (
                        <p className="mt-1 text-sm text-muted-foreground">
                            Mostrando {atenciones.data.length} de {atenciones.total}
                        </p>
                    )}
                </div>
            </div>
        </AppLayout>
    );
}