import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import TablePagination from '@/components/ui/table-pagination';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import AppLayout from '@/layouts/app-layout';
import { Head, Link, router, usePage } from '@inertiajs/react';
import { Check, Edit, Plus, Search, Sparkles, Trash2 } from 'lucide-react';
import { useState } from 'react';
import { route } from 'ziggy-js';

const breadcrumbs = [{ title: 'Arranques de línea', href: '/arranques-linea' }];

type Arranque = {
    id: number;
    tiempo: string;
    CIP?: string | null;
    observacion?: string | null;
    estado?: { nombre: string } | null;
    usuario?: { name?: string; apellido?: string ; } | null;
    detalles?: { numero: number | string; inicio_final?: string | null; tiempo?: string | null; h202?: boolean; origen_id: number | string; origen?: { descripcion?: string; alias?: string } | null }[];
    orps?: { orp?: Orp | null }[];
    detalles_op?: { numero?: string | null; tipo?: string | null }[];
};

type Orp = {
    codigo: string;
    lote?: string | number | null;
    fecha_vencimiento1?: string | null;
    producto_terminado?: { nombre_sap?: string | null; destino?: { nombre?: string | null } | null } | null;
};

type Origen = { id: number; alias?: string; descripcion: string };
const TIPOS_OP = ['OP Empaque', 'OP Bobina', 'Numero Bobina', 'Numero Empaque'];

const numeroLotes = (arranque: Arranque) =>
    [...new Set((arranque.detalles || []).map((detalle) => Number(detalle.numero) || 1))].sort(
        (a, b) => b - a,
    );

const detallePorOrigenYLote = (arranque: Arranque, origenId: number, numero: number) => {
    const detalle = (arranque.detalles || []).find(
        (item) => Number(item.origen_id) === origenId && Number(item.numero) === numero,
    );

    if (!detalle?.tiempo) return '-';

    const hora = detalle.tiempo
            ? new Date(detalle.tiempo).toLocaleTimeString('es-BO', {
                  hour12: false,
                  hour: '2-digit',
                  minute: '2-digit',
              })
            : '-';

    return (
        <span className="whitespace-nowrap">
            {hora}{' '}
            <span className="text-xs text-muted-foreground">
                 {detalle.h202 ? '✓' : '-'}
            </span>

        </span>
    );
};

const opsPorTipo = (arranque: Arranque, tipo: string) =>
    (arranque.detalles_op || [])
        .filter((op) => op.tipo?.trim().toLowerCase() === tipo.toLowerCase() && op.numero?.trim())
        .map((op) => op.numero!.trim())
        .join(', ') || '-';

const inicioFinalPorLote = (arranque: Arranque, numero: number) =>
    (arranque.detalles || []).find((detalle) => Number(detalle.numero) === numero)?.inicio_final || '-';

const orpsDeArranque = (arranque: Arranque) => (arranque.orps || []).map((detalle) => detalle.orp).filter((orp): orp is Orp => Boolean(orp));

const orpsConLote = (arranque: Arranque) => orpsDeArranque(arranque).map((orp) => ({ orp, lote: formatoLote(orp.lote) }));

const fechaVencimiento = (fecha?: string | null) => fecha ? new Date(fecha).toLocaleDateString('es-BO') : '-';

const formatoLote = (lote?: string | number | null) => {
    if (lote === null || lote === undefined || lote === '') return '-';

    const texto = String(lote).trim();
    if (!texto.includes('.')) return texto;

    const sinCerosFinales = texto.replace(/0+$/, '').replace(/\.$/, '');
    return sinCerosFinales.startsWith('.') ? `0${sinCerosFinales}` : sinCerosFinales;
};

type PageProps = {
    arranques: {
        data: Arranque[];
        current_page: number;
        last_page: number;
        per_page: number;
        total: number;
    };
    origenes: Origen[];
    filters?: { search?: string; fecha?: string; per_page?: number };
    cipActivoId?: number | null;
    puedeCrearArranque: boolean;
};

