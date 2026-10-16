import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import FormSelect from '@/components/ui/form-select';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, Link, useForm } from '@inertiajs/react';
import { ArrowLeft, Save } from 'lucide-react';
import { route } from 'ziggy-js';
import { useState, useEffect } from 'react';

interface PageProps {
    documentos: any[];
    ubicaciones: any[];
    areas: any[];
    estados: any[];
    usuarios: any[];
    flash: {
        success?: string;
        error?: string;
    };
}

interface FormData {
    tipo_solicitud: string;
    justificacion: string;
    alcance: string;
    codigo: string;
    titulo: string;
    descripcion: string;
    tipo: string;
    area_id: string;
    ubicacion_id: string;
    creador_asignado: string;
    documento_padre_id: string;
    documento_id: string;
}

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Gestión Documental', href: route('documentos.index') },
    { title: 'Solicitudes', href: route('solicitudDocumentacion.index') },
    { title: 'Nueva Solicitud', href: '#' },
];

export default function Create({
    documentos,
    ubicaciones,
    areas,
    usuarios,
    flash
}: PageProps) {
    
    const [solicitudType, setSolicitudType] = useState<string>('Creacion');
    
    const { data, setData, post, processing, errors } = useForm<FormData>({
        tipo_solicitud: 'Creacion',
        justificacion: '',
        alcance: '',
        codigo: '',
        titulo: '',
        descripcion: '',
        tipo: '',
        area_id: '',
        ubicacion_id: '',
        creador_asignado: '',
        documento_padre_id: '',
        documento_id: '',
    });

    useEffect(() => {
        setSolicitudType(data.tipo_solicitud);
    }, [data.tipo_solicitud]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        post(route('solicitudDocumentacion.store'));
    };

    // 🎯 OPCIONES PARA FORM SELECT
    const tipoSolicitudOptions = [
        { value: 'Creacion', label: 'Creación de Documento' },
        { value: 'Modificacion', label: 'Modificación de Documento' },
    ];

    const tipoDocumentoOptions = [
        { value: 'Programa', label: 'Programa' },
        { value: 'Procedimiento', label: 'Procedimiento' },
        { value: 'Instructivo', label: 'Instructivo' },
        { value: 'Manual', label: 'Manual' },
        { value: 'Ficha Tecnica', label: 'Ficha Técnica' },
        { value: 'Lay Out', label: 'Lay Out' },
        { value: 'Plan de Muestreo', label: 'Plan de Muestreo' },
        { value: 'Cronograma', label: 'Cronograma' },
        { value: 'Tabla', label: 'Tabla' },
        { value: 'Poes', label: 'Poes' },
        { value: 'Registro', label: 'Registro' },
    ];

    // 🎯 VERSIÓN SEGURA PARA FILTRAR DOCUMENTOS
    // Opción 1: Si el estado está como objeto anidado
    const documentosAprobados = documentos.filter(doc => {
        if (!doc) return false;
        
        // Verifica diferentes estructuras posibles
        if (doc.estado && typeof doc.estado === 'object') {
            return doc.estado.nombre?.toLowerCase() === 'aprobado' || 
                   doc.estado.nombre?.toLowerCase() === 'aprobado' ||
                   doc.estado.nombre?.toLowerCase() === 'approved';
        }
        
        // Si el estado es un string directamente
        if (typeof doc.estado === 'string') {
            return doc.estado.toLowerCase().includes('aprobado');
        }
        
        return false;
    });


    // 🎯 VERSIÓN ALTERNATIVA: Mostrar TODOS los documentos (sin filtrar)
    // Si necesitas mostrar todos los documentos mientras solucionas el filtro
    const documentosParaModificacion = documentosAprobados.length > 0 
        ? documentosAprobados 
        : documentos; // Fallback a todos los documentos

    const areaOptions = areas.map(area => ({
        value: area.id.toString(),
        label: area.nombre,
    }));

    const ubicacionOptions = ubicaciones.map(ubicacion => ({
        value: ubicacion.id.toString(),
        label: ubicacion.nombre,
    }));

    const usuarioOptions = usuarios.map(usuario => ({
        value: usuario.id.toString(),
        label: usuario.name,
    }));

    // 🎯 OPCIONES PARA DOCUMENTOS (MODIFICACIÓN)
    const documentoModificacionOptions = documentosParaModificacion.map(documento => ({
        value: documento.id.toString(),
        label: `${documento.codigo || 'SIN-CÓDIGO'} - ${documento.titulo || 'Sin título'}`,
    }));

    // 🎯 OPCIONES PARA DOCUMENTO PADRE (CREACIÓN - solo aprobados o todos)
    const documentoPadreOptions = documentosAprobados.length > 0
        ? documentosAprobados.map(doc => ({
            value: doc.id.toString(),
            label: `${doc.codigo || 'SIN-CÓDIGO'} - ${doc.titulo || 'Sin título'}`,
        }))
        : documentos.map(doc => ({
            value: doc.id.toString(),
            label: `${doc.codigo || 'SIN-CÓDIGO'} - ${doc.titulo || 'Sin título'}`,
        }));

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Nueva Solicitud de Documentación" />

            <div className="p-2">
                {/* Formulario */}
                <div className="bg-background rounded-lg border border-border shadow-sm overflow-hidden">
                    <form onSubmit={handleSubmit} className="p-6 space-y-8">
                        {/* Sección 1: Tipo de Solicitud */}
                        <div className="space-y-6">
                            <h2 className="text-lg font-semibold text-foreground border-b pb-2">
                                Tipo de Solicitud
                            </h2>
                            
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <FormSelect
                                    label="Tipo de Solicitud *"
                                    value={data.tipo_solicitud}
                                    onChange={(value: string) => setData('tipo_solicitud', value)}
                                    placeholder="Seleccionar tipo de solicitud..."
                                    options={tipoSolicitudOptions}
                                    error={errors.tipo_solicitud}
                                    clearable={false}
                                    searchable={false}
                                />
                            </div>
                        </div>

                        {/* Sección 2: Justificación y Alcance */}
                        <div className="space-y-6">
                            <h2 className="text-lg font-semibold text-foreground border-b pb-2">
                                Información de la Solicitud
                            </h2>
                            
                            <div className="space-y-4">
                                <div>
                                    <Label htmlFor="justificacion">
                                        Justificación <span className="text-destructive">*</span>
                                    </Label>
                                    <Textarea
                                        id="justificacion"
                                        name="justificacion"
                                        rows={4}
                                        value={data.justificacion}
                                        onChange={(e) => setData('justificacion', e.target.value)}
                                        placeholder="Describa la razón de la solicitud..."
                                        className={errors.justificacion ? 'border-destructive' : ''}
                                        required
                                    />
                                    {errors.justificacion && (
                                        <p className="text-sm text-destructive">{errors.justificacion}</p>
                                    )}
                                </div>

                                <div>
                                    <Label htmlFor="alcance">Alcance (Opcional)</Label>
                                    <Textarea
                                        id="alcance"
                                        name="alcance"
                                        rows={3}
                                        value={data.alcance}
                                        onChange={(e) => setData('alcance', e.target.value)}
                                        placeholder="Describa el alcance de la solicitud..."
                                        className={errors.alcance ? 'border-destructive' : ''}
                                    />
                                    {errors.alcance && (
                                        <p className="text-sm text-destructive">{errors.alcance}</p>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Condicional: Documento a Modificar */}
                        {solicitudType === 'Modificacion' && (
                            <div className="space-y-6">
                                <h2 className="text-lg font-semibold text-foreground border-b pb-2">
                                    Documento a Modificar
                                </h2>
                                
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <FormSelect
                                        label="Documento *"
                                        value={data.documento_id}
                                        onChange={(value: string) => setData('documento_id', value)}
                                        placeholder="Seleccionar documento a modificar..."
                                        options={documentoModificacionOptions}
                                        error={errors.documento_id}
                                        clearable={true}
                                        searchable={true}
                                    />
                                </div>
                                {documentoModificacionOptions.length === 0 && (
                                    <div className="text-amber-600 bg-amber-50 border border-amber-200 p-3 rounded-md">
                                        <p className="text-sm">No se encontraron documentos disponibles para modificar.</p>
                                        <p className="text-xs mt-1">Contacte al administrador si necesita crear uno nuevo.</p>
                                    </div>
                                )}
                            </div>
                        )}

                        {/* Condicional: Datos del Nuevo Documento */}
                        {solicitudType === 'Creacion' && (
                            <>
                                {/* Sección 3: Información del Documento */}
                                <div className="space-y-6">
                                    <h2 className="text-lg font-semibold text-foreground border-b pb-2">
                                        Información del Documento
                                    </h2>
                                    
                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                        <div className="space-y-2">
                                            <Label htmlFor="codigo">
                                                Código <span className="text-destructive">*</span>
                                            </Label>
                                            <Input
                                                id="codigo"
                                                name="codigo"
                                                value={data.codigo}
                                                onChange={(e) => setData('codigo', e.target.value)}
                                                placeholder="DOC-001"
                                                required
                                                className={errors.codigo ? 'border-destructive' : ''}
                                            />
                                            {errors.codigo && (
                                                <p className="text-sm text-destructive">{errors.codigo}</p>
                                            )}
                                        </div>

                                        <div className="space-y-2">
                                            <Label htmlFor="titulo">
                                                Título <span className="text-destructive">*</span>
                                            </Label>
                                            <Input
                                                id="titulo"
                                                name="titulo"
                                                value={data.titulo}
                                                onChange={(e) => setData('titulo', e.target.value)}
                                                placeholder="Título del documento"
                                                required
                                                className={errors.titulo ? 'border-destructive' : ''}
                                            />
                                            {errors.titulo && (
                                                <p className="text-sm text-destructive">{errors.titulo}</p>
                                            )}
                                        </div>

                                        <FormSelect
                                            label="Tipo de Documento *"
                                            value={data.tipo}
                                            onChange={(value: string) => setData('tipo', value)}
                                            placeholder="Seleccionar tipo..."
                                            options={tipoDocumentoOptions}
                                            error={errors.tipo}
                                            clearable={true}
                                            searchable={true}
                                        />

                                        <FormSelect
                                            label="Área"
                                            value={data.area_id}
                                            onChange={(value: string) => setData('area_id', value)}
                                            placeholder="Seleccionar área..."
                                            options={areaOptions}
                                            error={errors.area_id}
                                            clearable={true}
                                            searchable={true}
                                        />

                                        <FormSelect
                                            label="Ubicación"
                                            value={data.ubicacion_id}
                                            onChange={(value: string) => setData('ubicacion_id', value)}
                                            placeholder="Seleccionar ubicación..."
                                            options={ubicacionOptions}
                                            error={errors.ubicacion_id}
                                            clearable={true}
                                            searchable={true}
                                        />

                                        <FormSelect
                                            label="Creador Asignado"
                                            value={data.creador_asignado}
                                            onChange={(value: string) => setData('creador_asignado', value)}
                                            placeholder="Seleccionar creador..."
                                            options={usuarioOptions}
                                            error={errors.creador_asignado}
                                            clearable={true}
                                            searchable={true}
                                        />

                                        <FormSelect
                                            label="Documento Padre (Opcional)"
                                            value={data.documento_padre_id}
                                            onChange={(value: string) => setData('documento_padre_id', value)}
                                            placeholder="Seleccionar documento padre..."
                                            options={documentoPadreOptions}
                                            error={errors.documento_padre_id}
                                            clearable={true}
                                            searchable={true}
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="descripcion">Descripción</Label>
                                        <Textarea
                                            id="descripcion"
                                            name="descripcion"
                                            rows={4}
                                            value={data.descripcion}
                                            onChange={(e) => setData('descripcion', e.target.value)}
                                            placeholder="Descripción detallada del documento..."
                                            className={errors.descripcion ? 'border-destructive' : ''}
                                        />
                                        {errors.descripcion && (
                                            <p className="text-sm text-destructive">{errors.descripcion}</p>
                                        )}
                                    </div>
                                </div>
                            </>
                        )}

                        {/* Botones de acción */}
                        <div className="flex justify-end gap-3 pt-6 border-t border-border">
                            <Link href={route('solicitudDocumentacion.index')}>
                                <Button variant="outline" type="button">
                                    Cancelar
                                </Button>
                            </Link>
                            <Button 
                                type="submit" 
                                disabled={processing || (solicitudType === 'Modificacion' && documentoModificacionOptions.length === 0)}
                            >
                                <Save className="h-4 w-4 mr-2" />
                                {processing ? 'Enviando...' : 'Enviar Solicitud'}
                            </Button>
                        </div>
                    </form>
                </div>
            </div>
        </AppLayout>
    );
}