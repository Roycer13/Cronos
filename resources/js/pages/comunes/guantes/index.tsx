
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Printer } from 'lucide-react';
import { PDFViewer } from '@react-pdf/renderer';
import ReporteDotacionGuantes from '@/pdf/ReporteDotacionGuantes';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import FilterSelect from '@/components/ui/filter-select';
import FormSelect from '@/components/ui/form-select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import TablePagination from '@/components/ui/table-pagination';
import { Textarea } from '@/components/ui/textarea';
import { Toast } from '@/components/ui/toast';
import { useAdvancedFilters } from '@/hooks/use-advanced-filters';
import { useAuth } from '@/hooks/useAuth';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, router, useForm, usePage } from '@inertiajs/react';
import {
    Clock,
    Edit,
    Filter,
    MoreHorizontal,
    Plus,
    Search,
    Undo2,
    X,
    XCircle,
} from 'lucide-react';
import { useEffect, useState } from 'react';
import { route } from 'ziggy-js';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Módulos Comunes', href: '/modulos-comunes' },
    { title: 'Dotación de Guantes', href: '/higiene/dotacion-guantes' },
];

interface DotacionGuante {
    id: number;
    user_id: number;
    user_encargado_id: number;
    tiempo: string;
    tipo: string;
    amarillo_naranja: boolean;
    azul: boolean;
    naranja: boolean;
    alta_temperatura: boolean;
    observaciones?: string;
    tiempo_devolucion?: string | null;
    estado_id?: number | null;
    estado?: {
        id: number;
        name: string;
    } | null;
    user: {
        id: number;
        name: string;
        apellido: string;
        codigo?: string;
    };
    encargado: {
        id: number;
        name: string;
        apellido: string;
    };
}

interface PageProps {
    registros: {
        data: DotacionGuante[];
        links: any[];
        current_page: number;
        last_page: number;
        per_page: number;
        total: number;
    };
    empleados: Array<{
        id: number;
        name: string;
        apellido: string;
        codigo?: string;
    }>;
    filters: {
        filtro_fecha_desde?: string;
        filtro_fecha_hasta?: string;
        filtro_empleado?: string;
        per_page?: string;
    };
    total_pendientes_devolucion?: number; // nuevo prop
    usuarios_pendientes?: Array<{
        // 👈 agregar
        id: number;
        name: string;
        apellido: string;
        codigo?: string;
    }>;
}

function toLocalDatetimeInputValue(date: Date | string = new Date()): string {
    const rawDate = typeof date === 'string' ? new Date(date) : date;
    const localDate = new Date(rawDate.getTime() - rawDate.getTimezoneOffset() * 60000);
    return localDate.toISOString().slice(0, 16);
}

function formatFecha(fecha: string): string {
    return new Date(fecha).toLocaleDateString('es-ES', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
    });
}

function formatDateOnly(fecha?: string | null): string {
    if (!fecha) return '—';
    return new Date(fecha).toLocaleDateString('es-ES', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
    });
}

