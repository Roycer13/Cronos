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
import { Head, router, usePage } from '@inertiajs/react';
import { Plus, Filter, X, Eye, Trash2, ClipboardCheck, Printer } from 'lucide-react';
import { route } from 'ziggy-js';
import { Badge } from '@/components/ui/badge';
import TablePagination from '@/components/ui/table-pagination';
import { useState } from 'react';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import ReporteInfraestructura from '@/pdf/ReporteInfraestructura';
import { PDFViewer } from '@react-pdf/renderer';

const breadcrumbs = [{ title: 'Inspecciones de Infraestructura', href: '/planta-lacteos/inspecciones' }];

interface Inspeccion {
    id: number;
    infraestructura: { id: number; nombre: string };
    usuario: { name: string; apellido: string };
    fecha: string;
    observacion_general?: string;
    no_cumplimientos?: number;
}

interface PageProps {
    inspecciones: {
        data: Inspeccion[];
        links: any[];
        current_page: number;
        last_page: number;
        per_page: number;
        total: number;
    };
    filters: any;
    infraestructuras: Infraestructura[];
    usuarios: { id: number; name: string; apellido: string }[];
    flash: any;
}

export default function Index() {
    const { props } = usePage();
    const { hasPermission } = useAuth();
    const [showFilters, setShowFilters] = useState(false);

    const { inspecciones, filters: initialFilters, infraestructuras, usuarios, flash } = props as unknown as PageProps;

    const { filters, updateFilter, resetFilters } = useAdvancedFilters({
        routeName: 'inspecciones.index',
        initialFilters: {
            infraestructura_id: initialFilters.infraestructura_id?.toString() || undefined,
            user_id: initialFilters.user_id?.toString() || undefined,
            fecha_desde: initialFilters.fecha_desde || undefined,
            fecha_hasta: initialFilters.fecha_hasta || undefined,
            per_page: initialFilters.per_page?.toString() || '10',
        },
    });

    const hasActiveFilters = Object.values(filters).some(v => v && v !== '' && v !== '10');

    const [masivoOpen, setMasivoOpen] = useState(false);

    // Estados para el PDF
    const [fechaDesde, setFechaDesde] = useState<string>('');
    const [fechaHasta, setFechaHasta] = useState<string>('');
    const [datosPdf, setDatosPdf] = useState<any[]>([]);
    const [usuariosPdf, setUsuariosPdf] = useState<any[]>([]);
    const [filtrosPdf, setFiltrosPdf] = useState<any>({});
    const [mostrarPdf, setMostrarPdf] = useState(false);
    const [generandoPdf, setGenerandoPdf] = useState(false);

    const urlPdf = route('inspecciones.pdf');

    const handleMostrarPdf = async () => {
        if (!fechaDesde || !fechaHasta) {
            alert('Por favor selecciona ambas fechas');
            return;
        }

        setGenerandoPdf(true);
        try {
            const params = new URLSearchParams();
            params.append('fecha_desde', fechaDesde);
            params.append('fecha_hasta', fechaHasta);

            const response = await fetch(`${urlPdf}?${params.toString()}`);
            if (!response.ok) throw new Error('Error al obtener los datos');

            const data = await response.json();

            if (data.inspecciones && data.inspecciones.length === 0) {
                alert('No hay inspecciones para el rango de fechas seleccionado');
                return;
            }

            setDatosPdf(data.inspecciones || []);
            setUsuariosPdf(data.usuarios_involucrados || []);
            setFiltrosPdf(data.filtros || {});
            setMostrarPdf(true);
        } catch (error) {
            console.error('Error al generar PDF:', error);
            alert('Error al generar el reporte. Por favor, intenta de nuevo.');
        } finally {
            setGenerandoPdf(false);
        }
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Inspecciones de Infraestructura" />
            <div className="space-y-2 px-2 py-2 sm:px-6">
                <Toast />
                <div className="flex justify-between items-center">
                    <div>
                        <h1 className="text-2xl font-bold">Inspecciones de Infraestructura Cristian no inspecciono</h1>
                        <p className="text-sm text-muted-foreground">Historial de verificaciones BPM</p>
                    </div>
                    <div className="flex gap-2">
                        {hasPermission('c_inspeccionInfra') && (
                            <>
                                <Button onClick={() => router.visit(route('inspecciones.create'))}>
                                    <Plus className="h-4 w-4 mr-2" /> Nueva Inspección
                                </Button>
                                <Button variant="secondary" onClick={() => router.visit(route('inspecciones.masivo'))}>
                                    Crear masivo
                                </Button>
                            </>
                        )}
                        <Button variant="outline" size="sm" onClick={() => setShowFilters(!showFilters)}>
                            <Filter className="h-4 w-4" />
                            {hasActiveFilters && <span className="ml-1 flex h-5 w-5 items-center justify-center rounded-full bg-primary text-xs text-primary-foreground">!</span>}
                        </Button>
                    </div>
                </div>

                {showFilters && (
                    <div className="rounded-lg border bg-muted/50 p-3">
                        <div className="flex justify-between mb-3">
                            <h3 className="font-semibold">Filtros</h3>
                            {hasActiveFilters && <Button variant="ghost" size="sm" onClick={resetFilters}><X className="h-4 w-4 mr-1" /> Limpiar</Button>}
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                            <FilterSelect
                                value={filters.infraestructura_id}
                                onChange={(v) => updateFilter('infraestructura_id', v)}
                                placeholder="Área"
                                options={infraestructuras.map(a => ({ value: a.id.toString(), label: a.nombre }))}
                            />
                            <FilterSelect
                                value={filters.user_id}
                                onChange={(v) => updateFilter('user_id', v)}
                                placeholder="Inspector"
                                options={usuarios.map(u => ({ value: u.id.toString(), label: `${u.name} ${u.apellido}` }))}
                            />
                            <Input
                                type="date"
                                value={filters.fecha_desde || ''}
                                onChange={(e) => updateFilter('fecha_desde', e.target.value)}
                                placeholder="Desde"
                            />
                            <Input
                                type="date"
                                value={filters.fecha_hasta || ''}
                                onChange={(e) => updateFilter('fecha_hasta', e.target.value)}
                                placeholder="Hasta"
                            />
                            <FilterSelect
                                value={filters.per_page}
                                onChange={(v) => updateFilter('per_page', v)}
                                placeholder="Por página"
                                options={['10','25','50','100'].map(v => ({ value: v, label: `${v} por página` }))}
                                includeAllOption={false}
                            />
                        </div>
                    </div>
                )}

                {/* Controles de PDF */}
                <div className="rounded-lg border border-border bg-muted/50 p-4">
                    <h3 className="mb-3 font-semibold text-foreground">
                        Generar Reporte PDF de Inspecciones
                    </h3>
                    <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
                        <div>
                            <label className="mb-1 block text-sm font-medium">
                                Fecha Desde
                            </label>
                            <Input
                                type="date"
                                value={fechaDesde}
                                onChange={(e) => setFechaDesde(e.target.value)}
                            />
                        </div>
                        <div>
                            <label className="mb-1 block text-sm font-medium">
                                Fecha Hasta
                            </label>
                            <Input
                                type="date"
                                value={fechaHasta}
                                onChange={(e) => setFechaHasta(e.target.value)}
                            />
                        </div>
                        <div className="flex items-end">
                            <Button
                                variant="default"
                                size="sm"
                                onClick={handleMostrarPdf}
                                disabled={generandoPdf}
                                className="flex items-center gap-2"
                            >
                                <Printer className="h-4 w-4" />
                                {generandoPdf ? 'Generando...' : 'Ver Reporte'}
                            </Button>
                        </div>
                    </div>
                </div>

                <Card>
                    <div className="overflow-x-auto">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Fecha</TableHead>
                                    <TableHead>Área</TableHead>
                                    <TableHead>Inspector</TableHead>
                                    <TableHead>No Cumplimientos</TableHead>
                                    <TableHead>Acciones</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {inspecciones.data.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                                            <ClipboardCheck className="mx-auto h-12 w-12 mb-3 opacity-50" />
                                            <p>No se encontraron inspecciones</p>
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    inspecciones.data.map((inspeccion) => (
                                        <TableRow key={inspeccion.id}>
                                            <TableCell>{new Date(inspeccion.fecha).toLocaleDateString()}</TableCell>
                                            <TableCell className="font-medium">{inspeccion.infraestructura?.nombre}</TableCell>
                                            <TableCell>{inspeccion.usuario?.name} {inspeccion.usuario?.apellido}</TableCell>
                                            <TableCell>
                                                {(inspeccion.no_cumplimientos ?? 0) > 0 ? (
                                                    <Badge variant="destructive">{inspeccion.no_cumplimientos ?? 0}</Badge>
                                                ) : (
                                                    <Badge variant="outline">0</Badge>
                                                )}
                                            </TableCell>
                                            <TableCell>
                                                <DropdownMenu>
                                                    <DropdownMenuTrigger asChild>
                                                        <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                                                            <Eye className="h-4 w-4" />
                                                        </Button>
                                                    </DropdownMenuTrigger>
                                                    <DropdownMenuContent align="end">
                                                        <DropdownMenuItem onClick={() => router.get(route('inspecciones.show', inspeccion.id))}>
                                                            <Eye className="mr-2 h-4 w-4" /> Ver detalle
                                                        </DropdownMenuItem>
                                                        {hasPermission('d_inspeccionInfra') && (
                                                            <DropdownMenuItem onClick={() => {
                                                                if (confirm('¿Eliminar inspección?')) router.delete(route('inspecciones.destroy', inspeccion.id));
                                                            }} className="text-destructive">
                                                                <Trash2 className="mr-2 h-4 w-4" /> Eliminar
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
                    {inspecciones.data.length > 0 && (
                        <div className="border-t px-4 py-3">
                            <TablePagination
                                pagination={inspecciones}
                                onPageChange={(page) => router.get(route('inspecciones.index'), { ...filters, page }, { preserveState: true })}
                            />
                        </div>
                    )}
                </Card>
            </div>

            {/* Modal para mostrar PDF */}
            {mostrarPdf && datosPdf.length > 0 && (
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
                                <h3 className="text-lg font-semibold text-gray-800">
                                    Reporte de Inspecciones de Infraestructura
                                </h3>
                                <p className="text-sm text-gray-600">
                                    {fechaDesde} al {fechaHasta} - {datosPdf.length} registros
                                </p>
                            </div>
                        </div>
                        <div className="h-full pt-14">
                            <PDFViewer
                                style={{
                                    width: '100%',
                                    height: '100%',
                                    border: 'none',
                                }}
                            >
                                <ReporteInfraestructura
                                    datos={datosPdf}
                                    usuariosInvolucrados={usuariosPdf}
                                    filtros={filtrosPdf}
                                />
                            </PDFViewer>
                        </div>
                    </div>
                </div>
            )}
        </AppLayout>
    );
}