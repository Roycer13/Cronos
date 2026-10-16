import { useState, useEffect, useCallback } from 'react';
import { router } from '@inertiajs/react';

interface UseAutoRefreshOptions {
    initialInterval?: number;
    only?: string[];
    onRefresh?: () => void;
    onError?: (error: Error) => void;
}

export function useAutoRefresh(options: UseAutoRefreshOptions = {}) {
    const { initialInterval = 30, only = ['analisis'], onRefresh, onError } = options;
    
    const [lastUpdated, setLastUpdated] = useState<Date>(new Date());
    const [isRefreshing, setIsRefreshing] = useState(false);
    const [autoRefreshInterval, setAutoRefreshInterval] = useState(initialInterval);

    const refreshData = useCallback(async () => {
        setIsRefreshing(true);
        try {
            router.reload({ only });
            setLastUpdated(new Date());
            onRefresh?.();
        } catch (error) {
            const err = error instanceof Error ? error : new Error('Error desconocido');
            console.error('Error al refrescar los datos:', err);
            onError?.(err);
        } finally {
            setIsRefreshing(false);
        }
    }, [onRefresh, onError]);

    useEffect(() => {
        if (autoRefreshInterval <= 0) return;

        const interval = setInterval(() => {
            refreshData();
        }, autoRefreshInterval * 1000);

        return () => clearInterval(interval);
    }, [autoRefreshInterval, refreshData]);

    return {
        lastUpdated,
        isRefreshing,
        autoRefreshInterval,
        setAutoRefreshInterval,
        refreshData,
    };
}
