import AppLayout from '@/layouts/app-layout';
import { Head, usePage, router } from '@inertiajs/react';
import { useState } from 'react';
import FilterSelect from '@/components/ui/filter-select';
import { Button } from '@/components/ui/button';
import { PDFDownloadLink } from '@react-pdf/renderer';
import CronogramaPDF from '@/pdf/CronogramaPDF';
import { route } from 'ziggy-js';

const DIAS = [
  { key: 'lun', label: 'Lunes' },
  { key: 'mar', label: 'Martes' },
  { key: 'mie', label: 'Miércoles' },
  { key: 'jue', label: 'Jueves' },
  { key: 'vie', label: 'Viernes' },
  { key: 'sab', label: 'Sábado' },
  { key: 'dom', label: 'Domingo' },
];

const TURNOS = [1, 2, 3];

// Función para agrupar items por área y subárea
const agruparPorArea = (items: any[]) => {
  const areasMap = new Map();

  items.forEach((item) => {
    const areaId = item.subarea?.area?.id ?? item.old_area_id ?? 'sin-area';
    const areaNombre = item.subarea?.area?.nombre ?? 'Sin área';
    const subareaId = item.subarea?.id ?? item.old_subarea_id ?? 'sin-subarea';
    const subareaNombre = item.subarea?.nombre ?? 'Sin subárea';

    if (!areasMap.has(areaId)) {
      areasMap.set(areaId, {
        id: areaId,
        nombre: areaNombre,
        subareas: new Map(),
      });
    }

    const areaEntry = areasMap.get(areaId);
    if (!areaEntry.subareas.has(subareaId)) {
      areaEntry.subareas.set(subareaId, {
        id: subareaId,
        nombre: subareaNombre,
        items: [],
      });
    }
    areaEntry.subareas.get(subareaId).items.push(item);
  });

  return Array.from(areasMap.values()).map((area: any) => ({
    id: area.id,
    nombre: area.nombre,
    subareas: Array.from(area.subareas.values()).map((sub: any) => ({
      id: sub.id,
      nombre: sub.nombre,
      items: sub.items,
    })),
  }));
};

// Obtener actividades por día (devuelve arreglos de turnos por tipo)
const getActividadesPorDia = (item: any, dia: string) => {
  const actividades = {
    orden: [] as number[],
    limpieza: [] as number[],
    desinfeccion: [] as number[],
  };

  TURNOS.forEach((t) => {
    if (item[`${dia}_${t}_o`]) actividades.orden.push(t);
    if (item[`${dia}_${t}_l`]) actividades.limpieza.push(t);
    if (item[`${dia}_${t}_d`]) actividades.desinfeccion.push(t);
  });

  return actividades;
};

