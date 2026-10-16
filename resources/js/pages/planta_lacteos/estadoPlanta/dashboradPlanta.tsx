import { AutoRefreshPanelCompact as AutoRefreshPanel } from '@/components/AutoRefreshCompact';
import EnvasadoraGroup from '@/components/EnvasadoraGroup';
import SolicitudAnalisisModal from '@/components/SolicitudAnalisisModal';
import TanqueCardUltraCompact from '@/components/TanqueCard';
import { Toast } from '@/components/ui/toast';
import {
    envasadoraIdMap,
    gruposEnvasadoras,
    layoutCompleto,
    tanqueIndividualIdMap,
} from '@/config/tanquesLayout';
import { useAutoRefresh } from '@/hooks/useAutoRefresh';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, router, usePage } from '@inertiajs/react';
import { useEffect, useState } from 'react';
import { route } from 'ziggy-js';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Estados de Planta', href: '/estados-planta' },
];

interface PageProps extends Record<string, any> {
    origenes: Record<string, any>;
    flash?: {
        success?: string;
        error?: string;
        info?: string;
        warning?: string;
        import_result?: any;
    };
    procesos?: Array<{ id: number; nombre: string }>;
    etapas?: Array<{ id: number; nombre: string }>;
    orps?: any[]; // ✅ Agregar orps desde el backend
    orps_almacen?: any[]; // ✅ Agregar orps de almacenamiento
}

interface EstadoPlantaItem {
    id: number;
    tiempo?: string;
    observaciones?: string;
    origen?: { id: number; alias: string; descripcion?: string };
    proceso?: { nombre?: string };
    etapa?: { nombre?: string };
    user?: { name?: string };
    detalles?: any[];
    analisis_linea?: any;
}

interface GrupoEnvasadoras {
    id: string;
    nombre: string;
    gridClass: string;
    orden: number;
    tipo: 'grupo';
    envasadoras: string[];
}

interface PosicionTanque {
    id: string;
    nombre: string;
    gridClass: string;
    orden: number;
    tipo?: 'individual' | 'grupo';
}

interface Orp {
    id: number;
    codigo: string;
    nombre_sap?: string; // 🔽 Agregar esta propiedad
    productoTerminado?: {
        codigo_sap: string;
        nombre: string; // 🔽 Mantener como 'nombre'
    };
}

interface Origen {
    id: number;
    alias: string;
    descripcion?: string;
}

interface Estado {
    id: number;
    nombre: string;
}
//imprimir en consola las orps que vienen desde el backend

