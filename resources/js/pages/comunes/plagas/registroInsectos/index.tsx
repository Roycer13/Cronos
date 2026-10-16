// ══════════════════════════════════════════════════════════
// registroInsectos/index.tsx
// Ruta: resources/js/pages/comunes/plagas/registroInsectos/index.tsx
// ══════════════════════════════════════════════════════════

import { Button } from '@/components/ui/button';
import FilterSelect from '@/components/ui/filter-select';
import FormSelect from '@/components/ui/form-select';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Toast } from '@/components/ui/toast';
import { useAdvancedFilters } from '@/hooks/use-advanced-filters';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, router, usePage } from '@inertiajs/react';
import { Plus, Filter, X, MoreHorizontal, Edit, XCircle, CheckCircle, Bug, Printer } from 'lucide-react';
import { route } from 'ziggy-js';
import { useState, memo } from 'react';
import TablePagination from '@/components/ui/table-pagination';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import ReporteRegistroInsectos from '@/pdf/ReporteRegistroInsectos';
import { PDFViewer } from '@react-pdf/renderer';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Módulos Comunes', href: '/modulos-comunes' },
    { title: 'Control de Plagas', href: '/plagas' },
    { title: 'Registro de Insectos', href: '/plagas/registro-insectos' },
];

interface RegistroInsecto {
    id: number;
    fecha: string;
    mosca: number | null;
    mosquito: number | null;
    abeja: number | null;
    mariposa: number | null;
    otros: number | null;
    cambio_adhesivo: boolean | null;
    estado_equipo: boolean | null;
    observacion: string | null;
    correcion: string | null;
    insectocaptor: { id: number; codigo_interno: string | null; tipo: string | null; sector: { nombre: string } | null } | null;
    inspector: { id: number; name: string; apellido: string };
}
interface Equipo { id: number; codigo_interno: string | null; tipo: string | null; sector: { nombre: string } | null }
interface PageProps {
    registros: { data: RegistroInsecto[]; links: any[]; current_page: number; last_page: number; per_page: number; total: number };
    equipos: Equipo[];
    filters: Record<string, string | undefined>;
    flash: { success?: string; error?: string };
}

function fmt(f: string) {
    return new Date(f).toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' });
}
function totalInsectos(r: RegistroInsecto) {
    return (r.mosca || 0) + (r.mosquito || 0) + (r.abeja || 0) + (r.mariposa || 0) + (r.otros || 0);
}

const INSECT_FIELDS = [
    { key: 'mosca', label: 'Moscas', emoji: '🪰' },
    { key: 'mosquito', label: 'Mosquitos', emoji: '🦟' },
    { key: 'abeja', label: 'Abejas', emoji: '🐝' },
    { key: 'mariposa', label: 'Mariposas', emoji: '🦋' },
    { key: 'otros', label: 'Otros', emoji: '🐛' },
] as const;

type FormData = {
    PLAG_insectocaptor_id: string;
    mosca: number; mosquito: number; abeja: number; mariposa: number; otros: number;
    cambio_adhesivo: boolean; estado_equipo: boolean;
    observacion: string; correcion: string;
};