export default function Reporte() {
  const { items, areas, subareas, filtros = {} } = usePage<any>().props;

  const [areaId, setAreaId] = useState(filtros.area_id || '');
  const [subareaId, setSubareaId] = useState(filtros.subarea_id || '');

  // Aplicar filtros (navegación a la misma página con query params)
  const aplicarFiltros = () => {
    const params: any = {};
    if (areaId) params.area_id = areaId;
    if (subareaId) params.subarea_id = subareaId;
    router.get(route('old-items.reporte'), params, {
      preserveState: true,
      preserveScroll: true,
    });
  };

  // Subáreas filtradas según área seleccionada (para el select)
  const subareasFiltradas = areaId
    ? subareas.filter((s: any) => s.old_area_id === parseInt(areaId))
    : subareas;

  const areasAgrupadas = agruparPorArea(items);

  return (
    <AppLayout>
      <Head title="Reporte Cronograma" />

      <div className="p-4 space-y-6 max-w-screen-2xl mx-auto">
        {/* Encabezado */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Cronograma de Limpieza</h1>
            <p className="text-sm text-muted-foreground">Plan semanal por áreas y subáreas</p>
          </div>

          <div className="flex items-center gap-3">
            {/* Exportar PDF */}
            <PDFDownloadLink
              document={<CronogramaPDF areas={areasAgrupadas} />}
              fileName="cronograma_limpieza.pdf"
            >
              {({ loading }) => (
                <Button variant="outline" size="sm" disabled={loading}>
                  {loading ? 'Generando PDF...' : 'Exportar PDF'}
                </Button>
              )}
            </PDFDownloadLink>
          </div>
        </div>

        {/* Filtros */}
        <div className="bg-white dark:bg-gray-900 border rounded-lg p-4 shadow-sm">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <FilterSelect
              label="Área"
              value={areaId}
              onChange={(v) => {
                setAreaId(v);
                setSubareaId('');
              }}
              options={[
                { value: '', label: 'Todas las áreas' },
                ...areas.map((a: any) => ({
                  value: a.id.toString(),
                  label: a.nombre,
                })),
              ]}
            />

            <FilterSelect
              label="Subárea"
              value={subareaId}
              onChange={setSubareaId}
              options={[
                { value: '', label: 'Todas las subáreas' },
                ...subareasFiltradas.map((s: any) => ({
                  value: s.id.toString(),
                  label: s.nombre,
                })),
              ]}
            />

            <div className="flex items-end">
              <Button onClick={aplicarFiltros} size="sm" className="w-full sm:w-auto">
                Aplicar Filtros
              </Button>
            </div>
          </div>
        </div>

        {/* Leyenda */}
        <div className="flex flex-wrap gap-4 text-sm">
          <span className="inline-flex items-center gap-1.5">
            <span className="inline-block w-4 h-4 bg-blue-500 rounded"></span> Orden
          </span>
          <span className="inline-flex items-center gap-1.5">
            <span className="inline-block w-4 h-4 bg-yellow-500 rounded"></span> Limpieza
          </span>
          <span className="inline-flex items-center gap-1.5">
            <span className="inline-block w-4 h-4 bg-green-500 rounded"></span> Desinfección
          </span>
          <span className="text-muted-foreground text-xs">
            * Los números en tooltip indican los turnos (1, 2, 3)
          </span>
        </div>

        {/* Contenido agrupado */}
        {areasAgrupadas.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground">
            No hay ítems para los filtros seleccionados.
          </div>
        ) : (
          areasAgrupadas.map((area) => (
            <div key={area.id} className="space-y-4">
              <h2 className="text-lg font-bold bg-blue-50 dark:bg-blue-900/20 text-blue-800 dark:text-blue-200 px-4 py-2 rounded-md border-l-4 border-blue-500">
                Área: {area.nombre}
              </h2>

              {area.subareas.map((subarea) => (
                <div key={subarea.id} className="ml-2 sm:ml-4 space-y-2">
                  <h3 className="font-semibold text-gray-700 dark:text-gray-300">
                    Subárea: {subarea.nombre}
                  </h3>

                  <div className="overflow-x-auto shadow-sm rounded-lg border">
                    <table className="w-full text-xs min-w-[800px]">
                      <thead>
                        <tr className="bg-gray-100 dark:bg-gray-800">
                          <th className="px-3 py-2 text-left font-semibold">Item</th>
                          {DIAS.map((dia) => (
                            <th key={dia.key} className="px-2 py-2 text-center font-semibold">
                              {dia.label}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {subarea.items.map((item) => (
                          <tr key={item.id} className="border-t hover:bg-muted/30">
                            <td className="px-3 py-1.5 font-medium">{item.nombre}</td>
                            {DIAS.map((dia) => {
                              const act = getActividadesPorDia(item, dia.key);
                              const hayActividades =
                                act.orden.length > 0 ||
                                act.limpieza.length > 0 ||
                                act.desinfeccion.length > 0;

                              return (
                                <td key={dia.key} className="px-2 py-1.5 text-center">
                                  {!hayActividades ? (
                                    <span className="text-muted-foreground">-</span>
                                  ) : (
                                    <div className="flex flex-wrap gap-1 justify-center">
                                      {act.orden.length > 0 && (
                                        <span
                                          title={`Turnos: ${act.orden.join(', ')}`}
                                          className="inline-flex items-center justify-center bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200 font-bold px-1.5 py-0.5 rounded min-w-[20px]"
                                        >
                                          O
                                        </span>
                                      )}
                                      {act.limpieza.length > 0 && (
                                        <span
                                          title={`Turnos: ${act.limpieza.join(', ')}`}
                                          className="inline-flex items-center justify-center bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200 font-bold px-1.5 py-0.5 rounded min-w-[20px]"
                                        >
                                          L
                                        </span>
                                      )}
                                      {act.desinfeccion.length > 0 && (
                                        <span
                                          title={`Turnos: ${act.desinfeccion.join(', ')}`}
                                          className="inline-flex items-center justify-center bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200 font-bold px-1.5 py-0.5 rounded min-w-[20px]"
                                        >
                                          D
                                        </span>
                                      )}
                                    </div>
                                  )}
                                </td>
                              );
                            })}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              ))}
            </div>
          ))
        )}
      </div>
    </AppLayout>
  );
}