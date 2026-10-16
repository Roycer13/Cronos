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
    { title: 'Vendedores', href: '/canastillos/vendedores' },
    { title: 'Nuevo Vendedor', href: '/canastillos/vendedores/crear' },
];

export default function Crear() {
    const { props } = usePage();
    const { flash } = props as unknown as PageProps;

    const { data, setData, post, processing, errors } = useForm({
        nombre: '',
        apellido: '',
        codigo: '',
        telefono: '',
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        post(route('canastillos.vendedores.store'), {
            preserveScroll: true,
        });
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Nuevo Vendedor" />
            <div className="space-y-4 px-2 py-2 sm:px-6">
                <Toast />

                <div className="flex items-center justify-between">
                    <h1 className="text-2xl font-bold text-foreground">Crear Nuevo Vendedor</h1>
                    <Button variant="outline" size="sm" onClick={() => router.visit(route('canastillos.vendedores.index'))}>
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
                                placeholder="Ej: Juan"
                                required
                            />

                            <FormInput
                                id="apellido"
                                label="Apellido *"
                                value={data.apellido}
                                onChange={(e) => setData('apellido', e.target.value)}
                                error={errors.apellido}
                                placeholder="Ej: Pérez"
                                required
                            />

                            <FormInput
                                id="codigo"
                                label="Código"
                                value={data.codigo}
                                onChange={(e) => setData('codigo', e.target.value)}
                                error={errors.codigo}
                                placeholder="Ej: VEN001 (opcional)"
                            />

                            <FormInput
                                id="telefono"
                                label="Teléfono"
                                value={data.telefono}
                                onChange={(e) => setData('telefono', e.target.value)}
                                error={errors.telefono}
                                placeholder="Ej: 0987654321"
                            />
                        </div>

                        <div className="flex justify-end gap-3">
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => router.visit(route('canastillos.vendedores.index'))}
                            >
                                Cancelar
                            </Button>
                            <Button type="submit" disabled={processing}>
                                <Save className="mr-2 h-4 w-4" />
                                {processing ? 'Guardando...' : 'Guardar Vendedor'}
                            </Button>
                        </div>
                    </form>
                </Card>
            </div>
        </AppLayout>
    );
}
