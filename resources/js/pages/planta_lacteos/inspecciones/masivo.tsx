import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import AppLayout from '@/layouts/app-layout';
import { Head, router, usePage } from '@inertiajs/react';
import { ArrowLeft, CheckCircle2, ClipboardCheck, PencilLine, PlusCircle, Search, Sparkles, Trash2 } from 'lucide-react';
import { route } from 'ziggy-js';
import { Badge } from '@/components/ui/badge';
import { useEffect, useMemo, useState } from 'react';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import FormSelect from '@/components/ui/form-select';

interface Infraestructura {
    id: number;
    nombre: string;
    usa_pisos: boolean;
    usa_maquina_equipo: boolean;
    usa_extra: boolean;
    usa_paredes: boolean;
    usa_techos: boolean;
    usa_puertas: boolean;
    usa_ventanas: boolean;
    usa_drenajes: boolean;
    usa_iluminacion: boolean;
    usa_ventilacion: boolean;
    usa_lavamanos: boolean;
    usa_servicios_sanitarios: boolean;
    usa_almacenamiento: boolean;
    usa_senalizacion: boolean;
}

interface AccionItem {
    criterio: string;
    descripcion: string;
    tipo_accion: string;
    responsable: string;
    fecha_ejecucion: string;
    estado: string;
    referencia: string;
    observaciones: string;
}

interface AreaDraft {
    fecha: string;
    observacion_general: string;
    criterios: Record<string, { ok: boolean; observacion: string }>;
    acciones: AccionItem[];
}

const getCriteriosActivos = (infraestructura: Infraestructura): string[] => {
    const activos: string[] = [];
    if (infraestructura.usa_pisos) activos.push('pisos');
    if (infraestructura.usa_paredes) activos.push('paredes');
    if (infraestructura.usa_techos) activos.push('techos');
    if (infraestructura.usa_puertas) activos.push('puertas');
    if (infraestructura.usa_ventanas) activos.push('ventanas');
    if (infraestructura.usa_drenajes) activos.push('drenajes');
    if (infraestructura.usa_iluminacion) activos.push('iluminacion');
    if (infraestructura.usa_ventilacion) activos.push('ventilacion');
    if (infraestructura.usa_lavamanos) activos.push('lavamanos');
    if (infraestructura.usa_servicios_sanitarios) activos.push('servicios_sanitarios');
    if (infraestructura.usa_almacenamiento) activos.push('almacenamiento');
    if (infraestructura.usa_senalizacion) activos.push('senalizacion');
    if (infraestructura.usa_maquina_equipo) activos.push('maquina_equipo');
    if (infraestructura.usa_extra) activos.push('extra');
    return activos;
};

const crearDraftVacio = (infraestructura: Infraestructura): AreaDraft => ({
    fecha: new Date().toISOString().slice(0, 16),
    observacion_general: '',
    criterios: Object.fromEntries(getCriteriosActivos(infraestructura).map((criterio) => [criterio, { ok: true, observacion: '' }])),
    acciones: [],
});

