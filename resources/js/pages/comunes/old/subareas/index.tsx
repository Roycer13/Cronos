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
import FilterSelect from '@/components/ui/filter-select';

import { Plus, Search, Trash2, Edit } from 'lucide-react';

interface Subarea {
    id: number;
    nombre: string;
    descripcion?: string;
    area?: { id: number; nombre: string };
}

interface PageProps {
    subareas: any;
    areas: { id: number; nombre: string }[];
    filtros: {
        search?: string;
        area_id?: string;
    };
}

export default function Index() {
    const { subareas, areas, filtros } = usePage<PageProps>().props;
    const { hasPermission } = useAuth();

    const [search, setSearch] = useState(filtros.search || '');
    const [areaFilter, setAreaFilter] = useState(filtros.area_id || 'all');

    useEffect(() => {
        const delay = setTimeout(() => {
            const params: any = {};

            if (search) params.search = search;
            if (areaFilter !== 'all') params.area_id = areaFilter;

            router.get(route('old-subareas.index'), params, {
                preserveState: true,
                replace: true
            });
        }, 300);

        return () => clearTimeout(delay);
    }, [search, areaFilter]);

    const handleDelete = (id: number) => {
        if (confirm('¿Eliminar subárea?')) {
            router.delete(route('old-subareas.destroy', id));
        }
    };

    return (
        <AppLayout>
            <Head title="Subáreas" />

            <div className="p-4 space-y-4">

                {/* HEADER */}
                <div className="flex flex-col md:flex-row gap-2 justify-between">
                    
                    <div className="flex gap-2 w-full md:w-auto">
                        <div className="relative w-full md:w-64">
                            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                            <Input
                                placeholder="Buscar..."
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                className="pl-8"
                            />
                        </div>

                        <FilterSelect
                            value={areaFilter}
                            onChange={setAreaFilter}
                            placeholder="Área"
                            allLabel="Todas"
                            options={areas.map(a => ({
                                value: a.id.toString(),
                                label: a.nombre
                            }))}
                        />
                    </div>

                    {hasPermission('c_oldSubareas') && (
                        <Button asChild>
                            <Link href={route('old-subareas.create')}>
                                <Plus className="h-4 w-4 mr-2" />
                                Nueva Subárea
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
                                    <TableHead>Área</TableHead>
                                    <TableHead>Descripción</TableHead>
                                    <TableHead></TableHead>
                                </TableRow>
                            </TableHeader>

                            <TableBody>
                                {subareas.data.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={4} className="text-center py-6">
                                            Sin datos
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    subareas.data.map((sub: Subarea) => (
                                        <TableRow key={sub.id}>
                                            <TableCell>{sub.nombre}</TableCell>
                                            <TableCell>{sub.area?.nombre}</TableCell>
                                            <TableCell>{sub.descripcion}</TableCell>

                                            <TableCell className="flex gap-2">
                                                {hasPermission('u_oldSubareas') && (
                                                    <Button size="sm" variant="outline" asChild>
                                                        <Link href={route('old-subareas.edit', sub.id)}>
                                                            <Edit className="h-4 w-4" />
                                                        </Link>
                                                    </Button>
                                                )}

                                                {hasPermission('d_oldSubareas') && (
                                                    <Button
                                                        size="sm"
                                                        variant="destructive"
                                                        onClick={() => handleDelete(sub.id)}
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