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
import { type BreadcrumbItem } from '@/types';
import { Head, router, usePage } from '@inertiajs/react';
import {
    Building2,
    Filter,
    MoreHorizontal,
    Pencil,
    Plus,
    Power,
    PowerOff,
    Trash2,
    X,
} from 'lucide-react';
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
import { Badge } from '@/components/ui/badge';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Áreas de Infraestructura', href: '/planta-lacteos/infraestructuras' },
];

interface Infraestructura {
    id: number;
    ubicacion_id: number;
    nombre: string;
    nivel: string | null;
    periodicidad_dias: number;
    ultima_inspeccion: string | null;
    inspeccion_vencida: boolean;
    activo: boolean;
    usa_pisos: boolean;
    usa_paredes: boolean;
    usa_techos: boolean;
    usa_puertas: boolean;
    usa_ventanas: boolean;
    usa_drenajes: boolean;
    usa_iluminacion: boolean;
    usa_ventilacion: boolean;
    usa_lavamanos: boolean;
    usa_servicios_sanitarios: boolean;
    usa_almacenamiento: boolean;
    usa_senalizacion: boolean;
    usa_maquina_equipo: boolean;
    usa_extra: boolean;
}

interface InfraestructuraFormData {
    ubicacion_id: string;
    nombre: string;
    nivel: string;
    periodicidad_dias: string;
    activo: boolean;
    usa_pisos: boolean;
    usa_paredes: boolean;
    usa_techos: boolean;
    usa_puertas: boolean;
    usa_ventanas: boolean;
    usa_drenajes: boolean;
    usa_iluminacion: boolean;
    usa_ventilacion: boolean;
    usa_lavamanos: boolean;
    usa_servicios_sanitarios: boolean;
    usa_almacenamiento: boolean;
    usa_senalizacion: boolean;
    usa_maquina_equipo: boolean;
    usa_extra: boolean;
}

interface PageProps {
    infraestructuras: {
        data: Infraestructura[];
        links: any[];
        current_page: number;
        last_page: number;
        per_page: number;
        total: number;
    };
    filters: {
        nombre?: string;
        activo?: string;
        per_page?: string;
    };
    ubicaciones?: Array<{ id: number; nombre: string }>;
    flash: {
        success?: string;
        error?: string;
    };
}

