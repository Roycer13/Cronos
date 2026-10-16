import AppLayout from '@/layouts/app-layout';
import { Head, router } from '@inertiajs/react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Toast } from '@/components/ui/toast';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Plus, Pencil, Trash2, X } from 'lucide-react';
import { route } from 'ziggy-js';
import { PDFViewer } from '@react-pdf/renderer';
import ReporteAditivosQuimicos from '@/pdf/ReporteAditivosQuimicos';
import { useAdvancedFilters } from '@/hooks/use-advanced-filters';
import TablePagination from '@/components/ui/table-pagination';

const formatDateTime = (value: string | null | undefined) => {
    if (!value) return '-';

    // Simplemente toma los primeros 16 caracteres (YYYY-MM-DD HH:MM)
    const str = String(value).trim();
    // Si contiene 'T', reemplazarlo con espacio
    const normalized = str.replace('T', ' ');
    // Tomar solo los primeros 16 caracteres
    return normalized.substring(0, 16);
};

const formatDecimal = (value: number | string | null | undefined) => {
    if (value === null || value === undefined || value === '') return '-';
    const n = Number(value);
    if (Number.isNaN(n)) return String(value);
    const s = n.toFixed(2).replace(/\.0+$|(?<=\.[0-9]*?)0+$/g, '');
    return s;
};

