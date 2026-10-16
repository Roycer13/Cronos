import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import {
    Beaker,
    CheckSquare,
    Copy,
    Droplets,
    Factory,
    FlaskConical,
    Gauge,
    MoveRight,
    Package,
    Plus,
    RefreshCw,
    Scale,
    Square,
    Trash2,
} from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';

// Interfaces
interface Orp {
    id: number;
    codigo: string;
    nombre_sap?: string;
    lote?: string;
    productoTerminado?: {
        codigo_sap: string;
        nombre: string;
    };
}

interface Origen {
    id: number;
    alias: string;
    descripcion?: string;
    tipo?: string;
    detalles?: any[];
}

interface Estado {
    id: number;
    nombre: string;
}

interface EstadoDetalle {
    id?: number;
    orp_id: number;
    cantidad: number;
    preparacion: string;
    orp?: Orp;
}

interface GrupoEnvasadoras {
    id: string;
    nombre: string;
    envasadoras: string[];
    envasadorasIds?: number[];
}

interface Cabezal {
    id: number;
    alias: string;
    descripcion?: string;
    selected: boolean;
}

interface ModalProduccionProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    tanque: any;
    origenes: Origen[];
    etapas: Estado[];
    orpsDisponibles: Orp[];
    gruposEnvasadoras: GrupoEnvasadoras[];
    onSubmit?: (data: any) => void;
    onModificar?: (data: any) => void;
    modo?: 'produccion' | 'almacen';
    onAlmacenar?: (data: any) => void;
    orpsAlmacen?: Orp[];
}

// Funciones de normalización y validación
const normalizarPreparacion = (valor: string): string => {
    return valor.trim().replace(/\s+/g, '').replace(/,/g, '.');
};

const esPreparacionValida = (valor: string): boolean => {
    const normalizado = normalizarPreparacion(valor);
    if (normalizado === '') return false;
    const numeroDecimal = /^\d+(\.\d+)?$/;
    const rango = /^\d+(\.\d+)?-\d+(\.\d+)?$/;
    return numeroDecimal.test(normalizado) || rango.test(normalizado);
};

