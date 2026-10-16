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
    { title: 'Editar Usuario', href: '/sistemas/usuarios/' },
];

interface PageProps {
    user: any;
    roles?: { id: number; name: string }[];
    ubicaciones?: { id: number; nombre: string }[];
    areas?: { id: number; nombre: string }[];
}

interface FormData {
    name: string;
    apellido: string;
    email: string;
    password: string;
    password_confirmation: string;
    rol_id: string;
    estado: string;
    codigo: string;
    ubicacion_id: string;
    area_id: string;
    turno: string;
    cargo: string;
    profesion: string;
    telefono: string;
    avatar?: string;
    firma_digital?: string;
}

export default function Editar({
    user,
    roles = [],
    ubicaciones = [],
    areas = [],
}: PageProps) {
    const { data, setData, put, processing, errors } = useForm<FormData>({
        name: user.name,
        apellido: user.apellido,
        email: user.email,
        password: '',
        password_confirmation: '',
        rol_id: user.roles?.length ? user.roles[0].name : '',
        estado: user.estado,
        codigo: user.codigo,
        ubicacion_id: user.ubicacion_id?.toString() || '',
        area_id: user.area_id?.toString() || '',
        turno: user.turno,
        cargo: user.cargo,
        profesion: user.profesion,
        telefono: user.telefono,
        avatar: user.avatar || '',
        firma_digital: user.firma_digital || '',
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        put(route('usuarios.actualizar', { user: user.id }));
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Editar Usuario" />
            <div className="px-4 sm:px-6 py-4 max-w-6xl mx-auto">
                {/* Header */}
                <div className="mb-6">
                    <h1 className="text-2xl font-bold text-foreground">
                        Editar Usuario: {user.name} {user.apellido}
                    </h1>
                    <p className="mt-1 text-sm text-muted-foreground">
                        Actualice la información del usuario
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
                                placeholder="Nombre"
                                error={errors.name}
                            />

                            <FormInput
                                id="apellido"
                                label="Apellido"
                                value={data.apellido}
                                onChange={(e) => setData('apellido', e.target.value)}
                                placeholder="Apellido"
                                error={errors.apellido}
                            />

                            <FormInput
                                id="codigo"
                                label="Código"
                                value={data.codigo}
                                onChange={(e) => setData('codigo', e.target.value)}
                                placeholder="Código"
                                error={errors.codigo}
                            />

                            <FormInput
                                id="email"
                                label="Correo Electrónico"
                                value={data.email}
                                onChange={(e) => setData('email', e.target.value)}
                                placeholder="Correo electrónico"
                                error={errors.email}
                            />

                            <FormInput
                                id="telefono"
                                label="Teléfono"
                                value={data.telefono}
                                onChange={(e) => setData('telefono', e.target.value)}
                                placeholder="Teléfono"
                                error={errors.telefono}
                            />

                            <FormSelect
                                label="Estado"
                                value={data.estado || ''}
                                onChange={(v) => setData('estado', v)}
                                placeholder="Seleccione estado"
                                options={[
                                    { value: 'Activo', label: 'Activo' },
                                    { value: 'Inactivo', label: 'Inactivo' },
                                ]}
                                error={errors.estado}
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
                                value={data.rol_id || ''}
                                onChange={(v) => setData('rol_id', v)}
                                placeholder="Seleccione rol"
                                options={roles.map((r) => ({
                                    value: r.name,
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
                                placeholder="Cargo"
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

                    {/* Sección: Seguridad */}
                    <div className="bg-card rounded-lg border border-border shadow-sm p-4">
                        <div className="mb-4">
                            <h2 className="text-base font-semibold text-foreground flex items-center">
                                <div className="w-1.5 h-1.5 bg-orange-500 rounded-full mr-2"></div>
                                Seguridad
                            </h2>
                            <p className="text-sm text-muted-foreground mt-1">
                                Deje en blanco si no desea cambiar la contraseña
                            </p>
                        </div>

                        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                            <FormInput
                                id="password"
                                label="Contraseña"
                                type="password"
                                value={data.password}
                                onChange={(e) => setData('password', e.target.value)}
                                placeholder="Nueva contraseña"
                                error={errors.password}
                            />

                            <FormInput
                                id="password_confirmation"
                                label="Confirmar Contraseña"
                                type="password"
                                value={data.password_confirmation}
                                onChange={(e) => setData('password_confirmation', e.target.value)}
                                placeholder="Confirmar nueva contraseña"
                                error={errors.password_confirmation}
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
                                placeholder="URL del avatar"
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
