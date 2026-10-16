import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import AppLayout from '@/layouts/app-layout';
import { Head, Link, usePage } from '@inertiajs/react';
import { Pencil, Waves } from 'lucide-react';
import { route } from 'ziggy-js';

const breadcrumbs = [{ title: 'Agua Físico', href: '/planta-lacteos/externo/agua-fisico' }];

interface AguaFisico {
  id: number;
  estado: string;
  detalle: {
    subcodigo: string;
    producto_terminado: { nombre: string } | null;
    personal_ambiente_superficie: string | null;
  };
}

interface PageProps {
  analisis: AguaFisico[];
  flash?: { success?: string; error?: string };
}

export default function Index() {
  const { props } = usePage<PageProps>();
  const { analisis, flash } = props;

  return (
    <AppLayout breadcrumbs={breadcrumbs}>
      <Head title="Agua Físico" />
      <div className="px-4 py-4 space-y-4">
        <h1 className="text-2xl font-bold">Análisis Físico de Agua</h1>
        <div className="rounded-lg border overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Subcódigo</TableHead>
                <TableHead>Muestra</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead className="w-20">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {analisis.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4} className="text-center py-8">
                    <Waves className="mx-auto h-8 w-8 mb-2 opacity-50" />
                    No hay análisis pendientes.
                  </TableCell>
                </TableRow>
              ) : (
                analisis.map((a) => (
                  <TableRow key={a.id}>
                    <TableCell className="font-mono">{a.detalle.subcodigo}</TableCell>
                    <TableCell>
                      {a.detalle.producto_terminado?.nombre || a.detalle.personal_ambiente_superficie || 'N/A'}
                    </TableCell>
                    <TableCell>{a.estado}</TableCell>
                    <TableCell>
                      <Link href={route('externo.agua-fisico.edit', a.id)}>
                        <Button variant="ghost" size="icon">
                          <Pencil className="h-4 w-4" />
                        </Button>
                      </Link>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </div>
    </AppLayout>
  );
}