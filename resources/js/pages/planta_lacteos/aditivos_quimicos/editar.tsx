import AppLayout from '@/layouts/app-layout';
import { Head, router, usePage } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { route } from 'ziggy-js';
import { useState } from 'react';

const getDefaultForm = () => {
    const now = new Date();
    const offset = now.getTimezoneOffset();
    const localDate = new Date(now.getTime() - offset * 60 * 1000);

    return {
        tiempo: localDate.toISOString().slice(0, 16),
        wet_boil_101: '11.4',
        wet_boil_201: '5',
        wet_boil_402: '8',
        wet_boil_801: '1',
        soda_caustica: '',
    };
};

export default function Editar() {
    const { props } = usePage<any>();
    const aditivoQuimico = props.aditivoQuimico;
    const [form, setForm] = useState({
        tiempo: aditivoQuimico?.tiempo ? aditivoQuimico.tiempo.slice(0, 16) : getDefaultForm().tiempo,
        wet_boil_101: aditivoQuimico?.wet_boil_101 ?? getDefaultForm().wet_boil_101,
        wet_boil_201: aditivoQuimico?.wet_boil_201 ?? getDefaultForm().wet_boil_201,
        wet_boil_402: aditivoQuimico?.wet_boil_402 ?? getDefaultForm().wet_boil_402,
        wet_boil_801: aditivoQuimico?.wet_boil_801 ?? getDefaultForm().wet_boil_801,
        soda_caustica: aditivoQuimico?.soda_caustica ?? getDefaultForm().soda_caustica,
    });

    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        router.put(route('aditivos-quimicos.update', aditivoQuimico.id), form);
    };

    return (
        <AppLayout>
            <Head title="Editar registro de aditivos" />
            <div className="mx-auto max-w-3xl space-y-6 p-6">
                <div>
                    <h1 className="text-2xl font-semibold">Editar registro</h1>
                </div>

                <form onSubmit={submit} className="space-y-4 rounded-lg border bg-white p-6 shadow-sm">
                    <div>
                        <Label>Tiempo</Label>
                        <Input type="datetime-local" value={form.tiempo} onChange={(e) => setForm({ ...form, tiempo: e.target.value })} required />
                    </div>
                    <div className="grid gap-4 md:grid-cols-2">
                        <div>
                            <Label>Wet Boil 101</Label>
                            <Input type="number" step="0.00001" value={form.wet_boil_101} onChange={(e) => setForm({ ...form, wet_boil_101: e.target.value })} />
                        </div>
                        <div>
                            <Label>Wet Boil 201</Label>
                            <Input type="number" step="0.00001" value={form.wet_boil_201} onChange={(e) => setForm({ ...form, wet_boil_201: e.target.value })} />
                        </div>
                        <div>
                            <Label>Wet Boil 402</Label>
                            <Input type="number" step="0.00001" value={form.wet_boil_402} onChange={(e) => setForm({ ...form, wet_boil_402: e.target.value })} />
                        </div>
                        <div>
                            <Label>Wet Boil 801</Label>
                            <Input type="number" step="0.00001" value={form.wet_boil_801} onChange={(e) => setForm({ ...form, wet_boil_801: e.target.value })} />
                        </div>
                    </div>
                    <div>
                        <Label>Soda Cáustica</Label>
                        <Input type="number" step="0.00001" value={form.soda_caustica} onChange={(e) => setForm({ ...form, soda_caustica: e.target.value })} />
                    </div>
                    <div className="flex gap-2">
                        <Button type="submit">Actualizar</Button>
                        <Button type="button" variant="outline" onClick={() => router.get(route('aditivos-quimicos.index'))}>Cancelar</Button>
                    </div>
                </form>
            </div>
        </AppLayout>
    );
}
