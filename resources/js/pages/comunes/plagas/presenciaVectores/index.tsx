import { Button } from '@/components/ui/button';
import FilterSelect from '@/components/ui/filter-select';
import FormSelect from '@/components/ui/form-select';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Toast } from '@/components/ui/toast';
import { useAdvancedFilters } from '@/hooks/use-advanced-filters';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, router, usePage } from '@inertiajs/react';
import { Plus, Filter, X, MoreHorizontal, Edit, XCircle, CheckCircle, AlertTriangle, Printer } from 'lucide-react';
import { route } from 'ziggy-js';
import { useState, memo, type FormEvent } from 'react';
import { PDFViewer } from '@react-pdf/renderer';
import TablePagination from '@/components/ui/table-pagination';
import ReportePresenciaVectores from '@/pdf/ReportePresenciaVectores';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Módulos Comunes', href: '/modulos-comunes' },
    { title: 'Control de Plagas', href: '/plagas' },
    { title: 'Presencia de Vectores', href: '/plagas/presencia-vectores' },
];

interface PresenciaVector {
    id: number;
    vector: string | null;
    reportado_por: string | null;
    fecha: string;
    estado: boolean | null;
    accion: string | null;
    sector: { id: number; nombre: string } | null;
    inspector: { id: number; name: string; apellido: string };
}
interface PageProps {
    registros: { data: PresenciaVector[]; links: any[]; current_page: number; last_page: number; per_page: number; total: number };
    sectores: Array<{ id: number; nombre: string }>;
    vectores: string[];
    filters: Record<string, string | undefined> & { filtro_fecha?: string };
    flash: { success?: string; error?: string };
}

function fmt(f: string) {
    return new Date(f).toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' });
}

const VECTOR_COLORS: Record<string, string> = {
    'Mosca':      'bg-yellow-100 text-yellow-800',
    'Mosquito':   'bg-orange-100 text-orange-800',
    'Ratón':      'bg-stone-100  text-stone-800',
    'Rata':       'bg-red-100    text-red-800',
    'Cucaracha':  'bg-amber-100  text-amber-800',
    'Hormiga':    'bg-rose-100   text-rose-800',
    'Araña':      'bg-purple-100 text-purple-800',
    'Paloma':     'bg-sky-100    text-sky-800',
    'Polilla':    'bg-indigo-100 text-indigo-800',
    'Chinche':    'bg-pink-100   text-pink-800',
    'Otros':      'bg-gray-100   text-gray-700',
};

