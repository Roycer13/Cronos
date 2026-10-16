import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import AppLayout from '@/layouts/app-layout';
import { Head, useForm, usePage } from '@inertiajs/react';
import { Thermometer, Save } from 'lucide-react';
import { route } from 'ziggy-js';
import FormInput from '@/components/ui/form-input';
import { Toast } from '@/components/ui/toast';

interface Lugar {
    id: number;
    nombre: string;
}

interface Props {
    lugares: Lugar[];
}

export default function Crear() {
    const { lugares } = usePage<Props>().props;

    const { data, setData, post, processing, errors } = useForm({
        tiempo: new Date(Date.now() - new Date().getTimezoneOffset() * 60000)
            .toISOString()
            .slice(0, 16),
        registros: lugares.map(lugar => ({
            lugar_id: lugar.id,
            temperatura: '',
            humedad: '',
            ident: true,
            observaciones: '',
        })),
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        post(route('temperaturas-almacen-congelador.store'));
    };

    const updateRegistro = (index: number, field: string, value: any) => {
        const nuevos = [...data.registros];
        (nuevos as any)[index][field] = value;
        setData('registros', nuevos);
    };

    return (
        <AppLayout breadcrumbs={[{ title: 'Nuevo Registro de Temperaturas', href: '#' }]}>
            <Head title="Nuevo Registro Masivo de Temperaturas" />
            <div className="px-4 py-6">
                <Toast />
                <div className="mb-6">
                    <h1 className="text-2xl font-bold flex items-center gap-2">
                        <Thermometer className="h-6 w-6" />
                        Registro de Temperaturas - Almacén/Congelador
                    </h1>
                    <p className="text-muted-foreground">
                        Complete los campos para todos los lugares de tipo Almacén
                    </p>
                </div>

                <form onSubmit={handleSubmit}>
                    <Card className="p-4 mb-4">
                        <FormInput
                            id="tiempo"
                            label="Fecha y Hora"
                            type="datetime-local"
                            value={data.tiempo}
                            onChange={(e) => setData('tiempo', e.target.value)}
                            error={errors.tiempo}
                            required
                        />
                    </Card>

                    <div className="space-y-4">
                        {lugares.map((lugar, index) => (
                            <Card key={lugar.id} className="p-4">
                                <h3 className="font-semibold mb-3">{lugar.nombre}</h3>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                                    <FormInput
                                        label="Temperatura (°C)"
                                        type="number"
                                        step="0.01"
                                        value={data.registros[index].temperatura}
                                        onChange={(e) => updateRegistro(index, 'temperatura', e.target.value)}
                                        placeholder="0.00"
                                    />
                                    <FormInput
                                        label="Humedad (%)"
                                        type="number"
                                        step="0.01"
                                        value={data.registros[index].humedad}
                                        onChange={(e) => updateRegistro(index, 'humedad', e.target.value)}
                                        placeholder="0.00"
                                    />
                                    <div className="flex items-center space-x-2 pt-6">
                                        <input
                                            type="checkbox"
                                            checked={data.registros[index].ident}
                                            onChange={(e) => updateRegistro(index, 'ident', e.target.checked)}
                                            className="rounded border-gray-300"
                                        />
                                        <label className="font-medium text-sm">Ident</label>
                                    </div>
                                </div>
                                <div className="mt-3">
                                    <FormInput
                                        label="Observaciones"
                                        value={data.registros[index].observaciones}
                                        onChange={(e) => updateRegistro(index, 'observaciones', e.target.value)}
                                        placeholder="Observaciones..."
                                    />
                                </div>
                            </Card>
                        ))}
                    </div>

                    <div className="mt-6 flex justify-end">
                        <Button type="submit" disabled={processing} className="flex items-center gap-2">
                            <Save className="h-4 w-4" />
                            {processing ? 'Guardando...' : 'Guardar Todos'}
                        </Button>
                    </div>
                </form>
            </div>
        </AppLayout>
    );
}