import { Button } from '@/components/ui/button';
import FilterSelect from '@/components/ui/filter-select';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Toast } from '@/components/ui/toast';
import { useAdvancedFilters } from '@/hooks/use-advanced-filters';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, router, usePage, useForm } from '@inertiajs/react';
import { useAuth } from '@/hooks/useAuth';
import { Plus, Filter, X, MoreHorizontal, Edit, XCircle, Shield } from 'lucide-react';
import { route } from 'ziggy-js';
import { useState } from 'react';
import TablePagination from '@/components/ui/table-pagination';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Módulos Comunes', href: '/modulos-comunes' },
    { title: 'Control de Plagas', href: '/plagas' },
    { title: 'Barreras', href: '/plagas/barreras' },
];

const TIPOS_BARRERA = ['Puerta/Burlete', 'Rejilla', 'Malla milimetrica', 'Otros'];

interface Barrera {
    id: number;
    codigo_interno: string | null;
    tipo: string | null;
    estado: boolean | null;
    sector: { id: number; nombre: string } | null;
}
interface PageProps {
    registros: { data: Barrera[]; links: any[]; current_page: number; last_page: number; per_page: number; total: number };
    sectores: Array<{ id: number; nombre: string }>;
    filters: Record<string, string | undefined>;
    flash: { success?: string; error?: string };
}

