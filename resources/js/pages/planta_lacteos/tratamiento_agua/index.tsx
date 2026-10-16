// resources/js/Pages/planta_lacteos/tratamiento_agua/index.tsx

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
    Dialog,
    DialogContent,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Toast } from '@/components/ui/toast';
import { useAuth } from '@/hooks/useAuth';
import { useAdvancedFilters } from '@/hooks/use-advanced-filters';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, router, usePage } from '@inertiajs/react';
import { Calendar, Edit, Play, Trash, Filter, Search, X } from 'lucide-react';
import { useState } from 'react';
import { route } from 'ziggy-js';
import { PDFViewer } from '@react-pdf/renderer';
import ReporteTratamientoAgua from '@/pdf/ReporteTratamientoAgua';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import TablePagination from '@/components/ui/table-pagination';
import FilterInput from '@/components/ui/filter-input';
import FilterSelect from '@/components/ui/filter-select';


// ✅ Funciones de formateo inline
function formatDecimal(value: string | number | null | undefined): string {
    if (value === null || value === undefined || value === '') {
        return '-';
    }

    const num = typeof value === 'string' ? parseFloat(value) : value;

    if (isNaN(num)) {
        return '-';
    }

    const str = num.toString();

    if (str.includes('.')) {
        return str.replace(/\.?0+$/, '');
    }

    return str;
}

function formatInputValue(value: string | number | null | undefined): string {
    if (value === null || value === undefined || value === '') {
        return '';
    }

    const num = typeof value === 'string' ? parseFloat(value) : value;

    if (isNaN(num)) {
        return '';
    }

    return num.toString();
}

interface Registro {
    id: number;
    user_id: number | null;
    tiempo_analisis: string;
    turno: 'mañana' | 'tarde' | null;
    flujometro_aire: string | null;
    flujometro_agua: string | null;
    t_nivel: string | null;
    reactor: string | null;
    t_balanceo: string | null;
    purgado: boolean | null;
    observaciones: string | null;
    numero_registro?: number;
    user?: {
        id: number;
        name: string;
        apellido: string;
    };
}

interface PageProps {
    fecha: string;
    mañana: Registro[];
    tarde: Registro[];
    completo: boolean;
    existenRegistros: boolean;
    historicos: {
        data: Registro[];
        links: any[];
        current_page: number;
        last_page: number;
        per_page: number;
        total: number;
    };
    usuarios: { id: number; name: string; apellido: string }[];
    filters: {
        search?: string;
        turno?: string;
        usuario?: string;
        fecha_desde?: string;
        fecha_hasta?: string;
        per_page?: number;
    };
    flash: {
        success?: string;
        error?: string;
    };
}

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Tratamiento Agua Residual', href: '#' },
];

