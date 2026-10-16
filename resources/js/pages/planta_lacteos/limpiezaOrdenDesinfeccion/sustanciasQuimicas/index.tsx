import { Button } from '@/components/ui/button';
import FechaHora from '@/components/ui/fecha-hora';
import FilterSelect from '@/components/ui/filter-select';
import { Input } from '@/components/ui/input';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Toast } from '@/components/ui/toast';
import { useAdvancedFilters } from '@/hooks/use-advanced-filters';
import { useAuth } from '@/hooks/useAuth';
import AppLayout from '@/layouts/app-layout';
import ReporteKardexSustancias from '@/pdf/ReporteKardexSustancias';
import { type BreadcrumbItem } from '@/types';
import { Head, router, usePage } from '@inertiajs/react';
import { PDFViewer } from '@react-pdf/renderer';
import {
    CheckCircle, // Para pendiente
    Filter,
    Milk,
    MoreHorizontal, // Para rechazar
    Package,
    Printer,
    Search,
    Trash2,
    X, // Para aceptar
    XCircle,
} from 'lucide-react';
import { useState } from 'react';
import { route } from 'ziggy-js';

import {
    Dialog,
    DialogContent,
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
import TablePagination from '@/components/ui/table-pagination';
import { useInitials } from '@/hooks/use-initials';
const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Movimientos de Sustancias Químicas',
        href: '/planta-lacteos/sustancias-quimicas',
    },
];

interface PageProps {
    movimientos: {
        data: any[];
        links: any[];
        current_page: number;
        last_page: number;
        per_page: number;
        total: number;
    };
    filters: {
        search?: string;
        user_id?: number;
        sustancia_id?: number;
        autorizante_id?: number;
        entregante_id?: number;
        tiempo?: string;
        tipo?: string;
        fecha_entrega?: string;
        estado_id?: number;
        per_page?: number;
    };
    users?: { id: number; name: string; apellido: string }[];
    autorizantes?: { id: number; name: string; apellido: string }[];
    entregantes?: { id: number; name: string; apellido: string }[];
    sustancias?: { id: number; nombre: string }[];
    estados?: { id: number; nombre: string }[];
    flash: {
        success?: string;
        error?: string;
    };
}

