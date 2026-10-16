import { Button } from '@/components/ui/button';
import FilterSelect from '@/components/ui/filter-select';
import { Input } from '@/components/ui/input';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { Toast } from '@/components/ui/toast';
import { useAdvancedFilters } from '@/hooks/use-advanced-filters';
import { useAuth } from '@/hooks/useAuth';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, Link, router, usePage } from '@inertiajs/react';
import { Plus, Search, Filter, X, MoreHorizontal, Edit, Trash2, Eye, FileQuestion, CheckCircle, XCircle, Clock, AlertCircle, Mail, Calendar } from 'lucide-react';
import { route } from 'ziggy-js';
import { useState } from 'react';

import TablePagination from '@/components/ui/table-pagination';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Badge } from '@/components/ui/badge';
// Importar componentes de UI necesarios para los modales
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import FormSelect from '@/components/ui/form-select';
import { Textarea } from '@/components/ui/textarea';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Solicitudes de Documentos', href: route('solicitudDocumentacion.index') },
];

// Función para agregar días hábiles (sin contar domingos, sábado SI cuenta)
const addBusinessDays = (fechaStr: string, dias: number): string => {
    // Parsear la fecha correctamente para evitar problemas de timezone
    const [year, month, day] = fechaStr.split('-').map(Number);
    const date = new Date(year, month - 1, day); // Crear fecha en zona horaria local
    let daysAdded = 0;
    
    while (daysAdded < dias) {
        date.setDate(date.getDate() + 1);
        // 0 = domingo (el único día no hábil)
        if (date.getDay() !== 0) {
            daysAdded++;
        }
    }
    
    // Retornar en formato YYYY-MM-DD
    const year2 = date.getFullYear();
    const month2 = String(date.getMonth() + 1).padStart(2, '0');
    const day2 = String(date.getDate()).padStart(2, '0');
    return `${year2}-${month2}-${day2}`;
};

// Función para calcular todas las fechas límite
const calcularFechasLimite = (fechaAsignacion: string) => {
    if (!fechaAsignacion) return {};
    
    const limite_fecha_elaboracion = addBusinessDays(fechaAsignacion, 10);
    const limite_fecha_revision_tecnica = addBusinessDays(limite_fecha_elaboracion, 5);
    const limite_fecha_revision_calidad = addBusinessDays(limite_fecha_revision_tecnica, 3);
    const limite_fecha_revision_aprobacion = addBusinessDays(limite_fecha_revision_calidad, 2);
    
    return {
        limite_fecha_elaboracion,
        limite_fecha_revision_tecnica,
        limite_fecha_revision_calidad,
        limite_fecha_revision_aprobacion,
    };
};

interface PageProps {
    solicitudes: {
        data: Array<{
            id: number;
            codigo_solicitud: string;
            fecha_solicitud: string;
            tipo_solicitud: string;
            justificacion: string;
            alcance?: string;
            estado: { id: number; nombre: string; color?: string };
            solicitante: { id: number; name: string; email: string };
            documento: { id: number; codigo: string; titulo: string; creador_asignado:string } | null;
            limite_fecha_elaboracion?: string;
            limite_fecha_revision_tecnica?: string;
            limite_fecha_revision_calidad?: string;
            limite_fecha_revision_aprobacion?: string;
            created_at: string;
        }>;
        links: any[];
        current_page: number;
        last_page: number;
        per_page: number;
        total: number;
    };
    filters: {
        search?: string;
        tipo_solicitud?: string;
        estado_id?: number;
        per_page?: number;
    };
    estados: Array<{ id: number; nombre: string; color?: string }>;
    usuarios?: Array<{ id: number; name: string; apellido: string; codigo: string }>;
    documentos?: Array<{ id: number; codigo: string; titulo: string }>;
    flash: {
        success?: string;
        error?: string;
    };
}

