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
import { Popover, PopoverTrigger, PopoverContent } from '@/components/ui/popover';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Label } from '@/components/ui/label';
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
} from 'lucide-react';
import * as React from 'react';
import { useEffect, useMemo, useState } from 'react';
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
import ReporteRecepcionAgrupado from '@/pdf/ReporteRecepcionAgrupado';

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
        almacen_materia_prima_id?: number;
        tiempo?: string;
        almacenero_id?: number;
        estado_id?: number;
        liberacion_id?: number;
        certificado?: string;
        per_page?: number;
    };
    users?: { id: number; name: string; apellido: string }[];
    itemMateriaPrimas?: { id: number; nombre: string; descripcion?: string; categoria?: { nombre: string } }[];
    proveedorMateriaPrimas?: { id: number; nombre: string }[];
    almaceneros?: { id: number; name: string; apellido: string }[];
    estados?: { id: number; nombre: string }[];
    liberaciones?: { id: number; nombre: string }[];
    almacenesMateriaPrima?: { id: number; nombre: string }[];
    isAdmin?: boolean;
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
        observacion: '',
    });
    const [showFilters, setShowFilters] = useState(false);
    const [dialogOpen, setDialogOpen] = useState(false);
    const [selectedRecepcion, setSelectedRecepcion] = useState<any>(null);
    const [fechaDesde, setFechaDesde] = useState<string>('');
    const [fechaHasta, setFechaHasta] = useState<string>('');
    const [detalleLoteOpen, setDetalleLoteOpen] = useState(false);
    const [selectedLote, setSelectedLote] = useState<any>(null);
    const [viewMode, setViewMode] = useState<'tabla' | 'tarjetas' | 'detallesLote'>('tabla');
    const [reportType, setReportType] = useState<'general' | 'agrupado'>('general');
    const [showSummaryPanel, setShowSummaryPanel] = useState(false);
    const [generalReport, setGeneralReport] = useState<any>(null);
    const [generandoResumen, setGenerandoResumen] = useState(false);
    const [reportGroupBy, setReportGroupBy] = useState<'materia_prima' | 'estado' | 'almacen'>('materia_prima');
    const [loteList, setLoteList] = useState<any[]>([]);
    const [loteViewLoading, setLoteViewLoading] = useState(false);
    const [loteFilters, setLoteFilters] = useState({
        item_materia_prima_id: '',
        fecha_elaboracion_desde: '',
        fecha_elaboracion_hasta: '',
        fecha_vencimiento_desde: '',
        fecha_vencimiento_hasta: '',
        limpieza_transporte: '',
        sin_elementos: '',
        cerrado: '',
        nit: '',
        rs: '',
        certificado: '',
    });

    const {
        hasPermission,
        canDo,
        isAdmin: isAdminFromAuth,
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
        almacenesMateriaPrima = [],
        isAdmin: isAdminFromBackend = false,
    } = props as unknown as PageProps;

    const isAdmin = isAdminFromBackend || isAdminFromAuth;
    const initialFiltersData = initialFilters as any;

    const { filters, updateFilter, resetFilters } = useAdvancedFilters({
        routeName: 'recepciones-materia-prima.index',
        initialFilters: {
            search: initialFiltersData.search || '',
            user_id: initialFiltersData.user_id?.toString() || undefined,
            item_materia_prima_id: initialFiltersData.item_materia_prima_id?.toString() || undefined,
            proveedor_materia_prima_id: initialFiltersData.proveedor_materia_prima_id?.toString() || undefined,
            almacen_materia_prima_id: initialFiltersData.almacen_materia_prima_id?.toString() || undefined,
            tiempo: initialFilters.tiempo || '',
            almacenero_id: initialFilters.almacenero_id?.toString() || undefined,
            estado_id: initialFilters.estado_id?.toString() || undefined,
            liberacion_id: initialFilters.liberacion_id?.toString() || undefined,
            certificado: initialFilters.certificado || '',
            per_page: initialFilters.per_page?.toString() || '10',
        },
        debounceFields: ['search'],
        debounceDelay: 600,
    });

    const hasActiveFilters = Object.values(filters).some(
        (value) => value && value !== '' && value !== '10',
    );

    const url = route('recepciones-materia-prima.pdf');
    const [datosPdf, setDatosPdf] = useState<any[]>([]);
    const [mostrarPdf, setMostrarPdf] = useState(false);
    const [generandoPdf, setGenerandoPdf] = useState(false);
    const [cambiandoEstados, setCambiandoEstados] = useState<Record<number, boolean>>({});
    const [observacionDialogOpen, setObservacionDialogOpen] = useState(false);
    const [observacionText, setObservacionText] = useState<string>('');
    const [observacionLoading, setObservacionLoading] = useState(false);
    const [observacionRecepcionId, setObservacionRecepcionId] = useState<number | null>(null);

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'Aceptado':
            case 'Liberado':
                return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300';
            case 'Rechazado':
            case 'No liberado':
                return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300';
            case 'Pendiente':
            case 'Observado':
                return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300';
            default:
                return 'bg-muted text-foreground';
        }
    };

    const handleUpdateRecepcionEstado = (
        recepcionId: number,
        estadoId: number | null,
        liberacionId: number | null,
    ) => {
        setCambiandoEstados((prev) => ({ ...prev, [recepcionId]: true }));
        const currentRecepcion = recepciones.data.find((r: any) => r.id === recepcionId);
        const observacionToSend = currentRecepcion?.observacion ?? '';
        router.put(
            route('recepciones-materia-prima.update-estado', recepcionId),
            { estado_id: estadoId, liberacion_id: liberacionId, observacion: observacionToSend },
            {
                preserveScroll: true,
                preserveState: true,
                onSuccess: () => setCambiandoEstados((prev) => ({ ...prev, [recepcionId]: false })),
                onError: () => setCambiandoEstados((prev) => ({ ...prev, [recepcionId]: false })),
            },
        );
    };

    const fetchDatosPdf = async () => {
        if (!fechaDesde || !fechaHasta) throw new Error('Selecciona ambas fechas');
        const params = new URLSearchParams();
        params.append('fecha_desde', fechaDesde);
        params.append('fecha_hasta', fechaHasta);
        if (filters.search) params.append('search', filters.search);
        if (filters.user_id) params.append('user_id', filters.user_id);
        if (filters.item_materia_prima_id) params.append('item_materia_prima_id', filters.item_materia_prima_id);
        if (filters.proveedor_materia_prima_id) params.append('proveedor_materia_prima_id', filters.proveedor_materia_prima_id);
        if (filters.almacen_materia_prima_id) params.append('almacen_materia_prima_id', filters.almacen_materia_prima_id);
        if (filters.tiempo) params.append('tiempo', filters.tiempo);
        if (filters.almacenero_id) params.append('almacenero_id', filters.almacenero_id);
        if (filters.estado_id) params.append('estado_id', filters.estado_id);
        if (filters.liberacion_id) params.append('liberacion_id', filters.liberacion_id);
        if (filters.certificado) params.append('certificado', filters.certificado);
        const response = await fetch(`${url}?${params.toString()}`);
        if (!response.ok) throw new Error('Error al obtener datos');
        const data = await response.json();
        return data.recepciones.map((r: any) => ({
            id: r.id,
            fecha: r.tiempo,
            usuario: `${r.user?.name || ''} ${r.user?.apellido || ''}`,
            materiaPrima: r.item_materia_prima?.nombre || '-',
            categoria: r.item_materia_prima?.categoria?.nombre || '-',
            marca: r.marca || '-',
            registro_senasag: r.registro_senasag || '-',
            cantidad_expresiva: (() => {
                if (r.cantidad_recepcionada_unidades && r.cantidad_recepcionada_unidad && r.cantidad_recepcionada_peso_por_unidad_kg) {
                    return `${r.cantidad_recepcionada_unidades} ${r.cantidad_recepcionada_unidad} × ${r.cantidad_recepcionada_peso_por_unidad_kg} kg = ${r.cantidad_recepcionada_total_kg ?? '?'} kg`;
                }
                return `${r.cantidad || '-'} ${r.item_materia_prima?.unidad?.abreviatura || ''}`;
            })(),
            proveedor: r.proveedor_materia_prima?.nombre || '-',
            nit: r.nit ? 'C.' : 'N.C.',
            rs: r.rs ? 'C.' : 'N.C.',
            limpieza_transporte: r.limpieza_transporte ? 'C.' : 'N.C.',
            sin_elementos: r.sin_elementos ? 'C.' : 'N.C.',
            cerrado: r.cerrado ? 'C.' : 'N.C.',
            estado_revision: r.estado_revision?.nombre || '-',
            certificado: r.certificado ? 'C.' : 'N.C.',
            codigo_certificado: r.codigo_certificado || '-',
            correccion: r.correccion || '-',
            observacion: r.observacion || '-',
            almacen: r.almacen?.nombre || '-',
            almacenero: `${r.almacenero?.name || ''} ${r.almacenero?.apellido || ''}`,
            estado: r.estado?.nombre || '-',
            liberacion: r.liberacion?.nombre || '-',
            lotes: (r.recepcion_lotes || []).map((l: any) => ({
                lote: l.lote || '-',
                fecha_elaboracion: l.fecha_elaboracion,
                fecha_vencimiento: l.fecha_vencimiento,
                cantidad_expresiva: (() => {
                    if (l.cantidad_recepcionada_unidades && l.cantidad_recepcionada_unidad && l.cantidad_recepcionada_peso_por_unidad) {
                        const um = l.cantidad_recepcionada_peso_por_unidad_medida || 'kg';
                        return `${l.cantidad_recepcionada_unidades} ${l.cantidad_recepcionada_unidad} × ${l.cantidad_recepcionada_peso_por_unidad} ${um} = ${l.cantidad_recepcionada_total_kg ?? '?'} ${um}`;
                    }
                    return `${l.cantidad_recepcionada_kg_unid || '-'} kg`;
                })(),
                // Organolépticas
                sabor: l.sabor || '-',
                olor: l.olor || '-',
                color: l.color || '-',
                textura_apariencia: l.textura_apariencia || '-',
                elementos_extraños: l.elementos_extraños || '-',
                // Dimensiones
                largo_total_cm: l.largo_total_cm ?? '-',
                ancho_total_cm: l.ancho_total_cm ?? '-',
                alto_cm: l.alto_cm ?? '-',
                diametro_cm: l.diametro_cm ?? '-',
                espesor_micrones: l.espesor_micrones ?? '-',
                tipo_material: l.tipo_material || '-',
                sellado: l.sellado || '-',
                estado_envase_carroceria: l.estado_envase_carroceria || '-',
                // Fisicoquímico
                temperatura_c: l.temperatura_c ?? '-',
                ph: l.ph ?? '-',
                humedad_promedio: l.humedad_promedio ?? '-',
                gluten_humedo_promedio: l.gluten_humedo_promedio ?? '-',
                gluten_seco_desarrollo: l.gluten_seco_desarrollo || '-',
                grados_brix: l.grados_brix ?? '-',
                densidad: l.densidad ?? '-',
                // Transporte
                nombre_conductor: l.nombre_conductor || '-',
                placa: l.placa || '-',
                tipo_movilidad: l.tipo_movilidad || '-',
                ingreso_traspaso: l.ingreso_traspaso || '-',
                nuevo_ingreso_almacen_id: l.nuevo_ingreso_almacen_id ?? '-',
                // Documentación / Otros
                ficha_tecnica_certificado: l.ficha_tecnica_certificado || '-',
                conforme_no_conforme: l.conforme_no_conforme ? 'Sí' : 'No',
                observaciones: l.observaciones || '-',
                aceptado_rechazo: l.aceptado_rechazo || '-',
                observaciones_conformidad_rechazo: l.observaciones_conformidad_rechazo || '-',
                estado_lote: l.estado_lote || '-',
            })),
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
            console.error(error);
            alert('Error al generar el reporte');
        } finally {
            setGenerandoPdf(false);
        }
    };

    const handleGenerarResumen = async () => {
        if (!fechaDesde || !fechaHasta) {
            alert('Por favor selecciona ambas fechas');
            return;
        }
        setGenerandoResumen(true);
        try {
            const datos = await fetchDatosPdf();
            if (datos.length === 0) {
                alert('No hay datos para el rango de fechas seleccionado');
                setGeneralReport(null);
                return;
            }
            const totalCantidad = datos.reduce((sum, item) => {
                const match = item.cantidad_expresiva.match(/= ([\d.]+) kg/);
                return sum + (match ? parseFloat(match[1]) : 0);
            }, 0);
            const totalLotes = datos.reduce((sum, item) => sum + item.lotes.length, 0);
            const estados = datos.reduce((acc: any, item) => {
                acc[item.estado] = (acc[item.estado] || 0) + 1;
                return acc;
            }, {});
            const materias = datos.reduce((acc: any, item) => {
                acc[item.materiaPrima] = (acc[item.materiaPrima] || 0) + 1;
                return acc;
            }, {});
            const almacenes = datos.reduce((acc: any, item) => {
                acc[item.almacen] = (acc[item.almacen] || 0) + 1;
                return acc;
            }, {});
            setGeneralReport({ datos, totalCantidad, totalLotes, estados, materias, almacenes });
            setShowSummaryPanel(true);
        } catch (error) {
            console.error(error);
            alert('Error al generar el resumen general');
        } finally {
            setGenerandoResumen(false);
        }
    };

    const handleFetchLoteList = async () => {
        if (!fechaDesde || !fechaHasta) {
            alert('Por favor selecciona ambas fechas');
            return;
        }
        setLoteViewLoading(true);
        try {
            const datos = await fetchDatosPdf();
            const lotes = datos.flatMap((recepcion: any) =>
                recepcion.lotes.map((lote: any) => ({
                    ...lote,
                    recepcionId: recepcion.id,
                    recepcionFecha: recepcion.fecha,
                    materiaPrima: recepcion.materiaPrima,
                    proveedor: recepcion.proveedor,
                    almacen: recepcion.almacen,
                    estado: recepcion.estado,
                    liberacion: recepcion.liberacion,
                    limpieza_transporte: recepcion.limpieza_transporte,
                    sin_elementos: recepcion.sin_elementos,
                    cerrado: recepcion.cerrado,
                    nit: recepcion.nit,
                    rs: recepcion.rs,
                    certificado: recepcion.certificado,
                })),
            );
            setLoteList(lotes);
        } catch (error) {
            console.error(error);
            alert('Error al cargar los detalles de lote');
        } finally {
            setLoteViewLoading(false);
        }
    };

    const handleShowRecepcion = (recepcion: any) => handleViewDialog(recepcion);
    const handleShowLoteDetails = (lote: any) => {
        setSelectedLote(lote);
        setDetalleLoteOpen(true);
    };
    const handleLoteFilterChange = (key: string, value: any) => setLoteFilters(prev => ({ ...prev, [key]: value }));

    const filteredLoteList = useMemo(() => {
        const boolMap: Record<string, string> = { '1': 'Sí', '0': 'No' };
        return loteList.filter(lote => {
            if (loteFilters.item_materia_prima_id && String(lote.itemMateriaPrimaId) !== loteFilters.item_materia_prima_id) return false;
            if (loteFilters.fecha_elaboracion_desde && new Date(lote.fecha_elaboracion) < new Date(loteFilters.fecha_elaboracion_desde)) return false;
            if (loteFilters.fecha_elaboracion_hasta && new Date(lote.fecha_elaboracion) > new Date(loteFilters.fecha_elaboracion_hasta)) return false;
            if (loteFilters.fecha_vencimiento_desde && new Date(lote.fecha_vencimiento) < new Date(loteFilters.fecha_vencimiento_desde)) return false;
            if (loteFilters.fecha_vencimiento_hasta && new Date(lote.fecha_vencimiento) > new Date(loteFilters.fecha_vencimiento_hasta)) return false;
            if (loteFilters.limpieza_transporte !== '' && lote.limpieza_transporte !== boolMap[loteFilters.limpieza_transporte]) return false;
            if (loteFilters.sin_elementos !== '' && lote.sin_elementos !== boolMap[loteFilters.sin_elementos]) return false;
            if (loteFilters.cerrado !== '' && lote.cerrado !== boolMap[loteFilters.cerrado]) return false;
            if (loteFilters.nit !== '' && lote.nit !== boolMap[loteFilters.nit]) return false;
            if (loteFilters.rs !== '' && lote.rs !== boolMap[loteFilters.rs]) return false;
            if (loteFilters.certificado !== '' && lote.certificado !== boolMap[loteFilters.certificado]) return false;
            return true;
        });
    }, [loteList, loteFilters]);

    const handleInput = (key: string, value: any) => setForm(prev => ({ ...prev, [key]: value }));
    const handleSaveEstado = () => {
        if (!selectedRecepcion) return;
        router.put(route('recepciones-materia-prima.update-estado', selectedRecepcion.id), form, { preserveScroll: true, onSuccess: () => setDialogOpen(false) });
    };
    const handleViewDialog = (recepcion: any) => {
        setSelectedRecepcion(recepcion);
        setForm({ estado_id: recepcion.estado_id?.toString() ?? '', liberacion_id: recepcion.liberacion_id?.toString() ?? '', observacion: recepcion.observacion ?? '' });
        setDialogOpen(true);
    };
    const handleOpenObservacionDialog = (recepcion: any) => {
        setObservacionRecepcionId(recepcion.id);
        setObservacionText(recepcion.observacion || '');
        setObservacionDialogOpen(true);
    };
    const handleSaveObservacion = async () => {
        if (observacionRecepcionId === null) return;
        setObservacionLoading(true);
        const currentRecepcion = recepciones.data.find((r: any) => r.id === observacionRecepcionId);
        await router.put(route('recepciones-materia-prima.update-estado', observacionRecepcionId), {
            estado_id: currentRecepcion?.estado_id ?? null,
            liberacion_id: currentRecepcion?.liberacion_id ?? null,
            observacion: observacionText,
        }, { preserveScroll: true, onSuccess: () => setObservacionDialogOpen(false) });
        setObservacionLoading(false);
    };
    const handleEdit = (id: number) => router.visit(route('recepciones-materia-prima.edit', id));
    const handleEdit1 = (id: number) => router.visit(route('recepciones-materia-prima1.edit', id));
    const handleDelete = (id: number) => {
        if (confirm('¿Está seguro de eliminar esta recepción?')) router.delete(route('recepciones-materia-prima.destroy', id), { preserveScroll: true });
    };
    const renderBool = (value: boolean | null | undefined) => {
        if (value === null || value === undefined) return '-';
        return value ? <span className="font-bold text-green-600">✓</span> : <span className="font-bold text-red-600">✗</span>;
    };

    const formatDate = (value?: string | null) => {
        if (!value) return '-';
        if (value.includes('T')) return new Date(value).toLocaleDateString('es-BO');
        const parts = value.split('-');
        return parts.length === 3 ? `${parts[2]}/${parts[1]}/${parts[0]}` : value;
    };
    const getInitials = useInitials();
    const agruparPorMateriaPrima = () => recepciones.data.reduce((grupos: any, r: any) => {
        const key = r.item_materia_prima?.nombre || 'Sin clasificar';
        if (!grupos[key]) grupos[key] = [];
        grupos[key].push(r);
        return grupos;
    }, {});
    const reportGroupData = useMemo(() => {
        const source = recepciones.data.map((r: any) => ({
            estado: r.estado?.nombre || 'Sin estado',
            materiaPrima: r.item_materia_prima?.nombre || 'Sin materia prima',
            almacen: r.almacen?.nombre || 'Sin almacén',
        }));
        return source.reduce((groups: any, item) => {
            const key = item[reportGroupBy];
            groups[key] = (groups[key] || 0) + 1;
            return groups;
        }, {});
    }, [recepciones.data, reportGroupBy]);

    useEffect(() => {
        const hoy = new Date();
        const hace30Dias = new Date();
        hace30Dias.setDate(hoy.getDate() - 30);
        setFechaDesde(hace30Dias.toISOString().split('T')[0]);
        setFechaHasta(hoy.toISOString().split('T')[0]);
    }, []);

    const verDetalleLote = (lote: any) => {
        setSelectedLote(lote);
        setDetalleLoteOpen(true);
    };

    // Formateo de cantidad expresiva de la recepción (se muestra una sola vez)
    const formatCantidadRecepcion = (recepcion: any) => {
        const unid = recepcion.cantidad_recepcionada_unidades;
        const unidadTexto = recepcion.cantidad_recepcionada_unidad;
        const peso = recepcion.cantidad_recepcionada_peso_por_unidad_kg;
        const total = recepcion.cantidad_recepcionada_total_kg;
        if (unid && unidadTexto && peso) return `${unid} ${unidadTexto} × ${peso} kg = ${total ?? '?'} kg`;
        return `${recepcion.cantidad || '-'} ${recepcion.item_materia_prima?.unidad?.abreviatura || ''}`;
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Recepciones de Materia Prima" />
            <div className="space-y-2 px-2 py-2 sm:px-6">
                {isAdmin && (
                    <div className="mb-4 rounded bg-blue-100 p-3 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                        <div className="flex items-center"><span className="font-medium">Modo Administrador:</span><span className="ml-2">Puedes ver todos los datos de todas las ubicaciones.</span></div>
                    </div>
                )}

                {/* Barra superior */}
                <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="relative max-w-md w-full sm:w-auto">
                        <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                        <Input placeholder="Buscar..." value={filters.search || ''} onChange={(e) => updateFilter('search', e.target.value)} className="pl-10" />
                    </div>
                    <div className="flex flex-wrap items-center gap-2">
                        {hasPermission('c_recepcionMateriaPrima') && (
                            <Link href={route('recepciones-materia-prima.create')}><Button size="sm"><Plus className="h-4 w-4" /><span className="hidden md:inline ml-1">Nueva Recepción</span></Button></Link>
                        )}
                        {hasPermission('c_recepcionMateriaPrima') && (
                            <Link href={route('recepciones-materia-prima1.create')}><Button size="sm"><Plus className="h-4 w-4" /><span className="hidden md:inline ml-1">Recepción Simple</span></Button></Link>
                        )}
                        <Button variant="outline" size="sm" onClick={() => setShowFilters(!showFilters)} className="flex items-center gap-2"><Filter className="h-4 w-4" /><span className="hidden md:inline">Filtros</span>{hasActiveFilters && <span className="flex h-5 w-5 items-center justify-center rounded-full bg-primary text-xs text-primary-foreground">!</span>}</Button>
                        <Button variant={showSummaryPanel ? 'default' : 'outline'} size="sm" onClick={() => setShowSummaryPanel(prev => !prev)}><Printer className="h-4 w-4" /><span className="hidden md:inline ml-1">Resumen</span></Button>
                    </div>
                </div>

                {/* Selector de vista */}
                <div className="flex items-center gap-2"><span className="text-xs text-muted-foreground">Vista:</span>
                    <Button size="sm" variant={viewMode === 'tabla' ? 'default' : 'outline'} onClick={() => setViewMode('tabla')} className="text-xs">Tabla (todos los datos)</Button>
                    <Button size="sm" variant={viewMode === 'tarjetas' ? 'default' : 'outline'} onClick={() => setViewMode('tarjetas')} className="text-xs">Tarjetas</Button>
                    <Button size="sm" variant={viewMode === 'detallesLote' ? 'default' : 'outline'} onClick={() => { setViewMode('detallesLote'); handleFetchLoteList(); }} className="text-xs">Detalles Lote</Button>
                </div>

                {/* Filtros avanzados (igual que antes) */}
                {showFilters && (
                    <div className="rounded-lg border border-border bg-muted/50 p-4">
                        <div className="mb-3 flex justify-between"><h3 className="font-semibold">Filtros</h3>{hasActiveFilters && <Button variant="ghost" size="sm" onClick={resetFilters}><X className="mr-1 h-4 w-4" />Limpiar</Button>}</div>
                        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
                            <FilterSelect value={filters.user_id} onChange={(v) => updateFilter('user_id', v)} placeholder="Usuario" options={users.map(u => ({ value: u.id.toString(), label: `${u.name} ${u.apellido}` }))} />
                            <FilterSelect value={filters.item_materia_prima_id} onChange={(v) => updateFilter('item_materia_prima_id', v)} placeholder="Materia Prima" options={itemMateriaPrimas.map(i => ({ value: i.id.toString(), label: i.nombre }))} />
                            <FilterSelect value={filters.proveedor_materia_prima_id} onChange={(v) => updateFilter('proveedor_materia_prima_id', v)} placeholder="Proveedor" options={proveedorMateriaPrimas.map(p => ({ value: p.id.toString(), label: p.nombre }))} />
                            <FilterSelect value={filters.almacen_materia_prima_id} onChange={(v) => updateFilter('almacen_materia_prima_id', v)} placeholder="Almacén" options={almacenesMateriaPrima.map(a => ({ value: a.id.toString(), label: a.nombre }))} />
                            <FilterSelect value={filters.almacenero_id} onChange={(v) => updateFilter('almacenero_id', v)} placeholder="Almacenero" options={almaceneros.map(a => ({ value: a.id.toString(), label: `${a.name} ${a.apellido}` }))} />
                            <FilterSelect value={filters.estado_id} onChange={(v) => updateFilter('estado_id', v)} placeholder="Estado" options={estados.map(e => ({ value: e.id.toString(), label: e.nombre }))} />
                            <FilterSelect value={filters.liberacion_id} onChange={(v) => updateFilter('liberacion_id', v)} placeholder="Liberación" options={liberaciones.map(l => ({ value: l.id.toString(), label: l.nombre }))} />
                            <FilterSelect value={filters.certificado} onChange={(v) => updateFilter('certificado', v)} placeholder="Certificado" options={[{ value: '1', label: 'Con Certificado' }, { value: '0', label: 'Sin Certificado' }]} />
                            <FilterSelect value={filters.per_page} onChange={(v) => updateFilter('per_page', v)} placeholder="Por página" options={['10', '25', '50', '100'].map(v => ({ value: v, label: `${v} por página` }))} includeAllOption={false} />
                        </div>
                        {viewMode === 'detallesLote' && (
                            <div className="mt-4 rounded border p-4">
                                <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                                    <FilterSelect value={loteFilters.item_materia_prima_id} onChange={(v) => handleLoteFilterChange('item_materia_prima_id', v)} placeholder="Materia Prima" options={itemMateriaPrimas.map(i => ({ value: i.id.toString(), label: i.nombre }))} />
                                    <Input type="date" placeholder="Elab. desde" value={loteFilters.fecha_elaboracion_desde} onChange={(e) => handleLoteFilterChange('fecha_elaboracion_desde', e.target.value)} />
                                    <Input type="date" placeholder="Elab. hasta" value={loteFilters.fecha_elaboracion_hasta} onChange={(e) => handleLoteFilterChange('fecha_elaboracion_hasta', e.target.value)} />
                                    <Input type="date" placeholder="Venc. desde" value={loteFilters.fecha_vencimiento_desde} onChange={(e) => handleLoteFilterChange('fecha_vencimiento_desde', e.target.value)} />
                                    <Input type="date" placeholder="Venc. hasta" value={loteFilters.fecha_vencimiento_hasta} onChange={(e) => handleLoteFilterChange('fecha_vencimiento_hasta', e.target.value)} />
                                </div>
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-3">
                                    {['limpieza_transporte', 'sin_elementos', 'cerrado', 'nit', 'rs', 'certificado'].map(f => (
                                        <FilterSelect key={f} value={loteFilters[f as keyof typeof loteFilters] as string} onChange={(v) => handleLoteFilterChange(f, v)} placeholder={f.replace(/_/g, ' ').toUpperCase()} options={[{ value: '', label: 'Todos' }, { value: '1', label: 'Sí' }, { value: '0', label: 'No' }]} />
                                    ))}
                                </div>
                                <Button size="sm" variant="outline" onClick={handleFetchLoteList} disabled={loteViewLoading} className="mt-3">Actualizar lotes</Button>
                            </div>
                        )}
                    </div>
                )}

                {/* Panel de resumen (igual) */}
                {showSummaryPanel && (
                    <div className="rounded-lg border bg-background/70 p-4">
                        <div className="flex flex-wrap justify-between items-center mb-4"><h3 className="text-lg font-semibold">Resumen general</h3><Select value={reportGroupBy} onValueChange={(v) => setReportGroupBy(v as any)}><SelectTrigger className="w-40"><SelectValue placeholder="Agrupar por" /></SelectTrigger><SelectContent><SelectItem value="materia_prima">Materia Prima</SelectItem><SelectItem value="estado">Estado</SelectItem><SelectItem value="almacen">Almacén</SelectItem></SelectContent></Select><Button size="sm" variant="outline" onClick={handleGenerarResumen} disabled={generandoResumen}>{generandoResumen ? 'Actualizando...' : 'Actualizar'}</Button></div>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div className="rounded border p-3"><p className="text-sm text-muted-foreground">Recepciones</p><p className="text-3xl font-bold">{recepciones.total}</p></div>
                            <div className="rounded border p-3"><p className="text-sm text-muted-foreground">Cantidad total (kg)</p><p className="text-3xl font-bold">{generalReport?.totalCantidad ?? '—'}</p></div>
                            <div className="rounded border p-3"><p className="text-sm text-muted-foreground">Lotes totales</p><p className="text-3xl font-bold">{generalReport?.totalLotes ?? '—'}</p></div>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
                            <div className="rounded border p-3"><h4 className="text-sm font-semibold mb-2">Por {reportGroupBy === 'materia_prima' ? 'Materia Prima' : reportGroupBy === 'estado' ? 'Estado' : 'Almacén'}</h4><div className="space-y-1">{Object.entries(reportGroupData).slice(0, 6).map(([k, v]) => <div key={k} className="flex justify-between text-sm"><span>{k}</span><span className="font-semibold">{Number(v)}</span></div>)}</div></div>
                            <div className="rounded border p-3"><h4 className="text-sm font-semibold mb-2">Top estados</h4>{generalReport ? Object.entries(generalReport.estados).sort((a, b) => b[1] - a[1]).slice(0, 5).map(([k, v]) => <div key={k} className="flex justify-between text-sm"><span>{k}</span><span>{Number(v)}</span></div>) : <p className="text-sm text-muted-foreground">Genera resumen</p>}</div>
                            <div className="rounded border p-3"><h4 className="text-sm font-semibold mb-2">Top materias primas</h4>{generalReport ? Object.entries(generalReport.materias).sort((a, b) => b[1] - a[1]).slice(0, 5).map(([k, v]) => <div key={k} className="flex justify-between text-sm"><span>{k}</span><span>{Number(v)}</span></div>) : <p className="text-sm text-muted-foreground">Genera resumen</p>}</div>
                        </div>
                    </div>
                )}

                {/* ===================== VISTA TABLA CON TODOS LOS DATOS VERTICALES ===================== */}
                {viewMode === 'tabla' && (
                    <div className="overflow-hidden rounded-lg border bg-background shadow-sm">
                        <div className="overflow-x-auto">
                            <Table>
                                <TableHeader>
                                    <TableRow className="bg-muted/80 dark:bg-muted/60">
                                        <TableHead rowSpan={2}>Fecha</TableHead>
                                        <TableHead rowSpan={2}>Almacén</TableHead>
                                        <TableHead rowSpan={2}>Usuario</TableHead>
                                        <TableHead rowSpan={2}>Materia Prima</TableHead>
                                        <TableHead rowSpan={2}>Marca</TableHead>
                                        <TableHead rowSpan={2}>Reg. SENASAG</TableHead>
                                        <TableHead rowSpan={2}>Cantidad recibida (total)</TableHead>
                                        <TableHead rowSpan={2}>Proveedor</TableHead>
                                        <TableHead rowSpan={2}>NIT</TableHead>
                                        <TableHead rowSpan={2}>RS</TableHead>
                                        <TableHead rowSpan={2}>Limp.</TableHead>
                                        <TableHead rowSpan={2}>Sin elem.</TableHead>
                                        <TableHead rowSpan={2}>Cerrado</TableHead>
                                        <TableHead rowSpan={2}>Certif.</TableHead>
                                        <TableHead rowSpan={2}>Estado</TableHead>
                                        <TableHead rowSpan={2}>Liberación</TableHead>
                                        <TableHead rowSpan={2}>Lote</TableHead>
                                        <TableHead rowSpan={2}>Elab.</TableHead>
                                        <TableHead rowSpan={2}>Ven.</TableHead>
                                        <TableHead rowSpan={2}>Cantidad del lote</TableHead>
                                        <TableHead colSpan={5} className="text-center bg-cyan-100 dark:bg-cyan-900/40">Organolépticas</TableHead>
                                        <TableHead colSpan={8} className="text-center bg-green-100 dark:bg-green-900/40">Dimensiones / Envase</TableHead>
                                        <TableHead colSpan={7} className="text-center bg-purple-100 dark:bg-purple-900/40">Fisicoquímico</TableHead>
                                        <TableHead colSpan={5} className="text-center bg-rose-100 dark:bg-rose-900/40">Transporte</TableHead>
                                        <TableHead colSpan={5} className="text-center bg-gray-100 dark:bg-gray-800">Documentación / Otros</TableHead>
                                        <TableHead rowSpan={2}>Acciones</TableHead>
                                    </TableRow>
                                    <TableRow className="bg-muted/60 dark:bg-muted/40">
                                        <TableHead>Sabor</TableHead><TableHead>Olor</TableHead><TableHead>Color</TableHead><TableHead>Textura</TableHead><TableHead>Elem. extraños</TableHead>
                                        <TableHead>Largo total</TableHead><TableHead>Ancho total</TableHead><TableHead>Alto</TableHead><TableHead>Diámetro</TableHead><TableHead>Espesor (µ)</TableHead><TableHead>Tipo material</TableHead><TableHead>Sellado</TableHead><TableHead>Estado envase</TableHead>
                                        <TableHead>Temperatura</TableHead><TableHead>pH</TableHead><TableHead>Humedad</TableHead><TableHead>Gluten húmedo</TableHead><TableHead>Gluten seco</TableHead><TableHead>°Brix</TableHead><TableHead>Densidad</TableHead>
                                        <TableHead>Conductor</TableHead><TableHead>Placa</TableHead><TableHead>Movilidad</TableHead><TableHead>Ingreso traspaso</TableHead><TableHead>Nuevo almacén</TableHead>
                                        <TableHead>Ficha técnica</TableHead><TableHead>Conforme</TableHead><TableHead>Observaciones</TableHead><TableHead>Aceptado/Rech.</TableHead><TableHead>Estado lote</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {recepciones.data.length === 0 ? (
                                        <TableRow><TableCell colSpan={50} className="py-8 text-center"><Milk className="mx-auto h-12 w-12 text-muted-foreground/50" /><p>No se encontraron recepciones</p></TableCell></TableRow>
                                    ) : (
                                        recepciones.data.map((recepcion) => {
                                            const lotes = recepcion.recepcion_lotes || [];
                                            const rowSpan = Math.max(lotes.length, 1);
                                            const commonCells = (
                                                <>
                                                    <TableCell rowSpan={rowSpan}><FechaHora value={recepcion.tiempo} mode="stacked" /></TableCell>
                                                    <TableCell rowSpan={rowSpan}>{recepcion.almacen?.nombre || '-'}</TableCell>
                                                    <TableCell rowSpan={rowSpan}>
                                                        <Popover><PopoverTrigger><div className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-muted/10 text-xs font-medium">{getInitials(`${recepcion.user?.name || ''} ${recepcion.user?.apellido || ''}`) || '-'}</div></PopoverTrigger><PopoverContent className="bg-primary text-primary-foreground text-xs"><p>{`${recepcion.user?.name || ''} ${recepcion.user?.apellido || ''}`}</p></PopoverContent></Popover>
                                                    </TableCell>
                                                    <TableCell rowSpan={rowSpan}>{recepcion.item_materia_prima?.nombre || '-'}
                                                        {recepcion.item_materia_prima?.descripcion && <p className="text-xs text-muted-foreground">{recepcion.item_materia_prima.descripcion}</p>}


                                                    </TableCell>
                                                    <TableCell rowSpan={rowSpan}>{recepcion.marca || '-'}</TableCell>
                                                    <TableCell rowSpan={rowSpan}>{recepcion.registro_senasag || '-'}</TableCell>
                                                    <TableCell rowSpan={rowSpan} className="whitespace-nowrap">{formatCantidadRecepcion(recepcion)}
                                                        {recepcion.unidades && recepcion.unidades && (
                                                            <p className="text-xs text-muted-foreground">{`${recepcion.unidades} [U]`}</p>
                                                        )}
                                                    </TableCell>
                                                    <TableCell rowSpan={rowSpan}>{recepcion.proveedor_materia_prima?.nombre || '-'}</TableCell>
                                                    <TableCell rowSpan={rowSpan}>{renderBool(recepcion.nit)}</TableCell>
                                                    <TableCell rowSpan={rowSpan}>{renderBool(recepcion.rs)}</TableCell>
                                                    <TableCell rowSpan={rowSpan}>{renderBool(recepcion.limpieza_transporte)}</TableCell>
                                                    <TableCell rowSpan={rowSpan}>{renderBool(recepcion.sin_elementos)}</TableCell>
                                                    <TableCell rowSpan={rowSpan}>{renderBool(recepcion.cerrado)}</TableCell>
                                                    <TableCell rowSpan={rowSpan}>{renderBool(recepcion.certificado)}</TableCell>
                                                    <TableCell rowSpan={rowSpan}><span className={`inline-flex rounded-full px-2 py-0.5 text-xs ${getStatusColor(recepcion.estado?.nombre || 'Pendiente')}`}>{recepcion.estado?.nombre || '-'}</span></TableCell>
                                                    <TableCell rowSpan={rowSpan}><span className={`inline-flex rounded-full px-2 py-0.5 text-xs ${getStatusColor(recepcion.liberacion?.nombre || 'Pendiente')}`}>{recepcion.liberacion?.nombre || '-'}</span></TableCell>
                                                </>
                                            );

                                            if (lotes.length === 0) {
                                                return (
                                                    <TableRow key={recepcion.id} className="bg-white dark:bg-slate-950">
                                                        {commonCells}
                                                        <TableCell>-</TableCell><TableCell>-</TableCell><TableCell>-</TableCell>
                                                        <TableCell>-</TableCell><TableCell>-</TableCell><TableCell>-</TableCell><TableCell>-</TableCell><TableCell>-</TableCell><TableCell>-</TableCell><TableCell>-</TableCell><TableCell>-</TableCell>
                                                        <TableCell>-</TableCell><TableCell>-</TableCell><TableCell>-</TableCell><TableCell>-</TableCell><TableCell>-</TableCell><TableCell>-</TableCell><TableCell>-</TableCell><TableCell>-</TableCell><TableCell>-</TableCell><TableCell>-</TableCell>
                                                        <TableCell>-</TableCell><TableCell>-</TableCell><TableCell>-</TableCell><TableCell>-</TableCell><TableCell>-</TableCell><TableCell>-</TableCell><TableCell>-</TableCell><TableCell>-</TableCell><TableCell>-</TableCell><TableCell>-</TableCell>
                                                        <TableCell>-</TableCell><TableCell>-</TableCell><TableCell>-</TableCell><TableCell>-</TableCell><TableCell>-</TableCell>
                                                        <TableCell>
                                                            <DropdownMenu><DropdownMenuTrigger asChild><Button variant="ghost" size="sm"><MoreHorizontal className="h-4 w-4" /></Button></DropdownMenuTrigger><DropdownMenuContent align="end"><DropdownMenuItem onClick={() => handleShowRecepcion(recepcion)}><Eye className="mr-2 h-4 w-4" />Ver</DropdownMenuItem>{hasPermission('u_recepcionMateriaPrima') && <DropdownMenuItem onClick={() => handleEdit(recepcion.id)}><Edit className="mr-2 h-4 w-4" />Editar</DropdownMenuItem>}{canDo(recepcion, 'd_recepcionMateriaPrima', 6, true) && <DropdownMenuItem onClick={() => handleDelete(recepcion.id)} className="text-destructive"><Trash2 className="mr-2 h-4 w-4" />Eliminar</DropdownMenuItem>}</DropdownMenuContent></DropdownMenu>
                                                        </TableCell>
                                                    </TableRow>
                                                );
                                            }

                                            return lotes.map((lote: any, idx: number) => (
                                                <TableRow key={`${recepcion.id}-${lote.id || idx}`} className={idx % 2 === 0 ? 'bg-white dark:bg-slate-950' : 'bg-muted/20'}>
                                                    {idx === 0 && commonCells}
                                                    <TableCell>{lote.lote || '-'}</TableCell>
                                                    <TableCell>{formatDate(lote.fecha_elaboracion)}</TableCell>
                                                    <TableCell>{formatDate(lote.fecha_vencimiento)}</TableCell>
                                                    <TableCell className="whitespace-nowrap">
                                                        {(() => {
                                                            const unid = lote.cantidad_recepcionada_unidades;
                                                            const unidadTexto = lote.cantidad_recepcionada_unidad;
                                                            const peso = lote.cantidad_recepcionada_peso_por_unidad;
                                                            const um = lote.cantidad_recepcionada_peso_por_unidad_medida || 'kg';
                                                            const total = lote.cantidad_recepcionada_total_kg;
                                                            if (unid && unidadTexto && peso) return `${unid} ${unidadTexto} × ${peso} ${um} = ${total ?? '?'} ${um}`;
                                                            return `${lote.cantidad_recepcionada_kg_unid || '-'} kg`;
                                                        })()}
                                                    </TableCell>
                                                    {/* Organolépticas */}
                                                    <TableCell className="bg-cyan-50 dark:bg-cyan-950/30">{lote.sabor || '-'}</TableCell>
                                                    <TableCell className="bg-cyan-50 dark:bg-cyan-950/30">{lote.olor || '-'}</TableCell>
                                                    <TableCell className="bg-cyan-50 dark:bg-cyan-950/30">{lote.color || '-'}</TableCell>
                                                    <TableCell className="bg-cyan-50 dark:bg-cyan-950/30">{lote.textura_apariencia || '-'}</TableCell>
                                                    <TableCell className="bg-cyan-50 dark:bg-cyan-950/30">{lote.elementos_extraños || '-'}</TableCell>
                                                    {/* Dimensiones */}
                                                    <TableCell className="bg-green-50 dark:bg-green-950/30">{lote.largo_total_cm ?? '-'}</TableCell>
                                                    <TableCell className="bg-green-50 dark:bg-green-950/30">{lote.ancho_total_cm ?? '-'}</TableCell>
                                                    <TableCell className="bg-green-50 dark:bg-green-950/30">{lote.alto_cm ?? '-'}</TableCell>
                                                    <TableCell className="bg-green-50 dark:bg-green-950/30">{lote.diametro_cm ?? '-'}</TableCell>
                                                    <TableCell className="bg-green-50 dark:bg-green-950/30">{lote.espesor_micrones ?? '-'}</TableCell>
                                                    <TableCell className="bg-green-50 dark:bg-green-950/30">{lote.tipo_material || '-'}</TableCell>
                                                    <TableCell className="bg-green-50 dark:bg-green-950/30">{lote.sellado || '-'}</TableCell>
                                                    <TableCell className="bg-green-50 dark:bg-green-950/30">{lote.estado_envase_carroceria || '-'}</TableCell>
                                                    {/* Fisicoquímico */}
                                                    <TableCell className="bg-purple-50 dark:bg-purple-950/30">{lote.temperatura_c ?? '-'}</TableCell>
                                                    <TableCell className="bg-purple-50 dark:bg-purple-950/30">{lote.ph ?? '-'}</TableCell>
                                                    <TableCell className="bg-purple-50 dark:bg-purple-950/30">{lote.humedad_promedio ?? '-'}</TableCell>
                                                    <TableCell className="bg-purple-50 dark:bg-purple-950/30">{lote.gluten_humedo_promedio ?? '-'}</TableCell>
                                                    <TableCell className="bg-purple-50 dark:bg-purple-950/30">{lote.gluten_seco_desarrollo || '-'}</TableCell>
                                                    <TableCell className="bg-purple-50 dark:bg-purple-950/30">{lote.grados_brix ?? '-'}</TableCell>
                                                    <TableCell className="bg-purple-50 dark:bg-purple-950/30">{lote.densidad ?? '-'}</TableCell>
                                                    {/* Transporte */}
                                                    <TableCell className="bg-rose-50 dark:bg-rose-950/30">{lote.nombre_conductor || '-'}</TableCell>
                                                    <TableCell className="bg-rose-50 dark:bg-rose-950/30">{lote.placa || '-'}</TableCell>
                                                    <TableCell className="bg-rose-50 dark:bg-rose-950/30">{lote.tipo_movilidad || '-'}</TableCell>
                                                    <TableCell className="bg-rose-50 dark:bg-rose-950/30">{lote.ingreso_traspaso || '-'}</TableCell>
                                                    <TableCell className="bg-rose-50 dark:bg-rose-950/30">{lote.nuevo_ingreso_almacen_id ?? '-'}</TableCell>

                                                    {/* Documentación / Otros */}
                                                    <TableCell className="bg-gray-50 dark:bg-gray-800/50">{lote.ficha_tecnica_certificado || '-'}</TableCell>
                                                    <TableCell className="bg-gray-50 dark:bg-gray-800/50">{lote.conforme_no_conforme ? 'Sí' : 'No'}</TableCell>
                                                    <TableCell className="bg-gray-50 dark:bg-gray-800/50 max-w-[150px] truncate" title={lote.observaciones}>{lote.observaciones || '-'}</TableCell>
                                                    <TableCell className="bg-gray-50 dark:bg-gray-800/50">{lote.aceptado_rechazo || '-'}</TableCell>
                                                    <TableCell className="bg-gray-50 dark:bg-gray-800/50">{lote.estado_lote || '-'}</TableCell>
                                                    <TableCell>
                                                        <div className="flex items-center gap-1">
                                                            <Button variant="ghost" size="sm" onClick={() => verDetalleLote(lote)}><Eye className="h-4 w-4" /></Button>
                                                            {idx === 0 && (
                                                                <DropdownMenu>
                                                                    <DropdownMenuTrigger asChild><Button variant="ghost" size="sm"><MoreHorizontal className="h-4 w-4" /></Button></DropdownMenuTrigger>
                                                                    <DropdownMenuContent align="end">
                                                                        <DropdownMenuItem onClick={() => handleShowRecepcion(recepcion)}><Eye className="mr-2 h-4 w-4" />Ver recepción</DropdownMenuItem>
                                                                        {hasPermission('u_recepcionMateriaPrima') && <DropdownMenuItem onClick={() => handleEdit(recepcion.id)}><Edit className="mr-2 h-4 w-4" />Editar recepción</DropdownMenuItem>}
                                                                        {canDo(recepcion, 'd_recepcionMateriaPrima', 6, true) && <DropdownMenuItem onClick={() => handleDelete(recepcion.id)} className="text-destructive"><Trash2 className="mr-2 h-4 w-4" />Eliminar recepción</DropdownMenuItem>}
                                                                    </DropdownMenuContent>
                                                                </DropdownMenu>
                                                            )}
                                                        </div>
                                                    </TableCell>
                                                </TableRow>
                                            ));
                                        })
                                    )}
                                </TableBody>
                            </Table>
                        </div>
                        {recepciones.data.length > 0 && (
                            <div className="border-t px-4 py-3">
                                <TablePagination pagination={recepciones} onPageChange={(page) => router.get(route('recepciones-materia-prima.index'), { ...filters, page }, { preserveState: true, replace: true })} />
                            </div>
                        )}
                    </div>
                )}

                {/* VISTA TARJETAS (resumida) */}
                {viewMode === 'tarjetas' && (
                    <div className="space-y-6">
                        {recepciones.data.length === 0 ? <div className="rounded-lg border-dashed py-12 text-center"><Milk className="mx-auto h-12 w-12" /><p>No se encontraron recepciones</p></div> :
                            Object.entries(agruparPorMateriaPrima()).map(([materia, grupo]: [string, any]) => (
                                <div key={materia} className="rounded-lg border p-4"><h3 className="text-lg font-semibold mb-3">{materia}</h3><div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">{grupo.map((r: any) => <div key={r.id} className="rounded border p-3 hover:shadow"><p className="text-xs text-muted-foreground"><FechaHora value={r.tiempo} mode="stacked" /></p><p className="font-medium">{r.proveedor_materia_prima?.nombre}</p><p className="text-sm">{formatCantidadRecepcion(r)}</p><div className="flex justify-between mt-2"><Button size="sm" variant="outline" onClick={() => handleEdit(r.id)}><Edit className="h-3 w-3 mr-1" />Editar</Button><Button size="sm" variant="outline" onClick={() => handleShowRecepcion(r)}><Eye className="h-3 w-3 mr-1" />Ver</Button></div></div>)}</div></div>
                            ))}
                    </div>
                )}

                {/* VISTA DETALLES LOTE */}
                {viewMode === 'detallesLote' && (
                    <div className="rounded-lg border">
                        <div className="p-3 border-b bg-muted/50 flex justify-between"><h3 className="font-semibold">Detalles de Lote</h3><Button size="sm" variant="outline" onClick={handleFetchLoteList} disabled={loteViewLoading}>{loteViewLoading ? 'Cargando...' : 'Recargar'}</Button></div>
                        <div className="overflow-x-auto"><Table><TableHeader><TableRow>{['Lote', 'Recepción', 'Materia Prima', 'Almacén', 'Proveedor', 'Cantidad', 'LT', 'SEE', 'C', 'NIT', 'RS', 'Cert', 'Acciones'].map(h => <TableHead key={h}>{h}</TableHead>)}</TableRow></TableHeader><TableBody>{filteredLoteList.map(lote => <TableRow key={lote.recepcionId + lote.lote}><TableCell>{lote.lote || '-'}</TableCell><TableCell><FechaHora value={lote.recepcionFecha} mode="stacked" /></TableCell><TableCell>{lote.materiaPrima}</TableCell><TableCell>{lote.almacen}</TableCell><TableCell>{lote.proveedor}</TableCell><TableCell>{lote.cantidad_expresiva}</TableCell><TableCell>{lote.limpieza_transporte === 'Sí' ? '✓' : lote.limpieza_transporte === 'No' ? '✗' : '-'}</TableCell><TableCell>{lote.sin_elementos === 'Sí' ? '✓' : lote.sin_elementos === 'No' ? '✗' : '-'}</TableCell><TableCell>{lote.cerrado === 'Sí' ? '✓' : lote.cerrado === 'No' ? '✗' : '-'}</TableCell><TableCell>{lote.nit === 'Sí' ? '✓' : lote.nit === 'No' ? '✗' : '-'}</TableCell><TableCell>{lote.rs === 'Sí' ? '✓' : lote.rs === 'No' ? '✗' : '-'}</TableCell><TableCell>{lote.certificado === 'Sí' ? '✓' : lote.certificado === 'No' ? '✗' : '-'}</TableCell><TableCell><Button variant="ghost" size="sm" onClick={() => handleShowLoteDetails(lote)}><Eye className="h-4 w-4" /></Button></TableCell></TableRow>)}</TableBody></Table></div>
                    </div>
                )}

                {/* Reporte PDF */}
                <div className="rounded-lg border bg-muted/50 p-4"><h3 className="font-semibold mb-3">Generar Reporte PDF</h3><div className="grid grid-cols-1 md:grid-cols-4 gap-3"><Input type="date" value={fechaDesde} onChange={(e) => setFechaDesde(e.target.value)} /><Input type="date" value={fechaHasta} onChange={(e) => setFechaHasta(e.target.value)} /><Select value={reportType} onValueChange={(v) => setReportType(v as any)}><SelectTrigger><SelectValue placeholder="Tipo" /></SelectTrigger><SelectContent><SelectItem value="general">General</SelectItem><SelectItem value="agrupado">Agrupado</SelectItem></SelectContent></Select><Button onClick={handleMostrarPdf} disabled={generandoPdf}><Printer className="h-4 w-4 mr-2" />{generandoPdf ? 'Generando...' : 'Ver Reporte'}</Button></div></div>
            </div>

            {/* Modales (sin cambios, pero se adaptan a los nuevos datos) */}
            {mostrarPdf && datosPdf.length > 0 && (
                <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center"><div className="relative h-[95vh] w-[95vw] bg-white rounded-lg"><button className="absolute top-2 right-2 z-50 rounded-full bg-red-600 p-1 text-white" onClick={() => setMostrarPdf(false)}><X className="h-5 w-5" /></button><PDFViewer width="100%" height="100%">{reportType === 'general' ? <ReporteRecepcion datos={datosPdf} /> : <ReporteRecepcionAgrupado datos={datosPdf} />}</PDFViewer></div></div>
            )}

            <Dialog open={observacionDialogOpen} onOpenChange={setObservacionDialogOpen}><DialogContent><DialogHeader><DialogTitle>Editar observación</DialogTitle></DialogHeader><Textarea value={observacionText} onChange={(e) => setObservacionText(e.target.value)} rows={4} /><DialogFooter><Button variant="outline" onClick={() => setObservacionDialogOpen(false)}>Cancelar</Button><Button onClick={handleSaveObservacion} disabled={observacionLoading}>Guardar</Button></DialogFooter></DialogContent></Dialog>

            <Dialog open={dialogOpen} onOpenChange={setDialogOpen}><DialogContent className="max-h-[90vh] overflow-y-auto max-w-3xl"><DialogHeader><DialogTitle>Detalles de Recepción</DialogTitle></DialogHeader>{selectedRecepcion && (<div className="space-y-4"><div className="grid md:grid-cols-2 gap-4"><div className="rounded border p-3"><p className="text-sm text-muted-foreground">Fecha</p><p><FechaHora value={selectedRecepcion.tiempo} mode="stacked" /></p><p className="text-sm text-muted-foreground mt-2">Almacén</p><p>{selectedRecepcion.almacen?.nombre}</p></div><div className="rounded border p-3"><p className="text-sm text-muted-foreground">Materia Prima</p><p>{selectedRecepcion.item_materia_prima?.nombre}</p><p className="text-sm text-muted-foreground mt-2">Cantidad</p><p>{formatCantidadRecepcion(selectedRecepcion)}</p></div></div><div className="rounded border p-3"><h4 className="font-medium">Lotes</h4>{selectedRecepcion.recepcion_lotes?.length ? selectedRecepcion.recepcion_lotes.map((l: any) => <div key={l.id} className="border-t mt-2 pt-2"><p><strong>Lote:</strong> {l.lote} | <strong>Cantidad:</strong> {(() => { const u=l.cantidad_recepcionada_unidades, ut=l.cantidad_recepcionada_unidad, p=l.cantidad_recepcionada_peso_por_unidad, um=l.cantidad_recepcionada_peso_por_unidad_medida||'kg', tot=l.cantidad_recepcionada_total_kg; return u&&ut&&p?`${u} ${ut} × ${p} ${um} = ${tot??'?'} ${um}`:`${l.cantidad_recepcionada_kg_unid||'-'} kg`;})()}</p><p><strong>Sabor:</strong> {l.sabor||'-'} | <strong>Olor:</strong> {l.olor||'-'} | <strong>Color:</strong> {l.color||'-'} | <strong>Textura:</strong> {l.textura_apariencia||'-'}</p><p><strong>Tipo material:</strong> {l.tipo_material||'-'} | <strong>Estado lote:</strong> {l.estado_lote||'-'}</p></div>) : <p className="text-muted-foreground">Sin lotes</p>}</div>{hasPermission('u_recepcionMateriaPrima') && (<div className="space-y-3"><div className="grid grid-cols-2 gap-3"><Select value={form.estado_id} onValueChange={(v) => handleInput('estado_id', v)}><SelectTrigger><SelectValue placeholder="Estado" /></SelectTrigger><SelectContent>{estados.map(e => <SelectItem key={e.id} value={e.id.toString()}>{e.nombre}</SelectItem>)}</SelectContent></Select><Select value={form.liberacion_id} onValueChange={(v) => handleInput('liberacion_id', v)}><SelectTrigger><SelectValue placeholder="Liberación" /></SelectTrigger><SelectContent>{liberaciones.map(l => <SelectItem key={l.id} value={l.id.toString()}>{l.nombre}</SelectItem>)}</SelectContent></Select></div><Textarea placeholder="Observación" value={form.observacion} onChange={(e) => handleInput('observacion', e.target.value)} rows={2} /></div>)}</div>)}<DialogFooter><Button variant="outline" onClick={() => setDialogOpen(false)}>Cerrar</Button>{hasPermission('u_recepcionMateriaPrima') && <Button onClick={handleSaveEstado}>Guardar cambios</Button>}</DialogFooter></DialogContent></Dialog>

            <Dialog open={detalleLoteOpen} onOpenChange={setDetalleLoteOpen}><DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto"><DialogHeader><DialogTitle>Detalle completo del lote</DialogTitle></DialogHeader>{selectedLote && (<div className="grid grid-cols-2 gap-2 text-sm"><div><strong>Lote:</strong> {selectedLote.lote || '-'}</div><div><strong>Fecha elaboración:</strong> {formatDate(selectedLote.fecha_elaboracion)}</div><div><strong>Fecha vencimiento:</strong> {formatDate(selectedLote.fecha_vencimiento)}</div><div><strong>Cantidad:</strong> {selectedLote.cantidad_expresiva}</div><div><strong>Tipo material:</strong> {selectedLote.tipo_material || '-'}</div><div><strong>Color:</strong> {selectedLote.color || '-'}</div><div><strong>pH:</strong> {selectedLote.ph ?? '-'}</div><div><strong>Conforme:</strong> {selectedLote.conforme_no_conforme ? 'Sí' : 'No'}</div><div><strong>Estado lote:</strong> {selectedLote.estado_lote || '-'}</div><div><strong>Sabor:</strong> {selectedLote.sabor || '-'}</div><div><strong>Olor:</strong> {selectedLote.olor || '-'}</div><div><strong>Textura:</strong> {selectedLote.textura_apariencia || '-'}</div><div><strong>Largo total:</strong> {selectedLote.largo_total_cm ?? '-'}</div><div><strong>Ancho total:</strong> {selectedLote.ancho_total_cm ?? '-'}</div><div><strong>Alto:</strong> {selectedLote.alto_cm ?? '-'}</div><div><strong>Diámetro:</strong> {selectedLote.diametro_cm ?? '-'}</div><div><strong>Espesor (µ):</strong> {selectedLote.espesor_micrones ?? '-'}</div><div><strong>Temperatura:</strong> {selectedLote.temperatura_c ?? '-'}</div><div><strong>Humedad:</strong> {selectedLote.humedad_promedio ?? '-'}</div><div><strong>Gluten húmedo:</strong> {selectedLote.gluten_humedo_promedio ?? '-'}</div><div><strong>°Brix:</strong> {selectedLote.grados_brix ?? '-'}</div><div><strong>Placa:</strong> {selectedLote.placa || '-'}</div><div><strong>Conductor:</strong> {selectedLote.nombre_conductor || '-'}</div><div><strong>Ingreso traspaso:</strong> {selectedLote.ingreso_traspaso || '-'}</div><div><strong>Observaciones:</strong> {selectedLote.observaciones || '-'}</div></div>)}<DialogFooter><Button onClick={() => setDetalleLoteOpen(false)}>Cerrar</Button></DialogFooter></DialogContent></Dialog>
        </AppLayout>
    );
}
