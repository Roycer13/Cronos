// resources/js/Pages/externo/agua-fisico/Edit.tsx
import { Button } from '@/components/ui/button';
import FormInput from '@/components/ui/form-input';
import FormSelect from '@/components/ui/form-select';
import AppLayout from '@/layouts/app-layout';
import { Head, useForm } from '@inertiajs/react';
import { route } from 'ziggy-js';

interface AguaFisico {
  id: number;
  fecha: string | null;
  ph: number | null;
  dureza: number | null;
  cloruros: number | null;
  conductividad: number | null;
  user_id: number | null;
  observaciones: string | null;
}

interface PageProps {
  registro: AguaFisico;
  analistas: { id: number; name: string; apellido: string }[];
}

export default function Edit({ registro, analistas }: PageProps) {
  const { data, setData, put, processing } = useForm({
    fecha: registro.fecha || new Date().toISOString().split('T')[0],
    ph: registro.ph ?? '',
    dureza: registro.dureza ?? '',
    cloruros: registro.cloruros ?? '',
    conductividad: registro.conductividad ?? '',
    user_id: registro.user_id?.toString() || '',
    observaciones: registro.observaciones || '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    put(route('externo.agua-fisico.update', registro.id));
  };

  return (
    <AppLayout breadcrumbs={[{ title: 'Agua Físico', href: '#' }, { title: `Editar #${registro.id}` }]}>
      <Head title="Agua Físico" />
      <div className="max-w-xl mx-auto py-4 px-4">
        <h1 className="text-2xl font-bold mb-4">Análisis Físico de Agua</h1>
        <form onSubmit={handleSubmit} className="space-y-4">
          <FormInput id="fecha" label="Fecha *" type="date" value={data.fecha} onChange={e => setData('fecha', e.target.value)} />
          <FormInput id="ph" label="pH" type="number" step="0.01" value={data.ph} onChange={e => setData('ph', e.target.value)} />
          <FormInput id="dureza" label="Dureza" type="number" step="0.01" value={data.dureza} onChange={e => setData('dureza', e.target.value)} />
          <FormInput id="cloruros" label="Cloruros" type="number" step="0.01" value={data.cloruros} onChange={e => setData('cloruros', e.target.value)} />
          <FormInput id="conductividad" label="Conductividad" type="number" step="0.01" value={data.conductividad} onChange={e => setData('conductividad', e.target.value)} />
          <FormSelect
            id="user_id"
            label="Analista *"
            value={data.user_id}
            onChange={v => setData('user_id', v)}
            options={analistas.map(a => ({ value: a.id.toString(), label: `${a.name} ${a.apellido}` }))}
          />
          <FormInput id="observaciones" label="Observaciones" value={data.observaciones} onChange={e => setData('observaciones', e.target.value)} />
          <div className="flex justify-end gap-3">
            <Button variant="outline" type="button" onClick={() => window.history.back()}>Cancelar</Button>
            <Button type="submit" disabled={processing}>Guardar Resultados</Button>
          </div>
        </form>
      </div>
    </AppLayout>
  );
}