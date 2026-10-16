import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

import { route } from 'ziggy-js';
import { Card, CardContent } from '@/components/ui/card';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useAuth } from '@/hooks/useAuth';
import { router } from '@inertiajs/react';
import {
    AlertTriangle,
    Beaker,
    Box,
    CheckCircle,
    Clock,
    Droplets,
    Eye,
    Factory,
    FileText,
    FlaskConical,
    Gauge,
    MoreHorizontal,
    Package,
    Play,
    Scale,
    Sparkles,
    SprayCan,
    TestTube,
    User,
    Wrench,
} from 'lucide-react';
import { useEffect, useState } from 'react';
import ModalProduccion from './ModalProduccion';

// Interfaces
interface Orp {
    id: number;
    codigo: string;
    nombre_sap?: string;
    productoTerminado?: {
        codigo_sap: string;
        nombre: string;
        lote?: string;
        nombre_sap?: string;
    };
}

interface Origen {
    id: number;
    alias: string;
    descripcion?: string;
}

interface Estado {
    id: number;
    nombre: string;
}

interface AnalisisLinea {
    id: number;
    tiempo?: string;
    estado?: { nombre?: string };
    user?: { name?: string };
    solicitante?: { name?: string; apellido?: string };
    analista?: { name?: string; apellido?: string };
    tiempo_analisis?: string;
    temperatura?: number;
    ph?: number;
    acidez?: number;
    brix?: number;
    viscosidad?: number;
    solicitante_id?: number;
    analista_id?: number;
}

interface EstadoPlantaItem {
    id: number;
    tiempo?: string;
    observaciones?: string;
    origen?: { id: number; alias: string; descripcion?: string };
    proceso?: { nombre?: string };
    etapa?: { nombre?: string };
    user?: { name?: string };
    detalles?: any[];
    analisis_linea?: AnalisisLinea | null;
}

interface TanqueCardProps {
    tanque: EstadoPlantaItem;
    nombre: string;
    className?: string;
    onSolicitarAnalisis?: (estadoPlantaId: number) => void;
    onCambiarEstado?: (origenId: number, proceso: string) => void;
    onEstadoActualizado?: () => void;
    origenes?: Origen[];
    etapas?: Estado[];
    orpsDisponibles?: Orp[];
    gruposEnvasadoras?: any[];
    onProduccionChange?: (data: any) => void;
    onAlmacenar?: (data: any) => void;
    orpsAlmacen?: Orp[];
}