export default function DashboardPlantaCompleto() {
    const { props } = usePage<PageProps>();
    const origenes = props.origenes || {};

    const [etapas, setEtapas] = useState<Estado[]>([]);
    const [orpsDisponibles, setOrpsDisponibles] = useState<Orp[]>([]);
    const [orpsAlmacen, setOrpsAlmacen] = useState<Orp[]>([]);
    const [creandoEstados, setCreandoEstados] = useState(false);
    const [progreso, setProgreso] = useState({ actual: 0, total: 0 });
    const [analisisModal, setAnalisisModal] = useState({
        isOpen: false,
        id: 0,
        nombre: '',
    });

    // Auto-refresh hook
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

    // 🔍 DEBUG: Imprimir datos que llegan
    useEffect(() => {
        const cargarDatosModal = () => {
            try {
                if (props.orps && props.orps.length > 0) {
                    // 🎯 FORMATO CORREGIDO - más robusto
                    const orpsFormateadas = props.orps.map((orp: any) => {
                        const productoData =
                            orp.producto_terminado ||
                            orp.productoTerminado ||
                            orp.producto;

                        return {
                            id: orp.id,
                            codigo: orp.codigo,
                            lote: orp.lote / 1 || 'N/A',
                            nombre_sap:
                                orp.nombre_sap ||
                                productoData?.nombre_sap ||
                                'Sin producto',
                            productoTerminado: productoData
                                ? {
                                      codigo_sap: productoData.codigo_sap || '',
                                      nombre:
                                          productoData.nombre_sap ||
                                          productoData.nombre ||
                                          productoData.nombre_comercial ||
                                          'Sin producto',
                                      lote: productoData.lote || 'N/A',
                                  }
                                : undefined,
                        };
                    });

                    setOrpsDisponibles(orpsFormateadas);
                } else {
                    console.warn('⚠️ No hay ORPs disponibles en props.orps');
                }

                if (props.orps_almacen && props.orps_almacen.length > 0) {
                    const orpsAlmacenFormateadas = props.orps_almacen.map((orp: any) => {
                        const productoData =
                            orp.producto_terminado ||
                            orp.productoTerminado ||
                            orp.producto;

                        return {
                            id: orp.id,
                            codigo: orp.codigo,
                            lote: orp.lote / 1 || 'N/A',
                            nombre_sap:
                                orp.nombre_sap ||
                                productoData?.nombre_sap ||
                                'Sin producto',
                            productoTerminado: productoData
                                ? {
                                      codigo_sap: productoData.codigo_sap || '',
                                      nombre:
                                          productoData.nombre_sap ||
                                          productoData.nombre ||
                                          productoData.nombre_comercial ||
                                          'Sin producto',
                                      lote: productoData.lote || 'N/A',
                                  }
                                : undefined,
                        };
                    });

                    setOrpsAlmacen(orpsAlmacenFormateadas);
                } else {
                    console.warn('⚠️ No hay ORPs de almacenamiento en props.orps_almacen');
                }

                // 🎯 CARGAR ETAPAS
                if (props.etapas && props.etapas.length > 0) {
                    setEtapas(props.etapas);
                } else {
                    console.warn('⚠️ No hay etapas disponibles');
                    // 🆕 Datos de ejemplo para etapas si no llegan
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
                console.error('❌ Error crítico cargando datos:', error);
                // 🆕 Datos de emergencia
                setOrpsDisponibles([
                    {
                        id: 1,
                        codigo: 'ORP-001',
                        nombre_sap: 'Leche Entera',
                        productoTerminado: {
                            codigo_sap: 'LECHE001',
                            nombre: 'Leche Entera 1L',
                        },
                    },
                ]);
                setEtapas([
                    { id: 1, nombre: 'Mezcla' },
                    { id: 2, nombre: 'Pasteurización' },
                ]);
            }
        };

        cargarDatosModal();
    }, [props.orps, props.orps_almacen, props.etapas]);

    const handleSolicitarAnalisis = (
        id: number,
        skipModal: boolean = false,
    ) => {
        if (skipModal) {
            // Si viene de tanque, enviar directamente con peso 0
            router.post(
                route('estados-planta.solicitar-analisis', id),
                { peso: 0 },
                {
                    preserveScroll: true,
                    onSuccess: () => {
                        // Los cambios se reflejarán tras el reload automático de Inertia
                    },
                },
            );
            return;
        }

        // Buscar el nombre del tanque/envasadora
        const origen = origenesArray.find((o) => o.id === id);
        setAnalisisModal({
            isOpen: true,
            id: id,
            nombre: origen?.alias || `Tanque ${id}`,
        });
    };

    const confirmSolicitarAnalisis = (peso: number) => {
        router.post(
            route('estados-planta.solicitar-analisis', analisisModal.id),
            { peso },
            {
                preserveScroll: true,
                onSuccess: () => {
                    router.reload({ only: ['origenes'] });
                },
            },
        );
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
                    onSuccess: (response) => {
                        // Si el backend devuelve JSON, actualizar el estado local
                        if (response?.data?.orp) {
                            // Actualizar la ORP en el estado local
                            setOrpsDisponibles((prevOrps) =>
                                prevOrps.map((orp) =>
                                    orp.id === orpId
                                        ? { ...orp, ...response.data.orp }
                                        : orp,
                                ),
                            );

                            // Actualizar los orígenes si se proporcionaron
                            if (response.data.origenes_actualizados) {
                                // Refrescar los datos del servidor para orígenes
                                router.reload({ only: ['origenes'] });
                            }
                        } else {
                            // Si no hay respuesta JSON, recargar toda la página
                            router.reload();
                        }
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
                        // Opcional: mostrar un toast de éxito
                        router.reload(); // Recarga los datos para reflejar cambios
                    },
                    onError: (errors) => {
                        console.error('Error al pausar ORP:', errors);
                        alert('Error al pausar la ORP');
                    },
                },
            );
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

            const etapaIdDefault = 1;

            const data = {
                origen_id: origenId,
                proceso_id: procesoMap[proceso],
                etapa_id: etapaIdDefault,
            };

            router.post(route('dashboardPlanta.store'), data, {
                preserveScroll: true,
                onSuccess: () => {
                    router.reload({ only: ['origenes'] });
                },
                onError: (errors) => {
                    console.error('Error al cambiar estado:', errors);
                    alert(
                        'Error al cambiar el estado. Verifica la consola para más detalles.',
                    );
                },
            });
        }
    };

    // Función para manejar producción

    const handleProduccionChange = async (
        data: any,
        tanque: EstadoPlantaItem,
    ) => {
        // Verificar si es pasteurización
        if (data.pasteurizador_id && data.origen_id) {
            // CASO: Pasteurización - crea dos registros
            router.post(
                route('estados-planta.store'),
                {
                    pasteurizador_id: data.pasteurizador_id, // El pasteurizador
                    origen_id: data.origen_id, // El tanque destino
                    proceso_id: 26, // ID de Producción
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
                    onSuccess: () => {
                        router.reload({ only: ['origenes'] });
                    },
                    onError: (errors) => {
                        console.error('Error en pasteurización:', errors);
                        alert('Error al procesar la pasteurización');
                    },
                },
            );
            return;
        }
        if (data.cabezales_ids && data.cabezales_ids.length > 0) {
            // CASO: Mover a múltiples cabezales de envasadoras
            try {
                // Crear un estado planta para CADA cabezal seleccionado de forma secuencial
                for (const cabezalId of data.cabezales_ids) {
                    await new Promise((resolve, reject) => {
                        router.post(
                            route('estados-planta.store'),
                            {
                                origen_id: cabezalId,
                                proceso_id: 26, // ID de Producción
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
                                onSuccess: () => {
                                    console.log(
                                        `✅ Estado planta creado para cabezal ${cabezalId}`,
                                    );
                                    resolve(true);
                                },
                                onError: (errors) => {
                                    console.error(
                                        `❌ Error creando estado planta para cabezal ${cabezalId}:`,
                                        errors,
                                    );
                                    reject(errors);
                                },
                            },
                        );
                    });
                }

                // Recargar solo después de crear TODOS los estados planta
                router.reload();
            } catch (error) {
                console.error('Error al crear producción en cabezales:', error);
                alert(
                    'Error al crear la producción en algunos cabezales. Verifica la consola.',
                );
            }
        } else if (data.origen_id) {
            // CASO: Mover a un solo tanque destino
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
                    onError: (errors) => {
                        console.error('Error al mover producción:', errors);
                        alert('Error al mover la producción.');
                    },
                },
            );
        } else if (data.esNuevo) {
            // CASO: Iniciar producción en el MISMO tanque (tanque vacío)
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
                    onError: (errors) => {
                        console.error('Error al crear producción:', errors);
                        alert('Error al crear la producción.');
                    },
                },
            );
        } else {
            alert('Por favor selecciona un destino válido');
        }
    };

    // Convertir origenes a array CORREGIDO
    const origenesArray: Origen[] = Object.values(origenes)
        .filter(
            (origen: any) =>
                origen &&
                origen.origen &&
                origen.origen.id &&
                origen.origen.alias,
        )
        .map((origen: any) => ({
            ...origen, // 🚀 Mantener todas las propiedades (detalles, analisis_linea, etc)
            id: origen.origen.id,
            alias: origen.origen.alias,
            descripcion:
                origen.origen.descripcion || `Tanque ${origen.origen.alias}`,
        }));

    // 🔍 DEBUG: Imprimir datos procesados

    // Separar elementos individuales y grupos
    const elementosOrdenados = layoutCompleto
        .map((elemento) => {
            if (elemento.tipo === 'grupo') {
                const grupo = elemento as GrupoEnvasadoras;
                return {
                    tipo: 'grupo' as const,
                    config: grupo,
                    tanques: grupo.envasadoras.reduce(
                        (acc, alias) => {
                            const grupoMap = envasadoraIdMap[grupo.id];
                            const idReal = grupoMap ? grupoMap[alias] : null;

                            if (idReal && origenes[idReal]) {
                                acc[alias] = origenes[idReal];
                            }
                            return acc;
                        },
                        {} as Record<string, EstadoPlantaItem>,
                    ),
                };
            } else {
                const config = elemento as PosicionTanque;
                const idReal = tanqueIndividualIdMap[config.id];

                return {
                    tipo: 'individual' as const,
                    config,
                    tanque: idReal ? origenes[idReal] : null,
                };
            }
        })
        .filter((item) =>
            item.tipo === 'grupo'
                ? Object.keys(item.tanques).length > 0
                : item.tanque,
        )
        .sort((a, b) => a.config.orden - b.config.orden);

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <div className="space-y-2 p-2 sm:space-y-3 sm:p-3">
                <Head title="Dashboard Planta - Vista Completa" />

                <Toast />
                <div className="flex-justify flex">
                    {/* Auto-Refresh Panel */}
                    <AutoRefreshPanel
                        lastUpdated={lastUpdated}
                        isRefreshing={isRefreshing}
                        autoRefreshInterval={autoRefreshInterval}
                        onRefresh={refreshData}
                        onIntervalChange={setAutoRefreshInterval}
                    />

                    <div className="text-sm text-muted-foreground">
                        {isRefreshing
                            ? 'Actualizando dashboard...'
                            : `Última actualización: ${lastUpdated.toLocaleTimeString()}`}
                    </div>
                </div>
                {/* Grid principal (responsive para móvil) */}
                <div className="grid auto-rows-min grid-cols-1 gap-1.5 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-7 xl:grid-cols-7">
                    {elementosOrdenados.map((item) => {
                        if (item.tipo === 'grupo') {
                            return (
                                <EnvasadoraGroup
                                    key={item.config.id}
                                    grupo={item.config}
                                    tanques={item.tanques}
                                    onSolicitarAnalisis={(id) =>
                                        handleSolicitarAnalisis(id, false)
                                    }
                                    onCompletarORP={handleCompletarORP}
                                    onPausarORP={handlePausarORP}
                                    onCambiarEstado={handleCambiarEstado} // <-- Aquí
                                />
                            );
                        } else {
                            return (
                                <TanqueCardUltraCompact
                                    key={item.config.id}
                                    tanque={item.tanque}
                                    nombre={item.config.nombre}
                                    className={item.config.gridClass}
                                    onSolicitarAnalisis={(id) =>
                                        handleSolicitarAnalisis(id, true)
                                    }
                                    onCambiarEstado={handleCambiarEstado}
                                    onEstadoActualizado={() => router.reload()}
                                    origenes={origenesArray.filter(
                                        (origen) =>
                                            origen.id !==
                                            item.tanque?.origen?.id,
                                    )}
                                    etapas={etapas}
                                    orpsDisponibles={orpsDisponibles}
                                    gruposEnvasadoras={gruposEnvasadoras}
                                    onProduccionChange={(data) =>
                                        handleProduccionChange(
                                            data,
                                            item.tanque!,
                                        )
                                    }
                                    onAlmacenar={(data) =>
                                        handleProduccionChange(
                                            data,
                                            item.tanque!,
                                        )
                                    }
                                    orpsAlmacen={orpsAlmacen}
                                />
                            );
                        }
                    })}
                </div>
            </div>

            <SolicitudAnalisisModal
                isOpen={analisisModal.isOpen}
                onClose={() =>
                    setAnalisisModal((prev) => ({ ...prev, isOpen: false }))
                }
                onConfirm={confirmSolicitarAnalisis}
                tanqueNombre={analisisModal.nombre}
            />
        </AppLayout>
    );
}
