// resources/js/Pages/externo/solicitudes/Index.tsx
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Toast } from '@/components/ui/toast';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import FilterSelect from '@/components/ui/filter-select';
import AppLayout from '@/layouts/app-layout';
import { Head, Link, usePage, useForm, router } from '@inertiajs/react';
import { Plus, ChevronDown, ChevronRight, Check, X, AlertTriangle, FileText, FlaskConical } from 'lucide-react';
import { useState } from 'react';
import { route } from 'ziggy-js';

const breadcrumbs = [{ title: 'Solicitudes Externas', href: '/planta-lacteos/externo/solicitudes' }];

interface Detalle {
  id: number;
  subcodigo: string;
  producto_terminado: { nombre_comercial: string } | null;
  tipo_muestra: { nombre: string } | null;
  tipo_analisis: string;
  estado: string;
  personal_ambiente_superficie: string | null;
  lote: string | null;
  observaciones: string | null;
}

interface Solicitud {
  id: number;
  codigo: string;
  tiempo: string;
  user: { name: string; apellido: string };
  estado: string;
  detalles: Detalle[];
}

interface PageProps {
  solicitudes: { data: Solicitud[]; /* pagination */ };
  filters: any;
  flash: { success?: string; error?: string };
}

export default function Index() {
  const { props } = usePage<PageProps>();
  const { solicitudes, filters: initialFilters, flash } = props;
  const [expandedId, setExpandedId] = useState<number | null>(null);
  const [rechazarDialog, setRechazarDialog] = useState<{ id: number; tipo: 'solicitud' | 'detalle' } | null>(null);
  const { data: obsData, setData: setObsData, put: putObs, processing } = useForm({ observaciones: '' });

  // Filtros (simplificado)
  const [filters, setFilters] = useState({ estado: initialFilters?.estado || '', codigo: initialFilters?.codigo || '' });

  const toggleExpand = (id: number) => setExpandedId(expandedId === id ? null : id);

  const cambiarEstado = (solicitudId: number, estado: string, observaciones?: string) => {
    router.put(route('externo.solicitudes.cambiar-estado', solicitudId), { estado, observaciones }, { preserveScroll: true });
  };

  const cambiarEstadoDetalle = (detalleId: number, estado: string, observaciones?: string) => {
    router.put(route('externo.detalles.cambiar-estado', detalleId), { estado, observaciones }, { preserveScroll: true });
  };

  const abrirRechazar = (id: number, tipo: 'solicitud' | 'detalle') => {
    setObsData('observaciones', '');
    setRechazarDialog({ id, tipo });
  };

  const confirmarRechazo = () => {
    if (!rechazarDialog) return;
    if (rechazarDialog.tipo === 'solicitud') {
      cambiarEstado(rechazarDialog.id, 'Rechazado', obsData.observaciones);
    } else {
      cambiarEstadoDetalle(rechazarDialog.id, 'Rechazado', obsData.observaciones);
    }
    setRechazarDialog(null);
  };
console.log(solicitudes);
console.log(solicitudes.data);
  return (
    <AppLayout breadcrumbs={breadcrumbs}>
      <Head title="Solicitudes de Análisis" />
      <div className="px-4 py-4 space-y-4">
        <Toast />
        <div className="flex justify-between">
          <h1 className="text-2xl font-bold">Solicitudes</h1>
          <Link href={route('externo.solicitudes.create')}>
            <Button size="sm"><Plus className="h-4 w-4 mr-1" /> Nueva Solicitud</Button>
          </Link>
        </div>

        {/* Filtros rápidos */}
        <div className="flex gap-4 flex-wrap">
          <FilterSelect
            value={filters.estado}
            onChange={(v) => setFilters(f => ({ ...f, estado: v }))}
            placeholder="Estado"
            options={['Pendiente','Aceptado','Rechazado','Observado'].map(v=>({value:v,label:v}))}
          />
          <input
            placeholder="Buscar código..."
            className="border rounded px-2 py-1 text-sm"
            value={filters.codigo}
            onChange={e => setFilters(f => ({...f, codigo: e.target.value}))}
          />
        </div>

        <div className="rounded-lg border overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-8"></TableHead>
                <TableHead>Código</TableHead>
                <TableHead>Fecha</TableHead>
                <TableHead>Solicitante</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead className="w-40">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {solicitudes.data.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8">No hay solicitudes</TableCell>
                </TableRow>
              ) : (
                solicitudes.data.map((sol) => (
                  <>
                    <TableRow key={sol.id} className="hover:bg-muted/50">
                      <TableCell>
                        <Button variant="ghost" size="icon" onClick={() => toggleExpand(sol.id)}>
                          {expandedId === sol.id ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                        </Button>
                      </TableCell>
                      <TableCell className="font-mono">{sol.codigo}</TableCell>
                      <TableCell>{new Date(sol.tiempo).toLocaleString()}</TableCell>
                      <TableCell>{sol.user?.name} {sol.user?.apellido}</TableCell>
                      <TableCell>
                        <Badge variant={sol.estado === 'Pendiente' ? 'outline' : sol.estado === 'Aceptado' ? 'default' : 'destructive'}>
                          {sol.estado}
                        </Badge>
                      </TableCell>
                      <TableCell className="flex gap-1">
                        {sol.estado === 'Pendiente' && (
                          <>
                            <Button variant="outline" size="sm" onClick={() => cambiarEstado(sol.id, 'Aceptado')}>
                              <Check className="h-4 w-4 mr-1" /> Aceptar
                            </Button>
                            <Button variant="outline" size="sm" onClick={() => abrirRechazar(sol.id, 'solicitud')}>
                              <X className="h-4 w-4 mr-1" /> Rechazar
                            </Button>
                          </>
                        )}
                      </TableCell>
                    </TableRow>
                    {expandedId === sol.id && (
                      <TableRow key={`detail-${sol.id}`} className="bg-muted/30">
                        <TableCell colSpan={6} className="p-0">
                          <div className="p-4 space-y-2">
                            <h3 className="font-semibold">Detalles de la solicitud</h3>
                            {sol.detalles.map((det) => (
                              <div key={det.id} className="border rounded p-2 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
                                <div>
                                  <span className="font-mono text-sm">{det.subcodigo}</span> -{' '}
                                  <span>{det.producto_terminado?.nombre_comercial || det.personal_ambiente_superficie || 'Sin producto'}</span> -{' '}
                                  <span className="text-xs text-muted-foreground">{det.tipo_analisis}</span>
                                  <div className="text-xs">Muestra: {det.tipo_muestra?.nombre || '-'}</div>
                                </div>
                                <div className="flex items-center gap-2">
                                  <Badge variant="outline">{det.estado}</Badge>
                                  {det.estado === 'Pendiente' && (
                                    <div className="flex gap-1">
                                      <Button variant="ghost" size="xs" onClick={() => cambiarEstadoDetalle(det.id, 'Aceptado')} className="h-7 text-xs">
                                        <Check className="h-3 w-3 mr-1" /> Aceptar
                                      </Button>
                                      <Button variant="ghost" size="xs" onClick={() => abrirRechazar(det.id, 'detalle')} className="h-7 text-xs">
                                        <X className="h-3 w-3 mr-1" /> Rechazar
                                      </Button>
                                    </div>
                                  )}
                                </div>
                              </div>
                            ))}
                          </div>
                        </TableCell>
                      </TableRow>
                    )}
                  </>
                ))
              )}
            </TableBody>
          </Table>
        </div>

        {/* Diálogo de Rechazo */}
        <Dialog open={rechazarDialog !== null} onOpenChange={() => setRechazarDialog(null)}>
          <DialogContent>
            <DialogHeader><DialogTitle>Rechazar {rechazarDialog?.tipo === 'solicitud' ? 'Solicitud' : 'Detalle'}</DialogTitle></DialogHeader>
            <textarea
              className="w-full border rounded p-2"
              placeholder="Motivo del rechazo..."
              value={obsData.observaciones}
              onChange={e => setObsData('observaciones', e.target.value)}
            />
            <DialogFooter>
              <Button variant="outline" onClick={() => setRechazarDialog(null)}>Cancelar</Button>
              <Button variant="destructive" onClick={confirmarRechazo} disabled={processing}>Confirmar Rechazo</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </AppLayout>
  );
}