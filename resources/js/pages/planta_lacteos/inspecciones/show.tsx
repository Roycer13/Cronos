import AppLayout from '@/layouts/app-layout';
import { Head, usePage, router } from '@inertiajs/react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Pencil, Trash2, ArrowLeft } from 'lucide-react';
import { route } from 'ziggy-js';
import { useAuth } from '@/hooks/useAuth';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from '@/components/ui/dialog';
import { useState } from 'react';
import { useForm } from '@inertiajs/react';
import FormInput from '@/components/ui/form-input';
import FormSelect from '@/components/ui/form-select';
import { Toast } from '@/components/ui/toast';

interface Inspeccion {
    id: number;
    infraestructura: { id: number; nombre: string };
    usuario: { name: string; apellido: string };
    fecha: string;
    observacion_general?: string;
    acciones: Accion[];
    // Incluye todos los campos de criterio...
    [key: string]: any;
}

interface Accion {
    id: number;
    criterio: string;
    descripcion: string;
    tipo_accion?: string;
    responsable?: string;
    fecha_ejecucion?: string;
    estado: string;
    referencia?: string;
    observaciones?: string;
}

export default function Show() {
    const { inspeccion } = usePage<{ inspeccion: Inspeccion }>().props;
    const { hasPermission } = useAuth();
    const [editingAccion, setEditingAccion] = useState<Accion | null>(null);
    const [modalOpen, setModalOpen] = useState(false);

    const criterios = ['pisos','paredes','techos','puertas','ventanas','drenajes',
                       'iluminacion','ventilacion','lavamanos','servicios_sanitarios',
                       'almacenamiento','senalizacion','maquina_equipo','extra'];

    // Filtrar solo criterios que tienen datos (no null)
    const criteriosConDatos = criterios.filter(c => inspeccion[`${c}_ok`] !== null);

    const { data: accionForm, setData: setAccionForm, put, processing, errors, reset } = useForm({
        inspeccion_infraestructura_id: inspeccion.id,
        criterio: '',
        descripcion: '',
        tipo_accion: '',
        responsable: '',
        fecha_ejecucion: '',
        estado: 'Pendiente',
        referencia: '',
        observaciones: '',
    });

    const handleEditAccion = (accion: Accion) => {
        setEditingAccion(accion);
        setAccionForm({
            inspeccion_infraestructura_id: inspeccion.id,
            criterio: accion.criterio,
            descripcion: accion.descripcion,
            tipo_accion: accion.tipo_accion || '',
            responsable: accion.responsable || '',
            fecha_ejecucion: accion.fecha_ejecucion || '',
            estado: accion.estado,
            referencia: accion.referencia || '',
            observaciones: accion.observaciones || '',
        });
        setModalOpen(true);
    };

    const handleDeleteAccion = (id: number) => {
        if (confirm('¿Eliminar esta acción?')) {
            router.delete(route('acciones-infraestructura.destroy', id), { preserveScroll: true });
        }
    };

    const handleUpdateAccion = (e: React.FormEvent) => {
        e.preventDefault();
        if (editingAccion) {
            put(route('acciones-infraestructura.update', editingAccion.id), {
                onSuccess: () => { setModalOpen(false); reset(); },
            });
        }
    };

    return (
        <AppLayout breadcrumbs={[
            { title: 'Inspecciones', href: '/planta-lacteos/inspecciones' },
            { title: `Inspección #${inspeccion.id}`, href: '#' },
        ]}>
            <Head title={`Inspección #${inspeccion.id}`} />
            <div className="px-4 py-6 max-w-4xl mx-auto">
                <Toast />
                <div className="flex gap-2 mb-4">
                    <Button variant="ghost" onClick={() => router.get(route('inspecciones.index'))}>
                        <ArrowLeft className="h-4 w-4 mr-2" /> Volver
                    </Button>
                    <Button onClick={() => {
                        window.open(route('inspecciones.exportar', inspeccion.id), '_blank');
                    }}>Exportar PDF</Button>
                </div>

                <Card className="p-4 mb-4">
                    <h1 className="text-xl font-bold mb-2">Inspección #{inspeccion.id}</h1>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                        <div><strong>Área:</strong> {inspeccion.infraestructura?.nombre}</div>
                        <div><strong>Fecha:</strong> {new Date(inspeccion.fecha).toLocaleString()}</div>
                        <div><strong>General:</strong> {inspeccion.observacion_general || '-'}</div>
                    </div>
                </Card>

                <h2 className="font-semibold text-lg mb-2">Criterios evaluados</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                    {criteriosConDatos.map(criterio => (
                        <Card key={criterio} className="p-3">
                            <div className="flex items-center justify-between">
                                <span className="capitalize font-medium">{criterio.replace(/_/g, ' ')}</span>
                                <Badge variant={inspeccion[`${criterio}_ok`] ? 'outline' : 'destructive'}>
                                    {inspeccion[`${criterio}_ok`] ? 'Cumple' : 'No cumple'}
                                </Badge>
                            </div>
                            {inspeccion[`${criterio}_observacion`] && (
                                <p className="text-sm text-muted-foreground mt-1">{inspeccion[`${criterio}_observacion`]}</p>
                            )}
                        </Card>
                    ))}
                </div>

                <h2 className="font-semibold text-lg mb-2">Acciones de seguimiento</h2>
                {inspeccion.acciones.length === 0 ? (
                    <p className="text-muted-foreground">No hay acciones registradas</p>
                ) : (
                    <div className="space-y-3">
                        {inspeccion.acciones.map(accion => (
                            <Card key={accion.id} className="p-3">
                                <div className="flex justify-between items-start">
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-2 text-sm flex-1">
                                        <div><strong>Criterio:</strong> {accion.criterio}</div>
                                        <div><strong>Tipo:</strong> {accion.tipo_accion || '-'}</div>
                                        <div><strong>Responsable:</strong> {accion.responsable || '-'}</div>
                                        <div><strong>Descripción:</strong> {accion.descripcion}</div>
                                        <div><strong>Fecha ejecución:</strong> {accion.fecha_ejecucion || '-'}</div>
                                        <div><strong>Estado:</strong> <Badge>{accion.estado}</Badge></div>
                                    </div>
                                    <div className="flex gap-1">
                                        {hasPermission('u_accionInfra') && (
                                            <Button variant="ghost" size="sm" onClick={() => handleEditAccion(accion)}>
                                                <Pencil className="h-4 w-4" />
                                            </Button>
                                        )}
                                        {hasPermission('d_accionInfra') && (
                                            <Button variant="ghost" size="sm" onClick={() => handleDeleteAccion(accion.id)}>
                                                <Trash2 className="h-4 w-4 text-destructive" />
                                            </Button>
                                        )}
                                    </div>
                                </div>
                            </Card>
                        ))}
                    </div>
                )}

                <Dialog open={modalOpen} onOpenChange={setModalOpen}>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Editar Acción</DialogTitle>
                        </DialogHeader>
                        <form onSubmit={handleUpdateAccion} className="space-y-4">
                            <FormInput id="accion-criterio" label="Criterio" value={accionForm.criterio} onChange={(e) => setAccionForm('criterio', e.target.value)} required />
                            <FormInput id="accion-descripcion" label="Descripción" value={accionForm.descripcion} onChange={(e) => setAccionForm('descripcion', e.target.value)} required />
                            <FormInput id="accion-tipo" label="Tipo de acción" value={accionForm.tipo_accion} onChange={(e) => setAccionForm('tipo_accion', e.target.value)} />
                            <FormInput id="accion-responsable" label="Responsable" value={accionForm.responsable} onChange={(e) => setAccionForm('responsable', e.target.value)} />
                            <FormInput id="accion-fecha" label="Fecha ejecución" type="date" value={accionForm.fecha_ejecucion} onChange={(e) => setAccionForm('fecha_ejecucion', e.target.value)} />
                            <FormSelect
                                label="Estado"
                                value={accionForm.estado}
                                onChange={(v) => setAccionForm('estado', v)}
                                options={['Pendiente','En Proceso','Cerrada'].map(e => ({ value: e, label: e }))}
                            />
                            <FormInput id="accion-referencia" label="Referencia" value={accionForm.referencia} onChange={(e) => setAccionForm('referencia', e.target.value)} />
                            <FormInput id="accion-observaciones" label="Observaciones" value={accionForm.observaciones} onChange={(e) => setAccionForm('observaciones', e.target.value)} />
                            <DialogFooter>
                                <Button type="button" variant="outline" onClick={() => setModalOpen(false)}>Cancelar</Button>
                                <Button type="submit" disabled={processing}>Actualizar</Button>
                            </DialogFooter>
                        </form>
                    </DialogContent>
                </Dialog>
            </div>
        </AppLayout>
    );
}