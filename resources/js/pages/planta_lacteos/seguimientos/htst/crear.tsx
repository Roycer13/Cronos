import { Button } from '@/components/ui/button';
import FilterSelect from '@/components/ui/filter-select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Toast } from '@/components/ui/toast';
import AppLayout from '@/layouts/app-layout';
import { Head, router, usePage } from '@inertiajs/react';
import { useState } from 'react';
import { route } from 'ziggy-js';

interface PageProps {
    orps: { id: number; codigo: string }[];
    origenes: { id: number; alias: string }[];
    errors: Record<string, string>;
}

export default function Create() {
    const { props } = usePage<PageProps>();
    const { orps = [], origenes = [], errors = {} } = props;

    const [form, setForm] = useState({
        orp_id: '',
        preparacion: '',
        lote: '',
        origen_id: '',
        hora_sachet: '',
    });

    const handleChange = (key: string, value: string) => {
        setForm((prev) => ({ ...prev, [key]: value }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        router.post(route('seguimiento-htst.store'), {
            ...form,
            hora_sachet: form.hora_sachet || null,
        });
    };

    return (
        <AppLayout
            breadcrumbs={[

                { title: 'Seguimiento HTST', href: route('seguimiento-htst.index') },
                { title: 'Nuevo', href: '#' },
            ]}
        >
            <Head title="Nuevo Seguimiento HTST" />
            <Toast />

            <form
                onSubmit={handleSubmit}
                className="mx-auto max-w-3xl space-y-6 rounded-lg border bg-background p-6"
            >
                <h1 className="text-xl font-semibold text-foreground">
                    Registrar Seguimiento HTST
                </h1>

                {/* ORP */}
                <div className="space-y-1">
                    <Label>ORP *</Label>
            <FilterSelect
    value={form.orp_id}
    onChange={(v) => handleChange('orp_id', v)}
    placeholder="Seleccionar ORP"
    options={orps.map((o) => ({
        value: o.id.toString(),
        label: `${o.codigo} ${o.producto_terminado ? `- ${o.producto_terminado.nombre_sap}` : ''} ${o.fecha_vencimiento ? `(${o.fecha_vencimiento})` : ''}`.trim()
    }))}
/>
                    {errors.orp_id && (
                        <p className="text-sm text-destructive">
                            {errors.orp_id}
                        </p>
                    )}
                </div>

                {/* Preparación */}
                <div className="space-y-1">
                    <Label>Preparación *</Label>
                    <Input
                        value={form.preparacion}
                        onChange={(e) =>
                            handleChange('preparacion', e.target.value)
                        }
                        placeholder="Ej. Yogurt Natural"
                    />
                    {errors.preparacion && (
                        <p className="text-sm text-destructive">
                            {errors.preparacion}
                        </p>
                    )}
                </div>

                {/* Lote */}
                <div className="space-y-1">
                    <Label>Lote *</Label>
                    <Input
                        value={form.lote}
                        onChange={(e) => handleChange('lote', e.target.value)}
                        placeholder="Ej. LOTE-2025-01"
                    />
                    {errors.lote && (
                        <p className="text-sm text-destructive">
                            {errors.lote}
                        </p>
                    )}
                </div>

                {/* Origen */}
                <div className="space-y-1">
                    <Label>Origen *</Label>
                    <FilterSelect
                        value={form.origen_id}
                        onChange={(v) => handleChange('origen_id', v)}
                        placeholder="Seleccionar origen"
                        options={origenes.map((o) => ({
                            value: o.id.toString(),
                            label: o.alias,
                        }))}
                    />
                    {errors.origen_id && (
                        <p className="text-sm text-destructive">
                            {errors.origen_id}
                        </p>
                    )}
                </div>

                {/* Hora Sachet */}
                <div className="space-y-1">
                    <Label>Hora de Sachet (opcional)</Label>
                    <Input
                        type="time"
                        value={form.hora_sachet}
                        onChange={(e) =>
                            handleChange('hora_sachet', e.target.value)
                        }
                    />
                    {errors.hora_sachet && (
                        <p className="text-sm text-destructive">
                            {errors.hora_sachet}
                        </p>
                    )}
                </div>

                {/* Acciones */}
                <div className="flex justify-end gap-3 pt-4">
                    <Button
                        type="button"
                        variant="outline"
                        onClick={() => router.visit(route('seguimiento-htst.index'))}
                    >
                        Cancelar
                    </Button>
                    <Button type="submit">Guardar Seguimiento</Button>
                </div>
            </form>
        </AppLayout>
    );
}
