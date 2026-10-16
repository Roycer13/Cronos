import { Button } from '@/components/ui/button';
import FilterSelect from '@/components/ui/filter-select';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/hooks/useAuth';

import { Printer } from 'lucide-react';
import { PDFViewer } from '@react-pdf/renderer';
import ReporteControlVisitas from '@/pdf/ReporteControlVisitas';
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
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, router, usePage, useForm } from '@inertiajs/react';
import {
    Search, Filter, X, MoreHorizontal, Edit, CheckCircle, XCircle,
    Plus, Download, Calendar, Users, Clock, Building2, LogOut,
} from 'lucide-react';
import { route } from 'ziggy-js';
import { useState } from 'react';
import TablePagination from '@/components/ui/table-pagination';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Módulos Comunes', href: '/modulos-comunes' },
    { title: 'Control de Visitas', href: '/control-visitas' },
];

interface ControlVisita {
    id: number;
    nombre_visita: string;
    empresa_area_trabajo: string;
    fecha: string;
    fecha_entrada: string;
    fecha_salida: string | null;
    motivo: string;
    area_empresa: string;
    vestimenta: boolean;
    higiene: boolean;
    salud: boolean;
    epp_entregado: boolean;
    induccion: boolean;
    conforme: boolean;
    observaciones?: string;
    correcion?: string;
    supervisor: {
        id: number;
        name: string;
        apellido: string;
    };
    ubicacion: {
        id: number;
        nombre: string;
    };
}

interface PageProps {
    registros: {
        data: ControlVisita[];
        links: any[];
        current_page: number;
        last_page: number;
        per_page: number;
        total: number;
    };
    filters: {
        filtro_fecha_desde?: string;
        filtro_fecha_hasta?: string;
        filtro_nombre?: string;
        filtro_empresa?: string;
        filtro_conforme?: string;
        filtro_estado?: string;
    };
    flash: {
        success?: string;
        error?: string;
    };
}

function toLocalDatetimeInputValue(date: Date | string = new Date()): string {
    const rawDate = typeof date === 'string' ? new Date(date) : date;
    const localDate = new Date(rawDate.getTime() - rawDate.getTimezoneOffset() * 60000);
    return localDate.toISOString().slice(0, 16);
}

const CHECKLIST_ITEMS = [
    { key: 'vestimenta',    label: 'Vestimenta Adecuada',  description: 'Ropa apropiada para ingresar a las instalaciones.' },
    { key: 'higiene',       label: 'Higiene Personal',     description: 'Presentación e higiene personal correctas.' },
    { key: 'salud',         label: 'Estado de Salud',      description: 'Sin síntomas visibles de enfermedad.' },
    { key: 'epp_entregado', label: 'EPP Entregado',        description: 'Se entregó el equipo de protección personal requerido.' },
    { key: 'induccion',     label: 'Inducción Realizada',  description: 'Se realizó la inducción de seguridad correspondiente.' },
] as const;

type CheckKey = typeof CHECKLIST_ITEMS[number]['key'];

function calcularPorcentaje(registro: ControlVisita): number {
    const checks: boolean[] = [
        registro.vestimenta,
        registro.higiene,
        registro.salud,
        registro.epp_entregado,
        registro.induccion,
    ];
    return Math.round((checks.filter(Boolean).length / 5) * 100);
}

function formatFecha(fecha: string): string {
    return new Date(fecha).toLocaleDateString('es-ES', {
        day: '2-digit', month: '2-digit', year: 'numeric',
        hour: '2-digit', minute: '2-digit',
    });
}

function duracionTexto(entrada: string, salida: string | null): string {
    if (!salida) return '—';
    const mins = Math.round((new Date(salida).getTime() - new Date(entrada).getTime()) / 60000);
    if (mins < 60) return `${mins} min`;
    return `${Math.floor(mins / 60)}h ${mins % 60}min`;
}

function BarraCumplimiento({ porcentaje }: { porcentaje: number }) {
    const color =
        porcentaje >= 80 ? 'bg-green-500' :
        porcentaje >= 60 ? 'bg-yellow-500' : 'bg-red-500';
    return (
        <div className="flex flex-col items-center gap-1">
            <div className="w-full bg-muted rounded-full h-2 overflow-hidden">
                <div className={`h-2 rounded-full transition-all duration-300 ${color}`} style={{ width: `${porcentaje}%` }} />
            </div>
            <span className="text-sm font-medium">{porcentaje}%</span>
        </div>
    );
}

