import { Button } from '@/components/ui/button';
import FormInput from '@/components/ui/form-input';
import AppLayout from '@/layouts/app-layout';
import { Head, useForm, router } from '@inertiajs/react';
import { ChevronDown, ChevronRight, ClipboardCheck } from 'lucide-react';
import { useState } from 'react';
import { route } from 'ziggy-js';

const breadcrumbs = [
  { title: 'Microbiología', href: '/planta-lacteos/externo/microbiologia' },
  { title: 'Editar Análisis', href: '' },
];

interface Microbiologia {
  id: number;
  estado: string;
  fecha_siembra: string | null;
  ana_sem: { name: string; apellido: string } | null;
  fecha_dia2: string | null;
  ana_dia2: { name: string; apellido: string } | null;
  aer_mes: number | null;
  col_tot: number | null;
  fecha_dia5: string | null;
  ana_dia5: { name: string; apellido: string } | null;
  moh_lev: number | null;
  aer_mes2: number | null;
  col_tot2: number | null;
  moh_lev2: number | null;
  observaciones: string | null;
  detalle?: {
    tipoMuestra?: { nombre: string; mesofilos?: boolean; coliformes?: boolean; mohos?: boolean } | null;
  };
}

interface PageProps {
  microbiologia: Microbiologia;
  auth: { user: { id: number; name: string } };
}

function toDateInputValue(value: string | null): string {
  if (!value) return new Date().toISOString().split('T')[0];
  return value.split('T')[0];
}

function formatResultado(valor: number | null): string {
  if (valor === null) return 'No aplica';
  if (valor === 0) return '0';
  if (valor > 0 && valor < 1) return '<1';
  if (valor >= 1000000) return 'MNPC';
  return valor.toString();
}

function esPaneton(tipoMuestraNombre: string | null | undefined): boolean {
  if (!tipoMuestraNombre) return false;
  const n = tipoMuestraNombre.toLowerCase();
  return n.includes('paneton') || n.includes('panetón');
}

