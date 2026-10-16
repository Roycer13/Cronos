import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog';
import FechaHora from '@/components/ui/fecha-hora';
import FilterSelect from '@/components/ui/filter-select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import TablePagination from '@/components/ui/table-pagination';
import { Textarea } from '@/components/ui/textarea';
import { Toast } from '@/components/ui/toast';
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from '@/components/ui/tooltip';
import { useAdvancedFilters } from '@/hooks/use-advanced-filters';
import { useInitials } from '@/hooks/use-initials';
import { useAuth } from '@/hooks/useAuth';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, router, usePage } from '@inertiajs/react';
import {
    ChevronDown,
    ChevronRight,
    Filter,
    Pencil,
    Plus,
    Search,
    Trash2,
    X,
} from 'lucide-react'; // Agregar estos iconos en los imports
import { useEffect, useState } from 'react';
import { route } from 'ziggy-js';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Conteos', href: '#' },
];

interface PageProps {
    conteos: {
        data: any[];
        links: any[];
        current_page: number;
        last_page: number;
        per_page: number;
        total: number;
    };
    total_conteos: number;
    filters: {
        search?: string;
        orp?: string;
        estado?: string;
        usuario?: string;
        tipo?: string;
        ubicacion?: string;
        cantidad_min?: string;
        cantidad_max?: string;
        fecha_desde?: string;
        fecha_hasta?: string;
        per_page?: number;
    };

    orps: {
        id: number;
        codigo: string;
        producto_terminado?: { nombre_sap: string };
    }[];
    all_orps: typeof orps;
    estados: { nombre: string }[];
    usuarios: { name: string }[];
    tipos: string[];
    ubicaciones: string[];
    flash: {
        success?: string;
        error?: string;
    };
}

interface GroupedConteos {
    [orpCodigo: string]: {
        orp: any;
        conteos: any[];
        expanded: boolean;
        totalCantidad: number;
        totalPorTurnoCantidad: number;
        tieneTotal: boolean;
        totalEstado: string;
    };
}

const TIPOS_CONTEOS = [
    { value: 'Parcial', label: 'Parcial' },
    { value: 'Total por Turno', label: 'Total por Turno' },
    { value: 'Muestras de Calidad', label: 'Muestras de Calidad' },
    { value: 'Total', label: 'Total' },
];

