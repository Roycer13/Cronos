import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Toast } from '@/components/ui/toast';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, router, usePage } from '@inertiajs/react';
import { ArrowLeft, Edit, Phone, User, Hash } from 'lucide-react';
import { route } from 'ziggy-js';

interface Vendedor {
    id: number;
    nombre: string;
    apellido: string;
    codigo: string | null;
    telefono: string | null;
    created_at: string;
    updated_at: string;
}

interface PageProps {
    vendedor: Vendedor;
    flash: {
        success?: string;
        error?: string;
    };
}

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Vendedores', href: '/canastillos/vendedores' },
    { title: 'Detalle de Vendedor', href: '/canastillos/vendedores/show' },
];

export default function Show() {
    const { props } = usePage();
    const { vendedor, flash } = props as unknown as PageProps;

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
            <Head title={`Vendedor: ${vendedor.nombre} ${vendedor.apellido}`} />
            <div className="space-y-4 px-2 py-2 sm:px-6">
                <Toast />

                <div className="flex items-center justify-between">
                    <h1 className="text-2xl font-bold text-foreground">Detalle del Vendedor</h1>
                    <div className="flex gap-2">
                        <Button variant="outline" size="sm" onClick={() => router.visit(route('canastillos.vendedores.index'))}>
                            <ArrowLeft className="mr-2 h-4 w-4" />
                            Volver
                        </Button>
                        <Button size="sm" onClick={() => router.visit(route('canastillos.vendedores.edit', vendedor.id))}>
                            <Edit className="mr-2 h-4 w-4" />
                            Editar
                        </Button>
                    </div>
                </div>

                <Card className="p-6">
                    <dl className="grid grid-cols-1 gap-4 md:grid-cols-2">
                        <div className="flex items-start gap-3">
                            <User className="h-5 w-5 text-muted-foreground mt-0.5" />
                            <div>
                                <dt className="text-sm font-medium text-muted-foreground">Nombre completo</dt>
                                <dd className="text-lg font-semibold">{vendedor.nombre} {vendedor.apellido}</dd>
                            </div>
                        </div>

                        <div className="flex items-start gap-3">
                            <Hash className="h-5 w-5 text-muted-foreground mt-0.5" />
                            <div>
                                <dt className="text-sm font-medium text-muted-foreground">Código</dt>
                                <dd className="text-lg">{vendedor.codigo || '-'}</dd>
                            </div>
                        </div>

                        <div className="flex items-start gap-3">
                            <Phone className="h-5 w-5 text-muted-foreground mt-0.5" />
                            <div>
                                <dt className="text-sm font-medium text-muted-foreground">Teléfono</dt>
                                <dd className="text-lg">{vendedor.telefono || '-'}</dd>
                            </div>
                        </div>

                        <div className="col-span-full">
                            <dt className="text-sm font-medium text-muted-foreground">Información de registro</dt>
                            <dd className="mt-2 grid grid-cols-2 gap-2 text-sm">
                                <div>
                                    <span className="text-muted-foreground">Creado:</span>{' '}
                                    {formatDate(vendedor.created_at)}
                                </div>
                                <div>
                                    <span className="text-muted-foreground">Actualizado:</span>{' '}
                                    {formatDate(vendedor.updated_at)}
                                </div>
                            </dd>
                        </div>
                    </dl>
                </Card>

                {/* Aquí podrías agregar un resumen de deudas del vendedor */}
                <Card className="p-6">
                    <h2 className="text-lg font-semibold mb-4">Resumen de Deudas</h2>
                    <p className="text-muted-foreground">
                        Esta sección mostrará el detalle de canastillos prestados al vendedor.
                    </p>
                </Card>
            </div>
        </AppLayout>
    );
}
