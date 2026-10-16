import { Button } from '@/components/ui/button';
import Fecha from '@/components/ui/fecha';
import FilterSelect from '@/components/ui/filter-select';
import { Input } from '@/components/ui/input';
import ReporteHisopados from '@/pdf/ReporteHisopados';
import { PDFViewer } from '@react-pdf/renderer';
import { Printer } from 'lucide-react';

import ScientificNotation from '@/components/ui/ScientificNotation';
import {
    Dialog,
    DialogContent,
    DialogDescription,
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
import { Head, router, usePage } from '@inertiajs/react';
import {
    Check,
    Eye,
    Filter,
    MoreHorizontal,
    Pencil,
    Search,
    Users,
    X,
} from 'lucide-react';

import { useMemo, useState } from 'react';
import { route } from 'ziggy-js';

import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import TablePagination from '@/components/ui/table-pagination';

const breadcrumbs: BreadcrumbItem[] = [{ title: 'Hisopados', href: '#' }];

interface PageProps {
    [key: string]: any;
    hisopados: {
        data: any[];
        links: any[];
        current_page: number;
        last_page: number;
        per_page: number;
        total: number;
    };

    usuariosPorCapacitar: Array<{
        id: number;
        name: string;
        apellido?: string;
        codigo?: string;
        estado_hisopado?: { nombre: string };
        hisopado_id?: number;
        correccion_id?: number;
    }>;

    filters: {
        search?: string;
        fecha_desde?: string;
        fecha_hasta?: string;
        estado?: string;
        usuario?: string;
        usuario_siembra?: string;
        usuario_lectura?: string;
        coliformes_min?: string;
        coliformes_max?: string;
        per_page?: number;
    };
    estados: { nombre: string }[];
    usuarios: {
        id: number;
        name: string;
        apellido?: string;
        codigo?: string;
        estado_hisopado?: { nombre: string };
    }[];
    usuariosSiembra: { name: string; apellido?: string }[];
    usuariosLectura: { name: string; apellido?: string }[];
    flash: {
        success?: string;
        error?: string;
    };
}

export default function Index() {
    const { props } = usePage<PageProps>();
    const [showFilters, setShowFilters] = useState(false);
    const [creandoIds, setCreandoIds] = useState<number[]>([]);
    const [busquedaUsuarios, setBusquedaUsuarios] = useState('');

    const { hasPermission } = useAuth();
    const getInitials = useInitials();

    const [openLectura, setOpenLectura] = useState(false);
    const [openSiembra, setOpenSiembra] = useState(false);
    const [hisopadoActual, setHisopadoActual] = useState<any>(null);
    const [coliformes, setColiformes] = useState('');
    const [observacionLectura, setObservacionLectura] = useState('');
    const [observacionSiembra, setObservacionSiembra] = useState('');
    const [showResetConfirm, setShowResetConfirm] = useState(false);
    const [resetLoading, setResetLoading] = useState(false);

    const [capacitandoIds, setCapacitandoIds] = useState<number[]>([]);
    const [creandoCapacitadoIds, setCreandoCapacitadoIds] = useState<number[]>(
        [],
    );

    // Estados para el PDF
    const [fechaDesde, setFechaDesde] = useState<string>('');
    const [fechaHasta, setFechaHasta] = useState<string>('');
    const [datosPdf, setDatosPdf] = useState<any[]>([]);
    const [usuariosPdf, setUsuariosPdf] = useState<any[]>([]);
    const [mostrarPdf, setMostrarPdf] = useState(false);
    const [generandoPdf, setGenerandoPdf] = useState(false);

    const urlPdf = route('hisopados.pdf');

    const handleMostrarPdf = async () => {
        if (!fechaDesde || !fechaHasta) {
            alert('Por favor selecciona ambas fechas');
            return;
        }

        setGenerandoPdf(true);
        try {
            const params = new URLSearchParams();
            params.append('fecha_desde', fechaDesde);
            params.append('fecha_hasta', fechaHasta);

            const response = await fetch(`${urlPdf}?${params.toString()}`);
            if (!response.ok) throw new Error('Error al obtener los datos');

            const data = await response.json();

            // Transformar datos al formato esperado por el componente PDF
            const datosTransformados = data.hisopados.map((h: any) => ({
                fecha: h.tiempo,
                fecha_siembra: h.tiempo_siembra,
                fecha_lectura: h.tiempo_lectura,
                coliformes: h.coliformes,
                estado: h.estado?.nombre || '-',
                usuario: `${h.user?.name || ''} ${h.user?.apellido || ''}`,
                codigo_usuario: h.user?.codigo || '',
                cargo: h.user?.cargo || '-',
                usuario_siembra: `${h.usuario_siembra?.name || ''} ${h.usuario_siembra?.apellido || ''}`,
                codigo_usuario_siembra: h.usuario_siembra?.codigo || '',
                usuario_lectura: `${h.usuario_lectura?.name || ''} ${h.usuario_lectura?.apellido || ''}`,
                codigo_usuario_lectura: h.usuario_lectura?.codigo || '',
                observacion_siembra: h.observacion_siembra || '-',
                observacion_lectura: h.observacion_lectura || '-',
                correcciones: (h.hisopado_correcciones || []).map((correccion: any) => ({
                    usuario_capacitador: `${correccion.user?.name || ''} ${correccion.user?.apellido || ''}`.trim(),
                    fecha_capacitacion: h.tiempo,
                    usuario_capacitado: `${h.user?.name || ''} ${h.user?.apellido || ''}`.trim(),
                    fecha_correccion: correccion.tiempo,
                })),
            }));

            if (datosTransformados.length === 0) {
                alert('No hay hisopados para el rango de fechas seleccionado');
                return;
            }

            setDatosPdf(datosTransformados);
            setUsuariosPdf(data.usuarios_involucrados || []);
            setMostrarPdf(true);
        } catch (error) {
            console.error('Error al generar PDF:', error);
            alert('Error al generar el reporte. Por favor, intenta de nuevo.');
        } finally {
            setGenerandoPdf(false);
        }
    };

    const abrirLectura = (h: any) => {
        setHisopadoActual(h);
        setColiformes(h.coliformes ?? '');
        setObservacionLectura(h.observacion_lectura ?? '');
        setOpenLectura(true);
    };

    const abrirSiembra = (h: any) => {
        setHisopadoActual(h);
        setObservacionSiembra(h.observacion_siembra ?? '');
        setOpenSiembra(true);
    };

    const {
        hisopados,
        usuariosPorCapacitar = [], // <-- AÑADE ESTA LÍNEA
        filters: initialFilters = {},
        estados = [],
        usuarios = [],
        usuariosSiembra = [],
        usuariosLectura = [],
        flash,
    } = props;

    const guardarLectura = () => {
        if (!hisopadoActual) return;

        router.post(
            route('hisopados.guardar-lectura', hisopadoActual.id),
            {
                coliformes,
                observacion_lectura: observacionLectura,
            },
            {
                preserveScroll: true,
                onSuccess: () => setOpenLectura(false),
            },
        );
    };

    const guardarSiembra = () => {
        if (!hisopadoActual) return;

        router.post(
            route('hisopados.guardar-siembra', hisopadoActual.id),
            {
                observacion_siembra: observacionSiembra,
            },
            {
                preserveScroll: true,
                onSuccess: () => setOpenSiembra(false),
            },
        );
    };

    const marcarComoCapacitado = (userId: number, correccionId: number) => {
        setCapacitandoIds((prev) => [...prev, userId]);

        router.post(
            route('hisopados.marcar-capacitado'),
            {
                user_id: userId,
                correccion_id: correccionId,
            },
            {
                preserveScroll: true,
                onSuccess: () => {
                    // Recargar para actualizar la lista
                    router.reload();
                },
                onError: () => {
                    console.error('Error al marcar como capacitado');
                },
                onFinish: () => {
                    setCapacitandoIds((prev) =>
                        prev.filter((id) => id !== userId),
                    );
                },
            },
        );
    };

    const crearHisopadoCapacitado = (userId: number) => {
        setCreandoCapacitadoIds((prev) => [...prev, userId]);

        router.post(
            route('hisopados.crear-capacitado'),
            {
                user_id: userId,
            },
            {
                preserveScroll: true,
                onSuccess: () => {
                    // Recargar para actualizar la lista
                    router.reload();
                },
                onError: () => {
                    console.error('Error al crear hisopado para capacitado');
                },
                onFinish: () => {
                    setCreandoCapacitadoIds((prev) =>
                        prev.filter((id) => id !== userId),
                    );
                },
            },
        );
    };

    const lecturaCero = (id: number) => {
        router.post(
            route('hisopados.lectura-cero', id),
            {},
            { preserveScroll: true },
        );
    };

    // CORREGIDO: Función para resetear estado
    const resetearEstadoHisopado = () => {
        if (!hasPermission('u_hisopado')) {
            return;
        }

        setResetLoading(true);

        router.post(
            route('hisopados.reset-estado'),
            {},
            {
                preserveScroll: true,
                onSuccess: () => {
                    setShowResetConfirm(false);
                    // Recargar datos de usuarios
                    router.reload({ only: ['usuarios'] });
                },
                onError: () => {
                    console.error('Error al resetear estado');
                },
                onFinish: () => {
                    setResetLoading(false);
                },
            },
        );
    };

    const sembrarHisopado = (id: number) => {
        router.post(
            route('hisopados.sembrar', id),
            {},
            { preserveScroll: true },
        );
    };

    const crearHisopado = (userId: number) => {
        setCreandoIds((prev) => [...prev, userId]);

        router.post(
            route('hisopados.store'),
            {
                user_id: userId,
                tiempo: new Date().toISOString().split('T')[0],
            },
            {
                preserveScroll: true,
                onFinish: () => {
                    setCreandoIds((prev) => prev.filter((id) => id !== userId));
                },
            },
        );
    };

    const { filters, updateFilter, resetFilters } = useAdvancedFilters({
        routeName: 'hisopados.index',
        initialFilters: {
            search: initialFilters.search || '',
            fecha_desde: initialFilters.fecha_desde || '',
            fecha_hasta: initialFilters.fecha_hasta || '',
            estado: initialFilters.estado || '',
            usuario: initialFilters.usuario || '',
            usuario_siembra: initialFilters.usuario_siembra || '',
            usuario_lectura: initialFilters.usuario_lectura || '',
            coliformes_min: initialFilters.coliformes_min || '',
            coliformes_max: initialFilters.coliformes_max || '',
            per_page: initialFilters.per_page?.toString() || '10',
        },
        debounceFields: ['search'],
        debounceDelay: 600,
    });

    const hasActiveFilters = Object.values(filters).some(
        (v) => v && v !== '' && v !== '10',
    );

    // Verificar qué usuarios ya tienen hisopado hoy
    const hoy = new Date().toISOString().split('T')[0];
    const usuariosConHisopadoHoy = hisopados.data
        .filter((h) => h.tiempo === hoy)
        .map((h) => h.user_id);

    // Filtrar usuarios basado en la búsqueda
    const usuariosFiltrados = useMemo(() => {
        if (!busquedaUsuarios.trim()) {
            return usuarios;
        }

        const busqueda = busquedaUsuarios.toLowerCase().trim();

        return usuarios.filter((usuario) => {
            // Buscar por nombre
            if (usuario.name.toLowerCase().includes(busqueda)) return true;

            // Buscar por apellido
            if (
                usuario.apellido &&
                usuario.apellido.toLowerCase().includes(busqueda)
            )
                return true;

            // Buscar por código (si existe)
            if (
                usuario.codigo &&
                usuario.codigo.toLowerCase().includes(busqueda)
            )
                return true;

            // Buscar por nombre completo (nombre + apellido)
            const nombreCompleto =
                `${usuario.name} ${usuario.apellido || ''}`.toLowerCase();
            if (nombreCompleto.includes(busqueda)) return true;

            return false;
        });
    }, [usuarios, busquedaUsuarios]);

    // Contadores para mostrar en el header
    const usuariosRegistradosHoy = usuariosFiltrados.filter((u) =>
        usuariosConHisopadoHoy.includes(u.id),
    ).length;

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Hisopados" />
            <div className="space-y-4 px-2 py-2 sm:px-6">
                <Toast />

                {/* Header */}
                <div className="flex items-center justify-between">
                    <div className="relative max-w-md">
                        <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                        <Input
                            placeholder="Buscar por observaciones, coliformes, usuario..."
                            value={filters.search}
                            onChange={(e) =>
                                updateFilter('search', e.target.value)
                            }
                            className="pl-10"
                        />
                    </div>

                    <div className="flex gap-2">
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
                    <div className="rounded-lg border border-border bg-muted/50 p-4">
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
                            <Input
                                type="date"
                                value={filters.fecha_desde}
                                onChange={(e) =>
                                    updateFilter('fecha_desde', e.target.value)
                                }
                                placeholder="Desde"
                                className="w-full"
                            />

                            <Input
                                type="date"
                                value={filters.fecha_hasta}
                                onChange={(e) =>
                                    updateFilter('fecha_hasta', e.target.value)
                                }
                                placeholder="Hasta"
                                className="w-full"
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
                                placeholder="Usuario Registro"
                                options={usuarios.map((u) => ({
                                    value: u.name,
                                    label: `${u.name} ${u.apellido || ''}`,
                                }))}
                            />

                            <FilterSelect
                                value={filters.usuario_siembra}
                                onChange={(v) =>
                                    updateFilter('usuario_siembra', v)
                                }
                                placeholder="Usuario Siembra"
                                options={usuariosSiembra.map((u) => ({
                                    value: u.name,
                                    label: `${u.name} ${u.apellido || ''}`,
                                }))}
                            />

                            <FilterSelect
                                value={filters.usuario_lectura}
                                onChange={(v) =>
                                    updateFilter('usuario_lectura', v)
                                }
                                placeholder="Usuario Lectura"
                                options={usuariosLectura.map((u) => ({
                                    value: u.name,
                                    label: `${u.name} ${u.apellido || ''}`,
                                }))}
                            />

                            <Input
                                type="number"
                                value={filters.coliformes_min}
                                onChange={(e) =>
                                    updateFilter(
                                        'coliformes_min',
                                        e.target.value,
                                    )
                                }
                                placeholder="Colif. mín"
                                className="w-full"
                                min="0"
                            />

                            <Input
                                type="number"
                                value={filters.coliformes_max}
                                onChange={(e) =>
                                    updateFilter(
                                        'coliformes_max',
                                        e.target.value,
                                    )
                                }
                                placeholder="Colif. máx"
                                className="w-full"
                                min="0"
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
                        </div>
                    </div>
                )}

                <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
                    {/* Tabla de hisopados */}
                    <div className="lg:col-span-2">
                        <div className="overflow-hidden rounded-lg border bg-background shadow-sm">
                            <div className="overflow-x-auto">
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            {/* <TableHead>#</TableHead> */}
                                            <TableHead>Siembra</TableHead>
                                            <TableHead>Lectura</TableHead>
                                            <TableHead>Usuario</TableHead>
                                            <TableHead>Estado</TableHead>
                                             <TableHead>Corrección</TableHead>
                                            <TableHead>Observaciones</TableHead>
                                            <TableHead></TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {hisopados.data.length === 0 ? (
                                            <TableRow>
                                                <TableCell
                                                    colSpan={7} // CORREGIDO: Cambiado de 11 a 6
                                                    className="py-8 text-center"
                                                >
                                                    No se encontraron hisopados
                                                </TableCell>
                                            </TableRow>
                                        ) : (
                                            hisopados.data.map((h) =>  {
                              const usuarioCorreccion = h.usuario_correccion;

            // Debug (opcional, elimina después)
            console.log('Hisopado ID:', h.id);
            console.log('Usuario corrección:', usuarioCorreccion);

                            return (
                                                <TableRow
                                                    key={h.id}
                                                    className="hover:bg-muted/50"
                                                >
                                                    {/* <TableCell>
                                                        <span>{h.id}</span>
                                                    </TableCell> */}

                                                    <TableCell>
                                                        <TooltipProvider>
                                                            <Tooltip>
                                                                <TooltipTrigger
                                                                    asChild
                                                                >
                                                                    <div>
                                                                        <div className="font-medium text-foreground">
                                                                            <Fecha
                                                                                value={
                                                                                    h.tiempo_siembra
                                                                                }
                                                                            />
                                                                        </div>
                                                                        <div className="text-xs font-medium text-muted-foreground">
                                                                            {getInitials(
                                                                                h
                                                                                    .usuario_siembra
                                                                                    ?.name,
                                                                            ) ||
                                                                                ''}
                                                                            {getInitials(
                                                                                h
                                                                                    .usuario_siembra
                                                                                    ?.apellido,
                                                                            ) ||
                                                                                ''}
                                                                        </div>
                                                                    </div>
                                                                </TooltipTrigger>
                                                                <TooltipContent>
                                                                    <p>
                                                                        {h
                                                                            .usuario_siembra
                                                                            ?.name ||
                                                                            '-'}{' '}
                                                                        {h
                                                                            .usuario_siembra
                                                                            ?.apellido ||
                                                                            '-'}
                                                                    </p>
                                                                </TooltipContent>
                                                            </Tooltip>
                                                        </TooltipProvider>
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
                                                                                        h.coliformes

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
                                                                                    h
                                                                                        .usuario_lectura
                                                                                        ?.name,
                                                                                ) ||
                                                                                    ''}
                                                                                {getInitials(
                                                                                    h
                                                                                        .usuario_lectura
                                                                                        ?.apellido,
                                                                                ) ||
                                                                                    ''}
                                                                            </div>
                                                                        </div>
                                                                    </TooltipTrigger>
                                                                    <TooltipContent className="max-w-sm break-words whitespace-pre-wrap">
                                                                        <p>
                                                                            {h
                                                                                .usuario_lectura
                                                                                ?.name ||
                                                                                '-'}{' '}
                                                                            {h
                                                                                .usuario_lectura
                                                                                ?.apellido ||
                                                                                '-'}
                                                                        </p>
                                                                    </TooltipContent>
                                                                </Tooltip>
                                                            </TooltipProvider>

                                                            <div className="flex gap-1">
                                                                {hasPermission(
                                                                    'u_hisopado',
                                                                ) && (
                                                                    <Button
                                                                        size="icon"
                                                                        variant="ghost"
                                                                        aria-label="Observación de siembra"
                                                                        onClick={() =>
                                                                            abrirSiembra(
                                                                                h,
                                                                            )
                                                                        }
                                                                    >
                                                                        <Eye className="h-4 w-4" />
                                                                    </Button>
                                                                )}

                                                                {hasPermission(
                                                                    'u_hisopado',
                                                                ) && (
                                                                    <Button
                                                                        size="icon"
                                                                        variant="ghost"
                                                                        onClick={() =>
                                                                            abrirLectura(
                                                                                h,
                                                                            )
                                                                        }
                                                                    >
                                                                        <Pencil className="h-4 w-4" />
                                                                    </Button>
                                                                )}

                                                                {hasPermission(
                                                                    'u_hisopado',
                                                                ) && (
                                                                    <Button
                                                                        size="icon"
                                                                        variant="ghost"
                                                                        onClick={() =>
                                                                            lecturaCero(
                                                                                h.id,
                                                                            )
                                                                        }
                                                                    >
                                                                        <Check className="h-4 w-4" />
                                                                    </Button>
                                                                )}
                                                            </div>
                                                        </div>
                                                    </TableCell>

                                                    <TableCell>
                                                        <TooltipProvider>
                                                            <Tooltip>
                                                                <TooltipTrigger
                                                                    asChild
                                                                >
                                                                    <div>
                                                                        <div className="font-medium text-foreground">
                                                                            {h
                                                                                .user
                                                                                ?.name ||
                                                                                ''}{' '}
                                                                            {h
                                                                                .user
                                                                                ?.apellido ||
                                                                                ''}
                                                                        </div>
                                                                        <div className="text-xs font-medium text-muted-foreground">
                                                                            {h
                                                                                .user
                                                                                ?.codigo ||
                                                                                ''}
                                                                        </div>
                                                                    </div>
                                                                </TooltipTrigger>
                                                                <TooltipContent>
                                                                    <p>
                                                                        {h.user
                                                                            ?.name ||
                                                                            '-'}{' '}
                                                                        {h.user
                                                                            ?.apellido ||
                                                                            '-'}
                                                                    </p>
                                                                </TooltipContent>
                                                            </Tooltip>
                                                        </TooltipProvider>
                                                    </TableCell>

                                                    <TableCell>
                                                        <span
                                                            className={`rounded-full px-2 py-1 text-xs ${
                                                                h.estado
                                                                    ?.nombre ===
                                                                'Completado'
                                                                    ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300'
                                                                    : h.estado
                                                                            ?.nombre ===
                                                                        'Pendiente'
                                                                      ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300'
                                                                      : 'bg-blue-100 text-blue-800 dark:bg-sky-900 dark:text-sky-300'
                                                            }`}
                                                        >
                                                            {h.estado?.nombre ||
                                                                'Sin estado'}
                                                        </span>
                                                    </TableCell>
                                                 <TableCell>
    {(() => {
        const coliformes = h.coliformes;
        const usuarioCorreccion = h.usuario_correccion;

        // Si no hay coliformes o es menor o igual a 100, mostrar vacío
        if (!coliformes || coliformes <= 100) {
            return <span className="text-sm text-muted-foreground">-</span>;
        }

        // Si coliformes > 100 y hay usuario de corrección, mostrarlo
        if (usuarioCorreccion) {
            return (
                <TooltipProvider>
                    <Tooltip>
                        <TooltipTrigger asChild>
                            <div>
                                <div className="font-medium text-foreground text-sm">
                                    {usuarioCorreccion.name || ''} {usuarioCorreccion.apellido || ''}
                                </div>
                                <div className="text-xs font-medium text-muted-foreground">
                                    {usuarioCorreccion.codigo || ''}
                                </div>
                            </div>
                        </TooltipTrigger>
                        <TooltipContent>
                            <p>
                                {usuarioCorreccion.name || '-'} {usuarioCorreccion.apellido || '-'}
                            </p>
                            {usuarioCorreccion.codigo && (
                                <p className="text-xs text-muted-foreground">
                                    Código: {usuarioCorreccion.codigo}
                                </p>
                            )}
                        </TooltipContent>
                    </Tooltip>
                </TooltipProvider>
            );
        }

        // Si coliformes > 100 y NO hay usuario de corrección, mostrar "Pendiente"
        return <span className="text-sm text-yellow-600 font-medium">Pendiente</span>;
    })()}
</TableCell>
                                                    <TableCell className="max-w-xs">
                                                        {h.observacion_siembra && (
                                                            <div className="text-xs text-muted-foreground">
                                                                <strong>
                                                                    Siembra:
                                                                </strong>{' '}
                                                                {
                                                                    h.observacion_siembra
                                                                }
                                                            </div>
                                                        )}
                                                        {h.observacion_lectura && (
                                                            <div className="text-xs text-muted-foreground">
                                                                <strong>
                                                                    Lectura:
                                                                </strong>{' '}
                                                                {
                                                                    h.observacion_lectura
                                                                }
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
                                                                                'hisopados.show',
                                                                                h.id,
                                                                            ),
                                                                        )
                                                                    }
                                                                >
                                                                    <Eye className="mr-2 h-4 w-4" />
                                                                    Ver detalle
                                                                </DropdownMenuItem>
                                                            </DropdownMenuContent>
                                                        </DropdownMenu>
                                                    </TableCell>
                                                </TableRow>
                            );
                                            })
                                        )}
                                    </TableBody>
                                </Table>
                            </div>

                            {hisopados.data.length > 0 && (
                                <div className="border-t px-4 py-3">
                                    <TablePagination
                                        pagination={hisopados}
                                        onPageChange={(page) =>
                                            router.get(
                                                route('hisopados.index'),
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

                        <p className="mt-2 text-sm text-muted-foreground">
                            {hisopados.total} hisopados registrados
                        </p>
                        {/* Controles de PDF */}
                        <div className="mt-4 rounded-lg border border-border bg-muted/50 p-4">
                            <h3 className="mb-3 font-semibold text-foreground">
                                Generar Reporte PDF de Hisopados
                            </h3>
                            <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
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
                    </div>

                    {/* Panel derecho - Creación rápida */}
                    <div className="lg:col-span-1">
                        {/* Sección para usuarios "Por Capacitar" */}
                        {usuariosPorCapacitar &&
                            usuariosPorCapacitar.length > 0 && (
                                <div className="mb-4">
                                    <div className="sticky top-4 rounded-lg border border-amber-200 bg-amber-50 p-4 shadow-sm dark:border-amber-700 dark:bg-neutral-950 dark:text-amber-200">
                                        <div className="mb-2 flex items-center justify-between">
                                            <div>
                                                <h3 className="text-lg font-semibold">
                                                    Seguimiento de Coliformes
                                                    Altos
                                                </h3>
                                                {/* <p className="text-sm text-amber-600">
                                                    {
                                                        usuariosPorCapacitar.length
                                                    }{' '}
                                                    usuario(s) con seguimiento
                                                </p> */}
                                            </div>
                                        </div>

                                        <div className="space-y-3">
                                            {usuariosPorCapacitar.map(
                                                (usuario) => {
                                                    const estaCapacitando =
                                                        capacitandoIds.includes(
                                                            usuario.id,
                                                        );
                                                    const estaCreandoHisopado =
                                                        creandoCapacitadoIds.includes(
                                                            usuario.id,
                                                        );
                                                    const esCapacitado =
                                                        usuario.estado_hisopado
                                                            ?.nombre ===
                                                        'Capacitado';
                                                    const esPorCapacitar =
                                                        usuario.estado_hisopado
                                                            ?.nombre ===
                                                        'Por Capacitar';

                                                    return (
                                                        <div
                                                            key={usuario.id}
                                                            className={`flex items-center justify-between rounded-lg border p-3 transition-colors ${
                                                                esCapacitado
                                                                    ? 'border-green-200 bg-green-50 dark:border-green-800 dark:bg-neutral-950 dark:text-green-200'
                                                                    : esPorCapacitar
                                                                      ? 'border-amber-200 bg-amber-50 hover:bg-amber-100 dark:border-amber-700 dark:bg-neutral-950 dark:text-amber-200 dark:hover:bg-amber-800'
                                                                      : 'border-blue-200 bg-blue-50 dark:border-sky-700 dark:bg-sky-900 dark:text-sky-200'
                                                            }`}
                                                        >
                                                            <div className="flex items-center gap-3">
                                                                <div className="min-w-0 flex-1">
                                                                    <div className="truncate text-xs font-medium">
                                                                        {
                                                                            usuario.name
                                                                        }{' '}
                                                                        {
                                                                            usuario.apellido
                                                                        }
                                                                    </div>
                                                                    {usuario.codigo && (
                                                                        <div className="font-mono text-xs text-muted-foreground">
                                                                            {
                                                                                usuario.codigo
                                                                            }
                                                                        </div>
                                                                    )}
                                                                    {/* <div
                                                                        className={`mt-1 inline-block rounded-full px-2 py-0.5 text-xs ${
                                                                            esCapacitado
                                                                                ? 'bg-green-100 text-green-800'
                                                                                : esPorCapacitar
                                                                                  ? 'bg-amber-100 text-amber-800'
                                                                                  : 'bg-blue-100 text-blue-800'
                                                                        }`}
                                                                    >
                                                                        {usuario
                                                                            .estado_hisopado
                                                                            ?.nombre ||
                                                                            'Sin estado'}
                                                                    </div> */}
                                                                </div>
                                                            </div>

                                                            <div className="flex shrink-0 gap-2">
                                                                {!esCapacitado ? (
                                                                    // Botón para marcar como capacitado (solo si está "Por Capacitar")
                                                                    esPorCapacitar ? (
                                                                        hasPermission(
                                                                            'capacitar_hisopado',
                                                                        ) && (
                                                                            <Button
                                                                                size="sm"
                                                                                variant="outline"
                                                                                className="border-amber-300 text-amber-500 hover:bg-amber-100"
                                                                                onClick={() =>
                                                                                    marcarComoCapacitado(
                                                                                        usuario.id,
                                                                                        usuario.correccion_id!,
                                                                                    )
                                                                                }
                                                                                disabled={
                                                                                    estaCapacitando ||
                                                                                    !usuario.correccion_id
                                                                                }
                                                                            >
                                                                                {estaCapacitando ? (
                                                                                    <>
                                                                                        <span className="mr-1 animate-spin">
                                                                                            ⟳
                                                                                        </span>
                                                                                        ...
                                                                                    </>
                                                                                ) : (
                                                                                    'Capacitar'
                                                                                )}
                                                                            </Button>
                                                                        )
                                                                    ) : (
                                                                        <div className="px-2 py-1 text-xs text-gray-500">
                                                                            Esperando
                                                                            acción
                                                                        </div>
                                                                    )
                                                                ) : (
                                                                    // Botón para crear nuevo hisopado (solo cuando está capacitado)
                                                                    hasPermission(
                                                                        'c_hisopado',
                                                                    ) && (
                                                                        <Button
                                                                            size="sm"
                                                                            variant="default"
                                                                            className="bg-green-600 hover:bg-green-700"
                                                                            onClick={() =>
                                                                                crearHisopadoCapacitado(
                                                                                    usuario.id,
                                                                                )
                                                                            }
                                                                            disabled={
                                                                                estaCreandoHisopado
                                                                            }
                                                                        >
                                                                            {estaCreandoHisopado ? (
                                                                                <>
                                                                                    <span className="mr-1 animate-spin">
                                                                                        ⟳
                                                                                    </span>
                                                                                    ...
                                                                                </>
                                                                            ) : (
                                                                                '+'
                                                                            )}
                                                                        </Button>
                                                                    )
                                                                )}
                                                            </div>
                                                        </div>
                                                    );
                                                },
                                            )}
                                        </div>
                                    </div>
                                </div>
                            )}
                        <div className="sticky top-4 rounded-lg border bg-card p-4 shadow-sm">
                            <div className="mb-4 flex items-center justify-between">
                                <div>
                                    <h3 className="text-lg font-semibold">
                                        Registrar Hisopado
                                    </h3>
                                    {/* <p className="text-sm text-muted-foreground">

                                        {usuariosFiltrados.length} Usuarios
                                    </p> */}
                                </div>
                                {hasPermission('reiniciar_hisopado') && (
                                    <Button
                                        variant="destructive"
                                        size="sm"
                                        className=""
                                        onClick={() =>
                                            setShowResetConfirm(true)
                                        }
                                        disabled={resetLoading}
                                    >
                                        {resetLoading
                                            ? 'Procesando...'
                                            : 'Reiniciar'}
                                    </Button>
                                )}
                            </div>

                            {/* Botón para resetear estado de hisopado */}
                            <div className="mb-3"></div>

                            {/* Buscador de usuarios */}
                            <div className="mb-4">
                                <div className="relative">
                                    <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                                    <Input
                                        placeholder="Buscar por nombre, apellido o código..."
                                        value={busquedaUsuarios}
                                        onChange={(e) =>
                                            setBusquedaUsuarios(e.target.value)
                                        }
                                        className="pl-10"
                                    />
                                    {busquedaUsuarios && (
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            className="absolute top-1/2 right-1 h-7 w-7 -translate-y-1/2 p-0"
                                            onClick={() =>
                                                setBusquedaUsuarios('')
                                            }
                                        >
                                            <X className="h-4 w-4" />
                                        </Button>
                                    )}
                                </div>
                            </div>

                            <div className="space-y-3">
                                <div className="max-h-[465px] space-y-2 overflow-y-auto pr-2">
                                    {usuariosFiltrados.length === 0 ? (
                                        <div className="py-8 text-center">
                                            <Users className="mx-auto mb-2 h-6 w-8 text-muted-foreground/50" />
                                            <p className="text-sm text-muted-foreground">
                                                {busquedaUsuarios
                                                    ? `No se encontraron usuarios con "${busquedaUsuarios}"`
                                                    : 'No hay usuarios disponibles'}
                                            </p>
                                            {busquedaUsuarios && (
                                                <Button
                                                    variant="link"
                                                    size="sm"
                                                    onClick={() =>
                                                        setBusquedaUsuarios('')
                                                    }
                                                    className="mt-2"
                                                >
                                                    Limpiar búsqueda
                                                </Button>
                                            )}
                                        </div>
                                    ) : (
                                        usuariosFiltrados.map((usuario) => {
                                            const yaRegistradoHoy =
                                                usuariosConHisopadoHoy.includes(
                                                    usuario.id,
                                                );
                                            const estaCreando =
                                                creandoIds.includes(usuario.id);

                                            return (
                                                <div
                                                    key={usuario.id}
                                                    className={`flex items-center justify-between rounded-lg border p-2 py-1 transition-colors ${yaRegistradoHoy ? 'border-green-200 bg-green-50' : 'hover:bg-accent'}`}
                                                >
                                                    <div className="flex items-center gap-3">
                                                        <div className="min-w-0 flex-1">
                                                            <div className="truncate text-xs font-medium">
                                                                {usuario.name}{' '}
                                                                {
                                                                    usuario.apellido
                                                                }
                                                            </div>
                                                            {usuario.codigo && (
                                                                <div className="font-mono text-xs text-muted-foreground">
                                                                    {
                                                                        usuario.codigo
                                                                    }
                                                                </div>
                                                            )}
                                                            {yaRegistradoHoy && (
                                                                <div className="text-xs text-green-600">
                                                                    Registrado
                                                                    hoy
                                                                </div>
                                                            )}
                                                        </div>
                                                    </div>

                                                    {hasPermission(
                                                        'u_hisopado',
                                                    ) &&
                                                        usuario.estado_hisopado
                                                            ?.nombre ===
                                                            'No Hisopado' && (
                                                            <Button
                                                                size="sm"
                                                                variant="default"
                                                                onClick={() =>
                                                                    crearHisopado(
                                                                        usuario.id,
                                                                    )
                                                                }
                                                                disabled={
                                                                    estaCreando
                                                                }
                                                                className="shrink-0"
                                                            >
                                                                {estaCreando
                                                                    ? '...'
                                                                    : '+'}
                                                            </Button>
                                                        )}
                                                </div>
                                            );
                                        })
                                    )}
                                </div>

                                {busquedaUsuarios && (
                                    <div className="text-center">
                                        <p className="text-sm text-muted-foreground">
                                            Mostrando {usuariosFiltrados.length}{' '}
                                            de {usuarios.length} usuarios
                                        </p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Dialog para registrar lectura */}
            <Dialog open={openLectura} onOpenChange={setOpenLectura}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Registrar Lectura de Hisopado</DialogTitle>
                    </DialogHeader>

                    <div className="space-y-3">
                        <div className="rounded-md border border-border/60 bg-muted/30 p-3">
                            <p className="text-sm font-semibold text-foreground">
                                {hisopadoActual?.user?.name || '-'}{' '}
                                {hisopadoActual?.user?.apellido || ''}
                                <span className="text-xs text-muted-foreground px-4">
                                    {hisopadoActual?.user?.codigo
                                    ? `Código: ${hisopadoActual.user.codigo}`
                                    : 'Sin código'}
                                </span>
                            </p>

                        </div>

                        <Input
                            type="number"
                            placeholder="Cantidad de coliformes"
                            value={coliformes}
                            onChange={(e) => setColiformes(e.target.value)}
                            min="0"
                        />

                        <Textarea
                            placeholder="Observación de lectura"
                            value={observacionLectura}
                            onChange={(e) =>
                                setObservacionLectura(e.target.value)
                            }
                        />
                    </div>

                    <DialogFooter>
                        <Button
                            variant="outline"
                            onClick={() => setOpenLectura(false)}
                        >
                            Cancelar
                        </Button>
                        <Button onClick={guardarLectura}>Guardar</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            <Dialog open={openSiembra} onOpenChange={setOpenSiembra}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>
                            Registrar Observación de Siembra
                        </DialogTitle>
                    </DialogHeader>

                    <div className="space-y-3">
                        <Textarea
                            placeholder="Observación de siembra"
                            value={observacionSiembra}
                            onChange={(e) =>
                                setObservacionSiembra(e.target.value)
                            }
                        />
                    </div>

                    <DialogFooter>
                        <Button
                            variant="outline"
                            onClick={() => setOpenSiembra(false)}
                        >
                            Cancelar
                        </Button>
                        <Button onClick={guardarSiembra}>Guardar</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Dialog de confirmación para resetear estado - AÑADIDO */}
            <Dialog open={showResetConfirm} onOpenChange={setShowResetConfirm}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle className="text-destructive">
                            ⚠️ Confirmar Reset de Estado
                        </DialogTitle>
                        <DialogDescription className="space-y-2">
                            <p className="font-semibold">
                                Esta acción es irreversible y afectará a todos
                                los usuarios.
                            </p>
                            <p>
                                Se cambiará el{' '}
                                <strong>estado_hisopado_id</strong> de TODOS los
                                usuarios a "No Hisopado".
                            </p>
                            <p className="mt-2 text-sm text-muted-foreground">
                                ¿Estás seguro de continuar?
                            </p>
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                        <Button
                            variant="outline"
                            onClick={() => setShowResetConfirm(false)}
                            disabled={resetLoading}
                        >
                            Cancelar
                        </Button>
                        <Button
                            variant="destructive"
                            onClick={resetearEstadoHisopado}
                            disabled={resetLoading}
                        >
                            {resetLoading ? (
                                <>
                                    <span className="mr-2 animate-spin">⟳</span>
                                    Procesando...
                                </>
                            ) : (
                                'Confirmar Reset'
                            )}
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
                                    Reporte de Hisopados
                                </h3>
                                <p className="text-sm text-gray-600">
                                    {fechaDesde} al {fechaHasta} -{' '}
                                    {datosPdf.length} registros
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
                                <ReporteHisopados
                                    datos={datosPdf}
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
