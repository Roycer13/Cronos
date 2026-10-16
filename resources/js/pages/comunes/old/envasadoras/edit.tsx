import AppLayout from '@/layouts/app-layout'
import { Head, router, usePage } from '@inertiajs/react'
import { useEffect, useMemo, useState } from 'react'
import { route } from 'ziggy-js'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import FormSelect from '@/components/ui/form-select'
import MultiSelect from '@/components/ui/multi-select'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Textarea } from '@/components/ui/textarea'

import DynamicChecklist from './components/DynamicChecklist'

export default function Edit() {

    const { registro, users, orps, config, origenes_list = [] } = usePage<any>().props

    const [form, setForm] = useState(registro)

    const update = (key: string, value: any) => {
        setForm({ ...form, [key]: value })
    }

    // 🔥 FILTRO ORIGENES
    const origenesFiltrados = useMemo(() => {

        if (!form.tipo_maquina) return []

        return origenes_list.filter((o: any) => {

            const descripcion = (o.descripcion || '').toUpperCase()

            if (form.tipo_maquina === 'cabezal') return descripcion.includes('HTST')
            if (form.tipo_maquina === 'vasos') return descripcion.includes('VASOS')
            if (form.tipo_maquina === 'botella') return descripcion.includes('BOTELLAS')

            return false
        })

    }, [form.tipo_maquina, origenes_list])

    // 🔥 AUTO CHECKS - Actualizar cuando cambia tipo_maquina
    useEffect(() => {

        if (!form.tipo_maquina) return

        const tipoConfig = config[form.tipo_maquina] || {}
        
        // 🔧 Aplanar: general + extras
        const lista = [
            ...(tipoConfig.general || []),
            ...(tipoConfig.extras || [])
        ]

        const nuevos: any = {}

        lista.forEach((item: any) => {
            const key = typeof item === 'string' ? item : item.key
            nuevos[key] = true
        })

        setForm((prev: any) => ({
            ...prev,
            checks: nuevos
        }))

    }, [form.tipo_maquina, config])

    // 🔥 AUTO ORIGENES - rellenar con todos los filtrados
    useEffect(() => {
        if (!form.tipo_maquina) {
            setForm((prev: any) => ({ ...prev, origenes: [] }))
            return
        }

        const todos = origenesFiltrados.map((o: any) => o.value)

        setForm((prev: any) => ({ ...prev, origenes: todos }))

    }, [form.tipo_maquina, origenesFiltrados])

    const submit = () => {
        router.put(route('old-envasadoras.update', registro.id), form)
    }

    return (
        <AppLayout>
            <Head title="Editar" />

            <div className="max-w-6xl mx-auto p-6 space-y-6">

                <div className="flex justify-between">
                    <h1 className="text-2xl font-semibold">
                        Editar Envasadora HTST
                    </h1>

                    <Button onClick={submit}>
                        Actualizar
                    </Button>
                </div>

                {/* DATOS */}
                <Card>
                    <CardHeader>
                        <CardTitle>Datos Generales</CardTitle>
                    </CardHeader>

                    <CardContent className="grid md:grid-cols-3 gap-4">

                        <FormSelect
                            label="Tipo Máquina"
                            value={form.tipo_maquina}
                            onChange={(v) => update('tipo_maquina', v)}
                            options={[
                                { value: 'cabezal', label: 'Cabezal (HTST)' },
                                { value: 'vasos', label: 'Vasos' },
                                { value: 'botella', label: 'Botellas' }
                            ]}
                        />

                        <Input
                            type="date"
                            value={form.fecha}
                            onChange={(e) => update('fecha', e.target.value)}
                        />

                        <FormSelect
                            label="ORP"
                            value={form.orp_id}
                            onChange={(v) => update('orp_id', v)}
                            options={orps}
                        />

                        <FormSelect
                            label="Maquinista"
                            value={form.maquinista_id}
                            onChange={(v) => update('maquinista_id', v)}
                            options={users}
                        />

                        <FormSelect
                            label="Verificador"
                            value={form.usuario_verificador}
                            onChange={(v) => update('usuario_verificador', v)}
                            options={users}
                        />

                        <FormSelect
                            label="Tipo Medición"
                            value={form.tipo_medicion}
                            onChange={(v) => update('tipo_medicion', v)}
                            options={[
                                { value: 'peso', label: 'Peso' },
                                { value: 'volumen', label: 'Volumen' }
                            ]}
                        />

                        <Input
                            placeholder="Producción"
                            value={form.valor_produccion}
                            onChange={(e) => update('valor_produccion', e.target.value)}
                        />

                        <Input
                            placeholder="Merma"
                            value={form.merma}
                            onChange={(e) => update('merma', e.target.value)}
                        />

                    </CardContent>
                </Card>

                {/* ORIGENES */}
                <Card>
                    <CardHeader>
                        <CardTitle>Orígenes (Múltiples)</CardTitle>
                    </CardHeader>

                    <CardContent>
                        <MultiSelect
                            label="Seleccionar Orígenes"
                            value={form.origenes || []}
                            onChange={(v) => update('origenes', v)}
                            options={origenesFiltrados}
                        />
                    </CardContent>
                </Card>

                {/* CHECKLIST */}
                {form.tipo_maquina && (
                    <Card>
                        <CardHeader>
                            <CardTitle>Checklist</CardTitle>
                        </CardHeader>

                        <CardContent>
                            <DynamicChecklist
                                tipo={form.tipo_maquina}
                                value={form.checks}
                                onChange={(v: any) => update('checks', v)}
                                config={config}
                            />
                        </CardContent>
                    </Card>
                )}

                {/* OBS */}
                <Card>
                    <CardHeader>
                        <CardTitle>Observaciones</CardTitle>
                    </CardHeader>

                    <CardContent className="grid md:grid-cols-2 gap-4">
                        <Textarea
                            placeholder="Observaciones"
                            value={form.observaciones}
                            onChange={(e) => update('observaciones', e.target.value)}
                        />

                        <Textarea
                            placeholder="Correcciones"
                            value={form.correciones}
                            onChange={(e) => update('correciones', e.target.value)}
                        />
                    </CardContent>
                </Card>

            </div>
        </AppLayout>
    )
}