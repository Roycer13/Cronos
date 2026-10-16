import { Button } from '@/components/ui/button';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, router } from '@inertiajs/react';
import { route } from 'ziggy-js';
import {
    Calendar,
    User,
    Briefcase,
    Heart,
    Activity,
    ArrowLeft,
    Edit,
    FileText,
    AlertCircle,
    CheckCircle,
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/hooks/useAuth';
import { Toast } from '@/components/ui/toast';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Exámenes Ocupacionales', href: '/sanidad/examenes-ocupacionales' },
    { title: 'Detalle del Examen', href: '#' },
];

interface PageProps {
    examen: any;
    flash: {
        success?: string;
        error?: string;
    };
}

export default function Show({ examen, flash }: PageProps) {
    const { hasPermission } = useAuth();

    const getAptitudBadge = (aptitud: string) => {
        const colors: Record<string, string> = {
            APTO: 'bg-green-100 text-green-800 dark:bg-green-800/30 dark:text-green-400',
            'APTO CON RESTRICCIONES': 'bg-yellow-100 text-yellow-800 dark:bg-yellow-800/30 dark:text-yellow-400',
            'NO APTO': 'bg-red-100 text-red-800 dark:bg-red-800/30 dark:text-red-400',
        };
        return colors[aptitud] || 'bg-gray-100 text-gray-800 dark:bg-gray-800/30 dark:text-gray-400';
    };

    const formatMesAnio = (fecha: string | null) => {
        if (!fecha) return '-';
        const [year, month] = fecha.split('-');
        const meses = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];
        return `${meses[parseInt(month) - 1]} ${year}`;
    };

    const formatArray = (arr: any) => {
        if (!arr) return '-';
        if (Array.isArray(arr)) {
            if (arr.length === 0) return '-';
            return (
                <div className="flex flex-wrap gap-1">
                    {arr.map((item, idx) => (
                        <Badge key={idx} variant="outline" className="text-xs">
                            {item}
                        </Badge>
                    ))}
                </div>
            );
        }
        return arr;
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Detalle de Examen Ocupacional" />
            <div className="px-4 sm:px-6 py-4 max-w-7xl mx-auto">
                <Toast />

                <div className="mb-6 flex items-center justify-between">
                    <Button variant="ghost" size="sm" onClick={() => router.visit(route('examenes-ocupacionales.index'))}>
                        <ArrowLeft className="h-4 w-4 mr-2" />
                        Volver al listado
                    </Button>
                    {hasPermission('u_examenOcupacional') && (
                        <Button variant="outline" size="sm" onClick={() => router.visit(route('examenes-ocupacionales.edit', examen.id))}>
                            <Edit className="h-4 w-4 mr-2" />
                            Editar
                        </Button>
                    )}
                </div>

                {/* Cabecera */}
                <div className="bg-card rounded-lg border border-border shadow-sm p-6 mb-6">
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between">
                        <h2 className="text-xl font-bold flex items-center">
                            <Calendar className="h-5 w-5 mr-2 text-primary" />
                            Examen {examen.tipo_examen === 'PRE' ? 'Pre-ocupacional' : examen.tipo_examen === 'POST' ? 'Post-ocupacional' : 'Ocupacional periódico'}
                        </h2>
                        <Badge className={getAptitudBadge(examen.aptitud_ocupacional)}>
                            {examen.aptitud_ocupacional || 'Sin definir'}
                        </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground mt-2">
                        Realizado el {new Date(examen.fecha_examen).toLocaleString('es-ES', { dateStyle: 'long', timeStyle: 'short' })}
                    </p>
                </div>

                {/* Información general */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                    <div className="bg-card rounded-lg border border-border shadow-sm p-4">
                        <h3 className="font-semibold mb-3 flex items-center">
                            <User className="h-4 w-4 mr-2 text-blue-500" />
                            Empleado
                        </h3>
                        <p><span className="text-muted-foreground">Nombre:</span> {examen.empleado?.name} {examen.empleado?.apellido}</p>
                        <p><span className="text-muted-foreground">Código:</span> {examen.empleado?.codigo}</p>
                    </div>
                    <div className="bg-card rounded-lg border border-border shadow-sm p-4">
                        <h3 className="font-semibold mb-3 flex items-center">
                            <User className="h-4 w-4 mr-2 text-green-500" />
                            Médico
                        </h3>
                        <p><span className="text-muted-foreground">Nombre:</span> {examen.medico?.name} {examen.medico?.apellido}</p>
                        <p><span className="text-muted-foreground">Profesión:</span> {examen.medico?.profesion || '-'}</p>
                    </div>
                </div>

                {/* Record de servicios */}
                <div className="bg-card rounded-lg border border-border shadow-sm p-4 mb-6">
                    <h3 className="font-semibold mb-3 flex items-center">
                        <Briefcase className="h-4 w-4 mr-2 text-purple-500" />
                        Record de servicios
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                        <p><span className="text-muted-foreground">Entidad anterior:</span> {examen.entidad_anterior || '-'}</p>
                        <p><span className="text-muted-foreground">Ocupación anterior:</span> {examen.ocupacion_anterior || '-'}</p>
                        <p><span className="text-muted-foreground">Fecha inicio:</span> {formatMesAnio(examen.fecha_inicio)}</p>
                        <p><span className="text-muted-foreground">Fecha fin:</span> {formatMesAnio(examen.fecha_fin)}</p>
                        <p><span className="text-muted-foreground">Tiempo total:</span> {examen.tiempo_servicio_total ? `${examen.tiempo_servicio_total} años` : '-'}</p>
                        <p><span className="text-muted-foreground">Enfermedad profesional:</span> {examen.enfermedad_profesional || '-'}</p>
                        <p><span className="text-muted-foreground">Accidentes de trabajo:</span> {examen.accidentes_trabajo || '-'}</p>
                    </div>
                </div>

                {/* Antecedentes familiares */}
                <div className="bg-card rounded-lg border border-border shadow-sm p-4 mb-6">
                    <h3 className="font-semibold mb-3 flex items-center">
                        <Heart className="h-4 w-4 mr-2 text-red-500" />
                        Antecedentes familiares
                    </h3>
                    <p><span className="text-muted-foreground">¿Patologías?:</span> {examen.patologias ? 'Sí' : 'No'}</p>
                    {examen.patologias && (
                        <div className="mt-2">
                            <span className="text-muted-foreground">Lista:</span>
                            <div className="mt-1">{formatArray(examen.patologias_lista)}</div>
                        </div>
                    )}
                </div>

                {/* Antecedentes personales */}
                <div className="bg-card rounded-lg border border-border shadow-sm p-4 mb-6">
                    <h3 className="font-semibold mb-3 flex items-center">
                        <User className="h-4 w-4 mr-2 text-indigo-500" />
                        Antecedentes personales
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        <p><span className="text-muted-foreground">Grupo sanguíneo:</span> {examen.grupo_sanguineo || '-'}</p>
                        <p><span className="text-muted-foreground">Intervenciones quirúrgicas:</span> {examen.intervenciones_quirurgicas || '-'}</p>
                        <p><span className="text-muted-foreground">Patologías personales:</span> {examen.patologias_personales || '-'}</p>
                    </div>
                    <div className="mt-3">
                        <p className="text-muted-foreground mb-2">Vacunas y fechas de última dosis:</p>
                        {examen.vacunas_tipo_dosis && examen.vacunas_fecha_ultima_dosis ? (
                            <div className="space-y-2">
                                {examen.vacunas_tipo_dosis.map((vacuna: string, index: number) => (
                                    <div key={index} className="flex items-center gap-3 border-b border-border pb-1 last:border-0">
                                        <span className="font-medium">{vacuna}</span>
                                        <span className="text-muted-foreground">→</span>
                                        <span>{examen.vacunas_fecha_ultima_dosis[index] || '-'}</span>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <p>-</p>
                        )}
                    </div>
                </div>

                {/* Hábitos */}
                <div className="bg-card rounded-lg border border-border shadow-sm p-4 mb-6">
                    <h3 className="font-semibold mb-3 flex items-center">
                        <Activity className="h-4 w-4 mr-2 text-orange-500" />
                        Hábitos / Deportes
                    </h3>
                    <div className="mt-1">{formatArray(examen.habitos_deportes) || '-'}</div>
                </div>

                {/* Examen psicológico */}
                <div className="bg-card rounded-lg border border-border shadow-sm p-4 mb-6">
                    <h3 className="font-semibold mb-3 flex items-center">
                        <Activity className="h-4 w-4 mr-2 text-teal-500" />
                        Examen psicológico
                    </h3>
                    <p className="whitespace-pre-wrap">{examen.examen_psicologico || '-'}</p>
                </div>

                {/* Historial ginecobstétrico */}
                {(examen.tipo_menstrual || examen.dismenorrea || examen.menarquia || examen.gesta || examen.numero_hijos) && (
                    <div className="bg-card rounded-lg border border-border shadow-sm p-4 mb-6">
                        <h3 className="font-semibold mb-3 flex items-center">
                            <Heart className="h-4 w-4 mr-2 text-pink-500" />
                            Historial ginecobstétrico
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                            <p><span className="text-muted-foreground">Tipo menstrual:</span> {examen.tipo_menstrual || '-'}</p>
                            <p><span className="text-muted-foreground">Dismenorrea:</span> {examen.dismenorrea ? 'Sí' : 'No'}</p>
                            <p><span className="text-muted-foreground">Menarquia:</span> {examen.menarquia || '-'}</p>
                            <p><span className="text-muted-foreground">Gesta:</span> {examen.gesta || '-'}</p>
                            <p><span className="text-muted-foreground">Número de hijos:</span> {examen.numero_hijos || '-'}</p>
                        </div>
                    </div>
                )}

                {/* Examen físico */}
                <div className="bg-card rounded-lg border border-border shadow-sm p-4 mb-6">
                    <h3 className="font-semibold mb-3 flex items-center">
                        <Heart className="h-4 w-4 mr-2 text-red-500" />
                        Examen físico
                    </h3>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                        <p><span className="text-muted-foreground">Peso:</span> {examen.peso_kg ? `${examen.peso_kg} kg` : '-'}</p>
                        <p><span className="text-muted-foreground">Estatura:</span> {examen.estatura_m ? `${examen.estatura_m} m` : '-'}</p>
                        <p><span className="text-muted-foreground">Temperatura:</span> {examen.temperatura_c ? `${examen.temperatura_c} °C` : '-'}</p>
                        <p><span className="text-muted-foreground">Presión arterial:</span> {examen.presion_arterial_mmhg || '-'}</p>
                        <p><span className="text-muted-foreground">Frec. respiratoria:</span> {examen.frecuencia_respiratoria_pm ? `${examen.frecuencia_respiratoria_pm} rpm` : '-'}</p>
                        <p><span className="text-muted-foreground">Pulso:</span> {examen.pulso_lpm ? `${examen.pulso_lpm} lpm` : '-'}</p>
                        <p><span className="text-muted-foreground">IMC:</span> {examen.indice_masa_corporal || '-'}</p>
                        <p><span className="text-muted-foreground">Estado IMC:</span> {examen.imc_estado || '-'}</p>
                    </div>
                </div>

                {/* Examen segmentario */}
                <div className="bg-card rounded-lg border border-border shadow-sm p-4 mb-6">
                    <h3 className="font-semibold mb-3">Examen segmentario</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                        <p><span className="text-muted-foreground">Cabeza:</span> {examen.segmentario_cabeza || '-'}</p>
                        <p><span className="text-muted-foreground">Cara:</span> {examen.segmentario_cara || '-'}</p>
                        <p><span className="text-muted-foreground">Ojos:</span> {examen.segmentario_ojos || '-'}</p>
                        <p><span className="text-muted-foreground">Oídos:</span> {examen.segmentario_oidos || '-'}</p>
                        <p><span className="text-muted-foreground">Fosas nasales:</span> {examen.segmentario_fosas_nasales || '-'}</p>
                        <p><span className="text-muted-foreground">Boca/faringe:</span> {examen.segmentario_boca_faringe || '-'}</p>
                        <p><span className="text-muted-foreground">Dientes:</span> {examen.segmentario_dientes || '-'}</p>
                        <p><span className="text-muted-foreground">Cuello:</span> {examen.segmentario_cuello || '-'}</p>
                        <p><span className="text-muted-foreground">Piel:</span> {examen.segmentario_piel || '-'}</p>
                        <p><span className="text-muted-foreground">Tórax:</span> {examen.segmentario_torax || '-'}</p>
                        <p><span className="text-muted-foreground">Corazón:</span> {examen.segmentario_corazon || '-'}</p>
                        <p><span className="text-muted-foreground">Pulmones:</span> {examen.segmentario_pulmones || '-'}</p>
                        <p><span className="text-muted-foreground">Abdomen:</span> {examen.segmentario_abdomen || '-'}</p>
                        <p><span className="text-muted-foreground">Genitourinario:</span> {examen.segmentario_genitourinario || '-'}</p>
                        <p><span className="text-muted-foreground">Extremidades:</span> {examen.segmentario_extremidades || '-'}</p>
                        <p><span className="text-muted-foreground">Columna:</span> {examen.segmentario_columna || '-'}</p>
                        <p><span className="text-muted-foreground">Neurológico/mental:</span> {examen.segmentario_neurologico_mental || '-'}</p>
                    </div>
                </div>

                {/* Transferencia */}
                {examen.transferencia_requerida && (
                    <div className="bg-card rounded-lg border border-border shadow-sm p-4 mb-6">
                        <h3 className="font-semibold mb-3 flex items-center">
                            <AlertCircle className="h-4 w-4 mr-2 text-yellow-500" />
                            Transferencia a especialidad
                        </h3>
                        <p><span className="text-muted-foreground">Especialidad derivación:</span> {examen.especialidad_derivacion}</p>
                    </div>
                )}

                {/* Concepto médico */}
                <div className="bg-card rounded-lg border border-border shadow-sm p-4 mb-6">
                    <h3 className="font-semibold mb-3 flex items-center">
                        <CheckCircle className="h-4 w-4 mr-2 text-green-500" />
                        Concepto de la valoración médica
                    </h3>
                    <div className="grid grid-cols-1 gap-3">
                        <p><span className="text-muted-foreground">Aptitud ocupacional:</span> {examen.aptitud_ocupacional || '-'}</p>
                        <p><span className="text-muted-foreground">Concepto final:</span> {examen.concepto_final_aptitud || '-'}</p>
                        <p><span className="text-muted-foreground">Recomendaciones:</span> {examen.recomendaciones || '-'}</p>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}