import ReporteAmbienteFrio from '@/pdf/ReporteAmbienteFrio';
import {
    closestCorners,
    DndContext,
    DragOverlay,
    PointerSensor,
    TouchSensor,
    useDroppable,
    useSensor,
    useSensors,
} from '@dnd-kit/core';
import {
    arrayMove,
    rectSortingStrategy,
    SortableContext,
    useSortable,
    verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { PDFViewer } from '@react-pdf/renderer';
import axios from 'axios';
import { X } from 'lucide-react';
import { useMemo, useState } from 'react';

import { Button } from '@/components/ui/button';
import AppLayout from '@/layouts/app-layout';
import { Head, router } from '@inertiajs/react';

// ---------- COMPONENTE AUXILIAR: DetalleItem (para lista izquierda) ----------
const DetalleItem = ({
    detalle,
    isDragging,
    listeners,
    attributes,
    setNodeRef,
    style,
}) => {
    return (
        <div
            ref={setNodeRef}
            style={style}
            {...attributes}
            {...listeners}
            className={`touch-none mb-2 cursor-move rounded border border-gray-200 bg-white p-3 shadow-sm transition-all dark:border-gray-700 dark:bg-gray-800 ${
                isDragging ? 'scale-95 opacity-50' : 'opacity-100'
            }`}
        >
            <div className="space-y-1">
                <div className="flex items-start justify-between">
                    <span className="text-sm font-semibold text-gray-800 dark:text-gray-200">
                        ORP: {detalle.orp?.codigo || 'N/A'}
                    </span>
                    <span className="text-sm font-semibold text-gray-800 dark:text-gray-200">
                        Prep:{' '}
                        <span className="font-medium">
                            {detalle.preparacion}
                        </span>
                    </span>
                </div>
                <div className="flex justify-between text-sm">
                    <span className="text-gray-600 dark:text-gray-300">
                        {detalle.orp?.producto_terminado?.nombre_sap || 'N/A'}
                    </span>
                    <span className="text-sm font-semibold text-gray-800 dark:text-gray-200">
                        {detalle.orp?.producto_terminado?.codigo_sap || 'N/A'}
                    </span>
                </div>
                {detalle.estadoPlanta && (
                    <div className="text-xs text-gray-500 dark:text-gray-400">
                        Estado: {detalle.estadoPlanta.nombre}
                    </div>
                )}
            </div>
        </div>
    );
};

// ---------- COMPONENTE SORTABLE PARA LISTA IZQUIERDA ----------
const SortableDetalleItem = ({ id, detalle }) => {
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging,
    } = useSortable({ id });

    const style = {
        transform: CSS.Translate.toString(transform),
        transition,
    };

    return (
        <DetalleItem
            detalle={detalle}
            isDragging={isDragging}
            listeners={listeners}
            attributes={attributes}
            setNodeRef={setNodeRef}
            style={style}
        />
    );
};

