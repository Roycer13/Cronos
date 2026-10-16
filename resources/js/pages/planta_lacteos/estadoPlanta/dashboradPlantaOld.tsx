import React, { useState, useEffect } from 'react';
import { Head, usePage, router } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import TanqueRowCard from '@/components/TanqueRowCard';
import EnvasadoraGroup from '@/components/EnvasadoraGroup';
import { useAutoRefresh } from '@/hooks/useAutoRefresh';
import { AutoRefreshPanelCompact as AutoRefreshPanel } from '@/components/AutoRefreshCompact';
import { salas, salaPorOrigenId } from '@/config/salasLayout';
import { gruposEnvasadoras, envasadoraIdMap } from '@/config/tanquesLayout';
import { type BreadcrumbItem } from '@/types';
import { route } from 'ziggy-js';
import { Toast } from '@/components/ui/toast';
import SolicitudAnalisisModal from '@/components/SolicitudAnalisisModal';

const breadcrumbs: BreadcrumbItem[] = [{ title: 'Estados de Planta (Salas)', href: '/estados-planta/salas' }];

interface PageProps extends Record<string, any> {
  origenes: Record<string, any>;
  flash?: any;
  procesos?: Array<{ id: number; nombre: string }>;
  etapas?: Array<{ id: number; nombre: string }>;
  orps?: any[];
  orps_almacen?: any[];
}

interface Orp {
  id: number;
  codigo: string;
  nombre_sap?: string;
  lote?: string;
  productoTerminado?: { codigo_sap: string; nombre: string; lote?: string };
}

interface Estado {
  id: number;
  nombre: string;
}