export default function Index() {
    const { props } = usePage();
    const [showFilters, setShowFilters] = useState(false);
    const { hasPermission } = useAuth();
    const [createOpen, setCreateOpen] = useState(false);
    const [editOpen, setEditOpen] = useState(false);
    const [deleteOpen, setDeleteOpen] = useState(false);
    const [selected, setSelected] = useState<DotacionGuante | null>(null);
    const [busquedaEmpleado, setBusquedaEmpleado] = useState('');
    const [empleadosFiltrados, setEmpleadosFiltrados] = useState<any[]>([]);

    const [fechaDesde, setFechaDesde] = useState<string>('');
const [fechaHasta, setFechaHasta] = useState<string>('');
const [empleadoId, setEmpleadoId] = useState<string>('');
const [datosPdf, setDatosPdf] = useState<any>(null);
const [mostrarPdf, setMostrarPdf] = useState(false);
const [generandoPdf, setGenerandoPdf] = useState(false);
const urlPdf = route('dotacion-guantes.pdf');

    const {
        registros = {
            data: [],
            links: [],
            current_page: 1,
            last_page: 1,
            per_page: 10,
            total: 0,
        },
        empleados = [],
        filters: initialFilters = {},
        total_pendientes_devolucion = 0,
        usuarios_pendientes = [],
    } = props as unknown as PageProps;

    const { filters, updateFilter, resetFilters } = useAdvancedFilters({
        routeName: 'dotacion-guantes.index',
        initialFilters: {
            filtro_fecha_desde: initialFilters.filtro_fecha_desde || undefined,
            filtro_fecha_hasta: initialFilters.filtro_fecha_hasta || undefined,
            filtro_empleado: initialFilters.filtro_empleado || undefined,
            per_page: initialFilters.per_page || '10',
        },
        debounceFields: [],
        debounceDelay: 500,
    });

    const { data, setData, post, put, processing, errors, reset } = useForm({
        user_id: '',
        tiempo: toLocalDatetimeInputValue(),
        tipo: '',
        amarillo_naranja: false,
        azul: false,
        naranja: false,
        alta_temperatura: false,
        observaciones: '',
        tiempo_devolucion: '', // nuevo campo
    });

    useEffect(() => {
        if (busquedaEmpleado) {
            const busqueda = busquedaEmpleado.toLowerCase();
            const resultados = empleados.filter(
                (emp) =>
                    emp.name.toLowerCase().includes(busqueda) ||
                    emp.apellido?.toLowerCase().includes(busqueda) ||
                    emp.codigo?.toString().includes(busqueda),
            );
            setEmpleadosFiltrados(resultados.slice(0, 10));
        } else {
            setEmpleadosFiltrados(empleados.slice(0, 10));
        }
    }, [busquedaEmpleado, empleados]);

    const handleCreate = () => {
        reset();
        setBusquedaEmpleado('');
        setCreateOpen(true);
    };

    const handleEdit = (v: DotacionGuante) => {
        setSelected(v);
        setData({
            user_id: v.user_id.toString(),
            tiempo: toLocalDatetimeInputValue(v.tiempo),
            tipo: v.tipo,
            amarillo_naranja: !!v.amarillo_naranja,
            azul: !!v.azul,
            naranja: !!v.naranja,
            alta_temperatura: !!v.alta_temperatura,
            observaciones: v.observaciones || '',
            tiempo_devolucion: v.tiempo_devolucion
                ? toLocalDatetimeInputValue(v.tiempo_devolucion)
                : '',
        });
        setBusquedaEmpleado(`${v.user.name} ${v.user.apellido}`);
        setEditOpen(true);
    };

    const handleDelete = (v: DotacionGuante) => {
        setSelected(v);
        setDeleteOpen(true);
    };

    const fetchDatosPdf = async () => {
    const params = new URLSearchParams();
    if (fechaDesde) params.append('fecha_desde', fechaDesde);
    if (fechaHasta) params.append('fecha_hasta', fechaHasta);
    if (empleadoId) params.append('empleado_id', empleadoId);

    const response = await fetch(`${urlPdf}?${params.toString()}`);
    if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText.substring(0, 500));
    }
    return await response.json();
};

