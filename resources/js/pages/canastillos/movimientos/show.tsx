import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { Toast } from '@/components/ui/toast';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, router, usePage } from '@inertiajs/react';
import { ArrowLeft } from 'lucide-react';
import { route } from 'ziggy-js';

interface Almacen {
    id: number;
    nombre: string;
}

interface Vendedor {
    id: number;
    nombre: string;
    apellido: string;
}

interface Canastillo {
    id: number;
    nombre: string;
    tamaño?: string;
    precio?: number;
}

interface DetalleMovimiento {
    id: number;
    cantidad: number;
    saldo: number;
    canastillo: Canastillo;
}

interface Movimiento {
    id: number;
    tipo_movimiento: 'prestamo' | 'devolucion' | 'transferencia_salida' | 'transferencia_entrada';
    almacen_id: number;
    almacen2_id: number | null;
    vendedor_id: number | null;
    responsable_id: number;
    observaciones: string | null;
    created_at: string;
    updated_at: string;
    almacen?: Almacen;
    almacen2?: Almacen;
    vendedor?: Vendedor;
    responsable?: {
        id: number;
        name: string;
        apellido: string;
    };
    detalles: DetalleMovimiento[];
}

interface PageProps {
    movimiento: Movimiento;
    flash: {
        success?: string;
        error?: string;
    };
}

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Movimientos', href: '/canastillos/movimientos' },
    { title: 'Detalle de Movimiento', href: '/canastillos/movimientos/show' },
];

export default function Show() {
    const { props } = usePage();
    const { movimiento, flash } = props as unknown as PageProps;

    const formatFecha = (fecha: string) => {
        return new Date(fecha).toLocaleDateString('es-ES', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        });
    };

    const getTipoBadge = (tipo: string) => {
        const config: Record<string, { label: string; className: string }> = {
            prestamo: { label: 'Préstamo', className: 'bg-blue-100 text-blue-800 dark:bg-blue-800/30 dark:text-blue-400' },
            devolucion: { label: 'Devolución', className: 'bg-green-100 text-green-800 dark:bg-green-800/30 dark:text-green-400' },
            transferencia_salida: { label: 'Transferencia Salida', className: 'bg-orange-100 text-orange-800 dark:bg-orange-800/30 dark:text-orange-400' },
            transferencia_entrada: { label: 'Transferencia Entrada', className: 'bg-purple-100 text-purple-800 dark:bg-purple-800/30 dark:text-purple-400' },
        };
        return config[tipo] || { label: tipo, className: 'bg-muted text-muted-foreground' };
    };

    const badge = getTipoBadge(movimiento.tipo_movimiento);

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`Movimiento #${movimiento.id}`} />
            <div className="space-y-4 px-2 py-2 sm:px-6">
                <Toast />

                <div className="flex items-center justify-between">
                    <h1 className="text-2xl font-bold text-foreground">Detalle del Movimiento</h1>
                    <Button variant="outline" size="sm" onClick={() => router.visit(route('canastillos.movimientos.index'))}>
                        <ArrowLeft className="mr-2 h-4 w-4" />
                        Volver
                    </Button>
                </div>

                <Card className="p-6">
                    <dl className="grid grid-cols-1 gap-4 md:grid-cols-2">
                        <div>
                            <dt className="text-sm font-medium text-muted-foreground">Tipo de movimiento</dt>
                            <dd className="mt-1">
                                <Badge className={badge.className}>{badge.label}</Badge>
                            </dd>
                        </div>
                        <div>
                            <dt className="text-sm font-medium text-muted-foreground">Fecha</dt>
                            <dd className="text-lg">{formatFecha(movimiento.created_at)}</dd>
                        </div>
                        <div>
                            <dt className="text-sm font-medium text-muted-foreground">Almacén</dt>
                            <dd className="text-lg">{movimiento.almacen?.nombre || '-'}</dd>
                        </div>
                        <div>
                            <dt className="text-sm font-medium text-muted-foreground">
                                {movimiento.tipo_movimiento === 'prestamo' || movimiento.tipo_movimiento === 'devolucion'
                                    ? 'Vendedor'
                                    : 'Almacén destino'}
                            </dt>
                            <dd className="text-lg">
                                {movimiento.tipo_movimiento === 'prestamo' || movimiento.tipo_movimiento === 'devolucion'
                                    ? movimiento.vendedor
                                        ? `${movimiento.vendedor.nombre} ${movimiento.vendedor.apellido}`
                                        : '-'
                                    : movimiento.almacen2?.nombre || '-'}
                            </dd>
                        </div>
                        <div>
                            <dt className="text-sm font-medium text-muted-foreground">Responsable</dt>
                            <dd className="text-lg">
                                {movimiento.responsable
                                    ? `${movimiento.responsable.name} ${movimiento.responsable.apellido}`
                                    : '-'}
                            </dd>
                        </div>
                        <div className="col-span-full">
                            <dt className="text-sm font-medium text-muted-foreground">Observaciones</dt>
                            <dd className="text-lg whitespace-pre-wrap">{movimiento.observaciones || '-'}</dd>
                        </div>
                    </dl>
                </Card>

                <Card className="p-6">
                    <h2 className="text-lg font-semibold mb-4">Canastillos incluidos</h2>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Canastillo</TableHead>
                                <TableHead>Tamaño</TableHead>
                                <TableHead className="text-right">Cantidad</TableHead>
                                <TableHead className="text-right">Saldo después</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {movimiento.detalles.map((detalle) => (
                                <TableRow key={detalle.id}>
                                    <TableCell className="font-medium">{detalle.canastillo.nombre}</TableCell>
                                    <TableCell>{detalle.canastillo.tamaño || '-'}</TableCell>
                                    <TableCell className="text-right">{Math.abs(detalle.cantidad)}</TableCell>
                                    <TableCell className="text-right">{detalle.saldo}</TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </Card>
            </div>
        </AppLayout>
    );
}
