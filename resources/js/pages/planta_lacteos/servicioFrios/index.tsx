import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
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
import { Head, router, usePage, useForm } from '@inertiajs/react';
import {
    Filter,
    MoreHorizontal,
    Pencil,
    Plus,
    Refrigerator,
    Thermometer,
    Trash2,
    X,
    Printer,
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
import FormInput from '@/components/ui/form-input';
import FormSelect from '@/components/ui/form-select';
import TablePagination from '@/components/ui/table-pagination';
import { PDFViewer } from '@react-pdf/renderer';
import ReporteControlFrio from '@/pdf/ReporteControlFrio';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Servicios de Frío', href: '/planta-lacteos/servicios-frios' },
];

interface ServicioFrio {
    id: number;
    tiempo: string;
    display1: number | null;
    display2: number | null;
    display3: number | null;
    termometro_mano: number | null;
    separacion_pared: boolean;
    observaciones: string | null;
    usuario?: {
        id: number;
        name: string;
        apellido: string;
    };
    lugar?: {
        id: number;
        nombre: string;
    };
}

interface PageProps {
    serviciosFrios: {
        data: ServicioFrio[];
        links: any[];
        current_page: number;
        last_page: number;
        per_page: number;
        total: number;
    };
    filters: {
        user_id?: string;
        lugar_id?: string;
        fecha_inicio?: string;
        fecha_fin?: string;
        per_page?: string;
    };
    usuarios?: { id: number; name: string; apellido: string }[];
    lugares?: { id: number; nombre: string }[];
    flash: {
        success?: string;
        error?: string;
    };
}