// ==================== MAPA DE COLORES RGB ====================
const RGB: Record<string, string> = {
    // Fondos
    'bg-blue-100': '219,234,254',
    'bg-blue-300': '147,197,253',
    'bg-blue-500': '59,130,246',
    'bg-blue-50': '239,246,255',
    'bg-green-100': '220,252,231',
    'bg-green-300': '134,239,172',
    'bg-green-500': '34,197,94',
    'bg-green-50': '240,253,244',
    'bg-red-100': '254,226,226',
    'bg-red-300': '252,165,165',
    'bg-red-500': '239,68,68',
    'bg-purple-100': '237,233,254',
    'bg-purple-300': '196,181,253',
    'bg-purple-500': '139,92,246',
    'bg-purple-50': '250,245,255',
    'bg-orange-100': '255,237,213',
    'bg-orange-300': '253,186,116',
    'bg-orange-500': '249,115,22',
    'bg-orange-50': '255,247,237',
    'bg-cyan-100': '207,250,254',
    'bg-cyan-300': '103,232,249',
    'bg-cyan-500': '6,182,212',
    'bg-cyan-50': '236,254,255',
    'bg-pink-100': '252,231,243',
    'bg-pink-300': '249,168,212',
    'bg-pink-500': '236,72,153',
    'bg-indigo-100': '224,231,255',
    'bg-indigo-300': '165,180,252',
    'bg-indigo-500': '99,102,241',
    'bg-teal-100': '204,251,241',
    'bg-teal-300': '94,234,212',
    'bg-teal-500': '20,184,166',
    'bg-yellow-100': '254,249,195',
    'bg-yellow-300': '253,224,71',
    'bg-yellow-500': '234,179,8',
    'bg-gray-100': '243,244,246',
    'bg-gray-300': '209,213,219',
    'bg-gray-500': '107,114,128',
    'bg-gray-50': '249,250,251',

    // Textos
    'text-blue-800': '30,64,175',
    'text-green-800': '22,101,52',
    'text-red-800': '153,27,27',
    'text-purple-800': '91,33,182',
    'text-orange-800': '154,52,18',
    'text-cyan-800': '21,94,117',
    'text-pink-800': '157,23,77',
    'text-indigo-800': '55,48,163',
    'text-teal-800': '17,94,89',
    'text-yellow-800': '133,77,14',
    'text-gray-800': '31,41,55',
    'text-gray-600': '75,85,99',
    'text-gray-500': '107,114,128',
    'text-yellow-500': '234,179,8',
    'text-green-500': '34,197,94',
    'text-blue-600': '37,99,235',
    'text-green-600': '22,163,74',
    'text-orange-600': '234,88,12',
    'text-purple-600': '124,58,237',
    'text-cyan-600': '8,145,178',

    // Bordes
    'border-blue-300': '147,197,253',
    'border-green-300': '134,239,172',
    'border-red-300': '252,165,165',
    'border-purple-300': '196,181,253',
    'border-orange-300': '253,186,116',
    'border-cyan-300': '103,232,249',
    'border-pink-300': '249,168,212',
    'border-indigo-300': '165,180,252',
    'border-teal-300': '94,234,212',
    'border-yellow-300': '253,224,71',
    'border-gray-300': '209,213,219',
};

const getBgStyle = (className: string): React.CSSProperties => {
    const rgb = RGB[className];
    return rgb ? { backgroundColor: `rgb(${rgb})` } : {};
};

const getTextStyle = (className: string): React.CSSProperties => {
    const rgb = RGB[className];
    return rgb ? { color: `rgb(${rgb})` } : {};
};

const getBorderStyle = (className: string): React.CSSProperties => {
    const rgb = RGB[className];
    return rgb ? { borderColor: `rgb(${rgb})` } : {};
};

const getCombinedStyle = (classString: string): React.CSSProperties => {
    const parts = classString.split(' ');
    const styles: React.CSSProperties = {};
    parts.forEach(part => {
        if (part.startsWith('bg-')) {
            const rgb = RGB[part];
            if (rgb) styles.backgroundColor = `rgb(${rgb})`;
        } else if (part.startsWith('text-')) {
            const rgb = RGB[part];
            if (rgb) styles.color = `rgb(${rgb})`;
        } else if (part.startsWith('border-')) {
            const rgb = RGB[part];
            if (rgb) styles.borderColor = `rgb(${rgb})`;
        }
    });
    return styles;
};

const getOrpColorStyle = (codigo?: string, index: number = 0): React.CSSProperties => {
    if (!codigo) {
        const defaultColors = [
            'bg-blue-100 border-blue-300 text-blue-800',
            'bg-green-100 border-green-300 text-green-800',
            'bg-purple-100 border-purple-300 text-purple-800',
            'bg-orange-100 border-orange-300 text-orange-800',
            'bg-cyan-100 border-cyan-300 text-cyan-800',
            'bg-pink-100 border-pink-300 text-pink-800',
        ];
        const classString = defaultColors[index % defaultColors.length];
        return getCombinedStyle(classString);
    }

    let hash = 0;
    for (let i = 0; i < codigo.length; i++) {
        hash = codigo.charCodeAt(i) + ((hash << 5) - hash);
    }

    const colors = [
        'bg-red-100 border-red-300 text-red-800',
        'bg-blue-100 border-blue-300 text-blue-800',
        'bg-green-100 border-green-300 text-green-800',
        'bg-yellow-100 border-yellow-300 text-yellow-800',
        'bg-purple-100 border-purple-300 text-purple-800',
        'bg-pink-100 border-pink-300 text-pink-800',
        'bg-indigo-100 border-indigo-300 text-indigo-800',
        'bg-teal-100 border-teal-300 text-teal-800',
        'bg-orange-100 border-orange-300 text-orange-800',
        'bg-cyan-100 border-cyan-300 text-cyan-800',
    ];

    const classString = colors[Math.abs(hash) % colors.length];
    return getCombinedStyle(classString);
};

