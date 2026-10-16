import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Toast } from '@/components/ui/toast';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, Link, router, usePage } from '@inertiajs/react';
import { ArrowLeft, Save, FlaskConical } from 'lucide-react';
import { route } from 'ziggy-js';
import { useState } from 'react';
import FormSelect from '@/components/ui/form-select';

interface PageProps {
    dispositivos: Array<{ id: number; codigo: string; dispositivo: string }>;
    estados: Array<{ id: number; nombre: string }>;
    usuarios: Array<{ id: number; name: string }>;
    phmetro?: any;
    flash: { success?: string; error?: string };
}

export default function DispositivoPhmetroForm() {
    const { props } = usePage();
    const { dispositivos, estados, usuarios, phmetro } = props as unknown as PageProps;
    const isEdit = !!phmetro;

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
        fecha_hora: formatDateTimeLocal(phmetro?.fecha_hora || (props as any).server_now),
        verificacion_temperatura1: phmetro?.verificacion_temperatura1 || '',
        verificacion_temperatura2: phmetro?.verificacion_temperatura2 || '',
        verificacion_temperatura3: phmetro?.verificacion_temperatura3 || '',
        verificacion_4: phmetro?.verificacion_4 || '',
        verificacion_7: phmetro?.verificacion_7 || '',
        verificacion_10: phmetro?.verificacion_10 || '',
        requiere_ajuste: phmetro?.requiere_ajuste || false,
        verificacion_ajuste_temperatura1: phmetro?.verificacion_ajuste_temperatura1 || '',
        verificacion_ajuste_temperatura2: phmetro?.verificacion_ajuste_temperatura2 || '',
        verificacion_ajuste_temperatura3: phmetro?.verificacion_ajuste_temperatura3 || '',
        verificacion_ajuste_4: phmetro?.verificacion_ajuste_4 || '',
        verificacion_ajuste_7: phmetro?.verificacion_ajuste_7 || '',
        verificacion_ajuste_10: phmetro?.verificacion_ajuste_10 || '',
        dispositivos_medicion_id: phmetro?.dispositivos_medicion_id?.toString() || '',
        user_id: phmetro?.user_id?.toString() || '',
        estado_id: phmetro?.estado_id?.toString() || '',
        observaciones: phmetro?.observaciones || '',
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
        const url = isEdit ? route('dispositivos-phmetros.update', phmetro.id) : route('dispositivos-phmetros.store');
        const method = isEdit ? 'put' : 'post';
        router[method](url, formData, {
            onSuccess: () => {},
            onError: (err) => setErrors(err as any),
        });
    };

    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Verificaciones de Dispositivos', href: route('verificaciones-dispositivos.index') },
        { title: isEdit ? 'Editar pHmetro' : 'Nuevo pHmetro', href: '#' },
    ];

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={isEdit ? 'Editar pHmetro' : 'Nuevo pHmetro'} />
            <div className="px-2 sm:px-6 py-2 space-y-2">
                <Toast />
                <div className="flex items-center gap-2">
                    <Link href={route('verificaciones-dispositivos.index')}>
                        <Button variant="outline" size="sm" className="h-7 w-7 p-0">
                            <ArrowLeft className="h-3.5 w-3.5" />
                        </Button>
                    </Link>
                    <div className="flex items-center gap-1.5">
                        <FlaskConical className="h-4 w-4 text-primary" />
                        <h1 className="text-base font-semibold">{isEdit ? 'Editar pHmetro' : 'Nuevo pHmetro'}</h1>
                    </div>
                </div>

                <div className="bg-background rounded-lg border border-border shadow-sm overflow-visible">
                    <form onSubmit={handleSubmit} className="p-3 space-y-3">
                        <div>
                            <h3 className="font-medium text-xs mb-1 text-muted-foreground">Fecha y hora</h3>
                            <Input name="fecha_hora" type="datetime-local" value={formData.fecha_hora} onChange={handleChange} className="h-7 text-xs" />
                            {errors.fecha_hora && <p className="text-[10px] text-destructive mt-0.5">{errors.fecha_hora}</p>}
                        </div>

                        {/* Dispositivo */}
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

                        {/* Verificación inicial - orden de tabulación correcto */}
                        <div>
                            <h3 className="font-medium text-xs mb-1 text-muted-foreground">Verificación inicial</h3>
                            <div className="rounded-md border border-border overflow-hidden">
                                <div className="divide-y divide-border">
                                    {/* Fila 1: Temperatura 1 y pH 4 */}
                                    <div className="grid grid-cols-2 divide-x divide-border">
                                        <div className="p-2 text-xs font-medium text-muted-foreground">Temperatura 1 (°C)</div>
                                        <div className="p-2 text-xs font-medium text-muted-foreground">pH tampón 4</div>
                                    </div>
                                    <div className="grid grid-cols-2 divide-x divide-border">
                                        <div className="p-2">
                                            <Input name="verificacion_temperatura1" type="number" step="0.01" placeholder="Temperatura 1" value={formData.verificacion_temperatura1} onChange={handleChange} className="h-7 text-xs w-full" />
                                            {errors.verificacion_temperatura1 && <p className="text-[10px] text-destructive mt-0.5">{errors.verificacion_temperatura1}</p>}
                                        </div>
                                        <div className="p-2">
                                            <Input name="verificacion_4" type="number" step="0.01" placeholder="pH 4" value={formData.verificacion_4} onChange={handleChange} className="h-7 text-xs w-full" />
                                            {errors.verificacion_4 && <p className="text-[10px] text-destructive mt-0.5">{errors.verificacion_4}</p>}
                                        </div>
                                    </div>
                                    {/* Fila 2: Temperatura 2 y pH 7 */}
                                    <div className="grid grid-cols-2 divide-x divide-border">
                                        <div className="p-2 text-xs font-medium text-muted-foreground">Temperatura 2 (°C)</div>
                                        <div className="p-2 text-xs font-medium text-muted-foreground">pH tampón 7</div>
                                    </div>
                                    <div className="grid grid-cols-2 divide-x divide-border">
                                        <div className="p-2">
                                            <Input name="verificacion_temperatura2" type="number" step="0.01" placeholder="Temperatura 2" value={formData.verificacion_temperatura2} onChange={handleChange} className="h-7 text-xs w-full" />
                                            {errors.verificacion_temperatura2 && <p className="text-[10px] text-destructive mt-0.5">{errors.verificacion_temperatura2}</p>}
                                        </div>
                                        <div className="p-2">
                                            <Input name="verificacion_7" type="number" step="0.01" placeholder="pH 7" value={formData.verificacion_7} onChange={handleChange} className="h-7 text-xs w-full" />
                                            {errors.verificacion_7 && <p className="text-[10px] text-destructive mt-0.5">{errors.verificacion_7}</p>}
                                        </div>
                                    </div>
                                    {/* Fila 3: Temperatura 3 y pH 10 */}
                                    <div className="grid grid-cols-2 divide-x divide-border">
                                        <div className="p-2 text-xs font-medium text-muted-foreground">Temperatura 3 (°C)</div>
                                        <div className="p-2 text-xs font-medium text-muted-foreground">pH tampón 10</div>
                                    </div>
                                    <div className="grid grid-cols-2 divide-x divide-border">
                                        <div className="p-2">
                                            <Input name="verificacion_temperatura3" type="number" step="0.01" placeholder="Temperatura 3" value={formData.verificacion_temperatura3} onChange={handleChange} className="h-7 text-xs w-full" />
                                            {errors.verificacion_temperatura3 && <p className="text-[10px] text-destructive mt-0.5">{errors.verificacion_temperatura3}</p>}
                                        </div>
                                        <div className="p-2">
                                            <Input name="verificacion_10" type="number" step="0.01" placeholder="pH 10" value={formData.verificacion_10} onChange={handleChange} className="h-7 text-xs w-full" />
                                            {errors.verificacion_10 && <p className="text-[10px] text-destructive mt-0.5">{errors.verificacion_10}</p>}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Ajuste con el mismo orden de tabulación */}
                        <div>
                            <div className="flex items-center justify-between mb-1">
                                <h3 className="font-medium text-xs text-muted-foreground">Ajuste</h3>
                                <label className="flex items-center gap-1 text-xs">
                                    <input type="checkbox" name="requiere_ajuste" checked={formData.requiere_ajuste} onChange={(e) => setFormData(prev => ({ ...prev, requiere_ajuste: e.target.checked }))} className="h-3 w-3" />
                                    <span>Requiere ajuste</span>
                                </label>
                            </div>
                            {formData.requiere_ajuste && (
                                <div className="rounded-md border border-border overflow-hidden mt-1">
                                    <div className="divide-y divide-border">
                                        <div className="grid grid-cols-2 divide-x divide-border">
                                            <div className="p-2 text-xs font-medium text-muted-foreground">Temperatura ajuste 1 (°C)</div>
                                            <div className="p-2 text-xs font-medium text-muted-foreground">pH ajuste 4</div>
                                        </div>
                                        <div className="grid grid-cols-2 divide-x divide-border">
                                            <div className="p-2">
                                                <Input name="verificacion_ajuste_temperatura1" type="number" step="0.01" placeholder="Temp ajuste 1" value={formData.verificacion_ajuste_temperatura1} onChange={handleChange} className="h-7 text-xs w-full" />
                                                {errors.verificacion_ajuste_temperatura1 && <p className="text-[10px] text-destructive mt-0.5">{errors.verificacion_ajuste_temperatura1}</p>}
                                            </div>
                                            <div className="p-2">
                                                <Input name="verificacion_ajuste_4" type="number" step="0.01" placeholder="pH 4 ajuste" value={formData.verificacion_ajuste_4} onChange={handleChange} className="h-7 text-xs w-full" />
                                                {errors.verificacion_ajuste_4 && <p className="text-[10px] text-destructive mt-0.5">{errors.verificacion_ajuste_4}</p>}
                                            </div>
                                        </div>
                                        <div className="grid grid-cols-2 divide-x divide-border">
                                            <div className="p-2 text-xs font-medium text-muted-foreground">Temperatura ajuste 2 (°C)</div>
                                            <div className="p-2 text-xs font-medium text-muted-foreground">pH ajuste 7</div>
                                        </div>
                                        <div className="grid grid-cols-2 divide-x divide-border">
                                            <div className="p-2">
                                                <Input name="verificacion_ajuste_temperatura2" type="number" step="0.01" placeholder="Temp ajuste 2" value={formData.verificacion_ajuste_temperatura2} onChange={handleChange} className="h-7 text-xs w-full" />
                                                {errors.verificacion_ajuste_temperatura2 && <p className="text-[10px] text-destructive mt-0.5">{errors.verificacion_ajuste_temperatura2}</p>}
                                            </div>
                                            <div className="p-2">
                                                <Input name="verificacion_ajuste_7" type="number" step="0.01" placeholder="pH 7 ajuste" value={formData.verificacion_ajuste_7} onChange={handleChange} className="h-7 text-xs w-full" />
                                                {errors.verificacion_ajuste_7 && <p className="text-[10px] text-destructive mt-0.5">{errors.verificacion_ajuste_7}</p>}
                                            </div>
                                        </div>
                                        <div className="grid grid-cols-2 divide-x divide-border">
                                            <div className="p-2 text-xs font-medium text-muted-foreground">Temperatura ajuste 3 (°C)</div>
                                            <div className="p-2 text-xs font-medium text-muted-foreground">pH ajuste 10</div>
                                        </div>
                                        <div className="grid grid-cols-2 divide-x divide-border">
                                            <div className="p-2">
                                                <Input name="verificacion_ajuste_temperatura3" type="number" step="0.01" placeholder="Temp ajuste 3" value={formData.verificacion_ajuste_temperatura3} onChange={handleChange} className="h-7 text-xs w-full" />
                                                {errors.verificacion_ajuste_temperatura3 && <p className="text-[10px] text-destructive mt-0.5">{errors.verificacion_ajuste_temperatura3}</p>}
                                            </div>
                                            <div className="p-2">
                                                <Input name="verificacion_ajuste_10" type="number" step="0.01" placeholder="pH 10 ajuste" value={formData.verificacion_ajuste_10} onChange={handleChange} className="h-7 text-xs w-full" />
                                                {errors.verificacion_ajuste_10 && <p className="text-[10px] text-destructive mt-0.5">{errors.verificacion_ajuste_10}</p>}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Estado y observaciones */}
                        <div>
                            <h3 className="font-medium text-xs mb-1 text-muted-foreground">Estado</h3>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pb-15">
                                <FormSelect
                                    label=""
                                    value={formData.estado_id}
                                    onChange={(v) => setFormData({ ...formData, estado_id: v })}
                                    placeholder="Seleccionar estado"
                                    options={estados.map(e => ({ value: e.id.toString(), label: e.nombre }))}
                                    error={errors.estado_id}
                                    className="h-7 text-xs"
                                />
                                <Textarea
                                    name="observaciones"
                                    rows={3}
                                    value={formData.observaciones}
                                    onChange={handleChange}
                                    placeholder="Observaciones"
                                    className="resize-none text-xs py-1 h-7"
                                />
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
