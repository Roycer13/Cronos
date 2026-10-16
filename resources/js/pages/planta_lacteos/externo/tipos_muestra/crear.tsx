
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import FormInput from '@/components/ui/form-input';
import AppLayout from '@/layouts/app-layout';
import { Head, useForm, usePage } from '@inertiajs/react';
import { route } from 'ziggy-js';

const breadcrumbs = [{ title: 'Tipos de Muestra', href: '/planta-lacteos/externo/tipos-muestra' }, { title: 'Nuevo', href: '' }];

interface FormData {
    nombre: string;
    norma_referencial: string;
    unidad: string;
    aclaracion_unidad: string;
    min_mes: string;
    min_mes_exp: string;
    max_mes: string;
    max_mes_exp: string;
    min_colTot: string;
    min_colTot_exp: string;
    max_colTot: string;
    max_colTot_exp: string;
    min_mohLev: string;
    min_mohLev_exp: string;
    max_mohLev: string;
    max_mohLev_exp: string;
    mesofilos: boolean;
    coliformes: boolean;
    mohos: boolean;
}

export default function Create() {
    const { data, setData, post, processing, errors } = useForm<FormData>({
        nombre: '',
        norma_referencial: '',
        unidad: '',
        aclaracion_unidad: '',
        min_mes: '',
        min_mes_exp: '',
        max_mes: '',
        max_mes_exp: '',
        min_colTot: '',
        min_colTot_exp: '',
        max_colTot: '',
        max_colTot_exp: '',
        min_mohLev: '',
        min_mohLev_exp: '',
        max_mohLev: '',
        max_mohLev_exp: '',
        mesofilos: false,
        coliformes: false,
        mohos: false,
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        post(route('externo.tipos-muestra.store'));
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Nuevo Tipo de Muestra" />
            <div className="max-w-3xl mx-auto py-4 px-4">
                <h1 className="text-2xl font-bold mb-4">Nuevo Tipo de Muestra</h1>
                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <FormInput id="nombre" label="Nombre *" value={data.nombre} onChange={e => setData('nombre', e.target.value)} error={errors.nombre} />
                        <FormInput id="norma_referencial" label="Norma Referencial *" value={data.norma_referencial} onChange={e => setData('norma_referencial', e.target.value)} error={errors.norma_referencial} />
                        <FormInput id="unidad" label="Unidad" value={data.unidad} onChange={e => setData('unidad', e.target.value)} />
                        <FormInput id="aclaracion_unidad" label="Aclaración Unidad" value={data.aclaracion_unidad} onChange={e => setData('aclaracion_unidad', e.target.value)} />
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

                    {/* Campos con notación científica */}
                    <div className="space-y-4">
                        <h2 className="text-lg font-semibold">Límites Microbiológicos</h2>
                        {(['mes', 'colTot', 'mohLev'] as const).map((tipo) => {
                            const minKey = `min_${tipo}` as keyof FormData;
                            const minExpKey = `min_${tipo}_exp` as keyof FormData;
                            const maxKey = `max_${tipo}` as keyof FormData;
                            const maxExpKey = `max_${tipo}_exp` as keyof FormData;
                            return (
                                <div key={tipo} className="border rounded-md p-3 grid grid-cols-2 sm:grid-cols-4 gap-3">
                                    <FormInput id={`min_${tipo}`} label={`${tipo} Min`} value={data[minKey] as string} onChange={e => setData(minKey, e.target.value)} placeholder="Valor" />
                                    <FormInput id={`min_${tipo}_exp`} label="Exp" type="number" value={data[minExpKey] as string} onChange={e => setData(minExpKey, e.target.value)} placeholder="10^" />
                                    <FormInput id={`max_${tipo}`} label={`${tipo} Max`} value={data[maxKey] as string} onChange={e => setData(maxKey, e.target.value)} placeholder="Valor" />
                                    <FormInput id={`max_${tipo}_exp`} label="Exp" type="number" value={data[maxExpKey] as string} onChange={e => setData(maxExpKey, e.target.value)} placeholder="10^" />
                                </div>
                            );
                        })}
                    </div>

                    <div className="flex justify-end gap-3">
                        <Button variant="outline" type="button" onClick={() => window.history.back()}>Cancelar</Button>
                        <Button type="submit" disabled={processing}>
                            {processing ? 'Guardando...' : 'Crear Tipo de Muestra'}
                        </Button>
                    </div>
                </form>
            </div>
        </AppLayout>
    );
}