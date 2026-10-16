import { Button } from '@/components/ui/button';
import FilterSelect from '@/components/ui/filter-select';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Toast } from '@/components/ui/toast';
import { useAdvancedFilters } from '@/hooks/use-advanced-filters';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, router, usePage, Link } from '@inertiajs/react';
import { Plus, Filter, X, MoreHorizontal, Edit, XCircle, Truck, FileText, Printer } from 'lucide-react';
import { route } from 'ziggy-js';
import { useState } from 'react';
import TablePagination from '@/components/ui/table-pagination';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import FechaHora from '@/components/ui/fecha-hora';
import ReporteDistribucionCarros from '@/pdf/ReporteDistribucionCarros';
import { PDFViewer } from '@react-pdf/renderer';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Módulos Comunes', href: '/modulos-comunes' },
    { title: 'Old', href: '#' },
    { title: 'Distribución de Carros', href: '/old/distribucion-carros' },
];

interface DistribucionCarro {
    id: number;
    fecha: string;
    destino: string | null;
    placa: string | null;
    set_temperatura: number;
    usuario: { id: number; name: string } | null;
}

interface PageProps {
    registros: { data: DistribucionCarro[]; links: any[]; current_page: number; last_page: number; per_page: number; total: number };
    usuarios: Array<{ id: number; name: string }>;
    filters: Record<string, string | undefined>;
}

