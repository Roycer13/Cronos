import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Toast } from '@/components/ui/toast';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, Link, router, usePage } from '@inertiajs/react';
import { ArrowLeft, Save, Thermometer, Calculator } from 'lucide-react';
import { route } from 'ziggy-js';
import { useState, useEffect } from 'react';
import FormSelect from '@/components/ui/form-select';

interface PageProps {
    dispositivos: Array<{ id: number; codigo: string; dispositivo: string }>;
    estados: Array<{ id: number; nombre: string }>;
    usuarios: Array<{ id: number; name: string }>;
    temperatura?: any;
    flash: { success?: string; error?: string };
}

export default function DispositivoTemperaturaForm() {
    const { props } = usePage();
    const { dispositivos, estados, usuarios, temperatura } = props as unknown as PageProps;
    const isEdit = !!temperatura;

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
        fecha_hora: formatDateTimeLocal(temperatura?.fecha_hora || (props as any).server_now),
        patron_1: temperatura?.patron_1 || '',
        inst_1: temperatura?.inst_1 || '',
        error_1: temperatura?.error_1 || '',
        patron_2: temperatura?.patron_2 || '',
        inst_2: temperatura?.inst_2 || '',
        error_2: temperatura?.error_2 || '',
        patron_3: temperatura?.patron_3 || '',
        inst_3: temperatura?.inst_3 || '',
        error_3: temperatura?.error_3 || '',
        dispositivos_medicion_id: temperatura?.dispositivos_medicion_id?.toString() || '',
        user_id: temperatura?.user_id?.toString() || '',
        estado_id: temperatura?.estado_id?.toString() || '',
        observaciones: temperatura?.observaciones || '',
    });

    const [errors, setErrors] = useState<Record<string, string>>({});
    const [calculandoErrores, setCalculandoErrores] = useState(false);

    const calcularErrores = () => {
        setCalculandoErrores(true);
        const calc = (p: string, i: string) => {
            const pn = parseFloat(p), inum = parseFloat(i);
            return (!isNaN(pn) && !isNaN(inum)) ? (inum - pn).toFixed(2) : '';
        };
        setFormData(prev => ({
            ...prev,
            error_1: calc(prev.patron_1, prev.inst_1),
            error_2: calc(prev.patron_2, prev.inst_2),
            error_3: calc(prev.patron_3, prev.inst_3),
        }));
        setCalculandoErrores(false);
    };

    useEffect(() => {
        calcularErrores();
    }, [formData.patron_1, formData.inst_1, formData.patron_2, formData.inst_2, formData.patron_3, formData.inst_3]);

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
        const url = isEdit ? route('dispositivos-temperaturas.update', temperatura.id) : route('dispositivos-temperaturas.store');
        const method = isEdit ? 'put' : 'post';
        router[method](url, formData, {
            onSuccess: () => {},
            onError: (err) => setErrors(err as any),
        });
    };

    const hayErrorFueraDeRango = () => {
        const e1 = Math.abs(parseFloat(formData.error_1) || 0);
        const e2 = Math.abs(parseFloat(formData.error_2) || 0);
        const e3 = Math.abs(parseFloat(formData.error_3) || 0);
        return e1 > 0.5 || e2 > 0.5 || e3 > 0.5;
    };

    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Verificaciones de Dispositivos', href: route('verificaciones-dispositivos.index') },
        { title: isEdit ? 'Editar Temperatura' : 'Nueva Temperatura', href: '#' },
    ];

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={isEdit ? 'Editar Verificación de Temperatura' : 'Nueva Verificación de Temperatura'} />
            <div className="px-2 sm:px-6 py-2 space-y-2">
                <Toast />
                <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                        <Link href={route('verificaciones-dispositivos.index')}>
                            <Button variant="outline" size="sm" className="h-7 w-7 p-0">
                                <ArrowLeft className="h-3.5 w-3.5" />
                            </Button>
                        </Link>
                        <div className="flex items-center gap-1.5">
                            <Thermometer className="h-4 w-4 text-primary" />
                            <h1 className="text-base font-semibold">{isEdit ? 'Editar Temperatura' : 'Nueva Temperatura'}</h1>
                        </div>
                    </div>
                    <Button type="button" variant="outline" size="sm" onClick={calcularErrores} disabled={calculandoErrores} className="h-7 text-xs px-2">
                        <Calculator className="h-3 w-3 mr-1" />
                        Recalcular
                    </Button>
                </div>

                {hayErrorFueraDeRango() && (
                    <div className="bg-yellow-50 dark:bg-yellow-950/30 border border-yellow-200 dark:border-yellow-800 rounded-md px-2 py-1 text-xs">
                        <span className="text-yellow-800 dark:text-yellow-300">Atención: errores fuera del rango ±0.5°C</span>
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
                            <h3 className="font-medium text-xs mb-1 text-muted-foreground">Puntos de verificación</h3>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                                {[1, 2, 3].map(i => (
                                    <div key={i} className="border rounded-md p-2 space-y-1">
                                        <div className="text-xs font-medium text-muted-foreground">Punto {i}</div>
                                        <Input name={`patron_${i}`} type="number" step="0.01" placeholder="Patrón °C" value={(formData as any)[`patron_${i}`]} onChange={handleChange} className="h-7 text-xs" />
                                        <Input name={`inst_${i}`} type="number" step="0.01" placeholder="Instrumento °C" value={(formData as any)[`inst_${i}`]} onChange={handleChange} className="h-7 text-xs" />
                                        <Input name={`error_${i}`} type="number" step="0.01" placeholder="Error" value={(formData as any)[`error_${i}`]} onChange={handleChange} className={`h-7 text-xs ${(formData as any)[`error_${i}`] && Math.abs(parseFloat((formData as any)[`error_${i}`])) > 0.5 ? 'border-red-500 bg-red-50 dark:bg-red-950/20' : ''}`} readOnly />
                                    </div>
                                ))}
                            </div>
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
                            <Button type="submit" size="sm" className={`h-7 text-xs px-2 ${hayErrorFueraDeRango() ? 'bg-yellow-600 hover:bg-yellow-700' : ''}`}>
                                <Save className="h-3 w-3 mr-1" />
                                {isEdit ? 'Actualizar' : 'Guardar'}
                                {hayErrorFueraDeRango() && ' (fuera rango)'}
                            </Button>
                        </div>
                    </form>
                </div>
            </div>
        </AppLayout>
    );
}