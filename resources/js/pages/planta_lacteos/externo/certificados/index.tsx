import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import AppLayout from '@/layouts/app-layout';
import { Head, router, usePage } from '@inertiajs/react';
import { FileText, Filter, Printer, Search } from 'lucide-react';
import { useMemo, useState } from 'react';
import { PDFViewer } from '@react-pdf/renderer';
import ReporteCertificadoExterno from '@/pdf/ReporteCertificadoExterno';
import { route } from 'ziggy-js';

interface DetalleCertificado {
  id: number;
  subcodigo: string;
  estado: string;
  tipo_analisis: string | null;
  personal_ambiente_superficie: string | null;
  certificado_emitido: boolean;
  certificado_emitido_en: string | null;
  fecha_muestreo: string | null;
  fecha_elaboracion: string | null;
  fecha_vencimiento: string | null;
  producto_terminado: { nombre_comercial?: string; nombre?: string } | null;
  tipo_muestra: { nombre: string } | null;
  solicitud: { codigo: string; user?: { name?: string } | null } | null;
  microbiologias: Array<{ id: number; estado: string; aer_mes: number | null; col_tot: number | null; moh_lev: number | null; fecha_siembra: string | null; fecha_dia5: string | null }>;
  actividad_agua: { id: number; estado: string; fecha: string | null; temperatura: number | null; por_hum_rel: number | null; act_agua: number | null } | null;
  agua_fisico: { id: number; estado: string; fecha: string | null; ph: number | null; dureza: number | null; cloruros: number | null; conductividad: number | null } | null;
}

interface PageProps {
  detalles: DetalleCertificado[];
  filters: {
    search: string;
    estado: string;
    tipo_analisis: string;
    emitido: string;
  };
  flash?: { success?: string; error?: string };
}

function getProductName(detalle: DetalleCertificado) {
  return detalle.producto_terminado?.nombre_comercial || detalle.producto_terminado?.nombre || detalle.personal_ambiente_superficie || 'Sin descripción';
}

function getResumen(detalle: DetalleCertificado) {
  const items: string[] = [];
  if (detalle.microbiologias?.length) items.push(`Microbiología (${detalle.microbiologias.length})`);
  if (detalle.actividad_agua) items.push('Act. agua');
  if (detalle.agua_fisico) items.push('Agua físico');
  return items.length ? items.join(' • ') : 'Sin resultados';
}

