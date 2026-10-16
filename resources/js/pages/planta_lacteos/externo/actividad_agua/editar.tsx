// resources/js/Pages/externo/actividad-agua/Edit.tsx
import { Button } from '@/components/ui/button';
import FormInput from '@/components/ui/form-input';
import FormSelect from '@/components/ui/form-select';
import AppLayout from '@/layouts/app-layout';
import { Head, useForm } from '@inertiajs/react';
import { route } from 'ziggy-js';

interface ActividadAgua {
  id: number;
  fecha: string | null;
  temperatura: number | null;
  por_hum_rel: number | null;
  act_agua: number | null;
  user_id: number | null;
  ext_verificacion_equipo_id: number | null;
  observaciones: string | null;
  ultima_verificacion?: { id: number; fecha: string } | null;
}

interface PageProps {
  actividad: ActividadAgua;
  analistas: { id: number; name: string; apellido: string }[];
  ultima_verificacion?: { id: number; fecha: string } | null;
}

export default function Edit({ actividad, analistas, ultima_verificacion }: PageProps) {
  const { data, setData, put, processing } = useForm({
    fecha: actividad.fecha || new Date().toISOString().split('T')[0],
    temperatura: actividad.temperatura ?? '',
    por_hum_rel: actividad.por_hum_rel ?? '',
    act_agua: actividad.act_agua ?? '',
    user_id: actividad.user_id?.toString() || '',
    observaciones: actividad.observaciones || '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    put(route('externo.actividad-agua.update', actividad.id));
  };

  return (
    <AppLayout breadcrumbs={[{ title: 'Actividad de Agua', href: '#' }, { title: `Editar #${actividad.id}` }]}>
      <Head title="Actividad de Agua" />
      <div className="max-w-xl mx-auto py-4 px-4">
        <h1 className="text-2xl font-bold mb-4">Registrar Actividad de Agua</h1>
        {ultima_verificacion && (
          <div className="text-sm text-muted-foreground mb-3">
            Última verificación de equipo: {ultima_verificacion.fecha} (ID {ultima_verificacion.id})
          </div>
        )}
        <form onSubmit={handleSubmit} className="space-y-4">
          <FormInput id="fecha" label="Fecha *" type="date" value={data.fecha} onChange={e => setData('fecha', e.target.value)} />
          <FormInput id="temperatura" label="Temperatura (°C)" type="number" step="0.1" value={data.temperatura} onChange={e => setData('temperatura', e.target.value)} />
          <FormInput id="por_hum_rel" label="Humedad Relativa (%)" type="number" step="0.1" value={data.por_hum_rel} onChange={e => setData('por_hum_rel', e.target.value)} />
          <FormInput id="act_agua" label="Actividad de Agua (aw)" type="number" step="0.001" value={data.act_agua} onChange={e => setData('act_agua', e.target.value)} />
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