export default function DashboardPlantaSalas() {
  const { props } = usePage<PageProps>();
  const origenes = props.origenes || {};

  const [etapas, setEtapas] = useState<Estado[]>([]);
  const [orpsDisponibles, setOrpsDisponibles] = useState<Orp[]>([]);
  const [orpsAlmacen, setOrpsAlmacen] = useState<Orp[]>([]);
  const [analisisModal, setAnalisisModal] = useState({
    isOpen: false,
    id: 0,
    nombre: '',
  });

  const {
    lastUpdated,
    isRefreshing,
    autoRefreshInterval,
    setAutoRefreshInterval,
    refreshData,
  } = useAutoRefresh({
    initialInterval: 300,
    only: ['origenes', 'orps', 'orps_almacen', 'etapas'],
  });

  useEffect(() => {
    const cargarDatos = () => {
      try {
        if (props.orps && props.orps.length > 0) {
          const orpsFormateadas = props.orps.map((orp: any) => {
            const productoData = orp.producto_terminado || orp.productoTerminado || orp.producto;
            return {
              id: orp.id,
              codigo: orp.codigo,
              lote: orp.lote || 'N/A',
              nombre_sap: orp.nombre_sap || productoData?.nombre_sap || 'Sin producto',
              productoTerminado: productoData
                ? {
                    codigo_sap: productoData.codigo_sap || '',
                    nombre: productoData.nombre_sap || productoData.nombre || 'Sin producto',
                    lote: productoData.lote || 'N/A',
                  }
                : undefined,
            };
          });
          setOrpsDisponibles(orpsFormateadas);
        }

        if (props.orps_almacen && props.orps_almacen.length > 0) {
          const orpsAlmacenFormateadas = props.orps_almacen.map((orp: any) => {
            const productoData = orp.producto_terminado || orp.productoTerminado || orp.producto;
            return {
              id: orp.id,
              codigo: orp.codigo,
              lote: orp.lote || 'N/A',
              nombre_sap: orp.nombre_sap || productoData?.nombre_sap || 'Sin producto',
              productoTerminado: productoData
                ? {
                    codigo_sap: productoData.codigo_sap || '',
                    nombre: productoData.nombre_sap || productoData.nombre || 'Sin producto',
                    lote: productoData.lote || 'N/A',
                  }
                : undefined,
            };
          });
          setOrpsAlmacen(orpsAlmacenFormateadas);
        }

        if (props.etapas && props.etapas.length > 0) {
          setEtapas(props.etapas);
        } else {
          setEtapas([
            { id: 30, nombre: 'Mezcla' },
            { id: 31, nombre: 'Pasteurizado' },
            { id: 32, nombre: 'Inoculacion' },
            { id: 33, nombre: 'Antes de Corte' },
            { id: 34, nombre: 'Despues de Corte' },
            { id: 35, nombre: 'Saborizacion' },
            { id: 36, nombre: 'Envasando' },
          ]);
        }
      } catch (error) {
        console.error('Error cargando datos:', error);
      }
    };
    cargarDatos();
  }, [props.orps, props.orps_almacen, props.etapas]);

  // ✅ CORRECCIÓN: mantener todas las propiedades del origen (incluyendo 'detalles')
  const origenesArray: any[] = Object.values(origenes)
    .filter((origen: any) => origen?.origen?.id)
    .map((origen: any) => ({
      ...origen, // ← Importante: conserva 'detalles', 'analisis_linea', etc.
      id: origen.origen.id,
      alias: origen.origen.alias,
      descripcion: origen.origen.descripcion || `Tanque ${origen.origen.alias}`,
    }));

  // ========================
  // MANEJADORES (igual que en dashboard completo)
  // ========================

  const handleSolicitarAnalisis = (id: number, skipModal: boolean = false) => {
    if (skipModal) {
      router.post(route('estados-planta.solicitar-analisis', id), { peso: 0 }, {
        preserveScroll: true,
        onSuccess: () => router.reload({ only: ['origenes'] }),
      });
      return;
    }
    const origen = origenesArray.find(o => o.id === id);
    setAnalisisModal({ isOpen: true, id, nombre: origen?.alias || `Equipo ${id}` });
  };

  const confirmSolicitarAnalisis = (peso: number) => {
    router.post(route('estados-planta.solicitar-analisis', analisisModal.id), { peso }, {
      preserveScroll: true,
      onSuccess: () => {
        setAnalisisModal(prev => ({ ...prev, isOpen: false }));
        router.reload({ only: ['origenes'] });
      },
    });
  };

  const handleCompletarORP = (orpId: number) => {
    if (confirm('¿Completar ORP? Se cambiará su estado a Completado.')) {
      router.post(route('orps.completar', orpId), {}, {
        preserveScroll: true,
        onSuccess: () => router.reload(),
      });
    }
  };

  const handlePausarORP = (orpId: number) => {
    if (confirm('¿Pausar ORP? Se cambiará su estado a Pausada.')) {
      router.post(route('orps.pausar', orpId), {}, {
        preserveScroll: true,
        onSuccess: () => router.reload(),
      });
    }
  };

  const handleCambiarEstado = (origenId: number, proceso: string) => {
    if (confirm(`¿Cambiar a estado ${proceso}?`)) {
      const procesoMap: Record<string, number> = {
        'Vacio Limpio': 24,
        'Vacio Sucio': 25,
        Produccion: 26,
        'En Limpieza': 27,
        'En Mantenimiento': 28,
        Almacenando: 29,
      };
      router.post(
        route('dashboardPlanta.store'),
        {
          origen_id: origenId,
          proceso_id: procesoMap[proceso],
          etapa_id: 1,
        },
        {
          preserveScroll: true,
          onSuccess: () => router.reload({ only: ['origenes'] }),
          onError: () => alert('Error al cambiar el estado.'),
        }
      );
    }
  };

  const handleProduccionChange = async (data: any, tanque: any) => {
    // Pasteurización
    if (data.pasteurizador_id && data.origen_id) {
      router.post(
        route('estados-planta.store'),
        {
          pasteurizador_id: data.pasteurizador_id,
          origen_id: data.origen_id,
          proceso_id: 26,
          etapa_id: data.etapa_id,
          detalles: data.detalles.map((detalle: any) => ({
            orp_id: detalle.orp_id,
            preparacion: detalle.preparacion,
            cantidad: detalle.cantidad,
          })),
          observaciones: `Pasteurización desde ${tanque.origen?.alias} hacia ${data.origen_id}`,
        },
        {
          preserveScroll: true,
          onSuccess: () => router.reload({ only: ['origenes'] }),
          onError: (errors) => alert('Error al procesar la pasteurización'),
        }
      );
      return;
    }

    // Envasado múltiple
    if (data.cabezales_ids && data.cabezales_ids.length > 0) {
      try {
        for (const cabezalId of data.cabezales_ids) {
          await new Promise((resolve, reject) => {
            router.post(
              route('estados-planta.store'),
              {
                origen_id: cabezalId,
                proceso_id: 26,
                etapa_id: data.etapa_id,
                detalles: data.detalles.map((detalle: any) => ({
                  orp_id: detalle.orp_id,
                  preparacion: detalle.preparacion,
                  cantidad: detalle.cantidad,
                })),
                observaciones: `Producción en ${data.grupo_nombre || 'grupo'} - Movida desde ${tanque.origen?.alias}`,
              },
              {
                preserveScroll: true,
                onSuccess: () => resolve(true),
                onError: (errors) => reject(errors),
              }
            );
          });
        }
        router.reload();
      } catch (error) {
        alert('Error al crear producción en cabezales.');
      }
      return;
    }

    // Mover a un tanque destino
    if (data.origen_id) {
      router.post(
        route('estados-planta.store'),
        {
          origen_id: data.origen_id,
          proceso_id: 26,
          etapa_id: data.etapa_id,
          detalles: data.detalles,
          observaciones: `Producción movida desde ${tanque.origen?.alias}`,
        },
        {
          preserveScroll: true,
          onSuccess: () => router.reload({ only: ['origenes'] }),
          onError: (errors) => alert('Error al mover producción.'),
        }
      );
      return;
    }

    // Nueva producción
    if (data.esNuevo) {
      router.post(
        route('estados-planta.store'),
        {
          origen_id: tanque.origen?.id,
          proceso_id: 26,
          etapa_id: data.etapa_id,
          detalles: data.detalles,
          observaciones: `Producción iniciada en ${tanque.origen?.alias}`,
        },
        {
          preserveScroll: true,
          onSuccess: () => router.reload(),
          onError: (errors) => alert('Error al crear producción.'),
        }
      );
      return;
    }

    alert('Selecciona un destino válido');
  };

  const handleAlmacenar = (tanque: any, data: any) => {
    if (!data.etapa_id) return alert('Selecciona una etapa');
    if (data.detalles.length === 0) return alert('Agrega al menos una ORP');

    router.post(
      route('estados-planta.store'),
      {
        origen_id: tanque.origen.id,
        proceso_id: 29,
        etapa_id: data.etapa_id,
        detalles: data.detalles.map((d: any) => ({
          orp_id: d.orp_id,
          cantidad: d.cantidad,
          preparacion: 'Almacen',
        })),
        observaciones: `Almacenamiento en ${tanque.origen.alias}`,
      },
      {
        preserveScroll: true,
        onSuccess: () => router.reload(),
        onError: () => alert('Error al almacenar'),
      }
    );
  };

  // Agrupación por salas
  const tanquesPorSala: Record<string, any[]> = {};
  salas.forEach((sala) => { tanquesPorSala[sala.id] = []; });

  Object.values(origenes).forEach((origen: any) => {
    if (!origen?.origen?.id) return;
    const sala = salaPorOrigenId[origen.origen.id];
    if (sala) tanquesPorSala[sala.id].push(origen);
  });

  const gruposConTanques = gruposEnvasadoras
    .map((grupo) => ({
      ...grupo,
      tanques: grupo.envasadoras.reduce((acc, alias) => {
        const grupoMap = envasadoraIdMap[grupo.id];
        const idReal = grupoMap ? grupoMap[alias] : null;
        if (idReal && origenes[idReal]) acc[alias] = origenes[idReal];
        return acc;
      }, {} as Record<string, any>),
    }))
    .filter((grupo) => Object.keys(grupo.tanques).length > 0);

  return (
    <AppLayout breadcrumbs={breadcrumbs}>
      <div className="p-2 sm:p-3 space-y-2 sm:space-y-3">
        <Head title="Dashboard Planta - Vista por Salas" />
        <Toast />
        <AutoRefreshPanel
          lastUpdated={lastUpdated}
          isRefreshing={isRefreshing}
          autoRefreshInterval={autoRefreshInterval}
          onRefresh={refreshData}
          onIntervalChange={setAutoRefreshInterval}
        />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {salas.map((sala) => {
            const tanquesSala = tanquesPorSala[sala.id] || [];
            if (tanquesSala.length === 0) return null;

            const tanquesOrdenados = [
              ...sala.origenIds
                .map((id) => tanquesSala.find((t) => t.origen?.id === id))
                .filter(Boolean),
              ...tanquesSala.filter((t) => !sala.origenIds.includes(t.origen?.id)),
            ] as any[];

            return (
              <div key={sala.id} className="space-y-2">
                <h2 className="text-lg font-semibold border-b pb-1">{sala.nombre}</h2>
                <div className="space-y-1">
                  {tanquesOrdenados.map((origen: any) => (
                    <TanqueRowCard
                      key={origen.origen.id}
                      tanque={origen}
                      nombre={origen.origen.alias}
                      onSolicitarAnalisis={(id) => handleSolicitarAnalisis(id, true)}
                      onCambiarEstado={handleCambiarEstado}
                      onEstadoActualizado={() => router.reload()}
                      origenes={origenesArray.filter((o) => o.id !== origen.origen.id)}
                      etapas={etapas}
                      orpsDisponibles={orpsDisponibles}
                      orpsAlmacen={orpsAlmacen}
                      gruposEnvasadoras={gruposEnvasadoras}
                      onProduccionChange={(data) => handleProduccionChange(data, origen)}
                      onAlmacenar={(data) => handleAlmacenar(origen, data)}
                    />
                  ))}
                </div>
              </div>
            );
          })}
        </div>

        <div className="space-y-2">
          <h2 className="text-lg font-semibold border-b pb-1">Envasadoras</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {gruposConTanques.map((grupo) => (
              <EnvasadoraGroup
                key={grupo.id}
                grupo={grupo}
                tanques={grupo.tanques}
                onSolicitarAnalisis={(id) => handleSolicitarAnalisis(id, false)}
                onCompletarORP={handleCompletarORP}
                onPausarORP={handlePausarORP}
                onCambiarEstado={handleCambiarEstado}
              />
            ))}
          </div>
        </div>

        <SolicitudAnalisisModal
          isOpen={analisisModal.isOpen}
          onClose={() => setAnalisisModal((prev) => ({ ...prev, isOpen: false }))}
          onConfirm={confirmSolicitarAnalisis}
          tanqueNombre={analisisModal.nombre}
        />
      </div>
    </AppLayout>
  );
}