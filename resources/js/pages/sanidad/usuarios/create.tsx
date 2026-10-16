import { Button } from '@/components/ui/button';
import FormInput from '@/components/ui/form-input';
import FormSelect from '@/components/ui/form-select';
import AppLayout from '@/layouts/app-layout';
import { Head, useForm } from '@inertiajs/react';
import { route } from 'ziggy-js';
import { User, Briefcase, Heart, MapPin } from 'lucide-react';

interface PageProps {
    ubicaciones: { id: number; nombre: string }[];
    areas: { id: number; nombre: string }[];
    policlinicos: { id: number; nombre: string }[];
}

export default function Create({ ubicaciones, areas, policlinicos }: PageProps) {
    const { data, setData, post, processing, errors } = useForm({
        name: '',
        apellido: '',
        codigo: '',
        email: '',
        fecha_nacimiento: '',
        sexo: '',
        estado_civil: '',
        telefono: '',
        direccion: '',
        ubicacion_id: '',
        area_id: '',
        cargo: '',
        turno: '',
        profesion: '',
        seguro_social: '',
        policlinico_id: '',
        fecha_ingreso: '',
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        post(route('sanidad.usuarios.store'));
    };

    return (
        <AppLayout breadcrumbs={[
            { title: 'Usuarios', href: '/sanidad/usuarios' },
            { title: 'Nuevo Usuario', href: '#' }
        ]}>
            <Head title="Crear Usuario" />
            <div className="px-4 sm:px-6 py-4 max-w-6xl mx-auto">
                <div className="mb-6">
                    <h1 className="text-3xl font-bold text-foreground">Nuevo Usuario</h1>
                    <p className="text-sm text-muted-foreground mt-2">
                        Complete la información del usuario. Los campos marcados con * son obligatorios.
                    </p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-8">
                    {/* Sección 1: Datos Personales */}
                    <div className="bg-card rounded-lg border border-border shadow-sm p-6">
                        <h2 className="text-xl font-semibold mb-4 flex items-center">
                            <User className="h-5 w-5 mr-2 text-primary" />
                            Datos Personales
                        </h2>
                        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                            <FormInput
                                id="name"
                                label="Nombre *"
                                value={data.name}
                                onChange={(e) => setData('name', e.target.value)}
                                error={errors.name}
                                required
                            />
                            <FormInput
                                id="apellido"
                                label="Apellido *"
                                value={data.apellido}
                                onChange={(e) => setData('apellido', e.target.value)}
                                error={errors.apellido}
                                required
                            />
                            <FormInput
                                id="codigo"
                                label="Código de empleado *"
                                value={data.codigo}
                                onChange={(e) => setData('codigo', e.target.value)}
                                error={errors.codigo}
                                required
                            />
                            <FormInput
                                id="email"
                                label="Email"
                                type="email"
                                value={data.email}
                                onChange={(e) => setData('email', e.target.value)}
                                error={errors.email}
                            />
                            <FormInput
                                id="fecha_nacimiento"
                                label="Fecha de nacimiento"
                                type="date"
                                value={data.fecha_nacimiento}
                                onChange={(e) => setData('fecha_nacimiento', e.target.value)}
                                error={errors.fecha_nacimiento}
                            />
                            <FormSelect
                                label="Sexo"
                                value={data.sexo}
                                onChange={(v) => setData('sexo', v)}
                                placeholder="Seleccione"
                                options={[
                                    { value: 'M', label: 'Masculino' },
                                    { value: 'F', label: 'Femenino' }
                                ]}
                                error={errors.sexo}
                            />
                            <FormInput
                                id="estado_civil"
                                label="Estado civil"
                                value={data.estado_civil}
                                onChange={(e) => setData('estado_civil', e.target.value)}
                                error={errors.estado_civil}
                            />
                            <FormInput
                                id="telefono"
                                label="Teléfono"
                                value={data.telefono}
                                onChange={(e) => setData('telefono', e.target.value)}
                                error={errors.telefono}
                            />
                            <FormInput
                                id="direccion"
                                label="Dirección"
                                value={data.direccion}
                                onChange={(e) => setData('direccion', e.target.value)}
                                error={errors.direccion}
                            />
                        </div>
                    </div>

                    {/* Sección 2: Información Laboral */}
                    <div className="bg-card rounded-lg border border-border shadow-sm p-6">
                        <h2 className="text-xl font-semibold mb-4 flex items-center">
                            <Briefcase className="h-5 w-5 mr-2 text-blue-500" />
                            Información Laboral
                        </h2>
                        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                            <FormSelect
                                label="Ubicación"
                                value={data.ubicacion_id}
                                onChange={(v) => setData('ubicacion_id', v)}
                                placeholder="Seleccione ubicación"
                                options={ubicaciones.map((u) => ({
                                    value: u.id.toString(),
                                    label: u.nombre,
                                }))}
                                error={errors.ubicacion_id}
                            />
                            <FormSelect
                                label="Área"
                                value={data.area_id}
                                onChange={(v) => setData('area_id', v)}
                                placeholder="Seleccione área"
                                options={areas.map((a) => ({
                                    value: a.id.toString(),
                                    label: a.nombre,
                                }))}
                                error={errors.area_id}
                            />
                            <FormInput
                                id="cargo"
                                label="Cargo"
                                value={data.cargo}
                                onChange={(e) => setData('cargo', e.target.value)}
                                error={errors.cargo}
                            />
                            <FormInput
                                id="turno"
                                label="Turno"
                                value={data.turno}
                                onChange={(e) => setData('turno', e.target.value)}
                                error={errors.turno}
                            />
                            <FormInput
                                id="profesion"
                                label="Profesión"
                                value={data.profesion}
                                onChange={(e) => setData('profesion', e.target.value)}
                                error={errors.profesion}
                            />
                            <FormInput
                                id="fecha_ingreso"
                                label="Fecha de ingreso"
                                type="date"
                                value={data.fecha_ingreso}
                                onChange={(e) => setData('fecha_ingreso', e.target.value)}
                                error={errors.fecha_ingreso}
                            />
                        </div>
                    </div>

                    {/* Sección 3: Información Médica */}
                    <div className="bg-card rounded-lg border border-border shadow-sm p-6">
                        <h2 className="text-xl font-semibold mb-4 flex items-center">
                            <Heart className="h-5 w-5 mr-2 text-red-500" />
                            Información Médica
                        </h2>
                        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                            <FormInput
                                id="seguro_social"
                                label="Seguro social"
                                value={data.seguro_social}
                                onChange={(e) => setData('seguro_social', e.target.value)}
                                error={errors.seguro_social}
                            />
                            <FormSelect
                                label="Policlínico"
                                value={data.policlinico_id}
                                onChange={(v) => setData('policlinico_id', v)}
                                placeholder="Seleccione policlínico"
                                options={policlinicos.map((p) => ({
                                    value: p.id.toString(),
                                    label: p.nombre,
                                }))}
                                error={errors.policlinico_id}
                            />
                        </div>
                    </div>

                    {/* Botones de acción */}
                    <div className="bg-card rounded-lg border border-border shadow-sm p-6">
                        <div className="flex flex-col sm:flex-row gap-3 justify-end">
                            <Button type="button" variant="outline" onClick={() => window.history.back()}>
                                Cancelar
                            </Button>
                            <Button type="submit" disabled={processing}>
                                {processing ? 'Guardando...' : 'Crear Usuario'}
                            </Button>
                        </div>
                    </div>
                </form>
            </div>
        </AppLayout>
    );
}