import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import AppLayout from '@/layouts/app-layout';
import { Head, useForm, usePage, router } from '@inertiajs/react';
import { ClipboardCheck, Plus, Trash2 } from 'lucide-react';
import { route } from 'ziggy-js';
import FormInput from '@/components/ui/form-input';
import FormSelect from '@/components/ui/form-select';
import { Toast } from '@/components/ui/toast';
import { useState, useEffect } from 'react';

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

export default function Crear() {
    const { infraestructuras } = usePage<{ infraestructuras: Infraestructura[] }>().props;
    const [criteriosActivos, setCriteriosActivos] = useState<string[]>([]);
    const [acciones, setAcciones] = useState<AccionItem[]>([]);
    const [accionPorCriterio, setAccionPorCriterio] = useState<Record<string, AccionItem | null>>({});

    const { data, setData, post, processing, errors } = useForm<any>({
        infraestructura_id: '',
        fecha: new Date().toISOString().slice(0, 16),
        maquina_equipo_ok: true,
        maquina_equipo_observacion: '',
        extra_ok: true,
        extra_observacion: '',
        observacion_general: '',
        acciones: [],
        // Se generarán dinámicamente: pisos_ok, pisos_observacion, etc.
    });

    const cambiarArea = (id: string) => {
        const infra = infraestructuras.find(i => i.id.toString() === id);
        if (infra) {
            const activos: string[] = [];
            if (infra.usa_pisos) activos.push('pisos');
            if (infra.usa_paredes) activos.push('paredes');
            if (infra.usa_techos) activos.push('techos');
            if (infra.usa_puertas) activos.push('puertas');
            if (infra.usa_ventanas) activos.push('ventanas');
            if (infra.usa_drenajes) activos.push('drenajes');
            if (infra.usa_iluminacion) activos.push('iluminacion');
            if (infra.usa_ventilacion) activos.push('ventilacion');
            if (infra.usa_lavamanos) activos.push('lavamanos');
            if (infra.usa_servicios_sanitarios) activos.push('servicios_sanitarios');
            if (infra.usa_almacenamiento) activos.push('almacenamiento');
            if (infra.usa_senalizacion) activos.push('senalizacion');
            if (infra.usa_maquina_equipo) activos.push('maquina_equipo');
            if (infra.usa_extra) activos.push('extra');
            setCriteriosActivos(activos);

            // Inicializar acciones por criterio
            const mapa: Record<string, AccionItem | null> = {};
            activos.forEach(c => { mapa[c] = null; });
            setAccionPorCriterio(mapa);

            // Inicializar datos del formulario
            const nuevos: any = {
                infraestructura_id: id,
                fecha: data.fecha,
                maquina_equipo_ok: data.maquina_equipo_ok ?? true,
                maquina_equipo_observacion: data.maquina_equipo_observacion || '',
                extra_ok: data.extra_ok ?? true,
                extra_observacion: data.extra_observacion || '',
                observacion_general: data.observacion_general,
            };
            activos.forEach(c => {
                nuevos[`${c}_ok`] = true;
                nuevos[`${c}_observacion`] = '';
            });
            setData(nuevos);
        } else {
            setCriteriosActivos([]);
        }
    };

    const agregarAccion = (criterio: string) => {
        setAcciones([...acciones, {
            criterio,
            descripcion: '',
            tipo_accion: '',
            responsable: '',
            fecha_ejecucion: '',
            estado: 'Pendiente',
            referencia: '',
            observaciones: '',
        }]);
    };

    const eliminarAccion = (index: number) => {
        const nuevas = acciones.filter((_, i) => i !== index);
        setAcciones(nuevas);
    };

    const actualizarAccion = (index: number, campo: string, valor: string) => {
        const nuevas = [...acciones];
        (nuevas as any)[index][campo] = valor;
        setAcciones(nuevas);
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        // Combinar acciones existentes con las creadas inline por criterio
        const inlineAcciones = Object.values(accionPorCriterio).filter(a => a && a.descripcion).map(a => a as AccionItem);
        const payload = { ...data, acciones: [...acciones, ...inlineAcciones] };
        router.post(route('inspecciones.store'), payload);
    };

    return (
        <AppLayout breadcrumbs={[{ title: 'Nueva Inspección', href: '#' }]}>
            <Head title="Nueva Inspección de Infraestructura" />
            <div className="px-4 py-6 max-w-4xl mx-auto">
                <Toast />
                <div className="mb-6">
                    <h1 className="text-2xl font-bold flex items-center gap-2">
                        <ClipboardCheck className="h-6 w-6" /> Nueva Inspección BPM
                    </h1>
                    <p className="text-muted-foreground">Seleccione el área y evalúe cada criterio</p>
                </div>

                <form onSubmit={handleSubmit}>
                    <Card className="p-4 mb-4">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <FormSelect
                                label="Área"
                                value={data.infraestructura_id}
                                onChange={(v) => cambiarArea(v)}
                                placeholder="Seleccione área"
                                options={infraestructuras.map(i => ({ value: i.id.toString(), label: i.nombre }))}
                                error={errors.infraestructura_id}
                                required
                            />
                            <FormInput
                                label="Fecha y hora"
                                type="datetime-local"
                                value={data.fecha}
                                onChange={(e) => (setData as any)('fecha', e.target.value)}
                                error={errors.fecha}
                                required
                                id="fecha"
                            />
                        </div>
                    </Card>

                    {criteriosActivos.length > 0 && (
                        <div className="space-y-4">
                            {criteriosActivos.map(criterio => (
                                <Card key={criterio} className="p-4">
                                    <h3 className="font-semibold capitalize mb-3">{criterio.replace(/_/g, ' ')}</h3>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                        <div>
                                            <label className="text-sm font-medium">Estado</label>
                                            <div className="flex gap-4 mt-1">
                                                <label className="flex items-center gap-1">
                                                    <input
                                                        type="radio"
                                                        name={`${criterio}_ok`}
                                                        checked={(data as any)[`${criterio}_ok`] === true}
                                                        onChange={() => (setData as any)(`${criterio}_ok`, true)}
                                                    /> Cumple
                                                </label>
                                                <label className="flex items-center gap-1">
                                                    <input
                                                        type="radio"
                                                        name={`${criterio}_ok`}
                                                        checked={(data as any)[`${criterio}_ok`] === false}
                                                        onChange={() => (setData as any)(`${criterio}_ok`, false)}
                                                    /> No cumple
                                                </label>
                                            </div>
                                        </div>
                                        <FormInput
                                            id={`${criterio}-observacion`}
                                            label="Observación"
                                            value={(data as any)[`${criterio}_observacion`] || ''}
                                            onChange={(e) => (setData as any)(`${criterio}_observacion`, e.target.value)}
                                            placeholder="Detalle si no cumple"
                                        />
                                    </div>
                                    {(data as any)[`${criterio}_ok`] === false && (
                                        <div className="mt-2 space-y-2">
                                            <div className="text-sm font-medium mb-1">Acción rápida para {criterio.replace(/_/g,' ')}</div>
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                                                <FormInput
                                                    id={`${criterio}-accion-descripcion`}
                                                    label="Descripción"
                                                    value={accionPorCriterio[criterio]?.descripcion || ''}
                                                    onChange={(e) => setAccionPorCriterio({ ...accionPorCriterio, [criterio]: { ...(accionPorCriterio[criterio] || { criterio, descripcion: '', tipo_accion: '', responsable: '', fecha_ejecucion: '', estado: 'Pendiente', referencia: '', observaciones: '' }), descripcion: e.target.value } })}
                                                />
                                                <FormInput
                                                    id={`${criterio}-accion-responsable`}
                                                    label="Responsable"
                                                    value={accionPorCriterio[criterio]?.responsable || ''}
                                                    onChange={(e) => setAccionPorCriterio({ ...accionPorCriterio, [criterio]: { ...(accionPorCriterio[criterio] || { criterio, descripcion: '', tipo_accion: '', responsable: '', fecha_ejecucion: '', estado: 'Pendiente', referencia: '', observaciones: '' }), responsable: e.target.value } })}
                                                />
                                                <FormInput
                                                    id={`${criterio}-accion-fecha`}
                                                    label="Fecha ejecución"
                                                    type="date"
                                                    value={accionPorCriterio[criterio]?.fecha_ejecucion || ''}
                                                    onChange={(e) => setAccionPorCriterio({ ...accionPorCriterio, [criterio]: { ...(accionPorCriterio[criterio] || { criterio, descripcion: '', tipo_accion: '', responsable: '', fecha_ejecucion: '', estado: 'Pendiente', referencia: '', observaciones: '' }), fecha_ejecucion: e.target.value } })}
                                                />
                                                <FormSelect
                                                    label="Estado"
                                                    value={accionPorCriterio[criterio]?.estado || 'Pendiente'}
                                                    onChange={(v) => setAccionPorCriterio({ ...accionPorCriterio, [criterio]: { ...(accionPorCriterio[criterio] || { criterio, descripcion: '', tipo_accion: '', responsable: '', fecha_ejecucion: '', estado: 'Pendiente', referencia: '', observaciones: '' }), estado: v } })}
                                                    options={['Pendiente','En Proceso','Cerrada'].map(e => ({ value: e, label: e }))}
                                                />
                                                <FormInput
                                                    id={`${criterio}-accion-referencia`}
                                                    label="Referencia"
                                                    value={accionPorCriterio[criterio]?.referencia || ''}
                                                    onChange={(e) => setAccionPorCriterio({ ...accionPorCriterio, [criterio]: { ...(accionPorCriterio[criterio] || { criterio, descripcion: '', tipo_accion: '', responsable: '', fecha_ejecucion: '', estado: 'Pendiente', referencia: '', observaciones: '' }), referencia: e.target.value } })}
                                                />
                                                <FormInput
                                                    id={`${criterio}-accion-observaciones`}
                                                    label="Observaciones"
                                                    value={accionPorCriterio[criterio]?.observaciones || ''}
                                                    onChange={(e) => setAccionPorCriterio({ ...accionPorCriterio, [criterio]: { ...(accionPorCriterio[criterio] || { criterio, descripcion: '', tipo_accion: '', responsable: '', fecha_ejecucion: '', estado: 'Pendiente', referencia: '', observaciones: '' }), observaciones: e.target.value } })}
                                                />
                                            </div>
                                            <div>
                                                <Button type="button" size="sm" onClick={() => agregarAccion(criterio)}>
                                                    <Plus className="h-4 w-4 mr-1" /> Agregar como acción adicional
                                                </Button>
                                            </div>
                                        </div>
                                    )}
                                </Card>
                            ))}
                        </div>
                    )}

                    {acciones.length > 0 && (
                        <Card className="p-4 mt-4">
                            <h3 className="font-semibold mb-3">Acciones de seguimiento</h3>
                            <div className="space-y-4">
                                {acciones.map((accion, index) => (
                                    <div key={index} className="border p-3 rounded-md relative">
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            className="absolute top-2 right-2 text-destructive"
                                            onClick={() => eliminarAccion(index)}
                                        >
                                            <Trash2 className="h-4 w-4" />
                                        </Button>
                                        <p className="text-sm font-medium mb-2 capitalize">Criterio: {accion.criterio}</p>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                            <FormInput
                                                id={`descripcion-${index}`}
                                                label="Descripción"
                                                value={accion.descripcion}
                                                onChange={(e) => actualizarAccion(index, 'descripcion', e.target.value)}
                                                required
                                            />
                                            <FormInput
                                                id={`tipo-accion-${index}`}
                                                label="Tipo de acción"
                                                value={accion.tipo_accion}
                                                onChange={(e) => actualizarAccion(index, 'tipo_accion', e.target.value)}
                                            />
                                            <FormInput
                                                id={`responsable-${index}`}
                                                label="Responsable"
                                                value={accion.responsable}
                                                onChange={(e) => actualizarAccion(index, 'responsable', e.target.value)}
                                            />
                                            <FormInput
                                                id={`fecha-ejecucion-${index}`}
                                                label="Fecha ejecución"
                                                type="date"
                                                value={accion.fecha_ejecucion}
                                                onChange={(e) => actualizarAccion(index, 'fecha_ejecucion', e.target.value)}
                                            />
                                            <FormSelect
                                                label="Estado"
                                                value={accion.estado}
                                                onChange={(v) => actualizarAccion(index, 'estado', v)}
                                                options={['Pendiente','En Proceso','Cerrada'].map(e => ({ value: e, label: e }))}
                                            />
                                            <FormInput
                                                id={`referencia-${index}`}
                                                label="Referencia"
                                                value={accion.referencia}
                                                onChange={(e) => actualizarAccion(index, 'referencia', e.target.value)}
                                            />
                                            <FormInput
                                                id={`observaciones-${index}`}
                                                label="Observaciones"
                                                value={accion.observaciones}
                                                onChange={(e) => actualizarAccion(index, 'observaciones', e.target.value)}
                                            />
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </Card>
                    )}

                    <div className="mt-4">
                        <FormInput
                            id="observacion_general"
                            label="Observación general"
                            value={data.observacion_general}
                            onChange={(e) => (setData as any)('observacion_general', e.target.value)}
                            placeholder="Observaciones generales de la inspección"
                        />
                    </div>

                    <div className="mt-6 flex justify-end">
                        <Button type="submit" disabled={processing || !data.infraestructura_id} className="gap-2">
                            <ClipboardCheck className="h-4 w-4" />
                            {processing ? 'Guardando...' : 'Registrar Inspección'}
                        </Button>
                    </div>
                </form>
            </div>
        </AppLayout>
    );
}