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
import { Plus, Filter, X, MoreHorizontal, Edit, XCircle, CheckCircle, ClipboardList, Users } from 'lucide-react';
import { route } from 'ziggy-js';
import { useState, memo } from 'react';
import TablePagination from '@/components/ui/table-pagination';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Módulos Comunes', href: '/modulos-comunes' },
    { title: 'Control de Plagas', href: '/plagas' },
    { title: 'Control de Barreras', href: '/plagas/control-barreras' },
];

interface ControlBarrera {
    id: number;
    fecha: string;
    estado: boolean | null;
    observacion: string | null;
    correcion: string | null;
    barrera: { id: number; codigo_interno: string | null; tipo: string | null; sector: { nombre: string } | null } | null;
    inspector: { id: number; name: string; apellido: string };
}
interface Barrera { id: number; codigo_interno: string | null; tipo: string | null; sector: { nombre: string } | null }
interface PageProps {
    registros: { data: ControlBarrera[]; links: any[]; current_page: number; last_page: number; per_page: number; total: number };
    barreras: Barrera[];
    sectores: Array<{ id: number; nombre: string }>;
    filters: Record<string, string | undefined>;
    flash: { success?: string; error?: string };
}

function fmt(f: string) {
    return new Date(f).toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' });
}

// Componente de formulario separado y memoizado
const FormularioControl = memo(({
    barreras,
    initialData,
    onSubmit,
    processing,
    errors,
    onCancel,
}: {
    barreras: Barrera[];
    initialData: any;
    onSubmit: (data: any) => void;
    processing: boolean;
    errors: Record<string, string>;
    onCancel: () => void;
}) => {
    // Estado local para evitar re-render del padre
    const [localData, setLocalData] = useState(initialData);

    const handleChange = (field: string, value: any) => {
        setLocalData(prev => ({ ...prev, [field]: value }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSubmit(localData);
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormSelect
                    label="Barrera *"
                    value={localData.barrera_plaga_id}
                    onChange={(v) => handleChange('barrera_plaga_id', v)}
                    placeholder="Seleccionar barrera"
                    options={barreras.map(b => ({ value: b.id.toString(), label: `${b.codigo_interno || 'S/C'} — ${b.tipo || ''} (${b.sector?.nombre || 'Sin sector'})` }))}
                    error={errors.barrera_plaga_id}
                />
                <div className="space-y-2">
                    <Label>Fecha de control</Label>
                    <Input
                        type="datetime-local"
                        value={localData.fecha}
                        onChange={(e) => handleChange('fecha', e.target.value)}
                    />
                </div>
            </div>
            <div className="border rounded-lg p-4 flex items-center justify-between">
                <div>
                    <Label className="font-medium">Estado de la barrera</Label>
                    <p className="text-sm text-muted-foreground mt-1">¿La barrera se encuentra en buen estado?</p>
                </div>
                <input
                    type="checkbox"
                    checked={localData.estado}
                    onChange={(e) => handleChange('estado', e.target.checked)}
                    className="h-5 w-5 rounded"
                />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                    <Label>Observación</Label>
                    <Textarea
                        value={localData.observacion}
                        onChange={(e) => handleChange('observacion', e.target.value)}
                        placeholder="Observaciones del control..."
                        rows={3}
                    />
                </div>
                <div className="space-y-2">
                    <Label>Corrección</Label>
                    <Textarea
                        value={localData.correcion}
                        onChange={(e) => handleChange('correcion', e.target.value)}
                        placeholder="Acciones correctivas..."
                        rows={3}
                    />
                </div>
            </div>
            <div className="bg-muted/30 p-3 rounded-lg flex items-center justify-between">
                <span className="text-sm">Resultado:</span>
                <Badge className={localData.estado ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}>
                    {localData.estado ? <><CheckCircle className="h-3 w-3 mr-1" />Conforme</> : <><XCircle className="h-3 w-3 mr-1" />No Conforme</>}
                </Badge>
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
                    disabled={processing || !localData.barrera_plaga_id}
                >
                    {processing ? 'Guardando...' : 'Guardar'}
                </Button>
            </DialogFooter>
        </form>
    );
});

FormularioControl.displayName = 'FormularioControl';

export default function ControlBarrerasIndex() {
    const { props } = usePage();
    const { registros, barreras = [], sectores = [], filters: initF = {} } = props as unknown as PageProps;
    const [showFilters, setShowFilters] = useState(false);
    const [createOpen, setCreateOpen] = useState(false);
    const [editOpen, setEditOpen] = useState(false);
    const [deleteOpen, setDeleteOpen] = useState(false);
    const [selected, setSelected] = useState<ControlBarrera | null>(null);
    const [processing, setProcessing] = useState(false);
    const [errors, setErrors] = useState<Record<string, string>>({});

    const { filters, updateFilter, resetFilters } = useAdvancedFilters({
        routeName: 'plagas.control-barreras.index',
        initialFilters: { filtro_barrera: initF.filtro_barrera, filtro_fecha_desde: initF.filtro_fecha_desde, filtro_fecha_hasta: initF.filtro_fecha_hasta, filtro_estado: initF.filtro_estado, per_page: '10' },
        debounceFields: [],
        debounceDelay: 400,
    });

    const hasActiveFilters = Object.entries(filters).some(([, v]) => v && v !== '' && v !== '10');

    const getInitialFormData = () => ({
        barrera_plaga_id: '',
        fecha: new Date().toISOString().slice(0, 16),
        estado: true,
        observacion: '',
        correcion: '',
    });

    const handleCreate = () => {
        setErrors({});
        setCreateOpen(true);
    };

    const handleEdit = (c: ControlBarrera) => {
        setSelected(c);
        setErrors({});
        setEditOpen(true);
    };

    const handleDelete = (c: ControlBarrera) => { setSelected(c); setDeleteOpen(true); };

    const confirmDelete = () => {
        if (!selected) return;
        router.delete(route('plagas.control-barreras.destroy', selected.id), {
            preserveScroll: true,
            onSuccess: () => {
                setDeleteOpen(false);
                setSelected(null);
            }
        });
    };

    const submitCreate = (formData: any) => {
        setProcessing(true);
        router.post(route('plagas.control-barreras.store'), formData, {
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
        router.put(route('plagas.control-barreras.update', selected.id), formData, {
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

    const conformes = registros.data.filter(r => r.estado).length;
    const noConformes = registros.data.filter(r => r.estado === false).length;

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Control de Barreras" />
            <div className="px-2 sm:px-6 py-4 space-y-4">
                <Toast />
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div>
                        <h1 className="text-2xl font-bold">Control de Barreras</h1>
                        <p className="text-muted-foreground mt-1">Registros de inspección de barreras anti-plagas</p>
                    </div>
                    <div className="flex gap-2">
                        <Button
                            variant="outline"
                            onClick={() => router.get(route('plagas.control-barreras.registro-rapido'))}
                            className="flex items-center gap-2"
                        >
                            <Users className="h-4 w-4" />
                            <span className="hidden sm:inline">Registro Rápido</span>
                            <span className="sm:hidden">Rápido</span>
                        </Button>
                        <Button onClick={handleCreate} className="flex items-center gap-2">
                            <Plus className="h-4 w-4" />
                            Nuevo Control
                        </Button>
                    </div>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-3 gap-4">
                    {[
                        { label: 'Total registros', value: registros.total, color: 'text-foreground' },
                        { label: 'Conformes', value: conformes, color: 'text-green-600' },
                        { label: 'No conformes', value: noConformes, color: 'text-red-600' },
                    ].map(s => (
                        <Card key={s.label} className="p-4 text-center">
                            <p className="text-sm text-muted-foreground">{s.label}</p>
                            <p className={`text-2xl font-bold mt-1 ${s.color}`}>{s.value}</p>
                        </Card>
                    ))}
                </div>

                {/* Filtros */}
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
                            <div className="space-y-2"><Label>Barrera</Label><FilterSelect value={filters.filtro_barrera} onChange={(v) => updateFilter('filtro_barrera', v)} placeholder="Todas" options={barreras.map(b => ({ value: b.id.toString(), label: `${b.codigo_interno || 'S/C'} (${b.sector?.nombre || ''})` }))} /></div>
                            <div className="space-y-2"><Label>Fecha Desde</Label><Input type="date" value={filters.filtro_fecha_desde || ''} onChange={(e) => updateFilter('filtro_fecha_desde', e.target.value)} /></div>
                            <div className="space-y-2"><Label>Fecha Hasta</Label><Input type="date" value={filters.filtro_fecha_hasta || ''} onChange={(e) => updateFilter('filtro_fecha_hasta', e.target.value)} /></div>
                            <div className="space-y-2"><Label>Estado</Label><FilterSelect value={filters.filtro_estado} onChange={(v) => updateFilter('filtro_estado', v)} placeholder="Todos" options={[{ value: '1', label: 'Conforme' }, { value: '0', label: 'No Conforme' }]} /></div>
                            <div className="space-y-2"><Label>Por página</Label><FilterSelect value={filters.per_page} onChange={(v) => updateFilter('per_page', v)} placeholder="10" includeAllOption={false} options={['10', '25', '50'].map(v => ({ value: v, label: `${v} por página` }))} /></div>
                        </div>
                    )}
                </Card>

                {/* Tabla */}
                <Card>
                    <div className="overflow-x-auto">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Fecha</TableHead>
                                    <TableHead>Barrera</TableHead>
                                    <TableHead>Sector</TableHead>
                                    <TableHead>Inspector</TableHead>
                                    <TableHead>Observación</TableHead>
                                    <TableHead className="text-center">Estado</TableHead>
                                    <TableHead className="w-[80px]">Acciones</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {registros.data.length === 0 ? (
                                    <TableRow><TableCell colSpan={7} className="text-center py-12 text-muted-foreground"><ClipboardList className="h-10 w-10 mx-auto opacity-30 mb-2" /><p>No hay registros</p></TableCell></TableRow>
                                ) : registros.data.map((c) => (
                                    <TableRow key={c.id} className="hover:bg-muted/50">
                                        <TableCell className="text-sm whitespace-nowrap">{fmt(c.fecha)}</TableCell>
                                        <TableCell>
                                            <div className="font-medium">{c.barrera?.codigo_interno || '—'}</div>
                                            <div className="text-xs text-muted-foreground">{c.barrera?.tipo}</div>
                                        </TableCell>
                                        <TableCell>{c.barrera?.sector?.nombre || '—'}</TableCell>
                                        <TableCell className="text-sm">{c.inspector.name} {c.inspector.apellido}</TableCell>
                                        <TableCell><div className="max-w-[180px] truncate text-sm">{c.observacion || 'Sin observaciones'}</div></TableCell>
                                        <TableCell className="text-center">
                                            <Badge className={c.estado ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}>
                                                {c.estado ? <><CheckCircle className="h-3 w-3 mr-1" />Conforme</> : <><XCircle className="h-3 w-3 mr-1" />No Conforme</>}
                                            </Badge>
                                        </TableCell>
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
                    {registros.data.length > 0 && <div className="border-t px-4 py-3"><TablePagination pagination={registros} onPageChange={(page) => router.get(route('plagas.control-barreras.index'), { ...filters, page }, { preserveState: true, replace: true })} /></div>}
                </Card>
            </div>

            <Dialog open={createOpen} onOpenChange={setCreateOpen}>
                <DialogContent className="max-w-2xl">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2"><ClipboardList className="h-5 w-5 text-blue-600" />Nuevo Control de Barrera</DialogTitle>
                        <DialogDescription>Registre la inspección de una barrera anti-plagas.</DialogDescription>
                    </DialogHeader>
                    <FormularioControl
                        barreras={barreras}
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
                        <DialogTitle className="flex items-center gap-2"><Edit className="h-5 w-5 text-blue-600" />Editar Control</DialogTitle>
                    </DialogHeader>
                    <FormularioControl
                        barreras={barreras}
                        initialData={selected ? {
                            barrera_plaga_id: selected.barrera?.id.toString() || '',
                            fecha: new Date(selected.fecha).toISOString().slice(0, 16),
                            estado: selected.estado ?? true,
                            observacion: selected.observacion || '',
                            correcion: selected.correcion || '',
                        } : getInitialFormData()}
                        onSubmit={submitEdit}
                        processing={processing}
                        errors={errors}
                        onCancel={() => setEditOpen(false)}
                    />
                </DialogContent>
            </Dialog>

            <Dialog open={deleteOpen} onOpenChange={setDeleteOpen}>
                <DialogContent className="max-w-md"><DialogHeader><DialogTitle className="flex items-center gap-2"><XCircle className="h-5 w-5 text-red-600" />Eliminar registro</DialogTitle><DialogDescription>Esta acción no se puede deshacer.</DialogDescription></DialogHeader>
                    {selected && <div className="bg-muted/30 p-4 rounded-lg"><p className="text-sm">{fmt(selected.fecha)} — {selected.barrera?.codigo_interno}</p></div>}
                    <DialogFooter><Button variant="outline" onClick={() => setDeleteOpen(false)}>Cancelar</Button><Button variant="destructive" onClick={confirmDelete}>Eliminar</Button></DialogFooter>
                </DialogContent>
            </Dialog>
        </AppLayout>
    );
}