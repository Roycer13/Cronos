import AppLayout from '@/layouts/app-layout'
import { Head, usePage, Link, router } from '@inertiajs/react'
import { useEffect, useState } from 'react'
import { route } from 'ziggy-js'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import FilterSelect from '@/components/ui/filter-select'
import {
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
} from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import TablePagination from '@/components/ui/table-pagination'
import { Filter, X } from 'lucide-react'

export default function Index() {
  const { registros = { data: [], links: [] }, items = [], users = [], filtros = {} } = usePage<any>().props

  const [fechaDesde, setFechaDesde] = useState(filtros.fecha_desde || '')
  const [fechaHasta, setFechaHasta] = useState(filtros.fecha_hasta || '')
  const [itemId, setItemId] = useState(filtros.item_id ?? '')
  const [userId, setUserId] = useState(filtros.user_id ?? '')
  const [tipo, setTipo] = useState(filtros.tipo || '')
  const [showFilters, setShowFilters] = useState(false)

  const construirParams = (page = undefined) => {
    const params: any = {}
    if (fechaDesde) params.fecha_desde = fechaDesde
    if (fechaHasta) params.fecha_hasta = fechaHasta
    if (itemId) params.item_id = itemId
    if (userId) params.user_id = userId
    if (tipo) params.tipo = tipo
    if (page) params.page = page
    return params
  }

  const aplicarFiltros = () => {
    router.get(route('old-registros.index'), construirParams(), {
      preserveState: true,
      replace: true,
    })
  }

  useEffect(() => {
    const timer = setTimeout(() => {
      aplicarFiltros()
    }, 300)
    return () => clearTimeout(timer)
  }, [fechaDesde, fechaHasta, itemId, userId, tipo])

  const limpiarFiltros = () => {
    setFechaDesde('')
    setFechaHasta('')
    setItemId('')
    setUserId('')
    setTipo('')
    router.get(route('old-registros.index'), {}, { preserveState: true, replace: true })
  }

  const handlePageChange = (page: number) => {
    router.get(route('old-registros.index'), construirParams(page), {
      preserveState: true,
      preserveScroll: true,
    })
  }

  return (
    <AppLayout>
      <Head title="Registros" />

      <div className="max-w-7xl mx-auto p-4 md:p-6 space-y-6">
        {/* Encabezado */}
        <div className="flex flex-col gap-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold tracking-tight">
                Registros de Limpieza
              </h1>
              <p className="text-sm text-muted-foreground mt-1">
                Consulta el historial de tareas realizadas.
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              {/* <Button variant="outline" size="sm" asChild>
                <Link href={route('old-registros.reporte')}>Ver Reporte</Link>
              </Button> */}
              <Button variant="outline" size="sm" asChild>
                <Link href={route('old-registros.reporte-resumido')}>Reporte</Link>
              </Button>
              <Button size="sm" asChild>
                <Link href={route('old-registros.create')}>Nuevo</Link>
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowFilters(!showFilters)}
                className="inline-flex items-center gap-1"
              >
                <Filter className="h-4 w-4" />
                Filtros
                {showFilters ? <X className="h-4 w-4 ml-1" /> : null}
              </Button>
            </div>
          </div>
        </div>

        {/* Panel de filtros colapsable */}
        {showFilters && (
          <Card className="shadow-sm">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center gap-2">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
                </svg>
                Filtros
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-sm font-medium">Desde</label>
                  <Input
                    type="date"
                    value={fechaDesde}
                    onChange={(e) => setFechaDesde(e.target.value)}
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-sm font-medium">Hasta</label>
                  <Input
                    type="date"
                    value={fechaHasta}
                    onChange={(e) => setFechaHasta(e.target.value)}
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-sm font-medium">Item</label>
                  <FilterSelect
                    placeholder="Todos los items"
                    value={itemId}
                    onChange={setItemId}
                    options={[
                      { value: '', label: 'Todos los items' },
                      ...items.map((item: any) => ({
                        value: item.id?.toString() ?? '',
                        label: item.nombre ?? 'Sin nombre',
                      })),
                    ]}
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-sm font-medium">Usuario</label>
                  <FilterSelect
                    placeholder="Todos los usuarios"
                    value={userId}
                    onChange={setUserId}
                    options={[
                      { value: '', label: 'Todos los usuarios' },
                      ...users.map((u: any) => ({
                        value: u.id?.toString() ?? '',
                        label: u.name ?? 'Sin nombre',
                      })),
                    ]}
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-sm font-medium">Tipo</label>
                  <FilterSelect
                    placeholder="Todos los tipos"
                    value={tipo}
                    onChange={setTipo}
                    options={[
                      { value: '', label: 'Todos los tipos' },
                      { value: 'orden', label: 'Orden' },
                      { value: 'limpieza', label: 'Limpieza' },
                      { value: 'desinfeccion', label: 'Desinfección' },
                    ]}
                  />
                </div>
                <div className="flex items-end">
                  <Button variant="ghost" onClick={limpiarFiltros} className="w-full">
                    Limpiar filtros
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Tabla */}
        <Card className="shadow-sm overflow-hidden">
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/50">
                    <TableHead className="font-semibold">Item</TableHead>
                    <TableHead className="font-semibold hidden md:table-cell">Área</TableHead>
                    <TableHead className="font-semibold hidden md:table-cell">Subárea</TableHead>
                    <TableHead className="font-semibold">Usuario</TableHead>
                    <TableHead className="font-semibold hidden md:table-cell">Revisor</TableHead>
                    <TableHead className="font-semibold">Fecha</TableHead>
                    <TableHead className="font-semibold text-center">O</TableHead>
                    <TableHead className="font-semibold text-center">L</TableHead>
                    <TableHead className="font-semibold text-center">D</TableHead>
                    <TableHead className="font-semibold">Observación</TableHead>
                    <TableHead className="font-semibold">Corrección</TableHead>
                    <TableHead className="font-semibold text-right">Acciones</TableHead>
                  </TableRow>
                </TableHeader>

                <TableBody>
                  {registros.data.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={12} className="text-center py-8 text-muted-foreground">
                        No se encontraron registros con esos filtros.
                      </TableCell>
                    </TableRow>
                  ) : (
                    registros.data.map((r: any) => (
                      <TableRow key={r.id} className="hover:bg-muted/30 transition-colors">
                        <TableCell className="font-medium">{r.item?.nombre ?? '-'}</TableCell>
                        <TableCell className="text-muted-foreground hidden md:table-cell">
                          {r.item?.subarea?.area?.nombre ?? '-'}
                        </TableCell>
                        <TableCell className="text-muted-foreground hidden md:table-cell">
                          {r.item?.subarea?.nombre ?? '-'}
                        </TableCell>
                        <TableCell>{r.usuario?.name ?? '-'}</TableCell>
                        <TableCell className="hidden md:table-cell">{r.revisor?.name ?? '-'}</TableCell>
                        <TableCell className="whitespace-nowrap">
                          {r.tiempo_realizado
                            ? new Date(r.tiempo_realizado).toLocaleString('es-BO', {
                                day: '2-digit',
                                month: '2-digit',
                                year: 'numeric',
                                hour: '2-digit',
                                minute: '2-digit',
                              })
                            : '-'}
                        </TableCell>
                        <TableCell className="text-center">
                          {r.orden == 1 ? (
                            <Badge variant="default" className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">O</Badge>
                          ) : (
                            <span className="text-muted-foreground">-</span>
                          )}
                        </TableCell>
                        <TableCell className="text-center">
                          {r.limpieza == 1 ? (
                            <Badge variant="default" className="bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">L</Badge>
                          ) : (
                            <span className="text-muted-foreground">-</span>
                          )}
                        </TableCell>
                        <TableCell className="text-center">
                          {r.desinfeccion == 1 ? (
                            <Badge variant="default" className="bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200">D</Badge>
                          ) : (
                            <span className="text-muted-foreground">-</span>
                          )}
                        </TableCell>
                        <TableCell className="max-w-[150px] truncate" title={r.observacion}>
                          {r.observacion || <span className="text-muted-foreground">-</span>}
                        </TableCell>
                        <TableCell className="max-w-[150px] truncate" title={r.correcion}>
                          {r.correcion || <span className="text-muted-foreground">-</span>}
                        </TableCell>
                        <TableCell className="text-right">
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => {
                              if (confirm('¿Eliminar este registro?')) {
                                router.delete(route('old-registros.destroy', r.id), {
                                  preserveScroll: true,
                                })
                              }
                            }}
                          >
                            Eliminar
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>

        {/* Paginación con TablePagination */}
        {registros.data.length > 0 && (
          <div className="border-t border-border px-4 py-3">
            <TablePagination
              pagination={registros}
              onPageChange={handlePageChange}
            />
          </div>
        )}
      </div>
    </AppLayout>
  )
}