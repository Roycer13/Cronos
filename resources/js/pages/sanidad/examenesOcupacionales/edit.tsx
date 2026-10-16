import { Button } from '@/components/ui/button';
import FormInput from '@/components/ui/form-input';
import FormSelect from '@/components/ui/form-select';
import { Textarea } from '@/components/ui/textarea';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, useForm } from '@inertiajs/react';
import { useEffect } from 'react';
import { route } from 'ziggy-js';
import { Calendar, User, Briefcase, Heart, Activity, AlertCircle } from 'lucide-react';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Exámenes Ocupacionales', href: '/sanidad/examenes-ocupacionales' },
    { title: 'Editar Examen', href: '#' },
];

interface PageProps {
    examen: any;
    empleados?: { id: number; name: string; apellido: string; codigo: string }[];
    policlinicos?: { id: number; nombre: string }[];
    tiposExamen?: { value: string; label: string }[];
}

// Definir interfaz para los datos del formulario
interface ExamenOcupacionalForm {
    tipo_examen: string;
    fecha_examen: string;
    empleado_id: string;
    policlinico_id: string;
    entidad_anterior: string;
    ocupacion_anterior: string;
    fecha_inicio: string;
    fecha_fin: string;
    tiempo_servicio_total: string;
    enfermedad_profesional: string;
    accidentes_trabajo: string;
    patologias: boolean;
    patologias_lista: string;
    grupo_sanguineo: string;
    intervenciones_quirurgicas: string;
    patologias_personales: string;
    vacunas_tipo_dosis: string;
    vacunas_fecha_ultima_dosis: string;
    habitos_deportes: string;
    examen_psicologico: string;
    tipo_menstrual: string;
    dismenorrea: boolean;
    menarquia: string;
    gesta: string;
    numero_hijos: string;
    peso_kg: string;
    estatura_m: string;
    temperatura_c: string;
    presion_arterial_mmhg: string;
    frecuencia_respiratoria_pm: string;
    pulso_lpm: string;
    indice_masa_corporal: string;
    imc_estado: string;
    segmentario_cabeza: string;
    segmentario_cara: string;
    segmentario_ojos: string;
    segmentario_oidos: string;
    segmentario_fosas_nasales: string;
    segmentario_boca_faringe: string;
    segmentario_dientes: string;
    segmentario_cuello: string;
    segmentario_piel: string;
    segmentario_torax: string;
    segmentario_corazon: string;
    segmentario_pulmones: string;
    segmentario_abdomen: string;
    segmentario_genitourinario: string;
    segmentario_extremidades: string;
    segmentario_columna: string;
    segmentario_neurologico_mental: string;
    transferencia_requerida: boolean;
    especialidad_derivacion: string;
    aptitud_ocupacional: string;
    concepto_final_aptitud: string;
    recomendaciones: string;
}

