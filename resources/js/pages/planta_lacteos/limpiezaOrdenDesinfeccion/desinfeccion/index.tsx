import { Button } from '@/components/ui/button';
import FechaHora from '@/components/ui/fecha-hora';
import FilterSelect from '@/components/ui/filter-select';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Printer } from 'lucide-react';
import { PDFViewer } from '@react-pdf/renderer';
import ReporteKardexDesinfeccion from '@/pdf/ReporteKardexDesinfeccion';
import { Input } from '@/components/ui/input';
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
import { type BreadcrumbItem } from '@/types';
import { Head, router, usePage } from '@inertiajs/react';
import {
    CheckCircle,
    Filter,
    MoreHorizontal,
    Package,
    Search,
    Trash2,
    X,
    XCircle,
    RefreshCw,
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

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Movimientos de Desinfección',
        href: '/planta-lacteos/desinfeccion',
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
        item_desinfeccion_id?: number;
        destino_desinfeccion_id?: number;
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
    items?: {
        id: number;
        nombre: string;
        codigo: string;
        unidad?: { abreviatura: string };
        concentracion: number;
    }[];
    destinos?: {
        id: number;
        nombre: string;
        codigo: string;
        unidad?: { abreviatura: string };
        concentracion: number;
        multiplicador?: number;
    }[];
    estados?: { id: number; nombre: string }[];
    flash: {
        success?: string;
        error?: string;
    };
}