export default function Index() {
    const { arranques, origenes, filters: initialFilters = {}, flash, cipActivoId, puedeCrearArranque } = usePage<PageProps & { flash?: { success?: string } }>().props;
    const [search, setSearch] = useState(initialFilters.search || '');
    const [fecha, setFecha] = useState(initialFilters.fecha || '');
    const [cipModalOpen, setCipModalOpen] = useState(false);
    const [cipTipo, setCipTipo] = useState('CIP Intermedio');
    const [cipProcessing, setCipProcessing] = useState(false);
    const [creatingTandaFor, setCreatingTandaFor] = useState<number | null>(null);

    const buscar = () => {
        router.get(route('arranques-linea.index'), { search, fecha }, { preserveState: true, replace: true });
    };

    const marcarFinal = (arranqueId: number) => {
        router.post(route('arranques-linea.marcar-final', arranqueId));
    };

    const iniciarCip = (event: React.FormEvent) => {
        event.preventDefault();
        setCipProcessing(true);
        router.post(route('arranques-linea.cip.store'), { CIP: cipTipo }, {
            onSuccess: () => setCipModalOpen(false),
            onFinish: () => setCipProcessing(false),
        });
    };

    const terminarCip = (arranqueId: number) => {
        router.post(route('arranques-linea.cip.terminar', arranqueId));
    };

    const crearTanda = (arranqueId: number) => {
        setCreatingTandaFor(arranqueId);
        router.post(route('arranques-linea.detalles.store', arranqueId), {}, {
            onFinish: () => setCreatingTandaFor(null),
        });
    };

    const eliminarTanda = (arranqueId: number, numero: number) => {
        if (!window.confirm(`¿Eliminar completamente la tanda ${numero}?`)) return;
        router.delete(route('arranques-linea.detalles.destroy', { arranqueLinea: arranqueId, numero }));
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Arranques de línea" />
            <div className="space-y-4 p-4">
                <div className="flex flex-wrap items-center justify-between gap-3">
                    <div>
                        <h1 className="text-2xl font-bold">Arranques de línea</h1>
                        <p className="text-sm text-muted-foreground">Registro de arranques y sus detalles por origen.</p>
                    </div>
                    {puedeCrearArranque && <div className="flex flex-wrap gap-2">
                        <Link href={route('arranques-linea.create')}>
                            <Button><Plus className="mr-2 h-4 w-4" />Crear arranque</Button>
                        </Link>
                        <Button variant="outline" onClick={() => setCipModalOpen(true)}><Sparkles className="mr-2 h-4 w-4" />Crear CIP</Button>
                    </div>}
                </div>

                {flash?.success && <div className="rounded-md border border-green-200 bg-green-50 p-3 text-sm text-green-700">{flash.success}</div>}

                <div className="flex flex-wrap items-end gap-2 rounded-lg border bg-muted/30 p-3">
                    <div className="relative min-w-56 flex-1">
                        <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                        <Input value={search} onChange={(event) => setSearch(event.target.value)} onKeyDown={(event) => event.key === 'Enter' && buscar()} placeholder="Buscar código de ORP" className="pl-9" />
                    </div>
                    <Input type="date" value={fecha} onChange={(event) => setFecha(event.target.value)} className="w-auto" />
                    <Button variant="outline" onClick={buscar}>Buscar</Button>
                </div>

                <div className="overflow-hidden rounded-lg border bg-background">
                    <div className="overflow-x-auto">
                        <Table>
                            <TableHeader><TableRow>
                                {/* <TableHead>Código</TableHead> */}
                            <TableHead>Fecha</TableHead>
                            <TableHead>ORP / Producto / Destino / Vencimiento</TableHead>
                            <TableHead>Lote</TableHead>
                            <TableHead>Inicio/Final</TableHead>{origenes.map((origen) => <TableHead key={origen.id}>{origen.alias ? ` ${origen.alias}` : ''}</TableHead>)}
                            <TableHead>Opciones</TableHead>
                            {TIPOS_OP.map((tipo) => <TableHead key={tipo}> {tipo}</TableHead>)}

                            <TableHead>Observación</TableHead><TableHead>Usuario</TableHead><TableHead>Acciones</TableHead></TableRow>

                            </TableHeader>
                            <TableBody>
                                {arranques.data.length === 0 ? <TableRow><TableCell colSpan={origenes.length + 11} className="py-8 text-center text-muted-foreground">No hay arranques registrados.</TableCell></TableRow> : arranques.data.flatMap((arranque) => numeroLotes(arranque).map((numero, indice) => (
                                    <TableRow key={`${arranque.id}-${numero}`} className={arranque.estado?.nombre !== 'Completado' ? 'bg-yellow-50 hover:bg-yellow-100 dark:bg-yellow-950/30 dark:hover:bg-yellow-950/50' : undefined}>
                                        {/* <TableCell>{indice === 0 ? `ARR-${arranque.id}` : ''}</TableCell> */}
                                        {indice === 0 && <TableCell rowSpan={numeroLotes(arranque).length} className="align-top">{new Date(arranque.tiempo).toLocaleDateString('es-BO')}</TableCell>}
                                        {indice === 0 && <TableCell rowSpan={numeroLotes(arranque).length} className="w-64 max-w-64 whitespace-normal break-words align-top"><div className="space-y-2">{arranque.CIP && <div className="min-h-16 font-semibold">{arranque.CIP}</div>}{orpsConLote(arranque).length > 0 ? orpsConLote(arranque).map(({ orp }) => <div key={orp.codigo} className="min-h-16"><strong>{orp.codigo}</strong><div className="text-xs text-muted-foreground">{orp.producto_terminado?.nombre_sap || 'Sin producto'}</div><div className="text-xs text-muted-foreground">Destino: {orp.producto_terminado?.destino?.nombre || '-'}</div><div className="text-xs text-muted-foreground">Vence: {fechaVencimiento(orp.fecha_vencimiento1)}</div></div>) : !arranque.CIP ? 'Sin ORP' : null}</div></TableCell>}
                                        {indice === 0 && <TableCell rowSpan={numeroLotes(arranque).length} className="align-top"><div className="space-y-2">{orpsConLote(arranque).map(({ orp, lote }) => <div key={`${orp.codigo}-lote`} className="min-h-16">{lote}</div>)}{arranque.CIP && <div className="min-h-16">-</div>}</div></TableCell>}

                                        <TableCell className="uppercase">{inicioFinalPorLote(arranque, numero)}</TableCell>
                                        {origenes.map((origen) => <TableCell key={origen.id}>{detallePorOrigenYLote(arranque, origen.id, numero)}</TableCell>)}
                                        <TableCell><div className="flex items-center gap-1">{!arranque.CIP && <Link href={route('arranques-linea.detalles.edit', { arranqueLinea: arranque.id, numero })}><Button variant="ghost" size="sm" aria-label={`Editar horas de la tanda ${numero}`}><Edit className="mr-1 h-4 w-4" /></Button></Link>}{numero === Math.max(...numeroLotes(arranque)) && <Button variant="ghost" size="sm" className="h-8 w-8 p-0 text-destructive" aria-label={`Eliminar última tanda ${numero}`} onClick={() => eliminarTanda(arranque.id, numero)}><Trash2 className="h-4 w-4" /></Button>}</div></TableCell>
                                        {indice === 0 && TIPOS_OP.map((tipo) => <TableCell key={tipo} rowSpan={numeroLotes(arranque).length}>{opsPorTipo(arranque, tipo)}</TableCell>)}

                                        {indice === 0 && <TableCell rowSpan={numeroLotes(arranque).length}>{arranque.observacion || '-'}</TableCell>}
                                        {indice === 0 && <TableCell rowSpan={numeroLotes(arranque).length}>{`${arranque.usuario?.name || ''} ${arranque.usuario?.apellido || ''}`.trim() || '-'}</TableCell>}
                                        {indice === 0 && <TableCell rowSpan={numeroLotes(arranque).length}><div className="flex items-center gap-1">{arranque.CIP ? (arranque.id === cipActivoId && <Button variant="outline" size="sm" onClick={() => terminarCip(arranque.id)}><Check className="mr-1 h-4 w-4" />Terminar CIP</Button>) : <><Button variant="outline" size="sm" aria-label="Crear tanda con hora actual" disabled={creatingTandaFor !== null} onClick={() => crearTanda(arranque.id)}><Plus className="mr-1 h-4 w-4" />{creatingTandaFor === arranque.id ? 'Creando...' : ''}</Button><Link href={route('arranques-linea.edit', arranque.id)}><Button variant="ghost" size="sm" className="h-8 w-8 p-0" aria-label={`Editar ARR-${arranque.id}`}><Edit className="h-4 w-4" /></Button></Link>{arranque.estado?.nombre !== 'Completado' && <Button variant="outline" size="sm" onClick={() => marcarFinal(arranque.id)}><Check className="mr-1 h-4 w-4" />Marcar final</Button>}</>}</div></TableCell>}
                                    </TableRow>
                                )))}
                            </TableBody>
                        </Table>
                    </div>
                    {arranques.data.length > 0 && <div className="border-t px-4 py-3"><TablePagination pagination={arranques} onPageChange={(page) => router.get(route('arranques-linea.index'), { search, fecha, page }, { preserveState: true, replace: true })} /></div>}
                </div>
                <p className="text-sm text-muted-foreground">{arranques.total} arranques registrados</p>
            </div>
            <Dialog open={cipModalOpen} onOpenChange={setCipModalOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Crear CIP</DialogTitle>
                        <DialogDescription>Selecciona el tipo de CIP que deseas iniciar.</DialogDescription>
                    </DialogHeader>
                    <form onSubmit={iniciarCip} className="space-y-4">
                        <div className="space-y-2">
                            <label htmlFor="cip-tipo" className="text-sm font-medium">Tipo de CIP</label>
                            <select id="cip-tipo" value={cipTipo} onChange={(event) => setCipTipo(event.target.value)} className="h-9 w-full rounded-md border bg-background px-3 text-sm">
                                <option value="CIP Intermedio">CIP Intermedio</option>
                                <option value="CIP Final">CIP Final</option>
                            </select>
                        </div>
                        <DialogFooter>
                            <Button type="button" variant="outline" onClick={() => setCipModalOpen(false)} disabled={cipProcessing}>Cancelar</Button>
                            <Button type="submit" disabled={cipProcessing}>{cipProcessing ? 'Iniciando...' : 'Iniciar CIP'}</Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>
        </AppLayout>
    );
}
