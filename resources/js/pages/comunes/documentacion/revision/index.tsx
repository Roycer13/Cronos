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
import { Plus, Search, Filter, X, MoreHorizontal, Eye, Clock, AlertTriangle, Calendar, FileText, User } from 'lucide-react';
import { route } from 'ziggy-js';
import { useState } from 'react';

import TablePagination from '@/components/ui/table-pagination';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Badge } from '@/components/ui/badge';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Revisiones Programadas', href: route('revisiones.index') },
];

interface PageProps {
    revisiones: {
        data: Array<{
            id: number;
            documento: {
                id: number;
                codigo: string;
                titulo: string;
                estado: { nombre: string };
            };
            fecha_evaluacion: string | null;
            proxima_fecha_revision: string;
            decision: string | null;
            responsable_revision: { id: number; name: string };
            analisis_vigencia: string | null;
            evaluacion_efectividad: string | null;
            created_at: string;
        }>;
        links: any[];
        current_page: number;
        last_page: number;
        per_page: number;
        total: number;
    };
    filters: {
        search?: string;
        decision?: string;
        estado?: string;
        per_page?: number;
    };
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
        user: authUser,
    } = useAuth();

    const {
        revisiones = {
            data: [],
            links: [],
            current_page: 1,
            last_page: 1,
            per_page: 10,
            total: 0,
        },
        filters: initialFilters = {},
        flash,
    } = props as unknown as PageProps;

    const { filters, updateFilter, resetFilters } = useAdvancedFilters({
        routeName: 'revisiones.index',
        initialFilters: {
            search: initialFilters.search || '',
            decision: initialFilters.decision || '',
            estado: initialFilters.estado || '',
            per_page: initialFilters.per_page?.toString() || '10',
        },
        debounceFields: ['search'],
        debounceDelay: 600,
    });

    const hasActiveFilters = Object.values(filters).some(
        (value) => value && value !== '' && value !== '10'
    );

    const handleView = (id: number) => {
        router.visit(route('revisiones.show', id));
    };

    const handleCompletar = (id: number) => {
        router.visit(route('revisiones.edit', id));
    };

    const formatFecha = (fecha: string) => {
        return new Date(fecha).toLocaleDateString('es-ES', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
        });
    };

    const getDecisionColor = (decision: string | null) => {
        const colors: Record<string, string> = {
            mantener: 'bg-green-100 text-green-800 dark:bg-green-800/30 dark:text-green-400',
            modificar: 'bg-blue-100 text-blue-800 dark:bg-blue-800/30 dark:text-blue-400',
            obsoleto: 'bg-red-100 text-red-800 dark:bg-red-800/30 dark:text-red-400',
        };
        return decision ? (colors[decision] || 'bg-gray-100 text-gray-800 dark:bg-gray-800/30 dark:text-gray-400') : '';
    };

    const getEstadoRevision = (proximaFecha: string, fechaEvaluacion: string | null) => {
        const hoy = new Date();
        const fechaProxima = new Date(proximaFecha);
        
        if (fechaEvaluacion) return 'completada';
        if (fechaProxima < hoy) return 'vencida';
        if ((fechaProxima.getTime() - hoy.getTime()) / (1000 * 60 * 60 * 24) <= 7) return 'proxima';
        return 'pendiente';
    };

    const getEstadoColor = (estado: string) => {
        const colors: Record<string, string> = {
            completada: 'bg-green-100 text-green-800 dark:bg-green-800/30 dark:text-green-400',
            vencida: 'bg-red-100 text-red-800 dark:bg-red-800/30 dark:text-red-400',
            proxima: 'bg-orange-100 text-orange-800 dark:bg-orange-800/30 dark:text-orange-400',
            pendiente: 'bg-blue-100 text-blue-800 dark:bg-blue-800/30 dark:text-blue-400',
        };
        return colors[estado] || 'bg-gray-100 text-gray-800 dark:bg-gray-800/30 dark:text-gray-400';
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Revisiones Programadas" />
            <div className="px-2 sm:px-6 py-2 space-y-2">
                <Toast />
                
                {/* Header */}
                <div className="flex items-center justify-between">
                    {/* Búsqueda rápida */}
                    <div className="relative max-w-md">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                            placeholder="Buscar por código, título..."
                            value={filters.search || ''}
                            onChange={(e) => updateFilter('search', e.target.value)}
                            className="pl-10"
                        />
                    </div>
                    <div className="flex items-center gap-2">
                        {hasPermission('crear-revisiones') && (
                            <Link href={route('revisiones.create')}>
                                <Button size="sm">
                                    <Plus className="h-4 w-4" />
                                    <p className='hidden md:block'>Programar Revisión</p>
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

                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                            <FilterSelect
                                value={filters.decision}
                                onChange={(v) => updateFilter('decision', v)}
                                placeholder="Todas las decisiones"
                                options={[
                                    { value: 'mantener', label: 'Mantener' },
                                    { value: 'modificar', label: 'Modificar' },
                                    { value: 'obsoleto', label: 'Obsoleto' },
                                ]}
                            />

                            <FilterSelect
                                value={filters.estado}
                                onChange={(v) => updateFilter('estado', v)}
                                placeholder="Todos los estados"
                                options={[
                                    { value: 'pendiente', label: 'Pendiente' },
                                    { value: 'proxima', label: 'Próxima' },
                                    { value: 'vencida', label: 'Vencida' },
                                    { value: 'completada', label: 'Completada' },
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

                {/* Tabla de Revisiones */}
                <div className="bg-background rounded-lg border border-border shadow-sm overflow-hidden">
                    <div className="overflow-x-auto">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    {[
                                        'Documento',
                                        'Próxima Revisión',
                                        'Estado',
                                        'Responsable',
                                        'Decisión',
                                        'Última Evaluación',
                                        'Acciones',
                                    ].map((col, idx) => (
                                        <TableHead key={idx}>{col}</TableHead>
                                    ))}
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {revisiones.data.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                                            <div className="flex flex-col items-center justify-center">
                                                <Calendar className="h-12 w-12 text-muted-foreground/50 mb-3" />
                                                <p className="text-lg font-medium text-foreground mb-1">
                                                    No se encontraron revisiones programadas
                                                </p>
                                                <p className="text-sm text-muted-foreground">
                                                    {hasActiveFilters
                                                        ? "Intenta ajustar los filtros para ver más resultados"
                                                        : "No hay revisiones programadas en el sistema"
                                                    }
                                                </p>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    revisiones.data.map((revision) => {
                                        const estadoRevision = getEstadoRevision(
                                            revision.proxima_fecha_revision,
                                            revision.fecha_evaluacion
                                        );
                                        
                                        return (
                                            <TableRow key={revision.id} className="hover:bg-muted/50">
                                                <TableCell>
                                                    <div className="flex items-center gap-2">
                                                        <FileText className="h-4 w-4 text-muted-foreground" />
                                                        <div>
                                                            <div className="font-medium text-foreground">
                                                                {revision.documento.codigo}
                                                            </div>
                                                            <div className="text-xs text-muted-foreground line-clamp-1">
                                                                {revision.documento.titulo}
                                                            </div>
                                                        </div>
                                                    </div>
                                                </TableCell>
                                                <TableCell>
                                                    <div className="flex items-center gap-2">
                                                        <Calendar className="h-4 w-4 text-muted-foreground" />
                                                        <span className="font-medium">
                                                            {formatFecha(revision.proxima_fecha_revision)}
                                                        </span>
                                                        {estadoRevision === 'vencida' && (
                                                            <AlertTriangle className="h-4 w-4 text-destructive" />
                                                        )}
                                                    </div>
                                                </TableCell>
                                                <TableCell>
                                                    <Badge className={getEstadoColor(estadoRevision)}>
                                                        {estadoRevision === 'completada' ? 'Completada' :
                                                         estadoRevision === 'vencida' ? 'Vencida' :
                                                         estadoRevision === 'proxima' ? 'Próxima a vencer' : 'Pendiente'}
                                                    </Badge>
                                                </TableCell>
                                                <TableCell>
                                                    <div className="flex items-center gap-2">
                                                        <User className="h-4 w-4 text-muted-foreground" />
                                                        <span>{revision.responsable_revision.name}</span>
                                                    </div>
                                                </TableCell>
                                                <TableCell>
                                                    {revision.decision ? (
                                                        <Badge className={getDecisionColor(revision.decision)}>
                                                            {revision.decision}
                                                        </Badge>
                                                    ) : (
                                                        <span className="text-sm text-muted-foreground">Pendiente</span>
                                                    )}
                                                </TableCell>
                                                <TableCell>
                                                    {revision.fecha_evaluacion ? (
                                                        <div className="flex items-center gap-2">
                                                            <Clock className="h-4 w-4 text-muted-foreground" />
                                                            <span>{formatFecha(revision.fecha_evaluacion)}</span>
                                                        </div>
                                                    ) : (
                                                        <span className="text-sm text-muted-foreground">No evaluada</span>
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
                                                            <DropdownMenuItem onClick={() => handleView(revision.id)}>
                                                                <Eye className="mr-2 h-4 w-4" />
                                                                <span>Ver detalles</span>
                                                            </DropdownMenuItem>
                                                            {hasPermission('completar-revisiones') && !revision.fecha_evaluacion && (
                                                                <DropdownMenuItem onClick={() => handleCompletar(revision.id)}>
                                                                    <Clock className="mr-2 h-4 w-4" />
                                                                    <span>Completar Revisión</span>
                                                                </DropdownMenuItem>
                                                            )}
                                                        </DropdownMenuContent>
                                                    </DropdownMenu>
                                                </TableCell>
                                            </TableRow>
                                        );
                                    })
                                )}
                            </TableBody>
                        </Table>
                    </div>

                    {/* Paginación */}
                    {revisiones.data.length > 0 && (
                        <div className="border-t border-border px-4 py-3">
                            <TablePagination
                                pagination={revisiones}
                                onPageChange={(page) =>
                                    router.get(
                                        route('revisiones.index'),
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
                        {revisiones.total} revisiones programadas
                    </p>
                    <div>
                        {revisiones.data.length > 0 && (
                            <div className="text-center">
                                <p className="text-sm text-muted-foreground">
                                    Mostrando <span className="font-medium text-foreground">{revisiones.data.length}</span> de{' '}
                                    <span className="font-medium text-foreground">{revisiones.total}</span> revisiones
                                </p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}