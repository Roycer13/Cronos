import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Toast } from '@/components/ui/toast';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, Link, router, usePage } from '@inertiajs/react';
import { ArrowLeft, Beaker, Save, TestTube } from 'lucide-react';
import { useState } from 'react';
import { route } from 'ziggy-js';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Análisis de Línea', href: '/analisis-linea' },
    { title: 'Editar Análisis', href: '#' },
];

interface PageProps {
    analisis: any;
    estados: any[];
    analistas: any[];
    flash: {
        success?: string;
        error?: string;
    };
}

export default function Edit() {
    const { props } = usePage();
    const { analisis, estados, analistas, flash } =
        props as unknown as PageProps;

    const [formData, setFormData] = useState({
        temperatura: analisis.temperatura || '',
        ph: analisis.ph || '',
        acidez: analisis.acidez || '',
        brix: analisis.brix || '',
        viscosidad: analisis.viscosidad || '',
        densidad: analisis.densidad || '',
        color: analisis.color ?? '',
        olor: analisis.olor ?? '',
        sabor: analisis.sabor ?? '',
        aspecto: analisis.aspecto || '',
        peso: analisis.peso || '',
        volumen: analisis.volumen || '',
        observaciones: analisis.observaciones || '',
        tempUHT: analisis.tempUHT || '',
    });

    const [errors, setErrors] = useState<Record<string, string>>({});

    const handleChange = (
        e: React.ChangeEvent<
            HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
        >,
    ) => {
        const { name, value, type } = e.target;
        let finalValue: string | boolean = value;

        if (type === 'checkbox') {
            finalValue = (e.target as HTMLInputElement).checked;
        } else if (type === 'number') {
            finalValue = value === '' ? '' : value;
        }

        setFormData((prev) => ({
            ...prev,
            [name]: finalValue,
        }));

        // Limpiar error del campo cuando se modifica
        if (errors[name]) {
            setErrors((prev) => ({ ...prev, [name]: '' }));
        }
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        router.put(route('analisis-linea.update', analisis.id), formData, {
            onSuccess: () => {
                // Éxito manejado por el controlador
            },
            onError: (err) => {
                setErrors(err as any);
            },
        });
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Editar Análisis de Línea" />
            <div className="space-y-2 px-2 py-2 sm:px-6">
                <Toast />

                {/* Header */}
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <Link href={route('analisis-linea.index')}>
                            <Button variant="outline" size="sm">
                                <ArrowLeft className="h-4 w-4" />
                            </Button>
                        </Link>
                        <div className="flex items-center gap-2">
                            <TestTube className="h-6 w-6 text-primary" />
                            <h1 className="text-2xl font-bold text-foreground">
                                Editar Análisis de Línea
                            </h1>
                        </div>
                    </div>
                </div>

                {/* Información de la solicitud */}
                <div className="rounded-lg border border-border bg-muted/50 p-4">
                    <h3 className="mb-3 flex items-center gap-2 text-lg font-semibold">
                        <Beaker className="h-5 w-5" />
                        Información de la Solicitud
                    </h3>
                    <div className="grid grid-cols-1 gap-4 text-sm md:grid-cols-3">
                        <div>
                            <span className="text-muted-foreground">
                                Solicitante:
                            </span>
                            <p className="font-medium">
                                {analisis.solicitante?.name}
                            </p>
                        </div>
                        <div>
                            <span className="text-muted-foreground">
                                Fecha solicitud:
                            </span>
                            <p className="font-medium">
                                {new Date(
                                    analisis.tiempo_solicitud,
                                ).toLocaleString('es-ES')}
                            </p>
                        </div>
                        <div>
                            <span className="text-muted-foreground">
                                Estado planta:
                            </span>
                            <p className="font-medium">
                                {analisis.estado_planta?.origen?.alias} -{' '}
                                {analisis.estado_planta?.proceso?.nombre}
                            </p>
                        </div>
                    </div>
                </div>

                {/* Formulario de análisis */}
                <div className="overflow-hidden rounded-lg border border-border bg-background shadow-sm">
                    <form onSubmit={handleSubmit} className="space-y-6 p-6">
                        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
                            {/* Temperatura */}
                            <div className="space-y-2">
                                <Label htmlFor="temperatura">
                                    Temperatura (°C)
                                </Label>
                                <Input
                                    id="temperatura"
                                    name="temperatura"
                                    type="number"
                                    step="0.01"
                                    value={formData.temperatura}
                                    onChange={handleChange}
                                    placeholder="0.00"
                                />
                                {errors.temperatura && (
                                    <p className="text-sm text-destructive">
                                        {errors.temperatura}
                                    </p>
                                )}
                            </div>

                            {/* pH */}
                            <div className="space-y-2">
                                <Label htmlFor="ph">pH</Label>
                                <Input
                                    id="ph"
                                    name="ph"
                                    type="number"
                                    step="0.01"
                                    value={formData.ph}
                                    onChange={handleChange}
                                    placeholder="0.00"
                                />
                                {errors.ph && (
                                    <p className="text-sm text-destructive">
                                        {errors.ph}
                                    </p>
                                )}
                            </div>

                            {/* Acidez */}
                            <div className="space-y-2">
                                <Label htmlFor="acidez">Acidez</Label>
                                <Input
                                    id="acidez"
                                    name="acidez"
                                    type="number"
                                    step="0.001"
                                    value={formData.acidez}
                                    onChange={handleChange}
                                    placeholder="0.000"
                                />
                                {errors.acidez && (
                                    <p className="text-sm text-destructive">
                                        {errors.acidez}
                                    </p>
                                )}
                            </div>

                            {/* Brix */}
                            <div className="space-y-2">
                                <Label htmlFor="brix">Brix (°Bx)</Label>
                                <Input
                                    id="brix"
                                    name="brix"
                                    type="number"
                                    step="0.01"
                                    value={formData.brix}
                                    onChange={handleChange}
                                    placeholder="0.00"
                                />
                                {errors.brix && (
                                    <p className="text-sm text-destructive">
                                        {errors.brix}
                                    </p>
                                )}
                            </div>

                            {/* Viscosidad */}
                            <div className="space-y-2">
                                <Label htmlFor="viscosidad">Viscosidad</Label>
                                <Input
                                    id="viscosidad"
                                    name="viscosidad"
                                    type="number"
                                    step="0.01"
                                    value={formData.viscosidad}
                                    onChange={handleChange}
                                    placeholder="0.00"
                                />
                                {errors.viscosidad && (
                                    <p className="text-sm text-destructive">
                                        {errors.viscosidad}
                                    </p>
                                )}
                            </div>

                            {/* Densidad */}
                            <div className="space-y-2">
                                <Label htmlFor="densidad">Densidad</Label>
                                <Input
                                    id="densidad"
                                    name="densidad"
                                    type="number"
                                    step="0.001"
                                    value={formData.densidad}
                                    onChange={handleChange}
                                    placeholder="0.000"
                                />
                                {errors.densidad && (
                                    <p className="text-sm text-destructive">
                                        {errors.densidad}
                                    </p>
                                )}
                            </div>

                            {/* Peso */}
                            <div className="space-y-2">
                                <Label htmlFor="peso">Pdsdseso (kg)</Label>
                                <Input
                                    id="peso"
                                    name="peso"
                                    type="number"
                                    step="0.01"
                                    value={formData.peso}
                                    onChange={handleChange}
                                    placeholder="0.00"
                                />
                                {errors.peso && (
                                    <p className="text-sm text-destructive">
                                        {errors.peso}
                                    </p>
                                )}
                            </div>

                            {/* Volumen */}
                            <div className="space-y-2">
                                <Label htmlFor="volumen">Volumen (L)</Label>
                                <Input
                                    id="volumen"
                                    name="volumen"
                                    type="number"
                                    step="0.01"
                                    value={formData.volumen}
                                    onChange={handleChange}
                                    placeholder="0.00"
                                />
                                {errors.volumen && (
                                    <p className="text-sm text-destructive">
                                        {errors.volumen}
                                    </p>
                                )}
                            </div>

                            {/* TempUHT */}
                            <div className="space-y-2">
                                <Label htmlFor="tempUHT">
                                    Temperatura UHT (°C)
                                </Label>
                                <Input
                                    id="tempUHT"
                                    name="tempUHT"
                                    type="number"
                                    step="0.01"
                                    value={formData.tempUHT}
                                    onChange={handleChange}
                                    placeholder="0.00"
                                />
                                {errors.tempUHT && (
                                    <p className="text-sm text-destructive">
                                        {errors.tempUHT}
                                    </p>
                                )}
                            </div>
                        </div>

                        {/* Campos de tipo boolean y texto */}
                        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
                            {/* Color */}
                            <div className="space-y-2">
                                <Label htmlFor="color">Color</Label>
                                <select
                                    id="color"
                                    name="color"
                                    value={
                                        formData.color === ''
                                            ? ''
                                            : formData.color
                                              ? '1'
                                              : '0'
                                    }
                                    onChange={(e) =>
                                        handleChange({
                                            ...e,
                                            target: {
                                                ...e.target,
                                                value: e.target.value === '1',
                                            },
                                        } as any)
                                    }
                                    className="w-full rounded-md border border-border px-3 py-2 shadow-sm focus:border-primary focus:ring-2 focus:ring-primary focus:outline-none"
                                >
                                    <option value="">Seleccionar...</option>
                                    <option value="1">Aceptable</option>
                                    <option value="0">No Aceptable</option>
                                </select>
                                {errors.color && (
                                    <p className="text-sm text-destructive">
                                        {errors.color}
                                    </p>
                                )}
                            </div>

                            {/* Olor */}
                            <div className="space-y-2">
                                <Label htmlFor="olor">Olor</Label>
                                <select
                                    id="olor"
                                    name="olor"
                                    value={
                                        formData.olor === ''
                                            ? ''
                                            : formData.olor
                                              ? '1'
                                              : '0'
                                    }
                                    onChange={(e) =>
                                        handleChange({
                                            ...e,
                                            target: {
                                                ...e.target,
                                                value: e.target.value === '1',
                                            },
                                        } as any)
                                    }
                                    className="w-full rounded-md border border-border px-3 py-2 shadow-sm focus:border-primary focus:ring-2 focus:ring-primary focus:outline-none"
                                >
                                    <option value="">Seleccionar...</option>
                                    <option value="1">Aceptable</option>
                                    <option value="0">No Aceptable</option>
                                </select>
                                {errors.olor && (
                                    <p className="text-sm text-destructive">
                                        {errors.olor}
                                    </p>
                                )}
                            </div>

                            {/* Sabor */}
                            <div className="space-y-2">
                                <Label htmlFor="sabor">Sabor</Label>
                                <select
                                    id="sabor"
                                    name="sabor"
                                    value={
                                        formData.sabor === ''
                                            ? ''
                                            : formData.sabor
                                              ? '1'
                                              : '0'
                                    }
                                    onChange={(e) =>
                                        handleChange({
                                            ...e,
                                            target: {
                                                ...e.target,
                                                value: e.target.value === '1',
                                            },
                                        } as any)
                                    }
                                    className="w-full rounded-md border border-border px-3 py-2 shadow-sm focus:border-primary focus:ring-2 focus:ring-primary focus:outline-none"
                                >
                                    <option value="">Seleccionar...</option>
                                    <option value="1">Aceptable</option>
                                    <option value="0">No Aceptable</option>
                                </select>
                                {errors.sabor && (
                                    <p className="text-sm text-destructive">
                                        {errors.sabor}
                                    </p>
                                )}
                            </div>

                            {/* Aspecto */}
                            <div className="space-y-2">
                                <Label htmlFor="aspecto">Aspecto</Label>
                                <Input
                                    id="aspecto"
                                    name="aspecto"
                                    type="text"
                                    value={formData.aspecto}
                                    onChange={handleChange}
                                    placeholder="Aspecto del producto"
                                />
                                {errors.aspecto && (
                                    <p className="text-sm text-destructive">
                                        {errors.aspecto}
                                    </p>
                                )}
                            </div>
                        </div>

                        {/* Observaciones */}
                        <div className="space-y-2">
                            <Label htmlFor="observaciones">Observaciones</Label>
                            <Textarea
                                id="observaciones"
                                name="observaciones"
                                rows={3}
                                value={formData.observaciones}
                                onChange={handleChange}
                                placeholder="Observaciones sobre el análisis..."
                                className="resize-none"
                            />
                            {errors.observaciones && (
                                <p className="text-sm text-destructive">
                                    {errors.observaciones}
                                </p>
                            )}
                        </div>

                        {/* Botones */}
                        <div className="flex justify-end gap-2 border-t border-border pt-6">
                            <Link href={route('analisis-linea.index')}>
                                <Button variant="outline" type="button">
                                    Cancelar
                                </Button>
                            </Link>
                            <Button type="submit">
                                <Save className="mr-2 h-4 w-4" />
                                Actualizar Análisis
                            </Button>
                        </div>
                    </form>
                </div>
            </div>
        </AppLayout>
    );
}