function BadgeEstado({ conforme }: { conforme: boolean }) {
    return (
        <Badge
            className={conforme
                ? 'bg-green-100 text-green-800 hover:bg-green-100 dark:bg-green-900/30 dark:text-green-400'
                : 'bg-red-100 text-red-800 hover:bg-red-100 dark:bg-red-900/30 dark:text-red-400'
            }
        >
            {conforme
                ? <><CheckCircle className="h-3 w-3 mr-1" />Conforme</>
                : <><XCircle className="h-3 w-3 mr-1" />No Conforme</>
            }
        </Badge>
    );
}

type FormData = {
    nombre_visita: string;
    empresa_area_trabajo: string;
    fecha: string;
    fecha_entrada: string;
    fecha_salida: string;
    motivo: string;
    area_empresa: string;
    vestimenta: boolean;
    higiene: boolean;
    salud: boolean;
    epp_entregado: boolean;
    induccion: boolean;
    observaciones: string;
    correcion: string;
};

function defaultForm(): FormData {
    const now = new Date().toISOString().slice(0, 16);
    return {
        nombre_visita: '',
        empresa_area_trabajo: '',
        fecha: toLocalDatetimeInputValue(),
        fecha_entrada: toLocalDatetimeInputValue(),
        fecha_salida: '',
        motivo: '',
        area_empresa: '',
        vestimenta: true,
        higiene: true,
        salud: true,
        epp_entregado: true,
        induccion: true,
        observaciones: '',
        correcion: '',
    };
}

function ChecklistEvaluacion({
    data,
    setData,
}: {
    data: FormData;
    setData: (key: keyof FormData, value: any) => void;
}) {
    return (
        <div className="space-y-3">
            <h3 className="font-medium text-foreground">Checklist de Evaluación</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {CHECKLIST_ITEMS.map((item) => (
                    <div key={item.key} className="border rounded-lg p-4 space-y-2">
                        <div className="flex items-center justify-between">
                            <Label htmlFor={item.key} className="font-medium">{item.label}</Label>
                            <Checkbox
                                id={item.key}
                                checked={data[item.key] as boolean}
                                onCheckedChange={(checked) => setData(item.key, checked as boolean)}
                                className="h-5 w-5"
                            />
                        </div>
                        <p className="text-sm text-muted-foreground">{item.description}</p>
                    </div>
                ))}
            </div>
        </div>
    );
}

function PreviewResultado({ data }: { data: FormData }) {
    const checks = [data.vestimenta, data.higiene, data.salud, data.epp_entregado, data.induccion];
    const cumplidos = checks.filter(Boolean).length;
    const conforme = cumplidos === 5;
    const porcentaje = Math.round((cumplidos / 5) * 100);

    return (
        <div className="bg-muted/30 p-4 rounded-lg">
            <h4 className="font-medium text-foreground mb-2">Resultado de Evaluación</h4>
            <div className="flex items-center justify-between">
                <div className="space-y-1">
                    <p className="text-sm text-muted-foreground">La visita será marcada como:</p>
                    <div className="flex items-center gap-2">
                        <Badge className={conforme
                            ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
                            : 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'
                        }>
                            {conforme ? 'CONFORME' : 'NO CONFORME'}
                        </Badge>
                        <span className="text-sm">({cumplidos}/5 criterios cumplidos)</span>
                    </div>
                </div>
                <div className="text-right">
                    <p className="text-sm text-muted-foreground">Cumplimiento</p>
                    <p className="text-2xl font-bold">{porcentaje}%</p>
                </div>
            </div>
        </div>
    );
}

