import { useEffect, useState } from 'react';

import PDFViewer from '@/components/PDFViewer';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import FilterSelect from '@/components/ui/filter-select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import TablePagination from '@/components/ui/table-pagination';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import { useAuth } from '@/hooks/useAuth';
import AppLayout from '@/layouts/app-layout';
import { Head, Link, router, useForm, usePage } from '@inertiajs/react';
import {
    AlertCircle,
    ArrowLeft,
    Building,
    CheckCircle,
    CheckSquare,
    Clock,
    Copy,
    Download,
    Eye,
    FileIcon,
    FileText,
    Globe,
    Globe as GlobeIcon,
    History,
    MapPin,
    MoreHorizontal,
    Plus,
    Search,
    Send,
    Shield,
    User,
    UserCheck,
    Users,
    XCircle,
} from 'lucide-react';
import { route } from 'ziggy-js';

interface Documento {
    id: number;
    codigo: string;
    titulo: string;
    descripcion: string;
    tipo: string;
    area: { id: number; nombre: string };
    ubicacion: { id: number; nombre: string };
    estado: { id: number; nombre: string; color: string } | null;
    version_vigente: {
        id: number;
        numero_version: string;
        archivo_pdf_url: string;
        archivo_word_url: string;
        archivo_rechazo_url: string | null;
        cambios: string;
        estado: { nombre: string; color: string };
        creador: { id: number; name: string };
        revisor1: { id: number; name: string } | null;
        revisor2: { id: number; name: string } | null;
        aprobador: { id: number; name: string } | null;
        fecha_creacion: string;
        fecha_revision: string | null;
        fecha_aprobado: string | null;
        observaciones: string | null;
    } | null;
    ultima_version_elaboracion: {
        id: number;
        numero_version: string;
    } | null;
    versiones: Array<{
        id: number;
        numero_version: string;
        cambios: string;
        archivo_pdf_url: string | null;
        archivo_word_url: string | null;
        estado: { id: number; nombre: string; color: string };
        creador: { id: number; name: string };
        revisor1: { id: number; name: string } | null;
        revisor2: { id: number; name: string } | null;
        aprobador: { id: number; name: string } | null;
        fecha_creacion: string;
        fecha_revision: string | null;
        fecha_aprobado: string | null;
        observaciones: string | null;
    }>;
    creador: { id: number; name: string; email: string };
    revisor1: { id: number; name: string; email: string } | null;
    revisor2: { id: number; name: string; email: string } | null;
    aprobador: { id: number; name: string; email: string } | null;
    created_at: string;
}

interface PageProps {
    documento: Documento;
    usuarios: Array<{ id: number; name: string; email: string }>;
    estados: Array<{ id: number; nombre: string; color: string }>;
    flash: { success?: string; error?: string };
    versiones: {
        data: Array<Documento['versiones'][0]>;
        links: any[];
        current_page: number;
        last_page: number;
        per_page: number;
        total: number;
    };
}

// Definición de estados válidos
const ESTADOS_VALIDOS = {
    BORRADOR: 'Borrador',
    PENDIENTE: 'Pendiente',
    REVISADO: 'Revisado',
    VIGENTE: 'Vigente',
    APROBADO: 'Aprobado',
    RECHAZADO: 'Rechazado',
} as const;

type EstadoNombre = (typeof ESTADOS_VALIDOS)[keyof typeof ESTADOS_VALIDOS];

