import { Button } from '@/components/ui/button';
import Fecha from '@/components/ui/fecha';
import FilterInput from '@/components/ui/filter-input';
import FilterSelect from '@/components/ui/filter-select';
import { Input } from '@/components/ui/input';

import ScientificNotation from '@/components/ui/ScientificNotation';
import ReporteSeguimientoUht from '@/pdf/ReporteSeguimientoUht';
import { PDFViewer } from '@react-pdf/renderer';
import { Printer } from 'lucide-react';

import {
    Dialog,
    DialogContent,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';

import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from '@/components/ui/tooltip';

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
import { useInitials } from '@/hooks/use-initials';
import { useAuth } from '@/hooks/useAuth';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, Link, router, usePage } from '@inertiajs/react';
import {
    Check,
    Eye,
    Filter,
    MoreHorizontal,
    Pencil,
    Plus,
    Search,
    Sprout,
    Trash,
    X,
} from 'lucide-react';

import axios from 'axios';
import { useState } from 'react';
import { route } from 'ziggy-js';

import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import TablePagination from '@/components/ui/table-pagination';

const breadcrumbs: BreadcrumbItem[] = [{ title: 'Seguimiento UHT', href: '#' }];

interface PageProps {
    seguimientos: {
        data: any[];
        links: any[];
        current_page: number;
        last_page: number;
        per_page: number;
        total: number;
    };
    filters: {
        search?: string;
        orp?: string;
        producto_terminado?: string;
        estado?: string;
        origen?: string;
        usuario?: string;
        per_page?: number;
    };
    orps: { codigo: string }[];
    estados: { nombre: string }[];
    productosTerminados: { nombre_sap: string }[];
    origenes: { alias: string }[];
    usuarios: { name: string }[];
    flash: {
        success?: string;
        error?: string;
    };
}

