import { Button } from '@/components/ui/button';
import { PDFViewer } from '@react-pdf/renderer';
import { Textarea } from '@/components/ui/textarea';


import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import FechaHora from '@/components/ui/fecha-hora';
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
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from '@/components/ui/tooltip';
import { Popover, PopoverTrigger, PopoverContent } from '@/components/ui/popover';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useAdvancedFilters } from '@/hooks/use-advanced-filters';
import { useAuth } from '@/hooks/useAuth';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, Link, router, usePage } from '@inertiajs/react';
import {
    Edit,
    Eye,
    Filter,
    Milk,
    MoreHorizontal,
    Plus,
    Printer,
    Search,
    Trash2,
    X,
    ChevronDown,
    ChevronUp,
} from 'lucide-react';
import { useEffect, useState } from 'react';
import { route } from 'ziggy-js';

import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import TablePagination from '@/components/ui/table-pagination';
import { useInitials } from '@/hooks/use-initials';

import ReporteRecepcion from '@/pdf/ReporteRecepcion';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Recepciones de materia prima',
        href: '/planta-lacteos/recepciones-materia-prima',
    },
];

interface PageProps {
    recepciones: {
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
        item_materia_prima_id?: number;
        proveedor_materia_prima_id?: number;
        tiempo?: string;
        almacenero_id?: number;
        estado_id?: number;
        liberacion_id?: number;
        certificado?: string;
        lote?: string;
        fecha_vencimiento?: string;
        per_page?: number;
    };

    users?: { id: number; name: string; apellido: string }[];
    itemMateriaPrimas?: { id: number; nombre: string; descripcion?: string }[];
    proveedorMateriaPrimas?: { id: number; nombre: string }[];
    almaceneros?: { id: number; name: string; apellido: string }[];
    estados?: { id: number; nombre: string }[];
    liberaciones?: { id: number; nombre: string }[];
    almacenesMateriaPrima?: { id: number; nombre: string }[]; // Agregado desde el controlador
    isAdmin?: boolean; // Agregado desde el controlador
    estadosAnalisis?: { id: number; nombre: string }[];
    flash: {
        success?: string;
        error?: string;
    };
}

export default function Index() {
    const { props } = usePage();

    const [form, setForm] = useState({
        estado_id: '',
        liberacion_id: '',

    estado_analisis_id: '',
        observacion: '',
    });
    const [showFilters, setShowFilters] = useState(false);
    const [dialogOpen, setDialogOpen] = useState(false);
    const [selectedRecepcion, setSelectedRecepcion] = useState<any>(null);
    const [fechaDesde, setFechaDesde] = useState<string>('');
    const [fechaHasta, setFechaHasta] = useState<string>('');

    // Estados para el diálogo de generación de análisis
const [analisisDialogOpen, setAnalisisDialogOpen] = useState(false);
const [recepcionForAnalisis, setRecepcionForAnalisis] = useState<any>(null);
const [nivelInspeccion, setNivelInspeccion] = useState<string>('');
const [planMuestreo, setPlanMuestreo] = useState<string>('');
const [nca, setNca] = useState<string>('');
const [generandoAnalisis, setGenerandoAnalisis] = useState(false);

    const {
        hasPermission,
        belongsToUbicacion,
        canDo,
        isAdmin: isAdminFromAuth,
        user: authUser,
    } = useAuth();

    const {
        recepciones = {
            data: [],
            links: [],
            current_page: 1,
            last_page: 1,
            per_page: 10,
            total: 0,
        },
        filters: initialFilters = {},
        users = [],
        itemMateriaPrimas = [],
        proveedorMateriaPrimas = [],
        almaceneros = [],
        estados = [],
        liberaciones = [],
        almacenesMateriaPrima = [], // Nuevo prop
        isAdmin: isAdminFromBackend = false, // Nuevo prop
        estadosAnalisis = [],
        flash,
    } = props as unknown as PageProps;

    // Usar isAdmin del backend o del auth hook
    const isAdmin = isAdminFromBackend || isAdminFromAuth;

    const { filters, updateFilter, resetFilters } = useAdvancedFilters({
        routeName: 'recepciones-materia-prima.index2',
        initialFilters: {
            search: initialFilters.search || '',
            user_id: initialFilters.user_id?.toString() || undefined,
            item_materia_prima_id:
                initialFilters.item_materia_prima_id?.toString() || undefined,
            proveedor_materia_prima_id:
                initialFilters.proveedor_materia_prima_id?.toString() ||
                undefined,
            tiempo: initialFilters.tiempo || '',
            almacenero_id:
                initialFilters.almacenero_id?.toString() || undefined,
            estado_id: initialFilters.estado_id?.toString() || undefined,
            liberacion_id:
                initialFilters.liberacion_id?.toString() || undefined,
            certificado: initialFilters.certificado || '',
            lote: initialFilters.lote || '',
            fecha_vencimiento: initialFilters.fecha_vencimiento || '',
            per_page: initialFilters.per_page?.toString() || '10',
        },
        debounceFields: ['search'],
        debounceDelay: 600,
    });

    const hasActiveFilters = Object.values(filters).some(
        (value) => value && value !== '' && value !== '10',
    );

    const url = route('recepciones-materia-prima.pdf');

    // Estados simplificados
    const [datosPdf, setDatosPdf] = useState<any[]>([]);
    const [mostrarPdf, setMostrarPdf] = useState(false);
    const [certificadoUrl, setCertificadoUrl] = useState<string | null>(null);
    const [generandoPdf, setGenerandoPdf] = useState(false);

    const abrirCertificado = (recepcionId: number) => {
        setCertificadoUrl(route('recepciones-materia-prima.certificado', recepcionId));
    };
    const [cambiandoEstados, setCambiandoEstados] = useState<
        Record<number, boolean>
    >({});

    // Estado para editar observaciones rápidamente
    const [observacionDialogOpen, setObservacionDialogOpen] = useState(false);
    const [observacionText, setObservacionText] = useState<string>('');
    const [observacionLoading, setObservacionLoading] = useState(false);
    const [observacionRecepcionId, setObservacionRecepcionId] = useState<number | null>(null);

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'Aceptado':
            case 'Liberado':
                return 'bg-green-100 text-green-800';
            case 'Rechazado':
            case 'No liberado':
                return 'bg-red-100 text-red-800';
            case 'Pendiente':
            case 'Observado':
                return 'bg-yellow-100 text-yellow-800';
            default:
                return 'bg-muted text-foreground';
        }
    };



    const handleGenerarAnalisis = (recepcion: any) => {
    setRecepcionForAnalisis(recepcion);
    setNivelInspeccion('');
    setPlanMuestreo('');
    setNca('');
    setAnalisisDialogOpen(true);
};