const handleMostrarPdf = async () => {
    setGenerandoPdf(true);
    try {
        const data = await fetchDatosPdf();
        if (!data.usuarios || data.usuarios.length === 0) {
            alert('No hay registros para los filtros seleccionados');
            return;
        }
        setDatosPdf(data);
        setMostrarPdf(true);
    } catch (error: any) {
        console.error(error);
        alert('Error al generar el reporte: ' + error.message);
    } finally {
        setGenerandoPdf(false);
    }
};

    const confirmDelete = () => {
        if (!selected) return;
        router.delete(route('dotacion-guantes.destroy', selected.id), {
            preserveScroll: true,
            onSuccess: () => {
                setDeleteOpen(false);
                setSelected(null);
            },
        });
    };

    const submitCreate = (e: React.FormEvent) => {
        e.preventDefault();
        post(route('dotacion-guantes.store'), {
            onSuccess: () => {
                setCreateOpen(false);
                reset();
            },
        });
    };

    const submitEdit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!selected) return;
        put(route('dotacion-guantes.update', selected.id), {
            onSuccess: () => {
                setEditOpen(false);
                reset();
                setSelected(null);
            },
        });
    };

    // Determinar estado visual (si no viene la relación estado, se calcula con tiempo_devolucion)
    const getEstadoName = (registro: DotacionGuante): string => {
        if (registro.estado?.name) return registro.estado.name;
        return registro.tiempo_devolucion ? 'Pendiente' : 'Completado';
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Dotación de Guantes" />
            <div className="space-y-4 px-2 py-4 sm:px-6">
                <Toast />

                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <h1 className="text-2xl font-bold text-foreground">
                            Dotación de Guantes
                        </h1>
                        <p className="mt-1 text-muted-foreground">
                            Registro de entrega de guantes al personal
                        </p>
                    </div>
                    {hasPermission('c_dotacionGuantes') && (
                        <Button
                            onClick={handleCreate}
                            className="flex items-center gap-2"
                        >
                            <Plus className="h-4 w-4" />
                            <span>Nuevo Registro</span>
                        </Button>
                    )}
                </div>

                <div className="mb-6">
                    <Card className="p-4">
                        <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
                            {/* Lado izquierdo: ícono + cantidad */}
                            <div className="flex min-w-[180px] items-center gap-4">
                                <div className="rounded-full bg-orange-100 p-3 dark:bg-orange-900/30">
                                    <Clock className="h-6 w-6 text-orange-600 dark:text-orange-400" />
                                </div>
                                <div>
                                    <p className="text-sm font-medium text-muted-foreground">
                                        Devoluciones vencidas
                                    </p>
                                    <p className="text-3xl font-bold text-foreground">
                                        {total_pendientes_devolucion}
                                    </p>
                                </div>
                            </div>

                            {/* Lado derecho: lista de usuarios con scroll horizontal si es necesario */}
                            <div className="min-w-0 flex-1">
                                {usuarios_pendientes &&
                                usuarios_pendientes.length > 0 ? (
                                    <>
                                        <p className="mb-2 text-xs font-medium text-muted-foreground">
                                            Usuarios:
                                        </p>
                                        <div className="flex flex-wrap gap-2">
                                            {usuarios_pendientes.map((user) => (
                                                <Badge
                                                    key={user.id}
                                                    variant="secondary"
                                                    className="px-2 py-1 text-sm"
                                                >
                                                    {user.name} {user.apellido}
                                                    {user.codigo && (
                                                        <span className="ml-1 text-xs text-muted-foreground">
                                                            ({user.codigo})
                                                        </span>
                                                    )}
                                                </Badge>
                                            ))}
                                        </div>
                                    </>
                                ) : (
                                    <p className="text-center text-sm text-muted-foreground sm:text-left">
                                        No hay devoluciones vencidas
                                    </p>
                                )}
                            </div>
                        </div>
                    </Card>
                </div>
                <Card>
                    <div className="flex items-center justify-between border-b p-4">
                        <h3 className="font-semibold text-foreground">
                            Filtros
                        </h3>
                        <div className="flex items-center gap-2">
                            {Object.values(filters).some(
                                (v) => v && v !== '' && v !== '10',
                            ) && (
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={resetFilters}
                                >
                                    <X className="mr-1 h-4 w-4" /> Limpiar
                                </Button>
                            )}
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => setShowFilters(!showFilters)}
                            >
                                <Filter className="mr-2 h-4 w-4" />
                                {showFilters ? 'Ocultar' : 'Mostrar'}
                            </Button>
                        </div>
                    </div>
                    {showFilters && (
                        <div className="grid grid-cols-1 gap-4 p-4 md:grid-cols-2 lg:grid-cols-4">
                            <div className="space-y-2">
                                <Label>Fecha Desde</Label>
                                <Input
                                    type="date"
                                    value={filters.filtro_fecha_desde || ''}
                                    onChange={(e) =>
                                        updateFilter(
                                            'filtro_fecha_desde',
                                            e.target.value,
                                        )
                                    }
                                />
                            </div>
                            <div className="space-y-2">
                                <Label>Fecha Hasta</Label>
                                <Input
                                    type="date"
                                    value={filters.filtro_fecha_hasta || ''}
                                    onChange={(e) =>
                                        updateFilter(
                                            'filtro_fecha_hasta',
                                            e.target.value,
                                        )
                                    }
                                />
                            </div>
                            <div className="space-y-2">
                                <Label>Empleado</Label>
                                <FilterSelect
                                    value={filters.filtro_empleado}
                                    onChange={(v) =>
                                        updateFilter('filtro_empleado', v)
                                    }
                                    placeholder="Todos"
                                    options={empleados.map((e) => ({
                                        value: e.id.toString(),
                                        label: `${e.name} ${e.apellido}`,
                                    }))}
                                />
                            </div>
                        </div>
                    )}
                </Card>

                <Card>
                    <div className="overflow-x-auto">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Fecha Entrega</TableHead>
                                    <TableHead>Empleado</TableHead>
                                    <TableHead>Tipo</TableHead>
                                    <TableHead>Colores</TableHead>
                                    <TableHead>Fecha Devolución</TableHead>
                                    <TableHead>Estado</TableHead>
                                    <TableHead>Encargado</TableHead>
                                    <TableHead className="w-[80px]">
                                        Acciones
                                    </TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {registros.data.length === 0 ? (
                                    <TableRow>
                                        <TableCell
                                            colSpan={8}
                                            className="py-10 text-center text-muted-foreground"
                                        >
                                            No se encontraron registros
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    registros.data.map((v) => (
                                        <TableRow key={v.id}>
                                            <TableCell>
                                                {formatFecha(v.tiempo)}
                                            </TableCell>
                                            <TableCell>
                                                <div className="font-medium">
                                                    {v.user.name}{' '}
                                                    {v.user.apellido}
                                                </div>
                                                <div className="text-xs text-muted-foreground">
                                                    {v.user.codigo}
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <Badge
                                                    variant={
                                                        v.tipo === 'Dotacion'
                                                            ? 'default'
                                                            : 'secondary'
                                                    }
                                                    className={
                                                        v.tipo === 'Dotacion'
                                                            ? 'border-none bg-blue-100 text-blue-800 hover:bg-blue-100'
                                                            : 'border-none bg-green-100 text-green-800 hover:bg-green-100'
                                                    }
                                                >
                                                    {v.tipo}
                                                </Badge>
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex flex-wrap gap-1">
                                                    {v.amarillo_naranja && (
                                                        <Badge className="border-none bg-yellow-400 text-yellow-900 hover:bg-yellow-400">
                                                            A/R
                                                        </Badge>
                                                    )}
                                                    {v.azul && (
                                                        <Badge className="border-none bg-blue-500 text-white hover:bg-blue-500">
                                                            Azul
                                                        </Badge>
                                                    )}
                                                    {v.naranja && (
                                                        <Badge className="border-none bg-orange-500 text-white hover:bg-orange-500">
                                                            Naranja
                                                        </Badge>
                                                    )}
                                                    {v.alta_temperatura && (
                                                        <Badge variant="outline">
                                                            A. T.
                                                        </Badge>
                                                    )}
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                {formatDateOnly(
                                                    v.tiempo_devolucion,
                                                )}
                                            </TableCell>
                                            <TableCell>
                                                <Badge
                                                    variant={
                                                        getEstadoName(v) ===
                                                        'Pendiente'
                                                            ? 'destructive'
                                                            : 'outline'
                                                    }
                                                >
                                                    {getEstadoName(v)}
                                                </Badge>
                                            </TableCell>
                                            <TableCell>
                                                {v.encargado.name}{' '}
                                                {v.encargado.apellido}
                                            </TableCell>
                                            <TableCell>
                                                <DropdownMenu>
                                                    <DropdownMenuTrigger
                                                        asChild
                                                    >
                                                        <Button
                                                            variant="ghost"
                                                            size="sm"
                                                            className="h-8 w-8 p-0"
                                                        >
                                                            <MoreHorizontal className="h-4 w-4" />
                                                        </Button>
                                                    </DropdownMenuTrigger>
                                                    <DropdownMenuContent align="end">
                                                        {hasPermission(
                                                            'u_dotacionGuantes',
                                                        ) && (
                                                            <DropdownMenuItem
                                                                onClick={() =>
                                                                    handleEdit(
                                                                        v,
                                                                    )
                                                                }
                                                            >
                                                                <Edit className="mr-2 h-4 w-4" />{' '}
                                                                Editar
                                                            </DropdownMenuItem>
                                                        )}
                                                        {hasPermission(
                                                            'd_dotacionGuantes',
                                                        ) && (
                                                            <DropdownMenuItem
                                                                onClick={() =>
                                                                    handleDelete(
                                                                        v,
                                                                    )
                                                                }
                                                                className="text-destructive focus:text-destructive"
                                                            >
                                                                <XCircle className="mr-2 h-4 w-4" />{' '}
                                                                Eliminar
                                                            </DropdownMenuItem>
                                                        )}

                                                        {/* 👇 Botón de devolución (solo si tiene fecha y permiso) */}
                                                        {v.tiempo_devolucion && hasPermission('u_dotacionGuantes') && (
                                                            <DropdownMenuItem
                                                                onClick={() => {
                                                                    if (confirm('¿Registrar devolución? La fecha de devolución se eliminará y el estado pasará a Completado.')) {
                                                                        router.post(route('dotacion-guantes.devolver', v.id), {}, {
                                                                            preserveScroll: true,
                                                                        });
                                                                    }
                                                                }}
                                                                className="text-green-600 focus:text-green-700"
                                                            >
                                                                <Undo2 className="mr-2 h-4 w-4" />
                                                                Registrar Devolución
                                                            </DropdownMenuItem>
                                                        )}
                                                    </DropdownMenuContent>
                                                </DropdownMenu>
                                            </TableCell>
                                        </TableRow>
                                    ))
                                )}
                            </TableBody>
                        </Table>
                    </div>
                    {registros.data.length > 0 && (
                        <div className="border-t p-4">
                            <TablePagination
                                pagination={registros}
                                onPageChange={(page) =>
                                    router.get(
                                        route('dotacion-guantes.index'),
                                        { ...filters, page },
                                        { preserveState: true },
                                    )
                                }
                            />
                        </div>
                    )}
                </Card>

                <div className="rounded-lg border border-border bg-muted/50 p-4 mt-4">
    <h3 className="mb-3 font-semibold text-foreground">Generar Reporte PDF</h3>
    <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
        <div>
            <label className="mb-1 block text-sm font-medium">Fecha Desde</label>
            <Input
                type="date"
                value={fechaDesde}
                onChange={(e) => setFechaDesde(e.target.value)}
            />
        </div>
        <div>
            <label className="mb-1 block text-sm font-medium">Fecha Hasta</label>
            <Input
                type="date"
                value={fechaHasta}
                onChange={(e) => setFechaHasta(e.target.value)}
            />
        </div>
        <div>
            <label className="mb-1 block text-sm font-medium">Empleado</label>
            <FilterSelect
                value={empleadoId}
                onChange={(v) => setEmpleadoId(v)}
                placeholder="Todos los empleados"
                options={empleados.map((e) => ({
                    value: e.id.toString(),
                    label: `${e.name} ${e.apellido}`,
                }))}
            />
        </div>
    </div>
    <div className="flex justify-end mt-3">
        <Button
            variant="default"
            size="sm"
            onClick={handleMostrarPdf}
            disabled={generandoPdf}
            className="flex items-center gap-2"
        >
            <Printer className="h-4 w-4" />
            {generandoPdf ? 'Generando...' : 'Generar Reporte PDF'}
        </Button>
    </div>
