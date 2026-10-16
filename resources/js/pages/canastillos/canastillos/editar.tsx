import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import FormInput from '@/components/ui/form-input';
import { Toast } from '@/components/ui/toast';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, router, useForm, usePage } from '@inertiajs/react';
import { ArrowLeft, Save } from 'lucide-react';
import { route } from 'ziggy-js';

interface Canastillo {
    id: number;
    nombre: string;
    alias: string | null;
    tamaño: string | null;
    precio: number | null;
    color: string | null;
    detalle: string | null;
}

interface PageProps {
    canastillo: Canastillo;
    flash: {
        success?: string;
        error?: string;
    };
}

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Canastillos', href: '/canastillos/canastillos' },
    { title: 'Editar Canastillo', href: '/canastillos/canastillos/editar' },
];

export default function Editar() {
    const { props } = usePage();
    const { canastillo, flash } = props as unknown as PageProps;

    const { data, setData, put, processing, errors } = useForm({
        nombre: canastillo.nombre || '',
        alias: canastillo.alias || '',
        tamaño: canastillo.tamaño || '',
        precio: canastillo.precio?.toString() || '',
        color: canastillo.color || '',
        detalle: canastillo.detalle || '',
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        put(route('canastillos.canastillos.update', canastillo.id), {
            preserveScroll: true,
        });
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Editar Canastillo" />
            <div className="space-y-4 px-2 py-2 sm:px-6">
                <Toast />

                <div className="flex items-center justify-between">
                    <h1 className="text-2xl font-bold text-foreground">Editar Canastillo</h1>
                    <Button variant="outline" size="sm" onClick={() => router.visit(route('canastillos.canastillos.index'))}>
                        <ArrowLeft className="mr-2 h-4 w-4" />
                        Volver
                    </Button>
                </div>

                <Card className="p-6">
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                            <FormInput
                                id="nombre"
                                label="Nombre *"
                                value={data.nombre}
                                onChange={(e) => setData('nombre', e.target.value)}
                                error={errors.nombre}
                                required
                            />

                            <FormInput
                                id="alias"
                                label="Alias"
                                value={data.alias}
                                onChange={(e) => setData('alias', e.target.value)}
                                error={errors.alias}
                            />

                            <FormInput
                                id="tamaño"
                                label="Tamaño"
                                value={data.tamaño}
                                onChange={(e) => setData('tamaño', e.target.value)}
                                error={errors.tamaño}
                            />

                            <FormInput
                                id="precio"
                                label="Precio"
                                type="number"
                                step="0.01"
                                min="0"
                                value={data.precio}
                                onChange={(e) => setData('precio', e.target.value)}
                                error={errors.precio}
                            />

                            <FormInput
                                id="color"
                                label="Color"
                                type="color"
                                value={data.color}
                                onChange={(e) => setData('color', e.target.value)}
                                error={errors.color}
                                className="h-10 w-full"
                            />

                            <FormInput
                                id="detalle"
                                label="Detalle"
                                value={data.detalle}
                                onChange={(e) => setData('detalle', e.target.value)}
                                error={errors.detalle}
                            />
                        </div>

                        <div className="flex justify-end gap-3">
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => router.visit(route('canastillos.canastillos.index'))}
                            >
                                Cancelar
                            </Button>
                            <Button type="submit" disabled={processing}>
                                <Save className="mr-2 h-4 w-4" />
                                {processing ? 'Actualizando...' : 'Actualizar Canastillo'}
                            </Button>
                        </div>
                    </form>
                </Card>
            </div>
        </AppLayout>
    );
}
