import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { useEffect, useState } from 'react';
import { router } from '@inertiajs/react';
import axios from 'axios';
import { format, parseISO } from 'date-fns';
import { es } from 'date-fns/locale';
import { toast } from 'sonner';
import { useAuth } from '@/hooks/useAuth';

interface Tiempo {
    id: number;
    tiempo_inicio: string | null;
    tiempo_fin: string | null;
    created_at: string;
}

interface Props {
    ot: any;
    open: boolean;
    onOpenChange: (open: boolean) => void;
    users?: { id: number; name: string; apellido?: string }[]; // 👈 agregado
    authUserId?: number; // 👈 agregado
}

export function TiemposDialog({ ot, open, onOpenChange, users = [], authUserId }: Props) {
    const [tiempos, setTiempos] = useState<Tiempo[]>([]);
    const [loading, setLoading] = useState(false);
    const [manualMode, setManualMode] = useState(false);
    const [manualInicio, setManualInicio] = useState('');
    const [manualFin, setManualFin] = useState('');
    const [selectedUserId, setSelectedUserId] = useState<number | undefined>(authUserId); // 👈 estado para usuario seleccionado

    const cargarTiempos = async () => {
        setLoading(true);
        try {
            const response = await axios.get(route('ots.tiempos.index', ot.id));
            setTiempos(response.data);
        } catch (error) {
            toast.error('Error al cargar los tiempos');
        } finally {
            setLoading(false);
        }
    };
const {
        hasPermission,
        belongsToUbicacion,
        canDo,
        user: authUser,
    } = useAuth();
    useEffect(() => {
        if (open) {
            cargarTiempos();
        } else {
            setManualMode(false);
            setManualInicio('');
            setManualFin('');
            setSelectedUserId(authUserId); // resetea al usuario actual al cerrar
        }
    }, [open, authUserId]);

    const tiempoActivo = tiempos.find(t => t.tiempo_inicio !== null && t.tiempo_fin === null);

    const iniciarTiempo = () => {
        router.post(route('ots.tiempos.iniciar', ot.id), {}, {
            preserveScroll: true,
            onSuccess: () => {
                cargarTiempos();
                toast.success('Tiempo iniciado');
            },
            onError: (errors) => {
                toast.error(errors.error || 'Error al iniciar');
            }
        });
    };

    const finalizarTiempo = (tiempoId: number) => {
        router.put(route('ots.tiempos.finalizar', { ot: ot.id, tiempo: tiempoId }), {}, {
            preserveScroll: true,
            onSuccess: () => {
                cargarTiempos();
                toast.success('Tiempo finalizado');
            },
            onError: (errors) => {
                toast.error(errors.error || 'Error al finalizar');
            }
        });
    };

    const registrarManual = (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedUserId) {
            toast.error('Debes seleccionar un usuario.');
            return;
        }
        router.post(route('ots.tiempos.manual', ot.id), {
            user_id: selectedUserId,        // 👈 enviar el usuario seleccionado
            tiempo_inicio: manualInicio,
            tiempo_fin: manualFin,
        }, {
            preserveScroll: true,
            onSuccess: () => {
                cargarTiempos();
                setManualMode(false);
                setManualInicio('');
                setManualFin('');
                toast.success('Tiempo registrado');
            },
            onError: (errors) => {
                toast.error(errors.error || 'Error al registrar');
            }
        });
    };

    const formatFecha = (fecha: string | null) => {
        if (!fecha) return '-';
        return format(parseISO(fecha), 'dd/MM/yyyy HH:mm', { locale: es });
    };

    const calcularDuracion = (inicio: string | null, fin: string | null) => {
        if (!inicio || !fin) return '-';
        const start = new Date(inicio).getTime();
        const end = new Date(fin).getTime();
        const diffMs = end - start;
        const horas = Math.floor(diffMs / 3600000);
        const minutos = Math.floor((diffMs % 3600000) / 60000);
        return `${horas}h ${minutos}m`;
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-2xl">
                <DialogHeader>
                    <DialogTitle>Gestión de tiempos - OT #{ot.solicitud_ot?.id || ot.id}</DialogTitle>
                    <DialogDescription>
                        Registra los intervalos de trabajo para esta orden.
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-4">
                    {/* Acciones rápidas */}
                    <div className="flex gap-2">
                        {!tiempoActivo ? (
                            <Button onClick={iniciarTiempo} disabled={loading}>
                                Iniciar trabajo
                            </Button>
                        ) : (
                            <Button onClick={() => finalizarTiempo(tiempoActivo.id)} disabled={loading}>
                                Finalizar trabajo
                            </Button>
                        )}
    {hasPermission('registrar_tiempos_manual') && (
                        <Button variant="outline" onClick={() => setManualMode(!manualMode)}>
                            {manualMode ? 'Cancelar' : 'Registro manual'}
                        </Button>

)}
                    </div>

                    {/* Formulario manual */}
                    {manualMode && (
                        <form onSubmit={registrarManual} className="space-y-3 p-3 border rounded bg-muted/30">
                            {/* Selector de usuario */}
                            <div>
                                <label className="text-sm text-muted-foreground">Usuario</label>
                                <select
                                    value={selectedUserId || ''}
                                    onChange={(e) => setSelectedUserId(Number(e.target.value))}
                                    className="w-full rounded border p-2 text-sm"
                                    required
                                >
                                    <option value="">Seleccionar usuario</option>
                                    {users.map(user => (
                                        <option key={user.id} value={user.id}>
                                            {user.name} {user.apellido || ''}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="text-sm text-muted-foreground">Inicio</label>
                                    <input
                                        type="datetime-local"
                                        value={manualInicio}
                                        onChange={(e) => setManualInicio(e.target.value)}
                                        className="w-full rounded border p-2 text-sm"
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="text-sm text-muted-foreground">Fin</label>
                                    <input
                                        type="datetime-local"
                                        value={manualFin}
                                        onChange={(e) => setManualFin(e.target.value)}
                                        className="w-full rounded border p-2 text-sm"
                                        required
                                    />
                                </div>
                            </div>
                            <div className="flex justify-end">
                                <Button type="submit" disabled={loading}>
                                    Guardar manual
                                </Button>
                            </div>
                        </form>
                    )}

                    {/* Lista de tiempos */}
                    <div className="mt-4">
                        <h4 className="font-semibold mb-2">Tiempos registrados</h4>
                        {loading ? (
                            <p className="text-center text-muted-foreground">Cargando...</p>
                        ) : tiempos.length === 0 ? (
                            <p className="text-center text-muted-foreground">No hay tiempos registrados</p>
                        ) : (
                            <div className="space-y-2 max-h-60 overflow-y-auto">
                                {tiempos.map((t) => {
                                    const esAsignacion = t.tiempo_inicio === null && t.tiempo_fin === null;
                                    return (
                                        <div key={t.id} className="flex items-center justify-between p-2 border rounded text-sm">
                                            <div>
                                                {esAsignacion ? (
                                                    <span className="text-muted-foreground italic">Asignado a la OT</span>
                                                ) : (
                                                    <>
                                                        <div><span className="font-medium">Inicio:</span> {formatFecha(t.tiempo_inicio)}</div>
                                                        <div><span className="font-medium">Fin:</span> {formatFecha(t.tiempo_fin)}</div>
                                                        <div><span className="font-medium">Duración:</span> {calcularDuracion(t.tiempo_inicio, t.tiempo_fin)}</div>
                                                    </>
                                                )}
                                            </div>
                                            {!esAsignacion && t.tiempo_inicio && !t.tiempo_fin && (
                                                <Button size="sm" variant="outline" onClick={() => finalizarTiempo(t.id)}>
                                                    Finalizar
                                                </Button>
                                            )}
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}