export default function Index() {
    const { props } = usePage();
    const [showFilters, setShowFilters] = useState(false);
    const [createOpen, setCreateOpen] = useState(false);
    const [editOpen, setEditOpen]     = useState(false);
    const [deleteOpen, setDeleteOpen] = useState(false);
    const [salidaOpen, setSalidaOpen] = useState(false);
    const [selected, setSelected]     = useState<ControlVisita | null>(null);


    
const [fechaDesde, setFechaDesde] = useState<string>('');
const [fechaHasta, setFechaHasta] = useState<string>('');
const [datosPdf, setDatosPdf] = useState<any>(null);
const [mostrarPdf, setMostrarPdf] = useState(false);
const [generandoPdf, setGenerandoPdf] = useState(false);
const urlPdf = route('control-visitas.pdf');


 const {
        hasPermission,
        belongsToUbicacion,
        canDo,
        user: authUser,
    } = useAuth();

    const {
        registros = { data: [], links: [], current_page: 1, last_page: 1, per_page: 10, total: 0 },
        filters: initialFilters = {},
        flash,
    } = props as unknown as PageProps;

    const { filters, updateFilter, resetFilters } = useAdvancedFilters({
        routeName: 'control-visitas.index',
        initialFilters: {
            filtro_fecha_desde: initialFilters.filtro_fecha_desde || undefined,
            filtro_fecha_hasta: initialFilters.filtro_fecha_hasta || undefined,
            filtro_nombre:      initialFilters.filtro_nombre      || undefined,
            filtro_empresa:     initialFilters.filtro_empresa     || undefined,
            filtro_conforme:    initialFilters.filtro_conforme    || undefined,
            filtro_estado:      initialFilters.filtro_estado      || undefined,
            per_page: '10',
        },
        debounceFields: ['filtro_nombre', 'filtro_empresa'],
        debounceDelay: 500,
    });

    const { data, setData, post, put, processing, errors, reset } = useForm<FormData>(defaultForm());

    const hasActiveFilters = Object.entries(filters).some(
        ([k, v]) => v && v !== '' && v !== '10'
    );

    const handleCreate = () => {
        reset();
        setCreateOpen(true);
    };

    const handleEdit = (v: ControlVisita) => {
        setSelected(v);
        setData({
            nombre_visita:        v.nombre_visita,
            empresa_area_trabajo: v.empresa_area_trabajo,
            fecha:                toLocalDatetimeInputValue(v.fecha),
            fecha_entrada:        toLocalDatetimeInputValue(v.fecha_entrada),
            fecha_salida:         v.fecha_salida ? toLocalDatetimeInputValue(v.fecha_salida) : '',
            motivo:               v.motivo,
            area_empresa:         v.area_empresa,
            vestimenta:           v.vestimenta,
            higiene:              v.higiene,
            salud:                v.salud,
            epp_entregado:        v.epp_entregado,
            induccion:            v.induccion,
            observaciones:        v.observaciones || '',
            correcion:            v.correcion || '',
        });
        setEditOpen(true);
    };

    const handleDelete = (v: ControlVisita) => { setSelected(v); setDeleteOpen(true); };
    const handleSalida = (v: ControlVisita) => { setSelected(v); setSalidaOpen(true); };

    const confirmDelete = () => {
        if (!selected) return;
        router.delete(route('control-visitas.destroy', selected.id), {
            preserveScroll: true,
            onSuccess: () => { setDeleteOpen(false); setSelected(null); },
        });
    };

    const fetchDatosPdf = async () => {
    if (!fechaDesde || !fechaHasta) throw new Error('Selecciona ambas fechas');
    const params = new URLSearchParams();
    params.append('fecha_desde', fechaDesde);
    params.append('fecha_hasta', fechaHasta);

    const response = await fetch(`${urlPdf}?${params.toString()}`);
    if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText.substring(0, 500));
    }
    return await response.json();
};