export default function Index() {
    const { props } = usePage();
    const [showFilters, setShowFilters] = useState(false);

    const [modalAprobar, setModalAprobar] = useState({
        isOpen: false,
        solicitudId: null as number | null,
        solicitud: null as any,
    });

    const [modalRechazar, setModalRechazar] = useState({
        isOpen: false,
        solicitudId: null as number | null,
    });

    const [formAprobacion, setFormAprobacion] = useState({
        fecha_asignacion: '',
        creador_asignado: '',
        revisor1_asignado: '',
        revisor2_asignado: '',
        aprobador_asignado: '',
        custodio: '',
        tipo_distribucion: 'Fisica',
        ubicacion_fisica: '',

        limite_fecha_elaboracion: '',
        limite_fecha_revision_tecnica: '',
        limite_fecha_revision_calidad: '',
        limite_fecha_revision_aprobacion: '',
    });

    const [razonRechazo, setRazonRechazo] = useState('');

    const [isSubmitting, setIsSubmitting] = useState(false);

    const {
        hasPermission,
        belongsToUbicacion,
        canDo,
        user: authUser,
    } = useAuth();

    const {
        solicitudes = {
            data: [],
            links: [],
            current_page: 1,
            last_page: 1,
            per_page: 10,
            total: 0,
        },
        filters: initialFilters = {},
        estados = [],
        usuarios = [],
        documentos = [],
        flash,
    } = props as unknown as PageProps;

    const { filters, updateFilter, resetFilters } = useAdvancedFilters({
        routeName: 'solicitudes.index',
        initialFilters: {
            search: initialFilters.search || '',
            tipo_solicitud: initialFilters.tipo_solicitud || '',
            estado_id: initialFilters.estado_id?.toString() || undefined,
            per_page: initialFilters.per_page?.toString() || '10',
        },
        debounceFields: ['search'],
        debounceDelay: 600,
    });

    const hasActiveFilters = Object.values(filters).some(
        (value) => value && value !== '' && value !== '10'
    );

    const handleView = (id: number) => {
        router.visit(route('solicitudDocumentacion.show', id));
    };

    const handleDelete = (id: number) => {
        if (confirm('¿Está seguro de eliminar esta solicitud?')) {
            router.delete(route('solicitudDocumentacion.destroy', id), {
                preserveScroll: true,
            });
        }
    };

    const handleAprobar = (id: number, solicitud: any) => {
        console.log('Solicitud abierta:', solicitud);
        console.log('Documento:', solicitud.documento);
        console.log('Creador asignado:', solicitud.documento?.creador_asignado);
        
        setModalAprobar({
            isOpen: true,
            solicitudId: id,
            solicitud: solicitud,
        });
        // Precargar el creador_asignado si existe en el documento
        if (solicitud.documento?.creador_asignado) {
            setFormAprobacion(prev => ({
                ...prev,
                creador_asignado: solicitud.documento.creador_asignado.toString()
            }));
        }
    };

    const handleRechazar = (id: number) => {
        setModalRechazar({
            isOpen: true,
            solicitudId: id,
        });
    };

    const handleSubmitAprobar = () => {
        if (!formAprobacion.creador_asignado || !formAprobacion.aprobador_asignado) {
            alert('Los campos Creador Asignado y Aprobador Asignado son obligatorios');
            return;
        }

        setIsSubmitting(true);

        if (modalAprobar.solicitudId) {
            // Preparar los datos, convirtiendo "none" a null para los opcionales
            // Nota: NO incluimos fecha_asignacion en el envío
            const datosEnvio = {
                creador_asignado: formAprobacion.creador_asignado,
                revisor1_asignado: formAprobacion.revisor1_asignado === 'none' ? null : formAprobacion.revisor1_asignado,
                revisor2_asignado: formAprobacion.revisor2_asignado === 'none' ? null : formAprobacion.revisor2_asignado,
                aprobador_asignado: formAprobacion.aprobador_asignado,
                custodio: formAprobacion.custodio || null,
                tipo_distribucion: formAprobacion.tipo_distribucion || 'Interna',
                ubicacion_fisica: formAprobacion.ubicacion_fisica || null,
                // Agregar las fechas límite
                limite_fecha_elaboracion: formAprobacion.limite_fecha_elaboracion || null,
                limite_fecha_revision_tecnica: formAprobacion.limite_fecha_revision_tecnica || null,
                limite_fecha_revision_calidad: formAprobacion.limite_fecha_revision_calidad || null,
                limite_fecha_revision_aprobacion: formAprobacion.limite_fecha_revision_aprobacion || null,
            };

            router.post(route('solicitudDocumentacion.aprobar', modalAprobar.solicitudId), datosEnvio, {
                preserveScroll: true,
                onSuccess: () => {
                    setModalAprobar({ isOpen: false, solicitudId: null });
                    setFormAprobacion({
                        fecha_asignacion: '',
                        creador_asignado: '',
                        revisor1_asignado: '',
                        revisor2_asignado: '',
                        aprobador_asignado: '',
                        custodio: '',
                        tipo_distribucion: 'Fisica',
                        ubicacion_fisica: '',
                        // Resetear los campos de fechas
                        limite_fecha_elaboracion: '',
                        limite_fecha_revision_tecnica: '',
                        limite_fecha_revision_calidad: '',
                        limite_fecha_revision_aprobacion: '',
                    });
                    setIsSubmitting(false);
                },
                onError: () => {
                    setIsSubmitting(false);
                    alert('Error al aprobar la solicitud');
                }
            });
        }
    };

    const handleSubmitRechazar = () => {
        if (!razonRechazo.trim()) {
            alert('Por favor ingrese la razón del rechazo');
            return;
        }

        setIsSubmitting(true);

        if (modalRechazar.solicitudId) {
            router.post(route('solicitudDocumentacion.rechazar', modalRechazar.solicitudId), {
                razon: razonRechazo
            }, {
                preserveScroll: true,
                onSuccess: () => {
                    setModalRechazar({ isOpen: false, solicitudId: null });
                    setRazonRechazo('');
                    setIsSubmitting(false);
                },
                onError: () => {
                    setIsSubmitting(false);
                    alert('Error al rechazar la solicitud');
                }
            });
        }
    };

    const formatFecha = (fecha: string) => {
        return new Date(fecha).toLocaleDateString('es-ES', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
        });
    };

    const getTipoColor = (tipo: string) => {
        const colors: Record<string, string> = {
            creacion: 'bg-blue-100 text-blue-800 dark:bg-blue-800/30 dark:text-blue-400',
            modificacion: 'bg-orange-100 text-orange-800 dark:bg-orange-800/30 dark:text-orange-400',
        };
        return colors[tipo] || 'bg-gray-100 text-gray-800 dark:bg-gray-800/30 dark:text-gray-400';
    };

    const getEstadoColor = (estadoNombre: string) => {
        const ESTADOS_CONFIG: Record<string, string> = {
            'pendiente': 'bg-yellow-100 text-yellow-800 dark:bg-yellow-800/30 dark:text-yellow-400',
            'revision': 'bg-blue-100 text-blue-800 dark:bg-blue-800/30 dark:text-blue-400',
            'aprobada': 'bg-green-100 text-green-800 dark:bg-green-800/30 dark:text-green-400',
            'rechazada': 'bg-red-100 text-red-800 dark:bg-red-800/30 dark:text-red-400',
            'en_proceso': 'bg-indigo-100 text-indigo-800 dark:bg-indigo-800/30 dark:text-indigo-400',
            'completada': 'bg-purple-100 text-purple-800 dark:bg-purple-800/30 dark:text-purple-400',
        };
        return ESTADOS_CONFIG[estadoNombre] || 'bg-gray-100 text-gray-800 dark:bg-gray-800/30 dark:text-gray-400';
    };

    const tiposDistribucion = [
        { value: 'Fisica', label: 'Fisica' },
        { value: 'Digital', label: 'Digital' },
        { value: 'Mixta', label: 'Mixta' },
    ];
    const usuarioOptions = usuarios.map(usuario => ({
        value: usuario.id.toString(),
        label: `(${usuario.codigo}) ${usuario.name} ${usuario.apellido} `,
    }));

    // Mapear documentos a opciones para FormSelect
    const documentoOptions = documentos.map(documento => ({
        value: documento.id.toString(),
        label: `${documento.codigo} - ${documento.titulo}`,
    }));

    // Para las opciones de "no asignar"
    const opcionNinguno = { value: 'none', label: 'No asignar' };

    // Opciones para revisores (incluyendo "No asignar")
    const revisorOptions = [opcionNinguno, ...usuarioOptions];


    // Tipos de distribución en formato FormSelect
    const distribucionOptions = tiposDistribucion.map(tipo => ({
        value: tipo.value,
        label: tipo.label,
    }));


    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Solicitudes de Documentos" />
            <div className="px-2 sm:px-6 py-2 space-y-2">
                <Toast />

                {/* MODAL PARA APROBAR */}
                <Dialog open={modalAprobar.isOpen} onOpenChange={(open) => {
                    if (!open) {
                        setModalAprobar({ isOpen: false, solicitudId: null });
                        setFormAprobacion({
                            fecha_asignacion: '',
                            creador_asignado: '',
                            revisor1_asignado: '',
                            revisor2_asignado: '',
                            aprobador_asignado: '',
                            custodio: '',
                            tipo_distribucion: 'Interna',
                            ubicacion_fisica: '',
                            // Resetear los campos de fechas
                            limite_fecha_elaboracion: '',
                            limite_fecha_revision_tecnica: '',
                            limite_fecha_revision_calidad: '',
                            limite_fecha_revision_aprobacion: '',
                        });
                    }
                }}>
                    <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
                        <DialogHeader>
                            <DialogTitle>Aprobar Solicitud de Documento</DialogTitle>
                            <DialogDescription>
                                Asigne los responsables, configure los detalles y establezca los plazos del documento
                            </DialogDescription>
                        </DialogHeader>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 py-4">
                            {/* Fecha de Asignación */}
                            <div className="space-y-2">
                                <Label htmlFor="fecha_asignacion" className="text-sm font-medium">
                                    Fecha de Asignación *
                                </Label>
                                <Input
                                    id="fecha_asignacion"
                                    type="date"
                                    value={formAprobacion.fecha_asignacion}
                                    onChange={(e) => {
                                        const nuevaFecha = e.target.value;
                                        const fechasCalculadas = calcularFechasLimite(nuevaFecha);
                                        setFormAprobacion(prev => ({
                                            ...prev,
                                            fecha_asignacion: nuevaFecha,
                                            ...fechasCalculadas
                                        }));
                                    }}
                                />
                            </div>

                            {/* Creador Asignado */}
                            
                            <div className="space-y-2">
                                <FormSelect
                                    label='Creador Asignado *'
                                    value={formAprobacion.creador_asignado}
                                    onChange={(value: string) => setFormAprobacion(prev => ({ ...prev, creador_asignado: value }))}
                                    placeholder="Seleccionar creador..."
                                    options={usuarioOptions}
                                    clearable={true}
                                    searchable={true}
                                />
                            </div>

                            {/* Revisor 1 */}
                            <div className="space-y-2">
                                <FormSelect
                                    label='Revisor 1 (Opcional)'
                                    value={formAprobacion.revisor1_asignado}
                                    onChange={(value: string) => setFormAprobacion(prev => ({ ...prev, revisor1_asignado: value }))}
                                    placeholder="Seleccionar revisor 1..."
                                    options={revisorOptions}
                                    clearable={true}
                                    searchable={true}
                                />
                            </div>

                            {/* Revisor 2 */}
                            <div className="space-y-2">

                                <FormSelect
                                    label='Revisor 2 (Opcional)'
                                    value={formAprobacion.revisor2_asignado}
                                    onChange={(value: string) => setFormAprobacion(prev => ({ ...prev, revisor2_asignado: value }))}
                                    placeholder="Seleccionar revisor 2..."
                                    options={revisorOptions}
                                    clearable={true}
                                    searchable={true}
                                />
                            </div>

                            {/* Aprobador Asignado */}
                            <div className="space-y-2">
                                <FormSelect
                                    label='Aprobador Asignado *'
                                    value={formAprobacion.aprobador_asignado}
                                    onChange={(value: string) => setFormAprobacion(prev => ({ ...prev, aprobador_asignado: value }))}
                                    placeholder="Seleccionar aprobador..."
                                    options={usuarioOptions}
                                    clearable={true}
                                    searchable={true}
                                />
                            </div>

                            {/* Custodio */}
                            <div className="space-y-2">
                                <FormSelect
                                    label='Custodio (Opcional)'
                                    value={formAprobacion.custodio}
                                    onChange={(value: string) => setFormAprobacion(prev => ({ ...prev, custodio: value }))}
                                    placeholder="Seleccionar custodio..."
                                    options={usuarioOptions}
                                    clearable={true}
                                    searchable={true}
                                />
                            </div>

                            {/* Tipo de Distribución */}
                            <div className="space-y-2">
                                <FormSelect
                                    label='Tipo de Distribución'
                                    value={formAprobacion.tipo_distribucion}
                                    onChange={(value: string) => setFormAprobacion(prev => ({ ...prev, tipo_distribucion: value }))}
                                    placeholder="Seleccionar tipo..."
                                    options={distribucionOptions}
                                    clearable={true}
                                    searchable={true}
                                />
                            </div>

                            {/* Ubicación Física */}
                            <div className="space-y-2">
                                <Label htmlFor="ubicacion_fisica" className="text-sm font-medium">
                                    Ubicación Física (Opcional)
                                </Label>
                                <Input
                                    id="ubicacion_fisica"
                                    value={formAprobacion.ubicacion_fisica}
                                    onChange={(e) => setFormAprobacion(prev => ({ ...prev, ubicacion_fisica: e.target.value }))}
                                    placeholder="Ej: Archivo central, Estante 3"
                                />
                            </div>

                            {/* FECHA LÍMITE ELABORACIÓN */}
                            <div className="space-y-2">
                                <Label htmlFor="limite_fecha_elaboracion" className="text-sm font-medium">
                                    Fecha Límite Elaboración
                                </Label>
                                <Input
                                    id="limite_fecha_elaboracion"
                                    type="date"
                                    value={formAprobacion.limite_fecha_elaboracion}
                                    onChange={(e) => setFormAprobacion(prev => ({ ...prev, limite_fecha_elaboracion: e.target.value }))}
                                />
                            </div>

                            {/* FECHA LÍMITE REVISIÓN TÉCNICA */}
                            <div className="space-y-2">
                                <Label htmlFor="limite_fecha_revision_tecnica" className="text-sm font-medium">
                                    Fecha Límite Revisión Técnica
                                </Label>
                                <Input
                                    id="limite_fecha_revision_tecnica"
                                    type="date"
                                    value={formAprobacion.limite_fecha_revision_tecnica}
                                    onChange={(e) => setFormAprobacion(prev => ({ ...prev, limite_fecha_revision_tecnica: e.target.value }))}
                                />
                            </div>

                            {/* FECHA LÍMITE REVISIÓN CALIDAD */}
                            <div className="space-y-2">
                                <Label htmlFor="limite_fecha_revision_calidad" className="text-sm font-medium">
                                    Fecha Límite Revisión Calidad
                                </Label>
                                <Input
                                    id="limite_fecha_revision_calidad"
                                    type="date"
                                    value={formAprobacion.limite_fecha_revision_calidad}
                                    onChange={(e) => setFormAprobacion(prev => ({ ...prev, limite_fecha_revision_calidad: e.target.value }))}
                                />
                            </div>

                            {/* FECHA LÍMITE REVISIÓN APROBACIÓN */}
                            <div className="space-y-2">
                                <Label htmlFor="limite_fecha_revision_aprobacion" className="text-sm font-medium">
                                    Fecha Límite Revisión Aprobación
                                </Label>
                                <Input
                                    id="limite_fecha_revision_aprobacion"
                                    type="date"
                                    value={formAprobacion.limite_fecha_revision_aprobacion}
                                    onChange={(e) => setFormAprobacion(prev => ({ ...prev, limite_fecha_revision_aprobacion: e.target.value }))}
                                />
                            </div>
                        </div>

                        <DialogFooter>
                            <Button
                                variant="outline"
                                onClick={() => {
                                    setModalAprobar({ isOpen: false, solicitudId: null });
                                    setFormAprobacion({
                                        fecha_asignacion: '',
                                        creador_asignado: '',
                                        revisor1_asignado: '',
                                        revisor2_asignado: '',
                                        aprobador_asignado: '',
                                        custodio: '',
                                        tipo_distribucion: 'Interna',
                                        ubicacion_fisica: '',
                                        limite_fecha_elaboracion: '',
                                        limite_fecha_revision_tecnica: '',
                                        limite_fecha_revision_calidad: '',
                                        limite_fecha_revision_aprobacion: '',
                                    });
                                }}
                                disabled={isSubmitting}
                            >
                                Cancelar
                            </Button>
                            <Button
                                onClick={handleSubmitAprobar}
                                disabled={isSubmitting || !formAprobacion.creador_asignado || !formAprobacion.aprobador_asignado}
                            >
                                {isSubmitting ? 'Procesando...' : 'Aprobar Solicitud'}
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
                {/* MODAL PARA RECHAZAR */}
                <Dialog open={modalRechazar.isOpen} onOpenChange={(open) => {
                    if (!open) {
                        setModalRechazar({ isOpen: false, solicitudId: null });
                        setRazonRechazo('');
                    }
                }}>
                    <DialogContent className="max-w-md">
                        <DialogHeader>
                            <DialogTitle>Rechazar Solicitud</DialogTitle>
                            <DialogDescription>
                                Ingrese la razón por la cual rechaza esta solicitud
                            </DialogDescription>
                        </DialogHeader>

                        <div className="py-4">
                            <Label htmlFor="razon" className="text-sm font-medium mb-2 block">
                                Razón del rechazo *
                            </Label>
                            <Textarea
                                id="razon"
                                value={razonRechazo}
                                onChange={(e) => setRazonRechazo(e.target.value)}
                                placeholder="Describa las razones del rechazo..."
                                className="min-h-[120px]"
                            />
                        </div>

                        <DialogFooter>
                            <Button
                                variant="outline"
                                onClick={() => {
                                    setModalRechazar({ isOpen: false, solicitudId: null });
                                    setRazonRechazo('');
                                }}
                                disabled={isSubmitting}
                            >
                                Cancelar
                            </Button>
                            <Button
                                onClick={handleSubmitRechazar}
                                disabled={isSubmitting || !razonRechazo.trim()}
                                variant="destructive"
                            >
                                {isSubmitting ? 'Procesando...' : 'Rechazar Solicitud'}
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>

                {/* Header */}
                <div className="flex items-center justify-between">
                    <div className="relative max-w-md">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                            placeholder="Buscar por código, justificación..."
                            value={filters.search || ''}
                            onChange={(e) => updateFilter('search', e.target.value)}
                            className="pl-10"
                        />
                    </div>
                    <div className="flex items-center gap-2">
                        {hasPermission('c_documentacionSolicitud') && (
                            <Link href={route('solicitudDocumentacion.create')}>
                                <Button size="sm">
                                    <Plus className="h-4 w-4" />
                                    <p className='hidden md:block'>Nueva Solicitud</p>
                                </Button>
                            </Link>
                        )}

                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setShowFilters(!showFilters)}
                            className="flex items-center gap-2"
                        >
                            <Filter className="h-4 w-4" />
                            <p className='hidden md:block'>Filtros</p>
                            {hasActiveFilters && (
                                <span className="bg-primary text-primary-foreground rounded-full h-5 w-5 text-xs flex items-center justify-center">
                                    !
                                </span>
                            )}
                        </Button>
                    </div>
                </div>

                {/* Filtros avanzados */}
                {showFilters && (
                    <div className="bg-muted/50 rounded-lg p-2 border border-border">
                        <div className="flex items-center justify-between mb-3">
                            <h3 className="text-sm font-semibold text-foreground">Filtros avanzados</h3>
                            <div className="flex items-center gap-2">
                                {hasActiveFilters && (
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={resetFilters}
                                        className="text-xs text-muted-foreground hover:text-foreground"
                                    >
                                        <X className="h-4 w-4 mr-1" />
                                        Limpiar
                                    </Button>
                                )}
                            </div>
                        </div>

                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                            <FilterSelect
                                value={filters.tipo_solicitud}
                                onChange={(v) => updateFilter('tipo_solicitud', v)}
                                placeholder="Todos los tipos"
                                options={[
                                    { value: 'creacion', label: 'Creación' },
                                    { value: 'modificacion', label: 'Modificación' },
                                ]}
                            />

                            <FilterSelect
                                value={filters.estado_id}
                                onChange={(v) => updateFilter('estado_id', v)}
                                placeholder="Todos los estados"
                                options={estados.map((e) => ({
                                    value: e.id.toString(),
                                    label: e.nombre,
                                }))}
                            />

                            <FilterSelect
                                value={filters.per_page}
                                onChange={(v) => updateFilter('per_page', v)}
                                placeholder="Resultados por página"
                                options={['10', '25', '50', '100'].map((v) => ({
                                    value: v,
                                    label: `${v} por página`,
                                }))}
                                includeAllOption={false}
                            />
                        </div>
                    </div>
                )}

                {/* Tabla de Solicitudes */}
                <div className="bg-background rounded-lg border border-border shadow-sm overflow-hidden">
                    <div className="overflow-x-auto">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    {[
                                        'Código',
                                        'Tipo',
                                        'Justificación',
                                        'Documento',
                                        'Solicitante',
                                        'Fecha',
                                        'Estado',
                                        'Plazos',
                                        'Acciones',
                                    ].map((col, idx) => (
                                        <TableHead key={idx}>{col}</TableHead>
                                    ))}
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {solicitudes.data.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={9} className="text-center py-8 text-muted-foreground">
                                            <div className="flex flex-col items-center justify-center">
                                                <FileQuestion className="h-12 w-12 text-muted-foreground/50 mb-3" />
                                                <p className="text-lg font-medium text-foreground mb-1">
                                                    No se encontraron solicitudes
                                                </p>
                                                <p className="text-sm text-muted-foreground">
                                                    {hasActiveFilters
                                                        ? "Intenta ajustar los filtros para ver más resultados"
                                                        : "No hay solicitudes registradas en el sistema"
                                                    }
                                                </p>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    solicitudes.data.map((solicitud) => (
                                        <TableRow key={solicitud.id} className="hover:bg-muted/50">
                                            <TableCell>
                                                <div className="font-mono text-sm font-medium text-foreground">
                                                    {solicitud.codigo_solicitud}
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium capitalize ${getTipoColor(solicitud.tipo_solicitud)}`}>
                                                    {solicitud.tipo_solicitud}
                                                </span>
                                            </TableCell>
                                            <TableCell>
                                                <div className="font-medium text-foreground line-clamp-2">
                                                    {solicitud.justificacion}
                                                </div>
                                                {solicitud.alcance && (
                                                    <div className="text-xs text-muted-foreground line-clamp-1">
                                                        {solicitud.alcance}
                                                    </div>
                                                )}
                                            </TableCell>
                                            <TableCell>
                                                {solicitud.documento ? (
                                                    <Link
                                                        href={route('documentos.show', solicitud.documento.id)}
                                                        className="text-primary hover:underline text-sm"
                                                    >
                                                        {solicitud.documento.codigo}
                                                    </Link>
                                                ) : (
                                                    <span className="text-muted-foreground text-sm">Nuevo documento</span>
                                                )}
                                            </TableCell>
                                            <TableCell>
                                                <div className="text-sm">
                                                    <p className="font-medium text-foreground">{solicitud.solicitante.name}</p>
                                                    <p className="text-xs text-muted-foreground">{solicitud.solicitante.codigo}</p>
                                                </div>
                                            </TableCell>
                                            <TableCell className="text-sm text-muted-foreground">
                                                {formatFecha(solicitud.fecha_solicitud)}
                                            </TableCell>
                                            <TableCell>
                                                {solicitud.estado ? (
                                                    <span
                                                        className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium"
                                                        style={{
                                                            backgroundColor: solicitud.estado.color + '20',
                                                            color: solicitud.estado.color
                                                        }}
                                                    >
                                                        {solicitud.estado.nombre}
                                                    </span>
                                                ) : (
                                                    <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                                                        Sin estado
                                                    </span>
                                                )}
                                            </TableCell>
                                            <TableCell>
                                                {solicitud.limite_fecha_elaboracion ? (
                                                    <div className="flex items-center gap-1 text-xs">
                                                        <Calendar className="h-3 w-3" />
                                                        <span className="text-muted-foreground">
                                                            {formatFecha(solicitud.limite_fecha_elaboracion)}
                                                        </span>
                                                    </div>
                                                ) : (
                                                    <span className="text-xs text-muted-foreground">Sin plazo</span>
                                                )}
                                            </TableCell>
                                            <TableCell>
                                                <DropdownMenu>
                                                    <DropdownMenuTrigger asChild>
                                                        <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                                                            <MoreHorizontal className="h-4 w-4" />
                                                            <span className="sr-only">Abrir menú</span>
                                                        </Button>
                                                    </DropdownMenuTrigger>
                                                    <DropdownMenuContent align="end" className="w-48">
                                                        {/* <DropdownMenuItem onClick={() => handleView(solicitud.id)}>
                                                            <Eye className="mr-2 h-4 w-4" />
                                                            <span>Ver detalles</span>
                                                        </DropdownMenuItem> */}
                                                        {hasPermission('u_documentacionSolicitud') && solicitud.estado.nombre === 'Pendiente' && (
                                                            <DropdownMenuItem onClick={() => handleAprobar(solicitud.id, solicitud)}>
                                                                <CheckCircle className="mr-2 h-4 w-4" />
                                                                <span>Aprobar</span>
                                                            </DropdownMenuItem>
                                                        )}
                                                        {hasPermission('u_documentacionSolicitud') && solicitud.estado.nombre === 'Pendiente' && (
                                                            <DropdownMenuItem onClick={() => handleRechazar(solicitud.id)}>
                                                                <XCircle className="mr-2 h-4 w-4" />
                                                                <span>Rechazar</span>
                                                            </DropdownMenuItem>
                                                        )}
                                                        {/* {canDo(solicitud, 'u_solicitudesDocumentacion', 24, false) && (
                                                            <DropdownMenuItem onClick={() => handleView(solicitud.id)}>
                                                                <Edit className="mr-2 h-4 w-4" />
                                                                <span>Editar</span>
                                                            </DropdownMenuItem>
                                                        )} */}
                                                        {canDo(solicitud, 'd_documentacionSolicitud', 8, true, false, false) && (
                                                            <DropdownMenuItem
                                                                onClick={() => handleDelete(solicitud.id)}
                                                                className="text-destructive focus:text-destructive"
                                                            >
                                                                <Trash2 className="mr-2 h-4 w-4" />
                                                                <span>Eliminar</span>
                                                            </DropdownMenuItem>
                                                        )}
                                                    </DropdownMenuContent>
                                                </DropdownMenu>
                                            </TableCell>
                                        </TableRow>
                                    ))
                                )}
                            </TableBody>
                        </Table>
                    </div>

                    {/* Paginación */}
                    {solicitudes.data.length > 0 && (
                        <div className="border-t border-border px-4 py-3">
                            <TablePagination
                                pagination={solicitudes}
                                onPageChange={(page) =>
                                    router.get(
                                        route('solicitudes.index'),
                                        { ...filters, page },
                                        { preserveState: true, replace: true },
                                    )
                                }
                            />
                        </div>
                    )}
                </div>

                {/* Info rápida */}
                <div className='flex justify-between'>
                    <p className="text-sm text-muted-foreground mt-1">
                        {solicitudes.total} solicitudes registradas
                    </p>
                    <div>
                        {solicitudes.data.length > 0 && (
                            <div className="text-center">
                                <p className="text-sm text-muted-foreground">
                                    Mostrando <span className="font-medium text-foreground">{solicitudes.data.length}</span> de{' '}
                                    <span className="font-medium text-foreground">{solicitudes.total}</span> solicitudes
                                </p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
