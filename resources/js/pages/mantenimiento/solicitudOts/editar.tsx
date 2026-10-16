import { Button } from '@/components/ui/button';
import FormInput from '@/components/ui/form-input';
import FormSelect from '@/components/ui/form-select';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, useForm } from '@inertiajs/react';
import * as React from 'react';
import { route } from 'ziggy-js';
import { useAuth } from '@/hooks/useAuth';

const breadcrumbs: BreadcrumbItem[] = [

    {
        title: 'Solicitud de orden de trabajo',
        href: '/mantenimiento/solicitudOts',
    },
    {
        title: 'Editar Solicitud de OT',
        href: '/mantenimiento/solicitudOts/editar',
    },
];

interface PageProps {
    solicitudOt:any;
    users?: { id: number; name: string }[];
    sectores?: { id: number; nombre: string }[];
    maquinaEquipos?: { id: number; nombre: string; sector_id: number }[];
}

interface InertiaUser {
    id: number;
    name: string;
    email: string;
    roles: string[];
    permissions: string[]; // ✅ importante para TypeScript
}


interface FormData {
    user_id: string;
    maquina_equipo_id: string;
    sector_id: string;
    descripcion: string;

}

export default function Editar({solicitudOt, users=[], sectores=[], maquinaEquipos = [] }: PageProps) {
    const { data, setData, put, processing, errors } = useForm<FormData>({
        user_id: solicitudOt.user_id?.toString() || '',
        maquina_equipo_id: solicitudOt.maquina_equipo_id?.toString() || '',
        sector_id: solicitudOt.sector_id?.toString() || '',

        descripcion: solicitudOt.descripcion,
        // observacion: solicitudOt.observacion,


    });

    const { user, isAdmin, hasPermission } = useAuth();

     const canEditSolicitante =
        isAdmin || hasPermission('c_MAN_editar_solicitante');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        put(route('solicitudOts.actualizar', { solicitudOt: solicitudOt.id }));
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Editar Usuario" />
            <div className="mx-auto max-w-6xl px-4 py-4 sm:px-6">
                {/* Header */}
                <div className="mb-6">
                    <h1 className="text-2xl font-bold text-foreground">
                        Editar Repuesto:
                         {/* {solicitudOt.name} {solicitudOt.codigo} */}
                    </h1>
                    <p className="mt-1 text-sm text-muted-foreground">
                        Actualice la información de la solicitudOt
                    </p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Sección: Información Personal */}
                    <div className="rounded-lg border border-border bg-card p-4 shadow-sm">
                        <div className="mb-4">
                            <h2 className="flex items-center text-base font-semibold text-foreground">
                                <div className="mr-2 h-1.5 w-1.5 rounded-full bg-primary"></div>
                                Información General
                            </h2>
                        </div>

                        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">

                            <FormSelect
                                label="Unidades"
                                value={data.user_id?.toString() || ''}
                                onChange={(v) => setData('user_id', v)}
                                placeholder="Seleccione Usuario"
                                options={users.map((r) => ({
                                    value: r.id.toString(),
                                    label: r.name,
                                }))}
                                error={errors.user_id}
                                disabled={!canEditSolicitante}
                            />

                            <FormSelect
                                label="Sectores"
                                value={data.sector_id?.toString() || ''}
                                onChange={(v) => setData('sector_id', v)}
                                placeholder="Seleccione Sector"
                                options={sectores.map((r) => ({
                                    value: r.id.toString(),
                                    label: r.nombre,
                                }))}
                                error={errors.sector_id}
                            />

                            <FormSelect
                                label="Maquina o Equipo"
                                value={data.maquina_equipo_id?.toString() || ''}
                                onChange={(v) => setData('maquina_equipo_id', v)}
                                placeholder="Seleccione Maquina"
                                options={maquinaEquipos.map((r) => ({
                                    value: r.id.toString(),
                                    label: r.nombre,
                                }))}
                                error={errors.maquina_equipo_id}
                            />


                            <FormInput
                                id="descripcion"
                                label="Descripción"
                                value={data.descripcion}
                                onChange={(e) =>
                                    setData('descripcion', e.target.value)
                                }
                                placeholder="descripcion"
                                error={errors.descripcion}
                            />

                        </div>
                    </div>

                    {/* Botones de acción */}
                    <div className="rounded-lg border border-border bg-card p-4 shadow-sm">
                        <div className="flex flex-col justify-end gap-3 sm:flex-row">
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => window.history.back()}
                                className="order-2 w-full sm:order-1 sm:w-32"
                            >
                                Cancelar
                            </Button>
                            <Button
                                type="submit"
                                disabled={processing}
                                className="order-1 w-full sm:order-2 sm:w-40"
                            >
                                {processing ? (
                                    <div className="flex items-center justify-center">
                                        <div className="mr-2 h-4 w-4 animate-spin rounded-full border-b-2 border-white"></div>
                                        Guardando...
                                    </div>
                                ) : (
                                    'Guardar Cambios'
                                )}
                            </Button>
                        </div>
                    </div>
                </form>
            </div>
        </AppLayout>
    );
}