export default function Index() {
    const { props } = usePage<PageProps>();
    const [showFilters, setShowFilters] = useState(false);

    const { hasPermission, canDo, user: authUser } = useAuth();
    const [expandedGroups, setExpandedGroups] = useState<Set<string>>(
        new Set(),
    );
    const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
    const [isCreateForOrpDialogOpen, setIsCreateForOrpDialogOpen] =
        useState(false);
    const [selectedOrpForCreate, setSelectedOrpForCreate] = useState<any>(null);

    // Estado del formulario general
    const [formData, setFormData] = useState({
        orp_id: '',
        tipo: '',
        cantidad: '',
        ubicacion: '',
        observacion: '',
    });

    // Estado del formulario específico para ORP
    const [formDataForOrp, setFormDataForOrp] = useState({
        tipo: '',
        cantidad: '',
        ubicacion: '',
        observacion: '',
    });

    const getInitials = useInitials();

    const {
        conteos,
        total_conteos,
        filters: initialFilters = {},
        orps = [],
        all_orps = [],
        estados = [],
        usuarios = [],
        tipos = [],
        ubicaciones = [],
        flash,
    } = props;

    // Filtrar ORPs válidos (con id y codigo)
    const validOrps = (orps || []).filter((orp) => orp && orp.id && orp.codigo);

    // Procesar datos ya agrupados del backend
    const groupedConteos: GroupedConteos = {};

    conteos.data.forEach((item: any) => {
        const orp = item.orp;
        const orpCodigo = orp?.codigo || 'Sin ORP';

        // Calcular si tiene Total y su estado
        let tieneTotal = false;
        let totalEstado = 'En Proceso';

        const totalConteo = item.conteos?.find((c: any) => c.tipo === 'Total');
        if (totalConteo) {
            tieneTotal = true;
            totalEstado =
                totalConteo.estado?.nombre === 'Completado'
                    ? 'Completado'
                    : 'En Proceso';
        } else {
            tieneTotal = item.tiene_total || false;
        }

        groupedConteos[orpCodigo] = {
            orp: orp,
            conteos: item.conteos || [],
            expanded: expandedGroups.has(orpCodigo),
            totalCantidad: item.total_cantidad || 0,
            totalPorTurnoCantidad: item.total_por_turno_cantidad || 0,
            tieneTotal: tieneTotal,
            totalEstado: totalEstado,
        };
    });

    // Ordenar grupos por ORP (ya vienen ordenados del backend)
    const sortedGroups = Object.entries(groupedConteos);

    const { filters, updateFilter, resetFilters } = useAdvancedFilters({
        routeName: 'conteos.index',
        initialFilters: {
            search: initialFilters.search || '',
            orp: initialFilters.orp || '',
            estado: initialFilters.estado || '',
            usuario: initialFilters.usuario || '',
            tipo: initialFilters.tipo || '',
            ubicacion: initialFilters.ubicacion || '',
            cantidad_min: initialFilters.cantidad_min || '',
            cantidad_max: initialFilters.cantidad_max || '',
            fecha_desde: initialFilters.fecha_desde || '',
            fecha_hasta: initialFilters.fecha_hasta || '',
            per_page: initialFilters.per_page?.toString() || '10',
        },
        debounceFields: ['search'],
        debounceDelay: 600,
    });

    const hasActiveFilters = Object.values(filters).some(
        (v) => v && v !== '' && v !== '10',
    );

    const toggleGroup = (orpCodigo: string) => {
        const newExpanded = new Set(expandedGroups);
        if (newExpanded.has(orpCodigo)) {
            newExpanded.delete(orpCodigo);
        } else {
            newExpanded.add(orpCodigo);
        }
        setExpandedGroups(newExpanded);

        if (groupedConteos[orpCodigo]) {
            groupedConteos[orpCodigo].expanded = newExpanded.has(orpCodigo);
        }
    };

    // Obtener el ORP seleccionado para el formulario general
    const getSelectedOrp = () => {
        if (!formData.orp_id) return null;
        return validOrps.find((o) => o.id.toString() === formData.orp_id);
    };

    const selectedOrp = getSelectedOrp();

    // También necesitas agregar estas variables de estado y funciones:
    const [conteoAEditar, setConteoAEditar] = useState<any>(null);
    const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
    const [editFormData, setEditFormData] = useState({
        tipo: '',
        cantidad: '',
        ubicacion: '',
        observacion: '',
    });

    // Abrir diálogo para crear conteo para un ORP específico
    const openCreateForOrpDialog = (group: any) => {
        setSelectedOrpForCreate(group.orp);
        setFormDataForOrp({
            tipo: '',
            cantidad: '',
            ubicacion: '',

            observacion: '',
        });
        setIsCreateForOrpDialogOpen(true);
    };

    // Crear Total automáticamente
    const crearTotalAutomatico = (group: any, e: React.MouseEvent) => {
        e.stopPropagation();

        const cantidadTotal = group.totalPorTurnoCantidad;

        if (cantidadTotal <= 0) {
            alert('No hay conteos "Total por Turno" para crear el Total');
            return;
        }

        if (group.tieneTotal) {
            if (
                confirm('Ya existe un Total para este ORP. ¿Desea crear otro?')
            ) {
                crearTotal(group.orp, cantidadTotal);
            }
        } else {
            crearTotal(group.orp, cantidadTotal);
        }
    };

    // Función para crear el Total
    const crearTotal = (orp: any, cantidad: number) => {
        // Convertir a entero (sin decimales)
        const cantidadEntera = Math.round(cantidad);

        router.post(
            route('conteos.store'),
            {
                orp_id: orp.id,
                tipo: 'Total',
                cantidad: cantidadEntera,
                ubicacion: '',

                observacion: ``,
            },
            {
                preserveScroll: true,
                onSuccess: () => {
                    // Actualizar el estado local temporalmente
                    const orpCodigo = orp.codigo;
                    if (groupedConteos[orpCodigo]) {
                        groupedConteos[orpCodigo].tieneTotal = true;
                        groupedConteos[orpCodigo].totalEstado = 'Completado';
                    }
                },
                onError: (errors) => {
                    console.log('Errores:', errors);
                    alert('Error al crear el Total');
                },
            },
        );
    };

    // Manejar cambios en el formulario general
    const handleInputChange = (field: string, value: string) => {
        setFormData((prev) => ({
            ...prev,
            [field]: value,
        }));
    };

    // Manejar cambios en el formulario específico para ORP
    const handleInputChangeForOrp = (field: string, value: string) => {
        setFormDataForOrp((prev) => ({
            ...prev,
            [field]: value,
        }));
    };

    // Manejar envío del formulario general
    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        if (!formData.orp_id || !formData.tipo || !formData.cantidad) {
            console.log('Faltan campos requeridos');
            return;
        }

        router.post(
            route('conteos.store'),
            {
                orp_id: formData.orp_id,
                tipo: formData.tipo,
                cantidad: formData.cantidad,
                ubicacion: formData.ubicacion,
                observacion: formData.observacion,
            },
            {
                preserveScroll: true,
                onSuccess: () => {
                    setIsCreateDialogOpen(false);
                    resetForm();
                },
                onError: (errors) => {
                    console.log('Errores:', errors);
                },
            },
        );
    };

    // Manejar envío del formulario específico para ORP
    const handleSubmitForOrp = (e: React.FormEvent) => {
        e.preventDefault();

        if (
            !selectedOrpForCreate ||
            !formDataForOrp.tipo ||
            !formDataForOrp.cantidad
        ) {
            console.log('Faltan campos requeridos');
            return;
        }

        router.post(
            route('conteos.store'),
            {
                orp_id: selectedOrpForCreate.id,
                tipo: formDataForOrp.tipo,
                cantidad: formDataForOrp.cantidad,
                ubicacion: formDataForOrp.ubicacion,
                observacion: formDataForOrp.observacion,
            },
            {
                preserveScroll: true,
                onSuccess: () => {
                    setIsCreateForOrpDialogOpen(false);
                    resetFormForOrp();
                },
                onError: (errors) => {
                    console.log('Errores:', errors);
                },
            },
        );
    };

    // Resetear formulario general
    const resetForm = () => {
        setFormData({
            orp_id: '',
            tipo: '',
            cantidad: '',
            ubicacion: '',
            observacion: '',
        });
    };

    // Resetear formulario específico para ORP
    const resetFormForOrp = () => {
        setFormDataForOrp({
            tipo: '',
            cantidad: '',
            ubicacion: '',
            observacion: '',
        });
        setSelectedOrpForCreate(null);
    };

    // Función para manejar edición
    const handleEditSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        if (!conteoAEditar || !editFormData.tipo || !editFormData.cantidad) {
            console.log('Faltan campos requeridos');
            return;
        }

        router.put(
            route('conteos.update', conteoAEditar.id),
            {
                tipo: editFormData.tipo,
                cantidad: editFormData.cantidad,
                ubicacion: editFormData.ubicacion,
                observacion: editFormData.observacion,
            },
            {
                preserveScroll: true,
                onSuccess: () => {
                    setIsEditDialogOpen(false);
                    setConteoAEditar(null);
                    setEditFormData({
                        tipo: '',
                        cantidad: '',
                        ubicacion: '',
                        observacion: '',
                    });
                },
                onError: (errors) => {
                    console.log('Errores:', errors);
                },
            },
        );
    };

    // Función para eliminar conteo
    const eliminarConteo = (id: number, tipo: string, orpCodigo: string) => {
        if (
            !confirm(
                `¿Está seguro de eliminar este conteo de tipo "${tipo}" del ORP ${orpCodigo}?`,
            )
        ) {
            return;
        }

        router.delete(route('conteos.destroy', id), {
            preserveScroll: true,
            onSuccess: () => {
                // Actualizar estado local si es necesario
            },
            onError: (errors) => {
                console.log('Errores:', errors);
                alert('Error al eliminar el conteo');
            },
        });
    };

    // Función para abrir diálogo de edición
    const abrirEditarConteo = (conteo: any) => {
        setConteoAEditar(conteo);
        setEditFormData({
            tipo: conteo.tipo || '',
            cantidad: conteo.cantidad || '',
            ubicacion: conteo.ubicacion || '',
            observacion: conteo.observacion || '',
        });
        setIsEditDialogOpen(true);
    };

    // Efecto para resetear cuando se cierran los diálogos
    useEffect(() => {
        if (!isCreateDialogOpen) {
            resetForm();
        }
        if (!isCreateForOrpDialogOpen) {
            resetFormForOrp();
        }
    }, [isCreateDialogOpen, isCreateForOrpDialogOpen]);

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Conteos" />
            <div className="space-y-4 p-4 sm:p-6">
                <Toast />

                {/* Header */}
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div className="relative max-w-md">
                        <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                        <Input
                            placeholder="Buscar por ORP, observación, usuario, ubicación..."
                            value={filters.search}
                            onChange={(e) =>
                                updateFilter('search', e.target.value)
                            }
                            className="pl-10"
                        />
                    </div>

                    <div className="flex gap-2">
                        <Dialog
                            open={isCreateDialogOpen}
                            onOpenChange={setIsCreateDialogOpen}
                        >
                            <DialogTrigger asChild>
                                {hasPermission('c_conteos') && (
                                    <Button size="sm">
                                        <Plus className="mr-2 h-4 w-4" />
                                        Nuevo Conteo
                                    </Button>
                                )}
                            </DialogTrigger>
                            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                                <DialogHeader>
                                    <DialogTitle>
                                        Crear Nuevo Conteo
                                    </DialogTitle>
                                    <DialogDescription>
                                        Complete todos los campos para registrar
                                        un nuevo conteo.
                                    </DialogDescription>
                                </DialogHeader>

                                <form
                                    onSubmit={handleSubmit}
                                    className="space-y-6"
                                >
                                    {/* Selección de ORP */}
                                    <div className="space-y-3">
                                        <Label htmlFor="orp">ORP *</Label>
                                        <FilterSelect
                                            value={formData.orp_id}
                                            onChange={(v) =>
                                                handleInputChange('orp_id', v)
                                            }
                                            placeholder="Seleccionar ORP"
                                            options={validOrps.map((o) => ({
                                                value: o.id.toString(),
                                                label: `${o.codigo} - ${o.producto_terminado?.nombre_sap || ''}`,
                                            }))}
                                        />
                                        {selectedOrp &&
                                            selectedOrp.producto_terminado
                                                ?.nombre_sap && (
                                                <div className="mt-1 text-sm text-muted-foreground">
                                                    Producto:{' '}
                                                    {
                                                        selectedOrp
                                                            .producto_terminado
                                                            .nombre_sap
                                                    }
                                                </div>
                                            )}
                                    </div>

                                    {/* Tipo de Conteo */}
                                    <div className="space-y-3">
                                        <Label htmlFor="tipo">
                                            Tipo de Conteo *
                                        </Label>
                                        <FilterSelect
                                            value={formData.tipo}
                                            onChange={(v) =>
                                                handleInputChange('tipo', v)
                                            }
                                            placeholder="Seleccionar tipo"
                                            options={TIPOS_CONTEOS}
                                        />
                                    </div>

                                    {/* Cantidad */}
                                    <div className="space-y-3">
                                        <Label htmlFor="cantidad">
                                            Cantidad *
                                        </Label>
                                        <Input
                                            id="cantidad"
                                            type="number"
                                            step="0.01"
                                            placeholder="Ingrese la cantidad"
                                            value={formData.cantidad}
                                            onChange={(e) =>
                                                handleInputChange(
                                                    'cantidad',
                                                    e.target.value,
                                                )
                                            }
                                            required
                                        />
                                    </div>

                                    {/* Ubicación */}
                                    <div className="space-y-3">
                                        <Label htmlFor="ubicacion">
                                            Ubicación
                                        </Label>
                                        <Input
                                            id="ubicacion"
                                            placeholder="Ingrese la ubicación"
                                            value={formData.ubicacion}
                                            onChange={(e) =>
                                                handleInputChange(
                                                    'ubicacion',
                                                    e.target.value,
                                                )
                                            }
                                        />
                                    </div>

                                    {/* Observación */}
                                    <div className="space-y-3">
                                        <Label htmlFor="observacion">
                                            Observación
                                        </Label>
                                        <Textarea
                                            id="observacion"
                                            placeholder="Ingrese una observación (opcional)"
                                            value={formData.observacion}
                                            onChange={(e) =>
                                                handleInputChange(
                                                    'observacion',
                                                    e.target.value,
                                                )
                                            }
                                            rows={3}
                                        />
                                    </div>

                                    <DialogFooter>
                                        <Button
                                            type="button"
                                            variant="outline"
                                            onClick={() =>
                                                setIsCreateDialogOpen(false)
                                            }
                                        >
                                            Cancelar
                                        </Button>
                                        <Button
                                            type="submit"
                                            disabled={
                                                !formData.orp_id ||
                                                !formData.tipo ||
                                                !formData.cantidad
                                            }
                                        >
                                            <Plus className="mr-2 h-4 w-4" />
                                            Registrar Conteo
                                        </Button>
                                    </DialogFooter>
                                </form>
                            </DialogContent>
                        </Dialog>

                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setShowFilters(!showFilters)}
                            className="flex items-center gap-2"
                        >
                            <Filter className="h-4 w-4" />
                            <span className="hidden sm:inline">Filtros</span>
                            {hasActiveFilters && (
                                <span className="flex h-5 w-5 items-center justify-center rounded-full bg-primary text-xs text-primary-foreground">
                                    !
                                </span>
                            )}
                        </Button>
                    </div>
                </div>

                {/* Diálogo para crear conteo para ORP específico */}
                <Dialog
                    open={isCreateForOrpDialogOpen}
                    onOpenChange={setIsCreateForOrpDialogOpen}
                >
                    <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                        <DialogHeader>
                            <DialogTitle>Agregar Conteo</DialogTitle>
                            <DialogDescription>
                                Agregar un nuevo conteo para el ORP:{' '}
                                <span className="font-semibold">
                                    {selectedOrpForCreate?.codigo}
                                </span>
                            </DialogDescription>
                        </DialogHeader>

                        <form
                            onSubmit={handleSubmitForOrp}
                            className="space-y-6"
                        >
                            {/* Información del ORP seleccionado */}
                            <div className="rounded-lg border bg-muted/30 p-4">
                                <div className="space-y-2">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <h3 className="font-semibold">
                                                {selectedOrpForCreate?.codigo}
                                            </h3>
                                            <p className="text-sm text-muted-foreground">
                                                {selectedOrpForCreate
                                                    ?.producto_terminado
                                                    ?.nombre_sap ||
                                                    'Sin producto'}
                                            </p>
                                        </div>
                                        <Badge variant="secondary">
                                            {selectedOrpForCreate?.estado
                                                ?.nombre || 'N/A'}
                                        </Badge>
                                    </div>
                                    <p className="text-sm">
                                        Conteos existentes:{' '}
                                        <span className="font-medium">
                                            {groupedConteos[
                                                selectedOrpForCreate?.codigo
                                            ]?.conteos.length || 0}
                                        </span>
                                    </p>
                                    <p className="text-sm">
                                        Cantidad total:{' '}
                                        <span className="font-medium">
                                            {groupedConteos[
                                                selectedOrpForCreate?.codigo
                                            ]?.totalCantidad.toLocaleString() ||
                                                0}
                                        </span>
                                    </p>
                                </div>
                            </div>

                            {/* Tipo de Conteo */}
                            <div className="space-y-3">
                                <Label htmlFor="tipo-orp">
                                    Tipo de Conteo *
                                </Label>
                                <FilterSelect
                                    value={formDataForOrp.tipo}
                                    onChange={(v) =>
                                        handleInputChangeForOrp('tipo', v)
                                    }
                                    placeholder="Seleccionar tipo"
                                    options={TIPOS_CONTEOS}
                                />
                            </div>

                            {/* Cantidad */}
                            <div className="space-y-3">
                                <Label htmlFor="cantidad-orp">Cantidad *</Label>
                                <Input
                                    id="cantidad-orp"
                                    type="number"
                                    step="0.01"
                                    placeholder="Ingrese la cantidad"
                                    value={formDataForOrp.cantidad}
                                    onChange={(e) =>
                                        handleInputChangeForOrp(
                                            'cantidad',
                                            e.target.value,
                                        )
                                    }
                                    required
                                />
                            </div>

                            {/* Ubicación */}
                            <div className="space-y-3">
                                <Label htmlFor="ubicacion-orp">Ubicación</Label>
                                <Input
                                    id="ubicacion-orp"
                                    placeholder="Ingrese la ubicación"
                                    value={formDataForOrp.ubicacion}
                                    onChange={(e) =>
                                        handleInputChangeForOrp(
                                            'ubicacion',
                                            e.target.value,
                                        )
                                    }
                                />
                            </div>

                            {/* Observación */}
                            <div className="space-y-3">
                                <Label htmlFor="observacion-orp">
                                    Observación
                                </Label>
                                <Textarea
                                    id="observacion-orp"
                                    placeholder="Ingrese una observación (opcional)"
                                    value={formDataForOrp.observacion}
                                    onChange={(e) =>
                                        handleInputChangeForOrp(
                                            'observacion',
                                            e.target.value,
                                        )
                                    }
                                    rows={3}
                                />
                            </div>

                            <DialogFooter>
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={() =>
                                        setIsCreateForOrpDialogOpen(false)
                                    }
                                >
                                    Cancelar
                                </Button>
                                <Button
                                    type="submit"
                                    disabled={
                                        !formDataForOrp.tipo ||
                                        !formDataForOrp.cantidad
                                    }
                                >
                                    <Plus className="mr-2 h-4 w-4" />
                                    Agregar Conteo
                                </Button>
                            </DialogFooter>
                        </form>
                    </DialogContent>
                </Dialog>

                <Dialog
                    open={isEditDialogOpen}
                    onOpenChange={setIsEditDialogOpen}
                >
                    <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                        <DialogHeader>
                            <DialogTitle>Editar Conteo</DialogTitle>
                            <DialogDescription>
                                Editar conteo para el ORP:{' '}
                                <span className="font-semibold">
                                    {conteoAEditar?.orp?.codigo}
                                </span>
                            </DialogDescription>
                        </DialogHeader>

                        <form onSubmit={handleEditSubmit} className="space-y-6">
                            {/* Información del conteo */}
                            <div className="rounded-lg border bg-muted/30 p-4">
                                <div className="space-y-2">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <h3 className="font-semibold">
                                                Conteo ID: {conteoAEditar?.id}
                                            </h3>
                                            <p className="text-sm text-muted-foreground">
                                                Registrado:{' '}
                                                {conteoAEditar?.tiempo
                                                    ? new Date(
                                                          conteoAEditar.tiempo,
                                                      ).toLocaleString()
                                                    : 'N/A'}
                                            </p>
                                        </div>
                                        <Badge variant="secondary">
                                            Estado:{' '}
                                            {conteoAEditar?.estado?.nombre ||
                                                'N/A'}
                                        </Badge>
                                    </div>
                                </div>
                            </div>

                            {/* Tipo de Conteo */}
                            <div className="space-y-3">
                                <Label htmlFor="edit-tipo">
                                    Tipo de Conteo *
                                </Label>
                                <FilterSelect
                                    value={editFormData.tipo}
                                    onChange={(v) =>
                                        setEditFormData((prev) => ({
                                            ...prev,
                                            tipo: v,
                                        }))
                                    }
                                    placeholder="Seleccionar tipo"
                                    options={TIPOS_CONTEOS}
                                />
                            </div>

                            {/* Cantidad */}
                            <div className="space-y-3">
                                <Label htmlFor="edit-cantidad">
                                    Cantidad *
                                </Label>
                                <Input
                                    id="edit-cantidad"
                                    type="number"
                                    step="0.01"
                                    placeholder="Ingrese la cantidad"
                                    value={editFormData.cantidad}
                                    onChange={(e) =>
                                        setEditFormData((prev) => ({
                                            ...prev,
                                            cantidad: e.target.value,
                                        }))
                                    }
                                    required
                                />
                            </div>

                            {/* Ubicación */}
                            <div className="space-y-3">
                                <Label htmlFor="edit-ubicacion">
                                    Ubicación
                                </Label>
                                <Input
                                    id="edit-ubicacion"
                                    placeholder="Ingrese la ubicación"
                                    value={editFormData.ubicacion}
                                    onChange={(e) =>
                                        setEditFormData((prev) => ({
                                            ...prev,
                                            ubicacion: e.target.value,
                                        }))
                                    }
                                />
                            </div>

                            {/* Observación */}
                            <div className="space-y-3">
                                <Label htmlFor="edit-observacion">
                                    Observación
                                </Label>
                                <Textarea
                                    id="edit-observacion"
                                    placeholder="Ingrese una observación (opcional)"
                                    value={editFormData.observacion}
                                    onChange={(e) =>
                                        setEditFormData((prev) => ({
                                            ...prev,
                                            observacion: e.target.value,
                                        }))
                                    }
                                    rows={3}
                                />
                            </div>

                            <DialogFooter>
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={() => setIsEditDialogOpen(false)}
                                >
                                    Cancelar
                                </Button>
                                <Button
                                    type="submit"
                                    disabled={
                                        !editFormData.tipo ||
                                        !editFormData.cantidad
                                    }
                                >
                                    <Pencil className="mr-2 h-4 w-4" />
                                    Guardar Cambios
                                </Button>
                            </DialogFooter>
                        </form>
                    </DialogContent>
                </Dialog>

                {/* Filtros Avanzados */}
                {showFilters && (
                    <div className="rounded-lg border border-border bg-muted/50 p-4">
                        <div className="mb-4 flex items-center justify-between">
                            <h3 className="text-sm font-semibold">
                                Filtros Avanzados
                            </h3>
                            {hasActiveFilters && (
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={resetFilters}
                                    className="h-8 text-xs"
                                >
                                    <X className="mr-1 h-3 w-3" />
                                    Limpiar Filtros
                                </Button>
                            )}
                        </div>

                        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                            <FilterSelect
    value={filters.orp}
    onChange={(v) => updateFilter('orp', v)}
    placeholder="ORP"
    options={all_orps.map((o) => ({    // <--- Usar all_orps
        value: o.codigo,
        label: `${o.codigo} - ${o.producto_terminado?.nombre_sap || ''}`,
    }))}
/>

                            {/* <FilterSelect
                                value={filters.estado}
                                onChange={(v) => updateFilter('estado', v)}
                                placeholder="Estado"
                                options={estados.map((e) => ({
                                    value: e.nombre,
                                    label: e.nombre,
                                }))}
                            /> */}

                            <FilterSelect
                                value={filters.usuario}
                                onChange={(v) => updateFilter('usuario', v)}
                                placeholder="Usuario"
                                options={usuarios.map((u) => ({
                                    value: u.name,
                                    label: u.name,
                                }))}
                            />

                            {/* <FilterSelect
                                value={filters.tipo}
                                onChange={(v) => updateFilter('tipo', v)}
                                placeholder="Tipo"
                                options={tipos.map((t) => ({
                                    value: t,
                                    label: t,
                                }))}
                            /> */}

                            {/* Filtro de ubicación como input normal */}
                            {/* <div className="space-y-2">
                                <label className="text-xs font-medium">
                                    Ubicación
                                </label>
                                <Input
                                    placeholder="Ubicación"
                                    value={filters.ubicacion || ''}
                                    onChange={(e) =>
                                        updateFilter(
                                            'ubicacion',
                                            e.target.value,
                                        )
                                    }
                                    className="h-9"
                                />
                            </div> */}

                            {/* <div className="space-y-2">
                                <label className="text-xs font-medium">
                                    Cantidad
                                </label>
                                <div className="flex gap-2">
                                    <Input
                                        type="number"
                                        placeholder="Mín"
                                        value={filters.cantidad_min}
                                        onChange={(e) =>
                                            updateFilter(
                                                'cantidad_min',
                                                e.target.value,
                                            )
                                        }
                                        className="h-9"
                                    />
                                    <Input
                                        type="number"
                                        placeholder="Máx"
                                        value={filters.cantidad_max}
                                        onChange={(e) =>
                                            updateFilter(
                                                'cantidad_max',
                                                e.target.value,
                                            )
                                        }
                                        className="h-9"
                                    />
                                </div>
                            </div> */}

                            {/* <div className="space-y-2">
                                <label className="text-xs font-medium">
                                    Fecha
                                </label>
                                <div className="flex gap-2">
                                    <Input
                                        type="date"
                                        placeholder="Desde"
                                        value={filters.fecha_desde}
                                        onChange={(e) =>
                                            updateFilter(
                                                'fecha_desde',
                                                e.target.value,
                                            )
                                        }
                                        className="h-9"
                                    />
                                    <Input
                                        type="date"
                                        placeholder="Hasta"
                                        value={filters.fecha_hasta}
                                        onChange={(e) =>
                                            updateFilter(
                                                'fecha_hasta',
                                                e.target.value,
                                            )
                                        }
                                        className="h-9"
                                    />
                                </div>
                            </div> */}

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

                {/* Tabla de Conteos Agrupados */}
                <div className="overflow-hidden rounded-lg border bg-background shadow-sm">
                    <div className="overflow-x-auto">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead className="w-10"></TableHead>
                                    <TableHead>ORP</TableHead>
                                    <TableHead>Producto</TableHead>
                                    <TableHead>Lotes</TableHead>
                                    <TableHead>Cantidad Tentativa</TableHead>
                                    <TableHead>Cantidad </TableHead>
                                    <TableHead>Estado </TableHead>
                                    <TableHead className="w-32">
                                        Acciones
                                    </TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {sortedGroups.length === 0 ? (
                                    <TableRow>
                                        <TableCell
                                            colSpan={8}
                                            className="py-8 text-center"
                                        >
                                            No se encontraron conteos
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    sortedGroups.map(([orpCodigo, group]) => (
                                        <>
                                            {/* Fila de grupo (resumen) */}
                                            <TableRow
                                                key={`group-${orpCodigo}`}
                                                className="cursor-pointer bg-muted/30 hover:bg-muted/50"
                                            >
                                                <TableCell
                                                    onClick={() =>
                                                        toggleGroup(orpCodigo)
                                                    }
                                                >
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        className="h-6 w-6"
                                                    >
                                                        {group.expanded ? (
                                                            <ChevronDown className="h-4 w-4" />
                                                        ) : (
                                                            <ChevronRight className="h-4 w-4" />
                                                        )}
                                                    </Button>
                                                </TableCell>
                                                <TableCell
                                                    className="font-semibold"
                                                    onClick={() =>
                                                        toggleGroup(orpCodigo)
                                                    }
                                                >
                                                    <div className="flex items-center gap-2">
                                                        <span>{orpCodigo}</span>
                                                    </div>
                                                </TableCell>
                                                <TableCell
                                                    onClick={() =>
                                                        toggleGroup(orpCodigo)
                                                    }
                                                >
                                                    <TooltipProvider>
                                                        <Tooltip>
                                                            <TooltipTrigger
                                                                asChild
                                                            >
                                                                <div className="max-w-[200px] truncate">
                                                                    {group.orp
                                                                        ?.producto_terminado
                                                                        ?.nombre_sap ||
                                                                        'N/A'}
                                                                </div>
                                                            </TooltipTrigger>
                                                            <TooltipContent>
                                                                <p>
                                                                    {group.orp
                                                                        ?.producto_terminado
                                                                        ?.nombre_sap ||
                                                                        'N/A'}
                                                                </p>
                                                            </TooltipContent>
                                                        </Tooltip>
                                                    </TooltipProvider>
                                                </TableCell>
                                                <TableCell
                                                    onClick={() =>
                                                        toggleGroup(orpCodigo)
                                                    }
                                                >
                                                    <span className="font-medium">
                                                        {group.orp?.lote ||
                                                            'N/A'}
                                                    </span>
                                                </TableCell>
                                                <TableCell
                                                    onClick={() =>
                                                        toggleGroup(orpCodigo)
                                                    }
                                                >
                                                    <span className="font-bold text-primary">
                                                        {group.orp
                                                            ?.cantidad_programada ||
                                                            'N/A'}
                                                    </span>
                                                </TableCell>
                                                <TableCell
                                                    onClick={() =>
                                                        toggleGroup(orpCodigo)
                                                    }
                                                >
                                                    <div className="flex flex-col">
                                                        <span
                                                            className={`font-bold ${group.totalPorTurnoCantidad > 0 ? 'text-green-600' : 'text-gray-400'}`}
                                                        >
                                                            {group.totalPorTurnoCantidad.toLocaleString()}
                                                        </span>
                                                    </div>
                                                </TableCell>
                                                <TableCell
                                                    onClick={() =>
                                                        toggleGroup(orpCodigo)
                                                    }
                                                >
                                                    {group.tieneTotal ? (
                                                        <Badge
                                                            variant="default"
                                                            className="bg-green-500 hover:bg-green-600"
                                                        >
                                                            {group.totalEstado}
                                                        </Badge>
                                                    ) : (
                                                        <Badge
                                                            variant="outline"
                                                            className="border-amber-500 text-amber-600"
                                                        >
                                                            En Proceso
                                                        </Badge>
                                                    )}
                                                </TableCell>
                                                {/* Acciones */}
                                                <TableCell>
                                                    <div className="flex gap-1">
                                                        {!group.tieneTotal &&
                                                            hasPermission(
                                                                'c_conteos',
                                                            ) && (
                                                                <TooltipProvider>
                                                                    <Tooltip>
                                                                        <TooltipTrigger
                                                                            asChild
                                                                        >
                                                                            <Button
                                                                                variant="ghost"
                                                                                size="icon"
                                                                                className="h-8 w-8"
                                                                                onClick={(
                                                                                    e,
                                                                                ) => {
                                                                                    e.stopPropagation();
                                                                                    openCreateForOrpDialog(
                                                                                        group,
                                                                                    );
                                                                                }}
                                                                            >
                                                                                <Plus className="h-4 w-4" />
                                                                            </Button>
                                                                        </TooltipTrigger>
                                                                        <TooltipContent>
                                                                            <p>
                                                                                Agregar
                                                                                conteo
                                                                                para{' '}
                                                                                {
                                                                                    orpCodigo
                                                                                }
                                                                            </p>
                                                                        </TooltipContent>
                                                                    </Tooltip>
                                                                </TooltipProvider>
                                                            )}
                                                        {/* Botón "T" - SOLO aparece si hay Total por Turno y NO tiene Total */}
                                                        {group.totalPorTurnoCantidad >
                                                            0 &&
                                                            !group.tieneTotal &&
                                                            hasPermission(
                                                                'c_conteos',
                                                            ) && (
                                                                <TooltipProvider>
                                                                    <Tooltip>
                                                                        <TooltipTrigger
                                                                            asChild
                                                                        >
                                                                            <Button
                                                                                variant="default"
                                                                                size="icon"
                                                                                className="h-8 w-8 bg-blue-600 hover:bg-blue-700"
                                                                                onClick={(
                                                                                    e,
                                                                                ) =>
                                                                                    crearTotalAutomatico(
                                                                                        group,
                                                                                        e,
                                                                                    )
                                                                                }
                                                                            >
                                                                                <span className="text-xs font-bold">
                                                                                    T
                                                                                </span>
                                                                            </Button>
                                                                        </TooltipTrigger>
                                                                        <TooltipContent>
                                                                            <p>
                                                                                Crear
                                                                                Total
                                                                                de{' '}
                                                                                {group.totalPorTurnoCantidad.toLocaleString()}
                                                                            </p>
                                                                        </TooltipContent>
                                                                    </Tooltip>
                                                                </TooltipProvider>
                                                            )}

                                                        {/* Si ya tiene Total, NO mostrar botón "T" */}
                                                        {/* Si no hay Total por Turno, NO mostrar botón "T" */}
                                                    </div>
                                                </TableCell>
                                            </TableRow>

                                            {/* Filas detalladas (expandidas) */}
                                            {group.expanded && (
                                                <>
                                                    {group.conteos.map(
                                                        (conteo) => (
                                                            <TableRow
                                                                key={`detail-${conteo.id}`}
                                                                className={`hover:bg-muted/20 ${
                                                                    conteo.tipo ===
                                                                    'Total'
                                                                        ? 'bg-muted/10'
                                                                        : 'bg-muted/10'
                                                                }`}
                                                            >
                                                                <TableCell></TableCell>
                                                                <TableCell></TableCell>
                                                                <TableCell>
                                                                    <div className="flex items-center gap-2">
                                                                        <span className="text-sm text-muted-foreground">
                                                                            <FechaHora
                                                                                value={
                                                                                    conteo.tiempo
                                                                                }
                                                                                mode="stacked"
                                                                            />
                                                                        </span>
                                                                    </div>
                                                                </TableCell>

                                                                <TableCell>
                                                                    <Badge
                                                                        variant="outline"
                                                                        className="text-xs"
                                                                    >
                                                                        {conteo.tipo ||
                                                                            '-'}
                                                                    </Badge>
                                                                </TableCell>

                                                                <TableCell>
                                                                    {conteo.ubicacion && (
                                                                        <div>
                                                                            <strong>
                                                                                Ubicación:{' '}
                                                                            </strong>
                                                                            {
                                                                                conteo.ubicacion
                                                                            }
                                                                        </div>
                                                                    )}

                                                                    {conteo.observacion && (
                                                                        <div>
                                                                            <strong>
                                                                                Observaciones:{' '}
                                                                            </strong>
                                                                            {
                                                                                conteo.observacion
                                                                            }
                                                                        </div>
                                                                    )}
                                                                </TableCell>
                                                                <TableCell>
                                                                    {
                                                                        conteo.cantidad
                                                                    }
                                                                </TableCell>
                                                                <TableCell>
                                                                    <div className="text-sm">
                                                                        {conteo
                                                                            .user
                                                                            ?.name ||
                                                                            '-'}
                                                                    </div>
                                                                    <div className="text-xs text-muted-foreground">
                                                                        {conteo
                                                                            .user
                                                                            ?.apellido ||
                                                                            '-'}
                                                                    </div>
                                                                </TableCell>
                                                                <TableCell>
                                                                    {/* NUEVOS BOTONES DE EDICIÓN Y ELIMINACIÓN */}
                                                                    <div className="flex justify-end gap-1">
                                                                        <TooltipProvider>
                                                                            <Tooltip>
                                                                                <TooltipTrigger
                                                                                    asChild
                                                                                >
                                                                                    {canDo(
                                                                                        conteo,
                                                                                        'u_conteos',
                                                                                        8,
                                                                                        true,
                                                                                        false,
                                                                                        false,
                                                                                    ) && (
                                                                                        <Button
                                                                                            variant="ghost"
                                                                                            size="icon"
                                                                                            className="h-7 w-7"
                                                                                            onClick={() =>
                                                                                                abrirEditarConteo(
                                                                                                    conteo,
                                                                                                )
                                                                                            }
                                                                                        >
                                                                                            <Pencil className="h-3.5 w-3.5" />
                                                                                        </Button>
                                                                                    )}
                                                                                </TooltipTrigger>
                                                                                <TooltipContent>
                                                                                    <p>
                                                                                        Editar
                                                                                        conteo
                                                                                    </p>
                                                                                </TooltipContent>
                                                                            </Tooltip>
                                                                        </TooltipProvider>

                                                                        <TooltipProvider>
                                                                            <Tooltip>
                                                                                <TooltipTrigger
                                                                                    asChild
                                                                                >
                                                                                    {canDo(
                                                                                        conteo,
                                                                                        'd_conteos',
                                                                                        8,
                                                                                        true,
                                                                                        false,
                                                                                        false,
                                                                                    ) && (
                                                                                        <Button
                                                                                            variant="ghost"
                                                                                            size="icon"
                                                                                            className="h-7 w-7 text-red-600 hover:bg-red-50 hover:text-red-700"
                                                                                            onClick={() =>
                                                                                                eliminarConteo(
                                                                                                    conteo.id,
                                                                                                    conteo.tipo,
                                                                                                    group
                                                                                                        .orp
                                                                                                        ?.codigo,
                                                                                                )
                                                                                            }
                                                                                        >
                                                                                            <Trash2 className="h-3.5 w-3.5" />
                                                                                        </Button>
                                                                                    )}
                                                                                </TooltipTrigger>
                                                                                <TooltipContent>
                                                                                    <p>
                                                                                        Eliminar
                                                                                        conteo
                                                                                    </p>
                                                                                </TooltipContent>
                                                                            </Tooltip>
                                                                        </TooltipProvider>
                                                                    </div>
                                                                </TableCell>
                                                            </TableRow>
                                                        ),
                                                    )}
                                                </>
                                            )}
                                        </>
                                    ))
                                )}
                            </TableBody>
                        </Table>
                    </div>

                    {conteos.data.length > 0 && (
                        <div className="border-t px-4 py-3">
                            <TablePagination
                                pagination={conteos}
                                onPageChange={(page) =>
                                    router.get(
                                        route('conteos.index'),
                                        { ...filters, page },
                                        { preserveState: true, replace: true },
                                    )
                                }
                            />
                        </div>
                    )}
                </div>

                <div className="flex items-center justify-between text-sm text-muted-foreground">
                    <div>
                        {conteos.total} {conteos.total === 1 ? 'ORP' : 'ORPs'}{' '}

                    </div>
                    <div className="flex items-center gap-4">
                        <div className="flex items-center gap-2">
                            {/* <div className="h-3 w-3 rounded-full bg-green-500"></div>
                            <span>Total General</span> */}
                        </div>
                        <div className="flex items-center gap-2">
                            {/* <div className="h-3 w-3 rounded-full bg-blue-500"></div>
                            <span>Total por Turno</span> */}
                        </div>
                        <div>{total_conteos} conteos registrados</div>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
