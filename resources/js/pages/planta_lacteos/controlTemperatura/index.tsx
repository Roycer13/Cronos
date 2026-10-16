import { Badge } from '@/components/ui/badge';
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
    Thermometer,
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

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Lugares de Control', href: '/planta-lacteos/lugares-control-temperatura' },
];

interface Lugar {
    id: number;
    nombre: string;
    tipo: string | null;
    alias: string | null;
    estado: boolean;
}

interface PageProps {
    lugares: {
        data: Lugar[];
        links: any[];
        current_page: number;
        last_page: number;
        per_page: number;
        total: number;
    };
    filters: {
        nombre?: string;
        tipo?: string;
        estado?: string;
        per_page?: string;
    };
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
    const [editingLugar, setEditingLugar] = useState<Lugar | null>(null);

    const {
        lugares = {
            data: [],
            links: [],
            current_page: 1,
            last_page: 1,
            per_page: 10,
            total: 0,
        },
        filters: initialFilters = {},
        flash,
    } = props as unknown as PageProps;

    const { filters, updateFilter, resetFilters } = useAdvancedFilters({
        routeName: 'lugares-control-temperatura.index',
        initialFilters: {
            nombre: initialFilters.nombre || undefined,
            tipo: initialFilters.tipo || undefined,
            estado: initialFilters.estado || undefined,
            per_page: initialFilters.per_page?.toString() || '10',
        },
        debounceFields: ['nombre'],
        debounceDelay: 600,
    });

    const {
        data: formData,
        setData: setFormData,
        post,
        put,
        processing,
        errors,
        reset,
    } = useForm({
        nombre: '',
        tipo: '',
        alias: '',
        estado: true,
    });

    const hasActiveFilters = Object.values(filters).some(
        (value) => value && value !== '' && value !== '10',
    );

    const handleCreate = () => {
        setEditingLugar(null);
        reset();
        setFormData({
            nombre: '',
            tipo: '',
            alias: '',
            estado: true,
        });
        setModalOpen(true);
    };

    const handleEdit = (lugar: Lugar) => {
        setEditingLugar(lugar);
        setFormData({
            nombre: lugar.nombre,
            tipo: lugar.tipo || '',
            alias: lugar.alias || '',
            estado: lugar.estado,
        });
        setModalOpen(true);
    };

    const handleDelete = (id: number) => {
        if (confirm('¿Está seguro de eliminar este lugar de control?')) {
            router.delete(route('lugares-control-temperatura.destroy', id), {
                preserveScroll: true,
            });
        }
    };

    const handleToggleEstado = (id: number) => {
        router.put(route('lugares-control-temperatura.toggle-estado', id), {}, {
            preserveScroll: true,
        });
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (editingLugar) {
            put(route('lugares-control-temperatura.update', editingLugar.id), {
                onSuccess: () => {
                    setModalOpen(false);
                    reset();
                },
            });
        } else {
            post(route('lugares-control-temperatura.store'), {
                onSuccess: () => {
                    setModalOpen(false);
                    reset();
                },
            });
        }
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Lugares de Control de Temperatura" />
            <div className="space-y-2 px-2 py-2 sm:px-6">
                <Toast />

                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <h1 className="text-2xl font-bold text-foreground">
                            Lugares de Control de Temperatura
                        </h1>
                        <p className="text-sm text-muted-foreground">
                            Gestione los lugares donde se realizan controles de temperatura
                        </p>
                    </div>

                    <div className="flex items-center gap-2">
                        {hasPermission('c_lugarControlTemperatura') && (
                            <Button onClick={handleCreate} className="flex items-center gap-2">
                                <Plus className="h-4 w-4" />
                                <span>Nuevo Lugar</span>
                            </Button>
                        )}
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setShowFilters(!showFilters)}
                            className="flex items-center gap-2"
                        >
                            <Filter className="h-4 w-4" />
                            <span className="hidden md:block">Filtros</span>
                            {hasActiveFilters && (
                                <span className="flex h-5 w-5 items-center justify-center rounded-full bg-primary text-xs text-primary-foreground">
                                    !
                                </span>
                            )}
                        </Button>
                    </div>
                </div>