const handleMostrarPdf = async () => {
    setGenerandoPdf(true);
    try {
        const data = await fetchDatosPdf();
        if (!data.datos || data.datos.length === 0) {
            alert('No hay visitas en el rango de fechas seleccionado');
            return;
        }
        setDatosPdf(data);
        setMostrarPdf(true);
    } catch (error: any) {
        console.error(error);
        alert('Error al generar el reporte: ' + error.message);
    } finally {
        setGenerandoPdf(false);
    }
};
    const confirmSalida = () => {
        if (!selected) return;
        router.post(route('control-visitas.registrar-salida', selected.id), {}, {
            preserveScroll: true,
            onSuccess: () => { setSalidaOpen(false); setSelected(null); },
        });
    };

    const submitCreate = (e: React.FormEvent) => {
        e.preventDefault();
        post(route('control-visitas.store'), {
            onSuccess: () => { setCreateOpen(false); reset(); },
        });
    };

    const submitEdit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!selected) return;
        put(route('control-visitas.update', selected.id), {
            onSuccess: () => { setEditOpen(false); reset(); setSelected(null); },
        });
    };

    const conformesCount    = registros.data.filter(r => r.conforme).length;
    const activasCount      = registros.data.filter(r => !r.fecha_salida).length;
    const porcentajeTotal   = registros.data.length > 0
        ? Math.round((conformesCount / registros.data.length) * 100)
        : 0;

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Control de Visitas" />
            <div className="px-2 sm:px-6 py-4 space-y-4">
                <Toast />

                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div>
                        <h1 className="text-2xl font-bold text-foreground">Control de Visitas</h1>
                        <p className="text-muted-foreground mt-1">
                            Registro y seguimiento de visitantes en las instalaciones
                        </p>
                    </div>
                    <div className="flex flex-wrap gap-2">
                        {hasPermission('c_controlVisitas') && (
                        <Button onClick={handleCreate} className="flex items-center gap-2">
                            <Plus className="h-4 w-4" />
                            <span className="hidden sm:inline">Nueva Visita</span>
                            <span className="sm:hidden">Nueva</span>
                        </Button>
                        )}
                    </div>
                </div>

                {/* Estadísticas */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                    <Card className="p-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-muted-foreground">Total Visitas</p>
                                <p className="text-2xl font-bold mt-1">{registros.total}</p>
                            </div>
                            <div className="bg-primary/10 p-3 rounded-full">
                                <Calendar className="h-6 w-6 text-primary" />
                            </div>
                        </div>
                    </Card>

                    <Card className="p-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-muted-foreground">En Instalaciones</p>
                                <p className="text-2xl font-bold mt-1 text-blue-600">{activasCount}</p>
                            </div>
                            <div className="bg-blue-100 dark:bg-blue-900/30 p-3 rounded-full">
                                <Users className="h-6 w-6 text-blue-600" />
                            </div>
                        </div>
                    </Card>

                    <Card className="p-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-muted-foreground">Conformes</p>
                                <p className="text-2xl font-bold mt-1 text-green-600">{conformesCount}</p>
                            </div>
                            <div className="bg-green-100 dark:bg-green-900/30 p-3 rounded-full">
                                <CheckCircle className="h-6 w-6 text-green-600" />
                            </div>
                        </div>
                    </Card>

                    <Card className="p-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-muted-foreground">% Conformidad</p>
                                <p className="text-2xl font-bold mt-1">{porcentajeTotal}%</p>
                            </div>
                            <div className="bg-amber-100 dark:bg-amber-900/30 p-3 rounded-full">
                                <Building2 className="h-6 w-6 text-amber-600" />
                            </div>
                        </div>
                    </Card>
                </div>

                {/* Filtros */}
                <Card>
                    <div className="p-4 border-b">
                        <div className="flex items-center justify-between">
                            <h3 className="font-semibold text-foreground">Filtros</h3>
                            <div className="flex items-center gap-2">
                                {hasActiveFilters && (
                                    <Button variant="ghost" size="sm" onClick={resetFilters} className="text-xs h-8">
                                        <X className="h-4 w-4 mr-1" />Limpiar
                                    </Button>
                                )}
                                <Button variant="ghost" size="sm" onClick={() => setShowFilters(!showFilters)} className="h-8">
                                    <Filter className="h-4 w-4 mr-2" />
                                    {showFilters ? 'Ocultar' : 'Mostrar'}
                                </Button>
                            </div>
                        </div>
                    </div>

                    {showFilters && (
                        <div className="p-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                <div className="space-y-2">
                                    <Label>Fecha Desde</Label>
                                    <Input type="date" value={filters.filtro_fecha_desde || ''}
                                        onChange={(e) => updateFilter('filtro_fecha_desde', e.target.value)} />
                                </div>
                                <div className="space-y-2">
                                    <Label>Fecha Hasta</Label>
                                    <Input type="date" value={filters.filtro_fecha_hasta || ''}
                                        onChange={(e) => updateFilter('filtro_fecha_hasta', e.target.value)} />
                                </div>
                                <div className="space-y-2">
                                    <Label>Nombre Visitante</Label>
                                    <div className="relative">
                                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                        <Input className="pl-9" placeholder="Buscar por nombre..."
                                            value={filters.filtro_nombre || ''}
                                            onChange={(e) => updateFilter('filtro_nombre', e.target.value)} />
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <Label>Empresa</Label>
                                    <Input placeholder="Buscar por empresa..."
                                        value={filters.filtro_empresa || ''}
                                        onChange={(e) => updateFilter('filtro_empresa', e.target.value)} />
                                </div>
                                <div className="space-y-2">
                                    <Label>Estado de Evaluación</Label>
                                    <FilterSelect
                                        value={filters.filtro_conforme}
                                        onChange={(v) => updateFilter('filtro_conforme', v)}
                                        placeholder="Todos"
                                        options={[
                                            { value: '1', label: 'Conforme' },
                                            { value: '0', label: 'No Conforme' },
                                        ]}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label>Estado de Visita</Label>
                                    <FilterSelect
                                        value={filters.filtro_estado}
                                        onChange={(v) => updateFilter('filtro_estado', v)}
                                        placeholder="Todas"
                                        options={[
                                            { value: 'activa',     label: 'En instalaciones' },
                                            { value: 'finalizada', label: 'Finalizada' },
                                        ]}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label>Por página</Label>
                                    <FilterSelect
                                        value={filters.per_page}
                                        onChange={(v) => updateFilter('per_page', v)}
                                        placeholder="10 por página"
                                        includeAllOption={false}
                                        options={['10', '25', '50', '100'].map(v => ({ value: v, label: `${v} por página` }))}
                                    />
                                </div>
                            </div>
                        </div>
                    )}
                </Card>

                {/* Tabla */}
                <Card>
                    <div className="overflow-x-auto">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Visitante</TableHead>
                                    <TableHead>Empresa / Área</TableHead>
                                    <TableHead>Motivo</TableHead>
                                    <TableHead>Entrada</TableHead>
                                    <TableHead>Salida / Duración</TableHead>
                                    <TableHead className="text-center">Cumplimiento</TableHead>
                                    <TableHead className="text-center">Estado</TableHead>
                                    <TableHead>Supervisor</TableHead>
                                    <TableHead>Observaciones</TableHead>
                                    <TableHead>Correcciones</TableHead>
                                    <TableHead className="w-[80px]">Acciones</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {registros.data.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={9} className="text-center py-12 text-muted-foreground">
                                            <div className="flex flex-col items-center">
                                                <Users className="h-12 w-12 opacity-30 mb-3" />
                                                <p className="text-lg font-medium text-foreground mb-1">
                                                    No se encontraron visitas
                                                </p>
                                                <p>
                                                    {hasActiveFilters
                                                        ? 'Intenta ajustar los filtros para ver más resultados'
                                                        : 'Aún no hay visitas registradas'}
                                                </p>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    registros.data.map((v) => (
                                        <TableRow key={v.id} className="hover:bg-muted/50">
                                            <TableCell>
                                                <div className="font-medium">{v.nombre_visita}</div>
                                                    <span className="text-xs text-muted-foreground">{v.area_empresa}</span>
                                            </TableCell>

                                            <TableCell>
                                                <div className="flex flex-col gap-1">
                                                    <Badge variant="outline" className="w-fit text-xs">
                                                        <Building2 className="h-3 w-3 mr-1" />
                                                        {v.empresa_area_trabajo}
                                                    </Badge>
                                                </div>
                                            </TableCell>

                                            <TableCell>
                                                <div className="max-w-[160px] truncate text-sm">{v.motivo}</div>
                                            </TableCell>

                                            <TableCell>
                                                <div className="text-sm whitespace-nowrap">{formatFecha(v.fecha_entrada)}</div>
                                            </TableCell>

                                            <TableCell>
                                                {v.fecha_salida ? (
                                                    <div className="flex flex-col gap-1">
                                                        <span className="text-sm whitespace-nowrap">{formatFecha(v.fecha_salida)}</span>
                                                        <Badge variant="outline" className="w-fit text-xs">
                                                            <Clock className="h-3 w-3 mr-1" />
                                                            {duracionTexto(v.fecha_entrada, v.fecha_salida)}
                                                        </Badge>
                                                    </div>
                                                ) : (
                                                    <Badge className="bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400 w-fit">
                                                        En instalaciones
                                                    </Badge>
                                                )}
                                            </TableCell>

                                            <TableCell className="min-w-[100px]">
                                                <BarraCumplimiento porcentaje={calcularPorcentaje(v)} />
                                            </TableCell>

                                            <TableCell>
                                                <div className="flex justify-center">
                                                    <BadgeEstado conforme={v.conforme} />
                                                </div>
                                            </TableCell>

                                            <TableCell>
                                                <div className="text-sm">
                                                    {v.supervisor.name} {v.supervisor.apellido}
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <div className="max-w-xs truncate">
                                                    {v.observaciones || 'Sin observaciones'}
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <div className="max-w-xs truncate">
                                                    {v.correcion || 'Sin correcciones'}
                                                </div>
                                            </TableCell>


                                            <TableCell>
                                                <DropdownMenu>
                                                    <DropdownMenuTrigger asChild>
                                                        <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                                                            <MoreHorizontal className="h-4 w-4" />
                                                            <span className="sr-only">Abrir menú</span>
                                                        </Button>
                                                    </DropdownMenuTrigger>
                                                    <DropdownMenuContent align="end" className="w-52">
                                                        {!v.fecha_salida && (
                                                            <DropdownMenuItem onClick={() => handleSalida(v)}>
                                                                <LogOut className="mr-2 h-4 w-4 text-blue-600" />
                                                                Registrar salida
                                                            </DropdownMenuItem>
                                                        )}
                                                        <DropdownMenuItem onClick={() => handleEdit(v)}>
                                                            <Edit className="mr-2 h-4 w-4" />
                                                            Editar visita
                                                        </DropdownMenuItem>
                                                        <DropdownMenuItem
                                                            onClick={() => handleDelete(v)}
                                                            className="text-destructive focus:text-destructive"
                                                        >
                                                            <XCircle className="mr-2 h-4 w-4" />
                                                            Eliminar visita
                                                        </DropdownMenuItem>
                                                    </DropdownMenuContent>
                                                </DropdownMenu>
                                            </TableCell>
                                        </TableRow>
                                    ))
                                )}
                            </TableBody>
                        </Table>
                    </div>

                    {registros.data.length > 0 && (
                        <div className="border-t px-4 py-3">
                            <TablePagination
                                pagination={registros}
                                onPageChange={(page) =>
                                    router.get(
                                        route('control-visitas.index'),
                                        { ...filters, page },
                                        { preserveState: true, replace: true }
                                    )
                                }
                            />
                        </div>
                    )}
                </Card>

                <div className="flex justify-between items-center text-sm text-muted-foreground">
                    <span>{registros.total} visitas en total</span>
                    {registros.data.length > 0 && (
                        <span>Mostrando {registros.data.length} de {registros.total}</span>
                    )}
                </div>

      <div className="rounded-lg border border-border bg-muted/50 p-4 mt-4">
    <h3 className="mb-3 font-semibold text-foreground">Generar Reporte PDF</h3>
    <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
        <div>
            <label className="mb-1 block text-sm font-medium">Fecha Desde</label>
            <Input
                type="date"
                value={fechaDesde}
                onChange={(e) => setFechaDesde(e.target.value)}
            />
        </div>
        <div>
            <label className="mb-1 block text-sm font-medium">Fecha Hasta</label>
            <Input
                type="date"
                value={fechaHasta}
                onChange={(e) => setFechaHasta(e.target.value)}
            />
        </div>
    </div>
    <div className="flex justify-end mt-3">
        <Button
            variant="default"
            size="sm"
            onClick={handleMostrarPdf}
            disabled={generandoPdf}
            className="flex items-center gap-2"
        >
            <Printer className="h-4 w-4" />
            {generandoPdf ? 'Generando...' : 'Generar Reporte PDF'}
        </Button>
    </div>
