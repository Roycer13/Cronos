import React, { useEffect } from "react";
import { toast, ToastContainer, Zoom } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { usePage } from "@inertiajs/react";
import { Download, X } from "lucide-react";

/**
 * Tipos de las props que Laravel envía en la sesión flash
 */
export interface FlashProps {
    success?: string;
    error?: string;
    info?: string;
    warning?: string;
    import_result?: any; // <-- Añade esto
}

/**
 * Tipos de las props globales de Inertia
 */
interface PageProps {
    flash?: FlashProps;
    [key: string]: any;
}

interface ToastProps {
    flash?: FlashProps;
}

// Función para generar CSV
const generarCSV = (resultado: any) => {
    let csv = 'Tipo,Código ORP,Producto,Descripción,Lote,Cantidad,Error\n';

    // ORPs creadas
    resultado.creados_detalle?.forEach((orp: any) => {
        csv += `Creada,${orp.codigo},${orp.producto},"${orp.descripcion}",${orp.lote},${orp.cantidad},\n`;
    });

    // ORPs repetidas
    resultado.repetidos?.forEach((rep: any) => {
        csv += `Repetida,${rep.codigo},${rep.producto},"${rep.descripcion}",,,Ya existe en el sistema\n`;
    });

    // Errores
    resultado.errores?.forEach((err: any) => {
        csv += `Error,${err.codigo},${err.producto},"${err.descripcion}",,,"${err.error}"\n`;
    });

    return csv;
};

