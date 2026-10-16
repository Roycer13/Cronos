import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { useState, useEffect } from 'react';
import { router } from '@inertiajs/react';
import axios from 'axios';
import { toast } from 'sonner';
import { Search, UserPlus } from 'lucide-react';
import { Input } from '@/components/ui/input';

interface Usuario {
    id: number;
    name: string;
    apellido: string;
}

interface Props {
    ot: any;
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onAsignado?: () => void; // callback opcional para refrescar datos
}

export function AgregarAyudanteDialog({ ot, open, onOpenChange, onAsignado }: Props) {
    const [usuarios, setUsuarios] = useState<Usuario[]>([]);
    const [loading, setLoading] = useState(false);
    const [search, setSearch] = useState('');
    const [asignando, setAsignando] = useState<number | null>(null);

    const cargarUsuarios = async () => {
        setLoading(true);
        try {
            const response = await axios.get(route('ots.ayudantes.disponibles', ot.id));
            setUsuarios(response.data);
        } catch (error) {
            toast.error('Error al cargar usuarios disponibles');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (open) {
            cargarUsuarios();
        } else {
            setSearch('');
        }
    }, [open]);

    const asignarAyudante = (userId: number) => {
        setAsignando(userId);
        router.post(route('ots.ayudantes.asignar', ot.id), {
            user_id: userId
        }, {
            preserveScroll: true,
            onSuccess: () => {
                toast.success('Ayudante asignado');
                // Recargar lista de disponibles
                cargarUsuarios();
                if (onAsignado) onAsignado();
            },
            onError: (errors) => {
                toast.error(errors.error || 'Error al asignar ayudante');
            },
            onFinish: () => setAsignando(null)
        });
    };

    const usuariosFiltrados = usuarios.filter(u =>
        u.name.toLowerCase().includes(search.toLowerCase()) ||
        (u.apellido && u.apellido.toLowerCase().includes(search.toLowerCase()))
    );

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-md">
                <DialogHeader>
                    <DialogTitle>Agregar ayudante a OT #{ot.solicitud_ot?.id || ot.id}</DialogTitle>
                    <DialogDescription>
                        Selecciona un usuario para asignarlo como ayudante en esta orden de trabajo.
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-4">
                    {/* Buscador */}
                    <div className="relative">
                        <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                        <Input
                            placeholder="Buscar usuario..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="pl-8"
                        />
                    </div>

                    {/* Lista de usuarios */}
                    <div className="max-h-60 overflow-y-auto border rounded-md divide-y">
                        {loading ? (
                            <div className="p-4 text-center text-muted-foreground">Cargando...</div>
                        ) : usuariosFiltrados.length === 0 ? (
                            <div className="p-4 text-center text-muted-foreground">
                                {search ? 'No hay resultados' : 'No hay usuarios disponibles'}
                            </div>
                        ) : (
                            usuariosFiltrados.map((usuario) => (
                                <div key={usuario.id} className="flex items-center justify-between p-3 hover:bg-muted/50">
                                    <div>
                                        <p className="font-medium">{usuario.name} {usuario.apellido}</p>
                                    </div>
                                    <Button
                                        size="sm"
                                        onClick={() => asignarAyudante(usuario.id)}
                                        disabled={asignando === usuario.id}
                                    >
                                        <UserPlus className="mr-1 h-4 w-4" />
                                        Asignar
                                    </Button>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}
