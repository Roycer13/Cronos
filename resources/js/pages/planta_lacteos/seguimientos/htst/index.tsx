import { Button } from '@/components/ui/button';
import Fecha from '@/components/ui/fecha';
import FilterInput from '@/components/ui/filter-input';
import FilterSelect from '@/components/ui/filter-select';
import { Input } from '@/components/ui/input';
import ScientificNotation from '@/components/ui/ScientificNotation';
import ReporteSeguimientoHtst from '@/pdf/ReporteSeguimientoHtst';
import { PDFViewer } from '@react-pdf/renderer';

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
    Printer,
    Search,
    Sprout,
    Trash,
    X,
} from 'lucide-react';

import { useState } from 'react';
import { route } from 'ziggy-js';

import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import TablePagination from '@/components/ui/table-pagination';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Seguimiento HTST', href: '#' },
    // { title: 'Seguimientos', href: route('htst.seguimientos') },
];

interface PageProps extends Record<string, unknown> {
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
        fecha_vencimiento_desde?: string; // ← antes fecha_siembra_desde
        fecha_vencimiento_hasta?: string; // ← antes fecha_siembra_hasta
        estado?: string;
        origen?: string;
        usuario?: string;
        per_page?: number;
    };
    orps: { id: number; codigo: string }[];
    estados: { nombre: string }[];
    productosTerminados: { nombre_sap: string }[];
    origenes: { id: number; alias: string }[];
    usuarios: { name: string; apellido: string }[];
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

    // Estados para el PDF
    const [orpSeleccionado, setOrpSeleccionado] = useState<string>('');
    const [datosPdf, setDatosPdf] = useState<any[]>([]);
    const [usuariosPdf, setUsuariosPdf] = useState<any[]>([]);
    const [mostrarPdf, setMostrarPdf] = useState(false);
    const [generandoPdf, setGenerandoPdf] = useState(false);

    // Agrega estos estados junto a los otros
    const [openObservacion, setOpenObservacion] = useState(false);
    const [observacionActual, setObservacionActual] = useState<any>(null);
    const [observacionSiembraValue, setObservacionSiembraValue] = useState('');
    const [observacionLecturaValue, setObservacionLecturaValue] = useState('');
    const [openEditar, setOpenEditar] = useState(false);
    const [registroEditar, setRegistroEditar] = useState<any>(null);
    const [formEditar, setFormEditar] = useState({
        orp_id: '',
        preparacion: '',
        lote: '',
        origen_id: '',
        hora_sachet: '',
    });

    const abrirEdicion = (s: any) => {
        setRegistroEditar(s);
        setFormEditar({
            orp_id: String(s.orp_id ?? ''),
            preparacion: s.preparacion ?? '',
            lote: s.lote ?? '',
            origen_id: String(s.origen_id ?? ''),
            hora_sachet: String(s.hora_sachet ?? '').slice(0, 5),
        });
        setOpenEditar(true);
    };

    const guardarEdicion = () => {
        router.put(
            route('seguimiento-htst.update', registroEditar.id),
            { ...formEditar, hora_sachet: formEditar.hora_sachet || null },
            {
                preserveScroll: true,
                onSuccess: () => setOpenEditar(false),
            },
        );
    };

    // Función para abrir modal de observación
    const abrirObservacion = (s: any) => {
        setObservacionActual(s);
        setObservacionSiembraValue(s.observacion_siembra ?? '');
        setObservacionLecturaValue(s.observacion_lectura ?? '');
        setOpenObservacion(true);
    };

    // Guardar observación sola
    const guardarObservacion = () => {
        router.post(
            route('seguimiento-htst.observacion', observacionActual.id),
            {
                observacion_siembra: observacionSiembraValue,
                observacion_lectura: observacionLecturaValue,
            },
            {
                preserveScroll: true,
                onSuccess: () => setOpenObservacion(false),
            },
        );
    };

    // URL del endpoint
    const urlPdf = route('seguimiento-htst.pdf');

    // Función para generar PDF
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

            if (data.seguimientos.length === 0) {
                alert('No hay seguimientos para el ORP seleccionado');
                return;
            }

            setDatosPdf(data.seguimientos);
            setUsuariosPdf(data.usuarios_involucrados || []);
            setMostrarPdf(true);
        } catch (error) {
            console.error(error);
            alert('Error al generar el reporte');
        } finally {
            setGenerandoPdf(false);
        }
    };

    const abrirMoho = (s: any) => {
        setMohoActual(s);
        setMohos(s.mohos ?? '');
        setObservacion(s.observacion_lectura ?? '');
        setOpenMoho(true);
    };

    const [openColiformes, setOpenColiformes] = useState(false);
    const [seguimientoActual, setSeguimientoActual] = useState<any>(null);
    const [aerovios, setaerovios] = useState('');
    const [coliformes, setColiformes] = useState('');

    const abrirColiformes = (s: any) => {
        setSeguimientoActual(s);
        setaerovios(s.aerovios ?? '');
        setColiformes(s.coliformes ?? '');
        setOpenColiformes(true);
    };

    const guardarColiformes = () => {
        router.post(
            route('seguimiento-htst.coliformes.guardar', seguimientoActual.id),
            { aerovios, coliformes, observacion_lectura: observacion }, // ← agregamos observacion
            {
                preserveScroll: true,
                onSuccess: () => setOpenColiformes(false),
            },
        );
    };

    const coliformesCero = (id: number) => {
        router.post(
            route('seguimiento-htst.coliformes.cero', id),
            {},
            { preserveScroll: true },
        );
    };

    const guardarMoho = () => {
        router.post(
            route('seguimiento-htst.moho.guardar', mohoActual.id),
            { mohos, observacion_lectura: observacion },
            {
                preserveScroll: true,
                onSuccess: () => setOpenMoho(false),
            },
        );
    };

    const mohoCero = (id: number) => {
        router.post(
            route('seguimiento-htst.moho.cero', id),
            {},
            { preserveScroll: true },
        );
    };

    const {
        seguimientos,
        filters: initialFilters = {},
        orps = [],
        productosTerminados = [],
        estados = [],
        origenes = [],
        usuarios = [],
        flash,
    } = props;

    const { filters, updateFilter, resetFilters } = useAdvancedFilters({
        routeName: 'seguimiento-htst.index',
        initialFilters: {
            search: initialFilters.search || '',
            orp: initialFilters.orp || '',
            producto_terminado: initialFilters.producto_terminado || '',
            estado: initialFilters.estado || '',
            origen: initialFilters.origen || '',
            usuario: initialFilters.usuario || '',
            fecha_vencimiento_desde:
                initialFilters.fecha_vencimiento_desde || '', // ← nuevo
            fecha_vencimiento_hasta:
                initialFilters.fecha_vencimiento_hasta || '', // ← nuevo
            per_page: initialFilters.per_page?.toString() || '10',
        },
        debounceFields: ['search'],
        debounceDelay: 600,
    });

    const hasActiveFilters = Object.values(filters).some(
        (v) => v && v !== '' && v !== '10',
    );

    const getRegistroSeleccionadoInfo = (seguimiento: any) => {
        if (!seguimiento) return null;

        return {
            orp: seguimiento.orp?.codigo || '-',
            codigo: seguimiento.codigo || '-',
            origen: seguimiento.origen?.alias || '-',
            lote: seguimiento.lote || '-',
            producto: seguimiento.orp?.producto_terminado?.nombre_sap || '-',
        };
    };

    const RegistroSeleccionadoInfo = ({ seguimiento }: { seguimiento: any }) => {
        if (!seguimiento) return null;

        const info = getRegistroSeleccionadoInfo(seguimiento);

        return (
            <div className="rounded-md border border-border bg-muted/40 p-3 text-sm">
                <div className="mb-2 font-semibold text-foreground">
                    Registro seleccionado
                </div>
                <div className="space-y-2 text-muted-foreground">
                    <div className="flex flex-wrap gap-2">
                        <div className="rounded-md bg-background px-2 py-1">
                            <span className="font-medium text-foreground">ORP: </span>
                            {info?.orp}
                        </div>
                        <div className="rounded-md bg-background px-2 py-1">
                            <span className="font-medium text-foreground">Código: </span>
                            {info?.codigo}
                        </div>
                        <div className="rounded-md bg-background px-2 py-1">
                            <span className="font-medium text-foreground">Origen: </span>
                            {info?.origen}
                        </div>
                        <div className="rounded-md bg-background px-2 py-1">
                            <span className="font-medium text-foreground">Lote: </span>
                            {info?.lote}
                        </div>
                    </div>
                    <div className="flex flex-wrap gap-2">
                        <div className="rounded-md bg-background px-2 py-1">
                            <span className="font-medium text-foreground">Producto: </span>
                            {info?.producto}
                        </div>
                    </div>
                </div>
            </div>
        );
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Seguimientos HTST" />
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
                        {hasPermission('c_seguimientoHtst') && (
                            <Link href={route('seguimiento-htst.create')}>
                                <Button size="sm">
                                    <Plus className="h-4 w-4" />
                                    <p className="hidden md:block">
                                        Nuevo seguimiento
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
                                    <TableHead>Cod</TableHead>
                                    <TableHead>Siembra</TableHead>
                                    <TableHead>F. Venc.</TableHead>
                                    <TableHead>
                                        {' '}
                                        Prep
                                        <br /> Lote
                                    </TableHead>
                                    <TableHead>Origen</TableHead>
                                    <TableHead>
                                        Hora <br /> Sachet
                                    </TableHead>
                                    <TableHead>F. Prod</TableHead>
                                    <TableHead>ORP</TableHead>

                                    <TableHead>aerovios</TableHead>
                                    <TableHead>Coliformes</TableHead>
                                    <TableHead>Moho</TableHead>

                                    <TableHead>Solicitante</TableHead>

                                    <TableHead>Estado</TableHead>
                                    <TableHead>Observaciones</TableHead>
                                    <TableHead></TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {seguimientos.data.length === 0 ? (
                                    <TableRow>
                                        <TableCell
                                            colSpan={7}
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
                                            <TableCell className="font-mono">
                                                {s.codigo}
                                            </TableCell>
                                            <TableCell>
                                                {s.tiempo_siembra ? (
                                                    <TooltipProvider>
                                                        <Tooltip>
                                                            <TooltipTrigger
                                                                asChild
                                                            >
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
                                                ) : (
                                                    hasPermission(
                                                        'u_seguimientoHtst',
                                                    ) && (
                                                        <Button
                                                            size="sm"
                                                            variant="outline"
                                                            onClick={() =>
                                                                router.post(
                                                                    route(
                                                                        'seguimiento-htst.sembrar',
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
                                                )}
                                            </TableCell>

                                            <TableCell>
                                                <div className="space-y-1">
                                                    <Fecha
                                                        value={
                                                            s.orp.fecha_vencimiento1
                                                        }
                                                    />
                                                    {s.orp.fecha_vencimiento2 && (
                                                        <div>
                                                            <Fecha
                                                                value={
                                                                    s.orp.fecha_vencimiento2
                                                                }
                                                            />
                                                        </div>
                                                    )}
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                {s.preparacion}
                                                <br />
                                                {s.lote}
                                            </TableCell>
                                            <TableCell>
                                                {s.origen?.alias ==
                                                'EMBOTELLADORA'
                                                    ? 'EMB'
                                                    : s.origen?.alias}
                                            </TableCell>
                                            <TableCell>
                                                {s.hora_sachet?.split('.')[0]}
                                            </TableCell>

                                            <TableCell>
                                                {s.orp.tiempo_produccion}
                                            </TableCell>
                                            <TableCell>
                                                <TooltipProvider>
                                                    <Tooltip>
                                                        <TooltipTrigger asChild>
                                                            <div>
                                                                <div className="font-medium text-foreground">
                                                                    {
                                                                        s.orp
                                                                            .producto_terminado
                                                                            ?.nombre_sap
                                                                    }
                                                                </div>
                                                                <div className="text-xs font-medium text-muted-foreground">
                                                                    {
                                                                        s.orp
                                                                            .codigo
                                                                    }
                                                                </div>
                                                            </div>
                                                        </TooltipTrigger>
                                                        <TooltipContent className="max-w-sm break-words whitespace-pre-wrap">
                                                            <p>
                                                                {
                                                                    s.orp
                                                                        .producto_terminado
                                                                        ?.nombre_sap
                                                                }
                                                            </p>
                                                        </TooltipContent>
                                                    </Tooltip>
                                                </TooltipProvider>
                                            </TableCell>

                                            <TableCell>
                                                <TooltipProvider>
                                                    <Tooltip>
                                                        <TooltipTrigger asChild>
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
                                                                            zeroDisplayMode="lt1Power" // opcional, ya es el default
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
                                                                <strong></strong>{' '}
                                                                {s.usuario_dia2
                                                                    ?.name ||
                                                                    '-'}{' '}
                                                                {s.usuario_dia2
                                                                    ?.apellido ||
                                                                    '-'}
                                                            </p>
                                                        </TooltipContent>
                                                    </Tooltip>
                                                </TooltipProvider>
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex">
                                                    <TooltipProvider>
                                                        <Tooltip>
                                                            <TooltipTrigger
                                                                asChild
                                                            >
                                                                <div>
                                                                    <div className="font-medium text-foreground">
                                                                        <ScientificNotation
                                                                            value={
                                                                                s.coliformes
                                                                            }
                                                                            decimals={
                                                                                3
                                                                            }
                                                                            fallback="-"
                                                                            useSuperscript
                                                                            zeroDisplayMode="lt1Power" // opcional, ya es el default
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
                                                                    <strong></strong>{' '}
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
                                                        'u_seguimientoHtst',
                                                        168,
                                                    ) && (
                                                        <div className="text-xs font-medium text-muted-foreground">
                                                            <Button
                                                                size="icon"
                                                                variant="ghost"
                                                                onClick={() =>
                                                                    abrirColiformes(
                                                                        s,
                                                                    )
                                                                }
                                                            >
                                                                <Pencil className="h-4 w-4" />
                                                            </Button>

                                                            <Button
                                                                size="icon"
                                                                variant="ghost"
                                                                onClick={() =>
                                                                    coliformesCero(
                                                                        s.id,
                                                                    )
                                                                }
                                                            >
                                                                <Check className="h-4 w-4" />
                                                            </Button>
                                                        </div>
                                                    )}
                                                </div>
                                            </TableCell>

                                            <TableCell>
                                                <div className="flex">
                                                    <TooltipProvider>
                                                        <Tooltip>
                                                            <TooltipTrigger
                                                                asChild
                                                            >
                                                                <div>
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
                                                                            zeroDisplayMode="lt1Power" // opcional, ya es el default
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
                                                                    <strong></strong>{' '}
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
                                                    {canDo(
                                                        s,
                                                        'u_seguimientoHtst',
                                                        168,
                                                    ) && (
                                                        <div className="text-xs font-medium text-muted-foreground">
                                                            <Button
                                                                size="icon"
                                                                variant="ghost"
                                                                onClick={() =>
                                                                    abrirMoho(s)
                                                                }
                                                            >
                                                                <Pencil className="h-4 w-4" />
                                                            </Button>

                                                            <Button
                                                                size="icon"
                                                                variant="ghost"
                                                                onClick={() =>
                                                                    mohoCero(
                                                                        s.id,
                                                                    )
                                                                }
                                                            >
                                                                <Check className="h-4 w-4" />
                                                            </Button>
                                                        </div>
                                                    )}
                                                </div>
                                            </TableCell>

                                            <TableCell>
                                                {getInitials(s.user?.name) ||
                                                    ''}
                                                {getInitials(
                                                    s.user?.apellido,
                                                ) || ''}
                                            </TableCell>

                                            <TableCell>
                                                <span
                                                    className={`rounded-full px-2 py-1 text-xs font-medium ${
                                                        s.estado?.nombre === 'Completado'
                                                            ? 'bg-green-100 text-green-700'
                                                            : s.estado?.nombre === 'Pendiente'
                                                              ? 'bg-yellow-100 text-yellow-700'
                                                              : 'bg-primary/10 text-primary'
                                                    }`}
                                                >
                                                    {s.estado?.nombre}
                                                </span>
                                            </TableCell>
                                            {hasPermission(
                                                'c_seguimientoHtst',
                                            ) && (
                                                <TableCell className="align-top">
                                                    <div className="flex items-start gap-2">
                                                        <Button
                                                            size="icon"
                                                            variant="ghost"
                                                            onClick={() =>
                                                                abrirObservacion(
                                                                    s,
                                                                )
                                                            }
                                                        >
                                                            <Eye className="h-4 w-4" />
                                                        </Button>
                                                        <div className="flex-1 space-y-0">
                                                            <div className="text-xs">
                                                                <span className="font-semibold">
                                                                    Siembra:
                                                                </span>{' '}
                                                                {s.observacion_siembra ||
                                                                    '-'}
                                                            </div>
                                                            <div className="text-xs">
                                                                <span className="font-semibold">
                                                                    Lectura:
                                                                </span>{' '}
                                                                {s.observacion_lectura ||
                                                                    '-'}
                                                            </div>
                                                        </div>
                                                    </div>
                                                </TableCell>
                                            )}
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
                                                                        'htst.seguimientos.show',
                                                                        s.id,
                                                                    ),
                                                                )
                                                            }
                                                        >
                                                            <Eye className="mr-2 h-4 w-4" />
                                                            Ver detalle
                                                        </DropdownMenuItem>

                                                        {canDo(
                                                            s,
                                                            'u_seguimientoHtst',
                                                            8,
                                                            true,
                                                        ) && (
                                                            <DropdownMenuItem
                                                                onClick={() =>
                                                                    abrirEdicion(s)
                                                                }
                                                            >
                                                                <Pencil className="mr-2 h-4 w-4" />
                                                                Editar registro
                                                            </DropdownMenuItem>
                                                        )}

                                                        {canDo(
                                                            s,
                                                            'd_seguimientoHtst',
                                                            8,
                                                            true,
                                                            false,
                                                            false,
                                                        ) && (
                                                            <DropdownMenuItem
                                                                onClick={() => {
                                                                    if (
                                                                        confirm(
                                                                            '¿Está seguro de eliminar este seguimiento? Esta acción no se puede deshacer.',
                                                                        )
                                                                    ) {
                                                                        router.delete(
                                                                            route(
                                                                                'seguimiento-htst.destroy',
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
                                        route('seguimiento-htst.index'),
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
                <div className="mt-4 flex items-end gap-2">
                    <div className="flex-1">
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
                    <div>
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
                        <DialogTitle>Registrar Coliformes</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-3">
                        <RegistroSeleccionadoInfo seguimiento={seguimientoActual} />

                        <Input
                            type="number"
                            placeholder="aerovios"
                            value={aerovios}
                            onChange={(e) => setaerovios(e.target.value)}
                        />
                        <Input
                            type="number"
                            placeholder="Coliformes"
                            value={coliformes}
                            onChange={(e) => setColiformes(e.target.value)}
                        />
                        {/* Nuevo campo observación */}
                        <Textarea
                            placeholder="Observación de lectura"
                            value={observacion} // reutilizamos el mismo estado que en moho? Mejor usar uno específico.
                            onChange={(e) => setObservacion(e.target.value)}
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
                                    Reporte de Seguimiento HTST
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
                                <ReporteSeguimientoHtst
                                    datos={datosPdf}
                                    usuariosInvolucrados={usuariosPdf}
                                />
                            </PDFViewer>
                        </div>
                    </div>
                </div>
            )}

            <Dialog open={openObservacion} onOpenChange={setOpenObservacion}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Editar observaciones</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-3">
                        <div>
                            <label className="text-sm font-medium">
                                Observación de siembra
                            </label>
                            <Textarea
                                placeholder="Observación de siembra"
                                value={observacionSiembraValue}
                                onChange={(e) =>
                                    setObservacionSiembraValue(e.target.value)
                                }
                                rows={3}
                            />
                        </div>
                        <div>
                            <label className="text-sm font-medium">
                                Observación de lectura
                            </label>
                            <Textarea
                                placeholder="Observación de lectura"
                                value={observacionLecturaValue}
                                onChange={(e) =>
                                    setObservacionLecturaValue(e.target.value)
                                }
                                rows={3}
                            />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button
                            variant="outline"
                            onClick={() => setOpenObservacion(false)}
                        >
                            Cancelar
                        </Button>
                        <Button onClick={guardarObservacion}>Guardar</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            <Dialog open={openEditar} onOpenChange={setOpenEditar}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Editar seguimiento HTST</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-3">
                        <div className="space-y-1">
                            <label className="text-sm font-medium">ORP</label>
                            <FilterSelect
                                value={formEditar.orp_id}
                                onChange={(value) =>
                                    setFormEditar((form) => ({ ...form, orp_id: value }))
                                }
                                placeholder="Seleccionar ORP"
                                options={orps.map((orp) => ({
                                    value: String(orp.id),
                                    label: orp.codigo,
                                }))}
                            />
                        </div>
                        <div className="space-y-1">
                            <label className="text-sm font-medium">Preparación</label>
                            <Input
                                value={formEditar.preparacion}
                                onChange={(event) =>
                                    setFormEditar((form) => ({
                                        ...form,
                                        preparacion: event.target.value,
                                    }))
                                }
                            />
                        </div>
                        <div className="space-y-1">
                            <label className="text-sm font-medium">Lote</label>
                            <Input
                                value={formEditar.lote}
                                onChange={(event) =>
                                    setFormEditar((form) => ({
                                        ...form,
                                        lote: event.target.value,
                                    }))
                                }
                            />
                        </div>
                        <div className="space-y-1">
                            <label className="text-sm font-medium">Origen</label>
                            <FilterSelect
                                value={formEditar.origen_id}
                                onChange={(value) =>
                                    setFormEditar((form) => ({
                                        ...form,
                                        origen_id: value,
                                    }))
                                }
                                placeholder="Seleccionar origen"
                                options={origenes.map((origen) => ({
                                    value: String(origen.id),
                                    label: origen.alias,
                                }))}
                            />
                        </div>
                        <div className="space-y-1">
                            <label className="text-sm font-medium">
                                Hora de sachet
                            </label>
                            <Input
                                type="time"
                                value={formEditar.hora_sachet}
                                onChange={(event) =>
                                    setFormEditar((form) => ({
                                        ...form,
                                        hora_sachet: event.target.value,
                                    }))
                                }
                            />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button
                            variant="outline"
                            onClick={() => setOpenEditar(false)}
                        >
                            Cancelar
                        </Button>
                        <Button onClick={guardarEdicion}>Guardar cambios</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </AppLayout>
    );
}
