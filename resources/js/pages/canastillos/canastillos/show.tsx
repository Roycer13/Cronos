import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Toast } from '@/components/ui/toast';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, router, usePage } from '@inertiajs/react';
import { ArrowLeft, Edit } from 'lucide-react';
import { route } from 'ziggy-js';

interface Canastillo {
    id: number;
    nombre: string;
    alias: string | null;
    tamaño: string | null;
    precio: number | null;
    color: string | null;
    detalle: string | null;
    created_at: string;
    updated_at: string;
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
    { title: 'Detalle de Canastillo', href: '/canastillos/canastillos/show' },
];

export default function Show() {
    const { props } = usePage();
    const { canastillo, flash } = props as unknown as PageProps;

    const formatDate = (date: string) => {
        return new Date(date).toLocaleDateString('es-ES', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        });
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`Canastillo: ${canastillo.nombre}`} />
            <div className="space-y-4 px-2 py-2 sm:px-6">
                <Toast />

                <div className="flex items-center justify-between">
                    <h1 className="text-2xl font-bold text-foreground">Detalle del Canastillo</h1>
                    <div className="flex gap-2">
                        <Button variant="outline" size="sm" onClick={() => router.visit(route('canastillos.canastillos.index'))}>
                            <ArrowLeft className="mr-2 h-4 w-4" />
                            Volver
                        </Button>
                        <Button size="sm" onClick={() => router.visit(route('canastillos.canastillos.edit', canastillo.id))}>
                            <Edit className="mr-2 h-4 w-4" />
                            Editar
                        </Button>
                    </div>
                </div>

                <Card className="p-6">
                    <dl className="grid grid-cols-1 gap-4 md:grid-cols-2">
                        <div>
                            <dt className="text-sm font-medium text-muted-foreground">Nombre</dt>
                            <dd className="text-lg font-semibold">{canastillo.nombre}</dd>
                        </div>
                        <div>
                            <dt className="text-sm font-medium text-muted-foreground">Alias</dt>
                            <dd className="text-lg">{canastillo.alias || '-'}</dd>
                        </div>
                        <div>
                            <dt className="text-sm font-medium text-muted-foreground">Tamaño</dt>
                            <dd className="text-lg">{canastillo.tamaño || '-'}</dd>
                        </div>
                        <div>
                            <dt className="text-sm font-medium text-muted-foreground">Color</dt>
                            <dd className="text-lg flex items-center gap-2">
                                {canastillo.color ? (
                                    <>
                                        <span className="inline-block h-5 w-5 rounded-full border" style={{ backgroundColor: canastillo.color }} />
                                        <span>{canastillo.color}</span>
                                    </>
                                ) : '-'}
                            </dd>
                        </div>
                        <div>
                            <dt className="text-sm font-medium text-muted-foreground">Precio</dt>
                            <dd className="text-lg">{canastillo.precio ? `$${canastillo.precio.toFixed(2)}` : '-'}</dd>
                        </div>
                        <div className="col-span-full">
                            <dt className="text-sm font-medium text-muted-foreground">Detalle</dt>
                            <dd className="text-lg whitespace-pre-wrap">{canastillo.detalle || '-'}</dd>
                        </div>
                        <div>
                            <dt className="text-sm font-medium text-muted-foreground">Fecha de creación</dt>
                            <dd className="text-sm">{formatDate(canastillo.created_at)}</dd>
                        </div>
                        <div>
                            <dt className="text-sm font-medium text-muted-foreground">Última actualización</dt>
                            <dd className="text-sm">{formatDate(canastillo.updated_at)}</dd>
                        </div>
                    </dl>
                </Card>
            </div>
        </AppLayout>
    );
}
