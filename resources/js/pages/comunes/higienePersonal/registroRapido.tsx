import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Toast } from '@/components/ui/toast';
import { useAuth } from '@/hooks/useAuth';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, router, useForm, usePage } from '@inertiajs/react';

import {
    AlertCircle,
    ArrowLeft,
    Building,
    Check,
    CheckCircle,
    Clock,
    Info,
    Loader2,
    Save,
    Search,
    User,
    Users,
    UserX,
    X,
    XCircle,
} from 'lucide-react';
import { useMemo, useState } from 'react';
import { route } from 'ziggy-js';

import { Checkbox } from '@/components/ui/checkbox';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from '@/components/ui/popover';
import { Separator } from '@/components/ui/separator';
import { Textarea } from '@/components/ui/textarea';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Módulos Comunes', href: '/modulos-comunes' },
    { title: 'Higiene Personal', href: '/modulos-comunes/higiene-personal' },
    {
        title: 'Registro Rápido',
        href: '/modulos-comunes/higiene-personal/registro-rapido',
    },
];

interface Empleado {
    id: number;
    name: string;
    apellido: string;
    codigo: number;
    cargo: string;
    turno: string;
    area?: {
        id: number;
        nombre: string;
    };
}

interface PageProps {
    empleados: Empleado[];
    areas: Array<{ id: number; nombre: string }>;
    turnos: string[];
    flash: {
        success?: string;
        error?: string;
    };
}

const popoverInfo = {
    uniforme: {
        title: 'Uniforme limpio, completo y en buen estado',
        items: [
            '• Verificar uniforme adecuado y limpio (Camisa, pantalón, botas, barbijo calatrava y mangas) ',
            
        ],
    },
    limpieza: {
        title: 'Higiene personal',
        items: [
            '•  Verificar higiene (Manos, uñas, cabello, sin maquillaje) ',
        ],
    },
    lavado_manos: {
        title: 'Lavado de manos ',
        items: [
            '• Verificar que las manos estén limpias y lavadas ',
        ],
    },
    salud: {
        title: 'Estado de Salud',
        items: [
            '• Sin síntomas de enfermedad',
            '• Sin heridas expuestas',
            '• Estado de ánimo adecuado',
            '• Capacidad para realizar tareas',
        ],
    },
    epp: {
        title: 'EPP Correcto',
        items: [
            '• Casco/gorro de uso obligatorio',
            '• Lentes de seguridad (si aplica)',
            '• Guantes adecuados para la tarea',
            '• Calzado de seguridad',
        ],
    },
    objetos: {
        title: 'Sin Objetos Personales',
        items: [
            '• Verificar que no porte objetos personales al ingreso a planta (aretes, anillos, manillas, relojes, monedas y llaves)',
            
        ],
    },
    material_equipo: {
        title: 'Lavado de manos',
        items: [
            '• Herramientas limpias y ordenadas',
            '• Equipo en buen estado',
            '• Área de trabajo organizada',
            '• Sin obstáculos en pasillos',
        ],
    },
};

