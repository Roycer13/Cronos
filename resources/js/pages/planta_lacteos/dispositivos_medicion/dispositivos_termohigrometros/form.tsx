import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Toast } from '@/components/ui/toast';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, Link, router, usePage } from '@inertiajs/react';
import { ArrowLeft, Save, ThermometerSnowflake } from 'lucide-react';
import { route } from 'ziggy-js';
import { useState, useEffect } from 'react';
import FormSelect from '@/components/ui/form-select';

interface PageProps {
    dispositivos: Array<{ id: number; codigo: string; dispositivo: string }>;
    estados: Array<{ id: number; nombre: string }>;
    termohigrometro?: any;
    server_now?: string;
    flash?: { success?: string; error?: string };
}

export default function DispositivoTermohigrometroForm() {
    const { props } = usePage();
    const { dispositivos, estados, termohigrometro, server_now } = props as unknown as PageProps;
    const isEdit = !!termohigrometro;

    const formatDateTimeLocal = (value?: string | null) => {
        if (!value) return '';
        const date = new Date(value);
        if (!Number.isNaN(date.getTime())) {
            const pad = (n: number) => String(n).padStart(2, '0');
            return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
        }
        return value.slice(0, 16);
    };

    const [formData, setFormData] = useState({
        fecha_hora: formatDateTimeLocal(termohigrometro?.fecha_hora || server_now),
        dispositivos_medicion_id: termohigrometro?.dispositivos_medicion_id?.toString() || '',
        estado_id: termohigrometro?.estado_id?.toString() || '',
        requiere_ajuste: termohigrometro?.requiere_ajuste || false,
        patron_temperatura: termohigrometro?.patron_temperatura || '',
        equipo_temperatura: termohigrometro?.equipo_temperatura || '',
        error_temperatura: termohigrometro?.error_temperatura || '',
        patron_humedad: termohigrometro?.patron_humedad || '',
        equipo_humedad: termohigrometro?.equipo_humedad || '',
        error_humedad: termohigrometro?.error_humedad || '',
        observaciones: termohigrometro?.observaciones || '',
    });

    const [errors, setErrors] = useState<Record<string, string>>({});

    // Cálculo automático de errores (diferencia)
    useEffect(() => {
        const calcularError = (patron: any, equipo: any) => {
            if (patron === '' || equipo === '') return '';
            const p = parseFloat(patron);
            const e = parseFloat(equipo);
            if (isNaN(p) || isNaN(e)) return '';
            return (e - p).toFixed(2);
        };

        setFormData(prev => ({
            ...prev,
            error_temperatura: calcularError(prev.patron_temperatura, prev.equipo_temperatura),
            error_humedad: calcularError(prev.patron_humedad, prev.equipo_humedad),
        }));
    }, [formData.patron_temperatura, formData.equipo_temperatura, formData.patron_humedad, formData.equipo_humedad]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value, type } = e.target;
        let finalValue: string | boolean | number = value;
        if (type === 'checkbox') finalValue = (e.target as HTMLInputElement).checked;
        else if (type === 'number') finalValue = value === '' ? '' : parseFloat(value);
        setFormData(prev => ({ ...prev, [name]: finalValue }));
        if (errors[name]) setErrors(prev => ({ ...prev, [name]: '' }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const url = isEdit
            ? route('dispositivos-termohigrometros.update', termohigrometro.id)
            : route('dispositivos-termohigrometros.store');
        const method = isEdit ? 'put' : 'post';
        router[method](url, formData, {
            onSuccess: () => {},
            onError: (err) => setErrors(err as any),
        });
    };

    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Verificaciones de Dispositivos', href: route('verificaciones-dispositivos.index') },
        { title: isEdit ? 'Editar Termohigrómetro' : 'Nuevo Termohigrómetro', href: '#' },
    ];

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={isEdit ? 'Editar Termohigrómetro' : 'Nuevo Termohigrómetro'} />
            <div className="px-2 sm:px-6 py-2 space-y-2">
                <Toast />
                <div className="flex items-center gap-2">
                    <Link href={route('verificaciones-dispositivos.index')}>
                        <Button variant="outline" size="sm" className="h-7 w-7 p-0">
                            <ArrowLeft className="h-3.5 w-3.5" />
                        </Button>
                    </Link>
                    <div className="flex items-center gap-1.5">
                        <ThermometerSnowflake className="h-4 w-4 text-primary" />
                        <h1 className="text-base font-semibold">
                            {isEdit ? 'Editar Termohigrómetro' : 'Nuevo Termohigrómetro'}
                        </h1>
                    </div>
                </div>

                <div className="bg-background rounded-lg border border-border shadow-sm">
                    <form onSubmit={handleSubmit} className="p-3 space-y-3">
                        {/* Fecha y dispositivo */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                            <div>
                                <label className="text-xs mb-1 block text-muted-foreground">Fecha y hora</label>
                                <Input name="fecha_hora" type="datetime-local" value={formData.fecha_hora} onChange={handleChange} className="h-7 text-xs" />
                                {errors.fecha_hora && <p className="text-[10px] text-destructive mt-0.5">{errors.fecha_hora}</p>}
                            </div>
                            <div>
                                <label className="text-xs mb-1 block text-muted-foreground">Dispositivo de medición</label>
                                <FormSelect
                                    label=""
                                    value={formData.dispositivos_medicion_id}
                                    onChange={(v) => setFormData({ ...formData, dispositivos_medicion_id: v })}
                                    placeholder="Seleccionar"
                                    options={dispositivos.map(d => ({ value: d.id.toString(), label: `${d.codigo} - ${d.dispositivo}` }))}
                                    error={errors.dispositivos_medicion_id}
                                    className="h-7 text-xs"
                                />
                            </div>
                        </div>

                        {/* Lectura Patrón */}
                        <div className="border rounded-md p-2">
                            <h3 className="font-medium text-xs mb-2">Lectura Patrón</h3>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                <div>
                                    <label className="text-xs mb-1 block">Temperatura (°C)</label>
                                    <Input name="patron_temperatura" type="number" step="0.01" value={formData.patron_temperatura} onChange={handleChange} className="h-7 text-xs" />
                                </div>
                                <div>
                                    <label className="text-xs mb-1 block">Humedad (%)</label>
                                    <Input name="patron_humedad" type="number" step="0.01" value={formData.patron_humedad} onChange={handleChange} className="h-7 text-xs" />
                                </div>
                            </div>
                        </div>

                        {/* Lectura Equipo */}
                        <div className="border rounded-md p-2">
                            <h3 className="font-medium text-xs mb-2">Lectura Equipo</h3>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                <div>
                                    <label className="text-xs mb-1 block">Temperatura (°C)</label>
                                    <Input name="equipo_temperatura" type="number" step="0.01" value={formData.equipo_temperatura} onChange={handleChange} className="h-7 text-xs" />
                                </div>
                                <div>
                                    <label className="text-xs mb-1 block">Humedad (%)</label>
                                    <Input name="equipo_humedad" type="number" step="0.01" value={formData.equipo_humedad} onChange={handleChange} className="h-7 text-xs" />
                                </div>
                            </div>
                        </div>

                        {/* Errores calculados */}
                        <div className="border rounded-md p-2 bg-muted/30">
                            <h3 className="font-medium text-xs mb-2">Errores (calculados automáticamente)</h3>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                <div>
                                    <label className="text-xs mb-1 block">Error Temperatura (°C)</label>
                                    <Input name="error_temperatura" type="number" step="0.01" value={formData.error_temperatura} readOnly className="h-7 text-xs bg-muted cursor-not-allowed" />
                                </div>
                                <div>
                                    <label className="text-xs mb-1 block">Error Humedad (%)</label>
                                    <Input name="error_humedad" type="number" step="0.01" value={formData.error_humedad} readOnly className="h-7 text-xs bg-muted cursor-not-allowed" />
                                </div>
                            </div>
                        </div>

                        {/* Ajuste y estado */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                            <div className="flex items-center gap-2">
                                <input
                                    type="checkbox"
                                    name="requiere_ajuste"
                                    checked={formData.requiere_ajuste}
                                    onChange={(e) => setFormData(prev => ({ ...prev, requiere_ajuste: e.target.checked }))}
                                    className="h-3.5 w-3.5"
                                />
                                <label className="text-xs">Requiere ajuste</label>
                            </div>
                            <div>
                                <label className="text-xs mb-1 block">Estado</label>
                                <FormSelect
                                    label=""
                                    value={formData.estado_id}
                                    onChange={(v) => setFormData({ ...formData, estado_id: v })}
                                    placeholder="Seleccionar estado"
                                    options={estados.map(e => ({ value: e.id.toString(), label: e.nombre }))}
                                    error={errors.estado_id}
                                    className="h-7 text-xs"
                                />
                            </div>
                        </div>

                        {/* Observaciones */}
                        <div>
                            <label className="text-xs mb-1 block">Observaciones</label>
                            <Textarea
                                name="observaciones"
                                rows={3}
                                value={formData.observaciones}
                                onChange={handleChange}
                                placeholder="Observaciones"
                                className="resize-none text-xs py-1"
                            />
                            {errors.observaciones && <p className="text-[10px] text-destructive mt-0.5">{errors.observaciones}</p>}
                        </div>

                        <div className="flex justify-end gap-2 pt-1 border-t border-border">
                            <Link href={route('verificaciones-dispositivos.index')}>
                                <Button variant="outline" size="sm" className="h-7 text-xs px-2">Cancelar</Button>
                            </Link>
                            <Button type="submit" size="sm" className="h-7 text-xs px-2">
                                <Save className="h-3 w-3 mr-1" />
                                {isEdit ? 'Actualizar' : 'Guardar'}
                            </Button>
                        </div>
                    </form>
                </div>
            </div>
        </AppLayout>
    );
}