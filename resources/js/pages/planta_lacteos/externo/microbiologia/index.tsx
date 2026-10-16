import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import AppLayout from '@/layouts/app-layout';
import { Head, usePage, useForm, router } from '@inertiajs/react';
import { Play, ArrowRight, CheckCircle, ClipboardCheck } from 'lucide-react';
import { useState, type ReactNode } from 'react';
import { route } from 'ziggy-js';
import { Toast } from '@/components/ui/toast';

interface Microbiologia {
    id: number;
    estado: string;
    fecha_siembra: string | null;
    fecha_dia2: string | null;
    fecha_dia5: string | null;
    aer_mes: number | null;
    col_tot: number | null;
    moh_lev: number | null;
    detalle: {
        subcodigo: string;
        producto_terminado: { nombre_comercial?: string; nombre?: string } | null;
        personal_ambiente_superficie: string | null;
        tipo_muestra: { nombre: string; mesofilos?: boolean; coliformes?: boolean; mohos?: boolean } | null;
    };
}

interface PageProps extends Record<string, unknown> {
    analisis: Microbiologia[];
    flash: { success?: string; error?: string };
}

// Función para formatear resultados
function formatResultado(valor: number | null): ReactNode {
    if (valor === null) return 'No aplica';
    if (valor === 0) return '0';

    const absValor = Math.abs(valor);
    if (absValor >= 1000000) return 'MNPC';

    if (absValor >= 1000 || (absValor > 0 && absValor < 1)) {
        const exponent = Math.floor(Math.log10(absValor));
        const coefficient = absValor / Math.pow(10, exponent);
        const roundedCoefficient = coefficient.toFixed(2).replace(/\.?0+$/, '');
        const sign = valor < 0 ? '-' : '';
        return (
            <span>
                {sign}{roundedCoefficient}x10<sup>{exponent}</sup>
            </span>
        );
    }

    return valor.toString();
}

