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
import { Package, TrendingUp, AlertCircle } from 'lucide-react';
import { useState } from 'react';

interface CanastilloInventario {
    canastillo: { id: number; nombre: string; tamaño?: string };
    saldo: number;
}

interface Almacen {
    id: number;
    nombre: string;
}

interface Props {
    almacenes: Almacen[];
    selectedAlmacen: Almacen | null;
    inventario: CanastilloInventario[];
    puedeVerTodos: boolean;
}

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Inventario', href: '/canastillos/inventario' },
];

export default function InventarioIndex({ almacenes, selectedAlmacen, inventario, puedeVerTodos }: Props) {
    const [activeAlmacenId, setActiveAlmacenId] = useState<string>(
        selectedAlmacen ? selectedAlmacen.id.toString() : ''
    );

    const handleAlmacenChange = (almacenId: string) => {
        setActiveAlmacenId(almacenId);
        router.get(route('canastillos.inventario.index'), { almacen_id: almacenId }, { preserveState: true });
    };

    // Calcular total de canastillos
    const totalCanastillos = inventario.reduce((sum, item) => sum + item.saldo, 0);
    const productosConStock = inventario.filter(item => item.saldo > 0).length;

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Inventario de Canastillos" />
            <div className="space-y-6 px-4 py-4 sm:px-6">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <h1 className="text-2xl font-bold text-foreground">Inventario por Almacén</h1>
                </div>

                {/* Selector de almacén (solo si puede ver más de uno) */}
                {puedeVerTodos && almacenes.length > 1 && (
                    <div className="w-full overflow-x-auto">
                        <Tabs value={activeAlmacenId} onValueChange={handleAlmacenChange} className="w-full">
                            <TabsList className="flex w-full flex-wrap h-auto">
                                {almacenes.map((alm) => (
                                    <TabsTrigger key={alm.id} value={alm.id.toString()} className="flex-1">
                                        {alm.nombre}
                                    </TabsTrigger>
                                ))}
                            </TabsList>
                        </Tabs>
                    </div>
                )}

                {!selectedAlmacen ? (
                    <Card className="p-8 text-center text-muted-foreground">
                        No tienes acceso a ningún almacén.
                    </Card>
                ) : (
                    <>
                        {/* Resumen rápido */}
                        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                            <Card className="p-4 flex items-center gap-4">
                                <Package className="h-8 w-8 text-primary" />
                                <div>
                                    <p className="text-sm text-muted-foreground">Total de canastillos</p>
                                    <p className="text-2xl font-bold">{totalCanastillos}</p>
                                </div>
                            </Card>
                            <Card className="p-4 flex items-center gap-4">
                                <TrendingUp className="h-8 w-8 text-green-600" />
                                <div>
                                    <p className="text-sm text-muted-foreground">Tipos con stock</p>
                                    <p className="text-2xl font-bold">{productosConStock} / {inventario.length}</p>
                                </div>
                            </Card>
                            <Card className="p-4 flex items-center gap-4">
                                <AlertCircle className="h-8 w-8 text-yellow-600" />
                                <div>
                                    <p className="text-sm text-muted-foreground">Sin stock</p>
                                    <p className="text-2xl font-bold">{inventario.filter(i => i.saldo === 0).length}</p>
                                </div>
                            </Card>
                        </div>

                        {/* Tabla de inventario */}
                        <Card>
                            <div className="overflow-x-auto">
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>Canastillo</TableHead>
                                            <TableHead>Tamaño</TableHead>
                                            <TableHead className="text-right">Stock actual</TableHead>
                                            <TableHead className="text-right">Estado</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {inventario.length === 0 ? (
                                            <TableRow>
                                                <TableCell colSpan={4} className="text-center py-8">
                                                    No hay canastillos registrados en este almacén.
                                                </TableCell>
                                            </TableRow>
                                        ) : (
                                            inventario.map((item) => (
                                                <TableRow key={item.canastillo.id}>
                                                    <TableCell className="font-medium">{item.canastillo.nombre}</TableCell>
                                                    <TableCell>{item.canastillo.tamaño || '-'}</TableCell>
                                                    <TableCell className="text-right font-mono">{item.saldo}</TableCell>
                                                    <TableCell className="text-right">
                                                        {item.saldo === 0 ? (
                                                            <Badge variant="destructive">Sin stock</Badge>
                                                        ) : item.saldo < 10 ? (
                                                            <Badge variant="warning">Bajo stock</Badge>
                                                        ) : (
                                                            <Badge variant="default">Disponible</Badge>
                                                        )}
                                                    </TableCell>
                                                </TableRow>
                                            ))
                                        )}
                                    </TableBody>
                                </Table>
                            </div>
                        </Card>
                    </>
                )}
            </div>
        </AppLayout>
    );
}
