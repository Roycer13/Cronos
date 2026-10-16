import { Button } from '@/components/ui/button';
import Fecha from '@/components/ui/fecha';
import FilterInput from '@/components/ui/filter-input';
import FilterSelect from '@/components/ui/filter-select';
import { Input } from '@/components/ui/input';

import {
    Dialog,
    DialogContent,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';

import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from '@/components/ui/tooltip';

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
import { useInitials } from '@/hooks/use-initials';
import { useAuth } from '@/hooks/useAuth';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, Link, router, usePage } from '@inertiajs/react';
import {
    Eye,
    Filter,
    MoreHorizontal,
    Pencil,
    Plus,
    Search,
    Trash,
    X,
    Clock,
    FlaskConical,
    TrendingUp,
} from 'lucide-react';

import { useState } from 'react';
import { route } from 'ziggy-js';
import { PDFViewer } from '@react-pdf/renderer';
import ReporteControlFisico from '@/pdf/ReporteControlFisico';

import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import TablePagination from '@/components/ui/table-pagination';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Control Fisicoquímico Organoléptico', href: '#' },
];

interface PageProps {
    registros: {
        data: any[];
        links: any[];
        current_page: number;
        last_page: number;
        per_page: number;
        total: number;
    };
    filters: {
        search?: string;
        user_id?: string;
        fecha_inicio?: string;
        fecha_fin?: string;
        per_page?: number;
    };
    usuarios: { id: number; name: string; apellido: string }[];
    flash: {
        success?: string;
        error?: string;
    };
}