export default function Index() {
    const { props } = usePage<PageProps>();
    const { analisis } = props;

    const formatDate = (date: string | null) => {
        if (!date) return '-';
        return new Date(date).toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit', year: 'numeric' });
    };

    return (
        <AppLayout breadcrumbs={[{ title: 'Análisis Microbiología', href: '/planta-lacteos/externo/microbiologia' }]}>
            <Head title="Microbiología" />
            <Toast />
            <div className="px-4 py-4 space-y-4">
                <h1 className="text-2xl font-bold">Análisis de Microbiología</h1>
                <div className="rounded-lg border overflow-x-auto">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Subcódigo</TableHead>
                                <TableHead>Producto</TableHead>
                                <TableHead>Tipo Muestra</TableHead>
                                <TableHead>Siembra</TableHead>
                                <TableHead>Aer. Mes.</TableHead>
                                <TableHead>Col. Tot.</TableHead>
                                <TableHead>Moh. Lev.</TableHead>
                                <TableHead>Día 5</TableHead>
                                <TableHead>Estado</TableHead>
                                <TableHead className="w-40">Acciones</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {analisis.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={10} className="text-center py-8">
                                        No hay análisis pendientes
                                    </TableCell>
                                </TableRow>
                            ) : (
                                analisis.map((m) => (
                                    <TableRow key={m.id}>
                                        <TableCell className="font-mono">{m.detalle.subcodigo}</TableCell>
                                        <TableCell>
                                            {m.detalle.producto_terminado?.nombre_comercial || m.detalle.producto_terminado?.nombre || m.detalle.personal_ambiente_superficie || 'N/A'}
                                        </TableCell>
                                        <TableCell>{m.detalle.tipo_muestra?.nombre || '-'}</TableCell>
                                        <TableCell>{formatDate(m.fecha_siembra)}</TableCell>
                                        <TableCell>{m.detalle.tipo_muestra?.mesofilos ? formatResultado(m.aer_mes) : 'No aplica'}</TableCell>
                                        <TableCell>{m.detalle.tipo_muestra?.coliformes ? formatResultado(m.col_tot) : 'No aplica'}</TableCell>
                                        <TableCell>{m.detalle.tipo_muestra?.mohos ? formatResultado(m.moh_lev) : 'No aplica'}</TableCell>
                                        <TableCell>{formatDate(m.fecha_dia5)}</TableCell>
                                        <TableCell>
                                            <Badge variant={
                                                m.estado === 'Pendiente' ? 'outline' :
                                                    m.estado === 'Sembrado' ? 'default' :
                                                        m.estado === 'En Lectura Día 2' ? 'secondary' :
                                                            'default'
                                            }>
                                                {m.estado}
                                            </Badge>
                                        </TableCell>
                                        <TableCell className="flex gap-1 flex-wrap">
                                            {m.estado === 'Pendiente' && (
                                                <IniciarSiembraButton microbiologiaId={m.id} />
                                            )}
                                            {m.estado === 'Sembrado' && (
                                                <>
                                                    <Button
                                                        size="sm"
                                                        onClick={() =>
                                                            router.visit(route('externo.microbiologia.edit', m.id))
                                                        }
                                                    >
                                                        <ArrowRight className="h-4 w-4 mr-1" /> Día 2
                                                    </Button>
                                                    <Button
                                                        size="sm"
                                                        variant="outline"
                                                        onClick={() =>
                                                            router.post(route('externo.microbiologia.completar-dia2', m.id))
                                                        }
                                                    >
                                                        <ClipboardCheck className="h-4 w-4 mr-1" /> Limpio
                                                    </Button>
                                                </>
                                            )}
                                            {m.estado === 'En Lectura Día 2' && (
                                                <>
                                                    <Button
                                                        size="sm"
                                                        onClick={() =>
                                                            router.visit(route('externo.microbiologia.edit', m.id))
                                                        }
                                                    >
                                                        <CheckCircle className="h-4 w-4 mr-1" /> Día 5
                                                    </Button>
                                                    <Button
                                                        size="sm"
                                                        variant="outline"
                                                        onClick={() =>
                                                            router.post(route('externo.microbiologia.completar-dia5', m.id))
                                                        }
                                                    >
                                                        <ClipboardCheck className="h-4 w-4 mr-1" /> Limpio
                                                    </Button>
                                                </>
                                            )}
                                            {m.estado === 'Analizado' && (
                                                <Button size="sm" variant="outline" disabled>
                                                    <CheckCircle className="h-4 w-4 mr-1" /> Finalizado
                                                </Button>
                                            )}
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </div>
            </div>
        </AppLayout>
    );
}

// (Componente IniciarSiembraButton sin cambios)
function IniciarSiembraButton({ microbiologiaId }: { microbiologiaId: number }) {
    const [open, setOpen] = useState(false);
    const { data, setData, put, processing, errors } = useForm({
        fecha_siembra: new Date().toISOString().split('T')[0],
        ana_sem_id: '',
    });

    const { auth } = usePage().props as any;
    const user = auth?.user;

    const handleIniciar = (e: React.FormEvent) => {
        e.preventDefault();
        put(route('externo.microbiologia.siembra', microbiologiaId), {
            ...data,
            ana_sem_id: user?.id ? user.id.toString() : '',
        }, {
            onSuccess: () => setOpen(false),
        });
    };

    return (
        <>
            <Button size="sm" onClick={() => setOpen(true)}>
                <Play className="h-4 w-4 mr-1" /> Iniciar Siembra
            </Button>
            <Dialog open={open} onOpenChange={setOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Iniciar Siembra</DialogTitle>
                        <DialogDescription>
                            Selecciona la fecha de siembra. El analista se asignará automáticamente.
                        </DialogDescription>
                    </DialogHeader>
                    <form onSubmit={handleIniciar} className="space-y-3">
                        <div>
                            <label className="text-sm">Fecha de Siembra</label>
                            <input
                                id="fecha_siembra"
                                type="date"
                                className="w-full border rounded p-2"
                                value={data.fecha_siembra}
                                onChange={(e) => setData('fecha_siembra', e.target.value)}
                            />
                            {errors.fecha_siembra && (
                                <p className="text-sm text-red-500">{errors.fecha_siembra}</p>
                            )}
                        </div>
                        {errors.ana_sem_id && (
                            <p className="text-sm text-red-500">Error con el analista. Recarga la página.</p>
                        )}
                        <p className="text-xs text-muted-foreground">
                            Analista asignado: {user?.name ?? 'No disponible'}
                        </p>
                        <DialogFooter>
                            <Button variant="outline" type="button" onClick={() => setOpen(false)}>
                                Cancelar
                            </Button>
                            <Button type="submit" disabled={processing}>
                                {processing ? 'Guardando...' : 'Confirmar'}
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>
        </>
    );
}