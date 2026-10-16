import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Toast } from '@/components/ui/toast';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, Link, router, usePage } from '@inertiajs/react';
import { ArrowLeft, Save, Snowflake, CheckCircle, XCircle } from 'lucide-react';
import { route } from 'ziggy-js';
import { useState } from 'react';
import FormSelect from '@/components/ui/form-select';

interface PageProps {
    dispositivos: Array<{ id: number; codigo: string; dispositivo: string }>;
    estados: Array<{ id: number; nombre: string }>;
    usuarios: Array<{ id: number; name: string }>;
    crioscopo?: any;
    flash: { success?: string; error?: string };
}

export default function DispositivoCrioscopoForm() {
    const { props } = usePage();
    const { dispositivos, estados, usuarios, crioscopo } = props as unknown as PageProps;
    const isEdit = !!crioscopo;

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
        fecha_hora: formatDateTimeLocal(crioscopo?.fecha_hora || (props as any).server_now),
        punto_ajuste_a: crioscopo?.punto_ajuste_a?.toString() || '0',
        punto_ajuste_b: crioscopo?.punto_ajuste_b?.toString() || '0',
        dispositivos_medicion_id: crioscopo?.dispositivos_medicion_id?.toString() || '',
        user_id: crioscopo?.user_id?.toString() || '',
        estado_id: crioscopo?.estado_id?.toString() || '',
        observaciones: crioscopo?.observaciones || '',
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
        const url = isEdit ? route('dispositivos-crioscopos.update', crioscopo.id) : route('dispositivos-crioscopos.store');
        const method = isEdit ? 'put' : 'post';
        router[method](url, formData, {
            onSuccess: () => {},
            onError: (err) => setErrors(err as any),
        });
    };

    const ambosPuntosAjustados = () => formData.punto_ajuste_a === '1' && formData.punto_ajuste_b === '1';

    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Verificaciones de Dispositivos', href: route('verificaciones-dispositivos.index') },
        { title: isEdit ? 'Editar Crioscopio' : 'Nuevo Crioscopio', href: '#' },
    ];

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={isEdit ? 'Editar Crioscopio' : 'Nuevo Crioscopio'} />
            <div className="px-2 sm:px-6 py-2 space-y-2">
                <Toast />
                <div className="flex items-center gap-2">
                    <Link href={route('verificaciones-dispositivos.index')}>
                        <Button variant="outline" size="sm" className="h-7 w-7 p-0">
                            <ArrowLeft className="h-3.5 w-3.5" />
                        </Button>
                    </Link>
                    <div className="flex items-center gap-1.5">
                        <Snowflake className="h-4 w-4 text-primary" />
                        <h1 className="text-base font-semibold">{isEdit ? 'Editar Crioscopio' : 'Nuevo Crioscopio'}</h1>
                    </div>
                </div>

                {ambosPuntosAjustados() && (
                    <div className="bg-green-50 dark:bg-green-950/30 border border-green-200 dark:border-green-800 rounded-md px-2 py-1.5 text-xs flex items-center gap-1.5">
                        <CheckCircle className="h-3.5 w-3.5 text-green-600 dark:text-green-400" />
                        <span className="text-green-800 dark:text-green-300">Ambos puntos ajustados correctamente</span>
                    </div>
                )}

                <div className="bg-background rounded-lg border border-border shadow-sm overflow-visible">
                    <form onSubmit={handleSubmit} className="p-3 space-y-3">
                        <div>
                            <h3 className="font-medium text-xs mb-1 text-muted-foreground">Fecha y hora</h3>
                            <Input name="fecha_hora" type="datetime-local" value={formData.fecha_hora} onChange={handleChange} className="h-7 text-xs" />
                            {errors.fecha_hora && <p className="text-[10px] text-destructive mt-0.5">{errors.fecha_hora}</p>}
                        </div>

                        <div>
                            <h3 className="font-medium text-xs mb-1 text-muted-foreground">Dispositivo de medición</h3>
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
                            <h3 className="font-medium text-xs mb-1 text-muted-foreground">Puntos de ajuste</h3>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                <div className={`p-2 border rounded-md ${formData.punto_ajuste_a === '1' ? 'border-green-500 bg-green-50 dark:bg-green-950/20' : 'border-border'}`}>
                                    <div className="flex items-center justify-between mb-1">
                                        <span className="text-xs font-medium">Punto A</span>
                                        {formData.punto_ajuste_a === '1' ? <CheckCircle className="h-3 w-3 text-green-600" /> : <XCircle className="h-3 w-3 text-muted-foreground" />}
                                    </div>
                                    <div className="flex items-center gap-3 text-xs">
                                        <label className="flex items-center gap-1">
                                            <input type="radio" name="punto_ajuste_a" value="1" checked={formData.punto_ajuste_a === '1'} onChange={handleChange} className="h-3 w-3" />
                                            <span>Ajustado</span>
                                        </label>
                                        <label className="flex items-center gap-1">
                                            <input type="radio" name="punto_ajuste_a" value="0" checked={formData.punto_ajuste_a === '0'} onChange={handleChange} className="h-3 w-3" />
                                            <span>No ajustado</span>
                                        </label>
                                    </div>
                                    {errors.punto_ajuste_a && <p className="text-[10px] text-destructive mt-1">{errors.punto_ajuste_a}</p>}
                                </div>
                                <div className={`p-2 border rounded-md ${formData.punto_ajuste_b === '1' ? 'border-green-500 bg-green-50 dark:bg-green-950/20' : 'border-border'}`}>
                                    <div className="flex items-center justify-between mb-1">
                                        <span className="text-xs font-medium">Punto B</span>
                                        {formData.punto_ajuste_b === '1' ? <CheckCircle className="h-3 w-3 text-green-600" /> : <XCircle className="h-3 w-3 text-muted-foreground" />}
                                    </div>
                                    <div className="flex items-center gap-3 text-xs">
                                        <label className="flex items-center gap-1">
                                            <input type="radio" name="punto_ajuste_b" value="1" checked={formData.punto_ajuste_b === '1'} onChange={handleChange} className="h-3 w-3" />
                                            <span>Ajustado</span>
                                        </label>
                                        <label className="flex items-center gap-1">
                                            <input type="radio" name="punto_ajuste_b" value="0" checked={formData.punto_ajuste_b === '0'} onChange={handleChange} className="h-3 w-3" />
                                            <span>No ajustado</span>
                                        </label>
                                    </div>
                                    {errors.punto_ajuste_b && <p className="text-[10px] text-destructive mt-1">{errors.punto_ajuste_b}</p>}
                                </div>
                            </div>
                        </div>

                        <div>
                            <h3 className="font-medium text-xs mb-1 text-muted-foreground">Estado y observaciones</h3>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                <FormSelect
                                    label=""
                                    value={formData.estado_id}
                                    onChange={(v) => setFormData({ ...formData, estado_id: v })}
                                    placeholder="Estado"
                                    options={estados.map(e => ({ value: e.id.toString(), label: e.nombre }))}
                                    error={errors.estado_id}
                                    className="h-7 text-xs"
                                />
                                <Textarea
                                    name="observaciones"
                                    rows={1}
                                    value={formData.observaciones}
                                    onChange={handleChange}
                                    placeholder="Observaciones"
                                    className="resize-none text-xs py-1 h-7"
                                />
                            </div>
                        </div>

                        <div className="bg-muted/30 rounded-md p-1.5 text-xs flex gap-3">
                            <span>Punto A: <span className={formData.punto_ajuste_a === '1' ? 'text-green-600' : ''}>{formData.punto_ajuste_a === '1' ? '✓ Ajustado' : '✗ No'}</span></span>
                            <span>Punto B: <span className={formData.punto_ajuste_b === '1' ? 'text-green-600' : ''}>{formData.punto_ajuste_b === '1' ? '✓ Ajustado' : '✗ No'}</span></span>
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