import React, { useEffect, useState } from 'react';
import { Head, router, usePage } from '@inertiajs/react';
import { route } from 'ziggy-js';
import AppLayout from '@/layouts/app-layout';
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
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Toast } from '@/components/ui/toast';
import { Pencil, Save, X, RefreshCw } from 'lucide-react';
import EnvasadoraGroup from '@/components/EnvasadoraGroup';
import TanqueCardUltraCompact from '@/components/TanqueCard';
import SolicitudAnalisisModal from '@/components/SolicitudAnalisisModal';
import { envasadoraIdMap, tanqueIndividualIdMap, gruposEnvasadoras } from '@/config/tanquesLayout';

interface PesoRow {
  id: number;
  orp_codigo?: string;
  codigo?: string;
  producto_nombre: string;
  preparacion: string | null;
  cabezal: string;
  peso: number | null;
}

interface TemperaturaRow {
  id: number;
  orp_codigo?: string;
  codigo?: string;
  producto_nombre: string;
  preparacion: string | null;
  cabezal: string;
  tempUHT: number | null;
}

interface OrpRow {
  id: number;
  codigo?: string;
  orp_codigo?: string;
  producto_nombre: string;
  preparacion: string | null;
  cabezal?: string;
  fecha_vencimiento1: string | null;
}

interface PageProps extends Record<string, any> {
  tipo: 'UHT' | 'HTST';
  pesos: PesoRow[];
  temperaturas: TemperaturaRow[];
  orps_vencimiento: OrpRow[];
  origenes: Record<string, any>;
  etapas: any[];
  orps: any[]; // ORPs para producción
  orps_almacen?: any[]; // ORPs para almacenamiento
  flash?: {
    success?: string;
    error?: string;
  };
}

