import { Button } from '@/components/ui/button';
import FilterSelect from '@/components/ui/filter-select';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { useAuth } from '@/hooks/useAuth';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, router } from '@inertiajs/react';
import { Download, FileText, BarChart3, PieChart, TrendingUp, Calendar, Filter, Users, Building, Clock } from 'lucide-react';
import { route } from 'ziggy-js';
import { useState } from 'react';

import { Label } from '@/components/ui/label';
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    ResponsiveContainer,
    PieChart as RechartsPieChart,
    Pie,
    Cell,
    LineChart,
    Line,
} from 'recharts';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Módulos Comunes', href: '/modulos-comunes' },
    { title: 'Higiene Personal', href: '/modulos-comunes/higiene-personal' },
    { title: 'Reportes', href: '/modulos-comunes/higiene-personal/reporte' },
];

interface ReporteData {
    registros: Array<{
        id: number;
        fecha: string;
        conforme: boolean;
        empleado: {
            name: string;
            apellido: string;
            turno: string;
            area?: {
                nombre: string;
            };
        };
        supervisor: {
            name: string;
            apellido: string;
        };
        uniforme: boolean;
        limpieza: boolean;
        lavado_manos: boolean;
        salud: boolean;
        epp: boolean;
        objetos: boolean;
        material_equipo: boolean;
        observaciones?: string;
    }>;
    estadisticas: {
        total: number;
        conformes: number;
        no_conformes: number;
        porcentaje_conformidad: number;
    };
    distribucion_turno: Array<{
        turno: string;
        total: number;
        conformes: number;
    }>;
    distribucion_area: Array<{
        area: string;
        total: number;
        conformes: number;
    }>;
}

interface PageProps {
    data: ReporteData;
    areas: Array<{ id: number; nombre: string }>;
    turnos: string[];
    empleados: Array<{ id: number; name: string; apellido: string }>;
    filters: {
        fecha_desde?: string;
        fecha_hasta?: string;
        empleado_id?: string;
        area_id?: string;
        turno?: string;
        conforme?: string;
    };
}

