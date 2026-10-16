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
import { Plus, Filter, X, MoreHorizontal, Edit, XCircle, CheckCircle, Wind } from 'lucide-react';
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
    { title: 'Arranque Post-Fumigación', href: '/plagas/arranque-fumigacion' },
];

interface Arranque {
    id: number;
    fecha: string;
    sin_olor: boolean | null;
    limpio: boolean | null;
    observacion: string | null;
    correcion: string | null;
    sector: { id: number; nombre: string } | null;
    inspector: { id: number; name: string; apellido: string };
}
interface PageProps {
    registros: { data: Arranque[]; links: any[]; current_page: number; last_page: number; per_page: number; total: number };
    sectores: Array<{ id: number; nombre: string }>;
    filters: Record<string, string | undefined>;
    flash: { success?: string; error?: string };
}

interface FormData {
    man_sector_id: string;
    sin_olor: boolean;
    limpio: boolean;
    observacion: string;
    correcion: string;
}

function fmt(f: string) {
    return new Date(f).toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' });
}

export function ArranqueFumigacionIndex() {
    const { props } = usePage();
    const { registros, sectores = [], filters: initF = {} } = props as unknown as PageProps;
    const [showFilters, setShowFilters] = useState(false);
    const [createOpen, setCreateOpen] = useState(false);
    const [editOpen, setEditOpen]     = useState(false);
    const [deleteOpen, setDeleteOpen] = useState(false);
    const [selected, setSelected]     = useState<Arranque | null>(null);

    const { filters, updateFilter, resetFilters } = useAdvancedFilters({
        routeName: 'plagas.arranque-fumigacion.index',
        initialFilters: { filtro_sector: initF.filtro_sector, filtro_fecha_desde: initF.filtro_fecha_desde, filtro_fecha_hasta: initF.filtro_fecha_hasta, filtro_conforme: initF.filtro_conforme, per_page: '10' },
        debounceFields: [], debounceDelay: 400,
    });
    const hasActiveFilters = Object.entries(filters).some(([, v]) => v && v !== '' && v !== '10');

    const defaultForm = (): FormData => ({ man_sector_id: '', sin_olor: true, limpio: true, observacion: '', correcion: '' });
    
    const [processing, setProcessing] = useState(false);
    const [errors, setErrors] = useState<Record<string, string>>({});

    const getInitialFormData = (): FormData => defaultForm();

    const conformes = registros.data.filter(r => r.sin_olor && r.limpio).length;

    const handleCreate = () => { setCreateOpen(true); };
    const handleEdit = (a: Arranque) => { setSelected(a); setEditOpen(true); };
    const handleDelete = (a: Arranque) => { setSelected(a); setDeleteOpen(true); };
    const confirmDelete = () => { if (!selected) return; router.delete(route('plagas.arranque-fumigacion.destroy', selected.id), { preserveScroll: true, onSuccess: () => { setDeleteOpen(false); setSelected(null); } }); };
    
    const submitCreate = (formData: FormData) => {
        setProcessing(true);
        router.post(route('plagas.arranque-fumigacion.store'), formData as any, {
            onSuccess: () => {
                setProcessing(false);
                setCreateOpen(false);
                setErrors({});
            },
            onError: (err) => {
                setProcessing(false);
                setErrors(err);
            }
        });
    };
    
    const submitEdit = (formData: FormData) => {
        if (!selected) return;
        setProcessing(true);
        router.put(route('plagas.arranque-fumigacion.update', selected.id), formData as any, {
            onSuccess: () => {
                setProcessing(false);
                setEditOpen(false);
                setSelected(null);
                setErrors({});
            },
            onError: (err) => {
                setProcessing(false);
                setErrors(err);
            }
        });
    };

    interface FormularioProps {
        sectores: Array<{ id: number; nombre: string }>;
        initialData: FormData;
        onSubmit: (data: FormData) => void;
        processing: boolean;
        errors: Record<string, string>;
        onCancel: () => void;
    }

    const Formulario = memo(({ sectores, initialData, onSubmit, processing, errors, onCancel }: FormularioProps) => {
        const [localData, setLocalData] = useState<FormData>(initialData);
        
        const handleChange = (key: keyof FormData, value: any) => {
            setLocalData(prev => ({ ...prev, [key]: value }));
        };
        
        const handleSubmit = (e: React.FormEvent) => {
            e.preventDefault();
            onSubmit(localData);
        };

        return (
            <form onSubmit={handleSubmit} className="space-y-4">
                <FormSelect 
                    label="Sector"
                    value={localData.man_sector_id} 
                    onChange={(v) => handleChange('man_sector_id', v)} 
                    placeholder="Seleccionar sector" 
                    options={sectores.map(s => ({ value: s.id.toString(), label: s.nombre }))} 
                />
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {([['sin_olor', 'Sin olor a fumigante', 'El área no presenta olor residual a productos de fumigación'], ['limpio', 'Área limpia y despejada', 'El área está limpia y lista para operar']] as const).map(([key, label, desc]) => (
                        <div key={key} className="border rounded-lg p-4 flex items-center justify-between">
                            <div><Label className="font-medium">{label}</Label><p className="text-sm text-muted-foreground mt-1">{desc}</p></div>
                            <Checkbox checked={localData[key]} onCheckedChange={(v) => handleChange(key, v as boolean)} className="h-5 w-5" />
                        </div>
                    ))}
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2"><Label>Observaciones</Label><Textarea value={localData.observacion} onChange={(e) => handleChange('observacion', e.target.value)} placeholder="Observaciones adicionales..." rows={3} /></div>
                    <div className="space-y-2"><Label>Corrección</Label><Textarea value={localData.correcion} onChange={(e) => handleChange('correcion', e.target.value)} placeholder="Acciones correctivas..." rows={3} /></div>
                </div>
                <div className="bg-muted/30 p-3 rounded-lg flex items-center justify-between">
                    <span className="text-sm">Resultado:</span>
                    <Badge className={(localData.sin_olor && localData.limpio) ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}>
                        {(localData.sin_olor && localData.limpio) ? <><CheckCircle className="h-3 w-3 mr-1" />Apto para operar</> : <><XCircle className="h-3 w-3 mr-1" />No apto aún</>}
                    </Badge>
                </div>
                <DialogFooter>
                    <Button type="button" variant="outline" onClick={onCancel} disabled={processing}>Cancelar</Button>
                    <Button type="submit" disabled={processing}>{processing ? 'Guardando...' : 'Guardar'}</Button>
                </DialogFooter>
            </form>
        );
    });

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Arranque Post-Fumigación" />
            <div className="px-2 sm:px-6 py-4 space-y-4">
                <Toast />
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div><h1 className="text-2xl font-bold">Arranque Post-Fumigación</h1><p className="text-muted-foreground mt-1">Control de arranque de operaciones después de fumigación</p></div>
                    <Button onClick={handleCreate} className="flex items-center gap-2"><Plus className="h-4 w-4" />Nuevo Registro</Button>
                </div>
                <div className="grid grid-cols-3 gap-4">
                    {[{ label: 'Total registros', value: registros.total, color: 'text-foreground' }, { label: 'Aptos', value: conformes, color: 'text-green-600' }, { label: 'No aptos', value: registros.data.length - conformes, color: 'text-red-600' }]
                        .map(s => <Card key={s.label} className="p-4 text-center"><p className="text-sm text-muted-foreground">{s.label}</p><p className={`text-2xl font-bold mt-1 ${s.color}`}>{s.value}</p></Card>)}
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
                            <div className="space-y-2"><Label>Estado</Label><FilterSelect value={filters.filtro_conforme} onChange={(v) => updateFilter('filtro_conforme', v)} placeholder="Todos" options={[{ value: '1', label: 'Apto' }, { value: '0', label: 'No apto' }]} /></div>
                            <div className="space-y-2"><Label>Fecha Desde</Label><Input type="date" value={filters.filtro_fecha_desde || ''} onChange={(e) => updateFilter('filtro_fecha_desde', e.target.value)} /></div>
                            <div className="space-y-2"><Label>Fecha Hasta</Label><Input type="date" value={filters.filtro_fecha_hasta || ''} onChange={(e) => updateFilter('filtro_fecha_hasta', e.target.value)} /></div>
                        </div>
                    )}
                </Card>
                <Card>
                    <div className="overflow-x-auto">
                        <Table>
                            <TableHeader><TableRow><TableHead>Fecha</TableHead><TableHead>Sector</TableHead><TableHead className="text-center">Sin Olor</TableHead><TableHead className="text-center">Limpio</TableHead><TableHead>Observación</TableHead><TableHead>Inspector</TableHead><TableHead className="text-center">Resultado</TableHead><TableHead className="w-[80px]">Acciones</TableHead></TableRow></TableHeader>
                            <TableBody>
                                {registros.data.length === 0 ? (
                                    <TableRow><TableCell colSpan={8} className="text-center py-12 text-muted-foreground"><Wind className="h-10 w-10 mx-auto opacity-30 mb-2" /><p>No hay registros de arranque</p></TableCell></TableRow>
                                ) : registros.data.map((a) => (
                                    <TableRow key={a.id} className="hover:bg-muted/50">
                                        <TableCell className="text-sm whitespace-nowrap">{fmt(a.fecha)}</TableCell>
                                        <TableCell>{a.sector?.nombre || '—'}</TableCell>
                                        <TableCell className="text-center">{a.sin_olor ? <CheckCircle className="h-5 w-5 text-green-500 mx-auto" /> : <XCircle className="h-5 w-5 text-red-500 mx-auto" />}</TableCell>
                                        <TableCell className="text-center">{a.limpio ? <CheckCircle className="h-5 w-5 text-green-500 mx-auto" /> : <XCircle className="h-5 w-5 text-red-500 mx-auto" />}</TableCell>
                                        <TableCell><div className="max-w-[140px] truncate text-sm">{a.observacion || '—'}</div></TableCell>
                                        <TableCell className="text-sm">{a.inspector.name} {a.inspector.apellido}</TableCell>
                                        <TableCell className="text-center"><Badge className={(a.sin_olor && a.limpio) ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}>{(a.sin_olor && a.limpio) ? 'Apto' : 'No apto'}</Badge></TableCell>
                                        <TableCell>
                                            <DropdownMenu><DropdownMenuTrigger asChild><Button variant="ghost" size="sm" className="h-8 w-8 p-0"><MoreHorizontal className="h-4 w-4" /></Button></DropdownMenuTrigger>
                                                <DropdownMenuContent align="end"><DropdownMenuItem onClick={() => handleEdit(a)}><Edit className="mr-2 h-4 w-4" />Editar</DropdownMenuItem><DropdownMenuItem onClick={() => handleDelete(a)} className="text-destructive focus:text-destructive"><XCircle className="mr-2 h-4 w-4" />Eliminar</DropdownMenuItem></DropdownMenuContent>
                                            </DropdownMenu>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </div>
                    {registros.data.length > 0 && <div className="border-t px-4 py-3"><TablePagination pagination={registros} onPageChange={(page) => router.get(route('plagas.arranque-fumigacion.index'), { ...filters, page }, { preserveState: true, replace: true })} /></div>}
                </Card>
            </div>
            <Dialog open={createOpen} onOpenChange={setCreateOpen}><DialogContent className="max-w-xl"><DialogHeader><DialogTitle className="flex items-center gap-2"><Wind className="h-5 w-5 text-blue-600" />Nuevo Arranque Post-Fumigación</DialogTitle><DialogDescription>Fecha e inspector se registran automáticamente.</DialogDescription></DialogHeader><Formulario sectores={sectores} initialData={getInitialFormData()} onSubmit={submitCreate} processing={processing} errors={errors} onCancel={() => setCreateOpen(false)} /></DialogContent></Dialog>
            <Dialog open={editOpen} onOpenChange={setEditOpen}><DialogContent className="max-w-xl"><DialogHeader><DialogTitle className="flex items-center gap-2"><Edit className="h-5 w-5 text-blue-600" />Editar Registro</DialogTitle></DialogHeader>{selected && <Formulario sectores={sectores} initialData={{ man_sector_id: selected.sector?.id.toString() || '', sin_olor: selected.sin_olor ?? true, limpio: selected.limpio ?? true, observacion: selected.observacion || '', correcion: selected.correcion || '' }} onSubmit={submitEdit} processing={processing} errors={errors} onCancel={() => setEditOpen(false)} />}</DialogContent></Dialog>
            <Dialog open={deleteOpen} onOpenChange={setDeleteOpen}><DialogContent className="max-w-md"><DialogHeader><DialogTitle className="flex items-center gap-2"><XCircle className="h-5 w-5 text-red-600" />Eliminar registro</DialogTitle><DialogDescription>Esta acción no se puede deshacer.</DialogDescription></DialogHeader>{selected && <div className="bg-muted/30 p-4 rounded-lg"><p className="text-sm">{fmt(selected.fecha)} — {selected.sector?.nombre}</p></div>}<DialogFooter><Button variant="outline" onClick={() => setDeleteOpen(false)}>Cancelar</Button><Button variant="destructive" onClick={confirmDelete}>Eliminar</Button></DialogFooter></DialogContent></Dialog>
        </AppLayout>
    );
}

export default ArranqueFumigacionIndex;