const Toast: React.FC<ToastProps> = ({ flash: customFlash }) => {
    const { flash: inertiaFlash } = usePage<PageProps>().props;
    const flash = customFlash || inertiaFlash;

    useEffect(() => {
        console.log('Flash recibido en Toast:', flash); // Para debug

        if (!flash) return;

        const theme = document.documentElement.classList.contains("dark")
            ? "dark"
            : "light";

        // 1. Primero, manejar mensajes de importación (tanto success como info)
        const mensajeImportacion = flash.success || flash.info;
        const tieneMensajeImportacion = mensajeImportacion &&
            (mensajeImportacion.includes("📊 **Resumen de Importación**") ||
                mensajeImportacion.includes("Resumen de Importación"));

        // Si hay import_result, mostrar toast personalizado
        if (flash.import_result) {
            const resultado = flash.import_result;
            const total = resultado.total_registros || 0;
            const creados = resultado.creados || 0;
            const repetidos = resultado.repetidos?.length || 0;
            const errores = resultado.errores?.length || 0;
            const creadosDetalle = resultado.creados_detalle || [];

            const ImportResultToast = () => (
                <div className="max-w-full p-2">
                    <div className="flex justify-between items-start mb-3">
                        <div className="font-bold text-lg flex items-center gap-2">
                            📊 Resumen de Importación
                        </div>
                        <button
                            onClick={() => toast.dismiss()}
                            className="text-gray-500 hover:text-gray-700"
                        >
                            <X size={16} />
                        </button>
                    </div>

                    <div className="mb-4">
                        <div className="grid grid-cols-4 gap-2 mb-3">
                            <div className="bg-green-50 p-2 rounded text-center">
                                <div className="text-2xl font-bold text-green-600">{creados}</div>
                                <div className="text-xs text-green-700">Creadas</div>
                            </div>
                            <div className="bg-yellow-50 p-2 rounded text-center">
                                <div className="text-2xl font-bold text-yellow-600">{repetidos}</div>
                                <div className="text-xs text-yellow-700">Repetidas</div>
                            </div>
                            <div className="bg-red-50 p-2 rounded text-center">
                                <div className="text-2xl font-bold text-red-600">{errores}</div>
                                <div className="text-xs text-red-700">Errores</div>
                            </div>
                            <div className="bg-blue-50 p-2 rounded text-center">
                                <div className="text-2xl font-bold text-blue-600">{total}</div>
                                <div className="text-xs text-blue-700">Total</div>
                            </div>
                        </div>

                        <div
                            className="max-h-60 overflow-y-auto text-sm mb-4"
                            style={{
                                whiteSpace: 'pre-line',
                                lineHeight: '1.5'
                            }}
                        >
                            {mensajeImportacion ? mensajeImportacion.replace(/📊 \*\*Resumen de Importación\*\*\n\n/, "") : ""}
                        </div>
                    </div>

                    <div className="flex justify-between items-center pt-3 border-t border-gray-200">
                        <div className="text-xs text-gray-500">
                            {creados > 0 ? (
                                <span className="text-green-600">
                                    ✅ {creados} ORPs importadas
                                </span>
                            ) : (
                                <span className="text-red-600">
                                    ❌ No se importaron nuevas ORPs
                                </span>
                            )}
                        </div>
                        <div className="flex gap-2">
                            <button
                                onClick={() => {
                                    const csv = generarCSV(resultado);
                                    const blob = new Blob([csv], { type: 'text/csv' });
                                    const url = URL.createObjectURL(blob);
                                    const a = document.createElement('a');
                                    a.href = url;
                                    a.download = `reporte_importacion_${new Date().toISOString().slice(0, 10)}.csv`;
                                    document.body.appendChild(a);
                                    a.click();
                                    document.body.removeChild(a);
                                }}
                                className="px-3 py-1 text-xs bg-blue-600 text-white rounded hover:bg-blue-700 flex items-center gap-1"
                            >
                                <Download size={12} />
                                Exportar CSV
                            </button>
                        </div>
                    </div>
                </div>
            );

            toast.success(<ImportResultToast />, {
                position: "top-right",
                autoClose: 20000,
                hideProgressBar: false,
                closeOnClick: false,
                pauseOnHover: true,
                draggable: true,
                transition: Zoom,
                theme,
                style: {
                    maxWidth: '550px',
                    width: 'auto',
                    minWidth: '450px'
                }
            });
            return;
        }

        // 2. Si no hay import_result pero el mensaje es de importación, mostrar básico
        if (tieneMensajeImportacion) {
            toast.success(
                <div className="max-w-full">
                    <div className="font-bold mb-2">📊 Resumen de Importación</div>
                    <div
                        className="max-h-60 overflow-y-auto text-sm"
                        style={{
                            maxWidth: '500px',
                            whiteSpace: 'pre-line'
                        }}
                    >
                        {mensajeImportacion.replace(/📊 \*\*Resumen de Importación\*\*\n\n/, "")}
                    </div>
                </div>,
                {
                    position: "top-right",
                    autoClose: false,
                    hideProgressBar: false,
                    closeOnClick: true,
                    pauseOnHover: true,
                    draggable: true,
                    transition: Zoom,
                    theme,
                    style: {
                        maxWidth: '600px',
                        width: 'auto',
                        minWidth: '400px'
                    }
                }
            );
            return;
        }

        // 3. Toasts normales
        if (flash.success && !tieneMensajeImportacion) {
            toast.success(flash.success, {
                position: "top-right",
                autoClose: 2500,
                hideProgressBar: false,
                closeOnClick: true,
                pauseOnHover: true,
                draggable: true,
                transition: Zoom,
                theme,
            });
        }

        if (flash.error) {
            toast.error(flash.error, {
                position: "top-right",
                autoClose: false,
                hideProgressBar: false,
                closeOnClick: true,
                pauseOnHover: true,
                draggable: true,
                transition: Zoom,
                theme,
            });
        }

        if (flash.info && !tieneMensajeImportacion) {
            toast.info(flash.info, {
                position: "bottom-right",
                autoClose: false,
                hideProgressBar: false,
                closeOnClick: true,
                pauseOnHover: true,
                draggable: true,
                transition: Zoom,
                theme,
            });
        }

        if (flash.warning) {
            toast.warning(flash.warning, {
                position: "top-right",
                autoClose: 2500,
                hideProgressBar: false,
                closeOnClick: true,
                pauseOnHover: true,
                draggable: true,
                transition: Zoom,
                theme,
            });
        }
    }, [flash]);

    return <ToastContainer stacked />;
};

export { Toast };