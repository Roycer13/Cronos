import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import AppLayout from '@/layouts/app-layout';
import { Head, useForm } from '@inertiajs/react';
import { route } from 'ziggy-js';

type Origen = { id: number; alias?: string; descripcion: string };
type Detalle = { origen_id: string; tiempo: string; h202: boolean };
type Arranque = { id: number; tiempo: string };
type Props = { arranque: Arranque; origenes: Origen[]; numero: number };

const breadcrumbs = [
    { title: 'Arranques de línea', href: '/arranques-linea' },
    { title: 'Añadir tanda', href: '' },
];

export default function CrearDetalles({ arranque, origenes, numero }: Props) {
    const fecha = arranque.tiempo.slice(0, 10);
    const { data, setData, post, processing, errors } = useForm({
        tiempo: fecha,
        detalles: origenes.map((origen) => ({
            origen_id: origen.id.toString(),
            tiempo: `${fecha}T00:00`,
            h202: false,
        })) as Detalle[],
    });

    const actualizarDetalle = (origenId: string, cambios: Partial<Detalle>) => {
        setData('detalles', data.detalles.map((detalle) => detalle.origen_id === origenId ? { ...detalle, ...cambios } : detalle));
    };

    const submit = (event: React.FormEvent) => {
        event.preventDefault();
        post(route('arranques-linea.detalles.store', arranque.id));
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`Añadir tanda ${numero}`} />
            <div className="mx-auto max-w-3xl space-y-4 p-4">
                <div>
                    <h1 className="text-2xl font-bold">Añadir tanda {numero}</h1>
                    <p className="text-sm text-muted-foreground">Registra únicamente las horas de esta nueva tanda.</p>
                </div>
                <form onSubmit={submit} className="space-y-4 rounded-lg border bg-card p-4 shadow-sm">
                    <div className="space-y-3">
                        {data.detalles.map((detalle) => {
                            const origen = origenes.find((item) => item.id.toString() === detalle.origen_id);
                            if (!origen) return null;
                            return (
                                <div key={detalle.origen_id} className="flex flex-wrap items-end gap-3 rounded-md border p-3">
                                    <div className="min-w-52 flex-1">
                                        <p className="font-medium">{origen.descripcion}</p>
                                        <p className="text-xs text-muted-foreground">{origen.alias || 'Sin alias'}</p>
                                    </div>
                                    <div>
                                        <label className="mb-1 block text-xs text-muted-foreground">Hora del detalle</label>
                                        <Input type="datetime-local" value={detalle.tiempo} onChange={(event) => actualizarDetalle(detalle.origen_id, { tiempo: event.target.value })} />
                                    </div>
                                    <label className="flex items-center gap-2 pb-2 text-sm"><input type="checkbox" checked={detalle.h202} onChange={(event) => actualizarDetalle(detalle.origen_id, { h202: event.target.checked })} /> H202</label>
                                </div>
                            );
                        })}
                    </div>
                    {errors.detalles && <p className="text-xs text-red-600">{errors.detalles}</p>}
                    <div className="flex justify-end gap-2 border-t pt-4">
                        <Button type="button" variant="outline" onClick={() => window.history.back()}>Cancelar</Button>
                        <Button type="submit" disabled={processing}>{processing ? 'Guardando...' : 'Guardar tanda'}</Button>
                    </div>
                </form>
            </div>
        </AppLayout>
    );
}
