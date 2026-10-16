import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Toast } from '@/components/ui/toast';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, Link, router, usePage } from '@inertiajs/react';
import { ArrowLeft, Beaker, Eye, Play, RefreshCw, Save } from 'lucide-react';
import { useState } from 'react';
import { route } from 'ziggy-js';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Análisis de Línea', href: '/analisis-linea' },
    { title: 'Realizar Análisis', href: '#' },
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

export default function Analizar() {
    const { props } = usePage();
    const { analisis, estados, analistas, flash } =
        props as unknown as PageProps;

    const [formData, setFormData] = useState({
        temperatura: '',
        ph: '',
        acidez: '',
        brix: '',
        viscosidad: '',
        densidad: '',
        color: '1',
        olor: '1',
        sabor: '1',
        aspecto: '',
        peso: '',
        volumen: '',
        observaciones: '',
        tempUHT: '',
    });

    const [errors, setErrors] = useState<Record<string, string>>({});
    const [processing, setProcessing] = useState(false);

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

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            const form = (e.target as HTMLElement).closest('form');
            if (form) {
                const index = Array.from(form.elements).indexOf(e.target as any);
                const nextElement = form.elements[index + 1] as HTMLElement;
                if (nextElement && (nextElement.tagName === 'INPUT' || nextElement.tagName === 'SELECT' || nextElement.tagName === 'TEXTAREA')) {
                    nextElement.focus();
                } else if (nextElement && nextElement.tagName === 'BUTTON' && nextElement.getAttribute('type') === 'submit') {
                    // Si el siguiente es el botón de submit, no hacemos nada especial, dejamos que el form haga submit si el usuario vuelve a presionar enter o simplemente lo enfocamos
                    nextElement.focus();
                }
            }
        }
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setProcessing(true);

        router.put(route('analisis-linea.update', analisis.id), formData, {
            onSuccess: () => {
                setProcessing(false);
            },
            onError: (err) => {
                setErrors(err as any);
                setProcessing(false);
            },
            onFinish: () => setProcessing(false),
        });
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Realizar Análisis de Línea" />
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
                            <Play className="h-6 w-6 text-primary" />
                            <h1 className="text-2xl font-bold text-foreground">
                                Realizar Análisis
                            </h1>
                        </div>
                    </div>
                </div>

                {/* Información de la solicitud */}
                <div className="overflow-hidden rounded-xl border border-border bg-card shadow-sm">
                    <div className="border-b border-border bg-muted/30 px-4 py-3">
                        <h3 className="flex items-center gap-2 text-sm font-bold tracking-wider text-muted-foreground uppercase">
                            <Beaker className="h-4 w-4" />
                            Detalles de la Solicitud
                        </h3>
                    </div>
                    <div className="p-4">
                        <div className="grid grid-cols-1 gap-x-6 gap-y-4 md:grid-cols-2 lg:grid-cols-4">
                            {/* Producto - Spans more columns because it can be long */}
                            <div className="md:col-span-2 lg:col-span-2">
                                <span className="text-xs font-medium text-muted-foreground uppercase">
                                    Producto
                                </span>
                                <p className="mt-1 text-base leading-tight font-bold text-foreground">
                                    {
                                        analisis.estado_planta.estado_detalle
                                            .orp.producto_terminado
                                            ?.nombre_comercial
                                    }
                                </p>
                            </div>

                            <div>
                                <span className="text-xs font-medium text-muted-foreground uppercase">
                                    ORP / Preparación
                                </span>
                                <div className="mt-1 flex items-center gap-2">
                                    <span className="inline-flex items-center rounded-md bg-primary/10 px-2 py-1 text-xs font-bold text-primary">
                                        {
                                            analisis.estado_planta
                                                .estado_detalle.orp?.codigo
                                        }
                                    </span>
                                    <span className="text-sm font-semibold">
                                        {
                                            analisis.estado_planta
                                                .estado_detalle?.preparacion
                                        }
                                    </span>
                                </div>
                            </div>

                            <div>
                                <span className="text-xs font-medium text-muted-foreground uppercase">
                                    Origen / Proceso
                                </span>
                                <p className="mt-1 text-sm font-semibold">
                                    {analisis.estado_planta?.origen?.alias}{' '}
                                    <span className="mx-1 text-muted-foreground">
                                        |
                                    </span>{' '}
                                    {analisis.estado_planta?.proceso?.nombre}
                                </p>
                            </div>

                            <div className="border-t border-border pt-3 md:border-0 md:pt-0">
                                <span className="text-xs font-medium text-muted-foreground uppercase">
                                    Solicitado por
                                </span>
                                <p className="mt-1 text-sm font-medium">
                                    {analisis.solicitante?.name}
                                </p>
                            </div>

                            <div className="border-t border-border pt-3 md:border-0 md:pt-0">
                                <span className="text-xs font-medium text-muted-foreground uppercase">
                                    Fecha y Hora
                                </span>
                                <p className="mt-1 text-sm font-medium">
                                    {new Date(
                                        analisis.tiempo_solicitud,
                                    ).toLocaleString('es-ES', {
                                        day: '2-digit',
                                        month: '2-digit',
                                        year: 'numeric',
                                        hour: '2-digit',
                                        minute: '2-digit',
                                    })}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Formulario de análisis */}
                <div className="overflow-hidden rounded-lg border border-border bg-background shadow-sm">
                    <form onSubmit={handleSubmit} className="space-y-6 p-6">
                        {/* Parámetros Físico-Químicos (Compactos) */}
                        <div className="rounded-xl border border-border bg-muted/20 p-4">
                            <h4 className="mb-4 flex items-center gap-2 text-xs font-bold tracking-wider text-muted-foreground uppercase">
                                <Beaker className="h-3.5 w-3.5" />
                                Parámetros Físico-Químicos
                            </h4>
                            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
                                {/* Temperatura */}
                                <div className="space-y-1.5">
                                    <Label
                                        htmlFor="temperatura"
                                        className="text-xs font-semibold"
                                    >
                                        Temperatura (°C)
                                    </Label>
                                    <Input
                                        id="temperatura"
                                        name="temperatura"
                                        type="number"
                                        step="0.01"
                                        value={formData.temperatura}
                                        onChange={handleChange}
                                        onKeyDown={handleKeyDown}
                                        placeholder="0.00"
                                        autoFocus
                                        className="h-9"
                                    />
                                    {errors.temperatura && (
                                        <p className="text-[10px] font-medium text-destructive">
                                            {errors.temperatura}
                                        </p>
                                    )}
                                </div>

                                {/* pH */}
                                <div className="space-y-1.5">
                                    <Label
                                        htmlFor="ph"
                                        className="text-xs font-semibold"
                                    >
                                        pH
                                    </Label>
                                    <Input
                                        id="ph"
                                        name="ph"
                                        type="number"
                                        step="0.01"
                                        value={formData.ph}
                                        onChange={handleChange}
                                        onKeyDown={handleKeyDown}
                                        placeholder="0.00"
                                        className="h-9"
                                    />
                                    {errors.ph && (
                                        <p className="text-[10px] font-medium text-destructive">
                                            {errors.ph}
                                        </p>
                                    )}
                                </div>

                                {/* Acidez */}
                                <div className="space-y-1.5">
                                    <Label
                                        htmlFor="acidez"
                                        className="text-xs font-semibold"
                                    >
                                        Acidez
                                    </Label>
                                    <Input
                                        id="acidez"
                                        name="acidez"
                                        type="number"
                                        step="0.001"
                                        value={formData.acidez}
                                        onChange={handleChange}
                                        placeholder="0.000"
                                        className="h-9"
                                    />
                                    {errors.acidez && (
                                        <p className="text-[10px] font-medium text-destructive">
                                            {errors.acidez}
                                        </p>
                                    )}
                                </div>

                                {/* Brix */}
                                <div className="space-y-1.5">
                                    <Label
                                        htmlFor="brix"
                                        className="text-xs font-semibold"
                                    >
                                        Brix (°Bx)
                                    </Label>
                                    <Input
                                        id="brix"
                                        name="brix"
                                        type="number"
                                        step="0.01"
                                        value={formData.brix}
                                        onChange={handleChange}
                                        placeholder="0.00"
                                        className="h-9"
                                    />
                                    {errors.brix && (
                                        <p className="text-[10px] font-medium text-destructive">
                                            {errors.brix}
                                        </p>
                                    )}
                                </div>

                                {/* Viscosidad */}
                                <div className="space-y-1.5">
                                    <Label
                                        htmlFor="viscosidad"
                                        className="text-xs font-semibold"
                                    >
                                        Viscosidad
                                    </Label>
                                    <Input
                                        id="viscosidad"
                                        name="viscosidad"
                                        type="number"
                                        step="0.01"
                                        value={formData.viscosidad}
                                        onChange={handleChange}
                                        placeholder="0.00"
                                        className="h-9"
                                    />
                                    {errors.viscosidad && (
                                        <p className="text-[10px] font-medium text-destructive">
                                            {errors.viscosidad}
                                        </p>
                                    )}
                                </div>

                                {/* Densidad */}
                                <div className="space-y-1.5">
                                    <Label
                                        htmlFor="densidad"
                                        className="text-xs font-semibold"
                                    >
                                        Densidad
                                    </Label>
                                    <Input
                                        id="densidad"
                                        name="densidad"
                                        type="number"
                                        step="0.001"
                                        value={formData.densidad}
                                        onChange={handleChange}
                                        placeholder="0.000"
                                        className="h-9"
                                    />
                                    {errors.densidad && (
                                        <p className="text-[10px] font-medium text-destructive">
                                            {errors.densidad}
                                        </p>
                                    )}
                                </div>

                                {/* Peso
                                <div className="space-y-1.5">
                                    <Label htmlFor="peso" className="text-xs font-semibold">Peso4 (g)</Label>
                                    <Input
                                        id="peso"
                                        name="peso"
                                        type="number"
                                        step="0.01"
                                        value={formData.peso}
                                        onChange={handleChange}
                                        placeholder="0.00"
                                        className="h-9"
                                    />
                                    {errors.peso && <p className="text-[10px] text-destructive font-medium">{errors.peso}</p>}
                                </div>

                                {/* Volumen 
                                <div className="space-y-1.5">
                                    <Label htmlFor="volumen" className="text-xs font-semibold">Volumen (L)</Label>
                                    <Input
                                        id="volumen"
                                        name="volumen"
                                        type="number"
                                        step="0.01"
                                        value={formData.volumen}
                                        onChange={handleChange}
                                        placeholder="0.00"
                                        className="h-9"
                                    />
                                    {errors.volumen && <p className="text-[10px] text-destructive font-medium">{errors.volumen}</p>}
                                </div>

                                {/* TempUHT 
                                <div className="space-y-1.5">
                                    <Label htmlFor="tempUHT" className="text-xs font-semibold text-orange-600 dark:text-orange-400">Temp UHT (°C)</Label>
                                    <Input
                                        id="tempUHT"
                                        name="tempUHT"
                                        type="number"
                                        step="0.01"
                                        value={formData.tempUHT}
                                        onChange={handleChange}
                                        placeholder="0.00"
                                        className="h-9 border-orange-200 focus:border-orange-500"
                                    />
                                    {errors.tempUHT && <p className="text-[10px] text-destructive font-medium">{errors.tempUHT}</p>}
                                </div> */}
                            </div>
                        </div>

                        {/* Campos de tipo boolean y texto */}
                        {/* Parámetros Organolépticos */}
                        <div className="rounded-xl border border-border bg-card p-4 shadow-sm">
                            <h4 className="mb-4 flex items-center gap-2 text-xs font-bold tracking-wider text-muted-foreground uppercase">
                                <Eye className="h-3.5 w-3.5" />
                                Parámetros Organolépticos y Otros
                            </h4>
                            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-4">
                                {/* Color */}
                                <div className="space-y-1.5">
                                    <Label
                                        htmlFor="color"
                                        className="text-xs font-semibold"
                                    >
                                        Color
                                    </Label>
                                    <select
                                        id="color"
                                        name="color"
                                        value={formData.color}
                                        onChange={handleChange}
                                        className="h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm transition-colors focus:ring-1 focus:ring-ring focus:outline-none disabled:cursor-not-allowed disabled:opacity-50"
                                    >
                                        <option value="">Seleccionar...</option>
                                        <option value="1">Aceptable</option>
                                        <option value="0">No Aceptable</option>
                                    </select>
                                    {errors.color && (
                                        <p className="text-[10px] font-medium text-destructive">
                                            {errors.color}
                                        </p>
                                    )}
                                </div>

                                {/* Olor */}
                                <div className="space-y-1.5">
                                    <Label
                                        htmlFor="olor"
                                        className="text-xs font-semibold"
                                    >
                                        Olor
                                    </Label>
                                    <select
                                        id="olor"
                                        name="olor"
                                        value={formData.olor}
                                        onChange={handleChange}
                                        className="h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm transition-colors focus:ring-1 focus:ring-ring focus:outline-none disabled:cursor-not-allowed disabled:opacity-50"
                                    >
                                        <option value="">Seleccionar...</option>
                                        <option value="1">Aceptable</option>
                                        <option value="0">No Aceptable</option>
                                    </select>
                                    {errors.olor && (
                                        <p className="text-[10px] font-medium text-destructive">
                                            {errors.olor}
                                        </p>
                                    )}
                                </div>

                                {/* Sabor */}
                                <div className="space-y-1.5">
                                    <Label
                                        htmlFor="sabor"
                                        className="text-xs font-semibold"
                                    >
                                        Sabor
                                    </Label>
                                    <select
                                        id="sabor"
                                        name="sabor"
                                        value={formData.sabor}
                                        onChange={handleChange}
                                        className="h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm transition-colors focus:ring-1 focus:ring-ring focus:outline-none disabled:cursor-not-allowed disabled:opacity-50"
                                    >
                                        <option value="">Seleccionar...</option>
                                        <option value="1">Aceptable</option>
                                        <option value="0">No Aceptable</option>
                                    </select>
                                    {errors.sabor && (
                                        <p className="text-[10px] font-medium text-destructive">
                                            {errors.sabor}
                                        </p>
                                    )}
                                </div>

                                {/* Aspecto */}
                                <div className="space-y-1.5">
                                    <Label
                                        htmlFor="aspecto"
                                        className="text-xs font-semibold"
                                    >
                                        Aspecto
                                    </Label>
                                    <Input
                                        id="aspecto"
                                        name="aspecto"
                                        type="text"
                                        value={formData.aspecto}
                                        onChange={handleChange}
                                        placeholder="Aspecto del producto"
                                        className="h-9"
                                    />
                                    {errors.aspecto && (
                                        <p className="text-[10px] font-medium text-destructive">
                                            {errors.aspecto}
                                        </p>
                                    )}
                                </div>
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
                            <Button
                                type="submit"
                                disabled={processing}
                                className="flex-1 sm:flex-none sm:min-w-[200px]"
                            >
                                {processing ? (
                                    <>
                                        <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                                        Guardando...
                                    </>
                                ) : (
                                    <>
                                        <Save className="mr-2 h-4 w-4" />
                                        Guardar Análisis
                                    </>
                                )}
                            </Button>
                        </div>
                    </form>
                </div>
            </div>
        </AppLayout>
    );
}
