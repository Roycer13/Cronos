
// resources/js/Pages/planta_lacteos/materiaPrima/recepciones/Editar.tsx
import { Button } from '@/components/ui/button';
import FormInput from '@/components/ui/form-input';
import FormSelect from '@/components/ui/form-select';
import AppLayout from '@/layouts/app-layout';
import { Head, useForm } from '@inertiajs/react';

import { type BreadcrumbItem } from '@/types';
import React from 'react';
import { route } from 'ziggy-js';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Recepciones de materia prima',
        href: '/planta-lacteos/recepciones-materia-prima',
    },
    { title: 'Editar Recepción', href: '' },
];

type Usuario = { id: number; name: string };
type Proveedor = { id: number; nombre: string };
type Categoria = { id: number; nombre: string };
type Unidad = { id: number; nombre: string } | null;
type AlmacenMateriaPrima = { id: number; nombre: string };
type Item = {
    id: number;
    nombre?: string;
    descripcion?: string;
    categoria_materia_prima_id?: number;
    unidad?: Unidad;
};

interface Recepcion {
    id: number;
    tiempo: string;
    almacen_materia_prima_id: string;
    user_id: number;
    item_materia_prima_id: number;
    cantidad: string;
    unidades: string;
    proveedor_materia_prima_id: number;
    marca: string;
    limpieza_transporte: boolean;
    sin_elementos: boolean;
    cerrado: boolean;
    nit: boolean;
    rs: boolean;
    certificado: boolean;
    observacion: string;
    correccion: string;
    almacenero_id: number;
    codigo_certificado: string;
    estado_id?: number;
    liberacion_id?: number;
    ubicacion_id?: number;
    recepcionLotes: Array<{
        lote: string;
        fecha_elaboracion?: string;
        fecha_vencimiento?: string;
    }>;
    almacen?: AlmacenMateriaPrima;
}

interface Props {
    recepcion: Recepcion;
    almaceneros: Usuario[];
    proveedorMateriaPrimas: Proveedor[];
    itemMateriaPrimas: Item[];
    categoriaMateriaPrimas: Categoria[];
    almacenesMateriaPrima: AlmacenMateriaPrima[];
}

interface Lote {
    lote: string;
    fecha_elaboracion?: string;
    fecha_vencimiento?: string;
}

