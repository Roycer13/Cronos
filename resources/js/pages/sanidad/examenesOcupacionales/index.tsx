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
    Edit,
    Trash2,
    Filter,
    MoreHorizontal,
    Plus,
    Search,
    X,
    Calendar,
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
    { title: 'Exámenes Ocupacionales', href: '/sanidad/examenes-ocupacionales' },
];

interface PageProps {
    examenes: {
        data: any[];
        links: any[];
        current_page: number;
        last_page: number;
        per_page: number;
        total: number;
    };
    filters: {
        tipo_examen?: string;
        empleado_id?: string;
        medico_id?: string;
        fecha_desde?: string;
        fecha_hasta?: string;
        aptitud_ocupacional?: string;
        policlinico_id?: string;
        transferencia_requerida?: string;
        search?: string;
        per_page?: string;
    };
    empleados?: { id: number; nombre_completo: string }[];
    medicos?: { id: number; nombre_completo: string }[];
    policlinicos?: { id: number; nombre: string }[];
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
        examenes = { data: [], links: [], current_page: 1, last_page: 1, per_page: 10, total: 0 },
        filters: initialFilters = {},
        empleados = [],
        medicos = [],
        policlinicos = [],
        flash,
    } = props as unknown as PageProps;

    const { filters, updateFilter, resetFilters } = useAdvancedFilters({
        routeName: 'examenes-ocupacionales.index',
        initialFilters: {
            search: initialFilters.search || '',
            tipo_examen: initialFilters.tipo_examen || undefined,
            empleado_id: initialFilters.empleado_id || undefined,
            medico_id: initialFilters.medico_id || undefined,
            fecha_desde: initialFilters.fecha_desde || '',
            fecha_hasta: initialFilters.fecha_hasta || '',
            aptitud_ocupacional: initialFilters.aptitud_ocupacional || undefined,
            policlinico_id: initialFilters.policlinico_id || undefined,
            transferencia_requerida: initialFilters.transferencia_requerida || undefined,
            per_page: initialFilters.per_page || '10',
        },
        debounceFields: ['search'],
        debounceDelay: 600,
    });

    const hasActiveFilters = Object.values(filters).some(
        (value) => value && value !== '' && value !== '10'
    );

    const getAptitudBadge = (aptitud: string) => {
        const colors: Record<string, string> = {
            APTO: 'bg-green-100 text-green-800 dark:bg-green-800/30 dark:text-green-400',
            'APTO CON RESTRICCIONES': 'bg-yellow-100 text-yellow-800 dark:bg-yellow-800/30 dark:text-yellow-400',
            'NO APTO': 'bg-red-100 text-red-800 dark:bg-red-800/30 dark:text-red-400',
        };
        return colors[aptitud] || 'bg-gray-100 text-gray-800 dark:bg-gray-800/30 dark:text-gray-400';
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Exámenes Ocupacionales" />
            <div className="space-y-2 px-2 py-2 sm:px-6">
                <Toast />

                {/* Header con búsqueda y botones */}
                <div className="flex items-center justify-between">
                    <div className="relative max-w-md">
                        <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                        <Input
                            placeholder="Buscar por paciente, médico..."
                            value={filters.search}
                            onChange={(e) => updateFilter('search', e.target.value)}
                            className="pl-10"
                        />
                    </div>

                    <div className="flex items-center gap-2">
                        {hasPermission('c_sanidadExamenMedico') && (
                            <Link href={route('examenes-ocupacionales.create')}>
                                <Button size="sm">
                                    <Plus className="h-4 w-4" />
                                    <p className="hidden md:block">Nuevo Examen</p>
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
                            <h3 className="text-sm font-semibold">Filtros avanzados</h3>
                            {hasActiveFilters && (
                                <Button variant="ghost" size="sm" onClick={resetFilters}>
                                    <X className="mr-1 h-4 w-4" />
                                    Limpiar
                                </Button>
                            )}
                        </div>

                        <div className="grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-5">
                            <FilterSelect
                                value={filters.tipo_examen}
                                onChange={(v) => updateFilter('tipo_examen', v)}
                                placeholder="Tipo de examen"
                                options={[
                                    { value: 'PRE', label: 'Pre-ocupacional' },
                                    { value: 'POST', label: 'Post-ocupacional' },
                                    { value: 'OCUPACIONAL', label: 'Ocupacional periódico' },
                                ]}
                            />

                            <FilterSelect
                                value={filters.empleado_id}
                                onChange={(v) => updateFilter('empleado_id', v)}
                                placeholder="Empleado"
                                options={empleados.map((e) => ({
                                    value: e.id.toString(),
                                    label: e.nombre_completo,
                                }))}
                            />

                            <FilterSelect
                                value={filters.medico_id}
                                onChange={(v) => updateFilter('medico_id', v)}
                                placeholder="Médico"
                                options={medicos.map((m) => ({
                                    value: m.id.toString(),
                                    label: m.nombre_completo,
                                }))}
                            />

                            <Input
                                type="date"
                                placeholder="Fecha desde"
                                value={filters.fecha_desde}
                                onChange={(e) => updateFilter('fecha_desde', e.target.value)}
                            />

                            <Input
                                type="date"
                                placeholder="Fecha hasta"
                                value={filters.fecha_hasta}
                                onChange={(e) => updateFilter('fecha_hasta', e.target.value)}
                            />

                            <FilterSelect
                                value={filters.aptitud_ocupacional}
                                onChange={(v) => updateFilter('aptitud_ocupacional', v)}
                                placeholder="Aptitud"
                                options={[
                                    { value: 'APTO', label: 'Apto' },
                                    { value: 'APTO CON RESTRICCIONES', label: 'Apto con restricciones' },
                                    { value: 'NO APTO', label: 'No apto' },
                                ]}
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
                                value={filters.transferencia_requerida}
                                onChange={(v) => updateFilter('transferencia_requerida', v)}
                                placeholder="Transferencia"
                                options={[
                                    { value: '1', label: 'Requiere transferencia' },
                                    { value: '0', label: 'No requiere' },
                                ]}
                            />

                            <FilterSelect
                                value={filters.per_page}
                                onChange={(v) => updateFilter('per_page', v)}
                                placeholder="Por página"
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
                <div className="overflow-hidden rounded-lg border border-border bg-background shadow-sm">
                    <div className="overflow-x-auto">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>ID</TableHead>
                                    <TableHead>Tipo</TableHead>
                                    <TableHead>Fecha</TableHead>
                                    <TableHead>Empleado</TableHead>
                                    <TableHead>Médico</TableHead>
                                    <TableHead>Aptitud</TableHead>
                                    <TableHead>Transferencia</TableHead>
                                    <TableHead className="text-right">Acciones</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {examenes.data.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={8} className="py-8 text-center text-muted-foreground">
                                            No se encontraron exámenes ocupacionales.
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    examenes.data.map((examen) => (
                                        <TableRow key={examen.id} className="hover:bg-muted/50">
                                            <TableCell className="font-mono text-sm">{examen.id}</TableCell>
                                            <TableCell>
                                                <Badge variant="outline">
                                                    {examen.tipo_examen === 'PRE' ? 'Pre' : examen.tipo_examen === 'POST' ? 'Post' : 'Ocupacional'}
                                                </Badge>
                                            </TableCell>
                                            <TableCell>{new Date(examen.fecha_examen).toLocaleDateString()}</TableCell>
                                            <TableCell>
                                                <div className="font-medium">
                                                    {examen.empleado?.nombre} {examen.empleado?.apellido}
                                                </div>
                                                <div className="text-xs text-muted-foreground">{examen.empleado?.codigo}</div>
                                            </TableCell>
                                            <TableCell>
                                                {examen.medico?.nombre} {examen.medico?.apellido}
                                            </TableCell>
                                            <TableCell>
                                                {examen.aptitud_ocupacional ? (
                                                    <span className={getAptitudBadge(examen.aptitud_ocupacional)}>
                                                        {examen.aptitud_ocupacional}
                                                    </span>
                                                ) : '-'}
                                            </TableCell>
                                            <TableCell>
                                                {examen.transferencia_requerida ? (
                                                    <Badge variant="destructive">Sí</Badge>
                                                ) : (
                                                    <Badge variant="secondary">No</Badge>
                                                )}
                                            </TableCell>
                                            <TableCell className="text-right">
                                                <DropdownMenu>
                                                    <DropdownMenuTrigger asChild>
                                                        <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                                                            <MoreHorizontal className="h-4 w-4" />
                                                        </Button>
                                                    </DropdownMenuTrigger>
                                                    <DropdownMenuContent align="end">
                                                        <DropdownMenuItem onClick={() => router.visit(route('examenes-ocupacionales.show', examen.id))}>
                                                            <Eye className="mr-2 h-4 w-4" />
                                                            Ver detalles
                                                        </DropdownMenuItem>
                                                        {hasPermission('u_sanidadExamenMedico') && (
                                                            <DropdownMenuItem onClick={() => router.visit(route('examenes-ocupacionales.edit', examen.id))}>
                                                                <Edit className="mr-2 h-4 w-4" />
                                                                Editar
                                                            </DropdownMenuItem>
                                                        )}
                                                        {hasPermission('d_sanidadExamenMedico') && (
                                                            <DropdownMenuItem
                                                                onClick={() => {
                                                                    if (confirm('¿Eliminar este examen?')) {
                                                                        router.delete(route('examenes-ocupacionales.destroy', examen.id));
                                                                    }
                                                                }}
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
                    </div>

                    {examenes.data.length > 0 && (
                        <div className="border-t border-border px-4 py-3">
                            <TablePagination
                                pagination={examenes}
                                onPageChange={(page) =>
                                    router.get(
                                        route('examenes-ocupacionales.index'),
                                        { ...filters, page },
                                        { preserveState: true, replace: true }
                                    )
                                }
                            />
                        </div>
                    )}
                </div>

                <div className="flex justify-between">
                    <p className="text-sm text-muted-foreground">{examenes.total} exámenes registrados</p>
                    {examenes.data.length > 0 && (
                        <p className="text-sm text-muted-foreground">
                            Mostrando {examenes.data.length} de {examenes.total} exámenes
                        </p>
                    )}
                </div>
            </div>
        </AppLayout>
    );
}