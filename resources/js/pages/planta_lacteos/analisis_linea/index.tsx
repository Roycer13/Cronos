import { Button } from '@/components/ui/button';
import { Toast } from '@/components/ui/toast';
import { useAdvancedFilters } from '@/hooks/use-advanced-filters';
import { useAuth } from '@/hooks/useAuth';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, router, usePage } from '@inertiajs/react';
import {
    Clock,
    Edit,
    Filter,
    MoreHorizontal,
    Play,
    TestTube,
    Trash2,
    X,
    Settings2,
    ChevronDown,
    FlaskConical,
    TrendingUp,
    RefreshCw,
} from 'lucide-react';
import { useState, useEffect, memo, useCallback } from 'react';
import { route } from 'ziggy-js';
import AnalizarModal from './AnalizarModal';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';

import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
    DropdownMenuCheckboxItem,
    DropdownMenuSeparator,
    DropdownMenuLabel,
} from '@/components/ui/dropdown-menu';
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from '@/components/ui/popover';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
    Sheet,
    SheetContent,
    SheetDescription,
    SheetHeader,
    SheetTitle,
    SheetTrigger,
} from '@/components/ui/sheet';
import TablePagination from '@/components/ui/table-pagination';
import FilterInput from '@/components/ui/filter-input';
import FilterSelect from '@/components/ui/filter-select';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Análisis de Línea', href: '/analisis-linea' },
];

interface PageProps {
    analisis: {
        data: any[];
        links: any[];
        current_page: number;
        last_page: number;
        per_page: number;
        total: number;
    };
    filters: {
        estado_planta_id?: number;
        estado_id?: number;
        solicitante_id?: number;
        analista_id?: number;
        per_page?: number;
        search_orp?: string;
        search_producto?: string;
        search_origen?: string;
        search_destino?: string;
        fecha_inicio?: string;
        fecha_fin?: string;
        etapa_id?: number;
        origen_id?: number;
        destino_id?: number;
        producto_id?: number;
        preparacion?: string;
        fecha_vencimiento_inicio?: string;
        fecha_vencimiento_fin?: string;
    };
    estados?: { id: number; nombre: string }[];
    analistas?: { id: number; name: string }[];
    etapas?: { id: number; nombre: string }[];
    origenes?: { id: number; alias: string; nombre?: string }[];
    destinos?: { id: number; nombre: string }[];
    productos?: { id: number; nombre_comercial: string; nombre_sap: string }[];
    pendientesLecheCount?: number;
    flash: {
        success?: string;
        error?: string;
    };
}

const AVAILABLE_COLUMNS = [
    { id: 'orp', label: 'ORP', defaultVisible: true, fixed: true, width: 70 },
    { id: 'hora', label: 'Hora', defaultVisible: true, fixed: true, width: 60 },
    { id: 'producto', label: 'Producto', defaultVisible: true, fixed: true, width: 120 },
    { id: 'preparacion', label: 'Prep.', defaultVisible: true, fixed: false, width: 50 },
    { id: 'origen', label: 'Origen', defaultVisible: true, fixed: false, width: 70 },
    { id: 'etapa', label: 'Etapa', defaultVisible: true, fixed: false, width: 80 },
    { id: 'destino', label: 'Destino', defaultVisible: true, fixed: false, width: 80 },
    { id: 'estado', label: 'Est', defaultVisible: true, fixed: false, width: 15 },
    { id: 'acciones', label: 'Acciones', defaultVisible: true, fixed: false, width: 50 },
    { id: 'temperatura', label: 'Temp.', defaultVisible: true, fixed: false, width: 55 },
    { id: 'ph', label: 'pH', defaultVisible: true, fixed: false, width: 55 },
    { id: 'acidez', label: 'Acidez', defaultVisible: true, fixed: false, width: 55 },
    { id: 'brix', label: 'Brix', defaultVisible: true, fixed: false, width: 55 },
    { id: 'viscosidad', label: 'Visc.', defaultVisible: true, fixed: false, width: 55 },
    { id: 'densidad', label: 'Dens.', defaultVisible: false, fixed: false, width: 55 },
    { id: 'color', label: 'Color', defaultVisible: false, fixed: false, width: 40 },
    { id: 'olor', label: 'Olor', defaultVisible: false, fixed: false, width: 40 },
    { id: 'sabor', label: 'Sabor', defaultVisible: false, fixed: false, width: 40 },
    { id: 'aspecto', label: 'Asp.', defaultVisible: false, fixed: false, width: 40 },
    { id: 'peso', label: 'Peso', defaultVisible: false, fixed: false, width: 60 },
    { id: 'volumen', label: 'Vol.', defaultVisible: false, fixed: false, width: 55 },
    { id: 'observaciones', label: 'Obs.', defaultVisible: false, fixed: false, width: 80 },
    { id: 'solicitante', label: 'Sol./Ana.', defaultVisible: false, fixed: false, width: 80 },
    { id: 'analista', label: 'Anal.', defaultVisible: false, fixed: false, width: 80 },
];

const COLUMN_FULL_NAMES: Record<string, string> = {
    temperatura: 'Temperatura',
    ph: 'pH',
    acidez: 'Acidez',
    brix: 'Brix',
    viscosidad: 'Viscosidad',
    densidad: 'Densidad',
    color: 'Color',
    olor: 'Olor',
    sabor: 'Sabor',
    aspecto: 'Aspecto',
    peso: 'Peso',
    volumen: 'Volumen',
    observaciones: 'Observaciones',
    solicitante: 'Solicitante',
    analista: 'Analista',
};

