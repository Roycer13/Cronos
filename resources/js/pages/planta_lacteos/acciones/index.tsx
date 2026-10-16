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
import { Filter, X, Pencil, Trash2, ListChecks } from 'lucide-react';
import { route } from 'ziggy-js';
import { Badge } from '@/components/ui/badge';
import TablePagination from '@/components/ui/table-pagination';
import { useState } from 'react';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from '@/components/ui/dialog';
import { useForm } from '@inertiajs/react';
import FormInput from '@/components/ui/form-input';
import FormSelect from '@/components/ui/form-select';

interface Accion {
    id: number;
    inspeccion: {
        id: number;
        infraestructura: { nombre: string };
        fecha: string;
    };
    criterio: string;
    descripcion: string;
    tipo_accion?: string;
    responsable?: string;
    fecha_ejecucion?: string;
    estado: string;
    referencia?: string;
    observaciones?: string;
}

interface PageProps {
    acciones: {
        data: Accion[];
        links: any[];
        current_page: number;
        last_page: number;
        per_page: number;
        total: number;
    };
    filters: any;
    estados: string[];
    criterios: string[];
    flash: any;
}

export default function Index() {
    const { props } = usePage();
    const { hasPermission } = useAuth();
    const [showFilters, setShowFilters] = useState(false);
    const [editingAccion, setEditingAccion] = useState<Accion | null>(null);
    const [modalOpen, setModalOpen] = useState(false);

    const { acciones, filters: initialFilters, estados, criterios, flash } = props as unknown as PageProps;

    const { filters, updateFilter, resetFilters } = useAdvancedFilters({
        routeName: 'acciones-infraestructura.index',
        initialFilters: {
            inspeccion_infraestructura_id: initialFilters.inspeccion_infraestructura_id?.toString() || undefined,
            estado: initialFilters.estado || undefined,
            criterio: initialFilters.criterio || undefined,
            responsable: initialFilters.responsable || undefined,
            per_page: initialFilters.per_page?.toString() || '10',
        },
    });

    const { data: accionForm, setData: setAccionForm, put, processing, errors } = useForm({
        inspeccion_infraestructura_id: '',
        criterio: '',
        descripcion: '',
        tipo_accion: '',
        responsable: '',
        fecha_ejecucion: '',
        estado: 'Pendiente',
        referencia: '',
        observaciones: '',
    });

    const handleEdit = (accion: Accion) => {
        setEditingAccion(accion);
        setAccionForm({
            inspeccion_infraestructura_id: accion.inspeccion.id.toString(),
            criterio: accion.criterio,
            descripcion: accion.descripcion,
            tipo_accion: accion.tipo_accion || '',
            responsable: accion.responsable || '',
            fecha_ejecucion: accion.fecha_ejecucion || '',
            estado: accion.estado,
            referencia: accion.referencia || '',
            observaciones: accion.observaciones || '',
        });
        setModalOpen(true);
    };

    const handleDelete = (id: number) => {
        if (confirm('¿Eliminar acción?')) {
            router.delete(route('acciones-infraestructura.destroy', id), { preserveScroll: true });
        }
    };

    const handleUpdate = (e: React.FormEvent) => {
        e.preventDefault();
        if (editingAccion) {
            put(route('acciones-infraestructura.update', editingAccion.id), {
                onSuccess: () => { setModalOpen(false); },
            });
        }
    };

    const hasActiveFilters = Object.values(filters).some(v => v && v !== '' && v !== '10');

    return (
        <AppLayout breadcrumbs={[{ title: 'Acciones de Infraestructura', href: '/planta-lacteos/acciones-infraestructura' }]}>
            <Head title="Acciones de Infraestructura" />
            <div className="space-y-2 px-2 py-2 sm:px-6">
                <Toast />
                <div className="flex justify-between items-center">
                    <div>
                        <h1 className="text-2xl font-bold flex items-center gap-2">
                            <ListChecks className="h-6 w-6" /> Acciones de Seguimiento
                        </h1>
                        <p className="text-sm text-muted-foreground">Gestión de hallazgos de infraestructura</p>
                    </div>
                    <Button variant="outline" size="sm" onClick={() => setShowFilters(!showFilters)}>
                        <Filter className="h-4 w-4" />
                        {hasActiveFilters && <span className="ml-1 flex h-5 w-5 items-center justify-center rounded-full bg-primary text-xs text-primary-foreground">!</span>}
                    </Button>
                </div>

                {showFilters && (
                    <div className="rounded-lg border bg-muted/50 p-3">
                        <div className="flex justify-between mb-3">
                            <h3 className="font-semibold">Filtros</h3>
                            {hasActiveFilters && <Button variant="ghost" size="sm" onClick={resetFilters}><X className="h-4 w-4 mr-1" /> Limpiar</Button>}
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                            <FilterSelect
                                value={filters.estado}
                                onChange={(v) => updateFilter('estado', v)}
                                placeholder="Estado"
                                options={estados.map(e => ({ value: e, label: e }))}
                            />
                            <FilterSelect
                                value={filters.criterio}
                                onChange={(v) => updateFilter('criterio', v)}
                                placeholder="Criterio"
                                options={criterios.map(c => ({ value: c, label: c.charAt(0).toUpperCase() + c.slice(1) }))}
                            />
                            <Input
                                placeholder="Responsable"
                                value={filters.responsable || ''}
                                onChange={(e) => updateFilter('responsable', e.target.value)}
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

                <Card>
                    <div className="overflow-x-auto">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Área</TableHead>
                                    <TableHead>Inspección</TableHead>
                                    <TableHead>Criterio</TableHead>
                                    <TableHead>Descripción</TableHead>
                                    <TableHead>Responsable</TableHead>
                                    <TableHead>Estado</TableHead>
                                    <TableHead className="w-[80px]">Acciones</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {acciones.data.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                                            <ListChecks className="mx-auto h-12 w-12 mb-3 opacity-50" />
                                            <p>No se encontraron acciones</p>
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    acciones.data.map(accion => (
                                        <TableRow key={accion.id}>
                                            <TableCell>{accion.inspeccion?.infraestructura?.nombre}</TableCell>
                                            <TableCell>#{accion.inspeccion?.id}</TableCell>
                                            <TableCell className="capitalize">{accion.criterio}</TableCell>
                                            <TableCell className="max-w-xs truncate">{accion.descripcion}</TableCell>
                                            <TableCell>{accion.responsable || '-'}</TableCell>
                                            <TableCell>
                                                <Badge variant={accion.estado === 'Cerrada' ? 'outline' : 'default'}>
                                                    {accion.estado}
                                                </Badge>
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex gap-1">
                                                    {hasPermission('u_accionInfra') && (
                                                        <Button variant="ghost" size="sm" onClick={() => handleEdit(accion)}>
                                                            <Pencil className="h-4 w-4" />
                                                        </Button>
                                                    )}
                                                    {hasPermission('d_accionInfra') && (
                                                        <Button variant="ghost" size="sm" onClick={() => handleDelete(accion.id)}>
                                                            <Trash2 className="h-4 w-4 text-destructive" />
                                                        </Button>
                                                    )}
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    ))
                                )}
                            </TableBody>
                        </Table>
                    </div>
                    {acciones.data.length > 0 && (
                        <div className="border-t px-4 py-3">
                            <TablePagination
                                pagination={acciones}
                                onPageChange={(page) => router.get(route('acciones-infraestructura.index'), { ...filters, page }, { preserveState: true })}
                            />
                        </div>
                    )}
                </Card>
            </div>

            <Dialog open={modalOpen} onOpenChange={setModalOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Editar Acción</DialogTitle>
                    </DialogHeader>
                    <form onSubmit={handleUpdate} className="space-y-4">
                        <FormInput id="accion-criterio" label="Criterio" value={accionForm.criterio} onChange={(e) => setAccionForm('criterio', e.target.value)} required />
                        <FormInput id="accion-descripcion" label="Descripción" value={accionForm.descripcion} onChange={(e) => setAccionForm('descripcion', e.target.value)} required />
                        <FormInput id="accion-tipo" label="Tipo de acción" value={accionForm.tipo_accion} onChange={(e) => setAccionForm('tipo_accion', e.target.value)} />
                        <FormInput id="accion-responsable" label="Responsable" value={accionForm.responsable} onChange={(e) => setAccionForm('responsable', e.target.value)} />
                        <FormInput id="accion-fecha-ejecucion" label="Fecha ejecución" type="date" value={accionForm.fecha_ejecucion} onChange={(e) => setAccionForm('fecha_ejecucion', e.target.value)} />
                        <FormSelect
                            label="Estado"
                            value={accionForm.estado}
                            onChange={(v) => setAccionForm('estado', v)}
                            options={['Pendiente','En Proceso','Cerrada'].map(e => ({ value: e, label: e }))}
                        />
                        <FormInput id="accion-referencia" label="Referencia" value={accionForm.referencia} onChange={(e) => setAccionForm('referencia', e.target.value)} />
                        <FormInput id="accion-observaciones" label="Observaciones" value={accionForm.observaciones} onChange={(e) => setAccionForm('observaciones', e.target.value)} />
                        <DialogFooter>
                            <Button type="button" variant="outline" onClick={() => setModalOpen(false)}>Cancelar</Button>
                            <Button type="submit" disabled={processing}>Actualizar</Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>
        </AppLayout>
    );
}