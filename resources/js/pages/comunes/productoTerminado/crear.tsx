import { Button } from '@/components/ui/button';
import FormInput from '@/components/ui/form-input';
import FormSelect from '@/components/ui/form-select';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, useForm } from '@inertiajs/react';
import * as React from 'react';
import { route } from 'ziggy-js';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Productos Terminados', href: '/productos-terminados' },
    { title: 'Crear Producto Terminado', href: '/productos-terminados/create' },
];

interface PageProps {
    ubicaciones?: { id: number; nombre: string }[];
    categorias?: { id: number; nombre: string }[];
    subcategorias?: { id: number; nombre: string }[];
    lineas?: { id: number; nombre: string }[];
    destinos?: { id: number; nombre: string }[];
    unidades?: { id: number; nombre: string }[];
    estados?: { id: number; nombre: string }[];
}

export default function Crear({
    ubicaciones = [],
    categorias = [],
    subcategorias = [],
    lineas = [],
    destinos = [],
    unidades = [],
    estados = [],
}: PageProps) {
    // Hook de Inertia para manejar el formulario
    const { data, setData, post, processing, errors } = useForm({
        codigo_sap: '',
        codigo_interno: '',
        nombre_sap: '',
        nombre_comercial: '',
        descripcion_comercial: '',
        descripcion_tecnica: '',
        ubicacion_id: '',
        categoria_producto_id: '',
        subcategoria_producto_id: '',
        linea_id: '',
        destino_id: '',
        cantidad_neto: '',
        unidades_id: '',
        cantidad_bruto: '',
        estado_id: '',
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        post(route('productos-terminados.store'));
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Crear Producto Terminado" />
            <div className="px-4 sm:px-6 py-4 max-w-6xl mx-auto">
                {/* Header de la página */}
                <div className="mb-6">
                    <h1 className="text-2xl font-bold text-foreground">
                        Crear Nuevo Producto Terminado
                    </h1>
                    <p className="mt-1 text-sm text-muted-foreground">
                        Complete la información requerida para registrar un nuevo producto terminado
                    </p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Sección: Códigos e Identificación */}
                    <div className="bg-card rounded-lg border border-border shadow-sm p-4">
                        <div className="mb-4">
                            <h2 className="text-base font-semibold text-foreground flex items-center">
                                <div className="w-1.5 h-1.5 bg-primary rounded-full mr-2"></div>
                                Códigos e Identificación
                            </h2>
                        </div>
                        
                        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                            <FormInput
                                id="codigo_sap"
                                label="Código SAP"
                                value={data.codigo_sap}
                                onChange={(e) => setData('codigo_sap', e.target.value)}
                                placeholder="Código SAP"
                                error={errors.codigo_sap}
                            />

                            <FormInput
                                id="codigo_interno"
                                label="Código Interno"
                                value={data.codigo_interno}
                                onChange={(e) => setData('codigo_interno', e.target.value)}
                                placeholder="Código Interno"
                                error={errors.codigo_interno}
                            />

                            <FormInput
                                id="nombre_comercial"
                                label="Nombre Comercial"
                                value={data.nombre_comercial}
                                onChange={(e) => setData('nombre_comercial', e.target.value)}
                                placeholder="Nombre Comercial"
                                error={errors.nombre_comercial}
                            />

                            <FormInput
                                id="nombre_sap"
                                label="Nombre SAP"
                                value={data.nombre_sap}
                                onChange={(e) => setData('nombre_sap', e.target.value)}
                                placeholder="Nombre SAP"
                                error={errors.nombre_sap}
                            />

                            <FormInput
                                id="descripcion_comercial"
                                label="Descripción Comercial"
                                value={data.descripcion_comercial}
                                onChange={(e) => setData('descripcion_comercial', e.target.value)}
                                placeholder="Descripción Comercial"
                                error={errors.descripcion_comercial}
                            />
                        </div>
                    </div>

                    {/* Sección: Clasificación y Ubicación */}
                    <div className="bg-card rounded-lg border border-border shadow-sm p-4">
                        <div className="mb-4">
                            <h2 className="text-base font-semibold text-foreground flex items-center">
                                <div className="w-1.5 h-1.5 bg-green-500 rounded-full mr-2"></div>
                                Clasificación y Ubicación
                            </h2>
                        </div>
                        
                        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                            <FormSelect
                                label="Ubicación"
                                value={data.ubicacion_id}
                                onChange={(v) => setData('ubicacion_id', v)}
                                placeholder="Seleccione ubicación"
                                options={ubicaciones.map((u) => ({
                                    value: u.id.toString(),
                                    label: u.nombre,
                                }))}
                                error={errors.ubicacion_id}
                            />

                            <FormSelect
                                label="Categoría"
                                value={data.categoria_producto_id}
                                onChange={(v) => setData('categoria_producto_id', v)}
                                placeholder="Seleccione categoría"
                                options={categorias.map((c) => ({
                                    value: c.id.toString(),
                                    label: c.nombre,
                                }))}
                                error={errors.categoria_producto_id}
                            />

                            <FormSelect
                                label="Subcategoría"
                                value={data.subcategoria_producto_id}
                                onChange={(v) => setData('subcategoria_producto_id', v)}
                                placeholder="Seleccione subcategoría"
                                options={subcategorias.map((s) => ({
                                    value: s.id.toString(),
                                    label: s.nombre,
                                }))}
                                error={errors.subcategoria_producto_id}
                            />

                            <FormSelect
                                label="Línea"
                                value={data.linea_id}
                                onChange={(v) => setData('linea_id', v)}
                                placeholder="Seleccione línea"
                                options={lineas.map((l) => ({
                                    value: l.id.toString(),
                                    label: l.nombre,
                                }))}
                                error={errors.linea_id}
                            />

                            <FormSelect
                                label="Destino"
                                value={data.destino_id}
                                onChange={(v) => setData('destino_id', v)}
                                placeholder="Seleccione destino"
                                options={destinos.map((d) => ({
                                    value: d.id.toString(),
                                    label: d.nombre,
                                }))}
                                error={errors.destino_id}
                            />

                            <FormSelect
                                label="Estado"
                                value={data.estado_id}
                                onChange={(v) => setData('estado_id', v)}
                                placeholder="Seleccione estado"
                                options={estados.map((e) => ({
                                    value: e.id.toString(),
                                    label: e.nombre,
                                }))}
                                error={errors.estado_id}
                            />
                        </div>
                    </div>

                    {/* Sección: Cantidades y Unidades */}
                    <div className="bg-card rounded-lg border border-border shadow-sm p-4">
                        <div className="mb-4">
                            <h2 className="text-base font-semibold text-foreground flex items-center">
                                <div className="w-1.5 h-1.5 bg-purple-500 rounded-full mr-2"></div>
                                Cantidades y Unidades
                            </h2>
                        </div>
                        
                        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                            <FormInput
                                id="cantidad_neto"
                                label="Cantidad Neto"
                                type="number"
                                step="0.001"
                                value={data.cantidad_neto}
                                onChange={(e) => setData('cantidad_neto', e.target.value)}
                                placeholder="0.000"
                                error={errors.cantidad_neto}
                            />

                            <FormInput
                                id="cantidad_bruto"
                                label="Cantidad Bruto"
                                type="number"
                                step="0.001"
                                value={data.cantidad_bruto}
                                onChange={(e) => setData('cantidad_bruto', e.target.value)}
                                placeholder="0.000"
                                error={errors.cantidad_bruto}
                            />

                            <FormSelect
                                label="Unidad de Medida"
                                value={data.unidades_id}
                                onChange={(v) => setData('unidades_id', v)}
                                placeholder="Seleccione unidad"
                                options={unidades.map((u) => ({
                                    value: u.id.toString(),
                                    label: u.nombre,
                                }))}
                                error={errors.unidades_id}
                            />
                        </div>
                    </div>

                    {/* Sección: Descripción Técnica */}
                    <div className="bg-card rounded-lg border border-border shadow-sm p-4">
                        <div className="mb-4">
                            <h2 className="text-base font-semibold text-foreground flex items-center">
                                <div className="w-1.5 h-1.5 bg-orange-500 rounded-full mr-2"></div>
                                Descripción Técnica
                            </h2>
                        </div>
                        
                        <div className="grid grid-cols-1 gap-4">
                            <FormInput
                                id="descripcion_tecnica"
                                label="Descripción Técnica"
                                value={data.descripcion_tecnica}
                                onChange={(e) => setData('descripcion_tecnica', e.target.value)}
                                placeholder="Descripción técnica del producto"
                                error={errors.descripcion_tecnica}
                            />
                        </div>
                    </div>

                    {/* Botones de acción */}
                    <div className="bg-card rounded-lg border border-border shadow-sm p-4">
                        <div className="flex flex-col sm:flex-row gap-3 justify-end">
                            <Button 
                                type="button" 
                                variant="outline" 
                                onClick={() => window.history.back()}
                                className="sm:w-32 w-full order-2 sm:order-1"
                            >
                                Cancelar
                            </Button>
                            <Button 
                                type="submit" 
                                disabled={processing}
                                className="sm:w-40 w-full order-1 sm:order-2"
                            >
                                {processing ? (
                                    <div className="flex items-center justify-center">
                                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                                        Creando...
                                    </div>
                                ) : (
                                    'Crear Producto'
                                )}
                            </Button>
                        </div>
                    </div>
                </form>
            </div>
        </AppLayout>
    );
}