export default function Masivo() {
    const { infraestructuras } = usePage<{ infraestructuras: Infraestructura[] }>().props;

    const [selectedIds, setSelectedIds] = useState<number[]>([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [areaDrafts, setAreaDrafts] = useState<Record<number, AreaDraft>>({});
    const [editingAreaId, setEditingAreaId] = useState<number | null>(null);

    useEffect(() => {
        setAreaDrafts((prev) => {
            const next: Record<number, AreaDraft> = {};
            selectedIds.forEach((id) => {
                const infraestructura = infraestructuras.find((item) => item.id === id);
                if (!infraestructura) return;
                next[id] = prev[id] ?? crearDraftVacio(infraestructura);
            });
            return next;
        });
    }, [infraestructuras, selectedIds]);

    const filteredInfraestructuras = useMemo(() => {
        const query = searchTerm.trim().toLowerCase();
        if (!query) return infraestructuras;
        return infraestructuras.filter((item) => item.nombre.toLowerCase().includes(query));
    }, [infraestructuras, searchTerm]);

    const actualizarAreaDraft = (infraestructuraId: number, updater: (draft: AreaDraft) => AreaDraft) => {
        setAreaDrafts((prev) => ({
            ...prev,
            [infraestructuraId]: updater(prev[infraestructuraId] ?? crearDraftVacio(infraestructuras.find((item) => item.id === infraestructuraId)!)),
        }));
    };

    const agregarAccion = (infraestructuraId: number, criterio: string) => {
        actualizarAreaDraft(infraestructuraId, (draft) => ({
            ...draft,
            acciones: [
                ...draft.acciones,
                {
                    criterio,
                    descripcion: '',
                    tipo_accion: '',
                    responsable: '',
                    fecha_ejecucion: '',
                    estado: 'Pendiente',
                    referencia: '',
                    observaciones: '',
                },
            ],
        }));
    };

    const eliminarAccion = (infraestructuraId: number, index: number) => {
        actualizarAreaDraft(infraestructuraId, (draft) => ({
            ...draft,
            acciones: draft.acciones.filter((_, itemIndex) => itemIndex !== index),
        }));
    };

    const actualizarAccion = (infraestructuraId: number, index: number, campo: keyof AccionItem, valor: string) => {
        actualizarAreaDraft(infraestructuraId, (draft) => ({
            ...draft,
            acciones: draft.acciones.map((accion, itemIndex) => itemIndex === index ? { ...accion, [campo]: valor } : accion),
        }));
    };

    const actualizarCriterio = (infraestructuraId: number, criterio: string, campo: 'ok' | 'observacion', valor: boolean | string) => {
        actualizarAreaDraft(infraestructuraId, (draft) => ({
            ...draft,
            criterios: {
                ...draft.criterios,
                [criterio]: {
                    ...(draft.criterios[criterio] ?? { ok: true, observacion: '' }),
                    [campo]: valor,
                },
            },
        }));
    };

    const handleCreate = () => {
        if (selectedIds.length === 0) {
            alert('Seleccione al menos un área');
            return;
        }

        const payload = {
            areas: selectedIds
                .map((id) => {
                    const draft = areaDrafts[id];
                    if (!draft) return null;
                    return {
                        infraestructura_id: id,
                        fecha: draft.fecha,
                        observacion_general: draft.observacion_general,
                        criterios: Object.entries(draft.criterios).map(([criterio, value]) => ({
                            criterio,
                            ok: value.ok,
                            observacion: value.observacion,
                        })),
                        acciones: draft.acciones.filter((accion) => accion.descripcion.trim()).map((accion) => ({
                            criterio: accion.criterio,
                            descripcion: accion.descripcion,
                            tipo_accion: accion.tipo_accion,
                            responsable: accion.responsable,
                            fecha_ejecucion: accion.fecha_ejecucion,
                            estado: accion.estado,
                            referencia: accion.referencia,
                            observaciones: accion.observaciones,
                        })),
                    };
                })
                .filter(Boolean),
        };

        router.post(route('inspecciones.storeMasivo'), payload, { preserveState: false });
    };

    const selectedCount = selectedIds.length;
    const selectedAreas = useMemo(() => selectedIds.map((id) => {
        const infraestructura = infraestructuras.find((item) => item.id === id);
        const draft = areaDrafts[id];
        if (!infraestructura || !draft) return null;
        const criterios = Object.entries(draft.criterios);
        const noCumple = criterios.filter(([, value]) => !value.ok).length;
        const hallazgos = draft.acciones.length;
        return { id, nombre: infraestructura.nombre, criterios, noCumple, hallazgos };
    }).filter(Boolean), [areaDrafts, infraestructuras, selectedIds]);

    const editingArea = editingAreaId ? selectedAreas.find((item) => item?.id === editingAreaId) : null;
    const editingDraft = editingAreaId ? areaDrafts[editingAreaId] : undefined;
    const editingInfraestructura = editingAreaId ? infraestructuras.find((item) => item.id === editingAreaId) : undefined;

    return (
        <AppLayout breadcrumbs={[{ title: 'Inspecciones', href: '/planta-lacteos/inspecciones' }, { title: 'Creación masiva', href: '#' }]}>
            <Head title="Creación masiva de inspecciones" />
            <div className="mx-auto max-w-6xl space-y-4 px-2 py-4 sm:px-4">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <h1 className="text-2xl font-bold">Registro masivo de inspecciones</h1>
                        <p className="text-sm text-muted-foreground">Selecciona varias áreas y completa cada inspección en un bloque compacto.</p>
                    </div>
                    <Button variant="outline" onClick={() => router.visit(route('inspecciones.index'))}>
                        <ArrowLeft className="mr-2 h-4 w-4" /> Volver
                    </Button>
                </div>

                <div className="grid gap-3 md:grid-cols-3">
                    <Card className="p-3">
                        <p className="text-xs text-muted-foreground">Áreas seleccionadas</p>
                        <p className="text-xl font-semibold">{selectedCount}</p>
                    </Card>
                    <Card className="p-3">
                        <p className="text-xs text-muted-foreground">Bloques listos</p>
                        <p className="text-xl font-semibold">{selectedAreas.length}</p>
                    </Card>
                    <Card className="p-3">
                        <p className="text-xs text-muted-foreground">No cumple / hallazgos</p>
                        <p className="text-xl font-semibold">{selectedAreas.reduce((acc, item) => acc + (item?.noCumple ?? 0), 0)} / {selectedAreas.reduce((acc, item) => acc + (item?.hallazgos ?? 0), 0)}</p>
                    </Card>
                </div>

                <div className="grid gap-4 xl:grid-cols-[0.95fr_1.05fr]">
                    <div className="space-y-4">
                        <Card className="p-3">
                            <div className="mb-2 flex items-center justify-between">
                                <div>
                                    <h2 className="font-semibold">1. Áreas a inspeccionar</h2>
                                    <p className="text-xs text-muted-foreground">Busca y selecciona cada área para ver su propio resumen.</p>
                                </div>
                                <Badge variant="outline">{selectedCount} seleccionadas</Badge>
                            </div>
                            <div className="relative mb-3">
                                <Search className="pointer-events-none absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                                <Input
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    placeholder="Buscar área"
                                    className="pl-8"
                                />
                            </div>
                            <div className="grid gap-2 sm:grid-cols-2">
                                {filteredInfraestructuras.map((item) => {
                                    const isSelected = selectedIds.includes(item.id);
                                    return (
                                        <label key={item.id} className={`flex cursor-pointer items-start gap-2 rounded-md border p-2 text-sm ${isSelected ? 'border-primary bg-primary/5' : 'border-muted'}`}>
                                            <input
                                                type="checkbox"
                                                checked={isSelected}
                                                onChange={() => {
                                                    setSelectedIds((prev) => prev.includes(item.id) ? prev.filter((id) => id !== item.id) : [...prev, item.id]);
                                                }}
                                                className="mt-1"
                                            />
                                            <span className="min-w-0">
                                                <span className="block font-medium">{item.nombre}</span>
                                                <span className="text-xs text-muted-foreground">{getCriteriosActivos(item).length} criterios</span>
                                            </span>
                                        </label>
                                    );
                                })}
                            </div>
                        </Card>

                        <Card className="p-3">
                            <div className="mb-2 flex items-center justify-between">
                                <div>
                                    <h2 className="font-semibold">2. Resumen por área</h2>
                                    <p className="text-xs text-muted-foreground">Cada bloque muestra los criterios y hallazgos de una sola área.</p>
                                </div>
                                <Badge variant="secondary">Compacto</Badge>
                            </div>
                            {selectedAreas.length === 0 ? (
                                <div className="rounded-md border border-dashed p-3 text-sm text-muted-foreground">
                                    Selecciona uno o más áreas para ver su resumen aquí.
                                </div>
                            ) : (
                                <div className="space-y-2">
                                    {selectedAreas.map((item) => (
                                        <div key={item.id} className="rounded-md border p-2">
                                            <div className="flex items-start justify-between gap-2">
                                                <div>
                                                    <p className="text-sm font-semibold">{item.nombre}</p>
                                                    <p className="text-xs text-muted-foreground">{item.criterios.length} criterios • {item.noCumple} no cumple • {item.hallazgos} hallazgos</p>
                                                </div>
                                                <Button type="button" variant="outline" size="sm" onClick={() => setEditingAreaId(item.id)}>
                                                    <PencilLine className="mr-2 h-4 w-4" /> Editar
                                                </Button>
                                            </div>
                                            <div className="mt-2 flex flex-wrap gap-2">
                                                {item.criterios.slice(0, 4).map(([criterio, value]) => (
                                                    <Badge key={criterio} variant={value.ok ? 'secondary' : 'destructive'}>
                                                        {criterio.replace(/_/g, ' ')}: {value.ok ? 'cumple' : 'no cumple'}
                                                    </Badge>
                                                ))}
                                                {item.criterios.length > 4 ? <Badge variant="outline">+{item.criterios.length - 4} más</Badge> : null}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </Card>
                    </div>

                    <div className="space-y-4">
                        <Card className="p-3">
                            <div className="mb-2 flex items-center gap-2">
                                <CheckCircle2 className="h-4 w-4" />
                                <h2 className="font-semibold">3. Crear inspecciones</h2>
                            </div>
                            <div className="space-y-2 text-sm text-muted-foreground">
                                <p>Se crearán un bloque por cada área seleccionada, con su propio resumen de criterios y hallazgos.</p>
                                <p>Para evitar scroll largo, cada área se edita desde un panel compacto.</p>
                            </div>
                            <Button className="mt-3 w-full" onClick={handleCreate} disabled={selectedIds.length === 0}>
                                <ClipboardCheck className="mr-2 h-4 w-4" /> Crear inspecciones
                            </Button>
                        </Card>
                    </div>
                </div>
            </div>

            <Dialog open={Boolean(editingAreaId && editingDraft && editingInfraestructura)} onOpenChange={(open) => !open && setEditingAreaId(null)}>
                <DialogContent className="max-h-[90vh] max-w-3xl overflow-y-auto">
                    {editingDraft && editingInfraestructura ? (
                        <>
                            <DialogHeader>
                                <DialogTitle>{editingInfraestructura.nombre}</DialogTitle>
                                <DialogDescription>Completa la inspección de esta área y registra los hallazgos en un bloque compacto.</DialogDescription>
                            </DialogHeader>
                            <div className="space-y-3">
                                <div className="grid gap-3 md:grid-cols-2">
                                    <div>
                                        <label className="mb-1 block text-sm font-medium">Fecha y hora</label>
                                        <Input type="datetime-local" value={editingDraft.fecha} onChange={(e) => actualizarAreaDraft(editingInfraestructura.id, (draft) => ({ ...draft, fecha: e.target.value }))} />
                                    </div>
                                    <div className="md:col-span-2">
                                        <label className="mb-1 block text-sm font-medium">Observación general</label>
                                        <Textarea value={editingDraft.observacion_general} onChange={(e) => actualizarAreaDraft(editingInfraestructura.id, (draft) => ({ ...draft, observacion_general: e.target.value }))} placeholder="Observaciones para esta inspección" />
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    {Object.entries(editingDraft.criterios).map(([criterio, current]) => (
                                        <div key={criterio} className="rounded-md border p-2">
                                            <div className="flex flex-wrap items-center justify-between gap-2">
                                                <span className="text-sm font-semibold capitalize">{criterio.replace(/_/g, ' ')}</span>
                                                <div className="flex gap-3 text-sm">
                                                    <label className="flex items-center gap-1">
                                                        <input type="radio" checked={current.ok} onChange={() => actualizarCriterio(editingInfraestructura.id, criterio, 'ok', true)} /> Cumple
                                                    </label>
                                                    <label className="flex items-center gap-1">
                                                        <input type="radio" checked={!current.ok} onChange={() => actualizarCriterio(editingInfraestructura.id, criterio, 'ok', false)} /> No cumple
                                                    </label>
                                                </div>
                                            </div>
                                            <div className="mt-2 grid gap-2 md:grid-cols-[1fr_auto]">
                                                <Textarea value={current.observacion} onChange={(e) => actualizarCriterio(editingInfraestructura.id, criterio, 'observacion', e.target.value)} placeholder="Observación del criterio" />
                                                {!current.ok ? (
                                                    <Button type="button" variant="outline" size="sm" onClick={() => agregarAccion(editingInfraestructura.id, criterio)}>
                                                        <PlusCircle className="mr-2 h-4 w-4" /> Hallazgo
                                                    </Button>
                                                ) : null}
                                            </div>
                                        </div>
                                    ))}
                                </div>

                                <div className="space-y-2">
                                    <div className="flex items-center justify-between">
                                        <h3 className="text-sm font-semibold">Hallazgos</h3>
                                        <Badge variant="outline">{editingDraft.acciones.length}</Badge>
                                    </div>
                                    {editingDraft.acciones.length === 0 ? (
                                        <div className="rounded-md border border-dashed p-3 text-sm text-muted-foreground">
                                            Cuando marques un criterio como no cumple, aquí aparecerán los hallazgos para esta área.
                                        </div>
                                    ) : (
                                        editingDraft.acciones.map((accion, index) => (
                                            <div key={`${accion.criterio}-${index}`} className="rounded-md border p-2">
                                                <div className="mb-2 flex items-center justify-between">
                                                    <span className="text-sm font-medium capitalize">{accion.criterio.replace(/_/g, ' ')}</span>
                                                    <Button type="button" variant="ghost" size="sm" onClick={() => eliminarAccion(editingInfraestructura.id, index)} className="text-destructive">
                                                        <Trash2 className="mr-2 h-4 w-4" /> Eliminar
                                                    </Button>
                                                </div>
                                                <div className="grid gap-2 md:grid-cols-2">
                                                    <Input value={accion.descripcion} onChange={(e) => actualizarAccion(editingInfraestructura.id, index, 'descripcion', e.target.value)} placeholder="Descripción" />
                                                    <Input value={accion.responsable} onChange={(e) => actualizarAccion(editingInfraestructura.id, index, 'responsable', e.target.value)} placeholder="Responsable" />
                                                    <Input type="date" value={accion.fecha_ejecucion} onChange={(e) => actualizarAccion(editingInfraestructura.id, index, 'fecha_ejecucion', e.target.value)} />
                                                    <Input value={accion.tipo_accion} onChange={(e) => actualizarAccion(editingInfraestructura.id, index, 'tipo_accion', e.target.value)} placeholder="Tipo de acción" />
                                                    <Input value={accion.referencia} onChange={(e) => actualizarAccion(editingInfraestructura.id, index, 'referencia', e.target.value)} placeholder="Referencia" />
                                                    <Input value={accion.estado} onChange={(e) => actualizarAccion(editingInfraestructura.id, index, 'estado', e.target.value)} placeholder="Estado" />
                                                    <div className="md:col-span-2">
                                                        <Textarea value={accion.observaciones} onChange={(e) => actualizarAccion(editingInfraestructura.id, index, 'observaciones', e.target.value)} placeholder="Observaciones del hallazgo" />
                                                    </div>
                                                </div>
                                            </div>
                                        ))
                                    )}
                                </div>
                            </div>
                        </>
                    ) : null}
                </DialogContent>
            </Dialog>
        </AppLayout>
    );
}
