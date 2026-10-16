import { useState } from 'react';
import { Head, router, usePage } from '@inertiajs/react';
import { route } from 'ziggy-js';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from '@/components/ui/dialog';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Toast } from '@/components/ui/toast';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Pencil, Trash2, Plus, Filter, X } from 'lucide-react';

const breadcrumbs: BreadcrumbItem[] = [{ title: 'Parámetros de Línea', href: '#' }];

interface PageProps {
    parametros: {
        data: any[];
        links: any[];
        current_page: number;
        last_page: number;
        per_page: number;
        total: number;
    };
    filters: any;
    productos: { id: number; codigo_interno: string; nombre_comercial: string }[];
    etapas: { id: number; nombre: string }[];
    categorias: { id: number; nombre: string }[];
    subcategorias: { id: number; nombre: string; categoria_id: number }[];
    flash: { success?: string; error?: string };
}

export default function Index() {
    const { props } = usePage<PageProps>();
    const { parametros, filters: initialFilters, productos, etapas, categorias, subcategorias, flash } = props;

    // Estado para filtros
    const [filters, setFilters] = useState({
        search: initialFilters.search || '',
        categoria_id: initialFilters.categoria_id || 'all',
        subcategoria_id: initialFilters.subcategoria_id || 'all',
        etapa_id: initialFilters.etapa_id || 'all',
        temperatura_min: initialFilters.temperatura_min || '',
        temperatura_max: initialFilters.temperatura_max || '',
        ph_min: initialFilters.ph_min || '',
        ph_max: initialFilters.ph_max || '',
        acidez_min: initialFilters.acidez_min || '',
        acidez_max: initialFilters.acidez_max || '',
        brix_min: initialFilters.brix_min || '',
        brix_max: initialFilters.brix_max || '',
        viscosidad_min: initialFilters.viscosidad_min || '',
        viscosidad_max: initialFilters.viscosidad_max || '',
        densidad_min: initialFilters.densidad_min || '',
        densidad_max: initialFilters.densidad_max || '',
        per_page: initialFilters.per_page || '15',
    });

    // Estado de diálogos
    const [dialogCreateOpen, setDialogCreateOpen] = useState(false);
    const [dialogEditOpen, setDialogEditOpen] = useState(false);
    const [dialogMassiveOpen, setDialogMassiveOpen] = useState(false);
    const [editingParam, setEditingParam] = useState<any>(null);

    // Estado del formulario de creación/edición
    const [formData, setFormData] = useState({
        producto_terminado_id: '',
        etapa_id: '',
        temperatura_min: '',
        temperatura_max: '',
        ph_min: '',
        ph_max: '',
        acidez_min: '',
        acidez_max: '',
        brix_min: '',
        brix_max: '',
        viscosidad_min: '',
        viscosidad_max: '',
        densidad_min: '',
        densidad_max: '',
    });

    // Estado para asignación masiva
    const [massiveData, setMassiveData] = useState({
        categoria_id: 'all',      // <-- CAMBIADO: 'all' en lugar de ''
        subcategoria_id: 'all',   // <-- CAMBIADO: 'all' en lugar de ''
        etapa_id: '',
        temperatura_min: '',
        temperatura_max: '',
        ph_min: '',
        ph_max: '',
        acidez_min: '',
        acidez_max: '',
        brix_min: '',
        brix_max: '',
        viscosidad_min: '',
        viscosidad_max: '',
        densidad_min: '',
        densidad_max: '',
    });

    // Manejar cambios en filtros
    const handleFilterChange = (key: string, value: any) => {
        setFilters(prev => ({ ...prev, [key]: value }));
    };

    const applyFilters = () => {
        router.get(route('parametros-linea.index'), filters, { preserveState: true });
    };

    const resetFilters = () => {
        const reset = {
            search: '',
            categoria_id: 'all',
            subcategoria_id: 'all',
            etapa_id: 'all',
            temperatura_min: '',
            temperatura_max: '',
            ph_min: '',
            ph_max: '',
            acidez_min: '',
            acidez_max: '',
            brix_min: '',
            brix_max: '',
            viscosidad_min: '',
            viscosidad_max: '',
            densidad_min: '',
            densidad_max: '',
            per_page: '15',
        };
        setFilters(reset);
        router.get(route('parametros-linea.index'), reset, { preserveState: true });
    };

    // Abrir diálogo de edición
    const openEditDialog = (param: any) => {
        setEditingParam(param);
        setFormData({
            producto_terminado_id: String(param.producto_terminado_id),
            etapa_id: String(param.etapa_id),
            temperatura_min: param.temperatura_min || '',
            temperatura_max: param.temperatura_max || '',
            ph_min: param.ph_min || '',
            ph_max: param.ph_max || '',
            acidez_min: param.acidez_min || '',
            acidez_max: param.acidez_max || '',
            brix_min: param.brix_min || '',
            brix_max: param.brix_max || '',
            viscosidad_min: param.viscosidad_min || '',
            viscosidad_max: param.viscosidad_max || '',
            densidad_min: param.densidad_min || '',
            densidad_max: param.densidad_max || '',
        });
        setDialogEditOpen(true);
    };

    // Guardar creación
    const handleCreate = () => {
        router.post(route('parametros-linea.store'), formData, {
            onSuccess: () => {
                setDialogCreateOpen(false);
                setFormData({
                    producto_terminado_id: '',
                    etapa_id: '',
                    temperatura_min: '',
                    temperatura_max: '',
                    ph_min: '',
                    ph_max: '',
                    acidez_min: '',
                    acidez_max: '',
                    brix_min: '',
                    brix_max: '',
                    viscosidad_min: '',
                    viscosidad_max: '',
                    densidad_min: '',
                    densidad_max: '',
                });
            },
        });
    };

    // Guardar edición
    const handleUpdate = () => {
        router.put(route('parametros-linea.update', editingParam.id), formData, {
            onSuccess: () => {
                setDialogEditOpen(false);
                setEditingParam(null);
            },
        });
    };

    // Eliminar
    const handleDelete = (id: number) => {
        if (confirm('¿Seguro que deseas eliminar este parámetro?')) {
            router.delete(route('parametros-linea.destroy', id));
        }
    };

    // Asignación masiva - CONVIERTE 'all' a null para el backend
    const handleMassiveSave = () => {
        const payload = {
            ...massiveData,
            categoria_id: massiveData.categoria_id === 'all' ? null : massiveData.categoria_id,
            subcategoria_id: massiveData.subcategoria_id === 'all' ? null : massiveData.subcategoria_id,
        };
        router.post(route('parametros-linea.masivo'), payload, {
            onSuccess: () => {
                setDialogMassiveOpen(false);
            },
        });
    };

    // Eliminar masivo - CONVIERTE 'all' a null para el backend
    const handleMassiveDelete = () => {
        if (confirm('¿Seguro que deseas eliminar todos los parámetros de esta etapa para los productos seleccionados?')) {
            const payload = {
                categoria_id: massiveData.categoria_id === 'all' ? null : massiveData.categoria_id,
                subcategoria_id: massiveData.subcategoria_id === 'all' ? null : massiveData.subcategoria_id,
                etapa_id: massiveData.etapa_id,
            };
            router.delete(route('parametros-linea.eliminar-masivo'), {
                data: payload,
            });
        }
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Parámetros de Línea" />
            <div className="space-y-4 px-2 py-2 sm:px-6">
                <Toast />

                <div className="flex flex-wrap items-center justify-between gap-4">
                    <div className="flex flex-wrap items-center gap-2">
                        <Input
                            placeholder="Buscar producto..."
                            value={filters.search}
                            onChange={(e) => handleFilterChange('search', e.target.value)}
                            className="w-56"
                        />
                        <Select
                            value={filters.categoria_id}
                            onValueChange={(v) => handleFilterChange('categoria_id', v)}
                        >
                            <SelectTrigger className="w-40">
                                <SelectValue placeholder="Categoría" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">Todas</SelectItem>
                                {categorias.map((c) => (
                                    <SelectItem key={c.id} value={String(c.id)}>
                                        {c.nombre}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        <Select
                            value={filters.subcategoria_id}
                            onValueChange={(v) => handleFilterChange('subcategoria_id', v)}
                        >
                            <SelectTrigger className="w-40">
                                <SelectValue placeholder="Subcategoría" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">Todas</SelectItem>
                                {subcategorias.map((s) => (
                                    <SelectItem key={s.id} value={String(s.id)}>
                                        {s.nombre}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        <Select
                            value={filters.etapa_id}
                            onValueChange={(v) => handleFilterChange('etapa_id', v)}
                        >
                            <SelectTrigger className="w-40">
                                <SelectValue placeholder="Etapa" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">Todas</SelectItem>
                                {etapas.map((e) => (
                                    <SelectItem key={e.id} value={String(e.id)}>
                                        {e.nombre}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        <Button variant="outline" size="sm" onClick={applyFilters}>
                            <Filter className="mr-1 h-4 w-4" />
                            Filtrar
                        </Button>
                        <Button variant="ghost" size="sm" onClick={resetFilters}>
                            <X className="mr-1 h-4 w-4" />
                            Limpiar
                        </Button>
                    </div>
                    <div className="flex gap-2">
                        <Button size="sm" onClick={() => setDialogMassiveOpen(true)}>
                            Asignación Masiva
                        </Button>
                        <Button size="sm" onClick={() => setDialogCreateOpen(true)}>
                            <Plus className="mr-1 h-4 w-4" />
                            Nuevo
                        </Button>
                    </div>
                </div>

                {/* Tabla */}
                <div className="overflow-x-auto rounded-lg border bg-background shadow-sm">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Producto</TableHead>
                                <TableHead>Categoría</TableHead>
                                <TableHead>Subcategoría</TableHead>
                                <TableHead>Etapa</TableHead>
                                <TableHead>Temperatura</TableHead>
                                <TableHead>pH</TableHead>
                                <TableHead>Acidez</TableHead>
                                <TableHead>Brix</TableHead>
                                <TableHead>Viscosidad</TableHead>
                                <TableHead>Densidad</TableHead>
                                <TableHead className="text-right">Acciones</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {parametros.data.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={11} className="py-8 text-center text-muted-foreground">
                                        No hay parámetros registrados.
                                    </TableCell>
                                </TableRow>
                            ) : (
                                parametros.data.map((p) => (
                                    <TableRow key={p.id}>
                                        <TableCell className="font-medium">
                                            {p.producto_terminado?.codigo_interno} - {p.producto_terminado?.nombre_comercial}
                                        </TableCell>
                                        <TableCell>{p.producto_terminado?.categoria_producto?.nombre}</TableCell>
                                        <TableCell>{p.producto_terminado?.subcategoria_producto?.nombre}</TableCell>
                                        <TableCell>{p.etapa?.nombre}</TableCell>
                                        <TableCell>
                                            {p.temperatura_min} - {p.temperatura_max}
                                        </TableCell>
                                        <TableCell>
                                            {p.ph_min} - {p.ph_max}
                                        </TableCell>
                                        <TableCell>
                                            {p.acidez_min} - {p.acidez_max}
                                        </TableCell>
                                        <TableCell>
                                            {p.brix_min} - {p.brix_max}
                                        </TableCell>
                                        <TableCell>
                                            {p.viscosidad_min} - {p.viscosidad_max}
                                        </TableCell>
                                        <TableCell>
                                            {p.densidad_min} - {p.densidad_max}
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <div className="flex justify-end gap-2">
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={() => openEditDialog(p)}
                                                >
                                                    <Pencil className="h-4 w-4" />
                                                </Button>
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={() => handleDelete(p.id)}
                                                >
                                                    <Trash2 className="h-4 w-4 text-red-500" />
                                                </Button>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </div>

                {/* Paginación */}
                <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">
                        Mostrando {parametros.data.length} de {parametros.total} registros
                    </span>
                    <div className="flex gap-2">
                        {parametros.links?.map((link: any, i: number) => (
                            <Button
                                key={i}
                                variant={link.active ? 'default' : 'outline'}
                                size="sm"
                                disabled={!link.url}
                                onClick={() => link.url && router.get(link.url)}
                            >
                                <span dangerouslySetInnerHTML={{ __html: link.label }} />
                            </Button>
                        ))}
                    </div>
                </div>
            </div>

            {/* Diálogo Crear */}
            <Dialog open={dialogCreateOpen} onOpenChange={setDialogCreateOpen}>
                <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle>Nuevo Parámetro de Línea</DialogTitle>
                    </DialogHeader>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <Label>Producto *</Label>
                            <Select
                                value={formData.producto_terminado_id}
                                onValueChange={(v) => setFormData({ ...formData, producto_terminado_id: v })}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Seleccionar" />
                                </SelectTrigger>
                                <SelectContent>
                                    {productos.map((p) => (
                                        <SelectItem key={p.id} value={String(p.id)}>
                                            {p.codigo_interno} - {p.nombre_comercial}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        <div>
                            <Label>Etapa *</Label>
                            <Select
                                value={formData.etapa_id}
                                onValueChange={(v) => setFormData({ ...formData, etapa_id: v })}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Seleccionar" />
                                </SelectTrigger>
                                <SelectContent>
                                    {etapas.map((e) => (
                                        <SelectItem key={e.id} value={String(e.id)}>
                                            {e.nombre}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        {/* Rangos */}
                        <div>
                            <Label>Temperatura Min</Label>
                            <Input
                                type="number"
                                step="any"
                                value={formData.temperatura_min}
                                onChange={(e) => setFormData({ ...formData, temperatura_min: e.target.value })}
                            />
                        </div>
                        <div>
                            <Label>Temperatura Max</Label>
                            <Input
                                type="number"
                                step="any"
                                value={formData.temperatura_max}
                                onChange={(e) => setFormData({ ...formData, temperatura_max: e.target.value })}
                            />
                        </div>
                        <div>
                            <Label>pH Min</Label>
                            <Input
                                type="number"
                                step="any"
                                value={formData.ph_min}
                                onChange={(e) => setFormData({ ...formData, ph_min: e.target.value })}
                            />
                        </div>
                        <div>
                            <Label>pH Max</Label>
                            <Input
                                type="number"
                                step="any"
                                value={formData.ph_max}
                                onChange={(e) => setFormData({ ...formData, ph_max: e.target.value })}
                            />
                        </div>
                        <div>
                            <Label>Acidez Min</Label>
                            <Input
                                type="number"
                                step="any"
                                value={formData.acidez_min}
                                onChange={(e) => setFormData({ ...formData, acidez_min: e.target.value })}
                            />
                        </div>
                        <div>
                            <Label>Acidez Max</Label>
                            <Input
                                type="number"
                                step="any"
                                value={formData.acidez_max}
                                onChange={(e) => setFormData({ ...formData, acidez_max: e.target.value })}
                            />
                        </div>
                        <div>
                            <Label>Brix Min</Label>
                            <Input
                                type="number"
                                step="any"
                                value={formData.brix_min}
                                onChange={(e) => setFormData({ ...formData, brix_min: e.target.value })}
                            />
                        </div>
                        <div>
                            <Label>Brix Max</Label>
                            <Input
                                type="number"
                                step="any"
                                value={formData.brix_max}
                                onChange={(e) => setFormData({ ...formData, brix_max: e.target.value })}
                            />
                        </div>
                        <div>
                            <Label>Viscosidad Min</Label>
                            <Input
                                type="number"
                                step="any"
                                value={formData.viscosidad_min}
                                onChange={(e) => setFormData({ ...formData, viscosidad_min: e.target.value })}
                            />
                        </div>
                        <div>
                            <Label>Viscosidad Max</Label>
                            <Input
                                type="number"
                                step="any"
                                value={formData.viscosidad_max}
                                onChange={(e) => setFormData({ ...formData, viscosidad_max: e.target.value })}
                            />
                        </div>
                        <div>
                            <Label>Densidad Min</Label>
                            <Input
                                type="number"
                                step="any"
                                value={formData.densidad_min}
                                onChange={(e) => setFormData({ ...formData, densidad_min: e.target.value })}
                            />
                        </div>
                        <div>
                            <Label>Densidad Max</Label>
                            <Input
                                type="number"
                                step="any"
                                value={formData.densidad_max}
                                onChange={(e) => setFormData({ ...formData, densidad_max: e.target.value })}
                            />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setDialogCreateOpen(false)}>
                            Cancelar
                        </Button>
                        <Button onClick={handleCreate}>Guardar</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Diálogo Editar */}
            <Dialog open={dialogEditOpen} onOpenChange={setDialogEditOpen}>
                <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle>Editar Parámetro</DialogTitle>
                    </DialogHeader>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <Label>Producto *</Label>
                            <Select
                                value={formData.producto_terminado_id}
                                onValueChange={(v) => setFormData({ ...formData, producto_terminado_id: v })}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Seleccionar" />
                                </SelectTrigger>
                                <SelectContent>
                                    {productos.map((p) => (
                                        <SelectItem key={p.id} value={String(p.id)}>
                                            {p.codigo_interno} - {p.nombre_comercial}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        <div>
                            <Label>Etapa *</Label>
                            <Select
                                value={formData.etapa_id}
                                onValueChange={(v) => setFormData({ ...formData, etapa_id: v })}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Seleccionar" />
                                </SelectTrigger>
                                <SelectContent>
                                    {etapas.map((e) => (
                                        <SelectItem key={e.id} value={String(e.id)}>
                                            {e.nombre}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        {/* Rangos */}
                        <div>
                            <Label>Temperatura Min</Label>
                            <Input
                                type="number"
                                step="any"
                                value={formData.temperatura_min}
                                onChange={(e) => setFormData({ ...formData, temperatura_min: e.target.value })}
                            />
                        </div>
                        <div>
                            <Label>Temperatura Max</Label>
                            <Input
                                type="number"
                                step="any"
                                value={formData.temperatura_max}
                                onChange={(e) => setFormData({ ...formData, temperatura_max: e.target.value })}
                            />
                        </div>
                        <div>
                            <Label>pH Min</Label>
                            <Input
                                type="number"
                                step="any"
                                value={formData.ph_min}
                                onChange={(e) => setFormData({ ...formData, ph_min: e.target.value })}
                            />
                        </div>
                        <div>
                            <Label>pH Max</Label>
                            <Input
                                type="number"
                                step="any"
                                value={formData.ph_max}
                                onChange={(e) => setFormData({ ...formData, ph_max: e.target.value })}
                            />
                        </div>
                        <div>
                            <Label>Acidez Min</Label>
                            <Input
                                type="number"
                                step="any"
                                value={formData.acidez_min}
                                onChange={(e) => setFormData({ ...formData, acidez_min: e.target.value })}
                            />
                        </div>
                        <div>
                            <Label>Acidez Max</Label>
                            <Input
                                type="number"
                                step="any"
                                value={formData.acidez_max}
                                onChange={(e) => setFormData({ ...formData, acidez_max: e.target.value })}
                            />
                        </div>
                        <div>
                            <Label>Brix Min</Label>
                            <Input
                                type="number"
                                step="any"
                                value={formData.brix_min}
                                onChange={(e) => setFormData({ ...formData, brix_min: e.target.value })}
                            />
                        </div>
                        <div>
                            <Label>Brix Max</Label>
                            <Input
                                type="number"
                                step="any"
                                value={formData.brix_max}
                                onChange={(e) => setFormData({ ...formData, brix_max: e.target.value })}
                            />
                        </div>
                        <div>
                            <Label>Viscosidad Min</Label>
                            <Input
                                type="number"
                                step="any"
                                value={formData.viscosidad_min}
                                onChange={(e) => setFormData({ ...formData, viscosidad_min: e.target.value })}
                            />
                        </div>
                        <div>
                            <Label>Viscosidad Max</Label>
                            <Input
                                type="number"
                                step="any"
                                value={formData.viscosidad_max}
                                onChange={(e) => setFormData({ ...formData, viscosidad_max: e.target.value })}
                            />
                        </div>
                        <div>
                            <Label>Densidad Min</Label>
                            <Input
                                type="number"
                                step="any"
                                value={formData.densidad_min}
                                onChange={(e) => setFormData({ ...formData, densidad_min: e.target.value })}
                            />
                        </div>
                        <div>
                            <Label>Densidad Max</Label>
                            <Input
                                type="number"
                                step="any"
                                value={formData.densidad_max}
                                onChange={(e) => setFormData({ ...formData, densidad_max: e.target.value })}
                            />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setDialogEditOpen(false)}>
                            Cancelar
                        </Button>
                        <Button onClick={handleUpdate}>Actualizar</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Diálogo Asignación Masiva */}
            <Dialog open={dialogMassiveOpen} onOpenChange={setDialogMassiveOpen}>
                <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle>Asignación Masiva de Parámetros</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <Label>Categoría</Label>
                                <Select
                                    value={massiveData.categoria_id}
                                    onValueChange={(v) => {
                                        setMassiveData({ ...massiveData, categoria_id: v, subcategoria_id: 'all' });
                                    }}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Todas" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">Todas</SelectItem>
                                        {categorias.map((c) => (
                                            <SelectItem key={c.id} value={String(c.id)}>
                                                {c.nombre}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                            <div>
                                <Label>Subcategoría</Label>
                                <Select
                                    value={massiveData.subcategoria_id}
                                    onValueChange={(v) => setMassiveData({ ...massiveData, subcategoria_id: v })}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Todas" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">Todas</SelectItem>
                                        {subcategorias
                                            .filter((s) => massiveData.categoria_id === 'all' || s.categoria_id === Number(massiveData.categoria_id))
                                            .map((s) => (
                                                <SelectItem key={s.id} value={String(s.id)}>
                                                    {s.nombre}
                                                </SelectItem>
                                            ))}
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="col-span-2">
                                <Label>Etapa *</Label>
                                <Select
                                    value={massiveData.etapa_id}
                                    onValueChange={(v) => setMassiveData({ ...massiveData, etapa_id: v })}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Seleccionar" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {etapas.map((e) => (
                                            <SelectItem key={e.id} value={String(e.id)}>
                                                {e.nombre}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            {/* Rangos */}
                            <div>
                                <Label>Temperatura Min</Label>
                                <Input
                                    type="number"
                                    step="any"
                                    value={massiveData.temperatura_min}
                                    onChange={(e) => setMassiveData({ ...massiveData, temperatura_min: e.target.value })}
                                />
                            </div>
                            <div>
                                <Label>Temperatura Max</Label>
                                <Input
                                    type="number"
                                    step="any"
                                    value={massiveData.temperatura_max}
                                    onChange={(e) => setMassiveData({ ...massiveData, temperatura_max: e.target.value })}
                                />
                            </div>
                            <div>
                                <Label>pH Min</Label>
                                <Input
                                    type="number"
                                    step="any"
                                    value={massiveData.ph_min}
                                    onChange={(e) => setMassiveData({ ...massiveData, ph_min: e.target.value })}
                                />
                            </div>
                            <div>
                                <Label>pH Max</Label>
                                <Input
                                    type="number"
                                    step="any"
                                    value={massiveData.ph_max}
                                    onChange={(e) => setMassiveData({ ...massiveData, ph_max: e.target.value })}
                                />
                            </div>
                            <div>
                                <Label>Acidez Min</Label>
                                <Input
                                    type="number"
                                    step="any"
                                    value={massiveData.acidez_min}
                                    onChange={(e) => setMassiveData({ ...massiveData, acidez_min: e.target.value })}
                                />
                            </div>
                            <div>
                                <Label>Acidez Max</Label>
                                <Input
                                    type="number"
                                    step="any"
                                    value={massiveData.acidez_max}
                                    onChange={(e) => setMassiveData({ ...massiveData, acidez_max: e.target.value })}
                                />
                            </div>
                            <div>
                                <Label>Brix Min</Label>
                                <Input
                                    type="number"
                                    step="any"
                                    value={massiveData.brix_min}
                                    onChange={(e) => setMassiveData({ ...massiveData, brix_min: e.target.value })}
                                />
                            </div>
                            <div>
                                <Label>Brix Max</Label>
                                <Input
                                    type="number"
                                    step="any"
                                    value={massiveData.brix_max}
                                    onChange={(e) => setMassiveData({ ...massiveData, brix_max: e.target.value })}
                                />
                            </div>
                            <div>
                                <Label>Viscosidad Min</Label>
                                <Input
                                    type="number"
                                    step="any"
                                    value={massiveData.viscosidad_min}
                                    onChange={(e) => setMassiveData({ ...massiveData, viscosidad_min: e.target.value })}
                                />
                            </div>
                            <div>
                                <Label>Viscosidad Max</Label>
                                <Input
                                    type="number"
                                    step="any"
                                    value={massiveData.viscosidad_max}
                                    onChange={(e) => setMassiveData({ ...massiveData, viscosidad_max: e.target.value })}
                                />
                            </div>
                            <div>
                                <Label>Densidad Min</Label>
                                <Input
                                    type="number"
                                    step="any"
                                    value={massiveData.densidad_min}
                                    onChange={(e) => setMassiveData({ ...massiveData, densidad_min: e.target.value })}
                                />
                            </div>
                            <div>
                                <Label>Densidad Max</Label>
                                <Input
                                    type="number"
                                    step="any"
                                    value={massiveData.densidad_max}
                                    onChange={(e) => setMassiveData({ ...massiveData, densidad_max: e.target.value })}
                                />
                            </div>
                        </div>
                    </div>
                    <DialogFooter className="flex justify-between">
                        {/* <Button variant="destructive" onClick={handleMassiveDelete}>
                            Eliminar parámetros de esta etapa
                        </Button> */}
                        <div className="flex gap-2">
                            <Button variant="outline" onClick={() => setDialogMassiveOpen(false)}>
                                Cancelar
                            </Button>
                            <Button onClick={handleMassiveSave}>Guardar en todos</Button>
                        </div>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </AppLayout>
    );
}