export default function Index() {
  const { props } = usePage<PageProps>();
  const { detalles, filters } = props;
  const [localSearch, setLocalSearch] = useState(filters.search || '');
  const [selectedDetalle, setSelectedDetalle] = useState<DetalleCertificado | null>(null);

  const filteredDetalles = useMemo(() => detalles, [detalles]);

  const applyFilters = (next: Partial<typeof filters>) => {
    router.get(route('externo.certificados.index'), { ...filters, ...next }, { preserveScroll: true, replace: true });
  };

  const emitCertificado = (detalle: DetalleCertificado) => {
    router.post(route('externo.certificados.emitir', detalle.id), {}, {
      preserveScroll: true,
      onSuccess: () => setSelectedDetalle(null),
    });
  };

  return (
    <AppLayout breadcrumbs={[{ title: 'Certificados Externos', href: '/externo/certificados' }]}> 
      <Head title="Certificados Externos" />
      <div className="space-y-4 p-4">
        <div className="flex flex-col gap-3 rounded-lg border bg-card p-3 md:flex-row md:items-end md:justify-between">
          <div>
            <h1 className="text-xl font-semibold">Certificados Externos</h1>
            <p className="text-sm text-muted-foreground">Revise los resultados y emita o previsualice el certificado PDF.</p>
          </div>
          <div className="flex flex-wrap gap-2">
            <div className="flex items-center rounded-md border bg-background px-2">
              <Search className="mr-2 h-4 w-4 text-muted-foreground" />
              <Input
                value={localSearch}
                onChange={(e) => setLocalSearch(e.target.value)}
                onKeyDown={(event) => {
                  if (event.key === 'Enter') applyFilters({ search: localSearch });
                }}
                placeholder="Buscar subcódigo o producto"
                className="h-9 border-0 shadow-none focus-visible:ring-0"
              />
            </div>
            <Select value={filters.estado || 'all'} onValueChange={(value) => applyFilters({ estado: value === 'all' ? '' : value })}>
              <SelectTrigger className="w-[160px]">
                <SelectValue placeholder="Estado" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos</SelectItem>
                <SelectItem value="Aceptado">Aceptado</SelectItem>
                <SelectItem value="Pendiente">Pendiente</SelectItem>
              </SelectContent>
            </Select>
            <Select value={filters.tipo_analisis || 'all'} onValueChange={(value) => applyFilters({ tipo_analisis: value === 'all' ? '' : value })}>
              <SelectTrigger className="w-[170px]">
                <SelectValue placeholder="Tipo análisis" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos</SelectItem>
                <SelectItem value="Microbiología">Microbiología</SelectItem>
                <SelectItem value="Agua">Agua</SelectItem>
                <SelectItem value="Fisicoquímico">Fisicoquímico</SelectItem>
              </SelectContent>
            </Select>
            <Select value={filters.emitido || 'all'} onValueChange={(value) => applyFilters({ emitido: value === 'all' ? '' : value })}>
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="Emisión" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos</SelectItem>
                <SelectItem value="1">Emitidos</SelectItem>
                <SelectItem value="0">Pendientes</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="outline" size="sm" onClick={() => applyFilters({ search: localSearch, estado: '', tipo_analisis: '', emitido: '' })}>
              <Filter className="mr-2 h-4 w-4" /> Limpiar
            </Button>
          </div>
        </div>

        <div className="overflow-hidden rounded-lg border bg-background">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[140px]">Subcódigo</TableHead>
                <TableHead>Producto / solicitud</TableHead>
                <TableHead className="w-[120px]">Tipo</TableHead>
                <TableHead className="w-[220px]">Resultados</TableHead>
                <TableHead className="w-[120px]">Estado</TableHead>
                <TableHead className="w-[120px]">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredDetalles.map((detalle) => (
                <TableRow key={detalle.id}>
                  <TableCell className="font-medium">
                    <div>{detalle.subcodigo}</div>
                    <div className="text-xs text-muted-foreground">{detalle.fecha_muestreo ? new Date(detalle.fecha_muestreo).toLocaleDateString('es-ES') : 'Sin fecha'}</div>
                  </TableCell>
                  <TableCell>
                    <div className="font-medium">{getProductName(detalle)}</div>
                    <div className="text-sm text-muted-foreground">{detalle.solicitud?.codigo || 'Sin solicitud'}</div>
                  </TableCell>
                  <TableCell>
                    <div className="space-y-1">
                      <Badge variant="outline" className="text-[11px]">{detalle.tipo_analisis || 'Sin tipo'}</Badge>
                      <div className="text-xs text-muted-foreground">{detalle.tipo_muestra?.nombre || '-'}</div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="text-sm">{getResumen(detalle)}</div>
                    <div className="mt-1 flex flex-wrap gap-1">
                      <Badge variant={detalle.certificado_emitido ? 'default' : 'secondary'} className="text-[11px]">
                        {detalle.certificado_emitido ? 'Emitido' : 'Pendiente'}
                      </Badge>
                      <Badge variant="outline" className="text-[11px]">{detalle.estado}</Badge>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="text-sm">{detalle.estado}</div>
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-col gap-2">
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button variant="outline" size="sm" className="justify-start">
                            <FileText className="mr-2 h-3.5 w-3.5" /> Previsualizar
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-5xl">
                          <DialogHeader>
                            <DialogTitle>Previsualización del certificado</DialogTitle>
                          </DialogHeader>
                          <div className="max-h-[78vh] overflow-auto rounded-md border bg-white p-2">
                            <PDFViewer style={{ width: '100%', height: '75vh' }}>
                              <ReporteCertificadoExterno detalle={detalle} />
                            </PDFViewer>
                          </div>
                        </DialogContent>
                      </Dialog>
                      <Button onClick={() => setSelectedDetalle(detalle)} size="sm" variant={detalle.certificado_emitido ? 'secondary' : 'default'}>
                        <Printer className="mr-2 h-3.5 w-3.5" /> {detalle.certificado_emitido ? 'Reemitir' : 'Emitir'}
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>

      <Dialog open={!!selectedDetalle} onOpenChange={(open) => !open && setSelectedDetalle(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirmar emisión</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-muted-foreground">¿Desea marcar este detalle como certificado emitido y generar el PDF?</p>
          <div className="mt-4 flex justify-end gap-2">
            <Button variant="outline" onClick={() => setSelectedDetalle(null)}>Cancelar</Button>
            <Button onClick={() => selectedDetalle && emitCertificado(selectedDetalle)}>Confirmar</Button>
          </div>
        </DialogContent>
      </Dialog>
    </AppLayout>
  );
}
