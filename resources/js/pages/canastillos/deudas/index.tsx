import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Head, router } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { DollarSign, Users, Package } from 'lucide-react';
import { useState } from 'react';

interface DeudaDetalle {
    canastillo_id: number;
    canastillo: { nombre: string; tamaño?: string } | null;
    prestado: number;
    devuelto: number;
    deuda_actual: number;
}

interface DeudaVendedor {
    vendedor_id: number;
    vendedor: { nombre: string; apellido: string } | null;
    total_deuda: number;   // suma de deuda_actual de todos sus detalles
    detalles: DeudaDetalle[];
}

interface Almacen {
    id: number;
    nombre: string;
}

interface Props {
    almacenes: Almacen[];
    selectedAlmacen: Almacen | null;
    deudas: DeudaVendedor[];
    puedeVerTodos: boolean;
}

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Deudas', href: '/canastillos/deudas' },
];

export default function DeudasIndex({ almacenes, selectedAlmacen, deudas, puedeVerTodos }: Props) {
    const [activeAlmacenId, setActiveAlmacenId] = useState<string>(
        selectedAlmacen ? selectedAlmacen.id.toString() : ''
    );

    const handleAlmacenChange = (almacenId: string) => {
        setActiveAlmacenId(almacenId);
        router.get(route('canastillos.deudas.index'), { almacen_id: almacenId }, { preserveState: true });
    };

    const totalGlobalDeuda = deudas.reduce((sum, v) => sum + v.total_deuda, 0);
    const totalVendedores = deudas.length;

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Deudas de Vendedores" />
            <div className="space-y-6 px-4 py-4 sm:px-6">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <h1 className="text-2xl font-bold text-foreground">Deudas por Almacén</h1>
                </div>

                {puedeVerTodos && almacenes.length > 1 && (
                    <Tabs value={activeAlmacenId} onValueChange={handleAlmacenChange} className="w-full">
                        <TabsList className="flex w-full flex-wrap h-auto">
                            {almacenes.map((alm) => (
                                <TabsTrigger key={alm.id} value={alm.id.toString()} className="flex-1">
                                    {alm.nombre}
                                </TabsTrigger>
                            ))}
                        </TabsList>
                    </Tabs>
                )}

                {!selectedAlmacen ? (
                    <Card className="p-8 text-center text-muted-foreground">
                        No tienes acceso a ningún almacén.
                    </Card>
                ) : (
                    <>
                        {/* Tarjetas de resumen */}
                        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                            <Card className="p-4 flex items-center gap-4">
                                <DollarSign className="h-8 w-8 text-destructive" />
                                <div>
                                    <p className="text-sm text-muted-foreground">Deuda total (canastillos)</p>
                                    <p className="text-2xl font-bold">{totalGlobalDeuda}</p>
                                </div>
                            </Card>
                            <Card className="p-4 flex items-center gap-4">
                                <Users className="h-8 w-8 text-primary" />
                                <div>
                                    <p className="text-sm text-muted-foreground">Vendedores con deuda</p>
                                    <p className="text-2xl font-bold">{totalVendedores}</p>
                                </div>
                            </Card>
                        </div>

                        {/* Lista de vendedores con deuda */}
                        {deudas.length === 0 ? (
                            <Card className="p-8 text-center text-muted-foreground">
                                No hay deudas pendientes en este almacén.
                            </Card>
                        ) : (
                            deudas.map((vendedor) => (
                                <Card key={vendedor.vendedor_id} className="p-4">
                                    <div className="flex justify-between items-center mb-3">
                                        <h2 className="text-lg font-semibold">
                                            {vendedor.vendedor?.nombre} {vendedor.vendedor?.apellido || ''}
                                        </h2>
                                        <Badge variant="destructive" className="text-base">
                                            Deuda: {vendedor.total_deuda} canastillo(s)
                                        </Badge>
                                    </div>
                                    <Table>
                                        <TableHeader>
                                            <TableRow>
                                                <TableHead>Canastillo</TableHead>
                                                <TableHead>Tamaño</TableHead>
                                                <TableHead className="text-right">Prestado</TableHead>
                                                <TableHead className="text-right">Devuelto</TableHead>
                                                <TableHead className="text-right">Pendiente</TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {vendedor.detalles.map((detalle) => (
                                                <TableRow key={detalle.canastillo_id}>
                                                    <TableCell>{detalle.canastillo?.nombre || '-'}</TableCell>
                                                    <TableCell>{detalle.canastillo?.tamaño || '-'}</TableCell>
                                                    <TableCell className="text-right">{detalle.prestado}</TableCell>
                                                    <TableCell className="text-right">{detalle.devuelto}</TableCell>
                                                    <TableCell className="text-right font-mono">
                                                        {detalle.deuda_actual > 0 ? (
                                                            <Badge variant="destructive">{detalle.deuda_actual}</Badge>
                                                        ) : (
                                                            <Badge variant="outline">0</Badge>
                                                        )}
                                                    </TableCell>
                                                </TableRow>
                                            ))}
                                        </TableBody>
                                    </Table>
                                </Card>
                            ))
                        )}
                    </>
                )}
            </div>
        </AppLayout>
    );
}
