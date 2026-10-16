import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Toast } from '@/components/ui/toast';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, Link, router, usePage } from '@inertiajs/react';
import { ArrowLeft, Save, Plus, Trash2, Beaker } from 'lucide-react';
import { route } from 'ziggy-js';
import { useState, useEffect } from 'react';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Estados de Planta', href: '/estados-planta' },
    { title: 'Crear Estado', href: '#' },
];

interface PageProps {
    origenes: any[];
    estados: any[];
    orps: any[];
    estadoPlanta?: any;
    flash: {
        success?: string;
        error?: string;
    };
}

interface DetalleForm {
    id?: number;
    orp_id: string;
    preparacion: string;
    cantidad: string;
    _destroy?: boolean;
}

export default function Create() {
    const { props } = usePage();
    const { origenes, estados, orps, estadoPlanta, flash } = props as unknown as PageProps;

    // Encontrar el ID del estado "Produccion"
    const estadoProduccion = estados.find(estado => 
        estado.nombre.toLowerCase() === 'produccion'
    );
    const ID_PRODUCCION = estadoProduccion?.id?.toString() || '7';

    const [formData, setFormData] = useState({
        origen_id: estadoPlanta?.origen_id?.toString() || '',
        proceso_id: estadoPlanta?.proceso_id?.toString() || '',
        etapa_id: estadoPlanta?.etapa_id?.toString() || '',
        observaciones: estadoPlanta?.observaciones || '',
    });

    const [detalles, setDetalles] = useState<DetalleForm[]>([]);
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [detalleErrors, setDetalleErrors] = useState<Record<number, Record<string, string>>>({});

    // Cargar detalles si estamos editando
    useEffect(() => {
        if (estadoPlanta?.detalles) {
            setDetalles(estadoPlanta.detalles.map((detalle: any) => ({
                id: detalle.id,
                orp_id: detalle.orp_id?.toString() || '',
                preparacion: detalle.preparacion || '',
                cantidad: detalle.cantidad?.toString() || '',
            })));
        }
    }, [estadoPlanta]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value,
        }));

        // Limpiar error del campo cuando se modifica
        if (errors[name]) {
            setErrors(prev => ({ ...prev, [name]: '' }));
        }
    };

    const handleDetalleChange = (index: number, field: keyof DetalleForm, value: string) => {
        const newDetalles = [...detalles];
        newDetalles[index] = {
            ...newDetalles[index],
            [field]: value,
        };
        setDetalles(newDetalles);

        // Limpiar error del detalle cuando se modifica
        if (detalleErrors[index]?.[field]) {
            setDetalleErrors(prev => ({
                ...prev,
                [index]: {
                    ...prev[index],
                    [field]: ''
                }
            }));
        }
    };

    const addDetalle = () => {
        setDetalles(prev => [...prev, {
            orp_id: '',
            preparacion: '',
            cantidad: '',
        }]);
    };

    const removeDetalle = (index: number) => {
        const newDetalles = [...detalles];
        if (newDetalles[index].id) {
            newDetalles[index]._destroy = true;
        } else {
            newDetalles.splice(index, 1);
        }
        setDetalles(newDetalles);
        
        // Limpiar errores del detalle eliminado
        setDetalleErrors(prev => {
            const newErrors = { ...prev };
            delete newErrors[index];
            return newErrors;
        });
    };

    const esProduccion = formData.proceso_id === ID_PRODUCCION;

    // Validar detalles antes de enviar
    const validarDetalles = () => {
        const nuevosErrores: Record<number, Record<string, string>> = {};
        let valido = true;

        if (esProduccion) {
            const detallesActivos = detalles.filter(d => !d._destroy);
            
            if (detallesActivos.length === 0) {
                setErrors(prev => ({ ...prev, detalles: 'Se requiere al menos un detalle para producción' }));
                return false;
            }

            detallesActivos.forEach((detalle, index) => {
                const erroresDetalle: Record<string, string> = {};
                
                if (!detalle.orp_id) {
                    erroresDetalle.orp_id = 'La ORP es requerida';
                    valido = false;
                }
                if (!detalle.preparacion.trim()) {
                    erroresDetalle.preparacion = 'La preparación es requerida';
                    valido = false;
                }
                if (!detalle.cantidad || parseFloat(detalle.cantidad) <= 0) {
                    erroresDetalle.cantidad = 'La cantidad debe ser mayor a 0';
                    valido = false;
                }

                if (Object.keys(erroresDetalle).length > 0) {
                    nuevosErrores[index] = erroresDetalle;
                }
            });
        }

        setDetalleErrors(nuevosErrores);
        return valido;
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        // Validar detalles si es producción
        if (esProduccion && !validarDetalles()) {
            return;
        }

        const data = {
            ...formData,
            detalles: esProduccion ? detalles.filter(d => !d._destroy) : [],
        };

        const url = estadoPlanta
            ? route('estados-planta.update', estadoPlanta.id)
            : route('estados-planta.store');

        const method = estadoPlanta ? 'put' : 'post';

        router[method](url, data, {
            onSuccess: () => {
                // Éxito manejado por el controlador
            },
            onError: (err) => {
                setErrors(err as any);
            },
        });
    };

    // Filtrar estados para procesos y etapas
    const procesosDisponibles = estados.filter(estado => 
        ['Vacio Limpio', 'Vacio Sucio', 'Produccion', 'En Limpieza', 'En Mantenimiento', 'Almacenando']
        .includes(estado.nombre)
    );

    const etapasDisponibles = estados.filter(estado => 
        ['Mezcla', 'Pasteurizado', 'Inoculacion', 'Antes de Corte', 'Despues de Corte', 'Saborizacion', 'Envasando']
        .includes(estado.nombre)
    );

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={estadoPlanta ? "Editar Estado" : "Crear Estado"} />
            <div className="px-2 sm:px-6 py-2 space-y-2">
                <Toast />

                {/* Header */}
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <Link href={route('estados-planta.index')}>
                            <Button variant="outline" size="sm">
                                <ArrowLeft className="h-4 w-4" />
                            </Button>
                        </Link>
                        <h1 className="text-2xl font-bold text-foreground">
                            {estadoPlanta ? 'Editar Estado' : 'Crear Estado'}
                        </h1>
                    </div>
                </div>

                {/* Formulario */}
                <div className="bg-background rounded-lg border border-border shadow-sm overflow-hidden">
                    <form onSubmit={handleSubmit} className="p-6 space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {/* Origen */}
                            <div className="space-y-2">
                                <Label htmlFor="origen_id">Origen *</Label>
                                <select
                                    id="origen_id"
                                    name="origen_id"
                                    value={formData.origen_id}
                                    onChange={handleChange}
                                    className="w-full px-3 py-2 border border-border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
                                    required
                                >
                                    <option value="">Seleccionar...</option>
                                    {origenes.map((origen) => (
                                        <option key={origen.id} value={origen.id}>
                                            {origen.alias} - {origen.descripcion}
                                        </option>
                                    ))}
                                </select>
                                {errors.origen_id && (
                                    <p className="text-sm text-destructive">{errors.origen_id}</p>
                                )}
                            </div>

                            {/* Proceso */}
                            <div className="space-y-2">
                                <Label htmlFor="proceso_id">Proceso *</Label>
                                <select
                                    id="proceso_id"
                                    name="proceso_id"
                                    value={formData.proceso_id}
                                    onChange={handleChange}
                                    className="w-full px-3 py-2 border border-border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
                                    required
                                >
                                    <option value="">Seleccionar...</option>
                                    {procesosDisponibles.map((proceso) => (
                                        <option key={proceso.id} value={proceso.id}>
                                            {proceso.nombre}
                                        </option>
                                    ))}
                                </select>
                                {errors.proceso_id && (
                                    <p className="text-sm text-destructive">{errors.proceso_id}</p>
                                )}
                            </div>

                            {/* Etapa */}
                            <div className="space-y-2">
                                <Label htmlFor="etapa_id">Etapa *</Label>
                                <select
                                    id="etapa_id"
                                    name="etapa_id"
                                    value={formData.etapa_id}
                                    onChange={handleChange}
                                    className="w-full px-3 py-2 border border-border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
                                >
                                    <option value="">Seleccionar...</option>
                                    {etapasDisponibles.map((etapa) => (
                                        <option key={etapa.id} value={etapa.id}>
                                            {etapa.nombre}
                                        </option>
                                    ))}
                                </select>
                                {errors.etapa_id && (
                                    <p className="text-sm text-destructive">{errors.etapa_id}</p>
                                )}
                            </div>
                        </div>

                        {/* Sección de Detalles (solo para Producción) */}
                        {esProduccion && (
                            <div className="border border-border rounded-lg p-4">
                                <div className="flex items-center justify-between mb-4">
                                    <h3 className="text-lg font-semibold flex items-center gap-2">
                                        <Beaker className="h-5 w-5" />
                                        Detalles de Producción *
                                    </h3>
                                    <Button
                                        type="button"
                                        variant="outline"
                                        size="sm"
                                        onClick={addDetalle}
                                    >
                                        <Plus className="h-4 w-4 mr-2" />
                                        Agregar Detalle
                                    </Button>
                                </div>

                                {errors.detalles && (
                                    <p className="text-sm text-destructive mb-4">{errors.detalles}</p>
                                )}

                                {detalles.filter(d => !d._destroy).length === 0 ? (
                                    <div className="text-center py-6 text-muted-foreground border border-dashed border-border rounded-lg">
                                        <Beaker className="h-8 w-8 mx-auto mb-2" />
                                        <p>No hay detalles agregados</p>
                                        <p className="text-sm">Agrega al menos un detalle para producción</p>
                                    </div>
                                ) : (
                                    <div className="space-y-4">
                                        {detalles.map((detalle, index) => (
                                            !detalle._destroy && (
                                                <div key={index} className="grid grid-cols-1 md:grid-cols-4 gap-4 p-4 border border-border rounded-lg bg-muted/20">
                                                    {/* ORP */}
                                                    <div className="space-y-2">
                                                        <Label htmlFor={`detalle-orp-${index}`}>ORP *</Label>
                                                        <select
                                                            id={`detalle-orp-${index}`}
                                                            value={detalle.orp_id}
                                                            onChange={(e) => handleDetalleChange(index, 'orp_id', e.target.value)}
                                                            className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary text-sm ${
                                                                detalleErrors[index]?.orp_id ? 'border-destructive' : 'border-border'
                                                            }`}
                                                            required
                                                        >
                                                            <option value="">Seleccionar ORP...</option>
                                                            {orps.map((orp) => (
                                                                <option key={orp.id} value={orp.id}>
                                                                    {orp.codigo} - {orp.productoTerminado?.nombre_sap || 'Sin producto'}
                                                                </option>
                                                            ))}
                                                        </select>
                                                        {detalleErrors[index]?.orp_id && (
                                                            <p className="text-sm text-destructive">{detalleErrors[index].orp_id}</p>
                                                        )}
                                                    </div>

                                                    {/* Preparación */}
                                                    <div className="space-y-2">
                                                        <Label htmlFor={`detalle-preparacion-${index}`}>Preparación *</Label>
                                                        <Input
                                                            id={`detalle-preparacion-${index}`}
                                                            type="text"
                                                            placeholder="Ej: 1-2, 3-4.225, 5.32"
                                                            value={detalle.preparacion}
                                                            onChange={(e) => handleDetalleChange(index, 'preparacion', e.target.value)}
                                                            className={`text-sm ${
                                                                detalleErrors[index]?.preparacion ? 'border-destructive' : ''
                                                            }`}
                                                            required
                                                        />
                                                        {detalleErrors[index]?.preparacion && (
                                                            <p className="text-sm text-destructive">{detalleErrors[index].preparacion}</p>
                                                        )}
                                                    </div>

                                                    {/* Cantidad */}
                                                    <div className="space-y-2">
                                                        <Label htmlFor={`detalle-cantidad-${index}`}>Cantidad (L) *</Label>
                                                        <Input
                                                            id={`detalle-cantidad-${index}`}
                                                            type="number"
                                                            step="0.001"
                                                            min="0.001"
                                                            placeholder="0.000"
                                                            value={detalle.cantidad}
                                                            onChange={(e) => handleDetalleChange(index, 'cantidad', e.target.value)}
                                                            className={`text-sm ${
                                                                detalleErrors[index]?.cantidad ? 'border-destructive' : ''
                                                            }`}
                                                            required
                                                        />
                                                        {detalleErrors[index]?.cantidad && (
                                                            <p className="text-sm text-destructive">{detalleErrors[index].cantidad}</p>
                                                        )}
                                                    </div>

                                                    {/* Botón Eliminar */}
                                                    <div className="space-y-2 flex items-end">
                                                        <Button
                                                            type="button"
                                                            variant="outline"
                                                            size="sm"
                                                            onClick={() => removeDetalle(index)}
                                                            className="text-destructive border-destructive hover:bg-destructive/10"
                                                        >
                                                            <Trash2 className="h-4 w-4" />
                                                        </Button>
                                                    </div>
                                                </div>
                                            )
                                        ))}
                                    </div>
                                )}
                            </div>
                        )}

                        {/* Observaciones */}
                        <div className="space-y-2">
                            <Label htmlFor="observaciones">Observaciones</Label>
                            <Textarea
                                id="observaciones"
                                name="observaciones"
                                rows={3}
                                value={formData.observaciones}
                                onChange={handleChange}
                                placeholder="Observaciones sobre el estado de planta..."
                                className="resize-none"
                            />
                            {errors.observaciones && (
                                <p className="text-sm text-destructive">{errors.observaciones}</p>
                            )}
                        </div>

                        {/* Botones */}
                        <div className="flex justify-end gap-2 pt-6 border-t border-border">
                            <Link href={route('estados-planta.index')}>
                                <Button variant="outline" type="button">
                                    Cancelar
                                </Button>
                            </Link>
                            <Button type="submit">
                                <Save className="h-4 w-4 mr-2" />
                                {estadoPlanta ? 'Actualizar' : 'Guardar'} Estado
                            </Button>
                        </div>
                    </form>
                </div>
            </div>
        </AppLayout>
    );
}