import { Button } from '@/components/ui/button';
import FormInput from '@/components/ui/form-input';
import FormSelect from '@/components/ui/form-select';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, useForm } from '@inertiajs/react';
import { Info, X } from 'lucide-react';
import * as React from 'react';
import { route } from 'ziggy-js';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Movimientos de Almacén',
        href: '/mantenimiento/almacen/movimientos',
    },
    {
        title: 'Crear Movimiento',
        href: '/mantenimiento/almacen/movimientos/crear',
    },
];

interface PageProps {
    ubicaciones: { id: number; nombre: string }[];
    tipos: {
        value: string;
        tipo: number;
        descripcion: string;
        label: string;
    }[];
    ots: { id: number; numero: string }[];
    proveedores: { id: number; nombre: string }[];
    estados: { id: number; nombre: string }[];
    repuestos: { id: number; label: string; codigo: string; nombre: string }[];
}

export default function CrearAlmacenMovimiento({
    ubicaciones = [],
    tipos = [],
    ots = [],
    proveedores = [],
    repuestos = [],
}: PageProps) {
    const { data, setData, post, processing, errors } = useForm({
        ubicacion_id: '',
        tipo: '',
        tipo_descripcion: '',
        ot_id: '',
        proveedor_id: '',
        estado_id: '',
        observacion: '',
        detalles: [] as {
            repuesto_id: string;
            cantidad: string;
            precio: string;
            id?: number;
        }[],
    });

    const [detalleActual, setDetalleActual] = React.useState({
        repuesto_id: '',
        cantidad: '',
        precio: '',
    });

    const [stockDisponible, setStockDisponible] = React.useState<number | null>(null);
    const [cargandoStock, setCargandoStock] = React.useState(false);

    const esSalida = data.tipo === 0; // 0 = salida, 1 = ingreso
    const esIngresoCompraOAjuste =
        !esSalida &&
        (data.tipo_descripcion === 'Compra' || data.tipo_descripcion === 'Ajuste (Entrada)');

    // Obtener precio actual del repuesto (solo para egresos)
    const fetchPrecioRepuesto = React.useCallback(
        async (repuestoId: string) => {
            if (!repuestoId || !esSalida) return;
            try {
                const response = await fetch(route('repuestos.precio', repuestoId));
                const result = await response.json();
                setDetalleActual((prev) => ({
                    ...prev,
                    precio: result.precio_relativo?.toString() || '',
                }));
            } catch (error) {
                console.error('Error al obtener precio:', error);
                setDetalleActual((prev) => ({ ...prev, precio: '' }));
            }
        },
        [esSalida],
    );

    // Obtener stock disponible (solo para egresos)
    React.useEffect(() => {
        const fetchStock = async () => {
            if (data.ubicacion_id && detalleActual.repuesto_id && esSalida) {
                setCargandoStock(true);
                try {
                    const response = await fetch(
                        route('almacen.stock.disponible', {
                            ubicacion_id: data.ubicacion_id,
                            repuesto_id: detalleActual.repuesto_id,
                        }),
                    );
                    const result = await response.json();
                    setStockDisponible(result.stock);
                } catch (error) {
                    console.error('Error al obtener stock:', error);
                    setStockDisponible(null);
                } finally {
                    setCargandoStock(false);
                }
            } else {
                setStockDisponible(null);
            }
        };

        const timeout = setTimeout(fetchStock, 300);
        return () => clearTimeout(timeout);
    }, [data.ubicacion_id, detalleActual.repuesto_id, esSalida]);

    // Si cambia el tipo de movimiento (de ingreso a egreso), reiniciar precio automático
    React.useEffect(() => {
        if (esSalida && detalleActual.repuesto_id) {
            fetchPrecioRepuesto(detalleActual.repuesto_id);
        } else if (!esSalida) {
            setDetalleActual((prev) => ({ ...prev, precio: '' }));
        }
    }, [esSalida, detalleActual.repuesto_id, fetchPrecioRepuesto]);

    const handleTipoChange = (selectedValue: string) => {
        const selected = tipos.find((t) => t.value === selectedValue);
        if (selected) {
            setData({
                ...data,
                tipo: selected.tipo,
                tipo_descripcion: selected.descripcion,
                ot_id: '',
                proveedor_id: '',
            });
            setData('detalles', []); // Limpiar detalles al cambiar tipo
        } else {
            setData({
                ...data,
                tipo: '',
                tipo_descripcion: '',
                ot_id: '',
                proveedor_id: '',
            });
        }
    };

    const agregarDetalle = () => {
        if (!detalleActual.repuesto_id) {
            alert('Seleccione un repuesto');
            return;
        }
        const cantidad = parseFloat(detalleActual.cantidad);
        if (isNaN(cantidad) || cantidad <= 0) {
            alert('Ingrese una cantidad válida');
            return;
        }

        if (esSalida && stockDisponible !== null && cantidad > stockDisponible) {
            alert(`La cantidad excede el stock disponible (${stockDisponible})`);
            return;
        }

        if (data.detalles.some((d) => d.repuesto_id === detalleActual.repuesto_id)) {
            alert('El repuesto ya está agregado');
            return;
        }

        const precio = parseFloat(detalleActual.precio);
        if (esIngresoCompraOAjuste && (isNaN(precio) || precio <= 0)) {
            alert('Debe ingresar un precio válido para el repuesto');
            return;
        }

        setData('detalles', [
            ...data.detalles,
            { ...detalleActual, id: Date.now() },
        ]);
        setDetalleActual({ repuesto_id: '', cantidad: '', precio: '' });
        setStockDisponible(null);
    };

    const eliminarDetalle = (index: number) => {
        setData(
            'detalles',
            data.detalles.filter((_, i) => i !== index),
        );
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        post(route('almacen.movimientos.guardar'));
    };

    // Manejador para evitar que Enter envíe el formulario y en su lugar agregue el detalle
    const handleDetailKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            agregarDetalle();
        }
    };

    const mostrarOT =
        data.tipo_descripcion === 'OT salida' || data.tipo_descripcion === 'OT devolución';
    const mostrarProveedor = data.tipo_descripcion === 'Compra';

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Crear Movimiento de Almacén" />
            <div className="mx-auto max-w-6xl px-4 py-4 sm:px-6">
                <div className="mb-6">
                    <h1 className="text-2xl font-bold text-foreground">
                        Crear Movimiento de Almacén
                    </h1>
                    <p className="mt-1 text-sm text-muted-foreground">
                        Complete la información para registrar un nuevo movimiento de repuestos
                    </p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Información General */}
                    <div className="rounded-lg border border-border bg-card p-4 shadow-sm">
                        <div className="mb-4">
                            <h2 className="flex items-center text-base font-semibold text-foreground">
                                <div className="mr-2 h-1.5 w-1.5 rounded-full bg-primary"></div>
                                Información General
                            </h2>
                        </div>
                        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                            <FormSelect
                                label="Ubicación *"
                                value={data.ubicacion_id}
                                onChange={(v) => setData('ubicacion_id', v)}
                                placeholder="Seleccione ubicación"
                                options={ubicaciones.map((u) => ({
                                    value: u.id.toString(),
                                    label: u.nombre,
                                }))}
                                error={errors.ubicacion_id}
                            />
                            <FormSelect
                                label="Tipo de Movimiento *"
                                value={
                                    tipos.find(
                                        (t) =>
                                            t.tipo === data.tipo &&
                                            t.descripcion === data.tipo_descripcion,
                                    )?.value || ''
                                }
                                onChange={handleTipoChange}
                                placeholder="Seleccione tipo"
                                options={tipos.map((t) => ({
                                    value: t.value,
                                    label: t.label,
                                }))}
                                error={errors.tipo}
                            />
                            {mostrarOT && (
                                <FormSelect
                                    label="Orden de Trabajo *"
                                    value={data.ot_id}
                                    onChange={(v) => setData('ot_id', v)}
                                    placeholder="Seleccione OT"
                                    options={ots.map((o) => ({
                                        value: o.id.toString(),
                                        label: o.numero,
                                    }))}
                                    error={errors.ot_id}
                                />
                            )}
                            {mostrarProveedor && (
                                <FormSelect
                                    label="Proveedor *"
                                    value={data.proveedor_id}
                                    onChange={(v) => setData('proveedor_id', v)}
                                    placeholder="Seleccione proveedor"
                                    options={proveedores.map((p) => ({
                                        value: p.id.toString(),
                                        label: p.nombre,
                                    }))}
                                    error={errors.proveedor_id}
                                />
                            )}
                            <FormInput
                                id="observacion"
                                label="Observación"
                                value={data.observacion}
                                onChange={(e) => setData('observacion', e.target.value)}
                                placeholder="Notas adicionales"
                                error={errors.observacion}
                            />
                        </div>
                    </div>

                    {/* Detalles de Repuestos */}
                    <div className="rounded-lg border border-border bg-card p-4 shadow-sm">
                        <div className="mb-4">
                            <h2 className="flex items-center text-base font-semibold text-foreground">
                                <div className="mr-2 h-1.5 w-1.5 rounded-full bg-green-500"></div>
                                Detalles de Repuestos
                                {esSalida && (
                                    <span className="ml-2 text-xs text-muted-foreground">
                                        (Solo se permite cantidad disponible en stock)
                                    </span>
                                )}
                            </h2>
                        </div>

                        {/* Lista de detalles agregados */}
                        {data.detalles.length > 0 && (
                            <div className="mb-4 space-y-2">
                                {data.detalles.map((detalle, index) => (
                                    <div
                                        key={detalle.id}
                                        className="flex items-center justify-between rounded-md bg-muted/50 p-2"
                                    >
                                        <div className="grid flex-1 grid-cols-3 gap-2">
                                            <span className="text-sm font-medium">
                                                {
                                                    repuestos.find(
                                                        (r) =>
                                                            r.id === parseInt(detalle.repuesto_id),
                                                    )?.label
                                                }
                                            </span>
                                            <span className="text-sm">
                                                Cantidad: {detalle.cantidad}
                                            </span>
                                            <span className="text-sm">
                                                Precio: ${parseFloat(detalle.precio).toFixed(2)}
                                            </span>
                                        </div>
                                        <Button
                                            type="button"
                                            variant="ghost"
                                            size="icon"
                                            onClick={() => eliminarDetalle(index)}
                                            className="h-8 w-8 text-destructive hover:text-destructive"
                                        >
                                            <X className="h-4 w-4" />
                                        </Button>
                                    </div>
                                ))}
                            </div>
                        )}

                        {/* Formulario para agregar nuevo detalle (con onKeyDown para evitar submit) */}
                        <div onKeyDown={handleDetailKeyDown}>
                            <div className="grid grid-cols-1 gap-4 sm:grid-cols-4 items-end">
                                <FormSelect
                                    label="Repuesto"
                                    value={detalleActual.repuesto_id}
                                    onChange={(v) => {
                                        setDetalleActual({
                                            ...detalleActual,
                                            repuesto_id: v,
                                            precio: '',
                                        });
                                        if (esSalida && v) fetchPrecioRepuesto(v);
                                    }}
                                    placeholder="Seleccione repuesto"
                                    options={repuestos.map((r) => ({
                                        value: r.id.toString(),
                                        label: r.label,
                                    }))}
                                />

                                <FormInput
                                    label="Cantidad"
                                    type="number"
                                    value={detalleActual.cantidad}
                                    onChange={(e) =>
                                        setDetalleActual({
                                            ...detalleActual,
                                            cantidad: e.target.value,
                                        })
                                    }
                                    placeholder="0.00"
                                    min="0.01"
                                    step="0.01"
                                />

                                {esIngresoCompraOAjuste && (
                                    <FormInput
                                        label="Precio Unitario *"
                                        type="number"
                                        value={detalleActual.precio}
                                        onChange={(e) =>
                                            setDetalleActual({
                                                ...detalleActual,
                                                precio: e.target.value,
                                            })
                                        }
                                        placeholder="0.00"
                                        min="0.01"
                                        step="0.01"
                                    />
                                )}

                                {esSalida && (
                                    <FormInput
                                        label="Precio Unitario (automático)"
                                        type="number"
                                        value={detalleActual.precio}
                                        disabled
                                        readOnly
                                    />
                                )}

                                <Button
                                    type="button"
                                    onClick={agregarDetalle}
                                    variant="outline"
                                    disabled={
                                        esSalida &&
                                        stockDisponible !== null &&
                                        parseFloat(detalleActual.cantidad) > stockDisponible
                                    }
                                >
                                    Agregar Repuesto
                                </Button>
                            </div>

                            {/* Mensaje de stock */}
                            {esSalida && data.ubicacion_id && detalleActual.repuesto_id && (
                                <div className="mt-2 flex items-center text-xs text-muted-foreground">
                                    <Info className="mr-1 h-3 w-3" />
                                    {cargandoStock ? (
                                        <span>Cargando stock...</span>
                                    ) : stockDisponible !== null ? (
                                        <span>Stock disponible: {stockDisponible}</span>
                                    ) : (
                                        <span>No se pudo obtener stock</span>
                                    )}
                                </div>
                            )}

                            {errors.detalles && (
                                <p className="mt-2 text-sm text-destructive">{errors.detalles}</p>
                            )}
                        </div>
                    </div>

                    {/* Botones */}
                    <div className="rounded-lg border border-border bg-card p-4 shadow-sm">
                        <div className="flex flex-col justify-end gap-3 sm:flex-row">
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => window.history.back()}
                                className="order-2 w-full sm:order-1 sm:w-32"
                            >
                                Cancelar
                            </Button>
                            <Button
                                type="submit"
                                disabled={processing}
                                className="order-1 w-full sm:order-2 sm:w-40"
                            >
                                {processing ? (
                                    <div className="flex items-center justify-center">
                                        <div className="mr-2 h-4 w-4 animate-spin rounded-full border-b-2 border-white"></div>
                                        Creando...
                                    </div>
                                ) : (
                                    'Crear Movimiento'
                                )}
                            </Button>
                        </div>
                    </div>
                </form>
            </div>
        </AppLayout>
    );
}
