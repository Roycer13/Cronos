import AppLayout from '@/layouts/app-layout';
import { Head, router, usePage } from '@inertiajs/react';
import { useState } from 'react';
import { route } from 'ziggy-js';

import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import FormSelect from '@/components/ui/form-select';
import MatrizFrecuencia from './components/MatrizFrecuencia';

export default function Create() {
    const { subareas } = usePage<any>().props;

    const [form, setForm] = useState<any>({
        nombre: '',
        old_subarea_id: '',
    });

    const submit = (e: any) => {
        e.preventDefault();
        router.post(route('old-items.store'), form);
    };

    return (
        <AppLayout>
            <Head title="Crear Item" />

            <form onSubmit={submit} className="p-4 space-y-4 max-w-5xl">

                <Input
                    placeholder="Nombre del item"
                    value={form.nombre}
                    onChange={(e) => setForm({ ...form, nombre: e.target.value })}
                />

                <FormSelect
                    value={form.old_subarea_id}
                    onChange={(v) => setForm({ ...form, old_subarea_id: v })}
                    options={subareas.map((s: any) => ({
                        value: s.id.toString(),
                        label: s.nombre
                    }))}
                />

                <MatrizFrecuencia form={form} setForm={setForm} />

                <Button type="submit">Guardar</Button>

            </form>
        </AppLayout>
    );
}