// Componente de filtros para escritorio
const FiltersPanel = memo(({
    filters,
    updateFilter,
    resetFilters,
    hasActiveFilters,
    activeFiltersCount,
    estados,
    analistas,
    etapas,
    origenes,
    destinos,
    productos,
}: {
    filters: any;
    updateFilter: (key: string, value: string) => void;
    resetFilters: () => void;
    hasActiveFilters: boolean;
    activeFiltersCount: number;
    estados: { id: number; nombre: string }[];
    analistas: { id: number; name: string }[];
    etapas: { id: number; nombre: string }[];
    origenes: { id: number; alias: string; nombre?: string }[];
    destinos: { id: number; nombre: string }[];
    productos: { id: number; nombre_comercial: string; nombre_sap: string }[];
}) => {
    const handleReset = useCallback(() => {
        resetFilters();
    }, [resetFilters]);

    return (
        <Card className="border-border/50 shadow-sm">
            <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                    <div>
                        <CardTitle className="text-base font-semibold">Filtros Avanzados</CardTitle>
                        <CardDescription className="text-xs">
                            Refina tu búsqueda con filtros específicos
                        </CardDescription>
                    </div>
                    {hasActiveFilters && (
                        <Button variant="ghost" size="sm" onClick={handleReset} className="h-7 text-xs">
                            <X className="mr-1 h-3 w-3" />
                            Limpiar todo
                        </Button>
                    )}
                </div>
            </CardHeader>
            <CardContent>
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
                    <FilterInput
                        value={filters.search_orp || ''}
                        onChange={(v) => updateFilter('search_orp', v)}
                        placeholder="Código ORP"
                    />
                    <FilterInput
                        value={filters.search_producto || ''}
                        onChange={(v) => updateFilter('search_producto', v)}
                        placeholder="Producto"
                    />
                    <FilterInput
                        value={filters.search_destino || ''}
                        onChange={(v) => updateFilter('search_destino', v)}
                        placeholder="Destino"
                    />
                    <FilterInput
                        value={filters.search_origen || ''}
                        onChange={(v) => updateFilter('search_origen', v)}
                        placeholder="Origen"
                    />

                    {/* Fechas de solicitud */}
                    <div className="space-y-1">
                        <label htmlFor="fecha_inicio_desktop" className="text-xs font-medium text-muted-foreground">
                            Fecha inicio
                        </label>
                        <Input
                            id="fecha_inicio_desktop"
                            type="date"
                            value={filters.fecha_inicio || ''}
                            onChange={(e) => updateFilter('fecha_inicio', e.target.value)}
                            className="text-sm"
                        />
                    </div>
                    <div className="space-y-1">
                        <label htmlFor="fecha_fin_desktop" className="text-xs font-medium text-muted-foreground">
                            Fecha fin
                        </label>
                        <Input
                            id="fecha_fin_desktop"
                            type="date"
                            value={filters.fecha_fin || ''}
                            onChange={(e) => updateFilter('fecha_fin', e.target.value)}
                            className="text-sm"
                        />
                    </div>

                    {/* Fechas de vencimiento */}
                    <div className="space-y-1">
                        <label htmlFor="fecha_vencimiento_inicio_desktop" className="text-xs font-medium text-muted-foreground">
                            Vencimiento desde
                        </label>
                        <Input
                            id="fecha_vencimiento_inicio_desktop"
                            type="date"
                            value={filters.fecha_vencimiento_inicio || ''}
                            onChange={(e) => updateFilter('fecha_vencimiento_inicio', e.target.value)}
                            className="text-sm"
                        />
                    </div>
                    <div className="space-y-1">
                        <label htmlFor="fecha_vencimiento_fin_desktop" className="text-xs font-medium text-muted-foreground">
                            Vencimiento hasta
                        </label>
                        <Input
                            id="fecha_vencimiento_fin_desktop"
                            type="date"
                            value={filters.fecha_vencimiento_fin || ''}
                            onChange={(e) => updateFilter('fecha_vencimiento_fin', e.target.value)}
                            className="text-sm"
                        />
                    </div>

                    <FilterSelect
                        value={filters.estado_id || ''}
                        onChange={(v) => updateFilter('estado_id', v)}
                        placeholder="Estado"
                        options={estados.map((e) => ({
                            value: e.id.toString(),
                            label: e.nombre,
                        }))}
                    />
                    <FilterSelect
                        value={filters.analista_id || ''}
                        onChange={(v) => updateFilter('analista_id', v)}
                        placeholder="Analista"
                        options={analistas.map((a) => ({
                            value: a.id.toString(),
                            label: a.name,
                        }))}
                    />
                    <FilterSelect
                        value={filters.etapa_id || ''}
                        onChange={(v) => updateFilter('etapa_id', v)}
                        placeholder="Etapa"
                        options={etapas.map((e) => ({
                            value: e.id.toString(),
                            label: e.nombre,
                        }))}
                    />
                    <FilterSelect
                        value={filters.origen_id || ''}
                        onChange={(v) => updateFilter('origen_id', v)}
                        placeholder="Origen"
                        options={origenes.map((o) => ({
                            value: o.id.toString(),
                            label: o.alias,
                        }))}
                    />
                    <FilterSelect
                        value={filters.destino_id || ''}
                        onChange={(v) => updateFilter('destino_id', v)}
                        placeholder="Destino"
                        options={destinos.map((d) => ({
                            value: d.id.toString(),
                            label: d.nombre,
                        }))}
                    />
                    <FilterSelect
                        value={filters.producto_id || ''}
                        onChange={(v) => updateFilter('producto_id', v)}
                        placeholder="Producto"
                        options={productos.map((p) => ({
                            value: p.id.toString(),
                            label: p.nombre_comercial || p.nombre_sap,
                        }))}
                    />
                    <FilterInput
                        value={filters.preparacion || ''}
                        onChange={(v) => updateFilter('preparacion', v)}
                        placeholder="Preparación"
                    />
                    <FilterSelect
                        value={filters.per_page || '10'}
                        onChange={(v) => updateFilter('per_page', v)}
                        placeholder="Resultados"
                        options={['10', '25', '50', '100'].map((v) => ({
                            value: v,
                            label: `${v} por página`,
                        }))}
                        includeAllOption={false}
                    />
                </div>

                {activeFiltersCount > 0 && (
                    <div className="mt-3 flex flex-wrap gap-1.5 pt-2 border-t">
                        <span className="text-xs text-muted-foreground">Filtros activos:</span>
                        {Object.entries(filters).map(([key, value]) => {
                            if (value && value !== '' && value !== '10') {
                                const label = key.replace('search_', '').replace('_', ' ');
                                return (
                                    <Badge key={key} variant="secondary" className="text-[10px] h-5">
                                        {label}: {value}
                                        <button
                                            onClick={() => updateFilter(key, '')}
                                            className="ml-1 hover:text-destructive"
                                        >
                                            <X className="h-2.5 w-2.5" />
                                        </button>
                                    </Badge>
                                );
                            }
                            return null;
                        })}
                    </div>
                )}
            </CardContent>
        </Card>
    );
});

