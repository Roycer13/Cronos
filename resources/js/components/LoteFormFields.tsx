import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import FormInput from '@/components/ui/form-input';
import FormSelect from '@/components/ui/form-select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';

export interface LoteData {
    _id?: string;
    lote: string;
    fecha_elaboracion?: string;
    fecha_vencimiento?: string;
    // General
    cantidad_recepcionada_unidades?: number | string;
    cantidad_recepcionada_unidad?: string;
    cantidad_recepcionada_peso_por_unidad?: number | string;
    cantidad_recepcionada_peso_por_unidad_medida?: string;
    cantidad_recepcionada_total_kg?: number | string;
    // Características generales
    tipo_material?: string;
    elementos_extraños?: string;
    textura_apariencia?: string;
    sabor?: string;
    impresion?: string;
    color?: string;
    olor?: string;
    sellado?: string;
    // Dimensiones
    largo_total_cm?: number | string;
    largo_plegado_cm?: number | string;
    ancho_total_cm?: number | string;
    ancho_plegado_cm?: number | string;
    diametro_cm?: number | string;
    tamano_fuelle_cm?: number | string;
    alto_cm?: number | string;
    espesor_micrones?: number | string;
    // Fisicoquímico
    temperatura_c?: number | string;
    humedad_promedio?: number | string;
    gluten_humedo_promedio?: number | string;
    gluten_seco_desarrollo?: string;
    ph?: number | string;
    densidad?: number | string;
    grados_brix?: number | string;
    prueba_desarrollo?: string;
    prueba_inmersion_agua_promedio?: number | string;
    punto_fusion_promedio_c?: number | string;
    // Documentación
    ficha_tecnica_certificado?: string;
    conforme_no_conforme?: boolean;
    observaciones?: string;
    // Otros
    aceptado_rechazo?: string;
    observaciones_conformidad_rechazo?: string;
    // Transporte
    nombre_conductor?: string;
    placa?: string;
    tipo_movilidad?: string;
    estado_envase_carroceria?: string;
    nuevo_ingreso_almacen_id?: number | string;
    ingreso_traspaso?: string;
    estado_lote?: string;
}

interface Props {
    index: number;
    lote: LoteData;
    onChange: (index: number, field: keyof LoteData, value: any) => void;
    onRemove?: () => void;
    isRemovable: boolean;
    errors?: Record<string, string | string[]>;
    almacenesMateriaPrima: Array<{ id: number; nombre: string }>;
}