export default function Editar({
    recepcion,
    almaceneros,
    proveedorMateriaPrimas,
    itemMateriaPrimas,
    categoriaMateriaPrimas,
    almacenesMateriaPrima,
}: Props) {
    // Form state con Inertia
    const { data, setData, post, processing, errors } = useForm({
        tiempo: recepcion.tiempo || '',
        almacen_materia_prima_id: recepcion.almacen_materia_prima_id || '',
        user_id: recepcion.user_id || '',
        item_materia_prima_id: recepcion.item_materia_prima_id?.toString() || '',
        cantidad: recepcion.cantidad || '',
        unidades: recepcion.unidades || '',
        proveedor_materia_prima_id: recepcion.proveedor_materia_prima_id?.toString() || '',
        marca: recepcion.marca || '',
        limpieza_transporte: recepcion.limpieza_transporte || false,
        sin_elementos: recepcion.sin_elementos || false,
        cerrado: recepcion.cerrado || false,
        nit: recepcion.nit || false,
        rs: recepcion.rs || false,
        certificado: recepcion.certificado || false,
        certificado_pdf: null as File | null,
        _method: 'put',
        observacion: recepcion.observacion || '',
        correccion: recepcion.correccion || '',
        almacenero_id: recepcion.almacenero_id?.toString() || '',
        codigo_certificado: recepcion.codigo_certificado || '',
        lotes: (
            (recepcion as any).recepcionLotes ||
            (recepcion as any).recepcion_lotes ||
            []
        ) as Lote[],
        // filtros UI locales (no se envían al servidor)
        _f_item: '',
        _f_proveedor: '',
        categoria_id: recepcion.item_materia_prima_id ?
            itemMateriaPrimas.find(item => item.id === recepcion.item_materia_prima_id)?.categoria_materia_prima_id?.toString() || '' : '',
    });

    // Items filtrados según categoría + texto
    const [itemsFiltrados, setItemsFiltrados] =
        React.useState<Item[]>(itemMateriaPrimas);
    // Proveedores filtrados
    const [proveedoresFiltrados, setProveedoresFiltrados] = React.useState<
        Proveedor[]
    >(proveedorMateriaPrimas);

    React.useEffect(() => {
        // Filtrar por categoría y texto cada vez que cambian
        const catId = data.categoria_id?.toString() || '';
        const txt = (data._f_item || '').toLowerCase();

        let lista = itemMateriaPrimas;
        if (catId) {
            lista = lista.filter(
                (it) => it.categoria_materia_prima_id?.toString() === catId,
            );
        }
        if (txt) {
            lista = lista.filter(
                (it) =>
                    (it.descripcion || '').toLowerCase().includes(txt) ||
                    (it.nombre || '').toLowerCase().includes(txt),
            );
        }
        setItemsFiltrados(lista);
    }, [data.categoria_id, data._f_item, itemMateriaPrimas]);

    React.useEffect(() => {
        const txt = (data._f_proveedor || '').toLowerCase();
        const lista = txt
            ? proveedorMateriaPrimas.filter((p) =>
                  p.nombre.toLowerCase().includes(txt),
              )
            : proveedorMateriaPrimas;
        setProveedoresFiltrados(lista);
    }, [data._f_proveedor, proveedorMateriaPrimas]);

    // Lotes dinámicos
    const addLote = () => {
        setData('lotes', [
            ...(data.lotes || []),
            { lote: '', fecha_elaboracion: '', fecha_vencimiento: '' },
        ]);
    };
    const removeLote = (index: number) => {
        const nuevos = [...data.lotes];
        nuevos.splice(index, 1);
        setData('lotes', nuevos);
    };
    const setLoteField = (index: number, field: keyof Lote, value: string) => {
        const nuevos = [...data.lotes];
        nuevos[index] = { ...nuevos[index], [field]: value };
        setData('lotes', nuevos);
    };

    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        post(route('recepciones-materia-prima1.update', recepcion.id), { forceFormData: true });
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Editar Recepción de Materia Prima" />
            <div className="mx-auto max-w-6xl px-4 py-4 sm:px-6">
                <div className="mb-6">
                    <h1 className="text-2xl font-bold text-foreground">
                        Editar Recepción de Materia Prima
                    </h1>
                    <p className="mt-1 text-sm text-muted-foreground">
                        Modifica los datos de la recepción
                    </p>
                </div>

                <form
                    onSubmit={submit}
                    className="space-y-6 rounded-lg border border-border bg-card p-4 shadow-sm"
                >
                   <div className="rounded-md border p-4 bg-muted/30 space-y-4">
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <FormSelect
            label="Categoría"
            placeholder="Seleccione categoría"
            value={data.categoria_id || ''}
            onChange={(v) => {
                setData('categoria_id', v);
                setData('item_materia_prima_id', '');
            }}
            options={categoriaMateriaPrimas.map(c => ({
                value: c.id.toString(),
                label: c.nombre,
            }))}
            error={errors.categoria_id}
        />

        <FormSelect
            label="Materia Prima"
            placeholder="Seleccione una materia prima"
            value={data.item_materia_prima_id || ''}
            onChange={(v) => setData('item_materia_prima_id', v)}
            options={itemsFiltrados.map(it => ({
                value: it.id.toString(),
                label: `${it.descripcion ?? ''} ${it.nombre ? '- ' + it.nombre : ''}`,
            }))}
            error={errors.item_materia_prima_id}
        />

        <FormInput
            id="marca"
            label="Marca"
            value={data.marca}
            onChange={(e) => setData('marca', e.target.value)}
            placeholder="Marca"
            error={errors.marca}
        />
    </div>
</div>

{/* BLOQUE 2: CANTIDAD / UNIDAD */}
<div className="rounded-md border p-4 bg-muted/30 space-y-4">
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <FormInput
            id="unidades"
            label="Unidad"
            value={data.unidades}
            onChange={(e) => setData('unidades', e.target.value)}
            placeholder="Ej: kg, l"
            error={errors.unidades}
        />

        <div>
            <FormInput
                id="cantidad"
                label="Cantidad"
                type="number"
                value={data.cantidad}
                onChange={(e) => setData('cantidad', e.target.value)}
                placeholder="Cantidad"
                error={errors.cantidad}
            />
            {data.item_materia_prima_id && (
                <p className="mt-1 text-xs text-muted-foreground">
                    Unidad real: {
                        itemMateriaPrimas.find(
                            (it) => it.id.toString() === data.item_materia_prima_id
                        )?.unidad?.nombre
                    }
                </p>
            )}
        </div>
    </div>
</div>

{/* BLOQUE 3: PROVEEDOR / ALMACÉN / ALMACENERO */}
<div className="rounded-md border p-4 bg-muted/30 space-y-4">
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <FormSelect
            label="Proveedor"
            value={data.proveedor_materia_prima_id || ''}
            onChange={(v) => setData('proveedor_materia_prima_id', v)}
            options={proveedoresFiltrados.map(p => ({
                value: p.id.toString(),
                label: p.nombre,
            }))}
            placeholder="Seleccione proveedor"
            error={errors.proveedor_materia_prima_id}
        />

        <FormSelect
            label="Almacén de Materia Prima"
            value={data.almacen_materia_prima_id || ''}
            onChange={(v) => setData('almacen_materia_prima_id', v)}
            options={almacenesMateriaPrima.map(almacen => ({
                value: almacen.id.toString(),
                label: almacen.nombre,
            }))}
            placeholder="Seleccione almacén"
            error={errors.almacen_materia_prima_id}
        />

        <FormSelect
            label="Almacenero"
            value={data.almacenero_id || ''}
            onChange={(v) => setData('almacenero_id', v)}
            options={almaceneros.map(a => ({
                value: a.id.toString(),
                label: a.name,
            }))}
            placeholder="Seleccione almacenero"
            error={errors.almacenero_id}
        />
    </div>
</div>

                    {/* Lotes dinámicos */}
                    <div className="space-y-3">
                        <label className="block text-xs font-semibold md:text-sm">
                            Lotes
                        </label>
                        {(data.lotes || []).map((l: Lote, idx: number) => (
                            <div
                                key={idx}
                                className="grid grid-cols-2 items-end gap-3 rounded-md border p-2 md:grid-cols-4"
                            >
                                <div>
                                    <label className="text-xs">
                                        F. Elaboración
                                    </label>
                                    <input
                                        type="date"
                                        value={l.fecha_elaboracion || ''}
                                        onChange={(e) =>
                                            setLoteField(
                                                idx,
                                                'fecha_elaboracion',
                                                e.target.value,
                                            )
                                        }
                                        className="w-full rounded border px-2 py-1 text-sm"
                                    />
                                </div>
                                <div>
                                    <label className="text-xs">
                                        F. Vencimiento
                                    </label>
                                    <input
                                        type="date"
                                        value={l.fecha_vencimiento || ''}
                                        onChange={(e) =>
                                            setLoteField(
                                                idx,
                                                'fecha_vencimiento',
                                                e.target.value,
                                            )
                                        }
                                        className="w-full rounded border px-2 py-1 text-sm"
                                    />
                                </div>
                                <div>
                                    <label className="text-xs">Lote</label>
                                    <input
                                        type="text"
                                        value={l.lote || ''}
                                        onChange={(e) =>
                                            setLoteField(
                                                idx,
                                                'lote',
                                                e.target.value,
                                            )
                                        }
                                        className="w-full rounded border px-2 py-1 text-sm"
                                    />
                                </div>
                                <div className="flex justify-end">
                                    {idx > 0 && (
                                        <button
                                            type="button"
                                            onClick={() => removeLote(idx)}
                                            className="rounded bg-red-500 px-2 py-1 text-xs text-white"
                                        >
                                            Eliminar
                                        </button>
                                    )}
                                </div>
                            </div>
                        ))}
                        <div>
                            <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                onClick={addLote}
                                className="text-xs text-muted-foreground hover:text-foreground"
                            >
                                + Agregar Lote
                            </Button>
                        </div>
                    </div>

                    {/* Checkboxes */}
                    <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                        {[
                            {
                                key: 'limpieza_transporte',
                                label: 'Limp. Trans.',
                            },
                            { key: 'sin_elementos', label: 'Sin Elem. Ext.' },
                            { key: 'cerrado', label: 'Cerrado' },
                            { key: 'nit', label: 'NIT' },
                            { key: 'rs', label: 'RS' },
                            { key: 'certificado', label: 'Certificado' },
                        ].map((c) => (
                            <label
                                key={c.key}
                                className="flex items-center space-x-2 text-xs md:text-sm"
                            >
                                <input
                                    id={c.key}
                                    type="checkbox"
                                    checked={!!(data as any)[c.key]}
                                    onChange={(e) =>
                                        setData(c.key as any, e.target.checked)
                                    }
                                    className="h-4 w-4 rounded border-gray-300"
                                />
                                <span>{c.label}</span>
                            </label>
                        ))}



                        {/* Codigo certificado condicional */}
                    {data.certificado && (
                        <div className="col-span-2">
                            <FormInput
                                    label=""
                                id="codigo_certificado"
                                value={data.codigo_certificado}
                                onChange={(e) =>
                                    setData(
                                        'codigo_certificado',
                                        (e.target as HTMLInputElement).value,
                                    )
                                }
                                placeholder="Código de Certificado"
                                error={errors.codigo_certificado}
                            />
                        </div>
                    )}
                    <div className="col-span-2">
                        <label htmlFor="certificado_pdf" className="mb-1 block text-sm font-medium">Reemplazar certificado PDF</label>
                        {(recepcion as any).certificado_pdf && <p className="mb-1 text-xs text-muted-foreground">Ya existe un certificado. Selecciona otro solo si deseas reemplazarlo.</p>}
                        <input id="certificado_pdf" type="file" accept="application/pdf" onChange={(e) => setData('certificado_pdf', e.target.files?.[0] ?? null)} className="block w-full rounded-md border border-input bg-background px-3 py-2 text-sm" />
                        {errors.certificado_pdf && <p className="mt-1 text-xs text-red-600">{errors.certificado_pdf}</p>}
                    </div>
                    </div>

                    {/* Observaciones y correcciones */}
                    <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                        <div>
                            <FormInput
                                id="observacion"
                                label="Observaciones"
                                value={data.observacion}
                                onChange={(e) =>
                                    setData(
                                        'observacion',
                                        (e.target as HTMLInputElement).value,
                                    )
                                }
                                placeholder="Observaciones"
                                error={errors.observacion}
                            />
                        </div>
                        <div>
                            <FormInput
                                id="correccion"
                                label="Correcciones"
                                value={data.correccion}
                                onChange={(e) =>
                                    setData(
                                        'correccion',
                                        (e.target as HTMLInputElement).value,
                                    )
                                }
                                placeholder="Correcciones"
                                error={errors.correccion}
                            />
                        </div>
                    </div>

                    {/* Botones */}
                    <div className="flex justify-end space-x-2 border-t border-gray-200 pt-4">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => window.history.back()}
                            className="w-32"
                        >
                            Cancelar
                        </Button>
                        <Button
                            type="submit"
                            disabled={processing}
                            className="w-40"
                        >
                            {processing ? 'Actualizando...' : 'Actualizar'}
                        </Button>
                    </div>
                </form>
            </div>
        </AppLayout>
    );
}