const handleSubmitGenerarAnalisis = () => {
    if (!recepcionForAnalisis) return;
    if (!nivelInspeccion || !planMuestreo) {
        alert('Debes seleccionar nivel de inspección y plan de muestreo.');
        return;
    }

    setGenerandoAnalisis(true);
    router.post(
        route('recepciones-materia-prima.generar-analisis', recepcionForAnalisis.id),
        {
            nivel_inspeccion: nivelInspeccion,
            plan_muestreo: planMuestreo,
            nca: nca,
        },
        {
            preserveScroll: true,
            onSuccess: () => {
                setAnalisisDialogOpen(false);
                setGenerandoAnalisis(false);
                // El servidor redireccionará con el mensaje flash
            },
            onError: (errors: any) => {
                setGenerandoAnalisis(false);
                const errorMessage = errors?.msg || 'Error al generar los análisis';
                console.error('Error al generar análisis:', errors);
                alert(errorMessage);
            },
        }
    );
};

    const handleUpdateRecepcionEstado = (
    recepcionId: number,
    estadoId: number | null,
    liberacionId: number | null,
) => {
    setCambiandoEstados((prev) => ({ ...prev, [recepcionId]: true }));

    const currentRecepcion = recepciones.data.find((r: any) => r.id === recepcionId);
    const observacionToSend = currentRecepcion?.observacion ?? '';
    const estadoAnalisisToSend = currentRecepcion?.estado_analisis_id ?? null; // <--- NUEVO

    router.put(
        route('recepciones-materia-prima.update-estado', recepcionId),
        {
            estado_id: estadoId,
            liberacion_id: liberacionId,
            estado_analisis_id: estadoAnalisisToSend,   // <--- NUEVO
            observacion: observacionToSend,
        },
        {
            preserveScroll: true,
            preserveState: true,
            onSuccess: () => {
                setCambiandoEstados((prev) => ({
                    ...prev,
                    [recepcionId]: false,
                }));
            },
            onError: () => {
                setCambiandoEstados((prev) => ({
                    ...prev,
                    [recepcionId]: false,
                }));
            },
        },
    );
};

    // Función única para mostrar el PDF
    const fetchDatosPdf = async () => {
        if (!fechaDesde || !fechaHasta) {
            throw new Error('Por favor selecciona ambas fechas');
        }

        const params = new URLSearchParams();
        if (fechaDesde) params.append('fecha_desde', fechaDesde);
        if (fechaHasta) params.append('fecha_hasta', fechaHasta);

        const response = await fetch(`${url}?${params.toString()}`);
        if (!response.ok) {
            throw new Error('Error al obtener los datos: ' + response.statusText);
        }

        const data = await response.json();

        return data.recepciones.map((r: any) => ({
            fecha: r.tiempo,
            usuario: `${r.user?.name || ''} ${r.user?.apellido || ''}`,
            nombre_usuario: `${r.user?.name || ''} ${r.user?.apellido || ''}`,
            codigo_usuario: `${r.user?.codigo || ''}`,
            materiaPrima: r.item_materia_prima?.nombre || '-',
            proveedor: r.proveedor_materia_prima?.nombre || '-',
            marca: r.marca || '-',
            cantidad: `${r.cantidad}`,
            unidad: `${r.item_materia_prima?.unidad?.abreviatura || ''}`,
            almacenero: `${r.almacenero?.name || ''} ${r.almacenero?.apellido || ''}`,
            codigo_almacenero: `${r.almacenero?.codigo || ''}`,
            estado: r.estado?.nombre || '-',
            liberacion: r.liberacion?.nombre || '-',
            observacion: r.observacion || '-',
            certificado: r.certificado ? 'C.' : 'N.C.',
            limpieza_transporte: r.limpieza_transporte ? 'C.' : 'N.C.',
            sin_elementos: r.sin_elementos ? 'C.' : 'N.C.',
            cerrado: r.cerrado ? 'C.' : 'N.C.',
            estado_revision: r.estado_revision?.nombre || '-',
            nit: r.nit ? 'C.' : 'N.C.',
            rs: r.rs ? 'C.' : 'N.C.',
            correccion: r.correccion || '-',
            lotes:
                r.recepcion_lotes?.map((l: any) => ({
                    lote: l.lote,
                    fechaElab: l.fecha_elaboracion,
                    fechaVen: l.fecha_vencimiento,
                })) || [],
        }));
    };

    const handleMostrarPdf = async () => {
        if (!fechaDesde || !fechaHasta) {
            alert('Por favor selecciona ambas fechas');
            return;
        }

        setGenerandoPdf(true);
        try {
            const datos = await fetchDatosPdf();

            if (datos.length === 0) {
                alert('No hay datos para el rango de fechas seleccionado');
                return;
            }

            setDatosPdf(datos);
            setMostrarPdf(true);
        } catch (error) {
            console.error('Error al generar PDF:', error);
            alert('Error al generar el reporte. Por favor, intenta de nuevo.');
        } finally {
            setGenerandoPdf(false);
        }
    };

    const handleInput = (key: string, value: any) => {
        setForm((prev) => ({ ...prev, [key]: value }));
    };

    const handleSaveEstado = () => {
        if (!selectedRecepcion) return;

        router.put(
            route(
                'recepciones-materia-prima.update-estado',
                selectedRecepcion.id,
            ),
            form,
            {
                preserveScroll: true,
                onSuccess: () => setDialogOpen(false),
            },
        );
    };

    const handleViewDialog = (recepcion: any) => {
        setSelectedRecepcion(recepcion);
        setForm({
            estado_id: recepcion.estado_id?.toString() ?? '',
            liberacion_id: recepcion.liberacion_id?.toString() ?? '',
        estado_analisis_id: recepcion.estado_analisis_id?.toString() ?? '',
            observacion: recepcion.observacion ?? '',
        });
        setDialogOpen(true);
    };

    // Abrir diálogo rápido de observaciones
    const handleOpenObservacionDialog = (recepcion: any) => {
        setObservacionRecepcionId(recepcion.id);
        setObservacionText(recepcion.observacion || '');
        setObservacionDialogOpen(true);
    };


    const handleUpdateRecepcionEstadoAnalisis = (
    recepcionId: number,
    estadoAnalisisId: number | null,
) => {
    setCambiandoEstados((prev) => ({ ...prev, [recepcionId]: true }));

    const currentRecepcion = recepciones.data.find((r: any) => r.id === recepcionId);
    const estadoToSend = currentRecepcion?.estado_id ?? null;
    const liberacionToSend = currentRecepcion?.liberacion_id ?? null;
    const observacionToSend = currentRecepcion?.observacion ?? '';

    router.put(
        route('recepciones-materia-prima.update-estado', recepcionId),
        {
            estado_id: estadoToSend,
            liberacion_id: liberacionToSend,
            estado_analisis_id: estadoAnalisisId,
            observacion: observacionToSend,
        },
        {
            preserveScroll: true,
            preserveState: true,
            onSuccess: () => {
                setCambiandoEstados((prev) => ({
                    ...prev,
                    [recepcionId]: false,
                }));
            },
            onError: () => {
                setCambiandoEstados((prev) => ({
                    ...prev,
                    [recepcionId]: false,
                }));
            },
        },
    );
};
    const handleSaveObservacion = async () => {
    if (observacionRecepcionId === null) return;
    setObservacionLoading(true);

    try {
        const currentRecepcion = recepciones.data.find((r: any) => r.id === observacionRecepcionId);
        const estadoToSend = currentRecepcion?.estado_id ?? null;
        const liberacionToSend = currentRecepcion?.liberacion_id ?? null;
        const estadoAnalisisToSend = currentRecepcion?.estado_analisis_id ?? null; // <--- NUEVO

        await router.put(
            route('recepciones-materia-prima.update-estado', observacionRecepcionId),
            {
                estado_id: estadoToSend,
                liberacion_id: liberacionToSend,
                estado_analisis_id: estadoAnalisisToSend,   // <--- NUEVO
                observacion: observacionText,
            },
            {
                preserveScroll: true,
                onSuccess: () => {
                    setObservacionDialogOpen(false);
                },
                onError: () => {},
            },
        );
    } catch (e) {
        console.error(e);
    } finally {
        setObservacionLoading(false);
    }
};

    const handleEdit = (id: number) => {
        router.visit(route('recepciones-materia-prima1.edit', id));
    };

    const handleDelete = (id: number) => {
        if (
            confirm('¿Está seguro de eliminar esta recepción de materia prima?')
        ) {
            router.delete(route('recepciones-materia-prima.destroy', id), {
                preserveScroll: true,
            });
        }
    };

    const renderBool = (value: boolean | null | undefined) => {
        if (value === null || value === undefined) return '-';
        return value ? (
            <span className="font-bold text-green-600">✓</span>
        ) : (
            <span className="font-bold text-red-600">✗</span>
        );
    };

    const [expandedIds, setExpandedIds] = useState<number[]>([]);
    const toggleExpanded = (id: number) => {
        setExpandedIds((prev) =>
            prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id],
        );
    };

    // Formatea fechas "YYYY-MM-DD" sin desfasarlas por timezone
    const formatDate = (value?: string | null) => {
        if (!value) return '-';
        if (value.includes('T')) {
            try {
                return new Date(value).toLocaleDateString('es-BO');
            } catch (e) {
                return value;
            }
        }
        const parts = value.split('-');
        if (parts.length === 3) return `${parts[2]}/${parts[1]}/${parts[0]}`;
        return value;
    };

    const getInitials = useInitials();

    // Establecer fechas por defecto (últimos 30 días)
    useEffect(() => {
        const hoy = new Date();
        const hace30Dias = new Date();
        hace30Dias.setDate(hoy.getDate() - 30);

        setFechaDesde(hace30Dias.toISOString().split('T')[0]);
        setFechaHasta(hoy.toISOString().split('T')[0]);
    }, []);

    // Mostrar mensaje flash si existe
    useEffect(() => {
        if (flash?.success) {
            // Puedes usar tu componente Toast aquí
            console.log('Success:', flash.success);
        }
        if (flash?.error) {
            console.log('Error:', flash.error);
        }
    }, [flash]);

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Recepciones de Materia Prima" />
            <div className="space-y-2 px-2 py-2 sm:px-6">
                {/* Mostrar estado de administrador */}
                {isAdmin && (
                    <div className="mb-4 rounded bg-blue-100 p-3 text-blue-800">
                        <div className="flex items-center">
                            <span className="font-medium">
                                Modo Administrador:
                            </span>
                            <span className="ml-2">
                                Puedes ver todos los datos de todas las
                                ubicaciones.
                            </span>
                        </div>
                    </div>
                )}

                {/* Header */}
                <div className="flex items-center justify-between">
                    {/* Búsqueda rápida */}
                    <div className="relative max-w-md">
                        <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 transform text-muted-foreground" />
                        <Input
                            placeholder="Buscar por observaciones, marca, lote..."
                            value={filters.search || ''}
                            onChange={(e) =>
                                updateFilter('search', e.target.value)
                            }
                            className="pl-10"
                        />
                    </div>
                    <div className="flex items-center gap-2">
                        {hasPermission('c_recepcionMateriaPrima') && (
                            <Link
                                href={route('recepciones-materia-prima1.create')}
                            >
                                <Button size="sm">
                                    <Plus className="h-4 w-4" />
                                    <p className="hidden md:block">
                                        Nueva Recepción
                                    </p>
                                </Button>
                            </Link>
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
                    <div className="rounded-lg border border-border bg-muted/50 p-4">
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
                                onChange={(v) => updateFilter('user_id', v)}
                                placeholder="Usuarios"
                                options={users.map((r) => ({
                                    value: r.id.toString(),
                                    label: `${r.name} ${r.apellido}`,
                                }))}
                            />

                            <FilterSelect
                                value={filters.item_materia_prima_id}
                                onChange={(v) =>
                                    updateFilter('item_materia_prima_id', v)
                                }
                                placeholder="Materia Prima"
                                options={itemMateriaPrimas.map((s) => ({
                                    value: s.id.toString(),
                                    label: s.nombre,
                                }))}
                            />
                            <FilterSelect
                                value={filters.proveedor_materia_prima_id}
                                onChange={(v) =>
                                    updateFilter(
                                        'proveedor_materia_prima_id',
                                        v,
                                    )
                                }
                                placeholder="Proveedores"
                                options={proveedorMateriaPrimas.map((s) => ({
                                    value: s.id.toString(),
                                    label: s.nombre,
                                }))}
                            />

                            <FilterSelect
                                value={filters.almacenero_id}
                                onChange={(v) =>
                                    updateFilter('almacenero_id', v)
                                }
                                placeholder="Almaceneros"
                                options={almaceneros.map((s) => ({
                                    value: s.id.toString(),
                                    label: `${s.name} ${s.apellido}`,
                                }))}
                            />

                            <FilterSelect
                                value={filters.estado_id}
                                onChange={(v) => updateFilter('estado_id', v)}
                                placeholder="Estados"
                                options={estados.map((s) => ({
                                    value: s.id.toString(),
                                    label: s.nombre,
                                }))}
                            />

                            <FilterSelect
                                value={filters.liberacion_id}
                                onChange={(v) =>
                                    updateFilter('liberacion_id', v)
                                }
                                placeholder="Liberaciones"
                                options={liberaciones.map((s) => ({
                                    value: s.id.toString(),
                                    label: s.nombre,
                                }))}
                            />

                            <FilterSelect
                                value={filters.certificado}
                                onChange={(v) => updateFilter('certificado', v)}
                                placeholder="Certificado"
                                options={[
                                    { value: '1', label: 'Con Certificado' },
                                    {
                                        value: '0',
                                        label: 'Sin Certificado',
                                    },
                                ]}
                            />

                            <Input
                                value={filters.lote || ''}
                                onChange={(event) =>
                                    updateFilter('lote', event.target.value)
                                }
                                placeholder="Lote"
                            />

                            <Input
                                type="date"
                                value={filters.fecha_vencimiento || ''}
                                onChange={(event) =>
                                    updateFilter('fecha_vencimiento', event.target.value)
                                }
                                aria-label="Fecha de vencimiento"
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

                {/* Tabla */}
                <div className="overflow-hidden rounded-lg border border-border bg-background shadow-sm">
                    <div className="overflow-x-auto">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    {[
                                            '',
                                            'Fecha',
                                            'Almacén',
                                            'Usuario',
                                            'Materia Prima',
                                            'Cantidad',
                                            'Proveedor',
                                            'Marca',
                                            'LT',
                                            'SEE',
                                            'C',
                                            'NIT',
                                            'RS',
                                            'Cert',
                                            'C. Cert',
                                            'Almacenero',
                                            'Estado',
                                            'Liberado',

            'Estado Análisis',
                                            'Est. Revisión',
                                            'Obs',
                                            'Correc',
                                            'Acciones',
                                        ].map((col, idx) => (
                                            <TableHead key={idx}>{col}</TableHead>
                                        ))}
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {recepciones.data.length === 0 ? (
                                    <TableRow>
                                        <TableCell
                                            colSpan={23}
                                            className="py-8 text-center text-muted-foreground"
                                        >
                                            <div className="flex flex-col items-center justify-center">
                                                <Milk className="mb-3 h-12 w-12 text-muted-foreground/50" />
                                                <p className="mb-1 text-lg font-medium text-foreground">
                                                    No se encontraron
                                                    recepciones
                                                </p>
                                                <p className="text-muted-foreground">
                                                    {hasActiveFilters
                                                        ? 'Intenta ajustar los filtros para ver más resultados'
                                                        : 'No hay recepciones registradas en el sistema'}
                                                </p>
                                                {!isAdmin &&
                                                    authUser?.ubicacion_id ===
                                                        undefined && (
                                                        <p className="mt-2 text-sm text-red-600">
                                                            Usuario sin
                                                            ubicación asignada.
                                                            Contacta al
                                                            administrador.
                                                        </p>
                                                    )}
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    recepciones.data.map((recepcion) => (
                                        <>
                                        <TableRow
                                            key={recepcion.id}
                                            className="hover:bg-muted/50"
                                        >
                                            <TableCell>
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    className="h-8 w-8 p-0"
                                                    onClick={() => toggleExpanded(recepcion.id)}
                                                >
                                                    {expandedIds.includes(recepcion.id) ? (
                                                        <ChevronUp className="h-4 w-4" />
                                                    ) : (
                                                        <ChevronDown className="h-4 w-4" />
                                                    )}
                                                </Button>
                                            </TableCell>
                                            <TableCell>
                                                <FechaHora
                                                    value={recepcion.tiempo}
                                                    mode="stacked"
                                                />
                                            </TableCell>
                                            <TableCell>
                                                {recepcion.almacen?.nombre ||
                                                    '-'}
                                            </TableCell>
                                            <TableCell className="text-muted-foreground">
                                                <Popover>
                                                    <PopoverTrigger asChild>
                                                        <div
                                                            title={`${recepcion.user?.name || ''} ${recepcion.user?.apellido || ''}`.trim() || undefined}
                                                            className="inline-flex items-center justify-center h-7 w-7 rounded-full bg-muted/10 text-xs font-medium cursor-pointer"
                                                        >
                                                            {getInitials(`${recepcion.user?.name || ''} ${recepcion.user?.apellido || ''}`) || '-'}
                                                        </div>
                                                    </PopoverTrigger>
                                                    <PopoverContent className="bg-primary text-primary-foreground rounded-md px-3 py-1.5 text-xs max-w-xs shadow-md border">
                                                        <div>
                                                            <p className="font-medium">
                                                                {`${recepcion.user?.name || ''} ${recepcion.user?.apellido || ''}`.trim() || '-'}
                                                            </p>
                                                        </div>
                                                    </PopoverContent>
                                                </Popover>
                                            </TableCell>

                                            <TableCell>
                                                <Popover>
                                                    <PopoverTrigger asChild>
                                                        <div
                                                            title={`${recepcion.item_materia_prima?.nombre || ''}${recepcion.item_materia_prima?.descripcion ? ` — ${recepcion.item_materia_prima.descripcion}` : ''}`.trim() || undefined}
                                                            className="cursor-pointer"
                                                        >
                                                            <div className="truncate font-medium text-foreground">
                                                                {recepcion
                                                                    .item_materia_prima
                                                                    ?.nombre ||
                                                                    '-'}
                                                            </div>
                                                            <div className="truncate text-xs text-muted-foreground">
                                                                {recepcion
                                                                    .item_materia_prima
                                                                    ?.descripcion ||
                                                                    '-'}
                                                            </div>
                                                        </div>
                                                    </PopoverTrigger>
                                                    <PopoverContent className="bg-primary text-primary-foreground rounded-md px-3 py-1.5 text-xs max-w-sm shadow-md border">
                                                        <p className="font-medium">
                                                            {recepcion.item_materia_prima?.nombre || '-'}
                                                        </p>
                                                        <p>
                                                            {recepcion.item_materia_prima?.descripcion || '-'}
                                                        </p>
                                                    </PopoverContent>
                                                </Popover>
                                            </TableCell>
                                            <TableCell>
                                                <div>
                                                    <div className="font-medium text-foreground">
                                                        {recepcion.cantidad}{' '}
                                                        {recepcion
                                                            .item_materia_prima
                                                            ?.unidad
                                                            ?.abreviatura || ''}
                                                    </div>
                                                    <div className="text-xs text-muted-foreground">
                                                        {recepcion.unidades}{' '}
                                                        {recepcion.unidades &&
                                                            '[U]'}
                                                    </div>
                                                </div>
                                            </TableCell>

                                            <TableCell>
                                                {recepcion
                                                    .proveedor_materia_prima
                                                    ?.nombre || '-'}
                                            </TableCell>
                                            <TableCell>
                                                {recepcion.marca || '-'}
                                            </TableCell>
                                            <TableCell>
                                                {renderBool(
                                                    recepcion.limpieza_transporte,
                                                )}
                                            </TableCell>
                                            <TableCell>
                                                {renderBool(
                                                    recepcion.sin_elementos,
                                                )}
                                            </TableCell>
                                            <TableCell>
                                                {renderBool(recepcion.cerrado)}
                                            </TableCell>
                                            <TableCell>
                                                {renderBool(recepcion.nit)}
                                            </TableCell>
                                            <TableCell>
                                                {renderBool(recepcion.rs)}
                                            </TableCell>
                                            <TableCell>
                                                {renderBool(
                                                    recepcion.certificado,
                                                )}
                                            </TableCell>
                                            <TableCell className="max-w-[150px] truncate">
                                                {recepcion.codigo_certificado || '-'}
                                            </TableCell>
                                            <TableCell>
                                                <Popover>
                                                    <PopoverTrigger asChild>
                                                        <div
                                                            title={`${recepcion.almacenero?.name || ''} ${recepcion.almacenero?.apellido || ''}`.trim() || undefined}
                                                            className="inline-flex items-center justify-center h-7 w-7 rounded-full bg-muted/10 text-xs font-medium cursor-pointer"
                                                        >
                                                            {getInitials(`${recepcion.almacenero?.name || ''} ${recepcion.almacenero?.apellido || ''}`) || '-'}
                                                        </div>
                                                    </PopoverTrigger>
                                                    <PopoverContent className="bg-primary text-primary-foreground rounded-md px-3 py-1.5 text-xs max-w-xs shadow-md border">
                                                        <div>
                                                            <p className="font-medium">
                                                                {`${recepcion.almacenero?.name || ''} ${recepcion.almacenero?.apellido || ''}`.trim() || '-'}
                                                            </p>
                                                        </div>
                                                    </PopoverContent>
                                                </Popover>
                                            </TableCell>
                                            <TableCell>
                                                {hasPermission('u_recepcionMateriaPrima') ? (
                                                    <DropdownMenu>
                                                        <DropdownMenuTrigger
                                                            asChild
                                                        >
                                                            <Button
                                                                variant="outline"
                                                                size="sm"
                                                                disabled={
                                                                    cambiandoEstados[
                                                                        recepcion.id
                                                                    ]
                                                                }
                                                                className={`h-7 border-0 px-3 text-xs font-medium ${getStatusColor(
                                                                    recepcion.estado?.nombre ||
                                                                        'Pendiente',
                                                                )} flex items-center gap-1`}
                                                            >
                                                                {cambiandoEstados[
                                                                    recepcion.id
                                                                ] ? (
                                                                    <div className="h-3 w-3 animate-spin rounded-full border-2 border-current border-t-transparent" />
                                                                ) : (
                                                                    <>
                                                                        {
                                                                            recepcion.estado
                                                                                ?.nombre ||
                                                                            '-'
                                                                        }
                                                                        <ChevronDown className="h-3 w-3" />
                                                                    </>
                                                                )}
                                                            </Button>
                                                        </DropdownMenuTrigger>
                                                        <DropdownMenuContent
                                                            align="start"
                                                            className="w-48"
                                                        >


                                                            {estados.map(
                                                                (estado) => (
                                                                    <DropdownMenuItem
                                                                        key={estado.id}
                                                                        onClick={() =>
                                                                            handleUpdateRecepcionEstado(
                                                                                recepcion.id,
                                                                                estado.id,
                                                                                recepcion.liberacion?.id || null,
                                                                            )
                                                                        }
                                                                        className="flex items-center justify-between"
                                                                    >
                                                                        <span>
                                                                            {estado.nombre}
                                                                        </span>
                                                                        {recepcion.estado?.id ===
                                                                            estado.id && (
                                                                            <span className="text-green-600">✓</span>
                                                                        )}
                                                                    </DropdownMenuItem>


                                                                ),
                                                            )}
                                                        </DropdownMenuContent>
                                                    </DropdownMenu>

                                                ) : (
                                                    <span
                                                        className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium ${getStatusColor(
                                                            recepcion.estado?.nombre ||
                                                                'Pendiente',
                                                        )}`}
                                                    >
                                                        {recepcion.estado?.nombre ||
                                                            '-'}
                                                    </span>
                                                )}
                                            </TableCell>
                                            <TableCell>
                                                {hasPermission('u_recepcionMateriaPrima') ? (
                                                    <DropdownMenu>
                                                        <DropdownMenuTrigger
                                                            asChild
                                                        >
                                                            <Button
                                                                variant="outline"
                                                                size="sm"
                                                                disabled={
                                                                    cambiandoEstados[
                                                                        recepcion.id
                                                                    ]
                                                                }
                                                                className={`h-7 border-0 px-3 text-xs font-medium ${getStatusColor(
                                                                    recepcion.liberacion?.nombre ||
                                                                        'Pendiente',
                                                                )} flex items-center gap-1`}
                                                            >
                                                                {cambiandoEstados[
                                                                    recepcion.id
                                                                ] ? (
                                                                    <div className="h-3 w-3 animate-spin rounded-full border-2 border-current border-t-transparent" />
                                                                ) : (
                                                                    <>
                                                                        {
                                                                            recepcion.liberacion
                                                                                ?.nombre ||
                                                                            '-'
                                                                        }
                                                                        <ChevronDown className="h-3 w-3" />
                                                                    </>
                                                                )}
                                                            </Button>
                                                        </DropdownMenuTrigger>
                                                        <DropdownMenuContent
                                                            align="start"
                                                            className="w-48"
                                                        >
                                                            {liberaciones.map(
                                                                (liberacion) => (
                                                                    <DropdownMenuItem
                                                                        key={liberacion.id}
                                                                        onClick={() =>
                                                                            handleUpdateRecepcionEstado(
                                                                                recepcion.id,
                                                                                recepcion.estado?.id || null,
                                                                                liberacion.id,
                                                                            )
                                                                        }
                                                                        className="flex items-center justify-between"
                                                                    >
                                                                        <span>
                                                                            {liberacion.nombre}
                                                                        </span>
                                                                        {recepcion.liberacion?.id ===
                                                                            liberacion.id && (
                                                                            <span className="text-green-600">✓</span>
                                                                        )}
                                                                    </DropdownMenuItem>
                                                                ),
                                                            )}
                                                        </DropdownMenuContent>
                                                    </DropdownMenu>
                                                ) : (
                                                    <span
                                                        className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium ${getStatusColor(
                                                            recepcion.liberacion
                                                                ?.nombre ||
                                                                'Pendiente',
                                                        )}`}
                                                    >
                                                        {recepcion.liberacion
                                                            ?.nombre ||
                                                            '-'}
                                                    </span>
                                                )}
                                            </TableCell>
                                            {/* Celda: Estado Análisis */}
<TableCell>
    {hasPermission('u_recepcionMateriaPrima') ? (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button
                    variant="outline"
                    size="sm"
                    disabled={cambiandoEstados[recepcion.id]}
                    className={`h-7 border-0 px-3 text-xs font-medium ${getStatusColor(
                        recepcion.estado_analisis?.nombre || 'Pendiente',
                    )} flex items-center gap-1`}
                >
                    {cambiandoEstados[recepcion.id] ? (
                        <div className="h-3 w-3 animate-spin rounded-full border-2 border-current border-t-transparent" />
                    ) : (
                        <>
                            {recepcion.estado_analisis?.nombre || '-'}
                            <ChevronDown className="h-3 w-3" />
                        </>
                    )}
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="w-48">
                {estadosAnalisis.map((estado) => (
                    <DropdownMenuItem
                        key={estado.id}
                        onClick={() =>
                            handleUpdateRecepcionEstadoAnalisis(
                                recepcion.id,
                                estado.id,
                            )
                        }
                        className="flex items-center justify-between"
                    >
                        <span>{estado.nombre}</span>
                        {recepcion.estado_analisis?.id === estado.id && (
                            <span className="text-green-600">✓</span>
                        )}
                    </DropdownMenuItem>
                ))}
            </DropdownMenuContent>
        </DropdownMenu>
    ) : (
        <span
            className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium ${getStatusColor(
                recepcion.estado_analisis?.nombre || 'Pendiente',
            )}`}
        >
            {recepcion.estado_analisis?.nombre || '-'}
        </span>
    )}
</TableCell>
                                            {/* Celda: Estado Revisión */}
                                            <TableCell>
                                                <span
                                                    className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium ${getStatusColor(
                                                        recepcion.estado_revision?.nombre || 'Pendiente',
                                                    )}`}
                                                >
                                                    {recepcion.estado_revision?.nombre || '-'}
                                                </span>
                                                {recepcion.revisor && (
                                                    <p className="text-xs text-muted-foreground mt-1">
                                                        Por: {recepcion.revisor.name} {recepcion.revisor.apellido}
                                                    </p>
                                                )}
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex items-center gap-2">
                                                    <div className="max-w-[140px] truncate">
                                                        {recepcion.observacion || '-'}
                                                    </div>
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        className="h-7 w-7 p-0"
                                                        onClick={() =>
                                                            handleOpenObservacionDialog(
                                                                recepcion,
                                                            )
                                                        }
                                                    >
                                                        <Eye className="h-4 w-4" />
                                                        <span className="sr-only">
                                                            Editar observación
                                                        </span>
                                                    </Button>
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <div className="max-w-[150px] truncate">
                                                    {recepcion.correccion ||
                                                        '-'}
                                                </div>
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
                                                                Abrir menú
                                                            </span>
                                                        </Button>
                                                    </DropdownMenuTrigger>
                                                    <DropdownMenuContent
                                                        align="end"
                                                        className="w-48"
                                                    >
                                                     {/* <DropdownMenuItem
                                                            onClick={() =>
                                                                handleViewDialog(
                                                                    recepcion,
                                                                )
                                                            }
                                                        >
                                                            <Eye className="mr-2 h-4 w-4" />
                                                            <span>
                                                                Ver detalles
                                                            </span>
                                                        </DropdownMenuItem> */}
                                                        {hasPermission('u_recepcionMateriaPrima') && (
                                                            <DropdownMenuItem
                                                                onClick={() =>
                                                                    handleEdit(
                                                                        recepcion.id,
                                                                    )
                                                                }
                                                            >
                                                                <Edit className="mr-2 h-4 w-4" />
                                                                <span>
                                                                    Editar
                                                                    recepción
                                                                </span>
                                                            </DropdownMenuItem>
                                                        )}
                                                        {hasPermission('u_recepcionMateriaPrima') &&
                                                            recepcion.estado_analisis?.nombre?.toLowerCase() !== 'analizado' && (
                                                                <DropdownMenuItem onClick={() => handleGenerarAnalisis(recepcion)}>
                                                                    <span className="mr-2">🔬</span>
                                                                    <span>Generar análisis</span>
                                                                </DropdownMenuItem>
                                                            )
                                                        }
                                                        {recepcion.certificado_pdf && (
                                                            <DropdownMenuItem onClick={() => abrirCertificado(recepcion.id)}>
                                                                <Eye className="mr-2 h-4 w-4" />
                                                                <span>Ver certificado PDF</span>
                                                            </DropdownMenuItem>
                                                        )}
                                                        {canDo(
                                                            recepcion,
                                                            'd_recepcionMateriaPrima',
                                                            6,
                                                            true,
                                                        ) && (
                                                            <DropdownMenuItem
                                                                onClick={() =>
                                                                    handleDelete(
                                                                        recepcion.id,
                                                                    )
                                                                }
                                                                className="text-destructive focus:text-destructive"
                                                            >
                                                                <Trash2 className="mr-2 h-4 w-4" />
                                                                <span>
                                                                    Eliminar
                                                                    recepción
                                                                </span>
                                                            </DropdownMenuItem>
                                                        )}

                                                        <DropdownMenuItem onClick={() => router.visit(route('recepciones-materia-prima.analisis.index', recepcion.id))}>
    <span className="mr-2">🔬</span>
    <span>Ver análisis</span>
</DropdownMenuItem>
                                                    </DropdownMenuContent>
                                                </DropdownMenu>
                                            </TableCell>
                                        </TableRow>
                                        {expandedIds.includes(recepcion.id) && (
                                            <TableRow key={`expanded-${recepcion.id}`}>
                                                <TableCell colSpan={22} className="bg-muted/10">
                                                    <div className="p-3">
                                                        {/* <h5 className="mb-2 font-medium">Lotes</h5> */}
                                                        {recepcion.recepcion_lotes && recepcion.recepcion_lotes.length > 0 ? (
                                                            <div className="overflow-x-auto">
                                                                <table className="w-full table-auto">
                                                                    <thead>
                                                                        <tr className="text-left text-xs text-muted-foreground">
                                                                            <th className="pb-2">Lote</th>
                                                                            <th className="pb-2">Fecha Elaboración</th>
                                                                            <th className="pb-2">Fecha Vencimiento</th>
                                                                        </tr>
                                                                    </thead>
                                                                    <tbody>
                                                                        {recepcion.recepcion_lotes.map((lote: any) => (
                                                                            <tr key={lote.id} className="border-t">
                                                                                <td className="py-2">{lote.lote}</td>
                                                                                <td className="py-2">{formatDate(lote.fecha_elaboracion)}</td>
                                                                                <td className="py-2">{formatDate(lote.fecha_vencimiento)}</td>
                                                                            </tr>
                                                                        ))}
                                                                    </tbody>
                                                                </table>
                                                            </div>
                                                        ) : (
                                                            <div className="text-sm text-muted-foreground">Sin lotes asociados</div>
                                                        )}
                                                    </div>
                                                </TableCell>
                                            </TableRow>
                                        )}
                                    </>
                                    ))
                                )}
                            </TableBody>
                        </Table>
                    </div>

                    {/* Paginación */}
                    {recepciones.data.length > 0 && (
                        <div className="border-t border-border px-4 py-3">
                            <TablePagination
                                pagination={recepciones}
                                onPageChange={(page) =>
                                    router.get(
                                        route(
                                            'recepciones-materia-prima.index2',
                                        ),
                                        { ...filters, page },
                                        { preserveState: true, replace: true },
                                    )
                                }
                            />
                        </div>
                    )}
                </div>

                {/* Info rápida */}
                <div className="flex justify-between">
                    <p className="mt-1 text-muted-foreground">
                        {recepciones.total} recepciones registradas
                    </p>
                    <div>
                        {recepciones.data.length > 0 && (
                            <div className="text-center">
                                <p className="text-muted-foreground">
                                    Mostrando{' '}
                                    <span className="font-medium text-foreground">
                                        {recepciones.data.length}
                                    </span>{' '}
                                    de{' '}
                                    <span className="font-medium text-foreground">
                                        {recepciones.total}
                                    </span>{' '}
                                    recepciones
                                </p>
                            </div>
                        )}
                    </div>
                </div>

                {/* Controles de PDF */}
                <div className="rounded-lg border border-border bg-muted/50 p-4">
                    <h3 className="mb-3 font-semibold text-foreground">
                        Generar Reporte PDF
                    </h3>
                    <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
                        <div>
                            <label className="mb-1 block text-sm font-medium">
                                Fecha Desde
                            </label>
                            <Input
                                type="date"
                                value={fechaDesde}
                                onChange={(e) => setFechaDesde(e.target.value)}
                            />
                        </div>
                        <div>
                            <label className="mb-1 block text-sm font-medium">
                                Fecha Hasta
                            </label>
                            <Input
                                type="date"
                                value={fechaHasta}
                                onChange={(e) => setFechaHasta(e.target.value)}
                            />
                        </div>
                        <div className="flex items-end gap-2">
                            <Button
                                variant="default"
                                size="sm"
                                onClick={handleMostrarPdf}
                                className="flex items-center gap-2"
                                disabled={generandoPdf}
                            >
                                <Printer className="h-4 w-4" />
                                {generandoPdf ? 'Generando...' : 'Ver Reporte'}
                            </Button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Modal para mostrar PDF */}
            {mostrarPdf && datosPdf.length > 0 && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-0 sm:p-3">
                    <div className="relative flex h-[100dvh] w-full min-w-0 flex-col overflow-hidden bg-white shadow-2xl sm:h-[95dvh] sm:w-[95vw] sm:rounded-lg">
                        {/* Botón para cerrar */}
                        <button
                            className="absolute top-4 right-4 z-50 flex h-8 w-8 items-center justify-center rounded-full bg-red-600 text-white hover:bg-red-700"
                            onClick={() => setMostrarPdf(false)}
                            aria-label="Cerrar"
                        >
                            <X className="h-5 w-5" />
                        </button>

                        {/* Header del modal */}
                        <div className="z-40 flex shrink-0 items-center justify-between bg-gray-100 px-3 py-2 pr-14 sm:px-4 sm:py-3">
                            <div className="min-w-0">
                                <h3 className="truncate text-base font-semibold text-gray-800 sm:text-lg">
                                    Reporte de Recepciones
                                </h3>
                                <p className="truncate text-xs text-gray-600 sm:text-sm">
                                    {fechaDesde} al {fechaHasta} -{' '}
                                    {datosPdf.length} registros
                                </p>
                            </div>
                            <div className="hidden items-center gap-2 sm:flex">
                                <span className="text-sm text-gray-500">
                                    Presiona ESC para cerrar
                                </span>
                            </div>
                        </div>

                        {/* Contenedor del PDF */}
                        <div className="min-h-0 min-w-0 flex-1">
                            <PDFViewer
                                style={{
                                    width: '100%',
                                    height: '100%',
                                    border: 'none',
                                }}
                            >
                                <ReporteRecepcion datos={datosPdf} />
                            </PDFViewer>
                        </div>
                    </div>
                </div>
            )}

            {certificadoUrl && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-0 sm:p-3">
                    <div className="relative flex h-[100dvh] w-full min-w-0 flex-col overflow-hidden bg-white shadow-2xl sm:h-[95dvh] sm:w-[95vw] sm:rounded-lg">
                        <button
                            className="absolute top-4 right-4 z-50 flex h-8 w-8 items-center justify-center rounded-full bg-red-600 text-white hover:bg-red-700"
                            onClick={() => setCertificadoUrl(null)}
                            aria-label="Cerrar certificado"
                        >
                            <X className="h-5 w-5" />
                        </button>

                        <div className="z-40 flex shrink-0 items-center justify-between bg-gray-100 px-3 py-2 pr-14 sm:px-4 sm:py-3">
                            <div className="min-w-0">
                                <h3 className="truncate text-base font-semibold text-gray-800 sm:text-lg">
                                    Certificado de Recepción
                                </h3>
                                <p className="truncate text-xs text-gray-600 sm:text-sm">
                                    Documento PDF adjunto
                                </p>
                            </div>
                        </div>

                        <div className="min-h-0 min-w-0 flex-1">
                            <iframe
                                src={certificadoUrl}
                                title="Certificado de recepción"
                                className="h-full w-full border-0"
                            />
                        </div>
                    </div>
                </div>
            )}

            {/* Diálogo rápido para editar observaciones */}
            <Dialog open={observacionDialogOpen} onOpenChange={setObservacionDialogOpen}>
                <DialogContent className="max-w-lg">
                    <DialogHeader>
                        <DialogTitle>Editar observación</DialogTitle>
                        <DialogDescription>
                            Modifica la observación de la recepción.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="mt-2">
                        <Textarea
                            value={observacionText}
                            onChange={(e) => setObservacionText(e.target.value)}
                            rows={6}
                        />
                    </div>
                    <DialogFooter>
                        <Button
                            variant="outline"
                            onClick={() => setObservacionDialogOpen(false)}
                        >
                            Cancelar
                        </Button>
                        <Button
                            variant="default"
                            onClick={handleSaveObservacion}
                            disabled={observacionLoading}
                        >
                            {observacionLoading ? 'Guardando...' : 'Guardar'}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-3xl">
                    <DialogHeader>
                        <DialogTitle>Detalles de la Recepción</DialogTitle>
                        <DialogDescription>
                            Información de la recepción seleccionada y sus lotes
                            asociados.
                        </DialogDescription>
                    </DialogHeader>

                    <div className="mt-4 space-y-4">
                        {selectedRecepcion && (
                            <>
                                {/* Información general de la recepción */}
                                {/* <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                                    <div>
                                        <strong>Fecha:</strong>{' '}
                                        <FechaHora
                                            value={selectedRecepcion.tiempo}
                                        />
                                    </div>
                                    <div>
                                        <strong>Usuario:</strong>{' '}
                                        {selectedRecepcion.user?.name}{' '}
                                        {selectedRecepcion.user?.apellido}
                                    </div>
                                    <div>
                                        <strong>Materia Prima:</strong>{' '}
                                        {
                                            selectedRecepcion.item_materia_prima
                                                ?.nombre
                                        }
                                    </div>
                                    <div>
                                        <strong>Proveedor:</strong>{' '}
                                        {
                                            selectedRecepcion
                                                .proveedor_materia_prima?.nombre
                                        }
                                    </div>
                                    <div>
                                        <strong>Cantidad:</strong>{' '}
                                        {selectedRecepcion.cantidad}{' '}
                                        {selectedRecepcion.item_materia_prima
                                            ?.unidad?.abreviatura || ''}
                                    </div>
                                    <div>
                                        <strong>Unidades:</strong>{' '}
                                        {selectedRecepcion.unidades || '-'}
                                    </div>
                                    <div>
                                        <strong>Marca:</strong>{' '}
                                        {selectedRecepcion.marca || '-'}
                                    </div>
                                    <div>
                                        <strong>Almacén:</strong>{' '}
                                        {selectedRecepcion.almacen?.nombre ||
                                            '-'}
                                    </div>
                                    <div>
                                        <strong>Almacenero:</strong>{' '}
                                        {selectedRecepcion.almacenero?.name}{' '}
                                        {selectedRecepcion.almacenero?.apellido}
                                    </div>
                                    <div>
                                        <strong>Estado:</strong>{' '}
                                        {selectedRecepcion.estado?.nombre ||
                                            '-'}
                                    </div>
                                    <div>
                                        <strong>Liberación:</strong>{' '}
                                        {selectedRecepcion.liberacion?.nombre ||
                                            '-'}
                                    </div>
                                    <div className="col-span-2">
                                        <strong>Observación:</strong>{' '}
                                        {selectedRecepcion.observacion || '-'}
                                    </div>
                                    <div className="col-span-2">
                                        <strong>Corrección:</strong>{' '}
                                        {selectedRecepcion.correccion || '-'}
                                    </div>
                                </div> */}

                                {/* Información de checks */}
                                {/* <div className="grid grid-cols-2 gap-2 md:grid-cols-3">
                                    <div>
                                        <strong>Limpieza Transporte:</strong>{' '}
                                        {renderBool(
                                            selectedRecepcion.limpieza_transporte,
                                        )}
                                    </div>
                                    <div>
                                        <strong>Sin Elementos:</strong>{' '}
                                        {renderBool(
                                            selectedRecepcion.sin_elementos,
                                        )}
                                    </div>
                                    <div>
                                        <strong>Cerrado:</strong>{' '}
                                        {renderBool(selectedRecepcion.cerrado)}
                                    </div>
                                    <div>
                                        <strong>NIT:</strong>{' '}
                                        {renderBool(selectedRecepcion.nit)}
                                    </div>
                                    <div>
                                        <strong>RS:</strong>{' '}
                                        {renderBool(selectedRecepcion.rs)}
                                    </div>
                                    <div>
                                        <strong>Certificado:</strong>{' '}
                                        {renderBool(
                                            selectedRecepcion.certificado,
                                        )}
                                    </div>
                                </div> */}

                                {/* Tabla de lotes asociados */}
                                {/* <div>
                                    <h4 className="mb-2 font-semibold">
                                        Lotes:
                                    </h4>
                                    {selectedRecepcion.recepcion_lotes?.length >
                                    0 ? (
                                        <div className="overflow-x-auto">
                                            <Table>
                                                <TableHeader>
                                                    <TableRow>
                                                        <TableHead>
                                                            Lote
                                                        </TableHead>
                                                        <TableHead>
                                                            Fecha Elaboración
                                                        </TableHead>
                                                        <TableHead>
                                                            Fecha Vencimiento
                                                        </TableHead>
                                                    </TableRow>
                                                </TableHeader>
                                                <TableBody>
                                                    {selectedRecepcion.recepcion_lotes.map(
                                                        (lote: any) => (
                                                            <TableRow
                                                                key={lote.id}
                                                            >
                                                                <TableCell>
                                                                    {lote.lote}
                                                                </TableCell>
                                                                <TableCell>
                                                                    {lote.fecha_elaboracion
                                                                        ? new Date(
                                                                              lote.fecha_elaboracion,
                                                                          ).toLocaleDateString(
                                                                              'es-BO',
                                                                          )
                                                                        : '-'}
                                                                </TableCell>
                                                                <TableCell>
                                                                    {lote.fecha_vencimiento
                                                                        ? new Date(
                                                                              lote.fecha_vencimiento,
                                                                          ).toLocaleDateString(
                                                                              'es-BO',
                                                                          )
                                                                        : '-'}
                                                                </TableCell>
                                                            </TableRow>
                                                        ),
                                                    )}
                                                </TableBody>
                                            </Table>
                                        </div>
                                    ) : (
                                        <p className="text-muted-foreground">
                                            No hay lotes asociados
                                        </p>
                                    )}
                                </div> */}
                            </>
                        )}

                        {hasPermission('u_recepcionMateriaPrima') && (
                            <div className="space-y-3">
                                <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
  <div>
    <strong>Estado:</strong>
    <Select
      value={form.estado_id}
      onValueChange={(v) => handleInput('estado_id', v)}
    >
      <SelectTrigger className="mt-1">
        <SelectValue placeholder="Seleccione..." />
      </SelectTrigger>
      <SelectContent>
        {estados.map((e) => (
          <SelectItem key={e.id} value={e.id.toString()}>
            {e.nombre}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  </div>

  <div>
    <strong>Liberación:</strong>
    <Select
      value={form.liberacion_id}
      onValueChange={(v) => handleInput('liberacion_id', v)}
    >
      <SelectTrigger className="mt-1">
        <SelectValue placeholder="Seleccione..." />
      </SelectTrigger>
      <SelectContent>
        {liberaciones.map((l) => (
          <SelectItem key={l.id} value={l.id.toString()}>
            {l.nombre}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  </div>
  <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
    <div>
        <strong>Estado:</strong>
        <Select
            value={form.estado_id}
            onValueChange={(v) => handleInput('estado_id', v)}
        >
            <SelectTrigger className="mt-1">
                <SelectValue placeholder="Seleccione..." />
            </SelectTrigger>
            <SelectContent>
                {estados.map((e) => (
                    <SelectItem key={e.id} value={e.id.toString()}>
                        {e.nombre}
                    </SelectItem>
                ))}
            </SelectContent>
        </Select>
    </div>

    <div>
        <strong>Liberación:</strong>
        <Select
            value={form.liberacion_id}
            onValueChange={(v) => handleInput('liberacion_id', v)}
        >
            <SelectTrigger className="mt-1">
                <SelectValue placeholder="Seleccione..." />
            </SelectTrigger>
            <SelectContent>
                {liberaciones.map((l) => (
                    <SelectItem key={l.id} value={l.id.toString()}>
                        {l.nombre}
                    </SelectItem>
                ))}
            </SelectContent>
        </Select>
    </div>

    {/* NUEVO: Estado Análisis */}
    <div>
        <strong>Estado Análisis:</strong>
        <Select
            value={form.estado_analisis_id}
            onValueChange={(v) => handleInput('estado_analisis_id', v)}
        >
            <SelectTrigger className="mt-1">
                <SelectValue placeholder="Seleccione..." />
            </SelectTrigger>
            <SelectContent>
                {estadosAnalisis.map((e) => (
                    <SelectItem key={e.id} value={e.id.toString()}>
                        {e.nombre}
                    </SelectItem>
                ))}
            </SelectContent>
        </Select>
    </div>
</div>
</div>

                                <div>
                                    <strong>Observación:</strong>
                                    <Textarea
                                        value={form.observacion}
                                        onChange={(e) =>
                                            handleInput(
                                                'observacion',
                                                e.target.value,
                                            )
                                        }
                                        rows={3}
                                    />
                                </div>
                            </div>
                        )}
                    </div>

                    <DialogFooter className="mt-4">
                        <Button onClick={() => setDialogOpen(false)}>
                            Cerrar
                        </Button>

                        {hasPermission('u_recepcionMateriaPrima') && (
                            <Button onClick={handleSaveEstado}>
                                Guardar cambios
                            </Button>
                        )}
                    </DialogFooter>
                </DialogContent>
            </Dialog>


            <Dialog open={analisisDialogOpen} onOpenChange={setAnalisisDialogOpen}>
    <DialogContent className="max-w-md">
        <DialogHeader>
            <DialogTitle>Generar análisis para recepción</DialogTitle>
            <DialogDescription>
                Define el nivel de inspección y el plan de muestreo. El sistema calculará cuántas muestras se deben tomar según el tamaño de lote ({recepcionForAnalisis?.unidades || 0} unidades).
            </DialogDescription>
        </DialogHeader>

        {recepcionForAnalisis && (
            <div className="space-y-4">
                <div>
                    <label className="block text-sm font-medium mb-1">Tamaño de lote (unidades)</label>
                    <Input value={recepcionForAnalisis.unidades || 0} disabled className="bg-muted" />
                </div>

                <div>
                    <label className="block text-sm font-medium mb-1">Nivel de inspección *</label>
                    <Select value={nivelInspeccion} onValueChange={setNivelInspeccion}>
                        <SelectTrigger>
                            <SelectValue placeholder="Selecciona un nivel" />
                        </SelectTrigger>
                        <SelectContent>
                            {['S-1', 'S-2', 'S-3', 'S-4', 'I', 'II', 'III'].map((nivel) => (
                                <SelectItem key={nivel} value={nivel}>{nivel}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>

                <div>
                    <label className="block text-sm font-medium mb-1">Plan de muestreo *</label>
                    <Select value={planMuestreo} onValueChange={setPlanMuestreo}>
                        <SelectTrigger>
                            <SelectValue placeholder="Selecciona un plan" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="reducido">Reducido</SelectItem>
                            <SelectItem value="normal">Normal</SelectItem>
                            <SelectItem value="rigurosa">Rigurosa</SelectItem>
                        </SelectContent>
                    </Select>
                </div>

                <div>
                    <label className="block text-sm font-medium mb-1">NCA (Nivel de Calidad Aceptable)</label>
                    <Input
                        value={nca}
                        onChange={(e) => setNca(e.target.value)}
                        placeholder="Ej: 0.65, 1.0, ..."
                    />
                </div>
            </div>
        )}

        <DialogFooter>
            <Button variant="outline" onClick={() => setAnalisisDialogOpen(false)}>Cancelar</Button>
            <Button onClick={handleSubmitGenerarAnalisis} disabled={generandoAnalisis}>
                {generandoAnalisis ? 'Generando...' : 'Generar análisis'}
            </Button>
        </DialogFooter>
    </DialogContent>
</Dialog>
        </AppLayout>
    );
}