// ---------- COMPONENTE SORTABLE PARA CARDS (columna derecha) ----------
const SortableDetalleCard = ({ detalle, orden, onRemove }) => {
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging,
    } = useSortable({
        id: `card-${detalle.id}`,
    });

    const style = {
        transform: CSS.Translate.toString(transform),
        transition,
    };

    return (
        <div
            ref={setNodeRef}
            style={style}
            {...attributes}
            {...listeners}
            className={`touch-none group relative cursor-move rounded-lg border border-gray-200 bg-white shadow-sm transition-all hover:shadow-md dark:border-gray-700 dark:bg-gray-800 ${
                isDragging ? 'z-50 scale-95 opacity-50' : 'opacity-100'
            }`}
        >
            <div className="absolute -top-2 -left-2 z-10 flex h-6 w-6 items-center justify-center rounded-full bg-blue-600 text-xs font-bold text-white shadow-md">
                {orden}
            </div>
            <div className="p-3 pt-4">
                <div className="mb-2 flex items-start justify-between">
                    <div>
                        <div className="text-xs font-semibold tracking-wide text-gray-500 uppercase dark:text-gray-400">
                            ORP
                        </div>
                        <div className="text-sm font-bold text-gray-800 dark:text-gray-200">
                            {detalle.orp?.codigo || 'N/A'}
                        </div>
                        <div className="text-xs font-semibold tracking-wide text-gray-500 uppercase dark:text-gray-400">
                            {/* Preparación */}
                        </div>
                        <div className="text-sm font-bold text-blue-600 dark:text-blue-400">
                            {detalle.preparacion}
                        </div>
                    </div>
                </div>
                <div className="mb-2">
                    <div className="line-clamp-2 text-xs text-gray-700 dark:text-gray-300">
                        {detalle.orp?.producto_terminado?.nombre_sap || 'N/A'}
                    </div>
                </div>
                <div className="mb-2">
                    <div className="font-mono text-xs text-gray-800 dark:text-gray-200">
                        {detalle.orp?.producto_terminado?.codigo_sap || 'N/A'}
                    </div>
                </div>
                <div className="mt-2 flex items-center justify-between border-t border-gray-100 pt-2 text-xs text-gray-500 dark:border-gray-700 dark:text-gray-400">
                    {detalle.estadoPlanta && (
                        <div className="rounded bg-gray-100 px-2 py-0.5 text-xs dark:bg-gray-700">
                            {detalle.estadoPlanta.etapa?.nombre || 'N/A'}
                        </div>
                    )}
                </div>
            </div>
            {onRemove && (
                <button
                    onClick={(e) => {
                        e.stopPropagation();
                        onRemove(detalle.id);
                    }}
                    className="absolute -top-2 -right-2 z-20 rounded-full bg-red-100 p-1 text-red-600 opacity-0 shadow-lg transition-opacity group-hover:opacity-100 hover:bg-red-200 dark:bg-red-900 dark:text-red-300 dark:hover:bg-red-800"
                    title="Remover detalle"
                >
                    <svg
                        className="h-4 w-4"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                    >
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M6 18L18 6M6 6l12 12"
                        />
                    </svg>
                </button>
            )}
        </div>
    );
};

