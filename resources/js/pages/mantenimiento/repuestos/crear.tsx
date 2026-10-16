import { Button } from '@/components/ui/button';
import FormInput from '@/components/ui/form-input';
import FormSelect from '@/components/ui/form-select';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, useForm } from '@inertiajs/react';
import * as React from 'react';
import { route } from 'ziggy-js';

const breadcrumbs: BreadcrumbItem[] = [


    {
        title: 'Repuestos',
        href: '/mantenimiento/repuestos',
    },
    {
        title: 'Crear repuesto',
        href: '/mantenimiento/repuestos/crear',
    },];

interface PageProps {
    unidades?: { id: number; nombre: string }[];
}

export default function Crear({ unidades = [] }: PageProps) {
    const { data, setData, post, processing, errors } = useForm({
        nombre: '',
        codigo: '',
        unidad_id: '',
        observacion: '',
        descripcion: '',
        stock_minimo: '',
        precio_relativo: '',
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        post(route('repuestos.guardar'));
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Crear usuario" />
            <div className="mx-auto max-w-6xl px-4 py-4 sm:px-6">
                {/* Header */}
                <div className="mb-6">
                    <h1 className="text-2xl font-bold text-foreground">
                        Crear Nuevo Repuesto
                    </h1>
                    <p className="mt-1 text-sm text-muted-foreground">
                        Complete la información requerida para registrar un
                        nuevo repuesto
                    </p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Sección: Información Personal */}
                    <div className="rounded-lg border border-border bg-card p-4 shadow-sm">
                        <div className="mb-4">
                            <h2 className="flex items-center text-base font-semibold text-foreground">
                                <div className="mr-2 h-1.5 w-1.5 rounded-full bg-primary"></div>
                                Información General
                            </h2>
                        </div>

                        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                            <FormInput
                                id="codigo"
                                label="Codigo"
                                value={data.codigo}
                                onChange={(e) =>
                                    setData('codigo', e.target.value)
                                }
                                placeholder="Codigo"
                                error={errors.codigo}
                            />
                            <FormInput
                                id="nombre"
                                label="Nombre"
                                value={data.nombre}
                                onChange={(e) =>
                                    setData('nombre', e.target.value)
                                }
                                placeholder="Ingrese el nombre"
                                error={errors.nombre}
                            />

                            <FormInput
                                id="descripcion"
                                label="descripcion"
                                value={data.descripcion}
                                onChange={(e) =>
                                    setData('descripcion', e.target.value)
                                }
                                placeholder="descripcion"
                                error={errors.descripcion}
                            />

                            <FormInput
                                id="observacion"
                                label="Observacion"
                                value={data.observacion}
                                onChange={(e) =>
                                    setData('observacion', e.target.value)
                                }
                                placeholder="Observacion"
                                error={errors.observacion}
                            />

                            <FormInput
                                id="precio_relativo"
                                label="Precio Relativo"
                                value={data.precio_relativo}
                                onChange={(e) =>
                                    setData('precio_relativo', e.target.value)
                                }
                                placeholder="Precio Relativo"
                                error={errors.precio_relativo}
                            />

                            <FormInput
                                id="stock_minimo"
                                label="Stock Minimo"
                                value={data.stock_minimo}
                                onChange={(e) =>
                                    setData('stock_minimo', e.target.value)
                                }
                                placeholder="stock minimo"
                                error={errors.stock_minimo}
                            />

                            <FormSelect
                                label="Unidades"
                                value={data.unidad_id?.toString() || ''}
                                onChange={(v) => setData('unidad_id', v)}
                                placeholder="Seleccione planta"
                                options={unidades.map((r) => ({
                                    value: r.id.toString(),
                                    label: r.nombre,
                                }))}
                                error={errors.unidad_id}
                            />
                        </div>
                    </div>



                    {/* Botones de acción */}
                    <div className="rounded-lg border border-border bg-card p-4 shadow-sm">
                        <div className="flex flex-col justify-end gap-3 sm:flex-row">
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => window.history.back()}
                                className="order-2 w-full sm:order-1 sm:w-32"
                            >
                                Cancelar
                            </Button>
                            <Button
                                type="submit"
                                disabled={processing}
                                className="order-1 w-full sm:order-2 sm:w-40"
                            >
                                {processing ? (
                                    <div className="flex items-center justify-center">
                                        <div className="mr-2 h-4 w-4 animate-spin rounded-full border-b-2 border-white"></div>
                                        Creando...
                                    </div>
                                ) : (
                                    'Crear Repuesto'
                                )}
                            </Button>
                        </div>
                    </div>
                </form>
            </div>
        </AppLayout>
    );
}
