import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import FormInput from '@/components/ui/form-input';
import { Toast } from '@/components/ui/toast';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, router, useForm, usePage } from '@inertiajs/react';
import { ArrowLeft, Save } from 'lucide-react';
import { route } from 'ziggy-js';

interface PageProps {
    flash: {
        success?: string;
        error?: string;
    };
}

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Canastillos', href: '/canastillos/canastillos' },
    { title: 'Nuevo Canastillo', href: '/canastillos/canastillos/crear' },
];

export default function Crear() {
    const { props } = usePage();
    const { flash } = props as unknown as PageProps;

    const { data, setData, post, processing, errors } = useForm({
        nombre: '',
        alias: '',
        tamaño: '',
        precio: '',
        color: '',
        detalle: '',
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        post(route('canastillos.canastillos.store'), {
            preserveScroll: true,
        });
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Nuevo Canastillo" />
            <div className="space-y-4 px-2 py-2 sm:px-6">
                <Toast />

                <div className="flex items-center justify-between">
                    <h1 className="text-2xl font-bold text-foreground">Crear Nuevo Canastillo</h1>
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
                                placeholder="Ej: Pequeño, Mediano, Grande"
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
                                placeholder="0.00"
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
                                {processing ? 'Guardando...' : 'Guardar Canastillo'}
                            </Button>
                        </div>
                    </form>
                </Card>
            </div>
        </AppLayout>
    );
}
