// resources/js/Pages/planta_lacteos/higieneAcopio/editar.tsx

import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import AppLayout from '@/layouts/app-layout'
import { Head, useForm } from '@inertiajs/react'
import { route } from 'ziggy-js'

export default function Editar({ higieneAcopio }) {
    const { data, setData, put, processing } = useForm({
        superficie_llegada: higieneAcopio.superficie_llegada,
        observacion_llegada: higieneAcopio.observacion_llegada || '',
        correccion_llegada: higieneAcopio.correccion_llegada || '',
        cofia: higieneAcopio.cofia,
        Barbijo: higieneAcopio.Barbijo,
        Overol: higieneAcopio.Overol,
        superficie_salida: higieneAcopio.superficie_salida,
        observacion_salida: higieneAcopio.observacion_salida || '',
        correccion_salida: higieneAcopio.correccion_salida || '',
    })

    const handleSubmit = (e) => {
        e.preventDefault()
        put(route('higiene-acopio.update', higieneAcopio.id))
    }

    return (
        <AppLayout
            breadcrumbs={[
                {
                    title: 'Higiene de Acopio',
                    href: route('higiene-acopio.index'),
                },
                { title: `Editar #${higieneAcopio.id}`, href: '' },
            ]}
        >
            <Head title="Editar Control de Higiene" />

            <div className="px-4 sm:px-6 py-6 max-w-7xl mx-auto">
                <div className="mb-6">
                    <h1 className="text-2xl font-bold">Editar Control de Higiene</h1>
                    <p className="text-muted-foreground">
                        Ruta: <strong>{higieneAcopio.ruta?.nombre}</strong> - Fecha:{' '}
                        {new Date(higieneAcopio.tiempo).toLocaleString()}
                    </p>

                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Grid de 2 columnas: Llegada | Salida */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        {/* Columna Izquierda - Llegada */}
                        <div className="bg-card rounded-lg border p-4 space-y-4">
                            <h2 className="text-lg font-semibold border-b pb-2">Inspección de Llegada</h2>
                            <div className="flex items-center space-x-2">
                                <Checkbox
                                    id="superficie_llegada"
                                    checked={data.superficie_llegada}
                                    onCheckedChange={(val) =>
                                        setData('superficie_llegada', val)
                                    }
                                />
                                <Label htmlFor="superficie_llegada">
                                    Superficie en condiciones
                                </Label>
                            </div>
                            <div>
                                <Label htmlFor="observacion_llegada">Observación</Label>
                                <Textarea
                                    id="observacion_llegada"
                                    value={data.observacion_llegada}
                                    onChange={(e) =>
                                        setData('observacion_llegada', e.target.value)
                                    }
                                    rows={3}
                                />
                            </div>
                            <div>
                                <Label htmlFor="correccion_llegada">Corrección requerida</Label>
                                <Input
                                    id="correccion_llegada"
                                    value={data.correccion_llegada}
                                    onChange={(e) =>
                                        setData('correccion_llegada', e.target.value)
                                    }
                                />
                            </div>
                        </div>

                        {/* Columna Derecha - Salida */}
                        <div className="bg-card rounded-lg border p-4 space-y-4">
                            <h2 className="text-lg font-semibold border-b pb-2">Inspección de Salida</h2>
                            <div className="flex items-center space-x-2">
                                <Checkbox
                                    id="superficie_salida"
                                    checked={data.superficie_salida}
                                    onCheckedChange={(val) =>
                                        setData('superficie_salida', val)
                                    }
                                />
                                <Label htmlFor="superficie_salida">
                                    Superficie en condiciones
                                </Label>
                            </div>
                            <div>
                                <Label htmlFor="observacion_salida">Observación</Label>
                                <Textarea
                                    id="observacion_salida"
                                    value={data.observacion_salida}
                                    onChange={(e) =>
                                        setData('observacion_salida', e.target.value)
                                    }
                                    rows={3}
                                />
                            </div>
                            <div>
                                <Label htmlFor="correccion_salida">Corrección requerida</Label>
                                <Input
                                    id="correccion_salida"
                                    value={data.correccion_salida}
                                    onChange={(e) =>
                                        setData('correccion_salida', e.target.value)
                                    }
                                />
                            </div>
                        </div>
                    </div>

                    {/* Sección EPP - Ocupa todo el ancho */}
                    <div className="bg-card rounded-lg border p-4 space-y-4">
                        <h2 className="text-lg font-semibold border-b pb-2">
                            Elementos de Protección Personal
                        </h2>
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                            <div className="flex items-center space-x-2">
                                <Checkbox
                                    id="cofia"
                                    checked={data.cofia}
                                    onCheckedChange={(val) => setData('cofia', val)}
                                />
                                <Label htmlFor="cofia">Cofia</Label>
                            </div>
                            <div className="flex items-center space-x-2">
                                <Checkbox
                                    id="Barbijo"
                                    checked={data.Barbijo}
                                    onCheckedChange={(val) => setData('Barbijo', val)}
                                />
                                <Label htmlFor="Barbijo">Barbijo</Label>
                            </div>
                            <div className="flex items-center space-x-2">
                                <Checkbox
                                    id="Overol"
                                    checked={data.Overol}
                                    onCheckedChange={(val) => setData('Overol', val)}
                                />
                                <Label htmlFor="Overol">Overol</Label>
                            </div>
                        </div>
                    </div>

                    {/* Botones */}
                    <div className="flex justify-end gap-3">
                        <Button variant="outline" onClick={() => window.history.back()}>
                            Cancelar
                        </Button>
                        <Button type="submit" disabled={processing}>
                            Guardar Cambios
                        </Button>
                    </div>
                </form>
            </div>
        </AppLayout>
    )
}
