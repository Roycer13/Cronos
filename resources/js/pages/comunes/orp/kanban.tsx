import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Toast } from '@/components/ui/toast';
import { useAuth } from '@/hooks/useAuth';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, Link, router, usePage } from '@inertiajs/react';
import { Plus, Search, ArrowLeft, Filter } from 'lucide-react';
import { route } from 'ziggy-js';
import { useState, useEffect } from 'react';

// Dnd-kit imports
import {
    DndContext,
    DragEndEvent,
    DragOverEvent,
    DragOverlay,
    DragStartEvent,
    PointerSensor,
    TouchSensor,
    useSensors,
    closestCorners,
    useDroppable,
    useSensor,
} from '@dnd-kit/core';
import {
    SortableContext,
    verticalListSortingStrategy,
} from '@dnd-kit/sortable';

import SortableOrpCard from '@/components/sortableOrpCard';
import { has } from 'lodash';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Órdenes de Producción', href: '/orps' },
    { title: 'Vista Kanban', href: '#' },
];

// --- MAPA DE COLORES RGB (para compatibilidad con navegadores antiguos) ---
const RGB_COLORS: Record<string, string> = {
    'bg-yellow-100': '254,249,195',
    'bg-blue-100': '219,234,254',
    'bg-indigo-100': '224,231,255',
    'bg-orange-100': '255,237,213',
    'bg-red-100': '254,226,226',
    'bg-green-100': '220,252,231',
    'bg-purple-100': '237,233,254',
    'bg-gray-100': '243,244,246',
    'border-yellow-300': '253,224,71',
    'border-blue-300': '147,197,253',
    'border-indigo-300': '165,180,252',
    'border-orange-300': '253,186,116',
    'border-red-300': '252,165,165',
    'border-green-300': '134,239,172',
    'border-purple-300': '196,181,253',
    'border-gray-300': '209,213,219',
    'bg-red-100': '254,226,226',
    'text-red-800': '153,27,27',
    'bg-yellow-100': '254,249,195',
    'text-yellow-800': '133,77,14',
    'bg-green-100': '220,252,231',
    'text-green-800': '22,101,52',
    'text-gray-800': '31,41,55',
};

const getStyleFromClass = (className: string, type: 'bg' | 'border' | 'text' = 'bg'): React.CSSProperties => {
    const rgb = RGB_COLORS[className];
    if (!rgb) return {};
    if (type === 'bg') return { backgroundColor: `rgb(${rgb})` };
    if (type === 'border') return { borderColor: `rgb(${rgb})` };
    return { color: `rgb(${rgb})` };
};

const KANBAN_COLUMNS = [
    {
        id: 'Pendiente',
        title: 'Pendiente',
        className: 'bg-yellow-50 border-yellow-200 dark:bg-yellow-950/30 dark:border-yellow-800/50',
    },
    {
        id: 'Programado',
        title: 'Programado',
        className: 'bg-blue-50 border-blue-200 dark:bg-blue-950/30 dark:border-blue-800/50',
    },
    {
        id: 'En Proceso',
        title: 'En Proceso',
        className: 'bg-indigo-50 border-indigo-200 dark:bg-indigo-950/30 dark:border-indigo-800/50',
    },
    {
        id: 'En Pausa',
        title: 'En Pausa',
        className: 'bg-orange-50 border-orange-200 dark:bg-orange-950/30 dark:border-orange-800/50',
    },
    {
        id: 'Cancelado',
        title: 'Cancelado',
        className: 'bg-red-50 border-red-200 dark:bg-red-950/30 dark:border-red-800/50',
    },
    {
        id: 'Completado',
        title: 'Completado',
        className: 'bg-green-50 border-green-200 dark:bg-green-950/30 dark:border-green-800/50',
    },
    {
        id: 'Liberado',
        title: 'Liberado',
        className: 'bg-purple-50 border-purple-200 dark:bg-purple-950/30 dark:border-purple-800/50',
    },
    {
        id: 'Cerrado',
        title: 'Cerrado',
        className: 'bg-gray-50 border-gray-200 dark:bg-gray-800/30 dark:border-gray-700/50',
    },
];

interface PageProps {
    orps: any[];
    estados: any[];
    lineas: any[]; // ← nuevas líneas desde el backend
    flash: {
        success?: string;
        error?: string;
    };
}

