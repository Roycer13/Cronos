// resources/js/components/PDFViewer.jsx
import { Viewer, Worker, SpecialZoomLevel } from '@react-pdf-viewer/core';
import { toolbarPlugin } from '@react-pdf-viewer/toolbar';

// Importar solo los estilos necesarios
import '@react-pdf-viewer/core/lib/styles/index.css';
import '@react-pdf-viewer/toolbar/lib/styles/index.css';

const PDFViewer = ({ fileUrl, height = '600px' }) => {
    // Plugin de toolbar configurado correctamente
    const toolbarPluginInstance = toolbarPlugin({
        fullScreenPlugin: {
            enableShortcuts: true,
        },
        zoomPlugin: {
            enableZoomSelection: true,
        },
    });

    // Extraer Toolbar de la instancia del plugin
    const { Toolbar } = toolbarPluginInstance;

    return (
        <div className="pdf-viewer" style={{ 
            height: height,
            border: '1px solid #e5e7eb',
            borderRadius: '0.375rem',
            overflow: 'hidden',
            backgroundColor: '#f9fafb',
            position: 'relative'
        }}>
            <Worker workerUrl="https://unpkg.com/pdfjs-dist@3.11.174/build/pdf.worker.min.js">
                <div style={{ 
                    display: 'flex', 
                    flexDirection: 'column', 
                    height: '100%' 
                }}>
                    {/* Barra de herramientas */}
                    <div style={{ 
                        backgroundColor: '#ffffff',
                        borderBottom: '1px solid #e5e7eb',
                        padding: '8px',
                        minHeight: '48px'
                    }}>
                        {Toolbar && (
                            <Toolbar>
                                {(toolbarSlot) => {
                                    // Verificar que toolbarSlot existe
                                    if (!toolbarSlot) return null;
                                    
                                    const {
                                        CurrentPageInput,
                                        GoToPreviousPage,
                                        GoToNextPage,
                                        NumberOfPages,
                                        ZoomIn,
                                        ZoomOut,
                                        Zoom,
                                        CurrentScale,
                                        EnterFullScreen,
                                        RotateBackward,
                                        RotateForward,
                                        SwitchTheme,
                                    } = toolbarSlot;
                                    
                                    return (
                                        <div style={{
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '8px',
                                            flexWrap: 'wrap'
                                        }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                                                {GoToPreviousPage && <GoToPreviousPage />}
                                                {CurrentPageInput && <CurrentPageInput />}
                                                {NumberOfPages && (
                                                    <span style={{ fontSize: '14px', color: '#6b7280' }}>
                                                        / <NumberOfPages />
                                                    </span>
                                                )}
                                                {GoToNextPage && <GoToNextPage />}
                                            </div>
                                            
                                            <div style={{ width: '1px', height: '24px', backgroundColor: '#e5e7eb' }}></div>
                                            
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                                                {ZoomOut && <ZoomOut />}
                                                {Zoom && <Zoom />}
                                                {ZoomIn && <ZoomIn />}
                                                {CurrentScale && <CurrentScale />}
                                            </div>
                                            
                                            <div style={{ width: '1px', height: '24px', backgroundColor: '#e5e7eb' }}></div>
                                            
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                                                {RotateBackward && <RotateBackward />}
                                                {RotateForward && <RotateForward />}
                                                {EnterFullScreen && <EnterFullScreen />}
                                                {SwitchTheme && <SwitchTheme />}
                                            </div>
                                        </div>
                                    );
                                }}
                            </Toolbar>
                        )}
                    </div>
                    
                    {/* Contenedor del visor */}
                    <div style={{ flex: 1, position: 'relative' }}>
                        <Viewer
                            fileUrl={fileUrl}
                            plugins={[toolbarPluginInstance]}
                            defaultScale={SpecialZoomLevel.PageFit}
                            theme="light"
                            renderError={(error) => (
                                <div style={{
                                    height: '100%',
                                    display: 'flex',
                                    flexDirection: 'column',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    padding: '20px',
                                    textAlign: 'center'
                                }}>
                                    <div style={{ 
                                        fontSize: '48px',
                                        marginBottom: '16px',
                                        color: '#ef4444'
                                    }}>
                                        ⚠️
                                    </div>
                                    <h3 style={{ 
                                        fontSize: '18px',
                                        fontWeight: '600',
                                        color: '#dc2626',
                                        marginBottom: '8px'
                                    }}>
                                        Error al cargar el PDF
                                    </h3>
                                    <p style={{ color: '#6b7280', marginBottom: '16px' }}>
                                        {error.message || 'No se pudo cargar el documento'}
                                    </p>
                                    <button
                                        onClick={() => window.location.reload()}
                                        style={{
                                            padding: '8px 16px',
                                            backgroundColor: '#3b82f6',
                                            color: 'white',
                                            border: 'none',
                                            borderRadius: '4px',
                                            cursor: 'pointer',
                                            fontSize: '14px'
                                        }}
                                    >
                                        Reintentar
                                    </button>
                                </div>
                            )}
                            renderLoader={(percentages) => (
                                <div style={{
                                    height: '100%',
                                    display: 'flex',
                                    flexDirection: 'column',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    padding: '20px'
                                }}>
                                    <div style={{
                                        width: '60px',
                                        height: '60px',
                                        border: '4px solid #e5e7eb',
                                        borderTop: '4px solid #3b82f6',
                                        borderRadius: '50%',
                                        animation: 'spin 1s linear infinite',
                                        marginBottom: '16px'
                                    }}></div>
                                    
                                    <div style={{
                                        width: '200px',
                                        backgroundColor: '#e5e7eb',
                                        borderRadius: '4px',
                                        height: '8px',
                                        marginBottom: '8px',
                                        overflow: 'hidden'
                                    }}>
                                        <div style={{
                                            width: `${percentages}%`,
                                            height: '100%',
                                            backgroundColor: '#3b82f6',
                                            transition: 'width 0.3s ease'
                                        }}></div>
                                    </div>
                                    
                                    <p style={{
                                        color: '#6b7280',
                                        fontSize: '14px',
                                        marginTop: '8px'
                                    }}>
                                        Cargando documento... {percentages}%
                                    </p>
                                </div>
                            )}
                        />
                    </div>
                </div>
            </Worker>
            
            {/* Estilos CSS inline */}
            <style>
                {`
                @keyframes spin {
                    0% { transform: rotate(0deg); }
                    100% { transform: rotate(360deg); }
                }
                `}
            </style>
        </div>
    );
};

export default PDFViewer;