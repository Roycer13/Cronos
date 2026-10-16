import { Button } from '@/components/ui/button';
import FilterSelect from '@/components/ui/filter-select';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

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
import {
    Search, Filter, X, MoreHorizontal, Edit, User, CheckCircle, XCircle,
    Plus, Download, Calendar, Users, Building, Clock, Printer
} from 'lucide-react';
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
import { PDFViewer } from '@react-pdf/renderer';
import ReporteInspeccionCasilleros from '@/pdf/ReporteInspeccionCasilleros';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Módulos Comunes', href: '/modulos-comunes' },
    { title: 'Higiene Personal', href: '/modulos-comunes/higiene-personal' },
    { title: 'Inspección de Casilleros', href: '/modulos-comunes/higiene-personal/inspeccion-casilleros' },
];

interface InspeccionCasillero {
    id: number;
    fecha: string;
    orden: boolean;
    limpieza: boolean;
    implementos_aseo: boolean;
    conforme: boolean;
    observacion?: string;
    correcion?: string;
    user: {
        id: number;
        name: string;
        apellido: string;
    };
    inspector1?: { id: number; name: string; apellido: string };
    inspector2?: { id: number; name: string; apellido: string };
    inspector3?: { id: number; name: string; apellido: string };
    ubicacion: {
        id: number;
        nombre: string;
    };
}

interface PageProps {
    registros: {
        data: InspeccionCasillero[];
        links: any[];
        current_page: number;
        last_page: number;
        per_page: number;
        total: number;
    };
    empleados: Array<{ id: number; name: string; apellido: string }>;
    inspectores: Array<{ id: number; name: string; apellido: string }>;
    turnos: string[]; // <-- agregado
    filters: {
        filtro_fecha_desde?: string;
        filtro_fecha_hasta?: string;
        filtro_empleado?: string;
        filtro_conforme?: string;
        filtro_inspector?: string;
        per_page?: string;
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
    const [selectedRegistro, setSelectedRegistro] = useState<InspeccionCasillero | null>(null);

    const {
        hasPermission,
        belongsToUbicacion,
        canDo,
        user: authUser } = useAuth();

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
        inspectores = [],
        turnos = [],   // <-- agregado
        filters: initialFilters = {},
        flash,
    } = props as unknown as PageProps;

    const { filters, updateFilter, resetFilters } = useAdvancedFilters({
        routeName: 'inspeccion-casilleros.index',
        initialFilters: {
            filtro_fecha_desde: initialFilters.filtro_fecha_desde || undefined,
            filtro_fecha_hasta: initialFilters.filtro_fecha_hasta || undefined,
            filtro_empleado: initialFilters.filtro_empleado || undefined,
            filtro_conforme: initialFilters.filtro_conforme || undefined,
            filtro_inspector: initialFilters.filtro_inspector || undefined,
            per_page: initialFilters.per_page || '10',
        },
        debounceFields: [],
        debounceDelay: 600,
    });

    // Formulario para crear/editar
    const { data, setData, post, put, processing, errors, reset } = useForm({
        user_id: '',
        fecha: toLocalDatetimeInputValue(),
        orden: true,
        limpieza: true,
        implementos_aseo: true,
        observacion: '',
        correccion: '',
        inspector1_id: '',
        inspector2_id: '',
        inspector3_id: '',
    });

    const hasActiveFilters = Object.values(filters).some(
        (value) => value && value !== '' && value !== '10'
    );

    const handleCreate = () => {
        reset();
        setData({
            user_id: '',
            fecha: toLocalDatetimeInputValue(),
            orden: true,
            limpieza: true,
            implementos_aseo: true,
            observacion: '',
            correccion: '',
            inspector1_id: '',
            inspector2_id: '',
            inspector3_id: '',
        });
        setCreateModalOpen(true);
    };

    const handleEdit = (registro: InspeccionCasillero) => {
        setSelectedRegistro(registro);
        setData({
            user_id: registro.user.id.toString(),
            fecha: toLocalDatetimeInputValue(registro.fecha),
            orden: registro.orden,
            limpieza: registro.limpieza,
            implementos_aseo: registro.implementos_aseo,
            observacion: registro.observacion || '',
            correccion: registro.correcion || '',
            inspector1_id: registro.inspector1?.id.toString() || '',
            inspector2_id: registro.inspector2?.id.toString() || '',
            inspector3_id: registro.inspector3?.id.toString() || '',
        });
        setEditModalOpen(true);
    };

    const handleDelete = (registro: InspeccionCasillero) => {
        setSelectedRegistro(registro);
        setDeleteDialogOpen(true);
    };

