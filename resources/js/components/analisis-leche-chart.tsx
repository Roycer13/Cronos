// components/analisis-leche-chart.tsx
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { ChartConfig, ChartContainer } from '@/components/ui/chart';
import { useState, useMemo } from 'react';

interface AnalisisItem {
    id: number;
    temperatura?: number;
    ph?: number;
    acidez?: number;
    contenido_graso?: number;
    densidad?: number;
    temperatura_congelacion?: number;
    recuento?: number;
    antibioticos?: number;
    recepcion?: {
        tiempo: string;
        subruta?: {
            nombre: string;
            ruta?: {
                nombre: string;
            };
        };
    };
}

interface AnalisisLecheChartProps {
    analisis: AnalisisItem[];
    rutas: { id: number; nombre: string }[];
    subrutas: { id: number; nombre: string; ruta: { nombre: string } }[];
}

const chartConfig = {
    temperatura: {
        label: "Temperatura (°C)",
        color: "hsl(var(--chart-1))",
    },
    ph: {
        label: "pH",
        color: "hsl(var(--chart-2))",
    },
    acidez: {
        label: "Acidez (%)",
        color: "hsl(var(--chart-3))",
    },
    contenido_graso: {
        label: "Contenido Graso (%)",
        color: "hsl(var(--chart-4))",
    },
    densidad: {
        label: "Densidad (g/mL)",
        color: "hsl(var(--chart-5))",
    },
    temperatura_congelacion: {
        label: "Temp. Congelación (°C)",
        color: "hsl(var(--chart-1))",
    },
    recuento: {
        label: "Recuento",
        color: "hsl(var(--chart-2))",
    },
} satisfies ChartConfig;