// Componente para cada columna del Kanban
const KanbanColumn = ({
    column,
    orps,
    isDraggingOver
}: {
    column: typeof KANBAN_COLUMNS[0];
    orps: any[];
    isDraggingOver: boolean;
}) => {
    const { setNodeRef } = useDroppable({
        id: column.id,
    });

    return (
        <div
            ref={setNodeRef}
            className={`flex-shrink-0 w-64 rounded-lg border-2 ${column.className || ''} ${isDraggingOver ? 'ring-2 ring-primary ring-opacity-50 bg-opacity-80' : ''}`}
        >
            <div className="p-2 border-b border-border/50 dark:border-border/30">
                <div className="flex justify-between items-center">
                    <h3 className="font-semibold text-sm text-foreground">{column.title}</h3>
                    <span className="text-xs bg-muted/50 dark:bg-muted/30 px-2 py-1 rounded-full text-muted-foreground font-medium border border-border/20 dark:border-border/40">
                        {orps.length}
                    </span>
                </div>
            </div>

            <div className="p-1 space-y-1 min-h-80 overflow-y-auto">
                <SortableContext
                    items={orps.map(orp => orp.id.toString())}
                    strategy={verticalListSortingStrategy}
                >
                    {orps.map((orp) => (
                        <SortableOrpCard key={orp.id} orp={orp} />
                    ))}
                </SortableContext>

                {orps.length === 0 && (
                    <div className="text-center py-6 text-muted-foreground/80 dark:text-muted-foreground/60">
                        <p className="text-xs">No hay ORPs</p>
                        <p className="text-xs mt-1 text-muted-foreground/60 dark:text-muted-foreground/40">
                            Suelta aquí
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default function Kanban() {
    const { props } = usePage<PageProps>();
    const { orps: initialOrps, estados, lineas, flash } = props;

    const { user: authUser, hasPermission } = useAuth();

    const [orps, setOrps] = useState<any[]>(initialOrps || []);
    const [activeId, setActiveId] = useState<string | null>(null);
    const [activeColumn, setActiveColumn] = useState<string | null>(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [filtroLinea, setFiltroLinea] = useState<string>('todos'); // 'todos', 'UHT', 'HTST', etc.

    useEffect(() => {
        setOrps(initialOrps || []);
    }, [initialOrps]);

    // Sensores para scroll en móvil
    const sensors = useSensors(
        useSensor(PointerSensor, {
            activationConstraint: {
                distance: 5,
            },
        }),
        useSensor(TouchSensor, {
            activationConstraint: {
                delay: 200,
                tolerance: 5,
            },
        })
    );
      
    // Función de filtrado combinado
    const filtrarOrps = (orp: any) => {
        // Filtro por texto (código ORP o nombre comercial del producto)
        const matchesSearch = searchTerm === '' ||
            orp.codigo.toLowerCase().includes(searchTerm.toLowerCase()) ||
            (orp.producto_terminado?.nombre_sap?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
            (orp.producto_terminado?.nombre_comercial?.toLowerCase() || '').includes(searchTerm.toLowerCase());

        // Filtro por línea
        const lineaProducto = orp.producto_terminado?.linea?.nombre?.toLowerCase() || '';
        const matchesLinea =
            filtroLinea === 'todos' ||
            lineaProducto === filtroLinea.toLowerCase();

        return matchesSearch && matchesLinea;
    };

    const getOrpsByStatus = (status: string) => {
        return orps
            .filter(filtrarOrps)
            .filter(orp => {
                const estadoActual = orp.historial_estados?.[0]?.estado?.nombre || 'Pendiente';
                return estadoActual === status;
            });
    };

    const handleDragStart = (event: DragStartEvent) => {
        setActiveId(event.active.id as string);
        const activeOrp = orps.find(orp => orp.id.toString() === event.active.id);
        if (activeOrp) {
            const estadoActual = activeOrp.historial_estados?.[0]?.estado?.nombre || 'Pendiente';
            setActiveColumn(estadoActual);
        }
    };

    const handleDragOver = (event: DragOverEvent) => {
        const { active, over } = event;
        if (!over) return;
        const overId = over.id as string;
        const isOverColumn = KANBAN_COLUMNS.some(col => col.id === overId);
        if (isOverColumn) {
            setActiveColumn(overId);
        }
    };

    const handleDragEnd = async (event: DragEndEvent) => {
        const { active, over } = event;
        setActiveId(null);
        setActiveColumn(null);
        if (!over) return;

        const activeId = active.id as string;
        const overId = over.id as string;

        const activeOrp = orps.find(orp => orp.id.toString() === activeId);
        if (!activeOrp) return;

        let newStatus: string | undefined;

        const targetColumn = KANBAN_COLUMNS.find(col => col.id === overId);
        if (targetColumn) {
            newStatus = targetColumn.id;
        } else {
            const overOrp = orps.find(orp => orp.id.toString() === overId);
            if (overOrp) {
                newStatus = overOrp.historial_estados?.[0]?.estado?.nombre || 'Pendiente';
            }
        }

        if (!newStatus) return;

        const estadoActual = activeOrp.historial_estados?.[0]?.estado?.nombre || 'Pendiente';
        if (estadoActual === newStatus) return;

        try {
            const newEstado = estados.find(e => e.nombre === newStatus);
            if (!newEstado) return;

            const updatedOrps = orps.map(orp =>
                orp.id.toString() === activeId
                    ? {
                        ...orp,
                        historial_estados: [
                            {
                                estado: newEstado,
                                fecha_hora: new Date().toISOString()
                            },
                            ...(orp.historial_estados || [])
                        ]
                    }
                    : orp
            );

            setOrps(updatedOrps);

            await router.post(route('orps.cambiar-estado', activeId), {
                estado_id: newEstado.id,
                usuario_id: authUser.id,
                observaciones: 'Cambio de estado desde Kanban'
            }, {
                preserveScroll: true,
            });

        } catch (error) {
            console.error('Error al cambiar estado:', error);
            setOrps(initialOrps || []);
        }
    };

    const activeOrp = activeId ? orps.find(orp => orp.id.toString() === activeId) : null;

    // Calcular totales para el contador
    const totalFiltrados = orps.filter(filtrarOrps).length;

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Tablero Kanban - ORPs" />
            <div className="px-2 sm:px-4 py-2 space-y-3">
                <Toast />

                {/* Header compacto */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                        <Link href={route('orps.index')}>
                            <Button variant="outline" size="sm">
                                <ArrowLeft className="h-4 w-4" />
                            </Button>
                        </Link>
                        <div>
                            <h1 className="text-lg font-bold text-foreground">Tablero Kanban</h1>
                            <p className="text-xs text-muted-foreground">
                                Total: <span className="font-semibold">{orps.length}</span> ORPs
                                {searchTerm || filtroLinea !== 'todos' ? (
                                    <span className="ml-1">
                                        (filtrados: {totalFiltrados})
                                    </span>
                                ) : null}
                            </p>
                        </div>
                    </div>

                    <div className="flex items-center gap-2">
                        {/* Filtro por línea */}
                        <div className="flex items-center gap-1 bg-muted rounded-md p-1">
                            <Button
                                size="sm"
                                variant={filtroLinea === 'todos' ? 'default' : 'ghost'}
                                onClick={() => setFiltroLinea('todos')}
                                className="h-7 px-2 text-xs"
                            >
                                Todos
                            </Button>
                            {lineas.map(linea => (
                                <Button
                                    key={linea.id}
                                    size="sm"
                                    variant={filtroLinea === linea.nombre ? 'default' : 'ghost'}
                                    onClick={() => setFiltroLinea(linea.nombre)}
                                    className="h-7 px-2 text-xs"
                                >
                                    {linea.nombre}
                                </Button>
                            ))}
                        </div>

                        {/* Buscador */}
                        <div className="relative flex-1 sm:max-w-xs">
                            <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 h-3 w-3 text-muted-foreground" />
                            <Input
                                placeholder="Buscar por código o nombre SAP..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="pl-7 h-8 text-sm"
                            />
                        </div>

                        {hasPermission('c_orp') && (
                            <Link href={route('orps.create')}>
                                <Button size="sm" className="h-8">
                                    <Plus className="h-3 w-3" />
                                    <span className="hidden sm:block ml-1">Nueva ORP</span>
                                </Button>
                            </Link>
                        )}
                    </div>
                </div>

                {/* Tablero Kanban */}
                <div className="bg-background rounded border border-border shadow-sm">
                    <DndContext
                        sensors={sensors}
                        collisionDetection={closestCorners}
                        onDragStart={handleDragStart}
                        onDragOver={handleDragOver}
                        onDragEnd={handleDragEnd}
                    >
                        <div className="p-2">
                            <div
                                className="flex gap-2 overflow-x-auto pb-2"
                                style={{
                                    WebkitOverflowScrolling: 'touch',
                                    scrollbarWidth: 'thin',
                                }}
                            >
                                {KANBAN_COLUMNS.map((column) => (
                                    <KanbanColumn
                                        key={column.id}
                                        column={column}
                                        orps={getOrpsByStatus(column.id)}
                                        isDraggingOver={activeColumn === column.id}
                                    />
                                ))}
                            </div>
                        </div>

                        <DragOverlay>
                            {activeOrp ? (
                                <div className="bg-white dark:bg-gray-800 rounded border border-border p-2 shadow-lg opacity-90 transform rotate-1 max-w-xs">
                                    <div className="flex justify-between items-start mb-1">
                                        <span className="font-mono text-xs font-bold text-foreground">
                                            {activeOrp.codigo}
                                        </span>
                                        {activeOrp.prioridad && (
                                            <span
                                                className={`text-xs px-1.5 py-0.5 rounded-full ${
                                                    activeOrp.prioridad === 'alta'
                                                        ? 'bg-red-100 text-red-800 dark:bg-red-900/50 dark:text-red-200'
                                                        : activeOrp.prioridad === 'media'
                                                        ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/50 dark:text-yellow-200'
                                                        : 'bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-200'
                                                }`}
                                            >
                                                {activeOrp.prioridad.charAt(0).toUpperCase()}
                                            </span>
                                        )}
                                    </div>
                                    <p className="text-xs font-medium text-foreground truncate">
                                        {activeOrp.producto_terminado?.nombre_comercial}
                                    </p>
                                    <p className="text-xs text-muted-foreground mt-0.5">
                                        Lote: {activeOrp.lote} | Línea: {activeOrp.producto_terminado?.linea?.nombre || 'N/A'}
                                    </p>
                                </div>
                            ) : null}
                        </DragOverlay>
                    </DndContext>
                </div>
            </div>
        </AppLayout>
    );
}