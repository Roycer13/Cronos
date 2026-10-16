import AppLayout from '@/layouts/app-layout'
import { Head } from '@inertiajs/react'
import { Button } from '@/components/ui/button'
import { Toast } from '@/components/ui/toast'
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table'
import { route } from 'ziggy-js'
import axios from 'axios'
import { useEffect, useState } from 'react'
import type { BreadcrumbItem } from '@/types'

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Consola SQL', href: '#' },
]

type Row = Record<string, any>
type DbTable = string

export default function Index() {

    // -------------------------
    // Consola SQL
    // -------------------------
    const [sql, setSql] = useState('')
    const [rows, setRows] = useState<Row[]>([])
    const [columns, setColumns] = useState<string[]>([])
    const [message, setMessage] = useState<string | null>(null)
    const [loading, setLoading] = useState(false)

    // -------------------------
    // Explorador de tablas
    // -------------------------
    const [tables, setTables] = useState<DbTable[]>([])
    const [schema, setSchema] = useState('dbo')
    const [table, setTable] = useState('')
    const [filter, setFilter] = useState('')
    const [idFilter, setIdFilter] = useState('')

    const [editableTable, setEditableTable] = useState<string | null>(null)
    const [editing, setEditing] = useState<{
        rowIndex: number
        column: string
    } | null>(null)

    const [editValue, setEditValue] = useState('')

    // -------------------------
    // cargar tablas
    // -------------------------
    useEffect(() => {
        axios.get(route('admin.sql.tablas'))
            .then(r => setTables(r.data))
    }, [])

    // -------------------------
    // ejecutar SQL libre
    // -------------------------
    const execute = async () => {
        if (!sql.trim()) return

        setLoading(true)
        setMessage(null)
        setRows([])
        setColumns([])

        try {
            const res = await axios.post(
                route('admin.sql.execute'),
                { sql }
            )

            setEditableTable(res.data.editable_table ?? null)

            if (res.data.type === 'select') {
                const data = res.data.rows ?? []
                setRows(data)
                if (data.length > 0) {
                    setColumns(Object.keys(data[0]))
                }
                setMessage(`Registros obtenidos: ${data.length}`)
            }

            if (res.data.type === 'statement') {
                setMessage(`Filas afectadas: ${res.data.affected}`)
            }

        } catch (e: any) {
            setMessage(
                e?.response?.data?.message ?? 'Error ejecutando la consulta'
            )
        } finally {
            setLoading(false)
        }
    }

    // -------------------------
    // cargar datos de tabla
    // -------------------------
    const loadTable = async () => {
        if (!table) return

        setLoading(true)
        setMessage(null)
        setRows([])
        setColumns([])

        try {
            const res = await axios.get(
                route('admin.sql.table-data'),
                {
                    params: {
                        tabla: `${schema}.${table}`,
                        page: 1,
                        per_page: 50,
                        search: filter,
                        id: idFilter || null,
                    }
                }
            )

            const payload = res.data
            const data = Array.isArray(payload.data) ? payload.data : []

            setRows(data)
            if (data.length > 0) {
                setColumns(Object.keys(data[0]))
            }
            setMessage(`Filas cargadas: ${data.length}`)

        } catch (e: any) {
            setMessage(
                e?.response?.data?.message ?? 'Error cargando la tabla'
            )
        } finally {
            setLoading(false)
        }
    }

    // Helper para determinar el color del mensaje
    const messageColor = message?.toLowerCase().includes('error') ? 'text-red-600' : 'text-green-600'

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Consola SQL" />

            <div className="px-2 sm:px-6 py-4 space-y-6 max-w-full">

                <Toast />

                {/* =========================
                    Header con título y acción principal
                ========================= */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                    <div>
                        <h1 className="text-2xl font-semibold tracking-tight">Consola SQL Server</h1>
                        <p className="text-sm text-muted-foreground">
                            Consola y explorador dinámico de base de datos
                        </p>
                    </div>

                    <Button
                        size="sm"
                        onClick={execute}
                        disabled={loading}
                        className="gap-2 shadow-sm"
                    >
                        {loading ? (
                            <>
                                <span className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                                Ejecutando...
                            </>
                        ) : (
                            'Ejecutar SQL'
                        )}
                    </Button>
                </div>

                {/* =========================
                    Explorador de tablas
                ========================= */}
                <div className="bg-card rounded-xl border border-border shadow-sm p-4 space-y-3">
                    <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wider">
                        Explorador de tablas
                    </h3>

                    <div className="flex flex-wrap gap-3 items-end">
                        <div className="space-y-1 min-w-[220px]">
                            <label className="text-xs font-medium text-muted-foreground">Tabla</label>
                            <select
                                className="w-full rounded-md border border-input bg-background px-3 py-1.5 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                                value={table ? `${schema}.${table}` : ''}
                                onChange={(e) => {
                                    const value = e.target.value
                                    if (!value) {
                                        setSchema('dbo')
                                        setTable('')
                                        return
                                    }
                                    const [s, t] = value.split('.')
                                    setSchema(s)
                                    setTable(t)
                                }}
                            >
                                <option value="">Seleccione tabla</option>
                                {tables.map(t => (
                                    <option key={t} value={t}>{t}</option>
                                ))}
                            </select>
                        </div>

                        <div className="space-y-1">
                            <label className="text-xs font-medium text-muted-foreground">Filtro texto</label>
                            <input
                                className="rounded-md border border-input bg-background px-3 py-1.5 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                                value={filter}
                                onChange={e => setFilter(e.target.value)}
                                placeholder="buscar..."
                            />
                        </div>

                        <div className="space-y-1">
                            <label className="text-xs font-medium text-muted-foreground">ID</label>
                            <input
                                className="w-28 rounded-md border border-input bg-background px-3 py-1.5 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                                value={idFilter}
                                onChange={e => setIdFilter(e.target.value)}
                                placeholder="id"
                            />
                        </div>

                        <Button
                            size="sm"
                            onClick={loadTable}
                            disabled={loading || !table}
                            className="shadow-sm"
                        >
                            {loading ? 'Cargando...' : 'Ver tabla'}
                        </Button>
                    </div>
                </div>

                {/* =========================
                    Editor SQL
                ========================= */}
                <div className="bg-card rounded-xl border border-border shadow-sm p-4">
                    <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wider mb-2">
                        Consulta SQL
                    </h3>
                    <textarea
                        className="w-full min-h-[160px] resize-y rounded-lg border border-input bg-background p-3 font-mono text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                        placeholder="Escriba su consulta SQL aquí..."
                        value={sql}
                        onChange={(e) => setSql(e.target.value)}
                    />
                </div>

                {/* =========================
                    Mensaje de resultado
                ========================= */}
                {message && (
                    <div className={`text-sm px-1 font-medium ${messageColor}`}>
                        {message}
                    </div>
                )}

                {/* =========================
                    Resultados en tabla
                ========================= */}
                {columns.length > 0 && (
                    <div className="bg-card rounded-xl border border-border shadow-sm overflow-hidden">
                        <div className="overflow-x-auto">
                            <Table>
                                <TableHeader>
                                    <TableRow className="bg-muted/50 hover:bg-muted/50">
                                        {columns.map(col => (
                                            <TableHead key={col} className="font-semibold">
                                                {col}
                                            </TableHead>
                                        ))}
                                    </TableRow>
                                </TableHeader>

                                <TableBody>
                                    {rows.length === 0 ? (
                                        <TableRow>
                                            <TableCell
                                                colSpan={Math.max(columns.length, 1)}
                                                className="text-center py-10 text-muted-foreground"
                                            >
                                                No hay resultados para mostrar
                                            </TableCell>
                                        </TableRow>
                                    ) : (
                                        rows.map((row, i) => (
                                            <TableRow
                                                key={i}
                                                className="hover:bg-muted/50 even:bg-muted/20 transition-colors"
                                            >
                                                {columns.map(col => (
                                                    <TableCell
                                                        key={col}
                                                        className="whitespace-nowrap px-4 py-2 relative group"
                                                        onDoubleClick={() => {
                                                            if (!editableTable) return
                                                            if (!('id' in row)) return
                                                            setEditing({ rowIndex: i, column: col })
                                                            setEditValue(row[col] ?? '')
                                                        }}
                                                    >
                                                        {editing &&
                                                         editing.rowIndex === i &&
                                                         editing.column === col ? (
                                                            <input
                                                                autoFocus
                                                                className="w-full rounded border border-ring bg-background px-2 py-1 text-sm focus:outline-none focus:ring-1 focus:ring-ring"
                                                                value={editValue ?? ''}
                                                                onChange={e => setEditValue(e.target.value)}
                                                                onBlur={async () => {
                                                                    const id = row.id
                                                                    try {
                                                                        await axios.post(
                                                                            route('admin.sql.update-cell'),
                                                                            {
                                                                                tabla: editableTable,
                                                                                id,
                                                                                column: col,
                                                                                value: editValue
                                                                            }
                                                                        )
                                                                        const copy = [...rows]
                                                                        copy[i] = { ...copy[i], [col]: editValue }
                                                                        setRows(copy)
                                                                    } catch (e) {
                                                                        alert('Error al actualizar')
                                                                    }
                                                                    setEditing(null)
                                                                }}
                                                                onKeyDown={e => {
                                                                    if (e.key === 'Enter') {
                                                                        (e.target as HTMLInputElement).blur()
                                                                    }
                                                                    if (e.key === 'Escape') {
                                                                        setEditing(null)
                                                                    }
                                                                }}
                                                            />
                                                        ) : (
                                                            <div className="flex items-center justify-between gap-2">
                                                                <span>
                                                                    {row[col] === null || row[col] === undefined
                                                                        ? ''
                                                                        : String(row[col])}
                                                                </span>
                                                                {editableTable && 'id' in row && (
                                                                    <span className="invisible group-hover:visible text-muted-foreground text-xs">
                                                                        ✎
                                                                    </span>
                                                                )}
                                                            </div>
                                                        )}
                                                    </TableCell>
                                                ))}
                                            </TableRow>
                                        ))
                                    )}
                                </TableBody>
                            </Table>
                        </div>
                    </div>
                )}
            </div>
        </AppLayout>
    )
}
