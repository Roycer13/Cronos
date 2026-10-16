import { Button } from '@/components/ui/button';
import FilterSelect from '@/components/ui/filter-select';
import FormSelect from '@/components/ui/form-select';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Toast } from '@/components/ui/toast';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, router, usePage } from '@inertiajs/react';
import { Plus, MoreHorizontal, Edit, XCircle, Zap } from 'lucide-react';
import { route } from 'ziggy-js';
import { useState, memo } from 'react';
import TablePagination from '@/components/ui/table-pagination';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Módulos Comunes', href: '/modulos-comunes' },
    { title: 'Control de Plagas', href: '/plagas' },
    { title: 'Insectocaptores', href: '/plagas/insectocaptores' },
];

interface Insectocaptor { id: number; codigo_interno: string | null; codigo_externo: string | null; estado: boolean | null; tipo: string | null; sector: { id: number; nombre: string } | null }

interface FormData {
    man_sector_id: string;
    codigo_interno: string;
    codigo_externo: string;
    estado: boolean;
    tipo: string;
}

interface PageProps {
    registros: { data: Insectocaptor[]; links: any[]; current_page: number; last_page: number; per_page: number; total: number };
    sectores: Array<{ id: number; nombre: string }>;
    tipos: string[];
    filters: Record<string, string | undefined>;
}

