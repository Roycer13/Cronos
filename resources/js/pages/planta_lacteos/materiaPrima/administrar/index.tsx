import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import TablePagination from '@/components/ui/table-pagination';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import { useAuth } from '@/hooks/useAuth';
import AppLayout from '@/layouts/app-layout';
import { Head, Link, router, useForm, usePage } from '@inertiajs/react';
import {
    Edit,
    ListTree,
    Package,
    Trash2,
    Truck,
    Warehouse,
    Search,
    X,
} from 'lucide-react';
import { useState, useEffect } from 'react';

export default function AdminMateriaPrima() {
    const { props } = usePage();
    const {
        categorias = {
            data: [],
            links: [],
            total: 0,
            per_page: 10,
            current_page: 1,
        },
        almacenes = {
            data: [],
            links: [],
            total: 0,
            per_page: 10,
            current_page: 1,
        },
        items = {
            data: [],
            links: [],
            total: 0,
            per_page: 10,
            current_page: 1,
        },
        proveedores = {
            data: [],
            links: [],
            total: 0,
            per_page: 10,
            current_page: 1,
        },
        todasCategorias = [],
        unidades = [],
        filters = {},
        flash,
    } = props;

    const [activeTab, setActiveTab] = useState('categorias');
    const [editingId, setEditingId] = useState(null);
    const [isCreating, setIsCreating] = useState(false);

    // Estados para los filtros de búsqueda
    const [searchValues, setSearchValues] = useState({
        categorias: filters.search_categorias || '',
        almacenes: filters.search_almacenes || '',
        items: filters.search_items || '',
        proveedores: filters.search_proveedores || ''
    });

    // Formularios
    const categoriaForm = useForm({
        nombre: '',
        descripcion: '',
    });

    const almacenForm = useForm({
        nombre: '',
    });

    const itemForm = useForm({
        codigo: '',
        nombre: '',
        descripcion: '',
        categoria_materia_prima_id: '',
        unidad_id: '',
        unidad2_id: '',
        nivel_inspeccion: '',
        nca_max: '',
        nca_min: '',
        Nivel_dilucion: '',
        temp_max: '',
        temp_min: '',
        ph_max: '',
        ph_min: '',
        solidos_max: '',
        solidos_min: '',
        acidez_max: '',
        acidez_min: '',
        densidad_max: '',
        densidad_min: '',
        viscosidad_max: '',
        viscosidad_min: '',
        organoleptica: '',
    });

    const proveedorForm = useForm({
        nombre: '',
        descripcion: '',
    });

    // Función para manejar búsquedas
    const handleSearch = (tab) => {
        router.get(
            route('admin.materia-prima.index'),
            {
                page: 1, // Resetear a la primera página
                tab: tab,
                [`search_${tab}`]: searchValues[tab] || null,
            },
            {
                preserveState: true,
                replace: true,
            }
        );
    };

    // Función para limpiar filtro
    const handleClearSearch = (tab) => {
        setSearchValues(prev => ({
            ...prev,
            [tab]: ''
        }));

        router.get(
            route('admin.materia-prima.index'),
            {
                tab: tab,
                [`search_${tab}`]: null,
            },
            {
                preserveState: true,
                replace: true,
            }
        );
    };

    // Función para cambio de tabs
    const handleTabChange = (tab) => {
        setActiveTab(tab);
        setIsCreating(false);
        setEditingId(null);

        router.get(
            route('admin.materia-prima.index'),
            {
                tab: tab,
                // Mantener los filtros específicos de cada tab
                ...(tab === 'categorias' && { search_categorias: searchValues.categorias }),
                ...(tab === 'almacenes' && { search_almacenes: searchValues.almacenes }),
                ...(tab === 'items' && { search_items: searchValues.items }),
                ...(tab === 'proveedores' && { search_proveedores: searchValues.proveedores }),
            },
            {
                preserveState: true,
                replace: true,
            }
        );
    };

    // Funciones para Categorías
    const handleCategoriaSubmit = (e) => {
        e.preventDefault();
        if (editingId) {
            categoriaForm.put(route('admin.categorias.update', editingId), {
                onSuccess: () => {
                    setEditingId(null);
                    setIsCreating(false);
                    categoriaForm.reset();
                    window.location.reload();
                },
            });
        } else {
            categoriaForm.post(route('admin.categorias.store'), {
                onSuccess: () => {
                    setIsCreating(false);
                    categoriaForm.reset();
                    window.location.reload();
                },
            });
        }
    };

    const handleEditCategoria = (categoria) => {
        setEditingId(categoria.id);
        setActiveTab('categorias');
        categoriaForm.setData({
            nombre: categoria.nombre,
            descripcion: categoria.descripcion,
        });
        setIsCreating(true);
    };

    const handleDeleteCategoria = (id) => {
        if (confirm('¿Estás seguro de eliminar esta categoría?')) {
            Link.delete(route('admin.categorias.destroy', id), {
                onSuccess: () => window.location.reload(),
            });
        }
    };

    // Funciones para Almacenes
    const handleAlmacenSubmit = (e) => {
        e.preventDefault();
        if (editingId) {
            almacenForm.put(route('admin.almacenes.update', editingId), {
                onSuccess: () => {
                    setEditingId(null);
                    setIsCreating(false);
                    almacenForm.reset();
                    window.location.reload();
                },
            });
        } else {
            almacenForm.post(route('admin.almacenes.store'), {
                onSuccess: () => {
                    setIsCreating(false);
                    almacenForm.reset();
                    window.location.reload();
                },
            });
        }
    };

    const handleEditAlmacen = (almacen) => {
        setEditingId(almacen.id);
        setActiveTab('almacenes');
        almacenForm.setData({
            nombre: almacen.nombre,
        });
        setIsCreating(true);
    };

    const handleDeleteAlmacen = (id) => {
        if (confirm('¿Estás seguro de eliminar este almacén?')) {
            Link.delete(route('admin.almacenes.destroy', id), {
                onSuccess: () => window.location.reload(),
            });
        }
    };

    // Funciones para Items
    const handleItemSubmit = (e) => {
        e.preventDefault();
        if (editingId) {
            itemForm.put(route('admin.items.update', editingId), {
                onSuccess: () => {
                    setEditingId(null);
                    setIsCreating(false);
                    itemForm.reset();
                    window.location.reload();
                },
            });
        } else {
            itemForm.post(route('admin.items.store'), {
                onSuccess: () => {
                    setIsCreating(false);
                    itemForm.reset();
                    window.location.reload();
                },
            });
        }
    };

    const {
        hasPermission,
        belongsToUbicacion,
        canDo,
        isAdmin,
        user: authUser,
    } = useAuth();
    const handleEditItem = (item) => {
        setEditingId(item.id);
        setActiveTab('items');
        itemForm.setData({
            codigo: item.codigo,
            nombre: item.nombre,
            descripcion: item.descripcion,
            categoria_materia_prima_id: item.categoria_materia_prima_id,
            unidad_id: item.unidad_id,
            unidad2_id: item.unidad2_id,
            nivel_inspeccion: item.nivel_inspeccion,
            nca_max: item.nca_max,
            nca_min: item.nca_min,
            Nivel_dilucion: item.Nivel_dilucion,
            temp_max: item.temp_max,
            temp_min: item.temp_min,
            ph_max: item.ph_max,
            ph_min: item.ph_min,
            solidos_max: item.solidos_max,
            solidos_min: item.solidos_min,
            acidez_max: item.acidez_max,
            acidez_min: item.acidez_min,
            densidad_max: item.densidad_max,
            densidad_min: item.densidad_min,
            viscosidad_max: item.viscosidad_max,
            viscosidad_min: item.viscosidad_min,
            organoleptica: item.organoleptica,
        });
        setIsCreating(true);
    };

    const handleDeleteItem = (id) => {
        if (confirm('¿Estás seguro de eliminar este item?')) {
            Link.delete(route('admin.items.destroy', id), {
                onSuccess: () => window.location.reload(),
            });
        }
    };

    // Funciones para Proveedores
    const handleProveedorSubmit = (e) => {
        e.preventDefault();
        if (editingId) {
            proveedorForm.put(route('admin.proveedores.update', editingId), {
                onSuccess: () => {
                    setEditingId(null);
                    setIsCreating(false);
                    proveedorForm.reset();
                    window.location.reload();
                },
            });
        } else {
            proveedorForm.post(route('admin.proveedores.store'), {
                onSuccess: () => {
                    setIsCreating(false);
                    proveedorForm.reset();
                    window.location.reload();
                },
            });
        }
    };

    const handleEditProveedor = (proveedor) => {
        setEditingId(proveedor.id);
        setActiveTab('proveedores');
        proveedorForm.setData({
            nombre: proveedor.nombre,
            descripcion: proveedor.descripcion,
        });
        setIsCreating(true);
    };

    const handleDeleteProveedor = (id) => {
        if (confirm('¿Estás seguro de eliminar este proveedor?')) {
            Link.delete(route('admin.proveedores.destroy', id), {
                onSuccess: () => window.location.reload(),
            });
        }
    };

    // Cancelar edición/creación
    const handleCancel = () => {
        setEditingId(null);
        setIsCreating(false);
        categoriaForm.reset();
        almacenForm.reset();
        itemForm.reset();
        proveedorForm.reset();
    };

    // Función para cambiar de página
    const handlePageChange = (page, tab) => {
        router.get(
            route('admin.materia-prima.index'),
            {
                page,
                tab: tab || activeTab,
                [`search_${tab || activeTab}`]: searchValues[tab || activeTab] || null,
            },
            {
                preserveState: true,
                replace: true,
            },
        );
    };

    // Efecto para sincronizar filtros del servidor
    useEffect(() => {
        setSearchValues({
            categorias: filters.search_categorias || '',
            almacenes: filters.search_almacenes || '',
            items: filters.search_items || '',
            proveedores: filters.search_proveedores || ''
        });
    }, [filters]);

    const breadcrumbs = [
        { title: 'Administración de Materia Prima', href: '#' },
    ];

    const getIconForTab = (tab) => {
        switch (tab) {
            case 'categorias':
                return <ListTree className="mr-2 h-4 w-4" />;
            case 'almacenes':
                return <Warehouse className="mr-2 h-4 w-4" />;
            case 'items':
                return <Package className="mr-2 h-4 w-4" />;
            case 'proveedores':
                return <Truck className="mr-2 h-4 w-4" />;
            default:
                return null;
        }
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Administración de Materia Prima" />

            <div className="space-y-2 px-2 py-2 sm:px-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div>

                    </div>
                </div>

                {/* Tabs principales */}
                <Tabs value={activeTab} onValueChange={handleTabChange}>
                    <TabsList className="grid w-full grid-cols-4">
                        <TabsTrigger
                            value="categorias"
                            className="flex items-center"
                        >
                            <ListTree className="mr-2 h-4 w-4" />
                            Categorías
                            <Badge variant="secondary" className="ml-2">
                                {categorias.total || 0}
                            </Badge>
                        </TabsTrigger>
                        <TabsTrigger
                            value="almacenes"
                            className="flex items-center"
                        >
                            <Warehouse className="mr-2 h-4 w-4" />
                            Almacenes
                            <Badge variant="secondary" className="ml-2">
                                {almacenes.total || 0}
                            </Badge>
                        </TabsTrigger>
                        <TabsTrigger
                            value="items"
                            className="flex items-center"
                        >
                            <Package className="mr-2 h-4 w-4" />
                            Items
                            <Badge variant="secondary" className="ml-2">
                                {items.total || 0}
                            </Badge>
                        </TabsTrigger>
                        <TabsTrigger
                            value="proveedores"
                            className="flex items-center"
                        >
                            <Truck className="mr-2 h-4 w-4" />
                            Proveedores
                            <Badge variant="secondary" className="ml-2">
                                {proveedores.total || 0}
                            </Badge>
                        </TabsTrigger>
                    </TabsList>

                    {/* Botón de crear para la tab activa */}
                    {!isCreating && hasPermission('c_materiaPrima') && (
                        <div className="mt-4 flex justify-end">
                            <Button onClick={() => setIsCreating(true)}>
                                {getIconForTab(activeTab)}
                                Crear nuevo
                            </Button>
                        </div>
                    )}

                    {/* Formulario de creación/edición */}
                    {isCreating && (
                        <Card className="mt-4">
                            <CardHeader>
                                <CardTitle>
                                    {editingId ? 'Editar' : 'Crear nuevo'}{' '}
                                    {activeTab.slice(0, -1)}
                                </CardTitle>
                                <CardDescription>
                                    Completa todos los campos obligatorios (*)
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                {/* Formulario de Categorías */}
                                {activeTab === 'categorias' && (
                                    <form
                                        onSubmit={handleCategoriaSubmit}
                                        className="space-y-4"
                                    >
                                        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                                            <div className="space-y-2">
                                                <Label htmlFor="nombre">
                                                    Nombre *
                                                </Label>
                                                <Input
                                                    id="nombre"
                                                    value={
                                                        categoriaForm.data
                                                            .nombre
                                                    }
                                                    onChange={(e) =>
                                                        categoriaForm.setData(
                                                            'nombre',
                                                            e.target.value,
                                                        )
                                                    }
                                                    placeholder="Ej: Lácteos, Empaques"
                                                    required
                                                />
                                                {categoriaForm.errors
                                                    .nombre && (
                                                    <p className="text-sm text-red-500">
                                                        {
                                                            categoriaForm.errors
                                                                .nombre
                                                        }
                                                    </p>
                                                )}
                                            </div>
                                            <div className="space-y-2">
                                                <Label htmlFor="descripcion">
                                                    Descripción
                                                </Label>
                                                <Input
                                                    id="descripcion"
                                                    value={
                                                        categoriaForm.data
                                                            .descripcion
                                                    }
                                                    onChange={(e) =>
                                                        categoriaForm.setData(
                                                            'descripcion',
                                                            e.target.value,
                                                        )
                                                    }
                                                    placeholder="Descripción opcional"
                                                />
                                            </div>
                                        </div>
                                        <div className="flex justify-end space-x-2">
                                            <Button
                                                type="button"
                                                variant="outline"
                                                onClick={handleCancel}
                                            >
                                                Cancelar
                                            </Button>
                                            <Button
                                                type="submit"
                                                disabled={
                                                    categoriaForm.processing
                                                }
                                            >
                                                {categoriaForm.processing
                                                    ? 'Guardando...'
                                                    : 'Guardar'}
                                            </Button>
                                        </div>
                                    </form>
                                )}

                                {/* Formulario de Almacenes */}
                                {activeTab === 'almacenes' && (
                                    <form
                                        onSubmit={handleAlmacenSubmit}
                                        className="space-y-4"
                                    >
                                        <div className="space-y-2">
                                            <Label htmlFor="nombre">
                                                Nombre *
                                            </Label>
                                            <Input
                                                id="nombre"
                                                value={almacenForm.data.nombre}
                                                onChange={(e) =>
                                                    almacenForm.setData(
                                                        'nombre',
                                                        e.target.value,
                                                    )
                                                }
                                                placeholder="Ej: Almacén Principal, Bodega Fría"
                                                required
                                            />
                                            {almacenForm.errors.nombre && (
                                                <p className="text-sm text-red-500">
                                                    {almacenForm.errors.nombre}
                                                </p>
                                            )}
                                        </div>
                                        <div className="flex justify-end space-x-2">
                                            <Button
                                                type="button"
                                                variant="outline"
                                                onClick={handleCancel}
                                            >
                                                Cancelar
                                            </Button>
                                            <Button
                                                type="submit"
                                                disabled={
                                                    almacenForm.processing
                                                }
                                            >
                                                {almacenForm.processing
                                                    ? 'Guardando...'
                                                    : 'Guardar'}
                                            </Button>
                                        </div>
                                    </form>
                                )}

                                {/* Formulario de Items */}
                                {activeTab === 'items' && (
                                    <form
                                        onSubmit={handleItemSubmit}
                                        className="space-y-6"
                                    >
                                        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
                                            <div className="space-y-2">
                                                <Label htmlFor="codigo">
                                                    Código *
                                                </Label>
                                                <Input
                                                    id="codigo"
                                                    value={itemForm.data.codigo}
                                                    onChange={(e) =>
                                                        itemForm.setData(
                                                            'codigo',
                                                            e.target.value,
                                                        )
                                                    }
                                                    placeholder="Ej: MP001"
                                                    required
                                                />
                                                {itemForm.errors.codigo && (
                                                    <p className="text-sm text-red-500">
                                                        {itemForm.errors.codigo}
                                                    </p>
                                                )}
                                            </div>
                                            <div className="space-y-2">
                                                <Label htmlFor="nombre">
                                                    Nombre *
                                                </Label>
                                                <Input
                                                    id="nombre"
                                                    value={itemForm.data.nombre}
                                                    onChange={(e) =>
                                                        itemForm.setData(
                                                            'nombre',
                                                            e.target.value,
                                                        )
                                                    }
                                                    placeholder="Ej: Leche Entera"
                                                    required
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <Label htmlFor="categoria">
                                                    Categoría *
                                                </Label>
                                                {/* En el formulario de items, en el select de categorías: */}
                                                <Select
                                                    value={
                                                        itemForm.data
                                                            .categoria_materia_prima_id
                                                    }
                                                    onValueChange={(value) =>
                                                        itemForm.setData(
                                                            'categoria_materia_prima_id',
                                                            value,
                                                        )
                                                    }
                                                >
                                                    <SelectTrigger>
                                                        <SelectValue placeholder="Seleccionar categoría" />
                                                    </SelectTrigger>
                                                    <SelectContent side="bottom">
                                                        {todasCategorias?.map(
                                                            (
                                                                cat,
                                                            ) => (
                                                                <SelectItem
                                                                    key={cat.id}
                                                                    value={cat.id.toString()}
                                                                >
                                                                    {cat.nombre}
                                                                </SelectItem>
                                                            ),
                                                        )}
                                                    </SelectContent>
                                                </Select>
                                            </div>
                                            <div className="space-y-2">
                                                <Label htmlFor="unidad">
                                                    Unidad principal *
                                                </Label>
                                                <Select
                                                    value={
                                                        itemForm.data.unidad_id
                                                    }
                                                    onValueChange={(value) =>
                                                        itemForm.setData(
                                                            'unidad_id',
                                                            value,
                                                        )
                                                    }
                                                >
                                                    <SelectTrigger>
                                                        <SelectValue placeholder="Seleccionar unidad" />
                                                    </SelectTrigger>
                                                    <SelectContent side="bottom" avoidCollisions={false}>
                                                        {unidades?.map(
                                                            (unidad) => (
                                                                <SelectItem
                                                                    key={
                                                                        unidad.id
                                                                    }
                                                                    value={unidad.id.toString()}
                                                                >
                                                                    {
                                                                        unidad.nombre
                                                                    }
                                                                </SelectItem>
                                                            ),
                                                        )}
                                                    </SelectContent>
                                                </Select>
                                            </div>
                                            <div className="space-y-2">
                                                <Label htmlFor="unidad2">
                                                    Unidad secundaria
                                                </Label>
                                                <Select
                                                    value={
                                                        itemForm.data.unidad2_id
                                                    }
                                                    onValueChange={(value) =>
                                                        itemForm.setData(
                                                            'unidad2_id',
                                                            value,
                                                        )
                                                    }
                                                >
                                                    <SelectTrigger>
                                                        <SelectValue placeholder="Seleccionar unidad" />
                                                    </SelectTrigger>
                                                    <SelectContent side="bottom" avoidCollisions={false}>
                                                        {unidades?.map(
                                                            (unidad) => (
                                                                <SelectItem
                                                                    key={
                                                                        unidad.id
                                                                    }
                                                                    value={unidad.id.toString()}
                                                                >
                                                                    {
                                                                        unidad.nombre
                                                                    }
                                                                </SelectItem>
                                                            ),
                                                        )}
                                                    </SelectContent>
                                                </Select>
                                            </div>
                                            <div className="space-y-2">
                                                <Label htmlFor="nivel_inspeccion">
                                                    Nivel de inspección
                                                </Label>
                                                <Input
                                                    id="nivel_inspeccion"
                                                    type="number"
                                                    value={
                                                        itemForm.data
                                                            .nivel_inspeccion
                                                    }
                                                    onChange={(e) =>
                                                        itemForm.setData(
                                                            'nivel_inspeccion',
                                                            e.target.value,
                                                        )
                                                    }
                                                    placeholder="1-5"
                                                />
                                            </div>
                                        </div>

                                        <div className="space-y-2">
                                            <Label htmlFor="descripcion">
                                                Descripción
                                            </Label>
                                            <Textarea
                                                id="descripcion"
                                                value={
                                                    itemForm.data.descripcion
                                                }
                                                onChange={(e) =>
                                                    itemForm.setData(
                                                        'descripcion',
                                                        e.target.value,
                                                    )
                                                }
                                                placeholder="Descripción del item"
                                                rows={3}
                                            />
                                        </div>

                                        <Separator />
                                        <div>
                                            <h4 className="mb-4 text-lg font-medium">
                                                Parámetros de calidad
                                            </h4>
                                            <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
                                                <div className="space-y-2">
                                                    <Label htmlFor="temp_max">
                                                        Temp. Máx (°C)
                                                    </Label>
                                                    <Input
                                                        id="temp_max"
                                                        type="number"
                                                        step="0.01"
                                                        value={
                                                            itemForm.data
                                                                .temp_max
                                                        }
                                                        onChange={(e) =>
                                                            itemForm.setData(
                                                                'temp_max',
                                                                e.target.value,
                                                            )
                                                        }
                                                    />
                                                </div>
                                                <div className="space-y-2">
                                                    <Label htmlFor="temp_min">
                                                        Temp. Mín (°C)
                                                    </Label>
                                                    <Input
                                                        id="temp_min"
                                                        type="number"
                                                        step="0.01"
                                                        value={
                                                            itemForm.data
                                                                .temp_min
                                                        }
                                                        onChange={(e) =>
                                                            itemForm.setData(
                                                                'temp_min',
                                                                e.target.value,
                                                            )
                                                        }
                                                    />
                                                </div>
                                                <div className="space-y-2">
                                                    <Label htmlFor="ph_max">
                                                        pH Máx
                                                    </Label>
                                                    <Input
                                                        id="ph_max"
                                                        type="number"
                                                        step="0.01"
                                                        value={
                                                            itemForm.data.ph_max
                                                        }
                                                        onChange={(e) =>
                                                            itemForm.setData(
                                                                'ph_max',
                                                                e.target.value,
                                                            )
                                                        }
                                                    />
                                                </div>
                                                <div className="space-y-2">
                                                    <Label htmlFor="ph_min">
                                                        pH Mín
                                                    </Label>
                                                    <Input
                                                        id="ph_min"
                                                        type="number"
                                                        step="0.01"
                                                        value={
                                                            itemForm.data.ph_min
                                                        }
                                                        onChange={(e) =>
                                                            itemForm.setData(
                                                                'ph_min',
                                                                e.target.value,
                                                            )
                                                        }
                                                    />
                                                </div>
                                            </div>
                                        </div>

                                        <div className="flex justify-end space-x-2">
                                            <Button
                                                type="button"
                                                variant="outline"
                                                onClick={handleCancel}
                                            >
                                                Cancelar
                                            </Button>
                                            <Button
                                                type="submit"
                                                disabled={itemForm.processing}
                                            >
                                                {itemForm.processing
                                                    ? 'Guardando...'
                                                    : 'Guardar'}
                                            </Button>
                                        </div>
                                    </form>
                                )}

                                {/* Formulario de Proveedores */}
                                {activeTab === 'proveedores' && (
                                    <form
                                        onSubmit={handleProveedorSubmit}
                                        className="space-y-4"
                                    >
                                        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                                            <div className="space-y-2">
                                                <Label htmlFor="nombre">
                                                    Nombre *
                                                </Label>
                                                <Input
                                                    id="nombre"
                                                    value={
                                                        proveedorForm.data
                                                            .nombre
                                                    }
                                                    onChange={(e) =>
                                                        proveedorForm.setData(
                                                            'nombre',
                                                            e.target.value,
                                                        )
                                                    }
                                                    placeholder="Ej: Proveedor XYZ"
                                                    required
                                                />
                                                {proveedorForm.errors
                                                    .nombre && (
                                                    <p className="text-sm text-red-500">
                                                        {
                                                            proveedorForm.errors
                                                                .nombre
                                                        }
                                                    </p>
                                                )}
                                            </div>
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="descripcion">
                                                Descripción
                                            </Label>
                                            <Textarea
                                                id="descripcion"
                                                value={
                                                    proveedorForm.data
                                                        .descripcion
                                                }
                                                onChange={(e) =>
                                                    proveedorForm.setData(
                                                        'descripcion',
                                                        e.target.value,
                                                    )
                                                }
                                                placeholder="Información del proveedor"
                                                rows={3}
                                            />
                                        </div>
                                        <div className="flex justify-end space-x-2">
                                            <Button
                                                type="button"
                                                variant="outline"
                                                onClick={handleCancel}
                                            >
                                                Cancelar
                                            </Button>
                                            <Button
                                                type="submit"
                                                disabled={
                                                    proveedorForm.processing
                                                }
                                            >
                                                {proveedorForm.processing
                                                    ? 'Guardando...'
                                                    : 'Guardar'}
                                            </Button>
                                        </div>
                                    </form>
                                )}
                            </CardContent>
                        </Card>
                    )}

                    {/* Contenido de cada tab (lista de registros) */}

                    {/* Tab Categorías */}
                    <TabsContent value="categorias" className="space-y-4">
                        <Card>
                            <CardHeader>
                                <CardTitle>
                                    Categorías de Materia Prima
                                </CardTitle>
                                {/* <CardDescription>
                                    {categorias.total || 0} categorías registradas
                                </CardDescription> */}

                                {/* Filtro de búsqueda para categorías */}
                                <div className="flex items-center space-x-2 pt-2">
                                    <div className="relative flex-1">
                                        <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                                        <Input
                                            placeholder="Buscar por nombre o descripción..."
                                            className="pl-8"
                                            value={searchValues.categorias}
                                            onChange={(e) => setSearchValues(prev => ({
                                                ...prev,
                                                categorias: e.target.value
                                            }))}
                                            onKeyDown={(e) => {
                                                if (e.key === 'Enter') {
                                                    handleSearch('categorias');
                                                }
                                            }}
                                        />
                                        {searchValues.categorias && (
                                            <button
                                                className="absolute right-2 top-2.5"
                                                onClick={() => handleClearSearch('categorias')}
                                            >
                                                <X className="h-4 w-4 text-muted-foreground hover:text-foreground" />
                                            </button>
                                        )}
                                    </div>
                                    <Button
                                        onClick={() => handleSearch('categorias')}
                                        variant="secondary"
                                    >
                                        Buscar
                                    </Button>
                                </div>
                            </CardHeader>
                            <CardContent>
                                <div className="overflow-x-auto">
                                    <Table>
                                        <TableHeader>
                                            <TableRow>
                                                <TableHead>Nombre</TableHead>
                                                <TableHead>
                                                    Descripción
                                                </TableHead>
                                                <TableHead className="text-right">
                                                    Acciones
                                                </TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {categorias.data?.length > 0 ? (
                                                categorias.data.map(
                                                    (categoria) => (
                                                        <TableRow
                                                            key={categoria.id}
                                                        >
                                                            <TableCell className="font-medium">
                                                                {
                                                                    categoria.nombre
                                                                }
                                                            </TableCell>
                                                            <TableCell>
                                                                {categoria.descripcion ||
                                                                    '-'}
                                                            </TableCell>
                                                            <TableCell className="text-right">
                                                                <div className="flex justify-end space-x-2">
                                                                    {hasPermission('u_adminMateriaPrima') && (
                                                                        <Button
                                                                            variant="outline"
                                                                            size="sm"
                                                                            onClick={() =>
                                                                                handleEditCategoria(
                                                                                    categoria,
                                                                                )
                                                                            }
                                                                        >
                                                                            <Edit className="h-4 w-4" />
                                                                        </Button>
                                                                    )}

                                                                    {hasPermission(
                                                                        'd_adminMateriaPrima',
                                                                    ) && (
                                                                        <Button
                                                                            variant="outline"
                                                                            size="sm"
                                                                            onClick={() =>
                                                                                handleDeleteCategoria(
                                                                                    categoria.id,
                                                                                )
                                                                            }
                                                                        >
                                                                            <Trash2 className="h-4 w-4" />
                                                                        </Button>
                                                                    )}
                                                                </div>
                                                            </TableCell>
                                                        </TableRow>
                                                    ),
                                                )
                                            ) : (
                                                <TableRow>
                                                    <TableCell
                                                        colSpan={3}
                                                        className="py-8 text-center text-muted-foreground"
                                                    >
                                                        {searchValues.categorias
                                                            ? 'No se encontraron categorías con ese criterio'
                                                            : 'No hay categorías registradas'}
                                                    </TableCell>
                                                </TableRow>
                                            )}
                                        </TableBody>
                                    </Table>
                                </div>

                                {/* Paginación para categorías */}
                                {categorias.data?.length > 0 && (
                                    <div className="border-t border-border px-4 py-3">
                                        <TablePagination
                                            pagination={categorias}
                                            onPageChange={(page) =>
                                                handlePageChange(
                                                    page,
                                                    'categorias',
                                                )
                                            }
                                        />
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </TabsContent>

                    {/* Tab Almacenes */}
                    <TabsContent value="almacenes" className="space-y-4">
                        <Card>
                            <CardHeader>
                                <CardTitle>
                                    Almacenes de Materia Prima
                                </CardTitle>
                                {/* <CardDescription>
                                    {almacenes.total || 0} almacenes registrados
                                </CardDescription> */}

                                {/* Filtro de búsqueda para almacenes */}
                                <div className="flex items-center space-x-2 pt-2">
                                    <div className="relative flex-1">
                                        <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                                        <Input
                                            placeholder="Buscar por nombre..."
                                            className="pl-8"
                                            value={searchValues.almacenes}
                                            onChange={(e) => setSearchValues(prev => ({
                                                ...prev,
                                                almacenes: e.target.value
                                            }))}
                                            onKeyDown={(e) => {
                                                if (e.key === 'Enter') {
                                                    handleSearch('almacenes');
                                                }
                                            }}
                                        />
                                        {searchValues.almacenes && (
                                            <button
                                                className="absolute right-2 top-2.5"
                                                onClick={() => handleClearSearch('almacenes')}
                                            >
                                                <X className="h-4 w-4 text-muted-foreground hover:text-foreground" />
                                            </button>
                                        )}
                                    </div>
                                    <Button
                                        onClick={() => handleSearch('almacenes')}
                                        variant="secondary"
                                    >
                                        Buscar
                                    </Button>
                                </div>
                            </CardHeader>
                            <CardContent>
                                <div className="overflow-x-auto">
                                    <Table>
                                        <TableHeader>
                                            <TableRow>
                                                <TableHead>Nombre</TableHead>
                                                <TableHead className="text-right">
                                                    Acciones
                                                </TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {almacenes.data?.length > 0 ? (
                                                almacenes.data.map(
                                                    (almacen) => (
                                                        <TableRow
                                                            key={almacen.id}
                                                        >
                                                            <TableCell className="font-medium">
                                                                {almacen.nombre}
                                                            </TableCell>
                                                            <TableCell className="text-right">
                                                                <div className="flex justify-end space-x-2">
                                                                    {hasPermission('u_adminMateriaPrima') && (
                                                                    <Button
                                                                        variant="outline"
                                                                        size="sm"
                                                                        onClick={() =>
                                                                            handleEditAlmacen(
                                                                                almacen,
                                                                            )
                                                                        }
                                                                    >
                                                                        <Edit className="h-4 w-4" />
                                                                    </Button>
                                                                    )}

                                                                       {hasPermission('d_adminMateriaPrima') && (
                                                                    <Button
                                                                        variant="outline"
                                                                        size="sm"
                                                                        onClick={() =>
                                                                            handleDeleteAlmacen(
                                                                                almacen.id,
                                                                            )
                                                                        }
                                                                    >
                                                                        <Trash2 className="h-4 w-4" />
                                                                    </Button>
                                                                    )}
                                                                </div>
                                                            </TableCell>
                                                        </TableRow>
                                                    ),
                                                )
                                            ) : (
                                                <TableRow>
                                                    <TableCell
                                                        colSpan={2}
                                                        className="py-8 text-center text-muted-foreground"
                                                    >
                                                        {searchValues.almacenes
                                                            ? 'No se encontraron almacenes con ese criterio'
                                                            : 'No hay almacenes registrados'}
                                                    </TableCell>
                                                </TableRow>
                                            )}
                                        </TableBody>
                                    </Table>
                                </div>

                                {/* Paginación para almacenes */}
                                {almacenes.data?.length > 0 && (
                                    <div className="border-t border-border px-4 py-3">
                                        <TablePagination
                                            pagination={almacenes}
                                            onPageChange={(page) =>
                                                handlePageChange(
                                                    page,
                                                    'almacenes',
                                                )
                                            }
                                        />
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </TabsContent>

                    {/* Tab Items */}
                    <TabsContent value="items" className="space-y-4">
                        <Card>
                            <CardHeader>
                                <CardTitle>Items de Materia Prima</CardTitle>
                                {/* <CardDescription>
                                    {items.total || 0} items registrados
                                </CardDescription> */}

                                {/* Filtro de búsqueda para items */}
                                <div className="flex items-center space-x-2 pt-2">
                                    <div className="relative flex-1">
                                        <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                                        <Input
                                            placeholder="Buscar por código, nombre, descripción o categoría..."
                                            className="pl-8"
                                            value={searchValues.items}
                                            onChange={(e) => setSearchValues(prev => ({
                                                ...prev,
                                                items: e.target.value
                                            }))}
                                            onKeyDown={(e) => {
                                                if (e.key === 'Enter') {
                                                    handleSearch('items');
                                                }
                                            }}
                                        />
                                        {searchValues.items && (
                                            <button
                                                className="absolute right-2 top-2.5"
                                                onClick={() => handleClearSearch('items')}
                                            >
                                                <X className="h-4 w-4 text-muted-foreground hover:text-foreground" />
                                            </button>
                                        )}
                                    </div>
                                    <Button
                                        onClick={() => handleSearch('items')}
                                        variant="secondary"
                                    >
                                        Buscar
                                    </Button>
                                </div>
                            </CardHeader>
                            <CardContent>
                                <div className="overflow-x-auto">
                                    <Table>
                                        <TableHeader>
                                            <TableRow>
                                                <TableHead>Código</TableHead>
                                                <TableHead>Nombre</TableHead>
                                                <TableHead>Categoría</TableHead>
                                                <TableHead>Unidad</TableHead>
                                                <TableHead className="text-right">
                                                    Acciones
                                                </TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {items.data?.length > 0 ? (
                                                items.data.map((item) => (
                                                    <TableRow key={item.id}>
                                                        <TableCell className="font-medium">
                                                            {item.codigo}
                                                        </TableCell>
                                                        <TableCell>
                                                            <div>
                                                                <div className="font-medium">
                                                                    {
                                                                        item.nombre
                                                                    }
                                                                </div>
                                                                {item.descripcion && (
                                                                    <div className="text-sm text-muted-foreground">
                                                                        {item.descripcion.substring(
                                                                            0,
                                                                            50,
                                                                        )}
                                                                        ...
                                                                    </div>
                                                                )}
                                                            </div>
                                                        </TableCell>
                                                        <TableCell>
                                                            {item
                                                                .categoria_materia_prima
                                                                ?.nombre || '-'}
                                                        </TableCell>
                                                        <TableCell>
                                                            {item.unidad
                                                                ?.nombre || '-'}
                                                            {item.unidad2 &&
                                                                ` / ${item.unidad2.nombre}`}
                                                        </TableCell>
                                                        <TableCell className="text-right">
                                                            <div className="flex justify-end space-x-2">
                                                                    {hasPermission('u_adminMateriaPrima') && (
                                                                <Button
                                                                    variant="outline"
                                                                    size="sm"
                                                                    onClick={() =>
                                                                        handleEditItem(
                                                                            item,
                                                                        )
                                                                    }
                                                                >
                                                                    <Edit className="h-4 w-4" />
                                                                </Button>
                                                                    )}

                                                                    {hasPermission('d_adminMateriaPrima') && (
                                                                <Button
                                                                    variant="outline"
                                                                    size="sm"
                                                                    onClick={() =>
                                                                        handleDeleteItem(
                                                                            item.id,
                                                                        )
                                                                    }
                                                                >
                                                                    <Trash2 className="h-4 w-4" />
                                                                </Button>
                                                                    )}
                                                            </div>
                                                        </TableCell>
                                                    </TableRow>
                                                ))
                                            ) : (
                                                <TableRow>
                                                    <TableCell
                                                        colSpan={5}
                                                        className="py-8 text-center text-muted-foreground"
                                                    >
                                                        {searchValues.items
                                                            ? 'No se encontraron items con ese criterio'
                                                            : 'No hay items registrados'}
                                                    </TableCell>
                                                </TableRow>
                                            )}
                                        </TableBody>
                                    </Table>
                                </div>

                                {/* Paginación para items */}
                                {items.data?.length > 0 && (
                                    <div className="border-t border-border px-4 py-3">
                                        <TablePagination
                                            pagination={items}
                                            onPageChange={(page) =>
                                                handlePageChange(page, 'items')
                                            }
                                        />
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </TabsContent>

                    {/* Tab Proveedores */}
                    <TabsContent value="proveedores" className="space-y-4">
                        <Card>
                            <CardHeader>
                                <CardTitle>
                                    Proveedores de Materia Prima
                                </CardTitle>
                                {/* <CardDescription>
                                    {proveedores.total || 0} proveedores registrados
                                </CardDescription> */}

                                {/* Filtro de búsqueda para proveedores */}
                                <div className="flex items-center space-x-2 pt-2">
                                    <div className="relative flex-1">
                                        <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                                        <Input
                                            placeholder="Buscar por nombre o descripción..."
                                            className="pl-8"
                                            value={searchValues.proveedores}
                                            onChange={(e) => setSearchValues(prev => ({
                                                ...prev,
                                                proveedores: e.target.value
                                            }))}
                                            onKeyDown={(e) => {
                                                if (e.key === 'Enter') {
                                                    handleSearch('proveedores');
                                                }
                                            }}
                                        />
                                        {searchValues.proveedores && (
                                            <button
                                                className="absolute right-2 top-2.5"
                                                onClick={() => handleClearSearch('proveedores')}
                                            >
                                                <X className="h-4 w-4 text-muted-foreground hover:text-foreground" />
                                            </button>
                                        )}
                                    </div>
                                    <Button
                                        onClick={() => handleSearch('proveedores')}
                                        variant="secondary"
                                    >
                                        Buscar
                                    </Button>
                                </div>
                            </CardHeader>
                            <CardContent>
                                <div className="overflow-x-auto">
                                    <Table>
                                        <TableHeader>
                                            <TableRow>
                                                <TableHead>Nombre</TableHead>
                                                <TableHead>
                                                    Descripción
                                                </TableHead>
                                                <TableHead className="text-right">
                                                    Acciones
                                                </TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {proveedores.data?.length > 0 ? (
                                                proveedores.data.map(
                                                    (proveedor) => (
                                                        <TableRow
                                                            key={proveedor.id}
                                                        >
                                                            <TableCell className="font-medium">
                                                                {
                                                                    proveedor.nombre
                                                                }
                                                            </TableCell>
                                                            <TableCell>
                                                                {proveedor.descripcion ||
                                                                    '-'}
                                                            </TableCell>
                                                            <TableCell className="text-right">
                                                                <div className="flex justify-end space-x-2">
                                                                    {hasPermission('u_adminMateriaPrima') && (
                                                                    <Button
                                                                        variant="outline"
                                                                        size="sm"
                                                                        onClick={() =>
                                                                            handleEditProveedor(
                                                                                proveedor,
                                                                            )
                                                                        }
                                                                    >
                                                                        <Edit className="h-4 w-4" />
                                                                    </Button>
                                                                    )}

                                                                    {hasPermission('d_adminMateriaPrima') && (
                                                                    <Button
                                                                        variant="outline"
                                                                        size="sm"
                                                                        onClick={() =>
                                                                            handleDeleteProveedor(
                                                                                proveedor.id,
                                                                            )
                                                                        }
                                                                    >
                                                                        <Trash2 className="h-4 w-4" />
                                                                    </Button>
                                                                    )}
                                                                </div>
                                                            </TableCell>
                                                        </TableRow>
                                                    ),
                                                )
                                            ) : (
                                                <TableRow>
                                                    <TableCell
                                                        colSpan={3}
                                                        className="py-8 text-center text-muted-foreground"
                                                    >
                                                        {searchValues.proveedores
                                                            ? 'No se encontraron proveedores con ese criterio'
                                                            : 'No hay proveedores registrados'}
                                                    </TableCell>
                                                </TableRow>
                                            )}
                                        </TableBody>
                                    </Table>
                                </div>

                                {/* Paginación para proveedores */}
                                {proveedores.data?.length > 0 && (
                                    <div className="border-t border-border px-4 py-3">
                                        <TablePagination
                                            pagination={proveedores}
                                            onPageChange={(page) =>
                                                handlePageChange(
                                                    page,
                                                    'proveedores',
                                                )
                                            }
                                        />
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </TabsContent>
                </Tabs>

                {/* Info rápida */}
                <div className="flex justify-between">
                    <p className="text-muted-foreground">
                        {activeTab === 'categorias' &&
                            `${categorias.total || 0} categorías registradas`}
                        {activeTab === 'almacenes' &&
                            `${almacenes.total || 0} almacenes registrados`}
                        {activeTab === 'items' &&
                            `${items.total || 0} items registrados`}
                        {activeTab === 'proveedores' &&
                            `${proveedores.total || 0} proveedores registrados`}
                    </p>
                    <div>
                        {(activeTab === 'categorias' &&
                            categorias.data?.length > 0) ||
                        (activeTab === 'almacenes' &&
                            almacenes.data?.length > 0) ||
                        (activeTab === 'items' && items.data?.length > 0) ||
                        (activeTab === 'proveedores' &&
                            proveedores.data?.length > 0) ? (
                            <div className="text-center">
                                <p className="text-muted-foreground">
                                    Mostrando{' '}
                                    <span className="font-medium text-foreground">
                                        {activeTab === 'categorias' &&
                                            categorias.data?.length}
                                        {activeTab === 'almacenes' &&
                                            almacenes.data?.length}
                                        {activeTab === 'items' &&
                                            items.data?.length}
                                        {activeTab === 'proveedores' &&
                                            proveedores.data?.length}
                                    </span>{' '}
                                    de{' '}
                                    <span className="font-medium text-foreground">
                                        {activeTab === 'categorias' &&
                                            categorias.total}
                                        {activeTab === 'almacenes' &&
                                            almacenes.total}
                                        {activeTab === 'items' && items.total}
                                        {activeTab === 'proveedores' &&
                                            proveedores.total}
                                    </span>{' '}
                                    {activeTab}
                                </p>
                            </div>
                        ) : null}
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
