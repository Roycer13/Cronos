import { Button } from '@/components/ui/button';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, router } from '@inertiajs/react';
import { useState } from 'react';
import { route } from 'ziggy-js';
import {
    Calendar,
    User,
    FileText,
    Activity,
    Heart,
    ArrowLeft,
    Edit,
    PlusCircle,
    MoreHorizontal,
    Trash2,
} from 'lucide-react';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Badge } from '@/components/ui/badge';
import ReconsultaModal from './components/ReconsultaModal';
import EditarReconsultaModal from './components/EditarReconsultaModal';
import { useAuth } from '@/hooks/useAuth';
import { Toast } from '@/components/ui/toast';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Atenciones Médicas', href: '/sanidad/atenciones-medicas' },
    { title: 'Detalle de Atención', href: '#' },
];

interface PageProps {
    atencion: any;
    policlinicos: { id: number; nombre: string }[];
    flash: {
        success?: string;
        error?: string;
    };
}

export default function Show({ atencion, policlinicos, flash }: PageProps) {
    const [showReconsultaModal, setShowReconsultaModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [editingReconsulta, setEditingReconsulta] = useState<any>(null);
    const { hasPermission } = useAuth();

    const getEstadoBadge = (estadoNombre: string) => {
        const colors: Record<string, string> = {
            Pendiente: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-800/30 dark:text-yellow-400',
            'En curso': 'bg-blue-100 text-blue-800 dark:bg-blue-800/30 dark:text-blue-400',
            Finalizado: 'bg-green-100 text-green-800 dark:bg-green-800/30 dark:text-green-400',
            Derivado: 'bg-purple-100 text-purple-800 dark:bg-purple-800/30 dark:text-purple-400',
        };
        return colors[estadoNombre] || 'bg-gray-100 text-gray-800 dark:bg-gray-800/30 dark:text-gray-400';
    };

    const handleEditReconsulta = (reconsulta: any) => {
        setEditingReconsulta(reconsulta);
        setShowEditModal(true);
    };

    const handleDeleteReconsulta = (id: number) => {
        if (confirm('¿Está seguro de eliminar esta reconsulta?')) {
            router.delete(route('reconsultas.destroy', id), {
                preserveScroll: true,
                onSuccess: () => router.reload({ only: ['atencion'] }),
            });
        }
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Detalle de Atención Médica" />
            <div className="px-4 sm:px-6 py-4 max-w-7xl mx-auto">
                <Toast />
                {/* Cabecera con botón volver */}
                <div className="mb-6 flex items-center justify-between">
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => router.visit(route('atenciones-medicas.index'))}
                    >
                        <ArrowLeft className="h-4 w-4 mr-2" />
                        Volver al listado
                    </Button>
                    <div className="flex gap-2">
                        {hasPermission('u_atencionMedica') && (
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => router.visit(route('atenciones-medicas.edit', atencion.id))}
                            >
                                <Edit className="h-4 w-4 mr-2" />
                                Editar
                            </Button>
                        )}
                        {hasPermission('c_reconsulta') && (
                            <Button size="sm" onClick={() => setShowReconsultaModal(true)}>
                                <PlusCircle className="h-4 w-4 mr-2" />
                                Agregar Reconsulta
                            </Button>
                        )}
                    </div>
                </div>

                {/* Tarjeta de información principal */}
                <div className="bg-card rounded-lg border border-border shadow-sm p-6 mb-6">
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-4">
                        <h2 className="text-xl font-bold text-foreground flex items-center">
                            <Calendar className="h-5 w-5 mr-2 text-primary" />
                            Atención del{' '}
                            {new Date(atencion.fecha_atencion).toLocaleDateString('es-ES', {
                                weekday: 'long',
                                year: 'numeric',
                                month: 'long',
                                day: 'numeric',
                                hour: '2-digit',
                                minute: '2-digit',
                            })}
                        </h2>
                        <Badge className={getEstadoBadge(atencion.estado?.nombre)}>
                            {atencion.estado?.nombre}
                        </Badge>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Médico y paciente */}
                        <div className="space-y-3">
                            <div className="flex items-start gap-3">
                                <User className="h-5 w-5 text-muted-foreground mt-0.5" />
                                <div>
                                    <p className="text-sm text-muted-foreground">Médico</p>
                                    <p className="font-medium">
                                        {atencion.medico_user?.nombre} {atencion.medico_user?.apellido}
                                    </p>
                                    <p className="text-xs text-muted-foreground">{atencion.medico_user?.profesion}</p>
                                </div>
                            </div>
                            <div className="flex items-start gap-3">
                                <User className="h-5 w-5 text-muted-foreground mt-0.5" />
                                <div>
                                    <p className="text-sm text-muted-foreground">Paciente</p>
                                    <p className="font-medium">
                                        {atencion.paciente_user?.nombre} {atencion.paciente_user?.apellido}
                                    </p>
                                    <p className="text-xs text-muted-foreground">Código: {atencion.paciente_user?.codigo}</p>
                                </div>
                            </div>
                            {atencion.fecha_incidente && (
                                <div className="flex items-start gap-3">
                                    <Calendar className="h-5 w-5 text-muted-foreground mt-0.5" />
                                    <div>
                                        <p className="text-sm text-muted-foreground">Fecha del incidente</p>
                                        <p className="font-medium">
                                            {new Date(atencion.fecha_incidente).toLocaleString()}
                                        </p>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Motivo y gravedad */}
                        <div className="space-y-3">
                            <div className="flex items-start gap-3">
                                <FileText className="h-5 w-5 text-muted-foreground mt-0.5" />
                                <div>
                                    <p className="text-sm text-muted-foreground">Motivo de consulta</p>
                                    <p className="font-medium">{atencion.motivo_consulta}</p>
                                </div>
                            </div>
                            {atencion.gravedad && (
                                <div className="flex items-start gap-3">
                                    <Activity className="h-5 w-5 text-muted-foreground mt-0.5" />
                                    <div>
                                        <p className="text-sm text-muted-foreground">Gravedad</p>
                                        <Badge variant="outline">{atencion.gravedad}</Badge>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Signos vitales */}
                <div className="bg-card rounded-lg border border-border shadow-sm p-6 mb-6">
                    <h3 className="text-lg font-semibold mb-4 flex items-center">
                        <Heart className="h-5 w-5 mr-2 text-red-500" />
                        Signos vitales
                    </h3>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                        <div className="bg-muted/50 p-3 rounded-lg">
                            <p className="text-xs text-muted-foreground">Temperatura</p>
                            <p className="text-xl font-bold">
                                {atencion.temperatura ? `${atencion.temperatura} °C` : '-'}
                            </p>
                        </div>
                        <div className="bg-muted/50 p-3 rounded-lg">
                            <p className="text-xs text-muted-foreground">Presión arterial</p>
                            <p className="text-xl font-bold">{atencion.presion_arterial || '-'}</p>
                        </div>
                        <div className="bg-muted/50 p-3 rounded-lg">
                            <p className="text-xs text-muted-foreground">Frec. respiratoria</p>
                            <p className="text-xl font-bold">
                                {atencion.frecuencia_respiratoria ? `${atencion.frecuencia_respiratoria} rpm` : '-'}
                            </p>
                        </div>
                        <div className="bg-muted/50 p-3 rounded-lg">
                            <p className="text-xs text-muted-foreground">Frec. cardíaca</p>
                            <p className="text-xl font-bold">
                                {atencion.frecuencia_cardiaca ? `${atencion.frecuencia_cardiaca} lpm` : '-'}
                            </p>
                        </div>
                    </div>
                </div>

                {/* Descripción, diagnóstico, tratamiento */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                    <div className="bg-card rounded-lg border border-border shadow-sm p-4">
                        <h4 className="font-medium mb-2 flex items-center">
                            <FileText className="h-4 w-4 mr-2 text-blue-500" />
                            Descripción
                        </h4>
                        <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                            {atencion.descripcion || 'Sin descripción'}
                        </p>
                    </div>
                    <div className="bg-card rounded-lg border border-border shadow-sm p-4">
                        <h4 className="font-medium mb-2 flex items-center">
                            <FileText className="h-4 w-4 mr-2 text-green-500" />
                            Diagnóstico
                        </h4>
                        <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                            {atencion.diagnostico || 'Sin diagnóstico'}
                        </p>
                    </div>
                    <div className="bg-card rounded-lg border border-border shadow-sm p-4">
                        <h4 className="font-medium mb-2 flex items-center">
                            <FileText className="h-4 w-4 mr-2 text-purple-500" />
                            Tratamiento
                        </h4>
                        <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                            {atencion.tratamiento || 'Sin tratamiento'}
                        </p>
                    </div>
                </div>

                {/* Derivación y alta */}
                {(atencion.transferencia || atencion.fecha_alta) && (
                    <div className="bg-card rounded-lg border border-border shadow-sm p-6 mb-6">
                        <h3 className="text-lg font-semibold mb-4">Información adicional</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {atencion.transferencia && (
                                <div>
                                    <p className="text-sm text-muted-foreground">Transferencia a centro de especialidad</p>
                                    <p className="font-medium">{atencion.policlinico?.nombre || 'No especificado'}</p>
                                </div>
                            )}
                            {atencion.fecha_alta && (
                                <div>
                                    <p className="text-sm text-muted-foreground">Fecha de alta</p>
                                    <p className="font-medium">{new Date(atencion.fecha_alta).toLocaleString()}</p>
                                    {atencion.descripcion_alta && (
                                        <>
                                            <p className="text-sm text-muted-foreground mt-2">Descripción del alta</p>
                                            <p className="text-sm">{atencion.descripcion_alta}</p>
                                        </>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {/* Historial de reconsultas */}
                {atencion.reconsultas && atencion.reconsultas.length > 0 && (
                    <div className="bg-card rounded-lg border border-border shadow-sm p-6">
                        <h3 className="text-lg font-semibold mb-4 flex items-center">
                            <Activity className="h-5 w-5 mr-2 text-blue-500" />
                            Historial de reconsultas
                        </h3>
                        <div className="space-y-4">
                            {atencion.reconsultas.map((reconsulta: any) => (
                                <div key={reconsulta.id} className="border-l-4 border-blue-200 pl-4 py-2 relative group">
                                    <div className="flex justify-between items-start">
                                        <div>
                                            <p className="font-medium">
                                                {new Date(reconsulta.fecha_atencion).toLocaleString()}
                                            </p>
                                            <p className="text-sm text-muted-foreground">
                                                Médico: {reconsulta.medico_user?.nombre} {reconsulta.medico_user?.apellido}
                                            </p>
                                        </div>
                                        {reconsulta.transferencia && (
                                            <Badge variant="outline" className="border-purple-500">
                                                Derivado a {reconsulta.policlinico?.nombre}
                                            </Badge>
                                        )}
                                    </div>
                                    {reconsulta.evolucion_mejoria && (
                                        <p className="mt-2 text-sm">
                                            <span className="font-medium">Evolución:</span> {reconsulta.evolucion_mejoria}
                                        </p>
                                    )}
                                    {reconsulta.tratamiento && (
                                        <p className="mt-1 text-sm">
                                            <span className="font-medium">Tratamiento:</span> {reconsulta.tratamiento}
                                        </p>
                                    )}

                                    {/* Dropdown de acciones */}
                                    <div className="absolute right-0 top-0 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                                <Button variant="ghost" size="sm" className="h-8 w-8">
                                                    <MoreHorizontal className="h-4 w-4" />
                                                </Button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent align="end">
                                                {hasPermission('u_reconsulta') && (
                                                    <DropdownMenuItem onClick={() => handleEditReconsulta(reconsulta)}>
                                                        <Edit className="mr-2 h-4 w-4" />
                                                        Editar
                                                    </DropdownMenuItem>
                                                )}
                                                {hasPermission('d_reconsulta') && (
                                                    <DropdownMenuItem
                                                        onClick={() => handleDeleteReconsulta(reconsulta.id)}
                                                        className="text-destructive focus:text-destructive"
                                                    >
                                                        <Trash2 className="mr-2 h-4 w-4" />
                                                        Eliminar
                                                    </DropdownMenuItem>
                                                )}
                                            </DropdownMenuContent>
                                        </DropdownMenu>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Modal de creación */}
                <ReconsultaModal
                    isOpen={showReconsultaModal}
                    onClose={() => setShowReconsultaModal(false)}
                    atencionId={atencion.id}
                    policlinicos={policlinicos}
                />

                {/* Modal de edición */}
                {editingReconsulta && (
                    <EditarReconsultaModal
                        isOpen={showEditModal}
                        onClose={() => {
                            setShowEditModal(false);
                            setEditingReconsulta(null);
                        }}
                        reconsulta={editingReconsulta}
                        policlinicos={policlinicos}
                    />
                )}
            </div>
        </AppLayout>
    );
}