    const confirmDelete = () => {
        if (selectedRegistro) {
            router.delete(route('inspeccion-casilleros.destroy', selectedRegistro.id), {
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
        post(route('inspeccion-casilleros.store'), {
            onSuccess: () => {
                setCreateModalOpen(false);
                reset();
            },
        });
    };

    const submitEdit = (e: React.FormEvent) => {
        e.preventDefault();
        if (selectedRegistro) {
            put(route('inspeccion-casilleros.update', selectedRegistro.id), {
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
            year: 'numeric'
        });
    };

    const getConformeBadge = (conforme: boolean) => {
        return conforme ? (
            <Badge variant="default" className="bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400">
                <CheckCircle className="h-3 w-3 mr-1" />
                Conforme
            </Badge>
        ) : (
            <Badge variant="destructive" className="bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400">
                <XCircle className="h-3 w-3 mr-1" />
                No Conforme
            </Badge>
        );
    };

    // Estadísticas rápidas
    const totalRegistros = registros.total;
    const conformes = registros.data.filter(r => r.conforme).length;
    const noConformes = totalRegistros - conformes;
    const porcentajeConformidad = totalRegistros > 0 ? Math.round((conformes / totalRegistros) * 100) : 0;

    // Estados para el PDF
    const [fechaDesde, setFechaDesde] = useState<string>('');
    const [fechaHasta, setFechaHasta] = useState<string>('');
    const [datosPdf, setDatosPdf] = useState<any>(null);
    const [mostrarPdf, setMostrarPdf] = useState(false);
    const [generandoPdf, setGenerandoPdf] = useState(false);
    const urlPdf = route('inspeccion-casilleros.pdf');

    const fetchDatosPdf = async () => {
        if (!fechaDesde || !fechaHasta) {
            throw new Error('Seleccione ambas fechas');
        }
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
                alert('No hay datos para el rango seleccionado');
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

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Inspección de Casilleros" />
            <div className="px-2 sm:px-6 py-4 space-y-4">
                <Toast />

                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div>
                        <h1 className="text-2xl font-bold text-foreground">Inspección de Casilleros</h1>
                        <p className="text-muted-foreground mt-1">
                            Registro y control de orden, limpieza e implementos de aseo en casilleros
                        </p>
                    </div>

                    <div className="flex flex-wrap gap-2">
                        {hasPermission('c_inspeccionCasilleros') && (
                            <Button
                                variant="outline"
                                onClick={() => router.get(route('inspeccion-casilleros.registro-rapido'))}
                                className="flex items-center gap-2"
                            >
                                <Users className="h-4 w-4" />
                                <span className="hidden sm:inline">Registro Rápido</span>
                                <span className="sm:hidden">Rápido</span>
                            </Button>
                        )}

                        {hasPermission('c_inspeccionCasilleros') && (
                            <Button
                                onClick={handleCreate}
                                className="flex items-center gap-2"
                            >
                                <Plus className="h-4 w-4" />
                                <span className="hidden sm:inline">Nueva Inspección</span>
                                <span className="sm:hidden">Nuevo</span>
                            </Button>
                        )}
                    </div>
                </div>

                {/* Estadísticas Rápidas */}
                {/* <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    <Card className="p-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-muted-foreground">Total Inspecciones</p>
                                <p className="text-2xl font-bold mt-1">{totalRegistros}</p>
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
                                <p className="text-2xl font-bold mt-1 text-green-600">{conformes}</p>
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
                                <p className="text-2xl font-bold mt-1 text-red-600">{noConformes}</p>
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
                                <p className="text-2xl font-bold mt-1">{porcentajeConformidad}%</p>
                            </div>
                            <div className="bg-blue-100 dark:bg-blue-900/30 p-3 rounded-full">
                                <User className="h-6 w-6 text-blue-600" />
                            </div>
                        </div>
                    </Card>
                </div> */}

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
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
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
                                            label: `${e.name} ${e.apellido}`
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
                                    <Label htmlFor="inspector">Inspector</Label>
                                    <FilterSelect
                                        value={filters.filtro_inspector}
                                        onChange={(v) => updateFilter('filtro_inspector', v)}
                                        placeholder="Todos los inspectores"
                                        options={inspectores.map(i => ({
                                            value: i.id.toString(),
                                            label: `${i.name} ${i.apellido}`
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
                                    <TableHead>Orden</TableHead>
                                    <TableHead>Limpieza</TableHead>
                                    <TableHead>Implementos Aseo</TableHead>
                                    <TableHead className="text-center">Estado</TableHead>
                                    <TableHead>Inspectores</TableHead>
                                    <TableHead>Observaciones</TableHead>
                                    <TableHead>Correcciones</TableHead>
                                    <TableHead className="w-[80px]">Acciones</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {registros.data.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={10} className="text-center py-8 text-muted-foreground">
                                            <div className="flex flex-col items-center justify-center">
                                                <User className="h-12 w-12 text-muted-foreground/50 mb-3" />
                                                <p className="text-lg font-medium text-foreground mb-1">
                                                    No se encontraron inspecciones
                                                </p>
                                                <p className="text-muted-foreground">
                                                    {hasActiveFilters
                                                        ? "Intenta ajustar los filtros para ver más resultados"
                                                        : "No hay inspecciones de casilleros registradas"
                                                    }
                                                </p>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    registros.data.map((registro) => (
                                        <TableRow key={registro.id} className="hover:bg-muted/50">
                                            <TableCell>{formatFecha(registro.fecha)}</TableCell>

                                            <TableCell>
                                                <div className="font-medium">
                                                    {registro.user.name} {registro.user.apellido}
                                                </div>
                                            </TableCell>

                                            <TableCell>
                                                {registro.orden ? (
                                                    <CheckCircle className="h-5 w-5 text-green-600" />
                                                ) : (
                                                    <XCircle className="h-5 w-5 text-red-600" />
                                                )}
                                            </TableCell>

                                            <TableCell>
                                                {registro.limpieza ? (
                                                    <CheckCircle className="h-5 w-5 text-green-600" />
                                                ) : (
                                                    <XCircle className="h-5 w-5 text-red-600" />
                                                )}
                                            </TableCell>

                                            <TableCell>
                                                {registro.implementos_aseo ? (
                                                    <CheckCircle className="h-5 w-5 text-green-600" />
                                                ) : (
                                                    <XCircle className="h-5 w-5 text-red-600" />
                                                )}
                                            </TableCell>

                                            <TableCell>
                                                <div className="flex justify-center">
                                                    {getConformeBadge(registro.conforme)}
                                                </div>
                                            </TableCell>

                                            <TableCell>
                                                <div className="flex flex-col gap-1 text-sm">
                                                    {registro.inspector1 && (
                                                        <span>Insp1: {registro.inspector1.name} {registro.inspector1.apellido}</span>
                                                    )}
                                                    {registro.inspector2 && (
                                                        <span>Insp2: {registro.inspector2.name} {registro.inspector2.apellido}</span>
                                                    )}
                                                    {registro.inspector3 && (
                                                        <span>Insp3: {registro.inspector3.name} {registro.inspector3.apellido}</span>
                                                    )}
                                                    {!registro.inspector1 && !registro.inspector2 && !registro.inspector3 && (
                                                        <span className="text-muted-foreground">No asignados</span>
                                                    )}
                                                </div>
                                            </TableCell>

                                            <TableCell>
                                                <div className="max-w-xs truncate">
                                                    {registro.observacion || 'Sin observaciones'}
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <div className="max-w-xs truncate">
                                                    {registro.correcion || 'Sin correcciones'}
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
                                                        <DropdownMenuItem onClick={() => handleEdit(registro)}>
                                                            <Edit className="mr-2 h-4 w-4" />
                                                            <span>Editar inspección</span>
                                                        </DropdownMenuItem>
                                                        <DropdownMenuItem
                                                            onClick={() => handleDelete(registro)}
                                                            className="text-destructive focus:text-destructive"
                                                        >
                                                            <XCircle className="mr-2 h-4 w-4" />
                                                            <span>Eliminar</span>
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
                                        route('inspeccion-casilleros.index'),
                                        { ...filters, page },
                                        { preserveState: true, replace: true },
                                    )
                                }
                            />
                        </div>
                    )}
                </Card>

                <div className="flex justify-between items-center">
                    <p className="text-muted-foreground">
                        {totalRegistros} registros en total
                    </p>
                    {registros.data.length > 0 && (
                        <p className="text-muted-foreground">
                            Mostrando {registros.data.length} de {totalRegistros} registros
                        </p>
                    )}
                </div>
            </div>

            <div className="rounded-lg border border-border bg-muted/50 p-4 mx-2 sm:mx-6 mb-4">
                <h3 className="mb-3 font-semibold text-foreground">Generar Reporte</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                        disabled={generandoPdf || !fechaDesde || !fechaHasta}
                        className="flex items-center gap-2"
                    >
                        <Printer className="h-4 w-4" />
                        {generandoPdf ? 'Generando...' : 'Generar Reporte PDF'}
                    </Button>
                </div>
            </div>

            {/* Modal para Crear */}
            <Dialog open={createModalOpen} onOpenChange={setCreateModalOpen}>
                {/* ... todo el contenido del modal de creación ... (sin cambios) */}
            </Dialog>

            {/* Modal para Editar */}
            <Dialog open={editModalOpen} onOpenChange={setEditModalOpen}>
                {/* ... todo el contenido del modal de edición ... (sin cambios) */}
            </Dialog>

            {/* Diálogo de Eliminación */}
            <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
                {/* ... contenido del diálogo de eliminación ... (sin cambios) */}
            </Dialog>

            {/* Modal para mostrar PDF */}
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
                                <h3 className="text-lg font-semibold text-gray-800">Reporte de Inspección de Casilleros</h3>
                                <p className="text-sm text-gray-600">
                                    Semana del {datosPdf.semana_inicio} al {datosPdf.semana_fin} - Turno: {datosPdf.turno || 'Todos'}
                                </p>
                            </div>
                        </div>
                        <div className="h-full pt-14">
                            <PDFViewer style={{ width: '100%', height: '100%', border: 'none' }}>
                                <ReporteInspeccionCasilleros data={datosPdf} />
                            </PDFViewer>
                        </div>
                    </div>
                </div>
            )}
        </AppLayout>
    );
}
