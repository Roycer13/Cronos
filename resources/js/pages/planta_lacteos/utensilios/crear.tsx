import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, router, usePage } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { route } from 'ziggy-js';
import { useMemo, useState } from 'react';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Utensilios', href: '/planta-lacteos/utensilios' },
    { title: 'Crear revisión', href: '#' },
];

const getCurrentDateTime = () => {
    const now = new Date();
    const offset = now.getTimezoneOffset();
    const localDate = new Date(now.getTime() - offset * 60 * 1000);

    return localDate.toISOString().slice(0, 16);
};

interface UtensilioItem {
    id: number;
    nombre_utensilio: string | null;
    area: string | null;
    cargo: string | null;
    codigo: string | null;
    frecuencia: string | null;
    vigencia_utensilio: string | null;
    usuario?: string | null;
    tiene_codigo: boolean;
    buen_estado: boolean;
    observaciones: string;
}

interface PageProps {
    frecuencia: string;
    utensilios: UtensilioItem[];
}

export default function Crear() {
    const { props } = usePage<PageProps>();
    const { frecuencia, utensilios } = props;

    const initialItems = useMemo(
        () =>
            utensilios.map((utensilio) => ({
                ...utensilio,
                tiene_codigo: true,
                buen_estado: true,
            })),
        [utensilios],
    );

    const [items, setItems] = useState<UtensilioItem[]>(initialItems);
    const [saving, setSaving] = useState(false);
    const [tiempo, setTiempo] = useState(getCurrentDateTime);

    const handleToggle = (id: number, field: 'tiene_codigo' | 'buen_estado') => {
        setItems((current) =>
            current.map((item) =>
                item.id === id ? { ...item, [field]: !item[field] } : item,
            ),
        );
    };

    const handleObservacion = (id: number, value: string) => {
        setItems((current) =>
            current.map((item) =>
                item.id === id ? { ...item, observaciones: value } : item,
            ),
        );
    };

    const handleSubmit = () => {
        const payload = {
            tiempo,
            items: items.map((item) => ({
                detalle_utensilio_id: item.id,
                tiene_codigo: item.tiene_codigo,
                buen_estado: item.buen_estado,
                observaciones: item.observaciones ?? '',
            })),
        };

        setSaving(true);
        router.post(route('utensilios.store', { frecuencia }), payload, {
            onFinish: () => setSaving(false),
        });
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`Crear revisión ${frecuencia}`} />

            <div className="space-y-4 p-4">
                <div className="flex items-center justify-between gap-3">
                    <div>
                        <h1 className="text-2xl font-bold">
                            Crear revisión {frecuencia}
                        </h1>
                        <p className="text-sm text-muted-foreground">
                            Solo se muestran utensilios con vigencia vigente.
                        </p>
                    </div>
                </div>

                <div className="max-w-xs rounded-lg border bg-background p-3 shadow-sm">
                    <Label htmlFor="tiempo">Fecha y hora de la revisión</Label>
                    <Input
                        id="tiempo"
                        type="datetime-local"
                        value={tiempo}
                        onChange={(event) => setTiempo(event.target.value)}
                        className="mt-1"
                    />
                </div>

                {items.length === 0 ? (
                    <div className="rounded-lg border border-dashed bg-muted/30 p-8 text-center text-muted-foreground">
                        No hay utensilios vigentes para esta frecuencia.
                    </div>
                ) : (
                    <div className="space-y-3">
                        {items.map((item) => (
                            <div
                                key={item.id}
                                className="rounded-lg border bg-background p-3 shadow-sm"
                            >
                                <div className="grid gap-3 md:grid-cols-7 xl:grid-cols-8">
                                    <div className="rounded-md bg-muted/40 p-2">
                                        <div className="text-[10px] font-medium uppercase tracking-wide text-muted-foreground">
                                            Utensilio
                                        </div>
                                        <div className="mt-1 text-sm font-medium">
                                            {item.nombre_utensilio ?? '—'}
                                        </div>
                                    </div>

                                    <div className="rounded-md bg-muted/40 p-2">
                                        <div className="text-[10px] font-medium uppercase tracking-wide text-muted-foreground">
                                            Área
                                        </div>
                                        <div className="mt-1 text-sm">
                                            {item.area ?? '—'}
                                        </div>
                                    </div>

                                    <div className="rounded-md bg-muted/40 p-2">
                                        <div className="text-[10px] font-medium uppercase tracking-wide text-muted-foreground">
                                            Cargo
                                        </div>
                                        <div className="mt-1 text-sm">
                                            {item.cargo ?? '—'}
                                        </div>
                                    </div>

                                    <div className="rounded-md bg-muted/40 p-2">
                                        <div className="text-[10px] font-medium uppercase tracking-wide text-muted-foreground">
                                            Código
                                        </div>
                                        <div className="mt-1 text-sm">
                                            {item.codigo ?? '—'}
                                        </div>
                                    </div>

                                    {item.usuario && (
                                        <div className="rounded-md bg-muted/40 p-2">
                                            <div className="text-[10px] font-medium uppercase tracking-wide text-muted-foreground">
                                                Usuario
                                            </div>
                                            <div className="mt-1 text-sm">
                                                {item.usuario}
                                            </div>
                                        </div>
                                    )}

                                    <div className="flex items-center gap-2 rounded-md border border-dashed bg-background p-2">
                                        <Checkbox
                                            checked={item.tiene_codigo}
                                            onCheckedChange={() =>
                                                handleToggle(item.id, 'tiene_codigo')
                                            }
                                        />
                                        <span className="text-sm">Tiene código</span>
                                    </div>

                                    <div className="flex items-center gap-2 rounded-md border border-dashed bg-background p-2">
                                        <Checkbox
                                            checked={item.buen_estado}
                                            onCheckedChange={() =>
                                                handleToggle(item.id, 'buen_estado')
                                            }
                                        />
                                        <span className="text-sm">Buen estado</span>
                                    </div>
                                </div>

                                <div className="mt-3">
                                    <Label>Observaciones</Label>
                                    <Textarea
                                        value={item.observaciones ?? ''}
                                        onChange={(e) =>
                                            handleObservacion(item.id, e.target.value)
                                        }
                                        placeholder="Ingrese observaciones si corresponde"
                                        className="mt-1 min-h-[80px]"
                                    />
                                </div>
                            </div>
                        ))}

                        <div className="flex justify-end">
                            <Button onClick={handleSubmit} disabled={saving}>
                                {saving ? 'Guardando...' : `Guardar lote ${frecuencia}`}
                            </Button>
                        </div>
                    </div>
                )}
            </div>
        </AppLayout>
    );
}