export default function Index() {
    const { props } = usePage();
    const { hasPermission } = useAuth();
    const [showFilters, setShowFilters] = useState(false);
    const [modalOpen, setModalOpen] = useState(false);
    const [editingServicio, setEditingServicio] = useState<ServicioFrio | null>(null);

    // Estados para el PDF combinado
    const [fechaDesde, setFechaDesde] = useState('');
    const [fechaHasta, setFechaHasta] = useState('');
    const [datosPdf, setDatosPdf] = useState<any>(null);
    const [mostrarPdf, setMostrarPdf] = useState(false);
    const [generandoPdf, setGenerandoPdf] = useState(false);
    const urlPdf = route('control-frio.pdf');

    const {
        serviciosFrios = {
            data: [],
            links: [],
            current_page: 1,
            last_page: 1,
            per_page: 10,
            total: 0,
        },
        filters: initialFilters = {},
        usuarios = [],
        lugares = [],
        flash,
    } = props as unknown as PageProps;

    const { filters, updateFilter, resetFilters } = useAdvancedFilters({
        routeName: 'servicios-frios.index',
        initialFilters: {
            user_id: initialFilters.user_id || undefined,
            lugar_id: initialFilters.lugar_id || undefined,
            fecha_inicio: initialFilters.fecha_inicio || undefined,
            fecha_fin: initialFilters.fecha_fin || undefined,
            per_page: initialFilters.per_page?.toString() || '10',
        },
        debounceFields: [],
        debounceDelay: 600,
    });

    function toDatetimeLocal(date = new Date()) {
        const pad = (n: number) => String(n).padStart(2, '0');
        const y = date.getFullYear();
        const m = pad(date.getMonth() + 1);
        const d = pad(date.getDate());
        const hh = pad(date.getHours());
        const mm = pad(date.getMinutes());
        return `${y}-${m}-${d}T${hh}:${mm}`;
    }

    const { data: formData, setData: setFormData, post, put, processing, errors, reset } = useForm({
        tiempo: toDatetimeLocal(),
        lugar_id: '',
        display1: '',
        display2: '',
        display3: '',
        termometro_mano: '',
        separacion_pared: true,
        observaciones: '',
    });

    const hasActiveFilters = Object.values(filters).some(
        (value) => value && value !== '' && value !== '10',
    );

    // Funciones para el PDF
    const fetchDatosPdf = async () => {
        if (!fechaDesde || !fechaHasta) throw new Error('Seleccione ambas fechas');
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

    // Funciones existentes (sin cambios)
    const handleCreate = () => {
        setEditingServicio(null);
        reset();
        setFormData({
            tiempo: toDatetimeLocal(),
            lugar_id: '',
            display1: '',
            display2: '',
            display3: '',
            termometro_mano: '',
            separacion_pared: true,
            observaciones: '',
        });
        setModalOpen(true);
    };

    const handleEdit = (servicio: ServicioFrio) => {
        setEditingServicio(servicio);
        setFormData({
            tiempo: servicio.tiempo ? toDatetimeLocal(new Date(servicio.tiempo)) : toDatetimeLocal(),
            lugar_id: servicio.lugar?.id.toString() || '',
            display1: servicio.display1?.toString() || '',
            display2: servicio.display2?.toString() || '',
            display3: servicio.display3?.toString() || '',
            termometro_mano: servicio.termometro_mano?.toString() || '',
            separacion_pared: servicio.separacion_pared,
            observaciones: servicio.observaciones || '',
        });
        setModalOpen(true);
    };

    const handleDelete = (id: number) => {
        if (confirm('¿Está seguro de eliminar este registro?')) {
            router.delete(route('servicios-frios.destroy', id), {
                preserveScroll: true,
            });
        }
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (editingServicio) {
            put(route('servicios-frios.update', editingServicio.id), {
                onSuccess: () => {
                    setModalOpen(false);
                    reset();
                },
            });
        } else {
            post(route('servicios-frios.store'), {
                onSuccess: () => {
                    setModalOpen(false);
                    reset();
                },
            });
        }
    };

    const formatFecha = (fecha: string) => {
        return new Date(fecha).toLocaleDateString('es-ES', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        });
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Servicios de Frío" />
            <div className="space-y-2 px-2 py-2 sm:px-6">
                <Toast />

                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <h1 className="text-2xl font-bold text-foreground">
                            Control de Servicios de Frío
                        </h1>
                        <p className="text-sm text-muted-foreground">
                            Registro de temperaturas y controles en servicios de frío
                        </p>
                    </div>

                    <div className="flex items-center gap-2">
                        {hasPermission('c_servicioFrio') && (
                            <Button onClick={() => router.visit(route('servicios-frios.create'))}>
                                <Plus className="h-4 w-4" />
                                <span>Nuevo Registro</span>
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

                {/* SECCIÓN PARA GENERAR PDF (CONTROL DE FRÍO) */}
                <div className="rounded-lg border border-border bg-muted/50 p-4">
                    <h3 className="mb-3 font-semibold text-foreground">Generar Reporte Control de Frío</h3>
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

                {/* Filtros */}
                {showFilters && (
                    <div className="rounded-lg border border-border bg-muted/50 p-2">
                        <div className="mb-3 flex items-center justify-between">
                            <h3 className="font-semibold text-foreground">Filtros avanzados</h3>
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

                        <div className="grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-4">
                            <FilterSelect
                                value={filters.lugar_id}
                                onChange={(v) => updateFilter('lugar_id', v)}
                                placeholder="Todos los lugares"
                                options={lugares.map((l) => ({
                                    value: l.id.toString(),
                                    label: l.nombre,
                                }))}
                            />

                            <FilterSelect
                                value={filters.user_id}
                                onChange={(v) => updateFilter('user_id', v)}
                                placeholder="Todos los usuarios"
                                options={usuarios.map((u) => ({
                                    value: u.id.toString(),
                                    label: `${u.name} ${u.apellido}`,
                                }))}
                            />

                            <div>
                                <label className="mb-1 block text-sm font-medium">Fecha Inicio</label>
                                <Input
                                    type="date"
                                    value={filters.fecha_inicio || ''}
                                    onChange={(e) => updateFilter('fecha_inicio', e.target.value)}
                                />
                            </div>

                            <div>
                                <label className="mb-1 block text-sm font-medium">Fecha Fin</label>
                                <Input
                                    type="date"
                                    value={filters.fecha_fin || ''}
                                    onChange={(e) => updateFilter('fecha_fin', e.target.value)}
                                />
                            </div>

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

                {/* Tabla de registros */}
                <Card>
                    <div className="overflow-x-auto">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead className="w-[140px]">Fecha/Hora</TableHead>
                                    <TableHead>Lugar</TableHead>
                                    <TableHead>Display 1</TableHead>
                                    <TableHead>Display 2</TableHead>
                                    <TableHead>Display 3</TableHead>
                                    <TableHead>Termómetro Mano</TableHead>
                                    <TableHead>Separación Pared</TableHead>
                                    <TableHead>Usuario</TableHead>
                                    <TableHead className="w-[100px]">Acciones</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {serviciosFrios.data.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={9} className="py-8 text-center text-muted-foreground">
                                            <div className="flex flex-col items-center justify-center">
                                                <Refrigerator className="mb-3 h-12 w-12 text-muted-foreground/50" />
                                                <p className="mb-1 text-lg font-medium text-foreground">
                                                    No se encontraron registros
                                                </p>
                                                <p className="text-muted-foreground">
                                                    {hasActiveFilters
                                                        ? 'Intenta ajustar los filtros para ver más resultados'
                                                        : 'No hay registros de servicios de frío en el sistema'}
                                                </p>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    serviciosFrios.data.map((servicio) => (
                                        <TableRow key={servicio.id} className="hover:bg-muted/50">
                                            <TableCell>
                                                <div className="font-medium">
                                                    {formatFecha(servicio.tiempo)}
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                {servicio.lugar?.nombre || '-'}
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex items-center gap-1">
                                                    <Thermometer className="h-4 w-4 text-blue-500" />
                                                    <span className={servicio.display1 != null ? 'font-medium' : 'text-muted-foreground'}>
                                                        {servicio.display1 != null ? `${servicio.display1}°C` : '-'}
                                                    </span>
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                {servicio.display2 != null ? `${servicio.display2}°C` : '-'}
                                            </TableCell>
                                            <TableCell>
                                                {servicio.display3 != null ? `${servicio.display3}°C` : '-'}
                                            </TableCell>
                                            <TableCell>
                                                {servicio.termometro_mano != null ? `${servicio.termometro_mano}°C` : '-'}
                                            </TableCell>
                                            <TableCell>
                                                <span className={servicio.separacion_pared ? 'text-green-600' : 'text-red-600'}>
                                                    {servicio.separacion_pared ? 'Sí' : 'No'}
                                                </span>
                                            </TableCell>
                                            <TableCell>
                                                {servicio.usuario
                                                    ? `${servicio.usuario.name} ${servicio.usuario.apellido}`
                                                    : '-'}
                                            </TableCell>
                                            <TableCell>
                                                <DropdownMenu>
                                                    <DropdownMenuTrigger asChild>
                                                        <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                                                            <MoreHorizontal className="h-4 w-4" />
                                                        </Button>
                                                    </DropdownMenuTrigger>
                                                    <DropdownMenuContent align="end" className="w-48">
                                                        {hasPermission('u_servicioFrio') && (
                                                            <DropdownMenuItem onClick={() => handleEdit(servicio)}>
                                                                <Pencil className="mr-2 h-4 w-4" />
                                                                <span>Editar</span>
                                                            </DropdownMenuItem>
                                                        )}
                                                        {hasPermission('d_servicioFrio') && (
                                                            <DropdownMenuItem
                                                                onClick={() => handleDelete(servicio.id)}
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

                    {serviciosFrios.data.length > 0 && (
                        <div className="border-t px-4 py-3">
                            <TablePagination
                                pagination={serviciosFrios}
                                onPageChange={(page) =>
                                    router.get(
                                        route('servicios-frios.index'),
                                        { ...filters, page },
                                        { preserveState: true, replace: true },
                                    )
                                }
                            />
                        </div>
                    )}
                </Card>

                <div className="flex items-center justify-between">
                    <p className="text-muted-foreground">
                        {serviciosFrios.total} registros totales
                    </p>
                </div>
            </div>

            {/* Modal Crear/Editar (sin cambios) */}
            <Dialog open={modalOpen} onOpenChange={setModalOpen}>
                <DialogContent className="max-w-lg">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                            <Refrigerator className="h-5 w-5 text-blue-600" />
                            {editingServicio ? 'Editar Registro' : 'Nuevo Registro de Servicio Frío'}
                        </DialogTitle>
                        <DialogDescription>
                            {editingServicio
                                ? 'Modifique los datos del registro de servicio frío'
                                : 'Complete los datos para un nuevo registro de servicio frío'}
                        </DialogDescription>
                    </DialogHeader>

                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                            <FormInput
                                id="tiempo"
                                label="Fecha y Hora"
                                type="datetime-local"
                                value={formData.tiempo}
                                onChange={(e) => setFormData('tiempo', e.target.value)}
                                error={errors.tiempo}
                                required
                            />

                            <FormSelect
                                label="Lugar"
                                value={formData.lugar_id}
                                onChange={(v) => setFormData('lugar_id', v)}
                                placeholder="Seleccione lugar"
                                options={lugares.map((l) => ({
                                    value: l.id.toString(),
                                    label: l.nombre,
                                }))}
                                error={errors.lugar_id}
                            />
                        </div>

                        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                            <FormInput
                                id="display1"
                                label="Display 1 (°C)"
                                type="number"
                                step="0.01"
                                value={formData.display1}
                                onChange={(e) => setFormData('display1', e.target.value)}
                                placeholder="0.00"
                                error={errors.display1}
                            />

                            <FormInput
                                id="display2"
                                label="Display 2 (°C)"
                                type="number"
                                step="0.01"
                                value={formData.display2}
                                onChange={(e) => setFormData('display2', e.target.value)}
                                placeholder="0.00"
                                error={errors.display2}
                            />

                            <FormInput
                                id="display3"
                                label="Display 3 (°C)"
                                type="number"
                                step="0.01"
                                value={formData.display3}
                                onChange={(e) => setFormData('display3', e.target.value)}
                                placeholder="0.00"
                                error={errors.display3}
                            />

                            <FormInput
                                id="termometro_mano"
                                label="Termómetro de Mano (°C)"
                                type="number"
                                step="0.01"
                                value={formData.termometro_mano}
                                onChange={(e) => setFormData('termometro_mano', e.target.value)}
                                placeholder="0.00"
                                error={errors.termometro_mano}
                            />

                            <div className="flex items-center space-x-2 pt-2">
                                <input
                                    type="checkbox"
                                    id="separacion_pared"
                                    checked={formData.separacion_pared}
                                    onChange={(e) => setFormData('separacion_pared', e.target.checked)}
                                    className="rounded border-gray-300"
                                />
                                <label htmlFor="separacion_pared" className="font-medium text-foreground">
                                    Separación de Pared
                                </label>
                            </div>
                        </div>

                        <FormInput
                            id="observaciones"
                            label="Observaciones"
                            value={formData.observaciones}
                            onChange={(e) => setFormData('observaciones', e.target.value)}
                            placeholder="Observaciones adicionales..."
                            error={errors.observaciones}
                        />

                        <DialogFooter>
                            <Button type="button" variant="outline" onClick={() => setModalOpen(false)}>
                                Cancelar
                            </Button>
                            <Button type="submit" disabled={processing}>
                                {processing ? 'Guardando...' : editingServicio ? 'Actualizar' : 'Crear'}
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>

            {/* Modal PDF */}
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
                                <h3 className="text-lg font-semibold text-gray-800">Reporte Control de Frío</h3>
                                <p className="text-sm text-gray-600">
                                    {datosPdf.fecha_desde} al {datosPdf.fecha_hasta}
                                </p>
                            </div>
                        </div>
                        <div className="h-full pt-14">
                            <PDFViewer style={{ width: '100%', height: '100%', border: 'none' }}>
                                <ReporteControlFrio data={datosPdf} />
                            </PDFViewer>
                        </div>
                    </div>
                </div>
            )}
        </AppLayout>
    );
}