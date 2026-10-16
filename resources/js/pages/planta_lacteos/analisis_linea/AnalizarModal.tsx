import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { RefreshCw, Save, ChevronDown, ChevronUp } from 'lucide-react';
import { useState } from 'react';
import { route } from 'ziggy-js';
import { router } from '@inertiajs/react';

interface Props {
    analisis: any;
    onSaved?: () => void;
    onClose?: () => void;
}

export default function AnalizarModal({ analisis, onSaved, onClose }: Props) {
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
    const [showOrganolepticos, setShowOrganolepticos] = useState(true);

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

        if (errors[name]) setErrors(prev => ({ ...prev, [name]: '' }));
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
                onSaved && onSaved();
                onClose && onClose();
            },
            onError: (err) => {
                setErrors(err as any);
                setProcessing(false);
            },
            onFinish: () => setProcessing(false),
        });
    };

    return (
        <div className="w-full">
            {/* Detalles en grid más compacto */}
            <div className="grid grid-cols-2 gap-x-3 gap-y-1 mb-3 text-xs bg-muted/10 rounded-md p-2">
                <div>
                    <span className="text-muted-foreground">Producto:</span>
                    <span className="ml-1 font-medium">{analisis.estado_planta.estado_detalle.orp.producto_terminado?.nombre_comercial}</span>
                </div>
                <div>
                    <span className="text-muted-foreground">ORP/Prep.:</span>
                    <span className="ml-1 font-medium">{analisis.estado_planta.estado_detalle.orp?.codigo} - {analisis.estado_planta.estado_detalle?.preparacion}</span>
                </div>
                <div>
                    <span className="text-muted-foreground">Solicitado por:</span>
                    <span className="ml-1 font-medium">{analisis.solicitante?.name}</span>
                </div>
                <div>
                    <span className="text-muted-foreground">Origen/Proceso:</span>
                    <span className="ml-1 font-medium">{analisis.estado_planta?.origen?.alias} | {analisis.estado_planta?.proceso?.nombre}</span>
                </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-2">
                {/* Parámetros Físico-Químicos - más compacto */}
                <div className="rounded-md border border-border bg-muted/20 p-2">
                    <h5 className="mb-1.5 text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">Físico-Químicos</h5>
                    <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-7 gap-1.5">
                        <div>
                            <Label className="text-[10px]">Temp. (°C)</Label>
                            <Input name="temperatura" type="number" step="0.01" value={formData.temperatura} onChange={handleChange} onKeyDown={handleKeyDown} placeholder="0.00" className="h-7 text-xs px-2" autoFocus />
                        </div>
                        <div>
                            <Label className="text-[10px]">pH</Label>
                            <Input name="ph" type="number" step="0.01" value={formData.ph} onChange={handleChange} onKeyDown={handleKeyDown} placeholder="0.00" className="h-7 text-xs px-2" />
                        </div>
                        <div>
                            <Label className="text-[10px]">Acidez</Label>
                            <Input name="acidez" type="number" step="0.001" value={formData.acidez} onChange={handleChange} placeholder="0.000" className="h-7 text-xs px-2" />
                        </div>
                        <div>
                            <Label className="text-[10px]">Brix</Label>
                            <Input name="brix" type="number" step="0.01" value={formData.brix} onChange={handleChange} placeholder="0.00" className="h-7 text-xs px-2" />
                        </div>
                        <div>
                            <Label className="text-[10px]">Viscosidad</Label>
                            <Input name="viscosidad" type="number" step="0.01" value={formData.viscosidad} onChange={handleChange} placeholder="0.00" className="h-7 text-xs px-2" />
                        </div>
                        <div>
                            <Label className="text-[10px]">Densidad</Label>
                            <Input name="densidad" type="number" step="0.001" value={formData.densidad} onChange={handleChange} placeholder="0.000" className="h-7 text-xs px-2" />
                        </div>
                        <div>
                            <Label className="text-[10px]">Volumen (L)</Label>
                            <Input name="volumen" type="number" step="0.01" value={formData.volumen} onChange={handleChange} placeholder="0.00" className="h-7 text-xs px-2" />
                        </div>
                    </div>
                </div>

                {/* Parámetros Organolépticos - colapsable y más compacto */}
                <div className="rounded-md border border-border bg-card">
                    <button
                        type="button"
                        onClick={() => setShowOrganolepticos(!showOrganolepticos)}
                        className="w-full flex items-center justify-between p-2 hover:bg-muted/20 transition-colors"
                    >
                        <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">Organolépticos</span>
                        {showOrganolepticos ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
                    </button>
                    {showOrganolepticos && (
                        <div className="p-2 pt-0 border-t border-border">
                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5 mt-2">
                                <div>
                                    <Label className="text-[10px]">Color</Label>
                                    <select name="color" value={formData.color} onChange={handleChange} className="h-7 w-full rounded-md border border-input bg-background px-2 text-xs">
                                        <option value="1">Aceptable</option>
                                        <option value="0">No Aceptable</option>
                                    </select>
                                </div>
                                <div>
                                    <Label className="text-[10px]">Olor</Label>
                                    <select name="olor" value={formData.olor} onChange={handleChange} className="h-7 w-full rounded-md border border-input bg-background px-2 text-xs">
                                        <option value="1">Aceptable</option>
                                        <option value="0">No Aceptable</option>
                                    </select>
                                </div>
                                <div>
                                    <Label className="text-[10px]">Sabor</Label>
                                    <select name="sabor" value={formData.sabor} onChange={handleChange} className="h-7 w-full rounded-md border border-input bg-background px-2 text-xs">
                                        <option value="1">Aceptable</option>
                                        <option value="0">No Aceptable</option>
                                    </select>
                                </div>
                                <div>
                                    <Label className="text-[10px]">Aspecto</Label>
                                    <Input name="aspecto" value={formData.aspecto} onChange={handleChange} placeholder="Aspecto" className="h-7 text-xs px-2" />
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {/* Observaciones compactas */}
                <div>
                    <Label className="text-[10px]">Observaciones</Label>
                    <Textarea name="observaciones" rows={2} value={formData.observaciones} onChange={handleChange} placeholder="Observaciones..." className="resize-none text-xs px-2 py-1" />
                </div>

                {/* Botones más compactos */}
                <div className="flex justify-end gap-2 pt-1">
                    <Button size="sm" type="submit" disabled={processing} className="h-7 text-xs">
                        {processing ? (
                            <>
                                <RefreshCw className="mr-1 h-3 w-3 animate-spin" />
                                Guardando...
                            </>
                        ) : (
                            <>
                                <Save className="mr-1 h-3 w-3" />
                                Guardar
                            </>
                        )}
                    </Button>
                </div>
            </form>
        </div>
    );
}