export default function Index() {

    const {
            hasPermission,
            belongsToUbicacion,
            canDo,
            isAdmin: isAdminFromAuth,
            user: authUser,
        } = useAuth();

    const { props } = usePage<PageProps>();
    const [editModalOpen, setEditModalOpen] = useState(false);
    const [registroEdit, setRegistroEdit] = useState<Registro | null>(null);
    const [showFilters, setShowFilters] = useState(false);
    const [formData, setFormData] = useState({
        flujometro_aire: '',
        flujometro_agua: '',
        t_nivel: '',
        reactor: '',
        t_balanceo: '',
        purgado: false,
        observaciones: '',
    });

    const { fecha, mañana, tarde, completo, existenRegistros, historicos, usuarios, flash, filters: initialFilters } = props;

    const { filters, updateFilter, resetFilters } = useAdvancedFilters({
        routeName: 'tratamiento-agua.index',
        initialFilters: {
            search: initialFilters.search || '',
            turno: initialFilters.turno || '',
            usuario: initialFilters.usuario || '',
            fecha_desde: initialFilters.fecha_desde || '',
            fecha_hasta: initialFilters.fecha_hasta || '',
            per_page: initialFilters.per_page?.toString() || '10',
        },
        debounceFields: ['search'],
        debounceDelay: 600,
    });

    const hasActiveFilters = Object.values(filters).some(
        (v) => v && v !== '' && v !== '10',
    );

    // Estados para reporte por día
    const [fechaReporte, setFechaReporte] = useState(fecha ?? new Date().toISOString().slice(0,10));
    const [datosPdf, setDatosPdf] = useState<any[]>([]);
    const [mostrarPdf, setMostrarPdf] = useState(false);
    const [generandoPdf, setGenerandoPdf] = useState(false);

    const handleGenerarPdf = async () => {
        if (!fechaReporte) {
            alert('Selecciona una fecha para generar el reporte');
            return;
        }
        setGenerandoPdf(true);
        try {
            const params = new URLSearchParams();
            params.append('fecha', fechaReporte);
            let baseUrl = '';
            try {
                baseUrl = route('tratamiento-agua.pdf');
            } catch (e) {
                baseUrl = '/tratamiento-agua/pdf';
            }
            const res = await fetch(baseUrl + '?' + params.toString());
            if (!res.ok) throw new Error(await res.text());
            const json = await res.json();
            const registros = json.registros || [];
            if (!Array.isArray(registros) || registros.length === 0) {
                alert('No hay registros para la fecha seleccionada');
                return;
            }
            setDatosPdf(registros);
            setMostrarPdf(true);
        } catch (e) {
            console.error(e);
            alert('Error al generar el reporte');
        } finally {
            setGenerandoPdf(false);
        }
    };

    const handleIniciarDia = () => {
        if (confirm('¿Crear los 6 registros del día con horarios predefinidos?')) {
            router.post(route('tratamiento-agua.iniciar'), { fecha }, {
                preserveScroll: true,
            });
        }
    };

    const openEditModal = (registro: Registro) => {
        setRegistroEdit(registro);
        setFormData({
            flujometro_aire: formatInputValue(registro.flujometro_aire),
            flujometro_agua: formatInputValue(registro.flujometro_agua),
            t_nivel: formatInputValue(registro.t_nivel),
            reactor: formatInputValue(registro.reactor),
            t_balanceo: formatInputValue(registro.t_balanceo),
            purgado: registro.purgado || false,
            observaciones: registro.observaciones || '',
        });
        setEditModalOpen(true);
    };

    const saveEdit = () => {
        if (!registroEdit) return;

        router.put(route('tratamiento-agua.update', registroEdit.id), formData, {
            preserveScroll: true,
            onSuccess: () => {
                setEditModalOpen(false);
                setRegistroEdit(null);
            },
        });
    };

    const deleteRegistro = (id: number) => {
        if (confirm('¿Estás seguro de eliminar este registro?')) {
            router.delete(route('tratamiento-agua.destroy', id), {
                preserveScroll: true,
            });
        }
    };

    const renderRegistroCard = (registros: Registro[], turno: string) => {
        const isCompleto = registros.length === 3;
        const turnoLabel = turno === 'mañana' ? '🌅 Mañana' : '🌇 Tarde';

        return (
            <Card className="flex-1">
                <CardHeader className="pb-2">
                    <div className="flex items-center justify-between">
                        <CardTitle className="text-lg">{turnoLabel}</CardTitle>
                        <span className={`text-sm font-medium ${isCompleto ? 'text-green-600' : 'text-yellow-600'}`}>
                            {registros.length}/3
                        </span>
                    </div>
                </CardHeader>
                <CardContent className="space-y-2">
                    {registros.length === 0 ? (
                        <div className="py-4 text-center text-sm text-muted-foreground">
                            <p>Sin registros</p>
                            <p className="text-xs">Presiona "Iniciar Día" para crear</p>
                        </div>
                    ) : (
                        registros.map((reg) => (
                            <div
                                key={reg.id}
                                className={`rounded-lg border p-3 transition-colors
                                `}
                            >
                                <div className="flex items-start justify-between">
                                    <div className="flex-1">
                                        <div className="flex items-center gap-2">
                                            <span className="font-semibold text-sm">#{reg.numero_registro || '-'}</span>
                                            {reg.purgado && (
                                                <span className="rounded-full bg-green-100 px-2 py-0.5 text-xs font-medium text-green-700">
                                                    ✅ Purgado
                                                </span>
                                            )}
                                            {reg.user_id && reg.user && (
                                                <span className="text-xs text-muted-foreground">
                                                    👤 {reg.user.name} {reg.user.apellido || ''}
                                                </span>
                                            )}
                                        </div>
                                        <div className="mt-1 grid grid-cols-3 gap-2 text-sm">
                                            <div>
                                                <span className="text-muted-foreground">Aire:</span>
                                                <span className="ml-1 font-mono">{formatDecimal(reg.flujometro_aire)}</span>
                                            </div>
                                            <div>
                                                <span className="text-muted-foreground">Agua:</span>
                                                <span className="ml-1 font-mono">{formatDecimal(reg.flujometro_agua)}</span>
                                            </div>
                                            <div></div>
                                            <div>
                                                <span className="text-muted-foreground">Nivel:</span>
                                                <span className="ml-1 font-mono">{formatDecimal(reg.t_nivel)}</span>
                                            </div>
                                            <div>
                                                <span className="text-muted-foreground">Reactor:</span>
                                                <span className="ml-1 font-mono">{formatDecimal(reg.reactor)}</span>
                                            </div>
                                            <div>
                                                <span className="text-muted-foreground">Balanceo:</span>
                                                <span className="ml-1 font-mono">{formatDecimal(reg.t_balanceo)}</span>
                                            </div>
                                        </div>
                                        {reg.observaciones && (
                                            <p className="mt-1 text-xs text-muted-foreground truncate">
                                                📝 {reg.observaciones}
                                            </p>
                                        )}
                                        <div className="mt-1 text-xs text-muted-foreground">
                                            🕐 {reg.tiempo_analisis ? new Date(reg.tiempo_analisis).toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' }) : '-'}
                                        </div>
                                    </div>
                                    <div className="flex gap-1">
                                        <Button
                                            size="sm"
                                            variant="ghost"
                                            onClick={() => openEditModal(reg)}
                                            disabled={!hasPermission('u_tratamientoAgua')}
                                        >
                                            <Edit className="h-4 w-4" />
                                        </Button>
                                        {hasPermission('d_tratamientoAgua') && (
                                            <Button
                                                size="sm"
                                                variant="ghost"
                                                className="text-red-500 hover:text-red-700"
                                                onClick={() => deleteRegistro(reg.id)}
                                            >
                                                <Trash className="h-4 w-4" />
                                            </Button>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ))
                    )}
                </CardContent>
            </Card>
        );
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Tratamiento Agua Residual" />
            <div className="space-y-4 px-4 py-4 sm:px-6">
                <Toast />

                {/* Header */}
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <h1 className="text-2xl font-bold">Tratamiento de Agua Residual</h1>
                    </div>
                    <div className="flex gap-2">
                        {!existenRegistros && hasPermission('c_tratamientoAgua') && (
                            <Button onClick={handleIniciarDia}>
                                <Play className="mr-2 h-4 w-4" />
                                Iniciar Día
                            </Button>
                        )}
                        {/* {existenRegistros && completo && (
                            <div className="rounded-lg bg-green-100 px-4 py-2 text-green-700">
                                ✅ Día completado
                            </div>
                        )} */}
                    </div>
                </div>

                {/* Cards de turnos */}
                <div className="flex flex-col gap-4 md:flex-row">
                    {renderRegistroCard(mañana, 'mañana')}
                    {renderRegistroCard(tarde, 'tarde')}
                </div>

                {/* ✅ SECCIÓN DE HISTÓRICOS - TABLA CON FILTROS Y PAGINACIÓN */}
                <div className="mt-8">
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-xl font-semibold">📊 Histórico de Registros</h2>
                        <div className="flex gap-2">
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setShowFilters(!showFilters)}
                                className="flex items-center gap-2"
                            >
                                <Filter className="h-4 w-4" />
                                <span>Filtros</span>
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
                        <div className="rounded-lg border border-border bg-muted/50 p-3 mb-4">
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
                            <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
                                <FilterInput
                                    value={filters.search}
                                    onChange={(v) => updateFilter('search', v)}
                                    placeholder="Buscar..."
                                />
                                <FilterSelect
                                    value={filters.turno}
                                    onChange={(v) => updateFilter('turno', v)}
                                    placeholder="Turno"
                                    options={[
                                        { value: 'mañana', label: 'Mañana' },
                                        { value: 'tarde', label: 'Tarde' },
                                    ]}
                                />
                                <FilterSelect
                                    value={filters.usuario}
                                    onChange={(v) => updateFilter('usuario', v)}
                                    placeholder="Usuario"
                                    options={usuarios.map((u) => ({
                                        value: u.name,
                                        label: `${u.name} ${u.apellido || ''}`,
                                    }))}
                                />
                                <Input
                                    type="date"
                                    value={filters.fecha_desde}
                                    onChange={(e) => updateFilter('fecha_desde', e.target.value)}
                                    placeholder="Desde"
                                    className="col-span-1"
                                />
                                <Input
                                    type="date"
                                    value={filters.fecha_hasta}
                                    onChange={(e) => updateFilter('fecha_hasta', e.target.value)}
                                    placeholder="Hasta"
                                    className="col-span-1"
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

                    {/* Tabla de históricos */}
                    <div className="overflow-hidden rounded-lg border bg-background shadow-sm">
                        <div className="overflow-x-auto">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Fecha</TableHead>
                                        <TableHead>#</TableHead>
                                        <TableHead>Turno</TableHead>
                                        <TableHead>Hora</TableHead>
                                        <TableHead>Aire</TableHead>
                                        <TableHead>Agua</TableHead>
                                        <TableHead>Nivel</TableHead>
                                        <TableHead>Reactor</TableHead>
                                        <TableHead>Balanceo</TableHead>
                                        <TableHead>Purgado</TableHead>
                                        <TableHead>Usuario</TableHead>
                                        <TableHead>Observaciones</TableHead>
                                        <TableHead></TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {historicos.data.length === 0 ? (
                                        <TableRow>
                                            <TableCell colSpan={13} className="py-8 text-center text-muted-foreground">
                                                No hay registros históricos
                                            </TableCell>
                                        </TableRow>
                                    ) : (
                                        historicos.data.map((reg) => (
                                            <TableRow key={reg.id} className="hover:bg-muted/50">
                                                <TableCell className="whitespace-nowrap">
                                                    {new Date(reg.tiempo_analisis).toLocaleDateString('es-ES')}
                                                </TableCell>
                                                <TableCell className="font-mono">{reg.numero_registro || '-'}</TableCell>
                                                <TableCell className="capitalize">{reg.turno || '-'}</TableCell>
                                                <TableCell>
                                                    {reg.tiempo_analisis
                                                        ? new Date(reg.tiempo_analisis).toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })
                                                        : '-'
                                                    }
                                                </TableCell>
                                                <TableCell className="font-mono">{formatDecimal(reg.flujometro_aire)}</TableCell>
                                                <TableCell className="font-mono">{formatDecimal(reg.flujometro_agua)}</TableCell>
                                                <TableCell className="font-mono">{formatDecimal(reg.t_nivel)}</TableCell>
                                                <TableCell className="font-mono">{formatDecimal(reg.reactor)}</TableCell>
                                                <TableCell className="font-mono">{formatDecimal(reg.t_balanceo)}</TableCell>
                                                <TableCell>
                                                    {reg.purgado ? (
                                                        <span className="rounded-full bg-green-100 px-2 py-0.5 text-xs font-medium text-green-700">✅</span>
                                                    ) : (
                                                        <span className="text-muted-foreground">-</span>
                                                    )}
                                                </TableCell>
                                                <TableCell className="text-sm">
                                                    {reg.user ? `${reg.user.name} ${reg.user.apellido || ''}` : '-'}
                                                </TableCell>
                                                <TableCell className="max-w-[150px] truncate text-sm">
                                                    {reg.observaciones || '-'}
                                                </TableCell>
                                                <TableCell>
                                                    <div className="flex gap-1">
                                                        <Button
                                                            size="sm"
                                                            variant="ghost"
                                                            onClick={() => openEditModal(reg)}
                                                            disabled={!hasPermission('u_tratamientoAgua')}
                                                        >
                                                            <Edit className="h-4 w-4" />
                                                        </Button>
                                                        {hasPermission('d_tratamientoAgua') && (
                                                            <Button
                                                                size="sm"
                                                                variant="ghost"
                                                                className="text-red-500 hover:text-red-700"
                                                                onClick={() => deleteRegistro(reg.id)}
                                                            >
                                                                <Trash className="h-4 w-4" />
                                                            </Button>
                                                        )}
                                                    </div>
                                                </TableCell>
                                            </TableRow>
                                        ))
                                    )}
                                </TableBody>
                            </Table>
                        </div>

                        {historicos.data.length > 0 && (
                            <div className="border-t px-4 py-3">
                                <TablePagination
                                    pagination={historicos}
                                    onPageChange={(page) =>
                                        router.get(
                                            route('tratamiento-agua.index'),
                                            { ...filters, page, fecha },
                                            { preserveState: true, replace: true }
                                        )
                                    }
                                />
                            </div>
                        )}
                    </div>

                    <p className="mt-2 text-sm text-muted-foreground">
                        {historicos.total} registros históricos encontrados
                    </p>
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
                                        <h3 className="text-lg font-semibold text-gray-800">Reporte Tratamiento Agua Residual</h3>
                                        <p className="text-sm text-gray-600">{fechaReporte}</p>
                                    </div>
                                </div>
                                <div className="h-full pt-14">
                                    <PDFViewer style={{ width: '100%', height: '100%', border: 'none' }}>
                                        <ReporteTratamientoAgua datos={datosPdf} fecha={fechaReporte} />
                                    </PDFViewer>
                                </div>
                            </div>
                        </div>
                    )}
                    {/* Bloque de reporte por día */}
                    <div className="mt-4 rounded-lg border bg-white p-4 shadow-sm">
                        <h3 className="text-lg font-medium mb-3">Generar reporte del día</h3>
                        <div className="flex items-end gap-3">
                            <div>
                                <label className="text-sm font-medium">Fecha</label>
                                <Input type="date" value={fechaReporte} onChange={(e) => setFechaReporte(e.target.value)} />
                            </div>
                            <div className="flex gap-2">
                                <Button variant="outline" size="sm" onClick={handleGenerarPdf} disabled={generandoPdf}>{generandoPdf ? 'Generando...' : 'Generar PDF'}</Button>
                                <Button variant="ghost" size="sm" onClick={() => setFechaReporte(fecha)}>Limpiar</Button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Modal de edición */}
            <Dialog open={editModalOpen} onOpenChange={setEditModalOpen}>
                <DialogContent className="sm:max-w-2xl max-h-[90vh] flex flex-col">
                    <DialogHeader>
                        <DialogTitle>
                            Editar Registro #{registroEdit?.numero_registro || '-'} - {registroEdit?.turno || ''}
                        </DialogTitle>
                    </DialogHeader>

                    <div className="flex-1 overflow-y-auto px-1 py-2 space-y-4">
                        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                            <div>
                                <label className="text-sm font-medium">Flujómetro de Aire</label>
                                <Input
                                    type="number"
                                    step="0.00001"
                                    placeholder="0"
                                    value={formData.flujometro_aire}
                                    onChange={(e) =>
                                        setFormData({ ...formData, flujometro_aire: e.target.value })
                                    }
                                />
                            </div>
                            <div>
                                <label className="text-sm font-medium">Flujómetro de Agua</label>
                                <Input
                                    type="number"
                                    step="0.00001"
                                    placeholder="0"
                                    value={formData.flujometro_agua}
                                    onChange={(e) =>
                                        setFormData({ ...formData, flujometro_agua: e.target.value })
                                    }
                                />
                            </div>
                            <div>
                                <label className="text-sm font-medium">T. Nivel</label>
                                <Input
                                    type="number"
                                    step="0.00001"
                                    placeholder="0"
                                    value={formData.t_nivel}
                                    onChange={(e) =>
                                        setFormData({ ...formData, t_nivel: e.target.value })
                                    }
                                />
                            </div>
                            <div>
                                <label className="text-sm font-medium">Reactor</label>
                                <Input
                                    type="number"
                                    step="0.00001"
                                    placeholder="0"
                                    value={formData.reactor}
                                    onChange={(e) =>
                                        setFormData({ ...formData, reactor: e.target.value })
                                    }
                                />
                            </div>
                            <div className="sm:col-span-2">
                                <label className="text-sm font-medium">T. Balanceo</label>
                                <Input
                                    type="number"
                                    step="0.00001"
                                    placeholder="0"
                                    value={formData.t_balanceo}
                                    onChange={(e) =>
                                        setFormData({ ...formData, t_balanceo: e.target.value })
                                    }
                                />
                            </div>
                        </div>

                        <div className="flex items-center gap-3 rounded-lg border p-3">
                            <label className="text-sm font-medium cursor-pointer">
                                <input
                                    type="checkbox"
                                    checked={formData.purgado}
                                    onChange={(e) =>
                                        setFormData({ ...formData, purgado: e.target.checked })
                                    }
                                    className="mr-2 h-4 w-4 rounded border-gray-300 text-green-600 focus:ring-green-500"
                                />
                                Purgado
                            </label>
                        </div>

                        <div>
                            <label className="text-sm font-medium">Observaciones</label>
                            <Textarea
                                placeholder="Observaciones..."
                                rows={2}
                                value={formData.observaciones}
                                onChange={(e) =>
                                    setFormData({ ...formData, observaciones: e.target.value })
                                }
                            />
                        </div>
                    </div>

                    <DialogFooter className="border-t pt-4 mt-2">
                        <Button variant="outline" onClick={() => setEditModalOpen(false)}>
                            Cancelar
                        </Button>
                        <Button onClick={saveEdit}>Guardar</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </AppLayout>
    );
}
