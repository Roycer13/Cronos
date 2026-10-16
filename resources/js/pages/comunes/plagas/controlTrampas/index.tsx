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
import { Plus, Filter, X, MoreHorizontal, Edit, XCircle, AlertTriangle, Crosshair, Users, Printer } from 'lucide-react';
import { route } from 'ziggy-js';
import { useState, memo, type FormEvent } from 'react';
import { PDFViewer } from '@react-pdf/renderer';
import TablePagination from '@/components/ui/table-pagination';
import ReporteControlTrampas from '../../../../pdf/ReporteControlTrampas';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Módulos Comunes', href: '/modulos-comunes' },
    { title: 'Control de Plagas', href: '/plagas' },
    { title: 'Control de Trampas', href: '/plagas/control-trampas' },
];

interface ControlTrampa {
    id: number;
    fecha: string;
    tipo_revision: string | null;
    observacion: string | null;
    observacion_detalle: string | null;
    correcion: string | null;
    responsable_correcion: string | null;
    deterioro: boolean | null;
    responsable_cambio: string | null;
    trampa: { id: number; codigo: string | null; tipo: string | null; sector: { nombre: string } | null } | null;
    inspector: { id: number; name: string; apellido: string };
}
interface Trampa { id: number; codigo: string | null; tipo: string | null; sector: { nombre: string } | null }
interface PageProps {
    registros: { data: ControlTrampa[]; links: any[]; current_page: number; last_page: number; per_page: number; total: number };
    trampas: Trampa[];
    sectores: Array<{ id: number; nombre: string }>;
    glosas: string[];
    tiposRevision: string[];
    filters: Record<string, string | undefined> & { filtro_fecha?: string };
    flash: { success?: string; error?: string };
}

function fmt(f: string) {
    return new Date(f).toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' });
}

