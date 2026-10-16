import { Button } from '@/components/ui/button';
import FilterSelect from '@/components/ui/filter-select';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Printer } from 'lucide-react';
import { PDFViewer } from '@react-pdf/renderer';
import ReporteHigienePersonal from '@/pdf/ReporteHigienePersonal';
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
import { Head, router, usePage, useForm } from '@inertiajs/react';
import { Search, Filter, X, MoreHorizontal, Edit, User, CheckCircle, XCircle, Plus, Download, Calendar, Users, Building, Clock } from 'lucide-react';
import { route } from 'ziggy-js';
import { useState, useEffect } from 'react';

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
import FormInput from '@/components/ui/form-input';
import FormSelect from '@/components/ui/form-select';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Módulos Comunes', href: '/modulos-comunes' },
    { title: 'Higiene Personal', href: '/modulos-comunes/higiene-personal' },
];

interface HigienePersonal {
    id: number;
    fecha: string;
    uniforme: boolean;
    limpieza: boolean;
    lavado_manos: boolean;
    salud: boolean;
    epp: boolean;
    objetos: boolean;
    material_equipo: boolean;
    conforme: boolean;
    observaciones?: string;
    correccion?: string;
    empleado: {
        id: number;
        name: string;
        apellido: string;
        codigo: number;
        cargo: string;
        turno: string;
        area?: {
            nombre: string;
        };
    };
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
        data: HigienePersonal[];
        links: any[];
        current_page: number;
        last_page: number;
        per_page: number;
        total: number;
    };
    empleados: Array<{
        id: number;
        name: string;
        apellido: string;
        codigo: number;
        area_id?: number;
        turno?: string;
        cargo?: string;
    }>;
    areas: Array<{ id: number; nombre: string }>;
    turnos: string[];
    filters: {
        filtro_fecha_desde?: string;
        filtro_fecha_hasta?: string;
        filtro_empleado?: string;
        filtro_conforme?: string;
        filtro_area?: string;
        filtro_turno?: string;
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

export default function Index() {
    const { props } = usePage();
    const [showFilters, setShowFilters] = useState(false);
    const [createModalOpen, setCreateModalOpen] = useState(false);
    const [editModalOpen, setEditModalOpen] = useState(false);
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [selectedRegistro, setSelectedRegistro] = useState<HigienePersonal | null>(null);
    const [busquedaEmpleado, setBusquedaEmpleado] = useState('');
    const [empleadosFiltrados, setEmpleadosFiltrados] = useState<any[]>([]);
    const [filtroArea, setFiltroArea] = useState<string>('');
    const [filtroTurno, setFiltroTurno] = useState<string>('');
    const [semanaInicio, setSemanaInicio] = useState<string>('');
    const [turno, setTurno] = useState<string>('');
    const [datosPdf, setDatosPdf] = useState<any>(null);
    const [mostrarPdf, setMostrarPdf] = useState(false);
    const [generandoPdf, setGenerandoPdf] = useState(false);
    const urlPdf = route('higiene-personal.pdf');

    const {
        hasPermission,
        belongsToUbicacion,
        canDo,
        user: authUser,
    } = useAuth();

    const {
        registros = {
            data: [],
            links: [],
            current_page: 1,
            last_page: 1,
            per_page: 10,
            total: 0,
        },
        empleados = [],
        areas = [],
        turnos = [],
        filters: initialFilters = {},
        flash,
    } = props as unknown as PageProps;

    const { filters, updateFilter, resetFilters } = useAdvancedFilters({
        routeName: 'higiene-personal.index',
        initialFilters: {
            filtro_fecha_desde: initialFilters.filtro_fecha_desde || undefined,
            filtro_fecha_hasta: initialFilters.filtro_fecha_hasta || undefined,
            filtro_empleado: initialFilters.filtro_empleado || undefined,
            filtro_conforme: initialFilters.filtro_conforme || undefined,
            filtro_area: initialFilters.filtro_area || undefined,
            filtro_turno: initialFilters.filtro_turno || undefined,
            per_page: '10',
        },
        debounceFields: [],
        debounceDelay: 600,
    });

    // Formulario para crear/editar
    const { data, setData, post, put, processing, errors, reset } = useForm({
        empleado_id: '',
        fecha: toLocalDatetimeInputValue(),
        uniforme: true,
        limpieza: true,
        lavado_manos: true,
        salud: true,
        epp: true,
        objetos: true,
        material_equipo: true,
        observaciones: '',
        correccion: '',
    });

    const hasActiveFilters = Object.values(filters).some(
        (value) => value && value !== '' && value !== '10'
    );

    // Filtrar empleados localmente para búsqueda
    useEffect(() => {
        let resultados = empleados;

        if (busquedaEmpleado) {
            const busqueda = busquedaEmpleado.toLowerCase();
            resultados = resultados.filter(emp =>
                emp.name.toLowerCase().includes(busqueda) ||
                emp.apellido?.toLowerCase().includes(busqueda) ||
                emp.codigo?.toString().includes(busqueda) ||
                emp.cargo?.toLowerCase().includes(busqueda)
            );
        }

        if (filtroArea) {
            resultados = resultados.filter(emp => emp.area_id?.toString() === filtroArea);
        }

        if (filtroTurno) {
            resultados = resultados.filter(emp => emp.turno === filtroTurno);
        }

        setEmpleadosFiltrados(resultados.slice(0, 10)); // Limitar a 10 resultados
    }, [busquedaEmpleado, filtroArea, filtroTurno, empleados]);

    const handleCreate = () => {
        setData({
            empleado_id: '',
            fecha: toLocalDatetimeInputValue(),
            uniforme: true,
            limpieza: true,
            lavado_manos: true,
            salud: true,
            epp: true,
            objetos: true,
            material_equipo: true,
            observaciones: '',
            correccion: '',
        });
        setBusquedaEmpleado('');
        setFiltroArea('');
        setFiltroTurno('');
        setEmpleadosFiltrados(empleados.slice(0, 10));
        setCreateModalOpen(true);
    };

    const handleEdit = (registro: HigienePersonal) => {
        setSelectedRegistro(registro);
        setData({
            empleado_id: registro.empleado.id.toString(),
            fecha: toLocalDatetimeInputValue(registro.fecha),
            uniforme: registro.uniforme,
            limpieza: registro.limpieza,
            lavado_manos: registro.lavado_manos,
            salud: registro.salud,
            epp: registro.epp,
            objetos: registro.objetos,
            material_equipo: registro.material_equipo,
            observaciones: registro.observaciones || '',
            correccion: registro.correccion || '',
        });
        setEditModalOpen(true);
    };

    const handleDelete = (registro: HigienePersonal) => {
        setSelectedRegistro(registro);
        setDeleteDialogOpen(true);
    };

    const confirmDelete = () => {
        if (selectedRegistro) {
            router.delete(route('higiene-personal.destroy', selectedRegistro.id), {
                preserveScroll: true,
                onSuccess: () => {
                    setDeleteDialogOpen(false);
                    setSelectedRegistro(null);
                },
            });
        }
    };

    const submitCreate = (e: React.FormEvent) => {
        e.preventDefault();
        post(route('higiene-personal.store'), {
            onSuccess: () => {
                setCreateModalOpen(false);
                reset();
            },
        });
    };

    const submitEdit = (e: React.FormEvent) => {
        e.preventDefault();
        if (selectedRegistro) {
            put(route('higiene-personal.update', selectedRegistro.id), {
                onSuccess: () => {
                    setEditModalOpen(false);
                    reset();
                    setSelectedRegistro(null);
                },
            });
        }
    };

    const formatFecha = (fecha: string) => {
        return new Date(fecha).toLocaleDateString('es-ES', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            // hour: '2-digit',
            // minute: '2-digit'
        });
    };


    const fetchDatosPdf = async () => {
        if (!semanaInicio || !turno) {
            throw new Error('Seleccione una semana y un turno');
        }
        const params = new URLSearchParams();
        params.append('semana_inicio', semanaInicio);
        params.append('turno', turno);

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
                alert('No hay datos para los filtros seleccionados');
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

    const calcularPorcentaje = (registro: HigienePersonal) => {
        const checks = [
            registro.uniforme,
            registro.limpieza,
            registro.lavado_manos,
            registro.salud,
            registro.epp,
            registro.objetos,
            registro.material_equipo,
        ];
        const cumplidos = checks.filter(Boolean).length;
        return Math.round((cumplidos / 7) * 100);
    };

    const handleBuscarEmpleadosAPI = async () => {
        try {
            const response = await router.reload({
                data: {
                    buscar_empleados: true,
                    busqueda: busquedaEmpleado,
                    area_id: filtroArea,
                    turno: filtroTurno,
                },
                only: ['empleados'],
                preserveState: true,
            });

            // La respuesta vendrá con los empleados actualizados
            // Esta lógica dependerá de cómo implementes la búsqueda en el backend
        } catch (error) {
            console.error('Error buscando empleados:', error);
        }
    };

    const handleExportReport = () => {
        const params = new URLSearchParams();

        Object.entries(filters).forEach(([key, value]) => {
            if (value && key !== 'per_page') {
                params.append(key.replace('filtro_', ''), value);
            }
        });

        window.open(route('higiene-personal.exportar') + '?' + params.toString(), '_blank');
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Higiene Personal" />
            <div className="px-2 sm:px-6 py-4 space-y-4">
                <Toast />

                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div>
                        <h1 className="text-2xl font-bold text-foreground">Higiene Personal</h1>
                        <p className="text-muted-foreground mt-1">
                            Registro y control de higiene personal del personal
                        </p>
                    </div>

                    <div className="flex flex-wrap gap-2">
                        {hasPermission('r_higienePersonal') && (
                            <Button
                                variant="outline"
                                onClick={handleExportReport}
                                className="flex items-center gap-2"
                            >
                                <Download className="h-4 w-4" />
                                <span className="hidden sm:inline">Exportar</span>
                            </Button>
                        )}

                        {hasPermission('c_higienePersonal') && (
                            <Button
                                onClick={handleCreate}
                                className="flex items-center gap-2"
                            >
                                <Plus className="h-4 w-4" />
                                <span className="hidden sm:inline">Nuevo Registro</span>
                                <span className="sm:hidden">Nuevo</span>
                            </Button>
                        )}
                        {hasPermission('c_higienePersonal') && (
                            <Button
                                onClick={() => router.get(route('higiene-personal.registro-rapido'))}
                                variant="secondary"
                                className="flex items-center gap-2"
                            >
                                <Users className="h-4 w-4" />
                                <span className="hidden sm:inline">Registro Rápido</span>
                                <span className="sm:hidden">Rápido</span>
                            </Button>
                        )}
                    </div>
                </div>

                {/* Estadísticas Rápidas */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    <Card className="p-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-muted-foreground">Total Registros</p>
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
                                <p className="text-sm font-medium text-muted-foreground">Conformes</p>
                                <p className="text-2xl font-bold mt-1 text-green-600">
                                    {registros.data.filter(r => r.conforme).length}
                                </p>
                            </div>
                            <div className="bg-green-100 dark:bg-green-900/30 p-3 rounded-full">
                                <CheckCircle className="h-6 w-6 text-green-600" />
                            </div>
                        </div>
                    </Card>

                    <Card className="p-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-muted-foreground">No Conformes</p>
                                <p className="text-2xl font-bold mt-1 text-red-600">
                                    {registros.data.filter(r => !r.conforme).length}
                                </p>
                            </div>
                            <div className="bg-red-100 dark:bg-red-900/30 p-3 rounded-full">
                                <XCircle className="h-6 w-6 text-red-600" />
                            </div>
                        </div>
                    </Card>

                    <Card className="p-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-muted-foreground">% Conformidad</p>
                                <p className="text-2xl font-bold mt-1">
                                    {registros.data.length > 0
                                        ? Math.round((registros.data.filter(r => r.conforme).length / registros.data.length) * 100)
                                        : 0
                                    }%
                                </p>
                            </div>
                            <div className="bg-blue-100 dark:bg-blue-900/30 p-3 rounded-full">
                                <User className="h-6 w-6 text-blue-600" />
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
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={resetFilters}
                                        className="text-xs text-muted-foreground hover:text-foreground h-8"
                                    >
                                        <X className="h-4 w-4 mr-1" />
                                        Limpiar
                                    </Button>
                                )}
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => setShowFilters(!showFilters)}
                                    className="h-8"
                                >
                                    <Filter className="h-4 w-4 mr-2" />
                                    {showFilters ? 'Ocultar' : 'Mostrar'}
                                </Button>
                            </div>
                        </div>
                    </div>

                    {showFilters && (
                        <div className="p-4 border-t">
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="fecha_desde">Fecha Desde</Label>
                                    <Input
                                        id="fecha_desde"
                                        type="date"
                                        value={filters.filtro_fecha_desde || ''}
                                        onChange={(e) => updateFilter('filtro_fecha_desde', e.target.value)}
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="fecha_hasta">Fecha Hasta</Label>
                                    <Input
                                        id="fecha_hasta"
                                        type="date"
                                        value={filters.filtro_fecha_hasta || ''}
                                        onChange={(e) => updateFilter('filtro_fecha_hasta', e.target.value)}
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="empleado">Empleado</Label>
                                    <FilterSelect
                                        value={filters.filtro_empleado}
                                        onChange={(v) => updateFilter('filtro_empleado', v)}
                                        placeholder="Todos los empleados"
                                        options={empleados.map(e => ({
                                            value: e.id.toString(),
                                            label: `${e.codigo ? `[${e.codigo}] ` : ''}${e.name} ${e.apellido || ''}`
                                        }))}
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="conforme">Estado</Label>
                                    <FilterSelect
                                        value={filters.filtro_conforme}
                                        onChange={(v) => updateFilter('filtro_conforme', v)}
                                        placeholder="Todos los estados"
                                        options={[
                                            { value: '1', label: 'Conforme' },
                                            { value: '0', label: 'No Conforme' },
                                        ]}
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="area">Área</Label>
                                    <FilterSelect
                                        value={filters.filtro_area}
                                        onChange={(v) => updateFilter('filtro_area', v)}
                                        placeholder="Todas las áreas"
                                        options={areas.map(a => ({
                                            value: a.id.toString(),
                                            label: a.nombre
                                        }))}
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="turno">Turno</Label>
                                    <FilterSelect
                                        value={filters.filtro_turno}
                                        onChange={(v) => updateFilter('filtro_turno', v)}
                                        placeholder="Todos los turnos"
                                        options={turnos.map(t => ({
                                            value: t,
                                            label: t
                                        }))}
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="per_page">Resultados por página</Label>
                                    <FilterSelect
                                        value={filters.per_page}
                                        onChange={(v) => updateFilter('per_page', v)}
                                        placeholder="10 por página"
                                        options={['10', '25', '50', '100'].map(v => ({
                                            value: v,
                                            label: `${v} por página`
                                        }))}
                                        includeAllOption={false}
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
                                    <TableHead className="w-[180px]">Fecha y Hora</TableHead>
                                    <TableHead>Empleado</TableHead>
                                    <TableHead>Área/Turno</TableHead>
                                    <TableHead>Supervisor</TableHead>
                                    <TableHead className="text-center">Cumplimiento</TableHead>
                                    <TableHead className="text-center">Estado</TableHead>
                                    <TableHead>Observaciones</TableHead>
                                    <TableHead>Correcciones</TableHead>
                                    <TableHead className="w-[80px]">Acciones</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {registros.data.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                                            <div className="flex flex-col items-center justify-center">
                                                <User className="h-12 w-12 text-muted-foreground/50 mb-3" />
                                                <p className="text-lg font-medium text-foreground mb-1">
                                                    No se encontraron registros
                                                </p>
                                                <p className="text-muted-foreground">
                                                    {hasActiveFilters
                                                        ? "Intenta ajustar los filtros para ver más resultados"
                                                        : "No hay registros de higiene personal"
                                                    }
                                                </p>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    registros.data.map((registro) => (
                                        <TableRow key={registro.id} className="hover:bg-muted/50">
                                            <TableCell>
                                                <div className="font-medium">
                                                    {formatFecha(registro.fecha)}
                                                </div>
                                            </TableCell>

                                            <TableCell>
                                                <div className="font-medium">
                                                    {registro.empleado.name} {registro.empleado.apellido}
                                                </div>
                                                <div className="text-sm text-muted-foreground">
                                                    {registro.empleado.codigo && `Código: ${registro.empleado.codigo}`}
                                                    {registro.empleado.cargo && ` • ${registro.empleado.cargo}`}
                                                </div>
                                            </TableCell>

                                            <TableCell>
                                                <div className="flex flex-col gap-1">
                                                    <Badge variant="outline" className="w-fit">
                                                        <Building className="h-3 w-3 mr-1" />
                                                        {registro.empleado.area?.nombre || 'Sin área'}
                                                    </Badge>
                                                    <Badge variant="outline" className="w-fit">
                                                        <Clock className="h-3 w-3 mr-1" />
                                                        {registro.empleado.turno || 'Sin turno'}
                                                    </Badge>
                                                </div>
                                            </TableCell>

                                            <TableCell>
                                                <div className="text-sm">
                                                    {registro.supervisor.name} {registro.supervisor.apellido}
                                                </div>
                                            </TableCell>

                                            <TableCell>
                                                <div className="flex flex-col items-center">
                                                    <div className="w-full bg-muted rounded-full h-2 mb-1 overflow-hidden">
                                                        <div
                                                            className={`h-2 rounded-full transition-all duration-300 ${calcularPorcentaje(registro) >= 80 ? 'bg-green-500' :
                                                                calcularPorcentaje(registro) >= 60 ? 'bg-yellow-500' : 'bg-red-500'
                                                                }`}
                                                            style={{ width: `${calcularPorcentaje(registro)}%` }}
                                                        />
                                                    </div>
                                                    <span className="text-sm font-medium">
                                                        {calcularPorcentaje(registro)}%
                                                    </span>
                                                </div>
                                            </TableCell>

                                            <TableCell>
                                                <div className="flex justify-center">
                                                    <Badge
                                                        variant={registro.conforme ? "default" : "destructive"}
                                                        className={registro.conforme
                                                            ? "bg-green-100 text-green-800 hover:bg-green-100 dark:bg-green-900/30 dark:text-green-400"
                                                            : "bg-red-100 text-red-800 hover:bg-red-100 dark:bg-red-900/30 dark:text-red-400"
                                                        }
                                                    >
                                                        {registro.conforme ? (
                                                            <>
                                                                <CheckCircle className="h-3 w-3 mr-1" />
                                                                Conforme
                                                            </>
                                                        ) : (
                                                            <>
                                                                <XCircle className="h-3 w-3 mr-1" />
                                                                No Conforme
                                                            </>
                                                        )}
                                                    </Badge>
                                                </div>
                                            </TableCell>

                                            <TableCell>
                                                <div className="max-w-xs truncate">
                                                    {registro.observaciones || 'Sin observaciones'}
                                                </div>
                                            </TableCell>

                                            <TableCell>
                                                <div className="max-w-xs truncate">
                                                    {registro.correccion || 'Sin correcciones'}
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
                                                    <DropdownMenuContent align="end" className="w-48">
                                                        {hasPermission('u_higienePersonal') && (
                                                            <DropdownMenuItem onClick={() => handleEdit(registro)}>
                                                                <Edit className="mr-2 h-4 w-4" />
                                                                <span>Editar registro</span>
                                                            </DropdownMenuItem>
                                                        )}
                                                        {hasPermission('d_higienePersonal') && (
                                                            <DropdownMenuItem
                                                                onClick={() => handleDelete(registro)}
                                                                className="text-destructive focus:text-destructive"
                                                            >
                                                                <XCircle className="mr-2 h-4 w-4" />
                                                                <span>Eliminar registro</span>
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
                    {registros.data.length > 0 && (
                        <div className="border-t px-4 py-3">
                            <TablePagination
                                pagination={registros}
                                onPageChange={(page) =>
                                    router.get(
                                        route('higiene-personal.index'),
                                        { ...filters, page },
                                        { preserveState: true, replace: true },
                                    )
                                }
                            />
                        </div>
                    )}
                </Card>

                {/* Info rápida */}
                <div className="flex justify-between items-center">
                    <p className="text-muted-foreground">
                        {registros.total} registros en total
                    </p>
                    {registros.data.length > 0 && (
                        <p className="text-muted-foreground">
                            Mostrando {registros.data.length} de {registros.total} registros
                        </p>
                    )}
                </div>
            </div>

            <div className="rounded-lg border border-border bg-muted/50 p-4 mt-4">
                <h3 className="mb-3 font-semibold text-foreground">Generar Reporte Semanal</h3>
                <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                    <div>
                        <label className="mb-1 block text-sm font-medium">Semana (Lunes)</label>
                        <Input
                            type="date"
                            value={semanaInicio}
                            onChange={(e) => setSemanaInicio(e.target.value)}
                        />
                        <p className="text-xs text-muted-foreground mt-1">Seleccione la fecha del lunes de la semana</p>
                    </div>
                    <div>
                        <label className="mb-1 block text-sm font-medium">Turno</label>
                        <FilterSelect
                            value={turno}
                            onChange={(v) => setTurno(v)}
                            placeholder="Seleccione un turno"
                            options={turnos.map(t => ({ value: t, label: t }))}
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

            {/* Modal para Crear */}
            <Dialog open={createModalOpen} onOpenChange={setCreateModalOpen}>
                <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                            <User className="h-5 w-5 text-blue-600" />
                            Nuevo Registro de Higiene Personal
                        </DialogTitle>
                        <DialogDescription>
                            Complete el formulario para registrar una nueva evaluación de higiene personal
                        </DialogDescription>
                    </DialogHeader>

                    <form onSubmit={submitCreate} className="space-y-6">
                        {/* Sección de búsqueda de empleado */}
                        <div className="space-y-4">
                            <h3 className="font-medium text-foreground">Buscar Empleado</h3>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="busqueda_empleado">Buscar por nombre, código o cargo</Label>
                                    <div className="flex gap-2">
                                        <Input
                                            id="busqueda_empleado"
                                            value={busquedaEmpleado}
                                            onChange={(e) => setBusquedaEmpleado(e.target.value)}
                                            placeholder="Nombre, código, cargo..."
                                            className="flex-1"
                                        />
                                        <Button
                                            type="button"
                                            variant="outline"
                                            onClick={handleBuscarEmpleadosAPI}
                                        >
                                            <Search className="h-4 w-4" />
                                        </Button>
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="filtro_area">Filtrar por Área</Label>
                                    <FilterSelect
                                        value={filtroArea}
                                        onChange={setFiltroArea}
                                        placeholder="Todas las áreas"
                                        options={areas.map(a => ({
                                            value: a.id.toString(),
                                            label: a.nombre
                                        }))}
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="filtro_turno">Filtrar por Turno</Label>
                                    <FilterSelect
                                        value={filtroTurno}
                                        onChange={setFiltroTurno}
                                        placeholder="Todos los turnos"
                                        options={turnos.map(t => ({
                                            value: t,
                                            label: t
                                        }))}
                                    />
                                </div>
                            </div>

                            {/* Lista de empleados filtrados */}
                            {empleadosFiltrados.length > 0 && (
                                <div className="border rounded-lg p-2 max-h-60 overflow-y-auto">
                                    <div className="grid grid-cols-1 gap-2">
                                        {empleadosFiltrados.map((empleado) => (
                                            <div
                                                key={empleado.id}
                                                className={`p-3 rounded-md cursor-pointer transition-colors ${data.empleado_id === empleado.id.toString()
                                                    ? 'bg-primary/10 border border-primary/20'
                                                    : 'hover:bg-muted/50 border border-transparent'
                                                    }`}
                                                onClick={() => setData('empleado_id', empleado.id.toString())}
                                            >
                                                <div className="flex items-center justify-between">
                                                    <div>
                                                        <div className="font-medium">
                                                            {empleado.name} {empleado.apellido}
                                                        </div>
                                                        <div className="text-sm text-muted-foreground">
                                                            {empleado.codigo && `Código: ${empleado.codigo} • `}
                                                            {empleado.cargo || 'Sin cargo'}
                                                        </div>
                                                    </div>
                                                    {data.empleado_id === empleado.id.toString() && (
                                                        <CheckCircle className="h-5 w-5 text-green-600" />
                                                    )}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {empleadosFiltrados.length === 0 && busquedaEmpleado && (
                                <div className="text-center py-8 text-muted-foreground">
                                    <Users className="h-12 w-12 mx-auto mb-3 opacity-50" />
                                    <p>No se encontraron empleados con los criterios de búsqueda</p>
                                </div>
                            )}
                        </div>

                        {/* Empleado seleccionado */}
                        {data.empleado_id && (
                            <div className="bg-muted/30 p-4 rounded-lg">
                                <div className="flex items-center justify-between mb-2">
                                    <h4 className="font-medium text-foreground">Empleado Seleccionado</h4>
                                    <Button
                                        type="button"
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => setData('empleado_id', '')}
                                    >
                                        Cambiar
                                    </Button>
                                </div>
                                {(() => {
                                    const empleado = empleados.find(e => e.id.toString() === data.empleado_id);
                                    return empleado ? (
                                        <div className="flex items-center gap-3">
                                            <div className="bg-primary/10 p-2 rounded-full">
                                                <User className="h-6 w-6 text-primary" />
                                            </div>
                                            <div>
                                                <div className="font-medium">
                                                    {empleado.name} {empleado.apellido}
                                                </div>
                                                <div className="text-sm text-muted-foreground">
                                                    {empleado.codigo && `Código: ${empleado.codigo} • `}
                                                    {empleado.cargo || 'Sin cargo'} •
                                                    {empleado.turno ? ` Turno: ${empleado.turno}` : ' Sin turno'}
                                                </div>
                                            </div>
                                        </div>
                                    ) : null;
                                })()}
                            </div>
                        )}

                        {errors.empleado_id && (
                            <p className="text-sm text-red-600">{errors.empleado_id}</p>
                        )}

                        {/* Fecha y hora */}
                        <div className="space-y-2">
                            <Label htmlFor="fecha">Fecha y Hora de Evaluación</Label>
                            <Input
                                id="fecha"
                                type="datetime-local"
                                value={data.fecha}
                                onChange={(e) => setData('fecha', e.target.value)}
                                error={errors.fecha}
                            />
                        </div>

                        {/* Checklist de evaluación */}
                        <div className="space-y-4">
                            <h3 className="font-medium text-foreground">Checklist de Evaluación</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                {[
                                    { key: 'uniforme', label: 'Uniforme limpio, completo y en buen estado', description: 'Verificar uniforme adecuado y limpio ( camisa, pantalón, botas, barbijo calatrava y mangas) ' },
                                    { key: 'limpieza', label: ' Higiene personal', description: ' Verificar higiene ( manos, uñas, cabello, sin maquillaje) ' },
                                    { key: 'lavado_manos', label: 'Lavado de manos', description: 'Verificar que las manos estén limpias y lavadas' },
                                    {
                                        key: 'salud', label: 'Estado de Salud', description: `• Sin síntomas de enfermedad, sin heridas expuestass estado de ánimo adecuado y capacidad para realizar tareas` },
                                    { key: 'epp', label: 'EPP Correcto', description: 'Verificar uso adecuado de equipo de protección personal' },
                                    { key: 'objetos', label: 'Sin Objetos Personales', description: 'Verificar que no porte objetos personales al ingreso a planta (aretes, anillos, manillas, relojes, monedas y llaves)' },
                                    // { key: 'material_equipo', label: 'Material/Equipo en Orden', description: 'Verificar que el material y equipo estén en orden' },
                                ].map((item) => (
                                    <div key={item.key} className="border rounded-lg p-4 space-y-2">
                                        <div className="flex items-center justify-between">
                                            <Label htmlFor={item.key} className="font-medium">
                                                {item.label}
                                            </Label>
                                            <Checkbox
                                                id={item.key}
                                                checked={data[item.key as keyof typeof data] as boolean}
                                                onCheckedChange={(checked) =>
                                                    setData(item.key as keyof typeof data, checked as boolean)
                                                }
                                                className="h-5 w-5"
                                            />
                                        </div>
                                        <p className="text-sm text-muted-foreground">
                                            {item.description}
                                        </p>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Observaciones y correcciones */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="observaciones">Observaciones</Label>
                                <Textarea
                                    id="observaciones"
                                    value={data.observaciones}
                                    onChange={(e) => setData('observaciones', e.target.value)}
                                    placeholder="Observaciones adicionales sobre la evaluación..."
                                    error={errors.observaciones}
                                    rows={3}
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="correccion">Acciones Correctivas</Label>
                                <Textarea
                                    id="correccion"
                                    value={data.correccion}
                                    onChange={(e) => setData('correccion', e.target.value)}
                                    placeholder="Acciones correctivas a tomar en caso de no conformidad..."
                                    error={errors.correccion}
                                    rows={3}
                                />
                            </div>
                        </div>

                        {/* Previsualización de resultado */}
                        <div className="bg-muted/30 p-4 rounded-lg">
                            <h4 className="font-medium text-foreground mb-2">Resultado de Evaluación</h4>
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-muted-foreground">
                                        La evaluación será marcada como:
                                    </p>
                                    <div className="flex items-center gap-2 mt-1">
                                        <Badge
                                            variant={data.uniforme && data.limpieza && data.lavado_manos && data.salud && data.epp && data.objetos && data.material_equipo ? "default" : "destructive"}
                                            className={data.uniforme && data.limpieza && data.lavado_manos && data.salud && data.epp && data.objetos && data.material_equipo
                                                ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400"
                                                : "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400"
                                            }
                                        >
                                            {data.uniforme && data.limpieza && data.lavado_manos && data.salud && data.epp && data.objetos && data.material_equipo
                                                ? 'CONFORME'
                                                : 'NO CONFORME'
                                            }
                                        </Badge>
                                        <span className="text-sm">
                                            ({[
                                                data.uniforme,
                                                data.limpieza,
                                                data.lavado_manos,
                                                data.salud,
                                                data.epp,
                                                data.objetos,
                                                
                                            ].filter(Boolean).length}/6 criterios cumplidos)
                                        </span>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <p className="text-sm text-muted-foreground">Porcentaje de cumplimiento</p>
                                    <p className="text-2xl font-bold">
                                        {Math.round((
                                            [data.uniforme, data.limpieza, data.lavado_manos, data.salud, data.epp, data.objetos, data.material_equipo]
                                                .filter(Boolean).length / 7
                                        ) * 100)}%
                                    </p>
                                </div>
                            </div>
                        </div>

                        <DialogFooter>
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => setCreateModalOpen(false)}
                                disabled={processing}
                            >
                                Cancelar
                            </Button>
                            <Button
                                type="submit"
                                disabled={processing || !data.empleado_id}
                            >
                                {processing ? 'Guardando...' : 'Guardar Registro'}
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>

            {/* Modal para Editar */}
            <Dialog open={editModalOpen} onOpenChange={setEditModalOpen}>
                <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                            <Edit className="h-5 w-5 text-blue-600" />
                            Editar Registro de Higiene Personal
                        </DialogTitle>
                        <DialogDescription>
                            Modifique los datos del registro de higiene personal
                        </DialogDescription>
                    </DialogHeader>

                    {selectedRegistro && (
                        <form onSubmit={submitEdit} className="space-y-6">
                            {/* Información del empleado (solo lectura en edición) */}
                            <div className="bg-muted/30 p-4 rounded-lg">
                                <h4 className="font-medium text-foreground mb-2">Empleado Evaluado</h4>
                                <div className="flex items-center gap-3">
                                    <div className="bg-primary/10 p-2 rounded-full">
                                        <User className="h-6 w-6 text-primary" />
                                    </div>
                                    <div>
                                        <div className="font-medium">
                                            {selectedRegistro.empleado.name} {selectedRegistro.empleado.apellido}
                                        </div>
                                        <div className="text-sm text-muted-foreground">
                                            {selectedRegistro.empleado.codigo && `Código: ${selectedRegistro.empleado.codigo} • `}
                                            {selectedRegistro.empleado.cargo || 'Sin cargo'} •
                                            {selectedRegistro.empleado.turno ? ` Turno: ${selectedRegistro.empleado.turno}` : ' Sin turno'}
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Fecha y hora */}
                            <div className="space-y-2">
                                <Label htmlFor="fecha_edit">Fecha y Hora de Evaluación</Label>
                                <Input
                                    id="fecha_edit"
                                    type="datetime-local"
                                    value={data.fecha}
                                    onChange={(e) => setData('fecha', e.target.value)}
                                    error={errors.fecha}
                                />
                            </div>

                            {/* Checklist de evaluación */}
                            <div className="space-y-4">
                                <h3 className="font-medium text-foreground">Checklist de Evaluación</h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                    {[
                                        { key: 'uniforme', label: 'Uniforme limpio, completo y en buen estado', description: 'Verificar uniforme adecuado y limpio ( camisa, pantalón, botas, barbijo calatrava y mangas) ' },
                                        { key: 'limpieza', label: ' Higiene personal', description: ' Verificar higiene ( manos, uñas, cabello, sin maquillaje) ' },
                                        { key: 'lavado_manos', label: 'Lavado de manos', description: 'Verificar que las manos estén limpias y lavadas' },
                                        { key: 'salud', label: 'Estado de Salud', description: 'Verificar que no presente síntomas de enfermedad' },
                                        { key: 'epp', label: 'EPP Correcto', description: 'Verificar uso adecuado de equipo de protección personal' },
                                        { key: 'objetos', label: 'Sin Objetos Personales', description: 'Verificar que no porte objetos personales al ingreso a planta (aretes, anillos, manillas, relojes, monedas y llaves)' },
                                        // { key: 'material_equipo', label: 'Material/Equipo en Orden', description: 'Verificar que el material y equipo estén en orden' },
                                    ].map((item) => (
                                        <div key={item.key} className="border rounded-lg p-4 space-y-2">
                                            <div className="flex items-center justify-between">
                                                <Label htmlFor={`edit_${item.key}`} className="font-medium">
                                                    {item.label}
                                                </Label>
                                                <Checkbox
                                                    id={`edit_${item.key}`}
                                                    checked={data[item.key as keyof typeof data] as boolean}
                                                    onCheckedChange={(checked) =>
                                                        setData(item.key as keyof typeof data, checked as boolean)
                                                    }
                                                    className="h-5 w-5"
                                                />
                                            </div>
                                            <p className="text-sm text-muted-foreground">
                                                {item.description}
                                            </p>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Observaciones y correcciones */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="observaciones_edit">Observaciones</Label>
                                    <Textarea
                                        id="observaciones_edit"
                                        value={data.observaciones}
                                        onChange={(e) => setData('observaciones', e.target.value)}
                                        placeholder="Observaciones adicionales sobre la evaluación..."
                                        error={errors.observaciones}
                                        rows={3}
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="correccion_edit">Acciones Correctivas</Label>
                                    <Textarea
                                        id="correccion_edit"
                                        value={data.correccion}
                                        onChange={(e) => setData('correccion', e.target.value)}
                                        placeholder="Acciones correctivas a tomar en caso de no conformidad..."
                                        error={errors.correccion}
                                        rows={3}
                                    />
                                </div>
                            </div>

                            {/* Previsualización de resultado */}
                            <div className="bg-muted/30 p-4 rounded-lg">
                                <h4 className="font-medium text-foreground mb-2">Resultado de Evaluación</h4>
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm text-muted-foreground">
                                            La evaluación será marcada como:
                                        </p>
                                        <div className="flex items-center gap-2 mt-1">
                                            <Badge
                                                variant={data.uniforme && data.limpieza && data.lavado_manos && data.salud && data.epp && data.objetos && data.material_equipo ? "default" : "destructive"}
                                                className={data.uniforme && data.limpieza && data.lavado_manos && data.salud && data.epp && data.objetos && data.material_equipo
                                                    ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400"
                                                    : "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400"
                                                }
                                            >
                                                {data.uniforme && data.limpieza && data.lavado_manos && data.salud && data.epp && data.objetos && data.material_equipo
                                                    ? 'CONFORME'
                                                    : 'NO CONFORME'
                                                }
                                            </Badge>
                                            <span className="text-sm">
                                                ({[
                                                    data.uniforme,
                                                    data.limpieza,
                                                    data.lavado_manos,
                                                    data.salud,
                                                    data.epp,
                                                    data.objetos,
                                                    data.material_equipo,
                                                ].filter(Boolean).length}/7 criterios cumplidos)
                                            </span>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-sm text-muted-foreground">Porcentaje de cumplimiento</p>
                                        <p className="text-2xl font-bold">
                                            {Math.round((
                                                [data.uniforme, data.limpieza, data.lavado_manos, data.salud, data.epp, data.objetos, data.material_equipo]
                                                    .filter(Boolean).length / 7
                                            ) * 100)}%
                                        </p>
                                    </div>
                                </div>
                            </div>

                            <DialogFooter>
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={() => setEditModalOpen(false)}
                                    disabled={processing}
                                >
                                    Cancelar
                                </Button>
                                <Button
                                    type="submit"
                                    disabled={processing}
                                >
                                    {processing ? 'Guardando...' : 'Actualizar Registro'}
                                </Button>
                            </DialogFooter>
                        </form>
                    )}
                </DialogContent>
            </Dialog>

            {/* Diálogo de Confirmación para Eliminar */}
            <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
                <DialogContent className="max-w-md">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                            <XCircle className="h-5 w-5 text-red-600" />
                            Confirmar Eliminación
                        </DialogTitle>
                        <DialogDescription>
                            Esta acción no se puede deshacer. ¿Está seguro de eliminar este registro de higiene personal?
                        </DialogDescription>
                    </DialogHeader>

                    {selectedRegistro && (
                        <div className="bg-muted/30 p-4 rounded-lg">
                            <div className="space-y-2">
                                <div className="font-medium">
                                    {selectedRegistro.empleado.name} {selectedRegistro.empleado.apellido}
                                </div>
                                <div className="text-sm text-muted-foreground">
                                    Evaluado el: {formatFecha(selectedRegistro.fecha)}
                                </div>
                                <div className="text-sm">
                                    Estado:
                                    <Badge
                                        variant={selectedRegistro.conforme ? "default" : "destructive"}
                                        className="ml-2"
                                    >
                                        {selectedRegistro.conforme ? 'Conforme' : 'No Conforme'}
                                    </Badge>
                                </div>
                            </div>
                        </div>
                    )}

                    <DialogFooter>
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => setDeleteDialogOpen(false)}
                        >
                            Cancelar
                        </Button>
                        <Button
                            type="button"
                            variant="destructive"
                            onClick={confirmDelete}
                        >
                            Eliminar Registro
                        </Button>
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
                                <h3 className="text-lg font-semibold text-gray-800">Reporte de Higiene Personal</h3>
                                <p className="text-sm text-gray-600">
                                    Semana del {datosPdf.semana_inicio} al {datosPdf.semana_fin} - Turno: {datosPdf.turno}
                                </p>
                            </div>
                        </div>
                        <div className="h-full pt-14">
                            <PDFViewer style={{ width: '100%', height: '100%', border: 'none' }}>
                                <ReporteHigienePersonal data={datosPdf} />
                            </PDFViewer>
                        </div>
                    </div>
                </div>
            )}
        </AppLayout>
    );
}
