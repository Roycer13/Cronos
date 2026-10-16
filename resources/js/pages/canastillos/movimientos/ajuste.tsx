import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import FormInput from '@/components/ui/form-input';
import FormSelect from '@/components/ui/form-select';
import { Toast } from '@/components/ui/toast';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, useForm, usePage } from '@inertiajs/react';
import { ArrowLeft, Plus, Save, Trash2 } from 'lucide-react';
import { useState } from 'react';
import { route } from 'ziggy-js';

interface Almacen {
    id: number;
    nombre: string;
}

interface Canastillo {
    id: number;
    nombre: string;
    tamaño?: string;
}

interface PageProps {
    almacenes: Almacen[];
    canastillos: Canastillo[];
    flash: {
        success?: string;
        error?: string;
    };
}

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Movimientos', href: '/canastillos/movimientos' },
    { title: 'Ajuste de Inventario', href: '/canastillos/movimientos/ajuste' },
];

export default function Ajuste() {
    const { props } = usePage();
    const { almacenes = [], canastillos = [], flash } = props as unknown as PageProps;

    // Estado del formulario principal, incluyendo detalles como array vacío
    const { data, setData, post, processing, errors } = useForm({
        almacen_id: '',
        tipo_ajuste: 'ingreso',
        observaciones: '',
        detalles: [] as { canastillo_id: string; cantidad: string }[],
    });

    // Estado local para el detalle que se está agregando (similar al ejemplo)
    const [detalleActual, setDetalleActual] = useState({
        canastillo_id: '',
        cantidad: '',
    });

    // Función para agregar un detalle a la lista
    const agregarDetalle = () => {
        if (!detalleActual.canastillo_id) {
            alert('Seleccione un canastillo');
            return;
        }
        const cantidad = Number(detalleActual.cantidad);
        if (isNaN(cantidad) || cantidad <= 0) {
            alert('Ingrese una cantidad válida');
            return;
        }

        // Verificar si el canastillo ya está agregado (opcional)
        if (data.detalles.some((d) => d.canastillo_id === detalleActual.canastillo_id)) {
            alert('El canastillo ya está agregado');
            return;
        }

        // Agregar a la lista de detalles
        setData('detalles', [
            ...data.detalles,
            { ...detalleActual },
        ]);
        // Limpiar el detalle actual
        setDetalleActual({ canastillo_id: '', cantidad: '' });
    };

    const eliminarDetalle = (index: number) => {
        setData(
            'detalles',
            data.detalles.filter((_, i) => i !== index),
        );
    };

    // Manejador para evitar que Enter envíe el formulario y en su lugar agregue el detalle
    const handleDetailKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            agregarDetalle();
        }
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (data.detalles.length === 0) {
            alert('Debe agregar al menos un canastillo');
            return;
        }
        // Enviar el formulario con Inertia (los detalles ya están en data)
        post(route('canastillos.movimientos.ajuste.store'));
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Ajuste de Inventario" />
            <div className="space-y-4 px-2 py-2 sm:px-6">
                <Toast />

                <div className="flex items-center justify-between">
                    <h1 className="text-2xl font-bold text-foreground">
                        Ajuste Manual de Inventario
                    </h1>
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => window.history.back()}
                    >
                        <ArrowLeft className="mr-2 h-4 w-4" />
                        Volver
                    </Button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    <Card className="p-6">
                        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                            <FormSelect
                                id="almacen_id"
                                label="Almacén *"
                                value={data.almacen_id}
                                onChange={(v) => setData('almacen_id', v)}
                                options={almacenes.map((a) => ({
                                    value: a.id.toString(),
                                    label: a.nombre,
                                }))}
                                placeholder="Seleccione el almacén"
                                error={errors.almacen_id}
                                required
                            />

                            <FormSelect
                                id="tipo_ajuste"
                                label="Tipo de ajuste *"
                                value={data.tipo_ajuste}
                                onChange={(v) => setData('tipo_ajuste', v)}
                                options={[
                                    { value: 'ingreso', label: 'Ingreso (aumenta stock)' },
                                    { value: 'salida', label: 'Salida (disminuye stock)' },
                                ]}
                                placeholder="Seleccione tipo"
                                error={errors.tipo_ajuste}
                                required
                            />
                        </div>
                    </Card>

                    {/* Sección de detalles (igual que en el ejemplo funcional) */}
                    <Card className="p-6">
                        <div className="mb-4">
                            <h2 className="flex items-center text-base font-semibold text-foreground">
                                <div className="mr-2 h-1.5 w-1.5 rounded-full bg-green-500"></div>
                                Canastillos a ajustar
                            </h2>
                        </div>

                        {/* Lista de detalles agregados */}
                        {data.detalles.length > 0 && (
                            <div className="mb-4 space-y-2">
                                {data.detalles.map((detalle, index) => {
                                    const canastillo = canastillos.find(
                                        (c) => c.id.toString() === detalle.canastillo_id,
                                    );
                                    return (
                                        <div
                                            key={index}
                                            className="flex items-center justify-between rounded-md bg-muted/50 p-2"
                                        >
                                            <div className="grid flex-1 grid-cols-2 gap-2">
                                                <span className="text-sm font-medium">
                                                    {canastillo?.nombre || 'Desconocido'}
                                                </span>
                                                <span className="text-sm">
                                                    Cantidad: {detalle.cantidad}
                                                </span>
                                            </div>
                                            <Button
                                                type="button"
                                                variant="ghost"
                                                size="icon"
                                                onClick={() => eliminarDetalle(index)}
                                                className="h-8 w-8 text-destructive hover:text-destructive"
                                            >
                                                <Trash2 className="h-4 w-4" />
                                            </Button>
                                        </div>
                                    );
                                })}
                            </div>
                        )}

                        {/* Formulario para agregar nuevo detalle (con onKeyDown para evitar submit) */}
                        <div onKeyDown={handleDetailKeyDown}>
                            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3 items-end">
                                <FormSelect
                                    label="Canastillo"
                                    value={detalleActual.canastillo_id}
                                    onChange={(v) =>
                                        setDetalleActual({
                                            ...detalleActual,
                                            canastillo_id: v,
                                        })
                                    }
                                    placeholder="Seleccione canastillo"
                                    options={canastillos.map((c) => ({
                                        value: c.id.toString(),
                                        label: c.tamaño ? `${c.nombre} (${c.tamaño})` : c.nombre,
                                    }))}
                                />

                                <FormInput
                                    label="Cantidad"
                                    type="number"
                                    value={detalleActual.cantidad}
                                    onChange={(e) =>
                                        setDetalleActual({
                                            ...detalleActual,
                                            cantidad: e.target.value,
                                        })
                                    }
                                    placeholder="0"
                                    min="1"
                                    step="1"
                                />

                                <Button
                                    type="button"
                                    onClick={agregarDetalle}
                                    variant="outline"
                                >
                                    <Plus className="mr-2 h-4 w-4" />
                                    Agregar canastillo
                                </Button>
                            </div>
                            {errors.detalles && (
                                <p className="mt-2 text-sm text-destructive">{errors.detalles}</p>
                            )}
                        </div>
                    </Card>

                    <Card className="p-6">
                        <FormInput
                            id="observaciones"
                            label="Observaciones (motivo del ajuste)"
                            value={data.observaciones}
                            onChange={(e) => setData('observaciones', e.target.value)}
                            error={errors.observaciones}
                            placeholder="Ej: Corrección por conteo físico, merma, etc."
                            textarea
                        />
                    </Card>

                    {/* Botones */}
                    <div className="flex justify-end gap-3">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => window.history.back()}
                        >
                            Cancelar
                        </Button>
                        <Button type="submit" disabled={processing}>
                            <Save className="mr-2 h-4 w-4" />
                            {processing ? 'Registrando...' : 'Registrar Ajuste'}
                        </Button>
                    </div>
                </form>
            </div>
        </AppLayout>
    );
}