</div>
            </div>

            {/* Modal Crear/Editar */}
            <Dialog
                open={createOpen || editOpen}
                onOpenChange={createOpen ? setCreateOpen : setEditOpen}
            >
                <DialogContent className="max-h-[90vh] max-w-2xl overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle>
                            {createOpen ? 'Nuevo Registro' : 'Editar Registro'}
                        </DialogTitle>
                        <DialogDescription>
                            Complete los datos de la entrega de guantes.
                        </DialogDescription>
                    </DialogHeader>
                    <form
                        onSubmit={createOpen ? submitCreate : submitEdit}
                        className="space-y-6"
                    >
                        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                            <div className="space-y-2">
                                <Label>Empleado *</Label>
                                <div className="relative">
                                    <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                                    <Input
                                        placeholder="Nombre o código..."
                                        value={busquedaEmpleado}
                                        onChange={(e) => {
                                            setBusquedaEmpleado(e.target.value);
                                            if (data.user_id)
                                                setData('user_id', '');
                                        }}
                                        className="pl-9"
                                    />
                                </div>
                                {busquedaEmpleado &&
                                    !data.user_id &&
                                    empleadosFiltrados.length > 0 && (
                                        <Card className="absolute z-50 mt-1 max-h-48 w-full overflow-y-auto shadow-lg">
                                            {empleadosFiltrados.map((emp) => (
                                                <div
                                                    key={emp.id}
                                                    className="flex cursor-pointer justify-between p-2 text-sm hover:bg-muted"
                                                    onClick={() => {
                                                        setData(
                                                            'user_id',
                                                            emp.id.toString(),
                                                        );
                                                        setBusquedaEmpleado(
                                                            `${emp.name} ${emp.apellido}`,
                                                        );
                                                    }}
                                                >
                                                    <span>
                                                        {emp.name}{' '}
                                                        {emp.apellido}
                                                    </span>
                                                    <span className="text-muted-foreground">
                                                        {emp.codigo}
                                                    </span>
                                                </div>
                                            ))}
                                        </Card>
                                    )}
                                {errors.user_id && (
                                    <p className="text-sm text-red-500">
                                        {errors.user_id}
                                    </p>
                                )}
                            </div>
                            <div className="space-y-2">
                                <Label>Fecha y Hora Entrega *</Label>
                                <Input
                                    type="datetime-local"
                                    value={data.tiempo}
                                    onChange={(e) =>
                                        setData('tiempo', e.target.value)
                                    }
                                />
                                {errors.tiempo && (
                                    <p className="text-sm text-red-500">
                                        {errors.tiempo}
                                    </p>
                                )}
                            </div>
                            <div className="space-y-2">
                                <Label>Tipo de Entrega *</Label>
                                <FormSelect
                                    value={data.tipo}
                                    onChange={(v) => setData('tipo', v)}
                                    placeholder="Seleccione tipo..."
                                    options={[
                                        {
                                            value: 'Dotacion',
                                            label: 'Dotación',
                                        },
                                        { value: 'Cambio', label: 'Cambio' },
                                    ]}
                                    error={errors.tipo}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label>Fecha de Devolución (opcional)</Label>
                                <Input
                                    type="date"
                                    value={
                                        data.tiempo_devolucion
                                            ? data.tiempo_devolucion.split(
                                                  'T',
                                              )[0]
                                            : ''
                                    }
                                    onChange={(e) =>
                                        setData(
                                            'tiempo_devolucion',
                                            e.target.value,
                                        )
                                    }
                                />
                            </div>
                        </div>

                        <div className="space-y-3">
                            <Label>Colores / Selección</Label>
                            <div className="grid grid-cols-2 gap-4 rounded-lg bg-muted/30 p-4 sm:grid-cols-4">
                                <div className="flex items-center gap-2">
                                    <Checkbox
                                        id="amarillo_naranja"
                                        checked={data.amarillo_naranja}
                                        onCheckedChange={(c) =>
                                            setData('amarillo_naranja', !!c)
                                        }
                                    />
                                    <Label
                                        htmlFor="amarillo_naranja"
                                        className="cursor-pointer"
                                    >
                                        A/R
                                    </Label>
                                </div>
                                <div className="flex items-center gap-2">
                                    <Checkbox
                                        id="azul"
                                        checked={data.azul}
                                        onCheckedChange={(c) =>
                                            setData('azul', !!c)
                                        }
                                    />
                                    <Label
                                        htmlFor="azul"
                                        className="cursor-pointer"
                                    >
                                        Azul
                                    </Label>
                                </div>
                                <div className="flex items-center gap-2">
                                    <Checkbox
                                        id="naranja"
                                        checked={data.naranja}
                                        onCheckedChange={(c) =>
                                            setData('naranja', !!c)
                                        }
                                    />
                                    <Label
                                        htmlFor="naranja"
                                        className="cursor-pointer"
                                    >
                                        Naranja
                                    </Label>
                                </div>
                                <div className="flex items-center gap-2">
                                    <Checkbox
                                        id="alta_temperatura"
                                        checked={data.alta_temperatura}
                                        onCheckedChange={(c) =>
                                            setData('alta_temperatura', !!c)
                                        }
                                    />
                                    <Label
                                        htmlFor="alta_temperatura"
                                        className="cursor-pointer"
                                    >
                                        A. T.
                                    </Label>
                                </div>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label>Observaciones</Label>
                            <Textarea
                                value={data.observaciones}
                                onChange={(e) =>
                                    setData('observaciones', e.target.value)
                                }
                                placeholder="Notas adicionales sobre la entrega..."
                                rows={3}
                            />
                            {errors.observaciones && (
                                <p className="text-sm text-red-500">
                                    {errors.observaciones}
                                </p>
                            )}
                        </div>

                        <div className="flex justify-end gap-2 border-t pt-4">
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => {
                                    setCreateOpen(false);
                                    setEditOpen(false);
                                }}
                            >
                                Cancelar
                            </Button>
                            <Button type="submit" disabled={processing}>
                                {createOpen
                                    ? 'Guardar Registro'
                                    : 'Actualizar Registro'}
                            </Button>
                        </div>
                    </form>
                </DialogContent>
            </Dialog>

            <Dialog open={deleteOpen} onOpenChange={setDeleteOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Eliminar Registro</DialogTitle>
                        <DialogDescription>
                            ¿Estás seguro de que deseas eliminar este registro
                            de dotación? Esta acción no se puede deshacer.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="flex justify-end gap-2 pt-4">
                        <Button
                            variant="outline"
                            onClick={() => setDeleteOpen(false)}
                        >
                            Cancelar
                        </Button>
                        <Button variant="destructive" onClick={confirmDelete}>
                            Eliminar
                        </Button>
                    </div>
                </DialogContent>
            </Dialog>

            {mostrarPdf && datosPdf && (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80">
        <div className="relative h-[95vh] w-[95vw] overflow-hidden rounded-lg bg-white shadow-2xl">
            <button
                className="absolute top-4 right-4 z-50 flex h-8 w-8 items-center justify-center rounded-full bg-red-600 text-white hover:bg-red-700"
                onClick={() => setMostrarPdf(false)}
            >
                <X className="h-5 w-5" />
            </button>
            <div className="absolute top-0 right-0 left-0 z-40 flex items-center justify-between bg-gray-100 px-4 py-3">
                <div>
                    <h3 className="text-lg font-semibold text-gray-800">Reporte de Dotación de Guantes</h3>
                    <p className="text-sm text-gray-600">
                        {fechaDesde && fechaHasta ? `${fechaDesde} al ${fechaHasta}` : 'Todos los periodos'}
                        {empleadoId && ` - Empleado seleccionado`}
                    </p>
                </div>
            </div>
            <div className="h-full pt-14">
                <PDFViewer style={{ width: '100%', height: '100%', border: 'none' }}>
                    <ReporteDotacionGuantes data={datosPdf} />
                </PDFViewer>
            </div>
        </div>
    </div>
)}
        </AppLayout>
    );
}
