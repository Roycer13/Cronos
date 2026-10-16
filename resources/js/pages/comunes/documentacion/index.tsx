import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
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
import TablePagination from '@/components/ui/table-pagination';
import { useAuth } from '@/hooks/useAuth';
import AppLayout from '@/layouts/app-layout';
import { Head, Link, router, usePage } from '@inertiajs/react';
import {
    AlertCircle,
    Calendar,
    CheckCircle,
    Clock,
    Edit,
    FileText,
    FileX,
    Filter,
    Folder,
    Hash,
    Layers,
    MoreHorizontal,
    Navigation,
    Plus,
    RefreshCw,
    Search,
    Tag,
    Trash2,
    User,
    X,
} from 'lucide-react';
import { useEffect, useState } from 'react';
import { route } from 'ziggy-js';

interface Documento {
    id: number;
    codigo: string;
    titulo: string;
    descripcion: string;
    tipo: string;
    area: { id: number; nombre: string };
    ubicacion: { id: number; nombre: string };
    estado: { id: number; nombre: string; color: string };
    version_vigente?: {
        numero_version: string;
        fecha_aprobacion?: string;
        estado?: { nombre: string };
    };
    creador?: { name: string };
    created_at: string;
    fecha_vigencia?: string;
    fecha_revision?: string;
}

interface PageProps {
    [key: string]: unknown;
    documentos: {
        data: Documento[];
        links: any[];
        current_page: number;
        last_page: number;
        per_page: number;
        total: number;
    };
    filters: {
        ubicacion_id?: string;
        tipo?: string;
        area_id?: string;
        estado_id?: string;
        search?: string;
    };
    ubicaciones: Array<{ id: number; nombre: string }>;
    areas: Array<{ id: number; nombre: string }>;
    estados: Array<{ id: number; nombre: string; color: string }>;
    flash: { success?: string; error?: string };
}

const breadcrumbs = [
    { title: 'Inicio', href: route('dashboard') },
    { title: 'Documentos', href: '' },
];

