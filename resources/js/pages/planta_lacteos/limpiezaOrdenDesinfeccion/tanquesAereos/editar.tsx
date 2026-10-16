// resources/js/Pages/planta_lacteos/limpiezaTanquesAereos/editar.tsx

import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import FormSelect from '@/components/ui/form-select';
import AppLayout from '@/layouts/app-layout';
import { Head, useForm } from '@inertiajs/react';
import { route } from 'ziggy-js';
import * as React from 'react';

export default function Editar({ limpieza, usuarios }) {
    const { data, setData, put, processing, errors } = useForm({
        tiempo: limpieza.tiempo.slice(0, 16),
        tanque: limpieza.tanque || '',
        user_id: limpieza.user_id.toString(),
        l_tapa: limpieza.l_tapa,
        d_tapa: limpieza.d_tapa,
        l_paredes: limpieza.l_paredes,
        d_paredes: limpieza.d_paredes,
        l_piso: limpieza.l_piso,
        d_piso: limpieza.d_piso,
        l_conexiones: limpieza.l_conexiones,
        d_conexiones: limpieza.d_conexiones,
        correccion: limpieza.correccion || '',
        observacion: limpieza.observacion || '',
    });

    const handleSubmit = (e) => {
        e.preventDefault();
        put(route('limpieza-tanques-aereos.update', limpieza.id));
    };

    const userOptions = usuarios.map(user => ({
        value: user.id.toString(),
        label: `${user.name} ${user.apellido || ''}`,
    }));

    return (
        <AppLayout breadcrumbs={[
            { title: 'Limpieza Tanques Aéreos', href: route('limpieza-tanques-aereos.index') },
            { title: `Editar #${limpieza.id}`, href: '' }
        ]}>
            <Head title="Editar Limpieza de Tanque" />
            <div className="px-4 sm:px-6 py-6 max-w-5xl mx-auto">
                <h1 className="text-2xl font-bold mb-6">Editar Limpieza de Tanque Aéreo</h1>
                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="bg-card rounded-lg border p-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <Label>Fecha y hora *</Label>
                                <Input
                                    type="datetime-local"
                                    value={data.tiempo}
                                    onChange={(e) => setData('tiempo', e.target.value)}
                                    required
                                />
                                {errors.tiempo && <p className="text-red-500 text-sm">{errors.tiempo}</p>}
                            </div>
                            <div>
                                <Label>Tanque</Label>
                                <Input
                                    value={data.tanque}
                                    onChange={(e) => setData('tanque', e.target.value)}
                                    placeholder="Ej: Tanque 1"
                                />
                            </div>
                            <div>
                                <FormSelect
                                    label="Responsable *"
                                    value={data.user_id}
                                    onChange={(value) => setData('user_id', value)}
                                    options={userOptions}
                                    placeholder="Seleccione un usuario"
                                    error={errors.user_id}
                                    searchable
                                    clearable={false}
                                />
                            </div>
                        </div>
                    </div>

                    {/* Mismo bloque de checkboxes que en crear (copiar igual) */}
                    <div className="bg-card rounded-lg border p-4">
                        <h2 className="text-lg font-semibold mb-4">Verificación de limpieza y desinfección</h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {/* Tapa */}
                            <div className="space-y-2">
                                <Label className="font-medium">Tapa</Label>
                                <div className="flex gap-6">
                                    <div className="flex items-center space-x-2">
                                        <Checkbox id="l_tapa" checked={data.l_tapa} onCheckedChange={(val) => setData('l_tapa', val)} />
                                        <Label htmlFor="l_tapa">Limpieza</Label>
                                    </div>
                                    <div className="flex items-center space-x-2">
                                        <Checkbox id="d_tapa" checked={data.d_tapa} onCheckedChange={(val) => setData('d_tapa', val)} />
                                        <Label htmlFor="d_tapa">Desinfección</Label>
                                    </div>
                                </div>
                            </div>
                            {/* Paredes */}
                            <div className="space-y-2">
                                <Label className="font-medium">Paredes</Label>
                                <div className="flex gap-6">
                                    <div className="flex items-center space-x-2">
                                        <Checkbox id="l_paredes" checked={data.l_paredes} onCheckedChange={(val) => setData('l_paredes', val)} />
                                        <Label htmlFor="l_paredes">Limpieza</Label>
                                    </div>
                                    <div className="flex items-center space-x-2">
                                        <Checkbox id="d_paredes" checked={data.d_paredes} onCheckedChange={(val) => setData('d_paredes', val)} />
                                        <Label htmlFor="d_paredes">Desinfección</Label>
                                    </div>
                                </div>
                            </div>
                            {/* Piso */}
                            <div className="space-y-2">
                                <Label className="font-medium">Piso</Label>
                                <div className="flex gap-6">
                                    <div className="flex items-center space-x-2">
                                        <Checkbox id="l_piso" checked={data.l_piso} onCheckedChange={(val) => setData('l_piso', val)} />
                                        <Label htmlFor="l_piso">Limpieza</Label>
                                    </div>
                                    <div className="flex items-center space-x-2">
                                        <Checkbox id="d_piso" checked={data.d_piso} onCheckedChange={(val) => setData('d_piso', val)} />
                                        <Label htmlFor="d_piso">Desinfección</Label>
                                    </div>
                                </div>
                            </div>
                            {/* Conexiones */}
                            <div className="space-y-2">
                                <Label className="font-medium">Conexiones</Label>
                                <div className="flex gap-6">
                                    <div className="flex items-center space-x-2">
                                        <Checkbox id="l_conexiones" checked={data.l_conexiones} onCheckedChange={(val) => setData('l_conexiones', val)} />
                                        <Label htmlFor="l_conexiones">Limpieza</Label>
                                    </div>
                                    <div className="flex items-center space-x-2">
                                        <Checkbox id="d_conexiones" checked={data.d_conexiones} onCheckedChange={(val) => setData('d_conexiones', val)} />
                                        <Label htmlFor="d_conexiones">Desinfección</Label>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="bg-card rounded-lg border p-4 space-y-4">
                        <div>
                            <Label>Corrección requerida</Label>
                            <Textarea value={data.correccion} onChange={(e) => setData('correccion', e.target.value)} rows={2} />
                        </div>
                        <div>
                            <Label>Observaciones generales</Label>
                            <Textarea value={data.observacion} onChange={(e) => setData('observacion', e.target.value)} rows={2} />
                        </div>
                    </div>

                    <div className="flex justify-end gap-3">
                        <Button variant="outline" onClick={() => window.history.back()}>Cancelar</Button>
                        <Button type="submit" disabled={processing}>Actualizar</Button>
                    </div>
                </form>
            </div>
        </AppLayout>
    );
}
