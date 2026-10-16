// resources/js/Pages/planta_lacteos/externo/tipos_muestra/editar.tsx
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import FormInput from '@/components/ui/form-input';
import AppLayout from '@/layouts/app-layout';
import { Head, useForm } from '@inertiajs/react';
import { route } from 'ziggy-js';

const breadcrumbs = [
    { title: 'Tipos de Muestra', href: '/planta-lacteos/externo/tipos-muestra' },
    { title: 'Editar', href: '' },
];

interface TipoMuestra {
    id: number;
    nombre: string;
    norma_referencial: string;
    unidad: string | null;
    aclaracion_unidad: string | null;
    min_mes: string | null;
    min_mes_exp: number | null;
    max_mes: string | null;
    max_mes_exp: number | null;
    min_colTot: string | null;
    min_colTot_exp: number | null;
    max_colTot: string | null;
    max_colTot_exp: number | null;
    min_mohLev: string | null;
    min_mohLev_exp: number | null;
    max_mohLev: string | null;
    max_mohLev_exp: number | null;
    mesofilos: boolean;
    coliformes: boolean;
    mohos: boolean;
}

interface PageProps {
    tipoMuestra: TipoMuestra;
}

export default function Edit({ tipoMuestra }: PageProps) {
    const { data, setData, put, processing, errors } = useForm({
        nombre: tipoMuestra.nombre || '',
        norma_referencial: tipoMuestra.norma_referencial || '',
        unidad: tipoMuestra.unidad || '',
        aclaracion_unidad: tipoMuestra.aclaracion_unidad || '',
        min_mes: tipoMuestra.min_mes || '',
        min_mes_exp: tipoMuestra.min_mes_exp?.toString() || '',
        max_mes: tipoMuestra.max_mes || '',
        max_mes_exp: tipoMuestra.max_mes_exp?.toString() || '',
        min_colTot: tipoMuestra.min_colTot || '',
        min_colTot_exp: tipoMuestra.min_colTot_exp?.toString() || '',
        max_colTot: tipoMuestra.max_colTot || '',
        max_colTot_exp: tipoMuestra.max_colTot_exp?.toString() || '',
        min_mohLev: tipoMuestra.min_mohLev || '',
        min_mohLev_exp: tipoMuestra.min_mohLev_exp?.toString() || '',
        max_mohLev: tipoMuestra.max_mohLev || '',
        max_mohLev_exp: tipoMuestra.max_mohLev_exp?.toString() || '',
        mesofilos: Boolean(tipoMuestra.mesofilos),
        coliformes: Boolean(tipoMuestra.coliformes),
        mohos: Boolean(tipoMuestra.mohos),
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        put(route('externo.tipos-muestra.update', tipoMuestra.id));
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Editar Tipo de Muestra" />
            <div className="max-w-3xl mx-auto py-4 px-4">
                <h1 className="text-2xl font-bold mb-4">Editar Tipo de Muestra</h1>
                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Datos generales */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <FormInput
                            id="nombre"
                            label="Nombre *"
                            value={data.nombre}
                            onChange={(e) => setData('nombre', e.target.value)}
                            error={errors.nombre}
                        />
                        <FormInput
                            id="norma_referencial"
                            label="Norma Referencial *"
                            value={data.norma_referencial}
                            onChange={(e) => setData('norma_referencial', e.target.value)}
                            error={errors.norma_referencial}
                        />
                        <FormInput
                            id="unidad"
                            label="Unidad"
                            value={data.unidad}
                            onChange={(e) => setData('unidad', e.target.value)}
                        />
                        <FormInput
                            id="aclaracion_unidad"
                            label="Aclaración Unidad"
                            value={data.aclaracion_unidad}
                            onChange={(e) => setData('aclaracion_unidad', e.target.value)}
                        />
                    </div>

                    <div className="space-y-4">
                        <h2 className="text-lg font-semibold">Análisis aplicables</h2>
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 rounded-md border p-4">
                            {[
                                { key: 'mesofilos' as const, label: 'Mesófilos' },
                                { key: 'coliformes' as const, label: 'Coliformes' },
                                { key: 'mohos' as const, label: 'Mohos' },
                            ].map((item) => (
                                <label key={item.key} className="flex items-center gap-2 text-sm font-medium">
                                    <Checkbox
                                        checked={data[item.key]}
                                        onCheckedChange={(checked) => setData(item.key, checked === true)}
                                    />
                                    <span>{item.label}</span>
                                </label>
                            ))}
                        </div>
                    </div>

                    {/* Límites microbiológicos */}
                    <div className="space-y-4">
                        <h2 className="text-lg font-semibold">Límites Microbiológicos</h2>
                        {(['mes', 'colTot', 'mohLev'] as const).map((tipo) => {
                            const minKey = `min_${tipo}` as keyof typeof data;
                            const minExpKey = `min_${tipo}_exp` as keyof typeof data;
                            const maxKey = `max_${tipo}` as keyof typeof data;
                            const maxExpKey = `max_${tipo}_exp` as keyof typeof data;
                            return (
                                <div key={tipo} className="border rounded-md p-3 grid grid-cols-2 sm:grid-cols-4 gap-3">
                                    <FormInput
                                        id={`min_${tipo}`}
                                        label={`${tipo} Mín.`}
                                        value={data[minKey] as string}
                                        onChange={(e) => setData(minKey, e.target.value)}
                                        placeholder="Valor"
                                    />
                                    <FormInput
                                        id={`min_${tipo}_exp`}
                                        label="Exp"
                                        type="number"
                                        value={data[minExpKey] as string}
                                        onChange={(e) => setData(minExpKey, e.target.value)}
                                        placeholder="10^"
                                    />
                                    <FormInput
                                        id={`max_${tipo}`}
                                        label={`${tipo} Máx.`}
                                        value={data[maxKey] as string}
                                        onChange={(e) => setData(maxKey, e.target.value)}
                                        placeholder="Valor"
                                    />
                                    <FormInput
                                        id={`max_${tipo}_exp`}
                                        label="Exp"
                                        type="number"
                                        value={data[maxExpKey] as string}
                                        onChange={(e) => setData(maxExpKey, e.target.value)}
                                        placeholder="10^"
                                    />
                                </div>
                            );
                        })}
                    </div>

                    {/* Botones */}
                    <div className="flex justify-end gap-3">
                        <Button variant="outline" type="button" onClick={() => window.history.back()}>
                            Cancelar
                        </Button>
                        <Button type="submit" disabled={processing}>
                            {processing ? 'Guardando...' : 'Actualizar Tipo de Muestra'}
                        </Button>
                    </div>
                </form>
            </div>
        </AppLayout>
    );
}