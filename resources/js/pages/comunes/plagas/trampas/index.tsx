// ══════════════════════════════════════════════════════════
// trampas/index.tsx — Catálogo de trampas
// Ruta: resources/js/pages/comunes/plagas/trampas/index.tsx
// ══════════════════════════════════════════════════════════
import { Button } from '@/components/ui/button';
import FilterSelect from '@/components/ui/filter-select';
import FormSelect from '@/components/ui/form-select';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Toast } from '@/components/ui/toast';
import { useAdvancedFilters } from '@/hooks/use-advanced-filters';
import { useAuth } from '@/hooks/useAuth';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, router, usePage } from '@inertiajs/react';
import { Plus, Filter, X, MoreHorizontal, Edit, XCircle, Crosshair } from 'lucide-react';
import { route } from 'ziggy-js';
import { useState, memo } from 'react';
import TablePagination from '@/components/ui/table-pagination';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Módulos Comunes', href: '/modulos-comunes' },
    { title: 'Control de Plagas', href: '/plagas' },
    { title: 'Trampas', href: '/plagas/trampas' },
];

interface Trampa { id: number; codigo: string | null; tipo: string | null; estado: boolean | null; sector: { id: number; nombre: string } | null }
interface PageProps {
    registros: { data: Trampa[]; links: any[]; current_page: number; last_page: number; per_page: number; total: number };
    sectores: Array<{ id: number; nombre: string }>;
    tipos: string[];
    filters: Record<string, string | undefined>;
}

interface FormularioProps {
    tipos: string[];
    sectores: Array<{ id: number; nombre: string }>;
    initialData: { man_sector_id: string; codigo: string; tipo: string; estado: boolean };
    onSubmit: (data: any) => void;
    processing: boolean;
    errors: Record<string, string>;
    onCancel: () => void;
}

const Formulario = memo(({ tipos, sectores, initialData, onSubmit, processing, errors, onCancel }: FormularioProps) => {
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
                <div className="space-y-2"><Label>Código *</Label><Input value={localData.codigo} onChange={(e) => handleChange('codigo', e.target.value)} placeholder="Ej: T-001" /></div>
                <FormSelect 
                    label="Tipo *" 
                    value={localData.tipo} 
                    onChange={(v) => handleChange('tipo', v)} 
                    placeholder="Seleccionar tipo" 
                    options={tipos.map(t => ({ value: t, label: t }))} 
                    error={errors.tipo}
                />
                <FormSelect 
                    label="Sector"
                    value={localData.man_sector_id} 
                    onChange={(v) => handleChange('man_sector_id', v)} 
                    placeholder="Seleccionar sector" 
                    options={sectores.map(s => ({ value: s.id.toString(), label: s.nombre }))} 
                />
                <FormSelect 
                    label="Estado"
                    value={localData.estado ? '1' : '0'} 
                    onChange={(v) => handleChange('estado', v === '1')} 
                    placeholder="Estado" 
                    options={[{ value: '1', label: 'Activa' }, { value: '0', label: 'Inactiva' }]} 
                />
            </div>
            <DialogFooter>
                <Button type="button" variant="outline" onClick={onCancel} disabled={processing}>Cancelar</Button>
                <Button type="submit" disabled={processing || !localData.codigo || !localData.tipo}>{processing ? 'Guardando...' : 'Guardar'}</Button>
            </DialogFooter>
        </form>
    );
});

Formulario.displayName = 'Formulario';

