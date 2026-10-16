import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head } from '@inertiajs/react';
import { FileSpreadsheet, Printer, Search } from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Informe de materia prima ingresada', href: '/informes/materia-prima' },
];

interface Opcion { id: number; nombre: string }
interface PageProps {
    items: Opcion[];
    proveedores: Opcion[];
    almacenes: Opcion[];
    estados: Opcion[];
}
interface Agregado {
    recepciones: number;
    total_kg: string | number;
    sin_kg: number;
}
interface Grupo extends Agregado {
    item_materia_prima?: { nombre: string } | null;
    proveedor_materia_prima?: { nombre: string } | null;
    estado?: { nombre: string } | null;
}
interface Lote { id: number; lote: string | null; fecha_vencimiento: string | null }
interface Fila {
    id: number;
    tiempo: string | null;
    cantidad_recepcionada_total_kg: string | null;
    certificado: boolean;
    item_materia_prima?: { nombre: string } | null;
    proveedor_materia_prima?: { nombre: string } | null;
    estado?: { nombre: string } | null;
    liberacion?: { nombre: string } | null;
    recepcion_lotes?: Lote[];
}
interface Datos {
    resumen: { general: Agregado; por_item: Grupo[]; por_proveedor: Grupo[]; por_estado: Grupo[] };
    detalle: { data: Fila[]; current_page: number; last_page: number; total: number };
}

const FILTROS_VACIOS = {
    fecha_desde: '',
    fecha_hasta: '',
    item_materia_prima_id: '',
    proveedor_materia_prima_id: '',
    almacen_materia_prima_id: '',
    estado_id: '',
};