export const LoteFormFields: React.FC<Props> = ({
    index,
    lote,
    onChange,
    onRemove,
    isRemovable,
    errors,
    almacenesMateriaPrima,
}) => {
    const [activeTab, setActiveTab] = React.useState('general');
    const [organoTab, setOrganoTab] = React.useState('sabor');
    const [modo, setModo] = React.useState<'materia' | 'envase'>('materia');
    const isMateriaPrima = modo === 'materia';
    const isEnvase = modo === 'envase';

    // 🔄 Auto‑cálculo del total (Kg/L) cuando cambian unidades o peso
    React.useEffect(() => {
        const unidades = parseFloat(lote.cantidad_recepcionada_unidades?.toString() || '');
        const peso = parseFloat(lote.cantidad_recepcionada_peso_por_unidad?.toString() || '');
        if (!isNaN(unidades) && !isNaN(peso) && lote.cantidad_recepcionada_unidades !== '' && lote.cantidad_recepcionada_peso_por_unidad !== '') {
            const total = (unidades * peso).toString();
            if (lote.cantidad_recepcionada_total_kg?.toString() !== total) {
                onChange(index, 'cantidad_recepcionada_total_kg', total);
            }
        } else {
            if (lote.cantidad_recepcionada_total_kg !== '') {
                onChange(index, 'cantidad_recepcionada_total_kg', '');
            }
        }
    }, [lote.cantidad_recepcionada_unidades, lote.cantidad_recepcionada_peso_por_unidad, index, onChange]);

    // Cambio de pestaña según modo
    React.useEffect(() => {
        if (isEnvase && activeTab === 'fisicoquimico') setActiveTab('general');
        if (isMateriaPrima && activeTab === 'dimensiones') setActiveTab('caracteristicas');
        if (isEnvase && organoTab === 'sabor') setOrganoTab('olor');
    }, [modo, activeTab, organoTab, isEnvase, isMateriaPrima]);

    const getError = (field: keyof LoteData | string) => {
        const key = `lotes.${index}.${field}`;
        const error = errors?.[key];
        return Array.isArray(error) ? error.join(' ') : error;
    };

    const hasLoteErrors = Object.keys(errors ?? {}).some(key => key.startsWith(`lotes.${index}.`));

    const handleChange = (field: keyof LoteData, value: any) => {
        onChange(index, field, value);
    };

    // Filtro para campos numéricos (solo dígitos y un punto decimal)
    const filterNumberInput = (value: string) => {
        const filtered = value.replace(/[^0-9.]/g, '');
        const parts = filtered.split('.');
        return parts.length > 2 ? parts[0] + '.' + parts.slice(1).join('') : filtered;
    };

    return (
        <div className="rounded-md border border-border bg-card p-4 space-y-4 dark:bg-slate-900">
            {/* Cabecera del lote */}
            <div className="flex justify-between items-center">
                <h4 className="font-medium text-foreground">Lote #{index + 1}</h4>
                {hasLoteErrors && (
                    <div className="rounded-md border border-red-200 bg-red-50 px-2 py-1 text-xs text-red-700 dark:border-red-800 dark:bg-red-950 dark:text-red-300">
                        Este lote tiene errores de validación.
                    </div>
                )}
                {isRemovable && (
                    <button type="button" onClick={onRemove} className="text-red-500 text-sm hover:underline">
                        Eliminar lote
                    </button>
                )}
            </div>

            {/* Datos básicos (siempre visibles) */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div>
                    <Label className="text-foreground">Código / Lote</Label>
                    <Input
                        value={lote.lote || ''}
                        onChange={(e) => handleChange('lote', e.target.value)}
                        placeholder="Lote"
                        className="bg-background"
                    />
                    {getError('lote') && <p className="text-sm text-red-500 mt-1">{getError('lote')}</p>}
                </div>
                <div>
                    <Label className="text-foreground">Fecha elaboración</Label>
                    <Input
                        type="date"
                        value={lote.fecha_elaboracion || ''}
                        onChange={(e) => handleChange('fecha_elaboracion', e.target.value)}
                        className="bg-background"
                    />
                    {getError('fecha_elaboracion') && <p className="text-sm text-red-500 mt-1">{getError('fecha_elaboracion')}</p>}
                </div>
                <div>
                    <Label className="text-foreground">Fecha vencimiento</Label>
                    <Input
                        type="date"
                        value={lote.fecha_vencimiento || ''}
                        onChange={(e) => handleChange('fecha_vencimiento', e.target.value)}
                        className="bg-background"
                    />
                    {getError('fecha_vencimiento') && <p className="text-sm text-red-500 mt-1">{getError('fecha_vencimiento')}</p>}
                </div>
            </div>

            {/* Selector de tipo de lote */}
            <div className="rounded-xl border border-border bg-muted/30 p-3 dark:bg-slate-800">
                <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                    <div className="flex items-center gap-3">
                        <span className="text-sm font-semibold text-foreground">Tipo de lote:</span>
                        <div className="inline-flex overflow-hidden rounded-full border border-border bg-background dark:border-slate-700">
                            <button
                                type="button"
                                onClick={() => setModo('materia')}
                                className={`rounded-full px-3 py-1 text-xs font-semibold transition ${
                                    isMateriaPrima
                                        ? 'bg-primary text-primary-foreground'
                                        : 'text-muted-foreground hover:bg-muted'
                                }`}
                            >
                                Materia prima
                            </button>
                            <button
                                type="button"
                                onClick={() => setModo('envase')}
                                className={`rounded-full px-3 py-1 text-xs font-semibold transition ${
                                    isEnvase
                                        ? 'bg-primary text-primary-foreground'
                                        : 'text-muted-foreground hover:bg-muted'
                                }`}
                            >
                                Envase
                            </button>
                        </div>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <Switch checked={isEnvase} onCheckedChange={(checked) => setModo(checked ? 'envase' : 'materia')} />
                        <span>{isEnvase ? 'Envase' : 'Materia prima'}</span>
                    </div>
                </div>
            </div>

            {/* Pestañas principales */}
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                <TabsList className="grid grid-cols-2 md:grid-cols-7 gap-1 h-auto w-full">
                    <TabsTrigger value="general" className="text-xs data-[state=active]:bg-blue-100 dark:data-[state=active]:bg-blue-900">General</TabsTrigger>
                    <TabsTrigger value="caracteristicas" className="text-xs data-[state=active]:bg-emerald-100 dark:data-[state=active]:bg-emerald-900">Organolépticas</TabsTrigger>
                    {isEnvase && <TabsTrigger value="dimensiones" className="text-xs data-[state=active]:bg-yellow-100 dark:data-[state=active]:bg-yellow-900">Dimensiones</TabsTrigger>}
                    {isMateriaPrima && <TabsTrigger value="fisicoquimico" className="text-xs data-[state=active]:bg-purple-100 dark:data-[state=active]:bg-purple-900">Fisicoquímico</TabsTrigger>}
                    <TabsTrigger value="documentacion" className="text-xs data-[state=active]:bg-indigo-100 dark:data-[state=active]:bg-indigo-900">Documentación</TabsTrigger>
                    <TabsTrigger value="transporte" className="text-xs data-[state=active]:bg-rose-100 dark:data-[state=active]:bg-rose-900">Transporte</TabsTrigger>
                    <TabsTrigger value="otros" className="text-xs data-[state=active]:bg-slate-100 dark:data-[state=active]:bg-slate-700">Otros</TabsTrigger>
                </TabsList>

                {/* --- Pestaña General --- */}
                <TabsContent value="general" className="mt-3 space-y-4 rounded-xl border border-border bg-muted/20 p-4 dark:bg-slate-950/50">
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
                        <FormInput
                            id={`lotes.${index}.cantidad_recepcionada_unidades`}
                            label="Cantidad"
                            type="text"
                            inputMode="numeric"
                            value={lote.cantidad_recepcionada_unidades?.toString() || ''}
                            onChange={(e) => handleChange('cantidad_recepcionada_unidades', filterNumberInput(e.target.value))}
                            placeholder="Ej: 5"
                            error={getError('cantidad_recepcionada_unidades')}
                        />
                        <FormSelect
                            label="Unidad"
                            value={lote.cantidad_recepcionada_unidad || ''}
                            onChange={(v) => handleChange('cantidad_recepcionada_unidad', v)}
                            options={[
                                { value: 'BIDONES', label: 'BIDONES' },
                                { value: 'BOLSAS', label: 'BOLSAS' },
                                { value: 'CAJAS', label: 'CAJAS' },
                                { value: 'OTROS', label: 'OTROS' },
                            ]}
                            placeholder="Seleccione unidad"
                            error={getError('cantidad_recepcionada_unidad')}
                        />
                        <FormInput
                            id={`lotes.${index}.cantidad_recepcionada_peso_por_unidad`}
                            label="Contenido por unidad"
                            type="text"
                            inputMode="numeric"
                            value={lote.cantidad_recepcionada_peso_por_unidad?.toString() || ''}
                            onChange={(e) => handleChange('cantidad_recepcionada_peso_por_unidad', filterNumberInput(e.target.value))}
                            placeholder="Ej: 25"
                            error={getError('cantidad_recepcionada_peso_por_unidad')}
                        />
                        <FormSelect
                            label="U.M. Contenido"
                            value={lote.cantidad_recepcionada_peso_por_unidad_medida || ''}
                            onChange={(v) => handleChange('cantidad_recepcionada_peso_por_unidad_medida', v)}
                            options={[
                                { value: 'KG', label: 'KG' },
                                { value: 'LITRO', label: 'LITRO' },
                                { value: 'MILITROS', label: 'MILITROS' },
                                { value: 'OTROS', label: 'OTROS' },
                            ]}
                            placeholder="Ej: KG"
                            error={getError('cantidad_recepcionada_peso_por_unidad_medida')}
                        />
                        <FormInput
                            id={`lotes.${index}.cantidad_recepcionada_total_kg`}
                            label="Total (Kg/L)"
                            type="text"
                            readOnly
                            value={lote.cantidad_recepcionada_total_kg?.toString() || ''}
                            placeholder="Calculado"
                            error={getError('cantidad_recepcionada_total_kg')}
                            className="bg-muted/50"
                        />
                    </div>
                </TabsContent>

                {/* --- Pestaña Organolépticas (sub‑tabs) --- */}
                <TabsContent value="caracteristicas" className="mt-3 rounded-xl border border-border bg-emerald-50/30 p-4 dark:bg-emerald-950/20">
                    <Tabs value={organoTab} onValueChange={setOrganoTab} className="w-full">
                        <TabsList className="grid grid-cols-3 gap-1 h-auto w-full">
                            {isMateriaPrima && <TabsTrigger value="sabor" className="text-xs">Sabor</TabsTrigger>}
                            <TabsTrigger value="olor" className="text-xs">Olor</TabsTrigger>
                            <TabsTrigger value="textura" className="text-xs">Textura / Apariencia</TabsTrigger>
                        </TabsList>

                        {isMateriaPrima && (
                            <TabsContent value="sabor" className="mt-3 rounded-xl border border-emerald-200 bg-white p-4 dark:border-emerald-800 dark:bg-slate-900">
                                <FormInput label="Sabor" value={lote.sabor || ''} onChange={(e) => handleChange('sabor', e.target.value)} error={getError('sabor')} />
                            </TabsContent>
                        )}

                        <TabsContent value="olor" className="mt-3 rounded-xl border border-amber-200 bg-white p-4 dark:border-amber-800 dark:bg-slate-900">
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <FormInput label="Olor" value={lote.olor || ''} onChange={(e) => handleChange('olor', e.target.value)} error={getError('olor')} />
                                <FormInput label="Impresión" value={lote.impresion || ''} onChange={(e) => handleChange('impresion', e.target.value)} error={getError('impresion')} />
                            </div>
                        </TabsContent>

                        <TabsContent value="textura" className="mt-3 rounded-xl border border-cyan-200 bg-white p-4 dark:border-cyan-800 dark:bg-slate-900">
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <FormInput label="Textura / Apariencia" value={lote.textura_apariencia || ''} onChange={(e) => handleChange('textura_apariencia', e.target.value)} error={getError('textura_apariencia')} />
                                <FormInput label="Color" value={lote.color || ''} onChange={(e) => handleChange('color', e.target.value)} error={getError('color')} />
                                {isEnvase && <FormInput label="Tipo de material" value={lote.tipo_material || ''} onChange={(e) => handleChange('tipo_material', e.target.value)} />}
                                {isMateriaPrima && <FormInput label="Elementos extraños" value={lote.elementos_extraños || ''} onChange={(e) => handleChange('elementos_extraños', e.target.value)} />}
                                <FormInput label="Sellado" value={lote.sellado || ''} onChange={(e) => handleChange('sellado', e.target.value)} />
                            </div>
                        </TabsContent>
                    </Tabs>
                </TabsContent>

                {/* --- Pestaña Dimensiones (solo envase) --- */}
                {isEnvase && (
                    <TabsContent value="dimensiones" className="mt-3 rounded-xl border border-border bg-white p-4 dark:bg-slate-900">
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                            <FormInput label="Largo total (cm)" type="text" inputMode="numeric" value={lote.largo_total_cm?.toString() || ''} onChange={(e) => handleChange('largo_total_cm', filterNumberInput(e.target.value))} />
                            <FormInput label="Largo plegado (cm)" type="text" inputMode="numeric" value={lote.largo_plegado_cm?.toString() || ''} onChange={(e) => handleChange('largo_plegado_cm', filterNumberInput(e.target.value))} />
                            <FormInput label="Ancho total (cm)" type="text" inputMode="numeric" value={lote.ancho_total_cm?.toString() || ''} onChange={(e) => handleChange('ancho_total_cm', filterNumberInput(e.target.value))} />
                            <FormInput label="Ancho plegado (cm)" type="text" inputMode="numeric" value={lote.ancho_plegado_cm?.toString() || ''} onChange={(e) => handleChange('ancho_plegado_cm', filterNumberInput(e.target.value))} />
                            <FormInput label="Diámetro (cm)" type="text" inputMode="numeric" value={lote.diametro_cm?.toString() || ''} onChange={(e) => handleChange('diametro_cm', filterNumberInput(e.target.value))} />
                            <FormInput label="Tamaño fuelle (cm)" type="text" inputMode="numeric" value={lote.tamano_fuelle_cm?.toString() || ''} onChange={(e) => handleChange('tamano_fuelle_cm', filterNumberInput(e.target.value))} />
                            <FormInput label="Alto (cm)" type="text" inputMode="numeric" value={lote.alto_cm?.toString() || ''} onChange={(e) => handleChange('alto_cm', filterNumberInput(e.target.value))} />
                            <FormInput label="Espesor (micrones/mm)" type="text" inputMode="numeric" value={lote.espesor_micrones?.toString() || ''} onChange={(e) => handleChange('espesor_micrones', filterNumberInput(e.target.value))} />
                        </div>
                    </TabsContent>
                )}

                {/* --- Pestaña Fisicoquímico (solo materia prima) --- */}
                {isMateriaPrima && (
                    <TabsContent value="fisicoquimico" className="mt-3 rounded-xl border border-border bg-white p-4 dark:bg-slate-900">
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                            <FormInput label="Temperatura (°C)" type="text" inputMode="numeric" value={lote.temperatura_c?.toString() || ''} onChange={(e) => handleChange('temperatura_c', filterNumberInput(e.target.value))} />
                            <FormInput label="Humedad (%)" type="text" inputMode="numeric" value={lote.humedad_promedio?.toString() || ''} onChange={(e) => handleChange('humedad_promedio', filterNumberInput(e.target.value))} />
                            <FormInput label="Gluten húmedo (%)" type="text" inputMode="numeric" value={lote.gluten_humedo_promedio?.toString() || ''} onChange={(e) => handleChange('gluten_humedo_promedio', filterNumberInput(e.target.value))} />
                            <FormInput label="Gluten seco (desarrollo)" value={lote.gluten_seco_desarrollo || ''} onChange={(e) => handleChange('gluten_seco_desarrollo', e.target.value)} />
                            <FormInput label="pH" type="text" inputMode="numeric" value={lote.ph?.toString() || ''} onChange={(e) => handleChange('ph', filterNumberInput(e.target.value))} />
                            <FormInput label="Densidad" type="text" inputMode="numeric" value={lote.densidad?.toString() || ''} onChange={(e) => handleChange('densidad', filterNumberInput(e.target.value))} />
                            <FormInput label="°Brix" type="text" inputMode="numeric" value={lote.grados_brix?.toString() || ''} onChange={(e) => handleChange('grados_brix', filterNumberInput(e.target.value))} />
                            <FormInput label="Prueba inmersión agua (promedio)" type="text" inputMode="numeric" value={lote.prueba_inmersion_agua_promedio?.toString() || ''} onChange={(e) => handleChange('prueba_inmersion_agua_promedio', filterNumberInput(e.target.value))} />
                            <FormInput label="Punto de fusión (°C) - Promedio" type="text" inputMode="numeric" value={lote.punto_fusion_promedio_c?.toString() || ''} onChange={(e) => handleChange('punto_fusion_promedio_c', filterNumberInput(e.target.value))} />
                            <FormInput label="Prueba desarrollo" value={lote.prueba_desarrollo || ''} onChange={(e) => handleChange('prueba_desarrollo', e.target.value)} />
                        </div>
                    </TabsContent>
                )}

                {/* --- Pestaña Documentación --- */}
                <TabsContent value="documentacion" className="mt-3 rounded-xl border border-border bg-white p-4 dark:bg-slate-900">
                    <div className="space-y-4">
                        <FormInput label="Ficha técnica o certificado" value={lote.ficha_tecnica_certificado || ''} onChange={(e) => handleChange('ficha_tecnica_certificado', e.target.value)} />
                        <div className="flex items-center space-x-2">
                            <Switch checked={lote.conforme_no_conforme || false} onCheckedChange={(checked) => handleChange('conforme_no_conforme', checked)} />
                            <Label>Conforme / No conforme</Label>
                        </div>
                        <div>
                            <Label>Observaciones</Label>
                            <Textarea value={lote.observaciones || ''} onChange={(e) => handleChange('observaciones', e.target.value)} rows={3} className="bg-background" />
                        </div>
                    </div>
                </TabsContent>

                {/* --- Pestaña Transporte --- */}
                <TabsContent value="transporte" className="mt-3 rounded-xl border border-border bg-white p-4 dark:bg-slate-900">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <FormInput label="Nombre del chofer" value={lote.nombre_conductor || ''} onChange={(e) => handleChange('nombre_conductor', e.target.value)} />
                        <FormInput label="Placa" value={lote.placa || ''} onChange={(e) => handleChange('placa', e.target.value)} />
                        <FormInput label="Tipo de movilidad" value={lote.tipo_movilidad || ''} onChange={(e) => handleChange('tipo_movilidad', e.target.value)} />
                        <FormInput label="Estado del envase en carrocería" value={lote.estado_envase_carroceria || ''} onChange={(e) => handleChange('estado_envase_carroceria', e.target.value)} />
                        <FormSelect
                            label="Nuevo ingreso a almacenes"
                            value={lote.nuevo_ingreso_almacen_id?.toString() || ''}
                            onChange={(v) => handleChange('nuevo_ingreso_almacen_id', v)}
                            options={almacenesMateriaPrima.map(a => ({ value: a.id.toString(), label: a.nombre }))}
                            placeholder="Seleccione almacén"
                        />
                        <FormInput label="Origen de traspaso" value={lote.ingreso_traspaso || ''} onChange={(e) => handleChange('ingreso_traspaso', e.target.value)} placeholder="Ej: Almacén Central" />
                    </div>
                </TabsContent>

                {/* --- Pestaña Otros --- */}
                <TabsContent value="otros" className="mt-3 rounded-xl border border-border bg-white p-4 dark:bg-slate-900">
                    <div className="space-y-4">
                        <FormInput label="Aceptado / Rechazo" value={lote.aceptado_rechazo || ''} onChange={(e) => handleChange('aceptado_rechazo', e.target.value)} />
                        <div>
                            <Label>Observaciones de conformidad/rechazo</Label>
                            <Textarea value={lote.observaciones_conformidad_rechazo || ''} onChange={(e) => handleChange('observaciones_conformidad_rechazo', e.target.value)} rows={3} className="bg-background" />
                        </div>
                        <FormInput label="Estado del lote (activo/inactivo)" value={lote.estado_lote || ''} onChange={(e) => handleChange('estado_lote', e.target.value)} />
                    </div>
                </TabsContent>
            </Tabs>
        </div>
    );
};