export function InsectocaptoresIndex() {
    const { props } = usePage();
    const { registros, sectores = [], tipos = [] } = props as unknown as PageProps;
    const [createOpen, setCreateOpen] = useState(false);
    const [editOpen, setEditOpen]     = useState(false);
    const [deleteOpen, setDeleteOpen] = useState(false);
    const [selected, setSelected]     = useState<Insectocaptor | null>(null);

    const defaultForm = (): FormData => ({ man_sector_id: '', codigo_interno: '', codigo_externo: '', estado: true, tipo: '' });
    
    const [processing, setProcessing] = useState(false);
    const [errors, setErrors] = useState<Record<string, string>>({});

    const getInitialFormData = (): FormData => defaultForm();

    const handleCreate = () => { setCreateOpen(true); };
    const handleEdit = (i: Insectocaptor) => { setSelected(i); setEditOpen(true); };
    const handleDelete = (i: Insectocaptor) => { setSelected(i); setDeleteOpen(true); };
    const confirmDelete = () => { if (!selected) return; router.delete(route('plagas.insectocaptores.destroy', selected.id), { preserveScroll: true, onSuccess: () => { setDeleteOpen(false); setSelected(null); } }); };
    
    const submitCreate = (formData: FormData) => {
        setProcessing(true);
        router.post(route('plagas.insectocaptores.store'), formData as any, {
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
        router.put(route('plagas.insectocaptores.update', selected.id), formData as any, {
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
        tipos: string[];
        sectores: Array<{ id: number; nombre: string }>;
        initialData: FormData;
        onSubmit: (data: FormData) => void;
        processing: boolean;
        errors: Record<string, string>;
        onCancel: () => void;
    }

    const Formulario = memo(({ tipos, sectores, initialData, onSubmit, processing, errors, onCancel }: FormularioProps) => {
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
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormSelect 
                        label="Tipo *" 
                        value={localData.tipo} 
                        onChange={(v) => handleChange('tipo', v)} 
                        placeholder="Seleccionar tipo" 
                        options={tipos.map(t => ({ value: t, label: t }))} 
                    />
                    <FormSelect 
                        label="Sector"
                        value={localData.man_sector_id} 
                        onChange={(v) => handleChange('man_sector_id', v)} 
                        placeholder="Seleccionar sector" 
                        options={sectores.map(s => ({ value: s.id.toString(), label: s.nombre }))} 
                    />
                    <div className="space-y-2"><Label>Código interno</Label><Input value={localData.codigo_interno} onChange={(e) => handleChange('codigo_interno', e.target.value)} placeholder="Ej: IC-001" /></div>
                    <div className="space-y-2"><Label>Código externo</Label><Input value={localData.codigo_externo} onChange={(e) => handleChange('codigo_externo', e.target.value)} placeholder="Código del proveedor" /></div>
                    <FormSelect 
                        label="Estado"
                        value={localData.estado ? '1' : '0'} 
                        onChange={(v) => handleChange('estado', v === '1')} 
                        placeholder="Estado" 
                        options={[{ value: '1', label: 'Activo' }, { value: '0', label: 'Inactivo' }]} 
                    />
                </div>
                <DialogFooter>
                    <Button type="button" variant="outline" onClick={onCancel} disabled={processing}>Cancelar</Button>
                    <Button type="submit" disabled={processing || !localData.tipo}>{processing ? 'Guardando...' : 'Guardar'}</Button>
                </DialogFooter>
            </form>
        );
    });

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Insectocaptores / Insectocutores" />
            <div className="px-2 sm:px-6 py-4 space-y-4">
                <Toast />
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div><h1 className="text-2xl font-bold">Insectocaptores</h1><p className="text-muted-foreground mt-1">Catálogo de insectocaptores e insectocutores</p></div>
                    <Button onClick={handleCreate} className="flex items-center gap-2"><Plus className="h-4 w-4" />Nuevo Equipo</Button>
                </div>
                <Card>
                    <div className="overflow-x-auto">
                        <Table>
                            <TableHeader><TableRow><TableHead>Cód. Interno</TableHead><TableHead>Cód. Externo</TableHead><TableHead>Tipo</TableHead><TableHead>Sector</TableHead><TableHead className="text-center">Estado</TableHead><TableHead className="w-[80px]">Acciones</TableHead></TableRow></TableHeader>
                            <TableBody>
                                {registros.data.length === 0 ? (
                                    <TableRow><TableCell colSpan={6} className="text-center py-10 text-muted-foreground"><Zap className="h-10 w-10 mx-auto opacity-30 mb-2" /><p>No hay equipos registrados</p></TableCell></TableRow>
                                ) : registros.data.map((i) => (
                                    <TableRow key={i.id} className="hover:bg-muted/50">
                                        <TableCell><span className="font-mono text-sm">{i.codigo_interno || '—'}</span></TableCell>
                                        <TableCell><span className="font-mono text-sm text-muted-foreground">{i.codigo_externo || '—'}</span></TableCell>
                                        <TableCell><Badge variant="outline" className={i.tipo === 'Insectocutor' ? 'border-amber-400 text-amber-700' : 'border-blue-400 text-blue-700'}><Zap className="h-3 w-3 mr-1" />{i.tipo}</Badge></TableCell>
                                        <TableCell>{i.sector?.nombre || '—'}</TableCell>
                                        <TableCell className="text-center"><Badge className={i.estado ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-600'}>{i.estado ? 'Activo' : 'Inactivo'}</Badge></TableCell>
                                        <TableCell>
                                            <DropdownMenu><DropdownMenuTrigger asChild><Button variant="ghost" size="sm" className="h-8 w-8 p-0"><MoreHorizontal className="h-4 w-4" /></Button></DropdownMenuTrigger>
                                                <DropdownMenuContent align="end"><DropdownMenuItem onClick={() => handleEdit(i)}><Edit className="mr-2 h-4 w-4" />Editar</DropdownMenuItem><DropdownMenuItem onClick={() => handleDelete(i)} className="text-destructive focus:text-destructive"><XCircle className="mr-2 h-4 w-4" />Eliminar</DropdownMenuItem></DropdownMenuContent>
                                            </DropdownMenu>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </div>
                    {registros.data.length > 0 && <div className="border-t px-4 py-3"><TablePagination pagination={registros} onPageChange={(page) => router.get(route('plagas.insectocaptores.index'), { page }, { preserveState: true, replace: true })} /></div>}
                </Card>
            </div>

            <Dialog open={createOpen} onOpenChange={setCreateOpen}>
                <DialogContent className="max-w-lg">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2"><Zap className="h-5 w-5 text-amber-500" />Nuevo Equipo</DialogTitle>
                        <DialogDescription>Registrar insectocaptor o insectocutor.</DialogDescription>
                    </DialogHeader>
                    <Formulario tipos={tipos} sectores={sectores} initialData={getInitialFormData()} onSubmit={submitCreate} processing={processing} errors={errors} onCancel={() => setCreateOpen(false)} />
                </DialogContent>
            </Dialog>

            <Dialog open={editOpen} onOpenChange={setEditOpen}>
                <DialogContent className="max-w-lg">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2"><Edit className="h-5 w-5 text-blue-600" />Editar Equipo</DialogTitle>
                    </DialogHeader>
                    {selected && <Formulario tipos={tipos} sectores={sectores} initialData={{ man_sector_id: selected.sector?.id.toString() || '', codigo_interno: selected.codigo_interno || '', codigo_externo: selected.codigo_externo || '', estado: selected.estado ?? true, tipo: selected.tipo || '' }} onSubmit={submitEdit} processing={processing} errors={errors} onCancel={() => setEditOpen(false)} />}
                </DialogContent>
            </Dialog>

            <Dialog open={deleteOpen} onOpenChange={setDeleteOpen}>
                <DialogContent className="max-w-md">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2"><XCircle className="h-5 w-5 text-red-600" />Eliminar equipo</DialogTitle>
                        <DialogDescription>Esta acción no se puede deshacer.</DialogDescription>
                    </DialogHeader>
                    {selected && <div className="bg-muted/30 p-4 rounded-lg"><p className="font-medium">{selected.codigo_interno} — {selected.tipo}</p><p className="text-sm text-muted-foreground">{selected.sector?.nombre}</p></div>}
                    <DialogFooter><Button variant="outline" onClick={() => setDeleteOpen(false)}>Cancelar</Button><Button variant="destructive" onClick={confirmDelete}>Eliminar</Button></DialogFooter>
                </DialogContent>
            </Dialog>
        </AppLayout>
    );
}

export default InsectocaptoresIndex;