export default function Index() {
    const { props } = usePage();
    const { hasPermission } = useAuth();
    const [showFilters, setShowFilters] = useState(false);
    const [modalOpen, setModalOpen] = useState(false);
    const [editing, setEditing] = useState<Infraestructura | null>(null);

    const {
        infraestructuras = {
            data: [],
            links: [],
            current_page: 1,
            last_page: 1,
            per_page: 10,
            total: 0,
        },
        filters: initialFilters = {},
        ubicaciones = [],
        flash,
    } = props as unknown as PageProps;

    const { filters, updateFilter, resetFilters } = useAdvancedFilters({
        routeName: 'infraestructuras.index',
        initialFilters: {
            nombre: initialFilters.nombre || undefined,
            activo: initialFilters.activo || undefined,
            per_page: initialFilters.per_page?.toString() || '10',
        },
        debounceFields: ['nombre'],
        debounceDelay: 600,
    });

    const criteriosDisponibles = [
        'pisos','paredes','techos','puertas','ventanas','drenajes',
        'iluminacion','ventilacion','lavamanos','servicios_sanitarios',
        'almacenamiento','senalizacion','maquina_equipo','extra'
    ];

    const { data: formData, setData: setFormData, post, put, processing, errors, reset } = useForm<any>({
        ubicacion_id: '',
        nombre: '',
        nivel: '',
        periodicidad_dias: '30',
        activo: true,
        usa_pisos: false,
        usa_paredes: false,
        usa_techos: false,
        usa_puertas: false,
        usa_ventanas: false,
        usa_drenajes: false,
        usa_iluminacion: false,
        usa_ventilacion: false,
        usa_lavamanos: false,
        usa_servicios_sanitarios: false,
        usa_almacenamiento: false,
        usa_senalizacion: false,
        usa_maquina_equipo: false,
        usa_extra: false,
    });

    const setFormField = (field: string, value: any) => {
        (setFormData as unknown as (key: string, value: any) => void)(field, value);
    };

    const hasActiveFilters = Object.values(filters).some(v => v && v !== '' && v !== '10');

    const handleCreate = () => {
        setEditing(null);
        reset();
        setModalOpen(true);
    };

    const handleEdit = (infra: Infraestructura) => {
        setEditing(infra);
        setFormData({
            ubicacion_id: infra.ubicacion_id.toString(),
            nombre: infra.nombre,
            nivel: infra.nivel || '',
            periodicidad_dias: infra.periodicidad_dias.toString(),
            activo: infra.activo,
            usa_pisos: infra.usa_pisos,
            usa_paredes: infra.usa_paredes,
            usa_techos: infra.usa_techos,
            usa_puertas: infra.usa_puertas,
            usa_ventanas: infra.usa_ventanas,
            usa_drenajes: infra.usa_drenajes,
            usa_iluminacion: infra.usa_iluminacion,
            usa_ventilacion: infra.usa_ventilacion,
            usa_lavamanos: infra.usa_lavamanos,
            usa_servicios_sanitarios: infra.usa_servicios_sanitarios,
            usa_almacenamiento: infra.usa_almacenamiento,
            usa_senalizacion: infra.usa_senalizacion,
            usa_maquina_equipo: infra.usa_maquina_equipo,
            usa_extra: infra.usa_extra,
        });
        setModalOpen(true);
    };

    const handleDelete = (id: number) => {
        if (confirm('¿Eliminar esta área y todas sus inspecciones?')) {
            router.delete(route('infraestructuras.destroy', id), { preserveScroll: true });
        }
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (editing) {
            put(route('infraestructuras.update', editing.id), {
                onSuccess: () => { setModalOpen(false); reset(); },
            });
        } else {
            post(route('infraestructuras.store'), {
                onSuccess: () => { setModalOpen(false); reset(); },
            });
        }
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Áreas de Infraestructura BPM" />
            <div className="space-y-2 px-2 py-2 sm:px-6">
                <Toast />

                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <h1 className="text-2xl font-bold">Áreas de Infraestructura</h1>
                        <p className="text-sm text-muted-foreground">Configure las áreas y los criterios BPM a inspeccionar</p>
                    </div>
                    <div className="flex gap-2">
                        {hasPermission('c_infraestructura') && (
                            <Button onClick={handleCreate}><Plus className="h-4 w-4 mr-2" /> Nueva Área</Button>
                        )}
                        <Button variant="outline" size="sm" onClick={() => setShowFilters(!showFilters)}>
                            <Filter className="h-4 w-4" />
                            {hasActiveFilters && <span className="ml-1 flex h-5 w-5 items-center justify-center rounded-full bg-primary text-xs text-primary-foreground">!</span>}
                        </Button>
                    </div>
                </div>

                {showFilters && (
                    <div className="rounded-lg border bg-muted/50 p-3">
                        <div className="flex justify-between items-center mb-3">
                            <h3 className="font-semibold">Filtros</h3>
                            {hasActiveFilters && (
                                <Button variant="ghost" size="sm" onClick={resetFilters}><X className="h-4 w-4 mr-1" /> Limpiar</Button>
                            )}
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                            <Input
                                placeholder="Buscar por nombre"
                                value={filters.nombre || ''}
                                onChange={(e) => updateFilter('nombre', e.target.value)}
                            />
                            <FilterSelect
                                value={filters.activo}
                                onChange={(v) => updateFilter('activo', v)}
                                placeholder="Todos los estados"
                                options={[
                                    { value: '1', label: 'Activo' },
                                    { value: '0', label: 'Inactivo' },
                                ]}
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
                                    <TableHead>Nombre</TableHead>
                                    <TableHead>Nivel</TableHead>
                                    <TableHead>Extra</TableHead>
                                    <TableHead>Periodicidad (días)</TableHead>
                                    <TableHead>Última Inspección</TableHead>
                                    <TableHead>Estado</TableHead>
                                    <TableHead className="w-[100px]">Acciones</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {infraestructuras.data.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                                            <Building2 className="mx-auto h-12 w-12 mb-3 opacity-50" />
                                            <p>No se encontraron áreas</p>
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    infraestructuras.data.map((infra) => (
                                        <TableRow key={infra.id}>
                                            <TableCell className="font-medium">{infra.nombre}</TableCell>
                                            <TableCell>{infra.nivel || '-'}</TableCell>
                                            <TableCell>{infra.periodicidad_dias}</TableCell>
                                            <TableCell>
                                                {infra.ultima_inspeccion
                                                    ? new Date(infra.ultima_inspeccion).toLocaleDateString()
                                                    : 'Nunca'}
                                                {infra.inspeccion_vencida && (
                                                    <Badge variant="destructive" className="ml-2">Vencida</Badge>
                                                )}
                                            </TableCell>
                                            <TableCell>
                                                <Button variant="ghost" size="sm" disabled>
                                                    {infra.activo ? <Power className="h-4 w-4 text-green-600" /> : <PowerOff className="h-4 w-4 text-red-600" />}
                                                </Button>
                                            </TableCell>
                                            <TableCell>
                                                <DropdownMenu>
                                                    <DropdownMenuTrigger asChild>
                                                        <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                                                            <MoreHorizontal className="h-4 w-4" />
                                                        </Button>
                                                    </DropdownMenuTrigger>
                                                    <DropdownMenuContent align="end">
                                                        {hasPermission('u_infraestructura') && (
                                                            <DropdownMenuItem onClick={() => handleEdit(infra)}>
                                                                <Pencil className="mr-2 h-4 w-4" /> Editar
                                                            </DropdownMenuItem>
                                                        )}
                                                        {hasPermission('d_infraestructura') && (
                                                            <DropdownMenuItem onClick={() => handleDelete(infra.id)} className="text-destructive">
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
                    {infraestructuras.data.length > 0 && (
                        <div className="border-t px-4 py-3">
                            <TablePagination
                                pagination={infraestructuras}
                                onPageChange={(page) => router.get(route('infraestructuras.index'), { ...filters, page }, { preserveState: true, replace: true })}
                            />
                        </div>
                    )}
                </Card>
            </div>

            <Dialog open={modalOpen} onOpenChange={setModalOpen}>
                <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                            <Building2 className="h-5 w-5" />
                            {editing ? 'Editar Área' : 'Nueva Área de Infraestructura'}
                        </DialogTitle>
                        <DialogDescription>
                            Configure el área y los criterios BPM que aplican.
                        </DialogDescription>
                    </DialogHeader>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <FormInput
                                id="infraestructura-nombre"
                                label="Nombre"
                                value={formData.nombre}
                                onChange={(e) => setFormField('nombre', e.target.value)}
                                error={errors.nombre}
                                required
                            />
                            <FormInput
                                id="infraestructura-nivel"
                                label="Nivel"
                                value={formData.nivel}
                                onChange={(e) => setFormField('nivel', e.target.value)}
                                placeholder="Ej. Planta baja"
                            />
                            <FormInput
                                id="infraestructura-periodicidad"
                                label="Periodicidad (días)"
                                type="number"
                                value={formData.periodicidad_dias}
                                onChange={(e) => setFormField('periodicidad_dias', e.target.value)}
                                required
                            />
                            <FormSelect
                                label="Ubicación"
                                value={formData.ubicacion_id}
                                onChange={(v) => setFormField('ubicacion_id', v)}
                                placeholder="Seleccione ubicación"
                                options={(ubicaciones || []).map((ubicacion) => ({
                                    value: ubicacion.id.toString(),
                                    label: ubicacion.nombre,
                                }))}
                                error={errors.ubicacion_id}
                                required
                            />
                        </div>

                        <div className="border rounded-md p-3">
                            <h4 className="font-medium mb-2">Criterios BPM aplicables</h4>
                            <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                                {criteriosDisponibles.map((criterio) => (
                                    <label key={criterio} className="flex items-center space-x-2">
                                        <input
                                            type="checkbox"
                                            checked={(formData as any)[`usa_${criterio}`]}
                                            onChange={(e) => setFormField(`usa_${criterio}`, e.target.checked)}
                                            className="rounded border-gray-300"
                                        />
                                        <span className="text-sm">{criterio.charAt(0).toUpperCase() + criterio.slice(1)}</span>
                                    </label>
                                ))}
                            </div>
                        </div>

                        <div className="flex items-center space-x-2">
                            <input
                                type="checkbox"
                                checked={formData.activo}
                                onChange={(e) => setFormField('activo', e.target.checked)}
                                className="rounded border-gray-300"
                            />
                            <label className="text-sm font-medium">Activo</label>
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