export default function Index() {
    const { props } = usePage<PageProps>();
    const [showFilters, setShowFilters] = useState(false);

    const { hasPermission, user: authUser } = useAuth();
    const getInitials = useInitials();

    // Estados para modales
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [createForm, setCreateForm] = useState<any>(null);
    const [editingId, setEditingId] = useState<number | null>(null);
    const [editForm, setEditForm] = useState<any>(null);
    const [submitting, setSubmitting] = useState(false);
    const [viewingId, setViewingId] = useState<number | null>(null);
    const [viewData, setViewData] = useState<any>(null);

    // Extraer datos de props con valores por defecto seguros
    const registros = props.registros || { data: [], links: [], current_page: 1, last_page: 1, per_page: 10, total: 0 };
    const initialFilters = props.filters || {};
    const usuarios = props.usuarios || [];
    const flash = props.flash || {};

    const { filters, updateFilter, resetFilters } = useAdvancedFilters({
        routeName: 'control-fisicoquimico-organoleptico.index',
        initialFilters: {
            search: initialFilters.search || '',
            user_id: initialFilters.user_id?.toString() || '',
            fecha_inicio: initialFilters.fecha_inicio || '',
            fecha_fin: initialFilters.fecha_fin || '',
            per_page: initialFilters.per_page?.toString() || '10',
        },
        debounceFields: ['search'],
        debounceDelay: 600,
    });

    const hasActiveFilters = Object.values(filters).some(
        (v) => v && v !== '' && v !== '10',
    );

    // Estado y funciones para generar PDF por rango de fechas
    const [fechaDesdeReporte, setFechaDesdeReporte] = useState('');
    const [fechaHastaReporte, setFechaHastaReporte] = useState('');
    const [datosPdf, setDatosPdf] = useState<any[]>([]);
    const [usuariosPdf, setUsuariosPdf] = useState<any[]>([]);
    const [mostrarPdf, setMostrarPdf] = useState(false);
    const [generandoPdf, setGenerandoPdf] = useState(false);

    const handleGenerarPdf = async () => {
        if (!fechaDesdeReporte || !fechaHastaReporte) {
            alert('Seleccione Fecha Desde y Fecha Hasta para el reporte');
            return;
        }
        setGenerandoPdf(true);
        try {
            const params = new URLSearchParams();
            params.append('fecha_desde', fechaDesdeReporte);
            params.append('fecha_hasta', fechaHastaReporte);

            const res = await fetch(route('control-fisicoquimico-organoleptico.pdf') + '?' + params.toString());
            if (!res.ok) throw new Error(await res.text());
            const json = await res.json();
            const registros = json.registros || json.data || [];
            if (!Array.isArray(registros) || registros.length === 0) {
                alert('No hay registros para el rango seleccionado');
                return;
            }
            setDatosPdf(registros);
            setUsuariosPdf(json.usuarios_involucrados || []);
            setMostrarPdf(true);
        } catch (e) {
            console.error(e);
            alert('Error generando el reporte');
        } finally {
            setGenerandoPdf(false);
        }
    };

    // Funciones del modal de creación
    const getDefaultPayload = () => {
        const now = new Date();
        const offset = now.getTimezoneOffset();
        const localDate = new Date(now.getTime() - offset * 60 * 1000);

        return {
            tiempo: localDate.toISOString().slice(0, 16),
            ph_pozo: '',
            dureza_pozo: '',
            conductividad_pozo: '',
            ph_etap: '',
            dureza_etap: '',
            cloruros_etap: '',
            conductividad_etap: '',
            color: 'normal',
            olor: 'normal',
            sabor: 'normal',
            aspecto: 'normal',
            color_etap: 'normal',
            olor_etap: 'normal',
            sabor_etap: 'normal',
            aspecto_etap: 'normal',
            observaciones: '',
        };
    };

    const openCreateModal = () => {
        setCreateForm(getDefaultPayload());
        setShowCreateModal(true);
    };

    const closeCreateModal = () => {
        setShowCreateModal(false);
        setCreateForm(null);
        setSubmitting(false);
    };

    const submitCreate = (e: React.FormEvent) => {
        e.preventDefault();
        setSubmitting(true);
        router.post(route('control-fisicoquimico-organoleptico.store'), createForm, {
            onFinish: () => {
                setSubmitting(false);
                closeCreateModal();
            },
        });
    };

    // Funciones del modal de edición
    const openEditModal = (item: any) => {
        setEditingId(item.id);
        setEditForm({
            tiempo: item.tiempo ? item.tiempo.slice(0, 16) : '',
            ph_pozo: item.ph_pozo ?? '',
            dureza_pozo: item.dureza_pozo ?? '',
            conductividad_pozo: item.conductividad_pozo ?? '',
            ph_etap: item.ph_etap ?? '',
            dureza_etap: item.dureza_etap ?? '',
            cloruros_etap: item.cloruros_etap ?? '',
            conductividad_etap: item.conductividad_etap ?? '',
            color: item.color ?? 'normal',
            olor: item.olor ?? 'normal',
            sabor: item.sabor ?? 'normal',
            aspecto: item.aspecto ?? 'normal',
            color_etap: item.color_etap ?? 'normal',
            olor_etap: item.olor_etap ?? 'normal',
            sabor_etap: item.sabor_etap ?? 'normal',
            aspecto_etap: item.aspecto_etap ?? 'normal',
            observaciones: item.observaciones ?? '',
        });
    };

    const closeEditModal = () => {
        setEditingId(null);
        setEditForm(null);
        setSubmitting(false);
    };

    const submitEdit = (e: React.FormEvent) => {
        e.preventDefault();
        setSubmitting(true);
        router.put(route('control-fisicoquimico-organoleptico.update', editingId), editForm, {
            onFinish: () => {
                setSubmitting(false);
                closeEditModal();
            },
        });
    };

    // Funciones de visualización
    const openViewModal = (item: any) => {
        setViewingId(item.id);
        setViewData(item);
    };

    const closeViewModal = () => {
        setViewingId(null);
        setViewData(null);
    };

    // Eliminar registro
    const handleDelete = (id: number) => {
        if (confirm('¿Está seguro de eliminar este registro?')) {
            router.delete(route('control-fisicoquimico-organoleptico.destroy', id), {
                preserveScroll: true,
            });
        }
    };

    // Formateadores
    const formatDateTime = (value: string | null | undefined) => {
        if (!value) return '-';
        const str = String(value).trim();
        const normalized = str.replace('T', ' ');
        return normalized.substring(0, 16);
    };

    const formatDecimal = (value: number | string | null | undefined) => {
        if (value === null || value === undefined || value === '') return '-';
        const n = Number(value);
        if (Number.isNaN(n)) return String(value);
        return n.toFixed(2).replace(/\.0+$|(?<=\.[0-9]*?)0+$/g, '');
    };

    const formatBooleanLabel = (value: string | boolean | null | undefined) => {
        if (value === null || value === undefined || value === '') return '-';

        if (value === true || value === 'true') return 'C.';
        if (value === false || value === 'false') return 'N.C.';

        const normalized = String(value).trim().toLowerCase();
        if (normalized === 'normal' || normalized === 'cumple') return 'C.';
        if (normalized === 'anormal' || normalized === 'no cumple' || normalized === 'no_cumple' || normalized === 'n.c.' || normalized === 'nc') return 'N.C.';

        return String(value);
    };

    const getStatusBadge = (value: string) => {
        const colors: Record<string, string> = {
            normal: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
            ligero: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400',
            medio: 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400',
            fuerte: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
            anormal: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
        };
        return colors[value] || 'bg-gray-100 text-gray-700 dark:bg-gray-800/50 dark:text-gray-400';
    };

    // Verificar si hay datos
    const hasData = registros.data && registros.data.length > 0;

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Control Fisicoquímico Organoléptico" />
            <div className="space-y-2 px-2 py-2 sm:px-6">
                <Toast />

                {/* Header */}
                <div className="flex items-center justify-between">
                    <div className="relative max-w-md">
                        <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                        <Input
                            placeholder="Buscar por usuario, observaciones..."
                            value={filters.search}
                            onChange={(e) => updateFilter('search', e.target.value)}
                            className="pl-10"
                        />
                    </div>

                    <div className="flex gap-2">
                        {hasPermission('c_controlFisicoquimicoOrganoleptico') && (
                            <Button size="sm" onClick={openCreateModal}>
                                <Plus className="h-4 w-4" />
                                <p className="hidden md:block">Nuevo registro</p>
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

                {/* Filtros */}
                {showFilters && (
                    <div className="rounded-lg border border-border bg-muted/50 p-2">
                        <div className="mb-3 flex justify-between">
                            <h3 className="text-sm font-semibold">Filtros avanzados</h3>
                            {hasActiveFilters && (
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={resetFilters}
                                    className="text-xs"
                                >
                                    <X className="mr-1 h-4 w-4" />
                                    Limpiar
                                </Button>
                            )}
                        </div>

                        <div className="grid grid-cols-2 gap-3 md:grid-cols-4 lg:grid-cols-6">
                            <FilterInput
                                value={filters.fecha_inicio}
                                onChange={(v) => updateFilter('fecha_inicio', v)}
                                placeholder="Fecha inicio"
                                type="date"
                            />
                            <FilterInput
                                value={filters.fecha_fin}
                                onChange={(v) => updateFilter('fecha_fin', v)}
                                placeholder="Fecha fin"
                                type="date"
                            />
                            <FilterSelect
                                value={filters.user_id}
                                onChange={(v) => updateFilter('user_id', v)}
                                placeholder="Registrado por"
                                options={usuarios.map((u) => ({
                                    value: u.id.toString(),
                                    label: `${u.name} ${u.apellido || ''}`.trim(),
                                }))}
                            />
                            <FilterSelect
                                value={filters.per_page}
                                onChange={(v) => updateFilter('per_page', v)}
                                placeholder="Resultados"
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
                <div className="overflow-hidden rounded-lg border bg-background shadow-sm">
                    <div className="overflow-x-auto">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Tiempo</TableHead>
                                    <TableHead>Registrado por</TableHead>
                                    <TableHead>pH Pozo</TableHead>
                                    <TableHead>Dureza Pozo</TableHead>
                                    <TableHead>Cond. Pozo</TableHead>
                                    <TableHead>pH Etap</TableHead>
                                    <TableHead>Dureza Etap</TableHead>
                                    <TableHead>Cloruros Etap</TableHead>
                                    <TableHead>Cond. Etap</TableHead>
                                    <TableHead>Color</TableHead>
                                    <TableHead>Olor</TableHead>
                                    <TableHead>Sabor</TableHead>
                                    <TableHead>Aspecto</TableHead>
                                    <TableHead>Color Etap</TableHead>
                                    <TableHead>Olor Etap</TableHead>
                                    <TableHead>Sabor Etap</TableHead>
                                    <TableHead>Aspecto Etap</TableHead>
                                    <TableHead>Obs.</TableHead>
                                    <TableHead></TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {!hasData ? (
                                    <TableRow>
                                        <TableCell colSpan={19} className="py-8 text-center">
                                            <div className="flex flex-col items-center justify-center">
                                                <FlaskConical className="mb-3 h-12 w-12 text-muted-foreground/50" />
                                                <p className="mb-1 text-base font-medium text-foreground">
                                                    No se encontraron registros
                                                </p>
                                                <p className="text-sm text-muted-foreground">
                                                    {hasActiveFilters
                                                        ? 'Intenta ajustar los filtros para ver más resultados'
                                                        : 'No hay registros de control fisicoquímico en el sistema'}
                                                </p>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    registros.data.map((item) => (
                                        <TableRow key={item.id} className="hover:bg-muted/50">
                                            <TableCell>
                                                <div className="flex items-center gap-1">
                                                    <Clock className="h-3 w-3 text-muted-foreground" />
                                                    <span className="text-sm">
                                                        {formatDateTime(item.tiempo)}
                                                    </span>
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <TooltipProvider>
                                                    <Tooltip>
                                                        <TooltipTrigger asChild>
                                                            <div>
                                                                <div className="font-medium text-foreground">
                                                                    {item.usuario?.codigo || '-'}
                                                                </div>
                                                                <div className="text-xs font-medium text-muted-foreground">
                                                                    {item.usuario ? `${item.usuario.name} ${item.usuario.apellido || ''}`.trim() : ''}
                                                                </div>
                                                            </div>
                                                        </TooltipTrigger>
                                                        <TooltipContent>
                                                            <p>
                                                                {item.usuario?.codigo || '-'} - {item.usuario?.name || '-'} {item.usuario?.apellido || ''}
                                                            </p>
                                                        </TooltipContent>
                                                    </Tooltip>
                                                </TooltipProvider>
                                            </TableCell>
                                            <TableCell>{formatDecimal(item.ph_pozo)}</TableCell>
                                            <TableCell>{formatDecimal(item.dureza_pozo)}</TableCell>
                                            <TableCell>{formatDecimal(item.conductividad_pozo)}</TableCell>
                                            <TableCell>{formatDecimal(item.ph_etap)}</TableCell>
                                            <TableCell>{formatDecimal(item.dureza_etap)}</TableCell>
                                            <TableCell>{formatDecimal(item.cloruros_etap)}</TableCell>
                                            <TableCell>{formatDecimal(item.conductividad_etap)}</TableCell>
                                            <TableCell>
                                                <span className={`rounded-full px-2 py-1 text-xs font-medium ${getStatusBadge(item.color || 'normal')}`}>
                                                    {formatBooleanLabel(item.color || 'normal')}
                                                </span>
                                            </TableCell>
                                            <TableCell>{formatBooleanLabel(item.olor)}</TableCell>
                                            <TableCell>{formatBooleanLabel(item.sabor)}</TableCell>
                                            <TableCell>{formatBooleanLabel(item.aspecto)}</TableCell>
                                            <TableCell>
                                                <span className={`rounded-full px-2 py-1 text-xs font-medium ${getStatusBadge(item.color_etap || 'normal')}`}>
                                                    {formatBooleanLabel(item.color_etap || 'normal')}
                                                </span>
                                            </TableCell>
                                            <TableCell>{formatBooleanLabel(item.olor_etap)}</TableCell>
                                            <TableCell>{formatBooleanLabel(item.sabor_etap)}</TableCell>
                                            <TableCell>{formatBooleanLabel(item.aspecto_etap)}</TableCell>
                                            <TableCell>
                                                {item.observaciones ? (
                                                    <TooltipProvider>
                                                        <Tooltip>
                                                            <TooltipTrigger asChild>
                                                                <span className="cursor-help text-xs">
                                                                    {item.observaciones.length > 20
                                                                        ? item.observaciones.substring(0, 20) + '...'
                                                                        : item.observaciones}
                                                                </span>
                                                            </TooltipTrigger>
                                                            <TooltipContent className="max-w-sm">
                                                                <p>{item.observaciones}</p>
                                                            </TooltipContent>
                                                        </Tooltip>
                                                    </TooltipProvider>
                                                ) : (
                                                    <span className="text-muted-foreground">-</span>
                                                )}
                                            </TableCell>
                                            <TableCell>
                                                <DropdownMenu>
                                                    <DropdownMenuTrigger asChild>
                                                        <Button variant="ghost" size="sm">
                                                            <MoreHorizontal className="h-4 w-4" />
                                                        </Button>
                                                    </DropdownMenuTrigger>
                                                    <DropdownMenuContent align="end">
                                                        <DropdownMenuItem onClick={() => openViewModal(item)}>
                                                            <Eye className="mr-2 h-4 w-4" />
                                                            Ver detalle
                                                        </DropdownMenuItem>
                                                        {hasPermission('u_controlFisicoquimicoOrganoleptico') && (
                                                            <DropdownMenuItem onClick={() => openEditModal(item)}>
                                                                <Pencil className="mr-2 h-4 w-4" />
                                                                Editar
                                                            </DropdownMenuItem>
                                                        )}
                                                        {hasPermission('d_controlFisicoquimicoOrganoleptico') && (
                                                            <DropdownMenuItem
                                                                onClick={() => {
                                                                    if (confirm('¿Está seguro de eliminar este registro?')) {
                                                                        handleDelete(item.id);
                                                                    }
                                                                }}
                                                                className="text-red-600 focus:bg-red-50 focus:text-red-600"
                                                            >
                                                                <Trash className="mr-2 h-4 w-4" />
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

                    {hasData && (
                        <div className="border-t px-4 py-3">
                            <TablePagination
                                pagination={registros}
                                onPageChange={(page) =>
                                    router.get(
                                        route('control-fisicoquimico-organoleptico.index'),
                                        { ...filters, page },
                                        { preserveState: true, replace: true },
                                    )
                                }
                            />
                        </div>
                    )}
                </div>

                <p className="text-sm text-muted-foreground">
                    {registros.total || 0} registros encontrados
                </p>

                {/* Bloque de generación de reporte PDF por rango de fechas */}
                <div className="mt-4 rounded-lg border bg-white p-4 shadow-sm">
                    <h3 className="text-lg font-medium mb-3">Generar reporte (Fecha a fecha)</h3>
                    <div className="flex flex-wrap gap-3 items-end">
                        <div className="min-w-[160px]">
                            <label className="text-sm font-medium">Fecha Desde</label>
                            <Input type="date" value={fechaDesdeReporte} onChange={(e) => setFechaDesdeReporte(e.target.value)} />
                        </div>
                        <div className="min-w-[160px]">
                            <label className="text-sm font-medium">Fecha Hasta</label>
                            <Input type="date" value={fechaHastaReporte} onChange={(e) => setFechaHastaReporte(e.target.value)} />
                        </div>
                        <div className="flex gap-2">
                            <Button variant="outline" size="sm" onClick={handleGenerarPdf} disabled={generandoPdf}>
                                {generandoPdf ? 'Generando...' : 'Generar PDF'}
                            </Button>
                            <Button variant="ghost" size="sm" onClick={() => { setFechaDesdeReporte(''); setFechaHastaReporte(''); }}>
                                Limpiar
                            </Button>
                        </div>
                    </div>
                </div>

                {/* Modal para visualizar PDF */}
                {mostrarPdf && datosPdf.length > 0 && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80">
                        <div className="relative h-[95vh] w-[95vw] overflow-hidden rounded-lg bg-white shadow-2xl">
                            <button
                                className="absolute top-4 right-4 z-50 flex h-8 w-8 items-center justify-center rounded-full bg-red-600 text-white hover:bg-red-700"
                                onClick={() => setMostrarPdf(false)}
                            >
                                <span className="sr-only">Cerrar</span>
                                ×
                            </button>
                            <div className="absolute top-0 left-0 right-0 z-40 flex items-center justify-between bg-gray-100 px-4 py-3">
                                <div>
                                    <h3 className="text-lg font-semibold text-gray-800">Reporte Control Fisicoquímico</h3>
                                    <p className="text-sm text-gray-600">{fechaDesdeReporte} → {fechaHastaReporte}</p>
                                </div>
                            </div>
                            <div className="h-full pt-14">
                                <PDFViewer style={{ width: '100%', height: '100%', border: 'none' }}>
                                    <ReporteControlFisico
                                        datos={datosPdf}
                                        usuariosInvolucrados={usuariosPdf}
                                        filtros={{ fecha_desde: fechaDesdeReporte, fecha_hasta: fechaHastaReporte }}
                                    />
                                </PDFViewer>
                            </div>
                        </div>
                    </div>
                )}

                {/* Modal de creación */}
                <Dialog open={showCreateModal} onOpenChange={setShowCreateModal}>
                    <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                        <DialogHeader>
                            <DialogTitle>Nuevo registro</DialogTitle>
                        </DialogHeader>
                        <form onSubmit={submitCreate} className="space-y-4">
                            <div>
                                <label className="text-sm font-medium">Tiempo</label>
                                <Input
                                    type="datetime-local"
                                    value={createForm?.tiempo || ''}
                                    onChange={(e) => setCreateForm({ ...createForm, tiempo: e.target.value })}
                                    required
                                />
                            </div>

                            <div className="grid grid-cols-3 gap-3">
                                <div>
                                    <label className="text-sm font-medium">pH Pozo</label>
                                    <Input
                                        type="number"
                                        step="0.01"
                                        value={createForm?.ph_pozo || ''}
                                        onChange={(e) => setCreateForm({ ...createForm, ph_pozo: e.target.value })}
                                    />
                                </div>
                                <div>
                                    <label className="text-sm font-medium">Dureza Pozo</label>
                                    <Input
                                        type="number"
                                        step="0.01"
                                        value={createForm?.dureza_pozo || ''}
                                        onChange={(e) => setCreateForm({ ...createForm, dureza_pozo: e.target.value })}
                                    />
                                </div>
                                <div>
                                    <label className="text-sm font-medium">Conductividad Pozo</label>
                                    <Input
                                        type="number"
                                        step="0.01"
                                        value={createForm?.conductividad_pozo || ''}
                                        onChange={(e) => setCreateForm({ ...createForm, conductividad_pozo: e.target.value })}
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-3 gap-3">
                                <div>
                                    <label className="text-sm font-medium">pH Etap</label>
                                    <Input
                                        type="number"
                                        step="0.01"
                                        value={createForm?.ph_etap || ''}
                                        onChange={(e) => setCreateForm({ ...createForm, ph_etap: e.target.value })}
                                    />
                                </div>
                                <div>
                                    <label className="text-sm font-medium">Dureza Etap</label>
                                    <Input
                                        type="number"
                                        step="0.01"
                                        value={createForm?.dureza_etap || ''}
                                        onChange={(e) => setCreateForm({ ...createForm, dureza_etap: e.target.value })}
                                    />
                                </div>
                                <div>
                                    <label className="text-sm font-medium">Cloruros Etap</label>
                                    <Input
                                        type="number"
                                        step="0.01"
                                        value={createForm?.cloruros_etap || ''}
                                        onChange={(e) => setCreateForm({ ...createForm, cloruros_etap: e.target.value })}
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="text-sm font-medium">Conductividad Etap</label>
                                <Input
                                    type="number"
                                    step="0.01"
                                    value={createForm?.conductividad_etap || ''}
                                    onChange={(e) => setCreateForm({ ...createForm, conductividad_etap: e.target.value })}
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="text-sm font-medium">Color</label>
                                    <select
                                        value={createForm?.color || 'normal'}
                                        onChange={(e) => setCreateForm({ ...createForm, color: e.target.value })}
                                        className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                                    >
                                        <option value="normal">Normal</option>
                                        <option value="ligero">Ligero</option>
                                        <option value="medio">Medio</option>
                                        <option value="fuerte">Fuerte</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="text-sm font-medium">Olor</label>
                                    <select
                                        value={createForm?.olor || 'normal'}
                                        onChange={(e) => setCreateForm({ ...createForm, olor: e.target.value })}
                                        className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                                    >
                                        <option value="normal">Normal</option>
                                        <option value="anormal">Anormal</option>
                                    </select>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="text-sm font-medium">Sabor</label>
                                    <select
                                        value={createForm?.sabor || 'normal'}
                                        onChange={(e) => setCreateForm({ ...createForm, sabor: e.target.value })}
                                        className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                                    >
                                        <option value="normal">Normal</option>
                                        <option value="anormal">Anormal</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="text-sm font-medium">Aspecto</label>
                                    <select
                                        value={createForm?.aspecto || 'normal'}
                                        onChange={(e) => setCreateForm({ ...createForm, aspecto: e.target.value })}
                                        className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                                    >
                                        <option value="normal">Normal</option>
                                        <option value="anormal">Anormal</option>
                                    </select>
                                </div>
                            </div>

                            {/* Sección ETAP */}
                            <div className="border-t pt-4">
                                <h4 className="text-sm font-semibold mb-3">Parámetros ETAP</h4>
                                <div className="grid grid-cols-2 gap-3">
                                    <div>
                                        <label className="text-sm font-medium">Color ETAP</label>
                                        <select
                                            value={createForm?.color_etap || 'normal'}
                                            onChange={(e) => setCreateForm({ ...createForm, color_etap: e.target.value })}
                                            className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                                        >
                                            <option value="normal">Normal</option>
                                            <option value="ligero">Ligero</option>
                                            <option value="medio">Medio</option>
                                            <option value="fuerte">Fuerte</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label className="text-sm font-medium">Olor ETAP</label>
                                        <select
                                            value={createForm?.olor_etap || 'normal'}
                                            onChange={(e) => setCreateForm({ ...createForm, olor_etap: e.target.value })}
                                            className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                                        >
                                            <option value="normal">Normal</option>
                                            <option value="anormal">Anormal</option>
                                        </select>
                                    </div>
                                </div>
                                <div className="grid grid-cols-2 gap-3 mt-3">
                                    <div>
                                        <label className="text-sm font-medium">Sabor ETAP</label>
                                        <select
                                            value={createForm?.sabor_etap || 'normal'}
                                            onChange={(e) => setCreateForm({ ...createForm, sabor_etap: e.target.value })}
                                            className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                                        >
                                            <option value="normal">Normal</option>
                                            <option value="anormal">Anormal</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label className="text-sm font-medium">Aspecto ETAP</label>
                                        <select
                                            value={createForm?.aspecto_etap || 'normal'}
                                            onChange={(e) => setCreateForm({ ...createForm, aspecto_etap: e.target.value })}
                                            className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                                        >
                                            <option value="normal">Normal</option>
                                            <option value="anormal">Anormal</option>
                                        </select>
                                    </div>
                                </div>
                            </div>

                            <div>
                                <label className="text-sm font-medium">Observaciones</label>
                                <Textarea
                                    value={createForm?.observaciones || ''}
                                    onChange={(e) => setCreateForm({ ...createForm, observaciones: e.target.value })}
                                    rows={3}
                                />
                            </div>

                            <DialogFooter>
                                <Button variant="outline" onClick={closeCreateModal} disabled={submitting}>
                                    Cancelar
                                </Button>
                                <Button type="submit" disabled={submitting}>
                                    {submitting ? 'Guardando...' : 'Guardar'}
                                </Button>
                            </DialogFooter>
                        </form>
                    </DialogContent>
                </Dialog>

                {/* Modal de edición */}
                <Dialog open={editingId !== null} onOpenChange={() => closeEditModal()}>
                    <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                        <DialogHeader>
                            <DialogTitle>Editar registro</DialogTitle>
                        </DialogHeader>
                        <form onSubmit={submitEdit} className="space-y-4">
                            <div>
                                <label className="text-sm font-medium">Tiempo</label>
                                <Input
                                    type="datetime-local"
                                    value={editForm?.tiempo || ''}
                                    onChange={(e) => setEditForm({ ...editForm, tiempo: e.target.value })}
                                    required
                                />
                            </div>

                            <div className="grid grid-cols-3 gap-3">
                                <div>
                                    <label className="text-sm font-medium">pH Pozo</label>
                                    <Input
                                        type="number"
                                        step="0.01"
                                        value={editForm?.ph_pozo || ''}
                                        onChange={(e) => setEditForm({ ...editForm, ph_pozo: e.target.value })}
                                    />
                                </div>
                                <div>
                                    <label className="text-sm font-medium">Dureza Pozo</label>
                                    <Input
                                        type="number"
                                        step="0.01"
                                        value={editForm?.dureza_pozo || ''}
                                        onChange={(e) => setEditForm({ ...editForm, dureza_pozo: e.target.value })}
                                    />
                                </div>
                                <div>
                                    <label className="text-sm font-medium">Conductividad Pozo</label>
                                    <Input
                                        type="number"
                                        step="0.01"
                                        value={editForm?.conductividad_pozo || ''}
                                        onChange={(e) => setEditForm({ ...editForm, conductividad_pozo: e.target.value })}
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-3 gap-3">
                                <div>
                                    <label className="text-sm font-medium">pH Etap</label>
                                    <Input
                                        type="number"
                                        step="0.01"
                                        value={editForm?.ph_etap || ''}
                                        onChange={(e) => setEditForm({ ...editForm, ph_etap: e.target.value })}
                                    />
                                </div>
                                <div>
                                    <label className="text-sm font-medium">Dureza Etap</label>
                                    <Input
                                        type="number"
                                        step="0.01"
                                        value={editForm?.dureza_etap || ''}
                                        onChange={(e) => setEditForm({ ...editForm, dureza_etap: e.target.value })}
                                    />
                                </div>
                                <div>
                                    <label className="text-sm font-medium">Cloruros Etap</label>
                                    <Input
                                        type="number"
                                        step="0.01"
                                        value={editForm?.cloruros_etap || ''}
                                        onChange={(e) => setEditForm({ ...editForm, cloruros_etap: e.target.value })}
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="text-sm font-medium">Conductividad Etap</label>
                                <Input
                                    type="number"
                                    step="0.01"
                                    value={editForm?.conductividad_etap || ''}
                                    onChange={(e) => setEditForm({ ...editForm, conductividad_etap: e.target.value })}
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="text-sm font-medium">Color</label>
                                    <select
                                        value={editForm?.color || 'normal'}
                                        onChange={(e) => setEditForm({ ...editForm, color: e.target.value })}
                                        className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                                    >
                                        <option value="normal">Normal</option>
                                        <option value="ligero">Ligero</option>
                                        <option value="medio">Medio</option>
                                        <option value="fuerte">Fuerte</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="text-sm font-medium">Olor</label>
                                    <select
                                        value={editForm?.olor || 'normal'}
                                        onChange={(e) => setEditForm({ ...editForm, olor: e.target.value })}
                                        className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                                    >
                                        <option value="normal">Normal</option>
                                        <option value="anormal">Anormal</option>
                                    </select>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="text-sm font-medium">Sabor</label>
                                    <select
                                        value={editForm?.sabor || 'normal'}
                                        onChange={(e) => setEditForm({ ...editForm, sabor: e.target.value })}
                                        className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                                    >
                                        <option value="normal">Normal</option>
                                        <option value="anormal">Anormal</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="text-sm font-medium">Aspecto</label>
                                    <select
                                        value={editForm?.aspecto || 'normal'}
                                        onChange={(e) => setEditForm({ ...editForm, aspecto: e.target.value })}
                                        className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                                    >
                                        <option value="normal">Normal</option>
                                        <option value="anormal">Anormal</option>
                                    </select>
                                </div>
                            </div>

                            {/* Sección ETAP */}
                            <div className="border-t pt-4">
                                <h4 className="text-sm font-semibold mb-3">Parámetros ETAP</h4>
                                <div className="grid grid-cols-2 gap-3">
                                    <div>
                                        <label className="text-sm font-medium">Color ETAP</label>
                                        <select
                                            value={editForm?.color_etap || 'normal'}
                                            onChange={(e) => setEditForm({ ...editForm, color_etap: e.target.value })}
                                            className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                                        >
                                            <option value="normal">Normal</option>
                                            <option value="ligero">Ligero</option>
                                            <option value="medio">Medio</option>
                                            <option value="fuerte">Fuerte</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label className="text-sm font-medium">Olor ETAP</label>
                                        <select
                                            value={editForm?.olor_etap || 'normal'}
                                            onChange={(e) => setEditForm({ ...editForm, olor_etap: e.target.value })}
                                            className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                                        >
                                            <option value="normal">Normal</option>
                                            <option value="anormal">Anormal</option>
                                        </select>
                                    </div>
                                </div>
                                <div className="grid grid-cols-2 gap-3 mt-3">
                                    <div>
                                        <label className="text-sm font-medium">Sabor ETAP</label>
                                        <select
                                            value={editForm?.sabor_etap || 'normal'}
                                            onChange={(e) => setEditForm({ ...editForm, sabor_etap: e.target.value })}
                                            className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                                        >
                                            <option value="normal">Normal</option>
                                            <option value="anormal">Anormal</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label className="text-sm font-medium">Aspecto ETAP</label>
                                        <select
                                            value={editForm?.aspecto_etap || 'normal'}
                                            onChange={(e) => setEditForm({ ...editForm, aspecto_etap: e.target.value })}
                                            className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                                        >
                                            <option value="normal">Normal</option>
                                            <option value="anormal">Anormal</option>
                                        </select>
                                    </div>
                                </div>
                            </div>

                            <div>
                                <label className="text-sm font-medium">Observaciones</label>
                                <Textarea
                                    value={editForm?.observaciones || ''}
                                    onChange={(e) => setEditForm({ ...editForm, observaciones: e.target.value })}
                                    rows={3}
                                />
                            </div>

                            <DialogFooter>
                                <Button variant="outline" onClick={closeEditModal} disabled={submitting}>
                                    Cancelar
                                </Button>
                                <Button type="submit" disabled={submitting}>
                                    {submitting ? 'Guardando...' : 'Guardar'}
                                </Button>
                            </DialogFooter>
                        </form>
                    </DialogContent>
                </Dialog>

                {/* Modal de visualización */}
                <Dialog open={viewingId !== null} onOpenChange={() => closeViewModal()}>
                    <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                        <DialogHeader>
                            <DialogTitle>Detalle del registro</DialogTitle>
                        </DialogHeader>
                        {viewData && (
                            <div className="space-y-4">
                                <div className="grid grid-cols-2 gap-3">
                                    <div>
                                        <label className="text-sm font-medium">Tiempo</label>
                                        <p className="text-sm">{formatDateTime(viewData.tiempo)}</p>
                                    </div>
                                    <div>
                                        <label className="text-sm font-medium">Registrado por</label>
                                        <p className="text-sm">
                                            {viewData.usuario ? `${viewData.usuario.name} ${viewData.usuario.apellido || ''}`.trim() : '-'}
                                        </p>
                                    </div>
                                </div>

                                <div className="border-t pt-3">
                                    <h4 className="text-sm font-semibold mb-2">Parámetros Pozo</h4>
                                    <div className="grid grid-cols-3 gap-3">
                                        <div>
                                            <label className="text-sm font-medium">pH</label>
                                            <p className="text-sm">{formatDecimal(viewData.ph_pozo)}</p>
                                        </div>
                                        <div>
                                            <label className="text-sm font-medium">Dureza</label>
                                            <p className="text-sm">{formatDecimal(viewData.dureza_pozo)}</p>
                                        </div>
                                        <div>
                                            <label className="text-sm font-medium">Conductividad</label>
                                            <p className="text-sm">{formatDecimal(viewData.conductividad_pozo)}</p>
                                        </div>
                                    </div>
                                </div>

                                <div className="border-t pt-3">
                                    <h4 className="text-sm font-semibold mb-2">Parámetros ETAP</h4>
                                    <div className="grid grid-cols-4 gap-3">
                                        <div>
                                            <label className="text-sm font-medium">pH</label>
                                            <p className="text-sm">{formatDecimal(viewData.ph_etap)}</p>
                                        </div>
                                        <div>
                                            <label className="text-sm font-medium">Dureza</label>
                                            <p className="text-sm">{formatDecimal(viewData.dureza_etap)}</p>
                                        </div>
                                        <div>
                                            <label className="text-sm font-medium">Cloruros</label>
                                            <p className="text-sm">{formatDecimal(viewData.cloruros_etap)}</p>
                                        </div>
                                        <div>
                                            <label className="text-sm font-medium">Conductividad</label>
                                            <p className="text-sm">{formatDecimal(viewData.conductividad_etap)}</p>
                                        </div>
                                    </div>
                                </div>

                                <div className="border-t pt-3">
                                    <h4 className="text-sm font-semibold mb-2">Parámetros Organolépticos</h4>
                                    <div className="grid grid-cols-2 gap-3">
                                        <div>
                                            <label className="text-sm font-medium">Color</label>
                                            <p className="text-sm">
                                                <span className={`rounded-full px-2 py-1 text-xs font-medium ${getStatusBadge(viewData.color || 'normal')}`}>
                                                    {viewData.color || 'normal'}
                                                </span>
                                            </p>
                                        </div>
                                        <div>
                                            <label className="text-sm font-medium">Olor</label>
                                            <p className="text-sm">
                                                <span className={`rounded-full px-2 py-1 text-xs font-medium ${getStatusBadge(viewData.olor || 'normal')}`}>
                                                    {viewData.olor || 'normal'}
                                                </span>
                                            </p>
                                        </div>
                                        <div>
                                            <label className="text-sm font-medium">Sabor</label>
                                            <p className="text-sm">
                                                <span className={`rounded-full px-2 py-1 text-xs font-medium ${getStatusBadge(viewData.sabor || 'normal')}`}>
                                                    {viewData.sabor || 'normal'}
                                                </span>
                                            </p>
                                        </div>
                                        <div>
                                            <label className="text-sm font-medium">Aspecto</label>
                                            <p className="text-sm">
                                                <span className={`rounded-full px-2 py-1 text-xs font-medium ${getStatusBadge(viewData.aspecto || 'normal')}`}>
                                                    {viewData.aspecto || 'normal'}
                                                </span>
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                <div className="border-t pt-3">
                                    <h4 className="text-sm font-semibold mb-2">Parámetros ETAP Organolépticos</h4>
                                    <div className="grid grid-cols-2 gap-3">
                                        <div>
                                            <label className="text-sm font-medium">Color ETAP</label>
                                            <p className="text-sm">
                                                <span className={`rounded-full px-2 py-1 text-xs font-medium ${getStatusBadge(viewData.color_etap || 'normal')}`}>
                                                    {viewData.color_etap || 'normal'}
                                                </span>
                                            </p>
                                        </div>
                                        <div>
                                            <label className="text-sm font-medium">Olor ETAP</label>
                                            <p className="text-sm">
                                                <span className={`rounded-full px-2 py-1 text-xs font-medium ${getStatusBadge(viewData.olor_etap || 'normal')}`}>
                                                    {viewData.olor_etap || 'normal'}
                                                </span>
                                            </p>
                                        </div>
                                        <div>
                                            <label className="text-sm font-medium">Sabor ETAP</label>
                                            <p className="text-sm">
                                                <span className={`rounded-full px-2 py-1 text-xs font-medium ${getStatusBadge(viewData.sabor_etap || 'normal')}`}>
                                                    {viewData.sabor_etap || 'normal'}
                                                </span>
                                            </p>
                                        </div>
                                        <div>
                                            <label className="text-sm font-medium">Aspecto ETAP</label>
                                            <p className="text-sm">
                                                <span className={`rounded-full px-2 py-1 text-xs font-medium ${getStatusBadge(viewData.aspecto_etap || 'normal')}`}>
                                                    {viewData.aspecto_etap || 'normal'}
                                                </span>
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                {viewData.observaciones && (
                                    <div className="border-t pt-3">
                                        <label className="text-sm font-medium">Observaciones</label>
                                        <p className="text-sm whitespace-pre-wrap">{viewData.observaciones}</p>
                                    </div>
                                )}

                                <DialogFooter>
                                    <Button onClick={closeViewModal}>Cerrar</Button>
                                </DialogFooter>
                            </div>
                        )}
                    </DialogContent>
                </Dialog>
            </div>
        </AppLayout>
    );
}