export default function Index() {
    const { props } = usePage();

    const [showFilters, setShowFilters] = useState(false);
    const [activeTab, setActiveTab] = useState('stock');
const [corrigiendoStocks, setCorrigiendoStocks] = useState(false);
    // Estados para manejar los botones e inputs
    const [editingProductId, setEditingProductId] = useState<number | null>(
        null,
    );
    const [stockQuantity, setStockQuantity] = useState<string>('');
    const [actionType, setActionType] = useState<'ingresar' | null>(null);

    // Estado para el diálogo de solicitud
    const [solicitudDialogOpen, setSolicitudDialogOpen] = useState(false);
    const [selectedItemId, setSelectedItemId] = useState<number | null>(null);


    // Estados para el PDF
const [fechaDesde, setFechaDesde] = useState<string>('');
const [fechaHasta, setFechaHasta] = useState<string>('');
const [itemDesinfeccionId, setItemDesinfeccionId] = useState<string>('');
const [datosPdf, setDatosPdf] = useState<any[]>([]);
const [itemPdf, setItemPdf] = useState<any>(null);
const [usuariosPdf, setUsuariosPdf] = useState<any[]>([]);
const [mostrarPdf, setMostrarPdf] = useState(false);
const [generandoPdf, setGenerandoPdf] = useState(false);

const urlPdf = route('movimiento-desinfeccion.pdf');


const handleMostrarPdf = async () => {
    if (!fechaDesde || !fechaHasta) {
        alert('Por favor selecciona ambas fechas');
        return;
    }
    if (!itemDesinfeccionId) {
        alert('Por favor selecciona un producto');
        return;
    }

    setGenerandoPdf(true);
    try {
        const params = new URLSearchParams();
        params.append('fecha_desde', fechaDesde);
        params.append('fecha_hasta', fechaHasta);
        params.append('item_desinfeccion_id', itemDesinfeccionId);

        const response = await fetch(`${urlPdf}?${params.toString()}`);
        if (!response.ok) throw new Error('Error al obtener los datos');

        const data = await response.json();

        // Obtener el item seleccionado (desde props.items)
        const itemSeleccionado = items.find(
            (i: any) => i.id.toString() === itemDesinfeccionId
        );

        // Transformar movimientos
        const datosTransformados = data.movimientos.map((mov: any) => ({
            fecha: mov.tiempo,
            tipo: mov.tipo ? 'Ingreso' : 'Egreso',
            cantidad_item: mov.cantidad_item,
            saldo: mov.saldo,
            responsable: `${mov.user?.name || ''} ${mov.user?.apellido || ''}`,
            codigo_responsable: mov.user?.codigo || '',
            autorizante: `${mov.autorizante?.name || ''} ${mov.autorizante?.apellido || ''}`,
            codigo_autorizante: mov.autorizante?.codigo || '',
            entregante: `${mov.entregante?.name || ''} ${mov.entregante?.apellido || ''}`,
            codigo_entregante: mov.entregante?.codigo || '',
            observacion: mov.observacion || '-',
            destino: mov.destino?.nombre || 'Almacen de Laboratorio',
            item: mov.item?.nombre || '-',
            unidad: mov.item?.unidad?.abreviatura || '',
        }));

        if (datosTransformados.length === 0) {
            alert('No hay movimientos entregados para los filtros seleccionados');
            return;
        }

        setDatosPdf(datosTransformados);
        setItemPdf(itemSeleccionado);
        setUsuariosPdf(data.usuarios_involucrados || []);
        setMostrarPdf(true);
    } catch (error) {
        console.error('Error al generar PDF:', error);
        alert('Error al generar el reporte. Por favor, intenta de nuevo.');
    } finally {
        setGenerandoPdf(false);
    }
};

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

    const formatDecimal = (value: any) => {
        if (value === null || value === undefined || value === '') return '-';
        const parsed = Number(String(value).replace(',', '.'));
        if (!isNaN(parsed) && isFinite(parsed)) return parsed.toString();
        return String(value);
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
        items = [],
        destinos = [],
        autorizantes = [],
        entregantes = [],
        estados = [],
        flash,
    } = props as unknown as PageProps;

    const { filters, updateFilter, resetFilters } = useAdvancedFilters({
        routeName: 'movimiento-desinfeccion.index',
        initialFilters: {
            search: initialFilters.search || '',
            user_id: initialFilters.user_id?.toString() || undefined,
            item_desinfeccion_id:
                initialFilters.item_desinfeccion_id?.toString() || undefined,
            destino_desinfeccion_id:
                initialFilters.destino_desinfeccion_id?.toString() || undefined,
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
    const [cantidadItemEntregada, setCantidadItemEntregada] = useState<any>('');
    const [observacionesEntrega, setObservacionesEntrega] = useState<string>('');

    // Estados para el diálogo de solicitud
    const [selectedDestinoId, setSelectedDestinoId] = useState<number | null>(
        null,
    );
    const [cantidadMezcla, setCantidadMezcla] = useState<string>('');
    const [observaciones, setObservaciones] = useState<string>('');

    // Destinos que deben prellenar una cantidad por defecto (litros)
    const DESTINO_PREFILL: Record<number, number> = {
        7: 400,   // Desinfección de Botellas
        12: 1300, // lavado de bandejas
        13: 1000, // Desinfección de tanques
    };

    const handleStartIngresarStock = (productId: number) => {
        setEditingProductId(productId);
        setActionType('ingresar');
        setStockQuantity('');
    };

    const handleCancelAction = () => {
        setEditingProductId(null);
        setActionType(null);
        setStockQuantity('');
    };

    const handleSaveStock = (productId: number) => {
        if (!stockQuantity || parseFloat(stockQuantity) <= 0) {
            alert('Por favor ingrese una cantidad válida');
            return;
        }

        router.post(
            route('movimiento-desinfeccion.ingresar-stock'),
            {
                item_desinfeccion_id: productId,
                cantidad_item: parseFloat(stockQuantity),
            },
            {
                preserveScroll: true,
                onSuccess: () => {
                    handleCancelAction();
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

    const handleOpenSolicitudDialog = (itemId: number) => {
        setSelectedItemId(itemId);
        setSolicitudDialogOpen(true);
    };

    const handleCloseSolicitudDialog = () => {
        setSolicitudDialogOpen(false);
        setSelectedItemId(null);
    };

    const handleAceptarMovimiento = (id: number) => {
        if (confirm('¿Está seguro de aceptar este movimiento?')) {
            router.post(
                route('movimiento-desinfeccion.aceptar', id),
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
                route('movimiento-desinfeccion.rechazar', id),
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
        setCantidadItemEntregada(movimiento.cantidad_item);
        setObservacionesEntrega(movimiento.observacion || '');
        setIsEntregaDialogOpen(true);
    };

    const handleCerrarDialogEntrega = () => {
        setIsEntregaDialogOpen(false);
        setMovimientoParaEntregar(null);
        setCantidadItemEntregada('');
        setObservacionesEntrega('');
    };

    const handleCorregirStocks = () => {
    if (!confirm('⚠️ Esta acción recalculará todos los saldos de movimientos entregados. ¿Desea continuar?')) return;
    setCorrigiendoStocks(true);
    router.post(
        route('movimiento-desinfeccion.corregir-stocks'),
        {},
        {
            preserveScroll: true,
            onFinish: () => setCorrigiendoStocks(false),
            onError: (errors) => {
                console.error(errors);
                alert('Error al corregir stocks');
            }
        }
    );
};

    const handleConfirmarEntrega = () => {
        if (!cantidadItemEntregada || parseFloat(cantidadItemEntregada) < 0) {
            alert('Por favor ingrese una cantidad válida');
            return;
        }

        if (
            confirm(
                `¿Está seguro de entregar ${cantidadItemEntregada} ${movimientoParaEntregar?.item?.unidad?.abreviatura} de ${movimientoParaEntregar?.item?.nombre}?`,
            )
        ) {
            router.post(
                route(
                    'movimiento-desinfeccion.entregar',
                    movimientoParaEntregar.id,
                ),
                {
                    cantidad_item_entregada: parseFloat(cantidadItemEntregada),
                    observacion: observacionesEntrega,
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

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Movimientos de Desinfección" />
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
                    </div>

                    {/* Contenido de la pestaña Stock */}
                    <TabsContent value="stock">
                        <div className="mb-4">
                            {/* Indicadores de scroll */}
                            <div className="mb-3 flex items-center justify-between">
                                <h3 className="text-lg font-semibold">
                                    Stock de Productos de Desinfección
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
                                    {(() => {
                                        const numColumns = Math.ceil(
                                            items.length / 2,
                                        );

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
                                            const isInActionMode = isIngresando;

                                            return (
                                                <div className="flex h-56 flex-col rounded-lg border bg-white p-3 shadow-sm transition-shadow duration-200 hover:shadow-md dark:bg-neutral-950 dark:border-neutral-800">
                                                    {/* Sección superior - Información del producto */}
                                                    <div className="flex flex-1 flex-col">
                                                        {/* Encabezado compacto */}
                                                        <div className="mb-1 flex items-start justify-between">
                                                            <h3 className="line-clamp-2 flex-1 pr-2 text-xs leading-tight font-semibold">
                                                                {product.nombre}
                                                            </h3>
                                                            <div
                                                                className={`flex-shrink-0 rounded px-2 py-0.5 text-[10px] font-medium ${
                                                                     (props
                                                                            .stockReal?.[
                                                                            product
                                                                                .id
                                                                        ] ??
                                                                            0) < 1
                                                                        ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-500'
                                                                        : 'bg-green-100 text-green-800 dark:bg-emerald-900 dark:text-emerald-500'
                                                                }`}
                                                            >
                                                                { (props
                                                                            .stockReal?.[
                                                                            product
                                                                                .id
                                                                        ] ??
                                                                            0) < 1
                                                                    ? 'Bajo'
                                                                    : 'OK'}
                                                            </div>
                                                        </div>

                                                        {/* Stock actual */}
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
                                                                            ? 'text-red-600 dark:text-red-500'
                                                                            : 'text-green-600 dark:text-green-600'
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

                                                                {/* Sección para mostrar el stock real */}
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
                                                                                    ? 'text-red-600 dark:text-red-400'
                                                                                    : 'text-amber-600 dark:text-amber-400'
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

                                                        {/* Información adicional */}
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
                                                            <div className="flex justify-between">
                                                                <span>
                                                                    Concentración:
                                                                </span>
                                                                <span className="font-medium">
                                                                    {
                                                                        product.concentracion
                                                                    }
                                                                    %
                                                                </span>
                                                            </div>
                                                        </div>
                                                    </div>

                                                    {/* Sección inferior - Controles de acción */}
                                                    <div className="mt-2">
                                                        {/* Modo de acción (Ingresar) */}
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

                                                        {/* Botones de acción - Solo cuando NO está en modo acción */}
                                                        {!isInActionMode && (
                                                            <div className="flex gap-1.5">
                                                                {hasPermission(
                                                                    'ingresar_desinfeccion',
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
                                                                        handleOpenSolicitudDialog(
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
                                                    items[columnIndex * 2];
                                                const bottomProduct =
                                                    items[columnIndex * 2 + 1];

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
                                <div className="pointer-events-none absolute inset-y-0 left-0 w-6 bg-gradient-to-r from-white to-transparent dark:from-black/60 dark:to-transparent"></div>
                                <div className="pointer-events-none absolute inset-y-0 right-0 w-6 bg-gradient-to-l from-white to-transparent dark:from-black/60 dark:to-transparent"></div>
                            </div>

                            {/* Contador de productos */}
                            <div className="mt-3 text-center text-sm text-muted-foreground">
                                Mostrando {items.length} productos (
                                {Math.ceil(items.length / 2)} columnas) •
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
                                  {hasPermission('corregir_stocks_desinfeccion') && (
        <Button
            variant="outline"
            size="sm"
            onClick={handleCorregirStocks}
            disabled={corrigiendoStocks}
            className="flex items-center gap-2"
        >
            <RefreshCw className={`h-4 w-4 ${corrigiendoStocks ? 'animate-spin' : ''}`} />
            {corrigiendoStocks ? 'Corrigiendo...' : 'Corregir Stocks'}
        </Button>
    )}
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
                                        value={filters.item_desinfeccion_id}
                                        onChange={(v) =>
                                            updateFilter(
                                                'item_desinfeccion_id',
                                                v,
                                            )
                                        }
                                        placeholder="Items"
                                        options={items.map((s) => ({
                                            value: s.id.toString(),
                                            label: `${s.nombre} `,
                                        }))}
                                    />

                                    <FilterSelect
                                        value={filters.destino_desinfeccion_id}
                                        onChange={(v) =>
                                            updateFilter(
                                                'destino_desinfeccion_id',
                                                v,
                                            )
                                        }
                                        placeholder="Destinos"
                                        options={destinos.map((s) => ({
                                            value: s.id.toString(),
                                            label: `${s.nombre}  `,
                                        }))}
                                    />

                                    <FilterSelect
                                        value={filters.autorizante_id}
                                        onChange={(v) =>
                                            updateFilter('autorizante_id', v)
                                        }
                                        placeholder="Autorizantes"
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
                                                'Item',
                                                'Destino',
                                                'Cant. Item',
                                                'Cant. Mezcla',
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
                                                        <Package className="mb-3 h-12 w-12 text-muted-foreground/50" />
                                                        <p className="mb-1 text-lg font-medium text-foreground">
                                                            No se encontraron
                                                            movimientos
                                                        </p>
                                                        <p className="text-muted-foreground">
                                                            {hasActiveFilters
                                                                ? 'Intenta ajustar los filtros para ver más resultados'
                                                                : 'No hay movimientos registrados en el sistema'}
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
                                                            DES-
                                                            {movimiento.id ||
                                                                '-'}
                                                        </TableCell>
                                                        <TableCell className="text-muted-foreground">
                                                            {movimiento.user
                                                                ?.name ||
                                                                ''}{' '}
                                                            {movimiento.user
                                                                ?.apellido ||
                                                                ''}
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
                                                            {movimiento.item
                                                                ?.nombre || '-'}
                                                        </TableCell>
                                                        <TableCell>
                                                            {movimiento.destino
                                                                ?.nombre || '-'}
                                                        </TableCell>
                                                        <TableCell>
                                                            <div>
                                                                <div className="truncate font-medium text-foreground">
                                                                    {movimiento.cantidad_item /
                                                                        1}
                                                                    {movimiento
                                                                        .item
                                                                        ?.unidad
                                                                        ?.abreviatura ||
                                                                        '-'}
                                                                </div>
                                                            </div>
                                                        </TableCell>
                                                        <TableCell>
                                                            <div>
                                                                <div className="truncate font-medium text-foreground">
                                                                    {movimiento.cantidad_mezcla /
                                                                        1}
                                                                    {movimiento
                                                                        .destino
                                                                        ?.unidad
                                                                        ?.abreviatura ||
                                                                        '-'}
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
                                                                            'u_desinfeccion',
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
                                                                            'u_desinfeccion',
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
                                                                                    Item
                                                                                </span>
                                                                            </DropdownMenuItem>
                                                                        )}

                                                                    {/* Opción de eliminar */}
                                                                    {canDo(
                                                                        movimiento,
                                                                        'd_desinfeccion',
                                                                        6,
                                                                        true,
                                                                    ) && (
                                                                        <DropdownMenuItem
                                                                            onClick={() => {
                                                                                if (
                                                                                    confirm(
                                                                                        '¿Está seguro de eliminar este movimiento?',
                                                                                    )
                                                                                ) {
                                                                                    router.delete(
                                                                                        route(
                                                                                            'movimiento-desinfeccion.destroy',
                                                                                            movimiento.id,
                                                                                        ),
                                                                                        {
                                                                                            preserveScroll: true,
                                                                                        },
                                                                                    );
                                                                                }
                                                                            }}
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
                                                    'movimiento-desinfeccion.index',
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

                        {/* Info rápida */}
                        <div className="mt-4 flex justify-between">
                            <p className="text-muted-foreground">
                                {movimientos.total} movimientos registrados
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

                        {/* Controles de PDF */}
<div className="rounded-lg border border-border bg-muted/50 p-4 mt-4">
    <h3 className="mb-3 font-semibold text-foreground">Generar Reporte PDF de Kardex</h3>
    <div className="grid grid-cols-1 gap-3 md:grid-cols-4">
        <div>
            <label className="mb-1 block text-sm font-medium">Fecha Desde</label>
            <Input
                type="date"
                value={fechaDesde}
                onChange={(e) => setFechaDesde(e.target.value)}
            />
        </div>
        <div>
            <label className="mb-1 block text-sm font-medium">Fecha Hasta</label>
            <Input
                type="date"
                value={fechaHasta}
                onChange={(e) => setFechaHasta(e.target.value)}
            />
        </div>
        <div>
            <label className="mb-1 block text-sm font-medium">Producto</label>
            <Select value={itemDesinfeccionId} onValueChange={setItemDesinfeccionId}>
                <SelectTrigger>
                    <SelectValue placeholder="Seleccione un producto" />
                </SelectTrigger>
                <SelectContent side="top">
                    {items.map((item) => (
                        <SelectItem key={item.id} value={item.id.toString()}>
                            {item.nombre}
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
                {generandoPdf ? 'Generando...' : 'Ver Reporte'}
            </Button>
        </div>
    </div>
</div>
                    </TabsContent>
                </Tabs>
            </div>

            {/* Dialog para solicitud de desinfección */}
            <Dialog
                open={solicitudDialogOpen}
                onOpenChange={setSolicitudDialogOpen}
            >
                <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle>Solicitar Desinfección</DialogTitle>
                    </DialogHeader>

                    {selectedItemId &&
                        (() => {
                            // Obtener el item seleccionado
                            const selectedItem = items.find(
                                (item) => item.id === selectedItemId,
                            );

                            // Filtrar destinos para este item específico
                            const destinosDelItem = destinos.filter(
                                (destino) =>
                                    destino.item_desinfeccion_id ==
                                    selectedItemId,
                            );

                            return (
                                <div className="space-y-4">
                                    {/* Información del Item seleccionado */}
                                    <div className="rounded-lg border dark:bg-neutral-950 dark:border-neutral-700  p-3">
                                        <div className="flex items-center justify-between">
                                            <div>
                                                <p className="text-sm font-medium text-blue-700 ">
                                                    Item seleccionado
                                                </p>
                                                <p className="font-medium text-blue-900  ">
                                                    {selectedItem?.nombre}
                                                </p>
                                            </div>
                                            <div className="text-right">
                                                <p className="text-xs text-blue-600 ">
                                                    Concentración
                                                </p>
                                                <p className="font-bold text-blue-900 ">
                                                    {formatDecimal(selectedItem?.concentracion)}%
                                                </p>
                                            </div>
                                        </div>
                                        <div className="mt-2 grid grid-cols-2 gap-2 text-xs">
                                            <div>
                                                <span className="text-blue-600  ">
                                                    Código:
                                                </span>
                                                <span className="ml-1 font-medium">
                                                    {selectedItem?.codigo}
                                                </span>
                                            </div>
                                            <div>
                                                <span className="text-blue-600  ">
                                                    Unidad:
                                                </span>
                                                <span className="ml-1 font-medium">
                                                    {
                                                        selectedItem?.unidad
                                                            ?.abreviatura
                                                    }
                                                </span>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Select de Destino */}
                                    <div>
                                        <label className="mb-2 block text-sm font-medium">
                                            Destino de desinfección
                                            <span className="ml-1 text-xs text-red-500">
                                                *
                                            </span>
                                        </label>
                                        <select
                                            value={selectedDestinoId || ''}
                                            onChange={(e) => {
                                                const val = e.target.value
                                                    ? parseInt(e.target.value)
                                                    : null;
                                                setSelectedDestinoId(val);
                                                // Si el destino seleccionado está en el mapeo, prellenar la cantidad
                                                if (val && DESTINO_PREFILL[val]) {
                                                    setCantidadMezcla(
                                                        DESTINO_PREFILL[val].toString(),
                                                    );
                                                } else {
                                                    // Si es otro destino, limpiar el campo
                                                    setCantidadMezcla('');
                                                }
                                            }}
                                            className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:ring-2 focus:ring-ring focus:ring-offset-2 focus:outline-none"
                                        >
                                            <option value="">
                                                Seleccione un destino
                                            </option>
                                            {destinosDelItem.map((destino) => (
                                                <option
                                                    key={destino.id}
                                                    value={destino.id}
                                                >
                                                    {destino.nombre} ({formatDecimal(destino.concentracion)}%)
                                                </option>
                                            ))}
                                        </select>
                                        {selectedDestinoId &&
                                            (() => {
                                                const destinoSeleccionado =
                                                    destinos.find(
                                                        (d) =>
                                                            d.id ===
                                                            selectedDestinoId,
                                                    );
                                                return (
                                                    <p className="mt-1 text-xs text-muted-foreground">
                                                        Concentración requerida:{' '}
    {formatDecimal(destinoSeleccionado?.concentracion)}%
                                                    </p>
                                                );
                                            })()}
                                    </div>

                                    {/* Input para cantidad de mezcla */}
                                    <div>
                                        <label className="mb-2 block text-sm font-medium">
                                            Cantidad de mezcla necesaria
                                            <span className="ml-1 text-xs text-red-500">
                                                *
                                            </span>
                                        </label>
                                        <div className="flex items-center gap-2">
                                            <Input
                                                type="number"
                                                min="0"
                                                step="0.01"
                                                value={cantidadMezcla}
                                                onChange={(e) =>
                                                    setCantidadMezcla(
                                                        e.target.value,
                                                    )
                                                }
                                                className="flex-1"
                                                placeholder="Ej: 100"
                                                autoFocus
                                            />
                                            <span className="min-w-16 text-sm font-medium text-muted-foreground">
                                                {selectedDestinoId
                                                    ? destinos.find(
                                                          (d) =>
                                                              d.id ===
                                                              selectedDestinoId,
                                                      )?.unidad?.abreviatura ||
                                                      'Unidad'
                                                    : 'Unidad'}
                                            </span>
                                        </div>
                                        <p className="mt-1 text-xs text-muted-foreground">
                                            Cantidad total de mezcla preparada
                                            que necesitas
                                        </p>
                                    </div>

                                    {/* Información de cálculo (opcional - se puede mostrar cuando se seleccione destino y cantidad) */}
                                    {selectedDestinoId &&
                                        cantidadMezcla &&
                                        parseFloat(cantidadMezcla) > 0 &&
                                        (() => {
                                            const item = selectedItem;
                                            const destino = destinos.find(
                                                (d) =>
                                                    d.id === selectedDestinoId,
                                            );

                                            if (item && destino) {
                                                // Fórmula ACTUALIZADA con multiplicador: (concentracion_destino * multiplicador * volumen_mezcla) / concentracion_item
                                                const multiplicador =
                                                    destino.multiplicador || 1;
                                                const cantidadItemCalculada =
                                                    (destino.concentracion *
                                                        multiplicador *
                                                        parseFloat(
                                                            cantidadMezcla,
                                                        )) /
                                                    item.concentracion;

                                                // return (
                                                //     <div className="rounded-lg bg-green-50 p-3">
                                                //         <p className="text-sm font-medium text-green-700">
                                                //             Cálculo automático
                                                //         </p>
                                                //         <div className="mt-2 grid grid-cols-2 gap-2 text-sm">
                                                //             <div>
                                                //                 <p className="text-green-600">
                                                //                     Cantidad de
                                                //                     item
                                                //                     necesaria:
                                                //                 </p>
                                                //                 <p className="font-bold text-green-900">
                                                //                     {cantidadItemCalculada.toFixed(
                                                //                         2,
                                                //                     )}{' '}
                                                //                     {
                                                //                         item
                                                //                             .unidad
                                                //                             ?.abreviatura
                                                //                     }
                                                //                 </p>
                                                //                 {multiplicador !==
                                                //                     1 && (
                                                //                     <p className="mt-1 text-xs text-amber-600">
                                                //                         Multiplicador
                                                //                         aplicado:{' '}
                                                //                         {
                                                //                             multiplicador
                                                //                         }
                                                //                         x
                                                //                     </p>
                                                //                 )}
                                                //             </div>
                                                //             <div className="text-right">
                                                //                 <p className="text-green-600">
                                                //                     Fórmula:
                                                //                 </p>
                                                //                 <p className="text-xs font-medium text-green-900">
                                                //                     {
                                                //                         destino.concentracion
                                                //                     }
                                                //                     %
                                                //                     {multiplicador !==
                                                //                     1
                                                //                         ? ` × ${multiplicador}`
                                                //                         : ''}
                                                //                     ×{' '}
                                                //                     {
                                                //                         cantidadMezcla
                                                //                     }{' '}
                                                //                     ÷{' '}
                                                //                     {
                                                //                         item.concentracion
                                                //                     }
                                                //                     %
                                                //                 </p>
                                                //                 {multiplicador !==
                                                //                     1 && (
                                                //                     <p className="mt-1 text-xs text-amber-600">
                                                //                         Mezcla
                                                //                         real:{' '}
                                                //                         {(
                                                //                             parseFloat(
                                                //                                 cantidadMezcla,
                                                //                             ) *
                                                //                             multiplicador
                                                //                         ).toFixed(
                                                //                             2,
                                                //                         )}{' '}
                                                //                         {
                                                //                             destino
                                                //                                 .unidad
                                                //                                 ?.abreviatura
                                                //                         }
                                                //                     </p>
                                                //                 )}
                                                //             </div>
                                                //         </div>
                                                //         <p className="mt-2 text-xs text-green-600">
                                                //             Esta cantidad se
                                                //             usará
                                                //             automáticamente en
                                                //             la solicitud
                                                //         </p>
                                                //     </div>
                                                // );
                                            }
                                            return null;
                                        })()}

                                    {/* Input para observaciones */}
                                    <div>
                                        <label className="mb-2 block text-sm font-medium">
                                            Observaciones
                                            <span className="ml-1 text-xs text-muted-foreground">
                                                (Opcional)
                                            </span>
                                        </label>
                                        <textarea
                                            value={observaciones}
                                            onChange={(e) =>
                                                setObservaciones(e.target.value)
                                            }
                                            className="min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:ring-2 focus:ring-ring focus:ring-offset-2 focus:outline-none"
                                            placeholder="Agrega detalles sobre la solicitud, área específica, hora requerida, etc."
                                        />
                                    </div>
                                </div>
                            );
                        })()}

                    <DialogFooter className="flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2">
                        <Button
                            variant="outline"
                            onClick={() => {
                                setSelectedDestinoId(null);
                                setCantidadMezcla('');
                                setObservaciones('');
                                handleCloseSolicitudDialog();
                            }}
                            type="button"
                        >
                            Cancelar
                        </Button>
                        <Button
                            onClick={() => {
                                if (!selectedDestinoId) {
                                    alert('Por favor seleccione un destino');
                                    return;
                                }
                                if (
                                    !cantidadMezcla ||
                                    parseFloat(cantidadMezcla) <= 0
                                ) {
                                    alert(
                                        'Por favor ingrese una cantidad de mezcla válida',
                                    );
                                    return;
                                }

                                // Calcular la cantidad de item necesaria
                                const item = items.find(
                                    (i) => i.id === selectedItemId,
                                );
                                const destino = destinos.find(
                                    (d) => d.id === selectedDestinoId,
                                );

                                if (!item || !destino) {
                                    alert(
                                        'Error al obtener información del item o destino',
                                    );
                                    return;
                                }

                                const multiplicador = destino.multiplicador || 1;
const cantidadItemCalculada =
    (destino.concentracion * multiplicador * parseFloat(cantidadMezcla)) / item.concentracion;

                                // Enviar la solicitud
                                router.post(
                                    route('movimiento-desinfeccion.solicitar'),
                                    {
                                        item_desinfeccion_id: selectedItemId,
                                        destino_desinfeccion_id:
                                            selectedDestinoId,
                                        cantidad_item: cantidadItemCalculada,
                                        cantidad_mezcla:
                                            parseFloat(cantidadMezcla),
                                        observacion:
                                            observaciones ||
                                            `Solicitud de ${item.nombre} para ${destino.nombre}`,
                                    },
                                    {
                                        preserveScroll: true,
                                        onSuccess: () => {
                                            // Limpiar estados
                                            setSelectedDestinoId(null);
                                            setCantidadMezcla('');
                                            setObservaciones('');
                                            handleCloseSolicitudDialog();
                                        },
                                        onError: (errors) => {
                                            console.error(
                                                'Error al enviar solicitud:',
                                                errors,
                                            );
                                            alert(
                                                'Error al enviar la solicitud. Por favor intente nuevamente.',
                                            );
                                        },
                                    },
                                );
                            }}
                            type="button"
                            disabled={
                                !selectedDestinoId ||
                                !cantidadMezcla ||
                                parseFloat(cantidadMezcla) <= 0
                            }
                        >
                            Solicitar
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
            {/* Dialog para entrega de item */}
            <Dialog
                open={isEntregaDialogOpen}
                onOpenChange={setIsEntregaDialogOpen}
            >
                <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle>Entregar Item de Desinfección</DialogTitle>
                    </DialogHeader>

                    {movimientoParaEntregar && (
                        <div className="max-h-[60vh] overflow-y-auto space-y-2 text-sm pr-2">
                            {/* Stock disponible */}
                            <div className="rounded-lg border dark:bg-neutral-950 dark:border dark:border-neutral-700 p-2">
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
                                                        .item_desinfeccion_id
                                                ] || 0) -
                                                    Math.abs(
                                                        props.stock?.[
                                                            movimientoParaEntregar
                                                                .item_desinfeccion_id
                                                        ] || 0,
                                                    ) <
                                                0
                                                    ? 'text-red-600'
                                                    : 'text-blue-700'
                                            }`}
                                        >
                                            {(props.stockReal?.[
                                                movimientoParaEntregar
                                                    .item_desinfeccion_id
                                            ] || 0) -
                                                Math.abs(
                                                    props.stock?.[
                                                        movimientoParaEntregar
                                                            .item_desinfeccion_id
                                                    ] || 0,
                                                ) <
                                            0
                                                ? 'Insuficiente ⚠️'
                                                : (props.stockReal?.[
                                                      movimientoParaEntregar
                                                          .item_desinfeccion_id
                                                  ] || 0) -
                                                  Math.abs(
                                                      props.stock?.[
                                                          movimientoParaEntregar
                                                              .item_desinfeccion_id
                                                      ] || 0,
                                                  ) +
                                                  ' ' +
                                                  movimientoParaEntregar.item
                                                      ?.unidad?.abreviatura}
                                        </p>
                                    </div>
                                    <div>
                                        <p className="text-xs text-green-600">
                                            Físico en almacén:
                                        </p>
                                        <p className="text-base font-semibold text-green-700">
                                            {props.stockReal?.[
                                                movimientoParaEntregar
                                                    .item_desinfeccion_id
                                            ] / 1}
                                            {
                                                movimientoParaEntregar.item
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

                            {/* Información del item */}
                            <div className="grid grid-cols-2 gap-2">
                                <div>
                                    <p className="text-sm font-medium text-muted-foreground">
                                        Item
                                    </p>
                                    <p className="font-medium">
                                        {movimientoParaEntregar.item?.nombre}
                                    </p>
                                </div>
                                <div>
                                    <p className="text-sm font-medium text-muted-foreground">
                                        Destino
                                    </p>
                                    <p className="font-medium">
                                        {movimientoParaEntregar.destino?.nombre}
                                    </p>
                                </div>
                            </div>

                            {/* Cantidad solicitada */}
                            <div className="rounded-lg bg-muted p-2">
                                <p className="mb-1 text-sm font-medium text-muted-foreground">
                                    Cantidad solicitada originalmente
                                </p>
                                <p className="text-base font-semibold">
                                    {movimientoParaEntregar.cantidad_item / 1}{' '}
                                    {
                                        movimientoParaEntregar.item?.unidad
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
                                        value={cantidadItemEntregada}
                                        onChange={(e) =>
                                            setCantidadItemEntregada(
                                                e.target.value,
                                            )
                                        }
                                        className="flex-1"
                                        autoFocus
                                    />
                                    <span className="min-w-16 text-sm font-medium text-muted-foreground">
                                        {
                                            movimientoParaEntregar.item?.unidad
                                                ?.abreviatura
                                        }
                                    </span>
                                </div>

                                {/* Mensaje condicional */}
                                {parseFloat(cantidadItemEntregada) !=
                                    movimientoParaEntregar.cantidad_item && (
                                    <>
                                        {(() => {
                                            const stockFisico =
                                                props.stockReal?.[
                                                    movimientoParaEntregar
                                                        .item_desinfeccion_id
                                                ] || 0;
                                            const stockAceptado = Math.abs(
                                                props.stock?.[
                                                    movimientoParaEntregar
                                                        .item_desinfeccion_id
                                                ] || 0,
                                            );
                                            const diferencia =
                                                parseFloat(
                                                    cantidadItemEntregada,
                                                ) -
                                                movimientoParaEntregar.cantidad_item;
                                            const stockExtraDisponible =
                                                stockFisico - stockAceptado;

                                            const debeMostrarAdvertencia =
                                                stockExtraDisponible <= 0 &&
                                                parseFloat(
                                                    cantidadItemEntregada,
                                                ) >
                                                    movimientoParaEntregar.cantidad_item;

                                            if (debeMostrarAdvertencia) {
                                                return (
                                                    <p className="mt-1 text-xs font-bold text-red-600">
                                                        ⚠️ La cantidad supera el
                                                        stock físico disponible
                                                        o ya se reservó para
                                                        otra solicitud
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
                                                                .item?.unidad
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

                                {/* Advertencia cuando se supera el stock físico */}
                                {parseFloat(cantidadItemEntregada) >
                                    (props.stockReal?.[
                                        movimientoParaEntregar
                                            .item_desinfeccion_id
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

                            {/* Observaciones de entrega */}
                            <div className="mt-2">
                                <label className="mb-2 block text-sm font-medium">
                                    Observaciones de entrega
                                    <span className="ml-1 text-xs text-muted-foreground">
                                        (Opcional)
                                    </span>
                                </label>
                                <textarea
                                    value={observacionesEntrega}
                                    onChange={(e) =>
                                        setObservacionesEntrega(e.target.value)
                                    }
                                    className="min-h-[80px] w-full rounded-md border border-input bg-background px-2 py-1 text-sm ring-offset-background placeholder:text-muted-foreground focus:ring-2 focus:ring-ring focus:ring-offset-2 focus:outline-none"
                                    placeholder="Escribe observaciones para esta entrega"
                                />
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
                    <h3 className="text-lg font-semibold text-gray-800">Reporte de Kardex de Desinfección</h3>
                    <p className="text-sm text-gray-600">
                        {fechaDesde} al {fechaHasta} - {datosPdf.length} movimientos
                    </p>
                </div>
            </div>
            <div className="h-full pt-14">
                <PDFViewer style={{ width: '100%', height: '100%', border: 'none' }}>
                    <ReporteKardexDesinfeccion
                        datos={datosPdf}
                        item={itemPdf}
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
