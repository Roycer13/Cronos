import AppLayout from '@/layouts/app-layout';
import FilterInput from '@/components/ui/filter-input';
import FilterSelect from '@/components/ui/filter-select';
import TablePagination from '@/components/ui/table-pagination';
import ReporteUtensilios from '@/pdf/ReporteUtensilios';
import { PDFViewer } from '@react-pdf/renderer';
import { useAdvancedFilters } from '@/hooks/use-advanced-filters';
import { type BreadcrumbItem } from '@/types';
import { Head, Link, router, usePage } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { route } from 'ziggy-js';
import { Download, Filter, Search, X } from 'lucide-react';
import { useState } from 'react';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Utensilios', href: '/planta-lacteos/utensilios' },
];

interface SeguimientoUtensilio {
    id: number;
    nombre_utensilio?: string | null;
    area: string | null;
    cargo: string | null;
    tiempo: string | null;
    tiene_codigo: boolean;
    buen_estado: boolean;
    observaciones: string | null;
    detalle_utensilio?: {
        nombre_utensilio?: string | null;
        codigo: string | null;
        frecuencia: string | null;
    };
    user?: {
        name?: string;
        apellido?: string;
    };
    usuario_responsable?: {
        name?: string;
        apellido?: string;
    };
}

interface PageProps {
    seguimientos: {
        data: SeguimientoUtensilio[];
        links: any[];
        current_page: number;
        last_page: number;
        per_page: number;
        total: number;
    };
    filters?: {
        search?: string;
        nombre_utensilio?: string;
        area?: string;
        cargo?: string;
        codigo?: string;
        frecuencia?: string;
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

export default function Index() {
    const { props } = usePage<PageProps>();
    const { seguimientos, flash, filters: initialFilters = {} } = props;
    const [showFilters, setShowFilters] = useState(false);
    const [mesReporte, setMesReporte] = useState('');
    const [datosReporte, setDatosReporte] = useState<any>(null);
    const [mostrarReporte, setMostrarReporte] = useState(false);
    const [generandoReporte, setGenerandoReporte] = useState(false);

    const { filters, updateFilter, resetFilters } = useAdvancedFilters({
        routeName: 'utensilios.index',
        initialFilters: {
            search: initialFilters.search || '',
            nombre_utensilio: initialFilters.nombre_utensilio || '',
            area: initialFilters.area || '',
            cargo: initialFilters.cargo || '',
            codigo: initialFilters.codigo || '',
            frecuencia: initialFilters.frecuencia || '',
            usuario: initialFilters.usuario || '',
            fecha_desde: initialFilters.fecha_desde || '',
            fecha_hasta: initialFilters.fecha_hasta || '',
            per_page: initialFilters.per_page?.toString() || '10',
        },
        debounceFields: ['search'],
        debounceDelay: 600,
    });

    const hasActiveFilters = Object.values(filters).some(
        (value) => value && value !== '' && value !== '10',
    );

    const generarReporte = async () => {
        if (!mesReporte) {
            alert('Selecciona el mes del reporte.');
            return;
        }

        setGenerandoReporte(true);
        try {
            const response = await fetch(`${route('utensilios.pdf')}?mes=${mesReporte}`);
            if (!response.ok) {
                throw new Error('No se pudo obtener el reporte.');
            }

            const data = await response.json();
            if (!data.quincenal?.length && !data.mensual?.length) {
                alert('No hay revisiones registradas para el mes seleccionado.');
                return;
            }

            setDatosReporte(data);
            setMostrarReporte(true);
        } catch (error) {
            console.error(error);
            alert('Error al generar el reporte.');
        } finally {
            setGenerandoReporte(false);
        }
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Seguimiento de utensilios" />

            <div className="space-y-4 p-4">
                <div className="flex items-center justify-between gap-3">
                    <div>
                        <h1 className="text-2xl font-bold">Seguimiento de utensilios</h1>
                    </div>

                    <div className="flex flex-wrap gap-2">

                        <Link href={route('utensilios.create', { frecuencia: 'quincenal' })}>
                            <Button>Crear quincenal</Button>
                        </Link>
                        <Link href={route('utensilios.create', { frecuencia: 'mensual' })}>
                            <Button variant="secondary">Crear mensual</Button>
                        </Link>
                    </div>
                </div>

                {flash?.success && (
                    <div className="rounded-md border border-green-200 bg-green-50 p-3 text-sm text-green-700">
                        {flash.success}
                    </div>
                )}

                {flash?.error && (
                    <div className="rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-700">
                        {flash.error}
                    </div>
                )}

                <div className="flex items-center gap-2">
                    <div className="relative max-w-md flex-1">
                        <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                        <Input
                            placeholder="Buscar utensilio, código, área, usuario..."
                            value={filters.search || ''}
                            onChange={(event) => updateFilter('search', event.target.value)}
                            className="pl-10"
                        />
                    </div>
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setShowFilters((current) => !current)}
                    >
                        <Filter className="mr-2 h-4 w-4" />
                        Filtros
                        {hasActiveFilters && (
                            <span className="ml-2 flex h-5 w-5 items-center justify-center rounded-full bg-primary text-xs text-primary-foreground">
                                !
                            </span>
                        )}
                    </Button>
                </div>

                {showFilters && (
                    <div className="rounded-lg border border-border bg-muted/50 p-3">
                        <div className="mb-3 flex items-center justify-between">
                            <h2 className="text-sm font-semibold">Filtros avanzados</h2>
                            {hasActiveFilters && (
                                <Button variant="ghost" size="sm" onClick={resetFilters}>
                                    <X className="mr-1 h-4 w-4" />
                                    Limpiar
                                </Button>
                            )}
                        </div>
                        <div className="grid grid-cols-2 gap-3 md:grid-cols-4 lg:grid-cols-6">
                            <FilterInput
                                value={filters.nombre_utensilio || ''}
                                onChange={(value) => updateFilter('nombre_utensilio', value)}
                                placeholder="Utensilio"
                            />
                            <FilterInput
                                value={filters.area || ''}
                                onChange={(value) => updateFilter('area', value)}
                                placeholder="Área"
                            />
                            <FilterInput
                                value={filters.cargo || ''}
                                onChange={(value) => updateFilter('cargo', value)}
                                placeholder="Cargo"
                            />
                            <FilterInput
                                value={filters.codigo || ''}
                                onChange={(value) => updateFilter('codigo', value)}
                                placeholder="Código"
                            />
                            <FilterSelect
                                value={filters.frecuencia || ''}
                                onChange={(value) => updateFilter('frecuencia', value)}
                                placeholder="Frecuencia"
                                options={[
                                    { value: 'quincenal', label: 'Quincenal' },
                                    { value: 'mensual', label: 'Mensual' },
                                ]}
                            />
                            <FilterInput
                                value={filters.usuario || ''}
                                onChange={(value) => updateFilter('usuario', value)}
                                placeholder="Usuario"
                            />
                            <Input
                                type="date"
                                value={filters.fecha_desde || ''}
                                onChange={(event) => updateFilter('fecha_desde', event.target.value)}
                            />
                            <Input
                                type="date"
                                value={filters.fecha_hasta || ''}
                                onChange={(event) => updateFilter('fecha_hasta', event.target.value)}
                            />
                            <FilterSelect
                                value={filters.per_page || '10'}
                                onChange={(value) => updateFilter('per_page', value)}
                                placeholder="Resultados"
                                options={['10', '25', '50', '100'].map((value) => ({
                                    value,
                                    label: `${value} por página`,
                                }))}
                                includeAllOption={false}
                            />
                        </div>
                    </div>
                )}

                <div className="rounded-lg border bg-background shadow-sm">
                    <div className="overflow-x-auto">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Utensilio</TableHead>
                                    <TableHead>Área</TableHead>
                                    <TableHead>Cargo</TableHead>
                                    <TableHead>Código</TableHead>
                                    <TableHead>Usuario</TableHead>
                                    <TableHead>Responsable</TableHead>
                                    <TableHead>Frecuencia</TableHead>
                                    <TableHead>¿Código?</TableHead>
                                    <TableHead>¿Buen estado?</TableHead>
                                    <TableHead>Observaciones</TableHead>
                                    <TableHead>Fecha</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {seguimientos.data.length === 0 ? (
                                    <TableRow>
                                            <TableCell colSpan={11} className="text-center text-muted-foreground">
                                            No hay registros de seguimiento.
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    seguimientos.data.map((registro) => (
                                        <TableRow key={registro.id}>
                                            <TableCell>{registro.detalle_utensilio?.nombre_utensilio ?? registro.nombre_utensilio ?? '-'}</TableCell>
                                            <TableCell>{registro.area ?? '-'}</TableCell>
                                            <TableCell>{registro.cargo ?? '-'}</TableCell>
                                            <TableCell>{registro.detalle_utensilio?.codigo ?? '-'}</TableCell>
                                            <TableCell>
                                                {registro.user ? `${registro.user.name ?? ''} ${registro.user.apellido ?? ''}`.trim() || '-' : '-'}
                                            </TableCell>
                                            <TableCell>
                                                {registro.usuario_responsable ? `${registro.usuario_responsable.name ?? ''} ${registro.usuario_responsable.apellido ?? ''}`.trim() || '-' : '-'}
                                            </TableCell>
                                            <TableCell>
                                                <Badge variant="outline">
                                                    {registro.detalle_utensilio?.frecuencia ?? '-'}
                                                </Badge>
                                            </TableCell>
                                            <TableCell>
                                                {registro.tiene_codigo ? 'Sí' : 'No'}
                                            </TableCell>
                                            <TableCell>
                                                {registro.buen_estado ? 'Sí' : 'No'}
                                            </TableCell>
                                            <TableCell>{registro.observaciones ?? '-'}</TableCell>
                                            <TableCell>
                                                {registro.tiempo ? new Date(registro.tiempo).toLocaleString() : '-'}
                                            </TableCell>
                                        </TableRow>
                                    ))
                                )}
                            </TableBody>
                        </Table>
                    </div>
                    {seguimientos.data.length > 0 && (
                        <div className="border-t px-4 py-3">
                            <TablePagination
                                pagination={seguimientos}
                                onPageChange={(page) =>
                                    router.get(
                                        route('utensilios.index'),
                                        { ...filters, page },
                                        { preserveState: true, replace: true },
                                    )
                                }
                            />
                        </div>
                    )}
                </div>

                <p className="text-sm text-muted-foreground">
                    {seguimientos.total} seguimientos registrados
                </p>
            </div>
            <div className="flex flex-wrap gap-2">
 <Input
                            type="month"
                            value={mesReporte}
                            onChange={(event) => setMesReporte(event.target.value)}
                            className="w-auto"
                        />
                        <Button variant="outline" onClick={generarReporte} disabled={generandoReporte}>
                            <Download className="mr-2 h-4 w-4" />
                            {generandoReporte ? 'Generando...' : 'Reporte PDF'}
                        </Button>
                </div>

            {mostrarReporte && datosReporte && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
                    <div className="flex h-[90vh] w-full max-w-7xl flex-col rounded-lg bg-background p-3">
                        <div className="mb-2 flex items-center justify-between">
                            <h2 className="font-semibold">Reporte de utensilios</h2>
                            <Button variant="outline" onClick={() => setMostrarReporte(false)}>
                                <X className="mr-2 h-4 w-4" />
                                Cerrar
                            </Button>
                        </div>
                        <PDFViewer className="min-h-0 flex-1" showToolbar>
                            <ReporteUtensilios datos={datosReporte} mes={datosReporte.mes} />
                        </PDFViewer>
                    </div>
                </div>
            )}
        </AppLayout>
    );
}