export default function RegistroInsectosIndex() {
    const { props } = usePage();
    const { registros, equipos = [], filters: initF = {} } = props as unknown as PageProps;
    const [showFilters, setShowFilters] = useState(false);
    const [createOpen, setCreateOpen] = useState(false);
    const [editOpen, setEditOpen] = useState(false);
    const [deleteOpen, setDeleteOpen] = useState(false);
    const [selected, setSelected] = useState<RegistroInsecto | null>(null);

    // Estados para el PDF
    const [fechaDesde, setFechaDesde] = useState('');
    const [fechaHasta, setFechaHasta] = useState('');
    const [datosPdf, setDatosPdf] = useState<any[]>([]);
    const [usuariosPdf, setUsuariosPdf] = useState<any[]>([]);
    const [filtrosPdf, setFiltrosPdf] = useState<any>({});
    const [mostrarPdf, setMostrarPdf] = useState(false);
    const [generandoPdf, setGenerandoPdf] = useState(false);

    const urlPdf = route('plagas.registro-insectos.pdf');

    const { filters, updateFilter, resetFilters } = useAdvancedFilters({
        routeName: 'plagas.registro-insectos.index',
        initialFilters: { filtro_equipo: initF.filtro_equipo, filtro_fecha_desde: initF.filtro_fecha_desde, filtro_fecha_hasta: initF.filtro_fecha_hasta, filtro_estado_equipo: initF.filtro_estado_equipo, per_page: '10' },
        debounceFields: [], debounceDelay: 400,
    });
    const hasActiveFilters = Object.entries(filters).some(([, v]) => v && v !== '' && v !== '10');

    const defaultForm = (): FormData => ({ PLAG_insectocaptor_id: '', mosca: 0, mosquito: 0, abeja: 0, mariposa: 0, otros: 0, cambio_adhesivo: false, estado_equipo: true, observacion: '', correcion: '' });

    const [processing, setProcessing] = useState(false);
    const [errors, setErrors] = useState<Record<string, string>>({});

    const getInitialFormData = (): FormData => defaultForm();

    const conFalla = registros.data.filter(r => !r.estado_equipo).length;

    const handleCreate = () => { setCreateOpen(true); };
    const handleEdit = (r: RegistroInsecto) => {
        setSelected(r);
        setEditOpen(true);
    };
    const handleDelete = (r: RegistroInsecto) => { setSelected(r); setDeleteOpen(true); };
    const confirmDelete = () => { if (!selected) return; router.delete(route('plagas.registro-insectos.destroy', selected.id), { preserveScroll: true, onSuccess: () => { setDeleteOpen(false); setSelected(null); } }); };

    const submitCreate = (formData: FormData) => {
        setProcessing(true);
        router.post(route('plagas.registro-insectos.store'), formData, {
            onSuccess: () => {
                setProcessing(false);
                setCreateOpen(false);
                setErrors({});
            },
            onError: (err) => {
                setProcessing(false);
                setErrors(err);
            }
        });
    };

    const submitEdit = (formData: FormData) => {
        if (!selected) return;
        setProcessing(true);
        router.put(route('plagas.registro-insectos.update', selected.id), formData, {
            onSuccess: () => {
                setProcessing(false);
                setEditOpen(false);
                setSelected(null);
                setErrors({});
            },
            onError: (err) => {
                setProcessing(false);
                setErrors(err);
            }
        });
    };

    const handleMostrarPdf = async () => {
        if (!fechaDesde || !fechaHasta) {
            alert('Por favor selecciona ambas fechas');
            return;
        }
        setGenerandoPdf(true);
        try {
            const params = new URLSearchParams();
            params.append('fecha_desde', fechaDesde);
            params.append('fecha_hasta', fechaHasta);
            if (filters.filtro_equipo) params.append('filtro_equipo', filters.filtro_equipo);

            const response = await fetch(`${urlPdf}?${params.toString()}`, {
                headers: {
                    'Accept': 'application/json',
                    'X-Requested-With': 'XMLHttpRequest',
                },
            });

            // Capturar el texto de error si la respuesta no es OK
            if (!response.ok) {
                const errorText = await response.text();
                console.error('Error response:', errorText);
                throw new Error(`Error ${response.status}: ${errorText}`);
            }

            const data = await response.json();
            if (data.error) throw new Error(data.error);
            if (data.registros && data.registros.length === 0) {
                alert('No hay registros para el rango de fechas seleccionado');
                return;
            }
            setDatosPdf(data.registros || []);
            setUsuariosPdf(data.usuarios_involucrados || []);
            setFiltrosPdf(data.filtros || {});
            setMostrarPdf(true);
        } catch (error: any) {
            console.error('Error al generar PDF:', error);
            alert(`Error al generar el reporte: ${error.message}`);
        } finally {
            setGenerandoPdf(false);
        }
    };

    interface FormularioProps {
        initialData: FormData;
        onSubmit: (data: FormData) => void;
        processing: boolean;
        errors: Record<string, string>;
        onCancel: () => void;
    }

    const Formulario = memo(({ initialData, onSubmit, processing, errors, onCancel }: FormularioProps) => {
        const [localData, setLocalData] = useState<FormData>(initialData);
        const total = (localData.mosca || 0) + (localData.mosquito || 0) + (localData.abeja || 0) + (localData.mariposa || 0) + (localData.otros || 0);

        const handleChange = (key: keyof FormData, value: any) => {
            setLocalData(prev => ({ ...prev, [key]: value }));
        };

        const handleSubmit = (e: React.FormEvent) => {
            e.preventDefault();
            onSubmit(localData);
        };

        return (
            <form onSubmit={handleSubmit} className="space-y-5">
                <FormSelect
                    label="Equipo *"
                    value={localData.PLAG_insectocaptor_id}
                    onChange={(v) => handleChange('PLAG_insectocaptor_id', v)}
                    placeholder="Seleccionar insectocaptor/insectocutor"
                    options={equipos.map(e => ({ value: e.id.toString(), label: `${e.codigo_interno || 'S/C'} — ${e.tipo} (${e.sector?.nombre || 'Sin sector'})` }))}
                    error={errors.PLAG_insectocaptor_id}
                />

                {/* Conteo de insectos */}
                <div className="space-y-3">
                    <Label className="font-medium">Conteo de insectos capturados</Label>
                    <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                        {INSECT_FIELDS.map(({ key, label, emoji }) => (
                            <div key={key} className="border rounded-lg p-3 text-center space-y-2">
                                <div className="text-2xl">{emoji}</div>
                                <Label className="text-xs">{label}</Label>
                                <Input
                                    type="number" min={0}
                                    value={(localData[key as keyof FormData] as number) || 0}
                                    onChange={(e) => handleChange(key as keyof FormData, parseInt(e.target.value) || 0)}
                                    className="text-center font-bold text-lg h-10"
                                />
                            </div>
                        ))}
                    </div>
                    <div className="bg-muted/30 px-4 py-2 rounded-lg flex justify-between items-center text-sm">
                        <span className="text-muted-foreground">Total capturado:</span>
                        <span className="font-bold text-lg">{total} insectos</span>
                    </div>
                </div>

                {/* Estado del equipo y adhesivo */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="border rounded-lg p-4 flex items-center justify-between">
                        <div><Label className="font-medium">Equipo en buen estado</Label><p className="text-sm text-muted-foreground mt-1">El equipo funciona correctamente</p></div>
                        <Checkbox checked={localData.estado_equipo} onCheckedChange={(v) => handleChange('estado_equipo', v as boolean)} className="h-5 w-5" />
                    </div>
                    <div className="border rounded-lg p-4 flex items-center justify-between">
                        <div><Label className="font-medium">Cambio de adhesivo</Label><p className="text-sm text-muted-foreground mt-1">Se realizó cambio de lámina adhesiva</p></div>
                        <Checkbox checked={localData.cambio_adhesivo} onCheckedChange={(v) => handleChange('cambio_adhesivo', v as boolean)} className="h-5 w-5" />
                    </div>
                </div>

                {/* Observaciones si hay falla */}
                {(!localData.estado_equipo || total > 0) && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2"><Label>Observación</Label><Textarea value={localData.observacion} onChange={(e) => handleChange('observacion', e.target.value)} placeholder="Detalle la situación observada..." rows={3} /></div>
                        <div className="space-y-2"><Label>Corrección</Label><Textarea value={localData.correcion} onChange={(e) => handleChange('correcion', e.target.value)} placeholder="Acción correctiva tomada..." rows={3} /></div>
                    </div>
                )}

                <div className="bg-muted/30 p-3 rounded-lg text-sm text-muted-foreground">
                    Inspector y fecha/hora: <strong>se registran automáticamente</strong>
                </div>

                <DialogFooter>
                    <Button type="button" variant="outline" onClick={onCancel} disabled={processing}>Cancelar</Button>
                    <Button type="submit" disabled={processing || !localData.PLAG_insectocaptor_id}>{processing ? 'Guardando...' : 'Guardar Registro'}</Button>
                </DialogFooter>
            </form>
        );
    });

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Registro de Insectos" />
            <div className="px-2 sm:px-6 py-4 space-y-4">
                <Toast />
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div><h1 className="text-2xl font-bold">Registro de Insectos</h1><p className="text-muted-foreground mt-1">Conteo de insectos capturados en insectocaptores e insectocutores</p></div>
                    <Button onClick={handleCreate} className="flex items-center gap-2"><Plus className="h-4 w-4" />Nuevo Conteo</Button>
                </div>

                <div className="grid grid-cols-3 gap-4">
                    {[{ label: 'Total registros', value: registros.total, color: 'text-foreground' }, { label: 'Equipos con falla', value: conFalla, color: 'text-red-600' }, { label: 'Total insectos (página)', value: registros.data.reduce((acc, r) => acc + totalInsectos(r), 0), color: 'text-amber-600' }]
                        .map(s => <Card key={s.label} className="p-4 text-center"><p className="text-sm text-muted-foreground">{s.label}</p><p className={`text-2xl font-bold mt-1 ${s.color}`}>{s.value}</p></Card>)}
                </div>

                {/* Filtros */}
                <Card>
                    <div className="p-4 border-b flex items-center justify-between">
                        <h3 className="font-semibold">Filtros</h3>
                        <div className="flex gap-2">
                            {hasActiveFilters && <Button variant="ghost" size="sm" onClick={resetFilters} className="h-8"><X className="h-4 w-4 mr-1" />Limpiar</Button>}
                            <Button variant="ghost" size="sm" onClick={() => setShowFilters(!showFilters)} className="h-8"><Filter className="h-4 w-4 mr-2" />{showFilters ? 'Ocultar' : 'Mostrar'}</Button>
                        </div>
                    </div>
                    {showFilters && (
                        <div className="p-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                            <div className="space-y-2"><Label>Equipo</Label><FilterSelect value={filters.filtro_equipo} onChange={(v) => updateFilter('filtro_equipo', v)} placeholder="Todos" options={equipos.map(e => ({ value: e.id.toString(), label: `${e.codigo_interno || 'S/C'} (${e.sector?.nombre || ''})` }))} /></div>
                            <div className="space-y-2"><Label>Estado equipo</Label><FilterSelect value={filters.filtro_estado_equipo} onChange={(v) => updateFilter('filtro_estado_equipo', v)} placeholder="Todos" options={[{ value: '1', label: 'En buen estado' }, { value: '0', label: 'Con falla' }]} /></div>
                            <div className="space-y-2"><Label>Fecha Desde</Label><Input type="date" value={filters.filtro_fecha_desde || ''} onChange={(e) => updateFilter('filtro_fecha_desde', e.target.value)} /></div>
                            <div className="space-y-2"><Label>Fecha Hasta</Label><Input type="date" value={filters.filtro_fecha_hasta || ''} onChange={(e) => updateFilter('filtro_fecha_hasta', e.target.value)} /></div>
                            <div className="space-y-2"><Label>Por página</Label><FilterSelect value={filters.per_page} onChange={(v) => updateFilter('per_page', v)} placeholder="10" includeAllOption={false} options={['10', '25', '50'].map(v => ({ value: v, label: `${v} por página` }))} /></div>
                        </div>
                    )}
                </Card>

                {/* Generar PDF */}
                <Card className="p-4">
                    <h3 className="font-semibold mb-3">Generar Reporte PDF de Insectos</h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                        <div>
                            <Label>Fecha Desde</Label>
                            <Input type="date" value={fechaDesde} onChange={(e) => setFechaDesde(e.target.value)} />
                        </div>
                        <div>
                            <Label>Fecha Hasta</Label>
                            <Input type="date" value={fechaHasta} onChange={(e) => setFechaHasta(e.target.value)} />
                        </div>
                        <div className="flex items-end">
                            <Button onClick={handleMostrarPdf} disabled={generandoPdf} className="w-full">
                                <Printer className="h-4 w-4 mr-2" />
                                {generandoPdf ? 'Generando...' : 'Ver Reporte'}
                            </Button>
                        </div>
                    </div>
                </Card>

                {/* Tabla de registros */}
                <Card>
                    <div className="overflow-x-auto">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Fecha</TableHead>
                                    <TableHead>Equipo</TableHead>
                                    <TableHead className="text-center">🪰</TableHead>
                                    <TableHead className="text-center">🦟</TableHead>
                                    <TableHead className="text-center">🐝</TableHead>
                                    <TableHead className="text-center">🦋</TableHead>
                                    <TableHead className="text-center">🐛 Otros</TableHead>
                                    <TableHead className="text-center">Total</TableHead>
                                    <TableHead className="text-center">Adhesivo</TableHead>
                                    <TableHead className="text-center">Equipo</TableHead>
                                    <TableHead>Inspector</TableHead>
                                    <TableHead className="w-[80px]">Acciones</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {registros.data.length === 0 ? (
                                    <TableRow><TableCell colSpan={12} className="text-center py-12 text-muted-foreground"><Bug className="h-10 w-10 mx-auto opacity-30 mb-2" /><p>No hay registros de conteo</p></TableCell></TableRow>
                                ) : registros.data.map((r) => (
                                    <TableRow key={r.id} className="hover:bg-muted/50">
                                        <TableCell className="text-sm whitespace-nowrap">{fmt(r.fecha)}</TableCell>
                                        <TableCell>
                                            <div className="font-mono text-sm">{r.insectocaptor?.codigo_interno || '—'}</div>
                                            <div className="text-xs text-muted-foreground">{r.insectocaptor?.sector?.nombre}</div>
                                        </TableCell>
                                        {['mosca', 'mosquito', 'abeja', 'mariposa', 'otros'].map(k => (
                                            <TableCell key={k} className="text-center font-medium">{(r as any)[k] || 0}</TableCell>
                                        ))}
                                        <TableCell className="text-center"><span className="font-bold text-sm">{totalInsectos(r)}</span></TableCell>
                                        <TableCell className="text-center">{r.cambio_adhesivo ? <CheckCircle className="h-4 w-4 text-green-500 mx-auto" /> : <span className="text-muted-foreground text-xs">No</span>}</TableCell>
                                        <TableCell className="text-center">{r.estado_equipo ? <CheckCircle className="h-4 w-4 text-green-500 mx-auto" /> : <Badge className="bg-red-100 text-red-700 text-xs">Falla</Badge>}</TableCell>
                                        <TableCell className="text-sm">{r.inspector ? `${r.inspector.name} ${r.inspector.apellido}` : 'Sin inspector'}</TableCell>
                                        <TableCell>
                                            <DropdownMenu><DropdownMenuTrigger asChild><Button variant="ghost" size="sm" className="h-8 w-8 p-0"><MoreHorizontal className="h-4 w-4" /></Button></DropdownMenuTrigger>
                                                <DropdownMenuContent align="end"><DropdownMenuItem onClick={() => handleEdit(r)}><Edit className="mr-2 h-4 w-4" />Editar</DropdownMenuItem><DropdownMenuItem onClick={() => handleDelete(r)} className="text-destructive focus:text-destructive"><XCircle className="mr-2 h-4 w-4" />Eliminar</DropdownMenuItem></DropdownMenuContent>
                                            </DropdownMenu>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </div>
                    {registros.data.length > 0 && <div className="border-t px-4 py-3"><TablePagination pagination={registros} onPageChange={(page) => router.get(route('plagas.registro-insectos.index'), { ...filters, page }, { preserveState: true, replace: true })} /></div>}
                </Card>
            </div>

            {/* Modal para mostrar PDF */}
            {mostrarPdf && datosPdf.length > 0 && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80">
                    <div className="relative h-[95vh] w-[95vw] overflow-hidden rounded-lg bg-white shadow-2xl">
                        <button
                            className="absolute top-4 right-4 z-50 flex h-8 w-8 items-center justify-center rounded-full bg-red-600 text-white hover:bg-red-700"
                            onClick={() => setMostrarPdf(false)}
                        >
                            <X className="h-5 w-5" />
                        </button>
                        <div className="absolute top-0 right-0 left-0 z-40 flex items-center justify-between bg-gray-100 px-4 py-3">
                            <div>
                                <h3 className="text-lg font-semibold text-gray-800">Reporte de Registro de Insectos</h3>
                                <p className="text-sm text-gray-600">{fechaDesde} al {fechaHasta} - {datosPdf.length} registros</p>
                            </div>
                        </div>
                        <div className="h-full pt-14">
                            <PDFViewer style={{ width: '100%', height: '100%', border: 'none' }}>
                                <ReporteRegistroInsectos
                                    datos={datosPdf}
                                    usuariosInvolucrados={usuariosPdf}
                                    filtros={filtrosPdf}
                                />
                            </PDFViewer>
                        </div>
                    </div>
                </div>
            )}

            {/* Diálogos de creación, edición y eliminación */}
            <Dialog open={createOpen} onOpenChange={setCreateOpen}>
                <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto"><DialogHeader><DialogTitle className="flex items-center gap-2"><Bug className="h-5 w-5 text-amber-600" />Nuevo Conteo de Insectos</DialogTitle><DialogDescription>Registre el conteo de insectos capturados en el equipo seleccionado.</DialogDescription></DialogHeader>
                    <Formulario initialData={getInitialFormData()} onSubmit={submitCreate} processing={processing} errors={errors} onCancel={() => setCreateOpen(false)} />
                </DialogContent>
            </Dialog>
            <Dialog open={editOpen} onOpenChange={setEditOpen}>
                <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto"><DialogHeader><DialogTitle className="flex items-center gap-2"><Edit className="h-5 w-5 text-blue-600" />Editar Conteo</DialogTitle></DialogHeader>
                    {selected && <Formulario initialData={{ PLAG_insectocaptor_id: selected.insectocaptor?.id.toString() || '', mosca: selected.mosca || 0, mosquito: selected.mosquito || 0, abeja: selected.abeja || 0, mariposa: selected.mariposa || 0, otros: selected.otros || 0, cambio_adhesivo: selected.cambio_adhesivo ?? false, estado_equipo: selected.estado_equipo ?? true, observacion: selected.observacion || '', correcion: selected.correcion || '' }} onSubmit={submitEdit} processing={processing} errors={errors} onCancel={() => setEditOpen(false)} />}
                </DialogContent>
            </Dialog>
            <Dialog open={deleteOpen} onOpenChange={setDeleteOpen}>
                <DialogContent className="max-w-md"><DialogHeader><DialogTitle className="flex items-center gap-2"><XCircle className="h-5 w-5 text-red-600" />Eliminar registro</DialogTitle><DialogDescription>Esta acción no se puede deshacer.</DialogDescription></DialogHeader>
                    {selected && <div className="bg-muted/30 p-4 rounded-lg"><p className="font-medium">Equipo: {selected.insectocaptor?.codigo_interno}</p><p className="text-sm text-muted-foreground">{fmt(selected.fecha)} — Total: {totalInsectos(selected)} insectos</p></div>}
                    <DialogFooter><Button variant="outline" onClick={() => setDeleteOpen(false)}>Cancelar</Button><Button variant="destructive" onClick={confirmDelete}>Eliminar</Button></DialogFooter>
                </DialogContent>
            </Dialog>
        </AppLayout>
    );
}