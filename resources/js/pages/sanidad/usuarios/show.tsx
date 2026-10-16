import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { CalendarIcon, FileText, Heart, Activity, ArrowLeft, Filter, X } from 'lucide-react';
import AppLayout from '@/layouts/app-layout';
import { Head, Link, router } from '@inertiajs/react';
import { route } from 'ziggy-js';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { useState, useMemo } from 'react';

export default function Show({ usuario }) {
  // Estados para filtros
  const [filtroTipo, setFiltroTipo] = useState('todos');
  const [fechaDesde, setFechaDesde] = useState('');
  const [fechaHasta, setFechaHasta] = useState('');
  const [busqueda, setBusqueda] = useState('');

  // Combinar y ordenar eventos (atenciones y exámenes)
  const eventos = useMemo(() => {
    const atenciones = (usuario.atencionesComoPaciente || []).map(a => ({
      ...a,
      tipo: 'atencion',
      fecha: a.fecha_atencion,
      titulo: `Atención médica - ${a.motivo_consulta || 'Sin motivo'}`,
      descripcion: a.diagnostico || 'Sin diagnóstico',
      estado: a.estado?.nombre,
      medico: a.medico_user,
      link: route('atenciones-medicas.show', a.id),
    }));

    const examenes = (usuario.examenesOcupacionalesComoEmpleado || []).map(e => ({
      ...e,
      tipo: 'examen',
      fecha: e.fecha_examen,
      titulo: `Examen ${e.tipo_examen === 'PRE' ? 'Pre-ocupacional' : e.tipo_examen === 'POST' ? 'Post-ocupacional' : 'Ocupacional'}`,
      descripcion: `Aptitud: ${e.aptitud_ocupacional || 'No definida'}`,
      estado: e.aptitud_ocupacional,
      medico: e.medico,
      link: route('examenes-ocupacionales.show', e.id),
    }));

    return [...atenciones, ...examenes].sort((a, b) => new Date(b.fecha) - new Date(a.fecha));
  }, [usuario]);

  // Aplicar filtros
  const eventosFiltrados = useMemo(() => {
    return eventos.filter(e => {
      // Filtro por tipo
      if (filtroTipo !== 'todos' && e.tipo !== filtroTipo) return false;

      // Filtro por fechas
      const fechaEvento = new Date(e.fecha);
      if (fechaDesde && fechaEvento < new Date(fechaDesde)) return false;
      if (fechaHasta && fechaEvento > new Date(fechaHasta)) return false;

      // Búsqueda por texto en motivo/diagnóstico
      if (busqueda) {
        const texto = `${e.titulo} ${e.descripcion}`.toLowerCase();
        if (!texto.includes(busqueda.toLowerCase())) return false;
      }

      return true;
    });
  }, [eventos, filtroTipo, fechaDesde, fechaHasta, busqueda]);

  const limpiarFiltros = () => {
    setFiltroTipo('todos');
    setFechaDesde('');
    setFechaHasta('');
    setBusqueda('');
  };

  const hayFiltrosActivos = filtroTipo !== 'todos' || fechaDesde || fechaHasta || busqueda;

  return (
    <AppLayout
      breadcrumbs={[
        { title: 'Usuarios', href: '/sanidad/usuarios' },
        { title: 'Historial', href: '#' },
      ]}
    >
      <Head title={`Historial de ${usuario.name} ${usuario.apellido}`} />
      <div className="container mx-auto p-4 max-w-7xl">
        {/* Cabecera con botón volver */}
        <div className="mb-4 flex items-center justify-between">
          <Button variant="ghost" onClick={() => router.visit(route('sanidad.usuarios.index'))}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Volver a usuarios
          </Button>
        </div>

        {/* Tarjeta de información del usuario */}
        <Card className="mb-6 shadow-md">
          <CardHeader className="bg-muted/50 pb-2">
            <CardTitle className="text-2xl flex items-center gap-2">
              <Heart className="h-6 w-6 text-primary" />
              {usuario.name} {usuario.apellido}
            </CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4">
            <div>
              <Label className="text-muted-foreground">Código</Label>
              <p className="font-mono text-lg">{usuario.codigo}</p>
            </div>
            <div>
              <Label className="text-muted-foreground">Email</Label>
              <p>{usuario.email || '-'}</p>
            </div>
            <div>
              <Label className="text-muted-foreground">Teléfono</Label>
              <p>{usuario.telefono || '-'}</p>
            </div>
          </CardContent>
        </Card>

        {/* Panel de filtros */}
        <Card className="mb-6 shadow-sm">
          <CardContent className="pt-4">
            <div className="flex flex-col md:flex-row gap-4 items-end">
              <div className="flex-1">
                <Label htmlFor="busqueda">Buscar</Label>
                <Input
                  id="busqueda"
                  placeholder="Motivo, diagnóstico, etc."
                  value={busqueda}
                  onChange={(e) => setBusqueda(e.target.value)}
                  className="mt-1"
                />
              </div>
              <div className="w-full md:w-48">
                <Label htmlFor="tipo">Tipo</Label>
                <Select value={filtroTipo} onValueChange={setFiltroTipo}>
                  <SelectTrigger id="tipo" className="mt-1">
                    <SelectValue placeholder="Todos" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="todos">Todos</SelectItem>
                    <SelectItem value="atencion">Atenciones</SelectItem>
                    <SelectItem value="examen">Exámenes</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="w-full md:w-40">
                <Label htmlFor="desde">Desde</Label>
                <Input
                  id="desde"
                  type="date"
                  value={fechaDesde}
                  onChange={(e) => setFechaDesde(e.target.value)}
                  className="mt-1"
                />
              </div>
              <div className="w-full md:w-40">
                <Label htmlFor="hasta">Hasta</Label>
                <Input
                  id="hasta"
                  type="date"
                  value={fechaHasta}
                  onChange={(e) => setFechaHasta(e.target.value)}
                  className="mt-1"
                />
              </div>
              {hayFiltrosActivos && (
                <Button variant="ghost" size="icon" onClick={limpiarFiltros} title="Limpiar filtros">
                  <X className="h-4 w-4" />
                </Button>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Línea de tiempo de eventos */}
        <div className="space-y-4">
          {eventosFiltrados.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground border-2 border-dashed rounded-lg">
              <FileText className="h-12 w-12 mx-auto mb-3 opacity-30" />
              <p className="text-lg">No se encontraron registros</p>
              <p className="text-sm">Prueba con otros filtros o crea nuevas atenciones/exámenes.</p>
            </div>
          ) : (
            <div className="relative border-l-2 border-primary/30 ml-4 space-y-6">
              {eventosFiltrados.map((evento, index) => (
                <div key={`${evento.tipo}-${evento.id}`} className="relative pl-8 pb-2">
                  {/* Punto en la línea de tiempo */}
                  <div
                    className={`absolute -left-[9px] top-1 h-4 w-4 rounded-full border-2 ${
                      evento.tipo === 'atencion'
                        ? 'border-blue-500 bg-blue-100'
                        : 'border-green-500 bg-green-100'
                    }`}
                  />
                  {/* Tarjeta del evento */}
                  <Link href={evento.link}>
                    <Card className="hover:shadow-lg transition-shadow cursor-pointer">
                      <CardContent className="p-4">
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-2">
                          <div className="flex items-start gap-3">
                            <div
                              className={`mt-1 rounded-full p-2 ${
                                evento.tipo === 'atencion' ? 'bg-blue-100' : 'bg-green-100'
                              }`}
                            >
                              {evento.tipo === 'atencion' ? (
                                <Activity className="h-5 w-5 text-blue-600" />
                              ) : (
                                <Heart className="h-5 w-5 text-green-600" />
                              )}
                            </div>
                            <div>
                              <p className="font-semibold text-lg">{evento.titulo}</p>
                              <p className="text-sm text-muted-foreground line-clamp-2">
                                {evento.descripcion}
                              </p>
                              <div className="flex flex-wrap gap-2 mt-2">
                                <Badge variant="outline" className="flex items-center gap-1">
                                  <CalendarIcon className="h-3 w-3" />
                                  {format(new Date(evento.fecha), 'PPP', { locale: es })}
                                </Badge>
                                {evento.medico && (
                                  <Badge variant="secondary">
                                    Dr. {evento.medico.name} {evento.medico.apellido}
                                  </Badge>
                                )}
                                {evento.tipo === 'atencion' ? (
                                  <Badge
                                    className={
                                      evento.estado === 'Finalizado'
                                        ? 'bg-green-100 text-green-800'
                                        : 'bg-yellow-100 text-yellow-800'
                                    }
                                  >
                                    {evento.estado}
                                  </Badge>
                                ) : (
                                  <Badge
                                    className={
                                      evento.estado === 'APTO'
                                        ? 'bg-green-100 text-green-800'
                                        : evento.estado === 'NO APTO'
                                        ? 'bg-red-100 text-red-800'
                                        : 'bg-yellow-100 text-yellow-800'
                                    }
                                  >
                                    {evento.estado}
                                  </Badge>
                                )}
                              </div>
                            </div>
                          </div>
                          <Button size="sm" variant="ghost" className="self-end md:self-center">
                            Ver detalle
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  </Link>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </AppLayout>
  );
}