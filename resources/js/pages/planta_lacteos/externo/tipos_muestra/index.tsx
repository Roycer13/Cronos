// resources/js/Pages/externo/tipos-muestra/Index.tsx
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Toast } from '@/components/ui/toast';
import AppLayout from '@/layouts/app-layout';
import { Head, Link, router, usePage } from '@inertiajs/react';
import { Plus, Pencil, Trash2, Beaker } from 'lucide-react';
import { route } from 'ziggy-js';

const breadcrumbs = [{ title: 'Tipos de Muestra', href: '/planta-lacteos/externo/tipos-muestra' }];

interface TipoMuestra {
  id: number;
  nombre: string;
  norma_referencial: string;
  unidad: string;
  mesofilos: boolean;
  coliformes: boolean;
  mohos: boolean;
  min_mes: string | null;
  min_mes_exp: number | null;
  max_mes: string | null;
  max_mes_exp: number | null;
  min_colTot: string | null;
  min_colTot_exp: number | null;
  max_colTot: string | null;
  max_colTot_exp: number | null;
  min_mohLev: string | null;
  min_mohLev_exp: number | null;
  max_mohLev: string | null;
  max_mohLev_exp: number | null;
}

interface PageProps {
  tipos: TipoMuestra[];
  flash: { success?: string; error?: string };
}

const formatNotacion = (valor: string | null, exp: number | null) => {
  if (!valor) return '-';
  return exp !== null ? `${valor} × 10^${exp}` : valor;
};

const renderFlag = (value: boolean) => value ? 'Sí' : 'No';

export default function Index() {
  const { props } = usePage<PageProps>();
  const { tipos, flash } = props;

  const handleDelete = (id: number) => {
    if (confirm('¿Eliminar este tipo de muestra?')) {
      router.delete(route('externo.tipos-muestra.destroy', id), { preserveScroll: true });
    }
  };

  return (
    <AppLayout breadcrumbs={breadcrumbs}>
      <Head title="Tipos de Muestra" />
      <div className="space-y-4 px-4 py-4">
        <Toast />
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold">Tipos de Muestra</h1>
          <Link href={route('externo.tipos-muestra.create')}>
            <Button size="sm"><Plus className="h-4 w-4 mr-1" /> Nuevo</Button>
          </Link>
        </div>

        <div className="rounded-lg border overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nombre</TableHead>
                <TableHead>Norma</TableHead>
                <TableHead>Unidad</TableHead>
                <TableHead>Mesófilos</TableHead>
                <TableHead>Coliformes</TableHead>
                <TableHead>Mohos</TableHead>
                <TableHead>Aer. Mesófilos</TableHead>
                <TableHead>Coliformes Totales</TableHead>
                <TableHead>Mohos y Levaduras</TableHead>
                <TableHead className="w-20">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {tipos.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                    <Beaker className="mx-auto h-8 w-8 mb-2 opacity-50" />
                    No hay tipos de muestra registrados para esta planta.
                  </TableCell>
                </TableRow>
              ) : (
                tipos.map((t) => (
                  <TableRow key={t.id}>
                    <TableCell className="font-medium">{t.nombre}</TableCell>
                    <TableCell>{t.norma_referencial}</TableCell>
                    <TableCell>{t.unidad || '-'}</TableCell>
                    <TableCell>{renderFlag(t.mesofilos)}</TableCell>
                    <TableCell>{renderFlag(t.coliformes)}</TableCell>
                    <TableCell>{renderFlag(t.mohos)}</TableCell>
                    <TableCell>
                      {t.min_mes ? `${formatNotacion(t.min_mes, t.min_mes_exp)} - ${formatNotacion(t.max_mes, t.max_mes_exp)}` : '-'}
                    </TableCell>
                    <TableCell>
                      {t.min_colTot ? `${formatNotacion(t.min_colTot, t.min_colTot_exp)} - ${formatNotacion(t.max_colTot, t.max_colTot_exp)}` : '-'}
                    </TableCell>
                    <TableCell>
                      {t.min_mohLev ? `${formatNotacion(t.min_mohLev, t.min_mohLev_exp)} - ${formatNotacion(t.max_mohLev, t.max_mohLev_exp)}` : '-'}
                    </TableCell>
                    <TableCell className="flex gap-1">
                      <Link href={route('externo.tipos-muestra.edit', t.id)}>
                        <Button variant="ghost" size="icon"><Pencil className="h-4 w-4" /></Button>
                      </Link>
                      <Button variant="ghost" size="icon" onClick={() => handleDelete(t.id)}>
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
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