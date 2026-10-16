import { Button } from '@/components/ui/button';
import FilterSelect from '@/components/ui/filter-select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Printer } from 'lucide-react';
import { pdf } from '@react-pdf/renderer';
import ReporteRefractometros from '@/pdf/ReporteRefractometros';
import ReportePhmetros from '@/pdf/ReportePhmetros';
import ReporteTemperaturas from '@/pdf/ReporteTemperaturas';
import ReporteCrioscopos from '@/pdf/ReporteCrioscopos';
import ReporteTermohigrometros from '@/pdf/ReporteTermohigrometros';
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
import { Head, Link, router, usePage } from '@inertiajs/react';
import {
    Plus,
    Filter,
    X,
    MoreHorizontal,
    Edit,
    Trash2,
    Eye,
    Thermometer,
    Droplets,
    Gauge,
    Snowflake,
    Check,
    X as XIcon,
    ThermometerSnowflake,
} from 'lucide-react';
import { route } from 'ziggy-js';
import { useState, useEffect } from 'react';
import TablePagination from '@/components/ui/table-pagination';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Verificaciones de Dispositivos', href: '/planta-lacteos/verificaciones-dispositivos' },
];

interface PageProps {
    dispositivosRefractometros: { data: any[]; links: any[]; current_page: number; last_page: number; per_page: number; total: number };
    dispositivosPhmetros: { data: any[]; links: any[]; current_page: number; last_page: number; per_page: number; total: number };
    dispositivosTemperaturas: { data: any[]; links: any[]; current_page: number; last_page: number; per_page: number; total: number };
    dispositivosCrioscopos: { data: any[]; links: any[]; current_page: number; last_page: number; per_page: number; total: number };
    dispositivosTermohigrometros: { data: any[]; links: any[]; current_page: number; last_page: number; per_page: number; total: number };
    totales: { refractometros: number; phmetros: number; temperaturas: number; crioscopos: number; termohigrometros: number };
    filters: {
        tipo?: string;
        fecha_inicio?: string;
        fecha_fin?: string;
        dispositivos_medicion_id?: number;
        estado_id?: number;
        user_id?: number;
        requiere_ajuste?: boolean;
        error_mayor_a?: number;
        punto_ajuste_a?: boolean;
        punto_ajuste_b?: boolean;
        per_page?: number;
    };
    dispositivos: { id: number; codigo: string; dispositivo: string }[];
    estados: { id: number; nombre: string }[];
    usuarios: { id: number; name: string }[];
    current_tipo: string;
    flash: { success?: string; error?: string };
}

