import AppLayout from '@/layouts/app-layout';
import { Head, router, usePage, Link } from '@inertiajs/react';
import { useAuth } from '@/hooks/useAuth';
import { useEffect, useState } from 'react';
import { route } from 'ziggy-js';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
    Table, TableBody, TableCell, TableHead, TableHeader, TableRow
} from '@/components/ui/table';
import { Card, CardContent } from '@/components/ui/card';

import { Plus, Search, Trash2, Edit } from 'lucide-react';

interface Area {
    id: number;
    nombre: string;
    descripcion?: string;
    ubicacion?: { id: number; nombre: string };
}

interface PageProps {
    areas: any;
    filtros: { search?: string };
}

export default function Index() {
    const { areas, filtros } = usePage<PageProps>().props;
    const { hasPermission } = useAuth();

    const [search, setSearch] = useState(filtros.search || '');

    useEffect(() => {
        const delay = setTimeout(() => {
            router.get(route('old-areas.index'), { search }, {
                preserveState: true,
                replace: true
            });
        }, 300);

        return () => clearTimeout(delay);
    }, [search]);

    const handleDelete = (id: number) => {
        if (confirm('¿Eliminar área?')) {
            router.delete(route('old-areas.destroy', id));
        }
    };

    return (
        <AppLayout>
            <Head title="Áreas" />

            <div className="p-4 space-y-4">

                {/* HEADER */}
                <div className="flex justify-between items-center">
                    <div className="relative w-64">
                        <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                        <Input
                            placeholder="Buscar..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="pl-8"
                        />
                    </div>

                    {hasPermission('c_oldAreas') && (
                        <Button asChild>
                            <Link href={route('old-areas.create')}>
                                <Plus className="h-4 w-4 mr-2" />
                                Nueva Área
                            </Link>
                        </Button>
                    )}
                </div>

                {/* TABLA */}
                <Card>
                    <CardContent className="p-0">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Nombre</TableHead>
                                    <TableHead>Ubicación</TableHead>
                                    <TableHead>Descripción</TableHead>
                                    <TableHead></TableHead>
                                </TableRow>
                            </TableHeader>

                            <TableBody>
                                {areas.data.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={4} className="text-center py-6">
                                            Sin datos
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    areas.data.map((area: Area) => (
                                        <TableRow key={area.id}>
                                            <TableCell>{area.nombre}</TableCell>
                                            <TableCell>{area.ubicacion?.nombre}</TableCell>
                                            <TableCell>{area.descripcion}</TableCell>

                                            <TableCell className="flex gap-2">
                                                {hasPermission('u_oldAreas') && (
                                                    <Button size="sm" variant="outline" asChild>
                                                        <Link href={route('old-areas.edit', area.id)}>
                                                            <Edit className="h-4 w-4" />
                                                        </Link>
                                                    </Button>
                                                )}

                                                {hasPermission('d_oldAreas') && (
                                                    <Button
                                                        size="sm"
                                                        variant="destructive"
                                                        onClick={() => handleDelete(area.id)}
                                                    >
                                                        <Trash2 className="h-4 w-4" />
                                                    </Button>
                                                )}
                                            </TableCell>
                                        </TableRow>
                                    ))
                                )}
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>

            </div>
        </AppLayout>
    );
}