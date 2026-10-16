import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import AppLayout from '@/layouts/app-layout';
import { Head, useForm } from '@inertiajs/react';
import { Plus, Trash2 } from 'lucide-react';
import { route } from 'ziggy-js';

type Origen = { id: number; alias?: string; descripcion: string };
type Detalle = { origen_id: number | string; tiempo?: string | null; h202: boolean; origen?: Origen };
type Arranque = { id: number; tiempo: string; detalles: Detalle[] };
type Props = { arranque: Arranque; origenes: Origen[]; numero: number };

const breadcrumbs = [
    { title: 'Arranques de línea', href: '/arranques-linea' },
    { title: 'Editar horas', href: '' },
];

const toInputDateTime = (value?: string | null) => value ? value.slice(0, 16).replace(' ', 'T') : '';

export default function EditarDetalles({ arranque, origenes, numero }: Props) {
    const { data, setData, put, processing, errors } = useForm({
        detalles: arranque.detalles.map((detalle) => ({
            origen_id: Number(detalle.origen_id),
            tiempo: toInputDateTime(detalle.tiempo),
            h202: Boolean(detalle.h202),
        })),
    });

    const actualizarHora = (origenId: number, tiempo: string) => {
        setData('detalles', data.detalles.map((detalle) => detalle.origen_id === origenId ? { ...detalle, tiempo } : detalle));
    };

    const actualizarH202 = (origenId: number, h202: boolean) => {
        setData('detalles', data.detalles.map((detalle) => detalle.origen_id === origenId ? { ...detalle, h202 } : detalle));
    };

    const quitarOrigen = (origenId: number) => {
        if (data.detalles.length <= 1) return;
        setData('detalles', data.detalles.filter((detalle) => detalle.origen_id !== origenId));
    };

    const agregarOrigen = (origen: Origen) => {
        setData('detalles', [...data.detalles, { origen_id: origen.id, tiempo: '', h202: false }]);
    };

    const origenesDisponibles = origenes.filter((origen) =>
        !data.detalles.some((detalle) => Number(detalle.origen_id) === Number(origen.id)),
    );

    const submit = (event: React.FormEvent) => {
        event.preventDefault();
        put(route('arranques-linea.detalles.update', { arranqueLinea: arranque.id, numero }));
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`Editar horas, lote ${numero}`} />
            <div className="mx-auto max-w-3xl space-y-4 p-4">
                <div>
                    <h1 className="text-2xl font-bold">Editar horas, lote {numero}</h1>
                    <p className="text-sm text-muted-foreground">Actualiza únicamente las horas de esta tanda.</p>
                </div>
                <form onSubmit={submit} className="space-y-4 rounded-lg border bg-card p-4 shadow-sm">
                    <div className="space-y-3">
                        {data.detalles.map((detalle) => {
                            const origen = origenes.find((item) => Number(item.id) === Number(detalle.origen_id));
                            if (!origen) return null;
                            return (
                                <div key={detalle.origen_id} className="flex flex-wrap items-end gap-3 rounded-md border p-3">
                                    <div className="min-w-52 flex-1">
                                        <p className="font-medium">{origen.descripcion}</p>
                                        <p className="text-xs text-muted-foreground">{origen.alias || 'Sin alias'}</p>
                                    </div>
                                    <div>
                                        <label className="mb-1 block text-xs text-muted-foreground">Hora del detalle</label>
                                        <Input type="datetime-local" value={detalle.tiempo || ''} onChange={(event) => actualizarHora(detalle.origen_id, event.target.value)} />
                                    </div>
                                    <label className="flex items-center gap-2 pb-2 text-sm">
                                        <input type="checkbox" checked={detalle.h202} onChange={(event) => actualizarH202(detalle.origen_id, event.target.checked)} />
                                        H202
                                    </label>
                                    <Button type="button" variant="ghost" size="sm" onClick={() => quitarOrigen(Number(detalle.origen_id))} disabled={data.detalles.length <= 1}>
                                        <Trash2 className="mr-2 h-4 w-4" />Quitar
                                    </Button>
                                </div>
                            );
                        })}
                    </div>
                    <div className="rounded-md border border-dashed p-3">
                        <p className="mb-2 text-sm font-medium">Agregar origen</p>
                        <div className="flex flex-wrap gap-2">
                            {origenesDisponibles.map((origen) => (
                                <Button key={origen.id} type="button" variant="outline" size="sm" onClick={() => agregarOrigen(origen)}>
                                    <Plus className="mr-1 h-4 w-4" />{origen.descripcion}
                                </Button>
                            ))}
                            {origenesDisponibles.length === 0 && <p className="text-sm text-muted-foreground">Todos los orígenes están agregados.</p>}
                        </div>
                    </div>
                    {errors.detalles && <p className="text-xs text-red-600">{errors.detalles}</p>}
                    <div className="flex justify-end gap-2 border-t pt-4">
                        <Button type="button" variant="outline" onClick={() => window.history.back()}>Cancelar</Button>
                        <Button type="submit" disabled={processing}>{processing ? 'Guardando...' : 'Guardar horas'}</Button>
                    </div>
                </form>
            </div>
        </AppLayout>
    );
}
