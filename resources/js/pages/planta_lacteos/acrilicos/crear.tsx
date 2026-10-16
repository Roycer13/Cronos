import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, router, usePage } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { route } from 'ziggy-js';
import { useMemo, useState } from 'react';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Acrílicos', href: '/planta-lacteos/acrilicos' },
    { title: 'Crear revisión', href: '#' },
];

const getCurrentDateTime = () => {
    const now = new Date();
    const offset = now.getTimezoneOffset();
    const localDate = new Date(now.getTime() - offset * 60 * 1000);

    return localDate.toISOString().slice(0, 16);
};

interface AcrilicoItem {
    id: number;
    codigo: string | null;
    area: string | null;
    cantidad_vidrios: number | null;
    cantidad_luminarias: number | null;
    frecuencia: string | null;
    usuario?: string | null;
    integridad_vidrios: boolean;
    integridad_luminarias: boolean;
    informado: boolean;
    observaciones: string;
}

interface PageProps {
    frecuencia: string;
    acrilicos: AcrilicoItem[];
}

export default function Crear() {
    const { props } = usePage<PageProps>();
    const { frecuencia, acrilicos } = props;
    const [items, setItems] = useState<AcrilicoItem[]>(useMemo(() => acrilicos, [acrilicos]));
    const [saving, setSaving] = useState(false);
    const [tiempo, setTiempo] = useState(getCurrentDateTime);

    const handleToggle = (id: number, field: 'integridad_vidrios' | 'integridad_luminarias' | 'informado') => {
        setItems((current) => current.map((item) => item.id === id ? { ...item, [field]: !item[field] } : item));
    };

    const handleObservacion = (id: number, value: string) => {
        setItems((current) => current.map((item) => item.id === id ? { ...item, observaciones: value } : item));
    };

    const handleSubmit = () => {
        setSaving(true);
        router.post(route('acrilicos.store', { frecuencia }), {
            tiempo,
            items: items.map((item) => ({
                detalle_acrilico_id: item.id,
                integridad_vidrios: item.integridad_vidrios,
                integridad_luminarias: item.integridad_luminarias,
                informado: item.informado,
                observaciones: item.observaciones ?? '',
            })),
        }, { onFinish: () => setSaving(false) });
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`Crear revisión de acrílicos ${frecuencia}`} />
            <div className="space-y-4 p-4">
                <div>
                    <h1 className="text-2xl font-bold">Crear revisión {frecuencia}</h1>
                    <p className="text-sm text-muted-foreground">Solo se muestran acrílicos vigentes para esta frecuencia.</p>
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
                        No hay acrílicos vigentes para esta frecuencia.
                    </div>
                ) : (
                    <div className="space-y-3">
                        {items.map((item) => (
                            <div key={item.id} className="rounded-lg border bg-background p-3 shadow-sm">
                                <div className="grid gap-2 sm:grid-cols-2 md:grid-cols-4 xl:grid-cols-7">
                                    {[
                                        ['Código', item.codigo],
                                        ['Área', item.area],
                                        ['Vidrios', item.cantidad_vidrios],
                                        ['Luminarias', item.cantidad_luminarias],
                                        ['Usuario', item.usuario],
                                    ].map(([label, value]) => value !== null && value !== undefined && value !== '' && (
                                        <div key={label} className="rounded-md bg-muted/40 p-2">
                                            <div className="text-[10px] font-medium uppercase tracking-wide text-muted-foreground">{label}</div>
                                            <div className="mt-1 text-sm">{value}</div>
                                        </div>
                                    ))}
                                    <label className="flex items-center gap-2 rounded-md border border-dashed p-2 text-sm">
                                        <Checkbox checked={item.integridad_vidrios} onCheckedChange={() => handleToggle(item.id, 'integridad_vidrios')} />
                                        Vidrios íntegros
                                    </label>
                                    <label className="flex items-center gap-2 rounded-md border border-dashed p-2 text-sm">
                                        <Checkbox checked={item.integridad_luminarias} onCheckedChange={() => handleToggle(item.id, 'integridad_luminarias')} />
                                        Luminarias íntegras
                                    </label>
                                    <label className="flex items-center gap-2 rounded-md border border-dashed p-2 text-sm">
                                        <Checkbox checked={item.informado} onCheckedChange={() => handleToggle(item.id, 'informado')} />
                                        Informado
                                    </label>
                                </div>
                                <div className="mt-3">
                                    <Label>Observaciones</Label>
                                    <Textarea className="mt-1 min-h-[70px]" value={item.observaciones ?? ''} onChange={(event) => handleObservacion(item.id, event.target.value)} placeholder="Ingrese observaciones si corresponde" />
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
