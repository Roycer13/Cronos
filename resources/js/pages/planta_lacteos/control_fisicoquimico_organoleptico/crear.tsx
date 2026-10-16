import AppLayout from '@/layouts/app-layout';
import { Head, router } from '@inertiajs/react';
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
        ph_pozo: '',
        dureza_pozo: '',
        conductividad_pozo: '',
        ph_etap: '',
        dureza_etap: '',
        cloruros_etap: '',
        conductividad_etap: '',
        color: 'normal',
        olor: 'normal',
        sabor: 'normal',
        aspecto: 'normal',
        observaciones: '',
    };
};

export default function Crear() {
    const [form, setForm] = useState(getDefaultForm);

    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        router.post(route('control-fisicoquimico-organoleptico.store'), form);
    };

    return (
        <AppLayout>
            <Head title="Nuevo registro" />
            <div className="mx-auto max-w-5xl space-y-6 p-6">
                <div>
                    <h1 className="text-2xl font-semibold">Crear registro</h1>
                    <p className="text-sm text-muted-foreground">Complete los valores del control fisicoquímico y organoléptico.</p>
                </div>

                <form onSubmit={submit} className="space-y-4 rounded-lg border bg-white p-6 shadow-sm">
                    <div>
                        <Label>Tiempo</Label>
                        <Input type="datetime-local" value={form.tiempo} onChange={(e) => setForm({ ...form, tiempo: e.target.value })} required />
                    </div>

                    <div className="grid gap-4 md:grid-cols-2">
                        <div>
                            <Label>pH Pozo</Label>
                            <Input type="number" step="0.00001" value={form.ph_pozo} onChange={(e) => setForm({ ...form, ph_pozo: e.target.value })} />
                        </div>
                        <div>
                            <Label>Dureza Pozo</Label>
                            <Input type="number" step="0.00001" value={form.dureza_pozo} onChange={(e) => setForm({ ...form, dureza_pozo: e.target.value })} />
                        </div>
                        <div>
                            <Label>Conductividad Pozo</Label>
                            <Input type="number" step="0.00001" value={form.conductividad_pozo} onChange={(e) => setForm({ ...form, conductividad_pozo: e.target.value })} />
                        </div>
                        <div>
                            <Label>pH Etap</Label>
                            <Input type="number" step="0.00001" value={form.ph_etap} onChange={(e) => setForm({ ...form, ph_etap: e.target.value })} />
                        </div>
                        <div>
                            <Label>Dureza Etap</Label>
                            <Input type="number" step="0.00001" value={form.dureza_etap} onChange={(e) => setForm({ ...form, dureza_etap: e.target.value })} />
                        </div>
                        <div>
                            <Label>Cloruros Etap</Label>
                            <Input type="number" step="0.00001" value={form.cloruros_etap} onChange={(e) => setForm({ ...form, cloruros_etap: e.target.value })} />
                        </div>
                        <div>
                            <Label>Conductividad Etap</Label>
                            <Input type="number" step="0.00001" value={form.conductividad_etap} onChange={(e) => setForm({ ...form, conductividad_etap: e.target.value })} />
                        </div>
                    </div>

                    <div className="grid gap-4 md:grid-cols-2">
                        <div>
                            <Label>Color</Label>
                            <select className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm" value={form.color} onChange={(e) => setForm({ ...form, color: e.target.value })}>
                                <option value="normal">Normal</option>
                                <option value="ligero">Ligero</option>
                                <option value="medio">Medio</option>
                                <option value="fuerte">Fuerte</option>
                            </select>
                        </div>
                        <div>
                            <Label>Olor</Label>
                            <select className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm" value={form.olor} onChange={(e) => setForm({ ...form, olor: e.target.value })}>
                                <option value="normal">Normal</option>
                                <option value="anormal">Anormal</option>
                            </select>
                        </div>
                        <div>
                            <Label>Sabor</Label>
                            <select className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm" value={form.sabor} onChange={(e) => setForm({ ...form, sabor: e.target.value })}>
                                <option value="normal">Normal</option>
                                <option value="anormal">Anormal</option>
                            </select>
                        </div>
                        <div>
                            <Label>Aspecto</Label>
                            <select className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm" value={form.aspecto} onChange={(e) => setForm({ ...form, aspecto: e.target.value })}>
                                <option value="normal">Normal</option>
                                <option value="anormal">Anormal</option>
                            </select>
                        </div>
                    </div>

                    <div>
                        <Label>Observaciones</Label>
                        <textarea className="flex min-h-[100px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm" value={form.observaciones} onChange={(e) => setForm({ ...form, observaciones: e.target.value })} />
                    </div>

                    <div className="flex gap-2">
                        <Button type="submit">Guardar</Button>
                        <Button type="button" variant="outline" onClick={() => router.get(route('control-fisicoquimico-organoleptico.index'))}>Cancelar</Button>
                    </div>
                </form>
            </div>
        </AppLayout>
    );
}