const kg = (v: string | number | null | undefined) =>
    Number(v ?? 0).toLocaleString('es-BO', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

const claseSelect =
    'border-input bg-background h-9 w-full rounded-md border px-3 text-sm shadow-xs dark:bg-slate-950';

export default function InformeMateriaPrima({ items, proveedores, almacenes, estados }: PageProps) {
    const [filtros, setFiltros] = useState(FILTROS_VACIOS);
    const [datos, setDatos] = useState<Datos | null>(null);
    const [pagina, setPagina] = useState(1);
    const [cargando, setCargando] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const armarParams = useCallback(
        (extra: Record<string, string> = {}) => {
            const params = new URLSearchParams();
            Object.entries(filtros).forEach(([k, v]) => v && params.set(k, v));
            Object.entries(extra).forEach(([k, v]) => params.set(k, v));
            return params;
        },
        [filtros],
    );

    const cargar = useCallback(
        async (page = 1) => {
            setCargando(true);
            setError(null);
            try {
                const res = await fetch(
                    `/informes/materia-prima/datos?${armarParams({ page: String(page) })}`,
                    { headers: { Accept: 'application/json' }, credentials: 'same-origin' },
                );
                if (res.status === 422) throw new Error('Revisa los filtros: la fecha final debe ser igual o posterior a la inicial.');
                if (!res.ok) throw new Error('No se pudo generar el informe.');
                setDatos(await res.json());
                setPagina(page);
            } catch (e) {
                setError(e instanceof Error ? e.message : 'Error desconocido.');
            } finally {
                setCargando(false);
            }
        },
        [armarParams],
    );

    useEffect(() => {
        cargar(1);
        // Carga inicial únicamente; luego se usa el botón "Generar".
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const cambiar = (campo: keyof typeof FILTROS_VACIOS) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
        setFiltros((f) => ({ ...f, [campo]: e.target.value }));

    const selector = (campo: keyof typeof FILTROS_VACIOS, etiqueta: string, opciones: Opcion[]) => (
        <div className="space-y-1">
            <Label>{etiqueta}</Label>
            <select className={claseSelect} value={filtros[campo]} onChange={cambiar(campo)}>
                <option value="">Todos</option>
                {opciones.map((o) => (
                    <option key={o.id} value={o.id}>{o.nombre}</option>
                ))}
            </select>
        </div>
    );

    const tablaGrupo = (titulo: string, filas: Grupo[], nombre: (g: Grupo) => string | undefined) => (
        <div className="rounded border">
            <div className="border-b px-3 py-2 text-sm font-semibold">{titulo}</div>
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>Nombre</TableHead>
                        <TableHead className="text-right">Recepciones</TableHead>
                        <TableHead className="text-right">Total kg</TableHead>
                        <TableHead className="text-right">Sin kg</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {filas.length === 0 && (
                        <TableRow><TableCell colSpan={4} className="text-center text-muted-foreground">Sin datos</TableCell></TableRow>
                    )}
                    {filas.map((g, i) => (
                        <TableRow key={i}>
                            <TableCell>{nombre(g) ?? '—'}</TableCell>
                            <TableCell className="text-right">{g.recepciones}</TableCell>
                            <TableCell className="text-right">{kg(g.total_kg)}</TableCell>
                            <TableCell className="text-right">{g.sin_kg}</TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </div>
    );

    const general = datos?.resumen.general;

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Informe de materia prima ingresada" />
            <div className="space-y-4 px-2 py-2 sm:px-6 print:px-0">
                <div className="flex flex-wrap items-end gap-3 print:hidden">
                    <div className="space-y-1">
                        <Label>Desde</Label>
                        <Input type="date" value={filtros.fecha_desde} onChange={cambiar('fecha_desde')} />
                    </div>
                    <div className="space-y-1">
                        <Label>Hasta</Label>
                        <Input type="date" value={filtros.fecha_hasta} onChange={cambiar('fecha_hasta')} />
                    </div>
                    {selector('item_materia_prima_id', 'Materia prima', items)}
                    {selector('proveedor_materia_prima_id', 'Proveedor', proveedores)}
                    {selector('almacen_materia_prima_id', 'Almacén', almacenes)}
                    {selector('estado_id', 'Estado', estados)}
                    <Button onClick={() => cargar(1)} disabled={cargando}>
                        <Search className="mr-2 h-4 w-4" />{cargando ? 'Generando…' : 'Generar'}
                    </Button>
                    <Button variant="outline" onClick={() => { setFiltros(FILTROS_VACIOS); }}>
                        Limpiar
                    </Button>
                    <Button variant="outline" asChild>
                        <a href={`/informes/materia-prima/excel?${armarParams()}`}>
                            <FileSpreadsheet className="mr-2 h-4 w-4" />Excel
                        </a>
                    </Button>
                    <Button variant="outline" onClick={() => window.print()}>
                        <Printer className="mr-2 h-4 w-4" />Imprimir
                    </Button>
                </div>

                {error && <div className="rounded bg-red-100 p-3 text-sm text-red-800">{error}</div>}

                {general && (
                    <div className="grid gap-3 sm:grid-cols-3">
                        <div className="rounded border p-3"><div className="text-xs text-muted-foreground">Recepciones</div><div className="text-2xl font-semibold">{general.recepciones}</div></div>
                        <div className="rounded border p-3"><div className="text-xs text-muted-foreground">Total ingresado (kg)</div><div className="text-2xl font-semibold">{kg(general.total_kg)}</div></div>
                        <div className="rounded border p-3"><div className="text-xs text-muted-foreground">Recepciones sin kg registrados</div><div className="text-2xl font-semibold">{general.sin_kg ?? 0}</div></div>
                    </div>
                )}

                {datos && (
                    <>
                        <div className="grid gap-3 lg:grid-cols-3">
                            {tablaGrupo('Por materia prima', datos.resumen.por_item, (g) => g.item_materia_prima?.nombre)}
                            {tablaGrupo('Por proveedor', datos.resumen.por_proveedor, (g) => g.proveedor_materia_prima?.nombre)}
                            {tablaGrupo('Por estado', datos.resumen.por_estado, (g) => g.estado?.nombre)}
                        </div>

                        <div className="rounded border">
                            <div className="border-b px-3 py-2 text-sm font-semibold">
                                Detalle ({datos.detalle.total} recepciones)
                            </div>
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Fecha</TableHead>
                                        <TableHead>Materia prima</TableHead>
                                        <TableHead>Proveedor</TableHead>
                                        <TableHead>Lotes</TableHead>
                                        <TableHead className="text-right">Total kg</TableHead>
                                        <TableHead>Estado</TableHead>
                                        <TableHead>Liberación</TableHead>
                                        <TableHead>Certificado</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {datos.detalle.data.map((r) => (
                                        <TableRow key={r.id}>
                                            <TableCell>{r.tiempo ? new Date(r.tiempo).toLocaleString('es-BO') : '—'}</TableCell>
                                            <TableCell>{r.item_materia_prima?.nombre ?? '—'}</TableCell>
                                            <TableCell>{r.proveedor_materia_prima?.nombre ?? '—'}</TableCell>
                                            <TableCell>{(r.recepcion_lotes ?? []).map((l) => l.lote).filter(Boolean).join(', ') || '—'}</TableCell>
                                            <TableCell className="text-right">{r.cantidad_recepcionada_total_kg != null ? kg(r.cantidad_recepcionada_total_kg) : '—'}</TableCell>
                                            <TableCell>{r.estado?.nombre ?? '—'}</TableCell>
                                            <TableCell>{r.liberacion?.nombre ?? '—'}</TableCell>
                                            <TableCell>{r.certificado ? 'Sí' : 'No'}</TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                            <div className="flex items-center justify-between border-t px-3 py-2 text-sm print:hidden">
                                <span>Página {datos.detalle.current_page} de {datos.detalle.last_page}</span>
                                <div className="flex gap-2">
                                    <Button size="sm" variant="outline" disabled={pagina <= 1 || cargando} onClick={() => cargar(pagina - 1)}>Anterior</Button>
                                    <Button size="sm" variant="outline" disabled={pagina >= datos.detalle.last_page || cargando} onClick={() => cargar(pagina + 1)}>Siguiente</Button>
                                </div>
                            </div>
                        </div>
                    </>
                )}
            </div>
        </AppLayout>
    );
}