export default function VerificacionesDispositivosIndex() {
    const { props } = usePage();
    const [showFilters, setShowFilters] = useState(false);
    const [activeTab, setActiveTab] = useState(props.current_tipo || 'refractometros');
    const { hasPermission } = useAuth();

    // Estados para PDF de reportes
    const [fechaDesde, setFechaDesde] = useState<string>('');
    const [fechaHasta, setFechaHasta] = useState<string>('');
    const [mostrarReportePdf, setMostrarReportePdf] = useState(false);
    const [generandoPdf, setGenerandoPdf] = useState(false);
    const [reportePdfUrl, setReportePdfUrl] = useState<string>('');

    // Estados para PDFs de guía y años
    const [mostrarGuiaPdf, setMostrarGuiaPdf] = useState(false);
    const [guiaPdfUrl, setGuiaPdfUrl] = useState<string>('');
    const [tituloGuiaPdf, setTituloGuiaPdf] = useState<string>('Guía de Verificaciones');

    const generarPdfBlob = async (componente: React.ReactElement) => {
        const blob = await pdf(componente).toBlob();
        return URL.createObjectURL(blob);
    };

    const handleMostrarPdf = async () => {
        if (!fechaDesde || !fechaHasta) {
            alert('Por favor selecciona ambas fechas');
            return;
        }
        setGenerandoPdf(true);
        const params = new URLSearchParams();
        params.append('fecha_desde', fechaDesde);
        params.append('fecha_hasta', fechaHasta);

        let url = '';
        switch (activeTab) {
            case 'phmetros': url = route('dispositivos-phmetros.pdf'); break;
            case 'crioscopos': url = route('dispositivos-crioscopos.pdf'); break;
            case 'refractometros': url = route('dispositivos-refractometros.pdf'); break;
            case 'temperaturas': url = route('dispositivos-temperaturas.pdf'); break;
            case 'termohigrometros': url = route('dispositivos-termohigrometros.pdf'); break;
            default: url = route('dispositivos-refractometros.pdf');
        }

        try {
            const response = await fetch(`${url}?${params.toString()}`);
            if (!response.ok) {
                let errorMsg = `Error ${response.status}: ${response.statusText}`;
                try {
                    const errorData = await response.json();
                    errorMsg = errorData.error || errorMsg;
                } catch (e) {
                    const text = await response.text();
                    errorMsg = text.substring(0, 500);
                }
                alert(errorMsg);
                return;
            }
            const data = await response.json();
            if (!data.registros || data.registros.length === 0) {
                alert('No hay registros para el rango de fechas seleccionado');
                return;
            }

            const componente = (() => {
                switch (activeTab) {
                    case 'phmetros': return <ReportePhmetros datos={data.registros} usuariosInvolucrados={data.usuarios_involucrados || []} />;
                    case 'crioscopos': return <ReporteCrioscopos datos={data.registros} usuariosInvolucrados={data.usuarios_involucrados || []} />;
                    case 'refractometros': return <ReporteRefractometros datos={data.registros} usuariosInvolucrados={data.usuarios_involucrados || []} />;
                    case 'temperaturas': return <ReporteTemperaturas datos={data.registros} usuariosInvolucrados={data.usuarios_involucrados || []} />;
                    case 'termohigrometros': return <ReporteTermohigrometros datos={data.registros} usuariosInvolucrados={data.usuarios_involucrados || []} />;
                    default: return null;
                }
            })();

            if (!componente) return;

            const blobUrl = await generarPdfBlob(componente);
            setReportePdfUrl(blobUrl);
            setMostrarReportePdf(true);
        } catch (error: any) {
            console.error('Error al generar PDF:', error);
            alert(`Error al generar el reporte: ${error.message || 'Error desconocido'}`);
        } finally {
            setGenerandoPdf(false);
        }
    };

    const abrirGuiaPdf = async () => {
        try {
            const response = await fetch(route('dispositivos-medicion.cronograma'), {
                headers: { 'Accept': 'application/pdf' },
            });
            if (!response.ok) throw new Error('No se pudo cargar el PDF');
            const blob = await response.blob();
            const url = URL.createObjectURL(blob);
            setGuiaPdfUrl(url);
            setTituloGuiaPdf('Guía de Verificaciones');
            setMostrarGuiaPdf(true);
        } catch (error) {
            console.error('Error al cargar el PDF:', error);
            alert('Error al cargar el PDF de guía');
        }
    };

    const abrirPdf = async (year: string) => {
        try {
            const routeName = year === '2025' ? 'dispositivos-medicion.pdf2025' : 'dispositivos-medicion.pdf2026';
            const response = await fetch(route(routeName), {
                headers: { 'Accept': 'application/pdf' },
            });
            if (!response.ok) throw new Error('No se pudo cargar el PDF');
            const blob = await response.blob();
            const url = URL.createObjectURL(blob);
            setGuiaPdfUrl(url);
            setTituloGuiaPdf(`Dispositivos ${year}`);
            setMostrarGuiaPdf(true);
        } catch (error) {
            console.error('Error al cargar el PDF:', error);
            alert(`Error al cargar el PDF de ${year}`);
        }
    };

    // Destructuración de props
    const {
        dispositivosRefractometros = { data: [], links: [], current_page: 1, last_page: 1, per_page: 10, total: 0 },
        dispositivosPhmetros = { data: [], links: [], current_page: 1, last_page: 1, per_page: 10, total: 0 },
        dispositivosTemperaturas = { data: [], links: [], current_page: 1, last_page: 1, per_page: 10, total: 0 },
        dispositivosCrioscopos = { data: [], links: [], current_page: 1, last_page: 1, per_page: 10, total: 0 },
        dispositivosTermohigrometros = { data: [], links: [], current_page: 1, last_page: 1, per_page: 10, total: 0 },
        totales = { refractometros: 0, phmetros: 0, temperaturas: 0, crioscopos: 0, termohigrometros: 0 },
        filters: initialFilters = {},
        dispositivos = [],
        estados = [],
        usuarios = [],
        current_tipo,
        flash,
    } = props as unknown as PageProps;

    const { filters, updateFilter, resetFilters } = useAdvancedFilters({
        routeName: 'verificaciones-dispositivos.index',
        initialFilters: {
            tipo: current_tipo,
            fecha_inicio: initialFilters.fecha_inicio || '',
            fecha_fin: initialFilters.fecha_fin || '',
            dispositivos_medicion_id: initialFilters.dispositivos_medicion_id?.toString() || '',
            estado_id: initialFilters.estado_id?.toString() || '',
            user_id: initialFilters.user_id?.toString() || '',
            requiere_ajuste: initialFilters.requiere_ajuste?.toString() || '',
            error_mayor_a: initialFilters.error_mayor_a?.toString() || '',
            punto_ajuste_a: initialFilters.punto_ajuste_a?.toString() || '',
            punto_ajuste_b: initialFilters.punto_ajuste_b?.toString() || '',
            per_page: initialFilters.per_page?.toString() || '10',
        },
        debounceFields: [],
    });

    const getCurrentData = () => {
        switch (activeTab) {
            case 'phmetros': return dispositivosPhmetros;
            case 'crioscopos': return dispositivosCrioscopos;
            case 'refractometros': return dispositivosRefractometros;
            case 'temperaturas': return dispositivosTemperaturas;
            case 'termohigrometros': return dispositivosTermohigrometros;
            default: return dispositivosRefractometros;
        }
    };

    const currentData = getCurrentData();
    const hasActiveFilters = Object.values(filters).some(v => v && v !== '' && v !== '10');

    useEffect(() => {
        updateFilter('tipo', activeTab);
    }, [activeTab]);

    // Handlers
    const handleView = (id: number) => {
        const routeMap = {
            refractometros: 'dispositivos-refractometros.show',
            phmetros: 'dispositivos-phmetros.show',
            temperaturas: 'dispositivos-temperaturas.show',
            crioscopos: 'dispositivos-crioscopos.show',
            termohigrometros: 'dispositivos-termohigrometros.show',
        };
        router.visit(route(routeMap[activeTab], id));
    };

    const handleEdit = (id: number) => {
        const routeMap = {
            refractometros: 'dispositivos-refractometros.edit',
            phmetros: 'dispositivos-phmetros.edit',
            temperaturas: 'dispositivos-temperaturas.edit',
            crioscopos: 'dispositivos-crioscopos.edit',
            termohigrometros: 'dispositivos-termohigrometros.edit',
        };
        router.visit(route(routeMap[activeTab], id));
    };

    const handleDelete = (id: number) => {
        const routeMap = {
            refractometros: 'dispositivos-refractometros.destroy',
            phmetros: 'dispositivos-phmetros.destroy',
            temperaturas: 'dispositivos-temperaturas.destroy',
            crioscopos: 'dispositivos-crioscopos.destroy',
            termohigrometros: 'dispositivos-termohigrometros.destroy',
        };
        if (confirm('¿Está seguro de eliminar este registro?')) {
            router.delete(route(routeMap[activeTab], id), { preserveScroll: true });
        }
    };

    const formatFechaHora = (fecha: string) => {
        if (!fecha) return '-';
        const date = new Date(fecha);
        return date.toLocaleDateString('es-ES') + ' ' + date.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' });
    };

    const formatBoolean = (value: boolean | null) => {
        if (value === true) return <Check className="h-4 w-4 text-green-600" />;
        if (value === false) return <XIcon className="h-4 w-4 text-red-600" />;
        return '-';
    };

    const getNombreUsuario = (item: any) => {
        const usuario = item.usuario;
        if (!usuario) return '-';
        if (usuario.apellido) {
            return `${usuario.name} ${usuario.apellido}`;
        }
        const iniciales = usuario.name.split(' ').map((p: string) => p[0]).join('.').toUpperCase();
        return iniciales || usuario.name;
    };

    const getEstadoMostrado = (item: any) => {
        const estado = item.estado;
        if (!estado) return '-';
        const nombre = estado.nombre;
        if (nombre === 'Verificado') return 'Conforme';
        return nombre;
    };

    const getEstadoColor = (estadoNombre: string) => {
        switch (estadoNombre) {
            case 'Conforme':
            case 'Aprobado':
            case 'Completado':
                return 'bg-green-100 text-green-800 dark:bg-green-800/30 dark:text-green-400';
            case 'No Conforme':
            case 'Rechazado':
            case 'Fallido':
                return 'bg-red-100 text-red-800 dark:bg-red-800/30 dark:text-red-400';
            case 'Pendiente':
                return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-800/30 dark:text-yellow-400';
            default:
                return 'bg-gray-100 text-gray-800 dark:bg-gray-800/30 dark:text-gray-400';
        }
    };

    const getDispositivoNombreFromRegistro = (item: any) => {
        if (item.dispositivo_medicion) {
            return `${item.dispositivo_medicion.codigo || ''} - ${item.dispositivo_medicion.dispositivo || ''}`;
        }
        const dispositivo = dispositivos.find(d => d.id === item.dispositivos_medicion_id);
        return dispositivo ? `${dispositivo.codigo} - ${dispositivo.dispositivo}` : '-';
    };

    // ==================== TABLAS ====================
    // (Se mantienen exactamente igual que en tu código original)
    const renderRefractometrosTable = () => (
        <Table>
            <TableHeader>
                <TableRow>
                    <TableHead>Fecha/Hora</TableHead>
                    <TableHead>Dispositivo</TableHead>
                    <TableHead>Temp. Verif.</TableHead>
                    <TableHead>Conc. 0%</TableHead>
                    <TableHead>Conc. 25%</TableHead>
                    <TableHead>Requiere Ajuste</TableHead>
                    <TableHead>Temp. Ajuste</TableHead>
                    <TableHead>Conc. 0% Ajuste</TableHead>
                    <TableHead>Conc. 25% Ajuste</TableHead>
                    <TableHead>Usuario</TableHead>
                    <TableHead>Estado</TableHead>
                    <TableHead>Observaciones</TableHead>
                    <TableHead>Acciones</TableHead>
                </TableRow>
            </TableHeader>
            <TableBody>
                {currentData.data.length === 0 ? (
                    <TableRow>
                        <TableCell colSpan={13} className="text-center py-8">
                            <div className="flex flex-col items-center justify-center">
                                <Droplets className="h-12 w-12 text-muted-foreground/50 mb-3" />
                                <p className="text-lg font-medium">No hay registros de refractómetros</p>
                            </div>
                        </TableCell>
                    </TableRow>
                ) : (
                    currentData.data.map((item) => {
                        const estadoMostrado = getEstadoMostrado(item);
                        const colorEstado = getEstadoColor(estadoMostrado);
                        return (
                            <TableRow key={item.id}>
                                <TableCell className="text-xs">{formatFechaHora(item.fecha_hora)}</TableCell>
                                <TableCell className="text-xs">{getDispositivoNombreFromRegistro(item)}</TableCell>
                                <TableCell className="text-xs">{item.verificacion_temperatura || '-'}</TableCell>
                                <TableCell className="text-xs">{item.verificacion_concentracion_0 || '-'}</TableCell>
                                <TableCell className="text-xs">{item.verificacion_concentracion_25 || '-'}</TableCell>
                                <TableCell>{formatBoolean(item.requiere_ajuste)}</TableCell>
                                <TableCell className="text-xs">{item.verificacion_ajuste_temperatura || '-'}</TableCell>
                                <TableCell className="text-xs">{item.verificacion_ajuste_concentracion_0 || '-'}</TableCell>
                                <TableCell className="text-xs">{item.verificacion_ajuste_concentracion_25 || '-'}</TableCell>
                                <TableCell className="text-xs">{getNombreUsuario(item)}</TableCell>
                                <TableCell>
                                    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs ${colorEstado}`}>
                                        {estadoMostrado}
                                    </span>
                                </TableCell>
                                <TableCell className="text-xs max-w-[150px] truncate" title={item.observaciones}>
                                    {item.observaciones || '-'}
                                </TableCell>
                                <TableCell>
                                    <DropdownMenu>
                                        <DropdownMenuTrigger asChild>
                                            <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                                                <MoreHorizontal className="h-4 w-4" />
                                            </Button>
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent align="end">
                                            <DropdownMenuItem onClick={() => handleView(item.id)}><Eye className="mr-2 h-4 w-4" /> Ver</DropdownMenuItem>
                                            {hasPermission('u_verificacionesDispositivos') && (
                                                <DropdownMenuItem onClick={() => handleEdit(item.id)}><Edit className="mr-2 h-4 w-4" /> Editar</DropdownMenuItem>
                                            )}
                                            {hasPermission('d_dispositivos') && (
                                                <DropdownMenuItem onClick={() => handleDelete(item.id)} className="text-destructive"><Trash2 className="mr-2 h-4 w-4" /> Eliminar</DropdownMenuItem>
                                            )}
                                        </DropdownMenuContent>
                                    </DropdownMenu>
                                </TableCell>
                            </TableRow>
                        );
                    })
                )}
            </TableBody>
        </Table>
    );

    const renderPhmetrosTable = () => (
        <Table>
            <TableHeader>
                <TableRow>
                    <TableHead>Fecha/Hora</TableHead>
                    <TableHead>Dispositivo</TableHead>
                    <TableHead>Temp. 1</TableHead>
                    <TableHead>Temp. 2</TableHead>
                    <TableHead>Temp. 3</TableHead>
                    <TableHead>pH 4</TableHead>
                    <TableHead>pH 7</TableHead>
                    <TableHead>pH 10</TableHead>
                    <TableHead>Requiere Ajuste</TableHead>
                    <TableHead>Temp. Ajuste 1</TableHead>
                    <TableHead>Temp. Ajuste 2</TableHead>
                    <TableHead>Temp. Ajuste 3</TableHead>
                    <TableHead>pH 4 Ajuste</TableHead>
                    <TableHead>pH 7 Ajuste</TableHead>
                    <TableHead>pH 10 Ajuste</TableHead>
                    <TableHead>Usuario</TableHead>
                    <TableHead>Estado</TableHead>
                    <TableHead>Observaciones</TableHead>
                    <TableHead>Acciones</TableHead>
                </TableRow>
            </TableHeader>
            <TableBody>
                {currentData.data.length === 0 ? (
                    <TableRow>
                        <TableCell colSpan={19} className="text-center py-8">
                            <div className="flex flex-col items-center justify-center">
                                <Gauge className="h-12 w-12 text-muted-foreground/50 mb-3" />
                                <p className="text-lg font-medium">No hay registros de pHmetros</p>
                            </div>
                        </TableCell>
                    </TableRow>
                ) : (
                    currentData.data.map((item) => {
                        const estadoMostrado = getEstadoMostrado(item);
                        const colorEstado = getEstadoColor(estadoMostrado);
                        return (
                            <TableRow key={item.id}>
                                <TableCell className="text-xs">{formatFechaHora(item.fecha_hora)}</TableCell>
                                <TableCell className="text-xs">{getDispositivoNombreFromRegistro(item)}</TableCell>
                                <TableCell className="text-xs">{item.verificacion_temperatura1 || '-'}</TableCell>
                                <TableCell className="text-xs">{item.verificacion_temperatura2 || '-'}</TableCell>
                                <TableCell className="text-xs">{item.verificacion_temperatura3 || '-'}</TableCell>
                                <TableCell className="text-xs">{item.verificacion_4 || '-'}</TableCell>
                                <TableCell className="text-xs">{item.verificacion_7 || '-'}</TableCell>
                                <TableCell className="text-xs">{item.verificacion_10 || '-'}</TableCell>
                                <TableCell>{formatBoolean(item.requiere_ajuste)}</TableCell>
                                <TableCell className="text-xs">{item.verificacion_ajuste_temperatura1 || '-'}</TableCell>
                                <TableCell className="text-xs">{item.verificacion_ajuste_temperatura2 || '-'}</TableCell>
                                <TableCell className="text-xs">{item.verificacion_ajuste_temperatura3 || '-'}</TableCell>
                                <TableCell className="text-xs">{item.verificacion_ajuste_4 || '-'}</TableCell>
                                <TableCell className="text-xs">{item.verificacion_ajuste_7 || '-'}</TableCell>
                                <TableCell className="text-xs">{item.verificacion_ajuste_10 || '-'}</TableCell>
                                <TableCell className="text-xs">{getNombreUsuario(item)}</TableCell>
                                <TableCell>
                                    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs ${colorEstado}`}>
                                        {estadoMostrado}
                                    </span>
                                </TableCell>
                                <TableCell className="text-xs max-w-[150px] truncate" title={item.observaciones}>
                                    {item.observaciones || '-'}
                                </TableCell>
                                <TableCell>
                                    <DropdownMenu>
                                        <DropdownMenuTrigger asChild>
                                            <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                                                <MoreHorizontal className="h-4 w-4" />
                                            </Button>
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent align="end">
                                            <DropdownMenuItem onClick={() => handleView(item.id)}><Eye className="mr-2 h-4 w-4" /> Ver</DropdownMenuItem>
                                            {hasPermission('u_verificacionesDispositivos') && (
                                                <DropdownMenuItem onClick={() => handleEdit(item.id)}><Edit className="mr-2 h-4 w-4" /> Editar</DropdownMenuItem>
                                            )}
                                            {hasPermission('d_dispositivos') && (
                                                <DropdownMenuItem onClick={() => handleDelete(item.id)} className="text-destructive"><Trash2 className="mr-2 h-4 w-4" /> Eliminar</DropdownMenuItem>
                                            )}
                                        </DropdownMenuContent>
                                    </DropdownMenu>
                                </TableCell>
                            </TableRow>
                        );
                    })
                )}
            </TableBody>
        </Table>
    );

    const renderTemperaturasTable = () => (
        <Table>
            <TableHeader>
                <TableRow>
                    <TableHead>Fecha/Hora</TableHead>
                    <TableHead>Dispositivo</TableHead>
                    <TableHead>Patrón 1</TableHead>
                    <TableHead>Instr. 1</TableHead>
                    <TableHead>Error 1</TableHead>
                    <TableHead>Patrón 2</TableHead>
                    <TableHead>Instr. 2</TableHead>
                    <TableHead>Error 2</TableHead>
                    <TableHead>Patrón 3</TableHead>
                    <TableHead>Instr. 3</TableHead>
                    <TableHead>Error 3</TableHead>
                    <TableHead>Usuario</TableHead>
                    <TableHead>Estado</TableHead>
                    <TableHead>Observaciones</TableHead>
                    <TableHead>Acciones</TableHead>
                </TableRow>
            </TableHeader>
            <TableBody>
                {currentData.data.length === 0 ? (
                    <TableRow>
                        <TableCell colSpan={15} className="text-center py-8">
                            <div className="flex flex-col items-center justify-center">
                                <Thermometer className="h-12 w-12 text-muted-foreground/50 mb-3" />
                                <p className="text-lg font-medium">No hay registros de temperaturas</p>
                            </div>
                        </TableCell>
                    </TableRow>
                ) : (
                    currentData.data.map((item) => {
                        const estadoMostrado = getEstadoMostrado(item);
                        const colorEstado = getEstadoColor(estadoMostrado);
                        return (
                            <TableRow key={item.id}>
                                <TableCell className="text-xs">{formatFechaHora(item.fecha_hora)}</TableCell>
                                <TableCell className="text-xs">{getDispositivoNombreFromRegistro(item)}</TableCell>
                                <TableCell className="text-xs">{item.patron_1 || '-'}</TableCell>
                                <TableCell className="text-xs">{item.inst_1 || '-'}</TableCell>
                                <TableCell className="text-xs">
                                    <span className={item.error_1 && Math.abs(item.error_1) > 0.5 ? 'text-red-600 font-bold' : ''}>
                                        {item.error_1 || '-'}
                                    </span>
                                </TableCell>
                                <TableCell className="text-xs">{item.patron_2 || '-'}</TableCell>
                                <TableCell className="text-xs">{item.inst_2 || '-'}</TableCell>
                                <TableCell className="text-xs">
                                    <span className={item.error_2 && Math.abs(item.error_2) > 0.5 ? 'text-red-600 font-bold' : ''}>
                                        {item.error_2 || '-'}
                                    </span>
                                </TableCell>
                                <TableCell className="text-xs">{item.patron_3 || '-'}</TableCell>
                                <TableCell className="text-xs">{item.inst_3 || '-'}</TableCell>
                                <TableCell className="text-xs">
                                    <span className={item.error_3 && Math.abs(item.error_3) > 0.5 ? 'text-red-600 font-bold' : ''}>
                                        {item.error_3 || '-'}
                                    </span>
                                </TableCell>
                                <TableCell className="text-xs">{getNombreUsuario(item)}</TableCell>
                                <TableCell>
                                    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs ${colorEstado}`}>
                                        {estadoMostrado}
                                    </span>
                                </TableCell>
                                <TableCell className="text-xs max-w-[150px] truncate" title={item.observaciones}>
                                    {item.observaciones || '-'}
                                </TableCell>
                                <TableCell>
                                    <DropdownMenu>
                                        <DropdownMenuTrigger asChild>
                                            <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                                                <MoreHorizontal className="h-4 w-4" />
                                            </Button>
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent align="end">
                                            <DropdownMenuItem onClick={() => handleView(item.id)}><Eye className="mr-2 h-4 w-4" /> Ver</DropdownMenuItem>
                                            {hasPermission('u_verificacionesDispositivos') && (
                                                <DropdownMenuItem onClick={() => handleEdit(item.id)}><Edit className="mr-2 h-4 w-4" /> Editar</DropdownMenuItem>
                                            )}
                                            {hasPermission('d_dispositivos') && (
                                                <DropdownMenuItem onClick={() => handleDelete(item.id)} className="text-destructive"><Trash2 className="mr-2 h-4 w-4" /> Eliminar</DropdownMenuItem>
                                            )}
                                        </DropdownMenuContent>
                                    </DropdownMenu>
                                </TableCell>
                            </TableRow>
                        );
                    })
                )}
            </TableBody>
        </Table>
    );

    const renderCrioscoposTable = () => (
        <Table>
            <TableHeader>
                <TableRow>
                    <TableHead>Fecha/Hora</TableHead>
                    <TableHead>Dispositivo</TableHead>
                    <TableHead>Usuario</TableHead>
                    <TableHead>Punto A Ajuste</TableHead>
                    <TableHead>Punto B Ajuste</TableHead>
                    <TableHead>Estado</TableHead>
                    <TableHead>Observaciones</TableHead>
                    <TableHead>Acciones</TableHead>
                </TableRow>
            </TableHeader>
            <TableBody>
                {currentData.data.length === 0 ? (
                    <TableRow>
                        <TableCell colSpan={8} className="text-center py-8">
                            <div className="flex flex-col items-center justify-center">
                                <Snowflake className="h-12 w-12 text-muted-foreground/50 mb-3" />
                                <p className="text-lg font-medium">No hay registros de crioscopios</p>
                            </div>
                        </TableCell>
                    </TableRow>
                ) : (
                    currentData.data.map((item) => {
                        const estadoMostrado = getEstadoMostrado(item);
                        const colorEstado = getEstadoColor(estadoMostrado);
                        return (
                            <TableRow key={item.id}>
                                <TableCell className="text-xs">{formatFechaHora(item.fecha_hora)}</TableCell>
                                <TableCell className="text-xs">{getDispositivoNombreFromRegistro(item)}</TableCell>
                                <TableCell className="text-xs">{getNombreUsuario(item)}</TableCell>
                                <TableCell>{formatBoolean(item.punto_ajuste_a)}</TableCell>
                                <TableCell>{formatBoolean(item.punto_ajuste_b)}</TableCell>
                                <TableCell>
                                    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs ${colorEstado}`}>
                                        {estadoMostrado}
                                    </span>
                                </TableCell>
                                <TableCell className="text-xs max-w-[200px] truncate" title={item.observaciones}>
                                    {item.observaciones || '-'}
                                </TableCell>
                                <TableCell>
                                    <DropdownMenu>
                                        <DropdownMenuTrigger asChild>
                                            <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                                                <MoreHorizontal className="h-4 w-4" />
                                            </Button>
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent align="end">
                                            <DropdownMenuItem onClick={() => handleView(item.id)}><Eye className="mr-2 h-4 w-4" /> Ver</DropdownMenuItem>
                                            {hasPermission('u_verificacionesDispositivos') && (
                                                <DropdownMenuItem onClick={() => handleEdit(item.id)}><Edit className="mr-2 h-4 w-4" /> Editar</DropdownMenuItem>
                                            )}
                                            {hasPermission('d_dispositivos') && (
                                                <DropdownMenuItem onClick={() => handleDelete(item.id)} className="text-destructive"><Trash2 className="mr-2 h-4 w-4" /> Eliminar</DropdownMenuItem>
                                            )}
                                        </DropdownMenuContent>
                                    </DropdownMenu>
                                </TableCell>
                            </TableRow>
                        );
                    })
                )}
            </TableBody>
        </Table>
    );

    const renderTermohigrometrosTable = () => (
        <Table>
            <TableHeader>
                <TableRow>
                    <TableHead>Fecha/Hora</TableHead>
                    <TableHead>Dispositivo</TableHead>
                    <TableHead>Patrón Temp.</TableHead>
                    <TableHead>Equipo Temp.</TableHead>
                    <TableHead>Error Temp.</TableHead>
                    <TableHead>Patrón Hum.</TableHead>
                    <TableHead>Equipo Hum.</TableHead>
                    <TableHead>Error Hum.</TableHead>
                    <TableHead>Requiere Ajuste</TableHead>
                    <TableHead>Usuario</TableHead>
                    <TableHead>Estado</TableHead>
                    <TableHead>Observaciones</TableHead>
                    <TableHead>Acciones</TableHead>
                </TableRow>
            </TableHeader>
            <TableBody>
                {currentData.data.length === 0 ? (
                    <TableRow>
                        <TableCell colSpan={13} className="text-center py-8">
                            <div className="flex flex-col items-center justify-center">
                                <ThermometerSnowflake className="h-12 w-12 text-muted-foreground/50 mb-3" />
                                <p className="text-lg font-medium">No hay registros de termohigrómetros</p>
                            </div>
                        </TableCell>
                    </TableRow>
                ) : (
                    currentData.data.map((item) => {
                        const estadoMostrado = getEstadoMostrado(item);
                        const colorEstado = getEstadoColor(estadoMostrado);
                        return (
                            <TableRow key={item.id}>
                                <TableCell className="text-xs">{formatFechaHora(item.fecha_hora)}</TableCell>
                                <TableCell className="text-xs">{getDispositivoNombreFromRegistro(item)}</TableCell>
                                <TableCell className="text-xs">{item.patron_temperatura || '-'}</TableCell>
                                <TableCell className="text-xs">{item.equipo_temperatura || '-'}</TableCell>
                                <TableCell className="text-xs">
                                    <span className={item.error_temperatura && Math.abs(item.error_temperatura) > 0.5 ? 'text-red-600 font-bold' : ''}>
                                        {item.error_temperatura || '-'}
                                    </span>
                                </TableCell>
                                <TableCell className="text-xs">{item.patron_humedad || '-'}</TableCell>
                                <TableCell className="text-xs">{item.equipo_humedad || '-'}</TableCell>
                                <TableCell className="text-xs">
                                    <span className={item.error_humedad && Math.abs(item.error_humedad) > 5 ? 'text-red-600 font-bold' : ''}>
                                        {item.error_humedad || '-'}
                                    </span>
                                </TableCell>
                                <TableCell>{formatBoolean(item.requiere_ajuste)}</TableCell>
                                <TableCell className="text-xs">{getNombreUsuario(item)}</TableCell>
                                <TableCell>
                                    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs ${colorEstado}`}>
                                        {estadoMostrado}
                                    </span>
                                </TableCell>
                                <TableCell className="text-xs max-w-[150px] truncate" title={item.observaciones}>
                                    {item.observaciones || '-'}
                                </TableCell>
                                <TableCell>
                                    <DropdownMenu>
                                        <DropdownMenuTrigger asChild>
                                            <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                                                <MoreHorizontal className="h-4 w-4" />
                                            </Button>
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent align="end">
                                            <DropdownMenuItem onClick={() => handleView(item.id)}><Eye className="mr-2 h-4 w-4" /> Ver</DropdownMenuItem>
                                            {hasPermission('u_verificacionesDispositivos') && (
                                                <DropdownMenuItem onClick={() => handleEdit(item.id)}><Edit className="mr-2 h-4 w-4" /> Editar</DropdownMenuItem>
                                            )}
                                            {hasPermission('d_dispositivos') && (
                                                <DropdownMenuItem onClick={() => handleDelete(item.id)} className="text-destructive"><Trash2 className="mr-2 h-4 w-4" /> Eliminar</DropdownMenuItem>
                                            )}
                                        </DropdownMenuContent>
                                    </DropdownMenu>
                                </TableCell>
                            </TableRow>
                        );
                    })
                )}
            </TableBody>
        </Table>
    );

    // ==================== RENDER PRINCIPAL ====================
    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Verificaciones de Dispositivos" />
            <div className="px-2 sm:px-6 py-2 space-y-2">
                <Toast />
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <h1 className="text-2xl font-bold text-foreground">Verificaciones de Dispositivos</h1>
                    </div>
                    <div className="flex items-center gap-2">
                        <Button variant="outline" size="sm" onClick={() => setShowFilters(!showFilters)} className="flex items-center gap-2">
                            <Filter className="h-4 w-4" />
                            <p className='hidden md:block'>Filtros</p>
                            {hasActiveFilters && <span className="bg-primary text-primary-foreground rounded-full h-5 w-5 text-xs flex items-center justify-center">!</span>}
                        </Button>

                        <Button variant="outline" size="sm" onClick={abrirGuiaPdf} className="flex items-center gap-2">
                            <Eye className="h-4 w-4" />
                            <span>Cronograma</span>
                        </Button>

                        <Link href={route('dispositivos-medicion.admin')}>
                            <Button variant="outline" size="sm" className="flex items-center gap-2">
                                <Edit className="h-4 w-4" />
                                <span>Administración</span>
                            </Button>
                        </Link>

                        {hasPermission('c_verificacionesDispositivos') && (
                            <Link href={route(`dispositivos-${activeTab}.create`)}>
                                <Button size="sm" className="flex items-center gap-2">
                                    <Plus className="h-4 w-4" />
                                    <span>Nueva</span>
                                </Button>
                            </Link>
                        )}
                    </div>
                </div>

                {/* Panel de filtros avanzados */}
                {showFilters && (
                    <div className="bg-muted/50 rounded-lg p-4 border border-border">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-sm font-semibold text-foreground">Filtros avanzados</h3>
                            <div className="flex items-center gap-2">
                                {hasActiveFilters && (
                                    <Button variant="ghost" size="sm" onClick={resetFilters} className="text-xs text-muted-foreground hover:text-foreground">
                                        <X className="h-4 w-4 mr-1" /> Limpiar Filtros
                                    </Button>
                                )}
                            </div>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="dispositivos_medicion_id" className="text-sm">Dispositivo</Label>
                                <FilterSelect
                                    value={filters.dispositivos_medicion_id}
                                    onChange={(v) => updateFilter('dispositivos_medicion_id', v)}
                                    placeholder="Todos los dispositivos"
                                    options={dispositivos.map((d) => ({ value: d.id.toString(), label: `${d.codigo} - ${d.dispositivo}` }))}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="estado_id" className="text-sm">Estado</Label>
                                <FilterSelect
                                    value={filters.estado_id}
                                    onChange={(v) => updateFilter('estado_id', v)}
                                    placeholder="Todos los estados"
                                    options={estados.map((e) => ({ value: e.id.toString(), label: e.nombre }))}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="user_id" className="text-sm">Usuario</Label>
                                <FilterSelect
                                    value={filters.user_id}
                                    onChange={(v) => updateFilter('user_id', v)}
                                    placeholder="Todos los usuarios"
                                    options={usuarios.map((u) => ({ value: u.id.toString(), label: u.name }))}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="fecha_inicio" className="text-sm">Fecha Inicio</Label>
                                <Input id="fecha_inicio" type="date" value={filters.fecha_inicio} onChange={(e) => updateFilter('fecha_inicio', e.target.value)} />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="fecha_fin" className="text-sm">Fecha Fin</Label>
                                <Input id="fecha_fin" type="date" value={filters.fecha_fin} onChange={(e) => updateFilter('fecha_fin', e.target.value)} />
                            </div>
                            {activeTab === 'refractometros' || activeTab === 'phmetros' || activeTab === 'termohigrometros' ? (
                                <div className="space-y-2">
                                    <Label htmlFor="requiere_ajuste" className="text-sm">Requiere Ajuste</Label>
                                    <FilterSelect
                                        value={filters.requiere_ajuste}
                                        onChange={(v) => updateFilter('requiere_ajuste', v)}
                                        placeholder="Todos"
                                        options={[{ value: '1', label: 'Sí' }, { value: '0', label: 'No' }]}
                                    />
                                </div>
                            ) : null}
                            {activeTab === 'temperaturas' ? (
                                <div className="space-y-2">
                                    <Label htmlFor="error_mayor_a" className="text-sm">Error mayor a</Label>
                                    <Input id="error_mayor_a" type="number" step="0.1" value={filters.error_mayor_a} onChange={(e) => updateFilter('error_mayor_a', e.target.value)} placeholder="0.0" />
                                </div>
                            ) : null}
                            {activeTab === 'crioscopos' ? (
                                <>
                                    <div className="space-y-2">
                                        <Label htmlFor="punto_ajuste_a" className="text-sm">Punto A Ajuste</Label>
                                        <FilterSelect
                                            value={filters.punto_ajuste_a}
                                            onChange={(v) => updateFilter('punto_ajuste_a', v)}
                                            placeholder="Todos"
                                            options={[{ value: '1', label: 'Sí' }, { value: '0', label: 'No' }]}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="punto_ajuste_b" className="text-sm">Punto B Ajuste</Label>
                                        <FilterSelect
                                            value={filters.punto_ajuste_b}
                                            onChange={(v) => updateFilter('punto_ajuste_b', v)}
                                            placeholder="Todos"
                                            options={[{ value: '1', label: 'Sí' }, { value: '0', label: 'No' }]}
                                        />
                                    </div>
                                </>
                            ) : null}
                            <div className="space-y-2">
                                <Label htmlFor="per_page" className="text-sm">Resultados por página</Label>
                                <FilterSelect
                                    value={filters.per_page}
                                    onChange={(v) => updateFilter('per_page', v)}
                                    placeholder="10 por página"
                                    options={['10', '25', '50', '100'].map(v => ({ value: v, label: `${v} por página` }))}
                                    includeAllOption={false}
                                />
                            </div>
                        </div>
                    </div>
                )}

                {/* Tabs y tablas */}
                <div className="bg-background rounded-lg border border-border shadow-sm">
                    <Tabs value={activeTab} onValueChange={setActiveTab}>
                        <TabsList className="w-full grid grid-cols-5">
                            <TabsTrigger value="phmetros" className="flex items-center gap-2">
                                <Gauge className="h-4 w-4" /><span>pHmetros ({dispositivosPhmetros.total})</span>
                            </TabsTrigger>
                            <TabsTrigger value="crioscopos" className="flex items-center gap-2">
                                <Snowflake className="h-4 w-4" /><span>Crioscopo ({dispositivosCrioscopos.total})</span>
                            </TabsTrigger>
                            <TabsTrigger value="refractometros" className="flex items-center gap-2">
                                <Droplets className="h-4 w-4" /><span>Refractómetros ({dispositivosRefractometros.total})</span>
                            </TabsTrigger>
                            <TabsTrigger value="temperaturas" className="flex items-center gap-2">
                                <Thermometer className="h-4 w-4" /><span>Temperaturas ({dispositivosTemperaturas.total})</span>
                            </TabsTrigger>
                            <TabsTrigger value="termohigrometros" className="flex items-center gap-2">
                                <ThermometerSnowflake className="h-4 w-4" /><span>Termohigrómetros ({dispositivosTermohigrometros.total})</span>
                            </TabsTrigger>
                        </TabsList>
                        <div className="p-0">
                            <TabsContent value="refractometros" className="m-0 p-0"><div className="overflow-x-auto">{renderRefractometrosTable()}</div></TabsContent>
                            <TabsContent value="phmetros" className="m-0 p-0"><div className="overflow-x-auto">{renderPhmetrosTable()}</div></TabsContent>
                            <TabsContent value="temperaturas" className="m-0 p-0"><div className="overflow-x-auto">{renderTemperaturasTable()}</div></TabsContent>
                            <TabsContent value="crioscopos" className="m-0 p-0"><div className="overflow-x-auto">{renderCrioscoposTable()}</div></TabsContent>
                            <TabsContent value="termohigrometros" className="m-0 p-0"><div className="overflow-x-auto">{renderTermohigrometrosTable()}</div></TabsContent>
                        </div>
                    </Tabs>
                    {currentData.data.length > 0 && (
                        <div className="border-t border-border px-4 py-3">
                            <TablePagination
                                pagination={currentData}
                                onPageChange={(page) => router.get(route('verificaciones-dispositivos.index'), { ...filters, tipo: activeTab, page }, { preserveState: true, replace: true })}
                            />
                        </div>
                    )}
                </div>

                {/* Información de resumen */}
                <div className='flex justify-between'>
                    <p className="text-sm text-muted-foreground mt-1">
                        Mostrando <span className="font-medium">{currentData.data.length}</span> de <span className="font-medium">{currentData.total}</span> registros
                    </p>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <div className="flex items-center gap-1"><Droplets className="h-4 w-4" /><span>Refractómetros: {dispositivosRefractometros.total}</span></div>
                        <div className="flex items-center gap-1"><Gauge className="h-4 w-4" /><span>pHmetros: {dispositivosPhmetros.total}</span></div>
                        <div className="flex items-center gap-1"><Thermometer className="h-4 w-4" /><span>Temperaturas: {dispositivosTemperaturas.total}</span></div>
                        <div className="flex items-center gap-1"><Snowflake className="h-4 w-4" /><span>Crioscopios: {dispositivosCrioscopos.total}</span></div>
                        <div className="flex items-center gap-1"><ThermometerSnowflake className="h-4 w-4" /><span>Termohigrómetros: {dispositivosTermohigrometros.total}</span></div>
                    </div>
                </div>

                {/* Generación de PDF */}
                <div className="rounded-lg border border-border bg-muted/50 p-4 mt-4">
                    <h3 className="mb-3 font-semibold text-foreground">Generar Reporte PDF</h3>
                    <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
                        <div><label className="mb-1 block text-sm font-medium">Fecha Desde</label><Input type="date" value={fechaDesde} onChange={(e) => setFechaDesde(e.target.value)} /></div>
                        <div><label className="mb-1 block text-sm font-medium">Fecha Hasta</label><Input type="date" value={fechaHasta} onChange={(e) => setFechaHasta(e.target.value)} /></div>
                        <div className="flex items-end"><Button variant="default" size="sm" onClick={handleMostrarPdf} disabled={generandoPdf} className="flex items-center gap-2"><Printer className="h-4 w-4" />{generandoPdf ? 'Generando...' : 'Ver Reporte'}</Button></div>
                    </div>
                </div>

                {/* ===== NUEVOS BOTONES PARA PDF 2025 y 2026 ===== */}
                <div className="flex items-center gap-3 mt-2">
                    <Button variant="outline" size="sm" onClick={() => abrirPdf('2025')} className="flex items-center gap-2">
                        <Eye className="h-4 w-4" />
                        <span>PDF 2025</span>
                    </Button>
                    <Button variant="outline" size="sm" onClick={() => abrirPdf('2026')} className="flex items-center gap-2">
                        <Eye className="h-4 w-4" />
                        <span>PDF 2026</span>
                    </Button>
                </div>

                {/* ===== MODAL PARA GUÍA, PDF 2025 y 2026 ===== */}
                {mostrarGuiaPdf && guiaPdfUrl && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80">
                        <div className="relative h-[95vh] w-[95vw] overflow-hidden rounded-lg bg-white shadow-2xl">
                            <button
                                className="absolute top-4 right-4 z-50 flex h-8 w-8 items-center justify-center rounded-full bg-red-600 text-white hover:bg-red-700"
                                onClick={() => {
                                    URL.revokeObjectURL(guiaPdfUrl);
                                    setMostrarGuiaPdf(false);
                                    setGuiaPdfUrl('');
                                }}
                            >
                                <X className="h-5 w-5" />
                            </button>
                            <div className="absolute top-0 right-0 left-0 z-40 flex items-center justify-between bg-gray-100 px-4 py-3">
                                <h3 className="text-lg font-semibold text-gray-800">{tituloGuiaPdf}</h3>
                            </div>
                            <div className="h-full pt-14">
                                <iframe src={guiaPdfUrl} className="w-full h-full border-0" title="Guía PDF" />
                            </div>
                        </div>
                    </div>
                )}

                {/* Modal para reporte de dispositivos */}
                {mostrarReportePdf && reportePdfUrl && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80">
                        <div className="relative h-[95vh] w-[95vw] overflow-hidden rounded-lg bg-white shadow-2xl">
                            <button
                                className="absolute top-4 right-4 z-50 flex h-8 w-8 items-center justify-center rounded-full bg-red-600 text-white hover:bg-red-700"
                                onClick={() => {
                                    URL.revokeObjectURL(reportePdfUrl);
                                    setMostrarReportePdf(false);
                                    setReportePdfUrl('');
                                }}
                            >
                                <X className="h-5 w-5" />
                            </button>
                            <div className="absolute top-0 right-0 left-0 z-40 flex items-center justify-between bg-gray-100 px-4 py-3">
                                <h3 className="text-lg font-semibold text-gray-800">
                                    Reporte de {activeTab.charAt(0).toUpperCase() + activeTab.slice(1)}
                                </h3>
                            </div>
                            <div className="h-full pt-14">
                                <iframe src={reportePdfUrl} className="w-full h-full border-0" title="Reporte PDF" />
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </AppLayout>
    );
}