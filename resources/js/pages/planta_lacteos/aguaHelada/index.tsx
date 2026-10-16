import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
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
import { Filter, MoreHorizontal, Pencil, Plus, Trash2, X, Snowflake } from 'lucide-react';
import { useState } from 'react';
import { route } from 'ziggy-js';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import FormInput from '@/components/ui/form-input';
import FormSelect from '@/components/ui/form-select';
import TablePagination from '@/components/ui/table-pagination';
import { useForm } from '@inertiajs/react';

const breadcrumbs = [{ title: 'Agua Helada', href: '/planta-lacteos/agua-helada' }];

interface Registro {
    id: number;
    ubicacion_id: number;
    fecha: string;
    p1_dir: number | null;
    p2_d1: number | null;
    p3_d2: number | null;
    p4_dir: number | null;
    p5_dir: number | null;
    p6_d3: number | null;
    p7_dir: number | null;
    ubicacion?: { id: number; nombre: string };
    usuario?: { id: number; name: string; apellido: string };
}

interface PageProps {
    registros: {
        data: Registro[];
        links: any[];
        current_page: number;
        last_page: number;
        per_page: number;
        total: number;
    };
    filters: {
        ubicacion_id?: string;
        user_id?: string;
        fecha_desde?: string;
        fecha_hasta?: string;
        per_page?: string;
    };
    ubicaciones?: { id: number; nombre: string }[];
    usuarios?: { id: number; name: string; apellido: string }[];
    flash: { success?: string; error?: string };
}