export default function UhtHtstIndex() {
  const { props } = usePage<PageProps>();
  const { tipo, pesos, temperaturas, orps_vencimiento, orps, orps_almacen, origenes, etapas, flash } = props;

  // 🎯 Formatear ORPs para que ModalProduccion las reconozca correctamente
  const orpsDisponibles = React.useMemo(() => {
    if (!orps) return [];
    return orps
      .filter((orp: any) => {
        const prod = orp.producto_terminado || orp.productoTerminado || orp.producto;
        // Ajustá según cómo venga la línea (línea.nombre o linea?.nombre)
        const lineaNombre = prod?.linea?.nombre || prod?.linea_nombre || '';
        return lineaNombre.toUpperCase() === 'UHT';
      })
      .map((orp: any) => {
        const productoData = orp.producto_terminado || orp.productoTerminado || orp.producto;
        return {
          id: orp.id,
          codigo: orp.codigo,
          lote: orp.lote || 'N/A',
          nombre_sap: orp.nombre_sap || productoData?.nombre_sap || 'Sin producto',
          productoTerminado: productoData ? {
            codigo_sap: productoData.codigo_sap || '',
            nombre: productoData.nombre_sap || productoData.nombre || productoData.nombre_comercial || 'Sin producto',
            lote: productoData.lote || 'N/A'
          } : undefined
        };
      });
  }, [orps]);

  const orpsAlmacenDisponibles = React.useMemo(() => {
    if (!orps_almacen) return [];
    return orps_almacen.map((orp: any) => {
      const productoData = orp.producto_terminado || orp.productoTerminado || orp.producto;
      return {
        id: orp.id,
        codigo: orp.codigo,
        lote: orp.lote || 'N/A',
        nombre_sap: orp.nombre_sap || productoData?.nombre_sap || 'Sin producto',
        productoTerminado: productoData ? {
          codigo_sap: productoData.codigo_sap || '',
          nombre: productoData.nombre_sap || productoData.nombre || productoData.nombre_comercial || 'Sin producto',
          lote: productoData.lote || 'N/A'
        } : undefined
      };
    });
  }, [orps_almacen]);

  // Estados para el Dashboard Integrado
  const [analisisModal, setAnalisisModal] = useState({
    isOpen: false,
    id: 0,
    nombre: ''
  });

  // Estados para edición de Pesos
  const [editingPesoId, setEditingPesoId] = useState<number | null>(null);
  const [tempPeso, setTempPeso] = useState<string>('');

  // Estados para edición de Temperaturas
  const [editingTempId, setEditingTempId] = useState<number | null>(null);
  const [tempTemp, setTempTemp] = useState<string>('');

  // Estados para edición de Vencimientos
  const [editingOrpId, setEditingOrpId] = useState<number | null>(null);
  const [tempFecha, setTempFecha] = useState<string>('');

  // Handlers para Solicitud de Análisis (Dashboard)
  const handleSolicitarAnalisis = (id: number, skipModal: boolean = false) => {
    if (skipModal) {
      router.post(route('estados-planta.solicitar-analisis', id), { peso: 0 }, {
        preserveScroll: true,
        onSuccess: () => router.reload({ only: ['origenes'] })
      });
      return;
    }

    const origenArray = Object.values(origenes || {}).map((o: any) => o.origen).filter(Boolean);
    const origenByOrigenId = origenArray.find((o: any) => o.id === id);
    const origenByStateId = Object.values(origenes || {}).find((o: any) => o.id === id)?.origen;
    const origen = origenByOrigenId || origenByStateId;

    setAnalisisModal({
      isOpen: true,
      id: id,
      nombre: origen?.alias || `Equipo ${id}`
    });
  };

  const confirmSolicitarAnalisis = (peso: number) => {
    router.post(route('estados-planta.solicitar-analisis', analisisModal.id), { peso }, {
      preserveScroll: true,
      onSuccess: () => {
        setAnalisisModal(prev => ({ ...prev, isOpen: false }));
        router.reload({ only: ['origenes'] });
      }
    });
  };

  const handleCambiarEstado = (origenId: number, proceso: string) => {
    if (confirm(`¿Está seguro de cambiar el estado a ${proceso}?`)) {
      const procesoMap: Record<string, number> = {
        'Vacio Limpio': 24,
        'Vacio Sucio': 25,
        'Produccion': 26,
        'En Limpieza': 27,
        'En Mantenimiento': 28,
        'Almacenando': 29
      };

      router.post(route('dashboardPlanta.store'), {
        origen_id: origenId,
        proceso_id: procesoMap[proceso],
        etapa_id: 1 // Etapa por defecto
      }, {
        preserveScroll: true,
        onSuccess: () => router.reload({ only: ['origenes'] })
      });
    }
  };

  const handleCompletarORP = (orpId: number) => {
    if (
      confirm(
        '¿Está seguro de que desea completar esta ORP? Se cambiará su estado a Completado y todos los equipos donde esté activa pasarán a Vacio Sucio.',
      )
    ) {
      router.post(
        route('orps.completar', orpId),
        {},
        {
          preserveScroll: true,
          onSuccess: () => {
            router.reload({ only: ['origenes'] });
          },
          onError: (errors) => {
            console.error('Error al completar ORP:', errors);
            alert('Error al completar la ORP');
          },
        },
      );
    }
  };

  const handlePausarORP = (orpId: number) => {
    if (
      confirm(
        '¿Está seguro de que desea pausar esta ORP? Se cambiará su estado a Pausada y todos los equipos donde esté activa pasarán a Vacio Sucio.',
      )
    ) {
      router.post(
        route('orps.pausar', orpId),
        {},
        {
          preserveScroll: true,
          onSuccess: () => {
            router.reload({ only: ['origenes'] });
          },
          onError: (errors) => {
            console.error('Error al pausar ORP:', errors);
            alert('Error al pausar la ORP');
          },
        },
      );
    }
  };

  const handleProduccionChange = async (data: any, tanque: any) => {
    if (data.cabezales_ids && data.cabezales_ids.length > 0) {
      // CASO: Mover a múltiples cabezales de envasadoras
      try {
        for (const cabezalId of data.cabezales_ids) {
          await new Promise((resolve, reject) => {
            router.post(route('estados-planta.store'), {
              origen_id: cabezalId,
              proceso_id: 26, // ID de Producción
              etapa_id: data.etapa_id,
              detalles: data.detalles.map((detalle: any) => ({
                orp_id: detalle.orp_id,
                preparacion: detalle.preparacion,
                cantidad: detalle.cantidad
              })),
              observaciones: `Producción en ${data.grupo_nombre || 'grupo'} - Movida desde ${tanque.origen?.alias}`
            }, {
              preserveScroll: true,
              onSuccess: () => resolve(true),
              onError: (err) => reject(err)
            });
          });
        }
        router.reload();
      } catch (error) {
        console.error('Error al crear producción en cabezales:', error);
        alert('Error al crear la producción en algunos cabezales.');
      }
    } else if (data.origen_id) {
      // CASO: Mover a un solo tanque destino
      router.post(route('estados-planta.store'), {
        origen_id: data.origen_id,
        proceso_id: 26,
        etapa_id: data.etapa_id,
        detalles: data.detalles,
        observaciones: `Producción movida desde ${tanque.origen?.alias}`
      }, {
        preserveScroll: true,
        onSuccess: () => router.reload({ only: ['origenes'] })
      });
    } else if (data.esNuevo) {
      // CASO: Iniciar producción en el MISMO tanque
      router.post(route('estados-planta.store'), {
        origen_id: tanque.origen?.id,
        proceso_id: 26,
        etapa_id: data.etapa_id,
        detalles: data.detalles,
        observaciones: `Producción iniciada en ${tanque.origen?.alias}`
      }, {
        preserveScroll: true,
        onSuccess: () => router.reload({ only: ['origenes'] })
      });
    }
  };

  // Polling cada 180 segundos
  useEffect(() => {
    const interval = setInterval(() => {
      router.reload({ only: ['pesos', 'temperaturas', 'orps'] });
    }, 180000);
    return () => clearInterval(interval);
  }, []);

  const startEditPeso = (row: PesoRow) => {
    setEditingPesoId(row.id);
    setTempPeso(row.peso?.toString() ?? '');
  };

  const cancelEditPeso = () => {
    setEditingPesoId(null);
    setTempPeso('');
  };

  const savePeso = (id: number) => {
    router.put(
      route('uht.updatePeso', { id }),
      { peso: tempPeso === '' ? null : parseFloat(tempPeso) },
      {
        preserveScroll: true,
        onSuccess: () => {
          setEditingPesoId(null);
          setTempPeso('');
        },
      }
    );
  };

  const startEditTemp = (row: TemperaturaRow) => {
    setEditingTempId(row.id);
    setTempTemp(row.tempUHT?.toString() ?? '');
  };

  const cancelEditTemp = () => {
    setEditingTempId(null);
    setTempTemp('');
  };

  const saveTemp = (id: number) => {
    router.put(
      route('uht.updateTemperatura', { id }),
      { tempUHT: tempTemp === '' ? null : parseFloat(tempTemp) },
      {
        preserveScroll: true,
        onSuccess: () => {
          setEditingTempId(null);
          setTempTemp('');
        },
      }
    );
  };

  const startEditOrp = (row: OrpRow) => {
    setEditingOrpId(row.id);
    setTempFecha(row.fecha_vencimiento1 ?? '');
  };

  const cancelEditOrp = () => {
    setEditingOrpId(null);
    setTempFecha('');
  };

  const saveOrp = (id: number) => {
    router.put(
      route('uht.updateVencimiento', { id }),
      { fecha_vencimiento1: tempFecha || null },
      {
        preserveScroll: true,
        onSuccess: () => {
          setEditingOrpId(null);
          setTempFecha('');
        },
      }
    );
  };

  const normalizeOrigen = (item: any) => {
    if (!item) return null;
    return {
      ...item,
      analisis_linea: item.analisis_linea ?? item.origen?.analisis_linea ?? item?.estadoPlanta?.analisis_linea,
      origen: {
        ...item.origen,
        id: item.origen?.id ?? item.id,
        alias: item.origen?.alias ?? item.alias,
        descripcion: item.origen?.descripcion ?? item.origen?.alias,
      },
    };
  };

  // Preparar origenes para modales
  const origenesArray = Object.values(origenes || {})
    .filter((o: any) => o?.origen)
    .map((o: any) => ({
      ...o,
      id: o.origen.id,
      alias: o.origen.alias,
      descripcion: o.origen.descripcion,
      analisis_linea: o.analisis_linea ?? o.origen?.analisis_linea,
    }));

  // Filtrar equipos específicos para UHT
  const tk42Id = tanqueIndividualIdMap['TK 42'];
  const tk41Id = tanqueIndividualIdMap['TK 41'];
  const tk42 = normalizeOrigen(origenes?.[tk42Id]);
  const tk41 = normalizeOrigen(origenes?.[tk41Id]);

  const grupoUhtConfig = gruposEnvasadoras.find(g => g.id === 'grupo-uht');
  const tanquesGrupoUht = grupoUhtConfig?.envasadoras.reduce((acc, alias) => {
    const idReal = envasadoraIdMap['grupo-uht']?.[alias];
    if (idReal && origenes?.[idReal]) {
      acc[alias] = normalizeOrigen(origenes[idReal]);
    }
    return acc;
  }, {} as Record<string, any>);

  const breadcrumbs = [
    { title: tipo === 'UHT' ? 'UHT' : 'HTST', href: `/${tipo.toLowerCase()}` },
  ];

  return (
    <AppLayout breadcrumbs={breadcrumbs}>
      <Head title={tipo === 'UHT' ? 'UHT' : 'HTST'} />
      <div className="space-y-4 p-6 py-0">
        <Toast />

        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-foreground">
            Gestión de {tipo}
          </h1>
          <Button
            variant="outline"
            size="sm"
            onClick={() => router.reload()}
          >
            <RefreshCw className="mr-2 h-4 w-4" />
            Actualizar
          </Button>
        </div>

        {/* Dashboard Integrado (Solo para UHT) */}
        {tipo === 'UHT' && (
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            <div className="md:col-span-2 grid grid-cols-2 gap-4">
              {tk42 && (
                <TanqueCardUltraCompact
                  tanque={tk42}
                  nombre="TK 42"
                  onSolicitarAnalisis={(id) => handleSolicitarAnalisis(id, true)}
                  onCambiarEstado={handleCambiarEstado}
                  onEstadoActualizado={() => router.reload()}
                  origenes={origenesArray.filter(o => o.id !== tk42.origen?.id)}
                  etapas={etapas}
                  orpsDisponibles={orpsDisponibles}
                  orpsAlmacen={orpsAlmacenDisponibles}
                  gruposEnvasadoras={gruposEnvasadoras}
                  onProduccionChange={(data) => handleProduccionChange(data, tk42)}
                />
              )}
              {tk41 && (
                <TanqueCardUltraCompact
                  tanque={tk41}
                  nombre="TK 41"
                  onSolicitarAnalisis={(id) => handleSolicitarAnalisis(id, true)}
                  onCambiarEstado={handleCambiarEstado}
                  onEstadoActualizado={() => router.reload()}
                  origenes={origenesArray.filter(o => o.id !== tk41.origen?.id)}
                  etapas={etapas}
                  orpsDisponibles={orpsDisponibles}
                  orpsAlmacen={orpsAlmacenDisponibles}
                  gruposEnvasadoras={gruposEnvasadoras}
                  onProduccionChange={(data) => handleProduccionChange(data, tk41)}
                />
              )}
            </div>
            <div className="md:col-span-3">
              {grupoUhtConfig && tanquesGrupoUht && (
                <EnvasadoraGroup
                  grupo={grupoUhtConfig}
                  tanques={tanquesGrupoUht}
                  onSolicitarAnalisis={(id) => handleSolicitarAnalisis(id, false)}
                  onCambiarEstado={handleCambiarEstado}
                  onPausarORP={handlePausarORP}
                  onCompletarORP={handleCompletarORP}
                />
              )}
            </div>
          </div>
        )}

        <div className={`grid gap-4 ${tipo === 'UHT' ? 'grid-cols-1 lg:grid-cols-3' : 'grid-cols-1 lg:grid-cols-2'}`}>
          {/* Tabla de Pesos */}
          <Card className="min-h-0">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm">Registro de Pesos</CardTitle>
            </CardHeader>
            <CardContent className="p-2">
              <div className="overflow-x-auto">
                <Table className="text-xs">
                  <TableHeader>
                    <TableRow>
                      <TableHead>ORP</TableHead>
                      <TableHead>Producto</TableHead>
                      <TableHead>Prep.</TableHead>
                      <TableHead>Cabezal</TableHead>
                      <TableHead>Peso (g)</TableHead>
                      <TableHead className="w-24">Acciones</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {pesos.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={6} className="text-center text-muted-foreground py-8 text-xs">
                          No hay registros de pesos pendientes.
                        </TableCell>
                      </TableRow>
                    ) : (
                      pesos.map((row) => (
                        <TableRow key={row.id}>
                          <TableCell className="font-medium py-2 px-2 text-xs">{row.orp_codigo || row.codigo || '-'}</TableCell>
                          <TableCell className="py-2 px-2 text-xs">{row.producto_nombre}</TableCell>
                          <TableCell className="py-2 px-2 text-xs">{row.preparacion ?? '-'}</TableCell>
                          <TableCell className="py-2 px-2 text-xs">{row.cabezal}</TableCell>
                          <TableCell className="py-2 px-2 text-xs">
                            {editingPesoId === row.id ? (
                              <Input
                                type="number"
                                step="0.01"
                                value={tempPeso}
                                onChange={(e) => setTempPeso(e.target.value)}
                                className="w-24 h-8"
                                autoFocus
                              />
                            ) : (
                              <span>{row.peso ?? '-'}</span>
                            )}
                          </TableCell>
                          <TableCell>
                            {editingPesoId === row.id ? (
                              <div className="flex gap-1">
                                <Button size="sm" variant="ghost" onClick={() => savePeso(row.id)}>
                                  <Save className="h-4 w-4 text-green-600" />
                                </Button>
                                <Button size="sm" variant="ghost" onClick={cancelEditPeso}>
                                  <X className="h-4 w-4 text-red-600" />
                                </Button>
                              </div>
                            ) : (
                              <Button size="sm" variant="ghost" onClick={() => startEditPeso(row)}>
                                <Pencil className="h-4 w-4" />
                              </Button>
                            )}
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>

          {/* Tabla de Temperaturas (solo UHT) */}
          {tipo === 'UHT' && (
            <Card className="min-h-0">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm">Registro de Temperaturas UHT</CardTitle>
              </CardHeader>
              <CardContent className="p-2">
                <div className="overflow-x-auto">
                  <Table className="text-xs">
                    <TableHeader>
                      <TableRow>
                        <TableHead>ORP</TableHead>
                        <TableHead>Producto</TableHead>
                        <TableHead>Prep.</TableHead>
                        <TableHead>Cabezal</TableHead>
                        <TableHead>Temp (°C)</TableHead>
                        <TableHead className="w-24">Acciones</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {temperaturas.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={6} className="text-center text-muted-foreground py-8 text-xs">
                            No hay registros de temperaturas pendientes.
                          </TableCell>
                        </TableRow>
                      ) : (
                        temperaturas.map((row) => (
                          <TableRow key={row.id}>
                            <TableCell className="font-medium py-2 px-2 text-xs">{row.orp_codigo || row.codigo || '-'}</TableCell>
                            <TableCell className="py-2 px-2 text-xs">{row.producto_nombre}</TableCell>
                            <TableCell className="py-2 px-2 text-xs">{row.preparacion ?? '-'}</TableCell>
                            <TableCell className="py-2 px-2 text-xs">{row.cabezal}</TableCell>
                            <TableCell className="py-2 px-2 text-xs">
                              {editingTempId === row.id ? (
                                <Input
                                  type="number"
                                  step="0.1"
                                  value={tempTemp}
                                  onChange={(e) => setTempTemp(e.target.value)}
                                  className="w-24 h-8"
                                  autoFocus
                                />
                              ) : (
                                <span>{row.tempUHT ?? '-'}</span>
                              )}
                            </TableCell>
                            <TableCell className="py-2 px-2 text-xs">
                              {editingTempId === row.id ? (
                                <div className="flex gap-1">
                                  <Button size="sm" variant="ghost" onClick={() => saveTemp(row.id)}>
                                    <Save className="h-4 w-4 text-green-600" />
                                  </Button>
                                  <Button size="sm" variant="ghost" onClick={cancelEditTemp}>
                                    <X className="h-4 w-4 text-red-600" />
                                  </Button>
                                </div>
                              ) : (
                                <Button size="sm" variant="ghost" onClick={() => startEditTemp(row)}>
                                  <Pencil className="h-4 w-4" />
                                </Button>
                              )}
                            </TableCell>
                          </TableRow>
                        ))
                      )}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Tabla de Vencimientos */}
          <Card className="min-h-0">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm">Registro de Fechas de Vencimiento</CardTitle>
            </CardHeader>
            <CardContent className="p-2">
              <div className="overflow-x-auto">
                <Table className="text-xs">
                  <TableHeader>
                    <TableRow>
                      <TableHead>ORP</TableHead>
                      <TableHead>Producto</TableHead>
                      <TableHead>Prep.</TableHead>
                      <TableHead>Cabezal</TableHead>
                      <TableHead>F. Vencimiento</TableHead>
                      <TableHead className="w-24">Acciones</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {orps_vencimiento.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={6} className="text-center text-muted-foreground py-8 text-xs">
                          No hay ORPs pendientes de fecha de vencimiento.
                        </TableCell>
                      </TableRow>
                    ) : (
                      orps_vencimiento.map((row) => (
                        <TableRow key={row.id}>
                          <TableCell className="font-medium py-2 px-2 text-xs">{row.orp_codigo || row.codigo || '-'}</TableCell>
                          <TableCell className="py-2 px-2 text-xs">{row.producto_nombre}</TableCell>
                          <TableCell className="py-2 px-2 text-xs">{row.preparacion ?? '-'}</TableCell>
                          <TableCell className="py-2 px-2 text-xs">{row.cabezal ?? '-'}</TableCell>
                          <TableCell className="py-2 px-2 text-xs">
                            {editingOrpId === row.id ? (
                              <Input
                                type="date"
                                value={tempFecha}
                                onChange={(e) => setTempFecha(e.target.value)}
                                className="w-40 h-8"
                                autoFocus
                              />
                            ) : (
                              <span>
                                {row.fecha_vencimiento1
                                  ? new Date(row.fecha_vencimiento1).toLocaleDateString('es-ES')
                                  : '-'}
                              </span>
                            )}
                          </TableCell>
                          <TableCell className="py-2 px-2 text-xs">
                            {editingOrpId === row.id ? (
                              <div className="flex gap-1">
                                <Button size="sm" variant="ghost" onClick={() => saveOrp(row.id)}>
                                  <Save className="h-4 w-4 text-green-600" />
                                </Button>
                                <Button size="sm" variant="ghost" onClick={cancelEditOrp}>
                                  <X className="h-4 w-4 text-red-600" />
                                </Button>
                              </div>
                            ) : (
                              <Button size="sm" variant="ghost" onClick={() => startEditOrp(row)}>
                                <Pencil className="h-4 w-4" />
                              </Button>
                            )}
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </div>
        <SolicitudAnalisisModal
          isOpen={analisisModal.isOpen}
          onClose={() => setAnalisisModal(prev => ({ ...prev, isOpen: false }))}
          onConfirm={confirmSolicitarAnalisis}
          tanqueNombre={analisisModal.nombre}
        />
      </div>
    </AppLayout>
  );
}
