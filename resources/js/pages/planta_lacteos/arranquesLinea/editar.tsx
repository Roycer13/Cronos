import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import AppLayout from '@/layouts/app-layout';
import { Head, useForm } from '@inertiajs/react';
import { Trash2 } from 'lucide-react';
import { useState } from 'react';
import { route } from 'ziggy-js';

type Origen = { id: number; alias?: string; descripcion: string };
type Orp = {
    id: number;
    codigo: string;
    lote?: string | null;
    producto_terminado?: { nombre_sap?: string } | null;
};
type Detalle = { origen_id: string; tiempo: string; h202: boolean };
type DetalleOp = { numero: string; tipo: string };
type Arranque = {
    id: number;
    tiempo: string;
    observacion?: string | null;
    detalles: {
        origen_id: number;
        tiempo?: string | null;
        h202: boolean;
        origen?: Origen;
    }[];
    orps?: { orp_id: number; orp?: Orp }[];
};
type Props = {
    arranque: Arranque;
    origenes: Origen[];
    orps: Orp[];
    ops?: DetalleOp[];
};

const TIPOS_OP = [
    { titulo: 'Empaques', tipos: ['OP Empaque', 'Numero Empaque'] },
    { titulo: 'Bobinas', tipos: ['OP Bobina', 'Numero Bobina'] },
];
const breadcrumbs = [
    { title: 'Arranques de línea', href: '/arranques-linea' },
    { title: 'Editar', href: '' },
];
const toInputDateTime = (value?: string | null) =>
    value ? value.slice(0, 16).replace(' ', 'T') : '';

