import AppLayout from '@/layouts/app-layout'
import { Head, router, usePage } from '@inertiajs/react'
import { useEffect, useState } from 'react'
import { route } from 'ziggy-js'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import FormSelect from '@/components/ui/form-select'
import MultiSelect from '@/components/ui/multi-select'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

import {
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
} from '@/components/ui/table'

export default function Create() {
  const { areas = [], subareas = [], users = [], authUser } = usePage<any>().props

  const [area, setArea] = useState('')
  const [subarea, setSubarea] = useState<string[]>([])
  const [turnoFiltro, setTurnoFiltro] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')

  const [itemsDelDia, setItemsDelDia] = useState<any[]>([])

  // Hora local del dispositivo
  const now = new Date()
  const localDatetime = now.toLocaleString('sv-SE', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  }).replace(' ', 'T')

  const [form, setForm] = useState({
    user_id: authUser?.id?.toString() || '',
    revisor_id: authUser?.id?.toString() || '',
    tiempo_realizado: localDatetime,
    registros: [] as any[],
  })

  // Subáreas filtradas según área seleccionada (si no hay área, todas)
  const subareasFiltradas = area
    ? subareas.filter((s: any) => s.old_area_id?.toString() === area)
    : subareas

  const opcionesSubareas = subareasFiltradas.map((s: any) => ({
    value: s.id.toString(),
    label: s.nombre,
  }))

  // Podar subáreas inválidas al cambiar de área
  useEffect(() => {
    const idsValidos = opcionesSubareas.map((s) => s.value)
    setSubarea((prev) => prev.filter((id) => idsValidos.includes(id)))
  }, [area])

  // Cargar ítems cuando cambia área, subárea o fecha
  useEffect(() => {
    const params: any = {}
    if (area) params.area_id = area
    if (subarea.length > 0) {
      params['subarea_id[]'] = subarea
    }
    if (form.tiempo_realizado) {
      params.fecha = form.tiempo_realizado.slice(0, 10)
    }

    fetch(route('old-registros.items-dia', params))
      .then((r) => r.json())
      .then((data) => {
        setItemsDelDia(data.items || [])
      })
      .catch((err) => {
        console.error('❌ Error al cargar items:', err)
      })
  }, [area, subarea, form.tiempo_realizado])

  // Construir form.registros a partir de itemsDelDia + turnoFiltro
  useEffect(() => {
    const lista: any[] = []

    itemsDelDia.forEach((item: any) => {
      const turnosAProcesar = turnoFiltro
        ? [parseInt(turnoFiltro)]
        : [1, 2, 3]

      turnosAProcesar.forEach((t) => {
        const turno = item.turnos?.[t]
        if (!turno || typeof turno !== 'object') return

        lista.push({
          old_item_id: item.id,
          nombre: item.nombre,
          area: item.area || '',
          subarea: item.subarea || '',
          turno: t,
          orden: turno.orden ?? false,
          limpieza: turno.limpieza ?? false,
          desinfeccion: turno.desinfeccion ?? false,
          observacion: '',
          correcion: '',
        })
      })
    })

    setForm((f) => ({ ...f, registros: lista }))
  }, [itemsDelDia, turnoFiltro])

  // Actualizar un campo del formulario
  const update = (i: number, field: string, value: any) => {
    const copia = [...form.registros]
    copia[i][field] = value
    setForm({ ...form, registros: copia })
  }

  // Enviar
  const submit = () => {
    if (submitting) return
    setError('')

    if (form.user_id === form.revisor_id) {
      setError('El Responsable de Limpieza y el Supervisor deben ser diferentes.')
      return
    }

    setSubmitting(true)

    const registrosLimpios = form.registros.map((r) => ({
      old_item_id: r.old_item_id,
      orden: r.orden,
      limpieza: r.limpieza,
      desinfeccion: r.desinfeccion,
      observacion: r.observacion,
      correcion: r.correcion,
    }))

    router.post(
      route('old-registros.store'),
      {
        user_id: form.user_id,
        revisor_id: form.revisor_id,
        tiempo_realizado: form.tiempo_realizado,
        registros: registrosLimpios,
      },
      {
        onFinish: () => setSubmitting(false),
      }
    )
  }

  // Visibilidad de columnas
  const mostrarColumnaArea = area === ''
  const mostrarColumnaSubarea = subarea.length === 0
  const mostrarColumnaTurno = turnoFiltro === ''

  const areaNombre = areas.find((a: any) => a.id.toString() === area)?.nombre
  const subareaNombres = subareas
    .filter((s: any) => subarea.includes(s.id.toString()))
    .map((s: any) => s.nombre)
    .join(', ')

  let subtitulo = ''
  if (areaNombre && subareaNombres) {
    subtitulo = `Área: ${areaNombre} → Subáreas: ${subareaNombres}`
  } else if (areaNombre) {
    subtitulo = `Área: ${areaNombre}`
  } else if (subareaNombres) {
    subtitulo = `Subáreas: ${subareaNombres}`
  }

  const registrosVisibles = form.registros

  const columnCount =
    3 +
    (mostrarColumnaArea ? 1 : 0) +
    (mostrarColumnaSubarea ? 1 : 0) +
    (mostrarColumnaTurno ? 1 : 0)

  return (
    <AppLayout>
      <Head title="Registro" />

      <div className="max-w-7xl mx-auto p-4 md:p-6 space-y-6">
        {/* Encabezado */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold tracking-tight">
              Registro por Área
            </h1>
            <p className="text-sm text-muted-foreground mt-1">
              Completa las tareas del día según el plan de limpieza.
            </p>
          </div>
          <Button
            size="lg"
            onClick={submit}
            disabled={submitting}
            className="shadow-md"
          >
            {submitting ? 'Guardando...' : 'Guardar'}
          </Button>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-md text-sm">
            {error}
          </div>
        )}

        {/* Filtros */}
        <Card className="shadow-sm">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-lg">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5 text-primary"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z"
                />
              </svg>
              Filtros
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
              <FormSelect
                label="Área"
                value={area}
                onChange={setArea}
                options={areas.map((a: any) => ({
                  value: a.id.toString(),
                  label: a.nombre,
                }))}
              />

              <MultiSelect
                label="Subárea"
                value={subarea}
                onChange={setSubarea}
                placeholder="Selecciona subáreas"
                options={opcionesSubareas}
                className="max-w-full"
              />

              <FormSelect
                label="Turno"
                value={turnoFiltro}
                onChange={setTurnoFiltro}
                options={[
                  { value: '', label: 'Todos los turnos' },
                  { value: '1', label: 'Turno 1' },
                  { value: '2', label: 'Turno 2' },
                  { value: '3', label: 'Turno 3' },
                ]}
              />

              <FormSelect
                label="Responsable de Limpieza"
                value={form.user_id}
                onChange={(v) => setForm({ ...form, user_id: v })}
                options={users.map((u: any) => ({
                  value: u.id.toString(),
                  label: `${u.name} ${u.apellido}`,
                }))}
              />

              <FormSelect
                label="Supervisor"
                value={form.revisor_id}
                onChange={(v) => setForm({ ...form, revisor_id: v })}
                options={users.map((u: any) => ({
                  value: u.id.toString(),
                  label: `${u.name} ${u.apellido}`,
                }))}
              />

              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-medium">Fecha</label>
                <Input
                  type="datetime-local"
                  value={form.tiempo_realizado}
                  onChange={(e) =>
                    setForm({ ...form, tiempo_realizado: e.target.value })
                  }
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Tabla */}
        <Card className="shadow-sm">
          <CardHeader className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 pb-3">
            <div>
              <CardTitle className="flex items-center gap-2 text-lg">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5 text-primary"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01"
                  />
                </svg>
                Items del día
              </CardTitle>
              {subtitulo && (
                <Badge
                  variant="secondary"
                  className="ml-0 mt-1 sm:ml-2 sm:mt-0"
                >
                  {subtitulo}
                </Badge>
              )}
            </div>
            {turnoFiltro && (
              <Badge variant="outline" className="self-start">
                Turno {turnoFiltro}
              </Badge>
            )}
          </CardHeader>

          <CardContent className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/50">
                  {mostrarColumnaArea && (
                    <TableHead className="font-semibold">Área</TableHead>
                  )}
                  {mostrarColumnaSubarea && (
                    <TableHead className="font-semibold">Subárea</TableHead>
                  )}
                  <TableHead className="font-semibold">Item</TableHead>
                  {mostrarColumnaTurno && (
                    <TableHead className="font-semibold">Turno</TableHead>
                  )}
                  <TableHead className="font-semibold">O</TableHead>
                  <TableHead className="font-semibold">L</TableHead>
                  <TableHead className="font-semibold">D</TableHead>
                  <TableHead className="font-semibold">Observación</TableHead>
                  <TableHead className="font-semibold">Corrección</TableHead>
                </TableRow>
              </TableHeader>

              <TableBody>
                {registrosVisibles.length === 0 && (
                  <TableRow>
                    <TableCell
                      colSpan={columnCount}
                      className="text-center py-6 text-muted-foreground"
                    >
                      No hay items para los filtros seleccionados.
                    </TableCell>
                  </TableRow>
                )}

                {registrosVisibles.map((r, i) => (
                  <TableRow
                    key={i}
                    className="hover:bg-muted/30 transition-colors"
                  >
                    {mostrarColumnaArea && (
                      <TableCell className="text-muted-foreground text-sm">
                        {r.area}
                      </TableCell>
                    )}
                    {mostrarColumnaSubarea && (
                      <TableCell className="text-muted-foreground text-sm">
                        {r.subarea}
                      </TableCell>
                    )}
                    <TableCell className="font-medium">{r.nombre}</TableCell>
                    {mostrarColumnaTurno && (
                      <TableCell className="text-center">{r.turno}</TableCell>
                    )}

                    {['orden', 'limpieza', 'desinfeccion'].map((k) => (
                      <TableCell key={k} className="text-center">
                        <input
                          type="checkbox"
                          checked={r[k]}
                          onChange={(e) => update(i, k, e.target.checked)}
                          className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                        />
                      </TableCell>
                    ))}

                    <TableCell className="min-w-[120px]">
                      {!r.orden || !r.limpieza || !r.desinfeccion ? (
                        <Input
                          placeholder="Escribir observación"
                          value={r.observacion}
                          onChange={(e) =>
                            update(i, 'observacion', e.target.value)
                          }
                          className="h-8 text-xs"
                        />
                      ) : (
                        <span className="text-muted-foreground text-xs">-</span>
                      )}
                    </TableCell>

                    <TableCell className="min-w-[120px]">
                      {!r.orden || !r.limpieza || !r.desinfeccion ? (
                        <Input
                          placeholder="Escribir corrección"
                          value={r.correcion}
                          onChange={(e) =>
                            update(i, 'correcion', e.target.value)
                          }
                          className="h-8 text-xs"
                        />
                      ) : (
                        <span className="text-muted-foreground text-xs">-</span>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  )
}