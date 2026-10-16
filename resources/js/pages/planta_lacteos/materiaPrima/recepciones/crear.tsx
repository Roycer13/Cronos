import { Button } from '@/components/ui/button';
import FormInput from '@/components/ui/form-input';
import FormSelect from '@/components/ui/form-select';
import AppLayout from '@/layouts/app-layout';
import { Head, useForm } from '@inertiajs/react';
import { type BreadcrumbItem } from '@/types';
import React from 'react';
import { route } from 'ziggy-js';
import { LoteFormFields, type LoteData } from '@/components/LoteFormFields';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Recepciones de materia prima', href: '/planta-lacteos/recepciones-materia-prima' },
    { title: 'Nueva Recepción', href: '' },
];

type Usuario = { id: number; name: string };
type Proveedor = { id: number; nombre: string };
type Categoria = { id: number; nombre: string };
type Unidad = { id: number; nombre: string } | null;
type AlmacenMateriaPrima = { id: number; nombre: string };
type Item = { id: number; nombre?: string; descripcion?: string; categoria_materia_prima_id?: number; unidad?: Unidad };

interface Props {
    almaceneros: Usuario[];
    proveedorMateriaPrimas: Proveedor[];
    itemMateriaPrimas: Item[];
    categoriaMateriaPrimas: Categoria[];
    almacenesMateriaPrima: AlmacenMateriaPrima[];
    authUser?: { id: number; name: string } | null;
}

