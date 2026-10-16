import { Button } from '@/components/ui/button';
import FormInput from '@/components/ui/form-input';
import FormSelect from '@/components/ui/form-select';
import { useAuth } from '@/hooks/useAuth';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, useForm } from '@inertiajs/react';
import * as React from 'react';
import { route } from 'ziggy-js';

// Breadcrumbs para navegación
const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Solicitud de orden de trabajo',
        href: '/mantenimiento/solicitudOts',
    },
    {
        title: 'Crear Solicitud de OT',
        href: '/mantenimiento/solicitudOts/crear',
    },
];

// Interfaces de las props
interface PageProps {
    users?: { id: number; name: string }[];
    sectores?: { id: number; nombre: string }[];
    maquinaEquipos?: { id: number; nombre: string; sector_id: number }[];
}

// Interfaz para el usuario autenticado de Inertia
interface InertiaUser {
    id: number;
    name: string;
    email: string;
    roles: string[];
    permissions: string[]; // ✅ importante para TypeScript
}

export default function Crear({
    users = [],
    sectores = [],
    maquinaEquipos = [],
}: PageProps) {
    const { user, isAdmin, hasPermission } = useAuth();

    // ✅ el usuario puede editar si tiene el permiso o si es admin
    const canEditSolicitante = isAdmin || hasPermission('c_editarSolicitantes');

    interface SolicitudOtForm {
        user_id: string | number;
        sector_id: string;
        maquina_equipo_id: string;
        descripcion: string;
        observacion: string;
    }

    const { data, setData, post, processing, errors } =
        useForm<SolicitudOtForm>({
            user_id: user?.id || '',
            sector_id: '',
            maquina_equipo_id: '',
            descripcion: '',
            observacion: '',
        });

    // Estado para almacenar las máquinas filtradas según el sector
    const [maquinasFiltradas, setMaquinasFiltradas] =
        React.useState(maquinaEquipos);
    const handleSectorChange = (sectorId: string) => {
        setData('sector_id', sectorId);
        setData('maquina_equipo_id', ''); // resetear máquina seleccionada

        // Filtrar máquinas según sector
        const filtradas = sectorId
            ? maquinaEquipos.filter((m) => m.sector_id?.toString() === sectorId)
            : maquinaEquipos;

        setMaquinasFiltradas(filtradas);
    };

    // Función para enviar el formulario
    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        post(route('solicitudOts.guardar'));
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Crear solicitudOts" />

            <div className="mx-auto max-w-6xl px-4 py-4 sm:px-6">
                {/* Header */}
                <div className="mb-6">
                    <h1 className="text-2xl font-bold text-foreground">
                        Crear Nueva Solicitud de OT
                    </h1>
                    <p className="mt-1 text-sm text-muted-foreground">
                        Complete la información requerida para registrar una
                        nueva Solicitud de OT
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
                            {/* FormSelect con control de permisos */}
                            <FormSelect
                                label="Solicitante"
                                value={data.user_id?.toString() || ''}
                                onChange={(v) => setData('user_id', v)}
                                placeholder="Seleccione Usuario"
                                options={users.map((r) => ({
                                    value: r.id.toString(),
                                    label: r.name,
                                }))}
                                error={errors.user_id}
                                disabled={!canEditSolicitante} // ✅ deshabilitado si no tiene permiso
                            />

                            <FormSelect
                                label="Sectores"
                                value={data.sector_id?.toString() || ''}
                                onChange={(v) => handleSectorChange(v)}
                                placeholder="Seleccione sector"
                                options={sectores.map((r) => ({
                                    value: r.id.toString(),
                                    label: r.codigo
                                        ? `${r.codigo} - ${r.nombre}`
                                        : r.nombre, // ← mostrar código + nombre
                                }))}
                                error={errors.sector_id}
                            />

                            <FormSelect
                                label="Maquina o Equipo"
                                value={data.maquina_equipo_id?.toString() || ''}
                                onChange={(v) =>
                                    setData('maquina_equipo_id', v)
                                }
                                placeholder="Seleccione Maquina o Equipo"
                                options={maquinasFiltradas.map((r) => ({
                                    value: r.id.toString(),
                                    label: r.codigo_contable
                                        ? `${r.codigo_contable} - ${r.nombre}`
                                        : r.nombre, // ← usar codigo_contable
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
                                placeholder="Escriba una descripción..."
                                error={errors.descripcion}
                                textarea // ✅ con esto ya se convierte en <textarea>
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
                                        Creando...
                                    </div>
                                ) : (
                                    'Crear Solicitud de OT'
                                )}
                            </Button>
                        </div>
                    </div>
                </form>
            </div>
        </AppLayout>
    );
}
