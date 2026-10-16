import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { ZoomIn, ZoomOut, RotateCw, Maximize2, Lock, Eye } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { route } from 'ziggy-js';

export default function SecurePDFViewer({ versionId, allowDownload = false }) {
    const [scale, setScale] = useState(1.0);
    const [rotation, setRotation] = useState(0);
    const [isLoading, setIsLoading] = useState(true);
    const iframeRef = useRef(null);
    const containerRef = useRef(null);

    // Convertir la URL del documento a la ruta segura del backend
    const getSecureUrl = (versionId) => {
        if (!versionId) return '';
        
        // Usar el ID de la versión directamente
        return route('pdf.viewer', { versionId: versionId });
    };

    const secureUrl = getSecureUrl(versionId);

    const handleDownload = () => {
        if (!allowDownload || !versionId) return;
        
        const downloadUrl = route('pdf.download', { versionId: versionId });
        window.open(downloadUrl, '_blank');
    };

    // Bloquear clic derecho y descargas
    useEffect(() => {
        const blockActions = (e) => {
            // Bloquear clic derecho
            if (e.type === 'contextmenu') {
                e.preventDefault();
                return false;
            }
            
            // Bloquear Ctrl+S, Ctrl+P, etc.
            if ((e.ctrlKey || e.metaKey) && 
                (e.key === 's' || e.key === 'p' || e.key === 'o' || e.key === 'u')) {
                e.preventDefault();
                return false;
            }
            
            // Bloquear F12 (DevTools)
            if (e.key === 'F12') {
                e.preventDefault();
                return false;
            }
        };

        window.addEventListener('keydown', blockActions);
        window.addEventListener('contextmenu', blockActions);
        
        // Intentar bloquear acciones dentro del iframe
        const iframe = iframeRef.current;
        const loadIframe = () => {
            try {
                const iframeDoc = iframe.contentDocument || iframe.contentWindow.document;
                iframeDoc.addEventListener('contextmenu', blockActions);
                iframeDoc.addEventListener('keydown', blockActions);
                
                // Ocultar la barra de herramientas nativa del PDF
                const style = iframeDoc.createElement('style');
                style.textContent = `
                    .toolbar, .download, #download, .secondaryToolbarButton {
                        display: none !important;
                    }
                    .textLayer { 
                        user-select: none !important; 
                        -webkit-user-select: none !important;
                    }
                `;
                iframeDoc.head.appendChild(style);
            } catch (e) {
                // Cross-origin policy puede bloquear el acceso
                console.log('Nota: No se puede acceder al contenido del iframe por seguridad');
            }
            setIsLoading(false);
        };

        if (iframe) {
            iframe.addEventListener('load', loadIframe);
        }

        return () => {
            window.removeEventListener('keydown', blockActions);
            window.removeEventListener('contextmenu', blockActions);
            if (iframe) {
                iframe.removeEventListener('load', loadIframe);
            }
        };
    }, []);

    const zoomIn = () => setScale(prev => Math.min(prev + 0.25, 3.0));
    const zoomOut = () => setScale(prev => Math.max(prev - 0.25, 0.5));
    const resetView = () => {
        setScale(1.0);
        setRotation(0);
    };

    const handleOpenInNewTab = () => {
        // Abre la versión segura en una nueva pestaña
        window.open(secureUrl, '_blank', 'noopener,noreferrer');
    };

    // const handleDownload = () => {
    //     if (!allowDownload) return;
        
    //     // Usar la ruta de descarga segura (con marca de agua completa)
    //     const filename = documentUrl.split('/').pop();
    //     const downloadUrl = route('pdf.download', { path: filename });
    //     window.open(downloadUrl, '_blank');
    // };

    if (!documentUrl) {
        return (
            <div className="flex flex-col items-center justify-center p-8 h-[500px] border rounded-lg">
                <Eye className="h-12 w-12 text-muted-foreground mb-4" />
                <p className="text-sm text-muted-foreground">No hay documento para mostrar</p>
            </div>
        );
    }

    return (
        <div className="border rounded-lg overflow-hidden" ref={containerRef}>
            {/* Barra de controles */}
            <div className="flex items-center justify-between p-3 bg-gradient-to-r from-gray-50 to-gray-100 border-b">
                <div className="flex items-center space-x-2">
                    <Lock className="h-4 w-4 text-green-600" />
                    <span className="text-sm font-medium">Visor Seguro de Documentos</span>
                    {!allowDownload && (
                        <span className="text-xs px-2 py-1 bg-red-100 text-red-800 rounded-full">
                            Descarga bloqueada
                        </span>
                    )}
                </div>
                
                <div className="flex items-center space-x-2">
                    {/* Controles de zoom */}
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={zoomOut}
                        disabled={scale <= 0.5}
                        className="h-8 w-8 p-0"
                        title="Alejar"
                    >
                        <ZoomOut className="h-4 w-4" />
                    </Button>
                    
                    <span className="text-sm font-medium min-w-[60px] text-center">
                        {Math.round(scale * 100)}%
                    </span>
                    
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={zoomIn}
                        disabled={scale >= 3.0}
                        className="h-8 w-8 p-0"
                        title="Acercar"
                    >
                        <ZoomIn className="h-4 w-4" />
                    </Button>
                    
                    {/* Rotación */}
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setRotation(prev => (prev + 90) % 360)}
                        className="h-8 w-8 p-0"
                        title="Rotar"
                    >
                        <RotateCw className="h-4 w-4" />
                    </Button>
                    
                    {/* Vista completa */}
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={handleOpenInNewTab}
                        className="h-8 w-8 p-0"
                        title="Vista completa en nueva pestaña"
                    >
                        <Maximize2 className="h-4 w-4" />
                    </Button>
                    
                    {/* Botón de descarga (solo si está permitido) */}
                    {allowDownload && (
                        <Button
                            variant="default"
                            size="sm"
                            onClick={handleDownload}
                            className="h-8 px-3 text-xs"
                        >
                            Descargar (con marca de control)
                        </Button>
                    )}
                </div>
            </div>
            
            {/* Área del visor PDF */}
            <div className="relative bg-gray-900" style={{ height: '600px' }}>
                {isLoading && (
                    <div className="absolute inset-0 flex items-center justify-center z-10">
                        <div className="text-center">
                            <Skeleton className="h-[400px] w-[300px] mx-auto" />
                            <p className="text-sm text-gray-400 mt-4">Cargando documento seguro...</p>
                        </div>
                    </div>
                )}
                
                {/* Overlay de marca de agua (frente al iframe) */}
                <div className="absolute inset-0 pointer-events-none z-20 overflow-hidden">
                    <div className="watermark-grid">
                        {Array.from({ length: 15 }).map((_, i) => (
                            <div 
                                key={i}
                                className="watermark-item text-gray-700 opacity-10 text-xs font-bold"
                                style={{
                                    position: 'absolute',
                                    left: `${(i * 20) % 100}%`,
                                    top: `${(i * 15) % 100}%`,
                                    transform: 'rotate(-45deg)',
                                    whiteSpace: 'nowrap'
                                }}
                            >
                                VISTA PREVIA - NO DISTRIBUIR
                            </div>
                        ))}
                    </div>
                </div>
                
                {/* Iframe con el PDF seguro */}
                <iframe
                    ref={iframeRef}
                    src={secureUrl}
                    title="Visor Seguro de PDF"
                    className="w-full h-full"
                    style={{
                        border: 'none',
                        transform: `scale(${scale}) rotate(${rotation}deg)`,
                        transformOrigin: 'center center',
                    }}
                    sandbox="allow-scripts allow-same-origin"
                    // Importante: no permitir descargas desde el iframe
                    loading="lazy"
                />
                
                {/* Overlay para bloquear interacciones (si es necesario) */}
                {!allowDownload && (
                    <div 
                        className="absolute inset-0 z-30"
                        onContextMenu={(e) => e.preventDefault()}
                        title="Descarga bloqueada por política de seguridad"
                    />
                )}
            </div>
            
            {/* Pie informativo */}
            <div className="p-2 bg-gray-50 border-t text-xs text-gray-600">
                <div className="flex justify-between items-center">
                    <div className="flex items-center space-x-4">
                        <span className="flex items-center">
                            <Lock className="h-3 w-3 mr-1" />
                            Documento protegido
                        </span>
                        <span>•</span>
                        <span>Todas las páginas incluyen marca de agua de seguridad</span>
                    </div>
                    <div className="text-xs text-gray-500">
                        {allowDownload ? 'Descarga controlada disponible' : 'Solo visualización'}
                    </div>
                </div>
            </div>
        </div>
    );
}