                {showFilters && (
                    <div className="rounded-lg border border-border bg-muted/50 p-2">
                        <div className="mb-3 flex items-center justify-between">
                            <h3 className="font-semibold text-foreground">Filtros avanzados</h3>
                            {hasActiveFilters && (
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={resetFilters}
                                    className="text-xs text-muted-foreground hover:text-foreground"
                                >
                                    <X className="mr-1 h-4 w-4" />
                                    Limpiar
                                </Button>
                            )}
                        </div>

                        <div className="grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-4">
                            <div>
                                <label className="mb-1 block text-sm font-medium">Nombre</label>
                                <Input
                                    value={filters.nombre || ''}
                                    onChange={(e) => updateFilter('nombre', e.target.value)}
                                    placeholder="Buscar por nombre..."
                                />
                            </div>

                            <FilterSelect
                                value={filters.tipo}
                                onChange={(v) => updateFilter('tipo', v)}
                                placeholder="Todos los tipos"
                                options={[                                    
                                    { value: 'Almacén', label: 'Almacén' },
                                    { value: 'Cámara de frio ', label: 'Cámara de frio ' }, 
                                ]}
                            />

                            <FilterSelect
                                value={filters.estado}
                                onChange={(v) => updateFilter('estado', v)}
                                placeholder="Todos los estados"
                                options={[
                                    { value: '1', label: 'Activo' },
                                    { value: '0', label: 'Inactivo' },
                                ]}
                            />

                            <FilterSelect
                                value={filters.per_page}
                                onChange={(v) => updateFilter('per_page', v)}
                                placeholder="Resultados por página"
                                options={['10', '25', '50', '100'].map((v) => ({
                                    value: v,
                                    label: `${v} por página`,
                                }))}
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
                                    <TableHead className="w-[50px]">#</TableHead>
                                    <TableHead>Nombre</TableHead>
                                    <TableHead>Tipo</TableHead>
                                    <TableHead>Alias</TableHead>
                                    <TableHead className="w-[100px]">Estado</TableHead>
                                    <TableHead className="w-[100px]">Acciones</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {lugares.data.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={6} className="py-8 text-center text-muted-foreground">
                                            <div className="flex flex-col items-center justify-center">
                                                <Thermometer className="mb-3 h-12 w-12 text-muted-foreground/50" />
                                                <p className="mb-1 text-lg font-medium text-foreground">
                                                    No se encontraron lugares
                                                </p>
                                                <p className="text-muted-foreground">
                                                    {hasActiveFilters
                                                        ? 'Intenta ajustar los filtros para ver más resultados'
                                                        : 'No hay lugares registrados en el sistema'}
                                                </p>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    lugares.data.map((lugar, index) => (
                                        <TableRow key={lugar.id} className="hover:bg-muted/50">
                                            <TableCell className="font-medium">
                                                {((lugares.current_page - 1) * lugares.per_page) + index + 1}
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex items-center gap-2">
                                                    <Building2 className="h-4 w-4 text-muted-foreground" />
                                                    <span className="font-medium">{lugar.nombre}</span>
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                {lugar.tipo ? (
                                                    <Badge variant="outline">{lugar.tipo}</Badge>
                                                ) : (
                                                    <span className="text-muted-foreground">-</span>
                                                )}
                                            </TableCell>
                                            <TableCell>
                                                {lugar.alias || <span className="text-muted-foreground">-</span>}
                                            </TableCell>
                                            <TableCell>
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={() => handleToggleEstado(lugar.id)}
                                                    className={lugar.estado ? 'text-green-600' : 'text-red-600'}
                                                >
                                                    {lugar.estado ? (
                                                        <Power className="h-4 w-4" />
                                                    ) : (
                                                        <PowerOff className="h-4 w-4" />
                                                    )}
                                                </Button>
                                            </TableCell>
                                            <TableCell>
                                                <DropdownMenu>
                                                    <DropdownMenuTrigger asChild>
                                                        <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                                                            <MoreHorizontal className="h-4 w-4" />
                                                        </Button>
                                                    </DropdownMenuTrigger>
                                                    <DropdownMenuContent align="end" className="w-48">
                                                        {hasPermission('u_lugarControlTemperatura') && (
                                                            <DropdownMenuItem onClick={() => handleEdit(lugar)}>
                                                                <Pencil className="mr-2 h-4 w-4" />
                                                                <span>Editar</span>
                                                            </DropdownMenuItem>
                                                        )}
                                                        {hasPermission('d_lugarControlTemperatura') && (
                                                            <DropdownMenuItem
                                                                onClick={() => handleDelete(lugar.id)}
                                                                className="text-destructive focus:text-destructive"
                                                            >
                                                                <Trash2 className="mr-2 h-4 w-4" />
                                                                <span>Eliminar</span>
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

                    {lugares.data.length > 0 && (
                        <div className="border-t px-4 py-3">
                            <TablePagination
                                pagination={lugares}
                                onPageChange={(page) =>
                                    router.get(
                                        route('lugares-control-temperatura.index'),
                                        { ...filters, page },
                                        { preserveState: true, replace: true },
                                    )
                                }
                            />
                        </div>
                    )}
                </Card>

                <div className="flex items-center justify-between">
                    <p className="text-muted-foreground">{lugares.total} lugares registrados</p>
                </div>
            </div>

            <Dialog open={modalOpen} onOpenChange={setModalOpen}>
                <DialogContent className="max-w-md">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                            <Building2 className="h-5 w-5" />
                            {editingLugar ? 'Editar Lugar' : 'Nuevo Lugar de Control'}
                        </DialogTitle>
                        <DialogDescription>
                            {editingLugar
                                ? 'Modifique los datos del lugar de control'
                                : 'Complete los datos para registrar un nuevo lugar de control'}
                        </DialogDescription>
                    </DialogHeader>

                    <form onSubmit={handleSubmit} className="space-y-4">
                        <FormInput
                            id="nombre"
                            label="Nombre"
                            value={formData.nombre}
                            onChange={(e) => setFormData('nombre', e.target.value)}
                            placeholder="Nombre del lugar"
                            error={errors.nombre}
                            required
                        />

                        <FormSelect
                            label="Tipo"
                            value={formData.tipo}
                            onChange={(v) => setFormData('tipo', v)}
                            placeholder="Seleccione tipo"
                            options={[
                                { value: 'congelador', label: 'Congelador' },
                                { value: 'refrigerador', label: 'Refrigerador' },
                                { value: 'almacen', label: 'Almacén' },
                                { value: 'camara', label: 'Cámara' },
                                { value: 'otro', label: 'Otro' },
                            ]}
                            error={errors.tipo}
                        />

                        <FormInput
                            id="alias"
                            label="Alias (Opcional)"
                            value={formData.alias}
                            onChange={(e) => setFormData('alias', e.target.value)}
                            placeholder="Alias o código"
                            error={errors.alias}
                        />

                        <div className="flex items-center space-x-2">
                            <input
                                type="checkbox"
                                id="estado"
                                checked={formData.estado}
                                onChange={(e) => setFormData('estado', e.target.checked)}
                                className="rounded border-gray-300"
                            />
                            <label htmlFor="estado" className="font-medium text-foreground">
                                Activo
                            </label>
                        </div>

                        <DialogFooter>
                            <Button type="button" variant="outline" onClick={() => setModalOpen(false)}>
                                Cancelar
                            </Button>
                            <Button type="submit" disabled={processing}>
                                {processing ? 'Guardando...' : editingLugar ? 'Actualizar' : 'Crear'}
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>
        </AppLayout>
    );
}