export default function Index() {
    const { props } = usePage();
    const { hasPermission } = useAuth();
    const [showFilters, setShowFilters] = useState(false);
    const [modalOpen, setModalOpen] = useState(false);
    const [editing, setEditing] = useState<Registro | null>(null);

    const {
        registros = { data: [], links: [], current_page: 1, last_page: 1, per_page: 10, total: 0 },
        filters: initialFilters = {},
        ubicaciones = [],
        usuarios = [],
        flash,
    } = props as unknown as PageProps;

    const { filters, updateFilter, resetFilters } = useAdvancedFilters({
        routeName: 'agua-helada.index',
        initialFilters: {
            ubicacion_id: initialFilters.ubicacion_id || undefined,
            user_id: initialFilters.user_id || undefined,
            fecha_desde: initialFilters.fecha_desde || undefined,
            fecha_hasta: initialFilters.fecha_hasta || undefined,
            per_page: initialFilters.per_page?.toString() || '10',
        },
        debounceFields: [],
        debounceDelay: 600,
    });

    function toDatetimeLocal(date = new Date()) {
        const pad = (n: number) => String(n).padStart(2, '0');
        const y = date.getFullYear();
        const m = pad(date.getMonth() + 1);
        const d = pad(date.getDate());
        const hh = pad(date.getHours());
        const mm = pad(date.getMinutes());
        return `${y}-${m}-${d}T${hh}:${mm}`;
    }

    const { data: formData, setData: setFormData, post, put, processing, errors, reset } = useForm({
        fecha: toDatetimeLocal(),
        p1_dir: '',
        p2_d1: '',
        p3_d2: '',
        p4_dir: '',
        p5_dir: '',
        p6_d3: '',
        p7_dir: '',
    });

    const hasActiveFilters = Object.values(filters).some(v => v && v !== '' && v !== '10');

    const handleCreate = () => {
        setEditing(null);
        reset();
        setFormData({
            fecha: toDatetimeLocal(),
            p1_dir: '', p2_d1: '', p3_d2: '', p4_dir: '', p5_dir: '', p6_d3: '', p7_dir: '',
        });
        setModalOpen(true);
    };

    const handleEdit = (registro: Registro) => {
        setEditing(registro);
        setFormData({
            fecha: registro.fecha ? toDatetimeLocal(new Date(registro.fecha)) : toDatetimeLocal(),
            p1_dir: registro.p1_dir?.toString() ?? '',
            p2_d1: registro.p2_d1?.toString() ?? '',
            p3_d2: registro.p3_d2?.toString() ?? '',
            p4_dir: registro.p4_dir?.toString() ?? '',
            p5_dir: registro.p5_dir?.toString() ?? '',
            p6_d3: registro.p6_d3?.toString() ?? '',
            p7_dir: registro.p7_dir?.toString() ?? '',
        });
        setModalOpen(true);
    };

    const handleDelete = (id: number) => {
        if (confirm('¿Eliminar este registro?')) {
            router.delete(route('agua-helada.destroy', id), { preserveScroll: true });
        }
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        if (editing) {
            put(route('agua-helada.update', editing.id), {
                onSuccess: () => { setModalOpen(false); reset(); },
            });
        } else {
            post(route('agua-helada.store'), {
                onSuccess: () => { setModalOpen(false); reset(); },
            });
        }
    };

    const formatFecha = (fecha: string) => {
        return new Date(fecha).toLocaleString('es-ES', {
            day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit'
        });
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Agua Helada" />
            <div className="space-y-2 px-2 py-2 sm:px-6">
                <Toast />

                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <h1 className="text-2xl font-bold flex items-center gap-2">
                            <Snowflake className="h-6 w-6" /> Agua Helada
                        </h1>
                        <p className="text-sm text-muted-foreground">Registro de parámetros de agua helada</p>
                    </div>
                    <div className="flex gap-2">
                        {hasPermission('c_aguaHelada') && (
                            <Button onClick={handleCreate}><Plus className="h-4 w-4 mr-2" /> Nuevo Registro</Button>
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
                                options={['30','25','50','100'].map(v => ({ value: v, label: `${v} por página` }))}
                                includeAllOption={false}
                            />
                        </div>
                    </div>
                )}

                <Card>
                    <div className="overflow-x-auto">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead className="w-[140px]">Fecha/Hora</TableHead>
                                    <TableHead>Ubicación</TableHead>
                                    <TableHead>P1 DIR</TableHead>
                                    <TableHead>P2 D1</TableHead>
                                    <TableHead>P3 D2</TableHead>
                                    <TableHead>P4 DIR</TableHead>
                                    <TableHead>P5 DIR</TableHead>
                                    <TableHead>P6 D3</TableHead>
                                    <TableHead>P7 DIR</TableHead>
                                    <TableHead>Usuario</TableHead>
                                    <TableHead className="w-[80px]">Acciones</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {registros.data.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={11} className="text-center py-8 text-muted-foreground">
                                            <Snowflake className="mx-auto h-12 w-12 mb-3 opacity-50" />
                                            <p>No se encontraron registros</p>
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    registros.data.map(registro => (
                                        <TableRow key={registro.id}>
                                            <TableCell>{formatFecha(registro.fecha)}</TableCell>
                                            <TableCell>{registro.ubicacion?.nombre || '-'}</TableCell>
                                            <TableCell>{registro.p1_dir ?? '-'}</TableCell>
                                            <TableCell>{registro.p2_d1 ?? '-'}</TableCell>
                                            <TableCell>{registro.p3_d2 ?? '-'}</TableCell>
                                            <TableCell>{registro.p4_dir ?? '-'}</TableCell>
                                            <TableCell>{registro.p5_dir ?? '-'}</TableCell>
                                            <TableCell>{registro.p6_d3 ?? '-'}</TableCell>
                                            <TableCell>{registro.p7_dir ?? '-'}</TableCell>
                                            <TableCell>{registro.usuario ? `${registro.usuario.name} ${registro.usuario.apellido}` : '-'}</TableCell>
                                            <TableCell>
                                                <DropdownMenu>
                                                    <DropdownMenuTrigger asChild>
                                                        <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                                                            <MoreHorizontal className="h-4 w-4" />
                                                        </Button>
                                                    </DropdownMenuTrigger>
                                                    <DropdownMenuContent align="end">
                                                        {hasPermission('u_aguaHelada') && (
                                                            <DropdownMenuItem onClick={() => handleEdit(registro)}>
                                                                <Pencil className="mr-2 h-4 w-4" /> Editar
                                                            </DropdownMenuItem>
                                                        )}
                                                        {hasPermission('d_aguaHelada') && (
                                                            <DropdownMenuItem onClick={() => handleDelete(registro.id)} className="text-destructive">
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
                    {registros.data.length > 0 && (
                        <div className="border-t px-4 py-3">
                            <TablePagination
                                pagination={registros}
                                onPageChange={(page) => router.get(route('agua-helada.index'), { ...filters, page }, { preserveState: true })}
                            />
                        </div>
                    )}
                </Card>

                <div className="flex items-center justify-between text-muted-foreground text-sm">
                    <span>{registros.total} registros totales</span>
                    {registros.data.length > 0 && <span>Mostrando {registros.data.length} de {registros.total}</span>}
                </div>
            </div>

            {/* Modal Crear/Editar */}
            <Dialog open={modalOpen} onOpenChange={setModalOpen}>
                <DialogContent className="max-w-2xl">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                            <Snowflake className="h-5 w-5" />
                            {editing ? 'Editar Registro' : 'Nuevo Registro de Agua Helada'}
                        </DialogTitle>
                        <DialogDescription>
                            Complete los parámetros de medición
                        </DialogDescription>
                    </DialogHeader>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <FormInput
                                id="fecha"
                                label="Fecha y Hora"
                                type="datetime-local"
                                value={formData.fecha}
                                onChange={(e) => setFormData('fecha', e.target.value)}
                                error={errors.fecha}
                                required
                            />
                        </div>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                            <FormInput label="P1 DIR" type="number" step="0.01" value={formData.p1_dir} onChange={(e) => setFormData('p1_dir', e.target.value)} error={errors.p1_dir} />
                            <FormInput label="P2 D1" type="number" step="0.01" value={formData.p2_d1} onChange={(e) => setFormData('p2_d1', e.target.value)} error={errors.p2_d1} />
                            <FormInput label="P3 D2" type="number" step="0.01" value={formData.p3_d2} onChange={(e) => setFormData('p3_d2', e.target.value)} error={errors.p3_d2} />
                            <FormInput label="P4 DIR" type="number" step="0.01" value={formData.p4_dir} onChange={(e) => setFormData('p4_dir', e.target.value)} error={errors.p4_dir} />
                            <FormInput label="P5 DIR" type="number" step="0.01" value={formData.p5_dir} onChange={(e) => setFormData('p5_dir', e.target.value)} error={errors.p5_dir} />
                            <FormInput label="P6 D3" type="number" step="0.01" value={formData.p6_d3} onChange={(e) => setFormData('p6_d3', e.target.value)} error={errors.p6_d3} />
                            <FormInput label="P7 DIR" type="number" step="0.01" value={formData.p7_dir} onChange={(e) => setFormData('p7_dir', e.target.value)} error={errors.p7_dir} />
                        </div>
                        <DialogFooter>
                            <Button type="button" variant="outline" onClick={() => setModalOpen(false)}>Cancelar</Button>
                            <Button type="submit" disabled={processing}>{processing ? 'Guardando...' : editing ? 'Actualizar' : 'Crear'}</Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>
        </AppLayout>
    );
}