export default function Index() {
    const { props } = usePage();
    const [showFilters, setShowFilters] = useState(false);
    const [sustanciaPdf, setSustanciaPdf] = useState<any>(null);
    const [usuariosPdf, setUsuariosPdf] = useState<any[]>([]);
    const [activeTab, setActiveTab] = useState('stock'); // Estado para controlar la pestaña activa
    // Estados para manejar los botones e inputs
    const [editingProductId, setEditingProductId] = useState<number | null>(
        null,
    );
    const [requestingProductId, setRequestingProductId] = useState<
        number | null
    >(null);
    const [stockQuantity, setStockQuantity] = useState<string>('');
    const [requestQuantity, setRequestQuantity] = useState<string>('');
    const [actionType, setActionType] = useState<
        'ingresar' | 'solicitar' | null
    >(null);

    const renderBool = (value: number | null | undefined) => {
        if (value === null || value === undefined) return '-';
        return value > 0 ? (
            <span className="font-bold text-green-600">Ingreso</span>
        ) : (
            <span className="font-bold text-red-600">Egreso</span>
        );
    };

    const renderEstado = (estadoNombre: string | undefined) => {
        if (!estadoNombre) return '-';

        let colorClasses = 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400';

        const lowerNombre = estadoNombre.toLowerCase();
        if (lowerNombre === 'pendiente') {
            colorClasses = 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400';
        } else if (lowerNombre === 'autorizado' || lowerNombre === 'aceptado') {
            colorClasses = 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-500';
        } else if (lowerNombre === 'entregado') {
            colorClasses = 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400';
        }

        return (
            <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${colorClasses}`}>
                {estadoNombre}
            </span>
        );
    };

    const {
        hasPermission,
        belongsToUbicacion,
        canDo,
        isAdmin,
        user: authUser,
    } = useAuth();

    const {
        movimientos = {
            data: [],
            links: [],
            current_page: 1,
            last_page: 1,
            per_page: 10,
            total: 0,
        },
        filters: initialFilters = {},
        users = [],
        sustancias = [],
        autorizantes = [],
        entregantes = [],
        estados = [],
        flash,
    } = props as unknown as PageProps;

    const { filters, updateFilter, resetFilters } = useAdvancedFilters({
        routeName: 'sustancias-quimicas.index',
        initialFilters: {
            search: initialFilters.search || '',
            user_id: initialFilters.user_id?.toString() || undefined,
            sustancia_id: initialFilters.sustancia_id?.toString() || undefined,
            tiempo: initialFilters.tiempo || '',
            entregante_id:
                initialFilters.entregante_id?.toString() || undefined,
            estado_id: initialFilters.estado_id?.toString() || undefined,
            autorizante_id:
                initialFilters.autorizante_id?.toString() || undefined,
            per_page: initialFilters.per_page?.toString() || '10',
        },
        debounceFields: ['search'],
        debounceDelay: 600,
    });

    const hasActiveFilters = Object.values(filters).some(
        (value) => value && value !== '' && value !== '10',
    );

    const [isEntregaDialogOpen, setIsEntregaDialogOpen] = useState(false);
    const [movimientoParaEntregar, setMovimientoParaEntregar] =
        useState<any>(null);
    const [cantidadEntregada, setCantidadEntregada] = useState<any>('');

    const [dialogOpen, setDialogOpen] = useState(false);
    const [selectedRecepcion, setSelectedRecepcion] = useState<any>(null);

    const handleEdit = (id: number) => {
        router.visit(route('movimientos-sustancias.edit', id));
    };

    // Estados para el PDF
    const [fechaDesde, setFechaDesde] = useState<string>('');
    const [fechaHasta, setFechaHasta] = useState<string>('');
    const [sustanciaId, setSustanciaId] = useState<string>('');
    const [datosPdf, setDatosPdf] = useState<any[]>([]);
    const [mostrarPdf, setMostrarPdf] = useState(false);
    const [generandoPdf, setGenerandoPdf] = useState(false);

    // URL del endpoint (debes crear la ruta en routes/web.php)
    const urlPdf = route('movimientos-sustancia.pdf');

    // Función para obtener datos y mostrar el PDF
    const handleMostrarPdf = async () => {
    if (!fechaDesde || !fechaHasta) {
        alert('Por favor selecciona ambas fechas');
        return;
    }
    if (!sustanciaId) {
        alert('Por favor selecciona una sustancia');
        return;
    }

    setGenerandoPdf(true);
    try {
        const params = new URLSearchParams();
        params.append('fecha_desde', fechaDesde);
        params.append('fecha_hasta', fechaHasta);
        params.append('sustancia_id', sustanciaId);

        const response = await fetch(`${urlPdf}?${params.toString()}`);
        if (!response.ok) throw new Error('Error al obtener los datos');

        const data = await response.json();

        const sustanciaSeleccionada = sustancias.find(
            (s: any) => s.id.toString() === sustanciaId
        );

        // Transformar movimientos
        const datosTransformados = data.movimientos.map((mov: any) => ({
            fecha: mov.tiempo,
            tipo: mov.tipo ? 'Ingreso' : 'Egreso',
            cantidad: mov.cantidad,
            saldo: mov.saldo,                  // ✅ usar el saldo del modelo
            responsable: `${mov.user?.name || ''} ${mov.user?.apellido || ''}`,
            codigo_responsable: mov.user?.codigo || '',
            autorizante: `${mov.autorizante?.name || ''} ${mov.autorizante?.apellido || ''}`,
            codigo_autorizante: mov.autorizante?.codigo || '',
            entregante: `${mov.entregante?.name || ''} ${mov.entregante?.apellido || ''}`,
            codigo_entregante: mov.entregante?.codigo || '',
            observacion: mov.observacion || '-',
            estado: mov.estado?.nombre || '-',
            sustancia: mov.sustancia?.nombre || '-',
            unidad: mov.sustancia?.unidad?.abreviatura || '',
        }));

        if (datosTransformados.length === 0) {
            alert('No hay movimientos entregados para los filtros seleccionados');
            return;
        }

        setDatosPdf(datosTransformados);
        setSustanciaPdf(sustanciaSeleccionada);
        setUsuariosPdf(data.usuarios_involucrados || []);
        setMostrarPdf(true);
    } catch (error) {
        console.error('Error al generar PDF:', error);

        alert('Error al generar el reporte. Por favor, intenta de nuevo.');
    } finally {
        setGenerandoPdf(false);
    }
};

    const handleDelete = (id: number) => {
        if (confirm('¿Está seguro de eliminar esta recepción de leche?')) {
            router.delete(route('movimientos-sustancias.destroy', id), {
                preserveScroll: true,
            });
        }
    };

    // Funciones para manejar los botones de stock
    const handleStartIngresarStock = (productId: number) => {
        setEditingProductId(productId);
        setActionType('ingresar');
        setStockQuantity(''); // Vacío para que el usuario ingrese la cantidad
    };

    const handleStartSolicitar = (productId: number) => {
        setRequestingProductId(productId);
        setActionType('solicitar');
        setRequestQuantity('');
    };

    const handleCancelAction = () => {
        setEditingProductId(null);
        setRequestingProductId(null);
        setActionType(null);
        setStockQuantity('');
        setRequestQuantity('');
    };

    const handleSaveStock = (productId: number) => {
        // Validar que se haya ingresado una cantidad
        if (!stockQuantity || parseFloat(stockQuantity) <= 0) {
            alert('Por favor ingrese una cantidad válida');
            return;
        }

        // Enviar la solicitud al backend
        router.post(
            route('sustancias-quimicas.ingresar-stock'),
            {
                sustancia_id: productId,
                cantidad: parseFloat(stockQuantity),
                // observacion: `Ingreso de stock desde panel - ${new Date().toLocaleString()}`,
            },
            {
                preserveScroll: true,
                onSuccess: () => {
                    handleCancelAction();
                    // La página se recargará automáticamente con Inertia
                },
                onError: (errors) => {
                    console.error('Error al guardar stock:', errors);
                    alert(
                        'Error al guardar el stock. Por favor intente nuevamente.',
                    );
                },
            },
        );
    };

    const handleSubmitRequest = (productId: number) => {
        // Validar que se haya ingresado una cantidad
        if (!requestQuantity || parseFloat(requestQuantity) <= 0) {
            alert('Por favor ingrese una cantidad válida');
            return;
        }

        // Enviar la solicitud al backend
        router.post(
            route('sustancias-quimicas.solicitar-sustancia'),
            {
                sustancia_id: productId,
                cantidad: parseFloat(requestQuantity),
                observacion: `Solicitud de sustancia desde panel - ${new Date().toLocaleString()}`,
            },
            {
                preserveScroll: true,
                onSuccess: () => {
                    handleCancelAction();
                    // La página se recargará automáticamente con Inertia
                },
                onError: (errors) => {
                    console.error('Error al enviar solicitud:', errors);
                    alert(
                        'Error al enviar la solicitud. Por favor intente nuevamente.',
                    );
                },
            },
        );
    };

    const handleAceptarMovimiento = (id: number) => {
        if (confirm('¿Está seguro de aceptar este movimiento?')) {
            router.post(
                route('movimientos-sustancias.aceptar', id),
                {},
                {
                    preserveScroll: true,
                    onSuccess: () => {
                        // La página se recargará automáticamente con Inertia
                    },
                    onError: (errors) => {
                        console.error('Error al aceptar movimiento:', errors);
                        alert(
                            'Error al aceptar el movimiento. Por favor intente nuevamente.',
                        );
                    },
                },
            );
        }
    };

    const handleRechazarMovimiento = (id: number) => {
        if (confirm('¿Está seguro de rechazar este movimiento?')) {
            router.post(
                route('movimientos-sustancias.rechazar', id),
                {},
                {
                    preserveScroll: true,
                    onSuccess: () => {
                        // La página se recargará automáticamente con Inertia
                    },
                    onError: (errors) => {
                        console.error('Error al rechazar movimiento:', errors);
                        alert(
                            'Error al rechazar el movimiento. Por favor intente nuevamente.',
                        );
                    },
                },
            );
        }
    };

    const handleAbrirDialogEntrega = (movimiento: any) => {
        setMovimientoParaEntregar(movimiento);
        setCantidadEntregada(movimiento.cantidad);
        setIsEntregaDialogOpen(true);
    };

    const handleCerrarDialogEntrega = () => {
        setIsEntregaDialogOpen(false);
        setMovimientoParaEntregar(null);
        setCantidadEntregada('');
    };

    const handleConfirmarEntrega = () => {
        if (!cantidadEntregada || parseFloat(cantidadEntregada) < 0) {
            alert('Por favor ingrese una cantidad válida');
            return;
        }

        if (
            confirm(
                `¿Está seguro de entregar ${cantidadEntregada} ${movimientoParaEntregar?.sustancia?.unidad?.abreviatura} de ${movimientoParaEntregar?.sustancia?.nombre}?`,
            )
        ) {
            router.post(
                route(
                    'movimientos-sustancias.entregar',
                    movimientoParaEntregar.id,
                ),
                {
                    cantidad_entregada: parseFloat(cantidadEntregada),
                },
                {
                    preserveScroll: true,
                    onSuccess: () => {
                        handleCerrarDialogEntrega();
                    },
                    onError: (errors) => {
                        console.error('Error al entregar movimiento:', errors);
                        alert(
                            'Error al entregar el movimiento. Por favor intente nuevamente.',
                        );
                    },
                },
            );
        }
    };
    const getInitials = useInitials();

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="movimientos de Leche" />

            <Toast />

            <div className="space-y-2 px-2 py-2 sm:px-6">
                {/* Tabs para alternar entre Stock y Movimientos */}
                <Tabs
                    defaultValue="stock"
                    className="w-full"
                    onValueChange={setActiveTab}
                >
                    <div className="mb-4 flex items-center justify-between">
                        <TabsList>
                            <TabsTrigger value="stock">Stock</TabsTrigger>
                            <TabsTrigger value="movimientos">
                                Movimientos
                            </TabsTrigger>
                        </TabsList>

                        {/* Botón de Nueva Solicitud (solo visible en pestaña de movimientos) */}
                        {/* {activeTab === 'movimientos' && hasPermission('c_sustanciasQuimicas') && belongsToUbicacion('Lácteos') && (
                            <Link href={route('sustancias-quimicas.create')}>
                                <Button size="sm">
                                    <Plus className="h-4 w-4" />
                                    <p className="hidden md:block ml-2">Nueva Solicitud</p>
                                </Button>
                            </Link>
                        )} */}
                    </div>

                    {/* Contenido de la pestaña Stock */}
                    <TabsContent value="stock">
                        <div className="mb-4">
                            {/* Indicadores de scroll */}
                            <div className="mb-3 flex items-center justify-between">
                                <h3 className="text-lg font-semibold">
                                    Stock de Productos
                                </h3>
                                <div className="flex items-center text-sm text-muted-foreground">
                                    <span className="mr-2">
                                        Desliza para ver más →
                                    </span>
                                </div>
                            </div>

                            {/* Carrusel horizontal con 2 columnas */}
                            <div className="relative">
                                <div
                                    className="scrollbar-hide flex space-x-4 overflow-x-auto pb-4"
                                    style={{ height: '480px' }}
                                >
                                    {/* Crear columnas: cada columna tendrá 2 productos */}
                                    {(() => {
                                        const numColumns = Math.ceil(
                                            sustancias.length / 2,
                                        );

                                        // Función para renderizar una tarjeta de producto
                                        // Función para renderizar una tarjeta de producto
                                        const renderProductCard = (
                                            product: any,
                                        ) => {
                                            if (!product) return null;

                                            const stock =
                                                props.stock?.[product.id] ?? 0;
                                            const isIngresando =
                                                editingProductId ===
                                                    product.id &&
                                                actionType === 'ingresar';
                                            const isSolicitando =
                                                requestingProductId ===
                                                    product.id &&
                                                actionType === 'solicitar';
                                            const isInActionMode =
                                                isIngresando || isSolicitando;

                                            return (
                                                <div className="flex h-56 flex-col rounded-lg border bg-white p-3 shadow-sm transition-shadow duration-200 hover:shadow-md dark:border-neutral-800 dark:bg-neutral-950">
                                                    {/* Sección superior - Información del producto */}
                                                    <div className="flex flex-1 flex-col">
                                                        {/* Encabezado compacto */}
                                                        <div className="mb-1 flex items-start justify-between">
                                                            <h3 className="line-clamp-2 flex-1 pr-2 text-xs leading-tight font-semibold">
                                                                {product.nombre}
                                                            </h3>
                                                            <div
                                                                className={`flex-shrink-0 rounded px-2 py-0.5 text-[10px] font-medium ${
                                                                    stock < 1
                                                                        ? 'bg-red-100 text-red-800'
                                                                        : 'bg-green-100 text-green-800'
                                                                }`}
                                                            >
                                                                {stock < 1
                                                                    ? 'Bajo'
                                                                    : 'OK'}
                                                            </div>
                                                        </div>

                                                        {/* Stock actual - Se expande para ocupar espacio */}
                                                        {/* Stock actual - Se expande para ocupar espacio */}
                                                        <div className="flex flex-1 items-center">
                                                            <div>
                                                                <p className="mb-0.5 text-[10px] text-muted-foreground">
                                                                    Stock actual
                                                                </p>
                                                                <p
                                                                    className={`text-2xl font-bold ${
                                                                        (props
                                                                            .stockReal?.[
                                                                            product
                                                                                .id
                                                                        ] ??
                                                                            0) <
                                                                        1
                                                                            ? 'text-red-600'
                                                                            : 'text-green-600'
                                                                    }`}
                                                                >
                                                                    {(props
                                                                        .stockReal?.[
                                                                        product
                                                                            .id
                                                                    ] ?? 0) / 1}
                                                                    <span className="ml-1 text-sm font-normal">
                                                                        {
                                                                            product
                                                                                .unidad
                                                                                ?.abreviatura
                                                                        }
                                                                    </span>
                                                                </p>

                                                                {/* Nueva sección para mostrar el stock real */}
                                                                <div className="mt-1">
                                                                    <div className="flex items-center justify-between">
                                                                        <span className="text-[9px] text-muted-foreground">
                                                                            Reservado:
                                                                        </span>
                                                                        <span
                                                                            className={`text-[10px] font-medium ${
                                                                                Math.abs(
                                                                                    stock,
                                                                                ) >
                                                                                (props
                                                                                    .stockReal?.[
                                                                                    product
                                                                                        .id
                                                                                ] ||
                                                                                    0)
                                                                                    ? 'text-red-600'
                                                                                    : 'text-amber-600'
                                                                            }`}
                                                                        >
                                                                            {Math.abs(
                                                                                stock,
                                                                            ) >
                                                                            (props
                                                                                .stockReal?.[
                                                                                product
                                                                                    .id
                                                                            ] ||
                                                                                0)
                                                                                ? 'Excedente ⚠️'
                                                                                : Math.abs(
                                                                                      stock,
                                                                                  ) /
                                                                                      1 +
                                                                                  ' ' +
                                                                                  product
                                                                                      .unidad
                                                                                      ?.abreviatura}
                                                                        </span>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        </div>

                                                        {/* Información adicional - Solo código */}
                                                        <div className="border-t pt-1 text-[10px] text-muted-foreground">
                                                            <div className="flex justify-between">
                                                                <span>
                                                                    Código:
                                                                </span>
                                                                <span className="font-medium">
                                                                    {
                                                                        product.codigo
                                                                    }
                                                                </span>
                                                            </div>
                                                        </div>
                                                    </div>

                                                    {/* Sección inferior - Controles de acción */}
                                                    <div className="mt-2">
                                                        {/* Modo de acción (Ingresar o Solicitar) */}
                                                        {isIngresando && (
                                                            <div className="space-y-1.5">
                                                                <div>
                                                                    <label className="mb-0.5 block text-[10px] text-muted-foreground">
                                                                        Cantidad
                                                                        a
                                                                        ingresar
                                                                    </label>
                                                                    <div className="flex items-center gap-1.5">
                                                                        <Input
                                                                            type="number"
                                                                            min="0"
                                                                            step="0.01"
                                                                            value={
                                                                                stockQuantity
                                                                            }
                                                                            onChange={(
                                                                                e,
                                                                            ) =>
                                                                                setStockQuantity(
                                                                                    e
                                                                                        .target
                                                                                        .value,
                                                                                )
                                                                            }
                                                                            className="h-6 flex-1 text-xs"
                                                                            autoFocus
                                                                            placeholder="Cantidad"
                                                                        />
                                                                        <span className="text-[10px] whitespace-nowrap text-muted-foreground">
                                                                            {product
                                                                                .unidad
                                                                                ?.abreviatura ||
                                                                                '-'}
                                                                        </span>
                                                                    </div>
                                                                </div>
                                                                <div className="flex gap-1.5">
                                                                    <Button
                                                                        size="sm"
                                                                        className="h-6 flex-1 py-0 text-[10px]"
                                                                        onClick={() =>
                                                                            handleSaveStock(
                                                                                product.id,
                                                                            )
                                                                        }
                                                                    >
                                                                        Guardar
                                                                    </Button>
                                                                    <Button
                                                                        size="sm"
                                                                        variant="outline"
                                                                        className="h-6 flex-1 py-0 text-[10px]"
                                                                        onClick={
                                                                            handleCancelAction
                                                                        }
                                                                    >
                                                                        Cancelar
                                                                    </Button>
                                                                </div>
                                                            </div>
                                                        )}

                                                        {isSolicitando && (
                                                            <div className="space-y-1.5">
                                                                <div>
                                                                    <label className="mb-0.5 block text-[10px] text-muted-foreground">
                                                                        Cantidad
                                                                        a
                                                                        solicitar
                                                                    </label>
                                                                    <div className="flex items-center gap-1.5">
                                                                        <Input
                                                                            type="number"
                                                                            min="0"
                                                                            step="0.01"
                                                                            value={
                                                                                requestQuantity
                                                                            }
                                                                            onChange={(
                                                                                e,
                                                                            ) =>
                                                                                setRequestQuantity(
                                                                                    e
                                                                                        .target
                                                                                        .value,
                                                                                )
                                                                            }
                                                                            className="h-6 flex-1 text-xs"
                                                                            autoFocus
                                                                            placeholder="Cantidad"
                                                                        />
                                                                        <span className="text-[10px] whitespace-nowrap text-muted-foreground">
                                                                            {product
                                                                                .unidad
                                                                                ?.abreviatura ||
                                                                                '-'}
                                                                        </span>
                                                                    </div>
                                                                </div>
                                                                <div className="flex gap-1.5">
                                                                    <Button
                                                                        size="sm"
                                                                        className="h-6 flex-1 py-0 text-[10px]"
                                                                        onClick={() =>
                                                                            handleSubmitRequest(
                                                                                product.id,
                                                                            )
                                                                        }
                                                                    >
                                                                        Enviar
                                                                    </Button>
                                                                    <Button
                                                                        size="sm"
                                                                        variant="outline"
                                                                        className="h-6 flex-1 py-0 text-[10px]"
                                                                        onClick={
                                                                            handleCancelAction
                                                                        }
                                                                    >
                                                                        Cancelar
                                                                    </Button>
                                                                </div>
                                                            </div>
                                                        )}

                                                        {/* Botones de acción - Solo cuando NO está en modo acción */}
                                                        {!isInActionMode && (
                                                            <div className="flex gap-1.5">
                                                                {hasPermission(
                                                                    'ingresar_sustanciasQuimicas',
                                                                ) && (
                                                                    <Button
                                                                        size="sm"
                                                                        variant="default"
                                                                        className="h-6 flex-1 py-0 text-[10px]"
                                                                        onClick={() =>
                                                                            handleStartIngresarStock(
                                                                                product.id,
                                                                            )
                                                                        }
                                                                    >
                                                                        Ingresar
                                                                    </Button>
                                                                )}

                                                                <Button
                                                                    size="sm"
                                                                    variant="outline"
                                                                    className="h-6 flex-1 py-0 text-[10px]"
                                                                    onClick={() =>
                                                                        handleStartSolicitar(
                                                                            product.id,
                                                                        )
                                                                    }
                                                                >
                                                                    Solicitar
                                                                </Button>
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            );
                                        };

                                        return Array.from(
                                            { length: numColumns },
                                            (_, columnIndex) => {
                                                const topProduct =
                                                    sustancias[columnIndex * 2];
                                                const bottomProduct =
                                                    sustancias[
                                                        columnIndex * 2 + 1
                                                    ];

                                                return (
                                                    <div
                                                        key={columnIndex}
                                                        className="flex w-64 flex-shrink-0 flex-col space-y-4"
                                                    >
                                                        {/* Tarjeta superior */}
                                                        {renderProductCard(
                                                            topProduct,
                                                        )}

                                                        {/* Tarjeta inferior */}
                                                        {renderProductCard(
                                                            bottomProduct,
                                                        )}
                                                    </div>
                                                );
                                            },
                                        );
                                    })()}
                                </div>

                                {/* Efecto de desenfoque en los bordes */}
                                <div className="pointer-events-none absolute inset-y-0 left-0 w-8 bg-gradient-to-r from-white to-transparent dark:from-black/60 dark:to-transparent"></div>
                                <div className="pointer-events-none absolute inset-y-0 right-0 w-8 bg-gradient-to-l from-white to-transparent dark:from-black/60 dark:to-transparent"></div>
                            </div>

                            {/* Contador de productos */}
                            <div className="mt-3 text-center text-sm text-muted-foreground">
                                Mostrando {sustancias.length} productos (
                                {Math.ceil(sustancias.length / 2)} columnas) •
                                Desliza horizontalmente para ver todos
                            </div>
                        </div>
                    </TabsContent>

                    {/* Contenido de la pestaña Movimientos */}
                    <TabsContent value="movimientos">
                        {/* Header con búsqueda y filtros */}
                        <div className="mb-4 flex items-center justify-between">
                            {/* Búsqueda rápida */}
                            <div className="relative max-w-md">
                                <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 transform text-muted-foreground" />
                                <Input
                                    placeholder="Buscar por observaciones..."
                                    value={filters.search || ''}
                                    onChange={(e) =>
                                        updateFilter('search', e.target.value)
                                    }
                                    className="pl-10"
                                />
                            </div>
                            <div className="flex items-center gap-2">
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => setShowFilters(!showFilters)}
                                    className="flex items-center gap-2"
                                >
                                    <Filter className="h-4 w-4" />
                                    <p className="hidden md:block">Filtros</p>
                                    {hasActiveFilters && (
                                        <span className="flex h-5 w-5 items-center justify-center rounded-full bg-primary text-xs text-primary-foreground">
                                            !
                                        </span>
                                    )}
                                </Button>
                            </div>
                        </div>

                        {/* Filtros avanzados */}
                        {showFilters && (
                            <div className="mb-4 rounded-lg border border-border bg-muted/50 p-2">
                                <div className="mb-3 flex items-center justify-between">
                                    <h3 className="font-semibold text-foreground">
                                        Filtros avanzados
                                    </h3>
                                    <div className="flex items-center gap-2">
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
                                </div>

                                <div className="grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-6">
                                    <FilterSelect
                                        value={filters.user_id}
                                        onChange={(v) =>
                                            updateFilter('user_id', v)
                                        }
                                        placeholder="Solicitantes"
                                        options={users.map((r) => ({
                                            value: r.id.toString(),
                                            label: `${r.name} ${r.apellido}`,
                                        }))}
                                    />

                                    <FilterSelect
                                        value={filters.entregante_id}
                                        onChange={(v) =>
                                            updateFilter('entregante_id', v)
                                        }
                                        placeholder="Entregantes"
                                        options={entregantes.map((s) => ({
                                            value: s.id.toString(),
                                            label: `${s.name} ${s.apellido}`,
                                        }))}
                                    />
                                    <FilterSelect
                                        value={filters.sustancia_id}
                                        onChange={(v) =>
                                            updateFilter('sustancia_id', v)
                                        }
                                        placeholder="Sustancias"
                                        options={sustancias.map((s) => ({
                                            value: s.id.toString(),
                                            label: `${s.nombre} `,
                                        }))}
                                    />

                                    <FilterSelect
                                        value={filters.autorizante_id}
                                        onChange={(v) =>
                                            updateFilter('autorizante_id', v)
                                        }
                                        placeholder="autorizantes"
                                        options={autorizantes.map((s) => ({
                                            value: s.id.toString(),
                                            label: `${s.name} ${s.apellido}`,
                                        }))}
                                    />

                                    <FilterSelect
                                        value={filters.estado_id}
                                        onChange={(v) =>
                                            updateFilter('estado_id', v)
                                        }
                                        placeholder="Estados"
                                        options={estados.map((s) => ({
                                            value: s.id.toString(),
                                            label: `${s.nombre} `,
                                        }))}
                                    />

                                    <FilterSelect
                                        value={filters.per_page}
                                        onChange={(v) =>
                                            updateFilter('per_page', v)
                                        }
                                        placeholder="Resultados por página"
                                        options={['10', '25', '50', '100'].map(
                                            (v) => ({
                                                value: v,
                                                label: `${v} por página`,
                                            }),
                                        )}
                                        includeAllOption={false}
                                    />
                                </div>
                            </div>
                        )}

                        {/* Tabla de movimientos */}
                        <div className="overflow-hidden rounded-lg border border-border bg-background shadow-sm">
                            <div className="overflow-x-auto">
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            {[
                                                'Codigo',
                                                'Solicitante',
                                                'Tipo',
                                                'Estado',
                                                'Fecha',
                                                'Sustancia Química',
                                                'Cantidad',
                                                'Fecha Entrega',
                                                '',
                                            ].map((col, idx) => (
                                                <TableHead key={idx}>
                                                    {col}
                                                </TableHead>
                                            ))}
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {movimientos.data.length === 0 ? (
                                            <TableRow>
                                                <TableCell
                                                    colSpan={19}
                                                    className="py-8 text-center text-muted-foreground"
                                                >
                                                    <div className="flex flex-col items-center justify-center">
                                                        <Milk className="mb-3 h-12 w-12 text-muted-foreground/50" />
                                                        <p className="mb-1 text-lg font-medium text-foreground">
                                                            No se encontraron
                                                            movimientos
                                                        </p>
                                                        <p className="text-muted-foreground">
                                                            {hasActiveFilters
                                                                ? 'Intenta ajustar los filtros para ver más resultados'
                                                                : 'No hay movimientos registradas en el sistema'}
                                                        </p>
                                                    </div>
                                                </TableCell>
                                            </TableRow>
                                        ) : (
                                            movimientos.data.map(
                                                (movimiento) => (
                                                    <TableRow
                                                        key={movimiento.id}
                                                        className="hover:bg-muted/50"
                                                    >
                                                        <TableCell>
                                                            SUS-
                                                            {movimiento.id ||
                                                                '-'}
                                                        </TableCell>
                                                        <TableCell className="text-muted-foreground">
                                                            {getInitials(
                                                                movimiento.user
                                                                    ?.name,
                                                            ) || ''}
                                                            {getInitials(
                                                                movimiento.user
                                                                    ?.apellido,
                                                            ) || ''}
                                                        </TableCell>
                                                        <TableCell>
                                                            {renderBool(
                                                                movimiento.tipo,
                                                            )}
                                                        </TableCell>
                                                        <TableCell>
                                                            {renderEstado(movimiento.estado?.nombre)}
                                                        </TableCell>
                                                        <TableCell>
                                                            <FechaHora
                                                                value={
                                                                    movimiento.tiempo
                                                                }
                                                                mode="stacked"
                                                            />
                                                        </TableCell>
                                                        <TableCell>
                                                            {movimiento
                                                                .sustancia
                                                                ?.nombre || '-'}
                                                        </TableCell>
                                                        <TableCell>
                                                            <div>
                                                                <div className="truncate font-medium text-foreground">
                                                                    {movimiento.cantidad /
                                                                        1}
                                                                    {movimiento
                                                                        .sustancia
                                                                        ?.unidad
                                                                        ?.abreviatura ||
                                                                        '-'}
                                                                </div>
                                                                <div className="truncate text-xs font-medium text-muted-foreground">
                                                                    {
                                                                        movimiento.unidades
                                                                    }
                                                                    {movimiento.unidades && (
                                                                        <span>
                                                                            [U]
                                                                        </span>
                                                                    )}
                                                                </div>
                                                            </div>
                                                        </TableCell>
                                                        <TableCell>
                                                            <FechaHora
                                                                value={
                                                                    movimiento.fecha_entrega
                                                                }
                                                                mode="stacked"
                                                            />
                                                        </TableCell>
                                                        <TableCell>
                                                            <DropdownMenu>
                                                                <DropdownMenuTrigger
                                                                    asChild
                                                                >
                                                                    <Button
                                                                        variant="ghost"
                                                                        size="sm"
                                                                        className="h-8 w-8 p-0"
                                                                    >
                                                                        <MoreHorizontal className="h-4 w-4" />
                                                                        <span className="sr-only">
                                                                            Abrir
                                                                            menú
                                                                        </span>
                                                                    </Button>
                                                                </DropdownMenuTrigger>
                                                                <DropdownMenuContent
                                                                    align="end"
                                                                    className="w-48"
                                                                >
                                                                    {/* Mostrar estado actual */}
                                                                    <div className="border-b px-2 py-1.5 text-xs text-muted-foreground">
                                                                        Estado:{' '}
                                                                        <span className="font-medium">
                                                                            {
                                                                                movimiento
                                                                                    .estado
                                                                                    ?.nombre
                                                                            }
                                                                        </span>
                                                                    </div>

                                                                    {/* Opciones según estado */}
                                                                    {movimiento
                                                                        .estado
                                                                        ?.nombre ===
                                                                        'Pendiente' &&
                                                                        hasPermission(
                                                                            'u_sustanciasQuimicas',
                                                                        ) && (
                                                                            <>
                                                                                <DropdownMenuItem
                                                                                    onClick={() =>
                                                                                        handleAceptarMovimiento(
                                                                                            movimiento.id,
                                                                                        )
                                                                                    }
                                                                                    className="text-green-600 focus:bg-green-50 focus:text-green-700"
                                                                                >
                                                                                    <CheckCircle className="mr-2 h-4 w-4" />
                                                                                    <span>
                                                                                        Aceptar
                                                                                        Solicitud
                                                                                    </span>
                                                                                </DropdownMenuItem>

                                                                                <DropdownMenuItem
                                                                                    onClick={() =>
                                                                                        handleRechazarMovimiento(
                                                                                            movimiento.id,
                                                                                        )
                                                                                    }
                                                                                    className="text-red-600 focus:bg-red-50 focus:text-red-700"
                                                                                >
                                                                                    <XCircle className="mr-2 h-4 w-4" />
                                                                                    <span>
                                                                                        Rechazar
                                                                                        Solicitud
                                                                                    </span>
                                                                                </DropdownMenuItem>
                                                                            </>
                                                                        )}

                                                                    {movimiento
                                                                        .estado
                                                                        ?.nombre ===
                                                                        'Aceptado' &&
                                                                        hasPermission(
                                                                            'u_sustanciasQuimicas',
                                                                        ) && (
                                                                            <DropdownMenuItem
                                                                                onClick={() =>
                                                                                    handleAbrirDialogEntrega(
                                                                                        movimiento,
                                                                                    )
                                                                                }
                                                                                className="text-blue-600 focus:bg-blue-50 focus:text-blue-700"
                                                                            >
                                                                                <Package className="mr-2 h-4 w-4" />
                                                                                <span>
                                                                                    Entregar
                                                                                    Sustancia
                                                                                </span>
                                                                            </DropdownMenuItem>
                                                                        )}

                                                                    {/* Opción de eliminar - disponible para todos los estados */}
                                                                    {canDo(
                                                                        movimiento,
                                                                        'd_recepcionMateriaPrima',
                                                                        6,
                                                                        true,
                                                                    ) && (
                                                                        <DropdownMenuItem
                                                                            onClick={() =>
                                                                                handleDelete(
                                                                                    movimiento.id,
                                                                                )
                                                                            }
                                                                            className="text-destructive focus:bg-destructive/10 focus:text-destructive"
                                                                        >
                                                                            <Trash2 className="mr-2 h-4 w-4" />
                                                                            <span>
                                                                                Eliminar
                                                                                Movimiento
                                                                            </span>
                                                                        </DropdownMenuItem>
                                                                    )}
                                                                </DropdownMenuContent>
                                                            </DropdownMenu>
                                                        </TableCell>
                                                    </TableRow>
                                                ),
                                            )
                                        )}
                                    </TableBody>
                                </Table>
                            </div>

                            {/* Paginación */}
                            {movimientos.data.length > 0 && (
                                <div className="border-t border-border px-4 py-3">
                                    <TablePagination
                                        pagination={movimientos}
                                        onPageChange={(page) =>
                                            router.get(
                                                route(
                                                    'sustancias-quimicas.index',
                                                ),
                                                { ...filters, page },
                                                {
                                                    preserveState: true,
                                                    replace: true,
                                                },
                                            )
                                        }
                                    />
                                </div>
                            )}
                        </div>

                        {/* Controles de PDF */}
                        <div className="mt-4 rounded-lg border border-border bg-muted/50 p-4">
                            <h3 className="mb-3 font-semibold text-foreground">
                                Generar Reporte PDF de Kardex
                            </h3>
                            <div className="grid grid-cols-1 gap-3 md:grid-cols-4">
                                <div>
                                    <label className="mb-1 block text-sm font-medium">
                                        Fecha Desde
                                    </label>
                                    <Input
                                        type="date"
                                        value={fechaDesde}
                                        onChange={(e) =>
                                            setFechaDesde(e.target.value)
                                        }
                                    />
                                </div>
                                <div>
                                    <label className="mb-1 block text-sm font-medium">
                                        Fecha Hasta
                                    </label>
                                    <Input
                                        type="date"
                                        value={fechaHasta}
                                        onChange={(e) =>
                                            setFechaHasta(e.target.value)
                                        }
                                    />
                                </div>
                                <div>
                                    <label className="mb-1 block text-sm font-medium">
                                        Sustancia
                                    </label>
                                    <Select
                                        value={sustanciaId}
                                        onValueChange={setSustanciaId}
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder="Seleccione una sustancia" />
                                        </SelectTrigger>
                                        <SelectContent side="top">
                                            {sustancias.map((s) => (
                                                <SelectItem
                                                    key={s.id}
                                                    value={s.id.toString()}
                                                >
                                                    {s.nombre}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="flex items-end">
                                    <Button
                                        variant="default"
                                        size="sm"
                                        onClick={handleMostrarPdf}
                                        disabled={generandoPdf}
                                        className="flex items-center gap-2"
                                    >
                                        <Printer className="h-4 w-4" />
                                        {generandoPdf
                                            ? 'Generando...'
                                            : 'Ver Reporte'}
                                    </Button>
                                </div>
                            </div>
                        </div>
                        {/* Info rápida */}
                        <div className="mt-4 flex justify-between">
                            <p className="text-muted-foreground">
                                {movimientos.total} movimientos registradas
                            </p>
                            <div>
                                {movimientos.data.length > 0 && (
                                    <div className="text-center">
                                        <p className="text-muted-foreground">
                                            Mostrando{' '}
                                            <span className="font-medium text-foreground">
                                                {movimientos.data.length}
                                            </span>{' '}
                                            de{' '}
                                            <span className="font-medium text-foreground">
                                                {movimientos.total}
                                            </span>{' '}
                                            movimientos
                                        </p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </TabsContent>
                </Tabs>
            </div>

            {/* Dialog para entrega de sustancia */}
            <Dialog
                open={isEntregaDialogOpen}
                onOpenChange={setIsEntregaDialogOpen}
            >
                <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle>Entregar Sustancia</DialogTitle>
                    </DialogHeader>

                    {movimientoParaEntregar && (
                        <div className="max-h-[60vh] overflow-y-auto space-y-2 text-sm pr-2">
                            {/* Stock disponible */}
                            <div className="rounded-lg border p-2 dark:border-neutral-700 dark:bg-neutral-950">
                                <p className="mb-1 text-sm font-medium text-blue-700">
                                    Stock disponible para entrega
                                </p>
                                <div className="grid grid-cols-2 gap-2">
                                    <div>
                                        <p className="text-xs text-blue-600">
                                            Disponible Extra:
                                        </p>
                                        <p
                                            className={`text-base font-semibold ${
                                                (props.stockReal?.[
                                                    movimientoParaEntregar
                                                        .sustancia_id
                                                ] || 0) -
                                                    Math.abs(
                                                        props.stock?.[
                                                            movimientoParaEntregar
                                                                .sustancia_id
                                                        ] || 0,
                                                    ) <
                                                0
                                                    ? 'text-red-600'
                                                    : 'text-blue-700'
                                            }`}
                                        >
                                            {(props.stockReal?.[
                                                movimientoParaEntregar
                                                    .sustancia_id
                                            ] || 0) -
                                                Math.abs(
                                                    props.stock?.[
                                                        movimientoParaEntregar
                                                            .sustancia_id
                                                    ] || 0,
                                                ) <
                                            0
                                                ? 'Insuficiente ⚠️'
                                                : (props.stockReal?.[
                                                      movimientoParaEntregar
                                                          .sustancia_id
                                                  ] || 0) -
                                                  Math.abs(
                                                      props.stock?.[
                                                          movimientoParaEntregar
                                                              .sustancia_id
                                                      ] || 0,
                                                  ) +
                                                  ' ' +
                                                  movimientoParaEntregar
                                                      .sustancia?.unidad
                                                      ?.abreviatura}
                                        </p>
                                    </div>
                                    <div>
                                        <p className="text-xs text-green-600">
                                            Físico en almacén:
                                        </p>
                                        <p className="text-base font-semibold text-green-700">
                                            {props.stockReal?.[
                                                movimientoParaEntregar
                                                    .sustancia_id
                                            ] / 1}
                                            {
                                                movimientoParaEntregar.sustancia
                                                    ?.unidad?.abreviatura
                                            }
                                        </p>
                                    </div>
                                </div>
                                <p className="mt-1 text-xs text-muted-foreground">
                                    Nota: El stock disponible considera todas
                                    las solicitudes aceptadas pendientes.
                                </p>
                            </div>

                            {/* Información de la sustancia */}
                            <div className="grid grid-cols-2 gap-2">
                                <div>
                                    <p className="text-sm font-medium text-muted-foreground">
                                        Sustancia
                                    </p>
                                    <p className="font-medium">
                                        {
                                            movimientoParaEntregar.sustancia
                                                ?.nombre
                                        }
                                    </p>
                                </div>
                                <div>
                                    <p className="text-sm font-medium text-muted-foreground">
                                        Código
                                    </p>
                                    <p className="font-medium">
                                        SUS-{movimientoParaEntregar.id}
                                    </p>
                                </div>
                            </div>

                            {/* Cantidad solicitada */}
                            <div className="rounded-lg bg-muted p-2">
                                <p className="mb-1 text-sm font-medium text-muted-foreground">
                                    Cantidad solicitada originalmente
                                </p>
                                <p className="text-base font-semibold">
                                    {movimientoParaEntregar.cantidad / 1}{' '}
                                    {
                                        movimientoParaEntregar.sustancia?.unidad
                                            ?.abreviatura
                                    }
                                </p>
                            </div>

                            {/* Cantidad a entregar */}
                            <div>
                                <label className="mb-1 block text-sm font-medium">
                                    Cantidad a entregar
                                    <span className="ml-1 text-xs text-muted-foreground">
                                        (ajuste si es necesario)
                                    </span>
                                </label>
                                <div className="flex items-center gap-1">
                                    <Input
                                        type="number"
                                        min="0"
                                        step="0.01"
                                        value={cantidadEntregada}
                                        onChange={(e) =>
                                            setCantidadEntregada(e.target.value)
                                        }
                                        className="flex-1"
                                        autoFocus
                                    />
                                    <span className="min-w-16 text-sm font-medium text-muted-foreground">
                                        {
                                            movimientoParaEntregar.sustancia
                                                ?.unidad?.abreviatura
                                        }
                                    </span>
                                </div>

                                {/* Mensaje condicional */}
                                {parseFloat(cantidadEntregada) !=
                                    movimientoParaEntregar.cantidad && (
                                    <>
                                        {/* Primero calculamos las variables importantes */}
                                        {(() => {
                                            const stockFisico =
                                                props.stockReal?.[
                                                    movimientoParaEntregar
                                                        .sustancia_id
                                                ] || 0;
                                            const stockAceptado = Math.abs(
                                                props.stock?.[
                                                    movimientoParaEntregar
                                                        .sustancia_id
                                                ] || 0,
                                            );
                                            const diferencia =
                                                parseFloat(cantidadEntregada) -
                                                movimientoParaEntregar.cantidad;
                                            const stockExtraDisponible =
                                                stockFisico - stockAceptado;

                                            // Condición: stock extra es 0 y se quiere entregar más de lo solicitado
                                            const debeMostrarAdvertencia =
                                                stockExtraDisponible <= 0 &&
                                                parseFloat(cantidadEntregada) >
                                                    movimientoParaEntregar.cantidad;

                                            if (debeMostrarAdvertencia) {
                                                return (
                                                    <p className="mt-1 text-xs font-bold text-red-600">
                                                        ⚠️ La cantidad supera el
                                                        stock físico disponible
                                                        o ya se reservo para
                                                        otra sustancia
                                                    </p>
                                                );
                                            } else {
                                                return (
                                                    <p className="mt-1 text-xs text-muted-foreground">
                                                        <span className="font-medium">
                                                            Diferencia:{' '}
                                                            {Math.abs(
                                                                diferencia,
                                                            )}
                                                        </span>
                                                        {
                                                            movimientoParaEntregar
                                                                .sustancia
                                                                ?.unidad
                                                                ?.abreviatura
                                                        }
                                                        {diferencia > 0
                                                            ? ' (más de lo solicitado)'
                                                            : ' (menos de lo solicitado)'}
                                                    </p>
                                                );
                                            }
                                        })()}
                                    </>
                                )}

                                {/* También podemos agregar una advertencia cuando se supera el stock físico */}
                                {parseFloat(cantidadEntregada) >
                                    (props.stockReal?.[
                                        movimientoParaEntregar.sustancia_id
                                    ] || 0) && (
                                    <p className="mt-1 text-xs font-bold text-red-600">
                                        ⚠️ La cantidad supera el stock físico
                                        disponible
                                    </p>
                                )}
                            </div>

                            {/* Información del solicitante */}
                            <div className="border-t pt-2">
                                <p className="mb-1 text-sm font-medium text-muted-foreground">
                                    Solicitado por
                                </p>
                                <p className="font-medium">
                                    {movimientoParaEntregar.user?.name}{' '}
                                    {movimientoParaEntregar.user?.apellido}
                                </p>
                            </div>
                        </div>
                    )}

                    <DialogFooter className="flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2">
                        <Button
                            variant="outline"
                            onClick={handleCerrarDialogEntrega}
                            type="button"
                        >
                            Cancelar
                        </Button>
                        <Button onClick={handleConfirmarEntrega} type="button">
                            Confirmar Entrega
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Modal para mostrar PDF */}
            {mostrarPdf && datosPdf.length > 0 && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80">
                    <div className="relative h-[95vh] w-[95vw] overflow-hidden rounded-lg bg-white shadow-2xl">
                        <button
                            className="absolute top-4 right-4 z-50 flex h-8 w-8 items-center justify-center rounded-full bg-red-600 text-white hover:bg-red-700"
                            onClick={() => setMostrarPdf(false)}
                        >
                            <X className="h-5 w-5" />
                        </button>
                        <div className="absolute top-0 right-0 left-0 z-40 flex items-center justify-between bg-gray-100 px-4 py-3">
                            <div>
                                <h3 className="text-lg font-semibold text-gray-800">
                                    Reporte de Kardex de Sustancias
                                </h3>
                                <p className="text-sm text-gray-600">
                                    {fechaDesde} al {fechaHasta} -{' '}
                                    {datosPdf.length} movimientos
                                </p>
                            </div>
                        </div>
                        <div className="h-full pt-14">
                            <PDFViewer
                                style={{
                                    width: '100%',
                                    height: '100%',
                                    border: 'none',
                                }}
                            >
                                <ReporteKardexSustancias
                                    datos={datosPdf}
                                    sustancia={sustanciaPdf}
                                    usuariosInvolucrados={usuariosPdf}
                                />
                            </PDFViewer>
                        </div>
                    </div>
                </div>
            )}
        </AppLayout>
    );
}
