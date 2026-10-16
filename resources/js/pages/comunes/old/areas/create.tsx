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
    ubicaciones: { id: number; nombre: string }[];
    flash: any;
}

export default function Create() {
    const { ubicaciones } = usePage<PageProps>().props;

    const [form, setForm] = useState({
        nombre: '',
        ubicacion_id: '',
        descripcion: ''
    });

    const handleSubmit = (e: any) => {
        e.preventDefault();

        router.post(route('old-areas.store'), form);
    };

    return (
        <AppLayout>
            <Head title="Crear Área" />

            <div className="p-4 space-y-4">

                <div className="flex items-center gap-2">
                    <Link href={route('old-areas.index')}>
                        <Button variant="outline" size="sm">
                            <ArrowLeft className="h-4 w-4" />
                        </Button>
                    </Link>
                    <h1 className="text-xl font-bold">Nueva Área</h1>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4 max-w-xl">

                    <Input
                        placeholder="Nombre"
                        value={form.nombre}
                        onChange={(e) => setForm({ ...form, nombre: e.target.value })}
                    />

                    <FormSelect
                        label="Ubicación"
                        value={form.ubicacion_id}
                        onChange={(v) => setForm({ ...form, ubicacion_id: v })}
                        options={ubicaciones.map(u => ({
                            value: u.id.toString(),
                            label: u.nombre
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