// Componente de filtros móvil
const MobileFiltersPanel = memo(({
    filters,
    updateFilter,
    resetFilters,
    estados,
    analistas,
    etapas,
    origenes,
    destinos,
    productos,
    onClose,
}: {
    filters: any;
    updateFilter: (key: string, value: string) => void;
    resetFilters: () => void;
    estados: { id: number; nombre: string }[];
    analistas: { id: number; name: string }[];
    etapas: { id: number; nombre: string }[];
    origenes: { id: number; alias: string; nombre?: string }[];
    destinos: { id: number; nombre: string }[];
    productos: { id: number; nombre_comercial: string; nombre_sap: string }[];
    onClose: () => void;
}) => {
    return (
        <div className="space-y-3">
            <FilterInput
                value={filters.search_orp || ''}
                onChange={(v) => updateFilter('search_orp', v)}
                placeholder="Código ORP"
            />
            <FilterInput
                value={filters.search_producto || ''}
                onChange={(v) => updateFilter('search_producto', v)}
                placeholder="Producto"
            />
            <FilterInput
                value={filters.search_destino || ''}
                onChange={(v) => updateFilter('search_destino', v)}
                placeholder="Destino"
            />
            <FilterInput
                value={filters.search_origen || ''}
                onChange={(v) => updateFilter('search_origen', v)}
                placeholder="Origen"
            />

            {/* Fechas de solicitud */}
            <div className="grid grid-cols-2 gap-2">
                <div className="space-y-1">
                    <label htmlFor="fecha_inicio_mobile" className="text-xs font-medium text-muted-foreground">
                        Fecha inicio
                    </label>
                    <Input
                        id="fecha_inicio_mobile"
                        type="date"
                        value={filters.fecha_inicio || ''}
                        onChange={(e) => updateFilter('fecha_inicio', e.target.value)}
                        className="text-sm"
                    />
                </div>
                <div className="space-y-1">
                    <label htmlFor="fecha_fin_mobile" className="text-xs font-medium text-muted-foreground">
                        Fecha fin
                    </label>
                    <Input
                        id="fecha_fin_mobile"
                        type="date"
                        value={filters.fecha_fin || ''}
                        onChange={(e) => updateFilter('fecha_fin', e.target.value)}
                        className="text-sm"
                    />
                </div>
            </div>

            {/* Fechas de vencimiento */}
            <div className="grid grid-cols-2 gap-2">
                <div className="space-y-1">
                    <label htmlFor="fecha_vencimiento_inicio_mobile" className="text-xs font-medium text-muted-foreground">
                        Vencimiento desde
                    </label>
                    <Input
                        id="fecha_vencimiento_inicio_mobile"
                        type="date"
                        value={filters.fecha_vencimiento_inicio || ''}
                        onChange={(e) => updateFilter('fecha_vencimiento_inicio', e.target.value)}
                        className="text-sm"
                    />
                </div>
                <div className="space-y-1">
                    <label htmlFor="fecha_vencimiento_fin_mobile" className="text-xs font-medium text-muted-foreground">
                        Vencimiento hasta
                    </label>
                    <Input
                        id="fecha_vencimiento_fin_mobile"
                        type="date"
                        value={filters.fecha_vencimiento_fin || ''}
                        onChange={(e) => updateFilter('fecha_vencimiento_fin', e.target.value)}
                        className="text-sm"
                    />
                </div>
            </div>

            <FilterSelect
                value={filters.estado_id || ''}
                onChange={(v) => updateFilter('estado_id', v)}
                placeholder="Estado"
                options={estados.map((e) => ({
                    value: e.id.toString(),
                    label: e.nombre,
                }))}
            />
            <FilterSelect
                value={filters.analista_id || ''}
                onChange={(v) => updateFilter('analista_id', v)}
                placeholder="Analista"
                options={analistas.map((a) => ({
                    value: a.id.toString(),
                    label: a.name,
                }))}
            />
            <FilterSelect
                value={filters.etapa_id || ''}
                onChange={(v) => updateFilter('etapa_id', v)}
                placeholder="Etapa"
                options={etapas.map((e) => ({
                    value: e.id.toString(),
                    label: e.nombre,
                }))}
            />
            <FilterSelect
                value={filters.origen_id || ''}
                onChange={(v) => updateFilter('origen_id', v)}
                placeholder="Origen"
                options={origenes.map((o) => ({
                    value: o.id.toString(),
                    label: o.alias,
                }))}
            />
            <FilterSelect
                value={filters.destino_id || ''}
                onChange={(v) => updateFilter('destino_id', v)}
                placeholder="Destino"
                options={destinos.map((d) => ({
                    value: d.id.toString(),
                    label: d.nombre,
                }))}
            />
            <FilterSelect
                value={filters.producto_id || ''}
                onChange={(v) => updateFilter('producto_id', v)}
                placeholder="Producto"
                options={productos.map((p) => ({
                    value: p.id.toString(),
                    label: p.nombre_comercial || p.nombre_sap,
                }))}
            />
            <FilterInput
                value={filters.preparacion || ''}
                onChange={(v) => updateFilter('preparacion', v)}
                placeholder="Preparación"
            />
            <FilterSelect
                value={filters.per_page || '10'}
                onChange={(v) => updateFilter('per_page', v)}
                placeholder="Por página"
                options={['10', '25', '50', '100'].map((v) => ({
                    value: v,
                    label: `${v} por página`,
                }))}
                includeAllOption={false}
            />
            <div className="flex gap-2 mt-6 pb-4">
                <Button onClick={resetFilters} variant="outline" className="flex-1">
                    <X className="h-3 w-3 mr-1" />
                    Limpiar
                </Button>
                <Button onClick={onClose} className="flex-1">
                    Aplicar
                </Button>
            </div>
        </div>
    );
});

