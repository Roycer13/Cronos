import { useState, useEffect } from 'react';
import { Head, Link, useForm, usePage } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import FormSelect from '@/components/ui/form-select';
import {
    ArrowLeft,
    FileText,
    Upload,
    AlertCircle,
    Copy,
    FileUp,
    Shield,
    AlertTriangle
} from 'lucide-react';
import AppLayout from '@/layouts/app-layout';
import { route } from 'ziggy-js';

interface Estado {
    id: number;
    nombre: string;
    color?: string;
}

interface Documento {
    id: number;
    codigo: string;
    titulo: string;
    tipo: string;
    estado_id?: number;
    estado?: Estado;
    version_vigente?: {
        numero_version: string;
    };
}

interface VersionDocumento {
    id?: number;
    numero_version: string;
    cambios?: string;
}

interface Usuario {
    id: number;
    name: string;
    email: string;
}

interface PageProps {
    documento: Documento;
    ultimaVersion: VersionDocumento | null;
    usuarios: Usuario[];
    estadoDocumento: Estado;
    versionSugerida: string;
}

export default function VersionCreate() {
    const { props } = usePage<PageProps>();
    const { documento, ultimaVersion, usuarios, estadoDocumento, versionSugerida } = props;

    const { data, setData, post, processing, errors } = useForm({
        cambios: '',
        observaciones: '',
        archivo_pdf: null as File | null,
        archivo_word: null as File | null,
        revisado1_por: null as string | null,
        revisado2_por: null as string | null,
        aprobado_por: null as string | null,
    });

    const [pdfFile, setPdfFile] = useState<File | null>(null);
    const [wordFile, setWordFile] = useState<File | null>(null);

    const breadcrumbs = [
        { title: 'Documentos', href: route('documentos.index') },
        { title: documento.codigo, href: route('documentos.show', documento.id) },
        { title: 'Nueva Versión', href: '' },
    ];

    // Función para manejar cambios de archivos
    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, type: 'pdf' | 'word') => {
        const file = e.target.files?.[0] || null;
        if (file) {
            if (type === 'pdf') {
                setPdfFile(file);
                setData('archivo_pdf', file);
            } else {
                setWordFile(file);
                setData('archivo_word', file);
            }
        }
    };

    // Función para sugerir nueva versión
    const sugerirNuevaVersion = () => {
        return versionSugerida;
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        
        // Preparar datos para enviar
        const formData = new FormData();
        formData.append('cambios', data.cambios);
        
        if (data.observaciones) {
            formData.append('observaciones', data.observaciones);
        }
        
        // Solo agregar si no es null
        if (data.revisado1_por && data.revisado1_por !== 'null') {
            formData.append('revisado1_por', data.revisado1_por);
        }
        
        if (data.revisado2_por && data.revisado2_por !== 'null') {
            formData.append('revisado2_por', data.revisado2_por);
        }
        
        if (data.aprobado_por && data.aprobado_por !== 'null') {
            formData.append('aprobado_por', data.aprobado_por);
        }
        
        if (data.archivo_pdf) {
            formData.append('archivo_pdf', data.archivo_pdf);
        }
        
        if (data.archivo_word) {
            formData.append('archivo_word', data.archivo_word);
        }

        post(route('documentos.versiones.store', documento.id), {
            data: formData,
            forceFormData: true,
            preserveScroll: true,
        });
    };

    // Función para obtener el estado seguro
    const getEstadoDocumento = (): Estado => {
        if (estadoDocumento) {
            return estadoDocumento;
        }
        
        if (documento.estado) {
            return documento.estado;
        }
        
        return {
            id: documento.estado_id || 0,
            nombre: documento.estado_id ? `Estado ${documento.estado_id}` : 'No disponible',
            color: '#6b7280'
        };
    };

    const estado = getEstadoDocumento();

    // Preparar opciones para los select
    const opcionesUsuarios = [
        { value: 'null', label: 'Sin asignar' },
        ...usuarios.map(usuario => ({
            value: usuario.id.toString(),
            label: usuario.name
        }))
    ];

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Nueva Versión de Documento" />

            <div className="container mx-auto p-6 space-y-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <Link href={route('documentos.show', documento.id)}>
                            <Button variant="outline" size="sm">
                                <ArrowLeft className="h-4 w-4 mr-2" />
                                Volver
                            </Button>
                        </Link>
                        <div>
                            <div className="flex items-center gap-2 mb-1">
                                <Badge variant="outline" className="bg-blue-100 text-blue-800">
                                    {documento.tipo}
                                </Badge>
                                <Badge 
                                    variant="outline" 
                                    style={{ 
                                        backgroundColor: `${estado.color}20` || '#f3f4f6',
                                        color: estado.color || '#6b7280'
                                    }}
                                >
                                    {estado.nombre}
                                </Badge>
                            </div>
                            <h1 className="text-2xl font-bold">Nueva Versión</h1>
                            <p className="text-muted-foreground">
                                {documento.codigo} - {documento.titulo}
                            </p>
                        </div>
                    </div>

                    <div className="text-right">
                        <div className="text-sm text-muted-foreground">
                            {ultimaVersion ? (
                                <span>Versión actual: v{ultimaVersion.numero_version}</span>
                            ) : (
                                <span>Primera versión</span>
                            )}
                        </div>
                        <div className="text-lg font-semibold text-foreground">
                            Nueva versión: v{sugerirNuevaVersion()}
                        </div>
                    </div>
                </div>

                {/* Formulario */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Copy className="h-5 w-5" />
                            Información de la Nueva Versión
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleSubmit} className="space-y-6">
                            {/* Información de la versión actual */}
                            {ultimaVersion && (
                                <div className="p-4 bg-muted rounded-lg">
                                    <h3 className="font-medium mb-2 flex items-center gap-2">
                                        <AlertCircle className="h-4 w-4" />
                                        Información de la versión anterior
                                    </h3>
                                    <div className="grid grid-cols-2 gap-4 text-sm">
                                        <div>
                                            <span className="text-muted-foreground">Versión:</span>
                                            <span className="ml-2 font-mono font-medium">
                                                v{ultimaVersion.numero_version}
                                            </span>
                                        </div>
                                        <div>
                                            <span className="text-muted-foreground">Cambios:</span>
                                            <p className="mt-1 text-foreground">
                                                {ultimaVersion.cambios || 'No hay cambios registrados'}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Campo de cambios */}
                            <div className="space-y-2">
                                <Label htmlFor="cambios" className="flex items-center gap-2">
                                    <FileText className="h-4 w-4" />
                                    Cambios realizados *
                                </Label>
                                <Textarea
                                    id="cambios"
                                    value={data.cambios}
                                    onChange={(e) => setData('cambios', e.target.value)}
                                    placeholder="Describa los cambios realizados en esta versión..."
                                    rows={4}
                                    className="resize-none"
                                    required
                                />
                                {errors.cambios && (
                                    <p className="text-sm text-destructive">{errors.cambios}</p>
                                )}
                                <p className="text-xs text-muted-foreground">
                                    Describe claramente las modificaciones, adiciones o eliminaciones realizadas.
                                </p>
                            </div>

                            {/* Archivos */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {/* PDF */}
                                <div className="space-y-2">
                                    <Label htmlFor="archivo_pdf" className="flex items-center gap-2">
                                        <FileUp className="h-4 w-4" />
                                        Archivo PDF (opcional)
                                    </Label>    
                                    <div className="border-2 border-dashed border-muted rounded-lg p-4 text-center hover:border-primary transition-colors">
                                        <Input
                                            id="archivo_pdf"
                                            type="file"
                                            accept=".pdf"
                                            onChange={(e) => handleFileChange(e, 'pdf')}
                                            className="hidden"
                                        />
                                        <Label htmlFor="archivo_pdf" className="cursor-pointer block">
                                            <Upload className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
                                            <p className="text-sm font-medium">
                                                {pdfFile ? pdfFile.name : 'Haz clic para subir PDF'}
                                            </p>
                                            <p className="text-xs text-muted-foreground mt-1">
                                                Máximo 10MB
                                            </p>
                                        </Label>
                                    </div>
                                    {errors.archivo_pdf && (
                                        <p className="text-sm text-destructive">{errors.archivo_pdf}</p>
                                    )}
                                </div>

                                {/* Word */}
                                <div className="space-y-2">
                                    <Label htmlFor="archivo_word" className="flex items-center gap-2">
                                        <FileText className="h-4 w-4" />
                                        Archivo Word (opcional)
                                    </Label>
                                    <div className="border-2 border-dashed border-muted rounded-lg p-4 text-center hover:border-primary transition-colors">
                                        <Input
                                            id="archivo_word"
                                            type="file"
                                            accept=".doc,.docx"
                                            onChange={(e) => handleFileChange(e, 'word')}
                                            className="hidden"
                                        />
                                        <Label htmlFor="archivo_word" className="cursor-pointer block">
                                            <Upload className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
                                            <p className="text-sm font-medium">
                                                {wordFile ? wordFile.name : 'Haz clic para subir Word'}
                                            </p>
                                            <p className="text-xs text-muted-foreground mt-1">
                                                Máximo 10MB
                                            </p>
                                        </Label>
                                    </div>
                                    {errors.archivo_word && (
                                        <p className="text-sm text-destructive">{errors.archivo_word}</p>
                                    )}
                                </div>
                            </div>

                            {/* Responsables (opcional)
                            <div className="space-y-4">
                                <h3 className="font-medium flex items-center gap-2">
                                    <Shield className="h-4 w-4" />
                                    Responsables (opcional)
                                </h3>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                    <div className="space-y-2">
                                        <FormSelect
                                            label='Revisor 1'
                                            value={data.revisado1_por || 'null'}
                                            onChange={(value) => setData('revisado1_por', value === 'null' ? null : value)}
                                            placeholder="Seleccionar revisor"
                                            options={opcionesUsuarios}
                                            error={errors.revisado1_por}
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <FormSelect
                                            label='Revisor 2'
                                            value={data.revisado2_por || 'null'}
                                            onChange={(value) => setData('revisado2_por', value === 'null' ? null : value)}
                                            placeholder="Seleccionar revisor"
                                            options={opcionesUsuarios}
                                            error={errors.revisado2_por}
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <FormSelect
                                            label='Aprobador'
                                            value={data.aprobado_por || 'null'}
                                            onChange={(value) => setData('aprobado_por', value === 'null' ? null : value)}
                                            placeholder="Seleccionar aprobador"
                                            options={opcionesUsuarios}
                                            error={errors.aprobado_por}
                                        />
                                    </div>
                                </div>
                            </div>
 */}
                            {/* Observaciones */}
                            <div className="space-y-2">
                                <Label htmlFor="observaciones">Observaciones</Label>
                                <Textarea
                                    id="observaciones"
                                    value={data.observaciones}
                                    onChange={(e) => setData('observaciones', e.target.value)}
                                    placeholder="Observaciones adicionales sobre esta versión..."
                                    rows={3}
                                />
                                {errors.observaciones && (
                                    <p className="text-sm text-destructive">{errors.observaciones}</p>
                                )}
                            </div>

                            {/* Acciones */}
                            <div className="flex justify-end gap-4 pt-6 border-t">
                                <Button
                                    type="button"
                                    variant="outline"
                                    asChild
                                    disabled={processing}
                                >
                                    <Link href={route('documentos.show', documento.id)}>
                                        Cancelar
                                    </Link>
                                </Button>
                                <Button
                                    type="submit"
                                    disabled={processing}
                                    className="min-w-[120px]"
                                >
                                    {processing ? (
                                        <>
                                            <div className="h-4 w-4 border-2 border-current border-t-transparent rounded-full animate-spin mr-2" />
                                            Creando...
                                        </>
                                    ) : (
                                        'Crear Versión'
                                    )}
                                </Button>
                            </div>
                        </form>
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}