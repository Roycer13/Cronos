import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Toast } from '@/components/ui/toast';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, router, usePage } from '@inertiajs/react';
import {
    CheckCircle, XCircle, Building, Hash, AlertTriangle,
    Save, ArrowLeft, Check, X, Loader2, Eye, EyeOff, Crosshair, ChevronDown, ChevronUp
} from 'lucide-react';
import { route } from 'ziggy-js';
import { useState, useMemo, useEffect } from 'react';

import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import FormSelect from '@/components/ui/form-select';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Módulos Comunes', href: '/modulos-comunes' },
    { title: 'Control de Plagas', href: '/plagas' },
    { title: 'Control de Trampas', href: '/plagas/control-trampas' },
    { title: 'Registro Rápido', href: '/plagas/control-trampas/registro-rapido' },
];

interface Trampa {
    id: number;
    codigo: string | null;
    tipo: string | null;
    sector: { id: number; nombre: string } | null;
}

interface Sector {
    id: number;
    nombre: string;
}

interface PageProps {
    trampas: Trampa[];
    sectores: Sector[];
    glosas: string[];
    tiposRevision: string[];
    flash: { success?: string; error?: string };
}

interface ControlLocal {
    PLAG_trampa_id: number;
    tipo_revision: string;
    observacion: string;
    observacion_detalle: string;
    correcion: string;
    responsable_correcion: string;
    deterioro: boolean;
    responsable_cambio: string;
    expanded: boolean;
    tieneIncidencia: boolean;   // Nuevo campo para controlar el bloque de irregularidad
}