const getProductoIcon = (productoNombre?: string) => {
    if (!productoNombre) return Package;
    const nombre = productoNombre.toLowerCase();
    if (nombre.includes('leche')) return Droplets;
    if (nombre.includes('yogur') || nombre.includes('yoghurt')) return Beaker;
    if (nombre.includes('queso')) return Scale;
    if (nombre.includes('crema')) return Gauge;
    if (nombre.includes('lacteo') || nombre.includes('lácteo')) return FlaskConical;
    return Package;
};

const getProcesoConfig = (procesoNombre?: string) => {
    if (!procesoNombre)
        return {
            colorStyle: getBgStyle('bg-gray-500'),
            icon: Package,
            textColorStyle: getTextStyle('text-gray-800'),
            bgColorStyle: getBgStyle('bg-gray-100'),
            label: 'Indefinido',
        };

    const proceso = procesoNombre.toLowerCase();
    if (proceso.includes('produccion'))
        return {
            colorStyle: getBgStyle('bg-green-500'),
            icon: Play,
            textColorStyle: getTextStyle('text-green-800'),
            bgColorStyle: getBgStyle('bg-green-50'),
            label: 'Producción',
        };
    if (proceso.includes('limpieza'))
        return {
            colorStyle: getBgStyle('bg-blue-500'),
            icon: SprayCan,
            textColorStyle: getTextStyle('text-blue-800'),
            bgColorStyle: getBgStyle('bg-blue-50'),
            label: 'Limpieza',
        };
    if (proceso.includes('limpio'))
        return {
            colorStyle: getBgStyle('bg-cyan-500'),
            icon: SprayCan,
            textColorStyle: getTextStyle('text-cyan-800'),
            bgColorStyle: getBgStyle('bg-cyan-50'),
            label: 'Limpio',
        };
    if (proceso.includes('mantenimiento'))
        return {
            colorStyle: getBgStyle('bg-purple-500'),
            icon: Wrench,
            textColorStyle: getTextStyle('text-purple-800'),
            bgColorStyle: getBgStyle('bg-purple-50'),
            label: 'Mantenimiento',
        };
    if (proceso.includes('vacio'))
        return {
            colorStyle: getBgStyle('bg-gray-500'),
            icon: Box,
            textColorStyle: getTextStyle('text-gray-800'),
            bgColorStyle: getBgStyle('bg-gray-100'),
            label: 'Vacío',
        };
    if (proceso.includes('almacen'))
        return {
            colorStyle: getBgStyle('bg-orange-500'),
            icon: Box,
            textColorStyle: getTextStyle('text-orange-800'),
            bgColorStyle: getBgStyle('bg-orange-50'),
            label: 'Almacenamiento',
        };

    return {
        colorStyle: getBgStyle('bg-gray-500'),
        icon: Package,
        textColorStyle: getTextStyle('text-gray-800'),
        bgColorStyle: getBgStyle('bg-gray-100'),
        label: 'Otro',
    };
};

const formatHora = (iso?: string) => {
    if (!iso) return '--:--';
    return new Date(iso).toLocaleTimeString('es-BO', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: false,
    });
};

