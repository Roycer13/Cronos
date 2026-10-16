import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import FilterSelect from '@/components/ui/filter-select';
import { Input } from '@/components/ui/input';
import AppLayout from '@/layouts/app-layout';
import { Head, Link, router, usePage } from '@inertiajs/react';
import {
    ArrowLeft,
    ArrowRight,
    Calendar,
    CheckCircle,
    FileText,
    Folder,
    Layers,
    Navigation,
    Search,
    User,
    X,
} from 'lucide-react';
import { useState } from 'react';
import { route } from 'ziggy-js';

interface Documento {
    id: number;
    codigo: string;
    titulo: string;
    descripcion?: string;
    tipo: string;
    area?: { id: number; nombre: string };
    ubicacion?: { id: number; nombre: string };
    estado?: { id: number; nombre: string; color: string };
    version_vigente?: { numero_version: string };
    creador?: { name: string };
    created_at: string;
}

interface Filters {
    tipo?: string;
    estado_id?: string;
    search?: string;
}

interface PageProps {
    [key: string]: unknown;
    documentos: Documento[];
    documentoSeleccionado?: Documento;
    indiceSeleccionado: number | false;
    filters: Filters;
    tipos: string[];
    estados: Array<{ id: number; nombre: string; color: string }>;
}

const breadcrumbs = [
    { title: 'Inicio', href: route('dashboard') },
    { title: 'Documentos', href: route('documentos.index') },
    { title: 'Navegador', href: '' },
];