export default function BarrerasIndex() {
    const { props } = usePage();
    const { registros, sectores = [], filters: initialFilters = {}, flash } = props as unknown as PageProps;
    const { hasPermission } = useAuth();
    const [showFilters, setShowFilters] = useState(false);
    const [createOpen, setCreateOpen] = useState(false);
    const [editOpen, setEditOpen]     = useState(false);
    const [deleteOpen, setDeleteOpen] = useState(false);
    const [selected, setSelected]     = useState<Barrera | null>(null);

    const { filters, updateFilter, resetFilters } = useAdvancedFilters({
        routeName: 'plagas.barreras.index',
        initialFilters: { filtro_sector: initialFilters.filtro_sector, filtro_tipo: initialFilters.filtro_tipo, filtro_estado: initialFilters.filtro_estado, per_page: '10' },
        debounceFields: [],
        debounceDelay: 400,
    });

    const hasActiveFilters = Object.entries(filters).some(([k, v]) => v && v !== '' && v !== '10');

    const { data, setData, post, put, processing, errors, reset } = useForm({
        codigo_interno: '', man_sector_id: '', tipo: '', estado: true as boolean,
    });

    const handleCreate = () => { reset(); setCreateOpen(true); };
    const handleEdit   = (b: Barrera) => {
        setSelected(b);
        setData({ codigo_interno: b.codigo_interno || '', man_sector_id: b.sector?.id.toString() || '', tipo: b.tipo || '', estado: b.estado ?? true });
        setEditOpen(true);
    };
    const handleDelete = (b: Barrera) => { setSelected(b); setDeleteOpen(true); };
    const confirmDelete = () => {
        if (!selected) return;
        router.delete(route('plagas.barreras.destroy', selected.id), { preserveScroll: true, onSuccess: () => { setDeleteOpen(false); setSelected(null); } });
    };
    const submitCreate = (e: React.FormEvent) => { e.preventDefault(); post(route('plagas.barreras.store'), { onSuccess: () => { setCreateOpen(false); reset(); } }); };
    const submitEdit   = (e: React.FormEvent) => {
        e.preventDefault();
        if (!selected) return;
        put(route('plagas.barreras.update', selected.id), { onSuccess: () => { setEditOpen(false); setSelected(null); reset(); } });
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Barreras de Plagas" />
            <div className="px-2 sm:px-6 py-4 space-y-4">
                <Toast />
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div>
                        <h1 className="text-2xl font-bold">Barreras de Plagas</h1>
                        <p className="text-muted-foreground mt-1">Catálogo de barreras registradas en las instalaciones</p>
                    </div>
                    {hasPermission('c_plagasBarreras') && (
                        <Button onClick={handleCreate} className="flex items-center gap-2">
                            <Plus className="h-4 w-4" /><span className="hidden sm:inline">Nueva Barrera</span><span className="sm:hidden">Nueva</span>
                        </Button>
                    )}
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
                        <div className="p-4 grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4">
                            <div className="space-y-2"><Label>Sector</Label><FilterSelect value={filters.filtro_sector} onChange={(v) => updateFilter('filtro_sector', v)} placeholder="Todos los sectores" options={sectores.map(s => ({ value: s.id.toString(), label: s.nombre }))} /></div>
                            <div className="space-y-2"><Label>Tipo</Label><FilterSelect value={filters.filtro_tipo} onChange={(v) => updateFilter('filtro_tipo', v)} placeholder="Todos los tipos" options={TIPOS_BARRERA.map(t => ({ value: t, label: t }))} /></div>
                            <div className="space-y-2"><Label>Estado</Label><FilterSelect value={filters.filtro_estado} onChange={(v) => updateFilter('filtro_estado', v)} placeholder="Todos" options={[{ value: '1', label: 'Activo' }, { value: '0', label: 'Inactivo' }]} /></div>
                            <div className="space-y-2"><Label>Por página</Label><FilterSelect value={filters.per_page} onChange={(v) => updateFilter('per_page', v)} placeholder="10 por página" includeAllOption={false} options={['10','25','50'].map(v => ({ value: v, label: `${v} por página` }))} /></div>
                        </div>
                    )}
                </Card>

                {/* Tabla */}
                <Card>
                    <div className="overflow-x-auto">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Código Interno</TableHead>
                                    <TableHead>Sector</TableHead>
                                    <TableHead>Tipo</TableHead>
                                    <TableHead className="text-center">Estado</TableHead>
                                    <TableHead className="w-[80px]">Acciones</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {registros.data.length === 0 ? (
                                    <TableRow><TableCell colSpan={5} className="text-center py-12 text-muted-foreground">
                                        <Shield className="h-10 w-10 mx-auto opacity-30 mb-2" /><p>No hay barreras registradas</p>
                                    </TableCell></TableRow>
                                ) : registros.data.map((b) => (
                                    <TableRow key={b.id} className="hover:bg-muted/50">
                                        <TableCell><span className="font-mono text-sm">{b.codigo_interno || '—'}</span></TableCell>
                                        <TableCell>{b.sector?.nombre || <span className="text-muted-foreground">Sin sector</span>}</TableCell>
                                        <TableCell>{b.tipo || '—'}</TableCell>
                                        <TableCell className="text-center">
                                            <Badge className={b.estado ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400' : 'bg-gray-100 text-gray-600'}>
                                                {b.estado ? 'Activo' : 'Inactivo'}
                                            </Badge>
                                        </TableCell>
                                        <TableCell>
                                            <DropdownMenu>
                                                <DropdownMenuTrigger asChild><Button variant="ghost" size="sm" className="h-8 w-8 p-0"><MoreHorizontal className="h-4 w-4" /></Button></DropdownMenuTrigger>
                                                <DropdownMenuContent align="end">
                                                    {hasPermission('u_plagasBarreras') && (
                                                        <DropdownMenuItem onClick={() => handleEdit(b)}><Edit className="mr-2 h-4 w-4" />Editar</DropdownMenuItem>
                                                    )}
                                                    {hasPermission('d_plagasBarreras') && (
                                                        <DropdownMenuItem onClick={() => handleDelete(b)} className="text-destructive focus:text-destructive"><XCircle className="mr-2 h-4 w-4" />Eliminar</DropdownMenuItem>
                                                    )}
                                                </DropdownMenuContent>
                                            </DropdownMenu>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </div>
                    {registros.data.length > 0 && (
                        <div className="border-t px-4 py-3">
                            <TablePagination pagination={registros} onPageChange={(page) => router.get(route('plagas.barreras.index'), { ...filters, page }, { preserveState: true, replace: true })} />
                        </div>
                    )}
                </Card>
                <p className="text-sm text-muted-foreground">{registros.total} barreras registradas</p>
            </div>

            {/* Modal Crear */}
            <Dialog open={createOpen} onOpenChange={setCreateOpen}>
                <DialogContent className="max-w-lg">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2"><Shield className="h-5 w-5 text-blue-600" />Nueva Barrera</DialogTitle>
                        <DialogDescription>Complete los datos de la barrera de plagas.</DialogDescription>
                    </DialogHeader>
                    <form onSubmit={submitCreate} className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2"><Label>Código interno</Label><Input value={data.codigo_interno} onChange={(e) => setData('codigo_interno', e.target.value)} placeholder="Ej: BAR-001" /></div>
                            <div className="space-y-2"><Label>Sector</Label>
                                <FilterSelect value={data.man_sector_id} onChange={(v) => setData('man_sector_id', v)} placeholder="Seleccionar sector" includeAllOption={false} options={sectores.map(s => ({ value: s.id.toString(), label: s.nombre }))} />
                            </div>
                            <div className="space-y-2"><Label>Tipo</Label>
                                <FilterSelect value={data.tipo} onChange={(v) => setData('tipo', v)} placeholder="Seleccionar tipo" includeAllOption={false} options={TIPOS_BARRERA.map(t => ({ value: t, label: t }))} />
                            </div>
                            <div className="space-y-2"><Label>Estado</Label>
                                <FilterSelect value={data.estado ? '1' : '0'} onChange={(v) => setData('estado', v === '1')} placeholder="Estado" includeAllOption={false} options={[{ value: '1', label: 'Activo' }, { value: '0', label: 'Inactivo' }]} />
                            </div>
                        </div>
                        <DialogFooter>
                            <Button type="button" variant="outline" onClick={() => setCreateOpen(false)} disabled={processing}>Cancelar</Button>
                            <Button type="submit" disabled={processing}>{processing ? 'Guardando...' : 'Guardar'}</Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>

            {/* Modal Editar */}
            <Dialog open={editOpen} onOpenChange={setEditOpen}>
                <DialogContent className="max-w-lg">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2"><Edit className="h-5 w-5 text-blue-600" />Editar Barrera</DialogTitle>
                    </DialogHeader>
                    <form onSubmit={submitEdit} className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2"><Label>Código interno</Label><Input value={data.codigo_interno} onChange={(e) => setData('codigo_interno', e.target.value)} /></div>
                            <div className="space-y-2"><Label>Sector</Label><FilterSelect value={data.man_sector_id} onChange={(v) => setData('man_sector_id', v)} placeholder="Seleccionar" includeAllOption={false} options={sectores.map(s => ({ value: s.id.toString(), label: s.nombre }))} /></div>
                            <div className="space-y-2"><Label>Tipo</Label><FilterSelect value={data.tipo} onChange={(v) => setData('tipo', v)} placeholder="Seleccionar" includeAllOption={false} options={TIPOS_BARRERA.map(t => ({ value: t, label: t }))} /></div>
                            <div className="space-y-2"><Label>Estado</Label><FilterSelect value={data.estado ? '1' : '0'} onChange={(v) => setData('estado', v === '1')} placeholder="Estado" includeAllOption={false} options={[{ value: '1', label: 'Activo' }, { value: '0', label: 'Inactivo' }]} /></div>
                        </div>
                        <DialogFooter>
                            <Button type="button" variant="outline" onClick={() => setEditOpen(false)} disabled={processing}>Cancelar</Button>
                            <Button type="submit" disabled={processing}>{processing ? 'Guardando...' : 'Actualizar'}</Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>

            {/* Confirmar eliminar */}
            <Dialog open={deleteOpen} onOpenChange={setDeleteOpen}>
                <DialogContent className="max-w-md">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2"><XCircle className="h-5 w-5 text-red-600" />Eliminar Barrera</DialogTitle>
                        <DialogDescription>Esta acción no se puede deshacer.</DialogDescription>
                    </DialogHeader>
                    {selected && <div className="bg-muted/30 p-4 rounded-lg"><p className="font-medium">{selected.codigo_interno || 'Sin código'}</p><p className="text-sm text-muted-foreground">{selected.tipo} — {selected.sector?.nombre || 'Sin sector'}</p></div>}
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setDeleteOpen(false)}>Cancelar</Button>
                        <Button variant="destructive" onClick={confirmDelete}>Eliminar</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </AppLayout>
    );
}