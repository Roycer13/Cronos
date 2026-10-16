import React, { useState } from 'react';
import AppLayout from '@/layouts/app-layout';
import { Head, Link, router, usePage } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
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
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import {
    Plus,
    Edit,
    Trash2,
    Printer,
} from 'lucide-react';
import { route } from 'ziggy-js';
import { PDFViewer } from '@react-pdf/renderer';
import ReporteDispositivosMedicion from '@/pdf/ReporteDispositivosMedicion';
import TablePagination from '@/components/ui/table-pagination';
import { type BreadcrumbItem } from '@/types';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Planta Lácteos', href: '/planta-lacteos' },
    { title: 'Dispositivos de Medición', href: '#' },
];

interface Dispositivo {
    id: number;
    codigo: string;
    dispositivo: string;
    marca: string;
    modelo: string;
    capacidadMedicion: string;
    rangoUso: string;
    areaUso: string;
    responsable: string;
    baja: boolean;
    observaciones: string;
    created_at: string;
    updated_at: string;
}

interface PageProps {
    dispositivos: {
        data: Dispositivo[];
        links: any[];
        current_page: number;
        last_page: number;
        per_page: number;
        total: number;
    };
}

export default function AdminDispositivosMedicion() {
    const { props } = usePage<PageProps>();
    const { dispositivos } = props;

    const [openDialog, setOpenDialog] = useState(false);
    const [editingId, setEditingId] = useState<number | null>(null);
    const [deleteId, setDeleteId] = useState<number | null>(null);
    const [showReport, setShowReport] = useState(false);
    const [reporteData, setReporteData] = useState<any>(null);

    const [formData, setFormData] = useState({
        codigo: '',
        dispositivo: '',
        marca: '',
        modelo: '',
        capacidadMedicion: '',
        rangoUso: '',
        areaUso: '',
        responsable: '',
        baja: false,
        observaciones: '',
    });

    const handleNew = () => {
        setEditingId(null);
        setFormData({
            codigo: '',
            dispositivo: '',
            marca: '',
            modelo: '',
            capacidadMedicion: '',
            rangoUso: '',
            areaUso: '',
            responsable: '',
            baja: false,
            observaciones: '',
        });
        setOpenDialog(true);
    };

    const handleEdit = (dispositivo: Dispositivo) => {
        setEditingId(dispositivo.id);
        setFormData({
            codigo: dispositivo.codigo || '',
            dispositivo: dispositivo.dispositivo || '',
            marca: dispositivo.marca || '',
            modelo: dispositivo.modelo || '',
            capacidadMedicion: dispositivo.capacidadMedicion || '',
            rangoUso: dispositivo.rangoUso || '',
            areaUso: dispositivo.areaUso || '',
            responsable: dispositivo.responsable || '',
            baja: dispositivo.baja || false,
            observaciones: dispositivo.observaciones || '',
        });
        setOpenDialog(true);
    };

    const handleSave = () => {
        // Validación simple del campo obligatorio
        if (!formData.dispositivo.trim()) {
            alert('El campo "Dispositivo" es obligatorio.');
            return;
        }

        if (editingId) {
            router.put(
                route('dispositivos-medicion.update', editingId),
                formData,
                {
                    onSuccess: () => {
                        setOpenDialog(false);
                    },
                }
            );
        } else {
            router.post(
                route('dispositivos-medicion.store'),
                formData,
                {
                    onSuccess: () => {
                        setOpenDialog(false);
                    },
                }
            );
        }
    };

    const handleDelete = () => {
        if (deleteId) {
            router.delete(
                route('dispositivos-medicion.destroy', deleteId),
                {
                    onSuccess: () => {
                        setDeleteId(null);
                    },
                }
            );
        }
    };

    const handleGenerateReport = async () => {
        try {
            const response = await fetch(route('dispositivos-medicion.reporte'));
            const data = await response.json();
            setReporteData(data);
            setShowReport(true);
        } catch (error) {
            console.error('Error al generar reporte:', error);
        }
    };

    const handlePageChange = (page: number) => {
        router.get(
            route('dispositivos-medicion.index'),
            { page: page },
            { preserveState: true, preserveScroll: true }
        );
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Administración de Dispositivos de Medición" />

            <div className="p-6 bg-white rounded-lg shadow">
                <div className="flex justify-between items-center mb-6">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900">
                            Dispositivos de Medición
                        </h1>
                        <p className="text-gray-600 mt-1">
                            Gestión centralizada de todos los dispositivos
                        </p>
                    </div>
                    <div className="flex gap-2">
                        <Button
                            onClick={handleGenerateReport}
                            variant="outline"
                            className="gap-2"
                        >
                            <Printer className="h-4 w-4" />
                            Reporte
                        </Button>
                        <Button onClick={handleNew} className="gap-2">
                            <Plus className="h-4 w-4" />
                            Nuevo
                        </Button>
                    </div>
                </div>

                {/* Tabla de dispositivos */}
                <div className="overflow-x-auto">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Código</TableHead>
                                <TableHead>Dispositivo</TableHead>
                                <TableHead>Marca</TableHead>
                                <TableHead>Modelo</TableHead>
                                <TableHead>Rango de Uso</TableHead>
                                <TableHead>Área</TableHead>
                                <TableHead>Responsable</TableHead>
                                <TableHead>Estado</TableHead>
                                <TableHead>Acciones</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {dispositivos.data.map((dispositivo) => (
                                <TableRow key={dispositivo.id}>
                                    <TableCell className="font-medium">
                                        {dispositivo.codigo || '-'}
                                    </TableCell>
                                    <TableCell>{dispositivo.dispositivo}</TableCell>
                                    <TableCell>{dispositivo.marca || '-'}</TableCell>
                                    <TableCell>{dispositivo.modelo || '-'}</TableCell>
                                    <TableCell>{dispositivo.rangoUso || '-'}</TableCell>
                                    <TableCell>{dispositivo.areaUso || '-'}</TableCell>
                                    <TableCell>{dispositivo.responsable || '-'}</TableCell>
                                    <TableCell>
                                        <span
                                            className={`inline-flex items-center px-2 py-1 rounded text-xs font-medium ${
                                                dispositivo.baja
                                                    ? 'bg-red-100 text-red-800'
                                                    : 'bg-green-100 text-green-800'
                                            }`}
                                        >
                                            {dispositivo.baja ? 'Baja' : 'Activo'}
                                        </span>
                                    </TableCell>
                                    <TableCell>
                                        <div className="flex gap-2">
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                onClick={() => handleEdit(dispositivo)}
                                            >
                                                <Edit className="h-4 w-4" />
                                            </Button>
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                onClick={() => setDeleteId(dispositivo.id)}
                                                className="text-red-600"
                                            >
                                                <Trash2 className="h-4 w-4" />
                                            </Button>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </div>

                {/* Paginación */}
                <div className="mt-6">
                    <TablePagination
                        pagination={{
                            current_page: dispositivos.current_page,
                            last_page: dispositivos.last_page,
                            per_page: dispositivos.per_page,
                            total: dispositivos.total,
                        }}
                        onPageChange={handlePageChange}
                    />
                </div>
            </div>

            {/* Dialog para crear/editar (MEJORADO) */}
            <Dialog open={openDialog} onOpenChange={setOpenDialog}>
                <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle className="text-xl">
                            {editingId ? 'Editar Dispositivo' : 'Nuevo Dispositivo'}
                        </DialogTitle>
                    </DialogHeader>

                    <div className="space-y-6 py-4">
                        {/* Sección: Información básica */}
                        <div>
                            <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wider mb-3">
                                Información del dispositivo
                            </h3>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div className="sm:col-span-2">
                                    <Label htmlFor="dispositivo" className="required">
                                        Dispositivo *
                                    </Label>
                                    <Input
                                        id="dispositivo"
                                        value={formData.dispositivo}
                                        onChange={(e) =>
                                            setFormData({ ...formData, dispositivo: e.target.value })
                                        }
                                        placeholder="Ej. Termómetro, Refractómetro"
                                        required
                                        className="mt-1"
                                    />
                                </div>
                                <div>
                                    <Label htmlFor="codigo">Código</Label>
                                    <Input
                                        id="codigo"
                                        value={formData.codigo}
                                        onChange={(e) =>
                                            setFormData({ ...formData, codigo: e.target.value })
                                        }
                                        placeholder="Ej. DM-001"
                                        className="mt-1"
                                    />
                                </div>
                                <div>
                                    <Label htmlFor="marca">Marca</Label>
                                    <Input
                                        id="marca"
                                        value={formData.marca}
                                        onChange={(e) =>
                                            setFormData({ ...formData, marca: e.target.value })
                                        }
                                        placeholder="Ej. Hanna Instruments"
                                        className="mt-1"
                                    />
                                </div>
                                <div>
                                    <Label htmlFor="modelo">Modelo</Label>
                                    <Input
                                        id="modelo"
                                        value={formData.modelo}
                                        onChange={(e) =>
                                            setFormData({ ...formData, modelo: e.target.value })
                                        }
                                        placeholder="Ej. HI 98103"
                                        className="mt-1"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Sección: Medición */}
                        <div>
                            <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wider mb-3">
                                Medición
                            </h3>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div>
                                    <Label htmlFor="capacidadMedicion">
                                        Capacidad de Medición
                                    </Label>
                                    <Input
                                        id="capacidadMedicion"
                                        value={formData.capacidadMedicion}
                                        onChange={(e) =>
                                            setFormData({
                                                ...formData,
                                                capacidadMedicion: e.target.value,
                                            })
                                        }
                                        placeholder="Ej. 0-100 °C"
                                        className="mt-1"
                                    />
                                </div>
                                <div>
                                    <Label htmlFor="rangoUso">Rango de Uso</Label>
                                    <Input
                                        id="rangoUso"
                                        value={formData.rangoUso}
                                        onChange={(e) =>
                                            setFormData({ ...formData, rangoUso: e.target.value })
                                        }
                                        placeholder="Ej. 10-80 °C"
                                        className="mt-1"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Sección: Ubicación y responsable */}
                        <div>
                            <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wider mb-3">
                                Ubicación y responsable
                            </h3>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div>
                                    <Label htmlFor="areaUso">Área de Uso</Label>
                                    <Input
                                        id="areaUso"
                                        value={formData.areaUso}
                                        onChange={(e) =>
                                            setFormData({ ...formData, areaUso: e.target.value })
                                        }
                                        placeholder="Ej. Laboratorio de calidad"
                                        className="mt-1"
                                    />
                                </div>
                                <div>
                                    <Label htmlFor="responsable">Responsable</Label>
                                    <Input
                                        id="responsable"
                                        value={formData.responsable}
                                        onChange={(e) =>
                                            setFormData({
                                                ...formData,
                                                responsable: e.target.value,
                                            })
                                        }
                                        placeholder="Nombre del responsable"
                                        className="mt-1"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Sección: Estado y observaciones */}
                        <div>
                            <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wider mb-3">
                                Estado y observaciones
                            </h3>
                            <div className="space-y-4">
                                <div className="flex items-center gap-2">
                                    <input
                                        type="checkbox"
                                        id="baja"
                                        checked={formData.baja}
                                        onChange={(e) =>
                                            setFormData({ ...formData, baja: e.target.checked })
                                        }
                                        className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                                    />
                                    <Label htmlFor="baja" className="cursor-pointer">
                                        Dar de baja este dispositivo
                                    </Label>
                                </div>
                                <div>
                                    <Label htmlFor="observaciones">Observaciones</Label>
                                    <textarea
                                        id="observaciones"
                                        value={formData.observaciones}
                                        onChange={(e) =>
                                            setFormData({
                                                ...formData,
                                                observaciones: e.target.value,
                                            })
                                        }
                                        className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        rows={3}
                                        placeholder="Notas adicionales..."
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Botones de acción */}
                        <div className="flex gap-3 justify-end pt-4 border-t">
                            <Button
                                variant="outline"
                                onClick={() => setOpenDialog(false)}
                            >
                                Cancelar
                            </Button>
                            <Button onClick={handleSave}>
                                {editingId ? 'Actualizar' : 'Crear'}
                            </Button>
                        </div>
                    </div>
                </DialogContent>
            </Dialog>

            {/* Alert Dialog para confirmar eliminación */}
            <AlertDialog open={deleteId !== null} onOpenChange={() => setDeleteId(null)}>
                <AlertDialogContent>
                    <AlertDialogTitle>Eliminar Dispositivo</AlertDialogTitle>
                    <AlertDialogDescription>
                        ¿Está seguro de que desea eliminar este dispositivo? Esta acción no se
                        puede deshacer.
                    </AlertDialogDescription>
                    <div className="flex gap-2 justify-end">
                        <AlertDialogCancel>Cancelar</AlertDialogCancel>
                        <AlertDialogAction onClick={handleDelete} className="bg-red-600">
                            Eliminar
                        </AlertDialogAction>
                    </div>
                </AlertDialogContent>
            </AlertDialog>

            {/* PDF Reporte */}
            {showReport && reporteData && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80">
                    <div className="relative h-[95vh] w-[95vw] overflow-hidden rounded-lg bg-white shadow-2xl">
                        <button
                            className="absolute top-4 right-4 z-50 flex h-8 w-8 items-center justify-center rounded-full bg-red-600 text-white hover:bg-red-700"
                            onClick={() => setShowReport(false)}
                        >
                            ✕
                        </button>
                        <div className="h-full">
                            <PDFViewer
                                style={{
                                    width: '100%',
                                    height: '100%',
                                    border: 'none',
                                }}
                            >
                                <ReporteDispositivosMedicion
                                    dispositivos={reporteData.dispositivos}
                                />
                            </PDFViewer>
                        </div>
                    </div>
                </div>
            )}
        </AppLayout>
    );
}