export default function DocumentoIndex() {
    const { documentos, filters, ubicaciones, areas, estados, flash } =
        usePage<PageProps>().props;
    const [searchTerm, setSearchTerm] = useState(filters.search || '');
    const [tipoFilter, setTipoFilter] = useState(filters.tipo || 'all');
    const [areaFilter, setAreaFilter] = useState(filters.area_id || 'all');
    const [ubicacionFilter, setUbicacionFilter] = useState(
        filters.ubicacion_id || 'all',
    );
    const [estadoFilter, setEstadoFilter] = useState(
        filters.estado_id || 'all',
    );
    const [showFilters, setShowFilters] = useState(false);
    const [currentPage, setCurrentPage] = useState(documentos.current_page);
    const [exporting, setExporting] = useState(false);

    const tiposDocumento = [
        { value: 'procedimiento', label: 'Procedimiento' },
        { value: 'instructivo', label: 'Instructivo' },
        { value: 'registro', label: 'Registro' },
        { value: 'politica', label: 'Política' },
        { value: 'manual', label: 'Manual' },
        { value: 'formato', label: 'Formato' },
    ];

    const hasActiveFilters = () => {
        return (
            searchTerm ||
            tipoFilter !== 'all' ||
            areaFilter !== 'all' ||
            ubicacionFilter !== 'all' ||
            estadoFilter !== 'all'
        );
    };

    useEffect(() => {
        const debounceTimer = setTimeout(() => {
            const newFilters: any = {};

            if (searchTerm) newFilters.search = searchTerm;
            if (tipoFilter && tipoFilter !== 'all')
                newFilters.tipo = tipoFilter;
            if (areaFilter && areaFilter !== 'all')
                newFilters.area_id = areaFilter;
            if (ubicacionFilter && ubicacionFilter !== 'all')
                newFilters.ubicacion_id = ubicacionFilter;
            if (estadoFilter && estadoFilter !== 'all')
                newFilters.estado_id = estadoFilter;

            router.get(route('documentos.index'), newFilters, {
                preserveState: true,
                replace: true,
            });
        }, 300);

        return () => clearTimeout(debounceTimer);
    }, [searchTerm, tipoFilter, areaFilter, ubicacionFilter, estadoFilter]);

    const resetFilters = () => {
        setSearchTerm('');
        setTipoFilter('all');
        setAreaFilter('all');
        setUbicacionFilter('all');
        setEstadoFilter('all');
        setShowFilters(false);
    };

    const getTipoColor = (tipo: string) => {
        const colors: Record<string, string> = {
            procedimiento: 'bg-blue-500/10 text-blue-600 dark:text-blue-400',
            instructivo: 'bg-green-500/10 text-green-600 dark:text-green-400',
            registro: 'bg-purple-500/10 text-purple-600 dark:text-purple-400',
            politica: 'bg-amber-500/10 text-amber-600 dark:text-amber-400',
            manual: 'bg-indigo-500/10 text-indigo-600 dark:text-indigo-400',
            formato: 'bg-rose-500/10 text-rose-600 dark:text-rose-400',
        };
        return (
            colors[tipo] || 'bg-gray-500/10 text-gray-600 dark:text-gray-400'
        );
    };

    const getEstadoBadge = (
        estado: { nombre: string; color: string } | null | undefined,
    ) => {
        if (!estado) {
            return (
                <Badge
                    variant="outline"
                    className="flex items-center gap-1.5 px-2 py-1 text-xs font-medium"
                >
                    <AlertCircle className="h-3 w-3" />
                    Sin estado
                </Badge>
            );
        }

        const getIcon = () => {
            switch (estado.nombre.toLowerCase()) {
                case 'aprobado':
                case 'vigente':
                    return <CheckCircle className="h-3 w-3" />;

                case 'pendiente':
                case 'revision':
                    return <Clock className="h-3 w-3" />;

                case 'obsoleto':
                case 'retirado':
                    return <FileX className="h-3 w-3" />;

                default:
                    return <AlertCircle className="h-3 w-3" />;
            }
        };

        return (
            <Badge
                className="flex items-center gap-1.5 px-2 py-1 text-xs font-medium"
                style={{
                    backgroundColor: `${estado.color}15`,
                    color: estado.color,
                }}
            >
                {getIcon()}
                {estado.nombre}
            </Badge>
        );
    };

    const {
        hasPermission,
        belongsToUbicacion,
        canDo,
        user: authUser,
    } = useAuth();
    const handlePageChange = (page: number) => {
        setCurrentPage(page);
        router.get(
            route('documentos.index'),
            {
                ...filters,
                page,
            },
            { preserveState: true },
        );
    };

    const handleDelete = (id: number) => {
        if (
            confirm(
                '¿Está seguro de eliminar este documento? Esta acción no se puede deshacer.',
            )
        ) {
            router.delete(route('documentos.destroy', id));
        }
    };

    const handleExport = () => {
        setExporting(true);
        const exportFilters: any = { export: true };
        if (searchTerm) exportFilters.search = searchTerm;
        if (tipoFilter !== 'all') exportFilters.tipo = tipoFilter;
        if (areaFilter !== 'all') exportFilters.area_id = areaFilter;
        if (ubicacionFilter !== 'all')
            exportFilters.ubicacion_id = ubicacionFilter;
        if (estadoFilter !== 'all') exportFilters.estado_id = estadoFilter;

        router.get(route('documentos.index'), exportFilters);
        setTimeout(() => setExporting(false), 2000);
    };

    const formatDate = (dateString?: string) => {
        if (!dateString) return '-';
        return new Date(dateString).toLocaleDateString('es-BO', {
            day: '2-digit',
            month: 'short',
            year: 'numeric',
        });
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Documentos" />

            <div className="container mx-auto space-y-4 p-4">
                {/* Header Compacto */}
                <div className="flex flex-col items-start justify-between gap-4 md:flex-row md:items-center">
                    <div>

                    </div>

                    <div className="flex w-full items-center gap-2 md:w-auto">
                        {/* Búsqueda */}
                        <div className="relative flex-1 md:w-64 md:flex-none">
                            <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 transform text-muted-foreground" />
                            <Input
                                placeholder="Buscar..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="h-9 pr-9 pl-9"
                            />
                            {searchTerm && (
                                <button
                                    onClick={() => setSearchTerm('')}
                                    className="absolute top-1/2 right-3 -translate-y-1/2 transform"
                                >
                                    <X className="h-4 w-4 text-muted-foreground" />
                                </button>
                            )}
                        </div>

                        {/* Filtros Button */}
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setShowFilters(!showFilters)}
                            className="h-9"
                        >
                            <Filter className="h-4 w-4" />
                            <span className="ml-2 hidden md:inline">
                                Filtros
                            </span>
                            {hasActiveFilters() && (
                                <span className="ml-1 h-2 w-2 rounded-full bg-primary" />
                            )}
                        </Button>

                        <Button asChild variant="outline" size="sm" className="h-9">
                            <Link
                                href={route('documentos.navegar', {
                                    tipo: filters.tipo,
                                    estado_id: filters.estado_id,
                                    search: filters.search,
                                })}
                            >
                                <Navigation className="h-4 w-4" />
                                <span className="ml-2 hidden md:inline">Navegar</span>
                            </Link>
                        </Button>

                        {/* Nuevo Button */}
                        {hasPermission('c_administracionDocumentacion') && (
                            <Button asChild size="sm" className="h-9">
                                <Link href={route('documentos.create')}>
                                    <Plus className="h-4 w-4" />
                                    <span className="ml-2 hidden md:inline">
                                        Nuevo
                                    </span>
                                </Link>
                            </Button>
                        )}
                    </div>
                </div>

                {/* Filtros Avanzados (Desplegable) */}
                {showFilters && (
                    <Card className="border">
                        <CardContent className="p-4">
                            <div className="mb-3 flex items-center justify-between">
                                <h3 className="font-medium">
                                    Filtros Avanzados
                                </h3>
                                <div className="flex items-center gap-2">
                                    {hasActiveFilters() && (
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={resetFilters}
                                            className="h-8 text-xs"
                                        >
                                            <RefreshCw className="mr-1 h-3 w-3" />
                                            Limpiar
                                        </Button>
                                    )}
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => setShowFilters(false)}
                                        className="h-8 w-8 p-0"
                                    >
                                        <X className="h-4 w-4" />
                                    </Button>
                                </div>
                            </div>
                            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
                                <div className="space-y-2">
                                    <label className="flex items-center gap-2 text-sm font-medium">
                                        <Tag className="h-3 w-3" />
                                        Tipo
                                    </label>
                                    <FilterSelect
                                        value={tipoFilter}
                                        onChange={setTipoFilter}
                                        placeholder="Todos"
                                        options={tiposDocumento}
                                        allLabel="Todos"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="flex items-center gap-2 text-sm font-medium">
                                        <Folder className="h-3 w-3" />
                                        Área
                                    </label>
                                    <FilterSelect
                                        value={areaFilter}
                                        onChange={setAreaFilter}
                                        placeholder="Todas"
                                        options={areas.map((a) => ({
                                            value: a.id.toString(),
                                            label: a.nombre,
                                        }))}
                                        allLabel="Todas"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="flex items-center gap-2 text-sm font-medium">
                                        <Folder className="h-3 w-3" />
                                        Ubicación
                                    </label>
                                    <FilterSelect
                                        value={ubicacionFilter}
                                        onChange={setUbicacionFilter}
                                        placeholder="Todas"
                                        options={ubicaciones.map((u) => ({
                                            value: u.id.toString(),
                                            label: u.nombre,
                                        }))}
                                        allLabel="Todas"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="flex items-center gap-2 text-sm font-medium">
                                        <CheckCircle className="h-3 w-3" />
                                        Estado
                                    </label>
                                    <FilterSelect
                                        value={estadoFilter}
                                        onChange={setEstadoFilter}
                                        placeholder="Todos"
                                        options={estados.map((e) => ({
                                            value: e.id.toString(),
                                            label: e.nombre,
                                        }))}
                                        allLabel="Todos"
                                    />
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                )}

                {/* Tabla de Documentos */}

                <div className="overflow-x-auto">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                {[
                                    'Código',
                                    'Documento',
                                    'Tipo',
                                    'Versión',
                                    'Área/Ubicación',
                                    'Estado',
                                    'Creado',
                                    '',
                                ].map((col, idx) => (
                                    <TableHead key={idx} className="h-10">
                                        {col}
                                    </TableHead>
                                ))}
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {documentos.data.length === 0 ? (
                                <TableRow>
                                    <TableCell
                                        colSpan={8}
                                        className="py-8 text-center"
                                    >
                                        <div className="flex flex-col items-center justify-center">
                                            <FileText className="mb-3 h-12 w-12 text-muted-foreground/50" />
                                            <p className="mb-1 text-lg font-medium text-foreground">
                                                No se encontraron documentos
                                            </p>
                                            <p className="text-sm text-muted-foreground">
                                                {hasActiveFilters()
                                                    ? 'Intenta ajustar los filtros para ver más resultados'
                                                    : 'No hay documentos registrados en el sistema'}
                                            </p>
                                            {!hasActiveFilters() && (
                                                <Button
                                                    asChild
                                                    className="mt-4"
                                                >
                                                    <Link
                                                        href={route(
                                                            'documentos.create',
                                                        )}
                                                    >
                                                        <Plus className="mr-2 h-4 w-4" />
                                                        Crear primer documento
                                                    </Link>
                                                </Button>
                                            )}
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ) : (
                                documentos.data.map((documento) => (
                                    <TableRow
                                        key={documento.id}
                                        className="hover:bg-muted/50"
                                    >
                                        <TableCell>
                                            <div className="font-mono text-sm font-semibold text-foreground">
                                                {documento.codigo}
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <div className="max-w-xs">
                                                <p className="line-clamp-1 font-medium text-foreground">
                                                    {documento.titulo}
                                                </p>
                                                <p className="mt-1 line-clamp-2 text-xs text-muted-foreground">
                                                    {documento.descripcion}
                                                </p>
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <Badge
                                                variant="outline"
                                                className={`${getTipoColor(documento.tipo)} px-2 py-1 text-xs`}
                                            >
                                                {documento.tipo}
                                            </Badge>
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex items-center gap-2">
                                                <span className="font-mono text-sm font-semibold text-foreground">
                                                    v
                                                    {documento.version_vigente
                                                        ?.numero_version ||
                                                        '0.0'}
                                                </span>
                                                {documento.version_vigente
                                                    ?.estado && (
                                                        <span className="text-xs text-muted-foreground">
                                                            (
                                                            {
                                                                documento
                                                                    .version_vigente
                                                                    .estado.nombre
                                                            }
                                                            )
                                                        </span>
                                                    )}
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <div className="space-y-1">
                                                <div className="flex items-center gap-1 text-sm">
                                                    <Folder className="h-3 w-3 text-muted-foreground" />
                                                    <span className="text-foreground">
                                                        {documento.area?.nombre}
                                                    </span>
                                                </div>
                                                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                                                    <Hash className="h-3 w-3" />
                                                    <span>
                                                        {documento.ubicacion
                                                            ?.nombre ||
                                                            'Sin ubicación'}
                                                    </span>
                                                </div>
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            {getEstadoBadge(documento.estado)}
                                        </TableCell>
                                        <TableCell>
                                            <div className="space-y-1">
                                                <div className="flex items-center gap-1 text-sm">
                                                    <Calendar className="h-3 w-3 text-muted-foreground" />
                                                    <span>
                                                        {formatDate(
                                                            documento.created_at,
                                                        )}
                                                    </span>
                                                </div>
                                                {documento.creador && (
                                                    <div className="flex items-center gap-1 text-xs text-muted-foreground">
                                                        <User className="h-3 w-3" />
                                                        <span>
                                                            {
                                                                documento
                                                                    .creador
                                                                    .name
                                                            }
                                                        </span>
                                                    </div>
                                                )}
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <DropdownMenu>
                                                <DropdownMenuTrigger asChild>
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        className="h-8 w-8 p-0"
                                                    >
                                                        <MoreHorizontal className="h-4 w-4" />
                                                        <span className="sr-only">
                                                            Abrir menú
                                                        </span>
                                                    </Button>
                                                </DropdownMenuTrigger>
                                                <DropdownMenuContent
                                                    align="end"
                                                    className="w-48"
                                                >
                                                    {hasPermission(
                                                        'u_administracionDocumentacion',
                                                    ) && (
                                                            <DropdownMenuItem
                                                                asChild
                                                            >
                                                                <Link
                                                                    href={route(
                                                                        'documentos.edit',
                                                                        documento.id,
                                                                    )}
                                                                >
                                                                    <Edit className="mr-2 h-4 w-4" />
                                                                    <span>
                                                                        Editar
                                                                    </span>
                                                                </Link>
                                                            </DropdownMenuItem>
                                                        )}
                                                    <DropdownMenuItem asChild>
                                                        <Link
                                                            href={`${route('documentos.show', documento.id)}#versiones`}
                                                        >
                                                            <Layers className="mr-2 h-4 w-4" />
                                                            <span>
                                                                Ver versiones
                                                            </span>
                                                        </Link>
                                                    </DropdownMenuItem>
                                                    <DropdownMenuSeparator />
                                                    {hasPermission(
                                                        'd_administracionDocumentacion',
                                                    ) && (
                                                            <DropdownMenuItem
                                                                onClick={() =>
                                                                    handleDelete(
                                                                        documento.id,
                                                                    )
                                                                }
                                                                className="text-destructive focus:text-destructive"
                                                            >
                                                                <Trash2 className="mr-2 h-4 w-4" />
                                                                <span>
                                                                    Eliminar
                                                                </span>
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
                {documentos.data.length > 0 && (
                    <div className="border-t border-border px-4 py-3">
                        <TablePagination
                            pagination={documentos}
                            onPageChange={(page) =>
                                router.get(
                                    route('documentos.index'),
                                    { ...filters, page },
                                    { preserveState: true, replace: true },
                                )
                            }
                        />
                    </div>
                )}
            </div>
        </AppLayout>
    );
}