export default function Editar({ arranque, origenes, orps, ops = [] }: Props) {
    const { data, setData, post, processing, errors } = useForm({
        tiempo: arranque.tiempo.slice(0, 10),
        observacion: arranque.observacion || '',
        orps: (arranque.orps || []).map((detalle) => detalle.orp_id.toString()),
        detalles: arranque.detalles.map((detalle) => ({
            origen_id: detalle.origen_id.toString(),
            tiempo: toInputDateTime(detalle.tiempo),
            h202: Boolean(detalle.h202),
        })) as Detalle[],
        ops: ops.map((op) => ({
            numero: String(op.numero || ''),
            tipo: op.tipo || '',
        })),
        _method: 'put',
    });
    const [filtroOrp, setFiltroOrp] = useState('');
    const orpsFiltradas = orps.filter((orp) =>
        `${orp.codigo} ${orp.lote || ''} ${orp.producto_terminado?.nombre_sap || ''}`
            .toLowerCase()
            .includes(filtroOrp.toLowerCase()),
    );
    const agregarOp = (tipo: string) =>
        setData('ops', [...data.ops, { numero: '', tipo }]);
    const eliminarOp = (indice: number) =>
        setData(
            'ops',
            data.ops.filter((_, index) => index !== indice),
        );
    const actualizarOp = (indice: number, cambios: Partial<DetalleOp>) =>
        setData(
            'ops',
            data.ops.map((op, index) =>
                index === indice ? { ...op, ...cambios } : op,
            ),
        );
    const renderSeccionOp = (tipo: string) => (
        <section key={tipo} className="space-y-2 rounded-md border p-3">
            <div className="flex items-center justify-between gap-2">
                <h3 className="text-sm font-medium">{tipo}</h3>
                <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => agregarOp(tipo)}
                >
                    Añadir
                </Button>
            </div>
            {data.ops.map(
                (op, indice) =>
                    op.tipo === tipo && (
                        <div
                            key={indice}
                            className="flex flex-wrap items-end gap-3"
                        >
                            <div className="min-w-40 flex-1">
                                <label className="mb-1 block text-xs text-muted-foreground">
                                    Número
                                </label>
                                <Input
                                    value={op.numero}
                                    onChange={(event) =>
                                        actualizarOp(indice, {
                                            numero: event.target.value,
                                        })
                                    }
                                />
                            </div>
                            <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                onClick={() => eliminarOp(indice)}
                            >
                                <Trash2 className="mr-2 h-4 w-4" />
                                Quitar
                            </Button>
                        </div>
                    ),
            )}
            {!data.ops.some((op) => op.tipo === tipo) && (
                <p className="text-sm text-muted-foreground">
                    No hay números agregados.
                </p>
            )}
        </section>
    );
    const submit = (event: React.FormEvent) => {
        event.preventDefault();
        post(route('arranques-linea.update', arranque.id), {
            forceFormData: true,
        });
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Editar arranque de línea" />
            <div className="mx-auto max-w-3xl space-y-4 p-4">
                <div>
                    <h1 className="text-2xl font-bold">
                        Editar arranque de línea
                    </h1>
                    <p className="text-sm text-muted-foreground">
                        Actualiza la fecha, las ORP, las OP y la observación.
                    </p>
                </div>
                <form
                    onSubmit={submit}
                    className="space-y-6 rounded-lg border bg-card p-4 shadow-sm"
                >
                    <div>
                        <label
                            htmlFor="tiempo"
                            className="mb-1 block text-sm font-medium"
                        >
                            Fecha del arranque
                        </label>
                        <Input
                            id="tiempo"
                            type="date"
                            value={data.tiempo}
                            onChange={(event) =>
                                setData('tiempo', event.target.value)
                            }
                        />
                        {errors.tiempo && (
                            <p className="mt-1 text-xs text-red-600">
                                {errors.tiempo}
                            </p>
                        )}
                    </div>
                    <section className="space-y-3">
                        <div className="flex flex-wrap items-center justify-between gap-2">
                            <h2 className="font-semibold">ORP relacionadas</h2>
                            <Input
                                value={filtroOrp}
                                onChange={(event) =>
                                    setFiltroOrp(event.target.value)
                                }
                                placeholder="Filtrar ORP"
                            />
                        </div>
                        <div className="grid max-h-64 gap-2 overflow-y-auto rounded-md border p-3 sm:grid-cols-2">
                            {orpsFiltradas.map((orp) => (
                                <label
                                    key={orp.id}
                                    className="flex items-start gap-2 rounded-md border p-2 text-sm"
                                >
                                    <input
                                        type="checkbox"
                                        checked={data.orps.includes(
                                            orp.id.toString(),
                                        )}
                                        onChange={(event) =>
                                            setData(
                                                'orps',
                                                event.target.checked
                                                    ? [
                                                          ...data.orps,
                                                          orp.id.toString(),
                                                      ]
                                                    : data.orps.filter(
                                                          (id) =>
                                                              id !==
                                                              orp.id.toString(),
                                                      ),
                                            )
                                        }
                                    />
                                    <span>
                                        <strong>ORP-{orp.codigo}</strong>
                                        <br />
                                        <span className="text-xs text-muted-foreground">
                                            {orp.producto_terminado
                                                ?.nombre_sap || 'Sin producto'}
                                            {orp.lote
                                                ? ` | Lote ${orp.lote}`
                                                : ''}
                                        </span>
                                    </span>
                                </label>
                            ))}
                            {orpsFiltradas.length === 0 && (
                                <p className="text-sm text-muted-foreground">
                                    No hay ORP disponibles.
                                </p>
                            )}
                        </div>
                        {errors.orps && (
                            <p className="text-xs text-red-600">
                                {errors.orps}
                            </p>
                        )}
                    </section>
                    <div className="grid gap-4 md:grid-cols-2">
                        {TIPOS_OP.map((grupo) => (
                            <section
                                key={grupo.titulo}
                                className="space-y-3 rounded-md border p-3"
                            >
                                <h2 className="font-semibold">{grupo.titulo}</h2>
                                <div className="space-y-3">
                                    {grupo.tipos.map(renderSeccionOp)}
                                </div>
                            </section>
                        ))}
                    </div>
                    <div>
                        <label
                            htmlFor="observacion"
                            className="mb-1 block text-sm font-medium"
                        >
                            Observación
                        </label>
                        <textarea
                            id="observacion"
                            value={data.observacion}
                            onChange={(event) =>
                                setData('observacion', event.target.value)
                            }
                            className="min-h-24 w-full rounded-md border bg-background px-3 py-2 text-sm"
                        />
                    </div>
                    <div className="flex justify-end gap-2 border-t pt-4">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => window.history.back()}
                        >
                            Cancelar
                        </Button>
                        <Button type="submit" disabled={processing}>
                            {processing ? 'Guardando...' : 'Guardar cambios'}
                        </Button>
                    </div>
                </form>
            </div>
        </AppLayout>
    );
}
