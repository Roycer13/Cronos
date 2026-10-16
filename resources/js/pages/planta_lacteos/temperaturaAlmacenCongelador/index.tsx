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
    Thermometer,
    Trash2,
    X,
    Snowflake,
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
import ReporteAlmacenTemperaturas from '@/pdf/ReporteAlmacenTemperaturas';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Temperaturas Almacén/Congelador', href: '/planta-lacteos/temperaturas-almacen-congelador' },
];

interface Temperatura {
    id: number;
    tiempo: string;
    temperatura: number | null;
    humedad: number | null;
    ident: boolean;
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
    temperaturas: {
        data: Temperatura[];
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
    const [editingTemperatura, setEditingTemperatura] = useState<Temperatura | null>(null);

    // Estados para el PDF
    const [fechaDesde, setFechaDesde] = useState('');
    const [fechaHasta, setFechaHasta] = useState('');
    const [datosPdf, setDatosPdf] = useState<any>(null);
    const [mostrarPdf, setMostrarPdf] = useState(false);
    const [generandoPdf, setGenerandoPdf] = useState(false);
    const urlPdf = route('almacen-temperaturas.pdf');

    const {
        temperaturas = {
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
        routeName: 'temperaturas-almacen-congelador.index',
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
        temperatura: '',
        humedad: '',
        ident: true,
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
        setEditingTemperatura(null);
        reset();
        setFormData({
            tiempo: toDatetimeLocal(),
            lugar_id: '',
            temperatura: '',
            humedad: '',
            ident: true,
            observaciones: '',
        });
        setModalOpen(true);
    };

    const handleEdit = (temperatura: Temperatura) => {
        setEditingTemperatura(temperatura);
        setFormData({
            tiempo: temperatura.tiempo ? toDatetimeLocal(new Date(temperatura.tiempo)) : toDatetimeLocal(),
            lugar_id: temperatura.lugar?.id.toString() || '',
            temperatura: temperatura.temperatura?.toString() || '',
            humedad: temperatura.humedad?.toString() || '',
            ident: temperatura.ident,
            observaciones: temperatura.observaciones || '',
        });
        setModalOpen(true);
    };

    const handleDelete = (id: number) => {
        if (confirm('¿Eliminar este registro?')) {
            router.delete(route('temperaturas-almacen-congelador.destroy', id), {
                preserveScroll: true,
            });
        }
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (editingTemperatura) {
            put(route('temperaturas-almacen-congelador.update', editingTemperatura.id), {
                onSuccess: () => {
                    setModalOpen(false);
                    reset();
                },
            });
        } else {
            post(route('temperaturas-almacen-congelador.store'), {
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
            <Head title="Temperaturas Almacén/Congelador" />
            <div className="space-y-2 px-2 py-2 sm:px-6">
                <Toast />

                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <h1 className="text-2xl font-bold flex items-center gap-2">
                            <Snowflake className="h-6 w-6" /> Temperaturas Almacén/Congelador
                        </h1>
                        <p className="text-sm text-muted-foreground">
                            Registro de temperaturas y humedad en almacenes y congeladores
                        </p>
                    </div>

                    <div className="flex gap-2">
                        {hasPermission('c_temperaturaAlmacenCongelador') && (
                            <Button onClick={() => router.visit(route('temperaturas-almacen-congelador.create'))}>
                                <Plus className="h-4 w-4 mr-2" /> Nuevo Registro
                            </Button>
                        )}
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setShowFilters(!showFilters)}
                            className="flex items-center gap-2"
                        >
                            <Filter className="h-4 w-4" />
                            {hasActiveFilters && <span className="ml-1 flex h-5 w-5 items-center justify-center rounded-full bg-primary text-xs text-primary-foreground">!</span>}
                        </Button>
                    </div>
                </div>

                {/* SECCIÓN PARA GENERAR PDF (ALMACÉN DE TEMPERATURAS) */}
                <div className="rounded-lg border border-border bg-muted/50 p-4">
                    <h3 className="mb-3 font-semibold text-foreground">Generar Reporte Almacén de Temperaturas</h3>
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
                    <div className="rounded-lg border bg-muted/50 p-3">
                        <div className="flex justify-between mb-3">
                            <h3 className="font-semibold">Filtros</h3>
                            {hasActiveFilters && (
                                <Button variant="ghost" size="sm" onClick={resetFilters}>
                                    <X className="h-4 w-4 mr-1" /> Limpiar
                                </Button>
                            )}
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                            <FilterSelect
                                value={filters.lugar_id}
                                onChange={(v) => updateFilter('lugar_id', v)}
                                placeholder="Lugar"
                                options={lugares.map((l) => ({
                                    value: l.id.toString(),
                                    label: l.nombre,
                                }))}
                            />
                            <FilterSelect
                                value={filters.user_id}
                                onChange={(v) => updateFilter('user_id', v)}
                                placeholder="Usuario"
                                options={usuarios.map((u) => ({
                                    value: u.id.toString(),
                                    label: `${u.name} ${u.apellido}`,
                                }))}
                            />
                            <Input
                                type="date"
                                value={filters.fecha_inicio || ''}
                                onChange={(e) => updateFilter('fecha_inicio', e.target.value)}
                                placeholder="Desde"
                            />
                            <Input
                                type="date"
                                value={filters.fecha_fin || ''}
                                onChange={(e) => updateFilter('fecha_fin', e.target.value)}
                                placeholder="Hasta"
                            />
                            <FilterSelect
                                value={filters.per_page}
                                onChange={(v) => updateFilter('per_page', v)}
                                placeholder="Por página"
                                options={['10', '25', '50', '100'].map((v) => ({ value: v, label: `${v} por página` }))}
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
                                    <TableHead>Temperatura</TableHead>
                                    <TableHead>Humedad</TableHead>
                                    <TableHead>Ident</TableHead>
                                    <TableHead>Usuario</TableHead>
                                    <TableHead>Observaciones</TableHead>
                                    <TableHead className="w-[100px]">Acciones</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {temperaturas.data.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={8} className="py-8 text-center text-muted-foreground">
                                            <div className="flex flex-col items-center justify-center">
                                                <Thermometer className="mb-3 h-12 w-12 text-muted-foreground/50" />
                                                <p className="mb-1 text-lg font-medium text-foreground">
                                                    No se encontraron registros
                                                </p>
                                                <p className="text-muted-foreground">
                                                    {hasActiveFilters
                                                        ? 'Intenta ajustar los filtros para ver más resultados'
                                                        : 'No hay registros de temperatura en el sistema'}
                                                </p>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    temperaturas.data.map((temperatura) => (
                                        <TableRow key={temperatura.id} className="hover:bg-muted/50">
                                            <TableCell>{formatFecha(temperatura.tiempo)}</TableCell>
                                            <TableCell>{temperatura.lugar?.nombre || '-'}</TableCell>
                                            <TableCell>
                                                <div className="flex items-center gap-1">
                                                    <Snowflake className="h-4 w-4 text-blue-500" />
                                                    <span className={temperatura.temperatura != null ? 'font-medium' : 'text-muted-foreground'}>
                                                        {temperatura.temperatura != null ? `${temperatura.temperatura}°C` : '-'}
                                                    </span>
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                {temperatura.humedad != null ? `${temperatura.humedad}%` : '-'}
                                            </TableCell>
                                            <TableCell>{temperatura.ident ? 'Sí' : 'No'}</TableCell>
                                            <TableCell>
                                                {temperatura.usuario
                                                    ? `${temperatura.usuario.name} ${temperatura.usuario.apellido}`
                                                    : '-'}
                                            </TableCell>
                                            <TableCell className="max-w-xs truncate">
                                                {temperatura.observaciones || '-'}
                                            </TableCell>
                                            <TableCell>
                                                <DropdownMenu>
                                                    <DropdownMenuTrigger asChild>
                                                        <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                                                            <MoreHorizontal className="h-4 w-4" />
                                                        </Button>
                                                    </DropdownMenuTrigger>
                                                    <DropdownMenuContent align="end" className="w-48">
                                                        {hasPermission('u_temperaturaAlmacenCongelador') && (
                                                            <DropdownMenuItem onClick={() => handleEdit(temperatura)}>
                                                                <Pencil className="mr-2 h-4 w-4" />
                                                                <span>Editar</span>
                                                            </DropdownMenuItem>
                                                        )}
                                                        {hasPermission('d_temperaturaAlmacenCongelador') && (
                                                            <DropdownMenuItem
                                                                onClick={() => handleDelete(temperatura.id)}
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

                    {temperaturas.data.length > 0 && (
                        <div className="border-t px-4 py-3">
                            <TablePagination
                                pagination={temperaturas}
                                onPageChange={(page) =>
                                    router.get(
                                        route('temperaturas-almacen-congelador.index'),
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
                        {temperaturas.total} registros totales
                    </p>
                </div>
            </div>

            {/* Modal Crear/Editar (sin cambios) */}
            <Dialog open={modalOpen} onOpenChange={setModalOpen}>
                <DialogContent className="max-w-md">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                            <Thermometer className="h-5 w-5 text-blue-600" />
                            {editingTemperatura ? 'Editar Registro' : 'Nuevo Registro de Temperatura'}
                        </DialogTitle>
                        <DialogDescription>
                            {editingTemperatura
                                ? 'Modifique los datos del registro de temperatura'
                                : 'Complete los datos para un nuevo registro de temperatura'}
                        </DialogDescription>
                    </DialogHeader>

                    <form onSubmit={handleSubmit} className="space-y-4">
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

                        <FormInput
                            id="temperatura"
                            label="Temperatura (°C)"
                            type="number"
                            step="0.01"
                            value={formData.temperatura}
                            onChange={(e) => setFormData('temperatura', e.target.value)}
                            placeholder="0.00"
                            error={errors.temperatura}
                        />

                        <FormInput
                            id="humedad"
                            label="Humedad (%)"
                            type="number"
                            step="0.01"
                            value={formData.humedad}
                            onChange={(e) => setFormData('humedad', e.target.value)}
                            placeholder="0.00"
                            error={errors.humedad}
                        />

                        <div className="flex items-center space-x-2">
                            <input
                                type="checkbox"
                                id="ident"
                                checked={formData.ident}
                                onChange={(e) => setFormData('ident', e.target.checked)}
                                className="rounded border-gray-300"
                            />
                            <label htmlFor="ident" className="font-medium text-foreground">
                                Ident
                            </label>
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
                                {processing ? 'Guardando...' : editingTemperatura ? 'Actualizar' : 'Crear'}
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
                                <h3 className="text-lg font-semibold text-gray-800">Reporte Almacén de Temperaturas</h3>
                                <p className="text-sm text-gray-600">
                                    {datosPdf.fecha_desde} al {datosPdf.fecha_hasta}
                                </p>
                            </div>
                        </div>
                        <div className="h-full pt-14">
                            <PDFViewer style={{ width: '100%', height: '100%', border: 'none' }}>
                                <ReporteAlmacenTemperaturas data={datosPdf} />
                            </PDFViewer>
                        </div>
                    </div>
                </div>
            )}
        </AppLayout>
    );
}