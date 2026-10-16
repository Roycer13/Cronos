import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import FormSelect from '@/components/ui/form-select'
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, Link, router, usePage } from '@inertiajs/react';
import { ArrowLeft, Save } from 'lucide-react';
import { route } from 'ziggy-js';
import { useState } from 'react';

interface PageProps {
  ubicaciones: any[];
  areas: any[];
  estados: any[];
  documentos: any[];
  usuarios: any[];
  flash: {
    success?: string;
    error?: string;
  };
}

const breadcrumbs: BreadcrumbItem[] = [
  { title: 'Gestión Documental', href: route('documentos.index') },
  { title: 'Documentos', href: route('documentos.index') },
  { title: 'Crear Documento', href: '#' },
];

export default function Create() {
  const { props } = usePage();
  const { ubicaciones, areas, estados, documentos, usuarios, flash } = props as unknown as PageProps;

  const [formData, setFormData] = useState({
    codigo: '',
    titulo: '',
    descripcion: '',
    tipo: '',
    area_id: '',
    ubicacion_id: '',
    estado_id: '',
    creador_asignado: '',
    revisor1_asignado: '',
    revisor2_asignado: '',
    aprobador_asignado: '',
    documento_padre_id: '',
    custodio: '',
    tipo_distribucion: '',
    ubicacion_fisica: '',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  // Función para manejar cambios en los inputs normales
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  // Función para manejar cambios en los FormSelect
  const handleSelectChange = (name: string, value: string) => {
    setFormData(prev => ({ ...prev, [name]: value }));
    
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    router.post(route('documentos.store'), formData, {
      onSuccess: () => {},
      onError: (err) => {
        setErrors(err as any);
      },
      preserveScroll: true,
    });
  };

  // Preparar opciones para los FormSelect
  const tipoDocumentoOptions = [
    { value: 'Programa', label: 'Programa' },
    { value: 'Procedimiento', label: 'Procedimiento' },
    { value: 'Instructivo', label: 'Instructivo' },
    { value: 'Manual', label: 'Manual' },
    { value: 'Ficha Tecnica', label: 'Ficha Tecnica' },
    { value: 'Lay Out', label: 'Lay Out' },
    { value: 'Plan de Muestreo', label: 'Plan de Muestreo' },
    { value: 'Cronograma', label: 'Cronograma' },
    { value: 'Tabla', label: 'Tabla' },
    { value: 'Poes', label: 'Poes' },
    { value: 'Registro', label: 'Registro' },
  ];

  const tipoDistribucionOptions = [
    { value: 'fisica', label: 'Física' },
    { value: 'digital', label: 'Digital' },
    { value: 'mixta', label: 'Mixta' },
  ];

  const areaOptions = areas.map(area => ({
    value: area.id.toString(),
    label: area.nombre,
  }));

  const ubicacionOptions = ubicaciones.map(ubicacion => ({
    value: ubicacion.id.toString(),
    label: ubicacion.nombre,
  }));

  const estadoOptions = estados.map(estado => ({
    value: estado.id.toString(),
    label: estado.nombre,
  }));

  const usuarioOptions = usuarios.map(usuario => ({
    value: usuario.id.toString(),
    label: usuario.name, // Ajusta según tu modelo de usuario
  }));

  const documentoOptions = documentos.map(documento => ({
    value: documento.id.toString(),
    label: `${documento.codigo} - ${documento.titulo}`,
  }));

  return (
    <AppLayout breadcrumbs={breadcrumbs}>
      <Head title="Crear Documento" />
      
      <div className="px-2 sm:px-6 py-2 space-y-2">
        {/* Mensajes Flash */}
        {flash.success && (
          <div className="bg-green-50 border border-green-200 text-green-800 px-4 py-3 rounded-md">
            {flash.success}
          </div>
        )}
        
        {flash.error && (
          <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-md">
            {flash.error}
          </div>
        )}

        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Link href={route('documentos.index')}>
              <Button variant="outline" size="sm">
                <ArrowLeft className="h-4 w-4" />
              </Button>
            </Link>
            <h1 className="text-2xl font-bold text-foreground">Crear Nuevo Documento</h1>
          </div>
        </div>

        {/* Formulario */}
        <div className="bg-background rounded-lg border border-border shadow-sm overflow-hidden">
          <form onSubmit={handleSubmit} className="p-6 space-y-8">
            {/* Sección 1: Información básica */}
            <div className="space-y-6">
              <h2 className="text-lg font-semibold text-foreground border-b pb-2">
                Información Básica
              </h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {/* Código */}
                <div className="space-y-2">
                  <Label htmlFor="codigo">
                    Código <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="codigo"
                    name="codigo"
                    value={formData.codigo}
                    onChange={handleInputChange}
                    placeholder="DOC-001"
                    required
                    className={errors.codigo ? 'border-destructive' : ''}
                  />
                  {errors.codigo && (
                    <p className="text-sm text-destructive">{errors.codigo}</p>
                  )}
                  <p className="text-xs text-muted-foreground">Código único del documento</p>
                </div>

                {/* Título */}
                <div className="space-y-2">
                  <Label htmlFor="titulo">
                    Título <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="titulo"
                    name="titulo"
                    value={formData.titulo}
                    onChange={handleInputChange}
                    placeholder="Título del documento"
                    required
                    className={errors.titulo ? 'border-destructive' : ''}
                  />
                  {errors.titulo && (
                    <p className="text-sm text-destructive">{errors.titulo}</p>
                  )}
                </div>

                {/* Tipo de Documento */}
                <FormSelect
                  label="Tipo de Documento *"
                  value={formData.tipo}
                  onChange={(v: string) => handleSelectChange('tipo', v)}
                  placeholder="Seleccionar tipo..."
                  options={tipoDocumentoOptions}
                  error={errors.tipo}
                />

                {/* Área */}
                <FormSelect
                  label="Área"
                  value={formData.area_id}
                  onChange={(v: string) => handleSelectChange('area_id', v)}
                  placeholder="Seleccionar área..."
                  options={areaOptions}
                  error={errors.area_id}
                />

                {/* Ubicación */}
                <FormSelect
                  label="Ubicación"
                  value={formData.ubicacion_id}
                  onChange={(v: string) => handleSelectChange('ubicacion_id', v)}
                  placeholder="Seleccionar ubicación..."
                  options={ubicacionOptions}
                  error={errors.ubicacion_id}
                />

                {/* Estado */}
                <FormSelect
                  label="Estado"
                  value={formData.estado_id}
                  onChange={(v: string) => handleSelectChange('estado_id', v)}
                  placeholder="Seleccionar estado..."
                  options={estadoOptions}
                  error={errors.estado_id}
                />
              </div>

              {/* Descripción */}
              <div className="space-y-2">
                <Label htmlFor="descripcion">Descripción</Label>
                <Textarea
                  id="descripcion"
                  name="descripcion"
                  rows={4}
                  value={formData.descripcion}
                  onChange={handleInputChange}
                  placeholder="Descripción detallada del documento..."
                  className={errors.descripcion ? 'border-destructive' : ''}
                />
                {errors.descripcion && (
                  <p className="text-sm text-destructive">{errors.descripcion}</p>
                )}
              </div>
            </div>

            {/* Sección 2: Asignaciones */}
            <div className="space-y-6">
              <h2 className="text-lg font-semibold text-foreground border-b pb-2">
                Asignaciones
              </h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {/* Creador asignado */}
                <FormSelect
                  label="Creador Asignado"
                  value={formData.creador_asignado}
                  onChange={(v: string) => handleSelectChange('creador_asignado', v)}
                  placeholder="Seleccionar creador..."
                  options={usuarioOptions}
                  error={errors.creador_asignado}
                />

                {/* Revisor 1 */}
                <FormSelect
                  label="Revisor 1"
                  value={formData.revisor1_asignado}
                  onChange={(v: string) => handleSelectChange('revisor1_asignado', v)}
                  placeholder="Seleccionar revisor 1..."
                  options={usuarioOptions}
                  error={errors.revisor1_asignado}
                />

                {/* Revisor 2 */}
                <FormSelect
                  label="Revisor 2"
                  value={formData.revisor2_asignado}
                  onChange={(v: string) => handleSelectChange('revisor2_asignado', v)}
                  placeholder="Seleccionar revisor 2..."
                  options={usuarioOptions}
                  error={errors.revisor2_asignado}
                />

                {/* Aprobador */}
                <FormSelect
                  label="Aprobador"
                  value={formData.aprobador_asignado}
                  onChange={(v: string) => handleSelectChange('aprobador_asignado', v)}
                  placeholder="Seleccionar aprobador..."
                  options={usuarioOptions}
                  error={errors.aprobador_asignado}
                />

                {/* Custodio */}
                <FormSelect
                  label="Custodio"
                  value={formData.custodio}
                  onChange={(v: string) => handleSelectChange('custodio', v)}
                  placeholder="Seleccionar custodio..."
                  options={usuarioOptions}
                  error={errors.custodio}
                />
              </div>
            </div>

            {/* Sección 3: Relaciones y distribución */}
            <div className="space-y-6">
              <h2 className="text-lg font-semibold text-foreground border-b pb-2">
                Relaciones y Distribución
              </h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {/* Documento padre */}
                <FormSelect
                  label="Documento Padre"
                  value={formData.documento_padre_id}
                  onChange={(v: string) => handleSelectChange('documento_padre_id', v)}
                  placeholder="Seleccionar documento padre..."
                  options={documentoOptions}
                  error={errors.documento_padre_id}
                />

                {/* Tipo de distribución */}
                <FormSelect
                  label="Tipo de Distribución"
                  value={formData.tipo_distribucion}
                  onChange={(v: string) => handleSelectChange('tipo_distribucion', v)}
                  placeholder="Seleccionar tipo..."
                  options={tipoDistribucionOptions}
                  error={errors.tipo_distribucion}
                />

                {/* Ubicación física (solo si es física o mixta) */}
                <div className="space-y-2">
                  <Label htmlFor="ubicacion_fisica">Ubicación Física</Label>
                  <Input
                    id="ubicacion_fisica"
                    name="ubicacion_fisica"
                    value={formData.ubicacion_fisica}
                    onChange={handleInputChange}
                    placeholder="Ej: Archivo A, Estante 3"
                    disabled={formData.tipo_distribucion === 'digital'}
                    className={errors.ubicacion_fisica ? 'border-destructive' : ''}
                  />
                  {errors.ubicacion_fisica && (
                    <p className="text-sm text-destructive">{errors.ubicacion_fisica}</p>
                  )}
                  <p className="text-xs text-muted-foreground">
                    {formData.tipo_distribucion === 'digital' 
                      ? 'No aplica para distribución digital' 
                      : 'Solo si la distribución es física o mixta'}
                  </p>
                </div>
              </div>
            </div>

            {/* Botones de acción */}
            <div className="flex justify-end gap-3 pt-6 border-t border-border">
              <Link href={route('documentos.index')}>
                <Button variant="outline" type="button">
                  Cancelar
                </Button>
              </Link>
              <Button type="submit">
                <Save className="h-4 w-4 mr-2" />
                Guardar Documento
              </Button>
            </div>
          </form>
        </div>
      </div>
    </AppLayout>
  );
}