export default function Reporte() {
    const { props } = usePage();
    const [fechaDesde, setFechaDesde] = useState(props.filters?.fecha_desde || '');
    const [fechaHasta, setFechaHasta] = useState(props.filters?.fecha_hasta || '');
    const [empleadoId, setEmpleadoId] = useState(props.filters?.empleado_id || '');
    const [areaId, setAreaId] = useState(props.filters?.area_id || '');
    const [turno, setTurno] = useState(props.filters?.turno || '');
    const [conforme, setConforme] = useState(props.filters?.conforme || '');

    const { user: authUser } = useAuth();

    const {
        data = {
            registros: [],
            estadisticas: { total: 0, conformes: 0, no_conformes: 0, porcentaje_conformidad: 0 },
            distribucion_turno: [],
            distribucion_area: [],
        },
        areas = [],
        turnos = [],
        empleados = [],
    } = props as unknown as PageProps;

    const handleGenerarReporte = () => {
        const params: any = {};
        if (fechaDesde) params.fecha_desde = fechaDesde;
        if (fechaHasta) params.fecha_hasta = fechaHasta;
        if (empleadoId) params.empleado_id = empleadoId;
        if (areaId) params.area_id = areaId;
        if (turno) params.turno = turno;
        if (conforme !== '') params.conforme = conforme;
        
        router.get(route('higiene-personal.reporte'), params);
    };

    const handleExportar = () => {
        const params = new URLSearchParams();
        if (fechaDesde) params.append('fecha_desde', fechaDesde);
        if (fechaHasta) params.append('fecha_hasta', fechaHasta);
        if (empleadoId) params.append('empleado_id', empleadoId);
        if (areaId) params.append('area_id', areaId);
        if (turno) params.append('turno', turno);
        if (conforme !== '') params.append('conforme', conforme);
        
        window.open(route('higiene-personal.exportar') + '?' + params.toString(), '_blank');
    };

    const handleLimpiarFiltros = () => {
        setFechaDesde('');
        setFechaHasta('');
        setEmpleadoId('');
        setAreaId('');
        setTurno('');
        setConforme('');
        router.get(route('higiene-personal.reporte'));
    };

    const formatFecha = (fecha: string) => {
        return new Date(fecha).toLocaleDateString('es-ES', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
        });
    };

    // Datos para gráficos
    const datosConformidad = [
        { name: 'Conformes', value: data.estadisticas.conformes, color: '#10b981' },
        { name: 'No Conformes', value: data.estadisticas.no_conformes, color: '#ef4444' },
    ];

    const datosTurno = data.distribucion_turno.map(item => ({
        name: item.turno || 'Sin turno',
        total: item.total,
        conformes: item.conformes,
        noConformes: item.total - item.conformes,
    }));

    const datosArea = data.distribucion_area.map(item => ({
        name: item.area || 'Sin área',
        total: item.total,
        conformes: item.conformes,
        porcentaje: item.total > 0 ? Math.round((item.conformes / item.total) * 100) : 0,
    }));

    // Datos para tendencia mensual (ejemplo, necesitarías datos reales)
    const datosTendencia = [
        { mes: 'Ene', conformes: 45, total: 50 },
        { mes: 'Feb', conformes: 48, total: 52 },
        { mes: 'Mar', conformes: 42, total: 48 },
        { mes: 'Abr', conformes: 50, total: 55 },
        { mes: 'May', conformes: 47, total: 50 },
        { mes: 'Jun', conformes: 52, total: 55 },
    ];

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Reportes - Higiene Personal" />
            <div className="px-2 sm:px-6 py-4 space-y-6">
                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div>
                        <h1 className="text-2xl font-bold text-foreground">Reportes de Higiene Personal</h1>
                        <p className="text-muted-foreground mt-1">
                            Análisis y estadísticas de los registros de higiene personal
                        </p>
                    </div>

                    <div className="flex gap-2">
                        <Button
                            variant="outline"
                            onClick={handleExportar}
                            className="flex items-center gap-2"
                        >
                            <Download className="h-4 w-4" />
                            <span className="hidden sm:inline">Exportar PDF</span>
                        </Button>
                    </div>
                </div>

                {/* Filtros */}
                <Card>
                    <div className="p-4 border-b">
                        <div className="flex items-center justify-between">
                            <h3 className="font-semibold text-foreground flex items-center gap-2">
                                <Filter className="h-4 w-4" />
                                Filtros del Reporte
                            </h3>
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={handleLimpiarFiltros}
                            >
                                Limpiar Filtros
                            </Button>
                        </div>
                    </div>
                    
                    <div className="p-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="fecha_desde">Fecha Desde</Label>
                                <Input
                                    id="fecha_desde"
                                    type="date"
                                    value={fechaDesde}
                                    onChange={(e) => setFechaDesde(e.target.value)}
                                />
                            </div>
                            
                            <div className="space-y-2">
                                <Label htmlFor="fecha_hasta">Fecha Hasta</Label>
                                <Input
                                    id="fecha_hasta"
                                    type="date"
                                    value={fechaHasta}
                                    onChange={(e) => setFechaHasta(e.target.value)}
                                />
                            </div>
                            
                            <div className="space-y-2">
                                <Label htmlFor="empleado">Empleado</Label>
                                <FilterSelect
                                    value={empleadoId}
                                    onChange={setEmpleadoId}
                                    placeholder="Todos los empleados"
                                    options={empleados.map(e => ({
                                        value: e.id.toString(),
                                        label: `${e.name} ${e.apellido}`
                                    }))}
                                />
                            </div>
                            
                            <div className="space-y-2">
                                <Label htmlFor="area">Área</Label>
                                <FilterSelect
                                    value={areaId}
                                    onChange={setAreaId}
                                    placeholder="Todas las áreas"
                                    options={areas.map(a => ({
                                        value: a.id.toString(),
                                        label: a.nombre
                                    }))}
                                />
                            </div>
                            
                            <div className="space-y-2">
                                <Label htmlFor="turno">Turno</Label>
                                <FilterSelect
                                    value={turno}
                                    onChange={setTurno}
                                    placeholder="Todos los turnos"
                                    options={turnos.map(t => ({
                                        value: t,
                                        label: t
                                    }))}
                                />
                            </div>
                            
                            <div className="space-y-2">
                                <Label htmlFor="conforme">Estado</Label>
                                <FilterSelect
                                    value={conforme}
                                    onChange={setConforme}
                                    placeholder="Todos los estados"
                                    options={[
                                        { value: '1', label: 'Conforme' },
                                        { value: '0', label: 'No Conforme' },
                                    ]}
                                />
                            </div>
                        </div>
                        
                        <div className="flex justify-end mt-6">
                            <Button onClick={handleGenerarReporte}>
                                Generar Reporte
                            </Button>
                        </div>
                    </div>
                </Card>

                {/* Estadísticas Resumen */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    <Card className="p-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-muted-foreground">Total Registros</p>
                                <p className="text-2xl font-bold mt-1">{data.estadisticas.total}</p>
                            </div>
                            <div className="bg-primary/10 p-3 rounded-full">
                                <FileText className="h-6 w-6 text-primary" />
                            </div>
                        </div>
                    </Card>
                    
                    <Card className="p-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-muted-foreground">Conformes</p>
                                <p className="text-2xl font-bold mt-1 text-green-600">
                                    {data.estadisticas.conformes}
                                </p>
                            </div>
                            <div className="bg-green-100 dark:bg-green-900/30 p-3 rounded-full">
                                <TrendingUp className="h-6 w-6 text-green-600" />
                            </div>
                        </div>
                    </Card>
                    
                    <Card className="p-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-muted-foreground">No Conformes</p>
                                <p className="text-2xl font-bold mt-1 text-red-600">
                                    {data.estadisticas.no_conformes}
                                </p>
                            </div>
                            <div className="bg-red-100 dark:bg-red-900/30 p-3 rounded-full">
                                <TrendingUp className="h-6 w-6 text-red-600" />
                            </div>
                        </div>
                    </Card>
                    
                    <Card className="p-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-muted-foreground">% Conformidad</p>
                                <p className="text-2xl font-bold mt-1">
                                    {data.estadisticas.porcentaje_conformidad}%
                                </p>
                            </div>
                            <div className="bg-blue-100 dark:bg-blue-900/30 p-3 rounded-full">
                                <BarChart3 className="h-6 w-6 text-blue-600" />
                            </div>
                        </div>
                    </Card>
                </div>

                {/* Gráficos y Tablas */}
                <Tabs defaultValue="graficos" className="space-y-4">
                    <TabsList>
                        <TabsTrigger value="graficos" className="flex items-center gap-2">
                            <BarChart3 className="h-4 w-4" />
                            Gráficos
                        </TabsTrigger>
                        <TabsTrigger value="detalle" className="flex items-center gap-2">
                            <FileText className="h-4 w-4" />
                            Detalle
                        </TabsTrigger>
                    </TabsList>
                    
                    <TabsContent value="graficos" className="space-y-6">
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            {/* Gráfico de Conformidad */}
                            <Card className="p-4">
                                <h3 className="font-semibold text-foreground mb-4 flex items-center gap-2">
                                    <PieChart className="h-5 w-5" />
                                    Distribución de Conformidad
                                </h3>
                                <div className="h-64">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <RechartsPieChart>
                                            <Pie
                                                data={datosConformidad}
                                                cx="50%"
                                                cy="50%"
                                                labelLine={false}
                                                label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                                                outerRadius={80}
                                                fill="#8884d8"
                                                dataKey="value"
                                            >
                                                {datosConformidad.map((entry, index) => (
                                                    <Cell key={`cell-${index}`} fill={entry.color} />
                                                ))}
                                            </Pie>
                                            <Tooltip />
                                        </RechartsPieChart>
                                    </ResponsiveContainer>
                                </div>
                            </Card>
                            
                            {/* Gráfico por Turno */}
                            <Card className="p-4">
                                <h3 className="font-semibold text-foreground mb-4 flex items-center gap-2">
                                    <Clock className="h-5 w-5" />
                                    Conformidad por Turno
                                </h3>
                                <div className="h-64">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <BarChart data={datosTurno}>
                                            <CartesianGrid strokeDasharray="3 3" />
                                            <XAxis dataKey="name" />
                                            <YAxis />
                                            <Tooltip />
                                            <Legend />
                                            <Bar dataKey="conformes" name="Conformes" fill="#10b981" />
                                            <Bar dataKey="noConformes" name="No Conformes" fill="#ef4444" />
                                        </BarChart>
                                    </ResponsiveContainer>
                                </div>
                            </Card>
                            
                            {/* Gráfico por Área */}
                            <Card className="p-4">
                                <h3 className="font-semibold text-foreground mb-4 flex items-center gap-2">
                                    <Building className="h-5 w-5" />
                                    Porcentaje de Conformidad por Área
                                </h3>
                                <div className="h-64">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <BarChart data={datosArea}>
                                            <CartesianGrid strokeDasharray="3 3" />
                                            <XAxis dataKey="name" />
                                            <YAxis unit="%" />
                                            <Tooltip formatter={(value) => [`${value}%`, 'Conformidad']} />
                                            <Bar dataKey="porcentaje" name="% Conformidad" fill="#3b82f6" />
                                        </BarChart>
                                    </ResponsiveContainer>
                                </div>
                            </Card>
                            
                            {/* Tendencia Mensual */}
                            <Card className="p-4">
                                <h3 className="font-semibold text-foreground mb-4 flex items-center gap-2">
                                    <TrendingUp className="h-5 w-5" />
                                    Tendencia Mensual
                                </h3>
                                <div className="h-64">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <LineChart data={datosTendencia}>
                                            <CartesianGrid strokeDasharray="3 3" />
                                            <XAxis dataKey="mes" />
                                            <YAxis />
                                            <Tooltip />
                                            <Legend />
                                            <Line 
                                                type="monotone" 
                                                dataKey="porcentaje" 
                                                name="% Conformidad" 
                                                stroke="#3b82f6" 
                                                strokeWidth={2}
                                                dot={{ r: 4 }}
                                                activeDot={{ r: 6 }}
                                            />
                                            <Line 
                                                type="monotone" 
                                                dataKey="conformes" 
                                                name="Conformes" 
                                                stroke="#10b981" 
                                                strokeWidth={2}
                                                dot={{ r: 4 }}
                                            />
                                        </LineChart>
                                    </ResponsiveContainer>
                                </div>
                            </Card>
                        </div>
                    </TabsContent>
                    
                    <TabsContent value="detalle">
                        <Card>
                            <div className="overflow-x-auto">
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>Fecha</TableHead>
                                            <TableHead>Empleado</TableHead>
                                            <TableHead>Área</TableHead>
                                            <TableHead>Turno</TableHead>
                                            <TableHead>Supervisor</TableHead>
                                            <TableHead className="text-center">Uniforme</TableHead>
                                            <TableHead className="text-center">Limpieza</TableHead>
                                            <TableHead className="text-center">Lavado Manos</TableHead>
                                            <TableHead className="text-center">Salud</TableHead>
                                            <TableHead className="text-center">EPP</TableHead>
                                            <TableHead className="text-center">Objetos</TableHead>
                                            <TableHead className="text-center">Material</TableHead>
                                            <TableHead className="text-center">Estado</TableHead>
                                            <TableHead>Observaciones</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {data.registros.length === 0 ? (
                                            <TableRow>
                                                <TableCell colSpan={14} className="text-center py-8 text-muted-foreground">
                                                    No hay datos para mostrar con los filtros aplicados
                                                </TableCell>
                                            </TableRow>
                                        ) : (
                                            data.registros.map((registro) => (
                                                <TableRow key={registro.id}>
                                                    <TableCell>{formatFecha(registro.fecha)}</TableCell>
                                                    <TableCell>
                                                        {registro.empleado.name} {registro.empleado.apellido}
                                                    </TableCell>
                                                    <TableCell>{registro.empleado.area?.nombre || '-'}</TableCell>
                                                    <TableCell>{registro.empleado.turno || '-'}</TableCell>
                                                    <TableCell>
                                                        {registro.supervisor.name} {registro.supervisor.apellido}
                                                    </TableCell>
                                                    <TableCell className="text-center">
                                                        {registro.uniforme ? '✅' : '❌'}
                                                    </TableCell>
                                                    <TableCell className="text-center">
                                                        {registro.limpieza ? '✅' : '❌'}
                                                    </TableCell>
                                                    <TableCell className="text-center">
                                                        {registro.lavado_manos ? '✅' : '❌'}
                                                    </TableCell>
                                                    <TableCell className="text-center">
                                                        {registro.salud ? '✅' : '❌'}
                                                    </TableCell>
                                                    <TableCell className="text-center">
                                                        {registro.epp ? '✅' : '❌'}
                                                    </TableCell>
                                                    <TableCell className="text-center">
                                                        {registro.objetos ? '✅' : '❌'}
                                                    </TableCell>
                                                    <TableCell className="text-center">
                                                        {registro.material_equipo ? '✅' : '❌'}
                                                    </TableCell>
                                                    <TableCell>
                                                        <Badge 
                                                            variant={registro.conforme ? "default" : "destructive"}
                                                            className={registro.conforme 
                                                                ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400" 
                                                                : "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400"
                                                            }
                                                        >
                                                            {registro.conforme ? 'Conforme' : 'No Conforme'}
                                                        </Badge>
                                                    </TableCell>
                                                    <TableCell className="max-w-xs truncate">
                                                        {registro.observaciones || '-'}
                                                    </TableCell>
                                                </TableRow>
                                            ))
                                        )}
                                    </TableBody>
                                </Table>
                            </div>
                        </Card>
                    </TabsContent>
                </Tabs>

                {/* Resumen de Hallazgos */}
                <Card className="p-4">
                    <h3 className="font-semibold text-foreground mb-4">Resumen de Hallazgos</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        <div className="space-y-2">
                            <h4 className="font-medium text-foreground flex items-center gap-2">
                                <Users className="h-4 w-4" />
                                Áreas con Mejor Desempeño
                            </h4>
                            <ul className="space-y-1">
                                {data.distribucion_area
                                    .sort((a, b) => {
                                        const porcentajeA = a.total > 0 ? a.conformes / a.total : 0;
                                        const porcentajeB = b.total > 0 ? b.conformes / b.total : 0;
                                        return porcentajeB - porcentajeA;
                                    })
                                    .slice(0, 3)
                                    .map((area, index) => (
                                        <li key={index} className="flex items-center justify-between">
                                            <span>{area.area || 'Sin área'}</span>
                                            <span className="font-medium">
                                                {area.total > 0 ? Math.round((area.conformes / area.total) * 100) : 0}%
                                            </span>
                                        </li>
                                    ))}
                            </ul>
                        </div>
                        
                        <div className="space-y-2">
                            <h4 className="font-medium text-foreground flex items-center gap-2">
                                <Clock className="h-4 w-4" />
                                Turnos con Mejor Desempeño
                            </h4>
                            <ul className="space-y-1">
                                {data.distribucion_turno
                                    .sort((a, b) => {
                                        const porcentajeA = a.total > 0 ? a.conformes / a.total : 0;
                                        const porcentajeB = b.total > 0 ? b.conformes / b.total : 0;
                                        return porcentajeB - porcentajeA;
                                    })
                                    .slice(0, 3)
                                    .map((turno, index) => (
                                        <li key={index} className="flex items-center justify-between">
                                            <span>{turno.turno || 'Sin turno'}</span>
                                            <span className="font-medium">
                                                {turno.total > 0 ? Math.round((turno.conformes / turno.total) * 100) : 0}%
                                            </span>
                                        </li>
                                    ))}
                            </ul>
                        </div>
                        
                        <div className="space-y-2">
                            <h4 className="font-medium text-foreground flex items-center gap-2">
                                <Calendar className="h-4 w-4" />
                                Período Analizado
                            </h4>
                            <div className="space-y-2">
                                <div className="flex items-center justify-between">
                                    <span>Registros totales:</span>
                                    <span className="font-medium">{data.estadisticas.total}</span>
                                </div>
                                <div className="flex items-center justify-between">
                                    <span>Período:</span>
                                    <span className="font-medium">
                                        {fechaDesde ? formatFecha(fechaDesde) : 'Inicio'} - 
                                        {fechaHasta ? formatFecha(fechaHasta) : 'Actual'}
                                    </span>
                                </div>
                                <div className="flex items-center justify-between">
                                    <span>Conformidad general:</span>
                                    <span className="font-medium">{data.estadisticas.porcentaje_conformidad}%</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </Card>
            </div>
        </AppLayout>
    );
}