export default function DocumentoNavegador() {
    const {
        documentos,
        documentoSeleccionado,
        indiceSeleccionado,
        filters,
        tipos,
        estados,
    } = usePage<PageProps>().props;
    const [search, setSearch] = useState(filters.search || '');
    const [tipo, setTipo] = useState(filters.tipo || 'all');
    const [estado, setEstado] = useState(filters.estado_id || 'all');

    const filterParams = () => ({
        ...(search ? { search } : {}),
        ...(tipo !== 'all' ? { tipo } : {}),
        ...(estado !== 'all' ? { estado_id: estado } : {}),
    });

    const applyFilters = () => {
        router.get(route('documentos.navegar'), filterParams(), {
            preserveState: true,
            replace: true,
        });
    };

    const selectDocument = (id: number) => {
        router.get(route('documentos.navegar', { documento: id, ...filterParams() }), undefined, {
            preserveState: true,
            replace: true,
        });
    };

    const formatDate = (date?: string) =>
        date
            ? new Date(date).toLocaleDateString('es-BO', {
                  day: '2-digit',
                  month: 'short',
                  year: 'numeric',
              })
            : '-';

    const previous = typeof indiceSeleccionado === 'number' && indiceSeleccionado > 0 ? documentos[indiceSeleccionado - 1] : null;
    const next = typeof indiceSeleccionado === 'number' && indiceSeleccionado < documentos.length - 1 ? documentos[indiceSeleccionado + 1] : null;
    const documentosPorTipo = tipos.map((tipo) => ({
        tipo,
        documentos: documentos.filter((documento) => documento.tipo === tipo),
    }));

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Navegar documentos" />
            <div className="container mx-auto space-y-4 p-4">
                <div className="flex flex-col justify-between gap-3 md:flex-row md:items-center">
                    <div>
                        <div className="flex items-center gap-2">
                            <Navigation className="h-5 w-5 text-primary" />
                            <h1 className="text-xl font-semibold">Navegador de documentos</h1>
                        </div>
                        <p className="mt-1 text-sm text-muted-foreground">
                            {documentos.length} documento{documentos.length === 1 ? '' : 's'} en el orden seleccionado
                        </p>
                    </div>
                    <Button asChild variant="outline" size="sm">
                        <Link href={route('documentos.index')}>
                            <FileText className="mr-2 h-4 w-4" />
                            Volver al listado
                        </Link>
                    </Button>
                </div>

                <Card>
                    <CardContent className="grid gap-3 p-4 md:grid-cols-2 lg:grid-cols-5">
                        <div className="relative lg:col-span-1">
                            <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                            <Input
                                value={search}
                                onChange={(event) => setSearch(event.target.value)}
                                onKeyDown={(event) => event.key === 'Enter' && applyFilters()}
                                placeholder="Buscar código o título"
                                className="pl-9 pr-8"
                            />
                            {search && (
                                <button onClick={() => setSearch('')} className="absolute top-1/2 right-3 -translate-y-1/2">
                                    <X className="h-4 w-4 text-muted-foreground" />
                                </button>
                            )}
                        </div>
                        <FilterSelect value={tipo} onChange={setTipo} placeholder="Tipo" options={tipos.map((item) => ({ value: item, label: item }))} allLabel="Todos los tipos" />
                        <FilterSelect value={estado} onChange={setEstado} placeholder="Estado" options={estados.map((item) => ({ value: String(item.id), label: item.nombre }))} allLabel="Todos los estados" />
                        <Button onClick={applyFilters} aria-label="Aplicar filtros">
                            <Search className="h-4 w-4" />
                        </Button>
                    </CardContent>
                </Card>

                {documentos.length === 0 ? (
                    <Card>
                        <CardContent className="flex flex-col items-center gap-3 py-16 text-center">
                            <FileText className="h-12 w-12 text-muted-foreground/50" />
                            <h2 className="text-lg font-semibold">No hay documentos para navegar</h2>
                            <p className="text-sm text-muted-foreground">Prueba con otros filtros.</p>
                        </CardContent>
                    </Card>
                ) : !documentoSeleccionado ? (
                    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                        {documentosPorTipo.filter(({ documentos: documentosDelTipo }) => documentosDelTipo.length > 0).map(({ tipo, documentos: documentosDelTipo }) => (
                            <Card key={tipo} className="transition-shadow hover:shadow-md">
                                <CardHeader className="pb-3">
                                    <CardTitle className="flex items-center justify-between gap-3 text-base">
                                        <span className="truncate">{tipo}</span>
                                        <Badge variant="secondary">{documentosDelTipo.length}</Badge>
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-2">
                                    {documentosDelTipo.slice(0, 5).map((documento) => (
                                        <button key={documento.id} onClick={() => selectDocument(documento.id)} className="w-full truncate rounded-md border px-3 py-2 text-left text-sm hover:bg-muted">
                                            <span className="font-mono text-xs text-muted-foreground">{documento.codigo}</span>
                                            <span className="ml-2">{documento.titulo}</span>
                                        </button>
                                    ))}
                                    {documentosDelTipo.length > 5 && <p className="text-xs text-muted-foreground">Y {documentosDelTipo.length - 5} más...</p>}
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                ) : (
                <div className="grid gap-4 lg:grid-cols-[280px_1fr]">
                    <Card className="h-fit">
                        <CardHeader className="pb-3">
                            <CardTitle className="text-sm">Orden: tipo y código</CardTitle>
                        </CardHeader>
                        <CardContent className="max-h-[560px] space-y-1 overflow-y-auto px-3">
                            {documentos.map((documento, index) => (
                                <button
                                    key={documento.id}
                                    onClick={() => selectDocument(documento.id)}
                                    className={`w-full rounded-md border px-3 py-2 text-left transition-colors ${
                                        documento.id === documentoSeleccionado.id
                                            ? 'border-primary bg-primary/10'
                                            : 'border-transparent hover:bg-muted'
                                    }`}
                                >
                                    <div className="flex items-center justify-between gap-2">
                                        <span className="font-mono text-xs text-muted-foreground">{String(index + 1).padStart(2, '0')}</span>
                                        <span className="truncate text-xs font-semibold">{documento.codigo}</span>
                                    </div>
                                    <p className="mt-1 line-clamp-2 text-sm font-medium">{documento.titulo}</p>
                                    <p className="mt-1 text-xs text-muted-foreground">{documento.tipo}</p>
                                </button>
                            ))}
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="border-b">
                            <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-start">
                                <div>
                                    <p className="font-mono text-sm text-muted-foreground">{documentoSeleccionado.codigo}</p>
                                    <CardTitle className="mt-1 text-2xl">{documentoSeleccionado.titulo}</CardTitle>
                                </div>
                                <Badge variant="outline">{documentoSeleccionado.tipo}</Badge>
                            </div>
                        </CardHeader>
                        <CardContent className="space-y-6 p-6">
                            <p className="text-sm leading-6 text-muted-foreground">
                                {documentoSeleccionado.descripcion || 'Este documento no tiene descripción registrada.'}
                            </p>
                            <div className="grid gap-4 sm:grid-cols-2">
                                <div className="flex items-center gap-2 text-sm"><Folder className="h-4 w-4 text-muted-foreground" />{documentoSeleccionado.area?.nombre || 'Sin área'}</div>
                                <div className="flex items-center gap-2 text-sm"><CheckCircle className="h-4 w-4 text-muted-foreground" />{documentoSeleccionado.estado?.nombre || 'Sin estado'}</div>
                                <div className="flex items-center gap-2 text-sm"><Layers className="h-4 w-4 text-muted-foreground" />Versión {documentoSeleccionado.version_vigente?.numero_version || '0.0'}</div>
                                <div className="flex items-center gap-2 text-sm"><Calendar className="h-4 w-4 text-muted-foreground" />{formatDate(documentoSeleccionado.created_at)}</div>
                                <div className="flex items-center gap-2 text-sm"><User className="h-4 w-4 text-muted-foreground" />{documentoSeleccionado.creador?.name || 'Sin creador'}</div>
                            </div>
                            <div className="flex flex-col justify-between gap-3 border-t pt-4 sm:flex-row sm:items-center">
                                <Button asChild variant="outline" disabled={!previous}>
                                    <Link href={previous ? route('documentos.navegar', { documento: previous.id, ...filterParams() }) : '#'}>
                                        <ArrowLeft className="mr-2 h-4 w-4" />Anterior
                                    </Link>
                                </Button>
                                <span className="text-center text-sm text-muted-foreground">{(indiceSeleccionado as number) + 1} de {documentos.length}</span>
                                <div className="flex gap-2">
                                    <Button asChild variant="secondary">
                                        <Link href={`${route('documentos.show', documentoSeleccionado.id)}#versiones`} target="_blank" rel="noreferrer">
                                            <Layers className="mr-2 h-4 w-4" />Ver versiones
                                        </Link>
                                    </Button>
                                    <Button asChild disabled={!next}>
                                        <Link href={next ? route('documentos.navegar', { documento: next.id, ...filterParams() }) : '#'}>
                                            Siguiente<ArrowRight className="ml-2 h-4 w-4" />
                                        </Link>
                                    </Button>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>
                )}
            </div>
        </AppLayout>
    );
}