export default function Edit({ microbiologia, auth }: PageProps) {
  const user = auth.user;
  const isPaneton = esPaneton(microbiologia.detalle?.tipoMuestra?.nombre);
  const requiereMesofilos = microbiologia.detalle?.tipoMuestra?.mesofilos ?? false;
  const requiereColiformes = microbiologia.detalle?.tipoMuestra?.coliformes ?? false;
  const requiereMohos = microbiologia.detalle?.tipoMuestra?.mohos ?? false;

  const [expanded, setExpanded] = useState<string>(() => {
    if (microbiologia.estado === 'Pendiente') return 'siembra';
    if (microbiologia.estado === 'Sembrado') return 'dia2';
    if (microbiologia.estado === 'En Lectura Día 2') return 'dia5';
    if (microbiologia.estado === 'Analizado') return 'dia5';
    return 'siembra';
  });

  const { data, setData, put, processing, errors } = useForm({
    fecha_siembra: toDateInputValue(microbiologia.fecha_siembra),
    fecha_dia2: toDateInputValue(microbiologia.fecha_dia2),
    aer_mes: microbiologia.aer_mes ?? '',
    col_tot: microbiologia.col_tot ?? '',
    aer_mes2: microbiologia.aer_mes2 ?? '',
    col_tot2: microbiologia.col_tot2 ?? '',
    fecha_dia5: toDateInputValue(microbiologia.fecha_dia5),
    moh_lev: microbiologia.moh_lev ?? '',
    moh_lev2: microbiologia.moh_lev2 ?? '',
    observaciones: microbiologia.observaciones || '',
  });

  const handleSiembra = (e: React.FormEvent) => {
    e.preventDefault();
    put(route('externo.microbiologia.siembra', microbiologia.id));
  };

  const handleDia2 = (e: React.FormEvent) => {
    e.preventDefault();
    put(route('externo.microbiologia.dia2', microbiologia.id));
  };

  const handleDia5 = (e: React.FormEvent) => {
    e.preventDefault();
    put(route('externo.microbiologia.dia5', microbiologia.id));
  };

  const completarDia2Limpio = () => {
    router.post(route('externo.microbiologia.completar-dia2', microbiologia.id));
  };

  const completarDia5Limpio = () => {
    router.post(route('externo.microbiologia.completar-dia5', microbiologia.id));
  };

  const toggle = (section: string) => setExpanded(expanded === section ? '' : section);

  const renderStage = (stage: string, title: string, content: React.ReactNode) => {
    const isOpen = expanded === stage;
    return (
      <div key={stage} className="border rounded-lg mb-3 overflow-hidden">
        <button
          type="button"
          onClick={() => toggle(stage)}
          className="w-full flex items-center justify-between p-3 bg-muted/50 hover:bg-muted transition-colors"
        >
          <h3 className="font-semibold text-sm">{title}</h3>
          {isOpen ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
        </button>
        {isOpen && <div className="p-3 pt-0 space-y-3">{content}</div>}
      </div>
    );
  };

  const isPendiente = microbiologia.estado === 'Pendiente';
  const isSembrado = microbiologia.estado === 'Sembrado';
  const isDia2 = microbiologia.estado === 'En Lectura Día 2';
  const isAnalizado = microbiologia.estado === 'Analizado';

  return (
    <AppLayout breadcrumbs={breadcrumbs}>
      <Head title="Editar Microbiología" />
      <div className="max-w-2xl mx-auto py-4 px-4">
        <h1 className="text-xl font-bold mb-4">Análisis Microbiológico #{microbiologia.id}</h1>

        {/* Etapa 1: Siembra */}
        {renderStage('siembra', '1. Siembra', (
          <>
            <p className="text-sm text-muted-foreground">
              Analista responsable: {microbiologia.ana_sem?.name ?? user.name} {microbiologia.ana_sem?.apellido ?? ''}
            </p>
            {isPendiente ? (
              <form onSubmit={handleSiembra}>
                <FormInput
                  id="fecha_siembra"
                  label="Fecha Siembra"
                  type="date"
                  value={data.fecha_siembra}
                  onChange={e => setData('fecha_siembra', e.target.value)}
                  error={errors.fecha_siembra}
                  className="max-w-xs"
                />
                <Button type="submit" className="mt-2" disabled={processing}>
                  {processing ? 'Guardando...' : 'Iniciar Siembra'}
                </Button>
              </form>
            ) : (
              <div className="text-sm text-muted-foreground">
                Fecha: {microbiologia.fecha_siembra ?? '-'}
              </div>
            )}
          </>
        ))}

        {/* Etapa 2: Día 2 */}
        {renderStage('dia2', '2. Lectura Día 2', (
          <>
            {isSembrado ? (
              <form onSubmit={handleDia2}>
                <p className="text-sm text-muted-foreground mb-2">
                  Analista: {user.name} (automático)
                </p>
                <FormInput
                  id="fecha_dia2"
                  label="Fecha Día 2"
                  type="date"
                  value={data.fecha_dia2}
                  onChange={e => setData('fecha_dia2', e.target.value)}
                  error={errors.fecha_dia2}
                />
                <div className="grid grid-cols-2 gap-3 mt-3">
                  {requiereMesofilos && (
                    <FormInput id="aer_mes" label="Aer. Mesófilos" type="number" value={data.aer_mes} onChange={e => setData('aer_mes', e.target.value)} />
                  )}
                  {requiereColiformes && (
                    <FormInput id="col_tot" label="Col. Totales" type="number" value={data.col_tot} onChange={e => setData('col_tot', e.target.value)} />
                  )}
                </div>

                {/* Campos extra solo para Panetón en Día 2 */}
                {isPaneton && (
                  <div className="grid grid-cols-2 gap-3 mt-3">
                    <FormInput id="aer_mes2" label="Aer. Mesófilos 2" type="number" value={data.aer_mes2} onChange={e => setData('aer_mes2', e.target.value)} />
                    <FormInput id="col_tot2" label="Col. Totales 2" type="number" value={data.col_tot2} onChange={e => setData('col_tot2', e.target.value)} />
                  </div>
                )}

                <div className="flex gap-2 mt-3">
                  <Button type="submit" disabled={processing}>
                    Guardar Día 2
                  </Button>
                  <Button type="button" variant="outline" onClick={completarDia2Limpio}>
                    <ClipboardCheck className="h-4 w-4 mr-1" /> Limpio (0)
                  </Button>
                </div>
              </form>
            ) : isDia2 || isAnalizado ? (
              <div className="text-sm text-muted-foreground space-y-1">
                <p>Fecha: {microbiologia.fecha_dia2 ?? '-'}</p>
                <p>Analista: {microbiologia.ana_dia2?.name ?? '-'}</p>
                <p>{requiereMesofilos ? `Aer. Mesófilos: ${formatResultado(microbiologia.aer_mes)}` : 'Aer. Mesófilos: No aplica'} | {requiereColiformes ? `Col. Totales: ${formatResultado(microbiologia.col_tot)}` : 'Col. Totales: No aplica'}</p>
                {isPaneton && (
                  <p>Aer. Mesófilos 2: {formatResultado(microbiologia.aer_mes2)} | Col. Totales 2: {formatResultado(microbiologia.col_tot2)}</p>
                )}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground italic">Complete primero la siembra.</p>
            )}
          </>
        ))}

        {/* Etapa 3: Día 5 */}
        {renderStage('dia5', '3. Lectura Día 5', (
          <>
            {isDia2 ? (
              <form onSubmit={handleDia5}>
                <p className="text-sm text-muted-foreground mb-2">
                  Analista: {user.name} (automático)
                </p>
                <FormInput
                  id="fecha_dia5"
                  label="Fecha Día 5"
                  type="date"
                  value={data.fecha_dia5}
                  onChange={e => setData('fecha_dia5', e.target.value)}
                  error={errors.fecha_dia5}
                />
                <div className="grid grid-cols-2 gap-3 mt-3">
                  {requiereMohos && (
                    <FormInput id="moh_lev" label="Mohos y Levaduras" type="number" value={data.moh_lev} onChange={e => setData('moh_lev', e.target.value)} />
                  )}
                  {/* Moh_lev2 solo si es panetón */}
                  {isPaneton && (
                    <FormInput id="moh_lev2" label="Mohos y Levaduras 2" type="number" value={data.moh_lev2} onChange={e => setData('moh_lev2', e.target.value)} />
                  )}
                </div>
                <div className="flex gap-2 mt-3">
                  <Button type="submit" disabled={processing}>
                    Finalizar Análisis
                  </Button>
                  <Button type="button" variant="outline" onClick={completarDia5Limpio}>
                    <ClipboardCheck className="h-4 w-4 mr-1" /> Limpio (0)
                  </Button>
                </div>
              </form>
            ) : isAnalizado ? (
              <div className="text-sm text-muted-foreground space-y-1">
                <p>Fecha: {microbiologia.fecha_dia5 ?? '-'}</p>
                <p>Analista: {microbiologia.ana_dia5?.name ?? '-'}</p>
                <p>{requiereMohos ? `Mohos y Levaduras: ${formatResultado(microbiologia.moh_lev)}` : 'Mohos y Levaduras: No aplica'}</p>
                {isPaneton && (
                  <p>Mohos y Levaduras 2: {formatResultado(microbiologia.moh_lev2)}</p>
                )}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground italic">Complete las etapas anteriores.</p>
            )}
          </>
        ))}

        {/* Observaciones */}
        <div className="border rounded-lg p-3">
          <h3 className="font-semibold text-sm mb-2">Observaciones</h3>
          <FormInput
            id="observaciones"
            label="Observaciones"
            value={data.observaciones}
            onChange={e => setData('observaciones', e.target.value)}
            textarea
          />
        </div>

        <div className="flex justify-end mt-4">
          <Button variant="outline" type="button" onClick={() => window.history.back()}>
            Volver
          </Button>
        </div>
      </div>
    </AppLayout>
  );
}