export default function Index() {
    const { props } = usePage<PageProps>();
    const [showFilters, setShowFilters] = useState(false);

    const {
        hasPermission,
        belongsToUbicacion,
        canDo,
        isAdmin: isAdminFromAuth,
        user: authUser,
    } = useAuth();

    const getInitials = useInitials();

    const [openMoho, setOpenMoho] = useState(false);
    const [mohoActual, setMohoActual] = useState<any>(null);
    const [mohos, setMohos] = useState('');
    const [observacion, setObservacion] = useState('');
    const [openFeriado, setOpenFeriado] = useState(false);
    const [feriadoDate, setFeriadoDate] = useState('');
    const [loadingFeriadoDia2, setLoadingFeriadoDia2] = useState(false);
    const [loadingFeriadoDia5, setLoadingFeriadoDia5] = useState(false);

    const abrirMoho = (s: any) => {
        setMohoActual(s);
        setMohos(s.mohos ?? '');
        setObservacion(s.observacion_lectura ?? '');
        setOpenMoho(true);
    };

    const [openColiformes, setOpenColiformes] = useState(false);
    const [seguimientoActual, setSeguimientoActual] = useState<any>(null);
    const [aerovios, setAerovios] = useState('');
    const [editingLoteId, setEditingLoteId] = useState<number | null>(null);
    const [loteDraft, setLoteDraft] = useState('');

    // Estados simplificados - solo para indicadores visuales
    const [loadingAutocomplete, setLoadingAutocomplete] = useState(false);
    const [loadingAutocompleteDia5, setLoadingAutocompleteDia5] =
        useState(false);
    const [hayPendientesDia2, setHayPendientesDia2] = useState(false);
    const [hayPendientesDia5, setHayPendientesDia5] = useState(false);

    const [orpSeleccionado, setOrpSeleccionado] = useState<string>('');
    const [datosPdf, setDatosPdf] = useState<any>(null);
    const [mostrarPdf, setMostrarPdf] = useState(false);
    const [generandoPdf, setGenerandoPdf] = useState(false);

    const urlPdf = route('seguimiento-uht.pdf');

    const handleMostrarPdf = async () => {
        if (!orpSeleccionado) {
            alert('Por favor selecciona un ORP');
            return;
        }

        setGenerandoPdf(true);
        try {
            const params = new URLSearchParams();
            params.append('orp_codigo', orpSeleccionado);

            const response = await fetch(`${urlPdf}?${params.toString()}`);
            if (!response.ok) {
                const errorText = await response.text();
                alert(`Error: ${errorText.substring(0, 500)}`);
                return;
            }

            const data = await response.json();

            // Validar que la respuesta tenga la estructura esperada
            if (!data.orp || !data.filas || data.filas.length === 0) {
                alert('No hay datos para el ORP seleccionado');
                return;
            }

            setDatosPdf(data); // Guardamos toda la respuesta
            setMostrarPdf(true);
        } catch (error) {
            console.error('Error:', error);
            alert('Error al generar el reporte');
        } finally {
            setGenerandoPdf(false);
        }
    };

    // Función para autocompletar día 2
    const autocompletarDia2 = async () => {
        // Confirmar antes de proceder
        const confirmar = window.confirm(
            '¿Está seguro de autocompletar los registros con fecha de siembra de hace 2 días? Esta acción asignará el usuario actual a todos los registros pendientes.',
        );

        if (!confirmar) return;

        setLoadingAutocomplete(true);
        try {
            const response = await axios.post(
                route('seguimiento-uht.autocompletar-dia2'),
            );

            if (response.data.success) {
                // Recargar la página o actualizar datos
                router.reload({ only: ['seguimientos'] });
                alert(response.data.message);
                setHayPendientesDia2(false); // Ocultar indicador después de completar
            } else {
                alert(response.data.message);
                // Si no hay registros, ocultar el indicador
                if (response.data.count === 0) {
                    setHayPendientesDia2(false);
                }
            }
        } catch (error) {
            console.error('Error al autocompletar:', error);
            alert('Ocurrió un error al autocompletar los registros.');
        } finally {
            setLoadingAutocomplete(false);
        }
    };

    // Función para autocompletar día 5
    const autocompletarDia5 = async () => {
        // Confirmar antes de proceder
        const confirmar = window.confirm(
            '¿Está seguro de autocompletar los registros con fecha de siembra de hace 5 días? Esta acción asignará el usuario actual a todos los registros pendientes que ya fueron sembrados.',
        );

        if (!confirmar) return;

        setLoadingAutocompleteDia5(true);
        try {
            const response = await axios.post(
                route('seguimiento-uht.autocompletar-dia5'),
            );

            if (response.data.success) {
                // Recargar la página o actualizar datos
                router.reload({ only: ['seguimientos'] });
                alert(response.data.message);
                setHayPendientesDia5(false); // Ocultar indicador después de completar
            } else {
                alert(response.data.message);
                // Si no hay registros, ocultar el indicador
                if (response.data.count === 0) {
                    setHayPendientesDia5(false);
                }
            }
        } catch (error) {
            console.error('Error al autocompletar día 5:', error);
            alert('Ocurrió un error al autocompletar los registros del día 5.');
        } finally {
            setLoadingAutocompleteDia5(false);
        }
    };

    // Función para verificar si hay pendientes (solo cuando se hace clic en el botón)
    const verificarPendientesAlHacerClick = async () => {
        try {
            // Verificar día 2
            const responseDia2 = await axios.get(
                route('seguimiento-uht.contar-pendientes-dia2'),
            );
            setHayPendientesDia2(responseDia2.data.count > 0);

            // Verificar día 5
            const responseDia5 = await axios.get(
                route('seguimiento-uht.contar-pendientes-dia5'),
            );
            setHayPendientesDia5(responseDia5.data.count > 0);
        } catch (error) {
            console.error('Error al verificar pendientes:', error);
        }
    };

    // Llamar a la verificación al cargar el componente (solo una vez)
    useState(() => {
        verificarPendientesAlHacerClick();
    });

    const abrirColiformes = (s: any) => {
        setSeguimientoActual(s);
        setAerovios(s.aerovios ?? '');
        setOpenColiformes(true);
    };

    const iniciarEdicionLote = (seguimiento: any) => {
        setEditingLoteId(seguimiento.id);
        setLoteDraft(seguimiento.lote ?? '');
    };

    const guardarLote = (seguimiento: any) => {
        router.post(
            route('seguimiento-uht.lote.actualizar', seguimiento.id),
            { lote: loteDraft },
            {
                preserveScroll: true,
                onSuccess: () => {
                    setEditingLoteId(null);
                    setLoteDraft('');
                },
            },
        );
    };

    const guardarColiformes = () => {
        router.post(
            route('seguimiento-uht.coliformes.guardar', seguimientoActual.id),
            { aerovios },
            {
                preserveScroll: true,
                onSuccess: () => setOpenColiformes(false),
            },
        );
    };

    const toScientificNotationJSX = (num) => {
        if (num === 0) return '0';
        const sign = num < 0 ? '-' : '';
        const absNum = Math.abs(num);
        const exponent = Math.floor(Math.log10(absNum));
        const coefficient = absNum / Math.pow(10, exponent);
        const roundedCoeff = Math.round(coefficient * 1000) / 1000;
        return (
            <>
                {sign}
                {roundedCoeff}x10<sup>{exponent}</sup>
            </>
        );
    };
    const coliformesCero = (id: number) => {
        router.post(
            route('seguimiento-uht.coliformes.cero', id),
            {},
            { preserveScroll: true },
        );
    };

    const guardarMoho = () => {
        router.post(
            route('seguimiento-uht.moho.guardar', mohoActual.id),
            { mohos, observacion_lectura: observacion },
            {
                preserveScroll: true,
                onSuccess: () => setOpenMoho(false),
            },
        );
    };

    const mohoCero = (id: number) => {
        router.post(
            route('seguimiento-uht.moho.cero', id),
            {},
            { preserveScroll: true },
        );
    };

    const mohoNulo = (id: number) => {
        router.post(
            route('seguimiento-uht.moho.nulo', id),
            {},
            { preserveScroll: true },
        );
    };

    const {
        seguimientos,
        filters: initialFilters = {},
        orps = [],
        estados = [],
        productosTerminados = [],
        origenes = [],
        usuarios = [],

        flash,
    } = props;

    const { filters, updateFilter, resetFilters } = useAdvancedFilters({
        routeName: 'seguimiento-uht.index',
        initialFilters: {
            search: initialFilters.search || '',
            orp: initialFilters.orp || '',
            estado: initialFilters.estado || '',
            producto_terminado: initialFilters.producto_terminado || '',
            origen: initialFilters.origen || '',
            usuario: initialFilters.usuario || '',
            fecha_vencimiento_desde:
                initialFilters.fecha_vencimiento_desde || '',
            fecha_vencimiento_hasta:
                initialFilters.fecha_vencimiento_hasta || '',
            per_page: initialFilters.per_page?.toString() || '10',
        },
        debounceFields: ['search'],
        debounceDelay: 600,
    });

    const hasActiveFilters = Object.values(filters).some(
        (v) => v && v !== '' && v !== '10',
    );

    // Función para formatear múltiples ORPs
    const formatOrps = (detalles: any[]) => {
        if (!detalles || detalles.length === 0) return '-';

        if (detalles.length === 1) {
            return detalles[0].orp?.codigo || '-';
        }

        return `${detalles.length} ORPs`;
    };

    // Función para formatear nombres de productos
    const formatProductos = (detalles: any[]) => {
        if (!detalles || detalles.length === 0) return '-';

        return detalles.map((d, index) => (
            <span key={index}>
                {d.orp?.producto_terminado?.nombre_sap || '-'}
                <br />
            </span>
        ));
    };

    const getMohoRegistroInfo = (seguimiento: any) => {
        if (!seguimiento) return null;

        const orps =
            seguimiento.detalles
                ?.map((detalle: any) => detalle?.orp?.codigo)
                .filter(Boolean) || [];

        const productos =
            seguimiento.detalles
                ?.map(
                    (detalle: any) =>
                        detalle?.orp?.producto_terminado?.nombre_sap,
                )
                .filter(Boolean) || [];

        return {
            orps: orps.length > 0 ? orps.join(', ') : '-',
            producto: productos.length > 0 ? productos.join(', ') : '-',
            lote: seguimiento.lote || '-',
            numero: seguimiento.numero || '-',
            origen: seguimiento.origen?.alias || '-',
        };
    };

    const RegistroSeleccionadoInfo = ({ seguimiento }: { seguimiento: any }) => {
        if (!seguimiento) return null;

        const registroInfo = getMohoRegistroInfo(seguimiento);

        return (
            <div className="rounded-md border border-border bg-muted/40 p-3 text-sm">
                <div className="mb-2 font-semibold text-foreground">
                    Registro seleccionado
                </div>
                <div className="space-y-2 text-muted-foreground">
                    <div className="flex flex-wrap gap-2">
                        <div className="rounded-md bg-background px-2 py-1">
                            <span className="font-medium text-foreground">ORP: </span>
                            {registroInfo?.orps}
                        </div>
                        <div className="rounded-md bg-background px-2 py-1">
                            <span className="font-medium text-foreground">Nº: </span>
                            {registroInfo?.numero}
                        </div>
                        <div className="rounded-md bg-background px-2 py-1">
                            <span className="font-medium text-foreground">Origen: </span>
                            {registroInfo?.origen}
                        </div>
                        <div className="rounded-md bg-background px-2 py-1">
                            <span className="font-medium text-foreground">Lote: </span>
                            {registroInfo?.lote}
                        </div>
                    </div>
                    <div className="flex flex-wrap gap-2">
                        <div className="rounded-md bg-background px-2 py-1">
                            <span className="font-medium text-foreground">Producto: </span>
                            {registroInfo?.producto}
                        </div>
                    </div>
                </div>
            </div>
        );
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Seguimientos UHT" />
            <div className="space-y-2 px-2 py-2 sm:px-6">
                <Toast />

                {/* Header */}
                <div className="flex items-center justify-between">
                    <div className="relative max-w-md">
                        <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                        <Input
                            placeholder="Buscar por ORP, lote, usuario, estado..."
                            value={filters.search}
                            onChange={(e) =>
                                updateFilter('search', e.target.value)
                            }
                            className="pl-10"
                        />
                    </div>

                    <div className="flex gap-2">
                        {hasPermission('u_seguimientoUht') && (
                            <>
                                {/* Botones originales */}
                                <TooltipProvider>{/* ... */}</TooltipProvider>

                                <TooltipProvider>{/* ... */}</TooltipProvider>

                                {/* Nuevo botón Firmar Feriado */}
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => setOpenFeriado(true)}
                                    className="relative"
                                >
                                    Firmar Feriado
                                </Button>
                            </>
                        )}
                        {hasPermission('u_seguimientoUht') && (
                            <>
                                {/* Botón para autocompletar día 2 - Con esferita roja */}
                                <TooltipProvider>
                                    <Tooltip>
                                        <TooltipTrigger asChild>
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={autocompletarDia2}
                                                disabled={loadingAutocomplete}
                                                className="relative"
                                            >
                                                {loadingAutocomplete ? (
                                                    'Procesando...'
                                                ) : (
                                                    <>
                                                        <Check className="mr-2 h-4 w-4" />
                                                        <p className="hidden md:block">
                                                            Firmar Día 2
                                                        </p>
                                                        {/* Esferita roja sin número */}
                                                        {hayPendientesDia2 && (
                                                            <span className="absolute -top-1 -right-1 flex h-3 w-3">
                                                                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-destructive opacity-75"></span>
                                                                <span className="relative inline-flex h-3 w-3 rounded-full bg-destructive"></span>
                                                            </span>
                                                        )}
                                                    </>
                                                )}
                                            </Button>
                                        </TooltipTrigger>
                                        <TooltipContent>
                                            <p>
                                                Autocompletar registros de hace
                                                2 días sin firmar
                                            </p>
                                            {hayPendientesDia2 && (
                                                <p className="mt-1 text-xs text-destructive">
                                                    ¡Hay registros pendientes!
                                                </p>
                                            )}
                                        </TooltipContent>
                                    </Tooltip>
                                </TooltipProvider>

                                {/* Botón para autocompletar día 5 - Con esferita azul */}
                                <TooltipProvider>
                                    <Tooltip>
                                        <TooltipTrigger asChild>
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={autocompletarDia5}
                                                disabled={
                                                    loadingAutocompleteDia5
                                                }
                                                className="relative"
                                            >
                                                {loadingAutocompleteDia5 ? (
                                                    'Procesando...'
                                                ) : (
                                                    <>
                                                        <Check className="mr-2 h-4 w-4" />
                                                        <p className="hidden md:block">
                                                            Firmar Día 5
                                                        </p>
                                                        {/* Esferita azul sin número */}
                                                        {hayPendientesDia5 && (
                                                            <span className="absolute -top-1 -right-1 flex h-3 w-3">
                                                                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-blue-500 opacity-75"></span>
                                                                <span className="relative inline-flex h-3 w-3 rounded-full bg-blue-500"></span>
                                                            </span>
                                                        )}
                                                    </>
                                                )}
                                            </Button>
                                        </TooltipTrigger>
                                        <TooltipContent>
                                            <p>
                                                Autocompletar registros de hace
                                                5 días ya sembrados sin firmar
                                            </p>
                                            {hayPendientesDia5 && (
                                                <p className="mt-1 text-xs text-blue-500">
                                                    ¡Hay registros pendientes!
                                                </p>
                                            )}
                                        </TooltipContent>
                                    </Tooltip>
                                </TooltipProvider>
                            </>
                        )}

                        {hasPermission('c_seguimientoUht') && (
                            <Link href={route('seguimiento-uht.create')}>
                                <Button size="sm">
                                    <Plus className="h-4 w-4" />
                                    <p className="hidden md:block">Nuevo</p>
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
                            <span className="hidden md:block">Filtros</span>
                            {hasActiveFilters && (
                                <span className="flex h-5 w-5 items-center justify-center rounded-full bg-primary text-xs text-primary-foreground">
                                    !
                                </span>
                            )}
                        </Button>
                    </div>
                </div>

                {/* Filtros */}
                {showFilters && (
                    <div className="rounded-lg border border-border bg-muted/50 p-2">
                        <div className="mb-3 flex justify-between">
                            <h3 className="text-sm font-semibold">
                                Filtros avanzados
                            </h3>
                            {hasActiveFilters && (
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={resetFilters}
                                    className="text-xs"
                                >
                                    <X className="mr-1 h-4 w-4" />
                                    Limpiar
                                </Button>
                            )}
                        </div>

                        <div className="grid grid-cols-2 gap-3 md:grid-cols-4 lg:grid-cols-6">
                            <FilterInput
                                value={filters.orp}
                                onChange={(v) => updateFilter('orp', v)}
                                placeholder="ORP"
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

                            <FilterInput
                                value={filters.producto_terminado}
                                onChange={(v) =>
                                    updateFilter('producto_terminado', v)
                                }
                                placeholder="Producto Terminado"
                            />

                            <FilterInput
                                value={filters.origen}
                                onChange={(v) => updateFilter('origen', v)}
                                placeholder="Origen"
                            />

                            <FilterInput
                                value={filters.usuario}
                                onChange={(v) => updateFilter('usuario', v)}
                                placeholder="Usuario"
                            />

                            <FilterSelect
                                value={filters.per_page}
                                onChange={(v) => updateFilter('per_page', v)}
                                placeholder="Resultados"
                                options={['10', '25', '50', '100'].map((v) => ({
                                    value: v,
                                    label: `${v} por página`,
                                }))}
                                includeAllOption={false}
                            />

                            <Input
                                type="date"
                                value={filters.fecha_vencimiento_desde}
                                onChange={(e) =>
                                    updateFilter(
                                        'fecha_vencimiento_desde',
                                        e.target.value,
                                    )
                                }
                                placeholder="Desde vencimiento"
                                className="col-span-1"
                            />
                            <Input
                                type="date"
                                value={filters.fecha_vencimiento_hasta}
                                onChange={(e) =>
                                    updateFilter(
                                        'fecha_vencimiento_hasta',
                                        e.target.value,
                                    )
                                }
                                placeholder="Hasta vencimiento"
                                className="col-span-1"
                            />
                        </div>
                    </div>
                )}

                {/* Tabla */}
                <div className="overflow-hidden rounded-lg border bg-background shadow-sm">
                    <div className="overflow-x-auto">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Siembra</TableHead>
                                    <TableHead>Vencimiento</TableHead>
                                    <TableHead>ORPs</TableHead>
                                    <TableHead>Productos</TableHead>
                                    <TableHead>Lote</TableHead>
                                    <TableHead>#</TableHead>
                                    <TableHead>Origen</TableHead>
                                    <TableHead>Aerovios</TableHead>
                                    <TableHead>Moho</TableHead>
                                    <TableHead>Solicitante</TableHead>
                                    {/* <TableHead>Estado</TableHead> */}
                                    <TableHead>Observaciones</TableHead>
                                    <TableHead></TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {seguimientos.data.length === 0 ? (
                                    <TableRow>
                                        <TableCell
                                            colSpan={12}
                                            className="py-8 text-center"
                                        >
                                            No se encontraron seguimientos
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    seguimientos.data.map((s) => (
                                        <TableRow
                                            key={s.id}
                                            className="hover:bg-muted/50"
                                        >
                                            <TableCell>
                                                <TooltipProvider>
                                                    <Tooltip>
                                                        <TooltipTrigger asChild>
                                                            <div>
                                                                <div className="font-medium text-foreground">
                                                                    <Fecha
                                                                        value={
                                                                            s.tiempo_siembra
                                                                        }
                                                                    />
                                                                </div>
                                                                <div className="text-xs font-medium text-muted-foreground">
                                                                    {getInitials(
                                                                        s
                                                                            .usuario_siembra
                                                                            ?.name,
                                                                    ) || ''}
                                                                    {getInitials(
                                                                        s
                                                                            .usuario_siembra
                                                                            ?.apellido,
                                                                    ) || ''}
                                                                </div>
                                                            </div>
                                                        </TooltipTrigger>
                                                        <TooltipContent>
                                                            <p>
                                                                {s
                                                                    .usuario_siembra
                                                                    ?.name ||
                                                                    '-'}{' '}
                                                                {s
                                                                    .usuario_siembra
                                                                    ?.apellido ||
                                                                    '-'}
                                                            </p>
                                                        </TooltipContent>
                                                    </Tooltip>
                                                </TooltipProvider>
                                            </TableCell>

                                            <TableCell>
                                                <div>
                                                    {s.detalles &&
                                                    s.detalles.length > 0 ? (
                                                        <div className="space-y-1">
                                                            {s.detalles.map(
                                                                (
                                                                    detalle: any,
                                                                    index: number,
                                                                ) => (
                                                                    <div
                                                                        key={
                                                                            detalle.id ||
                                                                            index
                                                                        }
                                                                    >
                                                                        <Fecha
                                                                            value={
                                                                                detalle
                                                                                    .orp
                                                                                    ?.fecha_vencimiento1 ||
                                                                                'N/A'
                                                                            }
                                                                        />
                                                                        {detalle.orp?.fecha_vencimiento2 && (
                                                                            <div>
                                                                                <Fecha
                                                                                    value={
                                                                                        detalle.orp.fecha_vencimiento2
                                                                                    }
                                                                                />
                                                                            </div>
                                                                        )}
                                                                    </div>
                                                                ),
                                                            )}
                                                        </div>
                                                    ) : (
                                                        <p>
                                                            Sin ORPs asignadas
                                                        </p>
                                                    )}
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <div>
                                                    {s.detalles &&
                                                    s.detalles.length > 0 ? (
                                                        <div className="space-y-1">
                                                            {s.detalles.map(
                                                                (
                                                                    detalle: any,
                                                                    index: number,
                                                                ) => (
                                                                    <div
                                                                        key={
                                                                            detalle.id ||
                                                                            index
                                                                        }
                                                                    >
                                                                        <strong>
                                                                            {detalle
                                                                                .orp
                                                                                ?.codigo ||
                                                                                'N/A'}
                                                                        </strong>
                                                                    </div>
                                                                ),
                                                            )}
                                                        </div>
                                                    ) : (
                                                        <p>
                                                            Sin ORPs asignadas
                                                        </p>
                                                    )}
                                                </div>
                                            </TableCell>

                                            <TableCell>
                                                <div className="max-w-xs truncate">
                                                    {formatProductos(
                                                        s.detalles,
                                                    )}
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                {editingLoteId === s.id ? (
                                                    <Input
                                                        value={loteDraft}
                                                        onChange={(e) =>
                                                            setLoteDraft(
                                                                e.target.value,
                                                            )
                                                        }
                                                        onBlur={() =>
                                                            guardarLote(s)
                                                        }
                                                        onKeyDown={(e) => {
                                                            if (e.key === 'Enter') {
                                                                e.preventDefault();
                                                                guardarLote(s);
                                                            }
                                                            if (e.key === 'Escape') {
                                                                setEditingLoteId(null);
                                                                setLoteDraft('');
                                                            }
                                                        }}
                                                        className="h-8 w-28"
                                                        autoFocus
                                                    />
                                                ) : (
                                                    <button
                                                        type="button"
                                                        className="font-medium text-left underline-offset-2 hover:underline"
                                                        onDoubleClick={() =>
                                                            iniciarEdicionLote(s)
                                                        }
                                                    >
                                                        {s.lote}
                                                    </button>
                                                )}
                                            </TableCell>
                                            <TableCell>
                                                <span className="font-medium">
                                                    {s.numero}
                                                </span>
                                            </TableCell>
                                            <TableCell>
                                                {s.origen?.alias ===
                                                'EMBOTELLADORA'
                                                    ? 'EMB'
                                                    : s.origen?.alias || '-'}
                                            </TableCell>

                                            <TableCell>
                                                <div className="flex items-center gap-2">
                                                    <TooltipProvider>
                                                        <Tooltip>
                                                            <TooltipTrigger
                                                                asChild
                                                            >
                                                                <div>
                                                                    <div className="font-medium text-foreground">
                                                                        <ScientificNotation
                                                                            value={
                                                                                s.aerovios
                                                                            }
                                                                            decimals={
                                                                                3
                                                                            }
                                                                            fallback="-"
                                                                            useSuperscript
                                                                            zeroDisplayMode="lt1"
                                                                        />
                                                                    </div>
                                                                    <div className="text-xs font-medium text-muted-foreground">
                                                                        {getInitials(
                                                                            s
                                                                                .usuario_dia2
                                                                                ?.name,
                                                                        ) || ''}
                                                                        {getInitials(
                                                                            s
                                                                                .usuario_dia2
                                                                                ?.apellido,
                                                                        ) || ''}
                                                                    </div>
                                                                </div>
                                                            </TooltipTrigger>
                                                            <TooltipContent className="max-w-sm break-words whitespace-pre-wrap">
                                                                <p>
                                                                    {s
                                                                        .usuario_dia2
                                                                        ?.name ||
                                                                        '-'}{' '}
                                                                    {s
                                                                        .usuario_dia2
                                                                        ?.apellido ||
                                                                        '-'}
                                                                </p>
                                                            </TooltipContent>
                                                        </Tooltip>
                                                    </TooltipProvider>
                                                    {canDo(
                                                        s,
                                                        'u_seguimientoUht',
                                                        168,
                                                    ) && (
                                                        <div className="flex">
                                                            <Button
                                                                size="icon"
                                                                variant="ghost"
                                                                className="h-6 w-6"
                                                                onClick={() =>
                                                                    abrirColiformes(
                                                                        s,
                                                                    )
                                                                }
                                                            >
                                                                <Pencil className="h-3 w-3" />
                                                            </Button>

                                                            <Button
                                                                size="icon"
                                                                variant="ghost"
                                                                className="h-6 w-6"
                                                                onClick={() =>
                                                                    coliformesCero(
                                                                        s.id,
                                                                    )
                                                                }
                                                            >
                                                                <Check className="h-3 w-3" />
                                                            </Button>
                                                        </div>
                                                    )}
                                                </div>
                                            </TableCell>

                                            <TableCell>
                                                <div className="flex items-center gap-1">
                                                    <TooltipProvider>
                                                        <Tooltip>
                                                            <TooltipTrigger
                                                                asChild
                                                            >
                                                                <div className="min-w-[60px]">
                                                                    <div className="font-medium text-foreground">
                                                                        <ScientificNotation
                                                                            value={
                                                                                s.mohos
                                                                            }
                                                                            decimals={
                                                                                3
                                                                            }
                                                                            fallback="-"
                                                                            useSuperscript
                                                                            zeroDisplayMode="lt1"
                                                                        />
                                                                    </div>
                                                                    <div className="text-xs font-medium text-muted-foreground">
                                                                        {getInitials(
                                                                            s
                                                                                .usuario_dia5
                                                                                ?.name,
                                                                        ) || ''}
                                                                        {getInitials(
                                                                            s
                                                                                .usuario_dia5
                                                                                ?.apellido,
                                                                        ) || ''}
                                                                    </div>
                                                                </div>
                                                            </TooltipTrigger>
                                                            <TooltipContent className="max-w-sm break-words whitespace-pre-wrap">
                                                                <p>
                                                                    {s
                                                                        .usuario_dia5
                                                                        ?.name ||
                                                                        '-'}{' '}
                                                                    {s
                                                                        .usuario_dia5
                                                                        ?.apellido ||
                                                                        '-'}
                                                                </p>
                                                            </TooltipContent>
                                                        </Tooltip>
                                                    </TooltipProvider>
                                                    <div className="flex">
                                                        {s.mohos === null
                                                            ? // Botón para sembrar (crear mohos) - con canDo de 7 días
                                                              canDo(
                                                                  s,
                                                                  'u_seguimientoUht',
                                                                  168,
                                                              ) && (
                                                                  <Button
                                                                      size="sm"
                                                                      variant="outline"
                                                                      onClick={() =>
                                                                          router.post(
                                                                              route(
                                                                                  'seguimiento-uht.sembrar',
                                                                                  s.id,
                                                                              ),
                                                                              {},
                                                                              {
                                                                                  preserveScroll: true,
                                                                              },
                                                                          )
                                                                      }
                                                                  >
                                                                      <Sprout className="h-4 w-4" />
                                                                  </Button>
                                                              )
                                                            : // Botones para editar/cero mohos - con canDo de 7 días
                                                              canDo(
                                                                  s,
                                                                  'u_seguimientoUht',
                                                                  168,
                                                              ) && (
                                                                  <div>
                                                                      <Button
                                                                          size="icon"
                                                                          variant="ghost"
                                                                          className="h-6 w-6"
                                                                          onClick={() =>
                                                                              abrirMoho(
                                                                                  s,
                                                                              )
                                                                          }
                                                                      >
                                                                          <Pencil className="h-3 w-3" />
                                                                      </Button>

                                                                      <Button
                                                                          size="icon"
                                                                          variant="ghost"
                                                                          className="h-6 w-6"
                                                                          onClick={() =>
                                                                              mohoCero(
                                                                                  s.id,
                                                                              )
                                                                          }
                                                                      >
                                                                          <Check className="h-3 w-3" />
                                                                      </Button>

                                                                      {(s.mohos === 0 ||
                                                                          s.mohos === '0') && (
                                                                          <Button
                                                                              size="icon"
                                                                              variant="ghost"
                                                                              className="h-6 w-6"
                                                                              onClick={() =>
                                                                                  mohoNulo(
                                                                                      s.id,
                                                                                  )
                                                                              }
                                                                          >
                                                                              <X className="h-3 w-3" />
                                                                          </Button>
                                                                      )}
                                                                  </div>
                                                              )}
                                                    </div>
                                                </div>
                                            </TableCell>

                                            <TableCell>
                                                {getInitials(s.user?.name) ||
                                                    ''}
                                                {getInitials(
                                                    s.user?.apellido,
                                                ) || ''}
                                            </TableCell>

                                            {/* <TableCell>
                                                <span className="rounded-full bg-primary/10 px-2 py-1 text-xs text-primary">
                                                    {s.estado?.nombre}
                                                </span>
                                            </TableCell> */}
                                            <TableCell>
                                                {s.observacion_siembra && (
                                                    <div className="text-xs">
                                                        <strong>
                                                            Siembra:
                                                        </strong>{' '}
                                                        {s.observacion_siembra}
                                                    </div>
                                                )}
                                                {s.observacion_lectura && (
                                                    <div className="text-xs">
                                                        <strong>
                                                            Lectura:
                                                        </strong>{' '}
                                                        {s.observacion_lectura}
                                                    </div>
                                                )}
                                            </TableCell>
                                            <TableCell>
                                                <DropdownMenu>
                                                    <DropdownMenuTrigger
                                                        asChild
                                                    >
                                                        <Button
                                                            variant="ghost"
                                                            size="sm"
                                                        >
                                                            <MoreHorizontal className="h-4 w-4" />
                                                        </Button>
                                                    </DropdownMenuTrigger>
                                                    <DropdownMenuContent align="end">
                                                        <DropdownMenuItem
                                                            onClick={() =>
                                                                router.visit(
                                                                    route(
                                                                        'seguimiento-uht.show',
                                                                        s.id,
                                                                    ),
                                                                )
                                                            }
                                                        >
                                                            <Eye className="mr-2 h-4 w-4" />
                                                            Ver detalle
                                                        </DropdownMenuItem>

                                                        {hasPermission(
                                                            'd_seguimientoUht',
                                                        ) && (
                                                            <DropdownMenuItem
                                                                onClick={() => {
                                                                    if (
                                                                        confirm(
                                                                            '¿Está seguro de eliminar este seguimiento UHT? Esta acción eliminará también todos los detalles asociados y no se puede deshacer.',
                                                                        )
                                                                    ) {
                                                                        router.delete(
                                                                            route(
                                                                                'seguimiento-uht.destroy',
                                                                                s.id,
                                                                            ),
                                                                            {
                                                                                preserveScroll: true,
                                                                                onSuccess:
                                                                                    () => {
                                                                                        // Opcional: mostrar notificación
                                                                                    },
                                                                            },
                                                                        );
                                                                    }
                                                                }}
                                                                className="text-red-600 focus:bg-red-50 focus:text-red-600"
                                                            >
                                                                <Trash className="mr-2 h-4 w-4" />
                                                                Eliminar
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

                    {seguimientos.data.length > 0 && (
                        <div className="border-t px-4 py-3">
                            <TablePagination
                                pagination={seguimientos}
                                onPageChange={(page) =>
                                    router.get(
                                        route('seguimiento-uht.index'),
                                        { ...filters, page },
                                        { preserveState: true, replace: true },
                                    )
                                }
                            />
                        </div>
                    )}
                </div>

                <p className="text-sm text-muted-foreground">
                    {seguimientos.total} seguimientos registrados
                </p>
                <div className="mt-4 rounded-lg border border-border bg-muted/50 p-4">
                    <h3 className="mb-3 font-semibold text-foreground">
                        Generar Reporte PDF por ORP
                    </h3>
                    <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                        <div>
                            <label className="mb-1 block text-sm font-medium">
                                Seleccionar ORP
                            </label>
                            <FilterSelect
                                value={orpSeleccionado}
                                onChange={(v) => setOrpSeleccionado(v)}
                                placeholder="Buscar ORP..."
                                options={orps.map((o) => ({
                                    value: o.codigo,
                                    label: o.codigo,
                                }))}
                            />
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
                                    : 'Generar Reporte PDF'}
                            </Button>
                        </div>
                    </div>
                </div>
            </div>

            <Dialog open={openMoho} onOpenChange={setOpenMoho}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Registrar Moho</DialogTitle>
                    </DialogHeader>

                    <div className="space-y-3">
                        <RegistroSeleccionadoInfo seguimiento={mohoActual} />

                        <Input
                            type="number"
                            placeholder="Cantidad de mohos"
                            value={mohos}
                            onChange={(e) => setMohos(e.target.value)}
                        />

                        <Textarea
                            placeholder="Observación de lectura"
                            value={observacion}
                            onChange={(e) => setObservacion(e.target.value)}
                        />
                    </div>

                    <DialogFooter>
                        <Button
                            variant="outline"
                            onClick={() => setOpenMoho(false)}
                        >
                            Cancelar
                        </Button>
                        <Button onClick={guardarMoho}>Guardar</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            <Dialog open={openColiformes} onOpenChange={setOpenColiformes}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Registrar Aerobios</DialogTitle>
                    </DialogHeader>

                    <div className="space-y-3">
                        <RegistroSeleccionadoInfo seguimiento={seguimientoActual} />

                        <Input
                            type="number"
                            placeholder="Aerovios"
                            value={aerovios}
                            onChange={(e) => setAerovios(e.target.value)}
                        />
                    </div>

                    <DialogFooter>
                        <Button
                            variant="outline"
                            onClick={() => setOpenColiformes(false)}
                        >
                            Cancelar
                        </Button>
                        <Button onClick={guardarColiformes}>Guardar</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            <Dialog open={openFeriado} onOpenChange={setOpenFeriado}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Firmar por Día Feriado</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4">
                        <div>
                            <label className="text-sm font-medium">
                                Seleccionar fecha del feriado
                            </label>
                            <Input
                                type="date"
                                value={feriadoDate}
                                onChange={(e) => setFeriadoDate(e.target.value)}
                                className="mt-1"
                            />
                        </div>
                        <div className="flex justify-end gap-2">
                            <Button
                                variant="outline"
                                onClick={() => setOpenFeriado(false)}
                            >
                                Cancelar
                            </Button>
                            <Button
                                disabled={!feriadoDate || loadingFeriadoDia2}
                                onClick={() => {
                                    if (!feriadoDate) {
                                        alert('Seleccione una fecha');
                                        return;
                                    }
                                    setLoadingFeriadoDia2(true);
                                    axios
                                        .post(
                                            route(
                                                'seguimiento-uht.autocompletar-dia2-feriado',
                                            ),
                                            { date: feriadoDate },
                                        )
                                        .then((res) => {
                                            alert(res.data.message);
                                            setOpenFeriado(false);
                                            router.reload({
                                                only: ['seguimientos'],
                                            });
                                        })
                                        .catch((err) => {
                                            alert(
                                                'Error: ' +
                                                    (err.response?.data
                                                        ?.message ||
                                                        err.message),
                                            );
                                        })
                                        .finally(() =>
                                            setLoadingFeriadoDia2(false),
                                        );
                                }}
                            >
                                {loadingFeriadoDia2
                                    ? 'Procesando...'
                                    : 'Firmar Día 2'}
                            </Button>
                            <Button
                                disabled={!feriadoDate || loadingFeriadoDia5}
                                onClick={() => {
                                    if (!feriadoDate) {
                                        alert('Seleccione una fecha');
                                        return;
                                    }
                                    setLoadingFeriadoDia5(true);
                                    axios
                                        .post(
                                            route(
                                                'seguimiento-uht.autocompletar-dia5-feriado',
                                            ),
                                            { date: feriadoDate },
                                        )
                                        .then((res) => {
                                            alert(res.data.message);
                                            setOpenFeriado(false);
                                            router.reload({
                                                only: ['seguimientos'],
                                            });
                                        })
                                        .catch((err) => {
                                            alert(
                                                'Error: ' +
                                                    (err.response?.data
                                                        ?.message ||
                                                        err.message),
                                            );
                                        })
                                        .finally(() =>
                                            setLoadingFeriadoDia5(false),
                                        );
                                }}
                            >
                                {loadingFeriadoDia5
                                    ? 'Procesando...'
                                    : 'Firmar Día 5'}
                            </Button>
                        </div>
                    </div>
                </DialogContent>
            </Dialog>

            {/* Modal para mostrar PDF */}
            {mostrarPdf && datosPdf && (
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
                                    Reporte de Seguimiento UHT
                                </h3>
                                <p className="text-sm text-gray-600">
                                    ORP: {orpSeleccionado}
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
                                {/* Pasamos la prop 'data' con todo el objeto */}
                                <ReporteSeguimientoUht data={datosPdf} />
                            </PDFViewer>
                        </div>
                    </div>
                </div>
            )}
        </AppLayout>
    );
}
