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
    subarea: any;
    areas: any[];
}

export default function Edit() {
    const { subarea, areas } = usePage<PageProps>().props;

    const [form, setForm] = useState({
        nombre: subarea.nombre || '',
        old_area_id: subarea.old_area_id?.toString() || '',
        descripcion: subarea.descripcion || ''
    });

    const handleSubmit = (e: any) => {
        e.preventDefault();
        router.put(route('old-subareas.update', subarea.id), form);
    };

    return (
        <AppLayout>
            <Head title="Editar Subárea" />

            <div className="p-4 space-y-4">

                <div className="flex items-center gap-2">
                    <Link href={route('old-subareas.index')}>
                        <Button variant="outline" size="sm">
                            <ArrowLeft className="h-4 w-4" />
                        </Button>
                    </Link>
                    <h1 className="text-xl font-bold">Editar Subárea</h1>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4 max-w-xl">

                    <Input
                        value={form.nombre}
                        onChange={(e) => setForm({ ...form, nombre: e.target.value })}
                    />

                    <FormSelect
                        label="Área"
                        value={form.old_area_id}
                        onChange={(v) => setForm({ ...form, old_area_id: v })}
                        options={areas.map((a: any) => ({
                            value: a.id.toString(),
                            label: a.nombre
                        }))}
                    />

                    <Textarea
                        value={form.descripcion}
                        onChange={(e) => setForm({ ...form, descripcion: e.target.value })}
                    />

                    <Button type="submit">Actualizar</Button>

                </form>
            </div>
        </AppLayout>
    );
}