export default function RegistroRapido() {
    const { props } = usePage();
    const [selectedEmpleado, setSelectedEmpleado] = useState<Empleado | null>(
        null,
    );
    const [formAbierto, setFormAbierto] = useState(false);
    const [busqueda, setBusqueda] = useState('');
    const [filtroArea, setFiltroArea] = useState<string>('');
    const [filtroTurno, setFiltroTurno] = useState<string>('');
    const [loadingConforme, setLoadingConforme] = useState<number | null>(null);
    const [loadingNoConforme, setLoadingNoConforme] = useState<number | null>(
        null,
    );
    const { user: authUser } = useAuth();
    const [loadingNoAsistio, setLoadingNoAsistio] = useState<number | null>(
        null,
    );
    const {
        empleados = [],
        areas = [],
        turnos = [],
        flash,
    } = props as unknown as PageProps;

    const empleadosList: Empleado[] = Array.isArray(empleados)
        ? empleados
        : (Object.values(empleados || []) as Empleado[]);
    const areasList: Array<{ id: number; nombre: string }> = Array.isArray(
        areas,
    )
        ? areas
        : (Object.values(areas || []) as Array<{ id: number; nombre: string }>);
    const turnosList: string[] = Array.isArray(turnos)
        ? turnos
        : (Object.values(turnos || []) as string[]).filter(
              (turno) => turno !== null && turno !== undefined,
          );

    const { data, setData, post, processing, errors, reset } = useForm({
        empleado_id: '',
        uniforme: true,
        limpieza: true,
        lavado_manos: true,
        salud: true,
        epp: true,
        objetos: true,
        material_equipo: false,
        observaciones: '',
        correccion: '',
    });

    // Agrupar empleados por área (incluyendo "Sin Área")
    const empleadosPorArea = useMemo(() => {
        const filtrados = empleadosList.filter((empleado) => {
            const cumpleBusqueda =
                !busqueda ||
                empleado.name.toLowerCase().includes(busqueda.toLowerCase()) ||
                empleado.apellido
                    .toLowerCase()
                    .includes(busqueda.toLowerCase()) ||
                empleado.codigo.toString().includes(busqueda) ||
                (empleado.cargo &&
                    empleado.cargo
                        .toLowerCase()
                        .includes(busqueda.toLowerCase()));

            const areaId = empleado.area?.id;
            const cumpleArea = !filtroArea || areaId?.toString() === filtroArea;
            const cumpleTurno = !filtroTurno || empleado.turno === filtroTurno;

            return cumpleBusqueda && cumpleArea && cumpleTurno;
        });

        const agrupados: { [key: string]: Empleado[] } = {};

        // Inicializar con todas las áreas
        areasList.forEach((area) => {
            agrupados[area.nombre] = [];
        });
        agrupados['Sin Área'] = [];

        // Asignar empleados a sus áreas
        filtrados.forEach((empleado) => {
            const areaNombre = empleado.area?.nombre || 'Sin Área';
            if (!agrupados[areaNombre]) {
                agrupados[areaNombre] = [];
            }
            agrupados[areaNombre].push(empleado);
        });

        // Filtrar áreas vacías si no hay búsqueda
        if (!busqueda && !filtroArea && !filtroTurno) {
            return agrupados;
        } else {
            // Mostrar solo áreas con empleados en búsqueda filtrada
            const resultado: { [key: string]: Empleado[] } = {};
            Object.entries(agrupados).forEach(([area, empleadosArea]) => {
                if (empleadosArea.length > 0) {
                    resultado[area] = empleadosArea;
                }
            });
            return resultado;
        }
    }, [empleados, areas, busqueda, filtroArea, filtroTurno]);

    const coloresAreas = [
        'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800',
        'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800',
        'bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800',
        'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800',
        'bg-purple-50 dark:bg-purple-900/20 border-purple-200 dark:border-purple-800',
        'bg-pink-50 dark:bg-pink-900/20 border-pink-200 dark:border-pink-800',
        'bg-indigo-50 dark:bg-indigo-900/20 border-indigo-200 dark:border-indigo-800',
        'bg-gray-50 dark:bg-gray-900/20 border-gray-200 dark:border-gray-800',
    ];

    const getColorArea = (index: number) => {
        return coloresAreas[index % coloresAreas.length];
    };

    // Función para marcar como CONFORME (directo, sin modal)
    const handleConforme = (empleado: Empleado) => {
        setLoadingConforme(empleado.id);

        router.post(
            route('higiene-personal.store-rapido'),
            {
                empleado_id: empleado.id,
                uniforme: true,
                limpieza: true,
                lavado_manos: true,
                salud: true,
                epp: true,
                objetos: true,
                material_equipo: true,
                observaciones: '',
                correccion: '',
            },
            {
                preserveScroll: true,
                onSuccess: () => {
                    setLoadingConforme(null);
                },
            },
        );
    };

    // Función para abrir modal de NO CONFORME
    const handleNoConforme = (empleado: Empleado) => {
        setSelectedEmpleado(empleado);
        setData({
            empleado_id: empleado.id.toString(),
            uniforme: true,
            limpieza: true,
            lavado_manos: true,
            salud: true,
            epp: true,
            objetos: true,
            material_equipo: false,
            observaciones: '',
            correccion: '',
        });
        setFormAbierto(true);
    };

    const handleNoAsistio = (empleado: Empleado) => {
        setLoadingNoAsistio(empleado.id);
        router.post(
            route('higiene-personal.store-rapido'),
            {
                empleado_id: empleado.id,
                no_asistio: true,
            },
            {
                preserveScroll: true,
                onSuccess: () => setLoadingNoAsistio(null),
                onError: () => setLoadingNoAsistio(null),
            },
        );
    };

    // Función para guardar evaluación NO CONFORME
    const submitNoConforme = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoadingNoConforme(selectedEmpleado?.id || null);

        router.post(
            route('higiene-personal.store-rapido'),
            {
                empleado_id: data.empleado_id,
                uniforme: data.uniforme,
                limpieza: data.limpieza,
                lavado_manos: data.lavado_manos,
                salud: data.salud,
                epp: data.epp,
                objetos: data.objetos,
                material_equipo: data.material_equipo,
                observaciones: data.observaciones,
                correccion: data.correccion,
            },
            {
                preserveScroll: true,
                onSuccess: () => {
                    setFormAbierto(false);
                    setSelectedEmpleado(null);
                    setLoadingNoConforme(null);
                    reset();
                },
            },
        );
    };

    const calcularConforme = () => {
        return (
            data.uniforme &&
            data.limpieza &&
            data.lavado_manos &&
            data.salud &&
            data.epp &&
            data.objetos 
            // data.material_equipo
        );
    };

    const calcularPorcentaje = () => {
        const checks = [
            data.uniforme,
            data.limpieza,
            data.lavado_manos,
            data.salud,
            data.epp,
            data.objetos,
            // data.material_equipo,
        ];
        const cumplidos = checks.filter(Boolean).length;
        return Math.round((cumplidos / 6) * 100);
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Registro Rápido - Higiene Personal" />
            <Toast />
            <div className="space-y-4 px-2 py-4 sm:px-4">
                {/* Header compacto */}
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <h1 className="text-xl font-bold text-foreground">
                            Registro Rápido Higiene Personal
                        </h1>
                        <p className="mt-1 text-sm text-muted-foreground">
                            Evaluación rápida por área y turno
                        </p>
                    </div>

                    <div className="flex flex-wrap gap-2">
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() =>
                                router.get(route('higiene-personal.index'))
                            }
                            className="flex h-9 items-center gap-2"
                        >
                            <ArrowLeft className="h-3.5 w-3.5" />
                            <span className="text-sm">Volver</span>
                        </Button>

                        <div className="flex items-center gap-2 rounded-md bg-muted px-3 py-1.5 text-xs text-muted-foreground">
                            <Users className="h-3.5 w-3.5" />
                            <span>{empleadosList.length} empleados</span>
                        </div>
                    </div>
                </div>

                {/* Filtros compactos */}
                <Card className="p-3">
                    <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
                        <div className="space-y-1.5">
                            <Label htmlFor="busqueda" className="text-xs">
                                Buscar Empleado
                            </Label>
                            <div className="relative">
                                <Search className="absolute top-1/2 left-2.5 h-3.5 w-3.5 -translate-y-1/2 transform text-muted-foreground" />
                                <Input
                                    id="busqueda"
                                    placeholder="Nombre, código, cargo..."
                                    value={busqueda}
                                    onChange={(e) =>
                                        setBusqueda(e.target.value)
                                    }
                                    className="h-9 pl-9 text-sm"
                                />
                            </div>
                        </div>

                        <div className="space-y-1.5">
                            <Label htmlFor="filtroArea" className="text-xs">
                                Filtrar por Área
                            </Label>
                            <select
                                id="filtroArea"
                                value={filtroArea}
                                onChange={(e) => setFiltroArea(e.target.value)}
                                className="h-9 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                            >
                                <option value="">Todas las áreas</option>
                                {areasList.map((area) => (
                                    <option
                                        key={area.id}
                                        value={area.id.toString()}
                                    >
                                        {area.nombre}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div className="space-y-1.5">
                            <Label htmlFor="filtroTurno" className="text-xs">
                                Filtrar por Turno
                            </Label>
                            <select
                                id="filtroTurno"
                                value={filtroTurno}
                                onChange={(e) => setFiltroTurno(e.target.value)}
                                className="h-9 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                            >
                                <option value="">Todos los turnos</option>
                                {turnosList.map((turno) => (
                                    <option key={turno} value={turno}>
                                        {turno}
                                    </option>
                                ))}
                            </select>
                        </div>
                    </div>
                </Card>

                {/* Leyenda compacta */}
                <div className="flex flex-wrap gap-3 rounded-lg bg-muted/30 p-3">
                    <div className="flex items-center gap-2">
                        <div className="h-2.5 w-2.5 rounded-full bg-green-500"></div>
                        <span className="text-xs">Conforme</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="h-2.5 w-2.5 rounded-full bg-red-500"></div>
                        <span className="text-xs">No Conforme</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="h-2.5 w-2.5 rounded-full bg-yellow-500"></div>
                        <span className="text-xs">Pendiente</span>
                    </div>
                </div>

                {/* Áreas en columnas - COMPACTO */}
                <div className="grid w-full grid-cols-1 gap-3 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
                    {Object.entries(empleadosPorArea).map(
                        ([areaNombre, empleadosArea], index) => (
                            <Card
                                key={areaNombre}
                                className={`max-h-[calc(100vh-250px)] overflow-y-auto p-3 ${getColorArea(index)}`}
                            >
                                {/* Header compacto */}
                                <div className="sticky top-0 z-10 bg-inherit pb-2">
                                    <div className="mb-1.5 flex items-center justify-between">
                                        <h3 className="flex items-center gap-1.5 truncate text-sm font-semibold">
                                            <Building className="h-4 w-4 flex-shrink-0" />
                                            <span className="truncate">
                                                {areaNombre}
                                            </span>
                                        </h3>
                                        <Badge
                                            variant="outline"
                                            className="h-5 px-1.5 py-0 text-xs"
                                        >
                                            {empleadosArea.length}
                                        </Badge>
                                    </div>
                                    <Separator />
                                </div>

                                {/* Lista de empleados compacta */}
                                <div className="mt-2 space-y-2">
                                    {empleadosArea.map((empleado) => (
                                        <div
                                            key={empleado.id}
                                            className="flex items-center justify-between rounded p-2 transition-colors hover:bg-white/50 dark:hover:bg-black/20"
                                        >
                                            <div className="min-w-0 flex-1 pr-2">
                                                <div className="truncate text-xs font-medium">
                                                    {empleado.name}{' '}
                                                    {empleado.apellido}
                                                </div>
                                                <div className="truncate text-xs text-muted-foreground">
                                                    {empleado.codigo &&
                                                        `${empleado.codigo} • `}
                                                    {empleado.cargo ||
                                                        'Sin cargo'}
                                                </div>
                                                {empleado.turno && (
                                                    <div className="mt-0.5 flex items-center gap-1">
                                                        <Clock className="h-2.5 w-2.5" />
                                                        <span className="text-xs">
                                                            {empleado.turno}
                                                        </span>
                                                    </div>
                                                )}
                                            </div>
                                            <div className="flex flex-shrink-0 gap-1.5">
                                                {/* Botón NO CONFORME */}
                                                <Button
                                                    size="sm"
                                                    variant="outline"
                                                    className="h-7 w-7 border-red-200 p-0 text-red-600 hover:bg-red-50 hover:text-red-700"
                                                    onClick={() =>
                                                        handleNoConforme(
                                                            empleado,
                                                        )
                                                    }
                                                    title="Marcar como NO CONFORME"
                                                    disabled={
                                                        loadingConforme ===
                                                            empleado.id ||
                                                        loadingNoConforme ===
                                                            empleado.id ||
                                                        loadingNoAsistio ===
                                                            empleado.id
                                                    }
                                                >
                                                    <X className="h-3.5 w-3.5" />
                                                </Button>

                                                {/* Botón CONFORME */}
                                                <Button
                                                    size="sm"
                                                    variant="outline"
                                                    className="h-7 w-7 border-green-200 p-0 text-green-600 hover:bg-green-50 hover:text-green-700"
                                                    onClick={() =>
                                                        handleConforme(empleado)
                                                    }
                                                    title="Marcar como CONFORME"
                                                    disabled={
                                                        loadingConforme ===
                                                            empleado.id ||
                                                        loadingNoConforme ===
                                                            empleado.id ||
                                                        loadingNoAsistio ===
                                                            empleado.id
                                                    }
                                                >
                                                    {loadingConforme ===
                                                    empleado.id ? (
                                                        <Loader2 className="h-3.5 w-3.5 animate-spin" />
                                                    ) : (
                                                        <Check className="h-3.5 w-3.5" />
                                                    )}
                                                </Button>

                                                {/* Botón NO ASISTIÓ */}
                                                <Button
                                                    size="sm"
                                                    variant="outline"
                                                    className="h-7 w-7 border-gray-300 p-0 text-gray-600 hover:bg-gray-50 hover:text-gray-700"
                                                    onClick={() =>
                                                        handleNoAsistio(
                                                            empleado,
                                                        )
                                                    }
                                                    title="Marcar como NO ASISTIÓ"
                                                    disabled={
                                                        loadingConforme ===
                                                            empleado.id ||
                                                        loadingNoConforme ===
                                                            empleado.id ||
                                                        loadingNoAsistio ===
                                                            empleado.id
                                                    }
                                                >
                                                    {loadingNoAsistio ===
                                                    empleado.id ? (
                                                        <Loader2 className="h-3.5 w-3.5 animate-spin" />
                                                    ) : (
                                                        <UserX className="h-3.5 w-3.5" />
                                                    )}
                                                </Button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </Card>
                        ),
                    )}
                </div>

                {/* Si no hay resultados */}
                {Object.keys(empleadosPorArea).length === 0 && (
                    <div className="py-8 text-center">
                        <Users className="mx-auto mb-3 h-12 w-12 text-muted-foreground/50" />
                        <h3 className="mb-1 text-base font-medium text-foreground">
                            No se encontraron empleados
                        </h3>
                        <p className="text-sm text-muted-foreground">
                            {busqueda || filtroArea || filtroTurno
                                ? 'Intenta ajustar los filtros de búsqueda'
                                : 'No hay empleados registrados en esta ubicación'}
                        </p>
                    </div>
                )}
            </div>

            {/* Modal para evaluación NO CONFORME */}
            <Dialog
                open={formAbierto}
                onOpenChange={(open) => {
                    if (!open) {
                        // Solo se ejecuta cuando se intenta cerrar
                        setFormAbierto(false);
                        setSelectedEmpleado(null);
                        setLoadingNoConforme(null);
                        reset();
                    }
                }}
            >
                <DialogContent className="max-h-[85vh] max-w-2xl overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                            <AlertCircle className="h-5 w-5 text-red-600" />
                            Evaluación NO CONFORME
                        </DialogTitle>
                        <DialogDescription>
                            Detalle las no conformidades para{' '}
                            {selectedEmpleado?.name}{' '}
                            {selectedEmpleado?.apellido}
                        </DialogDescription>
                    </DialogHeader>

                    <form onSubmit={submitNoConforme} className="space-y-4">
                        {/* Información del empleado */}
                        {selectedEmpleado && (
                            <div className="rounded-lg bg-muted/30 p-3">
                                <div className="flex items-center gap-3">
                                    <div className="rounded-full bg-primary/10 p-2">
                                        <User className="h-6 w-6 text-primary" />
                                    </div>
                                    <div>
                                        <h4 className="text-sm font-semibold">
                                            {selectedEmpleado.name}{' '}
                                            {selectedEmpleado.apellido}
                                        </h4>
                                        <div className="mt-1 flex flex-wrap gap-1.5">
                                            {selectedEmpleado.codigo && (
                                                <Badge
                                                    variant="outline"
                                                    className="h-5 text-xs"
                                                >
                                                    Código:{' '}
                                                    {selectedEmpleado.codigo}
                                                </Badge>
                                            )}
                                            {selectedEmpleado.cargo && (
                                                <Badge
                                                    variant="outline"
                                                    className="h-5 text-xs"
                                                >
                                                    {selectedEmpleado.cargo}
                                                </Badge>
                                            )}
                                            {selectedEmpleado.turno && (
                                                <Badge
                                                    variant="outline"
                                                    className="h-5 text-xs"
                                                >
                                                    <Clock className="mr-1 h-2.5 w-2.5" />
                                                    {selectedEmpleado.turno}
                                                </Badge>
                                            )}
                                            {selectedEmpleado.area && (
                                                <Badge
                                                    variant="outline"
                                                    className="h-5 text-xs"
                                                >
                                                    <Building className="mr-1 h-2.5 w-2.5" />
                                                    {
                                                        selectedEmpleado.area
                                                            .nombre
                                                    }
                                                </Badge>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Checklist compacto */}
                        <div className="space-y-3">
                            <h3 className="font-medium text-foreground">
                                Checklist de Evaluación
                            </h3>
                            <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-3">
                                {[
                                    { key: 'uniforme', label: 'Uniforme limpio, completo y en buen estado' },
                                    { key: 'limpieza', label: 'Higiene personal' },
                                    { key: 'salud', label: 'Estado de Salud' },
                                    { key: 'epp', label: 'EPP Correcto' },
                                    { key: 'objetos', label: 'Sin Objetos Personales' },
                                    {
                                        key: 'lavado_manos',
                                        label: 'Lavado de manos',
                                    },
                                ].map((item) => (
                                    <div
                                        key={item.key}
                                        className="space-y-2 rounded-md border p-2.5"
                                    >
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center space-x-2">
                                                <Checkbox
                                                    id={item.key}
                                                    checked={
                                                        data[
                                                            item.key as keyof typeof data
                                                        ] as boolean
                                                    }
                                                    onCheckedChange={(
                                                        checked,
                                                    ) =>
                                                        setData(
                                                            item.key as keyof typeof data,
                                                            checked as boolean,
                                                        )
                                                    }
                                                    className="h-4 w-4"
                                                />
                                                <Label
                                                    htmlFor={item.key}
                                                    className="cursor-pointer text-sm font-medium"
                                                >
                                                    {item.label}
                                                </Label>
                                            </div>

                                            <Popover>
                                                <PopoverTrigger asChild>
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        className="h-6 w-6 p-0"
                                                        type="button"
                                                    >
                                                        <Info className="h-3.5 w-3.5" />
                                                    </Button>
                                                </PopoverTrigger>
                                                <PopoverContent className="w-72 p-3 text-sm">
                                                    <div className="space-y-1.5">
                                                        <h4 className="font-semibold">
                                                            {
                                                                popoverInfo[
                                                                    item.key as keyof typeof popoverInfo
                                                                ]?.title
                                                            }
                                                        </h4>
                                                        <ul className="space-y-1">
                                                            {popoverInfo[
                                                                item.key as keyof typeof popoverInfo
                                                            ]?.items.map(
                                                                (
                                                                    point,
                                                                    idx,
                                                                ) => (
                                                                    <li
                                                                        key={
                                                                            idx
                                                                        }
                                                                        className="text-muted-foreground"
                                                                    >
                                                                        {point}
                                                                    </li>
                                                                ),
                                                            )}
                                                        </ul>
                                                    </div>
                                                </PopoverContent>
                                            </Popover>
                                        </div>

                                        <div
                                            className={`h-1 rounded-full ${data[item.key as keyof typeof data] ? 'bg-green-500' : 'bg-red-500'}`}
                                        />
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Observaciones y correcciones */}
                        <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                            <div className="space-y-1.5">
                                <Label
                                    htmlFor="observaciones"
                                    className="text-sm"
                                >
                                    Observaciones
                                </Label>
                                <Textarea
                                    id="observaciones"
                                    value={data.observaciones}
                                    onChange={(e) =>
                                        setData('observaciones', e.target.value)
                                    }
                                    placeholder="Describa las no conformidades encontradas..."
                                    rows={2}
                                    className="resize-none text-sm"
                                />
                            </div>

                            <div className="space-y-1.5">
                                <Label htmlFor="correccion" className="text-sm">
                                    Acción Correctiva
                                </Label>
                                <Textarea
                                    id="correccion"
                                    value={data.correccion}
                                    onChange={(e) =>
                                        setData('correccion', e.target.value)
                                    }
                                    placeholder="Describa las acciones correctivas..."
                                    rows={2}
                                    className="resize-none text-sm"
                                />
                            </div>
                        </div>

                        {/* Resultado de evaluación */}
                        <div className="rounded-lg bg-muted/30 p-3">
                            <div className="flex items-center justify-between">
                                <div>
                                    <h4 className="mb-1.5 text-sm font-medium">
                                        Resultado de Evaluación
                                    </h4>
                                    <div className="flex items-center gap-2">
                                        <Badge
                                            variant={
                                                calcularConforme()
                                                    ? 'default'
                                                    : 'destructive'
                                            }
                                            className={`px-3 py-1 text-sm ${
                                                calcularConforme()
                                                    ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
                                                    : 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'
                                            }`}
                                        >
                                            {calcularConforme() ? (
                                                <>
                                                    <CheckCircle className="mr-1 h-3.5 w-3.5" />
                                                    CONFORME
                                                </>
                                            ) : (
                                                <>
                                                    <XCircle className="mr-1 h-3.5 w-3.5" />
                                                    NO CONFORME
                                                </>
                                            )}
                                        </Badge>
                                        <span className="text-xs text-muted-foreground">
                                            (
                                            {
                                                [
                                                    data.uniforme,
                                                    data.limpieza,
                                                    data.salud,
                                                    data.epp,
                                                    data.objetos,
                                                    data.material_equipo,
                                                ].filter(Boolean).length
                                            }
                                            /6)
                                        </span>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <p className="text-xs text-muted-foreground">
                                        Cumplimiento
                                    </p>
                                    <div className="flex items-center gap-2">
                                        <div className="h-2 w-24 overflow-hidden rounded-full bg-muted">
                                            <div
                                                className={`h-2 rounded-full transition-all duration-300 ${
                                                    calcularPorcentaje() >= 80
                                                        ? 'bg-green-500'
                                                        : calcularPorcentaje() >=
                                                            60
                                                          ? 'bg-yellow-500'
                                                          : 'bg-red-500'
                                                }`}
                                                style={{
                                                    width: `${calcularPorcentaje()}%`,
                                                }}
                                            />
                                        </div>
                                        <span className="text-lg font-bold">
                                            {calcularPorcentaje()}%
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <DialogFooter className="pt-3">
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => setFormAbierto(false)}
                                disabled={loadingNoConforme !== null}
                                className="h-9"
                            >
                                Cancelar
                            </Button>
                            <Button
                                type="submit"
                                disabled={loadingNoConforme !== null}
                                className="flex h-9 items-center gap-2"
                            >
                                {loadingNoConforme !== null ? (
                                    <>
                                        <Loader2 className="h-4 w-4 animate-spin" />
                                        Guardando...
                                    </>
                                ) : (
                                    <>
                                        <Save className="h-4 w-4" />
                                        Guardar Evaluación
                                    </>
                                )}
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>
            <Toast />
        </AppLayout>
    );
}