export default function Edit({
    examen,
    empleados = [],        // valor por defecto para evitar undefined
    policlinicos = [],
    tiposExamen = [],
}: PageProps) {
    // Función para convertir fecha YYYY-MM-DD a YYYY-MM (para inputs month)
    const toMonthFormat = (fecha: string | null) => {
        if (!fecha) return '';
        return fecha.slice(0, 7); // "2025-06-01" → "2025-06"
    };

    // Tipamos useForm con la interfaz
    const { data, setData, put, processing, errors } = useForm<ExamenOcupacionalForm>({
        tipo_examen: examen.tipo_examen || '',
        fecha_examen: examen.fecha_examen?.slice(0, 16) || '',
        empleado_id: examen.empleado_id?.toString() || '',
        policlinico_id: examen.policlinico_id?.toString() || '',
        entidad_anterior: examen.entidad_anterior || '',
        ocupacion_anterior: examen.ocupacion_anterior || '',
        fecha_inicio: toMonthFormat(examen.fecha_inicio),
        fecha_fin: toMonthFormat(examen.fecha_fin),
        tiempo_servicio_total: examen.tiempo_servicio_total?.toString() || '',
        enfermedad_profesional: examen.enfermedad_profesional || '',
        accidentes_trabajo: examen.accidentes_trabajo || '',
        patologias: examen.patologias || false,
        patologias_lista: Array.isArray(examen.patologias_lista) ? examen.patologias_lista.join('\n') : '',
        grupo_sanguineo: examen.grupo_sanguineo || '',
        intervenciones_quirurgicas: examen.intervenciones_quirurgicas || '',
        patologias_personales: examen.patologias_personales || '',
        vacunas_tipo_dosis: Array.isArray(examen.vacunas_tipo_dosis) ? examen.vacunas_tipo_dosis.join('\n') : '',
        vacunas_fecha_ultima_dosis: Array.isArray(examen.vacunas_fecha_ultima_dosis) ? examen.vacunas_fecha_ultima_dosis.join('\n') : '',
        habitos_deportes: Array.isArray(examen.habitos_deportes) ? examen.habitos_deportes.join('\n') : '',
        examen_psicologico: examen.examen_psicologico || '',
        tipo_menstrual: examen.tipo_menstrual || '',
        dismenorrea: examen.dismenorrea || false,
        menarquia: examen.menarquia?.toString() || '',
        gesta: examen.gesta?.toString() || '',
        numero_hijos: examen.numero_hijos?.toString() || '',
        peso_kg: examen.peso_kg?.toString() || '',
        estatura_m: examen.estatura_m?.toString() || '',
        temperatura_c: examen.temperatura_c?.toString() || '',
        presion_arterial_mmhg: examen.presion_arterial_mmhg || '',
        frecuencia_respiratoria_pm: examen.frecuencia_respiratoria_pm?.toString() || '',
        pulso_lpm: examen.pulso_lpm?.toString() || '',
        indice_masa_corporal: examen.indice_masa_corporal?.toString() || '',
        imc_estado: examen.imc_estado || '',
        segmentario_cabeza: examen.segmentario_cabeza || '',
        segmentario_cara: examen.segmentario_cara || '',
        segmentario_ojos: examen.segmentario_ojos || '',
        segmentario_oidos: examen.segmentario_oidos || '',
        segmentario_fosas_nasales: examen.segmentario_fosas_nasales || '',
        segmentario_boca_faringe: examen.segmentario_boca_faringe || '',
        segmentario_dientes: examen.segmentario_dientes || '',
        segmentario_cuello: examen.segmentario_cuello || '',
        segmentario_piel: examen.segmentario_piel || '',
        segmentario_torax: examen.segmentario_torax || '',
        segmentario_corazon: examen.segmentario_corazon || '',
        segmentario_pulmones: examen.segmentario_pulmones || '',
        segmentario_abdomen: examen.segmentario_abdomen || '',
        segmentario_genitourinario: examen.segmentario_genitourinario || '',
        segmentario_extremidades: examen.segmentario_extremidades || '',
        segmentario_columna: examen.segmentario_columna || '',
        segmentario_neurologico_mental: examen.segmentario_neurologico_mental || '',
        transferencia_requerida: examen.transferencia_requerida || false,
        especialidad_derivacion: examen.especialidad_derivacion || '',
        aptitud_ocupacional: examen.aptitud_ocupacional || '',
        concepto_final_aptitud: examen.concepto_final_aptitud || '',
        recomendaciones: examen.recomendaciones || '',
    });

    // Efecto para calcular tiempo de servicio
    useEffect(() => {
        if (data.fecha_inicio && data.fecha_fin) {
            const [inicioYear, inicioMonth] = data.fecha_inicio.split('-').map(Number);
            const [finYear, finMonth] = data.fecha_fin.split('-').map(Number);

            const totalMeses = (finYear - inicioYear) * 12 + (finMonth - inicioMonth);
            if (totalMeses >= 0) {
                const años = totalMeses / 12;
                setData('tiempo_servicio_total', años.toFixed(2));
            } else {
                setData('tiempo_servicio_total', '');
            }
        } else {
            setData('tiempo_servicio_total', '');
        }
    }, [data.fecha_inicio, data.fecha_fin]);

    // Efecto para calcular IMC y estado
    useEffect(() => {
        const peso = parseFloat(data.peso_kg);
        const estatura = parseFloat(data.estatura_m);

        if (peso > 0 && estatura > 0) {
            const imc = peso / (estatura * estatura);
            const imcRedondeado = Math.round(imc * 100) / 100;
            setData('indice_masa_corporal', imcRedondeado.toString());

            let estado = '';
            if (imc < 18.5) estado = 'Bajo peso';
            else if (imc >= 18.5 && imc < 25) estado = 'Normal';
            else if (imc >= 25 && imc < 30) estado = 'Sobrepeso';
            else if (imc >= 30 && imc < 35) estado = 'Obesidad grado I';
            else if (imc >= 35 && imc < 40) estado = 'Obesidad grado II';
            else if (imc >= 40) estado = 'Obesidad grado III';
            setData('imc_estado', estado);
        } else {
            setData('indice_masa_corporal', '');
            setData('imc_estado', '');
        }
    }, [data.peso_kg, data.estatura_m]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        put(route('examenes-ocupacionales.update', examen.id));
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Editar Examen Ocupacional" />
            <div className="px-4 sm:px-6 py-4 max-w-7xl mx-auto">
                <div className="mb-6">
                    <h1 className="text-2xl font-bold text-foreground">Editar Examen Ocupacional</h1>
                    <p className="text-sm text-muted-foreground">
                        Modifique la información del examen ocupacional.
                    </p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Sección 1: Datos generales */}
                    <div className="bg-card rounded-lg border border-border shadow-sm p-4">
                        <h2 className="text-lg font-semibold mb-4 flex items-center">
                            <Calendar className="h-5 w-5 mr-2 text-primary" />
                            Datos generales
                        </h2>
                        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                            <FormSelect
                                label="Tipo de examen *"
                                value={data.tipo_examen}
                                onChange={(v: string) => setData('tipo_examen', v)}
                                placeholder="Seleccione tipo"
                                options={tiposExamen}
                                error={errors.tipo_examen}
                            />
                            <FormInput
                                id="fecha_examen"
                                label="Fecha del examen *"
                                type="datetime-local"
                                value={data.fecha_examen}
                                onChange={(e) => setData('fecha_examen', e.target.value)}
                                error={errors.fecha_examen}
                                required
                            />
                            <FormSelect
                                label="Empleado *"
                                value={data.empleado_id}
                                onChange={(v: string) => setData('empleado_id', v)}
                                placeholder="Seleccione empleado"
                                options={empleados.map((e) => ({
                                    value: e.id.toString(),
                                    label: `${e.codigo} : ${e.name} ${e.apellido}`,
                                }))}
                                error={errors.empleado_id}
                            />
                            <FormSelect
                                label="Policlínico (si aplica)"
                                value={data.policlinico_id}
                                onChange={(v: string) => setData('policlinico_id', v)}
                                placeholder="Seleccione policlínico"
                                options={policlinicos.map((p) => ({
                                    value: p.id.toString(),
                                    label: p.nombre,
                                }))}
                                error={errors.policlinico_id}
                            />
                        </div>
                    </div>

                    {/* Sección 2: Record de servicios */}
                    <div className="bg-card rounded-lg border border-border shadow-sm p-4">
                        <h2 className="text-lg font-semibold mb-4 flex items-center">
                            <Briefcase className="h-5 w-5 mr-2 text-blue-500" />
                            Record de servicios
                        </h2>
                        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                            <FormInput
                                id="entidad_anterior"
                                label="Entidad anterior"
                                value={data.entidad_anterior}
                                onChange={(e) => setData('entidad_anterior', e.target.value)}
                                error={errors.entidad_anterior}
                            />
                            <FormInput
                                id="ocupacion_anterior"
                                label="Ocupación anterior"
                                value={data.ocupacion_anterior}
                                onChange={(e) => setData('ocupacion_anterior', e.target.value)}
                                error={errors.ocupacion_anterior}
                            />
                            <FormInput
                                id="fecha_inicio"
                                label="Fecha inicio"
                                type="month"
                                value={data.fecha_inicio}
                                onChange={(e) => setData('fecha_inicio', e.target.value)}
                                error={errors.fecha_inicio}
                            />
                            <FormInput
                                id="fecha_fin"
                                label="Fecha fin"
                                type="month"
                                value={data.fecha_fin}
                                onChange={(e) => setData('fecha_fin', e.target.value)}
                                error={errors.fecha_fin}
                                placeholder="Seleccione mes y año"
                            />
                            <FormInput
                                id="tiempo_servicio_total"
                                label="Tiempo total (años)"
                                type="number"
                                step="0.01"
                                value={data.tiempo_servicio_total}
                                onChange={() => { }} // vacío
                                disabled
                                error={errors.tiempo_servicio_total}
                            />
                            <FormInput
                                id="enfermedad_profesional"
                                label="Enfermedad profesional"
                                value={data.enfermedad_profesional}
                                onChange={(e) => setData('enfermedad_profesional', e.target.value)}
                                error={errors.enfermedad_profesional}
                            />
                            <FormInput
                                id="accidentes_trabajo"
                                label="Accidentes de trabajo"
                                value={data.accidentes_trabajo}
                                onChange={(e) => setData('accidentes_trabajo', e.target.value)}
                                error={errors.accidentes_trabajo}
                            />
                        </div>
                    </div>

                    {/* Sección 3: Antecedentes familiares */}
                    <div className="bg-card rounded-lg border border-border shadow-sm p-4">
                        <h2 className="text-lg font-semibold mb-4 flex items-center">
                            <Heart className="h-5 w-5 mr-2 text-red-500" />
                            Antecedentes familiares
                        </h2>
                        <div className="space-y-4">
                            <div className="flex items-center space-x-2">
                                <Checkbox
                                    id="patologias"
                                    checked={data.patologias}
                                    onCheckedChange={(checked) => setData('patologias', !!checked)}
                                />
                                <Label htmlFor="patologias">¿Tiene patologías familiares?</Label>
                            </div>
                            {data.patologias && (
                                <div>
                                    <Label htmlFor="patologias_lista">Lista de patologías (una por línea)</Label>
                                    <Textarea
                                        id="patologias_lista"
                                        value={data.patologias_lista}
                                        onChange={(e) => setData('patologias_lista', e.target.value)}
                                        placeholder="Ej: Hipertensión&#10;Diabetes&#10;Cáncer"
                                        rows={3}
                                    />
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Sección 4: Antecedentes personales */}
                    <div className="bg-card rounded-lg border border-border shadow-sm p-4">
                        <h2 className="text-lg font-semibold mb-4 flex items-center">
                            <User className="h-5 w-5 mr-2 text-green-500" />
                            Antecedentes personales
                        </h2>
                        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                            <FormSelect
                                label="Grupo sanguíneo"
                                value={data.grupo_sanguineo}
                                onChange={(v) => setData('grupo_sanguineo', v)}
                                placeholder="Seleccione"
                                options={[
                                    'A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-',
                                ].map(g => ({ value: g, label: g }))}
                                error={errors.grupo_sanguineo}
                            />
                            <FormInput
                                id="intervenciones_quirurgicas"
                                label="Intervenciones quirúrgicas"
                                value={data.intervenciones_quirurgicas}
                                onChange={(e) => setData('intervenciones_quirurgicas', e.target.value)}
                                error={errors.intervenciones_quirurgicas}
                            />
                            <FormInput
                                id="patologias_personales"
                                label="Patologías personales"
                                value={data.patologias_personales}
                                onChange={(e) => setData('patologias_personales', e.target.value)}
                                error={errors.patologias_personales}
                            />
                        </div>
                        <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
                            <div>
                                <Label htmlFor="vacunas_tipo_dosis">Vacunas (tipo/dosis) - una por línea</Label>
                                <Textarea
                                    id="vacunas_tipo_dosis"
                                    value={data.vacunas_tipo_dosis}
                                    onChange={(e) => setData('vacunas_tipo_dosis', e.target.value)}
                                    placeholder="Hepatitis B 1ra&#10;Tétanos refuerzo"
                                    rows={3}
                                />
                            </div>
                            <div>
                                <Label htmlFor="vacunas_fecha_ultima_dosis">Fechas última dosis (una por línea, en el mismo orden)</Label>
                                <Textarea
                                    id="vacunas_fecha_ultima_dosis"
                                    value={data.vacunas_fecha_ultima_dosis}
                                    onChange={(e) => setData('vacunas_fecha_ultima_dosis', e.target.value)}
                                    placeholder="2020-05-10&#10;2022-01-15"
                                    rows={3}
                                />
                            </div>
                        </div>
                    </div>

                    {/* Sección 5: Hábitos / deportes */}
                    <div className="bg-card rounded-lg border border-border shadow-sm p-4">
                        <h2 className="text-lg font-semibold mb-4 flex items-center">
                            <Activity className="h-5 w-5 mr-2 text-purple-500" />
                            Hábitos / Deportes
                        </h2>
                        <div>
                            <Label htmlFor="habitos_deportes">Describa hábitos y deportes (uno por línea)</Label>
                            <Textarea
                                id="habitos_deportes"
                                value={data.habitos_deportes}
                                onChange={(e) => setData('habitos_deportes', e.target.value)}
                                placeholder="Fumador (10 cig/día)&#10;Deporte: fútbol 2x semana"
                                rows={3}
                            />
                        </div>
                    </div>

                    {/* Sección 6: Examen psicológico */}
                    <div className="bg-card rounded-lg border border-border shadow-sm p-4">
                        <h2 className="text-lg font-semibold mb-4 flex items-center">
                            <Activity className="h-5 w-5 mr-2 text-indigo-500" />
                            Examen psicológico elemental
                        </h2>
                        <div>
                            <label htmlFor="examen_psicologico">Observaciones</label>
                            <Textarea
                                id="examen_psicologico"
                                value={data.examen_psicologico}
                                onChange={(e) => setData('examen_psicologico', e.target.value)}
                                placeholder="Integridad, estado mental, emocional, aptitud, relaciones humanas, ambiente familiar, motivación..."
                                rows={4}
                            />
                        </div>
                    </div>

                    {/* Sección 7: Historial ginecobstétrico */}
                    <div className="bg-card rounded-lg border border-border shadow-sm p-4">
                        <h2 className="text-lg font-semibold mb-4 flex items-center">
                            <User className="h-5 w-5 mr-2 text-pink-500" />
                            Historial ginecobstétrico (solo femenino)
                        </h2>
                        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                            <FormInput
                                id="tipo_menstrual"
                                label="Tipo menstrual"
                                value={data.tipo_menstrual}
                                onChange={(e) => setData('tipo_menstrual', e.target.value)}
                                error={errors.tipo_menstrual}
                            />
                            <div className="flex items-center space-x-2">
                                <Checkbox
                                    id="dismenorrea"
                                    checked={data.dismenorrea}
                                    onCheckedChange={(checked) => setData('dismenorrea', !!checked)}
                                />
                                <Label htmlFor="dismenorrea">Dismenorrea</Label>
                            </div>
                            <FormInput
                                id="menarquia"
                                label="Menarquia (edad)"
                                type="number"
                                min="0"
                                max="30"
                                value={data.menarquia}
                                onChange={(e) => setData('menarquia', e.target.value)}
                                error={errors.menarquia}
                            />
                            <FormInput
                                id="gesta"
                                label="Gesta"
                                type="number"
                                min="0"
                                value={data.gesta}
                                onChange={(e) => setData('gesta', e.target.value)}
                                error={errors.gesta}
                            />
                            <FormInput
                                id="numero_hijos"
                                label="Número de hijos"
                                type="number"
                                min="0"
                                value={data.numero_hijos}
                                onChange={(e) => setData('numero_hijos', e.target.value)}
                                error={errors.numero_hijos}
                            />
                        </div>
                    </div>

                    {/* Sección 8: Examen físico */}
                    <div className="bg-card rounded-lg border border-border shadow-sm p-4">
                        <h2 className="text-lg font-semibold mb-4 flex items-center">
                            <Heart className="h-5 w-5 mr-2 text-red-500" />
                            Examen físico
                        </h2>
                        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                            <FormInput
                                id="peso_kg"
                                label="Peso (kg)"
                                type="number"
                                step="0.01"
                                value={data.peso_kg}
                                onChange={(e) => setData('peso_kg', e.target.value)}
                                error={errors.peso_kg}
                            />
                            <FormInput
                                id="estatura_m"
                                label="Estatura (m)"
                                type="number"
                                step="0.01"
                                value={data.estatura_m}
                                onChange={(e) => setData('estatura_m', e.target.value)}
                                error={errors.estatura_m}
                            />
                            <FormInput
                                id="temperatura_c"
                                label="Temperatura (°C)"
                                type="number"
                                step="0.1"
                                value={data.temperatura_c}
                                onChange={(e) => setData('temperatura_c', e.target.value)}
                                error={errors.temperatura_c}
                            />
                            <FormInput
                                id="presion_arterial_mmhg"
                                label="Presión arterial (mmHg)"
                                value={data.presion_arterial_mmhg}
                                onChange={(e) => setData('presion_arterial_mmhg', e.target.value)}
                                placeholder="120/80"
                                error={errors.presion_arterial_mmhg}
                            />
                            <FormInput
                                id="frecuencia_respiratoria_pm"
                                label="Frec. respiratoria (rpm)"
                                type="number"
                                value={data.frecuencia_respiratoria_pm}
                                onChange={(e) => setData('frecuencia_respiratoria_pm', e.target.value)}
                                error={errors.frecuencia_respiratoria_pm}
                            />
                            <FormInput
                                id="pulso_lpm"
                                label="Pulso (lpm)"
                                type="number"
                                value={data.pulso_lpm}
                                onChange={(e) => setData('pulso_lpm', e.target.value)}
                                error={errors.pulso_lpm}
                            />
                            <FormInput
                                id="indice_masa_corporal"
                                label="IMC"
                                type="number"
                                step="0.01"
                                value={data.indice_masa_corporal}
                                onChange={() => { }}
                                disabled
                                error={errors.indice_masa_corporal}
                            />
                            <FormInput
                                id="imc_estado"
                                label="Estado IMC"
                                value={data.imc_estado}
                                onChange={() => { }}
                                disabled
                                error={errors.imc_estado}
                            />
                        </div>
                    </div>

                    {/* Sección 9: Examen segmentario */}
                    <div className="bg-card rounded-lg border border-border shadow-sm p-4">
                        <h2 className="text-lg font-semibold mb-4 flex items-center">
                            <Activity className="h-5 w-5 mr-2 text-orange-500" />
                            Examen segmentario
                        </h2>
                        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                            <FormInput
                                id="segmentario_cabeza"
                                label="Cabeza"
                                value={data.segmentario_cabeza}
                                onChange={(e) => setData('segmentario_cabeza', e.target.value)}
                            />
                            <FormInput
                                id="segmentario_cara"
                                label="Cara"
                                value={data.segmentario_cara}
                                onChange={(e) => setData('segmentario_cara', e.target.value)}
                            />
                            <FormInput
                                id="segmentario_ojos"
                                label="Ojos"
                                value={data.segmentario_ojos}
                                onChange={(e) => setData('segmentario_ojos', e.target.value)}
                            />
                            <FormInput
                                id="segmentario_oidos"
                                label="Oídos"
                                value={data.segmentario_oidos}
                                onChange={(e) => setData('segmentario_oidos', e.target.value)}
                            />
                            <FormInput
                                id="segmentario_fosas_nasales"
                                label="Fosas nasales"
                                value={data.segmentario_fosas_nasales}
                                onChange={(e) => setData('segmentario_fosas_nasales', e.target.value)}
                            />
                            <FormInput
                                id="segmentario_boca_faringe"
                                label="Boca / faringe"
                                value={data.segmentario_boca_faringe}
                                onChange={(e) => setData('segmentario_boca_faringe', e.target.value)}
                            />
                            <FormInput
                                id="segmentario_dientes"
                                label="Dientes"
                                value={data.segmentario_dientes}
                                onChange={(e) => setData('segmentario_dientes', e.target.value)}
                            />
                            <FormInput
                                id="segmentario_cuello"
                                label="Cuello"
                                value={data.segmentario_cuello}
                                onChange={(e) => setData('segmentario_cuello', e.target.value)}
                            />
                            <FormInput
                                id="segmentario_piel"
                                label="Piel"
                                value={data.segmentario_piel}
                                onChange={(e) => setData('segmentario_piel', e.target.value)}
                            />
                            <FormInput
                                id="segmentario_torax"
                                label="Tórax"
                                value={data.segmentario_torax}
                                onChange={(e) => setData('segmentario_torax', e.target.value)}
                            />
                            <FormInput
                                id="segmentario_corazon"
                                label="Corazón"
                                value={data.segmentario_corazon}
                                onChange={(e) => setData('segmentario_corazon', e.target.value)}
                            />
                            <FormInput
                                id="segmentario_pulmones"
                                label="Pulmones"
                                value={data.segmentario_pulmones}
                                onChange={(e) => setData('segmentario_pulmones', e.target.value)}
                            />
                            <FormInput
                                id="segmentario_abdomen"
                                label="Abdomen"
                                value={data.segmentario_abdomen}
                                onChange={(e) => setData('segmentario_abdomen', e.target.value)}
                            />
                            <FormInput
                                id="segmentario_genitourinario"
                                label="Genitourinario"
                                value={data.segmentario_genitourinario}
                                onChange={(e) => setData('segmentario_genitourinario', e.target.value)}
                            />
                            <FormInput
                                id="segmentario_extremidades"
                                label="Extremidades"
                                value={data.segmentario_extremidades}
                                onChange={(e) => setData('segmentario_extremidades', e.target.value)}
                            />
                            <FormInput
                                id="segmentario_columna"
                                label="Columna"
                                value={data.segmentario_columna}
                                onChange={(e) => setData('segmentario_columna', e.target.value)}
                            />
                            <FormInput
                                id="segmentario_neurologico_mental"
                                label="Neurológico/mental"
                                value={data.segmentario_neurologico_mental}
                                onChange={(e) => setData('segmentario_neurologico_mental', e.target.value)}
                            />
                        </div>
                    </div>

                    {/* Sección 10: Transferencia */}
                    <div className="bg-card rounded-lg border border-border shadow-sm p-4">
                        <h2 className="text-lg font-semibold mb-4 flex items-center">
                            <AlertCircle className="h-5 w-5 mr-2 text-yellow-500" />
                            Transferencia a especialidad
                        </h2>
                        <div className="space-y-4">
                            <div className="flex items-center space-x-2">
                                <Checkbox
                                    id="transferencia_requerida"
                                    checked={data.transferencia_requerida}
                                    onCheckedChange={(checked) => setData('transferencia_requerida', !!checked)}
                                />
                                <Label htmlFor="transferencia_requerida">Requiere transferencia</Label>
                            </div>
                            {data.transferencia_requerida && (
                                <FormInput
                                    id="especialidad_derivacion"
                                    label="Especialidad de derivación *"
                                    value={data.especialidad_derivacion}
                                    onChange={(e) => setData('especialidad_derivacion', e.target.value)}
                                    error={errors.especialidad_derivacion}
                                    required
                                />
                            )}
                        </div>
                    </div>

                    {/* Sección 11: Concepto médico */}
                    <div className="bg-card rounded-lg border border-border shadow-sm p-4">
                        <h2 className="text-lg font-semibold mb-4 flex items-center">
                            <Heart className="h-5 w-5 mr-2 text-green-500" />
                            Concepto de la valoración médica
                        </h2>
                        <div className="grid grid-cols-1 gap-4">
                            <FormSelect
                                label="Aptitud ocupacional"
                                value={data.aptitud_ocupacional}
                                onChange={(v) => setData('aptitud_ocupacional', v)}
                                placeholder="Seleccione"
                                options={[
                                    { value: 'APTO', label: 'Apto' },
                                    { value: 'APTO CON RESTRICCIONES', label: 'Apto con restricciones' },
                                    { value: 'NO APTO', label: 'No apto' },
                                ]}
                                error={errors.aptitud_ocupacional}
                            />
                            <FormInput
                                id="concepto_final_aptitud"
                                label="Concepto final de aptitud"
                                value={data.concepto_final_aptitud}
                                onChange={(e) => setData('concepto_final_aptitud', e.target.value)}
                                error={errors.concepto_final_aptitud}
                            />
                            <FormInput
                                id="recomendaciones"
                                label="Recomendaciones"
                                value={data.recomendaciones}
                                onChange={(e) => setData('recomendaciones', e.target.value)}
                                error={errors.recomendaciones}
                            />
                        </div>
                    </div>

                    {/* Botones de acción */}
                    <div className="bg-card rounded-lg border border-border shadow-sm p-4">
                        <div className="flex flex-col sm:flex-row gap-3 justify-end">
                            <Button type="button" variant="outline" onClick={() => window.history.back()}>
                                Cancelar
                            </Button>
                            <Button type="submit" disabled={processing}>
                                {processing ? 'Actualizando...' : 'Actualizar Examen'}
                            </Button>
                        </div>
                    </div>
                </form>
            </div>
        </AppLayout>
    );
}