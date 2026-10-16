import CrudTable from '@/components/CrudTable';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Toast } from '@/components/ui/toast';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head } from '@inertiajs/react';
import axios from 'axios';
import { useEffect, useState } from 'react';
import { useAuth } from '@/hooks/useAuth';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Configuración', href: '/configuracion' },
];

export default function ConfiguracionIndex() {
     const { isAdmin, hasPermission } = useAuth();
    const [isLoading, setIsLoading] = useState(true);
    const [loadingErrors, setLoadingErrors] = useState<Record<string, string>>({});

    const [ubicaciones, setUbicaciones] = useState<any[]>([]);
    const [tipoUbicaciones, setTipoUbicaciones] = useState<any[]>([]);
    const [areas, setAreas] = useState<any[]>([]);
    const [unidades, setUnidades] = useState<any[]>([]);
    const [sectores, setSectores] = useState<any[]>([]);
    const [estados, setEstados] = useState<any[]>([]);
    const [tipoMaquinaEquipos, setTipoMaquinaEquipos] = useState<any[]>([]);
    const [maquinaEquipos, setMaquinaEquipos] = useState<any[]>([]);
    const [prioridades, setPrioridades] = useState<any[]>([]);
    const [proveedores, setProveedores] = useState<any[]>([]);

    const [flashMessage, setFlashMessage] = useState<{
        success?: string;
        error?: string;
    }>({});

    // Función para hacer fetch con logging
    const fetchWithLog = async (url: string, setter: Function, key: string) => {
        try {
            console.log(`🔄 Iniciando fetch: ${url}`);
            const response = await axios.get(url);
            console.log(`✅ Success ${key}:`, {
                url,
                status: response.status,
                dataLength: response.data?.length || 0,
                data: response.data
            });
            setter(response.data);
            setLoadingErrors(prev => ({ ...prev, [key]: '' }));
        } catch (error: any) {
            console.error(`❌ Error ${key}:`, {
                url,
                status: error.response?.status,
                message: error.message,
                response: error.response?.data
            });
            setLoadingErrors(prev => ({
                ...prev,
                [key]: `Error ${error.response?.status || 'Desconocido'}: ${error.message}`
            }));
        }
    };

    useEffect(() => {
        console.log('🎯 ConfiguracionIndex mounted, starting data fetch...');

        const fetchAllData = async () => {
            setIsLoading(true);

            // Array de todas las peticiones
            const fetchPromises = [
                fetchWithLog('/sistemas/configuracion/tipoUbicaciones', setTipoUbicaciones, 'tipoUbicaciones'),
                fetchWithLog('/sistemas/configuracion/ubicaciones', setUbicaciones, 'ubicaciones'),
                fetchWithLog('/sistemas/configuracion/areas', setAreas, 'areas'),
                fetchWithLog('/sistemas/configuracion/unidades', setUnidades, 'unidades'),
                fetchWithLog('/sistemas/configuracion/sectores', setSectores, 'sectores'),
                fetchWithLog('/sistemas/configuracion/estados', setEstados, 'estados'),
                fetchWithLog('/sistemas/configuracion/tipoMaquinaEquipos', setTipoMaquinaEquipos, 'tipoMaquinaEquipos'),
                fetchWithLog('/sistemas/configuracion/maquinaEquipos', setMaquinaEquipos, 'maquinaEquipos'),
                fetchWithLog('/sistemas/configuracion/prioridades', setPrioridades, 'prioridades'),
                fetchWithLog('/sistemas/configuracion/proveedores', setProveedores, 'proveedores'),
            ];

            await Promise.all(fetchPromises);

            setIsLoading(false);
            console.log('🏁 All data fetch completed');
            console.log('📊 Estado final:', {
                tipoUbicaciones: tipoUbicaciones.length,
                ubicaciones: ubicaciones.length,
                areas: areas.length,
                unidades: unidades.length,
                sectores: sectores.length,
                estados: estados.length,
                tipoMaquinaEquipos: tipoMaquinaEquipos.length,
                maquinaEquipos: maquinaEquipos.length,
                prioridades: prioridades.length,
                proveedores: proveedores.length,
            });
        };

        fetchAllData();
    }, []);

    // Debug: Ver qué datos tenemos realmente
    useEffect(() => {
        if (!isLoading) {
            console.log('📋 Datos cargados:', {
                tipoUbicaciones: tipoUbicaciones,
                ubicaciones: ubicaciones,
                areas: areas,
                unidades: unidades,
                sectores: sectores,
                estados: estados,
                tipoMaquinaEquipos: tipoMaquinaEquipos,
                maquinaEquipos: maquinaEquipos,
                prioridades: prioridades,
                proveedores: proveedores,
            });
        }
    }, [isLoading]);

    if (isLoading) {
        return (
            <AppLayout breadcrumbs={breadcrumbs}>
                <Head title="Configuraciones del Sistema" />
                <div className="p-6">
                    <h1 className="text-2xl font-semibold mb-4">Cargando configuración...</h1>
                    <div className="space-y-2">
                        {Object.entries(loadingErrors).map(([key, error]) => (
                            error && (
                                <div key={key} className="bg-red-50 border border-red-200 rounded p-3">
                                    <p className="text-red-700 text-sm">
                                        Error en {key}: {error}
                                    </p>
                                </div>
                            )
                        ))}
                    </div>
                </div>
            </AppLayout>
        );
    }

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Configuraciones del Sistema" />

            {/* Componente Toast */}
            <Toast flash={flashMessage} />

            {/* Panel de errores */}
            {Object.keys(loadingErrors).length > 0 && (
                <div className="m-4 p-4 bg-yellow-50 border border-yellow-200 rounded">
                    <h3 className="font-semibold text-yellow-800 mb-2">Advertencias de carga:</h3>
                    <ul className="space-y-1">
                        {Object.entries(loadingErrors).map(([key, error]) => (
                            error && (
                                <li key={key} className="text-sm text-yellow-700">
                                    • {key}: {error}
                                </li>
                            )
                        ))}
                    </ul>
                </div>
            )}

            <div className="space-y-6 px-6 py-4">
                <h1 className="text-2xl font-semibold">
                    Configuraciones del Sistema
                </h1>


                 {isAdmin && (
                <>

                <h2 className="text-lg font-medium">Generales</h2>

                <Tabs defaultValue="ubicaciones" className="w-full">
                    <TabsList className="mb-4">
                        <TabsTrigger value="ubicaciones">
                            Ubicaciones ({ubicaciones.length})
                        </TabsTrigger>
                        <TabsTrigger value="tipoUbicaciones">
                            Tipos de ubicaciones ({tipoUbicaciones.length})
                        </TabsTrigger>
                        <TabsTrigger value="sectores">
                            Sectores ({sectores.length})
                        </TabsTrigger>
                        <TabsTrigger value="areas">
                            Áreas ({areas.length})
                        </TabsTrigger>
                        <TabsTrigger value="unidades">
                            Unidades ({unidades.length})
                        </TabsTrigger>
                        <TabsTrigger value="estados">
                            Estado ({estados.length})
                        </TabsTrigger>
                        <TabsTrigger value="prioridades">
                            Prioridades ({prioridades.length})
                        </TabsTrigger>
                    </TabsList>

                    <TabsContent value="tipoUbicaciones">
                        <CrudTable
                            title="Tipo de Ubicaciones"
                            data={tipoUbicaciones}
                            endpoint="/configuracion/tipoUbicaciones"
                            setFlash={setFlashMessage}
                        />
                    </TabsContent>

                    <TabsContent value="ubicaciones">
                        <CrudTable
                            title="Ubicaciones"
                            data={ubicaciones}
                            endpoint="/configuracion/ubicaciones"
                            foreignKeyOptions={{
                                tipo_ubicacion_id: tipoUbicaciones,
                            }}
                            setFlash={setFlashMessage}
                        />
                    </TabsContent>

                    <TabsContent value="sectores">
                        <CrudTable
                            title="Sectores"
                            data={sectores}
                            endpoint="/configuracion/sectores"
                            foreignKeyOptions={{
                                ubicacion_id: ubicaciones,
                            }}
                            setFlash={setFlashMessage}
                        />
                    </TabsContent>

                    <TabsContent value="areas">
                        <CrudTable
                            title="Áreas"
                            data={areas}
                            endpoint="/configuracion/areas"
                            foreignKeyOptions={{
                                ubicacion_id: ubicaciones,
                            }}
                            setFlash={setFlashMessage}
                        />
                    </TabsContent>

                    <TabsContent value="unidades">
                        <CrudTable
                            title="Unidades"
                            data={unidades}
                            endpoint="/configuracion/unidades"
                            setFlash={setFlashMessage}
                        />
                    </TabsContent>

                    <TabsContent value="estados">
                        <CrudTable
                            title="Estados"
                            data={estados}
                            endpoint="/configuracion/estados"
                            setFlash={setFlashMessage}
                        />
                    </TabsContent>

                    <TabsContent value="prioridades">
                        <CrudTable
                            title="Prioridades"
                            data={prioridades}
                            endpoint="/configuracion/prioridades"
                            setFlash={setFlashMessage}
                        />
                    </TabsContent>
                </Tabs>
  </>
            )}
{hasPermission('configuracion_mantenimiento') && (
                    <>

                <h2 className="text-lg font-medium">Mantenimiento</h2>

                <Tabs defaultValue="tipoMaquinaEquipos" className="w-full">
                    <TabsList className="mb-4">
                        <TabsTrigger value="tipoMaquinaEquipos">
                            Tipo de máquinas y equipos ({tipoMaquinaEquipos.length})
                        </TabsTrigger>
                        <TabsTrigger value="maquinaEquipos">
                            Máquinas y equipos ({maquinaEquipos.length})
                        </TabsTrigger>
                        <TabsTrigger value="proveedores">
                            Proveedores ({proveedores.length})
                        </TabsTrigger>
                    </TabsList>

                    <TabsContent value="tipoMaquinaEquipos">
                        <CrudTable
                            title="Tipo de Máquinas y Equipos"
                            data={tipoMaquinaEquipos}
                            endpoint="/configuracion/tipoMaquinaEquipos"
                            setFlash={setFlashMessage}
                        />
                    </TabsContent>

                    <TabsContent value="maquinaEquipos">
                        <CrudTable
                            title="Máquinas y Equipos"
                            data={maquinaEquipos}
                            endpoint="/configuracion/maquinaEquipos"
                            foreignKeyOptions={{
                                estado_id: estados,
                                tipo_maquina_equipo_id: tipoMaquinaEquipos,
                            }}
                            setFlash={setFlashMessage}
                        />
                    </TabsContent>

                    <TabsContent value="proveedores">
                        <CrudTable
                            title="Proveedores"
                            data={proveedores}
                            endpoint="/configuracion/proveedores"
                            foreignKeyOptions={{
                                estado_id: estados,
                            }}
                            setFlash={setFlashMessage}
                        />
                    </TabsContent>
                </Tabs>

  </>
                )}

            </div>
        </AppLayout>
    );
}