export default function DistribucionCarrosIndex() {
    const { props } = usePage();
    const { registros, usuarios = [], filters: initF = {} } = props as unknown as PageProps;
    const [showFilters, setShowFilters] = useState(false);
    const [deleteOpen, setDeleteOpen] = useState(false);
    const [selected, setSelected] = useState<DistribucionCarro | null>(null);

    // Estados para el reporte PDF
    const [fechaDesde, setFechaDesde] = useState('');
    const [fechaHasta, setFechaHasta] = useState('');
    const [datosPdf, setDatosPdf] = useState<any[]>([]);
    const [usuariosPdf, setUsuariosPdf] = useState<any[]>([]);
    const [filtrosPdf, setFiltrosPdf] = useState<any>({});
    const [mostrarPdf, setMostrarPdf] = useState(false);
    const [generandoPdf, setGenerandoPdf] = useState(false);

    const urlPdf = route('old-distribucion-carros.pdf');

    const { filters, updateFilter, resetFilters } = useAdvancedFilters({
        routeName: 'old-distribucion-carros.index',
        initialFilters: { filtro_destino: initF.filtro_destino, filtro_placa: initF.filtro_placa, per_page: '10' },
        debounceFields: ['filtro_destino', 'filtro_placa'], debounceDelay: 400,
    });
    const hasActiveFilters = Object.entries(filters).some(([, v]) => v && v !== '' && v !== '10');

    const handleDelete = (t: DistribucionCarro) => { setSelected(t); setDeleteOpen(true); };

    const confirmDelete = () => {
        if (!selected) return;
        router.delete(route('old-distribucion-carros.destroy', selected.id), {
            preserveScroll: true,
            onSuccess: () => { setDeleteOpen(false); setSelected(null); }
        });
    };

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

            const response = await fetch(`${urlPdf}?${params.toString()}`, {
                headers: { 'Accept': 'application/json', 'X-Requested-With': 'XMLHttpRequest' },
            });
            if (!response.ok) throw new Error('Error al obtener los datos');
            const data = await response.json();
            if (data.error) throw new Error(data.error);
            if (data.registros && data.registros.length === 0) {
                alert('No hay registros para el rango de fechas seleccionado');
                return;
            }
            setDatosPdf(data.registros || []);
            setUsuariosPdf(data.usuarios_involucrados || []);
            setFiltrosPdf(data.filtros || {});
            setMostrarPdf(true);
        } catch (error: any) {
            console.error('Error al generar PDF:', error);
            alert(`Error al generar el reporte: ${error.message}`);
        } finally {
            setGenerandoPdf(false);
        }
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Distribución de Carros" />
            <div className="px-2 sm:px-6 py-4 space-y-4">
                <Toast />
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div>
                        <h1 className="text-2xl font-bold flex items-center gap-2">
                            <Truck className="h-6 w-6" /> Distribución de Carros
                        </h1>
                        <p className="text-muted-foreground mt-1">Gestión de distribución y revisión de carros</p>
                    </div>
                    <div className="flex gap-2">
                        <Link href={route('old-distribucion-carros.reporte')}>
                            <Button variant="outline" className="flex items-center gap-2"><FileText className="h-4 w-4" />Reporte</Button>
                        </Link>
                        <Link href={route('old-distribucion-carros.create')}>
                            <Button className="flex items-center gap-2"><Plus className="h-4 w-4" />Nuevo Registro</Button>
                        </Link>
                    </div>
                </div>

                <Card>
                    <div className="p-4 border-b flex items-center justify-between">
                        <h3 className="font-semibold">Filtros</h3>
                        <div className="flex gap-2">
                            {hasActiveFilters && <Button variant="ghost" size="sm" onClick={resetFilters} className="h-8"><X className="h-4 w-4 mr-1" />Limpiar</Button>}
                            <Button variant="ghost" size="sm" onClick={() => setShowFilters(!showFilters)} className="h-8"><Filter className="h-4 w-4 mr-2" />{showFilters ? 'Ocultar' : 'Mostrar'}</Button>
                        </div>
                    </div>
                    {showFilters && (
                        <div className="p-4 grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div className="space-y-2"><Label>Destino</Label><Input value={filters.filtro_destino || ''} onChange={(e) => updateFilter('filtro_destino', e.target.value)} placeholder="Buscar por destino..." /></div>
                            <div className="space-y-2"><Label>Placa</Label><Input value={filters.filtro_placa || ''} onChange={(e) => updateFilter('filtro_placa', e.target.value)} placeholder="Buscar por placa..." /></div>
                            <div className="space-y-2"><Label>Por página</Label><FilterSelect value={filters.per_page} onChange={(v) => updateFilter('per_page', v)} placeholder="10" includeAllOption={false} options={['10', '25', '50'].map(v => ({ value: v, label: `${v} por página` }))} /></div>
                        </div>
                    )}
                </Card>

                {/* Bloque para generar PDF */}
                <Card className="p-4">
                    <h3 className="font-semibold mb-3">Generar Reporte PDF</h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                        <div>
                            <Label>Fecha Desde</Label>
                            <Input type="date" value={fechaDesde} onChange={(e) => setFechaDesde(e.target.value)} />
                        </div>
                        <div>
                            <Label>Fecha Hasta</Label>
                            <Input type="date" value={fechaHasta} onChange={(e) => setFechaHasta(e.target.value)} />
                        </div>
                        <div className="flex items-end">
                            <Button onClick={handleMostrarPdf} disabled={generandoPdf} className="w-full">
                                <Printer className="h-4 w-4 mr-2" />
                                {generandoPdf ? 'Generando...' : 'Ver Reporte'}
                            </Button>
                        </div>
                    </div>
                </Card>

                <Card>
                    <div className="overflow-x-auto">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Fecha</TableHead>
                                    <TableHead>Destino</TableHead>
                                    <TableHead>Placa</TableHead>
                                    <TableHead>Temp.</TableHead>
                                    <TableHead>Usuario</TableHead>
                                    <TableHead className="w-[80px]">Acciones</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {registros.data.length === 0 ? (
                                    <TableRow><TableCell colSpan={6} className="text-center py-10 text-muted-foreground"><Truck className="h-10 w-10 mx-auto opacity-30 mb-2" /><p>No hay registros</p></TableCell></TableRow>
                                ) : registros.data.map((t) => (
                                    <TableRow key={t.id} className="hover:bg-muted/50">
                                        <TableCell><FechaHora value={t.fecha} /></TableCell>
                                        <TableCell>{t.destino || '—'}</TableCell>
                                        <TableCell><span className="font-mono">{t.placa || '—'}</span></TableCell>
                                        <TableCell>{t.set_temperatura} °C</TableCell>
                                        <TableCell>{t.usuario?.name || '—'}</TableCell>
                                        <TableCell>
                                            <DropdownMenu>
                                                <DropdownMenuTrigger asChild><Button variant="ghost" size="sm" className="h-8 w-8 p-0"><MoreHorizontal className="h-4 w-4" /></Button></DropdownMenuTrigger>
                                                <DropdownMenuContent align="end">
                                                    <DropdownMenuItem asChild>
                                                        <Link href={route('old-distribucion-carros.edit', t.id)} className="flex items-center cursor-pointer w-full"><Edit className="mr-2 h-4 w-4" />Editar</Link>
                                                    </DropdownMenuItem>
                                                    <DropdownMenuItem onClick={() => handleDelete(t)} className="text-destructive focus:text-destructive cursor-pointer"><XCircle className="mr-2 h-4 w-4" />Eliminar</DropdownMenuItem>
                                                </DropdownMenuContent>
                                            </DropdownMenu>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </div>
                    {registros.data.length > 0 && <div className="border-t px-4 py-3"><TablePagination pagination={registros} onPageChange={(page) => router.get(route('old-distribucion-carros.index'), { ...filters, page }, { preserveState: true, replace: true })} /></div>}
                </Card>
            </div>

            <Dialog open={deleteOpen} onOpenChange={setDeleteOpen}>
                <DialogContent className="max-w-md">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2"><XCircle className="h-5 w-5 text-red-600" />Eliminar registro</DialogTitle>
                        <DialogDescription>Esta acción no se puede deshacer.</DialogDescription>
                    </DialogHeader>
                    {selected && (
                        <div className="bg-muted/30 p-4 rounded-lg">
                            <p className="font-medium">Destino: {selected.destino}</p>
                            <p className="text-sm text-muted-foreground">Placa: {selected.placa}</p>
                        </div>
                    )}
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setDeleteOpen(false)}>Cancelar</Button>
                        <Button variant="destructive" onClick={confirmDelete}>Eliminar</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Modal para mostrar PDF generado */}
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
                            <h3 className="text-lg font-semibold text-gray-800">Reporte de Distribución de Carros</h3>
                            <p className="text-sm text-gray-600">{fechaDesde} al {fechaHasta} - {datosPdf.length} registros</p>
                        </div>
                        <div className="h-full pt-14">
                            <PDFViewer style={{ width: '100%', height: '100%', border: 'none' }}>
                                <ReporteDistribucionCarros
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