export default function DocumentoShow() {
    const pageProps = usePage<PageProps>().props;
    const { documento, usuarios, estados, flash, versiones } = pageProps;
    const { user, hasPermission } = useAuth();
    const estadoDocumento = documento.estado ?? {
        id: 0,
        nombre: 'Sin estado',
        color: '#6b7280',
    };
    const [activeTab, setActiveTab] = useState('versiones');
    const [showNuevaVersionDialog, setShowNuevaVersionDialog] = useState(false);
    const [showEnviarRevisionDialog, setShowEnviarRevisionDialog] =
        useState(false);
    const [showRechazarDialog, setShowRechazarDialog] = useState(false);
    const [showAprobarDialog, setShowAprobarDialog] = useState(false);
    const [selectedVersion, setSelectedVersion] = useState<
        Documento['versiones'][0] | null
    >(null);
    const [activeVersionId, setActiveVersionId] = useState<number | null>(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [estadoFilter, setEstadoFilter] = useState<string>('');
    const [page, setPage] = useState(1);
    const [expandedVersions, setExpandedVersions] = useState<Set<number>>(new Set());

    const {
        data: formData,
        setData,
        reset,
    } = useForm({
        cambios: '',
        observaciones: '',
        archivo_rechazo: null as File | null,
    });

    // Inicializar activeVersionId cuando documento esté disponible
    useEffect(() => {
        if (documento) {
            const initialVersionId =
                documento.version_vigente?.id ||
                documento.ultima_version_elaboracion?.id ||
                (documento.versiones?.length > 0
                    ? documento.versiones[0]?.id
                    : null);
            setActiveVersionId(initialVersionId);
        }
    }, [documento]);

    // Asegurarnos de que versiones sea un array
    const documentoVersiones = documento.versiones || [];

    // Encontrar la versión actual
    const versionActual =
        documentoVersiones.find((v) => v.id === activeVersionId) || null;

    // --- FUNCIONES UTILITARIAS ---

    // Función para verificar si una versión es vigente (1.0, 2.0, 3.0, etc.)
    const isVersionVigente = (numeroVersion: string) => {
        return numeroVersion.endsWith('.0') && parseInt(numeroVersion.split('.')[0]) >= 1;
    };

    const getTipoColor = (tipo: string) => {
        const colors: Record<string, string> = {
            procedimiento:
                'bg-blue-100 text-blue-800 dark:bg-blue-800/30 dark:text-blue-400',
            instructivo:
                'bg-green-100 text-green-800 dark:bg-green-800/30 dark:text-green-400',
            registro:
                'bg-purple-100 text-purple-800 dark:bg-purple-800/30 dark:text-purple-400',
            politica:
                'bg-orange-100 text-orange-800 dark:bg-orange-800/30 dark:text-orange-400',
        };
        return colors[tipo] || 'bg-gray-100 text-gray-800';
    };

    // Función para obtener configuración del badge por nombre de estado
    const getEstadoBadge = (estadoNombre: string) => {
        const config: Record<
            string,
            { bg: string; text: string; color: string }
        > = {
            [ESTADOS_VALIDOS.BORRADOR]: {
                bg: 'bg-yellow-100',
                text: 'text-yellow-800',
                color: '#f59e0b',
            },
            [ESTADOS_VALIDOS.PENDIENTE]: {
                bg: 'bg-blue-100',
                text: 'text-blue-800',
                color: '#3b82f6',
            },
            [ESTADOS_VALIDOS.REVISADO]: {
                bg: 'bg-orange-100',
                text: 'text-orange-800',
                color: '#f97316',
            },
                [ESTADOS_VALIDOS.VIGENTE]: {
                bg: 'bg-green-100',
                text: 'text-green-800',
                color: '#10b981',
            },
                [ESTADOS_VALIDOS.APROBADO]: {
                    bg: 'bg-emerald-10  0',
                    text: 'text-emerald-800',
                    color: '#059669',
                },
            [ESTADOS_VALIDOS.RECHAZADO]: {
                bg: 'bg-red-100',
                text: 'text-red-800',
                color: '#ef4444',
            },
        };

        return (
            config[estadoNombre] || {
                bg: 'bg-gray-100',
                text: 'text-gray-800',
                color: '#6b7280',
            }
        );
    };

    const formatFechaConHora = (fecha: string | null) => {
        if (!fecha) return '-';
        const date = new Date(fecha);
        return date.toLocaleDateString('es-BO', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        });
    };

    // --- FUNCIONES DE VERIFICACIÓN DE PERMISOS ---

    /**
     * Verifica si el usuario actual es el creador de la versión
     */
    const esCreador = (version: Documento['versiones'][0]) => {
        return user?.id === version.creador?.id;
    };

    /**
     * Verifica si el usuario actual es revisor asignado (1 o 2)
     */
    const esRevisor = (version: Documento['versiones'][0]) => {
        if (!user) return false;
        return (
            documento.revisor1?.id === user.id ||
            documento.revisor2?.id === user.id
        );
    };

    /**
     * Verifica si el usuario actual es el aprobador asignado
     */
    const esAprobador = (version: Documento['versiones'][0]) => {
        return user?.id === documento.aprobador?.id;
    };

    /**
     * Determina qué acciones puede realizar el usuario actual sobre una versión
     */
    const accionesDisponibles = (version: Documento['versiones'][0]) => {
        const estado = version.estado.nombre.toLowerCase().trim(); // Normaliza a minúsculas y quita espacios
        const acciones: string[] = [];

        // Depuración detallada
        console.log('=== DEPURACIÓN accionesDisponibles ===');
        console.log('Estado original:', version.estado.nombre);
        console.log('Estado normalizado:', estado);
        console.log('Usuario ID:', user?.id);
        console.log('Revisor1 ID:', documento.revisor1?.id);
        console.log('Revisor2 ID:', documento.revisor2?.id);
        console.log('¿Es revisor?', esRevisor(version));
        console.log('==================');

        // 1. Creador puede enviar a revisión desde Borrador
        if (estado === 'borrador' && esCreador(version)) {
            acciones.push('enviar_revision');
        }

        // 2. Revisores pueden actuar cuando está Pendiente
        if (estado === 'pendiente' && esRevisor(version)) {
            acciones.push('marcar_revisado');
            acciones.push('rechazar');
        }

        // 3. Aprobador puede actuar cuando está Revisado
        if (estado === 'revisado' && esAprobador(version)) {
            acciones.push('aprobar');
            acciones.push('rechazar');
        }

        // 4. Creador puede crear nueva versión desde Rechazado o Vigente
        if (
            esCreador(version) &&
            (estado === 'rechazado' || estado === 'vigente')
        ) {
            acciones.push('nueva_version');
        }

        console.log('Acciones disponibles:', acciones);
        return acciones;
    };

    // --- FUNCIONES DE ACCIÓN ---

    const handleCrearNuevaVersion = () => {
        if (!selectedVersion) return;

        router.post(
            route('documentos.versiones.crear-nueva', {
                documento: documento.id,
                version: selectedVersion.id,
            }),
            { cambios: formData.cambios },
            {
                onSuccess: () => {
                    setShowNuevaVersionDialog(false);
                    reset();
                },
            },
        );
    };

    const handleEnviarRevision = () => {
        if (!selectedVersion) return;

        router.post(
            route('documentos.versiones.enviar-revision', {
                documento: documento.id,
                version: selectedVersion.id,
            }),
            {},
            {
                onSuccess: () => {
                    setShowEnviarRevisionDialog(false);
                    reset();
                },
            },
        );
    };

    const handleMarcarRevisado = () => {
        if (!selectedVersion) return;

        router.post(
            route('documentos.versiones.marcar-revisado', {
                documento: documento.id,
                version: selectedVersion.id,
            }),
            {},
            {
                onSuccess: () => {
                    setShowAprobarDialog(false);
                    reset();
                },
            },
        );
    };

    const handleAprobarVersion = () => {
        if (!selectedVersion) return;

        router.post(
            route('documentos.versiones.aprobar', {
                documento: documento.id,
                version: selectedVersion.id,
            }),
            {},
            {
                onSuccess: () => {
                    setShowAprobarDialog(false);
                    reset();
                },
            },
        );
    };

    const handleRechazar = () => {
        if (!selectedVersion) return;

        const formDataObj = new FormData();
        formDataObj.append('observaciones', formData.observaciones);
        if (formData.archivo_rechazo) {
            formDataObj.append('archivo_rechazo', formData.archivo_rechazo);
        }

        router.post(
            route('documentos.versiones.rechazar', {
                documento: documento.id,
                version: selectedVersion.id,
            }),
            formDataObj,
            {
                onSuccess: () => {
                    setShowRechazarDialog(false);
                    reset();
                },
            },
        );
    };

    const handlePublicarComoVigente = (versionId: number) => {
        if (
            confirm(
                '¿Está seguro de publicar esta versión como versión vigente?',
            )
        ) {
            router.post(
                route('documentos.versiones.publicar', {
                    documento: documento.id,
                    version: versionId,
                }),
            );
        }
    };

    const handleDescargar = (url: string | null, tipo: 'pdf' | 'word') => {
        if (url) {
            window.open(url, '_blank');
        }
    };

    const handleCrearVersionDesdeCero = () => {
        router.visit(route('versiones.create', documento.id));
    };

    const handleDialogAprobar = () => {
        if (!selectedVersion) return;

        if (selectedVersion.estado.nombre === ESTADOS_VALIDOS.PENDIENTE) {
            handleMarcarRevisado();
        } else if (selectedVersion.estado.nombre === ESTADOS_VALIDOS.REVISADO) {
            handleAprobarVersion();
        }
    };

    // --- COMPONENTES RENDERIZADOS ---

    const renderMenuAcciones = (version: Documento['versiones'][0]) => {
        const disponibles = accionesDisponibles(version);

        return (
            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                        <MoreHorizontal className="h-3 w-3" />
                    </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                    {/* Crear nueva versión */}
                    {disponibles.includes('nueva_version') && (
                        <DropdownMenuItem
                            onClick={() => {
                                setSelectedVersion(version);
                                setShowNuevaVersionDialog(true);
                            }}
                        >
                            <Copy className="mr-2 h-4 w-4" />
                            Crear nueva versión
                        </DropdownMenuItem>
                    )}

                    {/* Enviar a revisión */}
                    {disponibles.includes('enviar_revision') && (
                        <DropdownMenuItem
                            onClick={() => {
                                setSelectedVersion(version);
                                setShowEnviarRevisionDialog(true);
                            }}
                        >
                            <Send className="mr-2 h-4 w-4" />
                            Enviar a revisión
                        </DropdownMenuItem>
                    )}

                    {/* Marcar como revisado (para revisores) */}
                    {disponibles.includes('marcar_revisado') && (
                        <DropdownMenuItem
                            onClick={() => {
                                setSelectedVersion(version);
                                setShowAprobarDialog(true);
                            }}
                        >
                            <CheckCircle className="mr-2 h-4 w-4" />
                            Marcar como Revisado
                        </DropdownMenuItem>
                    )}

                    {/* Aprobar (para aprobador) */}
                    {disponibles.includes('aprobar') && (
                        <DropdownMenuItem
                            onClick={() => {
                                setSelectedVersion(version);
                                setShowAprobarDialog(true);
                            }}
                        >
                            <CheckSquare className="mr-2 h-4 w-4" />
                            Aprobar
                        </DropdownMenuItem>
                    )}

                    {/* Rechazar (para revisores o aprobador) */}
                    {disponibles.includes('rechazar') && (
                        <DropdownMenuItem
                            onClick={() => {
                                setSelectedVersion(version);
                                setShowRechazarDialog(true);
                            }}
                        >
                            <XCircle className="mr-2 h-4 w-4" />
                            Rechazar
                        </DropdownMenuItem>
                    )}

                    {/* Publicar como vigente (solo para versiones Aprobadas) */}
                    {version.estado.nombre === ESTADOS_VALIDOS.REVISADO &&
                        esAprobador(version) && (
                            <DropdownMenuItem
                                onClick={() =>
                                    handlePublicarComoVigente(version.id)
                                }
                            >
                                <Globe className="mr-2 h-4 w-4" />
                                Publicar como vigente
                            </DropdownMenuItem>
                        )}
                </DropdownMenuContent>
            </DropdownMenu>
        );
    };

    const renderAccionesVersionActual = (
        version: Documento['versiones'][0],
    ) => {
        const disponibles = accionesDisponibles(version);

        return (
            <div className="flex flex-wrap gap-2">
                {/* Enviar a revisión */}
                {disponibles.includes('enviar_revision') && (
                    <Button
                        size="sm"
                        variant="secondary"
                        onClick={() => {
                            setSelectedVersion(version);
                            setShowEnviarRevisionDialog(true);
                        }}
                        className="h-8 px-3 text-xs"
                    >
                        <Send className="mr-1 h-3 w-3" />
                        Enviar a revisión
                    </Button>
                )}

                {/* Marcar como revisado */}
                {disponibles.includes('marcar_revisado') && (
                    <Button
                        size="sm"
                        variant="default"
                        onClick={() => {
                            setSelectedVersion(version);
                            setShowAprobarDialog(true);
                        }}
                        className="h-8 px-3 text-xs"
                    >
                        <CheckCircle className="mr-1 h-3 w-3" />
                        Marcar como Revisado
                    </Button>
                )}

                {/* Aprobar */}
                {disponibles.includes('aprobar') && (
                    <Button
                        size="sm"
                        variant="default"
                        onClick={() => {
                            setSelectedVersion(version);
                            setShowAprobarDialog(true);
                        }}
                        className="h-8 px-3 text-xs"
                    >
                        <CheckSquare className="mr-1 h-3 w-3" />
                        Aprobar
                    </Button>
                )}

                {/* Rechazar */}
                {disponibles.includes('rechazar') && (
                    <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => {
                            setSelectedVersion(version);
                            setShowRechazarDialog(true);
                        }}
                        className="h-8 px-3 text-xs"
                    >
                        <XCircle className="mr-1 h-3 w-3" />
                        Rechazar
                    </Button>
                )}

                {/* Publicar como vigente */}
                {version.estado.nombre === ESTADOS_VALIDOS.REVISADO &&
                    esAprobador(version) && (
                        <Button
                            size="sm"
                            variant="default"
                            onClick={() =>
                                handlePublicarComoVigente(version.id)
                            }
                            className="h-8 px-3 text-xs"
                        >
                            <Globe className="mr-1 h-3 w-3" />
                            Publicar como vigente
                        </Button>
                    )}
            </div>
        );
    };

    if (!documento) {
        return (
            <AppLayout>
                <Head title="Documento no encontrado" />
                <div className="flex min-h-[60vh] flex-col items-center justify-center">
                    <AlertCircle className="mb-4 h-16 w-16 text-muted-foreground" />
                    <h2 className="mb-2 text-2xl font-bold">
                        Documento no encontrado
                    </h2>
                    <p className="mb-6 text-muted-foreground">
                        El documento que buscas no existe o fue eliminado.
                    </p>
                    <Button asChild>
                        <Link href={route('documentos.index')}>
                            <ArrowLeft className="mr-2 h-4 w-4" />
                            Volver a Documentos
                        </Link>
                    </Button>
                </div>
            </AppLayout>
        );
    }

    const breadcrumbs = [
        { title: 'Documentos', href: route('documentos.index') },
        { title: documento.codigo || 'Documento', href: '' },
    ];

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`${documento.codigo} - ${documento.titulo}`} />

            <div className="container mx-auto space-y-6 p-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <Link href={route('documentos.index')}>
                            <Button variant="outline" size="sm">
                                <ArrowLeft className="mr-2 h-4 w-4" />
                                Volver
                            </Button>
                        </Link>
                        <div>
                            <div className="mb-1 flex items-center gap-2">
                                <Badge className={getTipoColor(documento.tipo)}>
                                    {documento.tipo}
                                </Badge>
                                <Badge
                                    className="font-medium"
                                    style={{
                                        backgroundColor: `${estadoDocumento.color}20`,
                                        color: estadoDocumento.color,
                                    }}
                                >
                                    {estadoDocumento.nombre}
                                </Badge>
                            </div>
                            <h1 className="text-2xl font-bold">
                                {documento.titulo}
                            </h1>
                            <div className="mt-1 flex items-center gap-2">
                                <span className="font-mono text-sm text-muted-foreground">
                                    {documento.codigo}
                                </span>
                                <span className="text-sm text-muted-foreground">
                                    • Área: {documento.area?.nombre}
                                </span>
                                <span className="text-sm text-muted-foreground">
                                    • Ubicación: {documento.ubicacion?.nombre}



                                </span>
                            </div>
                        </div>
                    </div>

                    <div className="flex items-center gap-2">
                        {versionActual?.archivo_pdf_url && (
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() =>
                                    handleDescargar(
                                        versionActual.archivo_pdf_url,
                                        'pdf',
                                    )
                                }
                            >
                                <Download className="mr-2 h-4 w-4" />
                                PDF
                            </Button>
                        )}

                        {versionActual?.archivo_word_url && (
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() =>
                                    handleDescargar(
                                        versionActual.archivo_word_url,
                                        'word',
                                    )
                                }
                            >
                                <FileText className="mr-2 h-4 w-4" />
                                Word
                            </Button>
                        )}

                        {documento.creador.id === user?.id && (
                            <Button
                                size="sm"
                                onClick={handleCrearVersionDesdeCero}
                            >
                                <Plus className="mr-2 h-4 w-4" />
                                Nueva Versión
                            </Button>
                        )}
                    </div>
                </div>

                {/* Tabs principales */}
                <Tabs
                    value={activeTab}
                    onValueChange={setActiveTab}
                    className="space-y-4"
                >
                    <TabsList className="grid grid-cols-2 md:grid-cols-4">
                        <TabsTrigger value="versiones">
                            <History className="mr-2 h-4 w-4" />
                            Versiones
                        </TabsTrigger>
                        <TabsTrigger value="informacion">
                            <FileIcon className="mr-2 h-4 w-4" />
                            Información
                        </TabsTrigger>
                        <TabsTrigger value="flujo">
                            <Users className="mr-2 h-4 w-4" />
                            Flujo
                        </TabsTrigger>
                        <TabsTrigger value="auditoria">
                            <Shield className="mr-2 h-4 w-4" />
                            Auditoría
                        </TabsTrigger>
                    </TabsList>

                    {/* Tab: Versiones */}
                    <TabsContent value="versiones" className="space-y-4">
                        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
                            {/* Lista de versiones */}
                            <div className="lg:col-span-1">
                                <Card>
                                    <CardHeader>
                                        <div className="flex items-center justify-between">
                                            <div>
                                                <CardTitle>
                                                    Historial de Versiones
                                                </CardTitle>
                                                <CardDescription>
                                                    {versiones.total} versiones
                                                    registradas
                                                </CardDescription>
                                            </div>
                                            {documento.creador.id === user?.id&& (
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    onClick={
                                                        handleCrearVersionDesdeCero
                                                    }
                                                >
                                                    <Plus className="h-4 w-4" />
                                                </Button>
                                            )}
                                        </div>
                                    </CardHeader>
                                    <CardContent>
                                        {/* Filtros para versiones */}
                                        <div className="mb-4 space-y-3">
                                            <div className="relative">
                                                <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 transform text-muted-foreground" />
                                                <Input
                                                    placeholder="Buscar por versión o cambios..."
                                                    value={searchTerm}
                                                    onChange={(e) =>
                                                        setSearchTerm(
                                                            e.target.value,
                                                        )
                                                    }
                                                    className="pl-10"
                                                />
                                            </div>
                                            <FilterSelect
                                                value={estadoFilter}
                                                onChange={setEstadoFilter}
                                                placeholder="Todos los estados"
                                                options={[
                                                    {
                                                        value: ESTADOS_VALIDOS.BORRADOR,
                                                        label: ESTADOS_VALIDOS.BORRADOR,
                                                    },
                                                    {
                                                        value: ESTADOS_VALIDOS.PENDIENTE,
                                                        label: ESTADOS_VALIDOS.PENDIENTE,
                                                    },
                                                    {
                                                        value: ESTADOS_VALIDOS.REVISADO,
                                                        label: ESTADOS_VALIDOS.REVISADO,
                                                    },
                                                    {
                                                        value: ESTADOS_VALIDOS.VIGENTE,
                                                        label: ESTADOS_VALIDOS.VIGENTE,
                                                    },
                                                    {
                                                        value: ESTADOS_VALIDOS.APROBADO,
                                                        label: ESTADOS_VALIDOS.APROBADO,
                                                    },
                                                    {
                                                        value: ESTADOS_VALIDOS.RECHAZADO,
                                                        label: ESTADOS_VALIDOS.RECHAZADO,
                                                    },
                                                ]}
                                            />
                                        </div>

                                        {/* Lista de versiones */}
                                        <div className="max-h-[500px] space-y-2 overflow-y-auto">
                                            {versiones.data.map((version) => {
                                                const estadoConfig =
                                                    getEstadoBadge(
                                                        version.estado.nombre,
                                                    );
                                                const esVigente =
                                                    documento.version_vigente
                                                        ?.id === version.id;
                                                const esActiva =
                                                    activeVersionId ===
                                                    version.id;

                                                return (
                                                    <div
                                                        key={version.id}
                                                        className={`cursor-pointer rounded-lg border p-3 transition-colors ${
                                                            esActiva
                                                                ? 'border-primary bg-primary/5'
                                                                : 'hover:bg-muted'
                                                        }`}
                                                        onClick={() =>
                                                            setActiveVersionId(
                                                                version.id,
                                                            )
                                                        }
                                                    >
                                                        <div className="flex items-center justify-between">
                                                            <div className="flex items-center gap-2">
                                                                <div
                                                                    className="h-2 w-2 rounded-full"
                                                                    style={{
                                                                        backgroundColor:
                                                                            estadoConfig.color,
                                                                    }}
                                                                />
                                                                <span className="font-mono font-semibold">
                                                                    v
                                                                    {
                                                                        version.numero_version
                                                                    }
                                                                </span>
                                                                {esVigente && (
                                                                    <Badge
                                                                        variant="secondary"
                                                                        size="sm"
                                                                    >
                                                                        Vigente
                                                                    </Badge>
                                                                )}
                                                            </div>

                                                            <div className="flex items-center gap-1">
                                                                <span
                                                                    className={`rounded-full px-2 py-1 text-xs ${estadoConfig.bg} ${estadoConfig.text}`}
                                                                >
                                                                    {
                                                                        version
                                                                            .estado
                                                                            .nombre
                                                                    }
                                                                </span>
                                                                {renderMenuAcciones(
                                                                    version,
                                                                )}
                                                            </div>
                                                        </div>
                                                        <p className="mt-2 line-clamp-2 text-sm text-muted-foreground">
                                                            {version.cambios}
                                                        </p>
                                                        <div className="mt-2 flex items-center justify-between text-xs text-muted-foreground">
                                                            <span>
                                                                {
                                                                    version
                                                                        .creador
                                                                        ?.name
                                                                }
                                                            </span>
                                                            <span>
                                                                {formatFechaConHora(
                                                                    version.fecha_creacion,
                                                                )}
                                                            </span>
                                                        </div>
                                                    </div>
                                                );
                                            })}
                                        </div>

                                        {/* Paginación */}
                                        {versiones.data.length > 0 && (
                                            <div className="mt-4 border-t pt-4">
                                                <TablePagination
                                                    pagination={versiones}
                                                    onPageChange={(newPage) =>
                                                        setPage(newPage)
                                                    }
                                                />
                                            </div>
                                        )}
                                    </CardContent>
                                </Card>
                            </div>

                            {/* Vista de versión seleccionada */}
                            <div className="lg:col-span-2">
                                {versionActual ? (
                                    <Card>
                                        <CardHeader>
                                            <div className="flex items-center justify-between">
                                                <div>
                                                    <CardTitle className="flex items-center gap-2">
                                                        Versión v
                                                        {
                                                            versionActual.numero_version
                                                        }
                                                        {documento
                                                            .version_vigente
                                                            ?.id ===
                                                            versionActual.id && (
                                                            <Badge variant="default">
                                                                Vigente
                                                            </Badge>
                                                        )}
                                                    </CardTitle>
                                                    <CardDescription>
                                                        {versionActual.cambios}
                                                    </CardDescription>
                                                </div>
                                                <div
                                                    className={`rounded-full px-3 py-1 ${getEstadoBadge(versionActual.estado.nombre).bg} ${getEstadoBadge(versionActual.estado.nombre).text}`}
                                                >
                                                    {
                                                        versionActual.estado
                                                            .nombre
                                                    }
                                                </div>
                                            </div>
                                        </CardHeader>
                                        <CardContent className="space-y-6">
                                            {/* Información de la versión */}
                                            <div className="grid grid-cols-2 gap-4">
                                                <div>
                                                    <h4 className="text-sm font-medium text-muted-foreground">
                                                        Creador
                                                    </h4>
                                                    <div className="flex items-center justify-between">
                                                        <p className="mt-1 flex items-center gap-2">
                                                            <UserCheck className="h-4 w-4" />
                                                            {
                                                                versionActual
                                                                    .creador
                                                                    ?.name
                                                            }
                                                            {esCreador(
                                                                versionActual,
                                                            ) && (
                                                                <Badge
                                                                    variant="outline"
                                                                    size="sm"
                                                                    className="ml-2"
                                                                >
                                                                    Tú
                                                                </Badge>
                                                            )}
                                                        </p>
                                                    </div>
                                                </div>

                                                <div>
                                                    <h4 className="text-sm font-medium text-muted-foreground">
                                                        Fecha creación
                                                    </h4>
                                                    <p className="mt-1 flex items-center gap-2">
                                                        <Clock className="h-4 w-4" />
                                                        {formatFechaConHora(
                                                            versionActual.fecha_creacion,
                                                        )}
                                                    </p>
                                                </div>

                                                {versionActual.revisor1 && (
                                                    <div>
                                                        <h4 className="text-sm font-medium text-muted-foreground">
                                                            Revisor 1
                                                        </h4>
                                                        <div className="flex items-center justify-between">
                                                            <p>
                                                                {
                                                                    versionActual
                                                                        .revisor1
                                                                        .name
                                                                }
                                                            </p>
                                                            {esRevisor(
                                                                versionActual,
                                                            ) &&
                                                                versionActual
                                                                    .revisor1
                                                                    .id ===
                                                                    user?.id && (
                                                                    <Badge
                                                                        variant="outline"
                                                                        size="sm"
                                                                        className="ml-2"
                                                                    >
                                                                        Tú
                                                                    </Badge>
                                                                )}
                                                        </div>
                                                    </div>
                                                )}

                                                {versionActual.revisor2 && (
                                                    <div>
                                                        <h4 className="text-sm font-medium text-muted-foreground">
                                                            Revisor 2
                                                        </h4>
                                                        <div className="flex items-center justify-between">
                                                            <p>
                                                                {
                                                                    versionActual
                                                                        .revisor2
                                                                        .name
                                                                }
                                                            </p>
                                                            {esRevisor(
                                                                versionActual,
                                                            ) &&
                                                                versionActual
                                                                    .revisor2
                                                                    .id ===
                                                                    user?.id && (
                                                                    <Badge
                                                                        variant="outline"
                                                                        size="sm"
                                                                        className="ml-2"
                                                                    >
                                                                        Tú
                                                                    </Badge>
                                                                )}
                                                        </div>
                                                    </div>
                                                )}

                                                {versionActual.aprobador && (
                                                    <div>
                                                        <h4 className="text-sm font-medium text-muted-foreground">
                                                            Aprobador
                                                        </h4>
                                                        <div className="flex items-center justify-between">
                                                            <p>
                                                                {
                                                                    versionActual
                                                                        .aprobador
                                                                        .name
                                                                }
                                                            </p>
                                                            {esAprobador(
                                                                versionActual,
                                                            ) && (
                                                                <Badge
                                                                    variant="outline"
                                                                    size="sm"
                                                                    className="ml-2"
                                                                >
                                                                    Tú
                                                                </Badge>
                                                            )}
                                                        </div>
                                                    </div>
                                                )}

                                                {versionActual.observaciones && (
                                                    <div className="col-span-2">
                                                        <h4 className="text-sm font-medium text-muted-foreground">
                                                            Observaciones
                                                        </h4>
                                                        <p className="mt-1 rounded bg-muted p-2">
                                                            {
                                                                versionActual.observaciones
                                                            }
                                                        </p>
                                                    </div>
                                                )}
                                            </div>

                                            {/* Visor de PDF o Word (Office Viewer) */}
                                            {versionActual.archivo_pdf_url ? (
                                                <div className="space-y-3">
                                                    <div className="flex items-center justify-between">
                                                        <div>
                                                            <h4 className="text-sm font-medium text-muted-foreground">
                                                                Vista previa del documento
                                                            </h4>
                                                            <p className="text-xs text-muted-foreground">
                                                                Versión {versionActual.numero_version} • Solo visualización
                                                            </p>
                                                        </div>
                                                        <Badge variant="outline" className="text-xs">
                                                            <Eye className="mr-1 h-3 w-3" /> Modo lectura
                                                        </Badge>
                                                    </div>

                                                    <PDFViewer fileUrl={versionActual.archivo_pdf_url} height="700px" />

                                                    <div className="flex gap-2">
                                                        <a href={versionActual.archivo_pdf_url} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 px-3 py-2 bg-slate-100 rounded text-sm">
                                                            <Download className="h-4 w-4" /> Descargar PDF
                                                        </a>
                                                        {versionActual.archivo_word_url && (
                                                            <a href={versionActual.archivo_word_url} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 px-3 py-2 bg-slate-100 rounded text-sm">
                                                                <FileText className="h-4 w-4" /> Descargar Word
                                                            </a>
                                                        )}
                                                        {versionActual.archivo_rechazo_url && (
                                                            <a href={versionActual.archivo_rechazo_url} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 px-3 py-2 bg-red-100 rounded text-sm">
                                                                <FileText className="h-4 w-4" /> Descargar Correcciones (Revisor)
                                                            </a>
                                                        )}
                                                    </div>
                                                </div>
                                            ) : versionActual.archivo_word_url ? (
                                                <div className="space-y-3">
                                                    <div className="flex items-center justify-between">
                                                        <div>
                                                            <h4 className="text-sm font-medium text-muted-foreground">
                                                                Documento disponible
                                                            </h4>
                                                            <p className="text-xs text-muted-foreground">
                                                                Versión {versionActual.numero_version} • Word
                                                            </p>
                                                        </div>
                                                        <Badge variant="outline" className="text-xs">
                                                            <FileText className="mr-1 h-3 w-3" /> Descargable
                                                        </Badge>
                                                    </div>

                                                    <div className="flex gap-2">
                                                        <a href={versionActual.archivo_word_url} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 px-3 py-2 bg-slate-100 rounded text-sm">
                                                            <Download className="h-4 w-4" /> Descargar Word
                                                        </a>
                                                        {versionActual.archivo_rechazo_url && (
                                                            <a href={versionActual.archivo_rechazo_url} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 px-3 py-2 bg-red-100 rounded text-sm">
                                                                <FileText className="h-4 w-4" /> Descargar Correcciones (Revisor)
                                                            </a>
                                                        )}
                                                    </div>
                                                </div>
                                            ) : null}

                                            {/* Acciones según estado */}
                                            <div className="flex items-center gap-2 border-t pt-4">
                                                {renderAccionesVersionActual(
                                                    versionActual,
                                                )}
                                            </div>
                                        </CardContent>
                                    </Card>
                                ) : (
                                    <Card>
                                        <CardHeader>
                                            <CardTitle>Sin versiones</CardTitle>
                                            <CardDescription>
                                                No hay versiones disponibles
                                                para este documento.
                                            </CardDescription>
                                        </CardHeader>
                                    </Card>
                                )}
                            </div>
                        </div>
                    </TabsContent>

                    {/* Tab: Información */}
                    <TabsContent value="informacion" className="space-y-4">
                        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                            <Card className="md:col-span-2">
                                <CardHeader>
                                    <CardTitle className="text-lg">
                                        Detalles del Documento
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                                        <div>
                                            <p className="text-sm font-medium text-muted-foreground">
                                                Código
                                            </p>
                                            <p className="font-mono font-bold">
                                                {documento.codigo}
                                            </p>
                                        </div>
                                        <div>
                                            <p className="text-sm font-medium text-muted-foreground">
                                                Versión Vigente
                                            </p>
                                            <p className="font-mono font-bold">
                                                {documento.version_vigente
                                                    ?.numero_version || 'N/A'}
                                            </p>
                                        </div>
                                        <div>
                                            <p className="text-sm font-medium text-muted-foreground">
                                                Área
                                            </p>
                                            <div className="flex items-center gap-2">
                                                <Building className="h-4 w-4" />
                                                <p>
                                                    {documento.area?.nombre ||
                                                        'N/A'}
                                                </p>
                                            </div>
                                        </div>
                                        <div>
                                            <p className="text-sm font-medium text-muted-foreground">
                                                Ubicación
                                            </p>
                                            <div className="flex items-center gap-2">
                                                <MapPin className="h-4 w-4" />
                                                <p>
                                                    {documento.ubicacion
                                                        ?.nombre || 'N/A'}
                                                </p>
                                            </div>
                                        </div>
                                    </div>

                                    <div>
                                        <p className="text-sm font-medium text-muted-foreground">
                                            Descripción
                                        </p>
                                        <p className="whitespace-pre-line">
                                            {documento.descripcion ||
                                                'Sin descripción'}
                                        </p>
                                    </div>
                                </CardContent>
                            </Card>

                            <Card>
                                <CardHeader>
                                    <CardTitle className="text-lg">
                                        Responsables
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="space-y-3">
                                        <div>
                                            <p className="text-sm font-medium text-muted-foreground">
                                                Creador
                                            </p>
                                            <div className="flex items-center gap-2">
                                                <User className="h-4 w-4" />
                                                <span>
                                                    {documento.creador?.name ||
                                                        'N/A'}
                                                </span>
                                            </div>
                                        </div>

                                        <div>
                                            <p className="text-sm font-medium text-muted-foreground">
                                                Revisor 1
                                            </p>
                                            <div className="flex items-center gap-2">
                                                <CheckCircle className="h-4 w-4" />
                                                <span>
                                                    {documento.revisor1?.name ||
                                                        'Pendiente'}
                                                </span>
                                            </div>
                                        </div>

                                        <div>
                                            <p className="text-sm font-medium text-muted-foreground">
                                                Revisor 2
                                            </p>
                                            <div className="flex items-center gap-2">
                                                <CheckCircle className="h-4 w-4" />
                                                <span>
                                                    {documento.revisor2?.name ||
                                                        'Pendiente'}
                                                </span>
                                            </div>
                                        </div>

                                        <div>
                                            <p className="text-sm font-medium text-muted-foreground">
                                                Aprobador
                                            </p>
                                            <div className="flex items-center gap-2">
                                                <CheckSquare className="h-4 w-4" />
                                                <span>
                                                    {documento.aprobador
                                                        ?.name || 'Pendiente'}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>
                    </TabsContent>

                    {/* Tab: Flujo */}
                    <TabsContent value="flujo" className="space-y-4">
                        <Card>
                            <CardHeader>
                                <CardTitle>Flujo de Aprobación</CardTitle>
                                <CardDescription>
                                    Estado actual del proceso de revisión y
                                    aprobación
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-4">
                                    <div className="flex items-center justify-between rounded-lg border p-4">
                                        <div className="flex items-center gap-3">
                                            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-100">
                                                <UserCheck className="h-4 w-4 text-blue-600" />
                                            </div>
                                            <div>
                                                <p className="font-medium">
                                                    Creación
                                                </p>
                                                <p className="text-sm text-muted-foreground">
                                                    Por:{' '}
                                                    {documento.creador?.name}
                                                </p>
                                            </div>
                                        </div>
                                        <Badge
                                            variant="outline"
                                            className="bg-green-50 text-green-700"
                                        >
                                            Completado
                                        </Badge>
                                    </div>

                                    <div className="flex items-center justify-between rounded-lg border p-4">
                                        <div className="flex items-center gap-3">
                                            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-orange-100">
                                                <CheckCircle className="h-4 w-4 text-orange-600" />
                                            </div>
                                            <div>
                                                <p className="font-medium">
                                                    Revisión
                                                </p>
                                                <p className="text-sm text-muted-foreground">
                                                    {documento.revisor1?.name ||
                                                        'Pendiente'}{' '}
                                                    {documento.revisor2?.name
                                                        ? `y ${documento.revisor2?.name}`
                                                        : ''}
                                                </p>
                                            </div>
                                        </div>
                                        <Badge
                                            variant="outline"
                                            className={
                                                estadoDocumento.nombre ===
                                                    'en_revision' ||
                                                estadoDocumento.nombre ===
                                                    'Revisado' ||
                                                estadoDocumento.nombre ===
                                                    'Aprobado' ||
                                                estadoDocumento.nombre ===
                                                    'Vigente'
                                                    ? 'bg-green-50 text-green-700'
                                                    : 'bg-gray-50 text-gray-700'
                                            }
                                        >
                                            {estadoDocumento.nombre ===
                                                'en_revision' ||
                                            estadoDocumento.nombre ===
                                                'Revisado' ||
                                            estadoDocumento.nombre ===
                                                'Aprobado' ||
                                            estadoDocumento.nombre ===
                                                'Vigente'
                                                ? 'Completado'
                                                : 'Pendiente'}
                                        </Badge>
                                    </div>

                                    <div className="flex items-center justify-between rounded-lg border p-4">
                                        <div className="flex items-center gap-3">
                                            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-purple-100">
                                                <CheckSquare className="h-4 w-4 text-purple-600" />
                                            </div>
                                            <div>
                                                <p className="font-medium">
                                                    Aprobación
                                                </p>
                                                <p className="text-sm text-muted-foreground">
                                                    {documento.aprobador
                                                        ?.name || 'Pendiente'}
                                                </p>
                                            </div>
                                        </div>
                                        <Badge
                                            variant="outline"
                                            className={
                                                estadoDocumento.nombre ===
                                                    'Aprobado' ||
                                                estadoDocumento.nombre ===
                                                    'Vigente'
                                                    ? 'bg-green-50 text-green-700'
                                                    : 'bg-gray-50 text-gray-700'
                                            }
                                        >
                                            {estadoDocumento.nombre ===
                                                'Aprobado' ||
                                            estadoDocumento.nombre ===
                                                'Vigente'
                                                ? 'Completado'
                                                : 'Pendiente'}
                                        </Badge>
                                    </div>

                                    <div className="flex items-center justify-between rounded-lg border p-4">
                                        <div className="flex items-center gap-3">
                                            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-green-100">
                                                <GlobeIcon className="h-4 w-4 text-green-600" />
                                            </div>
                                            <div>
                                                <p className="font-medium">
                                                    Publicación
                                                </p>
                                                <p className="text-sm text-muted-foreground">
                                                    Versión vigente:{' '}
                                                    {documento.version_vigente
                                                        ?.numero_version ||
                                                        'N/A'}
                                                </p>
                                            </div>
                                        </div>
                                        <Badge
                                            variant="outline"
                                            className={
                                                estadoDocumento.nombre ===
                                                'Vigente'
                                                    ? 'bg-green-50 text-green-700'
                                                    : 'bg-gray-50 text-gray-700'
                                            }
                                        >
                                            {estadoDocumento.nombre ===
                                            'Vigente'
                                                ? 'Completado'
                                                : 'Pendiente'}
                                        </Badge>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </TabsContent>

                    {/* Tab: Auditoría */}
                    <TabsContent value="auditoria" className="space-y-4">
                        <Card>
                            <CardHeader>
                                <CardTitle>Registro de Auditoría</CardTitle>
                                <CardDescription>
                                    Historial de cambios y acciones realizadas
                                    en el documento
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-4">
                                    <div className="flex items-start gap-3 rounded-lg border p-3">
                                        <div className="mt-1 flex h-8 w-8 items-center justify-center rounded-full bg-blue-100">
                                            <Plus className="h-4 w-4 text-blue-600" />
                                        </div>
                                        <div className="flex-1">
                                            <div className="flex items-center justify-between">
                                                <p className="font-medium">
                                                    Documento creado
                                                </p>
                                                <span className="text-xs text-muted-foreground">
                                                    {formatFechaConHora(
                                                        documento.created_at,
                                                    )}
                                                </span>
                                            </div>
                                            <p className="text-sm text-muted-foreground">
                                                Por: {documento.creador?.name} (
                                                {documento.creador?.email})
                                            </p>
                                        </div>
                                    </div>

                                    {documentoVersiones.map((version) => {
                                        const isVigente = isVersionVigente(version.numero_version);
                                        const isExpanded = expandedVersions.has(version.id);
                                        const hasIntermediateVersions = documentoVersiones.some(v => {
                                            const vNum = parseInt(v.numero_version.split('.')[0]);
                                            const currentNum = parseInt(version.numero_version.split('.')[0]);
                                            const vDec = parseInt(v.numero_version.split('.')[1]);
                                            return vNum === currentNum && vDec > 0 && vDec < 10;
                                        });

                                        // Para versiones vigentes (1.0, 2.0, 3.0)
                                        if (isVigente) {
                                            return (
                                                <div key={version.id}>
                                                    <div className="flex items-start gap-3 rounded-lg border p-3">
                                                        <div className="mt-1 flex h-8 w-8 items-center justify-center rounded-full bg-green-100">
                                                            <Copy className="h-4 w-4 text-green-600" />
                                                        </div>
                                                        <div className="flex-1">
                                                            <div className="flex items-center justify-between">
                                                                <div className="flex items-center gap-2">
                                                                    <p className="font-medium">
                                                                        Versión{' '}
                                                                        {version.numero_version}{' '}
                                                                        aprobada
                                                                    </p>
                                                                    <Badge className="bg-green-100 text-green-800">
                                                                        Vigente
                                                                    </Badge>
                                                                </div>
                                                                <span className="text-xs text-muted-foreground">
                                                                    {formatFechaConHora(
                                                                        version.fecha_aprobado,
                                                                    )}
                                                                </span>
                                                            </div>
                                                            <p className="text-sm text-muted-foreground">
                                                                Cambios: {version.cambios}
                                                            </p>
                                                            <p className="text-sm text-muted-foreground">
                                                                Aprobado por: {version.aprobador?.name}
                                                            </p>
                                                            {hasIntermediateVersions && (
                                                                <Button
                                                                    size="sm"
                                                                    variant="ghost"
                                                                    className="mt-2"
                                                                    onClick={() => {
                                                                        const newExpanded = new Set(expandedVersions);
                                                                        if (isExpanded) {
                                                                            newExpanded.delete(version.id);
                                                                        } else {
                                                                            newExpanded.add(version.id);
                                                                        }
                                                                        setExpandedVersions(newExpanded);
                                                                    }}
                                                                >
                                                                    {isExpanded ? '▼ ' : '▶ '}
                                                                    {isExpanded ? 'Ocultar' : 'Ver'} versiones intermedias
                                                                </Button>
                                                            )}
                                                        </div>
                                                    </div>

                                                    {/* Versiones intermedias colapsables */}
                                                    {isExpanded && (
                                                        <div className="ml-8 mt-2 space-y-2 border-l-2 border-gray-200 pl-4">
                                                            {documentoVersiones
                                                                .filter(v => {
                                                                    const vNum = parseInt(v.numero_version.split('.')[0]);
                                                                    const currentNum = parseInt(version.numero_version.split('.')[0]);
                                                                    const vDec = parseInt(v.numero_version.split('.')[1]);
                                                                    return vNum === currentNum && vDec > 0 && vDec < 10 && !isVersionVigente(v.numero_version);
                                                                })
                                                                .sort((a, b) => {
                                                                    const aDec = parseInt(a.numero_version.split('.')[1]);
                                                                    const bDec = parseInt(b.numero_version.split('.')[1]);
                                                                    return bDec - aDec;
                                                                })
                                                                .map(intVersion => (
                                                                    <div
                                                                        key={intVersion.id}
                                                                        className="flex items-start gap-3 rounded-lg border border-gray-200 bg-gray-50 p-3"
                                                                    >
                                                                        <div className="mt-1 flex h-8 w-8 items-center justify-center rounded-full bg-yellow-100">
                                                                            <Copy className="h-4 w-4 text-yellow-600" />
                                                                        </div>
                                                                        <div className="flex-1">
                                                                            <div className="flex items-center justify-between">
                                                                                <p className="text-sm font-medium">
                                                                                    Versión{' '}
                                                                                    {intVersion.numero_version}{' '}
                                                                                    creada
                                                                                </p>
                                                                                <span className="text-xs text-muted-foreground">
                                                                                    {formatFechaConHora(
                                                                                        intVersion.fecha_creacion,
                                                                                    )}
                                                                                </span>
                                                                            </div>
                                                                            <p className="text-xs text-muted-foreground">
                                                                                Cambios: {intVersion.cambios}
                                                                            </p>
                                                                            <p className="text-xs text-muted-foreground">
                                                                                Por: {intVersion.creador?.name}
                                                                            </p>
                                                                            <Badge className="mt-2 bg-yellow-100 text-yellow-800">
                                                                                {intVersion.estado.nombre}
                                                                            </Badge>
                                                                        </div>
                                                                    </div>
                                                                ))}
                                                        </div>
                                                    )}
                                                </div>
                                            );
                                        }
                                        return null;
                                    })}
                                </div>
                            </CardContent>
                        </Card>
                    </TabsContent>
                </Tabs>

                {/* Dialogos para acciones */}
                <Dialog
                    open={showNuevaVersionDialog}
                    onOpenChange={setShowNuevaVersionDialog}
                >
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Crear Nueva Versión</DialogTitle>
                            <DialogDescription>
                                Crea una nueva versión basada en la versión
                                actual.
                            </DialogDescription>
                        </DialogHeader>
                        <div className="space-y-4 py-4">
                            <div className="space-y-2">
                                <Label htmlFor="cambios">
                                    Cambios realizados *
                                </Label>
                                <Textarea
                                    id="cambios"
                                    value={formData.cambios}
                                    onChange={(e) =>
                                        setData('cambios', e.target.value)
                                    }
                                    placeholder="Describa los cambios realizados en esta versión..."
                                    rows={4}
                                />
                            </div>
                        </div>
                        <DialogFooter>
                            <Button
                                variant="outline"
                                onClick={() => setShowNuevaVersionDialog(false)}
                            >
                                Cancelar
                            </Button>
                            <Button onClick={handleCrearNuevaVersion}>
                                Crear Versión
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>

                {/* Dialog para enviar a revisión */}
                <Dialog
                    open={showEnviarRevisionDialog}
                    onOpenChange={setShowEnviarRevisionDialog}
                >
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Enviar a Revisión</DialogTitle>
                            <DialogDescription>
                                ¿Está seguro de enviar esta versión a revisión?
                            </DialogDescription>
                        </DialogHeader>
                        <div className="space-y-4 py-4">
                            <div className="rounded-lg border border-blue-200 bg-blue-50 p-4">
                                <div className="flex items-start gap-2">
                                    <AlertCircle className="mt-0.5 h-5 w-5 text-blue-600" />
                                    <div>
                                        <p className="text-sm text-blue-700">
                                            Esta versión será enviada a revisión
                                            y cambiará su estado a "En
                                            revisión". Los revisores asignados
                                            podrán revisarla y aprobarla.
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <DialogFooter>
                            <Button
                                variant="outline"
                                onClick={() =>
                                    setShowEnviarRevisionDialog(false)
                                }
                            >
                                Cancelar
                            </Button>
                            <Button onClick={handleEnviarRevision}>
                                Enviar a Revisión
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>

                {/* Dialog para rechazar versión */}
                <Dialog
                    open={showRechazarDialog}
                    onOpenChange={setShowRechazarDialog}
                >
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Rechazar Versión</DialogTitle>
                            <DialogDescription>
                                Indique las observaciones y opcionalmente adjunte
                                un documento con las correcciones.
                            </DialogDescription>
                        </DialogHeader>
                        <div className="space-y-4 py-4">
                            <div className="space-y-2">
                                <Label htmlFor="observaciones">
                                    Observaciones *
                                </Label>
                                <Textarea
                                    id="observaciones"
                                    value={formData.observaciones}
                                    onChange={(e) =>
                                        setData('observaciones', e.target.value)
                                    }
                                    placeholder="Describa las razones del rechazo..."
                                    rows={4}
                                    required
                                />
                                <p className="text-xs text-muted-foreground">
                                    Las observaciones serán visibles para el
                                    creador de la versión.
                                </p>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="archivo_rechazo">
                                    Documento con correcciones (opcional)
                                </Label>
                                <Input
                                    id="archivo_rechazo"
                                    type="file"
                                    accept=".doc,.docx,.pdf"
                                    onChange={(e) =>
                                        setData(
                                            'archivo_rechazo',
                                            e.target.files?.[0] || null,
                                        )
                                    }
                                />
                                <p className="text-xs text-muted-foreground">
                                    Puedes adjuntar un Word, PDF o documento con
                                    las correcciones sugeridas (máx. 10 MB).
                                </p>
                            </div>
                        </div>
                        <DialogFooter>
                            <Button
                                variant="outline"
                                onClick={() => setShowRechazarDialog(false)}
                            >
                                Cancelar
                            </Button>
                            <Button
                                onClick={handleRechazar}
                                variant="destructive"
                                disabled={!formData.observaciones.trim()}
                            >
                                Rechazar Versión
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>

                {/* Dialog para aprobar versión */}
                <Dialog
                    open={showAprobarDialog}
                    onOpenChange={setShowAprobarDialog}
                >
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>
                                {selectedVersion?.estado.nombre ===
                                'en_revision'
                                    ? 'Marcar como Revisado'
                                    : 'Aprobar Versión'}
                            </DialogTitle>
                            <DialogDescription>
                                {selectedVersion?.estado.nombre ===
                                'en_revision'
                                    ? '¿Marcar como Revisado?'
                                    : '¿Aprobar esta versión?'}
                            </DialogDescription>
                        </DialogHeader>
                        <div className="space-y-4 py-4">
                            <div className="rounded-lg border border-green-200 bg-green-50 p-4">
                                <div className="flex items-start gap-2">
                                    <CheckCircle className="mt-0.5 h-5 w-5 text-green-600" />
                                    <div>
                                        <p className="text-sm text-green-700">
                                            {selectedVersion?.estado.nombre ===
                                            'en_revision'
                                                ? 'La versión cambiará a estado "Revisado" y pasará a aprobación.'
                                                : 'La versión será aprobada y estará lista para publicación.'}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <DialogFooter>
                            <Button
                                variant="outline"
                                onClick={() => setShowAprobarDialog(false)}
                            >
                                Cancelar
                            </Button>
                            <Button
                                onClick={handleDialogAprobar}
                                variant="default"
                            >
                                {selectedVersion?.estado.nombre ===
                                'en_revision'
                                    ? 'Marcar como Revisado'
                                    : 'Aprobar'}
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            </div>
        </AppLayout>
    );
}