export default function Index() {
    const { props } = usePage();
    const [showFilters, setShowFilters] = useState(false);
    const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);

    const [visibleColumns, setVisibleColumns] = useState<string[]>(() => {
        const saved = localStorage.getItem('analisis-linea-columns-v2');
        if (saved) {
            try {
                const parsed = JSON.parse(saved);
                if (Array.isArray(parsed) && parsed.length > 0) {
                    return parsed;
                }
            } catch (e) {
                console.error('Error parsing saved columns', e);
            }
        }
        return AVAILABLE_COLUMNS.filter(col => col.defaultVisible).map(col => col.id);
    });

    useEffect(() => {
        localStorage.setItem('analisis-linea-columns-v2', JSON.stringify(visibleColumns));
    }, [visibleColumns]);

    const { hasPermission, canDo } = useAuth();

    const refreshData = useCallback(() => {
        router.reload({ preserveState: true, preserveScroll: true });
    }, []);

    const {
        analisis = { data: [], links: [], current_page: 1, last_page: 1, per_page: 10, total: 0 },
        filters: initialFilters = {},
        estados = [],
        analistas = [],
        etapas = [],
        origenes = [],
        destinos = [],
        productos = [],
        pendientesLecheCount = 0,
        flash,
    } = props as unknown as PageProps;

    const hasPendientesLeche = pendientesLecheCount > 0;

    const { filters, updateFilter, resetFilters } = useAdvancedFilters({
        routeName: 'analisis-linea.index',
        initialFilters: {
            estado_planta_id: initialFilters.estado_planta_id?.toString() || undefined,
            estado_id: initialFilters.estado_id?.toString() || undefined,
            solicitante_id: initialFilters.solicitante_id?.toString() || undefined,
            analista_id: initialFilters.analista_id?.toString() || undefined,
            per_page: initialFilters.per_page?.toString() || '10',
            search_orp: initialFilters.search_orp || '',
            search_producto: initialFilters.search_producto || '',
            search_origen: initialFilters.search_origen || '',
            search_destino: initialFilters.search_destino || '',
            fecha_inicio: initialFilters.fecha_inicio || '',
            fecha_fin: initialFilters.fecha_fin || '',
            fecha_vencimiento_inicio: initialFilters.fecha_vencimiento_inicio || '',
            fecha_vencimiento_fin: initialFilters.fecha_vencimiento_fin || '',
            etapa_id: initialFilters.etapa_id?.toString() || undefined,
            origen_id: initialFilters.origen_id?.toString() || undefined,
            destino_id: initialFilters.destino_id?.toString() || undefined,
            producto_id: initialFilters.producto_id?.toString() || undefined,
            preparacion: initialFilters.preparacion || '',
        },
        debounceFields: ['search_orp', 'search_producto', 'search_origen', 'search_destino', 'preparacion'],
        debounceDelay: 600,
    });

    const hasActiveFilters = Object.values(filters).some(
        (value) => value && value !== '' && value !== '10',
    );

    const activeFiltersCount = Object.values(filters).filter(
        (v) => v && v !== '' && v !== '10'
    ).length;

    const toggleColumn = (columnId: string) => {
        setVisibleColumns(prev => {
            if (prev.includes(columnId)) {
                return prev.filter(id => id !== columnId);
            } else {
                return [...prev, columnId];
            }
        });
    };

    const resetColumns = () => {
        const defaultColumns = AVAILABLE_COLUMNS.filter(col => col.defaultVisible).map(col => col.id);
        setVisibleColumns(defaultColumns);
    };

    const getStickyLeft = (columnId: string) => {
        const fixedColumns = AVAILABLE_COLUMNS.filter(col => col.fixed && visibleColumns.includes(col.id));
        let offset = 0;
        for (let i = 0; i < fixedColumns.length; i++) {
            if (fixedColumns[i].id === columnId) break;
            offset += fixedColumns[i].width;
        }
        return offset;
    };

    const handleAnalizar = (id: number) => {
        const item = analisis.data.find((a: any) => a.id === id);
        if (item) {
            const itemAdaptado = {
                ...item,
                estado_planta: {
                    ...item.estado_planta,
                    estado_detalle: item.estado_planta?.detalles?.[0] ?? null,
                },
            };
            setSelectedAnalisis(itemAdaptado);
            setModalOpen(true);
        } else {
            router.visit(route('analisis-linea.analizar', id));
        }
    };

    const [modalOpen, setModalOpen] = useState(false);
    const [selectedAnalisis, setSelectedAnalisis] = useState<any | null>(null);

    useEffect(() => {
        const interval = setInterval(() => {
            if (document.visibilityState === 'visible') {
                router.reload({
                    only: ['analisis'],
                });
            }
        }, 20000);

        return () => clearInterval(interval);
    }, []);

    const handleEdit = (id: number) => {
        router.visit(route('analisis-linea.edit', id));
    };

    const handleDelete = (id: number) => {
        if (confirm('¿Está seguro de eliminar este análisis de línea?')) {
            router.delete(route('analisis-linea.destroy', id), {
                preserveScroll: true,
            });
        }
    };

    const handleOrpClick = (orpId: number) => {
        if (orpId) {
            router.visit(route('orps.show', orpId));
        }
    };

    const formatHora = (fecha: string) => {
        return new Date(fecha).toLocaleTimeString('es-ES', {
            hour: '2-digit',
            minute: '2-digit',
        });
    };

    const formatFecha = (fecha: string) => {
        return new Date(fecha).toLocaleDateString('es-ES', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
        });
    };

    const getEstadoColor = (estadoNombre: string) => {
        switch (estadoNombre) {
            case 'Pendiente':
                return 'bg-yellow-500 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400 border border-yellow-200 dark:border-yellow-800';
            case 'Completado':
                return 'bg-green-500 text-green-800 dark:bg-green-900/30 dark:text-green-400 border border-green-200 dark:border-green-800';
            default:
                return 'bg-gray-500 text-gray-800 dark:bg-gray-800/50 dark:text-gray-400 border border-gray-200 dark:border-gray-700';
        }
    };

    const estaCompletado = (analisisItem: any) => {
        return (
            analisisItem.estado?.nombre === 'Completado' ||
            (analisisItem.tiempo_analisis && analisisItem.analista_id)
        );
    };

    const getDetalles = (analisisItem: any) => {
        const detalles = analisisItem.estado_planta?.detalles;
        return Array.isArray(detalles) ? detalles : [];
    };

    const getOrps = (analisisItem: any) => {
        const detalles = getDetalles(analisisItem);
        return detalles.map((d: any) => d.orp).filter(Boolean);
    };

    const getProductosTerminados = (analisisItem: any) => {
        const orps = getOrps(analisisItem);
        return orps.map((orp: any) => orp.producto_terminado).filter(Boolean);
    };

    const formatBoolean = (value: boolean | null) => {
        if (value === true) return 'Sí';
        if (value === false) return 'No';
        return '-';
    };

    const getParametroStatus = (analisisItem: any, field: string): { status: 'success' | 'danger' | 'default', min: number | null, max: number | null } => {
        const param = analisisItem.parametro_linea;
        if (!param) return { status: 'default', min: null, max: null };

        let minKey: string, maxKey: string;
        switch (field) {
            case 'temperatura':
                minKey = 'temperatura_min';
                maxKey = 'temperatura_max';
                break;
            case 'ph':
                minKey = 'ph_min';
                maxKey = 'ph_max';
                break;
            case 'acidez':
                minKey = 'acidez_min';
                maxKey = 'acidez_max';
                break;
            case 'brix':
                minKey = 'brix_min';
                maxKey = 'brix_max';
                break;
            case 'viscosidad':
                minKey = 'viscosidad_min';
                maxKey = 'viscosidad_max';
                break;
            case 'densidad':
                minKey = 'densidad_min';
                maxKey = 'densidad_max';
                break;
            default:
                return { status: 'default', min: null, max: null };
        }

        const min = param[minKey] !== undefined && param[minKey] !== null ? Number(param[minKey]) : null;
        const max = param[maxKey] !== undefined && param[maxKey] !== null ? Number(param[maxKey]) : null;

        if (min === null && max === null) return { status: 'default', min: null, max: null };

        const value = analisisItem[field];
        if (value === null || value === undefined || value === '') return { status: 'default', min, max };

        const numValue = Number(value);
        if (isNaN(numValue)) return { status: 'default', min, max };

        const isInRange = (min === null || numValue >= min) && (max === null || numValue <= max);
        return { status: isInRange ? 'success' : 'danger', min, max };
    };

    const ParameterCell = ({ analisisItem, field }: { analisisItem: any; field: string }) => {
        const value = analisisItem[field];
        const { status, min, max } = getParametroStatus(analisisItem, field);

        let className = 'px-1.5 py-1 text-xs';
        if (status === 'success') {
            className += ' bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300 rounded';
        } else if (status === 'danger') {
            className += ' bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300 rounded';
        }

        let displayValue = value !== null && value !== undefined && value !== '' ? String(value) : '-';
        if (field === 'temperatura') displayValue += '°C';
        else if (field === 'acidez') displayValue += '%';
        else if (field === 'brix') displayValue += '°Bx';

        const tooltip = status !== 'default' && (min !== null || max !== null)
            ? `Rango: ${min !== null ? min : '∞'} - ${max !== null ? max : '∞'}`
            : 'Sin parámetro definido';

        return (
            <span className={className} title={tooltip}>
                {displayValue}
            </span>
        );
    };

    const formatNumberValue = (value: number | string | null | undefined) => {
        if (value === null || value === undefined || value === '') return null;

        const numericValue = typeof value === 'number' ? value : Number(value);

        if (Number.isNaN(numericValue)) {
            return String(value);
        }

        return numericValue.toString().replace(/(\.\d*?)0+$/, '$1').replace(/\.$/, '');
    };

    const formatNumericCell = (value: number | string | null | undefined, suffix = '') => {
        const formattedValue = formatNumberValue(value);
        if (formattedValue === null) return '-';
        return `${formattedValue}${suffix}`;
    };

    const TruncatedCell = ({ value, fullValue }: { value: string; fullValue?: string }) => {
        const displayValue = value || '-';
        const tooltipValue = fullValue || value;

        if (displayValue === '-') {
            return <span className="text-muted-foreground">-</span>;
        }

        return (
            <Popover>
                <PopoverTrigger asChild>
                    <button className="w-full text-left truncate focus:outline-none cursor-pointer text-xs hover:text-primary transition-colors" title={tooltipValue}>
                        {displayValue.length > 20 ? displayValue.substring(0, 20) + '...' : displayValue}
                    </button>
                </PopoverTrigger>
                <PopoverContent side="top" align="start" className="w-auto max-w-[300px] p-3 text-xs bg-popover shadow-lg border rounded-md z-50">
                    <p className="font-semibold mb-1 text-muted-foreground uppercase text-[10px]">Valor completo:</p>
                    <p className="leading-relaxed break-words">{tooltipValue}</p>
                </PopoverContent>
            </Popover>
        );
    };

    const renderCellValue = (analisisItem: any, columnId: string) => {
        const completado = estaCompletado(analisisItem);

        switch (columnId) {
            case 'orp': {
                const orps = getOrps(analisisItem);
                if (orps.length === 0) return <span className="text-muted-foreground">-</span>;

                return (
                    <div className="flex flex-col gap-0.5">
                        {orps.map((orp: any, index: number) => (
                            <button
                                key={`${orp.id}-${index}`}
                                onClick={() => handleOrpClick(orp.id)}
                                className="text-left text-xs font-mono font-medium text-primary hover:text-primary/80 hover:underline cursor-pointer whitespace-nowrap"
                                title={`Ver ORP ${orp.codigo}`}
                            >
                                {orp.codigo}
                            </button>
                        ))}
                    </div>
                );
            }
            case 'hora':
                return (
                    <div className="space-y-0.5">
                        <div className="flex items-center gap-1" title={`Solicitud: ${formatFecha(analisisItem.tiempo_solicitud)} ${formatHora(analisisItem.tiempo_solicitud)}`}>
                            <Clock className="h-3 w-3 text-muted-foreground shrink-0" />
                            <span className="text-xs font-medium">
                                {formatHora(analisisItem.tiempo_solicitud)}
                            </span>
                        </div>
                        {analisisItem.tiempo_analisis && (
                            <div className="flex items-center gap-1" title={`Análisis: ${formatFecha(analisisItem.tiempo_analisis)} ${formatHora(analisisItem.tiempo_analisis)}`}>
                                <Clock className="h-3 w-3 text-green-600 dark:text-green-400 shrink-0" />
                                <span className="text-xs text-green-600 dark:text-green-400">
                                    {formatHora(analisisItem.tiempo_analisis)}
                                </span>
                            </div>
                        )}
                    </div>
                );
            case 'producto': {
                const productos = getProductosTerminados(analisisItem);
                if (productos.length === 0) return <span className="text-muted-foreground">-</span>;

                return (
                    <Popover>
                        <PopoverTrigger asChild>
                            <button className="w-full text-left text-xs hover:text-primary focus:outline-none" title="Ver productos">
                                {productos.length === 1 ? (
                                    <span className="whitespace-normal">{productos[0]?.nombre_comercial || productos[0]?.nombre_sap || '-'}</span>
                                ) : (
                                    <span className="whitespace-normal">
                                        {productos[0]?.nombre_comercial || productos[0]?.nombre_sap || '-'} +{productos.length - 1}
                                    </span>
                                )}
                            </button>
                        </PopoverTrigger>
                        <PopoverContent side="right" align="start" className="w-64 p-3 text-xs">
                            {productos.map((p: any, idx: number) => (
                                <div key={`${p.id || idx}-${idx}`} className="mb-2 last:mb-0">
                                    <p className="font-semibold text-muted-foreground uppercase text-[10px]">
                                        Producto {idx + 1}
                                    </p>
                                    <p className="leading-relaxed font-medium">{p.nombre_comercial || p.nombre_sap || 'Sin nombre'}</p>
                                    {p.destino?.nombre && <p className="text-xs">Destino: {p.destino.nombre}</p>}
                                </div>
                            ))}
                        </PopoverContent>
                    </Popover>
                );
            }
            case 'preparacion': {
                const detalles = getDetalles(analisisItem);
                const preparaciones = detalles.map(d => d.preparacion).filter(Boolean);
                if (preparaciones.length === 0) return <span className="text-muted-foreground">-</span>;
                return (
                    <div className="flex flex-col gap-0.5">
                        {preparaciones.map((prep: string, idx: number) => (
                            <span key={`${prep}-${idx}`} className="text-xs whitespace-nowrap">{prep}</span>
                        ))}
                    </div>
                );
            }
            case 'origen':
                return <TruncatedCell value={analisisItem.estado_planta?.origen?.alias || '-'} />;
            case 'etapa':
                return <TruncatedCell value={analisisItem.estado_planta?.etapa?.nombre || '-'} />;
            case 'destino': {
                const productos = getProductosTerminados(analisisItem);
                const destinos = productos.map(p => p.destino?.nombre).filter(Boolean);
                if (destinos.length === 0) return <span className="text-muted-foreground">-</span>;
                return (
                    <div className="flex flex-col gap-0.5">
                        {destinos.map((dest: string, idx: number) => (
                            <span key={`${dest}-${idx}`} className="text-xs whitespace-nowrap">{dest}</span>
                        ))}
                    </div>
                );
            }
            case 'estado':
                return (
                    <Badge variant="outline" className={getEstadoColor(analisisItem.estado?.nombre)}>
                        {/* {analisisItem.estado?.nombre} */}
                    </Badge>
                );
            case 'acciones':
                return (
                    <div className="flex gap-1">
                        {!completado && hasPermission('u_analisisLinea') && (
                            <Button variant="ghost" size="sm" onClick={() => handleAnalizar(analisisItem.id)} className="h-7 w-7 p-0 hover:bg-green-100 dark:hover:bg-green-900/30">
                                <Play className="h-3 w-3 text-green-600 dark:text-green-400" />
                            </Button>
                        )}
                        {completado && canDo(analisisItem, 'u_analisisLinea', 8) && (
                            <Button variant="ghost" size="sm" onClick={() => handleEdit(analisisItem.id)} className="h-7 w-7 p-0 hover:bg-blue-100 dark:hover:bg-blue-900/30">
                                <Edit className="h-3 w-3 text-blue-600 dark:text-blue-400" />
                            </Button>
                        )}
                        {canDo({ ...analisisItem, user_id: analisisItem.solicitante_id }, 'd_analisisLinea', 5, true, false, false) && (
                            <Button variant="ghost" size="sm" onClick={() => handleDelete(analisisItem.id)} className="h-7 w-7 p-0 hover:bg-red-100 dark:hover:bg-red-900/30">
                                <Trash2 className="h-3 w-3 text-red-600 dark:text-red-400" />
                            </Button>
                        )}
                    </div>
                );
            case 'temperatura':
                return <ParameterCell analisisItem={analisisItem} field="temperatura" />;
            case 'ph':
                return <ParameterCell analisisItem={analisisItem} field="ph" />;
            case 'acidez':
                return <ParameterCell analisisItem={analisisItem} field="acidez" />;
            case 'brix':
                return <ParameterCell analisisItem={analisisItem} field="brix" />;
            case 'viscosidad':
                return <ParameterCell analisisItem={analisisItem} field="viscosidad" />;
            case 'densidad':
                return <ParameterCell analisisItem={analisisItem} field="densidad" />;
            case 'color':
                return <TruncatedCell value={formatBoolean(analisisItem.color)} />;
            case 'olor':
                return <TruncatedCell value={formatBoolean(analisisItem.olor)} />;
            case 'sabor':
                return <TruncatedCell value={formatBoolean(analisisItem.sabor)} />;
            case 'aspecto':
                return <TruncatedCell value={analisisItem.aspecto || '-'} />;
            case 'peso':
                return <TruncatedCell value={formatNumericCell(analisisItem.peso, ' kg')} />;
            case 'volumen':
                return <TruncatedCell value={formatNumericCell(analisisItem.volumen, ' L')} />;
            case 'observaciones':
                return <TruncatedCell value={analisisItem.observaciones || '-'} fullValue={analisisItem.observaciones} />;
            case 'solicitante':
                return (
                    <TruncatedCell
                        value={
                            <div>
                                <div>{analisisItem.solicitante?.name || '-'}</div>
                                <div>{analisisItem.analista?.name || '-'}</div>
                            </div>
                        }
                    />
                );
            case 'analista':
                return <TruncatedCell value={analisisItem.analista?.name || '-'} />;
            default:
                return '-';
        }
    };

    const visibleColumnsList = AVAILABLE_COLUMNS.filter(col => visibleColumns.includes(col.id));

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Análisis de Línea" />
            <div className="space-y-3 px-2 py-2 sm:px-4 lg:px-6">
                <Toast />

                <Dialog open={modalOpen} onOpenChange={(open) => { if (!open) { setModalOpen(false); setSelectedAnalisis(null); } else setModalOpen(open); }}>
                    {modalOpen && selectedAnalisis && (
                        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
                            <DialogHeader>
                                <DialogTitle>Realizar Análisis</DialogTitle>
                            </DialogHeader>
                            <div className="pr-4">
                                <AnalizarModal
                                    analisis={selectedAnalisis}
                                    onSaved={() => { refreshData(); }}
                                    onClose={() => { setModalOpen(false); setSelectedAnalisis(null); }}
                                />
                            </div>
                        </DialogContent>
                    )}
                </Dialog>

                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                    <div className="flex items-center gap-3">
                        <div className="relative">
                            <Button
                                variant="default"
                                size="sm"
                                onClick={() => router.visit(route('analisis-leche.index'))}
                                className="relative"
                            >
                                <FlaskConical className="h-4 w-4 mr-1" />
                                Análisis de leche
                                {hasPendientesLeche && (
                                    <span className="absolute -right-1 -top-1 h-3 w-3 rounded-full bg-red-500 ring-2 ring-background animate-pulse" />
                                )}
                            </Button>
                        </div>
                        <Badge variant="secondary" className="text-xs">
                            <TrendingUp className="h-3 w-3 mr-1" />
                            Total: {analisis.total}
                        </Badge>
                    </div>

                    <div className="flex items-center gap-2">
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant="outline" size="sm" className="h-8">
                                    <Settings2 className="h-3.5 w-3.5 mr-1" />
                                    <span className="text-xs hidden sm:inline">Columnas</span>
                                    <ChevronDown className="h-3 w-3 ml-1" />
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="w-56 max-h-96 overflow-y-auto">
                                <DropdownMenuLabel>Mostrar columnas</DropdownMenuLabel>
                                <DropdownMenuSeparator />
                                {AVAILABLE_COLUMNS.map(col => (
                                    <DropdownMenuCheckboxItem
                                        key={col.id}
                                        checked={visibleColumns.includes(col.id)}
                                        onCheckedChange={() => toggleColumn(col.id)}
                                        disabled={col.fixed}
                                    >
                                        <div className="flex flex-col items-start">
                                            <span>{col.label}</span>
                                            {COLUMN_FULL_NAMES[col.id] && (
                                                <span className="text-[10px] text-muted-foreground">
                                                    {COLUMN_FULL_NAMES[col.id]}
                                                </span>
                                            )}
                                        </div>
                                    </DropdownMenuCheckboxItem>
                                ))}
                                <DropdownMenuSeparator />
                                <DropdownMenuItem onClick={resetColumns} className="justify-center text-primary">
                                    Restaurar por defecto
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>

                        <Button
                            variant={showFilters ? "default" : "outline"}
                            size="sm"
                            onClick={() => setShowFilters(!showFilters)}
                            className="h-8"
                        >
                            <Filter className="h-3.5 w-3.5 mr-1" />
                            <span className="text-xs hidden sm:inline">Filtros</span>
                            {activeFiltersCount > 0 && (
                                <Badge variant="secondary" className="ml-1 h-4 px-1 text-[10px]">
                                    {activeFiltersCount}
                                </Badge>
                            )}
                        </Button>

                        <Sheet open={mobileFiltersOpen} onOpenChange={setMobileFiltersOpen}>
                            <SheetTrigger asChild>
                                <Button variant="outline" size="sm" className="h-8 sm:hidden relative">
                                    <Filter className="h-3.5 w-3.5" />
                                    {activeFiltersCount > 0 && (
                                        <span className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-primary text-[10px] text-primary-foreground flex items-center justify-center">
                                            {activeFiltersCount}
                                        </span>
                                    )}
                                </Button>
                            </SheetTrigger>
                            <SheetContent side="bottom" className="h-[85vh] rounded-t-xl">
                                <SheetHeader>
                                    <SheetTitle className="text-sm">Filtros</SheetTitle>
                                    <SheetDescription className="text-xs">
                                        Aplica filtros para refinar los resultados
                                    </SheetDescription>
                                </SheetHeader>
                                <div className="h-full mt-4 pr-4 overflow-y-auto">
                                    <MobileFiltersPanel
                                        filters={filters}
                                        updateFilter={updateFilter}
                                        resetFilters={resetFilters}
                                        estados={estados}
                                        analistas={analistas}
                                        etapas={etapas}
                                        origenes={origenes}
                                        destinos={destinos}
                                        productos={productos}
                                        onClose={() => setMobileFiltersOpen(false)}
                                    />
                                </div>
                            </SheetContent>
                        </Sheet>

                        <Button variant="outline" size="sm" onClick={refreshData} className="h-8">
                            <RefreshCw className="h-3.5 w-3.5 mr-1" />
                            <span className="text-xs hidden sm:inline">Actualizar</span>
                        </Button>
                    </div>
                </div>

                {showFilters && (
                    <div className="animate-in slide-in-from-top-2 duration-200">
                        <FiltersPanel
                            filters={filters}
                            updateFilter={updateFilter}
                            resetFilters={resetFilters}
                            hasActiveFilters={hasActiveFilters}
                            activeFiltersCount={activeFiltersCount}
                            estados={estados}
                            analistas={analistas}
                            etapas={etapas}
                            origenes={origenes}
                            destinos={destinos}
                            productos={productos}
                        />
                    </div>
                )}

                <div className="overflow-hidden rounded-lg border border-border bg-background shadow-sm">
                    <div className="overflow-x-auto">
                        <Table>
                            <TableHeader>
                                <TableRow className="bg-muted/30 text-xs">
                                    {visibleColumnsList.map((col) => {
                                        const isFixed = col.fixed;
                                        const leftOffset = isFixed ? getStickyLeft(col.id) : undefined;
                                        const fullName = COLUMN_FULL_NAMES[col.id];
                                        return (
                                            <TableHead
                                                key={col.id}
                                                className={`whitespace-nowrap px-1.5 py-1 ${isFixed ? 'sticky left-0 z-20 bg-muted/30 shadow-[2px_0_8px_-2px_rgba(0,0,0,0.1)] border-r border-border' : ''}`}
                                                style={{
                                                    minWidth: `${col.width}px`,
                                                    width: `${col.width}px`,
                                                    left: isFixed ? `${leftOffset}px` : undefined
                                                }}
                                                title={fullName || col.label}
                                            >
                                                {col.label}
                                            </TableHead>
                                        );
                                    })}
                                    <TableHead className="min-w-[40px] w-[40px] whitespace-nowrap bg-muted/30 px-0.5 py-0.5">Menú</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {analisis.data.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={visibleColumnsList.length + 1} className="py-8 text-center">
                                            <div className="flex flex-col items-center justify-center">
                                                <TestTube className="mb-3 h-12 w-12 text-muted-foreground/50" />
                                                <p className="mb-1 text-base font-medium text-foreground">
                                                    No se encontraron análisis de línea
                                                </p>
                                                <p className="text-sm text-muted-foreground">
                                                    {hasActiveFilters
                                                        ? 'Intenta ajustar los filtros para ver más resultados'
                                                        : 'No hay análisis de línea registrados en el sistema'}
                                                </p>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    analisis.data.map((analisisItem, index) => (
                                        <TableRow key={`${analisisItem.id}-${index}`} className="hover:bg-muted/50 transition-colors">
                                            {visibleColumnsList.map((col) => {
                                                const isFixed = col.fixed;
                                                const leftOffset = isFixed ? getStickyLeft(col.id) : undefined;
                                                return (
                                                    <TableCell
                                                        key={col.id}
                                                        className={`px-1.5 py-1 text-xs ${isFixed ? 'sticky left-0 z-10 bg-background shadow-[2px_0_8px_-2px_rgba(0,0,0,0.05)] border-r border-border' : ''}`}
                                                        style={{
                                                            minWidth: `${col.width}px`,
                                                            width: `${col.width}px`,
                                                            left: isFixed ? `${leftOffset}px` : undefined
                                                        }}
                                                    >
                                                        {renderCellValue(analisisItem, col.id)}
                                                    </TableCell>
                                                );
                                            })}
                                            <TableCell className="min-w-[40px] w-[40px] px-0.5 py-1 text-xs">
                                                <DropdownMenu>
                                                    <DropdownMenuTrigger asChild>
                                                        <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                                                            <MoreHorizontal className="h-3 w-3" />
                                                        </Button>
                                                    </DropdownMenuTrigger>
                                                    <DropdownMenuContent align="end" className="w-32">
                                                        <DropdownMenuItem onClick={() => router.visit(route('analisis-linea.show', analisisItem.id))}>
                                                            Ver detalles
                                                        </DropdownMenuItem>
                                                        {!estaCompletado(analisisItem) && hasPermission('u_analisisLinea') && (
                                                            <DropdownMenuItem onClick={() => handleAnalizar(analisisItem.id)}>
                                                                <Play className="mr-2 h-3 w-3" />
                                                                Iniciar Análisis
                                                            </DropdownMenuItem>
                                                        )}
                                                        {estaCompletado(analisisItem) && canDo(analisisItem, 'u_analisisLinea', 8) && (
                                                            <DropdownMenuItem onClick={() => handleEdit(analisisItem.id)}>
                                                                <Edit className="mr-2 h-3 w-3" />
                                                                Editar
                                                            </DropdownMenuItem>
                                                        )}
                                                        {canDo({ ...analisisItem, user_id: analisisItem.solicitante_id }, 'd_analisisLinea', 5, true, false, false) && (
                                                            <DropdownMenuItem onClick={() => handleDelete(analisisItem.id)} className="text-destructive">
                                                                <Trash2 className="mr-2 h-3 w-3" />
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

                    {analisis.data.length > 0 && (
                        <div className="border-t border-border px-2 py-1 text-xs">
                            <TablePagination
                                pagination={analisis}
                                onPageChange={(page) =>
                                    router.get(
                                        route('analisis-linea.index'),
                                        { ...filters, page },
                                        { preserveState: true, replace: true },
                                    )
                                }
                            />
                        </div>
                    )}
                </div>

                {analisis.data.length > 0 && (
                    <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2 text-xs text-muted-foreground">
                        <p>Total: {analisis.total} análisis de línea registrados</p>
                        <p>
                            Mostrando {analisis.data.length} de {analisis.total} registros
                        </p>
                    </div>
                )}
            </div>
        </AppLayout>
    );
}
