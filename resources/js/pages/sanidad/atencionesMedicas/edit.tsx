import { Button } from '@/components/ui/button';
import FormInput from '@/components/ui/form-input';
import FormSelect from '@/components/ui/form-select';
import { Textarea } from '@/components/ui/textarea';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, useForm } from '@inertiajs/react';
import * as React from 'react';
import { route } from 'ziggy-js';
import { CalendarIcon, Activity, Heart, Thermometer, Wind } from 'lucide-react';
import { Label } from '@/components/ui/label';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Atenciones Médicas', href: '/sanidad/atenciones-medicas' },
    { title: 'Editar Atención', href: '#' },
];

interface PageProps {
    atencion: any; // Datos de la atención a editar
    medicos: { id: number; nombre: string; apellido: string }[];
    pacientes: { id: number; nombre: string; apellido: string; codigo: string }[];
    policlinicos: { id: number; nombre: string }[];
    estados: { id: number; nombre: string }[];
}

export default function Edit({ atencion, medicos, pacientes, policlinicos, estados }: PageProps) {
    const { data, setData, put, processing, errors } = useForm({
        medico: atencion.medico?.toString() || '',
        paciente: atencion.paciente?.toString() || '',
        fecha_incidente: atencion.fecha_incidente ? atencion.fecha_incidente.slice(0, 16) : '',
        fecha_atencion: atencion.fecha_atencion?.slice(0, 16) || '',
        motivo_consulta: atencion.motivo_consulta || '',
        descripcion: atencion.descripcion || '',
        diagnostico: atencion.diagnostico || '',
        gravedad: atencion.gravedad || '',
        temperatura: atencion.temperatura?.toString() || '',
        presion_arterial: atencion.presion_arterial || '',
        frecuencia_respiratoria: atencion.frecuencia_respiratoria?.toString() || '',
        frecuencia_cardiaca: atencion.frecuencia_cardiaca?.toString() || '',
        tratamiento: atencion.tratamiento || '',
        transferencia: atencion.transferencia || false,
        policlinico_id: atencion.policlinico_id?.toString() || '',
        estado_id: atencion.estado_id?.toString() || '',
        fecha_alta: atencion.fecha_alta ? atencion.fecha_alta.slice(0, 16) : '',
        descripcion_alta: atencion.descripcion_alta || '',
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        put(route('atenciones-medicas.update', atencion.id));
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Editar Atención Médica" />
            <div className="px-4 sm:px-6 py-4 max-w-7xl mx-auto">
                <div className="mb-6">
                    <h1 className="text-2xl font-bold text-foreground">
                        Editar Atención Médica
                    </h1>
                    <p className="mt-1 text-sm text-muted-foreground">
                        Modifique los campos necesarios
                    </p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Sección: Datos básicos */}
                    {/* Sección: Datos básicos */}
                    <div className="bg-card rounded-lg border border-border shadow-sm p-4">
                        <div className="mb-4">
                            <h2 className="text-base font-semibold text-foreground flex items-center">
                                <CalendarIcon className="h-4 w-4 mr-2 text-primary" />
                                Datos de la atención
                            </h2>
                        </div>
                        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                            <FormSelect
                                label="Paciente"
                                value={data.paciente}
                                onChange={(v) => setData('paciente', v)}
                                placeholder="Seleccione paciente"
                                options={pacientes.map((p) => ({
                                    value: p.id.toString(),
                                    label: `${p.codigo}:${p.name} ${p.apellido}`,
                                }))}
                                error={errors.paciente}
                            />
                            <FormInput
                                id="fecha_incidente"
                                label="Fecha del incidente"
                                type="datetime-local"
                                value={data.fecha_incidente}
                                onChange={(e) => setData('fecha_incidente', e.target.value)}
                                error={errors.fecha_incidente}
                            />
                            <FormInput
                                id="fecha_atencion"
                                label="Fecha de atención"
                                type="datetime-local"
                                value={data.fecha_atencion}
                                onChange={(e) => setData('fecha_atencion', e.target.value)}
                                error={errors.fecha_atencion}
                            />
                            <FormSelect
                                label="Motivo de consulta"
                                value={data.motivo_consulta}
                                onChange={(v) => setData('motivo_consulta', v)}
                                placeholder="Porque razon consulta"
                                options={[
                                    { value: 'Riesgo profesional', label: 'Riesgo profesional' },
                                    { value: 'Riesgo común', label: 'Riesgo común' },
                                    { value: 'Maternidad', label: 'Maternidad' },
                                ]}
                                error={errors.gravedad}
                            />
                            <FormSelect
                                label="Gravedad"
                                value={data.gravedad}
                                onChange={(v) => setData('gravedad', v)}
                                placeholder="Seleccione gravedad"
                                options={[
                                    { value: 'Leve', label: 'Leve' },
                                    { value: 'Moderado', label: 'Moderado' },
                                    { value: 'Grave', label: 'Grave' },
                                ]}
                                error={errors.gravedad}
                            />
                        </div>
                    </div>

                    {/* Sección: Signos vitales */}
                    <div className="bg-card rounded-lg border border-border shadow-sm p-4">
                        <div className="mb-4">
                            <h2 className="text-base font-semibold text-foreground flex items-center">
                                <Activity className="h-4 w-4 mr-2 text-green-500" />
                                Signos vitales
                            </h2>
                        </div>
                        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
                            <FormInput
                                id="temperatura"
                                label="Temperatura (°C)"
                                type="number"
                                step="0.1"
                                value={data.temperatura}
                                onChange={(e) => setData('temperatura', e.target.value)}
                                placeholder="36.5"
                                error={errors.temperatura}
                            />
                            <FormInput
                                id="presion_arterial"
                                label="Presión arterial"
                                value={data.presion_arterial}
                                onChange={(e) => setData('presion_arterial', e.target.value)}
                                placeholder="120/80"
                                error={errors.presion_arterial}
                            />
                            <FormInput
                                id="frecuencia_respiratoria"
                                label="Frec. respiratoria (rpm)"
                                type="number"
                                value={data.frecuencia_respiratoria}
                                onChange={(e) => setData('frecuencia_respiratoria', e.target.value)}
                                placeholder="16"
                                error={errors.frecuencia_respiratoria}
                            />
                            <FormInput
                                id="frecuencia_cardiaca"
                                label="Frec. cardíaca (lpm)"
                                type="number"
                                value={data.frecuencia_cardiaca}
                                onChange={(e) => setData('frecuencia_cardiaca', e.target.value)}
                                placeholder="72"
                                error={errors.frecuencia_cardiaca}
                            />
                        </div>
                    </div>

                    {/* Sección: Diagnóstico y tratamiento */}
                    <div className="bg-card rounded-lg border border-border shadow-sm p-4">
                        <div className="mb-4">
                            <h2 className="text-base font-semibold text-foreground flex items-center">
                                <Heart className="h-4 w-4 mr-2 text-red-500" />
                                Diagnóstico y tratamiento
                            </h2>
                        </div>
                        <div className="space-y-4">
                            <div>
                                <Label htmlFor="descripcion">Descripcion</Label>
                                <Textarea
                                    id="descripcion"
                                    value={data.descripcion}
                                    onChange={(e) => setData('descripcion', e.target.value)}
                                    placeholder="Descripción detallada de la atención..."
                                    rows={3}
                                />
                            </div>
                            <div>
                                <Label htmlFor="diagnostico">Diagnóstico</Label>
                                <Textarea
                                    id="diagnostico"
                                    value={data.diagnostico}
                                    onChange={(e) => setData('diagnostico', e.target.value)}
                                    placeholder="Diagnóstico médico..."
                                    rows={2}
                                />
                            </div>
                            <div>
                                <Label htmlFor="tratamiento">Tratamiento</Label>
                                <Textarea
                                    id="tratamiento"
                                    value={data.tratamiento}
                                    onChange={(e) => setData('tratamiento', e.target.value)}
                                    placeholder="Tratamiento indicado..."
                                    rows={2}
                                />
                            </div>
                        </div>
                    </div>

                    {/* Sección: Derivación y estado */}
                    <div className="bg-card rounded-lg border border-border shadow-sm p-4">
                        <div className="mb-4">
                            <h2 className="text-base font-semibold text-foreground flex items-center">
                                <Wind className="h-4 w-4 mr-2 text-purple-500" />
                                Derivación y cierre
                            </h2>
                        </div>
                        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                            <div className="flex items-center space-x-2">
                                <input
                                    type="checkbox"
                                    id="transferencia"
                                    checked={data.transferencia}
                                    onChange={(e) => setData('transferencia', e.target.checked)}
                                    className="rounded border-gray-300 text-primary shadow-sm focus:border-primary focus:ring focus:ring-primary/20"
                                />
                                <label htmlFor="transferencia" className="text-sm font-medium">
                                    Requiere transferencia a centro de especialidad
                                </label>
                            </div>
                            {data.transferencia && (
                                <FormSelect
                                    label="Policlínico destino"
                                    value={data.policlinico_id}
                                    onChange={(v) => setData('policlinico_id', v)}
                                    placeholder="Seleccione policlínico"
                                    options={policlinicos.map((p) => ({
                                        value: p.id.toString(),
                                        label: p.nombre,
                                    }))}
                                    error={errors.policlinico_id}
                                />
                            )}
                            <FormSelect
                                label="Estado de la atención"
                                value={data.estado_id}
                                onChange={(v) => setData('estado_id', v)}
                                placeholder="Seleccione estado"
                                options={estados.map((e) => ({
                                    value: e.id.toString(),
                                    label: e.nombre,
                                }))}
                                error={errors.estado_id}
                            />
                            {data.estado_id && estados.find(e => e.id.toString() === data.estado_id)?.nombre === 'Completado' && (
                                <>
                                    <FormInput
                                        id="fecha_alta"
                                        label="Fecha de alta"
                                        type="datetime-local"
                                        value={data.fecha_alta}
                                        onChange={(e) => setData('fecha_alta', e.target.value)}
                                        error={errors.fecha_alta}
                                    />
                                    <div>
                                        <Label htmlFor="descripcion_alta">Descripcion de la alta</Label>
                                        <Textarea
                                            id="descripcion_alta"
                                            value={data.descripcion_alta}
                                            onChange={(e) => setData('descripcion_alta', e.target.value)}
                                            placeholder="Indicaciones al alta..."
                                            rows={2}
                                        />
                                    </div>

                                </>
                            )}
                        </div>
                    </div>
                    {/* Botones */}
                    <div className="bg-card rounded-lg border border-border shadow-sm p-4">
                        <div className="flex flex-col sm:flex-row gap-3 justify-end">
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => window.history.back()}
                                className="sm:w-32 w-full"
                            >
                                Cancelar
                            </Button>
                            <Button
                                type="submit"
                                disabled={processing}
                                className="sm:w-40 w-full"
                            >
                                {processing ? (
                                    <div className="flex items-center justify-center">
                                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                                        Actualizando...
                                    </div>
                                ) : (
                                    'Actualizar Atención'
                                )}
                            </Button>
                        </div>
                    </div>
                </form>
            </div>
        </AppLayout>
    );
}