import AppLayout from '@/layouts/app-layout';
import { Head, router, usePage, Link } from '@inertiajs/react';
import { useState } from 'react';
import { route } from 'ziggy-js';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import FormSelect from '@/components/ui/form-select';

import { ArrowLeft } from 'lucide-react';

interface PageProps {
    areas: { id: number; nombre: string }[];
}

export default function Create() {
    const { areas } = usePage<PageProps>().props;

    const [form, setForm] = useState({
        nombre: '',
        old_area_id: '',
        descripcion: ''
    });

    const handleSubmit = (e: any) => {
        e.preventDefault();
        router.post(route('old-subareas.store'), form);
    };

    return (
        <AppLayout>
            <Head title="Crear Subárea" />

            <div className="p-4 space-y-4">

                <div className="flex items-center gap-2">
                    <Link href={route('old-subareas.index')}>
                        <Button variant="outline" size="sm">
                            <ArrowLeft className="h-4 w-4" />
                        </Button>
                    </Link>
                    <h1 className="text-xl font-bold">Nueva Subárea</h1>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4 max-w-xl">

                    <Input
                        placeholder="Nombre"
                        value={form.nombre}
                        onChange={(e) => setForm({ ...form, nombre: e.target.value })}
                    />

                    <FormSelect
                        label="Área"
                        value={form.old_area_id}
                        onChange={(v) => setForm({ ...form, old_area_id: v })}
                        options={areas.map(a => ({
                            value: a.id.toString(),
                            label: a.nombre
                        }))}
                    />

                    <Textarea
                        placeholder="Descripción"
                        value={form.descripcion}
                        onChange={(e) => setForm({ ...form, descripcion: e.target.value })}
                    />

                    <Button type="submit">Guardar</Button>

                </form>
            </div>
        </AppLayout>
    );
}