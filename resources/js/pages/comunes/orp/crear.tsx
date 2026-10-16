import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Toast } from '@/components/ui/toast';
import FormSelect from '@/components/ui/form-select';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, Link, router, usePage } from '@inertiajs/react';
import { ArrowLeft, Save } from 'lucide-react';
import { route } from 'ziggy-js';
import { useAuth } from '@/hooks/useAuth';
import { useState } from 'react';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Órdenes de Producción', href: '/orps' },
    { title: 'Crear ORP', href: '#' },
];

interface PageProps {
    productos_terminados: any[];
    ubicaciones: any[];
    unidades: any[];
    estados: any[];
    usuarios: any[];
    flash: {
        success?: string;
        error?: string;
    };
}

export default function Create() {
    const { props } = usePage();
    const { productos_terminados, ubicaciones, unidades, estados, usuarios, flash } = props as unknown as PageProps;

    const [formData, setFormData] = useState({
        codigo: '',
        producto_terminado_id: '',
        lote: '',
        prioridad: '',
        cantidad_programada: '',
        cantidad_producida: '0',
        unidad_id: '',
        tiempo_elaboracion: '',
        revisado: false,
        revisor_id: '',
        fecha_revision: '',
        usuario_modificador_id: '',
        fecha_vencimiento1: '',
        fecha_vencimiento2: '',
        notas_internas: '',
        ubicacion_id: '',
        observaciones: '',
    });

    const [errors, setErrors] = useState<Record<string, string>>({});

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value, type } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value,
        }));

        // Limpiar error del campo cuando se modifica
        if (errors[name]) {
            setErrors(prev => ({ ...prev, [name]: '' }));
        }
    };


     const {
            hasPermission,
            belongsToUbicacion,
            canDo,
            isAdmin: isAdminFromAuth,
            user: authUser,
        } = useAuth();


    const setData = (name: string, value: any) => {
        setFormData(prev => ({
            ...prev,
            [name]: value,
        }));

        // Limpiar error del campo cuando se modifica
        if (errors[name]) {
            setErrors(prev => ({ ...prev, [name]: '' }));
        }
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        router.post(route('orps.store'), formData, {
            onSuccess: () => {
                // Éxito manejado por el controlador
            },
            onError: (err) => {
                setErrors(err as any);
            },
        });
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Crear ORP" />
            <div className="px-2 sm:px-6 py-2 space-y-2">
                <Toast />

                {/* Header */}
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <Link href={route('orps.index')}>
                            <Button variant="outline" size="sm">
                                <ArrowLeft className="h-4 w-4" />
                            </Button>
                        </Link>
                        <h1 className="text-2xl font-bold text-foreground">Crear ORP</h1>
                    </div>
                </div>

                {/* Formulario */}
                <div className="bg-background rounded-lg border border-border shadow-sm overflow-hidden">
                    <form onSubmit={handleSubmit} className="p-6 space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {/* Código */}
                            <div className="space-y-2">
                                <Label htmlFor="codigo">Número/Código ORP </Label>
                                <Input
                                    id="codigo"
                                    name="codigo"
                                    value={formData.codigo}
                                    onChange={handleChange}
                                    required
                                    className={errors.codigo ? 'border-destructive' : ''}
                                />
                                {errors.codigo && (
                                    <p className="text-sm text-destructive">{errors.codigo}</p>
                                )}
                            </div>

                            {/* Producto Terminado */}
                            <FormSelect
                                label="Producto Terminado (Codigo SAP)"
                                value={formData.producto_terminado_id?.toString() || ''}
                                onChange={(v) => setData('producto_terminado_id', v)}
                                placeholder="Seleccionar..."
                                options={productos_terminados.map((producto) => ({
                                    value: producto.id.toString(),
                                    label: `${producto.nombre_comercial} (${producto.codigo_sap})`,
                                }))}
                                error={errors.producto_terminado_id}
                            />

                            {/* Lote */}
                            <div className="space-y-2">
                                <Label htmlFor="lote">Lote *</Label>
                                <Input
                                    id="lote"
                                    name="lote"
                                    type="number"
                                    step="0.000001"
                                    value={formData.lote}
                                    onChange={handleChange}
                                    required
                                    className={errors.lote ? 'border-destructive' : ''}
                                />
                                {errors.lote && (
                                    <p className="text-sm text-destructive">{errors.lote}</p>
                                )}
                            </div>

                            {/* Prioridad */}
                            <FormSelect
                                label="Prioridad"
                                value={formData.prioridad || ''}
                                onChange={(v) => setData('prioridad', v)}
                                placeholder="Seleccionar..."
                                options={[
                                    { value: 'baja', label: 'Baja' },
                                    { value: 'media', label: 'Media' },
                                    { value: 'alta', label: 'Alta' },
                                    { value: 'urgente', label: 'Urgente' },
                                ]}
                                error={errors.prioridad}
                            />

                            {/* Cantidad Programada */}
                            <div className="space-y-2">
                                <Label htmlFor="cantidad_programada">Cantidad Programada</Label>
                                <Input
                                    id="cantidad_programada"
                                    name="cantidad_programada"
                                    type="number"
                                    step="0.01"
                                    value={formData.cantidad_programada}
                                    onChange={handleChange}
                                />
                            </div>

                            {/* Cantidad Producida */}
                            <div className="space-y-2">
                                <Label htmlFor="cantidad_producida">Cantidad Producida</Label>
                                <Input
                                    id="cantidad_producida"
                                    name="cantidad_producida"
                                    type="number"
                                    step="0.01"
                                    value={formData.cantidad_producida}
                                    onChange={handleChange}
                                />
                            </div>

                            {/* Unidad */}
                            <FormSelect
                                label="Unidad"
                                value={formData.unidad_id?.toString() || ''}
                                onChange={(v) => setData('unidad_id', v)}
                                placeholder="Seleccionar..."
                                options={unidades.map((unidad) => ({
                                    value: unidad.id.toString(),
                                    label: unidad.nombre,
                                }))}
                                error={errors.unidad_id}
                            />

                            {/* Tiempo de Elaboración */}
                            <div className="space-y-2">
                                <Label htmlFor="tiempo_elaboracion">Tiempo Elaboración (min)</Label>
                                <Input
                                    id="tiempo_elaboracion"
                                    name="tiempo_elaboracion"
                                    type="number"
                                    value={formData.tiempo_elaboracion}
                                    onChange={handleChange}
                                />
                            </div>

                            {/* Ubicación */}

                            {isAdminFromAuth && (
                            <FormSelect
                                label="Planta/Ubicación"
                                value={formData.ubicacion_id?.toString() || ''}
                                onChange={(v) => setData('ubicacion_id', v)}
                                placeholder="Seleccione planta"
                                options={ubicaciones.map((ubicacion) => ({
                                    value: ubicacion.id.toString(),
                                    label: ubicacion.nombre,
                                }))}
                                error={errors.ubicacion_id}
                            />
                            )}



                            {/* Fecha Vencimiento 1 */}
                            <div className="space-y-2">
                                <Label htmlFor="fecha_vencimiento1">Fecha Vencimiento 1</Label>
                                <Input
                                    id="fecha_vencimiento1"
                                    name="fecha_vencimiento1"
                                    type="date"
                                    value={formData.fecha_vencimiento1}
                                    onChange={handleChange}
                                />
                            </div>

                            {/* Fecha Vencimiento 2 */}
                            <div className="space-y-2">
                                <Label htmlFor="fecha_vencimiento2">Fecha Vencimiento 2</Label>
                                <Input
                                    id="fecha_vencimiento2"
                                    name="fecha_vencimiento2"
                                    type="date"
                                    value={formData.fecha_vencimiento2}
                                    onChange={handleChange}
                                />
                            </div>
                        </div>

                        {/* Notas Internas */}
                        <div className="space-y-2">
                            <Label htmlFor="notas_internas">Notas Internas</Label>
                            <Textarea
                                id="notas_internas"
                                name="notas_internas"
                                rows={3}
                                value={formData.notas_internas}
                                onChange={handleChange}
                                placeholder="Notas internas para el equipo de producción..."
                            />
                        </div>

                        {/* Observaciones */}
                        <div className="space-y-2">
                            <Label htmlFor="observaciones">Observaciones</Label>
                            <Textarea
                                id="observaciones"
                                name="observaciones"
                                rows={3}
                                value={formData.observaciones}
                                onChange={handleChange}
                                placeholder="Observaciones generales sobre la orden de producción..."
                            />
                        </div>

                        {/* Revisado */}
                        <div className="flex items-center space-x-2">
                            <input
                                id="revisado"
                                name="revisado"
                                type="checkbox"
                                checked={formData.revisado}
                                onChange={handleChange}
                                className="h-4 w-4 text-primary focus:ring-primary border-border rounded"
                            />
                            <Label htmlFor="revisado">Revisado</Label>
                        </div>

                        {/* Botones */}
                        <div className="flex justify-end gap-2 pt-6 border-t border-border">
                            <Link href={route('orps.index')}>
                                <Button variant="outline" type="button">
                                    Cancelar
                                </Button>
                            </Link>
                            <Button type="submit">
                                <Save className="h-4 w-4 mr-2" />
                                Guardar ORP
                            </Button>
                        </div>
                    </form>
                </div>
            </div>
        </AppLayout>
    );
}