// Componente de formulario separado y memoizado
const FormularioPresencia = memo(({ 
    sectores, 
    vectores, 
    initialData, 
    onSubmit, 
    processing, 
    errors, 
    onCancel 
}: { 
    sectores: Array<{ id: number; nombre: string }>;
    vectores: string[];
    initialData: any;
    onSubmit: (data: any) => void;
    processing: boolean;
    errors: Record<string, string>;
    onCancel: () => void;
}) => {
    // Estado local para evitar re-render del padre
    const [localData, setLocalData] = useState<any>(initialData);

    const handleChange = (field: string, value: any) => {
        setLocalData((prev: any) => ({ ...prev, [field]: value }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSubmit(localData);
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormSelect
                    label="Vector detectado *" 
                    value={localData.vector} 
                    onChange={(v) => handleChange('vector', v)} 
                    placeholder="Seleccionar vector" 
                    options={vectores.map(v => ({ value: v, label: v }))} 
                    error={errors.vector}
                />
                <div className="space-y-2">
                    <Label>Reportado por *</Label>
                    <Input 
                        value={localData.reportado_por} 
                        onChange={(e) => handleChange('reportado_por', e.target.value)} 
                        placeholder="Nombre de quien reporta" 
                    />
                    {errors.reportado_por && <p className="text-sm text-red-600">{errors.reportado_por}</p>}
                </div>
                <FormSelect 
                    label="Sector"
                    value={localData.man_sector_id} 
                    onChange={(v) => handleChange('man_sector_id', v)} 
                    placeholder="Seleccionar sector" 
                    options={sectores.map(s => ({ value: s.id.toString(), label: s.nombre }))} 
                />
                <div className="space-y-2">
                    <Label>Fecha de detección</Label>
                    <Input 
                        type="datetime-local" 
                        value={localData.fecha} 
                        onChange={(e) => handleChange('fecha', e.target.value)} 
                    />
                </div>
            </div>
            <div className="space-y-2">
                <Label>Acción tomada</Label>
                <Textarea 
                    value={localData.accion} 
                    onChange={(e) => handleChange('accion', e.target.value)} 
                    placeholder="Describe la acción tomada frente a la detección..." 
                    rows={3} 
                />
            </div>
            <div className="border rounded-lg p-4 flex items-center justify-between">
                <div>
                    <Label className="font-medium">¿Situación atendida?</Label>
                    <p className="text-sm text-muted-foreground mt-1">Marcar cuando se haya gestionado la presencia del vector</p>
                </div>
                <input 
                    type="checkbox" 
                    checked={localData.estado} 
                    onChange={(e) => handleChange('estado', e.target.checked)} 
                    className="h-5 w-5 rounded" 
                />
            </div>
            <DialogFooter>
                <Button type="button" variant="outline" onClick={onCancel} disabled={processing}>
                    Cancelar
                </Button>
                <Button type="submit" disabled={processing || !localData.vector || !localData.reportado_por}>
                    {processing ? 'Guardando...' : 'Guardar'}
                </Button>
            </DialogFooter>
        </form>
    );
});

FormularioPresencia.displayName = 'FormularioPresencia';

export default function PresenciaVectoresIndex() {
    const { props } = usePage();
    const { registros, sectores = [], vectores = [], filters: initF = {} } = props as unknown as PageProps;
    const [showFilters, setShowFilters] = useState(false);
    const [createOpen, setCreateOpen] = useState(false);
    const [editOpen, setEditOpen]     = useState(false);
    const [deleteOpen, setDeleteOpen] = useState(false);
    const [selected, setSelected]     = useState<PresenciaVector | null>(null);
    const [processing, setProcessing] = useState(false);
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [datosPdf, setDatosPdf] = useState<any>(null);
    const [mostrarPdf, setMostrarPdf] = useState(false);
    const [generandoPdf, setGenerandoPdf] = useState(false);

    const { filters, updateFilter, resetFilters } = useAdvancedFilters({
        routeName: 'plagas.presencia-vectores.index',
        initialFilters: {
            filtro_sector: initF.filtro_sector,
            filtro_vector: initF.filtro_vector,
            filtro_fecha: initF.filtro_fecha,
            filtro_fecha_desde: initF.filtro_fecha_desde,
            filtro_fecha_hasta: initF.filtro_fecha_hasta,
            filtro_estado: initF.filtro_estado,
            per_page: '10',
        },
        debounceFields: [],
        debounceDelay: 400,
    });

    const hasActiveFilters = Object.entries(filters).some(([, v]) => v && v !== '' && v !== '10');

    const getInitialFormData = () => ({
        man_sector_id: '',
        vector: '',
        reportado_por: '',
        fecha: new Date().toISOString().slice(0, 16),
        estado: false,
        accion: '',
    });

    const handleCreate = () => {
        setErrors({});
        setCreateOpen(true);
    };

    const handleEdit = (p: PresenciaVector) => {
        setSelected(p);
        setErrors({});
        setEditOpen(true);
    };

    const handleDelete = (p: PresenciaVector) => { setSelected(p); setDeleteOpen(true); };
    
    const confirmDelete = () => {
        if (!selected) return;
        router.delete(route('plagas.presencia-vectores.destroy', selected.id), { 
            preserveScroll: true, 
            onSuccess: () => { 
                setDeleteOpen(false); 
                setSelected(null); 
            } 
        });
    };

    const urlPdf = route('plagas.presencia-vectores.pdf');

    const fetchDatosPdf = async () => {
        const params = new URLSearchParams();
        if (filters.filtro_sector) params.append('filtro_sector', filters.filtro_sector);
        if (filters.filtro_vector) params.append('filtro_vector', filters.filtro_vector);
        if (filters.filtro_estado) params.append('filtro_estado', filters.filtro_estado);
        if (filters.filtro_fecha) params.append('filtro_fecha', filters.filtro_fecha);
        if (filters.filtro_fecha_desde) params.append('filtro_fecha_desde', filters.filtro_fecha_desde);
        if (filters.filtro_fecha_hasta) params.append('filtro_fecha_hasta', filters.filtro_fecha_hasta);

        const response = await fetch(`${urlPdf}?${params.toString()}`);
        if (!response.ok) {
            const text = await response.text();
            throw new Error(text || 'Error al generar el reporte');
        }
        return await response.json();
    };

    const handleMostrarPdf = async () => {
        setGenerandoPdf(true);
        try {
            const data = await fetchDatosPdf();
            if (!data.datos || data.datos.length === 0) {
                alert('No hay registros para los filtros seleccionados');
                return;
            }
            setDatosPdf(data);
            setMostrarPdf(true);
        } catch (error: any) {
            alert('Error al generar el reporte: ' + (error.message || 'Error desconocido'));
        } finally {
            setGenerandoPdf(false);
        }
    };

    const submitCreate = (formData: any) => {
        setProcessing(true);
        router.post(route('plagas.presencia-vectores.store'), formData, {
            preserveScroll: true,
            onSuccess: () => {
                setCreateOpen(false);
                setProcessing(false);
                setErrors({});
            },
            onError: (err) => {
                setErrors(err);
                setProcessing(false);
            },
        });
    };

    const submitEdit = (formData: any) => {
        if (!selected) return;
        setProcessing(true);
        router.put(route('plagas.presencia-vectores.update', selected.id), formData, {
            preserveScroll: true,
            onSuccess: () => {
                setEditOpen(false);
                setSelected(null);
                setProcessing(false);
                setErrors({});
            },
            onError: (err) => {
                setErrors(err);
                setProcessing(false);
            },
        });
    };

    const pendientes = registros.data.filter(r => !r.estado).length;
    const atendidos  = registros.data.filter(r => r.estado).length;

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Presencia de Vectores" />
            <div className="px-2 sm:px-6 py-4 space-y-4">
                <Toast />
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div>
                        <h1 className="text-2xl font-bold">Presencia de Vectores</h1>
                        <p className="text-muted-foreground mt-1">Registro de detecciones de plagas en las instalaciones</p>
                    </div>
                    <div className="flex gap-2">
                        <Button
                            variant="outline"
                            disabled={generandoPdf}
                            onClick={handleMostrarPdf}
                            className="flex items-center gap-2"
                        >
                            <Printer className="h-4 w-4" />
                            <span className="hidden sm:inline">Ver Reporte</span>
                            <span className="sm:hidden">Reporte</span>
                        </Button>
                        <Button onClick={handleCreate} className="flex items-center gap-2"><Plus className="h-4 w-4" />Registrar Detección</Button>
                    </div>
                </div>

                <div className="grid grid-cols-3 gap-4">
                    {[
                        { label: 'Total detecciones', value: registros.total, color: 'text-foreground' },
                        { label: 'Pendientes', value: pendientes, color: 'text-red-600' },
                        { label: 'Atendidas', value: atendidos, color: 'text-green-600' },
                    ].map(s => (
                        <Card key={s.label} className="p-4 text-center">
                            <p className="text-sm text-muted-foreground">{s.label}</p>
                            <p className={`text-2xl font-bold mt-1 ${s.color}`}>{s.value}</p>
                        </Card>
                    ))}
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
                        <div className="p-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                            <div className="space-y-2"><Label>Sector</Label><FilterSelect value={filters.filtro_sector} onChange={(v) => updateFilter('filtro_sector', v)} placeholder="Todos" options={sectores.map(s => ({ value: s.id.toString(), label: s.nombre }))} /></div>
                            <div className="space-y-2"><Label>Vector</Label><FilterSelect value={filters.filtro_vector} onChange={(v) => updateFilter('filtro_vector', v)} placeholder="Todos" options={vectores.map(v => ({ value: v, label: v }))} /></div>
                            <div className="space-y-2"><Label>Estado</Label><FilterSelect value={filters.filtro_estado} onChange={(v) => updateFilter('filtro_estado', v)} placeholder="Todos" options={[{ value: '1', label: 'Atendido' }, { value: '0', label: 'Pendiente' }]} /></div>
                            <div className="space-y-2"><Label>Fecha exacta</Label><Input type="date" value={filters.filtro_fecha || ''} onChange={(e) => updateFilter('filtro_fecha', e.target.value)} /></div>
                            <div className="space-y-2"><Label>Fecha Desde</Label><Input type="date" value={filters.filtro_fecha_desde || ''} onChange={(e) => updateFilter('filtro_fecha_desde', e.target.value)} /></div>
                            <div className="space-y-2"><Label>Fecha Hasta</Label><Input type="date" value={filters.filtro_fecha_hasta || ''} onChange={(e) => updateFilter('filtro_fecha_hasta', e.target.value)} /></div>
                            <div className="space-y-2"><Label>Por página</Label><FilterSelect value={filters.per_page} onChange={(v) => updateFilter('per_page', v)} placeholder="10" includeAllOption={false} options={['10','25','50'].map(v => ({ value: v, label: `${v} por página` }))} /></div>
                        </div>
                    )}
                </Card>

                <Card>
                    <div className="overflow-x-auto">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Fecha</TableHead>
                                    <TableHead>Vector</TableHead>
                                    <TableHead>Sector</TableHead>
                                    <TableHead>Reportado por</TableHead>
                                    <TableHead>Acción</TableHead>
                                    <TableHead className="text-center">Estado</TableHead>
                                    <TableHead className="w-[80px]">Acciones</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {registros.data.length === 0 ? (
                                    <TableRow><TableCell colSpan={7} className="text-center py-12 text-muted-foreground"><AlertTriangle className="h-10 w-10 mx-auto opacity-30 mb-2" /><p>No hay detecciones registradas</p></TableCell></TableRow>
                                ) : registros.data.map((p) => (
                                    <TableRow key={p.id} className="hover:bg-muted/50">
                                        <TableCell className="text-sm whitespace-nowrap">{fmt(p.fecha)}</TableCell>
                                        <TableCell>
                                            <Badge className={VECTOR_COLORS[p.vector || ''] || 'bg-gray-100 text-gray-700'}>{p.vector || '—'}</Badge>
                                        </TableCell>
                                        <TableCell>{p.sector?.nombre || '—'}</TableCell>
                                        <TableCell className="text-sm">{p.reportado_por}</TableCell>
                                        <TableCell><div className="max-w-[160px] truncate text-sm">{p.accion || 'Sin acción'}</div></TableCell>
                                        <TableCell className="text-center">
                                            <Badge className={p.estado ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}>
                                                {p.estado ? <><CheckCircle className="h-3 w-3 mr-1" />Atendido</> : <><XCircle className="h-3 w-3 mr-1" />Pendiente</>}
                                            </Badge>
                                        </TableCell>
                                        <TableCell>
                                            <DropdownMenu>
                                                <DropdownMenuTrigger asChild><Button variant="ghost" size="sm" className="h-8 w-8 p-0"><MoreHorizontal className="h-4 w-4" /></Button></DropdownMenuTrigger>
                                                <DropdownMenuContent align="end">
                                                    <DropdownMenuItem onClick={() => handleEdit(p)}><Edit className="mr-2 h-4 w-4" />Editar</DropdownMenuItem>
                                                    <DropdownMenuItem onClick={() => handleDelete(p)} className="text-destructive focus:text-destructive"><XCircle className="mr-2 h-4 w-4" />Eliminar</DropdownMenuItem>
                                                </DropdownMenuContent>
                                            </DropdownMenu>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </div>
                    {registros.data.length > 0 && <div className="border-t px-4 py-3"><TablePagination pagination={registros} onPageChange={(page) => router.get(route('plagas.presencia-vectores.index'), { ...filters, page }, { preserveState: true, replace: true })} /></div>}
                </Card>

                {mostrarPdf && datosPdf && (
                    <Card className="p-4">
                        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 mb-4">
                            <div>
                                <h3 className="text-lg font-semibold">Reporte imprimible</h3>
                                <p className="text-sm text-muted-foreground">Vista previa con los mismos filtros aplicados.</p>
                            </div>
                            <div className="flex gap-2">
                                <Button variant="outline" size="sm" onClick={() => setMostrarPdf(false)}>
                                    Cerrar
                                </Button>
                            </div>
                        </div>
                        <div className="h-[75vh]">
                            <PDFViewer style={{ width: '100%', height: '100%' }}>
                                <ReportePresenciaVectores data={datosPdf} />
                            </PDFViewer>
                        </div>
                    </Card>
                )}
            </div>

            <Dialog open={createOpen} onOpenChange={setCreateOpen}>
                <DialogContent className="max-w-2xl">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2"><AlertTriangle className="h-5 w-5 text-amber-500" />Nueva Detección de Vector</DialogTitle>
                        <DialogDescription>Registre la presencia de una plaga en las instalaciones.</DialogDescription>
                    </DialogHeader>
                    <FormularioPresencia
                        sectores={sectores}
                        vectores={vectores}
                        initialData={getInitialFormData()}
                        onSubmit={submitCreate}
                        processing={processing}
                        errors={errors}
                        onCancel={() => setCreateOpen(false)}
                    />
                </DialogContent>
            </Dialog>

            <Dialog open={editOpen} onOpenChange={setEditOpen}>
                <DialogContent className="max-w-2xl">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2"><Edit className="h-5 w-5 text-blue-600" />Editar Detección</DialogTitle>
                    </DialogHeader>
                    <FormularioPresencia
                        sectores={sectores}
                        vectores={vectores}
                        initialData={selected ? {
                            man_sector_id: selected.sector?.id.toString() || '',
                            vector: selected.vector || '',
                            reportado_por: selected.reportado_por || '',
                            fecha: new Date(selected.fecha).toISOString().slice(0, 16),
                            estado: selected.estado ?? false,
                            accion: selected.accion || '',
                        } : getInitialFormData()}
                        onSubmit={submitEdit}
                        processing={processing}
                        errors={errors}
                        onCancel={() => setEditOpen(false)}
                    />
                </DialogContent>
            </Dialog>

            <Dialog open={deleteOpen} onOpenChange={setDeleteOpen}>
                <DialogContent className="max-w-md">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2"><XCircle className="h-5 w-5 text-red-600" />Eliminar registro</DialogTitle>
                        <DialogDescription>Esta acción no se puede deshacer.</DialogDescription>
                    </DialogHeader>
                    {selected && (
                        <div className="bg-muted/30 p-4 rounded-lg">
                            <p className="font-medium">{selected.vector}</p>
                            <p className="text-sm text-muted-foreground">{fmt(selected.fecha)} — {selected.sector?.nombre}</p>
                        </div>
                    )}
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setDeleteOpen(false)}>Cancelar</Button>
                        <Button variant="destructive" onClick={confirmDelete}>Eliminar</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </AppLayout>
    );
}