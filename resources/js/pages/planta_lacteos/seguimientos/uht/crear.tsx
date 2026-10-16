import { Button } from '@/components/ui/button';
import FilterSelect from '@/components/ui/filter-select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Toast } from '@/components/ui/toast';
import AppLayout from '@/layouts/app-layout';
import { Head, router, usePage } from '@inertiajs/react';
import { useState, useEffect, useRef, useCallback } from 'react';
import { route } from 'ziggy-js';
import { X, Plus, Trash2, PlusCircle, RefreshCw } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface PageProps {
    orps: { id: number; codigo: string; producto_terminado?: { nombre_sap: string }, fecha_vencimiento?: string }[];
    origenes: { id: number; alias: string }[];
    errors: Record<string, string>;
    selectedOrpIds?: number[];
}

interface SelectedOrp {
    id: number;
    codigo: string;
    nombre_sap?: string;
    fecha_vencimiento?: string;
}

interface RangoConfig {
    id: number;
    desde: string;
    hasta: string;
    origenId: string;
}

interface SeguimientoParaEnviar {
    numero: string;
    origen_id: string;
}

// Función debounce simple
function debounce<T extends (...args: any[]) => any>(
    func: T,
    wait: number
): (...args: Parameters<T>) => void {
    let timeout: NodeJS.Timeout | null = null;

    return (...args: Parameters<T>) => {
        if (timeout) clearTimeout(timeout);
        timeout = setTimeout(() => func(...args), wait);
    };
}

