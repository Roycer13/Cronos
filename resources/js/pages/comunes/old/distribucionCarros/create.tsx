import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, router, usePage, Link } from '@inertiajs/react';
import { Card } from '@/components/ui/card';
import { ArrowLeft, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useState } from 'react';
import FormDistribucionCarro from './FormDistribucionCarro';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Módulos Comunes', href: '/modulos-comunes' },
    { title: 'Old', href: '#' },
    { title: 'Distribución de Carros', href: '/old/distribucion-carros' },
    { title: 'Nuevo Registro', href: '#' },
];

export default function DistribucionCarrosCreate() {
    const { props } = usePage();
    const { placas } = props as any; // Lista de placas existentes para autocompletado

    const [processing, setProcessing] = useState(false);
    const [errors, setErrors] = useState<Record<string, string>>({});

    const initialData = {
        fecha: new Date(new Date().getTime() - new Date().getTimezoneOffset() * 60000).toISOString().slice(0, 16),
        destino: '',
        placa: '',
        paredes_externas: true,
        limpieza_interno: true,
        ausencia_objetos_olores: true,
        set_temperatura: '',
        bph_chofer: true,
        bph_ayudante: true,
        observaciones: '',
        correciones: '',
    };

    const handleSubmit = (formData: any) => {
        setProcessing(true);
        router.post(route('old-distribucion-carros.store'), formData, {
            preserveScroll: true,
            onSuccess: () => {
                setProcessing(false);
            },
            onError: (err) => {
                setErrors(err);
                setProcessing(false);
            },
        });
    };

    const handleCancel = () => {
        router.get(route('old-distribucion-carros.index'));
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Nuevo Registro - Distribución de Carros" />
            
            <div className="px-2 sm:px-6 py-4 max-w-4xl mx-auto space-y-4">
                <div className="flex items-center gap-4">
                    <Link href={route('old-distribucion-carros.index')}>
                        <Button variant="ghost" size="icon"><ArrowLeft className="h-5 w-5" /></Button>
                    </Link>
                    <div>
                        <h1 className="text-2xl font-bold flex items-center gap-2">
                            <Plus className="h-6 w-6 text-primary" /> Nuevo Registro
                        </h1>
                        <p className="text-muted-foreground mt-1">Registrar una nueva distribución de carros</p>
                    </div>
                </div>

                <Card className="p-6 mt-4">
                    <FormDistribucionCarro 
                        initialData={initialData} 
                        onSubmit={handleSubmit} 
                        processing={processing} 
                        errors={errors} 
                        onCancel={handleCancel} 
                        placas={placas || []}
                    />
                </Card>
            </div>
        </AppLayout>
    );
}