// ---------- COMPONENTE COLUMNA IZQUIERDA (lista) CON FILTRO Y BUSCADOR ORP ----------
const ListaDetalleColumn = ({
    column,
    detalles,
    isDraggingOver,
    filtroDestino,
    setFiltroDestino,
    // ✨ NUEVO: props para el buscador ORP
    modoBusqueda,
    orpCodigo,
    setOrpCodigo,
    mostrarBuscador,
    setMostrarBuscador,
    buscarOrp,
    salirBusqueda,
}) => {
    const { setNodeRef } = useDroppable({ id: column.id });

    return (
        <div
            ref={setNodeRef}
            className={`w-full rounded-lg border-2 ${column.color} ${
                isDraggingOver
                    ? 'ring-opacity-50 bg-opacity-80 ring-2 ring-primary'
                    : ''
            }`}
        >
            <div className="border-b border-border p-4">
                <div className="flex items-center justify-between">
                    <h3 className="text-lg font-semibold text-foreground">
                        {column.title}
                    </h3>
                    <span className="rounded-full bg-white px-3 py-1 text-sm font-medium text-muted-foreground dark:bg-gray-800">
                        {detalles.length} registros
                    </span>
                </div>

                {/* ✨ NUEVO: Buscador ORP (ocultable) */}
                <div className="mt-3">
                    {!modoBusqueda ? (
                        <button
                            onClick={() => setMostrarBuscador(!mostrarBuscador)}
                            className="text-xs text-blue-600 hover:underline"
                        >
                            {mostrarBuscador
                                ? 'Ocultar búsqueda ORP'
                                : '🔍 Buscar ORP específico'}
                        </button>
                    ) : (
                        <div className="flex items-center gap-2">
                            <span className="text-xs font-medium text-blue-600">
                                Modo búsqueda: {orpCodigo}
                            </span>
                            <button
                                onClick={salirBusqueda}
                                className="text-xs text-red-600 hover:underline"
                            >
                                Salir
                            </button>
                        </div>
                    )}

                    {mostrarBuscador && !modoBusqueda && (
                        <div className="mt-2 flex gap-2">
                            <input
                                type="text"
                                value={orpCodigo}
                                onChange={(e) => setOrpCodigo(e.target.value)}
                                placeholder="Código ORP exacto"
                                className="flex-1 rounded border border-gray-300 px-2 py-1 text-xs dark:border-gray-600 dark:bg-gray-800"
                                onKeyDown={(e) =>
                                    e.key === 'Enter' && buscarOrp()
                                }
                            />
                            <Button
                                onClick={buscarOrp}
                                size="sm"
                                variant="outline"
                                className="text-xs"
                            >
                                Buscar
                            </Button>
                        </div>
                    )}
                </div>

                {/* Filtros de destino (solo visibles si NO estamos en modo búsqueda) */}
                {!modoBusqueda && (
                    <div className="mt-3 flex flex-wrap gap-2">
                        <button
                            onClick={() => setFiltroDestino('todos')}
                            className={`min-w-[70px] flex-1 px-2 py-1.5 text-center text-xs font-medium break-words transition-colors ${
                                filtroDestino === 'todos'
                                    ? 'bg-blue-600 text-white'
                                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700'
                            }`}
                        >
                            Todos
                        </button>
                        <button
                            onClick={() => setFiltroDestino('comercial')}
                            className={`min-w-[70px] flex-1 px-2 py-1.5 text-center text-xs font-medium break-words transition-colors ${
                                filtroDestino === 'comercial'
                                    ? 'bg-blue-600 text-white'
                                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700'
                            }`}
                        >
                            Comercial
                        </button>
                        <button
                            onClick={() => setFiltroDestino('noComercial')}
                            className={`min-w-[70px] flex-1 px-2 py-1.5 text-center text-xs font-medium break-words transition-colors ${
                                filtroDestino === 'noComercial'
                                    ? 'bg-blue-600 text-white'
                                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700'
                            }`}
                        >
                            Desayuno
                        </button>
                    </div>
                )}
            </div>

            <div className="max-h-[60vh] min-h-[400px] space-y-2 overflow-y-auto p-3">
                <SortableContext
                    items={detalles.map((detalle) => detalle.id.toString())}
                    strategy={verticalListSortingStrategy}
                >
                    {detalles.map((detalle) => (
                        <SortableDetalleItem
                            key={detalle.id}
                            id={detalle.id.toString()}
                            detalle={detalle}
                        />
                    ))}
                </SortableContext>
                {detalles.length === 0 && (
                    <div className="py-8 text-center text-muted-foreground">
                        <p className="text-sm">No hay registros</p>
                        <p className="mt-1 text-xs text-muted-foreground opacity-70">
                            {modoBusqueda
                                ? 'La ORP no tiene detalles o no existe'
                                : 'Los detalles disponibles aparecerán aquí'}
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
};

// ---------- COMPONENTE COLUMNA DERECHA (grid) ----------
const GridDetalleColumn = ({ column, detalles, isDraggingOver, onRemove }) => {
    const { setNodeRef } = useDroppable({ id: column.id });

    return (
        <div
            ref={setNodeRef}
            className={`w-full rounded-lg border-2 ${column.color} ${
                isDraggingOver
                    ? 'ring-opacity-50 bg-opacity-80 ring-2 ring-primary'
                    : ''
            }`}
        >
            <div className="border-b border-border p-4">
                <div className="flex items-center justify-between">
                    <h3 className="text-lg font-semibold text-foreground">
                        {column.title}
                    </h3>
                    <div className="flex items-center gap-2">
                        <div className="text-xs text-muted-foreground">
                            Orden de envío: de izquierda a derecha, de arriba
                            hacia abajo
                        </div>
                        <span className="rounded-full bg-white px-3 py-1 text-sm font-medium text-muted-foreground dark:bg-gray-800">
                            {detalles.length} registros
                        </span>
                    </div>
                </div>
            </div>
            <div className="max-h-[70vh] min-h-[400px] overflow-y-auto p-4">
                <SortableContext
                    items={detalles.map((detalle) => `card-${detalle.id}`)}
                    strategy={rectSortingStrategy}
                >
                    <div className="grid grid-cols-6 gap-3">
                        {detalles.map((detalle, index) => (
                            <SortableDetalleCard
                                key={detalle.id}
                                detalle={detalle}
                                orden={index + 1}
                                onRemove={onRemove}
                            />
                        ))}
                    </div>
                </SortableContext>
                {detalles.length === 0 && (
                    <div className="py-12 text-center text-muted-foreground">
                        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-gray-100 dark:bg-gray-800">
                            <svg
                                className="h-8 w-8 text-gray-400"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={1.5}
                                    d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
                                />
                            </svg>
                        </div>
                        <p className="text-sm font-medium">No hay registros</p>
                        <p className="mt-1 text-xs text-muted-foreground opacity-70">
                            Arrastra registros aquí para definir el orden de
                            envío
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
};

// ---------- CONSTANTES ----------
const breadcrumbs = [
    { title: 'Seguimiento Ambiente Frio', href: '#' },
];

const COLUMNS = [
    {
        id: 'disponibles',
        title: 'Detalles',
        color: 'bg-blue-50 border-blue-200 dark:bg-blue-900/20 dark:border-blue-800',
    },
    {
        id: 'seleccionados',
        title: 'Para Ambiente Frío',
        color: 'bg-green-50 border-green-200 dark:bg-green-900/20 dark:border-green-800',
    },
];

// ---------- COMPONENTE PRINCIPAL ----------
export default function AmbienteFrioIndex({ estadosDetalle }) {
    // Estados
    const [selectedDetalles, setSelectedDetalles] = useState([]);
    const [activeId, setActiveId] = useState(null);
    const [activeColumn, setActiveColumn] = useState(null);
    const [mostrarPdf, setMostrarPdf] = useState(false);
    const [datosPdf, setDatosPdf] = useState([]);
    const [filtroDestino, setFiltroDestino] = useState('todos');

    // ✨ NUEVO: Estados para el buscador ORP
    const [modoBusqueda, setModoBusqueda] = useState(false);
    const [resultadosBusqueda, setResultadosBusqueda] = useState([]);
    const [orpCodigo, setOrpCodigo] = useState('');
    const [mostrarBuscador, setMostrarBuscador] = useState(false);

    // Todos los detalles originales
    const allDetalles = estadosDetalle || [];

    // Detalles disponibles derivados (sin modo búsqueda)
    const availableDetalles = useMemo(() => {
        let filtrados = allDetalles;

        if (filtroDestino === 'comercial') {
            filtrados = filtrados.filter((detalle) => {
                const destino =
                    detalle.orp?.producto_terminado?.destino?.nombre || '';
                return destino.toLowerCase().includes('comercial');
            });
        } else if (filtroDestino === 'noComercial') {
            filtrados = filtrados.filter((detalle) => {
                const destino =
                    detalle.orp?.producto_terminado?.destino?.nombre || '';
                return !destino.toLowerCase().includes('comercial');
            });
        }

        const selectedIds = new Set(selectedDetalles.map((d) => d.id));
        return filtrados.filter((detalle) => !selectedIds.has(detalle.id));
    }, [allDetalles, selectedDetalles, filtroDestino]);

    // ✨ NUEVO: Detalles a mostrar en la columna izquierda (modo búsqueda o normal)
    const detallesIzquierda = useMemo(() => {
        let base = modoBusqueda ? resultadosBusqueda : availableDetalles;

        // Siempre excluir los seleccionados
        const selectedIds = new Set(selectedDetalles.map((d) => d.id));
        base = base.filter((d) => !selectedIds.has(d.id));

        // Si NO estamos en modo búsqueda, aplicar filtro de destino
        if (!modoBusqueda) {
            if (filtroDestino === 'comercial') {
                base = base.filter((d) => {
                    const destino =
                        d.orp?.producto_terminado?.destino?.nombre || '';
                    return destino.toLowerCase().includes('comercial');
                });
            } else if (filtroDestino === 'noComercial') {
                base = base.filter((d) => {
                    const destino =
                        d.orp?.producto_terminado?.destino?.nombre || '';
                    return !destino.toLowerCase().includes('comercial');
                });
            }
        }
        return base;
    }, [
        modoBusqueda,
        resultadosBusqueda,
        availableDetalles,
        selectedDetalles,
        filtroDestino,
    ]);

    const sensors = useSensors(
        useSensor(PointerSensor, {
            activationConstraint: { distance: 5 },
        }),
        useSensor(TouchSensor, {
            activationConstraint: {
                delay: 200,
                tolerance: 5,
            },
        }),
    );

    // Drag handlers
    const handleDragStart = (event) => {
        setActiveId(event.active.id);
        const activeIdStr = event.active.id;
        setActiveColumn(
            activeIdStr.startsWith('card-') ? 'seleccionados' : 'disponibles',
        );
    };

    const handleDragEnd = (event) => {
        const { active, over } = event;
        setActiveId(null);
        setActiveColumn(null);
        if (!over) return;

        const activeIdStr = active.id;
        const overId = over.id;

        let activeDetalleId;
        if (activeIdStr.startsWith('card-')) {
            activeDetalleId = parseInt(activeIdStr.replace('card-', ''));
        } else {
            activeDetalleId = parseInt(activeIdStr);
        }

        // Buscar en allDetalles (o resultadosBusqueda si estamos en modo búsqueda)
        const fuente = modoBusqueda ? resultadosBusqueda : allDetalles;
        const activeDetalle = fuente.find((d) => d.id === activeDetalleId);
        if (!activeDetalle) return;

        // Reordenamiento dentro de columna derecha
        if (activeIdStr.startsWith('card-') && overId.startsWith('card-')) {
            const overDetalleId = parseInt(overId.replace('card-', ''));
            if (
                selectedDetalles.some((d) => d.id === activeDetalleId) &&
                selectedDetalles.some((d) => d.id === overDetalleId)
            ) {
                const oldIndex = selectedDetalles.findIndex(
                    (d) => d.id === activeDetalleId,
                );
                const newIndex = selectedDetalles.findIndex(
                    (d) => d.id === overDetalleId,
                );
                if (
                    oldIndex !== -1 &&
                    newIndex !== -1 &&
                    oldIndex !== newIndex
                ) {
                    setSelectedDetalles(
                        arrayMove(selectedDetalles, oldIndex, newIndex),
                    );
                }
            }
            return;
        }

        // Mover de izquierda a derecha
        if (
            !activeIdStr.startsWith('card-') &&
            (overId === 'seleccionados' || overId.startsWith('card-'))
        ) {
            if (selectedDetalles.some((d) => d.id === activeDetalleId)) return;

            let insertIndex = selectedDetalles.length;
            if (overId.startsWith('card-')) {
                const overDetalleId = parseInt(overId.replace('card-', ''));
                const targetIndex = selectedDetalles.findIndex(
                    (d) => d.id === overDetalleId,
                );
                if (targetIndex !== -1) insertIndex = targetIndex;
            }

            const updatedSelected = [...selectedDetalles];
            updatedSelected.splice(insertIndex, 0, activeDetalle);
            setSelectedDetalles(updatedSelected);
            return;
        }

        // Mover de derecha a izquierda
        if (activeIdStr.startsWith('card-')) {
            const isOverLeftColumn =
                overId === 'disponibles' || /^\d+$/.test(overId);
            if (isOverLeftColumn) {
                if (!selectedDetalles.some((d) => d.id === activeDetalleId))
                    return;
                setSelectedDetalles(
                    selectedDetalles.filter((d) => d.id !== activeDetalleId),
                );
                return;
            }
        }
    };

    const handleDragOver = (event) => {
        const { over } = event;
        if (!over) return;
        const overId = over.id;
        if (overId === 'seleccionados' || overId.startsWith('card-')) {
            setActiveColumn('seleccionados');
        } else if (overId === 'disponibles' || /^\d+$/.test(overId)) {
            setActiveColumn('disponibles');
        } else {
            setActiveColumn(null);
        }
    };

    const handleRemoveFromSelected = (id) => {
        setSelectedDetalles(selectedDetalles.filter((d) => d.id !== id));
    };

    const handleRemoveAll = () => {
        setSelectedDetalles([]);
    };

    // ✨ NUEVO: Función para buscar ORP
    const buscarOrp = () => {
        if (!orpCodigo.trim()) return;

        axios
            .post(route('ambiente-frio.buscar-por-orp'), { codigo: orpCodigo })
            .then((response) => {
                setResultadosBusqueda(response.data);
                setModoBusqueda(true);
                setMostrarBuscador(false); // Ocultar el input tras buscar
            })
            .catch((error) => {
                console.error('Error al buscar ORP:', error);
                alert('No se encontró la ORP o hubo un error');
            });
    };

    // ✨ NUEVO: Salir del modo búsqueda
    const salirBusqueda = () => {
        setModoBusqueda(false);
        setResultadosBusqueda([]);
        setOrpCodigo('');
        setMostrarBuscador(false);
    };

    const handleSubmit = () => {
        const dataToSend = selectedDetalles.map((detalle, index) => {
            const orp = detalle.orp || {};
            const producto = orp.producto_terminado || {};
            return {
                id: detalle.id,
                orden: index + 1,
                orp_codigo: orp.codigo || 'N/A',
                preparacion: detalle.preparacion || 'N/A',
                orp_codigo_preparacion:
                    `${orp.codigo || 'N/A'} - ${detalle.preparacion || ''}`.trim(),
                fecha_vencimiento1: orp.fecha_vencimiento1 || null,
                producto_nombre: producto.nombre_sap || 'N/A',
                producto_codigo: producto.codigo_sap || 'N/A',
                cantidad: detalle.cantidad || 0,
                orp_id: detalle.orp_id || orp.id,
                estado_planta_id: detalle.estado_planta_id,
                etapa: detalle.estadoPlanta?.etapa?.nombre || 'Envasando',
                destino_nombre: producto.destino?.nombre || '',
            };
        });

        setDatosPdf(dataToSend);
        setMostrarPdf(true);

        axios
            .post(route('ambiente-frio.confirmar'), {
                selectedDetalles: dataToSend,
            })
            .then((response) => {
                console.log('✅ Confirmación exitosa', response.data);
            })
            .catch((error) => {
                console.error('❌ Error al confirmar:', error);
                if (error.response) {
                    alert(
                        `Error ${error.response.status}: ${error.response.data.message || 'Error al confirmar'}`,
                    );
                } else if (error.request) {
                    alert(
                        'No se pudo conectar con el servidor. Verifica tu conexión.',
                    );
                } else {
                    alert('Error inesperado. Intenta de nuevo.');
                }
                setMostrarPdf(false);
            });
    };

    const activeDetalle = activeId
        ? (modoBusqueda ? resultadosBusqueda : allDetalles).find((d) => {
              const id = activeId.startsWith('card-')
                  ? parseInt(activeId.replace('card-', ''))
                  : parseInt(activeId);
              return d.id === id;
          })
        : null;

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Seguimiento - Ambiente Frío" />
            <div className="space-y-6 p-6">
                {/* Header */}


                {/* Tablero DnD */}
                <div className="rounded-lg border border-border bg-background shadow-sm">
                    <DndContext
                        sensors={sensors}
                        collisionDetection={closestCorners}
                        onDragStart={handleDragStart}
                        onDragOver={handleDragOver}
                        onDragEnd={handleDragEnd}
                    >
                        <div className="p-6">
                            <div className="grid grid-cols-1 gap-6 lg:grid-cols-4">
                                {/* Columna izquierda con filtro y buscador */}
                                <div className="lg:col-span-1">
                                    <ListaDetalleColumn
                                        column={COLUMNS[0]}
                                        detalles={detallesIzquierda}
                                        isDraggingOver={
                                            activeColumn === 'disponibles'
                                        }
                                        filtroDestino={filtroDestino}
                                        setFiltroDestino={setFiltroDestino}
                                        // ✨ NUEVO: props del buscador
                                        modoBusqueda={modoBusqueda}
                                        orpCodigo={orpCodigo}
                                        setOrpCodigo={setOrpCodigo}
                                        mostrarBuscador={mostrarBuscador}
                                        setMostrarBuscador={setMostrarBuscador}
                                        buscarOrp={buscarOrp}
                                        salirBusqueda={salirBusqueda}
                                    />
                                </div>
                                {/* Columna derecha */}
                                <div className="space-y-4 lg:col-span-3">
                                    <GridDetalleColumn
                                        column={COLUMNS[1]}
                                        detalles={selectedDetalles}
                                        isDraggingOver={
                                            activeColumn === 'seleccionados'
                                        }
                                        onRemove={handleRemoveFromSelected}
                                    />
                                    {selectedDetalles.length > 0 && (
                                        <div className="flex gap-3">
                                            <Button
                                                onClick={handleRemoveAll}
                                                variant="outline"
                                                size="sm"
                                                className="flex-1"
                                            >
                                                <svg
                                                    className="mr-2 h-4 w-4"
                                                    fill="none"
                                                    stroke="currentColor"
                                                    viewBox="0 0 24 24"
                                                >
                                                    <path
                                                        strokeLinecap="round"
                                                        strokeLinejoin="round"
                                                        strokeWidth={2}
                                                        d="M6 18L18 6M6 6l12 12"
                                                    />
                                                </svg>
                                                Devolver todos
                                            </Button>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>

                        <DragOverlay>
                            {activeDetalle && (
                                <div className="w-48 rotate-1 transform rounded-lg border-2 border-primary bg-white p-3 opacity-90 shadow-xl dark:bg-gray-800">
                                    <div className="mb-2 flex items-start justify-between">
                                        <div>
                                            <div className="text-xs font-bold text-gray-800 dark:text-gray-200">
                                                {activeDetalle.orp?.codigo ||
                                                    'N/A'}
                                            </div>
                                            <div className="text-xs font-medium text-blue-600 dark:text-blue-400">
                                                Prep:{' '}
                                                {activeDetalle.preparacion}
                                            </div>
                                        </div>
                                    </div>
                                    <p className="truncate text-xs text-gray-600 dark:text-gray-300">
                                        {
                                            activeDetalle.orp
                                                ?.producto_terminado?.nombre_sap
                                        }
                                    </p>
                                </div>
                            )}
                        </DragOverlay>
                    </DndContext>
                </div>

                {/* Panel de acciones */}
                <div className="rounded-lg border border-border bg-background p-6">
                    <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
                        <div></div>
                        <div className="flex flex-col gap-3 sm:flex-row">
                            <Button
                                onClick={handleSubmit}
                                disabled={selectedDetalles.length === 0}
                                className={
                                    selectedDetalles.length === 0
                                        ? 'cursor-not-allowed opacity-50'
                                        : ''
                                }
                            >
                                <svg
                                    className="mr-2 h-4 w-4"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M5 13l4 4L19 7"
                                    />
                                </svg>
                                Confirmar orden de envío
                            </Button>
                            <Button
                                onClick={handleRemoveAll}
                                variant="outline"
                                disabled={selectedDetalles.length === 0}
                            >
                                Limpiar selección
                            </Button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Modal PDF */}
            {mostrarPdf && datosPdf.length > 0 && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80">
                    <div className="relative h-[95vh] w-[95vw] overflow-hidden rounded-lg bg-white shadow-2xl">
                        <button
                            className="absolute top-4 right-4 z-50 flex h-8 w-8 items-center justify-center rounded-full bg-red-600 text-white hover:bg-red-700"
                            onClick={() => {
                                setMostrarPdf(false);
                                router.reload();
                            }}
                            aria-label="Cerrar"
                        >
                            <X className="h-5 w-5" />
                        </button>
                        <div className="absolute top-0 right-0 left-0 z-40 flex items-center justify-between bg-gray-100 px-4 py-3">
                            <div>
                                <h3 className="text-lg font-semibold text-gray-800">
                                    Reporte de Selección - Ambiente Frío
                                </h3>
                                <p className="text-sm text-gray-600">
                                    {datosPdf.length} registro(s) seleccionados
                                </p>
                            </div>
                            <div className="flex items-center gap-2">
                                <span className="text-sm text-gray-500">
                                    Presiona ESC para cerrar
                                </span>
                            </div>
                        </div>
                        <div className="h-full pt-14">
                            <PDFViewer
                                style={{
                                    width: '100%',
                                    height: '100%',
                                    border: 'none',
                                }}
                            >
                                <ReporteAmbienteFrio datos={datosPdf} />
                            </PDFViewer>
                        </div>
                    </div>
                </div>
            )}
        </AppLayout>
    );
}