export function AnalisisLecheChart({ analisis, rutas, subrutas }: AnalisisLecheChartProps) {
    const [selectedRuta, setSelectedRuta] = useState<string>('all');
    const [selectedSubruta, setSelectedSubruta] = useState<string>('all');
    const [chartType, setChartType] = useState<'line' | 'bar'>('line');
    const [selectedParameter, setSelectedParameter] = useState<keyof typeof chartConfig>('temperatura');

    // Filtrar datos
    const filteredData = useMemo(() => {
        return analisis.filter(item => {
            const matchesRuta = selectedRuta === 'all' || 
                item.recepcion?.subruta?.ruta?.nombre === rutas.find(r => r.id.toString() === selectedRuta)?.nombre;
            
            const matchesSubruta = selectedSubruta === 'all' || 
                item.recepcion?.subruta?.nombre === subrutas.find(s => s.id.toString() === selectedSubruta)?.nombre;
            
            return matchesRuta && matchesSubruta && item[selectedParameter] !== undefined;
        });
    }, [analisis, selectedRuta, selectedSubruta, selectedParameter, rutas, subrutas]);

    // Preparar datos para gráfica
    const chartData = useMemo(() => {
        return filteredData.map(item => ({
            name: new Date(item.recepcion?.tiempo || '').toLocaleDateString('es-ES'),
            value: item[selectedParameter],
            ruta: item.recepcion?.subruta?.ruta?.nombre || 'Sin ruta',
            subruta: item.recepcion?.subruta?.nombre || 'Sin subruta',
            fecha: item.recepcion?.tiempo,
        })).slice(0, 50); // Limitar a 50 puntos para mejor visualización
    }, [filteredData, selectedParameter]);

    return (
        <div className="space-y-4">
            {/* Controles */}
            <Card>
                <CardContent className="pt-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                        {/* Selector de Ruta */}
                        <div className="space-y-2">
                            <Label htmlFor="ruta">Filtrar por Ruta</Label>
                            <Select value={selectedRuta} onValueChange={setSelectedRuta}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Todas las rutas" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">Todas las rutas</SelectItem>
                                    {rutas.map(ruta => (
                                        <SelectItem key={ruta.id} value={ruta.id.toString()}>
                                            {ruta.nombre}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        {/* Selector de Subruta */}
                        <div className="space-y-2">
                            <Label htmlFor="subruta">Filtrar por Subruta</Label>
                            <Select value={selectedSubruta} onValueChange={setSelectedSubruta}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Todas las subrutas" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">Todas las subrutas</SelectItem>
                                    {subrutas.map(subruta => (
                                        <SelectItem key={subruta.id} value={subruta.id.toString()}>
                                            {subruta.nombre} - {subruta.ruta.nombre}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        {/* Selector de Parámetro */}
                        <div className="space-y-2">
                            <Label htmlFor="parameter">Parámetro</Label>
                            <Select 
                                value={selectedParameter} 
                                onValueChange={(value: keyof typeof chartConfig) => setSelectedParameter(value)}
                            >
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    {Object.entries(chartConfig).map(([key, config]) => (
                                        <SelectItem key={key} value={key}>
                                            {config.label}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        {/* Selector de Tipo de Gráfica */}
                        <div className="space-y-2">
                            <Label htmlFor="chartType">Tipo de Gráfica</Label>
                            <Select value={chartType} onValueChange={(value: 'line' | 'bar') => setChartType(value)}>
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="line">Línea</SelectItem>
                                    <SelectItem value="bar">Barras</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Gráfica Principal */}
            <Card>
                <CardHeader>
                    <CardTitle>{chartConfig[selectedParameter].label} por Tiempo</CardTitle>
                    <CardDescription>
                        Evolución del parámetro seleccionado a lo largo del tiempo
                        {filteredData.length > 0 && ` - ${filteredData.length} registros mostrados`}
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    {chartData.length > 0 ? (
                        <ChartContainer 
                            config={{ [selectedParameter]: chartConfig[selectedParameter] }}
                            className="min-h-[400px] w-full"
                        >
                            <ResponsiveContainer width="100%" height="100%">
                                {chartType === 'line' ? (
                                    <LineChart data={chartData}>
                                        <CartesianGrid strokeDasharray="3 3" />
                                        <XAxis 
                                            dataKey="name"
                                            angle={-45}
                                            textAnchor="end"
                                            height={60}
                                        />
                                        <YAxis />
                                        <Tooltip />
                                        <Legend />
                                        <Line 
                                            type="monotone" 
                                            dataKey="value" 
                                            stroke={`var(--color-${selectedParameter})`}
                                            strokeWidth={2}
                                            dot={{ r: 4 }}
                                            activeDot={{ r: 6 }}
                                        />
                                    </LineChart>
                                ) : (
                                    <BarChart data={chartData}>
                                        <CartesianGrid strokeDasharray="3 3" />
                                        <XAxis 
                                            dataKey="name"
                                            angle={-45}
                                            textAnchor="end"
                                            height={60}
                                        />
                                        <YAxis />
                                        <Tooltip />
                                        <Legend />
                                        <Bar 
                                            dataKey="value" 
                                            fill={`var(--color-${selectedParameter})`}
                                            radius={[4, 4, 0, 0]}
                                        />
                                    </BarChart>
                                )}
                            </ResponsiveContainer>
                        </ChartContainer>
                    ) : (
                        <div className="flex flex-col items-center justify-center min-h-[400px] text-muted-foreground">
                            <p className="text-lg">No hay datos disponibles</p>
                            <p className="text-sm">Ajusta los filtros para ver los datos</p>
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Estadísticas */}
            {chartData.length > 0 && (
                <Card>
                    <CardHeader>
                        <CardTitle>Estadísticas</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            <div className="text-center">
                                <p className="text-2xl font-bold text-foreground">
                                    {chartData.length}
                                </p>
                                <p className="text-sm text-muted-foreground">Registros</p>
                            </div>
                            <div className="text-center">
                                <p className="text-2xl font-bold text-foreground">
                                    {Math.min(...chartData.map(d => d.value)).toFixed(2)}
                                </p>
                                <p className="text-sm text-muted-foreground">Mínimo</p>
                            </div>
                            <div className="text-center">
                                <p className="text-2xl font-bold text-foreground">
                                    {Math.max(...chartData.map(d => d.value)).toFixed(2)}
                                </p>
                                <p className="text-sm text-muted-foreground">Máximo</p>
                            </div>
                            <div className="text-center">
                                <p className="text-2xl font-bold text-foreground">
                                    {(chartData.reduce((a, b) => a + b.value, 0) / chartData.length).toFixed(2)}
                                </p>
                                <p className="text-sm text-muted-foreground">Promedio</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            )}
        </div>
    );
}