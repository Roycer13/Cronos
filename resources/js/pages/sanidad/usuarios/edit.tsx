import { Button } from '@/components/ui/button';
import AppLayout from '@/layouts/app-layout';
import { Head, Link, router } from '@inertiajs/react';
import { route } from 'ziggy-js';
import { Calendar, User, Briefcase, Heart, Activity, ArrowLeft } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

export default function Show({ usuario }) {
    const formatDate = (date) => {
        return format(new Date(date), 'PPP', { locale: es });
    };

    return (
        <AppLayout breadcrumbs={[
            { title: 'Usuarios', href: '/sanidad/usuarios' },
            { title: 'Historial', href: '#' }
        ]}>
            <Head title={`Historial de ${usuario.name}`} />
            <div className="p-4 max-w-7xl mx-auto">
                <Button variant="ghost" onClick={() => router.visit(route('sanidad.usuarios.index'))}>
                    <ArrowLeft className="mr-2 h-4 w-4" /> Volver
                </Button>

                <div className="mt-4 bg-card p-6 rounded-lg border shadow-sm">
                    <h1 className="text-2xl font-bold">{usuario.name} {usuario.apellido}</h1>
                    <p className="text-muted-foreground">Código: {usuario.codigo}</p>
                    <p className="text-sm mt-2">Email: {usuario.email || '-'} | Tel: {usuario.telefono || '-'}</p>
                </div>

                <Tabs defaultValue="atenciones" className="mt-6">
                    <TabsList>
                        <TabsTrigger value="atenciones">Atenciones Médicas</TabsTrigger>
                        <TabsTrigger value="examenes">Exámenes Ocupacionales</TabsTrigger>
                    </TabsList>

                    <TabsContent value="atenciones" className="mt-4">
                        {usuario.atencionesComoPaciente?.length === 0 ? (
                            <p className="text-muted-foreground">No hay atenciones registradas.</p>
                        ) : (
                            <div className="space-y-4">
                                {usuario.atencionesComoPaciente.map((atencion) => (
                                    <div key={atencion.id} className="border rounded-lg p-4 hover:bg-muted/50">
                                        <div className="flex justify-between items-start">
                                            <div>
                                                <p className="font-semibold">{formatDate(atencion.fecha_atencion)}</p>
                                                <p className="text-sm">Motivo: {atencion.motivo_consulta}</p>
                                                <p className="text-xs text-muted-foreground">
                                                    Médico: {atencion.medico?.name} {atencion.medico?.apellido}
                                                </p>
                                                <Badge className="mt-1">{atencion.estado?.nombre}</Badge>
                                            </div>
                                            <Link href={route('atenciones-medicas.show', atencion.id)}>
                                                <Button size="sm">Ver detalle</Button>
                                            </Link>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </TabsContent>

                    <TabsContent value="examenes" className="mt-4">
                        {usuario.examenesOcupacionalesComoEmpleado?.length === 0 ? (
                            <p className="text-muted-foreground">No hay exámenes registrados.</p>
                        ) : (
                            <div className="space-y-4">
                                {usuario.examenesOcupacionalesComoEmpleado.map((examen) => (
                                    <div key={examen.id} className="border rounded-lg p-4 hover:bg-muted/50">
                                        <div className="flex justify-between items-start">
                                            <div>
                                                <p className="font-semibold">{formatDate(examen.fecha_examen)}</p>
                                                <p className="text-sm">Tipo: {examen.tipo_examen}</p>
                                                <p className="text-xs text-muted-foreground">
                                                    Médico: {examen.medico?.name} {examen.medico?.apellido}
                                                </p>
                                                <Badge className={examen.aptitud_ocupacional === 'APTO' ? 'bg-green-100' : 'bg-yellow-100'}>
                                                    {examen.aptitud_ocupacional}
                                                </Badge>
                                            </div>
                                            <Link href={route('examenes-ocupacionales.show', examen.id)}>
                                                <Button size="sm">Ver detalle</Button>
                                            </Link>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </TabsContent>
                </Tabs>
            </div>
        </AppLayout>
    );
}