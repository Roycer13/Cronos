import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
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
import { envasadoraIdMap } from '@/config/tanquesLayout';
import { useAuth } from '@/hooks/useAuth';

import { router } from '@inertiajs/react';

import {
    AlertTriangle,
    Beaker,
    CheckCircle,
    Clock,
    Droplets,
    FileText,
    FlaskConical,
    Gauge,
    MoreHorizontal,
    Package,
    Scale,
    Sparkles,
    TestTube,
    User,
    Wrench,
} from 'lucide-react';
import { useState } from 'react';
import { route } from 'ziggy-js';

interface AnalisisLinea {
    id: number;
    tiempo?: string;
    estado?: { nombre?: string };
    user?: { name?: string };
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

interface EnvasadoraGroupProps {
    grupo: {
        id: string;
        nombre: string;
        envasadoras: string[];
        gridClass?: string;
    };
    tanques: Record<string, EstadoPlantaItem>;
    onSolicitarAnalisis?: (estadoPlantaId: number) => void;
    onCompletarORP?: (orpId: number) => void;
    onPausarORP?: (orpId: number) => void;

    onCambiarEstado?: (origenId: number, proceso: string) => void;
}

const getProductoIcon = (productoNombre?: string) => {
    if (!productoNombre) return Package;
    const nombre = productoNombre.toLowerCase();
    if (nombre.includes('leche')) return Droplets;
    if (nombre.includes('yogur') || nombre.includes('yoghurt')) return Beaker;
    if (nombre.includes('queso')) return Scale;
    if (nombre.includes('crema')) return Gauge;
    if (nombre.includes('lacteo') || nombre.includes('lácteo'))
        return FlaskConical;
    return Package;
};

const getOrpColor = (codigo?: string, index: number = 0) => {
    if (!codigo) {
        const defaultColors = [
            'bg-blue-100 border-blue-300 text-blue-800',
            'bg-green-100 border-green-300 text-green-800',
            'bg-purple-100 border-purple-300 text-purple-800',
            'bg-orange-100 border-orange-300 text-orange-800',
            'bg-cyan-100 border-cyan-300 text-cyan-800',
            'bg-pink-100 border-pink-300 text-pink-800',
        ];
        return defaultColors[index % defaultColors.length];
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

    return colors[Math.abs(hash) % colors.length];
};

export default function EnvasadoraGroup({
    grupo,
    tanques,
    onSolicitarAnalisis,
    onCompletarORP,
    onPausarORP,
    onCambiarEstado,
}: EnvasadoraGroupProps) {
    const [selectedTanque, setSelectedTanque] =
        useState<EstadoPlantaItem | null>(null);
    const { hasPermission } = useAuth();

    const formatHora = (iso?: string) => {
        if (!iso) return '--:--';
        return new Date(iso).toLocaleTimeString('es-BO', {
            hour: '2-digit',
            minute: '2-digit',
        });
    };

    const formatFechaCompleta = (iso?: string) => {
        if (!iso) return '—';
        return new Date(iso).toLocaleString('es-BO', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        });
    };

    const getProcesoColor = (procesoNombre?: string) => {
        if (!procesoNombre) return 'text-gray-500';
        const proceso = procesoNombre.toLowerCase();
        if (proceso.includes('produccion')) return 'text-green-600';
        if (proceso.includes('limpieza')) return 'text-blue-600';
        if (proceso.includes('mantenimiento')) return 'text-purple-600';
        if (proceso.includes('vacio')) return 'text-gray-500';
        return 'text-gray-500';
    };

    const getProcesoBgColor = (procesoNombre?: string) => {
        if (!procesoNombre) return 'bg-gray-100';
        const proceso = procesoNombre.toLowerCase();
        if (proceso.includes('produccion'))
            return 'bg-green-50 border-green-200';
        if (proceso.includes('limpieza')) return 'bg-blue-50 border-blue-200';
        if (proceso.includes('mantenimiento'))
            return 'bg-purple-50 border-purple-200';
        if (proceso.includes('vacio')) return 'bg-gray-50 border-gray-200';
        return 'bg-gray-50 border-gray-200';
    };

    const getEnvasadoraId = (alias: string): number | null => {
        const grupoMap = envasadoraIdMap[grupo.id];
        return grupoMap ? grupoMap[alias] || null : null;
    };

    const envasadorasConIds = grupo.envasadoras
        .map((alias) => ({
            alias,
            idReal: getEnvasadoraId(alias),
        }))
        .filter((item) => item.idReal !== null);

    const findTanqueByIdReal = (idReal: number): EstadoPlantaItem | null => {
        for (const key in tanques) {
            const tanque = tanques[key];
            if (tanque.origen?.id === idReal) {
                return tanque;
            }
        }
        return null;
    };

    // Agrupar cabezales por ORP
    const gruposORP = new Map<
        string,
        {
            orp?: any;
            preparacion?: string;
            producto?: string;
            cabezales: Array<{ alias: string; tanque: EstadoPlantaItem }>;
        }
    >();

    envasadorasConIds.forEach(({ alias, idReal }) => {
        const tanque = findTanqueByIdReal(idReal!);
        if (!tanque) return;

        if (tanque.detalles && tanque.detalles.length > 0) {
            tanque.detalles.forEach((detalle) => {
                const orpCodigo = detalle.orp?.codigo || 'sin-orp';
                if (!gruposORP.has(orpCodigo)) {
                    gruposORP.set(orpCodigo, {
                        orp: detalle.orp,
                        preparacion: detalle.preparacion,
                        producto:
                            detalle.orp?.productoTerminado?.nombre_sap ||
                            detalle.orp?.productoTerminado?.nombre ||
                            detalle.orp?.nombre_sap ||
                            'Producto desconocido',
                        cabezales: [],
                    });
                }
                const grupo = gruposORP.get(orpCodigo)!;
                if (!grupo.cabezales.some((c) => c.alias === alias)) {
                    grupo.cabezales.push({ alias, tanque });
                }
            });
        } else {
            // Cabezal sin detalles
            if (!gruposORP.has('sin-detalles')) {
                gruposORP.set('sin-detalles', {
                    cabezales: [],
                    producto: 'Inactivo/Sin producto',
                });
            }
            const grupo = gruposORP.get('sin-detalles')!;
            if (!grupo.cabezales.some((c) => c.alias === alias)) {
                grupo.cabezales.push({ alias, tanque });
            }
        }
    });

    return (
        <>
            <Card
                className={`border p-1 shadow-sm transition-all hover:shadow-md ${grupo.gridClass || 'col-span-1'}`}
            >
                <CardContent className="p-1">
                    <div className="mb-2 flex items-center justify-between">
                        <div className="flex items-center gap-1">
                            <Package className="h-3 w-3 text-gray-600" />
                            <span className="text-xs font-semibold text-gray-800">
                                {grupo.nombre}
                            </span>
                            <Badge
                                variant="outline"
                                className="h-4 px-1 text-[10px]"
                            >
                                {envasadorasConIds.length}
                            </Badge>
                        </div>

                        {gruposORP.size > 0 && (
                            <div className="flex items-center gap-1">
                                <span className="text-[10px] text-gray-600">
                                    {gruposORP.size === 1 ? '1 ORP' : `${gruposORP.size} ORPs`}
                                </span>
                            </div>
                        )}
                    </div>

                    {/* Mostrar grupos agrupados por ORP */}
                    <div className="space-y-2">
                        {Array.from(gruposORP.entries()).map(
                            ([orpKey, grupoDatos], grupoIndex) => {
                                const colorClass = getOrpColor(
                                    grupoDatos.orp?.codigo,
                                    grupoIndex,
                                );

                                // separar solo bg + border para evitar que el texto heredado oculte labels en dark mode
                                const bgBorderClass = colorClass
                                    .split(' ')
                                    .filter((c) => c.startsWith('bg-') || c.startsWith('border-'))
                                    .join(' ');

                                // Extraer clases para obtener los valores RGB
                                const isInactive = orpKey === 'sin-detalles';

                                return (
                                    <div
                                        key={orpKey}
                                        className={`rounded-lg border p-2 ${isInactive ? 'bg-gray-50 border-gray-200 dark:bg-neutral-900 dark:border-neutral-700' : `${bgBorderClass} dark:bg-neutral-900 dark:border-neutral-700`}`}
                                    >
                                        {/* Header del grupo ORP */}
                                        <div className="mb-2 flex items-center justify-between">
                                            <div className="flex-1">
                                                {!isInactive && (
                                                    <>
                                                        <div className="flex items-center gap-2">
                                                            <span className="inline-flex items-center rounded-full bg-white px-2 py-0.5 text-[10px] font-semibold shadow-sm border dark:bg-neutral-800 dark:text-gray-100">
                                                                {grupoDatos.orp?.codigo || 'ORP N/A'}
                                                            </span>
                                                        </div>
                                                        <p className="mt-1 text-[10px] font-medium text-gray-700 dark:text-gray-200">
                                                            {typeof grupoDatos.producto === 'string' && grupoDatos.producto.length > 25 ? grupoDatos.producto.substring(0,25) + '...' : grupoDatos.producto}
                                                        </p>
                                                        {grupoDatos.preparacion && (
                                                            <p className="text-[9px] text-gray-600 dark:text-gray-300">
                                                                Prep: <span className="font-medium">{grupoDatos.preparacion}</span>
                                                            </p>
                                                        )}
                                                    </>
                                                )}
                                                {isInactive && (
                                                    <p className="text-[10px] font-medium text-gray-600 dark:text-gray-200">
                                                        {grupoDatos.producto}
                                                    </p>
                                                )}
                                            </div>
                                        </div>

                                        {/* Cabezales/Orígenes del grupo */}
                                        <div className="flex flex-wrap gap-1">
                                            {grupoDatos.cabezales.map(
                                                ({ alias, tanque }) => {
                                                    const colorProc = getProcesoColor(
                                                        tanque.proceso?.nombre,
                                                    );
                                                    const bgProc = getProcesoBgColor(
                                                        tanque.proceso?.nombre,
                                                    );
                                                    const estaProduccion =
                                                        tanque.proceso?.nombre
                                                            ?.toLowerCase()
                                                            .includes('produccion');
                                                    const tieneSolicitud =
                                                        tanque.analisis_linea;

                                                    return (
                                                        <div
                                                            key={`${grupo.id}-${orpKey}-${alias}`}
                                                            onClick={() =>
                                                                setSelectedTanque(
                                                                    tanque,
                                                                )
                                                            }
                                                            className={`cursor-pointer rounded border px-2 py-1 text-[10px] transition-all hover:shadow-sm ${bgProc} flex items-center gap-1 whitespace-nowrap`}
                                                            title={`${alias} - ${tanque.proceso?.nombre || 'Inactiva'} - ${formatHora(tanque.tiempo)}`}
                                                        >
                                                            <span
                                                                className={`font-semibold ${colorProc}`}
                                                            >
                                                                {alias}
                                                            </span>
                                                            {tieneSolicitud && (
                                                                <TestTube className="h-2.5 w-2.5 text-blue-500" />
                                                            )}
                                                            {estaProduccion && (
                                                                <div className="h-1.5 w-1.5 rounded-full bg-green-500" />
                                                            )}
                                                        </div>
                                                    );
                                                },
                                            )}
                                        </div>
                                    </div>
                                );
                            },
                        )}
                    </div>
                </CardContent>
            </Card>

            <Dialog
                open={!!selectedTanque}
                onOpenChange={() => setSelectedTanque(null)}
            >
                <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle className="mx-2 flex items-center justify-between gap-2 text-sm">
                            <div className="flex items-center gap-2">
                                <Package className="h-4 w-4" />
                                {selectedTanque?.origen?.alias} - Detalles
                            </div>
                        </DialogTitle>
                    </DialogHeader>

                    {selectedTanque && (
                        <div className="max-h-[70vh] space-y-3 overflow-y-auto">
                            <div className="grid grid-cols-2 gap-3 text-xs">
                                <div>
                                    <p className="text-[11px] font-medium text-gray-600">
                                        Proceso
                                    </p>
                                    <Badge
                                        className={`mt-1 text-[10px] ${getProcesoBgColor(selectedTanque.proceso?.nombre)} ${getProcesoColor(selectedTanque.proceso?.nombre)}`}
                                    >
                                        {selectedTanque.proceso?.nombre ?? '—'}
                                    </Badge>
                                </div>
                                <div>
                                    <p className="text-[11px] font-medium text-gray-600">
                                        Etapa
                                    </p>
                                    <p className="mt-1">
                                        {selectedTanque.etapa?.nombre ?? '—'}
                                    </p>
                                </div>
                                <div>
                                    <p className="text-[11px] font-medium text-gray-600">
                                        Usuario
                                    </p>
                                    <div className="mt-1 flex items-center gap-1">
                                        <User className="h-3 w-3" />
                                        <span>
                                            {selectedTanque.user?.name ?? '—'}
                                        </span>
                                    </div>
                                </div>
                                <div>
                                    <p className="text-[11px] font-medium text-gray-600">
                                        Hora
                                    </p>
                                    <div className="mt-1 flex items-center gap-1">
                                        <Clock className="h-3 w-3" />
                                        <span>
                                            {formatFechaCompleta(
                                                selectedTanque.tiempo,
                                            )}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            {selectedTanque.observaciones && (
                                <div>
                                    <p className="flex items-center gap-1 text-[11px] font-medium text-gray-600">
                                        <FileText className="h-3 w-3" />
                                        Observaciones
                                    </p>
                                    <p className="mt-1 rounded bg-gray-50 p-2 text-xs">
                                        {selectedTanque.observaciones}
                                    </p>
                                </div>
                            )}

                            {selectedTanque.detalles &&
                                selectedTanque.detalles.length > 0 && (
                                    <div>
                                        <p className="mb-2 text-[11px] font-medium text-gray-600">
                                            Detalles de Producción
                                        </p>
                                        <div className="space-y-2">
                                            {selectedTanque.detalles.map(
                                                (detalle, index) => {
                                                    const orpColor =
                                                        getOrpColor(
                                                            detalle.orp?.codigo,
                                                            index,
                                                        );
                                                    const bgBorder = orpColor
                                                        .split(' ')
                                                        .filter((c) =>
                                                            c.startsWith('bg-') ||
                                                            c.startsWith('border-'),
                                                        )
                                                        .join(' ');
                                                    const textClass = orpColor
                                                        .split(' ')
                                                        .find((c) => c.startsWith('text-')) || '';

                                                    const ProductoIcon =
                                                        getProductoIcon(
                                                            detalle.orp
                                                                ?.productoTerminado
                                                                ?.nombre_sap,
                                                        );
                                                    return (
                                                        <div
                                                            key={detalle.id}
                                                            className={`rounded border p-2 text-xs ${bgBorder} ${textClass} dark:text-gray-100 dark:bg-neutral-800 dark:border-neutral-700`}
                                                        >
                                                            <div className="mb-1 flex items-start justify-between">
                                                                <div className="flex items-center gap-2">
                                                                    <ProductoIcon
                                                                        className="h-3 w-3"
                                                                        onClick={() =>
                                                                            router.visit(
                                                                                route(
                                                                                    'orps.reporte.show',
                                                                                    detalle
                                                                                        .orp
                                                                                        .id,
                                                                                ),
                                                                            )
                                                                        }
                                                                    />
                                                                    <div>
                                                                        <span className="font-medium">
                                                                            ORP:{' '}
                                                                            {detalle
                                                                                .orp
                                                                                ?.codigo ??
                                                                                'N/A'}
                                                                        </span>
                                                                        <p className="mt-0.5 text-[11px] text-gray-600 dark:text-gray-300">
                                                                            {detalle
                                                                                .orp
                                                                                ?.productoTerminado
                                                                                ?.nombre_sap ||
                                                                                'No especificado'}
                                                                        </p>
                                                                    </div>
                                                                </div>
                                                                <span className="rounded bg-blue-100 px-1.5 py-0.5 text-[10px] text-blue-800 dark:bg-neutral-700 dark:text-gray-100">
                                                                    #{index + 1}
                                                                </span>
                                                            </div>
                                                            <div className="mt-1 grid grid-cols-2 gap-2 text-[11px]">
                                                                <div>
                                                                    <span className="text-gray-600 dark:text-gray-300">
                                                                        Preparación:
                                                                    </span>
                                                                    <span className="ml-1 font-medium dark:text-gray-100">
                                                                        {
                                                                            detalle.preparacion
                                                                        }
                                                                    </span>
                                                                </div>
                                                                <div className="text-right">
                                                                    <span className="text-gray-600 dark:text-gray-300">
                                                                        Cantidad:
                                                                    </span>
                                                                    <span className="ml-1 font-medium dark:text-gray-100">
                                                                        {
                                                                            detalle.cantidad
                                                                        }{' '}
                                                                        L
                                                                    </span>
                                                                </div>
                                                            </div>

                                                            {onCompletarORP &&
                                                                onPausarORP &&
                                                                hasPermission(
                                                                    'u_dashboardPlanta',
                                                                ) && (
                                                                    <div className="mt-2 flex justify-end gap-2">
                                                                        <Button
                                                                            size="sm"
                                                                            variant="secondary"
                                                                            className="h-6 text-xs"
                                                                            onClick={() => {
                                                                                onPausarORP(
                                                                                    detalle
                                                                                        .orp
                                                                                        ?.id,
                                                                                );
                                                                                setSelectedTanque(
                                                                                    null,
                                                                                );
                                                                            }}
                                                                        >
                                                                            Pausar
                                                                        </Button>

                                                                        <Button
                                                                            size="sm"
                                                                            variant="destructive"
                                                                            className="h-6 text-xs"
                                                                            onClick={() => {
                                                                                onCompletarORP(
                                                                                    detalle
                                                                                        .orp
                                                                                        ?.id,
                                                                                );
                                                                                setSelectedTanque(
                                                                                    null,
                                                                                );
                                                                            }}
                                                                        >
                                                                            Terminar
                                                                            ORP
                                                                        </Button>
                                                                    </div>
                                                                )}
                                                        </div>
                                                    );
                                                },
                                            )}
                                        </div>
                                    </div>
                                )}

                            {selectedTanque.analisis_linea && (
                                <div>
                                    <p className="mb-2 flex items-center gap-1 text-[11px] font-medium text-gray-600">
                                        <TestTube className="h-3 w-3" />
                                        Solicitud de Análisis
                                    </p>
                                    <div className="rounded bg-blue-50 p-2 text-xs">
                                        <div className="grid grid-cols-2 gap-2">
                                            <div className="flex justify-between">
                                                <span className="text-gray-600">
                                                    Estado:
                                                </span>
                                                <Badge
                                                    variant={
                                                        selectedTanque.analisis_linea?.estado?.nombre?.toLowerCase() ===
                                                        'pendiente'
                                                            ? 'secondary'
                                                            : 'default'
                                                    }
                                                >
                                                    {selectedTanque
                                                        .analisis_linea?.estado
                                                        ?.nombre ?? 'Pendiente'}
                                                </Badge>
                                            </div>
                                            <div className="flex justify-between">
                                                <span className="text-gray-600">
                                                    Solicitado por:
                                                </span>
                                                <span>
                                                    {selectedTanque
                                                        .analisis_linea?.user
                                                        ?.name ?? '—'}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}

                            <div className="flex gap-2 pt-2">
                                {onSolicitarAnalisis &&
                                    hasPermission(
                                        'solicitar_analisisLinea',
                                    ) && (
                                        <Button
                                            size="sm"
                                            onClick={() => {
                                                onSolicitarAnalisis(
                                                    selectedTanque.id,
                                                );
                                                setSelectedTanque(null);
                                            }}
                                            className="flex-1"
                                        >
                                            <FlaskConical className="mr-1 h-4 w-4" />
                                            {selectedTanque.analisis_linea
                                                ? 'Nuevo Análisis'
                                                : 'Solicitar Análisis'}
                                        </Button>
                                    )}
                                <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => setSelectedTanque(null)}
                                    className="flex-1"
                                >
                                    Cerrar
                                </Button>
                                {selectedTanque &&
                                    onCambiarEstado &&
                                    hasPermission('u_dashboardPlanta') && (
                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    className="h-6 w-6 p-0"
                                                >
                                                    <MoreHorizontal className="h-4 w-4" />
                                                </Button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent
                                                align="end"
                                                className="w-48"
                                            >
                                                <DropdownMenuItem
                                                    onClick={() => {
                                                        onCambiarEstado(
                                                            selectedTanque
                                                                .origen!.id,
                                                            'Vacio Limpio',
                                                        );
                                                        setSelectedTanque(null);
                                                    }}
                                                >
                                                    <CheckCircle className="mr-2 h-4 w-4 text-green-600" />
                                                    Vacio Limpio
                                                </DropdownMenuItem>
                                                <DropdownMenuItem
                                                    onClick={() => {
                                                        onCambiarEstado(
                                                            selectedTanque
                                                                .origen!.id,
                                                            'Vacio Sucio',
                                                        );
                                                        setSelectedTanque(null);
                                                    }}
                                                >
                                                    <AlertTriangle className="mr-2 h-4 w-4 text-orange-600" />
                                                    Vacio Sucio
                                                </DropdownMenuItem>
                                                <DropdownMenuItem
                                                    onClick={() => {
                                                        onCambiarEstado(
                                                            selectedTanque
                                                                .origen!.id,
                                                            'En Limpieza',
                                                        );
                                                        setSelectedTanque(null);
                                                    }}
                                                >
                                                    <Sparkles className="mr-2 h-4 w-4 text-blue-600" />
                                                    En Limpieza
                                                </DropdownMenuItem>
                                                <DropdownMenuItem
                                                    onClick={() => {
                                                        onCambiarEstado(
                                                            selectedTanque
                                                                .origen!.id,
                                                            'En Mantenimiento',
                                                        );
                                                        setSelectedTanque(null);
                                                    }}
                                                >
                                                    <Wrench className="mr-2 h-4 w-4 text-yellow-600" />
                                                    En Mantenimiento
                                                </DropdownMenuItem>
                                                <DropdownMenuItem
                                                    onClick={() => {
                                                        onCambiarEstado(
                                                            selectedTanque
                                                                .origen!.id,
                                                            'Almacenando',
                                                        );
                                                        setSelectedTanque(null);
                                                    }}
                                                >
                                                    <Package className="mr-2 h-4 w-4 text-gray-600" />
                                                    Almacenando
                                                </DropdownMenuItem>
                                            </DropdownMenuContent>
                                        </DropdownMenu>
                                    )}
                            </div>
                        </div>
                    )}
                </DialogContent>
            </Dialog>
        </>
    );
}
