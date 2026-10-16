import AppLayout from '@/layouts/app-layout'
import { Head, router, usePage } from '@inertiajs/react'
import { useEffect, useState } from 'react'
import { route } from 'ziggy-js'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import FormSelect from '@/components/ui/form-select'
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

export default function Reporte() {
  const {
    resultado = [],
    totales = {},
    porcentaje = 0,
    filtros = {},
    areas = [],
    subareas = [],
    fechaDesde, // ya viene como string 'YYYY-MM-DD' del backend
    fechaHasta,
  } = usePage<any>().props

  const [areaId, setAreaId] = useState(filtros.area_id || '')
  const [subareaId, setSubareaId] = useState(filtros.subarea_id || '')
  const [turno, setTurno] = useState(filtros.turno || '')
  const [fDesde, setFDesde] = useState(
    filtros.fechas?.fecha_desde || fechaDesde || new Date().toISOString().slice(0, 10)
  )
  const [fHasta, setFHasta] = useState(
    filtros.fechas?.fecha_hasta || fechaHasta || new Date().toISOString().slice(0, 10)
  )

  // Subáreas filtradas por área
  const subareasFiltradas = subareas.filter(
    (s: any) => !areaId || s.old_area_id?.toString() === areaId
  )

  // Limpiar subárea al cambiar de área
  useEffect(() => {
    setSubareaId('')
  }, [areaId])

  // Función que aplica los filtros (sin botón, se llama en el efecto)
  const aplicarFiltros = () => {
    const params: any = {}
    if (fDesde) params.fecha_desde = fDesde
    if (fHasta) params.fecha_hasta = fHasta
    if (areaId) params.area_id = areaId
    if (subareaId) params.subarea_id = subareaId
    if (turno) params.turno = turno

    router.get(route('old-registros.reporte'), params, {
      preserveState: true,
      replace: true,
    })
  }

  // Debounce: aplicar filtros automáticamente cuando cambian
  useEffect(() => {
    const timer = setTimeout(() => {
      aplicarFiltros()
    }, 300) // 300ms de retardo

    return () => clearTimeout(timer)
  }, [fDesde, fHasta, areaId, subareaId, turno])

  // Limpiar todo (volver a hoy)
  const limpiar = () => {
    const hoy = new Date().toISOString().slice(0, 10)
    setFDesde(hoy)
    setFHasta(hoy)
    setAreaId('')
    setSubareaId('')
    setTurno('')
  }

  // Helper para el badge de O/L/D
  const estadoBadge = (esperado: boolean, realizado: boolean) => {
    if (!esperado) return <span className="text-muted-foreground">-</span>
    return realizado ? (
      <Badge variant="success" className="gap-1">✓</Badge>
    ) : (
      <Badge variant="destructive" className="gap-1">✗</Badge>
    )
  }

  return (
    <AppLayout>
      <Head title="Reporte de Cumplimiento" />

      <div className="max-w-7xl mx-auto p-4 md:p-6 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold tracking-tight">
              Reporte de Cumplimiento
            </h1>
            <p className="text-sm text-muted-foreground mt-1">
              Actividades esperadas vs realizadas. Cambia los filtros y se actualiza automáticamente.
            </p>
          </div>
          <Button variant="outline" onClick={limpiar}>
            Limpiar filtros
          </Button>
        </div>

        {/* Filtros */}
        <Card className="shadow-sm">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center gap-2">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
              </svg>
              Filtros del Reporte
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-medium">Desde</label>
                <Input
                  type="date"
                  value={fDesde}
                  onChange={(e) => setFDesde(e.target.value)}
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-medium">Hasta</label>
                <Input
                  type="date"
                  value={fHasta}
                  onChange={(e) => setFHasta(e.target.value)}
                />
              </div>
              <FormSelect
                label="Área"
                value={areaId}
                onChange={setAreaId}
                options={[
                  { value: '', label: 'Todas las áreas' },
                  ...areas.map((a: any) => ({ value: a.id.toString(), label: a.nombre })),
                ]}
              />
              <FormSelect
                label="Subárea"
                value={subareaId}
                onChange={setSubareaId}
                placeholder={areaId ? 'Selecciona subárea' : 'Primero selecciona área'}
                options={subareasFiltradas.map((s: any) => ({ value: s.id.toString(), label: s.nombre }))}
                disabled={!areaId}
              />
              <FormSelect
                label="Turno"
                value={turno}
                onChange={setTurno}
                options={[
                  { value: '', label: 'Todos' },
                  { value: '1', label: 'Turno 1' },
                  { value: '2', label: 'Turno 2' },
                  { value: '3', label: 'Turno 3' },
                ]}
              />
            </div>
          </CardContent>
        </Card>

        {/* Resumen */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card className="shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Cumplimiento</CardTitle>
              <Badge variant={porcentaje >= 80 ? 'success' : 'destructive'}>
                {porcentaje}%
              </Badge>
            </CardHeader>
            <CardContent>
              <p className="text-xs text-muted-foreground">
                {totales.actividades_cumplidas} / {totales.actividades_esperadas} actividades
              </p>
            </CardContent>
          </Card>
          <Card className="shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Incumplidas</CardTitle>
              <span className="text-2xl font-bold text-red-500">
                {totales.actividades_incumplidas}
              </span>
            </CardHeader>
          </Card>
        </div>

        {/* Tabla de resultados */}
        <Card className="shadow-sm overflow-hidden">
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/50">
                    <TableHead className="font-semibold">Item</TableHead>
                    <TableHead className="font-semibold">Área</TableHead>
                    <TableHead className="font-semibold">Subárea</TableHead>
                    <TableHead className="font-semibold">Fecha</TableHead>
                    <TableHead className="font-semibold">Turno</TableHead>
                    <TableHead className="font-semibold text-center">O</TableHead>
                    <TableHead className="font-semibold text-center">L</TableHead>
                    <TableHead className="font-semibold text-center">D</TableHead>
                    <TableHead className="font-semibold">Estado</TableHead>
                    <TableHead className="font-semibold">Observación</TableHead>
                  </TableRow>
                </TableHeader>

                <TableBody>
                  {resultado.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={10} className="text-center py-8 text-muted-foreground">
                        No se encontraron datos con los filtros actuales.
                      </TableCell>
                    </TableRow>
                  ) : (
                    resultado.map((row: any, idx: number) => (
                      <TableRow key={idx} className="hover:bg-muted/30 transition-colors">
                        <TableCell className="font-medium">{row.item}</TableCell>
                        <TableCell className="text-muted-foreground">{row.area}</TableCell>
                        <TableCell className="text-muted-foreground">{row.subarea}</TableCell>
                        <TableCell className="whitespace-nowrap">{row.dia}</TableCell>
                        <TableCell>{row.turno}</TableCell>
                        <TableCell className="text-center">
                          {estadoBadge(row.esperado.orden, row.realizado.orden)}
                        </TableCell>
                        <TableCell className="text-center">
                          {estadoBadge(row.esperado.limpieza, row.realizado.limpieza)}
                        </TableCell>
                        <TableCell className="text-center">
                          {estadoBadge(row.esperado.desinfeccion, row.realizado.desinfeccion)}
                        </TableCell>
                        <TableCell>
                          <Badge variant={row.estado === 'cumplido' ? 'success' : 'destructive'}>
                            {row.estado === 'cumplido' ? 'Cumplido' : 'Incumplido'}
                          </Badge>
                        </TableCell>
                        <TableCell className="max-w-[150px] truncate" title={row.observacion}>
                          {row.observacion || <span className="text-muted-foreground">-</span>}
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  )
}