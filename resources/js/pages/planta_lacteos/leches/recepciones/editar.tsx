import { Button } from '@/components/ui/button';
import FormInput from '@/components/ui/form-input';
import FormSelect from '@/components/ui/form-select';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, useForm } from '@inertiajs/react';
import * as React from 'react';
import { route } from 'ziggy-js';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Recepciones de Leche', href: '/planta-lacteos/recepciones-leche' },
    { title: 'Editar Recepción', href: '' },
];

interface PageProps {
    recepcion: any;
    subrutas?: { id: number; nombre: string; ruta: { nombre: string } }[];
}

interface FormData {
    PLL_subruta_acopios_id: string;
    cantidad: string;
    observaciones: string;
    tipo_recepcion: string;
}

export default function Editar({
    recepcion,
    subrutas = [],
}: PageProps) {
    const { data, setData, put, processing, errors } = useForm<FormData>({
        PLL_subruta_acopios_id: recepcion.PLL_subruta_acopios_id?.toString() || '',
        cantidad: recepcion.cantidad?.toString() || '',
        observaciones: recepcion.observaciones || '',
        tipo_recepcion: recepcion.tipo_recepcion || '',
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        put(route('recepciones-leche.update', { recepcion_leche: recepcion.id }));
    };

    const formatFecha = (fecha: string) => {
        return new Date(fecha).toLocaleDateString('es-ES', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Editar Recepción de Leche" />
            <div className="px-4 sm:px-6 py-4 max-w-4xl mx-auto">
                {/* Header */}
                <div className="mb-6">
                    <h1 className="text-2xl font-bold text-foreground">
                        Editar Recepción de Leche
                    </h1>
                    <p className="mt-1 text-sm text-muted-foreground">
                        Actualice la información de la recepción de leche
                    </p>
                </div>

                {/* Información de solo lectura */}
                <div className="bg-muted/50 rounded-lg border border-border p-4 mb-6">
                    <h3 className="text-sm font-semibold text-foreground mb-3">
                        Información del Sistema (No editable)
                    </h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-sm">
                        <div>
                            <p className="text-muted-foreground">Fecha/Hora</p>
                            <p className="font-medium text-foreground">{formatFecha(recepcion.tiempo)}</p>
                        </div>
                        <div>
                            <p className="text-muted-foreground">Estado</p>
                            <p className="font-medium text-foreground">{recepcion.estado?.nombre || '-'}</p>
                        </div>
                        <div>
                            <p className="text-muted-foreground">Usuario</p>
                            <p className="font-medium text-foreground">
                                {recepcion.usuario ?
                                    `${recepcion.usuario.name} ${recepcion.usuario.apellido}`
                                    : '-'
                                }
                            </p>
                        </div>
                        <div>
                            <p className="text-muted-foreground">Análisis</p>
                            <p className="font-medium text-foreground">
                                {recepcion.analisis && recepcion.analisis.length > 0 ? 'Creado' : 'Pendiente'}
                            </p>
                        </div>
                    </div>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Sección: Información de Recepción */}
                    <div className="bg-card rounded-lg border border-border shadow-sm p-4">
                        <div className="mb-4">
                            <h2 className="text-base font-semibold text-foreground flex items-center">
                                <div className="w-1.5 h-1.5 bg-primary rounded-full mr-2"></div>
                                Información de Recepción
                            </h2>
                        </div>

                        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                            <FormSelect
                                label="Subruta de Acopio *"
                                value={data.PLL_subruta_acopios_id}
                                onChange={(v) => setData('PLL_subruta_acopios_id', v)}
                                placeholder="Seleccione subruta"
                                options={subrutas.map((s) => ({
                                    value: s.id.toString(),
                                    label: `${s.nombre} - ${s.ruta.nombre}`,
                                }))}
                                error={errors.PLL_subruta_acopios_id}
                            />

                            <FormSelect
                                label="Tipo de Recepción *"
                                value={data.tipo_recepcion}
                                onChange={(v) => setData('tipo_recepcion', v)}
                                placeholder="Seleccione tipo"
                                options={[
                                    { value: 'camion', label: 'Camión' },
                                    { value: 'tubo', label: 'Tubo' },
                                ]}
                                error={errors.tipo_recepcion}
                            />

                            <FormInput
                                id="cantidad"
                                label="Cantidad (Litros)"
                                type="number"
                                step="0.01"
                                min="0.01"
                                value={data.cantidad}
                                onChange={(e) => setData('cantidad', e.target.value)}
                                placeholder="0.00"
                                error={errors.cantidad}
                                className="col-span-2"
                            />
                        </div>
                    </div>

                    {/* Sección: Observaciones */}
                    <div className="bg-card rounded-lg border border-border shadow-sm p-4">
                        <div className="mb-4">
                            <h2 className="text-base font-semibold text-foreground flex items-center">
                                <div className="w-1.5 h-1.5 bg-green-500 rounded-full mr-2"></div>
                                Observaciones (Opcional)
                            </h2>
                        </div>

                        <div className="grid grid-cols-1 gap-4">
                            <FormInput
                                id="observaciones"
                                label="Observaciones"
                                value={data.observaciones}
                                onChange={(e) => setData('observaciones', e.target.value)}
                                placeholder="Observaciones adicionales..."
                                error={errors.observaciones}
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
                                        Guardando...
                                    </div>
                                ) : (
                                    'Guardar Cambios'
                                )}
                            </Button>
                        </div>
                    </div>
                </form>
            </div>
        </AppLayout>
    );
}
