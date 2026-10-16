import * as React from 'react';

import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/hooks/useAuth';
import { Toast } from '@/components/ui/toast';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, router, usePage, useForm } from '@inertiajs/react';

import {
    CheckCircle,
    XCircle,
    User,
    Building,
    Clock,
    Search,
    Filter,
    Users,
    Calendar,
    Check,
    X,
    ArrowLeft,
    Save,
    AlertCircle,
    Info,
    Loader2,
} from 'lucide-react';

import { route } from 'ziggy-js';
import { useState, useEffect, useMemo } from 'react';

import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from '@/components/ui/dialog';

import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';

import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from '@/components/ui/popover';

// FormSelect
import FormSelect from '@/components/ui/form-select';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Módulos Comunes',
        href: '/modulos-comunes',
    },
    {
        title: 'Higiene Personal',
        href: '/modulos-comunes/higiene-personal',
    },
    {
        title: 'Inspección de Casilleros',
        href: '/modulos-comunes/higiene-personal/inspeccion-casilleros',
    },
    {
        title: 'Registro Rápido',
        href: '/modulos-comunes/higiene-personal/inspeccion-casilleros/registro-rapido',
    },
];

interface Empleado {
    id: number;
    name: string;
    apellido: string;
    codigo?: number;
    cargo?: string;
    turno?: string;
    area?: {
        id: number;
        nombre: string;
    };
}

interface Inspector {
    id: number;
    name: string;
    apellido: string;
}

interface PageProps {
    empleados: Empleado[];
    inspectores: Inspector[];
    areas: Array<{
        id: number;
        nombre: string;
    }>;
    turnos: string[];
    flash: {
        success?: string;
        error?: string;
    };
}

function toLocalDatetimeInputValue(
    date: Date | string = new Date()
): string {
    const rawDate =
        typeof date === 'string' ? new Date(date) : date;

    const localDate = new Date(
        rawDate.getTime() -
            rawDate.getTimezoneOffset() * 60000
    );

    return localDate.toISOString().slice(0, 16);
}

// Información de los ítems del checklist
const popoverInfo = {
    orden: {
        title: 'Orden del Casillero',
        items: [
            '• Verificar que el casillero esté ordenado, sin objetos fuera de lugar.',
        ],
    },

    limpieza: {
        title: 'Limpieza del Casillero',
        items: [
            '• Verificar que el casillero esté limpio, sin polvo ni residuos.',
        ],
    },

    implementos_aseo: {
        title: 'Implementos de Aseo',
        items: [
            '• Verificar que cuenta con los implementos de aseo necesarios (jabón, toallas, etc.).',
        ],
    },
};

