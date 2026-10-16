import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
} from '@/components/ui/dialog';
import FormInput from '@/components/ui/form-input';
import FormSelect from '@/components/ui/form-select';
import { Textarea } from '@/components/ui/textarea';
import { useForm } from '@inertiajs/react';
import { route } from 'ziggy-js';
import { Calendar } from 'lucide-react';
import { useEffect } from 'react';
import { Label } from '@/components/ui/label';

interface EditarReconsultaModalProps {
    isOpen: boolean;
    onClose: () => void;
    reconsulta: any;
    policlinicos: { id: number; nombre: string }[];
}

export default function EditarReconsultaModal({
    isOpen,
    onClose,
    reconsulta,
    policlinicos,
}: EditarReconsultaModalProps) {
    const { data, setData, put, processing, errors, reset } = useForm({
        atencion_medica_id: reconsulta.atencion_medica_id,
        fecha_atencion: reconsulta.fecha_atencion.slice(0, 16),
        evolucion_mejoria: reconsulta.evolucion_mejoria || '',
        tratamiento: reconsulta.tratamiento || '',
        transferencia: reconsulta.transferencia || false,
        policlinico_id: reconsulta.policlinico_id?.toString() || '',
    });

    useEffect(() => {
        if (isOpen) {
            setData({
                atencion_medica_id: reconsulta.atencion_medica_id,
                fecha_atencion: reconsulta.fecha_atencion.slice(0, 16),
                evolucion_mejoria: reconsulta.evolucion_mejoria || '',
                tratamiento: reconsulta.tratamiento || '',
                transferencia: reconsulta.transferencia || false,
                policlinico_id: reconsulta.policlinico_id?.toString() || '',
            });
        }
    }, [isOpen, reconsulta]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        put(route('reconsultas.update', reconsulta.id), {
            onSuccess: () => {
                onClose();
                // Recargar la atención para mostrar cambios
                router.reload({ only: ['atencion'] });
            },
        });
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-2xl">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <Calendar className="h-5 w-5 text-primary" />
                        Editar Reconsulta
                    </DialogTitle>
                    <DialogDescription>
                        Modifique los datos de la reconsulta.
                    </DialogDescription>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="space-y-4 mt-4">
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                        <FormInput
                            id="fecha_atencion"
                            label="Fecha de atención"
                            type="datetime-local"
                            value={data.fecha_atencion}
                            onChange={(e) => setData('fecha_atencion', e.target.value)}
                            error={errors.fecha_atencion}
                            required
                        />
                    </div>
                    <div>
                        <Label htmlFor="evolucion_mejoria">Evolución / mejoría</Label>
                        <Textarea
                            id="evolucion_mejoria"
                            value={data.evolucion_mejoria}
                            onChange={(e) => setData('evolucion_mejoria', e.target.value)}
                            placeholder="Describa cómo ha evolucionado el paciente..."
                            rows={3}
                        />
                    </div>
                    <div>
                        <Label htmlFor="tratamiento">Tratamiento / ajuste</Label>
                        <Textarea
                            id="tratamiento"
                            value={data.tratamiento}
                            onChange={(e) => setData('tratamiento', e.target.value)}
                            placeholder="Nuevo tratamiento o modificaciones..."
                            rows={2}
                        />
                    </div>
                    <div className="space-y-4">
                        <div className="flex items-center space-x-2">
                            <input
                                type="checkbox"
                                id="transferencia"
                                checked={data.transferencia}
                                onChange={(e) => setData('transferencia', e.target.checked)}
                                className="rounded border-gray-300 text-primary shadow-sm focus:border-primary focus:ring focus:ring-primary/20"
                            />
                            <label htmlFor="transferencia" className="text-sm font-medium">
                                Requiere transferencia a centro de especialidad
                            </label>
                        </div>

                        {data.transferencia && (
                            <FormSelect
                                label="Policlínico destino"
                                value={data.policlinico_id}
                                onChange={(v) => setData('policlinico_id', v)}
                                placeholder="Seleccione policlínico"
                                options={policlinicos.map((p) => ({
                                    value: p.id.toString(),
                                    label: p.nombre,
                                }))}
                                error={errors.policlinico_id}
                            />
                        )}
                    </div>

                    <div className="flex justify-end gap-3 pt-4">
                        <Button type="button" variant="outline" onClick={onClose}>
                            Cancelar
                        </Button>
                        <Button type="submit" disabled={processing}>
                            {processing ? 'Guardando...' : 'Actualizar Reconsulta'}
                        </Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    );
}