import { Button } from '@/components/ui/button'
import FormInput from '@/components/ui/form-input'
import FormSelect from '@/components/ui/form-select'
import AppLayout from '@/layouts/app-layout'
import { type BreadcrumbItem } from '@/types'
import { Head, useForm } from '@inertiajs/react'
import * as React from 'react'
import { route } from 'ziggy-js'
import { Checkbox } from '@/components/ui/checkbox'

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Recepciones de Leche', href: '/planta-lacteos/recepciones-leche' },
    { title: 'Nueva Recepción', href: '' },
]

interface SubRuta {
    id: number
    nombre: string
    grupo: string
    ruta_id?: number
    PLL_ruta_acopios_id?: number
    ruta?: { id: number; nombre: string } | null
}

interface FormData {
    ruta_id: string | number
    grupo_recepcion: string
    subrutas_seleccionadas: number[] // 👈 define que es un array de números
    cantidad: string
    observaciones: string
}

interface PageProps {
    subrutas?: SubRuta[]
}

export default function Crear({ subrutas = [] }: PageProps) {
    const { data, setData, post, processing, errors } = useForm<FormData>({
        ruta_id: '', // string
        grupo_recepcion: '',
        subrutas_seleccionadas: [] as number[],
        cantidad: '',
        observaciones: '',
    })

    // ✅ obtenemos rutas únicas sin romper si alguna ruta es null
    const rutas = React.useMemo(() => {
        const map = new Map<number, { id: number; nombre: string }>()
        subrutas.forEach((s) => {
            if (s.ruta && s.ruta.id) {
                map.set(s.ruta.id, s.ruta)
            }
        })
        return Array.from(map.values())
    }, [subrutas])

    // Filtro tolerante y case-insensitive
    const subrutasFiltradas = subrutas.filter((s) => {
        const subrutaRutaId = Number(s.ruta_id ?? s.PLL_ruta_acopios_id ?? 0)
        const selectedRutaId = Number(data.ruta_id ?? 0)
        const grupoMatch = !data.grupo_recepcion ||
            (s.grupo ?? '').toString().toLowerCase() === data.grupo_recepcion.toString().toLowerCase()

        const rutaMatch = !data.ruta_id || subrutaRutaId === selectedRutaId

        return rutaMatch && grupoMatch
    })


    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault()
        post(route('recepciones-leche.store'))
    }

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Nueva Recepción de Leche" />

            <div className="px-4 sm:px-6 py-4 max-w-4xl mx-auto">
                {/* Header */}
                <div className="mb-6">
                    <h1 className="text-2xl font-bold text-foreground">Nueva Recepción de Leche</h1>
                    <p className="mt-1 text-sm text-muted-foreground">
                        Registre una nueva recepción de leche en el sistema
                    </p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Información principal */}
                    <div className="bg-card rounded-lg border border-border shadow-sm p-4">
                        <h2 className="text-base font-semibold text-foreground mb-4">
                            Información de Recepción
                        </h2>

                        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                            <FormSelect
                                label="Ruta de Acopio *"
                                value={data.ruta_id}
                                onChange={(v: string) => setData('ruta_id', v)}
                                placeholder="Seleccione ruta"
                                options={rutas.map((r) => ({
                                    value: r.id.toString(),
                                    label: r.nombre,
                                }))}
                                error={errors.ruta_id}
                            />

                            <FormSelect
                                label="Grupo de Recepción *"
                                value={data.grupo_recepcion}
                                onChange={(v: string) => setData('grupo_recepcion', v)}
                                placeholder="Seleccione grupo"
                                options={[
                                    { value: 'Camión', label: 'Camión' },
                                    { value: 'Tubo', label: 'Tubo' },
                                ]}
                                error={errors.grupo_recepcion}
                            />

                            <FormInput
                                id="cantidad"
                                label="Cantidad (Litros)"
                                type="number"
                                step="0.01"
                                min="0.01"
                                value={data.cantidad}
                                onChange={(e) => setData('cantidad', e.target.value)}
                                placeholder="0.00"
                                error={errors.cantidad}
                                className="col-span-2"
                            />
                        </div>
                    </div>

                    {/* ✅ Checkboxes Subrutas */}
                    {subrutasFiltradas.length > 0 ? (
                        subrutasFiltradas.map((subruta) => (
                            <div key={subruta.id} className="flex items-center space-x-2">
                                <Checkbox
                                    id={`subruta-${subruta.id}`}
                                    checked={data.subrutas_seleccionadas.includes(subruta.id)}
                                    onCheckedChange={(checked) => {
                                        if (checked) {
                                            setData('subrutas_seleccionadas', [
                                                ...data.subrutas_seleccionadas,
                                                subruta.id,
                                            ]);
                                        } else {
                                            setData(
                                                'subrutas_seleccionadas',
                                                data.subrutas_seleccionadas.filter((id) => id !== subruta.id)
                                            );
                                        }
                                    }}
                                />
                                <label htmlFor={`subruta-${subruta.id}`} className="text-sm font-medium cursor-pointer">
                                    {subruta.nombre} {subruta.ruta?.nombre && `(${subruta.ruta.nombre})`}
                                </label>
                            </div>
                        ))
                    ) : (
                        <p className="text-muted-foreground italic text-sm">
                            No hay subrutas disponibles para esta ruta o grupo
                        </p>
                    )}

                    {/* Observaciones */}
                    <div className="bg-card rounded-lg border border-border shadow-sm p-4">
                        <h2 className="text-base font-semibold text-foreground mb-4">
                            Observaciones (Opcional)
                        </h2>
                        <FormInput
                            id="observaciones"
                            label="Observaciones"
                            value={data.observaciones}
                            onChange={(e) => setData('observaciones', e.target.value)}
                            placeholder="Observaciones adicionales..."
                            error={errors.observaciones}
                        />
                    </div>

                    {/* Botones */}
                    <div className="bg-card rounded-lg border border-border shadow-sm p-4">
                        <div className="flex flex-col sm:flex-row gap-3 justify-end">
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => window.history.back()}
                                className="sm:w-32 w-full order-2 sm:order-1"
                            >
                                Cancelar
                            </Button>
                            <Button
                                type="submit"
                                disabled={processing}
                                className="sm:w-40 w-full order-1 sm:order-2"
                            >
                                {processing ? (
                                    <div className="flex items-center justify-center">
                                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                                        Creando...
                                    </div>
                                ) : (
                                    'Crear Recepción'
                                )}
                            </Button>
                        </div>
                    </div>
                </form>
            </div>
        </AppLayout>
    )
}