export default function RegistroRapido() {
    const { props } = usePage();
    const { trampas = [], sectores = [], glosas = [], tiposRevision = [], flash } = props as unknown as PageProps;
    const [saving, setSaving] = useState(false);
    const [controles, setControles] = useState<ControlLocal[]>([]);
    const [filtroSector, setFiltroSector] = useState<string>('');
    const [busqueda, setBusqueda] = useState('');
    const [tiposRevisionGlobal, setTiposRevisionGlobal] = useState<Record<string, string>>({}); // por sector o global
    const [sectoresColapsados, setSectoresColapsados] = useState<Set<string>>(new Set());

    // Inicializar los controles cuando se cargan las trampas
    useEffect(() => {
        if (trampas.length) {
            setControles(trampas.map(t => ({
                PLAG_trampa_id: t.id,
                tipo_revision: '',
                observacion: '',
                observacion_detalle: '',
                correcion: '',
                responsable_correcion: '',
                deterioro: false,
                responsable_cambio: '',
                expanded: false,
                tieneIncidencia: false,
            })));
        }
    }, [trampas]);

    // Agrupar trampas por sector
    const trampasPorSector = useMemo(() => {
        let filtradas = trampas;

        if (filtroSector) {
            filtradas = filtradas.filter(t => t.sector?.id.toString() === filtroSector);
        }
        if (busqueda) {
            const q = busqueda.toLowerCase();
            filtradas = filtradas.filter(t =>
                (t.codigo?.toLowerCase().includes(q)) ||
                (t.tipo?.toLowerCase().includes(q))
            );
        }

        const grupos: { [key: string]: Trampa[] } = {};
        filtradas.forEach(t => {
            const sectorNombre = t.sector?.nombre || 'Sin sector';
            if (!grupos[sectorNombre]) grupos[sectorNombre] = [];
            grupos[sectorNombre].push(t);
        });
        return grupos;
    }, [trampas, filtroSector, busqueda]);

    const actualizarControl = (id: number, campo: keyof ControlLocal, valor: any) => {
        setControles(prev => prev.map(c =>
            c.PLAG_trampa_id === id ? { ...c, [campo]: valor } : c
        ));
    };

    const toggleExpand = (id: number) => {
        setControles(prev => prev.map(c =>
            c.PLAG_trampa_id === id ? { ...c, expanded: !c.expanded } : c
        ));
    };

    // Validar si un control está completo
    const isControlCompleto = (control: ControlLocal) => {
        return control.tipo_revision && control.observacion;
    };

    // Asignar mismo tipo de revisión a todas las trampas de un sector (o globalmente si no hay filtro)
    const aplicarTipoRevisionGlobal = (sectorNombre?: string) => {
        const valor = tiposRevisionGlobal[sectorNombre || 'global'];
        if (!valor) return;
        setControles(prev => prev.map(c => {
            const trampa = trampas.find(t => t.id === c.PLAG_trampa_id);
            if (!trampa) return c;
            const perteneceAlSector = !sectorNombre || trampa.sector?.nombre === sectorNombre;
            if (perteneceAlSector) {
                return { ...c, tipo_revision: valor };
            }
            return c;
        }));
    };

    // Asignar mismo tipo de revisión a TODAS las trampas visibles (según filtro actual)
    const aplicarATodos = () => {
        const valor = prompt('Tipo de revisión para todas las trampas:', tiposRevision[0] || '');
        if (valor && tiposRevision.includes(valor)) {
            setControles(prev => prev.map(c => ({ ...c, tipo_revision: valor })));
        } else if (valor) {
            alert('Valor no válido. Use uno de los tipos predefinidos.');
        }
    };

    const guardarTodo = () => {
        const controlesValidos = controles.filter(isControlCompleto);
        if (controlesValidos.length === 0) {
            alert('Debe completar al menos tipo de revisión y observación para cada trampa que desea registrar.');
            return;
        }

        const payload = {
            controles: controlesValidos.map(({ PLAG_trampa_id, tipo_revision, observacion, observacion_detalle, correcion, responsable_correcion, deterioro, responsable_cambio, tieneIncidencia }) => ({
                PLAG_trampa_id,
                tipo_revision,
                observacion,
                observacion_detalle: tieneIncidencia ? observacion_detalle : '',
                correcion: tieneIncidencia ? correcion : '',
                responsable_correcion: tieneIncidencia ? responsable_correcion : '',
                deterioro,
                responsable_cambio: deterioro ? (responsable_cambio || 'INSECRUZ') : '',
            }))
        };

        setSaving(true);
        router.post(route('plagas.control-trampas.store-rapido'), payload, {
            preserveScroll: true,
            onFinish: () => setSaving(false),
        });
    };

    const totalRegistros = trampas.length;
    const completados = controles.filter(isControlCompleto).length;

    // Verificar si un sector está completamente lleno
    const sectorCompleto = (sectorNombre: string) => {
        const trampasSector = trampasPorSector[sectorNombre] || [];
        if (trampasSector.length === 0) return false;
        return trampasSector.every(t => {
            const ctrl = controles.find(c => c.PLAG_trampa_id === t.id);
            return ctrl && isControlCompleto(ctrl);
        });
    };

    const toggleSector = (sectorNombre: string) => {
        setSectoresColapsados(prev => {
            const newSet = new Set(prev);
            if (newSet.has(sectorNombre)) newSet.delete(sectorNombre);
            else newSet.add(sectorNombre);
            return newSet;
        });
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Registro Rápido - Trampas" />
            <Toast />
            <div className="px-2 sm:px-4 py-4 space-y-4">
                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                    <div>
                        <h1 className="text-xl font-bold">Registro Rápido de Trampas</h1>
                        <p className="text-sm text-muted-foreground mt-1">
                            Complete los datos de cada trampa y guarde todas las inspecciones de una vez
                        </p>
                    </div>
                    <div className="flex gap-2">
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => router.get(route('plagas.control-trampas.index'))}
                        >
                            <ArrowLeft className="h-4 w-4 mr-1" /> Volver
                        </Button>
                        <Button
                            onClick={guardarTodo}
                            disabled={saving}
                            className="flex items-center gap-2"
                        >
                            {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                            Guardar ({completados}/{totalRegistros})
                        </Button>
                    </div>
                </div>

                {/* Estadísticas rápidas */}
                <div className="grid grid-cols-3 gap-3">
                    <Card className="p-3 text-center">
                        <p className="text-xs text-muted-foreground">Total trampas</p>
                        <p className="text-xl font-bold">{totalRegistros}</p>
                    </Card>
                    <Card className="p-3 text-center border-green-200 bg-green-50/30">
                        <p className="text-xs text-muted-foreground">Completadas</p>
                        <p className="text-xl font-bold text-green-700">{completados}</p>
                    </Card>
                    <Card className="p-3 text-center border-amber-200 bg-amber-50/30">
                        <p className="text-xs text-muted-foreground">Pendientes</p>
                        <p className="text-xl font-bold text-amber-700">{totalRegistros - completados}</p>
                    </Card>
                </div>

                {/* Filtros y acciones rápidas */}
                <Card className="p-3">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-3">
                        <div className="space-y-1">
                            <Label className="text-xs">Filtrar por sector</Label>
                            <select
                                value={filtroSector}
                                onChange={(e) => setFiltroSector(e.target.value)}
                                className="w-full px-3 py-2 border rounded-md text-sm h-9"
                            >
                                <option value="">Todos los sectores</option>
                                {sectores.map(s => (
                                    <option key={s.id} value={s.id.toString()}>{s.nombre}</option>
                                ))}
                            </select>
                        </div>
                        <div className="space-y-1">
                            <Label className="text-xs">Buscar por código o tipo</Label>
                            <Input
                                placeholder="Código o tipo..."
                                value={busqueda}
                                onChange={(e) => setBusqueda(e.target.value)}
                                className="h-9 text-sm"
                            />
                        </div>
                    </div>
                    <div className="flex flex-wrap gap-2 pt-2 border-t">
                        <Button variant="outline" size="sm" onClick={aplicarATodos}>
                            Asignar mismo tipo a TODAS las trampas
                        </Button>
                        {filtroSector && (
                            <Button variant="outline" size="sm" onClick={() => aplicarTipoRevisionGlobal()}>
                                Asignar mismo tipo a todas las del sector
                            </Button>
                        )}
                    </div>
                </Card>

                {/* Listado por sectores con colapso */}
                <div className="space-y-4">
                    {Object.entries(trampasPorSector).map(([sectorNombre, trampasDelSector]) => {
                        const completo = sectorCompleto(sectorNombre);
                        const colapsado = sectoresColapsados.has(sectorNombre);
                        return (
                            <Card key={sectorNombre} className="overflow-visible">
                                <div
                                    className="bg-muted/30 px-4 py-2 flex flex-wrap items-center justify-between gap-2 border-b cursor-pointer hover:bg-muted/50"
                                    onClick={() => toggleSector(sectorNombre)}
                                >
                                    <div className="flex items-center gap-2">
                                        <Building className="h-4 w-4 text-muted-foreground" />
                                        <h3 className="font-semibold">{sectorNombre}</h3>
                                        <Badge variant="outline" className="text-xs">
                                            {trampasDelSector.length}
                                        </Badge>
                                        {completo && (
                                            <Badge variant="secondary" className="text-xs bg-green-100 text-green-700">
                                                <CheckCircle className="h-3 w-3 mr-1" /> Completado
                                            </Badge>
                                        )}
                                    </div>
                                    <div className="flex items-center gap-2">
                                        {completo && (
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                className="h-7 text-xs"
                                                onClick={(e) => { e.stopPropagation(); toggleSector(sectorNombre); }}
                                            >
                                                {colapsado ? <ChevronDown className="h-4 w-4" /> : <ChevronUp className="h-4 w-4" />}
                                                {colapsado ? 'Mostrar' : 'Ocultar'}
                                            </Button>
                                        )}
                                    </div>
                                </div>
                                {!colapsado && (
                                    <div className="divide-y overflow-visible">
                                        {trampasDelSector.map((trampa) => {
                                            const control = controles.find(c => c.PLAG_trampa_id === trampa.id);
                                            if (!control) return null;
                                            const isComplete = isControlCompleto(control);
                                            return (
                                                <div key={trampa.id} className={`p-3 transition-colors ${isComplete ? 'bg-green-50/20 dark:bg-green-900/5' : ''}`}>
                                                    <div className="flex flex-wrap items-start justify-between gap-2">
                                                        <div className="flex-1 min-w-0">
                                                            <div className="flex items-center gap-2 flex-wrap">
                                                                <Badge variant="outline" className="font-mono text-xs">
                                                                    <Hash className="h-3 w-3 mr-1" />
                                                                    {trampa.codigo || 'S/C'}
                                                                </Badge>
                                                                <span className="text-sm font-medium">{trampa.tipo || 'Sin tipo'}</span>
                                                                {!isComplete && (
                                                                    <Badge variant="destructive" className="text-xs">Incompleto</Badge>
                                                                )}
                                                            </div>
                                                        </div>
                                                        <div className="flex items-center gap-2">
                                                            <Button
                                                                variant="ghost"
                                                                size="sm"
                                                                className="h-8 w-8 p-0"
                                                                onClick={() => toggleExpand(trampa.id)}
                                                            >
                                                                {control.expanded ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                                            </Button>
                                                        </div>
                                                    </div>

                                                    {control.expanded && (
                                                        <div className="mt-3 space-y-3 pt-2 border-t overflow-visible">
                                                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                                                <FormSelect
                                                                    label="Tipo de revisión *"
                                                                    value={control.tipo_revision}
                                                                    onChange={(v) => actualizarControl(trampa.id, 'tipo_revision', v)}
                                                                    placeholder="Seleccionar"
                                                                    options={tiposRevision.map(t => ({ value: t, label: t }))}
                                                                />
                                                                <FormSelect
                                                                    label="Observación *"
                                                                    value={control.observacion}
                                                                    onChange={(v) => actualizarControl(trampa.id, 'observacion', v)}
                                                                    placeholder="Seleccionar"
                                                                    options={glosas.map(g => ({ value: g, label: g }))}
                                                                />
                                                            </div>

                                                            {/* Checkbox para mostrar bloque de incidencia */}
                                                            <div className="flex items-center gap-2">
                                                                <input
                                                                    type="checkbox"
                                                                    id={`incidencia_${trampa.id}`}
                                                                    checked={control.tieneIncidencia}
                                                                    onChange={(e) => actualizarControl(trampa.id, 'tieneIncidencia', e.target.checked)}
                                                                    className="h-4 w-4 rounded"
                                                                />
                                                                <Label htmlFor={`incidencia_${trampa.id}`} className="text-sm font-normal">
                                                                    Registrar incidencia (irregularidad)
                                                                </Label>
                                                            </div>

                                                            {/* Bloque de irregularidad, visible solo si el checkbox está marcado */}
                                                            {control.tieneIncidencia && (
                                                                <div className="border border-amber-200 rounded-lg p-3 space-y-3 bg-amber-50/30 dark:bg-amber-900/10">
                                                                    <div className="flex items-center gap-2 text-amber-700">
                                                                        <AlertTriangle className="h-4 w-4" />
                                                                        <span className="text-sm font-medium">Detalle de la incidencia</span>
                                                                    </div>
                                                                    <Textarea
                                                                        value={control.observacion_detalle}
                                                                        onChange={(e) => actualizarControl(trampa.id, 'observacion_detalle', e.target.value)}
                                                                        placeholder="Describa la irregularidad..."
                                                                        rows={2}
                                                                    />
                                                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                                                        <div>
                                                                            <Label className="text-xs">Corrección</Label>
                                                                            <Textarea
                                                                                value={control.correcion}
                                                                                onChange={(e) => actualizarControl(trampa.id, 'correcion', e.target.value)}
                                                                                placeholder="Acción correctiva..."
                                                                                rows={2}
                                                                            />
                                                                        </div>
                                                                        <div>
                                                                            <Label className="text-xs">Responsable corrección</Label>
                                                                            <Input
                                                                                value={control.responsable_correcion}
                                                                                onChange={(e) => actualizarControl(trampa.id, 'responsable_correcion', e.target.value)}
                                                                                placeholder="Nombre del responsable"
                                                                            />
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                            )}

                                                            {/* Deterioro */}
                                                            <div className="border rounded-lg p-3 space-y-2">
                                                                <div className="flex items-center justify-between">
                                                                    <div>
                                                                        <Label className="font-medium">¿Presenta deterioro?</Label>
                                                                        <p className="text-xs text-muted-foreground">Daños físicos o desgaste</p>
                                                                    </div>
                                                                    <input
                                                                        type="checkbox"
                                                                        checked={control.deterioro}
                                                                        onChange={(e) => {
                                                                            actualizarControl(trampa.id, 'deterioro', e.target.checked);
                                                                            if (e.target.checked && !control.responsable_cambio) {
                                                                                actualizarControl(trampa.id, 'responsable_cambio', 'INSECRUZ');
                                                                            }
                                                                        }}
                                                                        className="h-4 w-4 rounded"
                                                                    />
                                                                </div>
                                                                {control.deterioro && (
                                                                    <div>
                                                                        <Label className="text-xs">Responsable del cambio</Label>
                                                                        <Input
                                                                            value={control.responsable_cambio}
                                                                            onChange={(e) => actualizarControl(trampa.id, 'responsable_cambio', e.target.value)}
                                                                            placeholder="INSECRUZ"
                                                                        />
                                                                    </div>
                                                                )}
                                                            </div>
                                                        </div>
                                                    )}
                                                </div>
                                            );
                                        })}
                                    </div>
                                )}
                            </Card>
                        );
                    })}
                </div>

                {Object.keys(trampasPorSector).length === 0 && (
                    <div className="text-center py-12">
                        <Crosshair className="h-12 w-12 mx-auto text-muted-foreground/50 mb-3" />
                        <p className="text-muted-foreground">No hay trampas activas en esta ubicación</p>
                    </div>
                )}
            </div>
        </AppLayout>
    );
}