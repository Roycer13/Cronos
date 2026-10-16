import { Button } from '@/components/ui/button';
import { RefreshCw } from 'lucide-react';
import { useState } from 'react';

interface AutoRefreshPanelProps {
  lastUpdated: Date;
  isRefreshing: boolean;
  autoRefreshInterval: number;
  onRefresh: () => void;
  onIntervalChange: (interval: number) => void;
}

export function AutoRefreshPanelCompact({
  lastUpdated,
  isRefreshing,
  autoRefreshInterval,
  onRefresh,
  onIntervalChange,
}: AutoRefreshPanelProps) {
  // Very compact layout: icon + small timestamp + tiny select.
  // Responsive: on very small screens the timestamp hides; dark mode classes applied.
  return (
    <div className="flex items-center justify-between gap-3 mb-2">
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

        <span className="hidden xs:inline-block text-xs text-muted-foreground dark:text-muted-foreground">{lastUpdated.toLocaleTimeString('es-ES')}</span>
      </div>

      <div className="flex items-center gap-2">
        <select
          value={autoRefreshInterval}
          onChange={(e) => onIntervalChange(Number(e.target.value))}
          className="text-xs px-2 py-1 border rounded bg-transparent text-foreground dark:text-slate-200"
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
      </div>
    </div>
  );
}
