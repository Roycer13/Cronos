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
    almacenesOrigen: Almacen[];
    almacenesDestino: Almacen[];
    canastillos: Canastillo[];
    flash: {
        success?: string;
        error?: string;
    };
}

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Movimientos', href: '/canastillos/movimientos' },
    { title: 'Nueva Transferencia', href: '/canastillos/movimientos/transferencia' },
];

export default function Transferencia() {
    const { props } = usePage();
    const { almacenesOrigen = [], almacenesDestino = [], canastillos = [], flash } = props as unknown as PageProps;

    const { data, setData, post, processing, errors } = useForm({
        almacen_origen_id: '',
        almacen_destino_id: '',
        observaciones: '',
        detalles: [] as { canastillo_id: string; cantidad: string }[],
    });

    const [detalleActual, setDetalleActual] = useState({ canastillo_id: '', cantidad: '' });

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
        if (data.detalles.some(d => d.canastillo_id === detalleActual.canastillo_id)) {
            alert('El canastillo ya está agregado');
            return;
        }
        setData('detalles', [...data.detalles, { ...detalleActual }]);
        setDetalleActual({ canastillo_id: '', cantidad: '' });
    };

    const eliminarDetalle = (index: number) => {
        setData('detalles', data.detalles.filter((_, i) => i !== index));
    };

    const handleDetailKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            agregarDetalle();
        }
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (data.almacen_origen_id === data.almacen_destino_id) {
            alert('El almacén de origen y destino deben ser diferentes');
            return;
        }
        if (data.detalles.length === 0) {
            alert('Debe agregar al menos un canastillo');
            return;
        }
        post(route('canastillos.movimientos.transferencia.store'));
    };

    // Filtrar destino para excluir el origen seleccionado (opcional, pero recomendable)
    const destinosFiltrados = almacenesDestino.filter(a => a.id.toString() !== data.almacen_origen_id);

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Nueva Transferencia" />
            <div className="space-y-4 px-2 py-2 sm:px-6">
                <Toast />

                <div className="flex items-center justify-between">
                    <h1 className="text-2xl font-bold text-foreground">Transferencia entre Almacenes</h1>
                    <Button variant="outline" size="sm" onClick={() => window.history.back()}>
                        <ArrowLeft className="mr-2 h-4 w-4" />
                        Volver
                    </Button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    <Card className="p-6">
                        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                            <FormSelect
                                id="almacen_origen_id"
                                label="Almacén Origen *"
                                value={data.almacen_origen_id}
                                onChange={(v) => {
                                    setData('almacen_origen_id', v);
                                    // Si el destino era igual, limpiar
                                    if (v === data.almacen_destino_id) setData('almacen_destino_id', '');
                                }}
                                options={almacenesOrigen.map(a => ({ value: a.id.toString(), label: a.nombre }))}
                                placeholder="Seleccione origen"
                                error={errors.almacen_origen_id}
                                required
                            />

                            <FormSelect
                                id="almacen_destino_id"
                                label="Almacén Destino *"
                                value={data.almacen_destino_id}
                                onChange={(v) => setData('almacen_destino_id', v)}
                                options={destinosFiltrados.map(a => ({ value: a.id.toString(), label: a.nombre }))}
                                placeholder="Seleccione destino"
                                error={errors.almacen_destino_id}
                                required
                                disabled={!data.almacen_origen_id}
                            />
                        </div>
                    </Card>

                    {/* Sección de detalles (igual que antes) */}
                    <Card className="p-6">
                        <div className="mb-4">
                            <h2 className="flex items-center text-base font-semibold text-foreground">
                                <div className="mr-2 h-1.5 w-1.5 rounded-full bg-green-500"></div>
                                Canastillos a transferir
                            </h2>
                        </div>

                        {data.detalles.length > 0 && (
                            <div className="mb-4 space-y-2">
                                {data.detalles.map((detalle, index) => {
                                    const canastillo = canastillos.find(c => c.id.toString() === detalle.canastillo_id);
                                    return (
                                        <div key={index} className="flex items-center justify-between rounded-md bg-muted/50 p-2">
                                            <div className="grid flex-1 grid-cols-2 gap-2">
                                                <span className="text-sm font-medium">{canastillo?.nombre || 'Desconocido'}</span>
                                                <span className="text-sm">Cantidad: {detalle.cantidad}</span>
                                            </div>
                                            <Button type="button" variant="ghost" size="icon" onClick={() => eliminarDetalle(index)} className="h-8 w-8 text-destructive">
                                                <Trash2 className="h-4 w-4" />
                                            </Button>
                                        </div>
                                    );
                                })}
                            </div>
                        )}

                        <div onKeyDown={handleDetailKeyDown}>
                            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3 items-end">
                                <FormSelect
                                    label="Canastillo"
                                    value={detalleActual.canastillo_id}
                                    onChange={(v) => setDetalleActual({ ...detalleActual, canastillo_id: v })}
                                    options={canastillos.map(c => ({ value: c.id.toString(), label: c.tamaño ? `${c.nombre} (${c.tamaño})` : c.nombre }))}
                                    placeholder="Seleccione canastillo"
                                />
                                <FormInput
                                    label="Cantidad"
                                    type="number"
                                    value={detalleActual.cantidad}
                                    onChange={(e) => setDetalleActual({ ...detalleActual, cantidad: e.target.value })}
                                    placeholder="0"
                                    min="1"
                                    step="1"
                                />
                                <Button type="button" onClick={agregarDetalle} variant="outline">
                                    <Plus className="mr-2 h-4 w-4" />
                                    Agregar canastillo
                                </Button>
                            </div>
                            {errors.detalles && <p className="mt-2 text-sm text-destructive">{errors.detalles}</p>}
                        </div>
                    </Card>

                    <Card className="p-6">
                        <FormInput
                            id="observaciones"
                            label="Observaciones"
                            value={data.observaciones}
                            onChange={(e) => setData('observaciones', e.target.value)}
                            error={errors.observaciones}
                            placeholder="Notas adicionales sobre la transferencia..."
                            textarea
                        />
                    </Card>

                    <div className="flex justify-end gap-3">
                        <Button type="button" variant="outline" onClick={() => window.history.back()}>Cancelar</Button>
                        <Button type="submit" disabled={processing}>
                            <Save className="mr-2 h-4 w-4" />
                            {processing ? 'Procesando...' : 'Realizar Transferencia'}
                        </Button>
                    </div>
                </form>
            </div>
        </AppLayout>
    );
}
