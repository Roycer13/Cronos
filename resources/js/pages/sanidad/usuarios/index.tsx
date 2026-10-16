import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import AppLayout from '@/layouts/app-layout';
import { Head, Link, router } from '@inertiajs/react';
import { Plus, Search, Eye, Edit } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useState } from 'react';
import { route } from 'ziggy-js';

export default function Index({ usuarios }) {
    const { hasPermission } = useAuth();
    const [search, setSearch] = useState('');

    const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
        setSearch(e.target.value);
        // Aquí podrías implementar búsqueda en tiempo real con useAdvancedFilters
    };

    return (
        <AppLayout breadcrumbs={[{ title: 'Usuarios', href: '/sanidad/usuarios' }]}>
            <Head title="Usuarios" />
            <div className="p-4">
                <div className="flex justify-between items-center mb-4">
                    <div className="relative w-72">
                        <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                        <Input
                            placeholder="Buscar por nombre o código..."
                            value={search}
                            onChange={handleSearch}
                            className="pl-8"
                        />
                    </div>
                    {hasPermission('c_sanidadUsuario') && (
                        <Link href={route('sanidad.usuarios.create')}>
                            <Button>
                                <Plus className="mr-2 h-4 w-4" />
                                Nuevo Usuario
                            </Button>
                        </Link>
                    )}
                </div>

                <div className="rounded-md border">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Código</TableHead>
                                <TableHead>Nombre</TableHead>
                                <TableHead>Apellido</TableHead>
                                <TableHead>Email</TableHead>
                                <TableHead>Teléfono</TableHead>
                                <TableHead>Estado</TableHead>
                                <TableHead className="text-right">Acciones</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {usuarios.data.map((user) => (
                                <TableRow key={user.id}>
                                    <TableCell className="font-mono">{user.codigo}</TableCell>
                                    <TableCell>{user.name}</TableCell>
                                    <TableCell>{user.apellido}</TableCell>
                                    <TableCell>{user.email}</TableCell>
                                    <TableCell>{user.telefono}</TableCell>
                                    <TableCell>
                                        {user.estado ? (
                                            <span className="text-green-600">Activo</span>
                                        ) : (
                                            <span className="text-red-600">Inactivo</span>
                                        )}
                                    </TableCell>
                                    <TableCell className="text-right space-x-2">
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => router.visit(route('sanidad.usuarios.show', user.id))}
                                        >
                                            <Eye className="h-4 w-4" />
                                        </Button>
                                        {hasPermission('u_sanidadUsuario') && (
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                onClick={() => router.visit(route('sanidad.usuarios.edit', user.id))}
                                            >
                                                <Edit className="h-4 w-4" />
                                            </Button>
                                        )}
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </div>

                {/* Paginación (similar a otros índices) */}
            </div>
        </AppLayout>
    );
}