</div>
            </div>

            {/* ─── Modal Crear ────────────────────────────────── */}
            <Dialog open={createOpen} onOpenChange={setCreateOpen}>
                <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                            <Users className="h-5 w-5 text-blue-600" />
                            Nueva Visita
                        </DialogTitle>
                        <DialogDescription>
                            Complete el formulario para registrar el ingreso de un visitante.
                        </DialogDescription>
                    </DialogHeader>

                    <form onSubmit={submitCreate} className="space-y-6">
                        {/* Datos del visitante */}
                        <div className="space-y-3">
                            <h3 className="font-medium text-foreground">Datos del Visitante</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="nombre_visita">Nombre completo *</Label>
                                    <Input
                                        id="nombre_visita"
                                        value={data.nombre_visita}
                                        onChange={(e) => setData('nombre_visita', e.target.value)}
                                        placeholder="Nombre del visitante"
                                        error={errors.nombre_visita}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="empresa_area_trabajo">Empresa / Área de trabajo *</Label>
                                    <Input
                                        id="empresa_area_trabajo"
                                        value={data.empresa_area_trabajo}
                                        onChange={(e) => setData('empresa_area_trabajo', e.target.value)}
                                        placeholder="Empresa u organización"
                                        error={errors.empresa_area_trabajo}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="motivo">Motivo de la visita *</Label>
                                    <Input
                                        id="motivo"
                                        value={data.motivo}
                                        onChange={(e) => setData('motivo', e.target.value)}
                                        placeholder="Ej: Reunión, mantenimiento, auditoría..."
                                        error={errors.motivo}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="area_empresa">Cedula de identidad *</Label>
                                    <Input
                                        id="area_empresa"
                                        value={data.area_empresa}
                                        onChange={(e) => setData('area_empresa', e.target.value)}
                                        placeholder="Número de cédula de identidad"
                                        error={errors.area_empresa}
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Fechas */}
                        <div className="space-y-3">
                            <h3 className="font-medium text-foreground">Registro de Horarios</h3>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="fecha">Fecha de registro *</Label>
                                    <Input
                                        id="fecha"
                                        type="datetime-local"
                                        value={data.fecha}
                                        onChange={(e) => setData('fecha', e.target.value)}
                                        error={errors.fecha}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="fecha_entrada">Hora de entrada *</Label>
                                    <Input
                                        id="fecha_entrada"
                                        type="datetime-local"
                                        value={data.fecha_entrada}
                                        onChange={(e) => setData('fecha_entrada', e.target.value)}
                                        error={errors.fecha_entrada}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="fecha_salida">Hora de salida</Label>
                                    <Input
                                        id="fecha_salida"
                                        type="datetime-local"
                                        value={data.fecha_salida}
                                        onChange={(e) => setData('fecha_salida', e.target.value)}
                                        error={errors.fecha_salida}
                                    />
                                    <p className="text-xs text-muted-foreground">Dejar vacío si el visitante aún está en instalaciones.</p>
                                </div>
                            </div>
                        </div>

                        <ChecklistEvaluacion data={data} setData={setData} />

                        {/* Observaciones */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="observaciones">Observaciones</Label>
                                <Textarea
                                    id="observaciones"
                                    value={data.observaciones}
                                    onChange={(e) => setData('observaciones', e.target.value)}
                                    placeholder="Observaciones adicionales..."
                                    rows={3}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="correcion">Acciones Correctivas</Label>
                                <Textarea
                                    id="correcion"
                                    value={data.correcion}
                                    onChange={(e) => setData('correcion', e.target.value)}
                                    placeholder="Acciones a tomar en caso de no conformidad..."
                                    rows={3}
                                />
                            </div>
                        </div>

                        <PreviewResultado data={data} />

                        <DialogFooter>
                            <Button type="button" variant="outline" onClick={() => setCreateOpen(false)} disabled={processing}>
                                Cancelar
                            </Button>
                            <Button type="submit" disabled={processing}>
                                {processing ? 'Guardando...' : 'Registrar Visita'}
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>

            {/* ─── Modal Editar ───────────────────────────────── */}
            <Dialog open={editOpen} onOpenChange={setEditOpen}>
                <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                            <Edit className="h-5 w-5 text-blue-600" />
                            Editar Visita
                        </DialogTitle>
                        <DialogDescription>
                            Modifique los datos del registro de visita.
                        </DialogDescription>
                    </DialogHeader>

                    {selected && (
                        <form onSubmit={submitEdit} className="space-y-6">
                            <div className="space-y-3">
                                <h3 className="font-medium text-foreground">Datos del Visitante</h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label>Nombre completo *</Label>
                                        <Input
                                            value={data.nombre_visita}
                                            onChange={(e) => setData('nombre_visita', e.target.value)}
                                            error={errors.nombre_visita}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label>Empresa / Área de trabajo *</Label>
                                        <Input
                                            value={data.empresa_area_trabajo}
                                            onChange={(e) => setData('empresa_area_trabajo', e.target.value)}
                                            error={errors.empresa_area_trabajo}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label>Motivo de la visita *</Label>
                                        <Input
                                            value={data.motivo}
                                            onChange={(e) => setData('motivo', e.target.value)}
                                            error={errors.motivo}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label>Área a visitar *</Label>
                                        <Input
                                            value={data.area_empresa}
                                            onChange={(e) => setData('area_empresa', e.target.value)}
                                            error={errors.area_empresa}
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-3">
                                <h3 className="font-medium text-foreground">Registro de Horarios</h3>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                    <div className="space-y-2">
                                        <Label>Fecha de registro *</Label>
                                        <Input type="datetime-local" value={data.fecha}
                                            onChange={(e) => setData('fecha', e.target.value)} error={errors.fecha} />
                                    </div>
                                    <div className="space-y-2">
                                        <Label>Hora de entrada *</Label>
                                        <Input type="datetime-local" value={data.fecha_entrada}
                                            onChange={(e) => setData('fecha_entrada', e.target.value)} error={errors.fecha_entrada} />
                                    </div>
                                    <div className="space-y-2">
                                        <Label>Hora de salida</Label>
                                        <Input type="datetime-local" value={data.fecha_salida}
                                            onChange={(e) => setData('fecha_salida', e.target.value)} error={errors.fecha_salida} />
                                    </div>
                                </div>
                            </div>

                            <ChecklistEvaluacion data={data} setData={setData} />

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label>Observaciones</Label>
                                    <Textarea value={data.observaciones}
                                        onChange={(e) => setData('observaciones', e.target.value)} rows={3} />
                                </div>
                                <div className="space-y-2">
                                    <Label>Acciones Correctivas</Label>
                                    <Textarea value={data.correcion}
                                        onChange={(e) => setData('correcion', e.target.value)} rows={3} />
                                </div>
                            </div>

                            <PreviewResultado data={data} />

                            <DialogFooter>
                                <Button type="button" variant="outline" onClick={() => setEditOpen(false)} disabled={processing}>
                                    Cancelar
                                </Button>
                                <Button type="submit" disabled={processing}>
                                    {processing ? 'Guardando...' : 'Actualizar Visita'}
                                </Button>
                            </DialogFooter>
                        </form>
                    )}
                </DialogContent>
            </Dialog>

            {/* ─── Dialog Registrar Salida ─────────────────────── */}
            <Dialog open={salidaOpen} onOpenChange={setSalidaOpen}>
                <DialogContent className="max-w-md">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                            <LogOut className="h-5 w-5 text-blue-600" />
                            Registrar Salida
                        </DialogTitle>
                        <DialogDescription>
                            Se registrará la salida con la hora actual.
                        </DialogDescription>
                    </DialogHeader>

                    {selected && (
                        <div className="bg-muted/30 p-4 rounded-lg space-y-2">
                            <div className="font-medium">{selected.nombre_visita}</div>
                            <div className="text-sm text-muted-foreground">{selected.empresa_area_trabajo}</div>
                            <div className="text-sm text-muted-foreground">
                                Ingresó: {formatFecha(selected.fecha_entrada)}
                            </div>
                        </div>
                    )}

                    <DialogFooter>
                        <Button variant="outline" onClick={() => setSalidaOpen(false)}>Cancelar</Button>
                        <Button onClick={confirmSalida}>Confirmar Salida</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* ─── Dialog Eliminar ────────────────────────────── */}
            <Dialog open={deleteOpen} onOpenChange={setDeleteOpen}>
                <DialogContent className="max-w-md">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                            <XCircle className="h-5 w-5 text-red-600" />
                            Confirmar Eliminación
                        </DialogTitle>
                        <DialogDescription>
                            Esta acción no se puede deshacer.
                        </DialogDescription>
                    </DialogHeader>

                    {selected && (
                        <div className="bg-muted/30 p-4 rounded-lg space-y-2">
                            <div className="font-medium">{selected.nombre_visita}</div>
                            <div className="text-sm text-muted-foreground">{selected.empresa_area_trabajo}</div>
                            <div className="text-sm text-muted-foreground">
                                Fecha: {formatFecha(selected.fecha_entrada)}
                            </div>
                            <div className="flex items-center gap-2 text-sm">
                                Estado: <BadgeEstado conforme={selected.conforme} />
                            </div>
                        </div>
                    )}

                    <DialogFooter>
                        <Button variant="outline" onClick={() => setDeleteOpen(false)}>Cancelar</Button>
                        <Button variant="destructive" onClick={confirmDelete}>Eliminar Visita</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {mostrarPdf && datosPdf && (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80">
        <div className="relative h-[95vh] w-[95vw] overflow-hidden rounded-lg bg-white shadow-2xl">
            <button
                className="absolute top-4 right-4 z-50 flex h-8 w-8 items-center justify-center rounded-full bg-red-600 text-white hover:bg-red-700"
                onClick={() => setMostrarPdf(false)}
            >
                <X className="h-5 w-5" />
            </button>
            <div className="absolute top-0 right-0 left-0 z-40 flex items-center justify-between bg-gray-100 px-4 py-3">
                <div>
                    <h3 className="text-lg font-semibold text-gray-800">Reporte de Control de Visitas</h3>
                    <p className="text-sm text-gray-600">
                        {fechaDesde} al {fechaHasta}
                    </p>
                    <p className="text-xs text-gray-500">
                        Total: {datosPdf.resumen?.total || 0} | Conformes: {datosPdf.resumen?.conformes || 0} | En instalaciones: {datosPdf.resumen?.activas || 0}
                    </p>
                </div>
            </div>
            <div className="h-full pt-14">
                <PDFViewer style={{ width: '100%', height: '100%', border: 'none' }}>
                    <ReporteControlVisitas data={datosPdf} />
                </PDFViewer>
            </div>
        </div>
    </div>
)}
        </AppLayout>
    );
}