const generateLoteId = () => `lote_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

const createEmptyLote = (): LoteData => ({
    _id: generateLoteId(),
    lote: '',
    fecha_elaboracion: '',
    fecha_vencimiento: '',
    cantidad_recepcionada_unidades: '',
    cantidad_recepcionada_unidad: '',
    cantidad_recepcionada_peso_por_unidad: '',
    cantidad_recepcionada_peso_por_unidad_medida: '',
    cantidad_recepcionada_total_kg: '',
    tipo_material: '',
    elementos_extraños: '',
    textura_apariencia: '',
    sabor: '',
    impresion: '',
    color: '',
    olor: '',
    sellado: '',
    largo_total_cm: '',
    largo_plegado_cm: '',
    ancho_total_cm: '',
    ancho_plegado_cm: '',
    diametro_cm: '',
    tamano_fuelle_cm: '',
    alto_cm: '',
    espesor_micrones: '',
    temperatura_c: '',
    humedad_promedio: '',
    gluten_humedo_promedio: '',
    gluten_seco_desarrollo: '',
    ph: '',
    densidad: '',
    grados_brix: '',
    prueba_desarrollo: '',
    prueba_inmersion_agua_promedio: '',
    punto_fusion_promedio_c: '',
    ficha_tecnica_certificado: '',
    conforme_no_conforme: false,
    observaciones: '',
    aceptado_rechazo: '',
    observaciones_conformidad_rechazo: '',
    nombre_conductor: '',
    placa: '',
    tipo_movilidad: '',
    estado_envase_carroceria: '',
    nuevo_ingreso_almacen_id: '',
    ingreso_traspaso: '',
    estado_lote: '',
});

export default function Crear({
    almaceneros,
    proveedorMateriaPrimas,
    itemMateriaPrimas,
    categoriaMateriaPrimas,
    almacenesMateriaPrima,
    authUser = null,
}: Props) {
    const { data, setData, post, processing, errors } = useForm({
        tiempo: '',
        almacen_materia_prima_id: '',
        user_id: authUser?.id ?? '',
        item_materia_prima_id: '',
        // Campos legacy
        cantidad: '',
        unidades: '',
        proveedor_materia_prima_id: '',
        marca: '',
        limpieza_transporte: false,
        sin_elementos: false,
        cerrado: false,
        nit: false,
        rs: false,
        certificado: false,
        certificado_pdf: null as File | null,
        observacion: '',
        correccion: '',
        almacenero_id: '',
        codigo_certificado: '',
        registro_senasag: '',
        // Nuevos campos de cantidad de recepción
        cantidad_recepcionada_unidades: '',
        cantidad_recepcionada_unidad: '',
        cantidad_recepcionada_peso_por_unidad_kg: '',
        cantidad_recepcionada_total_kg: '',
        lotes: [createEmptyLote()],
        _f_item: '',
        _f_proveedor: '',
        categoria_id: '',
    });

    const [itemsFiltrados, setItemsFiltrados] = React.useState<Item[]>(itemMateriaPrimas);
    const [proveedoresFiltrados, setProveedoresFiltrados] = React.useState<Proveedor[]>(proveedorMateriaPrimas);

    React.useEffect(() => {
        const catId = data.categoria_id?.toString() || '';
        const txt = (data._f_item || '').toLowerCase();
        let lista = itemMateriaPrimas;
        if (catId) lista = lista.filter((it) => it.categoria_materia_prima_id?.toString() === catId);
        if (txt) lista = lista.filter((it) => (it.descripcion || '').toLowerCase().includes(txt) || (it.nombre || '').toLowerCase().includes(txt));
        setItemsFiltrados(lista);
    }, [data.categoria_id, data._f_item, itemMateriaPrimas]);

    React.useEffect(() => {
        const txt = (data._f_proveedor || '').toLowerCase();
        setProveedoresFiltrados(txt ? proveedorMateriaPrimas.filter((p) => p.nombre.toLowerCase().includes(txt)) : proveedorMateriaPrimas);
    }, [data._f_proveedor, proveedorMateriaPrimas]);

    // Calcular total kg automáticamente y sincronizar campos legacy
    React.useEffect(() => {
        const unidades = parseFloat(data.cantidad_recepcionada_unidades?.toString() || '');
        const peso = parseFloat(data.cantidad_recepcionada_peso_por_unidad_kg?.toString() || '');

        if (!Number.isNaN(unidades) && !Number.isNaN(peso) && data.cantidad_recepcionada_unidades !== '' && data.cantidad_recepcionada_peso_por_unidad_kg !== '') {
            const total = (unidades * peso).toString();
            setData((prev) => ({
                ...prev,
                cantidad_recepcionada_total_kg: total,
                cantidad: total,
                unidades: unidades.toString(),
            }));
        } else {
            setData((prev) => ({ ...prev, cantidad_recepcionada_total_kg: '' }));
        }
    }, [data.cantidad_recepcionada_unidades, data.cantidad_recepcionada_peso_por_unidad_kg]);

    const addLote = () => setData('lotes', [...data.lotes, createEmptyLote()]);
    const removeLote = (index: number) => {
        const nuevos = [...data.lotes];
        nuevos.splice(index, 1);
        setData('lotes', nuevos);
    };
    const setLoteField = (index: number, field: keyof LoteData, value: any) => {
        const nuevos = [...data.lotes];
        nuevos[index] = { ...nuevos[index], [field]: value };
        setData('lotes', nuevos);
    };

    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        post(route('recepciones-materia-prima.store'), { forceFormData: true });
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Nueva Recepción de Materia Prima" />
            <div className="mx-auto max-w-6xl px-4 py-4 sm:px-6">
                <div className="mb-6"><h1 className="text-2xl font-bold text-foreground">Nueva Recepción de Materia Prima</h1><p className="mt-1 text-sm text-muted-foreground">Completa los datos para registrar la recepción</p></div>
                {errors.error && (
                    <div className="rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-700">
                        {errors.error}
                    </div>
                )}
                <form onSubmit={submit} className="space-y-6 rounded-lg border border-border bg-card p-4 shadow-sm">
                    {/* BLOQUE 1: MATERIA PRIMA */}
                    <div className="rounded-md border p-4 bg-muted/30 space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <FormSelect label="Categoría" placeholder="Seleccione categoría" value={data.categoria_id || ''} onChange={(v) => { setData('categoria_id', v); setData('item_materia_prima_id', ''); }} options={categoriaMateriaPrimas.map(c => ({ value: c.id.toString(), label: c.nombre }))} error={errors.categoria_id} />
                            <FormSelect label="Materia Prima" placeholder="Seleccione una materia prima" value={data.item_materia_prima_id || ''} onChange={(v) => setData('item_materia_prima_id', v)} options={itemsFiltrados.map(it => ({ value: it.id.toString(), label: `${it.descripcion ?? ''} ${it.nombre ? '- ' + it.nombre : ''}` }))} error={errors.item_materia_prima_id} />
                            <FormInput id="marca" label="Marca" value={data.marca} onChange={(e) => setData('marca', e.target.value)} placeholder="Marca" error={errors.marca} />
                        </div>
                    </div>

                    {/* BLOQUE 2: PROVEEDOR / ALMACÉN / ALMACENERO */}
                    <div className="rounded-md border p-4 bg-muted/30 space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <FormSelect label="Proveedor" value={data.proveedor_materia_prima_id || ''} onChange={(v) => setData('proveedor_materia_prima_id', v)} options={proveedoresFiltrados.map(p => ({ value: p.id.toString(), label: p.nombre }))} placeholder="Seleccione proveedor" error={errors.proveedor_materia_prima_id} />
                            <FormSelect label="Almacén de Materia Prima" value={data.almacen_materia_prima_id || ''} onChange={(v) => setData('almacen_materia_prima_id', v)} options={almacenesMateriaPrima.map(almacen => ({ value: almacen.id.toString(), label: almacen.nombre }))} placeholder="Seleccione almacén" error={errors.almacen_materia_prima_id} />
                            <FormSelect label="Almacenero" value={data.almacenero_id || ''} onChange={(v) => setData('almacenero_id', v)} options={almaceneros.map(a => ({ value: a.id.toString(), label: a.name }))} placeholder="Seleccione almacenero" error={errors.almacenero_id} />
                        </div>
                    </div>

                    {/* BLOQUE 3: CANTIDAD / PESO / TOTAL (incluye campos legacy) */}
                    <div className="rounded-md border p-4 bg-muted/30 space-y-4">
                        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Cantidad Recepcionada</p>
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                            <FormInput
                                id="cantidad_recepcionada_unidades"
                                label="Cantidad (unidades)"
                                type="text"
                                inputMode="numeric"
                                value={data.cantidad_recepcionada_unidades}
                                onChange={(e) => setData('cantidad_recepcionada_unidades', e.target.value)}
                                placeholder="Ej: 3"
                                error={errors.cantidad_recepcionada_unidades}
                            />
                            <FormSelect
                                label="Unidad"
                                value={data.cantidad_recepcionada_unidad || ''}
                                onChange={(v) => setData('cantidad_recepcionada_unidad', v)}
                                options={[
                                    { value: 'BIDONES', label: 'BIDONES' },
                                    { value: 'BOLSAS', label: 'BOLSAS' },
                                    { value: 'CAJAS', label: 'CAJAS' },
                                    { value: 'OTROS', label: 'OTROS' },
                                ]}
                                placeholder="Seleccione unidad"
                                error={errors.cantidad_recepcionada_unidad}
                            />
                            <FormInput
                                id="cantidad_recepcionada_peso_por_unidad_kg"
                                label="Peso por unidad (Kg)"
                                type="text"
                                inputMode="numeric"
                                value={data.cantidad_recepcionada_peso_por_unidad_kg}
                                onChange={(e) => setData('cantidad_recepcionada_peso_por_unidad_kg', e.target.value)}
                                placeholder="Ej: 30"
                                error={errors.cantidad_recepcionada_peso_por_unidad_kg}
                            />
                            <FormInput
                                id="cantidad_recepcionada_total_kg"
                                label="Total Kg"
                                type="text"
                                readOnly
                                value={data.cantidad_recepcionada_total_kg}
                                placeholder="Calculado automáticamente"
                                error={errors.cantidad_recepcionada_total_kg}
                            />
                        </div>
                        {/* Campos legacy cantidad y unidades */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-3">
                            <FormInput
                                id="cantidad"
                                label="Cantidad (kg / unidad base)"
                                type="text"
                                inputMode="numeric"
                                value={data.cantidad}
                                onChange={(e) => setData('cantidad', e.target.value)}
                                placeholder="Ej: 150.5"
                                error={errors.cantidad}
                            />
                            <FormInput
                                id="unidades"
                                label="Nº de unidades"
                                type="text"
                                inputMode="numeric"
                                value={data.unidades}
                                onChange={(e) => setData('unidades', e.target.value)}
                                placeholder="Ej: 10"
                                error={errors.unidades}
                            />
                        </div>
                        <p className="text-xs text-muted-foreground">Los campos "Cantidad (kg)" y "Nº de unidades" se sincronizan automáticamente con los valores de arriba, pero puedes editarlos manualmente si es necesario.</p>
                        <FormInput id="registro_senasag" label="Registro SENASAG" value={data.registro_senasag} onChange={(e) => setData('registro_senasag', e.target.value)} />
                    </div>

                    {/* Lotes dinámicos */}
                    <div className="space-y-3">
                        <label className="block text-xs font-semibold md:text-sm">Lotes</label>
                        {data.lotes.map((lote, idx) => (
                            <LoteFormFields
                                key={lote._id}
                                index={idx}
                                lote={lote}
                                onChange={setLoteField}
                                onRemove={() => removeLote(idx)}
                                isRemovable={idx > 0}
                                errors={errors}
                                almacenesMateriaPrima={almacenesMateriaPrima}
                            />
                        ))}
                        <Button type="button" variant="outline" size="sm" onClick={addLote} className="text-xs">+ Agregar Lote</Button>
                    </div>

                    {/* Checkboxes */}
                    <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                        {['limpieza_transporte', 'sin_elementos', 'cerrado', 'nit', 'rs', 'certificado'].map((c) => (
                            <label key={c} className="flex items-center space-x-2 text-xs md:text-sm">
                                <input type="checkbox" checked={!!(data as any)[c]} onChange={(e) => setData(c as any, e.target.checked)} className="h-4 w-4 rounded border-gray-300" />
                                <span>{c.replace(/_/g, ' ').toUpperCase()}</span>
                            </label>
                        ))}
                        {data.certificado && <div className="col-span-2"><FormInput label="" id="codigo_certificado" value={data.codigo_certificado} onChange={(e) => setData('codigo_certificado', e.target.value)} placeholder="Código de Certificado" error={errors.codigo_certificado} /></div>}
                        <div className="col-span-2">
                            <label htmlFor="certificado_pdf" className="mb-1 block text-sm font-medium">Certificado PDF</label>
                            <input id="certificado_pdf" type="file" accept="application/pdf" onChange={(e) => setData('certificado_pdf', e.target.files?.[0] ?? null)} className="block w-full rounded-md border border-input bg-background px-3 py-2 text-sm" />
                            {errors.certificado_pdf && <p className="mt-1 text-xs text-red-600">{errors.certificado_pdf}</p>}
                        </div>
                    </div>

                    {/* Observaciones */}
                    <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                        <FormInput id="observacion" label="Observaciones" value={data.observacion} onChange={(e) => setData('observacion', e.target.value)} placeholder="Observaciones" error={errors.observacion} />
                        <FormInput id="correccion" label="Correcciones" value={data.correccion} onChange={(e) => setData('correccion', e.target.value)} placeholder="Correcciones" error={errors.correccion} />
                    </div>

                    {/* Botones */}
                    <div className="flex justify-end space-x-2 border-t border-gray-200 pt-4">
                        <Button type="button" variant="outline" onClick={() => window.history.back()} className="w-32">Cancelar</Button>
                        <Button type="submit" disabled={processing} className="w-40">{processing ? 'Guardando...' : 'Guardar'}</Button>
                    </div>
                </form>
            </div>
        </AppLayout>
    );
}