export default function ModalProduccion({
    open,
    onOpenChange,
    tanque,
    origenes: origenesProp,
    etapas: etapasProp,
    orpsDisponibles: orpsProp,
    gruposEnvasadoras: gruposProp,
    onSubmit,
    onModificar,
    modo = 'produccion',
    onAlmacenar,
    orpsAlmacen,
}: ModalProduccionProps) {
    // Snapshot: se congela al abrir
    const [snapshot, setSnapshot] = useState({
        origenes: origenesProp,
        etapas: etapasProp,
        orpsDisponibles: orpsProp,
        gruposEnvasadoras: gruposProp,
    });

    useEffect(() => {
        if (open) {
            setSnapshot({
                origenes: origenesProp,
                etapas: etapasProp,
                orpsDisponibles: orpsProp,
                gruposEnvasadoras: gruposProp,
            });
        }
    }, [open, origenesProp, etapasProp, orpsProp, gruposProp]);

    const { origenes, etapas, orpsDisponibles, gruposEnvasadoras } = snapshot;

    // Estados internos
    const [modoProduccion, setModoProduccion] = useState<
        'mover' | 'modificar' | 'pasteurizar'
    >('mover');
    const [tipoDestino, setTipoDestino] = useState<'origen' | 'grupo'>(
        'origen',
    );
    const [origenSeleccionado, setOrigenSeleccionado] = useState<number | null>(
        null,
    );
    const [pasteurizadorSeleccionado, setPasteurizadorSeleccionado] = useState<
        number | null
    >(null);
    const [grupoSeleccionado, setGrupoSeleccionado] = useState<string | null>(
        null,
    );
    const [etapaSeleccionada, setEtapaSeleccionada] = useState<number | null>(
        null,
    );
    const [detalles, setDetalles] = useState<EstadoDetalle[]>([]);
    const [orpSeleccionada, setOrpSeleccionada] = useState<number | null>(null);
    const [preparacionSeleccionada, setPreparacionSeleccionada] =
        useState<string>('');
    const [cabezalesDelGrupo, setCabezalesDelGrupo] = useState<Cabezal[]>([]);

    const esModoAlmacen = modo === 'almacen';
    const orpsParaMostrar = esModoAlmacen ? orpsAlmacen || [] : orpsDisponibles;

    // Pasteurizadores y destinos
    const pasteurizadores = useMemo(() => {
        return origenes
            .filter(
                (o) =>
                    o.alias.toUpperCase().startsWith('PAST') ||
                    o.alias.toUpperCase().startsWith('UHT') ||
                    o.descripcion?.toUpperCase().includes('PASTEURIZADOR') ||
                    o.descripcion?.toUpperCase().includes('ESTERILIZADOR'),
            )
            .sort((a, b) => a.alias.localeCompare(b.alias));
    }, [origenes]);

    const tanquesDestinoPasteurizar = useMemo(() => {
        return origenes
            .filter(
                (o) =>
                    o.id !== tanque?.origen?.id &&
                    !o.alias.toUpperCase().startsWith('PAST') &&
                    !o.alias.toUpperCase().startsWith('UHT') &&
                    !o.descripcion?.toUpperCase().includes('PASTEURIZADOR') &&
                    !o.descripcion?.toUpperCase().includes('ESTERILIZADOR') &&
                    !(
                        o.alias.toLowerCase().includes('env') ||
                        o.descripcion?.toLowerCase().includes('env') ||
                        gruposEnvasadoras.some((g) =>
                            g.envasadoras.includes(o.alias),
                        )
                    ),
            )
            .sort((a, b) => a.alias.localeCompare(b.alias));
    }, [origenes, tanque, gruposEnvasadoras]);

    // Grupo keywords
    const grupoKeywords: Record<string, string[]> = {
        'grupo-htst1': ['HTST'],
        'grupo-uht': ['UHT', 'CD', 'JK'],
        'grupo-vasos': ['VASOS', 'V'],
        'grupo-soya': ['SOYA', 'L'],
    };

    const gruposConIds = useMemo(() => {
        return gruposEnvasadoras.map((grupo) => {
            if (grupo.envasadorasIds) return grupo;
            const keywords = grupoKeywords[grupo.id] || [grupo.nombre];
            const ids = origenes
                .filter(
                    (origen) =>
                        grupo.envasadoras.includes(origen.alias) &&
                        keywords.some((keyword) =>
                            origen.descripcion
                                ?.toUpperCase()
                                .includes(keyword.toUpperCase()),
                        ),
                )
                .map((origen) => origen.id);
            return {
                ...grupo,
                envasadorasIds: ids,
                envasadoras: undefined,
            };
        });
    }, [gruposEnvasadoras, origenes]);

    const etapaMezcla = useMemo(() => {
        return etapas.find((e) => e.nombre.toLowerCase().includes('mezcla'));
    }, [etapas]);

    // Inicializar con datos del tanque origen
    useEffect(() => {
        if (tanque) {
            if (tanque.detalles && tanque.detalles.length > 0) {
                setDetalles(
                    tanque.detalles.map((detalle: any) => ({
                        id: detalle.id,
                        orp_id: detalle.orp_id,
                        cantidad: detalle.cantidad || 0,
                        preparacion: detalle.preparacion || 'Producción',
                        orp:
                            orpsProp.find((o) => o.id === detalle.orp_id) ||
                            detalle.orp,
                    })),
                );
            }
            if (tanque.etapa?.id) {
                setEtapaSeleccionada(tanque.etapa.id);
            }
            setOrigenSeleccionado(tanque.origen?.id || null);
        }
    }, [tanque, etapas, orpsProp]);

    // Asignar automáticamente etapa Mezcla en modo almacén
    useEffect(() => {
        if (esModoAlmacen && etapaMezcla) {
            setEtapaSeleccionada(etapaMezcla.id);
        }
    }, [esModoAlmacen, etapaMezcla]);

    // Al seleccionar tanque destino en mover: combinar ORPs del origen y destino
    useEffect(() => {
        if (
            modoProduccion === 'mover' &&
            tipoDestino === 'origen' &&
            origenSeleccionado
        ) {
            const destino = origenes.find((o) => o.id === origenSeleccionado);
            const detallesDestinoRaw = destino?.detalles || [];

            const detallesDestino: EstadoDetalle[] = detallesDestinoRaw.map(
                (d: any) => ({
                    id: d.id,
                    orp_id: d.orp_id,
                    cantidad: d.cantidad || 0,
                    preparacion: d.preparacion || 'Producción',
                    orp:
                        orpsDisponibles.find((o) => o.id === d.orp_id) ||
                        d.orp,
                }),
            );

            const detallesOrigenRaw = tanque?.detalles || [];
            const detallesOrigen: EstadoDetalle[] = detallesOrigenRaw.map(
                (d: any) => ({
                    id: d.id,
                    orp_id: d.orp_id,
                    cantidad: d.cantidad || 0,
                    preparacion: d.preparacion || 'Producción',
                    orp:
                        orpsDisponibles.find((o) => o.id === d.orp_id) ||
                        d.orp,
                }),
            );

            // Merge: si hay ORP con misma orp_id y misma preparacion, sumamos cantidades
            const merged: EstadoDetalle[] = [...detallesDestino];
            for (const o of detallesOrigen) {
                const idx = merged.findIndex(
                    (m) => m.orp_id === o.orp_id && m.preparacion === o.preparacion,
                );
                if (idx >= 0) {
                    merged[idx] = {
                        ...merged[idx],
                        cantidad: (merged[idx].cantidad || 0) + (o.cantidad || 0),
                    };
                } else {
                    merged.push(o);
                }
            }

            setDetalles(merged);
        }
    }, [origenSeleccionado, modoProduccion, tipoDestino, origenes, orpsDisponibles, tanque]);

    // Cargar detalles del tanque destino y combinarlos con los del origen en modo pasteurizar
    useEffect(() => {
        if (modoProduccion === 'pasteurizar' && origenSeleccionado && !esModoAlmacen) {
            const destino = origenes.find((o) => o.id === origenSeleccionado);
            const detallesDestino = destino?.detalles?.map((d: any) => ({
                id: d.id,
                orp_id: d.orp_id,
                cantidad: d.cantidad || 0,
                preparacion: d.preparacion || 'Producción',
                orp: orpsDisponibles.find((o) => o.id === d.orp_id) || d.orp,
            })) || [];

            const detallesOrigen = tanque?.detalles?.map((d: any) => ({
                id: d.id,
                orp_id: d.orp_id,
                cantidad: d.cantidad || 0,
                preparacion: d.preparacion || 'Producción',
                orp: orpsDisponibles.find((o) => o.id === d.orp_id) || d.orp,
            })) || [];

            // Fusionar: primeros los del destino, luego agregar o sumar los del origen
            const merged = [...detallesDestino];
            for (const o of detallesOrigen) {
                const idx = merged.findIndex(
                    (m) => m.orp_id === o.orp_id && m.preparacion === o.preparacion,
                );
                if (idx >= 0) {
                    merged[idx] = {
                        ...merged[idx],
                        cantidad: (merged[idx].cantidad || 0) + (o.cantidad || 0),
                    };
                } else {
                    merged.push(o);
                }
            }
            setDetalles(merged);
        }
    }, [modoProduccion, origenSeleccionado, origenes, orpsDisponibles, tanque, esModoAlmacen]);

    // Etapa automática al seleccionar grupo (solo para mover)
    useEffect(() => {
        if (!esModoAlmacen && tipoDestino === 'grupo') {
            const envasando = etapas.find((e) =>
                e.nombre.toLowerCase().includes('envasando'),
            );
            if (envasando) setEtapaSeleccionada(envasando.id);
        }
    }, [tipoDestino, etapas, esModoAlmacen]);

    // Cargar cabezales
    useEffect(() => {
        if (!esModoAlmacen && tipoDestino === 'grupo' && grupoSeleccionado) {
            const grupo = gruposConIds.find((g) => g.id === grupoSeleccionado);
            if (grupo && grupo.envasadorasIds) {
                const nuevosCabezales = grupo.envasadorasIds
                    .map((id) => {
                        const origen = origenes.find((o) => o.id === id);
                        return {
                            id: origen?.id || 0,
                            alias: origen?.alias || '',
                            descripcion: origen?.descripcion,
                            selected: false,
                        };
                    })
                    .filter((cabezal) => cabezal.id !== 0);
                setCabezalesDelGrupo(nuevosCabezales);
            }
        } else {
            setCabezalesDelGrupo([]);
        }
    }, [grupoSeleccionado, tipoDestino, gruposConIds, origenes, esModoAlmacen]);

    // Agregar ORP
    const agregarOrp = () => {
        if (!orpSeleccionada) return;

        if (!esModoAlmacen && tipoDestino === 'grupo' && detalles.length >= 1) {
            alert('Solo se permite una ORP cuando el destino es envasadoras.');
            return;
        }

        if (!esModoAlmacen && !esPreparacionValida(preparacionSeleccionada)) {
            alert(
                'Formato de preparación inválido. Debe ser un número (ej. 1.5) o un rango (ej. 1-2).',
            );
            return;
        }

        const orpExistente = orpsDisponibles.find(
            (orp) => orp.id === orpSeleccionada,
        );
        if (!orpExistente) return;

        let preparacionFinal = preparacionSeleccionada;
        if (esModoAlmacen) {
            preparacionFinal = 'Almacen';
        } else {
            preparacionFinal = normalizarPreparacion(preparacionSeleccionada);
        }

        if (esModoAlmacen) {
            const existe = detalles.find((d) => d.orp_id === orpSeleccionada);
            if (existe) {
                alert('Esta ORP ya fue agregada.');
                return;
            }
        } else {
            const existe = detalles.find(
                (d) =>
                    d.orp_id === orpSeleccionada &&
                    d.preparacion === preparacionFinal,
            );
            if (existe) {
                alert('Esta ORP ya fue agregada con la misma preparación.');
                return;
            }
        }

        const nuevoDetalle: EstadoDetalle = {
            orp_id: orpSeleccionada,
            cantidad: 0,
            preparacion: preparacionFinal,
            orp: orpExistente,
        };

        setDetalles([...detalles, nuevoDetalle]);
        setOrpSeleccionada(null);
        setPreparacionSeleccionada('');
    };

    const quitarOrp = (index: number) => {
        setDetalles(detalles.filter((_, i) => i !== index));
    };

    const actualizarDetalle = (
        index: number,
        campo: keyof EstadoDetalle,
        valor: any,
    ) => {
        const nuevos = [...detalles];
        nuevos[index] = { ...nuevos[index], [campo]: valor };
        setDetalles(nuevos);
    };

    const toggleCabezal = (cabezalId: number) => {
        setCabezalesDelGrupo((prev) =>
            prev.map((cabezal) =>
                cabezal.id === cabezalId
                    ? { ...cabezal, selected: !cabezal.selected }
                    : cabezal,
            ),
        );
    };

    const cabezalesSeleccionados = cabezalesDelGrupo.filter((c) => c.selected);
    const todosCabezalesSeleccionados =
        cabezalesDelGrupo.length > 0 &&
        cabezalesDelGrupo.every((c) => c.selected);

    const toggleSeleccionarTodos = () => {
        const nuevoEstado = !todosCabezalesSeleccionados;
        setCabezalesDelGrupo((prev) =>
            prev.map((cabezal) => ({
                ...cabezal,
                selected: nuevoEstado,
            })),
        );
    };

    // Handlers
    const handleCambiarEtapa = () => {
        if (!etapaSeleccionada) return alert('Selecciona una etapa');
        onModificar?.({
            tipo: 'cambiar-etapa',
            etapa_id: etapaSeleccionada,
            detalles: detalles.map((d) => ({
                orp_id: d.orp_id,
                preparacion: d.preparacion,
                cantidad: d.cantidad,
            })),
        });
        onOpenChange(false);
    };

    const handleCambiarORPs = () => {
        if (detalles.length === 0) return alert('Agrega al menos un ORP');
        onModificar?.({
            tipo: 'cambiar-orps',
            detalles: detalles.map((d) => ({
                orp_id: d.orp_id,
                preparacion: d.preparacion,
                cantidad: d.cantidad,
            })),
        });
        onOpenChange(false);
    };

    const handleCambiarAmbos = () => {
        if (!etapaSeleccionada || detalles.length === 0)
            return alert('Selecciona etapa y al menos un ORP');
        onModificar?.({
            tipo: 'cambiar-ambos',
            etapa_id: etapaSeleccionada,
            detalles: detalles.map((d) => ({
                orp_id: d.orp_id,
                preparacion: d.preparacion,
                cantidad: d.cantidad,
            })),
        });
        onOpenChange(false);
    };

    const handleSubmit = () => {
        if (!etapaSeleccionada) return alert('Selecciona una etapa');
        if (detalles.length === 0) return alert('Agrega al menos una ORP');

        if (!esModoAlmacen) {
            if (tipoDestino === 'grupo' && detalles.length > 1)
                return alert('Para envasar solo se permite una ORP');

            for (const d of detalles) {
                if (!d.preparacion.trim()) return alert('Preparación vacía');
                if (!esPreparacionValida(d.preparacion))
                    return alert(`Preparación "${d.preparacion}" inválida`);
            }
        }

        if (esModoAlmacen) {
            // Como ya tenemos etapaSeleccionada asignada a Mezcla, la enviamos directamente
            onAlmacenar?.({
                etapa_id: etapaSeleccionada, // siempre será mezcla
                detalles: detalles.map((d) => ({
                    orp_id: d.orp_id,
                    cantidad: d.cantidad,
                })),
            });
            onOpenChange(false);
            return;
        }

        const datos: any = {
            etapa_id: etapaSeleccionada,
            detalles: detalles.map((d) => ({
                orp_id: d.orp_id,
                preparacion: d.preparacion,
                cantidad: d.cantidad,
            })),
            esNuevo: !tanque.detalles?.length,
        };

        if (modoProduccion === 'pasteurizar') {
            if (!pasteurizadorSeleccionado)
                return alert('Selecciona un pasteurizador');
            if (!origenSeleccionado)
                return alert('Selecciona el tanque destino');
            datos.pasteurizador_id = pasteurizadorSeleccionado;
            datos.origen_id = origenSeleccionado;
            onSubmit?.(datos);
            onOpenChange(false);
            return;
        }

        if (datos.esNuevo) {
            datos.origen_id = tanque.origen?.id;
            onSubmit?.(datos);
            onOpenChange(false);
        } else if (tipoDestino === 'origen' && origenSeleccionado) {
            datos.origen_id = origenSeleccionado;
            onSubmit?.(datos);
            onOpenChange(false);
        } else if (tipoDestino === 'grupo' && cabezalesSeleccionados.length) {
            datos.cabezales_ids = cabezalesSeleccionados.map((c) => c.id);
            const grupo = gruposConIds.find((g) => g.id === grupoSeleccionado);
            datos.grupo_nombre =
                grupo?.nombre ||
                gruposEnvasadoras.find((g) => g.id === grupoSeleccionado)
                    ?.nombre;
            onSubmit?.(datos);
            onOpenChange(false);
        } else {
            alert('Selecciona un destino válido');
        }
    };

    const getProductoIcon = (nombre?: string) => {
        if (!nombre) return Package;
        const n = nombre.toLowerCase();
        if (n.includes('leche')) return Droplets;
        if (n.includes('yogur')) return Beaker;
        if (n.includes('queso')) return Scale;
        if (n.includes('crema')) return Gauge;
        return Package;
    };

    const tieneCambiosEtapa = etapaSeleccionada !== (tanque.etapa?.id || null);
    const tieneCambiosOrps =
        JSON.stringify(detalles) !==
        JSON.stringify(
            tanque.detalles?.map((d: any) => ({
                orp_id: d.orp_id,
                preparacion: d.preparacion || 'Producción',
                cantidad: d.cantidad || 0,
            })) || [],
        );

    const tanquesDestinoFiltrados = origenes
        .filter(
            (o) =>
                o.id !== tanque.origen?.id &&
                !(
                    o.alias.toLowerCase().includes('env') ||
                    o.descripcion?.toLowerCase().includes('env') ||
                    gruposEnvasadoras.some((g) =>
                        g.envasadoras.includes(o.alias),
                    )
                ),
        )
        .sort((a, b) => a.alias.localeCompare(b.alias));

    const tanquesPorTipo = tanquesDestinoFiltrados.reduce(
        (acc, o) => {
            const tipo = o.tipo || 'General';
            if (!acc[tipo]) acc[tipo] = [];
            acc[tipo].push(o);
            return acc;
        },
        {} as Record<string, Origen[]>,
    );

    const esGrupoConOrp =
        !esModoAlmacen && tipoDestino === 'grupo' && detalles.length >= 1;

    // Render
    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-md">
                <DialogHeader className="pb-2">
                    <DialogTitle className="flex items-center gap-2 text-sm">
                        {esModoAlmacen ? (
                            <>
                                <Package className="h-4 w-4" />
                                Almacenar Producto
                            </>
                        ) : (
                            <>
                                <Factory className="h-4 w-4" />
                                {modoProduccion === 'mover'
                                    ? tanque.detalles?.length
                                        ? 'Mover Producción'
                                        : 'Iniciar Producción'
                                    : modoProduccion === 'pasteurizar'
                                      ? 'Pasteurizar Producto'
                                      : 'Modificar Producción'}
                            </>
                        )}
                    </DialogTitle>
                </DialogHeader>

                {esModoAlmacen ? (
                    /* ========== MODO ALMACÉN ========== */
                    <div className="space-y-3">
                        <div className="flex items-center gap-2 rounded bg-muted p-2 text-sm">
                            <Package className="h-4 w-4 text-primary" />
                            <span className="font-medium">Tanque:</span>
                            <Badge variant="secondary">
                                {tanque.origen?.alias}
                            </Badge>
                        </div>

                        {etapaMezcla && (
                            <div className="text-sm">
                                <span className="font-medium">Etapa:</span>{' '}
                                <Badge variant="outline">
                                    {etapaMezcla.nombre}
                                </Badge>
                            </div>
                        )}

                        <div className="space-y-2">
                            <div className="flex items-center justify-between">
                                <Label className="text-sm">
                                    ORPs a almacenar
                                </Label>
                                <div className="flex gap-1">
                                    <Select
                                        value={
                                            orpSeleccionada?.toString() || ''
                                        }
                                        onValueChange={(v) =>
                                            setOrpSeleccionada(Number(v))
                                        }
                                    >
                                        <SelectTrigger className="h-7 w-48 text-xs">
                                            <SelectValue placeholder="Seleccionar ORP" />
                                        </SelectTrigger>
                                        <SelectContent className="max-h-60 overflow-y-auto">
                                            {orpsParaMostrar.map((orp) => (
                                                <SelectItem
                                                    key={orp.id}
                                                    value={orp.id.toString()}
                                                    className="text-xs"
                                                >
                                                    {orp.codigo} -{' '}
                                                    {orp.productoTerminado
                                                        ?.nombre ||
                                                        orp.nombre_sap ||
                                                        'Sin producto'}{' '}
                                                    ({orp.lote})
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    <Button
                                        onClick={agregarOrp}
                                        size="sm"
                                        className="h-7 w-7 p-0"
                                        disabled={!orpSeleccionada}
                                    >
                                        <Plus className="h-3 w-3" />
                                    </Button>
                                </div>
                            </div>

                            <div className="max-h-40 space-y-1 overflow-y-auto">
                                {detalles.map((det, i) => {
                                    const orp =
                                        orpsDisponibles.find(
                                            (o) => o.id === det.orp_id,
                                        ) || det.orp;
                                    const Icon = getProductoIcon(
                                        orp?.productoTerminado?.nombre,
                                    );
                                    return (
                                        <Card key={i} className="p-1">
                                            <CardContent className="p-1">
                                                <div className="flex items-center justify-between">
                                                    <div className="flex min-w-0 flex-1 items-center gap-1">
                                                        <Icon className="h-3 w-3 text-muted-foreground" />
                                                        <div className="min-w-0 flex-1">
                                                            <div className="truncate text-xs font-medium">
                                                                {orp?.codigo}
                                                            </div>
                                                            <div className="truncate text-[10px] text-muted-foreground">
                                                                {orp?.nombre_sap ||
                                                                    orp
                                                                        ?.productoTerminado
                                                                        ?.nombre}
                                                            </div>
                                                        </div>
                                                    </div>
                                                    <div className="flex items-center gap-1">
                                                        <Input
                                                            type="number"
                                                            value={det.cantidad}
                                                            onChange={(e) =>
                                                                actualizarDetalle(
                                                                    i,
                                                                    'cantidad',
                                                                    Number(
                                                                        e.target
                                                                            .value,
                                                                    ),
                                                                )
                                                            }
                                                            className="h-6 w-16 text-xs"
                                                            min="0"
                                                            step="100"
                                                        />
                                                        <span className="w-6 text-xs">
                                                            L
                                                        </span>
                                                        <Button
                                                            variant="ghost"
                                                            size="sm"
                                                            onClick={() =>
                                                                quitarOrp(i)
                                                            }
                                                            className="h-6 w-6 p-0"
                                                        >
                                                            <Trash2 className="h-3 w-3 text-destructive" />
                                                        </Button>
                                                    </div>
                                                </div>
                                            </CardContent>
                                        </Card>
                                    );
                                })}
                            </div>
                            {detalles.length === 0 && (
                                <div className="rounded border-2 border-dashed py-4 text-center text-xs text-muted-foreground">
                                    <Package className="mx-auto mb-1 h-5 w-5" />
                                    <p>No hay ORPs seleccionadas</p>
                                </div>
                            )}
                        </div>

                        <div className="flex justify-end gap-2 border-t pt-2">
                            <Button
                                variant="outline"
                                onClick={() => onOpenChange(false)}
                                size="sm"
                            >
                                Cancelar
                            </Button>
                            <Button onClick={handleSubmit} size="sm">
                                Almacenar
                            </Button>
                        </div>
                    </div>
                ) : (
                    /* ========== MODO PRODUCCIÓN ========== */
                    <div className="space-y-3">
                        {/* Selector de Modo */}
                        <div className="mb-2 flex gap-2">
                            <Button
                                variant={
                                    modoProduccion === 'mover'
                                        ? 'default'
                                        : 'outline'
                                }
                                onClick={() => setModoProduccion('mover')}
                                className="h-8 flex-1 text-xs"
                            >
                                <MoveRight className="mr-1 h-3 w-3" />
                                Mover
                            </Button>
                            <Button
                                variant={
                                    modoProduccion === 'modificar'
                                        ? 'default'
                                        : 'outline'
                                }
                                onClick={() => setModoProduccion('modificar')}
                                className="h-8 flex-1 text-xs"
                            >
                                <RefreshCw className="mr-1 h-3 w-3" />
                                Modificar
                            </Button>
                            <Button
                                variant={
                                    modoProduccion === 'pasteurizar'
                                        ? 'default'
                                        : 'outline'
                                }
                                onClick={() => setModoProduccion('pasteurizar')}
                                className="h-8 flex-1 text-xs"
                            >
                                <FlaskConical className="mr-1 h-3 w-3" />
                                Pasteurizar
                            </Button>
                        </div>

                        {/* ========== MODO PASTEURIZAR ========== */}
                        {modoProduccion === 'pasteurizar' && (
                            <>
                                <div className="flex items-center gap-2 rounded bg-muted p-2 text-sm">
                                    <Package className="h-4 w-4 text-primary" />
                                    <span className="font-medium">
                                        Tanque Origen:
                                    </span>
                                    <Badge variant="secondary">
                                        {tanque.origen?.alias}
                                    </Badge>
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="pasteurizador" className="text-sm">
                                        Pasteurizador
                                    </Label>
                                    <Select
                                        value={
                                            pasteurizadorSeleccionado?.toString() ||
                                            ''
                                        }
                                        onValueChange={(v) =>
                                            setPasteurizadorSeleccionado(
                                                Number(v),
                                            )
                                        }
                                    >
                                        <SelectTrigger id="pasteurizador" className="h-8 text-sm">
                                            <SelectValue placeholder="Selecciona pasteurizador" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {pasteurizadores.map((p) => (
                                                <SelectItem
                                                    key={p.id}
                                                    value={p.id.toString()}
                                                    className="text-sm"
                                                >
                                                    {p.alias} - {p.descripcion}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="tanque-destino" className="text-sm">
                                        Tanque Destino
                                    </Label>
                                    <Select
                                        value={
                                            origenSeleccionado?.toString() || ''
                                        }
                                        onValueChange={(v) =>
                                            setOrigenSeleccionado(Number(v))
                                        }
                                    >
                                        <SelectTrigger id="tanque-destino" className="h-8 text-sm">
                                            <SelectValue placeholder="Selecciona tanque destino" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {tanquesDestinoPasteurizar.map(
                                                (t) => (
                                                    <SelectItem
                                                        key={t.id}
                                                        value={t.id.toString()}
                                                        className="text-sm"
                                                    >
                                                        {t.alias} -{' '}
                                                        {t.descripcion}
                                                    </SelectItem>
                                                ),
                                            )}
                                        </SelectContent>
                                    </Select>
                                </div>

                                {/* Etapa del tanque destino (sin valor por defecto) */}
                                <div className="space-y-2">
                                    <Label htmlFor="etapa-destino" className="text-sm">
                                        Etapa del tanque destino
                                    </Label>
                                    <Select
                                        value={etapaSeleccionada?.toString() || ''}
                                        onValueChange={(v) =>
                                            setEtapaSeleccionada(Number(v))
                                        }
                                    >
                                        <SelectTrigger id="etapa-destino" className="h-8 text-sm">
                                            <SelectValue placeholder="Selecciona una etapa" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {etapas.map((e) => (
                                                <SelectItem
                                                    key={e.id}
                                                    value={e.id.toString()}
                                                    className="text-sm"
                                                >
                                                    {e.nombre}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>

                                <div className="space-y-2">
                                    <div className="flex items-center justify-between">
                                        <Label className="text-sm">
                                            ORPs (Destino + Origen)
                                        </Label>
                                        <div className="flex gap-1">
                                            <Select
                                                value={
                                                    orpSeleccionada?.toString() ||
                                                    ''
                                                }
                                                onValueChange={(v) =>
                                                    setOrpSeleccionada(
                                                        Number(v),
                                                    )
                                                }
                                            >
                                                <SelectTrigger className="h-7 w-40 text-xs">
                                                    <SelectValue placeholder="ORP adicional" />
                                                </SelectTrigger>
                                                <SelectContent className="max-h-60 overflow-y-auto">
                                                    {orpsDisponibles.map(
                                                        (orp) => (
                                                            <SelectItem
                                                                key={orp.id}
                                                                value={orp.id.toString()}
                                                                className="text-xs"
                                                            >
                                                                {orp.codigo} -{' '}
                                                                {orp
                                                                    .productoTerminado
                                                                    ?.nombre ||
                                                                    orp.nombre_sap ||
                                                                    'Sin producto'}{' '}
                                                                ({orp.lote})
                                                            </SelectItem>
                                                        ),
                                                    )}
                                                </SelectContent>
                                            </Select>
                                            <Input
                                                type="text"
                                                value={
                                                    preparacionSeleccionada
                                                }
                                                onChange={(e) =>
                                                    setPreparacionSeleccionada(
                                                        e.target.value,
                                                    )
                                                }
                                                onBlur={() =>
                                                    setPreparacionSeleccionada(
                                                        normalizarPreparacion(
                                                            preparacionSeleccionada,
                                                        ),
                                                    )
                                                }
                                                className="h-7 w-24 text-xs"
                                                placeholder="Prep."
                                            />
                                            <Button
                                                onClick={agregarOrp}
                                                size="sm"
                                                className="h-7 w-7 p-0"
                                                disabled={!orpSeleccionada}
                                            >
                                                <Plus className="h-3 w-3" />
                                            </Button>
                                        </div>
                                    </div>

                                    <div className="max-h-32 space-y-1 overflow-y-auto rounded-md border p-2">
                                        {detalles.length > 0 ? (
                                            detalles.map((det, i) => {
                                                const orp =
                                                    orpsDisponibles.find(
                                                        (o) =>
                                                            o.id ===
                                                            det.orp_id,
                                                    ) || det.orp;
                                                const Icon =
                                                    getProductoIcon(
                                                        orp
                                                            ?.productoTerminado
                                                            ?.nombre,
                                                    );
                                                return (
                                                    <Card
                                                        key={i}
                                                        className="p-1"
                                                    >
                                                        <CardContent className="p-1">
                                                            <div className="flex items-center justify-between">
                                                                <div className="flex min-w-0 flex-1 items-center gap-1">
                                                                    <Icon className="h-3 w-3 text-muted-foreground" />
                                                                    <div className="min-w-0 flex-1">
                                                                        <div className="truncate text-xs font-medium">
                                                                            {
                                                                                orp?.codigo
                                                                            }{' '}
                                                                            -{' '}
                                                                            {
                                                                                det.preparacion
                                                                            }
                                                                        </div>
                                                                        <div className="text-[10px] text-muted-foreground">
                                                                            {orp?.productoTerminado?.nombre?.substring(
                                                                                0,
                                                                                50,
                                                                            )}
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                                <div className="flex items-center gap-1">
                                                                    <Input
                                                                        type="number"
                                                                        value={
                                                                            det.cantidad
                                                                        }
                                                                        onChange={(
                                                                            e,
                                                                        ) =>
                                                                            actualizarDetalle(
                                                                                i,
                                                                                'cantidad',
                                                                                Number(
                                                                                    e
                                                                                        .target
                                                                                        .value,
                                                                                ),
                                                                            )
                                                                        }
                                                                        className="h-6 w-14 text-xs"
                                                                        min="0"
                                                                        step="100"
                                                                    />
                                                                    <span className="w-5 text-xs">
                                                                        L
                                                                    </span>
                                                                    <Button
                                                                        variant="ghost"
                                                                        size="sm"
                                                                        onClick={() =>
                                                                            quitarOrp(
                                                                                i,
                                                                            )
                                                                        }
                                                                        className="h-6 w-6 p-0"
                                                                    >
                                                                        <Trash2 className="h-3 w-3 text-destructive" />
                                                                    </Button>
                                                                </div>
                                                            </div>
                                                        </CardContent>
                                                    </Card>
                                                );
                                            })
                                        ) : (
                                            <p className="text-center text-xs text-muted-foreground">
                                                No hay ORPs seleccionadas
                                            </p>
                                        )}
                                    </div>
                                </div>

                                <div className="flex justify-end gap-2 border-t pt-4">
                                    <Button
                                        variant="outline"
                                        onClick={() => onOpenChange(false)}
                                        size="sm"
                                    >
                                        Cancelar
                                    </Button>
                                    <Button
                                        onClick={handleSubmit}
                                        size="sm"
                                        disabled={
                                            !pasteurizadorSeleccionado ||
                                            !origenSeleccionado ||
                                            !etapaSeleccionada ||
                                            detalles.length === 0
                                        }
                                    >
                                        <FlaskConical className="mr-1 h-3 w-3" />
                                        Pasteurizar
                                    </Button>
                                </div>
                            </>
                        )}

                        {/* ========== MODO MOVER ========== */}
                        {modoProduccion === 'mover' && (
                            <>
                                <div className="flex items-center gap-2 rounded bg-muted p-2 text-sm">
                                    <Package className="h-4 w-4 text-primary" />
                                    <span className="font-medium">Desde:</span>
                                    <Badge variant="secondary">
                                        {tanque.origen?.alias}
                                    </Badge>
                                </div>

                                {tanque.detalles?.length > 0 && (
                                    <div className="space-y-2">
                                        <Label className="text-sm">
                                            Destino
                                        </Label>
                                        <div className="flex gap-1">
                                            <Button
                                                variant={
                                                    tipoDestino === 'origen'
                                                        ? 'default'
                                                        : 'outline'
                                                }
                                                onClick={() =>
                                                    setTipoDestino('origen')
                                                }
                                                className="h-8 flex-1 text-xs"
                                            >
                                                <Package className="mr-1 h-3 w-3" />
                                                Tanque
                                            </Button>
                                            <Button
                                                variant={
                                                    tipoDestino === 'grupo'
                                                        ? 'default'
                                                        : 'outline'
                                                }
                                                onClick={() =>
                                                    setTipoDestino('grupo')
                                                }
                                                className="h-8 flex-1 text-xs"
                                            >
                                                <Factory className="mr-1 h-3 w-3" />
                                                Envasadoras
                                            </Button>
                                        </div>

                                        {tipoDestino === 'origen' && (
                                            <div>
                                                <Label htmlFor="origen">
                                                    Seleccionar Tanque Destino
                                                </Label>
                                                <Select
                                                    value={
                                                        origenSeleccionado?.toString() ||
                                                        ''
                                                    }
                                                    onValueChange={(v) =>
                                                        setOrigenSeleccionado(
                                                            Number(v),
                                                        )
                                                    }
                                                >
                                                    <SelectTrigger
                                                        id="origen"
                                                        className="h-8 text-sm"
                                                    >
                                                        <SelectValue placeholder="Selecciona un tanque" />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        {Object.entries(
                                                            tanquesPorTipo,
                                                        ).map(
                                                            ([tipo, lista]) => (
                                                                <div key={tipo}>
                                                                    {Object.keys(
                                                                        tanquesPorTipo,
                                                                    ).length >
                                                                        1 && (
                                                                        <div className="bg-muted px-2 py-1 text-xs font-semibold">
                                                                            {
                                                                                tipo
                                                                            }
                                                                        </div>
                                                                    )}
                                                                    {lista.map(
                                                                        (o) => (
                                                                            <SelectItem
                                                                                key={
                                                                                    o.id
                                                                                }
                                                                                value={o.id.toString()}
                                                                                className="text-sm"
                                                                            >
                                                                                {
                                                                                    o.alias
                                                                                }{' '}
                                                                                -{' '}
                                                                                {
                                                                                    o.descripcion
                                                                                }
                                                                            </SelectItem>
                                                                        ),
                                                                    )}
                                                                </div>
                                                            ),
                                                        )}
                                                    </SelectContent>
                                                </Select>
                                            </div>
                                        )}

                                        {tipoDestino === 'grupo' && (
                                            <div>
                                                <Label htmlFor="grupo">
                                                    Seleccionar Grupo
                                                </Label>
                                                <Select
                                                    value={
                                                        grupoSeleccionado || ''
                                                    }
                                                    onValueChange={
                                                        setGrupoSeleccionado
                                                    }
                                                >
                                                    <SelectTrigger
                                                        id="grupo"
                                                        className="h-8 text-sm"
                                                    >
                                                        <SelectValue placeholder="Selecciona un grupo" />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        {gruposConIds.map(
                                                            (g) => (
                                                                <SelectItem
                                                                    key={g.id}
                                                                    value={g.id}
                                                                    className="text-sm"
                                                                >
                                                                    {g.nombre} (
                                                                    {g
                                                                        .envasadorasIds
                                                                        ?.length ||
                                                                        0}{' '}
                                                                    cabezales)
                                                                </SelectItem>
                                                            ),
                                                        )}
                                                    </SelectContent>
                                                </Select>
                                            </div>
                                        )}
                                    </div>
                                )}

                                {tipoDestino === 'grupo' &&
                                    cabezalesDelGrupo.length > 0 && (
                                        <div className="space-y-2">
                                            <div className="flex items-center justify-between">
                                                <Label className="text-sm">
                                                    Seleccionar Cabezales
                                                </Label>
                                                <div className="flex items-center gap-2">
                                                    <Button
                                                        variant="outline"
                                                        size="sm"
                                                        className="h-6 text-xs"
                                                        onClick={toggleSeleccionarTodos}
                                                    >
                                                        {todosCabezalesSeleccionados ? (
                                                            <CheckSquare className="mr-1 h-3 w-3" />
                                                        ) : (
                                                            <Square className="mr-1 h-3 w-3" />
                                                        )}
                                                        {todosCabezalesSeleccionados
                                                            ? 'Desmarcar Todos'
                                                            : 'Seleccionar Todos'}
                                                    </Button>
                                                    <Badge
                                                        variant="secondary"
                                                        className="text-xs"
                                                    >
                                                        {
                                                            cabezalesSeleccionados.length
                                                        }
                                                        /
                                                        {
                                                            cabezalesDelGrupo.length
                                                        }
                                                    </Badge>
                                                </div>
                                            </div>
                                            <div className="max-h-32 space-y-1 overflow-y-auto rounded-md border p-2">
                                                {cabezalesDelGrupo.map((c) => (
                                                    <div
                                                        key={c.id}
                                                        className="flex items-center space-x-2 py-1"
                                                    >
                                                        <Checkbox
                                                            id={`cabezal-${c.id}`}
                                                            checked={c.selected}
                                                            onCheckedChange={() =>
                                                                toggleCabezal(
                                                                    c.id,
                                                                )
                                                            }
                                                        />
                                                        <Label
                                                            htmlFor={`cabezal-${c.id}`}
                                                            className="flex-1 cursor-pointer text-sm font-normal"
                                                        >
                                                            {c.alias}
                                                            {c.descripcion && (
                                                                <span className="ml-1 text-xs text-muted-foreground">
                                                                    -{' '}
                                                                    {
                                                                        c.descripcion
                                                                    }
                                                                </span>
                                                            )}
                                                        </Label>
                                                    </div>
                                                ))}
                                            </div>
                                            {cabezalesSeleccionados.length ===
                                                0 && (
                                                <p className="text-xs text-amber-600 dark:text-amber-500">
                                                    Selecciona al menos un
                                                    cabezal
                                                </p>
                                            )}
                                        </div>
                                    )}

                                <div>
                                    <Label htmlFor="etapa">
                                        Etapa de Producción
                                    </Label>
                                    <Select
                                        value={
                                            etapaSeleccionada?.toString() || ''
                                        }
                                        onValueChange={(v) =>
                                            setEtapaSeleccionada(Number(v))
                                        }
                                    >
                                        <SelectTrigger
                                            id="etapa"
                                            className="h-8 text-sm"
                                        >
                                            <SelectValue placeholder="Selecciona una etapa" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {etapas.map((e) => (
                                                <SelectItem
                                                    key={e.id}
                                                    value={e.id.toString()}
                                                >
                                                    {e.nombre}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>

                                <div className="space-y-2">
                                    <div className="flex items-center justify-between">
                                        <Label className="text-sm">ORPs</Label>
                                        <div className="flex gap-1">
                                            <div className="flex gap-1">
                                                <Select
                                                    value={
                                                        orpSeleccionada?.toString() ||
                                                        ''
                                                    }
                                                    onValueChange={(v) =>
                                                        setOrpSeleccionada(
                                                            Number(v),
                                                        )
                                                    }
                                                >
                                                    <SelectTrigger className="h-7 w-48 text-xs">
                                                        <SelectValue placeholder="ORP" />
                                                    </SelectTrigger>
                                                    <SelectContent className="max-h-60 overflow-y-auto">
                                                        {orpsDisponibles.map(
                                                            (orp) => (
                                                                <SelectItem
                                                                    key={orp.id}
                                                                    value={orp.id.toString()}
                                                                    className="text-xs"
                                                                >
                                                                    {orp.codigo}{' '}
                                                                    -{' '}
                                                                    {orp
                                                                        .productoTerminado
                                                                        ?.nombre ||
                                                                        orp.nombre_sap ||
                                                                        'Sin producto'}{' '}
                                                                    ({orp.lote})
                                                                </SelectItem>
                                                            ),
                                                        )}
                                                    </SelectContent>
                                                </Select>
                                                <Input
                                                    type="text"
                                                    value={
                                                        preparacionSeleccionada
                                                    }
                                                    onChange={(e) =>
                                                        setPreparacionSeleccionada(
                                                            e.target.value,
                                                        )
                                                    }
                                                    onBlur={() =>
                                                        setPreparacionSeleccionada(
                                                            normalizarPreparacion(
                                                                preparacionSeleccionada,
                                                            ),
                                                        )
                                                    }
                                                    className="h-7 w-32 text-xs"
                                                    placeholder="Prep."
                                                />
                                            </div>
                                            <Button
                                                onClick={agregarOrp}
                                                size="sm"
                                                className="h-7 w-7 p-0"
                                                disabled={
                                                    !orpSeleccionada ||
                                                    esGrupoConOrp
                                                }
                                            >
                                                <Plus className="h-3 w-3" />
                                            </Button>
                                        </div>
                                    </div>
                                    {esGrupoConOrp && (
                                        <p className="text-xs text-amber-600 dark:text-amber-500">
                                            Solo una ORP para envasado.
                                        </p>
                                    )}

                                    <div className="max-h-40 space-y-1 overflow-y-auto">
                                        {detalles.map((det, i) => {
                                            const orp =
                                                orpsDisponibles.find(
                                                    (o) => o.id === det.orp_id,
                                                ) || det.orp;
                                            const Icon = getProductoIcon(
                                                orp?.productoTerminado?.nombre,
                                            );
                                            return (
                                                <Card key={i} className="p-1">
                                                    <CardContent className="p-1">
                                                        <div className="flex items-center justify-between">
                                                            <div className="flex min-w-0 flex-1 items-center gap-1">
                                                                <Icon className="h-3 w-3 text-muted-foreground" />
                                                                <div className="min-w-0 flex-1">
                                                                    <div className="truncate text-xs font-medium">
                                                                        {
                                                                            orp?.codigo
                                                                        }{' '}
                                                                        -{' '}
                                                                        {
                                                                            det.preparacion
                                                                        }
                                                                    </div>
                                                                    <div className="text-[10px] text-muted-foreground">
                                                                        {orp?.productoTerminado?.nombre?.substring(
                                                                            0,
                                                                            100,
                                                                        )}
                                                                    </div>
                                                                </div>
                                                            </div>
                                                            <div className="flex items-center gap-1">
                                                                <Input
                                                                    type="number"
                                                                    value={
                                                                        det.cantidad
                                                                    }
                                                                    onChange={(
                                                                        e,
                                                                    ) =>
                                                                        actualizarDetalle(
                                                                            i,
                                                                            'cantidad',
                                                                            Number(
                                                                                e
                                                                                    .target
                                                                                    .value,
                                                                            ),
                                                                        )
                                                                    }
                                                                    className="h-6 w-16 text-xs"
                                                                    min="0"
                                                                    step="100"
                                                                />
                                                                <span className="w-6 text-xs">
                                                                    L
                                                                </span>
                                                                <Button
                                                                    variant="ghost"
                                                                    size="sm"
                                                                    onClick={() =>
                                                                        quitarOrp(
                                                                            i,
                                                                        )
                                                                    }
                                                                    className="h-6 w-6 p-0"
                                                                >
                                                                    <Trash2 className="h-3 w-3 text-destructive" />
                                                                </Button>
                                                            </div>
                                                        </div>
                                                    </CardContent>
                                                </Card>
                                            );
                                        })}
                                    </div>
                                    {detalles.length === 0 && (
                                        <div className="rounded border-2 border-dashed py-4 text-center text-xs text-muted-foreground">
                                            <FlaskConical className="mx-auto mb-1 h-5 w-5" />
                                            <p>No hay ORPs</p>
                                        </div>
                                    )}
                                </div>

                                <div className="flex items-center justify-between border-t pt-2">
                                    <div className="flex gap-1">
                                        <Button
                                            variant="outline"
                                            onClick={() => onOpenChange(false)}
                                            size="sm"
                                            className="h-8 text-xs"
                                        >
                                            Cancelar
                                        </Button>
                                        <Button
                                            onClick={handleSubmit}
                                            size="sm"
                                            className="h-8 text-xs"
                                            disabled={
                                                tipoDestino === 'grupo' &&
                                                cabezalesSeleccionados.length ===
                                                    0
                                            }
                                        >
                                            <MoveRight className="mr-1 h-3 w-3" />
                                            {tanque.detalles?.length
                                                ? 'Mover'
                                                : 'Iniciar'}
                                            {tipoDestino === 'grupo' &&
                                                ` a ${cabezalesSeleccionados.length} cabezal(es)`}
                                        </Button>
                                    </div>
                                </div>
                            </>
                        )}

                        {/* ========== MODO MODIFICAR ========== */}
                        {modoProduccion === 'modificar' && (
                            <div className="space-y-4">
                                <div className="flex items-center gap-2 rounded bg-muted p-2 text-sm">
                                    <Package className="h-4 w-4 text-primary" />
                                    <span className="font-medium">Tanque:</span>
                                    <Badge variant="secondary">
                                        {tanque.origen?.alias}
                                    </Badge>
                                </div>

                                <div>
                                    <Label htmlFor="etapa-mod">Etapa</Label>
                                    <Select
                                        value={
                                            etapaSeleccionada?.toString() || ''
                                        }
                                        onValueChange={(v) =>
                                            setEtapaSeleccionada(Number(v))
                                        }
                                    >
                                        <SelectTrigger
                                            id="etapa-mod"
                                            className="h-8 text-sm"
                                        >
                                            <SelectValue placeholder="Selecciona etapa" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {etapas.map((e) => (
                                                <SelectItem
                                                    key={e.id}
                                                    value={e.id.toString()}
                                                >
                                                    {e.nombre}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    {tieneCambiosEtapa && (
                                        <Badge
                                            variant="outline"
                                            className="mt-1 bg-primary/10 text-xs text-primary"
                                        >
                                            Nueva etapa
                                        </Badge>
                                    )}
                                </div>

                                <div className="space-y-2">
                                    <div className="flex items-center justify-between gap-2">
                                        <Label className="text-sm">ORPs</Label>
                                        <div className="flex gap-1">
                                            <div className="flex gap-1">
                                                <Select
                                                    value={
                                                        orpSeleccionada?.toString() ||
                                                        ''
                                                    }
                                                    onValueChange={(v) =>
                                                        setOrpSeleccionada(
                                                            Number(v),
                                                        )
                                                    }
                                                >
                                                    <SelectTrigger className="h-7 w-48 text-xs">
                                                        <SelectValue placeholder="ORP" />
                                                    </SelectTrigger>
                                                    <SelectContent className="max-h-60 overflow-y-auto">
                                                        {orpsDisponibles.map(
                                                            (orp) => (
                                                                <SelectItem
                                                                    key={orp.id}
                                                                    value={orp.id.toString()}
                                                                    className="text-xs"
                                                                >
                                                                    {orp.codigo}{' '}
                                                                    -{' '}
                                                                    {orp
                                                                        .productoTerminado
                                                                        ?.nombre ||
                                                                        orp.nombre_sap ||
                                                                        'Sin producto'}
                                                                </SelectItem>
                                                            ),
                                                        )}
                                                    </SelectContent>
                                                </Select>
                                                <Input
                                                    type="text"
                                                    value={
                                                        preparacionSeleccionada
                                                    }
                                                    onChange={(e) =>
                                                        setPreparacionSeleccionada(
                                                            e.target.value,
                                                        )
                                                    }
                                                    onBlur={() =>
                                                        setPreparacionSeleccionada(
                                                            normalizarPreparacion(
                                                                preparacionSeleccionada,
                                                            ),
                                                        )
                                                    }
                                                    className="h-7 w-32 text-xs"
                                                    placeholder="Prep."
                                                />
                                            </div>
                                            <Button
                                                onClick={agregarOrp}
                                                size="sm"
                                                className="h-7 w-7 p-0"
                                                disabled={!orpSeleccionada}
                                            >
                                                <Plus className="h-3 w-3" />
                                            </Button>
                                        </div>
                                    </div>

                                    <div className="max-h-40 space-y-1 overflow-y-auto">
                                        {detalles.map((det, i) => {
                                            const orp =
                                                orpsDisponibles.find(
                                                    (o) => o.id === det.orp_id,
                                                ) || det.orp;
                                            const Icon = getProductoIcon(
                                                orp?.productoTerminado?.nombre,
                                            );
                                            return (
                                                <Card key={i} className="p-1">
                                                    <CardContent className="p-1">
                                                        <div className="flex items-center justify-between">
                                                            <div className="flex min-w-0 flex-1 items-center gap-1">
                                                                <Icon className="h-3 w-3 text-muted-foreground" />
                                                                <div className="min-w-0 flex-1">
                                                                    <div className="truncate text-xs font-medium">
                                                                        {
                                                                            orp?.codigo
                                                                        }{' '}
                                                                        -{' '}
                                                                        {
                                                                            det.preparacion
                                                                        }
                                                                    </div>
                                                                    <div className="truncate text-[10px] text-muted-foreground">
                                                                        {orp?.nombre_sap ||
                                                                            orp
                                                                                ?.productoTerminado
                                                                                ?.nombre}
                                                                    </div>
                                                                </div>
                                                            </div>
                                                            <div className="flex items-center gap-1">
                                                                <Input
                                                                    type="number"
                                                                    value={
                                                                        det.cantidad
                                                                    }
                                                                    onChange={(
                                                                        e,
                                                                    ) =>
                                                                        actualizarDetalle(
                                                                            i,
                                                                            'cantidad',
                                                                            Number(
                                                                                e
                                                                                    .target
                                                                                    .value,
                                                                            ),
                                                                        )
                                                                    }
                                                                    className="h-6 w-16 text-xs"
                                                                    min="0"
                                                                    step="100"
                                                                />
                                                                <span className="w-6 text-xs">
                                                                    L
                                                                </span>
                                                                <Button
                                                                    variant="ghost"
                                                                    size="sm"
                                                                    onClick={() =>
                                                                        quitarOrp(
                                                                            i,
                                                                        )
                                                                    }
                                                                    className="h-6 w-6 p-0"
                                                                >
                                                                    <Trash2 className="h-3 w-3 text-destructive" />
                                                                </Button>
                                                            </div>
                                                        </div>
                                                    </CardContent>
                                                </Card>
                                            );
                                        })}
                                    </div>
                                    {detalles.length === 0 && (
                                        <div className="rounded border-2 border-dashed py-4 text-center text-xs text-muted-foreground">
                                            <FlaskConical className="mx-auto mb-1 h-5 w-5" />
                                            <p>No hay ORPs</p>
                                        </div>
                                    )}
                                    {tieneCambiosOrps && (
                                        <Badge
                                            variant="outline"
                                            className="bg-green-100 text-xs text-green-700 dark:bg-green-900/30 dark:text-green-400"
                                        >
                                            ORPs modificados
                                        </Badge>
                                    )}
                                </div>

                                <div className="grid grid-cols-1 gap-2 pt-2">
                                    <Button
                                        onClick={handleCambiarEtapa}
                                        disabled={!tieneCambiosEtapa}
                                        variant={
                                            tieneCambiosEtapa
                                                ? 'default'
                                                : 'outline'
                                        }
                                        className="h-10 text-xs"
                                    >
                                        <Copy className="mr-1 h-3 w-3" />{' '}
                                        Cambiar Solo Etapa
                                    </Button>
                                    <Button
                                        onClick={handleCambiarORPs}
                                        disabled={!tieneCambiosOrps}
                                        variant={
                                            tieneCambiosOrps
                                                ? 'default'
                                                : 'outline'
                                        }
                                        className="h-10 text-xs"
                                    >
                                        <Copy className="mr-1 h-3 w-3" />{' '}
                                        Cambiar Solo ORPs
                                    </Button>
                                    <Button
                                        onClick={handleCambiarAmbos}
                                        disabled={
                                            !tieneCambiosEtapa &&
                                            !tieneCambiosOrps
                                        }
                                        variant={
                                            tieneCambiosEtapa ||
                                            tieneCambiosOrps
                                                ? 'default'
                                                : 'outline'
                                        }
                                        className="h-10 text-xs"
                                    >
                                        <Copy className="mr-1 h-3 w-3" />{' '}
                                        Cambiar Ambos
                                    </Button>
                                </div>
                                <div className="border-t pt-2 text-center text-xs text-muted-foreground">
                                    <p>Cada cambio crea un nuevo registro.</p>
                                </div>
                            </div>
                        )}
                    </div>
                )}
            </DialogContent>
        </Dialog>
    );
}