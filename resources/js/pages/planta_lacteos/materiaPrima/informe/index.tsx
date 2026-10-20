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
import ReporteInformeMateriaPrima from '@/pdf/ReporteInformeMateriaPrima';
import { PDFViewer } from '@react-pdf/renderer';
import { FileText, FileSpreadsheet, Search, X } from 'lucide-react';
import { useCallback, useEffect, useMemo, useState } from 'react';

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

const POR_PAGINA = 10;

/** Pie de paginación: solo se dibuja si hay más de una página (más de 10 registros). */
function Paginador({ pagina, ultima, total, onCambiar, deshabilitado }: {
    pagina: number; ultima: number; total: number; onCambiar: (p: number) => void; deshabilitado?: boolean;
}) {
    if (total <= POR_PAGINA) return null;
    return (
        <div className="flex items-center justify-between border-t px-3 py-2 text-sm">
            <span>Página {pagina} de {ultima} · {total} registros</span>
            <div className="flex gap-2">
                <Button size="sm" variant="outline" disabled={pagina <= 1 || deshabilitado} onClick={() => onCambiar(pagina - 1)}>Anterior</Button>
                <Button size="sm" variant="outline" disabled={pagina >= ultima || deshabilitado} onClick={() => onCambiar(pagina + 1)}>Siguiente</Button>
            </div>
        </div>
    );
}

function TablaGrupo({ titulo, filas, nombre }: { titulo: string; filas: Grupo[]; nombre: (g: Grupo) => string | undefined }) {
    const [pagina, setPagina] = useState(1);
    const ultima = Math.max(1, Math.ceil(filas.length / POR_PAGINA));

    // Si cambian los datos (nuevo informe) o la página queda fuera de rango, vuelve a la primera.
    useEffect(() => { setPagina(1); }, [filas]);

    const visibles = useMemo(
        () => filas.slice((pagina - 1) * POR_PAGINA, pagina * POR_PAGINA),
        [filas, pagina],
    );

    return (
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
                    {visibles.length === 0 && (
                        <TableRow><TableCell colSpan={4} className="text-center text-muted-foreground">Sin datos</TableCell></TableRow>
                    )}
                    {visibles.map((g, i) => (
                        <TableRow key={i}>
                            <TableCell>{nombre(g) ?? '—'}</TableCell>
                            <TableCell className="text-right">{g.recepciones}</TableCell>
                            <TableCell className="text-right">{kg(g.total_kg)}</TableCell>
                            <TableCell className="text-right">{g.sin_kg}</TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
            <Paginador pagina={pagina} ultima={ultima} total={filas.length} onCambiar={setPagina} />
        </div>
    );
}

const claseSelect =
    'border-input bg-background h-9 w-full rounded-md border px-3 text-sm shadow-xs dark:bg-slate-950';

export default function InformeMateriaPrima({ items, proveedores, almacenes, estados }: PageProps) {
    const [filtros, setFiltros] = useState(FILTROS_VACIOS);
    const [datos, setDatos] = useState<Datos | null>(null);
    const [pagina, setPagina] = useState(1);
    const [cargando, setCargando] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [datosReporte, setDatosReporte] = useState<any>(null);
    const [mostrarReporte, setMostrarReporte] = useState(false);
    const [generandoReporte, setGenerandoReporte] = useState(false);

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

    const textoFiltros = () => {
        const nombre = (lista: Opcion[], id: string) => lista.find((o) => String(o.id) === id)?.nombre;
        return [
            filtros.fecha_desde && `Desde ${filtros.fecha_desde}`,
            filtros.fecha_hasta && `Hasta ${filtros.fecha_hasta}`,
            filtros.item_materia_prima_id && `Materia prima: ${nombre(items, filtros.item_materia_prima_id)}`,
            filtros.proveedor_materia_prima_id && `Proveedor: ${nombre(proveedores, filtros.proveedor_materia_prima_id)}`,
            filtros.almacen_materia_prima_id && `Almacén: ${nombre(almacenes, filtros.almacen_materia_prima_id)}`,
            filtros.estado_id && `Estado: ${nombre(estados, filtros.estado_id)}`,
        ].filter(Boolean).join(' · ');
    };

    const verReporte = async () => {
        setGenerandoReporte(true);
        setError(null);
        try {
            const res = await fetch(`/informes/materia-prima/reporte?${armarParams()}`, {
                headers: { Accept: 'application/json' },
                credentials: 'same-origin',
            });
            if (res.status === 422) throw new Error('Revisa los filtros: la fecha final debe ser igual o posterior a la inicial.');
            if (!res.ok) throw new Error('No se pudo generar el reporte.');
            setDatosReporte({ ...(await res.json()), filtros_texto: textoFiltros() });
            setMostrarReporte(true);
        } catch (e) {
            setError(e instanceof Error ? e.message : 'Error desconocido.');
        } finally {
            setGenerandoReporte(false);
        }
    };

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

    const general = datos?.resumen.general;

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Informe de materia prima ingresada" />
            <div className="space-y-4 px-2 py-2 sm:px-6">
                <div className="flex flex-wrap items-end gap-3">
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
                    <Button variant="outline" onClick={verReporte} disabled={generandoReporte}>
                        <FileText className="mr-2 h-4 w-4" />{generandoReporte ? 'Generando…' : 'Ver reporte'}
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
                            <TablaGrupo titulo="Por materia prima" filas={datos.resumen.por_item} nombre={(g) => g.item_materia_prima?.nombre} />
                            <TablaGrupo titulo="Por proveedor" filas={datos.resumen.por_proveedor} nombre={(g) => g.proveedor_materia_prima?.nombre} />
                            <TablaGrupo titulo="Por estado" filas={datos.resumen.por_estado} nombre={(g) => g.estado?.nombre} />
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
                            <Paginador
                                pagina={datos.detalle.current_page}
                                ultima={datos.detalle.last_page}
                                total={datos.detalle.total}
                                onCambiar={cargar}
                                deshabilitado={cargando}
                            />
                        </div>
                    </>
                )}
            </div>
            {mostrarReporte && datosReporte && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80">
                    <div className="relative h-[95vh] w-[95vw] rounded-lg bg-white">
                        <button className="absolute top-2 right-2 z-50 rounded-full bg-red-600 p-1 text-white" onClick={() => setMostrarReporte(false)}>
                            <X className="h-5 w-5" />
                        </button>
                        <PDFViewer width="100%" height="100%">
                            <ReporteInformeMateriaPrima datos={datosReporte} />
                        </PDFViewer>
                    </div>
                </div>
            )}
        </AppLayout>
    );
}
