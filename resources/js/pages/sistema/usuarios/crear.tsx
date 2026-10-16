import { Button } from '@/components/ui/button';
import FormInput from '@/components/ui/form-input';
import FormSelect from '@/components/ui/form-select';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, useForm } from '@inertiajs/react';
import * as React from 'react';
import { route } from 'ziggy-js';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Usuarios', href: '/sistemas/usuarios' },
    { title: 'Crear Usuario', href: '/sistemas/usuarios/create' },
];

interface PageProps {
    roles?: { id: number; name: string }[];
    ubicaciones?: { id: number; nombre: string }[];
    areas?: { id: number; nombre: string }[];
}

export default function Crear({
    roles = [],
    ubicaciones = [],
    areas = [],
}: PageProps) {
    const { data, setData, post, processing, errors } = useForm({
        name: '',
        email: '',
        rol_id: '',
        estado: 'Activo',
        codigo: '',
        ubicacion_id: '',
        apellido: '',
        cargo: '',
        turno: '',
        profesion: '',
        area_id: '',
        telefono: '',
        avatar: '',
        firma_digital: '',
        preferences: '{}',
        notificaiones_activas: true,
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        post(route('usuarios.guardar'));
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Crear usuario" />
            <div className="px-4 sm:px-6 py-4 max-w-6xl mx-auto">
                {/* Header */}
                <div className="mb-6">
                    <h1 className="text-2xl font-bold text-foreground">
                        Crear Nuevo Usuario
                    </h1>
                    <p className="mt-1 text-sm text-muted-foreground">
                        Complete la información requerida para registrar un nuevo usuario
                    </p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Sección: Información Personal */}
                    <div className="bg-card rounded-lg border border-border shadow-sm p-4">
                        <div className="mb-4">
                            <h2 className="text-base font-semibold text-foreground flex items-center">
                                <div className="w-1.5 h-1.5 bg-primary rounded-full mr-2"></div>
                                Información Personal
                            </h2>
                        </div>

                        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                            <FormInput
                                id="name"
                                label="Nombre"
                                value={data.name}
                                onChange={(e) => setData('name', e.target.value)}
                                placeholder="Ingrese el nombre"
                                error={errors.name}
                            />

                            <FormInput
                                id="apellido"
                                label="Apellido"
                                value={data.apellido}
                                onChange={(e) => setData('apellido', e.target.value)}
                                placeholder="Ingrese el apellido"
                                error={errors.apellido}
                            />

                            <FormInput
                                id="codigo"
                                label="Código"
                                value={data.codigo}
                                onChange={(e) => setData('codigo', e.target.value)}
                                placeholder="Código único"
                                error={errors.codigo}
                            />

                            <FormInput
                                id="telefono"
                                label="Teléfono"
                                value={data.telefono}
                                onChange={(e) => setData('telefono', e.target.value)}
                                placeholder="Número de teléfono"
                                error={errors.telefono}
                            />

                            <FormInput
                                id="email"
                                label="Correo Electrónico"
                                value={data.email}
                                onChange={(e) => setData('email', e.target.value)}
                                placeholder="usuario@ejemplo.com"
                                error={errors.email}
                            />
                        </div>
                    </div>

                    {/* Sección: Información Laboral */}
                    <div className="bg-card rounded-lg border border-border shadow-sm p-4">
                        <div className="mb-4">
                            <h2 className="text-base font-semibold text-foreground flex items-center">
                                <div className="w-1.5 h-1.5 bg-green-500 rounded-full mr-2"></div>
                                Información Laboral
                            </h2>
                        </div>

                        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                            <FormSelect
                                label="Planta/Ubicación"
                                value={data.ubicacion_id?.toString() || ''}
                                onChange={(v) => setData('ubicacion_id', v)}
                                placeholder="Seleccione planta"
                                options={ubicaciones.map((r) => ({
                                    value: r.id.toString(),
                                    label: r.nombre,
                                }))}
                                error={errors.ubicacion_id}
                            />

                            <FormSelect
                                label="Rol del Usuario"
                                value={data.rol_id?.toString() || ''}
                                onChange={(v) => setData('rol_id', v)}
                                placeholder="Seleccione rol"
                                options={roles.map((r) => ({
                                    value: r.id.toString(),
                                    label: r.name,
                                }))}
                                error={errors.rol_id}
                            />

                            <FormSelect
                                label="Área"
                                value={data.area_id?.toString() || ''}
                                onChange={(v) => setData('area_id', v)}
                                placeholder="Seleccione área"
                                options={areas.map((r) => ({
                                    value: r.id.toString(),
                                    label: r.nombre,
                                }))}
                                error={errors.area_id}
                            />

                            <FormSelect
                                label="Turno"
                                value={data.turno || ''}
                                onChange={(v) => setData('turno', v)}
                                placeholder="Seleccione turno"
                                options={[
                                    { value: 'Mañana', label: 'Mañana' },
                                    { value: 'Tarde', label: 'Tarde' },
                                    { value: 'Noche', label: 'Noche' },
                                    { value: 'Juan', label: 'Juan' },
                                    { value: 'Wilfredo', label: 'Wilfredo' },
                                    { value: 'Ramiro', label: 'Ramiro' },
                                    { value: 'Central', label: 'Central' },
                                ]}
                                error={errors.turno}
                            />

                            <FormInput
                                id="cargo"
                                label="Cargo"
                                value={data.cargo}
                                onChange={(e) => setData('cargo', e.target.value)}
                                placeholder="Cargo del usuario"
                                error={errors.cargo}
                            />

                            <FormInput
                                id="profesion"
                                label="Profesión"
                                value={data.profesion}
                                onChange={(e) => setData('profesion', e.target.value)}
                                placeholder="Profesión"
                                error={errors.profesion}
                            />
                        </div>
                    </div>

                    {/* Sección: Medios Digitales */}
                    <div className="bg-card rounded-lg border border-border shadow-sm p-4">
                        <div className="mb-4">
                            <h2 className="text-base font-semibold text-foreground flex items-center">
                                <div className="w-1.5 h-1.5 bg-purple-500 rounded-full mr-2"></div>
                                Medios Digitales
                            </h2>
                        </div>

                        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                            <FormInput
                                id="avatar"
                                label="URL del Avatar"
                                value={data.avatar}
                                onChange={(e) => setData('avatar', e.target.value)}
                                placeholder="https://ejemplo.com/avatar.jpg"
                                error={errors.avatar}
                            />

                            <FormInput
                                id="firma_digital"
                                label="Firma Digital"
                                value={data.firma_digital}
                                onChange={(e) => setData('firma_digital', e.target.value)}
                                placeholder="URL firma digital"
                                error={errors.firma_digital}
                            />
                        </div>
                    </div>

                    {/* Botones de acción */}
                    <div className="bg-card rounded-lg border border-border shadow-sm p-4">
                        <div className="flex flex-col sm:flex-row gap-3 justify-end">
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => window.history.back()}
                                className="sm:w-32 w-full order-2 sm:order-1"
                            >
                                Cancelar
                            </Button>
                            <Button
                                type="submit"
                                disabled={processing}
                                className="sm:w-40 w-full order-1 sm:order-2"
                            >
                                {processing ? (
                                    <div className="flex items-center justify-center">
                                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                                        Creando...
                                    </div>
                                ) : (
                                    'Crear Usuario'
                                )}
                            </Button>
                        </div>
                    </div>
                </form>
            </div>
        </AppLayout>
    );
}
