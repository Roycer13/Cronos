import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import FormInput from '@/components/ui/form-input';
import FormSelect from '@/components/ui/form-select';
import { Checkbox } from '@/components/ui/checkbox';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import AppLayout from '@/layouts/app-layout';
import { Head, useForm, usePage } from '@inertiajs/react';
import { Plus, Pencil, Trash2 } from 'lucide-react';
import { useState } from 'react';
import { route } from 'ziggy-js';

const breadcrumbs = [
    { title: 'Solicitudes', href: '/planta-lacteos/externo/solicitudes' },
    { title: 'Nueva', href: '' },
];

interface Producto { id: number; nombre_comercial: string; }
interface TipoMuestra { id: number; nombre: string; }

interface DetalleForm {
    producto_terminado_id: string;
    fecha_muestreo: string;
    lote: string;
    fecha_elaboracion: string;
    fecha_vencimiento: string;
    tipo_muestra_id: string;
    tipo_analisis: string[];
    personal_ambiente_superficie: string;
    is_producto: boolean;
}

interface FormData {
    observaciones: string;
    detalles: DetalleForm[];
}

export default function Create({ productos, tiposMuestra }: { productos: Producto[]; tiposMuestra: TipoMuestra[] }) {
    const { data, setData, post, processing, errors } = useForm<FormData>({
        observaciones: '',
        detalles: [],
    });
    console.log('Errores de validación:', errors);
    const [modalOpen, setModalOpen] = useState(false);
    const [editingIndex, setEditingIndex] = useState<number | null>(null);
    const [formDetalle, setFormDetalle] = useState<DetalleForm>(getEmptyDetalle());

    function getEmptyDetalle(): DetalleForm {
        return {
            producto_terminado_id: '',
            fecha_muestreo: new Date().toISOString().split('T')[0],
            lote: '',
            fecha_elaboracion: '',
            fecha_vencimiento: '',
            tipo_muestra_id: '',
            tipo_analisis: [],
            personal_ambiente_superficie: '',
            is_producto: true,
        };
    }

    const openNew = () => {
        setEditingIndex(null);
        setFormDetalle(getEmptyDetalle());
        setModalOpen(true);
    };

    const openEdit = (index: number) => {
        setEditingIndex(index);
        setFormDetalle({ ...data.detalles[index] });
        setModalOpen(true);
    };

    const deleteDetalle = (index: number) => {
        setData('detalles', data.detalles.filter((_, i) => i !== index));
    };

    const saveDetalle = () => {
        if (editingIndex !== null) {
            // Editar existente
            const nuevos = [...data.detalles];
            nuevos[editingIndex] = formDetalle;
            setData('detalles', nuevos);
        } else {
            // Nuevo
            setData('detalles', [...data.detalles, formDetalle]);
        }
        setModalOpen(false);
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        post(route('externo.solicitudes.store'));
    };

    const updateForm = (field: keyof DetalleForm, value: any) => {
        setFormDetalle(prev => ({ ...prev, [field]: value }));
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Nueva Solicitud de Análisis" />
            <div className="max-w-6xl mx-auto py-4 px-4 space-y-6">
                <h1 className="text-2xl font-bold">Nueva Solicitud</h1>

                <div className="bg-card p-4 rounded border">
                    <FormInput
                        id="observaciones"
                        label="Observaciones generales"
                        value={data.observaciones}
                        onChange={e => setData('observaciones', e.target.value)}
                    />
                </div>

                {/* Tabla de detalles */}
                <div className="rounded-lg border overflow-x-auto">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Producto/Ambiente</TableHead>
                                <TableHead>Fecha Muestreo</TableHead>
                                <TableHead>Lote</TableHead>
                                <TableHead>Tipo Muestra</TableHead>
                                <TableHead>Análisis</TableHead>
                                <TableHead className="w-28">Acciones</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {data.detalles.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={6} className="text-center py-4 text-muted-foreground">
                                        No hay detalles agregados. Haz clic en "Agregar detalle".
                                    </TableCell>
                                </TableRow>
                            ) : (
                                data.detalles.map((det, idx) => (
                                    <TableRow key={idx}>
                                        <TableCell>
                                            {det.is_producto
                                                ? productos.find(p => p.id.toString() === det.producto_terminado_id)?.nombre_comercial || 'Sin producto'
                                                : det.personal_ambiente_superficie || 'Ambiente/Superficie'}
                                        </TableCell>
                                        <TableCell>{det.fecha_muestreo}</TableCell>
                                        <TableCell>{det.lote || '-'}</TableCell>
                                        <TableCell>{tiposMuestra.find(t => t.id.toString() === det.tipo_muestra_id)?.nombre || '-'}</TableCell>
                                        <TableCell>{det.tipo_analisis.join(', ')}</TableCell>
                                        <TableCell className="flex gap-1">
                                            <Button variant="ghost" size="icon" onClick={() => openEdit(idx)}>
                                                <Pencil className="h-4 w-4" />
                                            </Button>
                                            <Button variant="ghost" size="icon" onClick={() => deleteDetalle(idx)}>
                                                <Trash2 className="h-4 w-4 text-destructive" />
                                            </Button>
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </div>

                <div className="flex justify-between">
                    <Button type="button" variant="outline" onClick={openNew}>
                        <Plus className="h-4 w-4 mr-1" /> Agregar detalle
                    </Button>
                    <div className="flex gap-3">
                        <Button variant="outline" type="button" onClick={() => window.history.back()}>Cancelar</Button>
                        <Button onClick={handleSubmit} disabled={processing || data.detalles.length === 0}>
                            {processing ? 'Enviando...' : 'Crear Solicitud'}
                        </Button>
                    </div>
                </div>

                {/* Modal para agregar/editar detalle */}
                <Dialog open={modalOpen} onOpenChange={setModalOpen}>
                    <DialogContent className="sm:max-w-lg">
                        <DialogHeader>
                            <DialogTitle>{editingIndex !== null ? 'Editar' : 'Nuevo'} Detalle</DialogTitle>
                        </DialogHeader>
                        <div className="space-y-4">
                            {/* Switch Producto / Ambiente */}
                            <div className="flex items-center space-x-3">
                                <label className="text-sm">¿Es producto?</label>
                                <button
                                    type="button"
                                    className={`px-3 py-1 rounded text-sm ${formDetalle.is_producto ? 'bg-primary text-primary-foreground' : 'bg-muted'}`}
                                    onClick={() => {
                                        updateForm('is_producto', true);
                                        updateForm('personal_ambiente_superficie', '');
                                    }}
                                >Producto</button>
                                <button
                                    type="button"
                                    className={`px-3 py-1 rounded text-sm ${!formDetalle.is_producto ? 'bg-primary text-primary-foreground' : 'bg-muted'}`}
                                    onClick={() => updateForm('is_producto', false)}
                                >Ambiente/Superficie</button>
                            </div>

                            {formDetalle.is_producto ? (
                                <>
                                    <FormSelect
                                        label="Producto *"
                                        value={formDetalle.producto_terminado_id}
                                        onChange={(v) => updateForm('producto_terminado_id', v)}
                                        options={productos.map(p => ({ value: p.id.toString(), label: p.nombre_comercial }))}
                                    />
                                    <FormInput id="lote" label="Lote" value={formDetalle.lote} onChange={e => updateForm('lote', e.target.value)} />
                                    <FormInput id="fecha_elaboracion" label="Fecha Elaboración" type="date" value={formDetalle.fecha_elaboracion} onChange={e => updateForm('fecha_elaboracion', e.target.value)} />
                                    <FormInput id="fecha_vencimiento" label="Fecha Vencimiento" type="date" value={formDetalle.fecha_vencimiento} onChange={e => updateForm('fecha_vencimiento', e.target.value)} />
                                </>
                            ) : (
                                <FormInput id="personal" label="Personal / Ambiente / Superficie" value={formDetalle.personal_ambiente_superficie} onChange={e => updateForm('personal_ambiente_superficie', e.target.value)} />
                            )}

                            <FormInput id="fecha_muestreo" label="Fecha Muestreo *" type="date" value={formDetalle.fecha_muestreo} onChange={e => updateForm('fecha_muestreo', e.target.value)} />
                            <FormSelect
                                label="Tipo de Muestra *"
                                value={formDetalle.tipo_muestra_id}
                                onChange={(v) => updateForm('tipo_muestra_id', v)}
                                options={tiposMuestra.map(t => ({ value: t.id.toString(), label: t.nombre }))}
                            />

                            {/* Checkbox Tipo Análisis */}
                            <div>
                                <label className="text-sm font-medium mb-1 block">Tipo de Análisis *</label>
                                <div className="flex gap-6">
                                    {['Microbiología', 'Fisicoquímico', 'Agua'].map(tipo => (
                                        <label key={tipo} className="flex items-center space-x-2">
                                            <Checkbox
                                                checked={formDetalle.tipo_analisis.includes(tipo)}
                                                onCheckedChange={(checked) => {
                                                    const newTypes = checked
                                                        ? [...formDetalle.tipo_analisis, tipo]
                                                        : formDetalle.tipo_analisis.filter(t => t !== tipo);
                                                    updateForm('tipo_analisis', newTypes);
                                                }}
                                                disabled={!formDetalle.is_producto && tipo === 'Microbiología'}
                                            />
                                            <span className="text-sm">{tipo}</span>
                                        </label>
                                    ))}
                                </div>
                            </div>
                        </div>
                        <DialogFooter>
                            <Button variant="outline" onClick={() => setModalOpen(false)}>Cancelar</Button>
                            <Button onClick={saveDetalle} disabled={formDetalle.tipo_analisis.length === 0}>
                                {editingIndex !== null ? 'Actualizar' : 'Agregar'}
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            </div>
        </AppLayout>
    );
}