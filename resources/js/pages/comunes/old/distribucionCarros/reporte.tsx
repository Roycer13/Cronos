import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, router, usePage, Link } from '@inertiajs/react';
import { FileText, ArrowLeft, Filter, Printer, CheckCircle2, XCircle } from 'lucide-react';
import { route } from 'ziggy-js';
import { useState } from 'react';
import { Label } from '@/components/ui/label';
import FechaHora from '@/components/ui/fecha-hora';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Módulos Comunes', href: '/modulos-comunes' },
    { title: 'Old', href: '#' },
    { title: 'Distribución de Carros', href: '/old/distribucion-carros' },
    { title: 'Reporte', href: '#' },
];

interface DistribucionCarro {
    id: number;
    fecha: string;
    destino: string | null;
    placa: string | null;
    paredes_externas: boolean;
    limpieza_interno: boolean;
    ausencia_objetos_olores: boolean;
    set_temperatura: number;
    bph_chofer: boolean;
    bph_ayudante: boolean;
    observaciones: string | null;
    correciones: string | null;
    usuario: { id: number; name: string } | null;
}

interface PageProps {
    registros: DistribucionCarro[];
    filters: Record<string, string | undefined>;
}

export default function DistribucionCarrosReporte() {
    const { props } = usePage();
    const { registros = [], filters: initF = {} } = props as unknown as PageProps;
    
    const [fechaInicio, setFechaInicio] = useState(initF.fecha_inicio || '');
    const [fechaFin, setFechaFin] = useState(initF.fecha_fin || '');

    const handleFilter = () => {
        router.get(route('old-distribucion-carros.reporte'), {
            fecha_inicio: fechaInicio,
            fecha_fin: fechaFin,
        }, { preserveState: true });
    };

    const handlePrint = () => {
        window.print();
    };

    const renderBoolean = (val: boolean) => {
        return val ? <CheckCircle2 className="h-4 w-4 text-green-500 mx-auto" /> : <XCircle className="h-4 w-4 text-red-500 mx-auto" />;
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Reporte - Distribución de Carros" />
            
            <div className="px-2 sm:px-6 py-4 space-y-4 print:p-0">
                <div className="flex items-center justify-between print:hidden">
                    <div className="flex items-center gap-4">
                        <Link href={route('old-distribucion-carros.index')}>
                            <Button variant="ghost" size="icon"><ArrowLeft className="h-5 w-5" /></Button>
                        </Link>
                        <div>
                            <h1 className="text-2xl font-bold flex items-center gap-2">
                                <FileText className="h-6 w-6 text-primary" /> Reporte de Distribución
                            </h1>
                            <p className="text-muted-foreground mt-1">Reporte detallado de los carros distribuidos</p>
                        </div>
                    </div>
                    <Button onClick={handlePrint} variant="outline" className="flex items-center gap-2">
                        <Printer className="h-4 w-4" /> Imprimir
                    </Button>
                </div>

                <Card className="p-4 print:hidden">
                    <div className="flex flex-col md:flex-row gap-4 items-end">
                        <div className="space-y-2 flex-1">
                            <Label>Fecha Inicio</Label>
                            <Input type="date" value={fechaInicio} onChange={(e) => setFechaInicio(e.target.value)} />
                        </div>
                        <div className="space-y-2 flex-1">
                            <Label>Fecha Fin</Label>
                            <Input type="date" value={fechaFin} onChange={(e) => setFechaFin(e.target.value)} />
                        </div>
                        <Button onClick={handleFilter} className="flex items-center gap-2">
                            <Filter className="h-4 w-4" /> Filtrar
                        </Button>
                    </div>
                </Card>

                <div className="hidden print:block mb-4 text-center">
                    <h1 className="text-2xl font-bold">REPORTE DE DISTRIBUCIÓN DE CARROS</h1>
                    {(fechaInicio || fechaFin) && (
                        <p className="text-sm">Período: {fechaInicio || 'Inicio'} al {fechaFin || 'Fin'}</p>
                    )}
                </div>

                <Card className="print:shadow-none print:border-none">
                    <div className="overflow-x-auto">
                        <Table className="text-xs sm:text-sm">
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Fecha</TableHead>
                                    <TableHead>Destino</TableHead>
                                    <TableHead>Placa</TableHead>
                                    <TableHead className="text-center" title="Paredes Externas OK">P. Ext.</TableHead>
                                    <TableHead className="text-center" title="Limpieza Interno OK">L. Int.</TableHead>
                                    <TableHead className="text-center" title="Ausencia Objetos/Olores">Aus. O/O</TableHead>
                                    <TableHead>Temp (°C)</TableHead>
                                    <TableHead className="text-center" title="BPH Chofer">Chofer</TableHead>
                                    <TableHead className="text-center" title="BPH Ayudante">Ayudante</TableHead>
                                    <TableHead>Resp.</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {registros.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={10} className="text-center py-10 text-muted-foreground">
                                            No hay registros para el período seleccionado
                                        </TableCell>
                                    </TableRow>
                                ) : registros.map((t) => (
                                    <TableRow key={t.id} className="hover:bg-muted/50">
                                        <TableCell className="whitespace-nowrap"><FechaHora value={t.fecha} /></TableCell>
                                        <TableCell>{t.destino}</TableCell>
                                        <TableCell className="whitespace-nowrap">{t.placa}</TableCell>
                                        <TableCell className="text-center">{renderBoolean(t.paredes_externas)}</TableCell>
                                        <TableCell className="text-center">{renderBoolean(t.limpieza_interno)}</TableCell>
                                        <TableCell className="text-center">{renderBoolean(t.ausencia_objetos_olores)}</TableCell>
                                        <TableCell className="text-right">{t.set_temperatura}</TableCell>
                                        <TableCell className="text-center">{renderBoolean(t.bph_chofer)}</TableCell>
                                        <TableCell className="text-center">{renderBoolean(t.bph_ayudante)}</TableCell>
                                        <TableCell>{t.usuario?.name?.split(' ')[0]}</TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </div>
                </Card>
            </div>
        </AppLayout>
    );
}
