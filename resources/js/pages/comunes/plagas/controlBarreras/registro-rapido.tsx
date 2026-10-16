import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Toast } from '@/components/ui/toast';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, router, usePage } from '@inertiajs/react';
import {
    CheckCircle, XCircle, Building, Hash, AlertCircle,
    Save, ArrowLeft, Check, X, Loader2, Eye, EyeOff
} from 'lucide-react';
import { route } from 'ziggy-js';
import { useState, useMemo, useEffect } from 'react';

import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Módulos Comunes', href: '/modulos-comunes' },
    { title: 'Control de Plagas', href: '/plagas' },
    { title: 'Control de Barreras', href: '/plagas/control-barreras' },
    { title: 'Registro Rápido', href: '/plagas/control-barreras/registro-rapido' },
];

interface Barrera {
    id: number;
    codigo_interno: string | null;
    tipo: string | null;
    sector: { id: number; nombre: string } | null;
}

interface Sector {
    id: number;
    nombre: string;
}

interface PageProps {
    barreras: Barrera[];
    sectores: Sector[];
    flash: { success?: string; error?: string };
}

interface ControlLocal {
    barrera_plaga_id: number;
    estado: boolean;
    observacion: string;
    correcion: string;
    expanded: boolean;
}

export default function RegistroRapido() {
    const { props } = usePage();
    const { barreras = [], sectores = [], flash } = props as unknown as PageProps;
    const [saving, setSaving] = useState(false);
    const [controles, setControles] = useState<ControlLocal[]>([]);
    const [filtroSector, setFiltroSector] = useState<string>('');
    const [busqueda, setBusqueda] = useState('');

    // Inicializar los controles cuando se cargan las barreras
    useEffect(() => {
        if (barreras.length) {
            setControles(barreras.map(b => ({
                barrera_plaga_id: b.id,
                estado: true,        // por defecto conforme
                observacion: '',
                correcion: '',
                expanded: false,
            })));
        }
    }, [barreras]);

    // Agrupar barreras por sector
    const barrerasPorSector = useMemo(() => {
        let filtradas = barreras;

        if (filtroSector) {
            filtradas = filtradas.filter(b => b.sector?.id.toString() === filtroSector);
        }
        if (busqueda) {
            const q = busqueda.toLowerCase();
            filtradas = filtradas.filter(b =>
                (b.codigo_interno?.toLowerCase().includes(q)) ||
                (b.tipo?.toLowerCase().includes(q))
            );
        }

        const grupos: { [key: string]: Barrera[] } = {};
        filtradas.forEach(b => {
            const sectorNombre = b.sector?.nombre || 'Sin sector';
            if (!grupos[sectorNombre]) grupos[sectorNombre] = [];
            grupos[sectorNombre].push(b);
        });
        return grupos;
    }, [barreras, filtroSector, busqueda]);

    const actualizarControl = (id: number, campo: keyof ControlLocal, valor: any) => {
        setControles(prev => prev.map(c =>
            c.barrera_plaga_id === id ? { ...c, [campo]: valor } : c
        ));
    };

    const toggleExpand = (id: number) => {
        setControles(prev => prev.map(c =>
            c.barrera_plaga_id === id ? { ...c, expanded: !c.expanded } : c
        ));
    };

    const marcarTodasPorSector = (sectorNombre: string, estado: boolean) => {
        const idsEnSector = barrerasPorSector[sectorNombre].map(b => b.id);
        setControles(prev => prev.map(c =>
            idsEnSector.includes(c.barrera_plaga_id) ? { ...c, estado } : c
        ));
    };

    const guardarTodo = () => {
        // Solo enviar los controles que el usuario ha modificado o todos? Enviamos todos
        const payload = {
            controles: controles.map(({ barrera_plaga_id, estado, observacion, correcion }) => ({
                barrera_plaga_id,
                estado,
                observacion,
                correcion,
            }))
        };

        setSaving(true);
        router.post(route('plagas.control-barreras.store-rapido'), payload, {
            preserveScroll: true,
            onFinish: () => setSaving(false),
        });
    };

    const totalRegistros = barreras.length;
    const conformes = controles.filter(c => c.estado).length;
    const noConformes = totalRegistros - conformes;

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Registro Rápido - Barreras" />
            <Toast />
            <div className="px-2 sm:px-4 py-4 space-y-4">
                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                    <div>
                        <h1 className="text-xl font-bold">Registro Rápido de Barreras</h1>
                        <p className="text-sm text-muted-foreground mt-1">
                            Marque el estado de cada barrera y guarde todos los registros de una vez
                        </p>
                    </div>
                    <div className="flex gap-2">
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => router.get(route('plagas.control-barreras.index'))}
                        >
                            <ArrowLeft className="h-4 w-4 mr-1" /> Volver
                        </Button>
                        <Button
                            onClick={guardarTodo}
                            disabled={saving}
                            className="flex items-center gap-2"
                        >
                            {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                            Guardar todo ({totalRegistros})
                        </Button>
                    </div>
                </div>

                {/* Estadísticas rápidas */}
                <div className="grid grid-cols-3 gap-3">
                    <Card className="p-3 text-center">
                        <p className="text-xs text-muted-foreground">Total barreras</p>
                        <p className="text-xl font-bold">{totalRegistros}</p>
                    </Card>
                    <Card className="p-3 text-center border-green-200 bg-green-50/30">
                        <p className="text-xs text-muted-foreground">Conformes</p>
                        <p className="text-xl font-bold text-green-700">{conformes}</p>
                    </Card>
                    <Card className="p-3 text-center border-red-200 bg-red-50/30">
                        <p className="text-xs text-muted-foreground">No conformes</p>
                        <p className="text-xl font-bold text-red-700">{noConformes}</p>
                    </Card>
                </div>

                {/* Filtros */}
                <Card className="p-3">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div className="space-y-1">
                            <Label className="text-xs">Filtrar por sector</Label>
                            <select
                                value={filtroSector}
                                onChange={(e) => setFiltroSector(e.target.value)}
                                className="w-full px-3 py-2 border rounded-md text-sm h-9"
                            >
                                <option value="">Todos los sectores</option>
                                {sectores.map(s => (
                                    <option key={s.id} value={s.id.toString()}>{s.nombre}</option>
                                ))}
                            </select>
                        </div>
                        <div className="space-y-1">
                            <Label className="text-xs">Buscar por código o tipo</Label>
                            <Input
                                placeholder="Código o tipo..."
                                value={busqueda}
                                onChange={(e) => setBusqueda(e.target.value)}
                                className="h-9 text-sm"
                            />
                        </div>
                    </div>
                </Card>

                {/* Listado por sectores */}
                <div className="space-y-4">
                    {Object.entries(barrerasPorSector).map(([sectorNombre, barrerasDelSector]) => (
                        <Card key={sectorNombre} className="overflow-hidden">
                            <div className="bg-muted/30 px-4 py-2 flex flex-wrap items-center justify-between gap-2 border-b">
                                <div className="flex items-center gap-2">
                                    <Building className="h-4 w-4 text-muted-foreground" />
                                    <h3 className="font-semibold">{sectorNombre}</h3>
                                    <Badge variant="outline" className="text-xs">
                                        {barrerasDelSector.length}
                                    </Badge>
                                </div>
                                <div className="flex gap-1">
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        className="h-7 text-xs text-green-600"
                                        onClick={() => marcarTodasPorSector(sectorNombre, true)}
                                    >
                                        <Check className="h-3 w-3 mr-1" /> Todas conformes
                                    </Button>
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        className="h-7 text-xs text-red-600"
                                        onClick={() => marcarTodasPorSector(sectorNombre, false)}
                                    >
                                        <X className="h-3 w-3 mr-1" /> Todas no conformes
                                    </Button>
                                </div>
                            </div>
                            <div className="divide-y">
                                {barrerasDelSector.map((barrera) => {
                                    const control = controles.find(c => c.barrera_plaga_id === barrera.id);
                                    if (!control) return null;
                                    return (
                                        <div key={barrera.id} className="p-3 hover:bg-muted/30 transition-colors">
                                            <div className="flex flex-wrap items-start justify-between gap-2">
                                                <div className="flex-1 min-w-0">
                                                    <div className="flex items-center gap-2 flex-wrap">
                                                        <Badge variant="outline" className="font-mono text-xs">
                                                            <Hash className="h-3 w-3 mr-1" />
                                                            {barrera.codigo_interno || 'S/C'}
                                                        </Badge>
                                                        <span className="text-sm font-medium">{barrera.tipo || 'Sin tipo'}</span>
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <Button
                                                        variant={control.estado ? "default" : "outline"}
                                                        size="sm"
                                                        className={`h-8 px-3 ${control.estado ? 'bg-green-600 hover:bg-green-700' : ''}`}
                                                        onClick={() => actualizarControl(barrera.id, 'estado', true)}
                                                    >
                                                        <CheckCircle className="h-3.5 w-3.5 mr-1" />
                                                        Conforme
                                                    </Button>
                                                    <Button
                                                        variant={!control.estado ? "destructive" : "outline"}
                                                        size="sm"
                                                        className="h-8 px-3"
                                                        onClick={() => actualizarControl(barrera.id, 'estado', false)}
                                                    >
                                                        <XCircle className="h-3.5 w-3.5 mr-1" />
                                                        No conforme
                                                    </Button>
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        className="h-8 w-8 p-0"
                                                        onClick={() => toggleExpand(barrera.id)}
                                                    >
                                                        {control.expanded ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                                    </Button>
                                                </div>
                                            </div>

                                            {control.expanded && (
                                                <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 border-t">
                                                    <div>
                                                        <Label className="text-xs">Observación</Label>
                                                        <Textarea
                                                            value={control.observacion}
                                                            onChange={(e) => actualizarControl(barrera.id, 'observacion', e.target.value)}
                                                            placeholder="Describa la condición..."
                                                            rows={2}
                                                            className="text-sm mt-1"
                                                        />
                                                    </div>
                                                    <div>
                                                        <Label className="text-xs">Corrección / Acción</Label>
                                                        <Textarea
                                                            value={control.correcion}
                                                            onChange={(e) => actualizarControl(barrera.id, 'correcion', e.target.value)}
                                                            placeholder="Acciones correctivas..."
                                                            rows={2}
                                                            className="text-sm mt-1"
                                                        />
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    );
                                })}
                            </div>
                        </Card>
                    ))}
                </div>

                {Object.keys(barrerasPorSector).length === 0 && (
                    <div className="text-center py-12">
                        <AlertCircle className="h-12 w-12 mx-auto text-muted-foreground/50 mb-3" />
                        <p className="text-muted-foreground">No hay barreras activas en esta ubicación</p>
                    </div>
                )}
            </div>
        </AppLayout>
    );
}