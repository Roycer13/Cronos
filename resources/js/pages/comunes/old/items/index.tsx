import AppLayout from '@/layouts/app-layout';
import { Head, router, usePage, Link } from '@inertiajs/react';
import { useEffect, useState } from 'react';
import { route } from 'ziggy-js';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import FilterSelect from '@/components/ui/filter-select';
import {
    Table, TableBody, TableCell, TableHead, TableHeader, TableRow
} from '@/components/ui/table';

import { Plus, Edit, Trash2, BarChart } from 'lucide-react';

export default function Index() {
    const { items, subareas, areas, filtros } = usePage<any>().props;

    const [search, setSearch] = useState(filtros.search || '');
    const [subarea, setSubarea] = useState(filtros.subarea_id || 'all');
    const [area, setArea] = useState(filtros.area_id || 'all');

    useEffect(() => {
        const t = setTimeout(() => {
            router.get(route('old-items.index'), {
                search: search || undefined,
                subarea_id: subarea !== 'all' ? subarea : undefined,
                area_id: area !== 'all' ? area : undefined,
            }, { preserveState: true, replace: true });
        }, 300);

        return () => clearTimeout(t);
    }, [search, subarea, area]);

    return (
        <AppLayout>
            <Head title="Items" />

            <div className="p-4 space-y-4">

                {/* FILTROS */}
                <div className="flex justify-between flex-wrap gap-2">
                    <div className="flex gap-2 flex-wrap">

                        <Input
                            placeholder="Buscar item..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                        />

                        <FilterSelect
                            value={area}
                            onChange={setArea}
                            placeholder="Área"
                            options={areas.map((a: any) => ({
                                value: a.id.toString(),
                                label: a.nombre
                            }))}
                        />

                        <FilterSelect
                            value={subarea}
                            onChange={setSubarea}
                            placeholder="Subárea"
                            options={subareas.map((s: any) => ({
                                value: s.id.toString(),
                                label: s.nombre
                            }))}
                        />

                    </div>

                    <div className="flex gap-2">
                        <Button asChild>
                            <Link href={route('old-items.create')}>
                                <Plus className="h-4 w-4 mr-2" />
                                Nuevo
                            </Link>
                        </Button>

                        <Button asChild variant="outline">
                            <Link href={route('old-items.reporte')}>
                                <BarChart className="h-4 w-4 mr-2" />
                                Reporte
                            </Link>
                        </Button>
                    </div>
                </div>

                {/* TABLA */}
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Item</TableHead>
                            <TableHead>Área</TableHead>
                            <TableHead>Subárea</TableHead>
                            <TableHead></TableHead>
                        </TableRow>
                    </TableHeader>

                    <TableBody>
                        {items.data.map((i: any) => (
                            <TableRow key={i.id}>
                                <TableCell>{i.nombre}</TableCell>
                                <TableCell>{i.subarea?.area?.nombre}</TableCell>
                                <TableCell>{i.subarea?.nombre}</TableCell>

                                <TableCell className="flex gap-2">
                                    <Link href={route('old-items.edit', i.id)}>
                                        <Edit className="h-4 w-4" />
                                    </Link>

                                    <button
                                        onClick={() => {
                                            if (confirm('Eliminar?')) {
                                                router.delete(route('old-items.destroy', i.id));
                                            }
                                        }}
                                    >
                                        <Trash2 className="h-4 w-4 text-red-500" />
                                    </button>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>

            </div>
        </AppLayout>
    );
}