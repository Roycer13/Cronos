import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Toast } from '@/components/ui/toast';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, Link, router, usePage } from '@inertiajs/react';
import { ArrowLeft, Save, Droplets } from 'lucide-react';
import { route } from 'ziggy-js';
import { useState } from 'react';
import FormSelect from '@/components/ui/form-select';

interface PageProps {
    dispositivos: Array<{ id: number; codigo: string; dispositivo: string }>;
    estados: Array<{ id: number; nombre: string }>;
    usuarios: Array<{ id: number; name: string }>;
    refractometro?: any;
    flash: { success?: string; error?: string };
}

export default function DispositivoRefractometroForm() {
    const { props } = usePage();
    const { dispositivos, estados, usuarios, refractometro } = props as unknown as PageProps;
    const isEdit = !!refractometro;

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
        fecha_hora: formatDateTimeLocal(refractometro?.fecha_hora || (props as any).server_now),
        verificacion_temperatura: refractometro?.verificacion_temperatura || '',
        verificacion_concentracion_0: refractometro?.verificacion_concentracion_0 || '',
        verificacion_concentracion_25: refractometro?.verificacion_concentracion_25 || '',
        requiere_ajuste: refractometro?.requiere_ajuste || false,
        verificacion_ajuste_temperatura: refractometro?.verificacion_ajuste_temperatura || '',
        verificacion_ajuste_concentracion_0: refractometro?.verificacion_ajuste_concentracion_0 || '',
        verificacion_ajuste_concentracion_25: refractometro?.verificacion_ajuste_concentracion_25 || '',
        dispositivos_medicion_id: refractometro?.dispositivos_medicion_id?.toString() || '',
        user_id: refractometro?.user_id?.toString() || '',
        estado_id: refractometro?.estado_id?.toString() || '',
        observaciones: refractometro?.observaciones || '',
    });

    const [errors, setErrors] = useState<Record<string, string>>({});

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
        const url = isEdit ? route('dispositivos-refractometros.update', refractometro.id) : route('dispositivos-refractometros.store');
        const method = isEdit ? 'put' : 'post';
        router[method](url, formData, {
            onSuccess: () => {},
            onError: (err) => setErrors(err as any),
        });
    };

    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Verificaciones de Dispositivos', href: route('verificaciones-dispositivos.index') },
        { title: isEdit ? 'Editar Refractómetro' : 'Nuevo Refractómetro', href: '#' },
    ];

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={isEdit ? 'Editar Refractómetro' : 'Nuevo Refractómetro'} />
            <div className="px-2 sm:px-6 py-2 space-y-2">
                <Toast />
                <div className="flex items-center gap-2">
                    <Link href={route('verificaciones-dispositivos.index')}>
                        <Button variant="outline" size="sm" className="h-7 w-7 p-0">
                            <ArrowLeft className="h-3.5 w-3.5" />
                        </Button>
                    </Link>
                    <div className="flex items-center gap-1.5">
                        <Droplets className="h-4 w-4 text-primary" />
                        <h1 className="text-base font-semibold">{isEdit ? 'Editar Refractómetro' : 'Nuevo Refractómetro'}</h1>
                    </div>
                </div>

                <div className="bg-background rounded-lg border border-border shadow-sm overflow-visible">
                    <form onSubmit={handleSubmit} className="p-3 space-y-3">
                        <div>
                            <h3 className="font-medium text-xs mb-1 text-muted-foreground">Fecha y hora</h3>
                            <Input name="fecha_hora" type="datetime-local" value={formData.fecha_hora} onChange={handleChange} className="h-7 text-xs" />
                            {errors.fecha_hora && <p className="text-[10px] text-destructive mt-0.5">{errors.fecha_hora}</p>}
                        </div>

                        <div>
                            <h3 className="font-medium text-xs mb-1 text-muted-foreground">Dispositivo</h3>
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

                        <div>
                            <h3 className="font-medium text-xs mb-1 text-muted-foreground">Verificación inicial</h3>
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                                <Input name="verificacion_temperatura" type="number" step="0.01" placeholder="Temperatura °C" value={formData.verificacion_temperatura} onChange={handleChange} className="h-7 text-xs" />
                                <Input name="verificacion_concentracion_0" type="number" step="0.01" placeholder="Concentración 0%" value={formData.verificacion_concentracion_0} onChange={handleChange} className="h-7 text-xs" />
                                <Input name="verificacion_concentracion_25" type="number" step="0.01" placeholder="Concentración 25%" value={formData.verificacion_concentracion_25} onChange={handleChange} className="h-7 text-xs" />
                            </div>
                        </div>

                        <div>
                            <div className="flex items-center justify-between mb-1">
                                <h3 className="font-medium text-xs text-muted-foreground">Ajuste</h3>
                                <label className="flex items-center gap-1 text-xs">
                                    <input type="checkbox" name="requiere_ajuste" checked={formData.requiere_ajuste} onChange={(e) => setFormData(prev => ({ ...prev, requiere_ajuste: e.target.checked }))} className="h-3 w-3" />
                                    <span>Requiere ajuste</span>
                                </label>
                            </div>
                            {formData.requiere_ajuste && (
                                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 mt-1">
                                    <Input name="verificacion_ajuste_temperatura" type="number" step="0.01" placeholder="Temp ajuste °C" value={formData.verificacion_ajuste_temperatura} onChange={handleChange} className="h-7 text-xs" />
                                    <Input name="verificacion_ajuste_concentracion_0" type="number" step="0.01" placeholder="Conc. 0% ajuste" value={formData.verificacion_ajuste_concentracion_0} onChange={handleChange} className="h-7 text-xs" />
                                    <Input name="verificacion_ajuste_concentracion_25" type="number" step="0.01" placeholder="Conc. 25% ajuste" value={formData.verificacion_ajuste_concentracion_25} onChange={handleChange} className="h-7 text-xs" />
                                </div>
                            )}
                        </div>

                        <div>
                            <h3 className="font-medium text-xs mb-1 text-muted-foreground">Estado</h3>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                <FormSelect label="" value={formData.estado_id} onChange={(v) => setFormData({ ...formData, estado_id: v })} placeholder="Estado" options={estados.map(e => ({ value: e.id.toString(), label: e.nombre }))} error={errors.estado_id} className="h-7 text-xs" />
                                <Textarea name="observaciones" rows={1} value={formData.observaciones} onChange={handleChange} placeholder="Observaciones" className="resize-none text-xs py-1 h-7" />
                            </div>
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