export default function TrampasIndex() {
    const { props } = usePage();
    const { registros, sectores = [], tipos = [], filters: initF = {} } = props as unknown as PageProps;
    const { hasPermission } = useAuth();
    const [showFilters, setShowFilters] = useState(false);
    const [createOpen, setCreateOpen] = useState(false);
    const [editOpen, setEditOpen]     = useState(false);
    const [deleteOpen, setDeleteOpen] = useState(false);
    const [selected, setSelected]     = useState<Trampa | null>(null);
    const [processing, setProcessing] = useState(false);
    const [errors, setErrors] = useState<Record<string, string>>({});

    const { filters, updateFilter, resetFilters } = useAdvancedFilters({
        routeName: 'plagas.trampas.index',
        initialFilters: { filtro_sector: initF.filtro_sector, filtro_tipo: initF.filtro_tipo, filtro_estado: initF.filtro_estado, per_page: '10' },
        debounceFields: [], debounceDelay: 400,
    });
    const hasActiveFilters = Object.entries(filters).some(([, v]) => v && v !== '' && v !== '10');

    const getInitialFormData = () => ({
        man_sector_id: '',
        codigo: '',
        tipo: '',
        estado: true,
    });

    const handleCreate = () => {
        setErrors({});
        setCreateOpen(true);
    };

    const handleEdit = (t: Trampa) => {
        setSelected(t);
        setErrors({});
        setEditOpen(true);
    };

    const handleDelete = (t: Trampa) => { setSelected(t); setDeleteOpen(true); };
    
    const confirmDelete = () => {
        if (!selected) return;
        router.delete(route('plagas.trampas.destroy', selected.id), {
            preserveScroll: true,
            onSuccess: () => { setDeleteOpen(false); setSelected(null); }
        });
    };

    const submitCreate = (formData: any) => {
        setProcessing(true);
        router.post(route('plagas.trampas.store'), formData, {
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
        router.put(route('plagas.trampas.update', selected.id), formData, {
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

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Trampas" />
            <div className="px-2 sm:px-6 py-4 space-y-4">
                <Toast />
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div><h1 className="text-2xl font-bold">Trampas</h1><p className="text-muted-foreground mt-1">Catálogo de trampas registradas en las instalaciones</p></div>
                    {hasPermission('c_plagasTrampas') && (
                        <Button onClick={handleCreate} className="flex items-center gap-2"><Plus className="h-4 w-4" />Nueva Trampa</Button>
                    )}
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
                        <div className="p-4 grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4">
                            <div className="space-y-2"><Label>Sector</Label><FilterSelect value={filters.filtro_sector} onChange={(v) => updateFilter('filtro_sector', v)} placeholder="Todos" options={sectores.map(s => ({ value: s.id.toString(), label: s.nombre }))} /></div>
                            <div className="space-y-2"><Label>Tipo</Label><FilterSelect value={filters.filtro_tipo} onChange={(v) => updateFilter('filtro_tipo', v)} placeholder="Todos" options={tipos.map(t => ({ value: t, label: t }))} /></div>
                            <div className="space-y-2"><Label>Estado</Label><FilterSelect value={filters.filtro_estado} onChange={(v) => updateFilter('filtro_estado', v)} placeholder="Todos" options={[{ value: '1', label: 'Activa' }, { value: '0', label: 'Inactiva' }]} /></div>
                            <div className="space-y-2"><Label>Por página</Label><FilterSelect value={filters.per_page} onChange={(v) => updateFilter('per_page', v)} placeholder="10" includeAllOption={false} options={['10','25','50'].map(v => ({ value: v, label: `${v} por página` }))} /></div>
                        </div>
                    )}
                </Card>
                <Card>
                    <div className="overflow-x-auto">
                        <Table>
                            <TableHeader><TableRow><TableHead>Código</TableHead><TableHead>Tipo</TableHead><TableHead>Sector</TableHead><TableHead className="text-center">Estado</TableHead><TableHead className="w-[80px]">Acciones</TableHead></TableRow></TableHeader>
                            <TableBody>
                                {registros.data.length === 0 ? (
                                    <TableRow><TableCell colSpan={5} className="text-center py-10 text-muted-foreground"><Crosshair className="h-10 w-10 mx-auto opacity-30 mb-2" /><p>No hay trampas registradas</p></TableCell></TableRow>
                                ) : registros.data.map((t) => (
                                    <TableRow key={t.id} className="hover:bg-muted/50">
                                        <TableCell><span className="font-mono font-medium">{t.codigo || '—'}</span></TableCell>
                                        <TableCell><Badge variant="outline">{t.tipo || '—'}</Badge></TableCell>
                                        <TableCell>{t.sector?.nombre || '—'}</TableCell>
                                        <TableCell className="text-center"><Badge className={t.estado ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-600'}>{t.estado ? 'Activa' : 'Inactiva'}</Badge></TableCell>
                                        <TableCell>
                                            <DropdownMenu><DropdownMenuTrigger asChild><Button variant="ghost" size="sm" className="h-8 w-8 p-0"><MoreHorizontal className="h-4 w-4" /></Button></DropdownMenuTrigger>
                                                <DropdownMenuContent align="end">
                                                    {hasPermission('u_plagasTrampas') && (
                                                        <DropdownMenuItem onClick={() => handleEdit(t)}><Edit className="mr-2 h-4 w-4" />Editar</DropdownMenuItem>
                                                    )}
                                                    {hasPermission('d_plagasTrampas') && (
                                                        <DropdownMenuItem onClick={() => handleDelete(t)} className="text-destructive focus:text-destructive"><XCircle className="mr-2 h-4 w-4" />Eliminar</DropdownMenuItem>
                                                    )}
                                                </DropdownMenuContent>
                                            </DropdownMenu>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </div>
                    {registros.data.length > 0 && <div className="border-t px-4 py-3"><TablePagination pagination={registros} onPageChange={(page) => router.get(route('plagas.trampas.index'), { ...filters, page }, { preserveState: true, replace: true })} /></div>}
                </Card>
            </div>
            <Dialog open={createOpen} onOpenChange={setCreateOpen}><DialogContent className="max-w-lg"><DialogHeader><DialogTitle className="flex items-center gap-2"><Crosshair className="h-5 w-5 text-blue-600" />Nueva Trampa</DialogTitle><DialogDescription>Registrar nueva trampa anti-plagas.</DialogDescription></DialogHeader><Formulario tipos={tipos} sectores={sectores} initialData={getInitialFormData()} onSubmit={submitCreate} processing={processing} errors={errors} onCancel={() => setCreateOpen(false)} /></DialogContent></Dialog>
            <Dialog open={editOpen} onOpenChange={setEditOpen}><DialogContent className="max-w-lg"><DialogHeader><DialogTitle className="flex items-center gap-2"><Edit className="h-5 w-5 text-blue-600" />Editar Trampa</DialogTitle></DialogHeader><Formulario tipos={tipos} sectores={sectores} initialData={selected ? { man_sector_id: selected.sector?.id.toString() || '', codigo: selected.codigo || '', tipo: selected.tipo || '', estado: selected.estado ?? true } : getInitialFormData()} onSubmit={submitEdit} processing={processing} errors={errors} onCancel={() => setEditOpen(false)} /></DialogContent></Dialog>
            <Dialog open={deleteOpen} onOpenChange={setDeleteOpen}><DialogContent className="max-w-md"><DialogHeader><DialogTitle className="flex items-center gap-2"><XCircle className="h-5 w-5 text-red-600" />Eliminar trampa</DialogTitle><DialogDescription>Esta acción no se puede deshacer.</DialogDescription></DialogHeader>{selected && <div className="bg-muted/30 p-4 rounded-lg"><p className="font-medium">{selected.codigo} — {selected.tipo}</p><p className="text-sm text-muted-foreground">{selected.sector?.nombre}</p></div>}<DialogFooter><Button variant="outline" onClick={() => setDeleteOpen(false)}>Cancelar</Button><Button variant="destructive" onClick={confirmDelete}>Eliminar</Button></DialogFooter></DialogContent></Dialog>
        </AppLayout>
    );
}