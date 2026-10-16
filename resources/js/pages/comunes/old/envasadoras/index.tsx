import AppLayout from '@/layouts/app-layout'
import { Head, Link, usePage, router } from '@inertiajs/react'
import { Button } from '@/components/ui/button'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Plus, Search, MoreHorizontal, Eye, Edit, Trash2 } from 'lucide-react'
import TablePagination from '@/components/ui/table-pagination'
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { type BreadcrumbItem } from '@/types'
import { route } from 'ziggy-js'

const breadcrumbs: BreadcrumbItem[] = [
    { title: "Envasadoras", href: "/old-envasadoras" },
]

export default function Index() {

    const { registros } = usePage<any>().props

    const handleEdit = (id: number) => {
        // router.visit(route('old-envasadoras.edit', id));
    };

    const handleDelete = (id: number) => {
        if (confirm('¿Eliminar este registro?')) {
            // router.delete(route('old-envasadoras.destroy', id), {
            //     preserveScroll: true,
            // });
        }
    };

    const handleView = (id: number) => {
        // router.visit(route('old-envasadoras.show', id));
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Envasadoras" />

            <div className="px-2 sm:px-6 py-2 space-y-4">

                {/* Header */}
                <div className="flex items-center justify-between">
                    <h1 className="text-xl font-semibold">Registros de Envasadoras</h1>

                    <div className="flex items-center gap-2">
                        <Button asChild size="sm">
                            <Link href={route('old-envasadoras.create')}>
                                <Plus className="w-4 h-4 mr-2" />
                                <p className='hidden md:block'>Nuevo Registro</p>
                            </Link>
                        </Button>
                    </div>
                </div>

                {/* Tabla */}
                <div className="bg-background rounded-lg border border-border shadow-sm overflow-hidden">
                    <div className="overflow-x-auto">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Fecha</TableHead>
                                    <TableHead>Tipo de Máquina</TableHead>
                                    <TableHead>ORP</TableHead>
                                    <TableHead>Maquinista</TableHead>
                                    <TableHead className="text-right">Producción</TableHead>
                                    <TableHead className="text-right">Merma</TableHead>
                                    <TableHead></TableHead>
                                </TableRow>
                            </TableHeader>

                            <TableBody>
                                {(!registros || !registros.data || registros.data.length === 0) ? (
                                    <TableRow>
                                        <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                                            <div className="flex flex-col items-center justify-center">
                                                <Search className="h-12 w-12 text-muted-foreground/50 mb-3" />
                                                <p className="text-lg font-medium text-foreground mb-1">
                                                    No se encontraron registros
                                                </p>
                                                <p className="text-sm text-muted-foreground">
                                                    No hay envasadoras registradas en el sistema
                                                </p>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    registros.data.map((r: any) => (
                                        <TableRow key={r.id} className="hover:bg-muted/50">
                                            
                                            <TableCell className="font-medium">
                                                {r.fecha}
                                            </TableCell>
                                            
                                            <TableCell>
                                                <Badge variant="outline" className={`
                                                    ${r.tipo_maquina === 'cabezal' ? 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-900/30 dark:text-blue-400 dark:border-blue-800' : ''}
                                                    ${r.tipo_maquina === 'vasos' ? 'bg-orange-50 text-orange-700 border-orange-200 dark:bg-orange-900/30 dark:text-orange-400 dark:border-orange-800' : ''}
                                                    ${r.tipo_maquina === 'botella' ? 'bg-green-50 text-green-700 border-green-200 dark:bg-green-900/30 dark:text-green-400 dark:border-green-800' : ''}
                                                `}>
                                                    {(r.tipo_maquina || '').toUpperCase()}
                                                </Badge>
                                            </TableCell>
                                            
                                            <TableCell>
                                                <span className="font-mono text-sm font-medium">
                                                    {r.orp?.codigo || '-'}
                                                </span>
                                            </TableCell>
                                            
                                            <TableCell>
                                                {r.maquinista?.name || '-'}
                                            </TableCell>
                                            
                                            <TableCell className="text-right font-medium">
                                                {r.valor_produccion ? `${r.valor_produccion}` : '-'}
                                            </TableCell>
                                            
                                            <TableCell className="text-right text-muted-foreground">
                                                {r.merma || '-'}
                                            </TableCell>

                                            <TableCell>
                                                <DropdownMenu>
                                                    <DropdownMenuTrigger asChild>
                                                        <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                                                            <MoreHorizontal className="h-4 w-4" />
                                                            <span className="sr-only">Abrir menú</span>
                                                        </Button>
                                                    </DropdownMenuTrigger>
                                                    <DropdownMenuContent align="end" className="w-48">
                                                        <DropdownMenuItem onClick={() => handleView(r.id)}>
                                                            <Eye className="mr-2 h-4 w-4" />
                                                            <span>Ver detalles</span>
                                                        </DropdownMenuItem>
                                                        <DropdownMenuItem onClick={() => handleEdit(r.id)}>
                                                            <Edit className="mr-2 h-4 w-4" />
                                                            <span>Editar registro</span>
                                                        </DropdownMenuItem>
                                                        <DropdownMenuItem 
                                                            onClick={() => handleDelete(r.id)}
                                                            className="text-destructive focus:text-destructive"
                                                        >
                                                            <Trash2 className="mr-2 h-4 w-4" />
                                                            <span>Eliminar registro</span>
                                                        </DropdownMenuItem>
                                                    </DropdownMenuContent>
                                                </DropdownMenu>
                                            </TableCell>

                                        </TableRow>
                                    ))
                                )}
                            </TableBody>
                        </Table>
                    </div>

                    {/* Paginación */}
                    {registros?.data?.length > 0 && (
                        <div className="border-t border-border px-4 py-3">
                            <TablePagination
                                pagination={registros}
                                onPageChange={(page) =>
                                    router.get(
                                        route('old-envasadoras.index'),
                                        { page },
                                        { preserveState: true, replace: true }
                                    )
                                }
                            />
                        </div>
                    )}
                </div>

                {/* Info rápida */}
                <div className='flex justify-between'>
                    <p className="text-sm text-muted-foreground mt-1">
                        {registros?.total || 0} registros en total
                    </p>
                    <div>
                        {registros?.data?.length > 0 && (
                            <div className="text-center">
                                <p className="text-sm text-muted-foreground">
                                    Mostrando <span className="font-medium text-foreground">{registros.data.length}</span> de{' '}
                                    <span className="font-medium text-foreground">{registros.total}</span> registros
                                </p>
                            </div>
                        )}
                    </div>
                </div>

            </div>
        </AppLayout>
    )
}