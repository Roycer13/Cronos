import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import FilterSelect from '@/components/ui/filter-select';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { Toast } from '@/components/ui/toast';
import { useAdvancedFilters } from '@/hooks/use-advanced-filters';
import { useAuth } from '@/hooks/useAuth';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, router, usePage } from '@inertiajs/react';
import {
    Filter,
    Eye,
    MoreHorizontal,
    Trash2,
    X,
    Plus,
    ArrowLeftRight,
    Handshake,
    RotateCcw,
    Check,
    XCircle,
} from 'lucide-react';
import { useState } from 'react';
import { route } from 'ziggy-js';

import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import TablePagination from '@/components/ui/table-pagination';

// Definición de tipos
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
}

interface DetalleMovimiento {
    id: number;
    canastillo: Canastillo;
    cantidad: number;
    saldo: number;
}

interface Estado {
    id: number;
    nombre: string;
    color: string;
}

interface Movimiento {
    id: number;
    tipo_movimiento: 'prestamo' | 'devolucion' | 'transferencia_salida' | 'transferencia_entrada' | 'ajuste_ingreso' | 'ajuste_salida';
    almacen_id: number;
    almacen2_id: number | null;
    vendedor_id: number | null;
    responsable_id: number;
    observaciones: string | null;
    created_at: string;
    almacen?: Almacen;
    almacen2?: Almacen;
    vendedor?: Vendedor;
    responsable?: {
        id: number;
        name: string;
        apellido: string;
    };
    detalles: DetalleMovimiento[];
    estado?: Estado; // relación con la tabla estados
}

interface PageProps {
    movimientos: {
        data: Movimiento[];
        links: any[];
        current_page: number;
        last_page: number;
        per_page: number;
        total: number;
    };
    filters: {
        almacen_id?: string;
        vendedor_id?: string;
        tipo_movimiento?: string;
        fecha_desde?: string;
        fecha_hasta?: string;
        responsable_id?: string;
        per_page?: string;
    };
    almacenes: Almacen[];
    vendedores: Vendedor[];
    tiposMovimiento: Record<string, string>;
    flash: {
        success?: string;
        error?: string;
    };
}

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Movimientos', href: '/canastillos/movimientos' },
];

