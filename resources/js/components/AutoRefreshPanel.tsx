import { Button } from '@/components/ui/button';
import { RefreshCw } from 'lucide-react';
import { useState } from 'react';

interface AutoRefreshPanelProps {
    lastUpdated: Date;
    isRefreshing: boolean;
    autoRefreshInterval: number;
    onRefresh: () => void;
    onIntervalChange: (interval: number) => void;
    compact?: boolean;
}

export function AutoRefreshPanel({
    lastUpdated,
    isRefreshing,
    autoRefreshInterval,
    onRefresh,
    onIntervalChange,
    compact = true,
}: AutoRefreshPanelProps) {
    const [expanded, setExpanded] = useState(false);

    if (compact) {
        return (
            <div className="relative flex items-center gap-3 justify-between mb-2">
                <div className="flex items-center gap-2">
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={onRefresh}
                        disabled={isRefreshing}
                        title="Refrescar datos"
                        className="h-8 w-8 p-0"
                    >
                        <RefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
                    </Button>

                    <div className="flex flex-col leading-tight">
                        <span className="text-sm font-medium">Auto</span>
                        <span className="text-xs text-muted-foreground">{lastUpdated.toLocaleTimeString('es-ES')}</span>
                    </div>
                </div>

                <div className="flex items-center gap-2">
                    <select
                        value={autoRefreshInterval}
                        onChange={(e) => onIntervalChange(Number(e.target.value))}
                        className="text-xs px-2 py-1 border rounded bg-transparent"
                        title="Intervalo de auto-actualización"
                    >
                        <option value={0}>Off</option>
                        <option value={10}>10s</option>
                        <option value={20}>20s</option>
                        <option value={30}>30s</option>
                        <option value={60}>1m</option>
                        <option value={120}>2m</option>
                        <option value={300}>5m</option>
                    </select>

                    <button
                        onClick={() => setExpanded(!expanded)}
                        className="text-xs text-muted-foreground hover:text-foreground"
                        title="Más opciones"
                    >
                        {expanded ? 'Ocultar' : 'Opciones'}
                    </button>
                </div>

                {expanded && (
                    <div className="absolute mt-10 right-4 z-50 bg-background border rounded p-2 text-xs shadow">
                        Próxima actualización en {autoRefreshInterval > 0 ? `${autoRefreshInterval}s` : 'desactivada'}
                    </div>
                )}
            </div>
        );
    }

    return (
        <div className="space-y-3">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <RefreshCw className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                    <span className="text-sm font-medium text-blue-900 dark:text-blue-200">Auto-actualización</span>
                </div>
                <div className="flex items-center gap-2">
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={onRefresh}
                        disabled={isRefreshing}
                        title="Refrescar datos"
                    >
                        <RefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
                    </Button>
                    <select
                        value={autoRefreshInterval}
                        onChange={(e) => onIntervalChange(Number(e.target.value))}
                        className="px-2 py-1 text-sm border rounded bg-white"
                    >
                        <option value={0}>Desactivada</option>
                        <option value={10}>Cada 10 segundos</option>
                        <option value={20}>Cada 20 segundos</option>
                        <option value={30}>Cada 30 segundos</option>
                        <option value={60}>Cada 1 minuto</option>
                        <option value={120}>Cada 2 minutos</option>
                        <option value={300}>Cada 5 minutos</option>
                    </select>
                </div>
            </div>
        </div>
    );
}
                            import { Button } from '@/components/ui/button';
                            import { RefreshCw } from 'lucide-react';
                            import { useState } from 'react';

                            interface AutoRefreshPanelProps {
                                lastUpdated: Date;
                                isRefreshing: boolean;
                                autoRefreshInterval: number;
                                onRefresh: () => void;
                                onIntervalChange: (interval: number) => void;
                                compact?: boolean;
                            }

                            export function AutoRefreshPanel({
                                lastUpdated,
                                isRefreshing,
                                autoRefreshInterval,
                                onRefresh,
                                onIntervalChange,
                                compact = true,
                            }: AutoRefreshPanelProps) {
                                const [expanded, setExpanded] = useState(false);

                                if (compact) {
                                    return (
                                        <div className="flex items-center gap-3 justify-between mb-2">
                                            <div className="flex items-center gap-2">
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={onRefresh}
                                                    disabled={isRefreshing}
                                                    title="Refrescar datos"
                                                    className="h-8 w-8 p-0"
                                                >
                                                    <RefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
                                                </Button>

                                                <div className="flex flex-col leading-tight">
                                                    <span className="text-sm font-medium">Auto</span>
                                                    <span className="text-xs text-muted-foreground">{lastUpdated.toLocaleTimeString('es-ES')}</span>
                                                </div>
                                            </div>

                                            <div className="flex items-center gap-2">
                                                <select
                                                    value={autoRefreshInterval}
                                                    onChange={(e) => onIntervalChange(Number(e.target.value))}
                                                    className="text-xs px-2 py-1 border rounded bg-transparent"
                                                    title="Intervalo de auto-actualización"
                                                >
                                                    <option value={0}>Off</option>
                                                    <option value={10}>10s</option>
                                                    <option value={20}>20s</option>
                                                    <option value={30}>30s</option>
                                                    <option value={60}>1m</option>
                                                    <option value={120}>2m</option>
                                                    <option value={300}>5m</option>
                                                </select>

                                                <button
                                                    onClick={() => setExpanded(!expanded)}
                                                    className="text-xs text-muted-foreground hover:text-foreground"
                                                    title="Más opciones"
                                                >
                                                    {expanded ? 'Ocultar' : 'Opciones'}
                                                </button>
                                            </div>

                                            {expanded && (
                                                <div className="absolute mt-10 right-4 z-50 bg-background border rounded p-2 text-xs shadow">
                                                    Próxima actualización en {autoRefreshInterval > 0 ? `${autoRefreshInterval}s` : 'desactivada'}
                                                </div>
                                            )}
                                        </div>
                                    );
                                }

                                return (
                                    <div className="space-y-3">
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-2">
                                                <RefreshCw className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                                                <span className="text-sm font-medium text-blue-900 dark:text-blue-200">Auto-actualización</span>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    onClick={onRefresh}
                                                    disabled={isRefreshing}
                                                    title="Refrescar datos"
                                                >
                                                    <RefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
                                                </Button>
                                                <select
                                                    value={autoRefreshInterval}
                                                    onChange={(e) => onIntervalChange(Number(e.target.value))}
                                                    className="px-2 py-1 text-sm border rounded bg-white"
                                                >
                                                    <option value={0}>Desactivada</option>
                                                    <option value={10}>Cada 10 segundos</option>
                                                    <option value={20}>Cada 20 segundos</option>
                                                    <option value={30}>Cada 30 segundos</option>
                                                    <option value={60}>Cada 1 minuto</option>
                                                    <option value={120}>Cada 2 minutos</option>
                                                    <option value={300}>Cada 5 minutos</option>
                                                </select>
                                            </div>
                                        </div>
                                    </div>
                                );
                            }