export default function RegistroRapido() {
    const { props } = usePage();

    const [selectedEmpleado, setSelectedEmpleado] =
        useState<Empleado | null>(null);

    const [formAbierto, setFormAbierto] =
        useState(false);

    const [busqueda, setBusqueda] =
        useState('');

    const [filtroArea, setFiltroArea] =
        useState<string>('');

    const [filtroTurno, setFiltroTurno] =
        useState<string>('');

    const [loadingConforme, setLoadingConforme] =
        useState<number | null>(null);

    const [loadingNoConforme, setLoadingNoConforme] =
        useState<number | null>(null);

    const {
        empleados = [],
        inspectores = [],
        areas = [],
        turnos = [],
        flash,
    } = props as unknown as PageProps;

    const empleadosList = Array.isArray(empleados)
        ? empleados
        : Object.values(empleados);

    const inspectoresList = Array.isArray(inspectores)
        ? inspectores
        : Object.values(inspectores);

    const areasList = Array.isArray(areas)
        ? areas
        : Object.values(areas);

    const turnosList = Array.isArray(turnos)
        ? turnos
        : Object.values(turnos);

    const { data, setData, reset } = useForm({
        empleado_id: '',
        orden: true,
        limpieza: true,
        implementos_aseo: true,
        observacion: '',
        correccion: '',
        inspector1_id: '',
        inspector2_id: '',
        inspector3_id: '',
    });

    const inspectoresRequeridos =
        !data.inspector1_id &&
        !data.inspector2_id &&
        !data.inspector3_id;

    // ==========================================
    // OPCIONES PARA FORMSELECT
    // ==========================================

    const inspectorOptions = useMemo(
        () =>
            inspectoresList.map((inspector) => ({
                value: inspector.id.toString(),
                label: `${inspector.name} ${inspector.apellido}`,
            })),
        [inspectoresList]
    );

    const areaOptions = useMemo(
        () =>
            areasList.map((area) => ({
                value: area.id.toString(),
                label: area.nombre,
            })),
        [areasList]
    );

    const turnoOptions = useMemo(
        () =>
            turnosList.map((turno) => ({
                value: turno,
                label: turno,
            })),
        [turnosList]
    );

    // ==========================================
    // AGRUPAR EMPLEADOS POR ÁREA
    // ==========================================

    const empleadosPorArea = useMemo(() => {
        const filtrados = empleadosList.filter((empleado) => {
            const cumpleBusqueda =
                !busqueda ||
                empleado.name
                    .toLowerCase()
                    .includes(busqueda.toLowerCase()) ||
                empleado.apellido
                    .toLowerCase()
                    .includes(busqueda.toLowerCase()) ||
                (empleado.codigo &&
                    empleado.codigo
                        .toString()
                        .includes(busqueda)) ||
                (empleado.cargo &&
                    empleado.cargo
                        .toLowerCase()
                        .includes(busqueda.toLowerCase()));

            const areaId = empleado.area?.id;

            const cumpleArea =
                !filtroArea ||
                areaId?.toString() === filtroArea;

            const cumpleTurno =
                !filtroTurno ||
                empleado.turno === filtroTurno;

            return (
                cumpleBusqueda &&
                cumpleArea &&
                cumpleTurno
            );
        });

        const agrupados: {
            [key: string]: Empleado[];
        } = {};

        areasList.forEach((area) => {
            agrupados[area.nombre] = [];
        });

        agrupados['Sin Área'] = [];

        filtrados.forEach((empleado) => {
            const areaNombre =
                empleado.area?.nombre || 'Sin Área';

            if (!agrupados[areaNombre]) {
                agrupados[areaNombre] = [];
            }

            agrupados[areaNombre].push(empleado);
        });

        // Eliminar áreas vacías si hay filtros activos
        if (busqueda || filtroArea || filtroTurno) {
            const resultado: {
                [key: string]: Empleado[];
            } = {};

            Object.entries(agrupados).forEach(
                ([area, empleadosArea]) => {
                    if (empleadosArea.length > 0) {
                        resultado[area] = empleadosArea;
                    }
                }
            );

            return resultado;
        }

        return agrupados;
    }, [
        empleadosList,
        areasList,
        busqueda,
        filtroArea,
        filtroTurno,
    ]);

    // ==========================================
    // COLORES DE ÁREAS
    // ==========================================

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

    const getColorArea = (index: number) =>
        coloresAreas[index % coloresAreas.length];

    // ==========================================
    // CONFORME
    // ==========================================

    const handleConforme = (empleado: Empleado) => {
        if (inspectoresRequeridos) {
            alert(
                'Seleccione al menos un inspector antes de registrar'
            );
            return;
        }

        setLoadingConforme(empleado.id);

        router.post(
            route('inspeccion-casilleros.store'),
            {
                user_id: empleado.id,
                fecha: toLocalDatetimeInputValue(),
                orden: true,
                limpieza: true,
                implementos_aseo: true,
                observacion: '',
                correccion: '',
                inspector1_id: data.inspector1_id,
                inspector2_id: data.inspector2_id,
                inspector3_id: data.inspector3_id,
            },
            {
                preserveScroll: true,

                onSuccess: () =>
                    setLoadingConforme(null),

                onError: () =>
                    setLoadingConforme(null),
            }
        );
    };

    // ==========================================
    // NO CONFORME
    // ==========================================

    const handleNoConforme = (empleado: Empleado) => {
        setSelectedEmpleado(empleado);

        setData({
            empleado_id: empleado.id.toString(),
            orden: true,
            limpieza: true,
            implementos_aseo: true,
            observacion: '',
            correccion: '',
            inspector1_id: data.inspector1_id,
            inspector2_id: data.inspector2_id,
            inspector3_id: data.inspector3_id,
        });

        setFormAbierto(true);
    };

    const submitNoConforme = (
        e: React.FormEvent
    ) => {
        e.preventDefault();

        if (!selectedEmpleado) return;

        if (inspectoresRequeridos) {
            alert(
                'Seleccione al menos un inspector antes de registrar'
            );
            return;
        }

        setLoadingNoConforme(
            selectedEmpleado.id
        );

        router.post(
            route('inspeccion-casilleros.store'),
            {
                user_id: data.empleado_id,
                fecha: toLocalDatetimeInputValue(),
                orden: data.orden,
                limpieza: data.limpieza,
                implementos_aseo:
                    data.implementos_aseo,
                observacion: data.observacion,
                correccion: data.correccion,
                inspector1_id:
                    data.inspector1_id,
                inspector2_id:
                    data.inspector2_id,
                inspector3_id:
                    data.inspector3_id,
            },
            {
                preserveScroll: true,

                onSuccess: () => {
                    setFormAbierto(false);
                    setSelectedEmpleado(null);
                    setLoadingNoConforme(null);

                    setData('empleado_id', '');
                    setData('orden', true);
                    setData('limpieza', true);
                    setData(
                        'implementos_aseo',
                        true
                    );
                    setData('observacion', '');
                    setData('correccion', '');
                },

                onError: () =>
                    setLoadingNoConforme(null),
            }
        );
    };

    // ==========================================
    // RESULTADOS
    // ==========================================

    const calcularConforme = () =>
        data.orden &&
        data.limpieza &&
        data.implementos_aseo;

    const calcularPorcentaje = () => {
        const checks = [
            data.orden,
            data.limpieza,
            data.implementos_aseo,
        ];

        const cumplidos =
            checks.filter(Boolean).length;

        return Math.round(
            (cumplidos / 3) * 100
        );
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Registro Rápido - Inspección de Casilleros" />

            <Toast />

            <div className="px-2 sm:px-4 py-4 space-y-4">

                {/* ==========================================
                    HEADER
                ========================================== */}

                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">

                    <div>
                        <h1 className="text-xl font-bold text-foreground">
                            Registro Rápido - Inspección de Casilleros
                        </h1>

                        <p className="text-sm text-muted-foreground mt-1">
                            Evaluación rápida por área y turno
                        </p>
                    </div>

                    <div className="flex flex-wrap gap-2">

                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() =>
                                router.get(
                                    route(
                                        'inspeccion-casilleros.index'
                                    )
                                )
                            }
                            className="flex items-center gap-2 h-9"
                        >
                            <ArrowLeft className="h-3.5 w-3.5" />

                            <span className="text-sm">
                                Volver
                            </span>
                        </Button>

                        <div className="text-xs text-muted-foreground flex items-center gap-2 bg-muted px-3 py-1.5 rounded-md">
                            <Users className="h-3.5 w-3.5" />

                            <span>
                                {empleadosList.length} empleados
                            </span>
                        </div>

                    </div>
                </div>

                {/* ==========================================
                    INSPECTORES
                ========================================== */}

                <Card className="p-3">

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">

                        <FormSelect
                            label="Inspector 1"
                            value={data.inspector1_id}
                            onChange={(value) =>
                                setData(
                                    'inspector1_id',
                                    value
                                )
                            }
                            placeholder="Seleccione inspector 1"
                            options={inspectorOptions}
                            searchable
                            clearable
                        />

                        <FormSelect
                            label="Inspector 2"
                            value={data.inspector2_id}
                            onChange={(value) =>
                                setData(
                                    'inspector2_id',
                                    value
                                )
                            }
                            placeholder="Seleccione inspector 2"
                            options={inspectorOptions}
                            searchable
                            clearable
                        />

                        <FormSelect
                            label="Inspector 3"
                            value={data.inspector3_id}
                            onChange={(value) =>
                                setData(
                                    'inspector3_id',
                                    value
                                )
                            }
                            placeholder="Seleccione inspector 3"
                            options={inspectorOptions}
                            searchable
                            clearable
                        />

                    </div>

                    {inspectoresRequeridos && (
                        <div className="text-sm text-yellow-700 bg-yellow-100 p-3 rounded-md mt-3">
                            Seleccione al menos un inspector antes de registrar inspecciones.
                        </div>
                    )}

                </Card>

                {/* ==========================================
                    FILTROS
                ========================================== */}

                <Card className="p-3">

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">

                        {/* Buscar empleado */}

                        <div className="space-y-1.5">

                            <Label
                                htmlFor="busqueda"
                                className="text-xs"
                            >
                                Buscar Empleado
                            </Label>

                            <div className="relative">

                                <Search className="absolute left-2.5 top-1/2 transform -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />

                                <Input
                                    id="busqueda"
                                    placeholder="Nombre, código, cargo..."
                                    value={busqueda}
                                    onChange={(e) =>
                                        setBusqueda(
                                            e.target.value
                                        )
                                    }
                                    className="pl-9 h-9 text-sm"
                                />

                            </div>

                        </div>

                        {/* Área */}

                        <FormSelect
                            label="Filtrar por Área"
                            value={filtroArea}
                            onChange={(value) =>
                                setFiltroArea(value)
                            }
                            placeholder="Todas las áreas"
                            options={areaOptions}
                            searchable
                            clearable
                        />

                        {/* Turno */}

                        <FormSelect
                            label="Filtrar por Turno"
                            value={filtroTurno}
                            onChange={(value) =>
                                setFiltroTurno(value)
                            }
                            placeholder="Todos los turnos"
                            options={turnoOptions}
                            searchable
                            clearable
                        />

                    </div>

                </Card>

                {/* ==========================================
                    LEYENDA
                ========================================== */}

                <div className="flex flex-wrap gap-3 p-3 bg-muted/30 rounded-lg">

                    <div className="flex items-center gap-2">
                        <div className="w-2.5 h-2.5 rounded-full bg-green-500" />
                        <span className="text-xs">
                            Conforme
                        </span>
                    </div>

                    <div className="flex items-center gap-2">
                        <div className="w-2.5 h-2.5 rounded-full bg-red-500" />
                        <span className="text-xs">
                            No Conforme
                        </span>
                    </div>

                    <div className="flex items-center gap-2">
                        <div className="w-2.5 h-2.5 rounded-full bg-yellow-500" />
                        <span className="text-xs">
                            Pendiente
                        </span>
                    </div>

                </div>

                {/* ==========================================
                    TARJETAS POR ÁREA
                ========================================== */}

                <div className="w-full grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3">

                    {Object.entries(
                        empleadosPorArea
                    ).map(
                        (
                            [
                                areaNombre,
                                empleadosArea,
                            ],
                            index
                        ) => (

                            <Card
                                key={areaNombre}
                                className={`p-3 max-h-[calc(100vh-250px)] overflow-y-auto ${getColorArea(
                                    index
                                )}`}
                            >

                                <div className="sticky top-0 z-10 pb-2 bg-inherit">

                                    <div className="flex items-center justify-between mb-1.5">

                                        <h3 className="font-semibold text-sm flex items-center gap-1.5 truncate">

                                            <Building className="h-4 w-4 flex-shrink-0" />

                                            <span className="truncate">
                                                {areaNombre}
                                            </span>

                                        </h3>

                                        <Badge
                                            variant="outline"
                                            className="text-xs px-1.5 py-0 h-5"
                                        >
                                            {empleadosArea.length}
                                        </Badge>

                                    </div>

                                    <Separator />

                                </div>

                                <div className="space-y-1.5 mt-2">

                                    {empleadosArea.map(
                                        (empleado) => (

                                            <div
                                                key={empleado.id}
                                                className="flex items-center justify-between p-2 rounded hover:bg-white/50 dark:hover:bg-black/20 transition-colors"
                                            >

                                                <div className="flex-1 min-w-0 pr-2">

                                                    <div className="font-medium text-xs truncate">
                                                        {empleado.name}{' '}
                                                        {empleado.apellido}
                                                    </div>

                                                    <div className="text-xs text-muted-foreground truncate">

                                                        {empleado.codigo &&
                                                            `${empleado.codigo} • `}

                                                        {empleado.cargo ||
                                                            'Sin cargo'}

                                                    </div>

                                                    {empleado.turno && (
                                                        <div className="flex items-center gap-1 mt-0.5">

                                                            <Clock className="h-2.5 w-2.5" />

                                                            <span className="text-xs">
                                                                {empleado.turno}
                                                            </span>

                                                        </div>
                                                    )}

                                                </div>

                                                <div className="flex gap-1.5 flex-shrink-0">

                                                    {/* NO CONFORME */}

                                                    <Button
                                                        size="sm"
                                                        variant="outline"
                                                        className="h-7 w-7 p-0 text-red-600 hover:text-red-700 hover:bg-red-50 border-red-200"
                                                        onClick={() =>
                                                            handleNoConforme(
                                                                empleado
                                                            )
                                                        }
                                                        title="No Conforme"
                                                        disabled={
                                                            loadingConforme ===
                                                                empleado.id ||
                                                            loadingNoConforme ===
                                                                empleado.id
                                                        }
                                                    >
                                                        <X className="h-3.5 w-3.5" />
                                                    </Button>

                                                    {/* CONFORME */}

                                                    <Button
                                                        size="sm"
                                                        variant="outline"
                                                        className="h-7 w-7 p-0 text-green-600 hover:text-green-700 hover:bg-green-50 border-green-200"
                                                        onClick={() =>
                                                            handleConforme(
                                                                empleado
                                                            )
                                                        }
                                                        title="Conforme"
                                                        disabled={
                                                            loadingConforme ===
                                                                empleado.id ||
                                                            loadingNoConforme ===
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

                                                </div>

                                            </div>

                                        )
                                    )}

                                </div>

                            </Card>

                        )
                    )}

                </div>

                {/* ==========================================
                    SIN RESULTADOS
                ========================================== */}

                {Object.keys(
                    empleadosPorArea
                ).length === 0 && (

                    <div className="text-center py-8">

                        <Users className="h-12 w-12 mx-auto text-muted-foreground/50 mb-3" />

                        <h3 className="text-base font-medium text-foreground mb-1">
                            No se encontraron empleados
                        </h3>

                        <p className="text-sm text-muted-foreground">
                            Intenta ajustar los filtros de búsqueda
                        </p>

                    </div>

                )}

            </div>

            {/* ==========================================
                MODAL NO CONFORME
            ========================================== */}

            <Dialog
                open={formAbierto}
                onOpenChange={(open) => {

                    if (!open) {

                        setFormAbierto(false);
                        setSelectedEmpleado(null);
                        setLoadingNoConforme(null);

                        reset();
                    }

                }}
            >

                <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">

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

                    <form
                        onSubmit={submitNoConforme}
                        className="space-y-4"
                    >

                        {/* Información del empleado */}

                        {selectedEmpleado && (

                            <div className="p-3 bg-muted/30 rounded-lg">

                                <div className="flex items-center gap-3">

                                    <div className="bg-primary/10 p-2 rounded-full">

                                        <User className="h-6 w-6 text-primary" />

                                    </div>

                                    <div>

                                        <h4 className="font-semibold text-sm">

                                            {selectedEmpleado.name}{' '}
                                            {selectedEmpleado.apellido}

                                        </h4>

                                        <div className="flex flex-wrap gap-1.5 mt-1">

                                            {selectedEmpleado.codigo && (
                                                <Badge
                                                    variant="outline"
                                                    className="text-xs h-5"
                                                >
                                                    Código:{' '}
                                                    {selectedEmpleado.codigo}
                                                </Badge>
                                            )}

                                            {selectedEmpleado.cargo && (
                                                <Badge
                                                    variant="outline"
                                                    className="text-xs h-5"
                                                >
                                                    {selectedEmpleado.cargo}
                                                </Badge>
                                            )}

                                            {selectedEmpleado.turno && (
                                                <Badge
                                                    variant="outline"
                                                    className="text-xs h-5"
                                                >
                                                    <Clock className="h-2.5 w-2.5 mr-1" />

                                                    {selectedEmpleado.turno}
                                                </Badge>
                                            )}

                                            {selectedEmpleado.area && (
                                                <Badge
                                                    variant="outline"
                                                    className="text-xs h-5"
                                                >
                                                    <Building className="h-2.5 w-2.5 mr-1" />

                                                    {selectedEmpleado.area.nombre}
                                                </Badge>
                                            )}

                                        </div>

                                    </div>

                                </div>

                            </div>

                        )}

                        {/* Checklist */}

                        <div className="space-y-3">

                            <h3 className="font-medium text-foreground">
                                Checklist de Inspección
                            </h3>

                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">

                                {[
                                    {
                                        key: 'orden',
                                        label: 'Orden',
                                    },
                                    {
                                        key: 'limpieza',
                                        label: 'Limpieza',
                                    },
                                    {
                                        key: 'implementos_aseo',
                                        label: 'Implementos Aseo',
                                    },
                                ].map((item) => (

                                    <div
                                        key={item.key}
                                        className="border rounded-md p-2.5 space-y-2"
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
                                                        checked
                                                    ) =>
                                                        setData(
                                                            item.key as keyof typeof data,
                                                            checked as boolean
                                                        )
                                                    }
                                                    className="h-4 w-4"
                                                />

                                                <Label
                                                    htmlFor={item.key}
                                                    className="text-sm font-medium cursor-pointer"
                                                >
                                                    {item.label}
                                                </Label>

                                            </div>

                                            {/* Información */}

                                            <Popover>

                                                <PopoverTrigger
                                                    asChild
                                                >

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

                                                            {
                                                                popoverInfo[
                                                                    item.key as keyof typeof popoverInfo
                                                                ]?.items.map(
                                                                    (
                                                                        point,
                                                                        idx
                                                                    ) => (

                                                                        <li
                                                                            key={
                                                                                idx
                                                                            }
                                                                            className="text-muted-foreground"
                                                                        >
                                                                            {
                                                                                point
                                                                            }
                                                                        </li>

                                                                    )
                                                                )
                                                            }

                                                        </ul>

                                                    </div>

                                                </PopoverContent>

                                            </Popover>

                                        </div>

                                        <div
                                            className={`h-1 rounded-full ${
                                                data[
                                                    item.key as keyof typeof data
                                                ]
                                                    ? 'bg-green-500'
                                                    : 'bg-red-500'
                                            }`}
                                        />

                                    </div>

                                ))}

                            </div>

                        </div>

                        {/* Observaciones */}

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">

                            <div className="space-y-1.5">

                                <Label
                                    htmlFor="observacion"
                                    className="text-sm"
                                >
                                    Observaciones
                                </Label>

                                <Textarea
                                    id="observacion"
                                    value={data.observacion}
                                    onChange={(e) =>
                                        setData(
                                            'observacion',
                                            e.target.value
                                        )
                                    }
                                    placeholder="Describa las no conformidades..."
                                    rows={2}
                                    className="resize-none text-sm"
                                />

                            </div>

                            <div className="space-y-1.5">

                                <Label
                                    htmlFor="correccion"
                                    className="text-sm"
                                >
                                    Acción Correctiva
                                </Label>

                                <Textarea
                                    id="correccion"
                                    value={data.correccion}
                                    onChange={(e) =>
                                        setData(
                                            'correccion',
                                            e.target.value
                                        )
                                    }
                                    placeholder="Acciones correctivas..."
                                    rows={2}
                                    className="resize-none text-sm"
                                />

                            </div>

                        </div>

                        {/* Resultado */}

                        <div className="p-3 bg-muted/30 rounded-lg">

                            <div className="flex items-center justify-between">

                                <div>

                                    <h4 className="font-medium text-sm mb-1.5">
                                        Resultado
                                    </h4>

                                    <Badge
                                        variant={
                                            calcularConforme()
                                                ? 'default'
                                                : 'destructive'
                                        }
                                        className={`text-sm px-3 py-1 ${
                                            calcularConforme()
                                                ? 'bg-green-100 text-green-800'
                                                : 'bg-red-100 text-red-800'
                                        }`}
                                    >
                                        {calcularConforme()
                                            ? 'CONFORME'
                                            : 'NO CONFORME'}
                                    </Badge>

                                </div>

                                <div className="text-right">

                                    <p className="text-xs text-muted-foreground">
                                        Cumplimiento
                                    </p>

                                    <div className="flex items-center gap-2">

                                        <div className="w-24 bg-muted rounded-full h-2 overflow-hidden">

                                            <div
                                                className={`h-2 rounded-full ${
                                                    calcularPorcentaje() >=
                                                    80
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

                        {/* Botones */}

                        <DialogFooter>

                            <Button
                                type="button"
                                variant="outline"
                                onClick={() =>
                                    setFormAbierto(false)
                                }
                                disabled={
                                    loadingNoConforme !== null
                                }
                            >
                                Cancelar
                            </Button>

                            <Button
                                type="submit"
                                disabled={
                                    loadingNoConforme !== null
                                }
                                className="flex items-center gap-2"
                            >

                                {loadingNoConforme !== null ? (
                                    <>
                                        <Loader2 className="h-4 w-4 animate-spin" />

                                        Guardando...
                                    </>
                                ) : (
                                    <>
                                        <Save className="h-4 w-4" />

                                        Guardar
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