export default function Index() {
    const { props } = usePage();
    const [deleteModalOpen, setDeleteModalOpen] = useState(false);
    const [movimientoToDelete, setMovimientoToDelete] = useState<Movimiento | null>(null);
    const [showFilters, setShowFilters] = useState(false);

    const { hasPermission } = useAuth();

    const {
        movimientos = {
            data: [],
            links: [],
            current_page: 1,
            last_page: 1,
            per_page: 10,
            total: 0,
        },
        filters: initialFilters = {},
        almacenes = [],
        vendedores = [],
        tiposMovimiento = {},
        flash,
    } = props as unknown as PageProps;

    const { filters, updateFilter, resetFilters } = useAdvancedFilters({
        routeName: 'canastillos.movimientos.index',
        initialFilters: {
            almacen_id: initialFilters.almacen_id?.toString() || '',
            vendedor_id: initialFilters.vendedor_id?.toString() || '',
            tipo_movimiento: initialFilters.tipo_movimiento?.toString() || '',
            fecha_desde: initialFilters.fecha_desde?.toString() || '',
            fecha_hasta: initialFilters.fecha_hasta?.toString() || '',
            responsable_id: initialFilters.responsable_id?.toString() || '',
            per_page: initialFilters.per_page?.toString() || '10',
        },
        debounceFields: [],
        debounceDelay: 600,
    });

    const hasActiveFilters = Object.values(filters).some(
        (value) => value && value !== '' && value !== '10'
    );

    const handleView = (id: number) => {
        router.visit(route('canastillos.movimientos.show', id));
    };

    const confirmDelete = (movimiento: Movimiento) => {
        setMovimientoToDelete(movimiento);
        setDeleteModalOpen(true);
    };

    const handleDelete = () => {
        if (movimientoToDelete) {
            router.delete(route('canastillos.movimientos.destroy', movimientoToDelete.id), {
                preserveScroll: true,
                onSuccess: () => {
                    setDeleteModalOpen(false);
                    setMovimientoToDelete(null);
                },
            });
        }
    };

    const handleAceptar = (id: number) => {
        if (confirm('¿Aceptar esta transferencia? Se actualizará el stock.')) {
            router.post(route('canastillos.movimientos.aceptar', id), {}, {
                preserveScroll: true,
                onSuccess: () => {
                    // Recargar la página para actualizar el listado
                    router.reload();
                },
            });
        }
    };

    const handleRechazar = (id: number) => {
        if (confirm('¿Rechazar esta transferencia? No se modificará el stock.')) {
            router.post(route('canastillos.movimientos.rechazar', id), {}, {
                preserveScroll: true,
                onSuccess: () => {
                    router.reload();
                },
            });
        }
    };

    const getTipoBadge = (tipo: string) => {
        const config: Record<string, { label: string; className: string }> = {
            prestamo: { label: 'Préstamo', className: 'bg-blue-100 text-blue-800 dark:bg-blue-800/30 dark:text-blue-400' },
            devolucion: { label: 'Devolución', className: 'bg-green-100 text-green-800 dark:bg-green-800/30 dark:text-green-400' },
            transferencia_salida: { label: 'Transferencia Salida', className: 'bg-orange-100 text-orange-800 dark:bg-orange-800/30 dark:text-orange-400' },
            transferencia_entrada: { label: 'Transferencia Entrada', className: 'bg-purple-100 text-purple-800 dark:bg-purple-800/30 dark:text-purple-400' },
            ajuste_ingreso: { label: 'Ajuste Ingreso', className: 'bg-teal-100 text-teal-800 dark:bg-teal-800/30 dark:text-teal-400' },
            ajuste_salida: { label: 'Ajuste Salida', className: 'bg-rose-100 text-rose-800 dark:bg-rose-800/30 dark:text-rose-400' },
        };
        return config[tipo] || { label: tipo, className: 'bg-muted text-muted-foreground' };
    };

    const getEstadoBadge = (estado: Estado | undefined) => {
        if (!estado) return <Badge variant="outline">Desconocido</Badge>;
        const bgColor = estado.color || '#9ca3af';
        return (
            <Badge style={{ backgroundColor: bgColor, color: '#fff' }}>
                {estado.nombre}
            </Badge>
        );
    };

    const formatFecha = (fecha: string) => {
        return new Date(fecha).toLocaleDateString('es-ES', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        });
    };

    const totalCanastillos = (detalles: DetalleMovimiento[]) => {
        return detalles.reduce((sum, d) => sum + Math.abs(d.cantidad), 0);
    };

    // Determinar si un movimiento puede ser aceptado/rechazado (transferencia_entrada y estado pendiente)
    const puedeGestionarTransferencia = (movimiento: Movimiento) => {
        return movimiento.tipo_movimiento === 'transferencia_entrada' &&
               movimiento.estado?.nombre === 'Pendiente' &&
               hasPermission('u_movimiento');
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Movimientos" />
            <div className="space-y-2 px-2 py-2 sm:px-6">
                <Toast />

                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <h1 className="text-2xl font-bold text-foreground">
                        Movimientos de Canastillos
                    </h1>

                    <div className="flex items-center gap-2">
                        {hasPermission('c_movimiento') && (
                            <>
                                <Button
                                    onClick={() => router.visit(route('canastillos.movimientos.prestamo.create'))}
                                    size="sm"
                                    variant="outline"
                                    className="flex items-center gap-2"
                                >
                                    <Handshake className="h-4 w-4" />
                                    <span className="hidden md:block">Préstamo</span>
                                </Button>
                                <Button
                                    onClick={() => router.visit(route('canastillos.movimientos.devolucion.create'))}
                                    size="sm"
                                    variant="outline"
                                    className="flex items-center gap-2"
                                >
                                    <RotateCcw className="h-4 w-4" />
                                    <span className="hidden md:block">Devolución</span>
                                </Button>
                                <Button
                                    onClick={() => router.visit(route('canastillos.movimientos.ajuste.create'))}
                                    size="sm"
                                    variant="outline"
                                    className="flex items-center gap-2"
                                >
                                    <span className="hidden md:block">Ajuste</span>
                                </Button>
                                <Button
                                    onClick={() => router.visit(route('canastillos.movimientos.transferencia.create'))}
                                    size="sm"
                                    variant="outline"
                                    className="flex items-center gap-2"
                                >
                                    <ArrowLeftRight className="h-4 w-4" />
                                    <span className="hidden md:block">Transferencia</span>
                                </Button>
                            </>
                        )}

                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setShowFilters(!showFilters)}
                            className="flex items-center gap-2"
                        >
                            <Filter className="h-4 w-4" />
                            <span className="hidden md:block">Filtros</span>
                            {hasActiveFilters && (
                                <span className="flex h-5 w-5 items-center justify-center rounded-full bg-primary text-xs text-primary-foreground">
                                    !
                                </span>
                            )}
                        </Button>
                    </div>
                </div>

                {showFilters && (
                    <div className="rounded-lg border border-border bg-muted/50 p-2">
                        <div className="mb-3 flex items-center justify-between">
                            <h3 className="font-semibold text-foreground">Filtros avanzados</h3>
                            {hasActiveFilters && (
                                <Button variant="ghost" size="sm" onClick={resetFilters} className="text-xs">
                                    <X className="mr-1 h-4 w-4" /> Limpiar
                                </Button>
                            )}
                        </div>
                        <div className="grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-6">
                            <FilterSelect
                                value={filters.almacen_id}
                                onChange={(v) => updateFilter('almacen_id', v)}
                                placeholder="Todos los almacenes"
                                options={almacenes.map((a) => ({ value: a.id.toString(), label: a.nombre }))}
                            />
                            <FilterSelect
                                value={filters.vendedor_id}
                                onChange={(v) => updateFilter('vendedor_id', v)}
                                placeholder="Todos los vendedores"
                                options={vendedores.map((v) => ({ value: v.id.toString(), label: `${v.nombre} ${v.apellido}` }))}
                            />
                            <FilterSelect
                                value={filters.tipo_movimiento}
                                onChange={(v) => updateFilter('tipo_movimiento', v)}
                                placeholder="Todos los tipos"
                                options={Object.entries(tiposMovimiento).map(([value, label]) => ({ value, label }))}
                            />
                            <input
                                type="date"
                                value={filters.fecha_desde}
                                onChange={(e) => updateFilter('fecha_desde', e.target.value)}
                                className="rounded-md border border-input bg-background px-3 py-2 text-sm"
                            />
                            <input
                                type="date"
                                value={filters.fecha_hasta}
                                onChange={(e) => updateFilter('fecha_hasta', e.target.value)}
                                className="rounded-md border border-input bg-background px-3 py-2 text-sm"
                            />
                            <FilterSelect
                                value={filters.per_page}
                                onChange={(v) => updateFilter('per_page', v)}
                                placeholder="Resultados por página"
                                options={['10', '25', '50', '100'].map((v) => ({ value: v, label: `${v} por página` }))}
                                includeAllOption={false}
                            />
                        </div>
                    </div>
                )}

                <Card>
                    <div className="overflow-x-auto">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Fecha</TableHead>
                                    <TableHead>Tipo</TableHead>
                                    <TableHead>Estado</TableHead>
                                    <TableHead>Almacén</TableHead>
                                    <TableHead>Destino / Vendedor</TableHead>
                                    <TableHead>Canastillos</TableHead>
                                    <TableHead>Responsable</TableHead>
                                    <TableHead className="w-[120px]">Acciones</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {movimientos.data.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={8} className="py-8 text-center text-muted-foreground">
                                            No se encontraron movimientos.
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    movimientos.data.map((movimiento) => {
                                        const badgeTipo = getTipoBadge(movimiento.tipo_movimiento);
                                        const puedeAceptar = puedeGestionarTransferencia(movimiento);
                                        return (
                                            <TableRow key={movimiento.id} className="hover:bg-muted/50">
                                                <TableCell>{formatFecha(movimiento.created_at)}</TableCell>
                                                <TableCell>
                                                    <Badge className={badgeTipo.className}>{badgeTipo.label}</Badge>
                                                </TableCell>
                                                <TableCell>{getEstadoBadge(movimiento.estado)}</TableCell>
                                                <TableCell>{movimiento.almacen?.nombre || '-'}</TableCell>
                                                <TableCell>
                                                    {movimiento.tipo_movimiento === 'prestamo' || movimiento.tipo_movimiento === 'devolucion'
                                                        ? movimiento.vendedor
                                                            ? `${movimiento.vendedor.nombre} ${movimiento.vendedor.apellido}`
                                                            : '-'
                                                        : movimiento.almacen2?.nombre || '-'}
                                                </TableCell>
                                                <TableCell>{totalCanastillos(movimiento.detalles)} canastillos</TableCell>
                                                <TableCell>
                                                    {movimiento.responsable
                                                        ? `${movimiento.responsable.name} ${movimiento.responsable.apellido}`
                                                        : '-'}
                                                </TableCell>
                                                <TableCell>
                                                    <div className="flex gap-1">
                                                        {puedeAceptar && (
                                                            <>
                                                                <Button
                                                                    size="sm"
                                                                    variant="ghost"
                                                                    className="text-green-600"
                                                                    onClick={() => handleAceptar(movimiento.id)}
                                                                    title="Aceptar transferencia"
                                                                >
                                                                    <Check className="h-4 w-4" />
                                                                </Button>
                                                                <Button
                                                                    size="sm"
                                                                    variant="ghost"
                                                                    className="text-red-600"
                                                                    onClick={() => handleRechazar(movimiento.id)}
                                                                    title="Rechazar transferencia"
                                                                >
                                                                    <XCircle className="h-4 w-4" />
                                                                </Button>
                                                            </>
                                                        )}
                                                        <DropdownMenu>
                                                            <DropdownMenuTrigger asChild>
                                                                <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                                                                    <MoreHorizontal className="h-4 w-4" />
                                                                </Button>
                                                            </DropdownMenuTrigger>
                                                            <DropdownMenuContent align="end" className="w-48">
                                                                <DropdownMenuItem onClick={() => handleView(movimiento.id)}>
                                                                    <Eye className="mr-2 h-4 w-4" />
                                                                    Ver detalles
                                                                </DropdownMenuItem>
                                                                {hasPermission('d_movimiento') && (
                                                                    <DropdownMenuItem
                                                                        onClick={() => confirmDelete(movimiento)}
                                                                        className="text-destructive focus:text-destructive"
                                                                    >
                                                                        <Trash2 className="mr-2 h-4 w-4" />
                                                                        Anular
                                                                    </DropdownMenuItem>
                                                                )}
                                                            </DropdownMenuContent>
                                                        </DropdownMenu>
                                                    </div>
                                                </TableCell>
                                            </TableRow>
                                        );
                                    })
                                )}
                            </TableBody>
                        </Table>
                    </div>
                    {movimientos.data.length > 0 && (
                        <div className="border-t px-4 py-3">
                            <TablePagination
                                pagination={movimientos}
                                onPageChange={(page) =>
                                    router.get(
                                        route('canastillos.movimientos.index'),
                                        { ...filters, page },
                                        { preserveState: true, replace: true }
                                    )
                                }
                            />
                        </div>
                    )}
                </Card>

                <div className="flex items-center justify-between">
                    <p className="text-muted-foreground">{movimientos.total} movimientos registrados</p>
                    {movimientos.data.length > 0 && (
                        <p className="text-muted-foreground">Mostrando {movimientos.data.length} de {movimientos.total}</p>
                    )}
                </div>
            </div>

            <Dialog open={deleteModalOpen} onOpenChange={setDeleteModalOpen}>
                <DialogContent className="max-w-md">
                    <DialogHeader>
                        <DialogTitle>Confirmar anulación</DialogTitle>
                        <DialogDescription>
                            ¿Está seguro de que desea anular este movimiento? Esta acción no se puede deshacer y revertirá los cambios en el inventario.
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setDeleteModalOpen(false)}>Cancelar</Button>
                        <Button variant="destructive" onClick={handleDelete}>Anular</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </AppLayout>
    );
}