// Componente de formulario separado y memoizado
const FormularioControlTrampa = memo(({
    trampas,
    tiposRevision,
    glosas,
    initialData,
    onSubmit,
    processing,
    errors,
    onCancel,
}: {
    trampas: Trampa[];
    tiposRevision: string[];
    glosas: string[];
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

    const handleSubmit = (e: FormEvent) => {
        e.preventDefault();
        onSubmit(localData);
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-5">
            {/* Trampa y tipo revisión */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormSelect
                    label="Trampa *"
                    value={localData.PLAG_trampa_id}
                    onChange={(v) => handleChange('PLAG_trampa_id', v)}
                    placeholder="Seleccionar trampa"
                    options={trampas.map(t => ({ value: t.id.toString(), label: `${t.codigo || 'S/C'} — ${t.tipo || ''} (${t.sector?.nombre || 'Sin sector'})` }))}
                    error={errors.PLAG_trampa_id}
                />
                <FormSelect
                    label="Tipo de revisión *"
                    value={localData.tipo_revision}
                    onChange={(v) => handleChange('tipo_revision', v)}
                    placeholder="Seleccionar"
                    options={tiposRevision.map(t => ({ value: t, label: t }))}
                    error={errors.tipo_revision}
                />
            </div>

            {/* Observación (glosa) */}
            <FormSelect
                label="Observación *"
                value={localData.observacion}
                onChange={(v) => handleChange('observacion', v)}
                placeholder="Seleccionar observación"
                options={glosas.map(g => ({ value: g, label: g }))}
                error={errors.observacion}
            />

            {/* Si hay irregularidad */}
            {localData.observacion && localData.observacion !== 'Sin novedad' && (
                <div className="border border-amber-200 rounded-lg p-4 space-y-4 bg-amber-50/50 dark:bg-amber-900/10">
                    <h4 className="text-sm font-medium flex items-center gap-2 text-amber-700 dark:text-amber-400">
                        <AlertTriangle className="h-4 w-4" />Detalle de irregularidad
                    </h4>
                    <div className="space-y-2">
                        <Label>Descripción detallada</Label>
                        <Textarea
                            value={localData.observacion_detalle}
                            onChange={(e) => handleChange('observacion_detalle', e.target.value)}
                            placeholder="Describe con detalle la irregularidad observada..."
                            rows={2}
                        />
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label>Corrección a realizar</Label>
                            <Textarea
                                value={localData.correcion}
                                onChange={(e) => handleChange('correcion', e.target.value)}
                                placeholder="Acción correctiva..."
                                rows={2}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label>Responsable de corrección</Label>
                            <Input
                                value={localData.responsable_correcion}
                                onChange={(e) => handleChange('responsable_correcion', e.target.value)}
                                placeholder="Nombre del responsable"
                            />
                        </div>
                    </div>
                </div>
            )}

            {/* Deterioro */}
            <div className="border rounded-lg p-4 space-y-3">
                <div className="flex items-center justify-between">
                    <div>
                        <Label className="font-medium">¿Presenta deterioro?</Label>
                        <p className="text-sm text-muted-foreground">Indica si la trampa muestra daños físicos o desgaste</p>
                    </div>
                    <input
                        type="checkbox"
                        checked={localData.deterioro}
                        onChange={(e) => handleChange('deterioro', e.target.checked)}
                        className="h-5 w-5 rounded"
                    />
                </div>
                {localData.deterioro && (
                    <div className="space-y-2">
                        <Label>Responsable del cambio</Label>
                        <Input
                            value={localData.responsable_cambio}
                            onChange={(e) => handleChange('responsable_cambio', e.target.value)}
                            placeholder="Quién realizará el cambio o reparación"
                        />
                    </div>
                )}
            </div>

            <div className="bg-muted/30 p-3 rounded-lg text-sm text-muted-foreground">
                Inspector: <strong>{/* populated server-side */}usuario actual</strong> · Fecha y hora: <strong>automática al guardar</strong>
            </div>

            <DialogFooter>
                <Button
                    type="button"
                    variant="outline"
                    onClick={onCancel}
                    disabled={processing}
                >
                    Cancelar
                </Button>
                <Button
                    type="submit"
                    disabled={processing || !localData.PLAG_trampa_id || !localData.tipo_revision || !localData.observacion}
                >
                    {processing ? 'Guardando...' : 'Guardar Inspección'}
                </Button>
            </DialogFooter>
        </form>
    );
});

FormularioControlTrampa.displayName = 'FormularioControlTrampa';

export default function ControlTrampasIndex() {
    const { props } = usePage();
    const { registros, trampas = [], glosas = [], tiposRevision = [], filters: initF = {} } = props as unknown as PageProps;
    const [showFilters, setShowFilters] = useState(false);
    const [createOpen, setCreateOpen] = useState(false);
    const [editOpen, setEditOpen] = useState(false);
    const [deleteOpen, setDeleteOpen] = useState(false);
    const [selected, setSelected] = useState<ControlTrampa | null>(null);
    const [processing, setProcessing] = useState(false);
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [datosPdf, setDatosPdf] = useState<any>(null);
    const [mostrarPdf, setMostrarPdf] = useState(false);
    const [generandoPdf, setGenerandoPdf] = useState(false);
    const urlPdf = route('plagas.control-trampas.pdf');

    const { filters, updateFilter, resetFilters } = useAdvancedFilters({
        routeName: 'plagas.control-trampas.index',
        initialFilters: {
            filtro_trampa: initF.filtro_trampa,
            filtro_tipo: initF.filtro_tipo,
            filtro_deterioro: initF.filtro_deterioro,
            filtro_fecha: initF.filtro_fecha,
            filtro_fecha_desde: initF.filtro_fecha_desde,
            filtro_fecha_hasta: initF.filtro_fecha_hasta,
            per_page: '10',
        },
        debounceFields: [],
        debounceDelay: 400,
    });

    const hasActiveFilters = Object.entries(filters).some(([, v]) => v && v !== '' && v !== '10');

    const getInitialFormData = () => ({
        PLAG_trampa_id: '',
        tipo_revision: '',
        observacion: '',
        observacion_detalle: '',
        correcion: '',
        responsable_correcion: '',
        deterioro: false,
        responsable_cambio: '',
    });

    const handleCreate = () => {
        setErrors({});
        setCreateOpen(true);
    };

    const handleEdit = (c: ControlTrampa) => {
        setSelected(c);
        setErrors({});
        setEditOpen(true);
    };

    const handleDelete = (c: ControlTrampa) => { setSelected(c); setDeleteOpen(true); };

    const confirmDelete = () => {
        if (!selected) return;
        router.delete(route('plagas.control-trampas.destroy', selected.id), {
            preserveScroll: true,
            onSuccess: () => {
                setDeleteOpen(false);
                setSelected(null);
            }
        });
    };

    const fetchDatosPdf = async () => {
        const params = new URLSearchParams();
        if (filters.filtro_trampa) params.append('filtro_trampa', filters.filtro_trampa);
        if (filters.filtro_tipo) params.append('filtro_tipo', filters.filtro_tipo);
        if (filters.filtro_deterioro) params.append('filtro_deterioro', filters.filtro_deterioro);
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
        router.post(route('plagas.control-trampas.store'), formData, {
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
        router.put(route('plagas.control-trampas.update', selected.id), formData, {
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

    const conDeterioro = registros.data.filter(r => r.deterioro).length;

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Control de Trampas" />
            <div className="px-2 sm:px-6 py-4 space-y-4">
                <Toast />
                
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div>
                        <h1 className="text-2xl font-bold">Control de Trampas</h1>
                        <p className="text-muted-foreground mt-1">Inspecciones y revisiones de trampas anti-plagas</p>
                    </div>
                    <div className="flex gap-2">
                        <Button
                            variant="outline"
                            onClick={() => router.get(route('plagas.control-trampas.registro-rapido'))}
                            className="flex items-center gap-2"
                        >
                            <Users className="h-4 w-4" />
                            <span className="hidden sm:inline">Registro Rápido</span>
                            <span className="sm:hidden">Rápido</span>
                        </Button>
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
                        <Button onClick={handleCreate} className="flex items-center gap-2">
                            <Plus className="h-4 w-4" />
                            Nueva Inspección
                        </Button>
                    </div>
                </div>
                <div className="grid grid-cols-3 gap-4">
                    {[
                        { label: 'Total inspecciones', value: registros.total, color: 'text-foreground' },
                        { label: 'Con deterioro', value: conDeterioro, color: 'text-amber-600' },
                        { label: 'Sin novedad', value: registros.data.filter(r => r.observacion === 'Sin novedad').length, color: 'text-green-600' },
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
                            <div className="space-y-2"><Label>Trampa</Label><FilterSelect value={filters.filtro_trampa} onChange={(v) => updateFilter('filtro_trampa', v)} placeholder="Todas" options={trampas.map(t => ({ value: t.id.toString(), label: `${t.codigo || 'S/C'} (${t.sector?.nombre || ''})` }))} /></div>
                            <div className="space-y-2"><Label>Tipo revisión</Label><FilterSelect value={filters.filtro_tipo} onChange={(v) => updateFilter('filtro_tipo', v)} placeholder="Todos" options={tiposRevision.map(t => ({ value: t, label: t }))} /></div>
                            <div className="space-y-2"><Label>Deterioro</Label><FilterSelect value={filters.filtro_deterioro} onChange={(v) => updateFilter('filtro_deterioro', v)} placeholder="Todos" options={[{ value: '1', label: 'Con deterioro' }, { value: '0', label: 'Sin deterioro' }]} /></div>
                            <div className="space-y-2"><Label>Fecha exacta</Label><Input type="date" value={filters.filtro_fecha || ''} onChange={(e) => updateFilter('filtro_fecha', e.target.value)} /></div>
                            <div className="space-y-2"><Label>Fecha Desde</Label><Input type="date" value={filters.filtro_fecha_desde || ''} onChange={(e) => updateFilter('filtro_fecha_desde', e.target.value)} /></div>
                            <div className="space-y-2"><Label>Fecha Hasta</Label><Input type="date" value={filters.filtro_fecha_hasta || ''} onChange={(e) => updateFilter('filtro_fecha_hasta', e.target.value)} /></div>
                            <div className="space-y-2"><Label>Por página</Label><FilterSelect value={filters.per_page} onChange={(v) => updateFilter('per_page', v)} placeholder="10" includeAllOption={false} options={['10', '25', '50'].map(v => ({ value: v, label: `${v} por página` }))} /></div>
                        </div>
                    )}
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
                                <ReporteControlTrampas data={datosPdf} />
                            </PDFViewer>
                        </div>
                    </Card>
                )}

                <Card>
                    <div className="overflow-x-auto">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Fecha</TableHead>
                                    <TableHead>Trampa</TableHead>
                                    <TableHead>Tipo revisión</TableHead>
                                    <TableHead>Observación</TableHead>
                                    <TableHead className="text-center">Deterioro</TableHead>
                                    <TableHead>Inspector</TableHead>
                                    <TableHead className="w-[80px]">Acciones</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {registros.data.length === 0 ? (
                                    <TableRow><TableCell colSpan={7} className="text-center py-12 text-muted-foreground"><Crosshair className="h-10 w-10 mx-auto opacity-30 mb-2" /><p>No hay inspecciones registradas</p></TableCell></TableRow>
                                ) : registros.data.map((c) => (
                                    <TableRow key={c.id} className="hover:bg-muted/50">
                                        <TableCell className="text-sm whitespace-nowrap">{fmt(c.fecha)}</TableCell>
                                        <TableCell>
                                            <div className="font-mono text-sm font-medium">{c.trampa?.codigo || '—'}</div>
                                            <div className="text-xs text-muted-foreground">{c.trampa?.sector?.nombre}</div>
                                        </TableCell>
                                        <TableCell><Badge variant="outline">{c.tipo_revision}</Badge></TableCell>
                                        <TableCell>
                                            <div className="max-w-[160px]">
                                                <p className="text-sm truncate">{c.observacion}</p>
                                                {c.observacion_detalle && <p className="text-xs text-muted-foreground truncate">{c.observacion_detalle}</p>}
                                            </div>
                                        </TableCell>
                                        <TableCell className="text-center">
                                            {c.deterioro
                                                ? <Badge className="bg-amber-100 text-amber-800"><AlertTriangle className="h-3 w-3 mr-1" />Sí</Badge>
                                                : <Badge className="bg-green-100 text-green-800">No</Badge>}
                                        </TableCell>
                                        <TableCell className="text-sm">{c.inspector.name} {c.inspector.apellido}</TableCell>
                                        <TableCell>
                                            <DropdownMenu>
                                                <DropdownMenuTrigger asChild><Button variant="ghost" size="sm" className="h-8 w-8 p-0"><MoreHorizontal className="h-4 w-4" /></Button></DropdownMenuTrigger>
                                                <DropdownMenuContent align="end">
                                                    <DropdownMenuItem onClick={() => handleEdit(c)}><Edit className="mr-2 h-4 w-4" />Editar</DropdownMenuItem>
                                                    <DropdownMenuItem onClick={() => handleDelete(c)} className="text-destructive focus:text-destructive"><XCircle className="mr-2 h-4 w-4" />Eliminar</DropdownMenuItem>
                                                </DropdownMenuContent>
                                            </DropdownMenu>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </div>
                    {registros.data.length > 0 && <div className="border-t px-4 py-3"><TablePagination pagination={registros} onPageChange={(page) => router.get(route('plagas.control-trampas.index'), { ...filters, page }, { preserveState: true, replace: true })} /></div>}
                </Card>
            </div>

            <Dialog open={createOpen} onOpenChange={setCreateOpen}>
                <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2"><Crosshair className="h-5 w-5 text-blue-600" />Nueva Inspección de Trampa</DialogTitle>
                        <DialogDescription>El inspector y la fecha se registran automáticamente.</DialogDescription>
                    </DialogHeader>
                    <FormularioControlTrampa
                        trampas={trampas}
                        tiposRevision={tiposRevision}
                        glosas={glosas}
                        initialData={getInitialFormData()}
                        onSubmit={submitCreate}
                        processing={processing}
                        errors={errors}
                        onCancel={() => setCreateOpen(false)}
                    />
                </DialogContent>
            </Dialog>
            <Dialog open={editOpen} onOpenChange={setEditOpen}>
                <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2"><Edit className="h-5 w-5 text-blue-600" />Editar Inspección</DialogTitle>
                    </DialogHeader>
                    <FormularioControlTrampa
                        trampas={trampas}
                        tiposRevision={tiposRevision}
                        glosas={glosas}
                        initialData={selected ? {
                            PLAG_trampa_id: selected.trampa?.id.toString() || '',
                            tipo_revision: selected.tipo_revision || '',
                            observacion: selected.observacion || '',
                            observacion_detalle: selected.observacion_detalle || '',
                            correcion: selected.correcion || '',
                            responsable_correcion: selected.responsable_correcion || '',
                            deterioro: selected.deterioro ?? false,
                            responsable_cambio: selected.responsable_cambio || '',
                        } : getInitialFormData()}
                        onSubmit={submitEdit}
                        processing={processing}
                        errors={errors}
                        onCancel={() => setEditOpen(false)}
                    />
                </DialogContent>
            </Dialog>
            <Dialog open={deleteOpen} onOpenChange={setDeleteOpen}>
                <DialogContent className="max-w-md"><DialogHeader><DialogTitle className="flex items-center gap-2"><XCircle className="h-5 w-5 text-red-600" />Eliminar inspección</DialogTitle><DialogDescription>Esta acción no se puede deshacer.</DialogDescription></DialogHeader>
                    {selected && <div className="bg-muted/30 p-4 rounded-lg"><p className="font-medium">Trampa: {selected.trampa?.codigo}</p><p className="text-sm text-muted-foreground">{fmt(selected.fecha)}</p></div>}
                    <DialogFooter><Button variant="outline" onClick={() => setDeleteOpen(false)}>Cancelar</Button><Button variant="destructive" onClick={confirmDelete}>Eliminar</Button></DialogFooter>
                </DialogContent>
            </Dialog>
        </AppLayout>
    );
}