export default function TanqueCardUltraCompact({
    tanque,
    nombre,
    className = '',
    onSolicitarAnalisis,
    onCambiarEstado,
    onEstadoActualizado,
    origenes = [],
    etapas = [],
    orpsDisponibles = [],
    gruposEnvasadoras = [],
    onProduccionChange,
    onAlmacenar,
    orpsAlmacen,
}: TanqueCardProps) {
    const [showModal, setShowModal] = useState(false);
    const [showModalProduccion, setShowModalProduccion] = useState(false);
    const [showModalAlmacen, setShowModalAlmacen] = useState(false);

    useEffect(() => {
        if (showModal && tanque.analisis_linea) {
            console.log('Datos completos de analisis_linea:', tanque.analisis_linea);
        }
    }, [showModal, tanque.analisis_linea]);

    const { hasPermission } = useAuth();
    // const isTankEmpty = tanque.proceso?.nombre?.toLowerCase().includes('En Proceso') ?? false;
    const procesoConfig = getProcesoConfig(tanque.proceso?.nombre);
    const yaTieneSolicitud = tanque.analisis_linea;
    const tieneDetalles = tanque.detalles && tanque.detalles.length > 0;
    const esProduccion = tanque.proceso?.nombre?.toLowerCase().includes('produccion');
    const esAlmacen = tanque.proceso?.nombre?.toLowerCase().includes('almacen');
    const esProduccionOAlmacen = esProduccion || esAlmacen;

    const formatUserName = (user: any, userId?: number): string => {
        if (user && (user.name || user.apellido)) {
            return `${user.name ?? ''} ${user.apellido ?? ''}`.trim();
        }
        if (typeof userId !== 'undefined' && userId !== null) {
            return `ID: ${userId}`;
        }
        return '—';
    };

    const solicitanteLabel = formatUserName(tanque.analisis_linea?.solicitante, tanque.analisis_linea?.solicitante_id);
    const analistaLabel = formatUserName(tanque.analisis_linea?.analista, tanque.analisis_linea?.analista_id);

    const handleModificarProduccion = (data: any) => {
        console.log('Datos de modificación recibidos:', data);

        let url;
        const payload = {
            detalles: data.detalles,
            observaciones: data.observaciones || tanque.observaciones || '',
        };

        switch (data.tipo) {
            case 'cambiar-etapa':
                url = `/planta-lacteos/estados-planta/${tanque.id}/cambiar-etapa`;
                payload.etapa_id = data.etapa_id;
                break;
            case 'cambiar-orps':
                url = `/planta-lacteos/estados-planta/${tanque.id}/actualizar-orps`;
                break;
            case 'cambiar-ambos':
                url = `/planta-lacteos/estados-planta/${tanque.id}/cambiar-etapa-orps`;
                payload.etapa_id = data.etapa_id;
                break;
            default:
                console.error('Tipo de modificación no reconocido:', data.tipo);
                return;
        }

        console.log('Enviando a:', url, 'con payload:', payload);

        router.post(url, payload, {
            preserveScroll: true,
            preserveState: true,
            onSuccess: () => {
                console.log('✅ Modificación exitosa');
                setShowModalProduccion(false);
                if (onEstadoActualizado) onEstadoActualizado();
            },
            onError: (errors) => {
                console.error('❌ Error en modificación:', errors);
                alert('Error al modificar: ' + (errors.message || 'Error desconocido'));
            },
        });
    };

    return (
        <>
            <Card
                className={`group min-h-[80px] cursor-pointer border p-1 shadow-sm transition-all duration-150 hover:shadow-md ${className}`}
                onClick={() => setShowModal(true)}
            >
                <CardContent className="p-1">
                    {/* Header ultra compacto */}
                    <div className="mb-1 flex items-start justify-between">
                        <div className="flex min-w-0 flex-1 items-center gap-1">
                            <div
                                style={procesoConfig.colorStyle}
                                className="h-1.5 w-1.5 rounded-full mt-0.5 flex-shrink-0"
                            />
                            <div className="min-w-0">
                                <div className="flex items-center gap-1">
                                    <span className="truncate text-xs font-semibold text-foreground">
                                        {tanque?.origen?.alias ?? nombre}
                                    </span>
                                </div>
                            </div>
                        </div>
                        <div className="flex flex-col items-end gap-0.5">
                            <span className="text-[10px] text-muted-foreground">
                                {formatHora(tanque.tiempo)}
                            </span>
                            {yaTieneSolicitud && (
                                <TestTube
                                    className="h-3 w-3"
                                    style={
                                        tanque.analisis_linea?.estado?.nombre?.toLowerCase() === 'pendiente'
                                            ? getTextStyle('text-yellow-500')
                                            : getTextStyle('text-green-500')
                                    }
                                />
                            )}
                        </div>
                    </div>

                    {/* Etapa */}
                    <div className="mb-1 truncate text-[10px] text-muted-foreground">
                        {tanque.etapa?.nombre || 'Sin etapa específica'}
                    </div>

                    {/* Contenido dinámico */}
                    {esProduccionOAlmacen && tieneDetalles && (
                        <div className="mb-1">
                            <div className="space-y-0.5">
                                {tanque.detalles?.slice(0, 2).map((detalle, index) => {
                                    const ProductoIcon = getProductoIcon(detalle.orp?.productoTerminado?.nombre);
                                                    const nombreProducto = detalle.orp?.productoTerminado?.nombre_sap
                                        || detalle.orp?.productoTerminado?.nombre
                                        || detalle.orp?.nombre_sap
                                        || 'Producto';

                                    return (
                                        <div
                                            key={detalle.id}
                                            style={getOrpColorStyle(detalle.orp?.codigo, index)}
                                            className="rounded border px-1 py-0.5 text-[9px] flex items-center justify-between"
                                        >
                                            <div className="flex flex-1 items-center gap-1 truncate">
                                                <ProductoIcon className="h-2.5 w-2.5 flex-shrink-0" />
                                                <div className="min-w-0 truncate">
                                                    <div className="flex items-center gap-1 truncate font-medium">
                                                        <span>
                                                            {detalle.orp?.codigo ? detalle.orp.codigo.slice(-5) : `ORP${index + 1}`}
                                                        </span>
                                                        {!esAlmacen && (
                                                            <>
                                                                <span>•</span>
                                                                <span className="text-[8px]">{detalle.preparacion || 'N/A'}</span>
                                                            </>
                                                        )}
                                                    </div>
                                                    <div className="truncate text-[8px] opacity-75">
                                                        {nombreProducto.substring(0, 25)}
                                                        {nombreProducto.length > 25 && '...'}
                                                    </div>
                                                </div>
                                            </div>
                                            <span className="ml-1 flex-shrink-0 text-[10px] font-light">
                                                {detalle.cantidad > 0 ? detalle.cantidad + ' L' : ''}
                                            </span>
                                        </div>
                                    );
                                })}
                                {tanque.detalles && tanque.detalles.length > 2 && (
                                    <div className="text-center text-[8px] text-muted-foreground">
                                        +{tanque.detalles.length - 2} más...
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    {/* Footer con acciones */}
                    <div className="flex items-center justify-between">
                        <div className="text-[10px] text-muted-foreground">
                            {tanque.user?.name?.split(' ')[0] || '—'}
                        </div>
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    className="h-5 w-5 p-0 opacity-70 transition-opacity group-hover:opacity-100"
                                    onClick={(e) => e.stopPropagation()}
                                >
                                    <MoreHorizontal className="h-3 w-3" />
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="w-48">
                                <DropdownMenuItem onClick={(e) => { e.stopPropagation(); setShowModal(true); }}>
                                    <Eye className="mr-2 h-4 w-4" />
                                    <span>Ver detalles</span>
                                </DropdownMenuItem>

                                {tieneDetalles && hasPermission('solicitar_analisisLinea') && (
                                    <DropdownMenuItem onClick={(e) => { e.stopPropagation(); onSolicitarAnalisis?.(tanque.id); }}>
                                        <FlaskConical className="mr-2 h-4 w-4" />
                                        <span>Solicitar Análisis</span>
                                        {yaTieneSolicitud && (
                                            <Badge variant="outline" className="ml-2 h-4 text-[10px]">Nuevo</Badge>
                                        )}
                                    </DropdownMenuItem>
                                )}

                                {hasPermission('u_dashboardPlanta') && (
                                    <>
                                        <DropdownMenuItem onClick={(e) => { e.stopPropagation(); setShowModalProduccion(true); }}>
                                            <Factory className="mr-2 h-4 w-4 text-purple-600" />
                                            <span>Producción</span>
                                        </DropdownMenuItem>

                                        <DropdownMenuItem onClick={(e) => { e.stopPropagation(); onCambiarEstado?.(tanque.origen?.id || 0, 'Vacio Limpio'); }}>
                                            <CheckCircle className="mr-2 h-4 w-4 text-green-600" />
                                            <span>Vacio Limpio</span>
                                        </DropdownMenuItem>

                                        <DropdownMenuItem onClick={(e) => { e.stopPropagation(); onCambiarEstado?.(tanque.origen?.id || 0, 'Vacio Sucio'); }}>
                                            <AlertTriangle className="mr-2 h-4 w-4 text-orange-600" />
                                            <span>Vacio Sucio</span>
                                        </DropdownMenuItem>

                                        <DropdownMenuItem onClick={(e) => { e.stopPropagation(); onCambiarEstado?.(tanque.origen?.id || 0, 'En Limpieza'); }}>
                                            <Sparkles className="mr-2 h-4 w-4 text-blue-600" />
                                            <span>En Limpieza</span>
                                        </DropdownMenuItem>

                                        <DropdownMenuItem onClick={(e) => { e.stopPropagation(); onCambiarEstado?.(tanque.origen?.id || 0, 'En Mantenimiento'); }}>
                                            <Wrench className="mr-2 h-4 w-4 text-yellow-600" />
                                            <span>En Mantenimiento</span>
                                        </DropdownMenuItem>

                                        <DropdownMenuItem onClick={(e) => { e.stopPropagation(); setShowModalAlmacen(true); }}>
                                            <Package className="mr-2 h-4 w-4 text-muted-foreground" />
                                            <span>Almacenando</span>
                                        </DropdownMenuItem>
                                    </>
                                )}
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </div>
                </CardContent>
            </Card>

            {/* Modal de detalles */}
            <Dialog open={showModal} onOpenChange={setShowModal}>
                <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2 text-sm">
                            <Package className="h-4 w-4" />
                            {tanque?.origen?.alias ?? nombre} - Detalles
                        </DialogTitle>
                    </DialogHeader>

                    <div className="max-h-[70vh] space-y-3 overflow-y-auto">
                        <div className="grid grid-cols-2 gap-3 text-xs">
                            <div>
                                <p className="text-[11px] font-medium text-muted-foreground">Estado</p>
                                <Badge style={{ ...procesoConfig.bgColorStyle, ...procesoConfig.textColorStyle }} className="mt-1 text-[10px]">
                                    {tanque.proceso?.nombre ?? '—'}
                                </Badge>
                            </div>
                            <div>
                                <p className="text-[11px] font-medium text-muted-foreground">Etapa</p>
                                <p className="mt-1">{tanque.etapa?.nombre ?? '—'}</p>
                            </div>
                            <div>
                                <p className="text-[11px] font-medium text-muted-foreground">Usuario</p>
                                <div className="mt-1 flex items-center gap-1">
                                    <User className="h-3 w-3" />
                                    <span>{tanque.user?.name ?? '—'}</span>
                                </div>
                            </div>
                            <div>
                                <p className="text-[11px] font-medium text-muted-foreground">Hora</p>
                                <div className="mt-1 flex items-center gap-1">
                                    <Clock className="h-3 w-3" />
                                    <span>{formatHora(tanque.tiempo)}</span>
                                </div>
                            </div>
                        </div>

                        {tanque.observaciones && (
                            <div>
                                <p className="flex items-center gap-1 text-[11px] font-medium text-muted-foreground">
                                    <FileText className="h-3 w-3" />
                                    Observaciones
                                </p>
                                <p className="mt-1 rounded bg-gray-50 p-2 text-xs">{tanque.observaciones}</p>
                            </div>
                        )}

                        {tieneDetalles && (
                            <div>
                                <p className="mb-2 text-[11px] font-medium text-muted-foreground">
                                    Detalles de {esProduccion ? 'Producción' : esAlmacen ? 'Almacenamiento' : 'Contenido'}
                                </p>
                                <div className="space-y-2">
                                    {tanque.detalles?.map((detalle, index) => {
                                        const ProductoIcon = getProductoIcon(detalle.orp?.productoTerminado?.nombre);
                                        const nombreProducto = detalle.orp?.productoTerminado?.nombre_sap
                                            || detalle.orp?.productoTerminado?.nombre
                                            || detalle.orp?.nombre_sap
                                            || 'Producto';
                                        return (
                                            <div key={detalle.id} style={getOrpColorStyle(detalle.orp?.codigo, index)} className="rounded border p-2 text-xs">
                                                <div className="mb-1 flex items-start justify-between">
                                                    <div className="flex items-center gap-2">
                                                        <ProductoIcon className="h-3 w-3"
                                                        onClick={() =>
                                                                                                                                router.visit(
                                                                                                                                    route(
                                                                                                                                        'orps.reporte.show',
                                                                                                                                        detalle.orp.id,
                                                                                                                                    ),
                                                                                                                                )
                                                                                                                            }/>
                                                        <div>

                                                            <span className="font-medium">ORP: {detalle.orp?.codigo ?? 'N/A'}</span>
                                                            <p className="mt-0.5 text-[11px] text-muted-foreground">{nombreProducto}</p>
                                                        </div>
                                                    </div>
                                                    <span className="rounded bg-blue-100 px-1.5 py-0.5 text-[10px] text-blue-800">#{index + 1}</span>
                                                </div>
                                                <div className="mt-1 grid grid-cols-2 gap-2 text-[11px]">
                                                    {!esAlmacen && (
                                                        <div>
                                                            <span className="text-muted-foreground">Preparación:</span>
                                                            <span className="ml-1 font-medium">{detalle.preparacion}</span>
                                                        </div>
                                                    )}
                                                    <div className={esAlmacen ? 'col-span-2 text-right' : 'text-right'}>
                                                        <span className="text-muted-foreground">Cantidad:</span>
                                                        <span className="ml-1 font-medium">{detalle.cantidad} L</span>
                                                    </div>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        )}

                        {yaTieneSolicitud && (
                            <div>
                                <p className="mb-2 flex items-center gap-1 text-[11px] font-medium text-muted-foreground">
                                    <TestTube className="h-3 w-3" />
                                    Solicitud de Análisis Existente
                                </p>
                                <div className="rounded bg-blue-50 dark:bg-blue-950/20 p-2 text-xs">
                                    <div className="grid grid-cols-2 gap-2">
                                        <div className="flex justify-between">
                                            <span className="text-muted-foreground">Estado:</span>
                                            <Badge variant={tanque.analisis_linea?.estado?.nombre?.toLowerCase() === 'pendiente' ? 'secondary' : 'default'}>
                                                {tanque.analisis_linea?.estado?.nombre ?? 'Pendiente'}
                                            </Badge>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-gray-600 dark:text-gray-400">Solicitado por:</span>
                                            <span>{solicitanteLabel}</span>
                                        </div>
                                        <div className="flex justify-between col-span-2">
                                            <span className="text-gray-600 dark:text-gray-400">Analizado por:</span>
                                            <span>{analistaLabel}</span>
                                        </div>
                                    </div>
                                    {tanque.analisis_linea?.estado?.nombre?.toLowerCase() === 'completado' && (
                                        <div className="mt-3 border-t border-gray-200 dark:border-gray-700 pt-3">
                                            <p className="mb-2 text-[11px] font-medium text-muted-foreground">Resultados del Análisis</p>
                                            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                                                {tanque.analisis_linea.temperatura !== null && tanque.analisis_linea.temperatura !== undefined && (
                                                    <div className="flex justify-between items-center">
                                                        <span className="text-muted-foreground text-[10px]">Temp:</span>
                                                        <span className="font-medium">{tanque.analisis_linea.temperatura}°C</span>
                                                    </div>
                                                )}
                                                {tanque.analisis_linea.ph !== null && tanque.analisis_linea.ph !== undefined && (
                                                    <div className="flex justify-between items-center">
                                                        <span className="text-muted-foreground text-[10px]">pH:</span>
                                                        <span className="font-medium">{tanque.analisis_linea.ph}</span>
                                                    </div>
                                                )}
                                                {tanque.analisis_linea.acidez !== null && tanque.analisis_linea.acidez !== undefined && (
                                                    <div className="flex justify-between items-center">
                                                        <span className="text-muted-foreground text-[10px]">Acidez:</span>
                                                        <span className="font-medium">{tanque.analisis_linea.acidez}%</span>
                                                    </div>
                                                )}
                                                {tanque.analisis_linea.brix !== null && tanque.analisis_linea.brix !== undefined && (
                                                    <div className="flex justify-between items-center">
                                                        <span className="text-muted-foreground text-[10px]">Brix:</span>
                                                        <span className="font-medium">{tanque.analisis_linea.brix}°</span>
                                                    </div>
                                                )}
                                                {tanque.analisis_linea.viscosidad !== null && tanque.analisis_linea.viscosidad !== undefined && (
                                                    <div className="flex justify-between items-center">
                                                        <span className="text-muted-foreground text-[10px]">Viscosidad:</span>
                                                        <span className="font-medium">{tanque.analisis_linea.viscosidad} cP</span>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}

                        <div className="flex gap-2 pt-2">




                            {tieneDetalles && onSolicitarAnalisis && hasPermission('solicitar_analisisLinea') &&

                                // !isTankEmpty &&
                                (
                                    <Button size="sm" onClick={() => { onSolicitarAnalisis(tanque.id); setShowModal(false); }} className="flex-1">
                                        <TestTube className="mr-1 h-4 w-4" />
                                        {yaTieneSolicitud ? 'Nuevo Análisis' : 'Solicitar Análisis'}
                                    </Button>
                                )}
                            <Button size="sm" variant="outline" onClick={() => setShowModal(false)} className="flex-1">
                                Cerrar
                            </Button>
                        </div>
                    </div>
                </DialogContent>
            </Dialog>

            {/* Modal de Producción */}
            <ModalProduccion
                open={showModalProduccion}
                onOpenChange={setShowModalProduccion}
                tanque={tanque}
                origenes={origenes}
                etapas={etapas}
                orpsDisponibles={orpsDisponibles}
                gruposEnvasadoras={gruposEnvasadoras}
                onSubmit={(data) => onProduccionChange?.(data, tanque)}
                onModificar={handleModificarProduccion}
            />

            {/* Modal de Almacenamiento */}
            <ModalProduccion
                open={showModalAlmacen}
                onOpenChange={setShowModalAlmacen}
                tanque={tanque}
                origenes={origenes}
                etapas={etapas}
                orpsDisponibles={orpsDisponibles}
                orpsAlmacen={orpsAlmacen}
                gruposEnvasadoras={gruposEnvasadoras}
                modo="almacen"
                onAlmacenar={(data) => onAlmacenar?.(tanque, data)}
            />
        </>
    );
}