export default function Create({ selectedOrpIds: initialSelectedOrpIds = [] }: PageProps) {
    const { props } = usePage<PageProps>();
    const { orps = [], origenes: initialOrigenes = [], errors = {} } = props;

    const [form, setForm] = useState({
        lote: '',
        observacion_siembra: '',
    });

    const [selectedOrps, setSelectedOrps] = useState<SelectedOrp[]>([]);
    const [orpInput, setOrpInput] = useState('');
    const [inputMode, setInputMode] = useState<'rango' | 'individual'>('rango');
    const [origenes, setOrigenes] = useState(initialOrigenes);
    const [loadingOrigenes, setLoadingOrigenes] = useState(false);
    const timeoutRef = useRef<NodeJS.Timeout | null>(null);

    // Para modo individual
    const [seguimientosIndividuales, setSeguimientosIndividuales] = useState<SeguimientoParaEnviar[]>([]);
    const [nuevoNumero, setNuevoNumero] = useState('');
    const [origenIndividual, setOrigenIndividual] = useState('');

    // Para modo rango
    const [rangos, setRangos] = useState<RangoConfig[]>([]);

    useEffect(() => {
        setRangos(prevRangos => {
            return origenes.map(origen => {
                const rangoExistente = prevRangos.find(r => r.origenId === origen.id.toString());
                return {
                    id: origen.id,
                    desde: rangoExistente ? rangoExistente.desde : '',
                    hasta: rangoExistente ? rangoExistente.hasta : '',
                    origenId: origen.id.toString()
                };
            });
        });
    }, [origenes]);

    const [resumen, setResumen] = useState<{
        total: number;
        porOrigen: Record<string, number>;
        origenesUnicos: string[];
    }>({
        total: 0,
        porOrigen: {},
        origenesUnicos: [],
    });


    useEffect(() => {
    console.log('ORPs recibidas:', orps);
}, [orps]);
    // Cargar ORPs seleccionadas inicialmente si vienen del backend
    useEffect(() => {
        if (initialSelectedOrpIds && initialSelectedOrpIds.length > 0) {
            const orpsToAdd = orps.filter(orp =>
                initialSelectedOrpIds.includes(orp.id)
            ).map(orp => ({
                id: orp.id,
                codigo: orp.codigo,
                fecha_vencimiento: orp.fecha_vencimiento ? orp.fecha_vencimiento : undefined,
                nombre_sap: orp.producto_terminado?.nombre_sap
            }));

            setSelectedOrps(orpsToAdd);
        }
    }, [initialSelectedOrpIds, orps]);

    // Función para cargar orígenes filtrados
    const cargarOrigenesFiltrados = useCallback(async (orpIds: number[]) => {
        if (orpIds.length === 0) {
            // Si no hay ORPs seleccionadas, cargar todos los orígenes disponibles
            try {
                const response = await fetch(route('seguimiento-uht.get-origenes'));
                const data = await response.json();
                setOrigenes(data.origenes);
            } catch (error) {
                console.error('Error al cargar orígenes:', error);
            }
            return;
        }

        setLoadingOrigenes(true);
        try {
            const response = await fetch(route('seguimiento-uht.get-origenes-filtrados'), {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '',
                },
                body: JSON.stringify({ orp_ids: orpIds }),
            });

            const data = await response.json();
            setOrigenes(data.origenes);

            // Limpiar selecciones de origen que ya no están disponibles
            if (inputMode === 'individual' && origenIndividual && !data.origenes.some((o: any) => o.id.toString() === origenIndividual)) {
                setOrigenIndividual('');
            }

            // Limpiar selecciones de origen en rangos
            setRangos(prev => prev.map(rango => {
                if (rango.origenId && !data.origenes.some((o: any) => o.id.toString() === rango.origenId)) {
                    return { ...rango, origenId: '' };
                }
                return rango;
            }));

            // Limpiar seguimientos individuales con orígenes no disponibles
            setSeguimientosIndividuales(prev =>
                prev.filter(seg =>
                    data.origenes.some((o: any) => o.id.toString() === seg.origen_id)
                )
            );

        } catch (error) {
            console.error('Error al cargar orígenes filtrados:', error);
        } finally {
            setLoadingOrigenes(false);
        }
    }, [inputMode, origenIndividual]);

    // Crear función debounce manualmente
    const debouncedCargarOrigenes = useCallback(
        (orpIds: number[]) => {
            if (timeoutRef.current) {
                clearTimeout(timeoutRef.current);
            }

            timeoutRef.current = setTimeout(() => {
                cargarOrigenesFiltrados(orpIds);
            }, 300);
        },
        [cargarOrigenesFiltrados]
    );

    // Actualizar orígenes cuando cambian las ORPs seleccionadas
    useEffect(() => {
        const orpIds = selectedOrps.map(orp => orp.id);
        debouncedCargarOrigenes(orpIds);

        // Limpiar timeout al desmontar
        return () => {
            if (timeoutRef.current) {
                clearTimeout(timeoutRef.current);
            }
        };
    }, [selectedOrps, debouncedCargarOrigenes]);

    // Actualizar resumen cuando cambian los datos
    useEffect(() => {
        calcularResumen();
    }, [inputMode, rangos, seguimientosIndividuales]);

    const calcularResumen = () => {
        if (inputMode === 'individual') {
            const porOrigen: Record<string, number> = {};
            seguimientosIndividuales.forEach(seg => {
                porOrigen[seg.origen_id] = (porOrigen[seg.origen_id] || 0) + 1;
            });

            setResumen({
                total: seguimientosIndividuales.length,
                porOrigen,
                origenesUnicos: Object.keys(porOrigen),
            });
        } else {
            let total = 0;
            const porOrigen: Record<string, number> = {};
            const origenesSet = new Set<string>();

            rangos.forEach(rango => {
                if (rango.desde && rango.hasta && rango.origenId) {
                    const desde = parseInt(rango.desde);
                    const hasta = parseInt(rango.hasta);

                    if (!isNaN(desde) && !isNaN(hasta) && desde <= hasta) {
                        const cantidad = hasta - desde + 1;
                        total += cantidad;
                        porOrigen[rango.origenId] = (porOrigen[rango.origenId] || 0) + cantidad;
                        origenesSet.add(rango.origenId);
                    }
                }
            });

            setResumen({
                total,
                porOrigen,
                origenesUnicos: Array.from(origenesSet),
            });
        }
    };

    const handleChange = (key: string, value: string) => {
        setForm((prev) => ({ ...prev, [key]: value }));
    };



    const handleOrpSelect = (orpId: string) => {
        if (!orpId) return;

        const id = parseInt(orpId);
        const alreadySelected = selectedOrps.some(orp => orp.id === id);

        if (alreadySelected) return;

        const orpToAdd = orps.find(orp => orp.id === id);
        if (orpToAdd) {
            const nuevaOrp = {
                id: orpToAdd.id,
                codigo: orpToAdd.codigo,
                nombre_sap: orpToAdd.producto_terminado?.nombre_sap
            };

            setSelectedOrps(prev => [...prev, nuevaOrp]);
            setOrpInput('');
        }
    };

    const removeOrp = (id: number) => {
        setSelectedOrps(prev => prev.filter(orp => orp.id !== id));
    };

    // Funciones para modo individual
    const agregarSeguimientoIndividual = () => {
        if (nuevoNumero.trim() && origenIndividual) {
            // Verificar si ya existe en la lista actual
            const existe = seguimientosIndividuales.some(
                seg => seg.numero === nuevoNumero.trim() && seg.origen_id === origenIndividual
            );

            if (existe) {
                alert('Esta combinación de número y origen ya fue agregada');
                return;
            }

            setSeguimientosIndividuales(prev => [
                ...prev,
                {
                    numero: nuevoNumero.trim(),
                    origen_id: origenIndividual
                }
            ]);
            setNuevoNumero('');
        } else if (!origenIndividual) {
            alert('Debe seleccionar un origen para el número');
        }
    };

    const removerSeguimientoIndividual = (index: number) => {
        setSeguimientosIndividuales(prev => prev.filter((_, i) => i !== index));
    };

    // Funciones para modo rango
    const actualizarRango = (id: number, campo: keyof RangoConfig, valor: string) => {
        setRangos(prev => prev.map(rango =>
            rango.id === id ? { ...rango, [campo]: valor } : rango
        ));
    };

    // Generar seguimientos desde rangos
    const generarSeguimientosDesdeRangos = (): SeguimientoParaEnviar[] => {
        const seguimientos: SeguimientoParaEnviar[] = [];

        rangos.forEach(rango => {
            if (rango.desde && rango.hasta && rango.origenId) {
                const desde = parseInt(rango.desde);
                const hasta = parseInt(rango.hasta);

                if (!isNaN(desde) && !isNaN(hasta) && desde <= hasta) {
                    for (let i = desde; i <= hasta; i++) {
                        seguimientos.push({
                            numero: i.toString(),
                            origen_id: rango.origenId
                        });
                    }
                }
            }
        });

        return seguimientos;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (selectedOrps.length === 0) {
            alert('Debe seleccionar al menos una ORP');
            return;
        }

        if (resumen.total === 0) {
            alert('Debe configurar al menos un seguimiento');
            return;
        }

        let seguimientosParaEnviar: SeguimientoParaEnviar[] = [];

        if (inputMode === 'individual') {
            seguimientosParaEnviar = seguimientosIndividuales;
        } else {
            // Validar rangos
            const rangosValidos = rangos.filter(r =>
                r.desde && r.hasta && r.origenId
            );

            if (rangosValidos.length === 0) {
                alert('Debe configurar al menos un rango válido');
                return;
            }

            seguimientosParaEnviar = generarSeguimientosDesdeRangos();

            if (seguimientosParaEnviar.length === 0) {
                alert('No se generaron seguimientos válidos desde los rangos');
                return;
            }
        }

        // Eliminar duplicados dentro de la misma operación
        const unicos = [];
        const vistas = new Set<string>();

        for (const seg of seguimientosParaEnviar) {
            const clave = `${seg.origen_id}-${seg.numero}`;
            if (!vistas.has(clave)) {
                vistas.add(clave);
                unicos.push(seg);
            }
        }

        if (unicos.length !== seguimientosParaEnviar.length) {
            alert(`Se encontraron ${seguimientosParaEnviar.length - unicos.length} combinaciones duplicadas. Se eliminarán automáticamente.`);
        }

        seguimientosParaEnviar = unicos;

        // Preparar datos para enviar
        const datosParaEnviar = {
            ...form,
            orp_ids: selectedOrps.map(orp => orp.id),
            seguimientos: seguimientosParaEnviar,
            observacion_siembra: form.observacion_siembra || null,
        };

        // Mostrar resumen antes de enviar
        const origenesNombres = resumen.origenesUnicos.map(id => {
            const origen = origenes.find(o => o.id.toString() === id);
            return `${origen?.alias}: ${resumen.porOrigen[id]}`;
        }).join(', ');

        const confirmacion = confirm(
            `¿Está seguro de crear ${resumen.total} seguimiento(s)?\n\n` +
            `Orígenes: ${origenesNombres}\n` +
            `Lote: ${form.lote}\n` +
            `ORPs: ${selectedOrps.length}`
        );

        if (confirmacion) {
            // Enviar todos los datos
            router.post(route('seguimiento-uht.store'), datosParaEnviar);
        }
    };

    // Filtrar ORPs que no están seleccionadas
    const availableOrps = orps.filter(orp =>
        !selectedOrps.some(selected => selected.id === orp.id)
    );

    const obtenerNombreOrigen = (id: string) => {
        const origen = origenes.find(o => o.id.toString() === id);
        return origen?.alias || 'Desconocido';
    };

    return (
        <AppLayout
            breadcrumbs={[
                { title: 'Seguimiento UHT', href: route('seguimiento-uht.index') },
                { title: 'Nuevo Masivo', href: '#' },
            ]}
        >
            <Head title="Creación Masiva Seguimiento UHT" />
            <Toast />

            <form
                onSubmit={handleSubmit}
                className="mx-auto max-w-6xl space-y-6 rounded-lg border bg-background p-6"
            >
                <h1 className="text-xl font-semibold text-foreground">
                    Creación Masiva de Seguimientos UHT
                </h1>

                {/* ORPs seleccionadas */}
                <div className="space-y-2">
                    <div className="flex items-center justify-between">
                        <Label>ORPs Seleccionadas (compartidas para todos) *</Label>
                        {loadingOrigenes && (
                            <span className="text-xs text-muted-foreground flex items-center">
                                <RefreshCw className="h-3 w-3 mr-1 animate-spin" />
                                Filtrando orígenes...
                            </span>
                        )}
                    </div>
                    <div className="min-h-[60px] rounded-md border border-input bg-muted/50 p-3">
                        {selectedOrps.length === 0 ? (
                            <p className="text-sm text-muted-foreground italic">
                                No hay ORPs seleccionadas. Los orígenes se filtrarán según las ORPs seleccionadas.
                            </p>
                        ) : (
                            <div className="flex flex-wrap gap-2">
                                {selectedOrps.map((orp) => (
                                    <Badge
                                        key={orp.id}
                                        variant="secondary"
                                        className="flex items-center gap-1 px-3 py-1"
                                    >
                                        <span className="font-medium">{orp.codigo}</span>
                                        {orp.nombre_sap && (
                                            <span className="text-xs text-muted-foreground truncate max-w-[200px]">
                                                ({orp.nombre_sap})
                                            </span>
                                        )}
                                        <Button
                                            type="button"
                                            variant="ghost"
                                            size="icon"
                                            className="h-4 w-4 ml-1"
                                            onClick={() => removeOrp(orp.id)}
                                        >
                                            <X className="h-3 w-3" />
                                        </Button>
                                    </Badge>
                                ))}
                            </div>
                        )}
                    </div>
                    <p className="text-xs text-muted-foreground">
                        Seleccionadas: {selectedOrps.length} • Orígenes disponibles: {origenes.length}
                    </p>
                    {errors.orp_ids && (
                        <p className="text-sm text-destructive">
                            {errors.orp_ids}
                        </p>
                    )}
                </div>

                {/* Seleccionar nueva ORP */}
                {/* Seleccionar nueva ORP */}
<div className="space-y-1">
    <Label>Agregar ORP</Label>
    <div className="flex gap-2">
        <div className="flex-1">
            <FilterSelect
    value={orpInput}
    onChange={handleOrpSelect}
    placeholder="Buscar y seleccionar ORP..."
    options={availableOrps.map((o) => ({
        value: o.id.toString(),
        label: `${o.codigo} ${o.producto_terminado ? `- ${o.producto_terminado.nombre_sap}` : ''} ${o.fecha_vencimiento ? `(${o.fecha_vencimiento})` : ''}`.trim()
    }))}
    searchable={true}
/>
        </div>
        {/* <Button
            type="button"
            variant="outline"
            onClick={() => {
                if (orpInput) {
                    handleOrpSelect(orpInput);
                }
            }}
        >
            <Plus className="h-4 w-4" />
            Agregar
        </Button> */}
    </div>
</div>

                {/* Lote */}
                <div className="space-y-1">
                    <Label>Lote (compartido para todos) *</Label>
                    <Input
                        value={form.lote}
                        onChange={(e) => handleChange('lote', e.target.value)}
                        placeholder="Ej. LOTE-UHT-2025-01"
                    />
                    {errors.lote && (
                        <p className="text-sm text-destructive">
                            {errors.lote}
                        </p>
                    )}
                </div>

                {/* Tabs para modo de entrada */}
                <div className="space-y-4">
                    <Label>Configuración de Seguimientos *</Label>
                    <Tabs defaultValue="rango" onValueChange={(v) => setInputMode(v as any)}>
                        <TabsList className="grid w-full grid-cols-2">
                            <TabsTrigger value="rango">Por Rangos</TabsTrigger>
                            {/* <TabsTrigger value="individual">Individuales</TabsTrigger> */}
                        </TabsList>

                        <TabsContent value="rango" className="space-y-4">
                            <div className="rounded-md border p-4">
                                <div className="flex items-center justify-between mb-4">
                                    <Label>Configurar rangos por origen</Label>
                                    <div className="flex items-center gap-2">
                                        <span className="text-xs text-muted-foreground">
                                            Orígenes disponibles: {origenes.length}
                                        </span>
                                    </div>
                                </div>

                                {origenes.length === 0 ? (
                                    <div className="p-4 text-center text-muted-foreground border rounded bg-muted/50">
                                        {selectedOrps.length === 0 ? (
                                            <p>Seleccione al menos una ORP para ver los orígenes disponibles</p>
                                        ) : (
                                            <p>No se encontraron orígenes relacionados con las ORPs seleccionadas y proceso ENVASADO</p>
                                        )}
                                    </div>
                                ) : (
                                    <>
                                        <div className="grid grid-cols-3 gap-3">
                                            {rangos.map((rango, index) => (
                                                <div key={rango.id} className="grid grid-cols-12 gap-4 p-3 bg-muted/30 rounded items-center">
                                                    <div className="col-span-4 flex flex-col justify-center">
                                                        <Label className="text-xs mb-1">Origen</Label>
                                                        <div className="flex h-10 w-full items-center rounded-md border border-input bg-background px-3 py-2 text-sm font-medium text-muted-foreground">
                                                            {origenes.find(o => o.id.toString() === rango.origenId)?.alias || 'Desconocido'}
                                                        </div>
                                                    </div>
                                                    <div className="col-span-3">
                                                        <Label className="text-xs mb-1 block">Desde </Label>
                                                        <Input
                                                            value={rango.desde}
                                                            onChange={(e) => actualizarRango(rango.id, 'desde', e.target.value)}
                                                            placeholder="Ej: 1"
                                                            type="number"
                                                            min="1"
                                                        />
                                                    </div>
                                                    <div className="col-span-3">
                                                        <Label className="text-xs mb-1 block">Hasta </Label>
                                                        <Input
                                                            value={rango.hasta}
                                                            onChange={(e) => actualizarRango(rango.id, 'hasta', e.target.value)}
                                                            placeholder="Ej: 3"
                                                            type="number"
                                                            min={rango.desde || "1"}
                                                        />
                                                    </div>
                                                    <div className="col-span-2 flex items-center justify-end pr-2 pt-5">
                                                        <div className="text-right">
                                                            <div className="text-base font-bold text-primary">
                                                                {rango.desde && rango.hasta && !isNaN(parseInt(rango.desde)) && !isNaN(parseInt(rango.hasta))
                                                                    ? Math.max(0, parseInt(rango.hasta) - parseInt(rango.desde) + 1)
                                                                    : 0}
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </>
                                )}
                            </div>
                        </TabsContent>

                        <TabsContent value="individual" className="space-y-4">
                            <div className="rounded-md border p-4">
                                <div className="grid grid-cols-12 gap-2 mb-4">
                                    <div className="col-span-5">
                                        <Label className="text-xs">Número *</Label>
                                        <Input
                                            value={nuevoNumero}
                                            onChange={(e) => setNuevoNumero(e.target.value)}
                                            placeholder="Ej: 001, A-1, 21"
                                            onKeyPress={(e) => {
                                                if (e.key === 'Enter') {
                                                    e.preventDefault();
                                                    agregarSeguimientoIndividual();
                                                }
                                            }}
                                        />
                                    </div>
                                    <div className="col-span-5">
                                        <Label className="text-xs">Origen *</Label>
                                        <FilterSelect
                                            value={origenIndividual}
                                            onChange={setOrigenIndividual}
                                            placeholder={origenes.length === 0 ?
                                                (selectedOrps.length === 0 ?
                                                    "Seleccione ORPs primero" :
                                                    "No hay orígenes disponibles") :
                                                "Seleccionar origen"}
                                            options={origenes.map((o) => ({
                                                value: o.id.toString(),
                                                label: o.alias,
                                            }))}
                                            disabled={origenes.length === 0}
                                        />
                                    </div>
                                    <div className="col-span-2 flex items-end">
                                        <Button
                                            type="button"
                                            onClick={agregarSeguimientoIndividual}
                                            className="w-full"
                                            disabled={origenes.length === 0 || !origenIndividual}
                                        >
                                            <Plus className="h-4 w-4 mr-1" />
                                            Agregar
                                        </Button>
                                    </div>
                                </div>

                                <div className="min-h-[150px] max-h-[250px] overflow-y-auto rounded border p-2">
                                    {seguimientosIndividuales.length === 0 ? (
                                        <p className="text-sm text-muted-foreground italic text-center py-8">
                                            No hay seguimientos agregados
                                        </p>
                                    ) : (
                                        <table className="w-full text-sm">
                                            <thead>
                                                <tr className="border-b">
                                                    <th className="text-left p-2">Número</th>
                                                    <th className="text-left p-2">Origen</th>
                                                    <th className="text-right p-2">Acciones</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {seguimientosIndividuales.map((seg, index) => (
                                                    <tr key={index} className="border-b hover:bg-muted/50">
                                                        <td className="p-2 font-medium">{seg.numero}</td>
                                                        <td className="p-2">
                                                            {obtenerNombreOrigen(seg.origen_id)}
                                                        </td>
                                                        <td className="p-2 text-right">
                                                            <Button
                                                                type="button"
                                                                variant="ghost"
                                                                size="icon"
                                                                onClick={() => removerSeguimientoIndividual(index)}
                                                            >
                                                                <X className="h-4 w-4" />
                                                            </Button>
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    )}
                                </div>

                                <div className="mt-3 text-sm text-muted-foreground">
                                    Total: {seguimientosIndividuales.length} seguimiento(s)
                                </div>
                            </div>
                        </TabsContent>
                    </Tabs>
                </div>

                {/* Resumen Detallado */}
                <div className="rounded-lg bg-primary/5 p-4 border">
                    <h3 className="font-semibold mb-3">Resumen de Creación</h3>

                    <div className="grid grid-cols-3 gap-4 mb-4">
                        <div className="text-center p-3 bg-background rounded">
                            <div className="text-2xl font-bold text-primary">{resumen.total}</div>
                            <div className="text-sm text-muted-foreground">Total Seguimientos</div>
                        </div>
                        <div className="text-center p-3 bg-background rounded">
                            <div className="text-2xl font-bold text-primary">{resumen.origenesUnicos.length}</div>
                            <div className="text-sm text-muted-foreground">Orígenes</div>
                        </div>
                        <div className="text-center p-3 bg-background rounded">
                            <div className="text-2xl font-bold text-primary">{selectedOrps.length}</div>
                            <div className="text-sm text-muted-foreground">ORPs</div>
                        </div>
                    </div>

                    {resumen.origenesUnicos.length > 0 && (
                        <div>
                            <h4 className="font-medium mb-2">Distribución por Origen:</h4>
                            <div className="space-y-2">
                                {resumen.origenesUnicos.map(origenId => (
                                    <div key={origenId} className="flex justify-between items-center">
                                        <span className="text-sm">
                                            {obtenerNombreOrigen(origenId)}
                                        </span>
                                        <span className="font-medium">
                                            {resumen.porOrigen[origenId]} seguimiento(s)
                                        </span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>

                {/* Observación Siembra */}
                <div className="space-y-1">
                    <Label>Observación de Siembra (opcional)</Label>
                    <textarea
                        value={form.observacion_siembra}
                        onChange={(e) =>
                            handleChange('observacion_siembra', e.target.value)
                        }
                        placeholder="Observaciones adicionales (aplicará a todos los seguimientos)..."
                        className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                        rows={3}
                    />
                    {errors.observacion_siembra && (
                        <p className="text-sm text-destructive">
                            {errors.observacion_siembra}
                        </p>
                    )}
                </div>

                {/* Acciones */}
                <div className="flex justify-end gap-3 pt-4">
                    <Button
                        type="button"
                        variant="outline"
                        onClick={() => router.visit(route('seguimiento-uht.index'))}
                    >
                        Cancelar
                    </Button>
                    <Button
                        type="submit"
                        disabled={selectedOrps.length === 0 || resumen.total === 0}
                        className="bg-green-600 hover:bg-green-700"
                    >
                        <Plus className="h-4 w-4 mr-2" />
                        Crear {resumen.total} Seguimiento(s)
                    </Button>
                </div>

                {/* Mensajes de validación */}
                {selectedOrps.length === 0 && (
                    <div className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">
                        <p>⚠️ Debe seleccionar al menos una ORP para continuar.</p>
                    </div>
                )}

                {resumen.total === 0 && (
                    <div className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">
                        <p>⚠️ Debe configurar al menos un seguimiento para crear.</p>
                    </div>
                )}
            </form>
        </AppLayout>
    );
}