export default function Index({ aditivos, usuarios, filters: initialFilters = {}, flash }: any) {
    const [creating, setCreating] = useState(false);
    const [editingId, setEditingId] = useState<number | null>(null);
    const [editForm, setEditForm] = useState<any>(null);
    const [submitting, setSubmitting] = useState(false);
    // filtros (server-side) y PDF independientes
    const [fechaDesde, setFechaDesde] = useState('');
    const [fechaHasta, setFechaHasta] = useState('');
    const [datosPdf, setDatosPdf] = useState<any[]>([]);
    const [usuariosPdf, setUsuariosPdf] = useState<any[]>([]);
    const [mostrarPdf, setMostrarPdf] = useState(false);
    const [generandoPdf, setGenerandoPdf] = useState(false);

    const getDefaultPayload = () => {
        const now = new Date();
        const offset = now.getTimezoneOffset();
        const localDate = new Date(now.getTime() - offset * 60 * 1000);

        return {
            tiempo: localDate.toISOString().slice(0, 16),
            wet_boil_101: '11.4',
            wet_boil_201: '5',
            wet_boil_402: '8',
            wet_boil_801: '1',
            soda_caustica: '',
        };
    };

    const createDefault = () => {
        setCreating(true);
        router.post(route('aditivos-quimicos.store'), getDefaultPayload(), {
            onFinish: () => setCreating(false),
        });
    };
    // useAdvancedFilters para filtrar/paginar en servidor (igual que HTST)
    const { filters, updateFilter, resetFilters } = useAdvancedFilters({
        routeName: 'aditivos-quimicos.index',
        initialFilters: {
            search: initialFilters.search || '',
            per_page: initialFilters.per_page?.toString() || '10',
        },
        debounceFields: ['search'],
        debounceDelay: 600,
    });

    const handleMostrarPdf = async () => {
        if (!fechaDesde || !fechaHasta) {
            alert('Por favor selecciona Fecha Desde y Fecha Hasta');
            return;
        }

        setGenerandoPdf(true);
        try {
            const params = new URLSearchParams();
            params.append('fecha_desde', fechaDesde);
            params.append('fecha_hasta', fechaHasta);

            const response = await fetch(`${route('aditivos-quimicos.pdf')}?${params.toString()}`);
            if (!response.ok) {
                const err = await response.text();
                throw new Error(err);
            }
            const json = await response.json();
            const datos = json.aditivos || [];
            if (datos.length === 0) {
                alert('No hay registros para el rango seleccionado');
                return;
            }
            setDatosPdf(datos);
            setUsuariosPdf(json.usuarios_involucrados || []);
            setMostrarPdf(true);
        } catch (e: any) {
            console.error(e);
            alert('Error al generar el reporte');
        } finally {
            setGenerandoPdf(false);
        }
    };

    const items = (aditivos && Array.isArray(aditivos.data) ? aditivos.data : []);
    const pagination = {
        current_page: aditivos?.current_page ?? 1,
        last_page: aditivos?.last_page ?? 1,
        per_page: aditivos?.per_page ?? 10,
        total: aditivos?.total ?? 0,
    };

    const openEditModal = (item: any) => {
        setEditingId(item.id);
        setEditForm({
            tiempo: item.tiempo ? item.tiempo.slice(0, 16) : '',
            wet_boil_101: item.wet_boil_101 ?? '',
            wet_boil_201: item.wet_boil_201 ?? '',
            wet_boil_402: item.wet_boil_402 ?? '',
            wet_boil_801: item.wet_boil_801 ?? '',
            soda_caustica: item.soda_caustica ?? '',
        });
    };

    const closeEditModal = () => {
        setEditingId(null);
        setEditForm(null);
        setSubmitting(false);
    };

    const submitEdit = (e: React.FormEvent) => {
        e.preventDefault();
        setSubmitting(true);
        router.put(route('aditivos-quimicos.update', editingId), editForm, {
            onFinish: () => {
                setSubmitting(false);
                closeEditModal();
            },
        });
    };

    return (
        <AppLayout>
            <Head title="Aditivos Químicos" />
            <div className="space-y-4 p-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-semibold">Uso de Aditivos Químicos</h1>
                        <p className="text-sm text-muted-foreground">Control simple de registros para servicios</p>
                    </div>
                    {/* <Button onClick={createDefault} disabled={creating}>
                        <Plus className="mr-2 h-4 w-4" /> Nuevo registro
                    </Button> */}
                </div>

                <Toast />

                {/* Filtros y acciones (tabla: server-side, reporte: independiente) */}
                <div className="mb-4 flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
                    <div className="flex flex-wrap gap-2 items-center">
                        <div className="min-w-[220px]">
                            <Label>Buscar</Label>
                            <Input value={filters.search ?? ''} onChange={(e) => updateFilter('search', e.target.value)} placeholder="Usuario, tiempo, valores..." />
                        </div>

                        <div>
                            <Label>Por página</Label>
                            <select className="form-select rounded border p-2" value={filters.per_page ?? '10'} onChange={(e) => updateFilter('per_page', e.target.value)}>
                                <option value={5}>5</option>
                                <option value={10}>10</option>
                                <option value={25}>25</option>
                                <option value={50}>50</option>
                            </select>
                        </div>
                    </div>
                    <div className="flex gap-2">
                        {/* <Button variant="outline" size="sm" onClick={handleMostrarPdf} disabled={generandoPdf} className="flex items-center gap-2">
                            <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor"><path d="M6 2h9v6H6z"/></svg>
                            {generandoPdf ? 'Generando...' : 'Generar PDF'}
                        </Button> */}
                        <Button onClick={createDefault} disabled={creating}>
                            <Plus className="mr-2 h-4 w-4" /> Nuevo registro
                        </Button>
                    </div>
                </div>

                <div className="rounded-lg border bg-white p-4 shadow-sm">
                    <div className="overflow-x-auto">
                        <table className="min-w-full text-sm">
                            <thead>
                                <tr className="border-b text-left">
                                    <th className="px-3 py-2">Tiempo</th>
                                    <th className="px-3 py-2">Wet Boil 101</th>
                                    <th className="px-3 py-2">Wet Boil 201</th>
                                    <th className="px-3 py-2">Wet Boil 402</th>
                                    <th className="px-3 py-2">Wet Boil 801</th>
                                    <th className="px-3 py-2">Soda Cáustica</th>
                                    <th className="px-3 py-2">Registrado por</th>
                                    <th className="px-3 py-2">Acciones</th>
                                </tr>
                            </thead>
                            <tbody>
                                {items.length === 0 ? (
                                    <tr>
                                        <td colSpan={8} className="py-8 text-center">No hay registros</td>
                                    </tr>
                                ) : (
                                    items.map((item: any) => (
                                        <tr key={item.id} className="border-b">
                                            <td className="px-3 py-2">{item.tiempo}</td>
                                            <td className="px-3 py-2">{formatDecimal(item.wet_boil_101)}</td>
                                            <td className="px-3 py-2">{formatDecimal(item.wet_boil_201)}</td>
                                            <td className="px-3 py-2">{formatDecimal(item.wet_boil_402)}</td>
                                            <td className="px-3 py-2">{formatDecimal(item.wet_boil_801)}</td>
                                            <td className="px-3 py-2">{formatDecimal(item.soda_caustica)}</td>
                                            <td className="px-3 py-2">{item.usuario ? `${item.usuario.name} ${item.usuario.apellido ?? ''}`.trim() : '-'}</td>
                                            <td className="px-3 py-2">
                                                <div className="flex gap-2">
                                                    <Button variant="outline" size="sm" onClick={() => openEditModal(item)}>
                                                        <Pencil className="mr-1 h-4 w-4" />
                                                    </Button>
                                                    <Button variant="destructive" size="sm" onClick={() => router.delete(route('aditivos-quimicos.destroy', item.id))}>
                                                        <Trash2 className="mr-1 h-4 w-4" />
                                                    </Button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                    {/* Paginación */}
                    {items.length > 0 && (
                        <div className="border-t px-4 py-3 flex items-center justify-between">
                            <div className="text-sm text-muted-foreground">Mostrando {Math.min((pagination.current_page-1)*pagination.per_page+1, pagination.total)}-{Math.min(pagination.current_page*pagination.per_page, pagination.total)} de {pagination.total}</div>
                            <div>
                                <TablePagination pagination={pagination} onPageChange={(p) => updateFilter('page', p)} />
                            </div>
                        </div>
                    )}
                </div>
                {/* Bloque de reporte en la parte inferior (independiente) */}
                <div className="mt-4 rounded-lg border bg-white p-4 shadow-sm">
                    <h3 className="text-lg font-medium mb-3">Generar reporte (Aditivos Químicos)</h3>
                    <div className="flex flex-wrap gap-3 items-end">
                        <div className="min-w-[160px]">
                            <Label>Fecha Desde</Label>
                            <Input type="date" value={fechaDesde} onChange={(e) => setFechaDesde(e.target.value)} />
                        </div>
                        <div className="min-w-[160px]">
                            <Label>Fecha Hasta</Label>
                            <Input type="date" value={fechaHasta} onChange={(e) => setFechaHasta(e.target.value)} />
                        </div>
                        <div className="flex gap-2">
                            <Button variant="outline" size="sm" onClick={handleMostrarPdf} disabled={generandoPdf}>
                                {generandoPdf ? 'Generando...' : 'Generar PDF'}
                            </Button>
                            <Button variant="ghost" size="sm" onClick={() => { setFechaDesde(''); setFechaHasta(''); }}>
                                Limpiar
                            </Button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Modal para mostrar PDF */}
            {mostrarPdf && datosPdf.length > 0 && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80">
                    <div className="relative h-[95vh] w-[95vw] overflow-hidden rounded-lg bg-white shadow-2xl">
                        <button
                            className="absolute top-4 right-4 z-50 flex h-8 w-8 items-center justify-center rounded-full bg-red-600 text-white hover:bg-red-700"
                            onClick={() => setMostrarPdf(false)}
                        >
                            <span className="sr-only">Cerrar</span>
                            ×
                        </button>
                        <div className="absolute top-0 left-0 right-0 z-40 flex items-center justify-between bg-gray-100 px-4 py-3">
                            <div>
                                <h3 className="text-lg font-semibold text-gray-800">Reporte Aditivos Químicos</h3>
                                <p className="text-sm text-gray-600">{fechaDesde} → {fechaHasta}</p>
                            </div>
                        </div>
                        <div className="h-full pt-14">
                            <PDFViewer style={{ width: '100%', height: '100%', border: 'none' }}>
                                <ReporteAditivosQuimicos
                                    datos={datosPdf}
                                    usuariosInvolucrados={usuariosPdf}
                                    filtros={{ fecha_desde: fechaDesde, fecha_hasta: fechaHasta }}
                                />
                            </PDFViewer>
                        </div>
                    </div>
                </div>
            )}

            {/* Modal de edición */}
            {editingId && editForm && (
                <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-lg shadow-lg max-w-md w-full max-h-[90vh] overflow-y-auto">
                        <div className="flex items-center justify-between p-4 border-b">
                            <h2 className="text-lg font-semibold">Editar registro</h2>
                            <button onClick={closeEditModal} className="text-gray-500 hover:text-gray-700">
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <form onSubmit={submitEdit} className="p-4 space-y-4">
                            <div>
                                <Label>Tiempo</Label>
                                <Input
                                    type="datetime-local"
                                    value={editForm.tiempo}
                                    onChange={(e) => setEditForm({ ...editForm, tiempo: e.target.value })}
                                    required
                                />
                            </div>
                            <div className="grid gap-4 grid-cols-2">
                                <div>
                                    <Label>Wet Boil 101</Label>
                                    <Input
                                        type="number"
                                        step="0.00001"
                                        value={editForm.wet_boil_101}
                                        onChange={(e) => setEditForm({ ...editForm, wet_boil_101: e.target.value })}
                                    />
                                </div>
                                <div>
                                    <Label>Wet Boil 201</Label>
                                    <Input
                                        type="number"
                                        step="0.00001"
                                        value={editForm.wet_boil_201}
                                        onChange={(e) => setEditForm({ ...editForm, wet_boil_201: e.target.value })}
                                    />
                                </div>
                                <div>
                                    <Label>Wet Boil 402</Label>
                                    <Input
                                        type="number"
                                        step="0.00001"
                                        value={editForm.wet_boil_402}
                                        onChange={(e) => setEditForm({ ...editForm, wet_boil_402: e.target.value })}
                                    />
                                </div>
                                <div>
                                    <Label>Wet Boil 801</Label>
                                    <Input
                                        type="number"
                                        step="0.00001"
                                        value={editForm.wet_boil_801}
                                        onChange={(e) => setEditForm({ ...editForm, wet_boil_801: e.target.value })}
                                    />
                                </div>
                            </div>
                            <div>
                                <Label>Soda Cáustica</Label>
                                <Input
                                    type="number"
                                    step="0.00001"
                                    value={editForm.soda_caustica}
                                    onChange={(e) => setEditForm({ ...editForm, soda_caustica: e.target.value })}
                                />
                            </div>

                            <div className="flex gap-2 justify-end pt-4 border-t">
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={closeEditModal}
                                    disabled={submitting}
                                >
                                    Cancelar
                                </Button>
                                <Button
                                    type="submit"
                                    disabled={submitting}
                                >
                                    {submitting ? 'Guardando...' : 'Guardar'}
                                </Button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </AppLayout>
    );
}
