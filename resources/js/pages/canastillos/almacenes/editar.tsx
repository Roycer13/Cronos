import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import FormInput from '@/components/ui/form-input';
import FormSelect from '@/components/ui/form-select';
import { Toast } from '@/components/ui/toast';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, router, useForm, usePage } from '@inertiajs/react';
import { ArrowLeft, Plus, Save, X } from 'lucide-react';
import { useState } from 'react';
import { route } from 'ziggy-js';

interface Almacen {
    id: number;
    nombre: string;
    ubicacion: string | null;
    tipo_almacen_id: number;
    observaciones: string | null;
    responsables: Responsable[]; // ← relación muchos a muchos
}

interface TipoAlmacen {
    id: number;
    nombre: string;
}

interface Responsable {
    id: number;
    name: string;
    apellido: string;
}

interface PageProps {
    almacen: Almacen;
    tipos_almacen: TipoAlmacen[];
    responsables: Responsable[]; // todos los usuarios disponibles
    flash: {
        success?: string;
        error?: string;
    };
}

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Almacenes', href: '/canastillos/almacenes' },
    { title: 'Editar Almacén', href: '/canastillos/almacenes/editar' },
];

export default function Editar() {
    const { props } = usePage();
    const { almacen, tipos_almacen = [], responsables = [], flash } = props as unknown as PageProps;

    // Inicializar el formulario con los datos actuales
    const { data, setData, put, processing, errors } = useForm({
        nombre: almacen.nombre || '',
        ubicacion: almacen.ubicacion || '',
        tipo_almacen_id: almacen.tipo_almacen_id?.toString() || '',
        observaciones: almacen.observaciones || '',
        responsables: almacen.responsables?.map(r => r.id.toString()) || [], // IDs de los responsables actuales
    });

    // Estado local para el selector de responsables
    const [selectedResponsableId, setSelectedResponsableId] = useState('');
    const [filterText, setFilterText] = useState('');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        put(route('canastillos.almacenes.update', almacen.id), {
            preserveScroll: true,
        });
    };

    // Agregar responsable a la lista
    const addResponsable = () => {
        if (!selectedResponsableId) return;
        if (data.responsables.includes(selectedResponsableId)) {
            alert('Este responsable ya está agregado');
            return;
        }
        setData('responsables', [...data.responsables, selectedResponsableId]);
        setSelectedResponsableId('');
        setFilterText('');
    };

    // Eliminar responsable de la lista
    const removeResponsable = (id: string) => {
        setData('responsables', data.responsables.filter(r => r !== id));
    };

    // Filtrar responsables según el texto de búsqueda
    const filteredResponsables = responsables.filter(r =>
        `${r.name} ${r.apellido}`.toLowerCase().includes(filterText.toLowerCase())
    );

    // Obtener el objeto responsable por ID
    const getResponsableById = (id: string) => responsables.find(r => r.id.toString() === id);

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Editar Almacén" />
            <div className="space-y-4 px-2 py-2 sm:px-6">
                <Toast />

                <div className="flex items-center justify-between">
                    <h1 className="text-2xl font-bold text-foreground">Editar Almacén</h1>
                    <Button variant="outline" size="sm" onClick={() => router.visit(route('canastillos.almacenes.index'))}>
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
                                id="ubicacion"
                                label="Ubicación"
                                value={data.ubicacion}
                                onChange={(e) => setData('ubicacion', e.target.value)}
                                error={errors.ubicacion}
                            />

                            <FormSelect
                                id="tipo_almacen_id"
                                label="Tipo de Almacén *"
                                value={data.tipo_almacen_id}
                                onChange={(v) => setData('tipo_almacen_id', v)}
                                options={tipos_almacen.map((t) => ({
                                    value: t.id.toString(),
                                    label: t.nombre,
                                }))}
                                error={errors.tipo_almacen_id}
                                required
                            />

                            {/* Selector de responsables con filtro y lista dinámica */}
                            <div className="col-span-full">
                                <label className="block text-sm font-medium text-foreground mb-2">
                                    Responsables (puede seleccionar varios)
                                </label>
                                <div className="flex gap-2 mb-3">
                                    <div className="flex-1">
                                        <input
                                            type="text"
                                            placeholder="Buscar por nombre..."
                                            value={filterText}
                                            onChange={(e) => setFilterText(e.target.value)}
                                            className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                                        />
                                        <select
                                            value={selectedResponsableId}
                                            onChange={(e) => setSelectedResponsableId(e.target.value)}
                                            className="mt-2 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                                        >
                                            <option value="">Seleccione un responsable</option>
                                            {filteredResponsables.map((r) => (
                                                <option key={r.id} value={r.id.toString()}>
                                                    {r.name} {r.apellido}
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                    <Button
                                        type="button"
                                        variant="outline"
                                        onClick={addResponsable}
                                        disabled={!selectedResponsableId}
                                        className="mt-6"
                                    >
                                        <Plus className="h-4 w-4 mr-2" />
                                        Agregar
                                    </Button>
                                </div>

                                {/* Lista de responsables seleccionados */}
                                {data.responsables.length > 0 && (
                                    <div className="mt-2 flex flex-wrap gap-2">
                                        {data.responsables.map((id) => {
                                            const resp = getResponsableById(id);
                                            if (!resp) return null;
                                            return (
                                                <div
                                                    key={id}
                                                    className="flex items-center gap-1 rounded-full bg-primary/10 px-3 py-1 text-sm"
                                                >
                                                    <span>{resp.name} {resp.apellido}</span>
                                                    <button
                                                        type="button"
                                                        onClick={() => removeResponsable(id)}
                                                        className="ml-1 text-muted-foreground hover:text-destructive"
                                                    >
                                                        <X className="h-3 w-3" />
                                                    </button>
                                                </div>
                                            );
                                        })}
                                    </div>
                                )}
                                {errors.responsables && (
                                    <p className="mt-1 text-sm text-destructive">{errors.responsables}</p>
                                )}
                            </div>
                        </div>

                        <FormInput
                            id="observaciones"
                            label="Observaciones"
                            value={data.observaciones}
                            onChange={(e) => setData('observaciones', e.target.value)}
                            error={errors.observaciones}
                            textarea
                        />

                        <div className="flex justify-end gap-3">
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => router.visit(route('canastillos.almacenes.index'))}
                            >
                                Cancelar
                            </Button>
                            <Button type="submit" disabled={processing}>
                                <Save className="mr-2 h-4 w-4" />
                                {processing ? 'Actualizando...' : 'Actualizar Almacén'}
                            </Button>
                        </div>
                    </form>
                </Card>
            </div>
        </AppLayout>
    );
}
